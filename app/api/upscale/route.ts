import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "請提供圖片網址" }, { status: 400 });
    }

    // 步驟 1：向 Replicate 發起請求，這步很快（不到 1 秒）
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 使用 SwinIR 模型，通常不需要排隊太久
        version: "660d551d50d41d9963da1807e32a6fa2c3f84f183e2009a0a256d05f3246a489",
        input: { image: imageUrl, upscale: 4 }
      }),
    });

    const prediction = await response.json();

    if (response.status !== 201) {
      console.error("Replicate 啟動失敗:", prediction.detail);
      return NextResponse.json({ error: "AI 引擎啟動失敗" }, { status: 500 });
    }

    // 步驟 2：直接把「號碼牌 (Prediction ID)」回傳給前端
    // 我們不在這裡等，避免 Vercel 10 秒超時斷線
    return NextResponse.json(prediction);

  } catch (error: any) {
    console.error("API 發生錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}