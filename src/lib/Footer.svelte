<script>
    import Fa from 'svelte-fa';
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<section>
    <a href="https://github.com/AntiTcb/" target="_blank">
        <Fa icon={faGithub} size="1.5x" />
    </a>
</section>

<style>
    section {
        position: fixed;
        bottom: 0;
        display: flex;
        justify-content: center;
        background-color: var(--bg-primary);
        width: 100%;
        padding: 0.25rem;
        grid-area: footer;
    }
    a {
        color: white;
    }
</style>
