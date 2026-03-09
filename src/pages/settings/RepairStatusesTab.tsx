import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RepairStatus } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function RepairStatusesTab() {
  const [statuses, setStatuses] = useState<RepairStatus[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RepairStatus | null>(null);
  const [form, setForm] = useState<Partial<RepairStatus>>({});

  const fetchData = useCallback(async () => {
    try {
      setStatuses(await api.getAll<RepairStatus>('repair-statuses'));
    } catch { toast.error('Error al cargar estados de reparación'); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => { setEditing(null); setForm({ code: '', label: '', color: '#6b7280', sort_order: statuses.length + 1 }); setDialogOpen(true); };
  const openEdit = (s: RepairStatus) => { setEditing(s); setForm({ ...s }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.update('repair-statuses', editing.id, form);
        toast.success('Estado actualizado');
      } else {
        await api.create('repair-statuses', form);
        toast.success('Estado creado');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Error al guardar'); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete('repair-statuses', id); toast.success('Estado eliminado'); fetchData(); }
    catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Estados específicos para el flujo de reparaciones.</p>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo estado
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Color</th>
              <th>Código</th>
              <th>Etiqueta</th>
              <th>Orden</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {statuses.sort((a, b) => a.sort_order - b.sort_order).map(s => (
              <tr key={s.id}>
                <td><span className="inline-block w-4 h-4 rounded-full border" style={{ backgroundColor: s.color }} /></td>
                <td><code className="text-xs bg-muted px-2 py-0.5 rounded">{s.code}</code></td>
                <td className="font-medium">{s.label}</td>
                <td className="text-xs text-muted-foreground">{s.sort_order}</td>
                <td>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {statuses.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No hay estados de reparación</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar estado' : 'Nuevo estado de reparación'}</DialogTitle>
            <DialogDescription>Define los estados por los que pasa una reparación.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Código (ej: EN_DIAGNOSTICO)</Label>
              <Input value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Etiqueta visible</Label>
              <Input value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color || '#6b7280'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={form.color || ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order || ''} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
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
