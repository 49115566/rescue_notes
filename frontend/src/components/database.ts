export interface Note {
  id: string;
  title: string;
  content: string;
  storage_type?: 'local' | 'cloud';
  createdAt: Date;
  updatedAt: Date;
}

class NotesDatabase {
  private dbName = 'rescue-notes-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('notes')) {
          const store = db.createObjectStore('notes', { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  async getAllNotes(): Promise<Note[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const notes = request.result.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        // Sort by updatedAt descending
        notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        resolve(notes);
      };
    });
  }

  async getNoteById(id: string): Promise<Note | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const note = request.result;
        if (note) {
          resolve({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          });
        } else {
          resolve(null);
        }
      };
    });
  }

  async saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Note> {
    if (!this.db) await this.init();
    
    const now = new Date();
    const existingNote = note.id ? await this.getNoteById(note.id) : null;
    const noteToSave: Note = {
      id: note.id || this.generateId(),
      title: note.title,
      content: note.content,
      storage_type: note.storage_type || 'local',
      createdAt: existingNote?.createdAt || now,
      updatedAt: now
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.put({
        ...noteToSave,
        createdAt: noteToSave.createdAt.toISOString(),
        updatedAt: noteToSave.updatedAt.toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(noteToSave);
    });
  }

  async deleteNote(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export const notesDB = new NotesDatabase();