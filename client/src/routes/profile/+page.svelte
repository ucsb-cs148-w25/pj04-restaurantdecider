<script>
	import { getUsername } from '$lib/stores/userStore.svelte.js';
	console.log('after:', getUsername());
</script>

<div>{getUsername()}</div>
