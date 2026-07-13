"use client";

import dynamic from "next/dynamic";
import { DevOfficeCanvas } from "@/components/scene/DevOfficeCanvas";

const CentralConference = dynamic(
  () =>
    import("@/components/scene/CentralConference").then((m) => m.CentralConference),
  { ssr: false },
);

/** Track B isolation — central conference hall. */
export default function DevOfficeConferencePage() {
  return (
    <DevOfficeCanvas camPosition={[0, 8, 14]}>
      <CentralConference lod="full" showLabels />
    </DevOfficeCanvas>
  );
}
