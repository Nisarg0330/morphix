import Link from "next/link";
import { Logo } from "./Logo";

interface FooterProps {
  dark?: boolean;
}

export function Footer({ dark = false }: FooterProps) {
  return (
    <footer className={`py-8 px-8 border-t ${dark ? "bg-morphix-dark border-white/5" : "bg-morphix-dark border-white/5"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo dark />
          <span className="text-[11px] text-white/30 uppercase tracking-widest hidden md:block">
            © 2026 Morphix. Precise Engine Architecture.
          </span>
        </div>
        <div className="flex items-center gap-6">
          {["Terms", "Privacy", "Documentation"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-[11px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}