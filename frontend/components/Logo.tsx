import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}

export function Logo({ size = "md", dark = false }: LogoProps) {
  const gridSize = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-9 h-9" : "w-7 h-7";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <div className={`grid grid-cols-2 gap-0.5 ${gridSize}`}>
        <div className="rounded-sm bg-morphix-primary" />
        <div className="rounded-sm bg-morphix-light opacity-60" />
        <div className="rounded-sm bg-morphix-light opacity-30" />
        <div className="rounded-sm bg-morphix-accent" />
      </div>
      <span className={`font-medium ${textSize} ${dark ? "text-white" : "text-morphix-text"}`}>
        Morph<span className="text-morphix-accent">ix</span>
      </span>
    </Link>
  );
}