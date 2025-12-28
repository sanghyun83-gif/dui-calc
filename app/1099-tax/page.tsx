"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, FileText, Info } from "lucide-react";
import {
    SITE,
    SE_TAX_2025,
    calculateSETax,
    formatCurrency,
    parseFormattedNumber,
    TaxCalculationResult,
} from "../site-config";

export default function Tax1099Page() {
    const [income, setIncome] = useState("");
    const [result, setResult] = useState<TaxCalculationResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        if (raw === "") {
            setIncome("");
            return;
        }
        const formatted = parseInt(raw).toLocaleString("en-US");
        setIncome(formatted);
    };

    const handleCalculate = () => {
        const grossIncome = parseFormattedNumber(income);
        if (grossIncome > 0) {
            setResult(calculateSETax(grossIncome));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCalculate();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/"
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <span className="text-lg font-bold text-slate-900">
                            1099 Tax Calculator
                        </span>
                    </div>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {SITE.year}
                    </span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* Calculator Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900 mb-2">
                        Free 1099 Self-Employment Tax Calculator
                    </h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Calculate your {SITE.year} SE tax, federal income tax, and quarterly
                        estimated payments.
                    </p>

                    {/* Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Gross Income (Annual)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                $
                            </span>
                            <input
                                type="text"
                                value={income}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="100,000"
                                className="w-full pl-8 pr-4 py-4 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            Enter your total 1099 income before any deductions
                        </p>
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculate}
                        disabled={!income}
                        className="w-full py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Calculate Taxes
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Summary Header */}
                        <div className="bg-indigo-600 text-white p-6">
                            <p className="text-sm text-indigo-200 mb-1">
                                Your {SITE.year} Estimated Total Tax
                            </p>
                            <p className="text-4xl font-bold">
                                {formatCurrency(result.totalTax)}
                            </p>
                            <p className="text-sm text-indigo-200 mt-2">
                                Effective tax rate: {result.effectiveRate}%
                            </p>
                        </div>

                        {/* Quarterly Payment Highlight */}
                        <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-800">
                                        Quarterly Estimated Payment
                                    </p>
                                    <p className="text-xs text-emerald-600">
                                        Due: April 15, June 15, Sept 15, Jan 15
                                    </p>
                                </div>
                                <p className="text-2xl font-bold text-emerald-700">
                                    {formatCurrency(result.quarterlyPayment)}
                                </p>
                            </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                Tax Breakdown
                            </h3>

                            <div className="space-y-3 text-sm">
                                {/* Income Section */}
                                <div className="pb-3 border-b border-slate-100">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Gross Income</span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(result.grossIncome)}
                                        </span>
                                    </div>
                                </div>

                                {/* SE Tax Section */}
                                <div className="pb-3 border-b border-slate-100">
                                    <p className="font-medium text-slate-900 mb-2">
                                        Self-Employment Tax (15.3%)
                                    </p>
                                    <div className="space-y-1 pl-4">
                                        <div className="flex justify-between text-slate-500">
                                            <span>
                                                Social Security (12.4% up to $
                                                {SE_TAX_2025.socialSecurityLimit.toLocaleString()})
                                            </span>
                                            <span>{formatCurrency(result.socialSecurityTax)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Medicare (2.9%)</span>
                                            <span>{formatCurrency(result.medicareTax)}</span>
                                        </div>
                                        {result.additionalMedicare > 0 && (
                                            <div className="flex justify-between text-slate-500">
                                                <span>Additional Medicare (0.9% over $200k)</span>
                                                <span>{formatCurrency(result.additionalMedicare)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-medium text-slate-700 pt-1">
                                            <span>Total SE Tax</span>
                                            <span>{formatCurrency(result.totalSETax)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deductions Section */}
                                <div className="pb-3 border-b border-slate-100">
                                    <p className="font-medium text-slate-900 mb-2">Deductions</p>
                                    <div className="space-y-1 pl-4">
                                        <div className="flex justify-between text-emerald-600">
                                            <span>SE Tax Deduction (50%)</span>
                                            <span>-{formatCurrency(result.seDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Standard Deduction</span>
                                            <span>-{formatCurrency(result.standardDeduction)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Federal Tax Section */}
                                <div className="pb-3 border-b border-slate-100">
                                    <div className="flex justify-between text-slate-600 mb-2">
                                        <span className="font-medium text-slate-900">
                                            Taxable Income
                                        </span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(result.taxableIncome)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-900">
                                            Federal Income Tax
                                        </span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(result.federalTax)}
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-2">
                                    <div className="flex justify-between text-lg font-bold text-slate-900">
                                        <span>Total Tax</span>
                                        <span>{formatCurrency(result.totalTax)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ad Placeholder */}
                <div className="my-8 p-6 bg-white border border-slate-200 rounded-xl text-center">
                    <p className="text-sm text-slate-400">Advertisement</p>
                </div>

                {/* FAQ Section for SEO */}
                <section className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-600" />
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                                What is the {SITE.year} self-employment tax rate?
                            </h3>
                            <p className="text-slate-600">
                                The self-employment tax rate is 15.3%, consisting of 12.4% for
                                Social Security (up to ${SE_TAX_2025.socialSecurityLimit.toLocaleString()}) and 2.9% for
                                Medicare. An additional 0.9% Medicare tax applies to earnings
                                over $200,000.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                                How is self-employment tax calculated?
                            </h3>
                            <p className="text-slate-600">
                                SE tax is calculated on 92.35% of your net earnings. You can
                                deduct 50% of your SE tax when calculating your adjusted gross
                                income for federal income tax.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                                When are quarterly estimated taxes due?
                            </h3>
                            <p className="text-slate-600">
                                For {SITE.year}, quarterly estimated tax payments are due: April
                                15, June 15, September 15, and January 15 of the following year.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                                What is the {SITE.year} standard deduction?
                            </h3>
                            <p className="text-slate-600">
                                The {SITE.year} standard deduction for single filers is $
                                {SE_TAX_2025.standardDeduction.toLocaleString()}. This amount is
                                subtracted from your adjusted gross income before calculating
                                federal income tax.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <p className="mt-8 text-xs text-slate-400 text-center">
                    This calculator provides estimates for informational purposes only.
                    Consult a qualified tax professional for personalized advice.
                </p>
            </main>

            {/* Schema.org FAQPage JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: [
                            {
                                "@type": "Question",
                                name: `What is the ${SITE.year} self-employment tax rate?`,
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: `The self-employment tax rate is 15.3%, consisting of 12.4% for Social Security (up to $${SE_TAX_2025.socialSecurityLimit.toLocaleString()}) and 2.9% for Medicare.`,
                                },
                            },
                            {
                                "@type": "Question",
                                name: "How is self-employment tax calculated?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "SE tax is calculated on 92.35% of your net earnings. You can deduct 50% of your SE tax when calculating your adjusted gross income.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "When are quarterly estimated taxes due?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Quarterly estimated tax payments are due: April 15, June 15, September 15, and January 15 of the following year.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </div>
    );
}
