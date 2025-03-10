<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import LogoNoMove from '$lib/images/WEAT_unmoving.png';
  import LogoMove from '$lib/images/WEAT.gif';
</script>

<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
  <a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem"></a>
</header>


<div class="flex flex-col items-center justify-center h-screen">
  <div class="text-center space-y-4">
    <img src={LogoMove} alt="Logo" style="width: 30rem">
    <p class="text-lg">Decide on restaurants with your friends</p>

    <Button href="/login" variant="outline" size="lg" class="bg-black text-white py-5 px-8 text-lg mx-2">Sign In</Button>
    
    <Button href="/signup" variant="outline" size="lg" class="bg-black text-white py-5 px-8 text-lg mx-2">Sign Up</Button>
  </div>
</div>