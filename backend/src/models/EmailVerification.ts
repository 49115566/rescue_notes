import db from '../database';
import { EmailVerificationCode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class EmailVerificationModel {
  static async create(userId: string): Promise<EmailVerificationCode> {
    const id = uuidv4();
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const now = new Date();
    
    // Invalidate any existing codes for this user
    await db('email_verification_codes')
      .where({ user_id: userId, used: false })
      .update({ used: true });
    
    const [verificationCode] = await db('email_verification_codes').insert({
      id,
      user_id: userId,
      code,
      expires_at: expiresAt,
      used: false,
      created_at: now,
      updated_at: now
    }).returning('*');
    
    return verificationCode;
  }

  static async findByCode(code: string): Promise<EmailVerificationCode | null> {
    const verificationCode = await db('email_verification_codes')
      .where({ code, used: false })
      .where('expires_at', '>', new Date())
      .first();
    
    return verificationCode || null;
  }

  static async markAsUsed(id: string): Promise<boolean> {
    const updatedCount = await db('email_verification_codes')
      .where({ id })
      .update({
        used: true,
        updated_at: new Date()
      });
    
    return updatedCount > 0;
  }

  static async cleanupExpired(): Promise<number> {
    return await db('email_verification_codes')
      .where('expires_at', '<=', new Date())
      .del();
  }
}