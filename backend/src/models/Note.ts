import db from '../database';
import { Note } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class NoteModel {
  static async create(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'deleted' | 'deleted_at'>): Promise<Note> {
    const id = uuidv4();
    const now = new Date();
    
    const [note] = await db('notes').insert({
      id,
      ...noteData,
      deleted: false,
      created_at: now,
      updated_at: now
    }).returning('*');
    
    return note;
  }

  static async findByUserId(userId: string, includeDeleted = false): Promise<Note[]> {
    const query = db('notes').where({ user_id: userId });
    
    if (!includeDeleted) {
      query.where({ deleted: false });
    }
    
    return await query.orderBy('updated_at', 'desc');
  }

  static async findById(id: string, userId: string): Promise<Note | null> {
    const note = await db('notes')
      .where({ id, user_id: userId, deleted: false })
      .first();
    
    return note || null;
  }

  static async findByIdIncludingDeleted(id: string, userId: string): Promise<Note | null> {
    const note = await db('notes')
      .where({ id, user_id: userId })
      .first();
    
    return note || null;
  }

  static async update(id: string, userId: string, updates: Partial<Note>): Promise<Note | null> {
    const [note] = await db('notes')
      .where({ id, user_id: userId, deleted: false })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    
    return note || null;
  }

  static async softDelete(id: string, userId: string): Promise<boolean> {
    const now = new Date();
    const updatedCount = await db('notes')
      .where({ id, user_id: userId, deleted: false })
      .update({
        deleted: true,
        deleted_at: now,
        updated_at: now
      });
    
    return updatedCount > 0;
  }

  static async restore(id: string, userId: string): Promise<boolean> {
    const updatedCount = await db('notes')
      .where({ id, user_id: userId, deleted: true })
      .update({
        deleted: false,
        deleted_at: null,
        updated_at: new Date()
      });
    
    return updatedCount > 0;
  }

  static async hardDelete(id: string, userId: string): Promise<boolean> {
    const deletedCount = await db('notes')
      .where({ id, user_id: userId })
      .del();
    
    return deletedCount > 0;
  }

  static async getCloudNotes(userId: string): Promise<Note[]> {
    return await db('notes')
      .where({ 
        user_id: userId, 
        storage_type: 'cloud',
        deleted: false 
      })
      .orderBy('updated_at', 'desc');
  }

  static async getLocalNotes(userId: string): Promise<Note[]> {
    return await db('notes')
      .where({ 
        user_id: userId, 
        storage_type: 'local',
        deleted: false 
      })
      .orderBy('updated_at', 'desc');
  }

  static async changeStorageType(id: string, userId: string, storageType: 'local' | 'cloud'): Promise<Note | null> {
    const [note] = await db('notes')
      .where({ id, user_id: userId, deleted: false })
      .update({
        storage_type: storageType,
        updated_at: new Date()
      })
      .returning('*');
    
    return note || null;
  }

  static async getUpdatedSince(userId: string, since: Date): Promise<Note[]> {
    return await db('notes')
      .where({ user_id: userId })
      .where('updated_at', '>', since)
      .orderBy('updated_at', 'desc');
  }
}