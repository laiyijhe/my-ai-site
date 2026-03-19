import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    
    const response = await fetch("https://fal.run/fal-ai/esrgan", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        scale: 4,
        face: true,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "AI 運算失敗" }, { status: 500 });
  }
}