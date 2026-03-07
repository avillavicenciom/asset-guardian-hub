import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Navigate } from 'react-router-dom';

export default function AuditPage() {
  const { auditLog } = useAuth();
  const { canViewAudit } = useRole();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!canViewAudit) return [];
    if (!search) return auditLog;
    const q = search.toLowerCase();
    return auditLog.filter(e =>
      e.operator_name.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.module.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q)
    );
  }, [search, auditLog, canViewAudit]);

  if (!canViewAudit) return <Navigate to="/" replace />;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-sm text-muted-foreground mt-1">{auditLog.length} acciones registradas</p>
        </div>
      </div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por operador, acción, módulo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">No hay registros de auditoría aún</p>
          <p className="text-xs mt-1">Las acciones se registrarán al usar el sistema</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Operador</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('es-ES', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </td>
                  <td className="font-medium text-sm">{entry.operator_name}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      entry.action === 'LOGIN' || entry.action === 'LOGOUT'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="text-sm">{entry.module}</td>
                  <td className="text-xs text-muted-foreground max-w-xs truncate">{entry.details}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
