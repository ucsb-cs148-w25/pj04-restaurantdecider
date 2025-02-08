<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { apiBaseUrl } from '$lib/index.js';
	import { setUsername } from '$lib/stores/userStore.svelte.js';
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let confirmPassword = '';
	let errorMessage = '';

	async function handleSubmitSignup(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch(`${apiBaseUrl}/users/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					username: username,
					password: password,
          confirmPassword: confirmPassword
				})
			});
			if (response.ok) {
				goto('/login');
			} else {
				console.error('Signup failed:', response.statusText);
				errorMessage = 'Signup failed: ' + response.statusText;
			}
		} catch (error) {
			console.error('Signup error:', error);
			errorMessage = 'Signup error: ' + error;
		}
	}
</script>


<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    <Button href="/login" variant="outline" size="sm" class="text-white bg-black">Sign In</Button>
  </div>
</header>

<div class="flex flex-col items-center justify-center min-h-screen space-y-6">
	<div class="w-full max-w-sm mx-auto text-center space-y-6">
		<h1 class="text-3xl font-bold underline">Sign Up</h1>
		<form on:submit={handleSubmitSignup} class="space-y-4">
			<Input bind:value={username} placeholder="Username/Email" class="max-w-sm mx-auto"></Input>
			<Input bind:value={password} placeholder="Password" class="max-w-sm mx-auto" type="password"></Input>
			<Input bind:value={confirmPassword} placeholder="Confirm Password" class="max-w-sm mx-auto" type="password"></Input>
			<Button type="submit" class="w-full max-w-sm mx-auto">Submit</Button>
			{#if errorMessage}
				<p class="text-red-500">{errorMessage}</p>
			{/if}
		</form>
	</div>

	<p class="text-center">
		<a href="./" class="text-black-500 hover:underline">Return Home</a>
	</p>
</div>
