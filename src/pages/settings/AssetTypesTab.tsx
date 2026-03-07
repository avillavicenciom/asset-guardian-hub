import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AssetType, AssetCategory } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AssetTypesTab() {
  const [types, setTypes] = useState<AssetType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AssetType | null>(null);
  const [form, setForm] = useState<Partial<AssetType>>({});

  const fetchData = useCallback(async () => {
    try {
      setTypes(await api.getAll<AssetType>('asset-types'));
    } catch { toast.error('Error al cargar tipos'); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => { setEditing(null); setForm({ code: '', label: '', category: 'EQUIPO' }); setDialogOpen(true); };
  const openEdit = (t: AssetType) => { setEditing(t); setForm({ ...t }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.update('asset-types', editing.id, form);
        toast.success('Tipo actualizado');
      } else {
        await api.create('asset-types', form);
        toast.success('Tipo creado');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Error al guardar'); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete('asset-types', id); toast.success('Tipo eliminado'); fetchData(); }
    catch { toast.error('Error al eliminar'); }
  };

  const equipos = types.filter(t => t.category === 'EQUIPO');
  const perifericos = types.filter(t => t.category === 'PERIFERICO');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Categorías de equipos y periféricos disponibles.</p>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ title: 'Equipos', items: equipos }, { title: 'Periféricos', items: perifericos }].map(group => (
          <div key={group.title} className="bg-card rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold">{group.title}</h3>
            </div>
            <div className="divide-y">
              {group.items.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t.label}</span>
                    <Badge variant="outline" className="text-[10px]">{t.code}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {group.items.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">Sin tipos definidos</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tipo' : 'Nuevo tipo de equipo'}</DialogTitle>
            <DialogDescription>Define una categoría de activo (laptop, monitor, etc.)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Código (ej: TELEFONO)</Label>
              <Input value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Etiqueta visible</Label>
              <Input value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={form.category || 'EQUIPO'} onValueChange={v => setForm(f => ({ ...f, category: v as AssetCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUIPO">Equipo</SelectItem>
                  <SelectItem value="PERIFERICO">Periférico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.code || !form.label}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
