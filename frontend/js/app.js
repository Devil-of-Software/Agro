let speechEnabled = true;

function addMessage(text, role) {
  const messages = document.getElementById("messages");
  const wrap = document.createElement("div");
  wrap.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);

  if (role === "ai") {
    const listen = document.createElement("button");
    listen.className = "listen";
    listen.textContent = "🔊 Listen";
    listen.onclick = () => speakText(text);
    wrap.appendChild(listen);
  }

  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("message");
  const message = input.value.trim();
  if (!message) return;

  const language = document.getElementById("language").value;
  const location = document.getElementById("farmLocation").value.trim();
  input.value = "";
  addMessage(message, "user");
  setStatus("Thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({message, language, location})
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Request failed.");
    addMessage(data.response, "ai");
    if (speechEnabled) speakText(data.response);
    setStatus("");
  } catch (error) {
    addMessage("Sorry, I couldn't answer right now. " + error.message, "ai");
    setStatus("");
  }
}

function askQuick(text) {
  document.getElementById("message").value = text;
  sendMessage();
}

function newChat() {
  document.getElementById("messages").innerHTML = "";
  addMessage("New chat started. 🌱 What would you like to know about farming?", "ai");
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

function toggleSpeech() {
  speechEnabled = !speechEnabled;
  document.getElementById("speechState").textContent = speechEnabled ? "ON" : "OFF";
  if (!speechEnabled && "speechSynthesis" in window) speechSynthesis.cancel();
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    setStatus("Text-to-speech is not supported by this browser.");
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageToSpeechCode(document.getElementById("language").value);
  speechSynthesis.speak(utterance);
}

function languageToSpeechCode(language) {
  const codes = {
    English: "en-IN", Tamil: "ta-IN", Hindi: "hi-IN",
    Telugu: "te-IN", Kannada: "kn-IN", Malayalam: "ml-IN",
    Bengali: "bn-IN", Marathi: "mr-IN", Gujarati: "gu-IN",
    Punjabi: "pa-IN", Urdu: "ur-IN"
  };
  return codes[language] || "en-IN";
}

function startVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    setStatus("Voice recognition is not supported in this browser. Try a supported Chromium browser.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = languageToSpeechCode(document.getElementById("language").value);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setStatus("Listening...");
  recognition.onresult = event => {
    const text = event.results[0][0].transcript;
    document.getElementById("message").value = text;
    setStatus("Voice captured.");
  };
  recognition.onerror = event => setStatus("Voice error: " + event.error);
  recognition.onend = () => {
    if (document.getElementById("status").textContent === "Listening...") setStatus("");
  };
  recognition.start();
}

async function loadWeather() {
  const city = document.getElementById("city").value.trim();
  const output = document.getElementById("weatherResult");
  if (!city) { output.textContent = "Enter a city."; return; }

  output.textContent = "Loading...";
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Weather request failed.");
    const w = data.data;
    output.textContent =
      `${w.city}\n` +
      `Temperature: ${w.temperature} °C\n` +
      `Humidity: ${w.humidity}%\n` +
      `Wind: ${w.wind_speed} m/s\n` +
      `Condition: ${w.condition}`;
  } catch (error) {
    output.textContent = error.message;
  }
}

async function recommend() {
  const output = document.getElementById("cropResult");
  output.textContent = "Generating recommendation...";
  const body = {
    soil_type: document.getElementById("soil").value,
    season: document.getElementById("season").value,
    water_availability: document.getElementById("water").value,
    location: document.getElementById("farmLocation").value
  };

  try {
    const response = await fetch("/api/crop-recommendation", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || "Recommendation failed.");
    output.textContent = data.data.recommendations
      .map((item, i) => `${i + 1}. ${item.crop}\n   ${item.note}`)
      .join("\n\n");
  } catch (error) {
    output.textContent = error.message;
  }
}

document.getElementById("message").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
