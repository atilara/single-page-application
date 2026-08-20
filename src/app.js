const routes = {
    '/': {
        route: '/index.html',
        enabled: true,
    },
    '/about': {
        route: '/routes/about.html',
        enabled: true,
    },
    '/no-spa-nav': {
        route: '/routes/no-spa-nav.html',
        enabled: false,
    },
}

async function router() {
    const path = window.location.pathname
    const routeConfig = routes[path]

    if (routeConfig && routeConfig.enabled === false) {
        window.location.replace(routeConfig.route)
        return
    }

    try {
        const route = routeConfig?.route

        if (!route) {
            throw new Error('Page not found')
        }

        const response = await fetch(route)

        if (!response.ok) {
            throw new Error('Page not found')
        }

        const html = await response.text()

        const body = document.body
        body.innerHTML = html

        const scripts = body.querySelectorAll('script')
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script')
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value)
            })
            newScript.textContent = oldScript.textContent
            oldScript.parentNode.replaceChild(newScript, oldScript)
        })
    } catch (error) {
        document.body.innerHTML = '<h1>404</h1><p>Page not found.</p>'
    }
}

function navigateTo(url) {
    const urlObj = new URL(url, window.location.origin)
    const targetRoute = routes[urlObj.pathname]

    if (targetRoute && targetRoute.enabled === false) {
        window.location.href = targetRoute.route
        return
    }

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
