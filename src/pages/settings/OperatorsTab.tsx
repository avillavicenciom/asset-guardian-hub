import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, ShieldCheck, Eye, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Operator, Permission, ALL_PERMISSIONS, PERMISSION_LABELS, PERMISSION_GROUPS } from '@/data/types';
import { api } from '@/lib/api';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TECH: 'Técnico',
  READONLY: 'Solo lectura',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  TECH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  READONLY: 'bg-muted text-muted-foreground border-border',
};

export default function OperatorsTab() {
  const { isAdmin } = useRole();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Operator | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    role: 'TECH' as 'ADMIN' | 'TECH' | 'READONLY',
    permissions: [] as Permission[],
  });

  const fetchOperators = useCallback(async () => {
    try {
      const data = await api.getAll<Operator>('operators');
      setOperators(data);
    } catch {
      toast.error('Error al cargar operadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOperators(); }, [fetchOperators]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', email: '', username: '', role: 'TECH', permissions: [] });
    setDialogOpen(true);
  };

  const openEdit = (op: Operator) => {
    setEditing(op);
    setForm({
      name: op.name,
      email: op.email,
      username: op.username,
      role: op.role,
      permissions: [...op.permissions],
    });
    setDialogOpen(true);
  };

  const togglePermission = (perm: Permission) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleGroup = (perms: Permission[]) => {
    const allSelected = perms.every(p => form.permissions.includes(p));
    setForm(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !perms.includes(p))
        : [...new Set([...prev.permissions, ...perms])],
    }));
  };

  const save = async () => {
    if (!form.name || !form.email || !form.username) return;
    try {
      const payload = {
        name: form.name,
        email: form.email,
        username: form.username,
        role: form.role,
        permissions: form.role === 'ADMIN' ? [] : form.permissions,
      };
      if (editing) {
        await api.update('operators', editing.id, payload);
        toast.success('Operador actualizado');
      } else {
        await api.create('operators', payload);
        toast.success('Operador creado');
      }
      setDialogOpen(false);
      fetchOperators();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      await api.update('operators', id, { is_active: !currentActive });
      fetchOperators();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Gestiona los operadores del sistema y sus permisos
        </p>
        {isAdmin && (
          <Button size="sm" className="gap-2" onClick={openNew}>
            <Plus className="w-4 h-4" /> Nuevo operador
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Operador</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Rol</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Permisos</th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Estado</th>
              {isAdmin && <th className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {operators.map(op => {
              const permCount = op.role === 'ADMIN' ? ALL_PERMISSIONS.length : op.permissions.length;
              return (
                <tr key={op.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{op.name}</p>
                      <p className="text-xs text-muted-foreground">{op.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[op.role]}`}>
                      {op.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {ROLE_LABELS[op.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {op.role === 'ADMIN' ? 'Todos los permisos' : `${permCount} permiso${permCount !== 1 ? 's' : ''}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={op.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {op.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(op)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(op.id, op.is_active)}>
                          {op.is_active ? <X className="w-3.5 h-3.5 text-destructive" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar operador' : 'Nuevo operador'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre completo" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Usuario</Label>
                <Input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@empresa.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rol</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v as typeof p.role }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="TECH">Técnico</SelectItem>
                  <SelectItem value="READONLY">Solo lectura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.role !== 'ADMIN' && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Permisos</Label>
                {PERMISSION_GROUPS.map(group => {
                  const allSelected = group.permissions.every(p => form.permissions.includes(p));
                  const someSelected = group.permissions.some(p => form.permissions.includes(p));
                  return (
                    <div key={group.label} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                          onCheckedChange={() => toggleGroup(group.permissions)}
                        />
                        <span className="text-xs font-semibold">{group.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-6">
                        {group.permissions.map(perm => (
                          <div key={perm} className="flex items-center gap-2">
                            <Checkbox
                              checked={form.permissions.includes(perm)}
                              onCheckedChange={() => togglePermission(perm)}
                            />
                            <span className="text-xs text-muted-foreground">{PERMISSION_LABELS[perm]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {form.role === 'ADMIN' && (
              <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                Los administradores tienen acceso completo a todas las funcionalidades del sistema.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.name || !form.email || !form.username}>
              {editing ? 'Guardar cambios' : 'Crear operador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
