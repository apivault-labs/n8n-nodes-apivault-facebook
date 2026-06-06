# Changelog

## 0.1.0

- Initial release.
- `Facebook Profile Scraper` node: real-time scraping of public Facebook
  profiles and pages, no login.
- Fields: name, bio, username, followers, likes, public emails, public phones,
  website, verification badge, page category, 0-100 activity score.
- Supports both /username/ and /profile.php?id=... URL formats; multiple URLs
  scraped in parallel.
- Multi-strategy fallback (mbasic, mobile, embed, OG meta) + residential proxy
  with optional country pinning.
- `Apify API` credentials with token test against `/users/me`.
- Calls the `apivault_labs/facebook-profile-scraper` actor via
  `run-sync-get-dataset-items`.
