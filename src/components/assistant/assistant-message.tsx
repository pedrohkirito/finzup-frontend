'use client';

import type { ReactNode } from 'react';

type Block =
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string };

function parseInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {match[1]}
        </strong>
      );
    }
    return part;
  });
}

function parseContent(content: string): Block[] {
  const blocks: Block[] = [];

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const headingMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', text: headingMatch[1] });
      continue;
    }

    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', text: bulletMatch[1] });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  return blocks;
}

export function AssistantMessage({ content }: { content: string }) {
  const blocks = parseContent(content);

  if (blocks.length === 0) {
    return <p className="text-sm leading-relaxed">{content}</p>;
  }

  const elements: ReactNode[] = [];
  let bulletGroup: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletGroup.length === 0) return;
    elements.push(
      <ul key={key} className="mt-1 space-y-1 pl-4">
        {bulletGroup.map((text, i) => (
          <li key={i} className="relative text-sm leading-relaxed text-slate-700 before:absolute before:-left-3 before:content-['•'] dark:text-slate-300">
            {parseInlineBold(text)}
          </li>
        ))}
      </ul>,
    );
    bulletGroup = [];
  };

  blocks.forEach((block, index) => {
    if (block.type === 'bullet') {
      bulletGroup.push(block.text);
      return;
    }

    flushBullets(`bullets-${index}`);

    if (block.type === 'heading') {
      elements.push(
        <p
          key={`heading-${index}`}
          className={`text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
            index > 0 ? 'mt-3' : ''
          }`}
        >
          {block.text}
        </p>,
      );
      return;
    }

    elements.push(
      <p key={`para-${index}`} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {parseInlineBold(block.text)}
      </p>,
    );
  });

  flushBullets('bullets-end');

  return <div className="space-y-0.5">{elements}</div>;
}
