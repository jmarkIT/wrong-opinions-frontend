<script lang="ts">
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
</script>

<svelte:head>
	<title>Create Account - Wrong Opinions</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-stone-900 px-4">
	<div class="w-full max-w-md">
		<div class="bg-white dark:bg-stone-800 rounded-md border border-cream-200 dark:border-stone-700 shadow-sm p-8">
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold text-stone-800 dark:text-cream-100 font-serif">Create Account</h1>
				<p class="text-stone-500 dark:text-stone-400 mt-2">Join Wrong Opinions today</p>
			</div>

			<RegisterForm />
		</div>
	</div>
</div>
