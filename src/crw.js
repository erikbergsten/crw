import {Liquid}  from 'liquidjs'

const reloader = `<script>
const connection = new WebSocket("/")
connection.onclose = () => {
  window.setTimeout(() => {
    window.location = window.location
  }, 500)
}
</script>`;

export class CRW  {
  constructor(files) {
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
}
