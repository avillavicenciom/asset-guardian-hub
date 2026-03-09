import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Filter, MoreHorizontal, Settings2, GripVertical,
  RotateCcw, Download, RefreshCw, X, ChevronUp, ChevronDown, CheckCircle2,
  User, MapPin, Eye, EyeOff, Mail
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Assignment, DeliveryReasonCode, DELIVERY_REASONS } from '@/data/types';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/hooks/useRole';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription,
} from '@/components/ui/sheet';
import AssignAssetDialog from '@/components/AssignAssetDialog';
import ReturnAssetDialog from '@/components/ReturnAssetDialog';
import { downloadReceipt } from '@/utils/generateReceipt';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// ---------- Column definitions ----------

interface AssignmentColumnDef {
  key: string;
  label: string;
  defaultVisible: boolean;
  getValue: (a: Assignment, h: any) => string;
  render?: (a: Assignment, h: any) => React.ReactNode;
  width?: string;
}

const ALL_COLUMNS: AssignmentColumnDef[] = [
  {
    key: 'type',
    label: 'Tipo',
    defaultVisible: true,
    getValue: (a, h) => h.getAssetById(a.asset_id)?.type || '',
    width: 'min-w-[100px]',
  },
  {
    key: 'brand',
    label: 'Marca',
    defaultVisible: true,
    getValue: (a, h) => h.getAssetById(a.asset_id)?.brand || '',
    width: 'min-w-[100px]',
  },
  {
    key: 'model',
    label: 'Modelo',
    defaultVisible: true,
    getValue: (a, h) => h.getAssetById(a.asset_id)?.model || '',
    width: 'min-w-[140px]',
  },
  {
    key: 'serial',
    label: 'Serial',
    defaultVisible: true,
    getValue: (a, h) => h.getAssetById(a.asset_id)?.serial_number || '',
    render: (a, h) => <span className="text-sm">{h.getAssetById(a.asset_id)?.serial_number || '—'}</span>,
    width: 'min-w-[160px]',
  },
  {
    key: 'asset_tag',
    label: 'ID Inventario',
    defaultVisible: true,
    getValue: (a, h) => h.getAssetById(a.asset_id)?.asset_tag || '',
    render: (a, h) => <span className="text-sm">{h.getAssetById(a.asset_id)?.asset_tag || '—'}</span>,
    width: 'min-w-[110px]',
  },
  {
    key: 'assigned_to',
    label: 'Asignado a',
    defaultVisible: true,
    getValue: (a, h) => {
      if (a.user_id) {
        const user = h.getUserById(a.user_id);
        return user?.display_name || '';
      }
      return a.manual_user_name || '';
    },
    render: (a, h) => {
      const name = a.user_id ? h.getUserById(a.user_id)?.display_name : a.manual_user_name;
      if (!name) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-sm">{name}</span>
        </div>
      );
    },
    width: 'min-w-[160px]',
  },
  {
    key: 'operator',
    label: 'Operador',
    defaultVisible: true,
    getValue: (a) => {
      const op = operators.find(o => o.id === a.assigned_by_operator_id);
      return op?.name || '';
    },
    width: 'min-w-[140px]',
  },
  {
    key: 'date',
    label: 'Fecha',
    defaultVisible: true,
    getValue: (a) => new Date(a.assigned_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    width: 'min-w-[100px]',
  },
  {
    key: 'delivery_mode',
    label: 'Modo',
    defaultVisible: true,
    getValue: (a) => a.delivery_mode === 'SIGNED' ? 'Firmado' : 'Validado',
    render: (a) => (
      <span className={`text-sm px-2 py-0.5 rounded font-medium ${a.delivery_mode === 'SIGNED' ? 'bg-accent/10 text-accent' : 'bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))]'}`}>
        {a.delivery_mode === 'SIGNED' ? 'Firmado' : 'Validado'}
      </span>
    ),
    width: 'min-w-[100px]',
  },
  {
    key: 'reason',
    label: 'Motivo',
    defaultVisible: false,
    getValue: (a) => a.delivery_reason_code ? DELIVERY_REASONS[a.delivery_reason_code as DeliveryReasonCode] || a.delivery_reason_code : '',
    width: 'min-w-[160px]',
  },
  {
    key: 'status',
    label: 'Estado',
    defaultVisible: true,
    getValue: (a) => a.returned_at ? 'Devuelto' : 'Activa',
    render: (a) => a.returned_at ? (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><RotateCcw className="w-3 h-3" /> Devuelto</span>
    ) : (
      <span className="inline-flex items-center gap-1 text-sm text-[hsl(var(--status-assigned))] font-medium"><CheckCircle2 className="w-3 h-3" /> Activa</span>
    ),
    width: 'min-w-[100px]',
  },
  {
    key: 'location',
    label: 'Ubicación',
    defaultVisible: false,
    getValue: (a, h) => {
      const asset = h.getAssetById(a.asset_id);
      if (!asset?.location_id) return '';
      const loc = h.getLocationById(asset.location_id);
      return loc ? `${loc.country}, ${loc.site}, ${loc.center}` : '';
    },
    render: (a, h) => {
      const asset = h.getAssetById(a.asset_id);
      if (!asset?.location_id) return <span className="text-muted-foreground">—</span>;
      const loc = h.getLocationById(asset.location_id);
      if (!loc) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-sm">{loc.site}, {loc.center}</span>
        </div>
      );
    },
    width: 'min-w-[180px]',
  },
];

// ---------- Config persistence ----------

const STORAGE_KEY = 'assignment-columns-config';

interface ColumnsConfig {
  visible: string[];
  order: string[];
}

function getDefaultConfig(): ColumnsConfig {
  return {
    visible: ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.key),
    order: ALL_COLUMNS.map(c => c.key),
  };
}

function loadConfig(): ColumnsConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultConfig();
}

function saveConfig(config: ColumnsConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// ---------- Column Settings panel ----------

function ColumnSettings({ config, onChange }: { config: ColumnsConfig; onChange: (c: ColumnsConfig) => void }) {
  const orderedColumns = config.order.map(key => ALL_COLUMNS.find(c => c.key === key)!).filter(Boolean);

  const toggleVisible = (key: string) => {
    const next = config.visible.includes(key) ? config.visible.filter(k => k !== key) : [...config.visible, key];
    onChange({ ...config, visible: next });
  };

  const moveColumn = (key: string, direction: 'up' | 'down') => {
    const idx = config.order.indexOf(key);
    if (direction === 'up' && idx > 0) {
      const newOrder = [...config.order];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      onChange({ ...config, order: newOrder });
    } else if (direction === 'down' && idx < config.order.length - 1) {
      const newOrder = [...config.order];
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
      onChange({ ...config, order: newOrder });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Reordena y activa/desactiva columnas.</p>
        <Button variant="ghost" size="sm" onClick={() => onChange(getDefaultConfig())} className="gap-1.5 text-xs">
          <RotateCcw className="w-3 h-3" /> Restablecer
        </Button>
      </div>
      <div className="space-y-1">
        {orderedColumns.map((col, idx) => (
          <div key={col.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
            <Checkbox checked={config.visible.includes(col.key)} onCheckedChange={() => toggleVisible(col.key)} id={`acol-${col.key}`} />
            <label htmlFor={`acol-${col.key}`} className="flex-1 text-sm cursor-pointer select-none">{col.label}</label>
            <div className="flex gap-0.5">
              <button onClick={() => moveColumn(col.key, 'up')} disabled={idx === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => moveColumn(col.key, 'down')} disabled={idx === orderedColumns.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Filter row ----------

function ColumnFilterRow({ columns, filters, onFilterChange }: {
  columns: AssignmentColumnDef[];
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}) {
  return (
    <tr className="bg-muted/30">
      <th className="px-2 py-1.5 w-10"></th>
      {columns.map(col => (
        <th key={col.key} className="px-2 py-1.5">
          <div className="relative">
            <Input
              value={filters[col.key] || ''}
              onChange={e => onFilterChange(col.key, e.target.value)}
              placeholder="Filtrar..."
              className="h-7 text-xs bg-card border-border/60 px-2"
            />
            {filters[col.key] && (
              <button onClick={() => onFilterChange(col.key, '')} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </th>
      ))}
      <th className="px-2 py-1.5 w-10"></th>
    </tr>
  );
}

// ---------- Main page ----------

export default function AssignmentsPage() {
  const { assignments, getAssetById, getUserById, getStatusById, getStatusClass, getLocationById } = useData();
  const { canManageAssets } = useRole();
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [columnsConfig, setColumnsConfig] = useState<ColumnsConfig>(loadConfig);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returningAssignment, setReturningAssignment] = useState<Assignment | null>(null);

  const helpers = useMemo(() => ({ getAssetById, getUserById, getStatusById, getStatusClass, getLocationById }), [getAssetById, getUserById, getStatusById, getStatusClass, getLocationById]);

  useEffect(() => { saveConfig(columnsConfig); }, [columnsConfig]);

  const activeColumns = useMemo(() => {
    return columnsConfig.order
      .filter(key => columnsConfig.visible.includes(key))
      .map(key => ALL_COLUMNS.find(c => c.key === key)!)
      .filter(Boolean);
  }, [columnsConfig]);

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const q = search.toLowerCase();
      if (q) {
        const allText = activeColumns.map(c => c.getValue(a, helpers)).join(' ').toLowerCase();
        if (!allText.includes(q)) return false;
      }
      for (const col of activeColumns) {
        const filterVal = columnFilters[col.key];
        if (filterVal) {
          const cellVal = col.getValue(a, helpers).toLowerCase();
          if (!cellVal.includes(filterVal.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [search, columnFilters, assignments, activeColumns, helpers]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (filtered.every(i => prev.has(i.id))) return new Set();
      return new Set(filtered.map(i => i.id));
    });
  }, [filtered]);

  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length;
  const clearAllFilters = () => { setColumnFilters({}); setSearch(''); };
  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id));

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asignaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Historial de entregas y devoluciones · {assignments.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          {canManageAssets && (
            <Button className="gap-2" onClick={() => setShowAssignDialog(true)}>
              <Plus className="w-4 h-4" /> Nueva asignación
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar en todas las columnas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" />
            {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}
            <X className="w-3 h-3 ml-1" />
          </Button>
        )}

        {selectedIds.size > 0 && (
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Refrescar"><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Exportar"><Download className="w-4 h-4" /></Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" title="Configurar columnas"><Settings2 className="w-4 h-4" /></Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Configurar columnas</SheetTitle>
                <SheetDescription>Personaliza las columnas de la tabla de asignaciones.</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <ColumnSettings config={columnsConfig} onChange={setColumnsConfig} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>

      {/* Data grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-3 w-10">
                  <Checkbox checked={allSelected} onCheckedChange={handleToggleSelectAll} />
                </th>
                {activeColumns.map(col => (
                  <th key={col.key} className={`text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-3 ${col.width || ''}`}>
                    {col.label}
                  </th>
                ))}
                <th className="w-10 px-3 py-3"></th>
              </tr>
              <ColumnFilterRow columns={activeColumns} filters={columnFilters} onFilterChange={handleFilterChange} />
            </thead>
            <tbody>
              {filtered.map((assignment, i) => (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50 ${selectedIds.has(assignment.id) ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <Checkbox checked={selectedIds.has(assignment.id)} onCheckedChange={() => handleToggleSelect(assignment.id)} />
                  </td>
                  {activeColumns.map(col => (
                    <td key={col.key} className="px-3 py-2.5">
                      {col.render ? col.render(assignment, helpers) : (
                        <span className="text-muted-foreground">{col.getValue(assignment, helpers) || '—'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const asset = getAssetById(assignment.asset_id);
                            const user = assignment.user_id ? getUserById(assignment.user_id) : undefined;
                            downloadReceipt({ assignment, asset, user });
                            toast.success('Acuse de recibo descargado', {
                              description: 'Adjunta este archivo al correo SMTP para enviar al usuario.',
                            });
                          }}
                          className="gap-2"
                        >
                          <Mail className="w-4 h-4" /> Descargar acuse de recibo
                        </DropdownMenuItem>
                        {!assignment.returned_at && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setReturningAssignment(assignment);
                                setReturnDialogOpen(true);
                              }}
                              className="gap-2"
                            >
                              <RotateCcw className="w-4 h-4" /> Registrar devolución
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={activeColumns.length + 2} className="text-center py-12 text-muted-foreground">
                    No se encontraron asignaciones con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      <p className="text-xs text-muted-foreground mt-3">{filtered.length} de {assignments.length} registros</p>

      <AssignAssetDialog open={showAssignDialog} onOpenChange={setShowAssignDialog} />
      <ReturnAssetDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        assignment={returningAssignment}
      />
    </div>
  );
}
