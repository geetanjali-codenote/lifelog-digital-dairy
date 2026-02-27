import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-brand" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
