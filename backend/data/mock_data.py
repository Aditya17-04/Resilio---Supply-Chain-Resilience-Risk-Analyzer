"""Mock dataset for Resilio backend API"""
from datetime import datetime, timedelta
import random

SUPPLIERS = [
    {"id": "S001", "name": "TSMC", "country": "Taiwan", "city": "Hsinchu", "lat": 24.8, "lng": 120.97, "riskScore": 72, "tier": 1, "industry": "Semiconductors", "geopoliticalRisk": 85, "financialStability": 15, "naturalDisasterRisk": 60, "transportRisk": 45, "concentrationRisk": 95, "revenue": "$73B", "employees": 73000, "status": "active"},
    {"id": "S002", "name": "Samsung Electronics", "country": "South Korea", "city": "Seoul", "lat": 37.56, "lng": 126.97, "riskScore": 38, "tier": 1, "industry": "Semiconductors", "geopoliticalRisk": 40, "financialStability": 10, "naturalDisasterRisk": 25, "transportRisk": 30, "concentrationRisk": 55, "revenue": "$244B", "employees": 267937, "status": "active"},
    {"id": "S003", "name": "CATL", "country": "China", "city": "Ningde", "lat": 26.66, "lng": 119.54, "riskScore": 61, "tier": 1, "industry": "Automotive", "geopoliticalRisk": 70, "financialStability": 20, "naturalDisasterRisk": 40, "transportRisk": 55, "concentrationRisk": 80, "revenue": "$40B", "employees": 95000, "status": "active"},
    {"id": "S004", "name": "Foxconn", "country": "Taiwan", "city": "New Taipei", "lat": 25.01, "lng": 121.45, "riskScore": 55, "tier": 1, "industry": "Electronics", "geopoliticalRisk": 80, "financialStability": 25, "naturalDisasterRisk": 55, "transportRisk": 40, "concentrationRisk": 70, "revenue": "$215B", "employees": 1000000, "status": "active"},
    {"id": "S005", "name": "BASF", "country": "Germany", "city": "Ludwigshafen", "lat": 49.47, "lng": 8.44, "riskScore": 22, "tier": 2, "industry": "Chemicals", "geopoliticalRisk": 15, "financialStability": 12, "naturalDisasterRisk": 10, "transportRisk": 20, "concentrationRisk": 35, "revenue": "$78B", "employees": 111991, "status": "active"},
    {"id": "S006", "name": "Vale SA", "country": "Brazil", "city": "Rio de Janeiro", "lat": -22.9, "lng": -43.17, "riskScore": 48, "tier": 2, "industry": "Mining", "geopoliticalRisk": 50, "financialStability": 30, "naturalDisasterRisk": 55, "transportRisk": 45, "concentrationRisk": 40, "revenue": "$43B", "employees": 125000, "status": "active"},
    {"id": "S007", "name": "Glencore", "country": "Switzerland", "city": "Baar", "lat": 47.19, "lng": 8.47, "riskScore": 44, "tier": 2, "industry": "Mining", "geopoliticalRisk": 35, "financialStability": 20, "naturalDisasterRisk": 5, "transportRisk": 30, "concentrationRisk": 65, "revenue": "$255B", "employees": 150000, "status": "active"},
    {"id": "S008", "name": "Maersk", "country": "Denmark", "city": "Copenhagen", "lat": 55.67, "lng": 12.56, "riskScore": 31, "tier": 1, "industry": "Logistics", "geopoliticalRisk": 20, "financialStability": 15, "naturalDisasterRisk": 10, "transportRisk": 55, "concentrationRisk": 70, "revenue": "$81B", "employees": 110000, "status": "active"},
    {"id": "S009", "name": "Sinopec", "country": "China", "city": "Beijing", "lat": 39.9, "lng": 116.4, "riskScore": 58, "tier": 2, "industry": "Energy", "geopoliticalRisk": 65, "financialStability": 20, "naturalDisasterRisk": 20, "transportRisk": 50, "concentrationRisk": 75, "revenue": "$486B", "employees": 553000, "status": "active"},
    {"id": "S010", "name": "Pfizer", "country": "USA", "city": "New York", "lat": 40.71, "lng": -74.0, "riskScore": 18, "tier": 1, "industry": "Pharmaceuticals", "geopoliticalRisk": 10, "financialStability": 8, "naturalDisasterRisk": 12, "transportRisk": 20, "concentrationRisk": 30, "revenue": "$100B", "employees": 83000, "status": "active"},
    {"id": "S012", "name": "Ganfeng Lithium", "country": "China", "city": "Xinyu", "lat": 27.81, "lng": 114.93, "riskScore": 67, "tier": 3, "industry": "Mining", "geopoliticalRisk": 65, "financialStability": 35, "naturalDisasterRisk": 35, "transportRisk": 60, "concentrationRisk": 88, "revenue": "$5B", "employees": 14000, "status": "active"},
    {"id": "S013", "name": "Société des Mines de Tenke", "country": "DR Congo", "city": "Tenke", "lat": -10.55, "lng": 26.1, "riskScore": 89, "tier": 3, "industry": "Mining", "geopoliticalRisk": 92, "financialStability": 55, "naturalDisasterRisk": 45, "transportRisk": 80, "concentrationRisk": 95, "revenue": "$2B", "employees": 8000, "status": "warning"},
]

INDUSTRIES = [
    {"id": "IND001", "name": "Semiconductors", "riskLevel": "HIGH", "riskScore": 78, "trend": 12, "suppliers": 47, "criticalCount": 8},
    {"id": "IND002", "name": "Pharmaceuticals", "riskLevel": "MEDIUM", "riskScore": 45, "trend": -3, "suppliers": 134, "criticalCount": 3},
    {"id": "IND003", "name": "Food & Agriculture", "riskLevel": "MEDIUM", "riskScore": 52, "trend": 8, "suppliers": 289, "criticalCount": 5},
    {"id": "IND004", "name": "Energy", "riskLevel": "HIGH", "riskScore": 71, "trend": 15, "suppliers": 98, "criticalCount": 12},
    {"id": "IND005", "name": "Automotive", "riskLevel": "HIGH", "riskScore": 65, "trend": 5, "suppliers": 203, "criticalCount": 9},
    {"id": "IND006", "name": "Steel & Metals", "riskLevel": "MEDIUM", "riskScore": 48, "trend": -2, "suppliers": 77, "criticalCount": 4},
    {"id": "IND007", "name": "Chemicals", "riskLevel": "LOW", "riskScore": 29, "trend": -5, "suppliers": 162, "criticalCount": 2},
    {"id": "IND008", "name": "Logistics & Shipping", "riskLevel": "MEDIUM", "riskScore": 55, "trend": 18, "suppliers": 45, "criticalCount": 6},
]

ALERTS = [
    {"id": "A001", "type": "critical", "category": "geopolitical", "title": "Taiwan Strait Tensions Escalating", "description": "Military exercises near Taiwan Strait may affect TSMC operations.", "supplierId": "S001", "supplierName": "TSMC", "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(), "affected": ["Semiconductors", "Electronics", "Automotive"], "econLoss": "$2.4B", "probability": 68, "read": False},
    {"id": "A002", "type": "high", "category": "natural_disaster", "title": "Typhoon Approaching DRC Mining Region", "description": "Tropical storm may disrupt cobalt mining operations for 2-3 weeks.", "supplierId": "S013", "supplierName": "Tenke Mining", "timestamp": (datetime.now() - timedelta(minutes=45)).isoformat(), "affected": ["Automotive", "Energy Storage"], "econLoss": "$340M", "probability": 82, "read": False},
    {"id": "A003", "type": "high", "category": "port", "title": "Port of Shanghai Strike Warning", "description": "Dock workers union announced possible strike action within 7 days.", "supplierId": "S023", "supplierName": "Port of Shanghai", "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "affected": ["All Industries"], "econLoss": "$890M/day", "probability": 55, "read": False},
    {"id": "A004", "type": "medium", "category": "financial", "title": "Ganfeng Lithium Credit Rating Downgrade", "description": "Moody's downgraded Ganfeng Lithium to B+ due to falling lithium prices.", "supplierId": "S012", "supplierName": "Ganfeng Lithium", "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(), "affected": ["Automotive", "Energy"], "econLoss": "$120M", "probability": 40, "read": True},
    {"id": "A005", "type": "high", "category": "logistics", "title": "Red Sea Route Disruption Continues", "description": "Ongoing maritime security issues forcing vessels to reroute around Cape of Good Hope.", "supplierId": "S008", "supplierName": "Maersk", "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(), "affected": ["Logistics", "Pharmaceuticals", "Food"], "econLoss": "$1.1B/week", "probability": 91, "read": True},
]

SINGLE_POINT_FAILURES = [
    {"id": "SPOF001", "product": "Advanced Microchips (3nm)", "component": "EUV Lithography Equipment", "supplier": "ASML", "country": "Netherlands", "dependency": 100, "criticalityScore": 98, "alternativesCount": 0, "affectedCompanies": 847, "industryImpact": "Semiconductors", "estimatedLoss": "$340B/year"},
    {"id": "SPOF002", "product": "iPhone / Consumer Electronics", "component": "A-series Chip Fabrication", "supplier": "TSMC", "country": "Taiwan", "dependency": 92, "criticalityScore": 95, "alternativesCount": 1, "affectedCompanies": 312, "industryImpact": "Electronics", "estimatedLoss": "$180B/year"},
    {"id": "SPOF003", "product": "EV Battery Cathode", "component": "High-grade Cobalt", "supplier": "Tenke Mining", "country": "DR Congo", "dependency": 70, "criticalityScore": 88, "alternativesCount": 2, "affectedCompanies": 156, "industryImpact": "Automotive", "estimatedLoss": "$67B/year"},
]

SIMULATION_SCENARIOS = [
    {"id": "SIM001", "name": "TSMC Production Halt (Taiwan Conflict)", "description": "Complete shutdown of TSMC operations for 90 days", "probability": 12, "duration": "90 days", "trigger": "geopolitical", "estimatedLoss": "$2,400,000,000,000", "productionDelay": "18-24 months", "recoveryTime": "36 months"},
    {"id": "SIM002", "name": "Port of Shanghai Strike (30 days)", "description": "Dock workers strike causing 30-day port closure", "probability": 34, "duration": "30 days", "trigger": "labor", "estimatedLoss": "$890,000,000", "productionDelay": "4-6 weeks", "recoveryTime": "3 months"},
    {"id": "SIM003", "name": "DRC Cobalt Mining Shutdown", "description": "Political instability causes 6-month cobalt supply disruption", "probability": 28, "duration": "180 days", "trigger": "geopolitical", "estimatedLoss": "$420,000,000,000", "productionDelay": "12-18 months", "recoveryTime": "18 months"},
]

PREDICTIONS = [
    {"week": "Week 1", "semiconductor": 58, "automotive": 42, "pharmaceutical": 18, "food": 25, "energy": 61, "logistics": 72},
    {"week": "Week 2", "semiconductor": 65, "automotive": 48, "pharmaceutical": 20, "food": 28, "energy": 68, "logistics": 78},
    {"week": "Week 3", "semiconductor": 71, "automotive": 55, "pharmaceutical": 22, "food": 32, "energy": 74, "logistics": 69},
    {"week": "Week 4", "semiconductor": 68, "automotive": 51, "pharmaceutical": 19, "food": 29, "energy": 70, "logistics": 65},
]
