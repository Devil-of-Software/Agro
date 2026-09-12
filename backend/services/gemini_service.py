import os
from google import genai

SYSTEM_PROMPT = """
You are AgriAssist AI, a careful and practical agriculture assistant.
Help farmers with crops, soil, irrigation, fertilizer, pests, plant diseases,
weather-related farming decisions, sowing, harvesting and general farm practices.

Rules:
- Answer in the user's requested language.
- Understand regional languages and mixed-language questions.
- Use simple, practical explanations.
- If important information is missing, ask a short follow-up question.
- Never claim an uncertain plant disease diagnosis is definitely correct.
- For disease symptoms, give possible causes, prevention and general management.
- Do not invent current weather or live market data.
- For location-specific recommendations, use the supplied location only as context.
- Explain that local agricultural officers/experts should be consulted for
  serious crop loss, pesticide decisions or uncertain diagnosis.
"""

def ask_gemini(message: str, language: str, location: str = "") -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured in .env")

    client = genai.Client(api_key=api_key)
    prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Preferred language: {language}\n"
        f"Location: {location or 'Not provided'}\n\n"
        f"Farmer question:\n{message}"
    )
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
    )
    text = getattr(response, "text", None)
    if not text:
        raise RuntimeError("Gemini returned an empty response.")
    return text.strip()
