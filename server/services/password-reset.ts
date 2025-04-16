import { randomBytes } from 'crypto';
import { db } from '../db';
import { passwordResetTokens, users } from '../../shared/schema';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { sendPasswordResetEmail } from './email';
import { hashPassword } from './password';

export async function createPasswordResetToken(userId: number, email: string) {
  // Delete any existing unused tokens for this user
  await db.delete(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.userId, userId),
        isNull(passwordResetTokens.usedAt)
      )
    );

  // Create a new token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });

  // Generate reset link
  const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password/${token}`;
  
  // Send email
  return sendPasswordResetEmail(email, resetLink);
}

export async function verifyPasswordResetToken(token: string) {
  const result = await db.select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    );

  if (result.length === 0) {
    return { valid: false, message: "Invalid or expired token" };
  }

  return { valid: true };
}

export async function resetPassword(token: string, newPassword: string) {
  // Verify token
  const tokenVerification = await verifyPasswordResetToken(token);
  if (!tokenVerification.valid) {
    return { success: false, message: tokenVerification.message };
  }

  // Get token record
  const tokenRecord = await db.select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (tokenRecord.length === 0) {
    return { success: false, message: "Token not found" };
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, tokenRecord[0].userId));

  // Mark token as used
  await db.update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenRecord[0].id));

  return { success: true };
} 