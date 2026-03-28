import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary flex items-center gap-2">
        <Home size={16} /> Go Home
      </Link>
    </div>
  );
}
