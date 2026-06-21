import { ReactNode } from 'react';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageContainer({ title, subtitle, children, actions, className = '' }: PageContainerProps) {
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </div>
    </div>
  );
}
