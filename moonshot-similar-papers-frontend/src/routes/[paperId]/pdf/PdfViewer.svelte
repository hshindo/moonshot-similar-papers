<script lang="ts">
	import {
		IconCircleArrowUp,
		IconCircleArrowDown,
		IconCircleMinus,
		IconCirclePlus,
		IconPencil,
		IconRectangle,
		IconDownload
	} from '@tabler/icons-svelte';
	import type { DocState } from '../state';
	import PdfAnnoViewer from './PdfAnnoViewer.svelte';

	export let docState: DocState;

	const iconButtonClass = 'rounded-lg px-1 py-1 hover:bg-slate-200';
	const scales = [0.5, 0.67, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0, 5.0];
	$: doc = docState.doc;
	$: pageIndex = docState.pageIndex;
	$: scaleIndex = docState.scaleIndex;
	$: scale = scales[docState.scaleIndex];
	let image: ImageData;
	let annoType: string = 'text';
	let canvasWidth = 0.0;
	let canvasHeight = 0.0;

	let canvas: HTMLCanvasElement;
	$: if (canvas) {
		const context = canvas.getContext('2d');
		image = doc.render(pageIndex, 2); // retina
		canvas.width = image.width;
		canvas.height = image.height;
		context.putImageData(image, 0, 0);
		canvas.style.width = `${(canvas.width / 2) * scale}px`;
		canvas.style.height = `${(canvas.height / 2) * scale}px`;
		canvasWidth = (image.width / 2) * scale;
		canvasHeight = (image.height / 2) * scale;
		// console.info(`wasmMemory: ${(Module as any).HEAPU8.buffer.byteLength / 1000 / 1000} MB`); // WebAssembly使用メモリ確認用
	}

	function update() {
		// docState.editing = true;
		docState = docState;
	}

	function scaleUp() {
		if (scaleIndex + 1 < scales.length) {
			docState.scaleIndex += 1;
			update();
		}
	}
	function scaleDown() {
		if (scaleIndex > 0) {
			docState.scaleIndex -= 1;
			update();
		}
	}
	function pageUp() {
		if (pageIndex > 0) {
			docState.pageIndex -= 1;
			update();
		}
	}
	function pageDown() {
		if (pageIndex + 1 < doc.pageCount) {
			docState.pageIndex += 1;
			update();
		}
	}

	// download
	function clickDownload() {
		const data = [];
		for (let i = 0; i < doc.pageCount; i++) {
			const page = doc.getPage(i);
			const chars = page.extractChars();
			data.push(chars);
		}
		const json = JSON.stringify(data);
		let a = document.createElement('a');
		a.download = `${doc.name}.txt.json`;
		let blob = new Blob([json], { type: 'application/json' });
		a.href = URL.createObjectURL(blob);
		a.click();
	}
</script>

<div class="flex h-full flex-col">
	<!-- toolbar -->
	<div class="flex h-[1.5rem] items-center truncate border border-slate-200 bg-slate-100 px-2 py-1">
		<button class={iconButtonClass} title="Prev page" on:click={pageUp}>
			<IconCircleArrowUp size={16} />
		</button>
		<button class={iconButtonClass} title="Next page" on:click={pageDown}>
			<IconCircleArrowDown size={16} />
		</button>
		<div class="mx-2 select-none">{pageIndex + 1} / {doc.pageCount}</div>
		<div class="" />
		<button class={iconButtonClass} title="Scale down" on:click={scaleDown}>
			<IconCircleMinus size={16} />
		</button>
		<button class={iconButtonClass} title="Scale up" on:click={scaleUp}>
			<IconCirclePlus size={16} />
		</button>
		<div class="mx-2 select-none">{Math.round(scale * 100)} %</div>

		<button class={iconButtonClass} on:click={() => (annoType = 'text')}>
			<IconPencil size={16} class={annoType === 'text' ? 'h-4 bg-indigo-300' : 'h-4'} />
		</button>
		<button class={iconButtonClass} on:click={() => (annoType = 'rect')}>
			<IconRectangle size={16} class={annoType === 'rect' ? 'h-4 bg-indigo-300' : 'h-4'} />
		</button>
		<button class={iconButtonClass} on:click={clickDownload}>
			<IconDownload size={16} />
		</button>
	</div>

	<!-- page image and annotations -->
	<div class="relative h-[calc(100%-1.5rem)] overflow-auto">
		<canvas bind:this={canvas} class="pointer-events-none" />
		{#if image}
			<!-- {cursor}" on:mousemove={onMousemove}? -->
			<div class="absolute left-0 top-0">
				<PdfAnnoViewer {canvasWidth} {canvasHeight} {annoType} bind:docState />
			</div>
		{/if}
	</div>
</div>
