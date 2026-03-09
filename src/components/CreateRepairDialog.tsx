import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Asset, Technician, RepairStatus, HardwarePart, IncidentType, INCIDENT_TYPES } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useData } from '@/hooks/useData';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  preselectedAssetId?: number;
}

export default function CreateRepairDialog({ open, onOpenChange, onCreated, preselectedAssetId }: Props) {
  const { assets, getStatusById } = useData();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [repairStatuses, setRepairStatuses] = useState<RepairStatus[]>([]);
  const [hardwareParts, setHardwareParts] = useState<HardwarePart[]>([]);
  const [saving, setSaving] = useState(false);

  const [serialSearch, setSerialSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [selectedParts, setSelectedParts] = useState<{ part_id: number; quantity: number; action: string }[]>([]);
  const [form, setForm] = useState({
    diagnosis: '',
    action_performed: '',
    provider: '',
    ticket_ref: '',
    technician_id: '',
    repair_status_id: '',
    incident_type: '' as string,
    is_warranty: false,
    cost: '',
  });

  useEffect(() => {
    if (open) {
      Promise.all([
        api.getAll<Technician>('technicians'),
        api.getAll<RepairStatus>('repair-statuses'),
        api.getAll<HardwarePart>('hardware-parts'),
      ]).then(([t, rs, hp]) => {
        setTechnicians(t);
        setRepairStatuses(rs);
        setHardwareParts(hp);
      }).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open && preselectedAssetId) {
      setSelectedAssetId(preselectedAssetId);
      const asset = assets.find(a => a.id === preselectedAssetId);
      if (asset) setSerialSearch(asset.serial_number);
    }
    if (!open) {
      setSerialSearch('');
      setSelectedAssetId(null);
      setSelectedParts([]);
      setForm({ diagnosis: '', action_performed: '', provider: '', ticket_ref: '', technician_id: '', repair_status_id: '', incident_type: '', is_warranty: false, cost: '' });
    }
  }, [open, preselectedAssetId, assets]);

  const searchResults = useMemo(() => {
    if (!serialSearch.trim() || selectedAssetId) return [];
    const q = serialSearch.toLowerCase();
    return assets.filter(a =>
      a.serial_number.toLowerCase().includes(q) ||
      (a.asset_tag && a.asset_tag.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [serialSearch, assets, selectedAssetId]);

  const selectedAsset = useMemo(() =>
    selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null
  , [selectedAssetId, assets]);

  const activeTechnicians = technicians.filter(t => t.is_active);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAssetId(asset.id);
    setSerialSearch(asset.serial_number);
  };

  const clearAsset = () => { setSelectedAssetId(null); setSerialSearch(''); };

  const addPart = () => setSelectedParts(p => [...p, { part_id: 0, quantity: 1, action: 'REPLACED' }]);
  const removePart = (idx: number) => setSelectedParts(p => p.filter((_, i) => i !== idx));
  const updatePart = (idx: number, field: string, value: any) => setSelectedParts(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const handleSave = async () => {
    if (!selectedAssetId) { toast.error('Debes seleccionar un equipo'); return; }
    setSaving(true);
    try {
      const repairData: any = {
        asset_id: selectedAssetId,
        diagnosis: form.diagnosis.trim() || null,
        action_performed: form.action_performed.trim() || null,
        provider: form.provider.trim() || null,
        ticket_ref: form.ticket_ref.trim() || null,
        technician_id: form.technician_id ? Number(form.technician_id) : null,
        repair_status_id: form.repair_status_id ? Number(form.repair_status_id) : null,
        incident_type: form.incident_type || null,
        is_warranty: form.is_warranty,
        cost: form.cost ? Number(form.cost) : null,
      };

      const created = await api.create<any>('repairs', repairData);

      // Create repair parts
      for (const part of selectedParts) {
        if (part.part_id > 0) {
          await api.create('repair-parts', { repair_id: created.id, part_id: part.part_id, quantity: part.quantity, action: part.action });
        }
      }

      // Update asset status to EN_REPARACION
      const repairStatus = await api.getAll<{ id: number; code: string }>('statuses')
        .then(statuses => statuses.find(s => s.code === 'EN_REPARACION'));
      if (repairStatus) {
        await api.update('assets', selectedAssetId, { status_id: repairStatus.id });
      }

      toast.success('Reparación creada — el equipo pasó a estado "En reparación"');
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear reparación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva reparación</DialogTitle>
          <DialogDescription>Registra todos los datos de la reparación del equipo.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          {/* Asset search */}
          <div className="grid gap-1.5">
            <Label>Equipo (buscar por serial o ID inventario) *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={serialSearch} onChange={e => { setSerialSearch(e.target.value); if (selectedAssetId) clearAsset(); }} placeholder="Escribe el número de serie..." className="pl-9" />
            </div>
            {searchResults.length > 0 && !selectedAssetId && (
              <div className="border rounded-lg bg-popover shadow-md max-h-48 overflow-y-auto">
                {searchResults.map(a => {
                  const status = getStatusById(a.status_id);
                  return (
                    <button key={a.id} className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b last:border-b-0 flex items-center justify-between" onClick={() => handleSelectAsset(a)}>
                      <div>
                        <p className="text-sm font-medium">{a.brand} {a.model}</p>
                        <p className="text-xs text-muted-foreground">Serial: {a.serial_number} {a.asset_tag ? `· ${a.asset_tag}` : ''}</p>
                      </div>
                      {status && <Badge variant="outline" className="text-[10px] shrink-0">{status.label}</Badge>}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedAsset && (
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 border">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{selectedAsset.brand} {selectedAsset.model}</p>
                  <p className="text-xs text-muted-foreground">{selectedAsset.type} · Serial: {selectedAsset.serial_number}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearAsset} className="text-xs">Cambiar</Button>
              </div>
            )}
            {serialSearch.trim() && searchResults.length === 0 && !selectedAssetId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <AlertCircle className="w-4 h-4" /><span>No se encontró equipo con ese serial</span>
              </div>
            )}
          </div>

          {/* Row: Status + Incident type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Estado de reparación</Label>
              <Select value={form.repair_status_id} onValueChange={v => setForm(f => ({ ...f, repair_status_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {repairStatuses.sort((a, b) => a.sort_order - b.sort_order).map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tipo de incidencia</Label>
              <Select value={form.incident_type} onValueChange={v => setForm(f => ({ ...f, incident_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(INCIDENT_TYPES) as [IncidentType, string][]).map(([code, label]) => (
                    <SelectItem key={code} value={code}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row: Technician + Ticket */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Técnico asignado</Label>
              <Select value={form.technician_id} onValueChange={v => setForm(f => ({ ...f, technician_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {activeTechnicians.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name} {t.is_external ? '(Ext.)' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Referencia / Ticket</Label>
              <Input value={form.ticket_ref} onChange={e => setForm(f => ({ ...f, ticket_ref: e.target.value }))} placeholder="REP-001" />
            </div>
          </div>

          {/* Row: Provider + Cost + Warranty */}
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Proveedor externo</Label>
              <Input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="Nombre" />
            </div>
            <div className="grid gap-1.5">
              <Label>Costo (€)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="grid gap-1.5">
              <Label>¿Garantía?</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch checked={form.is_warranty} onCheckedChange={v => setForm(f => ({ ...f, is_warranty: v }))} />
                <span className="text-sm text-muted-foreground">{form.is_warranty ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="grid gap-1.5">
            <Label>Diagnóstico</Label>
            <Textarea value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Describe el problema..." rows={2} />
          </div>

          {/* Action performed */}
          <div className="grid gap-1.5">
            <Label>Acción realizada</Label>
            <Textarea value={form.action_performed} onChange={e => setForm(f => ({ ...f, action_performed: e.target.value }))} placeholder="Describe la acción o solución aplicada..." rows={2} />
          </div>

          {/* Parts */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Piezas cambiadas</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPart} className="text-xs">+ Añadir pieza</Button>
            </div>
            {selectedParts.map((p, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
                <Select value={String(p.part_id || '')} onValueChange={v => updatePart(idx, 'part_id', Number(v))}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Pieza..." /></SelectTrigger>
                  <SelectContent>
                    {hardwareParts.map(hp => (
                      <SelectItem key={hp.id} value={String(hp.id)}>{hp.name} ({hp.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={p.quantity} onChange={e => updatePart(idx, 'quantity', Number(e.target.value))} className="text-xs" />
                <Select value={p.action} onValueChange={v => updatePart(idx, 'action', v)}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPLACED">Reemplazada</SelectItem>
                    <SelectItem value="ADDED">Añadida</SelectItem>
                    <SelectItem value="REMOVED">Retirada</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePart(idx)}>×</Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !selectedAssetId}>{saving ? 'Creando...' : 'Crear reparación'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
