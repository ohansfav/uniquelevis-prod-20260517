const url = 'https://uniquelevis-7x2wqjith-kiaras-projects-451d3b80.vercel.app/api/healthz';

(async () => {
  try {
    const r = await fetch(url);
    const text = await r.text();
    console.log('STATUS:' + r.status);
    console.log('TYPE:' + r.headers.get('content-type'));
    console.log(text.slice(0, 1000));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
