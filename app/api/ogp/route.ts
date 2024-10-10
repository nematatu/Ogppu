import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
    const { title } = await req.json();

    try {
        // 背景画像をBase64エンコードして返す
        const bgImagePath = path.join(process.cwd(), 'app/api/ogp', 'OGP.png');
        const bgImageBuffer = await fs.readFile(bgImagePath);
        const bgImageBase64 = bgImageBuffer.toString('base64');

        // フォントファイルをBase64エンコードして返す
        const fontPath = path.join(process.cwd(), 'app/api/ogp', 'irohakakuC-Medium.ttf');
        const fontBuffer = await fs.readFile(fontPath);
        const fontBase64 = fontBuffer.toString('base64');

        return NextResponse.json({
            backgroundImage: `data:image/png;base64,${bgImageBase64}`,
            font: `data:font/ttf;base64,${fontBase64}`,
            title
        });
    } catch (error) {
        console.error('Error preparing data:', error);
        return NextResponse.json({ error: 'Failed to prepare data' }, { status: 500 });
    }
}