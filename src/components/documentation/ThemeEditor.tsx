import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ThemeColor {
  name: string;
  value: string;
  category: string;
}

interface ThemeEditorProps {
  onThemeChange?: (theme: Record<string, string>) => void;
  className?: string;
}

export function ThemeEditor({ onThemeChange, className }: ThemeEditorProps) {
  const [colors, setColors] = useState<ThemeColor[]>([
    // Primary colors
    { name: 'primary', value: '#3b82f6', category: 'Primary' },
    { name: 'primary-foreground', value: '#ffffff', category: 'Primary' },

    // Secondary colors
    { name: 'secondary', value: '#f1f5f9', category: 'Secondary' },
    { name: 'secondary-foreground', value: '#0f172a', category: 'Secondary' },

    // Accent colors
    { name: 'accent', value: '#f1f5f9', category: 'Accent' },
    { name: 'accent-foreground', value: '#0f172a', category: 'Accent' },

    // Destructive colors
    { name: 'destructive', value: '#ef4444', category: 'Destructive' },
    { name: 'destructive-foreground', value: '#ffffff', category: 'Destructive' },

    // Muted colors
    { name: 'muted', value: '#f1f5f9', category: 'Muted' },
    { name: 'muted-foreground', value: '#64748b', category: 'Muted' },

    // Card colors
    { name: 'card', value: '#ffffff', category: 'Card' },
    { name: 'card-foreground', value: '#0f172a', category: 'Card' },

    // Background colors
    { name: 'background', value: '#ffffff', category: 'Background' },
    { name: 'foreground', value: '#0f172a', category: 'Background' },

    // Border colors
    { name: 'border', value: '#e2e8f0', category: 'Border' },
    { name: 'input', value: '#e2e8f0', category: 'Border' },

    // Ring colors
    { name: 'ring', value: '#3b82f6', category: 'Ring' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewText, setPreviewText] = useState('Preview your theme changes');
  const [previewComponent, setPreviewComponent] = useState<'button' | 'card' | 'input'>('button');

  const categories = Array.from(new Set(colors.map(c => c.category)));

  const filteredColors = selectedCategory === 'all'
    ? colors
    : colors.filter(c => c.category === selectedCategory);

  const updateColor = useCallback((name: string, value: string) => {
    setColors(prev => prev.map(color =>
      color.name === name ? { ...color, value } : color
    ));
  }, []);

  const resetToDefault = useCallback(() => {
    setColors([
      { name: 'primary', value: '#3b82f6', category: 'Primary' },
      { name: 'primary-foreground', value: '#ffffff', category: 'Primary' },
      { name: 'secondary', value: '#f1f5f9', category: 'Secondary' },
      { name: 'secondary-foreground', value: '#0f172a', category: 'Secondary' },
      { name: 'accent', value: '#f1f5f9', category: 'Accent' },
      { name: 'accent-foreground', value: '#0f172a', category: 'Accent' },
      { name: 'destructive', value: '#ef4444', category: 'Destructive' },
      { name: 'destructive-foreground', value: '#ffffff', category: 'Destructive' },
      { name: 'muted', value: '#f1f5f9', category: 'Muted' },
      { name: 'muted-foreground', value: '#64748b', category: 'Muted' },
      { name: 'card', value: '#ffffff', category: 'Card' },
      { name: 'card-foreground', value: '#0f172a', category: 'Card' },
      { name: 'background', value: '#ffffff', category: 'Background' },
      { name: 'foreground', value: '#0f172a', category: 'Background' },
      { name: 'border', value: '#e2e8f0', category: 'Border' },
      { name: 'input', value: '#e2e8f0', category: 'Border' },
      { name: 'ring', value: '#3b82f6', category: 'Ring' },
    ]);
  }, []);

  const exportTheme = useCallback(() => {
    const themeObject = colors.reduce((acc, color) => {
      acc[color.name] = color.value;
      return acc;
    }, {} as Record<string, string>);

    const themeJson = JSON.stringify(themeObject, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [colors]);

  const applyTheme = useCallback(() => {
    const themeObject = colors.reduce((acc, color) => {
      acc[color.name] = color.value;
      return acc;
    }, {} as Record<string, string>);

    onThemeChange?.(themeObject);

    // Apply to CSS custom properties
    const root = document.documentElement;
    Object.entries(themeObject).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [colors, onThemeChange]);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const renderPreview = () => {
    const themeVars = colors.reduce((acc, color) => {
      acc[`--${color.name}`] = color.value;
      return acc;
    }, {} as Record<string, string>);

    const style = { ...themeVars } as React.CSSProperties;

    switch (previewComponent) {
      case 'button':
        return (
          <div className="space-y-4">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              style={style}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              style={style}
            >
              Secondary Button
            </button>
            <button
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              style={style}
            >
              Destructive Button
            </button>
          </div>
        );
      case 'card':
        return (
          <div
            className="p-6 bg-card text-card-foreground rounded-lg border border-border shadow-sm"
            style={style}
          >
            <h3 className="font-semibold mb-2">Sample Card</h3>
            <p className="text-muted-foreground">{previewText}</p>
          </div>
        );
      case 'input':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Sample input"
              className="px-3 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
              style={style}
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
            />
            <textarea
              placeholder="Sample textarea"
              className="px-3 py-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring w-full"
              style={style}
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              rows={3}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Theme Editor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetToDefault}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
          >
            Reset
          </button>
          <button
            onClick={exportTheme}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
          >
            Export
          </button>
          <button
            onClick={applyTheme}
            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
          >
            Apply Theme
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Editor */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-border rounded text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredColors.map(color => (
              <div key={color.name} className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = color.value;
                    input.onchange = (e) => updateColor(color.name, (e.target as HTMLInputElement).value);
                    input.click();
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{color.name}</div>
                  <div className="text-xs text-muted-foreground">{color.category}</div>
                </div>
                <input
                  type="text"
                  value={color.value}
                  onChange={(e) => updateColor(color.name, e.target.value)}
                  className="px-2 py-1 border border-border rounded text-xs font-mono w-24"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Preview:</label>
            <select
              value={previewComponent}
              onChange={(e) => setPreviewComponent(e.target.value as typeof previewComponent)}
              className="px-3 py-1 border border-border rounded text-sm"
            >
              <option value="button">Buttons</option>
              <option value="card">Card</option>
              <option value="input">Form Inputs</option>
            </select>
          </div>

          <div className="p-6 bg-muted/50 rounded-lg">
            {renderPreview()}
          </div>

          {previewComponent === 'card' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview Text:</label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}