"use client";

import { DevOfficeCanvas } from "@/components/scene/DevOfficeCanvas";
import { SiruseriOffice } from "@/components/scene/SiruseriOffice";

/** Track A isolation — expanded shell + elevators. */
export default function DevOfficeShellPage() {
  return (
    <DevOfficeCanvas camPosition={[0, 14, 22]}>
      <SiruseriOffice lod="full" reducedMotion={false} />
    </DevOfficeCanvas>
  );
}
