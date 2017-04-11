const util = require('util')
const Scout = require('zetta-scout')
const Aqara = require('lumi-aqara')

const GatewayDevice = require('./devices/gateway')
const MagnetDevice = require('./devices/magnet')
const SwitchDevice = require('./devices/switch')

const AqaraScout = function () {
  Scout.call(this)
}
util.inherits(AqaraScout, Scout)

AqaraScout.prototype.init = function (next) {
  const aqara = new Aqara()
  aqara.on('gateway', (gateway) => {
    gateway.on('ready', () => {
      this._foundGateway(gateway)
    })

    gateway.on('subdevice', (device) => {
      this._foundSubdevice(device)
    })
  })

  next()
}

AqaraScout.prototype._foundGateway = function (gateway) {
  const query = this.server.where({ type: 'aqaragateway', sid: gateway.sid })
  const options = {
    instance: gateway,
    sid: gateway.sid
  }

  this.server.find(query, (err, results) => {
    if (err) return

    if (results[0]) {
      options.password = results[0].password
      this.provision(results[0], GatewayDevice, options)
    } else {
      this.discover(GatewayDevice, options)
    }
  })
}

AqaraScout.prototype._foundSubdevice = function (device) {
  const queryOptions = { sid: device.getSid() }
  const options = {
    instance: device,
    sid: device.getSid()
  }
  let ZettaDevice

  switch (device.getType()) {
    case 'magnet':
      queryOptions.type = 'aqaramagnet'
      options.open = device.isOpen()
      ZettaDevice = MagnetDevice
      break
    case 'switch':
      queryOptions.type = 'aqaraswitch'
      ZettaDevice = SwitchDevice
      break
  }

  if (!ZettaDevice) {
    this.server.warn('Aqara subdevice not implemented', { type: device.getType() })
    return
  }

  const query = this.server.where(queryOptions)

  this.server.find(query, (err, results) => {
    if (err) return

    if (results[0]) {
      this.provision(results[0], ZettaDevice, options)
    } else {
      this.discover(ZettaDevice, options)
    }
  })
}

module.exports = AqaraScout
