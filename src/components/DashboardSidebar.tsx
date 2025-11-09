"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types/user";

type Props = {
  user: User;
  onLogout: () => void;
};

export default function DashboardSidebar({ user, onLogout }: Props) {
  const pathname = usePathname();

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => {
    const isActive = pathname === href || href.startsWith("#");
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
          isActive ? "text-[var(--accent)]" : "text-slate-300 hover:text-[var(--accent)]"
        }`}
      >
        <span className="text-xl" aria-hidden>{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar hidden min-h-screen shrink-0 md:flex md:flex-col md:py-6 md:px-4">
      {/* Profile */}
      <div className="flex items-center gap-3 px-2">
        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[var(--border)]">
          <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized />
        </div>
        <div>
          <div className="text-xs text-[var(--muted)]">Bem-vindo</div>
          <div className="font-semibold text-slate-100">{user.username}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-8 grid gap-1 px-1">
        <NavItem href="/" label="Painel" icon={<span>🏠</span>} />
        <NavItem href="#scripts" label="Scripts" icon={<span>📁</span>} />
        <NavItem href="#licenses" label="Licenças" icon={<span>🪪</span>} />
      </nav>

      <div className="mt-auto px-1">
        <button onClick={onLogout} className="btn w-full border-red-900/40 bg-[#151317] text-slate-300 hover:border-red-800/60">
          <span>⎋</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
