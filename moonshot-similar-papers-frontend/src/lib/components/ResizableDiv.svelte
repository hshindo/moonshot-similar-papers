<script lang="ts">
	//export let leftWidth: number;
	//export let rightWidth: number;
	//let left: HTMLElement;
	//let right: HTMLElement;

	let divRef: HTMLElement;

	//let next: HTMLElement;
	//let width = 0;
	function mousedown(e: MouseEvent) {
		let next = divRef.nextElementSibling as HTMLElement;
		let width = divRef.offsetWidth + next.offsetWidth;

		function mousemove(e: MouseEvent) {
			const w = e.clientX - divRef.offsetLeft;
			divRef.style.width = `${w}px`;
			next.style.width = `${width - w}px`;
		}

		e.stopPropagation();
		document.addEventListener('mousemove', mousemove);
		document.addEventListener(
			'mouseup',
			() => {
				document.removeEventListener('mousemove', mousemove);
			},
			{ once: true }
		);
	}
</script>

<div bind:this={divRef} class={['relative', $$props.class].join(' ')}>
	<slot />

	<!-- separator -->
	<div
		class="absolute h-full w-[0.2rem] cursor-col-resize bg-slate-200 top-0 -right-[0.1rem] select-none hover:bg-indigo-400"
		on:mousedown={mousedown}
	/>
</div>
