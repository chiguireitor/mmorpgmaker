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
  var addr = eid('addressBlock')
  if (addr.style.display === 'none') {
    addr.style.display = 'block'
    eid('expander').innerText = '>'
  } else {
    addr.style.display = 'none'
    eid('expander').innerText = '<'
  }
}

function toggleDetail() {
  var bals = eid('balances')
  if (bals.style.display === 'none') {
    bals.style.display = 'block'
    eid('detailExpand').innerText = '/\\'
  } else {
    bals.style.display = 'none'
    eid('detailExpand').innerText = '\\/'
  }
}
