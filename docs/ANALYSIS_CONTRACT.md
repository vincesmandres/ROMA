# ROMA Analysis Contract

This contract is the shared boundary between report intake, AI analysis, Supabase persistence, and moderator review.

## Controlled values

Categories, priorities, statuses, and sources are defined in `src/lib/roma-contracts.ts`.
The analysis layer must return only one of the controlled category and priority values.

## Analysis input

`ReportAnalysisInput` contains:

- `zone`: a broad local area, never a required exact address;
- `text`: citizen text after sensitive-data redaction when applicable;
- `source`: `web_form` or `whatsapp`;
- `reportedCategory`: optional citizen-provided category;
- `perceivedUrgency`: optional citizen-provided urgency.

The input must not contain names, phone numbers, national IDs, or secrets.

## Analysis output

`ReportAnalysisOutput` contains the structured result:

- `category` and `priority` from the controlled vocabulary;
- `summary` and `recommended_action` for human review;
- `risks` as a list of concise risk labels;
- `whatsapp_message` as a short operational message;
- `confidence` as a number from `0` to `1`.

AI output is a recommendation, not proof that the report is true or an official emergency alert. A moderator must review it before escalation or external action.

## Traceability hash

`createReportHash` hashes the canonical tuple `[redactedText, zone, category, createdAt]` with SHA-256. It returns lowercase hexadecimal and must run on the server. Hashing does not replace redaction and must never receive raw secrets or private identity data.
