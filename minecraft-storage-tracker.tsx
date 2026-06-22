import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Texture Engine ────────────────────────────────────────────────────────────
// Each texture is a 16×16 grid encoded as an array of 16 strings,
// each string = 16 two-char palette keys. We render to canvas and cache as dataURL.

const T = {
  // Transparent / common
  __: [0,0,0,0],
  // Greens (grass)
  gA: [89,160,45,255], gB: [71,132,30,255], gC: [107,178,58,255], gD: [55,105,20,255],
  // Dirt
  dA: [134,96,67,255], dB: [109,74,47,255], dC: [152,112,78,255], dD: [88,58,34,255],
  // Stone
  sA: [125,125,125,255], sB: [100,100,100,255], sC: [145,145,145,255], sD: [80,80,80,255],
  // Cobblestone
  cA: [118,118,118,255], cB: [80,80,80,255], cC: [148,148,148,255], cD: [55,55,55,255],
  // Oak log (bark)
  lA: [155,110,72,255], lB: [120,80,45,255], lC: [175,130,90,255], lD: [95,65,30,255],
  // Oak log (inner)
  lE: [195,160,95,255], lF: [165,130,65,255],
  // Oak planks
  pA: [196,157,75,255], pB: [162,120,48,255], pC: [218,175,95,255], pD: [138,95,32,255],
  // Diamond
  IA: [67,205,210,255], IB: [28,180,188,255], IC: [100,228,235,255], ID: [12,145,152,255],
  // Iron ingot
  iA: [195,195,195,255], iB: [155,155,155,255], iC: [220,220,220,255], iD: [120,120,120,255],
  // Gold ingot
  gE: [242,200,50,255], gF: [205,155,20,255], gG: [255,225,95,255], gH: [170,120,5,255],
  // Netherite
  nA: [72,56,56,255], nB: [42,30,30,255], nC: [102,78,78,255], nD: [132,98,98,255],
  // Emerald
  eA: [22,200,88,255], eB: [12,165,60,255], eC: [55,228,108,255], eD: [5,120,35,255],
  // Redstone dust
  rA: [225,15,15,255], rB: [180,5,5,255], rC: [255,60,60,255],
  // Coal
  kA: [30,30,30,255], kB: [18,18,18,255], kC: [50,50,50,255],
  // Amethyst
  aA: [152,90,215,255], aB: [112,62,180,255], aC: [190,138,248,255], aD: [80,40,148,255],
  // Blaze rod
  bA: [245,185,25,255], bB: [208,140,5,255], bC: [255,210,60,255],
  // Ender pearl
  eE: [35,120,75,255], eF: [22,85,50,255], eG: [48,158,100,255],
  // Arrow shaft
  arA: [132,103,25,255], arB: [88,62,10,255], arC: [200,195,175,255],
  // Bread
  brA: [196,142,40,255], brB: [156,100,18,255], brC: [225,178,68,255],
  // Apple
  apA: [185,15,15,255], apB: [148,5,5,255], apC: [105,138,5,255],
  // Obsidian
  obA: [22,12,38,255], obB: [10,8,22,255], obC: [36,18,58,255],
  // Copper ingot
  cuA: [215,120,80,255], cuB: [178,88,50,255], cuC: [238,148,108,255],
  // Bone
  boA: [232,232,215,255], boB: [196,196,178,255],
  // Slimeball
  slA: [90,165,58,255], slB: [62,125,38,255], slC: [118,198,82,255],
  // Nether star
  nsA: [240,240,240,255], nsB: [255,215,0,255], nsC: [255,255,255,255],
  // Netherrack
  nhA: [138,35,35,255], nhB: [105,22,22,255], nhC: [165,50,50,255],
  // Chest wood
  wA: [180,135,70,255], wB: [145,100,42,255], wC: [205,162,98,255], wD: [118,78,28,255],
  // Chest latch (gold)
  chL: [200,160,32,255], chM: [160,120,12,255],
  // Ender chest (dark)
  ecA: [15,28,35,255], ecB: [8,18,25,255], ecC: [22,42,55,255], ecF: [28,90,110,255],
  // Shulker (purple)
  shA: [140,90,165,255], shB: [100,60,128,255], shC: [175,125,200,255],
  // Hopper (iron)
  hoA: [108,108,108,255], hoB: [78,78,78,255], hoC: [138,138,138,255],
  // Barrel
  baA: [148,108,65,255], baB: [112,78,38,255], baC: [178,140,92,255],
  // Nether bricks
  nbA: [42,15,15,255], nbB: [28,8,8,255], nbC: [58,22,22,255],
  // End stone
  esA: [220,215,148,255], esB: [185,178,115,255], esC: [242,238,172,255],
  // Grass side green strip
  gsA: [89,160,45,255], gsB: [55,105,20,255],
  // White
  WW: [255,255,255,255],
  // Golden apple glow
  gaA: [252,215,60,255], gaB: [208,165,22,255], gaC: [185,15,15,255],
  // Totem
  tmA: [255,200,60,255], tmB: [225,165,30,255], tmC: [255,230,130,255],
  // Elytra
  elA: [130,130,195,255], elB: [95,95,160,255], elC: [165,165,225,255],
  // String
  stA: [228,228,228,255], stB: [188,188,188,255],
  // Leather
  leA: [122,75,35,255], leB: [88,48,18,255],
  // Feather
  feA: [248,248,248,255], feB: [210,210,210,255],
  // Torch flame
  tfA: [255,200,30,255], tfB: [255,140,0,255], tfC: [255,240,100,255],
  // Name tag
  ntA: [240,240,240,255], ntB: [200,35,35,255],
  // Sand
  sdA: [218,202,145,255], sdB: [195,178,118,255], sdC: [238,222,168,255],
  // Gravel
  grA: [152,140,130,255], grB: [118,108,98,255], grC: [178,165,155,255],
  // Deepslate
  dsA: [88,88,100,255], dsB: [65,65,78,255], dsC: [108,108,122,255],
  // Blackstone
  bsA: [38,32,48,255], bsB: [25,20,35,255], bsC: [52,44,65,255],
  // Moss block
  msA: [92,112,48,255], msB: [68,85,32,255], msC: [115,138,62,255],
  // Glass
  glA: [175,215,225,128], glB: [145,185,200,200], glC: [205,238,248,100],
};

// 16×16 pixel textures - each row is 16 two-char keys
const TEX_DATA = {
  grass_block: [
    'gAgBgCgAgDgBgAgCgBgDgAgBgCgA',
    'gBgDgAgCgBgAgCgDgAgBgCgAgBgD',
    'gCgAgBgDgCgBgAgDgCgBgAgDgCgB',
    'gDgCgAgBgDgCgBgAgDgBgCgAgDgC',
    'dAdBdCdAdBdDdAdCdBdAdDdBdCdA',
    'dBdAdDdCdBdAdCdDdBdCdAdBdDdC',
    'dCdDdAdBdCdAdBdDdCdAdBdDdCdB',
    'dAdCdBdDdAdBdCdAdBdCdDdAdBdC',
    'dBdAdCdAdBdDdAdCdBdAdDdBdCdA',
    'dCdBdAdDdCdAdBdCdAdBdCdDdAdB',
    'dDdAdCdBdDdCdAdBdDdBdAdCdBdD',
    'dAdBdDdCdAdBdDdAdCdBdAdCdDdA',
    'dBdCdAdBdCdDdBdAdCdBdAdDdBdC',
    'dCdAdBdDdAdCdBdDdAdCdBdDdAdC',
    'dDdBdCdAdCdBdAdDdBdCdAdBdDdC',
    'dAdCdDdBdAdDdCdBdAdDdCdBdAdD',
  ],
  stone: [
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
    'sAsAsAsAsAsAsAsAsAsAsAsAsAsAsAsA',
  ],
  cobblestone: [
    'cAcAcBcAcAcAcBcDcAcAcBcAcAcAcBcD',
    'cAcCcAcAcCcAcAcAcAcCcAcAcCcAcAcA',
    'cBcAcDcBcAcBcDcBcBcAcDcBcAcBcDcB',
    'cAcAcBcAcDcAcBcAcAcAcBcAcDcAcBcA',
    'cDcBcAcBcAcBcAcDcDcBcAcBcAcBcAcD',
    'cAcAcCcAcAcAcCcAcAcAcCcAcAcAcCcA',
    'cBcDcBcAcBcDcBcAcBcDcBcAcBcDcBcA',
    'cAcAcAcBcAcAcAcBcAcAcAcBcAcAcAcB',
    'cCcAcDcAcCcAcDcAcCcAcDcAcCcAcDcA',
    'cAcBcAcAcAcBcAcAcAcBcAcAcAcBcAcA',
    'cDcAcBcDcDcAcBcDcDcAcBcDcDcAcBcD',
    'cAcAcAcBcAcAcAcBcAcAcAcBcAcAcAcB',
    'cBcCcAcAcBcCcAcAcBcCcAcAcBcCcAcA',
    'cAcAcDcBcAcAcDcBcAcAcDcBcAcAcDcB',
    'cAcBcAcAcAcBcAcAcAcBcAcAcAcBcAcA',
    'cDcAcCcAcDcAcCcAcDcAcCcAcDcAcCcA',
  ],
  oak_log: [
    'lAlBlAlClAlBlAlAlBlAlClAlBlAlAlB',
    'lBlAlClAlBlAlClBlAlClAlBlAlClBlA',
    'lAlClAlBlAlClAlAlClAlBlAlClAlAlC',
    'lClAlBlAlClAlBlClAlBlAlClAlBlClA',
    'lAlBlAlClAlBlAlAlBlAlClAlBlAlAlB',
    'lBlAlClAlBlAlClBlAlClAlBlAlClBlA',
    'lAlClAlBlAlClAlAlClAlBlAlClAlAlC',
    'lClAlBlAlClAlBlClAlBlAlClAlBlClA',
    'lAlBlAlClAlBlAlAlBlAlClAlBlAlAlB',
    'lBlAlClAlBlAlClBlAlClAlBlAlClBlA',
    'lAlClAlBlAlClAlAlClAlBlAlClAlAlC',
    'lClAlBlAlClAlBlClAlBlAlClAlBlClA',
    'lAlBlAlClAlBlAlAlBlAlClAlBlAlAlB',
    'lBlAlClAlBlAlClBlAlClAlBlAlClBlA',
    'lAlClAlBlAlClAlAlClAlBlAlClAlAlC',
    'lClAlBlAlClAlBlClAlBlAlClAlBlClA',
  ],
  oak_planks: [
    'pApBpApCpApBpApApBpApCpApBpApApB',
    'pBpApCpApBpApCpBpApCpApBpApCpBpA',
    'pApCpApBpApCpApApCpApBpApCpApApC',
    'pCpApBpApCpApBpCpApBpApCpApBpCpA',
    'pDpDpDpDpDpDpDpDpDpDpDpDpDpDpDpD',
    'pApBpApCpApBpApApBpApCpApBpApApB',
    'pBpApCpApBpApCpBpApCpApBpApCpBpA',
    'pApCpApBpApCpApApCpApBpApCpApApC',
    'pCpApBpApCpApBpCpApBpApCpApBpCpA',
    'pDpDpDpDpDpDpDpDpDpDpDpDpDpDpDpD',
    'pApBpApCpApBpApApBpApCpApBpApApB',
    'pBpApCpApBpApCpBpApCpApBpApCpBpA',
    'pApCpApBpApCpApApCpApBpApCpApApC',
    'pCpApBpApCpApBpCpApBpApCpApBpCpA',
    'pDpDpDpDpDpDpDpDpDpDpDpDpDpDpDpD',
    'pApBpApCpApBpApApBpApCpApBpApApB',
  ],
  diamond: [
    '________________',
    '____IAIBIAIA____',
    '__IAIBIBIBIBIA__',
    '__IBIBICICICIB__',
    'IAIBIBICICICICIB',
    'IBIBICICIDIDIDIC',
    'IBIBIDIDIDIDIDIB',
    '__IDIDIDIDID____',
    '__IDIDIDIDID____',
    '__IBIDIDIBIBID__',
    '____IBIBIBIB____',
    '____IBIBIBIB____',
    '______IBIB______',
    '______IBIB______',
    '________IB______',
    '________________',
  ],
  iron_ingot: [
    '________________',
    '________________',
    '__iAiAiAiAiAiA__',
    '__iAiCiCiCiAiA__',
    '__iAiCiCiCiAiA__',
    '__iAiAiAiAiAiA__',
    '____iAiAiAiA____',
    '____iBiBiBiB____',
    '____iBiBiBiB____',
    '__iBiBiBiBiBiB__',
    '__iBiBiBiBiBiB__',
    '__iBiBiBiBiBiB__',
    '__iDiDiDiDiDiD__',
    '__iDiDiDiDiDiD__',
    '________________',
    '________________',
  ],
  gold_ingot: [
    '________________',
    '________________',
    '__gEgEgEgEgEgE__',
    '__gEgGgGgGgEgE__',
    '__gEgGgGgGgEgE__',
    '__gEgEgEgEgEgE__',
    '____gEgEgEgE____',
    '____gFgFgFgF____',
    '____gFgFgFgF____',
    '__gFgFgFgFgFgF__',
    '__gFgFgFgFgFgF__',
    '__gFgFgFgFgFgF__',
    '__gHgHgHgHgHgH__',
    '__gHgHgHgHgHgH__',
    '________________',
    '________________',
  ],
  netherite_ingot: [
    '________________',
    '________________',
    '__nAnAnAnAnAnA__',
    '__nAnCnCnCnAnA__',
    '__nAnCnDnCnAnA__',
    '__nAnAnAnAnAnA__',
    '____nAnAnAnA____',
    '____nBnBnBnB____',
    '____nBnBnBnB____',
    '__nBnBnBnBnBnB__',
    '__nBnBnBnBnBnB__',
    '__nBnBnBnBnBnB__',
    '__nBnBnBnBnBnB__',
    '__nBnBnBnBnBnB__',
    '________________',
    '________________',
  ],
  emerald: [
    '________________',
    '____eBeBeBeb____',
    '____eBeCeBeBeMM__',
    '__eBeAeAeCeAeB__',
    '__eBeBeBeBeBEB__',
    'eBeAeCeAeCeAeBeB',
    'eBeCeAeCeAeCeAeB',
    '__eBeBeBeBeBEB__',
    '__eBeBeBeBEB____',
    '____eDeDeDe_____',
    '____eDeDeDe_____',
    '______eDeD______',
    '______eD________',
    '________________',
    '________________',
    '________________',
  ],
  redstone: [
    '________________',
    '________________',
    '________________',
    '______rArB______',
    '____rArBrBrA____',
    '__rBrArArBrArB__',
    'rBrArBrCrBrArBrA',
    'rArBrCrBrArBrBrA',
    '__rBrArArBrArB__',
    '____rBrBrArA____',
    '______rBrB______',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  coal: [
    '________________',
    '________________',
    '__kAkAkAkAkAkA__',
    '__kAkBkCkBkBkA__',
    '__kAkCkBkCkBkA__',
    '__kAkBkCkBkCkA__',
    '__kAkAkAkAkAkA__',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  amethyst_shard: [
    '________aA______',
    '______aAaBaA____',
    '____aAaCaCaAaA__',
    '__aAaAaCaAaAaAaA',
    '__aAaCaAaDaDaAaA',
    '__aDaDaDaDaDaDaD',
    '____aDaDaDaDaD__',
    '______aDaDaD____',
    '________aD______',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  blaze_rod: [
    '______bA________',
    '____bAbBbA______',
    '____bCbAbB______',
    '______bAbCbA____',
    '________bBbAbC__',
    '________bAbCbA__',
    '__________bBbA__',
    '__________bAbC__',
    '____________bBbA',
    '____________bAbC',
    '______________bA',
    '______________bB',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  ender_pearl: [
    '________________',
    '____eEeFeE______',
    '__eEeGeGeEeE____',
    '__eFeGeGeGeEeF__',
    '__eFeGeGeGeGeF__',
    'eEeGeGeGeGeGeEeE',
    'eFeGeGeGeGeGeEeF',
    '__eGeGeGeGeGeF__',
    '__eGeGeGeGeGEF__',
    '__eEeEeGeGeE____',
    '____eFeEeFeF____',
    '______eEeE______',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  arrow: [
    '________________',
    '__arC___________',
    '__arCarA________',
    '____arAarB______',
    '______arBarA____',
    '________arAarB__',
    '__________arBarA',
    '____________arBa',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  bread: [
    '________________',
    '________________',
    '__brCbrAbrCbrA__',
    '__brAbrCbrAbrC__',
    '__brCbrBbrAbrC__',
    'brAbrCbrBbrCbrAb',
    'brCbrAbrCbrAbrCb',
    'brAbrBbrAbrBbrAb',
    '__brCbrAbrCbrA__',
    '__brBbrCbrBbrC__',
    '__brAbrBbrAbrB__',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  apple: [
    '______apC_______',
    '________apC_____',
    '____apBapAapBapA',
    '__apBapAapAapAapB',
    '__apBapAapAapAapB',
    'apBapAapAapAapAapB',
    'apBapAapAapAapAapB',
    '__apBapAapAapAapB',
    '__apBapAapAapAapB',
    '____apBapAapBapA',
    '______apBapB____',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  obsidian: [
    'obAobBobCobAobBobBobAobCobBobAobAobCobBobAobBobA',
    'obBobAobBobCobAobBobCobAobBobCobAobBobCobAobBobC',
    'obCobBobAobBobCobAobBobCobAobBobAobCobBobAobBobC',
    'obAobCobBobAobBobCobBobAobCobAobBobCobAobBobAobC',
    'obBobAobCobBobAobBobAobCobBobCobAobBobCobAobCobA',
    'obCobBobAobCobBobAobCobBobAobCobBobAobCobBobAobC',
    'obAobCobBobAobCobBobAobCobBobAobCobBobAobCobBobA',
    'obBobAobCobBobAobCobBobAobCobBobAobCobBobAobCobB',
    'obCobBobAobCobBobAobCobBobAobCobBobAobCobBobAobC',
    'obAobCobBobAobCobBobAobCobBobAobCobBobAobCobBobA',
    'obBobAobCobBobAobCobBobAobCobBobAobCobBobAobCobB',
    'obCobBobAobCobBobAobCobBobAobCobBobAobCobBobAobC',
    'obAobCobBobAobCobBobAobCobBobAobCobBobAobCobBobA',
    'obBobAobCobBobAobCobBobAobCobBobAobCobBobAobCobB',
    'obCobBobAobCobBobAobCobBobAobCobBobAobCobBobAobC',
    'obAobCobBobAobCobBobAobCobBobAobCobBobAobCobBobA',
  ],
  copper_ingot: [
    '________________',
    '________________',
    '__cuAcuAcuAcuAcuAcuA__',
    '__cuAcuCcuCcuCcuAcuA__',
    '__cuAcuCcuCcuCcuAcuA__',
    '__cuAcuAcuAcuAcuAcuA__',
    '____cuAcuAcuAcuA____',
    '____cuBcuBcuBcuB____',
    '____cuBcuBcuBcuB____',
    '__cuBcuBcuBcuBcuBcuB__',
    '__cuBcuBcuBcuBcuBcuB__',
    '__cuBcuBcuBcuBcuBcuB__',
    '__cuBcuBcuBcuBcuBcuB__',
    '________________',
    '________________',
    '________________',
  ],
  bone: [
    '____boAboA______',
    '__boAboAboAboA__',
    '__boAboAboAboA__',
    '____boAboA______',
    '______boA_______',
    '__________boA___',
    '____________boA_',
    '____________boAb',
    '___________boBo_',
    '_______boBoboBo_',
    '__boBoboBo______',
    '__boBobo________',
    '__boBoboB_______',
    '__boBo__________',
    '________________',
    '________________',
  ],
  slimeball: [
    '________________',
    '________________',
    '____slBslAslBslA',
    '__slBslAslCslAslB',
    '__slAslCslAslCslA',
    '__slBslAslCslAslB',
    '__slAslCslAslCslA',
    '____slBslAslBslA',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  nether_star: [
    '______nsB_______',
    '____nsAnsAnsB___',
    '____nsAnsAnsA___',
    '__nsAnsAnsAnsAnsA',
    'nsAnsAnsAnsAnsAnsA',
    '__nsAnsAnsAnsAnsA',
    '____nsAnsAnsA___',
    '____nsAnsAnsB___',
    '______nsC_______',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  netherrack: [
    'nhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhC',
    'nhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhA',
    'nhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhB',
    'nhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhA',
    'nhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhC',
    'nhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhA',
    'nhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhB',
    'nhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhA',
    'nhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhC',
    'nhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhA',
    'nhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhB',
    'nhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhA',
    'nhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhC',
    'nhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhBnhA',
    'nhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhAnhB',
    'nhBnhAnhCnhAnhBnhAnhCnhAnhBnhAnhCnhA',
  ],
  // Container icons (16×16 front views)
  chest: [
    'wDwAwDwAwDwAwDwAwDwAwDwAwDwAwDwA',
    'wAwBwCwBwCwBwCwBwCwBwCwBwCwBwAwB',
    'wBwCwBwCwBwCwBwCwBwCwBwCwBwCwBwC',
    'wAwBwCwBwCwBwCwBwCwBwCwBwCwBwAwB',
    'wBwCchLchMchLchLchMchLchLchMwCwB',
    'wCwBchMchLchMchMchLchMchMchLwBwC',
    'wBwCwBwCwBwCwBwCwBwCwBwCwBwCwBwC',
    'wAwBwCwBwCwBwCwBwCwBwCwBwCwBwAwB',
    'wBwCwBwCwBwCwBwCwBwCwBwCwBwCwBwC',
    'wAwBwCwBwCwBwCwBwCwBwCwBwCwBwAwB',
    'wBwCwBwCwBwCwBwCwBwCwBwCwBwCwBwC',
    'wAwBwCwBwCwBwCwBwCwBwCwBwCwBwAwB',
    'wBwCwBwCwBwCwBwCwBwCwBwCwBwCwBwC',
    'wDwDwDwDwDwDwDwDwDwDwDwDwDwDwDwD',
    'wDwDwDwDwDwDwDwDwDwDwDwDwDwDwDwD',
    '________________',
  ],
  ender_chest: [
    'ecBecAecBecAecBecAecBecAecBecAecBecA',
    'ecAecBecCecBecCecBecCecBecCecBecCecB',
    'ecBecCecBecCecBecCecBecCecBecCecBecC',
    'ecAecBecCecBecCecBecCecBecCecBecCecB',
    'ecBecCecFecFecFecFecFecFecFecFecCecB',
    'ecCecBecFecFecFecFecFecFecFecFecBecC',
    'ecBecCecBecCecBecCecBecCecBecCecBecC',
    'ecAecBecCecBecCecBecCecBecCecBecCecB',
    'ecBecCecBecCecBecCecBecCecBecCecBecC',
    'ecAecBecCecBecCecBecCecBecCecBecCecB',
    'ecBecCecBecCecBecCecBecCecBecCecBecC',
    'ecAecBecCecBecCecBecCecBecCecBecCecB',
    'ecBecCecBecCecBecCecBecCecBecCecBecC',
    'ecAecAecAecAecAecAecAecAecAecAecAecA',
    '________________',
    '________________',
  ],
  shulker_box: [
    '________________',
    '____shBshAshBshA',
    '__shBshAshCshAshB',
    '__shAshCshAshCshA',
    '__shBshAshCshAshB',
    '__shAshCshAshCshA',
    '__shBshAshCshAshB',
    '____shBshAshBshA',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  hopper: [
    'hoChoAhoBhoChoAhoBhoChoAhoBhoChoAhoB',
    'hoAhoBhoChoAhoBhoChoAhoBhoChoAhoBhoC',
    'hoBhoChoAhoBhoChoAhoBhoChoAhoBhoChoA',
    'hoChoAhoBhoChoAhoBhoChoAhoBhoChoAhoB',
    '____hoAhoBhoChoAhoB________',
    '______hoBhoChoAhoB______',
    '________hoChoAhoB____',
    '__________hoAhoB__',
    '____________hoB___',
    '______________hoA',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
    '________________',
  ],
  barrel: [
    'baBbaBbaCbaBbaBbaBbaCbaBbaBbaBbaC',
    'baBbaCbaBbaBbaBbaCbaBbaBbaBbaCbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaCbaBbaBbaBbaCbaBbaBbaBbaCbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baBbaBbaBbaBbaBbaBbaBbaBbaBbaBbaB',
    'baCbaBbaBbaCbaBbaBbaCbaBbaBbaCbaB',
  ],
  dirt: [
    'dAdBdCdAdBdDdAdCdBdAdDdBdCdAdBdD',
    'dBdAdDdCdBdAdCdDdBdCdAdBdDdCdAdB',
    'dCdDdAdBdCdAdBdDdCdAdBdDdCdBdAdC',
    'dAdCdBdDdAdBdCdAdBdCdDdAdBdCdDdA',
    'dBdAdCdAdBdDdAdCdBdAdDdBdCdAdBdD',
    'dCdBdAdDdCdAdBdCdAdBdCdDdAdBdAdC',
    'dDdAdCdBdDdCdAdBdDdBdAdCdBdDdCdB',
    'dAdBdDdCdAdBdDdAdCdBdAdCdDdAdBdC',
    'dBdCdAdBdCdDdBdAdCdBdAdDdBdCdAdB',
    'dCdAdBdDdAdCdBdDdAdCdBdDdAdCdBdD',
    'dDdBdCdAdCdBdAdDdBdCdAdBdDdCdAdC',
    'dAdCdDdBdAdDdCdBdAdDdCdBdAdDdCdB',
    'dBdAdCdDdBdAdDdCdBdAdDdCdBdAdDdC',
    'dCdBdAdCdDdBdAdCdDdBdAdCdDdBdAdC',
    'dDdCdBdAdDdCdBdAdDdCdBdAdDdCdBdA',
    'dAdDdCdBdAdDdCdBdAdDdCdBdAdDdCdB',
  ],
  sand: [
    'sdAsdBsdCsdAsdBsdCsdAsdBsdCsdAsdB',
    'sdBsdCsdAsdBsdCsdAsdBsdCsdAsdBsdC',
    'sdCsdAsdBsdCsdAsdBsdCsdAsdBsdCsdA',
    'sdAsdBsdCsdAsdBsdCsdAsdBsdCsdAsdB',
    'sdBsdCsdAsdBsdCsdAsdBsdCsdAsdBsdC',
    'sdCsdAsdBsdCsdAsdBsdCsdAsdBsdCsdA',
    'sdAsdBsdCsdAsdBsdCsdAsdBsdCsdAsdB',
    'sdBsdCsdAsdBsdCsdAsdBsdCsdAsdBsdC',
    'sdCsdAsdBsdCsdAsdBsdCsdAsdBsdCsdA',
    'sdAsdBsdCsdAsdBsdCsdAsdBsdCsdAsdB',
    'sdBsdCsdAsdBsdCsdAsdBsdCsdAsdBsdC',
    'sdCsdAsdBsdCsdAsdBsdCsdAsdBsdCsdA',
    'sdAsdBsdCsdAsdBsdCsdAsdBsdCsdAsdB',
    'sdBsdCsdAsdBsdCsdAsdBsdCsdAsdBsdC',
    'sdCsdAsdBsdCsdAsdBsdCsdAsdBsdCsdA',
    'sdAsdBsdCsdAsdBsdCsdAsdBsdCsdAsdB',
  ],
  deepslate: [
    'dsAdsBdsCdsAdsBdsCdsAdsBdsCdsAdsB',
    'dsBdsCdsAdsBdsCdsAdsBdsCdsAdsBdsC',
    'dsCdsAdsBdsCdsAdsBdsCdsAdsBdsCdsA',
    'dsAdsBdsCdsAdsBdsCdsAdsBdsCdsAdsB',
    'dsBdsCdsAdsBdsCdsAdsBdsCdsAdsBdsC',
    'dsCdsAdsBdsCdsAdsBdsCdsAdsBdsCdsA',
    'dsAdsBdsCdsAdsBdsCdsAdsBdsCdsAdsB',
    'dsBdsCdsAdsBdsCdsAdsBdsCdsAdsBdsC',
    'dsCdsAdsBdsCdsAdsBdsCdsAdsBdsCdsA',
    'dsAdsBdsCdsAdsBdsCdsAdsBdsCdsAdsB',
    'dsBdsCdsAdsBdsCdsAdsBdsCdsAdsBdsC',
    'dsCdsAdsBdsCdsAdsBdsCdsAdsBdsCdsA',
    'dsAdsBdsCdsAdsBdsCdsAdsBdsCdsAdsB',
    'dsBdsCdsAdsBdsCdsAdsBdsCdsAdsBdsC',
    'dsCdsAdsBdsCdsAdsBdsCdsAdsBdsCdsA',
    'dsAdsBdsCdsAdsBdsCdsAdsBdsCdsAdsB',
  ],
};

// ── Canvas texture renderer ────────────────────────────────────────────────────
function renderTexture(data, scale = 1) {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let row = 0; row < 16; row++) {
    const rowStr = data[row] || '';
    // Parse 2-char keys
    const keys = [];
    // rows may be encoded as concatenated 2-char tokens
    // We need to split them carefully: keys are 2 chars each
    // But some keys like 'nhA' are 3 chars...
    // Let me use a regex to extract all valid palette keys
    let remaining = rowStr;
    let col = 0;
    while (remaining.length > 0 && col < 16) {
      let found = false;
      // Try longest match first (3 chars)
      for (let len = 3; len >= 2; len--) {
        const candidate = remaining.slice(0, len);
        if (T[candidate]) {
          keys.push(candidate);
          remaining = remaining.slice(len);
          found = true;
          break;
        }
      }
      if (!found) {
        // Skip underscore/space
        remaining = remaining.slice(1);
        keys.push('__');
      }
      col++;
    }
    while (keys.length < 16) keys.push('__');

    for (let c = 0; c < 16; c++) {
      const rgba = T[keys[c]] || T['__'];
      ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3]/255})`;
      ctx.fillRect(c * scale, row * scale, scale, scale);
    }
  }
  return canvas.toDataURL('image/png');
}

// Cache
const texCache = {};
function getTex(name, scale = 3) {
  const key = `${name}_${scale}`;
  if (!texCache[key]) {
    const data = TEX_DATA[name];
    if (!data) return null;
    texCache[key] = renderTexture(data, scale);
  }
  return texCache[key];
}

// ─── Minecraft Data ───────────────────────────────────────────────────────────
const MC_CONTAINERS = [
  { id: "chest",                name: "Chest",                slots: 27, tex: "chest" },
  { id: "large_chest",          name: "Large Chest",          slots: 54, tex: "chest" },
  { id: "trapped_chest",        name: "Trapped Chest",        slots: 27, tex: "chest" },
  { id: "large_trapped_chest",  name: "Large Trapped Chest",  slots: 54, tex: "chest" },
  { id: "barrel",               name: "Barrel",               slots: 27, tex: "barrel" },
  { id: "ender_chest",          name: "Ender Chest",          slots: 27, tex: "ender_chest" },
  { id: "hopper",               name: "Hopper",               slots: 5,  tex: "hopper" },
  { id: "shulker_box",          name: "Shulker Box",          slots: 27, tex: "shulker_box", tint:"#8E5EA2" },
  { id: "white_shulker_box",    name: "White Shulker Box",    slots: 27, tex: "shulker_box", tint:"#F0F0F0" },
  { id: "orange_shulker_box",   name: "Orange Shulker Box",   slots: 27, tex: "shulker_box", tint:"#F07820" },
  { id: "magenta_shulker_box",  name: "Magenta Shulker Box",  slots: 27, tex: "shulker_box", tint:"#B050B0" },
  { id: "light_blue_shulker_box","name":"Light Blue Shulker Box",slots:27,tex:"shulker_box",tint:"#50A0D0" },
  { id: "yellow_shulker_box",   name: "Yellow Shulker Box",   slots: 27, tex: "shulker_box", tint:"#F0D000" },
  { id: "lime_shulker_box",     name: "Lime Shulker Box",     slots: 27, tex: "shulker_box", tint:"#50B030" },
  { id: "pink_shulker_box",     name: "Pink Shulker Box",     slots: 27, tex: "shulker_box", tint:"#E0709A" },
  { id: "gray_shulker_box",     name: "Gray Shulker Box",     slots: 27, tex: "shulker_box", tint:"#444444" },
  { id: "light_gray_shulker_box","name":"Light Gray Shulker Box",slots:27,tex:"shulker_box",tint:"#999999" },
  { id: "cyan_shulker_box",     name: "Cyan Shulker Box",     slots: 27, tex: "shulker_box", tint:"#158EA0" },
  { id: "purple_shulker_box",   name: "Purple Shulker Box",   slots: 27, tex: "shulker_box", tint:"#6A2F8B" },
  { id: "blue_shulker_box",     name: "Blue Shulker Box",     slots: 27, tex: "shulker_box", tint:"#2840A0" },
  { id: "brown_shulker_box",    name: "Brown Shulker Box",    slots: 27, tex: "shulker_box", tint:"#7B4620" },
  { id: "green_shulker_box",    name: "Green Shulker Box",    slots: 27, tex: "shulker_box", tint:"#3C6020" },
  { id: "red_shulker_box",      name: "Red Shulker Box",      slots: 27, tex: "shulker_box", tint:"#8B2020" },
  { id: "black_shulker_box",    name: "Black Shulker Box",    slots: 27, tex: "shulker_box", tint:"#1A1A1A" },
];

const MC_ITEMS = [
  { id:"oak_log",        name:"Oak Log",           stack:64, category:"Wood",    tex:"oak_log" },
  { id:"oak_planks",     name:"Oak Planks",        stack:64, category:"Wood",    tex:"oak_planks" },
  { id:"stone",          name:"Stone",             stack:64, category:"Blocks",  tex:"stone" },
  { id:"cobblestone",    name:"Cobblestone",       stack:64, category:"Blocks",  tex:"cobblestone" },
  { id:"dirt",           name:"Dirt",              stack:64, category:"Blocks",  tex:"dirt" },
  { id:"sand",           name:"Sand",              stack:64, category:"Blocks",  tex:"sand" },
  { id:"gravel",         name:"Gravel",            stack:64, category:"Blocks",  tex:"cobblestone" },
  { id:"obsidian",       name:"Obsidian",          stack:64, category:"Blocks",  tex:"obsidian" },
  { id:"netherrack",     name:"Netherrack",        stack:64, category:"Blocks",  tex:"netherrack" },
  { id:"deepslate",      name:"Deepslate",         stack:64, category:"Blocks",  tex:"deepslate" },
  { id:"grass_block",    name:"Grass Block",       stack:64, category:"Blocks",  tex:"grass_block" },
  { id:"diamond",        name:"Diamond",           stack:64, category:"Gems",    tex:"diamond" },
  { id:"emerald",        name:"Emerald",           stack:64, category:"Gems",    tex:"emerald" },
  { id:"amethyst_shard", name:"Amethyst Shard",    stack:64, category:"Gems",    tex:"amethyst_shard" },
  { id:"iron_ingot",     name:"Iron Ingot",        stack:64, category:"Ingots",  tex:"iron_ingot" },
  { id:"gold_ingot",     name:"Gold Ingot",        stack:64, category:"Ingots",  tex:"gold_ingot" },
  { id:"copper_ingot",   name:"Copper Ingot",      stack:64, category:"Ingots",  tex:"copper_ingot" },
  { id:"netherite_ingot",name:"Netherite Ingot",   stack:64, category:"Ingots",  tex:"netherite_ingot" },
  { id:"coal",           name:"Coal",              stack:64, category:"Fuel",    tex:"coal" },
  { id:"redstone",       name:"Redstone",          stack:64, category:"Redstone",tex:"redstone" },
  { id:"ender_pearl",    name:"Ender Pearl",       stack:16, category:"Misc",    tex:"ender_pearl" },
  { id:"blaze_rod",      name:"Blaze Rod",         stack:64, category:"Misc",    tex:"blaze_rod" },
  { id:"bone",           name:"Bone",              stack:64, category:"Misc",    tex:"bone" },
  { id:"slimeball",      name:"Slimeball",         stack:64, category:"Misc",    tex:"slimeball" },
  { id:"nether_star",    name:"Nether Star",       stack:64, category:"Misc",    tex:"nether_star" },
  { id:"arrow",          name:"Arrow",             stack:64, category:"Combat",  tex:"arrow" },
  { id:"bread",          name:"Bread",             stack:64, category:"Food",    tex:"bread" },
  { id:"apple",          name:"Apple",             stack:64, category:"Food",    tex:"apple" },
  // Items without textures use a fallback tint block
  { id:"diamond_sword",  name:"Diamond Sword",     stack:1,  category:"Combat",  tex:"diamond" },
  { id:"iron_sword",     name:"Iron Sword",        stack:1,  category:"Combat",  tex:"iron_ingot" },
  { id:"bow",            name:"Bow",               stack:1,  category:"Combat",  tex:"oak_log" },
  { id:"diamond_pickaxe",name:"Diamond Pickaxe",   stack:1,  category:"Tools",   tex:"diamond" },
  { id:"iron_pickaxe",   name:"Iron Pickaxe",      stack:1,  category:"Tools",   tex:"iron_ingot" },
  { id:"diamond_helmet", name:"Diamond Helmet",    stack:1,  category:"Armor",   tex:"diamond" },
  { id:"netherite_sword",name:"Netherite Sword",   stack:1,  category:"Combat",  tex:"netherite_ingot" },
  { id:"netherite_pickaxe",name:"Netherite Pickaxe",stack:1, category:"Tools",   tex:"netherite_ingot" },
  { id:"elytra",         name:"Elytra",            stack:1,  category:"Misc",    tex:"deepslate" },
  { id:"totem_of_undying",name:"Totem of Undying", stack:1,  category:"Misc",    tex:"gold_ingot" },
  { id:"saddle",         name:"Saddle",            stack:1,  category:"Misc",    tex:"coal" },
  { id:"name_tag",       name:"Name Tag",          stack:64, category:"Misc",    tex:"stone" },
  { id:"cooked_beef",    name:"Cooked Beef",       stack:64, category:"Food",    tex:"netherrack" },
  { id:"cooked_chicken", name:"Cooked Chicken",    stack:64, category:"Food",    tex:"sand" },
  { id:"golden_apple",   name:"Golden Apple",      stack:64, category:"Food",    tex:"gold_ingot" },
  { id:"enchanted_golden_apple",name:"Enchanted Golden Apple",stack:64,category:"Food",tex:"gold_ingot"},
  { id:"carrot",         name:"Carrot",            stack:64, category:"Food",    tex:"netherrack" },
  { id:"potato",         name:"Potato",            stack:64, category:"Food",    tex:"dirt" },
  { id:"pumpkin_pie",    name:"Pumpkin Pie",       stack:64, category:"Food",    tex:"sand" },
  { id:"string",         name:"String",            stack:64, category:"Misc",    tex:"stone" },
  { id:"feather",        name:"Feather",           stack:64, category:"Misc",    tex:"stone" },
  { id:"leather",        name:"Leather",           stack:64, category:"Misc",    tex:"dirt" },
  { id:"magma_cream",    name:"Magma Cream",       stack:64, category:"Misc",    tex:"netherrack" },
  { id:"blaze_powder",   name:"Blaze Powder",      stack:64, category:"Misc",    tex:"blaze_rod" },
  { id:"comparator",     name:"Comparator",        stack:64, category:"Redstone",tex:"stone" },
  { id:"repeater",       name:"Repeater",          stack:64, category:"Redstone",tex:"stone" },
  { id:"observer",       name:"Observer",          stack:64, category:"Redstone",tex:"deepslate" },
  { id:"piston",         name:"Piston",            stack:64, category:"Redstone",tex:"oak_planks" },
  { id:"sticky_piston",  name:"Sticky Piston",     stack:64, category:"Redstone",tex:"slimeball" },
  { id:"iron_ore",       name:"Iron Ore",          stack:64, category:"Ores",    tex:"stone" },
  { id:"gold_ore",       name:"Gold Ore",          stack:64, category:"Ores",    tex:"stone" },
  { id:"diamond_ore",    name:"Diamond Ore",       stack:64, category:"Ores",    tex:"stone" },
  { id:"coal_ore",       name:"Coal Ore",          stack:64, category:"Ores",    tex:"stone" },
  { id:"copper_ore",     name:"Copper Ore",        stack:64, category:"Ores",    tex:"stone" },
];

// ─── Texture Image Component ──────────────────────────────────────────────────
function TexImg({ name, size = 48, tint, style = {} }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    // Defer to avoid blocking render
    const t = setTimeout(() => {
      const scale = Math.ceil(size / 16);
      const url = getTex(name, scale);
      setSrc(url);
    }, 0);
    return () => clearTimeout(t);
  }, [name, size]);

  if (!src) {
    return <div style={{ width: size, height: size, background: '#373737', flexShrink: 0, ...style }} />;
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      <img src={src} alt={name} style={{
        width: size, height: size,
        imageRendering: 'pixelated',
        display: 'block',
      }} />
      {tint && (
        <div style={{
          position: 'absolute', inset: 0,
          background: tint,
          mixBlendMode: 'multiply',
          opacity: 0.6,
        }} />
      )}
    </div>
  );
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mc_storage_tracker_v2";
const loadData = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { worlds: [] }; } catch { return { worlds: [] }; } };
const saveData = (d) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
const uid = () => Math.random().toString(36).slice(2, 9);
const getContDef = (id) => MC_CONTAINERS.find(c => c.id === id);
const getItemDef = (id) => MC_ITEMS.find(i => i.id === id);
const calcUsedSlots = (items) => items.reduce((acc, e) => {
  const def = getItemDef(e.itemId);
  return def ? acc + Math.ceil(e.qty / def.stack) : acc;
}, 0);
const parseQty = (str) => {
  const s = str.trim().toLowerCase();
  const mx = s.match(/^(\d+)\s*[x×*]\s*(\d+)$/);
  if (mx) return parseInt(mx[1]) * parseInt(mx[2]);
  const ms = s.match(/^(\d+)\s*stacks?\s*\+?\s*(\d+)?$/);
  if (ms) return parseInt(ms[1]) * 64 + (ms[2] ? parseInt(ms[2]) : 0);
  const n = parseInt(s);
  return isNaN(n) ? 0 : n;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --font:'Press Start 2P',monospace;
  --bg:#1E1E1E;--panel:#303030;--slot:#373737;
  --text:#FFFFFF;--dim:#AAAAAA;
  --green:#55FF55;--gold:#FFAA00;--red:#FF5555;--blue:#5599FF;
  --btn-hi:#C6C6C6;--btn-mid:#8B8B8B;--btn-lo:#333333;
}
html,body,#root{height:100%;font-family:var(--font);background:#000;color:var(--text);overflow:hidden}

/* Panorama */
.pano{position:fixed;inset:0;z-index:0;overflow:hidden}
.sky{position:absolute;inset:0;background:linear-gradient(180deg,#0d0020 0%,#1a0535 18%,#5c1f6e 36%,#c86430 55%,#e8a840 70%,#7ecaea 88%,#5ba8d5 100%);animation:skyS 40s ease-in-out infinite alternate}
@keyframes skyS{0%{filter:hue-rotate(0deg) brightness(.82)}50%{filter:hue-rotate(12deg) brightness(1)}100%{filter:hue-rotate(-8deg) brightness(.9)}}
.stars{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 8% 10%,#fff,transparent),radial-gradient(1px 1px at 25% 6%,#fff,transparent),radial-gradient(1px 1px at 52% 14%,#fff,transparent),radial-gradient(1px 1px at 78% 4%,#fff,transparent),radial-gradient(1px 1px at 91% 20%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 18% 28%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 63% 9%,rgba(255,255,255,.6),transparent),radial-gradient(1px 1px at 40% 18%,rgba(255,255,255,.4),transparent);opacity:.65;animation:tw 5s ease-in-out infinite alternate}
@keyframes tw{0%{opacity:.65}100%{opacity:.2}}
.cloud{position:absolute;background:rgba(255,255,255,.72);image-rendering:pixelated}
.darken{position:absolute;inset:0;background:rgba(0,0,0,.5)}

/* Layout */
.app{position:relative;z-index:1;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;overflow:hidden}

/* MC Button */
.btn{display:block;width:100%;padding:8px 14px;font-family:var(--font);font-size:9px;letter-spacing:.5px;color:#3F3F3F;text-shadow:1px 1px 0 rgba(255,255,255,.4);cursor:pointer;border:none;outline:none;text-align:center;background:linear-gradient(180deg,var(--btn-hi) 0%,var(--btn-mid) 52%,var(--btn-lo) 100%);border-top:2px solid var(--btn-hi);border-left:2px solid var(--btn-hi);border-right:2px solid var(--btn-lo);border-bottom:2px solid var(--btn-lo);user-select:none;transition:filter .05s;white-space:nowrap}
.btn:hover{background:linear-gradient(180deg,#E0E0E0 0%,#AAAAAA 52%,#555 100%);color:var(--gold);text-shadow:1px 1px 0 rgba(0,0,0,.5)}
.btn:active{border-top-color:var(--btn-lo);border-left-color:var(--btn-lo);border-right-color:var(--btn-hi);border-bottom-color:var(--btn-hi);transform:translate(1px,1px)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.sm{font-size:7px;padding:5px 8px}
.btn.red{background:linear-gradient(180deg,#C43030,#882020,#440000);color:#FFB0B0;border-color:#C43030 #440000 #440000 #C43030}
.btn.green{background:linear-gradient(180deg,#30A030,#207020,#104010);color:#B0FFB0;border-color:#30A030 #104010 #104010 #30A030}

/* MC Input */
.inp{width:100%;padding:7px 10px;font-family:var(--font);font-size:8px;color:var(--text);background:var(--slot);border:2px solid;border-color:#111 #666 #666 #111;outline:none;caret-color:var(--green)}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:#555}

/* Panel */
.panel{background:var(--panel);border:3px solid;border-color:#666 #222 #222 #666;padding:14px}
.ptitle{font-size:9px;color:var(--dim);text-align:center;letter-spacing:1px;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #4A4A4A}

/* Inventory slot */
.slot{width:38px;height:38px;background:var(--slot);border:2px solid;border-color:#111 #777 #777 #111;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex-shrink:0;image-rendering:pixelated}
.slot:hover{background:#454545}
.slot .sc{position:absolute;bottom:1px;right:2px;font-size:6px;color:#FFF;text-shadow:1px 1px 0 #000,0 0 2px #000;pointer-events:none;line-height:1}

/* Screens */
.screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px}

/* Logo */
.logo{font-size:clamp(13px,3vw,24px);color:var(--gold);text-shadow:3px 3px 0 #7A4000,-1px -1px 0 #000,0 0 20px rgba(255,170,0,.4);letter-spacing:2px;animation:fl 3s ease-in-out infinite;line-height:1.5;text-align:center}
.logosub{font-size:clamp(5px,1.2vw,8px);color:var(--dim);letter-spacing:3px;margin-top:6px;text-align:center}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

/* World list */
.wcard{display:flex;align-items:center;gap:10px;padding:10px;background:var(--slot);border:2px solid #555;cursor:pointer;transition:border-color .1s;margin-bottom:6px}
.wcard:hover{border-color:var(--gold)}
.wcard.active{border-color:var(--green)}

/* Container grid */
.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;overflow-y:auto;padding:4px}
.ccard{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 6px;background:var(--slot);border:2px solid #555;cursor:pointer;transition:border-color .1s;text-align:center}
.ccard:hover{border-color:var(--gold)}

/* Fill bar */
.fbar{width:100%;height:4px;background:#1A1A1A;border:1px solid #444;margin-top:3px}
.fbarinner{height:100%;transition:width .3s}

/* Item list */
.ilist{display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto;margin-top:8px}
.irow{display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--slot);border:1px solid #444;cursor:pointer;transition:border-color .1s}
.irow:hover,.irow.sel{border-color:var(--gold)}
.irow.sel{border-color:var(--green)}

/* Modal */
.mbg{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;padding:12px}
.modal{width:min(500px,95vw);max-height:88vh;display:flex;flex-direction:column}
.mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}

/* Item picker */
.ipick{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;overflow-y:auto;max-height:260px;padding:4px}
.iopt{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 3px;background:var(--slot);border:2px solid #555;cursor:pointer;text-align:center;transition:border-color .1s}
.iopt:hover{border-color:var(--gold)}
.iopt.sel{border-color:var(--green)}

/* Container picker */
.cpick{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;overflow-y:auto;flex:1;padding:4px}
.copt{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;background:var(--slot);border:2px solid #555;cursor:pointer;text-align:center;transition:border-color .1s}
.copt:hover{border-color:var(--gold)}
.copt.sel{border-color:var(--green)}

/* Cat tabs */
.cats{display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px}
.cat{padding:4px 7px;font-family:var(--font);font-size:6px;background:var(--slot);border:1px solid #555;color:var(--dim);cursor:pointer}
.cat.on{border-color:var(--gold);color:var(--gold);background:#3A3020}

/* Top bar */
.topbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(0,0,0,.8);border-bottom:2px solid #444}
.tbtitle{font-size:8px;color:var(--gold);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* Stats */
.srow{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.schip{display:flex;gap:5px;align-items:center;padding:4px 8px;background:var(--slot);border:1px solid #444}

/* Scrollbar */
::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#1A1A1A}::-webkit-scrollbar-thumb{background:#555;border:2px solid #333}

/* Toast */
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--panel);border:2px solid var(--green);color:var(--green);font-size:7px;padding:10px 16px;z-index:200;animation:tin .2s ease;white-space:nowrap}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* Inv grid */
.invgrid{display:flex;flex-wrap:wrap;gap:3px;padding:4px}

/* Search result */
.sres{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--slot);border:1px solid #444;margin-bottom:4px;cursor:pointer}
.sres:hover{border-color:var(--gold)}

@media(max-width:480px){
  .cpick{grid-template-columns:repeat(2,1fr)}
  .ipick{grid-template-columns:repeat(4,1fr)}
}
`;

// ─── Cloud component ──────────────────────────────────────────────────────────
function Cloud({ x, y, w, h, dur, delay }) {
  return <div className="cloud" style={{ left: `${x}%`, top: `${y}%`, width: w, height: h, animation: `cd ${dur}s linear ${delay}s infinite` }} />;
}

function Btn({ children, onClick, disabled, cls = '', style = {} }) {
  return <button className={`btn ${cls}`} onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(loadData);
  const [screen, setScreen] = useState('menu');
  const [worldId, setWorldId] = useState(null);
  const [contId, setContId] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  // form state
  const [newWorldName, setNewWorldName] = useState('');
  const [selContType, setSelContType] = useState('chest');
  const [newContName, setNewContName] = useState('');
  const [selItem, setSelItem] = useState(null);
  const [itemQty, setItemQty] = useState('1');
  const [itemSearch, setItemSearch] = useState('');
  const [itemCat, setItemCat] = useState('All');
  const [rmSel, setRmSel] = useState(null);
  const [rmQty, setRmQty] = useState('1');
  const [rmSearch, setRmSearch] = useState('');
  const [gSearch, setGSearch] = useState('');

  const persist = useCallback((d) => { setData(d); saveData(d); }, []);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };

  const world = data.worlds.find(w => w.id === worldId);
  const cont = world?.containers.find(c => c.id === contId);

  // World ops
  const createWorld = () => {
    if (!newWorldName.trim()) return;
    const w = { id: uid(), name: newWorldName.trim(), containers: [], created: Date.now() };
    persist({ ...data, worlds: [...data.worlds, w] });
    setNewWorldName(''); setModal(null); showToast('World created!');
  };
  const deleteWorld = (id) => {
    persist({ ...data, worlds: data.worlds.filter(w => w.id !== id) });
    if (worldId === id) { setWorldId(null); setScreen('worlds'); }
  };

  // Container ops
  const addContainer = () => {
    if (!world) return;
    const def = getContDef(selContType);
    const c = { id: uid(), type: selContType, name: newContName.trim() || def.name, items: [] };
    persist({ ...data, worlds: data.worlds.map(w => w.id === worldId ? { ...w, containers: [...w.containers, c] } : w) });
    setModal(null); setNewContName(''); showToast('Container added!');
  };
  const deleteCont = (id) => {
    persist({ ...data, worlds: data.worlds.map(w => w.id === worldId ? { ...w, containers: w.containers.filter(c => c.id !== id) } : w) });
    if (contId === id) { setContId(null); setScreen('storage'); }
  };

  // Item ops
  const addItem = () => {
    if (!selItem || !cont) return;
    const qty = parseQty(itemQty);
    if (qty <= 0) { showToast('Invalid qty'); return; }
    const def = getItemDef(selItem);
    const used = calcUsedSlots(cont.items);
    const slots = getContDef(cont.type)?.slots || 27;
    const existing = cont.items.find(i => i.itemId === selItem);
    const existSlots = existing ? Math.ceil(existing.qty / def.stack) : 0;
    const newSlots = Math.ceil(qty / def.stack);
    if (used - existSlots + (existSlots ? Math.ceil((existing.qty + qty) / def.stack) : newSlots) > slots) {
      showToast('Not enough slots!'); return;
    }
    let newItems;
    if (existing) {
      newItems = cont.items.map(i => i.itemId === selItem ? { ...i, qty: i.qty + qty } : i);
    } else {
      newItems = [...cont.items, { itemId: selItem, qty }];
    }
    persist({ ...data, worlds: data.worlds.map(w => w.id === worldId ? { ...w, containers: w.containers.map(c => c.id === contId ? { ...c, items: newItems } : c) } : w) });
    setModal(null); setSelItem(null); setItemQty('1'); setItemSearch('');
    showToast(`Added ${qty}× ${def.name}`);
  };

  const removeItem = () => {
    if (!rmSel || !cont) return;
    const qty = parseQty(rmQty);
    if (qty <= 0) { showToast('Invalid qty'); return; }
    const existing = cont.items.find(i => i.itemId === rmSel);
    if (!existing) return;
    const newItems = qty >= existing.qty
      ? cont.items.filter(i => i.itemId !== rmSel)
      : cont.items.map(i => i.itemId === rmSel ? { ...i, qty: i.qty - qty } : i);
    persist({ ...data, worlds: data.worlds.map(w => w.id === worldId ? { ...w, containers: w.containers.map(c => c.id === contId ? { ...c, items: newItems } : c) } : w) });
    setModal(null); setRmSel(null); setRmQty('1'); showToast('Item removed');
  };

  // Derived
  const allCats = ['All', ...Array.from(new Set(MC_ITEMS.map(i => i.category)))];
  const filtItems = MC_ITEMS.filter(i =>
    (itemCat === 'All' || i.category === itemCat) &&
    i.name.toLowerCase().includes(itemSearch.toLowerCase())
  );
  const usedSlots = cont ? calcUsedSlots(cont.items) : 0;
  const totalSlots = cont ? (getContDef(cont.type)?.slots || 27) : 0;
  const fillPct = totalSlots ? Math.round((usedSlots / totalSlots) * 100) : 0;
  const fillColor = fillPct > 85 ? '#FF5555' : fillPct > 60 ? '#FFAA00' : '#55FF55';

  const searchResults = gSearch.trim().length >= 2
    ? (world?.containers || []).flatMap(c => c.items.filter(e => {
        const d = getItemDef(e.itemId);
        return d && d.name.toLowerCase().includes(gSearch.toLowerCase());
      }).map(e => ({ cid: c.id, cname: c.name, ...e, def: getItemDef(e.itemId) })))
    : [];

  // Build slot fills for container view
  const slotFills = useMemo(() => {
    if (!cont) return [];
    const fills = [];
    for (const entry of cont.items) {
      const def = getItemDef(entry.itemId);
      if (!def) continue;
      const stacks = Math.ceil(entry.qty / def.stack);
      for (let s = 0; s < stacks; s++) {
        const isLast = s === stacks - 1;
        const stackQty = isLast ? (entry.qty % def.stack || def.stack) : def.stack;
        fills.push({ entry, def, stackQty });
      }
    }
    return fills;
  }, [cont]);

  return (
    <>
      <style>{CSS}{`@keyframes cd{from{transform:translateX(-220px)}to{transform:translateX(110vw)}}`}</style>

      {/* Panorama */}
      <div className="pano">
        <div className="stars" />
        <div className="sky" />
        {[
          { x: -8, y: 10, w: 130, h: 28, dur: 85,  delay: 0 },
          { x: 25, y: 7,  w: 88,  h: 20, dur: 115, delay: 18 },
          { x: 55, y: 16, w: 170, h: 32, dur: 75,  delay: 35 },
          { x: 72, y: 5,  w: 95,  h: 18, dur: 100, delay: 8 },
          { x: -15,y: 26, w: 75,  h: 16, dur: 135, delay: 50 },
        ].map((c, i) => <Cloud key={i} {...c} />)}
        <div className="darken" />
      </div>

      <div className="app">
        {/* ─── MAIN MENU ─── */}
        {screen === 'menu' && (
          <div className="screen">
            <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {/* Grass block + chest as header art */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <TexImg name="chest" size={48} />
                <TexImg name="grass_block" size={48} />
                <TexImg name="chest" size={48} />
              </div>
              <div className="logo">⛏ Storage Tracker</div>
              <div className="logosub">Minecraft Item Manager</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'min(280px,80vw)' }}>
              <Btn onClick={() => { setScreen('worlds'); if (data.worlds.length === 0) setModal('addWorld'); }}>
                Start Storage Tracking
              </Btn>
              <Btn onClick={() => setScreen('howto')}>How It Works</Btn>
            </div>
            <div style={{ marginTop: 24, fontSize: 5, color: '#555', textAlign: 'center', lineHeight: 2.2 }}>
              Not affiliated with Mojang Studios or Microsoft.<br />
              Minecraft™ is a trademark of Mojang AB.
            </div>
          </div>
        )}

        {/* ─── HOW IT WORKS ─── */}
        {screen === 'howto' && (
          <div className="screen">
            <div className="panel" style={{ width: 'min(420px,92vw)' }}>
              <div className="ptitle">★  How It Works  ★</div>
              {[
                ['1.', 'Create a world for each Minecraft save.'],
                ['2.', 'Add containers — chests, barrels, shulkers...'],
                ['3.', 'Add items with exact quantities (64, 4×64, 2 stacks+16).'],
                ['4.', 'Search all containers to find any item.'],
                ['5.', 'Your data is saved locally in your browser.'],
              ].map(([n, t]) => (
                <div key={n} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--gold)', flexShrink: 0 }}>{n}</span>
                  <span style={{ fontSize: 7, color: 'var(--text)', lineHeight: 1.8 }}>{t}</span>
                </div>
              ))}
              <Btn onClick={() => setScreen('menu')} cls="sm" style={{ marginTop: 8 }}>← Back</Btn>
            </div>
          </div>
        )}

        {/* ─── WORLDS ─── */}
        {screen === 'worlds' && (
          <div className="screen">
            <div className="panel" style={{ width: 'min(480px,95vw)' }}>
              <div className="ptitle">🌍  Select World</div>
              {data.worlds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, fontSize: 7, color: '#666' }}>
                  No worlds yet. Create your first!
                </div>
              ) : (
                <div style={{ maxHeight: '52vh', overflowY: 'auto', marginBottom: 10 }}>
                  {data.worlds.map(w => (
                    <div key={w.id} className={`wcard ${worldId === w.id ? 'active' : ''}`}
                      onClick={() => { setWorldId(w.id); setScreen('storage'); }}>
                      <TexImg name="grass_block" size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 8 }}>{w.name}</div>
                        <div style={{ fontSize: 6, color: '#888', marginTop: 3 }}>{w.containers.length} containers</div>
                      </div>
                      <Btn cls="sm red" onClick={e => { e.stopPropagation(); deleteWorld(w.id); }}>✕</Btn>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn cls="green" onClick={() => setModal('addWorld')}>+ New World</Btn>
                <Btn onClick={() => setScreen('menu')}>← Menu</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ─── STORAGE ─── */}
        {screen === 'storage' && world && (
          <div className="screen" style={{ paddingTop: 52, justifyContent: 'flex-start' }}>
            <div className="topbar">
              <Btn cls="sm" onClick={() => setScreen('worlds')}>← Worlds</Btn>
              <span className="tbtitle">🌍 {world.name}</span>
              <Btn cls="sm" onClick={() => setScreen('search')}>🔍 Search</Btn>
            </div>
            <div className="panel" style={{ width: 'min(680px,95vw)', height: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column' }}>
              <div className="srow">
                {[
                  ['CONTAINERS', world.containers.length],
                  ['TOTAL ITEMS', world.containers.reduce((a, c) => a + c.items.reduce((b, i) => b + i.qty, 0), 0)],
                  ['ITEM TYPES', new Set(world.containers.flatMap(c => c.items.map(i => i.itemId))).size],
                ].map(([l, v]) => (
                  <div key={l} className="schip">
                    <span style={{ fontSize: 6, color: '#888' }}>{l}</span>
                    <span style={{ fontSize: 8, color: 'var(--green)' }}>{v}</span>
                  </div>
                ))}
              </div>
              {world.containers.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#555' }}>
                  No containers — add one below!
                </div>
              ) : (
                <div className="cgrid" style={{ flex: 1 }}>
                  {world.containers.map(c => {
                    const def = getContDef(c.type);
                    const used = calcUsedSlots(c.items);
                    const total = def?.slots || 27;
                    const pct = Math.round((used / total) * 100);
                    const fc = pct > 85 ? '#FF5555' : pct > 60 ? '#FFAA00' : '#55FF55';
                    return (
                      <div key={c.id} className="ccard"
                        onClick={() => { setContId(c.id); setScreen('container'); }}>
                        <div style={{ position: 'relative' }}>
                          <TexImg name={def?.tex || 'chest'} size={48} tint={def?.tint} />
                        </div>
                        <div style={{ fontSize: 6, color: 'var(--text)', lineHeight: 1.4, maxWidth: 90, wordBreak: 'break-word', textAlign: 'center' }}>{c.name}</div>
                        <div style={{ fontSize: 5, color: '#777' }}>{used}/{total} slots</div>
                        <div className="fbar" style={{ width: 80 }}>
                          <div className="fbarinner" style={{ width: `${pct}%`, background: fc }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <Btn cls="green" onClick={() => setModal('addContainer')}>+ Add Container</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ─── CONTAINER ─── */}
        {screen === 'container' && cont && (
          <div className="screen" style={{ paddingTop: 52, justifyContent: 'flex-start' }}>
            <div className="topbar">
              <Btn cls="sm" onClick={() => setScreen('storage')}>← Storage</Btn>
              <span className="tbtitle">
                {cont.name}
              </span>
              <span style={{ fontSize: 6, color: '#888', flexShrink: 0 }}>{usedSlots}/{totalSlots}</span>
            </div>
            <div className="panel" style={{ width: 'min(620px,95vw)', height: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <TexImg name={getContDef(cont.type)?.tex || 'chest'} size={40} tint={getContDef(cont.type)?.tint} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 7, color: 'var(--dim)', marginBottom: 3 }}>
                    {getContDef(cont.type)?.name} — {fillPct}% full
                  </div>
                  <div className="fbar">
                    <div className="fbarinner" style={{ width: `${fillPct}%`, background: fillColor }} />
                  </div>
                </div>
                <Btn cls="sm red" onClick={() => deleteCont(contId)}>Delete</Btn>
              </div>

              {/* Inventory grid */}
              <div style={{ fontSize: 7, color: 'var(--dim)', marginBottom: 4 }}>Inventory</div>
              <div className="invgrid">
                {Array.from({ length: totalSlots }).map((_, i) => {
                  const fill = slotFills[i];
                  return (
                    <div key={i} className="slot">
                      {fill && (
                        <>
                          <TexImg name={fill.def.tex} size={32} />
                          {fill.stackQty !== fill.def.stack && (
                            <span className="sc">{fill.stackQty}</span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Contents list */}
              {cont.items.length > 0 && (
                <>
                  <div style={{ fontSize: 7, color: 'var(--dim)', margin: '10px 0 4px' }}>Contents</div>
                  <div className="ilist" style={{ maxHeight: 200 }}>
                    {cont.items.map(entry => {
                      const def = getItemDef(entry.itemId);
                      if (!def) return null;
                      return (
                        <div key={entry.itemId} className="irow">
                          <TexImg name={def.tex} size={24} />
                          <span style={{ flex: 1, fontSize: 7 }}>{def.name}</span>
                          <span style={{ fontSize: 7, color: 'var(--green)' }}>×{entry.qty}</span>
                          <span style={{ fontSize: 5, color: '#666', padding: '1px 4px', background: '#2A2A2A', border: '1px solid #444', marginLeft: 4 }}>{def.category}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {cont.items.length === 0 && (
                <div style={{ textAlign: 'center', padding: 16, fontSize: 7, color: '#555' }}>
                  Container is empty — add items with +
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn cls="green" onClick={() => { setModal('addItem'); setItemSearch(''); setSelItem(null); }}>+ Add Item</Btn>
                <Btn cls="red" disabled={cont.items.length === 0}
                  onClick={() => { setModal('removeItem'); setRmSearch(''); setRmSel(null); }}>
                  − Remove
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ─── SEARCH ─── */}
        {screen === 'search' && world && (
          <div className="screen" style={{ paddingTop: 52, justifyContent: 'flex-start' }}>
            <div className="topbar">
              <Btn cls="sm" onClick={() => setScreen('storage')}>← Storage</Btn>
              <span className="tbtitle">🔍 Search Items</span>
            </div>
            <div className="panel" style={{ width: 'min(600px,95vw)', height: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column' }}>
              <input className="inp" placeholder="Search items across all containers..."
                value={gSearch} onChange={e => setGSearch(e.target.value)}
                style={{ marginBottom: 10 }} autoFocus />
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {gSearch.trim().length < 2 && (
                  <div style={{ textAlign: 'center', padding: 24, fontSize: 7, color: '#555' }}>
                    Type at least 2 characters
                  </div>
                )}
                {gSearch.trim().length >= 2 && searchResults.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, fontSize: 7, color: '#555' }}>
                    Nothing found for "{gSearch}"
                  </div>
                )}
                {searchResults.map((r, i) => (
                  <div key={i} className="sres" onClick={() => { setContId(r.cid); setScreen('container'); setGSearch(''); }}>
                    <TexImg name={r.def.tex} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 8 }}>{r.def.name}</div>
                      <div style={{ fontSize: 6, color: '#777', marginTop: 3 }}>📦 {r.cname}</div>
                    </div>
                    <div style={{ fontSize: 8, color: 'var(--green)' }}>×{r.qty}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {/* Add World */}
      {modal === 'addWorld' && (
        <div className="mbg" onClick={() => setModal(null)}>
          <div className="panel modal" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <span style={{ fontSize: 9, color: 'var(--gold)' }}>🌍 New World</span>
              <Btn cls="sm" onClick={() => setModal(null)}>✕</Btn>
            </div>
            <input className="inp" placeholder="World name (e.g. Survival S1)"
              value={newWorldName} onChange={e => setNewWorldName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createWorld()} autoFocus
              style={{ marginBottom: 10 }} />
            <Btn cls="green" onClick={createWorld}>Create World</Btn>
          </div>
        </div>
      )}

      {/* Add Container */}
      {modal === 'addContainer' && (
        <div className="mbg" onClick={() => setModal(null)}>
          <div className="panel modal" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <span style={{ fontSize: 9, color: 'var(--gold)' }}>📦 Add Container</span>
              <Btn cls="sm" onClick={() => setModal(null)}>✕</Btn>
            </div>
            <input className="inp" placeholder="Custom name (optional)"
              value={newContName} onChange={e => setNewContName(e.target.value)}
              style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 7, color: '#888', marginBottom: 6 }}>Select type:</div>
            <div className="cpick">
              {MC_CONTAINERS.map(c => (
                <div key={c.id} className={`copt ${selContType === c.id ? 'sel' : ''}`}
                  onClick={() => setSelContType(c.id)}>
                  <TexImg name={c.tex} size={40} tint={c.tint} />
                  <span style={{ fontSize: 5.5, color: '#ddd', lineHeight: 1.4 }}>{c.name}</span>
                  <span style={{ fontSize: 5, color: '#888' }}>{c.slots} slots</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <Btn cls="green" onClick={addContainer}>Add Container</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add Item */}
      {modal === 'addItem' && (
        <div className="mbg" onClick={() => setModal(null)}>
          <div className="panel modal" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <span style={{ fontSize: 9, color: 'var(--gold)' }}>+ Add Item</span>
              <Btn cls="sm" onClick={() => setModal(null)}>✕</Btn>
            </div>
            <input className="inp" placeholder="Search items..."
              value={itemSearch} onChange={e => setItemSearch(e.target.value)}
              style={{ marginBottom: 8 }} autoFocus />
            <div className="cats">
              {allCats.map(c => (
                <div key={c} className={`cat ${itemCat === c ? 'on' : ''}`} onClick={() => setItemCat(c)}>{c}</div>
              ))}
            </div>
            <div className="ipick">
              {filtItems.slice(0, 100).map(item => (
                <div key={item.id} className={`iopt ${selItem === item.id ? 'sel' : ''}`}
                  onClick={() => setSelItem(item.id)}>
                  <TexImg name={item.tex} size={32} />
                  <span style={{ fontSize: 5, color: '#ddd', lineHeight: 1.3 }}>{item.name}</span>
                </div>
              ))}
            </div>
            {selItem && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 7, color: '#888', flexShrink: 0 }}>QTY:</span>
                <input className="inp" value={itemQty} onChange={e => setItemQty(e.target.value)}
                  placeholder="64  or  4×64  or  2 stacks+8"
                  style={{ flex: 1 }}
                  onKeyDown={e => e.key === 'Enter' && addItem()} />
                <Btn cls="green sm" onClick={addItem} style={{ width: 'auto', padding: '5px 12px' }}>Add</Btn>
              </div>
            )}
            {!selItem && (
              <div style={{ fontSize: 6, color: '#555', textAlign: 'center', marginTop: 8 }}>Select an item above</div>
            )}
          </div>
        </div>
      )}

      {/* Remove Item */}
      {modal === 'removeItem' && cont && (
        <div className="mbg" onClick={() => setModal(null)}>
          <div className="panel modal" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <span style={{ fontSize: 9, color: 'var(--gold)' }}>− Remove Item</span>
              <Btn cls="sm" onClick={() => setModal(null)}>✕</Btn>
            </div>
            <input className="inp" placeholder="Filter..."
              value={rmSearch} onChange={e => setRmSearch(e.target.value)}
              style={{ marginBottom: 8 }} autoFocus />
            <div className="ilist" style={{ maxHeight: 220 }}>
              {cont.items.filter(e => {
                const d = getItemDef(e.itemId);
                return d && d.name.toLowerCase().includes(rmSearch.toLowerCase());
              }).map(entry => {
                const def = getItemDef(entry.itemId);
                if (!def) return null;
                return (
                  <div key={entry.itemId}
                    className={`irow ${rmSel === entry.itemId ? 'sel' : ''}`}
                    onClick={() => setRmSel(entry.itemId)}>
                    <TexImg name={def.tex} size={24} />
                    <span style={{ flex: 1, fontSize: 7 }}>{def.name}</span>
                    <span style={{ fontSize: 7, color: 'var(--green)' }}>×{entry.qty}</span>
                  </div>
                );
              })}
            </div>
            {rmSel && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 7, color: '#888', flexShrink: 0 }}>REMOVE:</span>
                <input className="inp" value={rmQty} onChange={e => setRmQty(e.target.value)}
                  style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && removeItem()} />
                <Btn cls="red sm" onClick={removeItem} style={{ width: 'auto', padding: '5px 12px' }}>Remove</Btn>
              </div>
            )}
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </>
  );
}
