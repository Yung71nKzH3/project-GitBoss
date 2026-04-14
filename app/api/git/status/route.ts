import { simpleGit, SimpleGit } from 'simple-git';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const git: SimpleGit = simpleGit(path);
    
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return NextResponse.json({ error: 'Not a valid Git repository' }, { status: 400 });
    }

    const status = await git.status();
    const branches = await git.branchLocal();
    
    return NextResponse.json({
      isRepo: true,
      currentBranch: status.current,
      branches: branches.all,
      files: status.files,
      ahead: status.ahead,
      behind: status.behind,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
