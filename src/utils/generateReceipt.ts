import { Assignment, Asset, User } from '@/data/types';

interface ReceiptData {
  assignment: Assignment;
  asset: Asset | undefined;
  user: User | undefined;
  operatorName?: string;
}

export function generateReceiptHTML({ assignment, asset, user, operatorName }: ReceiptData): string {
  const userName = user?.display_name || assignment.manual_user_name || 'N/A';
  const userEmail = user?.email || assignment.manual_user_email || 'N/A';
  const date = new Date(assignment.assigned_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Acuse de Recibo - ${asset?.asset_tag || asset?.serial_number || 'Equipo'}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; color: #333; }
  h1 { text-align: center; font-size: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 12px; color: #1e40af; }
  .section { margin: 24px 0; }
  .section h2 { font-size: 14px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.5px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
  td:first-child { font-weight: 600; background: #f9fafb; width: 35%; }
  .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  .signature { margin-top: 60px; display: flex; justify-content: space-between; }
  .signature div { width: 45%; text-align: center; }
  .signature .line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .badge-signed { background: #dbeafe; color: #1e40af; }
  .badge-validated { background: #fef3c7; color: #92400e; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <h1>📋 Acuse de Recibo de Equipo Informático</h1>

  <div class="section">
    <h2>Datos del equipo</h2>
    <table>
      <tr><td>ID Inventario</td><td>${asset?.asset_tag || '—'}</td></tr>
      <tr><td>Número de serie</td><td>${asset?.serial_number || '—'}</td></tr>
      <tr><td>Tipo</td><td>${asset?.type || '—'}</td></tr>
      <tr><td>Marca</td><td>${asset?.brand || '—'}</td></tr>
      <tr><td>Modelo</td><td>${asset?.model || '—'}</td></tr>
      <tr><td>Categoría</td><td>${asset?.category === 'EQUIPO' ? 'Equipo' : 'Periférico'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Datos del usuario receptor</h2>
    <table>
      <tr><td>Nombre</td><td>${userName}</td></tr>
      <tr><td>Email</td><td>${userEmail}</td></tr>
      ${user?.department ? `<tr><td>Departamento</td><td>${user.department}</td></tr>` : ''}
      ${user?.site ? `<tr><td>Ubicación</td><td>${user.site}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <h2>Datos de la asignación</h2>
    <table>
      <tr><td>Fecha de asignación</td><td>${date}</td></tr>
      <tr><td>Operador</td><td>${operatorName || '—'}</td></tr>
      <tr><td>Modo de entrega</td><td><span class="badge ${assignment.delivery_mode === 'SIGNED' ? 'badge-signed' : 'badge-validated'}">${assignment.delivery_mode === 'SIGNED' ? 'Firmado por usuario' : 'Validado por técnico'}</span></td></tr>
      ${assignment.delivery_reason_code ? `<tr><td>Motivo</td><td>${assignment.delivery_reason_code}</td></tr>` : ''}
      ${assignment.delivery_reason_text ? `<tr><td>Detalle</td><td>${assignment.delivery_reason_text}</td></tr>` : ''}
    </table>
  </div>

  <div class="signature">
    <div>
      <div class="line">Firma del técnico / operador</div>
    </div>
    <div>
      <div class="line">Firma del usuario receptor</div>
    </div>
  </div>

  <div class="footer">
    <p>Este documento fue generado automáticamente por el sistema de gestión de inventario IT.</p>
    <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</body>
</html>`;
}

export function downloadReceipt(data: ReceiptData) {
  const html = generateReceiptHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `acuse_recibo_${data.asset?.asset_tag || data.assignment.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
