from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'sanctuary-hotel-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ============ MODELS ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class RoomBase(BaseModel):
    name: str
    room_type: str
    description: str
    price_per_night: float
    capacity: int
    amenities: List[str]
    image_url: str
    is_available: bool = True

class RoomCreate(RoomBase):
    pass

class RoomResponse(RoomBase):
    id: str

class BookingCreate(BaseModel):
    room_id: str
    check_in: str
    check_out: str
    guest_name: str
    guest_email: str
    guest_phone: str
    special_requests: Optional[str] = ""

class BookingResponse(BaseModel):
    id: str
    room_id: str
    room_name: str
    room_type: str
    user_id: str
    check_in: str
    check_out: str
    guest_name: str
    guest_email: str
    guest_phone: str
    special_requests: str
    total_price: float
    status: str
    created_at: str

class MenuItemBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: str

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id, "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name, "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email, "user")
    return TokenResponse(access_token=token, token_type="bearer",
        user=UserResponse(id=user_id, email=user_data.email, name=user_data.name, role="user"))

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(access_token=token, token_type="bearer",
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"]))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["id"], email=user["email"], name=user["name"], role=user["role"])

# ============ ROOMS ROUTES ============

@api_router.get("/rooms", response_model=List[RoomResponse])
async def get_rooms(room_type: Optional[str] = None):
    query = {}
    if room_type:
        query["room_type"] = room_type
    rooms = await db.rooms.find(query, {"_id": 0}).to_list(100)
    return rooms

@api_router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str):
    room = await db.rooms.find_one({"id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@api_router.post("/rooms", response_model=RoomResponse)
async def create_room(room_data: RoomCreate, admin: dict = Depends(get_admin_user)):
    room_id = str(uuid.uuid4())
    room_doc = {"id": room_id, **room_data.model_dump()}
    await db.rooms.insert_one(room_doc)
    return RoomResponse(id=room_id, **room_data.model_dump())

@api_router.put("/rooms/{room_id}", response_model=RoomResponse)
async def update_room(room_id: str, room_data: RoomCreate, admin: dict = Depends(get_admin_user)):
    result = await db.rooms.update_one({"id": room_id}, {"$set": room_data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse(id=room_id, **room_data.model_dump())

@api_router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.rooms.delete_one({"id": room_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted"}

# ============ BOOKINGS ROUTES ============

@api_router.post("/bookings", response_model=BookingResponse)
async def create_booking(booking_data: BookingCreate, user: dict = Depends(get_current_user)):
    room = await db.rooms.find_one({"id": booking_data.room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if not room.get("is_available"):
        raise HTTPException(status_code=400, detail="Room is not available")

    overlapping = await db.bookings.find_one({
        "room_id": booking_data.room_id, "status": {"$ne": "cancelled"},
        "$or": [
            {"check_in": {"$lt": booking_data.check_out, "$gte": booking_data.check_in}},
            {"check_out": {"$gt": booking_data.check_in, "$lte": booking_data.check_out}},
            {"check_in": {"$lte": booking_data.check_in}, "check_out": {"$gte": booking_data.check_out}}
        ]
    })
    if overlapping:
        raise HTTPException(status_code=400, detail="Room not available for selected dates")

    check_in_date = datetime.fromisoformat(booking_data.check_in)
    check_out_date = datetime.fromisoformat(booking_data.check_out)
    nights = (check_out_date - check_in_date).days
    total_price = nights * room["price_per_night"]

    booking_id = str(uuid.uuid4())
    booking_doc = {
        "id": booking_id, "room_id": booking_data.room_id,
        "room_name": room["name"], "room_type": room["room_type"],
        "user_id": user["id"], "check_in": booking_data.check_in,
        "check_out": booking_data.check_out, "guest_name": booking_data.guest_name,
        "guest_email": booking_data.guest_email, "guest_phone": booking_data.guest_phone,
        "special_requests": booking_data.special_requests or "",
        "total_price": total_price, "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking_doc)
    return BookingResponse(**{k: v for k, v in booking_doc.items() if k != "_id"})

@api_router.get("/bookings", response_model=List[BookingResponse])
async def get_user_bookings(user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.get("/bookings/all", response_model=List[BookingResponse])
async def get_all_bookings(admin: dict = Depends(get_admin_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, admin: dict = Depends(get_admin_user)):
    if status not in ["confirmed", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": f"Booking status updated to {status}"}

# ============ MENU ROUTES ============

@api_router.get("/menu", response_model=List[MenuItemResponse])
async def get_menu(category: Optional[str] = None):
    query = {"is_available": True}
    if category:
        query["category"] = category
    items = await db.menu_items.find(query, {"_id": 0}).to_list(100)
    return items

@api_router.get("/menu/all", response_model=List[MenuItemResponse])
async def get_all_menu_items(admin: dict = Depends(get_admin_user)):
    items = await db.menu_items.find({}, {"_id": 0}).to_list(100)
    return items

@api_router.post("/menu", response_model=MenuItemResponse)
async def create_menu_item(item_data: MenuItemCreate, admin: dict = Depends(get_admin_user)):
    item_id = str(uuid.uuid4())
    item_doc = {"id": item_id, **item_data.model_dump()}
    await db.menu_items.insert_one(item_doc)
    return MenuItemResponse(id=item_id, **item_data.model_dump())

@api_router.put("/menu/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(item_id: str, item_data: MenuItemCreate, admin: dict = Depends(get_admin_user)):
    result = await db.menu_items.update_one({"id": item_id}, {"$set": item_data.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return MenuItemResponse(id=item_id, **item_data.model_dump())

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"message": "Menu item deleted"}

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    existing_rooms = await db.rooms.count_documents({})
    if existing_rooms > 0:
        return {"message": "Data already seeded"}

    admin_id = str(uuid.uuid4())
    await db.users.insert_one({
        "id": admin_id, "email": "admin@sanctuary.com",
        "password": hash_password("admin123"), "name": "Hotel Admin",
        "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()
    })

    rooms = [
        {
            "id": str(uuid.uuid4()), "name": "Standard Garden View", "room_type": "Standard",
            "description": "A comfortable room with a serene garden view. Perfect for solo travelers or couples seeking tranquility.",
            "price_per_night": 150.00, "capacity": 2,
            "amenities": ["Wi-Fi", "Air Conditioning", "Mini Bar", "Room Service"],
            "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
            "is_available": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Deluxe Ocean Suite", "room_type": "Deluxe",
            "description": "Spacious suite with breathtaking ocean views. Features a private balcony and premium amenities.",
            "price_per_night": 280.00, "capacity": 3,
            "amenities": ["Wi-Fi", "Air Conditioning", "Mini Bar", "Room Service", "Ocean View", "Private Balcony", "Jacuzzi"],
            "image_url": "https://images.unsplash.com/photo-1598414381594-18d86505f5d5?w=800&q=80",
            "is_available": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Presidential Suite", "room_type": "Suite",
            "description": "The epitome of luxury. A sprawling suite with separate living area, dining room, and panoramic views.",
            "price_per_night": 550.00, "capacity": 4,
            "amenities": ["Wi-Fi", "Air Conditioning", "Mini Bar", "Room Service", "Ocean View", "Private Balcony", "Jacuzzi", "Butler Service", "Private Chef"],
            "image_url": "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800&q=80",
            "is_available": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Garden Cottage", "room_type": "Standard",
            "description": "A cozy cottage nestled in our lush gardens, offering a private retreat with nature at your doorstep.",
            "price_per_night": 180.00, "capacity": 2,
            "amenities": ["Wi-Fi", "Air Conditioning", "Private Garden", "Room Service"],
            "image_url": "https://images.unsplash.com/photo-1619617679093-fedc9cb0d89b?w=800&q=80",
            "is_available": True
        },
        {
            "id": str(uuid.uuid4()), "name": "Penthouse Suite", "room_type": "Suite",
            "description": "Our crown jewel. A full-floor penthouse with 360-degree views, private pool, and dedicated concierge.",
            "price_per_night": 900.00, "capacity": 6,
            "amenities": ["Wi-Fi", "Air Conditioning", "Private Pool", "Butler Service", "Private Chef", "360° Views", "Home Theater"],
            "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
            "is_available": True
        }
    ]
    await db.rooms.insert_many(rooms)

    menu_items = [
        {"id": str(uuid.uuid4()), "name": "Eggs Benedict", "description": "Poached eggs on English muffin with house hollandaise sauce and smoked salmon", "price": 18.00, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1608039829572-9b0189d4c5a1?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Avocado Toast", "description": "Sourdough toast with smashed avocado, cherry tomatoes, feta and microgreens", "price": 15.00, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Continental Platter", "description": "Seasonal fruits, artisan cheeses, house-baked pastries and preserves", "price": 22.00, "category": "Breakfast", "image_url": "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Grilled Salmon", "description": "Atlantic salmon with lemon butter sauce, capers and seasonal vegetables", "price": 32.00, "category": "Lunch", "image_url": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Caesar Salad", "description": "Crisp romaine lettuce with parmesan, house-made croutons and anchovy dressing", "price": 16.00, "category": "Lunch", "image_url": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Truffle Burger", "description": "Wagyu beef patty, truffle aioli, aged cheddar and caramelized onions on brioche", "price": 28.00, "category": "Lunch", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Filet Mignon", "description": "8oz prime beef tenderloin with truffle mashed potatoes and red wine reduction", "price": 58.00, "category": "Dinner", "image_url": "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Lobster Risotto", "description": "Creamy Arborio rice with Maine lobster, saffron and aged parmesan", "price": 48.00, "category": "Dinner", "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Duck Confit", "description": "Slow-cooked duck leg with cherry gastrique, dauphinoise potatoes and haricots verts", "price": 42.00, "category": "Dinner", "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Signature Cocktails", "description": "Handcrafted cocktails by our master mixologist — ask about today's seasonal creation", "price": 16.00, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Premium Wine Selection", "description": "Curated wines from our 500-bottle cellar — Old World and New World varietals", "price": 14.00, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80", "is_available": True},
        {"id": str(uuid.uuid4()), "name": "Artisan Coffee", "description": "Single-origin pour-overs, espresso drinks and cold brew prepared to order", "price": 8.00, "category": "Beverages", "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", "is_available": True},
    ]
    await db.menu_items.insert_many(menu_items)

    return {"message": "Data seeded successfully", "admin_email": "admin@sanctuary.com", "admin_password": "admin123"}

@api_router.get("/")
async def root():
    return {"message": "The Sanctuary Hotel API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
