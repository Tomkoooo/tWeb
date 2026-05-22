# CMS content imports (agent workflow)

## Files

| File | Purpose |
|------|---------|
| `customer-copy.txt` | **You** paste raw customer text here (gitignored). Copy from `.example` to start. |
| `payload.json` | **Agent** writes structured import JSON (gitignored). Copy from `payload.example.json`. |
| `payload.example.json` | Reference shape for `cms:apply-import`. |

## Commands

```bash
# 1) User must name the template explicitly, e.g. default-modern
npm run cms:inspect -- --template=default-modern

# 2) Agent edits payload.json from customer-copy.txt + inspect output
npm run cms:apply-import -- --template=default-modern --payload=scripts/imports/payload.json --dry-run

# 3) Apply draft (review in /admin/cms before publishing)
npm run cms:apply-import -- --template=default-modern --payload=scripts/imports/payload.json

# 4) Optional: go live immediately
npm run cms:apply-import -- --template=default-modern --payload=scripts/imports/payload.json --publish
```

See [docs/cms/AGENT_CONTENT_IMPORT.md](../../docs/cms/AGENT_CONTENT_IMPORT.md) for the full agent playbook.
