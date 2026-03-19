import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    console.log("收到圖片網址:", imageUrl);

    // 1. 嘗試上傳
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: 'upscale_app',
    }).catch(err => {
      console.error("Cloudinary 上傳失敗詳情:", err);
      throw err;
    });

    console.log("上傳成功，ID 為:", uploadRes.public_id);

    // 2. 生成放大網址 (先改用最穩定的傳統放大，排除 AI 權限問題)
    const upscaledUrl = cloudinary.url(uploadRes.public_id, {
      transformation: [
        { width: 1200, crop: "limit" }, // 先嘗試單純放大
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    return NextResponse.json({ image: { url: upscaledUrl } });

  } catch (error: any) {
    console.error("API 發生錯誤:", error.message);
    return NextResponse.json({ error: error.message || "處理失敗" }, { status: 500 });
  }
}