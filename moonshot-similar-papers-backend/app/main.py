import os
import base64
from pathlib import Path
import json

from fastapi import FastAPI, APIRouter, File, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "http://localhost",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def health_check():
    return {"Hello": "working"}


@app.get("/papers")
def list_papers():
    return [pdf_file.name for pdf_file in Path("static").glob("*.pdf")]
