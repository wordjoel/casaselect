import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Briefcase, 
  CloudRain, BellRing, CheckCircle, Clock 
} from 'lucide-react';

const cashFlowData = [
  { name: 'Seg', recebimento: 12000, pagamento: 8000 },
  { name: 'Ter', recebimento: 19000, pagamento: 15000 },
  { name: 'Qua', recebimento: 15000, pagamento: 5000 },
  { name: 'Qui', recebimento: 22000, pagamento: 18000 },
  { name: 'Sex', recebimento: 28000, pagamento: 12000 },
  { name: 'Sáb', recebimento: 35000, pagamento: 4000 },
  { name: 'Dom', recebimento: 42000, pagamento: 2000 },
];

const insights = [
  { id: 1, type: 'weather', text: 'Previsão de chuva forte na região da Casa Lilian. Manutenção da piscina remarcada.', icon: CloudRain, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-400/10' },
  { id: 2, type: 'success', text: 'Meta de ocupação superada em 15% pela equipe do Kleber.', icon: CheckCircle, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-400/10' },
  { id: 3, type: 'alert', text: 'Lembrete: Aprovação de pagamentos de fornecedores (Pamela) pendente até 14h.', icon: BellRing, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-400/10' },
];

const payables = [
  { id: 1, desc: 'AcquaClean Pools', dept: 'Manutenção', amount: 850.00, status: 'Pendente', due: 'Hoje' },
  { id: 2, desc: 'Enel Energia', dept: 'Infraestrutura', amount: 2340.50, status: 'Pago', due: 'Ontem' },
  { id: 3, desc: 'Agência de Marketing', dept: 'Marketing (Beco)', amount: 5000.00, status: 'Pendente', due: 'Em 2 dias' },
];

const receivables = [
  { id: 1, desc: 'Reserva Airbnb - Casa Lilian', dept: 'Locação (Débora)', amount: 14500.00, status: 'Recebido', date: 'Hoje' },
  { id: 2, desc: 'Reserva Booking - Casa Mayla', dept: 'Locação (Débora)', amount: 8900.00, status: 'A Receber', date: 'Amanhã' },
];

export const CEOCockpit: React.FC = () => {
  return (
    <div className="w-full font-sans space-y-8 animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-end"
      >
        <div className="premium-card px-4 py-2 rounded-full flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Todos os departamentos sincronizados</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Receita Bruta (Mês)', value: 'R$ 342.500', trend: '+12.5%', icon: DollarSign, color: 'from-emerald-500/10 to-emerald-900/5 dark:from-emerald-500/20 dark:to-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
          { title: 'Contas a Pagar (Semana)', value: 'R$ 45.200', trend: '-3.2%', icon: TrendingDown, color: 'from-rose-500/10 to-rose-900/5 dark:from-rose-500/20 dark:to-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
          { title: 'Ocupação Global', value: '89.5%', trend: '+5.4%', icon: Users, color: 'from-sky-500/10 to-sky-900/5 dark:from-sky-500/20 dark:to-sky-900/20', text: 'text-sky-600 dark:text-sky-400' },
          { title: 'Lucro Líquido Projetado', value: 'R$ 185.000', trend: '+8.1%', icon: Briefcase, color: 'from-amber-500/10 to-amber-900/5 dark:from-amber-500/20 dark:to-amber-900/20', text: 'text-amber-600 dark:text-amber-400' }
        ].map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${kpi.color} border border-slate-200 dark:border-slate-800/50 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden shadow-sm`}
          >
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{kpi.title}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-2">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-white/50 dark:bg-slate-950/50 shadow-sm ${kpi.text}`}>
                <kpi.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <span className={`text-sm font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {kpi.trend}
              </span>
              <span className="text-slate-500 text-sm font-medium">vs. semana anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 premium-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fluxo de Caixa Sinérgico (7 Dias)</h2>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600 dark:text-slate-300">Recebimentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-slate-600 dark:text-slate-300">Pagamentos</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="recebimento" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                <Area type="monotone" dataKey="pagamento" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorPag)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card p-6 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500/20 p-2 rounded-xl">
              <TrendingUp className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Insights Inteligentes</h2>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {insights.map(insight => (
              <div key={insight.id} className={`${insight.bg} border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 flex gap-4 transition-all hover:scale-[1.02]`}>
                <div className={`${insight.color} mt-1`}>
                  <insight.icon size={20} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top 3 Contas a Pagar</h2>
            <button className="text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Ver todas</button>
          </div>
          <div className="space-y-3">
            {payables.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <TrendingDown size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.desc}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.dept} • Vence: {item.due}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900 dark:text-white">R$ {item.amount.toFixed(2)}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${item.status === 'Pago' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Próximos Recebimentos</h2>
            <button className="text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {receivables.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.desc}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.dept} • Previsto: {item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900 dark:text-white">R$ {item.amount.toFixed(2)}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${item.status === 'Recebido' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
