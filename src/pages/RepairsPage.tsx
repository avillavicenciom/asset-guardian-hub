import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Plus, Search, Clock, DollarSign, ExternalLink, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import CreateRepairDialog from '@/components/CreateRepairDialog';
import CloseRepairDialog from '@/components/CloseRepairDialog';
import { Repair } from '@/data/types';

export default function RepairsPage() {
  const { repairs, assets, getStatusById, refresh } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [closeRepair, setCloseRepair] = useState<Repair | null>(null);

  const filtered = useMemo(() => {
    return repairs.filter(r => {
      // Status filter
      if (statusFilter === 'open' && r.closed_at) return false;
      if (statusFilter === 'closed' && !r.closed_at) return false;

      // Search
      if (search) {
        const asset = assets.find(a => a.id === r.asset_id);
        const q = search.toLowerCase();
        const match = [
          asset?.brand, asset?.model, asset?.serial_number, asset?.asset_tag,
          r.diagnosis, r.provider, r.ticket_ref,
        ].filter(Boolean).some(v => v!.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      // Open first, then by date
      if (!a.closed_at && b.closed_at) return -1;
      if (a.closed_at && !b.closed_at) return 1;
      return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
    });
  }, [repairs, assets, search, statusFilter]);

  const openCount = repairs.filter(r => !r.closed_at).length;
  const closedCount = repairs.filter(r => r.closed_at).length;

  const handleDelete = async (id: number) => {
    try {
      await api.delete('repairs', id);
      toast.success('Reparación eliminada');
      refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reparaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {openCount} abiertas · {closedCount} cerradas
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Nueva reparación
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por equipo, serial, diagnóstico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ({repairs.length})</SelectItem>
            <SelectItem value="open">Abiertas ({openCount})</SelectItem>
            <SelectItem value="closed">Cerradas ({closedCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Serial</th>
              <th>Estado</th>
              <th>Diagnóstico</th>
              <th>Proveedor</th>
              <th>Ref. Ticket</th>
              <th>Costo</th>
              <th>Fecha apertura</th>
              <th>Fecha cierre</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const asset = assets.find(a => a.id === r.asset_id);
              const isOpen = !r.closed_at;
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td>
                    <div>
                      <p className="font-medium text-sm">{asset?.brand} {asset?.model}</p>
                      <p className="text-xs text-muted-foreground">{asset?.type}</p>
                    </div>
                  </td>
                  <td className="text-xs font-mono">{asset?.serial_number || '—'}</td>
                  <td>
                    <Badge variant={isOpen ? 'destructive' : 'secondary'} className="text-[10px]">
                      {isOpen ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </td>
                  <td className="text-xs text-muted-foreground max-w-[200px] truncate">{r.diagnosis || '—'}</td>
                  <td className="text-xs">{r.provider || '—'}</td>
                  <td className="text-xs font-mono">{r.ticket_ref || '—'}</td>
                  <td className="text-xs">{r.cost !== null ? `€${r.cost.toFixed(2)}` : '—'}</td>
                  <td className="text-xs">{formatDate(r.opened_at)}</td>
                  <td className="text-xs">{r.closed_at ? formatDate(r.closed_at) : '—'}</td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isOpen && (
                          <DropdownMenuItem onClick={() => setCloseRepair(r)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Cerrar reparación
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDelete(r.id)} className="text-destructive">
                          <XCircle className="w-3.5 h-3.5 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-muted-foreground py-12">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No se encontraron reparaciones</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateRepairDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refresh} />
      <CloseRepairDialog open={!!closeRepair} onOpenChange={v => { if (!v) setCloseRepair(null); }} repair={closeRepair} onClosed={refresh} />
    </div>
  );
}
