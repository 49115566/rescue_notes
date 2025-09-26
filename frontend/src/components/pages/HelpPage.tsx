import React from 'react';
import { FileText, HelpCircle, MessageSquare, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PageHeader } from '../PageHeader';
import { useRouter } from '../Router';

export function HelpPage() {
  const { navigate } = useRouter();

  const helpItems = [
    {
      icon: FileText,
      title: 'Using the Note App',
      description: 'Learn how to create, edit, and manage your notes',
      action: () => navigate({ type: 'how-to', guide: 'notes' })
    },
    {
      icon: HelpCircle,
      title: 'Using Help Features',
      description: 'Get the most out of the help system',
      action: () => navigate({ type: 'how-to', guide: 'help' })
    },
    {
      icon: Settings,
      title: 'Markdown Syntax',
      description: 'Learn how to format your notes with Markdown',
      action: () => navigate({ type: 'how-to', guide: 'markdown' })
    },
    {
      icon: MessageSquare,
      title: 'Emergency Communication',
      description: 'Access emergency communication features (Demo)',
      action: () => navigate({ type: 'emergency-comm' })
    }
  ];

  return (
    <div className="h-screen flex flex-col">
      <PageHeader 
        title="Help & Support"
        showBack={true}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Welcome */}
          <Card>
            <CardHeader>
              <CardTitle>Welcome to RESCUE NOTES</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                RESCUE NOTES is a secure, local-first note-taking app with emergency communication features. 
                Your notes are stored only on your device and never sent to external servers.
              </p>
            </CardContent>
          </Card>

          {/* Help Topics */}
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Help Topics</h2>
            
            {helpItems.map((item, index) => (
              <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4" onClick={item.action}>
                  <div className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Access */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate({ type: 'how-to', guide: 'feedback' })}
                >
                  Send Feedback
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate({ type: 'settings' })}
                >
                  App Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <p className="text-sm">
                <strong>Note:</strong> Emergency communication features in this version are for demonstration purposes only. 
                In a real emergency, always use your device's native emergency calling features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}