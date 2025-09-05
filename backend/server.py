from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firebase_uid: str
    email: str
    display_name: str
    role: str  # 'coach' or 'player'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    firebase_uid: str
    email: str
    display_name: str
    role: str

class Player(BaseModel):
    x: float
    y: float
    role: str  # e.g., 'point_guard', 'center', etc.
    responsibilities: List[str]

class PlayStep(BaseModel):
    step_number: int
    description: str
    player_positions: List[Player]
    key_actions: List[str]

class Playbook(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    coach_id: str
    title: str
    description: str
    category: str  # e.g., 'offense', 'defense', 'transition'
    plays: List[PlayStep]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_public: bool = False

class PlaybookCreate(BaseModel):
    title: str
    description: str
    category: str
    plays: List[PlayStep]
    is_public: bool = False

class PlayerAction(BaseModel):
    timestamp: datetime
    action_type: str  # 'move', 'pass', 'shoot', 'defend'
    position: Dict[str, float]  # x, y coordinates
    target_position: Optional[Dict[str, float]] = None
    effectiveness_score: Optional[float] = None

class GameSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_id: str
    playbook_id: str
    play_step: int
    actions: List[PlayerAction]
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    ai_feedback: Optional[str] = None
    performance_score: Optional[float] = None

class GameSessionCreate(BaseModel):
    player_id: str
    playbook_id: str
    play_step: int

class AIFeedbackRequest(BaseModel):
    session_id: str
    actions: List[PlayerAction]

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Playbook Pro API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# User Management
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"firebase_uid": user_data.firebase_uid})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_data.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{firebase_uid}", response_model=User)
async def get_user(firebase_uid: str):
    user = await db.users.find_one({"firebase_uid": firebase_uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@api_router.put("/users/{firebase_uid}", response_model=User)
async def update_user(firebase_uid: str, user_data: dict):
    user_data["updated_at"] = datetime.utcnow()
    result = await db.users.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": user_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"firebase_uid": firebase_uid})
    return User(**updated_user)

# Playbook Management
@api_router.post("/playbooks", response_model=Playbook)
async def create_playbook(playbook_data: PlaybookCreate, coach_id: str):
    playbook_dict = playbook_data.dict()
    playbook_dict["coach_id"] = coach_id
    playbook_obj = Playbook(**playbook_dict)
    await db.playbooks.insert_one(playbook_obj.dict())
    return playbook_obj

@api_router.get("/playbooks", response_model=List[Playbook])
async def get_playbooks(coach_id: Optional[str] = None, public_only: Optional[bool] = None):
    query = {}
    if coach_id:
        query["coach_id"] = coach_id
    if public_only:
        query["is_public"] = True
    
    playbooks = await db.playbooks.find(query).to_list(1000)
    return [Playbook(**playbook) for playbook in playbooks]

@api_router.get("/playbooks/{playbook_id}", response_model=Playbook)
async def get_playbook(playbook_id: str):
    playbook = await db.playbooks.find_one({"id": playbook_id})
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return Playbook(**playbook)

@api_router.put("/playbooks/{playbook_id}", response_model=Playbook)
async def update_playbook(playbook_id: str, playbook_data: dict):
    playbook_data["updated_at"] = datetime.utcnow()
    result = await db.playbooks.update_one(
        {"id": playbook_id},
        {"$set": playbook_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Playbook not found")
    
    updated_playbook = await db.playbooks.find_one({"id": playbook_id})
    return Playbook(**updated_playbook)

@api_router.delete("/playbooks/{playbook_id}")
async def delete_playbook(playbook_id: str):
    result = await db.playbooks.delete_one({"id": playbook_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return {"message": "Playbook deleted successfully"}

# Game Session Management
@api_router.post("/game-sessions", response_model=GameSession)
async def create_game_session(session_data: GameSessionCreate):
    session_dict = session_data.dict()
    session_dict["actions"] = []
    session_obj = GameSession(**session_dict)
    await db.game_sessions.insert_one(session_obj.dict())
    return session_obj

@api_router.get("/game-sessions/{session_id}", response_model=GameSession)
async def get_game_session(session_id: str):
    session = await db.game_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")
    return GameSession(**session)

@api_router.post("/game-sessions/{session_id}/actions")
async def add_action_to_session(session_id: str, action: PlayerAction):
    result = await db.game_sessions.update_one(
        {"id": session_id},
        {"$push": {"actions": action.dict()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    return {"message": "Action added successfully"}

@api_router.post("/game-sessions/{session_id}/end")
async def end_game_session(session_id: str):
    result = await db.game_sessions.update_one(
        {"id": session_id},
        {"$set": {"end_time": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    return {"message": "Game session ended"}

# AI Feedback
@api_router.post("/ai-feedback")
async def generate_ai_feedback(feedback_request: AIFeedbackRequest):
    try:
        # Get session details
        session = await db.game_sessions.find_one({"id": feedback_request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Game session not found")
        
        # Prepare actions data for AI analysis
        actions_data = []
        for action in feedback_request.actions:
            actions_data.append({
                "timestamp": action.timestamp.isoformat(),
                "action_type": action.action_type,
                "position": action.position,
                "target_position": action.target_position,
                "effectiveness_score": action.effectiveness_score
            })
        
        # Initialize LLM chat with Emergent LLM key
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=f"basketball_analysis_{session['id']}",
            system_message="You are an expert basketball coach analyzing player performance in basketball drills and game situations. Provide constructive feedback focusing on positioning, timing, decision-making, and tactical awareness."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Create analysis prompt
        prompt = f"""
        Analyze the following basketball play actions from a training session:
        
        Actions: {actions_data}
        
        Please provide feedback on:
        1. Overall performance effectiveness (score out of 100)
        2. Key strengths observed
        3. Areas for improvement
        4. Specific coaching recommendations
        5. Focus areas for next practice
        
        Keep the feedback constructive, specific, and actionable for a youth basketball player.
        """
        
        user_message = UserMessage(text=prompt)
        ai_response = await chat.send_message(user_message)
        
        # Update session with AI feedback
        await db.game_sessions.update_one(
            {"id": feedback_request.session_id},
            {"$set": {"ai_feedback": ai_response}}
        )
        
        return {"feedback": ai_response}
        
    except Exception as e:
        logging.error(f"AI feedback generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI feedback")

# Sample Data Creation
@api_router.post("/sample-data")
async def create_sample_data():
    """Create sample playbooks for demonstration"""
    
    # Sample playbook: Pick and Roll
    sample_playbook_1 = Playbook(
        coach_id="sample_coach",
        title="Basic Pick and Roll",
        description="Fundamental pick and roll play for offense",
        category="offense",
        is_public=True,
        plays=[
            PlayStep(
                step_number=1,
                description="Initial setup - Point guard at top, Center sets up for screen",
                player_positions=[
                    Player(x=0.5, y=0.8, role="point_guard", responsibilities=["Control ball", "Read defense"]),
                    Player(x=0.4, y=0.6, role="center", responsibilities=["Prepare for screen"]),
                    Player(x=0.1, y=0.4, role="forward", responsibilities=["Space the floor"]),
                    Player(x=0.9, y=0.4, role="forward", responsibilities=["Space the floor"]),
                    Player(x=0.7, y=0.2, role="guard", responsibilities=["Spot up for three"])
                ],
                key_actions=["Ball handler maintains control", "Center positions for screen"]
            ),
            PlayStep(
                step_number=2,
                description="Screen execution - Center sets solid screen, Point guard uses it",
                player_positions=[
                    Player(x=0.6, y=0.7, role="point_guard", responsibilities=["Use screen", "Attack basket or pass"]),
                    Player(x=0.5, y=0.75, role="center", responsibilities=["Set solid screen", "Roll to basket"]),
                    Player(x=0.1, y=0.4, role="forward", responsibilities=["Stay spaced"]),
                    Player(x=0.9, y=0.4, role="forward", responsibilities=["Stay spaced"]),
                    Player(x=0.7, y=0.2, role="guard", responsibilities=["Be ready for pass"])
                ],
                key_actions=["Screen contact", "Ball handler decision", "Screen setter rolls"]
            )
        ]
    )
    
    # Sample playbook: 2-3 Zone Defense
    sample_playbook_2 = Playbook(
        coach_id="sample_coach",
        title="2-3 Zone Defense",
        description="Basic 2-3 zone defensive formation",
        category="defense",
        is_public=True,
        plays=[
            PlayStep(
                step_number=1,
                description="Initial 2-3 zone setup",
                player_positions=[
                    Player(x=0.3, y=0.8, role="guard", responsibilities=["Cover top left", "Pressure ball"]),
                    Player(x=0.7, y=0.8, role="guard", responsibilities=["Cover top right", "Help on ball"]),
                    Player(x=0.2, y=0.5, role="forward", responsibilities=["Cover left wing", "Help on post"]),
                    Player(x=0.5, y=0.3, role="center", responsibilities=["Protect paint", "Defend post"]),
                    Player(x=0.8, y=0.5, role="forward", responsibilities=["Cover right wing", "Help on post"])
                ],
                key_actions=["Maintain zone shape", "Communicate rotations", "Contest shots"]
            )
        ]
    )
    
    # Insert sample playbooks
    await db.playbooks.insert_one(sample_playbook_1.dict())
    await db.playbooks.insert_one(sample_playbook_2.dict())
    
    return {"message": "Sample data created successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()