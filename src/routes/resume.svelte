<script>
    import { onDestroy, onMount } from 'svelte';
    import Fa from 'svelte-fa';
    import { faPrint } from '@fortawesome/free-solid-svg-icons';
    import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
    import { DateTime } from 'luxon';

    const startDate = DateTime.fromISO('2008-01-01');

    $: timers = [];
    onMount(() => {
        const timeSince = setInterval(() => {
            document.querySelector('#timeSince').innerHTML = getTimeSinceString();
        }, 1000);
        timers.push(timeSince);
    });

    onDestroy(() => {
        timers.forEach(t => clearInterval(t));
    });

    function getTimeSinceString() {
        const diff = DateTime.now()
            .diff(startDate, ['years', 'months', 'days', 'hours', 'minutes', 'seconds'])
            .toObject();
        return `${diff.years} year(s), ${diff.months} month(s), ${diff.days} day(s), ${
            diff.hours
        } hour(s), ${diff.minutes} minute(s), and ${Math.floor(diff.seconds)} second(s).`;
    }
</script>

<svelte:head>
    <title>Resume | AlexGravely.Dev</title>
    <meta name="description" content="Resume of Alex Gravely" />
    <meta name="robots" content="index, nofollow" />
    <link
        rel="preload"
        as="style"
        href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.14.0/devicon.min.css"
    />
</svelte:head>

<section id="resume">
    <section id="profile">
        <article>
            <h2>Kenneth "Alex" Gravely</h2>
            <h3>Full Stack Developer</h3>
            <hr />
            <div>
                <a
                    href="https://github.com/AntiTcb"
                    rel="noreferrer"
                    target="_blank"
                    title="GitHub"
                >
                    <Fa icon={faGithub} size="1.5x" />
                </a>
                <a
                    href="https://www.linkedin.com/in/antitcb/"
                    rel="noreferrer"
                    target="_blank"
                    title="LinkedIn"
                >
                    <Fa icon={faLinkedin} size="1.5x" />
                </a>
            </div>
            <p>
                Critical thinker. Knack for debugging problems. Ambitious and eager to learn new
                things. Jack of all trades, able to template a website design, construct the
                backend, setup continuous deployment.
            </p>
            <p id="programming_time">
                Professional, freelance, and hobby developer for (approximately) <span
                    id="timeSince">...</span
                >
            </p>
        </article>
    </section>
    <section id="work">
        <article>
            <h2>Work Experience</h2>
            <div class="job">
                <h3 class="title">Software Developer / Technical Support, Ziiva</h3>
                <p class="duration">January 2018 - Present</p>
                <p class="job_description">
                    Ziiva provides SAAS through Prosperity, their Online Learning Management
                    Platform, simplying the needs of managing training employees for enterprise
                    corporations or selling online courses for people looking to start up an online
                    business.
                </p>
                <ul class="job_responsibilities">
                    <li>
                        Provided implementation, consultation, configuration, and technical support
                        to existing customers on customizations to their site instance to meet their
                        training, reporting, and ecommerce needs.
                    </li>
                    <li>
                        Maintained multi-tenant ColdFusion application, using HTML/CSS/JS to handle
                        client website branding, ColdFusion for functionality changes, server-side
                        maintenance in IIS, and database management in MSSQL.
                    </li>
                    <li>
                        Developed several internal tools with .NET for simplying large scriptable
                        tasks needed for client implementation or modification.
                    </li>
                    <li>
                        Provided technical support via phone and email whenever an issue with the
                        site arose, identifiying problems through meticulous debugging, and seeing a
                        fix through to the end, confirming issue is resolved through testing.
                    </li>
                </ul>
            </div>
            <div class="job">
                <h3 class="title">Programming Associate, Star City Games</h3>
                <p class="duration">October 2014 - March 2015</p>
                <p class="job_description">
                    Star City Games operates the largest Magic the Gathering ecommerce website.
                </p>
                <ul class="job_responsibilities">
                    <li>
                        Self taught VB.NET and C# for development and reimplementation of internal
                        applications necessary for day to day operations.
                    </li>
                    <li>Maintain internal card databases using MS Access and MySQL.</li>
                </ul>
            </div>
            <div class="job">
                <h3 class="title">Web Developer, Roanoke College (Work Study)</h3>
                <p class="duration">May 2013 - September 2013</p>
                <p class="job_description">
                    Offered as a Work Study option, Roanoke College provides jobs in their IT
                    department for students to get early experience in a corporate environment and
                    cultivate their skills with hands on experience while earning their degrees.
                </p>
                <ul class="job_responsibilities">
                    <li>
                        Learn and develop a full stack setup for intra-department campus activities;
                        HTML, CSS, JavaScript for the frontend, ColdFusion for the serverside
                        language, and MSSQL for the database.
                    </li>
                    <li>
                        Assist with setup of new campus owned computers for student and faculty use
                        by installing Windows and configuration for restricted use.
                    </li>
                </ul>
            </div>
        </article>
    </section>
    <section id="languages">
        <article>
            <h2>Skills</h2>
            <h3>Languages</h3>
            <div>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"
                        alt="C Sharp"
                        title="C#"
                    />
                    <figcaption>C#</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://upload.wikimedia.org/wikipedia/commons/6/63/Adobe_ColdFusion_10_icon.png"
                        alt="ColdFusion"
                        title="ColdFusion"
                    />
                    <figcaption>ColdFusion</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                        alt="JavaScript"
                        title="JavaScript"
                    />
                    <figcaption>JavaScript</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original-wordmark.svg"
                        alt="HTML"
                        title="HTML"
                    />
                    <figcaption>HTML</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-plain-wordmark.svg"
                        alt="CSS"
                        title="CSS"
                    />
                    <figcaption>CSS</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain-wordmark.svg"
                        alt="GraphQL"
                        title="GraphQL"
                    />
                    <figcaption>GraphQL</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg"
                        alt="MySQL"
                        title="MySQL"
                    />
                    <figcaption>MySQL</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original-wordmark.svg"
                        alt="PostgreSQL"
                        title="PostgreSQL"
                    />
                    <figcaption>PostgreSQL</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain-wordmark.svg"
                        alt="MSSQL"
                        title="MSSQL"
                    />
                    <figcaption>MSSQL</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg"
                        alt="PHP"
                        title="PHP"
                    />
                    <figcaption>PHP</figcaption>
                </figure>
            </div>
            <h3>Frameworks</h3>
            <div>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg"
                        alt="WordPress"
                        title="WordPress"
                    />
                    <figcaption>WordPress</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg"
                        alt="Dot Net Core"
                        title=".NET Core"
                    />
                    <figcaption>.NET Core</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original-wordmark.svg"
                        alt="Git"
                        title="git"
                    />
                    <figcaption>Git</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original-wordmark.svg"
                        alt="jQuery"
                        title="jQuery"
                    />
                    <figcaption>jQuery</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg"
                        alt="NGINX"
                        title="NGINX"
                    />
                    <figcaption>NGINX</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original-wordmark.svg"
                        alt="React"
                        title="React"
                    />
                    <figcaption>React</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg"
                        alt="Svelte"
                        title="Svelte"
                    />
                    <figcaption>Svelte</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/less/less-plain-wordmark.svg"
                        alt="LESS"
                        title="LESS"
                    />
                    <figcaption>LESS</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg"
                        alt="Sass/SCSS"
                        title="SASS/SCSS"
                    />
                    <figcaption>SASS/SCSS</figcaption>
                </figure>
            </div>
            <h3>Systems</h3>
            <div>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg"
                        alt="Windows"
                        title="Windows"
                    />
                    <figcaption>Windows</figcaption>
                </figure>
                <figure>
                    <img
                        width="75"
                        height="75"
                        src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain-wordmark.svg"
                        alt="Ubuntu"
                        title="Ubuntu"
                    />
                    <figcaption>Ubuntu</figcaption>
                </figure>
            </div>
        </article>
    </section>
    <section id="education">
        <article>
            <h2>Education</h2>
            <h3 class="title">Applied Computer Science, Roanoke College</h3>
            <p class="duration">August 2012 - September 2013</p>
            <p>
                Course Work - Fundamentals of CS (Python), Data Structures and Algorithms, Computer
                Security, System Administration
            </p>
        </article>
    </section>
    <section id="interests">
        <article>
            <h2>Interests & Side Projects</h2>
            <div class="interest">
                <h3 class="title">Freelance Full Stack Developer</h3>
                <p class="duration">July 2013 - Present</p>
                <ul class="job_responsibilities">
                    <li>
                        <h4>YGOrganization / CardfightCoalition</h4>
                        <ul>
                            <li>
                                Sole maintainer for trading card game niche WordPress sites,
                                managing upkeep of front-end design and server-side stability, using
                                HTML, CSS, JavaScript, PHP, MySQL, NGINX, and Ubuntu.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h4>DragonForce / Herman Li</h4>
                        <ul>
                            <li>
                                Sole maintainer for WordPress site for the metal band DragonForce
                                and the personal website of bassist Herman Li. Managing upkeep of
                                front-end design and server-side stability, using HTML, CSS,
                                JavaScript, PHP, MySQL, NGINX, and Ubuntu.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h4>HeroSync</h4>
                        <ul>
                            <li>
                                Maintainer of React front-end website, powered by a headless
                                WordPress installation.
                            </li>
                            <li>
                                Assist in development of game, contributing to the Unity game engine
                                implementation, and providing ASP.NET Core API applications for
                                internal usage.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h4>Loudon Avenue Christian Church</h4>
                        <ul>
                            <li>Sole maintainer of WordPress site for a local church.</li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="interest">
                <h3 class="title">Open Source Contributions</h3>
                <p class="duration">June 2016 - Present</p>
                <ul class="job_responsibilities">
                    <li>
                        <h4>Discord Bot Developer, Discord.NET</h4>
                        <ul>
                            <li>
                                Developer of four Discord Bot Applications written in C# to aid in
                                community engagement for Yu-Gi-Oh, RuneScape, World of Warcraft, and
                                webhook management for the YGOrganization/Cardfight Coalition
                                websites.
                            </li>
                            <li>
                                Contributor and repository assistant manager for the Discord.NET
                                library, a C# wrapper for the Discord chat application's API.
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h4>CFDocs</h4>
                        <ul>
                            <li>
                                Provided several contributions to CFDocs, a hosted documentation
                                site for the ColdFusion language.
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </article>
    </section>
    <div id="printMe" on:click={() => window.print()} title="Print">
        <Fa icon={faPrint} />
    </div>
</section>

<style lang="scss">
    h3 {
        font-size: 0.9rem;
    }
    hr {
        margin: 0.5rem 0;
    }
    article {
        margin: 1rem 0.5rem;
        padding: 1rem;
        box-shadow: 0 1px 5px white;
        border: none;
        border-radius: 0.5rem;

        * {
            margin: 0.25rem 0;
        }
    }
    p {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }
    figcaption {
        display: none;
    }
    .job_description {
        font-size: 0.7rem;
    }
    .duration {
        font-size: 0.75rem;
        text-decoration: underline;
    }
    #resume {
        margin-right: 1rem;
    }
    #languages {
        div {
            display: flex;
            flex-wrap: wrap;
            margin: 1rem 0;

            img {
                padding: 0.125rem;
            }
        }
    }
    #work,
    #interests {
        div {
            margin: 0.75rem 0.5rem;
            ul {
                list-style: inside;
                font-size: 0.7rem;

                h4 {
                    display: inline;
                    letter-spacing: 2px;
                }

                ul {
                    list-style: none;
                    li {
                        margin-left: 1rem;
                    }
                }
            }
            li {
                color: var(--text-secondary);
            }
        }
    }
    #education {
        h3 + p {
            font-size: 0.75rem;
        }
    }
    #printMe {
        position: fixed;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 1rem;
        padding: 0.5rem;
        margin: 0.25rem;
        cursor: pointer;
    }

    @media print {
        :global(nav),
        :global(svg),
        :global(img),
        #programming_time,
        #printMe {
            display: none !important;
        }
        * {
            color: black !important;
            background-color: white !important;
            text-shadow: none;
        }
        a {
            &::after {
                content: attr(href);
                font-size: 12pt;
            }
        }
        article {
            margin-top: 0;
            margin-bottom: 0;
            padding-top: 0;
            padding-bottom: 0;
        }
        #resume {
            margin-right: 0;
        }
        #languages {
            article * {
                margin: 0.1rem 0;
            }
            article div {
                margin: 0;
            }
            figure {
                figcaption {
                    display: block;
                    font-size: 12pt;

                    &::after {
                        content: ', ';
                        padding-right: 5px;
                    }
                }
                &:last-of-type figcaption::after {
                    content: '';
                }
            }
        }
    }
</style>
