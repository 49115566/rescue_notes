import React, { useState } from 'react';
import { Send, Plus, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageHeader } from '../PageHeader';
import { Alert, AlertDescription } from '../ui/alert';

export function EmergencyServicesMessagePage() {
  const [selectedService, setSelectedService] = useState('911');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'system',
      message: 'Connected to 911 Emergency Services. How can we help you?',
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const services = [
    { value: '911', label: '911 Emergency Services' },
    { value: 'police', label: 'Police Department' },
    { value: 'fire', label: 'Fire Department' },
    { value: 'medical', label: 'Emergency Medical Services' }
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      message: message.trim(),
      timestamp: new Date(),
      location: 'Attached: Current Location'
    };

    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate emergency service response
    setTimeout(() => {
      const response = {
        id: chatHistory.length + 2,
        sender: 'emergency',
        message: 'We have received your message and location. Help is being dispatched to your location. Please stay on the line.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleNewChat = () => {
    setChatHistory([
      {
        id: 1,
        sender: 'system',
        message: 'Connected to 911 Emergency Services. How can we help you?',
        timestamp: new Date()
      }
    ]);
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
        title="Emergency Services Message"
        showBack={true}
        showHelp={true}
        actions={
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        }
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Demo Warning */}
        <div className="p-4 border-b border-border">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>DEMO ONLY:</strong> This is a simulated emergency messaging interface. 
              No real messages are sent. In an emergency, call 911 directly.
            </AlertDescription>
          </Alert>
        </div>

        {/* Service Selection */}
        <div className="p-4 border-b border-border">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Select emergency service" />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {chatHistory.map((chat) => (
            <div key={chat.id} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                chat.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : chat.sender === 'system'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-100'
              }`}>
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
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                <p className="text-sm">Emergency services is typing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Location will be automatically attached</span>
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
              disabled={!message.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}