import { randomBytes } from 'crypto';
import { db } from '../db';
import { eq, or, lt, not, isNull } from 'drizzle-orm';
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from '../../shared/schema';
import { sendVerificationEmail } from './email';

// Define email verification tokens table
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  usedAt: timestamp('used_at'),
});

// Create a verification token for a user
export async function createVerificationToken(userId: number, email: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Clean up expired tokens first
    await cleanupExpiredTokens();
    
    // Generate a random token
    const token = randomBytes(32).toString('hex');
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Insert the token into the database
    await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
    });
    
    // Generate verification link
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const verificationLink = `${baseUrl}/verify-email/${token}`;
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationLink);
    
    if (emailSent) {
      return { success: true };
    } else {
      return { success: false, message: 'Failed to send verification email' };
    }
  } catch (error) {
    console.error('Error creating verification token:', error);
    return { success: false, message: 'An error occurred while creating verification token' };
  }
}

// Verify a token and mark the user as verified
export async function verifyEmail(token: string): Promise<{ success: boolean; message?: string; userId?: number }> {
  try {
    // Find the token
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);
    
    if (!verificationToken) {
      return { success: false, message: 'Invalid verification token' };
    }
    
    // Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      return { success: false, message: 'Verification token has expired' };
    }
    
    // Check if token is already used
    if (verificationToken.usedAt) {
      return { success: false, message: 'Verification token has already been used' };
    }
    
    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, verificationToken.id));
    
    // Update user's email verification status
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, verificationToken.userId));
    
    return { success: true, userId: verificationToken.userId };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { success: false, message: 'An error occurred during verification' };
  }
}

// Resend verification email
export async function resendVerificationEmail(userId: number, email: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Delete any existing tokens for this user
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId));
    
    // Create a new token and send verification email
    const result = await createVerificationToken(userId, email);
    return result;
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, message: 'An error occurred while resending verification email' };
  }
}

// Cleanup expired tokens
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await db
      .delete(emailVerificationTokens)
      .where(
        or(
          lt(emailVerificationTokens.expiresAt, new Date()),
          not(isNull(emailVerificationTokens.usedAt))
        )
      );
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
} 