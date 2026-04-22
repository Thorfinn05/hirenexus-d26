import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { CandidateSidebar } from '@/components/candidate-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import { GlobalSearch } from '@/components/global-search';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function CandidateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard>
            <div className="candidate-theme">
                <SidebarProvider>
                    <CandidateSidebar />
                    <SidebarInset className="flex flex-col h-screen overflow-hidden relative">
                        {/* Ambient aurora orbs */}
                        <div className="ambient-orb ambient-orb-1" />
                        <div className="ambient-orb ambient-orb-2" />
                        <div className="ambient-orb ambient-orb-3" />

                        <header className="flex h-14 shrink-0 items-center justify-between px-6 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                            <div className="flex items-center gap-5 flex-1">
                                <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                                <GlobalSearch />
                            </div>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                <UserNav />
                            </div>
                        </header>
                        <main className="flex-1 overflow-y-auto p-6 relative z-10">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </AuthGuard>
    );
}
