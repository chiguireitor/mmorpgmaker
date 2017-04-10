MMORPGMaker
===========

Massive Multiplayer Online RPG Engine with Bitcoin and Counterparty integration

![Pre-alpha screenshot](https://github.com/chiguireitor/mmorpgmaker/raw/master/promo/pre-alpha.png "Prealpha screenshot")

MIT Licensed

Requisites:
==

 * Linux (a reasonably modern distro)
 * Node.js 7.0 or better
 * Redis 3.2 or better
 * CouchDB 2.0 (Still not required, but planned)

Installation:
==

For a dev version you should need:

 * Follow NodeJS 7.0, Redis 3.2 and CouchDB 2.0 installation procedure for your distro
 * git clone this repo
 * npm install
 * node index.js

For production environments you'll need:

 * Supervisor for node processes (PM2 is my personal favorite)
 * Redis sentinel cluster setup with 3 masters and 3 slaves at least
 * CouchDB with at least 3 nodes
 * Pretty good experience on handling high load services

Usage:
==

After starting up your node go to `localhost:3000` to initialize your wallet. Copy the address to get edit authorization by adding a new line to the file `authorized_editors` in the root of your node. There's no need to restart the server after modification. On the game press the key `E` to start edit mode, the page will prompt for your wallet password to sign a challenge message to edit the map. After that, you can paint with the left-click of the mouse, keys `1`, `2`, `3` switch layers (drawn in that order) and `SPACEBAR` switches all layers back to normal. Key `T` shows the available tiles in the current map, click over one to set as new drawing tile. Click & drag (only down/left for now, craps itself if you do another direction) to multiselect tiles to draw at once.

After you've done editing, you can press `E` again to exit edit mode.

You Bitcoin/Counterparty wallet is all client side, no private keys are sent nor kept live in the JS session, everything gets destroyed after you put your password and hit ok. The current used address gets saved to local store as a convenience to show it and query available assets on the different online services provided by the Counterparty ecosystem.

There's still a lot to do, as currently there's no avatar to move in the world. After editing gets nailed down i will begin to add playability.

Known issues:
==

 * Editor behaves erratically when drawing multi-cell stuff
 * No persistance between reboots of the map
 * Still a **lot** of UI issues

Still a lot of stuff to be done, this is just a pre-alpha release.

Donations:
==

1PDJv8u8zw4Fgqr4uCb2yim9fgTs5zfM4s

Chiguireitor
