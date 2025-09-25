import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { analytics } from '../services/analytics';

interface TablePaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(count / rowsPerPage);
  const from = count === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min((page + 1) * rowsPerPage, count);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = (format: 'csv' | 'pdf' | 'excel' | 'print' | 'png') => {
    analytics.track('action_clicked', { action: 'download_data', format });
    if (format === 'print') {
        alert('Abrindo a janela de impressão...');
        window.print();
    } else {
        alert(`Iniciando download do relatório em formato ${format.toUpperCase()}... (funcionalidade simulada)`);
    }
    setDownloadMenuOpen(false);
  };

  return (
    <div className="p-4 flex items-center justify-between gap-8 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 shrink-0 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span>Itens por página</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            aria-label="Itens por página"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <span>{`${from} - ${to} de ${count}`}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(0)}
              disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Primeira página"
            >
              <Icon name="first_page" size="sm" />
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <Icon name="navigate_before" size="sm" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próxima página"
            >
              <Icon name="navigate_next" size="sm" />
            </button>
            <button
              onClick={() => onPageChange(Math.max(0, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Última página"
            >
              <Icon name="last_page" size="sm" />
            </button>
          </div>
        </div>
      </div>
      <div className="relative" ref={downloadMenuRef}>
        <button
          onClick={() => setDownloadMenuOpen(!isDownloadMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500 transition-colors"
        >
          <Icon name="download" size="sm" />
          <span>Baixar Dados</span>
          <Icon name="expand_more" size="sm" className={`transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDownloadMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-600 animate-fadeInUp">
            <a onClick={() => handleDownload('csv')} className="cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg transition-colors">
              <Icon name="description" size="sm" />
              <span>Exportar .csv</span>
            </a>
            <a onClick={() => handleDownload('pdf')} className="cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Icon name="picture_as_pdf" size="sm" />
              <span>Exportar .pdf</span>
            </a>
            <a onClick={() => handleDownload('excel')} className="cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Icon name="grid_on" size="sm" />
              <span>Exportar .excel</span>
            </a>
            <a onClick={() => handleDownload('png')} className="cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Icon name="image" size="sm" />
              <span>Exportar .png</span>
            </a>
            <a onClick={() => handleDownload('print')} className="cursor-pointer flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-lg transition-colors">
              <Icon name="print" size="sm" />
              <span>Imprimir</span>
            </a>
          </div>
        )}
        <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp { animation: fadeInUp 0.2s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};
