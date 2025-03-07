<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { getUsername, userProfileData } from '$lib/stores/userStore.svelte.js';
  import * as Card from '$lib/components/ui/card';

  let profileData;
  userProfileData.subscribe(data => {
    profileData = data;
  });
</script>

<header class="fixed top-0 left-0 right-0 flex justify-between p-4 bg-white z-50">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    <form>
      <Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out (Inoperative)</Button>
    </form>
  </div>
</header>

<div class="flex flex-col items-center pt-16 pb-24 min-h-screen">
  <div class="pl-4 text-4xl font-bold">Hi, {getUsername()}!</div>

  <Card.Root class="mt-16 w-1/2 h-96">
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-4xl font-bold">Past Rankings</Card.Title>
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
