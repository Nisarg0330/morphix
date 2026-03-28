"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import Link from "next/link";
import { C } from "@/lib/constants";

interface Conversion {
  id: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(u => {
        const email = u.signInDetails?.loginId ?? "";
        setUserEmail(email);
        setUserName(email.split("@")[0]);
      })
      .catch(() => router.push("/auth"));

    // Load conversions on client only
    try {
      const stored = JSON.parse(localStorage.getItem("morphix_conversions") || "[]");
      setConversions(stored);
    } catch {
      setConversions([]);
    }
  }, [router]);

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out failed:", err);
      setLoading(false);
    }
  }

  const storageGB = (conversions.length * 0.03).toFixed(1);
  const storagePercent = Math.min(conversions.length * 3, 100);

  return (
    <div style={{ minHeight: "100vh", background: C.base, fontFamily: "Inter, system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <nav className="nav-padding" style={{
        background: "#fff", borderBottom: "0.5px solid #E0DEEE",
        height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 48px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/convert" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 24, height: 24 }}>
            <div style={{ background: C.primary, borderRadius: 2 }} />
            <div style={{ background: C.light, borderRadius: 2, opacity: 0.6 }} />
            <div style={{ background: C.light, borderRadius: 2, opacity: 0.3 }} />
            <div style={{ background: C.accent, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: C.text }}>
            Morph<span style={{ color: C.accent }}>ix</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/conversions" style={{ fontSize: 13, fontWeight: 500, color: C.primary, textDecoration: "none", borderBottom: `2px solid ${C.primary}`, paddingBottom: 2 }}>
            My Conversions
          </Link>
          <Link href="/convert" style={{
            fontSize: 13, fontWeight: 500, color: "#fff",
            textDecoration: "none", background: C.primary,
            padding: "7px 16px", borderRadius: 8,
          }}>
            + New
          </Link>
        </div>
      </nav>

      {/* Profile card */}
      <main className="profile-main" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(83,74,183,0.07)", overflow: "hidden" }}>

            {/* Avatar */}
            <div style={{ padding: "40px 32px 28px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "0.5px solid #F4F3FB" }}>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: C.primary, color: "#fff", fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  PRO PLAN
                </div>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: C.text, marginBottom: 4, marginTop: 8, textTransform: "capitalize" }}>
                {userName || "User"}
              </h2>
              <p style={{ fontSize: 13, color: `${C.text}55` }}>{userEmail}</p>
            </div>

            {/* Stats */}
            <div style={{ padding: "20px 32px", borderBottom: "0.5px solid #F4F3FB" }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: `${C.text}40`, fontWeight: 500, marginBottom: 16 }}>
                Account Stats
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40`, marginBottom: 4 }}>
                    Total Conversions
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 500, color: C.text }}>{conversions.length}</p>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40` }}>
                    Storage Used
                  </p>
                  <p style={{ fontSize: 11, color: `${C.text}50` }}>{storageGB} GB / 10 GB</p>
                </div>
                <div style={{ height: 4, background: C.low, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${storagePercent}%`, background: C.primary, borderRadius: 99 }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40` }}>
                  Member Since
                </p>
                <p style={{ fontSize: 12, color: `${C.text}60` }}>
                  {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "20px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/convert" style={{
                display: "block", textAlign: "center",
                width: "100%", background: C.primary, color: "#fff",
                border: "none", borderRadius: 8, padding: "13px",
                fontSize: 14, fontWeight: 500, textDecoration: "none",
                boxSizing: "border-box",
              }}>
                New Conversion
              </Link>
              <button
                onClick={handleSignOut}
                disabled={loading}
                style={{
                  width: "100%", background: "#fff", color: C.text,
                  border: "0.5px solid #E0DEEE", borderRadius: 8, padding: "13px",
                  fontSize: 14, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "Inter, system-ui, sans-serif",
                  opacity: loading ? 0.6 : 1,
                }}>
                {loading ? "Signing out..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="auth-footer" style={{ background: C.dark, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          © 2026 Morphix. Precise Engine Architecture.
        </p>
        <div className="footer-links" style={{ display: "flex", gap: 28 }}>
          {["Terms", "Privacy", "Documentation"].map(item => (
            <Link key={item} href="#" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}