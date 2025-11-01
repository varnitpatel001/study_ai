import React from "react";

export default function ScoreBoard({ score, total }) {
  const percent = Math.round((score / total) * 100);
  return (
    <div style={styles.card}>
      <h2>🎉 Quiz Complete!</h2>
      <p>
        You scored <b>{score}</b> / {total} ({percent}%)
      </p>
      <button style={styles.retry} onClick={() => window.location.reload()}>
        🔁 Retry
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: 16,
    padding: 25,
    width: "90%",
    maxWidth: 600,
    margin: "40px auto",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  retry: {
    background: "#20232a",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 10,
    marginTop: 15,
    cursor: "pointer",
  },
};
