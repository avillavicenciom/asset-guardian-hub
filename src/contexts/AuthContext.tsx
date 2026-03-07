import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Operator, Permission, ALL_PERMISSIONS } from '@/data/types';
import { api } from '@/lib/api';

export interface AuditEntry {
  id: string;
  timestamp: string;
  operator_id: number;
  operator_name: string;
  action: string;
  module: string;
  details: string;
}

interface AuthContextType {
  currentOperator: Operator | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  auditLog: AuditEntry[];
  addAuditEntry: (action: string, module: string, details: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const STORAGE_KEY = 'it_inventory_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentOperator, setCurrentOperator] = useState<Operator | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const op = JSON.parse(stored) as Operator;
        setCurrentOperator(op);
      } catch {}
    }
  }, []);

  // Cargar audit log desde API
  useEffect(() => {
    api.getAll<any>('audit-log')
      .then(rows => {
        setAuditLog(rows.map((r: any) => ({
          id: String(r.id),
          timestamp: r.created_at || r.timestamp || new Date().toISOString(),
          operator_id: r.operator_id,
          operator_name: r.operator_name,
          action: r.action,
          module: r.module,
          details: r.details,
        })));
      })
      .catch(() => setAuditLog([]));
  }, []);

  const addAuditEntry = async (action: string, module: string, details: string) => {
    if (!currentOperator) return;
    try {
      await api.create('audit-log', {
        operator_id: currentOperator.id,
        operator_name: currentOperator.name,
        action,
        module,
        details,
      });
      // Refrescar
      const rows = await api.getAll<any>('audit-log');
      setAuditLog(rows.map((r: any) => ({
        id: String(r.id),
        timestamp: r.created_at || r.timestamp || new Date().toISOString(),
        operator_id: r.operator_id,
        operator_name: r.operator_name,
        action: r.action,
        module: r.module,
        details: r.details,
      })));
    } catch (err) {
      console.error('Error al registrar auditoría:', err);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await api.login(username, password) as any;
      const op: Operator = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        permissions: user.role === 'ADMIN' ? ALL_PERMISSIONS : (user.permissions || []),
      };
      setCurrentOperator(op);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(op));
      // Refrescar audit log
      const rows = await api.getAll<any>('audit-log');
      setAuditLog(rows.map((r: any) => ({
        id: String(r.id),
        timestamp: r.created_at || r.timestamp || new Date().toISOString(),
        operator_id: r.operator_id,
        operator_name: r.operator_name,
        action: r.action,
        module: r.module,
        details: r.details,
      })));
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, username: string, password: string): Promise<boolean> => {
    try {
      await api.register({ name, email, username, password });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    if (currentOperator) {
      addAuditEntry('LOGOUT', 'Auth', `Cierre de sesión: ${currentOperator.username}`);
    }
    setCurrentOperator(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      currentOperator,
      isAuthenticated: !!currentOperator,
      login,
      register,
      logout,
      auditLog,
      addAuditEntry,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
