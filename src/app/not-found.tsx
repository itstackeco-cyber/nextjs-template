import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="p-3 bg-indigo-100 rounded-xl" aria-hidden="true">
          <FileQuestion size={28} className="text-indigo-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Page not found</h1>
        <p className="text-sm text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
