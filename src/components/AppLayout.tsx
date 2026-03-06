import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Users, ArrowLeftRight,
  Wrench, LogOut, ClipboardList, HelpCircle, Settings,
  Moon, Sun, Bell, ChevronDown
} from 'lucide-react';
import logo from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { useTheme } from '@/hooks/useTheme';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { currentOperator, logout } = useAuth();
  const { canViewAudit } = useRole();
  const { isDark, toggle } = useTheme();

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
        <div className="flex items-center justify-center px-5 py-4">
          <img src={isDark ? logoDark : logo} alt="Guardian Inventario" className={`${isDark ? 'w-32' : 'w-36'} h-auto object-contain`} />
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

        {/* Bottom: Dark mode, Settings, Help */}
        <div className="px-3 pb-3 space-y-0.5">
          {/* Dark mode toggle */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: 'hsl(var(--sidebar-foreground))' }}>
            {isDark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            <span className="flex-1">Dark mode</span>
            <Switch checked={isDark} onCheckedChange={toggle} className="scale-90" />
          </div>

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
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 flex-shrink-0 bg-card border-b flex items-center justify-end px-6 gap-3">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors outline-none">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-tight">{currentOperator?.name}</p>
                <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" /> Ajustes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/help" className="cursor-pointer">
                  <HelpCircle className="w-4 h-4 mr-2" /> Ayuda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
