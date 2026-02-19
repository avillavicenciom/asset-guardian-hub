import { useState, useRef, useMemo, useCallback } from 'react';
import { Upload, FileText, Check, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Asset } from '@/data/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const ASSET_FIELDS = [
  { key: 'serial_number', label: 'Número de serie', required: true },
  { key: 'asset_tag', label: 'ID Inventario', required: false },
  { key: 'category', label: 'Categoría (EQUIPO/PERIFERICO)', required: false },
  { key: 'type', label: 'Tipo (Laptop, Monitor...)', required: false },
  { key: 'brand', label: 'Marca', required: false },
  { key: 'model', label: 'Modelo', required: false },
  { key: 'notes', label: 'Notas', required: false },
  { key: 'tags', label: 'Tags (separados por coma)', required: false },
] as const;

type Step = 'upload' | 'mapping' | 'preview' | 'result';

interface ImportResult {
  imported: Partial<Asset>[];
  skipped: { row: Record<string, string>; reason: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (assets: Partial<Asset>[]) => ImportResult;
  existingSerials: Set<string>;
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

export default function ImportAssetsDialog({ open, onOpenChange, onImport, existingSerials }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setSelectedRows(new Set());
    setImportResult(null);
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
      const autoMap: Record<string, string> = {};
      ASSET_FIELDS.forEach(f => {
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

  const mappedRows = useMemo(() => {
    if (step !== 'preview' && step !== 'result') return [];
    return Array.from(selectedRows).sort().map(idx => {
      const row = csvRows[idx];
      const asset: Record<string, string> = {};
      Object.entries(mapping).forEach(([field, csvCol]) => {
        const colIdx = csvHeaders.indexOf(csvCol);
        if (colIdx >= 0 && row[colIdx]) asset[field] = row[colIdx];
      });
      return asset;
    });
  }, [step, selectedRows, csvRows, mapping, csvHeaders]);

  // Check duplicates in preview
  const previewWithStatus = useMemo(() => {
    return mappedRows.map(row => {
      const serial = row.serial_number?.trim();
      const isDuplicate = serial ? existingSerials.has(serial.toLowerCase()) : false;
      return { row, isDuplicate };
    });
  }, [mappedRows, existingSerials]);

  const duplicateCount = previewWithStatus.filter(r => r.isDuplicate).length;
  const newCount = previewWithStatus.filter(r => !r.isDuplicate).length;

  const canProceedToPreview = !!mapping['serial_number'];

  const handleImport = () => {
    const toImport = previewWithStatus
      .filter(r => !r.isDuplicate)
      .map(r => r.row as Partial<Asset>);

    const skipped = previewWithStatus
      .filter(r => r.isDuplicate)
      .map(r => ({ row: r.row, reason: `Serial "${r.row.serial_number}" ya existe` }));

    const result: ImportResult = { imported: toImport, skipped };
    setImportResult(result);
    onImport(toImport);
    setStep('result');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar activos desde CSV</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Sube un archivo CSV con los datos de los equipos o periféricos.'}
            {step === 'mapping' && 'Selecciona qué columna del CSV corresponde a cada campo.'}
            {step === 'preview' && `Vista previa: ${newCount} nuevos, ${duplicateCount} duplicados.`}
            {step === 'result' && 'Resultado de la importación.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div
            className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Arrastra tu archivo CSV aquí</p>
            <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-4 h-4 shrink-0" />
              <span>{csvRows.length} filas encontradas · {csvHeaders.length} columnas: <strong>{csvHeaders.join(', ')}</strong></span>
            </div>
            <div className="space-y-3">
              {ASSET_FIELDS.map(field => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-52 shrink-0">
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
            {duplicateCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(38,92%,50%)]/10 border border-[hsl(38,92%,50%)]/20 text-sm">
                <AlertTriangle className="w-4 h-4 text-[hsl(38,92%,50%)] shrink-0" />
                <span>
                  <strong>{duplicateCount}</strong> registro{duplicateCount > 1 ? 's' : ''} ya existe{duplicateCount > 1 ? 'n' : ''} y no se importará{duplicateCount > 1 ? 'n' : ''}.
                </span>
              </div>
            )}
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left w-8">Estado</th>
                    {ASSET_FIELDS.filter(f => mapping[f.key]).map(f => (
                      <th key={f.key} className="p-2 text-left font-medium">{f.label.split(' (')[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewWithStatus.slice(0, 50).map((item, idx) => (
                    <tr key={idx} className={`border-t ${item.isDuplicate ? 'bg-destructive/5 opacity-60' : ''}`}>
                      <td className="p-2">
                        {item.isDuplicate ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Duplicado</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-accent/10 text-accent border-accent/20">Nuevo</Badge>
                        )}
                      </td>
                      {ASSET_FIELDS.filter(f => mapping[f.key]).map(f => (
                        <td key={f.key} className="p-2">{item.row[f.key] || ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewWithStatus.length > 50 && (
              <p className="text-xs text-muted-foreground text-center">Mostrando 50 de {previewWithStatus.length} filas</p>
            )}
          </div>
        )}

        {step === 'result' && importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-accent/5">
                <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{importResult.imported.length}</p>
                  <p className="text-xs text-muted-foreground">Importados correctamente</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-destructive/5">
                <XCircle className="w-6 h-6 text-destructive shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{importResult.skipped.length}</p>
                  <p className="text-xs text-muted-foreground">Omitidos (duplicados)</p>
                </div>
              </div>
            </div>

            {importResult.imported.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Importados
                </h4>
                <div className="rounded-lg border overflow-x-auto max-h-40 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50 sticky top-0">
                        <th className="p-2 text-left">Serial</th>
                        <th className="p-2 text-left">Marca</th>
                        <th className="p-2 text-left">Modelo</th>
                        <th className="p-2 text-left">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.imported.map((a, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-mono">{a.serial_number || '—'}</td>
                          <td className="p-2">{a.brand || '—'}</td>
                          <td className="p-2">{a.model || '—'}</td>
                          <td className="p-2">{a.type || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importResult.skipped.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" /> Omitidos
                </h4>
                <div className="rounded-lg border overflow-x-auto max-h-40 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50 sticky top-0">
                        <th className="p-2 text-left">Serial</th>
                        <th className="p-2 text-left">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.skipped.map((s, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-mono">{s.row.serial_number || '—'}</td>
                          <td className="p-2 text-destructive">{s.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'result' ? (
            <Button onClick={() => { reset(); onOpenChange(false); }}>Cerrar</Button>
          ) : (
            <>
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
                <Button disabled={newCount === 0} onClick={handleImport} className="gap-2">
                  <Check className="w-4 h-4" /> Importar {newCount} activo{newCount !== 1 ? 's' : ''}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
