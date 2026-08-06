# Changelog

## 0.2.0

Brought the node up to date with the current Facebook Page Scraper actor.

- **Removed** the `useResidentialProxy` / `proxyCountry` inputs — proxying is now
  handled entirely server-side by the actor, so these had no effect.
- **Added keyword search**: find pages by `searchKeywords` (+ optional
  `searchLocation`) instead of URLs. `profileUrls` is now optional — provide URLs
  or keywords.
- **Added recent posts** (opt-in): `scrapePosts`, `maxPosts`, `sinceDays`,
  `postKeyword`. Posts come back as extra rows with `type=post`.
- **Added contact enrichment**: website email fallback (`enrichEmailViaGoogle`)
  and `emailDomains` filter.
- **Added advanced controls**: `maxRetries`, `dedupe`, `fastMode`,
  `maxResultsPerKeyword`, real-time `notifyWebhookUrl`.
- New defaults aligned with the actor: concurrency 15, timeout 20s.
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
