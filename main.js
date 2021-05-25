require("make-promises-safe")

const path = require("path")
const dotenv = require("dotenv")
const io = require("socket.io")
const amqp = require("amqplib")

const config = require("./config.json")

dotenv.config({
	path: path.join(__dirname, ".env"),
})

const socket = io(process.env.PORT)

async function run() {
	const connection = await amqp.connect(process.env.amqp)
	const channel = await connection.createChannel()

	await Promise.all(
		Object.keys(config.namespaces).map(async (key) => {
			const events = config.namespaces[key]
			const namespace = socket.of(`/${key}`)

			await Promise.all(
				events.map(async (event) => {
					await channel.assertQueue(event)
					await channel.consume(event, (message) => {
						namespace.emit(event, message)
					})
				})
			)
		})
	)
}

run().then(() => console.log("Connected to AMQP server"))