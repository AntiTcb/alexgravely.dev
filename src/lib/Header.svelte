<nav>
    <span class="brand">
        <span class="link"><a href="/">AlexGravely.Dev</a></span>
    </span>
    <span class="menu">
        <span class="link mobile-only"><a href="/">Home</a></span>
        <span class="link"><a href="/resume">Résumé</a></span>
    </span>
</nav>

<style lang="scss">
    nav {
        display: flex;
        position: sticky;
        top: 0;
        justify-content: space-between;
        align-items: center;
        background-color: var(--bg-primary);
        width: 100%;

        @include screen-size(phone) {
            justify-content: center;
        }

        span {
            padding: calc(1rem / 10) 0.5rem;
            font-size: clamp(0.5rem, -0.85rem + 8.333vw, 0.85rem);

            a {
                color: var(--text-primary);
                text-decoration: none;
                transition: all 0.25s ease;
            }
        }

        .link {
            &:hover a {
                color: var(--text-secondary);
            }

            &.mobile-only {
                display: none;

                @include screen-size(phone) {
                    display: block;
                }
            }
        }

        .brand {
            text-transform: uppercase;
            .link {
                font-size: 1.25rem;
            }

            @include screen-size(phone) {
                display: none;
            }
        }
        .menu {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0;
            height: 100%;

            .link {
                border-left: 1.5px solid var(--text-primary) ;
                border-right: 1.5px solid var(--text-primary);

                &:first-child {
                    border-left-width: 0;
                }
                &:nth-child(2) {
                    @include screen-size(tablet-portrait) {
                        border-left-width: 0;
                    }
                }
                &:last-child {
                    border-right-width: 0;
                }
            }
        }
    }
</style>
