import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { StatusCatalog } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function StatusesTab() {
  const [statuses, setStatuses] = useState<StatusCatalog[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StatusCatalog | null>(null);
  const [form, setForm] = useState<Partial<StatusCatalog>>({});

  const fetchData = useCallback(async () => {
    try {
      setStatuses(await api.getAll<StatusCatalog>('statuses'));
    } catch { toast.error('Error al cargar estados'); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => { setEditing(null); setForm({ code: '', label: '', is_terminal: false }); setDialogOpen(true); };
  const openEdit = (s: StatusCatalog) => { setEditing(s); setForm({ ...s }); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.update('statuses', editing.id, form);
        toast.success('Estado actualizado');
      } else {
        await api.create('statuses', form);
        toast.success('Estado creado');
      }
      setDialogOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message || 'Error al guardar'); }
  };

  const handleDelete = async (id: number) => {
    try { await api.delete('statuses', id); toast.success('Estado eliminado'); fetchData(); }
    catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Define los estados disponibles para los activos.</p>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo estado
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Etiqueta</th>
              <th>¿Terminal?</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {statuses.map(s => (
              <tr key={s.id}>
                <td><code className="text-xs bg-muted px-2 py-0.5 rounded">{s.code}</code></td>
                <td className="font-medium">{s.label}</td>
                <td>{s.is_terminal ? <span className="text-xs text-destructive font-medium">Sí</span> : <span className="text-xs text-muted-foreground">No</span>}</td>
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
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar estado' : 'Nuevo estado'}</DialogTitle>
            <DialogDescription>Un estado terminal indica que el activo ya no está en circulación.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Código (ej: EN_PRESTAMO)</Label>
              <Input value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Etiqueta visible</Label>
              <Input value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_terminal || false} onCheckedChange={v => setForm(f => ({ ...f, is_terminal: v }))} />
              <Label>Estado terminal (baja definitiva)</Label>
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
