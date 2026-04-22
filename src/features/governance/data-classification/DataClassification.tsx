'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Data Classification Types
export type DataClassificationResult = {
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted' | 'highly-sensitive';
  confidence: number;
  categories: string[];
  detectedPatterns: string[];
  recommendations: string[];
  complianceRequirements: string[];
  lastClassified: string;
  classifier: string;
};

export type ClassificationRule = {
  id: string;
  name: string;
  description: string;
  pattern: {
    type: 'regex' | 'keyword' | 'semantic' | 'ml';
    value: string | string[];
    caseSensitive?: boolean;
  };
  classification: {
    sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted' | 'highly-sensitive';
    categories: string[];
    confidence: number;
  };
  scope: {
    dataSources: string[];
    fields: string[];
    dataTypes: string[];
  };
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export type DataInventoryItem = {
  id: string;
  name: string;
  dataSource: string;
  schema: string;
  table: string;
  column?: string;
  dataType: string;
  sampleValues: any[];
  classification: DataClassificationResult;
  tags: string[];
  owner: string;
  lastScanned: string;
  recordCount?: number;
  riskScore: number;
};

// Data Classification Hook
export function useDataClassification() {
  const [classificationRules, setClassificationRules] = useState<ClassificationRule[]>([]);
  const [dataInventory, setDataInventory] = useState<DataInventoryItem[]>([]);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [lastScanResults, setLastScanResults] = useState<{
    scannedItems: number;
    classifiedItems: number;
    highRiskItems: number;
    scanDuration: number;
  } | null>(null);

  // Default classification rules
  const defaultRules: ClassificationRule[] = [
    {
      id: 'pii-email',
      name: 'Email Address Detection',
      description: 'Detects email addresses in data fields',
      pattern: {
        type: 'regex',
        value: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
      },
      classification: {
        sensitivityLevel: 'confidential',
        categories: ['PII', 'Contact Information'],
        confidence: 0.95
      },
      scope: {
        dataSources: ['*'],
        fields: ['*'],
        dataTypes: ['string', 'text']
      },
      active: true,
      priority: 10,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'pii-ssn',
      name: 'Social Security Number Detection',
      description: 'Detects US Social Security Numbers',
      pattern: {
        type: 'regex',
        value: '\\b\\d{3}-\\d{2}-\\d{4}\\b'
      },
      classification: {
        sensitivityLevel: 'highly-sensitive',
        categories: ['PII', 'Government ID'],
        confidence: 0.98
      },
      scope: {
        dataSources: ['*'],
        fields: ['*'],
        dataTypes: ['string']
      },
      active: true,
      priority: 15,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'financial-account',
      name: 'Financial Account Numbers',
      description: 'Detects bank account and credit card numbers',
      pattern: {
        type: 'regex',
        value: '\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b'
      },
      classification: {
        sensitivityLevel: 'restricted',
        categories: ['Financial', 'PCI'],
        confidence: 0.90
      },
      scope: {
        dataSources: ['*'],
        fields: ['*'],
        dataTypes: ['string']
      },
      active: true,
      priority: 12,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'health-data',
      name: 'Health Information Detection',
      description: 'Detects medical and health-related data',
      pattern: {
        type: 'keyword',
        value: ['diagnosis', 'treatment', 'medication', 'medical', 'health', 'patient', 'doctor', 'hospital']
      },
      classification: {
        sensitivityLevel: 'highly-sensitive',
        categories: ['Health', 'HIPAA', 'PHI'],
        confidence: 0.85
      },
      scope: {
        dataSources: ['*'],
        fields: ['*'],
        dataTypes: ['string', 'text']
      },
      active: true,
      priority: 14,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadClassificationRules = useCallback(async () => {
    try {
      // In real implementation, load from database
      await new Promise(resolve => setTimeout(resolve, 200));
      setClassificationRules(defaultRules);
    } catch (error) {
      console.error('Failed to load classification rules:', error);
    }
  }, []);

  const classifyData = useCallback(async (
    data: any,
    context: {
      dataSource: string;
      field: string;
      dataType: string;
    }
  ): Promise<DataClassificationResult> => {
    const results: DataClassificationResult[] = [];

    for (const rule of classificationRules.filter(r => r.active)) {
      if (!matchesScope(rule.scope, context)) continue;

      const matches = await evaluateRule(rule, data);
      if (matches) {
        results.push({
          sensitivityLevel: rule.classification.sensitivityLevel,
          confidence: rule.classification.confidence,
          categories: rule.classification.categories,
          detectedPatterns: [rule.name],
          recommendations: generateRecommendations(rule.classification.sensitivityLevel),
          complianceRequirements: getComplianceRequirements(rule.classification.categories),
          lastClassified: new Date().toISOString(),
          classifier: rule.id
        });
      }
    }

    // Return the highest sensitivity classification
    if (results.length === 0) {
      return {
        sensitivityLevel: 'public',
        confidence: 1.0,
        categories: [],
        detectedPatterns: [],
        recommendations: [],
        complianceRequirements: [],
        lastClassified: new Date().toISOString(),
        classifier: 'default'
      };
    }

    const sensitivityOrder = ['public', 'internal', 'confidential', 'restricted', 'highly-sensitive'];
    const highestSensitivity = results.reduce((highest, current) => {
      const currentIndex = sensitivityOrder.indexOf(current.sensitivityLevel);
      const highestIndex = sensitivityOrder.indexOf(highest.sensitivityLevel);
      return currentIndex > highestIndex ? current : highest;
    });

    return highestSensitivity;
  }, [classificationRules]);

  const matchesScope = (scope: ClassificationRule['scope'], context: any): boolean => {
    if (scope.dataSources.length > 0 && !scope.dataSources.includes('*') && !scope.dataSources.includes(context.dataSource)) {
      return false;
    }
    if (scope.fields.length > 0 && !scope.fields.includes('*') && !scope.fields.includes(context.field)) {
      return false;
    }
    if (scope.dataTypes.length > 0 && !scope.dataTypes.includes(context.dataType)) {
      return false;
    }
    return true;
  };

  const evaluateRule = async (rule: ClassificationRule, data: any): Promise<boolean> => {
    const dataString = String(data).toLowerCase();

    switch (rule.pattern.type) {
      case 'regex':
        const regex = new RegExp(rule.pattern.value as string, rule.pattern.caseSensitive ? 'g' : 'gi');
        return regex.test(dataString);

      case 'keyword':
        const keywords = (rule.pattern.value as string[]).map(k => k.toLowerCase());
        return keywords.some(keyword => dataString.includes(keyword));

      case 'semantic':
        // In real implementation, use NLP/ML for semantic analysis
        return Math.random() > 0.7; // Mock implementation

      case 'ml':
        // In real implementation, use ML model for classification
        return Math.random() > 0.8; // Mock implementation

      default:
        return false;
    }
  };

  const generateRecommendations = (sensitivityLevel: string): string[] => {
    const recommendations: Record<string, string[]> = {
      'public': [],
      'internal': ['Consider access controls', 'Regular monitoring'],
      'confidential': ['Implement strict access controls', 'Encrypt at rest', 'Regular audits'],
      'restricted': ['Implement multi-factor authentication', 'Data masking', 'Compliance monitoring'],
      'highly-sensitive': ['Isolate in secure environment', 'Zero-trust access', 'Continuous monitoring', 'Legal review required']
    };
    return recommendations[sensitivityLevel] || [];
  };

  const getComplianceRequirements = (categories: string[]): string[] => {
    const requirements: Record<string, string[]> = {
      'PII': ['GDPR Article 5', 'CCPA Section 1798.100'],
      'Health': ['HIPAA Security Rule', 'HITECH Act'],
      'Financial': ['PCI DSS', 'SOX Section 404'],
      'Government ID': ['NIST SP 800-53', 'Identity Protection']
    };

    const allRequirements = new Set<string>();
    categories.forEach(category => {
      (requirements[category] || []).forEach(req => allRequirements.add(req));
    });

    return Array.from(allRequirements);
  };

  const scanDataSources = useCallback(async (dataSources: string[]): Promise<void> => {
    setScanInProgress(true);
    const startTime = Date.now();
    let scannedItems = 0;
    let classifiedItems = 0;
    let highRiskItems = 0;

    try {
      // Mock data sources to scan
      const mockDataItems: Omit<DataInventoryItem, 'classification'>[] = [
        {
          id: 'user_emails',
          name: 'User Email Addresses',
          dataSource: 'postgresql',
          schema: 'public',
          table: 'users',
          column: 'email',
          dataType: 'string',
          sampleValues: ['john.doe@example.com', 'jane.smith@company.com'],
          tags: [],
          owner: 'data-team',
          lastScanned: new Date().toISOString(),
          riskScore: 0
        },
        {
          id: 'user_ssn',
          name: 'Social Security Numbers',
          dataSource: 'postgresql',
          schema: 'public',
          table: 'users',
          column: 'ssn',
          dataType: 'string',
          sampleValues: ['123-45-6789', '987-65-4321'],
          tags: [],
          owner: 'compliance-team',
          lastScanned: new Date().toISOString(),
          riskScore: 0
        },
        {
          id: 'account_numbers',
          name: 'Bank Account Numbers',
          dataSource: 'postgresql',
          schema: 'finance',
          table: 'accounts',
          column: 'account_number',
          dataType: 'string',
          sampleValues: ['1234-5678-9012-3456', '9876-5432-1098-7654'],
          tags: [],
          owner: 'finance-team',
          lastScanned: new Date().toISOString(),
          riskScore: 0
        }
      ];

      const classifiedItemsList: DataInventoryItem[] = [];

      for (const item of mockDataItems) {
        scannedItems++;

        // Classify each data item
        const classification = await classifyData(item.sampleValues[0], {
          dataSource: item.dataSource,
          field: item.column || item.table,
          dataType: item.dataType
        });

        const classifiedItem: DataInventoryItem = {
          ...item,
          classification,
          riskScore: calculateRiskScore(classification)
        };

        classifiedItemsList.push(classifiedItem);
        classifiedItems++;

        if (classification.sensitivityLevel === 'highly-sensitive' || classification.sensitivityLevel === 'restricted') {
          highRiskItems++;
        }
      }

      setDataInventory(classifiedItemsList);
      setLastScanResults({
        scannedItems,
        classifiedItems,
        highRiskItems,
        scanDuration: Date.now() - startTime
      });
    } catch (error) {
      console.error('Data scan failed:', error);
    } finally {
      setScanInProgress(false);
    }
  }, [classifyData]);

  const calculateRiskScore = (classification: DataClassificationResult): number => {
    const sensitivityScores = {
      'public': 1,
      'internal': 3,
      'confidential': 7,
      'restricted': 9,
      'highly-sensitive': 10
    };

    const baseScore = sensitivityScores[classification.sensitivityLevel] || 1;
    const confidenceMultiplier = classification.confidence;
    const categoryMultiplier = 1 + (classification.categories.length * 0.1);

    return Math.round(baseScore * confidenceMultiplier * categoryMultiplier);
  };

  const createClassificationRule = useCallback((rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: ClassificationRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClassificationRules(prev => [...prev, newRule]);
    return newRule.id;
  }, []);

  useEffect(() => {
    loadClassificationRules();
  }, [loadClassificationRules]);

  return {
    classificationRules,
    dataInventory,
    scanInProgress,
    lastScanResults,
    classifyData,
    scanDataSources,
    createClassificationRule,
    loadClassificationRules,
  };
}

// Data Classification Dashboard Component
interface DataClassificationDashboardProps {
  className?: string;
}

export const DataClassificationDashboard: React.FC<DataClassificationDashboardProps> = ({
  className
}) => {
  const {
    classificationRules,
    dataInventory,
    scanInProgress,
    lastScanResults,
    scanDataSources
  } = useDataClassification();

  const [selectedItem, setSelectedItem] = useState<DataInventoryItem | null>(null);

  const handleScanDataSources = async () => {
    await scanDataSources(['postgresql', 'mongodb', 's3']);
  };

  const getSensitivityColor = (level: string) => {
    const colors = {
      'public': 'bg-green-100 text-green-800',
      'internal': 'bg-blue-100 text-blue-800',
      'confidential': 'bg-yellow-100 text-yellow-800',
      'restricted': 'bg-orange-100 text-orange-800',
      'highly-sensitive': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Classification</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automated sensitive data identification and classification
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleScanDataSources}
            disabled={scanInProgress}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {scanInProgress ? 'Scanning...' : 'Scan Data Sources'}
          </button>
        </div>
      </div>

      {/* Scan Results */}
      {lastScanResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">{lastScanResults.scannedItems}</div>
            <div className="text-sm text-gray-600">Items Scanned</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">{lastScanResults.classifiedItems}</div>
            <div className="text-sm text-gray-600">Items Classified</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-red-600">{lastScanResults.highRiskItems}</div>
            <div className="text-sm text-gray-600">High Risk Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">{(lastScanResults.scanDuration / 1000).toFixed(1)}s</div>
            <div className="text-sm text-gray-600">Scan Duration</div>
          </div>
        </div>
      )}

      {/* Classification Rules */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Classification Rules ({classificationRules.filter(r => r.active).length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classificationRules.filter(r => r.active).map(rule => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{rule.name}</h4>
                <span className={cn('px-2 py-1 rounded text-xs font-medium', getSensitivityColor(rule.classification.sensitivityLevel))}>
                  {rule.classification.sensitivityLevel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
              <div className="text-xs text-muted-foreground">
                Pattern: {rule.pattern.type} • Confidence: {(rule.classification.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Inventory */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Data Inventory ({dataInventory.length})</h3>
        <div className="space-y-3">
          {dataInventory.map(item => (
            <div
              key={item.id}
              className={cn(
                'p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow',
                selectedItem?.id === item.id ? 'border-primary bg-primary/5' : 'border-border'
              )}
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.dataSource}.{item.schema}.{item.table}
                    {item.column && `.${item.column}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn('px-2 py-1 rounded text-xs font-medium', getSensitivityColor(item.classification.sensitivityLevel))}>
                    {item.classification.sensitivityLevel}
                  </span>
                  <span className={cn('text-sm font-medium', getRiskColor(item.riskScore))}>
                    Risk: {item.riskScore}/10
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span>Data Type: {item.dataType}</span>
                  <span>Confidence: {(item.classification.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="text-muted-foreground">
                  Last scanned: {new Date(item.lastScanned).toLocaleDateString()}
                </div>
              </div>

              {item.classification.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.classification.categories.map(category => (
                    <span key={category} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedItem.name}</h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedItem.dataSource}.{selectedItem.schema}.{selectedItem.table}
                    {selectedItem.column && `.${selectedItem.column}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Classification Details */}
              <div>
                <h3 className="font-semibold mb-3">Classification Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Sensitivity Level</span>
                    <div className="font-medium capitalize">{selectedItem.classification.sensitivityLevel}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <div className="font-medium">{(selectedItem.classification.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <div className={cn('font-medium', getRiskColor(selectedItem.riskScore))}>
                      {selectedItem.riskScore}/10
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Classifier</span>
                    <div className="font-medium">{selectedItem.classification.classifier}</div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {selectedItem.classification.categories.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.classification.categories.map(category => (
                      <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedItem.classification.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Security Recommendations</h3>
                  <ul className="space-y-1">
                    {selectedItem.classification.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance Requirements */}
              {selectedItem.classification.complianceRequirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Compliance Requirements</h3>
                  <div className="space-y-2">
                    {selectedItem.classification.complianceRequirements.map(req => (
                      <div key={req} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{req}</span>
                        <span className="text-xs text-muted-foreground">Regulatory</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Values */}
              <div>
                <h3 className="font-semibold mb-3">Sample Values</h3>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  {selectedItem.sampleValues.map((value, index) => (
                    <div key={index} className="mb-1">
                      {JSON.stringify(value)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};