<script>
    import Icon from '@iconify/svelte';

    export let site;
    export let siteName;
    export let url;
    export let height = 50;
    export let width = 50;
</script>

<article class="rounded-full p-4 bg-gray-100 w-fit">
    <a href="{url}" target="_blank">
        <Icon icon="logos:{site}" width="{width}" height="{height}" class="inline" />
    </a>
</article>
