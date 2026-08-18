import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine, text
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

engine = None
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 5,
    "max_overflow": 5,
}
if DATABASE_URL.startswith("postgres"):
    engine_kwargs["connect_args"] = {"connect_timeout": 5, "sslmode": "require"}
try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
    print("Database engine dibuat (koneksi ditunda sampai request pertama)")
except Exception as exc:
    print("WARNING: Tidak dapat membuat database engine:", exc)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None
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


_tables_ready = False


def ensure_tables(db) -> None:
    global _tables_ready
    if _tables_ready or db is None:
        return
    try:
        Base.metadata.create_all(bind=db.get_bind())
        _tables_ready = True
        print("Tabel database siap: members, announcements, aspirasi")
    except SQLAlchemyError as exc:
        print("WARNING: create_all tidak selesai:", exc)


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
async def validation_error_handler(request, exc):
    first = exc.errors()[0] if exc.errors() else {}
    field = first.get("loc", ["?"])[-1]
    msg = first.get("msg", "Data tidak valid")
    return JSONResponse(status_code=422, content={"detail": f"Data tidak valid pada {field}: {msg}"})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print("UNHANDLED SERVER ERROR:", exc)
    return JSONResponse(status_code=500, content={"detail": f"Kesalahan server: {exc}"})


def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database tidak tersedia")
    try:
        db = SessionLocal()
    except SQLAlchemyError as exc:
        print("DATABASE CONNECT ERROR:", exc)
        raise HTTPException(status_code=503, detail="Database tidak dapat dijangkau")
    try:
        ensure_tables(db)
        yield db
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
        raise HTTPException(status_code=401, detail="Token tidak ditemukan")
    parts = authorization.strip().split()
    token = ""
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
    elif len(parts) == 1:
        token = parts[0]
    
    if not token:
        raise HTTPException(status_code=401, detail="Format token tidak valid")
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")


@app.get("/")
def read_root():
    return {"status": "online", "message": "API MPK SMPN 1 Nusantara"}


@app.get("/api")
def api_root():
    return {"status": "online", "message": "API MPK SMPN 1 Nusantara", "docs": "/docs"}


# ==================== REGISTER DUAL ROUTES (PREFIX /api DAN TANPA PREFIX) ====================

def register_all_routes(router_or_app):
    @router_or_app.get("/health")
    def health():
        return {"status": "ok", "nama": "MPK SMPN 1 Nusantara API", "waktu": datetime.now(timezone.utc).isoformat()}

    @router_or_app.post("/login")
    def login(data: LoginRequest):
        if data.username == ADMIN_USERNAME and data.password == ADMIN_PASSWORD:
            return {"token": create_token(data.username), "message": "Login berhasil"}
        raise HTTPException(status_code=401, detail="Username atau password salah")

    @router_or_app.get("/members", response_model=List[MemberOut])
    def list_members(db=Depends(get_db)):
        try:
            members = db.query(Member).order_by(Member.komisi, Member.id).all()
            for m in members:
                m.komisi = m.komisi or "Pengurus Inti"
                m.foto = m.foto or ""
                m.motto = m.motto or ""
            return members
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Gagal memuat anggota: {exc}")

    @router_or_app.post("/members", response_model=MemberOut)
    def create_member(data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
        try:
            member = Member(**data.model_dump())
            db.add(member)
            db.commit()
            db.refresh(member)
            return member
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Gagal menyimpan anggota: {exc}")

    @router_or_app.put("/members/{member_id}", response_model=MemberOut)
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
            raise HTTPException(status_code=500, detail=f"Gagal menyimpan anggota: {exc}")

    @router_or_app.delete("/members/{member_id}")
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
            raise HTTPException(status_code=500, detail=f"Gagal menghapus anggota: {exc}")

    @router_or_app.get("/announcements", response_model=List[AnnouncementOut])
    def list_announcements(db=Depends(get_db)):
        try:
            announcements = db.query(Announcement).order_by(Announcement.tanggal.desc()).all()
            for a in announcements:
                a.tanggal = a.tanggal or datetime.now(timezone.utc)
                a.penting = bool(a.penting)
            return announcements
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Gagal memuat pengumuman: {exc}")

    @router_or_app.post("/announcements", response_model=AnnouncementOut)
    def create_announcement(data: AnnouncementCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
        try:
            announcement = Announcement(**data.model_dump())
            db.add(announcement)
            db.commit()
            db.refresh(announcement)
            return announcement
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Gagal menyimpan pengumuman: {exc}")

    @router_or_app.put("/announcements/{announcement_id}", response_model=AnnouncementOut)
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
            raise HTTPException(status_code=500, detail=f"Gagal menyimpan pengumuman: {exc}")

    @router_or_app.delete("/announcements/{announcement_id}")
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
            raise HTTPException(status_code=500, detail=f"Gagal menghapus pengumuman: {exc}")

    @router_or_app.get("/aspirasi", response_model=List[AspirasiOut])
    def list_aspirasi(db=Depends(get_db), auth: dict = Depends(require_auth)):
        try:
            aspirasi_list = db.query(Aspirasi).order_by(Aspirasi.dibuat_pada.desc()).all()
            for item in aspirasi_list:
                item.dibuat_pada = item.dibuat_pada or datetime.now(timezone.utc)
                item.status = item.status or "Baru"
            return aspirasi_list
        except Exception as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Gagal memuat aspirasi: {exc}")

    @router_or_app.post("/aspirasi", response_model=AspirasiOut)
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
            raise HTTPException(status_code=500, detail=f"Gagal mengirim aspirasi: {exc}")

    @router_or_app.patch("/aspirasi/{aspirasi_id}", response_model=AspirasiOut)
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
            raise HTTPException(status_code=500, detail=f"Gagal memperbarui aspirasi: {exc}")

    @router_or_app.delete("/aspirasi/{aspirasi_id}")
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
            raise HTTPException(status_code=500, detail=f"Gagal menghapus aspirasi: {exc}")

# Daftarkan ke prefix /api dan langsung ke app agar aman dari pemotongan path Vercel
api_router = APIRouter()
register_all_routes(api_router)
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="")