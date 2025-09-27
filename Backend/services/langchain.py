import base64
import json
import os
import dotenv
import httpx
import re
from fastapi import UploadFile, File, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from groq import Groq  


router = APIRouter()
dotenv.load_dotenv()

# Inisialisasi Groq client
client = Groq(api_key=os.environ.get("Groq_API_Key"))


# INSTRUCTION = """
# Kamu adalah AI yang mengekstrak informasi dari foto makanan/minuman.
# Tugasmu: kembalikan hasil dalam format JSON dengan field:
# - name: nama makanan/minuman
# - description: deskripsi singkat
# - price: perkiraan harga dalam rupiah (angka saja, tanpa simbol Rp)
# - image: gambar asli dari input dalam bentuk base64

# Jawaban HARUS JSON valid.
# """
INSTRUCTION = """
Kamu adalah AI yang mengekstrak informasi dari foto makanan/minuman.

⚠️ FORMAT WAJIB JSON TANPA PENJELASAN LAIN:
{
    "name": "...",
    "description": "...",
    "price": 0,
    "image": "BASE64_INPUT"
}

JANGAN gunakan markdown, jangan gunakan ```json, jangan tambahkan teks di luar JSON!
"""



def safe_parse_response(response_text, encoded_image):
    # Ambil isi JSON di dalam blok ```json ... ```
    match = re.search(r"\{[\s\S]*\}", response_text)
    if match:
        try:
            data = json.loads(match.group(0))
            data["image"] = encoded_image
            return data
        except:
            pass

    # Fallback kalau format masih terlalu bebas
    return {
        "name": None,
        "description": None,
        "price": None,
        "raw": response_text,
        "image": encoded_image
    }

def extractor_func(image_bytes):
    # Encode gambar ke base64
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    # Kirim ke model via SDK Groq
    response = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",  # sesuaikan jika perlu
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": INSTRUCTION},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        },
                    },
                ],
            }
        ]
    )

    raw_output = response.choices[0].message.content

    # Berusaha parse JSON
    try:
        parsed = safe_parse_response(raw_output, encoded_image)
    except Exception:
        parsed = {
            "name": None,
            "description": None,
            "price": None,
            "raw": raw_output,
            "image": encoded_image
        }

    return parsed


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = extractor_func(contents)

        # Forward hasil ke endpoint lain
        async with httpx.AsyncClient() as client_http:
            response = await client_http.post(
                "http://localhost:5678/webhook-test/upload-product",
                json=result
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to forward data: {response.text}"
            )

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
