from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import goals

# Initialize db schemas on startup
init_db()

app = FastAPI(
    title="FinSphere AI",
    description="Backend API for FinSphere AI application",
    version="0.1.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(goals.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FinSphere AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
