<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { getUsername, userProfileData, getAuthToken } from '$lib/stores/userStore.svelte.js';
  import * as Card from '$lib/components/ui/card';
  import LogoNoMove from '$lib/images/WEAT_unmoving.png';
  import { goto } from '$app/navigation';
  import { apiBaseUrl } from '$lib/index.js';

  let profileData;

  // Subscribe to user profile data
  userProfileData.subscribe(data => {
    profileData = data;
  });

  // Handle sign-out action
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

<div class="flex flex-col items-center pt-16 pb-24 min-h-screen">
  <div class="pl-4 text-4xl font-bold">Hi, {getUsername()}!</div>

  <Card.Root class="mt-16 w-1/2 h-96">
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-4xl font-bold">Past Winners</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if profileData && profileData.champions && profileData.champions.length > 0}
        <div class="mt-8">
          <ul>
            {#each profileData.champions as champion}
              <li class="text-xl">{champion}</li>
            {/each}
          </ul>
        </div>
      {/if}      
      {#if !profileData || !profileData.champions || profileData.champions.length === 0}
        <p>No rankings recorded yet.</p>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
