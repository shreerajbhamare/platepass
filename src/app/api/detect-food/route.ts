import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: image, detail: "low" },
              },
              {
                type: "text",
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
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return NextResponse.json({ error: `OpenAI API error: ${response.status}` }, { status: 502 });
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "{}";

    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("detect-food error:", err);
    return NextResponse.json({ error: "Detection failed" }, { status: 500 });
  }
}
