"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Calendar, AlertCircle } from "lucide-react";
import {
    SITE,
    calculateSETax,
    formatCurrency,
    parseFormattedNumber,
    formatNumber,
} from "../site-config";

// 2025 Quarterly Tax Deadlines
const QUARTERLY_DEADLINES = [
    { quarter: "Q1", period: "Jan 1 - Mar 31", deadline: "April 15, 2025", date: new Date(2025, 3, 15) },
    { quarter: "Q2", period: "Apr 1 - May 31", deadline: "June 16, 2025", date: new Date(2025, 5, 16) },
    { quarter: "Q3", period: "Jun 1 - Aug 31", deadline: "September 15, 2025", date: new Date(2025, 8, 15) },
    { quarter: "Q4", period: "Sep 1 - Dec 31", deadline: "January 15, 2026", date: new Date(2026, 0, 15) },
];

function getCurrentQuarter(): number {
    const now = new Date();
    const month = now.getMonth();
    if (month < 3) return 1;
    if (month < 6) return 2;
    if (month < 9) return 3;
    return 4;
}

function getRemainingQuarters(): number {
    return 5 - getCurrentQuarter(); // Quarters remaining including current
}

export default function QuarterlyTaxPage() {
    const [income, setIncome] = useState("");
    const [alreadyPaid, setAlreadyPaid] = useState("");
    const [result, setResult] = useState<{
        totalTax: number;
        quarterlyPayment: number;
        remainingPayment: number;
        paymentsLeft: number;
    } | null>(null);

    const currentQuarter = getCurrentQuarter();
    const remainingQuarters = getRemainingQuarters();

    const handleCalculate = () => {
        const amount = parseFormattedNumber(income);
        const paid = parseFormattedNumber(alreadyPaid);
        if (amount > 0) {
            const taxResult = calculateSETax(amount);
            const remainingTax = Math.max(0, taxResult.totalTax - paid);
            const paymentPerQuarter = Math.ceil(remainingTax / remainingQuarters);

            setResult({
                totalTax: taxResult.totalTax,
                quarterlyPayment: taxResult.quarterlyPayment,
                remainingPayment: paymentPerQuarter,
                paymentsLeft: remainingQuarters,
            });
        }
    };

    const handleInputChange = (value: string, setter: (v: string) => void) => {
        const num = parseFormattedNumber(value);
        setter(num > 0 ? formatNumber(num) : "");
    };

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
                        <Calendar className="w-4 h-4" />
                        Quarterly Tax Calculator
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {SITE.year} Quarterly Estimated Tax Calculator
                    </h1>
                    <p className="text-gray-600">
                        Calculate your quarterly estimated tax payments (Form 1040-ES)
                    </p>
                </div>

                {/* Current Quarter Alert */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-800">
                            <strong>Current: Q{currentQuarter}</strong> • Next deadline: {QUARTERLY_DEADLINES[currentQuarter - 1]?.deadline}
                        </p>
                    </div>
                </div>

                {/* Calculator Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Annual Income ({SITE.year})
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={income}
                                    onChange={(e) => handleInputChange(e.target.value, setIncome)}
                                    className="w-full pl-8 pr-4 py-4 text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="100,000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Already Paid This Year (optional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={alreadyPaid}
                                    onChange={(e) => handleInputChange(e.target.value, setAlreadyPaid)}
                                    className="w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Calculate Quarterly Payments
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <>
                        {/* Summary */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl p-6 mb-6">
                            <p className="text-indigo-200 text-sm mb-1">Recommended Quarterly Payment</p>
                            <div className="text-4xl font-bold mb-2">{formatCurrency(result.remainingPayment)}</div>
                            <p className="text-indigo-200 text-sm">
                                {result.paymentsLeft} payment(s) remaining • Total tax: {formatCurrency(result.totalTax)}
                            </p>
                        </div>

                        {/* Payment Schedule */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900">{SITE.year} Payment Schedule</h3>
                            </div>
                            <div className="divide-y">
                                {QUARTERLY_DEADLINES.map((q, i) => {
                                    const isPast = i + 1 < currentQuarter;
                                    const isCurrent = i + 1 === currentQuarter;
                                    return (
                                        <div key={q.quarter} className={`p-4 flex items-center justify-between ${isPast ? 'bg-gray-50 opacity-60' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${isCurrent ? 'bg-indigo-600 text-white' : isPast ? 'bg-gray-300 text-gray-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                    {q.quarter}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{q.deadline}</div>
                                                    <div className="text-sm text-gray-500">{q.period}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isPast ? (
                                                    <span className="text-gray-400 text-sm">Past</span>
                                                ) : (
                                                    <span className="font-semibold text-gray-900">{formatCurrency(result.remainingPayment)}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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
                            <h3 className="font-semibold text-gray-900 mb-2">Who needs to pay quarterly estimated taxes?</h3>
                            <p className="text-gray-600 text-sm">
                                Self-employed individuals, freelancers, and anyone who expects to owe $1,000 or more in taxes should pay quarterly estimated taxes.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">What happens if I miss a payment?</h3>
                            <p className="text-gray-600 text-sm">
                                The IRS may charge an underpayment penalty. However, you can avoid penalties by paying at least 90% of this year's tax or 100% of last year's tax.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">How do I pay quarterly taxes?</h3>
                            <p className="text-gray-600 text-sm">
                                You can pay online at IRS.gov/payments, by phone, or by mail using Form 1040-ES vouchers.
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
                                name: "Who needs to pay quarterly estimated taxes?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Self-employed individuals, freelancers, and anyone who expects to owe $1,000 or more in taxes should pay quarterly estimated taxes.",
                                },
                            },
                            {
                                "@type": "Question",
                                name: "What happens if I miss a quarterly tax payment?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "The IRS may charge an underpayment penalty. You can avoid penalties by paying at least 90% of this year's tax or 100% of last year's tax.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </main>
    );
}
