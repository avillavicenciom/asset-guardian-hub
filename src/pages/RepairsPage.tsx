import { motion } from 'framer-motion';
import { Wrench, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { useData } from '@/hooks/useData';

export default function RepairsPage() {
  const { repairs, getAssetById } = useData();

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reparaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">{repairs.length} reparaciones registradas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {repairs.map((r, i) => {
          const asset = getAssetById(r.asset_id);
          const isOpen = !r.closed_at;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isOpen ? 'bg-[hsl(38,92%,50%)]/10' : 'bg-muted'}`}>
                    <Wrench className={`w-4 h-4 ${isOpen ? 'text-[hsl(38,92%,50%)]' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{asset?.brand} {asset?.model}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset?.serial_number}</p>
                  </div>
                </div>
                <span className={`status-badge ${isOpen ? 'status-repair' : 'status-available'}`}>
                  {isOpen ? 'Abierta' : 'Cerrada'}
                </span>
              </div>
              {r.diagnosis && <p className="text-sm text-muted-foreground mb-3">{r.diagnosis}</p>}
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {r.provider && <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {r.provider}</span>}
                {r.ticket_ref && <span className="flex items-center gap-1 font-mono">Ref: {r.ticket_ref}</span>}
                {r.cost !== null && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {r.cost.toFixed(2)} €</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(r.opened_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
