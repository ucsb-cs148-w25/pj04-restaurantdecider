<script lang="ts">
	import { apiBaseUrl } from '$lib/index';
	import { setUsername } from '$lib/stores/userStore.svelte.js';
	import { getUsername } from '$lib/stores/userStore.svelte.js';

	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	let loginUsername = '';
	let loginPassword = '';

	let signupUsername = '';
	let signupPassword = '';

	async function handleSubmitLogin(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch(`${apiBaseUrl}/users/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: loginUsername,
					password: loginPassword
				})
			});
			if (response.ok) {
				console.log('Login successful');
				setUsername(loginUsername);
				console.log(loginUsername);
			} else {
				console.error('Login failed:', response.statusText);
			}
		} catch (error) {
			console.error('Login error:', error);
		}
	}

	async function handleSubmitSignup(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch(`${apiBaseUrl}/users/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: signupUsername,
					password: signupPassword
				})
			});
			if (response.ok) {
				console.log('Signup successful');
			} else {
				console.error('Signup failed:', response.statusText);
			}
		} catch (error) {
			console.error('Signup error:', error);
		}
	}
</script>

<h1 class="text-3xl font-bold underline">Login</h1>

<form on:submit={handleSubmitLogin}>
	<Input bind:value={loginUsername} placeholder="Username/Email" class="max-w-sm"></Input>
	<Input bind:value={loginPassword} placeholder="Password" class="max-w-sm" type="password"></Input>
	<Button type="submit">Submit</Button>
</form>

<h1 class="text-3xl font-bold underline">Sign up</h1>
<form on:submit={handleSubmitSignup}>
	<Input bind:value={signupUsername} placeholder="Username/Email" class="max-w-sm"></Input>
	<Input bind:value={signupPassword} placeholder="Password" class="max-w-sm" type="password"
	></Input>
	<Button type="submit">Submit</Button>
</form>

<p><a href="/..">Return Home</a></p>

<p>{getUsername()}</p>
