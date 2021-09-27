require("make-promises-safe")

import http from "http"
import path from "path"
import lodash from "lodash"
import io from "socket.io"
import Redis from "ioredis"

import config from "./config.json"

(async () => {
	if (process.env.NODE_ENV !== "production") {
		(await import("dotenv")).config({
			path: path.join(__dirname, ".env"),
		})
	}

	const server = new http.Server()
	const socket = new io.Server(server)
	const redis = new Redis(process.env.REDIS)

	const namespaces: { [key: string]: io.Namespace } = lodash.mapValues(config.namespaces, (_, name) => socket.of(name))

	redis.on("message", (channel, message) => {
		const key = lodash.findKey(config.namespaces, events => events.includes(channel))
		const namespace = namespaces[key as string]

		namespace.emit(channel, JSON.parse(message))
	})

	Object.values(config.namespaces).flat().map(event => redis.subscribe(event))
})()