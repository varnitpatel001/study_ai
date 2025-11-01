import React from "react";

export default function CodeBlock({ code }) {
  return (
    <pre className="codebox">
      <code>{code}</code>
    </pre>
  );
}
