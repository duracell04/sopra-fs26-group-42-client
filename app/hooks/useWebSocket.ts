import { useCallback, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getApiDomain } from "@/utils/domain";

type UseWebSocketOptions = {
  enabled?: boolean;
  sessionCode?: string;
};

export function useWebSocket(
  onMessage: (body: unknown) => void,
  options: UseWebSocketOptions = {},
) {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);
  const { enabled = true, sessionCode } = options;

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      return;
    }

    const wsUrl = `${getApiDomain()}/ws`;
    const topic = sessionCode ? `/topic/game/${sessionCode}` : "/topic/game";
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        client.subscribe(topic, (message) => {
          const body = JSON.parse(message.body);
          onMessageRef.current(body);
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, sessionCode]);

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
