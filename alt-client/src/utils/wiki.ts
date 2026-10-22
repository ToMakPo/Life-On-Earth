export interface WikipediaSummary {
	type: string // e.g. "standard", "disambiguation", "no-extract"
	title: string
	displaytitle: string
	namespace: {
		id: number
		text: string
	}
	wikibase_item?: string
	titles: {
		canonical: string
		normalized: string
		display: string
	}
	pageid: number
	thumbnail?: {
		source: string
		width: number
		height: number
	}
	originalimage?: {
		source: string
		width: number
		height: number
	}
	lang: string
	dir: string
	revision: string
	tid: string
	timestamp: string
	description?: string
	description_source?: string
	coordinates?: {
		lat: number
		lon: number
	}
	extract: string // Plain text summary
	extract_html: string // Formatted HTML summary
	content_urls: {
		desktop: {
			page: string
			revisions: string
			edit: string
			talk: string
		}
		mobile: {
			page: string
			revisions: string
			edit: string
			talk: string
		}
	}
}

export interface WikiData {
	summary: string
	imageUrl: string
}

export const fetchWikiData = async (title: string): Promise<WikiData | null> => {
	if (!title) return null

	const formatTitle = (str: string) => str.trim().replace(/\s+/g, '_')

	try {
		let currentTitle = formatTitle(title)
		let res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(currentTitle)}`)

		// FALLBACK: If direct search returns 404, query the Wikipedia Opensearch engine
		if (!res.ok) {
			const searchUrl = `https://wikipedia.org{encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`
			const searchRes = await fetch(searchUrl)
			
			if (searchRes.ok) {
				const searchData = await searchRes.json()
				
				// FIXED: Correctly targeting searchData[1][0] to get the matching string title 
				if (searchData && Array.isArray(searchData[1]) && searchData[1].length > 0) {
					currentTitle = formatTitle(searchData[1][0]) 
					res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(currentTitle)}`)
				}
			}
		}

		if (!res.ok) return null

		const data: WikipediaSummary = await res.json()

		return {
			summary: data.extract_html ?? '',
			imageUrl: data.originalimage?.source ?? ''
		}
	} catch {
		return null
	}
}
