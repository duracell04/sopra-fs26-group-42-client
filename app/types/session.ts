export interface GameSession {
  id: number | null;
  code: string;
  creatorId: number;
  players: string[];
  status: "WAITING" | "ACTIVE" | "CANCELLED";
  createdAt: string;
  expiresAt: string;
}
