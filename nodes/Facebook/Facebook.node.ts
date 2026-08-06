import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// Apify actor that does the real work (runs server-side, billed pay-per-event).
const ACTOR_ID = 'apivault_labs~facebook-profile-scraper';

export class Facebook implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Page Scraper',
		name: 'facebook',
		icon: 'file:facebook.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["profileUrls"] || $parameter["searchKeywords"]}}',
		description:
			'Scrape public Facebook pages and profiles in real time, no login: name, category, followers, emails, phones, website, verification badge, activity score, best contact, and (optional) recent posts. Find pages by keyword or by URL.',
		defaults: {
			name: 'Facebook Page Scraper',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Facebook Profile / Page URLs',
				name: 'profileUrls',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				placeholder: 'https://www.facebook.com/NASA',
				description:
					'Public Facebook profile or page URLs. Supports /username/, /profile.php?id=... and bare numeric IDs. Separate multiple with a new line or comma. Leave empty if you use Search Keywords instead.',
			},
			{
				displayName: 'Search Keywords',
				name: 'searchKeywords',
				type: 'string',
				typeOptions: { rows: 2 },
				default: '',
				placeholder: 'pizza restaurant chicago',
				description:
					'Optional. Instead of URLs, enter keywords and the actor discovers matching public Facebook pages, then scrapes each. Separate multiple with a new line or comma.',
			},
			{
				displayName: 'Search Location',
				name: 'searchLocation',
				type: 'string',
				default: '',
				placeholder: 'New York',
				description:
					'Optional location hint appended to keyword searches (e.g. New York, London). Only used with Search Keywords.',
			},
			{
				displayName: 'Posts',
				name: 'postOptions',
				type: 'collection',
				placeholder: 'Add Posts Option',
				default: {},
				options: [
					{
						displayName: 'Also Scrape Recent Posts',
						name: 'scrapePosts',
						type: 'boolean',
						default: false,
						description:
							'Whether to also pull the page\'s recent public posts (text, reactions/comments/shares, photos, videos with MP4 URLs). Emitted as extra rows with type=post. Billed per post.',
					},
					{
						displayName: 'Max Posts per Page',
						name: 'maxPosts',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 500 },
						default: 25,
						description: 'Cap on posts saved per page when scraping posts is on',
					},
					{
						displayName: 'Posts: Only Last N Days',
						name: 'sinceDays',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 3650 },
						default: 0,
						description: 'Keep only posts created within the last N days. 0 = no date filter.',
					},
					{
						displayName: 'Posts: Keyword Filter',
						name: 'postKeyword',
						type: 'string',
						default: '',
						description: 'Keep only posts whose text contains this keyword (case-insensitive)',
					},
				],
			},
			{
				displayName: 'Contact Enrichment',
				name: 'contactOptions',
				type: 'collection',
				placeholder: 'Add Contact Option',
				default: {},
				options: [
					{
						displayName: 'Find Emails via Website Fallback',
						name: 'enrichEmailViaGoogle',
						type: 'boolean',
						default: true,
						description:
							'Whether to visit the page\'s linked website and extract an email when the Facebook page exposes none',
					},
					{
						displayName: 'Email Domain Filter',
						name: 'emailDomains',
						type: 'string',
						default: '',
						placeholder: 'gmail.com, yourcompany.com',
						description:
							'Keep only emails on these domains. Separate multiple with a comma. Empty = keep all emails.',
					},
				],
			},
			{
				displayName: 'Advanced Options',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Concurrency',
						name: 'maxConcurrency',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 30 },
						default: 15,
						description: 'How many pages to scrape in parallel. 15-20 is safe.',
					},
					{
						displayName: 'Timeout per Profile (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: { minValue: 10, maxValue: 60 },
						default: 20,
						description: 'Maximum time to wait for each profile',
					},
					{
						displayName: 'Max Retries per Profile',
						name: 'maxRetries',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 8 },
						default: 2,
						description: 'How many times to retry a failed or blocked profile, each with a fresh IP',
					},
					{
						displayName: 'Deduplicate',
						name: 'dedupe',
						type: 'boolean',
						default: true,
						description:
							'Whether to drop duplicate input URLs and duplicate output pages (same Facebook ID) so a page is never scraped or billed twice',
					},
					{
						displayName: 'Fast Mode',
						name: 'fastMode',
						type: 'boolean',
						default: false,
						description:
							'Whether to read less data for speed. Gets name, followers, likes, phone, website, verified. May miss category/rating for some pages.',
					},
					{
						displayName: 'Max Profiles per Keyword',
						name: 'maxResultsPerKeyword',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 100 },
						default: 20,
						description: 'How many Facebook pages to discover per keyword. Only used with Search Keywords.',
					},
					{
						displayName: 'Real-Time Webhook URL',
						name: 'notifyWebhookUrl',
						type: 'string',
						default: '',
						description:
							'Each scraped page is POSTed as JSON to this URL the moment it is found (Zapier / Make / n8n / Slack / Discord)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const splitList = (raw: string): string[] =>
			(raw || '')
				.split(/[\n,]+/)
				.map((s) => s.trim())
				.filter((s) => s.length > 0);

		for (let i = 0; i < items.length; i++) {
			try {
				const profileUrls = splitList(this.getNodeParameter('profileUrls', i, '') as string);
				const searchKeywords = splitList(this.getNodeParameter('searchKeywords', i, '') as string);
				const searchLocation = (this.getNodeParameter('searchLocation', i, '') as string).trim();

				if (profileUrls.length === 0 && searchKeywords.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Provide at least one Facebook profile/page URL or a search keyword',
						{ itemIndex: i },
					);
				}

				const postOptions = this.getNodeParameter('postOptions', i, {}) as {
					scrapePosts?: boolean;
					maxPosts?: number;
					sinceDays?: number;
					postKeyword?: string;
				};
				const contactOptions = this.getNodeParameter('contactOptions', i, {}) as {
					enrichEmailViaGoogle?: boolean;
					emailDomains?: string;
				};
				const advanced = this.getNodeParameter('advancedOptions', i, {}) as {
					maxConcurrency?: number;
					timeout?: number;
					maxRetries?: number;
					dedupe?: boolean;
					fastMode?: boolean;
					maxResultsPerKeyword?: number;
					notifyWebhookUrl?: string;
				};

				const body: Record<string, unknown> = {
					maxConcurrency: advanced.maxConcurrency ?? 15,
					timeout: advanced.timeout ?? 20,
					maxRetries: advanced.maxRetries ?? 2,
					dedupe: advanced.dedupe ?? true,
					fastMode: advanced.fastMode ?? false,
					enrichEmailViaGoogle: contactOptions.enrichEmailViaGoogle ?? true,
					scrapePosts: postOptions.scrapePosts ?? false,
				};

				if (profileUrls.length > 0) body.profileUrls = profileUrls;
				if (searchKeywords.length > 0) {
					body.searchKeywords = searchKeywords;
					if (searchLocation) body.searchLocation = searchLocation;
					body.maxResultsPerKeyword = advanced.maxResultsPerKeyword ?? 20;
				}

				if (body.scrapePosts) {
					body.maxPosts = postOptions.maxPosts ?? 25;
					if (postOptions.sinceDays) body.sinceDays = postOptions.sinceDays;
					if (postOptions.postKeyword) body.postKeyword = postOptions.postKeyword.trim();
				}

				const emailDomains = splitList(contactOptions.emailDomains ?? '');
				if (emailDomains.length > 0) body.emailDomains = emailDomains;

				if (advanced.notifyWebhookUrl) body.notifyWebhookUrl = advanced.notifyWebhookUrl.trim();

				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
					body,
					json: true,
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'apifyApi',
					options,
				);

				const results = Array.isArray(response) ? response : [response];
				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
