import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

/**
 * App.jsx
 * - Difficulty (Easy/Medium/Hard) affects prompt and scoring weight
 * - Primary explanation requested to be long (>= ~300 words)
 * - Quiz set to 15 questions and each question should include an "explanation" field
 * - After submitting quiz, per-question explanations are revealed
 * - Scoreboard shows raw correct and weighted points
 * - "Export PDF" posts full session to /export_session_pdf and downloads the returned PDF blob
 */

export default function App() {
  const [topic, setTopic] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [subtopic, setSubtopic] = useState("None");
  const [difficulty, setDifficulty] = useState("Medium");
  const [explanation, setExplanation] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [scoreRaw, setScoreRaw] = useState(0);
  const [scoreWeighted, setScoreWeighted] = useState(0);
  const [loading, setLoading] = useState(false);

  const QUESTION_COUNT = 15;
  const DIFFICULTY_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 };

  // fetch subtopics from backend
  const fetchSubtopics = async () => {
    if (!topic.trim()) return alert("Please enter a topic");
    try {
      const res = await fetch("https://study-ai-0akh.onrender.com/get_subtopics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      const options = ["None", "Randomize", ...(data.subtopics || [])];
      setSubtopics(options.slice(0, 8));
      setSubtopic("None");
    } catch (e) {
      console.error(e);
      alert("Could not fetch subtopics from backend.");
    }
  };

  // Generate longer explanation + 15-question quiz with per-answer explanations
  const generate = async () => {
    if (!topic.trim()) return alert("Enter a topic first");
    setLoading(true);
    setExplanation("");
    setQuiz([]);
    setAnswers({});
    setRevealed(false);
    setScoreRaw(0);
    setScoreWeighted(0);

    let chosenSub = subtopic;
    if (subtopic === "Randomize" && subtopics.length > 2) {
      const picks = subtopics.slice(2);
      chosenSub = picks[Math.floor(Math.random() * picks.length)];
    }
    const seedPrompt = chosenSub && chosenSub !== "None" ? `${topic} - ${chosenSub}` : topic;

    try {
      const explanationPrompt = `Explain "${seedPrompt}" thoroughly. Provide a clear, structured explanation with examples, intuition, and practical notes. Make the explanation detailed (aim for 300+ words). Use simple language and subheadings where appropriate.`;

      const quizPrompt = `Create ${QUESTION_COUNT} multiple-choice questions about "${seedPrompt}". 
Each question must include:
- "question": the question text
- "options": a list of 4 answer choices (A–D)
- "answer": the correct answer text (exactly one from options)
- "explanation": a short explanation (1–3 sentences) for why the answer is correct.
Return ONLY valid JSON as:
[
  {"question":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."},
  ...
]
Make questions suitable for ${difficulty} difficulty.`;

      const [expRes, quizRes] = await Promise.all([import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [topic, setTopic] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [subtopic, setSubtopic] = useState("None");
  const [difficulty, setDifficulty] = useState("Medium");
  const [explanation, setExplanation] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [scoreRaw, setScoreRaw] = useState(0);
  const [scoreWeighted, setScoreWeighted] = useState(0);
  const [loading, setLoading] = useState(false);

  const QUESTION_COUNT = 15;
  const DIFFICULTY_WEIGHT = { Easy: 1, Medium: 2, Hard: 3 };

  const fetchSubtopics = async () => {
    if (!topic.trim()) return alert("Please enter a topic");
    try {
      const res = await fetch("https://study-ai-0akh.onrender.com/get_subtopics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      const options = ["None", "Randomize", ...(data.subtopics || [])];
      setSubtopics(options.slice(0, 8));
      setSubtopic("None");
    } catch (e) {
      console.error(e);
      alert("Could not fetch subtopics from backend.");
    }
  };

  const generate = async () => {
    if (!topic.trim()) return alert("Enter a topic first");
    setLoading(true);
    setExplanation("");
    setQuiz([]);
    setAnswers({});
    setRevealed(false);
    setScoreRaw(0);
    setScoreWeighted(0);

    let chosenSub = subtopic;
    if (subtopic === "Randomize" && subtopics.length > 2) {
      const picks = subtopics.slice(2);
      chosenSub = picks[Math.floor(Math.random() * picks.length)];
    }
    const seedPrompt = chosenSub && chosenSub !== "None" ? `${topic} - ${chosenSub}` : topic;

    try {
      const explanationPrompt = `Explain "${seedPrompt}" thoroughly. Provide a clear, structured explanation with examples, intuition, and practical notes. Make the explanation detailed (aim for 300+ words). Use simple language and subheadings where appropriate.`;

      const quizPrompt = `Create ${QUESTION_COUNT} multiple-choice questions about "${seedPrompt}". 
Each question must include:
- "question": the question text
- "options": a list of 4 answer choices (A–D)
- "answer": the correct answer text (exactly one from options)
- "explanation": a short explanation (1–3 sentences) for why the answer is correct.
Return ONLY valid JSON as:
[
  {"question":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."},
  ...
]
Make questions suitable for ${difficulty} difficulty.`;

      const [expRes, quizRes] = await Promise.all([
        fetch("https://study-ai-0akh.onrender.com/generate_explanation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: explanationPrompt }),
        }),
        fetch("https://study-ai-0akh.onrender.com/generate_quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: quizPrompt }),
        }),
      ]);

      const expJson = await expRes.json();
      const quizJson = await quizRes.json();

      const explanationText = expJson.explanation || expJson || "";
      let quizArray = quizJson.quiz || quizJson || [];

      if (typeof quizArray === "string") {
        try {
          const start = quizArray.indexOf("[");
          const end = quizArray.lastIndexOf("]");
          if (start !== -1 && end !== -1) {
            quizArray = JSON.parse(quizArray.slice(start, end + 1));
          } else {
            quizArray = [];
          }
        } catch (err) {
          console.warn("Failed to parse quiz JSON:", err);
          quizArray = [];
        }
      }

      // normalize
      quizArray = quizArray.slice(0, QUESTION_COUNT).map((q, idx) => ({
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
        answer: q.answer || "",
        explanation: q.explanation || "No explanation provided.",
      }));

      setExplanation(explanationText);
      setQuiz(quizArray);
    } catch (e) {
      console.error(e);
      alert("Error generating content. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < quiz.length) {
      if (!window.confirm("You haven’t answered all questions. Submit anyway?")) return;
    }

    let correct = 0;
    let weightedPoints = 0;
    const weight = DIFFICULTY_WEIGHT[difficulty] || 1;

    quiz.forEach((q, i) => {
      const selected = answers[i];
      if (normalize(selected) === normalize(q.answer)) {
        correct++;
        weightedPoints += weight;
      }
    });

    setScoreRaw(correct);
    setScoreWeighted(weightedPoints);
    setRevealed(true);
  };

  const optionClass = (qIndex, opt) => {
    const selected = answers[qIndex];
    const q = quiz[qIndex];
    if (!q) return "list-group-item list-group-item-action modern-option";

    if (!revealed) {
      return selected === opt
        ? "list-group-item list-group-item-action modern-option active"
        : "list-group-item list-group-item-action modern-option";
    }

    if (opt === q.answer) {
      return "list-group-item list-group-item-success modern-option-correct";
    } else if (selected === opt && selected !== q.answer) {
      return "list-group-item list-group-item-danger modern-option-wrong";
    } else {
      return "list-group-item list-group-item-action modern-option";
    }
  };

  const exportPDF = async () => {
    if (!explanation && quiz.length === 0) return alert("No session data to export");
    const session = {
      topic,
      subtopic,
      difficulty,
      explanation,
      quiz,
      answers,
      scoreRaw,
      scoreWeighted,
      generatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("https://study-ai-0akh.onrender.com/export_session_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`PDF export failed: ${res.status} ${txt}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `StudyAI_${topic.replace(/\s+/g, "_")}_${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF. Make sure backend supports /export_session_pdf.");
    }
  };

  const normalize = (str) =>
    str?.toString().trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* modern global styles - only bootstrap + small custom CSS */}
      <style>{`
        :root{
          --brand: #4f46e5; /* indigo-600 */
          --muted: #6b7280;
          --glass: rgba(255,255,255,0.6);
        }
        body, .form-control, .btn{font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;}
        .modern-card{border:0; border-radius:16px; box-shadow: 0 6px 24px rgba(15,23,42,0.08);}
        .modern-option{border-radius:10px; margin-bottom:10px; transition: transform .12s ease, box-shadow .12s ease;}
        .modern-option:hover{transform: translateY(-3px); box-shadow: 0 6px 18px rgba(79,70,229,0.12);}
        .modern-option.active{background: linear-gradient(90deg, var(--brand), #06b6d4); color:#fff;}
        .modern-option-correct{background: linear-gradient(90deg, #10b981, #059669); color:#fff; border:none;}
        .modern-option-wrong{background: linear-gradient(90deg, #ef4444, #dc2626); color:#fff; border:none;}
        .topbar{backdrop-filter: blur(6px);}
        .big-cta{border-radius:12px; padding:12px 20px; font-weight:600}
        .chip{display:inline-block; padding:6px 10px; border-radius:999px; background:var(--glass); color:var(--muted); margin-right:6px}
        .explanation-text{white-space:pre-wrap; line-height:1.7}
        @media (max-width:767px){
          .desktop-only{display:none}
          .mobile-only{display:inline-block}
        }
        @media (min-width:768px){
          .mobile-only{display:none}
        }
      `}</style>

      <nav className="navbar topbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3 sticky-top modern-card">
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width:44, height:44}}>
              <span style={{fontSize:18}}>🧠</span>
            </div>
            <div>
              <div className="h5 mb-0 text-primary fw-bold">Study.AI</div>
              <small className="text-muted">Smart Study Assistant</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group me-2 desktop-only" role="group" aria-label="difficulty">
              {['Easy','Medium','Hard'].map((d)=> (
                <button key={d} className={`btn btn-sm ${difficulty===d? 'btn-outline-primary active':'btn-outline-secondary'}`} onClick={()=>setDifficulty(d)}>{d}</button>
              ))}
            </div>

            <button className="btn btn-outline-secondary btn-sm me-2" onClick={exportPDF} title="Export PDF">📄</button>

            {/* Mobile scoreboard toggle */}
            <button className="btn btn-primary btn-sm mobile-only" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScore" aria-controls="offcanvasScore">Score</button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4">
        <div className="card modern-card p-4 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-6 col-12">
              <div className="input-group input-group-lg shadow-sm">
                <input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="Enter main topic (e.g. PCA, Routing)" className="form-control border-0" />
                <button className="btn btn-primary big-cta" onClick={fetchSubtopics}>🔍 Search</button>
              </div>
              
            </div>

            <div className="col-md-3 col-8">
              {subtopics.length > 0 ? (
                <select className="form-select form-select-lg" value={subtopic} onChange={(e)=>setSubtopic(e.target.value)}>
                  {subtopics.map((s)=> <option key={s}>{s}</option>)}
                </select>
              ) : (
                <select className="form-select form-select-lg" disabled>
                  <option>Choose a subtopic</option>
                </select>
              )}
            </div>

            <div className="col-md-3 col-4 d-flex justify-content-end">
              <button className="btn btn-success big-cta" onClick={generate} style={{minWidth:150}} disabled={loading}>{loading? 'Generating…':'🎓 Generate (15 Qs)'}</button>
            </div>

            <div className="col-12 d-flex gap-2 mt-2">
              <div className="chip">Difficulty: <strong className="ms-1">{difficulty}</strong></div>
              <div className="chip">Weight: <strong className="ms-1">{DIFFICULTY_WEIGHT[difficulty]}pt</strong></div>
              <div className="chip desktop-only">Long explanation requested (≈300+ words)</div>
            </div>
          </div>
        </div>

        <div className="row gx-4">
          <div className="col-lg-8 col-12">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border" role="status"></div>
                <div className="mt-3 text-muted">Generating content…</div>
              </div>
            )}

            {explanation && (
              <div className="card modern-card mb-4 p-3">
                <div className="card-body">
                  <h5 className="fw-bold text-primary">📘 Explanation</h5>
                  <div className="mt-2 explanation-text">{explanation}</div>
                </div>
              </div>
            )}

            {quiz.length > 0 && (
              <div className="card modern-card p-3 mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-primary">🧩 Quiz ({quiz.length} questions)</h5>
                    <div className="small text-muted">Tap an option to answer — tap Submit when finished</div>
                  </div>

                  {quiz.map((q,i)=> (
                    <div key={i} className="mb-4">
                      <div className="fw-semibold fs-6 mb-2">{i+1}. {q.question}</div>
                      <div className="list-group">
                        {q.options.map((opt, idx)=> (
                          <button key={idx} type="button" className={optionClass(i,opt)} onClick={()=>handleSelect(i,opt)} disabled={revealed} style={{textAlign:'left', padding:'12px 16px'}}>
                            {opt}
                          </button>
                        ))}
                      </div>

                      {revealed && (
                        <div className="mt-2 small text-muted">Explanation:</div>
                      )}
                      {revealed && <div className="p-2 bg-light rounded mt-1">{q.explanation}</div>}
                    </div>
                  ))}

                  {!revealed ? (
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" onClick={submitQuiz}>🧮 Submit Quiz</button>
                      <button className="btn btn-outline-secondary" onClick={()=>{setAnswers({}); setRevealed(false); setScoreRaw(0); setScoreWeighted(0);}}>Reset Answers</button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="alert alert-info d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">Results</div>
                          <div>Correct (raw): <strong>{scoreRaw}/{quiz.length}</strong></div>
                          <div className="small text-muted">Difficulty weight per correct: {DIFFICULTY_WEIGHT[difficulty]}</div>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">Weighted score</div>
                          <div className="h4 text-success fw-bold">{scoreWeighted} pts</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="card modern-card p-3 position-sticky" style={{top:120}}>
              <div className="card-body text-center">
                <h6 className="text-primary fw-bold">📊 Scoreboard</h6>
                <hr />
                <div className="text-muted small">Topic</div>
                <div className="fw-semibold mb-3">{topic || '—'}</div>

                <div className="text-muted small">Subtopic</div>
                <div className="mb-3">{subtopic}</div>

                <div className="text-muted small">Difficulty</div>
                <div className="mb-3">{difficulty}</div>

                <div className="text-muted small">Raw correct</div>
                <div className="h3 text-success fw-bold">{scoreRaw}/{quiz.length}</div>

                <div className="text-muted small mt-3">Weighted score</div>
                <div className="h4 fw-semibold">{scoreWeighted} pts</div>

                <div className="mt-3 d-grid">
                  <button className="btn btn-outline-primary" onClick={()=>window.scrollTo({top:0, behavior:'smooth'})}>⬆️ Back to top</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* offcanvas for mobile scoreboard */}
      <div className="offcanvas offcanvas-bottom" tabIndex={-1} id="offcanvasScore" aria-labelledby="offcanvasScoreLabel">
        <div className="offcanvas-header">
          <h5 id="offcanvasScoreLabel">📊 Scoreboard</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body small">
          <div className="text-muted">Topic</div>
          <div className="fw-semibold mb-2">{topic || '—'}</div>
          <div className="text-muted">Subtopic</div>
          <div className="mb-2">{subtopic}</div>
          <div className="text-muted">Difficulty</div>
          <div className="mb-2">{difficulty}</div>
          <div className="text-muted">Raw correct</div>
          <div className="h4 text-success fw-bold">{scoreRaw}/{quiz.length}</div>
          <div className="text-muted mt-2">Weighted score</div>
          <div className="h5 fw-semibold">{scoreWeighted} pts</div>
        </div>
      </div>

      <footer className="bg-white text-center py-3 shadow-sm mt-auto">
        <small className="text-muted">Made with ❤️ by <strong>Varnit</strong></small>
      </footer>
    </div>
  );
}

        fetch("https://study-ai-0akh.onrender.com/generate_explanation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: explanationPrompt }),
        }),
        fetch("https://study-ai-0akh.onrender.com/generate_quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: quizPrompt }),
        }),
      ]);

      const expJson = await expRes.json();
      const quizJson = await quizRes.json();

      const explanationText = expJson.explanation || expJson || "";
      let quizArray = quizJson.quiz || quizJson || [];

      if (typeof quizArray === "string") {
        try {
          const start = quizArray.indexOf("[");
          const end = quizArray.lastIndexOf("]");
          if (start !== -1 && end !== -1) {
            quizArray = JSON.parse(quizArray.slice(start, end + 1));
          } else {
            quizArray = [];
          }
        } catch (err) {
          console.warn("Failed to parse quiz JSON:", err);
          quizArray = [];
        }
      }

      // normalize
      quizArray = quizArray.slice(0, QUESTION_COUNT).map((q, idx) => ({
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
        answer: q.answer || "",
        explanation: q.explanation || "No explanation provided.",
      }));

      setExplanation(explanationText);
      setQuiz(quizArray);
    } catch (e) {
      console.error(e);
      alert("Error generating content. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < quiz.length) {
      if (!window.confirm("You haven’t answered all questions. Submit anyway?")) return;
    }

    let correct = 0;
    let weightedPoints = 0;
    const weight = DIFFICULTY_WEIGHT[difficulty] || 1;

    quiz.forEach((q, i) => {
      const selected = answers[i];
      if (normalize(selected) === normalize(q.answer)) {
        correct++;
        weightedPoints += weight;
      }
    });

    setScoreRaw(correct);
    setScoreWeighted(weightedPoints);
    setRevealed(true);
  };

  const optionClass = (qIndex, opt) => {
    const selected = answers[qIndex];
    const q = quiz[qIndex];
    if (!q) return "list-group-item list-group-item-action";

    if (!revealed) {
      return selected === opt
        ? "list-group-item list-group-item-action active"
        : "list-group-item list-group-item-action";
    }

    if (opt === q.answer) {
      return "list-group-item list-group-item-success";
    } else if (selected === opt && selected !== q.answer) {
      return "list-group-item list-group-item-danger";
    } else {
      return "list-group-item list-group-item-action";
    }
  };

  const exportPDF = async () => {
    if (!explanation && quiz.length === 0) return alert("No session data to export");
    const session = {
      topic,
      subtopic,
      difficulty,
      explanation,
      quiz,
      answers,
      scoreRaw,
      scoreWeighted,
      generatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("https://study-ai-0akh.onrender.com/export_session_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`PDF export failed: ${res.status} ${txt}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `StudyAI_${topic.replace(/\s+/g, "_")}_${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF. Make sure backend supports /export_session_pdf.");
    }
  };
  const normalize = str =>
  str?.toString().trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Option coloring style */}
      <style>
        {`
          .list-group-item-success {
            background-color: #28a745 !important;
            color: white !important;
            border: none !important;
          }
          .list-group-item-danger {
            background-color: #dc3545 !important;
            color: white !important;
            border: none !important;
          }
          .list-group-item-action.active {
            background-color: #0d6efd !important;
            color: white !important;
            border: none !important;
          }
          .list-group-item-action:disabled {
            opacity: 1 !important;
            cursor: default !important;
          }
        `}
      </style>

      {/* NAVBAR */}
      <nav className="navbar navbar-light bg-white shadow-sm px-4 py-3 sticky-top">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div className="d-flex align-items-center">
            <h3 className="fw-bold text-primary mb-0">🧠 Study.AI</h3>
            <span className="ms-3 text-muted d-none d-md-inline">Smart Study Assistant</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group" role="group" aria-label="difficulty">
              {["Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  className={`btn btn-sm ${difficulty === d ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={exportPDF}>
              📄 Export PDF
            </button>
          </div>
        </div>
      </nav>

      {/* INPUT SECTION */}
      <div className="container-fluid px-5 py-4">
        <div className="card shadow-lg border-0 rounded-4 p-4 w-100">
          <div className="row g-3 align-items-center">
            <div className="col-xl-5 col-lg-5 col-md-7 col-12">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter main topic (e.g. PCA, Routing)"
                className="form-control form-control-lg"
              />
            </div>

            <div className="col-auto">
              <button className="btn btn-primary btn-lg" style={{ minWidth: 150 }} onClick={fetchSubtopics}>
                🔍 Search
              </button>
            </div>

            {subtopics.length > 0 && (
              <div className="col-xl-3 col-lg-3 col-md-4 col-12">
                <select
                  className="form-select form-select-lg"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  style={{ minWidth: 160 }}
                >
                  {subtopics.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-auto">
              <button className="btn btn-success btn-lg" style={{ minWidth: 170 }} onClick={generate}>
                🎓 Generate (15 Qs)
              </button>
            </div>
          </div>

          <div className="small text-muted mt-3">
            Difficulty: <strong>{difficulty}</strong> — weighting:{" "}
            <strong>{DIFFICULTY_WEIGHT[difficulty]}pt</strong> per correct
          </div>
          <div className="mt-2">
            <small className="text-muted">
              Primary explanation requested to be long (≈300+ words) and detailed.
            </small>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container-fluid flex-grow-1 px-5 pb-5">
        <div className="row gx-4">
          <div className="col-xl-8 col-lg-8 col-md-12">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Generating content...</p>
              </div>
            )}

            {explanation && (
              <div className="card shadow-sm mb-4" style={{ minHeight: 160 }}>
                <div className="card-body">
                  <h4 className="text-primary fw-bold">📘 Explanation</h4>
                  <p className="fs-5" style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {explanation}
                  </p>
                </div>
              </div>
            )}

            {quiz.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h4 className="text-primary fw-bold">🧩 Quiz ({quiz.length} questions)</h4>

                  {quiz.map((q, i) => (
                    <div key={i} className="mb-4">
                      <p className="fw-semibold fs-5">
                        {i + 1}. {q.question}
                      </p>
                      <div className="list-group">
                        {q.options.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={optionClass(i, opt)}
                            onClick={() => handleSelect(i, opt)}
                            disabled={revealed}
                            style={{
                              textAlign: "left",
                              padding: "14px 18px",
                              fontSize: "1rem",
                              borderRadius: "8px",
                              marginBottom: "8px",
                              width: "100%",
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {revealed && (
                        <div className="mt-2">
                          <div className="small text-muted">Explanation:</div>
                          <div className="p-2 bg-light rounded">{q.explanation}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {!revealed ? (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={submitQuiz}
                        style={{ minWidth: 180 }}
                      >
                        🧮 Submit Quiz
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => {
                          setAnswers({});
                          setRevealed(false);
                          setScoreRaw(0);
                          setScoreWeighted(0);
                        }}
                      >
                        Reset Answers
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="alert alert-info">
                        <div className="fw-bold">Results</div>
                        <div>
                          Correct (raw): <strong>{scoreRaw}/{quiz.length}</strong>
                        </div>
                        <div>
                          Weighted score: <strong>{scoreWeighted}</strong> points
                        </div>
                        <div className="small text-muted">
                          Difficulty weight per correct answer: {DIFFICULTY_WEIGHT[difficulty]}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SCOREBOARD */}
          <div className="col-xl-4 col-lg-4 col-md-12 d-flex justify-content-center align-items-start">
            <div
              className="card shadow-lg rounded-4"
              style={{
                position: "sticky",
                top: "120px",
                alignSelf: "flex-start",
                minWidth: "300px",
                maxWidth: "380px",
                width: "100%",
              }}
            >
              <div className="card-body text-center">
                <h5 className="text-primary fw-bold">📊 Scoreboard</h5>
                <hr />
                <div className="mb-2 text-muted">Topic</div>
                <div className="fw-semibold mb-3">{topic || "—"}</div>

                <div className="mb-2 text-muted">Subtopic</div>
                <div className="mb-3">{subtopic}</div>

                <div className="mb-2 text-muted">Difficulty</div>
                <div className="mb-3">{difficulty}</div>

                <div className="mb-2 text-muted">Raw correct</div>
                <div className="fs-3 fw-bold text-success">
                  {scoreRaw}/{quiz.length}
                </div>

                <div className="mt-3 mb-2 text-muted">Weighted score</div>
                <div className="fs-4 fw-semibold">{scoreWeighted} pts</div>

                <div className="mt-3">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    ⬆️ Back to top
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white text-center py-3 shadow-sm mt-auto">
        <small className="text-muted">
          Made with ❤️ by <strong>Varnit</strong>
        </small>
      </footer>
    </div>
  );
}
