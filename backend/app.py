from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import os
import requests
import json
import re
import io
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer


load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in environment (.env or env variables)")


app = FastAPI(title="Study.AI Backend (Groq LLaMA 3.3 70B)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{path:path}")
async def options_handler(path: str, request: Request):
    """Handle OPTIONS preflight requests for CORS"""
    return JSONResponse(status_code=200, content={"message": "OK"})


GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.3-70b-versatile"


class TopicRequest(BaseModel):
    topic: str

class PromptRequest(BaseModel):
    prompt: str

class SessionRequest(BaseModel):
    session: dict


def call_groq(prompt: str, system_msg: str = "You are a helpful AI assistant.", max_tokens: int = 2000, temperature: float = 0.0) -> str:
    """
    Calls Groq API synchronously and returns the assistant text (string).
    Raises HTTPException on non-200.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=120)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Network error calling Groq: {e}")

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=f"Groq API error: {resp.text}")

    data = resp.json()
    
    try:
        content = data["choices"][0]["message"]["content"]
    except Exception:
        content = json.dumps(data)
    return content.strip()

def extract_json_array(text: str):
    """
    Try multiple strategies to extract a JSON array from text.
    Returns Python object (list) or None.
    """
    if not text or not isinstance(text, str):
        return None

  
    text_clean = text.strip()
    text_clean = re.sub(r"^```(?:json)?\s*", "", text_clean)
    text_clean = re.sub(r"\s*```$", "", text_clean).strip()


    try:
        parsed = json.loads(text_clean)
        if isinstance(parsed, list):
            return parsed
        
        if isinstance(parsed, dict):
            for v in parsed.values():
                if isinstance(v, list):
                    return v
    except json.JSONDecodeError:
        pass

    arr_match = re.search(r"\[.*\]", text_clean, re.DOTALL)
    if arr_match:
        try:
            arr_text = arr_match.group(0)
            parsed = json.loads(arr_text)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            possible = re.sub(r",\s*]", "]", arr_match.group(0))
            possible = re.sub(r",\s*}", "}", possible)
            try:
                parsed = json.loads(possible)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass

    lines = [ln.strip("-• \t\r\n ") for ln in text_clean.splitlines() if ln.strip()]
    if len(lines) >= 3:
        return lines

    return None

def ensure_quiz_structure(raw_list, expected_count=15):
    """
    Ensure quiz is a list of dicts of the expected shape.
    If raw_list elements are strings (lines), try to convert heuristically.
    Return a list of dicts with keys: question, options (list), answer, explanation
    If impossible, return a generated fallback list.
    """
    quiz = []

    if isinstance(raw_list, list) and raw_list and isinstance(raw_list[0], dict):
        for item in raw_list:
            q = {
                "question": item.get("question") or item.get("q") or item.get("prompt") or "No question text",
                "options": item.get("options") if isinstance(item.get("options"), list) else item.get("choices") if isinstance(item.get("choices"), list) else item.get("opts") if isinstance(item.get("opts"), list) else [],
                "answer": item.get("answer") or item.get("correct") or "",
                "explanation": item.get("explanation") or item.get("explain") or ""
            }
          
            if not q["options"]:
                opts = []
                for k in ["A","B","C","D","a","b","c","d"]:
                    if k in item and isinstance(item[k], str):
                        opts.append(item[k])
                q["options"] = opts or ["A","B","C","D"]
            quiz.append(q)
    else:
        temp = []
        for element in raw_list:
            if isinstance(element, dict):
                temp.append(element)
            elif isinstance(element, str):
                temp.append(element.strip())
        
        joined = "\n".join([t if isinstance(t,str) else json.dumps(t) for t in temp])
       
        parts = re.split(r"\n\s*\d+\.\s+|\n\s*Q\d+\s*[:.-]\s*", joined)
        if len(parts) > 1:
            parts = [p.strip() for p in parts if p.strip()]
            for p in parts:
                opts = re.findall(r"(?:A[\).:-]|\bA\))\s*([^\n\r]+)", p)
                if len(opts) < 4:
                    opts = re.findall(r"^[\s>*-]*([ABCD])[\).:-]\s*(.+)$", p, re.MULTILINE)
                    opts = [m[1].strip() for m in opts]
                
                qtext = re.split(r"(?:\n|$)A[\).:-]", p, maxsplit=1)[0].strip()
                if not qtext and p:
                    qtext = p.strip().split("\n")[0]
                
                ans_match = re.search(r"Answer\s*[:\-]\s*([A-D])", p, re.IGNORECASE)
                ans = ""
                if ans_match:
                    letter = ans_match.group(1).upper()
                    if opts and len(opts) >= ord(letter) - 64:
                        ans = opts[ord(letter) - 65] if isinstance(opts, list) else letter
                
                expl = ""
                expl_match = re.search(r"Explanation\s*[:\-]\s*(.+)$", p, re.IGNORECASE | re.DOTALL)
                if expl_match:
                    expl = expl_match.group(1).strip()
                quiz.append({
                    "question": qtext or "Question",
                    "options": opts if isinstance(opts, list) and opts else ["Option A", "Option B", "Option C", "Option D"],
                    "answer": ans or "",
                    "explanation": expl or ""
                })
       
    if len(quiz) < expected_count:
        for i in range(len(quiz), expected_count):
            quiz.append({
                "question": f"Placeholder question {i+1}: (Could not parse model output)",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option A",
                "explanation": "Placeholder explanation. Model output was not parseable for this item."
            })
  
    return quiz[:expected_count]
@app.get("/")
def root():
    return {"message": "Study.AI backend up, endpoints: /get_subtopics, /generate_explanation, /generate_quiz, /export_session_pdf"}

@app.post("/get_subtopics")
def get_subtopics(req: TopicRequest):
    """
    Request body: { "topic": "Machine Learning" }
    Response: { "subtopics": [ "Linear Algebra", "Probability", ... ] }
    """
    prompt = (
        f"List 10 concise and important subtopics for the topic: '{req.topic}'. "
        "Respond only as a JSON array of strings, for example: [\"A\",\"B\",...]."
    )
    system_msg = "You are an academic assistant. Output strictly valid in JSON array only."
    result = call_groq(prompt, system_msg=system_msg, max_tokens=200, temperature=0.0)
    arr = extract_json_array(result)
   
    if isinstance(arr, list):
        subtopics = []
        for item in arr:
            if isinstance(item, str):
                subtopics.append(item.strip())
            elif isinstance(item, dict):
                for key in ["title", "name", "subtopic"]:
                    if key in item and isinstance(item[key], str):
                        subtopics.append(item[key].strip())
                        break
        
        seen = []
        for s in subtopics:
            if s and s not in seen:
                seen.append(s)
        return {"subtopics": seen[:12]}
    else:
        lines = [ln.strip() for ln in result.splitlines() if ln.strip()]
        return {"subtopics": lines[:12]}

@app.post("/generate_explanation")
def generate_explanation(req: PromptRequest):
    """
    Request body: { "prompt": "topic - subtopic" }
    Response: { "explanation": "large text ~150+ words" }
    """
    prompt = (
        f"Provide a thorough, student-friendly explanation of: {req.prompt}\n\n"
        "Requirements:\n"
        "- Aim for ~100 to ~150 words (concise ).\n"
        "- Use short paragraphs and subheadings where useful don not use ** in it.\n"
        "- Avoid heavy jargon; if you use a technical term, briefly define it.\n\n"
        "Return only the explanation text (no JSON wrapper required)."
    )
    system_msg = "You are a patient teaching assistant that writes long helpful explanations."
    explanation = call_groq(prompt, system_msg=system_msg, max_tokens=700, temperature=0.0)
  
    explanation = re.sub(r"^```(?:\w*)\s*|```$", "", explanation).strip()
    return {"explanation": explanation}

@app.post("/generate_quiz")
def generate_quiz(req: PromptRequest):
    """
    Request body: { "prompt": "<seed prompt that includes topic, difficulty info>" }
    Response: { "quiz": [ { question, options[], answer, explanation }, ... ] }
    """
    prompt = (
        f"{req.prompt}\n\nNow: Create 15 multiple-choice questions (MCQs) about the topic above.\n"
        "Each question must be an object with keys: \"question\" (string), \"options\" (array of 4 strings), "
        "\"answer\" (the correct option string exactly matching one of the options), and "
        "\"explanation\" (1-2 sentences explaining the correct answer).\n\n"
        "Return strictly in ONLY a valid JSON array of 15 objects (no extra text, no markdown). Example:\n"
        "[{\"question\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":\"A\",\"explanation\":\"...\"}, ...]"
    )
    system_msg = "You are an expert quiz generator. Output strictly valid JSON array of objects."
    result = call_groq(prompt, system_msg=system_msg, max_tokens=2000, temperature=0.1)

    parsed = extract_json_array(result)
    if parsed is None:
        return JSONResponse(status_code=200, content={
            "quiz": [],
            "error": "Could not parse JSON from model output.",
            "raw": result
        })

    quiz = ensure_quiz_structure(parsed, expected_count=15)
    return {"quiz": quiz}

@app.post("/export_session_pdf")
def export_session_pdf(req: SessionRequest):
    """
    Accepts { session: { topic, subtopic, difficulty, explanation, quiz, answers, scoreRaw, scoreWeighted, generatedAt } }
    Returns: application/pdf blob (StreamingResponse)
    """
    session = req.session if isinstance(req.session, dict) else {}
    topic = session.get("topic", "Unknown Topic")
    subtopic = session.get("subtopic", "")
    difficulty = session.get("difficulty", "")
    explanation = session.get("explanation", "")
    quiz = session.get("quiz", [])
    answers = session.get("answers", {})
    scoreRaw = session.get("scoreRaw", 0)
    scoreWeighted = session.get("scoreWeighted", 0)
    generatedAt = session.get("generatedAt", "")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"Study.AI Session Report by varnit", styles["Title"]))
    story.append(Spacer(1, 8))
    meta = f"Topic: {topic}  |  Subtopic: {subtopic}  |  Difficulty: {difficulty}  |  Generated: {generatedAt}"
    story.append(Paragraph(meta, styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Explanation", styles["Heading2"]))
    story.append(Spacer(1, 6))
   
    for para in explanation.split("\n\n"):
        para = para.strip()
        if para:
            story.append(Paragraph(para, styles["BodyText"]))
            story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Quiz (Total questions: {len(quiz)})", styles["Heading2"]))
    story.append(Spacer(1, 6))

    for i, q in enumerate(quiz):
        question_text = q.get("question", f"Question {i+1}")
        options = q.get("options", [])
        correct = q.get("answer", "")
        expl = q.get("explanation", "")
        story.append(Paragraph(f"{i+1}. {question_text}", styles["BodyText"]))
        for j, opt in enumerate(options):
            label = chr(65 + j)
            story.append(Paragraph(f"   {label}. {opt}", styles["Normal"]))
       
        user_ans = answers.get(str(i)) or answers.get(i) or ""
        story.append(Paragraph(f"   Correct Answer: {correct}", styles["Italic"]))
        story.append(Paragraph(f"   Explanation: {expl}", styles["Normal"]))
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Score (raw): {scoreRaw}  |  Weighted: {scoreWeighted}", styles["Heading3"]))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=StudyAI_Session_{topic.replace(' ','_')}.pdf"
    })
