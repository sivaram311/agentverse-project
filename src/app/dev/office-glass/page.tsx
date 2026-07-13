"use client";

import dynamic from "next/dynamic";
import { DevOfficeCanvas } from "@/components/scene/DevOfficeCanvas";
import { ANCHORS } from "@/lib/office-layout";

const GlassCube = dynamic(
  () => import("@/components/scene/GlassCube").then((m) => m.GlassCube),
  { ssr: false },
);
const SideConferenceBlock = dynamic(
  () =>
    import("@/components/scene/SideConferenceBlock").then((m) => m.SideConferenceBlock),
  { ssr: false },
);

/** Track D isolation — glass cube + side conference block. */
export default function DevOfficeGlassPage() {
  return (
    <DevOfficeCanvas camPosition={[0, 10, 12]}>
      <GlassCube
        position={ANCHORS.glassCube.position}
        size={ANCHORS.glassCube.size}
        lod="full"
      />
      <SideConferenceBlock
        position={ANCHORS.sideConference.position}
        yaw={ANCHORS.sideConference.yaw}
        lod="full"
      />
    </DevOfficeCanvas>
  );
}
