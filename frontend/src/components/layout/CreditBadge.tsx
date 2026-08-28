'use client';

import React from 'react';
import { Zap, Coins } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CreditBadgeProps {
 plan: 'free' | 'pro';
 credits: number;
 className?: string;
}

export function CreditBadge({ plan, credits, className }: CreditBadgeProps) {
 if (plan === 'pro') {
 return (
 <Badge
 className={cn(
 'flex items-center gap-1 border-teal-500/30 bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300',
 className,
 )}
 >
 <Zap className="h-3 w-3" aria-hidden="true" />
 <span>Pro</span>
 </Badge>
 );
 }

 return (
 <div className={cn('flex items-center gap-1.5', className)}>
 <Badge variant="secondary" className="flex items-center gap-1">
 <span>Free</span>
 </Badge>
 <Badge
 variant="outline"
 className={cn(
 'flex items-center gap-1',
 credits === 0 && 'border-red-500/30 text-red-400 bg-red-500/10',
 )}
 title={`${credits} kredit resume tersisa`}
 >
 <Coins className="h-3 w-3" aria-hidden="true" />
 <span>{credits} kredit</span>
 </Badge>
 </div>
 );
}

export default CreditBadge;

