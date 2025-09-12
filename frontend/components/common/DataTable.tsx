import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { THEME_COLORS } from '@/lib/constants';

interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  title,
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'データがありません',
  className = ''
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Card style={{ borderColor: THEME_COLORS.border }} className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: THEME_COLORS.primary }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card style={{ borderColor: THEME_COLORS.border }} className={className}>
        {title && (
          <CardHeader>
            <CardTitle style={{ color: THEME_COLORS.primaryDark }}>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ borderColor: THEME_COLORS.border }} className={className}>
      {title && (
        <CardHeader>
          <CardTitle style={{ color: THEME_COLORS.primaryDark }}>
            {title} ({data.length}件)
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: THEME_COLORS.border }}>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-left py-3 px-4 ${column.className || ''}`}
                    style={{ color: THEME_COLORS.secondary }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b hover:bg-gray-50"
                  style={{ borderColor: THEME_COLORS.border }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`py-3 px-4 ${column.className || ''}`}
                      style={{ color: THEME_COLORS.primaryDark }}
                    >
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}