"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Calculator, DollarSign } from "lucide-react";
import {
    SITE,
    calculateSETax,
    formatCurrency,
    parseFormattedNumber,
    formatNumber,
} from "../site-config";

const DEFAULT_WEEKS = 48; // Assume 4 weeks vacation
const DEFAULT_HOURS = 40;
const DEFAULT_EXPENSES_RATE = 0.10; // 10% for expenses

function calculateHourlyRate(targetIncome: number, weeksPerYear: number, hoursPerWeek: number, expenseRate: number) {
    // Calculate total taxes at target income
    const taxResult = calculateSETax(targetIncome);
    const totalTax = taxResult.totalTax;
    const effectiveTaxRate = totalTax / targetIncome;

    // Calculate billable hours
    const billableHours = weeksPerYear * hoursPerWeek;
    const utilizationRate = 0.75; // Assume 75% of time is billable
    const actualBillableHours = billableHours * utilizationRate;

    // Gross income needed (target + taxes + expenses)
    const grossNeeded = targetIncome / (1 - effectiveTaxRate - expenseRate);

    // Minimum hourly rate
    const minHourlyRate = grossNeeded / actualBillableHours;

    // Break-even rate (no profit margin)
    const breakEvenRate = targetIncome / actualBillableHours;

    // Recommended rate (with 20% buffer)
    const recommendedRate = minHourlyRate * 1.2;

    return {
        targetIncome,
        totalTax,
        effectiveTaxRate: (effectiveTaxRate * 100).toFixed(1),
        billableHours: Math.round(actualBillableHours),
        grossNeeded: Math.round(grossNeeded),
        breakEvenRate: Math.round(breakEvenRate),
        minHourlyRate: Math.round(minHourlyRate),
        recommendedRate: Math.round(recommendedRate),
        annualAtRecommended: Math.round(recommendedRate * actualBillableHours),
    };
}

export default function HourlyRatePage() {
    const [income, setIncome] = useState("");
    const [weeks, setWeeks] = useState(DEFAULT_WEEKS.toString());
    const [hours, setHours] = useState(DEFAULT_HOURS.toString());
    const [result, setResult] = useState<ReturnType<typeof calculateHourlyRate> | null>(null);

    const handleCalculate = () => {
        const targetIncome = parseFormattedNumber(income);
        const weeksNum = parseInt(weeks) || DEFAULT_WEEKS;
        const hoursNum = parseInt(hours) || DEFAULT_HOURS;

        if (targetIncome > 0) {
            setResult(calculateHourlyRate(targetIncome, weeksNum, hoursNum, DEFAULT_EXPENSES_RATE));
        }
    };

    const handleInputChange = (value: string) => {
        const num = parseFormattedNumber(value);
        setIncome(num > 0 ? formatNumber(num) : "");
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
                        <TrendingUp className="w-4 h-4" />
                        Hourly Rate Calculator
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Freelance Hourly Rate Calculator
                    </h1>
                    <p className="text-gray-600">
                        Calculate the hourly rate you need to meet your income goals
                    </p>
                </div>

                {/* Calculator Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Annual Take-Home Income
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="text"
                                    value={income}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                                    className="w-full pl-8 pr-4 py-4 text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="80,000"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">How much you want to take home after taxes</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weeks per Year
                                </label>
                                <input
                                    type="number"
                                    value={weeks}
                                    onChange={(e) => setWeeks(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="48"
                                />
                                <p className="text-xs text-gray-500 mt-1">Account for vacation</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hours per Week
                                </label>
                                <input
                                    type="number"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="40"
                                />
                                <p className="text-xs text-gray-500 mt-1">Total work hours</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-5 h-5" />
                        Calculate Hourly Rate
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <>
                        {/* Rate Cards */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-100 rounded-2xl p-5 text-center">
                                <p className="text-sm text-gray-600 mb-1">Break-Even Rate</p>
                                <div className="text-2xl font-bold text-gray-700">${result.breakEvenRate}/hr</div>
                                <p className="text-xs text-gray-500 mt-1">No taxes/expenses</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-center text-white">
                                <p className="text-sm text-indigo-200 mb-1">Minimum Rate</p>
                                <div className="text-3xl font-bold">${result.minHourlyRate}/hr</div>
                                <p className="text-xs text-indigo-200 mt-1">Covers taxes + expenses</p>
                            </div>
                            <div className="bg-green-600 rounded-2xl p-5 text-center text-white">
                                <p className="text-sm text-green-200 mb-1">Recommended Rate</p>
                                <div className="text-2xl font-bold">${result.recommendedRate}/hr</div>
                                <p className="text-xs text-green-200 mt-1">+20% buffer</p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Calculation Breakdown</h3>
                            </div>
                            <div className="divide-y">
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Target Take-Home</span>
                                    <span className="font-medium">{formatCurrency(result.targetIncome)}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Estimated Taxes ({result.effectiveTaxRate}%)</span>
                                    <span className="text-red-600">+{formatCurrency(result.totalTax)}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Business Expenses (10%)</span>
                                    <span className="text-red-600">+{formatCurrency(Math.round(result.grossNeeded * 0.1))}</span>
                                </div>
                                <div className="p-4 flex justify-between bg-gray-50">
                                    <span className="font-semibold text-gray-900">Gross Revenue Needed</span>
                                    <span className="font-semibold">{formatCurrency(result.grossNeeded)}</span>
                                </div>
                                <div className="p-4 flex justify-between">
                                    <span className="text-gray-600">Billable Hours (75% utilization)</span>
                                    <span className="font-medium">{result.billableHours} hrs/year</span>
                                </div>
                                <div className="p-4 flex justify-between bg-indigo-50">
                                    <span className="font-bold text-gray-900">Minimum Hourly Rate</span>
                                    <span className="font-bold text-indigo-600 text-xl">${result.minHourlyRate}/hr</span>
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
                            <h3 className="font-semibold text-gray-900 mb-2">Why is my hourly rate so high?</h3>
                            <p className="text-gray-600 text-sm">
                                As a freelancer, you pay both employer and employee portions of taxes (15.3% SE tax), plus you have business expenses. You also can't bill 100% of your time.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">What is utilization rate?</h3>
                            <p className="text-gray-600 text-sm">
                                Utilization rate is the percentage of your work time that's actually billable. Industry average is 60-80%. Non-billable time includes admin, marketing, and learning.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Should I charge more than the minimum?</h3>
                            <p className="text-gray-600 text-sm">
                                Yes! The minimum rate is the break-even point. Add a buffer for slow months, retirement savings, and profit margin. We recommend at least 20% above minimum.
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
                                name: "How do I calculate my freelance hourly rate?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Divide your target annual income (plus taxes and expenses) by your expected billable hours. Account for time spent on non-billable work like marketing and admin.",
                                },
                            },
                        ],
                    }),
                }}
            />
        </main>
    );
}
