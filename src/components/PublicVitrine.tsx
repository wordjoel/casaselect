import React from 'react';
import { Property } from '../types';
import { Menu } from 'lucide-react';
import { KobayashiLogo } from './Sidebar';

export function PublicVitrine({ properties }: { properties: Property[] }) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FDFBF7' }}>
      {/* Black Header */}
      <div 
        className="h-20 w-full flex items-center justify-between px-6 sticky top-0 z-10"
        style={{ backgroundColor: '#111111' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDFBF7]">
            <KobayashiLogo darkMode={false} className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#FDFBF7] text-lg leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Casa Select
            </h1>
            <span className="text-[#c9a050] text-[9px] tracking-[0.2em] font-bold uppercase">
              Temporada Premium
            </span>
          </div>
        </div>
        <button className="text-[#FDFBF7]">
          <Menu size={24} />
        </button>
      </div>

      {/* Property Feed */}
      <div className="p-4 space-y-4 pb-24 max-w-3xl mx-auto">
        {properties.filter(p => p.image).map((prop, idx) => (
          <div key={idx} className="w-full relative rounded-3xl overflow-hidden shadow-sm" style={{ aspectRatio: '4/3' }}>
            <img 
              src={prop.image} 
              alt={prop.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.004 22.191H12c-1.724 0-3.414-.463-4.896-1.337l-.35-.207-3.636.953.97-3.542-.228-.363A9.972 9.972 0 012 12.008c0-5.514 4.486-10 10.004-10 5.512 0 10 4.486 10 10 0 5.513-4.488 10-10 10zm-4.966-3.238l.245.145c1.425.845 3.056 1.291 4.725 1.291 4.962 0 9-4.038 9-9s-4.038-9-9-9c-4.963 0-9 4.038-9 9 0 1.748.475 3.447 1.378 4.935l.156.256-.575 2.102 2.155-.567z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
