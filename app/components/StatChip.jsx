import React from 'react';
import { Badge } from '@/app/components/ui/badge';

export default function StatChip({ icon: Icon, value, label, className = '' }) {
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/30 border-border/40 font-mono ${className}`}
    >
      {Icon && <Icon size={13} className="text-muted-foreground shrink-0" />}
      <span className="font-bold text-foreground text-xs">{value}</span>
      <span className="text-muted-foreground text-[10px] tracking-wide uppercase">{label}</span>
    </Badge>
  );
}
