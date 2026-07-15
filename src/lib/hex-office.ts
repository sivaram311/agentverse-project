/** Benzene / hex collaboration office layout constants. */

export const HEX_DESK_RADIUS = 3.35;

/**
 * deskIndex 1..6 → equal hex vertices (north-first, counter-clockwise).
 * deskIndex 0 / hub → origin.
 * deskIndex 7+ → outer ring at the same angles, one radius step further out,
 * so overflow seats (e.g. Help Desk) never collide with the inner six.
 */
export function hexSeatPosition(
  deskIndex: number,
  radius = HEX_DESK_RADIUS,
): [number, number, number] {
  if (deskIndex <= 0) return [0, 0, 0];
  const ring = Math.floor((deskIndex - 1) / 6);
  const posInRing = (deskIndex - 1) % 6;
  const a = -Math.PI / 2 + posInRing * (Math.PI / 3);
  const r = radius + ring * radius * 0.55;
  return [r * Math.cos(a), 0, r * Math.sin(a)];
}

/** Seat world position outside a hex desk (matches PersonaAvatar chairHome). */
export function seatWorldPosition(
  desk: [number, number, number],
  seatDist = 0.66,
): [number, number, number] {
  const len = Math.hypot(desk[0], desk[2]);
  if (len < 0.35) return [0, 0, 0.42];
  const ox = desk[0] / len;
  const oz = desk[2] / len;
  return [desk[0] + ox * seatDist, 0, desk[2] + oz * seatDist];
}

export function isHubSeat(position: [number, number, number]): boolean {
  return Math.hypot(position[0], position[2]) < 0.35;
}

