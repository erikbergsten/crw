import { Environment, compile }  from 'nunjucks'

const reloader = `<script>
const connection = new WebSocket("/")
connection.onclose = () => {
  window.setTimeout(() => {
    window.location = window.location
  }, 500)
}
</script>`;

export default class CRW  {
  constructor(files) {
    this.env = new Environment()
    this.env.addFilter('render', (name, args) => {
      return this.env.filters.safe(this.render(name, args))
    })
    if(process.env && process.env.RELOADER === 'true') {
      this.env.addGlobal('reloader', this.env.filters.safe(reloader))
    }
    this.templates = Object.fromEntries(Object.entries(files).map(([k, v]) =>
      [k, compile(v, this.env)]
    ))
  }
  render(name, args) {
    return this.templates[name].render(args)
  }
  response(name, args, headers) {
    return new Response(this.render(name, args), {
      headers: {
        'Content-Type': 'text/html',
        ...headers
      }
    })
  }
}
