import React, { useState } from 'react';

const SmsImportModal = ({ isOpen, onClose, onImport }) => {
    const [smsText, setSmsText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleImportClick = async () => {
        setIsLoading(true);
        await onImport(smsText);
        setIsLoading(false);
        setSmsText(''); // Clear text area after import
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Import from M-Pesa SMS</h2>
                <p className="text-gray-600 mb-4">
                    Copy the transaction messages from your SMS app and paste them into the box below. The app will automatically find and import them.
                </p>
                <textarea
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    placeholder="Paste your M-Pesa SMS messages here..."
                    className="w-full h-48 p-2 border rounded resize-none"
                    disabled={isLoading}
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50">Cancel</button>
                    <button onClick={handleImportClick} disabled={isLoading || !smsText} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Importing...' : 'Import Transactions'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmsImportModal;