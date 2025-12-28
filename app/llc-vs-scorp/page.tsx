"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Calculator, CheckCircle2, AlertTriangle } from "lucide-react";
import {
    SITE,
    SE_TAX_2025,
    TAX_BRACKETS_2025,
    calculateSETax,
    formatCurrency,
    parseFormattedNumber,
    formatNumber,
} from "../site-config";

// S-Corp reasonable salary rules
const SCORP_MIN_SALARY_PERCENT = 0.40; // IRS guidelines suggest 40-60%
const SCORP_COMPLEXITY_COST = 3000; // Annual accounting/payroll costs

function calculateFederalTax(taxableIncome: number): number {
    let federalTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of TAX_BRACKETS_2025) {
        if (remainingIncome <= 0) break;
        const bracketWidth = bracket.max - bracket.min;
        const taxableInBracket = Math.min(remainingIncome, bracketWidth);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }

    return federalTax;
}

function calculateLLCTax(income: number) {
    const result = calculateSETax(income);
    return {
        seTax: result.totalSETax,
        federalTax: result.federalTax,
        totalTax: result.totalTax,
        netIncome: income - result.totalTax,
    };
}

function calculateSCorpTax(income: number, salary: number) {
    // Employee FICA on salary (7.65% employee + 7.65% employer)
    const employeeFICA = salary * 0.0765;
    const employerFICA = salary * 0.0765;
    const totalFICA = employeeFICA + employerFICA;

    // Remaining income is distribution (no SE tax)
    const distribution = income - salary - employerFICA;

    // Taxable income (salary + distribution - standard deduction)
    const taxableIncome = Math.max(0, salary + distribution - SE_TAX_2025.standardDeduction);
    const federalTax = calculateFederalTax(taxableIncome);

    // Total tax = FICA + Federal + S-Corp costs
    const totalTax = totalFICA + federalTax + SCORP_COMPLEXITY_COST;
    const netIncome = income - totalTax;

    return {
        salary,
        distribution: Math.max(0, distribution),
        employeeFICA: Math.round(employeeFICA),
        employerFICA: Math.round(employerFICA),
        totalFICA: Math.round(totalFICA),
        federalTax: Math.round(federalTax),
        scorphCosts: SCORP_COMPLEXITY_COST,
        totalTax: Math.round(totalTax),
        netIncome: Math.round(netIncome),
    };
}

export default function LLCvsSCorpPage() {
    const [income, setIncome] = useState("");
    const [salary, setSalary] = useState("");
    const [llcResult, setLLCResult] = useState<ReturnType<typeof calculateLLCTax> | null>(null);
    const [scorpResult, setSCorpResult] = useState<ReturnType<typeof calculateSCorpTax> | null>(null);

    const handleCalculate = () => {
        const totalIncome = parseFormattedNumber(income);
        let reasonableSalary = parseFormattedNumber(salary);

        // Default to 40% if no salary specified
        if (!reasonableSalary && totalIncome > 0) {
            reasonableSalary = Math.round(totalIncome * SCORP_MIN_SALARY_PERCENT);
            setSalary(formatNumber(reasonableSalary));
        }

        if (totalIncome > 0 && reasonableSalary > 0) {
            setLLCResult(calculateLLCTax(totalIncome));
            setSCorpResult(calculateSCorpTax(totalIncome, reasonableSalary));
        }
    };

    const handleInputChange = (value: string, setter: (v: string) => void) => {
        const num = parseFormattedNumber(value);
        setter(num > 0 ? formatNumber(num) : "");
    };

    const savings = llcResult && scorpResult ? llcResult.totalTax - scorpResult.totalTax : 0;
    const scorpWorthIt = savings > SCORP_COMPLEXITY_COST;

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">{SITE.name}</span>
                    </Link>
                    <span className="text-sm text-indigo-600 font-medium">{SITE.year}</span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        <Home className="w-4 h-4" />
                        LLC vs S-Corp Calculator
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        LLC vs S-Corp Tax Comparison
                    </h1>
                    <p className="text-gray-600">
                        See how much you could save by electing S-Corp status
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Business Income (after expenses)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={income}
                                    onChange={(e) => handleInputChange(e.target.value, setIncome)}
                                    className="w-full pl-8 pr-4 py-4 text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="150,000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reasonable Salary (S-Corp)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={salary}
                                    onChange={(e) => handleInputChange(e.target.value, setSalary)}
                                    className="w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="60,000"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                IRS requires a "reasonable salary" (typically 40-60% of net income)
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Compare Tax Structures
                    </button>
                </div>

                {/* Results */}
                {llcResult && scorpResult && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-500 text-white rounded-2xl p-6">
                                <h3 className="text-lg font-medium opacity-90 mb-1">LLC (Self-Employment)</h3>
                                <div className="text-4xl font-bold mb-2">{formatCurrency(llcResult.totalTax)}</div>
                                <p className="text-sm opacity-80">Total tax • Net: {formatCurrency(llcResult.netIncome)}</p>
                            </div>

                            <div className="bg-blue-600 text-white rounded-2xl p-6">
                                <h3 className="text-lg font-medium opacity-90 mb-1">S-Corporation</h3>
                                <div className="text-4xl font-bold mb-2">{formatCurrency(scorpResult.totalTax)}</div>
                                <p className="text-sm opacity-80">Total tax • Net: {formatCurrency(scorpResult.netIncome)}</p>
                            </div>
                        </div>

                        {/* Savings Alert */}
                        <div className={`rounded-xl p-4 mb-6 flex items-start gap-3 ${scorpWorthIt ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                            {scorpWorthIt ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
                            )}
                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    {savings > 0 ? `S-Corp saves you ${formatCurrency(savings)}/year` : `LLC is better by ${formatCurrency(Math.abs(savings))}/year`}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    {scorpWorthIt
                                        ? "After accounting for S-Corp admin costs (~$3,000/year), S-Corp election is worth considering."
                                        : "S-Corp savings don't outweigh the complexity and costs. Stick with LLC for now."
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Detailed Comparison */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Tax Breakdown Comparison</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-sm text-gray-600">
                                        <tr>
                                            <th className="text-left p-4 font-medium">Item</th>
                                            <th className="text-right p-4 font-medium text-orange-600">LLC</th>
                                            <th className="text-right p-4 font-medium text-blue-600">S-Corp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="p-4 text-gray-600">Business Income</td>
                                            <td className="p-4 text-right">{formatCurrency(parseFormattedNumber(income))}</td>
                                            <td className="p-4 text-right">{formatCurrency(parseFormattedNumber(income))}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600">SE Tax / FICA</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(llcResult.seTax)}</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(scorpResult.totalFICA)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600">Federal Income Tax</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(llcResult.federalTax)}</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(scorpResult.federalTax)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600">S-Corp Admin Costs</td>
                                            <td className="p-4 text-right text-gray-400">—</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(SCORP_COMPLEXITY_COST)}</td>
                                        </tr>
                                        <tr className="font-semibold bg-gray-50">
                                            <td className="p-4">Total Tax + Costs</td>
                                            <td className="p-4 text-right text-orange-600">{formatCurrency(llcResult.totalTax)}</td>
                                            <td className="p-4 text-right text-blue-600">{formatCurrency(scorpResult.totalTax)}</td>
                                        </tr>
                                        <tr className="font-bold text-lg">
                                            <td className="p-4 text-gray-900">Net Income</td>
                                            <td className="p-4 text-right text-orange-600">{formatCurrency(llcResult.netIncome)}</td>
                                            <td className="p-4 text-right text-blue-600">{formatCurrency(scorpResult.netIncome)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* S-Corp Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <h4 className="font-semibold text-blue-900 mb-2">S-Corp Structure Breakdown</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-700">Salary:</span>
                                    <span className="font-medium text-blue-900 ml-2">{formatCurrency(scorpResult.salary)}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Distribution:</span>
                                    <span className="font-medium text-blue-900 ml-2">{formatCurrency(scorpResult.distribution)}</span>
                                </div>
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                                Distributions avoid the 15.3% SE tax, which is the source of S-Corp savings.
                            </p>
                        </div>

                        {/* Ad Placeholder */}
                        <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-400 text-sm mb-8">
                            Advertisement
                        </div>
                    </>
                )}

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">When does S-Corp election make sense?</h3>
                            <p className="text-gray-600 text-sm">
                                Generally, S-Corp becomes beneficial when net income exceeds $60,000-$80,000 annually. Below this threshold, the admin costs often outweigh tax savings.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">What is a "reasonable salary"?</h3>
                            <p className="text-gray-600 text-sm">
                                The IRS requires S-Corp owner-employees to pay themselves a reasonable salary for the work they perform. This is typically 40-60% of net business income, based on industry standards.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">What are the S-Corp admin costs?</h3>
                            <p className="text-gray-600 text-sm">
                                S-Corps require separate payroll, quarterly filings, and more complex tax returns. Budget $2,000-$5,000/year for accounting and compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schema.org */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: [
                            {
                                "@type": "Question",
                                name: "When does S-Corp election make sense?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Generally, S-Corp becomes beneficial when net income exceeds $60,000-$80,000 annually. Below this threshold, the admin costs often outweigh tax savings.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "What is a reasonable salary for S-Corp?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "The IRS requires S-Corp owner-employees to pay themselves a reasonable salary, typically 40-60% of net business income based on industry standards.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </main>
    );
}
