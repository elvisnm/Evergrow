import * as THREE from 'three';

// Style spike: today's assets rebuilt as flat-shaded low-poly geometry, so the
// polygon direction can be judged before any art module is converted. Nothing
// here is wired into the game; every colour is the real in-game palette, and
// every model is built in the units its 2D counterpart already uses.
const STEEL = { base: '#728c81', shadow: '#294750', edge: '#d1d6b0', trim: '#cfaa6c' };
const LEATHER = { base: '#5c4c41', shadow: '#292b30', edge: '#a79873' };
const CLOAK = { base: '#92364e', shadow: '#4e2a3e', highlight: '#cf5e69', trim: '#d4a070' };
const GOBLIN = { skin: '#819963', chief: '#76834e', shade: '#3a5145', edge: '#b6be7a', cloth: '#82634b', steel: '#c7cdac', grip: '#313e40', bone: '#d5c99a', banner: '#9b443c', pole: '#756049', eye: '#e3c96f' };
const CHEST = { body: '#3c3027', dark: '#211f22', lid: '#68543c', lidTop: '#9a835c', rim: '#c5b78b', band: '#8f927c', rivet: '#d1cba3', strap: '#806344', gold: '#f0d18d' };
const TREE = { bark: '#605b40', barkLight: '#9b9270', barkDark: '#303e31', leaf: ['#172f2c', '#244537', '#345e40', '#50764b', '#81905a'] };
const SKIN = '#c29660'; // SKIN_PALETTES 'honey' base
const GROUND = '#1b2a24';

type Vec = [number, number, number];
const materials = new Map<string, THREE.MeshLambertMaterial>();
function material(color: string, side: THREE.Side = THREE.FrontSide): THREE.MeshLambertMaterial {
  const key = `${color}:${side}`;
  let found = materials.get(key);
  if (!found) materials.set(key, found = new THREE.MeshLambertMaterial({ color, flatShading: true, side }));
  return found;
}
const carvedMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
const carvedDoubleMaterial = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
function hash(x: number, y: number, z: number): number {
  const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return v - Math.floor(v);
}
/** The hand-cut look of the reference sheets: welded corners jittered and every triangle tinted
 *  on its own, so a primitive reads as chiselled facets instead of a clean solid. */
function chisel(geometry: THREE.BufferGeometry, color: string, amount: number): THREE.BufferGeometry {
  const g = geometry.toNonIndexed();
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const base = new THREE.Color(color);
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    // Offsets come from the rounded original position, so every copy of a corner moves together.
    const x = Math.round(pos.getX(i) * 1e3) / 1e3, y = Math.round(pos.getY(i) * 1e3) / 1e3, z = Math.round(pos.getZ(i) * 1e3) / 1e3;
    pos.setXYZ(i, x + (hash(x, y, z) - .5) * 2 * amount, y + (hash(y, z, x) - .5) * 2 * amount, z + (hash(z, x, y) - .5) * 2 * amount);
  }
  for (let f = 0; f < pos.count / 3; f++) {
    const tone = 1 + (hash(f, f * .37, .5) - .5) * .3;
    for (let k = 0; k < 3; k++) colors.set([base.r * tone, base.g * tone, base.b * tone], (f * 3 + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
/** Add one faceted part; `at` is the part centre in art units, y up from the ground. */
function part(group: THREE.Group, geometry: THREE.BufferGeometry, color: string, at: Vec, rotation: Vec = [0, 0, 0]): THREE.Mesh {
  const carve = geometry.userData.carve as number | undefined;
  const mesh = carve ? new THREE.Mesh(chisel(geometry, color, carve), carvedMaterial) : new THREE.Mesh(geometry, material(color));
  mesh.position.set(...at);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const rock = (r: number, detail = 0) => new THREE.IcosahedronGeometry(r, detail);
const cone = (r: number, h: number, sides = 5) => new THREE.ConeGeometry(r, h, sides);
/** Tapered prism: the workhorse for limbs, trunks and plate, faceted by its side count. */
const taper = (top: number, bottom: number, h: number, sides = 6) => new THREE.CylinderGeometry(top, bottom, h, sides);
// Carved variants for the big masses: subdivided so `chisel` has corners to move.
const carve = <T extends THREE.BufferGeometry>(geometry: T, amount: number): T => { geometry.userData.carve = amount; return geometry; };
const mass = (r: number) => carve(new THREE.IcosahedronGeometry(r, 1), r * .11);
const slab = (w: number, h: number, d: number) => carve(new THREE.BoxGeometry(w, h, d, 2, 2, 2), Math.min(w, h, d) * .07);
const hewn = (top: number, bottom: number, h: number, sides = 6) => carve(new THREE.CylinderGeometry(top, bottom, h, sides, 3), Math.min(top, bottom) * .1);

/** Pivoted sub-assembly: parts inside are relative to a joint, so a limb can be posed. */
function joint(parent: THREE.Group, at: Vec, rotation: Vec = [0, 0, 0]): THREE.Group {
  const g = new THREE.Group();
  g.position.set(...at);
  g.rotation.set(...rotation);
  parent.add(g);
  return g;
}

/** The player in STARTER_OUTFIT: steel plate, leather boots, crimson cloak, starting sword. */
function player(): THREE.Group {
  const g = new THREE.Group();
  // Legs hang from the hips so the stance can be posed: one foot forward, knees turned out.
  for (const side of [-1, 1]) {
    const leg = joint(g, [side * 4.2, 21.6, 0], [side > 0 ? -.06 : .07, 0, side * .04]);
    part(leg, hewn(3.4, 4.4, 11, 5), LEATHER.shadow, [0, -5.5, 0]);
    part(leg, rock(2.5), STEEL.shadow, [0, -11.4, .4]);
    part(leg, taper(2.7, 3.4, 9.6, 5), LEATHER.base, [0, -16.4, .2]);
    part(leg, box(7, 2.6, 7), LEATHER.edge, [0, -15.6, .6]);
    part(leg, box(6.4, 3.8, 7.4), LEATHER.base, [0, -19.7, 1]);
    part(leg, box(5, 2.4, 3.6), LEATHER.edge, [0, -20.4, 5.4]);
    part(leg, box(6.8, 1.4, 8), LEATHER.shadow, [0, -21.4, 1.2]);
  }
  // Faulds and belt: the waist is the narrow point the plate flares out of.
  part(g, hewn(6.4, 8.6, 7.4, 6), STEEL.base, [0, 25.4, 0]);
  part(g, box(11.6, 2.4, 8.6), LEATHER.base, [0, 29.6, 0]);
  part(g, slab(8.2, 15, 1.4), CLOAK.base, [0, 21.6, 4.3]);
  part(g, box(8.4, 1.6, 1.6), CLOAK.trim, [0, 14.4, 4.3]);
  for (const x of [-2.2, 2.2]) part(g, cone(2.4, 4.4, 3), CLOAK.base, [x, 12.6, 4.3], [Math.PI, 0, 0]);
  part(g, box(3.6, 4.2, 3), LEATHER.shadow, [5.6, 28.4, 3]);
  part(g, box(3.6, 3.2, 1.6), STEEL.trim, [0, 29.6, 4.5]);
  // Cuirass: the widest plane at the chest, tapering into the waist.
  part(g, hewn(7.2, 4.9, 11.6, 6), STEEL.base, [0, 36.4, 0]);
  part(g, box(6.4, 7.4, 1.8), STEEL.edge, [0, 37.2, 4.4], [.12, 0, 0]);
  part(g, box(2.6, 17, 1.2), LEATHER.base, [0, 36.6, 4.8], [.1, 0, .58]);
  part(g, taper(4.6, 6.8, 3.4, 6), STEEL.edge, [0, 42.6, 0]);
  part(g, box(10.2, 2.2, 7.2), LEATHER.base, [0, 41.2, -.4]);
  for (const side of [-1, 1]) {
    // Pauldron: a flattened faceted cap, the shoulder's whole silhouette.
    const pauldron = part(g, mass(5.2), STEEL.edge, [side * 9, 42.2, 0], [0, side * .4, 0]);
    pauldron.scale.set(1, .76, 1);
    for (const [x, z, r] of [[6.4, 2.4, 3], [8.6, -1.2, 3.4], [4.2, -3.4, 2.8]] as Vec[]) {
      const fur = part(g, mass(r!), CLOAK.trim, [side * x!, 43.4, z!], [x! * .2, z!, 0]);
      fur.scale.set(1.1, .68, 1.1);
    }
    const arm = joint(g, [side * 9.4, 40.4, .6], [side > 0 ? -.16 : .12, 0, side * -.14]);
    part(arm, taper(2.5, 2.9, 9, 5), STEEL.base, [0, -4.6, 0]);
    part(arm, rock(2.2), STEEL.shadow, [0, -9.6, 0]);
    part(arm, taper(3, 2.5, 8.4, 5), STEEL.base, [0, -14, 0]);
    part(arm, taper(3.1, 2.8, 2.4, 5), LEATHER.base, [0, -16.4, 0]);
    if (side < 0) part(arm, box(4.2, 4, 4.6), LEATHER.edge, [0, -19.2, .6]);
    if (side > 0) {
      // Starting sword, gripped in the fist and raised: the pose and the weapon agree.
      const hand = joint(arm, [0, -19.2, .6], [-.22, 0, -.62]);
      part(hand, box(4.2, 4, 4.6), LEATHER.edge, [0, 0, 0]);
      part(hand, taper(1.4, 1.7, 5.6, 6), LEATHER.shadow, [0, 1.4, 0]);
      part(hand, rock(1.7), STEEL.trim, [0, -3.2, 0]);
      part(hand, box(8.4, 1.8, 2.4), STEEL.trim, [0, 3, 0]);
      part(hand, taper(.6, 2, 20, 4), STEEL.edge, [0, 13.8, 0]);
    }
  }
  part(g, taper(2.8, 3.2, 2.8, 6), SKIN, [0, 45.4, 0]);
  // Helm: faceted dome over a dark visor slit, cheeks carried down past the jaw.
  const head = joint(g, [0, 49.6, .2]);
  part(head, box(5, 4.4, 5.2), STEEL.shadow, [0, -1.2, -.4]);
  part(head, taper(3.6, 5.4, 7, 6), STEEL.base, [0, 2.4, 0]);
  part(head, cone(3.6, 3.4, 6), STEEL.edge, [0, 7, 0]);
  part(head, box(7.6, 1.8, 7.8), STEEL.edge, [0, -.6, 0]);
  part(head, box(5, 1.6, 1.2), '#101a1e', [0, 0, 3.6]);
  part(head, box(1.6, 5.4, 1.8), STEEL.base, [0, -1.8, 3.3]);
  for (const s of [-1, 1]) part(head, box(2.2, 5.2, 6), STEEL.shadow, [s * 2.9, -2.2, .4]);
  // Cloak: an open shell wrapping the back, hem cut into points at the calves.
  const cloak = new THREE.Mesh(chisel(new THREE.CylinderGeometry(7.6, 10.6, 29, 7, 4, true, Math.PI * .42, Math.PI * 1.16), CLOAK.base, .6), carvedDoubleMaterial);
  cloak.position.set(0, 28, -1.8);
  cloak.rotation.x = .05;
  g.add(cloak);
  for (const x of [-6.4, 0, 6.4]) part(g, cone(3.8, 7, 3), CLOAK.base, [x, 11.4, -6.4 - Math.abs(x) * .12], [Math.PI, x * .02, 0]);
  part(g, taper(8.2, 7.8, 3.2, 6), CLOAK.trim, [0, 42.6, -1.4]);
  for (const side of [-1, 1]) part(g, rock(2), CLOAK.highlight, [side * 6.8, 42.8, -1.8]);
  return g;
}

/** Goblin scavenger; `chief` is the 1.5x commander with pennant and bone trophy. */
function goblin(chief: boolean): THREE.Group {
  const g = new THREE.Group();
  const skin = chief ? GOBLIN.chief : GOBLIN.skin;
  // Bowed legs and oversized feet: the low stance the 2D gait reads as.
  for (const side of [-1, 1]) {
    const leg = joint(g, [side * 3, 13.4, .4], [0, 0, side * .16]);
    part(leg, hewn(3, 2.5, 6.6, 5), skin, [0, -3.4, 0]);
    part(leg, rock(2.1), GOBLIN.shade, [0, -7.2, .2]);
    part(leg, taper(2.4, 2.8, 6.4, 5), skin, [0, -10, .2]);
    part(leg, box(3.4, 1.8, 4.4), GOBLIN.bone, [0, -10.6, .4]);
    part(leg, box(4.6, 2.6, 6.4), GOBLIN.shade, [0, -12.6, 1.2]);
    part(leg, box(3.6, 1.6, 2.4), GOBLIN.edge, [0, -12.9, 4.8]);
  }
  // Hunched: the torso leans forward over the knees, with a shoulder hump behind it.
  const torso = joint(g, [0, 15.2, .4], [.36, 0, 0]);
  part(torso, hewn(3.1, 3.9, 9, 6), skin, [0, 4.6, 0]);
  part(torso, box(7.6, 4.8, 6.2), GOBLIN.cloth, [0, .6, 0]);
  part(torso, box(5, 5, 2.4), GOBLIN.cloth, [0, -2.4, 1.8], [.2, 0, 0]);
  const hump = part(torso, mass(4.2), skin, [0, 7.2, -1.8]);
  hump.scale.set(1.1, .74, .9);
  part(torso, box(8.6, 1.6, 6.6), GOBLIN.edge, [0, 7.8, 0], [0, 0, .14]);
  part(torso, box(1.8, 12, .9), GOBLIN.cloth, [0, 3.6, 3.2], [0, 0, .5]);
  for (const x of [-2, 0, 2]) part(torso, cone(1.6, 3.4, 3), GOBLIN.cloth, [x, -4.4, 1.8], [Math.PI, 0, 0]);
  for (const side of [-1, 1]) {
    part(torso, rock(2.2), skin, [side * 4.6, 7.4, 0]);
    const arm = joint(torso, [side * 5.4, 6.6, .4], [side > 0 ? -.4 : -.2, 0, side * -.3]);
    part(arm, taper(1.5, 1.8, 6.4, 5), skin, [0, -3.2, 0]);
    part(arm, rock(1.5), GOBLIN.shade, [0, -6.6, 0]);
    part(arm, taper(1.9, 1.6, 6, 5), skin, [0, -9.6, 0]);
    part(arm, rock(2.1), skin, [0, -13, .4]);
    if (side > 0) {
      // Scrap blade: a chipped wedge gripped in the fist, not a forged edge.
      const fist = joint(arm, [0, -13, .4], [-.2, 0, -.55]);
      part(fist, taper(1.3, 1.5, 3.6, 5), GOBLIN.grip, [0, 0, 0]);
      part(fist, box(3.4, 1.4, 1.6), GOBLIN.cloth, [0, 2, 0]);
      const blade = part(fist, taper(.9, 2.2, 13, 3), GOBLIN.steel, [0, 8.6, 0], [0, .4, 0]);
      blade.scale.set(1, 1, .42);
    }
  }
  // Head: wide jaw, sloped crown, ears swept up and back as flat blades.
  const head = joint(g, [0, 24.4, 1.8], [0, 0, 0]);
  head.scale.setScalar(1.46);
  part(head, hewn(2.6, 4.1, 5.6, 6), skin, [0, 0, 0], [.12, 0, 0]);
  part(head, box(4.8, 2.6, 3.6), skin, [0, -1.4, 2.4]);
  part(head, box(4.4, 1, 1.2), GOBLIN.bone, [0, -.4, 3.5]);
  part(head, box(1.1, 1.4, .9), GOBLIN.bone, [0, -2.2, 3], [0, 0, .2]);
  for (const side of [-1, 1]) part(head, cone(.55, 2.2, 3), GOBLIN.bone, [side * 1.5, -1.4, 3], [.2, 0, side * .12]);
  for (const side of [-1, 1]) {
    part(head, box(1.4, 1, 1), GOBLIN.eye, [side * 1.4, 1.5, 2.6]);
    part(head, box(2.2, .5, 1.4), GOBLIN.shade, [side * 1.4, 2.4, 2.4], [0, 0, side * .3]);
    const ear = part(head, cone(1.3, 5.8, 3), GOBLIN.edge, [side * 3.2, 2.2, -.8], [-.26, 0, side * .5]);
    ear.scale.set(1, 1, .44);
  }
  if (chief) {
    part(g, taper(.5, .7, 26, 4), GOBLIN.pole, [-5.4, 26, -3.2], [0, 0, .08]);
    const flag = new THREE.Mesh(box(11, 7, .5), material(GOBLIN.banner, THREE.DoubleSide));
    flag.position.set(-10.6, 34.4, -3.2);
    flag.rotation.y = -.22;
    g.add(flag);
    part(g, rock(2), GOBLIN.bone, [-4.6, 29.6, -3.2]);
    part(g, box(1.2, 4.4, 1.2), GOBLIN.bone, [-4.6, 25.4, -3.2], [0, 0, .3]);
    g.scale.setScalar(1.5);
  }
  return g;
}

/** Surface cache / dungeon chest, in the ChestArt silhouette. */
function chest(open: boolean): THREE.Group {
  const g = new THREE.Group();
  part(g, slab(48, 17, 30), CHEST.body, [0, 9, 0]);
  part(g, box(49.4, 2.6, 31.4), CHEST.dark, [0, 1.3, 0]);
  // A visible interior: the hollow a BoxGeometry alone never shows once opened.
  part(g, box(43, 13, 25), CHEST.dark, [0, 11.2, 0]);
  part(g, box(42, 1.6, 24), CHEST.strap, [0, 5.4, 0]);
  for (const side of [-1, 1]) {
    part(g, box(3.6, 18.4, 31.6), CHEST.band, [side * 14, 9, 0]);
    for (const y of [4.4, 13.4]) part(g, box(4.2, 1.8, 1.8), CHEST.rivet, [side * 14, y, 15.9]);
  }
  for (const y of [5.6, 12.4]) part(g, box(44, 1.2, 31.2), CHEST.strap, [0, y, 0]);
  // Lid pivots on the back top edge, exactly as the 2D lift animation implies.
  const hinge = new THREE.Group();
  const shell = new THREE.Mesh(chisel(new THREE.CylinderGeometry(15, 15, 48, 4, 3, false, 0, Math.PI), CHEST.lid, .5), carvedMaterial);
  shell.rotation.set(0, 0, Math.PI / 2);
  shell.scale.set(.62, 1, 1);
  hinge.add(shell);
  part(hinge, box(48.4, 2.2, 20), CHEST.lidTop, [0, 5.6, 0]);
  part(hinge, box(49.6, 1.4, 5), CHEST.rim, [0, 8.2, 0]);
  for (const side of [-1, 1]) part(hinge, box(4, 2.4, 31.4), CHEST.band, [side * 14, 5.8, 0]);
  hinge.position.set(0, 17.4, -15);
  if (open) {
    hinge.rotation.x = -1.32;
    // Coin mound: flat discs stacked to a peak, the burst the 2D art fires on open.
    for (let i = 0; i < 16; i++) {
      const a = i * 2.4, spread = 3 + (i % 4) * 3.4;
      part(g, taper(2.9, 2.9, 1.2, 6), CHEST.gold, [Math.cos(a) * spread, 17.2 + (i % 5) * 1.7, Math.sin(a) * spread * .6], [Math.sin(a) * .35, a, Math.cos(a) * .3]);
    }
    part(g, rock(3.8), CHEST.gold, [0, 24.6, 0]);
  } else {
    part(g, box(9, 11, 3.2), CHEST.gold, [0, 14.4, 15.6]);
    part(g, box(2.2, 4.4, 2.4), '#253036', [0, 13.4, 17]);
  }
  g.add(hinge);
  return g;
}

/** Forest tree, the `tree` kind from tree-art.ts (144x174 in 2D). */
function tree(): THREE.Group {
  const g = new THREE.Group();
  part(g, carve(new THREE.CylinderGeometry(6, 15, 98, 6, 6), 1.4), TREE.bark, [0, 49, 0], [0, .4, .03]);
  part(g, taper(3, 5.5, 30, 5), TREE.barkDark, [13, 80, 2], [0, 0, -.62]);
  part(g, taper(2.6, 4.6, 26, 5), TREE.bark, [-12, 74, -4], [0, 0, .58]);
  for (const side of [-1, 1]) part(g, taper(3, 9, 12, 5), TREE.barkDark, [side * 8, 5, side * 3], [0, 0, -side * .5]);
  // Canopy: a few broad flattened masses, the light ones stacked on top of the dark.
  const clumps: Array<[number, number, number, number, number]> = [
    [0, 116, 0, 42, 0], [-30, 106, 14, 30, 1], [32, 110, -12, 31, 1],
    [4, 142, -6, 30, 3], [-20, 134, 16, 22, 2], [26, 132, 14, 21, 2],
    [-6, 158, -12, 17, 4], [14, 156, 8, 14, 4],
  ];
  for (const [x, y, z, r, leaf] of clumps) {
    const clump = part(g, mass(r), TREE.leaf[leaf]!, [x, y, z], [x * .04, y * .05, z * .04]);
    clump.scale.set(1.12, .78, 1.12);
  }
  part(g, taper(4, 12, 10, 6), TREE.barkLight, [0, 3, 0]);
  return g;
}

const SUBJECTS: Array<{ label: string; build: () => THREE.Group; width: number }> = [
  { label: 'Player · STARTER_OUTFIT', build: player, width: 34 },
  { label: 'Goblin', build: () => goblin(false), width: 26 },
  { label: 'Goblin chief', build: () => goblin(true), width: 42 },
  { label: 'Chest · closed', build: () => chest(false), width: 52 },
  { label: 'Chest · open', build: () => chest(true), width: 52 },
  { label: 'Tree', build: tree, width: 96 },
];
const GAP = 26;
/** Lay the row out on true relative scale: nothing is normalized to a common height. */
const OFFSETS = SUBJECTS.reduce<number[]>((acc, subject, index) => {
  const previous = index ? acc[index - 1]! + SUBJECTS[index - 1]!.width / 2 + GAP + subject.width / 2 : 0;
  acc.push(previous);
  return acc;
}, []);
const SPAN = OFFSETS[OFFSETS.length - 1]! + SUBJECTS[0]!.width / 2 + SUBJECTS[SUBJECTS.length - 1]!.width / 2;
const CENTER = OFFSETS[OFFSETS.length - 1]! / 2;

function row(scene: THREE.Scene, treeDepth: number): THREE.Group[] {
  const stands: THREE.Group[] = SUBJECTS.map((subject, index) => {
    const stand = new THREE.Group();
    stand.add(subject.build());
    stand.position.x = OFFSETS[index]! - CENTER;
    scene.add(stand);
    return stand;
  });
  // A tree is four times a character's height. Set back, perspective shrinks it to
  // where it frames the row instead of dwarfing it; the game view keeps it in line.
  stands[stands.length - 1]!.position.z = treeDepth;
  stands[stands.length - 1]!.position.x -= treeDepth * .34;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), material(GROUND));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.1;
  scene.add(ground);
  scene.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) { object.castShadow = true; object.receiveShadow = true; }
  });
  ground.castShadow = false;
  scene.add(new THREE.AmbientLight('#7489a0', 1.8));
  const key = new THREE.DirectionalLight('#fff2d6', 2.7);
  key.position.set(-380, 620, 480);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -.0012;
  key.shadow.normalBias = .6;
  const frustum = key.shadow.camera;
  frustum.left = -SPAN * .9; frustum.right = SPAN * .9;
  frustum.top = 430; frustum.bottom = -430; frustum.near = 1; frustum.far = 2000;
  frustum.updateProjectionMatrix();
  scene.add(key);
  const rim = new THREE.DirectionalLight('#5d90cd', .85);
  rim.position.set(210, 90, -240);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight('#8fa9bd', GROUND, .7));
  return stands;
}

const canvas = document.getElementById('review') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setClearColor('#0b1016');
renderer.setScissorTest(true);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const heroScene = new THREE.Scene();
heroScene.fog = new THREE.Fog('#0b1016', 950, 2600);
const heroStands = row(heroScene, -560);
const HERO_FOV = 24;
const heroCamera = new THREE.PerspectiveCamera(HERO_FOV, 1, 1, 3000);

// The second row uses the real game projection: orthographic, one world unit per
// CSS pixel at zoom 1.25, so every subject appears at its true on-screen size.
const GAME_ZOOM = 1.25;
const gameScene = new THREE.Scene();
row(gameScene, 0);
const gameCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -900, 900);
gameCamera.position.set(0, 260, 340);
gameCamera.lookAt(0, 52, 0);

const overlay = document.createElement('div');
overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;font:12px/1.4 ui-monospace,monospace;color:#c8d6e2';
document.body.appendChild(overlay);
function caption(text: string, css: string): HTMLDivElement {
  const node = document.createElement('div');
  node.textContent = text;
  node.style.cssText = `position:absolute;white-space:nowrap;transform:translateX(-50%);${css}`;
  overlay.appendChild(node);
  return node;
}
caption('HERO VIEW — 3/4 angle, true relative scale, as in the reference art', 'left:50%;top:18px;opacity:.85');
const heroLabels = SUBJECTS.map((subject) => caption(subject.label, 'opacity:.6;font-size:11px'));
const gameCaption = caption('IN-GAME VIEW — real camera projection, true on-screen size', 'left:50%;opacity:.85');

const place = new THREE.Vector3();
function frame(time: number): void {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * devicePixelRatio)) {
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(width, height, false);
  }
  const heroHeight = Math.round(height * .55), gameHeight = height - heroHeight;

  for (const stand of heroStands) stand.rotation.y = time / 5200;
  heroCamera.aspect = width / heroHeight;
  const half = Math.tan(HERO_FOV * Math.PI / 360);
  const distance = Math.max(SPAN / 2 / heroCamera.aspect, 70) / half + 30;
  heroCamera.position.set(0, 52, distance);
  heroCamera.lookAt(0, 34, 0);
  heroCamera.updateProjectionMatrix();
  renderer.setViewport(0, gameHeight, width, heroHeight);
  renderer.setScissor(0, gameHeight, width, heroHeight);
  renderer.render(heroScene, heroCamera);

  heroStands.forEach((stand, index) => {
    place.copy(stand.position).project(heroCamera);
    heroLabels[index]!.style.left = `${(place.x + 1) / 2 * width}px`;
    heroLabels[index]!.style.top = `${Math.min(heroHeight - 18, (1 - place.y) / 2 * heroHeight + 14)}px`;
  });

  const halfHeight = gameHeight / 2 / GAME_ZOOM, halfWidth = width / 2 / GAME_ZOOM;
  gameCamera.left = -halfWidth; gameCamera.right = halfWidth;
  gameCamera.top = halfHeight; gameCamera.bottom = -halfHeight;
  gameCamera.updateProjectionMatrix();
  renderer.setViewport(0, 0, width, gameHeight);
  renderer.setScissor(0, 0, width, gameHeight);
  renderer.render(gameScene, gameCamera);
  gameCaption.style.top = `${heroHeight + 14}px`;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
