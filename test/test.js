const test = require( 'tape' )

const eeh = require( '../src/main.js' )

test( 'on', function ( t ) {
  t.plan( 2 )
  const ee = eeh()

  const buffer = []
  ee.on( 'msg', function ( data ) {
    buffer.push( data )
  } )

  ee.emit( 'msg', 'hello' )
  ee.emit( 'msg', 'world' )

  t.equal( buffer[ 0 ], 'hello' )
  t.equal( buffer[ 1 ], 'world' )
} )

test( 'off', function ( t ) {
  t.plan( 2 )
  const ee = eeh()

  const buffer = []
  const off = ee.on( 'msg', function ( data ) {
    buffer.push( data )
  } )

  ee.emit( 'msg', 'hello' )
  off()
  ee.emit( 'msg', 'world' )

  t.equal( buffer[ 0 ], 'hello' )
  t.equal( buffer[ 1 ], undefined )
} )

test( 'off called multiple timed', function ( t ) {
  t.plan( 9 )
  const ee = eeh()

  const buffer = []

  const offs = []

  for ( let i = 0; i < 3; i++ ) {
    const off = ee.on( 'msg', function ( data ) {
      buffer.push( data )
    } )
    offs.push( off )
  }

  ee.emit( 'msg', 'hello' )
  offs[ 0 ]()
  ee.emit( 'msg', 'world' )
  offs[ 0 ]()
  ee.emit( 'msg', 'world again' )
  offs[ 1 ]()
  offs[ 1 ]()
  offs[ 1 ]()
  ee.emit( 'msg', 'pikachu' )
  offs[ 2 ]()
  ee.emit( 'msg', 'nomore' )

  t.equal( buffer[ 0 ], 'hello' )
  t.equal( buffer[ 1 ], 'hello' )
  t.equal( buffer[ 2 ], 'hello' )

  t.equal( buffer[ 3 ], 'world' )
  t.equal( buffer[ 4 ], 'world' )

  t.equal( buffer[ 5 ], 'world again' )
  t.equal( buffer[ 6 ], 'world again' )

  t.equal( buffer[ 7 ], 'pikachu' )

  t.equal( buffer[ 8 ], undefined )
} )

test( 'off once', function ( t ) {
  t.plan( 1 )
  const ee = eeh()

  const buffer = []
  const off = ee.once( 'msg', function ( data ) {
    buffer.push( data )
  } )

  off()
  ee.emit( 'msg', 'world' )

  t.equal( buffer[ 0 ], undefined )
} )

test( 'once', function ( t ) {
  t.plan( 2 )
  const ee = eeh()

  const buffer = []
  ee.once( 'msg', function ( data ) {
    buffer.push( data )
  } )

  ee.emit( 'msg', 'hello' )
  ee.emit( 'msg', 'world' )

  t.equal( buffer[ 0 ], 'hello' )
  t.equal( buffer[ 1 ], undefined )
} )

test( 'duplicate callback error', function ( t ) {
  t.plan( 1 )
  const ee = eeh()

  const buffer = []
  const callback = function ( data ) {
    buffer.push( data )
  }

  ee.on( 'msg', callback )

  let _error
  try {
    // should throw error
    ee.on( 'msg', callback )
  } catch ( err ) {
    _error = err
  }

  t.ok( _error )
} )

test( 'non function callback', function ( t ) {
  t.plan( 2 )
  const ee = eeh()

  const callback = {}
  try {
    ee.on( 'msg', callback )
  } catch ( err ) {
    console.log( err.message )
    t.ok( err )
    t.equal( err.message, 'eeto: callback must be a function (was object)' )
  }
} )

test( 'warn when exceeding default max listeners limit', function ( t ) {
  t.plan( 1 )
  const ee = eeh()

  const _consoleLog = console.log
  console.log = function ( text ) {
    console.log = _consoleLog
    console.log( text )
    t.equal( text, `eeto max event listener limit warning: Possible event emitter leak detected. 11 'giraffe' listeners added. Set ee.opts.limit to increase limit.` )
  }

  for ( let i = 0; i < 12; i++ ) {
    ee.on( 'giraffe', function () {} )
  }
} )
