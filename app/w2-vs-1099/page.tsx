"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, CheckCircle2 } from "lucide-react";
import {
    SITE,
    SE_TAX_2025,
    TAX_BRACKETS_2025,
    formatCurrency,
    parseFormattedNumber,
    formatNumber,
} from "../site-config";

// W2 FICA rates (employee portion only)
const W2_FICA = {
    socialSecurityRate: 0.062, // 6.2% employee portion
    medicareRate: 0.0145, // 1.45% employee portion
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: 200000,
};

function calculateW2Tax(salary: number) {
    // FICA (employee portion)
    const ssTax = Math.min(salary, SE_TAX_2025.socialSecurityLimit) * W2_FICA.socialSecurityRate;
    const medicareTax = salary * W2_FICA.medicareRate;
    const additionalMedicare = salary > W2_FICA.additionalMedicareThreshold
        ? (salary - W2_FICA.additionalMedicareThreshold) * W2_FICA.additionalMedicareRate
        : 0;
    const totalFICA = ssTax + medicareTax + additionalMedicare;

    // Federal tax
    const taxableIncome = Math.max(0, salary - SE_TAX_2025.standardDeduction);
    let federalTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of TAX_BRACKETS_2025) {
        if (remainingIncome <= 0) break;
        const bracketWidth = bracket.max - bracket.min;
        const taxableInBracket = Math.min(remainingIncome, bracketWidth);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }

    const totalTax = totalFICA + federalTax;
    const netPay = salary - totalTax;

    return {
        grossIncome: salary,
        fica: Math.round(totalFICA),
        federalTax: Math.round(federalTax),
        totalTax: Math.round(totalTax),
        netPay: Math.round(netPay),
        effectiveRate: ((totalTax / salary) * 100).toFixed(1),
    };
}

function calculate1099Tax(income: number) {
    const { socialSecurityRate, socialSecurityLimit, medicareRate, additionalMedicareRate, additionalMedicareThreshold, netEarningsMultiplier, deductionRate, standardDeduction } = SE_TAX_2025;

    const netEarnings = income * netEarningsMultiplier;
    const ssTax = Math.min(netEarnings, socialSecurityLimit) * socialSecurityRate;
    const medicareTax = netEarnings * medicareRate;
    const additionalMedicare = netEarnings > additionalMedicareThreshold
        ? (netEarnings - additionalMedicareThreshold) * additionalMedicareRate
        : 0;
    const totalSETax = ssTax + medicareTax + additionalMedicare;
    const seDeduction = totalSETax * deductionRate;

    const taxableIncome = Math.max(0, income - seDeduction - standardDeduction);
    let federalTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of TAX_BRACKETS_2025) {
        if (remainingIncome <= 0) break;
        const bracketWidth = bracket.max - bracket.min;
        const taxableInBracket = Math.min(remainingIncome, bracketWidth);
        federalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }

    const totalTax = totalSETax + federalTax;
    const netPay = income - totalTax;

    return {
        grossIncome: income,
        seTax: Math.round(totalSETax),
        federalTax: Math.round(federalTax),
        totalTax: Math.round(totalTax),
        netPay: Math.round(netPay),
        effectiveRate: ((totalTax / income) * 100).toFixed(1),
    };
}

export default function W2vs1099Page() {
    const [income, setIncome] = useState("");
    const [w2Result, setW2Result] = useState<ReturnType<typeof calculateW2Tax> | null>(null);
    const [result1099, setResult1099] = useState<ReturnType<typeof calculate1099Tax> | null>(null);

    const handleCalculate = () => {
        const amount = parseFormattedNumber(income);
        if (amount > 0) {
            setW2Result(calculateW2Tax(amount));
            setResult1099(calculate1099Tax(amount));
        }
    };

    const handleInputChange = (value: string) => {
        const num = parseFormattedNumber(value);
        setIncome(num > 0 ? formatNumber(num) : "");
    };

    const difference = w2Result && result1099 ? w2Result.netPay - result1099.netPay : 0;
    const breakEvenRate = w2Result && result1099 && result1099.grossIncome > 0
        ? ((result1099.grossIncome + difference) / result1099.grossIncome * 100).toFixed(0)
        : "0";

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
                        <Calculator className="w-4 h-4" />
                        W2 vs 1099 Calculator
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        W2 Employee vs 1099 Contractor
                    </h1>
                    <p className="text-gray-600">
                        Compare your take-home pay as a W2 employee vs 1099 contractor
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Income
                    </label>
                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="text"
                            value={income}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                            className="w-full pl-8 pr-4 py-4 text-2xl font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="100,000"
                        />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Enter the same amount for both scenarios to compare
                    </p>
                    <button
                        onClick={handleCalculate}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Compare Tax Scenarios
                    </button>
                </div>

                {/* Results */}
                {w2Result && result1099 && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {/* W2 Card */}
                            <div className="bg-blue-600 text-white rounded-2xl p-6">
                                <h3 className="text-lg font-medium opacity-90 mb-1">W2 Employee</h3>
                                <div className="text-4xl font-bold mb-2">{formatCurrency(w2Result.netPay)}</div>
                                <p className="text-sm opacity-80">Take-home pay • {w2Result.effectiveRate}% effective rate</p>
                            </div>

                            {/* 1099 Card */}
                            <div className="bg-orange-500 text-white rounded-2xl p-6">
                                <h3 className="text-lg font-medium opacity-90 mb-1">1099 Contractor</h3>
                                <div className="text-4xl font-bold mb-2">{formatCurrency(result1099.netPay)}</div>
                                <p className="text-sm opacity-80">Take-home pay • {result1099.effectiveRate}% effective rate</p>
                            </div>
                        </div>

                        {/* Difference Alert */}
                        <div className={`rounded-xl p-4 mb-6 ${difference > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-orange-50 border border-orange-200'}`}>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className={`w-6 h-6 mt-0.5 ${difference > 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {difference > 0 ? 'W2 saves you' : '1099 saves you'} {formatCurrency(Math.abs(difference))}/year
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        As a 1099 contractor, you'd need to charge <strong>{breakEvenRate}%</strong> of a W2 salary to break even on take-home pay.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Comparison Table */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Tax Breakdown Comparison</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-sm text-gray-600">
                                        <tr>
                                            <th className="text-left p-4 font-medium">Item</th>
                                            <th className="text-right p-4 font-medium text-blue-600">W2</th>
                                            <th className="text-right p-4 font-medium text-orange-600">1099</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="p-4 text-gray-600">Gross Income</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(w2Result.grossIncome)}</td>
                                            <td className="p-4 text-right font-medium">{formatCurrency(result1099.grossIncome)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600">FICA / SE Tax</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(w2Result.fica)}</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(result1099.seTax)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600">Federal Income Tax</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(w2Result.federalTax)}</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(result1099.federalTax)}</td>
                                        </tr>
                                        <tr className="bg-gray-50 font-semibold">
                                            <td className="p-4 text-gray-900">Total Tax</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(w2Result.totalTax)}</td>
                                            <td className="p-4 text-right text-red-600">-{formatCurrency(result1099.totalTax)}</td>
                                        </tr>
                                        <tr className="font-bold text-lg">
                                            <td className="p-4 text-gray-900">Net Take-Home</td>
                                            <td className="p-4 text-right text-blue-600">{formatCurrency(w2Result.netPay)}</td>
                                            <td className="p-4 text-right text-orange-600">{formatCurrency(result1099.netPay)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
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
                            <h3 className="font-semibold text-gray-900 mb-2">Why do 1099 contractors pay more in taxes?</h3>
                            <p className="text-gray-600 text-sm">
                                1099 contractors pay both the employer and employee portions of Social Security and Medicare taxes (15.3% vs 7.65%). This is called self-employment tax.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">What rate should I charge as a 1099 contractor?</h3>
                            <p className="text-gray-600 text-sm">
                                To match W2 take-home pay, most contractors need to charge 25-40% more than an equivalent W2 salary. This covers the extra taxes and lack of benefits.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Does this include benefits?</h3>
                            <p className="text-gray-600 text-sm">
                                No. This calculator only compares taxes. W2 employees often receive health insurance, 401(k) matching, and other benefits worth 20-30% of salary.
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
                                name: "Why do 1099 contractors pay more in taxes?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "1099 contractors pay both the employer and employee portions of Social Security and Medicare taxes (15.3% vs 7.65%). This is called self-employment tax.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "What rate should I charge as a 1099 contractor?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "To match W2 take-home pay, most contractors need to charge 25-40% more than an equivalent W2 salary.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </main>
    );
}
