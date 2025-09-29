import React, { useState, useEffect } from 'react';
import { Edit, Download, Share } from 'lucide-react';
import { Button } from '../ui/button';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { useNotes } from '../hooks/useNotes';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { toast } from 'sonner@2.0.3';

interface NoteViewPageProps {
  noteId: string;
}

export function NoteViewPage({ noteId }: NoteViewPageProps) {
  const { navigate } = useRouter();
  const { getNote } = useNotes();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [noteId]);

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
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
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