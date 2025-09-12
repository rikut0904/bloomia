import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface UserRoleBadgeProps {
  role: string;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const label = ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
  const colorClass = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800';

  return (
    <Badge
      variant="secondary"
      className={cn(colorClass, className)}
    >
      {label}
    </Badge>
  );
}