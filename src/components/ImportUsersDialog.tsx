import { useState, useRef, useMemo, useCallback } from 'react';
import { Upload, FileText, Check, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/data/types';
import { toast } from 'sonner';

const USER_FIELDS = [
  { key: 'display_name', label: 'Name', required: true },
  { key: 'department', label: 'Company', required: false },
  { key: 'email', label: 'Email Address', required: false },
  { key: 'contract_end', label: 'Expiration Date', required: false },
  { key: 'site', label: 'Job Title', required: false },
  { key: 'username', label: 'Username (pre 2000)', required: false },
] as const;

type Step = 'upload' | 'mapping' | 'preview';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (users: Partial<User>[]) => void;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if ((ch === ',' || ch === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine).filter(r => r.some(c => c));
  return { headers, rows };
}

export default function ImportUsersDialog({ open, onOpenChange, onImport }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setSelectedRows(new Set());
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Solo se permiten archivos .csv');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0 || rows.length === 0) {
        toast.error('El archivo CSV está vacío o no tiene datos válidos');
        return;
      }
      setCsvHeaders(headers);
      setCsvRows(rows);
      // Auto-map by similarity
      const autoMap: Record<string, string> = {};
      USER_FIELDS.forEach(f => {
        const match = headers.find(h =>
          h.toLowerCase().replace(/[_\s]/g, '') === f.key.replace(/_/g, '') ||
          h.toLowerCase().includes(f.label.toLowerCase().split(' ')[0].toLowerCase())
        );
        if (match) autoMap[f.key] = match;
      });
      setMapping(autoMap);
      setSelectedRows(new Set(rows.map((_, i) => i)));
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const mappedPreview = useMemo(() => {
    if (step !== 'preview') return [];
    return Array.from(selectedRows).sort().map(idx => {
      const row = csvRows[idx];
      const user: Record<string, string> = {};
      Object.entries(mapping).forEach(([field, csvCol]) => {
        const colIdx = csvHeaders.indexOf(csvCol);
        if (colIdx >= 0 && row[colIdx]) user[field] = row[colIdx];
      });
      return user;
    });
  }, [step, selectedRows, csvRows, mapping, csvHeaders]);

  const canProceedToPreview = mapping['display_name'];

  const handleImport = () => {
    onImport(mappedPreview as Partial<User>[]);
    toast.success(`${mappedPreview.length} usuarios importados`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar usuarios desde CSV</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Sube un archivo CSV con los datos de los usuarios.'}
            {step === 'mapping' && 'Selecciona qué columna del CSV corresponde a cada campo.'}
            {step === 'preview' && `Vista previa: ${mappedPreview.length} usuarios a importar.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold">📋 Campos que puedes incluir en tu CSV:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {USER_FIELDS.map(f => (
                  <div key={f.key} className="flex items-center gap-2">
                    {f.required ? (
                      <span className="inline-flex items-center rounded bg-destructive/10 text-destructive px-1.5 py-0.5 font-semibold text-[10px]">Obligatorio</span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-medium text-muted-foreground text-[10px]">Opcional</span>
                    )}
                    <span className="font-medium">{f.label}</span>
                    <span className="text-muted-foreground">→ {
                      f.key === 'display_name' ? 'Nombre completo' :
                      f.key === 'department' ? 'Departamento / Compañía' :
                      f.key === 'email' ? 'Correo electrónico' :
                      f.key === 'contract_end' ? 'Fecha fin de contrato' :
                      f.key === 'site' ? 'Sede / Ubicación' :
                      'Nombre de usuario'
                    }</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                💡 Las columnas no necesitan nombres exactos. En el siguiente paso podrás mapear cada columna de tu CSV al campo correcto.
              </p>
            </div>

            <div
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Arrastra tu archivo CSV aquí</p>
              <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-4 h-4 shrink-0" />
              <span>{csvRows.length} filas encontradas · {csvHeaders.length} columnas: <strong>{csvHeaders.join(', ')}</strong></span>
            </div>

            <div className="space-y-3">
              {USER_FIELDS.map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-40 shrink-0">
                    <span className="text-sm font-medium">{field.label}</span>
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Select
                    value={mapping[field.key] || '__none__'}
                    onValueChange={v => setMapping(prev => {
                      const next = { ...prev };
                      if (v === '__none__') delete next[field.key];
                      else next[field.key] = v;
                      return next;
                    })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="No importar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— No importar —</SelectItem>
                      {csvHeaders.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-3">
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left w-8">
                      <Checkbox
                        checked={selectedRows.size === csvRows.length}
                        onCheckedChange={v => setSelectedRows(v ? new Set(csvRows.map((_, i) => i)) : new Set())}
                      />
                    </th>
                    {USER_FIELDS.filter(f => mapping[f.key]).map(f => (
                      <th key={f.key} className="p-2 text-left font-medium">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 50).map((row, idx) => {
                    const isSelected = selectedRows.has(idx);
                    return (
                      <tr key={idx} className={`border-t ${!isSelected ? 'opacity-40' : ''}`}>
                        <td className="p-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={v => {
                              setSelectedRows(prev => {
                                const next = new Set(prev);
                                v ? next.add(idx) : next.delete(idx);
                                return next;
                              });
                            }}
                          />
                        </td>
                        {USER_FIELDS.filter(f => mapping[f.key]).map(f => {
                          const colIdx = csvHeaders.indexOf(mapping[f.key]);
                          return <td key={f.key} className="p-2">{colIdx >= 0 ? row[colIdx] : ''}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {csvRows.length > 50 && (
              <p className="text-xs text-muted-foreground text-center">Mostrando 50 de {csvRows.length} filas</p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step !== 'upload' && (
            <Button variant="outline" onClick={() => setStep(step === 'preview' ? 'mapping' : 'upload')}>
              Atrás
            </Button>
          )}
          {step === 'mapping' && (
            <Button disabled={!canProceedToPreview} onClick={() => setStep('preview')} className="gap-2">
              Vista previa <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {step === 'preview' && (
            <Button disabled={selectedRows.size === 0} onClick={handleImport} className="gap-2">
              <Check className="w-4 h-4" /> Importar {selectedRows.size} usuarios
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
