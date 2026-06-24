import React, { useState } from 'react';
import { Camera, Zap, Settings, ShieldAlert } from 'lucide-react';

export function OCRScanner() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="w-full h-full p-4 overflow-y-auto pb-24" style={{ backgroundColor: '#0A192F', color: '#FDFBF7' }}>
      
      <h2 className="text-xl font-bold mb-6 mt-2 text-center">OCR Financeiro Inteligente</h2>

      {/* Dropzone */}
      <div 
        className="relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center mb-6 h-64"
        style={{ borderColor: 'rgba(253, 251, 247, 0.2)', backgroundColor: 'rgba(253, 251, 247, 0.05)' }}
      >
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
          <Camera size={28} />
        </div>
        <span className="text-xs text-center text-gray-300 tracking-wide mt-auto font-light">Arrastar ou Selecione Comprovante</span>
      </div>

      {/* Quick Shortcuts */}
      <div className="flex gap-3 mb-8">
        
        {/* Shortcut 1 */}
        <div className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center border"
             style={{ borderColor: 'rgba(223, 178, 108, 0.3)', backgroundColor: 'rgba(253, 251, 247, 0.05)' }}>
          <Zap className="mb-2" size={20} style={{ color: '#DFB26C' }} />
          <span className="text-[10px] text-center font-semibold leading-tight">Conta<br/>de Luz</span>
        </div>

        {/* Shortcut 2 */}
        <div className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center border"
             style={{ borderColor: 'rgba(64, 224, 208, 0.3)', backgroundColor: 'rgba(64, 224, 208, 0.1)' }}>
          <Settings className="mb-2" size={20} style={{ color: '#40E0D0' }} />
          <span className="text-[10px] text-center font-semibold leading-tight">Instalação<br/>de Ar</span>
        </div>

        {/* Shortcut 3 */}
        <div className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center border"
             style={{ borderColor: 'rgba(253, 251, 247, 0.1)', backgroundColor: 'rgba(253, 251, 247, 0.05)' }}>
          <ShieldAlert className="mb-2" size={20} style={{ color: '#A0AEC0' }} />
          <span className="text-[10px] text-center font-semibold leading-tight">Piscineiro</span>
        </div>

      </div>

      {/* Administrator Section */}
      <div className="rounded-3xl p-4 mt-auto" style={{ backgroundColor: 'rgba(253, 251, 247, 0.05)' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">Administrador</h3>
          <span className="text-gray-400 font-bold">...</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-300 font-semibold mb-1">Nova conferência</span>
            <span className="text-[10px] text-gray-500">Mês base Chat Extrato (modelo ai)</span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-[#1A1A1A]"
               style={{ background: 'linear-gradient(135deg, #F0D898, #DFB26C)' }}>
            2
          </div>
        </div>
      </div>

    </div>
  );
}
