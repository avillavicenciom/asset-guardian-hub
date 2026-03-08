import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Asset, Technician } from '@/data/types';
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
  const [saving, setSaving] = useState(false);

  const [serialSearch, setSerialSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [form, setForm] = useState({
    diagnosis: '',
    provider: '',
    ticket_ref: '',
    technician_id: '',
    cost: '',
  });

  useEffect(() => {
    api.getAll<Technician>('technicians').then(setTechnicians).catch(() => {});
  }, []);

  useEffect(() => {
    if (open && preselectedAssetId) {
      setSelectedAssetId(preselectedAssetId);
      const asset = assets.find(a => a.id === preselectedAssetId);
      if (asset) setSerialSearch(asset.serial_number);
    }
    if (!open) {
      setSerialSearch('');
      setSelectedAssetId(null);
      setForm({ diagnosis: '', provider: '', ticket_ref: '', technician_id: '', cost: '' });
    }
  }, [open, preselectedAssetId, assets]);

  // Search assets by serial number
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

  const clearAsset = () => {
    setSelectedAssetId(null);
    setSerialSearch('');
  };

  const handleSave = async () => {
    if (!selectedAssetId) {
      toast.error('Debes seleccionar un equipo');
      return;
    }
    setSaving(true);
    try {
      // Create the repair
      await api.create('repairs', {
        asset_id: selectedAssetId,
        diagnosis: form.diagnosis.trim() || null,
        provider: form.provider.trim() || null,
        ticket_ref: form.ticket_ref.trim() || null,
        technician_id: form.technician_id ? Number(form.technician_id) : null,
        cost: form.cost ? Number(form.cost) : null,
      });

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva reparación</DialogTitle>
          <DialogDescription>Selecciona el equipo por su número de serie y registra los datos de la reparación.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          {/* Asset search */}
          <div className="grid gap-1.5">
            <Label>Equipo (buscar por serial o ID inventario) *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={serialSearch}
                onChange={e => { setSerialSearch(e.target.value); if (selectedAssetId) clearAsset(); }}
                placeholder="Escribe el número de serie..."
                className="pl-9"
              />
            </div>
            {/* Search results dropdown */}
            {searchResults.length > 0 && !selectedAssetId && (
              <div className="border rounded-lg bg-popover shadow-md max-h-48 overflow-y-auto">
                {searchResults.map(a => {
                  const status = getStatusById(a.status_id);
                  return (
                    <button
                      key={a.id}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b last:border-b-0 flex items-center justify-between"
                      onClick={() => handleSelectAsset(a)}
                    >
                      <div>
                        <p className="text-sm font-medium">{a.brand} {a.model}</p>
                        <p className="text-xs text-muted-foreground">Serial: {a.serial_number} {a.asset_tag ? `· ${a.asset_tag}` : ''}</p>
                      </div>
                      {status && (
                        <Badge variant="outline" className="text-[10px] shrink-0">{status.label}</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {/* Selected asset confirmation */}
            {selectedAsset && (
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 border">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{selectedAsset.brand} {selectedAsset.model}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAsset.type} · Serial: {selectedAsset.serial_number}
                    {selectedAsset.asset_tag ? ` · ${selectedAsset.asset_tag}` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearAsset} className="text-xs">Cambiar</Button>
              </div>
            )}
            {serialSearch.trim() && searchResults.length === 0 && !selectedAssetId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <AlertCircle className="w-4 h-4" />
                <span>No se encontró equipo con ese serial</span>
              </div>
            )}
          </div>

          {/* Technician */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Técnico asignado</Label>
              <Select value={form.technician_id} onValueChange={v => setForm(f => ({ ...f, technician_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {activeTechnicians.map(t => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} {t.is_external ? '(Ext.)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Referencia / Ticket</Label>
              <Input value={form.ticket_ref} onChange={e => setForm(f => ({ ...f, ticket_ref: e.target.value }))} placeholder="REP-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Proveedor externo</Label>
              <Input value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="Nombre del proveedor" />
            </div>
            <div className="grid gap-1.5">
              <Label>Costo estimado (€)</Label>
              <Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0.00" />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Diagnóstico / Descripción</Label>
            <Textarea value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="Describe el problema o la razón de la reparación..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !selectedAssetId}>
            {saving ? 'Creando...' : 'Crear reparación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
