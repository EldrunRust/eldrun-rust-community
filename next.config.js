/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const csp = (
  isProd
    ? "default-src 'self'; base-uri 'self'; form-action 'self' https:; frame-ancestors 'none'; object-src 'none'; img-src 'self' https: data: blob:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; connect-src 'self' https: wss:; frame-src 'self' https:; upgrade-insecure-requests"
    : "default-src 'self'; base-uri 'self'; form-action 'self' https:; frame-ancestors 'none'; object-src 'none'; img-src 'self' https: data: blob:; font-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss: ws:; frame-src 'self' https:"
).replace(/\s{2,}/g, ' ').trim()

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=()'
  },
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
]

const defaultImageHostnames = [
  'eldrun.lol',
  '**.eldrun.lol',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'images.unsplash.com',
  'i.ytimg.com',
  'static-cdn.jtvnw.net',
  'steamuserimages-a.akamaihd.net',
  'steamcdn-a.akamaihd.net',
  'avatars.steamstatic.com',
]

const imageHostnames = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const nextConfig = {
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: (imageHostnames.length ? imageHostnames : defaultImageHostnames).map(
      hostname => ({
        protocol: 'https',
        hostname,
      })
    ),
  },
  transpilePackages: ['three'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
