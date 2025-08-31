export async function route(routes, req, ...args) {
  for(const [route, handler] of routes) {
    const regex = new RegExp(`^${route}$`)
    const path = new URL(req.url).pathname
    const match = regex.exec(path)
    if(match) {
      if(typeof handler == 'object') {
        for(const [methods, handlerFun] of Object.entries(handler)) {
          const regex = new RegExp(`^(${methods}$)`)
          const matchMethod = regex.exec(req.method)
          if(matchMethod) {
            const res = await handlerFun(req, match.groups || {}, ...args)
            if(res instanceof Response) return res
          }
        }
      } else {
        const res = await handler(req, match.groups || {}, ...args)
        if(res) return res
      }
    }
  }
  return new Response("not found", { status: 404 })
}
