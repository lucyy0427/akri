"use client";

import { BarChart3, CheckSquare, Home, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", icon: Home, href: "/dashboard" },
  { name: "Our Day", icon: CheckSquare, href: "/our-day" },
  { name: "Finance", icon: Wallet, href: "/finance" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] transition ${
                active
                  ? "bg-[#f5f5f0] text-[#252525]"
                  : "text-[#888] hover:text-[#252525]"
              }`}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}