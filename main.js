const API_URL = "https://nexa-79z3.onrender.com"; // ton backend

let memory = [];

/**********************
 * 🧽 Nettoyage texte utilisateur
 **********************/
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:()"'`]/g, "") // ❌ ponctuation
    .replace(/\s+/g, " ")          // espaces multiples
    .trim();
}

/**********************
 * 🌐 Charger mémoire
 **********************/
async function loadMemory() {
  const res = await fetch(`${API_URL}/memory`);
  memory = await res.json();
}
loadMemory();

/**********************
 * 🧠 LOGIQUE IA
 **********************/
async function nexaAI(message) {
  const rawMsg = message;
  const msg = cleanText(message); // 🔥 nettoyé

  // 📘 Apprentissage
  if (msg.startsWith("/learn ")) {
    const content = rawMsg.substring(7);
    const parts = content.split("|");

    if (parts.length !== 2) {
      return "❌ Format : /learn question | réponse";
    }

    const q = cleanText(parts[0]); // ❌ ponctuation + minuscules
    const a = parts[1].trim();     // ✅ réponse intacte

    await fetch(`${API_URL}/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, a })
    });

    await loadMemory();
    return "🧠 J’ai appris quelque chose de nouveau !";
  }

  // 🔍 Recherche
  for (let item of memory) {
    for (let key of item.q) {
      if (msg.includes(cleanText(key))) {
        return item.a; // ✅ ponctuation conservée
      }
    }
  }

  return [
    "🤔 Je ne sais pas encore.",
    "Tu peux m’apprendre avec /learn",
    "Je n’ai pas encore appris ça.",
    "Explique-moi 🙂"
  ][Math.floor(Math.random() * 4)];
}

/**********************
 * 💬 UI
 **********************/
function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const response = await nexaAI(text);
  addMessage(response, "ai");
}

document.getElementById("userInput").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
