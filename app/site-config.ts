// ============================================
// FIN-CALC SITE CONFIGURATION
// All tax rates and calculator logic centralized here
// Easy to update yearly - just change the constants
// ============================================

import { FileText, Calculator, TrendingUp, Wallet, PiggyBank, Home } from 'lucide-react';

// ============================================
// SITE METADATA
// ============================================
export const SITE = {
    name: "FinCalc",
    tagline: "Free Financial Calculators",
    description: "Free tax calculators for US freelancers and self-employed.",
    year: 2025,
};

// ============================================
// 2025 FEDERAL TAX BRACKETS (SINGLE FILER)
// Source: IRS Revenue Procedure 2024-40
// ============================================
export const TAX_BRACKETS_2025 = [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
] as const;

// ============================================
// 2025 SELF-EMPLOYMENT TAX CONSTANTS
// Source: IRS & SSA 2025 Updates
// ============================================
export const SE_TAX_2025 = {
    // Social Security: 12.4% (employer + employee portions)
    socialSecurityRate: 0.124,
    // 2025 Social Security wage base limit
    socialSecurityLimit: 176100,
    // Medicare: 2.9% (no limit)
    medicareRate: 0.029,
    // Additional Medicare: 0.9% for high earners
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: 200000,
    // SE tax is calculated on 92.35% of net earnings
    netEarningsMultiplier: 0.9235,
    // You can deduct 50% of SE tax from gross income
    deductionRate: 0.5,
    // 2025 Standard deduction for single filers
    standardDeduction: 15000,
} as const;

// ============================================
// CALCULATION RESULT TYPE
// ============================================
export interface TaxCalculationResult {
    grossIncome: number;
    netEarnings: number;
    socialSecurityTax: number;
    medicareTax: number;
    additionalMedicare: number;
    totalSETax: number;
    seDeduction: number;
    standardDeduction: number;
    taxableIncome: number;
    federalTax: number;
    totalTax: number;
    quarterlyPayment: number;
    effectiveRate: string;
    brackets: { rate: number; amount: number }[];
}

// ============================================
// SELF-EMPLOYMENT TAX CALCULATION
// ============================================
export function calculateSETax(grossIncome: number): TaxCalculationResult {
    const {
        socialSecurityRate,
        socialSecurityLimit,
        medicareRate,
        additionalMedicareRate,
        additionalMedicareThreshold,
        netEarningsMultiplier,
        deductionRate,
        standardDeduction,
    } = SE_TAX_2025;

    // 1. Net earnings for SE tax (92.35% of gross)
    const netEarnings = grossIncome * netEarningsMultiplier;

    // 2. Social Security tax (capped at limit)
    const ssTaxableIncome = Math.min(netEarnings, socialSecurityLimit);
    const socialSecurityTax = ssTaxableIncome * socialSecurityRate;

    // 3. Medicare tax (no limit)
    const medicareTax = netEarnings * medicareRate;

    // 4. Additional Medicare (over threshold)
    const additionalMedicare =
        netEarnings > additionalMedicareThreshold
            ? (netEarnings - additionalMedicareThreshold) * additionalMedicareRate
            : 0;

    // 5. Total SE tax
    const totalSETax = socialSecurityTax + medicareTax + additionalMedicare;

    // 6. SE tax deduction (50%)
    const seDeduction = totalSETax * deductionRate;

    // 7. Taxable income for federal tax
    const taxableIncome = Math.max(0, grossIncome - seDeduction - standardDeduction);

    // 8. Federal income tax (progressive brackets)
    let federalTax = 0;
    let remainingIncome = taxableIncome;
    const brackets: { rate: number; amount: number }[] = [];

    for (const bracket of TAX_BRACKETS_2025) {
        if (remainingIncome <= 0) break;
        const bracketWidth = bracket.max - bracket.min;
        const taxableInBracket = Math.min(remainingIncome, bracketWidth);
        const taxInBracket = taxableInBracket * bracket.rate;
        federalTax += taxInBracket;
        brackets.push({ rate: bracket.rate * 100, amount: Math.round(taxInBracket) });
        remainingIncome -= taxableInBracket;
    }

    // 9. Total tax & quarterly payment
    const totalTax = totalSETax + federalTax;
    const quarterlyPayment = totalTax / 4;

    // 10. Effective tax rate
    const effectiveRate = grossIncome > 0
        ? ((totalTax / grossIncome) * 100).toFixed(1)
        : "0.0";

    return {
        grossIncome,
        netEarnings: Math.round(netEarnings),
        socialSecurityTax: Math.round(socialSecurityTax),
        medicareTax: Math.round(medicareTax),
        additionalMedicare: Math.round(additionalMedicare),
        totalSETax: Math.round(totalSETax),
        seDeduction: Math.round(seDeduction),
        standardDeduction,
        taxableIncome: Math.round(taxableIncome),
        federalTax: Math.round(federalTax),
        totalTax: Math.round(totalTax),
        quarterlyPayment: Math.round(quarterlyPayment),
        effectiveRate,
        brackets,
    };
}

// ============================================
// CALCULATOR DEFINITIONS (EXPANDABLE)
// Add new calculators here - homepage auto-generates cards
// ============================================
export const CALCULATORS = [
    {
        id: "1099-tax",
        name: "1099 Tax Calculator",
        shortName: "1099 Tax",
        description: "Calculate self-employment taxes for freelancers",
        longDescription:
            "Free 2025 self-employment tax calculator. Calculates SE tax (15.3%), federal income tax, and quarterly estimated payments for 1099 contractors and freelancers.",
        icon: FileText,
        category: "tax",
        keywords: ["1099", "self employment", "freelance", "quarterly tax", "SE tax"],
        featured: true,
    },
    // Future calculators - uncomment when ready
    // {
    //   id: "quarterly-tax",
    //   name: "Quarterly Tax Calculator",
    //   shortName: "Quarterly",
    //   description: "Estimate quarterly tax payments",
    //   icon: Calculator,
    //   category: "tax",
    //   featured: false,
    // },
    // {
    //   id: "compound-interest",
    //   name: "Compound Interest Calculator",
    //   shortName: "Compound",
    //   description: "Calculate compound interest growth",
    //   icon: TrendingUp,
    //   category: "finance",
    //   featured: false,
    // },
] as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
}

export function parseFormattedNumber(value: string): number {
    return parseInt(value.replace(/[^0-9]/g, "")) || 0;
}
