import os
import smtplib
import secrets
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import bcrypt
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db
from models import User

load_dotenv()

router = APIRouter()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


# ── Schemas ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: str
    company: str = ""
    country: str = ""
    role: str = ""
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    email: str
    new_password: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def send_reset_email(to_email: str, reset_token: str):
    reset_link = f"{APP_URL}/reset-password?token={reset_token}&email={to_email}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0"
                 style="background:#1e293b;border-radius:16px;border:1px solid rgba(59,130,246,0.2);overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);padding:32px 40px;text-align:center;">
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;
                              display:inline-flex;align-items:center;justify-content:center;font-size:18px;">🛡️</div>
                  <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Resilio</span>
                </div>
                <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:8px 0 0;">Supply Chain Resilience Platform</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 12px;">Reset your password</h1>
                <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 28px;">
                  We received a request to reset the password for your Resilio account
                  associated with <strong style="color:#e2e8f0;">{to_email}</strong>.<br><br>
                  Click the button below to choose a new password. This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
                </p>

                <div style="text-align:center;margin:32px 0;">
                  <a href="{reset_link}"
                     style="display:inline-block;background:linear-gradient(135deg,#2563eb,#0ea5e9);
                            color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;
                            padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                    Reset Password
                  </a>
                </div>

                <p style="color:#64748b;font-size:12px;line-height:1.6;margin:28px 0 0;
                           padding-top:20px;border-top:1px solid rgba(71,85,105,0.3);">
                  If you didn't request a password reset, you can safely ignore this email —
                  your password will not be changed.<br><br>
                  Or copy this link into your browser:<br>
                  <span style="color:#3b82f6;word-break:break-all;">{reset_link}</span>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 40px;border-top:1px solid rgba(71,85,105,0.2);text-align:center;">
                <p style="color:#475569;font-size:11px;margin:0;">
                  © 2026 Resilio · Supply Chain Resilience Platform
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your Resilio password"
    msg["From"] = f"Resilio <{SMTP_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    user = User(
        name=body.name,
        email=body.email,
        company=body.company,
        country=body.country,
        role=body.role,
        hashed_password=hash_password(body.password),
        is_google=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Account created.", "user": {"email": user.email, "name": user.name, "company": user.company}}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"message": "Login successful.", "user": {"email": user.email, "name": user.name, "company": user.company}}


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    if not SMTP_USER or not SMTP_PASSWORD:
        raise HTTPException(status_code=503, detail="Email service is not configured.")
    user = db.query(User).filter(User.email == body.email).first()
    # Always return success to prevent email enumeration
    if user and user.hashed_password:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        try:
            send_reset_email(body.email, token)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    return {"message": "If an account with that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.reset_token == body.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully."}
