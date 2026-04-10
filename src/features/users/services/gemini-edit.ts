// ─── Gemini trip plan modifier ─────────────────────────────────────────────────
// Requires VITE_GEMINI_API_KEY in .env.local

const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiErrorPayload {
  error?: { code?: number; message?: string; status?: string };
}

function throwGeminiHttpError(httpStatus: number, bodyText: string): never {
  let parsed: GeminiErrorPayload | null = null;
  try {
    parsed = JSON.parse(bodyText) as GeminiErrorPayload;
  } catch {
    // body may be plain text
  }
  const apiMessage = parsed?.error?.message ?? bodyText;
  throw new Error(`Gemini API error ${httpStatus}: ${apiMessage}`);
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  maxOutputTokens: number,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const model =
    (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY is not set. Add it to .env.local in the atlas-user root.',
    );
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    throwGeminiHttpError(response.status, await response.text());
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    error?: { message?: string };
  };

  if (data.error?.message) throw new Error(`Gemini API: ${data.error.message}`);

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((p) => p.text)
    .filter(Boolean)
    .join('');

  if (!text) {
    throw new Error(
      `Gemini returned no text (finishReason: ${candidate?.finishReason ?? 'unknown'}).`,
    );
  }
  return text;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

const EDIT_SYSTEM_PROMPT = `You are Atlas AI, an expert travel planner.
The user wants to modify their existing trip plan.
Apply the requested changes and return the COMPLETE updated trip plan as valid JSON.
Keep all unchanged days exactly as they are. Only modify what was requested.
Return the full plan using exactly the same JSON schema as the input — no fields removed.
JSON only — no markdown, no code fences, no extra prose.`;

export type ItineraryDoc = Record<string, unknown>;

export async function applyPlanModification(
  itinerary: ItineraryDoc,
  request: string,
): Promise<ItineraryDoc> {
  const userPrompt = `Current trip plan:\n${JSON.stringify(itinerary, null, 2)}\n\nRequested change:\n${request}`;
  const raw = await callGemini(EDIT_SYSTEM_PROMPT, userPrompt, 8192);

  let updated: ItineraryDoc;
  try {
    updated = JSON.parse(extractJson(raw)) as ItineraryDoc;
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${String(err)}`);
  }

  if (!updated.destination || !Array.isArray(updated.days)) {
    throw new Error('Invalid updated plan: missing required fields');
  }

  return updated;
}
