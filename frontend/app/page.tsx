import Link from "next/link";
import { C } from "@/lib/constants";

export default function HomePage() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: C.text, overflowX: "hidden" }}>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#fff", borderBottom: "0.5px solid #E0DEEE",
        height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 48px",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 26, height: 26 }}>
            <div style={{ background: C.primary, borderRadius: 3 }} />
            <div style={{ background: C.light, borderRadius: 3, opacity: 0.6 }} />
            <div style={{ background: C.light, borderRadius: 3, opacity: 0.3 }} />
            <div style={{ background: C.accent, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: C.text }}>
            Morph<span style={{ color: C.accent }}>ix</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/auth" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>Sign in</Link>
          <Link href="/auth" style={{
            fontSize: 13, background: C.primary, color: "#fff",
            padding: "8px 18px", borderRadius: 8, textDecoration: "none", fontWeight: 500,
          }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: C.dark, paddingTop: 140, paddingBottom: 100,
        paddingLeft: 48, paddingRight: 48,
        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 500, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
          Transform anything.<br />
          <span style={{ color: C.accent }}>Instantly.</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
          Upload a file, pick a format, download the result in seconds.
          Powered by AWS Lambda for production-grade speed.
        </p>
        <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          <Link href="/auth" style={{
            background: C.primary, color: "#fff", padding: "12px 28px",
            borderRadius: 8, fontWeight: 500, fontSize: 14, textDecoration: "none",
          }}>Start converting</Link>
          <Link href="#features" style={{
            color: "rgba(255,255,255,0.7)", padding: "12px 28px", borderRadius: 8,
            fontWeight: 500, fontSize: 14, textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>View Documentation</Link>
        </div>

        {/* Transfer Rail */}
        <div style={{
          background: "#1D1B2E", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "14px 24px",
          display: "flex", alignItems: "center", maxWidth: 400, width: "100%",
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 8, display: "block" }}>Source</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AFA9EC" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>project_specs.pdf</span>
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(127,119,221,0.15)", border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 16px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 8, display: "block" }}>Target</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>DOCX</span>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
            </div>
          </div>
        </div>
      </section>

      {/* Formats strip */}
      <section style={{
        background: C.low, borderBottom: "0.5px solid #E0DEEE",
        padding: "14px 48px", display: "flex", alignItems: "center", gap: 28,
      }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, fontWeight: 500 }}>
          Supported Formats
        </span>
        {["JPG", "PNG", "WEBP", "PDF", "SVG", "MP4", "MOV"].map(f => (
          <span key={f} style={{ fontSize: 12, fontWeight: 500, color: C.primary }}>{f}</span>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={{ background: "#fff", padding: "96px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
            <div style={{ maxWidth: 460 }}>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 500, color: C.text, lineHeight: 1.3, marginBottom: 12 }}>
                Precision-engineered for file processing.
              </h2>
              <p style={{ fontSize: 14, color: `${C.text}80`, lineHeight: 1.7 }}>
                We stripped away the complexity of traditional converters. No accounts, no waiting lines, just raw execution power.
              </p>
            </div>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.primary}80`, fontWeight: 500 }}>
              Core Architecture
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { icon: "⚡", title: "Lightning fast", desc: "Execution happens in serverless warm-pools, meaning your conversion starts the millisecond you hit upload.", meta: "AVERAGE EXECUTION  140MS" },
              { icon: "🛡", title: "Secure by default", desc: "Files are processed in ephemeral containers and wiped instantly after download. We never store your data.", meta: "ENCRYPTION  AES-256" },
              { icon: "⊞", title: "Any format", desc: "From legacy document types to modern high-efficiency image formats, we handle the translation flawlessly.", meta: "SUPPORTED TYPES  150+" },
            ].map(f => (
              <div key={f.title} style={{ background: C.base, borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: `${C.text}70`, lineHeight: 1.7, flex: 1 }}>{f.desc}</p>
                <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: `${C.primary}90`, fontWeight: 500, marginTop: 20, paddingTop: 16, borderTop: "0.5px solid #E0DEEE" }}>
                  {f.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split section — wave image as rounded box */}
      <div style={{ background: "#F8F7FF" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "80px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}>
          {/* Wave image box */}
          <div style={{
            borderRadius: 20,
            overflow: "hidden",
            position: "relative",
            aspectRatio: "1 / 1",
          }}>
            <img
              src="/wave.png"
              alt="Engine visualization"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Engine status card overlay */}
            <div style={{
              position: "absolute",
              bottom: 20, left: 20,
              background: "rgba(8,6,18,0.88)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "12px 18px",
            }}>
              <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)", fontWeight: 500, marginBottom: 12 }}>
                Engine Status
              </p>
              <div style={{ display: "flex", gap: 28 }}>
                {[{ num: "99.9%", label: "UPTIME" }, { num: "0.02s", label: "LATENCY" }].map(stat => (
                  <div key={stat.label}>
                    <p style={{ fontSize: "1.5rem", fontWeight: 500, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{stat.num}</p>
                    <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text side */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: C.primary, fontWeight: 500, marginBottom: 20 }}>
              Developer First
            </p>
            <h2 style={{ fontSize: "2rem", fontWeight: 500, color: C.text, lineHeight: 1.25, marginBottom: 20 }}>
              Built for scale,<br />designed for users.
            </h2>
            <p style={{ fontSize: 14, color: `${C.text}65`, lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
              Whether you're converting a single photo for social media or automating thousands of PDF-to-image transformations, Morphix handles the load without breaking a sweat.
            </p>
            <ul style={{ listStyle: "none", marginBottom: 36, display: "flex", flexDirection: "column", gap: 16 }}>
              {["REST API Access for Enterprises", "Batch Processing Capabilities", "Zero Configuration Required"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: `${C.text}75` }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/auth" style={{
              display: "inline-flex", alignItems: "center",
              background: C.primary, color: "#fff",
              padding: "13px 28px", borderRadius: 8,
              fontWeight: 500, fontSize: 14,
              textDecoration: "none", width: "fit-content",
            }}>
              Explore documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: C.dark, padding: "28px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 20, height: 20 }}>
              <div style={{ background: C.primary, borderRadius: 2 }} />
              <div style={{ background: C.light, borderRadius: 2, opacity: 0.5 }} />
              <div style={{ background: C.light, borderRadius: 2, opacity: 0.3 }} />
              <div style={{ background: C.accent, borderRadius: 2 }} />
            </div>
            <span style={{ color: "#fff", fontWeight: 500, fontSize: 15 }}>
              Morph<span style={{ color: C.accent }}>ix</span>
            </span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            © 2024 Morphix. Precise Engine Architecture.
          </p>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["Terms", "Privacy", "Documentation"].map(item => (
            <Link key={item} href="#" style={{
              fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
              color: "rgba(255,255,255,0.25)", textDecoration: "none",
            }}>{item}</Link>
          ))}
        </div>
      </footer>

    </div>
  );
}