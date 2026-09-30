# EasyAudit Export Contract (LLM / Integrator Guide)

> Hand this document to other agents or teams that need to produce, consume, or extend NZC EasyAudit export Files.

## Purpose

Persist the **client-built** emissions calculation audit trail as two Salesforce Files on the energy-use record:

1. Machine-readable **JSON**
2. Human-readable **Markdown**

If AI Audit Insights produced a load-time summary, that summary is embedded. Q&A follow-ups are **not** included.

## Non-negotiable design rules

1. **Do not rebuild the audit trail in Apex.** Steps exist only after Vehicle/Stationary calc runs in the browser (`CalculationStep` via `nZC_EasyAuditLogging`). Export serializes that array.
2. **Build payloads in JS; persist in Apex.** Reuse `c/nZC_EasyAuditExport` (`buildAuditExport` / `buildFileNames`). Apex only inserts `ContentVersion` rows.
3. **AI = load summary only.** Source is the Insights probe (`getAuditSummary`). If the probe failed, export `"ai": { "available": false }` with no `loadSummary`.
4. **Keep filenames discoverable.** Downstream jobs must find files by title prefix + record Id without UI context.
5. **All File DML stays in `NZC_EasyAuditExportService`.** Controllers and LWCs must not insert `ContentVersion` directly (future UnitOfWork seam).

## Reusable LWC module

**Import:** `import { buildAuditExport, buildFileNames, SCHEMA_VERSION, EXPORT_TYPE, FILE_NAME_PREFIX, FILE_NAME_KIND } from "c/nZC_EasyAuditExport";`

```js
const result = buildAuditExport({
  recordId,
  objectApiName,      // optional, e.g. StnryAssetEnrgyUse
  steps,              // instructions array from EasyAudit
  aiLoadSummary,      // string | null | undefined
  exportedAt          // optional Date | ISO string
});
// result.jsonString, result.markdownString, result.jsonFileName, result.markdownFileName
```

Other components may also call `@api getAuditExportPayload()` on `c/nZC_EasyAudit` when they compose the card.

## JSON schema (`schemaVersion` = `1.0`)

```json
{
  "schemaVersion": "1.0",
  "exportType": "NZC_EasyAudit",
  "recordId": "a0X...",
  "objectApiName": "StnryAssetEnrgyUse",
  "exportedAt": "2026-09-30T13:04:05.000Z",
  "steps": [
    {
      "title": "string",
      "descriptions": ["string"],
      "final": "string (optional)",
      "recordLinkName": "string (optional)",
      "recordLinkId": "string URL (optional)"
    }
  ],
  "ai": {
    "available": true,
    "loadSummary": "plain text summary"
  }
}
```

When AI is unavailable: `"ai": { "available": false }` (omit `loadSummary`).

`exportType` is always `NZC_EasyAudit`.

## Filename contract

```
NZC_EasyAudit_{recordId}_{yyyyMMdd'T'HHmmss'Z'}_audit.json
NZC_EasyAudit_{recordId}_{yyyyMMdd'T'HHmmss'Z'}_audit.md
```

Constants (JS + Apex must stay aligned):

| Constant | Value |
|----------|-------|
| Prefix | `NZC_EasyAudit_` |
| Kind suffix | `_audit` |
| Apex mirror | `NZC_EasyAuditExportService.FILE_NAME_PREFIX` / `FILE_NAME_KIND` |

**Discovery query pattern:**

```sql
SELECT Id, Title, FileExtension, ContentDocumentId, CreatedDate
FROM ContentVersion
WHERE Title LIKE 'NZC_EasyAudit_a0X000000000001%'
ORDER BY CreatedDate DESC
```

(`Title` stores the PathOnClient without extension; still starts with the same prefix + record Id.)

## `summaryready` event

Fired by `c/nZC_EasyAuditInsights` after the load-time summary probe settles:

| Field | Success | Failure |
|-------|---------|---------|
| `detail.available` | `true` | `false` |
| `detail.summary` | summary string | `null` |

Bubbles + composed. Parent EasyAudit listens via `onsummaryready` and stores the value for export. Probe failures must **not** toast.

## Apex persistence API

```apex
NZC_EasyAuditExportController.saveAuditExport(
  Id recordId,
  String jsonBody,
  String markdownBody,
  String jsonFileName,
  String markdownFileName
);
```

Creates two `ContentVersion` records with `FirstPublishLocationId = recordId` (Files related list on the record).

Permission set: `NZC_EasyAudit_Access` includes `NZC_EasyAuditExportController` and `NZC_EasyAuditExportService`.

## Flow

```
instructions (client)
  → nZC_EasyAuditExport.buildAuditExport
  → NZC_EasyAuditExportController.saveAuditExport
  → NZC_EasyAuditExportService (ContentVersion x2)
  → Files on energy-use record
```

## Home Page sample exporter

`c/nZC_EasyAuditSampleExport` (Lightning Home / App Page) asks for a sample size (1–50), then:

1. Calls `NZC_EasyAuditSampleController.selectSampleRecords` for stratified random picks across **object × FuelType** (Stationary + Vehicle)
2. For each Id, runs the same client pipeline: `getRecordInfo` → Vehicle/Stationary calc → `buildAuditExport` → `saveAuditExport`
3. Writes the same discoverable Files on each selected record
4. Persists a per-user last-run summary File (`NZC_EasyAudit_SampleRun_Latest`) via `saveLastSampleRun` / `getLastSampleRun`
5. On reload, shows the last run; Generate confirms before replacing it
6. Success rows link to the JSON ContentDocument (plus Markdown / record links); **Download** uses Shepherd multi-document download for the last run’s Files

**Batch AI policy:** sample exports always pass `aiLoadSummary: null` (no Prompt Builder calls). Coverage is FuelType×object only, not parent Record Type.

## Out of scope (do not add casually)

- Embedding Q&A answers
- Auto-export on record load
- Re-deriving steps from SOQL in Apex
- Creating synthetic NZC energy-use rows from the sample tool
