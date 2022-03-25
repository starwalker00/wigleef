/** @type {import('next').NextConfig} */
const removeImports = require('next-remove-imports')({})

const { DEMO_PROFILE_ID } = require('./lib/config')
const { DEMO_PUBLICATION_ID } = require('./lib/config')

module.exports = removeImports({
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true
  },
  // redirect on empty string, do on page side then
  async redirects() {
    return [
      {
        source: '/profile',
        destination: '/profile/'.concat(DEMO_PROFILE_ID.toHexString()),
        permanent: true,
      },
      {
        source: '/timeline',
        destination: '/timeline/'.concat(DEMO_PROFILE_ID.toHexString()),
        permanent: true,
      },
      {
        source: '/publication',
        destination: '/publication/'.concat(DEMO_PUBLICATION_ID),
        permanent: true,
      },
    ]
  },
})
