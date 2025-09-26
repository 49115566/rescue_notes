import { useState, useEffect } from 'react';
import { Note, notesDB } from '../database';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const allNotes = await notesDB.getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (title: string, content: string = '') => {
    try {
      const note = await notesDB.saveNote({ title, content });
      await loadNotes(); // Refresh the list
      return note;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      const note = await notesDB.saveNote({ id, title, content });
      await loadNotes(); // Refresh the list
      return note;
    } catch (error) {
      console.error('Failed to update note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await notesDB.deleteNote(id);
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const getNote = async (id: string) => {
    try {
      return await notesDB.getNoteById(id);
    } catch (error) {
      console.error('Failed to get note:', error);
      return null;
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    getNote,
    refresh: loadNotes
  };
}