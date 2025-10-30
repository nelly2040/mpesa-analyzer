import React from 'react';

// Reusable currency formatting function
const formatCurrency = (amount) => {
    return `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SummaryCard = ({ title, amount, colorClass }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{formatCurrency(amount)}</p>
        </div>
    );
};

const DashboardSummary = ({ summary }) => {
    if (!summary) {
        return <p>Loading summary...</p>;
    }

    const { totalIncome, totalExpenses, netProfitLoss } = summary;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SummaryCard title="Total Income" amount={totalIncome} colorClass="text-green-600" />
            <SummaryCard title="Total Expenses" amount={totalExpenses} colorClass="text-red-600" />
            <SummaryCard 
                title="Net Profit / Loss" 
                amount={netProfitLoss} 
                colorClass={netProfitLoss >= 0 ? "text-blue-600" : "text-red-600"} 
            />
        </div>
    );
};

export default DashboardSummary;