import React, { useState } from 'react';
import { Search, Plus, MoreVertical, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { useNotes } from '../hooks/useNotes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

export function HomePage() {
  const { navigate } = useRouter();
  const { notes, loading, createNote, deleteNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    try {
      const note = await createNote('New Note');
      navigate({ type: 'note-editor', noteId: note.id });
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setDeleteNoteId(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
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
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
              {filteredNotes.map(note => (
                <Card key={note.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => navigate({ type: 'note-view', noteId: note.id })}
                      >
                        <h3 className="font-medium truncate mb-1">{note.title}</h3>
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
              ))}
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