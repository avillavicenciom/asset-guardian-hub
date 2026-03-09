import { Assignment, Asset, User } from '@/data/types';

interface ReturnReceiptData {
  assignment: Assignment;
  asset: Asset | undefined;
  user: User | undefined;
  observations: string;
  returnDate: string;
  operatorName?: string;
  operatorEmail?: string;
}

export function generateReturnReceiptHTML(data: ReturnReceiptData): string {
  const { assignment, asset, user, observations, returnDate, operatorName, operatorEmail } = data;
  const userName = user?.display_name || assignment.manual_user_name || 'N/A';
  const department = user?.department || '—';
  const assignedDate = new Date(assignment.assigned_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const returnDateFormatted = new Date(returnDate).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Acta de Devolución - ${asset?.asset_tag || asset?.serial_number || 'Equipo'}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; color: #333; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
  .header h1 { font-size: 22px; color: #1e40af; margin: 8px 0 4px; }
  .header p { font-size: 12px; color: #6b7280; margin: 0; }
  .logo-placeholder { font-size: 28px; font-weight: bold; color: #1e40af; letter-spacing: 2px; }
  .section { margin: 24px 0; }
  .section h2 { font-size: 13px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 12px; border: 1px solid #e5e7eb; font-size: 13px; }
  td:first-child { font-weight: 600; background: #f9fafb; width: 35%; }
  .observations { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; font-size: 13px; min-height: 50px; white-space: pre-wrap; }
  .signature { margin-top: 60px; display: flex; justify-content: space-between; }
  .signature div { width: 45%; text-align: center; }
  .signature .line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; font-size: 12px; }
  .footer { margin-top: 48px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-placeholder">[LOGO INSTITUCIONAL]</div>
    <h1>📋 Acta de Devolución de Equipo Informático</h1>
    <p>Documento generado por el sistema de gestión de inventario IT</p>
  </div>

  <div class="section">
    <h2>Datos del usuario que devuelve</h2>
    <table>
      <tr><td>Nombre completo</td><td>${userName}</td></tr>
      <tr><td>Departamento</td><td>${department}</td></tr>
      ${user?.email ? `<tr><td>Correo electrónico</td><td>${user.email}</td></tr>` : ''}
      ${user?.site ? `<tr><td>Sede / Ubicación</td><td>${user.site}</td></tr>` : ''}
    </table>
  </div>

  <div class="section">
    <h2>Datos del equipo devuelto</h2>
    <table>
      <tr><td>Marca</td><td>${asset?.brand || '—'}</td></tr>
      <tr><td>Modelo</td><td>${asset?.model || '—'}</td></tr>
      <tr><td>Tipo</td><td>${asset?.type || '—'}</td></tr>
      <tr><td>Número de serie</td><td>${asset?.serial_number || '—'}</td></tr>
      <tr><td>ID Inventario</td><td>${asset?.asset_tag || '—'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Fechas</h2>
    <table>
      <tr><td>Fecha de asignación</td><td>${assignedDate}</td></tr>
      <tr><td>Fecha de devolución</td><td>${returnDateFormatted}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Observaciones</h2>
    <div class="observations">${observations || 'Sin observaciones.'}</div>
  </div>

  <div class="section">
    <h2>Operador que recibe</h2>
    <table>
      <tr><td>Nombre</td><td>${operatorName || '—'}</td></tr>
      <tr><td>Email</td><td>${operatorEmail || '—'}</td></tr>
    </table>
  </div>

  <div class="signature">
    <div>
      <div class="line">Firma del usuario que devuelve</div>
    </div>
    <div>
      <div class="line">Firma del operador que recibe</div>
    </div>
  </div>

  <div class="footer">
    <p>Este documento fue generado automáticamente por el sistema de gestión de inventario IT.</p>
    <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>
</body>
</html>`;
}

export function downloadReturnReceipt(data: ReturnReceiptData) {
  const html = generateReturnReceiptHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `acta_devolucion_${data.asset?.asset_tag || data.asset?.serial_number || data.assignment.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
