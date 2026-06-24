import React from 'react';

const AnalyticsReports = () => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 text-on-background animate-in fade-in duration-700 bg-background">
      {/* Injecting Casa Select Premium Layout */}
      <main className="max-w-md mx-auto px-container-margin pt-stack-md space-y-stack-lg">
{/*  Tabs  */}
<div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
<button className="px-5 py-2.5 rounded-full text-label-caps font-label-caps text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors whitespace-nowrap">Overview</button>
<button className="px-5 py-2.5 rounded-full text-label-caps font-label-caps text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors whitespace-nowrap">Receitas</button>
<button className="px-5 py-2.5 rounded-full text-label-caps font-label-caps text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors whitespace-nowrap">Despesas</button>
<button className="px-5 py-2.5 rounded-full text-label-caps font-label-caps text-primary bg-primary-container/20 border border-primary-container/30 transition-colors whitespace-nowrap">OCR</button>
</div>
{/*  OCR Upload Area  */}
<section className="dotted-border p-1 bg-surface-container-lowest/40">
<div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-stack-md">
<div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: '"wght" 300'}}>cloud_upload</span>
</div>
<div>
<p className="text-body-lg font-body-lg text-on-surface">Arraste o comprovante aqui</p>
<p className="text-caption font-caption text-on-surface-variant">ou toque para selecionar</p>
</div>
<button className="gold-gradient-btn text-on-primary py-3 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
<span className="material-symbols-outlined text-xl">photo_camera</span>
                    Capturar com câmera
                </button>
</div>
</section>
{/*  Suggestions  */}
<section className="space-y-stack-sm">
<h2 className="text-label-caps font-label-caps text-on-surface-variant opacity-60">SUGESTÕES RÁPIDAS</h2>
<div className="flex flex-wrap gap-2">
<button className="px-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-low text-body-md text-on-surface-variant hover:bg-surface-container transition-colors">Conta de Luz</button>
<button className="px-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-low text-body-md text-on-surface-variant hover:bg-surface-container transition-colors">Instalação de Ar</button>
<button className="px-4 py-2 rounded-full border border-outline-variant/40 bg-surface-container-low text-body-md text-on-surface-variant hover:bg-surface-container transition-colors">Piscineiro</button>
</div>
</section>
{/*  Recent Extractions  */}
<section className="space-y-stack-md pb-8">
<div className="flex justify-between items-end">
<h2 className="text-label-caps font-label-caps text-on-surface-variant opacity-60">EXTRAÇÕES RECENTES</h2>
<button className="text-primary text-caption font-semibold">Ver tudo</button>
</div>
<div className="space-y-stack-sm">
{/*  Extraction Item 1  */}
<div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/20 flex items-center gap-4 group hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-2xl">description</span>
</div>
<div className="flex-1">
<h3 className="text-body-lg font-bold text-on-surface">Conta de Luz - Casa Amado</h3>
<div className="flex justify-between items-center mt-1">
<p className="text-caption font-caption text-on-surface-variant">15/05/2026</p>
<span className="text-body-md font-bold text-on-surface">R$ 458,90</span>
</div>
</div>
<div className="flex flex-col items-end gap-1">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">Extraído</span>
<span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100 transition-opacity">chevron_right</span>
</div>
</div>
{/*  Extraction Item 2  */}
<div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/20 flex items-center gap-4 group hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-2xl">construction</span>
</div>
<div className="flex-1">
<h3 className="text-body-lg font-bold text-on-surface">Instalação de Ar - Casa Lilian</h3>
<div className="flex justify-between items-center mt-1">
<p className="text-caption font-caption text-on-surface-variant">14/05/2026</p>
<span className="text-body-md font-bold text-on-surface">R$ 2.850,00</span>
</div>
</div>
<div className="flex flex-col items-end gap-1">
<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">Extraído</span>
<span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100 transition-opacity">chevron_right</span>
</div>
</div>
</div>
</section>
</main>
    </div>
  );
};

export default AnalyticsReports;
