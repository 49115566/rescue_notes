import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { EmailVerificationModel } from '../models/EmailVerification';
import { PasswordResetModel } from '../models/PasswordReset';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { authLimiter, emailLimiter } from '../middleware/rateLimit';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword
} from '../middleware/validation';

const router = Router();

// Register
router.post('/register', authLimiter, validateRegister, async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      email,
      password_hash,
      first_name,
      last_name,
      email_verified: false
    });

    // Create verification code
    const verificationCode = await EmailVerificationModel.create(user.id);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode.code);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', authLimiter, validateLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Email
router.post('/verify-email', authenticateToken, validateVerifyEmail, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;

    // Find verification code
    const verificationCode = await EmailVerificationModel.findByCode(code);
    if (!verificationCode || verificationCode.user_id !== userId) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Mark code as used
    await EmailVerificationModel.markAsUsed(verificationCode.id);

    // Verify user email
    await UserModel.verifyEmail(userId);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend Verification Email
router.post('/resend-verification', authenticateToken, emailLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    if (req.user!.email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Create new verification code
    const verificationCode = await EmailVerificationModel.create(userId);

    // Send verification email
    try {
      await sendVerificationEmail(userEmail, verificationCode.code);
      res.json({ message: 'Verification email sent successfully' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', emailLimiter, validateForgotPassword, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Return success even if user doesn't exist for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Create reset token
    const resetToken = await PasswordResetModel.create(user.id);

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken.token}`;

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetLink);
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).json({ error: 'Failed to send password reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', authLimiter, validateResetPassword, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    // Find reset token
    const resetToken = await PasswordResetModel.findByToken(token);
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const password_hash = await hashPassword(password);

    // Update user password
    await UserModel.update(resetToken.user_id, { password_hash });

    // Mark token as used
    await PasswordResetModel.markAsUsed(resetToken.id);

    // Generate new JWT token for automatic login
    const user = await UserModel.findById(resetToken.user_id);
    const authToken = generateToken({ userId: user!.id, email: user!.email });

    res.json({
      message: 'Password reset successfully',
      token: authToken,
      user: {
        id: user!.id,
        email: user!.email,
        first_name: user!.first_name,
        last_name: user!.last_name,
        email_verified: user!.email_verified
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Current User
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user
  });
});

export default router;