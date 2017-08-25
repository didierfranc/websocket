const http = require('http')
const fs = require('fs')
const { decryptData, generateResponseHeader } = require('./crypto')

const server = http.createServer((req, res) => {
  res.end(fs.readFileSync('index.html', 'utf8'))
})

server.on('upgrade', (req, socket) => {
  const clientKey = req.headers['sec-websocket-key']
  socket.write(generateResponseHeader(clientKey))
  socket.on('data', chunk => console.log(chunk, decryptData(chunk)))
  socket.on('end', () => console.log('end'))
})

server.listen(8000)
