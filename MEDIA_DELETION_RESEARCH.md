# Media Deletion System Research & Improvement Plan

## Current Issue Summary

The HAPA website's media deletion system has a critical issue where:
1. When admins delete MediaContentSubmissions, associated FormMedia files aren't being fully cleaned up
2. Files remain visible in `/admin/collections/form-media`
3. Files persist in R2 storage
4. MediaCleanupJobs scanner isn't detecting these orphaned files

## System Architecture Analysis

### Current Implementation

#### 1. MediaContentSubmissions Deletion Hook
- **Location**: `src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts`
- **Strategy**: Dual approach (submissionId lookup + URL extraction)
- **Process**:
  1. Find FormMedia by submissionId
  2. Extract URLs from submission data
  3. Bulk delete from R2
  4. Delete FormMedia records with `skipR2Cleanup` context

#### 2. FormMedia Collection
- Has `submissionId` text field (not a Payload relationship)
- `beforeDelete` hook for individual R2 cleanup
- Respects `skipR2Cleanup` context to prevent double deletion

#### 3. MediaCleanupJobs Scanner
- **Scan Logic**: Lists R2 files → checks if filename exists in FormMedia
- **Problem**: Only checks by filename, not full tracking of relationships

## Research Needed from Payload CMS 3.44 Documentation

### 1. Storage Adapter Best Practices
Please research the following topics in Payload CMS 3.44 documentation:

#### A. Official Storage Deletion Patterns
- How should storage adapters handle cascade deletion?
- Best practices for @payloadcms/storage-s3 with R2
- Proper hook implementation for storage cleanup
- Transaction-like behavior for storage + database operations

#### B. Relationship Management
- Best practices for tracking file relationships
- Should we use Payload relationships vs text fields for IDs?
- How to ensure referential integrity with uploads
- Cascade deletion patterns for related media

#### C. Hook Execution Order
- Guaranteed execution order of hooks in v3.44
- How to ensure storage deletion happens before database deletion
- Context passing between hooks best practices
- Error handling without breaking cascade

### 2. Orphan Detection Strategies

#### A. Recommended Approaches
- How other production Payload apps handle orphaned media
- Best practices for scanning cloud storage
- Efficient orphan detection algorithms
- Batch processing recommendations

#### B. FormMedia Collection Design
- Should FormMedia have proper relationship fields?
- Best practices for tracking submission associations
- Indexing strategies for efficient lookups

### 3. Transaction and Rollback Patterns

#### A. Atomic Operations
- How to ensure both R2 and database operations succeed/fail together
- Rollback strategies if partial deletion occurs
- Best practices for maintaining consistency

#### B. Error Recovery
- How to handle R2 deletion failures
- Database transaction patterns in Payload 3.44
- Cleanup job recovery mechanisms

## Specific Questions for Research

### Critical Questions
1. **In Payload CMS 3.44, what's the recommended way to implement cascade deletion for uploaded files when parent documents are deleted?**

2. **How should we track the relationship between FormMedia and MediaContentSubmissions - using Payload relationships or custom fields?**

3. **What's the best practice for ensuring cloud storage (R2/S3) files are deleted when database records are removed?**

4. **How can we implement transaction-like behavior to ensure both storage and database operations complete atomically?**

5. **What's the recommended pattern for orphan detection in cloud storage when using @payloadcms/storage-s3?**

### Implementation Questions
6. **Should the FormMedia collection use a proper `relationship` field instead of a text `submissionId`?**

7. **How to properly implement beforeDelete hooks that coordinate between multiple collections?**

8. **Best practices for bulk deletion operations in R2/S3 storage?**

9. **How to handle the case where R2 deletion succeeds but database deletion fails (or vice versa)?**

10. **Recommended approach for scheduled cleanup jobs in Payload 3.44?**

## Code Patterns to Research

### Pattern 1: Relationship-based Cascade
```typescript
// Should FormMedia use this pattern?
{
  name: 'submission',
  type: 'relationship',
  relationTo: 'media-content-submissions',
  hasMany: false,
  admin: {
    hidden: true,
  },
  hooks: {
    // Cascade deletion hooks?
  }
}
```

### Pattern 2: Transaction-like Operations
```typescript
// Research: How to implement this pattern in Payload 3.44?
try {
  await beginTransaction()
  await deleteFromR2(files)
  await deleteFromDatabase(records)
  await commitTransaction()
} catch (error) {
  await rollbackTransaction()
  // Recovery logic
}
```

### Pattern 3: Orphan Detection
```typescript
// Research: Most efficient pattern for this?
// Current: R2 → Check DB (slow)
// Alternative: DB → Check R2?
// Or: Maintain reference table?
```

## Resources to Check

### Official Documentation
- Payload CMS 3.44 Storage Adapters guide
- Upload Collections best practices
- Hook execution and context documentation
- Relationship field cascade options
- Transaction and error handling patterns

### GitHub Examples
- Official Payload examples repository
- Production apps using cloud storage
- Community solutions for media management

### Specific Packages
- @payloadcms/storage-s3 documentation
- @payloadcms/plugin-cloud-storage patterns
- Database adapter transaction support

## Expected Deliverables from Research

Please provide:
1. **Best practice examples** for cascade deletion with cloud storage
2. **Code patterns** from official documentation or examples
3. **Recommended architecture** for FormMedia ↔ MediaContentSubmissions relationship
4. **Transaction patterns** for atomic storage + database operations
5. **Orphan detection strategies** used in production
6. **Error recovery patterns** for partial deletion failures
7. **Performance considerations** for bulk operations

## Additional Context Needed

### About Payload CMS 3.44 Specifically
- Any breaking changes from v3.0 to v3.44 regarding storage?
- New features in v3.44 that could help with this issue?
- Known issues or limitations with R2 storage adapter?
- Community plugins or solutions for media management?

### About Production Best Practices
- How do large-scale Payload deployments handle media deletion?
- Recommended batch sizes for bulk operations?
- Monitoring and alerting strategies for orphaned media?
- Backup and recovery considerations?

## Notes for Research

When researching, please look for:
- **Official Payload documentation** (prioritize v3.44 or v3.x)
- **GitHub issues** discussing similar problems
- **Discord/Community** solutions that have been validated
- **Production examples** from real applications
- **Performance benchmarks** for different approaches

---

## How to Use This Document

1. **Copy this document** and use it as a research guide
2. **Search for each topic** in Payload CMS documentation, GitHub, and community resources
3. **Add your findings** under each section with links and code examples
4. **Provide recommendations** based on best practices found
5. **Return the enhanced document** so we can implement the improvements

The goal is to ensure our media deletion system follows Payload CMS 3.44 best practices and handles all edge cases properly.