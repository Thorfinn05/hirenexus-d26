
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BrainCircuit,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Github
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth, useFirestore } from "@/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [isLogin, setIsLogin] = React.useState(true)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<"recruiter" | "candidate">("candidate")

  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const handleAuthSuccess = async (user: any) => {
    if (!db) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    let destinationRole: "recruiter" | "candidate" = selectedRole;

    // If doc exists, prioritize the stored role. 
    // If doc exists but role is missing (race condition), still use selectedRole.
    if (userSnap.exists() && userSnap.data().role) {
      destinationRole = userSnap.data().role;
    } 
    
    // Always ensure the doc exists with the correct role
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      displayName: user.displayName || userSnap.data()?.displayName || 'New User',
      photoURL: user.photoURL || userSnap.data()?.photoURL || '',
      role: destinationRole,
      updatedAt: serverTimestamp(),
      ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() })
    }, { merge: true });

    if (destinationRole === 'candidate') {
      router.push("/candidate/dashboard")
    } else {
      router.push("/dashboard")
    }
  }

  const handleDemoFill = () => {
    setEmail("thorfinn1002@gmail.com")
    setPassword("Thorfinn#1002")
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
      }
      await handleAuthSuccess(userCredential.user)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const userCredential = await signInWithPopup(auth, provider)
      await handleAuthSuccess(userCredential.user)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="candidate-theme min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] p-4 relative z-10"
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/15">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-headline text-foreground/95">HireNexus</h1>
          <p className="text-sm text-muted-foreground text-center">
            Next-gen multi-agent AI hiring platform.
          </p>
        </div>

        <div className="liquid-glass-elevated rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.04]">
            <h2 className="text-sm font-semibold text-foreground/90">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isLogin
                ? "Sign in to access your HireNexus account."
                : "Join HireNexus and revolutionize your hiring process."}
            </p>
          </div>
          
          <div className="p-5 space-y-4">
            {!isLogin && (
              <div className="space-y-2 pb-1">
                <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">I am a…</Label>
                <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/[0.03] border border-white/[0.06]">
                    <TabsTrigger value="candidate" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs font-medium">Candidate</TabsTrigger>
                    <TabsTrigger value="recruiter" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-xs font-medium">Recruiter</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-9 bg-white/[0.03] border-white/[0.06] focus:border-primary/40 focus:ring-1 focus:ring-primary/20 h-10 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
                  {isLogin && (
                    <button type="button" className="text-[10px] text-primary/60 hover:text-primary/80 font-medium transition-colors">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-white/[0.03] border-white/[0.06] focus:border-primary/40 focus:ring-1 focus:ring-primary/20 h-10 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-medium h-10 text-sm rounded-lg transition-all duration-300 hover:shadow-[0_0_24px_-4px_hsl(var(--primary)_/_0.4)]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Sign Up"}
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 text-muted-foreground/50 font-medium uppercase tracking-wider" style={{ backgroundColor: "hsl(225, 20%, 7%)" }}>Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-white/[0.06] font-medium h-10 text-sm bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>
          
          <div className="p-4 border-t border-white/[0.04] space-y-3">
            <div className="text-xs text-center text-muted-foreground/60">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary/70 font-medium hover:text-primary transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            <button
              className="w-full text-[10px] text-center text-muted-foreground/30 hover:text-muted-foreground/50 uppercase tracking-[0.15em] font-medium transition-colors py-1"
              onClick={handleDemoFill}
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-muted-foreground/25 uppercase tracking-[0.2em] font-medium">
          Powered by Genkit & Firebase
        </p>
      </motion.div>
    </div>
  )
}
