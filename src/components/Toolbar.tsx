import { useState } from 'react';
import type { GeneratedGroup } from '../types';

interface ToolbarProps {
  groups: GeneratedGroup[];
  title: string;
  presentMode: boolean;
  onRegenerate: () => void;
}

function formatGroupsAsText(groups: GeneratedGroup[], title: string): string {
  const lines: string[] = [];
  if (title) lines.push(title, '');
  groups.forEach((g) => {
    lines.push(`${g.label} (${g.students.length})`);
    g.students.forEach((s) => lines.push(`  ${s}`));
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}

function formatGroupsAsCsv(groups: GeneratedGroup[], title: string): string {
  const lines: string[] = [];
  if (title) lines.push(`"${title}"`);
  lines.push('Group,Student');
  groups.forEach((g) => {
    g.students.forEach((s) => {
      lines.push(`"${g.label}","${s}"`);
    });
  });
  return lines.join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Toolbar({
  groups,
  title,
  presentMode,
  onRegenerate,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatGroupsAsText(groups, title);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const text = formatGroupsAsText(groups, title);
    const filename = title ? `${title}.txt` : 'groups.txt';
    downloadFile(text, filename, 'text/plain');
  };

  const handleExportCsv = () => {
    const csv = formatGroupsAsCsv(groups, title);
    const filename = title ? `${title}.csv` : 'groups.csv';
    downloadFile(csv, filename, 'text/csv');
  };

  const btnBase = `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
    presentMode
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button onClick={onRegenerate} className={btnBase}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reshuffle
      </button>

      <button onClick={handleCopy} className={btnBase}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <button onClick={() => window.print()} className={btnBase}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>

      <button onClick={handleExportTxt} className={btnBase}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export .txt
      </button>

      <button onClick={handleExportCsv} className={btnBase}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export .csv
      </button>
    </div>
  );
}
