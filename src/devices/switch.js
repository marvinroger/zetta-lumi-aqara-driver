const util = require('util')
const Device = require('zetta-device')

const Switch = function (options) {
  Device.call(this)

  this.sid = options.sid

  this._instance = options.instance
}
util.inherits(Switch, Device)

Switch.prototype.init = function (config) {
  config
    .type('aqaraswitch')
    .state('online')
    .map('online', [])
    .name('Aqara Switch')
    .stream('event', this.eventStream)
}

Switch.prototype.eventStream = function (stream) {
  this._instance.on('click', () => stream.write('click'))
  this._instance.on('doubleClick', () => stream.write('doubleClick'))
  this._instance.on('longClickPress', () => stream.write('longClickPress'))
  this._instance.on('longClickRelease', () => stream.write('longClickRelease'))
}

module.exports = Switch
