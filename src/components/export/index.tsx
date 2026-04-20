'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedButton } from '@/components/animations';
import {
  Download,
  FileText,
  Image,
  FileSpreadsheet,
  Code,
  Share,
  Copy,
  Mail,
  Printer,
  Settings,
} from 'lucide-react';
import { DashboardWidget } from '@/components/dashboard';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg' | 'csv' | 'json' | 'xlsx';
  quality?: number;
  includeCharts?: boolean;
  includeMetadata?: boolean;
  customTitle?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'analytics' | 'financial' | 'operational';
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
    spacing: number;
  };
  exportOptions: ExportOptions;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    time: string;
  };
}

// Export Dialog Component
interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  availableFormats?: ExportOptions['format'][];
  defaultOptions?: Partial<ExportOptions>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  availableFormats = ['pdf', 'png', 'svg', 'csv', 'json'],
  defaultOptions = {},
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    quality: 90,
    includeCharts: true,
    includeMetadata: true,
    ...defaultOptions,
  });

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  const formatConfig = {
    pdf: { label: 'PDF Document', icon: FileText, description: 'High-quality document format' },
    png: { label: 'PNG Image', icon: Image, description: 'Raster image format' },
    svg: { label: 'SVG Vector', icon: Image, description: 'Scalable vector graphics' },
    csv: { label: 'CSV Data', icon: FileSpreadsheet, description: 'Comma-separated values' },
    json: { label: 'JSON Data', icon: Code, description: 'Structured data format' },
    xlsx: { label: 'Excel Workbook', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Export Dashboard</h2>
          <AnimatedButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            animation="scale"
          >
            <X size={16} />
          </AnimatedButton>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              {availableFormats.map((format) => {
                const config = formatConfig[format];
                const IconComponent = config.icon;

                return (
                  <button
                    key={format}
                    onClick={() => setOptions(prev => ({ ...prev, format }))}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border transition-all',
                      options.format === format
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <IconComponent size={20} className="text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Settings */}
          {(options.format === 'png' || options.format === 'pdf') && (
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <input
                type="range"
                min="50"
                max="100"
                value={options.quality}
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>50%</span>
                <span>{options.quality}%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeCharts}
                onChange={(e) => setOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Include charts and visualizations</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Include metadata and timestamps</span>
            </label>
          </div>

          {/* Custom Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Title (Optional)</label>
            <input
              type="text"
              value={options.customTitle || ''}
              onChange={(e) => setOptions(prev => ({ ...prev, customTitle: e.target.value || undefined }))}
              placeholder="Enter custom title..."
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <AnimatedButton
            variant="outline"
            onClick={onClose}
            animation="scale"
          >
            Cancel
          </AnimatedButton>
          <AnimatedButton
            onClick={handleExport}
            animation="scale"
          >
            <Download size={16} className="mr-2" />
            Export
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
};

// Share Dialog Component
interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId?: string;
  dashboardTitle?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  dashboardId,
  dashboardTitle,
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  React.useEffect(() => {
    if (dashboardId) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/dashboard/${dashboardId}`);
    }
  }, [dashboardId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show success toast
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Dashboard: ${dashboardTitle || 'Shared Dashboard'}`);
    const body = encodeURIComponent(`Check out this dashboard: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Share Dashboard</h2>
          <AnimatedButton variant="ghost" size="icon" onClick={onClose} animation="scale">
            <X size={16} />
          </AnimatedButton>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Make dashboard public</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Public dashboards can be viewed by anyone with the link
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Share Link</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-md"
              />
              <AnimatedButton
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                animation="scale"
              >
                <Copy size={14} />
              </AnimatedButton>
            </div>
          </div>

          <div className="flex space-x-2">
            <AnimatedButton
              variant="outline"
              onClick={shareViaEmail}
              animation="scale"
              className="flex-1"
            >
              <Mail size={16} className="mr-2" />
              Email
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              onClick={() => window.print()}
              animation="scale"
              className="flex-1"
            >
              <Printer size={16} className="mr-2" />
              Print
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Export Utility
export class DashboardExporter {
  static async exportToPDF(
    dashboardElement: HTMLElement,
    options: ExportOptions
  ): Promise<void> {
    // Implementation for PDF export using libraries like jsPDF or Puppeteer
    console.log('Exporting to PDF with options:', options);
  }

  static async exportToImage(
    dashboardElement: HTMLElement,
    options: ExportOptions
  ): Promise<void> {
    // Implementation for image export using html2canvas
    console.log('Exporting to image with options:', options);
  }

  static async exportToCSV(
    widgets: DashboardWidget[],
    options: ExportOptions
  ): Promise<void> {
    const csvData: string[][] = [];

    // Add headers
    csvData.push(['Widget Title', 'Type', 'Data Points', 'Last Updated']);

    // Add widget data
    widgets.forEach(widget => {
      csvData.push([
        widget.title,
        widget.type,
        widget.data ? JSON.stringify(widget.data) : '',
        widget.lastUpdated?.toISOString() || '',
      ]);
    });

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, `${options.customTitle || 'dashboard'}.csv`);
  }

  static async exportToJSON(
    widgets: DashboardWidget[],
    options: ExportOptions
  ): Promise<void> {
    const exportData = {
      title: options.customTitle || 'Dashboard Export',
      exportedAt: new Date().toISOString(),
      widgets: widgets.map(widget => ({
        ...widget,
        // Remove non-serializable properties
        lastUpdated: widget.lastUpdated?.toISOString(),
      })),
      metadata: {
        format: options.format,
        includeCharts: options.includeCharts,
        includeMetadata: options.includeMetadata,
      },
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadBlob(blob, `${options.customTitle || 'dashboard'}.json`);
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async exportDashboard(
    dashboardElement: HTMLElement | null,
    widgets: DashboardWidget[],
    options: ExportOptions
  ): Promise<void> {
    switch (options.format) {
      case 'pdf':
        if (dashboardElement) {
          await this.exportToPDF(dashboardElement, options);
        }
        break;
      case 'png':
      case 'svg':
        if (dashboardElement) {
          await this.exportToImage(dashboardElement, options);
        }
        break;
      case 'csv':
        await this.exportToCSV(widgets, options);
        break;
      case 'json':
        await this.exportToJSON(widgets, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }
}

// Report Generator Component
interface ReportGeneratorProps {
  templates: ReportTemplate[];
  onGenerateReport: (template: ReportTemplate, options: ExportOptions) => void;
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  templates,
  onGenerateReport,
  className,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeMetadata: true,
  });

  const handleGenerate = () => {
    if (selectedTemplate) {
      onGenerateReport(selectedTemplate, exportOptions);
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Generate Report</h3>

        {/* Template Selection */}
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {category} Reports
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates
                  .filter(template => template.category === category)
                  .map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={cn(
                        'p-4 text-left border rounded-lg transition-all hover:shadow-md',
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <h5 className="font-medium">{template.name}</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      {selectedTemplate && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-4">Export Options</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(['pdf', 'png', 'csv', 'json'] as const).map(format => (
              <button
                key={format}
                onClick={() => setExportOptions(prev => ({ ...prev, format }))}
                className={cn(
                  'p-3 text-center border rounded-lg transition-all',
                  exportOptions.format === format
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="text-sm font-medium uppercase">{format}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeCharts}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeCharts: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Include charts</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeMetadata: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Include metadata</span>
            </label>
          </div>

          <AnimatedButton
            onClick={handleGenerate}
            animation="scale"
            className="w-full"
          >
            <Download size={16} className="mr-2" />
            Generate Report
          </AnimatedButton>
        </div>
      )}
    </div>
  );
};

// Import X for the dialogs
import { X } from 'lucide-react';

export {
  ExportDialog,
  ShareDialog,
  ReportGenerator,
  DashboardExporter,
  type ExportOptions,
  type ReportTemplate,
};