<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import LogoNoMove from '$lib/images/WEAT_unmoving.png';
    import LogoMove from '$lib/images/WEAT.gif';
	import { apiBaseUrl } from '$lib/index.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';
	import { goto } from '$app/navigation';

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
			<Button href="/profile" variant="outline" size="sm" class="bg-black text-white"
				>Profile</Button
			>
			<Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button
			>
		</form>
	</div>
</header>
  
  
  <div class="flex flex-col items-center justify-center h-screen">
    <div class="text-center space-y-4">
      <img src={LogoMove} alt="Logo" style="width: 30rem">
      <p class="text-lg">Decide on restaurants with your friends</p>
  
      <Button href="/restaurant_search" variant="outline" size="lg" class="bg-black text-white py-5 px-8 text-lg mx-2">Individual</Button>
      
      <Button href="/restaurant_search" variant="outline" size="lg" class="bg-black text-white py-5 px-8 text-lg mx-2">Team</Button>
    </div>
  </div>