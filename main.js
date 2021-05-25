require("make-promises-safe")

const path = require("path")
const lodash = require("lodash")
const dotenv = require("dotenv")
const io = require("socket.io")
const redis = require("redis")

const config = require("./config.json")

dotenv.config({
	path: path.join(__dirname, ".env"),
})

const socket = io(process.env.PORT)
const client = redis.createClient(process.env.REDIS)

const namespaces = lodash.mapValues(config.namespaces, (_, name) => socket.of(name))

client.on("message", (channel, message) => {
	const namespace = namespaces[lodash.findKey(events => events.includes(channel))]
	namespace.emit(channel, JSON.parse(message))
})

Object.values(config.namespaces).flat().map(event => client.subscribe(event))