# Changelog

## 0.3.1

- Added a ready-to-import recurring profile and post monitoring workflow.
- Simplified the node to user-facing workflow and output controls.

## 0.3.0

- Renamed the node to **Facebook Profile & Posts Scraper**.
- Added a clear Profile / Profile + Posts / Search mode selector.
- Added exact inclusive post date filters (`postsSince`, `postsUntil`) while
  preserving the existing relative `sinceDays` option.
- Aligned the request contract with Actor version 2.2 and its typed profile/post
  output.

## 0.2.0

Brought the node up to date with the current Facebook Page Scraper actor.

- Simplified connection settings so the node exposes only user-facing workflow controls.
- **Added keyword search**: find pages by `searchKeywords` (+ optional
  `searchLocation`) instead of URLs. `profileUrls` is now optional — provide URLs
  or keywords.
- **Added recent posts** (opt-in): `scrapePosts`, `maxPosts`, `sinceDays`,
  `postKeyword`. Posts come back as extra rows with `type=post`.
- **Added contact enrichment**: website email fallback (`enrichEmailViaGoogle`)
  and `emailDomains` filter.
- Added clearer workflow defaults for search and profile processing.
- Output now includes `bestContact`, engagement metrics, Instagram / Messenger /
  WhatsApp links and cross-platform search URLs.
- Renamed the node label to **Facebook Page Scraper**.

## 0.1.0

- Initial release.
- `Facebook Profile Scraper` node: real-time scraping of public Facebook
  profiles and pages, no login.
- Fields: name, bio, username, followers, likes, public emails, public phones,
  website, verification badge, page category, 0-100 activity score.
- Supports both /username/ and /profile.php?id=... URL formats; multiple URLs
  scraped in parallel.
- `Apify API` credentials with token test against `/users/me`.
- Calls the `apivault_labs/facebook-profile-scraper` actor via
  `run-sync-get-dataset-items`.
