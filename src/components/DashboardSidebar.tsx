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
      {/* Logo */}
      <div className="px-2 mb-4">
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

      {/* Nav */}
      <nav className="mt-8 grid gap-1 px-1">
        <NavItem href="/" label="Painel" icon={<Home size={18} />} />
        <NavItem href="/scripts" label="Scripts" icon={<FileText size={18} />} />
        <NavItem href="/licenses" label="Licenças" icon={<KeyRound size={18} />} />
        <NavItem href="/registros" label="Registros" icon={<ScrollText size={18} />} />
        <NavItem href="/autenticacao" label="Autenticação" icon={<UploadCloud size={18} />} />
      </nav>

      <div className="mt-auto px-1">
        <button onClick={onLogout} className="btn w-full border-red-900/40 bg-[#151317] text-slate-300 hover:border-red-800/60">
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
