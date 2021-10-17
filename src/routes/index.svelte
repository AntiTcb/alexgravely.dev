<script>
    import { onMount } from "svelte";

    import Highlight from "svelte-highlight";
    import json from "svelte-highlight/src/languages/json";
    import theme from "svelte-highlight/src/styles/stackoverflow-dark";

    const profile = JSON.stringify(
        {
            name: "Alex Gravely",
            description: "Freelance and Professional Full-Stack Developer",
            age: 27,
            location: "Roanoke, VA",
            portfolio: [
                "https://ygorganization.com",
                "https://cardfightcoalition.com",
                "https://dragonforce.com",
                "https://loudonavenuecc.org",
                "https://herosync.com"
            ],
            contact_info: {
                email: "antitcb@gmail.com",
                discord: "AntiTcb#0001",
                github: "https://github.com/AntiTcb",
                linkedIn: "https://www.linkedin.com/in/antitcb/",
            },
            trivia: {
                "favourites": {
                    animal: "Penguin",
                    anime: "Seven Deadly Sins",
                    car: "Chevrolet Volt",
                    cartoon: "Avatar the Last Airbender",
                    editor: "Visual Studio Code",
                    food: "Filet mignon, medium rare",
                    restaurant: "Chick-Fil-A",
                    tea: "Constant Comment by Bigelow",
                    video_games: ["World of Warcraft", "League of Legends", "Old School RuneScape"],
                },
                "dislikes": ["PHP", "Tab Delimiters", "VIM", "Tomatoes"]
            },
        }, null, '    '
    );

    onMount(() => {
        document.querySelectorAll(".hljs-string").forEach(s => {
            if (/https?:\/\//.test(s.innerHTML)) {
                s.innerHTML = `<a href=${s.innerHTML} target="_blank" rel="noreferrer">${s.innerHTML}</a>`;
            } else if (/gmail.com/.test(s.innerHTML))
                s.innerHTML = `<a href='mailto:${s.innerHTML}' target="_blank" rel="noreferrer">${s.innerHTML}</a>`;
        });
    });
</script>

<svelte:head>
    <title>AlexGravely.Dev</title>
    <meta name="description" content="Portfolio of Alex Gravely" />
    <meta name=”robots” content="index, nofollow">
    {@html theme}
</svelte:head>

<section>
    <article>
        <Highlight language="{json}" code={profile} />
    </article>
</section>

<style lang="scss">
    :global(pre) {
        :global(code) {
            overflow-x: hidden;
            overflow-wrap: break-word;
            word-break: break-word;
            white-space: pre-wrap;
            border-radius: 0.5rem;
        }
    }
</style>
