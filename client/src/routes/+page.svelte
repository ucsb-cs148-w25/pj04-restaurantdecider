<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    <Button href="/login" variant="outline" size="sm" class="bg-black text-white">Sign In</Button>
    <Button href="/signup" variant="outline" size="sm" class="bg-black text-white">Sign Up</Button>
  </div>
</header>


<div class="flex flex-col items-center justify-center h-screen">
  <div class="text-center space-y-4">
    <h1 class="text-5xl font-bold">Weat</h1>
    <p class="text-lg">Decide on restaurants with your friends</p>

    <Button href="/login" variant="outline" size="sm" class="bg-black text-white">Sign In</Button>
    <Button href="/signup" variant="outline" size="sm" class="bg-black text-white">Sign Up</Button>
  </div>
</div>