export class ComponentCache {
    constructor() {
        this.cache = new Map()
    }

    save(container) {
        if (!container) return

        container.querySelectorAll('[data-cache-id]').forEach((node) => {
            const id = node.getAttribute('data-cache-id')
            const state = {}

            node.dispatchEvent(
                new CustomEvent('spa:save', {
                    detail: { state },
                })
            )

            this.cache.set(id, { node, state })
        })
    }

    restore(newContainer) {
        if (!newContainer) return

        newContainer
            .querySelectorAll('[data-cache-id]')
            .forEach((placeholder) => {
                const id = placeholder.getAttribute('data-cache-id')
                const cached = this.cache.get(id)

                if (cached && cached.node) {
                    placeholder.replaceWith(cached.node)

                    cached.node.dispatchEvent(
                        new CustomEvent('spa:restore', {
                            detail: { state: cached.state },
                        })
                    )
                }
            })
    }
}
