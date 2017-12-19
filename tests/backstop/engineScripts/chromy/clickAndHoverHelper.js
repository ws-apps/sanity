module.exports = function (chromy, scenario) {
  const {hoverSelector, clickSelector, postInteractionWait, clickSelector2} = scenario

  if (hoverSelector) {
    chromy
      .wait(hoverSelector)
      .rect(hoverSelector)
      .result(rect => {
        chromy.mouseMoved(rect.left, rect.top)
      })
  }

  if (clickSelector) {
    chromy
      .wait(clickSelector)
      .click(clickSelector)
  }

  if (clickSelector2) {
    chromy
      .wait(500)
      .wait(clickSelector2)
      .click(clickSelector2)
      .wait(1000)
  }

  if (postInteractionWait) {
    chromy.wait(postInteractionWait)
  }
}
