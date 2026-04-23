'use client';

import { useState, useEffect, useCallback } from 'react';

interface SmartContract {
  id: string;
  name: string;
  description: string;
  template: 'erc721' | 'erc1155' | 'property' | 'rental' | 'investment' | 'custom';
  blockchain: 'ethereum' | 'polygon' | 'solana' | 'bitcoin';
  status: 'draft' | 'compiled' | 'deployed' | 'verified';
  code: string;
  abi: any[];
  bytecode: string;
  address?: string;
  creator: string;
  createdAt: Date;
  deployedAt?: Date;
  gasEstimate?: number;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'nft' | 'defi' | 'property' | 'governance' | 'utility';
  blockchain: 'ethereum' | 'polygon' | 'solana';
  complexity: 'basic' | 'intermediate' | 'advanced';
  features: string[];
  estimatedGas: number;
  template: string;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'time' | 'event' | 'condition' | 'manual';
  action: 'execute' | 'deploy' | 'interact' | 'monitor';
  contractId: string;
  conditions: {
    field: string;
    operator: 'equals' | 'greater' | 'less' | 'contains';
    value: any;
  }[];
  enabled: boolean;
  lastExecuted?: Date;
  executions: number;
}

interface SmartContractAutomationProps {
  tenantId?: string;
  walletAddress?: string;
  onContractDeployed?: (contract: SmartContract) => void;
  onAutomationExecuted?: (rule: AutomationRule, result: any) => void;
}

const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'erc721_property',
    name: 'Property NFT (ERC-721)',
    description: 'Standard NFT contract for property tokenization with fractional ownership',
    category: 'property',
    blockchain: 'ethereum',
    complexity: 'intermediate',
    features: ['Minting', 'Transfer', 'Fractional Ownership', 'Royalties', 'Metadata'],
    estimatedGas: 2500000,
    template: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Property {
        string name;
        string location;
        uint256 valuation;
        uint256 totalShares;
        bool fractionalEnabled;
    }

    mapping(uint256 => Property) public properties;
    mapping(uint256 => mapping(address => uint256)) public fractionalShares;

    event PropertyMinted(uint256 indexed tokenId, string name, uint256 valuation);
    event SharesTransferred(uint256 indexed tokenId, address from, address to, uint256 shares);

    constructor() ERC721("PropertyNFT", "PNFT") Ownable(msg.sender) {}

    function mintProperty(
        address to,
        string memory name,
        string memory location,
        uint256 valuation,
        uint256 totalShares,
        bool fractionalEnabled,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        properties[tokenId] = Property(name, location, valuation, totalShares, fractionalEnabled);

        emit PropertyMinted(tokenId, name, valuation);
        return tokenId;
    }

    function transferFractionalShares(
        uint256 tokenId,
        address to,
        uint256 shares
    ) public {
        require(properties[tokenId].fractionalEnabled, "Fractional ownership not enabled");
        require(fractionalShares[tokenId][msg.sender] >= shares, "Insufficient shares");

        fractionalShares[tokenId][msg.sender] -= shares;
        fractionalShares[tokenId][to] += shares;

        emit SharesTransferred(tokenId, msg.sender, to, shares);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`
  },
  {
    id: 'rental_agreement',
    name: 'Smart Rental Agreement',
    description: 'Automated rental agreement with payment scheduling and dispute resolution',
    category: 'property',
    blockchain: 'polygon',
    complexity: 'advanced',
    features: ['Payment Scheduling', 'Auto-Renewal', 'Dispute Resolution', 'Property Management'],
    estimatedGas: 1800000,
    template: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RentalAgreement {
    struct Agreement {
        address landlord;
        address tenant;
        uint256 propertyId;
        uint256 monthlyRent;
        uint256 securityDeposit;
        uint256 leaseStart;
        uint256 leaseEnd;
        bool active;
        uint256 lastPayment;
        uint256 outstandingBalance;
    }

    mapping(uint256 => Agreement) public agreements;
    mapping(uint256 => uint256[]) public paymentHistory;

    uint256 public agreementCount;

    event AgreementCreated(uint256 indexed agreementId, address landlord, address tenant);
    event PaymentReceived(uint256 indexed agreementId, uint256 amount, uint256 timestamp);
    event AgreementTerminated(uint256 indexed agreementId, string reason);

    function createAgreement(
        address tenant,
        uint256 propertyId,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 leaseDuration
    ) public returns (uint256) {
        uint256 agreementId = ++agreementCount;

        agreements[agreementId] = Agreement({
            landlord: msg.sender,
            tenant: tenant,
            propertyId: propertyId,
            monthlyRent: monthlyRent,
            securityDeposit: securityDeposit,
            leaseStart: block.timestamp,
            leaseEnd: block.timestamp + leaseDuration,
            active: true,
            lastPayment: 0,
            outstandingBalance: securityDeposit
        });

        emit AgreementCreated(agreementId, msg.sender, tenant);
        return agreementId;
    }

    function makePayment(uint256 agreementId) public payable {
        Agreement storage agreement = agreements[agreementId];
        require(agreement.active, "Agreement not active");
        require(msg.sender == agreement.tenant, "Only tenant can make payments");
        require(msg.value > 0, "Payment must be greater than 0");

        agreement.outstandingBalance -= msg.value;
        agreement.lastPayment = block.timestamp;
        paymentHistory[agreementId].push(msg.value);

        emit PaymentReceived(agreementId, msg.value, block.timestamp);
    }

    function terminateAgreement(uint256 agreementId, string memory reason) public {
        Agreement storage agreement = agreements[agreementId];
        require(
            msg.sender == agreement.landlord || msg.sender == agreement.tenant,
            "Only landlord or tenant can terminate"
        );

        agreement.active = false;
        emit AgreementTerminated(agreementId, reason);
    }

    function getOutstandingBalance(uint256 agreementId) public view returns (uint256) {
        return agreements[agreementId].outstandingBalance;
    }
}`
  },
  {
    id: 'investment_fund',
    name: 'Real Estate Investment Fund',
    description: 'Decentralized investment fund for property investments with automated distributions',
    category: 'defi',
    blockchain: 'ethereum',
    complexity: 'advanced',
    features: ['Investment Pool', 'Auto Distribution', 'Governance', 'Yield Farming'],
    estimatedGas: 3200000,
    template: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateInvestmentFund is ERC20, Ownable {
    struct Investment {
        address investor;
        uint256 amount;
        uint256 shares;
        uint256 investmentDate;
        bool active;
    }

    struct PropertyInvestment {
        uint256 propertyId;
        string propertyName;
        uint256 totalInvestment;
        uint256 expectedYield;
        uint256 investmentDate;
        bool active;
    }

    mapping(address => Investment[]) public investorInvestments;
    mapping(uint256 => PropertyInvestment) public propertyInvestments;

    uint256 public totalInvested;
    uint256 public totalYield;
    uint256 public propertyCount;

    uint256 public constant INVESTMENT_FEE = 2; // 2% management fee
    uint256 public constant YIELD_DISTRIBUTION = 80; // 80% to investors

    event InvestmentMade(address indexed investor, uint256 amount, uint256 shares);
    event PropertyInvested(uint256 indexed propertyId, uint256 amount, string propertyName);
    event YieldDistributed(uint256 amount, uint256 totalInvestors);
    event Withdrawal(address indexed investor, uint256 amount);

    constructor() ERC20("Real Estate Investment Token", "REIT") Ownable(msg.sender) {}

    function invest() public payable {
        require(msg.value >= 0.1 ether, "Minimum investment is 0.1 ETH");

        uint256 fee = (msg.value * INVESTMENT_FEE) / 100;
        uint256 netInvestment = msg.value - fee;

        uint256 shares = (netInvestment * totalSupply()) / (totalInvested > 0 ? totalInvested : 1);
        if (shares == 0) shares = netInvestment / 1000000; // Minimum shares

        _mint(msg.sender, shares);
        totalInvested += netInvestment;

        investorInvestments[msg.sender].push(Investment({
            investor: msg.sender,
            amount: netInvestment,
            shares: shares,
            investmentDate: block.timestamp,
            active: true
        }));

        emit InvestmentMade(msg.sender, netInvestment, shares);
    }

    function investInProperty(
        uint256 propertyId,
        string memory propertyName,
        uint256 amount,
        uint256 expectedYield
    ) public onlyOwner {
        require(amount <= totalInvested, "Insufficient funds in fund");

        propertyInvestments[propertyId] = PropertyInvestment({
            propertyId: propertyId,
            propertyName: propertyName,
            totalInvestment: amount,
            expectedYield: expectedYield,
            investmentDate: block.timestamp,
            active: true
        });

        totalInvested -= amount;
        propertyCount++;

        emit PropertyInvested(propertyId, amount, propertyName);
    }

    function distributeYield(uint256 propertyId, uint256 yieldAmount) public onlyOwner {
        PropertyInvestment storage property = propertyInvestments[propertyId];
        require(property.active, "Property investment not active");

        uint256 investorShare = (yieldAmount * YIELD_DISTRIBUTION) / 100;
        uint256 managementFee = yieldAmount - investorShare;

        totalYield += investorShare;

        // Distribute to investors based on shares
        uint256 totalShares = totalSupply();
        if (totalShares > 0) {
            uint256 yieldPerShare = investorShare / totalShares;
            // In a real implementation, this would use a more sophisticated distribution mechanism
        }

        emit YieldDistributed(investorShare, totalSupply());
    }

    function withdraw(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 ethAmount = (amount * totalInvested) / totalSupply();
        require(address(this).balance >= ethAmount, "Insufficient contract balance");

        _burn(msg.sender, amount);
        totalInvested -= ethAmount;

        payable(msg.sender).transfer(ethAmount);

        emit Withdrawal(msg.sender, ethAmount);
    }

    function getInvestorBalance(address investor) public view returns (uint256) {
        return balanceOf(investor);
    }

    function getTotalValue() public view returns (uint256) {
        return totalInvested + totalYield;
    }
}`
  }
];

export default function SmartContractAutomation({
  tenantId = 'default',
  walletAddress = '0x742d35Cc6634C0532925a3b84d0bE8f5',
  onContractDeployed,
  onAutomationExecuted
}: SmartContractAutomationProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'contracts' | 'automation' | 'deployment'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const compileContract = useCallback(async (template: ContractTemplate): Promise<SmartContract> => {
    setIsCompiling(true);

    // Simulate compilation process
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const compiledContract: SmartContract = {
      id: `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: template.name,
      description: template.description,
      template: template.id as any,
      blockchain: template.blockchain,
      status: 'compiled',
      code: template.template,
      abi: [
        {
          "inputs": [],
          "name": "name",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      bytecode: `0x${Math.random().toString(16).substr(2, 64)}`,
      creator: walletAddress,
      createdAt: new Date(),
      gasEstimate: template.estimatedGas
    };

    setIsCompiling(false);
    return compiledContract;
  }, [walletAddress]);

  const deployContract = useCallback(async (contract: SmartContract): Promise<SmartContract> => {
    setIsDeploying(true);

    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));

    const deployedContract: SmartContract = {
      ...contract,
      status: 'deployed',
      address: `${contract.blockchain === 'ethereum' ? '0x' : contract.blockchain === 'polygon' ? '0x' : ''}${Math.random().toString(16).substr(2, 40)}`,
      deployedAt: new Date()
    };

    setIsDeploying(false);
    onContractDeployed?.(deployedContract);
    return deployedContract;
  }, [onContractDeployed]);

  const createAutomationRule = useCallback((contractId: string): AutomationRule => {
    return {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Payment Reminder',
      description: 'Automatically send payment reminders for overdue rentals',
      trigger: 'time',
      action: 'execute',
      contractId,
      conditions: [
        {
          field: 'lastPayment',
          operator: 'less',
          value: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      ],
      enabled: true,
      executions: 0
    };
  }, []);

  const executeAutomationRule = useCallback(async (rule: AutomationRule) => {
    // Simulate rule execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = { success: true, message: `Rule executed: ${rule.name}` };

    setAutomationRules(prev => prev.map(r =>
      r.id === rule.id
        ? { ...r, lastExecuted: new Date(), executions: r.executions + 1 }
        : r
    ));

    onAutomationExecuted?.(rule, result);
    return result;
  }, [onAutomationExecuted]);

  const handleTemplateSelect = useCallback(async (template: ContractTemplate) => {
    setSelectedTemplate(template);
    const contract = await compileContract(template);
    setContracts(prev => [contract, ...prev]);
    setActiveTab('contracts');
  }, [compileContract]);

  const handleContractDeploy = useCallback(async (contract: SmartContract) => {
    const deployedContract = await deployContract(contract);
    setContracts(prev => prev.map(c => c.id === contract.id ? deployedContract : c));

    // Create default automation rule
    const rule = createAutomationRule(deployedContract.id);
    setAutomationRules(prev => [...prev, rule]);
  }, [deployContract, createAutomationRule]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6B7280';
      case 'compiled': return '#F59E0B';
      case 'deployed': return '#10B981';
      case 'verified': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getBlockchainIcon = (blockchain: string) => {
    switch (blockchain) {
      case 'ethereum': return '⟠';
      case 'polygon': return '⬡';
      case 'solana': return '◎';
      case 'bitcoin': return '₿';
      default: return '⧫';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Contract Automation</h1>
            <p className="text-gray-600">Create, deploy, and automate smart contracts for property management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Wallet</div>
              <div className="font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{contracts.length}</div>
            <div className="text-sm text-gray-600">Contracts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'deployed').length}
            </div>
            <div className="text-sm text-gray-600">Deployed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{automationRules.length}</div>
            <div className="text-sm text-gray-600">Automation Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {automationRules.reduce((sum, r) => sum + r.executions, 0)}
            </div>
            <div className="text-sm text-gray-600">Executions</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'templates', label: 'Templates', icon: '📋' },
              { id: 'contracts', label: 'Contracts', icon: '📄' },
              { id: 'automation', label: 'Automation', icon: '🤖' },
              { id: 'deployment', label: 'Deployment', icon: '🚀' }
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
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Contract Templates</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Categories</option>
                    <option>NFT</option>
                    <option>DeFi</option>
                    <option>Property</option>
                    <option>Governance</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Blockchains</option>
                    <option>Ethereum</option>
                    <option>Polygon</option>
                    <option>Solana</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CONTRACT_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getBlockchainIcon(template.blockchain)}</span>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: getComplexityColor(template.complexity) }}
                      >
                        {template.complexity}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Gas: ~{template.estimatedGas.toLocaleString()}</span>
                      <span className="capitalize">{template.category}</span>
                    </div>

                    <button
                      onClick={() => handleTemplateSelect(template)}
                      disabled={isCompiling}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompiling ? 'Compiling...' : 'Use Template'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Smart Contracts</h2>

              {contracts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <div>No contracts yet</div>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Browse Templates
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getBlockchainIcon(contract.blockchain)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{contract.name}</h3>
                            <p className="text-sm text-gray-600">{contract.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 text-sm rounded-full text-white"
                            style={{ backgroundColor: getStatusColor(contract.status) }}
                          >
                            {contract.status}
                          </span>
                          {contract.status === 'compiled' && (
                            <button
                              onClick={() => handleContractDeploy(contract)}
                              disabled={isDeploying}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              {isDeploying ? 'Deploying...' : 'Deploy'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created</div>
                          <div>{contract.createdAt.toLocaleDateString()}</div>
                        </div>
                        {contract.deployedAt && (
                          <div>
                            <div className="text-gray-500">Deployed</div>
                            <div>{contract.deployedAt.toLocaleDateString()}</div>
                          </div>
                        )}
                        {contract.address && (
                          <div>
                            <div className="text-gray-500">Address</div>
                            <div className="font-mono text-xs">{contract.address.slice(0, 10)}...</div>
                          </div>
                        )}
                        {contract.gasEstimate && (
                          <div>
                            <div className="text-gray-500">Gas Estimate</div>
                            <div>{contract.gasEstimate.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Automation Rules</h2>
                <button
                  onClick={() => {
                    if (contracts.length > 0) {
                      const rule = createAutomationRule(contracts[0].id);
                      setAutomationRules(prev => [...prev, rule]);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={contracts.length === 0}
                >
                  Add Rule
                </button>
              </div>

              {automationRules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🤖</div>
                  <div>No automation rules yet</div>
                  <div className="text-sm">Deploy a contract first to create automation rules</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{rule.name}</h3>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => setAutomationRules(prev => prev.map(r =>
                                r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                              ))}
                            />
                            <span className="text-sm">Enabled</span>
                          </label>
                          <button
                            onClick={() => executeAutomationRule(rule)}
                            disabled={!rule.enabled}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            Execute
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Trigger</div>
                          <div className="capitalize">{rule.trigger}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Action</div>
                          <div className="capitalize">{rule.action}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Executions</div>
                          <div>{rule.executions}</div>
                        </div>
                        {rule.lastExecuted && (
                          <div>
                            <div className="text-gray-500">Last Executed</div>
                            <div>{rule.lastExecuted.toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deployment Tab */}
          {activeTab === 'deployment' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Deployment History</h2>

              {contracts.filter(c => c.status === 'deployed').length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🚀</div>
                  <div>No deployments yet</div>
                  <div className="text-sm">Compile and deploy contracts to see deployment history</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.filter(c => c.status === 'deployed').map((contract) => (
                    <div key={contract.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getBlockchainIcon(contract.blockchain)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{contract.name}</h3>
                            <p className="text-sm text-gray-600">{contract.description}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          Deployed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Contract Address</div>
                          <div className="font-mono text-xs break-all">{contract.address}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Deployed At</div>
                          <div>{contract.deployedAt?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Gas Used</div>
                          <div>{contract.gasEstimate?.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          View on Explorer
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                          Interact
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}