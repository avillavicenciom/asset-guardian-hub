import { useState, useMemo } from 'react';
import { Search, User, Wrench, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/hooks/useData';

import { DeliveryReasonCode, DELIVERY_REASONS } from '@/data/types';

type AssignTo = 'user' | 'technician';

interface AssignAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedAssetId?: number | null;
}

export default function AssignAssetDialog({ open, onOpenChange, preselectedAssetId }: AssignAssetDialogProps) {
  const { assets, users, statuses, operators, getStatusById } = useData();

  const [assignTo, setAssignTo] = useState<AssignTo>('user');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(preselectedAssetId?.toString() || '');
  const hasPreselected = !!preselectedAssetId;
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState<'SIGNED' | 'TECH_VALIDATED'>('SIGNED');
  const [reasonCode, setReasonCode] = useState<string>('');
  const [reasonText, setReasonText] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Available assets: DISPONIBLE or POR_ASIGNAR
  const availableAssets = useMemo(() => {
    return assets.filter(a => {
      const status = getStatusById(a.status_id);
      return status?.code === 'DISPONIBLE' || status?.code === 'POR_ASIGNAR';
    }).filter(a => {
      if (!assetSearch) return true;
      const q = assetSearch.toLowerCase();
      return `${a.brand} ${a.model} ${a.serial_number} ${a.asset_tag}`.toLowerCase().includes(q);
    });
  }, [assets, getStatusById, assetSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u => u.display_name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, userSearch]);

  const techOperators = operators.filter(o => o.role === 'TECH' && o.is_active);

  const canSubmit = selectedAssetId && (
    (assignTo === 'user' && selectedUserId) ||
    (assignTo === 'technician' && selectedOperatorId)
  );

  const handleSubmit = () => {
    // In mock mode, just close — would create assignment + update status
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setAssignTo('user');
    setSelectedAssetId(preselectedAssetId?.toString() || '');
    setSelectedUserId('');
    setSelectedOperatorId('');
    setDeliveryMode('SIGNED');
    setReasonCode('');
    setReasonText('');
    setAssetSearch('');
    setUserSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar equipo</DialogTitle>
          <DialogDescription>Asigna un equipo a un usuario final o a un técnico para plataformado.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Asset selection - hidden when preselected */}
          {hasPreselected ? (
            <div className="space-y-2">
              <Label>Equipo</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {(() => {
                    const a = assets.find(a => a.id === preselectedAssetId);
                    return a ? `${a.brand} ${a.model} — ${a.serial_number}` : 'Equipo seleccionado';
                  })()}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Equipo</Label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Buscar equipo..." value={assetSearch} onChange={e => setAssetSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                <SelectTrigger>
                  <Package className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Seleccionar equipo" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map(a => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.brand} {a.model} — {a.serial_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assign to toggle */}
          <div className="space-y-2">
            <Label>Asignar a</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={assignTo === 'user' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setAssignTo('user')}
              >
                <User className="w-3.5 h-3.5" /> Usuario final
              </Button>
              <Button
                type="button"
                variant={assignTo === 'technician' ? 'default' : 'outline'}
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => setAssignTo('technician')}
              >
                <Wrench className="w-3.5 h-3.5" /> Técnico
              </Button>
            </div>
          </div>

          {assignTo === 'user' ? (
            <div className="space-y-2">
              <Label>Usuario</Label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input placeholder="Buscar usuario..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.display_name} — {u.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Técnico</Label>
              <Select value={selectedOperatorId} onValueChange={setSelectedOperatorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar técnico" />
                </SelectTrigger>
                <SelectContent>
                  {techOperators.map(o => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">El equipo pasará a estado "Por asignar" hasta que se entregue al usuario final.</p>
            </div>
          )}

          {/* Delivery mode */}
          {assignTo === 'user' && (
            <>
              <div className="space-y-2">
                <Label>Modo de entrega</Label>
                <Select value={deliveryMode} onValueChange={(v) => setDeliveryMode(v as 'SIGNED' | 'TECH_VALIDATED')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIGNED">Firmado por usuario</SelectItem>
                    <SelectItem value="TECH_VALIDATED">Validado por técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryMode === 'TECH_VALIDATED' && (
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Select value={reasonCode} onValueChange={setReasonCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DELIVERY_REASONS).map(([code, label]) => (
                        <SelectItem key={code} value={code}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Detalle adicional..." value={reasonText} onChange={e => setReasonText(e.target.value)} rows={2} />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {assignTo === 'technician' ? 'Asignar a técnico' : 'Asignar equipo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
