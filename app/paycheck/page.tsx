"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, Calculator } from "lucide-react";
import {
    SITE,
    SE_TAX_2025,
    TAX_BRACKETS_2025,
    formatCurrency,
    parseFormattedNumber,
    formatNumber,
} from "../site-config";

// Pay frequencies
const PAY_FREQUENCIES = [
    { id: "weekly", label: "Weekly", periods: 52 },
    { id: "biweekly", label: "Bi-weekly", periods: 26 },
    { id: "semimonthly", label: "Semi-monthly", periods: 24 },
    { id: "monthly", label: "Monthly", periods: 12 },
];

// W2 FICA rates (employee portion)
const W2_FICA = {
    socialSecurityRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: 200000,
};

function calculatePaycheck(annualSalary: number, payPeriods: number) {
    const grossPayPerPeriod = annualSalary / payPeriods;

    // Annual FICA calculation
    const annualSS = Math.min(annualSalary, SE_TAX_2025.socialSecurityLimit) * W2_FICA.socialSecurityRate;
    const annualMedicare = annualSalary * W2_FICA.medicareRate;
    const annualAdditionalMedicare = annualSalary > W2_FICA.additionalMedicareThreshold
        ? (annualSalary - W2_FICA.additionalMedicareThreshold) * W2_FICA.additionalMedicareRate
        : 0;
    const annualFICA = annualSS + annualMedicare + annualAdditionalMedicare;

    // Per-period FICA
    const ficaPerPeriod = annualFICA / payPeriods;
    const ssPerPeriod = annualSS / payPeriods;
    const medicarePerPeriod = (annualMedicare + annualAdditionalMedicare) / payPeriods;

    // Federal tax calculation
    const taxableIncome = Math.max(0, annualSalary - SE_TAX_2025.standardDeduction);
    let annualFederalTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of TAX_BRACKETS_2025) {
        if (remainingIncome <= 0) break;
        const bracketWidth = bracket.max - bracket.min;
        const taxableInBracket = Math.min(remainingIncome, bracketWidth);
        annualFederalTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
    }

    const federalTaxPerPeriod = annualFederalTax / payPeriods;
    const totalDeductions = ficaPerPeriod + federalTaxPerPeriod;
    const netPay = grossPayPerPeriod - totalDeductions;

    return {
        grossPay: Math.round(grossPayPerPeriod * 100) / 100,
        socialSecurity: Math.round(ssPerPeriod * 100) / 100,
        medicare: Math.round(medicarePerPeriod * 100) / 100,
        federalTax: Math.round(federalTaxPerPeriod * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netPay: Math.round(netPay * 100) / 100,
        annualGross: annualSalary,
        annualNet: Math.round(netPay * payPeriods),
        effectiveRate: ((annualFederalTax + annualFICA) / annualSalary * 100).toFixed(1),
    };
}

export default function PaycheckPage() {
    const [salary, setSalary] = useState("");
    const [frequency, setFrequency] = useState("biweekly");
    const [result, setResult] = useState<ReturnType<typeof calculatePaycheck> | null>(null);

    const handleCalculate = () => {
        const amount = parseFormattedNumber(salary);
        const freq = PAY_FREQUENCIES.find(f => f.id === frequency);
        if (amount > 0 && freq) {
            setResult(calculatePaycheck(amount, freq.periods));
        }
    };

    const handleInputChange = (value: string) => {
        const num = parseFormattedNumber(value);
        setSalary(num > 0 ? formatNumber(num) : "");
    };

    const selectedFrequency = PAY_FREQUENCIES.find(f => f.id === frequency);

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
                        <Wallet className="w-4 h-4" />
                        Paycheck Calculator
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {SITE.year} Paycheck Calculator
                    </h1>
                    <p className="text-gray-600">
                        Calculate your net pay after federal taxes and FICA
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Annual Salary
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={salary}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                                    className="w-full pl-8 pr-4 py-4 text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="75,000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pay Frequency
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {PAY_FREQUENCIES.map((freq) => (
                                    <button
                                        key={freq.id}
                                        type="button"
                                        onClick={() => setFrequency(freq.id)}
                                        className={`py-3 px-4 rounded-xl border font-medium transition ${frequency === freq.id
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"
                                            }`}
                                    >
                                        {freq.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {selectedFrequency?.periods} pay periods per year
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Calculate Paycheck
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <>
                        {/* Summary */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 mb-6">
                            <p className="text-green-200 text-sm mb-1">Your {selectedFrequency?.label} Take-Home Pay</p>
                            <div className="text-4xl font-bold mb-2">${result.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <p className="text-green-200 text-sm">
                                {result.effectiveRate}% effective tax rate • {formatCurrency(result.annualNet)}/year net
                            </p>
                        </div>

                        {/* Breakdown */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Paycheck Breakdown ({selectedFrequency?.label})</h3>
                            </div>
                            <div className="divide-y">
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Gross Pay</span>
                                    <span className="font-semibold text-gray-900">${result.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Social Security (6.2%)</span>
                                    <span className="text-red-600">-${result.socialSecurity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Medicare (1.45%)</span>
                                    <span className="text-red-600">-${result.medicare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Federal Income Tax</span>
                                    <span className="text-red-600">-${result.federalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-4 flex justify-between bg-gray-50">
                                    <span className="font-semibold text-gray-900">Total Deductions</span>
                                    <span className="font-semibold text-red-600">-${result.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="p-4 flex justify-between bg-green-50">
                                    <span className="font-bold text-gray-900 text-lg">Net Pay</span>
                                    <span className="font-bold text-green-600 text-lg">${result.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
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
                            <h3 className="font-semibold text-gray-900 mb-2">What taxes are taken out of my paycheck?</h3>
                            <p className="text-gray-600 text-sm">
                                Federal income tax, Social Security (6.2%), and Medicare (1.45%). State and local taxes vary by location.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Why is my actual paycheck different?</h3>
                            <p className="text-gray-600 text-sm">
                                This calculator estimates federal taxes only. Your actual paycheck may include state taxes, health insurance, 401(k) contributions, and other deductions.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">What is the standard deduction for {SITE.year}?</h3>
                            <p className="text-gray-600 text-sm">
                                The {SITE.year} standard deduction for single filers is ${SE_TAX_2025.standardDeduction.toLocaleString()}.
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
                                name: "What taxes are taken out of my paycheck?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Federal income tax, Social Security (6.2%), and Medicare (1.45%). State and local taxes vary by location.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </main>
    );
}
