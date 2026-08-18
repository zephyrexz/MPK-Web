import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:mpk%402026hebat@db.ajitvosbvdccuxpbfadr.supabase.co:5432/postgres",
)
JWT_SECRET = os.getenv("JWT_SECRET", "V++9OqCkNjnCKlZli2WD+2vF+NPyTeAswOBU1mx38weGl+40SfpCHqUIo2wcMp6CuMOq9c7KAUeK1UQqfdpVNw==")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = 12
ADMIN_USERNAME = "admin_mpk"
ADMIN_PASSWORD = "SecurePassword123"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Member(Base):
    __tablename__ = "members"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    kelas = Column(String(10), nullable=False)
    jabatan = Column(String(100), nullable=False)
    komisi = Column(String(100), nullable=False, default="Pengurus Inti")
    foto = Column(String(500), nullable=True)
    motto = Column(String(255), nullable=True)


class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    judul = Column(String(200), nullable=False)
    isi = Column(Text, nullable=False)
    tanggal = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    penting = Column(Boolean, default=False)


class Aspirasi(Base):
    __tablename__ = "aspirasi"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False)
    kelas = Column(String(10), nullable=False)
    kategori = Column(String(50), nullable=False)
    pesan = Column(Text, nullable=False)
    status = Column(String(20), default="Baru")
    dibuat_pada = Column(DateTime, default=lambda: datetime.now(timezone.utc))


Base.metadata.create_all(bind=engine)


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


app = FastAPI(title="MPK SMPN 1 Nusantara API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRES_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_auth(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token tidak ditemukan")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    return payload


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "nama": "MPK SMPN 1 Nusantara API",
        "waktu": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/login")
def login(data: LoginRequest):
    if data.username == ADMIN_USERNAME and data.password == ADMIN_PASSWORD:
        return {"token": create_token(data.username), "message": "Login berhasil"}
    raise HTTPException(status_code=401, detail="Username atau password salah")


@app.get("/api/members", response_model=List[MemberOut])
def list_members(db=Depends(get_db)):
    return db.query(Member).order_by(Member.komisi, Member.id).all()


@app.post("/api/members", response_model=MemberOut)
def create_member(data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    member = Member(**data.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@app.put("/api/members/{member_id}", response_model=MemberOut)
def update_member(
    member_id: int, data: MemberCreate, db=Depends(get_db), auth: dict = Depends(require_auth)
):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
    for key, value in data.model_dump().items():
        setattr(member, key, value)
    db.commit()
    db.refresh(member)
    return member


@app.delete("/api/members/{member_id}")
def delete_member(member_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
    db.delete(member)
    db.commit()
    return {"message": "Anggota berhasil dihapus"}


@app.get("/api/announcements", response_model=List[AnnouncementOut])
def list_announcements(db=Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.tanggal.desc()).all()


@app.post("/api/announcements", response_model=AnnouncementOut)
def create_announcement(
    data: AnnouncementCreate, db=Depends(get_db), auth: dict = Depends(require_auth)
):
    announcement = Announcement(**data.model_dump())
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@app.put("/api/announcements/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    announcement_id: int,
    data: AnnouncementCreate,
    db=Depends(get_db),
    auth: dict = Depends(require_auth),
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
    for key, value in data.model_dump().items():
        setattr(announcement, key, value)
    db.commit()
    db.refresh(announcement)
    return announcement


@app.delete("/api/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
    db.delete(announcement)
    db.commit()
    return {"message": "Pengumuman berhasil dihapus"}


@app.get("/api/aspirasi", response_model=List[AspirasiOut])
def list_aspirasi(db=Depends(get_db), auth: dict = Depends(require_auth)):
    return db.query(Aspirasi).order_by(Aspirasi.dibuat_pada.desc()).all()


@app.post("/api/aspirasi", response_model=AspirasiOut)
def create_aspirasi(data: AspirasiCreate, db=Depends(get_db)):
    if not data.nama or not data.kelas or not data.pesan:
        raise HTTPException(status_code=400, detail="Nama, kelas, dan pesan wajib diisi")
    aspirasi = Aspirasi(**data.model_dump(), status="Baru")
    db.add(aspirasi)
    db.commit()
    db.refresh(aspirasi)
    return aspirasi


@app.patch("/api/aspirasi/{aspirasi_id}", response_model=AspirasiOut)
def update_aspirasi_status(
    aspirasi_id: int,
    data: AspirasiStatusUpdate,
    db=Depends(get_db),
    auth: dict = Depends(require_auth),
):
    if data.status not in ("Baru", "Diproses", "Selesai"):
        raise HTTPException(status_code=400, detail="Status tidak valid")
    aspirasi = db.query(Aspirasi).filter(Aspirasi.id == aspirasi_id).first()
    if not aspirasi:
        raise HTTPException(status_code=404, detail="Aspirasi tidak ditemukan")
    aspirasi.status = data.status
    db.commit()
    db.refresh(aspirasi)
    return aspirasi


@app.delete("/api/aspirasi/{aspirasi_id}")
def delete_aspirasi(aspirasi_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    aspirasi = db.query(Aspirasi).filter(Aspirasi.id == aspirasi_id).first()
    if not aspirasi:
        raise HTTPException(status_code=404, detail="Aspirasi tidak ditemukan")
    db.delete(aspirasi)
    db.commit()
    return {"message": "Aspirasi berhasil dihapus"}