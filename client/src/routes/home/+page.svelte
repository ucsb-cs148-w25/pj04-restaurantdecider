<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<div class="flex flex-col items-center justify-center h-screen">
  <Button
    href="/login"
    variant="ghost"
    class="absolute right-12 top-8"
  >
    Sign In / Sign Up
  </Button>

  <div class="text-center space-y-4">
    <h1 class="text-5xl font-bold">Weat</h1>
    <p class="text-lg">Swipe until you find the perfect match!</p>

    <Button
      href="/restaurant_search"
      variant="secondary"
      class="bg-black text-white hover:bg-gray-600"
    >
      Start Searching
    </Button>
  </div>
</div>
