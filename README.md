# ROMA

## Red de Observación Manta Anónima

**ROMA** is an AI-powered civic reporting platform for Manta, Ecuador.  
It allows people to report local issues privately, while AI helps classify, prioritize and transform those reports into actionable briefs.

> Civic data without surveillance.

---

## Quick Setup

**Repository:** [`vincesmandres/ROMA`](https://github.com/vincesmandres/ROMA)  
**Live:** https://roma-1t08ndh9j-andres-vinces-projects.vercel.app

### Required Environment Variables

Add these to Vercel **Settings → Vars**:

```env
# Supabase (auto-configured by integration)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY

# OpenAI (⚠️ required for AI analysis)
OPENAI_API_KEY              # https://platform.openai.com/api-keys
OPENAI_MODEL=gpt-4o         # or gpt-4-turbo

# WhatsApp (future)
WHATSAPP_VERIFY_TOKEN
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_APP_SECRET

# Security (future)
ENCRYPTION_KEY
NEXT_PUBLIC_APP_URL
```

### Database

**Supabase Project:** `iflvopghdiamnxkmjacu`

Tables (auto-created on first migration):
- `reports` – Civic reports
- `report_analysis` – AI classification & confidence
- `briefs` – Moderator summaries
- `follow_up_events` – Action history
- `moderator_actions` – Audit log
- `whatsapp_identity_vault` – Encrypted identities

**Security:** RLS enabled and closed. Requires Clerk integration for moderator access.

---

## Problem

In many cities, local problems are reported through scattered channels: WhatsApp messages, informal conversations, social media posts, paper notes or isolated complaints.

This creates three main problems:

1. Reports are hard to organize and prioritize.
2. Communities and institutions lose context.
3. Asking for personal data can reduce citizen participation and create privacy risks.

Manta needs a simple way to transform local signals into useful action without turning civic participation into surveillance.

---

## Solution

ROMA lets people submit local reports without exposing their identity.  
The system uses AI to classify, group and prioritize reports, then generates operational briefs for moderators, communities or local organizations.

A report can become:

- a structured case;
- a priority level;
- a recommended action;
- a short WhatsApp-ready message;
- an institutional brief;
- a traceable report hash.

---

## Core Use Cases

ROMA can be used to report and prioritize:

- waste accumulation;
- beach contamination;
- water leaks;
- damaged roads;
- accessibility issues;
- public service problems;
- environmental risks;
- community safety concerns;
- local resilience events.

---

## How It Works

```txt
Citizen report
→ privacy-first submission
→ AI classification
→ priority scoring
→ case grouping
→ admin review
→ actionable brief
→ traceable report hash
