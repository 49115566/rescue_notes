import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { useTheme } from '../ThemeProvider';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Settings"
        showBack={true}
        showHelp={true}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
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

          {/* Note Settings (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Note Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Note-specific settings will be available in future updates.
              </p>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  All your notes are stored locally on your device using IndexedDB.
                  Your data never leaves your device unless you explicitly export or share it.
                </p>
                <p className="text-sm text-muted-foreground">
                  This ensures your privacy and allows the app to work offline.
                </p>
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
                  <strong>RESCUE NOTES</strong> - Iteration 1
                </p>
                <p className="text-sm text-muted-foreground">
                  A Progressive Web App for secure, local note-taking with markdown support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}