import { toast } from "sonner";

const PAYROLL_SYSTEM_PROMPT = `Du bist ein hilfreicher HR-Assistent, spezialisiert auf Fragen zu Lohn & Gehalt.
Beantworte Fragen professionell und freundlich auf Deutsch.
Dein Fokus liegt auf:
- Gehaltsabrechnungen und deren Bestandteile
- Steuern und Sozialabgaben
- Bonuszahlungen und Sondervergütungen
- Reisekosten und Spesen
- Gehaltserhöhungen und -entwicklung
Beachte Datenschutz und gib keine sensiblen Informationen preis.`;

export async function askHrAssistant(question: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: PAYROLL_SYSTEM_PROMPT },
          { role: "user", content: question }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Fehler bei der Kommunikation mit ChatGPT');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT Error:', error);
    toast.error("Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.");
    return null;
  }
}