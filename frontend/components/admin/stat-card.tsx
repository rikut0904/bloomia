import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  className?: string;
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card className={`bg-white shadow-sm ${className}`} style={{ borderColor: '#DEB887' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: '#8B4513' }}>
          {title}
        </CardTitle>
        <div className="text-2xl">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: '#2F1B14' }}>
          {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}