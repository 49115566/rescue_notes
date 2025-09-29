import React, { useState, useEffect, useRef } from 'react';
import { Eye, HelpCircle, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { useNotes } from '../hooks/useNotes';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface NoteEditorPageProps {
  noteId?: string;
}

export function NoteEditorPage({ noteId }: NoteEditorPageProps) {
  const { navigate } = useRouter();
  const { getNote, updateNote, createNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!!noteId);
  const [saving, setSaving] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    if (!noteId) return;
    
    try {
      setLoading(true);
      const note = await getNote(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    } catch (error) {
      console.error('Failed to load note:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!title.trim()) return;
    
    try {
      setSaving(true);
      if (noteId) {
        await updateNote(noteId, title, content);
      } else {
        const newNote = await createNote(title, content);
        // Update URL without triggering a re-render
        navigate({ type: 'note-editor', noteId: newNote.id });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content]);

  const handleViewNote = () => {
    if (noteId) {
      // Replace so back doesn't bounce between edit/view
      navigate({ type: 'note-view', noteId }, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Edit Note"
        showBack={true}
        onBack={() => navigate({ type: 'home' }, { replace: true })}
        showHelp={true}
        actions={
          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-muted-foreground">Saving...</span>}
            {noteId && (
              <Button variant="outline" size="sm" onClick={handleViewNote}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            )}
          </div>
        }
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Title Input */}
        <div className="p-4 border-b border-border">
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Content Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium">Content</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Markdown Help
              </Button>
            </div>
            
            <div className="flex-1 p-4">
              <Textarea
                placeholder="Start writing your note... You can use Markdown formatting!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full resize-none border-0 p-0 text-base leading-relaxed focus:ring-0"
              />
            </div>
          </div>

          {/* Markdown Help Sidebar */}
          {showMarkdownHelp && (
            <div className="w-80 border-l border-border overflow-auto">
              <div className="p-4">
                <h3 className="font-medium mb-4">Markdown Guide</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Headers</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      # Header 1<br/>
                      ## Header 2<br/>
                      ### Header 3
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Text Formatting</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      **Bold text**<br/>
                      *Italic text*<br/>
                      `Inline code`
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Code Blocks</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      ```<br/>
                      Code block<br/>
                      ```
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Links</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      [Link text](https://example.com)
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Lists</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      - Item 1<br/>
                      - Item 2<br/>
                      <br/>
                      1. Numbered item<br/>
                      2. Another item
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}