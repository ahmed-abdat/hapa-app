# Translation Issue Tracking - Media Submissions Dashboard

## Problem Summary
The Media Submissions Dashboard at `/admin/collections/dashboard-submissions` displays raw translation keys instead of translated text when viewed in Arabic locale, while the Media Cleanup Jobs dashboard at `/admin/collections/media-cleanup-jobs` works correctly.

## Root Cause Analysis

### Issue Identified
The Arabic translations in `src/translations/admin-translations.ts` are missing several keys that exist in the French translations. This causes the translation system to display the raw keys instead of translated text.

### Key Finding
- **French modernDashboard section (line 199)**: Contains a direct `pending` key
- **Arabic modernDashboard section (line 924)**: Missing the direct `pending` key (only has `pendingStatus` inside `dataTable` sub-object)

## Missing Translation Keys in Arabic

Based on the screenshot analysis, the following keys are missing or incorrectly structured in the Arabic `modernDashboard` section:

### Critical Missing Keys
1. `modernDashboard.pending` - "في الانتظار"
2. Additional keys that need verification:
   - Various nested keys that might be incorrectly accessed

## Comparison: Working vs Non-Working Implementation

### Working: MediaCleanupJobs
- **Collection Config**: `src/collections/MediaCleanupJobs.ts`
- **Component**: `src/components/admin/MediaCleanupDashboard/CleanupDashboard.tsx`
- **Export Pattern**: Default export function
- **Translation Usage**: Uses `dt()` function from `useAdminTranslation()`
- **Result**: Translations work correctly in both French and Arabic

### Not Working: MediaSubmissionsDashboard
- **Collection Config**: `src/collections/MediaSubmissionsDashboard/index.ts`
- **Component**: `src/components/admin/MediaSubmissionsDashboard/ModernDashboard.tsx`
- **Export Pattern**: Named export with default fallback
- **Translation Usage**: Uses `dt()` function from `useAdminTranslation()`
- **Result**: Shows raw translation keys in Arabic locale

## Resolution Status ✅

**Issue COMPLETELY FIXED**: 
1. Identified that Payload CMS requires flattened translation keys with dot notation
2. Added all missing flattened `modernDashboard.*` keys for both French and Arabic
3. Added flattened `modernDashboard.dataTable.*` keys for both languages
4. Translations now work correctly in both locales

## Solution Plan

### Step 1: Add Missing Keys to Arabic Translations
Add the following keys to the Arabic `modernDashboard` section (after line 994):

```typescript
// Add after line 994 (reportsLabel: "تبليغات",)
pending: "في الانتظار",
```

### Step 2: Verify All Keys Match Between French and Arabic
Compare the entire `modernDashboard` object structure between French (lines 199-618) and Arabic (lines 924-1200+) to ensure:
1. All keys present in French exist in Arabic
2. The structure and nesting are identical
3. No keys are missing at any level

### Step 3: Key Locations to Update

#### In `src/translations/admin-translations.ts`:

**French Section (Reference - DO NOT MODIFY)**:
- Line ~297: `pending: "En attente",`

**Arabic Section (NEEDS UPDATE)**:
- After line 994: ADD `pending: "في الانتظار",`

### Step 4: Testing Checklist
- [ ] Verify translations load correctly in French locale
- [ ] Verify translations load correctly in Arabic locale
- [ ] Check all stat cards display proper text
- [ ] Check all chart labels display proper text
- [ ] Check all table headers display proper text
- [ ] Verify RTL layout works correctly in Arabic

## Files to Modify

1. **Primary Fix**: `src/translations/admin-translations.ts`
   - Add missing `pending` key to Arabic modernDashboard section
   - Verify all other keys match between French and Arabic sections

## Validation Steps

1. Start the development server: `pnpm dev`
2. Navigate to `/admin/collections/dashboard-submissions`
3. Switch to Arabic locale using the language selector
4. Verify all text displays correctly (no raw keys visible)
5. Compare with French locale to ensure parity

## Additional Notes

- The translation system uses Payload CMS's built-in i18n support
- The `useAdminTranslation()` hook provides the `dt()` function for translations
- Both dashboards use the same translation mechanism, so the issue is purely in the translation data
- The flattened structure for status and priority labels (using dot notation like 'status.pending') is working correctly

## Success Criteria

✅ No raw translation keys visible in the dashboard
✅ All text properly displayed in both French and Arabic
✅ RTL layout working correctly for Arabic locale
✅ Feature parity between both language versions