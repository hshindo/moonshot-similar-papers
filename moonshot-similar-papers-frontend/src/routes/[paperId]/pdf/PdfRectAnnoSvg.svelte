<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { PdfRectAnno } from '$lib/models';
	import type { DocState } from '../state';

	export let docState: DocState;
	export let anno: PdfRectAnno;
	export let canvasWidth: number;
	export let canvasHeight: number;
	$: selected = docState.selectedAnno;
	$: isSelected = selected && selected.id === anno.id;
	const dispatch = createEventDispatcher();

	let annSvg: SVGElement;
	const radius = 4;

	function mousedownRect(e: MouseEvent) {
		function mousemove(e: MouseEvent) {
			anno.move(e.offsetX / canvasWidth, e.offsetY / canvasHeight);
			anno = anno;
		}

		document.addEventListener('mousemove', mousemove);
		document.addEventListener(
			'mouseup',
			() => document.removeEventListener('mousemove', mousemove),
			{ once: true }
		);
	}

	function mousedownCircle(e: MouseEvent, idx: number) {
		function mousemove(e: MouseEvent) {
			anno.scale(e.offsetX / canvasWidth, e.offsetY / canvasHeight, idx);
			anno = anno;
			annSvg.focus();
		}

		document.addEventListener('mousemove', mousemove);
		document.addEventListener(
			'mouseup',
			() => document.removeEventListener('mousemove', mousemove),
			{ once: true }
		);
	}

	function keydownAnn(e: KeyboardEvent) {
		if (e.key === 'Delete' || e.key === 'Backspace') {
			dispatch('delete', {
				anno: anno
			});
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<rect
	bind:this={annSvg}
	class={['fill-transparent stroke-1 outline-none', isSelected ? 'cursor-move' : ''].join(' ')}
	x={`${anno.x1 * 100}%`}
	y={`${anno.y1 * 100}%`}
	width={`${anno.width * 100}%`}
	height={`${anno.height * 100}%`}
	stroke="red"
	on:keydown={keydownAnn}
	on:mousedown={mousedownRect}
	on:dragstart={() => false}
	on:focus={() => {
		docState.selectAnno(anno);
		docState = docState;
	}}
/>
{#if isSelected}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<circle
		cx={`${anno.x1 * 100}%`}
		cy={`${anno.y1 * 100}%`}
		r={radius}
		class="cursor-nw-resize fill-white stroke-black"
		on:mousedown={(e) => mousedownCircle(e, 0)}
	/>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<circle
		cx={`${anno.x1 * 100}%`}
		cy={`${anno.y2 * 100}%`}
		r={radius}
		class="cursor-sw-resize fill-white stroke-black"
		on:mousedown={(e) => mousedownCircle(e, 1)}
	/>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<circle
		cx={`${anno.x2 * 100}%`}
		cy={`${anno.y1 * 100}%`}
		r={radius}
		class="cursor-ne-resize fill-white stroke-black"
		on:mousedown={(e) => mousedownCircle(e, 2)}
	/>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<circle
		cx={`${anno.x2 * 100}%`}
		cy={`${anno.y2 * 100}%`}
		r={radius}
		class="cursor-se-resize fill-white stroke-black"
		on:mousedown={(e) => mousedownCircle(e, 3)}
	/>
{/if}
