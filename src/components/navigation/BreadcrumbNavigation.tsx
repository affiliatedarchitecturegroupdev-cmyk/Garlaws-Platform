import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  customItems?: BreadcrumbItem[];
}

export default function BreadcrumbNavigation({ customItems }: BreadcrumbNavigationProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable label
      let label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Special cases for common routes
      const routeLabels: Record<string, string> = {
        'dashboard': 'Dashboard',
        'financial': 'Financial',
        'supply-chain': 'Supply Chain',
        'crm': 'CRM',
        'projects': 'Projects',
        'erp': 'ERP',
        'bi': 'Business Intelligence',
        'ml': 'AI/ML',
        'security': 'Security',
        'qa': 'Quality Assurance',
        'integrations': 'Integrations',
        'mobile': 'Mobile',
        'shop': 'E-commerce',
        'services': 'Services',
        'help': 'Help & Documentation',
        'contact': 'Contact Us',
        'status': 'System Status',
        'careers': 'Careers',
        'demo': 'Demo'
      };

      if (routeLabels[segment]) {
        label = routeLabels[segment];
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page or if only one item
  if (pathname === '/' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}

              {crumb.isActive ? (
                <span
                  className="text-gray-900 font-medium"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}