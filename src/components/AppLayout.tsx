import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Users, ArrowLeftRight,
  Wrench, LogOut, Server, ClipboardList, HelpCircle, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentOperator, logout } = useAuth();
  const { canViewAudit } = useRole();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, visible: true },
    { path: '/assets', label: 'Equipos', icon: Monitor, visible: true },
    { path: '/users', label: 'Usuarios', icon: Users, visible: true },
    { path: '/assignments', label: 'Asignaciones', icon: ArrowLeftRight, visible: true },
    { path: '/repairs', label: 'Reparaciones', icon: Wrench, visible: true },
    { path: '/audit', label: 'Auditoría', icon: ClipboardList, visible: canViewAudit },
  ];

  const initials = currentOperator
    ? currentOperator.name.split(' ').map(n => n[0]).slice(0, 2).join('')
    : '??';

  const roleLabel = {
    ADMIN: 'Admin',
    TECH: 'Técnico',
    READONLY: 'Lectura',
  }[currentOperator?.role || 'READONLY'];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Server className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-sm font-bold text-foreground tracking-tight">Inventario IT</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.filter(i => i.visible).map(item => {
            const active = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 pb-2 space-y-0.5">
          <Link
            to="/settings"
            className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            <Settings className="w-[18px] h-[18px]" />
            Ajustes
          </Link>
          <Link
            to="/help"
            className={`sidebar-link ${location.pathname === '/help' ? 'active' : ''}`}
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            Ayuda
          </Link>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentOperator?.name}</p>
              <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
