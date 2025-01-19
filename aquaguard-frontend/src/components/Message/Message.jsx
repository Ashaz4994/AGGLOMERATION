import React, { useState } from "react";

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState(["You are an expert in water management, conservation, and system maintenance, with advanced knowledge of strategies to minimize water wastage, detect and address leaks, and optimize system efficiency. Your role is to provide actionable, data-driven, and sustainable recommendations. Consider the following principles: Water Conservation: Suggest methods to reduce water consumption in residential, commercial, and industrial systems, including behavioral changes, efficient technologies, and reuse systems like graywater recycling. Leak Detection: Propose advanced techniques for identifying leaks, including sensor-based monitoring, pressure variation analysis, and real-time diagnostics. Explain how to integrate such systems effectively. System Maintenance: Recommend preventive and corrective maintenance strategies for water infrastructure to ensure long-term efficiency and reliability. Address the importance of monitoring key metrics like flow rates, pressure levels, and system age. Sustainability: Ensure all solutions align with sustainability goals, reducing the environmental impact while being cost-effective. When providing recommendations or solutions, explain them clearly with examples, tools, or technologies that can be applied. Ensure the solutions are scalable and adaptable for different environments or industries."]);
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = "AIzaSyBe2qSIiDlaFgJ2Zj40w1xY-nzr7LNI6xE";
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
    
  // Function to generate bot response
  const generateResponse = async (prompt) => {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const cleanMarkdown = (text) => {
    return text
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // Handle user message submission
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setChatHistory((prev) => [...prev, { text: userMessage, isUser: true }]);
    setUserInput("");
    setIsLoading(true);

    const prompt = chatHistory
      .map((entry) => `${entry.isUser ? "User:" : "Bot:"} ${entry.text}`)
      .join("\n");

    try {
      const botResponse = await generateResponse(`${prompt}\nUser: ${userMessage}`);
      const cleanedResponse = cleanMarkdown(botResponse);

      setChatHistory((prev) => [
        ...prev,
        { text: cleanedResponse, isUser: false },
      ]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { text: "Sorry, I encountered an error. Please try again.", isUser: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-gray-200 absolute right-48 bottom-20 rounded-lg">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gray-700 text-white text-center py-4">
          <h1 className="text-xl font-bold">Gemini Chatbot</h1>
        </div>

        {/* Chat Messages */}
        <div
          className="flex flex-col gap-4 p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          id="chat-messages"
        >
          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`flex ${
                entry.isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!entry.isUser && (
                <div
                className="w-8 h-8 rounded-full mr-2 bg-cover bg-center"
                style={{ backgroundImage: `url('../../../public/bot.jpg')` }}
                aria-label="Bot"
              ></div>              
              )}
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  entry.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {entry.text}
              </div>
              {entry.isUser && (
                <img
                  className="w-8 h-8 rounded-full ml-2"
                  src=".../../../public/user.jpg"
                  alt="User"
                />
              )}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex items-center p-4 bg-gray-700">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-grow px-4 py-2 text-gray-200 bg-gray-800 border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className={`ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600 transition"
            }`}
          >
            {isLoading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
