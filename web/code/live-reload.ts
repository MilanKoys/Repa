const LIVE_RELOAD_DEFAULT_DELAY: number = 100;

export function liveReload(
  uri: string,
  delay: number = LIVE_RELOAD_DEFAULT_DELAY,
) {
  const websocket: WebSocket = new WebSocket(uri);

  websocket.addEventListener("close", () => {
    setTimeout(() => location.reload(), delay);
  });
}
