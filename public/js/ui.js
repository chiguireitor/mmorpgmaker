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
