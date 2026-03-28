"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import Link from "next/link";
import { C } from "@/lib/constants";

interface Conversion {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  timestamp: string;
  status: "DONE" | "PROCESSING";
  downloadUrl?: string;
}

function getStoredConversions(): Conversion[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("morphix_conversions") || "[]"); }
  catch { return []; }
}

export default function ConversionsPage() {
  const router = useRouter();
  const [conversions, setConversions] = useState<Conversion[]>([]);

  useEffect(() => {
    getCurrentUser()
      .then(() => setConversions(getStoredConversions()))
      .catch(() => router.push("/auth"));
  }, [router]);

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    return new Date(ts).toLocaleDateString();
  };

  const pill = (text: string, type: "source" | "target"): React.CSSProperties => ({
    fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em",
    padding: "3px 8px", borderRadius: 4,
    background: type === "source" ? C.surface : `${C.accent}18`,
    color: type === "source" ? C.primary : C.accent,
  });

  async function downloadConversion(c: Conversion) {
    if (!c.downloadUrl) return;
    try {
      const response = await fetch(c.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const origName = c.fileName.split(".").slice(0, -1).join(".");
      a.download = `${origName}_morphix.${c.targetFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.base, fontFamily: "Inter, system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <nav className="nav-padding" style={{
        background: "#fff", borderBottom: "0.5px solid #E0DEEE",
        height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 48px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div className="nav-mobile-gap" style={{ display: "flex", alignItems: "center", gap: 32 }}>
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
          <Link href="/conversions" style={{
            fontSize: 13, fontWeight: 500, color: C.primary,
            textDecoration: "none", borderBottom: `2px solid ${C.primary}`, paddingBottom: 2,
          }}>
            My Conversions
          </Link>
          <Link className="hide-mobile" href="/convert" style={{
            fontSize: 13, fontWeight: 500, color: "#fff",
            textDecoration: "none", background: C.primary,
            padding: "7px 16px", borderRadius: 8,
          }}>
            + New
          </Link>
        </div>
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </Link>
      </nav>

      <main className="conversions-main" style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "48px 48px 64px" }}>

        {/* Header */}
        <div className="conversions-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 500, color: C.text, marginBottom: 8 }}>My conversions</h1>
            <p style={{ fontSize: 14, color: `${C.text}50` }}>Review and manage your recent processing history.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            <Link href="/convert" style={{
              fontSize: 13, fontWeight: 500, color: "#fff",
              textDecoration: "none", background: C.primary,
              padding: "9px 18px", borderRadius: 8,
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New conversion
            </Link>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}35`, marginBottom: 8 }}>
                Storage Usage
              </p>
              <div style={{ width: 96, height: 3, background: C.low, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(conversions.length * 5, 100)}%`, background: C.primary, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(83,74,183,0.05)", overflow: "hidden" }}>

          {/* Table header — hidden on mobile */}
          <div className="conversions-table-header" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 28px", borderBottom: "0.5px solid #F4F3FB" }}>
            {["File Transformation", "Processed", "Status", "Actions"].map(h => (
              <p key={h} style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}35` }}>
                {h}
              </p>
            ))}
          </div>

          {/* Empty state */}
          {conversions.length === 0 && (
            <div style={{ padding: "80px 28px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.light} strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: `${C.text}50`, marginBottom: 6 }}>No conversions yet</p>
              <p style={{ fontSize: 13, color: `${C.text}35` }}>Upload your first file to get started.</p>
            </div>
          )}

          {/* Rows */}
          {conversions.map((c, i) => (
            <div key={c.id} className="conversions-row" style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
              padding: "20px 28px", alignItems: "center",
              borderBottom: i < conversions.length - 1 ? "0.5px solid #F8F7FF" : "none",
            }}>
              {/* File */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.text, wordBreak: "break-all" }}>{c.fileName}</span>
                    <span style={pill(c.sourceFormat, "source")}>{c.sourceFormat}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: `${C.text}35` }}>→</span>
                    <span style={pill(c.targetFormat, "target")}>{c.targetFormat}</span>
                  </div>
                </div>
              </div>

              {/* Time */}
              <p style={{ fontSize: 13, color: `${C.text}55` }}>{formatTime(c.timestamp)}</p>

              {/* Status */}
              <div>
                {c.status === "DONE" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#16A34A", background: "#F0FDF4", padding: "6px 12px", borderRadius: 99 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                    Done
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#D97706", background: "#FFFBEB", padding: "6px 12px", borderRadius: 99 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
                    Processing
                  </span>
                )}
              </div>

              {/* Actions */}
              <div>
                {c.status === "DONE" && c.downloadUrl ? (
                  <button onClick={() => downloadConversion(c)} style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "8px 16px", fontSize: 13, fontWeight: 500,
                    color: C.primary, background: "#fff", cursor: "pointer",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </button>
                ) : (
                  <span style={{ fontSize: 13, color: `${C.text}30` }}>Processing...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="convert-footer" style={{ background: C.dark, padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          © 2026 Morphix. Precise Engine Architecture.
        </span>
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