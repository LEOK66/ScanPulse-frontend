import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, Home, BarChart2, TrendingUp } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6 flex items-center">
        <QrCode className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">ScanPulse</h1>
      </div>
      <nav className="mt-6">
        <Link
          href="/dashboard"
          className={`flex items-center px-6 py-3 text-gray-700 ${
            pathname === "/dashboard" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
        >
          <Home className="h-5 w-5 mr-3" />
          Dashboard
        </Link>
        <Link
          href="/polls"
          className={`flex items-center px-6 py-3 text-gray-700 ${
            pathname === "/polls" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
        >
          <BarChart2 className="h-5 w-5 mr-3" />
          All Polls
        </Link>
        <Link
          href="/analytics"
          className={`flex items-center px-6 py-3 text-gray-700 ${
            pathname === "/analytics" ? "bg-gray-200" : "hover:bg-gray-200"
          }`}
        >
          <TrendingUp className="h-5 w-5 mr-3" />
          Analytics
        </Link>
      </nav>
    </div>
  );
}
