import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // 強制使用 https
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    // 1. 上傳原圖
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: 'upscale_app',
    });

    // 2. 生成 AI 放大網址
    // 注意：gen_upscale 有時候需要一點時間生成，如果第一次開是 404，重整一下通常就好了
    const upscaledUrl = cloudinary.url(uploadRes.public_id, {
      transformation: [
        { effect: "gen_upscale" }, // 使用預設 AI 放大
        { width: 1200, crop: "scale" }, // 強制寬度到 1200 像素
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    return NextResponse.json({ image: { url: upscaledUrl } });

  } catch (error) {
    console.error("Cloudinary Error:", error);
    return NextResponse.json({ error: "圖片處理失敗" }, { status: 500 });
  }
}