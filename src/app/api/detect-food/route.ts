import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    // Extract base64 data and media type
    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const requestBody = JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `Analyze this food image. Return ONLY a JSON object (no markdown, no explanation) with these fields:
- "title": short description of the food with estimated quantity (e.g., "8 slices of pepperoni pizza")
- "description": one sentence about the food
- "food_category": one of "prepared", "produce", "baked", "packaged", "beverages", "other"
- "quantity": estimated number of servings (integer)
- "dietary_tags": array of applicable tags from ["vegetarian", "vegan", "halal", "kosher", "gluten-free", "nut-free", "dairy-free"]`,
            },
          ],
        },
      ],
    });

    // Try each key, rotate on 429
    let response: Response | null = null;
    for (const key of apiKeys) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        }
      );
      if (response.status !== 429) break;
    }

    if (!response || !response.ok) {
      const errText = await response?.text();
      console.error("Gemini API error:", response?.status, errText);
      return NextResponse.json({ error: `Gemini API error: ${response?.status}` }, { status: 502 });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Parse the JSON response
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("detect-food error:", err);
    return NextResponse.json({ error: "Detection failed" }, { status: 500 });
  }
}
