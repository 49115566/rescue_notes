import React, { useState, useEffect, createContext, useContext } from 'react';
import { Router } from './components/Router';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { PWASetup } from './components/PWASetup';
import { Toaster } from './components/ui/sonner';
import './styles/globals.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <PWASetup />
          <div className="min-h-screen bg-background text-foreground">
            <Router />
          </div>
          <Toaster />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}