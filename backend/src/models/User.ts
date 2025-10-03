import db from '../database';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const [user] = await db('users').insert({
      id,
      ...userData,
      created_at: now,
      updated_at: now
    }).returning('*');
    
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where({ email }).first();
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const user = await db('users').where({ id }).first();
    return user || null;
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await db('users').where({ google_id: googleId }).first();
    return user || null;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const [user] = await db('users')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    
    return user || null;
  }

  static async delete(id: string): Promise<boolean> {
    const deletedCount = await db('users').where({ id }).del();
    return deletedCount > 0;
  }

  static async verifyEmail(id: string): Promise<boolean> {
    const updatedCount = await db('users')
      .where({ id })
      .update({
        email_verified: true,
        updated_at: new Date()
      });
    
    return updatedCount > 0;
  }
}