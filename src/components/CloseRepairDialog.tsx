import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Warehouse, UserCheck, ArrowUpCircle, Wrench } from 'lucide-react';
import { Repair, Asset, User, Location } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useData } from '@/hooks/useData';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repair: Repair | null;
  onClosed: () => void;
}

type Outcome = 'warehouse' | 'assign' | 'upgrade';

export default function CloseRepairDialog({ open, onOpenChange, repair, onClosed }: Props) {
  const { assets, users, locations, statuses } = useData();
  const [saving, setSaving] = useState(false);

  const [outcome, setOutcome] = useState<Outcome>('warehouse');
  const [warehouseId, setWarehouseId] = useState('');
  const [userId, setUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [finalCost, setFinalCost] = useState('');

  const asset = useMemo(() =>
    repair ? assets.find(a => a.id === repair.asset_id) : null
  , [repair, assets]);

  const warehouses = useMemo(() =>
    locations.filter(l => l.location_type === 'ALMACEN')
  , [locations]);

  useEffect(() => {
    if (open && repair) {
      setOutcome('warehouse');
      setWarehouseId('');
      setUserId('');
      setNotes('');
      setFinalCost(repair.cost?.toString() || '');
    }
  }, [open, repair]);

  const getStatusByCode = (code: string) => statuses.find(s => s.code === code);

  const handleClose = async () => {
    if (!repair || !asset) return;

    if (outcome === 'warehouse' && !warehouseId) {
      toast.error('Selecciona el almacén de destino');
      return;
    }
    if (outcome === 'assign' && !userId) {
      toast.error('Selecciona el usuario a asignar');
      return;
    }

    setSaving(true);
    try {
      // Close the repair
      await api.update('repairs', repair.id, {
        closed_at: new Date().toISOString(),
        cost: finalCost ? Number(finalCost) : repair.cost,
        diagnosis: notes ? `${repair.diagnosis || ''}\n\n[Cierre] ${notes}`.trim() : repair.diagnosis,
      });

      // Update asset based on outcome
      if (outcome === 'warehouse') {
        const availableStatus = getStatusByCode('DISPONIBLE');
        await api.update('assets', asset.id, {
          status_id: availableStatus?.id || 1,
          location_id: Number(warehouseId),
        });
        toast.success('Reparación cerrada — equipo enviado a almacén');
      } else if (outcome === 'assign') {
        const assignedStatus = getStatusByCode('POR_ASIGNAR');
        await api.update('assets', asset.id, {
          status_id: assignedStatus?.id || 7,
        });
        // Note: The actual assignment would be done through the assignment flow
        toast.success('Reparación cerrada — equipo listo para asignar');
      } else if (outcome === 'upgrade') {
        const availableStatus = getStatusByCode('DISPONIBLE');
        await api.update('assets', asset.id, {
          status_id: availableStatus?.id || 1,
        });
        toast.success('Reparación cerrada como upgrade — equipo actualizado');
      }

      onOpenChange(false);
      onClosed();
    } catch (err: any) {
      toast.error(err.message || 'Error al cerrar reparación');
    } finally {
      setSaving(false);
    }
  };

  if (!repair || !asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cerrar reparación</DialogTitle>
          <DialogDescription>
            {asset.brand} {asset.model} · Serial: {asset.serial_number}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-3">
          {/* Outcome selection */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">¿Qué hacer con el equipo?</Label>
            <RadioGroup value={outcome} onValueChange={v => setOutcome(v as Outcome)} className="grid gap-2">
              <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${outcome === 'warehouse' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <RadioGroupItem value="warehouse" />
                <Warehouse className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Enviar a almacén</p>
                  <p className="text-xs text-muted-foreground">El equipo se repara y vuelve al inventario</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${outcome === 'assign' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <RadioGroupItem value="assign" />
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Preparar para asignar a usuario</p>
                  <p className="text-xs text-muted-foreground">El equipo pasa a "Por asignar" para entregarlo</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${outcome === 'upgrade' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                <RadioGroupItem value="upgrade" />
                <ArrowUpCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Upgrade (mejora de hardware)</p>
                  <p className="text-xs text-muted-foreground">Se mejoró RAM, almacenamiento u otro componente</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Conditional fields based on outcome */}
          {outcome === 'warehouse' && (
            <div className="grid gap-1.5">
              <Label>Almacén de destino *</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
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
          )}

          {outcome === 'assign' && (
            <div className="grid gap-1.5">
              <Label>Usuario a asignar *</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar usuario..." /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.display_name} {u.department ? `— ${u.department}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Costo final (€)</Label>
              <input
                type="number"
                step="0.01"
                value={finalCost}
                onChange={e => setFinalCost(e.target.value)}
                placeholder="0.00"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Observaciones de cierre</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas sobre el resultado de la reparación..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleClose} disabled={saving}>
            {saving ? 'Cerrando...' : 'Cerrar reparación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
