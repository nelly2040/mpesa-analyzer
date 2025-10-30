import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ data }) => {
    const hasExpenses = data && Object.keys(data).length > 0;

    const chartData = {
        labels: hasExpenses ? Object.keys(data) : ['No Expenses'],
        datasets: [
            {
                label: 'Expenses by Category',
                data: hasExpenses ? Object.values(data) : [1],
                backgroundColor: hasExpenses 
                    ? [
                        '#4CAF50', '#FFC107', '#2196F3', '#F44336', 
                        '#9C27B0', '#00BCD4', '#FF9800', '#795548'
                      ]
                    : ['#E0E0E0'],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Expense Breakdown',
                font: { size: 18 }
            },
        },
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {hasExpenses ? (
                 <Doughnut data={chartData} options={options} />
            ) : (
                <div className="text-center text-gray-500 py-8">
                    <h3 className="text-lg font-semibold">Expense Breakdown</h3>
                    <p className="mt-2">No expense data to display yet.</p>
                </div>
            )}
        </div>
    );
};

export default ExpenseChart;