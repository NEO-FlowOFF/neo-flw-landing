export const config = {
  matcher: '/',
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

  const uaLower = userAgent.toLowerCase();
  const isCrawlerUrl = uaLower.includes('facebookexternalhit') || uaLower.includes('googlebot');
  
  // AWS/GCP Check (Aproximado para demonstração sem lista BGP exaustiva)
  const isDCIP = ip.startsWith('3.') || ip.startsWith('54.') || ip.startsWith('52.') || ip.startsWith('34.');

  // Renderização condicional para obediência estrita (Stealth/Safe Page)
  if (isCrawlerUrl || isDCIP) {
    const safeUrl = new URL('/safe-page.html', request.url);
    // ProxyPass silencioso: não altera a URL observada (no 301/302)
    return fetch(safeUrl);
  }
}
