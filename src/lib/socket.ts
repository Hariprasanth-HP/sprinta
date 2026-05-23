import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
	? import.meta.env.VITE_API_URL.replace("/api", "")
	: "http://localhost:4000";

let socket: Socket | null = null;

export function initSocket(userId: string): Socket {
	if (socket?.connected) return socket;

	socket = io(SOCKET_URL, {
		query: { userId },
		transports: ["websocket", "polling"],
	});

	return socket;
}

export function getSocket(): Socket | null {
	return socket;
}

export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
