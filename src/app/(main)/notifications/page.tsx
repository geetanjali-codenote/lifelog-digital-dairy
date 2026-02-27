import Link from "next/link";
import { ChevronLeft, Bell, BellRing, Settings, Circle, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";

const notifications = [
  { id: 1, type: "reminder", title: "Daily Check-in", content: "Don't forget to log your memory for today!", time: "2 hours ago", isRead: false },
  { id: 2, type: "system", title: "Streak Saved!", content: "You hit a 7-day streak. Keep it up!", time: "Yesterday", isRead: false },
  { id: 3, type: "update", title: "New Feature Available", content: "You can now add multiple images to a single memory.", time: "Oct 22, 2023", isRead: true },
  { id: 4, type: "reminder", title: "Weekly Review", content: "Take a moment to review this week's highlights.", time: "Oct 20, 2023", isRead: true },
  { id: 5, type: "system", title: "Welcome to LifeLog", content: "Your personal digital diary is ready to use.", time: "Oct 15, 2023", isRead: true },
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-3xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Notifications</span>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated with your latest alerts and reminders.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </FadeIn>

      {/* Notifications List */}
      <div className="bg-white lg:bg-transparent lg:shadow-none lg:border-none rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <StaggeredList className="divide-y divide-gray-100" staggerDelay={0.05}>
          {notifications.map((notification) => (
            <StaggeredItem key={notification.id}>
              <HoverLift>
                <div className={`p-4 lg:p-5 flex items-start space-x-4 lg:rounded-2xl lg:border lg:border-transparent lg:hover:border-gray-200 lg:bg-white lg:shadow-sm lg:mb-3 transition-colors ${!notification.isRead ? "bg-brand/5 lg:bg-brand/5" : "hover:bg-gray-50 lg:hover:bg-white"
                  }`}>
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-gray-100 text-gray-500"
                    }`}>
                    {notification.type === "reminder" ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-bold truncate pr-4 ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      <span className="shrink-0 text-[11px] font-medium text-gray-400 mt-1">{notification.time}</span>
                    </div>
                    <p className={`text-sm line-clamp-2 ${!notification.isRead ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                      {notification.content}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <div className="shrink-0 pt-2">
                      <Circle className="w-2.5 h-2.5 fill-brand text-brand" />
                    </div>
                  )}
                </div>
              </HoverLift>
            </StaggeredItem>
          ))}
        </StaggeredList>
      </div>

    </div>
  );
}
