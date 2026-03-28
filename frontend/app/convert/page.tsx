"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";
import Link from "next/link";
import { getPresignedUrl, uploadToS3, convertFile } from "@/lib/api";
import { C } from "@/lib/constants";

type Status = "idle" | "uploading" | "converting" | "done" | "error";

const FORMAT_OPTIONS: Record<string, string[]> = {
  "image/jpeg": ["PNG", "WEBP", "PDF", "GRAYSCALE"],
  "image/png":  ["JPG", "WEBP", "PDF", "GRAYSCALE"],
  "image/webp": ["JPG", "PNG", "PDF"],
  "application/pdf": [],
};

export default function ConvertPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState("PNG");
  const [status, setStatus] = useState<Status>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(u => {
        setUserEmail(u.signInDetails?.loginId ?? "");
        setUserId(u.userId);
      })
      .catch(() => router.push("/auth"));
  }, [router]);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setTargetFormat("PNG");
    setDownloadUrl("");
    setError("");
    setStatus("idle");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const availableFormats = file
    ? (FORMAT_OPTIONS[file.type] ?? [])
    : ["PNG", "JPG", "WEBP", "PDF", "GRAYSCALE"];

  async function handleConvert() {
    if (!file || !targetFormat) return;
    setError("");
    setStatus("uploading");
    setUploadProgress(0);
    try {
      const { uploadUrl, s3Key } = await getPresignedUrl(
        file.name, file.type, file.size, userId
      );
      await uploadToS3(uploadUrl, file, pct => setUploadProgress(pct));
      setStatus("converting");
      const result = await convertFile(s3Key, targetFormat.toLowerCase(), userId);
      setDownloadUrl(result.downloadUrl);
      const originalName = file.name.split(".").slice(0, -1).join(".");
        const newExt = targetFormat.toLowerCase() === "grayscale"
        ? file.name.split(".").pop()?.toLowerCase()
        : targetFormat.toLowerCase();
        setDownloadFileName(`${originalName}_morphix.${newExt}`);
      setStatus("done");

      // Store in history
      const conversion = {
        id: Date.now().toString(),
        fileName: file.name,
        sourceFormat: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
        targetFormat,
        timestamp: new Date().toISOString(),
        status: "DONE" as const,
        downloadUrl: result.downloadUrl,
      };
      const existing = JSON.parse(localStorage.getItem("morphix_conversions") || "[]");
      localStorage.setItem("morphix_conversions", JSON.stringify([conversion, ...existing].slice(0, 20)));
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Please try again.");
      setStatus("error");
    }
    
  }
  async function handleDownload() {
    if (!downloadUrl || !downloadFileName) return;
    try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Download failed:", err);
    }
  }

  const steps = [
    { key: "uploading", label: "UPLOADING" },
    { key: "converting", label: "CONVERTING" },
    { key: "done", label: "READY" },
  ];

  const stepState = (key: string) => {
    if (status === "idle" || status === "error") return "idle";
    if (key === "uploading") return status === "uploading" ? "active" : "done";
    if (key === "converting") return status === "converting" ? "active" : status === "done" ? "done" : "idle";
    if (key === "done") return status === "done" ? "active" : "idle";
    return "idle";
  };

  return (
    <div style={{ minHeight: "100vh", background: C.base, fontFamily: "Inter, system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "column" }}>

      {/* Navbar */}
      <nav style={{
        background: "#fff", borderBottom: "0.5px solid #E0DEEE",
        height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 48px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
        </div>
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: C.surface, display: "flex",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </Link>
      </nav>

      <main style={{ flex: 1, maxWidth: 680, width: "100%", margin: "0 auto", padding: "48px 24px 64px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: C.primary, marginBottom: 8 }}>
            Precise Engine V2.4
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 500, color: C.text }}>Convert a file</h1>
        </div>

        {/* Status strip */}
        {status !== "idle" && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            {steps.map((s, i) => {
              const state = stepState(s.key);
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "unset" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: state === "active" ? C.primary : state === "done" ? "#22C55E" : `${C.text}20`,
                      transition: "background 0.3s",
                    }} />
                    <span style={{
                      fontSize: 11, fontWeight: 500, textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: state === "active" ? C.primary : state === "done" ? "#22C55E" : `${C.text}30`,
                      transition: "color 0.3s",
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: "0.5px", background: `${C.text}12`, margin: "0 16px" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Main card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(83,74,183,0.06)", overflow: "hidden", marginBottom: 32 }}>

          {/* SOURCE / TARGET header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "0.5px solid #F4F3FB" }}>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40` }}>
              Source Input
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40` }}>
              Target Output
            </span>
          </div>

          <div style={{ padding: 24 }}>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              style={{
                border: `1.5px dashed ${dragging ? C.primary : file ? C.accent : "#DDDAF5"}`,
                borderRadius: 12, padding: "48px 24px", textAlign: "center",
                cursor: "pointer", background: dragging ? C.surface : file ? `${C.surface}50` : C.base,
                marginBottom: 24, transition: "all 0.2s",
              }}
            >
              <input id="file-input" type="file" style={{ display: "none" }}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />

              {file ? (
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>{file.name}</p>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40`, marginBottom: 14 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button onClick={e => { e.stopPropagation(); setFile(null); setStatus("idle"); setDownloadUrl(""); }}
                    style={{ background: "none", border: "none", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: `${C.text}35`, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}>
                    × Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 8 }}>
                    Drag your file here or click to browse
                  </p>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}40` }}>
                    Max 50 MB · JPG, PNG, WEBP, PDF Supported
                  </p>
                </div>
              )}
            </div>

            {/* Format selector */}
            {availableFormats.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}50`, marginBottom: 10 }}>
                  Convert To
                </label>
                <div style={{ position: "relative" }}>
                  <select value={targetFormat} onChange={e => setTargetFormat(e.target.value)}
                    style={{ width: "100%", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 40px 13px 16px", fontSize: 14, color: C.text, appearance: "none", outline: "none", fontFamily: "Inter, system-ui, sans-serif", cursor: "pointer" }}>
                    {availableFormats.map(fmt => (
                      <option key={fmt} value={fmt}>{fmt}</option>
                    ))}
                  </select>
                  <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {file && availableFormats.length === 0 && (
              <div style={{ marginBottom: 16, padding: "11px 14px", background: "#FFFBEB", borderRadius: 8, fontSize: 13, color: "#D97706" }}>
                PDF as source format is not supported yet.
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ marginBottom: 16, padding: "11px 14px", background: "#FEF2F2", borderRadius: 8, fontSize: 13, color: "#DC2626" }}>
                {error}
              </div>
            )}

            {/* Upload progress */}
            {status === "uploading" && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ height: 3, background: C.base, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: C.primary, borderRadius: 99, width: `${uploadProgress}%`, transition: "width 0.3s" }} />
                </div>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: `${C.text}40`, marginTop: 8, textAlign: "right" }}>
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* Convert button */}
            <button onClick={handleConvert}
              disabled={!file || !targetFormat || status === "uploading" || status === "converting"}
              style={{
                width: "100%", background: C.primary, color: "#fff", border: "none",
                borderRadius: 12, padding: "16px", fontSize: 15, fontWeight: 500,
                cursor: !file || !targetFormat || status === "uploading" || status === "converting" ? "not-allowed" : "pointer",
                fontFamily: "Inter, system-ui, sans-serif",
                opacity: !file || !targetFormat ? 0.5 : 1,
                transition: "opacity 0.2s",
                marginBottom: status === "done" ? 14 : 0,
              }}>
              {status === "uploading" ? `Uploading... ${uploadProgress}%` :
               status === "converting" ? "Converting..." :
               "Convert file"}
            </button>

            {/* Download */}
            {status === "done" && downloadUrl && (
            <button
                onClick={handleDownload}
                style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                border: `1.5px solid ${C.primary}`, borderRadius: 12, padding: "14px",
                fontSize: 14, fontWeight: 500, color: C.primary,
                background: C.surface, width: "100%", cursor: "pointer",
                fontFamily: "Inter, system-ui, sans-serif",
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download {downloadFileName}
            </button>
            )}
          </div>
        </div>

        {/* Bottom metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {[
            { label: "Security", text: "Files are encrypted end-to-end and automatically purged from our edge nodes after 24 hours." },
            { label: "Speed", text: "Processing takes an average of 1.2s per 10MB using our serverless infrastructure." },
          ].map(m => (
            <div key={m.label}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: C.primary, marginBottom: 10 }}>
                {m.label}
              </p>
              <p style={{ fontSize: 13, color: `${C.text}55`, lineHeight: 1.7 }}>{m.text}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: C.dark, padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Morphix</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            © 2026 Morphix. Precise Engine Architecture.
          </span>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
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