# Feature Flags

Feature flags allow features to be toggled on/off at runtime without redeployment. Flags are stored in Supabase and can be changed instantly via the Supabase dashboard.

## Current Flags

| Key | Dev | Prod | Description |
|-----|-----|------|-------------|
| `ALLOW_SIGN_UPS` | `false` | `false` | Controls whether new user signups are accepted. Disables the Sign Up button and redirects `/auth/sign-up` to `/`. |

> Keep this table in sync when adding or removing flags. The authoritative values are always in the `feature_flags` Supabase table, but this list makes flags visible at a glance.

---

## How It Works

Flags are stored in the `feature_flags` table in Supabase with one row per flag per environment:

```
key            | environment | enabled | description
---------------|-------------|---------|------------
ALLOW_SIGN_UPS | dev         | false   | ...
ALLOW_SIGN_UPS | prod        | false   | ...
```

The app reads flags filtered by the `FEATURE_FLAGS_ENV` environment variable (`dev` or `prod`). All flags are fetched in a single query per request and deduplicated via `React.cache()`.

**Environment variable:**
```
# .env.local
FEATURE_FLAGS_ENV=dev

# Netlify → Production context only
FEATURE_FLAGS_ENV=prod
```

---

## Toggling a Flag

1. Go to the Supabase dashboard → Table Editor → `feature_flags`
2. Find the row for the flag key + environment you want to change
3. Toggle the `enabled` column
4. Reload the app — the change takes effect immediately, no redeploy needed

---

## Adding a New Flag

**1. Insert rows in Supabase:**
```sql
INSERT INTO feature_flags (key, environment, enabled, description)
VALUES
  ('MY_FLAG', 'dev',  true,  'What this flag controls in dev'),
  ('MY_FLAG', 'prod', false, 'What this flag controls in prod');
```

**2. Use the flag in a server component:**
```typescript
import { getFeatureFlags, isFlagEnabled } from "@/lib/feature-flags";

export async function MyComponent() {
  const flags = await getFeatureFlags();
  if (!isFlagEnabled(flags, "MY_FLAG")) return null;
  return <div>Feature content</div>;
}
```

**3. Use the flag in a client component:**
```typescript
"use client";
import { useFlag } from "@/lib/feature-flag-context";

export function MyButton() {
  const enabled = useFlag("MY_FLAG");
  return <Button disabled={!enabled}>Do thing</Button>;
}
```

**4. Add the flag to the table above** so it's visible to the team.

---

## Removing a Flag

1. Remove all references to the flag key from the codebase
2. Delete the rows from the `feature_flags` table in Supabase
3. Remove the flag from the table above

---

## Implementation Files

| File | Purpose |
|------|---------|
| `lib/feature-flags.ts` | Fetches all flags from Supabase, `isFlagEnabled()` helper |
| `lib/feature-flag-context.tsx` | Client-side context provider, `useFlag()` and `useFlagMetadata()` hooks |
| `app/layout.tsx` | Fetches flags on every request, provides them via `FeatureFlagProvider` |
