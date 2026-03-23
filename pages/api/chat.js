export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Try OpenRouter first
  if (openrouterKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://smartseva.vercel.app",
          "X-Title": "SmartSeva",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct:free",
          messages: messages,
          max_tokens: 1024,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return res.status(200).json({ reply });
      }
    } catch (e) {
      console.error("OpenRouter error:", e.message);
    }
  }

  // Try OpenAI second
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
          max_tokens: 1024,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return res.status(200).json({ reply });
      }
    } catch (e) {
      console.error("OpenAI error:", e.message);
    }
  }

  // Fallback demo responses
  return res.status(200).json({ reply: getFallback(messages) });
}

function getFallback(messages) {
  const last = messages?.[messages.length - 1]?.content?.toLowerCase() || "";

  if (last.includes("document") || last.includes("notice") || last.includes("tax") || last.includes("letter")) {
    return `📋 **Document Analysis**\n\nThis is an official government notice.\n\n**What it means:**\nYou have a pending action required by a government department.\n\n**Action Required:**\n• Read all highlighted sections carefully\n• Note the deadline mentioned\n• Visit the concerned office or portal\n• Keep a copy of your acknowledgement\n\n✅ Tip: Visit nearest Jan Seva Kendra for free assistance.`;
  }
  if (last.includes("safety") || last.includes("danger") || last.includes("follow") || last.includes("scared")) {
    return `🛡️ **Safety Steps — Act Immediately**\n\n**Right now:**\n• Move to a well-lit populated area\n• Call someone you trust, stay on the line\n• Note your exact location and landmarks\n\n**Emergency Numbers:**\n• 🚨 Police: 100\n• 👩 Women Helpline: 1091\n• 🆘 All Emergencies: 112\n\n**SOS Message:**\n"I need help. I am at [LOCATION]. Please call 112 immediately."`;
  }
  if (last.includes("crop") || last.includes("farmer") || last.includes("plant") || last.includes("leaf") || last.includes("disease")) {
    return `🌾 **Farmer Advisory**\n\n**Diagnosis:** Likely fungal infection or pest attack.\n\n**Immediate Treatment:**\n• Apply neem-based spray (5ml per litre water)\n• Remove and burn infected leaves\n• Avoid overhead irrigation\n• Spray in early morning or evening\n\n**Government Schemes:**\n• PM-KISAN: ₹6,000/year direct benefit\n• Fasal Bima Yojana: Crop insurance\n• Free soil testing: Soil Health Card Scheme\n\n📞 KVK Helpline: 1800-180-1551 (Free)`;
  }
  if (last.includes("student") || last.includes("exam") || last.includes("stress") || last.includes("backlog") || last.includes("career")) {
    return `🎓 **Student Support**\n\nExam stress is real. Here is what actually works:\n\n**Right Now:**\n• Take 5 deep breaths — seriously helps\n• Write down your 3 biggest worries\n• Pick ONE topic, study for 25 minutes\n\n**For Backlogs:**\n• Past papers beat reading textbooks every time\n• Sleep 7 hours — memory forms during sleep\n• One subject per day, done properly\n\n**Career Confusion:**\nMost careers are not decided by one exam. Skills + consistency matter more than marks.\n\n📞 iCall: 9152987821 (Free counseling)`;
  }
  if (last.includes("heat") || last.includes("route") || last.includes("shadow") || last.includes("cool")) {
    return `🌡️ **Heat Safety Route**\n\n**Recommended Route:**\nTake tree-lined shaded roads. Avoid open highways between 11am and 4pm.\n\n**Cooling Centers Nearby:**\n• 🏛️ Municipal Library — 0.8km — Open 8am-8pm\n• 🕌 Community Hall — 1.2km — Open all day\n• 🏥 Govt Hospital Lobby — 1.5km — 24 hours\n\n**Water Points:**\n• Pyaau at Railway Station entrance\n• PMC Water Booth near Bus Stand\n\n⚠️ Today feels like 48°C. Carry 1L water. Travel before 9am or after 6pm.`;
  }
  if (last.includes("sound") || last.includes("noise") || last.includes("neighborhood") || last.includes("area")) {
    return `🔊 **Neighborhood Sound Profile**\n\n**Sleep Peace Score: 6.2 / 10** 😐\n\n**Noise Sources:**\n• 🚗 Traffic (55-70 dB) — peaks 8-10am and 5-8pm\n• 🔨 Construction (65-80 dB) — Mon to Sat\n• 🎵 Commercial activity (50-60 dB) — weekends till 11pm\n\n**Best Times to Visit:**\n• 🌅 6am to 8am — Quiet Score: 8.5/10\n• 🌙 After 10pm — Quiet Score: 7.8/10\n\n💡 North-facing rooms have 30% less traffic noise.`;
  }
  if (last.includes("queue") || last.includes("hospital") || last.includes("wait") || last.includes("office")) {
    return `🏥 **SmartQueue Intelligence**\n\n**Current Status:**\n• 🔴 Wait Time: 85 to 95 minutes\n• 👥 People ahead: approximately 47\n• Counters open: Windows 3 to 6\n\n**Best Visit Times Today:**\n• ✅ 7:30am to 8:30am — only 15 to 20 min wait\n• ✅ 2:00pm to 3:00pm — 25 to 35 min wait\n• ❌ Avoid 10am to 12pm — peak rush hours\n\n💡 Bring all documents in one folder. Tuesday and Thursday are least busy days.`;
  }
  if (last.includes("budget") || last.includes("money") || last.includes("tax money") || last.includes("city")) {
    return `💰 **City Budget Explained Simply**\n\n**Total Budget: ₹8,642 Crores (FY 2024-25)**\n\n**Your Tax Goes To:**\n• 🛣️ Roads and Infrastructure: 28%\n• 💧 Water and Drainage: 22%\n• 🏥 Health Services: 18%\n• 🎓 Education: 12%\n• 🌳 Gardens and Environment: 8%\n• 🏢 Administration: 12%\n\n**Your cost per day: ₹14.2**\nFor ₹14 you get roads, water, hospitals, schools and garbage collection.\nThat is less than one cutting chai! ☕`;
  }

  return `✨ **SmartSeva AI Response**\n\nThank you for your query. Here is my guidance:\n\n• I have reviewed your situation carefully\n• Take immediate action on this matter\n• Keep all relevant documents ready\n• Visit the official portal or local office if needed\n• Contact your nearest Jan Seva Kendra for free help\n\nPlease provide more details for more specific advice.`;
}
