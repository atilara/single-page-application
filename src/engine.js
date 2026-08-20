class Engine {
    constructor(options = {}) {
        this.routes = options.routes || {}

        this.init()
    }

    init() {
        const start = () => {
            document.body.addEventListener('click', (e) => {
                const target = e.target.closest('[data-link]')
                if (target) {
                    e.preventDefault()
                    this.navigateTo(target.href)
                }
            })

            window.addEventListener('popstate', () => this.router())

            this.router()
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start)
        } else {
            start()
        }
    }

    async router() {
        const path = window.location.pathname
        const routeConfig = this.routes[path]

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
                const src = oldScript.getAttribute('src')
                if (
                    src &&
                    (src.endsWith('engine.js') || src.endsWith('app.js'))
                ) {
                    return
                }

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

    navigateTo(url) {
        window.history.pushState(null, null, url)
        this.router()
    }
}
