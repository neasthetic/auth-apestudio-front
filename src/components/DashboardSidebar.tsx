"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types/user";
import { Home, FileText, KeyRound, LogOut, ScrollText, UploadCloud } from "lucide-react";

type Props = {
  user: User;
  onLogout: () => void;
};

export default function DashboardSidebar({ user, onLogout }: Props) {
  const pathname = usePathname();

  const NavItem = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 border transition ${
          isActive
            ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]"
            : "border-[var(--border)] text-slate-300 hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
        }`}
      >
        <span className={`flex items-center justify-center ${isActive ? "text-[var(--accent)]" : "text-slate-400 group-hover:text-[var(--accent)]"}`}>
          {icon}
        </span>
        <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar hidden min-h-screen shrink-0 md:flex md:flex-col md:px-4">
      {/* Logo fixed at top */}
      <div className="pt-6 pb-6">
        <div className="relative w-40 h-12">
          <Image
            src="https://i.ibb.co/WR4k0HQ/complete-logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      {/* Nav below logo (vertically centered) */}
      <div className="flex-1 flex flex-col justify-center">
        <nav className="grid gap-2 w-full">
          <NavItem href="/" label="Painel" icon={<Home size={22} />} />
          <NavItem href="/scripts" label="Scripts" icon={<FileText size={22} />} />
          <NavItem href="/licenses" label="Licenças" icon={<KeyRound size={22} />} />
          <NavItem href="/registros" label="Registros" icon={<ScrollText size={22} />} />
          <NavItem href="/autenticacao" label="Autenticação" icon={<UploadCloud size={22} />} />
        </nav>
      </div>
      {/* Logout at bottom */}
      <div className="pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide uppercase border border-red-900/50 bg-[#151317] text-red-300 hover:border-red-700/70 hover:bg-red-950/30 transition"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
