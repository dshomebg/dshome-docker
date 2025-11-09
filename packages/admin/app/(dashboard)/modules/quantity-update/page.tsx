"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileSpreadsheet, Save, Play, Trash2, Download, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { productImportService, ExcelColumn, ImportResult } from "@/lib/services/product-import.service";
import { importTemplatesService, ImportTemplate } from "@/lib/services/import-templates.service";

type ImportStep = 'upload' | 'mapping' | 'preview' | 'processing' | 'results';

const FIELD_OPTIONS = [
  { value: '', label: '-- Игнорирай колоната --' },
  { value: 'sku', label: 'SKU (Референтен номер)' },
  { value: 'salePrice', label: 'Продажна цена с ДДС' },
  { value: 'purchasePrice', label: 'Доставна цена' },
  { value: 'warehouse1Id', label: 'Склад 1 - ID' },
  { value: 'warehouse1Qty', label: 'Склад 1 - Количество' },
  { value: 'warehouse2Id', label: 'Склад 2 - ID' },
  { value: 'warehouse2Qty', label: 'Склад 2 - Количество' },
  { value: 'warehouse3Id', label: 'Склад 3 - ID' },
  { value: 'warehouse3Qty', label: 'Склад 3 - Количество' },
  { value: 'warehouse4Id', label: 'Склад 4 - ID' },
  { value: 'warehouse4Qty', label: 'Склад 4 - Количество' },
  { value: 'warehouse5Id', label: 'Склад 5 - ID' },
  { value: 'warehouse5Qty', label: 'Склад 5 - Количество' },
  { value: 'warehouse6Id', label: 'Склад 6 - ID' },
  { value: 'warehouse6Qty', label: 'Склад 6 - Количество' }
];

export default function QuantityUpdatePage() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<ExcelColumn[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<ImportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await importTemplatesService.getImportTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      alert('Моля изберете Excel файл (.xlsx или .xls)');
      return;
    }

    setFile(selectedFile);

    try {
      // Parse the Excel file
      const response = await productImportService.parseExcel(selectedFile);
      setColumns(response.data.columns);
      setPreviewData(response.data.preview);
      setTotalRows(response.data.totalRows);

      // Initialize empty column mapping
      const initialMapping: Record<string, string> = {};
      response.data.columns.forEach(col => {
        initialMapping[col.header] = '';
      });
      setColumnMapping(initialMapping);

      setCurrentStep('mapping');
    } catch (error: any) {
      console.error('Error parsing Excel:', error);
      alert(error.response?.data?.message || 'Грешка при четене на Excel файла');
    }
  };

  const handleColumnMappingChange = (columnHeader: string, fieldName: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [columnHeader]: fieldName
    }));
  };

  const handleLoadTemplate = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate('');
      setTemplateName('');
      return;
    }

    try {
      const response = await importTemplatesService.getImportTemplate(templateId);
      setColumnMapping(response.data.columnMapping);
      setSelectedTemplate(templateId);
      setTemplateName(response.data.name); // Load template name for updates
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Грешка при зареждане на шаблона');
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Моля въведете име на шаблона');
      return;
    }

    try {
      if (selectedTemplate) {
        // Update existing template
        await importTemplatesService.updateImportTemplate(selectedTemplate, {
          name: templateName,
          columnMapping
        });
        alert('Шаблонът е актуализиран успешно');
      } else {
        // Create new template
        await importTemplatesService.createImportTemplate({
          name: templateName,
          columnMapping
        });
        alert('Шаблонът е създаден успешно');
      }
      setTemplateName('');
      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.response?.data?.message || 'Грешка при записване на шаблона');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този шаблон?')) {
      return;
    }

    try {
      await importTemplatesService.deleteImportTemplate(templateId);
      alert('Шаблонът е изтрит успешно');
      if (selectedTemplate === templateId) {
        setSelectedTemplate('');
      }
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Грешка при изтриване на шаблона');
    }
  };

  const handleValidate = () => {
    // Check if SKU is mapped
    const skuMapped = Object.values(columnMapping).includes('sku');
    if (!skuMapped) {
      alert('Трябва да маркирате колона като SKU!');
      return;
    }

    setCurrentStep('preview');
  };

  const handleStartImport = async () => {
    if (!file) return;

    setProcessing(true);
    setCurrentStep('processing');

    try {
      const response = await productImportService.processImport(file, columnMapping);
      setImportResult(response.data);
      setCurrentStep('results');
    } catch (error: any) {
      console.error('Error processing import:', error);
      alert(error.response?.data?.message || 'Грешка при обработка на импорта');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setColumns([]);
    setPreviewData([]);
    setTotalRows(0);
    setColumnMapping({});
    setSelectedTemplate('');
    setTemplateName('');
    setImportResult(null);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white">
          Модул: Количества - Update
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Импортиране на продуктови цени и складови количества от Excel файл
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[
            { key: 'upload', label: '1. Качване' },
            { key: 'mapping', label: '2. Маркиране' },
            { key: 'preview', label: '3. Преглед' },
            { key: 'processing', label: '4. Обработка' },
            { key: 'results', label: '5. Резултати' }
          ].map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = ['upload', 'mapping', 'preview', 'processing', 'results'].indexOf(currentStep) > index;

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-brand-500 text-white' :
                    'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-brand-600 dark:text-brand-400' :
                    isCompleted ? 'text-green-600 dark:text-green-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`h-0.5 w-12 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragActive
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-300 hover:border-brand-400 dark:border-gray-700 dark:hover:border-brand-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Качете Excel файл
              </h3>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Плъзнете и пуснете файла тук или щракнете за да изберете
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                <Upload className="h-4 w-4" />
                Изберете файл
              </button>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Поддържани формати: .xlsx, .xls
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {currentStep === 'mapping' && (
        <div className="space-y-6">
          {/* Template Management */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Шаблони за маркиране
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Зареди шаблон
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleLoadTemplate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">-- Изберете шаблон --</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Запази като шаблон
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Име на шаблон"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  <Save className="h-4 w-4" />
                  {selectedTemplate ? 'Обнови' : 'Запази'}
                </button>
                {selectedTemplate && (
                  <button
                    onClick={() => handleDeleteTemplate(selectedTemplate)}
                    className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Column Mapping Table */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="border-b border-gray-200 p-6 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Маркиране на колони
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Маркирайте кои колони от файла отговарят на кои полета. SKU е задължително.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Excel колона
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Примерна стойност
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Маркирай като
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {columns.map((column) => (
                    <tr key={column.index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {column.header}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {previewData[0]?.[column.header] || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={columnMapping[column.header] || ''}
                          onChange={(e) => handleColumnMappingChange(column.header, e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                          {FIELD_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Назад
              </button>
              <button
                onClick={handleValidate}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                Напред
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Преглед на данните
            </h3>
            <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Готови сте за импорт
                  </p>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Общо редове за обработка: <strong>{totalRows}</strong>
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm text-blue-700 dark:text-blue-300">
                    <li>Продукти, които не съществуват ще бъдат игнорирани</li>
                    <li>Складове, които не съществуват ще бъдат игнорирани</li>
                    <li>Цените ще се обновят само ако са попълнени</li>
                    <li>Количествата ще се заменят с новите стойности</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('mapping')}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Назад
              </button>
              <button
                onClick={handleStartImport}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <Play className="h-4 w-4" />
                Започни импорт
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Processing */}
      {currentStep === 'processing' && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Обработка на импорта...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Моля изчакайте, докато обработваме вашия файл
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {currentStep === 'results' && importResult && (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Success/Error Summary */}
          <div className={`rounded-xl border p-6 ${
            importResult.success
              ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
          }`}>
            <div className="flex items-start gap-4">
              {importResult.success ? (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${
                  importResult.success
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {importResult.success ? 'Импортът завърши успешно!' : 'Импортът завърши с грешки'}
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Общо редове</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{importResult.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Обработени</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult.processedRows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Пропуснати</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{importResult.skippedRows}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Обновени продукти</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{importResult.updatedProducts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Обновени цени</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{importResult.updatedPrices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Обновени количества</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{importResult.updatedInventories}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-white/[0.03]">
              <h4 className="mb-4 text-lg font-semibold text-red-900 dark:text-red-100">
                Грешки ({importResult.errors.length})
              </h4>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10"
                  >
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Ред {error.row}: SKU {error.sku}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">{error.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="rounded-lg bg-brand-500 px-8 py-3 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              Нов импорт
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
