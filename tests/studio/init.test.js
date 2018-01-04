/* eslint-disable no-console */
const cookie = require('../../conf/cookie.js')

module.exports = {
  Front: browser => {
    browser
      .setCookie(cookie)
      .url('http://localhost:5000')
      .waitForElementVisible('body', 1000)
      .isLogAvailable('browser', isAvailable => {
        console.log('test success')
      })
      .pause(1000)
      .assert.title('Backstop studio - Sanity')
      .end()
  }
}
