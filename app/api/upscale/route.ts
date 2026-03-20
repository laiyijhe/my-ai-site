import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    // 1. 先呼叫 Replicate 的 SwinIR 模型 (一個快速且免費的 AI 模型)
    const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 使用 SwinIR 模型，這個模型比 ESRGAN 更快、排隊時間更短
        version: "660d551d50d41d9963da1807e32a6fa2c3f84f183e2009a0a256d05f3246a489",
        input: { image: imageUrl, upscale: 4 } // 放大 4 倍
      }),
    });

    let prediction = await startResponse.json();

    // 2. 因為 Replicate 是非同步的，我們寫一個簡單的迴圈在「原地等」 (每隔 2 秒檢查一次)
    const predictionId = prediction.id;
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      // 在終端機印出狀態 (除錯用)
      console.log("正在排隊/處理中:", prediction.status); 
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // 等 2 秒
      const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      prediction = await checkResponse.json();
    }

    // 3. 算完了，把結果回傳
    if (prediction.status === "succeeded") {
      return NextResponse.json({ image: { url: prediction.output } });
    } else {
      throw new Error(`Replicate 運算失敗: ${prediction.error}`);
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "處理失敗" }, { status: 500 });
  }
}