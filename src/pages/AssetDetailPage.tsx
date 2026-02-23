import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Monitor, Laptop, Tablet, Printer, Server as ServerIcon,
  Headphones, Camera, HardDrive, Usb, ScanLine, Cable, MapPin, User,
  Mail, Building2, Hash, Wrench, XCircle, Tag, Calendar, Clock, FileText,
  ChevronRight, Shield
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { statusHistory as mockStatusHistory, operators as mockOperators, repairParts as mockRepairParts, hardwareParts as mockHardwareParts, technicians as mockTechnicians } from '@/data/mockData';

const typeIcons: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-6 h-6" />,
  Monitor: <Monitor className="w-6 h-6" />,
  Tablet: <Tablet className="w-6 h-6" />,
  Desktop: <ServerIcon className="w-6 h-6" />,
  Impresora: <Printer className="w-6 h-6" />,
  Headset: <Headphones className="w-6 h-6" />,
  Webcam: <Camera className="w-6 h-6" />,
  Dock: <Cable className="w-6 h-6" />,
  'Disco externo': <HardDrive className="w-6 h-6" />,
  Adaptador: <Usb className="w-6 h-6" />,
  'Escáner': <ScanLine className="w-6 h-6" />,
};

function InfoRow({ label, value, icon, valueClassName }: { label: string; value: string; icon?: React.ReactNode; valueClassName?: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="text-muted-foreground mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
        <p className={`text-sm font-medium mt-0.5 ${valueClassName || ''}`}>{value}</p>
      </div>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    assets, assignments, repairs, getStatusById, getStatusClass,
    getLocationById, getAssignedUserName, getUserById, getActiveAssignmentForAsset,
  } = useData();

  const asset = useMemo(() => assets.find(a => a.id === Number(id)), [assets, id]);
  const activeAssignment = useMemo(() => asset ? getActiveAssignmentForAsset(asset.id) : undefined, [asset, getActiveAssignmentForAsset]);
  const assignedUser = useMemo(() => activeAssignment?.user_id ? getUserById(activeAssignment.user_id) : undefined, [activeAssignment, getUserById]);
  const location = useMemo(() => asset?.location_id ? getLocationById(asset.location_id) : undefined, [asset, getLocationById]);
  const status = useMemo(() => asset ? getStatusById(asset.status_id) : undefined, [asset, getStatusById]);
  const assetRepairs = useMemo(() => asset ? repairs.filter(r => r.asset_id === asset.id) : [], [asset, repairs]);
  const history = useMemo(() => asset ? mockStatusHistory.filter(h => h.asset_id === asset.id).sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()) : [], [asset]);
  const assignmentHistory = useMemo(() => asset ? assignments.filter(a => a.asset_id === asset.id).sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()) : [], [asset, assignments]);

  if (!asset) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Activo no encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/assets')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <button onClick={() => navigate('/assets')} className="hover:text-foreground transition-colors">Inventario</button>
        <ChevronRight className="w-3 h-3" />
        <span>{asset.category === 'EQUIPO' ? 'Equipos' : 'Periféricos'}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{asset.asset_tag || asset.serial_number}</span>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {typeIcons[asset.type] || <Monitor className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Detalle del Activo</h1>
              {status && (
                <span className={`status-badge ${getStatusClass(status.code)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {status.label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {asset.asset_tag || '—'} · Serie: {asset.serial_number} · Agregado el {formatDate(asset.created_at)}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/assets')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
      </motion.div>

      {/* Main layout: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
              <TabsTrigger value="reparaciones">Reparaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-6">
              {/* Specs card */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold">Especificaciones Técnicas</h2>
                  {asset.tags?.includes('garantía') && (
                    <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      <Shield className="w-3 h-3" /> Garantía Activa
                    </Badge>
                  )}
                </div>
                {asset.notes && (
                  <p className="text-sm text-muted-foreground mb-4">{asset.notes}</p>
                )}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  <InfoRow label="Fabricante" value={asset.brand || '—'} />
                  <InfoRow label="Nombre del Modelo" value={asset.model || '—'} />
                  <InfoRow label="Tipo" value={asset.type} />
                  <InfoRow label="Categoría" value={asset.category === 'EQUIPO' ? 'Equipo' : 'Periférico'} />
                  <InfoRow label="Número de Serie" value={asset.serial_number} />
                  <InfoRow label="ID Inventario" value={asset.asset_tag || '—'} />
                  <InfoRow label="Fecha de registro" value={formatDate(asset.created_at)} />
                  <InfoRow label="Última actualización" value={formatDate(asset.updated_at)} />
                </div>
              </motion.div>

              {/* Tags card */}
              {asset.tags && asset.tags.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Etiquetas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="historial" className="mt-4 space-y-4">
              {/* Status history */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Historial de Estados</h2>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin cambios de estado registrados.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map(h => {
                      const fromStatus = h.from_status_id ? getStatusById(h.from_status_id) : null;
                      const toStatus = getStatusById(h.to_status_id);
                      const operator = mockOperators.find(o => o.id === h.changed_by_operator_id);
                      return (
                        <div key={h.id} className="flex gap-3 items-start">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {fromStatus && (
                                <span className={`status-badge text-[10px] ${getStatusClass(fromStatus.code)}`}>
                                  <span className="w-1 h-1 rounded-full bg-current" />{fromStatus.label}
                                </span>
                              )}
                              {fromStatus && <span className="text-muted-foreground text-xs">→</span>}
                              {toStatus && (
                                <span className={`status-badge text-[10px] ${getStatusClass(toStatus.code)}`}>
                                  <span className="w-1 h-1 rounded-full bg-current" />{toStatus.label}
                                </span>
                              )}
                            </div>
                            {h.reason && <p className="text-xs text-muted-foreground mt-1">{h.reason}</p>}
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatDate(h.changed_at)} · {operator?.name || 'Operador desconocido'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Assignment history */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Historial de Asignaciones</h2>
                {assignmentHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin asignaciones registradas.</p>
                ) : (
                  <div className="space-y-4">
                    {assignmentHistory.map(a => {
                      const user = a.user_id ? getUserById(a.user_id) : null;
                      const operator = mockOperators.find(o => o.id === a.assigned_by_operator_id);
                      return (
                        <div key={a.id} className="flex gap-3 items-start">
                          <div className="w-2 h-2 rounded-full bg-accent-foreground/40 mt-2 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {user?.display_name || a.manual_user_name || 'Usuario desconocido'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(a.assigned_at)}{a.returned_at ? ` — Devuelto: ${formatDate(a.returned_at)}` : ' — Activo'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Asignado por: {operator?.name || '—'} · {a.delivery_mode === 'SIGNED' ? 'Firma usuario' : 'Validado por técnico'}
                            </p>
                          </div>
                          {!a.returned_at && (
                            <Badge variant="default" className="text-[10px] shrink-0">Activa</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="reparaciones" className="mt-4">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Reparaciones y Upgrades</h2>
                {assetRepairs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin reparaciones registradas para este activo.</p>
                ) : (
                  <div className="space-y-4">
                    {assetRepairs.map(r => {
                      const parts = mockRepairParts.filter(rp => rp.repair_id === r.id);
                      const tech = r.technician_id ? mockTechnicians.find(t => t.id === r.technician_id) : null;
                      return (
                        <div key={r.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{r.ticket_ref || 'Sin referencia'}</span>
                            </div>
                            <Badge variant={r.closed_at ? 'secondary' : 'destructive'} className="text-[10px]">
                              {r.closed_at ? 'Cerrada' : 'Abierta'}
                            </Badge>
                          </div>
                          {r.provider && <p className="text-xs text-muted-foreground">Proveedor: {r.provider}</p>}
                          {tech && (
                            <p className="text-xs text-muted-foreground">
                              Técnico: <span className="font-medium text-foreground">{tech.name}</span>
                              {tech.company && ` · ${tech.company}`}
                              {tech.specialty && ` · ${tech.specialty}`}
                            </p>
                          )}
                          {r.diagnosis && <p className="text-xs">{r.diagnosis}</p>}
                          <div className="flex gap-4 text-[11px] text-muted-foreground">
                            <span>Abierta: {formatDate(r.opened_at)}</span>
                            {r.closed_at && <span>Cerrada: {formatDate(r.closed_at)}</span>}
                            {r.cost !== null && <span>Costo: €{r.cost.toFixed(2)}</span>}
                          </div>

                          {/* Parts used */}
                          {parts.length > 0 && (
                            <div className="mt-2 border-t pt-3">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Piezas utilizadas</p>
                              <div className="space-y-1.5">
                                {parts.map(rp => {
                                  const part = mockHardwareParts.find(hp => hp.id === rp.part_id);
                                  const actionLabel = { REPLACED: 'Reemplazada', ADDED: 'Agregada', REMOVED: 'Retirada' }[rp.action];
                                  return (
                                    <div key={rp.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">{actionLabel}</Badge>
                                        <span className="font-medium">{part?.name || 'Pieza desconocida'}</span>
                                        {part?.brand && <span className="text-muted-foreground">({part.brand} {part.model})</span>}
                                      </div>
                                      <div className="flex items-center gap-3 text-muted-foreground">
                                        <span>x{rp.quantity}</span>
                                        {part?.unit_cost && <span>€{(part.unit_cost * rp.quantity).toFixed(2)}</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {parts.filter(rp => rp.notes).map(rp => (
                                <p key={`note-${rp.id}`} className="text-[11px] text-muted-foreground mt-1.5 italic">💬 {rp.notes}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Current assignment card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">Asignación Actual</p>
            {assignedUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {assignedUser.display_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{assignedUser.display_name}</p>
                    {assignedUser.department && (
                      <p className="text-xs text-muted-foreground">{assignedUser.department}</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {assignedUser.department && (
                    <div className="flex items-center gap-2 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{assignedUser.department}</span>
                    </div>
                  )}
                  {assignedUser.username && (
                    <div className="flex items-center gap-2 text-xs">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>ID: {assignedUser.username}</span>
                    </div>
                  )}
                  {assignedUser.email && (
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{assignedUser.email}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">Reasignar Activo</Button>
              </div>
            ) : activeAssignment?.manual_user_name ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{activeAssignment.manual_user_name}</p>
                    {activeAssignment.manual_user_email && (
                      <p className="text-xs text-muted-foreground">{activeAssignment.manual_user_email}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">Reasignar Activo</Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin asignación activa</p>
                <Button variant="outline" size="sm" className="mt-3">Asignar Activo</Button>
              </div>
            )}
          </motion.div>

          {/* Location card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Ubicación</p>
            {location ? (
              <div className="space-y-2">
                <div className="w-full h-24 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-semibold">{location.center}</p>
                <p className="text-xs text-muted-foreground">{location.site}, {location.country}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin ubicación asignada</p>
              </div>
            )}
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-auto py-3 flex-col">
              <Wrench className="w-4 h-4" />
              <span className="text-[11px]">Mantenimiento</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-auto py-3 flex-col text-destructive hover:text-destructive">
              <XCircle className="w-4 h-4" />
              <span className="text-[11px]">Retirar Activo</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
