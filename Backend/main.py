from fastapi import FastAPI
from services.langchain import router as api_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:3000"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#check health
@app.get("/")
async def root():
    return {"message": "ok"}