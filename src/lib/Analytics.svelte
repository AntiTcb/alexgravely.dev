<script>
    import { page } from '$app/stores'

    $: {
      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-M1CN4YR1VL', {
          page_title: document.title,
          page_path: $page.url.href,
        })
      }
    }
  </script>

  <svelte:head>
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-M1CN4YR1VL">
    </script>
    <script>
      window.dataLayer = window.dataLayer || []

      function gtag() {
        dataLayer.push(arguments)
      }

      gtag('js', new Date())
      gtag('config', 'G-M1CN4YR1VL')
    </script>
  </svelte:head>
