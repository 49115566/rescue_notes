import React, { useState, useEffect, createContext, useContext } from 'react';
import { HomePage } from './pages/HomePage';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { NoteViewPage } from './pages/NoteViewPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { HowToPage } from './pages/HowToPage';
import { EmergencyCommPage } from './pages/EmergencyCommPage';
import { EmergencySetupPage } from './pages/EmergencySetupPage';
import { EmergencySettingsPage } from './pages/EmergencySettingsPage';
import { EmergencyServicesMessagePage } from './pages/EmergencyServicesMessagePage';
import { EmergencyServicesCallPage } from './pages/EmergencyServicesCallPage';
import { EmergencyContactsMessagePage } from './pages/EmergencyContactsMessagePage';
import { EmergencyContactsCallPage } from './pages/EmergencyContactsCallPage';

type Route = 
  | { type: 'home' }
  | { type: 'note-editor'; noteId?: string }
  | { type: 'note-view'; noteId: string }
  | { type: 'settings' }
  | { type: 'help' }
  | { type: 'how-to'; guide: string }
  | { type: 'emergency-comm' }
  | { type: 'emergency-setup' }
  | { type: 'emergency-settings' }
  | { type: 'emergency-services-message' }
  | { type: 'emergency-services-call' }
  | { type: 'emergency-contacts-message' }
  | { type: 'emergency-contacts-call' };

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
  history: Route[];
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<Route>({ type: 'home' });
  const [history, setHistory] = useState<Route[]>([{ type: 'home' }]);

  const navigate = (route: Route) => {
    setHistory(prev => [...prev, route]);
    setCurrentRoute(route);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentRoute(newHistory[newHistory.length - 1]);
    }
  };

  const contextValue: RouterContextType = {
    currentRoute,
    navigate,
    goBack,
    history
  };

  const renderCurrentPage = () => {
    switch (currentRoute.type) {
      case 'home':
        return <HomePage />;
      case 'note-editor':
        return <NoteEditorPage noteId={currentRoute.noteId} />;
      case 'note-view':
        return <NoteViewPage noteId={currentRoute.noteId} />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      case 'how-to':
        return <HowToPage guide={currentRoute.guide} />;
      case 'emergency-comm':
        return <EmergencyCommPage />;
      case 'emergency-setup':
        return <EmergencySetupPage />;
      case 'emergency-settings':
        return <EmergencySettingsPage />;
      case 'emergency-services-message':
        return <EmergencyServicesMessagePage />;
      case 'emergency-services-call':
        return <EmergencyServicesCallPage />;
      case 'emergency-contacts-message':
        return <EmergencyContactsMessagePage />;
      case 'emergency-contacts-call':
        return <EmergencyContactsCallPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <RouterContext.Provider value={contextValue}>
      {renderCurrentPage()}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within Router');
  }
  return context;
}