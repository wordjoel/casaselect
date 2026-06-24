import React from 'react';

const DocumentsSettings = () => {
  return (
    <div className="w-full h-full overflow-y-auto pb-24 text-on-background animate-in fade-in duration-700 bg-background">
      {/* Injecting Casa Select Premium Layout */}
      <main className="relative z-10 w-full max-w-md px-container-margin pt-20 flex flex-col items-center">
{/*  Logo Section  */}
<div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
<div className="w-32 h-32 mb-4 flex items-center justify-center">
{/*  Using a styled container to represent the gold shield logo  */}
<div className="relative w-24 h-28 flex items-center justify-center">
<svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 120">
<defs>
<linearGradient id="goldGrad" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" style={{stopColor: '#7b5900', stopOpacity: '1'}}></stop>
<stop offset="50%" style={{stopColor: '#c89b3c', stopOpacity: '1'}}></stop>
<stop offset="100%" style={{stopColor: '#7b5900', stopOpacity: '1'}}></stop>
</linearGradient>
</defs>
<path d="M50 0 L100 20 V60 C100 90 50 120 50 120 C50 120 0 90 0 60 V20 L50 0Z" fill="url(#goldGrad)" />
<text fill="white" font-family="Manrope" font-size="40" font-weight="800" text-anchor="middle" x="50" y="75">CS</text>
</svg>
</div>
</div>
<h1 className="font-headline-lg text-display text-primary tracking-tight">Casa Select</h1>
</div>
{/*  Login Form  */}
<div className="w-full glass-card rounded-2xl p-6 flex flex-col gap-stack-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
{/*  User Input  */}
<div className="relative group">
<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined text-[20px]">person</span>
</div>
<input className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-on-surface focus:outline-none input-gold-focus transition-all placeholder:text-outline-variant" placeholder="Ex: hugo" type="text"/>
</div>
{/*  Password Input  */}
<div className="relative group">
<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
<span className="material-symbols-outlined text-[20px]">lock</span>
</div>
<input className="w-full h-14 pl-12 pr-12 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-md text-on-surface focus:outline-none input-gold-focus transition-all placeholder:text-outline-variant" placeholder="••••••••" type="password"/>
<button className="absolute inset-y-0 right-4 flex items-center text-outline hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
{/*  Submit Button  */}
<button className="gold-gradient-btn h-14 w-full rounded-xl flex items-center justify-center font-label-caps text-on-primary tracking-widest mt-2 uppercase">
                ENTRAR
            </button>
{/*  Divider  */}
<div className="flex items-center gap-4 my-2">
<div className="h-[1px] flex-1 bg-outline-variant/30"></div>
<span className="text-[10px] font-label-caps text-outline uppercase">ou continue com</span>
<div className="h-[1px] flex-1 bg-outline-variant/30"></div>
</div>
{/*  Biometrics Option  */}
<div className="flex justify-center">
<button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high border border-outline-variant/20 hover:bg-secondary-container transition-colors group">
<span className="material-symbols-outlined text-[32px] text-primary group-hover:scale-110 transition-transform">fingerprint</span>
</button>
</div>
{/*  Forgot Password  */}
<div className="text-center mt-2">
<a className="font-body-md text-primary hover:underline underline-offset-4 decoration-primary/30" href="#">
                    Esqueci minha senha
                </a>
</div>
</div>
</main>
    </div>
  );
};

export default DocumentsSettings;
