const util = require('util')
const Device = require('zetta-device')

const Magnet = function (options) {
  Device.call(this)

  this.sid = options.sid
  this.open = options.open

  this._instance = options.instance
}
util.inherits(Magnet, Device)

Magnet.prototype.init = function (config) {
  config
    .type('aqaramagnet')
    .state(this.open ? 'open' : 'close')
    .map('open', [])
    .map('close', [])
    .name('Aqara Magnet')

  this._instance.on('open', () => {
    this.open = true
    this.state = 'open'
  })
  this._instance.on('close', () => {
    this.open = false
    this.state = 'close'
  })
}

module.exports = Magnet
