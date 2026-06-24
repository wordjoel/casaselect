import React, { useState } from "react";
import { Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../data/api";
import { User, Property } from "../types";
import { KobayashiLogo } from "./Sidebar";

interface LoginScreenProps {
  onLogin: (user: User) => void;
  darkMode: boolean;
}

export function LoginScreen({ onLogin, darkMode }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginUser(username.trim().toLowerCase(), password.trim());
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{ 
        backgroundColor: darkMode ? "#0a0a0a" : "#FDFBF7",
        backgroundImage: `url('/assets/${darkMode ? "login-bg-alt.jpg" : "login-bg-light.jpg"}')`
      }}
    >
      {/* Véu Translúcido (Glassmorphism) sobre a foto para dar requinte e sofisticação */}
      <div className="absolute inset-0 pointer-events-none backdrop-blur-md" 
           style={{ background: darkMode ? "rgba(10,12,18,0.55)" : "rgba(253,251,247,0.30)" }} />

      {/* ════════════════════════════════════════
          FUNDO COMPLETO — SVG DE ONDAS + ESCUDO
          ════════════════════════════════════════ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* ── Gradientes de onda ── */}
          <linearGradient id="wave-g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#dfb26c" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#c9963a" stopOpacity="0.07"/>
          </linearGradient>
          <linearGradient id="wave-g2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#e8c880" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="#b89047" stopOpacity="0.05"/>
          </linearGradient>
          <linearGradient id="wave-g3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#c9963a" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#f0d898" stopOpacity="0.16"/>
          </linearGradient>

          {/* ── Relevo lateral esquerdo ── */}
          <linearGradient id="edge-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#c8a86a" stopOpacity="0.28"/>
            <stop offset="60%"  stopColor="#e2cfa0" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#ede5d0" stopOpacity="0.00"/>
          </linearGradient>

          {/* ── Relevo lateral direito ── */}
          <linearGradient id="edge-right" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%"   stopColor="#c8a86a" stopOpacity="0.28"/>
            <stop offset="60%"  stopColor="#e2cfa0" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#ede5d0" stopOpacity="0.00"/>
          </linearGradient>

          {/* ── Filtro blur para ondas ── */}
          <filter id="wave-blur">
            <feGaussianBlur stdDeviation="2.5"/>
          </filter>
        </defs>

        {/* ─── ONDAS INFERIOR-ESQUERDA ─── */}
        <path d="M -80 820 Q 200 680 480 750 Q 760 820 1000 680 Q 1240 540 1540 620"
          stroke="#dfb26c" strokeWidth="1.8" fill="none" opacity="0.22"/>
        <path d="M -80 860 Q 220 720 520 790 Q 800 860 1060 730 Q 1300 600 1540 660"
          stroke="#c9a050" strokeWidth="1.2" fill="none" opacity="0.16"/>
        <path d="M -80 900 Q 260 760 560 830 Q 840 895 1100 770 Q 1360 650 1540 700"
          stroke="#b89047" strokeWidth="0.7" fill="none" opacity="0.12"/>

        {/* Onda preenchida base */}
        <path d="M -80 870 Q 200 720 520 800 Q 840 880 1100 750 Q 1340 630 1540 700 L 1540 900 L -80 900 Z"
          fill="url(#wave-g1)" filter="url(#wave-blur)" opacity="0.9"/>

        {/* ─── ONDAS SUPERIOR-DIREITA ─── */}
        <path d="M 1540 120 Q 1260 240 980 170 Q 700 100 420 220 Q 160 340 -80 280"
          stroke="#dfb26c" strokeWidth="1.6" fill="none" opacity="0.18"/>
        <path d="M 1540 80 Q 1240 200 960 130 Q 680 60 380 180 Q 120 300 -80 240"
          stroke="#c9a050" strokeWidth="1.0" fill="none" opacity="0.13"/>
        <path d="M 1540 40 Q 1220 160 940 90 Q 650 20 360 140 Q 90 260 -80 200"
          stroke="#b89047" strokeWidth="0.6" fill="none" opacity="0.10"/>

        {/* Onda preenchida topo */}
        <path d="M 1540 100 Q 1260 220 960 150 Q 680 80 400 200 Q 140 320 -80 260 L -80 0 L 1540 0 Z"
          fill="url(#wave-g2)" filter="url(#wave-blur)" opacity="0.9"/>

        {/* ─── ONDAS INTERMEDIÁRIAS — centro/esquerda ─── */}
        <path d="M -80 500 Q 160 430 360 480 Q 560 530 720 460 Q 880 390 1020 440"
          stroke="#dfb26c" strokeWidth="1.0" fill="none" opacity="0.11"/>
        <path d="M -80 550 Q 180 480 400 530 Q 620 580 780 510 Q 940 440 1100 490"
          stroke="#c9a050" strokeWidth="0.7" fill="none" opacity="0.08"/>

        {/* ─── ONDAS INTERMEDIÁRIAS — centro/direita ─── */}
        <path d="M 1540 500 Q 1320 440 1100 490 Q 880 540 720 470 Q 560 400 380 450"
          stroke="#dfb26c" strokeWidth="1.0" fill="none" opacity="0.11"/>
        <path d="M 1540 560 Q 1300 500 1080 550 Q 860 600 700 530 Q 540 460 340 510"
          stroke="#c9a050" strokeWidth="0.7" fill="none" opacity="0.08"/>

        {/* ─── RELEVO LATERAL ESQUERDO ─── */}
        <rect x="0" y="0" width="110" height="900" fill="url(#edge-left)"/>
        {/* Linha de destaque borda esquerda */}
        <line x1="1" y1="0" x2="1" y2="900" stroke="rgba(255,248,225,0.55)" strokeWidth="1.5"/>
        <line x1="2.5" y1="0" x2="2.5" y2="900" stroke="rgba(210,175,110,0.20)" strokeWidth="1"/>

        {/* ─── RELEVO LATERAL DIREITO ─── */}
        <rect x="1330" y="0" width="110" height="900" fill="url(#edge-right)"/>
        {/* Linha de destaque borda direita */}
        <line x1="1439" y1="0" x2="1439" y2="900" stroke="rgba(255,248,225,0.55)" strokeWidth="1.5"/>
        <line x1="1437.5" y1="0" x2="1437.5" y2="900" stroke="rgba(210,175,110,0.20)" strokeWidth="1"/>

        {/* ─── ESCUDO GRANDE — forma exata do logo, totalmente transparente e sutil ─── */}
        {/* viewBox do logo é 0 0 100 100, escudo vai de 20,14 a 80,86 */}
        {/* Usamos opacity super baixa para que a foto brilhe através do escudo */}
        <g transform="translate(720, 450) scale(7.2) translate(-50, -50)" opacity="0.15">
          {/* Sombra levíssima do escudo */}
          <path
            d="M 50 14 L 80 22 L 80 56 C 80 72, 62 82, 50 86 C 38 82, 20 72, 20 56 L 20 22 Z"
            fill="rgba(120, 88, 30, 0.025)"
            transform="translate(0.4, 1.2)"
          />
          {/* Corpo do escudo — quase transparente */}
          <path
            d="M 50 14 L 80 22 L 80 56 C 80 72, 62 82, 50 86 C 38 82, 20 72, 20 56 L 20 22 Z"
            fill="rgba(194, 155, 80, 0.018)"
          />
          {/* Borda externa — finíssima e quase invisível */}
          <path
            d="M 50 14 L 80 22 L 80 56 C 80 72, 62 82, 50 86 C 38 82, 20 72, 20 56 L 20 22 Z"
            stroke="rgba(200, 158, 80, 0.18)"
            strokeWidth="0.55"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Borda interna — quase invisível */}
          <path
            d="M 50 17.5 L 77 24.5 L 77 56 C 77 70, 61 79, 50 83 C 39 79, 23 70, 23 56 L 23 24.5 Z"
            stroke="rgba(220, 185, 110, 0.09)"
            strokeWidth="0.28"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Monograma CS — marca d'água levíssima */}
          <g transform="translate(0, 3)">
            <text x="38" y="62"
              fontFamily="'Playfair Display', Georgia, serif"
              fontSize="42" fontWeight="900"
              fill="rgba(185, 143, 68, 0.045)"
              textAnchor="middle">C</text>
            <text x="59" y="66"
              fontFamily="'Playfair Display', Georgia, serif"
              fontSize="42" fontWeight="900"
              fill="rgba(185, 143, 68, 0.045)"
              textAnchor="middle">S</text>
          </g>
        </g>
      </svg>

      {/* ════════════════════════════════════════
          CARD DE LOGIN — glass premium
          ════════════════════════════════════════ */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ width: "min(340px, 88vw)" }}
      >
        <div
          className="w-full rounded-2xl p-7 flex flex-col items-center"
          style={{
            /* Glass — translúcido sutil */
            background: "rgba(253, 249, 240, 0.38)",
            backdropFilter: "blur(36px) saturate(1.2)",
            WebkitBackdropFilter: "blur(36px) saturate(1.2)",
            /* Bordas suavíssimas */
            border: "1px solid rgba(225, 195, 130, 0.18)",
            /* Sombras levíssimas */
            boxShadow:
              /* luz de topo — relevo sutil */
              "0 1px 0 rgba(255, 252, 240, 0.60) inset, " +
              /* sombra interna base */
              "0 -1px 0 rgba(160, 120, 50, 0.04) inset, " +
              /* brilho lateral */
              "1px 0 0 rgba(255, 252, 240, 0.35) inset, " +
              /* sombra externa suave */
              "0 20px 55px rgba(120, 88, 25, 0.08), " +
              /* sombra dourada muito suave */
              "0 4px 18px rgba(184, 144, 71, 0.07), " +
              /* anel externo quase invisível */
              "0 0 0 1px rgba(210, 178, 110, 0.10)",
          }}
        >
          {/* Logo + Nome */}
          <div className="flex flex-col items-center mb-5 select-none">
            <KobayashiLogo darkMode={false} className="w-14 h-14 mb-3 drop-shadow" />
            <h1
              className="text-xl font-bold text-center tracking-tight"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: "#b89047",
              }}
            >
              Casa Select
            </h1>
            {/* Linha separadora dourada */}
            <div style={{
              marginTop: "8px",
              width: "40px", height: "1.5px",
              background: "linear-gradient(90deg, transparent, #dfb26c 40%, #f0d898 60%, transparent)",
              borderRadius: "99px",
            }} />
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-center font-medium"
                style={{
                  background: "rgba(220,60,60,0.07)",
                  border: "1px solid rgba(220,60,60,0.20)",
                  color: "#c0392b"
                }}>
                {error}
              </div>
            )}

            {/* Campo Usuário */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-4 w-4" style={{ color: "#c9a050" }} />
              </div>
              <input
                type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: "rgba(253, 248, 235, 0.52)",
                  border: "1px solid rgba(196,170,100,0.20)",
                  color: "#3D2E1A",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.55) inset",
                }}
                placeholder="Ex: hugo" required
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(184,144,71,0.70)";
                  e.target.style.boxShadow = "0 1px 0 rgba(255,255,255,0.70) inset, 0 0 0 3px rgba(184,144,71,0.09)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(196,170,100,0.32)";
                  e.target.style.boxShadow = "0 1px 0 rgba(255,255,255,0.70) inset";
                }}
              />
            </div>

            {/* Campo Senha */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4" style={{ color: "#c9a050" }} />
              </div>
              <input
                type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: "rgba(253, 248, 235, 0.52)",
                  border: "1px solid rgba(196,170,100,0.20)",
                  color: "#3D2E1A",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.55) inset",
                }}
                placeholder="••••••••" required
                onFocus={(e) => {
                  e.target.style.border = "1px solid rgba(184,144,71,0.70)";
                  e.target.style.boxShadow = "0 1px 0 rgba(255,255,255,0.70) inset, 0 0 0 3px rgba(184,144,71,0.09)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid rgba(196,170,100,0.32)";
                  e.target.style.boxShadow = "0 1px 0 rgba(255,255,255,0.70) inset";
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ color: "#c9a050" }}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Botão ENTRAR */}
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm tracking-widest transition-all duration-200 mt-1 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c9a455 0%, #e0ba72 50%, #b89047 100%)",
                color: "#fff",
                letterSpacing: "0.13em",
                /* Relevo no botão */
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.28) inset, " +
                  "0 -1px 0 rgba(100,65,0,0.18) inset, " +
                  "0 5px 20px rgba(184,144,71,0.38), " +
                  "0 2px 6px rgba(100,70,10,0.22)",
                textShadow: "0 1px 2px rgba(100,65,10,0.30)",
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "translateY(-1.5px)";
                b.style.boxShadow =
                  "0 1px 0 rgba(255,255,255,0.32) inset, " +
                  "0 -1px 0 rgba(100,65,0,0.18) inset, " +
                  "0 8px 28px rgba(184,144,71,0.48), " +
                  "0 3px 10px rgba(100,70,10,0.28)";
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = "translateY(0)";
                b.style.boxShadow =
                  "0 1px 0 rgba(255,255,255,0.28) inset, " +
                  "0 -1px 0 rgba(100,65,0,0.18) inset, " +
                  "0 5px 20px rgba(184,144,71,0.38), " +
                  "0 2px 6px rgba(100,70,10,0.22)";
              }}
            >
              {loading ? "..." : "ENTRAR"}
            </button>
          </form>

          {/* Rodapé */}
          <div className="mt-5 pt-4 w-full text-center"
            style={{ borderTop: "1px solid rgba(184,144,71,0.14)" }}>
            <p className="text-xs leading-relaxed"
              style={{ color: "#B0A090", fontFamily: "Inter, sans-serif" }}>
              Perfis: admin, hugo, katia, mariana, rubens<br />
              Senha padrão: mudar123 (admin: admin123)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
