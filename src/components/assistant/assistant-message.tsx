'use client';

import type { ReactNode } from 'react';

type Block =
  | { type: 'heading'; text: string; level: 1 | 2 | 3 | 4; section?: boolean }
  | { type: 'allocationLine'; text: string }
  | { type: 'bullet'; text: string; indent: number }
  | { type: 'numbered'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'spacer' };

type NumberedSection = { title: string; bullets: { text: string; indent: number }[] };

type RenderUnit = Block | { type: 'numberedSection'; title: string; bullets: NumberedSection['bullets'] };

function isSectionHeading(section?: boolean): boolean {
  return section === true;
}

function headingClassName(
  level: 1 | 2 | 3 | 4,
  hasContentAbove: boolean,
  section?: boolean,
): string {
  const spacing = !hasContentAbove
    ? ''
    : isSectionHeading(section)
      ? 'mt-5 '
      : 'mt-3 ';
  if (isSectionHeading(section)) {
    return `${spacing}text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`;
  }
  switch (level) {
    case 1:
      return `${spacing}text-base font-semibold text-slate-900 dark:text-white`;
    case 2:
      return `${spacing}text-sm font-semibold text-slate-800 dark:text-slate-100`;
    default:
      return `${spacing}text-xs font-semibold text-slate-600 dark:text-slate-300`;
  }
}

function parseInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*(.+?)\*\*$/);
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

function stripBoldMarkers(text: string): string {
  return text.replace(/\*\*/g, '').trim();
}

function isBoldOnlyLine(line: string): boolean {
  return /^\*\*(.+?)\*\*\s*$/.test(line.trim());
}

function isAllocationLine(text: string): boolean {
  const plain = stripBoldMarkers(text);
  return /^\d+%/.test(plain) || /^d[ií]zimo\b/i.test(plain);
}

function extractNumberedListContent(line: string): string | null {
  const trimmed = line.trim();
  const match = trimmed.match(/^\d+\.\s+(.+)$/);
  return match ? match[1].trim() : null;
}

function resolveNumberedTitle(block: Block): string | null {
  if (block.type === 'numbered') return block.text;
  if (block.type === 'heading' && block.section) return null;
  if (block.type === 'heading' || block.type === 'paragraph') {
    return extractNumberedListContent(block.text);
  }
  return null;
}

function isNumberedSectionSubContent(block: Block): boolean {
  if (resolveNumberedTitle(block) !== null) return false;
  if (block.type === 'heading') return false;
  if (block.type === 'bullet') return true;
  if (block.type === 'paragraph') return true;
  return false;
}

function blockToSubContent(block: Block): { text: string; indent: number } {
  if (block.type === 'bullet') return { text: block.text, indent: block.indent };
  if (block.type === 'paragraph' || block.type === 'heading') {
    return { text: block.text, indent: 0 };
  }
  return { text: '', indent: 0 };
}

function toAllocationLine(text: string): string {
  return text.trim();
}

function parseContent(content: string): Block[] {
  const blocks: Block[] = [];

  for (const rawLine of content.split('\n')) {
    if (!rawLine.trim()) {
      const last = blocks[blocks.length - 1];
      if (last?.type !== 'spacer') blocks.push({ type: 'spacer' });
      continue;
    }

    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    const atxHeadingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (atxHeadingMatch) {
      const level = atxHeadingMatch[1].length as 1 | 2 | 3 | 4;
      blocks.push({
        type: 'heading',
        text: atxHeadingMatch[2],
        level,
        section: level === 3,
      });
      continue;
    }

    const indentMatch = line.match(/^(\s*)([-•*])\s+(.+)$/);
    if (indentMatch) {
      const indent = Math.floor(indentMatch[1].length / 2);
      const bulletText = indentMatch[3].trim();

      if (indent === 0) {
        const numberedContent = extractNumberedListContent(bulletText);
        if (numberedContent !== null) {
          blocks.push({ type: 'numbered', text: numberedContent });
          continue;
        }
      }

      if (indent === 0 && isAllocationLine(bulletText)) {
        blocks.push({ type: 'allocationLine', text: toAllocationLine(bulletText) });
        continue;
      }

      blocks.push({ type: 'bullet', text: bulletText, indent });
      continue;
    }

    const numberedContent = extractNumberedListContent(trimmed);
    if (numberedContent !== null) {
      blocks.push({ type: 'numbered', text: numberedContent });
      continue;
    }

    if (/^\*\*.+\*\*/.test(trimmed)) {
      if (isBoldOnlyLine(trimmed)) {
        const plain = stripBoldMarkers(trimmed);
        if (isAllocationLine(plain)) {
          blocks.push({ type: 'allocationLine', text: trimmed });
          continue;
        }
        blocks.push({
          type: 'heading',
          text: plain,
          level: 3,
        });
        continue;
      }

      blocks.push({ type: 'paragraph', text: trimmed });
      continue;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  }

  return blocks;
}

/** Agrupa "1. Título" + bullets seguintes numa única seção numerada. */
function groupBlocks(blocks: Block[]): RenderUnit[] {
  const result: RenderUnit[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const numberedTitle = resolveNumberedTitle(block);
    if (numberedTitle !== null) {
      const bullets: { text: string; indent: number }[] = [];
      i++;
      while (i < blocks.length && isNumberedSectionSubContent(blocks[i])) {
        bullets.push(blockToSubContent(blocks[i]));
        i++;
      }
      result.push({ type: 'numberedSection', title: numberedTitle, bullets });
      continue;
    }
    result.push(block);
    i++;
  }

  return result;
}

/** Junta bullets/parágrafos órfãos à seção numerada anterior (fallback). */
function mergeOrphanSubContent(units: RenderUnit[]): RenderUnit[] {
  const result: RenderUnit[] = [];

  for (const unit of units) {
    const last = result[result.length - 1];

    if (
      last?.type === 'numberedSection' &&
      (unit.type === 'bullet' || unit.type === 'paragraph')
    ) {
      const indent = unit.type === 'bullet' ? unit.indent : 0;
      last.bullets.push({ text: unit.text, indent });
      continue;
    }

    result.push(unit);
  }

  return result;
}

function renderBulletList(items: { text: string; indent: number }[], key: string): ReactNode {
  return (
    <ul key={key} className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className={`flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 ${
            item.indent > 0 ? 'ml-4' : ''
          }`}
        >
          <span className="shrink-0 text-slate-500 dark:text-slate-400" aria-hidden>
            •
          </span>
          <span className="min-w-0">{parseInlineBold(item.text)}</span>
        </li>
      ))}
    </ul>
  );
}

function renderNumberedSections(sections: NumberedSection[], key: string): ReactNode {
  return (
    <ol key={key} className="mt-1.5 list-none space-y-3">
      {sections.map((section, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <span
            className="shrink-0 font-semibold text-slate-800 dark:text-slate-100"
            aria-hidden
          >
            {i + 1}.
          </span>
          <div className="min-w-0">
            <div className="text-slate-700 dark:text-slate-300">
              {parseInlineBold(section.title)}
            </div>
            {section.bullets.length > 0 && (
              <div className="mt-1.5 font-normal">
                {renderBulletList(section.bullets, `${key}-bullets-${i}`)}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function shouldSkipSpacer(prev: RenderUnit | undefined, next: RenderUnit | undefined): boolean {
  if (!prev || !next) return false;

  if (prev.type === 'numberedSection' && next.type === 'numberedSection') return true;

  if (prev.type === 'numberedSection' && next.type === 'heading') return true;

  if (prev.type === 'paragraph' && next.type === 'heading') return true;

  if (
    next.type === 'numberedSection' &&
    (prev.type === 'paragraph' || prev.type === 'heading')
  ) {
    return true;
  }

  if (
    prev.type === 'heading' &&
    (next.type === 'heading' ||
      next.type === 'paragraph' ||
      next.type === 'bullet' ||
      next.type === 'allocationLine')
  ) {
    return true;
  }

  return false;
}

export function AssistantMessage({ content }: { content: string }) {
  const blocks = parseContent(content);
  const units = mergeOrphanSubContent(groupBlocks(blocks));

  if (units.length === 0) {
    return <p className="text-sm leading-relaxed">{content}</p>;
  }

  const elements: ReactNode[] = [];
  let bulletGroup: { text: string; indent: number }[] = [];
  let numberedSections: NumberedSection[] = [];

  const flushBullets = (key: string) => {
    if (bulletGroup.length === 0) return;
    elements.push(renderBulletList(bulletGroup, key));
    bulletGroup = [];
  };

  const flushNumberedSections = (key: string) => {
    if (numberedSections.length === 0) return;
    elements.push(renderNumberedSections(numberedSections, key));
    numberedSections = [];
  };

  units.forEach((unit, index) => {
    if (unit.type === 'allocationLine') {
      flushBullets(`bullets-before-allocation-${index}`);
      flushNumberedSections(`numbered-before-allocation-${index}`);

      elements.push(
        <p
          key={`allocation-${index}`}
          className="text-sm leading-relaxed text-slate-800 dark:text-slate-200"
        >
          {parseInlineBold(unit.text)}
        </p>,
      );
      return;
    }

    if (unit.type === 'numberedSection') {
      flushBullets(`bullets-before-numbered-${index}`);
      numberedSections.push(unit);
      return;
    }

    if (unit.type === 'spacer') {
      const prev = units[index - 1];
      const next = units[index + 1];
      if (bulletGroup.length > 0 || numberedSections.length > 0 || shouldSkipSpacer(prev, next)) {
        return;
      }
      elements.push(<div key={`spacer-${index}`} className="h-2" aria-hidden />);
      return;
    }

    flushNumberedSections(`numbered-${index}`);

    if (unit.type === 'bullet') {
      bulletGroup.push({ text: unit.text, indent: unit.indent });
      return;
    }

    flushBullets(`bullets-${index}`);

    if (unit.type === 'heading') {
      flushBullets(`bullets-before-heading-${index}`);

      elements.push(
        <p
          key={`heading-${index}`}
          className={headingClassName(unit.level, elements.length > 0, unit.section)}
        >
          {parseInlineBold(unit.text)}
        </p>,
      );
      return;
    }

    elements.push(
      <p key={`para-${index}`} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {parseInlineBold(unit.text)}
      </p>,
    );
  });

  flushNumberedSections('numbered-end');
  flushBullets('bullets-end');

  return <div className="space-y-2">{elements}</div>;
}
