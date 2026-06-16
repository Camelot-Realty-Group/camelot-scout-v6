# TARA: Template Automation & Revenue Agent

## Operating Principle

TARA should turn repeatable property-management forms into controlled
templates with rate sheets, invoice drafts, payment tracking and HubSpot notes.
The AI agent may prepare the charge, but Camelot approval controls anything that
gets sent to a client, resident, shareholder, owner or vendor.

## Why This Matters

The template library is not a passive filing cabinet. It is a production desk
for revenue-producing administrative services:

- alteration packages
- decorative agreements
- move-in / move-out packages
- purchase and sublet board packages
- refinance and lender questionnaires
- RPIE prep
- MDR / HPD registration
- co-op / condo tax abatement support
- violation response packets
- lease renewals

Each generated document should leave an audit trail: source template, version,
property, recipient, created by, created at, invoice status, payment status,
HubSpot status and Google Drive archive link.

## Billing Rules

1. Every template gets a fee code, even if it is included or no-charge.
2. AI-generated invoices start as drafts or approval-needed.
3. Legal, accounting and compliance-heavy forms require human approval before
   sending.
4. Quote-required items are estimates until scope is approved.
5. Payment should not be marked collected unless a human marks it paid or a
   payment/accounting integration confirms it.
6. HubSpot receives the activity note, document link, invoice link, and next task.

## Billable Task Queue Protocol

TARA is the billable-task layer for Camelot OS. Report, agreement, compliance,
content, and template tools should not invoice directly. They should create
billable task events. The account manager decides whether the task is approved,
waived, rejected or converted into an invoice.

Required fields for every billable task:

- source bot
- task type
- fee code
- property / building address
- who requested it
- who should pay
- payer role
- payer contact details, if known
- amount or quote-required status
- evidence link
- approval reason
- HubSpot context, if available

Payer-role defaults:

| Task | Default payer |
| --- | --- |
| Alteration agreement | Unit owner / shareholder |
| Decorative agreement | Unit owner / shareholder |
| Move-in / move-out | Resident, renter, buyer or seller |
| Purchase board package | Buyer |
| Sale / resale package | Seller or buyer depending building fee schedule |
| Sublet / lease package | Unit owner / shareholder |
| Refinance questionnaire | Unit owner / shareholder |
| Lease renewal | Landlord / owner |
| RPIE prep | Landlord / owner |
| MDR / HPD registration | Association / owner |
| Co-op / condo abatement | Association unless unit-level fee is approved |
| Vendor W-9 / COI onboarding | Track-only unless contract allows billing |
| Violation response packet | Association / owner, unless chargeback is allowed |
| Proposal of services | No charge; sales value tracking only |

Manager approval is mandatory whenever the payer, governing-doc authority,
legal/accounting/compliance scope, or fee amount is unclear.

## System of Record

- Camelot OS owns templates, rate rules, generated document records and invoice
  drafts.
- Google Drive stores source files and final PDFs.
- HubSpot owns follow-up, deal pipeline, contact/company activity and tasks.
- MDS / QuickBooks / payment processor integrations can later own actual
  accounting invoices and payment confirmation.

## First Integration Targets

1. Google Drive archive folder creation per building.
2. HubSpot note and task creation for every generated document.
3. Payment link creation through the chosen processor.
4. MDS or QuickBooks invoice creation once API credentials and chart-of-account
   mapping are confirmed.

## Guardrails

- Do not describe a document as compliant without a jurisdiction, source URL,
  review date and review status.
- Do not invoice a shareholder or resident for building-paid work unless the
  governing documents and fee schedule allow it.
- Do not include legal advice in automated templates.
- Do not hide included services. Track them as value, but do not call them paid.
