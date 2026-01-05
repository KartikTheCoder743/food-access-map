import React, { useState } from 'react';

export default function ChatAssistant({ markers }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! 👋 I can help you find food resources. Try asking: 'Where’s the nearest food pantry?'" }
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);

    // Simple rule-based responses
    let response = "Sorry, I don’t understand that yet.";
    if (input.toLowerCase().includes("food pantry")) {
      response = "Here are some food pantries:\n" +
        markers.filter(m => m.category === "Food Pantry").map(m => `- ${m.name}`).join("\n");
    } else if (input.toLowerCase().includes("shelter")) {
      response = "Here are some shelters:\n" +
        markers.filter(m => m.category === "Homeless Shelter").map(m => `- ${m.name}`).join("\n");
    } else if (input.toLowerCase().includes("open")) {
      response = "Currently open:\n" +
        markers.filter(m => m.status === "Open").map(m => `- ${m.name}`).join("\n");
    }

    setMessages(prev => [...prev, { sender: "bot", text: response }]);
    setInput("");
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20 }}>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ padding: "10px", borderRadius: "50%", background: "#007bff", color: "#fff" }}>
          💬
        </button>
      )}
      {open && (
        <div style={{
          width: 300, height: 400, background: "#fff", border: "1px solid #ccc",
          borderRadius: "8px", display: "flex", flexDirection: "column"
        }}>
          <div style={{ flex: 1, padding: 10, overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "5px 0" }}>
                <b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", padding: 5 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: 5 }}
              placeholder="Ask me something..."
            />
            <button onClick={handleSend} style={{ marginLeft: 5 }}>Send</button>
          </div>
          <button onClick={() => setOpen(false)} style={{ padding: "5px", background: "red", color: "white" }}>Close</button>
        </div>
      )}
    </div>
  );
}
