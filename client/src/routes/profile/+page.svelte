<script>
    import { Button } from '$lib/components/ui/button';
	import { getUsername } from '$lib/stores/userStore.svelte.js';
	import { Header } from '$lib/components/ui/header';
</script>

<Header isAuthenticated={true} position="fixed" bgColor="bg-white" />

<div class="pt-16 pb-24 min-h-screen">
	<h1>Profile</h1>
	<div>Username: {getUsername()}</div>
</div>
