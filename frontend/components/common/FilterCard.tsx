import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { THEME_COLORS } from '@/lib/constants';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'input' | 'select';
  placeholder?: string;
  options?: FilterOption[];
}

interface FilterCardProps {
  title?: string;
  fields: FilterField[];
  filters: { [key: string]: string };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  loading?: boolean;
}

export function FilterCard({
  title = 'フィルター',
  fields,
  filters,
  onFilterChange,
  onReset,
  loading = false
}: FilterCardProps) {
  return (
    <Card className="mb-6" style={{ borderColor: THEME_COLORS.border }}>
      <CardHeader>
        <CardTitle style={{ color: THEME_COLORS.primaryDark }}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'input' ? (
                <Input
                  id={field.key}
                  placeholder={field.placeholder}
                  value={filters[field.key] || ''}
                  onChange={(e) => onFilterChange(field.key, e.target.value)}
                  disabled={loading}
                />
              ) : (
                <Select
                  value={filters[field.key] || 'all'}
                  onValueChange={(value) => onFilterChange(field.key, value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          <div className="flex items-end">
            <Button
              onClick={onReset}
              variant="outline"
              style={{ borderColor: THEME_COLORS.border, color: THEME_COLORS.secondary }}
              disabled={loading}
            >
              リセット
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}