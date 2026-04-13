'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  GitPullRequest, 
  AlertTriangle, 
  Trash2, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud,
  FileText,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  FolderGit2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function GitBossPage() {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '> git status',
    'On branch feature/new-dashboard',
    'Your branch is up to date with origin/feature/new-dashboard.',
    'Changes not staged for commit:',
    '  (use "git add <file>..." to update what will be committed)',
    '  (use "git restore <file>..." to discard changes in working directory)',
    '        modified:   app/page.tsx',
    '        modified:   components/ui/button.tsx',
    '',
    'no changes added to commit (use "git add" and/or "git commit -a")'
  ]);

  const [isWorking, setIsWorking] = useState(false);

  const executeCommand = (command: string, logs: string[]) => {
    setIsWorking(true);
    setTerminalLogs(prev => [...prev, '', `> ${command}`]);
    
    // Simulate command execution delay
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, ...logs]);
      setIsWorking(false);
    }, 800);
  };

  const handleNukeChanges = () => {
    executeCommand('git reset --hard HEAD && git clean -fd', [
      'HEAD is now at 8f3a2b1 Update dashboard layout',
      'Removing untracked files...',
      'Working tree clean. All uncommitted changes have been forcefully removed.'
    ]);
  };

  const handleForcePush = () => {
    executeCommand('git push --force-with-lease origin feature/new-dashboard', [
      'Enumerating objects: 5, done.',
      'Counting objects: 100% (5/5), done.',
      'Delta compression using up to 8 threads',
      'Compressing objects: 100% (3/3), done.',
      'Writing objects: 100% (3/3), 328 bytes | 328.00 KiB/s, done.',
      'Total 3 (delta 2), reused 0 (delta 0), pack-reused 0',
      'To github.com:user/repo.git',
      ' + 8f3a2b1...a1b2c3d feature/new-dashboard -> feature/new-dashboard (forced update)'
    ]);
  };

  const handleCommit = () => {
    executeCommand('git add . && git commit -m "Update UI components"', [
      '[feature/new-dashboard a1b2c3d] Update UI components',
      ' 2 files changed, 45 insertions(+), 12 deletions(-)'
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-300 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">
            GB
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-100">GitBoss</h1>
            <div className="text-xs text-neutral-500 flex items-center gap-1">
              <FolderGit2 className="w-3 h-3" />
              <span>~/projects/awesome-app</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800/50 border border-neutral-700/50">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-neutral-200">feature/new-dashboard</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800/50 border border-neutral-700/50">
            <RefreshCw className="w-4 h-4 text-neutral-400" />
            <span>Up to date</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Working Tree */}
        <div className="w-80 border-r border-neutral-800 bg-neutral-900/20 flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Working Tree</h2>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between group px-2 py-1.5 hover:bg-neutral-800/50 rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-neutral-300">app/page.tsx</span>
                </div>
                <span className="text-xs font-mono text-amber-500">M</span>
              </div>
              <div className="flex items-center justify-between group px-2 py-1.5 hover:bg-neutral-800/50 rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-neutral-300">components/ui/button.tsx</span>
                </div>
                <span className="text-xs font-mono text-amber-500">M</span>
              </div>
              <div className="flex items-center justify-between group px-2 py-1.5 hover:bg-neutral-800/50 rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-neutral-300">lib/utils.ts</span>
                </div>
                <span className="text-xs font-mono text-emerald-500">A</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Commit</h2>
            <textarea 
              className="w-full h-24 bg-neutral-900 border border-neutral-700 rounded-md p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none mb-3"
              placeholder="What did you change, boss?"
            />
            <button 
              onClick={handleCommit}
              disabled={isWorking}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Commit Changes
            </button>
          </div>
        </div>

        {/* Center - Diff Viewer (Placeholder) */}
        <div className="flex-1 flex flex-col bg-neutral-950">
          <div className="h-10 border-b border-neutral-800 flex items-center px-4 bg-neutral-900/30">
            <span className="text-sm font-mono text-neutral-400">app/page.tsx</span>
          </div>
          <div className="flex-1 p-6 overflow-auto font-mono text-sm leading-relaxed">
            <div className="flex gap-4 text-neutral-500">
              <div className="text-right select-none border-r border-neutral-800 pr-4">
                <div>12</div>
                <div>13</div>
                <div>14</div>
                <div>15</div>
              </div>
              <div className="flex-1">
                <div className="text-neutral-400">{'  return ('}</div>
                <div className="bg-red-500/10 text-red-400 px-2 -mx-2">{'    <div className="old-layout">'}</div>
                <div className="bg-emerald-500/10 text-emerald-400 px-2 -mx-2">{'    <div className="new-dashboard-layout flex">'}</div>
                <div className="text-neutral-400">{'      <Sidebar />'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Forceful Actions */}
        <div className="w-72 border-l border-neutral-800 bg-neutral-900/20 p-4 flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Forceful Actions
            </h2>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              When you need things done immediately without questions.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleNukeChanges}
                disabled={isWorking}
                className="w-full relative group overflow-hidden rounded-md bg-neutral-900 border border-red-900/30 hover:border-red-500/50 transition-all"
              >
                <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                <div className="relative p-3 flex items-center gap-3">
                  <div className="p-2 rounded bg-red-500/10 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-red-400">Nuke Changes</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">reset --hard & clean</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={handleForcePush}
                disabled={isWorking}
                className="w-full relative group overflow-hidden rounded-md bg-neutral-900 border border-amber-900/30 hover:border-amber-500/50 transition-all"
              >
                <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                <div className="relative p-3 flex items-center gap-3">
                  <div className="p-2 rounded bg-amber-500/10 text-amber-500">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-amber-400">Force Push</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">push --force-with-lease</div>
                  </div>
                </div>
              </button>
              
              <button 
                disabled={isWorking}
                className="w-full relative group overflow-hidden rounded-md bg-neutral-900 border border-indigo-900/30 hover:border-indigo-500/50 transition-all"
              >
                <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                <div className="relative p-3 flex items-center gap-3">
                  <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                    <GitMerge className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-indigo-400">Force Merge</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">merge -X theirs</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Glass Box Terminal */}
      <div className="h-64 border-t border-neutral-800 bg-[#0a0a0a] flex flex-col shrink-0">
        <div className="h-10 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/50">
          <div className="flex items-center gap-2 text-neutral-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Glass Box Terminal</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto font-mono text-[13px] leading-relaxed">
          {terminalLogs.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`${log.startsWith('>') ? 'text-emerald-400 mt-2 font-semibold' : 'text-neutral-400'}`}
            >
              {log || '\u00A0'}
            </motion.div>
          ))}
          {isWorking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-neutral-500 mt-2 flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              Executing...
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
