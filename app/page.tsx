'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, GitBranch, GitCommit, GitMerge, AlertTriangle, 
  Trash2, RefreshCw, UploadCloud, DownloadCloud, FileText, 
  CheckCircle2, FolderGit2, Settings, Github, LogIn, 
  ChevronDown, X, Key, ShieldAlert, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ConfirmDialogState = {
  isOpen: boolean;
  title: string;
  message: string;
  action: () => void;
  actionText: string;
  isDestructive: boolean;
};

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
  const [isGithubLoggedIn, setIsGithubLoggedIn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeTargetBranch, setMergeTargetBranch] = useState('main');
  const [apiKey, setApiKey] = useState('');
  const [currentBranch, setCurrentBranch] = useState('feature/new-dashboard');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [repoPathInput, setRepoPathInput] = useState('/app/applet');
  const [activeRepo, setActiveRepo] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [repoError, setRepoError] = useState('');
  
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    actionText: '',
    isDestructive: false
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const executeCommand = async (command: string, optimisticLogs?: string[]) => {
    setIsWorking(true);
    setTerminalLogs(prev => [...prev, '', `> ${command}`]);
    
    try {
      const res = await fetch('/api/git/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeRepo, command })
      });
      
      const data = await res.json();
      
      if (data.stdout) {
        setTerminalLogs(prev => [...prev, ...data.stdout.trim().split('\n')]);
      }
      if (data.stderr) {
        setTerminalLogs(prev => [...prev, ...data.stderr.trim().split('\n')]);
      }
      if (data.error) {
        setTerminalLogs(prev => [...prev, `Error: ${data.error}`]);
      }
      
      refreshStatus();
    } catch (err: any) {
      setTerminalLogs(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setIsWorking(false);
    }
  };

  const refreshStatus = async () => {
    if (!activeRepo) return;
    try {
      const res = await fetch('/api/git/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: activeRepo })
      });
      const data = await res.json();
      if (res.ok) {
        setGitStatus(data);
        setCurrentBranch(data.currentBranch);
        setBranches(data.branches || []);
      }
    } catch (e) {}
  };

  const requestConfirmation = (
    title: string, 
    message: string, 
    actionText: string, 
    isDestructive: boolean, 
    action: () => void
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      actionText,
      isDestructive,
      action: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        action();
      }
    });
  };

  // --- Actions ---

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    executeCommand(`git commit -am "${commitMessage.replace(/"/g, '\\"')}"`);
    setCommitMessage('');
  };

  const handleNukeChanges = () => {
    requestConfirmation(
      "Nuke All Changes?",
      "This will forcefully permanently delete all uncommitted changes in your working directory. This action CANNOT be undone.",
      "Nuke It",
      true,
      () => executeCommand('git reset --hard HEAD && git clean -fd')
    );
  };

  const handleForcePush = () => {
    requestConfirmation(
      "Force Push to Remote?",
      "This will overwrite the remote branch with your local history. If others have pushed changes, their work will be lost.",
      "Force Push",
      true,
      () => executeCommand(`git push --force-with-lease origin ${currentBranch}`)
    );
  };

  const handleForceMerge = () => {
    requestConfirmation(
      "Force Merge (Theirs)?",
      "This will merge the target branch and automatically resolve ALL conflicts by accepting THEIR changes. Your conflicting changes will be lost.",
      "Force Merge",
      true,
      () => executeCommand('git merge main -X theirs')
    );
  };

  const handleClearStashes = () => {
    requestConfirmation(
      "Clear All Stashes?",
      "This will permanently delete ALL stashed changes. They cannot be recovered.",
      "Clear Stashes",
      true,
      () => executeCommand('git stash clear')
    );
  };

  const handleSync = () => {
    requestConfirmation(
      "Sync with Remote?",
      "This will fetch the latest changes from the remote and attempt to pull them into your current branch.",
      "Sync Now",
      false,
      () => executeCommand(`git fetch origin && git pull origin ${currentBranch}`)
    );
  };

  const handlePull = () => {
    requestConfirmation(
      "Pull from Remote?",
      "This will fetch and merge the latest changes from the remote branch into your current branch.",
      "Pull",
      false,
      () => executeCommand(`git pull origin ${currentBranch}`)
    );
  };

  const handlePush = () => {
    requestConfirmation(
      "Push to Remote?",
      "This will push your local commits to the remote repository.",
      "Push",
      false,
      () => executeCommand(`git push origin ${currentBranch}`)
    );
  };

  const handleCheckout = (branch: string) => {
    setIsBranchDropdownOpen(false);
    if (branch === currentBranch) return;
    requestConfirmation(
      "Force Switch Branch?",
      `This will forcefully switch to '${branch}'. Any uncommitted changes or conflicts blocking the switch will be discarded.`,
      "Force Switch",
      true,
      () => {
        executeCommand(`git checkout -f ${branch}`);
      }
    );
  };

  const handleMergeConfirm = () => {
    setIsMergeModalOpen(false);
    executeCommand(`git merge ${mergeTargetBranch}`);
  };

  const handleOpenRepo = async (path: string) => {
    if (!path.trim()) {
      setRepoError('Path cannot be empty');
      return;
    }
    setIsValidating(true);
    setRepoError('');
    
    try {
      const res = await fetch('/api/git/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setRepoError(data.error || 'Failed to open repository');
        setIsValidating(false);
        return;
      }
      
      setActiveRepo(path);
      setGitStatus(data);
      setCurrentBranch(data.currentBranch);
      setBranches(data.branches || []);
      setCurrentView('dashboard');
      setTerminalLogs([
        `> cd ${path}`,
        '> git status',
        `On branch ${data.currentBranch}`,
        data.files?.length === 0 ? 'nothing to commit, working tree clean' : `${data.files?.length} files changed`
      ]);
    } catch (err: any) {
      setRepoError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  if (currentView === 'home') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-300 font-sans selection:bg-indigo-500/30 p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
              GB
            </div>
            <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">GitBoss</h1>
            <p className="text-sm text-neutral-500 mt-2 text-center">The forceful Git GUI that actually listens to you.</p>
          </div>

          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-sm font-semibold text-neutral-200 mb-4 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              Open Repository
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Terminal className="w-4 h-4 text-neutral-500" />
                  </div>
                  <input 
                    type="text"
                    value={repoPathInput}
                    onChange={(e) => setRepoPathInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenRepo(repoPathInput)}
                    placeholder="/Users/boss/projects/awesome-app"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2.5 pl-10 pr-3 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                {repoError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {repoError}
                  </p>
                )}
              </div>

              <button 
                onClick={() => handleOpenRepo(repoPathInput)}
                disabled={isValidating || !repoPathInput.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isValidating ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Validating .git...</>
                ) : (
                  <>Open Directory</>
                )}
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">Recent</h3>
              <div className="space-y-2">
                {[
                  '/app/applet',
                ].map(path => (
                  <button 
                    key={path}
                    onClick={() => { setRepoPathInput(path); handleOpenRepo(path); }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-neutral-800/50 border border-transparent hover:border-neutral-700/50 transition-all text-left group"
                  >
                    <FolderGit2 className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-200 truncate">{path}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-300 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('home')}
              className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
              title="Back to Home"
            >
              GB
            </button>
            <div>
              <h1 className="text-sm font-semibold text-neutral-100 tracking-tight">GitBoss</h1>
              <div className="text-xs text-neutral-500 flex items-center gap-1">
                <FolderGit2 className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{activeRepo}</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-800 mx-2" />

          {/* Branch Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-800 transition-colors text-sm"
            >
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-neutral-200">{currentBranch}</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>

            <AnimatePresence>
              {isBranchDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-md shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                    Switch Branch
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {branches.map(b => (
                      <button
                        key={b}
                        onClick={() => handleCheckout(b)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${
                          b === currentBranch ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span className="truncate">{b}</span>
                        {b === currentBranch && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          {/* GitHub Login */}
          <button 
            onClick={() => setIsGithubLoggedIn(!isGithubLoggedIn)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors ${
              isGithubLoggedIn 
                ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white'
            }`}
          >
            <Github className="w-4 h-4" />
            {isGithubLoggedIn ? 'vleonardo2006' : 'Connect GitHub'}
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Working Tree */}
        <div className="w-80 border-r border-neutral-800 bg-neutral-900/20 flex flex-col">
          <div className="p-4 border-b border-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Working Tree</h2>
            
            <div className="space-y-1">
              {gitStatus?.files?.map((file: any) => {
                const isAdded = file.index === 'A' || file.working_dir === 'A' || file.working_dir === '?';
                const isDeleted = file.working_dir === 'D' || file.index === 'D';
                const statusChar = file.working_dir === '?' ? 'U' : (file.working_dir || file.index || 'M').trim();
                
                return (
                  <div key={file.path} className="flex items-center justify-between group px-2 py-1.5 hover:bg-neutral-800/50 rounded cursor-pointer">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className={`w-4 h-4 shrink-0 ${isAdded ? 'text-emerald-400' : isDeleted ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className="text-sm text-neutral-300 truncate">{file.path}</span>
                    </div>
                    <span className={`text-xs font-mono shrink-0 ${isAdded ? 'text-emerald-500' : isDeleted ? 'text-red-500' : 'text-amber-500'}`}>
                      {statusChar}
                    </span>
                  </div>
                );
              })}
              {(!gitStatus?.files || gitStatus.files.length === 0) && (
                <div className="text-sm text-neutral-500 italic px-2 py-4 text-center">
                  Working tree clean
                </div>
              )}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Commit</h2>
            <textarea 
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full flex-1 min-h-[120px] bg-neutral-900 border border-neutral-700 rounded-md p-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none mb-3"
              placeholder="What did you change, boss?"
            />
            <button 
              onClick={handleCommit}
              disabled={isWorking || !commitMessage.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Right Sidebar - Actions */}
        <div className="w-72 border-l border-neutral-800 bg-neutral-900/20 p-4 flex flex-col gap-8 overflow-y-auto">
          
          {/* Standard Remote Actions */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-emerald-400" />
              Branching
            </h2>
            <div className="space-y-2 mb-8">
              <button 
                onClick={() => setIsMergeModalOpen(true)}
                disabled={isWorking}
                className="w-full p-2.5 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                <GitMerge className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="text-sm font-medium text-neutral-200">Merge Branch</div>
                </div>
              </button>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-400" />
              Remote
            </h2>
            <div className="space-y-2">
              <button 
                onClick={handleSync}
                disabled={isWorking || !isGithubLoggedIn}
                className="w-full p-2.5 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <div className="text-left">
                  <div className="text-sm font-medium text-neutral-200">Sync</div>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={handlePull}
                  disabled={isWorking || !isGithubLoggedIn}
                  className="p-2.5 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                >
                  <DownloadCloud className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-300">Pull</span>
                </button>
                <button 
                  onClick={handlePush}
                  disabled={isWorking || !isGithubLoggedIn}
                  className="p-2.5 rounded-md bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-300">Push</span>
                </button>
              </div>
              {!isGithubLoggedIn && (
                <p className="text-[10px] text-amber-500/80 mt-2 text-center">Connect GitHub to enable remote actions</p>
              )}
            </div>
          </div>

          {/* Forceful Actions */}
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
                disabled={isWorking || !isGithubLoggedIn}
                className="w-full relative group overflow-hidden rounded-md bg-neutral-900 border border-amber-900/30 hover:border-amber-500/50 transition-all disabled:opacity-50"
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
                onClick={handleForceMerge}
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

              <button 
                onClick={handleClearStashes}
                disabled={isWorking}
                className="w-full relative group overflow-hidden rounded-md bg-neutral-900 border border-purple-900/30 hover:border-purple-500/50 transition-all"
              >
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                <div className="relative p-3 flex items-center gap-3">
                  <div className="p-2 rounded bg-purple-500/10 text-purple-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-purple-400">Clear Stashes</div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-0.5">stash clear</div>
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
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className={`p-4 border-b ${confirmDialog.isDestructive ? 'border-red-900/30 bg-red-500/5' : 'border-neutral-800 bg-neutral-800/20'} flex items-center gap-3`}>
                {confirmDialog.isDestructive ? (
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <h3 className="font-semibold text-neutral-100">{confirmDialog.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.action}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                    confirmDialog.isDestructive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {confirmDialog.actionText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neutral-400" />
                  <h3 className="font-semibold text-neutral-100">Settings</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-200 mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    AI Assistant Configuration
                  </h4>
                  <p className="text-xs text-neutral-500 mb-4">
                    Enter your Gemini API key to enable smart commit messages and conflict resolution assistance in the future.
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Gemini API Key</label>
                    <input 
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2.5 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

              </div>
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Merge Modal */}
      <AnimatePresence>
        {isMergeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-neutral-100">Merge Branch</h3>
                </div>
                <button 
                  onClick={() => setIsMergeModalOpen(false)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-neutral-300">
                  Select a branch to merge into <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">{currentBranch}</span>
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Branch to merge</label>
                  <select 
                    value={mergeTargetBranch}
                    onChange={(e) => setMergeTargetBranch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    {branches.filter(b => b !== currentBranch).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsMergeModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMergeConfirm}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Merge Branch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
