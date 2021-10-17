<script>
	import '../app.scss';
    import Header from '$lib/Header.svelte';
</script>

<Header />

<main>
    <slot />
</main>

<style>
    main {
        width: 100%;
        padding: 1rem;
    }
</style>
