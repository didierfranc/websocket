const { createHash } = require('crypto')

const generateResponseHeader = clientKey => {
  const sha1 = string => createHash('sha1').update(string).digest('base64')
  const magicKey = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  const generatedKey = sha1(clientKey + magicKey)
  return `HTTP/1.1 101 Web Socket Protocol Handshake\r\nUpgrade: WebSocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${generatedKey}\r\n\r\n`
}

const decryptData = data => {
  const length = data[1] & 127
  const firstMaskIndex = length === 126 ? 4 : length === 127 ? 10 : 2

  const index = firstMaskIndex + 4
  const masks = data.slice(firstMaskIndex, index)

  return data.reduce(
    (r, v, i) =>
      index + i < data.length
        ? r + String.fromCharCode(data[index + i] ^ masks[i % 4])
        : r,
    ''
  )
}

const encryptData = bytesRaw => {
  let bytesFormatted = []
  bytesFormatted[0] = 129
  if (bytesRaw.length <= 125) {
    bytesFormatted[1] = bytesRaw.length
  } else if (bytesRaw.length >= 126 && bytesRaw.length <= 65535) {
    bytesFormatted[1] = 126
    bytesFormatted[2] = (bytesRaw.length >> 8) & 255
    bytesFormatted[3] = bytesRaw.length & 255
  } else {
    bytesFormatted[1] = 127
    bytesFormatted[2] = (bytesRaw.length >> 56) & 255
    bytesFormatted[3] = (bytesRaw.length >> 48) & 255
    bytesFormatted[4] = (bytesRaw.length >> 40) & 255
    bytesFormatted[5] = (bytesRaw.length >> 32) & 255
    bytesFormatted[6] = (bytesRaw.length >> 24) & 255
    bytesFormatted[7] = (bytesRaw.length >> 16) & 255
    bytesFormatted[8] = (bytesRaw.length >> 8) & 255
    bytesFormatted[9] = bytesRaw.length & 255
  }
  for (var i = 0; i < bytesRaw.length; i++) {
    bytesFormatted.push(bytesRaw.charCodeAt(i))
  }
  return bytesFormatted
}

module.exports = {
  decryptData,
  encryptData,
  generateResponseHeader
}
