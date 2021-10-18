<script>
    import { onMount } from 'svelte';

    import Highlight from 'svelte-highlight';
    import json from 'svelte-highlight/src/languages/json';
    import theme from 'svelte-highlight/src/styles/stackoverflow-dark';

    import profile from '/static/profile.json';

    onMount(() => {
        document.querySelectorAll('.hljs-string').forEach(s => {
            if (/https?:\/\//.test(s.innerHTML)) {
                s.innerHTML = `<a href=${s.innerHTML} target="_blank" rel="noreferrer">${s.innerHTML}</a>`;
            } else if (/gmail.com/.test(s.innerHTML))
                s.innerHTML = `<a href='mailto:${s.innerHTML.replaceAll('"', '')}' target="_blank" rel="noreferrer">${s.innerHTML}</a>`;
        });
    });
</script>

<svelte:head>
    <title>AlexGravely.Dev</title>
    <meta name="description" content="Portfolio of Alex Gravely" />
    <meta name="robots" content="index, nofollow" />
    {@html theme}
</svelte:head>

<section>
    <article>
        <Highlight language={json} code={JSON.stringify(profile, null, '  ')} />
    </article>
</section>

<style lang="scss">
    :global(pre[data-language="json"]) {
        word-wrap: break-word;
        font-size: clamp(0.75rem, -0.85rem + 8.333vw, 0.95rem);
        overflow-x: hidden;
        white-space: break-spaces;
    }
</style>
