<script>
  import { Button } from '$lib/components/ui/button';
	import { getUsername } from '$lib/stores/userStore.svelte.js';
  import * as Card from '$lib/components/ui/card';
  import LogoNoMove from '$lib/images/WEAT_unmoving.png';
  import { goto } from '$app/navigation';
  import { getAuthToken } from '$lib/stores/userStore.svelte.js';
	import { apiBaseUrl } from '$lib/index.js';
  
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

<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
  <a href="/homepage"><img src={LogoNoMove} alt="Logo" style="width: 8rem"></a>
  <div class="space-x-2">
    <form on:submit|preventDefault={handleSignOut}>
			<Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button
			>
		</form>
  </div>
</header>

<div class="flex flex-col items-center justify-center pt-16 pb-24 min-h-screen">
  <div class="pl-4 text-6xl font-bold">Hi, {getUsername()}!</div>
</div>