import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Monitor, Laptop, Tablet, Printer, Server as ServerIcon,
  Headphones, Camera, HardDrive, Usb, ScanLine, Cable, MapPin, User,
  Mail, Building2, Hash, Wrench, XCircle, Tag, Calendar, Clock, FileText,
  ChevronRight, Shield, CheckSquare, Link2, Info, Download, RotateCcw
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { AssetModel } from '@/data/types';
import { toast } from 'sonner';
import ReturnAssetDialog from '@/components/ReturnAssetDialog';
import AssignAssetDialog from '@/components/AssignAssetDialog';

const typeIcons: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-8 h-8" />,
  Monitor: <Monitor className="w-8 h-8" />,
  Tablet: <Tablet className="w-8 h-8" />,
  Desktop: <ServerIcon className="w-8 h-8" />,
  Impresora: <Printer className="w-8 h-8" />,
  Headset: <Headphones className="w-8 h-8" />,
  Webcam: <Camera className="w-8 h-8" />,
  Dock: <Cable className="w-8 h-8" />,
  'Disco externo': <HardDrive className="w-8 h-8" />,
  Adaptador: <Usb className="w-8 h-8" />,
  'Escáner': <ScanLine className="w-8 h-8" />,
};

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addAuditEntry } = useAuth();
  const {
    assets, assignments, repairs, getStatusById, getStatusClass,
    getLocationById, getAssignedUserName, getUserById, getActiveAssignmentForAsset, locations, refresh,
  } = useData();

  const [assetModels, setAssetModels] = useState<AssetModel[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [repairParts, setRepairParts] = useState<any[]>([]);
  const [hardwareParts, setHardwareParts] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const asset = useMemo(() => assets.find(a => a.id === Number(id)), [assets, id]);
  const activeAssignment = useMemo(() => asset ? getActiveAssignmentForAsset(asset.id) : undefined, [asset, getActiveAssignmentForAsset]);
  const assignedUser = useMemo(() => activeAssignment?.user_id ? getUserById(activeAssignment.user_id) : undefined, [activeAssignment, getUserById]);
  const location = useMemo(() => asset?.location_id ? getLocationById(asset.location_id) : undefined, [asset, getLocationById]);
  const status = useMemo(() => asset ? getStatusById(asset.status_id) : undefined, [asset, getStatusById]);
  const assetRepairs = useMemo(() => asset ? repairs.filter(r => r.asset_id === asset.id) : [], [asset, repairs]);

  // Find model photo
  const assetModel = useMemo(() => {
    if (!asset) return null;
    return assetModels.find(m => m.brand === asset.brand && m.model === asset.model) || null;
  }, [asset, assetModels]);

  useEffect(() => {
    if (!asset) return;
    Promise.all([
      api.assetStatusHistory(asset.id),
      api.getAll('operators'),
      api.getAll('repair-parts'),
      api.getAll('hardware-parts'),
      api.getAll('technicians'),
      api.getAll<AssetModel>('asset-models'),
    ]).then(([sh, ops, rp, hp, techs, models]) => {
      setStatusHistory(sh as any[]);
      setOperators(ops as any[]);
      setRepairParts(rp as any[]);
      setHardwareParts(hp as any[]);
      setTechnicians(techs as any[]);
      setAssetModels(models);
    }).catch(console.error);
  }, [asset]);

  const history = useMemo(() => statusHistory.sort((a: any, b: any) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()), [statusHistory]);
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

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const isAssigned = !!activeAssignment && !activeAssignment.returned_at;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <button onClick={() => navigate('/assets')} className="hover:text-foreground transition-colors">Inventario</button>
        <ChevronRight className="w-3 h-3" />
        <span>{asset.category === 'EQUIPO' ? 'Equipos' : 'Periféricos'}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{asset.asset_tag || asset.serial_number}</span>
      </div>

      {/* === TOP ROW: 3 cards like the reference image === */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] gap-0 mb-6 items-stretch">
        {/* Card 1: Activo IT */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              {typeIcons[asset.type] || <Monitor className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold">Activo IT</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{asset.category === 'EQUIPO' ? 'HARDWARE' : 'PERIFÉRICO'}</p>
            </div>
          </div>

          {/* Photo from model */}
          <div className="mt-4 mb-3">
            {assetModel?.photo_url ? (
              <img src={assetModel.photo_url} alt={`${asset.brand} ${asset.model}`} className="w-full h-40 object-contain rounded-lg bg-muted/30" />
            ) : (
              <div className="w-full h-40 rounded-lg bg-muted/30 flex items-center justify-center">
                {typeIcons[asset.type] || <Monitor className="w-12 h-12 text-muted-foreground/30" />}
              </div>
            )}
          </div>

          <p className="text-sm font-semibold">{asset.type} {asset.brand} {asset.model}</p>
          <p className="text-xs text-muted-foreground">S/N: {asset.serial_number}</p>
          {(asset as any).sgad && <p className="text-xs text-muted-foreground">SGAD: {(asset as any).sgad}</p>}
          {status && (
            <div className="mt-2">
              <span className={`status-badge ${getStatusClass(status.code)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {status.label}
              </span>
            </div>
          )}
        </motion.div>

        {/* Link icon between cards */}
        <div className="hidden md:flex items-center justify-center px-3">
          <div className="p-2.5 bg-primary rounded-full text-primary-foreground shadow-md">
            <Link2 className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Colaborador / Usuario asignado */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center">
          {isAssigned ? (
            <>
              <div className="flex items-center gap-2 mb-1 self-start">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-bold">Colaborador</p>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground self-start mb-4">USUARIO FINAL</p>

              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-3">
                {(assignedUser?.display_name || activeAssignment?.manual_user_name || '?').split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>

              <p className="text-base font-semibold">{assignedUser?.display_name || activeAssignment?.manual_user_name || 'Usuario'}</p>
              {assignedUser?.department && (
                <p className="text-xs text-muted-foreground mt-0.5">Departamento de {assignedUser.department}</p>
              )}
              {assignedUser?.site && (
                <p className="text-xs text-muted-foreground">Sede: {assignedUser.site}</p>
              )}
            </>
          ) : (
            <>
              <User className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Sin asignar</p>
              <p className="text-xs text-muted-foreground mt-1">Este equipo no está asignado a ningún colaborador</p>
            </>
          )}
        </motion.div>

        {/* Card 3: Acciones finales */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border rounded-xl p-6 space-y-3">
          <p className="text-sm font-bold text-center">Acciones</p>

          {!isAssigned ? (
            <Button className="w-full gap-2" onClick={() => setAssignDialogOpen(true)}>
              <CheckSquare className="w-4 h-4" /> Asignar Equipo
            </Button>
          ) : (
            <>
              <Button variant="outline" className="w-full gap-2 text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300" onClick={() => setReturnDialogOpen(true)}>
                <RotateCcw className="w-4 h-4" /> Devolver equipo
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => setAssignDialogOpen(true)}>
                <User className="w-4 h-4" /> Reasignar
              </Button>
            </>
          )}

          <button onClick={() => navigate('/assets')} className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full py-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Regresar
          </button>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Al confirmar una asignación, se generará automáticamente el registro histórico y se actualizará el estado del activo.
              </p>
            </div>
          </div>

          {assignSuccess && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center">
              <CheckSquare className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">¡Asignación Exitosa!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">La vinculación se ha procesado correctamente.</p>
              <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-emerald-700 border-emerald-300">
                <Download className="w-3.5 h-3.5" /> Descargar Acta PDF
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* === BOTTOM SECTION: Tabs with details === */}
      <Tabs defaultValue="entrega" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entrega">Detalles de Entrega</TabsTrigger>
          <TabsTrigger value="specs">Especificaciones</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="reparaciones">Reparaciones</TabsTrigger>
        </TabsList>

        {/* Delivery details tab */}
        <TabsContent value="entrega">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Detalles de la Entrega</h2>
            </div>
            {activeAssignment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Fecha de Entrega</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{formatDate(activeAssignment.assigned_at)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ubicación de uso</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{location ? `${location.center} (${location.site})` : 'No especificada'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Modo de entrega</p>
                  <p className="text-sm">{activeAssignment.delivery_mode === 'SIGNED' ? 'Firma de usuario' : 'Validado por técnico'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Operador que asignó</p>
                  <p className="text-sm">{operators.find((o: any) => o.id === activeAssignment.assigned_by_operator_id)?.name || '—'}</p>
                </div>
                {activeAssignment.delivery_reason_text && (
                  <div className="md:col-span-2 space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Notas adicionales</p>
                    <p className="text-sm text-muted-foreground">{activeAssignment.delivery_reason_text}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No hay asignación activa para mostrar detalles de entrega.</p>
            )}
          </motion.div>
        </TabsContent>

        {/* Specs tab */}
        <TabsContent value="specs">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Especificaciones Técnicas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <InfoRow label="Fabricante" value={asset.brand || '—'} />
              <InfoRow label="Modelo" value={asset.model || '—'} />
              <InfoRow label="Tipo" value={asset.type} />
              <InfoRow label="Categoría" value={asset.category === 'EQUIPO' ? 'Equipo' : 'Periférico'} />
              <InfoRow label="Número de Serie" value={asset.serial_number} />
              <InfoRow label="SGAD" value={(asset as any).sgad || '—'} />
              <InfoRow label="ID Inventario" value={asset.asset_tag || '—'} />
              <InfoRow label="Fecha de registro" value={formatDate(asset.created_at)} />
              <InfoRow label="Última actualización" value={formatDate(asset.updated_at)} />
              {assetModel?.processor && <InfoRow label="Procesador" value={assetModel.processor} />}
              {assetModel?.ram_gb && <InfoRow label="RAM" value={`${assetModel.ram_gb} GB`} />}
              {assetModel?.storage && <InfoRow label="Almacenamiento" value={assetModel.storage} />}
              {assetModel?.screen_size && <InfoRow label="Pantalla" value={assetModel.screen_size} />}
              {assetModel?.os && <InfoRow label="Sistema Operativo" value={assetModel.os} />}
            </div>
            {asset.tags && asset.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Etiquetas</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {asset.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Notas</p>
                <p className="text-sm text-muted-foreground">{asset.notes}</p>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* History tab */}
        <TabsContent value="historial" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Historial de Estados</h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin cambios de estado registrados.</p>
            ) : (
              <div className="space-y-4">
                {history.map(h => {
                  const fromStatus = h.from_status_id ? getStatusById(h.from_status_id) : null;
                  const toStatus = getStatusById(h.to_status_id);
                  const operator = operators.find((o: any) => o.id === h.changed_by_operator_id);
                  return (
                    <div key={h.id} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {fromStatus && <span className={`status-badge text-[10px] ${getStatusClass(fromStatus.code)}`}><span className="w-1 h-1 rounded-full bg-current" />{fromStatus.label}</span>}
                          {fromStatus && <span className="text-muted-foreground text-xs">→</span>}
                          {toStatus && <span className={`status-badge text-[10px] ${getStatusClass(toStatus.code)}`}><span className="w-1 h-1 rounded-full bg-current" />{toStatus.label}</span>}
                        </div>
                        {h.reason && <p className="text-xs text-muted-foreground mt-1">{h.reason}</p>}
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(h.changed_at)} · {operator?.name || 'Operador desconocido'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Historial de Asignaciones</h2>
            {assignmentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin asignaciones registradas.</p>
            ) : (
              <div className="space-y-4">
                {assignmentHistory.map(a => {
                  const user = a.user_id ? getUserById(a.user_id) : null;
                  const operator = operators.find((o: any) => o.id === a.assigned_by_operator_id);
                  return (
                    <div key={a.id} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-accent-foreground/40 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{user?.display_name || a.manual_user_name || 'Usuario desconocido'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(a.assigned_at)}{a.returned_at ? ` — Devuelto: ${formatDate(a.returned_at)}` : ' — Activo'}</p>
                        <p className="text-[11px] text-muted-foreground">Asignado por: {operator?.name || '—'}</p>
                      </div>
                      {!a.returned_at && <Badge variant="default" className="text-[10px] shrink-0">Activa</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Repairs tab */}
        <TabsContent value="reparaciones">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Reparaciones</h2>
            {assetRepairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin reparaciones registradas para este activo.</p>
            ) : (
              <div className="space-y-4">
                {assetRepairs.map(r => {
                  const parts = repairParts.filter((rp: any) => rp.repair_id === r.id);
                  const tech = r.technician_id ? technicians.find((t: any) => t.id === r.technician_id) : null;
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
                      {tech && <p className="text-xs text-muted-foreground">Técnico: <span className="font-medium text-foreground">{tech.name}</span></p>}
                      {r.diagnosis && <p className="text-xs">{r.diagnosis}</p>}
                      <div className="flex gap-4 text-[11px] text-muted-foreground">
                        <span>Abierta: {formatDate(r.opened_at)}</span>
                        {r.closed_at && <span>Cerrada: {formatDate(r.closed_at)}</span>}
                        {r.cost !== null && <span>Costo: €{r.cost.toFixed(2)}</span>}
                      </div>
                      {parts.length > 0 && (
                        <div className="mt-2 border-t pt-3">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Piezas utilizadas</p>
                          <div className="space-y-1.5">
                            {parts.map(rp => {
                              const part = hardwareParts.find((hp: any) => hp.id === rp.part_id);
                              const actionLabel = { REPLACED: 'Reemplazada', ADDED: 'Agregada', REMOVED: 'Retirada' }[rp.action as string];
                              return (
                                <div key={rp.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px]">{actionLabel}</Badge>
                                    <span className="font-medium">{part?.name || 'Pieza desconocida'}</span>
                                  </div>
                                  <span>x{rp.quantity}</span>
                                </div>
                              );
                            })}
                          </div>
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

      <ReturnAssetDialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen} assignment={activeAssignment} />
      <AssignAssetDialog open={assignDialogOpen} onOpenChange={(v) => { setAssignDialogOpen(v); if (!v) refresh(); }} preselectedAssetId={asset.id} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
