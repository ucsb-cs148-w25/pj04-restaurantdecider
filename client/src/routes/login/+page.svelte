<script lang="ts">
	import { apiBaseUrl } from '$lib/index.js';
	import { setUsername } from '$lib/stores/userStore.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';

	let loginUsername = '';
	let loginPassword = '';

	let errorMessage = '';
	onMount(() => {
		const checkLoginStatus = async () => {
			try {
				const response = await fetch(`${apiBaseUrl}/users/auto-login`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Authorization': `Bearer ${getAuthToken()}`
					}
				});
				if (response.ok) {
					const data = await response.json();
					console.log(data);
					setUsername(data.username);
					goto('/restaurant_search');
				}
			} catch (error) {
				console.error('Auto-login check failed:', error);
			}
		};
		checkLoginStatus();
});

	async function handleSubmitLogin(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch(`${apiBaseUrl}/users/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					username: loginUsername,
					password: loginPassword
				})
			});

			if (response.ok) {
				const data = await response.json();
				console.log(data);
				setUsername(data.username);
				goto('/restaurant_search');
			} else {
				errorMessage = 'Invalid username or password.';
			}
		} catch (error) {
			console.error('Login error:', error);
		}
	}
</script>

<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    <Button href="/signup" variant="outline" size="sm" class="bg-black text-white">Sign Up</Button>
  </div>
</header>

<div class="flex items-center justify-center min-h-screen flex-col space-y-6">
	<div class="text-center space-y-6 w-full max-w-sm mx-auto">
		<h1 class="text-3xl font-bold underline">Sign in</h1>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
		<form on:submit={handleSubmitLogin} class="space-y-4">
			<Input bind:value={loginUsername} placeholder="Username/Email" class="w-full"></Input>
			<Input bind:value={loginPassword} placeholder="Password" class="w-full" type="password"></Input>
			<Button type="submit" class="w-full">Submit</Button>
		</form>
	</div>
</div>
