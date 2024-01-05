import express from "express";
import next from "next";
import http from "http";
import SocketIO, { Socket } from "socket.io";

const port = 80;
const app = next({ dev: true });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();
	const httpServer = http.createServer(server);
	const io = new SocketIO.Server(httpServer, {});

	io.on("connection", (socket: Socket) => {
		console.log("A new client connected.", socket.id);
		socket.on("new-message", (message: string) => {
			console.log(message);
			socket.broadcast.emit("receive-message", message);
		});
		socket.on("disconnect", () => {
			console.log("A user disconnected");
		});
	});

	// Express-Endpunkte für spezifische Routen
	server.get("/api/my-route", (req, res) => {
		console.log("Welcome to my route");
	});

	console.log("Hallo");

	// Alle anderen Anfragen an Next.js weiterleiten
	server.all("*", (req, res) => {
		return handle(req, res);
	});

	httpServer.listen(port, () => {
		console.log(`Ready on http://localhost:${port}`);
	});
});
