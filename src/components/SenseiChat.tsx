import React from "react";
import { Sparkles, BrainCircuit, Send, MessageSquare, CornerDownLeft, RefreshCw, Star } from "lucide-react";
import Markdown from "react-markdown";
import { askSelectSensei } from "../data/api";
import { Message } from "../types";

interface SenseiChatProps {
  onActivityInjected?: () => void;
}

const PRESET_QUESTIONS = [
  { text: "Qual imóvel gera mais lucro?", icon: "🏆" },
  { text: "Qual imóvel tem maior ROI?", icon: "📈" },
  { text: "Qual imóvel tem menor rentabilidade?", icon: "📉" },
  { text: "Quanto gastei com manutenção?", icon: "🔧" },
  { text: "Quanto gastei em piscina?", icon: "🏊" },
  { text: "Quanto recebi este mês?", icon: "💰" },
  { text: "Quais contas vencem esta semana?", icon: "📅" },
  { text: "Quais imóveis precisam de atenção?", icon: "⚠️" },
  { text: "Gerar recomendações automáticas.", icon: "🏯" }
];

export default function SenseiChat({ onActivityInjected }: SenseiChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "model",
      text: "Bem-vindo ao **Select Sensei**, seu conselheiro sênior de inteligência imobiliária patrimonial.\n\nAnaliso em tempo real o fluxo financeiro, despesas preventivas, DRE consolidada, reservas e histórico de ativos do seu portfólio. Meu objetivo é aplicar inteligência analítica **Premium** para maximizar a sua rentabilidade.\n\nComo posso guiar suas decisões hoje? Escolha um dos direcionamentos rápidos abaixo ou faça uma pergunta livre.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const chatPayload = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const reply = await askSelectSensei(chatPayload);

      const senseiMsg: Message = {
        role: "model",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, senseiMsg]);
      if (onActivityInjected) {
        onActivityInjected();
      }

    } catch (err: any) {
      console.error(err);
      
      const errorMsg: Message = {
        role: "model",
        text: "Desculpe, meu centro neural de processamento de dados está recalibrando. Por favor, tente novamente.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        text: "Histórico limpo. Estou pronto para iniciar novas análises financeiras. O que deseja auditar?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div id="sensei-chat-box" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[calc(100vh-140px)] shadow-lg shadow-black/50">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#dfb26c]/15 text-[#dfb26c] border border-[#dfb26c]/30 rounded-xl flex items-center justify-center shadow-lg shadow-accent-purple/10">
            <BrainCircuit size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-white">SELECT SENSEI</h3>
              <span className="bg-[#dfb26c]/20 text-[#dfb26c] border border-[#dfb26c]/20 text-[8px] font-mono rounded px-1.5 py-0.5 tracking-wider font-extrabold uppercase">AI · PREMIUM</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">MODEL: OPENROUTER / GEMINI 2.5 FLASH (FREE) • REAL-TIME CALCULATED CONTEXT</p>
          </div>
        </div>

        <button 
          id="btn-clear-chat"
          onClick={clearChat}
          className="text-slate-500 hover:text-white transition-all text-xs font-semibold px-2 py-1 bg-slate-950 border border-slate-850 rounded-lg cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={11} />
          <span>Limpar Chat</span>
        </button>
      </div>

      {/* Messages Stream View */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((m, index) => {
          const isModel = m.role === "model";
          return (
            <div 
              id={`chat-msg-${index}`}
              key={index}
              className={`flex items-start gap-3.5 max-w-[85%] ${isModel ? "self-start" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border select-none ${
                isModel 
                  ? "bg-[#dfb26c]/15 text-[#dfb26c] border-[#dfb26c]/20" 
                  : "bg-slate-850 text-slate-300 border-slate-800"
              }`}>
                {isModel ? "🏯" : "👤"}
              </div>

              <div className="space-y-1">
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isModel 
                    ? "bg-slate-950/60 border border-slate-800 text-slate-200" 
                    : "bg-[#dfb26c]/90 text-white rounded-tr-none font-medium"
                }`}>
                  <div className="markdown-body select-text">
                    <Markdown>{m.text}</Markdown>
                  </div>
                </div>
                <span className={`text-[9px] text-slate-600 font-mono block ${isModel ? "pl-2" : "text-right pr-2"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5 max-w-[80%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-[#dfb26c]/15 text-[#dfb26c] border border-[#dfb26c]/20 flex items-center justify-center shrink-0">
              🏯
            </div>
            <div className="space-y-1.5">
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#dfb26c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="font-mono text-[10px] pl-1.5 text-slate-500">Sensei processando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Suggestions Row */}
      <div className="py-2.5 space-y-1.5 shrink-0 select-none">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block pl-1">DIRETRIZES DA PLATAFORMA</span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              id={`preset-question-${idx}`}
              key={idx}
              onClick={() => handleSendMessage(pq.text)}
              disabled={loading}
              className="text-[10px] font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-full px-3 py-1.5 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{pq.icon}</span>
              <span>{pq.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text input bar */}
      <form 
        id="chat-send-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="flex items-center gap-2 bg-slate-950 border border-slate-850 rounded-xl p-1.5 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Faça uma análise de margem ou consulte o fluxo de caixa..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 text-xs text-white focus:outline-none placeholder-slate-600 disabled:opacity-50"
        />
        <button
          id="btn-chat-submit"
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="w-8 h-8 rounded-lg bg-[#dfb26c] hover:bg-[#dfb26c]-hover text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-[#dfb26c] cursor-pointer shrink-0"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
