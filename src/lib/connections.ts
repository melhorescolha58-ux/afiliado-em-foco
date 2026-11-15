export function normalizeWhatsAppPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

export type GroupSendStatus = "available" | "pending_connection" | "pending_integration";

export function groupSendStatus(
  group: { send_available: boolean },
  connection: { status: string } | null | undefined,
): GroupSendStatus {
  if (connection?.status === "connected" && group.send_available) return "available";
  if (connection && ["pending_connection", "disconnected", "error"].includes(connection.status)) {
    return "pending_connection";
  }
  return "pending_integration";
}
