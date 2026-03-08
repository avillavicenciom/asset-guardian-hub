import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Download, Monitor, User, Calendar } from 'lucide-react';
import { Assignment, Asset, User as UserType } from '@/data/types';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { downloadReturnReceipt } from '@/utils/generateReturnReceipt';

interface ReturnAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  onReturned?: () => void;
}

export default function ReturnAssetDialog({ open, onOpenChange, assignment, onReturned }: ReturnAssetDialogProps) {
  const { getAssetById, getUserById, refresh } = useData();
  const { currentOperator, addAuditEntry } = useAuth();
  const [observations, setObservations] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const asset = assignment ? getAssetById(assignment.asset_id) : undefined;
  const user = assignment?.user_id ? getUserById(assignment.user_id) : undefined;
  const userName = user?.display_name || assignment?.manual_user_name || '—';

  useEffect(() => {
    if (open) {
      setObservations('');
      setReturnDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleReturn = async () => {
    if (!assignment || !currentOperator) return;
    setLoading(true);
    try {
      await api.update('assignments', assignment.id, {
        returned_at: returnDate,
      });

      // Change asset status back to DISPONIBLE
      if (asset) {
        await api.update('assets', asset.id, {
          status_id: 1, // DISPONIBLE
        });
      }

      addAuditEntry(
        'DEVOLUCION',
        'assignments',
        `Devolución del activo ${asset?.asset_tag || asset?.serial_number || assignment.asset_id} por ${userName}`
      );

      toast.success('Devolución registrada correctamente');
      refresh();
      onReturned?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al registrar la devolución');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!assignment || !currentOperator) return;
    downloadReturnReceipt({
      assignment,
      asset,
      user,
      observations,
      returnDate,
      receivedByOperatorId: currentOperator.id,
    });
    toast.success('Acta de devolución descargada');
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Registrar Devolución
          </DialogTitle>
          <DialogDescription>
            Registra la devolución del equipo y genera el acta correspondiente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Asset info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              {asset?.type} — {asset?.brand} {asset?.model}
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>S/N: {asset?.serial_number}</span>
              {asset?.asset_tag && <span>ID: {asset.asset_tag}</span>}
            </div>
          </div>

          {/* User info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-muted-foreground" />
              {userName}
            </div>
            {user?.department && (
              <p className="text-xs text-muted-foreground mt-1">{user.department}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Asignado el: {new Date(assignment.assigned_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>

          <Separator />

          {/* Return date */}
          <div className="space-y-2">
            <Label htmlFor="return-date" className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Fecha de devolución
            </Label>
            <Input
              id="return-date"
              type="date"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
            />
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              placeholder="Estado del equipo, componentes faltantes, daños observados..."
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          {/* Operator info */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-3">
            <span className="font-medium text-foreground">Operador que recibe:</span> {currentOperator?.name || '—'}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="gap-2 flex-1"
              onClick={handleDownloadReceipt}
            >
              <Download className="w-4 h-4" /> Descargar acta
            </Button>
            <Button
              className="gap-2 flex-1"
              onClick={handleReturn}
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4" />
              {loading ? 'Registrando...' : 'Confirmar devolución'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
