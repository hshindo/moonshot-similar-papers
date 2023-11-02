<script lang="ts">
	import { IconFolder, IconFileText } from '@tabler/icons-svelte';

	export let dirHandle: FileSystemDirectoryHandle;
	export let onFileClick: Function;

	let handles: FileSystemFileHandle[] = [];
	$: if (dirHandle) {
		(async () => {
			let hs: FileSystemFileHandle[] = [];
			for await (const h of dirHandle.values()) {
				if (h.kind === 'file') {
					if (h.name.endsWith('.pdf')) hs.push(h);
				}
			}
			hs.sort((a, b) => a.name.localeCompare(b.name));
			handles = hs;
		})();
	}
</script>

<div class="h-full overflow-auto px-2 py-2 text-xs">
	<div class="flex cursor-pointer select-none items-center py-0.5 hover:bg-gray-50" on:keydown>
		<div>
			<IconFolder size={16} />
		</div>
		<div class="min-w-0 truncate pl-1">{dirHandle.name}</div>
	</div>

	<div class="ml-4">
		{#each handles as h}
			<div
				class="flex cursor-pointer items-center py-0.5 hover:bg-gray-50"
				on:click={() => onFileClick(dirHandle, h)}
				on:keydown
			>
				<div>
					<IconFileText size={16} />
				</div>
				<div class="min-w-0 truncate pl-1">
					{h.name}
				</div>
			</div>
		{/each}
	</div>
</div>
