"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UpscaleContent() {
  const searchParams = useSearchParams();
  const imgUrl = searchParams.get('imgUrl');
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpscale = async () => {
    if (!imgUrl) return;
    setLoading(true);
    setStatus("正在向 AI 領取號碼牌...");

    try {
      // 1. 呼叫我們剛才寫的 API 拿號碼牌
      const res = await fetch('/api/upscale', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: imgUrl }),
      });
      let prediction = await res.json();

      if (prediction.error) throw new Error(prediction.error);

      const predictionId = prediction.id;
      setStatus("已排到隊，正在修復圖片 (約需 15-30 秒)...");

      // 2. 開始輪詢 (Polling)：每 2 秒問一次 Replicate 算好了沒
      // 我們不直接在前端用 Token，改用 Replicate 的公開 get 介面 (如果你的 Token 是公開的)
      // 為了方便測試，我們讓網頁一直問到成功為止
      let isFinished = false;
      while (!isFinished) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            "Authorization": `Token 這裡請貼上你的REPLICATE_TOKEN`, // 暫時直接貼在這裡測試
          },
        });
        const result = await checkRes.json();

        if (result.status === "succeeded") {
          setUpscaledUrl(result.output);
          isFinished = true;
          setStatus("修復成功！");
        } else if (result.status === "failed") {
          throw new Error("AI 修復失敗");
        } else {
          setStatus(`目前狀態: ${result.status}...`);
        }
      }
    } catch (error: any) {
      alert("發生錯誤: " + error.message);
      setStatus("修復失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-10 font-sans">
      <h1 className="text-2xl font-bold mb-5">✨ AI 圖片高清修復</h1>
      
      {imgUrl && (
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="text-center">
            <p className="mb-2 text-gray-500">原始圖片</p>
            <img src={imgUrl} alt="Original" className="max-w-xs border rounded shadow" />
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={handleUpscale}
              disabled={loading}
              className={`px-6 py-3 rounded-full font-bold text-white transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? "處理中..." : "🚀 開始修復"}
            </button>
            <p className="mt-3 text-sm text-blue-500">{status}</p>
          </div>

          {upscaledUrl && (
            <div className="text-center animate-in fade-in duration-700">
              <p className="mb-2 text-green-600 font-bold">修復完成 (4X 高清)</p>
              <img src={upscaledUrl} alt="Upscaled" className="max-w-md border-4 border-green-400 rounded shadow-xl" />
              <a href={upscaledUrl} target="_blank" className="block mt-4 text-blue-500 underline">下載高清圖</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 這是 Next.js 要求的 Suspense 包裹，防止 searchParams 報錯
export default function UpscalePage() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <UpscaleContent />
    </Suspense>
  );
}