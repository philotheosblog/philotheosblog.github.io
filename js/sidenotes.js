class HTMLBaseElement extends HTMLElement {
    constructor(...args) {
      const self = super(...args)
      self.parsed = false // guard to make it easy to do certain stuff only once
      self.parentNodes = []
      return self
    }
  
    setup() {
      // collect the parentNodes
      let el = this;
      while (el.parentNode) {
        el = el.parentNode
        this.parentNodes.push(el)
      }
      // check if the parser has already passed the end tag of the component
      // in which case this element, or one of its parents, should have a nextSibling
      // if not (no whitespace at all between tags and no nextElementSiblings either)
      // resort to DOMContentLoaded or load having triggered
      if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
        this.childrenAvailableCallback();
      } else {
        this.mutationObserver = new MutationObserver(() => {
          if ([this, ...this.parentNodes].some(el=> el.nextSibling) || document.readyState !== 'loading') {
            this.childrenAvailableCallback()
            this.mutationObserver.disconnect()
          }
        });
  
        this.mutationObserver.observe(this, {childList: true});
      }
    }
  }
  
  window.customElements.define('side-note', class extends HTMLBaseElement {
      connectedCallback() {
          // when connectedCallback has fired, call super.setup()
          // which will determine when it is safe to call childrenAvailableCallback()
          super.setup()
      }
  
      childrenAvailableCallback() {    
          // when setup is done, make this information accessible to the element
          this.parsed = true
  
          let it = this.innerHTML;
  
          let aside = document.createElement("aside");
          aside.style = "float:right; width: 12em; margin-right: -13em; font-size: 70%;";
          aside.innerHTML = "<sup>&dagger;</sup>" + it;
  
          let shadowRoot = this.attachShadow({mode: 'open'});
          shadowRoot.appendChild(aside);
  
          this.innerText = "";
  
          let span = document.createElement("span");
          span.innerHTML = "<sup>&dagger;</sup>";
          span.style.fontSize = "80%";
          shadowRoot.appendChild(span);
  
          console.log(this);
      }
  });