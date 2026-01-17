/*********************************
 * 🌐 CONFIG
 *********************************/
const API_URL = "https://nexa-79z3.onrender.com/memory";

let memory = [];

/*********************************
 * 🔧 NETTOYAGE TEXTE (MAJ + PONCT + APOSTROPHES)
 *********************************/
function cleanText(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, " ")        // apostrophes → espace
    .replace(/[.,!?;:()"]/g, "")   // ponctuation ignorée
    .replace(/\s+/g, " ")          // espaces multiples
    .trim();
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/*********************************
 * 📥 CHARGER LA MÉMOIRE
 *********************************/
async function loadMemory() {
  try {
    const res = await fetch(API_URL);
    memory = await res.json();
    console.log("Mémoire chargée :", memory);
  } catch (err) {
    console.error("Erreur chargement mémoire", err);
  }
}
loadMemory();

/*********************************
 * 🧠 IA NEXA
 *********************************/
async function nexaAI(message) {
  const raw = message;
  const msg = cleanText(message);

  // 🧠 APPRENTISSAGE
  if (raw.startsWith("/learn ")) {
    const content = raw.replace("/learn ", "");
    const parts = content.split("|");

    if (parts.length !== 2) {
      return "❌ Format : /learn question1, question2 | réponse1, réponse2";
    }

    const questions = parts[0]
      .split(",")
      .map(q => cleanText(q))
      .filter(Boolean);

    const answers = parts[1]
      .split(",")
      .map(a => a.trim())
      .filter(Boolean);

    if (!questions.length || !answers.length) {
      return "❌ Question ou réponse invalide.";
    }

    await fetch(API_URL + "/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: questions, a: answers })
    });

    await loadMemory();
    return "🧠 C’est appris ! Merci 🙌";
  }

  // 🔍 RECHERCHE
  for (let item of memory) {
    for (let key of item.q) {
      if (msg.includes(cleanText(key))) {
        return randomItem(item.a);
      }
    }
  }

  // ❓ RÉPONSE PAR DÉFAUT
  return randomItem([
    "🤔 Intéressant...",
    "Je ne suis pas sûr de comprendre.",
    "Peux-tu reformuler ?",
    "Je n’ai pas encore appris ça."
  ]);
}

/*********************************
 * 💬 INTERFACE
 *********************************/
function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = who;
  div.textContent = text;
  document.getElementById("chat").appendChild(div);
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
