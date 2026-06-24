import React from "react";
import { Document } from "../types";
import { 
  FileText, 
  Sparkles, 
  Trash2, 
  Users, 
  BarChart3, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  ShieldAlert,
  Download,
  ExternalLink,
  Lock,
  CheckCircle2,
  X
} from "lucide-react";

interface DocumentsModuleProps {
  documents: Document[];
  onOpenForm: (type: "document", id?: any, doc?: Document) => void;
  onDeleteDocument: (id: string) => void;
  darkMode?: boolean;
}

export default function DocumentsModule({
  documents,
  onOpenForm,
  onDeleteDocument,
  darkMode = true
}: DocumentsModuleProps) {
  // Sub-tabs: "files" | "bi" | "users"
  const [subTab, setSubTab] = React.useState<"files" | "bi" | "users">("files");
  
  // Access generator modal state
  const [selectedUser, setSelectedUser] = React.useState<{
    name: string;
    role: string;
    path: string;
    tempPass: string;
    token: string;
  } | null>(null);

  const [copied, setCopied] = React.useState(false);

  // List of 4 executive/operational roles to generate PWA accesses
  const usersList = [
    { name: "Henrique", role: "Presidente & CEO", path: "ceo", tempPass: "YEP-CEO-TEMP-741", token: "ACT-8921-CEO-99" },
    { name: "Débora", role: "Diretor Comercial", path: "comercial", tempPass: "YEP-COM-TEMP-283", token: "ACT-4122-COM-88" },
    { name: "Katia Farah", role: "Diretor Financeiro", path: "financeiro", tempPass: "YEP-FIN-TEMP-405", token: "ACT-5901-FIN-77" },
    { name: "Rubens Bossi", role: "Coordenador Administrativo", path: "administrativo", tempPass: "YEP-ADM-TEMP-932", token: "ACT-1883-ADM-66" }
  ];

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPWALink = (path: string) => {
    return `${window.location.origin}/pwa/${path}`;
  };

  const isDark = darkMode;
  const c = {
    card: isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm",
    text: isDark ? "text-white" : "text-slate-900",
    textMuted: isDark ? "text-slate-400" : "text-slate-500",
    border: isDark ? "border-slate-800" : "border-slate-200",
    input: isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-350 text-slate-900"
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Module Title */}
      <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Central de Arquivos, BI & Acessos</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Gerencie contratos, visualize relatórios de Business Intelligence e gere aplicativos PWA personalizados para cargos da empresa.
          </p>
        </div>
        {subTab === "files" && (
          <button
            onClick={() => onOpenForm("document")}
            className="bg-[#dfb26c] hover:bg-[#c99f5d] text-slate-950 rounded-lg px-4 py-2 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-lg shadow-[#dfb26c]/5"
          >
            + Novo Documento
          </button>
        )}
      </div>

      {/* Sub-tab Navigation Bar */}
      <div className="flex gap-2 border-b border-slate-850 pb-2 select-none">
        <button
          onClick={() => setSubTab("files")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "files" 
              ? "bg-[#dfb26c]/15 text-[#dfb26c] border border-[#dfb26c]/30 font-bold" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText size={14} />
          Documentos
        </button>
        <button
          onClick={() => setSubTab("bi")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "bi" 
              ? "bg-[#dfb26c]/15 text-[#dfb26c] border border-[#dfb26c]/30 font-bold" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 size={14} />
          BI & Indicadores
        </button>
        <button
          onClick={() => setSubTab("users")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === "users" 
              ? "bg-[#dfb26c]/15 text-[#dfb26c] border border-[#dfb26c]/30 font-bold" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users size={14} />
          Usuários & PWA
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. DOCUMENTOS TAB                                        */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "files" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {documents.map(d => (
            <div key={d.id} className={`${c.card} border p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all duration-350`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#dfb26c]/10 rounded-lg text-[#dfb26c]">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans font-bold text-xs text-white truncate" title={d.name}>{d.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{d.description}</span>
                  <span className="text-[9px] text-slate-500 font-mono block mt-1">Tipo: {d.type} • {d.fileSize || "1.0 MB"}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-850/50 mt-1 select-none">
                <button
                  onClick={() => onOpenForm("document", undefined, d)}
                  className="w-1/2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg py-1.5 font-bold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles size={10} /> Editar
                </button>
                <button
                  onClick={() => onDeleteDocument(d.id)}
                  className="w-1/2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg py-1.5 font-bold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                >
                  <Trash2 size={10} /> Excluir
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="col-span-4 text-center text-xs text-slate-500 py-10 font-medium">Nenhum documento anexado.</p>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. BI & INDICADORES TAB                                  */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "bi" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
          {/* Dashboard Card 1 */}
          <div className={`${c.card} border p-5 rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#dfb26c]">Performance Comercial</span>
              <BarChart3 size={15} className="text-[#dfb26c]" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">82%</h3>
              <p className="text-[10px] text-slate-450 mt-1">Taxa média de ocupação consolidada nas vilas.</p>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#dfb26c] h-full" style={{ width: "82%" }} />
            </div>
          </div>

          {/* Dashboard Card 2 */}
          <div className={`${c.card} border p-5 rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">Eficiência Operacional</span>
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">96.8%</h3>
              <p className="text-[10px] text-slate-450 mt-1">SLA de resolução de manutenções críticas.</p>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: "96.8%" }} />
            </div>
          </div>

          {/* Dashboard Card 3 */}
          <div className={`${c.card} border p-5 rounded-2xl space-y-4`}>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-400">Liquidez Financeira</span>
              <Smartphone size={15} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">2.8x</h3>
              <p className="text-[10px] text-slate-450 mt-1">Fator de cobertura (Receitas vs Contas a Pagar).</p>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: "75%" }} />
            </div>
          </div>

          {/* Large BI Report Widget */}
          <div className={`${c.card} border p-5 rounded-2xl md:col-span-3 space-y-3`}>
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">Metadados de BI e Consolidação</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Os dados consolidados acima são baseados nas tabelas de propriedades e transações reais do sistema. O algoritmo de BI integra a receita bruta de diárias, amortiza os custos de manutenção preventiva por unidade, e cruza o cronograma de check-ins para gerar previsões de fluxo de caixa futuras de alta acurácia.
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. USUÁRIOS & PWA TAB (ACCESS GENERATOR)                */}
      {/* ──────────────────────────────────────────────────────── */}
      {subTab === "users" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex gap-3.5">
            <Smartphone className="text-[#dfb26c] shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-xs font-bold text-white">Sobre a Tecnologia PWA por Cargo</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1">
                Ao clicar em "Gerar Aplicativo Executivo", você cria um atalho de aplicativo PWA de alta performance direcionado ao cargo do usuário. O PWA consome a mesma base de dados, mas renderiza exclusivamente o Command Center Executivo filtrado para sua rotina, ocultando os menus complexos do desktop corporativo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usersList.map((user, idx) => (
              <div key={idx} className={`${c.card} border p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all duration-300`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-white">{user.name}</h3>
                    <span className="text-[10px] font-mono font-bold text-[#dfb26c] uppercase block mt-1">{user.role}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#dfb26c]/10 flex items-center justify-center font-bold text-[#dfb26c] text-[10px]">
                    {user.path.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="border-t border-slate-850/50 mt-4 pt-4 flex justify-between items-center select-none">
                  <span className="text-[10px] text-slate-400 font-mono">Rota: /pwa/{user.path}</span>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="bg-[#dfb26c] hover:bg-[#c99f5d] text-slate-950 font-bold text-[10.5px] px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-[#dfb26c]/5"
                  >
                    <QrCode size={12} />
                    Gerar Aplicativo Executivo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCESS GENERATOR MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0D1625] border border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-6">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="text-center">
              <div className="w-12 h-12 bg-[#dfb26c]/10 border border-[#dfb26c]/30 rounded-2xl flex items-center justify-center mx-auto text-[#dfb26c] mb-3">
                <Smartphone size={22} />
              </div>
              <h3 className="font-display font-extrabold text-base text-white">Aplicativo Executivo Pronto</h3>
              <p className="text-[11px] text-slate-400 mt-1">Acesso PWA personalizado gerado para {selectedUser.name}</p>
            </div>

            {/* QR Code Container */}
            <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl flex flex-col items-center justify-center space-y-3 select-none">
              <div className="bg-white p-2.5 rounded-xl border border-slate-800">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getPWALink(selectedUser.path))}`} 
                  alt="PWA QR Code" 
                  className="w-36 h-36"
                />
              </div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">Escaneie com a câmera do celular para instalar</span>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 text-[10.5px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold uppercase">Cargo Vinculado</span>
                <span className="text-[#dfb26c] font-bold">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-850/60 pt-2">
                <span className="text-slate-500 font-semibold uppercase flex items-center gap-1"><Lock size={10} /> Senha Provisória</span>
                <span className="text-white font-mono font-bold">{selectedUser.tempPass}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-850/60 pt-2">
                <span className="text-slate-500 font-semibold uppercase flex items-center gap-1"><Sparkles size={10} /> Token Ativação</span>
                <span className="text-white font-mono font-bold">{selectedUser.token}</span>
              </div>
            </div>

            {/* Installation Link */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase block font-bold tracking-wider">Link de Instalação Direta</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={getPWALink(selectedUser.path)} 
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-[10px] text-slate-300 font-mono focus:outline-none"
                />
                <button
                  onClick={() => handleCopyLink(getPWALink(selectedUser.path))}
                  className="bg-[#dfb26c]/10 hover:bg-[#dfb26c]/20 text-[#dfb26c] border border-[#dfb26c]/20 p-2.5 rounded-xl cursor-pointer transition-all"
                  title="Copiar Link"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Footer Install Advice */}
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/60 text-[9.5px] text-slate-450 leading-relaxed space-y-1 select-none">
              <span className="font-bold text-white block uppercase tracking-wider text-[8px]">Dica de Instalação:</span>
              <p><strong>iOS (Safari):</strong> Abra o link, toque em Compartilhar e selecione "Adicionar à Tela de Início".</p>
              <p><strong>Android (Chrome):</strong> Abra o link, toque nos três pontos e selecione "Instalar aplicativo".</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
