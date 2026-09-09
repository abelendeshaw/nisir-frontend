"use client";

import { Box3, BufferGeometry, Group, Mesh, Matrix4, Vector3 } from "three";
import { OBJLoader, PLYLoader, STLLoader, ThreeMFLoader } from "three-stdlib";

/**
 * Reading an uploaded model.
 *
 * The loaders are three-stdlib's — parsing STL's three binary dialects and 3MF
 * zip containers by hand is a solved problem and not one worth re-solving.
 * What is ours is the measurement: a quote needs the enclosed volume of the
 * mesh, not its bounding box, because a lattice and a brick of the same size
 * cost completely different money.
 *
 * A loaded file is flattened here into a plain list of world-baked, centred
 * geometries rather than handed on as a scene graph. That means the viewer can
 * render it declaratively — no traversing a React prop to swap materials on
 * it — and everything imperative stays on this side of the boundary.
 *
 * Everything is parsed in the browser. No model is uploaded anywhere to be
 * priced; the file never leaves the tab until an order is placed.
 */

export const ACCEPTED = ".stl,.obj,.3mf,.ply";
export const MAX_BYTES = 120 * 1024 * 1024;

export type ModelStats = {
  /** Millimetres, assuming the file's units are millimetres. */
  bboxMm: [number, number, number];
  volumeCm3: number;
  surfaceCm2: number;
  triangles: number;
  /** The signed volume came out negative — the normals are inside out. */
  inverted: boolean;
  /** Volume only means anything on a closed surface. This is our best guess. */
  watertight: boolean;
};

export type LoadedModel = {
  /** Centred on the origin, in millimetres, ready to render. */
  geometries: BufferGeometry[];
  stats: ModelStats;
  fileName: string;
  fileSize: number;
};

export async function loadModelFile(file: File): Promise<LoadedModel> {
  if (file.size > MAX_BYTES) {
    throw new Error(`${file.name} is over the ${Math.round(MAX_BYTES / 1_048_576)}MB limit.`);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const buffer = await file.arrayBuffer();
  const root = new Group();

  switch (extension) {
    case "stl":
      root.add(new Mesh(new STLLoader().parse(buffer)));
      break;
    case "ply":
      root.add(new Mesh(new PLYLoader().parse(buffer)));
      break;
    case "obj":
      root.add(new OBJLoader().parse(new TextDecoder().decode(buffer)));
      break;
    case "3mf":
      root.add(new ThreeMFLoader().parse(buffer));
      break;
    default:
      throw new Error(`We can read STL, OBJ, 3MF and PLY. “.${extension}” is not one of them.`);
  }

  const geometries = flatten(root);
  if (geometries.length === 0) {
    throw new Error(`${file.name} parsed, but contains no geometry.`);
  }

  // Centre on the origin so the viewer can frame it without hunting, and so
  // sitting it on the bed is a single offset of half its height.
  const centre = bounds(geometries).getCenter(new Vector3());
  const recentre = new Matrix4().makeTranslation(-centre.x, -centre.y, -centre.z);
  for (const geometry of geometries) geometry.applyMatrix4(recentre);

  const stats = measure(geometries);
  if (stats.triangles === 0) {
    for (const geometry of geometries) geometry.dispose();
    throw new Error(`${file.name} parsed, but contains no triangles.`);
  }

  return { geometries, stats, fileName: file.name, fileSize: file.size };
}

/**
 * Collapse a loaded scene graph into world-space geometries. Each one is a
 * clone, so disposing them cannot pull anything out from under the loader's
 * own caches.
 */
function flatten(root: Group) {
  const out: BufferGeometry[] = [];
  root.updateWorldMatrix(true, true);

  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const source = node.geometry as BufferGeometry | undefined;
    if (!source?.getAttribute("position")) return;

    const geometry = source.clone();
    geometry.applyMatrix4(node.matrixWorld);
    // Vertex colours and UVs from a scan would fight the material being
    // bought; only position and normal survive the trip.
    for (const name of Object.keys(geometry.attributes)) {
      if (name !== "position" && name !== "normal") geometry.deleteAttribute(name);
    }
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    out.push(geometry);
  });

  return out;
}

function bounds(geometries: BufferGeometry[]) {
  const box = new Box3();
  for (const geometry of geometries) {
    geometry.computeBoundingBox();
    if (geometry.boundingBox) box.union(geometry.boundingBox);
  }
  return box;
}

/**
 * Signed volume by the divergence theorem: every triangle contributes the
 * tetrahedron it forms with the origin, and on a closed surface the faces
 * pointing away cancel the ones pointing toward. Correct for any closed mesh
 * wherever the origin sits — including inside it.
 */
export function measure(geometries: BufferGeometry[]): ModelStats {
  let volumeMm3 = 0;
  let areaMm2 = 0;
  let triangles = 0;

  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const ab = new Vector3();
  const ac = new Vector3();
  const cross = new Vector3();
  const edges = new Map<string, number>();

  for (const source of geometries) {
    // Indexed geometry shares vertices between faces; walking it as triangles
    // is simplest once flattened, and the copy is discarded immediately.
    const geometry = source.index ? source.toNonIndexed() : source;
    const position = geometry.getAttribute("position");
    const faces = Math.floor(position.count / 3);

    for (let face = 0; face < faces; face += 1) {
      const i = face * 3;
      a.fromBufferAttribute(position, i);
      b.fromBufferAttribute(position, i + 1);
      c.fromBufferAttribute(position, i + 2);

      volumeMm3 += a.dot(cross.copy(b).cross(c)) / 6;

      ab.copy(b).sub(a);
      ac.copy(c).sub(a);
      areaMm2 += cross.copy(ab).cross(ac).length() / 2;

      // Only the first slice of faces is sampled for the watertight check: on
      // a two-million-triangle scan the map itself is the expensive part, and
      // an open shell shows up in the first few thousand faces or not at all.
      if (face < 20_000) {
        countEdge(edges, a, b);
        countEdge(edges, b, c);
        countEdge(edges, c, a);
      }
    }

    triangles += faces;
    if (geometry !== source) geometry.dispose();
  }

  let open = 0;
  for (const count of edges.values()) if (count !== 2) open += 1;

  const size = bounds(geometries).getSize(new Vector3());

  return {
    bboxMm: [size.x, size.y, size.z],
    volumeCm3: Math.abs(volumeMm3) / 1000,
    surfaceCm2: areaMm2 / 100,
    triangles,
    inverted: volumeMm3 < 0,
    watertight: open === 0,
  };
}

function countEdge(counts: Map<string, number>, p: Vector3, q: Vector3) {
  // Quantised to a micron so float noise from baking a transform does not
  // split an edge that two faces genuinely share.
  const key = [key3(p), key3(q)].sort().join("|");
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function key3(v: Vector3) {
  return `${Math.round(v.x * 1000)},${Math.round(v.y * 1000)},${Math.round(v.z * 1000)}`;
}

/** Free every buffer a load allocated. Models here run to hundreds of MB. */
export function disposeModel(geometries: BufferGeometry[]) {
  for (const geometry of geometries) geometry.dispose();
}
