from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import suppliers, risk, alerts, simulation, copilot, auth
from database import engine, SessionLocal
import models
import bcrypt

models.Base.metadata.create_all(bind=engine)

# Seed demo account on first run
def _seed_demo():
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.email == "demo@resilio.ai").first():
            db.add(models.User(
                name="Demo User",
                email="demo@resilio.ai",
                company="Resilio",
                hashed_password=bcrypt.hashpw(b"Demo@1234", bcrypt.gensalt()).decode(),
                is_google=False,
            ))
            db.commit()
    finally:
        db.close()

_seed_demo()

app = FastAPI(
    title="Resilio — Supply Chain Resilience & Risk Analyzer API",
    description="Backend API for supply chain risk analysis, disruption prediction, and AI-powered insights",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
