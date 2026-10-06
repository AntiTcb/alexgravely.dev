<script lang="ts">
	import type { PortfolioEntry } from "../lib/content";

	let { sites }: { sites: PortfolioEntry[] } = $props();
</script>

<ul class="portfolio">
	{#each sites as site (site.id)}
		<li>
			<a href={site.data.url} target="_blank" rel="noreferrer">{site.data.name}</a>
			{#if site.data.summary}<span> — {site.data.summary}</span>{/if}
		</li>
	{/each}
</ul>
