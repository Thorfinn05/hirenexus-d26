
'use client';

import { useUser } from '@/firebase';
import { useUserRole } from '@/hooks/use-user-role';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * A component that protects routes and ensures the user is authenticated.
 * Redirects to /login if not authenticated.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { role, isRoleLoading } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isUserLoading || isRoleLoading) return;

    if (!user && pathname !== '/' && pathname !== '/login') {
      router.push('/');
      return;
    }

    if (user && role) {
      if (pathname.startsWith('/candidate/') && role === 'recruiter') {
        router.push('/dashboard');
        return;
      } else if (!pathname.startsWith('/candidate/') && pathname !== '/' && pathname !== '/login' && role === 'candidate') {
        router.push('/candidate/dashboard');
        return;
      }
    }
    
    setIsReady(true);
  }, [user, isUserLoading, role, isRoleLoading, pathname, router]);

  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  if (isUserLoading || isRoleLoading || (!isReady && pathname !== '/' && pathname !== '/login')) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
        </div>
        <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">Initialising Core...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}



// 'use client';

// import { useUser } from '@/firebase';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { Loader2 } from 'lucide-react';

// /**
//  * A component that protects routes and ensures the user is authenticated.
//  * Redirects to /login if not authenticated.
//  */
// export function AuthGuard({ children }: { children: React.ReactNode }) {
//   const { user, isUserLoading } = useUser();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!isUserLoading && !user && pathname !== '/login') {
//       router.push('/login');
//     }
//   }, [user, isUserLoading, pathname, router]);

//   if (pathname === '/login') {
//     return <>{children}</>;
//   }

//   if (isUserLoading) {
//     return (
//       <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
//         <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
//           <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
//         </div>
//         <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">Initialising Core...</p>
//       </div>
//     );
//   }

//   if (!user) return null;

//   return <>{children}</>;
// }