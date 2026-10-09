import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side Gemini client initialization with mandatory user-agent
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Satine Liotaud Complete Knowledge Base & Persona
const SATINE_SYSTEM_PROMPT = `You are "Sat", a sophisticated, poised personal voice assistant representing Satine Liotaud.
Your persona:
- Name: Sat.
- Role: Official voice representative and career assistant for Satine Liotaud.
- Vocal characteristics: Deep female tone, articulate, calm, professional, and elegant.
- Language behavior:
  - When speaking English, speak with a natural, refined American accent.
  - When speaking French, speak with an authentic, elegant Parisian French accent.
  - You effortlessly understand and speak both English and French. Always reply in the language the user speaks to you in.
- Conversational style:
  - Concise, spoken-friendly responses (typically 2 to 4 sentences, around 30 to 70 words) so that it sounds natural when synthesized into speech.
  - When asked for comprehensive details, provide structured, clear bullet points or an organized spoken summary.
  - Warm, confident, respectful of high-luxury etiquette (reflecting Satine's experience at Maison LANVIN and fashion houses).
  - Never break character. You are Sat, Satine's dedicated assistant.

Satine Liotaud's Background & Resume Facts:
1. Current Education:
   - 3rd year student at ESCE International Business School (Programme Grandes Écoles), Paris La Défense (2023-2028, BAC+5).
   - Major/Focus: International Commerce & Global Business.
   - High School: Baccalauréat National (2023) at Lycée La Bruyère in Versailles with specializations in SES (Economic & Social Sciences) and HGGSP (History, Geography, Geopolitics & Political Sciences).

2. Professional Experiences:
   - LANVIN (July - December 2025) - Customer Service & Logistics Assistant in LUXURY:
     • Managed international client relations across Retail, Wholesale, After-Sales Service (SAV), international suppliers, and logistics carriers.
     • Processed and resolved claims, returns, and repairs via Zendesk.
     • Managed inventory levels and supply chain logistics flows using SAP.
     • Sourced and monitored spare parts replenishment from international luxury suppliers.
     • Created weekly and monthly performance reports using Excel and IBM Cognos.
     • Handled customs formalities, international shipping documentation, and cross-border returns.
     • Contributed to setting up VIP Showrooms during Paris Fashion Week 2025.
   - INTERSPORT (September 2024 - May 2025) - Multipurpose Sales Hostess / Cashier:
     • Customer loyalty engagement, private sales, and promotional campaigns.
     • Analyzed point-of-sale data to adjust sales and merchandising strategies.
     • Product staging and visual merchandising in departments.
   - LES BIJOUX DE MARILOU (May - July 2024) - E-commerce Commercial Assistant:
     • Customer inquiries and hotline/standard management.
     • Restructured the internal after-sales service (SAV) guide to streamline team workflows.
     • Order processing via Shopify.
     • Inventory tracking in Excel; bespoke order assembly and luxury packaging.

3. Core Skills & Competencies:
   - High adaptability, organizational rigor, team leadership, active listening, deep commitment.
   - Technical Tools: SAP, Zendesk, IBM Cognos, Shopify, Microsoft Office (Advanced Excel), Customs & Logistics coordination.
   - Driving license: Permis B.

4. Languages:
   - French: Native
   - English: Professional working proficiency (B1 / business fluent)
   - Spanish: Elementary (A2)

5. Interests & Passions:
   - Travel: London, New York City, Lisbon, Dubai, Barcelona, Rome.
   - Cultural & Arts: Yves Saint Laurent Museum, Dior Haute Couture Exhibition, Musée d'Orsay, Paris Book Fair.
   - Cinema & Performing Arts: Extra / background actor for Disney+ productions.

6. Contact & Location:
   - Location: Jouy-en-Josas (78350), Yvelines / Île-de-France, France.
   - Email: satine.liotaud@yahoo.com / satine.liotaud@gmail.com
   - LinkedIn: linkedin.com/in/satine-liotaud-195528253
   - Phone: 06 85 63 84 63
`;

// Helper with timeout for resilient generation
async function callWithTimeout<T>(promise: Promise<T>, ms: number = 6000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Gemini API call timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Helper to synthesize speech via Gemini TTS
async function synthesizeSpeech(text: string, langHint: "en" | "fr" = "en"): Promise<string | null> {
  if (!ai) return null;

  try {
    const isFrench =
      langHint === "fr" ||
      /[éèêëàâîïôùûçœæ]/i.test(text) ||
      /\b(bonjour|salut|merci|satine|oui|expérience|formation|école|stage)\b/i.test(text);

    const stylePrompt = isFrench
      ? "Deep, calm, warm, elegant, articulate female voice speaking with an authentic French accent"
      : "Deep, calm, warm, elegant, articulate female voice speaking with a clear American accent";

    const speechPromise = ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text.slice(0, 500), // Clean length for smooth TTS
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }, // Deep, articulate female voice
          },
        },
      },
    });

    const response = await callWithTimeout(speechPromise, 6000);
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn("Gemini TTS synthesis notice:", (err as any)?.message || err);
    return null;
  }
}

// 1. Initial Greeting API
app.get("/api/greeting", async (req, res) => {
  const lang = (req.query.lang as string) === "fr" ? "fr" : "en";
  const greetingText =
    lang === "fr"
      ? "Bonjour, je suis Sat, l'assistante de Satine. Que souhaiteriez-vous savoir à son sujet ?"
      : "Hello, I am Sat's assistant, what would you like to know about him/her ?";

  let audioBase64: string | null = null;
  if (ai) {
    audioBase64 = await synthesizeSpeech(greetingText, lang);
  }

  res.json({
    text: greetingText,
    audio: audioBase64,
    lang,
    persona: "Sat",
  });
});

// Knowledge-grounded fallback responses if upstream model experiences temporary 503 high demand
function getKnowledgeFallback(query: string, isFrench: boolean): string {
  const q = query.toLowerCase();

  if (q.includes("lanvin") || q.includes("luxe") || q.includes("luxury")) {
    return isFrench
      ? "Chez LANVIN de juillet à décembre 2025, Satine a exercé comme Customer Service & Logistics Assistant dans le luxe. Elle gérait la relation client internationale pour le retail et wholesale, pilotait les stocks et flux sur SAP, résolvait les réclamations via Zendesk, et a contribué à l'installation des showrooms VIP lors de la Paris Fashion Week 2025."
      : "At Maison LANVIN from July to December 2025, Satine worked as a Customer Service & Logistics Assistant in luxury. She managed international retail and wholesale relations, monitored supply chains and inventory on SAP, handled customer claims via Zendesk, and assisted in setting up VIP showrooms during Paris Fashion Week 2025.";
  }

  if (q.includes("intersport") || q.includes("caisse") || q.includes("vente") || q.includes("retail")) {
    return isFrench
      ? "Chez INTERSPORT de septembre 2024 à mai 2025, Satine était hôtesse de caisse polyvalente. Elle a dynamisé le programme de fidélité, analysé les données de vente pour optimiser les approches commerciales et assuré un merchandising attractif en rayon."
      : "At INTERSPORT from September 2024 to May 2025, Satine served as a multipurpose sales hostess and cashier, focusing on client loyalty programs, sales data analysis for strategic adjustments, and in-store visual merchandising.";
  }

  if (q.includes("marilou") || q.includes("bijou") || q.includes("e-commerce") || q.includes("shopify")) {
    return isFrench
      ? "Chez Les Bijoux de Marilou entre mai et juillet 2024, elle a géré les commandes clients sur Shopify, restructuré l'intégralité du guide SAV interne pour fluidifier le service client et supervisé la gestion des stocks avec Excel."
      : "At Les Bijoux de Marilou from May to July 2024, Satine managed e-commerce orders via Shopify, completely overhauled the internal after-sales service guide, and ensured stock tracking using Excel.";
  }

  if (q.includes("esce") || q.includes("formation") || q.includes("ecole") || q.includes("school") || q.includes("education") || q.includes("etude") || q.includes("bac")) {
    return isFrench
      ? "Satine est en 3ème année à l'ESCE International Business School (Programme Grande École, BAC+5) sur le campus de Paris La Défense, avec une spécialisation en commerce international. Elle a obtenu son Baccalauréat en 2023 au Lycée La Bruyère à Versailles avec mention en SES et HGGSP."
      : "Satine is currently a third-year student at ESCE International Business School (Grandes Écoles Program, BAC+5) at Paris La Défense, specializing in international business. She graduated with her Baccalaureate in 2023 from Lycée La Bruyère in Versailles.";
  }

  if (q.includes("competence") || q.includes("skill") || q.includes("sap") || q.includes("zendesk") || q.includes("logiciel") || q.includes("tool")) {
    return isFrench
      ? "Ses compétences clés allient maîtrise opérationnelle des outils du luxe (SAP, Zendesk, IBM Cognos, Shopify, Excel avancé) et qualités relationnelles d'adaptabilité, de rigueur d'organisation et de leadership en équipe."
      : "Her core competencies combine luxury operational tools (SAP, Zendesk, IBM Cognos, Shopify, advanced Excel) with strong adaptability, organizational rigor, and team leadership.";
  }

  if (q.includes("langue") || q.includes("language") || q.includes("anglais") || q.includes("english")) {
    return isFrench
      ? "Satine est francophone native, possède un niveau d'anglais professionnel B1 fluide en contexte commercial international, ainsi que des notions d'espagnol (A2)."
      : "Satine is a native French speaker, holds professional working proficiency in English (B1 level) for international business environments, and has basic Spanish skills (A2).";
  }

  if (q.includes("contact") || q.includes("email") || q.includes("mail") || q.includes("entretien") || q.includes("interview") || q.includes("linkedin")) {
    return isFrench
      ? "Vous pouvez contacter Satine par e-mail à satine.liotaud@yahoo.com ou au 06 85 63 84 63. Elle est également joignable sur son profil LinkedIn."
      : "You can reach Satine directly via email at satine.liotaud@yahoo.com or by phone at 06 85 63 84 63. Her LinkedIn profile is also accessible directly from this page.";
  }

  if (q.includes("interet") || q.includes("passion") || q.includes("voyage") || q.includes("cinema") || q.includes("disney") || q.includes("culture")) {
    return isFrench
      ? "Satine est passionnée par l'art et la haute couture (Musée Yves Saint Laurent, rétrospectives Dior, Musée d'Orsay), a voyagé à New York, Dubaï, Londres et Rome, et a même fait de la figuration pour des productions Disney+."
      : "Satine has a strong passion for art and haute couture (Yves Saint Laurent Museum, Dior exhibitions, Musée d'Orsay), has traveled widely across NYC, Dubai, London, and Rome, and has worked as an extra for Disney+ cinema productions.";
  }

  return isFrench
    ? "Satine est actuellement étudiante en commerce international à l'ESCE et a forgé son expérience dans le luxe chez Lanvin. Que souhaitez-vous découvrir précisément sur son parcours ou ses compétences ?"
    : "Satine is an international business student at ESCE Paris with proven luxury logistics experience at Maison Lanvin. What specific aspect of her background or skills would you like to explore?";
}

// 2. Chat API (Conversational Response + Voice Synthesis)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], voiceEnabled = true } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Detect likely language
    const isFrench =
      /[éèêëàâîïôùûçœæ]/i.test(message) ||
      /\b(bonjour|salut|qui|quel|quelle|quels|quelles|comment|pourquoi|stage|paris|français|peux|raconte)\b/i.test(message);
    const lang = isFrench ? "fr" : "en";

    let replyText = "";

    if (ai) {
      try {
        const contents: any[] = [];
        if (Array.isArray(conversationHistory)) {
          for (const item of conversationHistory.slice(-4)) {
            if (item.role === "user" || item.role === "assistant") {
              contents.push({
                role: item.role === "assistant" ? "model" : "user",
                parts: [{ text: item.content || item.text }],
              });
            }
          }
        }

        contents.push({
          role: "user",
          parts: [
            {
              text: `User inquiry: "${message}". Please respond as Sat in ${
                isFrench ? "French (deep female tone, authentic French accent)" : "English (deep female tone, clear American accent)"
              }. Keep the answer natural, poised, and between 2 to 4 sentences unless explicitly asked for a full breakdown.`,
            },
          ],
        });

        const modelPromise = ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction: SATINE_SYSTEM_PROMPT,
            temperature: 0.7,
          },
        });

        const modelResponse = await callWithTimeout(modelPromise, 6000);
        replyText = modelResponse.text?.trim() || "";
      } catch (genError: any) {
        console.warn("Gemini chat model unavailable, using knowledge fallback:", genError?.message);
        replyText = getKnowledgeFallback(message, isFrench);
      }
    } else {
      replyText = getKnowledgeFallback(message, isFrench);
    }

    if (!replyText) {
      replyText = getKnowledgeFallback(message, isFrench);
    }

    // Generate voice audio
    let audioBase64: string | null = null;
    if (voiceEnabled) {
      audioBase64 = await synthesizeSpeech(replyText, lang);
    }

    res.json({
      reply: replyText,
      audio: audioBase64,
      language: lang,
    });
  } catch (error: any) {
    console.error("Chat generation error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate response.",
    });
  }
});

// 3. Audio Transcription API (if client sends microphone recorded audio)
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioData, mimeType = "audio/webm" } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: "Missing audioData." });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini client not initialized." });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          {
            text: "Transcribe the spoken audio accurately into text. Output only the verbatim transcription without commentary.",
          },
        ],
      },
    });

    const transcript = response.text?.trim() || "";
    res.json({ transcript });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: err?.message || "Transcription failed" });
  }
});

// 4. Standalone TTS Generation API
app.post("/api/tts", async (req, res) => {
  try {
    const { text, lang = "en" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const audio = await synthesizeSpeech(text, lang);
    res.json({ audio });
  } catch (err: any) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "Failed to generate TTS" });
  }
});

// 5. Satine CV Data Endpoint for Structured Information
app.get("/api/profile", (req, res) => {
  res.json({
    name: "Satine Liotaud",
    assistantName: "Sat",
    role: "International Business & Luxury Logistics",
    school: "ESCE International Business School (Grandes Écoles, BAC+5)",
    location: "Jouy-en-Josas, France",
    email: "satine.liotaud@yahoo.com",
    linkedin: "https://www.linkedin.com/in/satine-liotaud-195528253",
    experiences: [
      {
        company: "LANVIN",
        role: "Customer Service & Logistics Assistant (LUXE)",
        period: "July - Dec 2025",
        highlights: [
          "International client relation (Retail, Wholesale, SAV, suppliers & carriers)",
          "Zendesk resolution of claims, returns & repairs",
          "Stock & logistics flow management with SAP",
          "Spare parts procurement & international vendor follow-up",
          "Weekly & monthly reporting via Excel & Cognos",
          "Customs formalities & Paris Fashion Week 2025 VIP showrooms setup",
        ],
      },
      {
        company: "INTERSPORT",
        role: "Multipurpose Sales Hostess / Cashier",
        period: "Sept 2024 - May 2025",
        highlights: [
          "Customer loyalty programs, promotional offers, and private sales",
          "Sales data analysis to adjust merchandising strategies",
          "Attractive in-shelf product staging",
        ],
      },
      {
        company: "LES BIJOUX DE MARILOU",
        role: "E-commerce Commercial Assistant",
        period: "May - July 2024",
        highlights: [
          "Customer inquiries & telephone standard",
          "Restructured after-sales guide documentation",
          "Order processing via Shopify & inventory management in Excel",
          "Custom jewelry assembly & packaging",
        ],
      },
    ],
    education: [
      {
        degree: "Programme Grandes Écoles (BAC+5) - 3rd Year",
        school: "ESCE International Business School - La Défense",
        period: "2023 - 2028",
      },
      {
        degree: "Diplôme National du Baccalauréat (SES & HGGSP)",
        school: "Lycée La Bruyère - Versailles",
        period: "2023",
      },
    ],
    languages: [
      { name: "French", level: "Native", code: "fr" },
      { name: "English", level: "B1 (Business Fluent)", code: "en" },
      { name: "Spanish", level: "A2", code: "es" },
    ],
    tools: ["SAP", "Zendesk", "IBM Cognos", "Shopify", "Microsoft Excel", "Office"],
    interests: [
      "Travel (London, New York, Lisbon, Dubai, Barcelona, Rome)",
      "Culture & Fashion (Yves Saint Laurent Museum, Dior Exhibition, Musée d'Orsay, Salon du Livre)",
      "Cinema (Background acting for Disney+ productions)",
    ],
  });
});

// Serve frontend in production or mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(".", "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(".", "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Satine Liotaud Voice Assistant running on http://localhost:${PORT}`);
  });
}

startServer();
