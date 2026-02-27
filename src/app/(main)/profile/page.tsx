"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Settings, Calendar, Edit3, Banknote, User, Lock, Bell, ChevronRight, LogOut, Check, X, Camera, Flame, Coins } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currency";
import toast from "react-hot-toast";

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  entryCount: number;
  totalExpenses: number;
  streak: number;
  hasPassword?: boolean;
  currency?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [currencyModal, setCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setEditName(data.name || "");
        setEditImage(data.image || null);
        if (data.currency) setSelectedCurrency(data.currency);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openEditModal = () => {
    setEditName(profile?.name || "");
    setEditImage(profile?.image || null);
    setImagePreview(null);
    setEditModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setEditImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const loadingToast = toast.loading("Updating profile...");
    try {
      const body: Record<string, unknown> = { name: editName };
      if (imagePreview) {
        body.image = editImage;
      }
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => prev ? { ...prev, name: updated.name, image: updated.image } : prev);
        toast.success("Profile updated successfully!", { id: loadingToast });
        setEditModal(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred", { id: loadingToast });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const loadingToast = toast.loading("Changing password...");
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password", { id: loadingToast });
        setPasswordError(data.error || "Failed to change password");
      } else {
        toast.success("Password changed successfully!", { id: loadingToast });
        setTimeout(() => {
          setPasswordModal(false);
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }, 1500);
      }
    } catch {
      toast.error("An error occurred", { id: loadingToast });
      setPasswordError("An error occurred");
    }
  };

  const handleSaveCurrency = async (code: string) => {
    setSavingCurrency(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: code }),
      });
      if (res.ok) {
        setSelectedCurrency(code);
        setProfile((prev) => prev ? { ...prev, currency: code } : prev);
        sessionStorage.setItem("user-currency", code);
        toast.success(`Currency changed to ${code}`);
        setCurrencyModal(false);
      } else {
        toast.error("Failed to update currency");
      }
    } catch {
      toast.error("An error occurred");
    }
    setSavingCurrency(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/signin");
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  const currentAvatar = imagePreview || editImage;

  if (loading) {
    return (
      <div className="flex flex-col min-h-full pb-6 px-4 pt-6 w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-32" />
          <div className="flex flex-col items-center space-y-4">
            <div className="w-28 h-28 bg-gray-100 rounded-full" />
            <div className="h-6 bg-gray-100 rounded w-40" />
            <div className="h-4 bg-gray-100 rounded w-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-100 rounded-2xl" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-10 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Profile</span>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
      </FadeIn>

      {/* Two-column layout */}
      <div className="lg:flex lg:gap-10">
        {/* Left: User card */}
        <FadeIn className="lg:w-[340px] lg:shrink-0 lg:sticky lg:top-10 lg:self-start">
          <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm lg:p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-brand/10 flex items-center justify-center p-1.5 ring-4 ring-white shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile?.image ? (
                      <img src={profile.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-brand/60">
                        {(profile?.name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={openEditModal}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-brand text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-dark transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile?.name || "User"}</h1>
              <p className="text-brand text-sm font-medium mb-2">{profile?.email}</p>
              <div className="flex items-center text-gray-500 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Member since {memberSince}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-10 lg:mb-0">
              <HoverLift>
                <div className="bg-white lg:bg-gray-50/80 rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 lg:border-gray-200/50">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                    <Edit3 className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-xl font-bold text-gray-900 mb-0.5">{profile?.entryCount ?? 0}</span>
                  <span className="text-[9px] font-bold tracking-wider text-gray-500">ENTRIES</span>
                </div>
              </HoverLift>
              <HoverLift>
                <div className="bg-white lg:bg-gray-50/80 rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 lg:border-gray-200/50">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                    <Banknote className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-xl font-bold text-gray-900 mb-0.5">{getCurrencySymbol(selectedCurrency)}{profile?.totalExpenses?.toFixed(0) ?? "0"}</span>
                  <span className="text-[9px] font-bold tracking-wider text-gray-500">SPENT</span>
                </div>
              </HoverLift>
              <HoverLift>
                <div className="bg-white lg:bg-gray-50/80 rounded-[20px] p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 lg:border-gray-200/50">
                  <div className="w-10 h-10 bg-sky-50/80 text-sky-500 rounded-full flex items-center justify-center mb-3">
                    <Flame className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-xl font-bold text-gray-900 mb-0.5">{profile?.streak ?? 0}</span>
                  <span className="text-[9px] font-bold tracking-wider text-gray-500">STREAK</span>
                </div>
              </HoverLift>
            </div>
          </div>
        </FadeIn>

        {/* Right: Settings */}
        <FadeIn delay={0.15} className="flex-1 lg:min-w-0">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Account Settings</h2>
            <StaggeredList className="space-y-3 px-1 lg:px-0">
              <StaggeredItem>
                <SettingsLink
                  icon={<User className="w-5 h-5" />}
                  title="Edit Profile"
                  description="Update your name and avatar"
                  bgColor="bg-brand text-white"
                  onClick={openEditModal}
                />
              </StaggeredItem>
              <StaggeredItem>
                <SettingsLink
                  icon={<Lock className="w-5 h-5" />}
                  title={profile?.hasPassword ? "Change Password" : "Create Password"}
                  description={profile?.hasPassword ? "Update your security credentials" : "Set a password for your account"}
                  bgColor="bg-gray-200 text-gray-600"
                  onClick={() => setPasswordModal(true)}
                />
              </StaggeredItem>
              <StaggeredItem>
                <SettingsLink
                  icon={<Coins className="w-5 h-5" />}
                  title="Currency"
                  description={`Currently set to ${selectedCurrency} (${getCurrencySymbol(selectedCurrency)})`}
                  bgColor="bg-emerald-100 text-emerald-600"
                  onClick={() => setCurrencyModal(true)}
                />
              </StaggeredItem>
            </StaggeredList>
          </div>

          {/* Theme toggle - mobile only */}
          <div className="flex items-center justify-between px-2 py-3 mb-4 lg:hidden">
            <span className="text-sm font-medium text-gray-700">Theme</span>
            <ThemeToggle />
          </div>

          <div className="mt-4 mb-4 flex justify-center lg:justify-start lg:px-1">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-red-500 font-semibold hover:bg-red-50 px-6 py-3 rounded-full transition-colors active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </FadeIn>
      </div>

      {/* Edit Profile Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ring-4 ring-gray-100">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-brand/60">
                      {(editName || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-dark transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              <p className="text-xs text-gray-400">Click camera to upload (max 2MB)</p>
            </div>

            {/* Name */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-900"
                  placeholder="Your name"
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Member since (read-only) */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Member Since</label>
                <input
                  type="text"
                  value={memberSince}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setEditModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPasswordModal(false)}>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {profile?.hasPassword ? "Change Password" : "Create Password"}
            </h3>
            {passwordError && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">{passwordError}</div>}
            {passwordSuccess && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm mb-4">{passwordSuccess}</div>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              {profile?.hasPassword && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setPasswordModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark">
                  {profile?.hasPassword ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Currency Selector Modal */}
      {currencyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCurrencyModal(false)}>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">Select Currency</h3>
              <button onClick={() => setCurrencyModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-1.5 flex-1 -mx-2 px-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSaveCurrency(c.code)}
                  disabled={savingCurrency}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors ${
                    selectedCurrency === c.code
                      ? "bg-brand/10 border-2 border-brand"
                      : "bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-white/10"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl w-8 text-center font-medium">{c.symbol}</span>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900 block text-sm">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.code}</span>
                    </div>
                  </div>
                  {selectedCurrency === c.code && (
                    <Check className="w-5 h-5 text-brand" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsLink({
  icon, title, description, bgColor, onClick,
}: {
  icon: React.ReactNode; title: string; description?: string; bgColor: string; onClick?: () => void;
}) {
  return (
    <HoverLift>
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-4 lg:p-5 flex items-center justify-between shadow-sm border border-gray-100/50 hover:border-gray-200 transition-colors active:scale-[0.98]"
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
            {icon}
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-900 block">{title}</span>
            {description && <span className="text-xs text-gray-400 hidden lg:block mt-0.5">{description}</span>}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    </HoverLift>
  );
}
