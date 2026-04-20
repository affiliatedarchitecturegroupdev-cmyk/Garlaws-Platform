'use client';

import { useState, useEffect, useCallback } from 'react';

interface MFAFactor {
  id: string;
  type: 'totp' | 'sms' | 'email' | 'hardware' | 'biometric';
  name: string;
  isEnabled: boolean;
  isVerified: boolean;
  lastUsed?: string;
  createdAt: string;
}

interface MFAUser {
  id: string;
  userId: string;
  email: string;
  factors: MFAFactor[];
  isMFAEnabled: boolean;
  isMFARequired: boolean;
  failedAttempts: number;
  lastFailedAttempt?: string;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

interface MFAConfig {
  requireMFA: boolean;
  allowedFactors: string[];
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
}

interface MFAProviderProps {
  tenantId?: string;
}

export default function MFAProvider({ tenantId = 'default' }: MFAProviderProps) {
  const [users, setUsers] = useState<MFAUser[]>([]);
  const [config, setConfig] = useState<MFAConfig | null>(null);
  const [selectedUser, setSelectedUser] = useState<MFAUser | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupFactor, setSetupFactor] = useState<{
    type: MFAFactor['type'];
    userId: string;
  } | null>(null);

  const [newFactor, setNewFactor] = useState({
    type: 'totp' as MFAFactor['type'],
    name: ''
  });

  useEffect(() => {
    fetchMFAUsers();
    fetchMFAConfig();
  }, [tenantId]);

  const fetchMFAUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/security?action=mfa_users&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch MFA users:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchMFAConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/security?action=mfa_config&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch MFA config:', error);
    }
  }, [tenantId]);

  const enableMFAForUser = async (userId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enable_mfa_user',
          tenantId,
          userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, isMFAEnabled: true, isMFARequired: true } : user
        ));
      }
    } catch (error) {
      console.error('Failed to enable MFA for user:', error);
    }
  };

  const disableMFAForUser = async (userId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disable_mfa_user',
          tenantId,
          userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, isMFAEnabled: false, factors: [] } : user
        ));
      }
    } catch (error) {
      console.error('Failed to disable MFA for user:', error);
    }
  };

  const setupMFAFactor = async () => {
    if (!setupFactor || !newFactor.name) return;

    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup_mfa_factor',
          tenantId,
          userId: setupFactor.userId,
          factorType: newFactor.type,
          factorName: newFactor.name
        })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user =>
          user.id === setupFactor.userId ? {
            ...user,
            factors: [...user.factors, data.data.factor]
          } : user
        ));
        setShowSetupModal(false);
        setSetupFactor(null);
        setNewFactor({ type: 'totp', name: '' });
      }
    } catch (error) {
      console.error('Failed to setup MFA factor:', error);
    }
  };

  const removeMFAFactor = async (userId: string, factorId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_mfa_factor',
          tenantId,
          userId,
          factorId
        })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user =>
          user.id === userId ? {
            ...user,
            factors: user.factors.filter(f => f.id !== factorId)
          } : user
        ));
      }
    } catch (error) {
      console.error('Failed to remove MFA factor:', error);
    }
  };

  const updateMFAConfig = async (updates: Partial<MFAConfig>) => {
    try {
      const response = await fetch('/api/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_mfa_config',
          tenantId,
          updates
        })
      });

      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to update MFA config:', error);
    }
  };

  const verifyMFAFactor = async (userId: string, factorId: string, code: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_mfa_factor',
          tenantId,
          userId,
          factorId,
          code
        })
      });

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user =>
          user.id === userId ? {
            ...user,
            factors: user.factors.map(f =>
              f.id === factorId ? { ...f, isVerified: true, lastUsed: new Date().toISOString() } : f
            )
          } : user
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to verify MFA factor:', error);
      return false;
    }
  };

  const getFactorIcon = (type: MFAFactor['type']) => {
    switch (type) {
      case 'totp': return '📱';
      case 'sms': return '📱';
      case 'email': return '📧';
      case 'hardware': return '🔐';
      case 'biometric': return '👆';
      default: return '🔒';
    }
  };

  const getFactorTypeName = (type: MFAFactor['type']) => {
    switch (type) {
      case 'totp': return 'Authenticator App';
      case 'sms': return 'SMS';
      case 'email': return 'Email';
      case 'hardware': return 'Hardware Token';
      case 'biometric': return 'Biometric';
      default: return type;
    }
  };

  const isUserLocked = (user: MFAUser) => {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchMFAUsers}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh Users
          </button>
        </div>
      </div>

      {/* MFA Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">MFA Configuration</h3>
        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Require MFA</label>
              <input
                type="checkbox"
                checked={config.requireMFA}
                onChange={(e) => updateMFAConfig({ requireMFA: e.target.checked })}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Failed Attempts</label>
              <input
                type="number"
                value={config.maxFailedAttempts}
                onChange={(e) => updateMFAConfig({ maxFailedAttempts: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
              <input
                type="number"
                value={config.lockoutDurationMinutes}
                onChange={(e) => updateMFAConfig({ lockoutDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="1440"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={config.sessionTimeoutMinutes}
                onChange={(e) => updateMFAConfig({ sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="5"
                max="480"
              />
            </div>
          </div>
        )}
      </div>

      {/* MFA Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MFA Enabled Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.isMFAEnabled).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total MFA Factors</p>
              <p className="text-2xl font-bold text-green-600">
                {users.reduce((sum, u) => sum + u.factors.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locked Accounts</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => isUserLocked(u)).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MFA Required Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.isMFARequired).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">ID: {user.userId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isMFAEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isMFAEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      {user.isMFARequired && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Required
                        </span>
                      )}
                      {isUserLocked(user) && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Locked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {user.factors.map(factor => (
                        <span
                          key={factor.id}
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            factor.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                          title={factor.name}
                        >
                          {getFactorIcon(factor.type)} {getFactorTypeName(factor.type)}
                        </span>
                      ))}
                      {user.factors.length === 0 && (
                        <span className="text-gray-400">No factors</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.failedAttempts}</div>
                    {user.lastFailedAttempt && (
                      <div className="text-xs text-gray-500">
                        Last: {new Date(user.lastFailedAttempt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {!user.isMFAEnabled ? (
                        <button
                          onClick={() => enableMFAForUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          onClick={() => disableMFAForUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Disable
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSetupFactor({ type: 'totp', userId: user.id });
                          setShowSetupModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Setup
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Setup MFA Modal */}
      {showSetupModal && setupFactor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Setup MFA Factor</h3>
              <button
                onClick={() => {
                  setShowSetupModal(false);
                  setSetupFactor(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Factor Type</label>
                  <select
                    value={newFactor.type}
                    onChange={(e) => setNewFactor({...newFactor, type: e.target.value as MFAFactor['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="totp">Authenticator App (TOTP)</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="hardware">Hardware Token</option>
                    <option value="biometric">Biometric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Factor Name</label>
                  <input
                    type="text"
                    value={newFactor.name}
                    onChange={(e) => setNewFactor({...newFactor, name: e.target.value})}
                    placeholder="e.g., My iPhone Authenticator"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {newFactor.type === 'totp' && (
                    <>
                      <p>1. Download an authenticator app (Google Authenticator, Authy, etc.)</p>
                      <p>2. Click "Setup" to generate a QR code</p>
                      <p>3. Scan the QR code with your authenticator app</p>
                      <p>4. Enter the 6-digit code to verify</p>
                    </>
                  )}
                  {newFactor.type === 'sms' && (
                    <>
                      <p>1. Ensure your phone number is verified</p>
                      <p>2. Click "Setup" to send a test SMS</p>
                      <p>3. Enter the code received via SMS</p>
                    </>
                  )}
                  {newFactor.type === 'email' && (
                    <>
                      <p>1. Ensure your email address is verified</p>
                      <p>2. Click "Setup" to send a test email</p>
                      <p>3. Enter the code received via email</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSetupModal(false);
                  setSetupFactor(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={setupMFAFactor}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!newFactor.name}
              >
                Setup Factor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">MFA Details: {selectedUser.email}</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">User Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>MFA Enabled:</span>
                    <span className={selectedUser.isMFAEnabled ? 'text-green-600' : 'text-red-600'}>
                      {selectedUser.isMFAEnabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MFA Required:</span>
                    <span className={selectedUser.isMFARequired ? 'text-green-600' : 'text-gray-600'}>
                      {selectedUser.isMFARequired ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Attempts:</span>
                    <span className={selectedUser.failedAttempts > 0 ? 'text-red-600' : 'text-green-600'}>
                      {selectedUser.failedAttempts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Locked:</span>
                    <span className={isUserLocked(selectedUser) ? 'text-red-600' : 'text-green-600'}>
                      {isUserLocked(selectedUser) ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">MFA Factors</h4>
                <div className="space-y-3">
                  {selectedUser.factors.map(factor => (
                    <div key={factor.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getFactorIcon(factor.type)}</span>
                            <span className="font-medium">{factor.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {getFactorTypeName(factor.type)}
                          </div>
                          {factor.lastUsed && (
                            <div className="text-xs text-gray-500 mt-1">
                              Last used: {new Date(factor.lastUsed).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            factor.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {factor.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                          <button
                            onClick={() => removeMFAFactor(selectedUser.id, factor.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedUser.factors.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No MFA factors configured</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}