// ============================================
// DUI-CALC SITE CONFIGURATION
// DUI Cost Calculator for all 50 US States
// 2025 data - easy yearly updates
// ============================================

import { Scale, FileWarning, Shield, Car } from 'lucide-react';

// ============================================
// SITE METADATA
// ============================================
export const SITE = {
    name: "DUI Calculator",
    tagline: "Free DUI Cost Estimator",
    description: "Calculate the true cost of a DUI in your state. Free 2025 DUI cost calculator with fines, lawyer fees, insurance increases, and more.",
    year: 2025,
    baseUrl: "https://dui-calc.vercel.app",
};

// ============================================
// 2025 DUI COST CONSTANTS (National Averages)
// Sources: NHTSA, State DMV websites, Legal databases
// ============================================
export const DUI_COSTS_2025 = {
    // Court & Legal
    courtFiling: { min: 150, max: 500 },
    lawyerFirstOffense: { min: 2500, max: 5000 },
    lawyerSecondOffense: { min: 5000, max: 10000 },
    lawyerThirdOffense: { min: 10000, max: 25000 },

    // Fines (varies widely by state)
    fineFirstOffense: { min: 500, max: 2000 },
    fineSecondOffense: { min: 1000, max: 5000 },
    fineThirdOffense: { min: 2000, max: 10000 },

    // DUI Programs
    duiSchool: { min: 250, max: 800 },
    alcoholAssessment: { min: 100, max: 300 },
    treatmentProgram: { min: 1000, max: 5000 },

    // DMV & License
    licenseReinstatement: { min: 100, max: 500 },
    srFiling: { min: 15, max: 50 }, // SR-22 filing fee

    // Ignition Interlock Device (IID)
    iidInstallation: { min: 100, max: 200 },
    iidMonthly: { min: 75, max: 150 },
    iidDuration: { months: 6 }, // minimum for first offense

    // Insurance Impact (3 years)
    insuranceIncreasePercent: 80, // Average 80% increase
    averageAnnualPremium: 1800,
    insuranceYears: 3,

    // Jail & Bail
    bailFirstOffense: { min: 500, max: 2500 },
    bailSecondOffense: { min: 2500, max: 10000 },

    // Towing & Impound
    towing: { min: 150, max: 400 },
    impoundPerDay: { min: 30, max: 75 },
    impoundDays: 3, // average

    // Lost Wages (during court, classes, license suspension)
    lostWageDays: 3,
    averageDailyWage: 200,
} as const;

// ============================================
// STATE-SPECIFIC DATA (Top 10 states by population)
// ============================================
export const STATE_DATA: Record<string, {
    name: string;
    fineFirst: number;
    fineSecond: number;
    licenseFirst: string;
    licenseSecond: string;
    mandatoryJail: boolean;
    iidRequired: boolean;
}> = {
    CA: { name: "California", fineFirst: 1800, fineSecond: 3000, licenseFirst: "6 months", licenseSecond: "2 years", mandatoryJail: false, iidRequired: true },
    TX: { name: "Texas", fineFirst: 2000, fineSecond: 4000, licenseFirst: "1 year", licenseSecond: "2 years", mandatoryJail: false, iidRequired: true },
    FL: { name: "Florida", fineFirst: 1000, fineSecond: 2000, licenseFirst: "180 days", licenseSecond: "5 years", mandatoryJail: false, iidRequired: true },
    NY: { name: "New York", fineFirst: 1000, fineSecond: 5000, licenseFirst: "6 months", licenseSecond: "1 year", mandatoryJail: false, iidRequired: true },
    PA: { name: "Pennsylvania", fineFirst: 300, fineSecond: 1500, licenseFirst: "1 year", licenseSecond: "1 year", mandatoryJail: false, iidRequired: true },
    IL: { name: "Illinois", fineFirst: 2500, fineSecond: 2500, licenseFirst: "1 year", licenseSecond: "5 years", mandatoryJail: false, iidRequired: true },
    OH: { name: "Ohio", fineFirst: 1075, fineSecond: 1625, licenseFirst: "1-3 years", licenseSecond: "1-7 years", mandatoryJail: true, iidRequired: true },
    GA: { name: "Georgia", fineFirst: 1000, fineSecond: 1000, licenseFirst: "1 year", licenseSecond: "3 years", mandatoryJail: true, iidRequired: true },
    NC: { name: "North Carolina", fineFirst: 200, fineSecond: 2000, licenseFirst: "1 year", licenseSecond: "4 years", mandatoryJail: false, iidRequired: true },
    MI: { name: "Michigan", fineFirst: 500, fineSecond: 1000, licenseFirst: "180 days", licenseSecond: "1 year", mandatoryJail: false, iidRequired: true },
    // Add more states as needed
    OTHER: { name: "Other State", fineFirst: 1000, fineSecond: 2500, licenseFirst: "6-12 months", licenseSecond: "1-2 years", mandatoryJail: false, iidRequired: true },
};

// ============================================
// DUI CALCULATION RESULT TYPE
// ============================================
export interface DUICalculationResult {
    // Input summary
    state: string;
    offense: 'first' | 'second' | 'third';
    bac: number;
    accident: boolean;

    // Cost breakdown
    courtFees: number;
    lawyerFees: number;
    fines: number;
    duiPrograms: number;
    licenseRelated: number;
    iidCosts: number;
    insuranceIncrease: number;
    towingImpound: number;
    lostWages: number;

    // Totals
    totalMinimum: number;
    totalMaximum: number;
    totalAverage: number;

    // Additional info
    licenseSuspension: string;
    mandatoryJail: boolean;
}

// ============================================
// DUI COST CALCULATION FUNCTION
// ============================================
export function calculateDUICost(
    stateCode: string,
    offense: 'first' | 'second' | 'third',
    bac: number,
    hasAccident: boolean
): DUICalculationResult {
    const costs = DUI_COSTS_2025;
    const stateInfo = STATE_DATA[stateCode] || STATE_DATA.OTHER;

    // Multiplier for high BAC (over 0.15)
    const highBACMultiplier = bac >= 0.15 ? 1.5 : 1;
    const accidentMultiplier = hasAccident ? 1.3 : 1;
    const combinedMultiplier = highBACMultiplier * accidentMultiplier;

    // Court fees
    const courtFees = Math.round((costs.courtFiling.min + costs.courtFiling.max) / 2);

    // Lawyer fees based on offense
    let lawyerFees: number;
    if (offense === 'first') {
        lawyerFees = Math.round((costs.lawyerFirstOffense.min + costs.lawyerFirstOffense.max) / 2 * combinedMultiplier);
    } else if (offense === 'second') {
        lawyerFees = Math.round((costs.lawyerSecondOffense.min + costs.lawyerSecondOffense.max) / 2 * combinedMultiplier);
    } else {
        lawyerFees = Math.round((costs.lawyerThirdOffense.min + costs.lawyerThirdOffense.max) / 2 * combinedMultiplier);
    }

    // Fines based on state and offense
    let fines: number;
    if (offense === 'first') {
        fines = Math.round(stateInfo.fineFirst * combinedMultiplier);
    } else if (offense === 'second') {
        fines = Math.round(stateInfo.fineSecond * combinedMultiplier);
    } else {
        fines = Math.round(stateInfo.fineSecond * 2 * combinedMultiplier);
    }

    // DUI programs
    const duiPrograms = Math.round(
        (costs.duiSchool.min + costs.duiSchool.max) / 2 +
        (costs.alcoholAssessment.min + costs.alcoholAssessment.max) / 2 +
        (offense !== 'first' ? (costs.treatmentProgram.min + costs.treatmentProgram.max) / 2 : 0)
    );

    // License related
    const licenseRelated = Math.round(
        (costs.licenseReinstatement.min + costs.licenseReinstatement.max) / 2 +
        costs.srFiling.max * 12 * 3 // SR-22 for 3 years
    );

    // IID costs
    const iidMonths = offense === 'first' ? 6 : offense === 'second' ? 12 : 24;
    const iidCosts = Math.round(
        (costs.iidInstallation.min + costs.iidInstallation.max) / 2 +
        ((costs.iidMonthly.min + costs.iidMonthly.max) / 2 * iidMonths)
    );

    // Insurance increase over 3 years
    const insuranceIncrease = Math.round(
        costs.averageAnnualPremium * (costs.insuranceIncreasePercent / 100) * costs.insuranceYears
    );

    // Towing & impound
    const towingImpound = Math.round(
        (costs.towing.min + costs.towing.max) / 2 +
        ((costs.impoundPerDay.min + costs.impoundPerDay.max) / 2 * costs.impoundDays)
    );

    // Lost wages
    const lostWages = Math.round(costs.lostWageDays * costs.averageDailyWage * (offense === 'first' ? 1 : 2));

    // Calculate totals
    const totalAverage = courtFees + lawyerFees + fines + duiPrograms + licenseRelated + iidCosts + insuranceIncrease + towingImpound + lostWages;
    const totalMinimum = Math.round(totalAverage * 0.6);
    const totalMaximum = Math.round(totalAverage * 1.5);

    return {
        state: stateInfo.name,
        offense,
        bac,
        accident: hasAccident,

        courtFees,
        lawyerFees,
        fines,
        duiPrograms,
        licenseRelated,
        iidCosts,
        insuranceIncrease,
        towingImpound,
        lostWages,

        totalMinimum,
        totalMaximum,
        totalAverage,

        licenseSuspension: offense === 'first' ? stateInfo.licenseFirst : stateInfo.licenseSecond,
        mandatoryJail: stateInfo.mandatoryJail || offense !== 'first',
    };
}

// ============================================
// CALCULATOR DEFINITIONS
// ============================================
export const CALCULATORS = [
    {
        id: "dui-cost",
        name: "DUI Cost Calculator",
        shortName: "DUI Cost",
        description: "Calculate the total cost of a DUI in your state",
        longDescription: "Free 2025 DUI cost calculator. Estimate fines, lawyer fees, insurance increases, and total expenses for DUI/DWI charges in all 50 US states.",
        icon: Scale,
        category: "legal",
        keywords: ["DUI cost", "DWI calculator", "drunk driving fine", "DUI lawyer cost", "DUI insurance"],
        featured: true,
    },
    {
        id: "dui-insurance",
        name: "DUI Insurance Calculator",
        shortName: "Insurance",
        description: "See how a DUI affects your car insurance rates",
        longDescription: "Calculate how much your car insurance will increase after a DUI conviction. See 3-year and 5-year cost projections.",
        icon: Shield,
        category: "insurance",
        keywords: ["DUI insurance", "SR-22", "insurance increase", "high risk insurance", "DUI car insurance"],
        featured: true,
    },
    {
        id: "dui-comparison",
        name: "DUI Laws by State",
        shortName: "Compare States",
        description: "Compare DUI fines, penalties & insurance by state",
        longDescription: "Compare DUI laws, fines, license suspension, and insurance increases across all 50 US states in one simple table.",
        icon: FileWarning,
        category: "legal",
        keywords: ["DUI laws by state", "DUI penalties comparison", "state DUI fines", "DUI insurance by state"],
        featured: false,
    },
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

// Get all state codes
export function getStateCodes(): string[] {
    return Object.keys(STATE_DATA).filter(code => code !== 'OTHER');
}
