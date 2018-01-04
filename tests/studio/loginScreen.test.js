/* eslint-disable no-console */

module.exports = {
  'Login screen': browser => {
    browser
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
