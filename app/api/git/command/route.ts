import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { path, command } = await req.json();
    
    if (!path || !command) {
      return NextResponse.json({ error: 'Path and command are required' }, { status: 400 });
    }

    if (!command.startsWith('git ')) {
      return NextResponse.json({ error: 'Only git commands are allowed' }, { status: 400 });
    }

    const { stdout, stderr } = await execAsync(command, { cwd: path });
    
    return NextResponse.json({
      stdout,
      stderr
    });
  } catch (error: any) {
    // execAsync throws if exit code is not 0
    return NextResponse.json({ 
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    }, { status: 500 });
  }
}
