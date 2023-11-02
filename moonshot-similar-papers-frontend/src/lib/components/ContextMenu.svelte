<script lang="ts">
	//import { computePosition, autoPlacement } from '@floating-ui/dom';

	let dialog: HTMLElement;
	let isOpen = false;

	export async function show(e: MouseEvent) {
		e.preventDefault(); // 標準のコンテキストメニューの表示を抑制
		isOpen = true; // 先にopenしないと表示位置がおかしくなる

		const virtualEl = {
			getBoundingClientRect() {
				return {
					width: 0,
					height: 0,
					x: e.clientX,
					y: e.clientY,
					top: e.clientY,
					left: e.clientX,
					right: e.clientX,
					bottom: e.clientY
				};
			}
		};

		/*
		computePosition(virtualEl, dialog, {
			middleware: [autoPlacement({ alignment: 'start' })]
		}).then(({ x, y }) => {
			Object.assign(dialog.style, {
				left: `${x}px`,
				top: `${y}px`
			});
		});
		*/
	}
</script>

<div
	bind:this={dialog}
	class={[
		'absolute z-10 w-max rounded border bg-white shadow-lg outline-none',
		isOpen ? '' : 'hidden'
	].join(' ')}
>
	<slot />
</div>
<svelte:window on:click={() => (isOpen = false)} />
