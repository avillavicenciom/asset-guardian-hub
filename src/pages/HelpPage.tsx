import { BookOpen, Monitor, Users, ArrowLeftRight, Wrench, LayoutDashboard, Shield, ClipboardList, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'overview',
    icon: BookOpen,
    title: 'Descripción general',
    content: 'IT Inventory es un sistema de gestión de activos tecnológicos diseñado para controlar el ciclo de vida completo de equipos y periféricos de una organización.\n\nPermite registrar, asignar, reparar y dar de baja activos, con trazabilidad completa de cada operación y auditoría de acciones por operador.',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    content: 'El Dashboard muestra un resumen general del inventario con métricas clave:\n\n• Total de equipos registrados\n• Equipos disponibles para asignación\n• Asignaciones activas en curso\n• Equipos en reparación\n\nIncluye filtros por Marca, Fecha, Usuario asignado y Estado.',
  },
  {
    id: 'assets',
    icon: Monitor,
    title: 'Equipos y Periféricos',
    content: 'Esta sección permite gestionar todos los activos tecnológicos, divididos en:\n\n• Equipos principales: Laptops, Desktops, Tablets\n• Periféricos: Monitores, Headsets, Webcams, Docks, etc.\n\nCada activo tiene un tag, serial, categoría, tipo, marca, modelo, estado y ubicación.',
  },
  {
    id: 'users',
    icon: Users,
    title: 'Usuarios',
    content: 'Gestión de empleados/usuarios a los que se les asignan activos.\n\nIncluye alertas automáticas cuando un contrato está próximo a vencer (7 días o menos).',
  },
  {
    id: 'assignments',
    icon: ArrowLeftRight,
    title: 'Asignaciones',
    content: 'Registro completo de entregas y devoluciones de activos.\n\nModos de entrega:\n• Firmado: El usuario firma la recepción\n• Validado por técnico: El técnico valida la entrega\n\nIncluye motivos de entrega cuando aplica.',
  },
  {
    id: 'repairs',
    icon: Wrench,
    title: 'Reparaciones',
    content: 'Seguimiento de reparaciones activas y cerradas.\n\nCada reparación incluye proveedor, referencia de ticket, diagnóstico y costo estimado.',
  },
  {
    id: 'audit',
    icon: ClipboardList,
    title: 'Auditoría',
    content: 'Registro de todas las acciones realizadas por los operadores del sistema.\n\nSolo visible para administradores (rol ADMIN).',
  },
  {
    id: 'roles',
    icon: Shield,
    title: 'Roles y permisos',
    content: 'El sistema tiene tres roles:\n\n• ADMIN: Acceso total, gestión de usuarios, auditoría\n• TECH: Gestión de activos, asignaciones y reparaciones\n• READONLY: Solo lectura de información',
  },
];

export default function HelpPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Ayuda</h1>
        <p className="text-sm text-muted-foreground mt-1">Guía de uso del sistema IT Inventory</p>
      </div>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
