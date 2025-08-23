# Admin Locale Consistency Improvements & Issues

## ✅ COMPLETED FIXES

### 1. Arabic Locale Headers Fixed
**Issue**: Admin interface was showing French headers ("MOTIFS SÉLECTIONNÉS", "TYPES DE PIÈCES JOINTES") even for Arabic submissions.

**Solution Applied**: 
- Modified `SimpleReasonsField` and `SimpleAttachmentsField` components
- Changed from `useField({ path: '' })` to `useDocumentInfo()` for proper locale detection
- Now correctly shows Arabic headers: "الأسباب المختارة:" and "أنواع المرفقات:"

**Files Modified**:
- `/src/components/admin/SimpleReasonsField/index.tsx` 
- `/src/components/admin/SimpleAttachmentsField/index.tsx`

**Test Results**: ✅ VERIFIED - Arabic submissions now show Arabic headers, French submissions show French headers

### 2. Frontend Form Consistency
**Issue**: Missing options in frontend forms (fakeNews in report form, misinformation in complaint form)

**Solution Applied**:
- Created centralized form options in `/src/lib/form-options.ts`
- Updated both report and complaint forms to use consistent options
- All 8 reason options now available in both forms

**Files Modified**:
- `/src/lib/form-options.ts` (new file)
- `/src/components/CustomForms/MediaContentReportForm/index.tsx`
- `/src/components/CustomForms/MediaContentComplaintForm/index.tsx`

---

## 🔧 PENDING ISSUES TO FIX

### Issue 1: Channel Names Not Localized
**Problem**: Arabic submissions show "mouritaniya2" instead of "الموريتانية 2"

**Root Cause**: Missing mapping in `/src/lib/media-mappings.ts`
- `mouritaniya2` is defined in `TVChannelCombobox.tsx` with correct Arabic label
- But missing from `tvChannels` array in `media-mappings.ts`
- `getMediaChannelLabel()` function falls back to raw value instead of localized label

**Fix Required**:
```typescript
// Add to tvChannels array in media-mappings.ts:
{ value: 'mouritaniya2', label: 'El Mouritaniya 2', labelAr: 'الموريتانية 2', category: 'state' },
```

**Files to Update**:
- `/src/lib/media-mappings.ts` - Add missing TV channel mappings

### Issue 2: Generic "text" Labels in Admin
**Problem**: Admin interface shows generic "text" labels instead of meaningful field type indicators

**Root Cause**: `StyledTextField` component hardcodes "text" on line 123
```typescript
// Line 123 in StyledTextField/index.tsx:
>
text  // <- This is hardcoded
```

**Fix Required**: Make the field type indicator dynamic or remove it entirely
```typescript
// Option 1: Dynamic field type
field.type || "text"

// Option 2: Remove generic indicator entirely
{/* Remove the entire badge */}
```

**Files to Update**:
- `/src/components/admin/StyledTextField/index.tsx`

### Issue 3: Incomplete Media Channel Mappings
**Problem**: Multiple TV channels and radio stations from frontend forms are missing from media-mappings.ts

**Analysis Required**: 
1. Compare `TVChannelCombobox.tsx` channels with `media-mappings.ts` tvChannels array
2. Compare `RadioStationCombobox.tsx` stations with `media-mappings.ts` radioStations array
3. Add all missing mappings with correct Arabic translations

**Files to Review**:
- `/src/components/CustomForms/FormFields/TVChannelCombobox.tsx`
- `/src/components/CustomForms/FormFields/RadioStationCombobox.tsx` 
- `/src/lib/media-mappings.ts`

---

## 🧪 TESTING REQUIREMENTS

### Test Cases for Channel Localization Fix
1. **Arabic TV Submission**: Should show "الموريتانية 2" not "mouritaniya2"
2. **Arabic Radio Submission**: Verify all radio stations show Arabic names
3. **French Submissions**: Ensure French labels still work correctly
4. **Missing Channels**: Test channels not in mapping show cleaned fallback

### Test Cases for Field Type Labels
1. **Program Names**: Should show actual program names, not "text"
2. **Field Indicators**: Verify field type badges are meaningful or removed
3. **RTL Layout**: Ensure field layout works correctly in Arabic

---

## 📋 IMPLEMENTATION STEPS

### Step 1: Fix Channel Name Mappings
1. Extract all channels from `TVChannelCombobox.tsx`
2. Extract all stations from `RadioStationCombobox.tsx`
3. Update `media-mappings.ts` with complete mappings
4. Test Arabic submissions show correct localized names

### Step 2: Fix Generic Text Labels  
1. Analyze `StyledTextField` usage across admin components
2. Either make field type dynamic or remove generic indicators
3. Test that admin interface shows meaningful labels

### Step 3: Comprehensive Testing
1. Test both Arabic and French submissions
2. Verify all TV channels and radio stations display correctly
3. Ensure no "text" labels appear where they shouldn't
4. Check RTL/LTR layout consistency

---

## 🎯 SUCCESS CRITERIA

**Complete Fix Achieved When**:
- ✅ Arabic submissions show all labels in Arabic (headers, channels, stations)
- ✅ French submissions show all labels in French  
- ✅ No generic "text" labels visible in admin interface
- ✅ All TV channels and radio stations have proper Arabic/French names
- ✅ RTL layout works correctly for Arabic content
- ✅ No language mixing within single submission views

---

## 📁 KEY FILES REFERENCE

### Core Admin Components
- `/src/components/admin/SimpleReasonsField/index.tsx` - Reasons display (✅ FIXED)
- `/src/components/admin/SimpleAttachmentsField/index.tsx` - Attachments display (✅ FIXED)
- `/src/components/admin/LocalizedChannelField/index.tsx` - Channel display (uses media-mappings)
- `/src/components/admin/StyledTextField/index.tsx` - Generic text fields (🔧 NEEDS FIX)

### Data Mappings
- `/src/lib/media-mappings.ts` - Channel/station localization (🔧 NEEDS UPDATE)
- `/src/lib/form-options.ts` - Centralized form options (✅ CREATED)

### Frontend Forms
- `/src/components/CustomForms/FormFields/TVChannelCombobox.tsx` - TV channel source data
- `/src/components/CustomForms/FormFields/RadioStationCombobox.tsx` - Radio station source data

### Collection Schema
- `/src/collections/MediaContentSubmissions/index.ts` - Main collection definition

---

**Last Updated**: August 23, 2025
**Status**: 2/5 issues fixed, 3 pending implementation