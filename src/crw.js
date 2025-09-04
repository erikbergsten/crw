import { Liquid }  from 'liquidjs'

const reloader = `<script>
const connection = new WebSocket("/")
connection.onclose = () => {
  window.setTimeout(() => {
    window.location = window.location
  }, 500)
}
</script>`;

export class CRW  {
  constructor(files, layout='layout') {
    this.layoutName = layout
    this.engine = new Liquid()
    this.templates = Object.fromEntries(Object.entries(files).map(([k, v]) =>
      [k, this.engine.parse(v)]
    ))
  }
  async render(name, args) {
    return this.engine.render(this.templates[name], args)
  }
  async response(name, args, headers) {
    return new Response(await this.render(name, args), {
      headers: {
        'Content-Type': 'text/html',
        ...headers
      }
    })
  }

  async layout(name, args, headers) {
    const content = await this.render(name, args)
    return this.response(this.layoutName, { content }, headers)
  }

  async hxLayout(req, name, args, headers) {
    if(req.headers.get('HX-Request') === 'true') {
      return this.response(name, args, headers)
    } else {
      return this.layout(name, args, headers)
    }
  }
}
