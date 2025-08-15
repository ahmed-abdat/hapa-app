Improving Media Deletion in Payload CMS v3.44 – Best Practices and Audit
1. Cascade Deletion & Storage Cleanup in Payload CMS 3.44
Payload’s default behavior: Payload CMS does not automatically cascade delete related documents when you delete a parent record. In fact, if you use a required relationship field, deleting the referenced document will fail due to foreign key constraints (since Payload by default sets the relation to NOT NULL without cascade)
github.com
. There is currently no built-in way to specify ON DELETE CASCADE in Payload’s schema config
github.com
. This means we must handle cascade deletions manually using hooks or custom logic. Best practice for cascade deletes: Use collection hooks (e.g. beforeDelete or afterDelete) on the parent collection to perform any necessary cleanup of child records or files. The goal is to prevent orphaned data when an entry is removed. In our case, when a MediaContentSubmission is deleted, we need to also delete all associated FormMedia records and their files from Cloudflare R2 storage. Payload’s official docs encourage using hooks for custom side-effects on delete
payloadcms.com
 since the CMS itself won’t cascade relational deletes for you. Storage adapter behavior: The @payloadcms/storage-s3 plugin (used for R2 integration) will route file uploads and downloads to S3/R2. It does tie into Payload’s deletion lifecycle for single-file records – i.e. if you delete a file record in an upload-enabled collection, the plugin will delete that file from S3. (Payload’s docs note that the delete operation is modified to support file removal
payloadcms.com
.) However, this covers only the scenario of deleting a file itself (e.g. a FormMedia document). It does not automatically know to delete files when some other related document is removed. Thus, for cascade deletes (deleting a submission should delete many files), we must orchestrate that ourselves. Manual cascade via hooks: The implemented solution in hapa-app uses a beforeDelete hook on MediaContentSubmissions to perform cascade cleanup before the submission is removed
GitHub
. This hook finds all related FormMedia and deletes their files and database records, then allows the submission deletion to proceed. This pattern – a custom hook that explicitly deletes child records and their storage assets – is a common approach to cascade behavior in Payload.
2. Relationship Fields vs Plain Text for Associations
In designing the association between MediaContentSubmissions and FormMedia, we have two options:
Payload Relationship field (with relationTo: 'media-content-submissions' on FormMedia, for example).
Plain text ID field (the current approach: FormMedia has a submissionId: text).
Using a relationship field is generally recommended for enforceable links – it makes your data model clearer and allows Payload’s admin UI to provide reference UI (e.g. you could navigate from a FormMedia to its submission if desired). However, due to the lack of cascade settings, a required relationship can block deletions (since the DB will forbid deleting a submission that other docs still reference)
github.com
. If the relationship is non-required (allowing nulls), deleting a submission would set that field to null on all related FormMedia. That avoids an immediate error, but then leaves orphaned FormMedia records with no parent reference (and their files still in storage). You’d still need a hook to clean them up, so a relationship doesn’t solve the cleanup problem – it only adds referential integrity in the database. Using a plain text ID (as done here) trades away automatic integrity for simplicity and control. The FormMedia submissionId is just a string, so deleting a submission doesn’t trigger any DB constraint – the submission can be removed freely. It’s then entirely on our code to find any FormMedia with that ID and remove them. The advantage is flexibility: we avoided the not-null foreign key issue and can perform cascade deletes on our own terms. The downside is that there’s no automatic check that the ID is valid (it could theoretically point to a non-existent submission if something went wrong). In practice, since FormMedia are created via the submission process, this is manageable. Guidelines: If you need strong referential integrity and admin-side linking, use a relationship field. Be aware you must handle cascades manually; one approach is to use an afterDelete hook on the related collection (e.g. on Users, delete their Comments) or implement the DB-level cascade via a schema adapter hack if absolutely needed
github.com
. If, however, enforcing the link in the DB is problematic (e.g. you want to allow deletion of the parent without errors) and the association is primarily used for internal logic (not for admin reference), a text field ID is acceptable. In this project, using a text submissionId simplified the deletion flow – we could delete submissions without DB errors and handle cleanup in code. The key is to then rigorously manage those IDs (which the hooks do). In summary, use relationships for typical content links the admin might manage, but for high-volume, system-generated relations where you need custom cleanup, a plain ID plus hooks can be a valid pattern.
3. Implementing Hooks for File & Record Deletions
Choosing between beforeDelete and afterDelete: Payload offers both. The difference lies in timing and available data:
beforeDelete hooks run before the item is removed from the database. They receive the id of the document, but not the full document data by default
payloadcms.com
. You can still load the document via findByID if needed. If a beforeDelete throws an error, the deletion is aborted and rolled back. This gives you a chance to prevent deletion if cleanup fails (for example). In our case, the MediaContentSubmissions.beforeDelete hook uses the ID to find related files and handle them.
afterDelete hooks run after the document is deleted from the DB
payloadcms.com
payloadcms.com
. They do receive the doc that was deleted (Payload provides the last known data)
payloadcms.com
. At this point, the DB transaction has been committed (the record is gone). You cannot stop the deletion anymore, but you have the data to clean up external resources. If an error happens in afterDelete, it won’t undo the deletion (the record is already gone), so you’d have an orphan file left and no easy way to recover the DB entry. This typically means you should just log the error and perhaps schedule a cleanup retry (because the user can’t “undelete” the item easily).
Best practice: Use beforeDelete if you want the option to cancel the deletion on failure of cleanup (i.e., fail safe – don’t delete the DB record if file cleanup didn’t happen). Use afterDelete if you prefer to always delete the DB record and handle failures in external cleanup asynchronously. There’s no one-size-fits-all – it depends on whether you prioritize consistency or a smooth deletion UX. In our implementation, we chose to always proceed with deletion and not throw on errors, which aligns more with an afterDelete philosophy (except we implemented it in a beforeDelete hook for technical reasons). We did this to avoid a situation where an admin cannot delete a submission because, say, the file storage is temporarily down – we’d rather delete the submission and deal with the file later. This is explicitly a “non-blocking” cleanup approach: file cleanup errors don't prevent submission deletion
GitHub
. The upside is no lingering DB records; the downside is possible orphaned files (which we then clean up with a separate job). Coordinating deletion of R2 files and DB records: The typical sequence (which our cleanupFormMediaHook follows
GitHub
) is:
Gather identifiers for all files that need to be deleted. In cleanupFormMediaHook, we:
Query the FormMedia collection for all records matching the submission ID (these give us filenames)
GitHub
GitHub
.
As a fallback, also extract any file URLs stored on the submission itself (from fields like contentInfo.screenshotFiles or attachmentFiles)
GitHub
GitHub
, and parse filenames. This covers cases where FormMedia docs might not be found or if the submission stored some external link. All collected filenames go into a set.
Delete files from Cloudflare R2 first, in bulk. We use our bulkDeleteFromR2(filenames) utility to remove up to 1000 objects at a time via the S3 API
GitHub
GitHub
. This function returns counts of deleted vs failed deletions. In our case, we log any errors but do not throw – we allow the process to continue even if some files failed to delete. (The rationale is to still remove DB records; those failed files will be caught by an orphan scan later.) Bulk deletion is far more efficient than deleting one file at a time. The code uses Cloudflare’s S3-compatible DeleteObjects command to remove many keys in one request
GitHub
.
Delete the FormMedia database records. After attempting file deletion, we loop through the FormMedia docs and call req.payload.delete({ collection: 'form-media', id: ... }) for each
GitHub
. We pass a special context flag { skipR2Cleanup: true } here. This flag is checked by the FormMedia collection’s own beforeDelete hook so that it doesn’t try to delete the file again when each record is deleted (avoiding double deletion attempts)
GitHub
. This pattern – using a context flag to toggle hook behavior – is a recommended approach in Payload. The docs note you can pass a custom context object through the req that hooks can read
payloadcms.com
. We leverage that to signal “skip file removal, it’s already done.” In code, the FormMedia hook does:
if (req.context?.skipR2Cleanup) {
    return; // skip deleting file from R2, because a bulk operation handled it
}
// otherwise, deleteSingleFileFromR2(...)
GitHub
. We perform all the FormMedia deletions in parallel with Promise.allSettled for speed. Each deletion will run the FormMedia beforeDelete (which in these cases just returns immediately due to the flag). If a FormMedia DB deletion fails (e.g. DB error), we catch it and log it, but again do not abort the whole process
GitHub
GitHub
. By the end of the hook, ideally all related files and records are gone.
Proceed with deleting the submission. Once the hook completes, Payload will continue and actually delete the MediaContentSubmission record. Because we did all the work in beforeDelete and didn't throw, the submission deletion goes through. In the event of any error thrown in the hook, Payload would cancel the submission deletion (the entire operation would rollback). We deliberately avoid throwing; instead we capture errors and let the deletion happen, as per the non-blocking strategy.
Example: If everything succeeds, the submission is deleted, all its FormMedia records are deleted, and their files removed from R2. If some R2 files failed to delete (network glitch, etc.), the submission and FormMedia records are still deleted (we log warnings). This leaves those files orphaned in the bucket. Conversely, if the R2 deletion succeeded but a couple of FormMedia records failed to delete from the DB (imagine a DB issue), those records would remain in the DB (now pointing to files that might actually be gone). We considered these edge cases acceptable given our robust logging and the periodic cleanup jobs (more on that below). Why beforeDelete on the submission? We could have used an afterDelete on MediaContentSubmission since we don’t intend to cancel the deletion on error. Using afterDelete would have given us the submission doc directly (no need for findByID to fetch submission data). In fact, Payload’s hook arguments for afterDelete include doc
payloadcms.com
. This is convenient for extracting any file references. The reason we still used beforeDelete is likely because we wanted all the child deletions to occur within the same database transaction as the parent deletion. By using req.payload.delete(...) inside the beforeDelete, and passing the same req, we ensure these operations are part of the same transaction
payloadcms.com
. If a FormMedia deletion threw an error, it could abort the entire transaction (preventing the parent deletion) – although in our code we suppressed those errors. In an afterDelete, the parent is already gone (transaction committed), so any failure deleting a child record would leave it stranded. In our scenario, both approaches end up with similar outcomes (we’re not aborting on errors anyway), but it’s something to consider. The key takeaway: perform multi-record DB changes within one request/transaction if you want all-or-nothing behavior, by using the provided req in local API calls
payloadcms.com
. If you prefer to decouple them, you can do it after the fact (but risk partial success). Official example: Payload’s docs demonstrate using req.payload inside hooks to perform additional operations within the same transaction, so that if any part fails, everything rolls back
payloadcms.com
. In our case we intentionally caught errors to avoid rollback, but if we had wanted strict atomicity, we could let an error bubble up and Payload would rollback all DB changes automatically (Payload uses transactions for all database writes by default)
payloadcms.com
. This is an important feature: if a hook throws, “any errors thrown will result in all changes being rolled back”
payloadcms.com
. So one could enforce true DB atomicity by throwing on any file/child deletion failure (the submission would remain undeleted in that case). We opted not to do that. Summary of hook best practices:
Keep hooks idempotent and defensive. Deletion hooks should handle missing references gracefully (e.g., if a file was already gone, just log and continue). Our FormMedia hook checks if the document or filename exists before trying to delete, and logs a warning if not
GitHub
.
Use context flags to coordinate between hooks (as with skipR2Cleanup) so you don’t perform duplicate work
GitHub
GitHub
.
Do not mutate data in a beforeDelete hook (you can’t anyway, since deletion has no data to return). Simply perform side effects.
Decide upfront whether to throw on error or not. Both approaches are valid, but document the chosen strategy. We documented that our cleanup is best-effort and won’t stop the deletion
GitHub
.
Ensure hooks run with sufficient privileges. In our case, the hooks use the internal req.payload API which operates server-side with admin rights, so it can delete FormMedia even if the user initiating the submission deletion might not directly have access. This is fine because the cascade hook is part of the admin action.
4. Hook Execution Order & Context Passing
Understanding execution order is important in a cascade scenario:
When a MediaContentSubmission deletion is initiated (either via Admin UI or API), the beforeDelete hooks for that collection fire before the record is removed. In our setup, that triggers cleanupFormMediaHook.
Inside that hook, we invoke req.payload.delete for FormMedia records. Each of those will trigger FormMedia’s own beforeDelete hook (deleteFormMediaFromR2). So effectively, during the execution of the submission’s hook, we have a bunch of FormMedia hooks executing as we call deletes. Each FormMedia beforeDelete runs to delete its file (unless skipped).
Thanks to our skipR2Cleanup context, those FormMedia hooks return immediately without touching R2 when they see the flag
GitHub
. This prevents the R2 deletion from happening twice. The context is carried on req – note that we passed context in the payload.delete options. Payload merges that into the request context for the operation. The FormMedia hook reads req.context and finds our flag. This mechanism of passing data through the request context is extremely useful for multi-hook coordination. The Payload docs explicitly mention a context object that can carry custom info between hooks
payloadcms.com
. Use it to avoid global variables or other hacky solutions. In our case, it cleanly solved the problem of distinguishing a direct FormMedia deletion (e.g. an admin manually deleting a single FormMedia file, in which case we do want to delete the file from R2) versus an automated deletion as part of a larger cascade (where the file is handled in bulk).
After all FormMedia records are processed, control returns to the submission’s hook, which then completes. Finally, Payload proceeds to actually delete the submission from the database.
The order of operations thus is: Submission beforeDelete -> (calls to delete FormMedia -> each FormMedia beforeDelete runs -> each FormMedia record deleted) -> Submission record deleted -> Submission afterDelete (if any defined, we didn’t define one in our case). If we had an afterDelete on submissions, it would run at the very end, after the DB removal. We didn’t need one here. Context best practices: Keep context keys unique enough to avoid collisions (e.g. prefix with something like skipR2Cleanup). Since req.context is just a plain object, choose property names that won’t conflict with others. Only pass JSON-serializable data. And remember that if you make a call like payload.delete without passing req, that will create a new request context (and thus not carry over your context or transaction). In our code we use req.payload.delete which automatically uses the same req. If using the static payload.delete function, you’d want to include the req in options. The difference is subtle but important: using req.payload ensures the request (and its transaction + context) flows into the new operation
payloadcms.com
. Another note: Hook execution order in arrays. If you register multiple hooks of the same type (e.g. two functions in beforeDelete array), they run in order defined. We only have one for each collection here. But if there were multiple, ensure the ordering makes sense (e.g. one might clean up files, another might invalidate some cache, etc.).
5. Transaction Handling and Atomicity
As touched on above, Payload v3 uses database transactions for operations. All the deletions we perform in one request (submission + its media) can be part of a single transaction if done through the provided req. By default, any error that escapes will abort the transaction and rollback all DB changes for that request
payloadcms.com
. Atomic deletion of DB + files: Truly atomic means either both the database record and the files are gone, or neither is. Achieving this is tricky because file storage (Cloudflare R2) is outside the database – it cannot be part of the SQL transaction. There is no built-in two-phase commit across Postgres and S3. Therefore, we approximate atomicity by carefully ordering operations and deciding when to throw errors. Our strategy is biased towards keeping the database consistent and accepting temporary file orphans if needed, which is common in web applications. What if we wanted a stricter approach? One idea could be: attempt file deletions before committing the transaction, and if any file deletion fails, throw an error to abort the whole transaction. The outcome: the user sees a failure, the submission remains in the DB (so the files are still referenced), and we haven’t lost track of anything. The user could retry the delete later. This gives stronger consistency (no ghost files without DB references, and no DB refs to missing files), at the expense of user experience. Our implementation could easily be tweaked to do this: just throw an exception if r2Result.failed > 0 or if any failedRecords occurred (we currently log a warning and continue)
GitHub
GitHub
. If we threw, Payload would roll back the submission deletion (and any FormMedia deletions that succeeded would also be rolled back, thanks to the transaction). Important: The file deletions to R2 would not roll back (you can’t “undo” an S3 deletion via transaction), so you might end up having removed some files from storage before the error occurred. In that scenario, the DB would still have records for those files (since the DB rollback restored them), but the files are gone – essentially the inverse of our current orphan scenario. This might actually be worse, because now the admin sees records that point to files that no longer exist. You’d then need a different cleanup to handle “missing file for existing record” (like regenerating or notifying about missing files). So, truly atomic behavior is impossible across these boundaries. The best we can do is choose which side to favor: we chose to favor DB deletion going through, accepting orphaned files as the fallout. The opposite strategy (favor keeping DB if file deletion fails) would result in orphaned DB records referencing non-existent files. In our judgment, those are more problematic for the app (users might click a media entry that 404s) than leftover files (which just consume storage but aren’t visible in the CMS). This aligns with Payload’s general approach for upload collections: if a file deletion fails, they typically log and allow the DB op to continue (to avoid broken admin UI). Our approach is consistent with that philosophy. Transactions usage in our code: We ensure all DB actions occur within the main request’s transaction by using req.payload.* calls. For instance, the code req.payload.find and req.payload.delete all utilize the same req object, carrying req.transactionID internally
payloadcms.com
. If an unhandled error were thrown at any point in those calls, it would bubble up and trigger a rollback. Because we handle errors manually, we did not leverage automatic rollback, but it’s good to know it’s there. Payload confirms: “any errors thrown will result in all changes being rolled back without being committed.”
payloadcms.com
. Recovery logic: Since we don’t rollback on partial failures, our recovery plan is logging + later reconciliation. We’ll discuss the orphan cleanup job below, which is our way of handling any non-atomic leftovers. In summary, achieving atomic multi-resource deletion requires a combination of DB transactions (for the DB part) and careful consideration of external side effects. One could implement a compensating transaction – e.g., if file deletion fails and you’ve decided not to rollback the DB, you might create a “to-be-deleted later” record, or mark something in the DB that indicates cleanup needed. Our approach is to log and use external jobs to compensate after the fact, which is a form of eventual consistency.
6. Orphan Detection and Cleanup Strategies
Orphan files (files in storage with no corresponding DB record) can occur for the reasons discussed (non-atomic deletes, or possibly manual file uploads that never got linked, etc.). We implemented a robust orphan scanning job to identify and clean these up. The strategy is:
Scanning by listing storage: We use the R2 API to list objects in the bucket (with a prefix filter for our folder, e.g. all files under forms/ which is where form uploads reside)
GitHub
. For each file key returned, we extract the filename and query the Payload database to see if a FormMedia entry with that filename exists
GitHub
. If no record is found, we consider that file orphaned and add it to a list
GitHub
. This approach is efficient when the number of files in storage is not astronomically large – Cloudflare R2 (like S3) can list buckets in batches of 1000 keys. We do batch listing with pagination (continuation tokens) until we’ve scanned all or a predefined maximum. In our implementation, we allow a maxFiles limit to avoid scanning an extremely large bucket in one go, and a retentionDays setting to ignore very new files (we assume files younger than, say, 30 days might be part of recent submissions and not yet subject to cleanup, or we simply want to skip them for now to avoid race conditions where a file is uploaded but the submission is not yet saved)
GitHub
GitHub
. These parameters make the scan configurable.
Alternate approach – scanning DB for orphans: One could do the inverse: iterate over FormMedia records and check if each file actually exists in R2. This might be useful to catch the scenario of DB records whose file got lost (e.g., if someone manually deleted a file from the bucket or a previous bug removed files without updating DB). However, checking existence of each file via an API call is slow if you have many records. It’s usually more efficient to list bucket contents once and compare, than to make a HEAD request for every DB entry. Our implementation focuses on files-without-DB. We labeled the job types accordingly: a “Verification Scan” (dry-run) and a “Cleanup Orphaned Files” (perform deletion) are supported by our media-cleanup-jobs logic
GitHub
GitHub
.
Performing deletions in bulk: Once orphaned files are identified, we use a similar bulk deletion mechanism to remove them from R2. The deleteOrphanedFiles function takes an array of file keys (paths) and issues S3 DeleteObjects calls in batches of 1000
GitHub
GitHub
. We mark any errors (if a particular file failed to delete, perhaps due to permission issues) and count successes
GitHub
. Typically, orphan cleanup should successfully delete all, but we account for failures (e.g., if a file was removed between scan and delete, the delete might return a KeyNotFound error – which is harmless). Our job records track how many were deleted vs failed
GitHub
GitHub
.
Orphaned DB records (no file): As noted, our scan as written finds files with no DB entry. What about the opposite – a FormMedia entry whose file isn’t in R2? This is rarer but can happen (as in the scenario of a transaction rollback after file deletion, or manual file removal). We did not explicitly implement a scanner for that. However, one could extend our strategy: iterate FormMedia docs and attempt a HeadObject on R2 for each filename to see if it exists. Or maintain a field like fileStatus to flag if the physical file was missing. In practice, because Cloudflare R2 has no built-in event to notify us of deletions, a periodic scan might be needed for that as well. In our case, since most operations go through our controlled hooks, we expect few “file-missing” cases. Still, it’s worth noting as a potential enhancement.
Indexing and efficiency: We use the FormMedia filename to look up records
GitHub
. Payload automatically creates a unique index on the filename field in an upload collection (since filename by default must be unique within that collection, unless using the filenameCompoundIndex option). Thus, the query where: { filename: equals: X } should be very fast. We also only retrieve a limit of 1 record
GitHub
 – we don’t need more because filename is unique. This ensures our scan-loop spends minimal time on the DB (a quick index lookup per file). The potentially heavier part is listing possibly thousands of files from R2. In testing, R2’s list performance is good for reasonable bucket sizes, but if the bucket had millions of files, we might need to break down by prefixes (e.g., list per subdirectory) or increase our maxFiles and do it in batches over multiple runs.
Scheduling: We created an on-demand admin API endpoint (/api/admin/media-cleanup) to trigger scans and cleanups
GitHub
GitHub
. An admin can initiate a scan (dry-run) to see how many orphans exist, then possibly trigger the cleanup. This could be further automated (e.g., run weekly via a cron job or a serverless function). Payload doesn’t have a built-in scheduler, but one can integrate Node cron or use an external trigger hitting that endpoint. We log the results in a dedicated MediaCleanupJobs collection for transparency
GitHub
GitHub
. Each job record stores metrics like filesScanned, orphanedFilesFound, filesDeleted, etc., and even an array of the orphan files (with their names and sizes)
GitHub
GitHub
. This is extremely useful for auditing and tracking storage issues over time. It allows us to answer “how many orphan files did we clean up last month” or identify any problematic files that repeatedly fail to delete.
Retaining data for analysis: We decided to keep the job records rather than immediately deleting them after completion. They serve as an audit log. They also have statuses (Pending, Running, Completed, Failed, Partial)
GitHub
GitHub
. For example, if a cleanup job ran and some deletions failed, the job might be marked “Partially Completed” and list those files with status “failed” in the orphanedFiles array
GitHub
GitHub
. An admin could then investigate those specific files (maybe a permissions issue or the file was locked, etc.).
Orphan prevention: Of course, the first line of defense is to prevent orphans in the first place via the hooks. But as discussed, even with hooks, network or service errors can always cause a few misses. Having the scanning job is a good safety net and is considered a best practice in storage management – essentially a periodic “garbage collection” of cloud storage. Another prevention strategy is to leverage lifecycle rules on the storage side (for example, Cloudflare R2 could have a rule to auto-delete objects with a certain tag or in a certain folder after X days). But since we want fine control, our approach via the application layer is more targeted (and R2 lifecycle rules wouldn’t know which files are truly orphan without integration).
Orphan DB records cleanup: If we wanted to handle the opposite case (DB records with missing files), we could create a similar job or extend the existing one to mark those. For example, the job could set a flag on any FormMedia whose file isn’t found (or just outright delete those records as they’re broken references). This isn’t implemented yet, but it’s mentioned as a potential future enhancement. Our documentation “Future Enhancements” section even lists a “Cleanup Verification Job” to periodically verify and fix missed cleanups
GitHub
 – which could include verifying that for every FormMedia record, its file exists (and if not, maybe mark it or remove the record).
In conclusion, efficient orphan detection uses bulk operations: list all files, and do indexed lookups in DB for existence. The efficient cleanup uses bulk deletion API calls. Both approaches minimize per-object overhead. We also use filtering (prefix and retentionDays) to limit the scope and avoid false positives (e.g., very recent uploads that might still be in process are skipped). This keeps the process performant even as the number of files grows.
7. Performance & Batch Processing Tips
When dealing with potentially large numbers of files and records, performance considerations are crucial:
Batch your operations: As noted, use the S3 DeleteObjects to remove up to 1000 objects in one API call
GitHub
. In our hooks, we collected all filenames first and did one bulk delete for all of them
GitHub
GitHub
. This is more efficient than calling delete per file, especially if a submission had many attachments. Similarly, if you ever needed to delete hundreds of submissions at once, you might batch those (though Payload’s admin UI deletes one by one; a custom script could batch them).
Parallelize where safe: We run the deletion of multiple FormMedia records in parallel (Promise.all). This utilizes multiple DB queries concurrently, which our Postgres adapter and pool can handle. We configured the DB pool to a higher size for production (max 25) to allow concurrent operations
GitHub
. This ensures that deleting, say, 10 files doesn’t serialize into 10 sequential delete queries unnecessarily. However, you must be mindful of not overloading the DB with too many at once. In our context, a single submission likely has at most a handful of files (maybe a few dozen in worst case). Even if it had 100+, doing them concurrently is usually fine. If we were deleting thousands of records in one go, we might implement a more explicit batching (e.g., delete 100 at a time, wait, then next 100) to avoid saturating the database or running into transaction size limits.
Avoiding timeouts: Deleting a submission with associated files triggers a lot of work – file deletion calls to R2, multiple DB deletions, etc. This all happens during the HTTP request that initiated the deletion. We want to avoid the scenario where the admin UI times out (say, after 30 seconds) because the cleanup is still running. Our optimizations (bulk delete, parallel DB ops) help minimize the time. In testing, these operations are quite fast (bulk delete of a dozen files takes a second or two at most). If a submission had massive numbers of files (hundreds+), there is a slight risk of a slow operation. One mitigation could be moving heavy cleanup to an asynchronous job queue (let the deletion return quickly and do cleanup in the background). But that introduces complexity (the record would be gone while files still linger until the job finishes). In our case, we found the performance acceptable with the measures in place. We also increased some Payload DB timeouts (e.g., statement timeout 45s) just in case
GitHub
, to accommodate longer-running operations in rare cases.
Database indexing: Ensure that any fields you query in the cleanup process are indexed. As mentioned, FormMedia filename is indexed (unique) by default. We also query FormMedia by submissionId in the hook
GitHub
. That field is a simple text field – we should check if Payload automatically indexed it. Payload does not automatically index arbitrary text fields. Since we frequently do where submissionId = ..., it would be wise to add an index in the database for that. We did mark submissionId as a listSearchableField
GitHub
, but that’s for admin UI search, not an actual index. A future schema migration could add an index on form_media.submissionId. This would accelerate the lookup of all media for a given submission. (Currently, if that collection is large, the find query could be slower without an index. Given this system likely isn’t dealing with huge numbers of files per submission, it hasn’t been an issue, but it’s a tuning point.)
Bulk deletion of submissions (admin UI): Payload’s admin UI allows selecting multiple items and deleting them, but under the hood, it likely calls the DELETE API for each item in turn (not truly a single bulk API call). This means if an admin selects 10 submissions to delete, our hook will run 10 times sequentially. Each will handle its own files. There’s not much we can do to batch across separate submissions in that scenario (each submission is independent). But it’s worth noting that if an admin did a bulk delete of, say, 50 submissions, it will trigger 50 separate cleanup processes back-to-back. Our code can handle it, but it will put load on the system. Monitoring is key in such cases.
Memory usage: When building arrays of filenames or orphan file lists, be mindful of memory. We use a Set to collect filenames in the hook
GitHub
. That should be fine as the numbers are not huge. In the orphan scan, we push objects for each orphan file into an array (potentially thousands). We had a maxFiles limit of 1000 by default to not blow up memory with an enormous list
GitHub
GitHub
. This is a reasonable safeguard. If one needed to clean more than that, they could increase maxFiles or run multiple passes (the code can accept a query param to set maxFiles).
Batch operations in database: If we wanted to delete all FormMedia for a submission in one go at the SQL level, we could use a custom query (DELETE FROM form_media WHERE submissionId = X). But doing so would bypass Payload’s hook on FormMedia (which deletes the file). Since we implemented file deletion in our own cascade already, we could have opted for direct SQL deletion for speed. However, our approach deletes each record via Payload so that the operation goes through Payload’s normal lifecycle (ensuring any other side effects or constraints are honored). This is safer. The overhead of deleting (even a few hundred) records one by one within a transaction is usually fine. If this were thousands, direct SQL might be considered with careful handling.
Asynchronous vs synchronous jobs: We chose to do the cleanup synchronously in the request. Another approach is to mark the submission as “pending deletion” and let a background worker do the cleanup asynchronously (and then actually delete the submission record after files are removed). This is more complex and wasn’t necessary for our scale. For very large file systems, that pattern can be used (it’s similar to how some systems do “soft delete then async hard delete”).
Our internal documentation notes a few performance considerations we followed: using R2 bulk delete, parallel DB deletions, etc., to prevent timeouts
GitHub
GitHub
. It also suggests future optimizations like scheduling jobs for cleanup so they don’t always run inline with user actions
GitHub
 (in our case, we built the job system for orphan cleanups, which is run on-demand or scheduled externally, not during user deletion actions). In short, batch as much as possible, parallelize within reason, index your queries, and keep an eye on timeouts. The current implementation adheres to these: it batches file deletion, parallelizes DB work, and has reasonable limits to avoid runaway processes.
8. Error Handling, Recovery, and Monitoring
Even with the best code, things can go wrong (e.g., network blip, permission error, logic bug). Our strategy for error handling in deletions is:
Log everything relevant. We use a structured logger to record info, warnings, and errors. For example:
On starting a cleanup, we log an info: “Starting FormMedia cleanup for submission X”
GitHub
.
If an individual file fails to delete from R2, the FormMedia hook logs an error with the file name and error message
GitHub
GitHub
.
If a FormMedia record fails to delete from the DB, we catch and log an error with that record’s ID and message
GitHub
GitHub
.
After the process, we log a summary at info or warn level (warn if there were any failures) indicating how many files were deleted vs failed, etc.
GitHub
.
These logs are invaluable for monitoring. In a production environment, one should monitor the logs for any warnings or errors tagged with these cleanup operations. Our doc suggests setting up alerts for cleanup failures
GitHub
GitHub
 (e.g., an email or Sentry alert if we see a “❌ Failed to delete FormMedia record” or similar).
Non-blocking error handling: As described, we chose to not throw on errors in hooks. Instead, we gracefully degrade – meaning we allow the process to continue and simply note what failed. Our documentation explicitly highlights this: “File cleanup errors don’t prevent submission deletion – prevents database inconsistency issues – and we do comprehensive logging for debugging.”
GitHub
. We then continue even if individual files fail
GitHub
. This way, a single point of failure (like one file out of 10 couldn’t be deleted) doesn’t halt the entire operation. It results in a partial success (most things cleaned, one orphan left). We mark that in logs and in our job records as a partial status if applicable.
Recovery mechanisms: The primary recovery for orphaned files is the MediaCleanupJobs system (orphan scan and cleanup job). If any files were not deleted in the initial pass, they will show up as orphaned on the next scan. We can then delete them. We could even automate: if bulkDeleteFromR2 returns some failures, we might immediately try to call deleteOrphanedFiles on those failed keys a second time or schedule a retry after a short delay. Currently, we do not retry immediately in the hook (to keep it simple and fast). But an improvement could be to implement a small retry for storage ops (sometimes a transient error can be resolved by a second attempt). Our design is that an admin can always run a manual cleanup job to catch any stragglers.
Monitoring success metrics: We store metrics in each job (number of files deleted, errors, etc.)
GitHub
GitHub
. Over time, one can monitor these job entries to see if the situation is improving or if certain patterns of failure are emerging. For example, if every time we delete a submission with videos larger than X MB we see failures, that might indicate a timeout issue in R2 for large files. With our logging and metrics, we can detect that.
Alerting: As a best practice, integrate with a monitoring service. For instance, sending logs to a service like Sentry, DataDog, or even CloudWatch and setting up an alert for “error in FormMediaCleanup” would notify developers if something consistently fails. Our logs include tags like component: 'FormMediaCleanup' and actions like 'record_deletion_failed'
GitHub
 or 'file_deletion_failed'
GitHub
, which make them searchable.
Admin UI monitoring: We built a custom admin dashboard view for media-cleanup-jobs
GitHub
. This provides a user-friendly way to review orphan files found and cleaned. An admin can open the “Media Cleanup Jobs” in the admin panel and see any jobs that are in “failed” or “partial” state, then drill in to see the file list. This is a great operational tool. For instance, if there’s a file that failed to delete due to some weird character in its name, the admin might see it in the list and decide to handle it manually.
Partial failures: If a cleanup job itself fails halfway (e.g., the scan couldn’t complete due to an R2 outage), we catch exceptions and update the job status to "failed" with an error message
GitHub
GitHub
. This way it’s recorded and can be retried later. The job system ensures we don’t silently ignore failures in background maintenance tasks.
Rollback vs manual fix: As discussed, because we don’t roll back DB changes on file failures, our “manual fix” is essentially to remove the file later. If we had rolled back instead, the manual fix would be to somehow re-trigger deletion of the submission once issues are resolved. That’s more cumbersome for admins (they might have a submission stuck that they keep trying to delete). So we’ve optimized for the admin workflow at the cost of needing to occasionally clean up leftover files – which our tooling makes easy.
Edge cases to monitor: We should watch for any unexpected orphan creation. For example, if we discover via the orphan scan that a lot of files are orphaned even though no corresponding submission deletion is recorded, that could indicate a bug in the upload or linking process (files added but not saved in DB). So the orphan cleanup can also catch other issues in the system outside of deletions. Monitoring trends (if orphan count suddenly spikes) can reveal such problems.
Testing error scenarios: We included in our docs test scenarios for error cases (e.g., simulate R2 service unavailable)
GitHub
. During development, one should test what happens if the R2 client throws an error – does our hook handle it gracefully? According to our code, if R2 bulk deletion completely fails (say R2 is down), we log an error
GitHub
 and proceed to delete all FormMedia records anyway. That would leave all files orphaned. The admin would get a success message for the deletion (since we didn’t throw), but behind the scenes our logs show it was incomplete. To improve, we might want to notify the admin in such a case. Currently, they wouldn’t know unless they check logs. A possible enhancement is to surface a warning in the UI when partial cleanup happened. Payload doesn’t have a built-in mechanism to do that on delete operations, but we could perhaps intercept the response. For now, it’s an internal concern.
Future improvements: Our internal checklist mentions adding metrics dashboard and possibly scheduling periodic verification jobs
GitHub
. Those would enhance monitoring. Another idea is to integrate Cloudflare R2 analytics or storage metrics – for instance, alert if storage usage isn’t dropping after deletions, meaning orphans might be accumulating. We already plan to track storage space reclaimed per cleanup job
GitHub
, which is useful for quantifying impact (e.g., “we freed X MB by cleaning orphans”).
In summary, our error handling is robust logging + out-of-band cleanup. We ensure that failures are recorded and can be acted upon, rather than stopping the whole process. This approach is aligned with best practices for long-running background-like processes: do as much as you can, report what you couldn’t, and provide tools to reconcile later
GitHub
GitHub
.
9. Analysis of Current Implementation in ahmed-abdat/hapa-app
Finally, let’s review how the above best practices are reflected (or could be improved) in the repository’s current code:
MediaContentSubmissions & FormMedia structure: The MediaContentSubmissions collection contains fields for file references (screenshotFiles array inside contentInfo, and an attachmentFiles array) which store just URLs
GitHub
. It does not directly reference FormMedia by ID. Instead, the form submission process likely creates FormMedia records for each upload and populates these URL fields with the file’s URL (e.g. /api/form-media/file/<filename>). The FormMedia collection has fields like submissionId (text) to link back, plus metadata like formType, fileType, etc.
GitHub
. This separation ensures that form-uploaded files are not mixed with the main Media library. It also means the admin UI for submissions just shows the files via those URLs (with a custom UI component to display them without exposing the raw URL)
GitHub
. This is a sensible design given the requirements.
Deletion hooks in place: We have:
MediaContentSubmissions.beforeDelete = [cleanupFormMediaHook]
GitHub
.
FormMedia.beforeDelete = [deleteFormMediaFromR2]
GitHub
.
No afterDelete hooks are defined, which is fine because we handled everything in beforeDelete. The ordering and interplay of these hooks we discussed in section 4 are implemented exactly as intended.
Use of skipR2Cleanup: This flag is used in cleanupFormMediaHook when calling req.payload.delete on FormMedia
GitHub
, and checked in deleteFormMediaFromR2
GitHub
. The naming is clear and the usage is correct. One thing to verify is that all code paths deleting FormMedia as part of submission deletion do set this flag. Our hook does. If there are any other places FormMedia might be deleted in bulk (perhaps in our manual cleanup job if we ever decided to purge orphan FormMedia records), we should also use the flag or otherwise handle R2 deletion appropriately. Currently, orphan cleanup focuses on files with no records, not on records with no files, so that’s not directly applicable yet.
MediaCleanupJobs logic: The repository implements MediaCleanupJobs collection as an admin-facing log of orphan scans/cleanups
GitHub
GitHub
. The API route /api/admin/media-cleanup can handle GET (for scan) and presumably POST (for deletion) – looking at the code:
A GET request triggers a verification scan (dryRun) – it creates a job with type 'verification' and status 'running', executes scanForOrphanedFiles, then updates the job to completed with the list of found files (status 'found') but does not delete them (since dryRun)
GitHub
GitHub
.
A POST (not fully shown in the excerpt we opened) likely triggers the actual deletion of provided orphaned files. I see in the search results an entry at [37] around line 373-410 where jobType: dryRun ? 'verification' : 'cleanup' is set and later status: cleanupResult.failed > 0 ? 'partial' : 'completed'
GitHub
. So if the request is made with dryRun=false and a list of files, it will perform deleteOrphanedFiles and update the job accordingly
GitHub
GitHub
. This means an admin could run a scan (to see what would be deleted), then run a cleanup (which posts the list of orphan files to delete). This two-step approach is nice for safety. The UI component MediaCleanupDashboard likely provides buttons to do this and to display results.
The job record stores details including the list of orphan files (orphanedFiles array with each file’s status)
GitHub
GitHub
, and metrics like how much storage was reclaimed (storageReclaimed in bytes)
GitHub
. This is very thorough. It aligns with best practices of having transparency and not just blindly deleting data in the background. An admin can review what was found and what was done.
Assessment: The current implementation follows Payload’s best practices closely and adds a lot of intelligent enhancements:
It uses hooks exactly as intended to solve the cascade deletion (since Payload doesn’t do it natively) – effectively implementing our own cascade in application logic
GitHub
.
It leverages Payload’s transaction (by using the same req) and context passing to orchestrate complex behavior across two collections
GitHub
GitHub
.
It does not attempt risky DB-level hacks (like adding actual foreign key constraints with cascade) – those can be done (as shown by a user workaround in the Payload issue
github.com
github.com
) but are not officially supported and could break with migrations. Instead, the code approach is safer and more flexible.
The system accounts for partial failures and has a plan to handle them (via logs and the cleanup job). This is explicitly a best practice: assume that at some point, something will fail, and have a way to detect and fix it.
Possible improvements: Based on best practices, here are a few suggestions going forward:
Index the submissionId field on FormMedia (if not already). This will make the find query in cleanupFormMediaHook faster for large datasets.
Handle DB-orphaned records: Consider extending the cleanup job to identify FormMedia records whose file is missing in R2 (e.g., do a HEAD request for each, or perhaps cross-check orphaned file list against FormMedia list). This would catch cases where a file was deleted out-of-band. It’s a complementary check to the current orphan file scan.
User feedback on partial errors: Right now, if a deletion has partial failures, the admin UI likely just shows “Deleted successfully” (since from Payload’s perspective it didn’t error). It might be useful to surface a warning if not everything cleaned. For example, one could attach a custom response in afterDelete of submission to include a warning field, or more simply, log it prominently so the dev/admin monitoring knows. In a future Payload version, perhaps the UI could show non-critical warnings. This is minor, but worth noting.
Thumbnail files deletion: If any image sizes or thumbnails are generated (the Media collection has some sizes defined; the FormMedia collection in our case did not define imageSizes, it only set a prefix in beforeChange hook), we should ensure those are also deleted. In FormMedia’s deleteFormMediaFromR2 hook, there’s a TODO about handling mediaDoc.sizes if present
GitHub
. Since FormMedia doesn’t specify imageSizes, Payload wouldn’t generate alternate sizes for those (they are treated as raw files). So this might not apply. But if in the future we add image resizing for form uploads, we’d need to delete not just the main file but all resized variants. The storage-s3 plugin might automatically handle deleting all sizes if it knows them; if not, we’d have to iterate mediaDoc.sizes and delete those keys too.
Ensure consistent use of hooks for all file deletions: If there are other collections storing files (e.g. the main Media library), make sure similar hooks or plugin configuration is in place. The main Media collection likely relies solely on the storage plugin’s automatic behavior. That’s fine, as those are single-file deletes typically. Just verify that deleting an entry from Media does remove it from R2 (with our config, it should, since we enabled the plugin on that collection).
Document and train: This is not code, but a best practice – ensure the engineering team and content admins understand this system. The presence of the admin dashboard for cleanup helps demystify it. Our documentation in MEDIA_CLEANUP_IMPLEMENTATION.md is comprehensive
GitHub
GitHub
. Keeping such docs up to date and ensuring team members know how to run a scan or interpret logs is important for long-term maintenance.
Overall, the media deletion system implemented is in line with official recommendations (use hooks to handle related data) and extends it with a thoughtful approach to cloud storage management. By following the best practices outlined – such as using transactions, not suppressing errors without backup plans, batching operations, and monitoring regularly – we have a robust solution for Payload CMS v3.44. Sources:
Payload CMS Documentation – Hooks and Transactions
payloadcms.com
payloadcms.com
payloadcms.com
Payload CMS GitHub Issue #11177 (Cascade delete discussion)
github.com
Project Code (hapa-app) – Implementation of deletion hooks and cleanup logic
GitHub
GitHub
GitHub
GitHub
Project Documentation – Media Cleanup design and error handling strategy
GitHub
Cloudflare R2 Integration Guide (for general context on storage adapter usage)
bridger.to
bridger.to
 (setup example)
Community Q&A – Best-effort file deletion via hooks (Reddit discussion)
reddit.com
reddit.com
 (illustrating common approach).
Citations

foreign keys with cascade delete · Issue #11177 · payloadcms/payload · GitHub

https://github.com/payloadcms/payload/issues/11177

Collection Hooks | Documentation - Payload CMS

https://payloadcms.com/docs/hooks/collections

Uploads | Documentation | Payload

https://payloadcms.com/docs/upload/overview
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L53-L62

foreign keys with cascade delete · Issue #11177 · payloadcms/payload · GitHub

https://github.com/payloadcms/payload/issues/11177

foreign keys with cascade delete · Issue #11177 · payloadcms/payload · GitHub

https://github.com/payloadcms/payload/issues/11177

Collection Hooks | Documentation | Payload

https://payloadcms.com/docs/hooks/collections

Collection Hooks | Documentation | Payload

https://payloadcms.com/docs/hooks/collections

Collection Hooks | Documentation | Payload

https://payloadcms.com/docs/hooks/collections

Collection Hooks | Documentation | Payload

https://payloadcms.com/docs/hooks/collections
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L160-L168
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L81-L90
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L112-L120
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L16-L25
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L26-L34
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L78-L86
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L96-L104
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L175-L184
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L163-L171
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L189-L193
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L173-L181
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L175-L184

Transactions | Documentation | Payload

https://payloadcms.com/docs/database/transactions

Transactions | Documentation | Payload

https://payloadcms.com/docs/database/transactions
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L200-L208
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L100-L108
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L60-L68
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L85-L93
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L96-L104
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L52-L60
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L76-L84
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L40-L49
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L20-L28
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L160-L169
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L179-L187
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L24-L32
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L26-L34
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L86-L94
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L211-L220
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L224-L233
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L10-L18
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L31-L39
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L110-L119
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L170-L180
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L62-L71
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L76-L84
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L196-L205
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L200-L208
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L324-L332
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L154-L162
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L155-L163
GitHub
payload.config.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/payload.config.ts#L127-L135
GitHub
payload.config.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/payload.config.ts#L134-L142
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L82-L90
GitHub
FormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia.ts#L42-L45
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L109-L117
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L24-L32
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L261-L269
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L263-L271
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L273-L277
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L74-L82
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L62-L71
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L64-L72
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L179-L188
GitHub
cleanupFormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/hooks/cleanupFormMedia.ts#L194-L203
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L254-L262
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L255-L263
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L165-L168
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L28-L36
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L22-L29
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L14-L21
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L32-L36
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L228-L236
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L160-L168
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L159-L167
GitHub
index.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/index.ts#L548-L556
GitHub
FormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia.ts#L176-L185
GitHub
index.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/index.ts#L563-L571
GitHub
index.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaContentSubmissions/index.ts#L813-L815
GitHub
FormMedia.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia.ts#L81-L85
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L243-L253
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L270-L278
GitHub
route.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/app/api/admin/media-cleanup/route.ts#L20-L29
GitHub
MediaCleanupJobs.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/MediaCleanupJobs.ts#L170-L179

foreign keys with cascade delete · Issue #11177 · payloadcms/payload · GitHub

https://github.com/payloadcms/payload/issues/11177

foreign keys with cascade delete · Issue #11177 · payloadcms/payload · GitHub

https://github.com/payloadcms/payload/issues/11177
GitHub
deleteFromR2.ts

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/src/collections/FormMedia/hooks/deleteFromR2.ts#L230-L238
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L31-L41
GitHub
MEDIA_CLEANUP_IMPLEMENTATION.md

https://github.com/ahmed-abdat/hapa-app/blob/bcdc2c25b4560ce94cdfd49d288d82d8cbb4f92e/docs/MEDIA_CLEANUP_IMPLEMENTATION.md#L160-L169

Use Cloudflare R2 with Payload CMS

https://bridger.to/payload-r2

Use Cloudflare R2 with Payload CMS

https://bridger.to/payload-r2

Delete files in bucket : r/PayloadCMS

https://www.reddit.com/r/PayloadCMS/comments/1hla7xl/delete_files_in_bucket/

Delete files in bucket : r/PayloadCMS

https://www.reddit.com/r/PayloadCMS/comments/1hla7xl/delete_files_in_bucket/
All Sources