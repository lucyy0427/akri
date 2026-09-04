import {
  BarChart3,
  CheckSquare,
  Home,
  Wallet,
} from "lucide-react";

const navigation = [
  {
    name: "Home",
    icon: Home,
  },
  {
    name: "Our Day",
    icon: CheckSquare,
  },
  {
    name: "Finance",
    icon: Wallet,
  },
  {
    name: "Analytics",
    icon: BarChart3,
  },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className="flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[#777] transition hover:bg-[#f5f5f0] hover:text-[#252525]"
            >
              <Icon size={19} strokeWidth={1.8} />
              <span className="text-[11px]">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}