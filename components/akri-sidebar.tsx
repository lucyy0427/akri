import {
  BarChart3,
  CheckSquare,
  CircleUserRound,
  Home,
  Moon,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  {
    name: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    name: "Our Day",
    icon: CheckSquare,
    href: "/our-day",
  },
  {
    name: "Akshaya",
    icon: CircleUserRound,
    href: "/akshaya",
  },
  {
    name: "Rishi",
    icon: CircleUserRound,
    href: "/rishi",
  },
  {
    name: "Sleep",
    icon: Moon,
    href: "/sleep",
  },
  {
    name: "Finance",
    icon: Wallet,
    href: "/finance",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
];

export function AkriSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-black/5 bg-[#f5f5f0] px-5 py-7 md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="px-3">
          <h1 className="text-xl font-semibold tracking-tight">AKRI</h1>
          <p className="mt-1 text-xs text-[#888]">Life + Work OS</p>
        </div>

        {/* Navigation */}
        <nav className="mt-10 flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            if (item.href) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#666] transition hover:bg-white hover:text-[#252525]"
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.name}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.name}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#666] transition hover:bg-white hover:text-[#252525]"
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="mt-auto">
        <Link
            href="/settings"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#666] transition hover:bg-white hover:text-[#252525]"
>
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
        </Link>
        </div>
      </div>
    </aside>
  );
}