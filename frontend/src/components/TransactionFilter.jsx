import React, { useState } from 'react';

const TransactionFilter = ({ onFilter, onClear }) => {
    const [filters, setFilters] = useState({
        type: 'all',
        category: 'all',
        startDate: '',
        endDate: '',
        search: ''
    });

    const categories = {
        expense: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Other'],
        income: ['Salary', 'Sales', 'Gift', 'Other'],
        all: ['Food', 'Transport', 'Rent', 'Utilities', 'Entertainment', 'Salary', 'Sales', 'Gift', 'Other']
    };

    const handleChange = (field, value) => {
        const newFilters = {
            ...filters,
            [field]: value
        };
        
        // Reset category when type changes to 'all'
        if (field === 'type' && value === 'all') {
            newFilters.category = 'all';
        }
        
        setFilters(newFilters);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleClear = () => {
        const clearedFilters = {
            type: 'all',
            category: 'all',
            startDate: '',
            endDate: '',
            search: ''
        };
        setFilters(clearedFilters);
        onClear();
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Transactions</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Type Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select 
                        value={filters.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                        value={filters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Categories</option>
                        {categories[filters.type === 'all' ? 'all' : filters.type].map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input 
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input 
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input 
                        type="text"
                        placeholder="Search descriptions..."
                        value={filters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Action Buttons */}
                <div className="lg:col-span-5 flex gap-3 justify-end border-t pt-4">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionFilter;