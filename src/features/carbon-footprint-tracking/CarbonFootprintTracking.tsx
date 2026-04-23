'use client';

import { useState, useEffect, useCallback } from 'react';

interface CarbonEmission {
  id: string;
  timestamp: Date;
  category: 'energy' | 'transport' | 'waste' | 'production' | 'supply_chain' | 'other';
  subcategory: string;
  source: string;
  amount: number; // kg CO2e
  unit: string;
  location?: string;
  activity: string;
  metadata: Record<string, any>;
}

interface EmissionFactor {
  id: string;
  category: string;
  factor: number; // kg CO2e per unit
  unit: string;
  description: string;
  source: string;
  lastUpdated: Date;
}

interface CarbonOffset {
  id: string;
  project: string;
  type: 'renewable_energy' | 'reforestation' | 'carbon_capture' | 'methane_reduction' | 'other';
  amount: number; // kg CO2e offset
  cost: number; // per tonne
  provider: string;
  certificateId?: string;
  purchaseDate: Date;
  expiryDate?: Date;
}

interface CarbonFootprint {
  period: {
    start: Date;
    end: Date;
  };
  totalEmissions: number;
  emissionsByCategory: Record<string, number>;
  emissionsByScope: {
    scope1: number; // Direct emissions
    scope2: number; // Indirect energy emissions
    scope3: number; // Supply chain emissions
  };
  offsets: number;
  netEmissions: number;
  reductionTarget?: number;
  progressToTarget?: number;
}

interface CarbonFootprintTrackingProps {
  tenantId?: string;
  onEmissionRecorded?: (emission: CarbonEmission) => void;
  onOffsetPurchased?: (offset: CarbonOffset) => void;
  onTargetUpdated?: (target: number) => void;
}

const EMISSION_FACTORS: EmissionFactor[] = [
  {
    id: 'electricity_us',
    category: 'energy',
    factor: 0.429, // kg CO2e per kWh
    unit: 'kWh',
    description: 'US average electricity grid emissions',
    source: 'EPA eGRID 2022',
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'gasoline_us',
    category: 'transport',
    factor: 8.89, // kg CO2e per gallon
    unit: 'gallon',
    description: 'US gasoline combustion emissions',
    source: 'GHG Protocol',
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'diesel_us',
    category: 'transport',
    factor: 10.21, // kg CO2e per gallon
    unit: 'gallon',
    description: 'US diesel combustion emissions',
    source: 'GHG Protocol',
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'waste_landfill',
    category: 'waste',
    factor: 0.58, // kg CO2e per kg waste
    unit: 'kg',
    description: 'Landfill waste emissions (methane)',
    source: 'IPCC Guidelines',
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'flight_domestic',
    category: 'transport',
    factor: 0.24, // kg CO2e per passenger-km
    unit: 'passenger-km',
    description: 'Domestic flight emissions',
    source: 'DEFRA 2023',
    lastUpdated: new Date('2024-01-01')
  },
  {
    id: 'server_electricity',
    category: 'energy',
    factor: 0.429, // kg CO2e per kWh (same as electricity)
    unit: 'kWh',
    description: 'Data center server electricity consumption',
    source: 'EPA eGRID 2022',
    lastUpdated: new Date('2024-01-01')
  }
];

const SAMPLE_EMISSIONS: CarbonEmission[] = [
  {
    id: 'em1',
    timestamp: new Date(Date.now() - 3600000),
    category: 'energy',
    subcategory: 'electricity',
    source: 'Office Building A',
    amount: 125.5,
    unit: 'kg CO2e',
    location: 'New York, NY',
    activity: 'Monthly electricity consumption',
    metadata: { kWh: 292, building: 'HQ', floor: 'all' }
  },
  {
    id: 'em2',
    timestamp: new Date(Date.now() - 7200000),
    category: 'transport',
    subcategory: 'business_travel',
    source: 'Employee Flights',
    amount: 875.3,
    unit: 'kg CO2e',
    location: 'Global',
    activity: 'Business travel to client meetings',
    metadata: { passengers: 5, distance: 2500, class: 'economy' }
  },
  {
    id: 'em3',
    timestamp: new Date(Date.now() - 10800000),
    category: 'waste',
    subcategory: 'office_waste',
    source: 'Office Waste',
    amount: 45.2,
    unit: 'kg CO2e',
    location: 'New York, NY',
    activity: 'Monthly waste disposal',
    metadata: { waste_type: 'mixed', disposal_method: 'landfill' }
  }
];

export default function CarbonFootprintTracking({
  tenantId = 'default',
  onEmissionRecorded,
  onOffsetPurchased,
  onTargetUpdated
}: CarbonFootprintTrackingProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'emissions' | 'offsets' | 'analytics' | 'reporting'>('dashboard');
  const [emissions, setEmissions] = useState<CarbonEmission[]>(SAMPLE_EMISSIONS);
  const [offsets, setOffsets] = useState<CarbonOffset[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>(EMISSION_FACTORS);
  const [footprint, setFootprint] = useState<CarbonFootprint | null>(null);
  const [reductionTarget, setReductionTarget] = useState(25); // 25% reduction target

  const [newEmission, setNewEmission] = useState({
    category: 'energy' as CarbonEmission['category'],
    subcategory: '',
    source: '',
    amount: 0,
    unit: 'kg CO2e',
    location: '',
    activity: ''
  });

  const [newOffset, setNewOffset] = useState({
    project: '',
    type: 'renewable_energy' as CarbonOffset['type'],
    amount: 0,
    cost: 0,
    provider: ''
  });

  // Calculate current footprint
  useEffect(() => {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyEmissions = emissions.filter(e =>
      e.timestamp >= startOfMonth && e.timestamp <= endOfMonth
    );

    const totalEmissions = monthlyEmissions.reduce((sum, e) => sum + e.amount, 0);
    const emissionsByCategory = monthlyEmissions.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const scope1 = monthlyEmissions.filter(e =>
      ['energy', 'production'].includes(e.category)
    ).reduce((sum, e) => sum + e.amount, 0);

    const scope2 = monthlyEmissions.filter(e =>
      e.category === 'energy' && e.subcategory === 'electricity'
    ).reduce((sum, e) => sum + e.amount, 0);

    const scope3 = totalEmissions - scope1 - scope2;

    const totalOffsets = offsets.reduce((sum, o) => sum + o.amount, 0);
    const netEmissions = Math.max(0, totalEmissions - totalOffsets);

    const previousMonthEmissions = emissions.filter(e => {
      const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
      return e.timestamp >= prevMonth && e.timestamp <= prevMonthEnd;
    }).reduce((sum, e) => sum + e.amount, 0);

    const progressToTarget = previousMonthEmissions > 0
      ? ((previousMonthEmissions - netEmissions) / previousMonthEmissions) * 100
      : 0;

    setFootprint({
      period: { start: startOfMonth, end: endOfMonth },
      totalEmissions,
      emissionsByCategory,
      emissionsByScope: { scope1, scope2, scope3 },
      offsets: totalOffsets,
      netEmissions,
      reductionTarget,
      progressToTarget
    });
  }, [emissions, offsets, reductionTarget]);

  const recordEmission = useCallback(() => {
    if (!newEmission.category || !newEmission.source || newEmission.amount <= 0) return;

    const emission: CarbonEmission = {
      id: `em_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      category: newEmission.category,
      subcategory: newEmission.subcategory,
      source: newEmission.source,
      amount: newEmission.amount,
      unit: newEmission.unit,
      location: newEmission.location,
      activity: newEmission.activity,
      metadata: {}
    };

    setEmissions(prev => [emission, ...prev]);
    onEmissionRecorded?.(emission);

    setNewEmission({
      category: 'energy',
      subcategory: '',
      source: '',
      amount: 0,
      unit: 'kg CO2e',
      location: '',
      activity: ''
    });
  }, [newEmission, onEmissionRecorded]);

  const purchaseOffset = useCallback(() => {
    if (!newOffset.project || newOffset.amount <= 0) return;

    const offset: CarbonOffset = {
      id: `offset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      project: newOffset.project,
      type: newOffset.type,
      amount: newOffset.amount,
      cost: newOffset.cost,
      provider: newOffset.provider,
      purchaseDate: new Date(),
      certificateId: `CERT_${Date.now()}`
    };

    setOffsets(prev => [...prev, offset]);
    onOffsetPurchased?.(offset);

    setNewOffset({
      project: '',
      type: 'renewable_energy',
      amount: 0,
      cost: 0,
      provider: ''
    });
  }, [newOffset, onOffsetPurchased]);

  const updateReductionTarget = useCallback((target: number) => {
    setReductionTarget(target);
    onTargetUpdated?.(target);
  }, [onTargetUpdated]);

  const getEmissionIcon = (category: string) => {
    switch (category) {
      case 'energy': return '⚡';
      case 'transport': return '🚗';
      case 'waste': return '🗑️';
      case 'production': return '🏭';
      case 'supply_chain': return '🚚';
      default: return '🌍';
    }
  };

  const getOffsetIcon = (type: string) => {
    switch (type) {
      case 'renewable_energy': return '☀️';
      case 'reforestation': return '🌳';
      case 'carbon_capture': return '🏭';
      case 'methane_reduction': return '🐄';
      default: return '🌱';
    }
  };

  const totalEmissions = emissions.reduce((sum, e) => sum + e.amount, 0);
  const totalOffsets = offsets.reduce((sum, o) => sum + o.amount, 0);
  const netEmissions = Math.max(0, totalEmissions - totalOffsets);
  const carbonIntensity = totalEmissions > 0 ? netEmissions / totalEmissions : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carbon Footprint Tracking</h1>
            <p className="text-gray-600">Real-time environmental impact monitoring and carbon management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Net Emissions</div>
              <div className="font-bold text-lg">{netEmissions.toFixed(1)} tCO2e</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{totalEmissions.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Total Emissions (tCO2e)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalOffsets.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Carbon Offsets (tCO2e)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{carbonIntensity.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Carbon Intensity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{reductionTarget}%</div>
            <div className="text-sm text-gray-600">Reduction Target</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'emissions', label: 'Emissions', icon: '🌍' },
              { id: 'offsets', label: 'Carbon Offsets', icon: '🌱' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'reporting', label: 'Reporting', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Footprint Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Current Month Overview</h3>
                  <div className="space-y-4">
                    {footprint && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Emissions:</span>
                          <span className="font-bold">{footprint.totalEmissions.toFixed(1)} tCO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Carbon Offsets:</span>
                          <span className="font-bold text-green-600">{footprint.offsets.toFixed(1)} tCO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Net Emissions:</span>
                          <span className="font-bold text-blue-600">{footprint.netEmissions.toFixed(1)} tCO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Progress to Target:</span>
                          <span className={`font-bold ${
                            footprint.progressToTarget && footprint.progressToTarget >= footprint.reductionTarget!
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {footprint.progressToTarget?.toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Emissions by Category */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Emissions by Category</h3>
                  <div className="space-y-3">
                    {footprint && Object.entries(footprint.emissionsByCategory).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getEmissionIcon(category)}</span>
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(amount / footprint.totalEmissions) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            {amount.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Emissions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Recent Emissions</h3>
                <div className="space-y-3">
                  {emissions.slice(0, 5).map((emission) => (
                    <div key={emission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getEmissionIcon(emission.category)}</span>
                        <div>
                          <div className="font-medium">{emission.activity}</div>
                          <div className="text-sm text-gray-600">{emission.source}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{emission.amount.toFixed(1)} {emission.unit}</div>
                        <div className="text-sm text-gray-500">
                          {emission.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('emissions')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Record Emission
                </button>
                <button
                  onClick={() => setActiveTab('offsets')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Purchase Offsets
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  View Analytics
                </button>
              </div>
            </div>
          )}

          {/* Emissions Tab */}
          {activeTab === 'emissions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Carbon Emissions</h2>
                <div className="text-sm text-gray-600">
                  {emissions.length} emissions recorded
                </div>
              </div>

              {/* Record New Emission */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Record New Emission</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={newEmission.category}
                    onChange={(e) => setNewEmission(prev => ({ ...prev, category: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="energy">Energy</option>
                    <option value="transport">Transport</option>
                    <option value="waste">Waste</option>
                    <option value="production">Production</option>
                    <option value="supply_chain">Supply Chain</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Subcategory"
                    value={newEmission.subcategory}
                    onChange={(e) => setNewEmission(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Source"
                    value={newEmission.source}
                    onChange={(e) => setNewEmission(prev => ({ ...prev, source: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newEmission.amount || ''}
                      onChange={(e) => setNewEmission(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newEmission.unit}
                      onChange={(e) => setNewEmission(prev => ({ ...prev, unit: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="kg CO2e">kg CO2e</option>
                      <option value="tCO2e">tCO2e</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={newEmission.location}
                    onChange={(e) => setNewEmission(prev => ({ ...prev, location: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Activity description"
                    value={newEmission.activity}
                    onChange={(e) => setNewEmission(prev => ({ ...prev, activity: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={recordEmission}
                    disabled={!newEmission.source || newEmission.amount <= 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Record Emission
                  </button>
                  <button
                    onClick={() => setNewEmission({
                      category: 'energy',
                      subcategory: '',
                      source: '',
                      amount: 0,
                      unit: 'kg CO2e',
                      location: '',
                      activity: ''
                    })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Emissions List */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Time</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Source</th>
                        <th className="text-left py-3 px-4">Activity</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emissions.map((emission) => (
                        <tr key={emission.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{emission.timestamp.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>{getEmissionIcon(emission.category)}</span>
                              <span className="capitalize">{emission.category.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{emission.source}</td>
                          <td className="py-3 px-4 max-w-xs truncate">{emission.activity}</td>
                          <td className="py-3 px-4 font-mono">
                            {emission.amount.toFixed(1)} {emission.unit}
                          </td>
                          <td className="py-3 px-4">{emission.location || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Offsets Tab */}
          {activeTab === 'offsets' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Carbon Offsets</h2>
                <div className="text-sm text-gray-600">
                  {totalOffsets.toFixed(1)} tCO2e offset purchased
                </div>
              </div>

              {/* Purchase New Offset */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Purchase Carbon Offset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Project name"
                    value={newOffset.project}
                    onChange={(e) => setNewOffset(prev => ({ ...prev, project: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <select
                    value={newOffset.type}
                    onChange={(e) => setNewOffset(prev => ({ ...prev, type: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="renewable_energy">Renewable Energy</option>
                    <option value="reforestation">Reforestation</option>
                    <option value="carbon_capture">Carbon Capture</option>
                    <option value="methane_reduction">Methane Reduction</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Amount (tCO2e)"
                    value={newOffset.amount || ''}
                    onChange={(e) => setNewOffset(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="number"
                    placeholder="Cost per tonne"
                    value={newOffset.cost || ''}
                    onChange={(e) => setNewOffset(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Provider name"
                    value={newOffset.provider}
                    onChange={(e) => setNewOffset(prev => ({ ...prev, provider: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={purchaseOffset}
                    disabled={!newOffset.project || newOffset.amount <= 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Purchase Offset
                  </button>
                  <button
                    onClick={() => setNewOffset({
                      project: '',
                      type: 'renewable_energy',
                      amount: 0,
                      cost: 0,
                      provider: ''
                    })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Offsets List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offsets.map((offset) => (
                  <div key={offset.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getOffsetIcon(offset.type)}</span>
                        <div>
                          <h3 className="font-medium">{offset.project}</h3>
                          <p className="text-sm text-gray-600 capitalize">{offset.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                        {offset.amount.toFixed(1)} tCO2e
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-medium">{offset.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per tonne:</span>
                        <span className="font-medium">${offset.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total cost:</span>
                        <span className="font-medium">${(offset.amount * offset.cost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase date:</span>
                        <span className="font-medium">{offset.purchaseDate.toLocaleDateString()}</span>
                      </div>
                      {offset.certificateId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Certificate:</span>
                          <span className="font-mono text-xs">{offset.certificateId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {offsets.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <div className="text-4xl mb-2">🌱</div>
                    <div>No carbon offsets purchased yet</div>
                    <div className="text-sm">Purchase offsets to neutralize your carbon footprint</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Carbon Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emission Trends */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Emission Trends</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">12.5%</div>
                      <div className="text-sm text-gray-600">Monthly reduction</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">8.3 tCO2e</div>
                      <div className="text-sm text-gray-600">Average monthly emissions</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">2.1</div>
                      <div className="text-sm text-gray-600">Carbon intensity (kg CO2e/$)</div>
                    </div>
                  </div>
                </div>

                {/* Scope Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Emissions by Scope</h3>
                  <div className="space-y-3">
                    {footprint && (
                      <>
                        <div className="flex justify-between items-center">
                          <span>Scope 1 (Direct):</span>
                          <span className="font-medium">{footprint.emissionsByScope.scope1.toFixed(1)} tCO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Scope 2 (Energy):</span>
                          <span className="font-medium">{footprint.emissionsByScope.scope2.toFixed(1)} tCO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Scope 3 (Supply Chain):</span>
                          <span className="font-medium">{footprint.emissionsByScope.scope3.toFixed(1)} tCO2e</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Reduction Target */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Reduction Target</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={reductionTarget}
                    onChange={(e) => updateReductionTarget(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">% reduction target for next year</span>
                </div>
                {footprint?.progressToTarget && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Progress</span>
                      <span>{footprint.progressToTarget.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          footprint.progressToTarget >= reductionTarget ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, footprint.progressToTarget)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {reductionTarget}% reduction
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reporting Tab */}
          {activeTab === 'reporting' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Carbon Reporting</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Generate Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Templates */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Report Templates</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded">
                      <h4 className="font-medium">Monthly Carbon Report</h4>
                      <p className="text-sm text-gray-600">Comprehensive monthly emissions and offsets summary</p>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Generate
                      </button>
                    </div>
                    <div className="p-3 border border-gray-200 rounded">
                      <h4 className="font-medium">ESG Carbon Disclosure</h4>
                      <p className="text-sm text-gray-600">ESG-compliant carbon reporting for stakeholders</p>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Generate
                      </button>
                    </div>
                    <div className="p-3 border border-gray-200 rounded">
                      <h4 className="font-medium">Carbon Reduction Plan</h4>
                      <p className="text-sm text-gray-600">Strategic plan for achieving carbon reduction targets</p>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compliance Standards */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Compliance Standards</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">GHG Protocol</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Compliant</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">TCFD Recommendations</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Compliant</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">SASB Standards</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">GRI Standards</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}