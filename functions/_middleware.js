// Send www.pwr.one to the apex so search engines see one canonical host.
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'www.pwr.one') {
    url.hostname = 'pwr.one';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
