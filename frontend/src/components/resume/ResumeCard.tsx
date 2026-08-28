'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Globe, Lock } from 'lucide-react';

import type { Resume } from '@/types/resume';
import { formatDate } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
 DialogClose,
} from '@/components/ui/dialog';

export interface ResumeCardProps {
 resume: Resume;
 onDelete: (id: string) => void | Promise<void>;
 onEdit?: (id: string) => void;
}

export function ResumeCard({ resume, onDelete, onEdit }: ResumeCardProps) {
 const [dialogOpen, setDialogOpen] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);

 const formattedDate = formatDate(resume.updated_at, {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 });

 async function handleConfirmDelete() {
 setIsDeleting(true);
 try {
 await onDelete(resume.id);
 } finally {
 setIsDeleting(false);
 setDialogOpen(false);
 }
 }

 return (
 <>
 <div className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
 <div className="mb-4">
 <div className="flex items-start justify-between gap-2 mb-1.5">
 <h3 className="text-base font-semibold line-clamp-2 leading-snug text-card-foreground">
 {resume.title}
 </h3>
 <Badge
 variant={resume.is_public ? 'default' : 'secondary'}
 className="shrink-0 flex items-center gap-1"
 >
 {resume.is_public ? (
 <>
 <Globe className="h-3 w-3" aria-hidden="true" />
 <span>Publik</span>
 </>
 ) : (
 <>
 <Lock className="h-3 w-3" aria-hidden="true" />
 <span>Privat</span>
 </>
 )}
 </Badge>
 </div>
 <p className="text-xs text-muted-foreground">
 Diperbarui {formattedDate}
 </p>
 </div>

 <div className="flex gap-2">
 {onEdit ? (
 <Button
 variant="outline"
 size="sm"
 className="flex-1"
 onClick={() => onEdit(resume.id)}
 >
 <Pencil className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
 Edit
 </Button>
 ) : (
 <Button variant="outline" size="sm" className="flex-1" asChild>
 <Link href={`/resumes/${resume.id}`}>
 <Pencil className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
 Edit
 </Link>
 </Button>
 )}

 <Button
 variant="destructive"
 size="sm"
 className="flex-1"
 onClick={() => setDialogOpen(true)}
 >
 <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
 Hapus
 </Button>
 </div>
 </div>

 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Hapus Resume</DialogTitle>
 <DialogDescription>
 Apakah kamu yakin ingin menghapus resume{' '}
 <span className="font-medium">&ldquo;{resume.title}&rdquo;</span>
 ? Tindakan ini tidak dapat dibatalkan.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter>
 <DialogClose asChild>
 <Button variant="outline" disabled={isDeleting}>Batal</Button>
 </DialogClose>
 <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
 {isDeleting ? 'Menghapus...' : 'Hapus'}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </>
 );
}

export default ResumeCard;

