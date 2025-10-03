import { useState, useEffect } from 'react';
import { Note, notesDB } from '../database';
import { Note as ApiNote } from '../../types/api';
import { apiClient } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { webSocketService, NoteSync } from '../../services/websocket';

// Convert API note to local note format
const apiNoteToLocal = (apiNote: ApiNote): Note => ({
  id: apiNote.id,
  title: apiNote.title,
  content: apiNote.content,
  storage_type: apiNote.storage_type,
  createdAt: new Date(apiNote.created_at),
  updatedAt: new Date(apiNote.updated_at),
});

// Convert local note to API format
const localNoteToApi = (note: Note): Partial<ApiNote> => ({
  id: note.id,
  title: note.title,
  content: note.content,
  storage_type: note.storage_type || 'local',
});

export function useNotes() {
  const { isAuthenticated, user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const loadNotes = async () => {
    try {
      setLoading(true);
      
      // Always load local notes
      const localNotes = await notesDB.getAllNotes();
      
      // If authenticated, also load cloud notes
      if (isAuthenticated) {
        try {
          const { notes: cloudNotes } = await apiClient.getNotes();
          const convertedCloudNotes = cloudNotes.map(apiNoteToLocal);
          
          // Combine and deduplicate notes
          const allNotes = [...localNotes, ...convertedCloudNotes];
          const uniqueNotes = allNotes.reduce((acc, note) => {
            const existing = acc.find(n => n.id === note.id);
            if (!existing) {
              acc.push(note);
            } else if (note.updatedAt > existing.updatedAt) {
              // Keep the more recently updated version
              acc[acc.indexOf(existing)] = note;
            }
            return acc;
          }, [] as Note[]);
          
          // Sort by updatedAt descending
          uniqueNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
          setNotes(uniqueNotes);
        } catch (error) {
          console.error('Failed to load cloud notes:', error);
          setNotes(localNotes);
        }
      } else {
        setNotes(localNotes);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string = '', storageType: 'local' | 'cloud' = 'local') => {
    try {
      if (storageType === 'cloud' && isAuthenticated) {
        // Create in cloud
        const { note: apiNote } = await apiClient.createNote({
          title,
          content,
          storage_type: 'cloud'
        });
        const note = apiNoteToLocal(apiNote);
        await loadNotes(); // Refresh the list
        return note;
      } else {
        // Create locally
        const note = await notesDB.saveNote({ 
          title, 
          content,
          storage_type: 'local'
        });
        await loadNotes(); // Refresh the list
        return note;
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      const existingNote = notes.find(n => n.id === id);
      if (!existingNote) {
        throw new Error('Note not found');
      }

      if (existingNote.storage_type === 'cloud' && isAuthenticated) {
        // Update in cloud (or queue for sync if offline)
        try {
          const { note: apiNote } = await apiClient.updateNote(id, { title, content });
          const note = apiNoteToLocal(apiNote);
          await loadNotes(); // Refresh the list
          return note;
        } catch (error) {
          // If offline, save locally and mark for sync
          console.log('Offline: saving cloud note locally for sync');
          const note = await notesDB.saveNote({ 
            id, 
            title, 
            content, 
            storage_type: existingNote.storage_type 
          });
          await loadNotes(); // Refresh the list
          return note;
        }
      } else {
        // Update locally
        const note = await notesDB.saveNote({ id, title, content, storage_type: 'local' });
        await loadNotes(); // Refresh the list
        return note;
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const existingNote = notes.find(n => n.id === id);
      if (!existingNote) {
        throw new Error('Note not found');
      }

      if (existingNote.storage_type === 'cloud' && isAuthenticated) {
        // Delete from cloud
        await apiClient.deleteNote(id);
      } else {
        // Delete locally
        await notesDB.deleteNote(id);
      }
      
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const getNote = async (id: string) => {
    try {
      // Try to find in memory first for storage type hint
      const existingNote = notes.find(n => n.id === id);
      
      // If we know it's a cloud note, fetch from cloud
      if (existingNote?.storage_type === 'cloud' && isAuthenticated) {
        try {
          const { note: apiNote } = await apiClient.getNote(id);
          return apiNoteToLocal(apiNote);
        } catch (error) {
          console.error('Failed to fetch cloud note:', error);
          // Fall through to try local storage
        }
      }
      
      // Try local storage
      const localNote = await notesDB.getNoteById(id);
      if (localNote) {
        return localNote;
      }
      
      // If not in local and we're authenticated, try cloud as last resort
      if (isAuthenticated && !existingNote) {
        try {
          const { note: apiNote } = await apiClient.getNote(id);
          return apiNoteToLocal(apiNote);
        } catch (error) {
          console.error('Note not found in cloud:', error);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get note:', error);
      return null;
    }
  };

  const changeNoteStorage = async (id: string, newStorageType: 'local' | 'cloud') => {
    try {
      const existingNote = notes.find(n => n.id === id);
      if (!existingNote) {
        throw new Error('Note not found');
      }

      if (newStorageType === 'cloud' && !isAuthenticated) {
        throw new Error('Authentication required for cloud storage');
      }

      if (newStorageType === 'cloud' && !user?.email_verified) {
        throw new Error('Email verification required for cloud storage');
      }

      if (existingNote.storage_type === newStorageType) {
        return existingNote; // No change needed
      }

      if (newStorageType === 'cloud') {
        // Moving from local to cloud
        if (isAuthenticated) {
          const { note: apiNote } = await apiClient.createNote({
            title: existingNote.title,
            content: existingNote.content,
            storage_type: 'cloud'
          });
          
          // Delete from local storage
          await notesDB.deleteNote(id);
          
          await loadNotes();
          return apiNoteToLocal(apiNote);
        }
      } else {
        // Moving from cloud to local
        if (existingNote.storage_type === 'cloud') {
          // Save to local storage
          const localNote = await notesDB.saveNote({
            title: existingNote.title,
            content: existingNote.content,
            storage_type: 'local'
          });
          
          // Delete from cloud if authenticated
          if (isAuthenticated) {
            await apiClient.deleteNote(id);
          }
          
          await loadNotes();
          return localNote;
        }
      }

      throw new Error('Invalid storage type change');
    } catch (error) {
      console.error('Failed to change note storage:', error);
      throw error;
    }
  };

  const bulkMoveToCloud = async () => {
    if (!isAuthenticated || !user?.email_verified) {
      throw new Error('Authentication and email verification required');
    }

    try {
      setSyncing(true);
      
      // Get all local notes
      const localNotes = notes.filter(note => note.storage_type === 'local');
      const results = [];
      
      for (const note of localNotes) {
        try {
          const { note: apiNote } = await apiClient.createNote({
            title: note.title,
            content: note.content,
            storage_type: 'cloud'
          });
          
          // Delete from local storage
          await notesDB.deleteNote(note.id);
          
          results.push({ 
            id: note.id, 
            success: true, 
            note: apiNoteToLocal(apiNote)
          });
        } catch (error) {
          results.push({ 
            id: note.id, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      await loadNotes();
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return {
        message: `Moved ${successCount} notes to cloud storage`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failureCount
        }
      };
    } catch (error) {
      console.error('Failed to bulk move to cloud:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const syncNotes = async () => {
    if (!isAuthenticated) return;
    
    try {
      setSyncing(true);
      
      // Get local cloud notes that might have been updated offline
      const localNotes = await notesDB.getAllNotes();
      const localCloudNotes = localNotes.filter(n => n.storage_type === 'cloud');
      
      // Push local changes to cloud
      for (const localNote of localCloudNotes) {
        try {
          // Try to update in cloud
          await apiClient.updateNote(localNote.id, {
            title: localNote.title,
            content: localNote.content
          });
        } catch (error) {
          console.log(`Note ${localNote.id} might not exist in cloud or sync failed`);
        }
      }
      
      // Pull latest from cloud
      await loadNotes();
    } catch (error) {
      console.error('Failed to sync notes:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync on authentication changes
  useEffect(() => {
    loadNotes();
  }, [isAuthenticated, user?.email_verified]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated) {
        console.log('Back online, syncing notes...');
        syncNotes();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated]);

  // Periodic sync (every 5 minutes when online and authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (navigator.onLine) {
        console.log('Periodic sync...');
        syncNotes();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // WebSocket connection management
  useEffect(() => {
    if (isAuthenticated) {
      // Get the current auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('Connecting to WebSocket...');
        webSocketService.connect(token);
      }
    } else {
      console.log('Disconnecting from WebSocket...');
      webSocketService.disconnect();
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [isAuthenticated]);

  // WebSocket event handlers
  useEffect(() => {
    const handleConnected = () => {
      console.log('WebSocket connected');
      setIsWebSocketConnected(true);
    };

    const handleDisconnected = () => {
      console.log('WebSocket disconnected');
      setIsWebSocketConnected(false);
    };

    const handleAuthenticated = (data: { userId: string }) => {
      console.log('WebSocket authenticated for user:', data.userId);
    };

    const handleAuthError = (error: { message: string }) => {
      console.error('WebSocket authentication failed:', error.message);
      setIsWebSocketConnected(false);
      // If token is invalid, log the user out
      if (error.message.includes('invalid') || error.message.includes('expired')) {
        console.log('Token is invalid, logging out user');
        logout();
      }
    };

    const handleNoteSync = async (syncData: NoteSync) => {
      console.log('Received note sync:', syncData);
      
      try {
        switch (syncData.type) {
          case 'create':
            if (syncData.note) {
              const localNote = apiNoteToLocal(syncData.note);
              setNotes(prevNotes => {
                // Check if note already exists
                const exists = prevNotes.find(n => n.id === localNote.id);
                if (exists) return prevNotes;
                
                // Add new note and sort by updatedAt
                const newNotes = [localNote, ...prevNotes];
                return newNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
              });
            }
            break;

          case 'update':
            if (syncData.note) {
              const updatedNote = apiNoteToLocal(syncData.note);
              setNotes(prevNotes => {
                return prevNotes.map(note => 
                  note.id === updatedNote.id ? updatedNote : note
                ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
              });
            }
            break;

          case 'delete':
            if (syncData.noteId) {
              setNotes(prevNotes => 
                prevNotes.filter(note => note.id !== syncData.noteId)
              );
            }
            break;

          case 'storage-changed':
            if (syncData.note && syncData.oldNoteId) {
              const newNote = apiNoteToLocal(syncData.note);
              setNotes(prevNotes => {
                // Remove old note and add new one
                const filtered = prevNotes.filter(note => note.id !== syncData.oldNoteId);
                return [newNote, ...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error handling note sync:', error);
      }
    };

    const handleSyncRequested = () => {
      console.log('Server requested sync');
      syncNotes();
    };

    // Register event listeners
    webSocketService.on('connected', handleConnected);
    webSocketService.on('disconnected', handleDisconnected);
    webSocketService.on('authenticated', handleAuthenticated);
    webSocketService.on('auth-error', handleAuthError);
    webSocketService.on('note-sync', handleNoteSync);
    webSocketService.on('sync-requested', handleSyncRequested);

    // Cleanup
    return () => {
      webSocketService.off('connected', handleConnected);
      webSocketService.off('disconnected', handleDisconnected);
      webSocketService.off('authenticated', handleAuthenticated);
      webSocketService.off('auth-error', handleAuthError);
      webSocketService.off('note-sync', handleNoteSync);
      webSocketService.off('sync-requested', handleSyncRequested);
    };
  }, []);

  return {
    notes,
    loading,
    syncing,
    isWebSocketConnected,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    changeNoteStorage,
    bulkMoveToCloud,
    syncNotes,
    refresh: loadNotes,
    requestSync: () => webSocketService.requestSync()
  };
}