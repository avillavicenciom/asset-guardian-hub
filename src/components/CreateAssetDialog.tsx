import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useData } from '@/hooks/useData';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  defaultCategory?: 'EQUIPO' | 'PERIFERICO';
}

export default function CreateAssetDialog({ open, onOpenChange, onCreated, defaultCategory = 'EQUIPO' }: Props) {
  const { statuses, assetTypes } = useData();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    asset_tag: '',
    serial_number: '',
    category: defaultCategory,
    type: '',
    brand: '',
    model: '',
    status_id: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    if (open) {
      setForm(prev => ({ ...prev, category: defaultCategory }));
    }
  }, [open, defaultCategory]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const filteredTypes = assetTypes?.filter(t => t.category === form.category) || [];
  const defaultStatus = statuses?.find(s => s.code === 'DISPONIBLE');

  const handleSave = async () => {
    if (!form.serial_number.trim()) {
      toast.error('El número de serie es obligatorio');
      return;
    }
    if (!form.type) {
      toast.error('El tipo es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await api.create('assets', {
        asset_tag: form.asset_tag.trim() || null,
        serial_number: form.serial_number.trim(),
        category: form.category,
        type: form.type,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        status_id: form.status_id ? Number(form.status_id) : (defaultStatus?.id || 1),
        notes: form.notes.trim() || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      toast.success('Activo creado correctamente');
      setForm({ asset_tag: '', serial_number: '', category: defaultCategory, type: '', brand: '', model: '', status_id: '', notes: '', tags: '' });
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear activo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo activo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Categoría *</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUIPO">Equipo</SelectItem>
                  <SelectItem value="PERIFERICO">Periférico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={v => update('type', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {filteredTypes.map(t => (
                    <SelectItem key={t.id} value={t.label}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Número de serie *</Label>
              <Input value={form.serial_number} onChange={e => update('serial_number', e.target.value)} placeholder="SN123456" />
            </div>
            <div className="grid gap-1.5">
              <Label>ID Inventario</Label>
              <Input value={form.asset_tag} onChange={e => update('asset_tag', e.target.value)} placeholder="INV-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Marca</Label>
              <Input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="HP, Lenovo..." />
            </div>
            <div className="grid gap-1.5">
              <Label>Modelo</Label>
              <Input value={form.model} onChange={e => update('model', e.target.value)} placeholder="ProBook 450..." />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Estado inicial</Label>
            <Select value={form.status_id} onValueChange={v => update('status_id', v)}>
              <SelectTrigger><SelectValue placeholder={defaultStatus?.label || 'Seleccionar...'} /></SelectTrigger>
              <SelectContent>
                {statuses?.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Tags (separados por coma)</Label>
            <Input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="oficina, piso3" />
          </div>
          <div className="grid gap-1.5">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Observaciones..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Crear activo'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
