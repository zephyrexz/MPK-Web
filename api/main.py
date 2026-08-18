import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, UploadFile
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

# --- Konfigurasi Supabase Storage ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "mpk-storage")
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_UPLOAD_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
ALLOWED_UPLOAD_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"}

_supabase_client = None


def get_supabase_client():
    """Lazy client Supabase Storage (service role). None jika belum dikonfigurasi."""
    global _supabase_client
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return None
    if _supabase_client is None:
        try:
            from supabase import create_client

            _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        except Exception as exc:
            print("FATAL SUPABASE CLIENT ERROR:", exc)
            _supabase_client = None
    return _supabase_client


def sanitize_filename(original: str) -> str:
    """Nama file aman + timestamp unik untuk mencegah tabrakan nama."""
    name, ext = os.path.splitext(original or "gambar")
    name = re.sub(r"[^a-zA-Z0-9_-]", "", name).strip("_-") or "gambar"
    ext = (ext or "").lower()
    if ext not in ALLOWED_UPLOAD_EXT:
        ext = ".png"
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"{name[:40]}_{stamp}_{uuid.uuid4().hex[:8]}{ext}"

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
    periode = Column(String(20), nullable=True, default="2026/2027")
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


class SiteSetting(Base):
    __tablename__ = "site_settings"
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=True)


class CarouselItem(Base):
    __tablename__ = "carousel_items"
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    urutan = Column(Integer, nullable=False, default=0, server_default=text("0"))


class AboutContent(Base):
    __tablename__ = "about_content"
    id = Column(Integer, primary_key=True)
    pengertian = Column(Text, nullable=False)
    visi = Column(Text, nullable=False)
    misi = Column(Text, nullable=False)
    makna_logo = Column(Text, nullable=False)


class SocialMedia(Base):
    __tablename__ = "social_media"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)
    nama = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    icon_url = Column(String(500), nullable=True)
    urutan = Column(Integer, nullable=False, default=0, server_default=text("0"))


DEFAULT_ABOUT_PENGERTIAN = (
    "Majelis Perwakilan Kelas (MPK) SMP Negeri 248 Jakarta adalah organisasi kesiswaan yang menjadi "
    "wadah aspirasi, suara, dan kreativitas seluruh siswa. MPK dibentuk dari perwakilan setiap "
    "kelas dan bertugas menyampaikan ide, saran, serta kritik membangun kepada pihak sekolah, "
    "sekaligus membantu menciptakan lingkungan belajar yang nyaman, disiplin, dan berprestasi."
)
DEFAULT_ABOUT_VISI = (
    "Menjadi wadah aspirasi siswa yang aktif, kreatif, dan bertanggung jawab dalam mewujudkan "
    "sekolah yang nyaman, disiplin, dan berprestasi."
)
DEFAULT_ABOUT_MISI = (
    "Menampung dan menyalurkan aspirasi seluruh siswa kepada pihak sekolah.\n"
    "Mengadakan kegiatan positif yang mengembangkan bakat dan kreativitas siswa.\n"
    "Membangun kerjasama yang baik antara siswa, guru, dan pihak sekolah.\n"
    "Melatih jiwa kepemimpinan dan tanggung jawab melalui organisasi.\n"
    "Menjadi teladan kedisiplinan bagi seluruh siswa."
)
DEFAULT_ABOUT_MAKNA_LOGO = (
    "Perisai melambangkan perlindungan terhadap hak dan aspirasi setiap siswa.\n"
    "Buku terbuka melambangkan semangat belajar dan keilmuan.\n"
    "Bintang melambangkan cita-cita luhur dan kejujuran.\n"
    "Rantai melambangkan persatuan dan kebersamaan antar siswa.\n"
    "Warna biru dan emas melambangkan ketenangan, kepercayaan, dan semangat juang yang tinggi."
)


class LoginRequest(BaseModel):
    username: str
    password: str


class MemberCreate(BaseModel):
    nama: str
    kelas: str
    jabatan: str
    komisi: str = "Pengurus Inti"
    periode: Optional[str] = None
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


class SiteSettingIn(BaseModel):
    key: str
    value: str


class CarouselItemCreate(BaseModel):
    image_url: str
    title: str
    description: str
    urutan: int = 0


class CarouselItemOut(CarouselItemCreate):
    id: int
    model_config = {"from_attributes": True}


class AboutIn(BaseModel):
    pengertian: str
    visi: str
    misi: str
    makna_logo: str


class AboutOut(AboutIn):
    model_config = {"from_attributes": True}


class SocialMediaCreate(BaseModel):
    platform: str
    nama: str
    url: str
    icon_url: Optional[str] = None
    urutan: int = 0


class SocialMediaOut(SocialMediaCreate):
    id: int
    model_config = {"from_attributes": True}


app = FastAPI(
    title="MPK SMP Negeri 248 Jakarta API",
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


_tables_ready = False


def ensure_tables(db) -> None:
    global _tables_ready
    if _tables_ready or db is None:
        return
    try:
        Base.metadata.create_all(bind=db.get_bind())
        try:
            db.execute(text("ALTER TABLE members ADD COLUMN periode VARCHAR(20) DEFAULT '2026/2027'"))
            db.commit()
            print("Migrasi: kolom members.periode ditambahkan")
        except SQLAlchemyError:
            db.rollback()
        try:
            db.execute(text("ALTER TABLE social_media ADD COLUMN icon_url VARCHAR(500)"))
            db.commit()
            print("Migrasi: kolom social_media.icon_url ditambahkan")
        except SQLAlchemyError:
            db.rollback()
        if not db.query(AboutContent).first():
            db.add(
                AboutContent(
                    id=1,
                    pengertian=DEFAULT_ABOUT_PENGERTIAN,
                    visi=DEFAULT_ABOUT_VISI,
                    misi=DEFAULT_ABOUT_MISI,
                    makna_logo=DEFAULT_ABOUT_MAKNA_LOGO,
                )
            )
        if not db.query(SiteSetting).filter_by(key="logo_url").first():
            db.add(SiteSetting(key="logo_url", value=""))
        if db.query(SocialMedia).count() == 0:
            db.add_all([
                SocialMedia(platform="instagram", nama="@mpk.smp248jakarta", url="https://instagram.com/mpk.smp248jakarta", urutan=0),
                SocialMedia(platform="tiktok", nama="@mpksmp248", url="https://tiktok.com/@mpksmp248", urutan=1),
                SocialMedia(platform="youtube", nama="MPK SMP Negeri 248 Jakarta", url="https://youtube.com/@mpksmp248jakarta", urutan=2),
            ])
        db.commit()
        _tables_ready = True
        print("Tabel database siap: members, announcements, aspirasi, site_settings, carousel_items, about_content, social_media")
    except SQLAlchemyError as exc:
        print("WARNING: create_all/seed tidak selesai:", exc)


def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database engine tidak aktif")
    db = SessionLocal()
    try:
        ensure_tables(db)
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
    return {"status": "online", "message": "API MPK SMP Negeri 248 Jakarta"}


@app.get("/api")
def api_root():
    return {"status": "online", "message": "API MPK SMP Negeri 248 Jakarta", "docs": "/docs"}


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
            m.periode = m.periode or "2026/2027"
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


# --- SETTINGS SITUS (LOGO DINAMIS, DLL) ---
@app.get("/settings")
@app.get("/api/settings")
def get_settings(db=Depends(get_db)):
    try:
        rows = db.query(SiteSetting).all()
        return {r.key: (r.value or "") for r in rows}
    except Exception as exc:
        print("GET SETTINGS ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/settings")
@app.put("/api/settings")
def upsert_setting(data: SiteSettingIn, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        row = db.query(SiteSetting).filter_by(key=data.key).first()
        if row:
            row.value = data.value
        else:
            db.add(SiteSetting(key=data.key, value=data.value))
        db.commit()
        return {"key": data.key, "value": data.value}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("UPDATE SETTINGS ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# --- CAROUSEL (GALERI KEGIATAN) ---
@app.get("/carousel", response_model=List[CarouselItemOut])
@app.get("/api/carousel", response_model=List[CarouselItemOut])
def list_carousel(db=Depends(get_db)):
    try:
        items = db.query(CarouselItem).order_by(CarouselItem.urutan, CarouselItem.id).all()
        for item in items:
            item.urutan = item.urutan or 0
        return items
    except Exception as exc:
        print("GET CAROUSEL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/carousel", response_model=CarouselItemOut)
@app.post("/api/carousel", response_model=CarouselItemOut)
def create_carousel_item(data: CarouselItemCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        item = CarouselItem(**data.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    except Exception as exc:
        db.rollback()
        print("CREATE CAROUSEL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/carousel/{item_id}", response_model=CarouselItemOut)
@app.put("/api/carousel/{item_id}", response_model=CarouselItemOut)
def update_carousel_item(item_id: int, data: CarouselItemCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        item = db.query(CarouselItem).filter(CarouselItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Gambar carousel tidak ditemukan")
        for key, value in data.model_dump().items():
            setattr(item, key, value)
        db.commit()
        db.refresh(item)
        return item
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("UPDATE CAROUSEL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/carousel/{item_id}")
@app.delete("/api/carousel/{item_id}")
def delete_carousel_item(item_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        item = db.query(CarouselItem).filter(CarouselItem.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Gambar carousel tidak ditemukan")
        db.delete(item)
        db.commit()
        return {"message": "Gambar carousel berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("DELETE CAROUSEL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# --- TENTANG MPK ---
@app.get("/about", response_model=AboutOut)
@app.get("/api/about", response_model=AboutOut)
def get_about(db=Depends(get_db)):
    try:
        row = db.query(AboutContent).first()
        if not row:
            row = AboutContent(
                id=1,
                pengertian=DEFAULT_ABOUT_PENGERTIAN,
                visi=DEFAULT_ABOUT_VISI,
                misi=DEFAULT_ABOUT_MISI,
                makna_logo=DEFAULT_ABOUT_MAKNA_LOGO,
            )
            db.add(row)
            db.commit()
            db.refresh(row)
        return row
    except Exception as exc:
        print("GET ABOUT ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/about", response_model=AboutOut)
@app.put("/api/about", response_model=AboutOut)
def update_about(data: AboutIn, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        row = db.query(AboutContent).first()
        if not row:
            row = AboutContent(id=1, **data.model_dump())
            db.add(row)
        else:
            for key, value in data.model_dump().items():
                setattr(row, key, value)
        db.commit()
        db.refresh(row)
        return row
    except Exception as exc:
        db.rollback()
        print("UPDATE ABOUT ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# --- SOCIAL MEDIA ---
@app.get("/social", response_model=List[SocialMediaOut])
@app.get("/api/social", response_model=List[SocialMediaOut])
def list_social(db=Depends(get_db)):
    try:
        rows = db.query(SocialMedia).order_by(SocialMedia.urutan, SocialMedia.id).all()
        for s in rows:
            s.nama = s.nama or ""
            s.icon_url = s.icon_url or ""
        return rows
    except Exception as exc:
        print("GET SOCIAL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/social", response_model=SocialMediaOut)
@app.post("/api/social", response_model=SocialMediaOut)
def create_social(data: SocialMediaCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        row = SocialMedia(**data.model_dump())
        db.add(row)
        db.commit()
        db.refresh(row)
        return row
    except Exception as exc:
        db.rollback()
        print("CREATE SOCIAL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.put("/social/{social_id}", response_model=SocialMediaOut)
@app.put("/api/social/{social_id}", response_model=SocialMediaOut)
def update_social(social_id: int, data: SocialMediaCreate, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        row = db.query(SocialMedia).filter(SocialMedia.id == social_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Akun sosial media tidak ditemukan")
        for key, value in data.model_dump().items():
            setattr(row, key, value)
        db.commit()
        db.refresh(row)
        return row
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("UPDATE SOCIAL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/social/{social_id}")
@app.delete("/api/social/{social_id}")
def delete_social(social_id: int, db=Depends(get_db), auth: dict = Depends(require_auth)):
    try:
        row = db.query(SocialMedia).filter(SocialMedia.id == social_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Akun sosial media tidak ditemukan")
        db.delete(row)
        db.commit()
        return {"message": "Akun sosial media berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        print("DELETE SOCIAL ERROR:", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# --- UPLOAD GAMBAR KE SUPABASE STORAGE ---
@app.post("/upload")
@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...), auth: dict = Depends(require_auth)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="File yang diunggah kosong")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran file maksimal 5 MB")
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Jenis file tidak diizinkan ({content_type or 'tidak dikenal'}). Gunakan PNG, JPG, WEBP, GIF, atau SVG.",
        )
    client = get_supabase_client()
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Penyimpanan file belum dikonfigurasi. Admin: atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY pada environment Vercel, lalu coba lagi.",
        )
    filename = sanitize_filename(file.filename or "gambar")
    folder = datetime.now(timezone.utc).strftime("%Y/%m")
    path = f"{folder}/{filename}"
    try:
        try:
            client.storage.get_bucket(SUPABASE_STORAGE_BUCKET)
        except Exception:
            client.storage.create_bucket(SUPABASE_STORAGE_BUCKET, options={"public": True})
        client.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            path,
            data,
            {"content-type": content_type, "upsert": "true"},
        )
        public_url = client.storage.from_(SUPABASE_STORAGE_BUCKET).get_public_url(path)
        print(f"UPLOAD OK: {public_url}")
        return {"url": public_url, "path": path, "bucket": SUPABASE_STORAGE_BUCKET}
    except HTTPException:
        raise
    except Exception as exc:
        print("UPLOAD ERROR:", exc)
        raise HTTPException(status_code=500, detail=f"Gagal mengunggah ke Supabase Storage: {exc}")