import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department } from '@/data/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export default function CreateUserDialog({ open, onOpenChange, onCreated }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
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
    if (open) {
      api.getAll<Department>('departments').then(setDepartments).catch(() => {});
    }
  }, [open]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.display_name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await api.create('users', {
        display_name: form.display_name.trim(),
        email: form.email.trim() || null,
        username: form.username.trim() || null,
        department: form.department || null,
        site: form.site.trim() || null,
        contract_end: form.contract_end || null,
      });
      toast.success('Usuario creado correctamente');
      setForm({ display_name: '', email: '', username: '', department: '', site: '', contract_end: '' });
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid gap-1.5">
            <Label htmlFor="display_name">Nombre completo *</Label>
            <Input id="display_name" value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="Juan Pérez" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="juan@empresa.com" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" value={form.username} onChange={e => update('username', e.target.value)} placeholder="jperez" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Departamento</Label>
              <Select value={form.department} onValueChange={v => update('department', v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="site">Ubicación</Label>
              <Input id="site" value={form.site} onChange={e => update('site', e.target.value)} placeholder="Oficina Central" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contract_end">Fecha fin de contrato</Label>
            <Input id="contract_end" type="date" value={form.contract_end} onChange={e => update('contract_end', e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Crear usuario'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
