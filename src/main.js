module.exports = function create ( opts ) {
  const ee = {}

  ee.opts = opts || {}
  ee.opts.limit = ee.opts.limit || 10

  ee._listeners = {}

  ee.on = function on ( name, callback ) {
    // init
    const l = ee._listeners[ name ] || []
    ee._listeners[ name ] = l

    if ( typeof callback !== 'function' ) {
      throw new Error( `eeto: callback must be a function (was ${ typeof callback })` )
    }

    // warn if listeners exceed limit
    if ( l.length > ee.opts.limit ) {
      console.log( `eeto max event listener limit warning: Possible event emitter leak detected. ${ l.length } '${ name }' listeners added. Set ee.opts.limit to increase limit.` )
    }

    // already exist, throw error to notify user
    if ( l.indexOf( callback ) >= 0 ) {
      throw new Error( 'eeto: callback already registered ' + callback )
    }
    l.push( callback )

    return function off () {
      const i = l.indexOf( callback )
      if ( i >= 0 ) return l.splice( i, 1 )
      return undefined
    }
  }

  ee.once = function once ( name, callback ) {
    const off = ee.on( name, once_wrapper )

    function once_wrapper ( data ) {
      off()
      callback( data )
    }

    return off
  }

  ee.emit = function emit ( name, data ) {
    const l = ee._listeners[ name ] || []

    // make a copy in case any are removed during their callback
    // triggers ( ex: happens for once callbacks )
    const callbacks = l.slice()

    for ( let i = 0; i < callbacks.length; i++ ) {
      const callback = callbacks[ i ]
      callback( data )
    }
  }

  ee.reset = function reset () {
    ee._listeners = {}
  }

  return ee
}
