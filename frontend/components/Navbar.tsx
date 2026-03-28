"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { useState } from "react";
import { Logo } from "./Logo";

interface NavbarProps {
  userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-[#E0DEEE]/50">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          {userEmail && (
            <Link
              href="/conversions"
              className="text-[13px] font-medium text-morphix-primary border-b-2 border-morphix-primary pb-0.5"
            >
              My Conversions
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {userEmail ? (
            <>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-8 h-8 rounded-full bg-morphix-surface flex items-center justify-center text-xs font-medium text-morphix-primary hover:bg-morphix-light/40 transition-colors"
              >
                {signingOut ? "..." : userEmail[0].toUpperCase()}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-[13px] text-morphix-text/60 hover:text-morphix-primary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="text-[13px] bg-morphix-primary text-white px-4 py-2 rounded-lg hover:bg-morphix-accent transition-colors font-medium"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}