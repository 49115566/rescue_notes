import React, { useState, useEffect, useRef } from 'react';
import { Eye, HelpCircle, Save, Cloud, HardDrive, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { useNotes } from '../hooks/useNotesV2';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface NoteEditorPageProps {
  noteId?: string;
}

export function NoteEditorPage({ noteId }: NoteEditorPageProps) {
  const { navigate } = useRouter();
  const { notes, getNote, updateNote, createNote, changeNoteStorage } = useNotes();
  const { isAuthenticated, user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [storageType, setStorageType] = useState<'local' | 'cloud'>('local');
  const [loading, setLoading] = useState(!!noteId);
  const [saving, setSaving] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  // Update local state when notes array changes (for real-time updates)
  useEffect(() => {
    if (noteId) {
      const updatedNote = notes.find(n => n.id === noteId);
      if (updatedNote) {
        setTitle(updatedNote.title);
        setContent(updatedNote.content);
        setStorageType(updatedNote.storage_type || 'local');
      }
    }
  }, [notes, noteId]);

  const loadNote = async () => {
    if (!noteId) return;
    
    try {
      setLoading(true);
      const note = await getNote(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setStorageType(note.storage_type || 'local');
      }
    } catch (error) {
      console.error('Failed to load note:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeStorage = async (newStorageType: 'local' | 'cloud') => {
    if (!noteId) return;
    
    try {
      await changeNoteStorage(noteId, newStorageType);
      setStorageType(newStorageType);
      toast.success(`Note moved to ${newStorageType} storage`);
    } catch (error: any) {
      console.error('Failed to change storage:', error);
      toast.error(error.message || 'Failed to change storage type');
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
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    
    const id = window.setTimeout(() => {
      autoSave();
    }, 1000);
    saveTimeoutRef.current = id;

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
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
              <>
                <Badge variant={storageType === 'cloud' ? 'default' : 'outline'} className="flex items-center gap-1">
                  {storageType === 'cloud' ? (
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
                    {storageType === 'local' && isAuthenticated && user?.email_verified && (
                      <DropdownMenuItem onClick={() => handleChangeStorage('cloud')}>
                        <Cloud className="w-4 h-4 mr-2" />
                        Move to Cloud
                      </DropdownMenuItem>
                    )}
                    {storageType === 'cloud' && (
                      <DropdownMenuItem onClick={() => handleChangeStorage('local')}>
                        <HardDrive className="w-4 h-4 mr-2" />
                        Move to Local
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" onClick={handleViewNote}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </>
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
                      &nbsp;&nbsp;- Nested bullet<br/>
                      <br/>
                      1. First<br/>
                      2. Second<br/>
                      &nbsp;&nbsp;1. Nested numbered<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;- Mixed nested bullet
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Task Lists</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      - [ ] To do item<br/>
                      - [x] Completed item
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Images</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      ![Alt text](https://via.placeholder.com/300)
                    </code>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tables</h4>
                    <code className="block bg-muted p-2 rounded text-xs">
                      | Column A | Column B |<br/>
                      |---|---|<br/>
                      | A1 | B1 |<br/>
                      | A2 | B2 |
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