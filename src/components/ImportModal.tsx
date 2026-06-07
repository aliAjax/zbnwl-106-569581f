import { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Plus, RefreshCw, Copy } from 'lucide-react';
import type { Plot } from '../types/plot';
import { formatDate } from '../utils/dateUtils';
import { cn } from '../lib/utils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (plots: Partial<Plot>[]) => void;
  existingPlotNumbers: string[];
}

interface ParsedRow {
  rowIndex: number;
  plotNumber: string;
  owner: string | null;
  plant: string | null;
  lastWatered: string | null;
  lastWeeded: string | null;
  errors: string[];
  isNew: boolean;
}

const CSV_COLUMNS = ['地块编号', '认领人', '种植物', '最近浇水日期', '最近除草日期'];

const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return true;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const parseCSV = (text: string): string[][] => {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
};

export const ImportModal = ({ isOpen, onClose, onImport, existingPlotNumbers }: ImportModalProps) => {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const parseAndValidate = useCallback((text: string) => {
    const rows = parseCSV(text);
    const parsed: ParsedRow[] = [];

    let startIndex = 0;
    if (rows.length > 0) {
      const firstRow = rows[0].map(h => h.trim());
      const hasHeader = CSV_COLUMNS.some(col => firstRow.includes(col));
      if (hasHeader) {
        startIndex = 1;
      }
    }

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.every(cell => !cell.trim())) continue;

      const errors: string[] = [];
      const plotNumber = row[0]?.trim() || '';
      const owner = row[1]?.trim() || null;
      const plant = row[2]?.trim() || null;
      const lastWatered = row[3]?.trim() || null;
      const lastWeeded = row[4]?.trim() || null;

      if (!plotNumber) {
        errors.push('地块编号不能为空');
      }

      if (lastWatered && !isValidDate(lastWatered)) {
        errors.push('最近浇水日期格式无效');
      }

      if (lastWeeded && !isValidDate(lastWeeded)) {
        errors.push('最近除草日期格式无效');
      }

      parsed.push({
        rowIndex: i + 1,
        plotNumber,
        owner,
        plant,
        lastWatered,
        lastWeeded,
        errors,
        isNew: !existingPlotNumbers.includes(plotNumber),
      });
    }

    setParsedRows(parsed);
    setHasParsed(true);
  }, [existingPlotNumbers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseAndValidate(text);
    };
    reader.readAsText(file);
  };

  const handleParse = () => {
    parseAndValidate(csvText);
  };

  const handleImport = () => {
    const validRows = parsedRows.filter(row => row.errors.length === 0);
    const plotsToImport: Partial<Plot>[] = validRows.map(row => ({
      plotNumber: row.plotNumber,
      owner: row.owner,
      plant: row.plant,
      lastWatered: row.lastWatered,
      lastWeeded: row.lastWeeded,
    }));

    onImport(plotsToImport);
    handleClose();
  };

  const handleClose = () => {
    setCsvText('');
    setParsedRows([]);
    setHasParsed(false);
    onClose();
  };

  const validCount = parsedRows.filter(r => r.errors.length === 0).length;
  const errorCount = parsedRows.filter(r => r.errors.length > 0).length;
  const newCount = parsedRows.filter(r => r.isNew && r.errors.length === 0).length;
  const updateCount = validCount - newCount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-4xl bg-cream rounded-2xl shadow-2xl animate-slide-in max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-garden-100 p-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-serif font-bold text-garden-800">
            批量导入地块
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setInputMode('paste')}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                inputMode === 'paste'
                  ? 'bg-garden-500 text-white shadow-md'
                  : 'bg-white text-garden-700 border border-garden-200 hover:bg-garden-50'
              )}
            >
              <Copy size={18} />
              粘贴 CSV 文本
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                inputMode === 'upload'
                  ? 'bg-garden-500 text-white shadow-md'
                  : 'bg-white text-garden-700 border border-garden-200 hover:bg-garden-50'
              )}
            >
              <Upload size={18} />
              上传 CSV 文件
            </button>
          </div>

          {inputMode === 'paste' ? (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <FileText size={16} />
                粘贴 CSV 内容
              </label>
              <textarea
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={`CSV 格式示例（可带表头）：\n地块编号,认领人,种植物,最近浇水日期,最近除草日期\nA01,张三,番茄,2024-01-15,2024-01-10\nA02,李四,黄瓜,,\nB01,王五,生菜,2024-01-20,`}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all resize-none font-mono text-sm"
              />
              <button
                onClick={handleParse}
                disabled={!csvText.trim()}
                className="mt-3 px-6 py-2.5 bg-garden-100 text-garden-700 rounded-xl hover:bg-garden-200 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw size={16} />
                解析预览
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <Upload size={16} />
                选择 CSV 文件
              </label>
              <div className="border-2 border-dashed border-garden-200 rounded-xl p-8 text-center bg-white hover:border-garden-400 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-garden-400" />
                  <span className="text-garden-700 font-medium">点击选择 CSV 文件</span>
                  <span className="text-garden-500 text-sm">或拖拽文件到此处</span>
                </label>
              </div>
            </div>
          )}

          {hasParsed && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={16} className="text-garden-600" />
                  <span className="text-garden-700">有效: <span className="font-semibold">{validCount}</span></span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-red-600">错误: <span className="font-semibold">{errorCount}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Plus size={16} className="text-blue-500" />
                  <span className="text-blue-600">新增: <span className="font-semibold">{newCount}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw size={16} className="text-amber-500" />
                  <span className="text-amber-600">覆盖: <span className="font-semibold">{updateCount}</span></span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-garden-200 overflow-hidden">
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-garden-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">行号</th>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">地块编号</th>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">认领人</th>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">种植物</th>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">最近浇水</th>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">最近除草</th>
                        <th className="px-3 py-2.5 text-left text-garden-700 font-medium border-b border-garden-200">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className={cn(
                          'border-b border-garden-100 last:border-0',
                          row.errors.length > 0 ? 'bg-red-50' : ''
                        )}>
                          <td className="px-3 py-2.5 text-garden-600">{row.rowIndex}</td>
                          <td className="px-3 py-2.5 font-medium text-garden-800">{row.plotNumber || '-'}</td>
                          <td className="px-3 py-2.5 text-garden-700">{row.owner || '-'}</td>
                          <td className="px-3 py-2.5 text-garden-700">{row.plant || '-'}</td>
                          <td className="px-3 py-2.5 text-garden-700">{formatDate(row.lastWatered)}</td>
                          <td className="px-3 py-2.5 text-garden-700">{formatDate(row.lastWeeded)}</td>
                          <td className="px-3 py-2.5">
                            {row.errors.length > 0 ? (
                              <div className="flex items-center gap-1 text-red-600" title={row.errors.join('; ')}>
                                <AlertCircle size={14} />
                                <span className="text-xs">{row.errors.join(', ')}</span>
                              </div>
                            ) : row.isNew ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                <Plus size={12} />
                                新增
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                <RefreshCw size={12} />
                                覆盖
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-cream border-t border-garden-100 p-4 rounded-b-2xl flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl border border-garden-200 text-garden-700 font-medium hover:bg-garden-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={!hasParsed || validCount === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-garden-500 text-white font-medium hover:bg-garden-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              确认导入 ({validCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
