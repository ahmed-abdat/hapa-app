# Enhanced Date/Time Picker Component

## Overview
The enhanced FormDateTimePicker component now supports both manual text input and calendar picker selection, providing a better user experience across all devices.

## Features

### 1. Hybrid Input Mode
- **Manual Input**: Users can type dates directly into the text field
- **Calendar Picker**: Click the calendar icon to use the visual date picker
- **Clear Button**: Easily clear the selected date with one click

### 2. Smart Date Parsing
The component intelligently parses multiple date formats:

**French (fr) formats:**
- Date only: `dd/MM/yyyy`, `dd-MM-yyyy`, `dd.MM.yyyy`
- Date & time: `dd/MM/yyyy HH:mm`, `dd-MM-yyyy HH:mm`

**Arabic (ar) formats:**
- Date only: `yyyy/MM/dd`, `yyyy-MM-dd`, `yyyy.MM.dd`
- Date & time: `yyyy/MM/dd HH:mm`, `yyyy-MM-dd HH:mm`

### 3. Auto-formatting
As users type, the component automatically:
- Filters out invalid characters
- Adds date separators (/) at appropriate positions
- Validates the date on blur

### 4. Accessibility
- Full keyboard navigation support
- Screen reader friendly with proper ARIA labels
- RTL support for Arabic language
- Clear visual feedback for validation states

## Usage

```tsx
// Basic usage with date and time
<FormDateTimePicker
  name="broadcastDateTime"
  label="Date et heure de diffusion"
  required
/>

// Date only (no time selection)
<FormDateTimePicker
  name="eventDate"
  label="Date de l'événement"
  dateOnly
/>

// Disable manual input (calendar picker only)
<FormDateTimePicker
  name="appointmentDate"
  label="Date du rendez-vous"
  allowManualInput={false}
/>

// With custom placeholder
<FormDateTimePicker
  name="customDate"
  label="Date personnalisée"
  placeholder="Entrez ou sélectionnez une date"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Form field name |
| `label` | string | required | Field label |
| `required` | boolean | false | Whether field is required |
| `disabled` | boolean | false | Disable the field |
| `dateOnly` | boolean | false | Show date only (no time) |
| `allowManualInput` | boolean | true | Allow manual text input |
| `placeholder` | string | auto | Custom placeholder text |
| `locale` | 'fr' \| 'ar' | auto | Force specific locale |

## User Experience Improvements

### Desktop Experience
- Faster date entry for known dates (birthdays, etc.)
- Calendar picker for browsing dates
- Keyboard shortcuts for power users

### Mobile Experience
- Touch-friendly calendar interface
- Large touch targets (48px minimum)
- Native keyboard with number pad for manual input

### Validation & Feedback
- Real-time validation as user types
- Clear error messages for invalid dates
- Visual states: default, focused, valid, invalid
- Automatic format correction on blur

## Implementation Notes

### Date Storage
All dates are stored as ISO 8601 strings in UTC format for consistency across the application.

### Timezone Handling
- Display: Dates are shown in user's local timezone
- Storage: Converted to UTC before saving
- Retrieval: Converted from UTC to local for display

### Form Integration
The component fully integrates with React Hook Form:
- Validation rules work seamlessly
- Form submission includes properly formatted dates
- Error states are managed by the form context