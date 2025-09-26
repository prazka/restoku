import base64
import json
import httpx
from fastapi import UploadFile, File, APIRouter
from fastapi.responses import JSONResponse
from langchain.prompts import PromptTemplate
from langchain_ollama import OllamaLLM


# Inisialisasi FastAPI
router = APIRouter()

# Inisialisasi model multimodal (llava)
llm = OllamaLLM(model="llava")

# Prompt template
prompt_template = """
Kamu adalah AI yang mengekstrak informasi dari foto makanan/minuman.
Tugasmu: kembalikan hasil dalam format JSON dengan field:
- name: nama makanan/minuman
- description: deskripsi singkat
- price: perkiraan harga dalam rupiah (angka saja, tanpa simbol Rp)

Jawaban HARUS JSON valid.
"""

prompt = PromptTemplate.from_template(prompt_template)

# Chain: ambil gambar → kirim ke llava → parse output JSON
def extractor_func(image_bytes: bytes):
    # Encode ke base64 untuk llava
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    image_url = f"data:image/jpeg;base64,{encoded_image}"

    # Buat prompt
    formatted_prompt = prompt.format()

    # Invoke model dengan gambar
    response = llm.invoke(formatted_prompt, images=[image_url])

    # Parsing JSON aman
    try:
        parsed = json.loads(response)
    except Exception:
        parsed = {"name": None, "description": None, "price": None, "raw": response}
    return parsed



@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()
    result = extractor_func(contents)
    url = ""
    response = httpx.post("http://localhost:8000/menu/", json=result)
    return {"message": result}