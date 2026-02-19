import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, ArrowLeftRight, Wrench,
  CheckCircle2, Filter, X, Search, Eye
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = [
  'hsl(217, 70%, 50%)',
  'hsl(152, 60%, 42%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(0, 40%, 40%)',
  'hsl(270, 50%, 55%)',
];

interface MetricProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
}

function MetricCard({ label, value, icon, subtitle }: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="metric-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            {icon}
          </div>
          <div>
            {subtitle && (
              <p className="text-[11px] font-medium text-primary mb-0.5">{subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-0.5 tracking-tight">{value.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { assets, assignments, repairs, statuses, getUserById } = useData();
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const brands = useMemo(() => [...new Set(assets.map(a => a.brand).filter(Boolean))].sort() as string[], [assets]);

  const assignedUsers = useMemo(() => {
    const userMap = new Map<string, string>();
    assignments.filter(a => !a.returned_at).forEach(a => {
      if (a.user_id) {
        const u = getUserById(a.user_id);
        if (u) userMap.set(String(u.id), u.display_name);
      } else if (a.manual_user_name) {
        userMap.set(`manual_${a.id}`, a.manual_user_name);
      }
    });
    return Array.from(userMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [assignments, getUserById]);

  const dateRanges = [
    { value: 'all', label: 'Todas las fechas' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' },
  ];

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (brandFilter !== 'all' && a.brand !== brandFilter) return false;
      if (statusFilter !== 'all' && a.status_id !== Number(statusFilter)) return false;
      if (userFilter !== 'all') {
        const activeAssignment = assignments.find(asg => asg.asset_id === a.id && !asg.returned_at);
        if (!activeAssignment) return false;
        if (userFilter.startsWith('manual_')) {
          if (`manual_${activeAssignment.id}` !== userFilter) return false;
        } else {
          if (String(activeAssignment.user_id) !== userFilter) return false;
        }
      }
      if (dateFilter !== 'all') {
        const now = new Date();
        const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        const days = daysMap[dateFilter];
        const cutoff = new Date(now.getTime() - days * 86400000);
        if (new Date(a.updated_at) < cutoff) return false;
      }
      return true;
    });
  }, [brandFilter, statusFilter, userFilter, dateFilter, assets, assignments]);

  const totalAssets = filteredAssets.length;
  const countByStatus = statuses.map(s => ({
    ...s,
    count: filteredAssets.filter(a => a.status_id === s.id).length,
  }));
  const filteredAssetIds = new Set(filteredAssets.map(a => a.id));
  const activeAssignments = assignments.filter(a => !a.returned_at && filteredAssetIds.has(a.asset_id)).length;
  const openRepairs = repairs.filter(r => !r.closed_at && filteredAssetIds.has(r.asset_id)).length;
  const available = countByStatus.find(s => s.code === 'DISPONIBLE')?.count || 0;

  const pieData = countByStatus.filter(s => s.count > 0).map(s => ({
    name: s.label,
    value: s.count,
  }));

  const recentAssignments = useMemo(() => {
    return [...assignments]
      .filter(a => filteredAssetIds.has(a.asset_id))
      .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
      .slice(0, 5);
  }, [assignments, filteredAssetIds]);

  const hasFilters = brandFilter !== 'all' || statusFilter !== 'all' || userFilter !== 'all' || dateFilter !== 'all';

  const clearFilters = () => {
    setBrandFilter('all');
    setStatusFilter('all');
    setUserFilter('all');
    setDateFilter('all');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard de Inventario IT</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen global de activos y salud del sistema</p>
        </div>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar equipo o usuario..." className="pl-9 w-64 bg-card" readOnly />
        </div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Filtros</span>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Marca" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Fecha" /></SelectTrigger>
            <SelectContent>
              {dateRanges.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Asignado a" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {assignedUsers.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statuses.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total de Activos" value={totalAssets} icon={<Monitor className="w-5 h-5 text-primary" />} />
        <MetricCard label="Disponibles" value={available} subtitle={totalAssets > 0 ? `${((available / totalAssets) * 100).toFixed(1)}% del total` : undefined} icon={<CheckCircle2 className="w-5 h-5 text-accent" />} />
        <MetricCard label="En Reparación" value={openRepairs} subtitle={openRepairs > 0 ? 'Atención requerida' : undefined} icon={<Wrench className="w-5 h-5 text-[hsl(38,92%,50%)]" />} />
        <MetricCard label="Asignaciones Activas" value={activeAssignments} icon={<ArrowLeftRight className="w-5 h-5 text-[hsl(217,70%,50%)]" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-card rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Distribución por Estado</h2>
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((_, index) => <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{totalAssets.toLocaleString()}</span>
                <span className="text-[11px] text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full">
              {countByStatus.filter(s => s.count > 0).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                  <span className="text-muted-foreground flex-1">{s.label}</span>
                  <span className="font-semibold">{totalAssets > 0 ? `${Math.round((s.count / totalAssets) * 100)}%` : '0%'}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-3 bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Actividad Reciente</h2>
          </div>
          {recentAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No hay asignaciones con los filtros seleccionados</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {recentAssignments.map(a => {
                  const asset = assets.find(x => x.id === a.asset_id);
                  const user = a.user_id ? getUserById(a.user_id) : null;
                  const userName = user?.display_name || a.manual_user_name || '—';
                  const userInitials = userName.split(' ').map(n => n[0]).slice(0, 2).join('');
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm">{asset?.brand} {asset?.model}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                            {userInitials}
                          </div>
                          <span className="text-sm">{userName}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(a.assigned_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${a.delivery_mode === 'SIGNED' ? 'bg-accent/10 text-accent' : 'bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]'}`}>
                          {a.delivery_mode === 'SIGNED' ? 'Firmado' : 'Validado'}
                        </span>
                      </td>
                      <td>
                        <button className="p-1 rounded hover:bg-muted transition-colors">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
