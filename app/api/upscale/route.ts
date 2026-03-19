import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    // 1. 先把遠端圖片上傳到你的 Cloudinary 空間
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: 'upscale_app',
    });

    // 2. 使用 Cloudinary 的 AI 放大功能 (e_gen_upscale:400 代表放大 4 倍)
    // 這是最簡單、最穩定的免費 AI 方案
    const upscaledUrl = cloudinary.url(uploadRes.public_id, {
      transformation: [
        { effect: "gen_upscale:400" },
        { quality: "auto" }
      ]
    });

    return NextResponse.json({ image: { url: upscaledUrl } });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Cloudinary 處理失敗" }, { status: 500 });
  }
}