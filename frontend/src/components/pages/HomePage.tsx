import React, { useState } from 'react';
import { Search, Plus, MoreVertical, FileText, Cloud, HardDrive, ArrowUpFromLine, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { useNotes } from '../hooks/useNotesV2';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function HomePage() {
  const { navigate } = useRouter();
  const { notes, loading, createNote, deleteNote, changeNoteStorage, isWebSocketConnected, requestSync } = useNotes();
  const { isAuthenticated, user } = useAuth();
  const { defaultStorageType } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    try {
      // Use the default storage type from settings
      let storage = defaultStorageType;
      
      // If default is cloud but user can't use it, fall back to local
      if (storage === 'cloud' && (!isAuthenticated || !user?.email_verified)) {
        storage = 'local';
        toast.info('Creating note locally. Sign in for cloud storage.');
      }
      
      const note = await createNote('New Note', '', storage);
      navigate({ type: 'note-editor', noteId: note.id });
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setDeleteNoteId(null);
      toast.success('Note deleted');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };
  
  const handleChangeStorage = async (noteId: string, newStorageType: 'local' | 'cloud') => {
    try {
      await changeNoteStorage(noteId, newStorageType);
      toast.success(`Note moved to ${newStorageType} storage`);
    } catch (error: any) {
      console.error('Failed to change storage:', error);
      toast.error(error.message || 'Failed to change storage type');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPreview = (content: string) => {
    // Remove markdown formatting for preview
    let preview = content
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
    
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="RESCUE NOTES" 
        showSettings={true}
        showHelp={true}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Search and Create */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sync Status Indicator */}
            {isAuthenticated && user?.email_verified && (
              <div className="flex items-center gap-1">
                {isWebSocketConnected ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs font-medium">Live</span>
                  </div>
                ) : (
                  <button
                    onClick={requestSync}
                    className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                    title="Reconnect real-time sync"
                  >
                    <WifiOff className="w-4 h-4" />
                    <span className="text-xs font-medium">Offline</span>
                  </button>
                )}
              </div>
            )}
            
            <Button onClick={handleCreateNote}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </p>
              {!searchTerm && (
                <Button variant="outline" onClick={handleCreateNote}>
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredNotes.map(note => {
                const currentStorageType = note.storage_type || 'local';
                const canMoveToCloud = isAuthenticated && user?.email_verified && currentStorageType === 'local';
                const canMoveToLocal = currentStorageType === 'cloud';
                
                return (
                  <Card key={note.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => navigate({ type: 'note-view', noteId: note.id })}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <Badge variant={currentStorageType === 'cloud' ? 'default' : 'outline'} className="flex items-center gap-1 shrink-0">
                              {currentStorageType === 'cloud' ? (
                                <><Cloud className="w-3 h-3" /> Cloud</>
                              ) : (
                                <><HardDrive className="w-3 h-3" /> Local</>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {getPreview(note.content) || 'No content'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(note.updatedAt)}
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => navigate({ type: 'note-view', noteId: note.id })}
                            >
                              View Note
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => navigate({ type: 'note-editor', noteId: note.id })}
                            >
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canMoveToCloud && (
                              <DropdownMenuItem 
                                onClick={() => handleChangeStorage(note.id, 'cloud')}
                              >
                                <Cloud className="w-4 h-4 mr-2" />
                                Move to Cloud
                              </DropdownMenuItem>
                            )}
                            {canMoveToLocal && (
                              <DropdownMenuItem 
                                onClick={() => handleChangeStorage(note.id, 'local')}
                              >
                                <HardDrive className="w-4 h-4 mr-2" />
                                Move to Local
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteNoteId(note.id)}
                              className="text-destructive"
                            >
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteNoteId && handleDeleteNote(deleteNoteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}