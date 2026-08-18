import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException
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
ADMIN_USERNAME = "admin_mpk"
ADMIN_PASSWORD = "SecurePassword123"

engine = None
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 5,
    "max_overflow": 5,
}
if DATABASE_URL.startswith("postgres"):
    engine_kwargs["connect_args"] = {"connect_timeout": 10, "sslmode": "require"}
try:
    engine = create_engine(DATABASE_URL, **engine_kwargs)
except Exception as exc:
    print("WARNING: Tidak dapat membuat database engine:", exc)

if engine is not None:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
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


try:
    if engine is not None:
        Base.metadata.create_all(bind=engine)
        print("Tabel database siap: members, announcements, aspirasi")
except Exception as exc:
    print("WARNING: Tidak dapat membuat tabel database:", exc)


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

router = APIRouter()

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


@app.get("/")
def read_root():
    return {"status": "online", "message": "API MPK SMPN 1 Nusantara"}


@app.get("/api")
def api_root():
    return {"status": "online", "message": "API MPK SMPN 1 Nusantara", "docs": "/docs"}


def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database tidak tersedia")
    try:
        db = SessionLocal()
    except SQLAlchemyError as exc:
        print("DATABASE CONNECT ERROR:", exc)
        raise HTTPException(status_code=503, detail="Database tidak dapat dijangkau")
    try:
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
    parts = authorization.strip().split(" ", 1)
    token = ""
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1].strip()
    elif len(parts) == 1:
        token = parts[0].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Token tidak ditemukan")
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    return payload


@router.get("/health")
def health():
    return {
        "status": "ok",
        "nama": "MPK SMPN 1 Nusantara API",
        "waktu": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/login")
def login(data: LoginRequest):
    if data.username == ADMIN_USERNAME and data.password == ADMIN_PASSWORD:
        return {"token": create_token(data.username), "message": "Login berhasil"}
    raise HTTPException(status_code=401, detail="Username atau password salah")


@router.get("/members", response_model=List[MemberOut])
def list_members(db=Depends(get_db)):
    try:
        members = db.query(Member).order_by(Member.komisi, Member.id).all()
        for member in members:
            if not member.komisi:
                member.komisi = "Pengurus Inti"
            if member.foto is None:
                member.foto = ""
            if member.motto is None:
                member.motto = ""
        return members
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (list members):", exc)
        raise HTTPException(status_code=500, detail="Gagal memuat anggota: masalah database")
    except Exception as exc:
        print("SERVER ERROR (list members):", exc)
        raise HTTPException(status_code=500, detail="Gagal memuat anggota: kesalahan server")


@router.post("/members", response_model=MemberOut)
def create_member(data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        member = Member(**data.model_dump())
        db.add(member)
        db.commit()
        db.refresh(member)
        return member
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (create member):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan anggota: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (create member):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan anggota: kesalahan server")


@router.put("/members/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int, data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)
):
    try:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
        for key, value in data.model_dump().items():
            setattr(member, key, value)
        db.commit()
        db.refresh(member)
        return member
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (update member):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan anggota: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (update member):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan anggota: kesalahan server")


@router.delete("/members/{member_id}")
def delete_member(member_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        member = db.query(Member).filter(Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
        db.delete(member)
        db.commit()
        return {"message": "Anggota berhasil dihapus"}
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (delete member):", exc)
        raise HTTPException(status_code=500, detail="Gagal menghapus anggota: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (delete member):", exc)
        raise HTTPException(status_code=500, detail="Gagal menghapus anggota: kesalahan server")


@router.get("/announcements", response_model=List[AnnouncementOut])
def list_announcements(db=Depends(get_db)):
    try:
        announcements = db.query(Announcement).order_by(Announcement.tanggal.desc()).all()
        for announcement in announcements:
            if announcement.tanggal is None:
                announcement.tanggal = datetime.now(timezone.utc)
        return announcements
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (list announcements):", exc)
        raise HTTPException(status_code=500, detail="Gagal memuat pengumuman: masalah database")
    except Exception as exc:
        print("SERVER ERROR (list announcements):", exc)
        raise HTTPException(status_code=500, detail="Gagal memuat pengumuman: kesalahan server")


@router.post("/announcements", response_model=AnnouncementOut)
def create_announcement(
    data: AnnouncementCreate, db=Depends(get_db), auth: dict = Depends(require_auth)
):
    try:
        announcement = Announcement(**data.model_dump())
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (create announcement):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan pengumuman: masalah database")
    except Exception as exc:
        print("SERVER ERROR (create announcement):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan pengumuman: kesalahan server")


@router.put("/announcements/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    announcement_id: int,
    data: AnnouncementCreate,
    db=Depends(get_db),
    auth: dict = Depends(require_auth),
):
    try:
        announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
        for key, value in data.model_dump().items():
            setattr(announcement, key, value)
        db.commit()
        db.refresh(announcement)
        return announcement
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (update announcement):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan pengumuman: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (update announcement):", exc)
        raise HTTPException(status_code=500, detail="Gagal menyimpan pengumuman: kesalahan server")


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)
):
    try:
        announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
        if not announcement:
            raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
        db.delete(announcement)
        db.commit()
        return {"message": "Pengumuman berhasil dihapus"}
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (delete announcement):", exc)
        raise HTTPException(status_code=500, detail="Gagal menghapus pengumuman: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (delete announcement):", exc)
        raise HTTPException(status_code=500, detail="Gagal menghapus pengumuman: kesalahan server")


@router.get("/aspirasi", response_model=List[AspirasiOut])
def list_aspirasi(db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        aspirasi_list = db.query(Aspirasi).order_by(Aspirasi.dibuat_pada.desc()).all()
        for item in aspirasi_list:
            if item.dibuat_pada is None:
                item.dibuat_pada = datetime.now(timezone.utc)
        return aspirasi_list
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (list aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal memuat aspirasi: masalah database")
    except Exception as exc:
        print("SERVER ERROR (list aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal memuat aspirasi: kesalahan server")


@router.post("/aspirasi", response_model=AspirasiOut)
def create_aspirasi(data: AspirasiCreate, db=Depends(get_db)):
    try:
        if not data.nama or not data.kelas or not data.kategori or not data.pesan:
            raise HTTPException(status_code=400, detail="Nama, kelas, kategori, dan pesan wajib diisi")
        aspirasi = Aspirasi(**data.model_dump(), status="Baru")
        db.add(aspirasi)
        db.commit()
        db.refresh(aspirasi)
        return aspirasi
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (create aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal mengirim aspirasi: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (create aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal mengirim aspirasi: kesalahan server")


@router.patch("/aspirasi/{aspirasi_id}", response_model=AspirasiOut)
def update_aspirasi_status(
    aspirasi_id: int,
    data: AspirasiStatusUpdate,
    db=Depends(get_db),
    auth: dict = Depends(require_auth),
):
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
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (update aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal memperbarui aspirasi: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (update aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal memperbarui aspirasi: kesalahan server")


@router.delete("/aspirasi/{aspirasi_id}")
def delete_aspirasi(aspirasi_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        aspirasi = db.query(Aspirasi).filter(Aspirasi.id == aspirasi_id).first()
        if not aspirasi:
            raise HTTPException(status_code=404, detail="Aspirasi tidak ditemukan")
        db.delete(aspirasi)
        db.commit()
        return {"message": "Aspirasi berhasil dihapus"}
    except SQLAlchemyError as exc:
        print("DATABASE ERROR (delete aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal menghapus aspirasi: masalah database")
    except HTTPException:
        raise
    except Exception as exc:
        print("SERVER ERROR (delete aspirasi):", exc)
        raise HTTPException(status_code=500, detail="Gagal menghapus aspirasi: kesalahan server")


app.include_router(router, prefix="/api")
app.include_router(router, prefix="", include_in_schema=False)