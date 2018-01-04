#!/usr/bin/env node

module.exports = {
  domain: '.ppsg7ml5.api.sanity.io',
  path: '/v1/users/me',
  name: 'sanitySession',
  value: process.env.SANITY_USER_TOKEN,
  expirationDate: 2143588996000,
  httpOnly: true,
  hostOnly: true,
  secure: false,
  session: true,
  sameSite: 'no_restriction'
}
