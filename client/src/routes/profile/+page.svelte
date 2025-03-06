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
  <a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem"></a>
  <div class="space-x-2">
    <form on:submit|preventDefault={handleSignOut}>
			<Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button
			>
		</form>
  </div>
</header>

<div class="pt-16 pb-24 min-h-screen items-center">
	<div class="text-4xl pl-4"> Hi, {getUsername()}!</div>
  <Card.Root class="card-root my-10">
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-4xl">Past Rankings</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center space-x-8 mt-4 self-start pl-4">
        <div class="flex items-center">
          <p class="mr-2 text-xl">temp</p>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</div>