import { ingredientAssets } from './assets.js';
import type { Ingredient } from '../types/index.js';

export const ingredients: Ingredient[] = [
  // FIRE
  {
    id: 'dragon-scale',
    assets: ingredientAssets['dragon-scale'],
    name: 'Dragon Scale',
    description:
      'A thick, crimson scale shed by a fire-breathing dragon. It remains warm long after being separated from its owner and is prized for its fiery energy and resistance to flames.',
    element: 'fire',
    properties: ['heat', 'power', 'protection'],
  },
  {
    id: 'ember-root',
    assets: ingredientAssets['ember-root'],
    name: 'Ember Root',
    description:
      'A twisted red root that grows beneath scorched trees and in soil warmed by underground fires. Its fibers glow faintly when exposed to air and release a steady, comforting heat.',
    element: 'fire',
    properties: ['heat', 'protection'],
  },
  {
    id: 'cinder-bloom',
    assets: ingredientAssets['cinder-bloom'],
    name: 'Cinder Bloom',
    description:
      'A bright orange flower that flourishes among the ashes of recently burned forests. Its petals resemble tiny flames and crumble into glowing sparks when crushed.',
    element: 'fire',
    properties: ['heat', 'transformation'],
  },
  {
    id: 'volcanic-glass',
    assets: ingredientAssets['volcanic-glass'],
    name: 'Volcanic Glass',
    description:
      'A glossy black stone formed when molten lava cools almost instantly. Its razor-sharp edges and volcanic origins make it a favored ingredient in spells of destruction and transformation.',
    element: 'fire',
    properties: ['heat', 'transformation'],
  },
  {
    id: 'salamander-oil',
    assets: ingredientAssets['salamander-oil'],
    name: 'Salamander Oil',
    description:
      'A golden, shimmering oil extracted from the glands of magical fire salamanders. It ignites easily yet is believed to protect its bearer from burns and extreme temperatures.',
    element: 'fire',
    properties: ['heat', 'protection'],
  },
  {
    id: 'sunpepper',
    assets: ingredientAssets['sunpepper'],
    name: 'Sunpepper',
    description:
      'A small, golden pepper that grows best under intense sunlight. Its fiery taste warms the entire body and is said to awaken dormant energy even in the most exhausted traveler.',
    element: 'fire',
    properties: ['heat', 'power'],
  },
  {
    id: 'ashen-bark',
    assets: ingredientAssets['ashen-bark'],
    name: 'Ashen Bark',
    description:
      'The gray, brittle bark of trees that survive repeated forest fires. When burned, it releases dense, protective smoke that can hide objects from sight.',
    element: 'fire',
    properties: ['protection', 'concealment'],
  },
  {
    id: 'magma-pearl',
    assets: ingredientAssets['magma-pearl'],
    name: 'Magma Pearl',
    description:
      'A glowing red sphere found inside hardened pockets of volcanic rock. Its molten core pulses with intense energy and can alter the physical properties of materials exposed to its heat.',
    element: 'fire',
    properties: ['heat', 'power', 'transformation'],
  },
  {
    id: 'firefly-dust',
    assets: ingredientAssets['firefly-dust'],
    name: 'Firefly Dust',
    description:
      'A fine golden powder gathered from the wings of luminous fireflies. It glitters in darkness and produces tiny, harmless sparks when scattered through the air.',
    element: 'fire',
    properties: ['heat', 'power'],
  },
  {
    id: 'sulfur-crystal',
    assets: ingredientAssets['sulfur-crystal'],
    name: 'Sulfur Crystal',
    description:
      'A brittle yellow crystal that forms near volcanic vents and hot springs. It releases a pungent smell when heated and produces dangerous fumes when mixed with certain substances.',
    element: 'fire',
    properties: ['heat', 'poison'],
  },

  // WATER
  {
    id: 'moonwell-dew',
    assets: ingredientAssets['moonwell-dew'],
    name: 'Moonwell Dew',
    description:
      'Silvery droplets collected from the surface of a sacred well beneath the full moon. The water is exceptionally clear and is believed to wash away impurities and reveal hidden truths.',
    element: 'water',
    properties: ['purification', 'divination'],
  },
  {
    id: 'river-reed',
    assets: ingredientAssets['river-reed'],
    name: 'River Reed',
    description:
      'A tall, flexible plant that grows along the banks of swiftly flowing rivers. Its hollow stems bend without breaking, making it a symbol of adaptation and effortless movement.',
    element: 'water',
    properties: ['mobility', 'protection'],
  },
  {
    id: 'tidal-pearl',
    assets: ingredientAssets['tidal-pearl'],
    name: 'Tidal Pearl',
    description:
      'A pale blue pearl formed inside shellfish living in powerful ocean currents. Its surface seems to shift with the tides, and it is believed to contain the force of moving water.',
    element: 'water',
    properties: ['power', 'mobility'],
  },
  {
    id: 'frost-crystal',
    assets: ingredientAssets['frost-crystal'],
    name: 'Frost Crystal',
    description:
      'A translucent crystal that forms in caves where the temperature never rises above freezing. It remains icy even in warm surroundings and can preserve delicate substances for extraordinary lengths of time.',
    element: 'water',
    properties: ['freezing', 'preservation'],
  },
  {
    id: 'seafoam-salt',
    assets: ingredientAssets['seafoam-salt'],
    name: 'Seafoam Salt',
    description:
      'Fine white salt harvested from the foam of waves breaking against ancient coastal cliffs. It dissolves rapidly in water and is traditionally used to cleanse objects of unwanted magical residue.',
    element: 'water',
    properties: ['purification'],
  },
  {
    id: 'deepwater-kelp',
    assets: ingredientAssets['deepwater-kelp'],
    name: 'Deepwater Kelp',
    description:
      "A long, dark-green seaweed that thrives far below the ocean's surface. Its resilient fronds withstand crushing pressure and are associated with survival in hostile underwater environments.",
    element: 'water',
    properties: ['protection', 'transformation'],
  },
  {
    id: 'rain-orchid',
    assets: ingredientAssets['rain-orchid'],
    name: 'Rain Orchid',
    description:
      'A delicate blue orchid that opens its petals only during rainfall. Its nectar stores remarkable amounts of moisture and is said to revive plants weakened by prolonged drought.',
    element: 'water',
    properties: ['healing', 'growth'],
  },
  {
    id: 'mist-moss',
    assets: ingredientAssets['mist-moss'],
    name: 'Mist Moss',
    description:
      'A pale, velvety moss found on stones constantly covered by cold morning fog. When disturbed, it releases a thin cloud of mist that conceals whatever lies beneath it.',
    element: 'water',
    properties: ['concealment'],
  },
  {
    id: 'glacier-shard',
    assets: ingredientAssets['glacier-shard'],
    name: 'Glacier Shard',
    description:
      'A fragment of ancient blue ice broken from the heart of a glacier. It radiates penetrating cold and is believed to suspend decay in anything sealed within its frozen surface.',
    element: 'water',
    properties: ['freezing', 'preservation'],
  },
  {
    id: 'springwater-lotus',
    assets: ingredientAssets['springwater-lotus'],
    name: 'Springwater Lotus',
    description:
      'A white lotus that blooms on the surface of pristine mountain springs. Its petals have a cooling fragrance and are traditionally used in soothing remedies for fever and exhaustion.',
    element: 'water',
    properties: ['healing', 'purification'],
  },

  // AIR
  {
    id: 'zephyr-feather',
    assets: ingredientAssets['zephyr-feather'],
    name: 'Zephyr Feather',
    description:
      'An almost weightless feather carried by gentle winds from distant mountain peaks. It never falls straight to the ground and is believed to grant remarkable lightness and agility.',
    element: 'air',
    properties: ['mobility'],
  },
  {
    id: 'whisper-reed',
    assets: ingredientAssets['whisper-reed'],
    name: 'Whisper Reed',
    description:
      'A slender silver reed that produces faint whispers whenever the wind passes through it. Travelers claim its sounds sometimes carry warnings of approaching danger.',
    element: 'air',
    properties: ['divination'],
  },
  {
    id: 'cloud-cotton',
    assets: ingredientAssets['cloud-cotton'],
    name: 'Cloud Cotton',
    description:
      'Soft white fibers gathered from plants that grow on the highest mountain slopes. They are so light that even a small breeze can lift them into the air for hours.',
    element: 'air',
    properties: ['mobility', 'protection'],
  },
  {
    id: 'stormglass-shard',
    assets: ingredientAssets['stormglass-shard'],
    name: 'Stormglass Shard',
    description:
      'A translucent fragment formed when lightning strikes sand during a violent storm. Faint blue sparks flicker inside it, especially when thunderclouds gather overhead.',
    element: 'air',
    properties: ['lightning', 'power'],
  },
  {
    id: 'sky-thistle',
    assets: ingredientAssets['sky-thistle'],
    name: 'Sky Thistle',
    description:
      'A blue-flowered thistle that grows along cliffs exposed to powerful winds. Its seeds drift upward instead of downward and are associated with levitation and swift movement.',
    element: 'air',
    properties: ['mobility'],
  },
  {
    id: 'wind-chime-shell',
    assets: ingredientAssets['wind-chime-shell'],
    name: 'Wind Chime Shell',
    description:
      'A delicate spiral shell that produces musical tones even in completely still air. Its changing melodies are said to foretell shifts in weather and approaching storms.',
    element: 'air',
    properties: ['divination'],
  },
  {
    id: 'hurricane-seed',
    assets: ingredientAssets['hurricane-seed'],
    name: 'Hurricane Seed',
    description:
      'A hard, dark seed found in plants that flourish in regions of relentless storms. When cracked, it releases a sudden burst of compressed air capable of scattering nearby objects.',
    element: 'air',
    properties: ['power', 'mobility'],
  },
  {
    id: 'dawn-mist-vapor',
    assets: ingredientAssets['dawn-mist-vapor'],
    name: 'Dawn Mist Vapor',
    description:
      'A silvery vapor captured from valleys just before sunrise. It spreads rapidly through open spaces and can briefly hide movement behind a veil of shimmering haze.',
    element: 'air',
    properties: ['concealment', 'mobility'],
  },
  {
    id: 'thunderbird-feather',
    assets: ingredientAssets['thunderbird-feather'],
    name: 'Thunderbird Feather',
    description:
      'A dark feather marked with silver streaks from a legendary bird that soars through thunderstorms. It crackles with static electricity and seems to vibrate whenever lightning is near.',
    element: 'air',
    properties: ['lightning', 'mobility'],
  },
  {
    id: 'breeze-fern',
    assets: ingredientAssets['breeze-fern'],
    name: 'Breeze Fern',
    description:
      'A delicate fern whose leaves remain in motion even when the surrounding air is still. Its fresh scent is believed to clear stagnant air and restore energy to tired travelers.',
    element: 'air',
    properties: ['mobility', 'healing'],
  },

  // EARTH
  {
    id: 'ironroot-bark',
    assets: ingredientAssets['ironroot-bark'],
    name: 'Ironroot Bark',
    description:
      'The tough, dark bark of an ancient tree whose roots penetrate solid stone. It is nearly impossible to tear by hand and is valued for its exceptional durability.',
    element: 'earth',
    properties: ['protection', 'power'],
  },
  {
    id: 'granite-dust',
    assets: ingredientAssets['granite-dust'],
    name: 'Granite Dust',
    description:
      'A coarse gray powder produced by grinding old mountain granite. It carries the symbolic strength of stone and is used in mixtures intended to reinforce fragile materials.',
    element: 'earth',
    properties: ['protection', 'preservation'],
  },
  {
    id: 'moss-agate',
    assets: ingredientAssets['moss-agate'],
    name: 'Moss Agate',
    description:
      'A green-speckled gemstone whose patterns resemble tiny forests trapped inside crystal. It is traditionally associated with fertile soil, healthy plants, and steady natural growth.',
    element: 'earth',
    properties: ['growth', 'healing'],
  },
  {
    id: 'amber-resin',
    assets: ingredientAssets['amber-resin'],
    name: 'Amber Resin',
    description:
      'Thick golden resin that slowly hardens into translucent amber. It can preserve small objects for centuries and is believed to protect delicate magical substances from decay.',
    element: 'earth',
    properties: ['preservation', 'protection'],
  },
  {
    id: 'mandrake-root',
    assets: ingredientAssets['mandrake-root'],
    name: 'Mandrake Root',
    description:
      'A forked root whose twisted shape often resembles a small human figure. It is surrounded by old superstitions and is traditionally associated with vitality and powerful restorative magic.',
    element: 'earth',
    properties: ['growth', 'healing', 'power'],
  },
  {
    id: 'clayheart-stone',
    assets: ingredientAssets['clayheart-stone'],
    name: 'Clayheart Stone',
    description:
      'A smooth brown stone with a soft, clay-like center that remains strangely pliable. It can be reshaped under pressure before hardening into a durable new form.',
    element: 'earth',
    properties: ['transformation', 'protection'],
  },
  {
    id: 'crystal-fern',
    assets: ingredientAssets['crystal-fern'],
    name: 'Crystal Fern',
    description:
      'A rare fern whose leaves gradually turn into transparent mineral crystals as it matures. It is believed to channel the strength of the earth into other plants and accelerate their development.',
    element: 'earth',
    properties: ['growth', 'power'],
  },
  {
    id: 'burrowing-beetle-shell',
    assets: ingredientAssets['burrowing-beetle-shell'],
    name: 'Burrowing Beetle Shell',
    description:
      'The thick, ridged shell of a beetle capable of tunneling through compact soil and soft stone. Despite its small size, the shell can withstand enormous pressure without cracking.',
    element: 'earth',
    properties: ['protection', 'power'],
  },
  {
    id: 'oak-gall',
    assets: ingredientAssets['oak-gall'],
    name: 'Oak Gall',
    description:
      'A hard, rounded growth that forms on oak branches after an insect lays its eggs. Rich in bitter compounds, it is traditionally associated with binding, strengthening, and preserving materials.',
    element: 'earth',
    properties: ['protection', 'preservation'],
  },
  {
    id: 'geode-core',
    assets: ingredientAssets['geode-core'],
    name: 'Geode Core',
    description:
      'A cluster of glittering crystals extracted from the hollow center of an ancient stone. Its orderly structure is believed to concentrate scattered magical energy into a stable, powerful form.',
    element: 'earth',
    properties: ['power', 'preservation'],
  },

  // DARK
  {
    id: 'grave-soil',
    assets: ingredientAssets['grave-soil'],
    name: 'Grave Soil',
    description:
      'Cold, dark earth collected from graves that have remained undisturbed for generations. It is believed to retain traces of the dead and is traditionally used in rituals involving restless spirits.',
    element: 'dark',
    properties: ['necromancy'],
  },
  {
    id: 'nightshade-berry',
    assets: ingredientAssets['nightshade-berry'],
    name: 'Nightshade Berry',
    description:
      'A glossy black berry from a poisonous plant that flourishes in shaded places. Its dark juice is associated with dangerous toxins, disturbing dreams, and unnatural sleep.',
    element: 'dark',
    properties: ['poison', 'concealment'],
  },
  {
    id: 'shadow-silk',
    assets: ingredientAssets['shadow-silk'],
    name: 'Shadow Silk',
    description:
      'A fine black thread spun by spiders that dwell in caves untouched by sunlight. It absorbs light rather than reflecting it and can make objects wrapped in it almost impossible to notice.',
    element: 'dark',
    properties: ['concealment'],
  },
  {
    id: 'raven-bone',
    assets: ingredientAssets['raven-bone'],
    name: 'Raven Bone',
    description:
      'A small, polished bone taken from a raven, a bird long associated with omens and the boundary between life and death. It is believed to carry messages from unseen spirits and reveal approaching misfortune.',
    element: 'dark',
    properties: ['divination', 'necromancy'],
  },
  {
    id: 'black-candle-wax',
    assets: ingredientAssets['black-candle-wax'],
    name: 'Black Candle Wax',
    description:
      'Dense black wax recovered from candles burned during forbidden midnight rituals. It holds impressions of old incantations and is believed to strengthen curses and spiritual bindings.',
    element: 'dark',
    properties: ['necromancy', 'power'],
  },
  {
    id: 'eclipse-dust',
    assets: ingredientAssets['eclipse-dust'],
    name: 'Eclipse Dust',
    description:
      'An unusually dark powder gathered from stones exposed to a total solar eclipse. It seems to swallow nearby light and is associated with the suppression of magical energy.',
    element: 'dark',
    properties: ['concealment', 'protection'],
  },
  {
    id: 'wraith-ash',
    assets: ingredientAssets['wraith-ash'],
    name: 'Wraith Ash',
    description:
      'A pale gray residue said to remain where a wandering spirit has finally vanished. It feels weightless and icy to the touch and is used in attempts to contact entities beyond the living world.',
    element: 'dark',
    properties: ['necromancy', 'concealment'],
  },
  {
    id: 'crypt-lichen',
    assets: ingredientAssets['crypt-lichen'],
    name: 'Crypt Lichen',
    description:
      'A dark, slow-growing lichen found on the walls of ancient underground tombs. It thrives where little else survives and is believed to preserve traces of long-forgotten funerary magic.',
    element: 'dark',
    properties: ['preservation', 'necromancy'],
  },
  {
    id: 'obsidian-thorn',
    assets: ingredientAssets['obsidian-thorn'],
    name: 'Obsidian Thorn',
    description:
      'A glossy black thorn that resembles a tiny shard of volcanic glass. Its unnatural sharpness leaves wounds that are said to ache long after the thorn has been removed.',
    element: 'dark',
    properties: ['poison', 'power'],
  },
  {
    id: 'mourning-bell-petal',
    assets: ingredientAssets['mourning-bell-petal'],
    name: 'Mourning Bell Petal',
    description:
      'A deep violet petal from a bell-shaped flower that grows near abandoned burial grounds. Its faint, mournful fragrance is believed to attract wandering souls and stir memories of the departed.',
    element: 'dark',
    properties: ['necromancy', 'divination'],
  },

  // LIGHT
  {
    id: 'dawnblossom-petal',
    assets: ingredientAssets['dawnblossom-petal'],
    name: 'Dawnblossom Petal',
    description:
      'A golden-white petal from a flower that opens only in the first rays of sunrise. Its gentle warmth is associated with new beginnings and the restoration of weakened living things.',
    element: 'light',
    properties: ['healing', 'growth'],
  },
  {
    id: 'sunstone-dust',
    assets: ingredientAssets['sunstone-dust'],
    name: 'Sunstone Dust',
    description:
      'Fine orange-gold powder ground from sunstone crystals that sparkle in direct sunlight. It is believed to dispel harmful influences and fill dark places with cleansing radiance.',
    element: 'light',
    properties: ['purification', 'protection'],
  },
  {
    id: 'angelica-root',
    assets: ingredientAssets['angelica-root'],
    name: 'Angelica Root',
    description:
      'An aromatic root from a tall herb traditionally associated with protection and medicinal remedies. Its warm, earthy fragrance is believed to strengthen recovery and ward off harmful influences.',
    element: 'light',
    properties: ['healing', 'protection'],
  },
  {
    id: 'halo-moss',
    assets: ingredientAssets['halo-moss'],
    name: 'Halo Moss',
    description:
      'A soft, pale-green moss surrounded by a faint golden glow. It grows in peaceful, sunlit groves and is said to soothe pain and encourage the healing of minor wounds.',
    element: 'light',
    properties: ['healing'],
  },
  {
    id: 'starlight-nectar',
    assets: ingredientAssets['starlight-nectar'],
    name: 'Starlight Nectar',
    description:
      'A silvery nectar collected from flowers that bloom only beneath a clear night sky. Its surface reflects tiny points of light and is believed to sharpen intuition and reveal hidden patterns.',
    element: 'light',
    properties: ['divination', 'power'],
  },
  {
    id: 'white-sage-leaf',
    assets: ingredientAssets['white-sage-leaf'],
    name: 'White Sage Leaf',
    description:
      'A silver-green leaf from an aromatic sage plant traditionally used in cleansing rituals. When burned, it releases fragrant smoke believed to drive away unwanted influences and protect sacred spaces.',
    element: 'light',
    properties: ['purification', 'protection'],
  },
  {
    id: 'golden-honey',
    assets: ingredientAssets['golden-honey'],
    name: 'Golden Honey',
    description:
      'Thick amber-colored honey gathered from bees that feed on rare sunlit flowers. Its rich sweetness is associated with nourishment, renewed strength, and the gentle healing of injuries.',
    element: 'light',
    properties: ['healing', 'power'],
  },
  {
    id: 'luminous-pearl',
    assets: ingredientAssets['luminous-pearl'],
    name: 'Luminous Pearl',
    description:
      'A flawless white pearl that emits a soft light even in complete darkness. It is believed to expose illusions and reveal truths hidden beneath misleading appearances.',
    element: 'light',
    properties: ['divination', 'purification'],
  },
  {
    id: 'silverleaf-bloom',
    assets: ingredientAssets['silverleaf-bloom'],
    name: 'Silverleaf Bloom',
    description:
      'A delicate white flower with metallic silver leaves that shimmer in daylight. Its petals are traditionally used in antidotes and remedies intended to neutralize harmful substances.',
    element: 'light',
    properties: ['healing', 'purification'],
  },
  {
    id: 'aurora-crystal',
    assets: ingredientAssets['aurora-crystal'],
    name: 'Aurora Crystal',
    description:
      'An iridescent crystal found in regions where colorful auroras illuminate the winter sky. Shifting bands of light move beneath its surface, and it is believed to shield its bearer from hostile magic.',
    element: 'light',
    properties: ['protection', 'power'],
  },
];
