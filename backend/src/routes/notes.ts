import { Router, Response } from 'express';
import { NoteModel } from '../models/Note';
import { authenticateToken, AuthRequest, requireEmailVerification } from '../middleware/auth';
import { validateCreateNote, validateUpdateNote } from '../middleware/validation';
import { webSocketService } from '../services/websocket';

const router = Router();

// Apply authentication to all note routes
router.use(authenticateToken);

// Get all notes for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { storage_type, since } = req.query;

    let notes;
    if (storage_type === 'cloud') {
      notes = await NoteModel.getCloudNotes(userId);
    } else if (storage_type === 'local') {
      notes = await NoteModel.getLocalNotes(userId);
    } else if (since) {
      const sinceDate = new Date(since as string);
      notes = await NoteModel.getUpdatedSince(userId, sinceDate);
    } else {
      notes = await NoteModel.findByUserId(userId);
    }

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific note
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;

    const note = await NoteModel.findById(noteId, userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new note
router.post('/', validateCreateNote, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, content = '', storage_type = 'cloud' } = req.body;

    // For cloud storage, require email verification
    if (storage_type === 'cloud' && !req.user!.email_verified) {
      return res.status(403).json({ error: 'Email verification required for cloud storage' });
    }

    const note = await NoteModel.create({
      user_id: userId,
      title,
      content,
      storage_type
    });

    // Emit WebSocket event for real-time sync (only for cloud notes)
    if (storage_type === 'cloud' && webSocketService) {
      webSocketService.noteCreated(userId, note);
    }

    res.status(201).json({ note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update note
router.put('/:id', validateUpdateNote, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;
    const updates = req.body;

    // For cloud storage, require email verification
    if (updates.storage_type === 'cloud' && !req.user!.email_verified) {
      return res.status(403).json({ error: 'Email verification required for cloud storage' });
    }

    const note = await NoteModel.update(noteId, userId, updates);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Emit WebSocket event for real-time sync (only for cloud notes)
    if (note.storage_type === 'cloud' && webSocketService) {
      webSocketService.noteUpdated(userId, note);
    }

    res.json({ note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note (soft delete)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;

    // Get note before deletion to check storage type
    const note = await NoteModel.findById(noteId, userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const success = await NoteModel.softDelete(noteId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Emit WebSocket event for real-time sync (only for cloud notes)
    if (note.storage_type === 'cloud' && webSocketService) {
      webSocketService.noteDeleted(userId, noteId);
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Restore deleted note
router.post('/:id/restore', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;

    const success = await NoteModel.restore(noteId, userId);
    if (!success) {
      return res.status(404).json({ error: 'Deleted note not found' });
    }

    // Get the restored note to emit WebSocket event
    const restoredNote = await NoteModel.findById(noteId, userId);
    if (restoredNote && restoredNote.storage_type === 'cloud' && webSocketService) {
      webSocketService.noteCreated(userId, restoredNote);
    }

    res.json({ message: 'Note restored successfully' });
  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change storage type
router.post('/:id/storage', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = req.params.id;
    const { storage_type } = req.body;

    if (!['local', 'cloud'].includes(storage_type)) {
      return res.status(400).json({ error: 'Invalid storage type' });
    }

    // For cloud storage, require email verification
    if (storage_type === 'cloud' && !req.user!.email_verified) {
      return res.status(403).json({ error: 'Email verification required for cloud storage' });
    }

    const note = await NoteModel.changeStorageType(noteId, userId, storage_type);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Emit WebSocket event for real-time sync (only for cloud notes)
    if (note.storage_type === 'cloud' && webSocketService) {
      webSocketService.noteStorageChanged(userId, note, noteId);
    }

    res.json({ note });
  } catch (error) {
    console.error('Change storage type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk operations for moving local notes to cloud
router.post('/bulk/move-to-cloud', requireEmailVerification, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get all local notes
    const localNotes = await NoteModel.getLocalNotes(userId);
    
    const results = [];
    for (const note of localNotes) {
      try {
        const updatedNote = await NoteModel.changeStorageType(note.id, userId, 'cloud');
        results.push({ id: note.id, success: true, note: updatedNote });
        
        // Emit WebSocket event for each successfully moved note
        if (updatedNote && webSocketService) {
          webSocketService.noteStorageChanged(userId, updatedNote, note.id);
        }
      } catch (error) {
        results.push({ id: note.id, success: false, error: 'Failed to move note' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      message: `Moved ${successCount} notes to cloud storage`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Bulk move to cloud error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;