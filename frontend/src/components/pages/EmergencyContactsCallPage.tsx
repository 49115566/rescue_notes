import React, { useState, useEffect } from 'react';
import { Phone, Users, PhoneOff, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { Alert, AlertDescription } from '../ui/alert';

interface Contact {
  name: string;
  phone: string;
}

export function EmergencyContactsCallPage() {
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [activeCall, setActiveCall] = useState<number | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<'dialing' | 'connected' | 'busy' | 'no-answer'>('dialing');

  useEffect(() => {
    // Load emergency contacts
    const savedContacts = localStorage.getItem('rescue-notes-emergency-contacts');
    if (savedContacts) {
      const contacts = JSON.parse(savedContacts).filter((c: Contact) => c.name && c.phone);
      setEmergencyContacts(contacts);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeCall !== null && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall, callStatus]);

  const handleStartCall = (index: number) => {
    setActiveCall(index);
    setCallStatus('dialing');
    setCallDuration(0);
    
    // Simulate different call outcomes
    const outcomes = ['connected', 'busy', 'no-answer'];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    setTimeout(() => {
      setCallStatus(randomOutcome as any);
    }, 3000);
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setCallStatus('dialing');
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (callStatus) {
      case 'dialing':
        return 'Calling...';
      case 'connected':
        return 'Connected';
      case 'busy':
        return 'Line Busy';
      case 'no-answer':
        return 'No Answer';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected':
        return 'text-green-600';
      case 'busy':
      case 'no-answer':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Emergency Contacts Call"
        showBack={true}
        showHelp={true}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Demo Warning */}
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>DEMO ONLY:</strong> This simulates calling emergency contacts. 
              No real calls are made. Use your device's phone app for real emergencies.
            </AlertDescription>
          </Alert>

          {emergencyContacts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  No Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You haven't set up any emergency contacts yet. Add contacts in emergency settings 
                    to use this feature.
                  </p>
                  <Button 
                    onClick={() => window.history.back()}
                    className="w-full"
                  >
                    Go to Emergency Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Call Interface */}
              {activeCall !== null && (
                <Card className="text-center">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                        <Phone className="w-12 h-12 text-amber-600" />
                      </div>
                      
                      <div>
                        <h2 className="text-xl font-medium">{emergencyContacts[activeCall].name}</h2>
                        <p className="text-muted-foreground">{emergencyContacts[activeCall].phone}</p>
                        <p className={`font-medium mt-2 ${getStatusColor()}`}>
                          {getStatusMessage()}
                        </p>
                        {callStatus === 'connected' && (
                          <p className="text-lg font-mono mt-2">{formatDuration(callDuration)}</p>
                        )}
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button 
                          onClick={handleEndCall}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <PhoneOff className="w-5 h-5 mr-2" />
                          {callStatus === 'connected' ? 'End Call' : 'Cancel'}
                        </Button>

                        {(callStatus === 'busy' || callStatus === 'no-answer') && (
                          <Button 
                            onClick={() => handleStartCall(activeCall)}
                            size="lg"
                            variant="outline"
                          >
                            <Phone className="w-5 h-5 mr-2" />
                            Try Again
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact List */}
              {activeCall === null && (
                <div className="space-y-3">
                  <h3 className="font-medium">Emergency Contacts</h3>
                  
                  {emergencyContacts.map((contact, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent 
                        className="p-4"
                        onClick={() => handleStartCall(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                          <Phone className="w-5 h-5 text-amber-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Call All Option */}
              {activeCall === null && emergencyContacts.length > 1 && (
                <Card className="border-amber-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="text-center">
                        <h4 className="font-medium">Emergency Call All</h4>
                        <p className="text-sm text-muted-foreground">
                          Call all emergency contacts one by one until someone answers
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => handleStartCall(0)}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call All Contacts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Call Information */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Emergency Call Tips</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Stay calm and speak clearly</p>
                    <p>• Explain your emergency situation</p>
                    <p>• Share your location if asked</p>
                    <p>• If no answer, try the next contact</p>
                    <p>• Keep trying until you reach someone</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}