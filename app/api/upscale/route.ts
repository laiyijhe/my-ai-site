import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    // 1. 叫 Replicate 開始算圖
    const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 使用目前最穩定的修復模型
        version: "da8ea2d0a61667629f0085033c0f3d3c69461cc43a0aa351bc819af142c299bb",
        input: { image: imageUrl, upscale: 4 }
      }),
    });

    let prediction = await startResponse.json();

    // 2. 因為 Replicate 需要時間，我們寫一個簡單的迴圈等它 (每隔 2 秒檢查一次)
    const predictionId = prediction.id;
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      prediction = await checkResponse.json();
    }

    // 3. 算完了，把結果回傳
    return NextResponse.json({ image: { url: prediction.output } });

  } catch (error) {
    return NextResponse.json({ error: "Replicate 運算逾時" }, { status: 500 });
  }
}