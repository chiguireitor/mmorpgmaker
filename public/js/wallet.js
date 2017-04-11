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
 
var isTestnet = true
var currentWallet
var lastAddress
var net

function startWallet(callback) {
  if (!net) {
    if (isTestnet) {
      net = btc.bitcoin.networks.testnet
    } else {
      net = btc.bitcoin.networks.bitcoin
    }
  }

  lastAddress = localStorage.getItem('lastAddress')
  if (!lastAddress) {
    openWallet(function() {
      lastAddress = getAddress()
      localStorage.setItem('lastAddress', lastAddress)

      callback(lastAddress)
    })
  } else {
    callback(lastAddress)
  }
}

function openWallet(callback) {
  let seed = localStorage.getItem('seed')

  function initWallet(data) {
    currentWallet = HDWalletFromSeed(data)

    if (!currentWallet) {
      uiError("NO_WALLET")
    } else if (callback) {
      callback(currentWallet)
      delete currentWallet // Don't leave wallet open
    }
  }

  if (seed === null) {
    // No wallet exists
    createWallet(initWallet)
  } else {
    uiAskDecryptPassword(function(err, pass) {
      btc.crypt.decrypt(seed, pass, function(err, data) {
        if (err) {
          uiError("BAD_PASSWORD", err)
          return
        }

        initWallet(data)
      })
    })
  }
}

function createWallet(callback) {
  var crypto = window.crypto || window.msCrypto

  var array = new Uint32Array(4)
  crypto.getRandomValues(array)

  function fill32bit(c) {
    while (c.length < 8) {
      c = '0' + c
    }
    return c
  }
  var val = ""
  array.forEach(function(v) {
    val = val + fill32bit(v.toString(16))
  })
  var words = Mnemonic.fromHex(val).toWords()

  uiAskSeedPassword(words.join(' '), function(err, seed, pass) {
    if (err) {
      uiError("NO_PASS", err)
      return
    }

    btc.crypt.encrypt(seed, pass,  function(err, cipherText) {
        if (err) {
          uiError("NO_ENCRYPT_SEED", err)
          return
        }

        localStorage.setItem('seed', cipherText)
        callback(seed)
      })
  })
}

function parseHexString(str) {
    var result = []
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16))

        str = str.substring(2, str.length)
    }

    return result
}

function HDWalletFromSeed(seedStr) {
  var words = seedStr.trim().split(' ')

  try {
    if (words.length === 12) {
      var mne = Mnemonic.fromWords(words)

      if (mne) {
        var intermediate = new Uint8Array(parseHexString(mne.toHex()))
        intermediate._isBuffer = true
        var hd = btc.bitcoin.HDNode.fromSeedBuffer(intermediate, net)

        return hd
      } else {
        console.log('No mnemonic could be decoded from seed')
        return false
      }
    } else {
      console.log('Bad seed length')
      return false
    }
  } catch(e) {
    console.log(e)
    return false
  }
}

function getKeypair(n) {
  if (typeof(n) === "undefined") {
    n = 0
  }

  if (currentWallet) {
    return currentWallet.derivePath("m/0'/0/" + n, net).keyPair
  }
}

function getAddress(n) {
  if (typeof(n) === "undefined") {
    n = 0
  }

  return getKeypair(n).getAddress()
}

function signMessage(msg, n) {
  if (typeof(n) === "undefined") {
    n = 0
  }

  var kp = getKeypair(n)
  var signature = btc.message.sign(msg, net.messagePrefix, kp.d.toBuffer(32), kp.compressed)

  return signature.toString('base64')
}

/*function signWithSeed(n) {
  var addr = getAddress(n)

  $.ajax(authUrl, {
    data: {
      addr: addr
    },
    dataType: 'json'
  }).done(function(response) {
    var signature = signMessage(response.challenge, n)

    $.ajax(responseUrl, {
      data: {
        addr: addr,
        signature: signature
      },
      dataType: 'json'
    }).done(function(response) {
      if (response.token) {
        localStorage.setItem('AUTH_TOKEN', response.token)

        signOnReady()
      }
    })
  })

  return false
}*/
