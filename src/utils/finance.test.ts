import assert from "node:assert";
import { calculateMonthlyTax, calculateROI, calculateTaxForPeriod } from "./finance";

console.log("🚀 Starting Financial Regression Tests...\n");

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`  ❌ ${name}`);
    console.error(`     Error: ${error.message}`);
    failedTests++;
  }
}

// ─── TEST SUITE: calculateMonthlyTax ──────────────────────────────────────────
test("calculateMonthlyTax - exemption bracket (<= 2259.20)", () => {
  assert.strictEqual(calculateMonthlyTax(2000), 0);
  assert.strictEqual(calculateMonthlyTax(2259.20), 0);
  assert.strictEqual(calculateMonthlyTax(0), 0);
});

test("calculateMonthlyTax - bracket 1 (7.5%)", () => {
  // Formula: (taxableIncome * 0.075) - 169.44
  const res = calculateMonthlyTax(2500);
  const expected = (2500 * 0.075) - 169.44;
  assert.ok(Math.abs(res - expected) < 0.001);
});

test("calculateMonthlyTax - bracket 2 (15%)", () => {
  // Formula: (taxableIncome * 0.15) - 381.59
  const res = calculateMonthlyTax(3500);
  const expected = (3500 * 0.15) - 381.59;
  assert.ok(Math.abs(res - expected) < 0.001);
});

test("calculateMonthlyTax - bracket 3 (22.5%)", () => {
  // Formula: (taxableIncome * 0.225) - 662.92
  const res = calculateMonthlyTax(4500);
  const expected = (4500 * 0.225) - 662.92;
  assert.ok(Math.abs(res - expected) < 0.001);
});

test("calculateMonthlyTax - bracket 4 (27.5%)", () => {
  // Formula: (taxableIncome * 0.275) - 896.15
  const res = calculateMonthlyTax(6000);
  const expected = (6000 * 0.275) - 896.15;
  assert.ok(Math.abs(res - expected) < 0.001);
});

// ─── TEST SUITE: calculateROI ─────────────────────────────────────────────────
test("calculateROI - positive CAPEX assets value", () => {
  // ROI = (resultado / assets) * 100
  const res = calculateROI(10000, 50000, 20000);
  assert.strictEqual(res, 20);
});

test("calculateROI - zero CAPEX but positive OPEX value", () => {
  // ROI = (resultado / opex) * 100
  const res = calculateROI(5000, 0, 25000);
  assert.strictEqual(res, 20);
});

test("calculateROI - zero CAPEX and zero OPEX fallback", () => {
  // Should return 28.4
  const res = calculateROI(5000, 0, 0);
  assert.strictEqual(res, 28.4);
});

// ─── TEST SUITE: calculateTaxForPeriod ────────────────────────────────────────
test("calculateTaxForPeriod - correct monthly aggregations and filters", () => {
  // 12 months with various values
  const revenues = [
    { value: 5000, date: "2026-01-15" },
    { value: 6000, date: "2026-02-10" },
    { value: 1000, date: "2025-01-15" }, // different year, ignored
  ];

  const expenses = [
    { value: 1000, date: "2026-01-20", category: "Limpeza" }, // deductible
    { value: 500, date: "2026-01-25", category: "Outros" }, // non-deductible
    { value: 1500, date: "2026-02-15", category: "Manutenção" }, // deductible
  ];

  const isDeductible = (cat: string) => ["Limpeza", "Manutenção"].includes(cat);

  const res = calculateTaxForPeriod(2026, revenues, expenses, isDeductible);

  // Jan net: 5000 - 1000 = 4000. Tax: (4000 * 0.225) - 662.92 = 237.08
  // Feb net: 6000 - 1500 = 4500. Tax: (4500 * 0.225) - 662.92 = 349.58
  // Total expected = 586.66
  const janTax = calculateMonthlyTax(4000);
  const febTax = calculateMonthlyTax(4500);
  const expectedTotal = janTax + febTax;

  assert.ok(Math.abs(res - expectedTotal) < 0.001);
});

console.log(`\n📊 Test Summary: ${passedTests} passed, ${failedTests} failed.`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("✨ All financial tests passed successfully!");
  process.exit(0);
}
