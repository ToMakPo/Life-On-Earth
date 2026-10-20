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

    try {
        const res = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        )

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