import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, MapPin, Users, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';
import { Alert, AlertDescription } from '../ui/alert';

type SetupStep = 'welcome' | 'location' | 'contacts' | 'message' | 'complete';

export function EmergencySetupPage() {
  const { navigate } = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [defaultMessage, setDefaultMessage] = useState('I need help. This is an emergency. Please contact me or send assistance to my location.');

  const updateContact = (index: number, field: 'name' | 'phone', value: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const handleComplete = () => {
    // Save setup completion
    localStorage.setItem('rescue-notes-emergency-setup', 'completed');
    localStorage.setItem('rescue-notes-emergency-contacts', JSON.stringify(emergencyContacts));
    localStorage.setItem('rescue-notes-emergency-message', defaultMessage);
    
    navigate({ type: 'emergency-comm' });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This is a demonstration of emergency communication features. 
                In a real emergency, always use your device's native emergency calling capabilities.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to Emergency Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This setup will help you configure emergency communication features for quick access during emergencies.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">What we'll set up:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location access for emergency services
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Emergency contact information
                    </li>
                    <li className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Default emergency message
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground">
                  All information stays on your device and is only used for emergency communication features.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Emergency services need your location to provide help. We'll request location access 
                  when you use emergency features.
                </p>
                
                <Alert>
                  <AlertDescription>
                    <strong>Demo Note:</strong> In the actual app, this would request real location permissions. 
                    For this demo, location features are simulated.
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">How location is used:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Automatically attached to emergency messages</li>
                    <li>• Helps emergency services find you quickly</li>
                    <li>• Can be shared with emergency contacts</li>
                    <li>• Only accessed during emergency communication</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'contacts':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add up to 3 emergency contacts who can be quickly notified in case of emergency.
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
                  You can skip contacts and add them later in emergency settings.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'message':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Default Emergency Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This message will be sent when you use quick emergency communication features. 
                  You can always customize it before sending.
                </p>
                
                <Textarea
                  placeholder="Enter your default emergency message..."
                  value={defaultMessage}
                  onChange={(e) => setDefaultMessage(e.target.value)}
                  rows={4}
                />

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Message tips:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Keep it clear and concise</li>
                    <li>• Include that it's an emergency</li>
                    <li>• Your location will be automatically attached</li>
                    <li>• You can always edit before sending</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  Setup Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your emergency communication features are now configured and ready to use.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Quick access:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Emergency communication is available from the help menu</li>
                    <li>• Use quick buttons for immediate emergency messages</li>
                    <li>• Access detailed options for specific situations</li>
                    <li>• Update settings anytime in emergency settings</li>
                  </ul>
                </div>

                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <AlertDescription>
                    <strong>Remember:</strong> These are demonstration features only. 
                    In a real emergency, use your device's native emergency calling features.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'welcome': return 'Emergency Setup';
      case 'location': return 'Step 1: Location';
      case 'contacts': return 'Step 2: Contacts';
      case 'message': return 'Step 3: Message';
      case 'complete': return 'Setup Complete';
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 'welcome':
      case 'location':
        return true;
      case 'contacts':
        return true; // Allow skipping contacts
      case 'message':
        return defaultMessage.trim().length > 0;
      case 'complete':
        return true;
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('location');
        break;
      case 'location':
        setCurrentStep('contacts');
        break;
      case 'contacts':
        setCurrentStep('message');
        break;
      case 'message':
        setCurrentStep('complete');
        break;
      case 'complete':
        handleComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'location':
        setCurrentStep('welcome');
        break;
      case 'contacts':
        setCurrentStep('location');
        break;
      case 'message':
        setCurrentStep('contacts');
        break;
      case 'complete':
        setCurrentStep('message');
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title={getStepTitle()}
        showBack={currentStep !== 'welcome'}
        onBack={handleBack}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 'welcome'}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canContinue()}
          >
            {currentStep === 'complete' ? 'Get Started' : 'Continue'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}