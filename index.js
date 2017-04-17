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
const cluster = require('cluster')
const config = JSON.parse(fs.readFileSync(argv.config || './config.json'))
const numCPUs = 1 //require('os').cpus().length

var workers = {}
var workersByName = {}

function startWorker(name, args) {
  cluster.setupMaster({
    exec: name + '.js',
    args: args || process.argv,
    false: true
  })

  let worker = cluster.fork(process.env)
  if (!(name in workersByName)) {
    workersByName[name] = []
  }
  workers[worker.id] = {name, args}
  workersByName[name].push(worker.id)
}

cluster.on('message', (worker, msg, handle) => {
  console.log('Cluster message', msg)
  if ('target' in msg) {
    cluster.workers[msg.target].send(msg)
  } else if ('workerByName' in msg) {
    if (msg.workerByName in workersByName) {
      for (let i=0; i < workersByName[msg.workerByName].length; i++) {
        let wid = workersByName[msg.workerByName][i]
        console.log('Wid', wid)
        console.log('Worker', workers[wid])
        cluster.workers[wid].send(msg)
      }
    }
  }
})

for (let i=0; i < numCPUs; i++) {
  startWorker('webworker')
}

startWorker('maps')
