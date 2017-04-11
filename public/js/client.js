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

var socket = io()
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'rpggame', { preload: preload, create: create, update: update, render: render })

var map
var mapData
var layer1, layer2, layer3;

var marker
var currentTile = 0
var currentLayer
var currentLayerIndex
var currentMap
var currentTileset

var cursors
var showLayersKey
var layer1Key
var layer2Key
var layer3Key
var toggleTilesKey, toggleEditModeKey
var tileStrip, tileSelector
var editMode = false

function eid(id) {
  return document.getElementById(id)
}

function show(id, s) {
  document.getElementById(id).style.display = s || 'block'
}

function hide(id) {
  document.getElementById(id).style.display = 'none'
}

function preload() {
  startWallet(function(addr) {
    eid('address').innerText = addr
  })
}

function create() {

    game.stage.backgroundColor = '#2d2d2d'
    currentMap = [0,0,0]

    game.input.addMoveCallback(updateMarker, this)

    cursors = game.input.keyboard.createCursorKeys()

    showLayersKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    layer1Key = game.input.keyboard.addKey(Phaser.Keyboard.ONE)
    layer2Key = game.input.keyboard.addKey(Phaser.Keyboard.TWO)
    layer3Key = game.input.keyboard.addKey(Phaser.Keyboard.THREE)
    toggleTilesKey = game.input.keyboard.addKey(Phaser.Keyboard.T)
    toggleEditModeKey = game.input.keyboard.addKey(Phaser.Keyboard.E)

    showLayersKey.onDown.add(changeLayer, this)
    layer1Key.onDown.add(changeLayer, this)
    layer2Key.onDown.add(changeLayer, this)
    layer3Key.onDown.add(changeLayer, this)
    toggleTilesKey.onDown.add(toggleTiles, this)
    toggleEditModeKey.onDown.add(toggleEditMode, this)

    socket.emit('setMap', currentMap)
    socket.on('mapData', function(data) {
      mapData = data.map

      map = game.add.tilemap()

      var loader = new Phaser.Loader(game)

      loader.image(mapData.tileset, mapData.tileset)

      //  Add a Tileset image to the map
      loader.onLoadComplete.addOnce(function() {
        console.log('Tileset loaded')
        currentTileset = map.addTilesetImage(mapData.tileset, null, 16, 16)
        createTileSelector()
        tileSelector.visible = false

        for (var y=0; y < mapData.h; y++) {
          for (var x=0; x < mapData.w; x++) {
            var p = x + y * mapData.w
            if (mapData.layers[0][p] >= 0) {
              map.putTile(mapData.layers[0][p], x, y, 0)
            }

            if (mapData.layers[1][p] >= 0) {
              map.putTile(mapData.layers[1][p], x, y, 1)
            }

            if (mapData.layers[2][p] >= 0) {
              map.putTile(mapData.layers[2][p], x, y, 2)
            }
          }
        }
      })

      loader.start()

      layer1 = map.create('level1', mapData.w, mapData.h, 16, 16);
      /*layer1.scrollFactorX = 0.5;
      layer1.scrollFactorY = 0.5;*/

      layer1.resizeWorld();

      layer2 = map.createBlankLayer('level2', mapData.w, mapData.h, 16, 16);
      /*layer2.scrollFactorX = 0.8;
      layer2.scrollFactorY = 0.8;*/

      layer3 = map.createBlankLayer('level3', mapData.w, mapData.h, 16, 16);



      currentLayer = layer1
      currentLayerIndex = 0
    })

  socket.on('putTile', function(data) {
      map.putTile(data.t, data.px, data.py, data.l)
    })

  socket.on('changeMode', function(data) {
      if (data === 'edit') {
        editMode = true
        marker.visible = true
      } else if (data === 'play') {
        editMode = false
        tileSelector.visible = false
        layer1.visible = true
        layer2.visible = true
        layer3.visible = true
        marker.visible = false
      }
    })

  socket.on('editChallenge', function(data) {
      openWallet(function(wallet) {
        var sign = signMessage(data)
        socket.emit('responseModeChallenge', sign)
      })
    })
}

function changeLayer(key) {

  if (editMode) {
    switch (key.keyCode)
    {
        case Phaser.Keyboard.SPACEBAR:
            layer1.alpha = 1
            layer2.alpha = 1
            layer3.alpha = 1
            break

        case Phaser.Keyboard.ONE:
            currentLayer = layer1
            currentLayerIndex = 0
            layer1.alpha = 1
            layer2.alpha = 0.2
            layer3.alpha = 0.2
            break

        case Phaser.Keyboard.TWO:
            currentLayer = layer2
            currentLayerIndex = 1
            layer1.alpha = 0.2
            layer2.alpha = 1
            layer3.alpha = 0.2
            break

        case Phaser.Keyboard.THREE:
            currentLayer = layer3
            currentLayerIndex = 2
            layer1.alpha = 0.2
            layer2.alpha = 0.2
            layer3.alpha = 1
            break
    }
  }
}

function toggleTiles() {
  if (editMode) {
    if (tileSelector.visible) {
      tileSelector.visible = false
      layer1.visible = true
      layer2.visible = true
      layer3.visible = true
    } else {
      tileSelector.visible = true
      layer1.visible = false
      layer2.visible = false
      layer3.visible = false
    }
  }
}

function toggleEditMode() {
  if (editMode) {
    socket.emit('changeMode', 'play')
  } else {
    socket.emit('changeMode', 'edit')
  }
}

var startSelect, endSelect, selecting = false, selected, drawBox = false
function updateMarker() {
  if (editMode) {
    if (currentLayer) {
      marker.x = currentLayer.getTileX(game.input.activePointer.worldX) * 16;
      marker.y = currentLayer.getTileY(game.input.activePointer.worldY) * 16;
      if (tileSelector.visible) {
        var tx = Math.floor(game.math.snapToFloor(game.input.activePointer.worldX, currentTileset.tileWidth) / currentTileset.tileWidth)
        var ty = Math.floor(game.math.snapToFloor(game.input.activePointer.worldY, currentTileset.tileHeight) / currentTileset.tileHeight)
        var wt = currentTileset.columns
        var ht = currentTileset.rows

        function updateSelected() {
          selected = [endSelect[0] - startSelect[0], endSelect[1] - startSelect[1]]
          console.log('Picked region', selected)
          if ((selected[0] > 0) || (selected[1] > 0)) {
            drawBox = true
            currentTile = startSelect[0] + startSelect[1] * wt
          } else {
            drawBox = false
          }
        }

        if (game.input.mousePointer.isDown) {
          currentTile = tx + ty * wt
          if (selecting) {
            endSelect = [tx, ty]
            updateSelected()
          } else {
            startSelect = [tx, ty]
            selecting = true
            drawBox = false
          }
        } else {
          if (selecting) {
            endSelect = [tx, ty]
            selecting = false

            updateSelected()
          }
        }
      } else {
        var px = currentLayer.getTileX(marker.x)
        var py = currentLayer.getTileY(marker.y)

        if (game.input.mousePointer.isDown)
        {
          if (drawBox) {
            for (var y=0; y <= selected[1]; y++) {
              for (var x=0; x <= selected[0]; x++) {
                var t = currentTile + x + y * currentTileset.columns
                map.putTile(t, px + x, py + y, currentLayer);
                socket.emit('putTile', {
                  t: t,
                  px: px + x,
                  py: py + y,
                  l: currentLayerIndex
                });
              }
            }
          } else {
            map.putTile(currentTile, px, py, currentLayer);
            socket.emit('putTile', {
              t: currentTile,
              px: px,
              py: py,
              l: currentLayerIndex
            })
          }
        } else {
          socket.emit('cursor', {
            px: px,
            py: py,
            l: currentLayerIndex
          })
        }
      }
    }
  }

}

function update() {

    if (cursors.left.isDown) {
        game.camera.x -= 4
    } else if (cursors.right.isDown) {
        game.camera.x += 4
    }

    if (cursors.up.isDown) {
        game.camera.y -= 4
    } else if (cursors.down.isDown) {
        game.camera.y += 4
    }
}

function render() {

    /*game.debug.text('Current Layer: ' + currentLayer.name, 16, 550);
    game.debug.text('1-3 Switch Layers. SPACE = Show All. Cursors = Move Camera', 16, 570);*/

}

function createTileSelector() {

    //  Our tile selection window
    if (!tileSelector) {
      tileSelector = game.add.group()

      var tileSelectorBackground = game.make.graphics()
      tileSelectorBackground.beginFill(0x000000, 0.5)
      tileSelectorBackground.drawRect(0, 0, 800, 600)
      tileSelectorBackground.endFill()

      tileSelector.add(tileSelectorBackground)
    }

    if (tileStrip) {
      tileStrip.destroy()
    }

    tileStrip = tileSelector.create(1, 1, mapData.tileset)
    tileStrip.inputEnabled = true
    tileSelector.fixedToCamera = true
    tileSelector.visible = false

    //  Our painting marker
    if (!marker) {
      marker = game.add.graphics()
      marker.lineStyle(2, 0xFFFF00, 1)
      marker.drawRect(0, 0, 16, 16)
      marker.visible = false
    }

}
