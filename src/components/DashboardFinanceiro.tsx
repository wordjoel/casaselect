import React from 'react';

const DashboardFinanceiro = () => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 text-on-background animate-in fade-in duration-700 bg-background">
      {/* Injecting Casa Select Premium Layout */}
      <main className="mt-20 px-container-margin animate-in fade-in duration-700">
{/*  Greeting Section  */}
<section className="mb-stack-lg">
<h1 className="text-headline-lg font-headline-lg text-on-surface flex items-center gap-2">
                Bom dia, Hugo Kobayashi! 👋
            </h1>
<p className="text-body-md font-body-md text-on-surface-variant mt-1">
                Aqui está o resumo geral das suas propriedades.
            </p>
</section>
{/*  Date Filter Button  */}
<div className="mb-stack-lg">
<button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low card-border rounded-xl text-on-surface-variant hover:opacity-80 transition-opacity">
<span className="material-symbols-outlined text-[20px]">calendar_today</span>
<span className="text-body-md font-medium">16 abr. - 16 mai, 2025</span>
<span className="material-symbols-outlined text-[20px]">expand_more</span>
</button>
</div>
{/*  Financial Summary  */}
<section className="mb-stack-lg">
<div className="flex justify-between items-end mb-stack-md">
<h2 className="text-headline-md font-headline-md text-on-surface">Resumo financeiro</h2>
<button className="text-primary font-bold text-body-md hover:underline decoration-2 underline-offset-4">Ver todos</button>
</div>
{/*  Bento Grid of Metrics  */}
<div className="grid grid-cols-2 gap-stack-md">
{/*  Receita Total  */}
<div className="bg-surface-container-lowest p-4 rounded-[24px] card-border premium-shadow flex flex-col justify-between h-40">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-[18px]">payments</span>
<span className="text-caption font-medium text-on-surface-variant">Receita Total</span>
</div>
<div className="text-body-lg font-bold text-on-surface">R$ 126.540,89</div>
<div className="flex items-center gap-1 text-[11px] font-bold text-[#1a8a3d] mt-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
<span>+18.6% vs período anterior</span>
</div>
</div>
<div className="sparkline-container mt-2 opacity-80">
<svg className="w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 30">
<path d="M0,25 Q15,10 30,22 T60,5 T100,18" fill="none" stroke="#1a8a3d" strokeWidth="2" vectorEffect="non-scaling-stroke" />
</svg>
</div>
</div>
{/*  Lucro Líquido  */}
<div className="bg-surface-container-lowest p-4 rounded-[24px] card-border premium-shadow flex flex-col justify-between h-40">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-[18px]">savings</span>
<span className="text-caption font-medium text-on-surface-variant">Lucro Líquido</span>
</div>
<div className="text-body-lg font-bold text-on-surface">R$ 71.820,40</div>
<div className="flex items-center gap-1 text-[11px] font-bold text-error mt-1">
<span className="material-symbols-outlined text-[14px]">trending_down</span>
<span>+14.4% vs período anterior</span>
</div>
</div>
<div className="sparkline-container mt-2 opacity-80">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
<path d="M0,5 Q20,25 40,15 T70,28 T100,10" fill="none" stroke="#ba1a1a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
</svg>
</div>
</div>
{/*  Taxa de Ocupação  */}
<div className="bg-surface-container-lowest p-4 rounded-[24px] card-border premium-shadow flex flex-col justify-between h-40">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-[18px]">bed</span>
<span className="text-caption font-medium text-on-surface-variant">Taxa de Ocupação</span>
</div>
<div className="text-body-lg font-bold text-on-surface">78,5%</div>
<div className="flex items-center gap-1 text-[11px] font-bold text-[#1a8a3d] mt-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
<span>+6.2% vs período anterior</span>
</div>
</div>
<div className="sparkline-container mt-2 opacity-80">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
<path d="M0,20 Q25,5 50,15 T100,5" fill="none" stroke="#1a8a3d" strokeWidth="2" vectorEffect="non-scaling-stroke" />
</svg>
</div>
</div>
{/*  ROI Médio  */}
<div className="bg-surface-container-lowest p-4 rounded-[24px] card-border premium-shadow flex flex-col justify-between h-40">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="material-symbols-outlined text-primary text-[18px]">leaderboard</span>
<span className="text-caption font-medium text-on-surface-variant">ROI Médio</span>
</div>
<div className="text-body-lg font-bold text-on-surface">24,7%</div>
<div className="flex items-center gap-1 text-[11px] font-bold text-[#1a8a3d] mt-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
<span>+3.1% vs período anterior</span>
</div>
</div>
<div className="sparkline-container mt-2 opacity-80">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
<path d="M0,22 Q30,28 60,10 T100,5" fill="none" stroke="#1a8a3d" strokeWidth="2" vectorEffect="non-scaling-stroke" />
</svg>
</div>
</div>
</div>
</section>
{/*  Quick Access Section  */}
<section className="mb-stack-lg">
<h2 className="text-headline-md font-headline-md text-on-surface mb-stack-md">Acesso rápido</h2>
<div className="grid grid-cols-4 gap-gutter">
<div className="flex flex-col items-center gap-2">
<button className="w-16 h-16 rounded-[20px] bg-surface-container-high card-border flex items-center justify-center text-primary active:scale-95 transition-transform">
<span className="material-symbols-outlined text-[28px]">domain</span>
</button>
<span className="text-[11px] font-semibold text-on-surface text-center">Propriedades</span>
</div>
<div className="flex flex-col items-center gap-2">
<button className="w-16 h-16 rounded-[20px] bg-surface-container-high card-border flex items-center justify-center text-[#1a8a3d] active:scale-95 transition-transform">
<span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
</button>
<span className="text-[11px] font-semibold text-on-surface text-center">Receitas</span>
</div>
<div className="flex flex-col items-center gap-2">
<button className="w-16 h-16 rounded-[20px] bg-surface-container-high card-border flex items-center justify-center text-error active:scale-95 transition-transform">
<span className="material-symbols-outlined text-[28px]">request_quote</span>
</button>
<span className="text-[11px] font-semibold text-on-surface text-center">Despesas</span>
</div>
<div className="flex flex-col items-center gap-2">
<button className="w-16 h-16 rounded-[20px] bg-surface-container-high card-border flex items-center justify-center text-on-surface active:scale-95 transition-transform">
<span className="material-symbols-outlined text-[28px]">assessment</span>
</button>
<span className="text-[11px] font-semibold text-on-surface text-center">Relatórios</span>
</div>
</div>
</section>
{/*  Placeholder for scroll depth  */}
<section className="mb-10 p-6 bg-primary-container/5 rounded-[24px] card-border border-dashed">
<div className="flex items-center gap-4">
<div className="p-3 bg-primary rounded-full text-white">
<span className="material-symbols-outlined">auto_awesome</span>
</div>
<div>
<h3 className="font-bold text-on-surface">Insight da Semana</h3>
<p className="text-caption text-on-surface-variant">Sua taxa de ocupação em 'Casa Amado' subiu 12% após a nova sessão de fotos.</p>
</div>
</div>
</section>
</main>
    </div>
  );
};

export default DashboardFinanceiro;
