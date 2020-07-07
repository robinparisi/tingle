
let isBusy = false

export default class Tingle {
  constructor (options) {
    const defaults = {
      onClose: null,
      onOpen: null,
      beforeOpen: null,
      beforeClose: null,
      stickyFooter: false,
      footer: false,
      cssClass: [],
      closeLabel: 'Close',
      closeMethods: ['overlay', 'button', 'escape']
    }

    // extends config
    this.opts = { ...defaults, ...options }

    // init modal
    this.init()
  }

  init () {
    if (this.modal) {
      return
    }

    _build.call(this)
    _bindEvents.call(this)

    // insert modal in dom
    document.body.appendChild(this.modal, document.body.firstChild)

    if (this.opts.footer) {
      this.addFooter()
    }

    return this
  }

  _busy (state) {
    isBusy = state
  }

  _isBusy () {
    return isBusy
  }

  destroy () {
    if (this.modal === null) {
      return
    }

    // restore scrolling
    if (this.isOpen()) {
      this.close(true)
    }

    // unbind all events
    _unbindEvents.call(this)

    // remove modal from dom
    this.modal.parentNode.removeChild(this.modal)

    this.modal = null
  }

  isOpen () {
    return !!this.modal.classList.contains('tingle-modal--visible')
  }

  open () {
    if (this._isBusy()) return
    this._busy(true)

    const self = this

    // before open callback
    if (typeof self.opts.beforeOpen === 'function') {
      self.opts.beforeOpen()
    }

    if (this.modal.style.removeProperty) {
      this.modal.style.removeProperty('display')
    } else {
      this.modal.style.removeAttribute('display')
    }

    // prevent double scroll
    this._scrollPosition = window.pageYOffset
    document.body.classList.add('tingle-enabled')
    document.body.style.top = `${-this._scrollPosition}px`

    // sticky footer
    this.setStickyFooter(this.opts.stickyFooter)

    // show modal
    this.modal.classList.add('tingle-modal--visible')

    // onOpen callback
    if (typeof self.opts.onOpen === 'function') {
      self.opts.onOpen.call(self)
    }

    self._busy(false)

    // check if modal is bigger than screen height
    this.checkOverflow()

    return this
  }

  close (force) {
    if (this._isBusy()) return
    this._busy(true)
    force = force || false

    //  before close
    if (typeof this.opts.beforeClose === 'function') {
      const close = this.opts.beforeClose.call(this)
      if (!close) {
        this._busy(false)
        return
      }
    }

    document.body.classList.remove('tingle-enabled')
    document.body.style.top = null
    window.scrollTo({
      top: this._scrollPosition,
      behavior: 'instant'
    })

    this.modal.classList.remove('tingle-modal--visible')

    // using similar setup as onOpen
    const self = this

    self.modal.style.display = 'none'

    // onClose callback
    if (typeof self.opts.onClose === 'function') {
      self.opts.onClose.call(this)
    }

    // release modal
    self._busy(false)
  }

  setContent (content) {
    // check type of content : String or Node
    if (typeof content === 'string') {
      this.modalBoxContent.innerHTML = content
    } else {
      this.modalBoxContent.innerHTML = ''
      this.modalBoxContent.appendChild(content)
    }

    if (this.isOpen()) {
      // check if modal is bigger than screen height
      this.checkOverflow()
    }

    return this
  }

  getContent () {
    return this.modalBoxContent
  }

  addFooter () {
    // add footer to modal
    _buildFooter.call(this)

    return this
  }

  setFooterContent (content) {
    // set footer content
    this.modalBoxFooter.innerHTML = content

    return this
  }

  getFooterContent () {
    return this.modalBoxFooter
  }

  setStickyFooter (isSticky) {
    // if the modal is smaller than the viewport height, we don't need sticky
    if (!this.isOverflow()) {
      isSticky = false
    }

    if (isSticky) {
      if (this.modalBox.contains(this.modalBoxFooter)) {
        this.modalBox.removeChild(this.modalBoxFooter)
        this.modal.appendChild(this.modalBoxFooter)
        this.modalBoxFooter.classList.add('tingle-modal-box__footer--sticky')
        _recalculateFooterPosition.call(this)
        this.modalBoxContent.style['padding-bottom'] = `${this.modalBoxFooter.clientHeight + 20}px`
      }
    } else if (this.modalBoxFooter) {
      if (!this.modalBox.contains(this.modalBoxFooter)) {
        this.modal.removeChild(this.modalBoxFooter)
        this.modalBox.appendChild(this.modalBoxFooter)
        this.modalBoxFooter.style.width = 'auto'
        this.modalBoxFooter.style.left = ''
        this.modalBoxContent.style['padding-bottom'] = ''
        this.modalBoxFooter.classList.remove('tingle-modal-box__footer--sticky')
      }
    }

    return this
  }

  addFooterBtn (label, cssClass, callback) {
    const btn = document.createElement('button')

    // set label
    btn.innerHTML = label

    // bind callback
    btn.addEventListener('click', callback)

    if (typeof cssClass === 'string' && cssClass.length) {
      // add classes to btn
      cssClass.split(' ').forEach(item => {
        btn.classList.add(item)
      })
    }

    this.modalBoxFooter.appendChild(btn)

    return btn
  }

  isOverflow () {
    const viewportHeight = window.innerHeight
    const modalHeight = this.modalBox.clientHeight

    return modalHeight >= viewportHeight
  }

  checkOverflow () {
    // only if the modal is currently shown
    if (this.modal.classList.contains('tingle-modal--visible')) {
      if (this.isOverflow()) {
        this.modal.classList.add('tingle-modal--overflow')
      } else {
        this.modal.classList.remove('tingle-modal--overflow')
      }

      // tODO: remove offset
      // _offset.call(this);
      if (!this.isOverflow() && this.opts.stickyFooter) {
        this.setStickyFooter(false)
      } else if (this.isOverflow() && this.opts.stickyFooter) {
        _recalculateFooterPosition.call(this)
        this.setStickyFooter(true)
      }
    }
  }
}

/* ----------------------------------------------------------- */
/* == private methods */
/* ----------------------------------------------------------- */

function closeIcon () {
  return '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M.3 9.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4z" fill="#000" fill-rule="nonzero"/></svg>'
}

function _recalculateFooterPosition () {
  if (!this.modalBoxFooter) {
    return
  }
  this.modalBoxFooter.style.width = `${this.modalBox.clientWidth}px`
  this.modalBoxFooter.style.left = `${this.modalBox.offsetLeft}px`
}

function _build () {
  // wrapper
  this.modal = document.createElement('div')
  this.modal.classList.add('tingle-modal')

  // remove cusor if no overlay close method
  if (this.opts.closeMethods.length === 0 || !this.opts.closeMethods.includes('overlay')) {
    this.modal.classList.add('tingle-modal--noOverlayClose')
  }

  this.modal.style.display = 'none'

  // custom class
  this.opts.cssClass.forEach(function (item) {
    if (typeof item === 'string') {
      this.modal.classList.add(item)
    }
  }, this)

  // close btn
  if (this.opts.closeMethods.includes('button')) {
    this.modalCloseBtn = document.createElement('button')
    this.modalCloseBtn.type = 'button'
    this.modalCloseBtn.classList.add('tingle-modal__close')

    this.modalCloseBtnIcon = document.createElement('span')
    this.modalCloseBtnIcon.classList.add('tingle-modal__closeIcon')
    this.modalCloseBtnIcon.innerHTML = closeIcon()

    this.modalCloseBtnLabel = document.createElement('span')
    this.modalCloseBtnLabel.classList.add('tingle-modal__closeLabel')
    this.modalCloseBtnLabel.innerHTML = this.opts.closeLabel

    this.modalCloseBtn.appendChild(this.modalCloseBtnIcon)
    this.modalCloseBtn.appendChild(this.modalCloseBtnLabel)
  }

  // modal
  this.modalBox = document.createElement('div')
  this.modalBox.classList.add('tingle-modal-box')

  // modal box content
  this.modalBoxContent = document.createElement('div')
  this.modalBoxContent.classList.add('tingle-modal-box__content')

  this.modalBox.appendChild(this.modalBoxContent)

  if (this.opts.closeMethods.includes('button')) {
    this.modal.appendChild(this.modalCloseBtn)
  }

  this.modal.appendChild(this.modalBox)
}

function _buildFooter () {
  this.modalBoxFooter = document.createElement('div')
  this.modalBoxFooter.classList.add('tingle-modal-box__footer')
  this.modalBox.appendChild(this.modalBoxFooter)
}

function _bindEvents () {
  this._events = {
    clickCloseBtn: this.close.bind(this),
    clickOverlay: _handleClickOutside.bind(this),
    resize: this.checkOverflow.bind(this),
    keyboardNav: _handleKeyboardNav.bind(this)
  }

  if (this.opts.closeMethods.includes('button')) {
    this.modalCloseBtn.addEventListener('click', this._events.clickCloseBtn)
  }

  this.modal.addEventListener('mousedown', this._events.clickOverlay)
  window.addEventListener('resize', this._events.resize)
  document.addEventListener('keydown', this._events.keyboardNav)
}

function _handleKeyboardNav ({ which }) {
  // escape key
  if (this.opts.closeMethods.includes('escape') && which === 27 && this.isOpen()) {
    this.close()
  }
}

function _handleClickOutside ({ clientX, target }) {
  // on macOS, click on scrollbar (hidden mode) will trigger close event so we need to bypass this behavior by detecting scrollbar mode
  const scrollbarWidth = this.modal.offsetWidth - this.modal.clientWidth
  const clickedOnScrollbar = clientX >= this.modal.offsetWidth - 15 // 15px is macOS scrollbar default width
  const isScrollable = this.modal.scrollHeight !== this.modal.offsetHeight
  if (navigator.platform === 'MacIntel' && scrollbarWidth === 0 && clickedOnScrollbar && isScrollable) {
    return
  }

  // if click is outside the modal
  if (this.opts.closeMethods.includes('overlay') && !_findAncestor(target, 'tingle-modal') &&
        clientX < this.modal.clientWidth) {
    this.close()
  }
}

function _findAncestor (el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el
}

function _unbindEvents () {
  if (this.opts.closeMethods.includes('button')) {
    this.modalCloseBtn.removeEventListener('click', this._events.clickCloseBtn)
  }
  this.modal.removeEventListener('mousedown', this._events.clickOverlay)
  window.removeEventListener('resize', this._events.resize)
  document.removeEventListener('keydown', this._events.keyboardNav)
}
