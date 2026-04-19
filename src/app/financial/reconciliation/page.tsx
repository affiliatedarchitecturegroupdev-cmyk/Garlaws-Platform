'use client';

import { useState, useEffect } from 'react';

interface BankTransaction {
  id: string;
  bankAccountId: string;
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  transactionDate: Date;
  transactionType: 'credit' | 'debit';
  reconciliationStatus: 'unreconciled' | 'matched' | 'manually_reconciled';
  category: string;
}

interface SystemTransaction {
  id: string;
  transactionType: string;
  amount: number;
  description: string;
  transactionDate: Date;
  status: string;
  reconciliationStatus: string;
}

export default function ReconciliationPage() {
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [systemTransactions, setSystemTransactions] = useState<SystemTransaction[]>([]);
  const [selectedBankTx, setSelectedBankTx] = useState<string | null>(null);
  const [selectedSystemTx, setSelectedSystemTx] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Fetch bank transactions
      const bankResponse = await fetch('/api/financial?action=bank_transactions&accountId=default');
      const bankData = await bankResponse.json();

      // Fetch system transactions
      const systemResponse = await fetch('/api/financial?action=transactions&tenantId=default');
      const systemData = await systemResponse.json();

      if (bankData.success) {
        setBankTransactions(bankData.data || []);
      }

      if (systemData.success) {
        setSystemTransactions(systemData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    if (!selectedBankTx || !selectedSystemTx) return;

    setReconciling(true);
    try {
      const response = await fetch('/api/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reconcile_transaction',
          transactionId: selectedSystemTx,
          bankTransactionId: selectedBankTx
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh transactions
        await fetchTransactions();
        setSelectedBankTx(null);
        setSelectedSystemTx(null);
        alert('Transactions reconciled successfully!');
      } else {
        alert('Reconciliation failed: ' + data.message);
      }
    } catch (error) {
      console.error('Reconciliation error:', error);
      alert('Reconciliation failed');
    } finally {
      setReconciling(false);
    }
  };

  const canReconcile = selectedBankTx && selectedSystemTx;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => fetch('/api/financial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sync_bank_transactions', accountId: 'default' })
              }).then(() => fetchTransactions())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sync Bank Data
            </button>
          </div>
        </div>

        {/* Reconciliation Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reconciliation Actions</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                Selected Bank Transaction: {selectedBankTx ? bankTransactions.find(tx => tx.id === selectedBankTx)?.description : 'None'}
              </p>
              <p className="text-sm text-gray-600">
                Selected System Transaction: {selectedSystemTx ? systemTransactions.find(tx => tx.id === selectedSystemTx)?.description : 'None'}
              </p>
            </div>
            <button
              onClick={handleReconcile}
              disabled={!canReconcile || reconciling}
              className={`px-6 py-2 rounded-md transition-colors ${
                canReconcile && !reconciling
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {reconciling ? 'Reconciling...' : 'Reconcile Selected'}
            </button>
          </div>
        </div>

        {/* Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Bank Transactions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Unreconciled: {bankTransactions.filter(tx => tx.reconciliationStatus === 'unreconciled').length}
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {bankTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => setSelectedBankTx(selectedBankTx === transaction.id ? null : transaction.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedBankTx === transaction.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleDateString()} • {transaction.transactionId}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'credit' ? '+' : '-'}
                          R{transaction.amount.toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.reconciliationStatus === 'unreconciled'
                            ? 'bg-yellow-100 text-yellow-800'
                            : transaction.reconciliationStatus === 'matched'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.reconciliationStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {bankTransactions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No bank transactions found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">System Transactions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Unreconciled: {systemTransactions.filter(tx => tx.reconciliationStatus !== 'fully_reconciled').length}
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {systemTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => setSelectedSystemTx(selectedSystemTx === transaction.id ? null : transaction.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSystemTx === transaction.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleDateString()} • {transaction.transactionType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}
                          R{Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.reconciliationStatus === 'fully_reconciled'
                            ? 'bg-green-100 text-green-800'
                            : transaction.reconciliationStatus === 'partially_reconciled'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.reconciliationStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {systemTransactions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No system transactions found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reconciliation History */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reconciliations</h2>
          <div className="text-center text-gray-500 py-8">
            Reconciliation history will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
}