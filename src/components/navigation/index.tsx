'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home, MoreHorizontal, Menu, X } from 'lucide-react';
import { AnimatedButton } from '@/components/animations';

// Breadcrumb Navigation
interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight size={16} />,
  maxItems = 5,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (items.length === 0) return null;

  // Handle overflow
  let displayItems = items;
  let hasOverflow = false;

  if (items.length > maxItems) {
    hasOverflow = true;
    displayItems = [
      items[0],
      { label: '...', onClick: () => setIsCollapsed(!isCollapsed) },
      ...items.slice(-2)
    ];
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isOverflow = item.label === '...';

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground/50">
                  {separator}
                </span>
              )}

              {isOverflow ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Show more breadcrumbs"
                >
                  <MoreHorizontal size={16} />
                </button>
              ) : item.href || item.onClick ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    'flex items-center px-2 py-1 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                    isLast && 'font-medium text-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'flex items-center px-2 py-1',
                    isLast && 'font-medium text-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Contextual Menu (Dropdown)
interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
  children?: MenuItem[];
}

interface ContextualMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  className?: string;
}

const ContextualMenu: React.FC<ContextualMenuProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSubmenuOpen(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    if (item.children) {
      setSubmenuOpen(submenuOpen === item.id ? null : item.id);
      return;
    }

    if (item.onClick) {
      item.onClick();
    }

    setIsOpen(false);
    setSubmenuOpen(null);
  };

  const placementClasses = {
    'top': 'bottom-full mb-2',
    'bottom': 'top-full mt-2',
    'left': 'right-full mr-2',
    'right': 'left-full ml-2',
    'top-start': 'bottom-full right-0 mb-2',
    'top-end': 'bottom-full left-0 mb-2',
    'bottom-start': 'top-full right-0 mt-2',
    'bottom-end': 'top-full left-0 mt-2',
  };

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            ref={menuRef}
            className={cn(
              'absolute z-50 min-w-48 bg-popover border border-border rounded-md shadow-lg py-1',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              placementClasses[placement],
              className
            )}
            role="menu"
          >
            {items.map((item) => (
              <div key={item.id}>
                {item.divider ? (
                  <div className="h-px bg-border my-1" />
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                      className={cn(
                        'w-full flex items-center px-3 py-2 text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                        'disabled:opacity-50 disabled:pointer-events-none',
                        item.danger && 'text-destructive hover:bg-destructive/10',
                        item.children && 'pr-8'
                      )}
                      role="menuitem"
                    >
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.children && (
                        <ChevronRight size={14} className="ml-2" />
                      )}
                    </button>

                    {/* Submenu */}
                    {item.children && submenuOpen === item.id && (
                      <div
                        className={cn(
                          'absolute left-full top-0 z-50 min-w-48 bg-popover border border-border rounded-md shadow-lg py-1 ml-1',
                          'animate-in fade-in-0 zoom-in-95 duration-200'
                        )}
                      >
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => {
                              if (child.onClick) child.onClick();
                              setIsOpen(false);
                              setSubmenuOpen(null);
                            }}
                            disabled={child.disabled}
                            className={cn(
                              'w-full flex items-center px-3 py-2 text-sm transition-colors',
                              'hover:bg-accent hover:text-accent-foreground',
                              'disabled:opacity-50 disabled:pointer-events-none'
                            )}
                          >
                            {child.icon && <span className="mr-2">{child.icon}</span>}
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Mobile Navigation Menu
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  children,
  position = 'left',
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Menu */}
      <div
        className={cn(
          'fixed top-0 h-full w-80 max-w-[90vw] bg-background border-r border-border z-50',
          'transform transition-transform duration-300 ease-in-out',
          positionClasses[position],
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Menu</h2>
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            animation="scale"
          >
            <X size={20} />
          </AnimatedButton>
        </div>

        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
};

// Navigation Bar with mobile support
interface NavBarProps {
  brand?: {
    name: string;
    logo?: React.ReactNode;
    href?: string;
  };
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  brand,
  items,
  actions,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        className={cn(
          'bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-30',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <div className="flex items-center">
              {brand?.logo && <div className="mr-2">{brand.logo}</div>}
              {brand?.href ? (
                <a
                  href={brand.href}
                  className="text-xl font-bold text-foreground hover:text-primary transition-colors"
                >
                  {brand.name}
                </a>
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {brand?.name}
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    item.active && 'bg-accent text-accent-foreground'
                  )}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {actions}

              {/* Mobile menu button */}
              <AnimatedButton
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                animation="scale"
              >
                <Menu size={20} />
              </AnimatedButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                setMobileMenuOpen(false);
              }}
              className={cn(
                'flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                item.active && 'bg-accent text-accent-foreground'
              )}
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </div>
      </MobileMenu>
    </>
  );
};

export {
  Breadcrumb,
  ContextualMenu,
  MobileMenu,
  NavBar,
};

export type {
  BreadcrumbItem,
  MenuItem,
};