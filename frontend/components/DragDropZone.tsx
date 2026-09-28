"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  ArrowUpFromLine,
} from "lucide-react";

interface DragDropZoneProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accept: string;
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  processed?: boolean;
  error?: string | null;
  maxSize?: number;
}

export function DragDropZone({
  title,
  description,
  icon,
  iconBg,
  iconColor,
  accept,
  onFileSelect,
  isProcessing = false,
  processed = false,
  error: propError,
  maxSize = 10,
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[] | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use prop error or local error
  const displayError = propError || localError;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing && !processed) {
      setIsDragOver(true);
    }
  }, [isProcessing, processed]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isProcessing || processed) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [isProcessing, processed]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFile = (file: File) => {
    const allowedTypes = accept.split(",").map(t => t.trim());
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      setLocalError(`Tipo de archivo no válido. Formatos permitidos: ${accept}`);
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setLocalError(`El archivo supera el tamaño máximo de ${maxSize}MB`);
      return;
    }

    setLocalError(null);
    setFileName(file.name);
    setPreviewData(null);
    onFileSelect(file);

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").slice(0, 5);
        setPreviewData(lines);
      };
      reader.readAsText(file);
    }
  };

  const removeFile = () => {
    setFileName(null);
    setPreviewData(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isProcessing || processed}
        aria-label={`Subir ${title}`}
      />

      <div
        className={`
          relative group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragOver 
            ? "border-indigo-500 bg-indigo-50 drag-over" 
            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
          }
          ${processed ? "border-green-500 bg-green-50" : ""}
          ${displayError ? "border-red-500 bg-red-50" : ""}
          ${isProcessing ? "opacity-75 pointer-events-none" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && !processed && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isProcessing && !processed) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label={isProcessing ? "Procesando archivo..." : `Área de carga para ${title}. Arrastra un archivo o haz clic para seleccionar.`}
      >
        <div className={`mx-auto mb-4 transition-transform duration-300 ${isDragOver ? "scale-110" : ""}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${iconBg}`}>
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-hidden="true" />
            ) : processed ? (
              <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
            ) : displayError ? (
              <AlertCircle className="w-8 h-8 text-red-600" aria-hidden="true" />
            ) : (
              <span className={iconColor}>{icon}</span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {processed ? "Archivo cargado" : title}
        </h3>
        <p className="text-slate-500 mb-4">{processed ? `Listo para procesar: ${fileName}` : description}</p>

        {fileName && !processed && !displayError && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-left">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} flex-shrink-0`}>
                <span className={iconColor}>
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                <p className="text-xs text-slate-500">Listo para procesar</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFile();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Eliminar archivo"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al cargar</p>
              <p className="text-xs text-red-600 mt-0.5">{displayError}</p>
            </div>
          </div>
        )}

        {previewData && previewData.length > 0 && !processed && !displayError && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl text-left max-h-40 overflow-auto">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Vista previa (primeras 5 filas):</p>
            <pre className="text-xs font-mono text-slate-600 whitespace-pre-wrap">
              {previewData.map((line, i) => (
                <div key={i} className={i === 0 ? "font-semibold" : ""}>{line}</div>
              ))}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!fileName && !processed && !isProcessing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              Seleccionar archivo
            </button>
          )}

          {fileName && !processed && !isProcessing && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUpFromLine className="w-4 h-4" aria-hidden="true" />
              Procesar archivo
            </button>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" aria-hidden="true" />
              <span className="text-sm font-medium">Procesando...</span>
            </div>
          )}

          {processed && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Completado</span>
            </div>
          )}
        </div>

        {!fileName && !processed && (
          <p className="mt-6 text-xs text-slate-400">
            Formatos: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{accept.replace(/,/g, ", ")}</code>
            • Máx. {maxSize}MB
          </p>
        )}
      </div>

      {processed && (
        <div className="absolute inset-0 bg-green-50/90 rounded-2xl flex items-center justify-center animate-fade-in pointer-events-none" aria-hidden="true">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3 animate-fade-in" />
            <h4 className="text-lg font-semibold text-green-800">¡Archivo procesado!</h4>
            <p className="text-sm text-green-600 mt-1">Los datos están listos para conciliar</p>
          </div>
        </div>
      )}
    </div>
  );
}