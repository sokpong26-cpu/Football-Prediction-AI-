# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Identity Ownership**: Every document in `photoScans`, `signals`, and `cloudflareConfigs` MUST specify `ownerId == request.auth.uid`, and `ownerId` is immutable after creation.
2. **Email Verification Gate**: Every write operation requires `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Isolation**: Email, phone number, bio, and linked game account IDs live strictly inside `/users/{userId}/private/info`, readable and writable only by the owner (`request.auth.uid == userId`) or a verified admin.
4. **Privilege Escalation Prevention**: Users cannot assign or promote their own `role` or `vipTier` (`free` on creation unless written by verified admin), nor write into `/admins/{userId}`.
5. **Server Timestamp Integrity**: `createdAt == request.time` on creation, `createdAt` immutable on update, and `updatedAt == request.time` on update.
6. **Bounded Resource Sizes**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), every string has explicit `.size()` limits, and `safeColumns` arrays are strictly bounded to `<= 10` numeric column indices (`0..4`).

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated write to `/photoScans/scan_1`.
2. Write with unverified email (`email_verified: false`) to `/photoScans/scan_2`.
3. Identity spoofing: User A writes `/photoScans/scan_3` with `ownerId: "user_B"`.
4. Shadow/ghost field injection: Adding `"isAdmin": true` on `/users/user_A` creation.
5. Client self-promotion: Creating `/users/user_A` with `vipTier: "vip_lifetime"`.
6. Timestamp tampering: Creating `/photoScans/scan_4` with backdated `createdAt`.
7. Mutable `ownerId` attack: Updating `/photoScans/scan_1` to reassign `ownerId`.
8. Mutable `createdAt` attack: Updating `/cloudflareConfigs/cfg_1` changing `createdAt`.
9. Oversized payload poisoning: Injecting a 200KB base64 image string into `summaryTitle` or `answerExplanation`.
10. Invalid document ID poisoning: Writing `/signals/bad..id$with/slashes` exceeding allowed characters/length.
11. Unbounded array attack: Writing `safeColumns` with 50 elements (`> 10` limit) or non-number values.
12. Cross-user PII snooping / blanket list query: User A reading `/users/user_B/private/info` or querying `photoScans` without `where('ownerId', '==', auth.uid)`.
