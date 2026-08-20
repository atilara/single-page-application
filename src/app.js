const routes = {
    '/': {
        route: '/index.html',
    },
    '/about': { route: '/routes/about.html' },
}

async function router() {
    const path = window.location.pathname

    try {
        const route = routes[path]?.route

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
