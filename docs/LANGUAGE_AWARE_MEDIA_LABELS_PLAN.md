# Language-Aware Media Labels Implementation Plan

## Overview

This document outlines the implementation strategy for displaying media channel/station names in the submission's original language rather than the Payload CMS admin interface language. This ensures data accuracy and proper representation regardless of which language the admin user has selected.

## Problem Statement

Previously, when viewing media content submissions in the admin panel:
- Media channel names (e.g., "Radio Jeunesse") were displayed in French even when:
  - The submission was made in Arabic
  - The admin interface was set to Arabic
- This created confusion as admins couldn't see the proper Arabic translations for media outlets

## Solution Architecture

### 1. Core Principle: Submission Language Priority

The fundamental principle is that **media labels should always be displayed in the language of the original submission**, not the current admin interface language.

### 2. Implementation Components

#### A. Enhanced Media Mapping Functions (`src/lib/media-mappings.ts`)

We've updated the core mapping functions to handle both:
- Value keys (e.g., `radio_jeunesse`)
- French labels (e.g., `Radio Jeunesse`) for legacy data

```typescript
export function getRadioStationLabel(value: string, locale: 'fr' | 'ar' = 'fr'): string {
  // First try to find by value key
  let station = radioStations.find(s => s.value === value)
  
  // If not found, try to find by French label (for legacy data)
  if (!station) {
    station = radioStations.find(s => s.label === value)
  }
  
  if (!station) return value // Fallback to raw value
  
  return locale === 'ar' ? station.labelAr : station.label
}
```

#### B. Custom Field Component (`src/components/admin/LocalizedChannelField`)

Created a specialized field component that:
- Reads the submission's locale from document data
- Uses submission locale instead of admin locale for label display
- Shows original value in parentheses if different from displayed value
- Handles RTL/LTR text direction based on submission language

#### C. Updated Dashboard Components

Modified the following components to use submission language:
- `MediaSubmissionsDashboard/ModernDashboard.tsx` - Risk analysis and stats
- `MediaSubmissionsDashboard/components/SubmissionsDataTable.tsx` - Data table display

### 3. Best Practices for Future Development

#### When Creating New Collections with Localized Data:

1. **Always store the submission locale**:
   ```typescript
   {
     name: "locale",
     type: "select",
     required: true,
     options: [
       { label: "Français", value: "fr" },
       { label: "العربية", value: "ar" }
     ]
   }
   ```

2. **Create language-aware field components**:
   - Read submission locale from document data
   - Use `useDocumentInfo()` hook to access full document context
   - Apply appropriate text direction (RTL/LTR)

3. **Handle legacy data gracefully**:
   - Support both value keys and display labels
   - Provide fallbacks when translations are missing
   - Show original value when no mapping exists

#### When Displaying Localized Content:

1. **Priority order for locale selection**:
   - Submission's original locale (highest priority)
   - Fallback to default locale if needed
   - Never use admin interface locale for submission data

2. **Visual indicators**:
   ```typescript
   // Show original value in parentheses if different
   {value && displayValue !== value && (
     <span style={{ opacity: 0.6 }}>({value})</span>
   )}
   ```

3. **Consistent mapping structure**:
   ```typescript
   interface MediaOption {
     value: string      // Database key
     label: string      // French label
     labelAr: string    // Arabic label
     category?: string  // Optional categorization
   }
   ```

### 4. Implementation Checklist

- [x] Update media mapping functions to handle legacy data
- [x] Create LocalizedChannelField component
- [x] Update MediaContentSubmissions collection fields
- [x] Update dashboard components to use submission locale
- [x] Add to import map for Payload admin
- [x] Handle TypeScript type safety
- [ ] Test with various submission languages
- [ ] Document in developer guide

### 5. Testing Strategy

1. **Create test submissions**:
   - Submit forms in both French and Arabic
   - Use different media channels
   - Verify correct display in admin

2. **Admin interface testing**:
   - Switch admin language between FR/AR
   - Confirm submission data shows in original language
   - Check RTL/LTR text direction

3. **Legacy data testing**:
   - Test with existing data using French labels
   - Verify fallback mechanisms work correctly

### 6. Migration Considerations

For existing data that stores French labels instead of value keys:
1. The updated functions handle this automatically
2. No data migration needed
3. Consider future migration to standardize on value keys

### 7. Performance Considerations

- Label lookups are O(n) but with small datasets (< 50 items)
- Consider caching if dataset grows significantly
- Current implementation is sufficient for expected scale

### 8. Security Considerations

- All displayed values are sanitized by React
- No user input is executed as code
- Fallback values prevent XSS through undefined behavior

## Conclusion

This implementation ensures that media content submissions are displayed accurately in their original language context, improving data integrity and admin user experience across language barriers.

