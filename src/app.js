var engine = new Engine({
    routes: {
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
    },
})
