import React from 'react';

const PropertyOverview = () => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 text-on-background animate-in fade-in duration-700 bg-background">
      {/* Injecting Casa Select Premium Layout */}
      <main className="pb-32">
{/*  Search & Filter Section  */}
<section className="px-container-margin pt-stack-md">
{/*  Search Bar  */}
<div className="relative w-full group">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
<input className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant/40 rounded-full text-body-md focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all" placeholder="Buscar propriedades" type="text"/>
</div>
{/*  Tabs  */}
<div className="flex gap-stack-sm mt-stack-md overflow-x-auto pb-2 no-scrollbar">
<button className="px-6 py-2 bg-primary text-on-primary rounded-full text-label-caps font-label-caps whitespace-nowrap shadow-sm">
                    Todas
                </button>
<button className="px-6 py-2 bg-surface-container-highest text-on-surface-variant rounded-full text-label-caps font-label-caps whitespace-nowrap hover:bg-outline-variant/20 transition-colors">
                    Ativas
                </button>
<button className="px-6 py-2 bg-surface-container-highest text-on-surface-variant rounded-full text-label-caps font-label-caps whitespace-nowrap hover:bg-outline-variant/20 transition-colors">
                    Inativas
                </button>
</div>
</section>
{/*  Property List  */}
<section className="px-container-margin mt-stack-md space-y-stack-md">
{/*  Card: Casa Amado  */}
<div className="flex bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-[0_4px_20px_rgba(159,116,36,0.05)] active:scale-[0.98] transition-transform duration-200">
<div className="w-32 h-32 flex-shrink-0">
<img alt="Casa Amado" className="w-full h-full object-cover" data-alt="A luxury contemporary villa with a pristine swimming pool and minimalist architecture. The scene is bathed in warm golden hour sunlight, highlighting the premium champagne and ivory tones of the exterior. Lush tropical greenery surrounds the property, creating a sense of exclusive privacy and high-end hospitality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgy-tTnA9mVCz7_28s2jiTJz-a8j-ro5GvRY0nYOgCBR4EXcMqXWn_k7-QXen8R-ASDQk24yBxMkuMf9zLOfEzTw97T_Wi5KhjnrPZrfXVYLAQ66XXZmKLMmxacWctzNu0vff3shFqcTiQ4rFXKDhpbIAteORtuiTIhaQt4EIoEN48THrZXuzL5de5bkq5he5yCvfIclQo0kTzi_xdGHuYEicF_WCkZhuj8rmTZCT5XbG5LaDiHeQ"/>
</div>
<div className="flex-grow p-4 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start">
<h3 className="text-body-lg font-bold text-on-surface">Casa Amado</h3>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span>
<span className="text-caption font-semibold">4.8</span>
</div>
</div>
<p className="text-primary font-bold mt-1">R$ 18.145 <span className="text-caption font-normal text-on-surface-variant">Rec/Mês</span></p>
</div>
<div className="flex items-center gap-1.5">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full" style={{width: '68%'}}></div>
</div>
<span className="text-caption text-on-surface-variant whitespace-nowrap">68% Ocupação</span>
</div>
</div>
</div>
{/*  Card: Casa Lilian  */}
<div className="flex bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-[0_4px_20px_rgba(159,116,36,0.05)] active:scale-[0.98] transition-transform duration-200">
<div className="w-32 h-32 flex-shrink-0">
<img alt="Casa Lilian" className="w-full h-full object-cover" data-alt="Modern architectural gem with glass walls and dark wood accents. The property is set against a soft sunset sky with pastel oranges and pinks, echoing the boutique luxury aesthetic. The lighting is soft and diffused, emphasizing the high-quality materials and professional management standards." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtp1b8wi8xF5WXoW42MMWjvgnilIcl95enbwczFgKCDuiFrvKijZTlBH86hAsFwt1QO-oQJCmr34mZZze7lKOs3BUmzdJuw6vfjjWVA3GXNL0R-X-CqRKNME_ZDzWC18iEjJ47ep0uz-87m-Smx3E7daHGXBeMmbaPWiR88o9Bv_Fm9Ik2C_SygSlMEHzTqtYbBs60knhqL3vEh0nJhqPN2Z9C8l9S5bJbcfNakGTd8Js_1Df9CNs"/>
</div>
<div className="flex-grow p-4 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start">
<h3 className="text-body-lg font-bold text-on-surface">Casa Lilian</h3>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span>
<span className="text-caption font-semibold">4.7</span>
</div>
</div>
<p className="text-primary font-bold mt-1">R$ 15.780 <span className="text-caption font-normal text-on-surface-variant">Rec/Mês</span></p>
</div>
<div className="flex items-center gap-1.5">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full" style={{width: '62%'}}></div>
</div>
<span className="text-caption text-on-surface-variant whitespace-nowrap">62% Ocupação</span>
</div>
</div>
</div>
{/*  Card: Casa Mayla  */}
<div className="flex bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-[0_4px_20px_rgba(159,116,36,0.05)] active:scale-[0.98] transition-transform duration-200">
<div className="w-32 h-32 flex-shrink-0">
<img alt="Casa Mayla" className="w-full h-full object-cover" data-alt="A sun-drenched Mediterranean style estate with white-washed walls and terracotta accents. The atmosphere is vibrant yet peaceful, captured in a bright, airy photography style. The scene suggests a premium lifestyle and intelligent real estate investment, consistent with the Casa Select brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAvNaFRpNriK8YOJ1v5zjszSQoO7CcjhNgsMZ16JamquETEkqKoMHZa3lggzjG3kuX8d6OrjkjZ5A5hN_EkNE3QJ0GYUME6-qBnJSTjeNQ-4Lptm-yVTpPie2efnxFYkGnj-eYg0kAVN5B5eaIPaTYg-bAKuM3WEe_MvMC6zSWjRgm2UDV0rVaTdizX5EetiDlQ8ad6_M7L9Hs4bW1NIy1IHKqk-Lk2E2Crr3dB1jY2GV2dXLRrPY"/>
</div>
<div className="flex-grow p-4 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start">
<h3 className="text-body-lg font-bold text-on-surface">Casa Mayla</h3>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span>
<span className="text-caption font-semibold">4.9</span>
</div>
</div>
<p className="text-primary font-bold mt-1">R$ 12.450 <span className="text-caption font-normal text-on-surface-variant">Rec/Mês</span></p>
</div>
<div className="flex items-center gap-1.5">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full" style={{width: '74%'}}></div>
</div>
<span className="text-caption text-on-surface-variant whitespace-nowrap">74% Ocupação</span>
</div>
</div>
</div>
{/*  Card: Casa Select Coast  */}
<div className="flex bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-[0_4px_20px_rgba(159,116,36,0.05)] active:scale-[0.98] transition-transform duration-200">
<div className="w-32 h-32 flex-shrink-0">
<img alt="Casa Select Coast" className="w-full h-full object-cover" data-alt="A breathtaking beachfront luxury residence with floor-to-ceiling windows overlooking the turquoise ocean. The style is ultra-modern luxury, with clean lines and premium metallic gold finishes. High-key lighting creates a sense of vast space and exclusivity, perfectly representing the pinnacle of property management." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv6kjC8BqSaWydJ8FmQIwGJAHYU9DVgfG-h-X75w836igZ66oFDCXxxueRLo-82qyZwxIwbeuw9Rm8jHt7_hOCPil5VULHWfxHzhZDA8iZMFpz9-h-ltjP69H94huT793flqc-hByqqoujjHY-QqDv53ZWtlxeFirzvnCTA2bfP_pL5xszGQ2V4NpMcm_wI9rIpYv1RO1v-YbTTRPYjdX8xhHBNVs3B-llnTQ5hFW4k0eAZXJvOmc"/>
</div>
<div className="flex-grow p-4 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start">
<h3 className="text-body-lg font-bold text-on-surface">Casa Select Coast</h3>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: '"FILL" 1'}}>star</span>
<span className="text-caption font-semibold">4.9</span>
</div>
</div>
<p className="text-primary font-bold mt-1">R$ 21.340 <span className="text-caption font-normal text-on-surface-variant">Rec/Mês</span></p>
</div>
<div className="flex items-center gap-1.5">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full" style={{width: '82%'}}></div>
</div>
<span className="text-caption text-on-surface-variant whitespace-nowrap">82% Ocupação</span>
</div>
</div>
</div>
</section>
</main>
    </div>
  );
};

export default PropertyOverview;
