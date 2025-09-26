import React from 'react';
import { ArrowLeft, Settings, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showHelp?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  showBack = false, 
  showSettings = false, 
  showHelp = false,
  onBack,
  actions 
}: PageHeaderProps) {
  const { navigate, goBack } = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <h1 className="text-lg font-medium">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {actions}
        {showSettings && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ type: 'settings' })}
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
        {showHelp && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ type: 'help' })}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </header>
  );
}