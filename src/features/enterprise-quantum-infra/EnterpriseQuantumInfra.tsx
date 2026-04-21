"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Server, Cloud, Database, Shield, Zap, Activity, Settings, Monitor } from 'lucide-react';

interface QuantumProcessor {
  id: string;
  name: string;
  provider: 'IBM' | 'Google' | 'Rigetti' | 'IonQ' | 'Amazon';
  qubits: number;
  connectivity: string;
  coherenceTime: number; // microseconds
  gateFidelity: number;
  status: 'online' | 'maintenance' | 'offline';
  lastCalibration: Date;
  utilization: number;
}

interface QuantumJob {
  id: string;
  name: string;
  algorithm: string;
  processorId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  executionTime?: number;
  result?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface QuantumAPI {
  id: string;
  name: string;
  endpoint: string;
  version: string;
  authentication: 'api-key' | 'oauth' | 'jwt';
  rateLimit: number; // requests per minute
  status: 'active' | 'deprecated' | 'maintenance';
  lastUsed: Date;
  usage: number;
}

interface EnterpriseQuantumInfraProps {
  tenantId?: string;
  onJobComplete?: (job: QuantumJob) => void;
  onProcessorStatusChange?: (processor: QuantumProcessor) => void;
}

const EnterpriseQuantumInfra: React.FC<EnterpriseQuantumInfraProps> = ({
  tenantId = 'default',
  onJobComplete,
  onProcessorStatusChange
}) => {
  const [processors, setProcessors] = useState<QuantumProcessor[]>([]);
  const [jobs, setJobs] = useState<QuantumJob[]>([]);
  const [apis, setApis] = useState<QuantumAPI[]>([]);
  const [activeTab, setActiveTab] = useState<'processors' | 'jobs' | 'apis' | 'monitoring'>('processors');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initializeProcessors();
    loadJobs();
    loadAPIs();
  }, []);

  const initializeProcessors = () => {
    const initialProcessors: QuantumProcessor[] = [
      {
        id: '1',
        name: 'IBM Eagle',
        provider: 'IBM',
        qubits: 127,
        connectivity: 'Heavy-hex',
        coherenceTime: 150,
        gateFidelity: 0.995,
        status: 'online',
        lastCalibration: new Date(Date.now() - 86400000 * 2),
        utilization: 0.75
      },
      {
        id: '2',
        name: 'Google Sycamore',
        provider: 'Google',
        qubits: 54,
        connectivity: '2D Grid',
        coherenceTime: 25,
        gateFidelity: 0.997,
        status: 'online',
        lastCalibration: new Date(Date.now() - 86400000),
        utilization: 0.60
      },
      {
        id: '3',
        name: 'IonQ Forte',
        provider: 'IonQ',
        qubits: 36,
        connectivity: 'All-to-all',
        coherenceTime: 1000,
        gateFidelity: 0.999,
        status: 'maintenance',
        lastCalibration: new Date(Date.now() - 86400000 * 7),
        utilization: 0.0
      },
      {
        id: '4',
        name: 'Amazon Braket',
        provider: 'Amazon',
        qubits: 32,
        connectivity: 'Linear',
        coherenceTime: 50,
        gateFidelity: 0.993,
        status: 'online',
        lastCalibration: new Date(Date.now() - 86400000 * 3),
        utilization: 0.45
      }
    ];

    setProcessors(initialProcessors);
  };

  const loadJobs = () => {
    const initialJobs: QuantumJob[] = [
      {
        id: '1',
        name: 'Portfolio Optimization',
        algorithm: 'QAOA',
        processorId: '1',
        status: 'completed',
        submittedAt: new Date(Date.now() - 86400000 * 2),
        startedAt: new Date(Date.now() - 86400000 * 2 + 300000),
        completedAt: new Date(Date.now() - 86400000 * 2 + 900000),
        executionTime: 600000,
        result: { optimalPortfolio: [0.3, 0.25, 0.2, 0.15, 0.1], expectedReturn: 0.142 },
        priority: 'high'
      },
      {
        id: '2',
        name: 'Molecular Simulation',
        algorithm: 'VQE',
        processorId: '2',
        status: 'running',
        submittedAt: new Date(Date.now() - 3600000),
        startedAt: new Date(Date.now() - 1800000),
        priority: 'critical'
      },
      {
        id: '3',
        name: 'Traffic Optimization',
        algorithm: 'Grover',
        processorId: '4',
        status: 'queued',
        submittedAt: new Date(Date.now() - 1800000),
        priority: 'medium'
      }
    ];

    setJobs(initialJobs);
  };

  const loadAPIs = () => {
    const initialAPIs: QuantumAPI[] = [
      {
        id: '1',
        name: 'Quantum Computing API v2.1',
        endpoint: 'https://api.garlaws.com/quantum/v2.1',
        version: '2.1.0',
        authentication: 'oauth',
        rateLimit: 1000,
        status: 'active',
        lastUsed: new Date(Date.now() - 3600000),
        usage: 85600
      },
      {
        id: '2',
        name: 'Quantum Algorithm Library',
        endpoint: 'https://api.garlaws.com/quantum/algorithms',
        version: '1.8.2',
        authentication: 'api-key',
        rateLimit: 500,
        status: 'active',
        lastUsed: new Date(Date.now() - 7200000),
        usage: 42300
      },
      {
        id: '3',
        name: 'Legacy Quantum API',
        endpoint: 'https://api.garlaws.com/quantum/v1',
        version: '1.5.3',
        authentication: 'jwt',
        rateLimit: 100,
        status: 'deprecated',
        lastUsed: new Date(Date.now() - 86400000 * 30),
        usage: 12500
      }
    ];

    setApis(initialAPIs);
  };

  const submitQuantumJob = async (algorithm: string, processorId: string, priority: QuantumJob['priority']) => {
    setIsSubmitting(true);
    try {
      // Simulate job submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newJob: QuantumJob = {
        id: Date.now().toString(),
        name: `${algorithm} Job`,
        algorithm,
        processorId,
        status: 'queued',
        submittedAt: new Date(),
        priority
      };

      setJobs(prev => [newJob, ...prev]);

      // Simulate job completion after some time
      setTimeout(() => {
        setJobs(prev => prev.map(job =>
          job.id === newJob.id ? {
            ...job,
            status: 'completed',
            startedAt: new Date(),
            completedAt: new Date(Date.now() + 300000),
            executionTime: 300000,
            result: { success: true, output: 'Quantum computation completed' }
          } : job
        ));

        if (onJobComplete) {
          onJobComplete(newJob);
        }
      }, 10000);

    } catch (error) {
      console.error('Job submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'IBM': return 'bg-blue-100 text-blue-800';
      case 'Google': return 'bg-red-100 text-red-800';
      case 'Rigetti': return 'bg-purple-100 text-purple-800';
      case 'IonQ': return 'bg-green-100 text-green-800';
      case 'Amazon': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-500';
      case 'medium': return 'bg-blue-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-600" />
            Enterprise Quantum Infrastructure
          </h2>
          <p className="text-gray-600 mt-1">Scalable quantum computing platform with enterprise APIs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Infrastructure: Operational
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {processors.filter(p => p.status === 'online').length} Online Processors
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="processors" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Quantum Processors
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Job Management
          </TabsTrigger>
          <TabsTrigger value="apis" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            API Management
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processors" className="space-y-6">
          {/* Quantum Processors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {processors.map((processor) => (
              <Card key={processor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{processor.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getProviderColor(processor.provider)}>
                          {processor.provider}
                        </Badge>
                        <Badge className={`${getStatusColor(processor.status)} text-white`}>
                          {processor.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Qubits</p>
                        <p className="font-semibold">{processor.qubits}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Connectivity</p>
                        <p className="font-semibold">{processor.connectivity}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Coherence Time</p>
                        <p className="font-semibold">{processor.coherenceTime}μs</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gate Fidelity</p>
                        <p className="font-semibold">{(processor.gateFidelity * 100).toFixed(3)}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Utilization</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processor.utilization * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(processor.utilization * 100).toFixed(1)}% utilization
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Calibrate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {/* Job Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Quantum Job</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>QAOA</option>
                    <option>VQE</option>
                    <option>Grover Search</option>
                    <option>Quantum Fourier Transform</option>
                    <option>Amplitude Estimation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processor</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {processors.filter(p => p.status === 'online').map(processor => (
                      <option key={processor.id} value={processor.id}>
                        {processor.name} ({processor.qubits} qubits)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={() => submitQuantumJob('QAOA', '1', 'medium')}
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting Job...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Submit Quantum Job
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Job Queue */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Queue & History</h3>
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{job.name}</h4>
                      <p className="text-sm text-gray-600">
                        {job.algorithm} on {processors.find(p => p.id === job.processorId)?.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getJobStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(job.priority)} text-white`}>
                        {job.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-semibold">{job.submittedAt.toLocaleString()}</p>
                    </div>
                    {job.startedAt && (
                      <div>
                        <p className="text-gray-600">Started</p>
                        <p className="font-semibold">{job.startedAt.toLocaleString()}</p>
                      </div>
                    )}
                    {job.executionTime && (
                      <div>
                        <p className="text-gray-600">Execution Time</p>
                        <p className="font-semibold">{(job.executionTime / 1000).toFixed(2)}s</p>
                      </div>
                    )}
                    {job.completedAt && (
                      <div>
                        <p className="text-gray-600">Completed</p>
                        <p className="font-semibold">{job.completedAt.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          {/* API Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apis.map((api) => (
              <Card key={api.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{api.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">v{api.version}</Badge>
                    <Badge variant={api.status === 'active' ? 'success' : 'secondary'}>
                      {api.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Endpoint</p>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                        {api.endpoint}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Authentication</p>
                        <p className="font-semibold capitalize">{api.authentication.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Rate Limit</p>
                        <p className="font-semibold">{api.rateLimit} req/min</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Last Used</p>
                        <p className="font-semibold">{api.lastUsed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Usage</p>
                        <p className="font-semibold">{api.usage.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Documentation
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Generate API Key
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {/* System Monitoring Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Server className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {processors.filter(p => p.status === 'online').length}
                </p>
                <p className="text-sm text-gray-600">Active Processors</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {jobs.filter(j => j.status === 'running').length}
                </p>
                <p className="text-sm text-gray-600">Running Jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {jobs.filter(j => j.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed Jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {apis.filter(a => a.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Active APIs</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Average Processor Utilization</span>
                    <span className="text-sm text-gray-600">
                      {(processors.reduce((sum, p) => sum + p.utilization, 0) / processors.length * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={processors.reduce((sum, p) => sum + p.utilization, 0) / processors.length * 100}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="text-sm text-gray-600">45ms average</span>
                  </div>
                  <Progress value={75} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">System Uptime</span>
                    <span className="text-sm text-gray-600">99.98%</span>
                  </div>
                  <Progress value={99.98} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseQuantumInfra;