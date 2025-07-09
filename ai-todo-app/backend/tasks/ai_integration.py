import os
import spacy
from datetime import datetime, timedelta, date
import re
import asyncio
import io # NEW: For handling in-memory audio files

# NEW: Imports for Whisper STT
from transformers import pipeline
import torch
import torchaudio
import soundfile as sf # Used for reading audio files if torchaudio has issues with specific formats

# --- Initialize Whisper Pipeline (Load model once at startup) ---
# This will download the model the first time it runs.
# Choose a model size: "tiny", "base", "small", "medium", "large"
# "tiny" or "base" are good for CPU. "small" or "medium" might be slow on CPU.
# Requires significant RAM (e.g., "small" is ~1GB, "medium" is ~3GB)
print("Loading Whisper ASR pipeline (this may take a moment)...")
whisper_pipeline = None # Initialize as None
try:
    # device=0 for GPU, device=-1 for CPU
    # Use a smaller model like "base" or "small" for CPU-only or limited RAM
    whisper_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-base", device=-1)
    print("Whisper ASR pipeline loaded successfully.")
except Exception as e:
    print(f"Error loading Whisper pipeline: {e}. Speech-to-Text will not work.")


# Load spaCy model for NLP
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, try to download (this should ideally be done during setup)
    print("SpaCy model 'en_core_web_sm' not found. Attempting to download...")
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


# --- Speech-to-Text Transcription (Self-Hosted Whisper) ---
async def transcribe_audio(audio_file_content: bytes, audio_mime_type: str) -> str:
    """
    Transcribes audio content using a self-hosted Whisper model.
    Expects audio_file_content as bytes (raw audio data).
    """
    if not whisper_pipeline:
        raise Exception("Whisper ASR pipeline not loaded. Cannot transcribe audio.")

    try:
        # Create a BytesIO object from the audio content
        audio_buffer = io.BytesIO(audio_file_content)
        
        # torchaudio.load can read from file-like objects
        # It returns (waveform, sample_rate)
        waveform, sample_rate = torchaudio.load(audio_buffer)

        # If sample rate is not 16000 (Whisper's default), resample
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)
        
        # The pipeline expects a single channel (mono)
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True) # Convert stereo to mono

        # Convert to numpy array for the pipeline
        audio_array = waveform.squeeze().numpy()

        # Perform transcription
        transcription_result = whisper_pipeline(audio_array)
        transcribed_text = transcription_result['text']
        
        print(f"Whisper Transcribed: '{transcribed_text}'")
        return transcribed_text

    except Exception as e:
        print(f"Error during Whisper transcription: {e}")
        raise Exception(f"Whisper STT failed: {e}")


# --- AI Prioritization (Local SpaCy) ---
async def prioritize_task_with_ai(task_text: str) -> dict:
    """
    Analyzes task text to determine priority and due date using local NLP (spaCy).
    """
    print(f"Analyzing task '{task_text}' for prioritization using spaCy...")

    priority = "None" # Default priority
    due_date = None    # Default no due date

    doc = nlp(task_text.lower()) # Process text with spaCy

    # --- Priority Logic (Rule-based using keywords) ---
    if any(token.text in ["urgent", "asap", "immediately", "now", "critical"] for token in doc):
        priority = "High"
    elif any(token.text in ["soon", "important", "deadline"] for token in doc):
        priority = "Medium"
    elif any(token.text in ["whenever", "later", "someday", "low priority"] for token in doc):
        priority = "Low"
    if priority == "None" and len(doc.text.split()) > 3: # If it's a reasonable length, give medium
        priority = "Medium"


    # --- Due Date Logic (Rule-based using keywords and spaCy entities) ---
    today = date.today() # Use date.today() for consistency with date field
    
    def next_weekday(d: date, weekday: int) -> date: # Monday = 0, Sunday = 6
        days_ahead = (weekday - d.weekday() + 7) % 7
        return d + timedelta(days=days_ahead)

    # Explicit keywords
    if "today" in doc.text or "end of day" in doc.text:
        due_date = today
    elif "tomorrow" in doc.text:
        due_date = today + timedelta(days=1)
    elif "next week" in doc.text:
        due_date = today + timedelta(weeks=1)
    elif "in" in doc.text and "days" in doc.text:
        match = re.search(r"in (\d+) days", doc.text)
        if match:
            num_days = int(match.group(1))
            due_date = today + timedelta(days=num_days)
    elif "next monday" in doc.text:
        due_date = next_weekday(today, 0) # 0 for Monday
        if due_date == today: # If today is Monday, get next Monday
            due_date += timedelta(weeks=1)
    elif "next tuesday" in doc.text:
        due_date = next_weekday(today, 1) # 1 for Tuesday
        if due_date == today: # If today is Tuesday, get next Tuesday
            due_date += timedelta(weeks=1)
    # Add more specific day handling if needed (e.g., "next Wednesday", "Friday")

    # Try to extract date entities using spaCy for more specific dates
    for ent in doc.ents:
        if ent.label_ == "DATE":
            text_ent = ent.text.lower()
            # Simple check if current due_date is not already more specific
            if not due_date: # Only set if not already set by more specific keywords
                if "next" in text_ent and "day" in text_ent:
                    due_date = today + timedelta(days=1)
                elif "today" in text_ent:
                    due_date = today
                elif "tomorrow" in text_ent:
                    due_date = today + timedelta(days=1)
                # Add more specific parsing here if needed (e.g., "July 4th")

    # Ensure due_date is in date object format if it became datetime from parsing
    if isinstance(due_date, datetime):
        due_date = due_date.date()

    return {"priority": priority, "dueDate": due_date}