import React from "react";
import { Sparkles, Mail, Link, Percent, Megaphone, CheckCircle2, ChevronRight, User } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "Email" | "Promoção Direta" | "Parceria";
  target: string;
  status: "Ativo" | "Rascunho" | "Concluído";
  sentCount?: number;
  clickRate?: string;
  discount?: string;
}

const CAMPAIGNS_DATA: Campaign[] = [
  {
    id: "camp-1",
    name: "Boas-vindas Inverno Campos do Jordão",
    type: "Email",
    target: "Hóspedes VIP & Premium",
    status: "Ativo",
    sentCount: 142,
    clickRate: "34.5%"
  },
  {
    id: "camp-2",
    name: "Fidelidade Reserva Direta - 10% Off",
    type: "Promoção Direta",
    target: "Hóspedes Recorrentes",
    status: "Ativo",
    discount: "10% de desconto"
  },
  {
    id: "camp-3",
    name: "Ensaio Fotográfico Editorial - Parceria Vogue",
    type: "Parceria",
    target: "Casa Vintage (Ubatuba)",
    status: "Concluído"
  },
  {
    id: "camp-4",
    name: "Pacote Corporativo Leblon Corporate",
    type: "Promoção Direta",
    target: "Empresas Corporativas",
    status: "Rascunho",
    discount: "Faturamento quinzenal"
  }
];

export default function MarketingView() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(CAMPAIGNS_DATA);

  return (
    <div className="p-6 space-y-6 bg-[#FAFAFA] dark:bg-[#0B0F14] min-h-[calc(100vh-4rem)] text-[#111111] dark:text-[#EAEAEA] animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-[#111111] dark:text-[#EAEAEA]">
            Central de Marketing & Reservas Diretas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Crie campanhas de fidelização, ative códigos de desconto e reduza dependência de taxas de OTAs (Airbnb/Booking).
          </p>
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Promotion Setup */}
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-5 rounded-2xl shadow-sm md:col-span-2 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C8A27A] flex items-center gap-1.5 select-none">
            <Sparkles size={14} />
            Campanhas de Fidelização & Promoções
          </h3>

          <div className="space-y-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-[#FAFAFA] dark:bg-[#101722] border border-slate-150 dark:border-[#202A36] p-4 rounded-xl flex items-center justify-between hover:border-[#C8A27A]/35 dark:hover:border-[#C8A27A]/25 transition duration-150"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C8A27A]/10 text-[#C8A27A] flex items-center justify-center shrink-0">
                    {camp.type === "Email" ? <Mail size={18} /> : camp.type === "Promoção Direta" ? <Percent size={18} /> : <Link size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{camp.name}</h4>
                    <span className="text-[10px] text-slate-450 dark:text-slate-450 mt-1 block">
                      Tipo: {camp.type} • Público: {camp.target}
                    </span>
                    {camp.discount && (
                      <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">
                        Benefício: {camp.discount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`status-badge text-[8.5px] border ${
                    camp.status === "Ativo"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : camp.status === "Rascunho"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400"
                  }`}>
                    {camp.status}
                  </span>
                  {camp.sentCount && (
                    <span className="block text-[9.5px] text-slate-400 dark:text-slate-500 font-mono mt-1.5">
                      {camp.sentCount} Envios (Abertura: {camp.clickRate})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-[#C8A27A] text-[#C8A27A] hover:bg-[#C8A27A]/5 font-bold text-xs uppercase tracking-wider transition cursor-pointer bg-transparent">
            + Nova Campanha Premium
          </button>
        </div>

        {/* Right Column: Concierge VIP Offers */}
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C8A27A] flex items-center gap-1.5 select-none">
              <Megaphone size={14} />
              Recomendações LI Concierge
            </h3>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              O motor de IA analisou seu banco de hóspedes e identificou oportunidades de ocupação para esta semana:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-[#101722] border border-slate-150 dark:border-[#202A36] rounded-xl space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-white">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Cupom de Retorno para Amanda
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-400">
                  Amanda Albuquerque (VIP) fez aniversário no mês passado. Envie um cupom de final de semana na Casa Lilian.
                </p>
                <button className="text-[9.5px] font-bold text-[#C8A27A] hover:underline flex items-center gap-0.5 mt-1 cursor-pointer">
                  Disparar WhatsApp <ChevronRight size={10} />
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#101722] border border-slate-150 dark:border-[#202A36] rounded-xl space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-white">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Promoção Baixa Ocupação Ubatuba
                </div>
                <p className="text-[10px] text-slate-450 dark:text-slate-400">
                  Casa Vintage está com taxa de ocupação de 42%. Oferecer tarifas exclusivas para Lucas Mendes (Novo) e Felipe Bronze (Recorrente).
                </p>
                <button className="text-[9.5px] font-bold text-[#C8A27A] hover:underline flex items-center gap-0.5 mt-1 cursor-pointer">
                  Criar Promoção Inteligente <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-500">
            LI STAYS Marketing Engine • Atualizado em tempo real.
          </div>
        </div>
      </div>
    </div>
  );
}
