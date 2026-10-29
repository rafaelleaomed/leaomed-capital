<div align="center">

**Language:** [English](README.en.md) · [Português do Brasil](README.md)

# LeãoMed Capital

**Financial intelligence for consolidated personal and business finances.**

[Synthetic-data demo](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/demo)

</div>

## The problem

Professionals paid through multiple sources may have income, expenses, cards, taxes and investments fragmented across personal and business accounts. This makes it harder to understand available cash, review transactions and plan contributions.

LeãoMed Capital centralizes this workflow with personal/business separation, document ingestion, reviewable categorization and financial projections. It is an organization and decision-support tool, not financial advice.

## What is implemented

- consolidated, personal and business dashboards;
- invoice and statement ingestion with OCR;
- granular review, editing and batch categorization of transactions;
- deterministic rules and optional semantic classification with JEV;
- human confirmation for sensitive categories and AI suggestions;
- card, installment, budget and fixed-expense management;
- business-tax tracking and effective-rate calculation;
- daily spending, emergency-reserve and contribution simulators;
- investment allocation and rebalancing support;
- privacy mode and an isolated synthetic-data demo.

## Security and isolation

Authenticated routes validate sessions on the server and scope operations to the current user. The application uses parameterized queries, Supabase-managed authentication cookies and server-protected AI credentials. Demo mode does not require access to real financial data.

AI classification is assistive: without a valid credential, the application retains local rules; when AI is enabled, ambiguous results remain subject to human review.

## Architecture

- **Application:** Next.js 16, React 19 and TypeScript;
- **Database:** Neon Serverless PostgreSQL;
- **Authentication:** Supabase Auth with SSR;
- **AI:** TypeSafe AI / JEV, preceded by deterministic rules;
- **Documents:** OCR and structured extraction from invoices and statements;
- **Quality:** isolation, persistence and upload tests, plus TypeScript and production-build validation.

## Run locally

```bash
npm install
npm run dev
```

Local development requires database, authentication and optional-service variables. Do not commit credentials or financial documents.

## Verification

```bash
npx tsc --noEmit
node tests/document_upload_runtime.test.cjs
npm run build
```

## Current limitations

- OCR and categorization can require manual correction;
- the Open Finance integration is architecturally prepared but depends on production credentials;
- projections and simulators depend on input-data quality;
- the demo uses synthetic data and is not investment advice.

## Author

**Rafael Leão, MD:** building digital products for clinical, operational and financial problems.
[GitHub](https://github.com/rafaelleaomed) · [LinkedIn](https://www.linkedin.com/in/rafaelleaomed/)
