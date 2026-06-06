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
		displayName: 'Facebook Profile Scraper',
		name: 'facebook',
		icon: 'file:facebook.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["profileUrls"]}}',
		description:
			'Scrape public Facebook profiles and pages in real time, no login: name, bio, followers, emails, phones, website, verification badge, page category and activity score.',
		defaults: {
			name: 'Facebook Profile Scraper',
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
				required: true,
				placeholder: 'https://www.facebook.com/NASA',
				description:
					'One or more public Facebook profile or page URLs. Supports /username/ and /profile.php?id=... formats. Separate multiple with a new line or comma.',
			},
			{
				displayName: 'Proxy Options',
				name: 'proxyOptions',
				type: 'collection',
				placeholder: 'Add Proxy Option',
				default: {},
				options: [
					{
						displayName: 'Use Residential Proxy',
						name: 'useResidentialProxy',
						type: 'boolean',
						default: true,
						description:
							'Whether to use the Apify residential proxy. Strongly recommended — Facebook blocks most datacenter IPs. Disable only when running locally outside Apify.',
					},
					{
						displayName: 'Proxy Country Code',
						name: 'proxyCountry',
						type: 'string',
						default: 'US',
						placeholder: 'US',
						description:
							'ISO 2-letter country code for the residential proxy (e.g. US, GB, DE). Pinning a country avoids region-redirects. Empty = automatic.',
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
						typeOptions: { minValue: 1, maxValue: 10 },
						default: 3,
						description:
							'How many profiles to scrape in parallel. Higher is faster but more likely to trigger rate limits — recommended 3-5.',
					},
					{
						displayName: 'Timeout per Profile (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: { minValue: 15, maxValue: 120 },
						default: 45,
						description: 'Maximum time to wait for each profile',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const rawUrls = this.getNodeParameter('profileUrls', i) as string;
				const profileUrls = rawUrls
					.split(/[\n,]+/)
					.map((u) => u.trim())
					.filter((u) => u.length > 0);

				if (profileUrls.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'At least one Facebook profile or page URL is required',
						{ itemIndex: i },
					);
				}

				const proxyOptions = this.getNodeParameter('proxyOptions', i, {}) as {
					useResidentialProxy?: boolean;
					proxyCountry?: string;
				};
				const advanced = this.getNodeParameter('advancedOptions', i, {}) as {
					maxConcurrency?: number;
					timeout?: number;
				};

				const body: Record<string, unknown> = {
					profileUrls,
					useResidentialProxy: proxyOptions.useResidentialProxy ?? true,
					proxyCountry: proxyOptions.proxyCountry ?? 'US',
					maxConcurrency: advanced.maxConcurrency ?? 3,
					timeout: advanced.timeout ?? 45,
				};

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
