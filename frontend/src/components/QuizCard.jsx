import React, { useState } from "react";

export default function QuizCard({ data, current, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  if (!data) return <div style={styles.loading}>Loading question...</div>;

  const submit = () => {
    if (selected) {
      setAnswered(true);
      setTimeout(() => {
        onAnswer(selected === data.correct);
        setSelected(null);
        setAnswered(false);
      }, 1200);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <span style={styles.counter}>Q {current}/{total}</span>
        <span style={{ ...styles.tag, ...styles[data.difficulty] }}>
          {data.difficulty}
        </span>
      </div>

      <h2 style={styles.question}>{data.text}</h2>

      {data.code && (
        <pre style={styles.codeBlock}>
          <code>{data.code}</code>
        </pre>
      )}

      <div>
        {data.options.map((opt, i) => (
          <button
            key={i}
            style={{
              ...styles.option,
              ...(selected === opt ? styles.optionActive : {}),
            }}
            onClick={() => !answered && setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button style={styles.submit} onClick={submit} disabled={!selected}>
        Submit
      </button>

      {answered && (
        <div style={styles.explanationBox}>
          <b>Explanation:</b>
          <p>{data.explanation}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: 16,
    padding: 25,
    margin: "20px auto",
    width: "90%",
    maxWidth: 700,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  counter: {
    color: "#555",
    fontSize: "0.9rem",
  },
  tag: {
    padding: "4px 10px",
    borderRadius: 8,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  easy: { background: "#d3f9d8", color: "#1b5e20" },
  moderate: { background: "#fff3cd", color: "#856404" },
  difficult: { background: "#f8d7da", color: "#721c24" },
  question: {
    fontSize: "1.25rem",
    color: "#111",
    marginBottom: 15,
  },
  codeBlock: {
    background: "#1a1a1a",
    color: "#00ffb3",
    padding: "10px 15px",
    borderRadius: 10,
    fontFamily: "monospace",
    marginBottom: 15,
    overflowX: "auto",
  },
  option: {
    display: "block",
    width: "100%",
    background: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    textAlign: "left",
    transition: "0.2s all ease",
  },
  optionActive: {
    background: "#cde2ff",
    borderColor: "#1a73e8",
  },
  submit: {
    width: "100%",
    padding: "10px",
    marginTop: "15px",
    border: "none",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "#1a73e8",
    color: "white",
  },
  explanationBox: {
    background: "#f3f7ff",
    borderLeft: "4px solid #1a73e8",
    borderRadius: 10,
    marginTop: 15,
    padding: 10,
  },
  loading: {
    textAlign: "center",
    padding: "20px",
    color: "#666",
  },
};
