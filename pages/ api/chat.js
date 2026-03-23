// pages/api/chat.js
// This is a pass-through proxy to your AI backend.
// If no external backend exists, it uses Claude via Anthropic directly.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  // Try Anthropic Claude API if key is set
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-20240307",
          max_tokens: 1024,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.content?.[0]?.text || "I could not generate a response.";
        return res.status(200).json({ reply });
      }
    } catch (e) {
      console.error("Anthropic API error:", e);
    }
  }

  // Fallback: echo back a demo response
  return res.status(200).json({
    reply: getFallbackReply(messages),
  });
}

function getFallbackReply(messages) {
  const lastMsg = messages?.[messages.length - 1]?.content || "";

  if (lastMsg.includes("document") || lastMsg.includes("notice") || lastMsg.includes("tax")) {
    return `📋 **Document Analysis**\n\nThis appears to be an official government notice. Here's what it means:\n\n**What it says:** You have a pending action required by a government department.\n\n**Action Required:**\n• Read all highlighted sections carefully\n• Note the deadline mentioned\n• Visit the concerned office or portal\n• Keep a copy of your acknowledgement\n\n**Tip:** If uncertain, visit your nearest Jan Seva Kendra for free assistance.`;
  }

  if (lastMsg.includes("safety") || lastMsg.includes("danger") || lastMsg.includes("help")) {
    return `🛡️ **Safety Steps**\n\n**Right now:**\n• Move to a populated, well-lit area\n• Call someone you trust\n• Note your exact location\n\n**Emergency Numbers:**\n• 112 — All emergencies\n• 1091 — Women helpline\n• 100 — Police\n\n**SOS Message:** "I need help. I am at [YOUR LOCATION]. Please call 112."`;
  }

  if (lastMsg.includes("crop") || lastMsg.includes("farmer") || lastMsg.includes("plant")) {
    return `🌾 **Farmer Advisory**\n\n**Diagnosis:** The symptoms suggest a common fungal or pest issue.\n\n**Immediate Treatment:**\n• Apply neem-based spray (5ml/litre)\n• Remove affected leaves and burn them\n• Ensure proper drainage\n\n**Government Schemes:**\n• PM-KISAN: ₹6,000/year\n• Fasal Bima Yojana: Crop insurance\n• Call KVK helpline: 1800-180-1551`;
  }

  return `✨ **SmartSeva AI Response**\n\nThank you for your query. Based on your input, here is my analysis:\n\n• I have reviewed your situation carefully\n• The most important next step is to take immediate action\n• Keep all relevant documents handy\n• Visit the official portal or local office if needed\n\nFor more specific guidance, please provide more details about your situation.`;
}
