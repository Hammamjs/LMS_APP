# Change Summary: fix/core Branch

## Overview
This document summarizes the changes made on the **fix/core** branch between commit `471b6405e515291d2034a250a7f5aafcde852665` and `26b63d35d4b2773861ebb2e75819d5bc1a992488`.

## Latest Commit

**Commit Hash:** `26b63d35d4b2773861ebb2e75819d5bc1a992488`  
**Author:** Hammam Hussein (hamamhussein10@gmail.com)  
**Date:** June 6, 2026, 16:03:50 UTC  
**Message:** Add auth interceptor

### Changes in Latest Commit
- Added authentication interceptor functionality
- Parent commit: `9dfb503ad2867dbffa110e370c3ed8f4b8175a38` (Merge PR #87)

---

## Commit History (Recent 10 Commits)

### 1. Add auth interceptor
- **Hash:** `26b63d35d4b2773861ebb2e75819d5bc1a992488`
- **Author:** Hammam Hussein
- **Date:** 2026-06-06 16:03:50 UTC
- **Message:** add auth interceptor

### 2. Merge PR #87: Fix docker command and prisma structure
- **Hash:** `9dfb503ad2867dbffa110e370c3ed8f4b8175a38`
- **Author:** GitHub (merged)
- **Date:** 2026-06-05 10:35:40 UTC
- **Message:** Merge pull request #87 from Hammamjs/fix/docker-prisma - Fix docker command and prisma structure

### 3. Fix docker command and prisma structure
- **Hash:** `776d40097200ce5fd137de1d89e794749009202c`
- **Author:** Hammam Hussein
- **Date:** 2026-06-05 10:34:12 UTC
- **Message:** Fix docker command and prisma structure

### 4. Merge PR #86: Fix package deb
- **Hash:** `8cb96142e5af06ca89818b9b317c04a74406d572`
- **Author:** GitHub (merged)
- **Date:** 2026-06-05 08:53:34 UTC
- **Message:** Merge pull request #86 from Hammamjs/fix/package - fix package deb

### 5. Fix package deb
- **Hash:** `f5ef8138098ea08fcf9f83e7fc78f03f9ff20f7f`
- **Author:** Hammam Hussein
- **Date:** 2026-06-05 08:52:36 UTC
- **Message:** fix package deb

### 6. Merge PR #85: Remove copy prisma to ./prisma
- **Hash:** `c6d5abe054f97e1526144beea7621e5e7937bd75`
- **Author:** GitHub (merged)
- **Date:** 2026-06-05 08:30:38 UTC
- **Message:** Merge pull request #85 from Hammamjs/fix/docker - remove copy prisma to ./prisma

### 7. Remove copy prisma to ./prisma
- **Hash:** `f5c8b0dc6d2f0aa64b1603b1985d1df396a7e45b`
- **Author:** Hammam Hussein
- **Date:** 2026-06-05 08:28:08 UTC
- **Message:** remove copy prisma to ./prisma

### 8. Merge PR #84: RUN pnpm exec prisma generate removed from docker
- **Hash:** `b561083461a17e5f757503c2a101c90c68fb3cef`
- **Author:** GitHub (merged)
- **Date:** 2026-06-05 08:22:49 UTC
- **Message:** Merge pull request #84 from Hammamjs/fix/docker - RUN pnpm exec prisma generate removed from docker

### 9. RUN pnpm exec prisma generate removed from docker
- **Hash:** `0b0fb86a84c907c762c7cb949242527f61415833`
- **Author:** Hammam Hussein
- **Date:** 2026-06-05 08:21:47 UTC
- **Message:** RUN pnpm exec prisma generate removed from docker

### 10. Merge PR #83: Change stripe api version
- **Hash:** `d8efa6bcc6ebb9f55b021b6077fcb14dc228d7ac`
- **Author:** GitHub (merged)
- **Date:** 2026-06-05 08:16:23 UTC
- **Message:** Merge pull request #83 from Hammamjs/fix/stripe - change stripe api version

---

## Key Changes Summary

### Core Changes
1. **Authentication Interceptor** (Latest)
   - New auth interceptor added to handle authentication flows

2. **Docker & Prisma Configuration**
   - Fixed docker command and prisma structure
   - Removed unnecessary prisma generation steps from docker build
   - Removed copy prisma to ./prisma directive
   - Fixed general docker setup

3. **Package Management**
   - Fixed package.json deb configuration
   - Fixed pnpm configuration in package.json

4. **API & External Services**
   - Updated Stripe API version

5. **Application Configuration**
   - Fixed listening port configuration
   - Added npmrc to docker file

---

## Summary Statistics

- **Total Commits Analyzed:** 10 (showing most recent)
- **Latest Commit Date:** June 6, 2026
- **Oldest Commit Date (shown):** June 4, 2026
- **Focus Areas:** Docker configuration, Prisma ORM setup, package management, authentication, API integrations

## Next Steps

For detailed file-by-file changes, view the [full comparison on GitHub](https://github.com/Hammamjs/LMS_APP/compare/fix/core?expand=1).

