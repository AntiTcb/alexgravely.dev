<script>
    import '../app.scss';
    import Header from '$lib/Header.svelte';
</script>

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
