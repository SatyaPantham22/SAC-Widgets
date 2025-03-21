var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};
(function () {
  const template = document.createElement('template')
  template.innerHTML = `
        <style>
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        Hello Custom Widget
        </div>
      `
  class Main extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')
    }
  }

  customElements.define('com-sap-sac-exercise-shared-main', Main)
})()
