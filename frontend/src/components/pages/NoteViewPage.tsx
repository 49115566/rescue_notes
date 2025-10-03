import React, { useState, useEffect } from 'react';
import { Edit, Download, Share, Cloud, HardDrive, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { useNotes } from '../hooks/useNotesV2';
import { useAuth } from '../../contexts/AuthContext';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface NoteViewPageProps {
  noteId: string;
}

export function NoteViewPage({ noteId }: NoteViewPageProps) {
  const { navigate } = useRouter();
  const { notes, getNote, changeNoteStorage } = useNotes();
  const { isAuthenticated, user } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [noteId]);

  // Update local note state when notes array changes (for real-time updates)
  useEffect(() => {
    const updatedNote = notes.find(n => n.id === noteId);
    if (updatedNote) {
      setNote(updatedNote);
    }
  }, [notes, noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const loadedNote = await getNote(noteId);
      setNote(loadedNote);
    } catch (error) {
      console.error('Failed to load note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Replace so back doesn't bounce between view/edit
    navigate({ type: 'note-editor', noteId }, { replace: true });
  };
  
  const handleChangeStorage = async (newStorageType: 'local' | 'cloud') => {
    try {
      const updatedNote = await changeNoteStorage(noteId, newStorageType);
      setNote(updatedNote);
      toast.success(`Note moved to ${newStorageType} storage`);
    } catch (error: any) {
      console.error('Failed to change storage:', error);
      toast.error(error.message || 'Failed to change storage type');
    }
  };

  const handleExport = () => {
    if (!note) return;
    
    const content = `# ${note.title}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast('Note exported successfully');
  };

  const handleShare = async () => {
    if (!note) return;
    
    const shareText = `${note.title}\n\n${note.content}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: shareText
        });
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Note copied to clipboard');
    } catch (error) {
      toast('Failed to copy note');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Note not found</p>
          <Button onClick={() => navigate({ type: 'home' })}>
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="View Note"
        showBack={true}
        onBack={() => navigate({ type: 'home' }, { replace: true })}
        showHelp={true}
        actions={
          <div className="flex items-center gap-2">
            {note && (
              <>
                <Badge variant={(note.storage_type || 'local') === 'cloud' ? 'default' : 'outline'} className="flex items-center gap-1">
                  {(note.storage_type || 'local') === 'cloud' ? (
                    <><Cloud className="w-3 h-3" /> Cloud</>
                  ) : (
                    <><HardDrive className="w-3 h-3" /> Local</>
                  )}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShare}>
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(note.storage_type || 'local') === 'local' && isAuthenticated && user?.email_verified && (
                      <DropdownMenuItem onClick={() => handleChangeStorage('cloud')}>
                        <Cloud className="w-4 h-4 mr-2" />
                        Move to Cloud
                      </DropdownMenuItem>
                    )}
                    {note.storage_type === 'cloud' && (
                      <DropdownMenuItem onClick={() => handleChangeStorage('local')}>
                        <HardDrive className="w-4 h-4 mr-2" />
                        Move to Local
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <Button size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 overflow-auto">
        <article className="max-w-4xl mx-auto p-6">
          {/* Note Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created: {formatDate(note.createdAt)}</span>
              {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                <span>Updated: {formatDate(note.updatedAt)}</span>
              )}
            </div>
          </header>

          {/* Note Content */}
          <div className="prose prose-sm max-w-none">
            {note.content ? (
              <MarkdownRenderer content={note.content} />
            ) : (
              <p className="text-muted-foreground italic">This note is empty.</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}