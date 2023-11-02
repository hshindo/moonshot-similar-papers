<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Rect, PdfTextAnno } from '$lib/models';
	import type { DocState } from '../state';

	export let docState: DocState;
	export let anno: PdfTextAnno;
	$: selected = docState.selectedAnno;
	$: isSelected = selected && selected.id === anno.id;
	const dispatch = createEventDispatcher();

	let textRects: Rect[] = anno.page.textRects(anno.start, anno.end - anno.start + 1);
	let annSvg: SVGElement;

	function keydownAnn(e: KeyboardEvent) {
		if (e.key === 'Delete' || e.key === 'Backspace') {
			dispatch('delete', {
				anno: anno
			});
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<g
	bind:this={annSvg}
	class="outline-none"
	fill="yellow"
	fill-opacity="25%"
	on:keydown={keydownAnn}
	on:dragstart={() => false}
	on:focus={() => {
		docState.selectAnno(anno);
		docState = docState;
	}}
	on:mouseover={(e) => dispatch('hover', e)}
	on:mouseout={() => dispatch('out', {})}
>
	{#each textRects as r}
		<rect
			class={[
				isSelected ? 'stroke-red-500 stroke-1' : '',
				'focus:stroke-black focus:stroke-1'
			].join(' ')}
			x={`${r.x1 * 100}%`}
			y={`${r.y1 * 100}%`}
			width={`${r.width * 100}%`}
			height={`${r.height * 100}%`}
		/>
	{/each}
</g>
