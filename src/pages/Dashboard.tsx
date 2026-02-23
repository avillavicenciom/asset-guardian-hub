import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, ArrowLeftRight, Wrench,
  CheckCircle2, Search, Eye, AlertTriangle, UserX
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const { assets, assignments, repairs, statuses, getUserById, users } = useData();
  const [expiryDays, setExpiryDays] = useState<number>(30);


  const totalAssets = assets.length;
  const countByStatus = statuses.map(s => ({
    ...s,
    count: assets.filter(a => a.status_id === s.id).length,
  }));
  const activeAssignments = assignments.filter(a => !a.returned_at).length;
  const openRepairs = repairs.filter(r => !r.closed_at).length;
  const available = countByStatus.find(s => s.code === 'DISPONIBLE')?.count || 0;

  const pieData = countByStatus.filter(s => s.count > 0).map(s => ({
    name: s.label,
    value: s.count,
  }));

  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
      .slice(0, 5);
  }, [assignments]);

  const expiringUsers = useMemo(() => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + expiryDays * 86400000);
    return users.filter(u => {
      if (!u.contract_end) return false;
      const end = new Date(u.contract_end);
      return end >= now && end <= futureDate;
    }).sort((a, b) => new Date(a.contract_end!).getTime() - new Date(b.contract_end!).getTime());
  }, [users, expiryDays]);

  return (
    <div className="p-6 lg:p-8">
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

      {/* Expiring Users Alert */}
      {expiringUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert variant="destructive" className="mb-6 border-[hsl(38,92%,50%)]/30 bg-[hsl(38,92%,50%)]/5 text-foreground">
            <AlertTriangle className="h-4 w-4 !text-[hsl(38,92%,50%)]" />
            <AlertTitle className="text-sm font-semibold">
              ⚠️ {expiringUsers.length} usuario{expiringUsers.length > 1 ? 's' : ''} con contrato por vencer en {expiryDays} días
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              {expiringUsers.map(u => {
                const daysLeft = Math.ceil((new Date(u.contract_end!).getTime() - Date.now()) / 86400000);
                return (
                  <span key={u.id} className="inline-flex items-center gap-1 mr-4">
                    <span className="font-medium text-foreground">{u.display_name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]'}`}>
                      {daysLeft} día{daysLeft !== 1 ? 's' : ''}
                    </span>
                  </span>
                );
              })}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}



      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard label="Total de Activos" value={totalAssets} icon={<Monitor className="w-5 h-5 text-primary" />} />
        <MetricCard label="Disponibles" value={available} subtitle={totalAssets > 0 ? `${((available / totalAssets) * 100).toFixed(1)}% del total` : undefined} icon={<CheckCircle2 className="w-5 h-5 text-accent" />} />
        <MetricCard label="En Reparación" value={openRepairs} subtitle={openRepairs > 0 ? 'Atención requerida' : undefined} icon={<Wrench className="w-5 h-5 text-[hsl(38,92%,50%)]" />} />
        <MetricCard label="Asignaciones Activas" value={activeAssignments} icon={<ArrowLeftRight className="w-5 h-5 text-[hsl(217,70%,50%)]" />} />
        <div className="metric-card flex items-start justify-between">
          <MetricCard label="Contratos por Vencer" value={expiringUsers.length} subtitle={expiringUsers.length > 0 ? `Próximos ${expiryDays} días` : undefined} icon={<UserX className="w-5 h-5 text-destructive" />} />
          <Select value={String(expiryDays)} onValueChange={v => setExpiryDays(Number(v))}>
            <SelectTrigger className="h-7 w-20 text-[11px] mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[7, 15, 30, 60, 90, 180, 365].map(d => (
                <SelectItem key={d} value={String(d)}>{d} días</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            <p className="text-sm text-muted-foreground py-8 text-center">No hay asignaciones recientes</p>
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
