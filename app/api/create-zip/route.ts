import { NextRequest, NextResponse } from 'next/server';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';
import { E2BProvider } from '@/lib/sandbox/providers/e2b-provider';

export async function POST(request: NextRequest) {
  try {
    const { sandboxId } = await request.json().catch(() => ({ sandboxId: undefined }));

    if (!sandboxId) {
      return NextResponse.json(
        { success: false, error: 'sandboxId is required' },
        { status: 400 }
      );
    }

    // Resolve provider: use registered instance if present, else attempt reconnect
    let provider = sandboxManager.getProvider(sandboxId);
    if (!provider) {
      console.log(`[create-zip] No registered provider for ${sandboxId}, attempting reconnect`);
      provider = await sandboxManager.getOrCreateProvider(sandboxId);
    }

    const rawGetter = (provider as any).getRawSandbox;
    if (typeof rawGetter !== 'function') {
      return NextResponse.json(
        { success: false, error: 'ZIP download is only supported for E2B sandboxes' },
        { status: 400 }
      );
    }

    const sandbox = (provider as E2BProvider).getRawSandbox();
    if (!sandbox) {
      return NextResponse.json(
        { success: false, error: '有効なサンドボックスがありません' },
        { status: 400 }
      );
    }

    console.log('[create-zip] Creating project zip...');

    const buildResult = await sandbox.runCode(`
import subprocess, base64, os

os.chdir('/home/user/app')
zip_cmd = [
    'zip', '-r', '/tmp/project.zip', '.',
    '-x', 'node_modules/*', '.git/*', '.next/*', 'dist/*', 'build/*', '*.log'
]
proc = subprocess.run(zip_cmd, capture_output=True, text=True)
if proc.returncode != 0:
    print('ZIP_ERROR:' + proc.stderr)
else:
    size = os.path.getsize('/tmp/project.zip')
    with open('/tmp/project.zip', 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('ascii')
    print(f'ZIP_SIZE:{size}')
    print('ZIP_DATA_START')
    print(encoded)
    print('ZIP_DATA_END')
    `);

    const stdout = buildResult.logs.stdout.join('');

    const errorMatch = stdout.match(/ZIP_ERROR:(.*)/);
    if (errorMatch) {
      throw new Error(`Failed to create zip: ${errorMatch[1]}`);
    }

    const sizeMatch = stdout.match(/ZIP_SIZE:(\d+)/);
    const dataMatch = stdout.match(/ZIP_DATA_START\n([\s\S]+?)\nZIP_DATA_END/);

    if (!dataMatch) {
      throw new Error('Failed to extract zip data from sandbox output');
    }

    const base64Content = dataMatch[1].replace(/\s/g, '');
    const fileSize = sizeMatch ? parseInt(sizeMatch[1], 10) : base64Content.length;
    console.log(`[create-zip] Created project.zip (${fileSize} bytes)`);

    const dataUrl = `data:application/zip;base64,${base64Content}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      fileName: 'clone-project.zip',
      message: 'ZIP ファイルの作成に成功しました',
    });
  } catch (error) {
    console.error('[create-zip] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
