# n8n-nodes-apivault-facebook

An [n8n](https://n8n.io) community node for the **Facebook Profile & Posts Scraper** — bulk public profile/page data, recent posts and keyword discovery with no Facebook login.

No login. Pay-as-you-go, no monthly subscription. The scraping runs server-side on [Apify](https://www.apify.com?fpr=06e5d2); this node is a thin connector you drive with your own Apify API token.

Built by **[apivault_labs](https://apify.com/apivault_labs)** — see [all our actors](https://apify.com/apivault_labs).

## What you get per page / profile

- **Core**: name, bio/about, username, category, profile URL, avatar, verification badge
- **Audience**: exact follower/like count, audience-size tier
- **Contact**: public emails + primary email, public phones, website (unwrapped), `bestContact` (highest-confidence outreach path)
- **Lead intelligence**: 0-100 activity score with plain-English reasons and tier (small / growing / established / major)
- **Engagement**: last post date, days since last post, average reactions/shares/video views, engagement rate (best-effort, when the page exposes it)
- **Cross-platform links**: Instagram handle + URL, Messenger link, WhatsApp link (when a phone is present), and 1-click search links for other networks
- **Optional posts**: recent public posts (text, permalink, publication time and reactions/comments/shares when exposed) as extra rows with `type=post`

Public data only — the scraper never logs in.

## Three modes

- **Profiles / Pages** — paste one or more public URLs or IDs.
- **Profiles / Pages + Recent Posts** — return profiles and post rows with optional exact `From` / `Until` dates.
- **Search by Keyword** — discover matching pages using keywords and an optional location.

## Installation

In your n8n instance:

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-apivault-facebook`
4. Confirm and install

## Credentials

This node uses an **Apify API token**:

1. Create a free account at [apify.com](https://www.apify.com?fpr=06e5d2)
2. Go to **Apify Console → Settings → Integrations** and copy your **API token**
3. In n8n, create new **Apify API** credentials and paste the token

A free Apify account includes monthly usage credits.

## Usage

- **Facebook Profile / Page URLs** — one or more public URLs (one per line, or comma-separated). Leave empty if using keywords.
- **Search Keywords** / **Search Location** — discover pages by keyword instead of URL
- **Posts** — optionally scrape recent posts with max-count, exact date range, relative recency and keyword filters
- **Contact Enrichment** — website email fallback + optional email-domain filter
- **Advanced** — concurrency, timeout, retries, deduplication, fast mode, per-keyword result cap, real-time webhook URL

## Pricing

Billed per page through Apify (pay-per-event): **$4 / 1,000 pages** ($0.004 each). Optional posts are billed per post. You only pay for successful results — blocked or empty pages are free.

## Use cases

- **B2B prospecting** — pull public business-page contacts, filter to those with an email, sort by activity score
- **Lead enrichment** — add followers, website, emails and best-contact to existing CRM records
- **Brand monitoring** — track audience size, verification and engagement of a page watchlist
- **Influencer research** — filter pages by follower count, activity tier and engagement rate

## Notes

Only **public** page/profile data is returned. The scraper does not log in and does not access private content.

## Resources

- [Facebook Page Scraper actor on Apify](https://apify.com/apivault_labs/facebook-profile-scraper)
- [All actors by apivault_labs](https://apify.com/apivault_labs)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)

## Keywords

`facebook-scraper` `facebook-profile` `facebook-page` `social-media-scraper` `lead-generation` `b2b-prospecting` `no-login` `contact-enrichment` `marketing` `n8n` `apify`
