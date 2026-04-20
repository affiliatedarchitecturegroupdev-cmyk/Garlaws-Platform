'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MobileButton, SwipeableContainer } from './touch-interactions';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  SortDesc,
} from 'lucide-react';

// Bottom Tab Navigation
interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface BottomTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showLabels?: boolean;
}

const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  showLabels = true,
}) => {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border',
      'safe-area-inset-bottom', // iOS safe area
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1',
              'touch-manipulation active:scale-95',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                  {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            {showLabels && (
              <span className="text-xs mt-1 truncate max-w-full">{tab.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Floating Action Button with expandable actions
interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  icon: React.ReactNode;
  actions?: FABAction[];
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  actions = [],
  onClick,
  position = 'bottom-right',
  size = 'md',
  color = 'bg-primary',
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const handleClick = () => {
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      onClick?.();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Expanded actions */}
      {isExpanded && actions.map((action, index) => (
        <div
          key={action.id}
          className={cn(
            'fixed z-50 flex items-center space-x-3 animate-in fade-in-0 zoom-in-95',
            positions[position]
          )}
          style={{
            transform: `translateY(-${(index + 1) * 60}px)`,
            transitionDelay: `${index * 50}ms`,
          }}
        >
          <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg">
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </div>
          <button
            onClick={() => {
              action.onClick();
              setIsExpanded(false);
            }}
            className={cn(
              'rounded-full shadow-lg flex items-center justify-center text-white',
              sizes[size],
              action.color || color,
              'hover:scale-110 transition-transform active:scale-95'
            )}
          >
            {action.icon}
          </button>
        </div>
      ))}

      {/* Main FAB */}
      <button
        onClick={handleClick}
        className={cn(
          'fixed z-50 rounded-full shadow-lg flex items-center justify-center text-white',
          'transition-all duration-200 active:scale-95',
          positions[position],
          sizes[size],
          color,
          actions.length > 0 && isExpanded && 'rotate-45',
          className
        )}
      >
        {icon}
      </button>
    </>
  );
};

// Mobile Search Bar
interface MobileSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  showFilter?: boolean;
  onFilter?: () => void;
  className?: string;
}

const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSubmit,
  showFilter = false,
  onFilter,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center space-x-2 p-3 bg-background border border-border rounded-lg',
        isFocused && 'ring-2 ring-ring ring-offset-2',
        className
      )}
    >
      <Search size={20} className="text-muted-foreground flex-shrink-0" />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {showFilter && (
        <MobileButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onFilter}
          className="flex-shrink-0 p-2"
        >
          <Filter size={18} />
        </MobileButton>
      )}
    </form>
  );
};

// Responsive Table Component
interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  keyField: keyof T | string;
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortable?: boolean;
  striped?: boolean;
  compact?: boolean;
  className?: string;
}

function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  loading = false,
  emptyMessage = 'No data available',
  onSort,
  sortable = true,
  striped = false,
  compact = false,
  className,
}: ResponsiveTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (!sortable) return;

    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortColumn === column) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const visibleColumns = columns.filter(col => !col.hideOnMobile);

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}>
        <div className="text-muted-foreground mb-2">📋</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {data.map((item, index) => (
          <div
            key={String(item[keyField as keyof T])}
            className={cn(
              'bg-card border border-border rounded-lg p-4',
              striped && index % 2 === 1 && 'bg-muted/50'
            )}
          >
            {visibleColumns.map((column) => {
              const value = item[column.key as keyof T];
              const renderedValue = column.render ? column.render(value, item) : String(value);

              return (
                <div key={String(column.key)} className="flex justify-between items-center py-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {column.header}:
                  </span>
                  <span className="text-sm">{renderedValue}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'text-left p-3 text-sm font-medium text-muted-foreground',
                    column.width && `w-${column.width}`,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-muted/50 select-none'
                  )}
                  onClick={() => column.sortable !== false && handleSort(String(column.key))}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && sortColumn === String(column.key) && (
                      sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={String(item[keyField as keyof T])}
                className={cn(
                  'border-b border-border hover:bg-muted/50 transition-colors',
                  compact ? 'h-10' : 'h-12',
                  striped && index % 2 === 1 && 'bg-muted/30'
                )}
              >
                {columns.map((column) => {
                  const value = item[column.key as keyof T];
                  const renderedValue = column.render ? column.render(value, item) : String(value);

                  return (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'p-3 text-sm',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {renderedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Swipeable Card List
interface SwipeableCardListProps<T = any> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  onSwipeLeft?: (item: T, index: number) => void;
  onSwipeRight?: (item: T, index: number) => void;
  className?: string;
}

function SwipeableCardList<T>({
  items,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  className,
}: SwipeableCardListProps<T>) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <SwipeableContainer
          key={index}
          onSwipeLeft={() => onSwipeLeft?.(item, index)}
          onSwipeRight={() => onSwipeRight?.(item, index)}
          className="touch-manipulation"
          threshold={100}
        >
          {renderCard(item, index)}
        </SwipeableContainer>
      ))}
    </div>
  );
}

// Mobile Modal/Dialog
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullScreen?: boolean;
  className?: string;
}

const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullScreen = false,
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed z-50 bg-background border border-border rounded-t-lg',
          'animate-in slide-in-from-bottom duration-300',
          fullScreen
            ? 'inset-0 rounded-none'
            : 'bottom-0 left-4 right-4 max-h-[90vh]',
          className
        )}
      >
        {/* Handle for mobile swipe to close */}
        {!fullScreen && (
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {showCloseButton && (
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ChevronRight size={20} />
              </MobileButton>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96">
          {children}
        </div>
      </div>
    </>
  );
};

export {
  BottomTabNavigation,
  FloatingActionButton,
  MobileSearchBar,
  ResponsiveTable,
  SwipeableCardList,
  MobileModal,
  type TabItem,
  type FABAction,
  type TableColumn,
};