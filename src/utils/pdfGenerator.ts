import { jsPDF } from "jspdf";
import { Property, FinanceItem, AgendaEvent } from "../components/pwa/types";

export function generatePDF(
  properties: Property[],
  finances: FinanceItem[],
  agenda: AgendaEvent[]
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // A4 size: 210 x 297 mm
  const marginX = 20;
  let y = 20;
  let pageCount = 1;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const drawFooter = (pageNum: number) => {
    doc.setPage(pageNum);
    // Draw footer at bottom (y = 280 mm)
    doc.setDrawColor(210, 200, 190);
    doc.setLineWidth(0.25);
    doc.line(marginX, 280, 210 - marginX, 280);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(140, 130, 120);
    doc.text("Casa Select Premium Systems • Relatório Gerencial", marginX, 284);
    
    doc.setFont("helvetica", "normal");
    const nowStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    doc.text(`Gerado em: ${nowStr} • Página ${pageNum}`, 210 - marginX - 55, 284);
  };

  const checkPageLimit = (neededHeight: number) => {
    if (y + neededHeight > 270) {
      drawFooter(pageCount);
      doc.addPage();
      pageCount++;
      y = 25;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setDrawColor(197, 155, 39); // Deep gold
    doc.setLineWidth(0.4);
    doc.line(marginX, y, 210 - marginX, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(197, 155, 39);
    doc.text("CASA SELECT", marginX, y);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 90, 80);
    doc.text("RELATÓRIO INTEGRADO FINANCEIRO E OPERACIONAL", marginX + 30, y);
    y += 6;
  };

  // --- PAGE 1: TITLE BANNER & BRANDING ---
  // Beautiful gold crest background rectangle on top
  doc.setFillColor(28, 25, 22); // Charcoal dark background
  doc.rect(marginX, y, 210 - (marginX * 2), 35, "F");

  // Gold borders on the dark box
  doc.setDrawColor(197, 155, 39);
  doc.setLineWidth(0.8);
  doc.rect(marginX, y, 210 - (marginX * 2), 35, "D");

  // Text inside title box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(197, 155, 39); // Gold
  doc.text("CASA SELECT", marginX + 10, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(240, 230, 220);
  doc.text("SISTEMA PARTICULAR DE GESTÃO DE IMÓVEIS LUXO E ANALÍTICA", marginX + 10, y + 21);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(197, 155, 39);
  doc.text("Relatório Executivo Mensal", marginX + 10, y + 28);

  y += 42;

  // --- STATS OVERVIEW CARDS (Grid of metrics) ---
  const totalRevenues = finances
    .filter(f => f.type === "receita")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = finances
    .filter(f => f.type === "despesa")
    .reduce((sum, item) => sum + item.amount, 0);

  const netBalance = totalRevenues - totalExpenses;
  const avgOccupancy = properties.length > 0 
    ? Math.round(properties.reduce((sum, p) => sum + p.ocupacao, 0) / properties.length) 
    : 0;

  // Let's draw metrics panel boxes
  doc.setFillColor(249, 247, 242); // Elegant Light Ivory
  doc.setDrawColor(230, 225, 215);
  doc.setLineWidth(0.2);
  doc.rect(marginX, y, 210 - (marginX * 2), 34, "FD");

  // Vertical line dividers
  const columnWidth = (210 - (marginX * 2)) / 4;
  doc.line(marginX + columnWidth, y + 4, marginX + columnWidth, y + 30);
  doc.line(marginX + (columnWidth * 2), y + 4, marginX + (columnWidth * 2), y + 30);
  doc.line(marginX + (columnWidth * 3), y + 4, marginX + (columnWidth * 3), y + 30);

  // Column 1: Total Receitas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text("RECEITAS TOTAIS", marginX + 5, y + 10);
  doc.setFontSize(11);
  doc.setTextColor(34, 139, 34); // Forest green
  doc.text(formatBRL(totalRevenues), marginX + 5, y + 18);

  // Column 2: Total Despesas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text("DESPESAS TOTAIS", marginX + columnWidth + 5, y + 10);
  doc.setFontSize(11);
  doc.setTextColor(220, 20, 60); // Crimson red
  doc.text(formatBRL(totalExpenses), marginX + columnWidth + 5, y + 18);

  // Column 3: Saldo Líquido
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text("SALDO CAIXA", marginX + (columnWidth * 2) + 5, y + 10);
  doc.setFontSize(11);
  doc.setTextColor(netBalance >= 0 ? 197 : 220, netBalance >= 0 ? 155 : 20, netBalance >= 0 ? 39 : 60);
  doc.text(formatBRL(netBalance), marginX + (columnWidth * 2) + 5, y + 18);

  // Column 4: Ocupação e Portfólio
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text("OCUPAÇÃO MÉDIA", marginX + (columnWidth * 3) + 5, y + 10);
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(`${avgOccupancy}%`, marginX + (columnWidth * 3) + 5, y + 18);
  doc.setFontSize(7);
  doc.setTextColor(130, 120, 115);
  doc.text(`${properties.length} Propriedades Ativas`, marginX + (columnWidth * 3) + 5, y + 25);

  y += 42;

  // --- SECTION: PROPERTIES LISTING ---
  checkPageLimit(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 35, 30);
  doc.text("PORTFÓLIO E DESEMPENHO POR PROPRIEDADE", marginX, y);
  y += 5;

  doc.setLineWidth(0.4);
  doc.setDrawColor(197, 155, 39);
  doc.line(marginX, y, 210 - marginX, y);
  y += 5;

  // Table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text("Nome da Casa", marginX + 2, y);
  doc.text("Tarifa Diária", marginX + columnWidth * 1.5, y);
  doc.text("Ocupação", marginX + columnWidth * 2.3, y);
  doc.text("Faturamento Relatado", marginX + columnWidth * 3.1, y);
  y += 3.5;

  doc.setLineWidth(0.2);
  doc.setDrawColor(210, 200, 190);
  doc.line(marginX, y, 210 - marginX, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 45, 40);

  properties.forEach(prop => {
    checkPageLimit(9);
    doc.setFont("helvetica", "bold");
    doc.text(prop.name, marginX + 2, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatBRL(prop.dailyRate), marginX + columnWidth * 1.5, y);
    doc.text(`${prop.ocupacao}%`, marginX + columnWidth * 2.3, y);
    doc.setFont("helvetica", "bold");
    doc.text(formatBRL(prop.receitado), marginX + columnWidth * 3.1, y);
    
    // address below
    y += 4;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(120, 115, 110);
    doc.text(prop.address, marginX + 2, y);
    y += 5;
    
    // reset fonts for next
    doc.setFontSize(8);
    doc.setTextColor(50, 45, 40);
  });

  y += 4;

  // --- SECTION: AGENDA EVENTS ---
  checkPageLimit(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 35, 30);
  doc.text("CRONOGRAMA E PRÓXIMOS EVENTOS", marginX, y);
  y += 5;

  doc.setLineWidth(0.4);
  doc.setDrawColor(197, 155, 39);
  doc.line(marginX, y, 210 - marginX, y);
  y += 5;

  // Sort events by date
  const sortedEvents = [...agenda].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  if (sortedEvents.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(140, 130, 120);
    doc.text("Nenhum evento agendado ou cadastrado.", marginX + 5, y);
    y += 10;
  } else {
    // Drawn items
    sortedEvents.forEach(ev => {
      checkPageLimit(14);
      
      // Date badge/box block left
      doc.setFillColor(242, 238, 230);
      doc.rect(marginX, y, 24, 10, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 100, 80);
      doc.text(ev.date.split("-").reverse().slice(0, 2).join("/"), marginX + 5, y + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(ev.time, marginX + 7, y + 8);

      // Event details next to it
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 35, 30);
      
      // Translate operation labels beautifully
      let opLabel = ev.type.toUpperCase();
      if (ev.type === "checkin") opLabel = "CHECK-IN OPERACIONAL";
      if (ev.type === "checkout") opLabel = "CHECK-OUT REGULAR";
      if (ev.type === "limpeza") opLabel = "SERVIÇO DE LIMPEZA";
      if (ev.type === "manutencao") opLabel = "MANUTENÇÃO CORRETIVA";

      doc.text(opLabel, marginX + 28, y + 3.5);

      // Category badge outline
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 95, 90);
      doc.text(`Propriedade: ${ev.propertyName}`, marginX + 28, y + 7.5);

      doc.setFontSize(7.5);
      doc.setTextColor(50, 45, 40);
      doc.text(`— ${ev.description}`, marginX + 105, y + 5.5);

      doc.setLineWidth(0.12);
      doc.setDrawColor(230, 225, 215);
      doc.line(marginX, y + 11, 210 - marginX, y + 11);
      
      y += 14;
    });
  }

  y += 3;

  // --- SECTION: FINANCIAL TRANSACTIONS LEDGER ---
  checkPageLimit(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 35, 30);
  doc.text("RAZÃO COMPLETO E FLUXO DE CAIXA DE LANCAMENTOS", marginX, y);
  y += 5;

  doc.setLineWidth(0.4);
  doc.setDrawColor(197, 155, 39);
  doc.line(marginX, y, 210 - marginX, y);
  y += 5;

  // Ledger Table headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 110, 100);
  doc.text("Data", marginX + 2, y);
  doc.text("Descrição da Transação", marginX + 22, y);
  doc.text("Propriedade", marginX + 75, y);
  doc.text("Categoria", marginX + 115, y);
  doc.text("Status", marginX + 148, y);
  doc.text("Valor", marginX + 172, y);
  y += 3.5;

  doc.setLineWidth(0.2);
  doc.setDrawColor(210, 200, 190);
  doc.line(marginX, y, 210 - marginX, y);
  y += 4;

  // Sort finances by date descending
  const sortedFinances = [...finances].sort((a, b) => b.date.localeCompare(a.date));

  if (sortedFinances.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(140, 130, 120);
    doc.text("Nenhuma transação financeira lançada.", marginX + 5, y);
    y += 10;
  } else {
    // Render individual ledger rows
    sortedFinances.forEach(item => {
      checkPageLimit(9);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(50, 45, 40);

      // Date
      const dateFormatted = item.date.split("-").reverse().join("/");
      doc.text(dateFormatted, marginX + 2, y);

      // Title
      doc.setFont("helvetica", "bold");
      const truncatedTitle = item.title.length > 32 ? `${item.title.substring(0, 30)}...` : item.title;
      doc.text(truncatedTitle, marginX + 22, y);
      doc.setFont("helvetica", "normal");

      // Property
      doc.text(item.propertyName, marginX + 75, y);

      // Category
      doc.text(item.category || "Geral", marginX + 115, y);

      // Status translation
      let statusStr = "PAGO";
      if (item.status === "pendente") statusStr = "PENDENTE";
      if (item.status === "extraido") statusStr = "DIGITALIZADO";
      doc.text(statusStr, marginX + 148, y);

      // Signed Value
      const isRev = item.type === "receita";
      const signStr = isRev ? "+" : "—";
      
      doc.setFont("helvetica", "bold");
      if (isRev) {
        doc.setTextColor(34, 139, 34); // Green
      } else {
        doc.setTextColor(220, 20, 60); // Red
      }
      doc.text(`${signStr} ${formatBRL(item.amount)}`, marginX + 172, y);

      // Reset text colors
      doc.setTextColor(50, 45, 40);
      
      y += 5;
      doc.setLineWidth(0.1);
      doc.setDrawColor(240, 235, 225);
      doc.line(marginX, y, 210 - marginX, y);
      y += 3.5;
    });
  }

  // Final page count audit and draw page footer for the final active page
  drawFooter(pageCount);

  // Trigger browser download dialog
  doc.save(`CasaSelect-Resumo-Financeiro-${new Date().toISOString().slice(0, 10)}.pdf`);
}
