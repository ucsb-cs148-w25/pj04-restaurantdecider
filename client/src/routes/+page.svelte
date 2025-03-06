<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Header } from "$lib/components/ui/header";
</script>

<Header isAuthenticated={false} position="absolute" />


<div class="flex flex-col items-center justify-center h-screen">
  <div class="text-center space-y-4">
    <h1 class="text-5xl font-bold">Weat</h1>
    <p class="text-lg">Decide on restaurants with your friends</p>

    <Button href="/login" variant="outline" size="sm" class="bg-black text-white">Sign In</Button>
    <Button href="/signup" variant="outline" size="sm" class="bg-black text-white">Sign Up</Button>
  </div>
</div>