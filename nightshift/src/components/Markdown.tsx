/**
 * A deliberately small Markdown renderer.
 *
 * The Scribe writes headings, lists, bold, italics and inline code — nothing
 * more. Pulling in a full parser to render that would be more attack surface
 * and more bundle for no benefit. Input is escaped before any tag is
 * produced, so model output cannot inject markup.
 */

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text: string): string {
  return escape(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer noopener" class="underline decoration-ink-600 underline-offset-2 hover:text-white">$1</a>',
    )
}

export function Markdown({ source }: { source: string }) {
  const html: string[] = []
  let listOpen = false

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>')
      listOpen = false
    }
  }

  for (const raw of source.split('\n')) {
    const line = raw.trimEnd()

    if (!line.trim()) {
      closeList()
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    if (bullet) {
      if (!listOpen) {
        html.push('<ul>')
        listOpen = true
      }
      html.push(`<li>${inline(bullet[1])}</li>`)
      continue
    }

    closeList()

    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      const level = Math.min(heading[1].length + 1, 4)
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }

    html.push(`<p>${inline(line)}</p>`)
  }

  closeList()

  return <div className="prose-brief" dangerouslySetInnerHTML={{ __html: html.join('') }} />
}
