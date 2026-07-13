/** Shared player footprint for approach / camera (avoids per-frame Zustand churn). */
export const playerPose = {
  x: 0,
  y: 0,
  z: 5.2,
};

export function setPlayerPose(x: number, y: number, z: number) {
  playerPose.x = x;
  playerPose.y = y;
  playerPose.z = z;
}
