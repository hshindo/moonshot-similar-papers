<script lang="ts">
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import * as api from './api';
	import Menubar from './Menubar.svelte';
	import PdfViewer from './pdf/PdfViewer.svelte';
	import SplitPane from './SplitPane.svelte';
	import { PdfDocument, PdfTextAnno } from '$lib/models';
	import { DocState } from './state';

	let docState: DocState;

	async function load() {
		let paperId = get(page).params.paperId;
		// let paperId = '2106.08322.pdf';
		docState = await DocState.load(paperId);
	}
	$: if ($page.params) load();
</script>

<div class="h-[2rem]">
	<Menubar />
</div>

<div class="h-[calc(100%-2rem)]">
	<SplitPane leftWidth={50} rightWidth={50}>
		<div slot="left" class="h-full">
			{#if docState}
				<PdfViewer bind:docState />
			{/if}
		</div>

		<div slot="right" class="h-full">
			{#if docState && docState.selectedAnno}
				<div class="p-4 space-y-3 h-full overflow-auto">
					{#each docState.metadata[docState.selectedAnno.id].papers as p}
						<div>
							<div>
								<a
									class=" text-blue-700 hover:text-blue-800 visited:text-purple-600 text-lg"
									href={`../${p.id}`}>{p.title}</a
								>
							</div>
							<div>{p.authors}</div>
							<div class="text-sm">{p.abstract}</div>
							<div class="flex items-center space-x-2">
								{#each p.tags as tag}
									<div class="rounded-md bg-blue-500 px-2">{tag}</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</SplitPane>
</div>
