// ============================================================
// RESILIO — Dummy Dataset for Demo
// ============================================================

export const suppliers = [
  // SEMICONDUCTORS
  { id: 'S001', name: 'TSMC', country: 'Taiwan', lat: 24.05, lng: 120.52, riskScore: 78, tier: 1, industry: 'Semiconductors', employees: 73000, revenue: '$75B', established: 1987, concentration: 'High', financialStability: 62, geopoliticalRisk: 85, disasterRisk: 65, transportRisk: 40, description: 'World largest semiconductor foundry' },
  { id: 'S002', name: 'Samsung Foundry', country: 'South Korea', lat: 37.56, lng: 126.97, riskScore: 52, tier: 1, industry: 'Semiconductors', employees: 270000, revenue: '$200B', established: 1969, concentration: 'High', financialStability: 88, geopoliticalRisk: 55, disasterRisk: 30, transportRisk: 35, description: 'Global electronics and chip manufacturer' },
  { id: 'S003', name: 'Intel Fab', country: 'USA', lat: 45.52, lng: -122.68, riskScore: 35, tier: 1, industry: 'Semiconductors', employees: 121000, revenue: '$63B', established: 1968, concentration: 'Medium', financialStability: 82, geopoliticalRisk: 20, disasterRisk: 25, transportRisk: 30, description: 'US-based semiconductor fabrication' },
  { id: 'S004', name: 'SK Hynix', country: 'South Korea', lat: 37.41, lng: 127.52, riskScore: 48, tier: 2, industry: 'Semiconductors', employees: 30000, revenue: '$30B', established: 1983, concentration: 'High', financialStability: 80, geopoliticalRisk: 58, disasterRisk: 32, transportRisk: 38, description: 'Memory chip specialist' },
  { id: 'S005', name: 'Micron Technology', country: 'USA', lat: 43.61, lng: -116.20, riskScore: 30, tier: 2, industry: 'Semiconductors', employees: 43000, revenue: '$21B', established: 1978, concentration: 'Medium', financialStability: 78, geopoliticalRisk: 22, disasterRisk: 28, transportRisk: 25, description: 'Memory and storage solutions' },
  { id: 'S006', name: 'Rare Earth Mining Co', country: 'China', lat: 26.07, lng: 119.30, riskScore: 88, tier: 3, industry: 'Semiconductors', employees: 5000, revenue: '$2B', established: 2001, concentration: 'Critical', financialStability: 50, geopoliticalRisk: 92, disasterRisk: 45, transportRisk: 72, description: 'Rare earth mineral supplier for chips' },
  { id: 'S007', name: 'ASML Netherlands', country: 'Netherlands', lat: 51.44, lng: 5.47, riskScore: 22, tier: 2, industry: 'Semiconductors', employees: 39000, revenue: '$21B', established: 1984, concentration: 'Critical', financialStability: 92, geopoliticalRisk: 18, disasterRisk: 15, transportRisk: 20, description: 'Sole EUV lithography machine manufacturer' },

  // PHARMACEUTICALS
  { id: 'P001', name: 'Pfizer Chennai', country: 'India', lat: 13.08, lng: 80.27, riskScore: 42, tier: 1, industry: 'Pharmaceuticals', employees: 8500, revenue: '$8B', established: 1955, concentration: 'Medium', financialStability: 85, geopoliticalRisk: 38, disasterRisk: 58, transportRisk: 45, description: 'API and formulation manufacturing' },
  { id: 'P002', name: 'Sinopharm Base', country: 'China', lat: 30.57, lng: 114.27, riskScore: 65, tier: 1, industry: 'Pharmaceuticals', employees: 150000, revenue: '$25B', established: 1998, concentration: 'High', financialStability: 72, geopoliticalRisk: 70, disasterRisk: 42, transportRisk: 55, description: 'Chinese state pharma company' },
  { id: 'P003', name: 'Bayer Leverkusen', country: 'Germany', lat: 51.03, lng: 6.98, riskScore: 28, tier: 1, industry: 'Pharmaceuticals', employees: 101000, revenue: '$47B', established: 1863, concentration: 'Low', financialStability: 90, geopoliticalRisk: 15, disasterRisk: 12, transportRisk: 20, description: 'Pharmaceutical and life sciences' },
  { id: 'P004', name: 'Active Pharma India', country: 'India', lat: 17.44, lng: 78.38, riskScore: 55, tier: 2, industry: 'Pharmaceuticals', employees: 3200, revenue: '$1.2B', established: 2005, concentration: 'High', financialStability: 65, geopoliticalRisk: 40, disasterRisk: 62, transportRisk: 48, description: 'Active pharmaceutical ingredient supplier' },
  { id: 'P005', name: 'Chemical Precursors Ltd', country: 'China', lat: 31.23, lng: 121.47, riskScore: 72, tier: 3, industry: 'Pharmaceuticals', employees: 1800, revenue: '$0.8B', established: 2009, concentration: 'Critical', financialStability: 58, geopoliticalRisk: 78, disasterRisk: 38, transportRisk: 65, description: 'Sole supplier of key chemical precursors' },

  // AUTOMOTIVE
  { id: 'A001', name: 'Toyota Supply Hub', country: 'Japan', lat: 35.08, lng: 137.15, riskScore: 32, tier: 1, industry: 'Automotive', employees: 370000, revenue: '$274B', established: 1937, concentration: 'Medium', financialStability: 95, geopoliticalRisk: 25, disasterRisk: 55, transportRisk: 30, description: 'Automotive manufacturing and assembly' },
  { id: 'A002', name: 'CATL Battery', country: 'China', lat: 26.58, lng: 119.00, riskScore: 68, tier: 1, industry: 'Automotive', employees: 95000, revenue: '$36B', established: 2011, concentration: 'High', financialStability: 75, geopoliticalRisk: 75, disasterRisk: 48, transportRisk: 55, description: 'World #1 EV battery manufacturer' },
  { id: 'A003', name: 'Bosch Germany', country: 'Germany', lat: 48.77, lng: 9.18, riskScore: 26, tier: 2, industry: 'Automotive', employees: 420000, revenue: '$93B', established: 1886, concentration: 'Low', financialStability: 92, geopoliticalRisk: 18, disasterRisk: 14, transportRisk: 18, description: 'Automotive components and electronics' },
  { id: 'A004', name: 'Lithium Americas', country: 'Argentina', lat: -24.18, lng: -66.30, riskScore: 75, tier: 3, industry: 'Automotive', employees: 900, revenue: '$0.5B', established: 2007, concentration: 'Critical', financialStability: 45, geopoliticalRisk: 68, disasterRisk: 55, transportRisk: 72, description: 'Lithium mining for EV batteries' },
  { id: 'A005', name: 'Denso Corp', country: 'Japan', lat: 34.89, lng: 137.22, riskScore: 35, tier: 2, industry: 'Automotive', employees: 168000, revenue: '$47B', established: 1949, concentration: 'Medium', financialStability: 88, geopoliticalRisk: 28, disasterRisk: 52, transportRisk: 32, description: 'Auto parts and technology systems' },

  // ENERGY
  { id: 'E001', name: 'Saudi Aramco', country: 'Saudi Arabia', lat: 26.30, lng: 50.20, riskScore: 58, tier: 1, industry: 'Energy', employees: 66000, revenue: '$604B', established: 1933, concentration: 'High', financialStability: 95, geopoliticalRisk: 65, disasterRisk: 35, transportRisk: 50, description: 'World largest oil producer' },
  { id: 'E002', name: 'Gazprom Pipeline', country: 'Russia', lat: 55.75, lng: 37.62, riskScore: 92, tier: 1, industry: 'Energy', employees: 462000, revenue: '$110B', established: 1989, concentration: 'Critical', financialStability: 60, geopoliticalRisk: 98, disasterRisk: 30, transportRisk: 80, description: 'Natural gas and energy distribution' },
  { id: 'E003', name: 'Vestas Wind', country: 'Denmark', lat: 56.00, lng: 9.02, riskScore: 20, tier: 1, industry: 'Energy', employees: 29000, revenue: '$17B', established: 1945, concentration: 'Low', financialStability: 85, geopoliticalRisk: 12, disasterRisk: 18, transportRisk: 22, description: 'Wind turbine manufacturer and installer' },
  { id: 'E004', name: 'Cobalt Congo', country: 'DR Congo', lat: -11.67, lng: 27.47, riskScore: 95, tier: 3, industry: 'Energy', employees: 2200, revenue: '$0.9B', established: 2015, concentration: 'Critical', financialStability: 30, geopoliticalRisk: 98, disasterRisk: 60, transportRisk: 88, description: 'Cobalt mining for batteries and electronics' },

  // FOOD
  { id: 'F001', name: 'Cargill Grain', country: 'USA', lat: 44.97, lng: -93.27, riskScore: 25, tier: 1, industry: 'Food', employees: 155000, revenue: '$165B', established: 1865, concentration: 'Low', financialStability: 90, geopoliticalRisk: 20, disasterRisk: 32, transportRisk: 25, description: 'Agricultural commodities trading' },
  { id: 'F002', name: 'Ukraine Wheat', country: 'Ukraine', lat: 49.44, lng: 32.06, riskScore: 88, tier: 1, industry: 'Food', employees: 45000, revenue: '$8B', established: 1995, concentration: 'High', financialStability: 40, geopoliticalRisk: 95, disasterRisk: 50, transportRisk: 85, description: 'Major global wheat and grain exporter' },
  { id: 'F003', name: 'ADM Processing', country: 'USA', lat: 39.79, lng: -89.64, riskScore: 22, tier: 2, industry: 'Food', employees: 40000, revenue: '$95B', established: 1902, concentration: 'Low', financialStability: 88, geopoliticalRisk: 18, disasterRisk: 28, transportRisk: 22, description: 'Agricultural processing and trading' },
  { id: 'F004', name: 'Fonterra Dairy', country: 'New Zealand', lat: -43.53, lng: 172.63, riskScore: 30, tier: 1, industry: 'Food', employees: 20000, revenue: '$20B', established: 2001, concentration: 'Medium', financialStability: 80, geopoliticalRisk: 15, disasterRisk: 45, transportRisk: 35, description: 'Global dairy cooperative' },
];

export const supplyChainLinks = [
  // Semiconductor chain
  { source: 'S001', target: 'S006', strength: 0.9 },
  { source: 'S001', target: 'S007', strength: 0.8 },
  { source: 'S002', target: 'S004', strength: 0.7 },
  { source: 'S003', target: 'S005', strength: 0.6 },
  { source: 'S004', target: 'S006', strength: 0.8 },

  // Automotive chain
  { source: 'A001', target: 'A002', strength: 0.9 },
  { source: 'A001', target: 'A003', strength: 0.7 },
  { source: 'A001', target: 'A005', strength: 0.8 },
  { source: 'A002', target: 'A004', strength: 0.95 },

  // Pharma chain
  { source: 'P001', target: 'P004', strength: 0.7 },
  { source: 'P002', target: 'P005', strength: 0.9 },
  { source: 'P003', target: 'P004', strength: 0.5 },

  // Energy chain
  { source: 'E001', target: 'S001', strength: 0.4 },
  { source: 'E002', target: 'P002', strength: 0.3 },
  { source: 'E004', target: 'A002', strength: 0.9 },

  // Food chain
  { source: 'F001', target: 'F003', strength: 0.7 },
  { source: 'F002', target: 'F003', strength: 0.6 },
];

export const supplierHierarchy = {
  name: 'Global Supply Network',
  children: [
    {
      name: 'Automotive OEM',
      id: 'A001',
      riskScore: 32,
      children: [
        {
          name: 'Battery System',
          id: 'A002',
          riskScore: 68,
          children: [
            { name: 'Lithium Mining', id: 'A004', riskScore: 75, children: [] },
            { name: 'Cobalt Extraction', id: 'E004', riskScore: 95, children: [] },
          ]
        },
        {
          name: 'Electronics Module',
          id: 'A003',
          riskScore: 26,
          children: [
            { name: 'Chip Foundry', id: 'S001', riskScore: 78, children: [
              { name: 'Rare Earth Mining', id: 'S006', riskScore: 88, children: [] },
              { name: 'EUV Equipment', id: 'S007', riskScore: 22, children: [] },
            ]},
          ]
        },
        { name: 'Auto Parts', id: 'A005', riskScore: 35, children: [] },
      ]
    },
    {
      name: 'Pharma Company',
      id: 'P003',
      riskScore: 28,
      children: [
        {
          name: 'API Manufacturer India',
          id: 'P001',
          riskScore: 42,
          children: [
            { name: 'Chemical Precursor', id: 'P005', riskScore: 72, children: [] }
          ]
        },
        {
          name: 'Pharma Base China',
          id: 'P002',
          riskScore: 65,
          children: [
            { name: 'Chemical Precursor', id: 'P005', riskScore: 72, children: [] }
          ]
        },
      ]
    },
  ]
};

export const industries = [
  {
    id: 'semiconductors',
    name: 'Semiconductors',
    icon: '🔬',
    riskLevel: 'HIGH',
    riskScore: 74,
    keyRisks: ['Taiwan Strait tension', 'Rare earth dependency', 'Single fab concentration'],
    trend: 'up',
    supplierCount: 7,
    criticalNodes: 3,
    gdpImpact: '$2.1T',
  },
  {
    id: 'pharmaceuticals',
    name: 'Pharmaceuticals',
    icon: '💊',
    riskLevel: 'MEDIUM',
    riskScore: 52,
    keyRisks: ['API concentration in India/China', 'Precursor dependency', 'Regulatory delays'],
    trend: 'stable',
    supplierCount: 5,
    criticalNodes: 2,
    gdpImpact: '$1.2T',
  },
  {
    id: 'food',
    name: 'Food & Agriculture',
    icon: '🌾',
    riskLevel: 'HIGH',
    riskScore: 68,
    keyRisks: ['Ukraine conflict impact', 'Climate disruption', 'Port congestion'],
    trend: 'up',
    supplierCount: 4,
    criticalNodes: 1,
    gdpImpact: '$0.9T',
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: '⚡',
    riskLevel: 'HIGH',
    riskScore: 72,
    keyRisks: ['Russian gas dependency', 'Cobalt geopolitics', 'Transition bottlenecks'],
    trend: 'up',
    supplierCount: 4,
    criticalNodes: 2,
    gdpImpact: '$3.8T',
  },
  {
    id: 'automotive',
    name: 'Automotive',
    icon: '🚗',
    riskLevel: 'MEDIUM',
    riskScore: 58,
    keyRisks: ['Chip shortages', 'Battery material prices', 'EV transition speed'],
    trend: 'down',
    supplierCount: 5,
    criticalNodes: 2,
    gdpImpact: '$2.9T',
  },
];

export const alerts = [
  {
    id: 'ALT001',
    type: 'CRITICAL',
    title: 'Typhoon approaching TSMC facilities',
    description: 'Category 4 typhoon predicted to make landfall within 72 hours near Hsinchu Science Park, threatening TSMC Fab 18.',
    supplier: 'TSMC',
    supplierId: 'S001',
    industry: 'Semiconductors',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'active',
    affectedVolume: '$4.2B',
    probability: 87,
  },
  {
    id: 'ALT002',
    type: 'HIGH',
    title: 'Port strike at Shanghai Container Terminal',
    description: 'Dock workers union announced indefinite strike action beginning 48 hours from now. 12,000 containers at risk.',
    supplier: 'Multiple',
    supplierId: null,
    industry: 'Multiple',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    status: 'active',
    affectedVolume: '$890M',
    probability: 92,
  },
  {
    id: 'ALT003',
    type: 'CRITICAL',
    title: 'Single Point of Failure: Cobalt supply',
    description: 'Cobalt Congo is the sole supplier of cobalt for 3 major battery manufacturers. Political unrest detected in Katanga Province.',
    supplier: 'Cobalt Congo',
    supplierId: 'E004',
    industry: 'Energy',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'active',
    affectedVolume: '$3.1B',
    probability: 78,
  },
  {
    id: 'ALT004',
    type: 'HIGH',
    title: 'Russia energy export restrictions widened',
    description: 'Gazprom announced further export restrictions affecting European pharmaceutical precursor production.',
    supplier: 'Gazprom Pipeline',
    supplierId: 'E002',
    industry: 'Energy',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: 'active',
    affectedVolume: '$1.5B',
    probability: 95,
  },
  {
    id: 'ALT005',
    type: 'MEDIUM',
    title: 'Lithium price spike detected',
    description: 'Lithium carbonate prices rose 23% this week following production halt at Atacama facilities.',
    supplier: 'Lithium Americas',
    supplierId: 'A004',
    industry: 'Automotive',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'active',
    affectedVolume: '$620M',
    probability: 68,
  },
  {
    id: 'ALT006',
    type: 'MEDIUM',
    title: 'Wheat export corridor disruption',
    description: 'Black Sea shipping lane temporarily closed affecting Ukraine grain exports. 2.3M tonnes delayed.',
    supplier: 'Ukraine Wheat',
    supplierId: 'F002',
    industry: 'Food',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'monitoring',
    affectedVolume: '$450M',
    probability: 55,
  },
  {
    id: 'ALT007',
    type: 'LOW',
    title: 'Mild supply delay at Bosch Germany',
    description: 'Rail network disruption in Baden-Württemberg causing 3-5 day delays for auto component shipments.',
    supplier: 'Bosch Germany',
    supplierId: 'A003',
    industry: 'Automotive',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'resolved',
    affectedVolume: '$85M',
    probability: 35,
  },
];

export const singlePointsOfFailure = [
  {
    id: 'SPOF001',
    name: 'TSMC — Advanced Node Manufacturing',
    description: 'TSMC produces over 90% of sub-5nm chips globally. No alternative exists for advanced logic chips.',
    riskScore: 94,
    industry: 'Semiconductors',
    supplierId: 'S001',
    affectedProducts: ['AI Processors', 'iPhone chips', 'Auto ECUs', 'Defense systems'],
    annualValue: '$420B',
    alternativesAvailable: 0,
    mitigationScore: 12,
  },
  {
    id: 'SPOF002',
    name: 'Cobalt Congo — Battery Cobalt',
    description: '70% of global cobalt originates from DRC. Political instability creates extreme concentration risk.',
    riskScore: 95,
    industry: 'Energy',
    supplierId: 'E004',
    affectedProducts: ['EV Batteries', 'Consumer electronics batteries', 'Aerospace components'],
    annualValue: '$89B',
    alternativesAvailable: 1,
    mitigationScore: 18,
  },
  {
    id: 'SPOF003',
    name: 'ASML — EUV Lithography Machines',
    description: 'ASML is the sole manufacturer of EUV machines required for sub-7nm chip production globally.',
    riskScore: 88,
    industry: 'Semiconductors',
    supplierId: 'S007',
    affectedProducts: ['All advanced chips', 'Memory chips (DRAM)', 'Mobile processors'],
    annualValue: '$890B',
    alternativesAvailable: 0,
    mitigationScore: 5,
  },
  {
    id: 'SPOF004',
    name: 'Chemical Precursors Ltd — Pharma Inputs',
    description: 'Sole supplier for 3 critical drug precursors. A shutdown would impact 40% of global antibiotic production.',
    riskScore: 82,
    industry: 'Pharmaceuticals',
    supplierId: 'P005',
    affectedProducts: ['Amoxicillin', 'Paracetamol', 'Ibuprofen', 'Metformin'],
    annualValue: '$34B',
    alternativesAvailable: 1,
    mitigationScore: 22,
  },
  {
    id: 'SPOF005',
    name: 'Gazprom — European Energy',
    description: 'Despite diversification, Gazprom still supplies 25% of European industrial gas for chemical and pharma processes.',
    riskScore: 92,
    industry: 'Energy',
    supplierId: 'E002',
    affectedProducts: ['Fertilizers', 'Chemical feedstocks', 'Heating fuel', 'Power generation'],
    annualValue: '$240B',
    alternativesAvailable: 2,
    mitigationScore: 35,
  },
];

export const alternativeSuppliers = [
  {
    id: 'ALT_S001',
    targetSupplierId: 'S001',
    targetSupplierName: 'TSMC',
    alternatives: [
      { name: 'Intel Foundry Services', country: 'USA', costIndex: 115, riskScore: 35, deliveryWeeks: 18, reliabilityScore: 82, transitRisk: 'LOW', notes: 'Limited capacity for <5nm nodes' },
      { name: 'Samsung Foundry', country: 'South Korea', costIndex: 108, riskScore: 52, deliveryWeeks: 14, reliabilityScore: 88, transitRisk: 'LOW', notes: 'Strong alternative for most nodes' },
      { name: 'GlobalFoundries', country: 'USA', costIndex: 102, riskScore: 28, deliveryWeeks: 12, reliabilityScore: 80, transitRisk: 'LOW', notes: 'Mature nodes only (>7nm)' },
    ]
  },
  {
    id: 'ALT_E004',
    targetSupplierId: 'E004',
    targetSupplierName: 'Cobalt Congo',
    alternatives: [
      { name: 'Glencore Zambia', country: 'Zambia', costIndex: 118, riskScore: 58, deliveryWeeks: 8, reliabilityScore: 72, transitRisk: 'MEDIUM', notes: 'Lower grade ore, partial substitute' },
      { name: 'Umicore Recycling', country: 'Belgium', costIndex: 135, riskScore: 18, deliveryWeeks: 6, reliabilityScore: 90, transitRisk: 'LOW', notes: 'Recycled cobalt, limited scale' },
    ]
  },
  {
    id: 'ALT_P005',
    targetSupplierId: 'P005',
    targetSupplierName: 'Chemical Precursors Ltd',
    alternatives: [
      { name: 'BASF Pharma Chem', country: 'Germany', costIndex: 145, riskScore: 22, deliveryWeeks: 10, reliabilityScore: 94, transitRisk: 'LOW', notes: 'Premium pricing, highest quality' },
      { name: 'Sigma Pharma India', country: 'India', costIndex: 98, riskScore: 48, deliveryWeeks: 7, reliabilityScore: 78, transitRisk: 'LOW', notes: 'Cost-effective, needs qualification' },
    ]
  },
];

export const disruptionPredictions = [
  { week: 'Week 1', semiconductors: 62, pharmaceuticals: 28, food: 75, energy: 78, automotive: 45 },
  { week: 'Week 2', semiconductors: 71, pharmaceuticals: 32, food: 70, energy: 82, automotive: 52 },
  { week: 'Week 3', semiconductors: 68, pharmaceuticals: 35, food: 65, energy: 85, automotive: 55 },
  { week: 'Week 4', semiconductors: 74, pharmaceuticals: 38, food: 68, energy: 80, automotive: 58 },
];

export const riskTrend = [
  { month: 'Aug', global: 52, geopolitical: 58, climate: 45, financial: 48 },
  { month: 'Sep', global: 55, geopolitical: 62, climate: 48, financial: 45 },
  { month: 'Oct', global: 58, geopolitical: 65, climate: 55, financial: 50 },
  { month: 'Nov', global: 62, geopolitical: 68, climate: 58, financial: 55 },
  { month: 'Dec', global: 65, geopolitical: 70, climate: 52, financial: 60 },
  { month: 'Jan', global: 68, geopolitical: 75, climate: 55, financial: 58 },
  { month: 'Feb', global: 72, geopolitical: 78, climate: 60, financial: 62 },
  { month: 'Mar', global: 70, geopolitical: 76, climate: 65, financial: 64 },
];

export const ports = [
  { id: 'PT001', name: 'Port of Shanghai', lat: 31.23, lng: 121.47, congestionLevel: 'HIGH', country: 'China', throughput: '47M TEU/yr', status: 'strike_risk' },
  { id: 'PT002', name: 'Port of Rotterdam', lat: 51.95, lng: 4.13, congestionLevel: 'LOW', country: 'Netherlands', throughput: '15M TEU/yr', status: 'normal' },
  { id: 'PT003', name: 'Port of Singapore', lat: 1.29, lng: 103.85, congestionLevel: 'MEDIUM', country: 'Singapore', throughput: '37M TEU/yr', status: 'normal' },
  { id: 'PT004', name: 'Port of Los Angeles', lat: 33.74, lng: -118.27, congestionLevel: 'MEDIUM', country: 'USA', throughput: '10M TEU/yr', status: 'normal' },
  { id: 'PT005', name: 'Port of Busan', lat: 35.10, lng: 129.04, congestionLevel: 'LOW', country: 'South Korea', throughput: '22M TEU/yr', status: 'normal' },
];

export const transportRoutes = [
  { id: 'TR001', from: 'PT001', to: 'PT004', name: 'Trans-Pacific', riskScore: 65, type: 'sea', status: 'delayed' },
  { id: 'TR002', from: 'PT002', to: 'PT001', name: 'Asia-Europe Main', riskScore: 45, type: 'sea', status: 'normal' },
  { id: 'TR003', from: 'PT003', to: 'PT002', name: 'Malacca-Suez', riskScore: 55, type: 'sea', status: 'normal' },
];

export const simulationScenarios = [
  {
    id: 'SIM001',
    name: 'TSMC Taiwan shutdown',
    supplierId: 'S001',
    description: 'Complete factory closure due to military conflict or natural disaster',
    duration: '3-6 months',
    affectedSuppliers: ['S002', 'S004', 'A001', 'A002', 'P001'],
    economicImpact: '$2.1T',
    affectedFactories: 847,
    recoveryTime: '18-24 months',
  },
  {
    id: 'SIM002',
    name: 'Suez Canal closure',
    supplierId: null,
    description: 'Blocking of Suez Canal for 30+ days, rerouting around Africa',
    duration: '1-3 months',
    affectedSuppliers: ['P001', 'P002', 'E001', 'A003'],
    economicImpact: '$450B',
    affectedFactories: 340,
    recoveryTime: '3-6 months',
  },
  {
    id: 'SIM003',
    name: 'China-Taiwan semiconductor embargo',
    supplierId: 'S006',
    description: 'Trade embargo blocking rare earth exports from China to Taiwan',
    duration: 'Indefinite',
    affectedSuppliers: ['S001', 'S002', 'S004', 'A002'],
    economicImpact: '$890B',
    affectedFactories: 562,
    recoveryTime: '24-36 months',
  },
];

export const heatmapRegions = [
  { name: 'East Asia', lat: 32, lng: 118, intensity: 0.85, reason: 'Geopolitical, Semiconductor concentration' },
  { name: 'Eastern Europe', lat: 50, lng: 32, intensity: 0.92, reason: 'Active conflict, supply disruption' },
  { name: 'DR Congo', lat: -6, lng: 24, intensity: 0.90, reason: 'Political instability, mineral dependency' },
  { name: 'South Asia', lat: 20, lng: 78, intensity: 0.55, reason: 'Climate risk, infrastructure challenges' },
  { name: 'Middle East', lat: 25, lng: 48, intensity: 0.65, reason: 'Geopolitical tension, oil dependency' },
  { name: 'West Africa', lat: 8, lng: 1, intensity: 0.60, reason: 'Infrastructure gaps, political risk' },
  { name: 'Andes Region', lat: -25, lng: -68, intensity: 0.62, reason: 'Lithium mining, water scarcity' },
  { name: 'Siberia', lat: 62, lng: 100, intensity: 0.48, reason: 'Energy production, permafrost risks' },
  { name: 'Western Europe', lat: 50, lng: 10, intensity: 0.25, reason: 'Low risk, strong institutions' },
  { name: 'North America', lat: 40, lng: -100, intensity: 0.22, reason: 'Low risk, diversified economy' },
  { name: 'Australia', lat: -25, lng: 133, intensity: 0.30, reason: 'Climate risk, isolated location' },
  { name: 'SE Asia', lat: 10, lng: 107, intensity: 0.50, reason: 'Political variance, climate exposure' },
];

export const copilotResponses = {
  semiconductor: {
    keywords: ['semiconductor', 'chip', 'taiwan', 'tsmc', 'fab'],
    response: `**Semiconductor Supply Chain Analysis:**\n\n🔴 **Critical Risk Detected**\n\n• **TSMC** (Taiwan) — Risk Score: 78/100. Produces 90%+ of sub-5nm chips globally. Taiwan Strait geopolitical tension elevates risk significantly.\n\n• **Rare Earth Mining Co** (China) — Risk Score: 88/100. Single supplier for neodymium and other rare earths critical to chip manufacturing.\n\n• **ASML** (Netherlands) — Risk Score: 22/100 but is a CRITICAL single point of failure. Only company globally producing EUV lithography machines needed for advanced chips.\n\n**Recommended Actions:**\n1. Diversify to Samsung Foundry for non-advanced nodes\n2. Stockpile 3-6 month chip inventory\n3. Invest in domestic fab capacity (IFS, GlobalFoundries)\n\n**Predicted Disruption Risk Next 4 Weeks: 74%**`,
  },
  pharma: {
    keywords: ['pharma', 'pharmaceutical', 'medicine', 'drug', 'api'],
    response: `**Pharmaceutical Supply Chain Analysis:**\n\n🟡 **Elevated Risk Detected**\n\n• **Chemical Precursors Ltd** (China) — Risk Score: 72/100. Sole supplier for 3 critical drug precursors. A 30-day shutdown would affect 40% of global antibiotic production.\n\n• **Active Pharma India** — Risk Score: 55/100. API concentration in India creates geographic risk under monsoon and regulatory constraints.\n\n**Supply Chain Depth:** 3-tier dependency from Bayer → API India → Chemical Precursors China\n\n**Recommended Actions:**\n1. Dual-source chemical precursors from BASF Germany\n2. Build 90-day API safety stock\n3. Qualify Sigma Pharma India as backup\n\n**Predicted Disruption Risk Next 4 Weeks: 38%**`,
  },
  risk: {
    keywords: ['risk', 'risky', 'danger', 'threat', 'vulnerable'],
    response: `**Top Risky Suppliers Right Now:**\n\n1. 🔴 **Cobalt Congo** (DRC) — 95/100 — Political conflict, sole cobalt source\n2. 🔴 **Gazprom Pipeline** (Russia) — 92/100 — Active sanctions, conflict risk\n3. 🔴 **Rare Earth Mining Co** (China) — 88/100 — Export restriction risk\n4. 🔴 **Ukraine Wheat** (Ukraine) — 88/100 — Active conflict zone\n5. 🔴 **TSMC** (Taiwan) — 78/100 — Geopolitical concentration\n\n**Common Themes:**\n• Geopolitical conflicts affecting 68% of high-risk suppliers\n• Geographic concentration: 40% of critical suppliers in 2 countries\n• Single-point-of-failure: 5 critical nodes with no substitutes\n\n**Global Risk Level: HIGH (70/100)**`,
  },
  default: {
    keywords: [],
    response: `**Supply Chain Copilot Ready**\n\nI can analyze your supply chain for:\n\n• 🔍 **Risk Assessment** — "Which suppliers are highest risk?"\n• ⚡ **Disruption Prediction** — "What could disrupt semiconductor supply?"\n• 🏭 **Industry Analysis** — "Analyze pharmaceutical supply chain"\n• 🗺 **Geographic Risk** — "What risks exist in Asia?"\n• 🔗 **Dependencies** — "Find hidden dependencies for automotive"\n• 🛡 **Mitigation** — "How can I reduce energy supply risk?"\n\nType any question to begin analysis.`,
  },
};

export const getSupplierById = (id) => suppliers.find(s => s.id === id);

export const getRiskColor = (score) => {
  if (score >= 70) return '#ef4444';
  if (score >= 40) return '#f59e0b';
  return '#10b981';
};

export const getRiskLevel = (score) => {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};

export const getRiskClass = (score) => {
  if (score >= 70) return 'risk-badge-high';
  if (score >= 40) return 'risk-badge-medium';
  return 'risk-badge-low';
};
