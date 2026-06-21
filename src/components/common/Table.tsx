import { cn } from '@/utils/format';
import { ReactNode, ThHTMLAttributes } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

Table.Header = function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

Table.Body = function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-gray-100', className)}>
      {children}
    </tbody>
  );
};

interface TableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

Table.Row = function TableRow({ children, className, hover = true, onClick }: TableRowProps) {
  return (
    <tr onClick={onClick} className={cn(hover && 'hover:bg-gray-50 transition-colors', className)}>
      {children}
    </tr>
  );
};

interface TableCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'children'> {
  children?: ReactNode;
  className?: string;
  header?: boolean;
}

Table.Cell = function TableCell({ children, className, header = false, ...props }: TableCellProps) {
  const Component = header ? 'th' : 'td';
  return (
    <Component
      className={cn(
        'px-4 py-3 text-left',
        header ? 'font-medium text-gray-500 text-xs uppercase tracking-wider' : 'text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
