import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUpdated: () => void;
}

export default function EditUserDialog({ open, onOpenChange, user, onUpdated }: Props) {
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    username: '',
    department: '',
    site: '',
    contract_end: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || '',
        email: user.email || '',
        username: user.username || '',
        department: user.department || '',
        site: user.site || '',
        contract_end: user.contract_end ? user.contract_end.split('T')[0] : '',
      });
    }
  }, [user]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user) return;
    if (!form.display_name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await api.update('users', user.id, {
        display_name: form.display_name.trim(),
        email: form.email.trim() || null,
        username: form.username.trim() || null,
        department: form.department.trim() || null,
        site: form.site.trim() || null,
        contract_end: form.contract_end || null,
      });
      toast.success('Usuario actualizado correctamente');
      onOpenChange(false);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid gap-1.5">
            <Label htmlFor="edit_display_name">Nombre completo *</Label>
            <Input id="edit_display_name" value={form.display_name} onChange={e => update('display_name', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit_email">Correo electrónico</Label>
            <Input id="edit_email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit_username">Nombre de usuario</Label>
            <Input id="edit_username" value={form.username} onChange={e => update('username', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit_department">Departamento</Label>
              <Input id="edit_department" value={form.department} onChange={e => update('department', e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit_site">Ubicación</Label>
              <Input id="edit_site" value={form.site} onChange={e => update('site', e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit_contract_end">Fecha fin de contrato</Label>
            <Input id="edit_contract_end" type="date" value={form.contract_end} onChange={e => update('contract_end', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
