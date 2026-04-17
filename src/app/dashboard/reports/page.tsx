"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface ReportData {
  id: string;
  name: string;
  type: "financial" | "performance" | "customer" | "operational";
  dateRange: string;
  generatedAt: string;
  status: "ready" | "generating" | "error";
  downloadUrl?: string;
}

interface ReportFilters {
  type: string;
  dateRange: string;
  format: "pdf" | "excel" | "csv";
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    type: "all",
    dateRange: "last30days",
    format: "pdf",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Simulate API call for reports
      const mockReports: ReportData[] = [
        {
          id: "1",
          name: "Monthly Financial Report - March 2026",
          type: "financial",
          dateRange: "March 1-31, 2026",
          generatedAt: "2026-04-01T10:30:00Z",
          status: "ready",
          downloadUrl: "#",
        },
        {
          id: "2",
          name: "Service Performance Analysis Q1 2026",
          type: "performance",
          dateRange: "January - March 2026",
          generatedAt: "2026-04-02T14:15:00Z",
          status: "ready",
          downloadUrl: "#",
        },
        {
          id: "3",
          name: "Customer Satisfaction Survey Results",
          type: "customer",
          dateRange: "Q1 2026",
          generatedAt: "2026-04-03T09:45:00Z",
          status: "ready",
          downloadUrl: "#",
        },
        {
          id: "4",
          name: "Operational Efficiency Report",
          type: "operational",
          dateRange: "March 2026",
          generatedAt: "2026-04-05T16:20:00Z",
          status: "generating",
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);

    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newReport: ReportData = {
        id: Date.now().toString(),
        name: `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type: filters.type as any,
        dateRange: filters.dateRange.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        generatedAt: new Date().toISOString(),
        status: "ready",
        downloadUrl: "#",
      };

      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = (report: ReportData) => {
    // In a real app, this would trigger a file download
    alert(`Downloading ${report.name} in ${filters.format.toUpperCase()} format`);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "financial": return "bg-green-100 text-green-800";
      case "performance": return "bg-blue-100 text-blue-800";
      case "customer": return "bg-purple-100 text-purple-800";
      case "operational": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return "✅";
      case "generating": return "⏳";
      case "error": return "❌";
      default: return "📄";
    }
  };

  const filteredReports = reports.filter(report => {
    if (filters.type === "all") return true;
    return report.type === filters.type;
  });

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Reports...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Exports</h1>
          <p className="text-[#45a29e]">
            Generate and download detailed business reports
          </p>
        </div>

        {/* Report Generation */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Generate New Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Report Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="financial">Financial</option>
                <option value="performance">Performance</option>
                <option value="customer">Customer</option>
                <option value="operational">Operational</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="lastYear">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Format
              </label>
              <select
                value={filters.format}
                onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value as "pdf" | "excel" | "csv" }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="w-full px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
              >
                {generatingReport ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          <div className="text-sm text-[#45a29e]">
            💡 Tip: Financial reports include revenue breakdowns, Performance reports show service metrics, Customer reports analyze satisfaction data.
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-white font-medium mr-4">Filter by type:</span>
            {[
              { value: "all", label: "All Reports", count: reports.length },
              { value: "financial", label: "Financial", count: reports.filter(r => r.type === "financial").length },
              { value: "performance", label: "Performance", count: reports.filter(r => r.type === "performance").length },
              { value: "customer", label: "Customer", count: reports.filter(r => r.type === "customer").length },
              { value: "operational", label: "Operational", count: reports.filter(r => r.type === "operational").length },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, type: option.value }))}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.type === option.value
                    ? "bg-[#c5a059] text-[#0b0c10]"
                    : "bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-white mb-2">No reports found</h3>
              <p className="text-[#45a29e] mb-6">
                Generate your first report using the form above.
              </p>
              <button
                onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
                className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
              >
                View All Reports
              </button>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getStatusIcon(report.status)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{report.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-[#45a29e]">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportTypeColor(report.type)}`}>
                          {report.type.toUpperCase()}
                        </span>
                        <span>{report.dateRange}</span>
                        <span>Generated {new Date(report.generatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {report.status === "ready" && report.downloadUrl && (
                      <button
                        onClick={() => downloadReport(report)}
                        className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium"
                      >
                        Download {filters.format.toUpperCase()}
                      </button>
                    )}

                    {report.status === "generating" && (
                      <div className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg text-sm">
                        Generating...
                      </div>
                    )}

                    <button className="px-4 py-2 bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] rounded-lg hover:border-[#45a29e]/40 transition-colors text-sm">
                      Share
                    </button>
                  </div>
                </div>

                {report.status === "error" && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    Report generation failed. Please try again or contact support.
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Report Templates */}
        <div className="mt-12 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Available Report Templates</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-[#0b0c10] rounded-lg border border-[#45a29e]/20">
              <div className="text-2xl mb-3">💰</div>
              <h3 className="text-white font-semibold mb-2">Financial Summary</h3>
              <p className="text-[#45a29e] text-sm mb-3">Revenue, expenses, and profit analysis</p>
              <button className="w-full px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded text-sm font-medium hover:bg-[#b8954f] transition-colors">
                Generate
              </button>
            </div>

            <div className="p-4 bg-[#0b0c10] rounded-lg border border-[#45a29e]/20">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-white font-semibold mb-2">Performance Metrics</h3>
              <p className="text-[#45a29e] text-sm mb-3">Service completion rates and efficiency</p>
              <button className="w-full px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded text-sm font-medium hover:bg-[#b8954f] transition-colors">
                Generate
              </button>
            </div>

            <div className="p-4 bg-[#0b0c10] rounded-lg border border-[#45a29e]/20">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-white font-semibold mb-2">Customer Insights</h3>
              <p className="text-[#45a29e] text-sm mb-3">Satisfaction scores and feedback analysis</p>
              <button className="w-full px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded text-sm font-medium hover:bg-[#b8954f] transition-colors">
                Generate
              </button>
            </div>

            <div className="p-4 bg-[#0b0c10] rounded-lg border border-[#45a29e]/20">
              <div className="text-2xl mb-3">⚙️</div>
              <h3 className="text-white font-semibold mb-2">Operational Report</h3>
              <p className="text-[#45a29e] text-sm mb-3">Resource utilization and optimization</p>
              <button className="w-full px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded text-sm font-medium hover:bg-[#b8954f] transition-colors">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}