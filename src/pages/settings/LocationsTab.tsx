import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Warehouse, Building2, Server, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { locations as initialLocations } from '@/data/mockData';
import { Location, LocationType } from '@/data/types';

const locationTypeLabels: Record<LocationType, string> = {
  ALMACEN: 'Almacén',
  OFICINA: 'Oficina',
  DATACENTER: 'Datacenter',
  OTRO: 'Otro',
};

const locationTypeIcons: Record<LocationType, React.ReactNode> = {
  ALMACEN: <Warehouse className="w-3.5 h-3.5" />,
  OFICINA: <Building2 className="w-3.5 h-3.5" />,
  DATACENTER: <Server className="w-3.5 h-3.5" />,
  OTRO: <HelpCircle className="w-3.5 h-3.5" />,
};

const locationTypeBadgeClass: Record<LocationType, string> = {
  ALMACEN: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
  OFICINA: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
  DATACENTER: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400',
  OTRO: 'border-muted bg-muted/50 text-muted-foreground',
};

export default function LocationsTab() {
  const [items, setItems] = useState<Location[]>(initialLocations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [filter, setFilter] = useState('');

  const [country, setCountry] = useState('');
  const [site, setSite] = useState('');
  const [center, setCenter] = useState('');
  const [locationType, setLocationType] = useState<LocationType>('OFICINA');
  const [floor, setFloor] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setCountry(''); setSite(''); setCenter(''); setLocationType('OFICINA'); setFloor(''); setNotes('');
  };

  const openNew = () => { resetForm(); setEditing(null); setDialogOpen(true); };
  const openEdit = (loc: Location) => {
    setEditing(loc);
    setCountry(loc.country); setSite(loc.site); setCenter(loc.center);
    setLocationType(loc.location_type); setFloor(loc.floor || ''); setNotes(loc.notes || '');
    setDialogOpen(true);
  };

  const save = () => {
    if (!country.trim() || !site.trim() || !center.trim()) return;
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, country: country.trim(), site: site.trim(), center: center.trim(), location_type: locationType, floor: floor.trim() || null, notes: notes.trim() || null } : i));
    } else {
      const newId = Math.max(0, ...items.map(i => i.id)) + 1;
      setItems(prev => [...prev, { id: newId, country: country.trim(), site: site.trim(), center: center.trim(), location_type: locationType, floor: floor.trim() || null, notes: notes.trim() || null }]);
    }
    setDialogOpen(false);
  };

  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const filtered = items.filter(i =>
    `${i.country} ${i.site} ${i.center} ${i.floor || ''}`.toLowerCase().includes(filter.toLowerCase())
  );

  // Group by country → site
  const grouped = filtered.reduce<Record<string, Record<string, Location[]>>>((acc, loc) => {
    if (!acc[loc.country]) acc[loc.country] = {};
    if (!acc[loc.country][loc.site]) acc[loc.country][loc.site] = [];
    acc[loc.country][loc.site].push(loc);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Ubicaciones</h2>
          <Badge variant="secondary" className="text-xs">{items.length}</Badge>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Nueva ubicación</Button>
      </div>

      <Input placeholder="Buscar ubicación..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm" />

      <div className="space-y-6">
        {Object.entries(grouped).map(([countryName, sites]) => (
          <div key={countryName} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{countryName}</h3>
            {Object.entries(sites).map(([siteName, locs]) => (
              <div key={siteName} className="bg-card border rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold">{siteName}</p>
                <div className="space-y-1.5">
                  {locs.map(loc => (
                    <div key={loc.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className={`gap-1 text-[10px] shrink-0 ${locationTypeBadgeClass[loc.location_type]}`}>
                          {locationTypeIcons[loc.location_type]}
                          {locationTypeLabels[loc.location_type]}
                        </Badge>
                        <span className="text-sm font-medium">{loc.center}</span>
                        {loc.floor && <span className="text-xs text-muted-foreground">· {loc.floor}</span>}
                        {loc.notes && <span className="text-xs text-muted-foreground italic hidden sm:inline">— {loc.notes}</span>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loc)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(loc.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No se encontraron ubicaciones.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar ubicación' : 'Nueva ubicación'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>País *</Label>
                <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="España" />
              </div>
              <div className="space-y-1.5">
                <Label>Sede *</Label>
                <Input value={site} onChange={e => setSite(e.target.value)} placeholder="Madrid" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Centro / Nombre *</Label>
                <Input value={center} onChange={e => setCenter(e.target.value)} placeholder="Almacén Sótano" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={locationType} onValueChange={v => setLocationType(v as LocationType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFICINA">Oficina</SelectItem>
                    <SelectItem value="ALMACEN">Almacén</SelectItem>
                    <SelectItem value="DATACENTER">Datacenter</SelectItem>
                    <SelectItem value="OTRO">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Planta / Piso</Label>
              <Input value={floor} onChange={e => setFloor(e.target.value)} placeholder="Sótano -1" />
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detalles adicionales..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!country.trim() || !site.trim() || !center.trim()}>
              {editing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}