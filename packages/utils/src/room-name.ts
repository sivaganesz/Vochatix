export function createCallRoomName(conversationId: string): string {
  return "call_${conversationId}_${Date.now()}";
}
