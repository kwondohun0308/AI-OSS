# PR Review Guide

## Review Priority
1. Correctness and bugs
2. Security and data safety
3. Performance and scalability
4. Maintainability and readability
5. Test coverage and docs impact

## Comment Tag Policy
- `[MUST]` Blocking issue. PR should not merge before fix.
- `[SHOULD]` Important non-blocking improvement.
- `[NIT]` Minor optional polish.

## Good Comment Examples
- `[MUST] Null case is not handled here. `avg_cycle_time_h` can be null and causes runtime failures in report formatting.`
- `[SHOULD] Consider extracting this API call into a helper for reuse and easier testing.`
- `[NIT] This variable name is ambiguous. Suggest `milestone_number` for clarity.`

## Assignment Evidence (3+ Reviews)
When you review at least 3 PRs/comments, record links here:

1. PR: `<link>`  Comment: `[MUST] ...`
2. PR: `<link>`  Comment: `[SHOULD] ...`
3. PR: `<link>`  Comment: `[SHOULD] ...`

Tip: open each review comment, copy the direct comment URL, and paste it here as evidence.

## Reviewer Checklist
- [ ] Business logic is correct
- [ ] Failure cases are handled
- [ ] Security/privacy risk reviewed
- [ ] Test and documentation impact reviewed
- [ ] Tags `[MUST]/[SHOULD]/[NIT]` applied appropriately
