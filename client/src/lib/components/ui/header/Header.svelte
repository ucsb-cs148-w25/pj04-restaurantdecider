<script>
  import { Button } from '$lib/components/ui/button';
  import { goto } from '$app/navigation';
  import { apiBaseUrl } from '$lib/index.js';
  import { getAuthToken } from '$lib/stores/userStore.svelte.js';

  // Props to customize the header
  export let isAuthenticated = false; // Whether the user is logged in
  export let position = "absolute"; // Can be "absolute", "fixed", etc.
  export let showSignUp = true; // Whether to show signup button (for login page)
  export let showSignIn = true; // Whether to show signin button (for signup page)
  export let bgColor = ""; // Optional background color class

  // Function to handle sign out
  async function handleSignOut() {
    try {
      await fetch(`${apiBaseUrl}/users/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        credentials: 'include'
      });
      goto('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
</script>

<header class="{position} top-0 left-0 right-0 z-50 flex justify-between p-4 {bgColor}">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    {#if isAuthenticated}
      <!-- Logged in state -->
      <form on:submit|preventDefault={handleSignOut}>
        <Button href="/profile" variant="outline" size="sm" class="bg-black text-white">Profile</Button>
        <Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button>
      </form>
    {:else}
      <!-- Logged out state -->
      {#if showSignIn}
        <Button href="/login" variant="outline" size="sm" class="bg-black text-white">Sign In</Button>
      {/if}
      {#if showSignUp}
        <Button href="/signup" variant="outline" size="sm" class="bg-black text-white">Sign Up</Button>
      {/if}
    {/if}
  </div>
</header>
