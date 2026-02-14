export interface WhiteboardError {
  code: string;
  message: string;
}

export function normalizeError(e: unknown): WhiteboardError {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string') {
    const msg = (e as { message: string }).message;
    const code = e && typeof e === 'object' && 'code' in e && typeof (e as { code: string }).code === 'string'
      ? (e as { code: string }).code
      : 'unknown';
    return { code, message: msg };
  }
  if (e instanceof Error) return { code: 'error', message: e.message };
  return { code: 'unknown', message: String(e) };
}

export function messageFromCaught(e: unknown): string {
  return normalizeError(e).message;
}
