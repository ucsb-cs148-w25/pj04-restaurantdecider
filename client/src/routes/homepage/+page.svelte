<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import LogoNoMove from '$lib/images/WEAT_unmoving.png';
	import LogoMove from '$lib/images/WEAT.gif';
	import { apiBaseUrl } from '$lib/index.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
    const authToken = getAuthToken();
    if (authToken) {
      console.log("signed up")
    } else {
      goto('/');
    }
  	});

	async function handleSignOut() {
		await fetch(`${apiBaseUrl}/users/signout`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getAuthToken()}`
			},
			credentials: 'include'
		});
		goto('/');
	}
</script>

<header class="absolute left-0 right-0 top-0 flex justify-between p-4">
	<a href="/homepage"><img src={LogoNoMove} alt="Logo" style="width: 8rem" /></a>
	<div class="space-x-2">
		<form on:submit|preventDefault={handleSignOut}>
			<Button href="/profile" variant="outline" size="sm" class="bg-black text-white"
				>Profile</Button
			>
			<Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button
			>
		</form>
	</div>
</header>

<div class="flex h-screen flex-col items-center justify-center">
	<div class="space-y-4 text-center">
		<img src={LogoMove} alt="Logo" style="width: 30rem" />
		<p class="text-lg">Decide on restaurants by yourself or with your friends!</p>

		<Button
			href="/restaurant_search"
			variant="outline"
			size="lg"
			class="mx-2 bg-black px-8 py-5 text-lg text-white">Individual</Button
		>

		<Button
			href="/group"
			variant="outline"
			size="lg"
			class="mx-2 bg-black px-8 py-5 text-lg text-white">Create Group</Button
		>
	</div>
</div>
