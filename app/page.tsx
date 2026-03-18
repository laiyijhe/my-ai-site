"use client";
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function UpscaleContent() {
  const searchParams = useSearchParams();
  const imgUrl = searchParams.get('imgUrl');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startUpscale = async () => {
    if (!imgUrl) return;
    setLoading(true);
    const res = await fetch('/api/upscale', {
      method: 'POST',
      body: JSON.stringify({ imageUrl: imgUrl }),
    });
    const data = await res.json();
    setResultUrl(data.image?.url || null);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-10 font-sans">
      <h1 className="text-3xl font-bold mb-6">AI 高清修復中心</h1>
      {imgUrl && <img src={imgUrl} className="w-80 rounded-lg shadow-md mb-4" alt="原圖" />}
      <button 
        onClick={startUpscale} 
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "AI 正在發功中..." : "立刻變清晰"}
      </button>
      {resultUrl && (
        <div className="mt-10">
          <h3 className="text-xl mb-4 text-green-600 font-bold">修復完成！</h3>
          <img src={resultUrl} className="max-w-full rounded-lg shadow-2xl" alt="結果" />
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <UpscaleContent />
    </Suspense>
  );
}
