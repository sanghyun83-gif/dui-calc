"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Calculator, Info, AlertTriangle, TrendingUp } from "lucide-react";
import { SITE, DUI_COSTS_2025, formatCurrency, parseFormattedNumber } from "../site-config";

// Insurance increase rates by offense (industry averages 2025)
const INSURANCE_RATES = {
    firstOffense: { min: 0.65, max: 0.95, avg: 0.80 }, // 65-95% increase
    secondOffense: { min: 1.00, max: 1.50, avg: 1.25 }, // 100-150% increase
    thirdOffense: { min: 1.50, max: 2.50, avg: 2.00 }, // 150-250% increase
    sr22Duration: 3, // years
    rateImpactDuration: 5, // years total impact
} as const;

interface InsuranceResult {
    currentAnnual: number;
    offense: 'first' | 'second' | 'third';
    increasePercent: number;
    newAnnual: number;
    sr22Fee: number;
    yearlyIncrease: number;
    threeYearTotal: number;
    fiveYearTotal: number;
    totalExtraCost: number;
}

function calculateInsuranceImpact(
    currentPremium: number,
    offense: 'first' | 'second' | 'third'
): InsuranceResult {
    const rates = offense === 'first'
        ? INSURANCE_RATES.firstOffense
        : offense === 'second'
            ? INSURANCE_RATES.secondOffense
            : INSURANCE_RATES.thirdOffense;

    const increasePercent = rates.avg * 100;
    const newAnnual = Math.round(currentPremium * (1 + rates.avg));
    const yearlyIncrease = newAnnual - currentPremium;
    const sr22Fee = DUI_COSTS_2025.srFiling.max * 12; // Annual SR-22 cost

    // 3-year cost (SR-22 required period)
    const threeYearTotal = (yearlyIncrease + sr22Fee) * 3;

    // 5-year cost (rates stay elevated)
    const fiveYearTotal = (yearlyIncrease * 5) + (sr22Fee * 3);

    return {
        currentAnnual: currentPremium,
        offense,
        increasePercent,
        newAnnual,
        sr22Fee,
        yearlyIncrease,
        threeYearTotal,
        fiveYearTotal,
        totalExtraCost: fiveYearTotal,
    };
}

export default function DUIInsurancePage() {
    const [premium, setPremium] = useState("");
    const [offense, setOffense] = useState<"first" | "second" | "third">("first");
    const [result, setResult] = useState<InsuranceResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        if (raw === "") {
            setPremium("");
            return;
        }
        setPremium(parseInt(raw).toLocaleString("en-US"));
    };

    const handleCalculate = () => {
        const amount = parseFormattedNumber(premium) || DUI_COSTS_2025.averageAnnualPremium;
        setResult(calculateInsuranceImpact(amount, offense));
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-500" />
                        <span className="text-lg font-bold text-white">DUI Insurance Calculator</span>
                    </div>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                        {SITE.year}
                    </span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Calculator Card */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h1 className="text-xl font-bold text-white mb-2">
                        {SITE.year} DUI Insurance Impact Calculator
                    </h1>
                    <p className="text-sm text-slate-400 mb-6">
                        See how much your car insurance will increase after a DUI
                    </p>

                    {/* Inputs */}
                    <div className="space-y-4 mb-6">
                        {/* Current Premium */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Current Annual Car Insurance Premium
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                <input
                                    type="text"
                                    value={premium}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                                    placeholder={DUI_COSTS_2025.averageAnnualPremium.toLocaleString()}
                                    className="w-full pl-8 pr-4 py-4 text-lg bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Average US premium: ${DUI_COSTS_2025.averageAnnualPremium.toLocaleString()}/year
                            </p>
                        </div>

                        {/* Offense Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                DUI Offense Type
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: "first", label: "1st DUI", increase: "+80%" },
                                    { value: "second", label: "2nd DUI", increase: "+125%" },
                                    { value: "third", label: "3rd+ DUI", increase: "+200%" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setOffense(opt.value as "first" | "second" | "third")}
                                        className={`py-3 px-2 rounded-lg border font-medium transition text-center ${offense === opt.value
                                                ? "bg-amber-600 text-white border-amber-600"
                                                : "bg-slate-700 text-slate-300 border-slate-600 hover:border-amber-500"
                                            }`}
                                    >
                                        <div className="text-sm">{opt.label}</div>
                                        <div className="text-xs opacity-75">{opt.increase}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculate}
                        className="w-full py-4 bg-amber-600 text-white rounded-lg font-semibold text-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Calculate Insurance Impact
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="mt-6 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        {/* Summary Header */}
                        <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white p-6">
                            <p className="text-sm text-amber-100 mb-1">Your New Annual Premium</p>
                            <p className="text-4xl font-bold">{formatCurrency(result.newAnnual)}/yr</p>
                            <p className="text-sm text-amber-100 mt-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                +{result.increasePercent}% increase ({formatCurrency(result.yearlyIncrease)}/yr extra)
                            </p>
                        </div>

                        {/* Cost Cards */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                    <p className="text-slate-400 text-sm">3-Year Cost</p>
                                    <p className="text-2xl font-bold text-red-400">{formatCurrency(result.threeYearTotal)}</p>
                                    <p className="text-xs text-slate-500">SR-22 period</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                    <p className="text-slate-400 text-sm">5-Year Cost</p>
                                    <p className="text-2xl font-bold text-red-400">{formatCurrency(result.fiveYearTotal)}</p>
                                    <p className="text-xs text-slate-500">Total impact</p>
                                </div>
                            </div>

                            {/* Breakdown Table */}
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                Cost Breakdown
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-700">
                                    <span className="text-slate-300">Current Annual Premium</span>
                                    <span className="font-medium text-slate-400">{formatCurrency(result.currentAnnual)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-700">
                                    <span className="text-slate-300">Rate Increase (+{result.increasePercent}%)</span>
                                    <span className="font-medium text-red-400">+{formatCurrency(result.yearlyIncrease)}/yr</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-700">
                                    <span className="text-slate-300">SR-22 Filing Fees</span>
                                    <span className="font-medium text-red-400">+{formatCurrency(result.sr22Fee)}/yr</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-700">
                                    <span className="text-white font-medium">New Annual Premium</span>
                                    <span className="font-bold text-amber-400">{formatCurrency(result.newAnnual)}</span>
                                </div>
                                <div className="flex justify-between pt-4 text-lg">
                                    <span className="text-white font-bold">5-Year Extra Cost</span>
                                    <span className="font-bold text-red-400">{formatCurrency(result.totalExtraCost)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="p-4 bg-amber-900/30 border-t border-amber-700/50">
                            <div className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                                <p className="text-amber-200">
                                    Some insurers may cancel your policy. You may need to find a new high-risk insurer at even higher rates.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ad Placeholder */}
                <div className="my-8 p-6 bg-slate-800 border border-slate-700 rounded-xl text-center">
                    <p className="text-sm text-slate-500">Advertisement</p>
                </div>

                {/* FAQ Section */}
                <section className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-amber-500" />
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                How much does insurance increase after a DUI?
                            </h3>
                            <p className="text-slate-400">
                                On average, car insurance increases 80% after a first DUI. Second offenses see 125%+ increases, and third offenses can double or triple your rates.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                What is SR-22 insurance?
                            </h3>
                            <p className="text-slate-400">
                                SR-22 is a certificate proving you have minimum liability insurance. After a DUI, your state requires you to file an SR-22 for 3 years. It costs $15-50 extra per month.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                How long does a DUI affect my insurance?
                            </h3>
                            <p className="text-slate-400">
                                A DUI stays on your driving record for 3-10 years depending on your state. Your insurance rates will be affected for at least 3-5 years.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">
                                Can I get insurance after a DUI?
                            </h3>
                            <p className="text-slate-400">
                                Yes, but you may need to use a high-risk insurer. Companies like The General, Dairyland, and Progressive specialize in DUI drivers but charge higher rates.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="mt-8 text-center">
                    <Link
                        href="/dui-cost"
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Calculate Total DUI Cost →
                    </Link>
                </div>

                {/* Disclaimer */}
                <p className="mt-8 text-xs text-slate-500 text-center">
                    This calculator provides estimates based on industry averages.
                    Actual rates vary by insurer, location, and individual factors.
                </p>
            </main>

            {/* Schema.org FAQPage */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: [
                            {
                                "@type": "Question",
                                name: "How much does insurance increase after a DUI?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "On average, car insurance increases 80% after a first DUI. Second offenses see 125%+ increases.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "What is SR-22 insurance?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "SR-22 is a certificate proving you have minimum liability insurance. After a DUI, your state requires you to file an SR-22 for 3 years.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </div>
    );
}
