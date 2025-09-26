import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { PageHeader } from '../PageHeader';
import { Alert, AlertDescription } from '../ui/alert';

interface Contact {
  name: string;
  phone: string;
}

export function EmergencyContactsMessagePage() {
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<number | null>(null);

  useEffect(() => {
    // Load emergency contacts
    const savedContacts = localStorage.getItem('rescue-notes-emergency-contacts');
    const defaultMessage = localStorage.getItem('rescue-notes-emergency-message');
    
    if (savedContacts) {
      const contacts = JSON.parse(savedContacts).filter((c: Contact) => c.name && c.phone);
      setEmergencyContacts(contacts);
      if (contacts.length > 0) {
        setSelectedContacts([0]); // Select first contact by default
        setActiveContact(0);
      }
    }
    
    if (defaultMessage) {
      setMessage(defaultMessage);
    }
  }, []);

  const handleContactToggle = (index: number) => {
    setSelectedContacts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSendMessage = () => {
    if (!message.trim() || selectedContacts.length === 0) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      location: true,
      recipients: selectedContacts.map(i => emergencyContacts[i].name)
    };

    setChatHistory(prev => [...prev, newMessage]);
    
    // Simulate responses from contacts
    selectedContacts.forEach((contactIndex, i) => {
      setTimeout(() => {
        const response = {
          id: Date.now() + i + 1,
          sender: emergencyContacts[contactIndex].name,
          message: `I received your emergency message. I'm trying to reach you now. Are you okay?`,
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, response]);
      }, (i + 1) * 2000);
    });

    setMessage('');
  };

  const handleQuickSend = () => {
    if (selectedContacts.length === 0) return;
    
    const quickMessage = 'I need help. This is an emergency. Please contact me immediately.';
    setMessage(quickMessage);
    
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Emergency Contacts"
        showBack={true}
        showHelp={true}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Demo Warning */}
        <div className="p-4 border-b border-border">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>DEMO ONLY:</strong> This simulates messaging emergency contacts. 
              No real messages are sent. Use your device's messaging app for real emergencies.
            </AlertDescription>
          </Alert>
        </div>

        {emergencyContacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
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
          </div>
        ) : (
          <>
            {/* Contact Selection */}
            <div className="p-4 border-b border-border">
              <h3 className="font-medium mb-3">Select contacts to message:</h3>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`contact-${index}`}
                      checked={selectedContacts.includes(index)}
                      onCheckedChange={() => handleContactToggle(index)}
                    />
                    <label 
                      htmlFor={`contact-${index}`} 
                      className="text-sm font-medium flex-1 cursor-pointer"
                    >
                      {contact.name} ({contact.phone})
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedContacts.length > 0 && (
                <Button 
                  onClick={handleQuickSend}
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Quick Emergency Message
                </Button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Send an emergency message to your contacts.</p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      chat.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100'
                    }`}>
                      {chat.sender !== 'user' && (
                        <p className="text-xs font-medium mb-1">{chat.sender}</p>
                      )}
                      <p className="text-sm">{chat.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">{formatTime(chat.timestamp)}</span>
                        {chat.location && (
                          <span className="text-xs opacity-70 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Location
                          </span>
                        )}
                      </div>
                      {chat.recipients && (
                        <p className="text-xs opacity-70 mt-1">
                          Sent to: {chat.recipients.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Location will be automatically shared</span>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your emergency message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || selectedContacts.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedContacts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Select at least one contact to send messages
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}