export type ContentChannel =
  | 'Blog'
  | 'Facebook'
  | 'LinkedIn'
  | 'Instagram'
  | 'X'
  | 'Email'
  | 'YouTube'
  | 'Short Video';

export type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'published' | 'failed' | 'stale';

export type ContentAudience = 'Boards' | 'Developers' | 'Investors' | 'Residents' | 'General';

export type ContentItem = {
  id: string;
  title: string;
  channel: ContentChannel;
  contentType: string;
  audience: ContentAudience;
  status: ContentStatus;
  scheduledAt: string;
  seoKeyword?: string;
  excerpt: string;
  body: string;
  cta: string;
  safetyFlags: string[];
  platformUrl?: string;
  score: number;
};

export type IntegrationSpec = {
  name: string;
  purpose: string;
  auth: string;
  status: 'ready_for_credentials' | 'planned' | 'manual_first' | 'connected';
};

export type CadenceRow = {
  day: string;
  blog: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  x: string;
  email: string;
  video: string;
};

export const CAMELOT_CONTENT_RULES = {
  company: 'Camelot Property Management',
  website: 'www.camelot.nyc',
  office: '57 West 57th Street, 4th Floor, New York, NY 10019',
  principal: 'David A. Goldoff, President & Founder',
  emails: ['dgoldoff@camelot.nyc', 'info@camelot.nyc'],
  phone: '(212) 206-9939',
  officeExtension: '701',
  forbidden: [
    'David personal cell phone number',
    'specific client financials unless explicitly approved',
    'negative competitor mentions by name',
    'political commentary',
    'guarantees of specific outcomes',
    'legal advice without attorney-consult caveat',
  ],
  required: [
    'Human approval before publishing',
    'Brand-safe content filter before review queue',
    'CTA to info@camelot.nyc or (212) 206-9939',
    'NYC-specific context for NYC topics',
    'Audit trail for approval, scheduling, publishing, and failure events',
  ],
};

export const CONTENT_INTEGRATIONS: IntegrationSpec[] = [
  { name: 'WordPress REST API', purpose: 'Publish blog articles to camelot.nyc', auth: 'Application Password', status: 'ready_for_credentials' },
  { name: 'Facebook Graph API', purpose: 'Post to Camelot Business Page', auth: 'Page Access Token', status: 'planned' },
  { name: 'LinkedIn Marketing API', purpose: 'Post to company and David profile', auth: 'OAuth 2.0', status: 'planned' },
  { name: 'Instagram Graph API', purpose: 'Publish photos, reels, and stories', auth: 'Facebook Business Token', status: 'planned' },
  { name: 'X API v2', purpose: 'Publish short market commentary', auth: 'OAuth 2.0', status: 'manual_first' },
  { name: 'Mailchimp Marketing API', purpose: 'Newsletter and drip campaigns', auth: 'API key', status: 'planned' },
  { name: 'YouTube Data API v3', purpose: 'Upload videos and metadata', auth: 'OAuth 2.0', status: 'planned' },
  { name: 'TikTok Content Posting API', purpose: 'Publish short video', auth: 'OAuth 2.0', status: 'planned' },
  { name: 'Google Analytics 4', purpose: 'Pull traffic and conversion analytics', auth: 'Service account', status: 'planned' },
  { name: 'OpenAI API', purpose: 'Generate drafts, repurpose content, and score safety', auth: 'API key', status: 'ready_for_credentials' },
  { name: 'SEMrush / Ahrefs', purpose: 'Keyword research and rank tracking', auth: 'API key', status: 'planned' },
];

export const CONTENT_CADENCE: CadenceRow[] = [
  { day: 'Monday', blog: 'Publish', facebook: 'Share article', linkedin: 'Thought leadership', instagram: 'Infographic', x: '2 posts', email: '-', video: '-' },
  { day: 'Tuesday', blog: '-', facebook: 'Community post', linkedin: '-', instagram: 'Property photo', x: '1 post', email: '-', video: '-' },
  { day: 'Wednesday', blog: 'Publish', facebook: 'Share article', linkedin: 'Market insight', instagram: 'Reel / Story', x: '2 posts', email: '-', video: 'Upload' },
  { day: 'Thursday', blog: '-', facebook: 'Testimonial', linkedin: 'Team spotlight', instagram: 'Behind scenes', x: '1 post', email: '-', video: '-' },
  { day: 'Friday', blog: 'Publish', facebook: 'Share article', linkedin: 'Industry news', instagram: 'Neighborhood', x: '2 posts', email: 'Monthly', video: '-' },
];

export const CONTENT_LIBRARY: ContentItem[] = [
  {
    id: 'market-pe-consolidation',
    title: 'The Great NYC Property Management Shakeup',
    channel: 'Blog',
    contentType: 'Market Insight',
    audience: 'Boards',
    status: 'pending_review',
    scheduledAt: nextDate(1, 10),
    seoKeyword: 'private equity property management NYC',
    excerpt: 'A board-facing article explaining how consolidation changes service quality, response time, and accountability.',
    body: 'Private equity consolidation is changing the way many NYC buildings experience property management. Camelot can use this piece to explain why direct senior attention, clean reporting, and local accountability matter to boards evaluating their options.',
    cta: 'Contact Camelot at info@camelot.nyc or (212) 206-9939 to discuss your building.',
    safetyFlags: ['No competitor names', 'No personal cell', 'CTA verified'],
    score: 91,
  },
  {
    id: 'newsletter-camelot-report',
    title: 'The Camelot Report: Monthly Board Brief',
    channel: 'Email',
    contentType: 'Newsletter',
    audience: 'Boards',
    status: 'draft',
    scheduledAt: nextDate(4, 9),
    seoKeyword: 'NYC property management newsletter',
    excerpt: 'Monthly email template for boards: market updates, compliance reminders, and Camelot operating notes.',
    body: 'This newsletter gives board members a concise read on local market conditions, compliance deadlines, recent Camelot insights, and one practical management tip they can use immediately.',
    cta: 'Reply to schedule a Zoom, Google Meet, or phone call with Camelot.',
    safetyFlags: ['Unsubscribe required before sending', 'No resident data', 'Office phone only'],
    score: 86,
  },
  {
    id: 'linkedin-reserve-funds',
    title: 'What Boards Should Know About Reserve Planning',
    channel: 'LinkedIn',
    contentType: 'Thought Leadership',
    audience: 'Boards',
    status: 'approved',
    scheduledAt: nextDate(2, 14),
    seoKeyword: 'condo reserve planning NYC',
    excerpt: 'A 200-word LinkedIn post about reserve discipline, capital planning, and avoiding emergency assessments.',
    body: 'Reserve planning is not just accounting. It is governance, asset preservation, and resident trust. Camelot can position this post around proactive capital planning and transparent reporting.',
    cta: 'Learn more at camelot.nyc.',
    safetyFlags: ['Under 3 hashtags', 'No guarantees', 'No legal advice'],
    score: 89,
  },
  {
    id: 'instagram-neighborhood',
    title: 'New York Company for New York Buildings',
    channel: 'Instagram',
    contentType: 'Neighborhood Spotlight',
    audience: 'General',
    status: 'scheduled',
    scheduledAt: nextDate(3, 11),
    excerpt: 'A photo-led post showing Camelot as a local operator with neighborhood familiarity.',
    body: 'Use neighborhood imagery, a concise caption, and a warm Camelot voice to reinforce that Camelot is a local team serving local buildings.',
    cta: 'Visit www.camelot.nyc.',
    safetyFlags: ['Image rights review required', 'Hashtags limited', 'No personal cell'],
    score: 82,
  },
];

export const CONTENT_ENGINE_PROMPT = `
Camelot Content Distribution Engine

Build content for Camelot Property Management with human approval before publishing. Every draft must pass brand safety, no personal cell number, no negative named competitor attacks, no client financial disclosures, and no legal advice without a caveat.

Channels: WordPress blog, Facebook, LinkedIn, Instagram, X, Mailchimp email, YouTube, TikTok/Reels.
Primary audiences: condo boards, co-op boards, developers, landlords, family offices, private equity, foreign investors, residents.
Strategic goals: client acquisition, SEO authority, market trust, and consistent Camelot brand presence.

Required CTA: info@camelot.nyc, dgoldoff@camelot.nyc, www.camelot.nyc, or (212) 206-9939. Never include David's personal cell phone number.

Workflow: Generated -> Pending Review -> Approved -> Scheduled -> Published -> Analytics. No auto-publish.
`.trim();

export function buildContentExport(items: ContentItem[] = CONTENT_LIBRARY) {
  return JSON.stringify(
    {
      rules: CAMELOT_CONTENT_RULES,
      cadence: CONTENT_CADENCE,
      integrations: CONTENT_INTEGRATIONS,
      content: items,
    },
    null,
    2
  );
}

function nextDate(daysFromNow: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}
