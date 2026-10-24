/** Is this raw adapter→client DAP message a `stopped` event? */
export function isStoppedEvent(message: unknown): boolean {
  if (typeof message !== 'object' || message === null) {
    return false;
  }

  const { type, event } = message as { type?: unknown; event?: unknown };
  return type === 'event' && event === 'stopped';
}
