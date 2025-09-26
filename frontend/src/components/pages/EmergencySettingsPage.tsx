import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { PageHeader } from '../PageHeader';
import { useTheme } from '../ThemeProvider';

export function EmergencySettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [defaultMessage, setDefaultMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedContacts = localStorage.getItem('rescue-notes-emergency-contacts');
    const savedMessage = localStorage.getItem('rescue-notes-emergency-message');
    
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
    if (savedMessage) {
      setDefaultMessage(savedMessage);
    }
  }, []);

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
    setHasChanges(true);
  };

  const handleMessageChange = (value: string) => {
    setDefaultMessage(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('rescue-notes-emergency-contacts', JSON.stringify(emergencyContacts));
    localStorage.setItem('rescue-notes-emergency-message', defaultMessage);
    setHasChanges(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Emergency Settings"
        showBack={true}
        showHelp={true}
        actions={
          hasChanges && (
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          )
        }
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
                  Choose how emergency communication appears.
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

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure up to 3 emergency contacts for quick communication.
                </p>
                
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium">Contact {index + 1}</h4>
                      <div className="grid gap-2">
                        <Input
                          placeholder="Name"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Phone number"
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Leave fields empty for contacts you don't want to configure.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Default Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Default Emergency Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This message will be used as the default for quick emergency communication. 
                  You can always customize it before sending.
                </p>
                
                <Textarea
                  placeholder="Enter your default emergency message..."
                  value={defaultMessage}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  rows={4}
                />

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Message guidelines:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Clearly state it's an emergency</li>
                    <li>• Keep it concise but informative</li>
                    <li>• Your location will be automatically attached</li>
                    <li>• Include any important medical information if relevant</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Warning */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200">
                Demo Notice
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                These emergency communication features are for demonstration purposes only. 
                In a real emergency, always use your device's native emergency calling capabilities 
                or call 911 directly.
              </p>
            </CardContent>
          </Card>

          {/* Save Changes */}
          {hasChanges && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">
                      Unsaved Changes
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You have unsaved changes to your emergency settings.
                    </p>
                  </div>
                  <Button onClick={handleSave} size="sm">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}