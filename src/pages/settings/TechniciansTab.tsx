import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Phone, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { technicians as initialTechnicians } from '@/data/mockData';
import { Technician } from '@/data/types';

export default function TechniciansTab() {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Technician | null>(null);
  const [form, setForm] = useState<Partial<Technician>>({});

  const filtered = technicians.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${t.name} ${t.company} ${t.specialty}`.toLowerCase().includes(q);
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', specialty: '', company: '', is_external: false, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (t: Technician) => {
    setEditing(t);
    setForm({ ...t });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setTechnicians(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } as Technician : t));
    } else {
      const newId = Math.max(...technicians.map(t => t.id), 0) + 1;
      setTechnicians(prev => [...prev, { id: newId, ...form } as Technician]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar técnico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo técnico
        </Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Especialidad</th>
              <th>Empresa</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td className="font-medium">{t.name}</td>
                <td className="text-xs text-muted-foreground">{t.email}</td>
                <td className="text-xs">{t.phone || '—'}</td>
                <td className="text-xs">{t.specialty || '—'}</td>
                <td className="text-xs">{t.company || 'Interno'}</td>
                <td>
                  <Badge variant={t.is_external ? 'outline' : 'secondary'} className="text-[10px]">
                    {t.is_external ? 'Externo' : 'Interno'}
                  </Badge>
                </td>
                <td>
                  <Badge variant={t.is_active ? 'default' : 'secondary'} className="text-[10px]">
                    {t.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No se encontraron técnicos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar técnico' : 'Nuevo técnico'}</DialogTitle>
            <DialogDescription>Datos del técnico de reparación.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label><Mail className="w-3 h-3 inline mr-1" />Email</Label>
                <Input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label><Phone className="w-3 h-3 inline mr-1" />Teléfono</Label>
                <Input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value || null }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Especialidad</Label>
              <Input value={form.specialty || ''} onChange={e => setForm(f => ({ ...f, specialty: e.target.value || null }))} placeholder="Ej: Pantallas, hardware general..." />
            </div>
            <div className="space-y-1.5">
              <Label><Building2 className="w-3 h-3 inline mr-1" />Empresa</Label>
              <Input value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value || null }))} placeholder="Dejar vacío si es interno" />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_external || false} onCheckedChange={v => setForm(f => ({ ...f, is_external: v }))} />
                <Label>Externo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active !== false} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label>Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}