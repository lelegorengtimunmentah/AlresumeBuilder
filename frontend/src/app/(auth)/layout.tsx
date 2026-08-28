export default function AuthLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="min-h-screen flex items-center justify-center px-4">
 {/* Ambient glow for auth pages */}
 <div
 aria-hidden="true"
 className="pointer-events-none fixed inset-0 z-0"
 >
 <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full dark:bg-purple-500/8 bg-purple-500/12 blur-[120px]" />
 <div className="absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/6 blur-[100px]" />
 <div className="absolute top-1/3 right-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/5 blur-[100px]" />
 </div>
 {children}
 </div>
 );
}


