import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ThemeToken {
  name: string;
  value: string;
  category: 'colors' | 'typography' | 'spacing' | 'shadows' | 'animations';
  description: string;
}

interface DesignSystemCLIProps {
  onGenerateComponent?: (componentName: string, props: Record<string, any>) => void;
  onUpdateTheme?: (tokens: ThemeToken[]) => void;
  className?: string;
}

export function DesignSystemCLI({
  onGenerateComponent,
  onUpdateTheme,
  className,
}: DesignSystemCLIProps) {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addOutput = useCallback((text: string) => {
    setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    setIsProcessing(true);
    const trimmedCmd = cmd.trim().toLowerCase();

    try {
      if (trimmedCmd.startsWith('generate component')) {
        const componentName = trimmedCmd.replace('generate component', '').trim();
        if (!componentName) {
          addOutput('Error: Component name required. Usage: generate component <name>');
          return;
        }

        addOutput(`Generating component: ${componentName}...`);

        // Simulate component generation
        await new Promise(resolve => setTimeout(resolve, 1000));

        const componentCode = `import React from 'react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${componentName}({ className, children }: ${componentName}Props) {
  return (
    <div className={cn('p-4 bg-card rounded-lg border border-border', className)}>
      {children || '${componentName} Component'}
    </div>
  );
}`;

        onGenerateComponent?.(componentName, { className: '', children: '' });
        addOutput(`Component ${componentName} generated successfully!`);
        addOutput('Code:');
        addOutput(componentCode);

      } else if (trimmedCmd.startsWith('create token')) {
        const tokenMatch = trimmedCmd.match(/create token (\w+) (\w+) "(.+)" "(.+)"/);
        if (!tokenMatch) {
          addOutput('Error: Invalid syntax. Usage: create token <category> <name> "<value>" "<description>"');
          return;
        }

        const [, category, name, value, description] = tokenMatch;
        const validCategories = ['colors', 'typography', 'spacing', 'shadows', 'animations'];

        if (!validCategories.includes(category)) {
          addOutput(`Error: Invalid category. Must be one of: ${validCategories.join(', ')}`);
          return;
        }

        addOutput(`Creating token: ${name}...`);

        const token: ThemeToken = {
          name,
          value,
          category: category as ThemeToken['category'],
          description,
        };

        // In real implementation, this would update the design system
        onUpdateTheme?.([token]);
        addOutput(`Token ${name} created successfully!`);

      } else if (trimmedCmd === 'list components') {
        addOutput('Available components:');
        addOutput('  - Button');
        addOutput('  - Input');
        addOutput('  - Card');
        addOutput('  - Modal');
        addOutput('  - Navigation');
        addOutput('  - Dashboard');
        addOutput('  - Chart');
        addOutput('  - Form');

      } else if (trimmedCmd === 'list tokens') {
        addOutput('Design tokens:');
        addOutput('  Colors: primary, secondary, accent, muted, destructive');
        addOutput('  Typography: font-family, font-size, line-height, font-weight');
        addOutput('  Spacing: space-1 through space-16');
        addOutput('  Shadows: shadow-sm, shadow-md, shadow-lg, shadow-xl');
        addOutput('  Animations: duration-150, duration-300, ease-in-out');

      } else if (trimmedCmd === 'help') {
        addOutput('Available commands:');
        addOutput('  generate component <name>    - Generate a new component');
        addOutput('  create token <category> <name> "<value>" "<description>" - Create a design token');
        addOutput('  list components              - List all available components');
        addOutput('  list tokens                  - List all design tokens');
        addOutput('  help                         - Show this help message');
        addOutput('  clear                        - Clear the output');

      } else if (trimmedCmd === 'clear') {
        setOutput([]);

      } else {
        addOutput(`Unknown command: ${cmd}. Type 'help' for available commands.`);
      }
    } catch (error) {
      addOutput(`Error executing command: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  }, [addOutput, onGenerateComponent, onUpdateTheme]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isProcessing) {
      executeCommand(command);
      setCommand('');
    }
  }, [command, isProcessing, executeCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  return (
    <div className={cn('bg-black text-green-400 font-mono text-sm h-96 flex flex-col', className)}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 text-white border-b border-gray-600">
        Design System CLI - Garlaws v1.0.0
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {output.length === 0 ? (
          <div className="text-gray-500">
            Welcome to the Design System CLI. Type 'help' to see available commands.
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap break-words">
              {line}
            </div>
          ))
        )}
        {isProcessing && (
          <div className="text-yellow-400 animate-pulse">
            Processing...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-600 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-green-400">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-gray-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!command.trim() || isProcessing}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
          >
            Run
          </button>
        </div>
      </form>
    </div>
  );
}