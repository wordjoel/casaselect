import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import Logo from "./Logo";
import { loginUser } from "../../data/api";

interface LoginScreenProps {
  onLogin: (user: any) => void;
  isDarkMode: boolean;
}

export default function LoginScreen({ onLogin, isDarkMode }: LoginScreenProps) {
  const [username, setUsername] = useState("hugo");
  const [password, setPassword] = useState("mudar123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Por favor, digite seu usuário.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await loginUser(username.trim().toLowerCase(), password.trim());
      onLogin(user);
    } catch (err: any) {
      setErrorMsg(err.message || "Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className={`w-full h-full flex flex-col justify-between px-6 py-12 relative z-10 ${
        isDarkMode ? "bg-[#121212]/85 backdrop-blur-sm text-gray-100" : "bg-[#FAF8F5]/85 backdrop-blur text-amber-950"
      }`}
    >
      {/* Top Spacer / Language Flag */}
      <div className="flex justify-between items-center text-xs opacity-75 font-mono">
        <span>© 2026 Casa Select 🇧🇷</span>
        <span className="px-2 py-0.5 rounded border border-current text-[10px]">PT-BR</span>
      </div>

      {/* Main Crest and Logo */}
      <div className="flex flex-col items-center my-auto py-4">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <Logo variant="full" isDarkMode={isDarkMode} size={84} />
        </motion.div>
      </div>

      {/* Form Credentials */}
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {errorMsg && (
          <div className="text-red-500 text-xs bg-red-500/10 py-2 px-3 rounded text-center">
            {errorMsg}
          </div>
        )}

        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-semibold mb-1 opacity-75`}>
            Usuário
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
              <User size={16} />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none border ${
                isDarkMode
                  ? "bg-[#1C1C1E] border-neutral-800 text-white focus:border-[#C59B27]"
                  : "bg-white border-amber-200 text-amber-950 focus:border-[#A57C1B]"
              }`}
              placeholder="Ex: hugo.kobayashi"
            />
          </div>
        </div>

        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-semibold mb-1 opacity-75`}>
            Senha
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all focus:outline-none border ${
                isDarkMode
                  ? "bg-[#1C1C1E] border-neutral-800 text-white focus:border-[#C59B27]"
                  : "bg-white border-amber-200 text-amber-950 focus:border-[#A57C1B]"
              }`}
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-sm font-semibold tracking-wide text-white uppercase mt-2 shadow-lg cursor-pointer bg-gradient-to-r from-[#C29438] to-[#916B21] hover:from-[#dca843] hover:to-[#a77c27] disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar no Painel"}
        </motion.button>
      </form>

      {/* Footer link */}
      <div className="text-center mt-6">
        <a
          href="#esqueci"
          onClick={(e) => e.preventDefault()}
          className="text-xs hover:underline opacity-80 decoration-[#C59B27] underline-offset-4"
        >
          Esqueci minha senha
        </a>
      </div>
    </motion.div>
  );
}
