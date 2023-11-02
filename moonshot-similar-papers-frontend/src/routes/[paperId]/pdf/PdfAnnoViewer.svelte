<script lang="ts">
	import { Rect } from '$lib/models';
	import { PdfRectAnno, PdfTextAnno } from '$lib/models';
	import type { DocState } from '../state';
	import PdfRectAnnotSvg from './PdfRectAnnoSvg.svelte';
	import PdfTextAnnotSvg from './PdfTextAnnoSvg.svelte';
	import { ContextMenu } from '$lib/components';
	import Popup from '$lib/components/Popup.svelte';

	export let docState: DocState;
	export let annoType: string;
	export let canvasWidth: number;
	export let canvasHeight: number;

	$: doc = docState.doc;
	$: pageIndex = docState.pageIndex;
	$: page = doc.getPage(pageIndex);
	$: annos = docState.pageAnnos[pageIndex];
	$: selected = docState.selectedAnno;

	let previewText: Rect[];
	let previewTextPos: Rect;
	let previewRect: Rect;
	let contextMenu: ContextMenu;
	let popup: Popup;
	let popupRef: HTMLElement;

	function deleteAnno(e: CustomEvent) {
		const anno = e.detail.anno;
		const idx = annos.findIndex((a) => a.id === anno.id);
		if (idx >= 0) {
			annos.splice(idx, 1);
			if (selected === anno) docState.selectAnno(undefined);
		}
		selected = undefined;
		docState = docState;
	}

	// コピー: 範囲選択した部分をテキストクリップボードにコピーする
	function copyPreviewText() {
		const pos = previewTextPos;
		const anno = new PdfTextAnno(undefined, page, pos.x1, pos.y1, pos.x2, pos.y2);
		if (navigator.clipboard) navigator.clipboard.writeText(anno.toString());
	}

	function keydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) {
			// Cotrol、Commandキー押下時のキーボードショートカット
			if (e.key === 'c') {
				copyPreviewText();
			}
		} else if (e.key === 'Enter') {
			if (previewText) {
				previewText = undefined;
				const pos = previewTextPos;
				const anno = new PdfTextAnno(undefined, page, pos.x1, pos.y1, pos.x2, pos.y2);
				annos.push(anno);
				docState.selectAnno(anno);
			} else if (previewRect) {
				const r = previewRect;
				const anno = new PdfRectAnno(undefined, page, r.x1, r.y1, r.x2, r.y2);
				annos.push(anno);
				docState.selectAnno(anno);
				previewRect = undefined;
			}
			docState = docState;
		}
	}

	function clear() {
		previewText = undefined;
		previewRect = undefined;
		docState.selectAnno(undefined);
		docState = docState;
	}

	function mousedownBgText(e: MouseEvent) {
		clear();
		const x1 = e.offsetX / canvasWidth;
		const y1 = e.offsetY / canvasHeight;
		const start = page.charIndexAtPos(x1, y1);

		function mousemove(e: MouseEvent) {
			const x2 = e.offsetX / canvasWidth;
			const y2 = e.offsetY / canvasHeight;
			const end = page.charIndexAtPos(x2, y2);
			if (end >= 0) {
				const s = Math.min(start, end);
				const e = Math.max(start, end);
				previewText = page.textRects(s, e - s + 1);
				previewTextPos = new Rect(x1, y1, x2, y2);
			}
		}
		document.addEventListener('mousemove', mousemove);
		document.addEventListener(
			'mouseup',
			() => {
				document.removeEventListener('mousemove', mousemove);
			},
			{ once: true }
		);
	}

	function mousedownBgRect(e: MouseEvent) {
		clear();
		const x1 = e.offsetX / canvasWidth;
		const y1 = e.offsetY / canvasHeight;
		//preview = new Annot(doc.pageIndex, annotType, x1, y1, x1, y1, 'gray');

		function mousemove(e: MouseEvent) {
			const x2 = e.offsetX / canvasWidth;
			const y2 = e.offsetY / canvasHeight;
			previewRect = new Rect(x1, y1, x2, y2);
		}
		document.addEventListener('mousemove', mousemove);
		document.addEventListener(
			'mouseup',
			() => {
				document.removeEventListener('mousemove', mousemove);
			},
			{ once: true }
		);
	}

	//TODO: add tabIndex={-1} for rect
</script>

<div bind:this={popupRef}>
	<svg width={canvasWidth} height={canvasHeight} viewBox="0, 0, {canvasWidth}, {canvasHeight}">
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<rect
			class="cursor-default select-none fill-transparent outline-none"
			on:dragstart={() => false}
			on:mousedown={annoType === 'text' ? mousedownBgText : mousedownBgRect}
			on:keydown={keydown}
			tabIndex={-1}
			width="100%"
			height="100%"
		/>
		{#each annos as anno (anno.id)}
			{#if anno instanceof PdfRectAnno}
				<PdfRectAnnotSvg bind:docState {anno} {canvasWidth} {canvasHeight} on:delete={deleteAnno} />
			{:else if anno instanceof PdfTextAnno}
				<PdfTextAnnotSvg
					bind:docState
					{anno}
					on:delete={deleteAnno}
					on:hover={(e) => popup?.show(e.detail)}
					on:out={() => popup?.close()}
				/>
			{/if}
		{/each}

		{#if previewText}
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<g class="opacity-25 outline-none" fill="gray" on:contextmenu={(e) => contextMenu.show(e)}>
				{#each previewText as box}
					<rect
						x={`${box.x1 * 100}%`}
						y={`${box.y1 * 100}%`}
						width={`${box.width * 100}%`}
						height={`${box.height * 100}%`}
					/>
				{/each}
			</g>
		{/if}
		{#if previewRect}
			<rect
				class="fill-transparent stroke-1 outline-none"
				x={`${previewRect.x1 * 100}%`}
				y={`${previewRect.y1 * 100}%`}
				width={`${previewRect.width * 100}%`}
				height={`${previewRect.height * 100}%`}
				stroke="gray"
			/>
		{/if}
	</svg>
</div>

<Popup bind:this={popup}>
	<div class="p-2 bg-yellow-200">DataAugmentation: Flip</div>
</Popup>

<ContextMenu bind:this={contextMenu}>
	<button
		class="px-2 text-left hover:bg-gray-100"
		on:click={() => {
			copyPreviewText();
			clear();
		}}
	>
		Copy
	</button>
</ContextMenu>

<!--<PdfAnnotSvg annot={preview} {page} {image} />-->
<!--
		{#if showCreate}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				x={`${preview.x2 * 100}%`}
				y={`${preview.y2 * 100}%`}
				width="24"
				height="24"
				on:click={create}
			>
				<rect x="0" y="0" width="24" height="24" fill="white" />
				<path
					fill-rule="evenodd"
					d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"
				/>
			</svg>
		{/if}
		-->
