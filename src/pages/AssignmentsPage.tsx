import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle2, RotateCcw } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { DeliveryReasonCode, DELIVERY_REASONS } from '@/data/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { operators } from '@/data/mockData';

export default function AssignmentsPage() {
  const { assignments, getAssetById, getUserById } = useData();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState<'all' | 'active' | 'returned'>('all');

  const getOperatorById = (id: number) => operators.find(o => o.id === id);

  const enriched = useMemo(() => {
    return assignments.map(a => {
      const asset = getAssetById(a.asset_id);
      const user = a.user_id ? getUserById(a.user_id) : null;
      const operator = getOperatorById(a.assigned_by_operator_id);
      return { ...a, asset, user, operator };
    });
  }, [assignments, getAssetById, getUserById]);

  const filtered = useMemo(() => {
    return enriched.filter(a => {
      const q = search.toLowerCase();
      const userName = a.user?.display_name || a.manual_user_name || '';
      const assetName = `${a.asset?.brand} ${a.asset?.model} ${a.asset?.serial_number}`;
      const matchSearch = !search || userName.toLowerCase().includes(q) || assetName.toLowerCase().includes(q);
      const matchFilter = showFilter === 'all' || (showFilter === 'active' && !a.returned_at) || (showFilter === 'returned' && a.returned_at);
      return matchSearch && matchFilter;
    });
  }, [enriched, search, showFilter]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Asignaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Historial de entregas y devoluciones</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por usuario o equipo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={showFilter} onValueChange={(v) => setShowFilter(v as typeof showFilter)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="returned">Devueltas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Usuario</th>
                <th>Operador</th>
                <th>Fecha</th>
                <th>Modo</th>
                <th>Motivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const userName = a.user?.display_name || a.manual_user_name || '—';
                const reasonLabel = a.delivery_reason_code ? DELIVERY_REASONS[a.delivery_reason_code as DeliveryReasonCode] || a.delivery_reason_code : '—';
                return (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td>
                      <p className="font-medium text-sm">{a.asset?.brand} {a.asset?.model}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.asset?.serial_number}</p>
                    </td>
                    <td className="font-medium">{userName}</td>
                    <td className="text-muted-foreground text-sm">{a.operator?.name}</td>
                    <td className="text-muted-foreground text-sm">{new Date(a.assigned_at).toLocaleDateString('es-ES')}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${a.delivery_mode === 'SIGNED' ? 'bg-accent/10 text-accent' : 'bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]'}`}>
                        {a.delivery_mode === 'SIGNED' ? 'Firmado' : 'Validado'}
                      </span>
                    </td>
                    <td className="text-sm text-muted-foreground max-w-[180px] truncate" title={a.delivery_reason_text || undefined}>{reasonLabel}</td>
                    <td>
                      {a.returned_at ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><RotateCcw className="w-3 h-3" /> Devuelto</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[hsl(217,70%,50%)] font-medium"><CheckCircle2 className="w-3 h-3" /> Activa</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
