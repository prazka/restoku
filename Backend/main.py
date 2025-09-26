from fastapi import FastAPI
from services.langchain import router as api_router

app = FastAPI()

app.include_router(api_router)

#check health
@app.get("/")
async def root():
    return {"message": "ok"}