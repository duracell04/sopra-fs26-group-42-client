import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export function useWebSocket(onMessage: (body: unknown) => void) {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            onConnect: () => {
                client.subscribe("/topic/game", (message) => {
                    const body = JSON.parse(message.body);
                    onMessage(body);
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [onMessage]);

    const sendMessage = useCallback((destination: string, body: unknown) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
        }
    }, []);

    return { sendMessage };
}
