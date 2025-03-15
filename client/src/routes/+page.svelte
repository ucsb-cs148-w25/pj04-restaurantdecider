<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import LogoNoMove from '$lib/images/WEAT_unmoving.png';
	import LogoMove from '$lib/images/WEAT.gif';
</script>

<header class="absolute left-0 right-0 top-0 flex justify-between p-4">
	<a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem" /></a>
</header>

<div class="flex h-screen flex-col items-center justify-center">
	<div class="space-y-4 text-center">
		<img src={LogoMove} alt="Logo" style="width: 30rem" />
		<p class="text-lg">Don't know where to go eat? <br> Let WEAT help you decide!</p>

		<Button
			href="/login"
			variant="outline"
			size="lg"
			class="mx-2 bg-black px-8 py-5 text-lg text-white">Sign In</Button
		>

		<Button
			href="/signup"
			variant="outline"
			size="lg"
			class="mx-2 bg-black px-8 py-5 text-lg text-white">Sign Up</Button
		>
	</div>
</div>
