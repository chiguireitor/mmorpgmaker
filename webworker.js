'use strict'
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
const fs = require('fs')
const argv = require('yargs').argv
const config = JSON.parse(fs.readFileSync(argv.config || './config.json'))
const crypto = require('crypto')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const message = require('bitcoinjs-lib').message

const mapsDb = require('./maps.js')

app.use(express.static('public'))

const HTTP_PORT = config.http.port || 3000

http.listen(HTTP_PORT, function(){
  console.log('HTTP Worker listening on *:' + HTTP_PORT)
})

var worldSize = [64, 64]
var maps = {}

function loadMap(n, cb) {
  mapsDb.loadMap(n).then((data) => {
    maps[n] = data

    cb()
  }).catch((data) => {
    let w = 64, h = 64
    maps[n] = {
      w,
      h,
      tileset: 'gfx/Overworld.png',
      layers: [Array(w*h).fill(-1), Array(w*h).fill(-1), Array(w*h).fill(-1)]
    }

    cb()
  })
}

io.on('connection', function(socket){
  console.log('A user connected')
  socket.gameData = {
    mode: 'play'
  }

  socket.on('disconnect', function () {
    console.log('A user disconnected')
  })

  socket.on('changeMode', (data) => {
    console.log('Got change mode request', data)
    if (data === 'play') {
      socket.emit('changeMode', 'play')
      socket.gameData.mode = 'play'
    } else {
      crypto.randomBytes(16, function(err, buffer) {
        if (err) {
          console.log(err)
        } else {
          console.log('Sending challenge')
          let token = buffer.toString('hex')
          console.log(token)
          socket.gameData.currentChallenge = token
          socket.gameData.currentChangeMode = data
          socket.emit('editChallenge', token)
        }
      })
    }
  })

  socket.on('responseModeChallenge', (signData) => {
    if (config.debug) {
      socket.emit('changeMode', socket.gameData.currentChangeMode)
      socket.gameData.mode = socket.gameData.currentChangeMode

      delete socket.gameData.currentChangeMode
      delete socket.gameData.currentChallenge
    } else {
      let authed = false

      function verify(addr, signature, currentChallenge) {
        return message.verify(addr, signature, currentChallenge)
      }

      fs.readFile('./authorized_editors', (err, data) => {
        if (err) {
          socket.emit('changeMode', 'play')
          socket.gameData.mode = 'play'
          delete socket.gameData.currentChallenge
        } else {
          let validAddresses = data.toString('utf8').split('\n').map((l) => l.trim())
          let authed = false

          for (let i=0; i < validAddresses.length; i++) {
            try {
              let auth = verify(validAddresses[i], signData, socket.gameData.currentChallenge)
              socket.gameData.authed = Date.now()
              authed = true
              break
            } catch (e) {
              // Ignore this error, prolly a failure on signature
            }
          }

          delete socket.gameData.currentChallenge

          if (authed) {
            socket.emit('changeMode', socket.gameData.currentChangeMode)
            socket.gameData.mode = socket.gameData.currentChangeMode
          } else {
            socket.emit('changeMode', 'play')
            socket.gameData.mode = 'play'
          }

          delete socket.gameData.currentChangeMode
        }
      })
    }
  })

  socket.on('setMap', (data) => {
    let allowed = false
    if (socket.mode === 'edit') {
      allowed = true
    } else {
      if (Array.isArray(data) && (data.toString() === '0,0,0')) {
        allowed = true
      } else {
        if ((data[0] === socket.gameData.currentRoom[0]) &&
            (data[1] === socket.gameData.currentRoom[1])){
          // Test the player is in a warp tile
          throw "Not Implemented"
        } else {
          let dx = Math.abs(data[0] - socket.gameData.currentRoom[0])
          let dy = Math.abs(data[1] - socket.gameData.currentRoom[1])

          if ((dx + dy) === 1) {
            allowed = true
          }
        }
      }
    }

    if (allowed) {
      if (socket.gameData.currentRoom) {
        socket.leave('room-' + socket.gameData.currentRoom)
      }
      socket.gameData.currentRoom = data
      socket.join('room-' + socket.gameData.currentRoom)

      console.log('Setting map to', data)
      function response() {
        socket.gameData.currentMap = data
        socket.emit('mapData', {map: maps[data]})
      }

      if (!(data in maps)) {
        loadMap(data, response)
      } else {
        response()
      }
    }
  })

  socket.on('putTile', (data) =>{
    if (socket.gameData.mode === 'edit') {
      let map = maps[socket.gameData.currentMap]

      if (map) {
        if ((data.px >= 0) && (data.px < map.w) &&
            (data.py >= 0) && (data.py < map.h)) {
          map.layers[data.l][data.px + data.py * map.w] = data.t

          socket.broadcast.to('room-' + socket.gameData.currentRoom).emit('putTile', data)
        }
      }
    }
  })

  socket.on('cursor', (data) => {
    if (socket.gameData.mode === 'edit') {
      socket.broadcast.to('room-' + socket.gameData.currentRoom).emit('cursor', data)
    }
  })
})
