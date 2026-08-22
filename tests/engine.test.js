import {
    it,
    assertEqual,
    assertTrue,
    assertFalse,
} from './test-micro-framework.js'
import { Engine } from '../src/core/engine.js'
import { ComponentCache } from '../src/core/component-cache.js'

function createLink(href, attrs = {}) {
    const a = document.createElement('a')
    a.href = href
    for (const [key, value] of Object.entries(attrs)) {
        a.setAttribute(key, value)
    }
    return a
}

function createMockPage(html) {
    const page = document.createElement('div')
    page.innerHTML = html
    return page
}

const testEngine = new Engine({
    routes: ['/about.html', '/site/*', (path) => path.startsWith('/api/')],
    enabled: true,
})

it('Engine: isRouteMatched should match exact string routes', () => {
    assertTrue(testEngine.isRouteMatched('/about.html'))
    assertFalse(testEngine.isRouteMatched('/contact.html'))
})

it('Engine: isRouteMatched should match wildcard routes', () => {
    assertTrue(testEngine.isRouteMatched('/site/dashboard.html'))
    assertTrue(testEngine.isRouteMatched('/site/settings'))
    assertFalse(testEngine.isRouteMatched('/other/dashboard.html'))
})

it('Engine: isRouteMatched should match function routes', () => {
    assertTrue(testEngine.isRouteMatched('/api/users'))
    assertFalse(testEngine.isRouteMatched('/graphql'))
})

it('Engine: shouldIntercept should return false for data-no-spa links', () => {
    const link1 = createLink('/about.html', { 'data-no-spa': 'true' })
    const link2 = createLink('/about.html', { 'data-no-spa': '' })
    assertFalse(testEngine.shouldIntercept(link1))
    assertFalse(testEngine.shouldIntercept(link2))
})

it('Engine: shouldIntercept should return false for external domains', () => {
    const link = createLink('https://example.com/about.html')
    assertFalse(testEngine.shouldIntercept(link))
})

it('Engine: shouldIntercept should return false for hash links on the same page', () => {
    const link = createLink(window.location.pathname + '#section1')
    assertFalse(testEngine.shouldIntercept(link))
})

it('Engine: shouldIntercept should return true for valid SPA links', () => {
    const origin = window.location.origin
    const link = createLink(`${origin}/about.html`)
    assertTrue(testEngine.shouldIntercept(link))
})

it('Engine: shouldIntercept should return true for wildcard SPA links', () => {
    const origin = window.location.origin
    const link = createLink(`${origin}/site/profile`)
    assertTrue(testEngine.shouldIntercept(link))
})

it('Engine: renderPage should correctly update document.title and document.body', () => {
    const originalTitle = document.title
    const originalChildren = Array.from(document.body.childNodes)

    const fakeHTML =
        '<html><head><title>Injected SPA Title</title></head><body><h1 id="injected-header">New SPA Content</h1></body></html>'
    testEngine.renderPage(fakeHTML)

    const isTitleUpdated = document.title === 'Injected SPA Title'
    const isInjectedHeaderPresent =
        document.getElementById('injected-header') !== null

    document.title = originalTitle
    document.body.replaceChildren(...originalChildren)

    assertTrue(isTitleUpdated)
    assertTrue(isInjectedHeaderPresent)
})

it('ComponentCache: should correctly save DOM nodes marked with data-cache-id', () => {
    const cache = new ComponentCache()
    const page = createMockPage(
        '<div data-cache-id="widget-1">Live Original Node</div>'
    )

    cache.save(page)

    assertTrue(cache.cache.has('widget-1'))
    assertEqual(
        cache.cache.get('widget-1').node.innerHTML,
        'Live Original Node'
    )
})

it('ComponentCache: should correctly dispatch spa:save and store custom state', () => {
    const cache = new ComponentCache()
    const page = createMockPage('<div data-cache-id="widget-2"></div>')
    const widget = page.firstElementChild

    widget.addEventListener('spa:save', (e) => {
        e.detail.state.activeTab = 'profile'
    })

    cache.save(page)
    assertEqual(cache.cache.get('widget-2').state.activeTab, 'profile')
})

it('ComponentCache: should restore cached nodes and dispatch spa:restore', () => {
    const cache = new ComponentCache()

    const pageA = createMockPage(
        '<div data-cache-id="widget-3">Live State preserved</div>'
    )
    const liveNode = pageA.firstElementChild
    cache.save(pageA)

    const pageB = createMockPage(
        '<div data-cache-id="widget-3">Static Server Placeholder</div>'
    )

    let eventFired = false
    liveNode.addEventListener('spa:restore', () => (eventFired = true))

    cache.restore(pageB)

    assertTrue(pageB.firstElementChild === liveNode)
    assertEqual(pageB.firstElementChild.innerHTML, 'Live State preserved')
    assertTrue(eventFired)
})

it('ComponentCache: should retain native DOM state (like input.value) across simulated navigations', () => {
    const cache = new ComponentCache()

    const pageA = createMockPage(
        '<input type="text" data-cache-id="nav-input" />'
    )
    const inputNode = pageA.firstElementChild

    inputNode.value = 'Hello World from Page A'

    cache.save(pageA)

    const pageB = createMockPage(
        '<input type="text" data-cache-id="nav-input" />'
    )

    cache.restore(pageB)

    assertTrue(pageB.firstElementChild === inputNode)
    assertEqual(pageB.firstElementChild.value, 'Hello World from Page A')
})
