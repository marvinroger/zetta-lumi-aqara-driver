const util = require('util')
const Color = require('color')
const Device = require('zetta-device')

const Gateway = function (options) {
  Device.call(this)

  this.sid = options.sid
  this.intensity = 0
  this.color = { r: 255, g: 255, b: 255 }

  if (options.password) this.password = options.password

  this._instance = options.instance
}
util.inherits(Gateway, Device)

Gateway.prototype.init = function (config) {
  config
    .type('aqaragateway')
    .state(this.password ? 'off' : 'need-password')
    .name('Aqara Gateway')
    .when('need-password', { allow: ['set-password'] })
    .when('off', { allow: ['turn-on'] })
    .when('on', { allow: ['turn-off', 'set-color', 'set-intensity'] })
    .map('set-password', this.setPassword, [{ name: 'password', type: 'string' }])
    .map('turn-off', this.turnOff)
    .map('turn-on', this.turnOn)
    .map('set-color', this.setColor, [{ name: 'color', type: 'color' }])
    .map('set-intensity', this.setIntensity, [{ name: 'intensity', type: 'number' }])

  if (this.password) {
    this._instance.setPassword(this.password)
    this._instance.setIntensity(this.intensity)
    this._instance.setColor(this.color)
  }
}

Gateway.prototype.setPassword = function (password, cb) {
  this.state = 'off'
  this.password = password
  this.save()

  this._instance.setPassword(password)
  this._instance.setIntensity(0)

  cb()
}

Gateway.prototype.turnOff = function (cb) {
  this.state = 'off'
  this.intensity = 0

  this._instance.setIntensity(0)

  cb()
}

Gateway.prototype.turnOn = function (cb) {
  this.state = 'on'
  this.intensity = 100

  this._instance.setIntensity(100)

  cb()
}

Gateway.prototype.setColor = function (color, cb) {
  const rgb = Color(color).rgb().array()

  this.color = { r: rgb[0], g: rgb[1], b: rgb[2] }

  this._instance.setColor({ r: rgb[0], g: rgb[1], b: rgb[2] })

  cb()
}

Gateway.prototype.setIntensity = function (intensity, cb) {
  this.intensity = intensity

  this._instance.setIntensity(intensity)

  cb()
}

module.exports = Gateway
