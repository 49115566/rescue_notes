import React, { useEffect, useState } from 'react';
import { Phone, MessageSquare, Settings, AlertTriangle, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { Alert, AlertDescription } from '../ui/alert';

export function EmergencyCommPage() {
  const { navigate } = useRouter();
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('rescue-notes-emergency-setup');
    if (!hasVisited) {
      setIsFirstVisit(true);
      // Replace current route so back cannot return to this pre-setup page
      navigate({ type: 'emergency-setup' }, { replace: true });
    }
  }, [navigate]);

  const handleQuickEmergencyMessage = () => {
    const message = quickMessage.trim() || 'I need emergency assistance. Please send help to my location.';
    // Simulate sending - in real app this would trigger actual emergency services
    console.log('Emergency message would be sent:', message);
    navigate({ type: 'emergency-services-message' });
  };

  const handleQuickContactMessage = () => {
    const message = contactMessage.trim() || 'I need help. This is an emergency.';
    // Simulate sending - in real app this would message emergency contacts
    console.log('Contact message would be sent:', message);
    navigate({ type: 'emergency-contacts-message' });
  };

  if (isFirstVisit) {
    return null; // Setup page will be shown
  }

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Emergency Communication"
        showBack={true}
        showHelp={true}
        actions={
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ type: 'emergency-settings' })}
          >
            <Settings className="w-4 h-4" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Emergency Warning */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>DEMO ONLY:</strong> These emergency features are non-functional prototypes. 
              In a real emergency, use your device's native emergency calling features.
            </AlertDescription>
          </Alert>

          {/* Quick Emergency Services */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Services (911)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Optional emergency message (default message will be sent if empty)"
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <Button 
                onClick={handleQuickEmergencyMessage}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Emergency Message
              </Button>
            </CardContent>
          </Card>

          {/* Quick Emergency Contacts */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Optional message to emergency contacts (default message will be sent if empty)"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <Button 
                onClick={handleQuickContactMessage}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Alert Emergency Contacts
              </Button>
            </CardContent>
          </Card>

          {/* Detailed Options */}
          <div className="grid gap-3">
            <h3 className="font-medium">Detailed Communication Options</h3>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent 
                className="p-4"
                onClick={() => navigate({ type: 'emergency-services-message' })}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium">Text Emergency Services</h4>
                    <p className="text-sm text-muted-foreground">Send detailed messages to 911</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent 
                className="p-4"
                onClick={() => navigate({ type: 'emergency-services-call' })}
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium">Call Emergency Services</h4>
                    <p className="text-sm text-muted-foreground">Direct voice call to 911</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent 
                className="p-4"
                onClick={() => navigate({ type: 'emergency-contacts-message' })}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium">Message Emergency Contacts</h4>
                    <p className="text-sm text-muted-foreground">Send messages to your contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent 
                className="p-4"
                onClick={() => navigate({ type: 'emergency-contacts-call' })}
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium">Call Emergency Contacts</h4>
                    <p className="text-sm text-muted-foreground">Direct voice calls to your contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}