import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterSheet, generateItem, ITEM_KINDS } from '../src/items.ts';
import { itemIconSVG, itemDropShapes, itemPackIconSVG, outfitFromEquipment } from '../src/item-art.ts';
import { WEAPON_PROFILES, SHIELD_PROFILES } from '../src/weapon-content.ts';
import { CHARM_SIZES } from '../src/charm-content.ts';
import { armorShapes } from '../src/armor-shapes.ts';
import { focusShapes } from '../src/focus-shapes.ts';
import { shieldShapes, weaponShapes } from '../src/weapon-shapes.ts';

test('every equipment family generates distinct vector art without external resources', () => {
  const icons = ITEM_KINDS.map(kind => itemIconSVG(generateItem(419, 1, kind)));
  assert.equal(new Set(icons).size, ITEM_KINDS.length);
  for (const icon of icons) {
    assert.ok(icon.startsWith('<svg ')); assert.ok(icon.endsWith('</svg>'));
    assert.ok(!/<image|href=|data:|NaN|Infinity/.test(icon));
    assert.match(icon, /viewBox="0 0 48 48"/);
  }
});

test('icon metadata and material attributes cannot inject markup', () => {
  const item = generateItem(4, 1, 'head');
  item.name = '<script>alert("x")</script>'; item.id = '"><svg/onload=alert(1)';
  item.appearance.base = '" onload="alert(1)';
  const icon = itemIconSVG(item, Infinity);
  assert.ok(!icon.includes('<script>')); assert.ok(!icon.includes(' onload='));
  assert.match(icon, /width="48"/); assert.ok(icon.includes('&lt;script&gt;'));
});

test('equipped art follows actual material changes and empties all removed layers explicitly', () => {
  const sheet = createCharacterSheet(), before = outfitFromEquipment(sheet);
  assert.ok(before.head && before.chest && before.shoulders && before.hands && before.cloak);
  const chest = generateItem(819, 3, 'chest'); sheet.equipped.chest = chest;
  const after = outfitFromEquipment(sheet);
  assert.equal(after.chest!.material.base, chest.appearance.base);
  assert.equal(after.shoulders!.material.base, chest.appearance.base);
  chest.appearance.base = '#000000';
  assert.notEqual(after.chest!.material.base, '#000000');
  sheet.equipped.chest = null; sheet.equipped.cloak = null;
  const unequipped = outfitFromEquipment(sheet);
  assert.equal(unequipped.chest, null); assert.equal(unequipped.shoulders, null); assert.equal(unequipped.cloak, null);
  assert.ok(unequipped.head);
});

test('ground gear has bounded profile-specific geometry cached only for its item lifetime', () => {
  const items = [...ITEM_KINDS.map(kind => generateItem(819, 3, kind)),
    ...WEAPON_PROFILES.map(profile => generateItem(819, 3, 'weapon', profile.id)),
    ...SHIELD_PROFILES.map(profile => generateItem(819, 3, 'shield', profile.id))];
  for (const item of items) {
    const shapes = itemDropShapes(item);
    assert.ok(shapes.length > 0 && shapes.length < 100, `${item.name} has bounded procedural geometry`);
    assert.equal(itemDropShapes(item), shapes, 'unchanged field loot does not regenerate every frame');
    for (const shape of shapes) for (const [x, y] of shape.points) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y));
      assert.ok(Math.abs(x) <= 11.001 && Math.abs(y) <= 11.001, 'every family fits the drop presentation envelope');
    }
  }
  const weapons = WEAPON_PROFILES.map(profile => itemDropShapes(generateItem(819, 3, 'weapon', profile.id)));
  assert.equal(new Set(weapons.map(shapes => JSON.stringify(shapes.map(shape => shape.points)))).size, WEAPON_PROFILES.length,
    'every weapon profile retains its actual silhouette on the ground');
});

test('helmet and cuirass icons reuse the actual equipped plate geometry', () => {
  for (const kind of ['head', 'chest'] as const) {
    const item = generateItem(8901, 7, kind), { style, base, shadow, edge, trim } = item.appearance;
    const actual = armorShapes(kind, { style, seed: item.seed, material: { base, shadow, edge, trim } });
    for (const size of [48, 120]) {
      const icon = itemIconSVG(item, size);
      for (const shape of actual.filter(shape => size >= 96 || !shape.fine)) {
        const points = shape.points.map(p => p.map(v => Math.round(v * 100) / 100).join(',')).join(' ');
        assert.ok(icon.includes(`points="${points}"`), `${kind} icon preserves its mounted geometry at ${size}px`);
      }
    }
  }
});

test('only weapons, shields and charms tilt inside a pack cell; every other kind stays upright', () => {
  const tilt = (item: Parameters<typeof itemPackIconSVG>[0]) => {
    const icon = itemPackIconSVG(item, 1, 1);
    const degrees = /rotate\((-?[\d.]+)\)/.exec(icon);
    assert.ok(degrees, `${item.name} packs a rotation`);
    return Number(degrees![1]);
  };
  for (const kind of ITEM_KINDS) {
    if (kind === 'weapon' || kind === 'shield' || kind === 'charm') continue;
    for (const seed of [17, 419, 8901]) assert.equal(tilt(generateItem(seed, 3, kind)), 0, `${kind} packs upright`);
  }
  for (const size of CHARM_SIZES) {
    // A stone only keeps the turn when it actually fits larger, so an elongated class turns on
    // most seeds rather than every one; a pebble has no seed that gains anything by turning.
    const tilts = [17, 419, 8901].map(seed => tilt(generateItem(seed, 3, 'charm', `jade-${size.id}`)));
    if (size.id === 'pebble') assert.ok(tilts.every(degrees => degrees === 0), 'a square pebble has nothing to gain by turning');
    else assert.ok(tilts.some(degrees => degrees < 0), `an elongated ${size.id} turns toward the diagonal`);
  }
  for (const profile of WEAPON_PROFILES) {
    const item = generateItem(419, 3, 'weapon', profile.id);
    assert.equal(tilt(item), item.weapon?.family === 'bow' ? -34 : -52, `${profile.id} keeps its authored tilt`);
  }
  assert.ok(SHIELD_PROFILES.some(profile => tilt(generateItem(419, 3, 'shield', profile.id)) < 0),
    'elongated shields still turn toward the diagonal');
});

test('no kind ever packs smaller than it would upright', () => {
  // The tilt angle is picked from the upright aspect alone, so a near-square silhouette can be
  // turned past its own optimum. Every kind and every charm size class is swept because that is
  // a property of the formula, not of any one kind.
  //
  // Only the drawn SVG is read. Its polygon points are the untilted silhouette — the rotate()
  // sits inside the transform, after the scale — so rotating them by 0 and by the emitted angle
  // reproduces both boxes the module weighed. Every cell draws scale(CELL / largest extent) for
  // one CELL shared by the whole sweep (asserted below), so the drawn scale beats the upright one
  // exactly when the tilted box is no larger, and CELL cancels out of that comparison.
  //
  // Points are emitted rounded to 2dp, so a measured extent misses the real one by up to .01
  // across the box, and this sweep — fixed seeds, no randomness — shows a worst ratio error of
  // .03% against the module's own arithmetic. The .1% tolerance below sits 3x above that and 5x
  // under the regression it exists to catch: dropping the tiebreak in `itemPackIconSVG` packs
  // charm heart at seed 419 to .50% under upright, and seed 0 — where the sweep trips first — to
  // .41%. Silhouettes stay 11 units or wider (asserted) so the rounding stays this small.
  const TOLERANCE = .001;
  const packPoints = (svg: string) => [...svg.matchAll(/points="([^"]+)"/g)]
    .flatMap(match => match[1].trim().split(' ').map(pair => pair.split(',').map(Number) as [number, number]));
  const extent = (points: readonly [number, number][], degrees: number) => {
    const angle = degrees * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
    const xs = points.map(([x, y]) => x * cos - y * sin), ys = points.map(([x, y]) => x * sin + y * cos);
    return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  };
  const cases = (seed: number) => [
    ...ITEM_KINDS.map(kind => [kind, generateItem(seed, 3, kind)] as const),
    ...CHARM_SIZES.map(size => [`charm ${size.id}`, generateItem(seed, 3, 'charm', `jade-${size.id}`)] as const),
  ];
  const turned = new Set<string>();
  let smallestCell = Infinity, largestCell = 0;
  for (let seed = 0; seed < 300; seed++) for (const [label, item] of cases(seed)) {
    const svg = itemPackIconSVG(item, 1, 1);
    const degrees = Number(/rotate\((-?[\d.]+)\)/.exec(svg)![1]);
    const scale = Number(/scale\((-?[\d.e+-]+)\)/.exec(svg)![1]);
    assert.ok(Number.isFinite(scale) && scale > 0, `${label} seed ${seed} fits a real scale`);
    const points = packPoints(svg), upright = extent(points, 0), drawn = extent(points, degrees);
    // Both extents clear the 1-unit floor the fit clamps at, so the ratio below is the whole fit.
    assert.ok(upright >= 11 && drawn > 1, `${label} seed ${seed} spans ${upright} upright and ${drawn} as drawn`);
    assert.ok(upright / drawn >= 1 - TOLERANCE, `${label} seed ${seed} packs ${upright / drawn} of its upright size`);
    smallestCell = Math.min(smallestCell, scale * drawn); largestCell = Math.max(largestCell, scale * drawn);
    if (degrees !== 0) turned.add(label);
  }
  assert.ok(largestCell / smallestCell - 1 <= TOLERANCE, `every cell fits its drawn box into the same ${smallestCell} box`);
  // The sweep is worthless unless it reaches the kinds that actually tilt.
  for (const label of ['weapon', 'shield', 'charm', 'charm shard', 'charm tablet', 'charm spire', 'charm heart', 'charm monolith'])
    assert.ok(turned.has(label), `the sweep exercises a tilted ${label}`);
});

test('fitted icon kinds fill a comparable share of the icon box at every seed', () => {
  // Guards the regression where per-kind down-weights tuned for tall multi-cell pack
  // footprints left a dagger or an orb reading ~60% of the box beside 75-84% armour.
  const extent = (shapes: readonly { points: readonly (readonly [number, number])[] }[], degrees: number) => {
    const angle = degrees * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
    const points = shapes.flatMap(shape => shape.points.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos]));
    const xs = points.map(p => p[0]!), ys = points.map(p => p[1]!);
    return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  };
  for (const seed of [3, 101, 419, 5150, 31337]) {
    for (const kind of ['weapon', 'shield', 'grimoire', 'orb'] as const) {
      const item = generateItem(seed, 5, kind);
      const scale = Number(/scale\(([-\d.e]+)\)/.exec(itemIconSVG(item))![1]);
      const degrees = kind === 'weapon' ? (item.weapon!.visual.kind === 'bow' ? -18 : -52) : 0;
      const shapes = kind === 'weapon' ? weaponShapes(item.weapon!.visual)
        : kind === 'shield' ? shieldShapes(item.shield!.visual) : focusShapes(item.focus!.visual);
      const fill = scale * extent(shapes, degrees) / 48;
      assert.ok(fill > .74 && fill < .86, `${kind} seed ${seed} fills ${(fill * 100).toFixed(0)}% of the icon box`);
    }
  }
});
