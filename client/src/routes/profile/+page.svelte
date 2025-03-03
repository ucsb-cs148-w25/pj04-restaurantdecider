<script>
  import { Button } from '$lib/components/ui/button';
	import { getUsername } from '$lib/stores/userStore.svelte.js';
  import * as Card from '$lib/components/ui/card';
</script>

<header class="fixed top-0 left-0 right-0 flex justify-between p-4 bg-white z-50">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    <form>
      <Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out (Inoperative)</Button>
    </form>
  </div>
</header>

<div class="pt-16 pb-24 min-h-screen">
	<div class="pl-4 text-4xl">Hi, {getUsername()}!</div>
  <Card.Root class="mt-16">
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-4xl">Past Rankings</Card.Title>
    </Card.Header>
    <Card.Content>
      <p class="text-xl">temp</p>
    </Card.Content>
  </Card.Root>
</div>