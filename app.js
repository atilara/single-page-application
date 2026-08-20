const routes = {
    '/': {
        route: '/index.html',
    },
    '/about': { route: '/routes/about.html' },
}

async function router() {
    const path = window.location.pathname
    const route = routes[path].route || routes['/'].route

    try {
        const response = await fetch(route)

        if (!response.ok) {
            throw new Error('Page not found')
        }

        const html = await response.text()

        document.body.innerHTML = html
    } catch (error) {
        document.body.innerHTML = '<h1>404</h1><p>Page not found.</p>'
    }
}

function navigateTo(url) {
    window.history.pushState(null, null, url)
    router()
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault()
            navigateTo(e.target.href)
        }
    })

    window.addEventListener('popstate', router)

    router()
})
