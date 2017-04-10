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

Known issues:
==

 * Editor behaves erratically when drawing multi-cell stuff
 * No persistance between reboots of the map
 * Still a lot of UI issues

Still a lot of stuff to be done, this is just a pre-alpha release.

Donations:
==

1PDJv8u8zw4Fgqr4uCb2yim9fgTs5zfM4s

Chiguireitor
