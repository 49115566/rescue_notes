import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../Router';

interface AuthPageProps {
  mode: 'login' | 'register' | 'forgot-password' | 'verify-email';
}

export function AuthPage({ mode }: AuthPageProps) {
  const { navigate } = useRouter();
  const { login, register, forgotPassword, verifyEmail, resendVerification } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    confirmPassword: '',
    verificationCode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      switch (mode) {
        case 'register':
          if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          await register({
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name || undefined,
            last_name: formData.last_name || undefined,
          });
          setSuccess('Account created! Please check your email for verification.');
          navigate({ type: 'auth', mode: 'verify-email' });
          break;
          
        case 'login':
          await login({
            email: formData.email,
            password: formData.password,
          });
          navigate({ type: 'home' });
          break;
          
        case 'forgot-password':
          await forgotPassword(formData.email);
          setSuccess('If an account exists with that email, a reset link has been sent.');
          break;
          
        case 'verify-email':
          await verifyEmail(formData.verificationCode);
          setSuccess('Email verified successfully!');
          setTimeout(() => navigate({ type: 'home' }), 2000);
          break;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setError('');
      setLoading(true);
      await resendVerification();
      setSuccess('Verification email sent!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'register':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="Password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
          </>
        );

      case 'login':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="Password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        );

      case 'forgot-password':
        return (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                placeholder="your@email.com"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        );

      case 'verify-email':
        return (
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              required
              maxLength={6}
              value={formData.verificationCode}
              onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
              className="text-center text-xl tracking-widest"
              placeholder="000000"
            />
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to your email address.
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'register': return 'Create Account';
      case 'login': return 'Sign In';
      case 'forgot-password': return 'Reset Password';
      case 'verify-email': return 'Verify Email';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'register': return 'Create Account';
      case 'login': return 'Sign In';
      case 'forgot-password': return 'Send Reset Link';
      case 'verify-email': return 'Verify Email';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ type: 'settings' })}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderForm()}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : getButtonText()}
            </Button>
          </form>

          {mode === 'verify-email' && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-sm"
              >
                Didn't receive the code? Resend
              </Button>
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-2 text-center">
              <Button
                variant="link"
                onClick={() => navigate({ type: 'auth', mode: 'forgot-password' })}
                className="text-sm"
              >
                Forgot your password?
              </Button>
              <div>
                <span className="text-sm text-muted-foreground">Don't have an account? </span>
                <Button
                  variant="link"
                  onClick={() => navigate({ type: 'auth', mode: 'register' })}
                  className="text-sm p-0 h-auto"
                >
                  Sign up
                </Button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Already have an account? </span>
              <Button
                variant="link"
                onClick={() => navigate({ type: 'auth', mode: 'login' })}
                className="text-sm p-0 h-auto"
              >
                Sign in
              </Button>
            </div>
          )}

          {mode === 'forgot-password' && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate({ type: 'auth', mode: 'login' })}
                className="text-sm"
              >
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}