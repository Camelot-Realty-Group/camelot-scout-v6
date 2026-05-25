export type TwinKnowledgeProject = {
  id: string;
  name: string;
  workspaceId: string;
  twinStatus: string;
  latestRunStatus: string | null;
  hasInstructionBuild: boolean;
  lastActivityAt: string | null;
  deploymentState: string | null;
  instructionChars: number;
  contentHash: string | null;
  storageKey: string | null;
  purpose: string;
  headings: string[];
  planSteps: Array<{ title: string; description: string; order: number }>;
};

export const TWIN_KNOWLEDGE_IMPORTED_AT = "2026-05-25T22:29:33.465Z";

// Public-safe Twin AI knowledge catalog. Raw instruction bodies are intentionally
// not bundled into the static app because Render serves frontend assets publicly.
export const TWIN_KNOWLEDGE_PROJECTS: TwinKnowledgeProject[] = [
  {
    "id": "019e60da-30aa-75a0-a968-43f1e75eaec5",
    "name": "NBA Playoff Betting Analyst",
    "workspaceId": "019e60d9-615a-7db2-950a-526d9f62955a",
    "twinStatus": "exported",
    "latestRunStatus": null,
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-25T20:36:12.599334347+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019e48ee-cd14-72b3-8d76-0c4d20fcca00",
    "name": "Codex Prompt Generator",
    "workspaceId": "019e1a01-e09c-7153-b792-d507d9fdbae6",
    "twinStatus": "exported",
    "latestRunStatus": null,
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-21T05:07:50.174845479+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019e323c-3db2-72b1-b5f7-d7cd062840ac",
    "name": "Daily Ops & Follow-Up",
    "workspaceId": "019de654-433c-7e90-af4e-6bcc59976e80",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T11:09:55.887890754+00:00",
    "deploymentState": "draft",
    "instructionChars": 17099,
    "contentHash": "786541707423f2dad654cb73ff910a162afde7c8bf8a3de45bc3bd7e1134f9e7",
    "storageKey": "agents/019e323c-3db2-72b1-b5f7-d7cd062840ac/instructions/1778970426864-786541707423f2da.md",
    "purpose": "Daily Ops & Follow-Up agent for The Bradford and future construction projects. Runs daily at 7:00 AM ET. Scans Gmail for RFP responses, drafts follow-ups for non-responsive bidders, monitors permits/insurance/milestones, and sends daily (+ Monday weekly) digest emails to David and Beth. Reads from Project Master database (agent_id `019de669-a64c-7973-a36d-300d96b11fec`) via cross-agent queries. Uses Gmail polling (not webhooks). Follows draft-and-review pattern: never auto-sends follow-up emails to contractors without David's explicit approval.",
    "headings": [
      "Purpose",
      "Workflow",
      "Step 1: Load scan state and project data [[tool:query_database]]",
      "Details",
      "Column Reference for Project Master Tables",
      "Step 2: MODE 1 �?? RFP Response Scanner [[tool:gmail_search_emails]]",
      "Details",
      "Classification",
      "Inputs",
      "Edge Cases",
      "Step 3: MODE 2 �?? Non-Responsive Bidder Follow-Up [[tool:query_database]]",
      "Details",
      "Signature Block for Follow-Ups",
      "Step 4: MODE 3 �?? Permit & Insurance Expiration Scanner [[tool:query_database]]",
      "Details",
      "Step 5: MODE 4 �?? Milestone & Inspection Tracker [[tool:query_database]]",
      "Details",
      "Step 6: MODE 5 �?? Weekly Digest (Mondays Only) [[tool:send_email]]"
    ],
    "planSteps": [
      {
        "title": "Loading scan state and project data",
        "description": "Loading scan state and project data",
        "order": 0
      },
      {
        "title": "Scanning Gmail for new RFP responses",
        "description": "Scanning Gmail for new RFP responses",
        "order": 1
      },
      {
        "title": "Classifying email responses",
        "description": "Classifying email responses",
        "order": 2
      },
      {
        "title": "Checking non-responsive bidders for follow-up",
        "description": "Checking non-responsive bidders for follow-up",
        "order": 3
      },
      {
        "title": "Scanning permits and insurance expirations",
        "description": "Scanning permits and insurance expirations",
        "order": 4
      },
      {
        "title": "Tracking milestones and inspections",
        "description": "Tracking milestones and inspections",
        "order": 5
      },
      {
        "title": "Compiling digest content",
        "description": "Compiling digest content",
        "order": 6
      },
      {
        "title": "Sending daily/weekly digest emails",
        "description": "Sending daily/weekly digest emails",
        "order": 7
      },
      {
        "title": "Checking for follow-up approvals",
        "description": "Checking for follow-up approvals",
        "order": 8
      },
      {
        "title": "Sending approved follow-up emails",
        "description": "Sending approved follow-up emails",
        "order": 9
      }
    ]
  },
  {
    "id": "019e1a10-c677-7442-b536-f2a9be4b980d",
    "name": "Reputation Responder",
    "workspaceId": "019e1a01-e09c-7153-b792-d507d9fdbae6",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-12T03:43:10.240047324+00:00",
    "deploymentState": "draft",
    "instructionChars": 13388,
    "contentHash": "a48d4dd89721230fec0fceedc5de4a7c178f2e3ab17cca73af91a8ff09539d96",
    "storageKey": "agents/019e1a10-c677-7442-b536-f2a9be4b980d/instructions/1778557386383-a48d4dd89721230f.md",
    "purpose": "Draft legally cautious public responses, platform removal requests, and legal-escalation memos for Camelot Property Management / Camelot Realty Group reviews flagged by the Reputation Monitor agent, email them to David and Sam for approval, and track processed review IDs so no review is drafted twice.",
    "headings": [
      "Purpose",
      "Workflow",
      "Read prior processed reviews [[tool:query_database]]",
      "Read flagged source reviews [[tool:query_cross_agent_database]]",
      "Read positive source reviews [[tool:query_cross_agent_database]]",
      "Prepare draft inputs [[tool:execute_js]]",
      "Generate response and removal drafts [[tool:llm]]",
      "RESPOND drafts",
      "REPORT drafts",
      "LEGAL drafts",
      "THANK drafts",
      "Build approval email [[tool:execute_js]]",
      "Send approval email [[tool:send_email]]",
      "Store processed drafts [[tool:query_database]]",
      "Key Notes"
    ],
    "planSteps": [
      {
        "title": "Checking previously drafted reviews",
        "description": "Checking previously drafted reviews",
        "order": 0
      },
      {
        "title": "Reading flagged reviews",
        "description": "Reading flagged reviews",
        "order": 1
      },
      {
        "title": "Reading positive reviews",
        "description": "Reading positive reviews",
        "order": 2
      },
      {
        "title": "Selecting draft candidates",
        "description": "Selecting draft candidates",
        "order": 3
      },
      {
        "title": "Drafting review responses",
        "description": "Drafting review responses",
        "order": 4
      },
      {
        "title": "Building approval email",
        "description": "Building approval email",
        "order": 5
      },
      {
        "title": "Sending drafts for approval",
        "description": "Sending drafts for approval",
        "order": 6
      },
      {
        "title": "Recording processed review drafts",
        "description": "Recording processed review drafts",
        "order": 7
      }
    ]
  },
  {
    "id": "019e1a06-435b-7e80-a51a-6351c92af165",
    "name": "Reputation Monitor",
    "workspaceId": "019e1a01-e09c-7153-b792-d507d9fdbae6",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-21T12:07:21.667634155+00:00",
    "deploymentState": "draft",
    "instructionChars": 11364,
    "contentHash": "fed28376157efb03c7c208396dcde1125e9c85554aad1503c83cd725e2791f7e",
    "storageKey": "agents/019e1a06-435b-7e80-a51a-6351c92af165/instructions/1778553594557-fed28376157efb03.md",
    "purpose": "Monitor online reviews and mentions of Camelot Property Management across Reddit, Google Reviews, and Yelp. Analyze sentiment, classify severity, detect defamatory content, and email a daily report to the Camelot team. This agent monitors and reports only �?? it never posts responses or takes action on platforms.",
    "headings": [
      "Purpose",
      "Workflow",
      "Step 1: Check database for previously seen reviews [[tool:query_database]]",
      "Step 2: Scrape Reddit for mentions [[tool:scrape_platforms]]",
      "Details",
      "Edge Cases",
      "Step 3: Scrape Google Reviews [[tool:scrape_platforms]]",
      "Details",
      "Edge Cases",
      "Step 4: Scrape Yelp Reviews [[tool:scrape]]",
      "Details",
      "Step 5: Sentiment analysis and classification [[tool:llm]]",
      "Details",
      "Step 6: Deduplicate and store results [[tool:query_database]]",
      "Details",
      "Step 7: Send daily report email [[tool:send_email]]",
      "Details",
      "Key Notes"
    ],
    "planSteps": [
      {
        "title": "Checking database for known reviews",
        "description": "Checking database for known reviews",
        "order": 0
      },
      {
        "title": "Searching Reddit for Camelot mentions",
        "description": "Searching Reddit for Camelot mentions",
        "order": 1
      },
      {
        "title": "Fetching Google Reviews from Maps",
        "description": "Fetching Google Reviews from Maps",
        "order": 2
      },
      {
        "title": "Scraping Yelp reviews page",
        "description": "Scraping Yelp reviews page",
        "order": 3
      },
      {
        "title": "Analyzing sentiment and severity",
        "description": "Analyzing sentiment and severity",
        "order": 4
      },
      {
        "title": "Deduplicating and filtering results",
        "description": "Deduplicating and filtering results",
        "order": 5
      },
      {
        "title": "Storing new reviews in database",
        "description": "Storing new reviews in database",
        "order": 6
      },
      {
        "title": "Emailing reputation report to team",
        "description": "Emailing reputation report to team",
        "order": 7
      }
    ]
  },
  {
    "id": "019e0a95-402d-7d03-a39f-3d633013499b",
    "name": "Content Distribution Engine",
    "workspaceId": "019e013e-6a30-7530-857d-53a29186d4f9",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-20T18:01:03.660476972+00:00",
    "deploymentState": "draft",
    "instructionChars": 19112,
    "contentHash": "d96b193111b75e748c8081e21a47e8932fa674bd0dbb303717a306a971d48613",
    "storageKey": "agents/019e0a95-402d-7d03-a39f-3d633013499b/instructions/1778397366216-d96b193111b75e74.md",
    "purpose": "Distribute Camelot Property Management�??s email-approved content to LinkedIn personal profile and X/Twitter, generate Facebook and LinkedIn Company Page manual-paste posts for Sam, notify Camelot when posts go live, then track engagement and send a weekly performance report.",
    "headings": [
      "Purpose",
      "Workflow",
      "1. Check David�??s email approvals [[tool:search_gmail_approval_messages]] [[tool:get_gmail_approval_message]]",
      "Details",
      "2. Record approval status [[tool:query_database]]",
      "Details",
      "3. Query approved source content [[tool:query_cross_agent_database]]",
      "Details",
      "4. Compose Camelot-branded social copy [[tool:execute_js]]",
      "Universal branding and signature rules",
      "LinkedIn personal profile copy requirements",
      "X/Twitter copy requirements",
      "Manual Facebook and LinkedIn Company Page copy requirements",
      "5. Publish to LinkedIn personal profile [[tool:get_linkedin_profile]] [[tool:post_linkedin_text]]",
      "Details",
      "6. Publish to X/Twitter [[tool:create_x_tweet]] [[tool:pause_run_until]]",
      "Details",
      "7. Prepare Facebook and LinkedIn Company Page manual-paste posts [[tool:execute_js]] [[tool:send_email]]"
    ],
    "planSteps": [
      {
        "title": "Checking Gmail approvals",
        "description": "Checking Gmail approvals",
        "order": 0
      },
      {
        "title": "Parsing approved items",
        "description": "Parsing approved items",
        "order": 1
      },
      {
        "title": "Fetching approved content",
        "description": "Fetching approved content",
        "order": 2
      },
      {
        "title": "Publishing LinkedIn profile posts",
        "description": "Publishing LinkedIn profile posts",
        "order": 3
      },
      {
        "title": "Publishing X/Twitter posts",
        "description": "Publishing X/Twitter posts",
        "order": 4
      },
      {
        "title": "Emailing Sam manual posts",
        "description": "Emailing Sam manual posts",
        "order": 5
      },
      {
        "title": "Emailing publish confirmation",
        "description": "Emailing publish confirmation",
        "order": 6
      },
      {
        "title": "Tracking LinkedIn/X engagement",
        "description": "Tracking LinkedIn/X engagement",
        "order": 7
      },
      {
        "title": "Sending weekly report",
        "description": "Sending weekly report",
        "order": 8
      },
      {
        "title": "Recording run status",
        "description": "Recording run status",
        "order": 9
      }
    ]
  },
  {
    "id": "019e0831-737d-79f3-a4a8-d3e0e24e1933",
    "name": "Content Dashboard",
    "workspaceId": "019e013e-6a30-7530-857d-53a29186d4f9",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-21T14:05:52.614013187+00:00",
    "deploymentState": "draft",
    "instructionChars": 8541,
    "contentHash": "3b6a91481f0d6b3e54b0de509dd88a4a4481051290613973cc385d6173c3a78f",
    "storageKey": "agents/019e0831-737d-79f3-a4a8-d3e0e24e1933/instructions/1778254566607-3b6a91481f0d6b3e.md",
    "purpose": "Aggregate content data from Camelot Realty Group's two content agents (SEO & GBP Content Engine, LinkedIn Content Drafter) into a unified tracking dashboard. Compile metrics, detect topic overlap, surface untapped keywords, and deliver a summary email to David and Beth.",
    "headings": [
      "Purpose",
      "Step 1: Sync data from SEO & GBP Content Engine [[tool:query_cross_agent_database]]",
      "Details",
      "Step 2: Sync data from LinkedIn Content Drafter [[tool:query_cross_agent_database]]",
      "Details",
      "Step 3: Upsert aggregated records into dashboard database [[tool:query_database]]",
      "Details",
      "Step 4: Build dashboard spreadsheet [[tool:sheets]]",
      "Sections",
      "Step 5: Compute stats and compose email [[tool:execute_js]]",
      "Step 6: Send dashboard email [[tool:send_email]]",
      "Inputs",
      "Key Notes"
    ],
    "planSteps": [
      {
        "title": "Syncing SEO & GBP content data",
        "description": "Syncing SEO & GBP content data",
        "order": 0
      },
      {
        "title": "Syncing LinkedIn content data",
        "description": "Syncing LinkedIn content data",
        "order": 1
      },
      {
        "title": "Upserting aggregated dashboard records",
        "description": "Upserting aggregated dashboard records",
        "order": 2
      },
      {
        "title": "Updating dashboard spreadsheet",
        "description": "Updating dashboard spreadsheet",
        "order": 3
      },
      {
        "title": "Computing content stats and gaps",
        "description": "Computing content stats and gaps",
        "order": 4
      },
      {
        "title": "Emailing dashboard summary to David and Beth",
        "description": "Emailing dashboard summary to David and Beth",
        "order": 5
      }
    ]
  },
  {
    "id": "019e0275-062d-7eb1-8ebe-0e830032e53d",
    "name": "LinkedIn Content Drafter",
    "workspaceId": "019e013e-6a30-7530-857d-53a29186d4f9",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T07:57:40.972772906+00:00",
    "deploymentState": "draft",
    "instructionChars": 28424,
    "contentHash": "1a7ab07cf11b23c726a435afdeca9d2dde51b251c976463e84ead5eeb020b6aa",
    "storageKey": "agents/019e0275-062d-7eb1-8ebe-0e830032e53d/instructions/1778447652194-1a7ab07cf11b23c7.md",
    "purpose": "Generate weekly LinkedIn thought-leadership drafts for David A. Goldoff and Camelot Property Management that position Camelot as a leading NYC property management expert for condo boards, co-op boards, developers, landlords, and family offices, with approval-ready email delivery and LinkedIn posting tools ready for future approved publishing.",
    "headings": [
      "Purpose",
      "Workflow",
      "Check recent topic history [[tool:query_database]]",
      "Details",
      "Research timely NYC property issues [[tool:web_search]] [[tool:deep_research]]",
      "Research focus",
      "Quality bar",
      "Generate three LinkedIn post drafts [[tool:llm]]",
      "Required formats",
      "Monthly priority theme: Resident Management Groups & The People Behind the Buildings",
      "People-first tone",
      "Voice and content requirements",
      "Camelot action-step guidance",
      "Subliminal Camelot positioning",
      "Company context",
      "Generate one LinkedIn article outline [[tool:llm]]",
      "Outline requirements",
      "Select visuals and brand assets [[tool:scrape]] [[tool:file]] [[tool:generate_media]] [[tool:gmail_get_attachment]] [[tool:build_chart]]"
    ],
    "planSteps": [
      {
        "title": "Checking recent topic history",
        "description": "Checking recent topic history",
        "order": 0
      },
      {
        "title": "Researching timely NYC topics",
        "description": "Researching timely NYC topics",
        "order": 1
      },
      {
        "title": "Validating newsworthy angles",
        "description": "Validating newsworthy angles",
        "order": 2
      },
      {
        "title": "Drafting LinkedIn content",
        "description": "Drafting LinkedIn content",
        "order": 3
      },
      {
        "title": "Formatting approval-ready email",
        "description": "Formatting approval-ready email",
        "order": 4
      },
      {
        "title": "Saving content history",
        "description": "Saving content history",
        "order": 5
      },
      {
        "title": "Emailing drafts to recipients",
        "description": "Emailing drafts to recipients",
        "order": 6
      },
      {
        "title": "Preparing approved LinkedIn posting",
        "description": "Preparing approved LinkedIn posting",
        "order": 7
      }
    ]
  },
  {
    "id": "019e0140-d366-7ef1-82fb-94fe6348cd18",
    "name": "SEO & GBP Content Engine",
    "workspaceId": "019e013e-6a30-7530-857d-53a29186d4f9",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T17:01:29.118462716+00:00",
    "deploymentState": "draft",
    "instructionChars": 26724,
    "contentHash": "e1763f932f9e0c6ede0ccd544e28a1e0a8f50dad60c4f074a678ab864315659d",
    "storageKey": "agents/019e0140-d366-7ef1-82fb-94fe6348cd18/instructions/1778447805175-e1763f932f9e0c6e.md",
    "purpose": "Generate weekly SEO-optimized content for Camelot Property Management (www.camelot.nyc), a boutique NYC property management company at 57 West 57th Street, 4th Floor, New York, NY 10019. Owner: David A. Goldoff. Targets condo boards, co-op boards, developers, landlords, family offices, private equity firms, and foreign investors. Goal: rank for non-branded, high-intent keywords to drive discovery traffic, generate leads, and establish Camelot as the authority in NYC property management.",
    "headings": [
      "Purpose",
      "Workflow",
      "Step 1: Check Database for Existing Content [[tool:query_database]]",
      "Step 2: Research Trending Topics and Keywords [[tool:deep_research]] [[tool:web_search]]",
      "Step 3: Generate Blog Post [[tool:llm]]",
      "Subliminal Positioning �?? Camelot's Expertise Woven Into the Journalism",
      "Blog Structure",
      "Resident Management Groups Theme (when rotating this topic)",
      "Step 4: Generate GBP Posts and X/Twitter Posts [[tool:llm]]",
      "Step 5: Source and Download Real Images [[tool:scrape]] [[tool:file]]",
      "Image Sourcing Process",
      "Image Selection �?? Aim for 3-5 Real Images Per Article",
      "Attribution �?? Required for Every Image",
      "AI-Generated as Fallback Only",
      "Google Doc Image Layout",
      "Step 6: Create Google Doc [[tool:docs]]",
      "Step 7: Publish Blog Post to WordPress as Draft [[tool:computer_use_agent]]",
      "WordPress Details"
    ],
    "planSteps": [
      {
        "title": "Checking previous keywords and content",
        "description": "Checking previous keywords and content",
        "order": 0
      },
      {
        "title": "Researching trending NYC topics and keywords",
        "description": "Researching trending NYC topics and keywords",
        "order": 1
      },
      {
        "title": "Finding competitor content gaps",
        "description": "Finding competitor content gaps",
        "order": 2
      },
      {
        "title": "Generating SEO blog post with subliminal positioning",
        "description": "Generating SEO blog post with subliminal positioning",
        "order": 3
      },
      {
        "title": "Generating GBP posts and X/Twitter posts",
        "description": "Generating GBP posts and X/Twitter posts",
        "order": 4
      },
      {
        "title": "Sourcing real images from cited articles",
        "description": "Sourcing real images from cited articles",
        "order": 5
      },
      {
        "title": "Downloading source photos, charts, and maps",
        "description": "Downloading source photos, charts, and maps",
        "order": 6
      },
      {
        "title": "Recreating data charts from source data",
        "description": "Recreating data charts from source data",
        "order": 7
      },
      {
        "title": "Creating Google Doc with inline images",
        "description": "Creating Google Doc with inline images",
        "order": 8
      },
      {
        "title": "Publishing blog draft to WordPress",
        "description": "Publishing blog draft to WordPress",
        "order": 9
      },
      {
        "title": "Adding slide to homepage carousel",
        "description": "Adding slide to homepage carousel",
        "order": 10
      },
      {
        "title": "Generating SEO-ready HTML with meta tags",
        "description": "Generating SEO-ready HTML with meta tags",
        "order": 11
      }
    ]
  },
  {
    "id": "019de705-b75c-76a3-9921-c06514fb099d",
    "name": "Inbox Contact Miner",
    "workspaceId": "019de654-433c-7e90-af4e-6bcc59976e80",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-03T21:29:40.898465268+00:00",
    "deploymentState": "draft",
    "instructionChars": 17883,
    "contentHash": "8f7ce4d62f871c33187374ee2ffee6de6486e70c73677474357d144a7c86daf7",
    "storageKey": "agents/019de705-b75c-76a3-9921-c06514fb099d/instructions/1777727433045-8f7ce4d62f871c33.md",
    "purpose": "Mine the user's Gmail inbox (`dgoldoff@camelot.nyc`) for trade vendor contacts across 18 construction trades over a rolling 24-month window. Stage findings in a local `new_contacts_for_master` table that the **Project Master** agent (`019de669-a64c-7973-a36d-300d96b11fec`) pulls into its `contacts` table on its next run. High-recall mode �?? surface borderline matches and let the user prune later. **Do not perform any outreach.**",
    "headings": [
      "Purpose",
      "Architecture notes",
      "The 18 trades",
      "Workflow",
      "1. Open a new run record",
      "2. Phase 1 �?? Gmail search [[tool:gmail_search_emails]]",
      "3. Phase 2 �?? Fetch metadata + sender aggregation [[tool:gmail_get_email]]",
      "Sender filter (apply in this order)",
      "4. Phase 3 �?? Per-sender classification [[tool:gmail_get_email]] [[tool:llm]]",
      "5. Phase 4 �?? Routing decisions",
      "6. Phase 5 �?? Dedup against Project Master",
      "7. Phase 6 �?? Stage new contacts for Project Master",
      "8. Phase 7 �?? Generate report sheet [[tool:sheets]]",
      "9. Phase 8 �?? Email summary [[tool:send_email]]",
      "10. Phase 9 �?? Chat reply",
      "Caps and continuation",
      "Anti-patterns",
      "Key notes"
    ],
    "planSteps": [
      {
        "title": "Searching Gmail across 18 trades",
        "description": "Searching Gmail across 18 trades",
        "order": 0
      },
      {
        "title": "Fetching message metadata and bodies",
        "description": "Fetching message metadata and bodies",
        "order": 1
      },
      {
        "title": "Aggregating senders and applying filters",
        "description": "Aggregating senders and applying filters",
        "order": 2
      },
      {
        "title": "Classifying vendors per trade",
        "description": "Classifying vendors per trade",
        "order": 3
      },
      {
        "title": "Deduping against Project Master contacts",
        "description": "Deduping against Project Master contacts",
        "order": 4
      },
      {
        "title": "Staging new contacts for Project Master",
        "description": "Staging new contacts for Project Master",
        "order": 5
      },
      {
        "title": "Building Gmail Mining Report sheet",
        "description": "Building Gmail Mining Report sheet",
        "order": 6
      },
      {
        "title": "Emailing summary to dgoldoff and bethgoldoff",
        "description": "Emailing summary to dgoldoff and bethgoldoff",
        "order": 7
      }
    ]
  },
  {
    "id": "019de6a4-a1bf-7c41-a45a-ba6f3e4a6b16",
    "name": "Contractor Sourcing & RFP",
    "workspaceId": "019de654-433c-7e90-af4e-6bcc59976e80",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-03T21:33:29.672525075+00:00",
    "deploymentState": "draft",
    "instructionChars": 24025,
    "contentHash": "0015932dfb45928638c9a71f21b59f12676d7adcd22817c1a9fc83b3a44ad674",
    "storageKey": "agents/019de6a4-a1bf-7c41-a45a-ba6f3e4a6b16/instructions/1777691658687-0015932dfb459286.md",
    "purpose": "Source qualified contractor candidates within ~1 hour of a project site, manage RFP issuance, track responses, parse bid responses, build apples-to-apples bid comparison matrices, and flag exclusions for the Construction PM platform.",
    "headings": [
      "Purpose",
      "Architecture",
      "Local tables",
      "Cross-agent reads from Project Master",
      "Operating modes",
      "Mode 1 �?? Source candidates [[tool:scrape_platforms]]",
      "Inputs and lookups",
      "Search",
      "Filtering, dedup, ranking",
      "Persist",
      "Optional light enrichment",
      "Workbook refresh",
      "Reply",
      "Mode 2 �?? Issue RFP [[tool:send_email]]",
      "Eligible bidders",
      "Draft mode (default for first issuance)",
      "Send mode",
      "Mode 3 �?? Follow up [[tool:send_email]]"
    ],
    "planSteps": [
      {
        "title": "Reading project context from Project Master",
        "description": "Reading project context from Project Master",
        "order": 0
      },
      {
        "title": "Sourcing contractor candidates near site",
        "description": "Sourcing contractor candidates near site",
        "order": 1
      },
      {
        "title": "Deduping, ranking, and tiering candidates",
        "description": "Deduping, ranking, and tiering candidates",
        "order": 2
      },
      {
        "title": "Refreshing master workbook Contacts tab",
        "description": "Refreshing master workbook Contacts tab",
        "order": 3
      },
      {
        "title": "Issuing RFPs to bidders (after review)",
        "description": "Issuing RFPs to bidders (after review)",
        "order": 4
      },
      {
        "title": "Parsing bid PDFs and SOV line items",
        "description": "Parsing bid PDFs and SOV line items",
        "order": 5
      },
      {
        "title": "Scanning bids for exclusions and severity",
        "description": "Scanning bids for exclusions and severity",
        "order": 6
      },
      {
        "title": "Generating bid comparison summary",
        "description": "Generating bid comparison summary",
        "order": 7
      }
    ]
  },
  {
    "id": "019de669-a64c-7973-a36d-300d96b11fec",
    "name": "Project Master",
    "workspaceId": "019de654-433c-7e90-af4e-6bcc59976e80",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-17T00:36:46.345733183+00:00",
    "deploymentState": "draft",
    "instructionChars": 13630,
    "contentHash": "dbde49a7459ed07cb106c89f7ee60bd1b5622777c13ccaa4eaec47d8e957f6c5",
    "storageKey": "agents/019de669-a64c-7973-a36d-300d96b11fec/instructions/1777687520060-dbde49a7459ed07c.md",
    "purpose": "Project Master is the **system of record** for Camelot NYC construction projects. It owns the canonical SQLite database, maintains a master Google Sheets workbook per project, and produces the client-facing project packet (PDF + Excel + always-current Sheet link). It is Agent 1 of a 4-agent system. Agents 2 (Contractor Sourcing & RFP), 3 (Daily Ops & Follow-Up), and 4 (Budget & Payment Control) will read and write this database via cross-agent queries. Keep table and column names stable.",
    "headings": [
      "Purpose",
      "Recipients",
      "Defaults",
      "Database (read first, every run)",
      "Intents",
      "Seed/update project [name] [[tool:query_database]]",
      "Add contact [details] to project [name] [[tool:query_database]]",
      "Ingest [file] for project [name] [[tool:shell]]",
      "Extraction pipeline",
      "Exclusion scanning (contracts and proposals)",
      "Insurance verification (COI ingest)",
      "Generate project packet for [name] [[tool:send_email]]",
      "Verify insurance for project [name] [[tool:query_database]]",
      "Status of project [name] [[tool:query_database]]",
      "Check final payment gate for [name] [[tool:query_database]]",
      "Refresh step (always runs after writes) [[tool:sheets]]",
      "Workbook layout",
      "Refresh procedure"
    ],
    "planSteps": [
      {
        "title": "Reading project state from database",
        "description": "Reading project state from database",
        "order": 0
      },
      {
        "title": "Parsing uploaded contracts and COIs",
        "description": "Parsing uploaded contracts and COIs",
        "order": 1
      },
      {
        "title": "Classifying exclusions and verifying COI fields",
        "description": "Classifying exclusions and verifying COI fields",
        "order": 2
      },
      {
        "title": "Writing parsed rows to project tables",
        "description": "Writing parsed rows to project tables",
        "order": 3
      },
      {
        "title": "Refreshing master Google Sheets workbook",
        "description": "Refreshing master Google Sheets workbook",
        "order": 4
      },
      {
        "title": "Regenerating PDF project packet",
        "description": "Regenerating PDF project packet",
        "order": 5
      },
      {
        "title": "Emailing packet to Goldoff owners",
        "description": "Emailing packet to Goldoff owners",
        "order": 6
      }
    ]
  },
  {
    "id": "019de47e-a3b1-74d2-947f-0b42a2249c4f",
    "name": "Unnamed Twin Agent 019de47e",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": null,
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-01T17:03:41.542332435+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019de47e-83bf-75c2-b9ee-f68067f93e78",
    "name": "Unnamed Twin Agent 019de47e",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": null,
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-01T17:03:09.759078530+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019de47e-6961-7c90-8d73-ed8ea6103daa",
    "name": "Unnamed Twin Agent 019de47e",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": null,
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-01T17:03:03.009447052+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019de47e-2fbc-7231-a3ca-a22efb1426f5",
    "name": "Unnamed Twin Agent 019de47e",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": null,
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-01T17:02:48.252141531+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019de47b-ed5c-7b70-b82f-c12a861da4fc",
    "name": "Morgan �?? Finance",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "error",
    "hasInstructionBuild": false,
    "lastActivityAt": "2026-05-01T23:06:19.720031744+00:00",
    "deploymentState": "draft",
    "instructionChars": 0,
    "contentHash": null,
    "storageKey": null,
    "purpose": "Twin project exported without instruction content.",
    "headings": [],
    "planSteps": []
  },
  {
    "id": "019de0ac-42db-7b30-8bef-3580d073feb0",
    "name": "Tristan �?? Relationships",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T11:37:09.263380949+00:00",
    "deploymentState": "draft",
    "instructionChars": 19904,
    "contentHash": "637ac8e6824eab344ddee53df3424f3c6c5716836e95418ab9d8089d205c4360",
    "storageKey": "agents/019de0ac-42db-7b30-8bef-3580d073feb0/instructions/1777594732863-637ac8e6824eab34.md",
    "purpose": "Tristan is the **Relationship and CRM Hub** for the Camelot OS bot ecosystem �?? the single source of truth for every stakeholder Camelot interacts with (brokers, attorneys, vendors, board members, residents, prospects, owners, contractors, regulators, internal staff, developers).",
    "headings": [
      "Purpose",
      "Sister-bot sources",
      "Day-1 signal availability (verify before relying)",
      "Workflow �?? daily 7:30 AM ET full graph rebuild",
      "Step 1 �?? read cursors and pull deltas from each sister bot",
      "Step 2 �?? extract candidate entities with `[[tool:execute_js]]`",
      "Normalization",
      "Person vs organization classifier",
      "Per-source extraction",
      "Step 3 �?? entity resolution",
      "Step 4 �?? persist via batched `INSERT OR IGNORE`",
      "Step 5 �?? compute `relationship_health`",
      "Step 6 �?? watchlist rules",
      "Step 7 �?? render and send the daily Pulse",
      "Step 8 �?? record the run",
      "Workflow �?? weekly Friday 5:00 PM ET digest",
      "Anti-patterns",
      "Key notes"
    ],
    "planSteps": [
      {
        "title": "Reading from 6 sister-bot databases",
        "description": "Reading from 6 sister-bot databases",
        "order": 0
      },
      {
        "title": "Parsing names into persons and organizations",
        "description": "Parsing names into persons and organizations",
        "order": 1
      },
      {
        "title": "Persisting graph and computing health",
        "description": "Persisting graph and computing health",
        "order": 2
      },
      {
        "title": "Sending Relationship Pulse to info@camelot.nyc",
        "description": "Sending Relationship Pulse to info@camelot.nyc",
        "order": 3
      }
    ]
  },
  {
    "id": "019ddfa1-15b6-7f82-9929-b975ef5503fc",
    "name": "Sentinel �?? Enforcement",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T10:03:05.665610696+00:00",
    "deploymentState": "draft",
    "instructionChars": 17751,
    "contentHash": "73fd87f0950cc5870dea2e34d582db0c1e2735bec2a1755242b57f5db2268c6b",
    "storageKey": "agents/019ddfa1-15b6-7f82-9929-b975ef5503fc/instructions/1777573827938-73fd87f0950cc587.md",
    "purpose": "Sentinel is the Camelot OS audit, enforcement, and silent-failure watchdog. It observes the five sister bots (Excalibur, Bedivere, Galahad, Scout, Camelot Code Agent), enforces the seven Camelot OS principles, detects silent failures (schedule defined but never firing, run marked SUCCESS but no data, email \"sent\" with empty payload), and reports to **info@camelot.nyc**. Sentinel never initiates business action and never writes to another bot's database.",
    "headings": [
      "Purpose",
      "Run modes",
      "Monitored bots and their agent IDs",
      "Workflow �?? audit_sweep",
      "Step 1 �?? Read recent runs from every sister bot",
      "Step 2 �?? Read supporting data for Rules 3, 4, 7, 8",
      "Step 3 �?? Read Sentinel-side state needed to apply rules",
      "Step 4 �?? Apply enforcement rules",
      "Rule 1 �?? Schedule liveness (PRIORITY)",
      "Rule 2 �?? No bypass / partner abstraction",
      "Rule 3 �?? Data first (no fabrication)",
      "Rule 4 �?? Revenue capture",
      "Rule 5 �?? Human-centered experience",
      "Rule 6 �?? Authorization boundary",
      "Rule 7 �?? Email delivery health",
      "Rule 8 �?? Cross-bot read integrity",
      "Step 5 �?? Persist findings, sweep run, and posture scores",
      "Step 6 �?? Send immediate alerts for new CRITICAL findings"
    ],
    "planSteps": [
      {
        "title": "Reading recent runs from each sister bot",
        "description": "Reading recent runs from each sister bot",
        "order": 0
      },
      {
        "title": "Applying audit rules and computing findings",
        "description": "Applying audit rules and computing findings",
        "order": 1
      },
      {
        "title": "Persisting findings, sweep run, and posture scores",
        "description": "Persisting findings, sweep run, and posture scores",
        "order": 2
      },
      {
        "title": "Emailing critical alerts or weekly report",
        "description": "Emailing critical alerts or weekly report",
        "order": 3
      },
      {
        "title": "Charting compliance posture trend",
        "description": "Charting compliance posture trend",
        "order": 4
      }
    ]
  },
  {
    "id": "019dde9f-7ebc-7dc3-b3d9-a3b032d928eb",
    "name": "Scout �?? Data Backbone",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T10:07:37.658222640+00:00",
    "deploymentState": "draft",
    "instructionChars": 20365,
    "contentHash": "9615b39302ed0e8da210eeb567b28d3ddda39027b4c3c4fbbb0a428a548fb31b",
    "storageKey": "agents/019dde9f-7ebc-7dc3-b3d9-a3b032d928eb/instructions/1777557388023-9615b39302ed0e8d.md",
    "purpose": "Camelot Scout is the **real-time data gathering and anomaly detection backbone** for the Camelot OS bot ecosystem. Every other Camelot bot (Bedivere, Galahad, Excalibur, Avalon, Morgan, Nimue, Tristan, Arthur, Sentinel, Jackie, Guinevere, Percival, Merlin) reads from Scout's database. Scout pre-fetches NYC Open Data feeds, normalizes them into `scout_feeds`, computes anomalies, and serves them via cross-agent reads.",
    "headings": [
      "Purpose",
      "Architecture",
      "Sister-bot databases (cross-read only �?? never write)",
      "Scout-owned tables (`scout_*` namespace)",
      "Connectors",
      "LIVE (NYC Open Data �?? public, no auth)",
      "PENDING (never call)",
      "Workflow",
      "Hourly weekday scan �?? `hourly_scan` (`run_type='hourly_scan'`)",
      "1. Load registry and cursors �?? [[tool:query_cross_agent_database]] [[tool:query_database]]",
      "2. Build per-feed SODA URLs �?? [[tool:execute_js]]",
      "3. Fetch all six feeds in parallel �?? [[tool:fetch_soda_url]]",
      "4. Normalize and insert �?? [[tool:execute_js]] [[tool:query_database]]",
      "5. Compute anomalies �?? [[tool:query_database]]",
      "6. Persist run state �?? [[tool:query_database]]",
      "7. Send immediate critical alerts �?? [[tool:get_message_templates]] [[tool:send_email]]",
      "Daily Pulse digest �?? `daily_pulse` (`run_type='daily_pulse'`)",
      "1. Aggregate prior 24h �?? [[tool:query_database]]"
    ],
    "planSteps": [
      {
        "title": "Reading Bedivere's 39 managed buildings",
        "description": "Reading Bedivere's 39 managed buildings",
        "order": 0
      },
      {
        "title": "Building per-feed SODA URLs for managed buildings",
        "description": "Building per-feed SODA URLs for managed buildings",
        "order": 1
      },
      {
        "title": "Fetching 6 NYC Open Data feeds in parallel",
        "description": "Fetching 6 NYC Open Data feeds in parallel",
        "order": 2
      },
      {
        "title": "Normalizing and address-matching event records",
        "description": "Normalizing and address-matching event records",
        "order": 3
      },
      {
        "title": "Inserting events and computing anomalies",
        "description": "Inserting events and computing anomalies",
        "order": 4
      },
      {
        "title": "Sending immediate critical anomaly alerts",
        "description": "Sending immediate critical anomaly alerts",
        "order": 5
      },
      {
        "title": "Sending daily Camelot Scout Pulse digest",
        "description": "Sending daily Camelot Scout Pulse digest",
        "order": 6
      },
      {
        "title": "Updating cursors, run log, and connector health",
        "description": "Updating cursors, run log, and connector health",
        "order": 7
      }
    ]
  },
  {
    "id": "019dde6b-f1cf-75c3-aa27-1d759cb00219",
    "name": "Galahad �?? Compliance",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T10:37:45.846369773+00:00",
    "deploymentState": "draft",
    "instructionChars": 17390,
    "contentHash": "d6c5f8c9c0c222040b0af3d36b25cdd6ef920bf31884d7da5aad5ec9978f52f0",
    "storageKey": "agents/019dde6b-f1cf-75c3-aa27-1d759cb00219/instructions/1777553813701-d6c5f8c9c0c22204.md",
    "purpose": "Galahad is the **NYC Compliance Domain agent** for Camelot Realty Group. It continuously tracks, surfaces, and packages compliance obligations across LL97, HPD, DOB, FISP / LL11, LL152, CBA, and the broader NYC Local Law set for Camelot's residential portfolio. It produces a daily 6:30 AM America/New_York branded **\"Galahad Compliance Brief\"** email to `info@camelot.nyc` and supports on-demand audit prep packets for individual buildings.",
    "headings": [
      "Purpose",
      "Inputs and Constants",
      "Workflow",
      "1. Read Bedivere registry and connector context",
      "2. Empty-registry guard",
      "3. Per-building violation and permit scan (when registry is non-empty)",
      "Address parsing",
      "Fetch open HPD violations",
      "Fetch open DOB violations",
      "Fetch active DOB permits",
      "Degraded mode",
      "4. Compute LL97 penalty estimates",
      "5. Project upcoming filing deadlines",
      "6. Compose and send the daily brief",
      "7. Log the run",
      "Audit Packet Mode",
      "Anti-patterns",
      "Persistent State"
    ],
    "planSteps": [
      {
        "title": "Reading Bedivere properties registry",
        "description": "Reading Bedivere properties registry",
        "order": 0
      },
      {
        "title": "Scanning HPD open violations per building",
        "description": "Scanning HPD open violations per building",
        "order": 1
      },
      {
        "title": "Scanning DOB violations per building",
        "description": "Scanning DOB violations per building",
        "order": 2
      },
      {
        "title": "Scanning DOB active permits per building",
        "description": "Scanning DOB active permits per building",
        "order": 3
      },
      {
        "title": "Computing LL97 carbon penalty estimates",
        "description": "Computing LL97 carbon penalty estimates",
        "order": 4
      },
      {
        "title": "Projecting upcoming filing deadlines",
        "description": "Projecting upcoming filing deadlines",
        "order": 5
      },
      {
        "title": "Sending Galahad Compliance Brief to info@camelot.nyc",
        "description": "Sending Galahad Compliance Brief to info@camelot.nyc",
        "order": 6
      },
      {
        "title": "Logging run in galahad_runs",
        "description": "Logging run in galahad_runs",
        "order": 7
      }
    ]
  },
  {
    "id": "019ddca4-4d74-7272-8729-3e3779ccfdf6",
    "name": "Camelot Code Agent",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-21T13:02:51.960404258+00:00",
    "deploymentState": "draft",
    "instructionChars": 14483,
    "contentHash": "8bdbf5ba2e44687201f8dfd8c1348d2be96665318e047b25c568e6414bd1012d",
    "storageKey": "agents/019ddca4-4d74-7272-8729-3e3779ccfdf6/instructions/1777525011055-8bdbf5ba2e446872.md",
    "purpose": "Automate safe GitHub pull-request work for Camelot Realty Group's repositories so Camelot Scout v6 dashboard and Camelot OS bot changes move through reviewed PRs, CI checks, audit logging, and branded activity emails.",
    "headings": [
      "Purpose",
      "Workflow",
      "Classify the request",
      "Read persistent state [[tool:query_database]]",
      "Explore target repositories [[tool:github_list_repo_contents]] [[tool:github_get_file_contents]] [[tool:github_get_branch]]",
      "Validate request scope",
      "Create a feature branch [[tool:github_create_branch]]",
      "Write code changes [[tool:github_create_or_update_file]]",
      "Open the PR [[tool:github_create_pull_request]]",
      "What changed",
      "Why",
      "Files modified",
      "How to test",
      "Linked Twin agent (if applicable)",
      "Cross-repo PR (if applicable)",
      "Auto-merge eligibility: YES (new page addition) | NO (requires manual review)",
      "Coordinate cross-repo work [[tool:github_create_pull_request]] [[tool:github_update_pull_request]] [[tool:github_create_issue_comment]]",
      "Classify and merge safely [[tool:github_list_pull_request_files]] [[tool:github_get_pr_checks_status]] [[tool:github_merge_pull_request]]"
    ],
    "planSteps": [
      {
        "title": "Reading saved PR state",
        "description": "Reading saved PR state",
        "order": 0
      },
      {
        "title": "Exploring target repositories",
        "description": "Exploring target repositories",
        "order": 1
      },
      {
        "title": "Creating safe feature branches",
        "description": "Creating safe feature branches",
        "order": 2
      },
      {
        "title": "Writing focused code changes",
        "description": "Writing focused code changes",
        "order": 3
      },
      {
        "title": "Opening reviewed pull requests",
        "description": "Opening reviewed pull requests",
        "order": 4
      },
      {
        "title": "Classifying merge eligibility",
        "description": "Classifying merge eligibility",
        "order": 5
      },
      {
        "title": "Checking CI status",
        "description": "Checking CI status",
        "order": 6
      },
      {
        "title": "Squash-merging eligible PRs",
        "description": "Squash-merging eligible PRs",
        "order": 7
      },
      {
        "title": "Sending Camelot audit emails",
        "description": "Sending Camelot audit emails",
        "order": 8
      },
      {
        "title": "Saving run results",
        "description": "Saving run results",
        "order": 9
      }
    ]
  },
  {
    "id": "019ddc65-1953-74a2-b635-d4e8f59679df",
    "name": "Bedivere �?? Ops Hub",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-22T11:01:00.116034467+00:00",
    "deploymentState": "draft",
    "instructionChars": 17485,
    "contentHash": "2ff71a87e836a0c717ee32ae9e543de770fa93ac398544aee7c216a32a8dc155",
    "storageKey": "agents/019ddc65-1953-74a2-b635-d4e8f59679df/instructions/1777550311271-2ff71a87e836a0c7.md",
    "purpose": "Bedivere is the staff-facing daily operations bot for **Camelot Realty Group**. It consolidates work-order, vendor, document, and property-operations signals from Camelot's tech stack into a single morning email �?? the **Camelot Operations Pulse** �?? sent to `info@camelot.nyc` weekday mornings at 7:00 AM ET.",
    "headings": [
      "Purpose",
      "Connector policy",
      "Fleet registry",
      "Workflow",
      "1. Read configuration and connector state from the database �?? `[[tool:query_database]]`",
      "2. Scan monitored Google Drive folders �?? `[[tool:drive_list_folder_files]]`",
      "Drive scope reality check",
      "Classify and persist files",
      "3. Pull RealtyMX listings �?? `[[tool:realtymx_dataapi_listings]]`",
      "4. PENDING connectors �?? never call",
      "5. Compose the digest �?? `[[tool:get_message_templates]]` then `[[tool:execute_js]]`",
      "Status badge colors",
      "Connector display name map",
      "Section content rules",
      "6. Send the digest �?? `[[tool:send_email]]`",
      "7. Persist the run �?? `[[tool:query_database]]`",
      "Database",
      "Key notes"
    ],
    "planSteps": [
      {
        "title": "Reading connector state and folders",
        "description": "Reading connector state and folders",
        "order": 0
      },
      {
        "title": "Scanning monitored Drive folders for changes",
        "description": "Scanning monitored Drive folders for changes",
        "order": 1
      },
      {
        "title": "Pulling active RealtyMX listings",
        "description": "Pulling active RealtyMX listings",
        "order": 2
      },
      {
        "title": "Composing the locked daily digest email",
        "description": "Composing the locked daily digest email",
        "order": 3
      },
      {
        "title": "Sending Camelot Operations Pulse",
        "description": "Sending Camelot Operations Pulse",
        "order": 4
      },
      {
        "title": "Persisting run and connector status",
        "description": "Persisting run and connector status",
        "order": 5
      }
    ]
  },
  {
    "id": "019ddc3a-7ee7-7793-98c9-dbef5eb3783b",
    "name": "Excalibur �?? Market Intel",
    "workspaceId": "019ddc28-0de8-72c3-b1d9-4076baa2a4d0",
    "twinStatus": "exported",
    "latestRunStatus": "completed",
    "hasInstructionBuild": true,
    "lastActivityAt": "2026-05-25T11:07:22.779521225+00:00",
    "deploymentState": "draft",
    "instructionChars": 17298,
    "contentHash": "3eccfd4c57d4dc09fd405120e0cd8d83ba07a6982b1977223997fab01495525a",
    "storageKey": "agents/019ddc3a-7ee7-7793-98c9-dbef5eb3783b/instructions/1777518830942-3eccfd4c57d4dc09.md",
    "purpose": "Excalibur is the **NYC market intelligence and CMA engine** for Camelot Realty Group. It runs daily at 7:00 AM America/New_York to deliver the **Camelot Market Pulse** to `info@camelot.nyc`, and on-demand to produce a full **Comparative Market Analysis** for any address or submarket the user names in the goal override. Every snapshot is persisted so sibling Camelot bots (Avalon, Morgan, Nimue) can query historical comps.",
    "headings": [
      "Purpose",
      "Operating Modes",
      "Persistent State (read first, update last)",
      "Data Sources (graceful degradation)",
      "Scheduled Mode �?? Daily Market Pulse",
      "Step 1 �?? Pick today's rotation `[[tool:query_database]]`",
      "Step 2 �?? Lightweight sweep across ALL submarkets `[[tool:web_search]]`",
      "Step 3 �?? Deep dives on rotating subset `[[tool:web_search]]`",
      "Step 4 �?? Extract structured snapshots `[[tool:llm]]`",
      "Step 5 �?? Persist snapshots, listings, closings `[[tool:query_database]]`",
      "Step 6 �?? Compute watchlist alerts `[[tool:query_database]]`",
      "Step 7 �?? Send the Camelot Market Pulse `[[tool:send_email]]`",
      "On-Demand CMA Mode",
      "Step 1 �?? Resolve the subject property",
      "Step 2 �?? Pull comparables `[[tool:query_database]]`",
      "Step 3 �?? Build the CMA document `[[tool:docs]]`",
      "Step 4 �?? Persist and email `[[tool:query_database]]` + `[[tool:send_email]]`",
      "Schema Reference"
    ],
    "planSteps": [
      {
        "title": "Read state and pick today's rotation",
        "description": "Read state and pick today's rotation",
        "order": 0
      },
      {
        "title": "Lightweight sweep across all submarkets",
        "description": "Lightweight sweep across all submarkets",
        "order": 1
      },
      {
        "title": "Deep-dive 10 rotating submarkets",
        "description": "Deep-dive 10 rotating submarkets",
        "order": 2
      },
      {
        "title": "Extract structured market snapshots",
        "description": "Extract structured market snapshots",
        "order": 3
      },
      {
        "title": "Persist snapshots, listings, closings",
        "description": "Persist snapshots, listings, closings",
        "order": 4
      },
      {
        "title": "Compute watchlist alerts",
        "description": "Compute watchlist alerts",
        "order": 5
      },
      {
        "title": "Send Camelot Market Pulse email",
        "description": "Send Camelot Market Pulse email",
        "order": 6
      },
      {
        "title": "On-demand: build CMA document",
        "description": "On-demand: build CMA document",
        "order": 7
      },
      {
        "title": "On-demand: email CMA link",
        "description": "On-demand: email CMA link",
        "order": 8
      }
    ]
  }
];

export const TWIN_KNOWLEDGE_STATS = {
  totalProjects: TWIN_KNOWLEDGE_PROJECTS.length,
  instructionBackedProjects: TWIN_KNOWLEDGE_PROJECTS.filter((project) => project.instructionChars > 0).length,
  totalInstructionChars: TWIN_KNOWLEDGE_PROJECTS.reduce((sum, project) => sum + project.instructionChars, 0),
};
