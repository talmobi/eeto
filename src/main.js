module.exports = function create () {
  const ee = {}

  ee._listeners = {}

  ee.on = function on ( name, callback ) {
    // init
    const l = ee._listeners[ name ] || []
    ee._listeners[ name ] = l

    // already exist, throw error to notify user
    if ( l.indexOf( callback ) >= 0 ) throw new Error( 'eeh: callback already registered ' + callback )
    l.push( callback )

    return function off () {
      const i = l.indexOf( callback )
      return l.splice( i, 1 )
    }
  }

  ee.once = function once ( name, callback ) {
    const off = ee.on( name, once_wrapper )

    function once_wrapper ( data ) {
      off()
      callback( data )
    }
  }

  ee.emit = function emit ( name, data ) {
    const l = ee._listeners[ name ] || []
    for ( let i = 0; i < l.length; i++ ) {
      const callback = l[ i ]
      callback( data )
    }
  }

  ee.reset = function reset () {
    ee._listeners = {}
  }

  return ee
}
