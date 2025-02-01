<script>
	import { getUsername } from '$lib/stores/userStore.svelte.js';
</script>

<div>{getUsername()}</div>
