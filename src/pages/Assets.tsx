import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, MoreHorizontal, Monitor, Laptop, Tablet, Printer, Server as ServerIcon, Headphones, Camera, HardDrive, Usb, ScanLine, Cable } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Asset, AssetCategory } from '@/data/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRole } from '@/hooks/useRole';

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
  'Escáner': <ScanLine className="w-4 h-4" />,
};

function AssetTable({ items, getStatusById, getStatusClass }: { items: Asset[]; getStatusById: (id: number) => any; getStatusClass: (code: string) => string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Serial / Etiqueta</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((asset, i) => {
              const status = getStatusById(asset.status_id);
              return (
                <motion.tr key={asset.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="cursor-pointer">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">{typeIcons[asset.type] || <Monitor className="w-4 h-4" />}</div>
                      <div><p className="font-medium">{asset.brand} {asset.model}</p></div>
                    </div>
                  </td>
                  <td>
                    <p className="font-mono text-xs">{asset.serial_number}</p>
                    {asset.asset_tag && <p className="text-xs text-muted-foreground">{asset.asset_tag}</p>}
                  </td>
                  <td className="text-muted-foreground">{asset.type}</td>
                  <td className="text-muted-foreground">{asset.location || '—'}</td>
                  <td>
                    {status && (
                      <span className={`status-badge ${getStatusClass(status.code)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron registros con los filtros aplicados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function AssetsPage() {
  const { assets, statuses, getStatusById, getStatusClass } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'equipos' | 'perifericos'>('equipos');
  const { canManageAssets } = useRole();

  const categoryFilter: AssetCategory = activeTab === 'equipos' ? 'EQUIPO' : 'PERIFERICO';
  const categoryAssets = useMemo(() => assets.filter(a => a.category === categoryFilter), [assets, categoryFilter]);
  const types = useMemo(() => [...new Set(categoryAssets.map(a => a.type))], [categoryAssets]);

  const equipoCount = useMemo(() => assets.filter(a => a.category === 'EQUIPO').length, [assets]);
  const perifericoCount = useMemo(() => assets.filter(a => a.category === 'PERIFERICO').length, [assets]);

  const filtered = useMemo(() => {
    return categoryAssets.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !search || a.serial_number.toLowerCase().includes(q) || a.asset_tag?.toLowerCase().includes(q) || a.brand?.toLowerCase().includes(q) || a.model?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || a.status_id === Number(statusFilter);
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [search, statusFilter, typeFilter, categoryAssets]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'equipos' | 'perifericos');
    setTypeFilter('all');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos y Periféricos</h1>
          <p className="text-sm text-muted-foreground mt-1">{assets.length} activos registrados</p>
        </div>
        {canManageAssets && (
          <Button className="gap-2"><Plus className="w-4 h-4" /> Nuevo activo</Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList>
          <TabsTrigger value="equipos" className="gap-2"><Laptop className="w-3.5 h-3.5" /> Equipos principales ({equipoCount})</TabsTrigger>
          <TabsTrigger value="perifericos" className="gap-2"><Headphones className="w-3.5 h-3.5" /> Periféricos ({perifericoCount})</TabsTrigger>
        </TabsList>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por serial, etiqueta, marca..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {statuses.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>

        <TabsContent value="equipos" className="mt-4">
          <AssetTable items={filtered} getStatusById={getStatusById} getStatusClass={getStatusClass} />
        </TabsContent>
        <TabsContent value="perifericos" className="mt-4">
          <AssetTable items={filtered} getStatusById={getStatusById} getStatusClass={getStatusClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
