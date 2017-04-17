/**
 * Copyright 2017 "Chiguireitor"
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var UI_CODE = {
  "NO_PASS": {
    "en": "No password provided",
    "es": "Contraseña vacía"
  },

  "NO_SALT": {
    "en": "Not enough entropy to save seed",
    "es": "No hay suficiente entropía para guardar la semilla"
  },

  "NO_ENCRYPT_SEED": {
    "en": "Seed couldn't be encrypted",
    "es": "La semilla no se pudo encriptar"
  },

  "BAD_PASSWORD": {
    "en": "Incorrect password",
    "es": "Contraseña invalida"
  },

  "NO_WALLET": {
    "en": "No wallet could be decoded",
    "es": "No se pudo abrir una billetera"
  }
}
var uiCurrentLang = "en"

function uiAskSeedPassword(seed, callback) {
  var pwd = prompt("Your seed\n"+seed+"\nInput a password for it (this is a test ui prompt, password will be echoed):")
  callback(null, seed, pwd)
}

function uiAskDecryptPassword(callback) {
  var pwd = prompt("Input your seed password (this is a test ui prompt, password will be echoed):")
  callback(null, pwd)
}

function uiError(code, detail) {
  alert(UI_CODE[code][uiCurrentLang], detail)
}

function toggleFinance() {
  var addr = $('#addressBlock')
  var exp = $('#expander i')
  exp.toggleClass('glyphicon-chevron-left')
  exp.toggleClass('glyphicon-chevron-right')

  if (addr.is(':visible')) {
    addr.fadeOut()
  } else {
    addr.fadeIn()
  }
}

function toggleDetail() {
  var bals = $('#balances')
  var exp = $('#detailExpand i')
  exp.toggleClass('glyphicon-chevron-up')
  exp.toggleClass('glyphicon-chevron-down')

  if (bals.is(':visible')) {
    bals.fadeOut()
  } else {
    bals.fadeIn()
  }
}

function modalDialog(options) {
  var type = options.large?'modal-lg':'modal-sm'
  var dlgComp = $("#dialog1")
  var dlg = dlgComp.find('.modal-dialog')
  var ttl = dlgComp.find('.modal-title')
  dlg.removeClass('modal-sm')
  dlg.removeClass('modal-lg')
  dlg.addClass(type)

  // TODO Compile and run with handlebars
  dlgComp.find('.modal-body').html(options.content)
  ttl.text(options.title)

  if (options.buttons) {
    dlgComp.find('.modal-footer').show()
  } else {
    dlgComp.find('.modal-footer').hide()
  }

  dlgComp.modal('show')
}
