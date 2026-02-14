import React, { createContext, useContext, useState, useCallback } from 'react';

type AuthModalContextValue = {
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);
  return (
    <AuthModalContext.Provider value={{ authModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
