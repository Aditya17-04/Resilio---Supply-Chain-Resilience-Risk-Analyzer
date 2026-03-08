from datetime import datetime, timedelta

SUPPLIERS = [
    {"id": "S001", "name": "TSMC", "country": "Taiwan", "lat": 24.05, "lng": 120.52, "riskScore": 78, "tier": 1, "industry": "Semiconductors", "employees": 73000, "revenue": "$75B", "established": 1987, "concentration": "High", "financialStability": 62, "geopoliticalRisk": 85, "disasterRisk": 65, "transportRisk": 40, "description": "World largest semiconductor foundry"},
    {"id": "S002", "name": "Samsung Foundry", "country": "South Korea", "lat": 37.56, "lng": 126.97, "riskScore": 52, "tier": 1, "industry": "Semiconductors", "employees": 270000, "revenue": "$200B", "established": 1969, "concentration": "High", "financialStability": 88, "geopoliticalRisk": 55, "disasterRisk": 30, "transportRisk": 35, "description": "Global electronics and chip manufacturer"},
    {"id": "S003", "name": "Intel Fab", "country": "USA", "lat": 45.52, "lng": -122.68, "riskScore": 35, "tier": 1, "industry": "Semiconductors", "employees": 121000, "revenue": "$63B", "established": 1968, "concentration": "Medium", "financialStability": 82, "geopoliticalRisk": 20, "disasterRisk": 25, "transportRisk": 30, "description": "US-based semiconductor fabrication"},
    {"id": "S004", "name": "SK Hynix", "country": "South Korea", "lat": 37.41, "lng": 127.52, "riskScore": 48, "tier": 2, "industry": "Semiconductors", "employees": 30000, "revenue": "$30B", "established": 1983, "concentration": "High", "financialStability": 80, "geopoliticalRisk": 58, "disasterRisk": 32, "transportRisk": 38, "description": "Memory chip specialist"},
    {"id": "S006", "name": "Rare Earth Mining Co", "country": "China", "lat": 26.07, "lng": 119.30, "riskScore": 88, "tier": 3, "industry": "Semiconductors", "employees": 5000, "revenue": "$2B", "established": 2001, "concentration": "Critical", "financialStability": 50, "geopoliticalRisk": 92, "disasterRisk": 45, "transportRisk": 72, "description": "Rare earth mineral supplier for chips"},
    {"id": "S007", "name": "ASML Netherlands", "country": "Netherlands", "lat": 51.44, "lng": 5.47, "riskScore": 22, "tier": 2, "industry": "Semiconductors", "employees": 39000, "revenue": "$21B", "established": 1984, "concentration": "Critical", "financialStability": 92, "geopoliticalRisk": 18, "disasterRisk": 15, "transportRisk": 20, "description": "Sole EUV lithography machine manufacturer"},
    {"id": "P001", "name": "Pfizer Chennai", "country": "India", "lat": 13.08, "lng": 80.27, "riskScore": 42, "tier": 1, "industry": "Pharmaceuticals", "employees": 8500, "revenue": "$8B", "established": 1955, "concentration": "Medium", "financialStability": 85, "geopoliticalRisk": 38, "disasterRisk": 58, "transportRisk": 45, "description": "API and formulation manufacturing"},
    {"id": "P002", "name": "Sinopharm Base", "country": "China", "lat": 30.57, "lng": 114.27, "riskScore": 65, "tier": 1, "industry": "Pharmaceuticals", "employees": 150000, "revenue": "$25B", "established": 1998, "concentration": "High", "financialStability": 72, "geopoliticalRisk": 70, "disasterRisk": 42, "transportRisk": 55, "description": "Chinese state pharma company"},
    {"id": "P003", "name": "Bayer Leverkusen", "country": "Germany", "lat": 51.03, "lng": 6.98, "riskScore": 28, "tier": 1, "industry": "Pharmaceuticals", "employees": 101000, "revenue": "$47B", "established": 1863, "concentration": "Low", "financialStability": 90, "geopoliticalRisk": 15, "disasterRisk": 12, "transportRisk": 20, "description": "Pharmaceutical and life sciences"},
    {"id": "P005", "name": "Chemical Precursors Ltd", "country": "China", "lat": 31.23, "lng": 121.47, "riskScore": 72, "tier": 3, "industry": "Pharmaceuticals", "employees": 1800, "revenue": "$0.8B", "established": 2009, "concentration": "Critical", "financialStability": 58, "geopoliticalRisk": 78, "disasterRisk": 38, "transportRisk": 65, "description": "Sole supplier of key chemical precursors"},
    {"id": "A001", "name": "Toyota Supply Hub", "country": "Japan", "lat": 35.08, "lng": 137.15, "riskScore": 32, "tier": 1, "industry": "Automotive", "employees": 370000, "revenue": "$274B", "established": 1937, "concentration": "Medium", "financialStability": 95, "geopoliticalRisk": 25, "disasterRisk": 55, "transportRisk": 30, "description": "Automotive manufacturing and assembly"},
    {"id": "A002", "name": "CATL Battery", "country": "China", "lat": 26.58, "lng": 119.00, "riskScore": 68, "tier": 1, "industry": "Automotive", "employees": 95000, "revenue": "$36B", "established": 2011, "concentration": "High", "financialStability": 75, "geopoliticalRisk": 75, "disasterRisk": 48, "transportRisk": 55, "description": "World #1 EV battery manufacturer"},
    {"id": "A004", "name": "Lithium Americas", "country": "Argentina", "lat": -24.18, "lng": -66.30, "riskScore": 75, "tier": 3, "industry": "Automotive", "employees": 900, "revenue": "$0.5B", "established": 2007, "concentration": "Critical", "financialStability": 45, "geopoliticalRisk": 68, "disasterRisk": 55, "transportRisk": 72, "description": "Lithium mining for EV batteries"},
    {"id": "E001", "name": "Saudi Aramco", "country": "Saudi Arabia", "lat": 26.30, "lng": 50.20, "riskScore": 58, "tier": 1, "industry": "Energy", "employees": 66000, "revenue": "$604B", "established": 1933, "concentration": "High", "financialStability": 95, "geopoliticalRisk": 65, "disasterRisk": 35, "transportRisk": 50, "description": "World largest oil producer"},
    {"id": "E002", "name": "Gazprom Pipeline", "country": "Russia", "lat": 55.75, "lng": 37.62, "riskScore": 92, "tier": 1, "industry": "Energy", "employees": 462000, "revenue": "$110B", "established": 1989, "concentration": "Critical", "financialStability": 60, "geopoliticalRisk": 98, "disasterRisk": 30, "transportRisk": 80, "description": "Natural gas and energy distribution"},
    {"id": "E004", "name": "Cobalt Congo", "country": "DR Congo", "lat": -11.67, "lng": 27.47, "riskScore": 95, "tier": 3, "industry": "Energy", "employees": 2200, "revenue": "$0.9B", "established": 2015, "concentration": "Critical", "financialStability": 30, "geopoliticalRisk": 98, "disasterRisk": 60, "transportRisk": 88, "description": "Cobalt mining for batteries and electronics"},
    {"id": "F001", "name": "Cargill Grain", "country": "USA", "lat": 44.97, "lng": -93.27, "riskScore": 25, "tier": 1, "industry": "Food", "employees": 155000, "revenue": "$165B", "established": 1865, "concentration": "Low", "financialStability": 90, "geopoliticalRisk": 20, "disasterRisk": 32, "transportRisk": 25, "description": "Agricultural commodities trading"},
    {"id": "F002", "name": "Ukraine Wheat", "country": "Ukraine", "lat": 49.44, "lng": 32.06, "riskScore": 88, "tier": 1, "industry": "Food", "employees": 45000, "revenue": "$8B", "established": 1995, "concentration": "High", "financialStability": 40, "geopoliticalRisk": 95, "disasterRisk": 50, "transportRisk": 85, "description": "Major global wheat and grain exporter"},
]

SUPPLY_CHAIN_LINKS = [
    {"source": "S001", "target": "S006", "strength": 0.9},
    {"source": "S001", "target": "S007", "strength": 0.8},
    {"source": "S002", "target": "S004", "strength": 0.7},
    {"source": "A001", "target": "A002", "strength": 0.9},
    {"source": "A001", "target": "A004", "strength": 0.95},
    {"source": "P001", "target": "P005", "strength": 0.7},
    {"source": "P002", "target": "P005", "strength": 0.9},
    {"source": "E004", "target": "A002", "strength": 0.9},
    {"source": "E002", "target": "P002", "strength": 0.3},
    {"source": "F002", "target": "F001", "strength": 0.5},
]

INDUSTRIES = [
    {"id": "semiconductors", "name": "Semiconductors", "riskLevel": "HIGH", "riskScore": 74, "trend": "up", "supplierCount": 7, "criticalNodes": 3, "gdpImpact": "$2.1T"},
    {"id": "pharmaceuticals", "name": "Pharmaceuticals", "riskLevel": "MEDIUM", "riskScore": 52, "trend": "stable", "supplierCount": 5, "criticalNodes": 2, "gdpImpact": "$1.2T"},
    {"id": "food", "name": "Food", "riskLevel": "HIGH", "riskScore": 68, "trend": "up", "supplierCount": 4, "criticalNodes": 1, "gdpImpact": "$0.9T"},
    {"id": "energy", "name": "Energy", "riskLevel": "HIGH", "riskScore": 72, "trend": "up", "supplierCount": 4, "criticalNodes": 2, "gdpImpact": "$3.8T"},
    {"id": "automotive", "name": "Automotive", "riskLevel": "MEDIUM", "riskScore": 58, "trend": "down", "supplierCount": 5, "criticalNodes": 2, "gdpImpact": "$2.9T"},
]

now = datetime.utcnow()
ALERTS = [
    {"id": "ALT001", "type": "CRITICAL", "title": "Typhoon approaching TSMC facilities", "description": "Category 4 typhoon predicted near Hsinchu Science Park.", "supplier": "TSMC", "supplierId": "S001", "industry": "Semiconductors", "timestamp": (now - timedelta(minutes=30)).isoformat(), "status": "active", "affectedVolume": "$4.2B", "probability": 87},
    {"id": "ALT002", "type": "HIGH", "title": "Port strike at Shanghai Container Terminal", "description": "Dock workers union announced indefinite strike action.", "supplier": "Multiple", "supplierId": None, "industry": "Multiple", "timestamp": (now - timedelta(hours=1.5)).isoformat(), "status": "active", "affectedVolume": "$890M", "probability": 92},
    {"id": "ALT003", "type": "CRITICAL", "title": "Single Point of Failure: Cobalt supply", "description": "Political unrest in Katanga Province affecting cobalt supply.", "supplier": "Cobalt Congo", "supplierId": "E004", "industry": "Energy", "timestamp": (now - timedelta(hours=3)).isoformat(), "status": "active", "affectedVolume": "$3.1B", "probability": 78},
    {"id": "ALT004", "type": "HIGH", "title": "Russia energy export restrictions widened", "description": "Gazprom announced further export restrictions.", "supplier": "Gazprom Pipeline", "supplierId": "E002", "industry": "Energy", "timestamp": (now - timedelta(hours=6)).isoformat(), "status": "active", "affectedVolume": "$1.5B", "probability": 95},
    {"id": "ALT005", "type": "MEDIUM", "title": "Lithium price spike detected", "description": "Lithium carbonate prices rose 23% this week.", "supplier": "Lithium Americas", "supplierId": "A004", "industry": "Automotive", "timestamp": (now - timedelta(hours=12)).isoformat(), "status": "active", "affectedVolume": "$620M", "probability": 68},
    {"id": "ALT006", "type": "MEDIUM", "title": "Wheat export corridor disruption", "description": "Black Sea shipping lane temporarily closed.", "supplier": "Ukraine Wheat", "supplierId": "F002", "industry": "Food", "timestamp": (now - timedelta(hours=18)).isoformat(), "status": "monitoring", "affectedVolume": "$450M", "probability": 55},
    {"id": "ALT007", "type": "LOW", "title": "Mild supply delay at Bosch Germany", "description": "Rail network disruption causing 3-5 day delays.", "supplier": "Bosch Germany", "supplierId": "A003", "industry": "Automotive", "timestamp": (now - timedelta(hours=24)).isoformat(), "status": "resolved", "affectedVolume": "$85M", "probability": 35},
]

DISRUPTION_PREDICTIONS = [
    {"week": "Week 1", "semiconductors": 62, "pharmaceuticals": 28, "food": 75, "energy": 78, "automotive": 45},
    {"week": "Week 2", "semiconductors": 71, "pharmaceuticals": 32, "food": 70, "energy": 82, "automotive": 52},
    {"week": "Week 3", "semiconductors": 68, "pharmaceuticals": 35, "food": 65, "energy": 85, "automotive": 55},
    {"week": "Week 4", "semiconductors": 74, "pharmaceuticals": 38, "food": 68, "energy": 80, "automotive": 58},
]

RISK_TREND = [
    {"month": "Aug", "global": 52, "geopolitical": 58, "climate": 45, "financial": 48},
    {"month": "Sep", "global": 55, "geopolitical": 62, "climate": 48, "financial": 45},
    {"month": "Oct", "global": 58, "geopolitical": 65, "climate": 55, "financial": 50},
    {"month": "Nov", "global": 62, "geopolitical": 68, "climate": 58, "financial": 55},
    {"month": "Dec", "global": 65, "geopolitical": 70, "climate": 52, "financial": 60},
    {"month": "Jan", "global": 68, "geopolitical": 75, "climate": 55, "financial": 58},
    {"month": "Feb", "global": 72, "geopolitical": 78, "climate": 60, "financial": 62},
    {"month": "Mar", "global": 70, "geopolitical": 76, "climate": 65, "financial": 64},
]

HEATMAP_REGIONS = [
    {"name": "East Asia", "lat": 32, "lng": 118, "intensity": 0.85, "reason": "Geopolitical, Semiconductor concentration"},
    {"name": "Eastern Europe", "lat": 50, "lng": 32, "intensity": 0.92, "reason": "Active conflict, supply disruption"},
    {"name": "DR Congo", "lat": -6, "lng": 24, "intensity": 0.90, "reason": "Political instability, mineral dependency"},
    {"name": "South Asia", "lat": 20, "lng": 78, "intensity": 0.55, "reason": "Climate risk, infrastructure challenges"},
    {"name": "Middle East", "lat": 25, "lng": 48, "intensity": 0.65, "reason": "Geopolitical tension, oil dependency"},
    {"name": "West Africa", "lat": 8, "lng": 1, "intensity": 0.60, "reason": "Infrastructure gaps, political risk"},
    {"name": "Andes Region", "lat": -25, "lng": -68, "intensity": 0.62, "reason": "Lithium mining, water scarcity"},
    {"name": "Western Europe", "lat": 50, "lng": 10, "intensity": 0.25, "reason": "Low risk, strong institutions"},
    {"name": "North America", "lat": 40, "lng": -100, "intensity": 0.22, "reason": "Low risk, diversified economy"},
    {"name": "Australia", "lat": -25, "lng": 133, "intensity": 0.30, "reason": "Climate risk, isolated location"},
    {"name": "SE Asia", "lat": 10, "lng": 107, "intensity": 0.50, "reason": "Political variance, climate exposure"},
]

SINGLE_POINTS_OF_FAILURE = [
    {"id": "SPOF001", "name": "TSMC — Advanced Node Manufacturing", "description": "TSMC produces over 90% of sub-5nm chips globally.", "riskScore": 94, "industry": "Semiconductors", "supplierId": "S001", "annualValue": "$420B", "alternativesAvailable": 0, "mitigationScore": 12},
    {"id": "SPOF002", "name": "Cobalt Congo — Battery Cobalt", "description": "70% of global cobalt originates from DRC.", "riskScore": 95, "industry": "Energy", "supplierId": "E004", "annualValue": "$89B", "alternativesAvailable": 1, "mitigationScore": 18},
    {"id": "SPOF003", "name": "ASML — EUV Lithography Machines", "description": "ASML is the sole manufacturer of EUV machines.", "riskScore": 88, "industry": "Semiconductors", "supplierId": "S007", "annualValue": "$890B", "alternativesAvailable": 0, "mitigationScore": 5},
    {"id": "SPOF004", "name": "Chemical Precursors Ltd — Pharma Inputs", "description": "Sole supplier for 3 critical drug precursors.", "riskScore": 82, "industry": "Pharmaceuticals", "supplierId": "P005", "annualValue": "$34B", "alternativesAvailable": 1, "mitigationScore": 22},
    {"id": "SPOF005", "name": "Gazprom — European Energy", "description": "Supplies 25% of European industrial gas.", "riskScore": 92, "industry": "Energy", "supplierId": "E002", "annualValue": "$240B", "alternativesAvailable": 2, "mitigationScore": 35},
]

SIMULATION_SCENARIOS = [
    {"id": "SIM001", "name": "TSMC Taiwan shutdown", "supplierId": "S001", "description": "Complete factory closure due to conflict or disaster", "duration": "3-6 months", "affectedSuppliers": ["S002", "S004", "A001", "A002"], "economicImpact": "$2.1T", "affectedFactories": 847, "recoveryTime": "18-24 months"},
    {"id": "SIM002", "name": "Suez Canal closure", "supplierId": None, "description": "Blocking of Suez Canal for 30+ days", "duration": "1-3 months", "affectedSuppliers": ["P001", "P002", "E001", "A003"], "economicImpact": "$450B", "affectedFactories": 340, "recoveryTime": "3-6 months"},
    {"id": "SIM003", "name": "China-Taiwan semiconductor embargo", "supplierId": "S006", "description": "Trade embargo blocking rare earth exports", "duration": "Indefinite", "affectedSuppliers": ["S001", "S002", "S004", "A002"], "economicImpact": "$890B", "affectedFactories": 562, "recoveryTime": "24-36 months"},
]
