import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Upload, Mail, Building2, MapPin, AlertTriangle, Clock, LayoutGrid, List, X, ArrowUpDown } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { User } from '@/data/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import ImportUsersDialog from '@/components/ImportUsersDialog';
import CreateUserDialog from '@/components/CreateUserDialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type UserType = 'interno' | 'externo' | 'becario' | 'estudiante';

function getUserType(email: string | null): UserType {
  if (!email) return 'interno';
  const local = email.toLowerCase();
  if (local.startsWith('ext-')) return 'externo';
  if (local.startsWith('beca-')) return 'becario';
  if (local.startsWith('est-')) return 'estudiante';
  return 'interno';
}

const USER_TYPE_LABELS: Record<UserType, string> = {
  interno: 'Interno',
  externo: 'Externo',
  becario: 'Becario',
  estudiante: 'Estudiante',
};

const USER_TYPE_VARIANTS: Record<UserType, string> = {
  interno: 'bg-primary/10 text-primary border-primary/20',
  externo: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  becario: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  estudiante: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

type ContractSort = '' | 'nearest' | 'farthest';

export default function UsersPage() {
  const { users } = useData();
  const [search, setSearch] = useState('');
  const { canManageUsers } = useRole();
  const [importOpen, setImportOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const [filterDept, setFilterDept] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterType, setFilterType] = useState('');
  const [contractSort, setContractSort] = useState<ContractSort>('');

  const departments = useMemo(() => [...new Set(users.map(u => u.department).filter(Boolean))].sort() as string[], [users]);
  const sites = useMemo(() => [...new Set(users.map(u => u.site).filter(Boolean))].sort() as string[], [users]);

  const activeFilters = [filterDept, filterSite, filterType, contractSort].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = users;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.display_name.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.site?.toLowerCase().includes(q)
      );
    }

    if (filterDept) result = result.filter(u => u.department === filterDept);
    if (filterSite) result = result.filter(u => u.site === filterSite);
    if (filterType) result = result.filter(u => getUserType(u.email) === filterType);

    if (contractSort) {
      result = [...result].sort((a, b) => {
        const da = a.contract_end ? new Date(a.contract_end).getTime() : Infinity;
        const db = b.contract_end ? new Date(b.contract_end).getTime() : Infinity;
        return contractSort === 'nearest' ? da - db : db - da;
      });
    }

    return result;
  }, [search, users, filterDept, filterSite, filterType, contractSort]);

  const clearFilters = () => {
    setFilterDept('');
    setFilterSite('');
    setFilterType('');
    setContractSort('');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} usuarios registrados</p>
        </div>
        {canManageUsers && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4" /> Importar CSV
            </Button>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Nuevo usuario</Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, email, departamento..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <ToggleGroup type="single" value={view} onValueChange={v => v && setView(v as 'cards' | 'table')} className="border rounded-lg p-0.5">
            <ToggleGroupItem value="cards" aria-label="Vista tarjetas" className="px-2.5 py-1.5 data-[state=on]:bg-muted">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Vista tabla" className="px-2.5 py-1.5 data-[state=on]:bg-muted">
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterSite} onValueChange={setFilterSite}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              {sites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Tipo usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interno">Interno</SelectItem>
              <SelectItem value="externo">Externo</SelectItem>
              <SelectItem value="becario">Becario</SelectItem>
              <SelectItem value="estudiante">Estudiante</SelectItem>
            </SelectContent>
          </Select>

          <Select value={contractSort} onValueChange={v => setContractSort(v as ContractSort)}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Ordenar contrato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest">Fecha más próxima</SelectItem>
              <SelectItem value="farthest">Fecha más lejana</SelectItem>
            </SelectContent>
          </Select>

          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-xs gap-1 text-muted-foreground">
              <X className="w-3.5 h-3.5" /> Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user, i) => {
            const daysLeft = user.contract_end ? getDaysUntil(user.contract_end) : null;
            const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
            const isExpired = daysLeft !== null && daysLeft < 0;
            const type = getUserType(user.email);
            return (
              <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-card rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer ${isExpiringSoon ? 'border-destructive/50 ring-1 ring-destructive/20' : ''} ${isExpired ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                    {user.display_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{user.display_name}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${USER_TYPE_VARIANTS[type]}`}>
                        {USER_TYPE_LABELS[type]}
                      </span>
                    </div>
                    {user.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Mail className="w-3 h-3" /> {user.email}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {user.department && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> {user.department}</p>}
                      {user.site && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.site}</p>}
                    </div>
                    {(isExpiringSoon || isExpired) && (
                      <p className={`text-xs mt-2 flex items-center gap-1 font-medium ${isExpired ? 'text-muted-foreground' : 'text-destructive'}`}>
                        {isExpired ? <><Clock className="w-3 h-3" /> Contrato finalizado</> : <><AlertTriangle className="w-3 h-3" /> Vence en {daysLeft} días</>}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Nombre</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Departamento</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Ubicación</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Contrato</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const daysLeft = user.contract_end ? getDaysUntil(user.contract_end) : null;
                  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                  const isExpired = daysLeft !== null && daysLeft < 0;
                  const type = getUserType(user.email);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className={`border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${isExpired ? 'opacity-60' : ''} ${isExpiringSoon ? 'bg-destructive/5' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                            {user.display_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="font-medium">{user.display_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${USER_TYPE_VARIANTS[type]}`}>
                          {USER_TYPE_LABELS[type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.department || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.site || '—'}</td>
                      <td className="px-4 py-3">
                        {isExpiringSoon ? (
                          <span className="text-xs text-destructive font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Vence en {daysLeft} días</span>
                        ) : isExpired ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Finalizado</span>
                        ) : user.contract_end ? (
                          <span className="text-xs text-muted-foreground">{new Date(user.contract_end).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">No se encontraron usuarios</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <ImportUsersDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={(imported) => {
          console.log('Usuarios importados:', imported);
        }}
      />
    </div>
  );
}
