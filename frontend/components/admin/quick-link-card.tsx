import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface QuickLinkProps {
  href: string;
  label: string;
}

export interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: string;
  links: QuickLinkProps[];
  className?: string;
}

export function QuickLinkCard({ 
  title, 
  description, 
  icon, 
  links, 
  className 
}: QuickLinkCardProps) {
  return (
    <Card 
      className={`bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
      style={{ borderColor: '#DEB887' }}
    >
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-xl">{icon}</span>
          <span style={{ color: '#2F1B14' }}>{title}</span>
        </CardTitle>
        <CardDescription style={{ color: '#8B4513' }}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {links.map((link, index) => (
            <Link 
              key={index}
              href={link.href} 
              className="text-sm font-medium block hover:underline" 
              style={{ color: '#FF7F50' }}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}