import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, ArrowLeftRight, Wrench,
  CheckCircle2, Eye, AlertTriangle, UserX,
  TrendingUp, TrendingDown
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  iconBg: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

function MetricCard({ label, value, icon, iconBg, trend, delay = 0 }: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl border p-5 flex items-center justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend.positive ? 'text-accent' : 'text-destructive'}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>
        {icon}
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
      .slice(0, 6);
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
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen global de activos y salud del sistema</p>
      </div>

      {/* Expiring Users Alert */}
      {expiringUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Alert variant="destructive" className="max-w-2xl border-[hsl(38,92%,50%)]/30 bg-[hsl(38,92%,50%)]/5 text-foreground">
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Activos"
          value={totalAssets}
          icon={<Monitor className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
          delay={0}
        />
        <MetricCard
          label="Disponibles"
          value={available}
          icon={<CheckCircle2 className="w-5 h-5 text-accent" />}
          iconBg="bg-accent/10"
          trend={totalAssets > 0 ? { value: `${((available / totalAssets) * 100).toFixed(0)}% del total`, positive: true } : undefined}
          delay={0.05}
        />
        <MetricCard
          label="En Reparación"
          value={openRepairs}
          icon={<Wrench className="w-5 h-5 text-[hsl(38,92%,50%)]" />}
          iconBg="bg-[hsl(38,92%,50%)]/10"
          trend={openRepairs > 0 ? { value: 'Atención requerida', positive: false } : undefined}
          delay={0.1}
        />
        <MetricCard
          label="Asignaciones Activas"
          value={activeAssignments}
          icon={<ArrowLeftRight className="w-5 h-5 text-[hsl(217,70%,50%)]" />}
          iconBg="bg-[hsl(217,70%,50%)]/10"
          delay={0.15}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Contratos por Vencer</p>
              <p className="text-3xl font-bold tracking-tight">{expiringUsers.length}</p>
              {expiringUsers.length > 0 && (
                <p className="text-xs font-medium text-destructive mt-1.5 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Próximos {expiryDays} días
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-3 rounded-xl bg-destructive/10">
                <UserX className="w-5 h-5 text-destructive" />
              </div>
              <Select value={String(expiryDays)} onValueChange={v => setExpiryDays(Number(v))}>
                <SelectTrigger className="h-7 w-20 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[7, 15, 30, 60, 90, 180, 365].map(d => (
                    <SelectItem key={d} value={String(d)}>{d} días</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts + Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 bg-card rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Distribución por Estado</h2>
          <div className="flex flex-col items-center">
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((_, index) => <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{totalAssets}</span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4 w-full">
              {countByStatus.filter(s => s.count > 0).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }} />
                  <span className="text-muted-foreground flex-1 truncate">{s.label}</span>
                  <span className="font-semibold">{s.count}</span>
                  <span className="text-muted-foreground w-8 text-right">{totalAssets > 0 ? `${Math.round((s.count / totalAssets) * 100)}%` : '0%'}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-9 bg-card rounded-xl border p-5">
          <h2 className="text-sm font-semibold mb-4">Actividad Reciente</h2>
          {recentAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No hay asignaciones recientes</p>
          ) : (
            <div className="overflow-x-auto">
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
                            <Monitor className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium text-xs">{asset?.brand} {asset?.model}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                              {userInitials}
                            </div>
                            <span className="text-xs">{userName}</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(a.assigned_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </td>
                        <td>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${a.delivery_mode === 'SIGNED' ? 'bg-accent/10 text-accent' : 'bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]'}`}>
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
