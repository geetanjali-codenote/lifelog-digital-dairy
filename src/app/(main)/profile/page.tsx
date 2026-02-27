import Link from "next/link";
import { ChevronLeft, Settings, Calendar, Edit3, Banknote, User, Lock, Bell, ChevronRight, LogOut } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
      {/* Mobile Top App Bar — hidden on desktop */}
      <div className="flex justify-between items-center mb-10 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Profile</span>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Header — hidden on mobile */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </FadeIn>

      {/* Two-column layout on desktop */}
      <div className="lg:flex lg:gap-10">
        {/* Left column: User card */}
        <FadeIn className="lg:w-[340px] lg:shrink-0 lg:sticky lg:top-10 lg:self-start">
          {/* Card wrapper for desktop */}
          <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm lg:p-8">
            {/* User Info Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-brand/10 flex items-center justify-center p-1.5 ring-4 ring-white shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                    <img
                      src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=FDBA74"
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">Alex Rivers</h1>
              <p className="text-brand text-sm font-medium mb-2">alex.rivers@lifelog.app</p>
              <div className="flex items-center text-gray-500 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Member since Jan 2022</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-10 lg:mb-0">
              <HoverLift>
                <div className="bg-white lg:bg-gray-50/80 rounded-[24px] p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 lg:border-gray-200/50">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Edit3 className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 mb-1">482</span>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500">TOTAL ENTRIES</span>
                </div>
              </HoverLift>

              <HoverLift>
                <div className="bg-white lg:bg-gray-50/80 rounded-[24px] p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 lg:border-gray-200/50">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                    <Banknote className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 mb-1">$12,450</span>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500">LIFETIME SPEND</span>
                </div>
              </HoverLift>
            </div>
          </div>
        </FadeIn>

        {/* Right column: Settings */}
        <FadeIn delay={0.15} className="flex-1 lg:min-w-0">
          {/* Settings List */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Account Settings</h2>

            <StaggeredList className="space-y-3 px-1 lg:px-0">
              <StaggeredItem>
                <SettingsLink
                  icon={<User className="w-5 h-5" />}
                  title="Edit Profile"
                  description="Update your name, bio, and avatar"
                  bgColor="bg-brand text-white"
                />
              </StaggeredItem>
              <StaggeredItem>
                <SettingsLink
                  icon={<Lock className="w-5 h-5" />}
                  title="Change Password"
                  description="Update your security credentials"
                  bgColor="bg-gray-200 text-gray-600"
                />
              </StaggeredItem>
              <StaggeredItem>
                <SettingsLink
                  icon={<Bell className="w-5 h-5" />}
                  title="Notifications"
                  description="Manage alerts and reminders"
                  bgColor="bg-gray-200 text-gray-600"
                />
              </StaggeredItem>
            </StaggeredList>
          </div>

          {/* Sign Out Button */}
          <div className="mt-8 mb-4 flex justify-center lg:justify-start lg:px-1">
            <button className="flex items-center space-x-2 text-red-500 font-semibold hover:bg-red-50 px-6 py-3 rounded-full transition-colors active:scale-95">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

// Subcomponents

function SettingsLink({
  icon,
  title,
  description,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  bgColor: string;
}) {
  return (
    <HoverLift>
      <button className="w-full bg-white rounded-2xl p-4 lg:p-5 flex items-center justify-between shadow-sm border border-gray-100/50 hover:border-gray-200 transition-colors active:scale-[0.98]">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}>
            {icon}
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-900 block">{title}</span>
            {description && (
              <span className="text-xs text-gray-400 hidden lg:block mt-0.5">{description}</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    </HoverLift>
  );
}
