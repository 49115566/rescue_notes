import db from '../database';
import { PasswordResetToken } from '../types';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class PasswordResetModel {
  static async create(userId: string): Promise<PasswordResetToken> {
    const id = uuidv4();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const now = new Date();
    
    // Invalidate any existing tokens for this user
    await db('password_reset_tokens')
      .where({ user_id: userId, used: false })
      .update({ used: true });
    
    const [resetToken] = await db('password_reset_tokens').insert({
      id,
      user_id: userId,
      token,
      expires_at: expiresAt,
      used: false,
      created_at: now,
      updated_at: now
    }).returning('*');
    
    return resetToken;
  }

  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    const resetToken = await db('password_reset_tokens')
      .where({ token, used: false })
      .where('expires_at', '>', new Date())
      .first();
    
    return resetToken || null;
  }

  static async markAsUsed(id: string): Promise<boolean> {
    const updatedCount = await db('password_reset_tokens')
      .where({ id })
      .update({
        used: true,
        updated_at: new Date()
      });
    
    return updatedCount > 0;
  }

  static async cleanupExpired(): Promise<number> {
    return await db('password_reset_tokens')
      .where('expires_at', '<=', new Date())
      .del();
  }
}