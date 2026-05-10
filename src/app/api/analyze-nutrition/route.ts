import { NextResponse } from "next/server";

const FEATHERLESS_KEYS = [
  process.env.FEATHERLESS_API_KEY_1,
  process.env.FEATHERLESS_API_KEY_2,
  process.env.FEATHERLESS_API_KEY_3,
  process.env.FEATHERLESS_API_KEY_4,
  process.env.FEATHERLESS_API_KEY_5,
  process.env.FEATHERLESS_API_KEY_6,
  process.env.FEATHERLESS_API_KEY_7,
  process.env.FEATHERLESS_API_KEY_8,
].filter(Boolean) as string[];

let keyIndex = 0;

function getNextKey(): string {
  const key = FEATHERLESS_KEYS[keyIndex % FEATHERLESS_KEYS.length];
  keyIndex++;
  return key;
}

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (FEATHERLESS_KEYS.length === 0) {
      return NextResponse.json(
        { error: "Featherless API keys not configured" },
        { status: 500 }
      );
    }

    const apiKey = getNextKey();

    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a nutrition analysis AI agent for a food rescue platform. Analyze this food image and return ONLY a JSON object (no markdown, no explanation) with these fields:
- "name": name of the food item
- "calories_per_serving": estimated calories per serving (integer)
- "protein_g": estimated protein in grams (number)
- "carbs_g": estimated carbohydrates in grams (number)
- "fat_g": estimated fat in grams (number)
- "fiber_g": estimated fiber in grams (number)
- "sugar_g": estimated sugar in grams (number)
- "sodium_mg": estimated sodium in milligrams (number)
- "serving_size": description of one serving (e.g., "1 slice", "1 cup")
- "health_score": 1-10 rating of nutritional value (integer)
- "allergens": array of common allergens present from ["gluten", "dairy", "nuts", "soy", "eggs", "fish", "shellfish"]
- "vitamins": array of key vitamins/minerals present (e.g., ["Vitamin C", "Iron", "Calcium"])
- "storage_tip": one sentence on how to store this food to maximize freshness
- "shelf_life_hours": estimated hours before this food should be consumed (integer)`,
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Featherless API error:", response.status, errText);
      return NextResponse.json(
        { error: `Featherless API error: ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "{}";

    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("analyze-nutrition error:", err);
    return NextResponse.json({ error: "Nutrition analysis failed" }, { status: 500 });
  }
}
