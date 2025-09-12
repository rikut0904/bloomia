import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, ROLE_COLORS, Role } from '@/constants/roles';

interface UserRoleBadgeProps {
  role: string;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const validRole = role as Role;
  const label = ROLE_LABELS[validRole] || role;
  const colorClass = ROLE_COLORS[validRole] || 'bg-gray-100 text-gray-800';

  return (
    <Badge className={`${colorClass} ${className || ''}`}>
      {label}
    </Badge>
  );
}