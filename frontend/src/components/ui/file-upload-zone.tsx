'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
 onFileSelect: (file: File) => void;
 accept?: string;
 disabled?: boolean;
}

export function FileUploadZone({
 onFileSelect,
 accept = '.pdf,.doc,.docx',
 disabled = false,
}: FileUploadZoneProps) {
 const inputRef = useRef<HTMLInputElement>(null);
 const [isDragging, setIsDragging] = useState(false);
 const [selectedFile, setSelectedFile] = useState<File | null>(null);

 const handleFile = useCallback(
 (file: File) => {
 setSelectedFile(file);
 onFileSelect(file);
 },
 [onFileSelect],
 );

 const handleDrop = useCallback(
 (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 if (disabled) return;
 const file = e.dataTransfer.files[0];
 if (file) handleFile(file);
 },
 [disabled, handleFile],
 );

 const handleDragOver = useCallback((e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(true);
 }, []);

 const handleDragLeave = useCallback(() => {
 setIsDragging(false);
 }, []);

 const handleClick = () => {
 if (!disabled) inputRef.current?.click();
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) handleFile(file);
 };

 const clearFile = (e: React.MouseEvent) => {
 e.stopPropagation();
 setSelectedFile(null);
 if (inputRef.current) inputRef.current.value = '';
 };

 return (
 <div
 onClick={handleClick}
 onDrop={handleDrop}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 className={cn(
 'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer',
 isDragging
 ? 'border-teal-500/60 bg-teal-500/8'
 : ' border-border bg-black/[0.02] hover: hover:border-border hover: hover:bg-black/[0.04]',
 disabled && 'pointer-events-none opacity-50',
 selectedFile && 'border-teal-500/40 bg-teal-500/8',
 )}
 >
 <input
 ref={inputRef}
 type="file"
 accept={accept}
 onChange={handleChange}
 className="hidden"
 disabled={disabled}
 />

 {selectedFile ? (
 <>
 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20">
 <FileText className="h-7 w-7 text-teal-600 dark:text-teal-400" />
 </div>
 <div>
 <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
 <p className="text-xs text-muted-foreground">
 {(selectedFile.size / 1024).toFixed(1)} KB
 </p>
 </div>
 <button
 onClick={clearFile}
 className="absolute right-3 top-3 rounded-xl p-1.5 bg-black/[0.04] hover: hover:bg-black/[0.08] text-muted-foreground hover: hover:text-foreground transition-colors"
 >
 <X className="h-4 w-4" />
 </button>
 </>
 ) : (
 <>
 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04] border border-border">
 <Upload className="h-7 w-7 text-muted-foreground" />
 </div>
 <div>
 <p className="text-sm font-medium text-foreground">
 Drag & drop atau klik untuk memilih file
 </p>
 <p className="text-xs text-muted-foreground">
 PDF atau DOCX, maks 5MB
 </p>
 </div>
 </>
 )}
 </div>
 );
}


