require("make-promises-safe")

const http = require("http")
const path = require("path")
const lodash = require("lodash")
const io = require("socket.io")
const Redis = require("ioredis")

const config = require("./config.json")

if (process.env.NODE_ENV === "development") {
	const dotenv = require("dotenv")
	dotenv.config({
		path: path.join(__dirname, ".env"),
	})
}

const server = new http.Server()
const socket = io(server)

const namespaces = lodash.mapValues(config.namespaces, (_, name) => socket.of(name))

const client = new Redis(process.env.REDIS)

client.on("message", (channel, message) => {
	const namespace = namespaces[lodash.findKey(config.namespaces, events => events.includes(channel))]
	namespace.emit(channel, JSON.parse(message))
})
Object.values(config.namespaces).flat().map(event => client.subscribe(event))

server.listen(process.env.PORT, "0.0.0.0")