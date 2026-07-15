/**
 * Generate Ready Player Me–style office-worker GLBs (bone hierarchy + clips).
 * Run: node scripts/generate-avatars.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Blob } from "node:buffer";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

globalThis.Blob = Blob;

class FileReaderPolyfill {
  result = null;
  onload = null;
  onloadend = null;
  onerror = null;
  readyState = 0;

  #finish(ok, value, err) {
    this.readyState = 2;
    if (ok) {
      this.result = value;
      this.onload?.({ target: this });
      this.onloadend?.({ target: this });
    } else {
      this.onerror?.(err);
      this.onloadend?.({ target: this });
    }
  }

  readAsArrayBuffer(blob) {
    this.readyState = 1;
    blob
      .arrayBuffer()
      .then((buf) => this.#finish(true, buf))
      .catch((e) => this.#finish(false, null, e));
  }

  readAsDataURL(blob) {
    this.readyState = 1;
    blob
      .arrayBuffer()
      .then((buf) => {
        const b64 = Buffer.from(buf).toString("base64");
        this.#finish(
          true,
          `data:${blob.type || "application/octet-stream"};base64,${b64}`,
        );
      })
      .catch((e) => this.#finish(false, null, e));
  }
}
globalThis.FileReader = FileReaderPolyfill;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "avatars");

const VARIANTS = [
  { file: "rajesh.glb", gender: "male", skin: "#E8C4A8", hair: "#2A1F14", shirt: "#3d3428", accent: "#E8A838", pants: "#1a2030" },
  { file: "karthik.glb", gender: "male", skin: "#D4A574", hair: "#1A120C", shirt: "#2a3850", accent: "#4DA3FF", pants: "#1a2030" },
  { file: "lavanya.glb", gender: "female", skin: "#F0D5C0", hair: "#3D2314", shirt: "#2a4048", accent: "#5EEAD4", pants: "#2a2430" },
  { file: "aravind.glb", gender: "male", skin: "#C9956C", hair: "#241810", shirt: "#243028", accent: "#3DDC97", pants: "#1a2030" },
  { file: "meenakshi.glb", gender: "female", skin: "#E8B896", hair: "#4A2C1A", shirt: "#3a2840", accent: "#FF6BCB", pants: "#2a2430" },
  { file: "muthu.glb", gender: "male", skin: "#D2A07A", hair: "#1C1410", shirt: "#2a3020", accent: "#C4A35A", pants: "#1a2030" },
  { file: "kabilan.glb", gender: "male", skin: "#C48A62", hair: "#1A120C", shirt: "#203040", accent: "#7EB0FF", pants: "#1a2030" },
  { file: "helpdesk.glb", gender: "female", skin: "#DCAE85", hair: "#3A2317", shirt: "#204540", accent: "#2A9D8F", pants: "#2a2430" },
];

function mat(color, opts = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.05,
  });
  if (opts.emissive) {
    m.emissive = new THREE.Color(opts.emissive);
    m.emissiveIntensity = opts.emissiveIntensity ?? 0.14;
  }
  return m;
}

function bone(name, parent, pos) {
  const b = new THREE.Bone();
  b.name = name;
  b.position.set(...pos);
  parent.add(b);
  return b;
}

function addMesh(parent, geo, material, pos = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true;
  m.receiveShadow = true;
  m.position.set(...pos);
  m.scale.set(...scale);
  parent.add(m);
  return m;
}

function buildCharacter(v) {
  const root = new THREE.Group();
  root.name = "AvatarRoot";

  const hips = new THREE.Bone();
  hips.name = "Hips";
  hips.position.set(0, 0.92, 0);
  root.add(hips);

  const spine = bone("Spine", hips, [0, 0.08, 0]);
  const spine1 = bone("Spine1", spine, [0, 0.12, 0]);
  const spine2 = bone("Spine2", spine1, [0, 0.12, 0]);
  const neck = bone("Neck", spine2, [0, 0.14, 0]);
  const head = bone("Head", neck, [0, 0.08, 0]);

  const shoulderL = bone("LeftShoulder", spine2, [0.06, 0.1, 0]);
  const armL = bone("LeftArm", shoulderL, [0.14, 0, 0]);
  const foreL = bone("LeftForeArm", armL, [0.22, 0, 0]);
  const handL = bone("LeftHand", foreL, [0.2, 0, 0]);

  const shoulderR = bone("RightShoulder", spine2, [-0.06, 0.1, 0]);
  const armR = bone("RightArm", shoulderR, [-0.14, 0, 0]);
  const foreR = bone("RightForeArm", armR, [-0.22, 0, 0]);
  const handR = bone("RightHand", foreR, [-0.2, 0, 0]);

  const upL = bone("LeftUpLeg", hips, [0.09, -0.04, 0]);
  const legL = bone("LeftLeg", upL, [0, -0.4, 0]);
  const footL = bone("LeftFoot", legL, [0, -0.4, 0]);

  const upR = bone("RightUpLeg", hips, [-0.09, -0.04, 0]);
  const legR = bone("RightLeg", upR, [0, -0.4, 0]);
  const footR = bone("RightFoot", legR, [0, -0.4, 0]);

  const skinM = mat(v.skin, { roughness: 0.52 });
  const hairM = mat(v.hair, { roughness: 0.78 });
  const shirtM = mat(v.shirt, { roughness: 0.55 });
  const accentM = mat(v.accent, { roughness: 0.45, emissive: v.accent });
  const pantsM = mat(v.pants, { roughness: 0.65 });
  const shoeM = mat("#1a1410", { roughness: 0.5 });
  const eyeWhite = mat("#f8f6f2", { roughness: 0.3 });
  const eyeDark = mat("#2a1a10", { roughness: 0.25 });

  addMesh(hips, new THREE.SphereGeometry(0.11, 14, 14), pantsM, [0, -0.02, 0]);
  addMesh(spine1, new THREE.CapsuleGeometry(0.15, 0.22, 6, 14), shirtM, [0, 0.02, 0]);
  addMesh(spine2, new THREE.CapsuleGeometry(0.16, 0.16, 6, 14), shirtM, [0, 0.02, 0]);
  addMesh(spine2, new THREE.BoxGeometry(0.2, 0.28, 0.04), accentM, [0, 0, 0.12]);
  addMesh(spine2, new THREE.BoxGeometry(0.28, 0.32, 0.05), shirtM, [0, 0, -0.12]);

  addMesh(head, new THREE.SphereGeometry(0.125, 18, 18), skinM);
  addMesh(head, new THREE.SphereGeometry(0.03, 10, 10), skinM, [-0.11, 0, 0]);
  addMesh(head, new THREE.SphereGeometry(0.03, 10, 10), skinM, [0.11, 0, 0]);
  addMesh(head, new THREE.SphereGeometry(0.018, 8, 8), skinM, [0, -0.01, 0.11]);
  addMesh(head, new THREE.SphereGeometry(0.022, 8, 8), eyeWhite, [-0.04, 0.02, 0.1]);
  addMesh(head, new THREE.SphereGeometry(0.022, 8, 8), eyeWhite, [0.04, 0.02, 0.1]);
  addMesh(head, new THREE.SphereGeometry(0.012, 8, 8), eyeDark, [-0.04, 0.02, 0.115]);
  addMesh(head, new THREE.SphereGeometry(0.012, 8, 8), eyeDark, [0.04, 0.02, 0.115]);

  if (v.gender === "female") {
    addMesh(head, new THREE.SphereGeometry(0.13, 14, 14), hairM, [0, 0.04, -0.02]);
    addMesh(head, new THREE.CapsuleGeometry(0.07, 0.2, 4, 10), hairM, [0, -0.04, -0.12]);
    addMesh(head, new THREE.SphereGeometry(0.09, 12, 12), hairM, [0, 0.01, -0.14]);
  } else {
    addMesh(head, new THREE.SphereGeometry(0.128, 14, 14), hairM, [0, 0.05, -0.02], [1.05, 0.6, 1.05]);
    addMesh(head, new THREE.SphereGeometry(0.1, 12, 12), hairM, [0, 0.02, -0.1], [1, 0.45, 0.7]);
  }

  addMesh(armL, new THREE.CapsuleGeometry(0.04, 0.14, 4, 10), shirtM, [0.1, 0, 0]);
  addMesh(foreL, new THREE.CapsuleGeometry(0.035, 0.14, 4, 10), skinM, [0.1, 0, 0]);
  addMesh(handL, new THREE.SphereGeometry(0.035, 10, 10), skinM);
  addMesh(armR, new THREE.CapsuleGeometry(0.04, 0.14, 4, 10), shirtM, [-0.1, 0, 0]);
  addMesh(foreR, new THREE.CapsuleGeometry(0.035, 0.14, 4, 10), skinM, [-0.1, 0, 0]);
  addMesh(handR, new THREE.SphereGeometry(0.035, 10, 10), skinM);

  addMesh(upL, new THREE.CapsuleGeometry(0.055, 0.28, 4, 10), pantsM, [0, -0.18, 0]);
  addMesh(legL, new THREE.CapsuleGeometry(0.048, 0.28, 4, 10), pantsM, [0, -0.18, 0]);
  addMesh(footL, new THREE.BoxGeometry(0.09, 0.045, 0.16), shoeM, [0, -0.02, 0.04]);
  addMesh(upR, new THREE.CapsuleGeometry(0.055, 0.28, 4, 10), pantsM, [0, -0.18, 0]);
  addMesh(legR, new THREE.CapsuleGeometry(0.048, 0.28, 4, 10), pantsM, [0, -0.18, 0]);
  addMesh(footR, new THREE.BoxGeometry(0.09, 0.045, 0.16), shoeM, [0, -0.02, 0.04]);

  return root;
}

function qTrack(name, times, quats) {
  const values = [];
  for (const q of quats) values.push(q.x, q.y, q.z, q.w);
  return new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, values);
}

function pTrack(name, times, positions) {
  const values = [];
  for (const p of positions) values.push(p[0], p[1], p[2]);
  return new THREE.VectorKeyframeTrack(`${name}.position`, times, values);
}

function eulerQ(x, y, z) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
}

function buildClips() {
  const identity = eulerQ(0, 0, 0);
  const clips = [];

  {
    const t = [0, 1.2, 2.4];
    clips.push(
      new THREE.AnimationClip("SitIdle", 2.4, [
        pTrack("Hips", t, [[0, 0.48, 0.04], [0, 0.485, 0.04], [0, 0.48, 0.04]]),
        qTrack("Spine1", t, [eulerQ(0.18, 0, 0), eulerQ(0.2, 0.02, 0), eulerQ(0.18, 0, 0)]),
        qTrack("Head", t, [eulerQ(0.12, -0.08, 0), eulerQ(0.1, 0.1, 0), eulerQ(0.12, -0.08, 0)]),
        qTrack("LeftUpLeg", t, [eulerQ(1.45, 0, 0.05), eulerQ(1.45, 0, 0.05), eulerQ(1.45, 0, 0.05)]),
        qTrack("RightUpLeg", t, [eulerQ(1.45, 0, -0.05), eulerQ(1.45, 0, -0.05), eulerQ(1.45, 0, -0.05)]),
        qTrack("LeftLeg", t, [eulerQ(-0.15, 0, 0), eulerQ(-0.15, 0, 0), eulerQ(-0.15, 0, 0)]),
        qTrack("RightLeg", t, [eulerQ(-0.15, 0, 0), eulerQ(-0.15, 0, 0), eulerQ(-0.15, 0, 0)]),
        qTrack("LeftArm", t, [eulerQ(0, 0, 0.9), eulerQ(0, 0, 0.92), eulerQ(0, 0, 0.9)]),
        qTrack("RightArm", t, [eulerQ(0, 0, -0.9), eulerQ(0, 0, -0.92), eulerQ(0, 0, -0.9)]),
        qTrack("LeftForeArm", t, [eulerQ(0, 0.2, 0.4), eulerQ(0, 0.2, 0.42), eulerQ(0, 0.2, 0.4)]),
        qTrack("RightForeArm", t, [eulerQ(0, -0.2, -0.4), eulerQ(0, -0.2, -0.42), eulerQ(0, -0.2, -0.4)]),
      ]),
    );
  }

  {
    const t = [0, 0.15, 0.3, 0.45, 0.6];
    clips.push(
      new THREE.AnimationClip("Typing", 0.6, [
        pTrack("Hips", t, Array(5).fill([0, 0.48, 0.05])),
        qTrack("Spine1", t, [eulerQ(0.28, 0, 0), eulerQ(0.3, 0.02, 0), eulerQ(0.28, -0.02, 0), eulerQ(0.3, 0.01, 0), eulerQ(0.28, 0, 0)]),
        qTrack("Head", t, [eulerQ(0.25, 0, 0), eulerQ(0.22, 0.08, 0), eulerQ(0.26, -0.06, 0), eulerQ(0.23, 0.05, 0), eulerQ(0.25, 0, 0)]),
        qTrack("LeftUpLeg", t, Array(5).fill(eulerQ(1.45, 0, 0.05))),
        qTrack("RightUpLeg", t, Array(5).fill(eulerQ(1.45, 0, -0.05))),
        qTrack("LeftLeg", t, Array(5).fill(eulerQ(-0.12, 0, 0))),
        qTrack("RightLeg", t, Array(5).fill(eulerQ(-0.12, 0, 0))),
        qTrack("LeftArm", t, [eulerQ(-0.35, 0.2, 1.0), eulerQ(-0.45, 0.15, 1.05), eulerQ(-0.3, 0.25, 0.95), eulerQ(-0.5, 0.1, 1.08), eulerQ(-0.35, 0.2, 1.0)]),
        qTrack("RightArm", t, [eulerQ(-0.4, -0.2, -1.0), eulerQ(-0.3, -0.25, -0.95), eulerQ(-0.5, -0.15, -1.08), eulerQ(-0.35, -0.2, -1.0), eulerQ(-0.4, -0.2, -1.0)]),
        qTrack("LeftForeArm", t, [eulerQ(0, 0.4, 0.6), eulerQ(0.1, 0.35, 0.55), eulerQ(-0.05, 0.45, 0.65), eulerQ(0.08, 0.38, 0.58), eulerQ(0, 0.4, 0.6)]),
        qTrack("RightForeArm", t, [eulerQ(0, -0.4, -0.6), eulerQ(-0.08, -0.38, -0.58), eulerQ(0.05, -0.45, -0.65), eulerQ(-0.1, -0.35, -0.55), eulerQ(0, -0.4, -0.6)]),
      ]),
    );
  }

  {
    const t = [0, 0.25, 0.5, 0.75, 1.0];
    clips.push(
      new THREE.AnimationClip("Walk", 1.0, [
        pTrack("Hips", t, [[0, 0.92, 0], [0, 0.94, 0], [0, 0.92, 0], [0, 0.94, 0], [0, 0.92, 0]]),
        qTrack("Spine1", t, [eulerQ(0.04, 0.04, 0), eulerQ(0.04, -0.04, 0), eulerQ(0.04, 0.04, 0), eulerQ(0.04, -0.04, 0), eulerQ(0.04, 0.04, 0)]),
        qTrack("Head", t, [eulerQ(0.05, 0, 0), eulerQ(0.05, 0.03, 0), eulerQ(0.05, 0, 0), eulerQ(0.05, -0.03, 0), eulerQ(0.05, 0, 0)]),
        qTrack("LeftUpLeg", t, [eulerQ(0.55, 0, 0), eulerQ(-0.55, 0, 0), eulerQ(0.55, 0, 0), eulerQ(-0.55, 0, 0), eulerQ(0.55, 0, 0)]),
        qTrack("RightUpLeg", t, [eulerQ(-0.55, 0, 0), eulerQ(0.55, 0, 0), eulerQ(-0.55, 0, 0), eulerQ(0.55, 0, 0), eulerQ(-0.55, 0, 0)]),
        qTrack("LeftLeg", t, [eulerQ(0.2, 0, 0), eulerQ(0.45, 0, 0), eulerQ(0.2, 0, 0), eulerQ(0.45, 0, 0), eulerQ(0.2, 0, 0)]),
        qTrack("RightLeg", t, [eulerQ(0.45, 0, 0), eulerQ(0.2, 0, 0), eulerQ(0.45, 0, 0), eulerQ(0.2, 0, 0), eulerQ(0.45, 0, 0)]),
        qTrack("LeftArm", t, [eulerQ(0, 0, 0.7), eulerQ(0.5, 0, 0.7), eulerQ(0, 0, 0.7), eulerQ(-0.5, 0, 0.7), eulerQ(0, 0, 0.7)]),
        qTrack("RightArm", t, [eulerQ(0, 0, -0.7), eulerQ(-0.5, 0, -0.7), eulerQ(0, 0, -0.7), eulerQ(0.5, 0, -0.7), eulerQ(0, 0, -0.7)]),
        qTrack("LeftForeArm", t, Array(5).fill(eulerQ(0, 0, 0.15))),
        qTrack("RightForeArm", t, Array(5).fill(eulerQ(0, 0, -0.15))),
      ]),
    );
  }

  {
    const t = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    clips.push(
      new THREE.AnimationClip("Greet", 1.0, [
        pTrack("Hips", t, Array(6).fill([0, 0.92, 0])),
        qTrack("Spine1", t, Array(6).fill(eulerQ(0.05, 0, 0))),
        qTrack("Head", t, [eulerQ(0, 0, 0), eulerQ(0, 0.1, 0), eulerQ(0, -0.05, 0), eulerQ(0, 0.1, 0), eulerQ(0, -0.05, 0), eulerQ(0, 0, 0)]),
        qTrack("LeftUpLeg", t, Array(6).fill(identity)),
        qTrack("RightUpLeg", t, Array(6).fill(identity)),
        qTrack("LeftLeg", t, Array(6).fill(identity)),
        qTrack("RightLeg", t, Array(6).fill(identity)),
        qTrack("LeftArm", t, Array(6).fill(eulerQ(0, 0, 0.6))),
        qTrack("RightArm", t, [eulerQ(-0.4, 0, -0.3), eulerQ(-2.2, 0.2, -0.4), eulerQ(-2.0, -0.3, -0.5), eulerQ(-2.3, 0.35, -0.35), eulerQ(-2.0, -0.25, -0.45), eulerQ(-0.4, 0, -0.3)]),
        qTrack("RightForeArm", t, [eulerQ(0, 0, -0.2), eulerQ(0, 0, -0.1), eulerQ(0, 0.2, -0.15), eulerQ(0, -0.2, -0.1), eulerQ(0, 0.15, -0.15), eulerQ(0, 0, -0.2)]),
        qTrack("LeftForeArm", t, Array(6).fill(eulerQ(0, 0, 0.2))),
      ]),
    );
  }

  {
    const t = [0, 1.5, 3.0];
    clips.push(
      new THREE.AnimationClip("StandIdle", 3.0, [
        pTrack("Hips", t, [[0, 0.92, 0], [0, 0.925, 0], [0, 0.92, 0]]),
        qTrack("Spine1", t, [eulerQ(0.02, 0, 0), eulerQ(0.03, 0.02, 0), eulerQ(0.02, 0, 0)]),
        qTrack("Head", t, [eulerQ(0.02, -0.05, 0), eulerQ(0.02, 0.06, 0), eulerQ(0.02, -0.05, 0)]),
        qTrack("LeftArm", t, Array(3).fill(eulerQ(0, 0, 0.55))),
        qTrack("RightArm", t, Array(3).fill(eulerQ(0, 0, -0.55))),
        qTrack("LeftForeArm", t, Array(3).fill(eulerQ(0, 0, 0.2))),
        qTrack("RightForeArm", t, Array(3).fill(eulerQ(0, 0, -0.2))),
        qTrack("LeftUpLeg", t, Array(3).fill(identity)),
        qTrack("RightUpLeg", t, Array(3).fill(identity)),
      ]),
    );
  }

  return clips;
}

function exportGlb(object, animations) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(Buffer.from(result));
        else reject(new Error("Expected binary GLB"));
      },
      reject,
      { binary: true, animations },
    );
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const clips = buildClips();

  for (const v of VARIANTS) {
    const root = buildCharacter(v);
    const buf = await exportGlb(root, clips);
    fs.writeFileSync(path.join(outDir, v.file), buf);
    console.log("wrote", v.file, buf.length);
  }

  const catalog = {
    version: 1,
    note: "RPM-style office avatars (Mixamo bone names + SitIdle/Typing/Walk/Greet/StandIdle)",
    scale: 0.55,
    animations: ["SitIdle", "Typing", "Walk", "Greet", "StandIdle"],
    personas: Object.fromEntries(
      VARIANTS.map((v) => [
        v.file.replace(".glb", ""),
        { file: `/avatars/${v.file}`, gender: v.gender },
      ]),
    ),
  };
  fs.writeFileSync(path.join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
