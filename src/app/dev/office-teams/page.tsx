"use client";

import dynamic from "next/dynamic";
import { DevOfficeCanvas } from "@/components/scene/DevOfficeCanvas";
import { TEAM_ZONES } from "@/lib/office-layout";

const TeamCluster = dynamic(
  () => import("@/components/scene/TeamCluster").then((m) => m.TeamCluster),
  { ssr: false },
);

/** Track C isolation — 20 team clusters. */
export default function DevOfficeTeamsPage() {
  return (
    <DevOfficeCanvas camPosition={[0, 16, 20]}>
      {TEAM_ZONES.map((zone) => (
        <TeamCluster key={zone.id} zone={zone} lod="full" showLabels={false} />
      ))}
    </DevOfficeCanvas>
  );
}
