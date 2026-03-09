import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Plus, Search, CheckCircle2, XCircle, MoreHorizontal, Shield, Filter } from 'lucide-react';
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
import { Repair, RepairStatus, Technician, Department, INCIDENT_TYPES, IncidentType } from '@/data/types';

export default function RepairsPage() {
  const { repairs, assets, users, assignments, getStatusById, refresh } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [incidentFilter, setIncidentFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [closeRepair, setCloseRepair] = useState<Repair | null>(null);

  const [repairStatuses, setRepairStatuses] = useState<RepairStatus[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    Promise.all([
      api.getAll<RepairStatus>('repair-statuses'),
      api.getAll<Technician>('technicians'),
      api.getAll<Department>('departments'),
    ]).then(([rs, t, d]) => {
      setRepairStatuses(rs);
      setTechnicians(t);
      setDepartments(d);
    }).catch(() => {});
  }, []);

  const getRepairStatusById = (id: number | null) => id ? repairStatuses.find(s => s.id === id) : null;
  const getTechnicianById = (id: number | null) => id ? technicians.find(t => t.id === id) : null;

  // Get department for a repair (via asset → active assignment → user)
  const getDepartmentForRepair = (r: Repair): string | null => {
    const activeAssignment = assignments.find(a => a.asset_id === r.asset_id && !a.returned_at);
    if (activeAssignment?.user_id) {
      const user = users.find(u => u.id === activeAssignment.user_id);
      return user?.department || null;
    }
    return null;
  };

  const filtered = useMemo(() => {
    return repairs.filter(r => {
      // Open/closed filter
      if (statusFilter === 'open' && r.closed_at) return false;
      if (statusFilter === 'closed' && !r.closed_at) return false;

      // Repair status filter
      if (repairStatusFilter !== 'all' && String(r.repair_status_id) !== repairStatusFilter) return false;

      // Technician filter
      if (techFilter !== 'all' && String(r.technician_id) !== techFilter) return false;

      // Incident type filter
      if (incidentFilter !== 'all' && r.incident_type !== incidentFilter) return false;

      // Department filter
      if (departmentFilter !== 'all') {
        const dept = getDepartmentForRepair(r);
        if (dept !== departmentFilter) return false;
      }

      // Date filters
      if (dateFrom && new Date(r.opened_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.opened_at) > new Date(dateTo + 'T23:59:59')) return false;

      // Search
      if (search) {
        const asset = assets.find(a => a.id === r.asset_id);
        const q = search.toLowerCase();
        const match = [
          asset?.brand, asset?.model, asset?.serial_number, asset?.asset_tag,
          r.diagnosis, r.action_performed, r.provider, r.ticket_ref,
        ].filter(Boolean).some(v => v!.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      if (!a.closed_at && b.closed_at) return -1;
      if (a.closed_at && !b.closed_at) return 1;
      return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
    });
  }, [repairs, assets, users, assignments, search, statusFilter, repairStatusFilter, techFilter, incidentFilter, departmentFilter, dateFrom, dateTo]);

  const openCount = repairs.filter(r => !r.closed_at).length;
  const closedCount = repairs.filter(r => r.closed_at).length;

  const handleDelete = async (id: number) => {
    try {
      await api.delete('repairs', id);
      toast.success('Reparación eliminada');
      refresh();
    } catch { toast.error('Error al eliminar'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const clearFilters = () => {
    setStatusFilter('all');
    setRepairStatusFilter('all');
    setTechFilter('all');
    setIncidentFilter('all');
    setDepartmentFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  };

  const hasActiveFilters = statusFilter !== 'all' || repairStatusFilter !== 'all' || techFilter !== 'all' || incidentFilter !== 'all' || departmentFilter !== 'all' || dateFrom || dateTo || search;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
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
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por equipo, serial, diagnóstico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({repairs.length})</SelectItem>
              <SelectItem value="open">Abiertas ({openCount})</SelectItem>
              <SelectItem value="closed">Cerradas ({closedCount})</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">Limpiar filtros</Button>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={repairStatusFilter} onValueChange={v => setRepairStatusFilter(v)}>
            <SelectTrigger className="w-44 text-xs h-8"><SelectValue placeholder="Estado reparación" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {repairStatuses.sort((a, b) => a.sort_order - b.sort_order).map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={incidentFilter} onValueChange={v => setIncidentFilter(v)}>
            <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Tipo incidencia" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {(Object.entries(INCIDENT_TYPES) as [IncidentType, string][]).map(([code, label]) => (
                <SelectItem key={code} value={code}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={techFilter} onValueChange={v => setTechFilter(v)}>
            <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Técnico" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los técnicos</SelectItem>
              {technicians.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={v => setDepartmentFilter(v)}>
            <SelectTrigger className="w-40 text-xs h-8"><SelectValue placeholder="Departamento" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los deptos.</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 text-xs w-32" placeholder="Desde" />
            <span className="text-xs text-muted-foreground">—</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 text-xs w-32" placeholder="Hasta" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Serial</th>
              <th>Estado rep.</th>
              <th>Tipo</th>
              <th>Diagnóstico</th>
              <th>Acción</th>
              <th>Técnico</th>
              <th>Proveedor</th>
              <th>Costo</th>
              <th>Garantía</th>
              <th>F. Inicio</th>
              <th>F. Cierre</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const asset = assets.find(a => a.id === r.asset_id);
              const isOpen = !r.closed_at;
              const repairStatus = getRepairStatusById(r.repair_status_id);
              const technician = getTechnicianById(r.technician_id);
              return (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{asset?.brand} {asset?.model}</p>
                      <p className="text-xs text-muted-foreground">{asset?.type}</p>
                    </div>
                  </td>
                  <td className="text-xs font-mono">{asset?.serial_number || '—'}</td>
                  <td>
                    {repairStatus ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: repairStatus.color }} />
                        {repairStatus.label}
                      </Badge>
                    ) : (
                      <Badge variant={isOpen ? 'destructive' : 'secondary'} className="text-[10px]">
                        {isOpen ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    )}
                  </td>
                  <td className="text-xs">{r.incident_type ? INCIDENT_TYPES[r.incident_type as IncidentType] || r.incident_type : '—'}</td>
                  <td className="text-xs text-muted-foreground max-w-[150px] truncate">{r.diagnosis || '—'}</td>
                  <td className="text-xs text-muted-foreground max-w-[150px] truncate">{r.action_performed || '—'}</td>
                  <td className="text-xs">{technician?.name || '—'}</td>
                  <td className="text-xs">{r.provider || '—'}</td>
                  <td className="text-xs">{r.cost !== null && r.cost !== undefined ? `€${Number(r.cost).toFixed(2)}` : '—'}</td>
                  <td>
                    {r.is_warranty ? (
                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-300 gap-1">
                        <Shield className="w-3 h-3" /> Sí
                      </Badge>
                    ) : <span className="text-xs text-muted-foreground">No</span>}
                  </td>
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
                <td colSpan={13} className="text-center text-muted-foreground py-12">
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
