# n8n-nodes-apivault-facebook

An [n8n](https://n8n.io) community node for the **Facebook Profile Scraper** — real-time data on public Facebook profiles and pages, no login.

No login. Pay-as-you-go, no monthly subscription. The direct fetch + multi-strategy fallback runs server-side on [Apify](https://apify.com); this node is a thin connector you drive with your own Apify API token.

Built by **[apivault_labs](https://apify.com/apivault_labs)** — see [all our actors](https://apify.com/apivault_labs).

## What you get per profile / page

- **Core**: name, bio/about, username, profile URL, profile image
- **Audience**: followers, likes
- **Contact**: public emails, public phones, website
- **Trust**: verification badge, page category
- **Activity**: a 0-100 activity score

Multi-strategy fallback (mbasic, mobile, embed, OG meta) survives Facebook's 2026 anti-bot updates. Supports both `/username/` and `/profile.php?id=...` URL formats.

## Installation

In your n8n instance:

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-apivault-facebook`
4. Confirm and install

## Credentials

This node uses an **Apify API token**:

1. Create a free account at [apify.com](https://apify.com)
2. Go to **Apify Console → Settings → Integrations** and copy your **API token**
3. In n8n, create new **Apify API** credentials and paste the token

A free Apify account includes monthly usage credits.

## Usage

- **Facebook Profile / Page URLs** — one or more public profile/page URLs (one per line, or comma-separated)
- **Proxy Options** — residential proxy (recommended on) + country code
- **Advanced** — concurrency (3-5 recommended), timeout

## Pricing

Billed per profile through Apify (pay-per-event): **$4 / 1,000 profiles** ($0.004 each).

## Use cases

- **B2B prospecting** — pull public business-page contacts and category
- **Lead enrichment** — add followers, website and emails to existing records
- **Brand monitoring** — track audience size and activity of pages
- **Influencer research** — filter pages by follower count and activity score

## Notes

Only **public** profile/page data is returned. The scraper does not log in and does not access private content.

## Resources

- [Facebook Profile Scraper actor on Apify](https://apify.com/apivault_labs/facebook-profile-scraper)
- [All actors by apivault_labs](https://apify.com/apivault_labs)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)

## Keywords

`facebook-scraper` `facebook-profile` `social-media-scraper` `lead-generation` `b2b-prospecting` `no-login` `contact-enrichment` `marketing` `n8n` `apify`
