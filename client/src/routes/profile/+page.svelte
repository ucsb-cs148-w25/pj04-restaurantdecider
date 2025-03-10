<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Pagination from "$lib/components/ui/pagination";
  import { getUsername, userProfileData, getAuthToken } from '$lib/stores/userStore.svelte.js';
  import * as Card from '$lib/components/ui/card';
  import LogoNoMove from '$lib/images/WEAT_unmoving.png';
  import { goto } from '$app/navigation';
  import { apiBaseUrl } from '$lib/index.js';

  let profileData;
  let currentPage = 1;
  const itemsPerPage = 12;

  userProfileData.subscribe(data => {
    profileData = data;
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

  function getWinnersForCurrentPage() {
    if (profileData && profileData.champions) {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return profileData.champions.slice(start, end);
    }
    return [];
  }

  function handlePageChange(page) {
    currentPage = page;
  }

  function getTotalPages() {
    if (profileData && profileData.champions) {
      return Math.ceil(profileData.champions.length / itemsPerPage);
    }
    return 0;
  }
</script>

<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
  <a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem"></a>
  <div class="space-x-2">
    <form on:submit|preventDefault={handleSignOut}>
      <Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button>
    </form>
  </div>
</header>

<div class="flex flex-col items-center pt-16 pb-24 min-h-screen">
  <div class="pl-4 text-4xl font-bold">Hi, {getUsername()}!</div>

  <Card.Root class="mt-16 w-1/2" style="height-50rem">
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-4xl font-bold">Past Winners</Card.Title>
    </Card.Header>
    <Card.Content>
      {#if profileData && profileData.champions && profileData.champions.length > 0}
        <div class="mt-8">
          <ul>
            {#each getWinnersForCurrentPage() as champion}
              <li class="text-xl">{champion}</li>
            {/each}
          </ul>
        </div>
      {/if}      
      {#if !profileData || !profileData.champions || profileData.champions.length === 0}
        <p>No rankings recorded yet.</p>
      {/if}
    </Card.Content>

    {#if profileData && profileData.champions && profileData.champions.length > itemsPerPage}
    <Card.Footer class="text-center mt-8">
      <Pagination.Root 
        count={getTotalPages()} 
        perPage={itemsPerPage} 
        let:pages let:currentPage
      >
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton 
            on:click={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          />
        </Pagination.Item>
        {#each pages as page (page.key)}
          {#if page.type === "ellipsis"}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item isVisible={currentPage == page.value}>
              <Pagination.Link {page} isActive={currentPage == page.value}>
                {page.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton 
            on:click={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === getTotalPages()}
          />
        </Pagination.Item>
      </Pagination.Content>
      </Pagination.Root>
    </Card.Footer>
    {/if}
  </Card.Root>
</div>
