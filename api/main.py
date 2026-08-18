import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:mpk%402026hebat@db.xzbegmhfvscirqeujbvs.supabase.co:5432/postgres",
)
jwt_secret = os.getenv("JWT_SECRET", "4f92b7c8a1e3d6f59028cb4719a6e5b32f8d1c9a4e7b0f2c5d8e1a3b6f9c2d4e")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin_mpk")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "SecurePassword123")

# Konfigurasi Engine Database dengan penanganan aman untuk Serverless
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 1,
    "max_overflow": 2,
}
if DATABASE_URL.startswith("postgres"):
    engine_kwargs["connect_args"] = {"connect_timeout": 10, "sslmode": "require"}

try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as exc:
    print("FATAL DATABASE ENGINE ERROR:", exc)
    engine = None
    SessionLocal = None

Base = declarative_base()


class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    kelas = Column(String(10), nullable=False)
    jabatan = Column(String(100), nullable=False)
    komisi = Column(String(100), nullable=False, default="Pengurus Inti", server_default=text("'Pengurus Inti'"))
    foto = Column(String(500), nullable=True)
    motto = Column(String(255), nullable=True)


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    judul = Column(String(200), nullable=False)
    isi = Column(Text, nullable=False)
    tanggal = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("now()"),
    )
    penting = Column(Boolean, default=False)


class Aspirasi(Base):
    __tablename__ = "aspirasi"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    kelas = Column(String(10), nullable=False)
    kategori = Column(String(50), nullable=False)
    pesan = Column(Text, nullable=False)
    status = Column(String(20), default="Baru")
    dibuat_pada = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("now()"),
    )


class LoginRequest(BaseModel):
    username: str
    password: str


class MemberCreate(BaseModel):
    nama: str
    kelas: str
    jabatan: str
    komisi: str = "Pengurus Inti"
    foto: Optional[str] = None
    motto: Optional[str] = None


class MemberOut(MemberCreate):
    id: int
    model_config = {"from_attributes": True}


class AnnouncementCreate(BaseModel):
    judul: str
    isi: str
    penting: bool = False


class AnnouncementOut(AnnouncementCreate):
    id: int
    tanggal: datetime
    model_config = {"from_attributes": True}


class AspirasiCreate(BaseModel):
    nama: str
    kelas: str
    kategori: str
    pesan: str


class AspirasiOut(AspirasiCreate):
    id: int
    status: str
    dibuat_pada: datetime
    model_config = {"from_attributes": True}


class AspirasiStatusUpdate(BaseModel):
    status: str


app = FastAPI(
    title="MPK SMPN 1 Nusantara API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    field = first.get("loc", ["?"])[-1]
    msg = first.get("msg", "Data tidak valid")
    return JSONResponse(status_code=422, content={"detail": f"Format data tidak valid pada [{field}]: {msg}"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print("CRITICAL UNHANDLED ERROR:", repr(exc))
    return JSONResponse(status_code=500, content={"detail": f"Internal Server Error: {str(exc)}"})


def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database engine tidak aktif")
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as exc:
        db.rollback()
        print("DATABASE SESSION ERROR:", exc)
        raise HTTPException(status_code=500, detail=f"Database error: {str(exc)}")
    finally:
        db.close()


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, jwt_secret, algorithm=ALGORITHM)


def require_auth(authorization: str = Header(default="")) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Header Authorization tidak ditemukan")
    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Format token harus Bearer <token>")
    
    token = parts[1]
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesi telah kedaluwarsa, silakan login kembali")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token autentikasi tidak valid")


# ==================== DAFTAR ENDPOINT LANGSUNG (MENCEGAH ERROR PREFIX VERCEL) ====================

@app.get("/")
def read_root():
    return {"status": "online", "message": "API MPK SMPN 1 Nusantara"}


@app.get("/api")
def api_root():
    return {"status": "online", "message": "API MPK SMPN 1 Nusantara", "docs": "/docs"}


@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok", "waktu": datetime.now(timezone.utc).isoformat()}


@app.post("/login")
@app.post("/api/login")
def login(data: LoginRequest):
    if data.username == ADMIN_USERNAME and data.password == ADMIN_PASSWORD:
        return {"token": create_token(data.username), "message": "Login berhasil"}
    raise HTTPException(status_code=401, detail="Username atau password salah")


# --- MEMBERS ---
@app.get("/members", response_model=List[MemberOut])
@app.get("/api/members", response_model=List[MemberOut])
def list_members(db=Depends(get_db)):
    try:
        members = db.query(Member).order_by(Member.komisi, Member.id).all()
        for m in members:
            m.komisi = m.komisi or "Pengurus Inti"
            m.foto = m.foto or ""
            m.motto = m.motto or ""
        return members
    except Exception as exc:
        print("GET MEMBERS ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/members", response_model=MemberOut)
@app.post("/api/members", response_model=MemberOut)
def create_member(data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        member = Member(**data.model_dump())
        db.add(member)
        db.commit()
        db.refresh(member)
        return member
    except Exception as exc:
        db.rollback()
        print("CREATE MEMBER ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/members/{member_id}", response_model=MemberOut)
@app.put("/api/members/{member_id}", response_model=MemberOut)
def update_member(member_id: int, data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
        for key, value in data.model_dump().items():
            setattr(member, key, value)
        db.commit()
        db.refresh(member)
        return member
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("UPDATE MEMBER ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/members/{member_id}")
@app.delete("/api/members/{member_id}")
def delete_member(member_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
        db.delete(member)
        db.commit()
        return {"message": "Anggota berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("DELETE MEMBER ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# --- ANNOUNCEMENTS ---
@app.get("/announcements", response_model=List[AnnouncementOut])
@app.get("/api/announcements", response_model=List[AnnouncementOut])
def list_announcements(db=Depends(get_db)):
    try:
        announcements = db.query(Announcement).order_by(Announcement.tanggal.desc()).all()
        for a in announcements:
            a.tanggal = a.tanggal or datetime.now(timezone.utc)
            a.penting = bool(a.penting)
        return announcements
    except Exception as exc:
        print("GET ANNOUNCEMENTS ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/announcements", response_model=AnnouncementOut)
@app.post("/api/announcements", response_model=AnnouncementOut)
def create_announcement(data: AnnouncementCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        announcement = Announcement(**data.model_dump())
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement
    except Exception as exc:
        db.rollback()
        print("CREATE ANNOUNCEMENT ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/announcements/{announcement_id}", response_model=AnnouncementOut)
@app.put("/api/announcements/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(announcement_id: int, data: AnnouncementCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
        for key, value in data.model_dump().items():
            setattr(announcement, key, value)
        db.commit()
        db.refresh(announcement)
        return announcement
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("UPDATE ANNOUNCEMENT ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/announcements/{announcement_id}")
@app.delete("/api/announcements/{announcement_id}")
def delete_announcement(announcement_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
        db.delete(announcement)
        db.commit()
        return {"message": "Pengumuman berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("DELETE ANNOUNCEMENT ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# --- ASPIRASI ---
@app.get("/aspirasi", response_model=List[AspirasiOut])
@app.get("/api/aspirasi", response_model=List[AspirasiOut])
def list_aspirasi(db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        aspirasi_list = db.query(Aspirasi).order_by(Aspirasi.dibuat_pada.desc()).all()
        for item in aspirasi_list:
            item.dibuat_pada = item.dibuat_pada or datetime.now(timezone.utc)
            item.status = item.status or "Baru"
        return aspirasi_list
    except Exception as exc:
        print("GET ASPIRASI ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/aspirasi", response_model=AspirasiOut)
@app.post("/api/aspirasi", response_model=AspirasiOut)
def create_aspirasi(data: AspirasiCreate, db=Depends(get_db)):
    try:
        if not data.nama or not data.kelas or not data.kategori or not data.pesan:
            raise HTTPException(status_code=400, detail="Semua field wajib diisi")
        aspirasi = Aspirasi(**data.model_dump(), status="Baru")
        db.add(aspirasi)
        db.commit()
        db.refresh(aspirasi)
        return aspirasi
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("CREATE ASPIRASI ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.patch("/aspirasi/{aspirasi_id}", response_model=AspirasiOut)
@app.patch("/api/aspirasi/{aspirasi_id}", response_model=AspirasiOut)
def update_aspirasi_status(aspirasi_id: int, data: AspirasiStatusUpdate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        if data.status not in ("Baru", "Diproses", "Selesai"):
            raise HTTPException(status_code=400, detail="Status tidak valid")
        aspirasi = db.query(Aspirasi).filter(Aspirasi.id == aspirasi_id).first()
        if not aspirasi:
            raise HTTPException(status_code=404, detail="Aspirasi tidak ditemukan")
        aspirasi.status = data.status
        db.commit()
        db.refresh(aspirasi)
        return aspirasi
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("UPDATE ASPIRASI ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/aspirasi/{aspirasi_id}")
@app.delete("/api/aspirasi/{aspirasi_id}")
def delete_aspirasi(aspirasi_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        aspirasi = db.query(Aspirasi).filter(Aspirasi.id == aspirasi_id).first()
        if not aspirasi:
            raise HTTPException(status_code=404, detail="Aspirasi tidak ditemukan")
        db.delete(aspirasi)
        db.commit()
        return {"message": "Aspirasi berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("DELETE ASPIRASI ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))