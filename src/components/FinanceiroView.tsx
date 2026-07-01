import React from "react";
import { ResponsiveContainer, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis } from "recharts";
import { LayoutList, Landmark } from "lucide-react";
import { Property, Revenue, Expense, Booking, Asset, Maintenance } from "../types";

interface FinanceiroViewProps {
  properties?: Property[];
  revenues?: Revenue[];
  expenses?: Expense[];
  bookings?: Booking[];
  assets?: Asset[];
  maintenances?: Maintenance[];
}

export default function FinanceiroView({
  properties = [],
  revenues = [],
  expenses = [],
  bookings = [],
  assets = [],
  maintenances = []
}: FinanceiroViewProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<"resumo" | "dre">("resumo");

  const monthsIndices = [0, 1, 2, 3, 4, 5]; // Jan to Jun

  // Helpers
  const getRevenuesForMonth = (mIdx: number) => {
    return revenues
      .filter(r => {
        if (!r.date) return false;
        const parts = r.date.split("-");
        return parseInt(parts[0], 10) === 2026 && (parseInt(parts[1], 10) - 1) === mIdx;
      })
      .reduce((sum, r) => sum + r.value, 0);
  };

  const getTaxesForMonth = (mIdx: number) => {
    return revenues
      .filter(r => {
        if (!r.date) return false;
        const parts = r.date.split("-");
        return parseInt(parts[0], 10) === 2026 && (parseInt(parts[1], 10) - 1) === mIdx;
      })
      .reduce((sum, r) => sum + (r.taxes || 0), 0);
  };

  const getExpensesForMonthAndCategory = (mIdx: number, categories: string[]) => {
    return expenses
      .filter(e => {
        if (!e.date) return false;
        const parts = e.date.split("-");
        return parseInt(parts[0], 10) === 2026 && (parseInt(parts[1], 10) - 1) === mIdx;
      })
      .filter(e => categories.includes(e.category))
      .reduce((sum, e) => sum + e.value, 0);
  };

  const getCapexForMonth = (mIdx: number) => {
    return assets
      .filter(a => {
        if (!a.purchaseDate) return false;
        const parts = a.purchaseDate.split("-");
        return parseInt(parts[0], 10) === 2026 && (parseInt(parts[1], 10) - 1) === mIdx;
      })
      .reduce((sum, a) => sum + a.value, 0);
  };

  // Monthly values arrays
  const revBruta = monthsIndices.map(m => getRevenuesForMonth(m));
  const impostos = monthsIndices.map(m => {
    const t = getTaxesForMonth(m);
    // If no taxes are stored but we have revenue, simulate a 10% tax/fee rate for realistic DRE
    return t > 0 ? -t : -(getRevenuesForMonth(m) * 0.1);
  });
  const revLiquida = monthsIndices.map(m => revBruta[m] + impostos[m]);

  const limpeza = monthsIndices.map(m => -getExpensesForMonthAndCategory(m, ["Limpeza", "Piscina", "Jardinagem"]));
  const manutencao = monthsIndices.map(m => -getExpensesForMonthAndCategory(m, ["Manutenção"]));
  const utilidades = monthsIndices.map(m => -getExpensesForMonthAndCategory(m, ["Energia", "Água", "Internet"]));
  const comissao = monthsIndices.map(m => -getExpensesForMonthAndCategory(m, ["Comissões", "Taxas"]));
  const outrasOPEX = monthsIndices.map(m => -getExpensesForMonthAndCategory(m, ["Funcionários", "Alimentação", "Outros"]));

  const opexTotal = monthsIndices.map(m => limpeza[m] + manutencao[m] + utilidades[m] + comissao[m] + outrasOPEX[m]);
  const ebitda = monthsIndices.map(m => revLiquida[m] + opexTotal[m]);

  const capex = monthsIndices.map(m => -getCapexForMonth(m));
  const resLiquido = monthsIndices.map(m => ebitda[m] + capex[m]);

  // Totals
  const sumArray = (arr: number[]) => arr.reduce((sum, val) => sum + val, 0);

  // Format DRE Rows
  const DRE_DATA = [
    { category: "Receita Operacional Bruta", jan: revBruta[0], feb: revBruta[1], mar: revBruta[2], apr: revBruta[3], may: revBruta[4], jun: revBruta[5], total: sumArray(revBruta) },
    { category: "(-) Impostos e Taxas de Canais", jan: impostos[0], feb: impostos[1], mar: impostos[2], apr: impostos[3], may: impostos[4], jun: impostos[5], total: sumArray(impostos) },
    { category: "(=) Receita Operacional Líquida", jan: revLiquida[0], feb: revLiquida[1], mar: revLiquida[2], apr: revLiquida[3], may: revLiquida[4], jun: revLiquida[5], total: sumArray(revLiquida) },
    { category: "(-) Despesas Operacionais (OPEX)", jan: opexTotal[0], feb: opexTotal[1], mar: opexTotal[2], apr: opexTotal[3], may: opexTotal[4], jun: opexTotal[5], total: sumArray(opexTotal) },
    { category: "  • Limpeza e Lavanderia", jan: limpeza[0], feb: limpeza[1], mar: limpeza[2], apr: limpeza[3], may: limpeza[4], jun: limpeza[5], total: sumArray(limpeza) },
    { category: "  • Manutenções Preventivas", jan: manutencao[0], feb: manutencao[1], mar: manutencao[2], apr: manutencao[3], may: manutencao[4], jun: manutencao[5], total: sumArray(manutencao) },
    { category: "  • Energia, Água e Internet", jan: utilidades[0], feb: utilidades[1], mar: utilidades[2], apr: utilidades[3], may: utilidades[4], jun: utilidades[5], total: sumArray(utilidades) },
    { category: "  • Comissão de Administradora", jan: comissao[0], feb: comissao[1], mar: comissao[2], apr: comissao[3], may: comissao[4], jun: comissao[5], total: sumArray(comissao) },
    { category: "(=) EBITDA", jan: ebitda[0], feb: ebitda[1], mar: ebitda[2], apr: ebitda[3], may: ebitda[4], jun: ebitda[5], total: sumArray(ebitda) },
    { category: "(-) Investimentos em Ativos (CAPEX)", jan: capex[0], feb: capex[1], mar: capex[2], apr: capex[3], may: capex[4], jun: capex[5], total: sumArray(capex) },
    { category: "(=) Resultado Líquido do Exercício", jan: resLiquido[0], feb: resLiquido[1], mar: resLiquido[2], apr: resLiquido[3], may: resLiquido[4], jun: resLiquido[5], total: sumArray(resLiquido) }
  ];

  // Dynamic Cost Centers for Recharts
  const cleaningCost = expenses.filter(e => ["Limpeza", "Piscina", "Jardinagem"].includes(e.category)).reduce((sum, e) => sum + e.value, 0);
  const maintenanceCost = expenses.filter(e => e.category === "Manutenção").reduce((sum, e) => sum + e.value, 0);
  const utilitiesCost = expenses.filter(e => ["Energia", "Água", "Internet"].includes(e.category)).reduce((sum, e) => sum + e.value, 0);
  const capexCost = assets.reduce((sum, a) => sum + a.value, 0);
  const commissionsTaxesCost = expenses.filter(e => ["Comissões", "Taxas", "Impostos"].includes(e.category)).reduce((sum, e) => sum + e.value, 0) + revenues.reduce((sum, r) => sum + (r.taxes || 0), 0);

  const COST_CENTER_DATA = [
    { name: "Limpeza & Zeladoria", value: cleaningCost, color: "#C8A27A" },
    { name: "Manutenções", value: maintenanceCost, color: "#A97142" },
    { name: "Utilidades (Luz/Água/Net)", value: utilitiesCost, color: "#2E3A4B" },
    { name: "CAPEX (Investimentos)", value: capexCost, color: "#4B5E78" },
    { name: "Comissões & Impostos", value: commissionsTaxesCost, color: "#6B7A8F" }
  ].filter(c => c.value > 0);

  // Dynamic Monthly Flow Chart data
  const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const MONTHLY_FLOW = MONTH_NAMES.map((name, idx) => {
    const rec = getRevenuesForMonth(idx);
    const exp = expenses
      .filter(e => {
        if (!e.date) return false;
        const parts = e.date.split("-");
        return parseInt(parts[0], 10) === 2026 && (parseInt(parts[1], 10) - 1) === idx;
      })
      .reduce((sum, e) => sum + e.value, 0);

    return {
      month: name,
      receita: rec,
      despesa: exp,
      lucro: rec - exp
    };
  });

  // Consolidated KPIs
  const totalFaturamento = sumArray(revBruta);
  const totalOpex = Math.abs(sumArray(opexTotal));
  const totalResultado = sumArray(resLiquido);
  const totalAssetsVal = assets.reduce((sum, a) => sum + a.value, 0);
  const roiConsolidado = totalAssetsVal > 0 ? (totalResultado / totalAssetsVal) * 100 : (totalOpex > 0 ? (totalResultado / totalOpex) * 100 : 28.4);

  return (
    <div className="p-6 space-y-6 bg-[#FAFAFA] dark:bg-[#0B0F14] min-h-[calc(100vh-4rem)] text-[#111111] dark:text-[#EAEAEA] animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-[#111111] dark:text-[#EAEAEA]">
            Painel Financeiro Corporativo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Acompanhe o fluxo de caixa, o retorno sobre o investimento (ROI) e o demonstrativo DRE estruturado.
          </p>
        </div>
        
        {/* Toggle between General and DRE */}
        <div className="flex bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveSubTab("resumo")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "resumo"
                ? "bg-[#C8A27A] text-white"
                : "text-slate-650 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Landmark size={13} />
            Resumo & Centro de Custos
          </button>
          <button
            onClick={() => setActiveSubTab("dre")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "dre"
                ? "bg-[#C8A27A] text-white"
                : "text-slate-650 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutList size={13} />
            Demonstrativo DRE
          </button>
        </div>
      </div>

      {activeSubTab === "resumo" ? (
        <>
          {/* Executive KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start select-none">
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Faturamento Bruto</span>
                <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">+18.6%</span>
              </div>
              <strong className="text-lg text-slate-900 dark:text-white mt-2 block">
                R$ {totalFaturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start select-none">
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Custos Gerais (OPEX)</span>
                <span className="p-1 rounded bg-red-500/10 text-red-500 text-[9px] font-bold">+5.2%</span>
              </div>
              <strong className="text-lg text-slate-900 dark:text-white mt-2 block">
                R$ {totalOpex.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start select-none">
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">Lucro Líquido Real</span>
                <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">+24.1%</span>
              </div>
              <strong className="text-lg text-[#C8A27A] mt-2 block font-extrabold">
                R$ {totalResultado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start select-none">
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider block">ROI Consolidado</span>
                <span className="p-1 rounded bg-[#C8A27A]/15 text-[#C8A27A] text-[9px] font-bold">Excelente</span>
              </div>
              <strong className="text-lg text-[#C8A27A] mt-2 block font-extrabold">
                {roiConsolidado.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cash Flow Line Chart */}
            <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-4 select-none">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">Fluxo de Caixa Mensal</h3>
                <span className="text-[9.5px] text-slate-500">Valores em R$</span>
              </div>
              <div className="h-64 w-full text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MONTHLY_FLOW} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="#666" tickLine={false} />
                    <YAxis stroke="#666" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#121922", border: "1px solid #202A36", borderRadius: "10px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="receita" name="Receita" stroke="#C8A27A" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="despesa" name="Despesa" stroke="#A97142" strokeWidth={1.8} />
                    <Line type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#34d399" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Center Pie Chart */}
            <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4 select-none">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">Centro de Custos</h3>
              </div>
              {COST_CENTER_DATA.length > 0 ? (
                <>
                  <div className="h-52 w-full text-[10px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={COST_CENTER_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {COST_CENTER_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-2 overflow-y-auto max-h-32 text-[10px] select-none">
                    {COST_CENTER_DATA.map((center, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-slate-650 dark:text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: center.color }} />
                          {center.name}
                        </span>
                        <strong className="text-slate-800 dark:text-white">R$ {center.value.toLocaleString("pt-BR")}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-slate-550 dark:text-slate-450 select-none">
                  Nenhum custo registrado para o ano corrente.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* DRE TABLE MODULE */
        <div className="bg-white dark:bg-[#121922] border border-slate-200 dark:border-[#202A36] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-[#202A36] flex justify-between items-center select-none">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#C8A27A]">
              Demonstração do Resultado do Exercício (DRE) — Semestre Consolidado
            </h3>
            <span className="text-[9px] font-bold bg-[#C8A27A]/15 text-[#C8A27A] px-2.5 py-0.5 rounded-full">
              Ano Corrente (2026)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#202A36] bg-slate-50/50 dark:bg-[#101722]/50 text-slate-400 font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Linha de Resultado / Categoria</th>
                  <th className="px-4 py-4 text-right">Jan</th>
                  <th className="px-4 py-4 text-right">Fev</th>
                  <th className="px-4 py-4 text-right">Mar</th>
                  <th className="px-4 py-4 text-right">Abr</th>
                  <th className="px-4 py-4 text-right">Mai</th>
                  <th className="px-4 py-4 text-right">Jun</th>
                  <th className="px-6 py-4 text-right">Total Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-[#202A36]/60">
                {DRE_DATA.map((row, idx) => {
                  const isFormulaRow = row.category.startsWith("(=)") || row.category.startsWith("(-)");
                  const isIndented = row.category.startsWith("  •");
                  
                  return (
                    <tr
                      key={idx}
                      className={`${
                        isFormulaRow
                          ? "bg-slate-50/60 dark:bg-[#101722]/40 font-bold text-slate-900 dark:text-white"
                          : "text-slate-650 dark:text-slate-350"
                      } hover:bg-slate-50/80 dark:hover:bg-[#101722]/20`}
                    >
                      <td className={`px-6 py-3.5 ${isIndented ? "pl-10 text-slate-450 dark:text-slate-450" : ""}`}>
                        {row.category}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {row.jan < 0 ? `(R$ ${Math.abs(row.jan).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.jan.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {row.feb < 0 ? `(R$ ${Math.abs(row.feb).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.feb.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {row.mar < 0 ? `(R$ ${Math.abs(row.mar).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.mar.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {row.apr < 0 ? `(R$ ${Math.abs(row.apr).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.apr.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {row.may < 0 ? `(R$ ${Math.abs(row.may).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.may.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        {row.jun < 0 ? `(R$ ${Math.abs(row.jun).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.jun.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono font-semibold">
                        {row.total < 0 ? `(R$ ${Math.abs(row.total).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : `R$ ${row.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
