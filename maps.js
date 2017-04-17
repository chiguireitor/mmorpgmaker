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
const PouchDB = require('pouchdb')
const cluster = require('cluster')

const db = new PouchDB(config.pouchdb.name || 'mmorpgmaker')

function loadMap(n) {
  return db.get('map_' + n)
}

function saveMap(n, data) {
  data._id = 'map_' + n
  return db.put(data)
}

function wrapPromiseWorker(action, returnPath, pro) {
  pro.then((data) => {
    cluster.worker.send({
      target: returnPath,
      action,
      data
    })
  }).catch((err) => {
    cluster.worker.send({
      target: returnPath,
      action,
      error: err
    })
  })
}

function handleWorkerMessage(msg) {
  if (msg.action === 'loadMap') {
    wrapPromiseWorker('loadMap', msg.returnPath, loadMap(msg.data))
  } else if (msg.action === 'saveMap') {
    console.log(msg.data)
    wrapPromiseWorker('saveMap', msg.returnPath, saveMap(msg.data.n, msg.data.data))
  }
}

function startWorker() {
  cluster.worker.on('message', function(msg) {
    handleWorkerMessage(msg)
  })
}

if (!module.parent) {
  startWorker()
} else {
  let microHandlers = {}

  cluster.worker.on('message', function(msg) {
    console.log('Client maps got message', msg, microHandlers)
    if (msg.action in microHandlers) {
      console.log('Calling microHandlers', microHandlers[msg.action])
      for (let i=0; i < microHandlers[msg.action].length; i++) {
        console.log('Calling microHandler', i)
        microHandlers[msg.action][i](msg.error, msg.data)
      }

      delete microHandlers[msg.action]
    }
  })

  function addMicroObserver(n, cb) {
    if (!(n in microHandlers)) {
      microHandlers[n] = []
    }

    microHandlers[n].push(cb)
  }

  module.exports = {
    loadMap: (n) => {
      return new Promise((resolve, reject) => {
        cluster.worker.send({
          returnPath: cluster.worker.id,
          action: 'loadMap',
          workerByName: 'maps',
          data: n
        })
        addMicroObserver('loadMap', (err, data) => {
          console.log('loadMap microhandler called with', err, data)
          if (err) {
            console.log('client maps rejecting')
            reject(err)
          } else {
            console.log('client maps resolving')
            resolve(data)
          }
        })
      })
    },
    saveMap: (n, mdata) => {
      return new Promise((resolve, reject) => {
        cluster.worker.send({
          returnPath: cluster.worker.id,
          action: 'saveMap',
          workerByName: 'maps',
          data: {n, data: mdata}
        })
        addMicroObserver('saveMap', (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      })
    }
  }
}
