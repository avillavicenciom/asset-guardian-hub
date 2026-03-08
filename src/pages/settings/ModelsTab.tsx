import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Cpu, HardDrive, Monitor as MonitorIcon, ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AssetModel, AssetType } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ModelsTab() {
  const [models, setModels] = useState<AssetModel[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetModel | null>(null);
  const [form, setForm] = useState<Partial<AssetModel>>({});

  const fetchData = useCallback(async () => {
    try {
      const [m, t] = await Promise.all([
        api.getAll<AssetModel>('asset-models'),
        api.getAll<AssetType>('asset-types'),
      ]);
      setModels(m);
      setAssetTypes(t);
    } catch { toast.error('Error al cargar modelos'); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = models.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${m.brand} ${m.model}`.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing(null);
    setForm({ brand: '', model: '', asset_type_id: undefined, processor: '', ram_gb: null, storage: '', screen_size: '', os: '', notes: '' });
    setDialogOpen(true);
  };

  const openEdit = (m: AssetModel) => {
    setEditing(m);
    setForm({ ...m });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.update('asset-models', editing.id, form);
        toast.success('Modelo actualizado');
      } else {
        await api.create('asset-models', { ...form, photo_url: form.photo_url || null });
        toast.success('Modelo creado');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Error al guardar'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete('asset-models', id);
      toast.success('Modelo eliminado');
      fetchData();
    } catch { toast.error('Error al eliminar'); }
  };

  const getTypeName = (typeId: number) => assetTypes.find(t => t.id === typeId)?.label || '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar marca o modelo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo modelo
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Tipo</th>
              <th>Procesador</th>
              <th>RAM</th>
              <th>Almacenamiento</th>
              <th>Pantalla</th>
              <th>Foto</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id}>
                <td className="font-medium">{m.brand}</td>
                <td>{m.model}</td>
                <td>{getTypeName(m.asset_type_id)}</td>
                <td className="text-muted-foreground text-xs">{m.processor || '—'}</td>
                <td>{m.ram_gb ? `${m.ram_gb} GB` : '—'}</td>
                <td className="text-xs">{m.storage || '—'}</td>
                <td className="text-xs">{m.screen_size || '—'}</td>
                <td>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.model} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center text-muted-foreground py-8">No se encontraron modelos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar modelo' : 'Nuevo modelo'}</DialogTitle>
            <DialogDescription>Completa la información del modelo de equipo.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Tipo de equipo</Label>
              <Select value={form.asset_type_id?.toString() || ''} onValueChange={v => setForm(f => ({ ...f, asset_type_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  {assetTypes.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.label} ({t.category})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label><Cpu className="w-3 h-3 inline mr-1" />Procesador</Label>
              <Input value={form.processor || ''} onChange={e => setForm(f => ({ ...f, processor: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>RAM (GB)</Label>
              <Input type="number" value={form.ram_gb || ''} onChange={e => setForm(f => ({ ...f, ram_gb: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div className="space-y-1.5">
              <Label><HardDrive className="w-3 h-3 inline mr-1" />Almacenamiento</Label>
              <Input value={form.storage || ''} onChange={e => setForm(f => ({ ...f, storage: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label><MonitorIcon className="w-3 h-3 inline mr-1" />Pantalla</Label>
              <Input value={form.screen_size || ''} onChange={e => setForm(f => ({ ...f, screen_size: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Sistema operativo</Label>
              <Input value={form.os || ''} onChange={e => setForm(f => ({ ...f, os: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label><ImageIcon className="w-3 h-3 inline mr-1" />Foto</Label>
              <div
                className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors relative"
                onClick={() => document.getElementById('model-photo-input')?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = ev => setForm(f => ({ ...f, photo_url: ev.target?.result as string }));
                    reader.readAsDataURL(file);
                  }
                }}
              >
                {form.photo_url ? (
                  <div className="flex items-center gap-3">
                    <img src={form.photo_url} alt="Preview" className="w-12 h-12 rounded object-cover" />
                    <span className="text-xs text-muted-foreground flex-1">Clic o arrastra para cambiar</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, photo_url: null })); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">Clic o arrastra una imagen</p>
                  </>
                )}
                <input
                  id="model-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setForm(f => ({ ...f, photo_url: ev.target?.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Notas</Label>
              <Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.brand || !form.model || !form.asset_type_id}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
