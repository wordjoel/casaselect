import React from "react";
import { Sparkles, BrainCircuit, Send, RefreshCw } from "lucide-react";
import Markdown from "react-markdown";
import { askSelectSensei } from "../data/api";
import { Message } from "../types";

interface ChatMessage extends Message {
  actions?: any[];
  approvedActions?: Record<number, 'approved' | 'rejected'>;
}

interface SenseiChatProps {
  onActivityInjected?: () => void;
}

const PRESET_QUESTIONS = [
  { text: "Qual imóvel gerou mais lucro?", icon: "💰" },
  { text: "Quem são meus melhores hóspedes?", icon: "👑" },
  { text: "Quem deve receber promoção?", icon: "🎁" },
  { text: "Qual imóvel está com baixa ocupação?", icon: "📉" }
];

export default function SenseiChat({ onActivityInjected }: SenseiChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "model",
      text: "Bem-vindo à **Central LI Concierge AI**, seu assistente analítico executivo para o portfólio **LI STAYS**.\n\nAnaliso o histórico de faturamento de luxo, diárias médias, canais de distribuição (Airbnb, Booking e Reservas Diretas), margem DRE e comportamento de hóspedes VIP.\n\nComo posso otimizar a sua operação boutique hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const executeAction = async (msgIndex: number, actionIndex: number, action: string, payload: any) => {
    try {
      const token = localStorage.getItem("select_jwt_token");
      const res = await fetch("/api/ai/orchestrator/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action, payload })
      });
      if (res.ok) {
        setMessages(prev => {
          const updated = [...prev];
          if (!updated[msgIndex].approvedActions) updated[msgIndex].approvedActions = {};
          updated[msgIndex].approvedActions![actionIndex] = 'approved';
          return updated;
        });
        if (onActivityInjected) {
          onActivityInjected();
        }
        alert("Ação executada com sucesso!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro ao executar ação: ${errorData.error || res.statusText}`);
      }
    } catch (err: any) {
      alert("Erro de conexão ao executar ação: " + err.message);
    }
  };

  const rejectAction = (msgIndex: number, actionIndex: number) => {
    setMessages(prev => {
      const updated = [...prev];
      if (!updated[msgIndex].approvedActions) updated[msgIndex].approvedActions = {};
      updated[msgIndex].approvedActions![actionIndex] = 'rejected';
      return updated;
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
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

      const result = await askSelectSensei(chatPayload);

      // Rebrand response if it mentions old name
      const cleanReply = (result.text || "")
        .replace(/Select Sensei/g, "LI Concierge AI")
        .replace(/Casa Select/g, "LI STAYS");

      const senseiMsg: ChatMessage = {
        role: "model",
        text: cleanReply,
        actions: result.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, senseiMsg]);
      if (onActivityInjected) {
        onActivityInjected();
      }

    } catch (err: any) {
      console.error(err);
      
      const errorMsg: ChatMessage = {
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
        text: "Histórico limpo. Estou pronto para iniciar novas análises de faturamento e ocupação. O que deseja auditar?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div id="sensei-chat-box" className="bg-[#121922] border border-[#202A36] rounded-2xl p-5 flex flex-col h-[calc(100vh-140px)] shadow-lg shadow-black/30">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#202A36] pb-3 mb-4 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C8A27A]/15 text-[#C8A27A] border border-[#C8A27A]/30 rounded-xl flex items-center justify-center shadow-md">
            <BrainCircuit size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-white tracking-wider">LI CONCIERGE AI</h3>
              <span className="bg-[#C8A27A]/25 text-[#C8A27A] border border-[#C8A27A]/35 text-[8.5px] font-mono rounded px-1.5 py-0.5 tracking-wider font-extrabold uppercase">CHATGPT STYLE</span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">Model: Gemini Enterprise Context</p>
          </div>
        </div>

        <button 
          id="btn-clear-chat"
          onClick={clearChat}
          className="text-slate-400 hover:text-white transition text-xs font-semibold px-3 py-1.5 bg-[#101722] border border-[#202A36] rounded-lg cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw size={11} />
          <span>Limpar</span>
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
                  ? "bg-[#C8A27A]/15 text-[#C8A27A] border-[#C8A27A]/20" 
                  : "bg-[#202A36] text-[#C8A27A] border-[#202A36]"
              }`}>
                {isModel ? "✦" : "👤"}
              </div>

              <div className="space-y-1">
                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isModel 
                    ? "bg-[#101722] border border-[#202A36] text-slate-200" 
                    : "bg-[#C8A27A] text-white rounded-tr-none font-medium"
                }`}>
                  <div className="markdown-body select-text">
                    <Markdown>{m.text}</Markdown>
                  </div>
                </div>

                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block pl-1">Ações Sugeridas pela IA:</span>
                    {m.actions.map((act: any, actIdx: number) => {
                      const status = m.approvedActions?.[actIdx];
                      const isApproved = status === 'approved';
                      const isRejected = status === 'rejected';
                      const isPending = !status;

                      return (
                        <div key={actIdx} className="bg-[#101722] border border-[#202A36] rounded-xl p-3 space-y-2 text-xs max-w-md">
                          <div className="flex justify-between items-center gap-2">
                            <span className="bg-[#C8A27A]/10 text-[#C8A27A] border border-[#C8A27A]/20 px-2 py-0.5 rounded text-[9.5px] font-mono uppercase tracking-wider font-semibold">
                              {act.action ? act.action.replace("CREATE_", "CADASTRAR ").replace("UPDATE_", "ATUALIZAR ").replace("DELETE_", "REMOVER ") : "AÇÃO"}
                            </span>
                            {isApproved && <span className="text-emerald-400 font-bold text-[9.5px] uppercase font-mono">✓ Lançado</span>}
                            {isRejected && <span className="text-rose-400 font-bold text-[9.5px] uppercase font-mono">✗ Descartado</span>}
                          </div>

                          <div className="text-slate-300 bg-[#121922] p-2 rounded text-[10.5px] font-mono space-y-1 overflow-x-auto max-w-full">
                            {act.payload && Object.entries(act.payload).map(([k, v]: [string, any]) => (
                              <div key={k} className="flex justify-between gap-4">
                                <span className="text-slate-500">{k}:</span>
                                <span className="text-slate-200 text-right">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                              </div>
                            ))}
                          </div>

                          {isPending && (
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                onClick={() => rejectAction(index, actIdx)}
                                className="bg-transparent hover:bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 font-bold py-1 px-3 rounded-lg text-[10px] transition-all cursor-pointer"
                              >
                                Descartar
                              </button>
                              <button
                                onClick={() => executeAction(index, actIdx, act.action, act.payload)}
                                className="bg-[#C8A27A] hover:bg-[#b89047] text-white font-bold py-1 px-3.5 rounded-lg text-[10px] transition-all cursor-pointer shadow-md"
                              >
                                Confirmar Lançamento
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <span className={`text-[9px] text-slate-650 font-mono block ${isModel ? "pl-2" : "text-right pr-2"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5 max-w-[80%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-[#C8A27A]/15 text-[#C8A27A] border border-[#C8A27A]/20 flex items-center justify-center shrink-0">
              ✦
            </div>
            <div className="space-y-1.5">
              <div className="bg-[#101722] border border-[#202A36] rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C8A27A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#C8A27A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#C8A27A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="font-mono text-[9px] pl-1.5 text-slate-500">Concierge processando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Suggestions Row */}
      <div className="py-2.5 space-y-1.5 shrink-0 select-none border-t border-[#202A36] mt-4">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block pl-1">Perguntas Frequentes do CRM</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              id={`preset-question-${idx}`}
              key={idx}
              onClick={() => handleSendMessage(pq.text)}
              disabled={loading}
              className="text-[10.5px] font-medium bg-[#101722] border border-[#202A36] hover:border-[#C8A27A]/40 rounded-full px-3 py-1.5 text-slate-350 hover:text-white transition cursor-pointer flex items-center gap-1.5"
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
        className="flex items-center gap-2 bg-[#101722] border border-[#202A36] rounded-xl p-1.5 shrink-0 mt-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Consulte seus melhores hóspedes ou consulte faturamento..."
          disabled={loading}
          className="flex-1 bg-transparent px-3 text-xs text-white focus:outline-none placeholder-slate-600 disabled:opacity-50"
        />
        <button
          id="btn-chat-submit"
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="w-8 h-8 rounded-lg bg-[#C8A27A] hover:bg-[#a97142] text-[#111111] hover:text-white flex items-center justify-center transition disabled:opacity-30 cursor-pointer shrink-0"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
