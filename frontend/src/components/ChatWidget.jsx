import React, { useEffect, useRef, useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const scrollRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const userId = userInfo?._id || null;

  /* Load history on open */
  useEffect(() => {
    if (open && userId) {
      fetch(`http://localhost:5000/api/chat/history/${userId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.history) {
            setMessages(d.history.map((h) => ({ sender: h.sender, text: h.text })));
          }
        });
    }
  }, [open]);

  /* Auto scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, options, loading]);

  /* Send message */
  const sendMessage = async (customText = null) => {
    const text = customText || input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setOptions([]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId }),
      });

      const data = await res.json();

      const botText = data.reply || "No reply.";
      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);

      if (data.options) {
        setOptions(data.options); // options inside chat list
      }
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* Glass Themes */
  const glass = darkMode
    ? "backdrop-blur-xl bg-white/10 border border-white/20 text-white"
    : "backdrop-blur-xl bg-white/40 border border-white/50 text-gray-900";

  return (
    <>
      {/* OPEN BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-500 text-white px-6 py-3 rounded-full shadow-xl z-[9999] hover:bg-orange-600 transition"
        >
          💬 Chat
        </button>
      )}

      {/* CHATBOX */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 w-80 sm:w-96 max-h-[70vh] rounded-3xl shadow-2xl flex flex-col p-3 z-[9999] ${glass}`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-lg">Your Assistant</div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-2 py-1 bg-orange-500 text-white rounded-lg"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button className="text-xl" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* CHAT (messages + options together) */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">

            {/* Messages */}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl shadow max-w-[80%] ${
                    m.sender === "user"
                      ? "bg-orange-500 text-white"
                      : darkMode
                      ? "bg-white/20 text-white border border-white/10"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Bot typing */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 bg-gray-200 rounded-xl">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce delay-100" />
                    <span className="h-2 w-2 rounded-full bg-gray-500 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            {/* OPTIONS (inside same scroll) */}
            {options.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(opt.value)}
                    className="px-3 py-2 text-xs rounded-full bg-orange-100 text-orange-800 hover:bg-orange-200 transition shadow"
                  >
                    🔸 {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INPUT SECTION */}
          <div className="mt-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnter}
              placeholder="Type here..."
              className={`w-full resize-none px-3 py-2 rounded-xl border text-sm ${
                darkMode
                  ? "bg-white/20 text-white border-white/20"
                  : "bg-white border-orange-300"
              }`}
            />

            <div className="flex justify-between mt-2">
              <span className="text-xs opacity-70">
                You are {userInfo?.name || "Guest"}
              </span>

              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition shadow"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
