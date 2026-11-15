export interface ScheduleConfig {
  start: Date;
  count: number;
  intervalMinutes: number;
  /** "HH:mm" */
  windowStart: string;
  /** "HH:mm" */
  windowEnd: string;
  /** 0 = domingo ... 6 = sábado */
  daysOfWeek: number[];
}

function minutesOf(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Distributes `count` sends starting at `start`, spaced by `intervalMinutes`,
 * only inside the daily working window and on allowed weekdays.
 */
export function computeSchedule(cfg: ScheduleConfig): Date[] {
  const { count, intervalMinutes } = cfg;
  if (count <= 0 || intervalMinutes <= 0 || cfg.daysOfWeek.length === 0) return [];
  const ws = minutesOf(cfg.windowStart);
  const we = minutesOf(cfg.windowEnd);
  if (we <= ws) return [];

  const out: Date[] = [];
  const cur = new Date(cfg.start);
  cur.setSeconds(0, 0);
  let guard = 0;
  while (out.length < count && guard < 100000) {
    guard++;
    const mins = cur.getHours() * 60 + cur.getMinutes();
    const dayOk = cfg.daysOfWeek.includes(cur.getDay());
    if (!dayOk || mins > we) {
      cur.setDate(cur.getDate() + 1);
      cur.setHours(Math.floor(ws / 60), ws % 60, 0, 0);
      continue;
    }
    if (mins < ws) {
      cur.setHours(Math.floor(ws / 60), ws % 60, 0, 0);
      continue;
    }
    out.push(new Date(cur));
    cur.setMinutes(cur.getMinutes() + intervalMinutes);
  }
  return out;
}

export const WEEKDAYS = [
  { id: 0, short: "Dom" },
  { id: 1, short: "Seg" },
  { id: 2, short: "Ter" },
  { id: 3, short: "Qua" },
  { id: 4, short: "Qui" },
  { id: 5, short: "Sex" },
  { id: 6, short: "Sáb" },
];
