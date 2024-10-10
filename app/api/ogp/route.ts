import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    const { title } = await req.json();

    try {
        const baseDir=path.resolve(process.cwd(),'app/api/ogp');
        const imagePath=path.join(baseDir,'Images',`${title}.png`);
        const scriptPath=path.join(baseDir,'cogp');
        const pythonProcessPromise = new Promise<void>((resolve, reject) => {
            const pythonProcess = spawn('python3', [scriptPath, title]);
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}`));
                } else {
                    resolve();
                }
            });

            pythonProcess.on('error', (err) => {
                console.error('Python error:', err);
                return NextResponse.json({ error: `Failed to start Python process: ${err.message}` }, { status: 500 });
            });
            pythonProcess.stderr.on('data', (data) => {
                console.error('Python error:', data.toString());
                return NextResponse.json({ error: data.toString() }, { status: 500 });
            });
        });
        await pythonProcessPromise;

        try {
            const data = await fs.promises.readFile(imagePath);
            const base64Image = Buffer.from(data).toString('base64');
            await fs.promises.unlink(imagePath);
            return NextResponse.json({ image: base64Image });
        } catch (err) {
            console.error('Failed to read or delete image:', err);
            return NextResponse.json({ error: err }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}


// export async function POST (req:NextRequest){
//     const title=await req.json();
//     return NextResponse.json({title});
// }


