"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, User, Palette, Image as ImageIcon, Sparkles, Shield, ChevronRight, Moon, Globe, Bell, Smartphone, Lock, LogOut } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/signin");
  };

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-4xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex items-center mb-8 h-8 lg:hidden space-x-4">
        <Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </Link>
        <span className="font-bold text-gray-900 dark:text-white text-lg">Settings</span>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex flex-col mb-10">
        <Link href="/profile" className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
      </FadeIn>

      <StaggeredList className="space-y-8" staggerDelay={0.05}>

        {/* Account Section */}
        <StaggeredItem>
          <section>
            <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 px-1">Account</h2>
            <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
              <SettingsRow icon={<User className="w-5 h-5" />} title="Edit Profile" link="/profile" />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsRow icon={<Lock className="w-5 h-5" />} title="Change Password" link="/profile" />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <button onClick={handleSignOut} className="w-full flex items-center justify-between p-4 px-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group">
                <div className="flex items-center space-x-4 text-red-500 group-hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-[15px]">Sign Out</span>
                </div>
              </button>
            </div>
          </section>
        </StaggeredItem>

        {/* Preferences Section */}
        <StaggeredItem>
          <section>
            <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 px-1">Preferences</h2>
            <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 px-5">
                <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
                  <Moon className="w-5 h-5" />
                  <span className="font-medium text-[15px]">Theme</span>
                </div>
                <ThemeToggle />
              </div>
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsToggleRow icon={<Bell className="w-5 h-5" />} title="Push Notifications" defaultChecked={true} />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsRow icon={<Globe className="w-5 h-5" />} title="Language" value="English (US)" />
            </div>
          </section>
        </StaggeredItem>

        {/* Memory & Gallery Section */}
        <StaggeredItem>
          <section>
            <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 px-1">Memory & Gallery</h2>
            <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
              <SettingsToggleRow icon={<ImageIcon className="w-5 h-5" />} title="Save original photos" defaultChecked={true} description="Keep uncompressed versions of your uploads" />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsToggleRow icon={<Smartphone className="w-5 h-5" />} title="Auto-organize by date" defaultChecked={true} />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsRow icon={<Palette className="w-5 h-5" />} title="Default Layout" value="Masonry" />
            </div>
          </section>
        </StaggeredItem>

        {/* AI & Smart Features */}
        <StaggeredItem>
          <section>
            <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 px-1">Smart Features</h2>
            <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
              <SettingsToggleRow icon={<Sparkles className="w-5 h-5" />} title="AI Insights" defaultChecked={true} description="Allow AI to generate weekly summaries and mood analysis" />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsToggleRow icon={<Sparkles className="w-5 h-5" />} title="Smart Tags" defaultChecked={true} description="Auto-tag entries based on content" />
            </div>
          </section>
        </StaggeredItem>

        {/* Security Section */}
        <StaggeredItem>
          <section>
            <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4 px-1">Security</h2>
            <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
              <SettingsRow icon={<Shield className="w-5 h-5" />} title="Active Sessions" link="/settings/sessions" />
              <div className="h-px bg-gray-100 dark:bg-white/10 mx-4" />
              <SettingsToggleRow icon={<Lock className="w-5 h-5" />} title="Require biometric to open" defaultChecked={false} />
            </div>
          </section>
        </StaggeredItem>

        <StaggeredItem>
          <div className="text-center py-6">
            <p className="text-xs text-gray-400">LifeLog Version 1.0.0</p>
          </div>
        </StaggeredItem>

      </StaggeredList>
    </div>
  );
}

function SettingsRow({ icon, title, value, link }: { icon: React.ReactNode, title: string, value?: string, link?: string }) {
  const content = (
    <div className="flex items-center justify-between p-4 px-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors w-full">
      <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
        {icon}
        <span className="font-medium text-[15px]">{title}</span>
      </div>
      <div className="flex items-center space-x-3 text-gray-400">
        {value && <span className="text-sm">{value}</span>}
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );

  return link ? <Link href={link} className="block w-full">{content}</Link> : <button className="block w-full" onClick={() => toast("Coming soon!")}>{content}</button>;
}

function SettingsToggleRow({ icon, title, description, defaultChecked }: { icon: React.ReactNode, title: string, description?: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked || false);

  return (
    <div className="flex items-center justify-between p-4 px-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setChecked(!checked)}>
      <div className="flex flex-col flex-1 pr-4">
        <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
          <div className="shrink-0">{icon}</div>
          <span className="font-medium text-[15px]">{title}</span>
        </div>
        {description && <p className="text-xs text-gray-500 mt-1.5 ml-9">{description}</p>}
      </div>
      <div className="relative shrink-0">
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'}`}>
          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </div>
  );
}
