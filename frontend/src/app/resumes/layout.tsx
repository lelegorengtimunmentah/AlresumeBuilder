import { Sidebar } from '@/components/layout/Sidebar';

export default function ResumesLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="flex h-screen overflow-hidden bg-background">
 <Sidebar />
 <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
 </div>
 );
}

