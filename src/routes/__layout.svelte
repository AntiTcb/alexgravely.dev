<script>
    import '../app.scss';
    import Header from '$lib/Header.svelte';
    import Analytics from '$lib/Analytics.svelte';
</script>

<Analytics />

<Header />

<main>
    <slot />
</main>

<style lang="scss">
    main {
        width: 100%;
        padding: 1rem;

        @include screen-size(phone) {
            padding: 0.5rem;
        }
    }
</style>
