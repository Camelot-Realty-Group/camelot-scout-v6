export const DAVID_GOLDOFF_SIGNATURE_IMAGE = '/images/signatures/david-goldoff-signature.svg';

export const DAVID_GOLDOFF_SIGNATURE = {
  name: 'David A. Goldoff',
  title: 'President/Owner',
  company: 'Camelot Realty Group',
  executiveOffice: '501 Madison Avenue, 4th, New York, NY 10022',
  mainOffice: '57 West 57th Street, Suite 410, New York, NY 10019',
  phone: 'Office: (212) 206-9939 x701',
  fax: 'Fax: (212) 206-9939',
  email: 'dgoldoff@camelot.nyc',
  web: 'www.camelot.nyc',
  awards:
    'REBNY Community Service Award | RED Property Management Company of the Year | AMRF Golf Tournament Chief Sponsor',
};

export const DAVID_GOLDOFF_SIGNATURE_LINES = [
  DAVID_GOLDOFF_SIGNATURE.name,
  DAVID_GOLDOFF_SIGNATURE.title,
  '',
  DAVID_GOLDOFF_SIGNATURE.company,
  '',
  `Executive Office: ${DAVID_GOLDOFF_SIGNATURE.executiveOffice}`,
  `Main Office: ${DAVID_GOLDOFF_SIGNATURE.mainOffice}`,
  DAVID_GOLDOFF_SIGNATURE.phone,
  DAVID_GOLDOFF_SIGNATURE.fax,
  `Email: ${DAVID_GOLDOFF_SIGNATURE.email}`,
  `Web: ${DAVID_GOLDOFF_SIGNATURE.web}`,
  '',
  DAVID_GOLDOFF_SIGNATURE.awards,
];

export const DAVID_GOLDOFF_SIGNATURE_TEXT = DAVID_GOLDOFF_SIGNATURE_LINES.join('\n');

export function buildDavidGoldoffSignatureHtml(options?: { includeImage?: boolean }): string {
  const includeImage = options?.includeImage ?? true;
  const officeLine = `${DAVID_GOLDOFF_SIGNATURE.phone} &nbsp; | &nbsp; ${DAVID_GOLDOFF_SIGNATURE.fax}`;

  return `
    <div class="camelot-david-signature" style="margin-top:22px;font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.45">
      ${includeImage ? `<img src="${DAVID_GOLDOFF_SIGNATURE_IMAGE}" alt="David Goldoff signature" style="display:block;width:260px;max-width:70%;height:auto;margin:0 0 8px 0">` : ''}
      <div style="font-size:13px;font-weight:700">${DAVID_GOLDOFF_SIGNATURE.name}</div>
      <div style="font-size:11px;color:#333">${DAVID_GOLDOFF_SIGNATURE.title}</div>
      <div style="width:38px;height:2px;background:#C5A55A;margin:8px 0"></div>
      <div style="font-size:13px;font-weight:700">${DAVID_GOLDOFF_SIGNATURE.company}</div>
      <div style="font-size:11px;margin-top:8px"><strong>Executive Office:</strong><br>${DAVID_GOLDOFF_SIGNATURE.executiveOffice}</div>
      <div style="font-size:11px;margin-top:8px"><strong>Main Office:</strong><br>${DAVID_GOLDOFF_SIGNATURE.mainOffice}</div>
      <div style="font-size:11px;margin-top:8px">${officeLine}</div>
      <div style="font-size:11px;margin-top:4px">
        Email: <a href="mailto:${DAVID_GOLDOFF_SIGNATURE.email}" style="color:#B8973A">${DAVID_GOLDOFF_SIGNATURE.email}</a>
        &nbsp; Web: <a href="https://${DAVID_GOLDOFF_SIGNATURE.web}" style="color:#B8973A">${DAVID_GOLDOFF_SIGNATURE.web}</a>
      </div>
      <div style="font-size:10px;color:#555;margin-top:14px">${DAVID_GOLDOFF_SIGNATURE.awards}</div>
    </div>
  `;
}
