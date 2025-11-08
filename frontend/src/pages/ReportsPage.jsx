import React, { useState, useEffect, useCallback } from 'react'; // ADD useCallback
import Navbar from '../components/Navbar';
import transactionService from '../services/transactionService';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('monthly');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    // USE useCallback TO FIX THE DEPENDENCY WARNING
    const generateReport = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const filters = { year };
            if (reportType === 'monthly') {
                filters.month = month;
            }

            const data = reportType === 'monthly' 
                ? await transactionService.getMonthlyReport(filters)
                : await transactionService.getYearlyReport(filters);
                
            setReportData(data);
        } catch (error) {
            console.error('Failed to generate report:', error);
            setError('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [reportType, year, month]); // ADD DEPENDENCIES HERE

    useEffect(() => {
        generateReport();
    }, [generateReport]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    const formatPercentage = (value, total) => {
        if (total === 0) return '0%';
        return `${((value / total) * 100).toFixed(1)}%`;
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Report Controls */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Report Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                                <select 
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="monthly">Monthly Report</option>
                                    <option value="yearly">Yearly Report</option>
                                </select>
                            </div>

                            {/* Year Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select 
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Month Selector (only for monthly reports) */}
                            {reportType === 'monthly' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <select 
                                        value={month}
                                        onChange={(e) => setMonth(parseInt(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Generate Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={generateReport}
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Report Content */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500 text-lg">Generating report...</p>
                            </div>
                        </div>
                    ) : reportData && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                                    <h3 className="text-lg font-medium text-gray-900">Total Income</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(reportData.summary.totalIncome)}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                                    <h3 className="text-lg font-medium text-gray-900">Total Expenses</h3>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(reportData.summary.totalExpenses)}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                                    <h3 className="text-lg font-medium text-gray-900">Net Balance</h3>
                                    <p className={`text-2xl font-bold ${
                                        reportData.summary.netProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(reportData.summary.netProfitLoss)}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                                    <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {reportData.summary.transactionCount}
                                    </p>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Income by Category */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Income by Category</h3>
                                    {Object.keys(reportData.incomeByCategory).length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(reportData.incomeByCategory)
                                                .sort(([,a], [,b]) => b - a)
                                                .map(([category, amount]) => (
                                                    <div key={category} className="flex justify-between items-center">
                                                        <span className="text-gray-700">{category}</span>
                                                        <div className="text-right">
                                                            <span className="font-semibold text-green-600">
                                                                {formatCurrency(amount)}
                                                            </span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                {formatPercentage(amount, reportData.summary.totalIncome)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No income data</p>
                                    )}
                                </div>

                                {/* Expenses by Category */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
                                    {Object.keys(reportData.expenseByCategory).length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(reportData.expenseByCategory)
                                                .sort(([,a], [,b]) => b - a)
                                                .map(([category, amount]) => (
                                                    <div key={category} className="flex justify-between items-center">
                                                        <span className="text-gray-700">{category}</span>
                                                        <div className="text-right">
                                                            <span className="font-semibold text-red-600">
                                                                {formatCurrency(amount)}
                                                            </span>
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                {formatPercentage(amount, reportData.summary.totalExpenses)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No expense data</p>
                                    )}
                                </div>
                            </div>

                            {/* Monthly Breakdown (for yearly reports) */}
                            {reportType === 'yearly' && reportData.monthlyBreakdown && (
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {Object.entries(reportData.monthlyBreakdown).map(([month, data]) => (
                                                    <tr key={month}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.monthName}</td>
                                                        <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(data.income)}</td>
                                                        <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(data.expenses)}</td>
                                                        <td className={`px-4 py-3 text-sm font-medium ${
                                                            data.net >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {formatCurrency(data.net)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{data.transactionCount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;