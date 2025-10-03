import React, { useState } from 'react';
import { Moon, Sun, Monitor, User, LogOut, LogIn, UserPlus, Cloud, HardDrive, Upload, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useNotes } from '../hooks/useNotesV2';
import { useRouter } from '../Router';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { defaultStorageType, setDefaultStorageType } = useSettings();
  const { notes, bulkMoveToCloud, syncNotes, syncing, isWebSocketConnected } = useNotes();
  const { navigate } = useRouter();
  const [showBulkMoveDialog, setShowBulkMoveDialog] = useState(false);
  const [movingToCloud, setMovingToCloud] = useState(false);

  const handleLogout = () => {
    logout();
  };
  
  const localNotesCount = notes.filter(n => n.storage_type === 'local').length;
  
  const handleBulkMove = async () => {
    try {
      setMovingToCloud(true);
      const result = await bulkMoveToCloud();
      setShowBulkMoveDialog(false);
      toast.success(result.message);
      if (result.summary.failed > 0) {
        toast.error(`Failed to move ${result.summary.failed} notes`);
      }
    } catch (error: any) {
      console.error('Failed to bulk move:', error);
      toast.error(error.message || 'Failed to move notes to cloud');
    } finally {
      setMovingToCloud(false);
    }
  };
  
  const handleSync = async () => {
    try {
      await syncNotes();
      toast.success('Notes synced successfully');
    } catch (error) {
      toast.error('Failed to sync notes');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Settings"
        showBack={true}
        showHelp={true}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Signed in as:</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      {user?.first_name && (
                        <p className="text-sm text-muted-foreground">{user.first_name} {user.last_name}</p>
                      )}
                      {!user?.email_verified && (
                        <div className="p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
                          Email not verified. <Button
                            variant="link"
                            onClick={() => navigate({ type: 'auth', mode: 'verify-email' })}
                            className="text-amber-600 p-0 h-auto underline"
                          >
                            Verify now
                          </Button>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Sign in to access cloud storage and sync your notes across devices.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate({ type: 'auth', mode: 'login' })}
                        className="flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate({ type: 'auth', mode: 'register' })}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Sign Up
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose how RESCUE NOTES appears to you.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={theme === 'dark' ? toggleTheme : undefined}
                    className="flex items-center gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={theme === 'light' ? toggleTheme : undefined}
                    className="flex items-center gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Storage & Sync</CardTitle>
              <CardDescription>
                Choose where to store your notes and manage synchronization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Default Storage Preference */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Default Storage for New Notes</Label>
                  <RadioGroup 
                    value={defaultStorageType} 
                    onValueChange={(value: string) => setDefaultStorageType(value as 'local' | 'cloud')}
                  >
                    <div className="flex items-start space-x-3 p-3 border rounded-md">
                      <RadioGroupItem value="local" id="storage-local" className="mt-0.5" />
                      <Label htmlFor="storage-local" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <HardDrive className="w-4 h-4" />
                          <span className="font-medium">Local Storage</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Notes stored on this device only. Always available offline.
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3 p-3 border rounded-md">
                      <RadioGroupItem 
                        value="cloud" 
                        id="storage-cloud" 
                        className="mt-0.5"
                        disabled={!isAuthenticated || !user?.email_verified}
                      />
                      <Label 
                        htmlFor="storage-cloud" 
                        className={`flex-1 ${(!isAuthenticated || !user?.email_verified) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Cloud className="w-4 h-4" />
                          <span className="font-medium">Cloud Storage</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Synced across all your devices. Requires account and verified email.
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground">
                      Sign in and verify your email to use cloud storage.
                    </p>
                  )}
                  {isAuthenticated && !user?.email_verified && (
                    <p className="text-sm text-amber-600">
                      Please verify your email to use cloud storage.
                    </p>
                  )}
                </div>

                {/* Cloud Sync Actions */}
                {isAuthenticated && user?.email_verified && (
                  <>
                    <div className="h-px bg-border" />
                    
                    {/* Real-time Sync Status */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Real-time Sync</Label>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Connection Status</p>
                          <p className="text-sm text-muted-foreground">
                            {isWebSocketConnected 
                              ? 'Connected - changes sync instantly across devices'
                              : 'Disconnected - manual sync required'
                            }
                          </p>
                        </div>
                        <Badge 
                          variant={isWebSocketConnected ? "default" : "outline"}
                          className="flex items-center gap-1"
                        >
                          {isWebSocketConnected ? (
                            <><Wifi className="w-3 h-3" /> Live</>
                          ) : (
                            <><WifiOff className="w-3 h-3" /> Offline</>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Cloud Actions</Label>
                      
                      {/* Sync Button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Sync Notes</p>
                          <p className="text-sm text-muted-foreground">
                            Refresh cloud notes to get latest changes
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSync}
                          disabled={syncing}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                          Sync
                        </Button>
                      </div>

                      {/* Bulk Move Button */}
                      {localNotesCount > 0 && (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Move All to Cloud</p>
                            <p className="text-sm text-muted-foreground">
                              Move {localNotesCount} local {localNotesCount === 1 ? 'note' : 'notes'} to cloud storage
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowBulkMoveDialog(true)}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Move All
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-border" />
                    <p className="text-sm text-muted-foreground">
                      Sign in to unlock cloud storage and cross-device sync.
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>RESCUE NOTES</strong> - Iteration 2
                </p>
                <p className="text-sm text-muted-foreground">
                  A Progressive Web App for secure note-taking with markdown support, cloud sync, and emergency features.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Move Confirmation Dialog */}
      <AlertDialog open={showBulkMoveDialog} onOpenChange={setShowBulkMoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move All Notes to Cloud?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move {localNotesCount} local {localNotesCount === 1 ? 'note' : 'notes'} to cloud storage. 
              {localNotesCount === 1 ? 'It' : 'They'} will be synced across all your devices and removed from local-only storage.
              This action cannot be undone automatically, but you can move notes back to local storage individually later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={movingToCloud}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkMove}
              disabled={movingToCloud}
            >
              {movingToCloud ? 'Moving...' : 'Move to Cloud'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}