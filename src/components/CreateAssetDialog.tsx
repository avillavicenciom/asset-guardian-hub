import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AssetType, AssetModel, Location } from '@/data/types';
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
  const { statuses, locations } = useData();
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [assetModels, setAssetModels] = useState<AssetModel[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    asset_tag: '',
    serial_number: '',
    sgad: '',
    category: defaultCategory,
    type: '',
    brand: '',
    model: '',
    status_id: '',
    location_id: '',
    notes: '',
    tags: '',
  });

  useEffect(() => {
    Promise.all([
      api.getAll<AssetType>('asset-types'),
      api.getAll<AssetModel>('asset-models'),
    ]).then(([t, m]) => {
      setAssetTypes(t);
      setAssetModels(m);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setForm(prev => ({ ...prev, category: defaultCategory }));
    }
  }, [open, defaultCategory]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const filteredTypes = assetTypes?.filter(t => t.category === form.category) || [];

  // Get the selected type's id to filter models
  const selectedTypeId = assetTypes.find(t => t.label === form.type)?.id;

  // Filter models by the selected asset type
  const modelsForType = useMemo(() => {
    if (!selectedTypeId) return [];
    return assetModels.filter(m => m.asset_type_id === selectedTypeId);
  }, [assetModels, selectedTypeId]);

  // Extract unique brands from filtered models
  const availableBrands = useMemo(() => {
    const brands = [...new Set(modelsForType.map(m => m.brand))].filter(Boolean).sort();
    return brands;
  }, [modelsForType]);

  // Filter models by selected brand
  const modelsForBrand = useMemo(() => {
    if (!form.brand) return [];
    return modelsForType.filter(m => m.brand === form.brand);
  }, [modelsForType, form.brand]);

  const defaultStatus = statuses?.find(s => s.code === 'DISPONIBLE');

  // Only statuses that can be manually set (exclude EN_REPARACION)
  const selectableStatuses = useMemo(() => {
    return statuses?.filter(s => s.code !== 'EN_REPARACION') || [];
  }, [statuses]);

  // Only warehouse-type locations
  const warehouses = useMemo(() => {
    return locations?.filter(l => l.location_type === 'ALMACEN') || [];
  }, [locations]);

  const handleTypeChange = (v: string) => {
    setForm(prev => ({ ...prev, type: v, brand: '', model: '' }));
  };

  const handleBrandChange = (v: string) => {
    setForm(prev => ({ ...prev, brand: v, model: '' }));
  };

  const handleModelChange = (v: string) => {
    setForm(prev => ({ ...prev, model: v }));
  };

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
        sgad: form.sgad.trim() || null,
        category: form.category,
        type: form.type,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        status_id: form.status_id ? Number(form.status_id) : (defaultStatus?.id || 1),
        location_id: form.location_id ? Number(form.location_id) : null,
        notes: form.notes.trim() || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      toast.success('Activo creado correctamente');
      setForm({ asset_tag: '', serial_number: '', sgad: '', category: defaultCategory, type: '', brand: '', model: '', status_id: '', location_id: '', notes: '', tags: '' });
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
              <Select value={form.type} onValueChange={handleTypeChange}>
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
              <Label>Marca {availableBrands.length > 0 && <span className="text-xs text-muted-foreground">(del catálogo)</span>}</Label>
              {availableBrands.length > 0 ? (
                <Select value={form.brand} onValueChange={handleBrandChange}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar marca..." /></SelectTrigger>
                  <SelectContent>
                    {availableBrands.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="HP, Lenovo..." />
              )}
            </div>
            <div className="grid gap-1.5">
              <Label>Modelo {modelsForBrand.length > 0 && <span className="text-xs text-muted-foreground">(del catálogo)</span>}</Label>
              {modelsForBrand.length > 0 ? (
                <Select value={form.model} onValueChange={handleModelChange}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar modelo..." /></SelectTrigger>
                  <SelectContent>
                    {modelsForBrand.map(m => (
                      <SelectItem key={m.id} value={m.model}>{m.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.model} onChange={e => update('model', e.target.value)} placeholder={form.brand ? 'Sin modelos cargados' : 'Selecciona marca primero'} />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Estado inicial</Label>
              <Select value={form.status_id} onValueChange={v => update('status_id', v)}>
                <SelectTrigger><SelectValue placeholder={defaultStatus?.label || 'Seleccionar...'} /></SelectTrigger>
                <SelectContent>
                  {selectableStatuses.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Almacén</Label>
              <Select value={form.location_id} onValueChange={v => update('location_id', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar almacén..." /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.center} {w.floor ? `(${w.floor})` : ''} — {w.site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
