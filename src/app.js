import { Engine } from './core/engine.js'

export const engine = new Engine({
    routes: ['*.html', '/routes/*'],
    enabled: true,
})
