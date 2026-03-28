"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import Link from "next/link";
import { C } from "@/lib/constants";

type Step = "signin" | "signup" | "verify";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ username: email, password });
      router.push("/convert");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      if (message.includes("already a signed in user") || message.includes("already signed in")) {
        router.push("/convert");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } });
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      await signIn({ username: email, password });
      router.push("/convert");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendSignUpCode({ username: email });
    } catch (err) {
      console.error("Resend failed:", err);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "#fff", border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "13px 16px", fontSize: 14, color: C.text,
    outline: "none", fontFamily: "Inter, system-ui, sans-serif",
    boxSizing: "border-box" as const,
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: `${C.text}60`, marginBottom: 8,
  };
  const primaryBtn: React.CSSProperties = {
    width: "100%", background: C.primary, color: "#fff", border: "none",
    borderRadius: 8, padding: "14px 16px", fontSize: 14, fontWeight: 500,
    cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxSizing: "border-box" as const,
  };
  const outlineBtn: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 16px",
    fontSize: 13, fontWeight: 500, color: `${C.text}70`, background: "#fff",
    cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif", flex: 1,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.base, fontFamily: "Inter, system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 16px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div className="auth-card" style={{ background: "#fff", borderRadius: 16, padding: "40px 40px 36px", boxShadow: "0 20px 40px rgba(83,74,183,0.07)" }}>

            {/* Logo */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 26, height: 26 }}>
                  <div style={{ background: C.primary, borderRadius: 3 }} />
                  <div style={{ background: C.light, borderRadius: 3, opacity: 0.6 }} />
                  <div style={{ background: C.light, borderRadius: 3, opacity: 0.3 }} />
                  <div style={{ background: C.accent, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 17, fontWeight: 500, color: C.text }}>
                  Morph<span style={{ color: C.accent }}>ix</span>
                </span>
              </Link>
            </div>

            {/* Tabs */}
            {step !== "verify" && (
              <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 28 }}>
                {(["signin", "signup"] as Step[]).map(t => (
                  <button key={t} onClick={() => { setStep(t); setError(""); }}
                    style={{
                      flex: 1, paddingBottom: 14, fontSize: 14, fontWeight: 500,
                      cursor: "pointer", background: "none", border: "none",
                      borderBottom: step === t ? `2px solid ${C.primary}` : "2px solid transparent",
                      color: step === t ? C.primary : `${C.text}45`,
                      fontFamily: "Inter, system-ui, sans-serif",
                      marginBottom: -1, transition: "color 0.15s",
                    }}>
                    {t === "signin" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, padding: "11px 14px", borderRadius: 8, marginBottom: 20, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            {/* Sign In */}
            {step === "signin" && (
              <form onSubmit={handleSignIn}>
                <div style={{ marginBottom: 18 }}>
                  <label style={lbl}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="name@company.com" style={inp} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={lbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)} required
                      placeholder="••••••••" style={{ ...inp, paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: `${C.text}35`, padding: 0, display: "flex", alignItems: "center" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        {showPassword
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  style={{ ...primaryBtn, opacity: loading ? 0.65 : 1, marginBottom: 16 }}>
                  {loading ? "Signing in..." : <><span>Sign in</span><span style={{ fontSize: 16 }}>→</span></>}
                </button>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <button type="button"
                    style={{ background: "none", border: "none", fontSize: 13, color: C.accent, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif" }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: "0.5px", background: C.border }} />
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: `${C.text}35`, whiteSpace: "nowrap" }}>
                    or continue with
                  </span>
                  <div style={{ flex: 1, height: "0.5px", background: C.border }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" style={outlineBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button type="button" style={outlineBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <polyline points="22,4 12,13 2,4"/>
                    </svg>
                    <span>SSO</span>
                  </button>
                </div>
              </form>
            )}

            {/* Sign Up */}
            {step === "signup" && (
              <form onSubmit={handleSignUp}>
                <div style={{ marginBottom: 18 }}>
                  <label style={lbl}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="name@company.com" style={inp} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={lbl}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="Min 8 chars, upper + lower + number" style={inp} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={lbl}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    required placeholder="••••••••" style={inp} />
                </div>
                <button type="submit" disabled={loading}
                  style={{ ...primaryBtn, opacity: loading ? 0.65 : 1 }}>
                  {loading ? "Creating account..." : <><span>Create account</span><span style={{ fontSize: 16 }}>→</span></>}
                </button>
              </form>
            )}

            {/* Verify */}
            {step === "verify" && (
              <form onSubmit={handleVerify}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.text}45`, marginBottom: 10 }}>
                    Verification
                  </p>
                  <p style={{ fontSize: 14, color: `${C.text}70`, lineHeight: 1.6 }}>
                    We sent a code to{" "}
                    <strong style={{ color: C.text, fontWeight: 500 }}>{email}</strong>
                  </p>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={lbl}>Verification Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value.trim())}
                    required placeholder="123456" maxLength={6}
                    style={{ ...inp, textAlign: "center", letterSpacing: "0.35em", fontSize: 22, fontWeight: 500 }} />
                </div>
                <button type="submit" disabled={loading}
                  style={{ ...primaryBtn, opacity: loading ? 0.65 : 1, marginBottom: 14 }}>
                  {loading ? "Verifying..." : "Verify email →"}
                </button>
                <button type="button" onClick={handleResend}
                  style={{ width: "100%", background: "none", border: "none", fontSize: 13, color: `${C.text}40`, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif", padding: "8px 0" }}>
                  Resend code
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="auth-footer" style={{ background: C.dark, padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          © 2026 Morphix. Precise Engine Architecture.
        </span>
        <div className="footer-links" style={{ display: "flex", gap: 28 }}>
          {["Terms", "Privacy", "Documentation"].map(item => (
            <Link key={item} href="#"
              style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}