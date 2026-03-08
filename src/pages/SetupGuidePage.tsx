import { Printer, Download, CheckCircle2, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 print:mb-4 print:break-inside-avoid">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm print:border print:border-black print:bg-white print:text-black">
          {number}
        </span>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="ml-11 text-sm text-muted-foreground space-y-2 print:text-black">{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs print:bg-gray-100 print:border-gray-400">
      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs print:bg-gray-100 print:border-gray-400">
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto print:bg-gray-100 print:border print:border-gray-300">
      {children}
    </pre>
  );
}

export default function SetupGuidePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl print:max-w-none print:p-4">
      {/* Header - no print buttons */}
      <div className="flex items-center justify-between mb-8 print:mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight print:text-xl">📋 Manual de Instalación</h1>
          <p className="text-sm text-muted-foreground mt-1 print:text-black">
            IT Inventory — Guía paso a paso para configurar el sistema desde cero
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {/* Requisitos */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4 print:break-inside-avoid">
        <h2 className="text-lg font-bold mb-3">🖥️ Requisitos del equipo</h2>
        <ul className="text-sm space-y-1 text-muted-foreground print:text-black">
          <li>• Sistema operativo: <strong>Windows 10 o superior</strong></li>
          <li>• RAM: <strong>4 GB mínimo</strong> (8 GB recomendado)</li>
          <li>• Espacio en disco: <strong>2 GB libres</strong></li>
          <li>• Conexión a internet (solo para descargar software)</li>
          <li>• Permisos de administrador en el equipo</li>
        </ul>
      </div>

      {/* FASE 1: Instalaciones */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-black">Fase 1</span>
          Instalar software necesario
        </h2>

        <Step number={1} title="Instalar Git (control de versiones)">
          <p>Git permite descargar y actualizar el código del proyecto.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Abre tu navegador y ve a: <strong>https://git-scm.com/download/win</strong></li>
            <li>Se descargará automáticamente. Si no, haz clic en <strong>"Click here to download"</strong></li>
            <li>Ejecuta el instalador descargado (<code>Git-X.X.X-64-bit.exe</code>)</li>
            <li>En cada pantalla haz clic en <strong>"Next"</strong> (dejar todo por defecto)</li>
            <li>Al final haz clic en <strong>"Install"</strong> y luego <strong>"Finish"</strong></li>
          </ol>
          <Tip>Para verificar: Abre PowerShell y escribe <code>git --version</code>. Debe mostrar algo como <code>git version 2.xx.x</code></Tip>
        </Step>

        <Step number={2} title="Instalar GitHub Desktop (interfaz visual para Git)">
          <p>GitHub Desktop facilita trabajar con el código sin usar comandos.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Ve a: <strong>https://desktop.github.com</strong></li>
            <li>Haz clic en <strong>"Download for Windows"</strong></li>
            <li>Ejecuta el instalador y sigue las instrucciones</li>
            <li>Inicia sesión con tu cuenta de GitHub (o crea una en <strong>github.com</strong>)</li>
          </ol>
        </Step>

        <Step number={3} title="Instalar Node.js (motor del servidor)">
          <p>Node.js es necesario para ejecutar tanto el frontend como el backend.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Ve a: <strong>https://nodejs.org</strong></li>
            <li>Descarga la versión <strong>LTS</strong> (botón verde de la izquierda)</li>
            <li>Ejecuta el instalador (<code>node-vXX.X.X-x64.msi</code>)</li>
            <li>Haz clic en <strong>"Next"</strong> en cada pantalla</li>
            <li>✅ Marca la casilla <strong>"Automatically install the necessary tools"</strong> si aparece</li>
            <li>Haz clic en <strong>"Install"</strong> y luego <strong>"Finish"</strong></li>
          </ol>
          <Tip>Para verificar: Abre PowerShell y escribe <code>node --version</code> y <code>npm --version</code>. Ambos deben mostrar un número.</Tip>
        </Step>

        <Step number={4} title="Instalar XAMPP (servidor MySQL)">
          <p>XAMPP incluye MySQL, que es la base de datos del sistema.</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Ve a: <strong>https://www.apachefriends.org/es/download.html</strong></li>
            <li>Descarga la versión para <strong>Windows</strong></li>
            <li>Ejecuta el instalador</li>
            <li>En la selección de componentes, asegúrate de marcar <strong>MySQL</strong> y <strong>phpMyAdmin</strong></li>
            <li>Instala en la ruta por defecto: <strong>C:\xampp</strong></li>
            <li>Haz clic en <strong>"Next"</strong> hasta finalizar</li>
          </ol>
          <Warning>No cambies la ruta de instalación. Si la cambias, deberás modificar los scripts manualmente.</Warning>
        </Step>
      </div>

      {/* FASE 2: Configurar MySQL */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-black">Fase 2</span>
          Configurar la base de datos
        </h2>

        <Step number={5} title="Iniciar MySQL desde XAMPP">
          <ol className="list-decimal list-inside space-y-1">
            <li>Busca <strong>"XAMPP Control Panel"</strong> en el menú Inicio de Windows</li>
            <li>Haz clic derecho → <strong>"Ejecutar como administrador"</strong></li>
            <li>En la fila de <strong>MySQL</strong>, haz clic en el botón <strong>"Start"</strong></li>
            <li>Espera a que el texto "MySQL" se ponga en <strong>verde</strong></li>
          </ol>
          <Tip>Si MySQL no arranca, verifica que el puerto 3306 no esté ocupado por otro programa.</Tip>
        </Step>

        <Step number={6} title="Crear la base de datos">
          <p>Hay dos formas:</p>

          <p className="font-semibold mt-3">Opción A — Automática (recomendada):</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Ve a la carpeta del proyecto: <code>database/</code></li>
            <li>Haz <strong>doble clic</strong> en <code>setup-database.bat</code></li>
            <li>Verás el mensaje: <strong>"Base de datos creada exitosamente"</strong></li>
          </ol>

          <p className="font-semibold mt-3">Opción B — Manual (phpMyAdmin):</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Con MySQL corriendo, abre en tu navegador: <strong>http://localhost/phpmyadmin</strong></li>
            <li>Haz clic en la pestaña <strong>"SQL"</strong></li>
            <li>Copia todo el contenido del archivo <code>database/schema.sql</code></li>
            <li>Pégalo en el cuadro de texto y haz clic en <strong>"Continuar"</strong></li>
          </ol>

          <Tip>Para verificar: En phpMyAdmin (panel izquierdo) debe aparecer <strong>it_inventory</strong> con 15 tablas.</Tip>
        </Step>
      </div>

      {/* FASE 3: Configurar PowerShell */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-black">Fase 3</span>
          Configurar PowerShell
        </h2>

        <Step number={7} title="Habilitar ejecución de scripts en PowerShell">
          <p>Windows bloquea scripts por defecto. Necesitas habilitarlos una sola vez:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Busca <strong>"PowerShell"</strong> en el menú Inicio</li>
            <li>Haz clic derecho → <strong>"Ejecutar como administrador"</strong></li>
            <li>Escribe el siguiente comando y presiona Enter:</li>
          </ol>
          <CodeBlock>Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</CodeBlock>
          <ol className="list-decimal list-inside space-y-1" start={4}>
            <li>Cuando pregunte, escribe <strong>S</strong> (Sí) y presiona Enter</li>
            <li>Puedes cerrar esta ventana de PowerShell</li>
          </ol>
          <Warning>Este paso solo se hace UNA VEZ por equipo. Si no lo haces, los comandos npm no funcionarán.</Warning>
        </Step>
      </div>

      {/* FASE 4: Descargar el proyecto */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-black">Fase 4</span>
          Descargar el proyecto
        </h2>

        <Step number={8} title="Clonar el repositorio con GitHub Desktop">
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre <strong>GitHub Desktop</strong></li>
            <li>Haz clic en <strong>"File"</strong> → <strong>"Clone repository..."</strong></li>
            <li>En la pestaña <strong>"URL"</strong>, pega la URL del repositorio</li>
            <li>Elige la carpeta destino (ejemplo: <code>C:\Users\TuUsuario\Documents\GitHub\guardian</code>)</li>
            <li>Haz clic en <strong>"Clone"</strong></li>
            <li>Espera a que termine de descargar</li>
          </ol>
          <Tip>También puedes usar PowerShell: <code>git clone https://github.com/avillavicenciom/asset-guardian-hub.git</code></Tip>
        </Step>
      </div>

      {/* FASE 5: Instalar y ejecutar */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-black">Fase 5</span>
          Instalar dependencias y ejecutar
        </h2>

        <Step number={9} title="Instalar dependencias del Frontend">
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre <strong>PowerShell</strong> (normal, no como administrador)</li>
            <li>Navega a la carpeta del proyecto:</li>
          </ol>
          <CodeBlock>cd C:\Users\TuUsuario\Documents\GitHub\guardian</CodeBlock>
          <ol className="list-decimal list-inside space-y-1" start={3}>
            <li>Instala las dependencias:</li>
          </ol>
          <CodeBlock>npm install</CodeBlock>
          <p>Espera a que termine (puede tardar 1-3 minutos la primera vez).</p>
        </Step>

        <Step number={10} title="Instalar dependencias del Backend">
          <ol className="list-decimal list-inside space-y-1">
            <li>En la misma ventana de PowerShell, entra a la carpeta backend:</li>
          </ol>
          <CodeBlock>cd backend{"\n"}npm install</CodeBlock>
          <p>Esto instalará Express, MySQL2 y CORS.</p>
        </Step>

        <Step number={11} title="Iniciar el Backend (servidor API)">
          <ol className="list-decimal list-inside space-y-1">
            <li>En PowerShell, estando en la carpeta <code>backend/</code>:</li>
          </ol>
          <CodeBlock>npm start</CodeBlock>
          <p>Verás el mensaje:</p>
          <CodeBlock>🚀 Asset Guardian API corriendo en http://localhost:3001{"\n"}📋 Health check: http://localhost:3001/api/health</CodeBlock>
          <Warning>No cierres esta ventana. El servidor debe estar corriendo mientras uses el sistema.</Warning>
        </Step>

        <Step number={12} title="Iniciar el Frontend (interfaz web)">
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre una <strong>NUEVA</strong> ventana de PowerShell (la anterior tiene el backend)</li>
            <li>Navega a la carpeta raíz del proyecto:</li>
          </ol>
          <CodeBlock>cd C:\Users\TuUsuario\Documents\GitHub\guardian{"\n"}npm run dev</CodeBlock>
          <p>Verás algo como:</p>
          <CodeBlock>VITE v5.x.x ready{"\n"}➜  Local:   http://localhost:5173/</CodeBlock>
        </Step>

        <Step number={13} title="Abrir el sistema">
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre tu navegador (Chrome recomendado)</li>
            <li>Ve a: <strong>http://localhost:5173</strong></li>
            <li>Inicia sesión con las credenciales por defecto:</li>
          </ol>
          <div className="bg-muted rounded-lg p-4 mt-2 print:bg-gray-100 print:border print:border-gray-300">
            <p className="font-mono text-sm"><strong>Usuario:</strong> admin</p>
            <p className="font-mono text-sm"><strong>Contraseña:</strong> admin123</p>
            <p className="font-mono text-sm"><strong>Rol:</strong> Administrador</p>
          </div>
        </Step>
      </div>

      {/* FASE 6: Uso diario */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-black">Fase 6</span>
          Uso diario (cada vez que enciendas el equipo)
        </h2>

        <Step number={14} title="Rutina de inicio diaria">
          <p>Cada vez que quieras usar el sistema, sigue estos pasos <strong>en orden</strong>:</p>
          <div className="bg-muted rounded-lg p-4 space-y-2 print:bg-gray-100 print:border print:border-gray-300">
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <strong>1.</strong> Abrir XAMPP → Iniciar MySQL (botón Start)</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <strong>2.</strong> Abrir PowerShell → <code>cd backend</code> → <code>npm start</code></p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <strong>3.</strong> Abrir OTRA PowerShell → <code>cd guardian</code> → <code>npm run dev</code></p>
            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> <strong>4.</strong> Abrir navegador → <strong>http://localhost:5173</strong></p>
          </div>
        </Step>

        <Step number={15} title="Actualizar el sistema (cuando haya cambios)">
          <p>Si se publicaron mejoras al código:</p>
          <p className="font-semibold mt-2">Con GitHub Desktop:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abre GitHub Desktop</li>
            <li>Haz clic en <strong>"Fetch origin"</strong> (arriba)</li>
            <li>Si aparece <strong>"Pull origin"</strong>, haz clic</li>
          </ol>
          <p className="font-semibold mt-2">Con PowerShell:</p>
          <CodeBlock>cd C:\Users\TuUsuario\Documents\GitHub\guardian{"\n"}git pull</CodeBlock>
          <Warning>Después de un git pull, reinicia tanto el backend como el frontend para que los cambios apliquen.</Warning>
        </Step>
      </div>

      {/* Solución de problemas */}
      <div className="bg-card rounded-xl border p-6 mb-8 print:border-gray-400 print:mb-4">
        <h2 className="text-lg font-bold mb-6">❓ Solución de problemas comunes</h2>
        <div className="text-sm space-y-4 text-muted-foreground print:text-black">
          <div>
            <p className="font-semibold text-foreground print:text-black">Error: "npm no se reconoce como comando"</p>
            <p>→ Node.js no está instalado o no se reinició la terminal. Reinstala Node.js y abre una nueva ventana de PowerShell.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground print:text-black">Error: "ECONNREFUSED 3306"</p>
            <p>→ MySQL no está corriendo. Abre XAMPP e inicia MySQL.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground print:text-black">Error: "ER_BAD_DB_ERROR"</p>
            <p>→ La base de datos no existe. Ejecuta <code>database/setup-database.bat</code>.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground print:text-black">Error: "scripts deshabilitados en este sistema"</p>
            <p>→ Ejecuta el Paso 7 (habilitar scripts en PowerShell como administrador).</p>
          </div>
          <div>
            <p className="font-semibold text-foreground print:text-black">La página carga pero no muestra datos</p>
            <p>→ El backend no está corriendo. Abre otra PowerShell, ve a <code>backend/</code> y ejecuta <code>npm start</code>.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground print:text-black">Error al cargar tabs de Configuración</p>
            <p>→ Asegúrate de tener la última versión del código: <code>git pull</code> y reinicia frontend y backend.</p>
          </div>
        </div>
      </div>

      {/* Footer para impresión */}
      <div className="text-center text-xs text-muted-foreground mt-8 print:mt-4">
        <p>IT Inventory — Manual de Instalación — Generado el {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
