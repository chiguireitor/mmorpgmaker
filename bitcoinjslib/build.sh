#!/bin/sh
browserify index.js --standalone btc > bitcoin.js
uglifyjs bitcoin.js --mangle --reserved 'Array,BigInteger,Boolean,ECPair,Function,Number,Point' -o bitcoin.min.js
