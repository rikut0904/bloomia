import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_LABELS } from '@/lib/constants';
import { School } from '@/hooks/useSchools';

export interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  schoolFilter: string;
  schools: School[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
}

export function UserFilters({
  searchTerm,
  roleFilter,
  schoolFilter,
  schools,
  onSearchChange,
  onRoleChange,
  onSchoolChange,
}: UserFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <Label htmlFor="search">検索</Label>
        <Input
          id="search"
          placeholder="名前・メールアドレスで検索"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role-filter">役割でフィルター</Label>
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="役割を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての役割</SelectItem>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school-filter">学校でフィルター</Label>
        <Select value={schoolFilter} onValueChange={onSchoolChange}>
          <SelectTrigger>
            <SelectValue placeholder="学校を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての学校</SelectItem>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.code}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}