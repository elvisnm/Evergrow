import test from 'node:test';
import assert from 'node:assert/strict';
import { generateItem } from '../src/items.ts';
import { CHARM_PROFILES, CHARM_SIZES, charmAffixCount } from '../src/charm-content.ts';
import { itemFootprint } from '../src/inventory-grid.ts';

const TIERS = ['common', 'magic', 'rare', 'epic', 'legendary'] as const;
const AUTHORED_SIZES: Readonly<Record<string, readonly [number, number]>> = Object.freeze({
  pebble: [1, 1], shard: [1, 2], tablet: [2, 2], spire: [1, 3], heart: [2, 3], monolith: [2, 4],
});
const digest = (profileId: string, tier: string, seed: number) => {
  const item = generateItem(seed, 20, 'charm', profileId, tier as typeof TIERS[number]);
  return [profileId, tier, seed, item.affixes.length,
    item.affixes.map(a => `${a.name}:${a.stat}:${a.value}`).join(','), item.name, item.requiredLevel].join('|');
};

/** Captured on the pre-uniform tree, re-baselined after the upstream affix-quality merge: all 36 charm profiles x 5 tiers x seeds 0-7 at level 20,
 * as `profileId|tier|seed|affixCount|name:stat:value,...|itemName|requiredLevel`. Charm balance
 * reads the authored size CLASS, never the spatial footprint, so every row must stay identical
 * however itemFootprint() changes. */
const BEFORE = `ember-pebble|common|0|1|Cinderskin:fireResistance:3|Ember Pebble|18
ember-pebble|common|1|1|The Hart:maxHp:16|Ember Pebble|18
ember-pebble|common|2|1|The Hart:maxHp:15|Ember Pebble|18
ember-pebble|common|3|1|Cinderskin:fireResistance:4|Ember Pebble|18
ember-pebble|common|4|1|Cinderskin:fireResistance:3|Ember Pebble|18
ember-pebble|common|5|1|The Hart:maxHp:8|Ember Pebble|18
ember-pebble|common|6|1|Cinderskin:fireResistance:3|Ember Pebble|18
ember-pebble|common|7|1|The Hart:maxHp:12|Ember Pebble|18
ember-pebble|magic|0|1|Cinderskin:fireResistance:3|Ember Pebble|18
ember-pebble|magic|1|1|The Hart:maxHp:17|Ember Pebble|18
ember-pebble|magic|2|1|The Hart:maxHp:16|Ember Pebble|18
ember-pebble|magic|3|1|Cinderskin:fireResistance:4|Ember Pebble|18
ember-pebble|magic|4|1|Cinderskin:fireResistance:3|Ember Pebble|18
ember-pebble|magic|5|1|The Hart:maxHp:9|Ember Pebble|18
ember-pebble|magic|6|1|Cinderskin:fireResistance:4|Ember Pebble|18
ember-pebble|magic|7|1|The Hart:maxHp:13|Ember Pebble|18
ember-pebble|rare|0|2|Cinderskin:fireResistance:4,Haste:attackSpeedPercent:2|Ember Pebble|18
ember-pebble|rare|1|2|The Hart:maxHp:19,Stormward:lightningResistance:4|Ember Pebble|18
ember-pebble|rare|2|2|The Hart:maxHp:18,Haste:attackSpeedPercent:2|Ember Pebble|18
ember-pebble|rare|3|2|Cinderskin:fireResistance:4,Invocation:castSpeedPercent:2|Ember Pebble|18
ember-pebble|rare|4|2|Cinderskin:fireResistance:3,Haste:attackSpeedPercent:1|Ember Pebble|18
ember-pebble|rare|5|2|The Hart:maxHp:10,Invocation:castSpeedPercent:2|Ember Pebble|18
ember-pebble|rare|6|2|Cinderskin:fireResistance:4,Vigor:vitality:1|Ember Pebble|18
ember-pebble|rare|7|2|The Hart:maxHp:14,Sanctuary:allResistance:1|Ember Pebble|18
ember-pebble|epic|0|2|Cinderskin:fireResistance:4,Haste:attackSpeedPercent:2|Ember Pebble|18
ember-pebble|epic|1|2|The Hart:maxHp:21,Stormward:lightningResistance:5|Ember Pebble|18
ember-pebble|epic|2|2|The Hart:maxHp:20,Haste:attackSpeedPercent:2|Ember Pebble|18
ember-pebble|epic|3|2|Cinderskin:fireResistance:5,Invocation:castSpeedPercent:2|Ember Pebble|18
ember-pebble|epic|4|2|Cinderskin:fireResistance:3,Haste:attackSpeedPercent:1|Ember Pebble|18
ember-pebble|epic|5|2|The Hart:maxHp:11,Invocation:castSpeedPercent:2|Ember Pebble|18
ember-pebble|epic|6|2|Cinderskin:fireResistance:4,Vigor:vitality:2|Ember Pebble|18
ember-pebble|epic|7|2|The Hart:maxHp:16,Sanctuary:allResistance:1|Ember Pebble|18
ember-pebble|legendary|0|2|Cinderskin:fireResistance:5,Haste:attackSpeedPercent:2|Ember Pebble|18
ember-pebble|legendary|1|2|The Hart:maxHp:24,Stormward:lightningResistance:5|Ember Pebble|18
ember-pebble|legendary|2|2|The Hart:maxHp:22,Haste:attackSpeedPercent:2|Ember Pebble|18
ember-pebble|legendary|3|2|Cinderskin:fireResistance:6,Invocation:castSpeedPercent:2|Ember Pebble|18
ember-pebble|legendary|4|2|Cinderskin:fireResistance:4,Haste:attackSpeedPercent:1|Ember Pebble|18
ember-pebble|legendary|5|2|The Hart:maxHp:13,Invocation:castSpeedPercent:2|Ember Pebble|18
ember-pebble|legendary|6|2|Cinderskin:fireResistance:5,Vigor:vitality:2|Ember Pebble|18
ember-pebble|legendary|7|2|The Hart:maxHp:18,Sanctuary:allResistance:1|Ember Pebble|18
rime-pebble|common|0|1|Rimeward:frostResistance:3|Rime Pebble|18
rime-pebble|common|1|1|The Wellspring:maxMana:6|Rime Pebble|18
rime-pebble|common|2|1|The Wellspring:maxMana:6|Rime Pebble|18
rime-pebble|common|3|1|Rimeward:frostResistance:4|Rime Pebble|18
rime-pebble|common|4|1|Rimeward:frostResistance:3|Rime Pebble|18
rime-pebble|common|5|1|The Wellspring:maxMana:3|Rime Pebble|18
rime-pebble|common|6|1|Rimeward:frostResistance:3|Rime Pebble|18
rime-pebble|common|7|1|The Wellspring:maxMana:5|Rime Pebble|18
rime-pebble|magic|0|1|Rimeward:frostResistance:3|Rime Pebble|18
rime-pebble|magic|1|1|The Wellspring:maxMana:7|Rime Pebble|18
rime-pebble|magic|2|1|The Wellspring:maxMana:6|Rime Pebble|18
rime-pebble|magic|3|1|Rimeward:frostResistance:4|Rime Pebble|18
rime-pebble|magic|4|1|Rimeward:frostResistance:3|Rime Pebble|18
rime-pebble|magic|5|1|The Wellspring:maxMana:4|Rime Pebble|18
rime-pebble|magic|6|1|Rimeward:frostResistance:4|Rime Pebble|18
rime-pebble|magic|7|1|The Wellspring:maxMana:5|Rime Pebble|18
rime-pebble|rare|0|2|Rimeward:frostResistance:4,Haste:attackSpeedPercent:2|Rime Pebble|18
rime-pebble|rare|1|2|The Wellspring:maxMana:7,Stormward:lightningResistance:4|Rime Pebble|18
rime-pebble|rare|2|2|The Wellspring:maxMana:7,Haste:attackSpeedPercent:2|Rime Pebble|18
rime-pebble|rare|3|2|Rimeward:frostResistance:4,Invocation:castSpeedPercent:2|Rime Pebble|18
rime-pebble|rare|4|2|Rimeward:frostResistance:3,Haste:attackSpeedPercent:1|Rime Pebble|18
rime-pebble|rare|5|2|The Wellspring:maxMana:4,Invocation:castSpeedPercent:2|Rime Pebble|18
rime-pebble|rare|6|2|Rimeward:frostResistance:4,Vigor:vitality:1|Rime Pebble|18
rime-pebble|rare|7|2|The Wellspring:maxMana:6,Sanctuary:allResistance:1|Rime Pebble|18
rime-pebble|epic|0|2|Rimeward:frostResistance:4,Haste:attackSpeedPercent:2|Rime Pebble|18
rime-pebble|epic|1|2|The Wellspring:maxMana:8,Stormward:lightningResistance:5|Rime Pebble|18
rime-pebble|epic|2|2|The Wellspring:maxMana:8,Haste:attackSpeedPercent:2|Rime Pebble|18
rime-pebble|epic|3|2|Rimeward:frostResistance:5,Invocation:castSpeedPercent:2|Rime Pebble|18
rime-pebble|epic|4|2|Rimeward:frostResistance:3,Haste:attackSpeedPercent:1|Rime Pebble|18
rime-pebble|epic|5|2|The Wellspring:maxMana:4,Invocation:castSpeedPercent:2|Rime Pebble|18
rime-pebble|epic|6|2|Rimeward:frostResistance:4,Vigor:vitality:2|Rime Pebble|18
rime-pebble|epic|7|2|The Wellspring:maxMana:6,Sanctuary:allResistance:1|Rime Pebble|18
rime-pebble|legendary|0|2|Rimeward:frostResistance:5,Haste:attackSpeedPercent:2|Rime Pebble|18
rime-pebble|legendary|1|2|The Wellspring:maxMana:9,Stormward:lightningResistance:5|Rime Pebble|18
rime-pebble|legendary|2|2|The Wellspring:maxMana:9,Haste:attackSpeedPercent:2|Rime Pebble|18
rime-pebble|legendary|3|2|Rimeward:frostResistance:6,Invocation:castSpeedPercent:2|Rime Pebble|18
rime-pebble|legendary|4|2|Rimeward:frostResistance:4,Haste:attackSpeedPercent:1|Rime Pebble|18
rime-pebble|legendary|5|2|The Wellspring:maxMana:5,Invocation:castSpeedPercent:2|Rime Pebble|18
rime-pebble|legendary|6|2|Rimeward:frostResistance:5,Vigor:vitality:2|Rime Pebble|18
rime-pebble|legendary|7|2|The Wellspring:maxMana:7,Sanctuary:allResistance:1|Rime Pebble|18
storm-pebble|common|0|1|Stormward:lightningResistance:3|Storm Pebble|18
storm-pebble|common|1|1|Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|common|2|1|Invocation:castSpeedPercent:2|Storm Pebble|18
storm-pebble|common|3|1|Stormward:lightningResistance:4|Storm Pebble|18
storm-pebble|common|4|1|Stormward:lightningResistance:3|Storm Pebble|18
storm-pebble|common|5|1|Invocation:castSpeedPercent:1|Storm Pebble|18
storm-pebble|common|6|1|Stormward:lightningResistance:3|Storm Pebble|18
storm-pebble|common|7|1|Invocation:castSpeedPercent:1|Storm Pebble|18
storm-pebble|magic|0|1|Stormward:lightningResistance:3|Storm Pebble|18
storm-pebble|magic|1|1|Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|magic|2|1|Invocation:castSpeedPercent:2|Storm Pebble|18
storm-pebble|magic|3|1|Stormward:lightningResistance:4|Storm Pebble|18
storm-pebble|magic|4|1|Stormward:lightningResistance:3|Storm Pebble|18
storm-pebble|magic|5|1|Invocation:castSpeedPercent:1|Storm Pebble|18
storm-pebble|magic|6|1|Stormward:lightningResistance:4|Storm Pebble|18
storm-pebble|magic|7|1|Invocation:castSpeedPercent:2|Storm Pebble|18
storm-pebble|rare|0|2|Stormward:lightningResistance:4,Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|rare|1|2|Haste:attackSpeedPercent:2,Stormward:lightningResistance:4|Storm Pebble|18
storm-pebble|rare|2|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:6|Storm Pebble|18
storm-pebble|rare|3|2|Stormward:lightningResistance:4,Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|rare|4|2|Stormward:lightningResistance:3,Haste:attackSpeedPercent:1|Storm Pebble|18
storm-pebble|rare|5|2|Invocation:castSpeedPercent:1,The Wellspring:maxMana:6|Storm Pebble|18
storm-pebble|rare|6|2|Stormward:lightningResistance:4,Vigor:vitality:1|Storm Pebble|18
storm-pebble|rare|7|2|Invocation:castSpeedPercent:2,Sanctuary:allResistance:1|Storm Pebble|18
storm-pebble|epic|0|2|Stormward:lightningResistance:4,Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|epic|1|2|Haste:attackSpeedPercent:2,Stormward:lightningResistance:5|Storm Pebble|18
storm-pebble|epic|2|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:6|Storm Pebble|18
storm-pebble|epic|3|2|Stormward:lightningResistance:5,Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|epic|4|2|Stormward:lightningResistance:3,Haste:attackSpeedPercent:1|Storm Pebble|18
storm-pebble|epic|5|2|Invocation:castSpeedPercent:1,The Wellspring:maxMana:7|Storm Pebble|18
storm-pebble|epic|6|2|Stormward:lightningResistance:4,Vigor:vitality:2|Storm Pebble|18
storm-pebble|epic|7|2|Invocation:castSpeedPercent:2,Sanctuary:allResistance:1|Storm Pebble|18
storm-pebble|legendary|0|2|Stormward:lightningResistance:5,Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|legendary|1|2|Haste:attackSpeedPercent:3,Stormward:lightningResistance:5|Storm Pebble|18
storm-pebble|legendary|2|2|Invocation:castSpeedPercent:3,The Wellspring:maxMana:7|Storm Pebble|18
storm-pebble|legendary|3|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Pebble|18
storm-pebble|legendary|4|2|Stormward:lightningResistance:4,Haste:attackSpeedPercent:1|Storm Pebble|18
storm-pebble|legendary|5|2|Invocation:castSpeedPercent:1,The Wellspring:maxMana:8|Storm Pebble|18
storm-pebble|legendary|6|2|Stormward:lightningResistance:5,Vigor:vitality:2|Storm Pebble|18
storm-pebble|legendary|7|2|Invocation:castSpeedPercent:2,Sanctuary:allResistance:1|Storm Pebble|18
astral-pebble|common|0|1|Spellward:arcaneResistance:3|Astral Pebble|18
astral-pebble|common|1|1|Wisdom:xpGainPercent:2|Astral Pebble|18
astral-pebble|common|2|1|Clarity:manaRegen:1|Astral Pebble|18
astral-pebble|common|3|1|Spellward:arcaneResistance:4|Astral Pebble|18
astral-pebble|common|4|1|Spellward:arcaneResistance:3|Astral Pebble|18
astral-pebble|common|5|1|Clarity:manaRegen:1|Astral Pebble|18
astral-pebble|common|6|1|Spellward:arcaneResistance:3|Astral Pebble|18
astral-pebble|common|7|1|Wisdom:xpGainPercent:2|Astral Pebble|18
astral-pebble|magic|0|1|Spellward:arcaneResistance:3|Astral Pebble|18
astral-pebble|magic|1|1|Wisdom:xpGainPercent:2|Astral Pebble|18
astral-pebble|magic|2|1|Clarity:manaRegen:2|Astral Pebble|18
astral-pebble|magic|3|1|Spellward:arcaneResistance:4|Astral Pebble|18
astral-pebble|magic|4|1|Spellward:arcaneResistance:3|Astral Pebble|18
astral-pebble|magic|5|1|Clarity:manaRegen:1|Astral Pebble|18
astral-pebble|magic|6|1|Spellward:arcaneResistance:4|Astral Pebble|18
astral-pebble|magic|7|1|Wisdom:xpGainPercent:2|Astral Pebble|18
astral-pebble|rare|0|2|Spellward:arcaneResistance:4,Clarity:manaRegen:1|Astral Pebble|18
astral-pebble|rare|1|2|Wisdom:xpGainPercent:3,Spellward:arcaneResistance:4|Astral Pebble|18
astral-pebble|rare|2|2|Clarity:manaRegen:2,Invocation:castSpeedPercent:2|Astral Pebble|18
astral-pebble|rare|3|2|Spellward:arcaneResistance:4,Severity:critDamage:3|Astral Pebble|18
astral-pebble|rare|4|2|Spellward:arcaneResistance:3,The Wanderer:moveSpeedPercent:1|Astral Pebble|18
astral-pebble|rare|5|2|Clarity:manaRegen:1,Ruin:damagePercent:3|Astral Pebble|18
astral-pebble|rare|6|2|Spellward:arcaneResistance:4,Vigor:vitality:1|Astral Pebble|18
astral-pebble|rare|7|2|Wisdom:xpGainPercent:2,Grace:dexterity:2|Astral Pebble|18
astral-pebble|epic|0|2|Spellward:arcaneResistance:4,Clarity:manaRegen:2|Astral Pebble|18
astral-pebble|epic|1|2|Wisdom:xpGainPercent:3,Spellward:arcaneResistance:5|Astral Pebble|18
astral-pebble|epic|2|2|Clarity:manaRegen:2,Invocation:castSpeedPercent:2|Astral Pebble|18
astral-pebble|epic|3|2|Spellward:arcaneResistance:5,Severity:critDamage:4|Astral Pebble|18
astral-pebble|epic|4|2|Spellward:arcaneResistance:3,The Wanderer:moveSpeedPercent:1|Astral Pebble|18
astral-pebble|epic|5|2|Clarity:manaRegen:1,Ruin:damagePercent:3|Astral Pebble|18
astral-pebble|epic|6|2|Spellward:arcaneResistance:4,Vigor:vitality:2|Astral Pebble|18
astral-pebble|epic|7|2|Wisdom:xpGainPercent:2,Grace:dexterity:2|Astral Pebble|18
astral-pebble|legendary|0|2|Spellward:arcaneResistance:5,Clarity:manaRegen:2|Astral Pebble|18
astral-pebble|legendary|1|2|Wisdom:xpGainPercent:3,Spellward:arcaneResistance:5|Astral Pebble|18
astral-pebble|legendary|2|2|Clarity:manaRegen:2,Invocation:castSpeedPercent:2|Astral Pebble|18
astral-pebble|legendary|3|2|Spellward:arcaneResistance:6,Severity:critDamage:4|Astral Pebble|18
astral-pebble|legendary|4|2|Spellward:arcaneResistance:4,The Wanderer:moveSpeedPercent:1|Astral Pebble|18
astral-pebble|legendary|5|2|Clarity:manaRegen:1,Ruin:damagePercent:4|Astral Pebble|18
astral-pebble|legendary|6|2|Spellward:arcaneResistance:5,Vigor:vitality:2|Astral Pebble|18
astral-pebble|legendary|7|2|Wisdom:xpGainPercent:3,Grace:dexterity:3|Astral Pebble|18
jade-pebble|common|0|1|Sanctuary:allResistance:1|Jade Pebble|18
jade-pebble|common|1|1|Renewal:lifeRegen:1|Jade Pebble|18
jade-pebble|common|2|1|The Hart:maxHp:15|Jade Pebble|18
jade-pebble|common|3|1|Sanctuary:allResistance:1|Jade Pebble|18
jade-pebble|common|4|1|Sanctuary:allResistance:1|Jade Pebble|18
jade-pebble|common|5|1|The Hart:maxHp:8|Jade Pebble|18
jade-pebble|common|6|1|The Hart:maxHp:12|Jade Pebble|18
jade-pebble|common|7|1|Renewal:lifeRegen:1|Jade Pebble|18
jade-pebble|magic|0|1|Sanctuary:allResistance:1|Jade Pebble|18
jade-pebble|magic|1|1|Renewal:lifeRegen:1|Jade Pebble|18
jade-pebble|magic|2|1|The Hart:maxHp:16|Jade Pebble|18
jade-pebble|magic|3|1|Sanctuary:allResistance:1|Jade Pebble|18
jade-pebble|magic|4|1|Sanctuary:allResistance:1|Jade Pebble|18
jade-pebble|magic|5|1|The Hart:maxHp:9|Jade Pebble|18
jade-pebble|magic|6|1|The Hart:maxHp:13|Jade Pebble|18
jade-pebble|magic|7|1|Renewal:lifeRegen:1|Jade Pebble|18
jade-pebble|rare|0|2|Sanctuary:allResistance:1,Precision:critChance:1|Jade Pebble|18
jade-pebble|rare|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:4|Jade Pebble|18
jade-pebble|rare|2|2|The Hart:maxHp:18,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|rare|3|2|Sanctuary:allResistance:1,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|rare|4|2|Sanctuary:allResistance:1,Haste:attackSpeedPercent:1|Jade Pebble|18
jade-pebble|rare|5|2|The Hart:maxHp:10,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|rare|6|2|The Hart:maxHp:15,Cinderskin:fireResistance:2|Jade Pebble|18
jade-pebble|rare|7|2|Renewal:lifeRegen:1,The Hart:maxHp:14|Jade Pebble|18
jade-pebble|epic|0|2|Sanctuary:allResistance:1,Precision:critChance:1|Jade Pebble|18
jade-pebble|epic|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:5|Jade Pebble|18
jade-pebble|epic|2|2|The Hart:maxHp:20,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|epic|3|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|epic|4|2|Sanctuary:allResistance:1,Haste:attackSpeedPercent:1|Jade Pebble|18
jade-pebble|epic|5|2|The Hart:maxHp:11,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|epic|6|2|The Hart:maxHp:16,Cinderskin:fireResistance:3|Jade Pebble|18
jade-pebble|epic|7|2|Renewal:lifeRegen:1,The Hart:maxHp:15|Jade Pebble|18
jade-pebble|legendary|0|2|Sanctuary:allResistance:1,Precision:critChance:1|Jade Pebble|18
jade-pebble|legendary|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:5|Jade Pebble|18
jade-pebble|legendary|2|2|The Hart:maxHp:22,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|legendary|3|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|legendary|4|2|Sanctuary:allResistance:1,Haste:attackSpeedPercent:1|Jade Pebble|18
jade-pebble|legendary|5|2|The Hart:maxHp:13,Haste:attackSpeedPercent:2|Jade Pebble|18
jade-pebble|legendary|6|2|The Hart:maxHp:18,Cinderskin:fireResistance:3|Jade Pebble|18
jade-pebble|legendary|7|2|Renewal:lifeRegen:1,The Hart:maxHp:17|Jade Pebble|18
amber-pebble|common|0|1|The Wellspring:maxMana:5|Amber Pebble|18
amber-pebble|common|1|1|Prosperity:goldFindPercent:4|Amber Pebble|18
amber-pebble|common|2|1|The Wanderer:moveSpeedPercent:1|Amber Pebble|18
amber-pebble|common|3|1|The Wellspring:maxMana:6|Amber Pebble|18
amber-pebble|common|4|1|The Wellspring:maxMana:4|Amber Pebble|18
amber-pebble|common|5|1|Prosperity:goldFindPercent:2|Amber Pebble|18
amber-pebble|common|6|1|The Wellspring:maxMana:5|Amber Pebble|18
amber-pebble|common|7|1|Prosperity:goldFindPercent:3|Amber Pebble|18
amber-pebble|magic|0|1|The Wellspring:maxMana:5|Amber Pebble|18
amber-pebble|magic|1|1|Prosperity:goldFindPercent:4|Amber Pebble|18
amber-pebble|magic|2|1|The Wanderer:moveSpeedPercent:1|Amber Pebble|18
amber-pebble|magic|3|1|The Wellspring:maxMana:6|Amber Pebble|18
amber-pebble|magic|4|1|The Wellspring:maxMana:4|Amber Pebble|18
amber-pebble|magic|5|1|Prosperity:goldFindPercent:2|Amber Pebble|18
amber-pebble|magic|6|1|The Wellspring:maxMana:5|Amber Pebble|18
amber-pebble|magic|7|1|Prosperity:goldFindPercent:3|Amber Pebble|18
amber-pebble|rare|0|2|The Wellspring:maxMana:5,Haste:attackSpeedPercent:2|Amber Pebble|18
amber-pebble|rare|1|2|Prosperity:goldFindPercent:4,Spellward:arcaneResistance:4|Amber Pebble|18
amber-pebble|rare|2|2|The Wanderer:moveSpeedPercent:1,Haste:attackSpeedPercent:2|Amber Pebble|18
amber-pebble|rare|3|2|The Wellspring:maxMana:7,Invocation:castSpeedPercent:2|Amber Pebble|18
amber-pebble|rare|4|2|The Wellspring:maxMana:5,Invocation:castSpeedPercent:1|Amber Pebble|18
amber-pebble|rare|5|2|Prosperity:goldFindPercent:2,The Wellspring:maxMana:6|Amber Pebble|18
amber-pebble|rare|6|2|The Wellspring:maxMana:6,Cinderskin:fireResistance:2|Amber Pebble|18
amber-pebble|rare|7|2|Prosperity:goldFindPercent:3,The Hart:maxHp:14|Amber Pebble|18
amber-pebble|epic|0|2|The Wellspring:maxMana:6,Haste:attackSpeedPercent:2|Amber Pebble|18
amber-pebble|epic|1|2|Prosperity:goldFindPercent:5,Spellward:arcaneResistance:5|Amber Pebble|18
amber-pebble|epic|2|2|The Wanderer:moveSpeedPercent:2,Haste:attackSpeedPercent:2|Amber Pebble|18
amber-pebble|epic|3|2|The Wellspring:maxMana:7,Invocation:castSpeedPercent:2|Amber Pebble|18
amber-pebble|epic|4|2|The Wellspring:maxMana:5,Invocation:castSpeedPercent:1|Amber Pebble|18
amber-pebble|epic|5|2|Prosperity:goldFindPercent:3,The Wellspring:maxMana:7|Amber Pebble|18
amber-pebble|epic|6|2|The Wellspring:maxMana:6,Cinderskin:fireResistance:3|Amber Pebble|18
amber-pebble|epic|7|2|Prosperity:goldFindPercent:4,The Hart:maxHp:15|Amber Pebble|18
amber-pebble|legendary|0|2|The Wellspring:maxMana:7,Haste:attackSpeedPercent:2|Amber Pebble|18
amber-pebble|legendary|1|2|Prosperity:goldFindPercent:5,Spellward:arcaneResistance:5|Amber Pebble|18
amber-pebble|legendary|2|2|The Wanderer:moveSpeedPercent:2,Haste:attackSpeedPercent:2|Amber Pebble|18
amber-pebble|legendary|3|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:2|Amber Pebble|18
amber-pebble|legendary|4|2|The Wellspring:maxMana:6,Invocation:castSpeedPercent:1|Amber Pebble|18
amber-pebble|legendary|5|2|Prosperity:goldFindPercent:3,The Wellspring:maxMana:8|Amber Pebble|18
amber-pebble|legendary|6|2|The Wellspring:maxMana:7,Cinderskin:fireResistance:3|Amber Pebble|18
amber-pebble|legendary|7|2|Prosperity:goldFindPercent:4,The Hart:maxHp:17|Amber Pebble|18
ember-shard|common|0|1|Cinderskin:fireResistance:6|Ember Shard|18
ember-shard|common|1|1|The Hart:maxHp:28|Ember Shard|18
ember-shard|common|2|1|The Hart:maxHp:27|Ember Shard|18
ember-shard|common|3|1|Cinderskin:fireResistance:7|Ember Shard|18
ember-shard|common|4|1|Cinderskin:fireResistance:5|Ember Shard|18
ember-shard|common|5|1|The Hart:maxHp:15|Ember Shard|18
ember-shard|common|6|1|Cinderskin:fireResistance:6|Ember Shard|18
ember-shard|common|7|1|The Hart:maxHp:21|Ember Shard|18
ember-shard|magic|0|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:3|Ember Shard|18
ember-shard|magic|1|2|The Hart:maxHp:31,Stormward:lightningResistance:7|Ember Shard|18
ember-shard|magic|2|2|The Hart:maxHp:29,Haste:attackSpeedPercent:3|Ember Shard|18
ember-shard|magic|3|2|Cinderskin:fireResistance:7,Invocation:castSpeedPercent:3|Ember Shard|18
ember-shard|magic|4|2|Cinderskin:fireResistance:5,Haste:attackSpeedPercent:2|Ember Shard|18
ember-shard|magic|5|2|The Hart:maxHp:16,Invocation:castSpeedPercent:3|Ember Shard|18
ember-shard|magic|6|2|Cinderskin:fireResistance:6,Vigor:vitality:2|Ember Shard|18
ember-shard|magic|7|2|The Hart:maxHp:23,Sanctuary:allResistance:2|Ember Shard|18
ember-shard|rare|0|2|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:3|Ember Shard|18
ember-shard|rare|1|2|The Hart:maxHp:34,Stormward:lightningResistance:7|Ember Shard|18
ember-shard|rare|2|2|The Hart:maxHp:32,Haste:attackSpeedPercent:3|Ember Shard|18
ember-shard|rare|3|2|Cinderskin:fireResistance:8,Invocation:castSpeedPercent:3|Ember Shard|18
ember-shard|rare|4|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:2|Ember Shard|18
ember-shard|rare|5|2|The Hart:maxHp:18,Invocation:castSpeedPercent:3|Ember Shard|18
ember-shard|rare|6|2|Cinderskin:fireResistance:7,Vigor:vitality:3|Ember Shard|18
ember-shard|rare|7|2|The Hart:maxHp:26,Sanctuary:allResistance:2|Ember Shard|18
ember-shard|epic|0|2|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:4|Ember Shard|18
ember-shard|epic|1|2|The Hart:maxHp:38,Stormward:lightningResistance:8|Ember Shard|18
ember-shard|epic|2|2|The Hart:maxHp:36,Haste:attackSpeedPercent:3|Ember Shard|18
ember-shard|epic|3|2|Cinderskin:fireResistance:9,Invocation:castSpeedPercent:3|Ember Shard|18
ember-shard|epic|4|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:2|Ember Shard|18
ember-shard|epic|5|2|The Hart:maxHp:20,Invocation:castSpeedPercent:4|Ember Shard|18
ember-shard|epic|6|2|Cinderskin:fireResistance:8,Vigor:vitality:3|Ember Shard|18
ember-shard|epic|7|2|The Hart:maxHp:29,Sanctuary:allResistance:2|Ember Shard|18
ember-shard|legendary|0|2|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:4|Ember Shard|18
ember-shard|legendary|1|2|The Hart:maxHp:42,Stormward:lightningResistance:9|Ember Shard|18
ember-shard|legendary|2|2|The Hart:maxHp:40,Haste:attackSpeedPercent:4|Ember Shard|18
ember-shard|legendary|3|2|Cinderskin:fireResistance:10,Invocation:castSpeedPercent:4|Ember Shard|18
ember-shard|legendary|4|2|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:3|Ember Shard|18
ember-shard|legendary|5|2|The Hart:maxHp:22,Invocation:castSpeedPercent:4|Ember Shard|18
ember-shard|legendary|6|2|Cinderskin:fireResistance:9,Vigor:vitality:3|Ember Shard|18
ember-shard|legendary|7|2|The Hart:maxHp:32,Sanctuary:allResistance:2|Ember Shard|18
rime-shard|common|0|1|Rimeward:frostResistance:6|Rime Shard|18
rime-shard|common|1|1|The Wellspring:maxMana:11|Rime Shard|18
rime-shard|common|2|1|The Wellspring:maxMana:11|Rime Shard|18
rime-shard|common|3|1|Rimeward:frostResistance:7|Rime Shard|18
rime-shard|common|4|1|Rimeward:frostResistance:5|Rime Shard|18
rime-shard|common|5|1|The Wellspring:maxMana:6|Rime Shard|18
rime-shard|common|6|1|Rimeward:frostResistance:6|Rime Shard|18
rime-shard|common|7|1|The Wellspring:maxMana:8|Rime Shard|18
rime-shard|magic|0|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:3|Rime Shard|18
rime-shard|magic|1|2|The Wellspring:maxMana:12,Stormward:lightningResistance:7|Rime Shard|18
rime-shard|magic|2|2|The Wellspring:maxMana:11,Haste:attackSpeedPercent:3|Rime Shard|18
rime-shard|magic|3|2|Rimeward:frostResistance:7,Invocation:castSpeedPercent:3|Rime Shard|18
rime-shard|magic|4|2|Rimeward:frostResistance:5,Haste:attackSpeedPercent:2|Rime Shard|18
rime-shard|magic|5|2|The Wellspring:maxMana:6,Invocation:castSpeedPercent:3|Rime Shard|18
rime-shard|magic|6|2|Rimeward:frostResistance:6,Vigor:vitality:2|Rime Shard|18
rime-shard|magic|7|2|The Wellspring:maxMana:9,Sanctuary:allResistance:2|Rime Shard|18
rime-shard|rare|0|2|Rimeward:frostResistance:7,Haste:attackSpeedPercent:3|Rime Shard|18
rime-shard|rare|1|2|The Wellspring:maxMana:13,Stormward:lightningResistance:7|Rime Shard|18
rime-shard|rare|2|2|The Wellspring:maxMana:13,Haste:attackSpeedPercent:3|Rime Shard|18
rime-shard|rare|3|2|Rimeward:frostResistance:8,Invocation:castSpeedPercent:3|Rime Shard|18
rime-shard|rare|4|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:2|Rime Shard|18
rime-shard|rare|5|2|The Wellspring:maxMana:7,Invocation:castSpeedPercent:3|Rime Shard|18
rime-shard|rare|6|2|Rimeward:frostResistance:7,Vigor:vitality:3|Rime Shard|18
rime-shard|rare|7|2|The Wellspring:maxMana:10,Sanctuary:allResistance:2|Rime Shard|18
rime-shard|epic|0|2|Rimeward:frostResistance:7,Haste:attackSpeedPercent:4|Rime Shard|18
rime-shard|epic|1|2|The Wellspring:maxMana:15,Stormward:lightningResistance:8|Rime Shard|18
rime-shard|epic|2|2|The Wellspring:maxMana:14,Haste:attackSpeedPercent:3|Rime Shard|18
rime-shard|epic|3|2|Rimeward:frostResistance:9,Invocation:castSpeedPercent:3|Rime Shard|18
rime-shard|epic|4|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:2|Rime Shard|18
rime-shard|epic|5|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:4|Rime Shard|18
rime-shard|epic|6|2|Rimeward:frostResistance:8,Vigor:vitality:3|Rime Shard|18
rime-shard|epic|7|2|The Wellspring:maxMana:11,Sanctuary:allResistance:2|Rime Shard|18
rime-shard|legendary|0|2|Rimeward:frostResistance:8,Haste:attackSpeedPercent:4|Rime Shard|18
rime-shard|legendary|1|2|The Wellspring:maxMana:17,Stormward:lightningResistance:9|Rime Shard|18
rime-shard|legendary|2|2|The Wellspring:maxMana:16,Haste:attackSpeedPercent:4|Rime Shard|18
rime-shard|legendary|3|2|Rimeward:frostResistance:10,Invocation:castSpeedPercent:4|Rime Shard|18
rime-shard|legendary|4|2|Rimeward:frostResistance:7,Haste:attackSpeedPercent:3|Rime Shard|18
rime-shard|legendary|5|2|The Wellspring:maxMana:9,Invocation:castSpeedPercent:4|Rime Shard|18
rime-shard|legendary|6|2|Rimeward:frostResistance:9,Vigor:vitality:3|Rime Shard|18
rime-shard|legendary|7|2|The Wellspring:maxMana:13,Sanctuary:allResistance:2|Rime Shard|18
storm-shard|common|0|1|Stormward:lightningResistance:6|Storm Shard|18
storm-shard|common|1|1|Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|common|2|1|Invocation:castSpeedPercent:3|Storm Shard|18
storm-shard|common|3|1|Stormward:lightningResistance:7|Storm Shard|18
storm-shard|common|4|1|Stormward:lightningResistance:5|Storm Shard|18
storm-shard|common|5|1|Invocation:castSpeedPercent:2|Storm Shard|18
storm-shard|common|6|1|Stormward:lightningResistance:6|Storm Shard|18
storm-shard|common|7|1|Invocation:castSpeedPercent:3|Storm Shard|18
storm-shard|magic|0|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|magic|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:7|Storm Shard|18
storm-shard|magic|2|2|Invocation:castSpeedPercent:3,The Wellspring:maxMana:9|Storm Shard|18
storm-shard|magic|3|2|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|magic|4|2|Stormward:lightningResistance:5,Haste:attackSpeedPercent:2|Storm Shard|18
storm-shard|magic|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:10|Storm Shard|18
storm-shard|magic|6|2|Stormward:lightningResistance:6,Vigor:vitality:2|Storm Shard|18
storm-shard|magic|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Shard|18
storm-shard|rare|0|2|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|rare|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:7|Storm Shard|18
storm-shard|rare|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:10|Storm Shard|18
storm-shard|rare|3|2|Stormward:lightningResistance:8,Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|rare|4|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Shard|18
storm-shard|rare|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:12|Storm Shard|18
storm-shard|rare|6|2|Stormward:lightningResistance:7,Vigor:vitality:3|Storm Shard|18
storm-shard|rare|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Shard|18
storm-shard|epic|0|2|Stormward:lightningResistance:7,Haste:attackSpeedPercent:4|Storm Shard|18
storm-shard|epic|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:8|Storm Shard|18
storm-shard|epic|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:11|Storm Shard|18
storm-shard|epic|3|2|Stormward:lightningResistance:9,Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|epic|4|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Shard|18
storm-shard|epic|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:13|Storm Shard|18
storm-shard|epic|6|2|Stormward:lightningResistance:8,Vigor:vitality:3|Storm Shard|18
storm-shard|epic|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Shard|18
storm-shard|legendary|0|2|Stormward:lightningResistance:8,Haste:attackSpeedPercent:4|Storm Shard|18
storm-shard|legendary|1|2|Haste:attackSpeedPercent:5,Stormward:lightningResistance:9|Storm Shard|18
storm-shard|legendary|2|2|Invocation:castSpeedPercent:5,The Wellspring:maxMana:12|Storm Shard|18
storm-shard|legendary|3|2|Stormward:lightningResistance:10,Haste:attackSpeedPercent:4|Storm Shard|18
storm-shard|legendary|4|2|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3|Storm Shard|18
storm-shard|legendary|5|2|Invocation:castSpeedPercent:3,The Wellspring:maxMana:14|Storm Shard|18
storm-shard|legendary|6|2|Stormward:lightningResistance:9,Vigor:vitality:3|Storm Shard|18
storm-shard|legendary|7|2|Invocation:castSpeedPercent:4,Sanctuary:allResistance:2|Storm Shard|18
astral-shard|common|0|1|Spellward:arcaneResistance:6|Astral Shard|18
astral-shard|common|1|1|Wisdom:xpGainPercent:4|Astral Shard|18
astral-shard|common|2|1|Clarity:manaRegen:3|Astral Shard|18
astral-shard|common|3|1|Spellward:arcaneResistance:7|Astral Shard|18
astral-shard|common|4|1|Spellward:arcaneResistance:5|Astral Shard|18
astral-shard|common|5|1|Clarity:manaRegen:2|Astral Shard|18
astral-shard|common|6|1|Spellward:arcaneResistance:6|Astral Shard|18
astral-shard|common|7|1|Wisdom:xpGainPercent:3|Astral Shard|18
astral-shard|magic|0|2|Spellward:arcaneResistance:6,Clarity:manaRegen:3|Astral Shard|18
astral-shard|magic|1|2|Wisdom:xpGainPercent:4,Spellward:arcaneResistance:7|Astral Shard|18
astral-shard|magic|2|2|Clarity:manaRegen:3,Invocation:castSpeedPercent:3|Astral Shard|18
astral-shard|magic|3|2|Spellward:arcaneResistance:7,Severity:critDamage:5|Astral Shard|18
astral-shard|magic|4|2|Spellward:arcaneResistance:5,The Wanderer:moveSpeedPercent:1|Astral Shard|18
astral-shard|magic|5|2|Clarity:manaRegen:2,Ruin:damagePercent:5|Astral Shard|18
astral-shard|magic|6|2|Spellward:arcaneResistance:6,Vigor:vitality:2|Astral Shard|18
astral-shard|magic|7|2|Wisdom:xpGainPercent:3,Grace:dexterity:4|Astral Shard|18
astral-shard|rare|0|2|Spellward:arcaneResistance:7,Clarity:manaRegen:3|Astral Shard|18
astral-shard|rare|1|2|Wisdom:xpGainPercent:5,Spellward:arcaneResistance:7|Astral Shard|18
astral-shard|rare|2|2|Clarity:manaRegen:3,Invocation:castSpeedPercent:3|Astral Shard|18
astral-shard|rare|3|2|Spellward:arcaneResistance:8,Severity:critDamage:6|Astral Shard|18
astral-shard|rare|4|2|Spellward:arcaneResistance:6,The Wanderer:moveSpeedPercent:1|Astral Shard|18
astral-shard|rare|5|2|Clarity:manaRegen:2,Ruin:damagePercent:5|Astral Shard|18
astral-shard|rare|6|2|Spellward:arcaneResistance:7,Vigor:vitality:3|Astral Shard|18
astral-shard|rare|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:4|Astral Shard|18
astral-shard|epic|0|2|Spellward:arcaneResistance:7,Clarity:manaRegen:3|Astral Shard|18
astral-shard|epic|1|2|Wisdom:xpGainPercent:5,Spellward:arcaneResistance:8|Astral Shard|18
astral-shard|epic|2|2|Clarity:manaRegen:4,Invocation:castSpeedPercent:3|Astral Shard|18
astral-shard|epic|3|2|Spellward:arcaneResistance:9,Severity:critDamage:6|Astral Shard|18
astral-shard|epic|4|2|Spellward:arcaneResistance:6,The Wanderer:moveSpeedPercent:2|Astral Shard|18
astral-shard|epic|5|2|Clarity:manaRegen:2,Ruin:damagePercent:6|Astral Shard|18
astral-shard|epic|6|2|Spellward:arcaneResistance:8,Vigor:vitality:3|Astral Shard|18
astral-shard|epic|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:4|Astral Shard|18
astral-shard|legendary|0|2|Spellward:arcaneResistance:8,Clarity:manaRegen:4|Astral Shard|18
astral-shard|legendary|1|2|Wisdom:xpGainPercent:6,Spellward:arcaneResistance:9|Astral Shard|18
astral-shard|legendary|2|2|Clarity:manaRegen:4,Invocation:castSpeedPercent:4|Astral Shard|18
astral-shard|legendary|3|2|Spellward:arcaneResistance:10,Severity:critDamage:7|Astral Shard|18
astral-shard|legendary|4|2|Spellward:arcaneResistance:7,The Wanderer:moveSpeedPercent:2|Astral Shard|18
astral-shard|legendary|5|2|Clarity:manaRegen:2,Ruin:damagePercent:7|Astral Shard|18
astral-shard|legendary|6|2|Spellward:arcaneResistance:9,Vigor:vitality:3|Astral Shard|18
astral-shard|legendary|7|2|Wisdom:xpGainPercent:5,Grace:dexterity:5|Astral Shard|18
jade-shard|common|0|1|Sanctuary:allResistance:2|Jade Shard|18
jade-shard|common|1|1|Renewal:lifeRegen:1|Jade Shard|18
jade-shard|common|2|1|The Hart:maxHp:27|Jade Shard|18
jade-shard|common|3|1|Sanctuary:allResistance:2|Jade Shard|18
jade-shard|common|4|1|Sanctuary:allResistance:1|Jade Shard|18
jade-shard|common|5|1|The Hart:maxHp:15|Jade Shard|18
jade-shard|common|6|1|The Hart:maxHp:22|Jade Shard|18
jade-shard|common|7|1|Renewal:lifeRegen:1|Jade Shard|18
jade-shard|magic|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Shard|18
jade-shard|magic|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:7|Jade Shard|18
jade-shard|magic|2|2|The Hart:maxHp:29,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|magic|3|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|magic|4|2|Sanctuary:allResistance:1,Haste:attackSpeedPercent:2|Jade Shard|18
jade-shard|magic|5|2|The Hart:maxHp:16,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|magic|6|2|The Hart:maxHp:24,Cinderskin:fireResistance:4|Jade Shard|18
jade-shard|magic|7|2|Renewal:lifeRegen:1,The Hart:maxHp:22|Jade Shard|18
jade-shard|rare|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Shard|18
jade-shard|rare|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:7|Jade Shard|18
jade-shard|rare|2|2|The Hart:maxHp:32,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|rare|3|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|rare|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Shard|18
jade-shard|rare|5|2|The Hart:maxHp:18,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|rare|6|2|The Hart:maxHp:26,Cinderskin:fireResistance:4|Jade Shard|18
jade-shard|rare|7|2|Renewal:lifeRegen:1,The Hart:maxHp:25|Jade Shard|18
jade-shard|epic|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Shard|18
jade-shard|epic|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:8|Jade Shard|18
jade-shard|epic|2|2|The Hart:maxHp:36,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|epic|3|2|Sanctuary:allResistance:3,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|epic|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Shard|18
jade-shard|epic|5|2|The Hart:maxHp:20,Haste:attackSpeedPercent:4|Jade Shard|18
jade-shard|epic|6|2|The Hart:maxHp:29,Cinderskin:fireResistance:5|Jade Shard|18
jade-shard|epic|7|2|Renewal:lifeRegen:1,The Hart:maxHp:28|Jade Shard|18
jade-shard|legendary|0|2|Sanctuary:allResistance:2,Precision:critChance:2|Jade Shard|18
jade-shard|legendary|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:9|Jade Shard|18
jade-shard|legendary|2|2|The Hart:maxHp:40,Haste:attackSpeedPercent:4|Jade Shard|18
jade-shard|legendary|3|2|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4|Jade Shard|18
jade-shard|legendary|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3|Jade Shard|18
jade-shard|legendary|5|2|The Hart:maxHp:22,Haste:attackSpeedPercent:4|Jade Shard|18
jade-shard|legendary|6|2|The Hart:maxHp:33,Cinderskin:fireResistance:6|Jade Shard|18
jade-shard|legendary|7|2|Renewal:lifeRegen:1,The Hart:maxHp:31|Jade Shard|18
amber-shard|common|0|1|The Wellspring:maxMana:8|Amber Shard|18
amber-shard|common|1|1|Prosperity:goldFindPercent:6|Amber Shard|18
amber-shard|common|2|1|The Wanderer:moveSpeedPercent:2|Amber Shard|18
amber-shard|common|3|1|The Wellspring:maxMana:10|Amber Shard|18
amber-shard|common|4|1|The Wellspring:maxMana:7|Amber Shard|18
amber-shard|common|5|1|Prosperity:goldFindPercent:3|Amber Shard|18
amber-shard|common|6|1|The Wellspring:maxMana:9|Amber Shard|18
amber-shard|common|7|1|Prosperity:goldFindPercent:5|Amber Shard|18
amber-shard|magic|0|2|The Wellspring:maxMana:9,Haste:attackSpeedPercent:3|Amber Shard|18
amber-shard|magic|1|2|Prosperity:goldFindPercent:7,Spellward:arcaneResistance:7|Amber Shard|18
amber-shard|magic|2|2|The Wanderer:moveSpeedPercent:2,Haste:attackSpeedPercent:3|Amber Shard|18
amber-shard|magic|3|2|The Wellspring:maxMana:11,Invocation:castSpeedPercent:3|Amber Shard|18
amber-shard|magic|4|2|The Wellspring:maxMana:7,Invocation:castSpeedPercent:2|Amber Shard|18
amber-shard|magic|5|2|Prosperity:goldFindPercent:4,The Wellspring:maxMana:10|Amber Shard|18
amber-shard|magic|6|2|The Wellspring:maxMana:9,Cinderskin:fireResistance:4|Amber Shard|18
amber-shard|magic|7|2|Prosperity:goldFindPercent:5,The Hart:maxHp:22|Amber Shard|18
amber-shard|rare|0|2|The Wellspring:maxMana:10,Haste:attackSpeedPercent:3|Amber Shard|18
amber-shard|rare|1|2|Prosperity:goldFindPercent:8,Spellward:arcaneResistance:7|Amber Shard|18
amber-shard|rare|2|2|The Wanderer:moveSpeedPercent:2,Haste:attackSpeedPercent:3|Amber Shard|18
amber-shard|rare|3|2|The Wellspring:maxMana:12,Invocation:castSpeedPercent:3|Amber Shard|18
amber-shard|rare|4|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:2|Amber Shard|18
amber-shard|rare|5|2|Prosperity:goldFindPercent:4,The Wellspring:maxMana:12|Amber Shard|18
amber-shard|rare|6|2|The Wellspring:maxMana:10,Cinderskin:fireResistance:4|Amber Shard|18
amber-shard|rare|7|2|Prosperity:goldFindPercent:6,The Hart:maxHp:25|Amber Shard|18
amber-shard|epic|0|2|The Wellspring:maxMana:11,Haste:attackSpeedPercent:4|Amber Shard|18
amber-shard|epic|1|2|Prosperity:goldFindPercent:9,Spellward:arcaneResistance:8|Amber Shard|18
amber-shard|epic|2|2|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:3|Amber Shard|18
amber-shard|epic|3|2|The Wellspring:maxMana:13,Invocation:castSpeedPercent:3|Amber Shard|18
amber-shard|epic|4|2|The Wellspring:maxMana:9,Invocation:castSpeedPercent:2|Amber Shard|18
amber-shard|epic|5|2|Prosperity:goldFindPercent:5,The Wellspring:maxMana:13|Amber Shard|18
amber-shard|epic|6|2|The Wellspring:maxMana:11,Cinderskin:fireResistance:5|Amber Shard|18
amber-shard|epic|7|2|Prosperity:goldFindPercent:7,The Hart:maxHp:28|Amber Shard|18
amber-shard|legendary|0|2|The Wellspring:maxMana:12,Haste:attackSpeedPercent:4|Amber Shard|18
amber-shard|legendary|1|2|Prosperity:goldFindPercent:10,Spellward:arcaneResistance:9|Amber Shard|18
amber-shard|legendary|2|2|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:4|Amber Shard|18
amber-shard|legendary|3|2|The Wellspring:maxMana:15,Invocation:castSpeedPercent:4|Amber Shard|18
amber-shard|legendary|4|2|The Wellspring:maxMana:10,Invocation:castSpeedPercent:3|Amber Shard|18
amber-shard|legendary|5|2|Prosperity:goldFindPercent:5,The Wellspring:maxMana:14|Amber Shard|18
amber-shard|legendary|6|2|The Wellspring:maxMana:13,Cinderskin:fireResistance:6|Amber Shard|18
amber-shard|legendary|7|2|Prosperity:goldFindPercent:7,The Hart:maxHp:31|Amber Shard|18
ember-tablet|common|0|2|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:3|Ember Tablet|18
ember-tablet|common|1|2|The Hart:maxHp:36,Stormward:lightningResistance:8|Ember Tablet|18
ember-tablet|common|2|2|The Hart:maxHp:34,Haste:attackSpeedPercent:3|Ember Tablet|18
ember-tablet|common|3|2|Cinderskin:fireResistance:9,Invocation:castSpeedPercent:3|Ember Tablet|18
ember-tablet|common|4|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:2|Ember Tablet|18
ember-tablet|common|5|2|The Hart:maxHp:19,Invocation:castSpeedPercent:4|Ember Tablet|18
ember-tablet|common|6|2|Cinderskin:fireResistance:7,Vigor:vitality:3|Ember Tablet|18
ember-tablet|common|7|2|The Hart:maxHp:27,Sanctuary:allResistance:2|Ember Tablet|18
ember-tablet|magic|0|2|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:4|Ember Tablet|18
ember-tablet|magic|1|2|The Hart:maxHp:39,Stormward:lightningResistance:9|Ember Tablet|18
ember-tablet|magic|2|2|The Hart:maxHp:37,Haste:attackSpeedPercent:3|Ember Tablet|18
ember-tablet|magic|3|2|Cinderskin:fireResistance:9,Invocation:castSpeedPercent:3|Ember Tablet|18
ember-tablet|magic|4|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:2|Ember Tablet|18
ember-tablet|magic|5|2|The Hart:maxHp:21,Invocation:castSpeedPercent:4|Ember Tablet|18
ember-tablet|magic|6|2|Cinderskin:fireResistance:8,Vigor:vitality:3|Ember Tablet|18
ember-tablet|magic|7|2|The Hart:maxHp:30,Sanctuary:allResistance:2|Ember Tablet|18
ember-tablet|rare|0|3|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:4,Clarity:manaRegen:5|Ember Tablet|18
ember-tablet|rare|1|3|The Hart:maxHp:43,Stormward:lightningResistance:9,Efficiency:manaCostPercent:4|Ember Tablet|18
ember-tablet|rare|2|3|The Hart:maxHp:41,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:10|Ember Tablet|18
ember-tablet|rare|3|3|Cinderskin:fireResistance:10,Invocation:castSpeedPercent:4,The Hart:maxHp:27|Ember Tablet|18
ember-tablet|rare|4|3|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Ember Tablet|18
ember-tablet|rare|5|3|The Hart:maxHp:23,Invocation:castSpeedPercent:4,Sanctuary:allResistance:3|Ember Tablet|18
ember-tablet|rare|6|3|Cinderskin:fireResistance:9,Vigor:vitality:3,Prosperity:goldFindPercent:10|Ember Tablet|18
ember-tablet|rare|7|3|The Hart:maxHp:33,Sanctuary:allResistance:3,The Wellspring:maxMana:13|Ember Tablet|18
ember-tablet|epic|0|3|Cinderskin:fireResistance:9,Haste:attackSpeedPercent:5,Clarity:manaRegen:6|Ember Tablet|18
ember-tablet|epic|1|3|The Hart:maxHp:48,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Ember Tablet|18
ember-tablet|epic|2|3|The Hart:maxHp:46,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:12|Ember Tablet|18
ember-tablet|epic|3|3|Cinderskin:fireResistance:11,Invocation:castSpeedPercent:4,The Hart:maxHp:30|Ember Tablet|18
ember-tablet|epic|4|3|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Ember Tablet|18
ember-tablet|epic|5|3|The Hart:maxHp:26,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Ember Tablet|18
ember-tablet|epic|6|3|Cinderskin:fireResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Ember Tablet|18
ember-tablet|epic|7|3|The Hart:maxHp:37,Sanctuary:allResistance:3,The Wellspring:maxMana:15|Ember Tablet|18
ember-tablet|legendary|0|4|Cinderskin:fireResistance:11,Haste:attackSpeedPercent:5,Clarity:manaRegen:7,The Wanderer:moveSpeedPercent:3|Ember Tablet|18
ember-tablet|legendary|1|4|The Hart:maxHp:54,Stormward:lightningResistance:12,Efficiency:manaCostPercent:5,Wisdom:xpGainPercent:6|Ember Tablet|18
ember-tablet|legendary|2|4|The Hart:maxHp:51,Haste:attackSpeedPercent:5,Spellward:arcaneResistance:13,Vigor:vitality:8|Ember Tablet|18
ember-tablet|legendary|3|4|Cinderskin:fireResistance:13,Invocation:castSpeedPercent:5,The Hart:maxHp:34,Renewal:lifeRegen:1|Ember Tablet|18
ember-tablet|legendary|4|4|Cinderskin:fireResistance:9,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6,Clarity:manaRegen:8|Ember Tablet|18
ember-tablet|legendary|5|4|The Hart:maxHp:29,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4,The Wellspring:maxMana:19|Ember Tablet|18
ember-tablet|legendary|6|4|Cinderskin:fireResistance:11,Vigor:vitality:4,Prosperity:goldFindPercent:12,The Hart:maxHp:53|Ember Tablet|18
ember-tablet|legendary|7|4|The Hart:maxHp:41,Sanctuary:allResistance:3,The Wellspring:maxMana:17,Readiness:cooldownPercent:2|Ember Tablet|18
rime-tablet|common|0|2|Rimeward:frostResistance:7,Haste:attackSpeedPercent:3|Rime Tablet|18
rime-tablet|common|1|2|The Wellspring:maxMana:14,Stormward:lightningResistance:8|Rime Tablet|18
rime-tablet|common|2|2|The Wellspring:maxMana:13,Haste:attackSpeedPercent:3|Rime Tablet|18
rime-tablet|common|3|2|Rimeward:frostResistance:9,Invocation:castSpeedPercent:3|Rime Tablet|18
rime-tablet|common|4|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:2|Rime Tablet|18
rime-tablet|common|5|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:4|Rime Tablet|18
rime-tablet|common|6|2|Rimeward:frostResistance:7,Vigor:vitality:3|Rime Tablet|18
rime-tablet|common|7|2|The Wellspring:maxMana:11,Sanctuary:allResistance:2|Rime Tablet|18
rime-tablet|magic|0|2|Rimeward:frostResistance:8,Haste:attackSpeedPercent:4|Rime Tablet|18
rime-tablet|magic|1|2|The Wellspring:maxMana:15,Stormward:lightningResistance:9|Rime Tablet|18
rime-tablet|magic|2|2|The Wellspring:maxMana:15,Haste:attackSpeedPercent:3|Rime Tablet|18
rime-tablet|magic|3|2|Rimeward:frostResistance:9,Invocation:castSpeedPercent:3|Rime Tablet|18
rime-tablet|magic|4|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:2|Rime Tablet|18
rime-tablet|magic|5|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:4|Rime Tablet|18
rime-tablet|magic|6|2|Rimeward:frostResistance:8,Vigor:vitality:3|Rime Tablet|18
rime-tablet|magic|7|2|The Wellspring:maxMana:12,Sanctuary:allResistance:2|Rime Tablet|18
rime-tablet|rare|0|3|Rimeward:frostResistance:8,Haste:attackSpeedPercent:4,Clarity:manaRegen:5|Rime Tablet|18
rime-tablet|rare|1|3|The Wellspring:maxMana:17,Stormward:lightningResistance:9,Efficiency:manaCostPercent:4|Rime Tablet|18
rime-tablet|rare|2|3|The Wellspring:maxMana:16,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:10|Rime Tablet|18
rime-tablet|rare|3|3|Rimeward:frostResistance:10,Invocation:castSpeedPercent:4,The Hart:maxHp:27|Rime Tablet|18
rime-tablet|rare|4|3|Rimeward:frostResistance:7,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Rime Tablet|18
rime-tablet|rare|5|3|The Wellspring:maxMana:9,Invocation:castSpeedPercent:4,Sanctuary:allResistance:3|Rime Tablet|18
rime-tablet|rare|6|3|Rimeward:frostResistance:9,Vigor:vitality:3,Prosperity:goldFindPercent:10|Rime Tablet|18
rime-tablet|rare|7|3|The Wellspring:maxMana:13,Sanctuary:allResistance:3,The Hart:maxHp:34|Rime Tablet|18
rime-tablet|epic|0|3|Rimeward:frostResistance:9,Haste:attackSpeedPercent:5,Clarity:manaRegen:6|Rime Tablet|18
rime-tablet|epic|1|3|The Wellspring:maxMana:19,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Rime Tablet|18
rime-tablet|epic|2|3|The Wellspring:maxMana:18,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:12|Rime Tablet|18
rime-tablet|epic|3|3|Rimeward:frostResistance:11,Invocation:castSpeedPercent:4,The Hart:maxHp:30|Rime Tablet|18
rime-tablet|epic|4|3|Rimeward:frostResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Rime Tablet|18
rime-tablet|epic|5|3|The Wellspring:maxMana:10,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Rime Tablet|18
rime-tablet|epic|6|3|Rimeward:frostResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Rime Tablet|18
rime-tablet|epic|7|3|The Wellspring:maxMana:14,Sanctuary:allResistance:3,The Hart:maxHp:38|Rime Tablet|18
rime-tablet|legendary|0|4|Rimeward:frostResistance:11,Haste:attackSpeedPercent:5,Clarity:manaRegen:7,The Wanderer:moveSpeedPercent:3|Rime Tablet|18
rime-tablet|legendary|1|4|The Wellspring:maxMana:21,Stormward:lightningResistance:12,Efficiency:manaCostPercent:5,Wisdom:xpGainPercent:6|Rime Tablet|18
rime-tablet|legendary|2|4|The Wellspring:maxMana:20,Haste:attackSpeedPercent:5,Spellward:arcaneResistance:13,Vigor:vitality:8|Rime Tablet|18
rime-tablet|legendary|3|4|Rimeward:frostResistance:13,Invocation:castSpeedPercent:5,The Hart:maxHp:34,Clarity:manaRegen:5|Rime Tablet|18
rime-tablet|legendary|4|4|Rimeward:frostResistance:9,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6,Clarity:manaRegen:8|Rime Tablet|18
rime-tablet|legendary|5|4|The Wellspring:maxMana:11,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4,The Hart:maxHp:48|Rime Tablet|18
rime-tablet|legendary|6|4|Rimeward:frostResistance:11,Vigor:vitality:4,Prosperity:goldFindPercent:12,The Wellspring:maxMana:21|Rime Tablet|18
rime-tablet|legendary|7|4|The Wellspring:maxMana:16,Sanctuary:allResistance:3,The Hart:maxHp:42,Readiness:cooldownPercent:2|Rime Tablet|18
storm-tablet|common|0|2|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3|Storm Tablet|18
storm-tablet|common|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:8|Storm Tablet|18
storm-tablet|common|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:11|Storm Tablet|18
storm-tablet|common|3|2|Stormward:lightningResistance:9,Haste:attackSpeedPercent:3|Storm Tablet|18
storm-tablet|common|4|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Tablet|18
storm-tablet|common|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:12|Storm Tablet|18
storm-tablet|common|6|2|Stormward:lightningResistance:7,Vigor:vitality:3|Storm Tablet|18
storm-tablet|common|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Tablet|18
storm-tablet|magic|0|2|Stormward:lightningResistance:8,Haste:attackSpeedPercent:4|Storm Tablet|18
storm-tablet|magic|1|2|Haste:attackSpeedPercent:5,Stormward:lightningResistance:9|Storm Tablet|18
storm-tablet|magic|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:12|Storm Tablet|18
storm-tablet|magic|3|2|Stormward:lightningResistance:9,Haste:attackSpeedPercent:3|Storm Tablet|18
storm-tablet|magic|4|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Tablet|18
storm-tablet|magic|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:13|Storm Tablet|18
storm-tablet|magic|6|2|Stormward:lightningResistance:8,Vigor:vitality:3|Storm Tablet|18
storm-tablet|magic|7|2|Invocation:castSpeedPercent:4,Sanctuary:allResistance:2|Storm Tablet|18
storm-tablet|rare|0|3|Stormward:lightningResistance:8,Haste:attackSpeedPercent:4,Renewal:lifeRegen:1|Storm Tablet|18
storm-tablet|rare|1|3|Haste:attackSpeedPercent:5,Stormward:lightningResistance:9,Efficiency:manaCostPercent:4|Storm Tablet|18
storm-tablet|rare|2|3|Invocation:castSpeedPercent:5,The Wellspring:maxMana:13,Spellward:arcaneResistance:10|Storm Tablet|18
storm-tablet|rare|3|3|Stormward:lightningResistance:10,Haste:attackSpeedPercent:4,The Hart:maxHp:27|Storm Tablet|18
storm-tablet|rare|4|3|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Storm Tablet|18
storm-tablet|rare|5|3|Invocation:castSpeedPercent:3,The Wellspring:maxMana:15,Sanctuary:allResistance:3|Storm Tablet|18
storm-tablet|rare|6|3|Stormward:lightningResistance:9,Vigor:vitality:3,Prosperity:goldFindPercent:10|Storm Tablet|18
storm-tablet|rare|7|3|Invocation:castSpeedPercent:4,Sanctuary:allResistance:3,The Hart:maxHp:34|Storm Tablet|18
storm-tablet|epic|0|3|Stormward:lightningResistance:9,Haste:attackSpeedPercent:5,Renewal:lifeRegen:1|Storm Tablet|18
storm-tablet|epic|1|3|Haste:attackSpeedPercent:6,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Storm Tablet|18
storm-tablet|epic|2|3|Invocation:castSpeedPercent:5,The Wellspring:maxMana:14,Spellward:arcaneResistance:12|Storm Tablet|18
storm-tablet|epic|3|3|Stormward:lightningResistance:11,Haste:attackSpeedPercent:4,The Hart:maxHp:30|Storm Tablet|18
storm-tablet|epic|4|3|Stormward:lightningResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Storm Tablet|18
storm-tablet|epic|5|3|Invocation:castSpeedPercent:3,The Wellspring:maxMana:16,Sanctuary:allResistance:4|Storm Tablet|18
storm-tablet|epic|6|3|Stormward:lightningResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Storm Tablet|18
storm-tablet|epic|7|3|Invocation:castSpeedPercent:4,Sanctuary:allResistance:3,The Hart:maxHp:38|Storm Tablet|18
storm-tablet|legendary|0|4|Stormward:lightningResistance:11,Haste:attackSpeedPercent:5,Renewal:lifeRegen:1,Clarity:manaRegen:6|Storm Tablet|18
storm-tablet|legendary|1|4|Haste:attackSpeedPercent:6,Stormward:lightningResistance:12,Efficiency:manaCostPercent:5,Wisdom:xpGainPercent:6|Storm Tablet|18
storm-tablet|legendary|2|4|Invocation:castSpeedPercent:6,The Wellspring:maxMana:16,Spellward:arcaneResistance:13,Vigor:vitality:8|Storm Tablet|18
storm-tablet|legendary|3|4|Stormward:lightningResistance:13,Haste:attackSpeedPercent:5,The Hart:maxHp:34,Renewal:lifeRegen:1|Storm Tablet|18
storm-tablet|legendary|4|4|Stormward:lightningResistance:9,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6,Renewal:lifeRegen:1|Storm Tablet|18
storm-tablet|legendary|5|4|Invocation:castSpeedPercent:3,The Wellspring:maxMana:18,Sanctuary:allResistance:4,The Hart:maxHp:48|Storm Tablet|18
storm-tablet|legendary|6|4|Stormward:lightningResistance:11,Vigor:vitality:4,Prosperity:goldFindPercent:12,The Wellspring:maxMana:21|Storm Tablet|18
storm-tablet|legendary|7|4|Invocation:castSpeedPercent:5,Sanctuary:allResistance:3,The Hart:maxHp:42,Prosperity:goldFindPercent:8|Storm Tablet|18
astral-tablet|common|0|2|Spellward:arcaneResistance:7,Clarity:manaRegen:5|Astral Tablet|18
astral-tablet|common|1|2|Wisdom:xpGainPercent:5,Spellward:arcaneResistance:8|Astral Tablet|18
astral-tablet|common|2|2|Clarity:manaRegen:6,Invocation:castSpeedPercent:3|Astral Tablet|18
astral-tablet|common|3|2|Spellward:arcaneResistance:9,Severity:critDamage:6|Astral Tablet|18
astral-tablet|common|4|2|Spellward:arcaneResistance:6,The Wanderer:moveSpeedPercent:1|Astral Tablet|18
astral-tablet|common|5|2|Clarity:manaRegen:3,Ruin:damagePercent:6|Astral Tablet|18
astral-tablet|common|6|2|Spellward:arcaneResistance:7,Vigor:vitality:3|Astral Tablet|18
astral-tablet|common|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:4|Astral Tablet|18
astral-tablet|magic|0|2|Spellward:arcaneResistance:8,Clarity:manaRegen:5|Astral Tablet|18
astral-tablet|magic|1|2|Wisdom:xpGainPercent:6,Spellward:arcaneResistance:9|Astral Tablet|18
astral-tablet|magic|2|2|Clarity:manaRegen:6,Invocation:castSpeedPercent:3|Astral Tablet|18
astral-tablet|magic|3|2|Spellward:arcaneResistance:9,Severity:critDamage:7|Astral Tablet|18
astral-tablet|magic|4|2|Spellward:arcaneResistance:6,The Wanderer:moveSpeedPercent:2|Astral Tablet|18
astral-tablet|magic|5|2|Clarity:manaRegen:4,Ruin:damagePercent:6|Astral Tablet|18
astral-tablet|magic|6|2|Spellward:arcaneResistance:8,Vigor:vitality:3|Astral Tablet|18
astral-tablet|magic|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:5|Astral Tablet|18
astral-tablet|rare|0|3|Spellward:arcaneResistance:8,Clarity:manaRegen:6,Renewal:lifeRegen:1|Astral Tablet|18
astral-tablet|rare|1|3|Wisdom:xpGainPercent:6,Spellward:arcaneResistance:9,Clarity:manaRegen:5|Astral Tablet|18
astral-tablet|rare|2|3|Clarity:manaRegen:7,Invocation:castSpeedPercent:4,Spellward:arcaneResistance:10|Astral Tablet|18
astral-tablet|rare|3|3|Spellward:arcaneResistance:10,Severity:critDamage:7,The Hart:maxHp:27|Astral Tablet|18
astral-tablet|rare|4|3|Spellward:arcaneResistance:7,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:5|Astral Tablet|18
astral-tablet|rare|5|3|Clarity:manaRegen:4,Ruin:damagePercent:7,The Hart:maxHp:42|Astral Tablet|18
astral-tablet|rare|6|3|Spellward:arcaneResistance:9,Vigor:vitality:3,Wisdom:xpGainPercent:6|Astral Tablet|18
astral-tablet|rare|7|3|Wisdom:xpGainPercent:5,Grace:dexterity:5,Spellward:arcaneResistance:9|Astral Tablet|18
astral-tablet|epic|0|3|Spellward:arcaneResistance:9,Clarity:manaRegen:7,Renewal:lifeRegen:1|Astral Tablet|18
astral-tablet|epic|1|3|Wisdom:xpGainPercent:7,Spellward:arcaneResistance:10,Clarity:manaRegen:6|Astral Tablet|18
astral-tablet|epic|2|3|Clarity:manaRegen:8,Invocation:castSpeedPercent:4,Spellward:arcaneResistance:12|Astral Tablet|18
astral-tablet|epic|3|3|Spellward:arcaneResistance:11,Severity:critDamage:8,The Hart:maxHp:30|Astral Tablet|18
astral-tablet|epic|4|3|Spellward:arcaneResistance:8,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:6|Astral Tablet|18
astral-tablet|epic|5|3|Clarity:manaRegen:4,Ruin:damagePercent:8,The Hart:maxHp:46|Astral Tablet|18
astral-tablet|epic|6|3|Spellward:arcaneResistance:10,Vigor:vitality:4,Wisdom:xpGainPercent:7|Astral Tablet|18
astral-tablet|epic|7|3|Wisdom:xpGainPercent:5,Grace:dexterity:6,Spellward:arcaneResistance:10|Astral Tablet|18
astral-tablet|legendary|0|4|Spellward:arcaneResistance:11,Clarity:manaRegen:7,Renewal:lifeRegen:1,Severity:critDamage:8|Astral Tablet|18
astral-tablet|legendary|1|4|Wisdom:xpGainPercent:8,Spellward:arcaneResistance:12,Clarity:manaRegen:7,Prosperity:goldFindPercent:9|Astral Tablet|18
astral-tablet|legendary|2|4|Clarity:manaRegen:9,Invocation:castSpeedPercent:5,Spellward:arcaneResistance:13,Vigor:vitality:8|Astral Tablet|18
astral-tablet|legendary|3|4|Spellward:arcaneResistance:13,Severity:critDamage:9,The Hart:maxHp:34,Clarity:manaRegen:5|Astral Tablet|18
astral-tablet|legendary|4|4|Spellward:arcaneResistance:9,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:6,Clarity:manaRegen:8|Astral Tablet|18
astral-tablet|legendary|5|4|Clarity:manaRegen:5,Ruin:damagePercent:9,The Hart:maxHp:52,Stormward:lightningResistance:13|Astral Tablet|18
astral-tablet|legendary|6|4|Spellward:arcaneResistance:11,Vigor:vitality:4,Wisdom:xpGainPercent:8,The Wellspring:maxMana:21|Astral Tablet|18
astral-tablet|legendary|7|4|Wisdom:xpGainPercent:6,Grace:dexterity:6,Spellward:arcaneResistance:11,Clarity:manaRegen:6|Astral Tablet|18
jade-tablet|common|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Tablet|18
jade-tablet|common|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:8|Jade Tablet|18
jade-tablet|common|2|2|The Hart:maxHp:34,Haste:attackSpeedPercent:3|Jade Tablet|18
jade-tablet|common|3|2|Sanctuary:allResistance:3,Haste:attackSpeedPercent:3|Jade Tablet|18
jade-tablet|common|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Tablet|18
jade-tablet|common|5|2|The Hart:maxHp:19,Haste:attackSpeedPercent:4|Jade Tablet|18
jade-tablet|common|6|2|The Hart:maxHp:28,Cinderskin:fireResistance:5|Jade Tablet|18
jade-tablet|common|7|2|Renewal:lifeRegen:1,The Hart:maxHp:26|Jade Tablet|18
jade-tablet|magic|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Tablet|18
jade-tablet|magic|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:9|Jade Tablet|18
jade-tablet|magic|2|2|The Hart:maxHp:37,Haste:attackSpeedPercent:3|Jade Tablet|18
jade-tablet|magic|3|2|Sanctuary:allResistance:3,Haste:attackSpeedPercent:3|Jade Tablet|18
jade-tablet|magic|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Tablet|18
jade-tablet|magic|5|2|The Hart:maxHp:21,Haste:attackSpeedPercent:4|Jade Tablet|18
jade-tablet|magic|6|2|The Hart:maxHp:30,Cinderskin:fireResistance:5|Jade Tablet|18
jade-tablet|magic|7|2|Renewal:lifeRegen:1,The Hart:maxHp:29|Jade Tablet|18
jade-tablet|rare|0|3|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:5|Jade Tablet|18
jade-tablet|rare|1|3|Renewal:lifeRegen:1,Spellward:arcaneResistance:9,Clarity:manaRegen:5|Jade Tablet|18
jade-tablet|rare|2|3|The Hart:maxHp:41,Haste:attackSpeedPercent:4,Sanctuary:allResistance:3|Jade Tablet|18
jade-tablet|rare|3|3|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,The Hart:maxHp:27|Jade Tablet|18
jade-tablet|rare|4|3|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Jade Tablet|18
jade-tablet|rare|5|3|The Hart:maxHp:23,Haste:attackSpeedPercent:4,Insight:intelligence:4|Jade Tablet|18
jade-tablet|rare|6|3|The Hart:maxHp:33,Cinderskin:fireResistance:6,Wisdom:xpGainPercent:6|Jade Tablet|18
jade-tablet|rare|7|3|Renewal:lifeRegen:1,The Hart:maxHp:32,Stormward:lightningResistance:9|Jade Tablet|18
jade-tablet|epic|0|3|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:6|Jade Tablet|18
jade-tablet|epic|1|3|Renewal:lifeRegen:1,Spellward:arcaneResistance:10,Clarity:manaRegen:6|Jade Tablet|18
jade-tablet|epic|2|3|The Hart:maxHp:46,Haste:attackSpeedPercent:4,Sanctuary:allResistance:3|Jade Tablet|18
jade-tablet|epic|3|3|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,The Hart:maxHp:30|Jade Tablet|18
jade-tablet|epic|4|3|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Jade Tablet|18
jade-tablet|epic|5|3|The Hart:maxHp:26,Haste:attackSpeedPercent:5,Insight:intelligence:5|Jade Tablet|18
jade-tablet|epic|6|3|The Hart:maxHp:37,Cinderskin:fireResistance:6,Wisdom:xpGainPercent:7|Jade Tablet|18
jade-tablet|epic|7|3|Renewal:lifeRegen:1,The Hart:maxHp:35,Stormward:lightningResistance:10|Jade Tablet|18
jade-tablet|legendary|0|4|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:7,Severity:critDamage:8|Jade Tablet|18
jade-tablet|legendary|1|4|Renewal:lifeRegen:2,Spellward:arcaneResistance:12,Clarity:manaRegen:7,Wisdom:xpGainPercent:6|Jade Tablet|18
jade-tablet|legendary|2|4|The Hart:maxHp:51,Haste:attackSpeedPercent:5,Sanctuary:allResistance:4,Vigor:vitality:8|Jade Tablet|18
jade-tablet|legendary|3|4|Sanctuary:allResistance:4,Haste:attackSpeedPercent:5,The Hart:maxHp:34,Renewal:lifeRegen:1|Jade Tablet|18
jade-tablet|legendary|4|4|Sanctuary:allResistance:3,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6,Renewal:lifeRegen:1|Jade Tablet|18
jade-tablet|legendary|5|4|The Hart:maxHp:29,Haste:attackSpeedPercent:5,Insight:intelligence:5,Stormward:lightningResistance:13|Jade Tablet|18
jade-tablet|legendary|6|4|The Hart:maxHp:42,Cinderskin:fireResistance:7,Wisdom:xpGainPercent:8,The Wellspring:maxMana:21|Jade Tablet|18
jade-tablet|legendary|7|4|Renewal:lifeRegen:1,The Hart:maxHp:40,Stormward:lightningResistance:11,Efficiency:manaCostPercent:4|Jade Tablet|18
amber-tablet|common|0|2|The Wellspring:maxMana:10,Haste:attackSpeedPercent:3|Amber Tablet|18
amber-tablet|common|1|2|Prosperity:goldFindPercent:8,Spellward:arcaneResistance:8|Amber Tablet|18
amber-tablet|common|2|2|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:3|Amber Tablet|18
amber-tablet|common|3|2|The Wellspring:maxMana:13,Invocation:castSpeedPercent:3|Amber Tablet|18
amber-tablet|common|4|2|The Wellspring:maxMana:9,Invocation:castSpeedPercent:2|Amber Tablet|18
amber-tablet|common|5|2|Prosperity:goldFindPercent:4,The Wellspring:maxMana:12|Amber Tablet|18
amber-tablet|common|6|2|The Wellspring:maxMana:11,Cinderskin:fireResistance:5|Amber Tablet|18
amber-tablet|common|7|2|Prosperity:goldFindPercent:6,The Hart:maxHp:26|Amber Tablet|18
amber-tablet|magic|0|2|The Wellspring:maxMana:11,Haste:attackSpeedPercent:4|Amber Tablet|18
amber-tablet|magic|1|2|Prosperity:goldFindPercent:9,Spellward:arcaneResistance:9|Amber Tablet|18
amber-tablet|magic|2|2|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:3|Amber Tablet|18
amber-tablet|magic|3|2|The Wellspring:maxMana:14,Invocation:castSpeedPercent:3|Amber Tablet|18
amber-tablet|magic|4|2|The Wellspring:maxMana:9,Invocation:castSpeedPercent:2|Amber Tablet|18
amber-tablet|magic|5|2|Prosperity:goldFindPercent:5,The Wellspring:maxMana:13|Amber Tablet|18
amber-tablet|magic|6|2|The Wellspring:maxMana:12,Cinderskin:fireResistance:5|Amber Tablet|18
amber-tablet|magic|7|2|Prosperity:goldFindPercent:7,The Hart:maxHp:29|Amber Tablet|18
amber-tablet|rare|0|3|The Wellspring:maxMana:12,Haste:attackSpeedPercent:4,Clarity:manaRegen:5|Amber Tablet|18
amber-tablet|rare|1|3|Prosperity:goldFindPercent:10,Spellward:arcaneResistance:9,Sorcery:spellDamagePercent:7|Amber Tablet|18
amber-tablet|rare|2|3|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:4,Grace:dexterity:6|Amber Tablet|18
amber-tablet|rare|3|3|The Wellspring:maxMana:15,Invocation:castSpeedPercent:4,Rimeward:frostResistance:7|Amber Tablet|18
amber-tablet|rare|4|3|The Wellspring:maxMana:10,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:5|Amber Tablet|18
amber-tablet|rare|5|3|Prosperity:goldFindPercent:5,The Wellspring:maxMana:15,Vigor:vitality:7|Amber Tablet|18
amber-tablet|rare|6|3|The Wellspring:maxMana:13,Cinderskin:fireResistance:6,Prosperity:goldFindPercent:10|Amber Tablet|18
amber-tablet|rare|7|3|Prosperity:goldFindPercent:8,The Hart:maxHp:32,Stormward:lightningResistance:9|Amber Tablet|18
amber-tablet|epic|0|3|The Wellspring:maxMana:14,Haste:attackSpeedPercent:5,Clarity:manaRegen:6|Amber Tablet|18
amber-tablet|epic|1|3|Prosperity:goldFindPercent:11,Spellward:arcaneResistance:10,Sorcery:spellDamagePercent:8|Amber Tablet|18
amber-tablet|epic|2|3|The Wanderer:moveSpeedPercent:4,Haste:attackSpeedPercent:4,Grace:dexterity:7|Amber Tablet|18
amber-tablet|epic|3|3|The Wellspring:maxMana:17,Invocation:castSpeedPercent:4,Rimeward:frostResistance:8|Amber Tablet|18
amber-tablet|epic|4|3|The Wellspring:maxMana:12,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:6|Amber Tablet|18
amber-tablet|epic|5|3|Prosperity:goldFindPercent:6,The Wellspring:maxMana:16,Vigor:vitality:7|Amber Tablet|18
amber-tablet|epic|6|3|The Wellspring:maxMana:15,Cinderskin:fireResistance:6,Prosperity:goldFindPercent:11|Amber Tablet|18
amber-tablet|epic|7|3|Prosperity:goldFindPercent:8,The Hart:maxHp:35,Stormward:lightningResistance:10|Amber Tablet|18
amber-tablet|legendary|0|4|The Wellspring:maxMana:16,Haste:attackSpeedPercent:5,Clarity:manaRegen:7,Precision:critChance:1|Amber Tablet|18
amber-tablet|legendary|1|4|Prosperity:goldFindPercent:12,Spellward:arcaneResistance:12,Sorcery:spellDamagePercent:9,Wisdom:xpGainPercent:6|Amber Tablet|18
amber-tablet|legendary|2|4|The Wanderer:moveSpeedPercent:4,Haste:attackSpeedPercent:5,Grace:dexterity:8,Rimeward:frostResistance:13|Amber Tablet|18
amber-tablet|legendary|3|4|The Wellspring:maxMana:19,Invocation:castSpeedPercent:5,Rimeward:frostResistance:9,Renewal:lifeRegen:1|Amber Tablet|18
amber-tablet|legendary|4|4|The Wellspring:maxMana:13,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:6,Clarity:manaRegen:8|Amber Tablet|18
amber-tablet|legendary|5|4|Prosperity:goldFindPercent:7,The Wellspring:maxMana:18,Vigor:vitality:8,Stormward:lightningResistance:13|Amber Tablet|18
amber-tablet|legendary|6|4|The Wellspring:maxMana:16,Cinderskin:fireResistance:7,Prosperity:goldFindPercent:12,The Hart:maxHp:53|Amber Tablet|18
amber-tablet|legendary|7|4|Prosperity:goldFindPercent:9,The Hart:maxHp:40,Stormward:lightningResistance:11,Clarity:manaRegen:6|Amber Tablet|18
ember-spire|common|0|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:3|Ember Spire|18
ember-spire|common|1|2|The Hart:maxHp:32,Stormward:lightningResistance:7|Ember Spire|18
ember-spire|common|2|2|The Hart:maxHp:30,Haste:attackSpeedPercent:3|Ember Spire|18
ember-spire|common|3|2|Cinderskin:fireResistance:8,Invocation:castSpeedPercent:3|Ember Spire|18
ember-spire|common|4|2|Cinderskin:fireResistance:5,Haste:attackSpeedPercent:2|Ember Spire|18
ember-spire|common|5|2|The Hart:maxHp:17,Invocation:castSpeedPercent:3|Ember Spire|18
ember-spire|common|6|2|Cinderskin:fireResistance:7,Vigor:vitality:3|Ember Spire|18
ember-spire|common|7|2|The Hart:maxHp:24,Sanctuary:allResistance:2|Ember Spire|18
ember-spire|magic|0|2|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:3|Ember Spire|18
ember-spire|magic|1|2|The Hart:maxHp:35,Stormward:lightningResistance:8|Ember Spire|18
ember-spire|magic|2|2|The Hart:maxHp:33,Haste:attackSpeedPercent:3|Ember Spire|18
ember-spire|magic|3|2|Cinderskin:fireResistance:8,Invocation:castSpeedPercent:3|Ember Spire|18
ember-spire|magic|4|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:2|Ember Spire|18
ember-spire|magic|5|2|The Hart:maxHp:19,Invocation:castSpeedPercent:4|Ember Spire|18
ember-spire|magic|6|2|Cinderskin:fireResistance:7,Vigor:vitality:3|Ember Spire|18
ember-spire|magic|7|2|The Hart:maxHp:27,Sanctuary:allResistance:2|Ember Spire|18
ember-spire|rare|0|2|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:4|Ember Spire|18
ember-spire|rare|1|2|The Hart:maxHp:38,Stormward:lightningResistance:8|Ember Spire|18
ember-spire|rare|2|2|The Hart:maxHp:36,Haste:attackSpeedPercent:3|Ember Spire|18
ember-spire|rare|3|2|Cinderskin:fireResistance:9,Invocation:castSpeedPercent:3|Ember Spire|18
ember-spire|rare|4|2|Cinderskin:fireResistance:6,Haste:attackSpeedPercent:2|Ember Spire|18
ember-spire|rare|5|2|The Hart:maxHp:20,Invocation:castSpeedPercent:4|Ember Spire|18
ember-spire|rare|6|2|Cinderskin:fireResistance:8,Vigor:vitality:3|Ember Spire|18
ember-spire|rare|7|2|The Hart:maxHp:29,Sanctuary:allResistance:2|Ember Spire|18
ember-spire|epic|0|3|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:4,Clarity:manaRegen:4|Ember Spire|18
ember-spire|epic|1|3|The Hart:maxHp:43,Stormward:lightningResistance:9,Efficiency:manaCostPercent:4|Ember Spire|18
ember-spire|epic|2|3|The Hart:maxHp:41,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:10|Ember Spire|18
ember-spire|epic|3|3|Cinderskin:fireResistance:10,Invocation:castSpeedPercent:4,The Hart:maxHp:27|Ember Spire|18
ember-spire|epic|4|3|Cinderskin:fireResistance:7,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Ember Spire|18
ember-spire|epic|5|3|The Hart:maxHp:23,Invocation:castSpeedPercent:4,Sanctuary:allResistance:3|Ember Spire|18
ember-spire|epic|6|3|Cinderskin:fireResistance:9,Vigor:vitality:3,Prosperity:goldFindPercent:10|Ember Spire|18
ember-spire|epic|7|3|The Hart:maxHp:33,Sanctuary:allResistance:3,The Wellspring:maxMana:13|Ember Spire|18
ember-spire|legendary|0|3|Cinderskin:fireResistance:9,Haste:attackSpeedPercent:5,Clarity:manaRegen:5|Ember Spire|18
ember-spire|legendary|1|3|The Hart:maxHp:48,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Ember Spire|18
ember-spire|legendary|2|3|The Hart:maxHp:46,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:12|Ember Spire|18
ember-spire|legendary|3|3|Cinderskin:fireResistance:11,Invocation:castSpeedPercent:4,The Hart:maxHp:30|Ember Spire|18
ember-spire|legendary|4|3|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Ember Spire|18
ember-spire|legendary|5|3|The Hart:maxHp:26,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Ember Spire|18
ember-spire|legendary|6|3|Cinderskin:fireResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Ember Spire|18
ember-spire|legendary|7|3|The Hart:maxHp:37,Sanctuary:allResistance:3,The Wellspring:maxMana:15|Ember Spire|18
rime-spire|common|0|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:3|Rime Spire|18
rime-spire|common|1|2|The Wellspring:maxMana:13,Stormward:lightningResistance:7|Rime Spire|18
rime-spire|common|2|2|The Wellspring:maxMana:12,Haste:attackSpeedPercent:3|Rime Spire|18
rime-spire|common|3|2|Rimeward:frostResistance:8,Invocation:castSpeedPercent:3|Rime Spire|18
rime-spire|common|4|2|Rimeward:frostResistance:5,Haste:attackSpeedPercent:2|Rime Spire|18
rime-spire|common|5|2|The Wellspring:maxMana:7,Invocation:castSpeedPercent:3|Rime Spire|18
rime-spire|common|6|2|Rimeward:frostResistance:7,Vigor:vitality:3|Rime Spire|18
rime-spire|common|7|2|The Wellspring:maxMana:10,Sanctuary:allResistance:2|Rime Spire|18
rime-spire|magic|0|2|Rimeward:frostResistance:7,Haste:attackSpeedPercent:3|Rime Spire|18
rime-spire|magic|1|2|The Wellspring:maxMana:14,Stormward:lightningResistance:8|Rime Spire|18
rime-spire|magic|2|2|The Wellspring:maxMana:13,Haste:attackSpeedPercent:3|Rime Spire|18
rime-spire|magic|3|2|Rimeward:frostResistance:8,Invocation:castSpeedPercent:3|Rime Spire|18
rime-spire|magic|4|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:2|Rime Spire|18
rime-spire|magic|5|2|The Wellspring:maxMana:7,Invocation:castSpeedPercent:4|Rime Spire|18
rime-spire|magic|6|2|Rimeward:frostResistance:7,Vigor:vitality:3|Rime Spire|18
rime-spire|magic|7|2|The Wellspring:maxMana:10,Sanctuary:allResistance:2|Rime Spire|18
rime-spire|rare|0|2|Rimeward:frostResistance:8,Haste:attackSpeedPercent:4|Rime Spire|18
rime-spire|rare|1|2|The Wellspring:maxMana:15,Stormward:lightningResistance:8|Rime Spire|18
rime-spire|rare|2|2|The Wellspring:maxMana:14,Haste:attackSpeedPercent:3|Rime Spire|18
rime-spire|rare|3|2|Rimeward:frostResistance:9,Invocation:castSpeedPercent:3|Rime Spire|18
rime-spire|rare|4|2|Rimeward:frostResistance:6,Haste:attackSpeedPercent:2|Rime Spire|18
rime-spire|rare|5|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:4|Rime Spire|18
rime-spire|rare|6|2|Rimeward:frostResistance:8,Vigor:vitality:3|Rime Spire|18
rime-spire|rare|7|2|The Wellspring:maxMana:12,Sanctuary:allResistance:2|Rime Spire|18
rime-spire|epic|0|3|Rimeward:frostResistance:8,Haste:attackSpeedPercent:4,Clarity:manaRegen:4|Rime Spire|18
rime-spire|epic|1|3|The Wellspring:maxMana:17,Stormward:lightningResistance:9,Efficiency:manaCostPercent:4|Rime Spire|18
rime-spire|epic|2|3|The Wellspring:maxMana:16,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:10|Rime Spire|18
rime-spire|epic|3|3|Rimeward:frostResistance:10,Invocation:castSpeedPercent:4,The Hart:maxHp:27|Rime Spire|18
rime-spire|epic|4|3|Rimeward:frostResistance:7,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Rime Spire|18
rime-spire|epic|5|3|The Wellspring:maxMana:9,Invocation:castSpeedPercent:4,Sanctuary:allResistance:3|Rime Spire|18
rime-spire|epic|6|3|Rimeward:frostResistance:9,Vigor:vitality:3,Prosperity:goldFindPercent:10|Rime Spire|18
rime-spire|epic|7|3|The Wellspring:maxMana:13,Sanctuary:allResistance:3,The Hart:maxHp:33|Rime Spire|18
rime-spire|legendary|0|3|Rimeward:frostResistance:9,Haste:attackSpeedPercent:5,Clarity:manaRegen:5|Rime Spire|18
rime-spire|legendary|1|3|The Wellspring:maxMana:19,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Rime Spire|18
rime-spire|legendary|2|3|The Wellspring:maxMana:18,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:12|Rime Spire|18
rime-spire|legendary|3|3|Rimeward:frostResistance:11,Invocation:castSpeedPercent:4,The Hart:maxHp:30|Rime Spire|18
rime-spire|legendary|4|3|Rimeward:frostResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Rime Spire|18
rime-spire|legendary|5|3|The Wellspring:maxMana:10,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Rime Spire|18
rime-spire|legendary|6|3|Rimeward:frostResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Rime Spire|18
rime-spire|legendary|7|3|The Wellspring:maxMana:14,Sanctuary:allResistance:3,The Hart:maxHp:37|Rime Spire|18
storm-spire|common|0|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:3|Storm Spire|18
storm-spire|common|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:7|Storm Spire|18
storm-spire|common|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:9|Storm Spire|18
storm-spire|common|3|2|Stormward:lightningResistance:8,Haste:attackSpeedPercent:3|Storm Spire|18
storm-spire|common|4|2|Stormward:lightningResistance:5,Haste:attackSpeedPercent:2|Storm Spire|18
storm-spire|common|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:11|Storm Spire|18
storm-spire|common|6|2|Stormward:lightningResistance:7,Vigor:vitality:3|Storm Spire|18
storm-spire|common|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Spire|18
storm-spire|magic|0|2|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3|Storm Spire|18
storm-spire|magic|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:8|Storm Spire|18
storm-spire|magic|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:10|Storm Spire|18
storm-spire|magic|3|2|Stormward:lightningResistance:8,Haste:attackSpeedPercent:3|Storm Spire|18
storm-spire|magic|4|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Spire|18
storm-spire|magic|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:12|Storm Spire|18
storm-spire|magic|6|2|Stormward:lightningResistance:7,Vigor:vitality:3|Storm Spire|18
storm-spire|magic|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Spire|18
storm-spire|rare|0|2|Stormward:lightningResistance:8,Haste:attackSpeedPercent:4|Storm Spire|18
storm-spire|rare|1|2|Haste:attackSpeedPercent:4,Stormward:lightningResistance:8|Storm Spire|18
storm-spire|rare|2|2|Invocation:castSpeedPercent:4,The Wellspring:maxMana:11|Storm Spire|18
storm-spire|rare|3|2|Stormward:lightningResistance:9,Haste:attackSpeedPercent:3|Storm Spire|18
storm-spire|rare|4|2|Stormward:lightningResistance:6,Haste:attackSpeedPercent:2|Storm Spire|18
storm-spire|rare|5|2|Invocation:castSpeedPercent:2,The Wellspring:maxMana:13|Storm Spire|18
storm-spire|rare|6|2|Stormward:lightningResistance:8,Vigor:vitality:3|Storm Spire|18
storm-spire|rare|7|2|Invocation:castSpeedPercent:3,Sanctuary:allResistance:2|Storm Spire|18
storm-spire|epic|0|3|Stormward:lightningResistance:8,Haste:attackSpeedPercent:4,Renewal:lifeRegen:1|Storm Spire|18
storm-spire|epic|1|3|Haste:attackSpeedPercent:5,Stormward:lightningResistance:9,Efficiency:manaCostPercent:4|Storm Spire|18
storm-spire|epic|2|3|Invocation:castSpeedPercent:5,The Wellspring:maxMana:13,Spellward:arcaneResistance:10|Storm Spire|18
storm-spire|epic|3|3|Stormward:lightningResistance:10,Haste:attackSpeedPercent:4,The Hart:maxHp:27|Storm Spire|18
storm-spire|epic|4|3|Stormward:lightningResistance:7,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Storm Spire|18
storm-spire|epic|5|3|Invocation:castSpeedPercent:3,The Wellspring:maxMana:15,Sanctuary:allResistance:3|Storm Spire|18
storm-spire|epic|6|3|Stormward:lightningResistance:9,Vigor:vitality:3,Prosperity:goldFindPercent:10|Storm Spire|18
storm-spire|epic|7|3|Invocation:castSpeedPercent:4,Sanctuary:allResistance:3,The Hart:maxHp:33|Storm Spire|18
storm-spire|legendary|0|3|Stormward:lightningResistance:9,Haste:attackSpeedPercent:5,Renewal:lifeRegen:1|Storm Spire|18
storm-spire|legendary|1|3|Haste:attackSpeedPercent:6,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Storm Spire|18
storm-spire|legendary|2|3|Invocation:castSpeedPercent:5,The Wellspring:maxMana:14,Spellward:arcaneResistance:12|Storm Spire|18
storm-spire|legendary|3|3|Stormward:lightningResistance:11,Haste:attackSpeedPercent:4,The Hart:maxHp:30|Storm Spire|18
storm-spire|legendary|4|3|Stormward:lightningResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Storm Spire|18
storm-spire|legendary|5|3|Invocation:castSpeedPercent:3,The Wellspring:maxMana:16,Sanctuary:allResistance:4|Storm Spire|18
storm-spire|legendary|6|3|Stormward:lightningResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Storm Spire|18
storm-spire|legendary|7|3|Invocation:castSpeedPercent:4,Sanctuary:allResistance:3,The Hart:maxHp:37|Storm Spire|18
astral-spire|common|0|2|Spellward:arcaneResistance:6,Clarity:manaRegen:4|Astral Spire|18
astral-spire|common|1|2|Wisdom:xpGainPercent:5,Spellward:arcaneResistance:7|Astral Spire|18
astral-spire|common|2|2|Clarity:manaRegen:4,Invocation:castSpeedPercent:3|Astral Spire|18
astral-spire|common|3|2|Spellward:arcaneResistance:8,Severity:critDamage:6|Astral Spire|18
astral-spire|common|4|2|Spellward:arcaneResistance:5,The Wanderer:moveSpeedPercent:1|Astral Spire|18
astral-spire|common|5|2|Clarity:manaRegen:2,Ruin:damagePercent:5|Astral Spire|18
astral-spire|common|6|2|Spellward:arcaneResistance:7,Vigor:vitality:3|Astral Spire|18
astral-spire|common|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:4|Astral Spire|18
astral-spire|magic|0|2|Spellward:arcaneResistance:7,Clarity:manaRegen:4|Astral Spire|18
astral-spire|magic|1|2|Wisdom:xpGainPercent:5,Spellward:arcaneResistance:8|Astral Spire|18
astral-spire|magic|2|2|Clarity:manaRegen:5,Invocation:castSpeedPercent:3|Astral Spire|18
astral-spire|magic|3|2|Spellward:arcaneResistance:8,Severity:critDamage:6|Astral Spire|18
astral-spire|magic|4|2|Spellward:arcaneResistance:6,The Wanderer:moveSpeedPercent:1|Astral Spire|18
astral-spire|magic|5|2|Clarity:manaRegen:3,Ruin:damagePercent:6|Astral Spire|18
astral-spire|magic|6|2|Spellward:arcaneResistance:7,Vigor:vitality:3|Astral Spire|18
astral-spire|magic|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:4|Astral Spire|18
astral-spire|rare|0|2|Spellward:arcaneResistance:8,Clarity:manaRegen:4|Astral Spire|18
astral-spire|rare|1|2|Wisdom:xpGainPercent:6,Spellward:arcaneResistance:8|Astral Spire|18
astral-spire|rare|2|2|Clarity:manaRegen:5,Invocation:castSpeedPercent:3|Astral Spire|18
astral-spire|rare|3|2|Spellward:arcaneResistance:9,Severity:critDamage:7|Astral Spire|18
astral-spire|rare|4|2|Spellward:arcaneResistance:6,The Wanderer:moveSpeedPercent:2|Astral Spire|18
astral-spire|rare|5|2|Clarity:manaRegen:3,Ruin:damagePercent:6|Astral Spire|18
astral-spire|rare|6|2|Spellward:arcaneResistance:8,Vigor:vitality:3|Astral Spire|18
astral-spire|rare|7|2|Wisdom:xpGainPercent:4,Grace:dexterity:5|Astral Spire|18
astral-spire|epic|0|3|Spellward:arcaneResistance:8,Clarity:manaRegen:5,Renewal:lifeRegen:1|Astral Spire|18
astral-spire|epic|1|3|Wisdom:xpGainPercent:6,Spellward:arcaneResistance:9,Clarity:manaRegen:4|Astral Spire|18
astral-spire|epic|2|3|Clarity:manaRegen:6,Invocation:castSpeedPercent:4,Spellward:arcaneResistance:10|Astral Spire|18
astral-spire|epic|3|3|Spellward:arcaneResistance:10,Severity:critDamage:7,The Hart:maxHp:27|Astral Spire|18
astral-spire|epic|4|3|Spellward:arcaneResistance:7,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:5|Astral Spire|18
astral-spire|epic|5|3|Clarity:manaRegen:3,Ruin:damagePercent:7,The Hart:maxHp:41|Astral Spire|18
astral-spire|epic|6|3|Spellward:arcaneResistance:9,Vigor:vitality:3,Wisdom:xpGainPercent:6|Astral Spire|18
astral-spire|epic|7|3|Wisdom:xpGainPercent:5,Grace:dexterity:5,Spellward:arcaneResistance:9|Astral Spire|18
astral-spire|legendary|0|3|Spellward:arcaneResistance:9,Clarity:manaRegen:6,Renewal:lifeRegen:1|Astral Spire|18
astral-spire|legendary|1|3|Wisdom:xpGainPercent:7,Spellward:arcaneResistance:10,Clarity:manaRegen:5|Astral Spire|18
astral-spire|legendary|2|3|Clarity:manaRegen:7,Invocation:castSpeedPercent:4,Spellward:arcaneResistance:12|Astral Spire|18
astral-spire|legendary|3|3|Spellward:arcaneResistance:11,Severity:critDamage:8,The Hart:maxHp:30|Astral Spire|18
astral-spire|legendary|4|3|Spellward:arcaneResistance:8,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:6|Astral Spire|18
astral-spire|legendary|5|3|Clarity:manaRegen:4,Ruin:damagePercent:8,The Hart:maxHp:46|Astral Spire|18
astral-spire|legendary|6|3|Spellward:arcaneResistance:10,Vigor:vitality:4,Wisdom:xpGainPercent:7|Astral Spire|18
astral-spire|legendary|7|3|Wisdom:xpGainPercent:5,Grace:dexterity:6,Spellward:arcaneResistance:10|Astral Spire|18
jade-spire|common|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Spire|18
jade-spire|common|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:7|Jade Spire|18
jade-spire|common|2|2|The Hart:maxHp:30,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|common|3|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|common|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Spire|18
jade-spire|common|5|2|The Hart:maxHp:17,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|common|6|2|The Hart:maxHp:25,Cinderskin:fireResistance:4|Jade Spire|18
jade-spire|common|7|2|Renewal:lifeRegen:1,The Hart:maxHp:23|Jade Spire|18
jade-spire|magic|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Spire|18
jade-spire|magic|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:8|Jade Spire|18
jade-spire|magic|2|2|The Hart:maxHp:33,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|magic|3|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|magic|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Spire|18
jade-spire|magic|5|2|The Hart:maxHp:19,Haste:attackSpeedPercent:4|Jade Spire|18
jade-spire|magic|6|2|The Hart:maxHp:27,Cinderskin:fireResistance:5|Jade Spire|18
jade-spire|magic|7|2|Renewal:lifeRegen:1,The Hart:maxHp:26|Jade Spire|18
jade-spire|rare|0|2|Sanctuary:allResistance:2,Precision:critChance:1|Jade Spire|18
jade-spire|rare|1|2|Renewal:lifeRegen:1,Spellward:arcaneResistance:8|Jade Spire|18
jade-spire|rare|2|2|The Hart:maxHp:36,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|rare|3|2|Sanctuary:allResistance:3,Haste:attackSpeedPercent:3|Jade Spire|18
jade-spire|rare|4|2|Sanctuary:allResistance:2,Haste:attackSpeedPercent:2|Jade Spire|18
jade-spire|rare|5|2|The Hart:maxHp:20,Haste:attackSpeedPercent:4|Jade Spire|18
jade-spire|rare|6|2|The Hart:maxHp:30,Cinderskin:fireResistance:5|Jade Spire|18
jade-spire|rare|7|2|Renewal:lifeRegen:1,The Hart:maxHp:28|Jade Spire|18
jade-spire|epic|0|3|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:4|Jade Spire|18
jade-spire|epic|1|3|Renewal:lifeRegen:1,Spellward:arcaneResistance:9,Clarity:manaRegen:4|Jade Spire|18
jade-spire|epic|2|3|The Hart:maxHp:41,Haste:attackSpeedPercent:4,Sanctuary:allResistance:3|Jade Spire|18
jade-spire|epic|3|3|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,The Hart:maxHp:27|Jade Spire|18
jade-spire|epic|4|3|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:5|Jade Spire|18
jade-spire|epic|5|3|The Hart:maxHp:23,Haste:attackSpeedPercent:4,Insight:intelligence:4|Jade Spire|18
jade-spire|epic|6|3|The Hart:maxHp:33,Cinderskin:fireResistance:6,Wisdom:xpGainPercent:6|Jade Spire|18
jade-spire|epic|7|3|Renewal:lifeRegen:1,The Hart:maxHp:31,Stormward:lightningResistance:9|Jade Spire|18
jade-spire|legendary|0|3|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:5|Jade Spire|18
jade-spire|legendary|1|3|Renewal:lifeRegen:1,Spellward:arcaneResistance:10,Clarity:manaRegen:5|Jade Spire|18
jade-spire|legendary|2|3|The Hart:maxHp:46,Haste:attackSpeedPercent:4,Sanctuary:allResistance:3|Jade Spire|18
jade-spire|legendary|3|3|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,The Hart:maxHp:30|Jade Spire|18
jade-spire|legendary|4|3|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Jade Spire|18
jade-spire|legendary|5|3|The Hart:maxHp:26,Haste:attackSpeedPercent:5,Insight:intelligence:5|Jade Spire|18
jade-spire|legendary|6|3|The Hart:maxHp:37,Cinderskin:fireResistance:6,Wisdom:xpGainPercent:7|Jade Spire|18
jade-spire|legendary|7|3|Renewal:lifeRegen:1,The Hart:maxHp:35,Stormward:lightningResistance:10|Jade Spire|18
amber-spire|common|0|2|The Wellspring:maxMana:9,Haste:attackSpeedPercent:3|Amber Spire|18
amber-spire|common|1|2|Prosperity:goldFindPercent:7,Spellward:arcaneResistance:7|Amber Spire|18
amber-spire|common|2|2|The Wanderer:moveSpeedPercent:2,Haste:attackSpeedPercent:3|Amber Spire|18
amber-spire|common|3|2|The Wellspring:maxMana:11,Invocation:castSpeedPercent:3|Amber Spire|18
amber-spire|common|4|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:2|Amber Spire|18
amber-spire|common|5|2|Prosperity:goldFindPercent:4,The Wellspring:maxMana:11|Amber Spire|18
amber-spire|common|6|2|The Wellspring:maxMana:10,Cinderskin:fireResistance:4|Amber Spire|18
amber-spire|common|7|2|Prosperity:goldFindPercent:6,The Hart:maxHp:23|Amber Spire|18
amber-spire|magic|0|2|The Wellspring:maxMana:10,Haste:attackSpeedPercent:3|Amber Spire|18
amber-spire|magic|1|2|Prosperity:goldFindPercent:8,Spellward:arcaneResistance:8|Amber Spire|18
amber-spire|magic|2|2|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:3|Amber Spire|18
amber-spire|magic|3|2|The Wellspring:maxMana:12,Invocation:castSpeedPercent:3|Amber Spire|18
amber-spire|magic|4|2|The Wellspring:maxMana:8,Invocation:castSpeedPercent:2|Amber Spire|18
amber-spire|magic|5|2|Prosperity:goldFindPercent:4,The Wellspring:maxMana:12|Amber Spire|18
amber-spire|magic|6|2|The Wellspring:maxMana:11,Cinderskin:fireResistance:5|Amber Spire|18
amber-spire|magic|7|2|Prosperity:goldFindPercent:6,The Hart:maxHp:26|Amber Spire|18
amber-spire|rare|0|2|The Wellspring:maxMana:11,Haste:attackSpeedPercent:4|Amber Spire|18
amber-spire|rare|1|2|Prosperity:goldFindPercent:9,Spellward:arcaneResistance:8|Amber Spire|18
amber-spire|rare|2|2|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:3|Amber Spire|18
amber-spire|rare|3|2|The Wellspring:maxMana:13,Invocation:castSpeedPercent:3|Amber Spire|18
amber-spire|rare|4|2|The Wellspring:maxMana:9,Invocation:castSpeedPercent:2|Amber Spire|18
amber-spire|rare|5|2|Prosperity:goldFindPercent:5,The Wellspring:maxMana:13|Amber Spire|18
amber-spire|rare|6|2|The Wellspring:maxMana:12,Cinderskin:fireResistance:5|Amber Spire|18
amber-spire|rare|7|2|Prosperity:goldFindPercent:7,The Hart:maxHp:28|Amber Spire|18
amber-spire|epic|0|3|The Wellspring:maxMana:12,Haste:attackSpeedPercent:4,Clarity:manaRegen:4|Amber Spire|18
amber-spire|epic|1|3|Prosperity:goldFindPercent:10,Spellward:arcaneResistance:9,Sorcery:spellDamagePercent:7|Amber Spire|18
amber-spire|epic|2|3|The Wanderer:moveSpeedPercent:3,Haste:attackSpeedPercent:4,Grace:dexterity:6|Amber Spire|18
amber-spire|epic|3|3|The Wellspring:maxMana:15,Invocation:castSpeedPercent:4,Rimeward:frostResistance:7|Amber Spire|18
amber-spire|epic|4|3|The Wellspring:maxMana:10,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:5|Amber Spire|18
amber-spire|epic|5|3|Prosperity:goldFindPercent:5,The Wellspring:maxMana:15,Vigor:vitality:7|Amber Spire|18
amber-spire|epic|6|3|The Wellspring:maxMana:13,Cinderskin:fireResistance:6,Prosperity:goldFindPercent:10|Amber Spire|18
amber-spire|epic|7|3|Prosperity:goldFindPercent:8,The Hart:maxHp:31,Stormward:lightningResistance:9|Amber Spire|18
amber-spire|legendary|0|3|The Wellspring:maxMana:14,Haste:attackSpeedPercent:5,Clarity:manaRegen:5|Amber Spire|18
amber-spire|legendary|1|3|Prosperity:goldFindPercent:11,Spellward:arcaneResistance:10,Sorcery:spellDamagePercent:8|Amber Spire|18
amber-spire|legendary|2|3|The Wanderer:moveSpeedPercent:4,Haste:attackSpeedPercent:4,Grace:dexterity:7|Amber Spire|18
amber-spire|legendary|3|3|The Wellspring:maxMana:17,Invocation:castSpeedPercent:4,Rimeward:frostResistance:8|Amber Spire|18
amber-spire|legendary|4|3|The Wellspring:maxMana:12,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:6|Amber Spire|18
amber-spire|legendary|5|3|Prosperity:goldFindPercent:6,The Wellspring:maxMana:16,Vigor:vitality:7|Amber Spire|18
amber-spire|legendary|6|3|The Wellspring:maxMana:15,Cinderskin:fireResistance:6,Prosperity:goldFindPercent:11|Amber Spire|18
amber-spire|legendary|7|3|Prosperity:goldFindPercent:8,The Hart:maxHp:35,Stormward:lightningResistance:10|Amber Spire|18
ember-heart|common|0|3|Cinderskin:fireResistance:9,Haste:attackSpeedPercent:5,Clarity:manaRegen:7|Ember Heartstone|18
ember-heart|common|1|3|The Hart:maxHp:48,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Ember Heartstone|18
ember-heart|common|2|3|The Hart:maxHp:46,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:12|Ember Heartstone|18
ember-heart|common|3|3|Cinderskin:fireResistance:12,Invocation:castSpeedPercent:4,The Hart:maxHp:30|Ember Heartstone|18
ember-heart|common|4|3|Cinderskin:fireResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Ember Heartstone|18
ember-heart|common|5|3|The Hart:maxHp:26,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Ember Heartstone|18
ember-heart|common|6|3|Cinderskin:fireResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Ember Heartstone|18
ember-heart|common|7|3|The Hart:maxHp:37,Sanctuary:allResistance:3,The Wellspring:maxMana:15|Ember Heartstone|18
ember-heart|magic|0|3|Cinderskin:fireResistance:10,Haste:attackSpeedPercent:5,Clarity:manaRegen:7|Ember Heartstone|18
ember-heart|magic|1|3|The Hart:maxHp:53,Stormward:lightningResistance:11,Efficiency:manaCostPercent:5|Ember Heartstone|18
ember-heart|magic|2|3|The Hart:maxHp:50,Haste:attackSpeedPercent:5,Spellward:arcaneResistance:13|Ember Heartstone|18
ember-heart|magic|3|3|Cinderskin:fireResistance:13,Invocation:castSpeedPercent:5,The Hart:maxHp:33|Ember Heartstone|18
ember-heart|magic|4|3|Cinderskin:fireResistance:9,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Ember Heartstone|18
ember-heart|magic|5|3|The Hart:maxHp:28,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Ember Heartstone|18
ember-heart|magic|6|3|Cinderskin:fireResistance:11,Vigor:vitality:4,Prosperity:goldFindPercent:12|Ember Heartstone|18
ember-heart|magic|7|3|The Hart:maxHp:40,Sanctuary:allResistance:3,The Wellspring:maxMana:16|Ember Heartstone|18
ember-heart|rare|0|4|Cinderskin:fireResistance:11,Haste:attackSpeedPercent:6,Clarity:manaRegen:8,The Wanderer:moveSpeedPercent:3|Ember Heartstone|18
ember-heart|rare|1|4|The Hart:maxHp:58,Stormward:lightningResistance:13,Efficiency:manaCostPercent:5,Wisdom:xpGainPercent:6|Ember Heartstone|18
ember-heart|rare|2|4|The Hart:maxHp:55,Haste:attackSpeedPercent:5,Spellward:arcaneResistance:14,Vigor:vitality:8|Ember Heartstone|18
ember-heart|rare|3|4|Cinderskin:fireResistance:14,Invocation:castSpeedPercent:5,The Hart:maxHp:36,Renewal:lifeRegen:1|Ember Heartstone|18
ember-heart|rare|4|4|Cinderskin:fireResistance:9,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Clarity:manaRegen:10|Ember Heartstone|18
ember-heart|rare|5|4|The Hart:maxHp:31,Invocation:castSpeedPercent:6,Sanctuary:allResistance:4,The Wellspring:maxMana:21|Ember Heartstone|18
ember-heart|rare|6|4|Cinderskin:fireResistance:12,Vigor:vitality:5,Prosperity:goldFindPercent:13,The Hart:maxHp:57|Ember Heartstone|18
ember-heart|rare|7|4|The Hart:maxHp:44,Sanctuary:allResistance:3,The Wellspring:maxMana:18,Readiness:cooldownPercent:3|Ember Heartstone|18
ember-heart|epic|0|4|Cinderskin:fireResistance:13,Haste:attackSpeedPercent:6,Clarity:manaRegen:9,The Wanderer:moveSpeedPercent:3|Ember Heartstone|18
ember-heart|epic|1|4|The Hart:maxHp:65,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6,Wisdom:xpGainPercent:7|Ember Heartstone|18
ember-heart|epic|2|4|The Hart:maxHp:61,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:16,Vigor:vitality:9|Ember Heartstone|18
ember-heart|epic|3|4|Cinderskin:fireResistance:15,Invocation:castSpeedPercent:6,The Hart:maxHp:41,Renewal:lifeRegen:1|Ember Heartstone|18
ember-heart|epic|4|4|Cinderskin:fireResistance:11,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Clarity:manaRegen:11|Ember Heartstone|18
ember-heart|epic|5|4|The Hart:maxHp:35,Invocation:castSpeedPercent:7,Sanctuary:allResistance:5,The Wellspring:maxMana:23|Ember Heartstone|18
ember-heart|epic|6|4|Cinderskin:fireResistance:13,Vigor:vitality:5,Prosperity:goldFindPercent:15,The Hart:maxHp:63|Ember Heartstone|18
ember-heart|epic|7|4|The Hart:maxHp:49,Sanctuary:allResistance:4,The Wellspring:maxMana:20,Readiness:cooldownPercent:3|Ember Heartstone|18
ember-heart|legendary|0|5|Cinderskin:fireResistance:14,Haste:attackSpeedPercent:7,Clarity:manaRegen:10,The Wanderer:moveSpeedPercent:3,Vigor:vitality:11|Ember Heartstone|18
ember-heart|legendary|1|5|The Hart:maxHp:72,Stormward:lightningResistance:16,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:8,Haste:attackSpeedPercent:5|Ember Heartstone|18
ember-heart|legendary|2|5|The Hart:maxHp:69,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:17,Vigor:vitality:10,The Wellspring:maxMana:20|Ember Heartstone|18
ember-heart|legendary|3|5|Cinderskin:fireResistance:17,Invocation:castSpeedPercent:6,The Hart:maxHp:45,Renewal:lifeRegen:1,Insight:intelligence:6|Ember Heartstone|18
ember-heart|legendary|4|5|Cinderskin:fireResistance:12,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:9,Clarity:manaRegen:12,The Hart:maxHp:63|Ember Heartstone|18
ember-heart|legendary|5|5|The Hart:maxHp:39,Invocation:castSpeedPercent:7,Sanctuary:allResistance:6,The Wellspring:maxMana:26,Prosperity:goldFindPercent:14|Ember Heartstone|18
ember-heart|legendary|6|5|Cinderskin:fireResistance:15,Vigor:vitality:6,Prosperity:goldFindPercent:17,The Hart:maxHp:71,Invocation:castSpeedPercent:4|Ember Heartstone|18
ember-heart|legendary|7|5|The Hart:maxHp:55,Sanctuary:allResistance:4,The Wellspring:maxMana:22,Readiness:cooldownPercent:3,Ruin:damagePercent:12|Ember Heartstone|18
rime-heart|common|0|3|Rimeward:frostResistance:9,Haste:attackSpeedPercent:5,Clarity:manaRegen:7|Rime Heartstone|18
rime-heart|common|1|3|The Wellspring:maxMana:19,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Rime Heartstone|18
rime-heart|common|2|3|The Wellspring:maxMana:18,Haste:attackSpeedPercent:4,Spellward:arcaneResistance:12|Rime Heartstone|18
rime-heart|common|3|3|Rimeward:frostResistance:12,Invocation:castSpeedPercent:4,The Hart:maxHp:30|Rime Heartstone|18
rime-heart|common|4|3|Rimeward:frostResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Rime Heartstone|18
rime-heart|common|5|3|The Wellspring:maxMana:10,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Rime Heartstone|18
rime-heart|common|6|3|Rimeward:frostResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Rime Heartstone|18
rime-heart|common|7|3|The Wellspring:maxMana:15,Sanctuary:allResistance:3,The Hart:maxHp:38|Rime Heartstone|18
rime-heart|magic|0|3|Rimeward:frostResistance:10,Haste:attackSpeedPercent:5,Clarity:manaRegen:7|Rime Heartstone|18
rime-heart|magic|1|3|The Wellspring:maxMana:21,Stormward:lightningResistance:11,Efficiency:manaCostPercent:5|Rime Heartstone|18
rime-heart|magic|2|3|The Wellspring:maxMana:20,Haste:attackSpeedPercent:5,Spellward:arcaneResistance:13|Rime Heartstone|18
rime-heart|magic|3|3|Rimeward:frostResistance:13,Invocation:castSpeedPercent:5,The Hart:maxHp:33|Rime Heartstone|18
rime-heart|magic|4|3|Rimeward:frostResistance:9,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Rime Heartstone|18
rime-heart|magic|5|3|The Wellspring:maxMana:11,Invocation:castSpeedPercent:5,Sanctuary:allResistance:4|Rime Heartstone|18
rime-heart|magic|6|3|Rimeward:frostResistance:11,Vigor:vitality:4,Prosperity:goldFindPercent:12|Rime Heartstone|18
rime-heart|magic|7|3|The Wellspring:maxMana:16,Sanctuary:allResistance:3,The Hart:maxHp:41|Rime Heartstone|18
rime-heart|rare|0|4|Rimeward:frostResistance:11,Haste:attackSpeedPercent:6,Clarity:manaRegen:8,The Wanderer:moveSpeedPercent:3|Rime Heartstone|18
rime-heart|rare|1|4|The Wellspring:maxMana:23,Stormward:lightningResistance:13,Efficiency:manaCostPercent:5,Wisdom:xpGainPercent:6|Rime Heartstone|18
rime-heart|rare|2|4|The Wellspring:maxMana:22,Haste:attackSpeedPercent:5,Spellward:arcaneResistance:14,Vigor:vitality:8|Rime Heartstone|18
rime-heart|rare|3|4|Rimeward:frostResistance:14,Invocation:castSpeedPercent:5,The Hart:maxHp:36,Clarity:manaRegen:7|Rime Heartstone|18
rime-heart|rare|4|4|Rimeward:frostResistance:9,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Clarity:manaRegen:10|Rime Heartstone|18
rime-heart|rare|5|4|The Wellspring:maxMana:12,Invocation:castSpeedPercent:6,Sanctuary:allResistance:4,The Hart:maxHp:52|Rime Heartstone|18
rime-heart|rare|6|4|Rimeward:frostResistance:12,Vigor:vitality:5,Prosperity:goldFindPercent:13,The Wellspring:maxMana:22|Rime Heartstone|18
rime-heart|rare|7|4|The Wellspring:maxMana:17,Sanctuary:allResistance:3,The Hart:maxHp:45,Readiness:cooldownPercent:3|Rime Heartstone|18
rime-heart|epic|0|4|Rimeward:frostResistance:13,Haste:attackSpeedPercent:6,Clarity:manaRegen:9,The Wanderer:moveSpeedPercent:3|Rime Heartstone|18
rime-heart|epic|1|4|The Wellspring:maxMana:25,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6,Wisdom:xpGainPercent:7|Rime Heartstone|18
rime-heart|epic|2|4|The Wellspring:maxMana:24,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:16,Vigor:vitality:9|Rime Heartstone|18
rime-heart|epic|3|4|Rimeward:frostResistance:15,Invocation:castSpeedPercent:6,The Hart:maxHp:41,Clarity:manaRegen:7|Rime Heartstone|18
rime-heart|epic|4|4|Rimeward:frostResistance:11,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Clarity:manaRegen:11|Rime Heartstone|18
rime-heart|epic|5|4|The Wellspring:maxMana:14,Invocation:castSpeedPercent:7,Sanctuary:allResistance:5,The Hart:maxHp:58|Rime Heartstone|18
rime-heart|epic|6|4|Rimeward:frostResistance:13,Vigor:vitality:5,Prosperity:goldFindPercent:15,The Wellspring:maxMana:25|Rime Heartstone|18
rime-heart|epic|7|4|The Wellspring:maxMana:19,Sanctuary:allResistance:4,The Hart:maxHp:50,Readiness:cooldownPercent:3|Rime Heartstone|18
rime-heart|legendary|0|5|Rimeward:frostResistance:14,Haste:attackSpeedPercent:7,Clarity:manaRegen:10,The Wanderer:moveSpeedPercent:3,Vigor:vitality:11|Rime Heartstone|18
rime-heart|legendary|1|5|The Wellspring:maxMana:28,Stormward:lightningResistance:16,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:8,Haste:attackSpeedPercent:5|Rime Heartstone|18
rime-heart|legendary|2|5|The Wellspring:maxMana:27,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:17,Vigor:vitality:10,The Hart:maxHp:52|Rime Heartstone|18
rime-heart|legendary|3|5|Rimeward:frostResistance:17,Invocation:castSpeedPercent:6,The Hart:maxHp:45,Clarity:manaRegen:8,Insight:intelligence:6|Rime Heartstone|18
rime-heart|legendary|4|5|Rimeward:frostResistance:12,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:9,Clarity:manaRegen:12,The Wellspring:maxMana:25|Rime Heartstone|18
rime-heart|legendary|5|5|The Wellspring:maxMana:15,Invocation:castSpeedPercent:7,Sanctuary:allResistance:6,The Hart:maxHp:65,Prosperity:goldFindPercent:14|Rime Heartstone|18
rime-heart|legendary|6|5|Rimeward:frostResistance:15,Vigor:vitality:6,Prosperity:goldFindPercent:17,The Wellspring:maxMana:28,Invocation:castSpeedPercent:4|Rime Heartstone|18
rime-heart|legendary|7|5|The Wellspring:maxMana:22,Sanctuary:allResistance:4,The Hart:maxHp:56,Readiness:cooldownPercent:3,Ruin:damagePercent:12|Rime Heartstone|18
storm-heart|common|0|3|Stormward:lightningResistance:9,Haste:attackSpeedPercent:5,Renewal:lifeRegen:1|Storm Heartstone|18
storm-heart|common|1|3|Haste:attackSpeedPercent:6,Stormward:lightningResistance:10,Efficiency:manaCostPercent:5|Storm Heartstone|18
storm-heart|common|2|3|Invocation:castSpeedPercent:5,The Wellspring:maxMana:14,Spellward:arcaneResistance:12|Storm Heartstone|18
storm-heart|common|3|3|Stormward:lightningResistance:12,Haste:attackSpeedPercent:4,The Hart:maxHp:30|Storm Heartstone|18
storm-heart|common|4|3|Stormward:lightningResistance:8,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Storm Heartstone|18
storm-heart|common|5|3|Invocation:castSpeedPercent:3,The Wellspring:maxMana:17,Sanctuary:allResistance:4|Storm Heartstone|18
storm-heart|common|6|3|Stormward:lightningResistance:10,Vigor:vitality:4,Prosperity:goldFindPercent:11|Storm Heartstone|18
storm-heart|common|7|3|Invocation:castSpeedPercent:4,Sanctuary:allResistance:3,The Hart:maxHp:38|Storm Heartstone|18
storm-heart|magic|0|3|Stormward:lightningResistance:10,Haste:attackSpeedPercent:5,Renewal:lifeRegen:1|Storm Heartstone|18
storm-heart|magic|1|3|Haste:attackSpeedPercent:6,Stormward:lightningResistance:11,Efficiency:manaCostPercent:5|Storm Heartstone|18
storm-heart|magic|2|3|Invocation:castSpeedPercent:6,The Wellspring:maxMana:16,Spellward:arcaneResistance:13|Storm Heartstone|18
storm-heart|magic|3|3|Stormward:lightningResistance:13,Haste:attackSpeedPercent:5,The Hart:maxHp:33|Storm Heartstone|18
storm-heart|magic|4|3|Stormward:lightningResistance:9,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Storm Heartstone|18
storm-heart|magic|5|3|Invocation:castSpeedPercent:3,The Wellspring:maxMana:18,Sanctuary:allResistance:4|Storm Heartstone|18
storm-heart|magic|6|3|Stormward:lightningResistance:11,Vigor:vitality:4,Prosperity:goldFindPercent:12|Storm Heartstone|18
storm-heart|magic|7|3|Invocation:castSpeedPercent:5,Sanctuary:allResistance:3,The Hart:maxHp:41|Storm Heartstone|18
storm-heart|rare|0|4|Stormward:lightningResistance:11,Haste:attackSpeedPercent:6,Renewal:lifeRegen:1,Clarity:manaRegen:7|Storm Heartstone|18
storm-heart|rare|1|4|Haste:attackSpeedPercent:7,Stormward:lightningResistance:13,Efficiency:manaCostPercent:5,Wisdom:xpGainPercent:6|Storm Heartstone|18
storm-heart|rare|2|4|Invocation:castSpeedPercent:6,The Wellspring:maxMana:17,Spellward:arcaneResistance:14,Vigor:vitality:8|Storm Heartstone|18
storm-heart|rare|3|4|Stormward:lightningResistance:14,Haste:attackSpeedPercent:5,The Hart:maxHp:36,Renewal:lifeRegen:1|Storm Heartstone|18
storm-heart|rare|4|4|Stormward:lightningResistance:9,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Renewal:lifeRegen:2|Storm Heartstone|18
storm-heart|rare|5|4|Invocation:castSpeedPercent:4,The Wellspring:maxMana:20,Sanctuary:allResistance:4,The Hart:maxHp:52|Storm Heartstone|18
storm-heart|rare|6|4|Stormward:lightningResistance:12,Vigor:vitality:5,Prosperity:goldFindPercent:13,The Wellspring:maxMana:22|Storm Heartstone|18
storm-heart|rare|7|4|Invocation:castSpeedPercent:5,Sanctuary:allResistance:3,The Hart:maxHp:45,Prosperity:goldFindPercent:8|Storm Heartstone|18
storm-heart|epic|0|4|Stormward:lightningResistance:13,Haste:attackSpeedPercent:6,Renewal:lifeRegen:1,Clarity:manaRegen:8|Storm Heartstone|18
storm-heart|epic|1|4|Haste:attackSpeedPercent:8,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6,Wisdom:xpGainPercent:7|Storm Heartstone|18
storm-heart|epic|2|4|Invocation:castSpeedPercent:7,The Wellspring:maxMana:19,Spellward:arcaneResistance:16,Vigor:vitality:9|Storm Heartstone|18
storm-heart|epic|3|4|Stormward:lightningResistance:15,Haste:attackSpeedPercent:6,The Hart:maxHp:41,Renewal:lifeRegen:1|Storm Heartstone|18
storm-heart|epic|4|4|Stormward:lightningResistance:11,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Renewal:lifeRegen:2|Storm Heartstone|18
storm-heart|epic|5|4|Invocation:castSpeedPercent:4,The Wellspring:maxMana:22,Sanctuary:allResistance:5,The Hart:maxHp:58|Storm Heartstone|18
storm-heart|epic|6|4|Stormward:lightningResistance:13,Vigor:vitality:5,Prosperity:goldFindPercent:15,The Wellspring:maxMana:25|Storm Heartstone|18
storm-heart|epic|7|4|Invocation:castSpeedPercent:6,Sanctuary:allResistance:4,The Hart:maxHp:50,Prosperity:goldFindPercent:9|Storm Heartstone|18
storm-heart|legendary|0|5|Stormward:lightningResistance:14,Haste:attackSpeedPercent:7,Renewal:lifeRegen:2,Clarity:manaRegen:9,Insight:intelligence:7|Storm Heartstone|18
storm-heart|legendary|1|5|Haste:attackSpeedPercent:8,Stormward:lightningResistance:16,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:8,Ruin:damagePercent:7|Storm Heartstone|18
storm-heart|legendary|2|5|Invocation:castSpeedPercent:8,The Wellspring:maxMana:21,Spellward:arcaneResistance:17,Vigor:vitality:10,The Hart:maxHp:52|Storm Heartstone|18
storm-heart|legendary|3|5|Stormward:lightningResistance:17,Haste:attackSpeedPercent:6,The Hart:maxHp:45,Renewal:lifeRegen:1,Insight:intelligence:6|Storm Heartstone|18
storm-heart|legendary|4|5|Stormward:lightningResistance:12,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:9,Renewal:lifeRegen:2,The Wellspring:maxMana:25|Storm Heartstone|18
storm-heart|legendary|5|5|Invocation:castSpeedPercent:5,The Wellspring:maxMana:25,Sanctuary:allResistance:6,The Hart:maxHp:65,Prosperity:goldFindPercent:14|Storm Heartstone|18
storm-heart|legendary|6|5|Stormward:lightningResistance:15,Vigor:vitality:6,Prosperity:goldFindPercent:17,The Wellspring:maxMana:28,Invocation:castSpeedPercent:4|Storm Heartstone|18
storm-heart|legendary|7|5|Invocation:castSpeedPercent:6,Sanctuary:allResistance:4,The Hart:maxHp:56,Prosperity:goldFindPercent:10,Vigor:vitality:10|Storm Heartstone|18
astral-heart|common|0|3|Spellward:arcaneResistance:9,Clarity:manaRegen:7,Renewal:lifeRegen:1|Astral Heartstone|18
astral-heart|common|1|3|Wisdom:xpGainPercent:7,Spellward:arcaneResistance:10,Clarity:manaRegen:7|Astral Heartstone|18
astral-heart|common|2|3|Clarity:manaRegen:9,Invocation:castSpeedPercent:4,Spellward:arcaneResistance:12|Astral Heartstone|18
astral-heart|common|3|3|Spellward:arcaneResistance:12,Severity:critDamage:8,The Hart:maxHp:30|Astral Heartstone|18
astral-heart|common|4|3|Spellward:arcaneResistance:8,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:6|Astral Heartstone|18
astral-heart|common|5|3|Clarity:manaRegen:5,Ruin:damagePercent:8,The Hart:maxHp:47|Astral Heartstone|18
astral-heart|common|6|3|Spellward:arcaneResistance:10,Vigor:vitality:4,Wisdom:xpGainPercent:7|Astral Heartstone|18
astral-heart|common|7|3|Wisdom:xpGainPercent:5,Grace:dexterity:6,Spellward:arcaneResistance:10|Astral Heartstone|18
astral-heart|magic|0|3|Spellward:arcaneResistance:10,Clarity:manaRegen:8,Renewal:lifeRegen:1|Astral Heartstone|18
astral-heart|magic|1|3|Wisdom:xpGainPercent:8,Spellward:arcaneResistance:11,Clarity:manaRegen:7|Astral Heartstone|18
astral-heart|magic|2|3|Clarity:manaRegen:10,Invocation:castSpeedPercent:5,Spellward:arcaneResistance:13|Astral Heartstone|18
astral-heart|magic|3|3|Spellward:arcaneResistance:13,Severity:critDamage:9,The Hart:maxHp:33|Astral Heartstone|18
astral-heart|magic|4|3|Spellward:arcaneResistance:9,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:6|Astral Heartstone|18
astral-heart|magic|5|3|Clarity:manaRegen:5,Ruin:damagePercent:8,The Hart:maxHp:51|Astral Heartstone|18
astral-heart|magic|6|3|Spellward:arcaneResistance:11,Vigor:vitality:4,Wisdom:xpGainPercent:8|Astral Heartstone|18
astral-heart|magic|7|3|Wisdom:xpGainPercent:6,Grace:dexterity:6,Spellward:arcaneResistance:11|Astral Heartstone|18
astral-heart|rare|0|4|Spellward:arcaneResistance:11,Clarity:manaRegen:9,Renewal:lifeRegen:1,Severity:critDamage:8|Astral Heartstone|18
astral-heart|rare|1|4|Wisdom:xpGainPercent:8,Spellward:arcaneResistance:13,Clarity:manaRegen:8,Prosperity:goldFindPercent:10|Astral Heartstone|18
astral-heart|rare|2|4|Clarity:manaRegen:10,Invocation:castSpeedPercent:5,Spellward:arcaneResistance:14,Vigor:vitality:8|Astral Heartstone|18
astral-heart|rare|3|4|Spellward:arcaneResistance:14,Severity:critDamage:10,The Hart:maxHp:36,Clarity:manaRegen:7|Astral Heartstone|18
astral-heart|rare|4|4|Spellward:arcaneResistance:9,The Wanderer:moveSpeedPercent:2,Wisdom:xpGainPercent:7,Clarity:manaRegen:10|Astral Heartstone|18
astral-heart|rare|5|4|Clarity:manaRegen:6,Ruin:damagePercent:9,The Hart:maxHp:56,Stormward:lightningResistance:14|Astral Heartstone|18
astral-heart|rare|6|4|Spellward:arcaneResistance:12,Vigor:vitality:5,Wisdom:xpGainPercent:8,The Wellspring:maxMana:22|Astral Heartstone|18
astral-heart|rare|7|4|Wisdom:xpGainPercent:6,Grace:dexterity:7,Spellward:arcaneResistance:12,Clarity:manaRegen:7|Astral Heartstone|18
astral-heart|epic|0|4|Spellward:arcaneResistance:13,Clarity:manaRegen:10,Renewal:lifeRegen:1,Severity:critDamage:9|Astral Heartstone|18
astral-heart|epic|1|4|Wisdom:xpGainPercent:9,Spellward:arcaneResistance:14,Clarity:manaRegen:9,Prosperity:goldFindPercent:11|Astral Heartstone|18
astral-heart|epic|2|4|Clarity:manaRegen:12,Invocation:castSpeedPercent:6,Spellward:arcaneResistance:16,Vigor:vitality:9|Astral Heartstone|18
astral-heart|epic|3|4|Spellward:arcaneResistance:15,Severity:critDamage:11,The Hart:maxHp:41,Clarity:manaRegen:7|Astral Heartstone|18
astral-heart|epic|4|4|Spellward:arcaneResistance:11,The Wanderer:moveSpeedPercent:3,Wisdom:xpGainPercent:8,Clarity:manaRegen:11|Astral Heartstone|18
astral-heart|epic|5|4|Clarity:manaRegen:7,Ruin:damagePercent:10,The Hart:maxHp:62,Stormward:lightningResistance:16|Astral Heartstone|18
astral-heart|epic|6|4|Spellward:arcaneResistance:13,Vigor:vitality:5,Wisdom:xpGainPercent:9,The Wellspring:maxMana:25|Astral Heartstone|18
astral-heart|epic|7|4|Wisdom:xpGainPercent:7,Grace:dexterity:8,Spellward:arcaneResistance:14,Clarity:manaRegen:8|Astral Heartstone|18
astral-heart|legendary|0|5|Spellward:arcaneResistance:14,Clarity:manaRegen:11,Renewal:lifeRegen:2,Severity:critDamage:10,Vigor:vitality:11|Astral Heartstone|18
astral-heart|legendary|1|5|Wisdom:xpGainPercent:10,Spellward:arcaneResistance:16,Clarity:manaRegen:10,Prosperity:goldFindPercent:12,Invocation:castSpeedPercent:5|Astral Heartstone|18
astral-heart|legendary|2|5|Clarity:manaRegen:13,Invocation:castSpeedPercent:6,Spellward:arcaneResistance:17,Vigor:vitality:10,The Hart:maxHp:52|Astral Heartstone|18
astral-heart|legendary|3|5|Spellward:arcaneResistance:17,Severity:critDamage:12,The Hart:maxHp:45,Clarity:manaRegen:8,Insight:intelligence:6|Astral Heartstone|18
astral-heart|legendary|4|5|Spellward:arcaneResistance:12,The Wanderer:moveSpeedPercent:3,Wisdom:xpGainPercent:9,Clarity:manaRegen:12,The Wellspring:maxMana:25|Astral Heartstone|18
astral-heart|legendary|5|5|Clarity:manaRegen:7,Ruin:damagePercent:12,The Hart:maxHp:70,Stormward:lightningResistance:17,Prosperity:goldFindPercent:14|Astral Heartstone|18
astral-heart|legendary|6|5|Spellward:arcaneResistance:15,Vigor:vitality:6,Wisdom:xpGainPercent:10,The Wellspring:maxMana:28,Haste:attackSpeedPercent:4|Astral Heartstone|18
astral-heart|legendary|7|5|Wisdom:xpGainPercent:8,Grace:dexterity:9,Spellward:arcaneResistance:15,Clarity:manaRegen:9,The Hart:maxHp:65|Astral Heartstone|18
jade-heart|common|0|3|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:7|Jade Heartstone|18
jade-heart|common|1|3|Renewal:lifeRegen:1,Spellward:arcaneResistance:10,Clarity:manaRegen:7|Jade Heartstone|18
jade-heart|common|2|3|The Hart:maxHp:46,Haste:attackSpeedPercent:4,Sanctuary:allResistance:3|Jade Heartstone|18
jade-heart|common|3|3|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,The Hart:maxHp:30|Jade Heartstone|18
jade-heart|common|4|3|Sanctuary:allResistance:2,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Jade Heartstone|18
jade-heart|common|5|3|The Hart:maxHp:26,Haste:attackSpeedPercent:5,Insight:intelligence:5|Jade Heartstone|18
jade-heart|common|6|3|The Hart:maxHp:37,Cinderskin:fireResistance:6,Wisdom:xpGainPercent:7|Jade Heartstone|18
jade-heart|common|7|3|Renewal:lifeRegen:1,The Hart:maxHp:35,Stormward:lightningResistance:10|Jade Heartstone|18
jade-heart|magic|0|3|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:7|Jade Heartstone|18
jade-heart|magic|1|3|Renewal:lifeRegen:2,Spellward:arcaneResistance:11,Clarity:manaRegen:7|Jade Heartstone|18
jade-heart|magic|2|3|The Hart:maxHp:50,Haste:attackSpeedPercent:5,Sanctuary:allResistance:4|Jade Heartstone|18
jade-heart|magic|3|3|Sanctuary:allResistance:4,Haste:attackSpeedPercent:5,The Hart:maxHp:33|Jade Heartstone|18
jade-heart|magic|4|3|Sanctuary:allResistance:3,Haste:attackSpeedPercent:3,Wisdom:xpGainPercent:6|Jade Heartstone|18
jade-heart|magic|5|3|The Hart:maxHp:28,Haste:attackSpeedPercent:5,Insight:intelligence:5|Jade Heartstone|18
jade-heart|magic|6|3|The Hart:maxHp:41,Cinderskin:fireResistance:7,Wisdom:xpGainPercent:8|Jade Heartstone|18
jade-heart|magic|7|3|Renewal:lifeRegen:1,The Hart:maxHp:39,Stormward:lightningResistance:11|Jade Heartstone|18
jade-heart|rare|0|4|Sanctuary:allResistance:3,Precision:critChance:2,Clarity:manaRegen:8,Severity:critDamage:8|Jade Heartstone|18
jade-heart|rare|1|4|Renewal:lifeRegen:2,Spellward:arcaneResistance:13,Clarity:manaRegen:8,Wisdom:xpGainPercent:6|Jade Heartstone|18
jade-heart|rare|2|4|The Hart:maxHp:55,Haste:attackSpeedPercent:5,Sanctuary:allResistance:4,Vigor:vitality:8|Jade Heartstone|18
jade-heart|rare|3|4|Sanctuary:allResistance:4,Haste:attackSpeedPercent:5,The Hart:maxHp:36,Renewal:lifeRegen:1|Jade Heartstone|18
jade-heart|rare|4|4|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Renewal:lifeRegen:2|Jade Heartstone|18
jade-heart|rare|5|4|The Hart:maxHp:31,Haste:attackSpeedPercent:6,Insight:intelligence:6,Stormward:lightningResistance:14|Jade Heartstone|18
jade-heart|rare|6|4|The Hart:maxHp:45,Cinderskin:fireResistance:8,Wisdom:xpGainPercent:8,The Wellspring:maxMana:22|Jade Heartstone|18
jade-heart|rare|7|4|Renewal:lifeRegen:1,The Hart:maxHp:43,Stormward:lightningResistance:12,Efficiency:manaCostPercent:5|Jade Heartstone|18
jade-heart|epic|0|4|Sanctuary:allResistance:4,Precision:critChance:2,Clarity:manaRegen:9,Severity:critDamage:9|Jade Heartstone|18
jade-heart|epic|1|4|Renewal:lifeRegen:2,Spellward:arcaneResistance:14,Clarity:manaRegen:9,Wisdom:xpGainPercent:7|Jade Heartstone|18
jade-heart|epic|2|4|The Hart:maxHp:61,Haste:attackSpeedPercent:6,Sanctuary:allResistance:5,Vigor:vitality:9|Jade Heartstone|18
jade-heart|epic|3|4|Sanctuary:allResistance:5,Haste:attackSpeedPercent:6,The Hart:maxHp:41,Renewal:lifeRegen:1|Jade Heartstone|18
jade-heart|epic|4|4|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Renewal:lifeRegen:2|Jade Heartstone|18
jade-heart|epic|5|4|The Hart:maxHp:35,Haste:attackSpeedPercent:7,Insight:intelligence:6,Stormward:lightningResistance:16|Jade Heartstone|18
jade-heart|epic|6|4|The Hart:maxHp:50,Cinderskin:fireResistance:9,Wisdom:xpGainPercent:9,The Wellspring:maxMana:25|Jade Heartstone|18
jade-heart|epic|7|4|Renewal:lifeRegen:1,The Hart:maxHp:47,Stormward:lightningResistance:14,Efficiency:manaCostPercent:5|Jade Heartstone|18
jade-heart|legendary|0|5|Sanctuary:allResistance:4,Precision:critChance:3,Clarity:manaRegen:10,Severity:critDamage:10,The Hart:maxHp:70|Jade Heartstone|18
jade-heart|legendary|1|5|Renewal:lifeRegen:2,Spellward:arcaneResistance:16,Clarity:manaRegen:10,Wisdom:xpGainPercent:8,The Wellspring:maxMana:16|Jade Heartstone|18
jade-heart|legendary|2|5|The Hart:maxHp:69,Haste:attackSpeedPercent:6,Sanctuary:allResistance:5,Vigor:vitality:10,The Wellspring:maxMana:20|Jade Heartstone|18
jade-heart|legendary|3|5|Sanctuary:allResistance:5,Haste:attackSpeedPercent:6,The Hart:maxHp:45,Renewal:lifeRegen:1,Insight:intelligence:6|Jade Heartstone|18
jade-heart|legendary|4|5|Sanctuary:allResistance:4,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:9,Renewal:lifeRegen:2,The Hart:maxHp:63|Jade Heartstone|18
jade-heart|legendary|5|5|The Hart:maxHp:39,Haste:attackSpeedPercent:7,Insight:intelligence:7,Stormward:lightningResistance:17,Prosperity:goldFindPercent:14|Jade Heartstone|18
jade-heart|legendary|6|5|The Hart:maxHp:56,Cinderskin:fireResistance:10,Wisdom:xpGainPercent:10,The Wellspring:maxMana:28,Haste:attackSpeedPercent:4|Jade Heartstone|18
jade-heart|legendary|7|5|Renewal:lifeRegen:2,The Hart:maxHp:53,Stormward:lightningResistance:15,Efficiency:manaCostPercent:6,The Wellspring:maxMana:25|Jade Heartstone|18
amber-heart|common|0|3|The Wellspring:maxMana:14,Haste:attackSpeedPercent:5,Clarity:manaRegen:7|Amber Heartstone|18
amber-heart|common|1|3|Prosperity:goldFindPercent:11,Spellward:arcaneResistance:10,Sorcery:spellDamagePercent:8|Amber Heartstone|18
amber-heart|common|2|3|The Wanderer:moveSpeedPercent:4,Haste:attackSpeedPercent:4,Grace:dexterity:7|Amber Heartstone|18
amber-heart|common|3|3|The Wellspring:maxMana:17,Invocation:castSpeedPercent:4,Rimeward:frostResistance:8|Amber Heartstone|18
amber-heart|common|4|3|The Wellspring:maxMana:12,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:6|Amber Heartstone|18
amber-heart|common|5|3|Prosperity:goldFindPercent:6,The Wellspring:maxMana:17,Vigor:vitality:7|Amber Heartstone|18
amber-heart|common|6|3|The Wellspring:maxMana:15,Cinderskin:fireResistance:6,Prosperity:goldFindPercent:11|Amber Heartstone|18
amber-heart|common|7|3|Prosperity:goldFindPercent:8,The Hart:maxHp:35,Stormward:lightningResistance:10|Amber Heartstone|18
amber-heart|magic|0|3|The Wellspring:maxMana:15,Haste:attackSpeedPercent:5,Clarity:manaRegen:7|Amber Heartstone|18
amber-heart|magic|1|3|Prosperity:goldFindPercent:12,Spellward:arcaneResistance:11,Sorcery:spellDamagePercent:9|Amber Heartstone|18
amber-heart|magic|2|3|The Wanderer:moveSpeedPercent:4,Haste:attackSpeedPercent:5,Grace:dexterity:8|Amber Heartstone|18
amber-heart|magic|3|3|The Wellspring:maxMana:18,Invocation:castSpeedPercent:5,Rimeward:frostResistance:9|Amber Heartstone|18
amber-heart|magic|4|3|The Wellspring:maxMana:13,Invocation:castSpeedPercent:3,Wisdom:xpGainPercent:6|Amber Heartstone|18
amber-heart|magic|5|3|Prosperity:goldFindPercent:6,The Wellspring:maxMana:18,Vigor:vitality:8|Amber Heartstone|18
amber-heart|magic|6|3|The Wellspring:maxMana:16,Cinderskin:fireResistance:7,Prosperity:goldFindPercent:12|Amber Heartstone|18
amber-heart|magic|7|3|Prosperity:goldFindPercent:9,The Hart:maxHp:39,Stormward:lightningResistance:11|Amber Heartstone|18
amber-heart|rare|0|4|The Wellspring:maxMana:17,Haste:attackSpeedPercent:6,Clarity:manaRegen:8,Precision:critChance:2|Amber Heartstone|18
amber-heart|rare|1|4|Prosperity:goldFindPercent:13,Spellward:arcaneResistance:13,Sorcery:spellDamagePercent:10,Wisdom:xpGainPercent:6|Amber Heartstone|18
amber-heart|rare|2|4|The Wanderer:moveSpeedPercent:4,Haste:attackSpeedPercent:5,Grace:dexterity:8,Rimeward:frostResistance:14|Amber Heartstone|18
amber-heart|rare|3|4|The Wellspring:maxMana:20,Invocation:castSpeedPercent:5,Rimeward:frostResistance:10,Renewal:lifeRegen:1|Amber Heartstone|18
amber-heart|rare|4|4|The Wellspring:maxMana:14,Invocation:castSpeedPercent:4,Wisdom:xpGainPercent:7,Clarity:manaRegen:10|Amber Heartstone|18
amber-heart|rare|5|4|Prosperity:goldFindPercent:7,The Wellspring:maxMana:20,Vigor:vitality:9,Stormward:lightningResistance:14|Amber Heartstone|18
amber-heart|rare|6|4|The Wellspring:maxMana:18,Cinderskin:fireResistance:8,Prosperity:goldFindPercent:13,The Hart:maxHp:57|Amber Heartstone|18
amber-heart|rare|7|4|Prosperity:goldFindPercent:10,The Hart:maxHp:43,Stormward:lightningResistance:12,Clarity:manaRegen:7|Amber Heartstone|18
amber-heart|epic|0|4|The Wellspring:maxMana:19,Haste:attackSpeedPercent:6,Clarity:manaRegen:9,Precision:critChance:2|Amber Heartstone|18
amber-heart|epic|1|4|Prosperity:goldFindPercent:15,Spellward:arcaneResistance:14,Sorcery:spellDamagePercent:11,Wisdom:xpGainPercent:7|Amber Heartstone|18
amber-heart|epic|2|4|The Wanderer:moveSpeedPercent:5,Haste:attackSpeedPercent:6,Grace:dexterity:9,Rimeward:frostResistance:16|Amber Heartstone|18
amber-heart|epic|3|4|The Wellspring:maxMana:23,Invocation:castSpeedPercent:6,Rimeward:frostResistance:11,Renewal:lifeRegen:1|Amber Heartstone|18
amber-heart|epic|4|4|The Wellspring:maxMana:16,Invocation:castSpeedPercent:4,Wisdom:xpGainPercent:8,Clarity:manaRegen:11|Amber Heartstone|18
amber-heart|epic|5|4|Prosperity:goldFindPercent:8,The Wellspring:maxMana:22,Vigor:vitality:10,Stormward:lightningResistance:16|Amber Heartstone|18
amber-heart|epic|6|4|The Wellspring:maxMana:20,Cinderskin:fireResistance:9,Prosperity:goldFindPercent:15,The Hart:maxHp:63|Amber Heartstone|18
amber-heart|epic|7|4|Prosperity:goldFindPercent:11,The Hart:maxHp:47,Stormward:lightningResistance:14,Clarity:manaRegen:8|Amber Heartstone|18
amber-heart|legendary|0|5|The Wellspring:maxMana:21,Haste:attackSpeedPercent:7,Clarity:manaRegen:10,Precision:critChance:2,Rimeward:frostResistance:19|Amber Heartstone|18
amber-heart|legendary|1|5|Prosperity:goldFindPercent:17,Spellward:arcaneResistance:16,Sorcery:spellDamagePercent:12,Wisdom:xpGainPercent:8,Ruin:damagePercent:7|Amber Heartstone|18
amber-heart|legendary|2|5|The Wanderer:moveSpeedPercent:5,Haste:attackSpeedPercent:6,Grace:dexterity:10,Rimeward:frostResistance:17,The Wellspring:maxMana:20|Amber Heartstone|18
amber-heart|legendary|3|5|The Wellspring:maxMana:25,Invocation:castSpeedPercent:6,Rimeward:frostResistance:12,Renewal:lifeRegen:1,Insight:intelligence:6|Amber Heartstone|18
amber-heart|legendary|4|5|The Wellspring:maxMana:17,Invocation:castSpeedPercent:4,Wisdom:xpGainPercent:9,Clarity:manaRegen:12,Spellward:arcaneResistance:17|Amber Heartstone|18
amber-heart|legendary|5|5|Prosperity:goldFindPercent:9,The Wellspring:maxMana:25,Vigor:vitality:11,Stormward:lightningResistance:17,Renewal:lifeRegen:2|Amber Heartstone|18
amber-heart|legendary|6|5|The Wellspring:maxMana:22,Cinderskin:fireResistance:10,Prosperity:goldFindPercent:17,The Hart:maxHp:71,Haste:attackSpeedPercent:4|Amber Heartstone|18
amber-heart|legendary|7|5|Prosperity:goldFindPercent:13,The Hart:maxHp:53,Stormward:lightningResistance:15,Clarity:manaRegen:9,The Wellspring:maxMana:25|Amber Heartstone|18
ember-monolith|common|0|4|Cinderskin:fireResistance:12,Haste:attackSpeedPercent:6,Clarity:manaRegen:9,The Wanderer:moveSpeedPercent:3|Ember Monolith|18
ember-monolith|common|1|4|The Hart:maxHp:63,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6,Wisdom:xpGainPercent:7|Ember Monolith|18
ember-monolith|common|2|4|The Hart:maxHp:60,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:15,Vigor:vitality:9|Ember Monolith|18
ember-monolith|common|3|4|Cinderskin:fireResistance:15,Invocation:castSpeedPercent:5,The Hart:maxHp:39,Renewal:lifeRegen:1|Ember Monolith|18
ember-monolith|common|4|4|Cinderskin:fireResistance:10,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Clarity:manaRegen:11|Ember Monolith|18
ember-monolith|common|5|4|The Hart:maxHp:34,Invocation:castSpeedPercent:6,Sanctuary:allResistance:5,The Wellspring:maxMana:22|Ember Monolith|18
ember-monolith|common|6|4|Cinderskin:fireResistance:13,Vigor:vitality:5,Prosperity:goldFindPercent:14,The Hart:maxHp:62|Ember Monolith|18
ember-monolith|common|7|4|The Hart:maxHp:48,Sanctuary:allResistance:4,The Wellspring:maxMana:19,Readiness:cooldownPercent:3|Ember Monolith|18
ember-monolith|magic|0|4|Cinderskin:fireResistance:13,Haste:attackSpeedPercent:7,Clarity:manaRegen:10,The Wanderer:moveSpeedPercent:3|Ember Monolith|18
ember-monolith|magic|1|4|The Hart:maxHp:68,Stormward:lightningResistance:15,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:7|Ember Monolith|18
ember-monolith|magic|2|4|The Hart:maxHp:65,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:17,Vigor:vitality:10|Ember Monolith|18
ember-monolith|magic|3|4|Cinderskin:fireResistance:16,Invocation:castSpeedPercent:6,The Hart:maxHp:43,Renewal:lifeRegen:1|Ember Monolith|18
ember-monolith|magic|4|4|Cinderskin:fireResistance:11,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Clarity:manaRegen:12|Ember Monolith|18
ember-monolith|magic|5|4|The Hart:maxHp:37,Invocation:castSpeedPercent:7,Sanctuary:allResistance:5,The Wellspring:maxMana:24|Ember Monolith|18
ember-monolith|magic|6|4|Cinderskin:fireResistance:14,Vigor:vitality:5,Prosperity:goldFindPercent:16,The Hart:maxHp:67|Ember Monolith|18
ember-monolith|magic|7|4|The Hart:maxHp:52,Sanctuary:allResistance:4,The Wellspring:maxMana:21,Readiness:cooldownPercent:3|Ember Monolith|18
ember-monolith|rare|0|5|Cinderskin:fireResistance:15,Haste:attackSpeedPercent:7,Clarity:manaRegen:11,The Wanderer:moveSpeedPercent:4,Vigor:vitality:12|Ember Monolith|18
ember-monolith|rare|1|5|The Hart:maxHp:75,Stormward:lightningResistance:16,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:8,Haste:attackSpeedPercent:5|Ember Monolith|18
ember-monolith|rare|2|5|The Hart:maxHp:72,Haste:attackSpeedPercent:7,Spellward:arcaneResistance:18,Vigor:vitality:11,The Wellspring:maxMana:21|Ember Monolith|18
ember-monolith|rare|3|5|Cinderskin:fireResistance:18,Invocation:castSpeedPercent:7,The Hart:maxHp:47,Renewal:lifeRegen:1,Insight:intelligence:7|Ember Monolith|18
ember-monolith|rare|4|5|Cinderskin:fireResistance:12,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:9,Clarity:manaRegen:13,The Hart:maxHp:66|Ember Monolith|18
ember-monolith|rare|5|5|The Hart:maxHp:40,Invocation:castSpeedPercent:8,Sanctuary:allResistance:6,The Wellspring:maxMana:27,Prosperity:goldFindPercent:15|Ember Monolith|18
ember-monolith|rare|6|5|Cinderskin:fireResistance:16,Vigor:vitality:6,Prosperity:goldFindPercent:17,The Hart:maxHp:74,Invocation:castSpeedPercent:4|Ember Monolith|18
ember-monolith|rare|7|5|The Hart:maxHp:58,Sanctuary:allResistance:4,The Wellspring:maxMana:23,Readiness:cooldownPercent:3,Ruin:damagePercent:12|Ember Monolith|18
ember-monolith|epic|0|6|Cinderskin:fireResistance:17,Haste:attackSpeedPercent:8,Clarity:manaRegen:12,The Wanderer:moveSpeedPercent:4,Vigor:vitality:13,The Wellspring:maxMana:29|Ember Monolith|18
ember-monolith|epic|1|6|The Hart:maxHp:84,Stormward:lightningResistance:18,Efficiency:manaCostPercent:8,Wisdom:xpGainPercent:9,Haste:attackSpeedPercent:6,Precision:critChance:2|Ember Monolith|18
ember-monolith|epic|2|6|The Hart:maxHp:80,Haste:attackSpeedPercent:7,Spellward:arcaneResistance:20,Vigor:vitality:12,The Wellspring:maxMana:24,Prosperity:goldFindPercent:15|Ember Monolith|18
ember-monolith|epic|3|6|Cinderskin:fireResistance:20,Invocation:castSpeedPercent:7,The Hart:maxHp:53,Renewal:lifeRegen:1,Insight:intelligence:7,Clarity:manaRegen:15|Ember Monolith|18
ember-monolith|epic|4|6|Cinderskin:fireResistance:14,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:10,Clarity:manaRegen:15,The Hart:maxHp:74,Prosperity:goldFindPercent:15|Ember Monolith|18
ember-monolith|epic|5|6|The Hart:maxHp:45,Invocation:castSpeedPercent:9,Sanctuary:allResistance:7,The Wellspring:maxMana:30,Prosperity:goldFindPercent:16,Might:strength:6|Ember Monolith|18
ember-monolith|epic|6|6|Cinderskin:fireResistance:17,Vigor:vitality:7,Prosperity:goldFindPercent:19,The Hart:maxHp:83,Invocation:castSpeedPercent:5,Grace:dexterity:10|Ember Monolith|18
ember-monolith|epic|7|6|The Hart:maxHp:64,Sanctuary:allResistance:5,The Wellspring:maxMana:26,Readiness:cooldownPercent:4,Ruin:damagePercent:14,Clarity:manaRegen:10|Ember Monolith|18
ember-monolith|legendary|0|6|Cinderskin:fireResistance:19,Haste:attackSpeedPercent:9,Clarity:manaRegen:13,The Wanderer:moveSpeedPercent:5,Vigor:vitality:15,The Wellspring:maxMana:32|Ember Monolith|18
ember-monolith|legendary|1|6|The Hart:maxHp:94,Stormward:lightningResistance:20,Efficiency:manaCostPercent:9,Wisdom:xpGainPercent:10,Haste:attackSpeedPercent:6,Precision:critChance:3|Ember Monolith|18
ember-monolith|legendary|2|6|The Hart:maxHp:90,Haste:attackSpeedPercent:8,Spellward:arcaneResistance:23,Vigor:vitality:14,The Wellspring:maxMana:26,Prosperity:goldFindPercent:17|Ember Monolith|18
ember-monolith|legendary|3|6|Cinderskin:fireResistance:22,Invocation:castSpeedPercent:8,The Hart:maxHp:59,Renewal:lifeRegen:2,Insight:intelligence:8,Clarity:manaRegen:17|Ember Monolith|18
ember-monolith|legendary|4|6|Cinderskin:fireResistance:15,Haste:attackSpeedPercent:6,Wisdom:xpGainPercent:11,Clarity:manaRegen:16,The Hart:maxHp:82,Prosperity:goldFindPercent:17|Ember Monolith|18
ember-monolith|legendary|5|6|The Hart:maxHp:50,Invocation:castSpeedPercent:10,Sanctuary:allResistance:7,The Wellspring:maxMana:33,Prosperity:goldFindPercent:18,Might:strength:7|Ember Monolith|18
ember-monolith|legendary|6|6|Cinderskin:fireResistance:20,Vigor:vitality:7,Prosperity:goldFindPercent:22,The Hart:maxHp:92,Invocation:castSpeedPercent:6,Grace:dexterity:11|Ember Monolith|18
ember-monolith|legendary|7|6|The Hart:maxHp:72,Sanctuary:allResistance:6,The Wellspring:maxMana:29,Readiness:cooldownPercent:4,Ruin:damagePercent:15,Clarity:manaRegen:11|Ember Monolith|18
rime-monolith|common|0|4|Rimeward:frostResistance:12,Haste:attackSpeedPercent:6,Clarity:manaRegen:9,The Wanderer:moveSpeedPercent:3|Rime Monolith|18
rime-monolith|common|1|4|The Wellspring:maxMana:25,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6,Wisdom:xpGainPercent:7|Rime Monolith|18
rime-monolith|common|2|4|The Wellspring:maxMana:24,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:15,Vigor:vitality:9|Rime Monolith|18
rime-monolith|common|3|4|Rimeward:frostResistance:15,Invocation:castSpeedPercent:5,The Hart:maxHp:39,Clarity:manaRegen:7|Rime Monolith|18
rime-monolith|common|4|4|Rimeward:frostResistance:10,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Clarity:manaRegen:11|Rime Monolith|18
rime-monolith|common|5|4|The Wellspring:maxMana:13,Invocation:castSpeedPercent:6,Sanctuary:allResistance:5,The Hart:maxHp:57|Rime Monolith|18
rime-monolith|common|6|4|Rimeward:frostResistance:13,Vigor:vitality:5,Prosperity:goldFindPercent:14,The Wellspring:maxMana:24|Rime Monolith|18
rime-monolith|common|7|4|The Wellspring:maxMana:19,Sanctuary:allResistance:4,The Hart:maxHp:49,Readiness:cooldownPercent:3|Rime Monolith|18
rime-monolith|magic|0|4|Rimeward:frostResistance:13,Haste:attackSpeedPercent:7,Clarity:manaRegen:10,The Wanderer:moveSpeedPercent:3|Rime Monolith|18
rime-monolith|magic|1|4|The Wellspring:maxMana:27,Stormward:lightningResistance:15,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:7|Rime Monolith|18
rime-monolith|magic|2|4|The Wellspring:maxMana:26,Haste:attackSpeedPercent:6,Spellward:arcaneResistance:17,Vigor:vitality:10|Rime Monolith|18
rime-monolith|magic|3|4|Rimeward:frostResistance:16,Invocation:castSpeedPercent:6,The Hart:maxHp:43,Clarity:manaRegen:8|Rime Monolith|18
rime-monolith|magic|4|4|Rimeward:frostResistance:11,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Clarity:manaRegen:12|Rime Monolith|18
rime-monolith|magic|5|4|The Wellspring:maxMana:14,Invocation:castSpeedPercent:7,Sanctuary:allResistance:5,The Hart:maxHp:62|Rime Monolith|18
rime-monolith|magic|6|4|Rimeward:frostResistance:14,Vigor:vitality:5,Prosperity:goldFindPercent:16,The Wellspring:maxMana:26|Rime Monolith|18
rime-monolith|magic|7|4|The Wellspring:maxMana:21,Sanctuary:allResistance:4,The Hart:maxHp:53,Readiness:cooldownPercent:3|Rime Monolith|18
rime-monolith|rare|0|5|Rimeward:frostResistance:15,Haste:attackSpeedPercent:7,Clarity:manaRegen:11,The Wanderer:moveSpeedPercent:4,Vigor:vitality:12|Rime Monolith|18
rime-monolith|rare|1|5|The Wellspring:maxMana:30,Stormward:lightningResistance:16,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:8,Haste:attackSpeedPercent:5|Rime Monolith|18
rime-monolith|rare|2|5|The Wellspring:maxMana:28,Haste:attackSpeedPercent:7,Spellward:arcaneResistance:18,Vigor:vitality:11,The Hart:maxHp:54|Rime Monolith|18
rime-monolith|rare|3|5|Rimeward:frostResistance:18,Invocation:castSpeedPercent:7,The Hart:maxHp:47,Clarity:manaRegen:9,Insight:intelligence:7|Rime Monolith|18
rime-monolith|rare|4|5|Rimeward:frostResistance:12,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:9,Clarity:manaRegen:13,The Wellspring:maxMana:26|Rime Monolith|18
rime-monolith|rare|5|5|The Wellspring:maxMana:16,Invocation:castSpeedPercent:8,Sanctuary:allResistance:6,The Hart:maxHp:68,Prosperity:goldFindPercent:15|Rime Monolith|18
rime-monolith|rare|6|5|Rimeward:frostResistance:16,Vigor:vitality:6,Prosperity:goldFindPercent:17,The Wellspring:maxMana:29,Invocation:castSpeedPercent:4|Rime Monolith|18
rime-monolith|rare|7|5|The Wellspring:maxMana:23,Sanctuary:allResistance:4,The Hart:maxHp:59,Readiness:cooldownPercent:3,Ruin:damagePercent:12|Rime Monolith|18
rime-monolith|epic|0|6|Rimeward:frostResistance:17,Haste:attackSpeedPercent:8,Clarity:manaRegen:12,The Wanderer:moveSpeedPercent:4,Vigor:vitality:13,The Wellspring:maxMana:29|Rime Monolith|18
rime-monolith|epic|1|6|The Wellspring:maxMana:33,Stormward:lightningResistance:18,Efficiency:manaCostPercent:8,Wisdom:xpGainPercent:9,Haste:attackSpeedPercent:6,Precision:critChance:2|Rime Monolith|18
rime-monolith|epic|2|6|The Wellspring:maxMana:32,Haste:attackSpeedPercent:7,Spellward:arcaneResistance:20,Vigor:vitality:12,The Hart:maxHp:60,Prosperity:goldFindPercent:15|Rime Monolith|18
rime-monolith|epic|3|6|Rimeward:frostResistance:20,Invocation:castSpeedPercent:7,The Hart:maxHp:53,Clarity:manaRegen:10,Insight:intelligence:7,Severity:critDamage:18|Rime Monolith|18
rime-monolith|epic|4|6|Rimeward:frostResistance:14,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:10,Clarity:manaRegen:15,The Wellspring:maxMana:29,Prosperity:goldFindPercent:15|Rime Monolith|18
rime-monolith|epic|5|6|The Wellspring:maxMana:18,Invocation:castSpeedPercent:9,Sanctuary:allResistance:7,The Hart:maxHp:76,Prosperity:goldFindPercent:16,Might:strength:6|Rime Monolith|18
rime-monolith|epic|6|6|Rimeward:frostResistance:17,Vigor:vitality:7,Prosperity:goldFindPercent:19,The Wellspring:maxMana:33,Invocation:castSpeedPercent:5,Grace:dexterity:10|Rime Monolith|18
rime-monolith|epic|7|6|The Wellspring:maxMana:25,Sanctuary:allResistance:5,The Hart:maxHp:66,Readiness:cooldownPercent:4,Ruin:damagePercent:14,Clarity:manaRegen:10|Rime Monolith|18
rime-monolith|legendary|0|6|Rimeward:frostResistance:19,Haste:attackSpeedPercent:9,Clarity:manaRegen:13,The Wanderer:moveSpeedPercent:5,Vigor:vitality:15,The Wellspring:maxMana:32|Rime Monolith|18
rime-monolith|legendary|1|6|The Wellspring:maxMana:37,Stormward:lightningResistance:20,Efficiency:manaCostPercent:9,Wisdom:xpGainPercent:10,Haste:attackSpeedPercent:6,Precision:critChance:3|Rime Monolith|18
rime-monolith|legendary|2|6|The Wellspring:maxMana:35,Haste:attackSpeedPercent:8,Spellward:arcaneResistance:23,Vigor:vitality:14,The Hart:maxHp:67,Prosperity:goldFindPercent:17|Rime Monolith|18
rime-monolith|legendary|3|6|Rimeward:frostResistance:22,Invocation:castSpeedPercent:8,The Hart:maxHp:59,Clarity:manaRegen:11,Insight:intelligence:8,Severity:critDamage:20|Rime Monolith|18
rime-monolith|legendary|4|6|Rimeward:frostResistance:15,Haste:attackSpeedPercent:6,Wisdom:xpGainPercent:11,Clarity:manaRegen:16,The Wellspring:maxMana:32,Prosperity:goldFindPercent:17|Rime Monolith|18
rime-monolith|legendary|5|6|The Wellspring:maxMana:20,Invocation:castSpeedPercent:10,Sanctuary:allResistance:7,The Hart:maxHp:85,Prosperity:goldFindPercent:18,Might:strength:7|Rime Monolith|18
rime-monolith|legendary|6|6|Rimeward:frostResistance:20,Vigor:vitality:7,Prosperity:goldFindPercent:22,The Wellspring:maxMana:36,Invocation:castSpeedPercent:6,Grace:dexterity:11|Rime Monolith|18
rime-monolith|legendary|7|6|The Wellspring:maxMana:28,Sanctuary:allResistance:6,The Hart:maxHp:74,Readiness:cooldownPercent:4,Ruin:damagePercent:15,Clarity:manaRegen:11|Rime Monolith|18
storm-monolith|common|0|4|Stormward:lightningResistance:12,Haste:attackSpeedPercent:6,Renewal:lifeRegen:1,Clarity:manaRegen:8|Storm Monolith|18
storm-monolith|common|1|4|Haste:attackSpeedPercent:7,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6,Wisdom:xpGainPercent:7|Storm Monolith|18
storm-monolith|common|2|4|Invocation:castSpeedPercent:7,The Wellspring:maxMana:19,Spellward:arcaneResistance:15,Vigor:vitality:9|Storm Monolith|18
storm-monolith|common|3|4|Stormward:lightningResistance:15,Haste:attackSpeedPercent:5,The Hart:maxHp:39,Renewal:lifeRegen:1|Storm Monolith|18
storm-monolith|common|4|4|Stormward:lightningResistance:10,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Renewal:lifeRegen:2|Storm Monolith|18
storm-monolith|common|5|4|Invocation:castSpeedPercent:4,The Wellspring:maxMana:22,Sanctuary:allResistance:5,The Hart:maxHp:57|Storm Monolith|18
storm-monolith|common|6|4|Stormward:lightningResistance:13,Vigor:vitality:5,Prosperity:goldFindPercent:14,The Wellspring:maxMana:24|Storm Monolith|18
storm-monolith|common|7|4|Invocation:castSpeedPercent:6,Sanctuary:allResistance:4,The Hart:maxHp:49,Prosperity:goldFindPercent:9|Storm Monolith|18
storm-monolith|magic|0|4|Stormward:lightningResistance:13,Haste:attackSpeedPercent:7,Renewal:lifeRegen:1,Clarity:manaRegen:8|Storm Monolith|18
storm-monolith|magic|1|4|Haste:attackSpeedPercent:8,Stormward:lightningResistance:15,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:7|Storm Monolith|18
storm-monolith|magic|2|4|Invocation:castSpeedPercent:8,The Wellspring:maxMana:20,Spellward:arcaneResistance:17,Vigor:vitality:10|Storm Monolith|18
storm-monolith|magic|3|4|Stormward:lightningResistance:16,Haste:attackSpeedPercent:6,The Hart:maxHp:43,Renewal:lifeRegen:1|Storm Monolith|18
storm-monolith|magic|4|4|Stormward:lightningResistance:11,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Renewal:lifeRegen:2|Storm Monolith|18
storm-monolith|magic|5|4|Invocation:castSpeedPercent:4,The Wellspring:maxMana:23,Sanctuary:allResistance:5,The Hart:maxHp:62|Storm Monolith|18
storm-monolith|magic|6|4|Stormward:lightningResistance:14,Vigor:vitality:5,Prosperity:goldFindPercent:16,The Wellspring:maxMana:26|Storm Monolith|18
storm-monolith|magic|7|4|Invocation:castSpeedPercent:6,Sanctuary:allResistance:4,The Hart:maxHp:53,Prosperity:goldFindPercent:10|Storm Monolith|18
storm-monolith|rare|0|5|Stormward:lightningResistance:15,Haste:attackSpeedPercent:7,Renewal:lifeRegen:2,Clarity:manaRegen:9,Insight:intelligence:7|Storm Monolith|18
storm-monolith|rare|1|5|Haste:attackSpeedPercent:9,Stormward:lightningResistance:16,Efficiency:manaCostPercent:7,Wisdom:xpGainPercent:8,Ruin:damagePercent:8|Storm Monolith|18
storm-monolith|rare|2|5|Invocation:castSpeedPercent:8,The Wellspring:maxMana:22,Spellward:arcaneResistance:18,Vigor:vitality:11,The Hart:maxHp:54|Storm Monolith|18
storm-monolith|rare|3|5|Stormward:lightningResistance:18,Haste:attackSpeedPercent:7,The Hart:maxHp:47,Renewal:lifeRegen:1,Insight:intelligence:7|Storm Monolith|18
storm-monolith|rare|4|5|Stormward:lightningResistance:12,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:9,Renewal:lifeRegen:2,The Wellspring:maxMana:26|Storm Monolith|18
storm-monolith|rare|5|5|Invocation:castSpeedPercent:5,The Wellspring:maxMana:26,Sanctuary:allResistance:6,The Hart:maxHp:68,Prosperity:goldFindPercent:15|Storm Monolith|18
storm-monolith|rare|6|5|Stormward:lightningResistance:16,Vigor:vitality:6,Prosperity:goldFindPercent:17,The Wellspring:maxMana:29,Invocation:castSpeedPercent:4|Storm Monolith|18
storm-monolith|rare|7|5|Invocation:castSpeedPercent:7,Sanctuary:allResistance:4,The Hart:maxHp:59,Prosperity:goldFindPercent:11,Vigor:vitality:11|Storm Monolith|18
storm-monolith|epic|0|6|Stormward:lightningResistance:17,Haste:attackSpeedPercent:8,Renewal:lifeRegen:2,Clarity:manaRegen:10,Insight:intelligence:8,The Wellspring:maxMana:29|Storm Monolith|18
storm-monolith|epic|1|6|Haste:attackSpeedPercent:10,Stormward:lightningResistance:18,Efficiency:manaCostPercent:8,Wisdom:xpGainPercent:9,Ruin:damagePercent:9,The Wellspring:maxMana:21|Storm Monolith|18
storm-monolith|epic|2|6|Invocation:castSpeedPercent:9,The Wellspring:maxMana:25,Spellward:arcaneResistance:20,Vigor:vitality:12,The Hart:maxHp:60,Prosperity:goldFindPercent:15|Storm Monolith|18
storm-monolith|epic|3|6|Stormward:lightningResistance:20,Haste:attackSpeedPercent:7,The Hart:maxHp:53,Renewal:lifeRegen:1,Insight:intelligence:7,Clarity:manaRegen:15|Storm Monolith|18
storm-monolith|epic|4|6|Stormward:lightningResistance:14,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:10,Renewal:lifeRegen:2,The Wellspring:maxMana:29,Prosperity:goldFindPercent:15|Storm Monolith|18
storm-monolith|epic|5|6|Invocation:castSpeedPercent:5,The Wellspring:maxMana:29,Sanctuary:allResistance:7,The Hart:maxHp:76,Prosperity:goldFindPercent:16,Might:strength:6|Storm Monolith|18
storm-monolith|epic|6|6|Stormward:lightningResistance:17,Vigor:vitality:7,Prosperity:goldFindPercent:19,The Wellspring:maxMana:33,Invocation:castSpeedPercent:5,Grace:dexterity:10|Storm Monolith|18
storm-monolith|epic|7|6|Invocation:castSpeedPercent:8,Sanctuary:allResistance:5,The Hart:maxHp:66,Prosperity:goldFindPercent:12,Vigor:vitality:12,Clarity:manaRegen:10|Storm Monolith|18
storm-monolith|legendary|0|6|Stormward:lightningResistance:19,Haste:attackSpeedPercent:9,Renewal:lifeRegen:2,Clarity:manaRegen:11,Insight:intelligence:9,The Wellspring:maxMana:32|Storm Monolith|18
storm-monolith|legendary|1|6|Haste:attackSpeedPercent:11,Stormward:lightningResistance:20,Efficiency:manaCostPercent:9,Wisdom:xpGainPercent:10,Ruin:damagePercent:10,The Wellspring:maxMana:23|Storm Monolith|18
storm-monolith|legendary|2|6|Invocation:castSpeedPercent:10,The Wellspring:maxMana:28,Spellward:arcaneResistance:23,Vigor:vitality:14,The Hart:maxHp:67,Prosperity:goldFindPercent:17|Storm Monolith|18
storm-monolith|legendary|3|6|Stormward:lightningResistance:22,Haste:attackSpeedPercent:8,The Hart:maxHp:59,Renewal:lifeRegen:2,Insight:intelligence:8,Clarity:manaRegen:17|Storm Monolith|18
storm-monolith|legendary|4|6|Stormward:lightningResistance:15,Haste:attackSpeedPercent:6,Wisdom:xpGainPercent:11,Renewal:lifeRegen:2,The Wellspring:maxMana:32,Prosperity:goldFindPercent:17|Storm Monolith|18
storm-monolith|legendary|5|6|Invocation:castSpeedPercent:6,The Wellspring:maxMana:32,Sanctuary:allResistance:7,The Hart:maxHp:85,Prosperity:goldFindPercent:18,Might:strength:7|Storm Monolith|18
storm-monolith|legendary|6|6|Stormward:lightningResistance:20,Vigor:vitality:7,Prosperity:goldFindPercent:22,The Wellspring:maxMana:36,Invocation:castSpeedPercent:6,Grace:dexterity:11|Storm Monolith|18
storm-monolith|legendary|7|6|Invocation:castSpeedPercent:8,Sanctuary:allResistance:6,The Hart:maxHp:74,Prosperity:goldFindPercent:14,Vigor:vitality:13,Clarity:manaRegen:11|Storm Monolith|18
astral-monolith|common|0|4|Spellward:arcaneResistance:12,Clarity:manaRegen:10,Renewal:lifeRegen:1,Severity:critDamage:9|Astral Monolith|18
astral-monolith|common|1|4|Wisdom:xpGainPercent:9,Spellward:arcaneResistance:14,Clarity:manaRegen:9,Prosperity:goldFindPercent:11|Astral Monolith|18
astral-monolith|common|2|4|Clarity:manaRegen:12,Invocation:castSpeedPercent:6,Spellward:arcaneResistance:15,Vigor:vitality:9|Astral Monolith|18
astral-monolith|common|3|4|Spellward:arcaneResistance:15,Severity:critDamage:11,The Hart:maxHp:39,Clarity:manaRegen:7|Astral Monolith|18
astral-monolith|common|4|4|Spellward:arcaneResistance:10,The Wanderer:moveSpeedPercent:3,Wisdom:xpGainPercent:7,Clarity:manaRegen:11|Astral Monolith|18
astral-monolith|common|5|4|Clarity:manaRegen:7,Ruin:damagePercent:10,The Hart:maxHp:61,Stormward:lightningResistance:15|Astral Monolith|18
astral-monolith|common|6|4|Spellward:arcaneResistance:13,Vigor:vitality:5,Wisdom:xpGainPercent:9,The Wellspring:maxMana:24|Astral Monolith|18
astral-monolith|common|7|4|Wisdom:xpGainPercent:7,Grace:dexterity:7,Spellward:arcaneResistance:13,Clarity:manaRegen:8|Astral Monolith|18
astral-monolith|magic|0|4|Spellward:arcaneResistance:13,Clarity:manaRegen:11,Renewal:lifeRegen:1,Severity:critDamage:10|Astral Monolith|18
astral-monolith|magic|1|4|Wisdom:xpGainPercent:10,Spellward:arcaneResistance:15,Clarity:manaRegen:10,Prosperity:goldFindPercent:12|Astral Monolith|18
astral-monolith|magic|2|4|Clarity:manaRegen:13,Invocation:castSpeedPercent:6,Spellward:arcaneResistance:17,Vigor:vitality:10|Astral Monolith|18
astral-monolith|magic|3|4|Spellward:arcaneResistance:16,Severity:critDamage:12,The Hart:maxHp:43,Clarity:manaRegen:8|Astral Monolith|18
astral-monolith|magic|4|4|Spellward:arcaneResistance:11,The Wanderer:moveSpeedPercent:3,Wisdom:xpGainPercent:8,Clarity:manaRegen:12|Astral Monolith|18
astral-monolith|magic|5|4|Clarity:manaRegen:7,Ruin:damagePercent:11,The Hart:maxHp:66,Stormward:lightningResistance:16|Astral Monolith|18
astral-monolith|magic|6|4|Spellward:arcaneResistance:14,Vigor:vitality:5,Wisdom:xpGainPercent:10,The Wellspring:maxMana:26|Astral Monolith|18
astral-monolith|magic|7|4|Wisdom:xpGainPercent:8,Grace:dexterity:8,Spellward:arcaneResistance:14,Clarity:manaRegen:8|Astral Monolith|18
astral-monolith|rare|0|5|Spellward:arcaneResistance:15,Clarity:manaRegen:12,Renewal:lifeRegen:2,Severity:critDamage:11,Vigor:vitality:12|Astral Monolith|18
astral-monolith|rare|1|5|Wisdom:xpGainPercent:11,Spellward:arcaneResistance:16,Clarity:manaRegen:10,Prosperity:goldFindPercent:13,Invocation:castSpeedPercent:5|Astral Monolith|18
astral-monolith|rare|2|5|Clarity:manaRegen:14,Invocation:castSpeedPercent:7,Spellward:arcaneResistance:18,Vigor:vitality:11,The Hart:maxHp:54|Astral Monolith|18
astral-monolith|rare|3|5|Spellward:arcaneResistance:18,Severity:critDamage:13,The Hart:maxHp:47,Clarity:manaRegen:9,Insight:intelligence:7|Astral Monolith|18
astral-monolith|rare|4|5|Spellward:arcaneResistance:12,The Wanderer:moveSpeedPercent:3,Wisdom:xpGainPercent:9,Clarity:manaRegen:13,The Wellspring:maxMana:26|Astral Monolith|18
astral-monolith|rare|5|5|Clarity:manaRegen:8,Ruin:damagePercent:12,The Hart:maxHp:73,Stormward:lightningResistance:18,Prosperity:goldFindPercent:15|Astral Monolith|18
astral-monolith|rare|6|5|Spellward:arcaneResistance:16,Vigor:vitality:6,Wisdom:xpGainPercent:11,The Wellspring:maxMana:29,Haste:attackSpeedPercent:4|Astral Monolith|18
astral-monolith|rare|7|5|Wisdom:xpGainPercent:8,Grace:dexterity:9,Spellward:arcaneResistance:16,Clarity:manaRegen:9,The Hart:maxHp:67|Astral Monolith|18
astral-monolith|epic|0|6|Spellward:arcaneResistance:17,Clarity:manaRegen:13,Renewal:lifeRegen:2,Severity:critDamage:12,Vigor:vitality:13,Invocation:castSpeedPercent:9|Astral Monolith|18
astral-monolith|epic|1|6|Wisdom:xpGainPercent:12,Spellward:arcaneResistance:18,Clarity:manaRegen:12,Prosperity:goldFindPercent:14,Invocation:castSpeedPercent:6,The Wellspring:maxMana:21|Astral Monolith|18
astral-monolith|epic|2|6|Clarity:manaRegen:16,Invocation:castSpeedPercent:7,Spellward:arcaneResistance:20,Vigor:vitality:12,The Hart:maxHp:60,Wisdom:xpGainPercent:10|Astral Monolith|18
astral-monolith|epic|3|6|Spellward:arcaneResistance:20,Severity:critDamage:15,The Hart:maxHp:53,Clarity:manaRegen:10,Insight:intelligence:7,The Wanderer:moveSpeedPercent:6|Astral Monolith|18
astral-monolith|epic|4|6|Spellward:arcaneResistance:14,The Wanderer:moveSpeedPercent:3,Wisdom:xpGainPercent:10,Clarity:manaRegen:15,The Wellspring:maxMana:29,Prosperity:goldFindPercent:15|Astral Monolith|18
astral-monolith|epic|5|6|Clarity:manaRegen:9,Ruin:damagePercent:13,The Hart:maxHp:81,Stormward:lightningResistance:20,Prosperity:goldFindPercent:16,Might:strength:6|Astral Monolith|18
astral-monolith|epic|6|6|Spellward:arcaneResistance:17,Vigor:vitality:7,Wisdom:xpGainPercent:12,The Wellspring:maxMana:33,Haste:attackSpeedPercent:5,Grace:dexterity:10|Astral Monolith|18
astral-monolith|epic|7|6|Wisdom:xpGainPercent:9,Grace:dexterity:10,Spellward:arcaneResistance:18,Clarity:manaRegen:10,The Hart:maxHp:75,Haste:attackSpeedPercent:6|Astral Monolith|18
astral-monolith|legendary|0|6|Spellward:arcaneResistance:19,Clarity:manaRegen:15,Renewal:lifeRegen:2,Severity:critDamage:14,Vigor:vitality:15,Invocation:castSpeedPercent:10|Astral Monolith|18
astral-monolith|legendary|1|6|Wisdom:xpGainPercent:14,Spellward:arcaneResistance:20,Clarity:manaRegen:13,Prosperity:goldFindPercent:16,Invocation:castSpeedPercent:6,The Wellspring:maxMana:23|Astral Monolith|18
astral-monolith|legendary|2|6|Clarity:manaRegen:17,Invocation:castSpeedPercent:8,Spellward:arcaneResistance:23,Vigor:vitality:14,The Hart:maxHp:67,Wisdom:xpGainPercent:11|Astral Monolith|18
astral-monolith|legendary|3|6|Spellward:arcaneResistance:22,Severity:critDamage:16,The Hart:maxHp:59,Clarity:manaRegen:11,Insight:intelligence:8,The Wanderer:moveSpeedPercent:7|Astral Monolith|18
astral-monolith|legendary|4|6|Spellward:arcaneResistance:15,The Wanderer:moveSpeedPercent:4,Wisdom:xpGainPercent:11,Clarity:manaRegen:16,The Wellspring:maxMana:32,Prosperity:goldFindPercent:17|Astral Monolith|18
astral-monolith|legendary|5|6|Clarity:manaRegen:10,Ruin:damagePercent:15,The Hart:maxHp:91,Stormward:lightningResistance:23,Prosperity:goldFindPercent:18,Might:strength:7|Astral Monolith|18
astral-monolith|legendary|6|6|Spellward:arcaneResistance:20,Vigor:vitality:7,Wisdom:xpGainPercent:14,The Wellspring:maxMana:36,Haste:attackSpeedPercent:6,Grace:dexterity:11|Astral Monolith|18
astral-monolith|legendary|7|6|Wisdom:xpGainPercent:10,Grace:dexterity:11,Spellward:arcaneResistance:20,Clarity:manaRegen:11,The Hart:maxHp:84,Haste:attackSpeedPercent:7|Astral Monolith|18
jade-monolith|common|0|4|Sanctuary:allResistance:4,Precision:critChance:2,Clarity:manaRegen:9,Severity:critDamage:9|Jade Monolith|18
jade-monolith|common|1|4|Renewal:lifeRegen:2,Spellward:arcaneResistance:14,Clarity:manaRegen:9,Wisdom:xpGainPercent:7|Jade Monolith|18
jade-monolith|common|2|4|The Hart:maxHp:60,Haste:attackSpeedPercent:6,Sanctuary:allResistance:5,Vigor:vitality:9|Jade Monolith|18
jade-monolith|common|3|4|Sanctuary:allResistance:4,Haste:attackSpeedPercent:5,The Hart:maxHp:39,Renewal:lifeRegen:1|Jade Monolith|18
jade-monolith|common|4|4|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:7,Renewal:lifeRegen:2|Jade Monolith|18
jade-monolith|common|5|4|The Hart:maxHp:34,Haste:attackSpeedPercent:6,Insight:intelligence:6,Stormward:lightningResistance:15|Jade Monolith|18
jade-monolith|common|6|4|The Hart:maxHp:49,Cinderskin:fireResistance:8,Wisdom:xpGainPercent:9,The Wellspring:maxMana:24|Jade Monolith|18
jade-monolith|common|7|4|Renewal:lifeRegen:1,The Hart:maxHp:46,Stormward:lightningResistance:13,Efficiency:manaCostPercent:5|Jade Monolith|18
jade-monolith|magic|0|4|Sanctuary:allResistance:4,Precision:critChance:2,Clarity:manaRegen:10,Severity:critDamage:10|Jade Monolith|18
jade-monolith|magic|1|4|Renewal:lifeRegen:2,Spellward:arcaneResistance:15,Clarity:manaRegen:10,Wisdom:xpGainPercent:7|Jade Monolith|18
jade-monolith|magic|2|4|The Hart:maxHp:65,Haste:attackSpeedPercent:6,Sanctuary:allResistance:5,Vigor:vitality:10|Jade Monolith|18
jade-monolith|magic|3|4|Sanctuary:allResistance:5,Haste:attackSpeedPercent:6,The Hart:maxHp:43,Renewal:lifeRegen:1|Jade Monolith|18
jade-monolith|magic|4|4|Sanctuary:allResistance:3,Haste:attackSpeedPercent:4,Wisdom:xpGainPercent:8,Renewal:lifeRegen:2|Jade Monolith|18
jade-monolith|magic|5|4|The Hart:maxHp:37,Haste:attackSpeedPercent:7,Insight:intelligence:7,Stormward:lightningResistance:16|Jade Monolith|18
jade-monolith|magic|6|4|The Hart:maxHp:53,Cinderskin:fireResistance:9,Wisdom:xpGainPercent:10,The Wellspring:maxMana:26|Jade Monolith|18
jade-monolith|magic|7|4|Renewal:lifeRegen:2,The Hart:maxHp:50,Stormward:lightningResistance:14,Efficiency:manaCostPercent:6|Jade Monolith|18
jade-monolith|rare|0|5|Sanctuary:allResistance:4,Precision:critChance:3,Clarity:manaRegen:11,Severity:critDamage:11,The Hart:maxHp:73|Jade Monolith|18
jade-monolith|rare|1|5|Renewal:lifeRegen:2,Spellward:arcaneResistance:16,Clarity:manaRegen:10,Wisdom:xpGainPercent:8,The Wellspring:maxMana:17|Jade Monolith|18
jade-monolith|rare|2|5|The Hart:maxHp:72,Haste:attackSpeedPercent:7,Sanctuary:allResistance:5,Vigor:vitality:11,The Wellspring:maxMana:21|Jade Monolith|18
jade-monolith|rare|3|5|Sanctuary:allResistance:5,Haste:attackSpeedPercent:7,The Hart:maxHp:47,Renewal:lifeRegen:1,Insight:intelligence:7|Jade Monolith|18
jade-monolith|rare|4|5|Sanctuary:allResistance:4,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:9,Renewal:lifeRegen:2,The Hart:maxHp:66|Jade Monolith|18
jade-monolith|rare|5|5|The Hart:maxHp:40,Haste:attackSpeedPercent:8,Insight:intelligence:7,Stormward:lightningResistance:18,Prosperity:goldFindPercent:15|Jade Monolith|18
jade-monolith|rare|6|5|The Hart:maxHp:58,Cinderskin:fireResistance:10,Wisdom:xpGainPercent:11,The Wellspring:maxMana:29,Haste:attackSpeedPercent:4|Jade Monolith|18
jade-monolith|rare|7|5|Renewal:lifeRegen:2,The Hart:maxHp:55,Stormward:lightningResistance:16,Efficiency:manaCostPercent:6,The Wellspring:maxMana:26|Jade Monolith|18
jade-monolith|epic|0|6|Sanctuary:allResistance:5,Precision:critChance:3,Clarity:manaRegen:12,Severity:critDamage:12,The Hart:maxHp:81,Haste:attackSpeedPercent:9|Jade Monolith|18
jade-monolith|epic|1|6|Renewal:lifeRegen:2,Spellward:arcaneResistance:18,Clarity:manaRegen:12,Wisdom:xpGainPercent:9,The Wellspring:maxMana:19,The Hart:maxHp:52|Jade Monolith|18
jade-monolith|epic|2|6|The Hart:maxHp:80,Haste:attackSpeedPercent:7,Sanctuary:allResistance:6,Vigor:vitality:12,The Wellspring:maxMana:24,Prosperity:goldFindPercent:15|Jade Monolith|18
jade-monolith|epic|3|6|Sanctuary:allResistance:6,Haste:attackSpeedPercent:7,The Hart:maxHp:53,Renewal:lifeRegen:1,Insight:intelligence:7,Clarity:manaRegen:15|Jade Monolith|18
jade-monolith|epic|4|6|Sanctuary:allResistance:4,Haste:attackSpeedPercent:5,Wisdom:xpGainPercent:10,Renewal:lifeRegen:2,The Hart:maxHp:74,Prosperity:goldFindPercent:15|Jade Monolith|18
jade-monolith|epic|5|6|The Hart:maxHp:45,Haste:attackSpeedPercent:9,Insight:intelligence:8,Stormward:lightningResistance:20,Prosperity:goldFindPercent:16,Might:strength:6|Jade Monolith|18
jade-monolith|epic|6|6|The Hart:maxHp:65,Cinderskin:fireResistance:11,Wisdom:xpGainPercent:12,The Wellspring:maxMana:33,Haste:attackSpeedPercent:5,Grace:dexterity:10|Jade Monolith|18
jade-monolith|epic|7|6|Renewal:lifeRegen:2,The Hart:maxHp:62,Stormward:lightningResistance:18,Efficiency:manaCostPercent:7,The Wellspring:maxMana:30,The Wanderer:moveSpeedPercent:4|Jade Monolith|18
jade-monolith|legendary|0|6|Sanctuary:allResistance:6,Precision:critChance:3,Clarity:manaRegen:13,Severity:critDamage:14,The Hart:maxHp:91,Haste:attackSpeedPercent:10|Jade Monolith|18
jade-monolith|legendary|1|6|Renewal:lifeRegen:3,Spellward:arcaneResistance:20,Clarity:manaRegen:13,Wisdom:xpGainPercent:10,The Wellspring:maxMana:21,The Hart:maxHp:58|Jade Monolith|18
jade-monolith|legendary|2|6|The Hart:maxHp:90,Haste:attackSpeedPercent:8,Sanctuary:allResistance:7,Vigor:vitality:14,The Wellspring:maxMana:26,Prosperity:goldFindPercent:17|Jade Monolith|18
jade-monolith|legendary|3|6|Sanctuary:allResistance:7,Haste:attackSpeedPercent:8,The Hart:maxHp:59,Renewal:lifeRegen:2,Insight:intelligence:8,Clarity:manaRegen:17|Jade Monolith|18
jade-monolith|legendary|4|6|Sanctuary:allResistance:5,Haste:attackSpeedPercent:6,Wisdom:xpGainPercent:11,Renewal:lifeRegen:2,The Hart:maxHp:82,Prosperity:goldFindPercent:17|Jade Monolith|18
jade-monolith|legendary|5|6|The Hart:maxHp:50,Haste:attackSpeedPercent:10,Insight:intelligence:9,Stormward:lightningResistance:23,Prosperity:goldFindPercent:18,Might:strength:7|Jade Monolith|18
jade-monolith|legendary|6|6|The Hart:maxHp:73,Cinderskin:fireResistance:12,Wisdom:xpGainPercent:14,The Wellspring:maxMana:36,Haste:attackSpeedPercent:6,Grace:dexterity:11|Jade Monolith|18
jade-monolith|legendary|7|6|Renewal:lifeRegen:2,The Hart:maxHp:69,Stormward:lightningResistance:20,Efficiency:manaCostPercent:8,The Wellspring:maxMana:33,The Wanderer:moveSpeedPercent:4|Jade Monolith|18
amber-monolith|common|0|4|The Wellspring:maxMana:18,Haste:attackSpeedPercent:6,Clarity:manaRegen:9,Precision:critChance:2|Amber Monolith|18
amber-monolith|common|1|4|Prosperity:goldFindPercent:14,Spellward:arcaneResistance:14,Sorcery:spellDamagePercent:10,Wisdom:xpGainPercent:7|Amber Monolith|18
amber-monolith|common|2|4|The Wanderer:moveSpeedPercent:5,Haste:attackSpeedPercent:6,Grace:dexterity:9,Rimeward:frostResistance:15|Amber Monolith|18
amber-monolith|common|3|4|The Wellspring:maxMana:22,Invocation:castSpeedPercent:5,Rimeward:frostResistance:11,Renewal:lifeRegen:1|Amber Monolith|18
amber-monolith|common|4|4|The Wellspring:maxMana:15,Invocation:castSpeedPercent:4,Wisdom:xpGainPercent:7,Clarity:manaRegen:11|Amber Monolith|18
amber-monolith|common|5|4|Prosperity:goldFindPercent:8,The Wellspring:maxMana:22,Vigor:vitality:10,Stormward:lightningResistance:15|Amber Monolith|18
amber-monolith|common|6|4|The Wellspring:maxMana:19,Cinderskin:fireResistance:8,Prosperity:goldFindPercent:14,The Hart:maxHp:62|Amber Monolith|18
amber-monolith|common|7|4|Prosperity:goldFindPercent:11,The Hart:maxHp:46,Stormward:lightningResistance:13,Clarity:manaRegen:8|Amber Monolith|18
amber-monolith|magic|0|4|The Wellspring:maxMana:20,Haste:attackSpeedPercent:7,Clarity:manaRegen:10,Precision:critChance:2|Amber Monolith|18
amber-monolith|magic|1|4|Prosperity:goldFindPercent:16,Spellward:arcaneResistance:15,Sorcery:spellDamagePercent:11,Wisdom:xpGainPercent:7|Amber Monolith|18
amber-monolith|magic|2|4|The Wanderer:moveSpeedPercent:5,Haste:attackSpeedPercent:6,Grace:dexterity:10,Rimeward:frostResistance:17|Amber Monolith|18
amber-monolith|magic|3|4|The Wellspring:maxMana:24,Invocation:castSpeedPercent:6,Rimeward:frostResistance:12,Renewal:lifeRegen:1|Amber Monolith|18
amber-monolith|magic|4|4|The Wellspring:maxMana:17,Invocation:castSpeedPercent:4,Wisdom:xpGainPercent:8,Clarity:manaRegen:12|Amber Monolith|18
amber-monolith|magic|5|4|Prosperity:goldFindPercent:8,The Wellspring:maxMana:23,Vigor:vitality:11,Stormward:lightningResistance:16|Amber Monolith|18
amber-monolith|magic|6|4|The Wellspring:maxMana:21,Cinderskin:fireResistance:9,Prosperity:goldFindPercent:16,The Hart:maxHp:67|Amber Monolith|18
amber-monolith|magic|7|4|Prosperity:goldFindPercent:12,The Hart:maxHp:50,Stormward:lightningResistance:14,Clarity:manaRegen:8|Amber Monolith|18
amber-monolith|rare|0|5|The Wellspring:maxMana:22,Haste:attackSpeedPercent:7,Clarity:manaRegen:11,Precision:critChance:2,Rimeward:frostResistance:19|Amber Monolith|18
amber-monolith|rare|1|5|Prosperity:goldFindPercent:17,Spellward:arcaneResistance:16,Sorcery:spellDamagePercent:13,Wisdom:xpGainPercent:8,Ruin:damagePercent:8|Amber Monolith|18
amber-monolith|rare|2|5|The Wanderer:moveSpeedPercent:6,Haste:attackSpeedPercent:7,Grace:dexterity:11,Rimeward:frostResistance:18,The Wellspring:maxMana:21|Amber Monolith|18
amber-monolith|rare|3|5|The Wellspring:maxMana:26,Invocation:castSpeedPercent:7,Rimeward:frostResistance:13,Renewal:lifeRegen:1,Insight:intelligence:7|Amber Monolith|18
amber-monolith|rare|4|5|The Wellspring:maxMana:18,Invocation:castSpeedPercent:5,Wisdom:xpGainPercent:9,Clarity:manaRegen:13,Spellward:arcaneResistance:18|Amber Monolith|18
amber-monolith|rare|5|5|Prosperity:goldFindPercent:9,The Wellspring:maxMana:26,Vigor:vitality:12,Stormward:lightningResistance:18,Renewal:lifeRegen:2|Amber Monolith|18
amber-monolith|rare|6|5|The Wellspring:maxMana:23,Cinderskin:fireResistance:10,Prosperity:goldFindPercent:17,The Hart:maxHp:74,Haste:attackSpeedPercent:4|Amber Monolith|18
amber-monolith|rare|7|5|Prosperity:goldFindPercent:13,The Hart:maxHp:55,Stormward:lightningResistance:16,Clarity:manaRegen:9,The Wellspring:maxMana:26|Amber Monolith|18
amber-monolith|epic|0|6|The Wellspring:maxMana:24,Haste:attackSpeedPercent:8,Clarity:manaRegen:12,Precision:critChance:2,Rimeward:frostResistance:22,The Wanderer:moveSpeedPercent:6|Amber Monolith|18
amber-monolith|epic|1|6|Prosperity:goldFindPercent:19,Spellward:arcaneResistance:18,Sorcery:spellDamagePercent:14,Wisdom:xpGainPercent:9,Ruin:damagePercent:9,The Wellspring:maxMana:21|Amber Monolith|18
amber-monolith|epic|2|6|The Wanderer:moveSpeedPercent:6,Haste:attackSpeedPercent:7,Grace:dexterity:12,Rimeward:frostResistance:20,The Wellspring:maxMana:24,Prosperity:goldFindPercent:15|Amber Monolith|18
amber-monolith|epic|3|6|The Wellspring:maxMana:30,Invocation:castSpeedPercent:7,Rimeward:frostResistance:14,Renewal:lifeRegen:1,Insight:intelligence:7,Clarity:manaRegen:15|Amber Monolith|18
amber-monolith|epic|4|6|The Wellspring:maxMana:20,Invocation:castSpeedPercent:5,Wisdom:xpGainPercent:10,Clarity:manaRegen:15,Spellward:arcaneResistance:20,Prosperity:goldFindPercent:15|Amber Monolith|18
amber-monolith|epic|5|6|Prosperity:goldFindPercent:10,The Wellspring:maxMana:29,Vigor:vitality:13,Stormward:lightningResistance:20,Renewal:lifeRegen:2,Might:strength:6|Amber Monolith|18
amber-monolith|epic|6|6|The Wellspring:maxMana:26,Cinderskin:fireResistance:11,Prosperity:goldFindPercent:19,The Hart:maxHp:83,Haste:attackSpeedPercent:5,Grace:dexterity:10|Amber Monolith|18
amber-monolith|epic|7|6|Prosperity:goldFindPercent:15,The Hart:maxHp:62,Stormward:lightningResistance:18,Clarity:manaRegen:10,The Wellspring:maxMana:30,Severity:critDamage:12|Amber Monolith|18
amber-monolith|legendary|0|6|The Wellspring:maxMana:27,Haste:attackSpeedPercent:9,Clarity:manaRegen:13,Precision:critChance:3,Rimeward:frostResistance:24,The Wanderer:moveSpeedPercent:6|Amber Monolith|18
amber-monolith|legendary|1|6|Prosperity:goldFindPercent:22,Spellward:arcaneResistance:20,Sorcery:spellDamagePercent:16,Wisdom:xpGainPercent:10,Ruin:damagePercent:10,The Wellspring:maxMana:23|Amber Monolith|18
amber-monolith|legendary|2|6|The Wanderer:moveSpeedPercent:7,Haste:attackSpeedPercent:8,Grace:dexterity:14,Rimeward:frostResistance:23,The Wellspring:maxMana:26,Prosperity:goldFindPercent:17|Amber Monolith|18
amber-monolith|legendary|3|6|The Wellspring:maxMana:33,Invocation:castSpeedPercent:8,Rimeward:frostResistance:16,Renewal:lifeRegen:2,Insight:intelligence:8,Clarity:manaRegen:17|Amber Monolith|18
amber-monolith|legendary|4|6|The Wellspring:maxMana:23,Invocation:castSpeedPercent:6,Wisdom:xpGainPercent:11,Clarity:manaRegen:16,Spellward:arcaneResistance:22,Prosperity:goldFindPercent:17|Amber Monolith|18
amber-monolith|legendary|5|6|Prosperity:goldFindPercent:12,The Wellspring:maxMana:32,Vigor:vitality:15,Stormward:lightningResistance:23,Renewal:lifeRegen:2,Might:strength:7|Amber Monolith|18
amber-monolith|legendary|6|6|The Wellspring:maxMana:29,Cinderskin:fireResistance:12,Prosperity:goldFindPercent:22,The Hart:maxHp:92,Haste:attackSpeedPercent:6,Grace:dexterity:11|Amber Monolith|18
amber-monolith|legendary|7|6|Prosperity:goldFindPercent:17,The Hart:maxHp:69,Stormward:lightningResistance:20,Clarity:manaRegen:11,The Wellspring:maxMana:33,Severity:critDamage:13|Amber Monolith|18`.split('\n');

test('charm identity, affix counts and rolled values survive uniform 1x1 slots unchanged', () => {
  const after: string[] = [];
  for (const profile of CHARM_PROFILES) for (const tier of TIERS) for (let seed = 0; seed < 8; seed++) {
    after.push(digest(profile.id, tier, seed));
    assert.equal(charmAffixCount(generateItem(seed, 20, 'charm', profile.id, tier)), Number(after[after.length - 1].split('|')[3]));
  }
  assert.equal(after.length, BEFORE.length);
  assert.deepEqual(after, BEFORE);
});

test('authored charm size classes still budget affixes while every stone occupies one cell', () => {
  assert.deepEqual(CHARM_SIZES.map(size => [size.id, ...size.counts]), [
    ['pebble', 1, 1, 2, 2, 2], ['shard', 1, 2, 2, 2, 2], ['tablet', 2, 2, 3, 3, 4],
    ['spire', 2, 2, 2, 3, 3], ['heart', 3, 3, 4, 4, 5], ['monolith', 4, 4, 5, 6, 6]]);
  assert.deepEqual(CHARM_SIZES.map(size => size.weight), [30, 25, 16, 16, 9, 4]);
  for (const profile of CHARM_PROFILES) for (const tier of TIERS) {
    const item = generateItem(9, 20, 'charm', profile.id, tier);
    // The size class stays authored and keeps driving the affix budget...
    assert.deepEqual([profile.size.width, profile.size.height], AUTHORED_SIZES[profile.size.id]);
    assert.equal(item.affixes.length, profile.size.counts[TIERS.indexOf(tier)]);
    // ...while the spatial footprint is uniform. Collapsing CHARM_SIZES to 1x1 would fail above.
    assert.deepEqual(itemFootprint(item), { width: 1, height: 1 });
  }
});
