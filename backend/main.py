from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import suppliers, risk, alerts, simulation, copilot, auth, realtime
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Resilio — Supply Chain Resilience & Risk Analyzer API",
    description="Backend API for supply chain risk analysis, disruption prediction, and AI-powered insights",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk Analysis"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(copilot.router, prefix="/api/copilot", tags=["AI Copilot"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(realtime.router, prefix="/api/realtime", tags=["Real-Time Data"])


@app.get("/")
def root():
    return {
        "app": "Resilio Supply Chain Analyzer",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": "resilio-api"}
