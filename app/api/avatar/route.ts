import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY .env.local mein set nahi hai." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const style = String(body.style || "Cyber Ninja").slice(0, 80);

    const prompt = [
      "Create an original, premium gaming profile avatar.",
      `Character theme: ${style}.`,
      "Centered head-and-shoulders portrait, striking silhouette,",
      "detailed futuristic armor, dramatic neon lighting,",
      "polished digital illustration, dark background, square composition.",
      "No text, no letters, no watermark, no logos."
    ].join(" ");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const image = result.data?.[0]?.b64_json;

    if (!image) {
      return NextResponse.json(
        { error: "Image response nahi mili. Dobara try karo." },
        { status: 502 }
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${image}` });
  } catch (error) {
    console.error("Avatar generation failed:", error);

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
