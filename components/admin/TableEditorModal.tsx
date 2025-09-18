import React, { useState, useEffect } from 'react';
import { Icon } from '../Icon';

interface TableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTable: (markdown: string) => void;
  initialMarkdown: string;
}

const parseMarkdown = (markdown: string): { headers: string[]; rows: string[][] } => {
  if (!markdown) return { headers: [], rows: [] };
  const lines = markdown.trim().split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
  
  // Find the separator line index
  let separatorIndex = lines.findIndex(line => line.includes('---'));
  if (separatorIndex === -1) separatorIndex = 1; // Fallback

  const rows = lines.slice(separatorIndex + 1).map(rowLine => 
    rowLine.split('|').slice(1, -1).map(cell => cell.trim())
  );

  return { headers, rows };
};

const serializeToMarkdown = (headers: string[], rows: string[][]): string => {
  if (headers.length === 0) return '';
  const headerLine = `| ${headers.join(' | ')} |`;
  const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const rowLines = rows.map(row => {
    // Ensure row has the same number of columns as headers
    const normalizedRow = Array(headers.length).fill('').map((_, i) => row[i] || '');
    return `| ${normalizedRow.join(' | ')} |`;
  }).join('\n');
  
  return [headerLine, separatorLine, rowLines].join('\n');
};

const TableEditorModal: React.FC<TableEditorModalProps> = ({ isOpen, onClose, onUpdateTable, initialMarkdown }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  useEffect(() => {
    if (isOpen) {
      const { headers, rows } = parseMarkdown(initialMarkdown);
      setHeaders(headers);
      setRows(rows);
    }
  }, [isOpen, initialMarkdown]);

  if (!isOpen) return null;
  
  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = rows.map((row, rIdx) => {
        if (rIdx === rowIndex) {
            const newRow = [...row];
            newRow[colIndex] = value;
            return newRow;
        }
        return row;
    });
    setRows(newRows);
  };
  
  const addRow = () => {
    setRows([...rows, Array(headers.length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    setRows(rows.filter((_, i) => i !== rowIndex));
  };
  
  const addColumn = () => {
    setHeaders([...headers, 'New Column']);
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (colIndex: number) => {
    setHeaders(headers.filter((_, i) => i !== colIndex));
    setRows(rows.map(row => row.filter((_, i) => i !== colIndex)));
  };

  const handleUpdate = () => {
    const newMarkdown = serializeToMarkdown(headers, rows);
    onUpdateTable(newMarkdown);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[102] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl w-full max-w-4xl m-4 relative flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center text-gray-900 dark:text-white flex-shrink-0">
          <h2 className="text-xl font-bold">Visual Table Editor</h2>
          <button onClick={onClose}><Icon name="close" className="h-6 w-6" /></button>
        </header>
        <main className="flex-grow p-4 overflow-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-gray-900 dark:text-white min-w-[600px]">
                <thead>
                  <tr>
                    {headers.map((header, colIndex) => (
                      <th key={colIndex} className="p-1 border border-gray-300 dark:border-white/20">
                        <div className="flex items-center gap-2">
                           <input value={header} onChange={e => handleHeaderChange(colIndex, e.target.value)} className="w-full bg-gray-100 dark:bg-black/50 p-2 rounded font-bold" />
                           <button onClick={() => removeColumn(colIndex)} className="text-red-400 hover:text-red-300 flex-shrink-0 p-1 font-mono text-lg">&times;</button>
                        </div>
                      </th>
                    ))}
                    <th className="p-2 border border-gray-300 dark:border-white/20 w-12">
                        <button onClick={addColumn} className="w-full bg-blue-500/20 text-blue-300 text-sm font-bold py-1 rounded-full">+</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {headers.map((_, colIndex) => (
                        <td key={colIndex} className="p-1 border border-gray-300 dark:border-white/20">
                          <input value={row[colIndex] || ''} onChange={e => handleCellChange(rowIndex, colIndex, e.target.value)} className="w-full bg-transparent p-2 rounded focus:bg-gray-100 dark:focus:bg-black/50 outline-none" />
                        </td>
                      ))}
                      <td className="p-2 border border-gray-300 dark:border-white/20 text-center">
                        <button onClick={() => removeRow(rowIndex)} className="text-red-400 hover:text-red-300 font-bold p-1 font-mono text-lg">&times;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addRow} className="w-full bg-blue-500/20 text-blue-300 font-bold py-2 rounded-lg hover:bg-blue-500/30">+ Add Row</button>
          </div>
        </main>
        <footer className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-4 flex-shrink-0">
          <button onClick={onClose} className="bg-gray-200 dark:bg-white/10 py-2 px-4 rounded-lg">Cancel</button>
          <button onClick={handleUpdate} className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Update Table</button>
        </footer>
      </div>
    </div>
  );
};

export default TableEditorModal;