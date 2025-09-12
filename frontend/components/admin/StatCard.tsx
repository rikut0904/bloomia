import { Card, CardContent } from '@/components/ui/card';
import { THEME_COLORS } from '@/lib/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  className = '',
  valueFormatter
}: StatCardProps) {
  const formattedValue = typeof value === 'number' && valueFormatter
    ? valueFormatter(value)
    : typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <Card style={{ borderColor: THEME_COLORS.border }} className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: THEME_COLORS.secondary }}>
              {title}
            </p>
            <p className="text-2xl font-bold" style={{ color: THEME_COLORS.primaryDark }}>
              {formattedValue}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="ml-4" style={{ color: THEME_COLORS.primary }}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}