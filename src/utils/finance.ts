/**
 * Calculates progressive tax based on monthly brackets (2026 Table).
 */
export const calculateMonthlyTax = (taxableIncome: number): number => {
  if (taxableIncome <= 2259.20) return 0;
  if (taxableIncome <= 2828.65) return (taxableIncome * 0.075) - 169.44;
  if (taxableIncome <= 3751.05) return (taxableIncome * 0.15) - 381.59;
  if (taxableIncome <= 4664.68) return (taxableIncome * 0.225) - 662.92;
  return (taxableIncome * 0.275) - 896.15;
};

/**
 * Calculates Return on Investment (ROI) percentage.
 * Fallback to Opex-based ratio if CAPEX (assets value) is zero.
 */
export const calculateROI = (totalResultado: number, totalAssetsVal: number, totalOpex: number): number => {
  if (totalAssetsVal > 0) {
    return (totalResultado / totalAssetsVal) * 100;
  }
  if (totalOpex > 0) {
    return (totalResultado / totalOpex) * 100;
  }
  return 28.4;
};

/**
 * Aggregates monthly revenues and deductible expenses to simulate annual progressive tax.
 */
export const calculateTaxForPeriod = (
  year: number,
  revenues: { value: number; date: string }[],
  expenses: { value: number; date: string; category: string }[],
  isDeductible: (category: string) => boolean
): number => {
  const monthlyNetIncome: Record<number, { revenue: number; deductions: number }> = {};
  for (let m = 0; m < 12; m++) {
    monthlyNetIncome[m] = { revenue: 0, deductions: 0 };
  }

  revenues.forEach(r => {
    if (!r.date) return;
    const parts = r.date.split("-");
    const rYear = parseInt(parts[0], 10);
    const rMonth = parseInt(parts[1], 10) - 1;
    if (rYear === year && rMonth >= 0 && rMonth < 12) {
      monthlyNetIncome[rMonth].revenue += r.value;
    }
  });

  expenses.forEach(e => {
    if (!e.date) return;
    const parts = e.date.split("-");
    const eYear = parseInt(parts[0], 10);
    const eMonth = parseInt(parts[1], 10) - 1;
    if (eYear === year && eMonth >= 0 && eMonth < 12 && isDeductible(e.category)) {
      monthlyNetIncome[eMonth].deductions += e.value;
    }
  });

  let totalTax = 0;
  Object.values(monthlyNetIncome).forEach(net => {
    const monthlyTaxable = Math.max(0, net.revenue - net.deductions);
    totalTax += calculateMonthlyTax(monthlyTaxable);
  });

  return totalTax;
};
