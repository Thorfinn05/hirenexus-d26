"use client"

import * as React from "react"
import { useUser, useAuth } from "@/firebase"
import { signOut, updateProfile } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  LogOut,
  Settings as SettingsIcon,
  Mail,
  User as UserIcon,
  Shield,
  Bell,
  Palette,
  Moon,
  Sun,
  Loader2,
  Check,
  Pencil,
  X,
  ExternalLink,
} from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { useTheme } from "next-themes"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function CandidateSettingsPage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [isEditing, setIsEditing] = React.useState(false)
  const [displayName, setDisplayName] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  // Notification preferences (local state — no backend)
  const [emailNotifications, setEmailNotifications] = React.useState(true)
  const [interviewReminders, setInterviewReminders] = React.useState(true)
  const [weeklyDigest, setWeeklyDigest] = React.useState(false)

  React.useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName)
    }
  }, [user])

  const handleSaveName = async () => {
    if (!auth?.currentUser || !displayName.trim()) return
    setIsSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() })
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      if (auth) {
        await signOut(auth)
        router.push("/login")
      }
    } catch (error) {
      console.error("Failed to sign out:", error)
      setIsSigningOut(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          <span className="text-xs text-muted-foreground">Loading settings…</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Please sign in to view settings.
      </div>
    )
  }

  const accountAge = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown"

  const lastSignIn = user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown"

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-3xl mx-auto pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground/95 flex items-center gap-2.5">
          <SettingsIcon className="h-5 w-5 text-primary/80" />
          Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your account, appearance, and notification preferences.
        </p>
      </motion.div>

      {/* ── Profile Section ── */}
      <motion.div variants={itemVariants}>
        <div className="liquid-glass rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary/70" />
                Profile
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your personal information
              </p>
            </div>
          </div>

          <div className="px-5 pb-5 space-y-5">
            {/* Avatar + Name row */}
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-white/[0.06] ring-2 ring-primary/10 shadow-lg">
                <AvatarImage
                  src={
                    user.photoURL ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || user.email}`
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {user.displayName?.charAt(0) ||
                    user.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-9 text-sm bg-white/[0.03] border-white/[0.08] focus:border-primary/30"
                      placeholder="Your name"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 text-emerald-400 hover:bg-emerald-400/10"
                      onClick={handleSaveName}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 text-muted-foreground hover:bg-white/[0.04]"
                      onClick={() => {
                        setIsEditing(false)
                        setDisplayName(user.displayName || "")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold tracking-tight text-foreground/90 truncate">
                      {user.displayName || "No name set"}
                    </h4>
                    {saveSuccess && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full"
                      >
                        Saved
                      </motion.span>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded-md text-muted-foreground/50 hover:text-foreground/70 hover:bg-white/[0.04] transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-white/[0.04]" />

            {/* Account metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  Member since
                </span>
                <p className="text-sm text-foreground/80">{accountAge}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  Last sign-in
                </span>
                <p className="text-sm text-foreground/80">{lastSignIn}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  Auth provider
                </span>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-primary/60" />
                  <p className="text-sm text-foreground/80 capitalize">
                    {user.providerData?.[0]?.providerId?.replace(".com", "") ||
                      "Email"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
                  Email verified
                </span>
                <p className="text-sm text-foreground/80">
                  {user.emailVerified ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-400">Not verified</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Appearance Section ── */}
      <motion.div variants={itemVariants}>
        <div className="liquid-glass rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary/70" />
              Appearance
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize how HireNexus looks
            </p>
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-primary/80" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground/85 cursor-pointer">
                    Dark mode
                  </Label>
                  <p className="text-[11px] text-muted-foreground/70">
                    Toggle between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Notifications Section ── */}
      <motion.div variants={itemVariants}>
        <div className="liquid-glass rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary/70" />
              Notifications
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose what updates you receive
            </p>
          </div>

          <div className="px-5 pb-5 space-y-0.5">
            {/* Email notifications */}
            <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-400/8 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-sky-400/80" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground/85 cursor-pointer">
                    Email notifications
                  </Label>
                  <p className="text-[11px] text-muted-foreground/70">
                    Receive analysis results and updates via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            {/* Interview reminders */}
            <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-violet-400/8 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-violet-400/80" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground/85 cursor-pointer">
                    Interview reminders
                  </Label>
                  <p className="text-[11px] text-muted-foreground/70">
                    Get notified before scheduled mock interviews
                  </p>
                </div>
              </div>
              <Switch
                checked={interviewReminders}
                onCheckedChange={setInterviewReminders}
              />
            </div>

            {/* Weekly digest */}
            <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/8 flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-emerald-400/80" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground/85 cursor-pointer">
                    Weekly digest
                  </Label>
                  <p className="text-[11px] text-muted-foreground/70">
                    Summary of your activity and skill progress
                  </p>
                </div>
              </div>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Danger Zone ── */}
      <motion.div variants={itemVariants}>
        <div className="liquid-glass rounded-xl overflow-hidden border-red-500/10">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-red-400/90 flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Account Actions
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your session
            </p>
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-foreground/80">Sign out</p>
                <p className="text-[11px] text-muted-foreground/70">
                  End your current session on this device
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="gap-1.5 h-9 px-4 font-medium text-xs shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all"
              >
                {isSigningOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
