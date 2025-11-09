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
        className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl px-4 py-5 border overflow-hidden transition ${
          isActive
            ? "border-[var(--accent)]/60 bg-[var(--accent)]/10 shadow-[0_0_0_1px_var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface)]/30 hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
        }`}
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--surface)] text-slate-300 group-hover:text-[var(--accent)]"}`}>
          {icon}
        </div>
        <span className={`text-xs font-semibold tracking-wide uppercase ${isActive ? "text-[var(--accent)]" : "text-slate-400 group-hover:text-[var(--accent)]"}`}>{label}</span>
        {isActive && (
          <span className="absolute inset-x-6 bottom-2 h-1 rounded-full bg-[var(--accent)]/70" />
        )}
      </Link>
    );
  };

  return (
    <aside className="sidebar hidden min-h-screen shrink-0 md:flex md:flex-col md:px-4">
      {/* Centered stack */}
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        {/* Logo */}
        <div className="mb-10">
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
        {/* Nav vertically centered */}
        <nav className="grid gap-4 w-full">
          <NavItem href="/" label="Painel" icon={<Home size={22} />} />
          <NavItem href="/scripts" label="Scripts" icon={<FileText size={22} />} />
          <NavItem href="/licenses" label="Licenças" icon={<KeyRound size={22} />} />
          <NavItem href="/registros" label="Registros" icon={<ScrollText size={22} />} />
          <NavItem href="/autenticacao" label="Autenticação" icon={<UploadCloud size={22} />} />
        </nav>
      </div>
      {/* Logout */}
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
