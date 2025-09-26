import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Volume2, VolumeX, Mic, MicOff, Bluetooth, Headphones, Speaker } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageHeader } from '../PageHeader';
import { Alert, AlertDescription } from '../ui/alert';

export function EmergencyServicesCallPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioOutput, setAudioOutput] = useState('earpiece');
  const [callStatus, setCallStatus] = useState<'dialing' | 'connected' | 'ended'>('dialing');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCallActive && callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, callStatus]);

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallStatus('dialing');
    setCallDuration(0);
    
    // Simulate call connection
    setTimeout(() => {
      setCallStatus('connected');
    }, 3000);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallStatus('ended');
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const audioOutputOptions = [
    { value: 'earpiece', label: 'Earpiece', icon: Phone },
    { value: 'speaker', label: 'Speaker', icon: Speaker },
    { value: 'headphones', label: 'Headphones', icon: Headphones },
    { value: 'bluetooth', label: 'Bluetooth', icon: Bluetooth }
  ];

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Emergency Call"
        showBack={true}
        showHelp={true}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Demo Warning */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <Phone className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>DEMO ONLY:</strong> This is a simulated emergency call interface. 
              No real calls are made. In an emergency, use your device's phone app to call 911.
            </AlertDescription>
          </Alert>

          {/* Call Interface */}
          <Card className="text-center">
            <CardContent className="p-8">
              {!isCallActive ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-12 h-12 text-red-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-medium">911 Emergency Services</h2>
                    <p className="text-muted-foreground">Tap to call emergency services</p>
                  </div>

                  <Button 
                    onClick={handleStartCall}
                    size="lg"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call 911
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-medium">911 Emergency Services</h2>
                    <p className="text-muted-foreground">
                      {callStatus === 'dialing' && 'Connecting...'}
                      {callStatus === 'connected' && 'Connected'}
                      {callStatus === 'ended' && 'Call Ended'}
                    </p>
                    {callStatus === 'connected' && (
                      <p className="text-lg font-mono mt-2">{formatDuration(callDuration)}</p>
                    )}
                  </div>

                  {/* Call Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant={isMuted ? 'destructive' : 'outline'}
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isMuted ? 'Unmute' : 'Mute'}
                    </Button>

                    <Button 
                      variant="outline"
                      onClick={() => {/* Audio output handled by select below */}}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Audio
                    </Button>
                  </div>

                  {/* Audio Output Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audio Output</label>
                    <Select value={audioOutput} onValueChange={setAudioOutput}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {audioOutputOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End Call */}
                  <Button 
                    onClick={handleEndCall}
                    size="lg"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Emergency Call Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Your location is automatically shared with emergency services</p>
                <p>• Stay on the line until help arrives</p>
                <p>• Answer all questions clearly and calmly</p>
                <p>• Follow any instructions given by the operator</p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Status */}
          {isCallActive && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Simulation Active
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This is a demonstration of the emergency call interface. 
                  All controls are functional but no actual call is being made.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}