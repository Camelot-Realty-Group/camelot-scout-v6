import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const today = '2026-05-21';
const downloads = 'C:\\Users\\dgold\\Downloads';
const subject = '22 East 22nd Street';
const address = '22 East 22nd Street, New York, NY';
const htmlPath = path.join(downloads, `22-East-22nd-Street_CamelotBoardDeck__${today}.html`);
const pdfPath = path.join(downloads, `22-East-22nd-Street_CamelotBoardDeck__${today}.pdf`);
const propertyImagePath = 'G:\\My Drive\\Camelot Realty Group Company Files\\NEW BUSINESS - PROPOSALS\\22 East 22nd Street NYC\\22East22ndStreet_NYC.jpg';

function assetData(filePath, mimeFallback) {
  const bytes = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.svg' ? 'image/svg+xml' :
    ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
    ext === '.webp' ? 'image/webp' :
    ext === '.png' ? 'image/png' :
    mimeFallback;
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

const propertyImage = assetData(propertyImagePath, 'image/jpeg');
const logo = assetData(path.join(repoRoot, 'dist', 'images', 'camelot-logo-white.png'), 'image/webp');
const mdsLogo = assetData(path.join(repoRoot, 'dist', 'images', 'partners', 'mds.svg'), 'image/svg+xml');
const conciergeLogo = assetData(path.join(repoRoot, 'dist', 'images', 'partners', 'conciergeplus.svg'), 'image/svg+xml');
const bankLogo = assetData(path.join(repoRoot, 'dist', 'images', 'partners', 'bankunited.svg'), 'image/svg+xml');
const mdsReport = assetData(path.join(repoRoot, 'dist', 'images', 'partners', 'mds-sample-financial-report.png'), 'image/png');
const conciergePhoto = assetData(path.join(repoRoot, 'dist', 'images', 'services', 'front-desk-concierge.jpg'), 'image/jpeg');

const slides = [];

function bullets(items) {
  return `<ul class="bullets">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function footer(n) {
  return `<div class="footer"><span>Confidential - Camelot Property Management - Prepared ${today}</span><span>${n}</span></div>`;
}

function slide(title, eyebrow, body, extraClass = '') {
  const n = slides.length + 1;
  slides.push(`<section class="slide ${extraClass}">
    <div class="brand"><img src="${logo}" alt="Camelot"><span>CAMELOT</span></div>
    <div class="eyebrow">${eyebrow}</div>
    <h1>${title}</h1>
    ${body}
    ${footer(n)}
  </section>`);
}

slide(
  '22 East 22nd Street',
  'Board Meeting Deck - Camelot Property Management',
  `<div class="cover-grid">
      <div>
        <p class="lede">A concise board-facing discussion deck for an initial management conversation, property review, and Camelot operating plan.</p>
        <div class="chips"><span>${address}</span><span>Flatiron / Madison Square context</span><span>Prepared for board discussion</span></div>
        <p class="small">Prepared by Camelot Property Management. This deck is not a management agreement or final proposal; it is a meeting tool pending full building records, financials, board priorities, and source verification.</p>
      </div>
      <img class="hero-img" src="${propertyImage}" alt="${subject}">
    </div>`,
  'cover'
);

slide(
  'Why We Are Here',
  'Purpose of the Meeting',
  `<div class="two-col">
      <div class="panel">${bullets([
        'Introduce Camelot as a hands-on, New York-based management partner.',
        'Frame the initial facts, open questions, and items to verify before any final proposal.',
        'Discuss where management can add value: financial clarity, compliance discipline, vendor control, resident communication, and board support.'
      ])}</div>
      <div class="quote">Camelot approaches board transitions with a simple rule: facts must be source-aware, operations must be practical, and every recommendation should help the building run cleaner.</div>
    </div>`
);

slide(
  'Property Snapshot',
  'Initial Read - Items to Verify',
  `<div class="snapshot">
      <img src="${propertyImage}" alt="${subject}">
      <div class="stat-grid">
        <div><strong>Address</strong><span>${address}</span></div>
        <div><strong>Neighborhood</strong><span>Flatiron / Madison Square area</span></div>
        <div><strong>Building Profile</strong><span>Pre-war mid-rise residential profile - verify class, unit count, ownership, and current management records</span></div>
        <div><strong>Primary Records</strong><span>DOF, ACRIS, HPD, DOB, ECB/OATH, StreetEasy, PropertyShark-style ownership review</span></div>
      </div>
    </div>`
);

slide(
  'Initial Source Checklist',
  'What Camelot Verifies Before a Board-Facing Release',
  `<div class="check-grid">
      <div class="check"><b>Identity</b><span>Address, BBL, building class, legal owner, unit count, floor count, tax lot history.</span></div>
      <div class="check"><b>Governance</b><span>Board structure, managing agent, building staff, super/resident manager, vendors, professional services.</span></div>
      <div class="check"><b>Financial</b><span>Budget, arrears, reserve needs, bank relationships, insurance, utility spend, vendor contracts.</span></div>
      <div class="check"><b>Risk</b><span>HPD/DOB/ECB/OATH violations, open permits, facade, elevator, boiler, LL97, liens, litigation signals.</span></div>
    </div>`
);

slide(
  'Market Context',
  'Flatiron / Madison Square Location Intelligence',
  `<div class="map-grid">
      <div class="map-card">
        <div class="map-dot subject">22</div>
        <div class="map-line one"></div><div class="map-line two"></div><div class="map-line three"></div>
        <span class="map-label l1">Broadway</span><span class="map-label l2">Park Ave S</span><span class="map-label l3">Madison Sq</span><span class="map-label l4">5th Ave</span>
      </div>
      <div>${bullets([
        'Central Manhattan access supports fast senior-management deployment and vendor coverage.',
        'Nearby avenues and transit create strong resident convenience, leasing visibility, and comparable-building context.',
        'Neighborhood quality should be supported in the final report with market reports, sales comps, rental comps, school/crime/neighborhood data, and current listing history.'
      ])}</div>
    </div>`
);

slide(
  'Board Pain Points We Would Test',
  'Gut Check - Management and Operations',
  `<div class="cards3">
      <div class="card"><h3>Communication</h3><p>Response cadence, board packet quality, resident notices, issue escalation, and meeting follow-through.</p></div>
      <div class="card"><h3>Financial Control</h3><p>Monthly reporting, arrears, invoice approval, operating variance, reserve planning, and banking visibility.</p></div>
      <div class="card"><h3>Compliance</h3><p>Calendar ownership, violation tracking, permits, facade/elevator/boiler obligations, and recurring filings.</p></div>
    </div>
    <div class="bar-chart"><span style="width:88%">Board reporting cadence</span><span style="width:82%">Vendor accountability</span><span style="width:76%">Compliance visibility</span></div>`
);

slide(
  'Camelot Operating Model',
  'Boutique Attention + Institutional Systems',
  `<div class="model">
      <div><b>1</b><span>Senior oversight</span><small>Direct access to experienced decision-makers.</small></div>
      <div><b>2</b><span>Accounting bench</span><small>CPA-led controls, monthly packages, budget discipline.</small></div>
      <div><b>3</b><span>Compliance cadence</span><small>Tracked obligations, source checks, and clear action owners.</small></div>
      <div><b>4</b><span>Resident systems</span><small>Portal, tickets, communication, documents, and automation.</small></div>
      <div><b>5</b><span>Vendor control</span><small>Scopes, bids, COIs, schedule, progress, closeout.</small></div>
    </div>`
);

slide(
  'Financial Management Services',
  'Monthly Board-Ready Reporting',
  `<div class="two-col">
      <div>${bullets([
        'Monthly management reports targeted by the 20th to 25th of each month.',
        'Accounts payable, invoice controls, bank reconciliation, collections, arrears review, and variance commentary.',
        'CPA-supported accounting, tax-return coordination, budget planning, and reserve visibility.'
      ])}</div>
      <img class="report-img" src="${mdsReport}" alt="Sample financial report">
    </div>`
);

slide(
  'Resident and Board Technology',
  'Portal, Work Orders, Documents, Payments',
  `<div class="tech-grid">
      <div class="tech-logo"><img src="${conciergeLogo}" alt="ConciergePlus"><p>Resident portal, work orders, amenity requests, package/admin tracking, resident communications, and building documents.</p></div>
      <div class="tech-logo"><img src="${mdsLogo}" alt="MDS"><p>Property accounting, reporting packages, billing, collections, and financial controls.</p></div>
      <div class="tech-logo"><img src="${bankLogo}" alt="BankUnited"><p>Banking and treasury partner options, balance visibility, and association banking workflow support.</p></div>
    </div>`
);

slide(
  'Staffing and Front Desk Support',
  'Human Service Still Matters',
  `<div class="two-col">
      <img class="photo" src="${conciergePhoto}" alt="Front desk concierge">
      <div>${bullets([
        'Camelot can help boards evaluate front desk, porter, superintendent, and service coverage.',
        'Staffing should match building size, service expectations, labor structure, and budget reality.',
        'Where appropriate, Camelot can discuss fractional or supplemental support to improve coverage without overloading the operating budget.'
      ])}</div>
    </div>`
);

slide(
  'Compliance and Risk Controls',
  'NYC Source Stack',
  `<div class="risk-grid">
      <div><strong>HPD</strong><span>Complaints, violations, registration, litigation signals.</span></div>
      <div><strong>DOB / DOB NOW</strong><span>Permits, complaints, violations, equipment, facade and job filings.</span></div>
      <div><strong>ECB / OATH</strong><span>Summonses, penalties, hearing outcomes, unpaid balances.</span></div>
      <div><strong>DOF / ACRIS</strong><span>Tax status, liens, ownership, mortgages, transfers and recorded documents.</span></div>
    </div>
    <p class="small">The final board packet should not treat blank results as proof of no risk. Empty results are flagged for manual verification.</p>`
);

slide(
  'Vendor and Project Control',
  'How Camelot Prevents Drift',
  `<div class="workflow">
      <span>Scope</span><span>Bids</span><span>COIs</span><span>Schedule</span><span>Progress photos</span><span>Invoice approval</span><span>Closeout</span>
    </div>
    <div class="two-col">
      <div class="panel">${bullets([
        'Work should be documented, priced, insured, scheduled, supervised, and closed out.',
        'Camelot looks for savings in bidding, labor planning, materials, supplies, recurring contracts, utilities, and insurance coordination.',
        'The board gets cleaner visibility into what is urgent, what is optional, and what can be phased.'
      ])}</div>
      <div class="mini-chart"><b>Management Value Levers</b><span style="height:78%">Vendor bidding</span><span style="height:66%">Preventive maintenance</span><span style="height:58%">Admin automation</span><span style="height:72%">Compliance avoidance</span></div>
    </div>`
);

slide(
  '90-Day Transition Plan',
  'If the Board Elects to Move Forward',
  `<div class="timeline">
      <div><b>Days 1-30</b><p>Document collection, bank transition, vendor list, open items, board priorities, resident communication plan.</p></div>
      <div><b>Days 31-60</b><p>Reporting cadence, compliance calendar, contract review, work-order workflow, staff/vendor accountability.</p></div>
      <div><b>Days 61-90</b><p>Budget review, savings plan, reserve/capital roadmap, board dashboard, recurring meeting rhythm.</p></div>
    </div>`
);

slide(
  'Fee and Value Positioning',
  'Discussion Framework - Not Final Terms',
  `<div class="two-col">
      <div class="value-box"><b>Core fee strategy</b><p>Camelot positions base management pricing to show clear value against comparable market-rate management proposals, while final terms depend on records, scope, meeting cadence, staffing, building complexity, and board expectations.</p></div>
      <div class="value-box"><b>What we need next</b><p>Latest budget, audited financials or management report, insurance declaration page, vendor contracts, arrears, staff roster, rules, open projects, bank setup, and compliance calendar.</p></div>
    </div>
    <p class="small">Ancillary services and project work are documented separately where applicable and agreed with the client before work begins.</p>`
);

slide(
  'Contact',
  'Camelot Property Management',
  `<div class="contact">
      <h2>David A. Goldoff</h2>
      <p>Founder and President</p>
      <p><b>Office:</b> (212) 206-9939 ext. 701</p>
      <p><b>Email:</b> dgoldoff@camelot.nyc | info@camelot.nyc</p>
      <p><b>Web:</b> www.camelot.nyc</p>
      <p><b>Address:</b> 57 West 57th Street, Suite 410, New York, NY 10019</p>
      <div class="chips"><span>Confirm records</span><span>Review financials</span><span>Set board priorities</span><span>Schedule follow-up</span></div>
    </div>`,
  'final-slide'
);

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${subject} - Camelot Board Meeting Deck</title>
<style>
  @page { size: 13.333in 7.5in; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #d8d8d8; color: #101827; font-family: "Open Sans", Arial, sans-serif; }
  .slide { position: relative; width: 13.333in; height: 7.5in; page-break-after: always; overflow: hidden; background: #fbfaf6; padding: .62in .72in .48in; border-top: .08in solid #334554; }
  .slide.cover { background: linear-gradient(135deg, rgba(13,22,30,.96), rgba(51,69,84,.92)); color: white; border-top: 0; }
  .brand { position: absolute; top: .28in; right: .42in; width: 1.72in; height: .68in; background: #b99425; display: flex; align-items: center; justify-content: center; gap: .08in; color: #fff; letter-spacing: .11in; font-weight: 700; font-size: .12in; }
  .brand img { max-height: .32in; max-width: .62in; object-fit: contain; }
  .eyebrow { color: #b99425; text-transform: uppercase; letter-spacing: .08in; font-size: .13in; font-weight: 800; margin-bottom: .15in; padding-right: 1.9in; }
  h1 { font-family: Georgia, "Times New Roman", serif; color: #b99425; font-size: .42in; line-height: 1.03; margin: 0 0 .22in; font-weight: 500; }
  .cover h1 { color: #f7dc78; font-size: .68in; max-width: 5.2in; }
  h2 { margin: 0 0 .08in; font-size: .25in; }
  h3 { margin: 0 0 .08in; font-size: .19in; color: #0d1b2a; }
  p { font-size: .145in; line-height: 1.48; margin: 0 0 .12in; }
  .small { font-size: .1in; color: #667085; margin-top: .18in; }
  .cover .small { color: #dbe4ee; }
  .lede { font-size: .24in; line-height: 1.3; max-width: 5.5in; }
  .cover-grid, .two-col, .map-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .32in; align-items: center; }
  .hero-img { width: 5.55in; height: 5.35in; object-fit: cover; border: .04in solid rgba(255,255,255,.32); box-shadow: 0 .18in .35in rgba(0,0,0,.25); }
  .snapshot { display: grid; grid-template-columns: 4.25in 1fr; gap: .34in; align-items: stretch; }
  .snapshot img, .photo { width: 100%; height: 4.6in; object-fit: cover; border: .03in solid #d6c799; box-shadow: 0 .08in .18in rgba(0,0,0,.12); }
  .report-img { width: 4.2in; height: 4.5in; object-fit: cover; object-position: top; border: .02in solid #d6c799; }
  .stat-grid, .check-grid, .cards3, .risk-grid, .tech-grid { display: grid; gap: .16in; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .cards3 { grid-template-columns: repeat(3,1fr); }
  .check-grid, .risk-grid { grid-template-columns: repeat(2,1fr); }
  .tech-grid { grid-template-columns: repeat(3,1fr); }
  .stat-grid div, .check, .card, .panel, .tech-logo, .value-box { background: white; border: .015in solid #dfd6be; border-left: .04in solid #b99425; border-radius: .08in; padding: .18in; box-shadow: 0 .04in .1in rgba(16,24,40,.05); }
  .stat-grid strong, .check b, .value-box b { display: block; color: #0d1b2a; text-transform: uppercase; letter-spacing: .025in; font-size: .1in; margin-bottom: .06in; }
  .stat-grid span, .check span { font-size: .13in; line-height: 1.38; color: #334554; }
  .bullets { margin: 0; padding: 0 0 0 .22in; }
  .bullets li { font-size: .15in; line-height: 1.45; margin: 0 0 .12in; }
  .quote { background: #334554; color: white; padding: .32in; border-radius: .08in; font-family: Georgia, serif; font-size: .25in; line-height: 1.32; }
  .chips { display: flex; flex-wrap: wrap; gap: .08in; margin: .2in 0; }
  .chips span { border: .015in solid #d6c799; background: rgba(185,148,37,.12); color: inherit; border-radius: 999px; padding: .07in .12in; font-size: .105in; }
  .map-card { position: relative; height: 4.3in; border-radius: .12in; overflow: hidden; background: linear-gradient(135deg,#e8f0ec,#f8efd4); border: .02in solid #d7d0b8; }
  .map-card:before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(30deg,transparent 47%,rgba(51,69,84,.22) 48%,rgba(51,69,84,.22) 52%,transparent 53%), linear-gradient(120deg,transparent 47%,rgba(51,69,84,.18) 48%,rgba(51,69,84,.18) 52%,transparent 53%); background-size: 1.2in 1in; }
  .map-dot { position: absolute; left: 46%; top: 42%; width: .52in; height: .52in; border-radius: 50%; background: #c0392b; color: #fff; display: grid; place-items: center; font-weight: 800; box-shadow: 0 0 0 .08in rgba(192,57,43,.16); z-index: 2; }
  .map-line { position: absolute; background: rgba(185,148,37,.8); height: .05in; transform-origin: left; }
  .map-line.one { width: 4.2in; left: .4in; top: 1.2in; transform: rotate(-16deg); }
  .map-line.two { width: 4.8in; left: .55in; top: 3.2in; transform: rotate(18deg); }
  .map-line.three { width: 3.6in; left: 1.1in; top: 2.25in; transform: rotate(90deg); }
  .map-label { position: absolute; background: white; padding: .05in .09in; border-radius: .04in; font-size: .11in; color: #334554; border: .01in solid #d6c799; }
  .l1{left:.8in;top:.85in}.l2{right:.65in;top:2.85in}.l3{left:2.2in;bottom:.45in}.l4{right:.8in;top:.55in}
  .bar-chart { margin-top: .28in; display: grid; gap: .12in; }
  .bar-chart span { display: block; background: linear-gradient(90deg,#b99425,#334554); color: white; padding: .07in .1in; border-radius: 999px; font-size: .115in; font-weight: 700; }
  .model { display: grid; grid-template-columns: repeat(5,1fr); gap: .14in; margin-top: .2in; }
  .model div { min-height: 3.8in; background: white; border-top: .06in solid #b99425; padding: .22in .16in; box-shadow: 0 .04in .12in rgba(0,0,0,.08); }
  .model b { font-size: .42in; color: #b99425; display: block; }
  .model span { display: block; font-weight: 800; margin: .12in 0; font-size: .16in; }
  .model small { font-size: .115in; line-height: 1.45; color: #52616d; }
  .tech-logo img { height: .55in; max-width: 1.8in; object-fit: contain; margin-bottom: .18in; }
  .workflow { display: grid; grid-template-columns: repeat(7,1fr); gap: .06in; margin-bottom: .28in; }
  .workflow span { background: #334554; color: white; padding: .12in .07in; text-align: center; border-radius: .04in; font-size: .105in; font-weight: 800; }
  .mini-chart { height: 3.1in; background: white; border: .015in solid #dfd6be; border-radius: .08in; display: flex; gap: .13in; align-items: end; padding: .34in .22in .22in; position: relative; }
  .mini-chart b { position: absolute; top: .16in; left: .2in; font-size: .14in; }
  .mini-chart span { flex: 1; background: linear-gradient(180deg,#b99425,#334554); color: white; writing-mode: vertical-rl; text-orientation: mixed; font-size: .09in; border-radius: .04in .04in 0 0; text-align: center; padding: .06in; }
  .timeline { display: grid; grid-template-columns: repeat(3,1fr); gap: .2in; margin-top: .25in; }
  .timeline div { background: white; border: .015in solid #dfd6be; border-top: .06in solid #b99425; border-radius: .08in; padding: .22in; min-height: 3.5in; }
  .timeline b { display: block; color: #b99425; font-size: .22in; margin-bottom: .14in; }
  .contact { width: 8.2in; margin: .45in auto 0; text-align: center; background: #334554; color: white; padding: .5in; border-radius: .12in; }
  .contact h2 { color: #f7dc78; font-size: .44in; font-family: Georgia, serif; }
  .final-slide { background: linear-gradient(135deg,#0d1b2a,#334554); color: white; }
  .final-slide h1 { color: #f7dc78; }
  .footer { position: absolute; left: .72in; right: .72in; bottom: .2in; display: flex; justify-content: space-between; font-size: .085in; color: #8a8f98; border-top: .01in solid #dfd6be; padding-top: .07in; }
  .cover .footer, .final-slide .footer { color: #dbe4ee; border-color: rgba(255,255,255,.25); }
  @media print { body { background: white; } .slide { box-shadow: none; margin: 0; } }
</style>
</head>
<body>${slides.join('\n')}</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chrome = chromeCandidates.find((candidate) => fs.existsSync(candidate));
if (!chrome) {
  throw new Error('Chrome or Edge not found for PDF generation.');
}

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--print-to-pdf=${pdfPath}`,
  new URL(`file:///${htmlPath.replace(/\\/g, '/')}`).href
], { stdio: 'inherit' });

console.log(JSON.stringify({ htmlPath, pdfPath, slides: slides.length }, null, 2));
