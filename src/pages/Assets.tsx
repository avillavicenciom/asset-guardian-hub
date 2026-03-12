import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Search, Plus, Filter, MoreHorizontal, Monitor, Laptop, Tablet, Printer,
  Server as ServerIcon, Headphones, Camera, HardDrive, Usb, ScanLine, Cable,
  Settings2, GripVertical, Eye, EyeOff, RotateCcw, Download, RefreshCw, X,
  ChevronUp, ChevronDown, Tag, MapPin, User, Upload } from
'lucide-react';
import { useData } from '@/hooks/useData';
import { Asset, AssetCategory } from '@/data/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AssignAssetDialog from '@/components/AssignAssetDialog';
import ImportAssetsDialog from '@/components/ImportAssetsDialog';
import CreateAssetDialog from '@/components/CreateAssetDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/hooks/useRole';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from
'@/components/ui/sheet';

const typeIcons: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-4 h-4" />,
  Monitor: <Monitor className="w-4 h-4" />,
  Tablet: <Tablet className="w-4 h-4" />,
  Desktop: <ServerIcon className="w-4 h-4" />,
  Impresora: <Printer className="w-4 h-4" />,
  Headset: <Headphones className="w-4 h-4" />,
  Webcam: <Camera className="w-4 h-4" />,
  Dock: <Cable className="w-4 h-4" />,
  'Disco externo': <HardDrive className="w-4 h-4" />,
  Adaptador: <Usb className="w-4 h-4" />,
  'Escáner': <ScanLine className="w-4 h-4" />
};

// Column definitions
export interface ColumnDef {
  key: string;
  label: string;
  defaultVisible: boolean;
  getValue: (asset: Asset, helpers: any) => string;
  render?: (asset: Asset, helpers: any) => React.ReactNode;
  width?: string;
}

const STORAGE_KEY = 'asset-columns-config';
const CONFIG_VERSION = 2; // Bump when columns change to reset stale configs

const ALL_COLUMNS: ColumnDef[] = [
{
  key: 'type',
  label: 'Tipo',
  defaultVisible: true,
  getValue: (a) => a.type,
  render: (a) => <span className="text-sm">{a.type}</span>,

  width: 'min-w-[120px]'
},
{
  key: 'brand',
  label: 'Marca',
  defaultVisible: true,
  getValue: (a) => a.brand || '',
  width: 'min-w-[120px]'
},
{
  key: 'model',
  label: 'Modelo',
  defaultVisible: true,
  getValue: (a) => a.model || '',
  width: 'min-w-[150px]'
},
{
  key: 'serial',
  label: 'Serial',
  defaultVisible: true,
  getValue: (a) => a.serial_number,
  render: (a) => <span className="text-sm">{a.serial_number}</span>,
  width: 'min-w-[170px]'
},
{
  key: 'sgad',
  label: 'SGAD',
  defaultVisible: true,
  getValue: (a) => (a as any).sgad || '',
  render: (a) => <span className="text-sm">{(a as any).sgad || '—'}</span>,
  width: 'min-w-[120px]'
},
{
  key: 'asset_tag',
  label: 'ID Inventario',
  defaultVisible: true,
  getValue: (a) => a.asset_tag || '',
  render: (a) => <span className="text-sm">{a.asset_tag || '—'}</span>,
  width: 'min-w-[120px]'
},
{
  key: 'status',
  label: 'Estado',
  defaultVisible: true,
  getValue: (a, h) => h.getStatusById(a.status_id)?.label || '',
  render: (a, h) => {
    const status = h.getStatusById(a.status_id);
    if (!status) return null;
    const isAssigned = status.code === 'ASIGNADO';
    const isAvailable = status.code === 'DISPONIBLE';
    const colorClass = isAssigned
      ? 'text-[hsl(var(--status-assigned))]'
      : isAvailable
      ? 'text-[hsl(var(--status-available))]'
      : 'text-muted-foreground';
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-medium ${colorClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status.label}
      </span>
    );
  },
  width: 'min-w-[140px]'
},
{
  key: 'assigned_to',
  label: 'Asignado a',
  defaultVisible: true,
  getValue: (a, h) => h.getAssignedUserName(a.id) || 'Disponible',
  render: (a, h) => {
    const name = h.getAssignedUserName(a.id);
    if (!name) {
      const status = h.getStatusById(a.status_id);
      return <span className="text-sm text-muted-foreground italic">{status?.code === 'DISPONIBLE' ? 'Disponible' : '—'}</span>;
    }
    return (
      <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-sm">{name}</span>
        </div>);

  },
  width: 'min-w-[160px]'
},
{
  key: 'location',
  label: 'Ubicación',
  defaultVisible: true,
  getValue: (a, h) => {
    if (!a.location_id) return '';
    const loc = h.getLocationById(a.location_id);
    return loc ? `${loc.country} ${loc.site} ${loc.center}` : '';
  },
  render: (a, h) => {
    if (!a.location_id) return <span className="text-muted-foreground">—</span>;
    const loc = h.getLocationById(a.location_id);
    if (!loc) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
          <span className="text-sm">{loc.country}, {loc.site}, {loc.center}</span>
        </div>);

  },
  width: 'min-w-[200px]'
},
{
  key: 'tags',
  label: 'Tags',
  defaultVisible: true,
  getValue: (a) => (a.tags || []).join(', '),
  render: (a) => {
    if (!a.tags || a.tags.length === 0) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
          {a.tags.map((tag) =>
        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">{tag}</Badge>
        )}
        </div>);

  },
  width: 'min-w-[150px]'
},
{
  key: 'notes',
  label: 'Notas',
  defaultVisible: false,
  getValue: (a) => a.notes || '',
  render: (a) => <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{a.notes || '—'}</span>,
  width: 'min-w-[200px]'
},
{
  key: 'created_at',
  label: 'Fecha creación',
  defaultVisible: false,
  getValue: (a) => new Date(a.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
  width: 'min-w-[120px]'
},
{
  key: 'updated_at',
  label: 'Última actualización',
  defaultVisible: false,
  getValue: (a) => new Date(a.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
  width: 'min-w-[140px]'
}];


interface ColumnsConfig {
  visible: string[];
  order: string[];
  version?: number;
}

function getDefaultConfig(): ColumnsConfig {
  return {
    visible: ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key),
    order: ALL_COLUMNS.map((c) => c.key),
    version: CONFIG_VERSION,
  };
}

function loadConfig(): ColumnsConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reset if config version is outdated
      if (parsed.version !== CONFIG_VERSION) return getDefaultConfig();
      return parsed;
    }
  } catch {}
  return getDefaultConfig();
}

function saveConfig(config: ColumnsConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Column settings panel
function ColumnSettings({
  config,
  onChange



}: {config: ColumnsConfig;onChange: (c: ColumnsConfig) => void;}) {
  const orderedColumns = config.order.map((key) => ALL_COLUMNS.find((c) => c.key === key)!).filter(Boolean);

  const toggleVisible = (key: string) => {
    const next = config.visible.includes(key) ?
    config.visible.filter((k) => k !== key) :
    [...config.visible, key];
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

  const resetConfig = () => onChange(getDefaultConfig());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Arrastra o usa las flechas para reordenar. Activa o desactiva columnas.</p>
        <Button variant="ghost" size="sm" onClick={resetConfig} className="gap-1.5 text-xs">
          <RotateCcw className="w-3 h-3" /> Restablecer
        </Button>
      </div>
      <div className="space-y-1">
        {orderedColumns.map((col, idx) =>
        <div
          key={col.key}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
          
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
            <Checkbox
            checked={config.visible.includes(col.key)}
            onCheckedChange={() => toggleVisible(col.key)}
            id={`col-${col.key}`} />
          
            <label htmlFor={`col-${col.key}`} className="flex-1 text-sm cursor-pointer select-none">
              {col.label}
            </label>
            <div className="flex gap-0.5">
              <button
              onClick={() => moveColumn(col.key, 'up')}
              disabled={idx === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
              
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
              onClick={() => moveColumn(col.key, 'down')}
              disabled={idx === orderedColumns.length - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
              
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}

// Per-column filter row
function ColumnFilterRow({
  columns,
  filters,
  onFilterChange




}: {columns: ColumnDef[];filters: Record<string, string>;onFilterChange: (key: string, value: string) => void;}) {
  return (
    <tr className="bg-muted/30">
      <th className="px-2 py-1.5 w-10"></th>
      {columns.map((col) =>
      <th key={col.key} className="px-2 py-1.5">
          <div className="relative">
            <Input
            value={filters[col.key] || ''}
            onChange={(e) => onFilterChange(col.key, e.target.value)}
            placeholder="Filtrar..."
            className="h-7 text-xs bg-card border-border/60 px-2" />
          
            {filters[col.key] &&
          <button
            onClick={() => onFilterChange(col.key, '')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted">
            
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
          }
          </div>
        </th>
      )}
      <th className="px-2 py-1.5 w-10"></th>
    </tr>);

}

// Main data-grid table
function AssetDataGrid({
  items,
  columns,
  helpers,
  filters,
  onFilterChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick










}: {items: Asset[];columns: ColumnDef[];helpers: any;filters: Record<string, string>;onFilterChange: (key: string, value: string) => void;selectedIds: Set<number>;onToggleSelect: (id: number) => void;onToggleSelectAll: () => void;onRowClick: (id: number) => void;}) {
  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-3 py-3 w-10">
                <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
              </th>
              {columns.map((col) =>
              <th key={col.key} className={`text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-3 ${col.width || ''}`}>
                  {col.label}
                </th>
              )}
              <th className="w-10 px-3 py-3"></th>
            </tr>
            <ColumnFilterRow columns={columns} filters={filters} onFilterChange={onFilterChange} />
          </thead>
          <tbody>
            {items.map((asset, i) =>
            <motion.tr
              key={asset.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.015 }}
              className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50 ${selectedIds.has(asset.id) ? 'bg-primary/5' : ''}`}
              onClick={() => onRowClick(asset.id)}>
              
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selectedIds.has(asset.id)} onCheckedChange={() => onToggleSelect(asset.id)} />
                </td>
                {columns.map((col) =>
              <td key={col.key} className="px-3 py-2.5">
                    {col.render ? col.render(asset, helpers) :
                <span className="text-muted-foreground">{col.getValue(asset, helpers) || '—'}</span>
                }
                  </td>
              )}
                <td className="px-3 py-2.5">
                  <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </motion.tr>
            )}
            {items.length === 0 &&
            <tr>
                <td colSpan={columns.length + 2} className="text-center py-12 text-muted-foreground">
                  No se encontraron registros con los filtros aplicados
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </motion.div>);

}

export default function AssetsPage() {
  const navigate = useNavigate();
  const { assets, statuses, getStatusById, getStatusClass, getLocationById, getAssignedUserName } = useData();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'equipos' | 'perifericos'>('equipos');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [columnsConfig, setColumnsConfig] = useState<ColumnsConfig>(loadConfig);
  const { canManageAssets } = useRole();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignAssetId, setAssignAssetId] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const existingSerials = useMemo(() => new Set(assets.map((a) => a.serial_number.toLowerCase())), [assets]);

  const helpers = useMemo(() => ({ getStatusById, getStatusClass, getLocationById, getAssignedUserName }), [getStatusById, getStatusClass, getLocationById, getAssignedUserName]);

  // Save config on change
  useEffect(() => {saveConfig(columnsConfig);}, [columnsConfig]);

  const categoryFilter: AssetCategory = activeTab === 'equipos' ? 'EQUIPO' : 'PERIFERICO';
  const categoryAssets = useMemo(() => assets.filter((a) => a.category === categoryFilter), [assets, categoryFilter]);

  const equipoCount = useMemo(() => assets.filter((a) => a.category === 'EQUIPO').length, [assets]);
  const perifericoCount = useMemo(() => assets.filter((a) => a.category === 'PERIFERICO').length, [assets]);

  // Active columns based on config
  const activeColumns = useMemo(() => {
    return columnsConfig.order.
    filter((key) => columnsConfig.visible.includes(key)).
    map((key) => ALL_COLUMNS.find((c) => c.key === key)!).
    filter(Boolean);
  }, [columnsConfig]);

  // Filter by global search + per-column filters
  const filtered = useMemo(() => {
    return categoryAssets.filter((a) => {
      // Global search
      const q = search.toLowerCase();
      if (q) {
        const allText = activeColumns.map((c) => c.getValue(a, helpers)).join(' ').toLowerCase();
        if (!allText.includes(q)) return false;
      }
      // Per-column filters
      for (const col of activeColumns) {
        const filterVal = columnFilters[col.key];
        if (filterVal) {
          const cellVal = col.getValue(a, helpers).toLowerCase();
          if (!cellVal.includes(filterVal.toLowerCase())) return false;
        }
      }
      return true;
    });
  }, [search, columnFilters, categoryAssets, activeColumns, helpers]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'equipos' | 'perifericos');
    setColumnFilters({});
    setSelectedIds(new Set());
  };

  const handleFilterChange = useCallback((key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else
      next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (filtered.every((i) => prev.has(i.id))) return new Set();
      return new Set(filtered.map((i) => i.id));
    });
  }, [filtered]);

  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length;

  const clearAllFilters = () => {
    setColumnFilters({});
    setSearch('');
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos y Periféricos</h1>
          <p className="text-sm text-muted-foreground mt-1">{assets.length} activos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {canManageAssets &&
          <>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowImportDialog(true)}>
                <Upload className="w-4 h-4" /> Importar CSV
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => {setAssignAssetId(null);setShowAssignDialog(true);}}>
                <User className="w-4 h-4" /> Asignar
              </Button>
              <Button className="gap-2" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4" /> Nuevo activo</Button>
            </>
          }
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="equipos" className="gap-2"><Laptop className="w-3.5 h-3.5" /> Equipos ({equipoCount})</TabsTrigger>
          <TabsTrigger value="perifericos" className="gap-2"><Headphones className="w-3.5 h-3.5" /> Periféricos ({perifericoCount})</TabsTrigger>
        </TabsList>

        {/* Toolbar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar en todas las columnas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {activeFilterCount > 0 &&
          <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5" />
              {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}
              <X className="w-3 h-3 ml-1" />
            </Button>
          }

          {selectedIds.size > 0 &&
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
            </span>
          }

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Refrescar">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Exportar">
              <Download className="w-4 h-4" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" title="Configurar columnas">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Configurar columnas</SheetTitle>
                  <SheetDescription>Personaliza qué columnas se muestran y en qué orden.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <ColumnSettings config={columnsConfig} onChange={setColumnsConfig} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        <TabsContent value="equipos" className="mt-4">
          <AssetDataGrid
            items={filtered}
            columns={activeColumns}
            helpers={helpers}
            filters={columnFilters}
            onFilterChange={handleFilterChange}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onRowClick={(id) => navigate(`/assets/${id}`)} />
          
          <p className="text-xs text-muted-foreground mt-3">{filtered.length} de {categoryAssets.length} registros</p>
        </TabsContent>
        <TabsContent value="perifericos" className="mt-4">
          <AssetDataGrid
            items={filtered}
            columns={activeColumns}
            helpers={helpers}
            filters={columnFilters}
            onFilterChange={handleFilterChange}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onRowClick={(id) => navigate(`/assets/${id}`)} />
          
          <p className="text-xs text-muted-foreground mt-3">{filtered.length} de {categoryAssets.length} registros</p>
        </TabsContent>
      </Tabs>

      <AssignAssetDialog open={showAssignDialog} onOpenChange={setShowAssignDialog} preselectedAssetId={assignAssetId} />
      <ImportAssetsDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        existingSerials={existingSerials}
        onImport={(newAssets) => {
          toast.success(`${newAssets.length} activos importados`);
          return { imported: newAssets, skipped: [] };
        }} />
      
      <CreateAssetDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={() => window.location.reload()}
        defaultCategory={activeTab === 'equipos' ? 'EQUIPO' : 'PERIFERICO'}
      />
    </div>);

}