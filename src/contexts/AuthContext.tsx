import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Operator } from '@/data/types';
import { operators } from '@/data/mockData';

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
const USERS_KEY = 'it_inventory_users';
const AUDIT_KEY = 'it_inventory_audit';

interface StoredUser {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'TECH' | 'READONLY';
  is_active: boolean;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seed: StoredUser[] = operators.map(o => ({
    ...o,
    password: 'admin123',
  }));
  localStorage.setItem(USERS_KEY, JSON.stringify(seed));
  return seed;
}

function getAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

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
    setAuditLog(getAuditLog());
  }, []);

  const addAuditEntry = (action: string, module: string, details: string) => {
    if (!currentOperator) return;
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      operator_id: currentOperator.id,
      operator_name: currentOperator.name,
      action,
      module,
      details,
    };
    const updated = [entry, ...auditLog];
    setAuditLog(updated);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = getStoredUsers();
    const user = users.find(u => u.username === username && u.password === password && u.is_active);
    if (!user) return false;
    const op: Operator = { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, is_active: user.is_active };
    setCurrentOperator(op);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(op));
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      operator_id: op.id,
      operator_name: op.name,
      action: 'LOGIN',
      module: 'Auth',
      details: `Inicio de sesión: ${op.username}`,
    };
    const updated = [entry, ...getAuditLog()];
    setAuditLog(updated);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
    return true;
  };

  const register = async (name: string, email: string, username: string, password: string): Promise<boolean> => {
    const users = getStoredUsers();
    if (users.find(u => u.username === username)) return false;
    const newUser: StoredUser = { id: Date.now(), name, email, username, password, role: 'READONLY', is_active: true };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
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
