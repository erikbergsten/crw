import { Liquid }  from 'liquidjs'

const reloader = `<script>
const connection = new WebSocket("/")
connection.onclose = () => {
  window.setTimeout(() => {
    window.location = window.location
  }, 1000)
}

async function lock() {
  // The wake lock sentinel.
  let wakeLock = null;

  // Function that attempts to request a screen wake lock.
  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request();
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released:', wakeLock.released);
      });
      console.log('Screen Wake Lock released:', wakeLock.released);
    } catch (err) {
      document.body.innerText = err
    }
  };

  // Request a screen wake lock…
  await requestWakeLock();
  // …and release it again after 5s.
  //window.setTimeout(() => {
  //  wakeLock.release();
  //  wakeLock = null;
  //}, 5000);
}
lock()
</script>`;

const reload = {}
if(process.env.DEV_RELOAD==="true") {
  console.log("DEV_RELOAD=true, enabling reloader")
  reload['devReloader'] = reloader
} else {
  console.log("DEV_RELOAD!=true, disabling reloader")
}

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
    return this.response(this.layoutName, { content, ...reload, ...args }, headers)
  }

  async hxLayout(req, name, args, headers) {
    if(req.headers.get('HX-Request') === 'true') {
      return this.response(name, args, headers)
    } else {
      return this.layout(name, args, headers)
    }
  }
}
