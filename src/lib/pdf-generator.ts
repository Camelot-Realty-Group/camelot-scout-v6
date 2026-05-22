/**
 * Client-side PDF/HTML/CSV helpers for Camelot OS reports
 */

function ensureHtmlBase(html: string): string {
  if (typeof window === 'undefined' || !window.location?.origin) return html;
  if (/<base\s/i.test(html)) return html;
  const baseTag = `<base href="${window.location.origin}/">`;
  return /<head[^>]*>/i.test(html)
    ? html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`)
    : `${baseTag}${html}`;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function embedPortableImages(html: string): Promise<string> {
  if (typeof window === 'undefined' || !window.location?.origin) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(ensureHtmlBase(html), 'text/html');
  const images = Array.from(doc.querySelectorAll<HTMLImageElement>('img[src]'));

  await Promise.all(images.map(async (img) => {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

    let absolute: URL;
    try {
      absolute = new URL(src, window.location.origin);
    } catch {
      return;
    }

    // Same-origin assets can be embedded so downloaded HTML opens cleanly offline.
    // Cross-origin listing/map/vendor images are left as absolute URLs because many
    // servers block browser-side fetches without CORS.
    if (absolute.origin !== window.location.origin) {
      img.setAttribute('src', absolute.href);
      return;
    }

    try {
      const response = await fetch(absolute.href);
      if (!response.ok) throw new Error(String(response.status));
      img.setAttribute('src', await blobToDataUrl(await response.blob()));
    } catch {
      img.setAttribute('src', absolute.href);
    }
  }));

  return `<!doctype html>\n${doc.documentElement.outerHTML}`;
}

/** Open HTML in a new tab for preview (no auto-print) */
export function openBrochureForPrint(html: string, filename: string): void {
  const win = window.open('', '_blank');
  if (!win) {
    const fallbackHtml = ensureHtmlBase(html);
    const blob = new Blob([fallbackHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = filename.endsWith('.html')
      ? filename
      : `${filename.replace(/\.(html|pdf)$/i, '')}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return;
  }
  win.document.write(ensureHtmlBase(html));
  win.document.close();
  win.document.title = filename.replace(/\.(html|pdf)$/i, '');
}

/** Download HTML string as an .html file */
export async function downloadAsHTML(html: string, filename: string): Promise<void> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const portableHtml = baseUrl
    ? await embedPortableImages(html
      .replace(/(src|href)=["']\.\/([^"']+)["']/g, `$1="${baseUrl}/$2"`)
      .replace(/(src|href)=["']\/([^"']+)["']/g, `$1="${baseUrl}/$2"`)
      .replace(/srcset=["']([^"']+)["']/g, (_match, value: string) => {
        const rewritten = value
          .split(',')
          .map((entry) => {
            const [url, descriptor] = entry.trim().split(/\s+/, 2);
            const absolute = url.startsWith('/') ? `${baseUrl}${url}` : url.startsWith('./') ? `${baseUrl}/${url.slice(2)}` : url;
            return descriptor ? `${absolute} ${descriptor}` : absolute;
          })
          .join(', ');
        return `srcset="${rewritten}"`;
      })
      .replace(/url\((['"]?)\/([^)'"]+)\1\)/g, `url($1${baseUrl}/$2$1)`)
    )
    : html;
  const blob = new Blob([portableHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Open a mail client with a prepared client-facing draft. Attachments still require manual attachment by the user. */
export function openEmailDraft(params: {
  to?: string;
  cc?: string;
  subject: string;
  body: string;
  preferGmail?: boolean;
}): void {
  const to = encodeURIComponent(params.to || '');
  const cc = params.cc ? `&cc=${encodeURIComponent(params.cc)}` : '';
  const subject = encodeURIComponent(params.subject);
  const body = encodeURIComponent(params.body);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${to}${cc}&su=${subject}&body=${body}`;
  const mailtoUrl = `mailto:${to}?subject=${subject}${cc}&body=${body}`;
  window.open(params.preferGmail === false ? mailtoUrl : gmailUrl, '_blank');
}

/** Download CSV string as a .csv file */
export function triggerCSVDownload(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Copy text to clipboard with fallback */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}
