import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getRolePermissions } from '../services/rolePermissionsService';
import { getUserProfile } from '../services/userProfileService';
import type { PortalRole } from '../types/platform';

interface PermissionsContextType {
  hasPermission: (permissionId: string) => boolean;
  loading: boolean;
  role: PortalRole | null;
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [config, setConfig] = useState<Record<PortalRole, string[]> | null>(null);
  const [role, setRole] = useState<PortalRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setConfig(null);
      setRole(null);
      setLoading(false);
      return;
    }
    if (isAdmin) {
      setConfig(null);
      setRole(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([getRolePermissions(), getUserProfile(user.uid)])
      .then(([perms, profile]) => {
        if (cancelled) return;
        setConfig(perms);
        setRole((profile?.role ?? 'viewer') as PortalRole);
      })
      .catch(() => {
        if (!cancelled) {
          setConfig({ viewer: [], contributor: [], manager: [], admin: [] });
          setRole('viewer');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid, isAdmin]);

  const hasPermission = useCallback(
    (permissionId: string): boolean => {
      if (isAdmin) return true;
      if (!config || role === null) return false;
      const list = config[role];
      return Array.isArray(list) && list.includes(permissionId);
    },
    [isAdmin, config, role]
  );

  const value: PermissionsContextType = { hasPermission, loading, role, isAdmin };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
