import React from 'react';

const CalendarAgenda = () => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 text-on-background animate-in fade-in duration-700 bg-background">
      {/* Injecting Casa Select Premium Layout */}
      <main className="flex-grow pt-20 pb-32 px-container-margin">
{/*  Calendar Container  */}
<section className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_20px_rgba(159,116,36,0.04)] border border-outline-variant/20 mb-stack-lg">
{/*  Calendar Header  */}
<div className="flex justify-between items-center mb-6">
<button className="p-2 text-primary active:scale-90 transition-transform">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<h2 className="text-body-lg font-bold text-on-surface">Maio 2026</h2>
<button className="p-2 text-primary active:scale-90 transition-transform">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
{/*  Weekdays  */}
<div className="calendar-grid text-label-caps font-label-caps text-on-surface-variant/60 mb-4">
<div>Dom</div>
<div>Seg</div>
<div>Ter</div>
<div>Qua</div>
<div>Qui</div>
<div>Sex</div>
<div>Sáb</div>
</div>
{/*  Calendar Days  */}
<div className="calendar-grid gap-y-2">
{/*  Row 1  */}
<div className="py-2 text-body-md text-on-surface-variant/40">26</div>
<div className="py-2 text-body-md text-on-surface-variant/40">27</div>
<div className="py-2 text-body-md text-on-surface-variant/40">28</div>
<div className="py-2 text-body-md text-on-surface-variant/40">29</div>
<div className="py-2 text-body-md text-on-surface-variant/40">30</div>
<div className="py-2 text-body-md">1</div>
<div className="py-2 text-body-md">2</div>
{/*  Row 2  */}
<div className="py-2 text-body-md">3</div>
<div className="py-2 text-body-md relative">
                    4
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-error"></span>
</div>
</div>
<div className="py-2 text-body-md">5</div>
<div className="py-2 text-body-md relative">
                    6
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-tertiary"></span>
</div>
</div>
<div className="py-2 text-body-md">7</div>
<div className="py-2 text-body-md">8</div>
<div className="py-2 text-body-md">9</div>
{/*  Row 3  */}
<div className="py-2 text-body-md relative">
                    10
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-error"></span>
</div>
</div>
<div className="py-2 text-body-md relative">
                    11
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-primary"></span>
</div>
</div>
<div className="py-2 text-body-md relative">
                    12
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-[#3498db]"></span>
</div>
</div>
<div className="py-2 text-body-md relative">
                    13
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-error"></span>
</div>
</div>
<div className="py-2 text-body-md relative">
                    14
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-[#2ecc71]"></span>
</div>
</div>
<div className="py-2 text-body-md relative">
                    15
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-tertiary"></span>
</div>
</div>
<div className="py-2 text-body-md relative flex items-center justify-center">
<span className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold">16</span>
<div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-tertiary-fixed-dim"></span>
</div>
</div>
{/*  Row 4  */}
<div className="py-2 text-body-md">17</div>
<div className="py-2 text-body-md">18</div>
<div className="py-2 text-body-md">19</div>
<div className="py-2 text-body-md relative">
                    20
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-primary"></span>
</div>
</div>
<div className="py-2 text-body-md">21</div>
<div className="py-2 text-body-md">22</div>
<div className="py-2 text-body-md">23</div>
{/*  Row 5  */}
<div className="py-2 text-body-md">24</div>
<div className="py-2 text-body-md">25</div>
<div className="py-2 text-body-md relative">
                    26
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
<span className="w-1 h-1 rounded-full bg-[#3498db]"></span>
</div>
</div>
<div className="py-2 text-body-md">27</div>
<div className="py-2 text-body-md">28</div>
<div className="py-2 text-body-md">29</div>
<div className="py-2 text-body-md">30</div>
{/*  Row 6  */}
<div className="py-2 text-body-md">31</div>
<div className="py-2 text-body-md text-on-surface-variant/40">1</div>
<div className="py-2 text-body-md text-on-surface-variant/40">2</div>
<div className="py-2 text-body-md text-on-surface-variant/40">3</div>
<div className="py-2 text-body-md text-on-surface-variant/40">4</div>
<div className="py-2 text-body-md text-on-surface-variant/40">5</div>
<div className="py-2 text-body-md text-on-surface-variant/40">6</div>
</div>
</section>
{/*  Agenda Section  */}
<section className="space-y-stack-md">
<h3 className="text-headline-md font-bold text-on-surface">Agenda - 16 de maio</h3>
<div className="space-y-3">
{/*  Event 1  */}
<div className="flex items-center justify-between bg-surface-container rounded-2xl p-4 border border-outline-variant/10 active:bg-surface-container-high transition-colors">
<div className="flex items-center gap-4">
<div className="w-3 h-3 rounded-full bg-error ring-4 ring-error/10"></div>
<div>
<p className="text-body-lg font-bold text-on-surface">Check-out - Casa Amado</p>
</div>
</div>
<span className="text-body-md font-semibold text-on-surface-variant/80">08:00</span>
</div>
{/*  Event 2  */}
<div className="flex items-center justify-between bg-surface-container rounded-2xl p-4 border border-outline-variant/10 active:bg-surface-container-high transition-colors">
<div className="flex items-center gap-4">
<div className="w-3 h-3 rounded-full bg-tertiary ring-4 ring-tertiary/10"></div>
<div>
<p className="text-body-lg font-bold text-on-surface">Limpeza - Casa Amado</p>
</div>
</div>
<span className="text-body-md font-semibold text-on-surface-variant/80">10:00</span>
</div>
{/*  Event 3  */}
<div className="flex items-center justify-between bg-surface-container rounded-2xl p-4 border border-outline-variant/10 active:bg-surface-container-high transition-colors">
<div className="flex items-center gap-4">
<div className="w-3 h-3 rounded-full bg-[#3498db] ring-4 ring-[#3498db]/10"></div>
<div>
<p className="text-body-lg font-bold text-on-surface">Manutenção Ar - Casa Amado</p>
</div>
</div>
<span className="text-body-md font-semibold text-on-surface-variant/80">13:00</span>
</div>
{/*  Event 4  */}
<div className="flex items-center justify-between bg-surface-container rounded-2xl p-4 border border-outline-variant/10 active:bg-surface-container-high transition-colors">
<div className="flex items-center gap-4">
<div className="w-3 h-3 rounded-full bg-[#2ecc71] ring-4 ring-[#2ecc71]/10"></div>
<div>
<p className="text-body-lg font-bold text-on-surface">Check-in - Casa Amado</p>
</div>
</div>
<span className="text-body-md font-semibold text-on-surface-variant/80">15:00</span>
</div>
</div>
</section>
</main>
    </div>
  );
};

export default CalendarAgenda;
