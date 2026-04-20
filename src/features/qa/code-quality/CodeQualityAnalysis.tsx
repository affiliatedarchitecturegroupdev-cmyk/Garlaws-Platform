'use client';

import { useState, useEffect, useCallback } from 'react';

interface CodeQualityReport {
  id: string;
  timestamp: string;
  branch: string;
  commit: string;
  summary: CodeQualitySummary;
  lintResults: LintResult[];
  coverageResults: CoverageResult;
  complexityMetrics: ComplexityMetric[];
  securityScan: SecurityScanResult;
  recommendations: string[];
}

interface CodeQualitySummary {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  totalFiles: number;
  filesAnalyzed: number;
  totalIssues: number;
  criticalIssues: number;
  warnings: number;
  codeCoverage: number;
  averageComplexity: number;
  securityScore: number;
}

interface LintResult {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  fixable: boolean;
}

interface CoverageResult {
  totalLines: number;
  coveredLines: number;
  percentage: number;
  files: CoverageFile[];
  branches: number;
  branchesCovered: number;
  functions: number;
  functionsCovered: number;
}

interface CoverageFile {
  filename: string;
  lines: number;
  coveredLines: number;
  percentage: number;
  branches?: number;
  branchesCovered?: number;
}

interface ComplexityMetric {
  file: string;
  function: string;
  complexity: number;
  lines: number;
  maintainabilityIndex: number;
}

interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[];
  score: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
}

interface SecurityVulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  file: string;
  line?: number;
  cwe?: string;
  fix?: string;
}

interface CodeQualityAnalysisProps {
  tenantId?: string;
}

export default function CodeQualityAnalysis({ tenantId = 'default' }: CodeQualityAnalysisProps) {
  const [reports, setReports] = useState<CodeQualityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CodeQualityReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lint' | 'coverage' | 'complexity' | 'security'>('overview');

  const fetchReports = useCallback(async () => {
    try {
      const response = await fetch(`/api/qa?action=code-quality-reports&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch code quality reports:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-code-quality-analysis',
          tenantId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Poll for completion
        pollAnalysisStatus(data.analysisId);
      }
    } catch (error) {
      console.error('Failed to run code quality analysis:', error);
      setAnalyzing(false);
    }
  };

  const pollAnalysisStatus = (analysisId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/qa?action=analysis-status&analysisId=${analysisId}&tenantId=${tenantId}`);
        const data = await response.json();
        if (data.success) {
          if (data.status === 'completed') {
            setAnalyzing(false);
            fetchReports(); // Refresh reports
          } else {
            setTimeout(poll, 3000); // Poll every 3 seconds
          }
        }
      } catch (error) {
        console.error('Failed to poll analysis status:', error);
        setAnalyzing(false);
      }
    };

    setTimeout(poll, 3000);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSecuritySeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'info': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Code Quality Analysis</h2>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {/* Latest Report Overview */}
      {reports.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Latest Report Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(reports[0].summary.grade)}`}>
                Grade {reports[0].summary.grade}
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(reports[0].summary.overallScore)}`}>
                {reports[0].summary.overallScore}
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {reports[0].summary.criticalIssues}
              </div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(reports[0].summary.codeCoverage)}`}>
                {reports[0].summary.codeCoverage}%
              </div>
              <div className="text-sm text-gray-600">Coverage</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(reports[0].summary.securityScore)}`}>
                {reports[0].summary.securityScore}
              </div>
              <div className="text-sm text-gray-600">Security</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Analyzed {reports[0].summary.filesAnalyzed} of {reports[0].summary.totalFiles} files •
            {reports[0].summary.totalIssues} total issues •
            Completed on {new Date(reports[0].timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Analysis Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div
              key={report.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(report.summary.grade)}`}>
                      {report.summary.grade}
                    </span>
                    <span className="text-sm text-gray-600">{report.branch}</span>
                    <span className="text-sm text-gray-500">{report.commit.slice(0, 7)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Score:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(report.summary.overallScore)}`}>
                        {report.summary.overallScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Issues:</span>
                      <span className="ml-1 font-medium text-red-600">{report.summary.totalIssues}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Coverage:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(report.summary.codeCoverage)}`}>
                        {report.summary.codeCoverage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Security:</span>
                      <span className={`ml-1 font-medium ${getScoreColor(report.summary.securityScore)}`}>
                        {report.summary.securityScore}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(report.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg">No code quality reports available</p>
              <p className="text-sm">Run a code quality analysis to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Code Quality Report - {selectedReport.branch}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex h-[calc(90vh-80px)]">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'overview'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('lint')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'lint'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Lint Results ({selectedReport.lintResults.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('coverage')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'coverage'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Test Coverage
                  </button>
                  <button
                    onClick={() => setActiveTab('complexity')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'complexity'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Complexity ({selectedReport.complexityMetrics.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'security'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Security ({selectedReport.securityScan.vulnerabilities.length})
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Overall Quality</h4>
                        <div className={`text-3xl font-bold ${getScoreColor(selectedReport.summary.overallScore)}`}>
                          {selectedReport.summary.overallScore}/100
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getGradeColor(selectedReport.summary.grade)}`}>
                          Grade {selectedReport.summary.grade}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Code Coverage</h4>
                        <div className={`text-3xl font-bold ${getScoreColor(selectedReport.summary.codeCoverage)}`}>
                          {selectedReport.summary.codeCoverage}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedReport.coverageResults.coveredLines} / {selectedReport.coverageResults.totalLines} lines
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Security Score</h4>
                        <div className={`text-3xl font-bold ${getScoreColor(selectedReport.summary.securityScore)}`}>
                          {selectedReport.summary.securityScore}/100
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedReport.securityScan.totalIssues} issues found
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">Issues Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{selectedReport.summary.criticalIssues}</div>
                          <div className="text-sm text-gray-600">Critical</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{selectedReport.summary.warnings}</div>
                          <div className="text-sm text-gray-600">Warnings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {selectedReport.summary.totalIssues - selectedReport.summary.criticalIssues - selectedReport.summary.warnings}
                          </div>
                          <div className="text-sm text-gray-600">Info</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedReport.summary.averageComplexity.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Avg Complexity</div>
                        </div>
                      </div>
                    </div>

                    {selectedReport.recommendations.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {selectedReport.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'lint' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold">Lint Results</h4>
                      <div className="text-sm text-gray-600">
                        {selectedReport.lintResults.filter(r => r.severity === 'error').length} errors, {' '}
                        {selectedReport.lintResults.filter(r => r.severity === 'warning').length} warnings
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedReport.lintResults.map((result, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(result.severity)} bg-current bg-opacity-10`}>
                                  {result.severity.toUpperCase()}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{result.rule}</span>
                                {result.fixable && (
                                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                    Auto-fixable
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                              <div className="text-xs text-gray-500">
                                {result.file}:{result.line}:{result.column}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedReport.lintResults.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">✅</div>
                          <p>No lint issues found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'coverage' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(selectedReport.coverageResults.percentage)}`}>
                          {selectedReport.coverageResults.percentage}%
                        </div>
                        <div className="text-sm text-gray-600">Overall Coverage</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport.coverageResults.functionsCovered}/{selectedReport.coverageResults.functions}
                        </div>
                        <div className="text-sm text-gray-600">Functions</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedReport.coverageResults.branchesCovered}/{selectedReport.coverageResults.branches}
                        </div>
                        <div className="text-sm text-gray-600">Branches</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedReport.coverageResults.coveredLines}/{selectedReport.coverageResults.totalLines}
                        </div>
                        <div className="text-sm text-gray-600">Lines</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">Coverage by File</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedReport.coverageResults.files
                          .sort((a, b) => b.percentage - a.percentage)
                          .map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{file.filename}</div>
                              <div className="text-xs text-gray-600">
                                {file.coveredLines} / {file.lines} lines covered
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {file.branches && (
                                <div className="text-xs text-gray-600">
                                  {file.branchesCovered}/{file.branches} branches
                                </div>
                              )}
                              <div className={`text-sm font-medium ${getScoreColor(file.percentage)}`}>
                                {file.percentage}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'complexity' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport.summary.averageComplexity.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Average Complexity</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedReport.complexityMetrics.filter(m => m.complexity > 10).length}
                        </div>
                        <div className="text-sm text-gray-600">High Complexity Functions</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">Complexity Metrics</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedReport.complexityMetrics
                          .sort((a, b) => b.complexity - a.complexity)
                          .map((metric, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {metric.file}::{metric.function}
                              </div>
                              <div className="text-xs text-gray-600">
                                {metric.lines} lines • MI: {metric.maintainabilityIndex.toFixed(1)}
                              </div>
                            </div>
                            <div className={`text-sm font-medium ${
                              metric.complexity > 15 ? 'text-red-600' :
                              metric.complexity > 10 ? 'text-orange-600' :
                              metric.complexity > 5 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              Complexity: {metric.complexity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(selectedReport.securityScan.score)}`}>
                          {selectedReport.securityScan.score}
                        </div>
                        <div className="text-sm text-gray-600">Security Score</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedReport.securityScan.criticalIssues}
                        </div>
                        <div className="text-sm text-gray-600">Critical</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedReport.securityScan.highIssues}
                        </div>
                        <div className="text-sm text-gray-600">High</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedReport.securityScan.mediumIssues}
                        </div>
                        <div className="text-sm text-gray-600">Medium</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport.securityScan.lowIssues}
                        </div>
                        <div className="text-sm text-gray-600">Low</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">Security Vulnerabilities</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedReport.securityScan.vulnerabilities.map((vuln, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSecuritySeverityColor(vuln.severity)}`}>
                                    {vuln.severity.toUpperCase()}
                                  </span>
                                  {vuln.cwe && (
                                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                      CWE-{vuln.cwe}
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-medium text-gray-900 mb-1">{vuln.title}</h5>
                                <p className="text-sm text-gray-700 mb-2">{vuln.description}</p>
                                <div className="text-xs text-gray-500">
                                  {vuln.file}{vuln.line && `:${vuln.line}`}
                                </div>
                              </div>
                            </div>
                            {vuln.fix && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                <div className="text-sm font-medium text-green-800 mb-1">Suggested Fix:</div>
                                <div className="text-sm text-green-700">{vuln.fix}</div>
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedReport.securityScan.vulnerabilities.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <div className="text-4xl mb-2">🔒</div>
                            <p>No security vulnerabilities found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}