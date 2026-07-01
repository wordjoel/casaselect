import React, { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import Logo from "./Logo";

interface LoginScreenProps {
  onLogin: (username: string) => void;
  isDarkMode: boolean;
}

export default function LoginScreen({ onLogin, isDarkMode }: LoginScreenProps) {
  const [username, setUsername] = useState("iury");
  const [password, setPassword] = useState("iury");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Por favor, digite seu usuário.");
      return;
    }
    onLogin(username);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className={`w-full h-full flex flex-col justify-between px-6 py-10 relative z-10 ${
        isDarkMode ? "bg-[#0B0F14] text-gray-100" : "bg-[#F8F6F2] text-amber-950"
      }`}
    >
      {/* Top Spacer / Status Bar Placeholder */}
      <div className="h-6" />

      {/* Main Logo & Greetings */}
      <div className="flex flex-col items-center my-auto py-2 space-y-6">
        <Logo variant="full" isDarkMode={isDarkMode} size={70} />

        <div className="text-center space-y-1">
          <h2 
            className={`font-serif text-[22px] font-bold ${
              isDarkMode ? "text-[#E6C687]" : "text-[#4A3C31]"
            }`}
            style={{ fontFamily: "'Playfair Display', 'Times New Roman', Georgia, serif" }}
          >
            Bem-vindo!
          </h2>
          <p className={`text-[11px] opacity-70 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            Acesse sua conta para continuar
          </p>
        </div>
      </div>

      {/* Form Credentials */}
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {errorMsg && (
          <div className="text-red-500 text-xs bg-red-500/10 py-2 px-3 rounded text-center">
            {errorMsg}
          </div>
        )}

        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl text-xs transition-all focus:outline-none border ${
              isDarkMode
                ? "bg-[#11161D] border-neutral-800 text-white focus:border-[#C8A27A]"
                : "bg-white border-stone-200 text-amber-950 focus:border-[#A97142]"
            }`}
            placeholder="E-mail ou CPF"
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl text-xs transition-all focus:outline-none border pr-10 ${
              isDarkMode
                ? "bg-[#11161D] border-neutral-800 text-white focus:border-[#C8A27A]"
                : "bg-white border-stone-200 text-amber-950 focus:border-[#A97142]"
            }`}
            placeholder="Senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {/* Link Esqueci a Senha */}
        <div className="text-right">
          <a
            href="#esqueci"
            onClick={(e) => e.preventDefault()}
            className={`text-[10.5px] hover:underline ${
              isDarkMode ? "text-[#E6C687]" : "text-[#A97142]"
            }`}
          >
            Esqueceu a senha?
          </a>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-xs font-bold tracking-widest text-white uppercase mt-2 shadow-lg cursor-pointer bg-[#A97142] hover:bg-[#8e5c32] active:scale-[0.99] transition-all"
        >
          ENTRAR
        </button>

        {/* Criar Conta Link */}
        <div className="text-center pt-2">
          <span className={`text-[11px] opacity-75 ${isDarkMode ? "text-neutral-400" : "text-[#856E58]"}`}>
            Não tem uma conta?{" "}
            <a
              href="#criar"
              onClick={(e) => e.preventDefault()}
              className={`font-bold hover:underline ${
                isDarkMode ? "text-[#E6C687]" : "text-[#A97142]"
              }`}
            >
              Criar conta
            </a>
          </span>
        </div>
      </form>

      {/* Biometrics Fingerprint section */}
      <div className="flex flex-col items-center pt-6 pb-2">
        <div 
          className={`p-3 rounded-full cursor-pointer border ${
            isDarkMode 
              ? "bg-[#11161D] border-neutral-800 text-[#E6C687]" 
              : "bg-white border-stone-200 text-[#A97142]"
          } hover:scale-105 active:scale-95 transition-all shadow-sm`}
          onClick={() => onLogin("iury")}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 10a2 2 0 0 0-2 2v3" />
            <path d="M14 10a4 4 0 0 0-8 0v4" />
            <path d="M8 14a6 6 0 0 0 12 0v-3a10 10 0 0 0-20 0v3" />
            <path d="M12 2a12 12 0 0 0-12 12" />
            <path d="M12 22a10 10 0 0 0 10-10" />
            <path d="M16 14a2 2 0 0 0 2-2V9a6 6 0 0 0-12 0v3" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
