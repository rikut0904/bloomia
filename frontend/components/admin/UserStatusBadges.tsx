import { Badge } from '@/components/ui/badge';

interface UserStatusBadgesProps {
  isActive: boolean;
  isApproved: boolean;
  className?: string;
}

export function UserStatusBadges({ isActive, isApproved, className }: UserStatusBadgesProps) {
  return (
    <div className={`flex flex-col space-y-1 ${className || ''}`}>
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'アクティブ' : '非アクティブ'}
      </Badge>
      <Badge variant={isApproved ? 'default' : 'destructive'}>
        {isApproved ? '承認済み' : '未承認'}
      </Badge>
    </div>
  );
}