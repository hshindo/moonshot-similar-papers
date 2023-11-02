<script lang="ts">
	export let leftWidth: number;
	export let rightWidth: number;
	let left: HTMLElement;
	let right: HTMLElement;

	function mousedown(e: MouseEvent) {
		const pane = {
			clientX: e.clientX,
			leftWidth: left.offsetWidth,
			rightWidth: right.offsetWidth
		};

		function mousemove(e: MouseEvent) {
			let dx = e.clientX - pane.clientX;
			dx = Math.min(Math.max(dx, -pane.leftWidth), pane.rightWidth);
			const l = pane.leftWidth + dx;
			const r = pane.rightWidth - dx;
			leftWidth = (l / (l + r)) * 100;
			rightWidth = (r / (l + r)) * 100;
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
</script>

<div class="flex h-full">
	<div bind:this={left} class="h-full" style={`width: calc(${leftWidth}% - 0.25rem)`}>
		<slot name="left" />
	</div>

	<div
		on:mousedown={mousedown}
		class="h-full min-w-[0.5rem] cursor-col-resize bg-slate-200 bg-center bg-no-repeat hover:bg-indigo-400"
	/>

	<div bind:this={right} class="h-full" style={`width: calc(${rightWidth}% - 0.25rem)`}>
		<slot name="right" />
	</div>
</div>
