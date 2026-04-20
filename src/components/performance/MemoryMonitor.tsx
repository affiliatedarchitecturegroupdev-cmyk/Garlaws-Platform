'use client';

import React from 'react';
import { useMemoryManagement } from './useMemoryManagement';
import { cn } from '@/lib/utils';

interface MemoryMonitorProps {
  className?: string;
  showDetails?: boolean;
}

export function MemoryMonitor({ className, showDetails = true }: MemoryMonitorProps) {
  const {
    memoryInfo,
    isLowMemory,
    startMonitoring,
    stopMonitoring,
    forceGarbageCollection,
    formatBytes,
  } = useMemoryManagement();

  if (!memoryInfo) {
    return (
      <div className={cn('p-4 bg-card rounded-lg border border-border', className)}>
        <p className="text-muted-foreground">Memory monitoring not available</p>
      </div>
    );
  }

  const heapUsagePercent = memoryInfo.heapLimit > 0
    ? (memoryInfo.heapUsed / memoryInfo.heapLimit) * 100
    : 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Memory Usage</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={forceGarbageCollection}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Force GC
          </button>
        </div>
      </div>

      {/* Memory Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-3 rounded-lg border border-border text-center">
          <div className="text-lg font-semibold text-primary">
            {formatBytes(memoryInfo.heapUsed)}
          </div>
          <div className="text-xs text-muted-foreground">Heap Used</div>
        </div>

        <div className="bg-card p-3 rounded-lg border border-border text-center">
          <div className="text-lg font-semibold text-blue-600">
            {formatBytes(memoryInfo.heapTotal)}
          </div>
          <div className="text-xs text-muted-foreground">Heap Total</div>
        </div>

        {memoryInfo.heapLimit > 0 && (
          <div className="bg-card p-3 rounded-lg border border-border text-center">
            <div className="text-lg font-semibold text-green-600">
              {formatBytes(memoryInfo.heapLimit)}
            </div>
            <div className="text-xs text-muted-foreground">Heap Limit</div>
          </div>
        )}

        <div className="bg-card p-3 rounded-lg border border-border text-center">
          <div className={cn(
            'text-lg font-semibold',
            isLowMemory ? 'text-red-600' : 'text-green-600'
          )}>
            {heapUsagePercent.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Usage</div>
        </div>
      </div>

      {/* Memory Usage Bar */}
      {memoryInfo.heapLimit > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Heap Usage</span>
            <span className={cn(
              'font-medium',
              isLowMemory ? 'text-red-600' : 'text-green-600'
            )}>
              {formatBytes(memoryInfo.heapUsed)} / {formatBytes(memoryInfo.heapLimit)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-300',
                isLowMemory ? 'bg-red-500' : 'bg-green-500'
              )}
              style={{ width: `${Math.min(heapUsagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* External Memory */}
      {memoryInfo.external > 0 && showDetails && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">External Memory</span>
            <span className="text-sm font-medium">{formatBytes(memoryInfo.external)}</span>
          </div>
        </div>
      )}

      {/* RSS (Node.js) */}
      {memoryInfo.rss && showDetails && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Resident Set Size</span>
            <span className="text-sm font-medium">{formatBytes(memoryInfo.rss)}</span>
          </div>
        </div>
      )}

      {/* Memory Warnings */}
      {isLowMemory && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-sm text-yellow-800 font-medium">High Memory Usage</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Memory usage is above 80%. Consider optimizing components or forcing garbage collection.
          </p>
        </div>
      )}
    </div>
  );
}