import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    
    // 檢查有沒有圖片網址
    if (!imageUrl) {
      return NextResponse.json({ error: "沒有提供圖片網址" }, { status: 400 });
    }

    console.log("正在處理圖片:", imageUrl);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FAL API 錯誤:", errorText);
      return NextResponse.json({ error: "AI 服務器回應錯誤" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("系統錯誤:", error);
    return NextResponse.json({ error: "網路連線失敗" }, { status: 500 });
  }
}