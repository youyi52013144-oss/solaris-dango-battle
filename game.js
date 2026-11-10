(() => {
  "use strict";

  const ARENA_SIZE = 720;
  const MAP_PADDING = 45;
  const BOUNDARY = MAP_PADDING;
  let MAP_SIZE = 20;
  let CELL_SIZE = (ARENA_SIZE - MAP_PADDING * 2) / MAP_SIZE;
  const DEFAULT_ROUND_SECONDS = 50;
  const WINNING_SCORE = 2;
  const PARALYSIS_DURATION = 10;
  const DAMAGE_CATEGORIES = Object.freeze({
    NORMAL: "normal",
    MELEE: "melee",
    RANGED: "ranged",
    SPECIAL: "special"
  });
  const LOW_POWER_DEVICE = (navigator.hardwareConcurrency || 8) <= 4
    || (navigator.deviceMemory || 8) <= 4
    || window.matchMedia("(max-width: 760px)").matches;
  const PARTICLE_LIMIT = LOW_POWER_DEVICE ? 300 : 620;
  const EFFECT_LIMIT = LOW_POWER_DEVICE ? 90 : 160;
  const FLOATING_TEXT_LIMIT = LOW_POWER_DEVICE ? 36 : 72;
  const HUD_REFRESH_INTERVAL = 33;

  const FIGHTERS = [
    {
      id: "kakarot-test",
      voiceOrder: 1,
      name: "卡卡罗团子",
      element: "雷 · 共鸣型",
      tagline: "银发雷光，越战越凶。",
      color: "#a88dff",
      dark: "#494078",
      symbol: "雷",
      image: "assets/kakarot.png",
      weaponImage: "assets/kakarot-weapon.png",
      hp: 1000,
      power: 1,
      speed: 8,
      radius: 27,
      stats: { power: 100, speed: 100, hp: 100 },
      display: { attack: "30", speed: "8.0格/s", hp: "1000" },
      attackType: "melee",
      attackDamage: 30,
      attackCooldown: 2,
      attackRange: 2.5,
      ultimateType: "autoThreshold",
      ultimateThreshold: 600,
      ultimateDuration: 6,
      ultimateCooldown: 18,
      deathSentenceDamage: 150,
      deathSentenceDelay: 2,
      overclockDamage: 30,
      overclockRange: 4,
      ability: "低血共鸣",
      abilityIcon: "ϟ",
      abilityDesc: "生命低于 600 且冷却就绪时自动开启 6 秒；移速与死告能量获取翻倍，横扫范围扩大至直径 8 格。",
      cooldown: 18
    },
    {
      id: "anko-test",
      voiceOrder: 2,
      name: "安可团子",
      element: "火 · 召唤型",
      tagline: "白咩常伴，低血生角。",
      color: "#ff9fc8",
      dark: "#9b4567",
      symbol: "羊",
      image: "assets/anko.png",
      altImage: "assets/anko-horned.png",
      hp: 1000,
      power: 1,
      speed: 5,
      radius: 27,
      stats: { power: 38, speed: 100, hp: 100 },
      display: { attack: "召唤", speed: "5.0格/s", hp: "1000" },
      attackType: "summoner",
      attackDamage: 0,
      attackCooldown: 5,
      summonType: "whiteSheep",
      summonInterval: 3,
      fireballBlastRadius: 5,
      fireCraterRadius: 5,
      ability: "羊角觉醒",
      abilityIcon: "♈",
      abilityDesc: "生命低于 400 时自动长出羊角；敌人进入半径 2 格后召唤黑咩，前摇 0.3 秒，对半径 4 格内所有敌人造成 230 点伤害，冷却 1 秒。",
      transformThreshold: 400,
      hornedDamage: 230,
      hornedSeekRange: 2,
      hornedHitRange: 4,
      hornedCooldown: 1,
      blackSlamWindup: 0.3,
      cooldown: 0
    },
    {
      id: "01",
      voiceOrder: 3,
      name: "漂泊者团子",
      element: "衍射 · 时序型",
      tagline: "一刃刺穿时间。",
      color: "#ffd66b",
      dark: "#7e632d",
      symbol: "析",
      image: "assets/wanderer.png",
      femaleImage: "assets/wanderer-female.png",
      weaponImage: "assets/wanderer-weapon.png",
      knifeImage: "assets/wanderer-knife.png",
      hp: 1000,
      power: 1,
      speed: 8,
      radius: 27,
      stats: { power: 84, speed: 100, hp: 100 },
      display: { attack: "30", speed: "8.0格/s", hp: "1000" },
      attackType: "thrust",
      attackDamage: 30,
      attackCooldown: 1,
      attackRange: 2,
      knifeOrbitRadius: 3,
      knifeDamage: 25,
      ultimateType: "timeStop",
      ultimateDuration: 5,
      ultimateCooldown: 15,
      ability: "时序停界",
      abilityIcon: "◷",
      abilityDesc: "共鸣能量满后冻结全图时间 5 秒，期间只有漂泊者可以移动与攻击；冷却 15 秒。",
      cooldown: 15
    },
    {
      id: "02",
      voiceOrder: 4,
      name: "漂泊者（湮灭）",
      element: "暗 · 双形态",
      tagline: "暗涌苏醒，万律俱灭。",
      color: "#a868ff",
      dark: "#3d2258",
      symbol: "湮",
      image: "assets/wanderer.png",
      altImage: "assets/wanderer-abyss-form.png",
      femaleImage: "assets/wanderer-female.png",
      femaleAltImage: "assets/wanderer-abyss-female.png",
      weaponImage: "assets/wanderer-weapon.png",
      hp: 1200,
      power: 1,
      speed: 8,
      radius: 27,
      stats: { power: 88, speed: 100, hp: 100 },
      display: { attack: "30", speed: "8.0格/s", hp: "1200" },
      attackType: "thrust",
      attackDamage: 30,
      attackCooldown: 1,
      attackRange: 2,
      ultimateType: "abyssBurst",
      ultimateDamage: 300,
      ultimateSeekRadius: 5,
      ultimateBlastRadius: 5,
      ultimateHealRatio: 0.5,
      ability: "湮灭万律",
      abilityIcon: "☾",
      abilityDesc: "恐怖镰刀人形态下、共鸣能量满且敌人在半径 5 格内时触发；以该敌人为中心引爆半径 5 格的暗能量，造成 300 点伤害并恢复 50 点暗涌。冷却 15 秒。",
      cooldown: 15,
      abyssThreshold: 100,
      abyssScytheDamage: 50,
      abyssScytheRange: 3,
      abyssScytheCooldown: 1,
      abyssFormSpeed: 10,
      abyssDrainPerSecond: 10,
      abyssLifeDrainPerSecond: 50,
      abyssHitHealRatio: 0.5
    },
    {
      id: "03",
      voiceOrder: 5,
      name: "鉴心团子",
      element: "风 · 守御型",
      tagline: "风障护心，引敌入渊。",
      color: "#9bdc82",
      dark: "#315b3a",
      symbol: "风",
      image: "assets/jianxin.png",
      hp: 1200,
      power: 1,
      speed: 5,
      radius: 27,
      stats: { power: 42, speed: 63, hp: 100 },
      display: { attack: "无普攻", speed: "5.0格/s", hp: "1200" },
      attackType: "none",
      attackDamage: 0,
      attackCooldown: 0,
      attackRange: 0,
      startingShield: 0,
      alternateShield: 300,
      skillCooldown: 8,
      windFieldRadius: 8,
      windFieldDuration: 5,
      windFieldPullSpeed: 6,
      windFieldDamage: 50,
      windFieldShield: 50,
      ultimateType: "windCharge",
      ultimateCooldown: 30,
      chargeDuration: 3,
      ultimateShieldCost: 150,
      ultimateShieldGain: 300,
      windWaveRadius: 8,
      windWaveSpeed: 15,
      windWaveStun: 1,
      ability: "涤罪心渊",
      abilityIcon: "风",
      abilityDesc: "蓄力 3 秒后释放以 15 格/秒移动、半径 8 格的穿透风波；生命高于 300 且拥有护盾时，消耗 150 生命并增加 300 护盾，随后清空全部护盾并按其当前盾量转化为伤害，否则获得 300 点护盾。冷却 30 秒。",
      cooldown: 30
    },
    {
      id: "06",
      voiceOrder: 6,
      name: "维里奈团子",
      element: "光 · 生长型",
      tagline: "嫩芽生光，藤蔓护场。",
      color: "#d7e76d",
      dark: "#4e6b38",
      symbol: "芽",
      image: "assets/verina-centered.png",
      hp: 500,
      power: 1,
      speed: 5,
      radius: 27,
      stats: { power: 30, speed: 63, hp: 42 },
      display: { attack: "无普攻", speed: "5.0格/s", hp: "500" },
      attackType: "none",
      attackDamage: 0,
      attackCooldown: 0,
      attackRange: 0,
      skillCooldown: 10,
      verinaFieldRadius: 2,
      verinaTickInterval: 0.05,
      verinaHealPerTick: 1,
      verinaDamagePerTick: 1,
      verinaSproutsForVine: 6,
      vineSlowMultiplier: 0.5,
      vineTickInterval: 0.05,
      vineDamageDivisor: 100,
      ultimateType: "verinaBloom",
      ultimateCooldown: 10,
      verinaUltimateEnemyHeal: 300,
      verinaUltimateMaxHpGain: 500,
      ability: "生命庭院",
      abilityIcon: "❧",
      abilityDesc: "场上存在藤时解锁；为所有敌人恢复 300 生命，并为自身增加 500 最大生命。冷却 10 秒。",
      cooldown: 10
    },
    {
      id: "04",
      voiceOrder: 7,
      name: "布兰特团子",
      element: "火 · 航海型",
      tagline: "宝箱、船锚与火药。",
      color: "#c481ad",
      dark: "#40233f",
      symbol: "锚",
      image: "assets/brant.png",
      weaponImage: "assets/brant-sword.png",
      rangedWeaponImage: "assets/brant-gun.png",
      hp: 880,
      power: 1,
      speed: 10,
      radius: 27,
      stats: { power: 86, speed: 100, hp: 100 },
      display: { attack: "剑50 / 枪25", speed: "10.0格/s", hp: "880" },
      attackType: "hybrid",
      meleeAttackDamage: 50,
      rangedAttackDamage: 25,
      meleeAttackCooldown: 1.5,
      rangedAttackCooldown: 2,
      attackRange: 3,
      projectileSpeed: 12,
      ultimateType: "brantOverdrive",
      ultimateDuration: 6,
      ultimateCooldown: 15,
      brantChestInterval: 10,
      brantChestDuration: 30,
      brantChestLimit: 3,
      brantTreasureSpeedMultiplier: 4,
      brantPickupShield: 55,
      brantSpecialMax: 100,
      brantHitEnergy: 5,
      brantPickupEnergy: 25,
      brantAnchorEnergy: 50,
      brantAirborneDuration: 8,
      brantAirborneDodgeChance: 0.25,
      brantAnchorDamage: 180,
      brantAnchorWindup: 0.4,
      brantSmallRadiusX: 5.5,
      brantSmallRadiusY: 3.5,
      brantBigRadiusX: 7.15,
      brantBigRadiusY: 4.45,
      ability: "船长狂想",
      abilityIcon: "⚓",
      abilityDesc: "共鸣能量满后获得 6 秒双倍移速，宝箱生成速度提升至 400%；冷却 15 秒。",
      cooldown: 15
    },
    {
      id: "05",
      voiceOrder: 8,
      name: "坎特蕾拉团子",
      element: "暗 · 蜃境型",
      tagline: "伞落成梦，水母织境。",
      color: "#b18cff",
      dark: "#3b2868",
      symbol: "蜃",
      image: "assets/cantarella.png",
      weaponImage: "assets/cantarella-umbrella.png",
      hp: 660,
      power: 1,
      speed: 3,
      radius: 27,
      stats: { power: 56, speed: 38, hp: 66 },
      display: { attack: "伞击 6×10", speed: "3.0格/s", hp: "660" },
      attackType: "cantarellaUmbrella",
      attackDamage: 10,
      attackCooldown: 4,
      attackRange: 4,
      umbrellaHits: 6,
      umbrellaSpeed: 2,
      umbrellaDistance: 15,
      jellyHp: 30,
      jellySpeed: 5,
      jellyRadius: 11,
      jellyAttackDamage: 20,
      jellyAttackRange: 2,
      jellyAttackCooldown: 2,
      jellyHealOnDeath: 10,
      jellySpawnInterval: 2,
      jellyStartingCount: 3,
      jellyDeathsToUnlock: 3,
      ultimateType: "cantarellaMirage",
      ultimateDuration: 8,
      ultimateCooldown: 18,
      mirageSlowMultiplier: 0.2,
      mirageBonusDamage: 150,
      ability: "蜃境迷梦",
      abilityIcon: "梦",
      abilityDesc: "累计死亡 3 只水母后解锁。开启 8 秒蜃境：所有单位移速降至 20%，敌方获得迷梦；迷梦单位首次受击追加 150 伤害并解除迷梦与减速。若蜃境期间未造成伤害，结束时追加 150 点伤害。冷却 18 秒。",
      cooldown: 18
    }
  ];

  const VOICE_LIBRARY = {
    "kakarot-test": {
      intro: ["assets/voices/kakarot/intro.mp3"],
      attack: ["assets/voices/kakarot/attack-1.mp3", "assets/voices/kakarot/attack-2.mp3"],
      ultimate: ["assets/voices/kakarot/ultimate.mp3"],
      deathSentence: ["assets/voices/kakarot/death-sentence.mp3"],
      death: ["assets/voices/kakarot/death.mp3"],
      victory: ["assets/voices/kakarot/victory.mp3"]
    },
    "anko-test": {
      intro: [
        "assets/voices/anko/intro-1.mp3",
        "assets/voices/anko/intro-2.mp3",
        "assets/voices/anko/intro-3.mp3"
      ],
      ultimate: [
        "assets/voices/anko/ultimate-1.mp3",
        "assets/voices/anko/ultimate-2.mp3"
      ],
      whiteSheepAttack: [
        "assets/voices/anko/white-attack-1.mp3",
        "assets/voices/anko/white-attack-2.mp3"
      ],
      blackSheepAttack: [
        "assets/voices/anko/black-attack-1.mp3",
        "assets/voices/anko/black-attack-2.mp3"
      ],
      death: ["assets/voices/anko/death.mp3"],
      victory: ["assets/voices/anko/victory.mp3"]
    }
  };

  const FIGHTER_DETAILS = {
    "kakarot-test": {
      role: "近战爆发 / 低血强化",
      range: "直径 5 格，共鸣解放时直径 8 格",
      interval: "2 秒",
      mechanics: [
        "普攻为 360° 弧形横扫，使用专属乐器武器，造成 30 点伤害。",
        "普攻命中积累 1 格死告能量；共鸣解放期间积累 2 格。",
        "死告能量满 3 格后倒计时 2 秒，瞬身至敌人附近并造成 150 点特殊伤害。",
        "生命低于 600 且冷却就绪时自动开启 6 秒共鸣解放。",
        "共鸣解放期间移速从 8 格/秒提升至 16 格/秒，能量获取效率翻倍，期间横扫伤害属于特殊伤害。",
        "共鸣解放冷却为 18 秒；结束后生命仍低于 600 会再次自动开启。"
      ]
    },
    "anko-test": {
      role: "火属性召唤 / 低血近战",
      range: "白咩爆炸半径 5 格；黑咩索敌半径 2 格 / 命中半径 4 格",
      interval: "白咩 5 秒 / 黑咩 2 秒",
      mechanics: [
        "安可自身不进行普通攻击，但仍会受到和造成碰撞伤害。",
        "白咩是独立单位，不可被索敌，拥有自己的位置、移动和攻击计时。",
        "白咩每 3 秒发射火球，命中或触边后造成 30 点伤害，并在半径 5 格的圆形范围爆炸。",
        "爆炸留下半径 5 格的圆形爆炎弹坑，持续 4 秒，每 0.5 秒造成 10 点伤害。",
        "安可生命低于 400 时永久切换为羊角形态。",
        "羊角形态下，敌人进入半径 2 格索敌范围后召唤黑咩；前摇 0.3 秒，可移动躲避。",
        "黑咩砸地会对半径 4 格内的所有敌人造成 230 点伤害，冷却 1 秒。",
        "白咩火球、爆炎弹坑与黑咩砸击均属于特殊伤害。"
      ]
    },
    "01": {
      role: "近战突刺 / 全图时停",
      range: "突刺半径 2 格；飞刀伤害半径 5 格",
      interval: "1 秒",
      mechanics: [
        "前刺造成 30 点伤害，近战命中恢复 20% 共鸣能量。",
        "普攻命中积累 1 格时序能量。",
        "首次达到 1 格时永久召唤一柄飞刀，3 秒环绕一圈，伤害不增加时序能量。",
        "此后每轮时序能量首次达到第 1 格时，都会额外增加一柄永久飞刀；第 2、3 格不会增加飞刀。飞刀沿半径 3 格轨道均匀环绕。",
        "飞刀经过敌人时造成 25 点特殊伤害。",
        "达到 2 格时释放时序之力，自身移动与攻击速度提高 30%，对手降低 30%，持续 5 秒。",
        "达到 3 格时清空能量，并在随机位置生成一个直径 7 格、持续 15 秒的时间乱流。",
        "其他团子进入时间乱流后停止行动，直到乱流结束或受到一次漂泊者攻击。",
        "场上最多同时存在 3 个时间乱流。",
        "共鸣能量满后可释放时序停界，冻结全图 5 秒；期间只有漂泊者可以移动与攻击。",
        "时序停界冷却 15 秒。"
      ]
    },
    "02": {
      role: "近战突刺 / 双形态爆发",
      range: "突刺半径 2 格；镰刀横扫半径 3 格",
      interval: "常态 1 秒 / 镰刀形态 1 秒",
      mechanics: [
        "普通前刺造成 30 点伤害；普通形态受到敌方攻击时增加 20 暗涌。",
        "暗涌达到 100 后自动进入恐怖镰刀人形态。",
        "镰刀形态移速提升至 10 格/秒。",
        "镰刀横扫半径 3 格，造成 50 点伤害，冷却 1 秒。",
        "镰刀形态每秒消耗 10 暗涌；生命高于 200 时每秒额外损失 50 生命，生命降至 200 或以下后停止扣血。",
        "触碰地图边缘后自动追踪敌人，命中一次后恢复原来的直线移动方向。",
        "形态内造成伤害时恢复伤害量 50% 的生命值，大招伤害同样生效。",
        "共鸣能量满且处于镰刀形态时，索敌最近敌人；敌人进入半径 5 格后自动释放湮灭万律。",
        "湮灭万律以该敌人为中心造成半径 5 格的 300 点特殊伤害，自身不会位移。",
        "释放后固定恢复 50 暗涌；冷却 15 秒。"
      ]
    },
    "03": {
      role: "风属性肉盾 / 牵引控场",
      range: "风场半径 8 格；风波半径 8 格",
      interval: "风场 8 秒 / 共鸣解放 30 秒",
      mechanics: [
        "生命 1200，开局没有护盾；后续获得的护盾优先吸收伤害，破碎后淡绿色风屏障消失。",
        "自身不进行普通攻击，但碰撞仍然会造成和承受 20 点伤害。",
        "每 8 秒在脚下生成半径 8 格的圆形风场，持续 5 秒。",
        "风场以 6 格/秒牵引敌人向中心移动，敌人可用自身移速向外对抗。",
        "风场结束时爆炸，对仍处于范围内的敌人造成 50 点特殊伤害。",
        "爆炸时若鉴心仍站在自己的风场内，获得 50 点护盾。",
        "共鸣解放需要原地蓄力 3 秒，期间不能移动，但仍会正常受到伤害。",
        "生命高于 300 且拥有护盾时：消耗 150 生命并增加 300 护盾，随后清空全部护盾。",
        "清空护盾后向最近敌人发出可穿透、半径 8 格、速度 15 格/秒的弧形风波。",
        "风波造成等同于实际清空护盾值的特殊伤害，并将命中敌人沿风波方向击退到墙边，眩晕 1 秒。",
        "不满足护盾与生命条件时：不消耗生命，蓄力结束后获得 300 点护盾。",
        "共鸣解放冷却固定为 30 秒。"
      ]
    },
    "06": {
      role: "光属性场地养成 / 生命控制",
      range: "芽半径 2 格；藤作用于全场",
      interval: "种芽 10 秒 / 共鸣解放 10 秒",
      mechanics: [
        "生命 500、移动速度 5 格/秒，自身没有普通攻击。",
        "登场时在场地正中央种下第一颗芽，此后每 10 秒在自身脚下种下一颗芽。",
        "芽没有实体、不可被索敌，也不会移动。",
        "每颗芽以自身为中心形成半径 2 格领域：维里奈处于范围内时每 0.05 秒恢复 1 生命。",
        "敌人处于芽的半径 2 格范围内时，每 0.05 秒受到 1 点特殊伤害。",
        "场上芽的数量达到 6 颗时，正中央的芽生长为藤。",
        "藤会使全场敌人移动速度降低 50%，并每 0.05 秒造成相当于维里奈最大生命值 1/100 的特殊伤害。",
        "生命庭院需要场上存在藤才能释放；为所有敌人恢复 300 生命，自身最大生命增加 500。",
        "生命庭院冷却 10 秒。"
      ]
    },
    "04": {
      role: "近战远程双武器 / 宝箱船锚",
      range: "剑半径 3 格；枪全图锁定",
      interval: "近战 1.5 秒 / 远程 2 秒 / 共鸣解放 15 秒",
      mechanics: [
        "生命 880、移动速度 10 格/秒；敌人进入半径 3 格内使用剑前刺，否则使用全图锁定手枪。",
        "近战伤害 50、冷却 1.5 秒；远程伤害 25、冷却 2 秒，弹速 12 格/秒。",
        "近战时隐藏手枪，远程时隐藏剑。",
        "每 10 秒在场地随机位置生成宝箱，存在 30 秒，场上最多同时存在 3 个；宝箱拾取范围为半径 1 格。",
        "拾取宝箱获得 55 护盾和 25 点船锚能量，并在宝箱位置召唤船锚，前摇 0.4 秒后造成 180 点椭圆范围特殊伤害，覆盖面积约 60 格。",
        "普通攻击命中获得 5 点船锚能量；小宝箱船锚命中获得 50 点，大船锚不会增加能量。",
        "船锚能量达到 100 后消耗并登上绳索，持续 8 秒；期间受到任何伤害时有 25% 概率完全闪避，仍可攻击。",
        "空中状态结束时瞬移到地图中心并保持定身，大船锚落地后恢复移动。",
        "大船锚造成 180 点椭圆范围特殊伤害，不增加船锚能量，覆盖面积约 100 格。",
        "共鸣解放持续 6 秒，移速翻倍，宝箱生成速度提升至 400%；冷却 15 秒。"
      ]
    },
    "05": {
      role: "召唤控场 / 蜃境减速",
      range: "雨伞索敌半径 4 格；水母近战半径 2 格",
      interval: "雨伞 4 秒 / 水母 2 秒 / 共鸣解放 18 秒",
      mechanics: [
        "生命 660、移动速度 3 格/秒。",
        "敌人或可索敌召唤物进入半径 4 格后，坎特蕾拉沿攻击方向丢出雨伞。",
        "雨伞以 2 格/秒直线飞行约 15 格，对每个接触目标最多造成 6 段、每段 10 点伤害并沿飞行方向击退。",
        "雨伞可以拦截敌方远程子弹，雨伞攻击冷却 4 秒。",
        "登场时在身边召唤 3 只水母，此后每 2 秒召唤 1 只。",
        "水母生命 30、移速 5 格/秒，具有碰撞体积且可被索敌，会自动追踪最近敌人。",
        "水母以半径 2 格进行半圆近战攻击，每次造成 20 点伤害，冷却 2 秒。",
        "每只水母死亡时为坎特蕾拉恢复 10 点生命，并累计蜃境解锁进度。",
        "累计死亡 3 只水母后解锁蜃境迷梦；共鸣能量满时可以释放。",
        "蜃境持续 8 秒，使场上所有单位移速降至 20%，敌方单位获得迷梦。",
        "迷梦单位首次受击追加 150 点伤害，并立即解除迷梦与蜃境减速。",
        "若蜃境持续期间没有对敌方造成伤害，结束时对仍存活的敌方单位追加 150 点特殊伤害；冷却 18 秒。"
      ]
    }
  };

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const arenaLayer = document.createElement("canvas");
  const arenaLayerCtx = arenaLayer.getContext("2d");
  const dom = {
    rosterGrid: document.getElementById("rosterGrid"),
    rosterCount: document.getElementById("rosterCount"),
    mapSelect: document.getElementById("mapSelect"),
    multiHint: document.getElementById("multiHint"),
    multiCount: document.getElementById("multiCount"),
    multiBoard: document.getElementById("multiBoard"),
    matchHead: document.querySelector(".match-head"),
    configSidePanel: document.querySelector(".config-side"),
    playerName: document.getElementById("playerName"),
    enemyName: document.getElementById("enemyName"),
    playerHpBar: document.getElementById("playerHpBar"),
    enemyHpBar: document.getElementById("enemyHpBar"),
    playerHpText: document.getElementById("playerHpText"),
    enemyHpText: document.getElementById("enemyHpText"),
    playerShield: document.getElementById("playerShield"),
    enemyShield: document.getElementById("enemyShield"),
    playerShieldBar: document.getElementById("playerShieldBar"),
    enemyShieldBar: document.getElementById("enemyShieldBar"),
    playerShieldText: document.getElementById("playerShieldText"),
    enemyShieldText: document.getElementById("enemyShieldText"),
    playerScore: document.getElementById("playerScore"),
    enemyScore: document.getElementById("enemyScore"),
    roundLabel: document.getElementById("roundLabel"),
    matchState: document.getElementById("matchState"),
    timerText: document.getElementById("timerText"),
    timerOrb: document.querySelector(".timer-orb"),
    itemToggle: document.getElementById("itemToggle"),
    itemSwitchText: document.getElementById("itemSwitchText"),
    poolItems: document.getElementById("poolItems"),
    slowButton: document.getElementById("slowButton"),
    fastButton: document.getElementById("fastButton"),
    pauseButton: document.getElementById("pauseButton"),
    pauseOverlay: document.getElementById("pauseOverlay"),
    pauseResumeButton: document.getElementById("pauseResumeButton"),
    gameSpeedText: document.getElementById("gameSpeedText"),
    gameOverlay: document.getElementById("gameOverlay"),
    overlayEyebrow: document.getElementById("overlayEyebrow"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayCopy: document.getElementById("overlayCopy"),
    overlayButton: document.getElementById("overlayButton"),
    overlayHint: document.getElementById("overlayHint"),
    fightButton: document.getElementById("fightButton"),
    restartButton: document.getElementById("restartButton"),
    countdown: document.getElementById("countdown"),
    announcement: document.getElementById("announcement"),
    comboBadge: document.getElementById("comboBadge"),
    comboValue: document.getElementById("comboValue"),
    battleStatus: document.getElementById("battleStatus"),
    statusDot: document.getElementById("statusDot"),
    playerEnergyBar: document.getElementById("playerEnergyBar"),
    enemyEnergyBar: document.getElementById("enemyEnergyBar"),
    playerEnergyText: document.getElementById("playerEnergyText"),
    enemyEnergyText: document.getElementById("enemyEnergyText"),
    playerSpecialGauge: document.getElementById("playerSpecialGauge"),
    enemySpecialGauge: document.getElementById("enemySpecialGauge"),
    playerSpecialLabel: document.getElementById("playerSpecialLabel"),
    enemySpecialLabel: document.getElementById("enemySpecialLabel"),
    playerSpecialText: document.getElementById("playerSpecialText"),
    enemySpecialText: document.getElementById("enemySpecialText"),
    playerAbyssGauge: document.getElementById("playerAbyssGauge"),
    enemyAbyssGauge: document.getElementById("enemyAbyssGauge"),
    playerAbyssText: document.getElementById("playerAbyssText"),
    enemyAbyssText: document.getElementById("enemyAbyssText"),
    playerBrantGauge: document.getElementById("playerBrantGauge"),
    enemyBrantGauge: document.getElementById("enemyBrantGauge"),
    playerBrantText: document.getElementById("playerBrantText"),
    enemyBrantText: document.getElementById("enemyBrantText"),
    abilityButton: document.getElementById("abilityButton"),
    abilityKey: document.getElementById("abilityKey"),
    abilityLabel: document.getElementById("abilityLabel"),
    durationInput: document.getElementById("durationInput"),
    footerSettings: document.getElementById("footerSettings"),
    soundButton: document.getElementById("soundButton"),
    shuffleButton: document.getElementById("shuffleButton"),
    archiveButton: document.getElementById("archiveButton"),
    fighterArchive: document.getElementById("fighterArchive"),
    archiveClose: document.getElementById("archiveClose"),
    archiveList: document.getElementById("archiveList"),
    archiveDetail: document.getElementById("archiveDetail"),
    chosenFighter: document.getElementById("chosenFighter"),
    chosenOrb: document.getElementById("chosenOrb"),
    chosenElement: document.getElementById("chosenElement"),
    chosenName: document.getElementById("chosenName"),
    chosenTagline: document.getElementById("chosenTagline"),
    powerStat: document.getElementById("powerStat"),
    speedStat: document.getElementById("speedStat"),
    hpStat: document.getElementById("hpStat"),
    powerValue: document.getElementById("powerValue"),
    speedValue: document.getElementById("speedValue"),
    hpValue: document.getElementById("hpValue"),
    skillGlyph: document.getElementById("skillGlyph"),
    skillName: document.getElementById("skillName"),
    skillDesc: document.getElementById("skillDesc"),
    enemyDot: document.getElementById("enemyDot"),
    enemyPreviewName: document.getElementById("enemyPreviewName"),
    enemyPreviewTag: document.getElementById("enemyPreviewTag"),
    battleLog: document.getElementById("battleLog"),
    liveBadge: document.getElementById("liveBadge"),
    playerMini: document.getElementById("playerMini"),
    enemyMini: document.getElementById("enemyMini"),
    controlCopy: document.getElementById("controlCopy"),
    keyGuide: document.getElementById("keyGuide"),
    touchPad: document.getElementById("touchPad"),
    screenReaderStatus: document.getElementById("screenReaderStatus")
  };

  let selectedId = "kakarot-test";
  let enemyId = "anko-test";
  let configSide = "left";
  let archiveSelectedId = "kakarot-test";
  let wandererForms = { "01": "male", "02": "male" };
  try {
    const savedForms = JSON.parse(localStorage.getItem("solaris-wanderer-forms") || "null");
    if (savedForms?.["01"] === "female" || savedForms?.["01"] === "male") wandererForms["01"] = savedForms["01"];
    if (savedForms?.["02"] === "female" || savedForms?.["02"] === "male") wandererForms["02"] = savedForms["02"];
  } catch {
    // Local file privacy modes can disable storage; defaults still apply.
  }
  let mode = "watch";
  let state = "idle";
  let player = null;
  let enemy = null;
  let multiFighters = [];
  let multiIds = ["kakarot-test", "anko-test", "01", "02", "03", "06", "04", "05"];
  let score = [0, 0];
  let round = 1;
  let roundSeconds = DEFAULT_ROUND_SECONDS;
  let battleTimer = DEFAULT_ROUND_SECONDS;
  let countdownClock = 0;
  let countdownBeat = 4;
  let roundEndTimer = 0;
  let pickupTimer = 3;
  let ambientTimer = 0;
  let lastFrame = performance.now();
  let visualTime = 0;
  let soundEnabled = true;
  let arenaItemsEnabled = true;
  let gameSpeedIndex = 3;
  let gameSpeed = 1;
  let manualPaused = false;
  let audioContext = null;
  let screenShake = 0;
  let collisionLock = 0;
  let timeStopOwner = null;
  let timeStopTimer = 0;
  let announcementTimer = 0;
  let combo = { side: -1, count: 0, timer: 0 };
  let particles = [];
  let effects = [];
  let projectiles = [];
  let craters = [];
  let blackSlams = [];
  let summonUnits = [];
  let timeVortices = [];
  let vortexSequence = 0;
  let windFields = [];
  let windWaves = [];
  let windSequence = 0;
  let verinaPlants = [];
  let verinaPlantSequence = 0;
  let brantChests = [];
  let brantAnchors = [];
  let brantSequence = 0;
  let cantarellaJellies = [];
  let cantarellaUmbrellas = [];
  let cantarellaSequence = 0;
  let pickups = [];
  let floatingTexts = [];
  const voiceJobs = [];
  let activeVoiceJob = null;
  let activeVoiceEntry = null;
  let activeVoiceAudio = null;
  let activeAttackVoice = null;
  let voicePauseActive = false;
  let voiceFocusFighter = null;
  let voiceCameraMix = 0;
  let voiceEntryStartedAt = 0;
  let roundResultVoicePending = false;
  let multiResultVoicePending = false;
  let lastRoundFinishReason = "KO";
  let lastHudRefreshAt = -Infinity;
  const GAME_SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
  const keys = Object.create(null);
  const touchDirection = { up: false, down: false, left: false, right: false };
  const fighterPortraits = new Map();
  const summonPortraits = new Map();
  const weaponPortraits = new Map();
  const knifePortraits = new Map();

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function templateById(id) {
    const fighter = FIGHTERS.find((item) => item.id === id) || FIGHTERS[0];
    if (fighter.id !== "01" && fighter.id !== "02") return fighter;
    const gender = wandererForms[fighter.id] || "male";
    const female = gender === "female";
    return {
      ...fighter,
      image: female ? fighter.femaleImage : fighter.image,
      altImage: female ? (fighter.femaleAltImage || fighter.femaleImage) : fighter.altImage,
      portraitKey: `${fighter.id}:${gender}`,
      altPortraitKey: `${fighter.id}:${gender}:alt`,
      formGender: gender
    };
  }
  const voiceOrderOf = (fighter) => Number(fighter?.template?.voiceOrder ?? fighter?.voiceOrder ?? Number.MAX_SAFE_INTEGER);
  const sortFightersByVoiceOrder = (fighters) => [...fighters].sort((a, b) => voiceOrderOf(a) - voiceOrderOf(b));
  const formatNumber = (value) => Math.max(0, Math.round(value)).toLocaleString("zh-CN");
  const getConfigId = () => mode === "multi" || configSide === "left" ? selectedId : enemyId;
  const getActiveFighters = () => mode === "multi" ? multiFighters : [player, enemy].filter(Boolean);
  const getDamageableUnits = () => [
    ...getActiveFighters(),
    ...cantarellaJellies.filter((unit) => unit.owner?.hp > 0 && unit.hp > 0)
  ];

  function nearestOpponent(fighter) {
    const candidates = getDamageableUnits().filter((candidate) => (
      candidate !== fighter
      && candidate.hp > 0
      && candidate.side !== fighter.side
    ));
    candidates.sort((a, b) => distance(fighter, a) - distance(fighter, b));
    return candidates[0] || null;
  }

  function seededEnemyOptions() {
    return FIGHTERS.filter((fighter) => fighter.id !== selectedId);
  }

  function makeFighter(template, side, overrides = {}) {
    const spawnLeft = side === 0;
    const angle = random(0, Math.PI * 2);
    const moveSpeed = template.speed * CELL_SIZE;
    const spawnInset = Math.min(5.5, MAP_SIZE * 0.22);
    return {
      template,
      side,
      x: BOUNDARY + CELL_SIZE * (spawnLeft ? spawnInset : MAP_SIZE - spawnInset),
      y: BOUNDARY + CELL_SIZE * (spawnLeft ? MAP_SIZE - spawnInset : spawnInset),
      vx: Math.cos(angle) * moveSpeed,
      vy: Math.sin(angle) * moveSpeed,
      moveSpeed,
      r: template.radius,
      hp: template.hp,
      maxHp: template.hp,
      energy: 0,
      specialEnergy: 0,
      deathSentenceClock: 0,
      fullEnergyTime: 0,
      abilityCooldown: 1.6,
      ultimateCooldown: 0,
      attackClock: random(0.55, 1.35),
      flash: 0,
      freeze: 0,
      burn: 0,
      burnTick: 0,
      shield: template.startingShield || 0,
      maxShield: Math.max(template.startingShield || 0, template.alternateShield || 0, 1),
      skillClock: template.skillCooldown || 0,
      verinaSlowTimer: 0,
      brantSpecialEnergy: 0,
      brantUltimateTimer: 0,
      brantAirborneTimer: 0,
      brantBigAnchorLock: false,
      brantBigAnchorResumeX: 0,
      brantBigAnchorResumeY: 0,
      brantChestClock: template.brantChestInterval || 0,
      brantMeleeMode: false,
      brantAimAngle: 0,
      cantarellaJellySpawnClock: template.jellySpawnInterval || 0,
      cantarellaJellyDeaths: 0,
      cantarellaMirageTimer: 0,
      cantarellaMirageDamageDealt: false,
      cantarellaSlowTimer: 0,
      cantarellaDreamed: false,
      voiceUltimatePending: false,
      voiceDeathSentencePending: false,
      deathVoicePlayed: false,
      charge: null,
      knockback: null,
      frenzy: 0,
      overclock: 0,
      paralyzed: 0,
      paralyzeTick: 0,
      stunned: 0,
      tilt: 0,
      blink: 0,
      weaponSwing: 0,
      weaponSwingMax: 0.42,
      thrustTime: 0,
      thrustAngle: 0,
      knifeCount: 0,
      knifeAngle: 0,
      knifeHitLocks: [],
      timeForceTimer: 0,
      timeSlowTimer: 0,
      abyssForm: false,
      abyssEnergy: 0,
      abyssLifeClock: 1,
      abyssHoming: false,
      abyssSavedVx: 0,
      abyssSavedVy: 0,
      abyssScytheSwing: 0,
      vortexLockTimer: 0,
      vortexLockId: null,
      vortexImmunity: new Map(),
      trail: [],
      trailClock: 0,
      aiClock: 0,
      aiOffset: random(-1.6, 1.6),
      lastImpact: 0,
      frozenFlash: 0,
      dash: 0,
      inContact: false,
      contactTime: 0,
      contactFxClock: 0,
      horned: false,
      ...overrides
    };
  }

  function preparePreview() {
    const chosen = templateById(selectedId);
    const rival = templateById(enemyId);
    player = makeFighter(chosen, 0, {
      x: 228,
      y: 430,
      vx: 0,
      vy: 0
    });
    enemy = makeFighter(rival, 1, {
      x: ARENA_SIZE - 228,
      y: 290,
      vx: 0,
      vy: 0
    });
    updateHud();
  }

  function createRoster() {
    FIGHTERS.forEach((fighter) => {
      const visual = templateById(fighter.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `fighter-card${fighter.placeholder ? " is-placeholder" : ""}${visual.image ? " has-portrait" : ""}`;
      button.dataset.fighterId = fighter.id;
      button.dataset.voiceOrder = String(fighter.voiceOrder);
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(fighter.id === getConfigId()));
      button.style.setProperty("--ball-color", fighter.color);
      if (visual.image) button.style.setProperty("--portrait", `url("${visual.image}")`);
      button.innerHTML = `
        <span class="card-orb${visual.image ? " has-image" : ""}" aria-hidden="true">
          ${visual.image
            ? `<img class="card-portrait" src="${visual.image}" alt="">`
            : `<span>${fighter.symbol}</span>`}
        </span>
        <strong>${fighter.name}</strong>
        <small>${fighter.element.split(" · ")[1] || fighter.element}</small>
      `;
      button.addEventListener("click", () => selectFighter(fighter.id));
      dom.rosterGrid.appendChild(button);
    });
    dom.rosterCount.textContent = String(FIGHTERS.length).padStart(2, "0");
  }

  function syncWandererFormState() {
    const locked = state !== "idle" && state !== "matchEnd";
    document.querySelectorAll("[data-wanderer-form]").forEach((button) => {
      const fighterId = button.dataset.wandererForm;
      const active = wandererForms[fighterId] === button.dataset.gender;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.disabled = locked;
    });
    ["01", "02"].forEach((fighterId) => {
      const fighter = templateById(fighterId);
      const card = dom.rosterGrid.querySelector(`[data-fighter-id="${fighterId}"]`);
      if (!card) return;
      card.style.setProperty("--portrait", `url("${fighter.image}")`);
      const portrait = card.querySelector(".card-portrait");
      if (portrait && portrait.getAttribute("src") !== fighter.image) portrait.src = fighter.image;
      const archiveButton = dom.archiveList.querySelector(`[data-fighter-id="${fighterId}"]`);
      const archivePortrait = archiveButton?.querySelector("img");
      if (archivePortrait && archivePortrait.getAttribute("src") !== fighter.image) archivePortrait.src = fighter.image;
    });
  }

  function setWandererForm(fighterId, gender) {
    if (fighterId !== "01" && fighterId !== "02") return;
    if (gender !== "male" && gender !== "female") return;
    if (state !== "idle" && state !== "matchEnd") return;
    wandererForms[fighterId] = gender;
    try {
      localStorage.setItem("solaris-wanderer-forms", JSON.stringify(wandererForms));
    } catch {
      // Persistence is optional.
    }
    syncWandererFormState();
    syncRosterSelection();
    updateChosenPanel();
    if (state === "idle" || state === "matchEnd") preparePreview();
    if (mode === "multi") renderMultiSetupBoard();
    if (dom.fighterArchive.open) renderArchive();
    playSound("select");
  }

  function selectFighter(id) {
    if (mode === "multi") {
      const index = multiIds.indexOf(id);
      if (index >= 0) {
        if (multiIds.length <= 2) return;
        multiIds.splice(index, 1);
        if (selectedId === id) selectedId = multiIds[0];
      } else {
        multiIds.push(id);
        selectedId = id;
      }
    } else if (configSide === "left") {
      selectedId = id;
    } else {
      enemyId = id;
    }
    syncRosterSelection();
    updateChosenPanel();
    if (state === "idle" || state === "matchEnd") {
      preparePreview();
      if (state === "matchEnd" || mode === "multi") showSelectOverlay();
    }
    playSound("select");
  }

  function syncRosterSelection() {
    const activeId = getConfigId();
    const otherId = configSide === "left" ? enemyId : selectedId;
    document.querySelectorAll(".fighter-card").forEach((card) => {
      const fighterId = card.dataset.fighterId;
      const multiSelected = mode === "multi" && multiIds.includes(fighterId);
      card.classList.toggle("is-selected", mode === "multi" ? multiSelected : fighterId === activeId);
      card.classList.toggle("is-opponent", mode !== "multi" && fighterId === otherId && fighterId !== activeId);
      card.dataset.otherSide = configSide === "left" ? "右侧" : "左侧";
      card.setAttribute("aria-selected", String(mode === "multi" ? multiSelected : fighterId === activeId));
    });
    dom.multiHint.hidden = mode !== "multi";
    dom.multiCount.textContent = String(multiIds.length);
    document.querySelectorAll("[data-config-side]").forEach((button) => {
      const active = button.dataset.configSide === configSide;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.disabled = mode === "multi" || (mode === "play" && button.dataset.configSide === "right");
    });
  }

  function setConfigSide(side) {
    if (mode === "multi" || (mode === "play" && side === "right")) return;
    configSide = side;
    syncRosterSelection();
    updateChosenPanel();
    playSound("select");
  }

  function updateChosenPanel() {
    const fighter = templateById(getConfigId());
    const rivalId = mode === "multi"
      ? multiIds.find((id) => id !== getConfigId()) || selectedId
      : configSide === "left" ? enemyId : selectedId;
    const rival = templateById(rivalId);
    dom.chosenFighter.style.setProperty("--chosen-color", fighter.color);
    dom.chosenOrb.style.setProperty("--chosen-color", fighter.color);
    dom.chosenOrb.classList.toggle("has-image", Boolean(fighter.image));
    if (fighter.image) dom.chosenOrb.style.setProperty("--portrait", `url("${fighter.image}")`);
    dom.chosenOrb.querySelector("span").textContent = fighter.symbol;
    dom.chosenElement.textContent = fighter.element;
    dom.chosenName.textContent = fighter.name;
    dom.chosenTagline.textContent = fighter.tagline;
    dom.powerStat.style.width = `${fighter.stats.power}%`;
    dom.speedStat.style.width = `${fighter.stats.speed}%`;
    dom.hpStat.style.width = `${fighter.stats.hp}%`;
    dom.powerValue.textContent = fighter.display.attack;
    dom.speedValue.textContent = fighter.display.speed;
    dom.hpValue.textContent = fighter.display.hp;
    dom.skillGlyph.textContent = fighter.abilityIcon;
    dom.skillName.textContent = fighter.ability;
    dom.skillDesc.textContent = fighter.abilityDesc;
    dom.enemyDot.style.setProperty("--enemy-color", rival.color);
    dom.enemyPreviewName.textContent = rival.name;
    dom.enemyPreviewTag.textContent = rival.tagline;
    const leftFighter = templateById(selectedId);
    const rightFighter = templateById(enemyId);
    dom.playerMini.style.setProperty("--avatar-color", leftFighter.color);
    dom.enemyMini.style.setProperty("--avatar-color", rightFighter.color);
    dom.playerMini.classList.toggle("has-image", Boolean(leftFighter.image));
    dom.enemyMini.classList.toggle("has-image", Boolean(rightFighter.image));
    if (leftFighter.image) dom.playerMini.style.setProperty("--portrait", `url("${leftFighter.image}")`);
    if (rightFighter.image) dom.enemyMini.style.setProperty("--portrait", `url("${rightFighter.image}")`);
    updateAbilityControlLabel();
  }

  function updateAbilityControlLabel() {
    const fighter = templateById(getConfigId());
    if (mode === "multi") {
      dom.abilityKey.textContent = "AUTO";
      dom.abilityLabel.textContent = "混战";
      dom.abilityButton.title = "多团混战中自动释放";
      return;
    }
    if (fighter.transformThreshold) {
      dom.abilityKey.textContent = "被动";
      dom.abilityLabel.textContent = "低血变身";
      dom.abilityButton.title = "安可生命低于 400 时自动变身";
      return;
    }
    if (fighter.id === "03") {
      dom.abilityKey.textContent = mode === "play" ? "E" : "AUTO";
      dom.abilityLabel.textContent = "风障蓄力";
      dom.abilityButton.title = "共鸣能量满后蓄力 3 秒并释放涤罪心渊";
      return;
    }
    if (fighter.id === "06") {
      dom.abilityKey.textContent = mode === "play" ? "E" : "AUTO";
      dom.abilityLabel.textContent = "生命庭院";
      dom.abilityButton.title = "场上存在藤且共鸣能量满后释放";
      return;
    }
    if (fighter.id === "04") {
      dom.abilityKey.textContent = mode === "play" ? "E" : "AUTO";
      dom.abilityLabel.textContent = "船长狂想";
      dom.abilityButton.title = "共鸣能量满后获得双倍移速和宝箱加速";
      return;
    }
    if (fighter.id === "05") {
      dom.abilityKey.textContent = mode === "play" ? "E" : "AUTO";
      dom.abilityLabel.textContent = "蜃境迷梦";
      dom.abilityButton.title = "累计死亡 3 只水母后，共鸣能量满时开启蜃境";
      return;
    }
    if (fighter.ultimateType === "autoThreshold") {
      dom.abilityKey.textContent = "AUTO";
      dom.abilityLabel.textContent = "低血共鸣";
      dom.abilityButton.title = "生命低于 600 且冷却就绪时自动开启";
      return;
    }
    if (fighter.ultimateType === "abyssBurst" && !fighter.abyssForm) {
      dom.abilityKey.textContent = "E";
      dom.abilityLabel.textContent = "需镰刀形态";
      dom.abilityButton.title = "进入恐怖镰刀人形态后才能释放";
      return;
    }
    dom.abilityKey.textContent = mode === "play" ? "E" : "AUTO";
    dom.abilityLabel.textContent = mode === "play" ? "共鸣解放" : "自动解放";
    dom.abilityButton.title = "共鸣能量满后释放共鸣解放";
  }

  function shuffleEnemy() {
    if (mode === "multi") return;
    const options = seededEnemyOptions();
    const currentIndex = options.findIndex((fighter) => fighter.id === enemyId);
    let nextIndex = Math.floor(Math.random() * options.length);
    if (options.length > 1 && nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1) % options.length;
    }
    enemyId = options[nextIndex].id;
    syncRosterSelection();
    updateChosenPanel();
    if (state === "idle" || state === "matchEnd") {
      preparePreview();
    }
    playSound("select");
  }

  function setMode(nextMode) {
    mode = nextMode;
    if (mode === "play" || mode === "multi") configSide = "left";
    document.querySelectorAll(".mode-button").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const touchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    dom.keyGuide.hidden = mode !== "play";
    dom.touchPad.hidden = !(mode === "play" && touchDevice);
    dom.matchHead.hidden = mode === "multi";
    dom.multiBoard.hidden = mode !== "multi";
    dom.configSidePanel.hidden = mode === "multi";
    dom.shuffleButton.disabled = mode === "multi";
    document.querySelectorAll("[data-config-side]").forEach((button) => {
      button.disabled = mode === "multi" || (mode === "play" && button.dataset.configSide === "right");
    });
    if (mode === "multi") {
      dom.controlCopy.innerHTML = `
        <span class="control-kicker">多团混战</span>
        <p>点击角色牌调整参战阵容，至少保留两只团子。混战为全自动运行。</p>
      `;
      dom.overlayHint.textContent = `${multiIds.length} 只团子 · 全自动混战`;
      dom.abilityKey.textContent = "AUTO";
      dom.abilityLabel.textContent = "自动混战";
    } else if (mode === "watch") {
      dom.controlCopy.innerHTML = `
        <span class="control-kicker">观战模式</span>
        <p>开局随机确定方向，全程直线移动，只在相互碰撞或触边后改变方向。</p>
      `;
      dom.overlayHint.textContent = "自动观战 · 无需操作";
      dom.abilityKey.textContent = "AUTO";
      dom.abilityLabel.textContent = "自动解放";
    } else {
      dom.controlCopy.innerHTML = `
        <span class="control-kicker">亲自挑战</span>
        <p>你控制左边的团子。撞击对手和地图边缘可积累共鸣能量，满后释放共鸣解放。</p>
      `;
      dom.overlayHint.textContent = touchDevice ? "拖动方向键移动 · 点击共鸣解放" : "WASD 或方向键移动 · E 共鸣解放";
      dom.abilityKey.textContent = "E";
      dom.abilityLabel.textContent = "共鸣解放";
    }
    if (state !== "idle") {
      state = "idle";
    }
    preparePreview();
    syncRosterSelection();
    updateChosenPanel();
    updateAbilityControlLabel();
    if (mode === "multi") renderMultiSetupBoard();
    if (state === "idle" || state === "matchEnd") showSelectOverlay();
  }

  function syncPauseControl() {
    const canPause = (state === "playing" || state === "countdown") && !voicePauseActive;
    dom.pauseButton.disabled = !canPause;
    dom.pauseButton.textContent = manualPaused ? "继续" : "暂停";
    dom.pauseButton.setAttribute("aria-pressed", String(manualPaused));
    dom.pauseButton.setAttribute("aria-label", manualPaused ? "继续对局" : "暂停对局");
    dom.pauseOverlay.hidden = !manualPaused;
  }

  function setManualPaused(paused) {
    if (paused && voicePauseActive) return;
    if (paused && state !== "playing" && state !== "countdown") return;
    manualPaused = Boolean(paused);
    if (manualPaused) {
      Object.keys(keys).forEach((key) => {
        keys[key] = false;
      });
      Object.keys(touchDirection).forEach((direction) => {
        touchDirection[direction] = false;
      });
      dom.battleStatus.textContent = "对局已暂停";
      dom.abilityButton.disabled = true;
      dom.abilityButton.classList.remove("is-ready");
    } else if (state === "countdown") {
      dom.battleStatus.textContent = "倒计时";
    }
    syncPauseControl();
    if (!manualPaused && player && enemy) updateHud();
  }

  function togglePause() {
    setManualPaused(!manualPaused);
  }

  function voiceClipsFor(fighter, type) {
    const id = fighter?.template?.id || fighter?.id;
    const clips = VOICE_LIBRARY[id]?.[type];
    return Array.isArray(clips) ? clips.filter(Boolean) : [];
  }

  function voiceEntriesFor(fighters, type) {
    return sortFightersByVoiceOrder(fighters)
      .filter((fighter) => fighter && voiceClipsFor(fighter, type).length > 0)
      .map((fighter) => ({ fighter, type }));
  }

  function stopAttackVoice() {
    if (!activeAttackVoice) return;
    activeAttackVoice.pause();
    activeAttackVoice = null;
  }

  function playAttackVoice(fighter, type = "attack") {
    if (!soundEnabled || voicePauseActive) return;
    const clips = voiceClipsFor(fighter, type);
    if (!clips.length) return;
    stopAttackVoice();
    const audio = new Audio(clips[Math.floor(Math.random() * clips.length)]);
    audio.volume = 0.72;
    activeAttackVoice = audio;
    audio.addEventListener("ended", () => {
      if (activeAttackVoice === audio) activeAttackVoice = null;
    }, { once: true });
    audio.play().catch(() => {
      if (activeAttackVoice === audio) activeAttackVoice = null;
    });
  }

  function enqueueVoiceSequence(entries, options = {}) {
    const validEntries = entries.filter((entry) => (
      entry?.fighter && voiceClipsFor(entry.fighter, entry.type).length > 0
    ));
    voiceJobs.push({
      entries: validEntries,
      index: 0,
      pauseGame: options.pauseGame !== false,
      onComplete: typeof options.onComplete === "function" ? options.onComplete : null
    });
    processVoiceQueue();
  }

  function processVoiceQueue() {
    if (activeVoiceJob) return;
    if (!soundEnabled) {
      while (voiceJobs.length) {
        const job = voiceJobs.shift();
        if (job.onComplete) job.onComplete();
      }
      voicePauseActive = false;
      voiceFocusFighter = null;
      syncPauseControl();
      return;
    }
    const job = voiceJobs.shift();
    if (!job) {
      voicePauseActive = false;
      voiceFocusFighter = null;
      syncPauseControl();
      return;
    }
    activeVoiceJob = job;
    voicePauseActive = job.pauseGame;
    syncPauseControl();
    playNextVoiceInJob();
  }

  function playNextVoiceInJob() {
    if (!activeVoiceJob) return;
    const job = activeVoiceJob;
    while (job.index < job.entries.length && !soundEnabled) job.index += 1;
    if (job.index >= job.entries.length || !soundEnabled) {
      finishVoiceJob();
      return;
    }
    const entry = job.entries[job.index];
    const clips = voiceClipsFor(entry.fighter, entry.type);
    if (!clips.length) {
      job.index += 1;
      playNextVoiceInJob();
      return;
    }

    stopAttackVoice();
    activeVoiceEntry = entry;
    voiceEntryStartedAt = visualTime;
    voiceFocusFighter = entry.focus === false ? null : entry.fighter;
    const labels = {
      intro: "出场",
      ultimate: "共鸣解放",
      deathSentence: "死告",
      death: "战败",
      victory: "胜利"
    };
    dom.battleStatus.textContent = `${labels[entry.type] || "语音"} · ${entry.fighter.template.name}`;
    announce(`${entry.fighter.template.name} · ${labels[entry.type] || "语音"}`, entry.fighter.template.color, 1);

    const audio = new Audio(clips[Math.floor(Math.random() * clips.length)]);
    audio.volume = 0.9;
    activeVoiceAudio = audio;
    let settled = false;
    let fallbackTimer = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (activeVoiceAudio === audio) activeVoiceAudio = null;
      activeVoiceEntry = null;
      voiceEntryStartedAt = 0;
      job.index += 1;
      playNextVoiceInJob();
    };
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    fallbackTimer = setTimeout(finish, 15000);
    audio.play().catch(finish);
  }

  function finishVoiceJob() {
    const job = activeVoiceJob;
    activeVoiceJob = null;
    activeVoiceEntry = null;
    voiceEntryStartedAt = 0;
    if (activeVoiceAudio) {
      activeVoiceAudio.pause();
      activeVoiceAudio = null;
    }
    voicePauseActive = false;
    voiceFocusFighter = null;
    syncPauseControl();
    if (job?.onComplete) job.onComplete();
    processVoiceQueue();
  }

  function cancelVoicePlayback(completePending = false) {
    const pendingJobs = activeVoiceJob ? [activeVoiceJob, ...voiceJobs] : [...voiceJobs];
    if (activeVoiceAudio) {
      activeVoiceAudio.pause();
      activeVoiceAudio = null;
    }
    stopAttackVoice();
    activeVoiceJob = null;
    activeVoiceEntry = null;
    voiceEntryStartedAt = 0;
    voiceJobs.length = 0;
    voicePauseActive = false;
    voiceFocusFighter = null;
    syncPauseControl();
    if (completePending) {
      pendingJobs.forEach((job) => {
        if (job.onComplete) job.onComplete();
      });
    }
  }

  function playIntroVoices() {
    const entries = voiceEntriesFor(getActiveFighters(), "intro");
    if (!entries.length) return;
    enqueueVoiceSequence(entries, {
      pauseGame: true,
      onComplete: () => {
        if (state !== "countdown") return;
        countdownClock = 3.05;
        countdownBeat = 3;
        showCountdown("3");
        dom.battleStatus.textContent = "倒计时";
      }
    });
  }

  function updateVoiceCamera(dt) {
    const target = voicePauseActive && voiceFocusFighter ? 1 : 0;
    voiceCameraMix += (target - voiceCameraMix) * Math.min(1, dt * 6);
    if (target === 0 && voiceCameraMix < 0.002) voiceCameraMix = 0;
  }

  function resetScores() {
    score = [0, 0];
    round = 1;
    dom.playerScore.textContent = "0";
    dom.enemyScore.textContent = "0";
    dom.roundLabel.textContent = "第 1 局";
  }

  function startMatch() {
    manualPaused = false;
    roundResultVoicePending = false;
    multiResultVoicePending = false;
    lastRoundFinishReason = "KO";
    if (mode === "multi") {
      startMultiMatch();
      return;
    }
    resetScores();
    startRound();
  }

  function resetBattleTransient() {
    cancelVoicePlayback();
    particles = [];
    effects = [];
    projectiles = [];
    craters = [];
    blackSlams = [];
    summonUnits = [];
    timeVortices = [];
    vortexSequence = 0;
    windFields = [];
    windWaves = [];
    windSequence = 0;
    verinaPlants = [];
    verinaPlantSequence = 0;
    brantChests = [];
    brantAnchors = [];
    brantSequence = 0;
    cantarellaJellies = [];
    cantarellaUmbrellas = [];
    cantarellaSequence = 0;
    pickups = [];
    floatingTexts = [];
    timeStopOwner = null;
    timeStopTimer = 0;
    combo = { side: -1, count: 0, timer: 0 };
    dom.comboBadge.classList.remove("show");
  }

  function startMultiMatch() {
    const templates = multiIds.map(templateById);
    if (templates.length < 2) return;
    resetBattleTransient();
    multiFighters = templates.map((template, index) => {
      const fighter = makeFighter(template, index);
      const angle = -Math.PI / 2 + (index / templates.length) * Math.PI * 2;
      const orbit = (ARENA_SIZE - BOUNDARY * 2) * 0.33;
      fighter.x = ARENA_SIZE / 2 + Math.cos(angle) * orbit;
      fighter.y = ARENA_SIZE / 2 + Math.sin(angle) * orbit;
      fighter.vx = Math.cos(angle + Math.PI * 0.52) * fighter.moveSpeed;
      fighter.vy = Math.sin(angle + Math.PI * 0.52) * fighter.moveSpeed;
      return fighter;
    });
    player = multiFighters[0];
    enemy = multiFighters[1];
    [player, enemy].forEach(spawnWhiteSheep);
    multiFighters.slice(2).forEach(spawnWhiteSheep);
    setupVerinaPlants();
    setupCantarellaJellies();
    battleTimer = roundSeconds;
    pickupTimer = random(3.4, 5.4);
    countdownClock = 3.05;
    countdownBeat = 4;
    round = 1;
    state = "countdown";
    syncPauseControl();
    syncWandererFormState();
    dom.gameOverlay.classList.add("is-hidden");
    dom.abilityButton.disabled = true;
    dom.abilityButton.classList.remove("is-ready");
    dom.liveBadge.classList.add("is-live");
    dom.roundLabel.textContent = "混战";
    dom.matchState.textContent = `${multiFighters.length} 团同场`;
    dom.battleStatus.textContent = "混战倒计时";
    dom.statusDot.classList.remove("live");
    renderMultiBoard(multiFighters);
    updateHud();
    addLog(`${multiFighters.length} 只团子进入多团混战。`, "system");
    announce("多团混战", "#ffd84d");
    playSound("round");
    playIntroVoices();
  }

  function startRound() {
    const chosen = templateById(selectedId);
    const rival = templateById(enemyId);
    player = makeFighter(chosen, 0);
    enemy = makeFighter(rival, 1);
    resetBattleTransient();
    [player, enemy].forEach(spawnWhiteSheep);
    setupVerinaPlants();
    setupCantarellaJellies();
    battleTimer = roundSeconds;
    pickupTimer = random(3.4, 5.4);
    countdownClock = 3.05;
    countdownBeat = 4;
    state = "countdown";
    syncPauseControl();
    syncWandererFormState();
    dom.gameOverlay.classList.add("is-hidden");
    dom.abilityButton.disabled = true;
    dom.abilityButton.classList.remove("is-ready");
    dom.liveBadge.classList.add("is-live");
    dom.matchState.textContent = "三局两胜";
    dom.battleStatus.textContent = "倒计时";
    dom.statusDot.classList.remove("live");
    dom.roundLabel.textContent = `第 ${round} 局`;
    updateHud();
    addLog(`${chosen.name} 对上 ${rival.name}，第 ${round} 局蓄势待发。`, "system");
    announce("准备碰撞", "#ffd84d");
    playSound("round");
    playIntroVoices();
  }

  function showCountdown(value) {
    dom.countdown.textContent = value;
    dom.countdown.classList.remove("show");
    void dom.countdown.offsetWidth;
    dom.countdown.classList.add("show");
  }

  function updateCountdown(dt) {
    countdownClock -= dt;
    const beat = Math.ceil(countdownClock);
    if (beat < countdownBeat && beat > 0) {
      countdownBeat = beat;
      showCountdown(String(beat));
      playSound("tick");
    }
    if (countdownClock <= 0) {
      state = "playing";
      countdownBeat = 0;
      showCountdown("开撞！");
      dom.battleStatus.textContent = "激战中";
      dom.statusDot.classList.add("live");
      playSound("fight");
      announce("开撞！", "#ffd84d");
    }
  }

  function updateBattle(dt) {
    if (timeStopOwner && timeStopTimer > 0 && state === "playing") {
      updateTimeStoppedBattle(dt);
      return;
    }
    if (mode === "multi") {
      updateMultiBattle(dt);
      return;
    }
    battleTimer = Math.max(0, battleTimer - dt);
    collisionLock = Math.max(0, collisionLock - dt);
    if (arenaItemsEnabled) pickupTimer -= dt;
    ambientTimer -= dt;
    addResonanceEnergy(player, 3 * dt);
    addResonanceEnergy(enemy, 3 * dt);

    if (arenaItemsEnabled && pickupTimer <= 0) {
      spawnPickup();
      pickupTimer = random(4.8, 7.2);
    }

    if (ambientTimer <= 0) {
      ambientTimer = random(0.18, 0.38);
      const side = Math.random() < 0.5 ? 0 : 1;
      const fighter = side === 0 ? player : enemy;
      particles.push({
        x: fighter.x + random(-fighter.r, fighter.r),
        y: fighter.y + random(-fighter.r, fighter.r),
        vx: random(-13, 13),
        vy: random(-13, 13),
        life: random(0.35, 0.7),
        maxLife: 0.7,
        size: random(1, 2.4),
        color: fighter.template.color
      });
    }

    updateFighter(player, enemy, dt, true);
    if (state === "playing") updateFighter(enemy, player, dt, false);
    if (player.vortexLockTimer <= 0) updateStatuses(player, dt);
    if (enemy.vortexLockTimer <= 0) updateStatuses(enemy, dt);
    if (voicePauseActive) {
      updateHud();
      return;
    }
    updateTimeVortices(dt);
    updateWindFields(dt);
    updateWindWaves(dt);
    if (player.vortexLockTimer > 0 || enemy.vortexLockTimer > 0) {
      resolveLockedCollision();
    } else {
      resolveCollision();
    }
    pinBrantBigAnchorFighters();
    if (voicePauseActive) {
      updateHud();
      return;
    }
    player.contactFxClock -= dt;
    enemy.contactFxClock -= dt;
    if (player.inContact && enemy.inContact && player.contactFxClock <= 0) {
      player.contactFxClock = 0.085;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const length = Math.hypot(dx, dy) || 1;
      const contactX = player.x + (dx / length) * player.r;
      const contactY = player.y + (dy / length) * player.r;
      particles.push({
        x: contactX + random(-7, 7),
        y: contactY + random(-7, 7),
        vx: random(-38, 38),
        vy: random(-38, 38),
        life: random(0.18, 0.35),
        maxLife: 0.35,
        size: random(1.2, 2.8),
        color: Math.random() < 0.5 ? player.template.color : enemy.template.color
      });
    }
    updateSummons(dt);
    updateCantarellaSystem(dt);
    updateVerinaPlants(dt);
    updateBrantSystem(dt);
    updateBlackSlams(dt);
    updateCombat(dt);
    if (voicePauseActive) {
      updateHud();
      return;
    }
    updateProjectiles(dt);
    updatePickups();
    updateTrails(dt);

    if (battleTimer <= 0 && state === "playing") {
      const winner = player.hp === enemy.hp
        ? (player.energy >= enemy.energy ? 0 : 1)
        : (player.hp > enemy.hp ? 0 : 1);
      finishRound(winner, "时间到");
    }
    updateHud();
  }

  function updateMultiBattle(dt) {
    battleTimer = Math.max(0, battleTimer - dt);
    collisionLock = Math.max(0, collisionLock - dt);
    if (arenaItemsEnabled) pickupTimer -= dt;
    ambientTimer -= dt;
    const combatants = getActiveFighters().filter((fighter) => fighter.hp > 0);
    combatants.forEach((fighter) => addResonanceEnergy(fighter, 3 * dt));

    if (arenaItemsEnabled && pickupTimer <= 0) {
      spawnPickup();
      pickupTimer = random(4.8, 7.2);
    }

    if (ambientTimer <= 0 && combatants.length) {
      ambientTimer = random(0.12, 0.3);
      const fighter = combatants[Math.floor(Math.random() * combatants.length)];
      particles.push({
        x: fighter.x + random(-fighter.r, fighter.r),
        y: fighter.y + random(-fighter.r, fighter.r),
        vx: random(-13, 13),
        vy: random(-13, 13),
        life: random(0.35, 0.7),
        maxLife: 0.7,
        size: random(1, 2.4),
        color: fighter.template.color
      });
    }

    getActiveFighters().forEach((fighter) => {
      if (fighter.hp <= 0) return;
      const opponent = nearestOpponent(fighter);
      if (opponent) updateFighter(fighter, opponent, dt, false);
    });
    getActiveFighters().forEach((fighter) => {
      if (fighter.hp > 0 && fighter.vortexLockTimer <= 0) updateStatuses(fighter, dt);
    });
    if (voicePauseActive) {
      updateHud();
      return;
    }
    updateTimeVortices(dt);
    updateWindFields(dt);
    updateWindWaves(dt);
    resolveMultiCollisions();
    pinBrantBigAnchorFighters();
    if (voicePauseActive) {
      updateHud();
      return;
    }
    updateSummons(dt);
    updateCantarellaSystem(dt);
    updateVerinaPlants(dt);
    updateBrantSystem(dt);
    updateBlackSlams(dt);
    updateMultiCombat(dt);
    if (voicePauseActive) {
      updateHud();
      return;
    }
    updateProjectiles(dt);
    updatePickups();
    updateTrails(dt);

    const alive = getActiveFighters().filter((fighter) => fighter.hp > 0);
    if (alive.length <= 1) {
      finishMultiMatch(alive[0] || null, "KO");
    } else if (battleTimer <= 0) {
      const winner = [...alive].sort((a, b) => b.hp - a.hp)[0];
      finishMultiMatch(winner, "时间到");
    }
    updateHud();
  }

  function updateMultiCombat(dt) {
    const turnOrder = getActiveFighters().filter((fighter) => fighter.hp > 0);
    for (const fighter of turnOrder) {
      if (state !== "playing") break;
      if (fighter.hp <= 0 || fighter.vortexLockTimer > 0) continue;
      const opponent = nearestOpponent(fighter);
      if (!opponent) continue;
      updateWandererCombatState(fighter, opponent, dt);
      if (state !== "playing") break;
      handleAbility(fighter, opponent, dt);
      if (state !== "playing" || voicePauseActive) break;
      tryBasicAttack(fighter, opponent);
    }
  }

  function updateTimeStoppedBattle(dt) {
    const caster = timeStopOwner;
    if (!caster || caster.hp <= 0) {
      timeStopOwner = null;
      timeStopTimer = 0;
      return;
    }
    const frozenFighters = getActiveFighters().filter((fighter) => fighter !== caster && fighter.hp > 0);
    const target = nearestOpponent(caster);
    timeStopTimer = Math.max(0, timeStopTimer - dt);
    addResonanceEnergy(caster, 3 * dt);
    updateFighter(caster, target, dt, caster === player);
    updateStatuses(caster, dt);
    if (voicePauseActive) return;
    if (target) {
      updateWandererCombatState(caster, target, dt);
      frozenFighters.forEach((fighter) => keepCasterOutsideFrozenTarget(caster, fighter));
      updateCombatSingle(caster, target, dt);
    }
    updateTrails(dt);
    if (mode === "multi" && state === "playing") {
      const alive = getActiveFighters().filter((fighter) => fighter.hp > 0);
      if (alive.length <= 1) finishMultiMatch(alive[0] || null, "KO");
    }
    if (timeStopTimer === 0) {
      addLog("时序停界结束，全图时间恢复流动。", "ability");
      announce("时间恢复流动", "#9ddfe5", 1);
      timeStopOwner = null;
      playSound("timeEnd");
    }
    updateHud();
  }

  function keepCasterOutsideFrozenTarget(caster, frozen) {
    const dx = caster.x - frozen.x;
    const dy = caster.y - frozen.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDistance = caster.r + frozen.r;
    if (dist < minDistance) {
      const nx = dx / dist;
      const ny = dy / dist;
      caster.x = clamp(frozen.x + nx * minDistance, BOUNDARY + caster.r, ARENA_SIZE - BOUNDARY - caster.r);
      caster.y = clamp(frozen.y + ny * minDistance, BOUNDARY + caster.r, ARENA_SIZE - BOUNDARY - caster.r);
    }
  }

  function resolveLockedCollision() {
    if (player.vortexLockTimer > 0 && enemy.vortexLockTimer <= 0) {
      keepCasterOutsideFrozenTarget(enemy, player);
    } else if (enemy.vortexLockTimer > 0 && player.vortexLockTimer <= 0) {
      keepCasterOutsideFrozenTarget(player, enemy);
    }
    const touching = distance(player, enemy) <= player.r + enemy.r + 2;
    player.inContact = touching;
    enemy.inContact = touching;
  }

  function updateFighter(fighter, opponent, dt, isPlayer) {
    if (fighter.template.id === "04" && fighter.brantBigAnchorLock) {
      fighter.x = ARENA_SIZE / 2;
      fighter.y = ARENA_SIZE / 2;
      fighter.vx = 0;
      fighter.vy = 0;
      fighter.knockback = null;
      fighter.attackClock = Math.max(0, fighter.attackClock - dt * getActionSpeed(fighter));
      return;
    }
    if (fighter.vortexLockTimer > 0) return;
    fighter.abilityCooldown = Math.max(0, fighter.abilityCooldown - dt);
    fighter.flash = Math.max(0, fighter.flash - dt * 5.5);
    fighter.frozenFlash = Math.max(0, fighter.frozenFlash - dt * 3);
    fighter.dash = Math.max(0, fighter.dash - dt);
    fighter.weaponSwing = Math.max(0, fighter.weaponSwing - dt);
    fighter.thrustTime = Math.max(0, fighter.thrustTime - dt);
    fighter.abyssScytheSwing = Math.max(0, fighter.abyssScytheSwing - dt);

    if (fighter.knockback) {
      fighter.x += fighter.knockback.vx * dt;
      fighter.y += fighter.knockback.vy * dt;
      fighter.knockback.timer -= dt;
      fighter.vx = 0;
      fighter.vy = 0;
      if (fighter.knockback.timer <= 0) {
        fighter.x = clamp(fighter.x, BOUNDARY + fighter.r, ARENA_SIZE - BOUNDARY - fighter.r);
        fighter.y = clamp(fighter.y, BOUNDARY + fighter.r, ARENA_SIZE - BOUNDARY - fighter.r);
        const { stun, resumeX, resumeY } = fighter.knockback;
        const resumeSpeed = getEffectiveMoveSpeed(fighter);
        fighter.stunned = Math.max(fighter.stunned, stun);
        fighter.vx = resumeX * resumeSpeed;
        fighter.vy = resumeY * resumeSpeed;
        fighter.knockback = null;
      }
      return;
    }

    if (fighter.charge) {
      fighter.vx = 0;
      fighter.vy = 0;
      return;
    }

    if (fighter.freeze > 0 || fighter.stunned > 0) return;

    if (fighter.template.id === "02" && fighter.abyssForm && fighter.abyssHoming && opponent) {
      const angle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x);
      const speed = getEffectiveMoveSpeed(fighter);
      fighter.vx = Math.cos(angle) * speed;
      fighter.vy = Math.sin(angle) * speed;
    }
    if (fighter.template.id === "04" && opponent) {
      fighter.brantMeleeMode = distance(fighter, opponent) <= fighter.template.attackRange * CELL_SIZE;
      fighter.brantAimAngle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x);
    }

    if (isPlayer && mode === "play") {
      const inputX = (keys.ArrowRight || keys.KeyD || touchDirection.right ? 1 : 0)
        - (keys.ArrowLeft || keys.KeyA || touchDirection.left ? 1 : 0);
      const inputY = (keys.ArrowDown || keys.KeyS || touchDirection.down ? 1 : 0)
        - (keys.ArrowUp || keys.KeyW || touchDirection.up ? 1 : 0);
      const magnitude = Math.hypot(inputX, inputY);
      if (magnitude > 0) {
        const targetSpeed = getEffectiveMoveSpeed(fighter);
        fighter.vx = (inputX / magnitude) * targetSpeed;
        fighter.vy = (inputY / magnitude) * targetSpeed;
      }
    }

    const speedLimit = getEffectiveMoveSpeed(fighter);
    const speed = Math.hypot(fighter.vx, fighter.vy);
    if (speed > 0) {
      fighter.vx = (fighter.vx / speed) * speedLimit;
      fighter.vy = (fighter.vy / speed) * speedLimit;
    }

    fighter.x += fighter.vx * dt;
    fighter.y += fighter.vy * dt;
    fighter.tilt += ((fighter.vx / 1800) - fighter.tilt) * Math.min(1, dt * 5);
    fighter.blink -= dt;

    const minX = BOUNDARY + fighter.r;
    const maxX = ARENA_SIZE - BOUNDARY - fighter.r;
    const minY = BOUNDARY + fighter.r;
    const maxY = ARENA_SIZE - BOUNDARY - fighter.r;

    let hitWall = false;
    if (fighter.x < minX) {
      fighter.x = minX;
      fighter.vx = Math.abs(fighter.vx);
      wallSpark(fighter, minX, fighter.y, 1, 0);
      hitWall = true;
    } else if (fighter.x > maxX) {
      fighter.x = maxX;
      fighter.vx = -Math.abs(fighter.vx);
      wallSpark(fighter, maxX, fighter.y, -1, 0);
      hitWall = true;
    }
    if (fighter.y < minY) {
      fighter.y = minY;
      fighter.vy = Math.abs(fighter.vy);
      wallSpark(fighter, fighter.x, minY, 0, 1);
      hitWall = true;
    } else if (fighter.y > maxY) {
      fighter.y = maxY;
      fighter.vy = -Math.abs(fighter.vy);
      wallSpark(fighter, fighter.x, maxY, 0, -1);
      hitWall = true;
    }
    if (hitWall && fighter.template.id === "02" && fighter.abyssForm) activateAbyssHoming(fighter);

    fighter.attackClock -= dt * getActionSpeed(fighter);
  }

  function wallSpark(fighter, x, y, nx, ny) {
    if (Math.hypot(fighter.vx, fighter.vy) < 100) return;
    const sparkX = x - nx * fighter.r * 0.82;
    const sparkY = y - ny * fighter.r * 0.82;
    spawnBurst(sparkX, sparkY, fighter.template.color, 7, 105);
    effects.push({
      type: "impact",
      x: sparkX,
      y: sparkY,
      life: 0.16,
      maxLife: 0.16,
      radius: 15,
      color: fighter.template.color
    });
  }

  function updateStatuses(fighter, dt) {
    fighter.freeze = Math.max(0, fighter.freeze - dt);
    fighter.stunned = Math.max(0, fighter.stunned - dt);
    fighter.frenzy = Math.max(0, fighter.frenzy - dt);
    fighter.timeForceTimer = Math.max(0, fighter.timeForceTimer - dt);
    fighter.timeSlowTimer = Math.max(0, fighter.timeSlowTimer - dt);
    fighter.verinaSlowTimer = Math.max(0, fighter.verinaSlowTimer - dt);
    if (fighter.cantarellaMirageTimer > 0) {
      fighter.cantarellaMirageTimer = Math.max(0, fighter.cantarellaMirageTimer - dt);
      if (fighter.cantarellaMirageTimer === 0) finishCantarellaMirage(fighter);
    }
    if (fighter.cantarellaSlowTimer > 0) {
      fighter.cantarellaSlowTimer = Math.max(0, fighter.cantarellaSlowTimer - dt);
      if (fighter.cantarellaSlowTimer === 0) fighter.cantarellaDreamed = false;
    }
    fighter.ultimateCooldown = Math.max(0, fighter.ultimateCooldown - dt);
    if (fighter.template.id === "03" && fighter.hp > 0) {
      if (fighter.skillClock > 0) fighter.skillClock = Math.max(0, fighter.skillClock - dt);
      if (fighter.skillClock === 0) {
        spawnWindField(fighter);
        fighter.skillClock = fighter.template.skillCooldown;
      }
      if (fighter.charge) {
        fighter.charge.timer = Math.max(0, fighter.charge.timer - dt);
        if (fighter.charge.timer === 0) resolveJianxinCharge(fighter);
      }
    }
    if (fighter.template.id === "06" && fighter.hp > 0) {
      if (fighter.skillClock > 0) fighter.skillClock = Math.max(0, fighter.skillClock - dt);
      if (fighter.skillClock === 0) {
        spawnVerinaPlant(fighter, fighter.x, fighter.y, false);
        fighter.skillClock = fighter.template.skillCooldown;
      }
    }
    if (fighter.template.id === "02" && fighter.abyssForm) {
      fighter.abyssEnergy = Math.max(0, fighter.abyssEnergy - fighter.template.abyssDrainPerSecond * dt);
      if (fighter.hp > 200) {
        fighter.abyssLifeClock -= dt;
        if (fighter.abyssLifeClock <= 0 && fighter.hp > 0) {
          fighter.abyssLifeClock += 1;
          dealRawDamage(fighter, fighter.template.abyssLifeDrainPerSecond, null, "暗涌侵蚀", "#a967ff");
        }
      } else {
        fighter.abyssLifeClock = 1;
      }
      if (fighter.abyssEnergy <= 0) exitAbyssForm(fighter);
    }
    if (fighter.template.id === "kakarot-test" && fighter.specialEnergy >= 3 && fighter.deathSentenceClock > 0) {
      fighter.deathSentenceClock = Math.max(0, fighter.deathSentenceClock - dt);
      if (fighter.deathSentenceClock === 0 && fighter.hp > 0 && state === "playing") {
        triggerDeathSentence(fighter, nearestOpponent(fighter));
      }
    }
    if (
      fighter.template.ultimateType === "autoThreshold"
      && fighter.overclock <= 0
      && fighter.hp > 0
      && fighter.hp < fighter.template.ultimateThreshold
      && fighter.ultimateCooldown <= 0
      && !fighter.voiceUltimatePending
    ) {
      fighter.ultimateCooldown = fighter.template.ultimateCooldown;
      const voiceEntries = voiceEntriesFor([fighter], "ultimate")
        .map((entry) => ({ ...entry, focus: false }));
      if (voiceEntries.length) {
        fighter.voiceUltimatePending = true;
        enqueueVoiceSequence(voiceEntries, {
          pauseGame: true,
          onComplete: () => {
            fighter.voiceUltimatePending = false;
            activateKakarotOverclock(fighter);
          }
        });
      } else {
        activateKakarotOverclock(fighter);
      }
    }

    function activateKakarotOverclock(fighter) {
      if (fighter.hp <= 0) return;
      fighter.overclock = fighter.template.ultimateDuration;
      fighter.flash = 1;
      effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 14, growth: 760, life: 0.7, maxLife: 0.7, color: "#6df0e8", width: 10 });
      spawnBurst(fighter.x, fighter.y, "#9ffff3", 40, 310);
      announce(`${fighter.template.name} · 低血共鸣解放`, "#93fff4", 1.35);
      addLog(`${fighter.template.name} 生命低于 600，自动开启共鸣解放。`, "ability");
      playSound("lightning");
    }
    if (
      fighter.template.transformThreshold
      && !fighter.horned
      && fighter.hp < fighter.template.transformThreshold
      && !fighter.voiceUltimatePending
    ) {
      const voiceEntries = voiceEntriesFor([fighter], "ultimate")
        .map((entry) => ({ ...entry, focus: false }));
      if (voiceEntries.length) {
        fighter.voiceUltimatePending = true;
        enqueueVoiceSequence(voiceEntries, {
          pauseGame: true,
          onComplete: () => {
            fighter.voiceUltimatePending = false;
            activateAnkoHornedForm(fighter);
          }
        });
        return;
      }
      activateAnkoHornedForm(fighter);
    }

    function activateAnkoHornedForm(fighter) {
      if (fighter.hp <= 0 || fighter.horned) return;
      fighter.horned = true;
      fighter.attackClock = Math.min(fighter.attackClock, 0.35);
      fighter.flash = 1;
      effects.push({
        type: "ring",
        x: fighter.x,
        y: fighter.y,
        radius: 12,
        growth: 520,
        life: 0.7,
        maxLife: 0.7,
        color: "#ffb1d3",
        width: 8
      });
      spawnBurst(fighter.x, fighter.y, "#ff9fc8", 36, 250);
      announce(`${fighter.template.name} · 羊角觉醒`, "#ff9fc8", 1.4);
      addLog(`${fighter.template.name} 生命低于 400，长出羊角并解锁黑咩砸击。`, "ability");
      playSound("lightning");
    }
    if (fighter.overclock > 0) {
      fighter.overclock = Math.max(0, fighter.overclock - dt);
      if (fighter.overclock === 0) {
        announce(`${fighter.template.name} 共鸣解放结束`, fighter.template.color, 1.2);
        addLog(`${fighter.template.name} 的共鸣解放状态结束。`, "system");
      }
    }
    if (fighter.paralyzed > 0) {
      fighter.paralyzed = Math.max(0, fighter.paralyzed - dt);
      fighter.paralyzeTick -= dt;
      if (fighter.paralyzeTick <= 0 && state === "playing") {
        fighter.paralyzeTick = 3;
        fighter.stunned = 0.8;
        const source = fighter === player ? enemy : player;
        announce(`${fighter.template.name} 受到电击 · 麻痹`, "#bda7ff", 0.9);
        addLog(`${fighter.template.name} 触发麻痹电击，停止行动 0.8 秒。`, "ability");
        applyDamage(fighter, 20, source, "麻痹电击", {
          color: "#bda7ff",
          ignoreVulnerability: true,
          noEnergy: true,
          quiet: true
        });
        spawnBurst(fighter.x, fighter.y, "#d2c3ff", 24, 220);
      }
    }
    if (fighter.burn > 0) {
      fighter.burn = Math.max(0, fighter.burn - dt);
      fighter.burnTick -= dt;
      if (fighter.burnTick <= 0 && state === "playing") {
        fighter.burnTick = 0.75;
        applyDamage(fighter, 13 + fighter.template.hp * 0.004, fighter === player ? enemy : player, "灼烧", {
          quiet: true,
          color: "#ff815c"
        });
      }
    }
  }

  function resolveCollision() {
    if (!player || !enemy || state !== "playing") return;
    if (player.knockback || enemy.knockback) {
      player.inContact = false;
      enemy.inContact = false;
      return;
    }
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const minDistance = player.r + enemy.r;
    const dist = Math.hypot(dx, dy) || 0.001;
    if (dist >= minDistance + 2) {
      player.inContact = false;
      enemy.inContact = false;
      player.contactTime = 0;
      enemy.contactTime = 0;
      dom.battleStatus.textContent = "激战中";
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    if (dist < minDistance) {
      const overlap = minDistance - dist;
      player.x -= nx * overlap * 0.5;
      player.y -= ny * overlap * 0.5;
      enemy.x += nx * overlap * 0.5;
      enemy.y += ny * overlap * 0.5;
    }

    const relativeX = player.vx - enemy.vx;
    const relativeY = player.vy - enemy.vy;
    const impactSpeed = Math.max(0, relativeX * nx + relativeY * ny);

    const playerNormal = player.vx * nx + player.vy * ny;
    const enemyNormal = enemy.vx * nx + enemy.vy * ny;
    if (impactSpeed > 0 && (playerNormal > 0 || enemyNormal < 0)) {
      if (playerNormal > 0) {
        player.vx -= 2 * playerNormal * nx;
        player.vy -= 2 * playerNormal * ny;
      }
      if (enemyNormal < 0) {
        enemy.vx -= 2 * enemyNormal * nx;
        enemy.vy -= 2 * enemyNormal * ny;
      }
      normalizeFighterVelocity(player);
      normalizeFighterVelocity(enemy);

      player.inContact = true;
      enemy.inContact = true;
      player.contactTime = 0.08;
      enemy.contactTime = 0.08;
      dom.battleStatus.textContent = "弹射共鸣中";

      addResonanceEnergy(player, 20);
      addResonanceEnergy(enemy, 20);
      spawnEnergyGain(player, 20);
      spawnEnergyGain(enemy, 20);
      const collisionDamage = 20;
      applyDamage(player, collisionDamage, enemy, "碰撞", {
        color: enemy.template.color,
        noEnergy: true,
        quiet: true,
        melee: true
      });
      if (state === "playing") {
        applyDamage(enemy, collisionDamage, player, "碰撞", {
          color: player.template.color,
          noEnergy: true,
          quiet: true,
          melee: true
        });
      }

      const contactX = player.x + nx * player.r;
      const contactY = player.y + ny * player.r;
      const impactColor = Math.random() < 0.5 ? player.template.color : enemy.template.color;
      collisionLock = 0;
      spawnBurst(contactX, contactY, impactColor, 10, 130 + impactSpeed * 0.08);
      announce("碰撞共鸣", impactColor, 0.7);
      effects.push({
        type: "impact",
        x: contactX,
        y: contactY,
        life: 0.24,
        maxLife: 0.24,
        radius: 17 + impactSpeed * 0.035,
        color: impactColor
      });
      screenShake = Math.min(6, 1.5 + impactSpeed * 0.006);
      playSound("hit");
    }
  }

  function pinBrantBigAnchorFighters() {
    getActiveFighters().forEach((fighter) => {
      if (!fighter || fighter.template.id !== "04" || !fighter.brantBigAnchorLock) return;
      fighter.x = ARENA_SIZE / 2;
      fighter.y = ARENA_SIZE / 2;
      fighter.vx = 0;
      fighter.vy = 0;
    });
  }

  function resolveMultiCollisions() {
    const fighters = getActiveFighters().filter((fighter) => fighter.hp > 0);
    fighters.forEach((fighter) => {
      fighter.inContact = false;
    });
    for (let i = 0; i < fighters.length; i += 1) {
      for (let j = i + 1; j < fighters.length; j += 1) {
        const first = fighters[i];
        const second = fighters[j];
        if (first.knockback || second.knockback) continue;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDistance = first.r + second.r;
        if (dist > minDistance + 2) continue;
        const nx = dx / dist;
        const ny = dy / dist;
        if (first.vortexLockTimer > 0 || second.vortexLockTimer > 0) {
          const moving = first.vortexLockTimer > 0 ? second : first;
          const locked = first.vortexLockTimer > 0 ? first : second;
          if (moving.vortexLockTimer <= 0 && dist < minDistance) {
            moving.x = locked.x + nx * minDistance * (moving === first ? -1 : 1);
            moving.y = locked.y + ny * minDistance * (moving === first ? -1 : 1);
          }
          first.inContact = true;
          second.inContact = true;
          continue;
        }
        const invDist = 1 / dist;
        const penetration = minDistance - dist;
        if (penetration > 0) {
          first.x -= nx * penetration * 0.5;
          first.y -= ny * penetration * 0.5;
          second.x += nx * penetration * 0.5;
          second.y += ny * penetration * 0.5;
        }
        const relativeX = first.vx - second.vx;
        const relativeY = first.vy - second.vy;
        const impactSpeed = Math.max(0, relativeX * nx + relativeY * ny);
        if (impactSpeed > 0) {
          const firstNormal = first.vx * nx + first.vy * ny;
          const secondNormal = second.vx * nx + second.vy * ny;
          if (firstNormal > 0) {
            first.vx -= 2 * firstNormal * nx;
            first.vy -= 2 * firstNormal * ny;
          }
          if (secondNormal < 0) {
            second.vx -= 2 * secondNormal * nx;
            second.vy -= 2 * secondNormal * ny;
          }
          normalizeFighterVelocity(first);
          normalizeFighterVelocity(second);
          first.inContact = true;
          second.inContact = true;
          if (collisionLock <= 0) {
            collisionLock = 0.12;
            addResonanceEnergy(first, 20);
            addResonanceEnergy(second, 20);
            spawnEnergyGain(first, 20);
            spawnEnergyGain(second, 20);
            applyDamage(first, 20, second, "碰撞", { color: second.template.color, noEnergy: true, quiet: true, melee: true });
            if (state === "playing") {
              applyDamage(second, 20, first, "碰撞", { color: first.template.color, noEnergy: true, quiet: true, melee: true });
            }
            const contactX = first.x + nx * first.r;
            const contactY = first.y + ny * first.r;
            spawnBurst(contactX, contactY, "#fff3bd", 8, 120);
            effects.push({ type: "impact", x: contactX, y: contactY, life: 0.2, maxLife: 0.2, radius: 15 + impactSpeed * 0.03, color: "#ffd86a" });
            screenShake = Math.min(6, 1.5 + impactSpeed * 0.005);
            playSound("hit");
          }
        }
      }
    }
  }

  function normalizeFighterVelocity(fighter) {
    const speed = Math.hypot(fighter.vx, fighter.vy) || 1;
    const targetSpeed = getEffectiveMoveSpeed(fighter);
    fighter.vx = (fighter.vx / speed) * targetSpeed;
    fighter.vy = (fighter.vy / speed) * targetSpeed;
  }

  function getEffectiveMoveSpeed(fighter) {
    if (fighter.template.id === "04" && fighter.brantBigAnchorLock) return 0;
    let baseSpeed = fighter.moveSpeed;
    if (fighter.template.id === "02" && fighter.abyssForm) baseSpeed = fighter.template.abyssFormSpeed * CELL_SIZE;
    let multiplier = fighter.frenzy > 0 ? 1.24 : 1;
    if (fighter.template.ultimateType === "autoThreshold" && fighter.overclock > 0) multiplier *= 2;
    if (fighter.timeForceTimer > 0) multiplier *= 1.3;
    if (fighter.timeSlowTimer > 0) multiplier *= 0.7;
    if (fighter.verinaSlowTimer > 0) multiplier *= 0.5;
    if (fighter.cantarellaSlowTimer > 0) multiplier *= fighter.template.mirageSlowMultiplier || 0.2;
    if (fighter.template.id === "04" && fighter.brantUltimateTimer > 0) multiplier *= 2;
    return baseSpeed * multiplier;
  }

  function getActionSpeed(fighter) {
    let multiplier = 1;
    if (fighter.timeForceTimer > 0) multiplier *= 1.3;
    if (fighter.timeSlowTimer > 0) multiplier *= 0.7;
    return multiplier;
  }

  function getEnergyEfficiency(fighter) {
    return fighter.template.ultimateType === "autoThreshold" && fighter.overclock > 0 ? 2 : 1;
  }

  function addResonanceEnergy(fighter, amount) {
    fighter.energy = Math.min(100, fighter.energy + amount * getEnergyEfficiency(fighter));
  }

  function updateCombat(dt) {
    const playerTarget = nearestOpponent(player) || enemy;
    const enemyTarget = nearestOpponent(enemy) || player;
    if (player.vortexLockTimer <= 0) updateWandererCombatState(player, playerTarget, dt);
    if (state !== "playing") return;
    if (enemy.vortexLockTimer <= 0) updateWandererCombatState(enemy, enemyTarget, dt);
    if (state !== "playing") return;
    handleAbility(player, playerTarget, dt);
    if (state !== "playing" || voicePauseActive) return;
    handleAbility(enemy, enemyTarget, dt);
    if (state !== "playing" || voicePauseActive) return;
    tryBasicAttack(player, playerTarget);
    if (state === "playing" && !voicePauseActive) tryBasicAttack(enemy, enemyTarget);
  }

  function updateCombatSingle(fighter, opponent, dt) {
    handleAbility(fighter, opponent, dt);
    if (state === "playing" && !voicePauseActive) tryBasicAttack(fighter, opponent);
  }

  function updateWandererCombatState(fighter, opponent, dt) {
    if (fighter.knifeCount <= 0) return;
    fighter.knifeAngle = (fighter.knifeAngle + (Math.PI * 2 / 3) * dt) % (Math.PI * 2);
    fighter.knifeHitLocks = fighter.knifeHitLocks.map((remaining) => Math.max(0, remaining - dt));
    if (state !== "playing") return;

    const orbitRadius = fighter.template.knifeOrbitRadius * CELL_SIZE;
    const targets = getDamageableUnits().filter((target) => target.side !== fighter.side && target.hp > 0);
    for (const target of targets) {
      const dx = target.x - fighter.x;
      const dy = target.y - fighter.y;
      const targetDistance = Math.hypot(dx, dy);
      if (Math.abs(targetDistance - orbitRadius) > target.r + CELL_SIZE * 0.42) continue;
      const targetAngle = Math.atan2(dy, dx);
      for (let index = 0; index < fighter.knifeCount; index += 1) {
        if ((fighter.knifeHitLocks[index] || 0) > 0) continue;
        const knifeAngle = fighter.knifeAngle + (index / fighter.knifeCount) * Math.PI * 2;
        const difference = Math.abs(Math.atan2(
          Math.sin(targetAngle - knifeAngle),
          Math.cos(targetAngle - knifeAngle)
        ));
        if (difference > 0.38) continue;
        fighter.knifeHitLocks[index] = 1.1;
        effects.push({
          type: "ring",
          x: target.x,
          y: target.y,
          radius: 8,
          growth: 320,
          life: 0.35,
          maxLife: 0.35,
          color: "#ffd76b",
          width: 5
        });
        spawnBurst(target.x, target.y, "#ffd76b", 18, 180);
        applySpecialDamage(target, fighter.template.knifeDamage, fighter, "时序飞刃", {
          color: "#ffd76b",
          noEnergy: true
        });
        if (state !== "playing" || target.hp <= 0) break;
      }
      if (state !== "playing") break;
    }
  }

  function updateTimeVortices(dt) {
    getActiveFighters().forEach((fighter) => {
      if (fighter.hp <= 0) return;
      for (const [vortexId, remaining] of fighter.vortexImmunity.entries()) {
        const next = remaining - dt;
        if (next <= 0) fighter.vortexImmunity.delete(vortexId);
        else fighter.vortexImmunity.set(vortexId, next);
      }
      if (!fighter.vortexLockId) return;
      const source = timeVortices.find((vortex) => vortex.id === fighter.vortexLockId);
      if (!source) {
        fighter.vortexLockId = null;
        fighter.vortexLockTimer = 0;
      } else {
        fighter.vortexLockTimer = source.life;
      }
    });

    for (let i = timeVortices.length - 1; i >= 0; i -= 1) {
      const vortex = timeVortices[i];
      vortex.life -= dt;
      if (vortex.life > 0) continue;
      getActiveFighters().forEach((fighter) => {
        if (fighter.vortexLockId === vortex.id) {
          fighter.vortexLockId = null;
          fighter.vortexLockTimer = 0;
          fighter.vortexImmunity.delete(vortex.id);
        }
      });
      timeVortices.splice(i, 1);
    }

    getActiveFighters().forEach((fighter) => {
      if (fighter.vortexLockId) return;
      const entered = timeVortices.find((vortex) => (
        vortex.owner !== fighter
        && !(fighter.vortexImmunity.get(vortex.id) > 0)
        && Math.hypot(fighter.x - vortex.x, fighter.y - vortex.y) <= vortex.radius
      ));
      if (entered) {
        fighter.vortexLockId = entered.id;
        fighter.vortexLockTimer = entered.life;
        announce(`${fighter.template.name} 被时间乱流定格`, "#ffd76b", 0.8);
        addLog(`${fighter.template.name} 进入时间乱流，暂时停止行动。`, "ability");
      }
    });
  }

  function addShield(fighter, amount, color = "#9bdc82") {
    if (!fighter || fighter.hp <= 0 || amount <= 0) return;
    fighter.shield = Math.min(9999, fighter.shield + amount);
    fighter.maxShield = Math.max(fighter.maxShield, fighter.shield);
    effects.push({
      type: "shield",
      fighter,
      life: 0.65,
      maxLife: 0.65,
      color
    });
    spawnDamageText(fighter.x, fighter.y - fighter.r, `${Math.round(amount)} 护盾`, color, true);
    spawnBurst(fighter.x, fighter.y, fighter.template.id === "04" ? "#9f508d" : color, 22, 190);
    if (fighter.template.id === "04") spawnBurst(fighter.x, fighter.y, "#e58d9d", 12, 125);
  }

  function spawnWindField(owner) {
    if (!owner || owner.hp <= 0 || owner.template.id !== "03") return;
    windFields.push({
      id: ++windSequence,
      owner,
      x: owner.x,
      y: owner.y,
      radius: owner.template.windFieldRadius * CELL_SIZE,
      life: owner.template.windFieldDuration,
      maxLife: owner.template.windFieldDuration,
      phase: random(0, Math.PI * 2),
      sparkClock: 0
    });
    effects.push({
      type: "ring",
      x: owner.x,
      y: owner.y,
      radius: 8,
      growth: 280,
      life: 0.65,
      maxLife: 0.65,
      color: "#b9f3a4",
      width: 5
    });
    announce(`${owner.template.name} · 风场展开`, "#c8f5b5", 0.9);
    addLog(`${owner.template.name} 在脚下展开半径 ${owner.template.windFieldRadius} 格的风场。`, "ability");
    playSound("windup");
  }

  function updateWindFields(dt) {
    for (let i = windFields.length - 1; i >= 0; i -= 1) {
      const field = windFields[i];
      if (!field.owner || field.owner.hp <= 0) {
        windFields.splice(i, 1);
        continue;
      }
      field.life = Math.max(0, field.life - dt);
      field.sparkClock -= dt;
      if (field.sparkClock <= 0) {
        field.sparkClock = 0.09;
        const angle = random(0, Math.PI * 2);
        const radius = random(field.radius * 0.2, field.radius * 0.9);
        particles.push({
          x: field.x + Math.cos(angle) * radius,
          y: field.y + Math.sin(angle) * radius,
          vx: -Math.cos(angle) * 30,
          vy: -Math.sin(angle) * 30,
          life: 0.35,
          maxLife: 0.35,
          size: random(1.2, 2.8),
          color: "#b9f3a4"
        });
      }

      if (field.life > 0) {
        getDamageableUnits().forEach((target) => {
          if (target === field.owner || target.side === field.owner.side || target.hp <= 0 || target.knockback) return;
          const dx = field.x - target.x;
          const dy = field.y - target.y;
          const dist = Math.hypot(dx, dy);
          if (dist <= 0 || dist > field.radius) return;
          const pull = Math.min(dist, field.owner.template.windFieldPullSpeed * CELL_SIZE * dt);
          target.x = clamp(target.x + (dx / dist) * pull, BOUNDARY + target.r, ARENA_SIZE - BOUNDARY - target.r);
          target.y = clamp(target.y + (dy / dist) * pull, BOUNDARY + target.r, ARENA_SIZE - BOUNDARY - target.r);
        });
        continue;
      }

      getDamageableUnits()
        .filter((target) => (
          target !== field.owner
          && target.side !== field.owner.side
          && target.hp > 0
          && Math.hypot(target.x - field.x, target.y - field.y) <= field.radius
        ))
        .forEach((target) => {
          applySpecialDamage(target, field.owner.template.windFieldDamage, field.owner, "风场爆裂", {
            color: "#b9f3a4",
            noEnergy: true
          });
        });

      if (Math.hypot(field.owner.x - field.x, field.owner.y - field.y) <= field.radius) {
        addShield(field.owner, field.owner.template.windFieldShield);
      }
      effects.push({
        type: "windBurst",
        x: field.x,
        y: field.y,
        radius: field.radius,
        life: 0.7,
        maxLife: 0.7,
        color: "#b9f3a4"
      });
      spawnBurst(field.x, field.y, "#d8ffca", 44, 340);
      screenShake = Math.max(screenShake, 8);
      announce(`${field.owner.template.name} · 风场爆裂`, "#d8ffca", 1);
      addLog(`${field.owner.template.name} 的风场爆炸，造成 ${field.owner.template.windFieldDamage} 点范围伤害。`, "ability");
      playSound("wind");
      windFields.splice(i, 1);
    }
  }

  function startJianxinCharge(fighter) {
    if (!fighter || fighter.template.id !== "03" || fighter.charge || fighter.hp <= 0) return false;
    const shieldPath = fighter.shield > 0 && fighter.hp > 300;
    const sourceSpeed = Math.hypot(fighter.vx, fighter.vy);
    const fallbackAngle = random(0, Math.PI * 2);
    fighter.charge = {
      timer: fighter.template.chargeDuration,
      maxTimer: fighter.template.chargeDuration,
      shieldPath,
      resumeX: sourceSpeed > 0.01 ? fighter.vx / sourceSpeed : Math.cos(fallbackAngle),
      resumeY: sourceSpeed > 0.01 ? fighter.vy / sourceSpeed : Math.sin(fallbackAngle)
    };
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.attackClock = Math.max(fighter.attackClock, fighter.template.chargeDuration);

    if (shieldPath) {
      fighter.hp = Math.max(1, fighter.hp - fighter.template.ultimateShieldCost);
      fighter.shield += fighter.template.ultimateShieldGain;
      fighter.maxShield = Math.max(fighter.maxShield, fighter.shield);
      spawnDamageText(fighter.x, fighter.y - fighter.r, `−${fighter.template.ultimateShieldCost} 生命`, "#ff9b9b");
      effects.push({
        type: "shield",
        fighter,
        life: 0.7,
        maxLife: 0.7,
        color: "#d8ffca"
      });
      announce(`${fighter.template.name} · 生命化为风障`, "#e5ffd9", 1);
      addLog(`${fighter.template.name} 消耗 ${fighter.template.ultimateShieldCost} 生命，将护盾提升至 ${Math.round(fighter.shield)}。`, "ability");
    } else {
      announce(`${fighter.template.name} · 风障蓄势`, "#d8ffca", 1);
      addLog(`${fighter.template.name} 开始蓄力，3 秒后获得 ${fighter.template.alternateShield} 点护盾。`, "ability");
    }
    effects.push({
      type: "windCharge",
      fighter,
      life: fighter.template.chargeDuration,
      maxLife: fighter.template.chargeDuration,
      color: "#b9f3a4"
    });
    playSound("windup");
    return true;
  }

  function restoreChargeMovement(fighter, charge) {
    if (!fighter || !charge) return;
    const speed = getEffectiveMoveSpeed(fighter);
    fighter.vx = charge.resumeX * speed;
    fighter.vy = charge.resumeY * speed;
  }

  function resolveJianxinCharge(fighter) {
    const charge = fighter.charge;
    fighter.charge = null;
    if (!charge || fighter.hp <= 0 || state !== "playing") return;
    restoreChargeMovement(fighter, charge);
    if (!charge.shieldPath) {
      addShield(fighter, fighter.template.alternateShield);
      announce(`${fighter.template.name} · 风障凝成`, "#d8ffca", 1.2);
      addLog(`${fighter.template.name} 蓄力完成，获得 ${fighter.template.alternateShield} 点护盾。`, "ability");
      return;
    }

    const clearedShield = fighter.shield;
    fighter.shield = 0;
    effects.push({
      type: "shieldBreak",
      x: fighter.x,
      y: fighter.y,
      radius: fighter.r + 18,
      life: 0.65,
      maxLife: 0.65,
      color: "#b9f3a4"
    });
    spawnBurst(fighter.x, fighter.y, "#d8ffca", 52, 360);
    const target = nearestOpponent(fighter);
    const angle = target
      ? Math.atan2(target.y - fighter.y, target.x - fighter.x)
      : Math.atan2(fighter.vy, fighter.vx) || random(0, Math.PI * 2);
    const waveLife = Math.max(2.6, (ARENA_SIZE - BOUNDARY * 2) / (fighter.template.windWaveSpeed * CELL_SIZE) + 0.8);
    windWaves.push({
      id: ++windSequence,
      owner: fighter,
      x: fighter.x + Math.cos(angle) * (fighter.r + 14),
      y: fighter.y + Math.sin(angle) * (fighter.r + 14),
      angle,
      radius: fighter.template.windWaveRadius * CELL_SIZE,
      speed: fighter.template.windWaveSpeed * CELL_SIZE,
      damage: clearedShield,
      clearedShield,
      life: waveLife,
      maxLife: waveLife,
      hitIds: new Set(),
      stun: fighter.template.windWaveStun
    });
    effects.push({
      type: "ring",
      x: fighter.x,
      y: fighter.y,
      radius: 12,
      growth: 720,
      life: 0.7,
      maxLife: 0.7,
      color: "#d8ffca",
      width: 11
    });
    announce(`${fighter.template.name} · 涤罪心渊`, "#eaffdf", 1.35);
    addLog(`${fighter.template.name} 清空 ${Math.round(clearedShield)} 点护盾，打出等量 ${Math.round(clearedShield)} 点伤害的弧形风波。`, "ability");
    playSound("wind");
  }

  function startWindKnockback(target, angle, stunDuration, travelSpeed) {
    if (!target || target.hp <= 0) return;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    const minX = BOUNDARY + target.r;
    const maxX = ARENA_SIZE - BOUNDARY - target.r;
    const minY = BOUNDARY + target.r;
    const maxY = ARENA_SIZE - BOUNDARY - target.r;
    const distanceX = Math.abs(nx) < 0.001
      ? Infinity
      : (nx > 0 ? maxX - target.x : target.x - minX) / Math.abs(nx);
    const distanceY = Math.abs(ny) < 0.001
      ? Infinity
      : (ny > 0 ? maxY - target.y : target.y - minY) / Math.abs(ny);
    const pushDistance = Math.max(0, Math.min(distanceX, distanceY));
    const pushSpeed = Math.max(1, travelSpeed || 0);
    const duration = Math.max(0.12, pushDistance / pushSpeed);
    const interruptedCharge = target.charge;
    const resumeSpeed = Math.hypot(target.vx, target.vy);
    const resumeX = interruptedCharge?.resumeX ?? (resumeSpeed > 0 ? target.vx / resumeSpeed : nx);
    const resumeY = interruptedCharge?.resumeY ?? (resumeSpeed > 0 ? target.vy / resumeSpeed : ny);
    target.charge = null;
    target.knockback = {
      vx: nx * pushSpeed,
      vy: ny * pushSpeed,
      timer: duration,
      stun: stunDuration,
      resumeX,
      resumeY
    };
    target.vx = 0;
    target.vy = 0;
    releaseVortexLock(target, true);
  }

  function getWindWaveArcGeometry(wave) {
    return {
      centerOffset: -wave.radius,
      radius: wave.radius,
      halfAngle: 1.12
    };
  }

  function isWindWaveContact(wave, target, dt) {
    const nx = Math.cos(wave.angle);
    const ny = Math.sin(wave.angle);
    const dx = target.x - wave.x;
    const dy = target.y - wave.y;
    const along = dx * nx + dy * ny;
    const side = Math.abs(-dx * ny + dy * nx);
    const arc = getWindWaveArcGeometry(wave);
    if (side > arc.radius + target.r * 0.2) return false;
    const surfaceAlong = arc.centerOffset + Math.sqrt(Math.max(0, arc.radius * arc.radius - side * side));
    const frameTravel = wave.speed * dt;
    const contactTolerance = target.r + frameTravel + 2;
    return Math.abs(along - surfaceAlong) <= contactTolerance;
  }

  function updateWindWaves(dt) {
    for (let i = windWaves.length - 1; i >= 0; i -= 1) {
      const wave = windWaves[i];
      wave.life -= dt;
      wave.x += Math.cos(wave.angle) * wave.speed * dt;
      wave.y += Math.sin(wave.angle) * wave.speed * dt;
      getDamageableUnits().forEach((target) => {
        if (
          target.side === wave.owner.side
          || target.hp <= 0
          || wave.hitIds.has(target)
          || !isWindWaveContact(wave, target, dt)
        ) return;
        wave.hitIds.add(target);
        if (wave.damage > 0) {
          applySpecialDamage(target, wave.damage, wave.owner, "弧形风波", {
            color: "#d8ffca",
            noEnergy: true
          });
        }
        if (target.hp > 0) {
          startWindKnockback(target, wave.angle, wave.stun, wave.speed);
          announce(`${target.template.name} 被风波击退并眩晕`, "#d8ffca", 0.9);
          addLog(`${target.template.name} 被涤罪心渊击退至墙边，眩晕 1 秒。`, "ability");
        }
      });
      if (wave.life <= 0) windWaves.splice(i, 1);
    }
  }

  function spawnTimeVortex(owner) {
    const radius = CELL_SIZE * 3.5;
    let x = BOUNDARY + radius;
    let y = BOUNDARY + radius;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      x = random(BOUNDARY + radius, ARENA_SIZE - BOUNDARY - radius);
      y = random(BOUNDARY + radius, ARENA_SIZE - BOUNDARY - radius);
      if (getActiveFighters().every((fighter) => Math.hypot(x - fighter.x, y - fighter.y) > radius * 1.7)) break;
    }
    if (timeVortices.length >= 3) {
      const removed = timeVortices.shift();
      getActiveFighters().forEach((fighter) => {
        if (fighter.vortexLockId === removed.id) {
          fighter.vortexLockId = null;
          fighter.vortexLockTimer = 0;
          fighter.vortexImmunity.delete(removed.id);
        }
      });
    }
    timeVortices.push({
      id: ++vortexSequence,
      owner,
      x,
      y,
      radius,
      life: 15,
      maxLife: 15,
      phase: random(0, Math.PI * 2)
    });
    effects.push({ type: "ring", x, y, radius: 6, growth: 260, life: 0.6, maxLife: 0.6, color: "#ffd76b", width: 5 });
    addLog("地图中出现了持续 15 秒的时间乱流。", "ability");
    playSound("timeStop");
  }

  function releaseVortexLock(target, attacked = false) {
    if (!target?.vortexLockId) return;
    const vortexId = target.vortexLockId;
    target.vortexLockId = null;
    target.vortexLockTimer = 0;
    if (attacked) {
      target.vortexImmunity.set(vortexId, 3);
      announce(`${target.template.name} 脱离时间乱流`, "#ffe49a", 0.7);
    }
  }

  function addWandererKnife(fighter, opponent) {
    if (fighter.knifeCount === 0) {
      fighter.knifeAngle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x) - Math.PI * 0.55;
    }
    fighter.knifeCount += 1;
    fighter.knifeHitLocks.push(0);
    effects.push({
      type: "ring",
      x: fighter.x,
      y: fighter.y,
      radius: 8,
      growth: 360,
      life: 0.45,
      maxLife: 0.45,
      color: "#ffd76b",
      width: 4
    });
    announce(`${fighter.template.name} · 时序飞刃 ×${fighter.knifeCount}`, "#ffd76b", 0.85);
    addLog(
      `${fighter.template.name} ${fighter.knifeCount === 1 ? "永久召唤第一柄" : `增加第 ${fighter.knifeCount} 柄`}时序飞刃。`,
      "ability"
    );
    playSound("blade");
  }

  function gainWandererSpecialEnergy(fighter, opponent) {
    const previous = fighter.specialEnergy;
    fighter.specialEnergy = Math.min(3, fighter.specialEnergy + 1);
    if (previous < 1 && fighter.specialEnergy >= 1) addWandererKnife(fighter, opponent);
    if (previous < 2 && fighter.specialEnergy >= 2) {
      fighter.timeForceTimer = 5;
      opponent.timeSlowTimer = 5;
      effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 10, growth: 660, life: 0.65, maxLife: 0.65, color: "#ffd76b", width: 9 });
      spawnBurst(fighter.x, fighter.y, "#ffe7a0", 30, 240);
      announce(`${fighter.template.name} · 时序之力`, "#ffd76b", 1.1);
      addLog(`${fighter.template.name} 加速自身 30%，减缓对手 30%。`, "ability");
      playSound("lightning");
    }
    if (previous < 3 && fighter.specialEnergy >= 3) {
      fighter.specialEnergy = 0;
      spawnTimeVortex(fighter);
    }
  }

  function gainAbyssEnergy(fighter, amount) {
    if (fighter.template.id !== "02" || fighter.hp <= 0) return;
    fighter.abyssEnergy = Math.min(fighter.template.abyssThreshold, fighter.abyssEnergy + amount);
    if (!fighter.abyssForm && fighter.abyssEnergy >= fighter.template.abyssThreshold) {
      enterAbyssForm(fighter);
    }
  }

  function enterAbyssForm(fighter) {
    if (fighter.abyssForm) return;
    fighter.abyssForm = true;
    fighter.abyssEnergy = fighter.template.abyssThreshold;
    fighter.abyssLifeClock = 1;
    fighter.attackClock = Math.min(fighter.attackClock, 0.25);
    effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 14, growth: 720, life: 0.7, maxLife: 0.7, color: "#b565ff", width: 10 });
    spawnBurst(fighter.x, fighter.y, "#c981ff", 42, 320);
    announce(`${fighter.template.name} · 恐怖镰刀人`, "#d7a4ff", 1.35);
    addLog(`${fighter.template.name} 暗涌达到 100，进入恐怖镰刀人形态。`, "ability");
    playSound("timeStop");
    if (fighter === player) updateAbilityControlLabel();
  }

  function exitAbyssForm(fighter) {
    if (!fighter.abyssForm) return;
    fighter.abyssForm = false;
    fighter.abyssHoming = false;
    fighter.abyssEnergy = 0;
    fighter.abyssScytheSwing = 0;
    announce(`${fighter.template.name} · 暗涌耗尽`, "#a88cbc", 1);
    addLog(`${fighter.template.name} 暗涌耗尽，退出恐怖镰刀人形态。`, "system");
    if (fighter === player) updateAbilityControlLabel();
  }

  function restoreAbyssTrajectory(fighter) {
    if (!fighter.abyssHoming) return;
    fighter.abyssHoming = false;
    const savedSpeed = Math.hypot(fighter.abyssSavedVx, fighter.abyssSavedVy);
    if (savedSpeed > 0.01) {
      const speed = getEffectiveMoveSpeed(fighter);
      fighter.vx = (fighter.abyssSavedVx / savedSpeed) * speed;
      fighter.vy = (fighter.abyssSavedVy / savedSpeed) * speed;
    }
  }

  function activateAbyssHoming(fighter) {
    if (!fighter.abyssForm || fighter.abyssHoming) return;
    fighter.abyssHoming = true;
    fighter.abyssSavedVx = fighter.vx;
    fighter.abyssSavedVy = fighter.vy;
  }

  function healAbyssDamage(fighter, damage) {
    if (!fighter.abyssForm || damage <= 0) return;
    const heal = Math.min(fighter.maxHp - fighter.hp, damage * fighter.template.abyssHitHealRatio);
    if (heal <= 0) return;
    fighter.hp = Math.min(fighter.maxHp, fighter.hp + heal);
    spawnDamageText(fighter.x, fighter.y - fighter.r, `+${Math.round(heal)}`, "#d9a3ff", true);
  }

  function performAbyssSweep(fighter, opponent) {
    playAttackVoice(fighter);
    fighter.abyssScytheSwing = 0.34;
    fighter.thrustAngle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x);
    const dealt = applyDamage(opponent, fighter.template.abyssScytheDamage, fighter, "暗涌镰刀", {
      color: "#c477ff"
    }) || 0;
    healAbyssDamage(fighter, dealt);
    releaseVortexLock(opponent, true);
    restoreAbyssTrajectory(fighter);
    effects.push({
      type: "abyssSlash",
      fighter,
      angle: fighter.thrustAngle,
      radius: fighter.template.abyssScytheRange * CELL_SIZE,
      life: 0.38,
      maxLife: 0.38,
      color: "#b65dff"
    });
    spawnBurst(opponent.x, opponent.y, "#c477ff", 20, 220);
    addLog(`${fighter.template.name} 挥出暗紫镰刀，造成 ${Math.round(dealt)} 点伤害并恢复生命。`, "ability");
    playSound("sword");
  }

  function updateSummons(dt) {
    summonUnits.forEach((unit) => {
      unit.fireClock -= dt;
      unit.x += unit.vx * dt;
      unit.y += unit.vy * dt;
      const minX = BOUNDARY + 22;
      const maxX = ARENA_SIZE - BOUNDARY - 22;
      const minY = BOUNDARY + 28;
      const maxY = ARENA_SIZE - BOUNDARY - 28;
      if (unit.x < minX || unit.x > maxX) {
        unit.x = clamp(unit.x, minX, maxX);
        unit.vx *= -1;
      }
      if (unit.y < minY || unit.y > maxY) {
        unit.y = clamp(unit.y, minY, maxY);
        unit.vy *= -1;
      }
      if (unit.fireClock <= 0 && unit.owner.hp > 0) {
        unit.fireClock = unit.owner.template.summonInterval;
        const target = nearestOpponent(unit.owner);
        if (target) launchWhiteSheepFireball(unit, target);
      }
    });
    updateCraters(dt);
  }

  function setupVerinaPlants() {
    getActiveFighters().forEach((fighter) => {
      if (fighter.template.id === "06") {
        spawnVerinaPlant(fighter, ARENA_SIZE / 2, ARENA_SIZE / 2, true);
      }
    });
  }

  function spawnVerinaPlant(owner, x, y, atCenter = false) {
    if (!owner || owner.hp <= 0 || owner.template.id !== "06") return;
    const plant = {
      id: ++verinaPlantSequence,
      owner,
      x,
      y,
      radius: owner.template.verinaFieldRadius * CELL_SIZE,
      tickClock: owner.template.verinaTickInterval,
      displayClock: 0,
      atCenter,
      isVine: false,
      phase: random(0, Math.PI * 2)
    };
    verinaPlants.push(plant);
    effects.push({
      type: "ring",
      x,
      y,
      radius: 5,
      growth: 220,
      life: 0.55,
      maxLife: 0.55,
      color: "#d9ef7d",
      width: 4
    });
    spawnBurst(x, y, "#d9ef7d", 16, 120);
    addLog(`${owner.template.name} 种下一颗芽（${verinaPlants.filter((item) => item.owner === owner).length}/6）。`, "ability");
    const ownerPlants = verinaPlants.filter((item) => item.owner === owner);
    if (ownerPlants.length >= owner.template.verinaSproutsForVine) {
      growVerinaVine(owner);
    }
  }

  function growVerinaVine(owner) {
    const centerPlant = verinaPlants.find((plant) => plant.owner === owner && plant.atCenter && !plant.isVine);
    if (!centerPlant) return;
    centerPlant.isVine = true;
    centerPlant.tickClock = owner.template.vineTickInterval;
    effects.push({
      type: "vineBloom",
      x: centerPlant.x,
      y: centerPlant.y,
      radius: CELL_SIZE * 8,
      life: 1.1,
      maxLife: 1.1,
      color: "#d7e76d"
    });
    spawnBurst(centerPlant.x, centerPlant.y, "#f1ff9f", 64, 390);
    announce(`${owner.template.name} · 藤蔓复苏`, "#eaff9d", 1.4);
    addLog(`${owner.template.name} 的第 6 颗芽已出现，中场嫩芽成长为藤。`, "ability");
    screenShake = Math.max(screenShake, 9);
    playSound("lightning");
  }

  function hasVerinaVine(owner) {
    return verinaPlants.some((plant) => plant.owner === owner && plant.isVine);
  }

  function updateVerinaPlants(dt) {
    for (let i = verinaPlants.length - 1; i >= 0; i -= 1) {
      const plant = verinaPlants[i];
      if (!plant.owner || plant.owner.hp <= 0) {
        verinaPlants.splice(i, 1);
        continue;
      }
      plant.displayClock += dt;
      plant.tickClock -= dt;
      if (plant.tickClock > 0 || state !== "playing") continue;
      plant.tickClock += plant.isVine
        ? plant.owner.template.vineTickInterval
        : plant.owner.template.verinaTickInterval;

      if (plant.isVine) {
        getDamageableUnits()
          .filter((target) => target.side !== plant.owner.side && target.hp > 0)
          .forEach((target) => {
            target.verinaSlowTimer = Math.max(target.verinaSlowTimer, plant.owner.template.vineTickInterval * 3);
            applySpecialDamage(target, plant.owner.maxHp / plant.owner.template.vineDamageDivisor, plant.owner, "藤蔓侵蚀", {
              color: "#d7e76d",
              noEnergy: true,
              quiet: true,
              noText: true
            });
          });
        continue;
      }

      const feedbackDue = plant.displayClock >= 0.5;
      if (feedbackDue) plant.displayClock = 0;
      let ownerInside = false;
      let ownerHealed = 0;
      const damagedTargets = [];
      getDamageableUnits().forEach((target) => {
        if (
          target.hp <= 0
          || Math.hypot(target.x - plant.x, target.y - plant.y) > plant.radius + target.r
        ) return;
        if (target === plant.owner) {
          const healed = Math.min(target.maxHp - target.hp, plant.owner.template.verinaHealPerTick);
          target.hp = Math.min(target.maxHp, target.hp + plant.owner.template.verinaHealPerTick);
          if (healed > 0) {
            ownerInside = true;
            ownerHealed += healed;
          }
        } else if (target.side !== plant.owner.side) {
          applySpecialDamage(target, plant.owner.template.verinaDamagePerTick, plant.owner, "嫩芽灼伤", {
            color: "#d9ef7d",
            noEnergy: true,
            quiet: true,
            noText: true
          });
          if (target.hp > 0) damagedTargets.push(target);
        }
      });
      if (feedbackDue) {
        effects.push({
          type: "ring",
          x: plant.x,
          y: plant.y,
          radius: plant.radius,
          growth: 18,
          life: 0.3,
          maxLife: 0.3,
          color: "#d9ef7d",
          width: 2
        });
        if (ownerInside && ownerHealed > 0) {
          spawnDamageText(plant.owner.x, plant.owner.y - plant.owner.r, `+${Math.ceil(ownerHealed)}`, "#d9ef7d", true);
        }
        damagedTargets.forEach((target) => {
          spawnDamageText(target.x, target.y - target.r, 10, "#d9ef7d");
        });
      }
    }
  }

  function getBrantChestInterval(fighter) {
    return fighter.brantUltimateTimer > 0
      ? fighter.template.brantChestInterval / fighter.template.brantTreasureSpeedMultiplier
      : fighter.template.brantChestInterval;
  }

  function spawnBrantChest(owner) {
    if (!owner || owner.hp <= 0 || owner.template.id !== "04") return;
    if (brantChests.filter((chest) => chest.owner === owner).length >= owner.template.brantChestLimit) return;
    let x = random(BOUNDARY + CELL_SIZE * 2, ARENA_SIZE - BOUNDARY - CELL_SIZE * 2);
    let y = random(BOUNDARY + CELL_SIZE * 2, ARENA_SIZE - BOUNDARY - CELL_SIZE * 2);
    for (let attempt = 0; attempt < 16; attempt += 1) {
      if (getActiveFighters().every((fighter) => Math.hypot(fighter.x - x, fighter.y - y) > CELL_SIZE * 2)) break;
      x = random(BOUNDARY + CELL_SIZE * 2, ARENA_SIZE - BOUNDARY - CELL_SIZE * 2);
      y = random(BOUNDARY + CELL_SIZE * 2, ARENA_SIZE - BOUNDARY - CELL_SIZE * 2);
    }
    brantChests.push({
      id: ++brantSequence,
      owner,
      x,
      y,
      r: CELL_SIZE,
      life: owner.template.brantChestDuration,
      maxLife: owner.template.brantChestDuration,
      phase: random(0, Math.PI * 2)
    });
    effects.push({ type: "ring", x, y, radius: 6, growth: 190, life: 0.5, maxLife: 0.5, color: "#d7749b", width: 3 });
    addLog("布兰特团子的宝箱在赛场中出现了。", "item");
    playSound("pickup");
  }

  function gainBrantSpecialEnergy(fighter, amount) {
    if (!fighter || fighter.template.id !== "04" || fighter.hp <= 0 || fighter.brantAirborneTimer > 0) return;
    const previous = fighter.brantSpecialEnergy;
    fighter.brantSpecialEnergy = Math.min(fighter.template.brantSpecialMax, fighter.brantSpecialEnergy + amount);
    if (fighter.brantSpecialEnergy > previous) {
      spawnDamageText(fighter.x, fighter.y - fighter.r, `+${amount} 船锚`, "#d7749b", true);
    }
    if (previous < fighter.template.brantSpecialMax && fighter.brantSpecialEnergy >= fighter.template.brantSpecialMax) {
      startBrantAirborne(fighter);
    }
  }

  function startBrantAirborne(fighter) {
    fighter.brantSpecialEnergy = 0;
    fighter.brantAirborneTimer = fighter.template.brantAirborneDuration;
    fighter.flash = 1;
    effects.push({ type: "brantAirborne", fighter, life: 0.7, maxLife: 0.7, color: "#d3658f" });
    spawnBurst(fighter.x, fighter.y, "#e58ab0", 34, 250);
    announce(`${fighter.template.name} · 绳索巡航`, "#efa0c1", 1.2);
    addLog(
      `${fighter.template.name} 登上绳索，8 秒内获得 ${Math.round(fighter.template.brantAirborneDodgeChance * 100)}% 闪避率。`,
      "ability"
    );
    playSound("blade");
  }

  function finishBrantAirborne(fighter) {
    const previousSpeed = Math.hypot(fighter.vx, fighter.vy);
    const fallbackAngle = random(0, Math.PI * 2);
    fighter.brantBigAnchorResumeX = previousSpeed > 0 ? fighter.vx / previousSpeed : Math.cos(fallbackAngle);
    fighter.brantBigAnchorResumeY = previousSpeed > 0 ? fighter.vy / previousSpeed : Math.sin(fallbackAngle);
    fighter.brantAirborneTimer = 0;
    fighter.brantBigAnchorLock = true;
    fighter.x = ARENA_SIZE / 2;
    fighter.y = ARENA_SIZE / 2;
    fighter.vx = 0;
    fighter.vy = 0;
    spawnBrantAnchor(fighter, ARENA_SIZE / 2, ARENA_SIZE / 2, "big", 0.25);
    announce(`${fighter.template.name} · 大船锚坠落`, "#ef9aba", 1.2);
    addLog(`${fighter.template.name} 瞬移至中场并进入落锚定身，大船锚落地后恢复移动。`, "ability");
  }

  function spawnBrantAnchor(owner, x, y, kind, windup) {
    brantAnchors.push({
      id: ++brantSequence,
      owner,
      x,
      y,
      kind,
      timer: windup,
      maxTimer: Math.max(0.001, windup),
      angle: random(0, Math.PI * 2),
      phase: random(0, Math.PI * 2)
    });
  }

  function resolveBrantAnchor(anchor) {
    const isBig = anchor.kind === "big";
    if (isBig && anchor.owner?.brantBigAnchorLock) {
      const owner = anchor.owner;
      owner.brantBigAnchorLock = false;
      const directionLength = Math.hypot(owner.brantBigAnchorResumeX, owner.brantBigAnchorResumeY) || 1;
      const resumeSpeed = getEffectiveMoveSpeed(owner);
      owner.vx = (owner.brantBigAnchorResumeX / directionLength) * resumeSpeed;
      owner.vy = (owner.brantBigAnchorResumeY / directionLength) * resumeSpeed;
    }
    if (!anchor.owner || anchor.owner.hp <= 0) return;
    const radiusX = (isBig ? anchor.owner.template.brantBigRadiusX : anchor.owner.template.brantSmallRadiusX) * CELL_SIZE;
    const radiusY = (isBig ? anchor.owner.template.brantBigRadiusY : anchor.owner.template.brantSmallRadiusY) * CELL_SIZE;
    const cos = Math.cos(anchor.angle);
    const sin = Math.sin(anchor.angle);
    let hitAny = false;
    getDamageableUnits()
      .filter((target) => target.side !== anchor.owner.side && target.hp > 0)
      .forEach((target) => {
        const dx = target.x - anchor.x;
        const dy = target.y - anchor.y;
        const localX = dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;
        if ((localX * localX) / (radiusX * radiusX) + (localY * localY) / (radiusY * radiusY) > 1) return;
        hitAny = true;
        applySpecialDamage(target, anchor.owner.template.brantAnchorDamage, anchor.owner, isBig ? "大船锚" : "火焰船锚", {
          color: isBig ? "#ef7da5" : "#d95d86",
          noEnergy: true
        });
        spawnBurst(target.x, target.y, "#df6f96", isBig ? 34 : 22, isBig ? 300 : 220);
      });
    if (!isBig && hitAny) gainBrantSpecialEnergy(anchor.owner, anchor.owner.template.brantAnchorEnergy);
    effects.push({
      type: "brantAnchorImpact",
      x: anchor.x,
      y: anchor.y,
      radiusX,
      radiusY,
      angle: anchor.angle,
      life: 0.72,
      maxLife: 0.72,
      color: isBig ? "#ef7da5" : "#d95d86"
    });
    screenShake = Math.max(screenShake, isBig ? 12 : 7);
    playSound("abyss");
    addLog(`${anchor.owner.template.name} 的${isBig ? "大船锚" : "火焰船锚"}命中${hitAny ? "敌人" : "空地"}。`, "ability");
  }

  function updateBrantSystem(dt) {
    const brantAirborneDt = dt / Math.max(0.01, gameSpeed);
    const brants = getActiveFighters().filter((fighter) => fighter.template.id === "04" && fighter.hp > 0);
    brants.forEach((fighter) => {
      if (fighter.brantUltimateTimer > 0) {
        fighter.brantUltimateTimer = Math.max(0, fighter.brantUltimateTimer - dt);
        if (fighter.brantUltimateTimer === 0) {
          announce(`${fighter.template.name} 共鸣解放结束`, "#d7749b", 1);
        }
      }
      fighter.brantChestClock -= dt;
      if (fighter.brantChestClock <= 0) {
        spawnBrantChest(fighter);
        fighter.brantChestClock = getBrantChestInterval(fighter);
      }
      if (fighter.brantAirborneTimer > 0) {
        fighter.brantAirborneTimer = Math.max(0, fighter.brantAirborneTimer - brantAirborneDt);
        if (fighter.brantAirborneTimer === 0) finishBrantAirborne(fighter);
      }
    });

    for (let i = brantChests.length - 1; i >= 0; i -= 1) {
      const chest = brantChests[i];
      chest.life -= dt;
      const owner = chest.owner;
      const picked = owner
        && owner.hp > 0
        && distance(owner, chest) <= chest.r + owner.r * 0.25;
      if (picked && state === "playing") {
        addShield(owner, owner.template.brantPickupShield, "#d7749b");
        gainBrantSpecialEnergy(owner, owner.template.brantPickupEnergy);
        spawnBrantAnchor(owner, chest.x, chest.y, "small", owner.template.brantAnchorWindup);
        announce(`${owner.template.name} · 宝箱开启`, "#ef9aba", 0.8);
        addLog(`${owner.template.name} 获取宝箱，获得 ${owner.template.brantPickupShield} 护盾并召唤火焰船锚。`, "item");
        spawnBurst(chest.x, chest.y, "#e38cb1", 24, 210);
        playSound("pickup");
      }
      if (picked || chest.life <= 0 || (owner && owner.hp <= 0)) brantChests.splice(i, 1);
    }

    for (let i = brantAnchors.length - 1; i >= 0; i -= 1) {
      const anchor = brantAnchors[i];
      anchor.timer -= dt;
      if (anchor.timer > 0) continue;
      resolveBrantAnchor(anchor);
      brantAnchors.splice(i, 1);
    }
  }

  function setupCantarellaJellies() {
    getActiveFighters().forEach((owner) => {
      if (owner.template.id !== "05") return;
      owner.cantarellaJellyDeaths = 0;
      for (let index = 0; index < owner.template.jellyStartingCount; index += 1) {
        spawnCantarellaJelly(owner, index);
      }
    });
  }

  function spawnCantarellaJelly(owner, initialIndex = null) {
    if (!owner || owner.hp <= 0 || owner.template.id !== "05") return;
    const angle = initialIndex === null
      ? random(0, Math.PI * 2)
      : -Math.PI / 2 + initialIndex * Math.PI * 2 / owner.template.jellyStartingCount;
    const orbit = CELL_SIZE * (initialIndex === null ? random(1.8, 3.2) : 2.2);
    const x = clamp(owner.x + Math.cos(angle) * orbit, BOUNDARY + 12, ARENA_SIZE - BOUNDARY - 12);
    const y = clamp(owner.y + Math.sin(angle) * orbit, BOUNDARY + 12, ARENA_SIZE - BOUNDARY - 12);
    const id = ++cantarellaSequence;
    cantarellaJellies.push({
      id,
      isJellyfish: true,
      owner,
      side: owner.side,
      x,
      y,
      vx: 0,
      vy: 0,
      r: owner.template.jellyRadius,
      hp: owner.template.jellyHp,
      maxHp: owner.template.jellyHp,
      shield: 0,
      maxShield: 1,
      energy: 0,
      attackClock: random(0.35, 1.2),
      attackAngle: angle,
      flash: 0,
      stunned: 0,
      freeze: 0,
      paralyzed: 0,
      vortexLockTimer: 0,
      knockback: null,
      cantarellaSlowTimer: 0,
      cantarellaDreamed: false,
      defeated: false,
      phase: random(0, Math.PI * 2),
      template: {
        id: `cantarella-jelly-${id}`,
        name: "巡游水母",
        color: "#b88cff",
        dark: "#3d2869",
        attackType: "melee",
        attackRange: owner.template.jellyAttackRange
      }
    });
    effects.push({
      type: "ring",
      x,
      y,
      radius: 4,
      growth: 150,
      life: 0.42,
      maxLife: 0.42,
      color: "#b88cff",
      width: 3
    });
    spawnBurst(x, y, "#c79cff", 12, 110);
  }

  function performCantarellaJellyAttack(unit, target) {
    const owner = unit.owner;
    if (!owner || owner.hp <= 0 || !target || target.hp <= 0) return;
    unit.attackClock = owner.template.jellyAttackCooldown;
    unit.attackAngle = Math.atan2(target.y - unit.y, target.x - unit.x);
    const range = owner.template.jellyAttackRange * CELL_SIZE;
    effects.push({
      type: "jellySlash",
      x: unit.x,
      y: unit.y,
      angle: unit.attackAngle,
      radius: range,
      life: 0.34,
      maxLife: 0.34,
      color: "#c38fff"
    });
    getDamageableUnits()
      .filter((candidate) => {
        if (candidate.hp <= 0 || candidate.side === unit.side) return false;
        const dx = candidate.x - unit.x;
        const dy = candidate.y - unit.y;
        const dist = Math.hypot(dx, dy);
        if (dist > range + candidate.r * 0.15) return false;
        const relative = Math.atan2(
          Math.sin(Math.atan2(dy, dx) - unit.attackAngle),
          Math.cos(Math.atan2(dy, dx) - unit.attackAngle)
        );
        return Math.abs(relative) <= Math.PI / 2;
      })
      .forEach((candidate) => {
        applyDamage(candidate, owner.template.jellyAttackDamage, owner, "水母半圆击", {
          color: "#c38fff",
          melee: true,
          noEnergy: true
        });
        spawnBurst(candidate.x, candidate.y, "#c38fff", 8, 120);
      });
    playSound("wind");
  }

  function updateCantarellaSystem(dt) {
    const owners = getActiveFighters().filter((fighter) => fighter.template.id === "05" && fighter.hp > 0);
    owners.forEach((owner) => {
      owner.cantarellaJellySpawnClock -= dt;
      if (owner.cantarellaJellySpawnClock <= 0) {
        spawnCantarellaJelly(owner);
        owner.cantarellaJellySpawnClock = owner.template.jellySpawnInterval;
      }
    });

    for (let i = cantarellaJellies.length - 1; i >= 0; i -= 1) {
      const unit = cantarellaJellies[i];
      if (!unit.owner || unit.owner.hp <= 0 || unit.hp <= 0) {
        cantarellaJellies.splice(i, 1);
        continue;
      }
      unit.flash = Math.max(0, unit.flash - dt * 5);
      unit.stunned = Math.max(0, unit.stunned - dt);
      unit.freeze = Math.max(0, unit.freeze - dt);
      unit.attackClock = Math.max(0, unit.attackClock - dt);
      if (unit.cantarellaSlowTimer > 0) {
        unit.cantarellaSlowTimer = Math.max(0, unit.cantarellaSlowTimer - dt);
        if (unit.cantarellaSlowTimer === 0) unit.cantarellaDreamed = false;
      }
      if (unit.knockback) {
        unit.x = clamp(unit.x + unit.knockback.vx * dt, BOUNDARY + unit.r, ARENA_SIZE - BOUNDARY - unit.r);
        unit.y = clamp(unit.y + unit.knockback.vy * dt, BOUNDARY + unit.r, ARENA_SIZE - BOUNDARY - unit.r);
        unit.knockback.timer -= dt;
        if (unit.knockback.timer <= 0) {
          unit.stunned = Math.max(unit.stunned, unit.knockback.stun || 0);
          unit.knockback = null;
        }
        unit.vx = 0;
        unit.vy = 0;
        continue;
      }
      const target = nearestOpponent(unit);
      if (target && unit.stunned <= 0 && unit.freeze <= 0) {
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const dist = Math.hypot(dx, dy) || 1;
        const attackRange = unit.owner.template.jellyAttackRange * CELL_SIZE;
        const speed = unit.owner.template.jellySpeed * CELL_SIZE
          * (unit.cantarellaSlowTimer > 0 ? unit.owner.template.mirageSlowMultiplier : 1);
        if (dist > attackRange * 0.82) {
          unit.vx = (dx / dist) * speed;
          unit.vy = (dy / dist) * speed;
        } else {
          unit.vx = 0;
          unit.vy = 0;
          if (unit.attackClock <= 0) performCantarellaJellyAttack(unit, target);
        }
      } else {
        unit.vx = 0;
        unit.vy = 0;
      }
      unit.x = clamp(unit.x + unit.vx * dt, BOUNDARY + unit.r, ARENA_SIZE - BOUNDARY - unit.r);
      unit.y = clamp(unit.y + unit.vy * dt, BOUNDARY + unit.r, ARENA_SIZE - BOUNDARY - unit.r);
    }
    resolveCantarellaJellyCollisions();
    updateCantarellaUmbrellas(dt);
  }

  function resolveCantarellaJellyCollisions() {
    const fighters = getActiveFighters().filter((fighter) => fighter.hp > 0);
    cantarellaJellies.forEach((unit) => {
      if (!unit.owner || unit.owner.hp <= 0 || unit.hp <= 0) return;
      fighters.forEach((fighter) => {
        const dx = unit.x - fighter.x;
        const dy = unit.y - fighter.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDistance = unit.r + fighter.r;
        if (dist >= minDistance) return;
        unit.x = clamp(fighter.x + (dx / dist) * minDistance, BOUNDARY + unit.r, ARENA_SIZE - BOUNDARY - unit.r);
        unit.y = clamp(fighter.y + (dy / dist) * minDistance, BOUNDARY + unit.r, ARENA_SIZE - BOUNDARY - unit.r);
      });
    });
    for (let i = 0; i < cantarellaJellies.length; i += 1) {
      const first = cantarellaJellies[i];
      if (first.hp <= 0) continue;
      for (let j = i + 1; j < cantarellaJellies.length; j += 1) {
        const second = cantarellaJellies[j];
        if (second.hp <= 0) continue;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const minDistance = first.r + second.r;
        if (dist >= minDistance) continue;
        const push = (minDistance - dist) * 0.5;
        const nx = dx / dist;
        const ny = dy / dist;
        first.x = clamp(first.x - nx * push, BOUNDARY + first.r, ARENA_SIZE - BOUNDARY - first.r);
        first.y = clamp(first.y - ny * push, BOUNDARY + first.r, ARENA_SIZE - BOUNDARY - first.r);
        second.x = clamp(second.x + nx * push, BOUNDARY + second.r, ARENA_SIZE - BOUNDARY - second.r);
        second.y = clamp(second.y + ny * push, BOUNDARY + second.r, ARENA_SIZE - BOUNDARY - second.r);
      }
    }
  }

  function launchCantarellaUmbrella(fighter, opponent) {
    const angle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x);
    const speed = fighter.template.umbrellaSpeed * CELL_SIZE;
    cantarellaUmbrellas.push({
      id: ++cantarellaSequence,
      owner: fighter,
      x: fighter.x + Math.cos(angle) * (fighter.r + 10),
      y: fighter.y + Math.sin(angle) * (fighter.r + 10),
      angle,
      speed,
      traveled: 0,
      maxDistance: fighter.template.umbrellaDistance * CELL_SIZE,
      r: CELL_SIZE * 0.82,
      hitCounts: new Map(),
      hitCooldowns: new Map(),
      spin: 0,
      phase: random(0, Math.PI * 2)
    });
    fighter.attackClock = fighter.template.attackCooldown;
    effects.push({
      type: "ring",
      x: fighter.x,
      y: fighter.y,
      radius: 7,
      growth: 260,
      life: 0.3,
      maxLife: 0.3,
      color: "#b88cff",
      width: 4
    });
    addLog(`${fighter.template.name} 丢出雨伞，伞体开始沿直线推进。`, "normal");
    playSound("windup");
  }

  function updateCantarellaUmbrellas(dt) {
    for (let i = cantarellaUmbrellas.length - 1; i >= 0; i -= 1) {
      const umbrella = cantarellaUmbrellas[i];
      const owner = umbrella.owner;
      if (!owner || owner.hp <= 0) {
        cantarellaUmbrellas.splice(i, 1);
        continue;
      }
      const move = Math.min(umbrella.speed * dt, umbrella.maxDistance - umbrella.traveled);
      umbrella.x += Math.cos(umbrella.angle) * move;
      umbrella.y += Math.sin(umbrella.angle) * move;
      umbrella.traveled += move;
      umbrella.spin += dt * 4.5;
      umbrella.hitCooldowns.forEach((remaining, target) => {
        umbrella.hitCooldowns.set(target, Math.max(0, remaining - dt));
      });

      for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex -= 1) {
        const projectile = projectiles[projectileIndex];
        if (projectile.owner?.side === owner.side) continue;
        if (Math.hypot(projectile.x - umbrella.x, projectile.y - umbrella.y) > umbrella.r + projectile.r) continue;
        spawnBurst(projectile.x, projectile.y, "#bda3ff", 12, 150);
        projectiles.splice(projectileIndex, 1);
      }

      getDamageableUnits().forEach((target) => {
        if (target.hp <= 0 || target.side === owner.side) return;
        const hits = umbrella.hitCounts.get(target) || 0;
        if (hits >= owner.template.umbrellaHits || umbrella.hitCooldowns.get(target) > 0) return;
        if (Math.hypot(target.x - umbrella.x, target.y - umbrella.y) > umbrella.r + target.r) return;
        umbrella.hitCounts.set(target, hits + 1);
        umbrella.hitCooldowns.set(target, 0.16);
        applyDamage(target, owner.template.attackDamage, owner, "伞击", {
          color: "#d6c1ff",
          ranged: true
        });
        if (target.hp > 0) {
          target.x = clamp(target.x + Math.cos(umbrella.angle) * 7, BOUNDARY + target.r, ARENA_SIZE - BOUNDARY - target.r);
          target.y = clamp(target.y + Math.sin(umbrella.angle) * 7, BOUNDARY + target.r, ARENA_SIZE - BOUNDARY - target.r);
        }
        spawnBurst(target.x, target.y, "#c9a7ff", 8, 130);
      });

      if (
        umbrella.traveled >= umbrella.maxDistance
        || umbrella.x < BOUNDARY
        || umbrella.x > ARENA_SIZE - BOUNDARY
        || umbrella.y < BOUNDARY
        || umbrella.y > ARENA_SIZE - BOUNDARY
      ) {
        cantarellaUmbrellas.splice(i, 1);
      }
    }
  }

  function defeatCantarellaJelly(unit) {
    if (!unit || unit.defeated) return;
    unit.defeated = true;
    unit.hp = 0;
    unit.vx = 0;
    unit.vy = 0;
    const owner = unit.owner;
    spawnBurst(unit.x, unit.y, "#c9a1ff", 24, 200);
    effects.push({
      type: "ring",
      x: unit.x,
      y: unit.y,
      radius: 5,
      growth: 220,
      life: 0.45,
      maxLife: 0.45,
      color: "#c9a1ff",
      width: 4
    });
    if (!owner || owner.hp <= 0) return;
    const healed = Math.min(owner.maxHp - owner.hp, owner.template.jellyHealOnDeath);
    owner.hp = Math.min(owner.maxHp, owner.hp + owner.template.jellyHealOnDeath);
    if (healed > 0) spawnDamageText(owner.x, owner.y - owner.r, `+${Math.round(healed)}`, "#c9a1ff", true);
    addLog(`${owner.template.name} 的水母消散，恢复 ${Math.round(healed)} 点生命。`, "ability");
    const previousDeaths = owner.cantarellaJellyDeaths;
    owner.cantarellaJellyDeaths += 1;
    if (
      previousDeaths < owner.template.jellyDeathsToUnlock
      && owner.cantarellaJellyDeaths >= owner.template.jellyDeathsToUnlock
    ) {
      announce(`${owner.template.name} · 蜃境解锁`, "#d5b8ff", 1.2);
      addLog(`${owner.template.name} 已献祭 3 只水母，共鸣解放「蜃境迷梦」解锁。`, "ability");
      playSound("timeStop");
    }
  }

  function startCantarellaMirage(fighter) {
    const duration = fighter.template.ultimateDuration;
    fighter.cantarellaMirageTimer = duration;
    fighter.cantarellaMirageDamageDealt = false;
    getDamageableUnits().forEach((unit) => {
      if (!unit || unit.hp <= 0) return;
      unit.cantarellaSlowTimer = Math.max(unit.cantarellaSlowTimer || 0, duration);
      if (unit.side !== fighter.side) unit.cantarellaDreamed = true;
    });
    effects.push({
      type: "ring",
      x: fighter.x,
      y: fighter.y,
      radius: 12,
      growth: 620,
      life: 0.9,
      maxLife: 0.9,
      color: "#b88cff",
      width: 10
    });
    spawnBurst(fighter.x, fighter.y, "#c9a1ff", 46, 320);
    screenShake = Math.max(screenShake, 7);
    addLog(`${fighter.template.name} 展开蜃境：全场减速 80%，敌方进入迷梦。`, "ability");
    playSound("timeStop");
  }

  function finishCantarellaMirage(fighter) {
    if (!fighter || fighter.hp <= 0) return;
    if (!fighter.cantarellaMirageDamageDealt && state === "playing") {
      const targets = getDamageableUnits().filter((unit) => (
        unit.hp > 0
        && unit.side !== fighter.side
      ));
      if (targets.length) {
        effects.push({
          type: "ring",
          x: fighter.x,
          y: fighter.y,
          radius: 18,
          growth: 760,
          life: 0.8,
          maxLife: 0.8,
          color: "#d9a8ff",
          width: 11
        });
        spawnBurst(fighter.x, fighter.y, "#d9a8ff", 38, 280);
        announce(`${fighter.template.name} · 蜃境回响`, "#e2baff", 1.1);
        addLog(`${fighter.template.name} 的蜃境期间未造成伤害，结束时引发 150 点蜃境回响。`, "ability");
        targets.forEach((target) => {
          applySpecialDamage(target, 150, fighter, "蜃境回响", {
            color: "#e0b5ff"
          });
        });
        screenShake = Math.max(screenShake, 8);
        playSound("abyss");
      }
    }
    fighter.cantarellaMirageDamageDealt = false;
  }

  function spawnWhiteSheep(owner) {
    if (!owner || owner.template.summonType !== "whiteSheep") return;
    const angle = random(0, Math.PI * 2);
    const speed = 3.3 * CELL_SIZE;
    summonUnits.push({
      owner,
      x: clamp(owner.x + Math.cos(angle) * CELL_SIZE * 2.4, BOUNDARY + 22, ARENA_SIZE - BOUNDARY - 22),
      y: clamp(owner.y + Math.sin(angle) * CELL_SIZE * 2.4, BOUNDARY + 28, ARENA_SIZE - BOUNDARY - 28),
      vx: Math.cos(angle + Math.PI * 0.48) * speed,
      vy: Math.sin(angle + Math.PI * 0.48) * speed,
      speed,
      fireClock: owner.template.summonInterval,
      phase: random(0, Math.PI * 2)
    });
  }

  function launchWhiteSheepFireball(unit, opponent) {
    playAttackVoice(unit.owner, "whiteSheepAttack");
    const origin = { x: unit.x, y: unit.y };
    const speed = 4.2 * CELL_SIZE;
    const interceptTime = calculateInterceptTime(
      { x: origin.x, y: origin.y, vx: 0, vy: 0 },
      opponent,
      speed
    );
    const aimX = opponent.x + opponent.vx * interceptTime;
    const aimY = opponent.y + opponent.vy * interceptTime;
    const angle = Math.atan2(aimY - origin.y, aimX - origin.x);
    projectiles.push({
      owner: unit.owner,
      target: opponent,
      kind: "fireball",
      independent: true,
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 10,
      life: 12,
      homing: 0,
      damage: 30,
      color: "#ff8a53"
    });
    effects.push({ type: "ring", x: origin.x, y: origin.y, radius: 5, growth: 180, life: 0.3, maxLife: 0.3, color: "#ffb36b", width: 3 });
    addLog("白咩发射火球，蓄势待爆。", "normal");
    playSound("fire");
  }

  function createFireCrater(x, y, owner) {
    craters.push({
      x: clamp(x, BOUNDARY + 12, ARENA_SIZE - BOUNDARY - 12),
      y: clamp(y, BOUNDARY + 12, ARENA_SIZE - BOUNDARY - 12),
      size: CELL_SIZE * owner.template.fireCraterRadius * 2,
      life: 4,
      maxLife: 4,
      tickClock: 0.5,
      owner,
      phase: random(0, Math.PI * 2)
    });
  }

  function explodeFireball(projectile, directTarget) {
    const blastRadius = projectile.owner.template.fireballBlastRadius * CELL_SIZE;
    createFireCrater(projectile.x, projectile.y, projectile.owner);
    effects.push({
      type: "ring",
      x: projectile.x,
      y: projectile.y,
      radius: 10,
      growth: 390,
      life: 0.58,
      maxLife: 0.58,
      color: "#ff9d5d",
      width: 8
    });
    effects.push({
      type: "fireBlast",
      x: projectile.x,
      y: projectile.y,
      radius: blastRadius,
      life: 0.55,
      maxLife: 0.55,
      color: "#ff9d5d"
    });
    effects.push({ type: "fire", x: projectile.x, y: projectile.y, radius: blastRadius, life: 0.8, maxLife: 0.8, color: "#ff6f43" });
    spawnBurst(projectile.x, projectile.y, "#ffad65", 28, 260);
    getDamageableUnits()
      .filter((target) => target.side !== projectile.owner.side && target.hp > 0)
      .forEach((target) => {
        const inBlast = Math.hypot(target.x - projectile.x, target.y - projectile.y) <= blastRadius + target.r * 0.2;
        if (target === directTarget || inBlast) {
          applySpecialDamage(target, 30, projectile.owner, "白咩火球", { color: "#ff9d5d" });
        }
      });
    addLog(`火球在半径 ${projectile.owner.template.fireballBlastRadius} 格范围内爆炸，并留下持续 4 秒的爆炎弹坑。`, "ability");
    screenShake = Math.max(screenShake, 5);
    playSound("fire");
  }

  function updateCraters(dt) {
    for (let i = craters.length - 1; i >= 0; i -= 1) {
      const crater = craters[i];
      crater.life -= dt;
      crater.tickClock -= dt;
      if (crater.tickClock <= 0 && state === "playing") {
        crater.tickClock += 0.5;
        const radius = crater.size / 2;
        getDamageableUnits()
          .filter((fighter) => fighter.side !== crater.owner.side && fighter.hp > 0)
          .forEach((target) => {
            if (Math.hypot(target.x - crater.x, target.y - crater.y) <= radius + target.r * 0.25) {
              applySpecialDamage(target, 10, crater.owner, "爆炎", {
                color: "#ff8d57",
                noEnergy: true,
                quiet: true
              });
            }
          });
      }
      if (crater.life <= 0) craters.splice(i, 1);
    }
  }

  function inMeleeRange(fighter, opponent) {
    const range = getAttackRangeCells(fighter) * CELL_SIZE;
    const centerDistance = Math.hypot(fighter.x - opponent.x, fighter.y - opponent.y);
    return fighter.inContact || centerDistance <= range + Math.min(fighter.r, opponent.r) * 0.2;
  }

  function getAttackRangeCells(fighter) {
    if (fighter.template.id === "02" && fighter.abyssForm) {
      return fighter.template.abyssScytheRange;
    }
    if (fighter.template.transformThreshold && fighter.horned) {
      return fighter.template.hornedHitRange;
    }
    if (fighter.overclock > 0 && fighter.template.overclockRange) {
      return fighter.template.overclockRange;
    }
    return fighter.template.attackRange;
  }

  function tryBasicAttack(fighter, opponent) {
    if (fighter.attackClock > 0 || fighter.freeze > 0 || fighter.stunned > 0 || fighter.vortexLockTimer > 0) return;
    if (fighter.template.attackType === "none" || fighter.charge || fighter.knockback) return;
    if (fighter.template.id === "02" && fighter.abyssForm) {
      if (inMeleeRange(fighter, opponent)) {
        performAbyssSweep(fighter, opponent);
        fighter.attackClock = fighter.template.abyssScytheCooldown;
      }
    } else if (fighter.template.id === "04") {
      const melee = distance(fighter, opponent) <= fighter.template.attackRange * CELL_SIZE;
      fighter.brantMeleeMode = melee;
      if (melee) {
        performBrantMelee(fighter, opponent);
        fighter.attackClock = fighter.template.meleeAttackCooldown;
      } else {
        fireBrantShot(fighter, opponent);
        fighter.attackClock = fighter.template.rangedAttackCooldown;
      }
    } else if (fighter.template.id === "05") {
      if (distance(fighter, opponent) <= fighter.template.attackRange * CELL_SIZE + opponent.r * 0.15) {
        launchCantarellaUmbrella(fighter, opponent);
      }
    } else if (fighter.template.attackType === "thrust") {
      if (inMeleeRange(fighter, opponent)) {
        performThrust(fighter, opponent);
        fighter.attackClock = fighter.template.attackCooldown;
      }
    } else if (fighter.template.attackType === "ranged") {
      fireProjectile(fighter, opponent, false);
      fighter.attackClock = fighter.template.attackCooldown;
    } else if (fighter.template.transformThreshold) {
      const inSeekRange = fighter.inContact
        || distance(fighter, opponent) <= fighter.template.hornedSeekRange * CELL_SIZE + Math.min(fighter.r, opponent.r) * 0.2;
      if (fighter.horned && inSeekRange) {
        startBlackSheepSlam(fighter, opponent);
        fighter.attackClock = fighter.template.hornedCooldown;
      }
    } else if (inMeleeRange(fighter, opponent)) {
      performSweep(fighter, opponent, false);
      fighter.attackClock = fighter.template.attackCooldown;
    }
  }

  function performBrantMelee(fighter, opponent) {
    playAttackVoice(fighter);
    const angle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x);
    fighter.thrustAngle = angle;
    fighter.thrustTime = 0.28;
    effects.push({
      type: "thrust",
      fighter,
      angle,
      range: fighter.template.attackRange * CELL_SIZE,
      life: 0.28,
      maxLife: 0.28,
      color: "#d26083"
    });
    getDamageableUnits()
      .filter((target) => (
        target !== fighter
        && target.side !== fighter.side
        && target.hp > 0
        && distance(fighter, target) <= fighter.template.attackRange * CELL_SIZE
      ))
      .forEach((target) => {
        applyDamage(target, fighter.template.meleeAttackDamage, fighter, "船长剑刺", {
          color: "#d26083",
          melee: true,
          brantAttack: true
        });
        spawnBurst(target.x, target.y, "#d26083", 14, 190);
      });
    addLog(`${fighter.template.name} 挥剑前刺，造成 ${fighter.template.meleeAttackDamage} 点伤害。`, "ability");
    playSound("thrust");
  }

  function fireBrantShot(fighter, opponent) {
    playAttackVoice(fighter);
    const speed = fighter.template.projectileSpeed * CELL_SIZE;
    const interceptTime = calculateInterceptTime(fighter, opponent, speed);
    const aimX = opponent.x + opponent.vx * interceptTime;
    const aimY = opponent.y + opponent.vy * interceptTime;
    const angle = Math.atan2(aimY - fighter.y, aimX - fighter.x);
    fighter.brantAimAngle = angle;
    projectiles.push({
      owner: fighter,
      target: opponent,
      kind: "brantShot",
      x: fighter.x + Math.cos(angle) * (fighter.r + 8),
      y: fighter.y + Math.sin(angle) * (fighter.r + 8),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 7,
      life: 10,
      homing: 0,
      damage: fighter.template.rangedAttackDamage,
      color: "#c46cff",
      brantAttack: true
    });
    effects.push({
      type: "ring",
      x: fighter.x,
      y: fighter.y,
      radius: 7,
      growth: 320,
      life: 0.28,
      maxLife: 0.28,
      color: "#c46cff",
      width: 5
    });
    addLog(`${fighter.template.name} 开枪射击，弹速 12 格/秒。`, "normal");
    playSound("shot");
  }

  function performThrust(fighter, opponent) {
    playAttackVoice(fighter);
    const angle = Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x);
    fighter.thrustTime = 0.34;
    fighter.thrustAngle = angle;
    effects.push({
      type: "thrust",
      fighter,
      angle,
      range: fighter.template.attackRange * CELL_SIZE,
      life: 0.34,
      maxLife: 0.34,
      color: fighter.template.color
    });
    applyDamage(opponent, fighter.template.attackDamage, fighter, "前刺", {
      color: fighter.template.color
    });
    releaseVortexLock(opponent, true);
    if (opponent.hp > 0 && state === "playing") {
      if (fighter.template.id === "01") gainWandererSpecialEnergy(fighter, opponent);
    }
    spawnBurst(
      fighter.x + Math.cos(angle) * fighter.r * 1.4,
      fighter.y + Math.sin(angle) * fighter.r * 1.4,
      fighter.template.id === "02" ? "#b56dff" : "#ffd76b",
      16,
      210
    );
    addLog(`${fighter.template.name} 使用武器前刺，造成 ${fighter.template.attackDamage} 点伤害。`, "ability");
    playSound("thrust");
  }

  function startBlackSheepSlam(fighter, opponent) {
    playAttackVoice(fighter, "blackSheepAttack");
    blackSlams.push({
      attacker: fighter,
      target: opponent,
      timer: fighter.template.blackSlamWindup,
      maxTimer: fighter.template.blackSlamWindup,
      phase: random(0, Math.PI * 2)
    });
    announce(`${fighter.template.name} · 黑咩蓄势`, "#d8dee8", 0.6);
    addLog(`${fighter.template.name} 召唤黑咩，0.3 秒后砸向地面。`, "ability");
    playSound("windup");
  }

  function updateBlackSlams(dt) {
    for (let i = blackSlams.length - 1; i >= 0; i -= 1) {
      const slam = blackSlams[i];
      slam.timer -= dt;
      if (slam.timer > 0) continue;
      const { attacker } = slam;
      const range = attacker.template.hornedHitRange * CELL_SIZE;
      const targets = getDamageableUnits().filter((target) => (
        target.hp > 0
        && target.side !== attacker.side
        && distance(attacker, target) <= range + target.r * 0.15
      ));
      effects.push({
        type: "ring",
        x: attacker.x,
        y: attacker.y,
        radius: 8,
        growth: targets.length ? 650 : 430,
        life: 0.55,
        maxLife: 0.55,
        color: "#adb6c5",
        width: 8
      });
      if (targets.length) {
        targets.forEach((target) => {
          applySpecialDamage(target, attacker.template.hornedDamage, attacker, "黑咩砸击", {
            color: "#c8ced8"
          });
          spawnBurst(target.x, target.y, "#d8dee8", 24, 250);
        });
        screenShake = Math.max(screenShake, 8);
        announce(`${attacker.template.name} · 黑咩砸击`, "#d8dee8", 0.9);
        addLog(`${attacker.template.name} 的黑咩命中 ${targets.length} 个敌方单位，各造成 ${attacker.template.hornedDamage} 点范围伤害。`, "ability");
      } else {
        addLog("所有目标都在前摇结束前离开了黑咩预警范围。", "system");
        announce("黑咩落空", "#adb6c5", 0.8);
      }
      playSound("sword");
      blackSlams.splice(i, 1);
    }
  }

  function fireProjectile(fighter, opponent, empowered) {
    playAttackVoice(fighter);
    const speed = fighter.template.projectileSpeed * CELL_SIZE;
    const interceptTime = calculateInterceptTime(fighter, opponent, speed);
    const aimX = opponent.x + opponent.vx * interceptTime;
    const aimY = opponent.y + opponent.vy * interceptTime;
    const dx = aimX - fighter.x;
    const dy = aimY - fighter.y;
    const angle = Math.atan2(dy, dx);
    projectiles.push({
      owner: fighter,
      target: opponent,
      x: fighter.x + Math.cos(angle) * (fighter.r + 7),
      y: fighter.y + Math.sin(angle) * (fighter.r + 7),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: empowered ? 10 : 6,
      life: 12,
      homing: 0,
      damage: empowered ? 54 : fighter.template.attackDamage,
      color: fighter.template.color,
      empowered,
      category: empowered ? DAMAGE_CATEGORIES.SPECIAL : DAMAGE_CATEGORIES.NORMAL
    });
    effects.push({
      type: "ring",
      x: fighter.x,
      y: fighter.y,
      radius: 6,
      growth: empowered ? 430 : 240,
      life: 0.28,
      maxLife: 0.28,
      color: fighter.template.color,
      width: empowered ? 6 : 3
    });
    addLog(`${fighter.template.name} 发射${empowered ? "共鸣强化" : ""}弹丸，弹速 5 格/秒。`, "normal");
    playSound("shot");
  }

  function calculateInterceptTime(fighter, opponent, projectileSpeed) {
    const dx = opponent.x - fighter.x;
    const dy = opponent.y - fighter.y;
    const a = opponent.vx * opponent.vx + opponent.vy * opponent.vy - projectileSpeed * projectileSpeed;
    const b = 2 * (dx * opponent.vx + dy * opponent.vy);
    const c = dx * dx + dy * dy;
    if (Math.abs(a) < 0.001) {
      if (Math.abs(b) < 0.001) return 0;
      const linearTime = -c / b;
      return linearTime > 0 ? Math.min(12, linearTime) : 0;
    }
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;
    const root = Math.sqrt(discriminant);
    const t1 = (-b - root) / (2 * a);
    const t2 = (-b + root) / (2 * a);
    const candidates = [t1, t2].filter((value) => value > 0.02);
    return candidates.length ? Math.min(12, Math.min(...candidates)) : 0;
  }

  function performSweep(fighter, opponent, empowered) {
    playAttackVoice(fighter);
    const overclocked = fighter.overclock > 0;
    const rangeCells = getAttackRangeCells(fighter);
    const range = rangeCells * CELL_SIZE;
    const damage = overclocked ? fighter.template.overclockDamage : empowered ? 80 : fighter.template.attackDamage;
    if (fighter.template.id === "kakarot-test") {
      fighter.weaponSwingMax = overclocked ? 0.46 : 0.42;
      fighter.weaponSwing = fighter.weaponSwingMax;
    }
    effects.push({
      type: "sweep",
      fighter,
      range,
      life: empowered ? 0.62 : 0.42,
      maxLife: empowered ? 0.62 : 0.42,
      color: fighter.template.color,
      empowered: empowered || overclocked
    });
    const strikeDamage = overclocked || empowered ? applySpecialDamage : applyDamage;
    const dealt = strikeDamage(opponent, damage, fighter, overclocked ? "共鸣横扫" : empowered ? "回旋斩" : "横扫", {
      color: fighter.template.color
    }) || 0;
    if (fighter.template.id === "kakarot-test" && dealt > 0 && state === "playing") {
      gainKakarotSpecialEnergy(fighter, opponent);
    }
    spawnBurst(opponent.x, opponent.y, fighter.template.color, empowered ? 30 : 16, empowered ? 280 : 180);
    addLog(`${fighter.template.name} ${overclocked ? "共鸣解放" : empowered ? "强化" : ""}横扫半径 ${rangeCells} 格区域！`, "ability");
    playSound("sword");
  }

  function gainKakarotSpecialEnergy(fighter, opponent) {
    const gain = fighter.overclock > 0 ? 2 : 1;
    const previousEnergy = fighter.specialEnergy;
    fighter.specialEnergy = Math.min(3, fighter.specialEnergy + gain);
    if (previousEnergy < 3 && fighter.specialEnergy >= 3) {
      fighter.deathSentenceClock = fighter.template.deathSentenceDelay;
      announce("死告 · 2 秒后释放", "#d9fffb", 1);
      addLog(`${fighter.template.name} 的死告能量已满，将在 2 秒后释放。`, "ability");
    }
  }

  function triggerDeathSentence(fighter, opponent) {
    if (!opponent || opponent.hp <= 0 || state !== "playing") return;
    if (fighter.voiceDeathSentencePending) return;
    fighter.specialEnergy = 0;
    fighter.deathSentenceClock = 0;
    const voiceEntries = voiceEntriesFor([fighter], "deathSentence")
      .map((entry) => ({ ...entry, focus: false }));
    if (voiceEntries.length) {
      fighter.voiceDeathSentencePending = true;
      enqueueVoiceSequence(voiceEntries, {
        pauseGame: true,
        onComplete: () => {
          fighter.voiceDeathSentencePending = false;
          executeDeathSentence(fighter, opponent);
        }
      });
      return;
    }
    executeDeathSentence(fighter, opponent);
  }

  function executeDeathSentence(fighter, opponent) {
    if (!opponent || opponent.hp <= 0 || state !== "playing") return;
    const oldX = fighter.x;
    const oldY = fighter.y;
    let angle = Math.atan2(fighter.y - opponent.y, fighter.x - opponent.x);
    if (!Number.isFinite(angle)) angle = random(0, Math.PI * 2);
    const distanceToTarget = fighter.r + opponent.r + 14;
    fighter.x = clamp(opponent.x + Math.cos(angle) * distanceToTarget, BOUNDARY + fighter.r, ARENA_SIZE - BOUNDARY - fighter.r);
    fighter.y = clamp(opponent.y + Math.sin(angle) * distanceToTarget, BOUNDARY + fighter.r, ARENA_SIZE - BOUNDARY - fighter.r);
    effects.push({ type: "ring", x: oldX, y: oldY, radius: 8, growth: 420, life: 0.45, maxLife: 0.45, color: "#75f2ed", width: 6 });
    effects.push({ type: "ring", x: opponent.x, y: opponent.y, radius: 8, growth: 650, life: 0.56, maxLife: 0.56, color: "#e8ffff", width: 9 });
    spawnBurst(opponent.x, opponent.y, "#9ff9ef", 38, 330);
    screenShake = Math.max(screenShake, 10);
    applySpecialDamage(opponent, fighter.template.deathSentenceDamage, fighter, "死告", {
      color: "#c9fffb"
    });
    announce("死告 · 三格共鸣", "#d9fffb", 1);
    addLog(`${fighter.template.name} 释放「死告」，瞬身重击造成 ${fighter.template.deathSentenceDamage} 点伤害。`, "ability");
    playSound("deathSentence");
  }

  function applyParalysis(target) {
    if (!target || target.hp <= 0 || state !== "playing") return;
    if (target.paralyzed <= 0) target.paralyzeTick = 3;
    target.paralyzed = Math.max(target.paralyzed, PARALYSIS_DURATION);
    spawnBurst(target.x, target.y, "#bda7ff", 16, 150);
    effects.push({ type: "paralysis", fighter: target, life: 0.5, maxLife: 0.5, color: "#bda7ff" });
  }

  function handleAbility(fighter, opponent, dt) {
    if (fighter.template.transformThreshold) return;
    if (fighter.template.ultimateType === "autoThreshold") return;
    if (fighter.stunned > 0 || fighter.freeze > 0 || fighter.vortexLockTimer > 0) return;
    if (fighter.energy >= 100) {
      fighter.fullEnergyTime += dt;
    } else {
      fighter.fullEnergyTime = 0;
    }
    const canAutocast = mode !== "play" || fighter.side !== 0;
    if (canAutocast && fighter.energy >= 100 && fighter.fullEnergyTime >= 1.1 && fighter.abilityCooldown <= 0) {
      useAbility(fighter, opponent);
    }
  }

  function useAbility(fighter = player, opponent = enemy, options = {}) {
    if (!fighter || !opponent || state !== "playing") return;
    if (fighter.voiceUltimatePending) return;
    if (fighter.charge || fighter.knockback) return;
    if (fighter.template.transformThreshold) return;
    if (fighter.template.ultimateType === "autoThreshold") return;
    if (fighter.energy < 100 || fighter.abilityCooldown > 0) return;
    if (fighter.template.ultimateType === "abyssBurst" && !fighter.abyssForm) return;
    if (
      fighter.template.ultimateType === "abyssBurst"
      && distance(fighter, opponent) > fighter.template.ultimateSeekRadius * CELL_SIZE
    ) return;
    if (fighter.template.ultimateType === "verinaBloom" && !hasVerinaVine(fighter)) return;
    if (
      fighter.template.ultimateType === "cantarellaMirage"
      && fighter.cantarellaJellyDeaths < fighter.template.jellyDeathsToUnlock
    ) return;
    if (fighter.template.ultimateType === "overclock" && fighter.overclock > 0) return;
    if (fighter.template.attackType === "melee" && fighter.template.ultimateType !== "overclock" && !inMeleeRange(fighter, opponent)) return;
    if (!options.voicePlayed) {
      const voiceEntries = voiceEntriesFor([fighter], "ultimate")
        .map((entry) => ({ ...entry, focus: false }));
      if (voiceEntries.length) {
        fighter.voiceUltimatePending = true;
        enqueueVoiceSequence(voiceEntries, {
          pauseGame: true,
          onComplete: () => {
            fighter.voiceUltimatePending = false;
            useAbility(fighter, opponent, { voicePlayed: true });
          }
        });
        return;
      }
    }
    fighter.energy = 0;
    fighter.fullEnergyTime = 0;
    fighter.abilityCooldown = fighter.template.ultimateCooldown ?? fighter.template.cooldown;
    fighter.flash = 1;
    screenShake = 9;
    announce(`${fighter.template.name} · ${fighter.template.ability}`, fighter.template.color, 1.25);
    addLog(`${fighter.template.name} 共鸣能量已满，触发「${fighter.template.ability}」！`, "ability");
    dom.screenReaderStatus.textContent = `${fighter.template.name}共鸣能量已满，触发${fighter.template.ability}`;

    if (fighter.template.ultimateType === "windCharge") {
      startJianxinCharge(fighter);
    } else if (fighter.template.ultimateType === "abyssBurst") {
      const blastX = opponent.x;
      const blastY = opponent.y;
      const blastRadius = fighter.template.ultimateBlastRadius * CELL_SIZE;
      let totalDamage = 0;
      getDamageableUnits()
        .filter((target) => target.side !== fighter.side && target.hp > 0 && Math.hypot(target.x - blastX, target.y - blastY) <= blastRadius)
        .forEach((target) => {
          totalDamage += applySpecialDamage(target, fighter.template.ultimateDamage, fighter, "湮灭万律", {
            color: "#c878ff"
          }) || 0;
        });
      healAbyssDamage(fighter, totalDamage);
      fighter.abyssEnergy = Math.min(100, fighter.abyssEnergy + 50);
      restoreAbyssTrajectory(fighter);
      effects.push({ type: "abyssBurst", x: blastX, y: blastY, radius: blastRadius, life: 0.8, maxLife: 0.8, color: "#b65dff" });
      spawnBurst(blastX, blastY, "#c97aff", 60, 420);
      screenShake = 13;
      playSound("abyss");
    } else if (fighter.template.ultimateType === "verinaBloom") {
      getDamageableUnits()
        .filter((target) => target.side !== fighter.side && target.hp > 0)
        .forEach((target) => {
          const healed = Math.min(target.maxHp - target.hp, fighter.template.verinaUltimateEnemyHeal);
          target.hp = Math.min(target.maxHp, target.hp + fighter.template.verinaUltimateEnemyHeal);
          if (healed > 0) {
            spawnDamageText(target.x, target.y - target.r, `+${Math.round(healed)}`, "#d9ef7d", true);
          }
        });
      fighter.maxHp += fighter.template.verinaUltimateMaxHpGain;
      effects.push({
        type: "lifeBloom",
        fighter,
        x: fighter.x,
        y: fighter.y,
        radius: ARENA_SIZE * 0.72,
        life: 1.15,
        maxLife: 1.15,
        color: "#e7f58a"
      });
      effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 10, growth: 920, life: 1.05, maxLife: 1.05, color: "#f3ffad", width: 10 });
      spawnBurst(fighter.x, fighter.y, "#eaff9d", 54, 360);
      addLog(`${fighter.template.name} 释放生命庭院：敌人恢复 300 生命，自身最大生命提升至 ${Math.round(fighter.maxHp)}。`, "ability");
      playSound("shield");
    } else if (fighter.template.ultimateType === "brantOverdrive") {
      fighter.brantUltimateTimer = fighter.template.ultimateDuration;
      fighter.brantChestClock = Math.min(fighter.brantChestClock, getBrantChestInterval(fighter));
      effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 14, growth: 780, life: 0.7, maxLife: 0.7, color: "#d7749b", width: 9 });
      spawnBurst(fighter.x, fighter.y, "#e58ab0", 42, 320);
      addLog(`${fighter.template.name} 开启船长狂想：移速翻倍，宝箱生成速度提升至 400%。`, "ability");
      playSound("timeStop");
    } else if (fighter.template.ultimateType === "cantarellaMirage") {
      startCantarellaMirage(fighter);
    } else if (fighter.template.ultimateType === "timeStop") {
      timeStopOwner = fighter;
      timeStopTimer = fighter.template.ultimateDuration;
      effects.push({ type: "timeFlash", x: fighter.x, y: fighter.y, life: 0.8, maxLife: 0.8, color: "#ffd76b" });
      spawnBurst(fighter.x, fighter.y, "#ffe89c", 32, 300);
      playSound("timeStop");
    } else if (fighter.template.ultimateType === "overclock") {
      fighter.overclock = fighter.template.overclockDuration;
      fighter.attackClock = Math.min(fighter.attackClock, 0.35);
      effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 15, growth: 760, life: 0.72, maxLife: 0.72, color: fighter.template.color, width: 9 });
      spawnBurst(fighter.x, fighter.y, "#d1c2ff", 42, 320);
      playSound("lightning");
    } else if (fighter.template.attackType === "ranged") {
      fireProjectile(fighter, opponent, true);
      effects.push({ type: "ring", x: fighter.x, y: fighter.y, radius: 20, growth: 520, life: 0.56, maxLife: 0.56, color: fighter.template.color, width: 6 });
    } else {
      performSweep(fighter, opponent, true);
    }
  }

  function applyDamage(target, amount, source, label, options = {}) {
    if (!target || target.hp <= 0 || state !== "playing") return;
    let finalAmount = Math.max(1, amount);
    const specialDamage = options.category === DAMAGE_CATEGORIES.SPECIAL;
    const meleeDamage = !specialDamage && (options.melee === true
      || source?.template.attackType === "melee"
      || source?.template.attackType === "thrust"
      || Boolean(source?.horned || source?.abyssForm));
    if (
      target.template.id === "04"
      && target.brantAirborneTimer > 0
      && random(0, 1) < target.template.brantAirborneDodgeChance
    ) {
      spawnDamageText(target.x, target.y - target.r, "闪避", "#f2bad2", true);
      effects.push({
        type: "ring",
        x: target.x,
        y: target.y,
        radius: target.r + 8,
        growth: 150,
        life: 0.32,
        maxLife: 0.32,
        color: "#ef9bb9",
        width: 4
      });
      target.flash = Math.max(target.flash, 0.42);
      return 0;
    }
    if (target.cantarellaDreamed && !options.ignoreDream) {
      finalAmount += 150;
      target.cantarellaDreamed = false;
      target.cantarellaSlowTimer = 0;
      spawnDamageText(target.x, target.y - target.r - 16, "+150 迷梦", "#e0b9ff", true);
      effects.push({
        type: "dreamBreak",
        x: target.x,
        y: target.y,
        radius: target.r + 12,
        life: 0.5,
        maxLife: 0.5,
        color: "#d8a8ff"
      });
    }
    if (target.paralyzed > 0 && !options.ignoreVulnerability) finalAmount *= 1.1;
    let absorbed = 0;

    if (target.shield > 0 && !options.ignoreShield) {
      absorbed = Math.min(target.shield, finalAmount);
      target.shield = Math.max(0, target.shield - absorbed);
      finalAmount -= absorbed;
      if (!options.noText) {
        spawnBurst(
          target.x,
          target.y,
          target.template.id === "04" ? "#9f508d" : "#b9f3a4",
          target.shield === 0 ? 22 : 9,
          target.shield === 0 ? 230 : 130
        );
        if (target.template.id === "04") {
          spawnBurst(target.x, target.y, "#e58d9d", target.shield === 0 ? 14 : 6, 115);
        }
      }
      if (target.shield === 0) {
        effects.push({
          type: "shieldBreak",
          x: target.x,
          y: target.y,
          radius: target.r + 12,
          life: 0.55,
          maxLife: 0.55,
          color: target.template.id === "04" ? "#d77b96" : "#b9f3a4"
        });
        announce(target.template.id === "04" ? "船长护盾破碎" : "风障破碎", target.template.id === "04" ? "#e7a4b4" : "#d8ffca", 0.75);
      }
    }

    if (
      source?.template.id === "05"
      && source.cantarellaMirageTimer > 0
      && target.side !== source.side
      && finalAmount + absorbed > 0
    ) {
      source.cantarellaMirageDamageDealt = true;
    }
    target.hp = Math.max(0, target.hp - finalAmount);
    target.flash = options.noText ? Math.max(target.flash, 0.16) : (finalAmount > 0 ? 1 : 0.45);
    if (target.template.id === "02" && !target.abyssForm && !options.selfDrain) gainAbyssEnergy(target, 20);
    if (source?.template.id === "04" && options.brantAttack) {
      gainBrantSpecialEnergy(source, source.template.brantHitEnergy);
    }
    if (source && !options.noEnergy) {
      const recovery = meleeDamage ? 20 : 5;
      addResonanceEnergy(source, recovery);
      spawnEnergyGain(source, recovery);
    }
    if (finalAmount > 0 && !options.noText) {
      spawnDamageText(target.x, target.y - target.r, Math.round(finalAmount), options.color || source?.template.color || "#ffffff");
    }
    if (absorbed > 0 && !options.noText) {
      floatingTexts.push({
        x: target.x,
        y: target.y - target.r - (finalAmount > 0 ? 15 : 0),
        text: `护盾 −${Math.round(absorbed)}`,
        color: target.template.id === "04" ? "#e9a1b2" : "#d8ffca",
        life: 0.82,
        maxLife: 0.82,
        drift: random(-8, 8)
      });
    }
    if (!options.noText) {
      particles.push({
        x: target.x,
        y: target.y,
        vx: random(-30, 30),
        vy: random(-30, 30),
        life: 0.3,
        maxLife: 0.3,
        size: 15,
        color: "#ffffff",
        type: "flash"
      });
    }

    if (!options.quiet) {
      updateCombo(source ? source.side : -1);
      screenShake = Math.max(screenShake, 3.2);
    }
    if (target.hp <= 0 && state === "playing") {
      if (target.isJellyfish) {
        defeatCantarellaJelly(target);
        return finalAmount;
      }
      if (mode === "multi") {
        target.vx = 0;
        target.vy = 0;
        if (!target.deathVoicePlayed) {
          target.deathVoicePlayed = true;
          animateDefeat(target);
          enqueueVoiceSequence([{ fighter: target, type: "death", focus: false }], { pauseGame: true });
        }
      } else {
        finishRound(target.side === 0 ? 1 : 0, "KO");
      }
    }
    return finalAmount;
  }

  function applySpecialDamage(target, amount, source, label, options = {}) {
    return applyDamage(target, amount, source, label, {
      ...options,
      category: DAMAGE_CATEGORIES.SPECIAL
    });
  }

  function dealRawDamage(target, amount, source, label, color) {
    if (!target || target.hp <= 0 || state !== "playing") return;
    target.hp = Math.max(0, target.hp - Math.max(1, amount));
    spawnDamageText(target.x, target.y - target.r, Math.round(amount), color);
    if (target.hp <= 0 && state === "playing") {
      if (target.isJellyfish) {
        defeatCantarellaJelly(target);
        return amount;
      }
      if (mode === "multi") {
        target.vx = 0;
        target.vy = 0;
      } else {
        finishRound(target.side === 0 ? 1 : 0, "KO");
      }
    }
    return amount;
  }

  function updateCombo(side) {
    if (side < 0) return;
    if (combo.side === side && combo.timer > 0) {
      combo.count += 1;
    } else {
      combo = { side, count: 1, timer: 2.4 };
    }
    combo.timer = 2.4;
    if (combo.count >= 2) {
      dom.comboValue.textContent = combo.count;
      dom.comboBadge.classList.add("show");
    }
  }

  function animateDefeat(loser, winner = null) {
    if (!loser) return;
    const accent = winner?.template.color || loser.template.color;
    spawnBurst(loser.x, loser.y, accent, 55, 430);
    effects.push({
      type: "ring",
      x: loser.x,
      y: loser.y,
      radius: 15,
      growth: 900,
      life: 0.8,
      maxLife: 0.8,
      color: accent,
      width: 10
    });
    screenShake = Math.max(screenShake, 12);
    playSound("hit");
  }

  function markFighterDefeated(fighter) {
    if (!fighter) return;
    fighter.hp = 0;
    fighter.shield = 0;
    fighter.vx = 0;
    fighter.vy = 0;
    fighter.knockback = null;
  }

  function finishRound(winnerSide, reason) {
    if (state !== "playing") return;
    if (roundResultVoicePending) return;
    roundResultVoicePending = true;
    const winner = winnerSide === 0 ? player : enemy;
    const loser = winnerSide === 0 ? enemy : player;
    if (reason === "KO") markFighterDefeated(loser);
    if (loser.hp <= 0) animateDefeat(loser, winner);
    const voiceEntries = loser.hp <= 0
      ? [
        { fighter: loser, type: "death", focus: false },
        { fighter: winner, type: "victory", focus: false }
      ]
      : [];
    enqueueVoiceSequence(voiceEntries, {
      pauseGame: true,
      onComplete: () => {
        roundResultVoicePending = false;
        commitRoundFinish(winnerSide, reason);
      }
    });
  }

  function commitRoundFinish(winnerSide, reason) {
    if (state !== "playing") return;
    state = "roundEnd";
    lastRoundFinishReason = reason;
    syncPauseControl();
    roundEndTimer = 2.6;
    score[winnerSide] += 1;
    const winner = winnerSide === 0 ? player : enemy;
    const loser = winnerSide === 0 ? enemy : player;
    dom.playerScore.textContent = String(score[0]);
    dom.enemyScore.textContent = String(score[1]);
    dom.battleStatus.textContent = "本局结束";
    dom.statusDot.classList.remove("live");
    dom.liveBadge.classList.remove("is-live");
    dom.abilityButton.disabled = true;
    dom.abilityButton.classList.remove("is-ready");
    dom.matchState.textContent = score[0] === WINNING_SCORE || score[1] === WINNING_SCORE ? "胜负已定" : "继续战斗";
    announce(`${reason} · ${winner.template.name} 拿下本局`, winner.template.color, 2.2);
    addLog(`${reason}！${winner.template.name} 赢下第 ${round} 局。`, "round");
    playSound("roundWin");
    dom.screenReaderStatus.textContent = `${winner.template.name}赢下本局，比分${score[0]}比${score[1]}`;
  }

  function updateRoundEnd(dt) {
    roundEndTimer -= dt;
    updateTrails(dt);
    if (roundEndTimer > 0) return;
    if (score[0] >= WINNING_SCORE || score[1] >= WINNING_SCORE) {
      finishMatch(score[0] > score[1] ? 0 : 1, lastRoundFinishReason);
    } else {
      round += 1;
      startRound();
    }
  }

  function finishMatch(winnerSide, reason = lastRoundFinishReason) {
    state = "matchEnd";
    manualPaused = false;
    syncPauseControl();
    syncWandererFormState();
    const loser = winnerSide === 0 ? enemy : player;
    if (reason === "KO") markFighterDefeated(loser);
    const timeUp = reason === "时间到";
    dom.battleStatus.textContent = timeUp ? "时间到 · 比赛结束" : "比赛结束";
    dom.liveBadge.classList.remove("is-live");
    const playerWon = winnerSide === 0;
    dom.overlayEyebrow.textContent = timeUp
      ? "TIME UP · WINNER"
      : playerWon ? "MATCH COMPLETE · WINNER" : "MATCH COMPLETE";
    dom.overlayTitle.textContent = playerWon ? `${player.template.name} 夺冠！` : "惜败，但还能再撞一次";
    const reasonCopy = timeUp ? "时间到，按双方剩余生命判定胜负。" : "";
    dom.overlayCopy.textContent = playerWon
      ? `${reasonCopy}三局两胜，最终比分 ${score[0]} : ${score[1]}。这场的碰撞数据已经写进你的战报。`
      : `${reasonCopy}对手以 ${score[1]} : ${score[0]} 拿下比赛。换个球，或者再试一次。`;
    dom.overlayButton.querySelector("span").textContent = "再来一局";
    dom.overlayHint.textContent = "按 R 也可以立即重开";
    dom.gameOverlay.classList.remove("is-hidden");
    dom.matchState.textContent = timeUp ? "时间到" : "比赛结束";
    playSound(playerWon ? "win" : "lose");
    addLog(playerWon ? "整场比赛拿下，冠军诞生！" : "对手拿下整场比赛，等待下一次挑战。", "round");
    dom.screenReaderStatus.textContent = playerWon ? "你赢下了比赛" : "你输掉了比赛";
    updateHud();
  }

  function finishMultiMatch(winner, reason = "KO") {
    if (state !== "playing") return;
    if (multiResultVoicePending) return;
    multiResultVoicePending = true;
    const voiceEntries = winner && reason === "KO"
      ? [{ fighter: winner, type: "victory", focus: false }]
      : [];
    enqueueVoiceSequence(voiceEntries, {
      pauseGame: true,
      onComplete: () => {
        multiResultVoicePending = false;
        commitMultiMatch(winner);
      }
    });
  }

  function commitMultiMatch(winner) {
    if (state !== "playing") return;
    state = "matchEnd";
    manualPaused = false;
    syncPauseControl();
    syncWandererFormState();
    dom.battleStatus.textContent = "混战结束";
    dom.liveBadge.classList.remove("is-live");
    dom.overlayEyebrow.textContent = "FREE-FOR-ALL COMPLETE";
    dom.overlayTitle.textContent = winner ? `${winner.template.name} 赢得混战` : "全员出局";
    dom.overlayCopy.textContent = winner
      ? `${multiFighters.length} 只团子同场竞技，最终由 ${winner.template.name} 站到最后。`
      : "本次混战没有幸存者，再开一场试试。";
    dom.overlayButton.querySelector("span").textContent = "再来一场";
    dom.overlayHint.textContent = "按 R 也可以立刻重开";
    dom.gameOverlay.classList.remove("is-hidden");
    playSound(winner === player ? "win" : "lose");
    addLog(winner ? `${winner.template.name} 赢下多团混战。` : "全员出局，混战结束。", "round");
    dom.screenReaderStatus.textContent = winner ? `${winner.template.name}赢下混战` : "混战全员出局";
    updateHud();
  }

  function showSelectOverlay() {
    state = "idle";
    manualPaused = false;
    syncPauseControl();
    syncWandererFormState();
    if (mode === "multi") {
      dom.overlayEyebrow.textContent = "FREE-FOR-ALL";
      dom.overlayTitle.textContent = "多团混战";
      dom.overlayCopy.textContent = `${MAP_SIZE}×${MAP_SIZE} 格地图，${multiIds.length} 只团子同时参战。点击角色牌调整阵容。`;
      dom.overlayButton.querySelector("span").textContent = "开始混战";
      dom.overlayHint.textContent = "全自动战斗 · 最后存活者获胜";
      dom.gameOverlay.classList.remove("is-hidden");
      dom.battleStatus.textContent = "等待混战";
      dom.statusDot.classList.remove("live");
      dom.liveBadge.classList.remove("is-live");
      dom.abilityButton.disabled = true;
      renderMultiSetupBoard();
      return;
    }
    dom.overlayEyebrow.textContent = "READY TO BOUNCE?";
    dom.overlayTitle.textContent = "直线遭遇战";
    dom.overlayCopy.textContent = `${MAP_SIZE}×${MAP_SIZE} 格地图。团子沿随机直线移动，只在碰撞或触边后改变方向。`;
    dom.overlayButton.querySelector("span").textContent = "开始对战";
    dom.overlayHint.textContent = mode === "watch" ? "自动观战 · 无需操作" : "你来控制左边的团子";
    dom.gameOverlay.classList.remove("is-hidden");
    dom.battleStatus.textContent = "等待开局";
    dom.statusDot.classList.remove("live");
    dom.liveBadge.classList.remove("is-live");
    dom.matchState.textContent = "三局两胜";
    dom.abilityButton.disabled = true;
  }

  function spawnPickup() {
    if (!arenaItemsEnabled) return;
    if (pickups.length >= 2) return;
    const types = [
      { type: "heal", color: "#8ce985", glyph: "+" },
      { type: "rage", color: "#ffd84d", glyph: "ϟ" },
      { type: "speed", color: "#5ce8e5", glyph: "»" }
    ];
    const chosen = types[Math.floor(Math.random() * types.length)];
    let x = random(BOUNDARY + 85, ARENA_SIZE - BOUNDARY - 85);
    let y = random(BOUNDARY + 85, ARENA_SIZE - BOUNDARY - 85);
    let attempts = 0;
    while (attempts < 18) {
      const clearOfFighters = Math.hypot(player.x - x, player.y - y) > 100
        && Math.hypot(enemy.x - x, enemy.y - y) > 100;
      if (clearOfFighters) break;
      x = random(BOUNDARY + 85, ARENA_SIZE - BOUNDARY - 85);
      y = random(BOUNDARY + 85, ARENA_SIZE - BOUNDARY - 85);
      attempts += 1;
    }
    pickups.push({
      ...chosen,
      x,
      y,
      r: 14,
      life: 9,
      born: visualTime,
      phase: random(0, Math.PI * 2)
    });
    effects.push({ type: "ring", x, y, radius: 5, growth: 170, life: 0.6, maxLife: 0.6, color: chosen.color, width: 2 });
    addLog(`赛场中央出现了一个「${chosen.type === "heal" ? "修复果" : chosen.type === "rage" ? "超能芯" : "疾风羽"}」。`, "item");
  }

  function updatePickups() {
    for (let i = pickups.length - 1; i >= 0; i -= 1) {
      const pickup = pickups[i];
      pickup.life -= 1 / 60;
      let consumed = false;
      getActiveFighters().forEach((fighter) => {
        if (consumed || state !== "playing" || fighter.hp <= 0) return;
        if (Math.hypot(fighter.x - pickup.x, fighter.y - pickup.y) < fighter.r + pickup.r + 4) {
          consumed = true;
          if (pickup.type === "heal") {
            const healed = Math.min(fighter.maxHp - fighter.hp, 170);
            fighter.hp = Math.min(fighter.maxHp, fighter.hp + 170);
            spawnDamageText(fighter.x, fighter.y - fighter.r, `+${Math.round(healed)}`, "#8ce985", true);
          } else if (pickup.type === "rage") {
            addResonanceEnergy(fighter, 42);
            spawnDamageText(fighter.x, fighter.y - fighter.r, `+${42 * getEnergyEfficiency(fighter)} 能量`, "#ffd84d", true);
          } else {
            fighter.frenzy = 5;
            fighter.vx *= 1.24;
            fighter.vy *= 1.24;
            spawnDamageText(fighter.x, fighter.y - fighter.r, "疾风！", "#5ce8e5", true);
          }
          spawnBurst(pickup.x, pickup.y, pickup.color, 22, 190);
          addLog(`${fighter.template.name} 抢到了${pickup.type === "heal" ? "修复果" : pickup.type === "rage" ? "超能芯" : "疾风羽"}。`, "item");
          playSound("pickup");
        }
      });
      if (consumed || pickup.life <= 0) pickups.splice(i, 1);
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = projectiles[i];
      if (!projectile.independent && projectile.owner?.vortexLockTimer > 0) continue;
      projectile.life -= dt;
      const target = projectile.target;
      if (target && target.hp > 0) {
        const dx = target.x - projectile.x;
        const dy = target.y - projectile.y;
        const dist = Math.hypot(dx, dy) || 1;
        projectile.vx += (dx / dist) * projectile.homing * 250 * dt;
        projectile.vy += (dy / dist) * projectile.homing * 250 * dt;
        const speed = Math.hypot(projectile.vx, projectile.vy);
        if (speed > 410) {
          projectile.vx = (projectile.vx / speed) * 410;
          projectile.vy = (projectile.vy / speed) * 410;
        }
      }
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      particles.push({
        x: projectile.x,
        y: projectile.y,
        vx: random(-10, 10),
        vy: random(-10, 10),
        life: 0.24,
        maxLife: 0.24,
        size: 4,
        color: projectile.color
      });
      const hitTarget = target && Math.hypot(projectile.x - target.x, projectile.y - target.y) < target.r + projectile.r;
      if (hitTarget) {
        if (projectile.kind === "fireball") {
          explodeFireball(projectile, true);
        } else {
          const damageHandler = projectile.category === DAMAGE_CATEGORIES.SPECIAL ? applySpecialDamage : applyDamage;
          damageHandler(target, projectile.damage, projectile.owner, projectile.kind === "brantShot" ? "船长手枪" : "弹丸", {
            color: projectile.color,
            brantAttack: Boolean(projectile.brantAttack)
          });
          spawnBurst(projectile.x, projectile.y, projectile.color, 10, 150);
        }
        projectiles.splice(i, 1);
      } else if (
        projectile.life <= 0
        || projectile.x < BOUNDARY
        || projectile.x > ARENA_SIZE - BOUNDARY
        || projectile.y < BOUNDARY
        || projectile.y > ARENA_SIZE - BOUNDARY
      ) {
        if (projectile.kind === "fireball") {
          explodeFireball(projectile, false);
        }
        projectiles.splice(i, 1);
      }
    }
  }

  function updateTrails(dt) {
    getActiveFighters().forEach((fighter) => {
      if (!fighter) return;
      fighter.trailClock -= dt;
      fighter.trail = fighter.trail.filter((point) => {
        point.life -= dt;
        return point.life > 0;
      });
      if (fighter.trailClock <= 0 && (state === "playing" || state === "roundEnd")) {
        fighter.trailClock = 0.045;
        fighter.trail.push({
          x: fighter.x,
          y: fighter.y,
          r: fighter.r * random(0.72, 0.94),
          life: 0.34,
          maxLife: 0.34
        });
      }
    });
  }

  function updateVisualEffects(dt) {
    visualTime += dt;
    screenShake *= Math.pow(0.035, dt);
    if (screenShake < 0.05) screenShake = 0;
    announcementTimer -= dt;
    if (announcementTimer <= 0) dom.announcement.classList.remove("show");
    if (combo.timer > 0) {
      combo.timer -= dt;
      if (combo.timer <= 0) {
        combo.count = 0;
        combo.side = -1;
        dom.comboBadge.classList.remove("show");
      }
    }
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= Math.pow(0.08, dt);
      particle.vy *= Math.pow(0.08, dt);
      if (particle.life <= 0) particles.splice(i, 1);
    }
    for (let i = effects.length - 1; i >= 0; i -= 1) {
      const effect = effects[i];
      effect.life -= dt;
      if (effect.type === "ring") effect.radius += effect.growth * dt;
      if (effect.type === "fire") effect.radius += 36 * dt;
      if (effect.life <= 0) effects.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i -= 1) {
      const text = floatingTexts[i];
      text.life -= dt;
      text.y -= 34 * dt;
      if (text.life <= 0) floatingTexts.splice(i, 1);
    }
    if (particles.length > PARTICLE_LIMIT) particles.splice(0, particles.length - PARTICLE_LIMIT);
    if (effects.length > EFFECT_LIMIT) effects.splice(0, effects.length - EFFECT_LIMIT);
    if (floatingTexts.length > FLOATING_TEXT_LIMIT) {
      floatingTexts.splice(0, floatingTexts.length - FLOATING_TEXT_LIMIT);
    }
  }

  function updateIdlePreview(dt) {
    if (!player || !enemy) return;
    const t = visualTime;
    player.x = 235 + Math.sin(t * 0.72) * 27;
    player.y = 430 + Math.cos(t * 0.9) * 16;
    enemy.x = ARENA_SIZE - 235 + Math.cos(t * 0.78) * 27;
    enemy.y = 290 + Math.sin(t * 0.88) * 16;
    player.tilt = Math.sin(t * 0.6) * 0.05;
    enemy.tilt = Math.cos(t * 0.7) * 0.05;
  }

  function renderMultiSetupBoard() {
    renderMultiBoard(multiIds.map((id) => {
      const template = templateById(id);
      return {
        id,
        template,
        hp: template.hp,
        maxHp: template.hp,
        shield: template.startingShield || 0,
        maxShield: Math.max(template.startingShield || 0, template.alternateShield || 0, 1),
        energy: 0,
        status: ""
      };
    }));
  }

  function renderMultiBoard(entries) {
    if (!entries?.length) {
      dom.multiBoard.innerHTML = "";
      dom.multiBoard.dataset.lineup = "";
      return;
    }
    const lineupKey = entries.map((entry) => entry.id || entry.template.id).join("|");
    if (dom.multiBoard.dataset.lineup !== lineupKey) {
      dom.multiBoard.dataset.lineup = lineupKey;
      dom.multiBoard.innerHTML = entries.map((entry) => {
        const template = entry.template;
        const id = entry.id || template.id;
        return `
          <article class="multi-fighter" data-multi-id="${id}" style="--fighter-color:${template.color}">
            <div class="multi-avatar" aria-hidden="true">${template.image ? `<img src="${template.image}" alt="">` : template.symbol}</div>
            <div class="multi-info">
              <strong>${template.name}</strong>
              <div class="multi-bar hp"><i></i></div>
              ${template.startingShield || template.alternateShield || template.brantPickupShield
                ? `<div class="multi-bar shield${template.id === "04" ? " brant-shield" : ""}"><i></i></div>`
                : ""}
              <div class="multi-bar energy"><i></i></div>
            </div>
            <small class="multi-state"></small>
          </article>
        `;
      }).join("");
    }
    entries.forEach((entry) => {
      const id = entry.id || entry.template.id;
      const card = dom.multiBoard.querySelector(`[data-multi-id="${id}"]`);
      if (!card) return;
      const hpPercent = clamp(entry.hp / Math.max(1, entry.maxHp), 0, 1) * 100;
      card.querySelector(".multi-bar.hp i").style.width = `${hpPercent}%`;
      const shieldBar = card.querySelector(".multi-bar.shield i");
      if (shieldBar) {
        shieldBar.style.width = `${clamp(entry.shield / Math.max(1, entry.maxShield), 0, 1) * 100}%`;
        shieldBar.parentElement.hidden = entry.shield <= 0;
      }
      card.querySelector(".multi-bar.energy i").style.width = `${clamp(entry.energy, 0, 100)}%`;
      card.classList.toggle("is-defeated", entry.hp <= 0);
      card.classList.toggle("is-frozen", Boolean(entry.status));
      const stateLabel = card.querySelector(".multi-state");
      stateLabel.textContent = entry.hp <= 0 ? "出局" : entry.status || "";
      stateLabel.hidden = !stateLabel.textContent;
    });
  }

  function updateHud(force = false) {
    const now = performance.now();
    if (
      !force
      && state === "playing"
      && !voicePauseActive
      && now - lastHudRefreshAt < HUD_REFRESH_INTERVAL
    ) return;
    lastHudRefreshAt = now;
    if (mode === "multi") {
      const activeEntries = (state === "idle" ? [] : multiFighters).map((fighter) => {
        let status = "";
        if (fighter.vortexLockTimer > 0) status = "乱流";
        else if (timeStopOwner === fighter && timeStopTimer > 0) status = "时停";
        else if (fighter.knockback) status = "击飞";
        else if (fighter.charge) status = "蓄力";
        else if (fighter.stunned > 0) status = "眩晕";
        else if (fighter.abyssForm) status = "镰刀";
        else if (fighter.template.id === "06" && hasVerinaVine(fighter)) status = "藤";
        else if (fighter.template.id === "04" && fighter.brantBigAnchorLock) status = "落锚定身";
        else if (fighter.template.id === "04" && fighter.brantAirborneTimer > 0) status = "空中";
        else if (fighter.template.id === "04" && fighter.brantUltimateTimer > 0) status = "加速";
        else if (fighter.template.id === "05" && fighter.cantarellaMirageTimer > 0) status = "蜃境";
        else if (fighter.overclock > 0) status = "解放";
        else if (fighter.horned) status = "羊角";
        return {
          id: fighter.template.id,
          template: fighter.template,
          hp: fighter.hp,
          maxHp: fighter.maxHp,
          shield: fighter.shield,
          maxShield: fighter.maxShield,
          energy: fighter.energy,
          status
        };
      });
      if (activeEntries.length) renderMultiBoard(activeEntries);
      else renderMultiSetupBoard();
      dom.timerText.textContent = String(Math.ceil(battleTimer)).padStart(2, "0");
      dom.timerOrb.classList.toggle("is-low", battleTimer <= 10 && state === "playing");
      dom.abilityButton.disabled = true;
      if (state === "playing" && !voicePauseActive) {
        if (timeStopOwner && timeStopTimer > 0) {
          dom.battleStatus.textContent = `${timeStopOwner.template.name}时停 ${timeStopTimer.toFixed(1)}s`;
        } else {
          const alive = multiFighters.filter((fighter) => fighter.hp > 0).length;
          dom.battleStatus.textContent = `混战中 · 剩余 ${alive} 团`;
        }
      }
      return;
    }
    if (!player || !enemy) return;
    const playerPercent = clamp(player.hp / player.maxHp, 0, 1) * 100;
    const enemyPercent = clamp(enemy.hp / enemy.maxHp, 0, 1) * 100;
    dom.playerHpBar.style.width = `${playerPercent}%`;
    dom.enemyHpBar.style.width = `${enemyPercent}%`;
    dom.playerHpText.textContent = formatNumber(player.hp);
    dom.enemyHpText.textContent = formatNumber(enemy.hp);
    const playerHasShield = player.shield > 0;
    const enemyHasShield = enemy.shield > 0;
    dom.playerShield.hidden = !playerHasShield;
    dom.enemyShield.hidden = !enemyHasShield;
    dom.playerShield.classList.toggle("is-brant", player.template.id === "04");
    dom.enemyShield.classList.toggle("is-brant", enemy.template.id === "04");
    if (playerHasShield) {
      dom.playerShieldBar.style.width = `${clamp(player.shield / Math.max(1, player.maxShield), 0, 1) * 100}%`;
      dom.playerShieldText.textContent = `护盾 ${formatNumber(player.shield)}`;
    }
    if (enemyHasShield) {
      dom.enemyShieldBar.style.width = `${clamp(enemy.shield / Math.max(1, enemy.maxShield), 0, 1) * 100}%`;
      dom.enemyShieldText.textContent = `护盾 ${formatNumber(enemy.shield)}`;
    }
    dom.playerName.textContent = player.template.name;
    dom.enemyName.textContent = enemy.template.name;
    if (player.template.altImage) {
      dom.playerMini.style.setProperty("--portrait", `url("${player.horned || player.abyssForm ? player.template.altImage : player.template.image}")`);
    }
    if (enemy.template.altImage) {
      dom.enemyMini.style.setProperty("--portrait", `url("${enemy.horned || enemy.abyssForm ? enemy.template.altImage : enemy.template.image}")`);
    }
    dom.timerText.textContent = String(Math.ceil(battleTimer)).padStart(2, "0");
    dom.timerOrb.classList.toggle("is-low", battleTimer <= 10 && state === "playing");
    const energy = clamp(player.energy, 0, 100);
    const enemyEnergy = clamp(enemy.energy, 0, 100);
    dom.playerEnergyBar.style.width = `${energy}%`;
    dom.enemyEnergyBar.style.width = `${enemyEnergy}%`;
    dom.playerEnergyText.textContent = `共鸣 ${Math.round(energy)}%`;
    dom.enemyEnergyText.textContent = `共鸣 ${Math.round(enemyEnergy)}%`;
    const playerHasSpecial = player.template.id === "kakarot-test" || player.template.id === "01";
    const enemyHasSpecial = enemy.template.id === "kakarot-test" || enemy.template.id === "01";
    const playerHasAbyss = player.template.id === "02";
    const enemyHasAbyss = enemy.template.id === "02";
    const playerHasBrant = player.template.id === "04";
    const enemyHasBrant = enemy.template.id === "04";
    dom.playerSpecialGauge.hidden = !playerHasSpecial;
    dom.enemySpecialGauge.hidden = !enemyHasSpecial;
    dom.playerAbyssGauge.hidden = !playerHasAbyss;
    dom.enemyAbyssGauge.hidden = !enemyHasAbyss;
    dom.playerBrantGauge.hidden = !playerHasBrant;
    dom.enemyBrantGauge.hidden = !enemyHasBrant;
    if (playerHasSpecial) {
      const isTime = player.template.id === "01";
      dom.playerSpecialLabel.textContent = isTime ? "时序" : "死告";
      updateSpecialGauge(dom.playerSpecialGauge, dom.playerSpecialText, player.specialEnergy, player.deathSentenceClock, player.knifeCount);
    }
    if (enemyHasSpecial) {
      const isTime = enemy.template.id === "01";
      dom.enemySpecialLabel.textContent = isTime ? "时序" : "死告";
      updateSpecialGauge(dom.enemySpecialGauge, dom.enemySpecialText, enemy.specialEnergy, enemy.deathSentenceClock, enemy.knifeCount);
    }
    if (playerHasAbyss) {
      dom.playerAbyssGauge.querySelector("i").style.width = `${clamp(player.abyssEnergy, 0, 100)}%`;
      dom.playerAbyssText.textContent = `${Math.round(player.abyssEnergy)}`;
    }
    if (enemyHasAbyss) {
      dom.enemyAbyssGauge.querySelector("i").style.width = `${clamp(enemy.abyssEnergy, 0, 100)}%`;
      dom.enemyAbyssText.textContent = `${Math.round(enemy.abyssEnergy)}`;
    }
    if (playerHasBrant) {
      dom.playerBrantGauge.querySelector("i").style.width = `${clamp(player.brantSpecialEnergy, 0, 100)}%`;
      dom.playerBrantText.textContent = `${Math.round(player.brantSpecialEnergy)}`;
    }
    if (enemyHasBrant) {
      dom.enemyBrantGauge.querySelector("i").style.width = `${clamp(enemy.brantSpecialEnergy, 0, 100)}%`;
      dom.enemyBrantText.textContent = `${Math.round(enemy.brantSpecialEnergy)}`;
    }
    const abyssTarget = player.template.ultimateType === "abyssBurst" ? nearestOpponent(player) : null;
    const abyssInRange = player.template.ultimateType !== "abyssBurst"
      || (abyssTarget && distance(player, abyssTarget) <= player.template.ultimateSeekRadius * CELL_SIZE);
    const verinaUnlocked = player.template.ultimateType !== "verinaBloom" || hasVerinaVine(player);
    const cantarellaUnlocked = player.template.ultimateType !== "cantarellaMirage"
      || player.cantarellaJellyDeaths >= player.template.jellyDeathsToUnlock;
    const ultimateAvailable = !player.template.transformThreshold
      && player.template.ultimateType !== "autoThreshold"
      && !player.charge
      && !(player.template.ultimateType === "abyssBurst" && !player.abyssForm)
      && abyssInRange
      && verinaUnlocked
      && cantarellaUnlocked
      && !(player.template.ultimateType === "overclock" && player.overclock > 0);
    const ready = mode === "play" && energy >= 100 && player.abilityCooldown <= 0 && ultimateAvailable && state === "playing" && !manualPaused;
    dom.abilityButton.disabled = !ready;
    dom.abilityButton.classList.toggle("is-ready", ready);
    if (state === "playing" && !voicePauseActive) {
      if (player.vortexLockTimer > 0) {
        dom.battleStatus.textContent = `时间乱流锁定 ${player.vortexLockTimer.toFixed(1)}s`;
      } else if (player.charge) {
        dom.battleStatus.textContent = `风障蓄力 ${player.charge.timer.toFixed(1)}s`;
      } else if (player.knockback) {
        dom.battleStatus.textContent = "被风波击退";
      } else if (player.stunned > 0) {
        dom.battleStatus.textContent = `眩晕 ${player.stunned.toFixed(1)}s`;
      } else if (enemy.vortexLockTimer > 0) {
        dom.battleStatus.textContent = `对手时间锁定 ${enemy.vortexLockTimer.toFixed(1)}s`;
      } else if (timeStopOwner === player && timeStopTimer > 0) {
        dom.battleStatus.textContent = `时序停界 ${timeStopTimer.toFixed(1)}s`;
      } else if (timeStopOwner === enemy && timeStopTimer > 0) {
        dom.battleStatus.textContent = `对手时停 ${timeStopTimer.toFixed(1)}s`;
      } else if (player.overclock > 0) {
        dom.battleStatus.textContent = `共鸣解放 ${player.overclock.toFixed(1)}s`;
      } else if (player.abyssForm) {
        dom.battleStatus.textContent = `恐怖镰刀人 · 暗涌 ${Math.ceil(player.abyssEnergy)}`;
      } else if (player.template.id === "06" && hasVerinaVine(player)) {
        dom.battleStatus.textContent = "藤蔓复苏 · 全场侵蚀";
      } else if (player.template.id === "06" && player.verinaSlowTimer > 0) {
        dom.battleStatus.textContent = "藤蔓束缚 · 移速 -50%";
      } else if (player.template.id === "04" && player.brantBigAnchorLock) {
        dom.battleStatus.textContent = "中场落锚 · 定身";
      } else if (player.template.id === "04" && player.brantAirborneTimer > 0) {
        dom.battleStatus.textContent = `绳索巡航 ${player.brantAirborneTimer.toFixed(1)}s · ${Math.round(player.template.brantAirborneDodgeChance * 100)}% 闪避`;
      } else if (player.template.id === "04" && player.brantUltimateTimer > 0) {
        dom.battleStatus.textContent = `船长狂想 ${player.brantUltimateTimer.toFixed(1)}s`;
      } else if (player.template.id === "05" && player.cantarellaMirageTimer > 0) {
        dom.battleStatus.textContent = `蜃境迷梦 ${player.cantarellaMirageTimer.toFixed(1)}s`;
      } else if (player.template.id === "05" && player.cantarellaJellyDeaths < player.template.jellyDeathsToUnlock) {
        dom.battleStatus.textContent = `水母献祭 ${player.cantarellaJellyDeaths}/${player.template.jellyDeathsToUnlock}`;
      } else if (player.timeForceTimer > 0) {
        dom.battleStatus.textContent = `时序加速 ${player.timeForceTimer.toFixed(1)}s`;
      } else if (player.horned) {
        dom.battleStatus.textContent = "羊角形态 · 黑咩待命";
      } else if (player.paralyzed > 0) {
        dom.battleStatus.textContent = `麻痹 ${player.paralyzed.toFixed(1)}s`;
      } else if (enemy.overclock > 0) {
        dom.battleStatus.textContent = `对手共鸣解放 ${enemy.overclock.toFixed(1)}s`;
      } else if (enemy.paralyzed > 0) {
        dom.battleStatus.textContent = `对手麻痹 ${enemy.paralyzed.toFixed(1)}s`;
      } else if (!player.inContact) {
        dom.battleStatus.textContent = "激战中";
      }
    }
  }

  function updateSpecialGauge(gauge, label, value, countdown = 0, knifeCount = 0) {
    const filled = Math.round(clamp(value, 0, 3));
    gauge.querySelectorAll("i").forEach((pip, index) => {
      pip.classList.toggle("is-filled", index < filled);
    });
    if (knifeCount > 0) label.textContent = `飞刃 ×${knifeCount}`;
    else label.textContent = filled >= 3 && countdown > 0 ? `${countdown.toFixed(1)}s` : `${filled}/3`;
    gauge.setAttribute("aria-label", knifeCount > 0 ? `永久时序飞刃 ${knifeCount} 柄` : `特殊能量 ${filled}/3`);
  }

  function spawnBurst(x, y, color, count, speed) {
    const availableSlots = Math.max(0, PARTICLE_LIMIT - particles.length);
    const spawnCount = Math.min(count, availableSlots);
    for (let i = 0; i < spawnCount; i += 1) {
      const angle = random(0, Math.PI * 2);
      const velocity = random(speed * 0.25, speed);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: random(0.24, 0.72),
        maxLife: 0.72,
        size: random(1.4, 4.4),
        color
      });
    }
  }

  function spawnDamageText(x, y, value, color, positive = false) {
    floatingTexts.push({
      x,
      y,
      text: `${positive ? "" : "−"}${value}`,
      color,
      life: 0.82,
      maxLife: 0.82,
      drift: random(-10, 10)
    });
  }

  function spawnEnergyGain(fighter, amount) {
    const shownAmount = Math.round(amount * getEnergyEfficiency(fighter));
    floatingTexts.push({
      x: fighter.x + random(-8, 8),
      y: fighter.y - fighter.r - 12,
      text: `+${shownAmount}% 共鸣`,
      color: "#ffe77d",
      life: 0.72,
      maxLife: 0.72,
      drift: random(-5, 5)
    });
  }

  function announce(text, color = "#ffffff", duration = 1.3) {
    dom.announcement.textContent = text;
    dom.announcement.style.color = color;
    dom.announcement.classList.add("show");
    announcementTimer = duration;
  }

  function addLog(text, type = "normal") {
    const li = document.createElement("li");
    const time = document.createElement("time");
    const span = document.createElement("span");
    const elapsed = Math.max(0, Math.min(999, Math.floor(roundSeconds - battleTimer)));
    time.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
    span.textContent = text;
    if (type === "ability") span.style.color = "#f4e7b7";
    if (type === "item") span.style.color = "#9ee6c0";
    if (type === "round") span.style.color = "#ffd88a";
    li.append(time, span);
    dom.battleLog.prepend(li);
    while (dom.battleLog.children.length > 7) {
      dom.battleLog.lastElementChild.remove();
    }
  }

  function draw() {
    const shakeX = screenShake > 0 ? random(-screenShake, screenShake) : 0;
    const shakeY = screenShake > 0 ? random(-screenShake, screenShake) : 0;
    ctx.save();
    ctx.clearRect(0, 0, ARENA_SIZE, ARENA_SIZE);
    ctx.fillStyle = "#0d111b";
    ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);
    if (voiceCameraMix > 0 && voiceFocusFighter) {
      const zoom = 1 + voiceCameraMix * 0.48;
      ctx.translate(ARENA_SIZE / 2, ARENA_SIZE / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-voiceFocusFighter.x, -voiceFocusFighter.y);
    }
    ctx.translate(shakeX, shakeY);
    ctx.drawImage(arenaLayer, 0, 0, ARENA_SIZE, ARENA_SIZE);
    drawCantarellaMirage();
    drawBrantTreasures();
    drawVerinaPlants();
    drawWindFields();
    drawCraters();
    drawTimeVortices();
    drawPickups();
    drawTrails();
    drawSummons();
    drawCantarellaJellies();
    if (mode !== "multi") drawContactLink();
    drawProjectiles();
    drawCantarellaUmbrellas();
    drawEffects(true);
    getActiveFighters().forEach((fighter, index) => {
      if (fighter.hp > 0 || (voicePauseActive && voiceFocusFighter === fighter)) {
        drawFighter(fighter, visualTime + index * 0.7);
      }
    });
    drawWandererKnives();
    drawPendingBlackSlams();
    drawParticles();
    drawWindWaves();
    drawEffects(false);
    drawFloatingTexts();
    drawVoicePauseEffect();
    ctx.restore();
  }

  function drawVoicePauseEffect() {
    if (!voicePauseActive || !activeVoiceEntry?.fighter) return;
    const fighter = activeVoiceEntry.fighter;
    const age = Math.max(0, visualTime - voiceEntryStartedAt);
    const entrance = Math.min(1, age / 0.22);
    const pulse = 1 + Math.sin(visualTime * 6.2) * 0.055;
    const radius = fighter.r + 24;
    ctx.save();
    ctx.fillStyle = `rgba(8, 7, 16, ${0.14 * entrance})`;
    ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);

    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(fighter.x, fighter.y, 2, fighter.x, fighter.y, radius * 2.35);
    halo.addColorStop(0, colorWithAlpha("#fff4cf", entrance * 0.2));
    halo.addColorStop(0.34, colorWithAlpha(fighter.template.color, entrance * 0.16));
    halo.addColorStop(1, colorWithAlpha(fighter.template.color, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(fighter.x, fighter.y, radius * 2.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(fighter.x, fighter.y);
    ctx.strokeStyle = colorWithAlpha("#fff6d7", entrance * 0.82);
    ctx.lineWidth = 2.2;
    ctx.shadowColor = fighter.template.color;
    ctx.shadowBlur = 22;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -visualTime * 34;
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 10; i += 1) {
      const angle = visualTime * 0.9 + (i / 10) * Math.PI * 2;
      const distance = radius + 8 + Math.sin(visualTime * 4.5 + i) * 5;
      const dotRadius = i % 2 ? 2.2 : 1.5;
      ctx.fillStyle = colorWithAlpha(i % 2 ? "#ffe9b0" : fighter.template.color, entrance * 0.86);
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = colorWithAlpha(fighter.template.color, entrance * 0.32);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i += 1) {
      const start = -visualTime * (0.55 + i * 0.18) + i * 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.88 + i * 0.2), start, start + Math.PI * 1.25);
      ctx.stroke();
    }

    ctx.fillStyle = colorWithAlpha("#fff8df", entrance * 0.72);
    ctx.font = "800 7px 'Trebuchet MS'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VOICE LOCK", 0, -radius - 14);
    ctx.restore();
  }

  function createArenaGradients(paint = ctx) {
    const background = paint.createLinearGradient(0, 0, ARENA_SIZE, ARENA_SIZE);
    background.addColorStop(0, "#101724");
    background.addColorStop(0.52, "#0b1019");
    background.addColorStop(1, "#12121c");
    const glow = paint.createRadialGradient(360, 345, 20, 360, 345, 390);
    glow.addColorStop(0, "rgba(87, 105, 160, 0.15)");
    glow.addColorStop(0.55, "rgba(44, 54, 86, 0.035)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    const border = paint.createLinearGradient(BOUNDARY, BOUNDARY, ARENA_SIZE - BOUNDARY, ARENA_SIZE - BOUNDARY);
    border.addColorStop(0, "rgba(255, 216, 77, 0.24)");
    border.addColorStop(0.35, "rgba(255, 255, 255, 0.08)");
    border.addColorStop(0.7, "rgba(92, 232, 229, 0.14)");
    border.addColorStop(1, "rgba(255, 255, 255, 0.055)");
    return { background, glow, border };
  }

  function drawArena(paint = ctx) {
    const { background, glow, border: borderGradient } = createArenaGradients(paint);
    paint.fillStyle = background;
    paint.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);
    paint.fillStyle = glow;
    paint.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);

    paint.save();
    paint.lineWidth = 1;
    for (let cell = 0; cell <= MAP_SIZE; cell += 1) {
      const p = BOUNDARY + cell * CELL_SIZE;
      const major = cell % 5 === 0;
      paint.strokeStyle = major ? "rgba(143, 164, 218, 0.12)" : "rgba(132, 151, 198, 0.045)";
      paint.beginPath();
      paint.moveTo(p, BOUNDARY);
      paint.lineTo(p, ARENA_SIZE - BOUNDARY);
      paint.stroke();
      paint.beginPath();
      paint.moveTo(BOUNDARY, p);
      paint.lineTo(ARENA_SIZE - BOUNDARY, p);
      paint.stroke();
    }

    paint.fillStyle = "rgba(178, 193, 231, 0.2)";
    paint.font = "700 7px 'Trebuchet MS'";
    paint.textAlign = "left";
    paint.textBaseline = "bottom";
    for (let cell = 5; cell < MAP_SIZE; cell += 5) {
      paint.fillText(String(cell), BOUNDARY + cell * CELL_SIZE + 3, BOUNDARY - 4);
    }

    paint.fillStyle = "rgba(160, 177, 221, 0.05)";
    paint.font = "800 11px 'Trebuchet MS'";
    paint.textAlign = "center";
    paint.textBaseline = "middle";
    paint.fillText(`${MAP_SIZE} × ${MAP_SIZE} TACTICAL GRID`, ARENA_SIZE / 2, ARENA_SIZE / 2);
    paint.restore();

    paint.strokeStyle = borderGradient;
    paint.lineWidth = 2;
    paint.strokeRect(BOUNDARY, BOUNDARY, ARENA_SIZE - BOUNDARY * 2, ARENA_SIZE - BOUNDARY * 2);
    paint.strokeStyle = "rgba(255, 255, 255, 0.035)";
    paint.lineWidth = 1;
    paint.strokeRect(BOUNDARY + 7, BOUNDARY + 7, ARENA_SIZE - BOUNDARY * 2 - 14, ARENA_SIZE - BOUNDARY * 2 - 14);

    drawCornerMark(BOUNDARY + 16, BOUNDARY + 16, 1, 1, "#ffd84d", paint);
    drawCornerMark(ARENA_SIZE - BOUNDARY - 16, BOUNDARY + 16, -1, 1, "#5ce8e5", paint);
    drawCornerMark(BOUNDARY + 16, ARENA_SIZE - BOUNDARY - 16, 1, -1, "#5ce8e5", paint);
    drawCornerMark(ARENA_SIZE - BOUNDARY - 16, ARENA_SIZE - BOUNDARY - 16, -1, -1, "#ffd84d", paint);
  }

  function drawCornerMark(x, y, sx, sy, color, paint = ctx) {
    paint.save();
    paint.strokeStyle = color;
    paint.globalAlpha = 0.32;
    paint.lineWidth = 2;
    paint.beginPath();
    paint.moveTo(x, y + sy * 17);
    paint.lineTo(x, y);
    paint.lineTo(x + sx * 17, y);
    paint.stroke();
    paint.restore();
  }

  function drawTrails() {
    ctx.save();
    getActiveFighters().forEach((fighter) => {
      if (!fighter) return;
      fighter.trail.forEach((point) => {
        const alpha = clamp(point.life / point.maxLife, 0, 1) * 0.15;
        ctx.fillStyle = colorWithAlpha(fighter.template.color, alpha);
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r * (point.life / point.maxLife), 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  }

  function drawBrantTreasures() {
    const chestPortrait = summonPortraits.get("brant-chest");
    brantChests.forEach((chest) => {
      const pulse = 1 + Math.sin(visualTime * 4 + chest.phase) * 0.06;
      const fade = chest.life < 2 ? 0.45 + Math.sin(visualTime * 12) * 0.25 : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = "rgba(218, 105, 151, 0.48)";
      ctx.fillStyle = "rgba(169, 65, 111, 0.07)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = -visualTime * 12;
      ctx.beginPath();
      ctx.arc(chest.x, chest.y, chest.r * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      if (chestPortrait?.complete) {
        const height = CELL_SIZE * 1.5;
        const width = height * (chestPortrait.naturalWidth / chestPortrait.naturalHeight);
        ctx.shadowColor = "#d7749b";
        ctx.shadowBlur = 15;
        ctx.drawImage(
          chestPortrait,
          chest.x - width / 2,
          chest.y - height / 2 + Math.sin(visualTime * 2.7 + chest.phase) * 3,
          width,
          height
        );
      }
      ctx.restore();
    });

    getActiveFighters().forEach((fighter) => {
      if (fighter?.template.id !== "04" || fighter.brantAirborneTimer <= 0) return;
      ctx.save();
      ctx.strokeStyle = "rgba(225, 126, 167, 0.72)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = -visualTime * 28;
      ctx.beginPath();
      ctx.moveTo(fighter.x, 0);
      ctx.lineTo(fighter.x + Math.sin(visualTime * 2.2) * 8, fighter.y - fighter.r);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    brantAnchors.forEach((anchor) => {
      const radiusX = (anchor.kind === "big" ? anchor.owner.template.brantBigRadiusX : anchor.owner.template.brantSmallRadiusX) * CELL_SIZE;
      const radiusY = (anchor.kind === "big" ? anchor.owner.template.brantBigRadiusY : anchor.owner.template.brantSmallRadiusY) * CELL_SIZE;
      const progress = 1 - Math.max(0, anchor.timer) / anchor.maxTimer;
      ctx.save();
      ctx.translate(anchor.x, anchor.y);
      ctx.rotate(anchor.angle);
      ctx.fillStyle = "rgba(157, 45, 92, 0.1)";
      ctx.strokeStyle = "rgba(229, 121, 162, 0.72)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.lineDashOffset = -visualTime * 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawBrantAnchorGlyph(
        anchor.x,
        anchor.y - (1 - progress) * 170,
        anchor.kind === "big" ? 1.25 : 0.85,
        anchor.kind === "big" ? "#ed7ea7" : "#cb5a82",
        0.82
      );
    });
  }

  function drawBrantAnchorGlyph(x, y, scale, color, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(0, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -24, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-17, 7);
    ctx.quadraticCurveTo(-15, 27, 0, 27);
    ctx.quadraticCurveTo(15, 27, 17, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -7);
    ctx.lineTo(8, -7);
    ctx.stroke();
    ctx.restore();
  }

  function drawVerinaPlants() {
    verinaPlants.forEach((plant) => {
      if (!plant.owner || plant.owner.hp <= 0) return;
      if (plant.isVine) {
        const pulse = 0.5 + Math.sin(visualTime * 2.1 + plant.phase) * 0.08;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const aura = ctx.createRadialGradient(plant.x, plant.y, 3, plant.x, plant.y, ARENA_SIZE * 0.48);
        aura.addColorStop(0, "rgba(220,245,126,0.12)");
        aura.addColorStop(0.55, "rgba(125,195,89,0.055)");
        aura.addColorStop(1, "rgba(77,137,62,0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, ARENA_SIZE * 0.48, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 10; i += 1) {
          const angle = plant.phase + i * Math.PI * 0.2 + Math.sin(visualTime * 0.75 + i) * 0.08;
          const length = ARENA_SIZE * (0.25 + (i % 3) * 0.075);
          const endX = plant.x + Math.cos(angle) * length;
          const endY = plant.y + Math.sin(angle) * length;
          const midX = plant.x + Math.cos(angle + 0.3) * length * 0.58;
          const midY = plant.y + Math.sin(angle + 0.3) * length * 0.58;
          ctx.strokeStyle = `rgba(205,236,119,${0.32 + Math.sin(visualTime * 3 + i) * 0.08})`;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = "#cde977";
          ctx.shadowBlur = 13;
          ctx.beginPath();
          ctx.moveTo(plant.x, plant.y);
          ctx.quadraticCurveTo(midX, midY, endX, endY);
          ctx.stroke();
          ctx.fillStyle = "rgba(222,245,135,0.5)";
          ctx.beginPath();
          ctx.ellipse(endX, endY, 8, 3.7, angle + 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(232,255,151,${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, CELL_SIZE * 1.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(239,255,178,0.74)";
        ctx.font = "800 8px 'Trebuchet MS'";
        ctx.textAlign = "center";
        ctx.fillText("藤", plant.x, plant.y + 3);
        ctx.restore();
        return;
      }

      const pulse = 1 + Math.sin(visualTime * 2.8 + plant.phase) * 0.04;
      ctx.save();
      ctx.translate(plant.x, plant.y);
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, plant.radius);
      glow.addColorStop(0, "rgba(235,255,164,0.16)");
      glow.addColorStop(0.55, "rgba(151,214,105,0.09)");
      glow.addColorStop(1, "rgba(112,169,83,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, plant.radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(210,242,132,0.46)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 7]);
      ctx.lineDashOffset = -visualTime * 12;
      ctx.beginPath();
      ctx.arc(0, 0, plant.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#bddb70";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.quadraticCurveTo(-1, -4, 1, -13);
      ctx.stroke();
      ctx.fillStyle = "#cce778";
      ctx.beginPath();
      ctx.ellipse(-6, -7, 8, 4.2, -0.55, 0, Math.PI * 2);
      ctx.ellipse(7, -10, 8, 4.2, 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(237,255,176,0.7)";
      ctx.font = "700 6px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.fillText("芽", 0, 15);
      ctx.restore();
    });
  }

  function drawCantarellaMirage() {
    const casters = getActiveFighters().filter((fighter) => (
      fighter.template.id === "05"
      && fighter.hp > 0
      && fighter.cantarellaMirageTimer > 0
    ));
    casters.forEach((caster, index) => {
      const pulse = 0.5 + Math.sin(visualTime * 2.6 + index) * 0.18;
      ctx.save();
      ctx.strokeStyle = `rgba(179, 132, 255, ${0.3 + pulse * 0.22})`;
      ctx.lineWidth = 10;
      ctx.shadowColor = "#a56dff";
      ctx.shadowBlur = 18;
      ctx.setLineDash([24, 12]);
      ctx.lineDashOffset = -visualTime * 32;
      ctx.strokeRect(BOUNDARY + 3, BOUNDARY + 3, ARENA_SIZE - BOUNDARY * 2 - 6, ARENA_SIZE - BOUNDARY * 2 - 6);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(218, 190, 255, 0.52)";
      ctx.setLineDash([7, 15]);
      ctx.lineDashOffset = visualTime * 24;
      ctx.strokeRect(BOUNDARY + 15, BOUNDARY + 15, ARENA_SIZE - BOUNDARY * 2 - 30, ARENA_SIZE - BOUNDARY * 2 - 30);
      ctx.setLineDash([]);
      for (let i = 0; i < 20; i += 1) {
        const t = i / 20;
        const x = BOUNDARY + 28 + t * (ARENA_SIZE - BOUNDARY * 2 - 56);
        const drift = Math.sin(visualTime * 2.1 + i * 1.7) * 7;
        ctx.fillStyle = `rgba(211, 174, 255, ${0.18 + (i % 3) * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, BOUNDARY + 25 + drift, i % 2 ? 2.2 : 1.4, 0, Math.PI * 2);
        ctx.arc(x, ARENA_SIZE - BOUNDARY - 25 - drift, i % 2 ? 1.6 : 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawCantarellaJellies() {
    cantarellaJellies.forEach((unit) => {
      if (!unit.owner || unit.owner.hp <= 0 || unit.hp <= 0) return;
      const bob = Math.sin(visualTime * 2.7 + unit.phase) * 2.5;
      const slowTint = unit.cantarellaSlowTimer > 0;
      const r = unit.r * 1.18;
      ctx.save();
      ctx.translate(unit.x, unit.y + bob);

      const aura = ctx.createRadialGradient(0, -2, 1, 0, 0, r * 2.1);
      aura.addColorStop(0, "rgba(214, 234, 255, 0.2)");
      aura.addColorStop(0.5, "rgba(154, 119, 238, 0.12)");
      aura.addColorStop(1, "rgba(101, 72, 181, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineCap = "round";
      for (let i = 0; i < 3; i += 1) {
        const offset = (i - 1) * r * 0.42;
        const sway = Math.sin(visualTime * 3.6 + unit.phase + i * 1.4) * r * 0.34;
        const ribbon = ctx.createLinearGradient(offset, r * 0.2, offset + sway, r * 2.8);
        ribbon.addColorStop(0, "rgba(216, 239, 255, 0.5)");
        ribbon.addColorStop(0.55, i === 1 ? "rgba(156, 121, 239, 0.3)" : "rgba(185, 215, 255, 0.28)");
        ribbon.addColorStop(1, "rgba(137, 100, 223, 0.03)");
        ctx.fillStyle = ribbon;
        ctx.beginPath();
        ctx.moveTo(offset - r * 0.16, r * 0.28);
        ctx.bezierCurveTo(offset + sway, r * 1.05, offset - sway, r * 1.95, offset + sway * 0.45, r * 2.8);
        ctx.bezierCurveTo(offset + sway * 0.62 + r * 0.25, r * 2.1, offset - sway * 0.3 + r * 0.2, r * 1.1, offset + r * 0.16, r * 0.28);
        ctx.closePath();
        ctx.fill();
      }
      for (let i = 0; i < 4; i += 1) {
        const offset = (i - 1.5) * r * 0.3;
        const sway = Math.sin(visualTime * 4.3 + unit.phase + i) * r * 0.22;
        ctx.strokeStyle = i % 2 ? "rgba(164, 129, 242, 0.42)" : "rgba(218, 239, 255, 0.4)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(offset, r * 0.38);
        ctx.bezierCurveTo(offset + sway, r * 1.25, offset - sway, r * 2.2, offset + sway * 0.65, r * 3.05);
        ctx.stroke();
      }

      const bell = ctx.createLinearGradient(0, -r * 1.25, 0, r * 0.5);
      bell.addColorStop(0, "rgba(244, 249, 255, 0.92)");
      bell.addColorStop(0.24, "rgba(203, 218, 255, 0.88)");
      bell.addColorStop(0.62, "rgba(158, 126, 235, 0.82)");
      bell.addColorStop(1, slowTint ? "rgba(111, 86, 181, 0.78)" : "rgba(136, 96, 221, 0.8)");
      ctx.fillStyle = bell;
      ctx.strokeStyle = "rgba(224, 242, 255, 0.82)";
      ctx.lineWidth = 1.15;
      ctx.shadowColor = "rgba(171, 136, 255, 0.55)";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.08);
      ctx.bezierCurveTo(-r * 1.05, -r * 0.9, -r * 0.55, -r * 1.28, 0, -r * 1.24);
      ctx.bezierCurveTo(r * 0.62, -r * 1.2, r * 1.05, -r * 0.76, r, r * 0.08);
      for (let i = 0; i < 6; i += 1) {
        const x0 = r - (i / 6) * r * 2;
        const x1 = r - ((i + 0.5) / 6) * r * 2;
        const x2 = r - ((i + 1) / 6) * r * 2;
        ctx.quadraticCurveTo(x1, r * 0.34, x2, r * (i % 2 ? 0.08 : 0.16));
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(247, 252, 255, 0.58)";
      ctx.beginPath();
      ctx.ellipse(-r * 0.32, -r * 0.66, r * 0.42, r * 0.13, -0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(226, 246, 255, 0.56)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-r * 0.66, -r * 0.18);
      ctx.quadraticCurveTo(-r * 0.22, -r * 0.52, r * 0.12, -r * 0.25);
      ctx.stroke();

      if (unit.cantarellaDreamed) {
        ctx.strokeStyle = "rgba(229, 190, 255, 0.9)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, r + 7 + Math.sin(visualTime * 5) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = "rgba(20, 12, 34, 0.72)";
      ctx.fillRect(-r, r + 7, r * 2, 3);
      ctx.fillStyle = "#d6b3ff";
      ctx.fillRect(-r, r + 7, r * 2 * clamp(unit.hp / unit.maxHp, 0, 1), 3);
      ctx.fillStyle = "rgba(235, 218, 255, 0.8)";
      ctx.font = "700 6px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.fillText("水母", 0, r + 18);
      ctx.restore();
    });
  }

  function drawCantarellaUmbrellas() {
    const umbrella = weaponPortraits.get("05");
    cantarellaUmbrellas.forEach((unit) => {
      const size = CELL_SIZE * 1.75;
      ctx.save();
      ctx.translate(unit.x, unit.y + Math.sin(visualTime * 3 + unit.phase) * 2);
      ctx.rotate(unit.angle + Math.PI / 2 + unit.spin);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.34;
      ctx.strokeStyle = "#d7c4ff";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 7]);
      for (let i = 0; i < 3; i += 1) {
        const offset = i * Math.PI * 2 / 3;
        ctx.beginPath();
        ctx.arc(0, 0, size * (0.48 + i * 0.045), offset, offset + Math.PI * 0.62);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.shadowColor = "#b88cff";
      ctx.shadowBlur = 6;
      if (umbrella?.complete && umbrella.naturalWidth > 0) {
        ctx.drawImage(umbrella, -size / 2, -size / 2, size, size);
      } else {
        ctx.strokeStyle = "#cdaaff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.4, Math.PI * 0.15, Math.PI * 1.85);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawSummons() {
    const portrait = summonPortraits.get("white-sheep");
    if (!portrait?.complete) return;
    summonUnits.forEach((unit) => {
      if (!unit.owner || unit.owner.hp <= 0) return;
      const height = CELL_SIZE * 2.65;
      const width = height * (portrait.naturalWidth / portrait.naturalHeight);
      ctx.save();
      ctx.translate(unit.x, unit.y + Math.sin(visualTime * 2.4 + unit.phase) * 3);
      ctx.rotate(Math.sin(visualTime * 1.7 + unit.phase) * 0.055);
      ctx.shadowColor = "#ffd6a3";
      ctx.shadowBlur = 9;
      ctx.drawImage(portrait, -width / 2, -height / 2, width, height);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "800 7px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.fillText("白咩", 0, height / 2 + 9);
      ctx.restore();
    });
  }

  function drawPendingBlackSlams() {
    const portrait = summonPortraits.get("black-sheep");
    blackSlams.forEach((slam) => {
      const progress = 1 - Math.max(0, slam.timer) / slam.maxTimer;
      const attacker = slam.attacker;
      const range = attacker.template.hornedHitRange * CELL_SIZE;
      ctx.save();
      const warning = ctx.createRadialGradient(attacker.x, attacker.y, 4, attacker.x, attacker.y, range);
      warning.addColorStop(0, `rgba(215, 222, 234, ${0.08 + progress * 0.1})`);
      warning.addColorStop(0.82, `rgba(161, 173, 196, ${0.05 + progress * 0.07})`);
      warning.addColorStop(1, "rgba(116, 128, 153, 0.015)");
      ctx.fillStyle = warning;
      ctx.beginPath();
      ctx.arc(attacker.x, attacker.y, range, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colorWithAlpha("#eef2f8", 0.58 + Math.sin(visualTime * 28) * 0.16);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 5]);
      ctx.lineDashOffset = -visualTime * 22;
      ctx.beginPath();
      ctx.arc(attacker.x, attacker.y, range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(238, 242, 248, 0.34)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i += 1) {
        const angle = i / 12 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(attacker.x + Math.cos(angle) * (range - 8), attacker.y + Math.sin(angle) * (range - 8));
        ctx.lineTo(attacker.x + Math.cos(angle) * (range + 5), attacker.y + Math.sin(angle) * (range + 5));
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(238, 242, 248, 0.78)";
      ctx.font = "800 8px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`黑咩落点 ${slam.timer.toFixed(2)}s`, attacker.x, attacker.y - range - 10);
      if (portrait?.complete && portrait.naturalWidth > 0) {
        const height = CELL_SIZE * 4.8;
        const width = height * (portrait.naturalWidth / portrait.naturalHeight);
        const targetY = attacker.y - attacker.r * 0.3;
        const drawY = targetY - height - 150 * Math.pow(1 - progress, 1.8);
        ctx.globalAlpha = 0.72 + progress * 0.28;
        ctx.shadowColor = "#d5dbe4";
        ctx.shadowBlur = 22;
        ctx.drawImage(portrait, attacker.x - width / 2, drawY, width, height);
      }
      ctx.restore();
    });
  }

  function drawCraters() {
    craters.forEach((crater) => {
      const pulse = 1 + Math.sin(visualTime * 9 + crater.phase) * 0.08;
      const fade = Math.min(1, crater.life);
      const radius = crater.size / 2;
      ctx.save();
      ctx.translate(crater.x, crater.y);
      ctx.globalAlpha = fade;
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 1.18 * pulse);
      glow.addColorStop(0, "rgba(255,154,80,0.55)");
      glow.addColorStop(0.48, "rgba(197,65,31,0.34)");
      glow.addColorStop(1, "rgba(70,18,10,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(106,42,24,0.27)";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,159,92,0.42)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 9; i += 1) {
        const angle = crater.phase + i * 1.7;
        const spread = radius * (0.18 + ((i * 37) % 55) / 100);
        ctx.fillStyle = i % 2 ? "#ffbd67" : "#ff6d3e";
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * spread,
          Math.sin(angle) * spread - 2,
          1.5 + Math.sin(visualTime * 12 + i) * 0.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawWindFields() {
    windFields.forEach((field) => {
      const pulse = 1 + Math.sin(visualTime * 3.4 + field.phase) * 0.035;
      const fade = clamp(field.life / 0.7, 0, 1);
      ctx.save();
      ctx.translate(field.x, field.y);
      ctx.globalAlpha = fade;
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, field.radius * 1.08);
      glow.addColorStop(0, "rgba(217,255,204,0.09)");
      glow.addColorStop(0.62, "rgba(155,220,130,0.08)");
      glow.addColorStop(0.94, "rgba(155,220,130,0.18)");
      glow.addColorStop(1, "rgba(155,220,130,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, field.radius * 1.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(190,245,168,0.45)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([9, 8]);
      ctx.lineDashOffset = -visualTime * 22;
      ctx.beginPath();
      ctx.arc(0, 0, field.radius * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 3; i += 1) {
        const start = visualTime * (1.5 + i * 0.24) + i * 2.1;
        ctx.strokeStyle = `rgba(190,245,168,${0.26 - i * 0.05})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, field.radius * (0.34 + i * 0.2), start, start + Math.PI * 1.35);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(218,255,206,0.62)";
      ctx.font = "700 7px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${field.life.toFixed(1)}s`, 0, 0);
      ctx.restore();
    });
  }

  function drawWindWaves() {
    windWaves.forEach((wave) => {
      const alpha = clamp(wave.life / 0.55, 0, 1);
      const arc = getWindWaveArcGeometry(wave);
      ctx.save();
      ctx.translate(wave.x, wave.y);
      ctx.rotate(wave.angle);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.shadowColor = "#b9f3a4";
      ctx.shadowBlur = 34;
      for (let layer = 0; layer < 3; layer += 1) {
        ctx.strokeStyle = colorWithAlpha(layer === 0 ? "#efffe9" : "#9bdc82", 0.72 - layer * 0.18);
        ctx.lineWidth = 13 - layer * 3.5;
        ctx.beginPath();
        ctx.arc(arc.centerOffset, 0, arc.radius - layer * 2, -arc.halfAngle, arc.halfAngle);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(239,255,233,0.86)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(arc.centerOffset, 0, arc.radius - 6, -arc.halfAngle * 0.93, arc.halfAngle * 0.93);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawTimeVortices() {
    timeVortices.forEach((vortex) => {
      const pulse = 1 + Math.sin(visualTime * 2.8 + vortex.phase) * 0.07;
      ctx.save();
      ctx.translate(vortex.x, vortex.y);
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, vortex.radius * 1.35);
      glow.addColorStop(0, "rgba(255,225,139,0.2)");
      glow.addColorStop(0.55, "rgba(255,194,67,0.12)");
      glow.addColorStop(1, "rgba(255,177,40,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, vortex.radius * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,217,111,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 7]);
      ctx.lineDashOffset = -visualTime * 18;
      ctx.beginPath();
      ctx.arc(0, 0, vortex.radius * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.strokeStyle = `rgba(255,214,107,${0.42 - ring * 0.09})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, vortex.radius * (0.44 + ring * 0.18), visualTime * (1.2 + ring * 0.3), visualTime * (1.2 + ring * 0.3) + Math.PI * 1.45);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,236,181,0.58)";
      ctx.font = "700 7px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.ceil(vortex.life)}s`, 0, 2);
      ctx.restore();
    });
  }

  function drawContactLink() {
    if (!player?.inContact || !enemy?.inContact) return;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = dx / length;
    const ny = dy / length;
    const startX = player.x + nx * player.r;
    const startY = player.y + ny * player.r;
    const endX = enemy.x - nx * enemy.r;
    const endY = enemy.y - ny * enemy.r;
    const pulse = 0.68 + Math.sin(visualTime * 15) * 0.22;
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, colorWithAlpha(player.template.color, pulse));
    gradient.addColorStop(0.5, "rgba(255,255,240,0.92)");
    gradient.addColorStop(1, colorWithAlpha(enemy.template.color, pulse));

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3.4;
    ctx.shadowColor = player.template.color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.strokeStyle = colorWithAlpha("#fff9cf", pulse * 0.8);
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3, 5]);
    ctx.lineDashOffset = -visualTime * 26;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;
    for (let i = 0; i < 3; i += 1) {
      const offset = Math.sin(visualTime * 11 + i * 2.1) * 13;
      ctx.fillStyle = i % 2 ? player.template.color : enemy.template.color;
      ctx.beginPath();
      ctx.arc(centerX - ny * offset, centerY + nx * offset, 1.8 + i * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 247, 205, 0.72)";
    ctx.font = "800 7px 'Trebuchet MS'";
    ctx.textAlign = "center";
    ctx.fillText("CHARGE", centerX, centerY - 16);
    ctx.restore();
  }

  function drawPickups() {
    pickups.forEach((pickup) => {
      const pulse = 1 + Math.sin(visualTime * 3.2 + pickup.phase) * 0.12;
      const alpha = pickup.life < 2 ? 0.45 + Math.sin(visualTime * 12) * 0.28 : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pickup.x, pickup.y);
      ctx.rotate(visualTime * 0.55);
      ctx.strokeStyle = colorWithAlpha(pickup.color, 0.55);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 21 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 27, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colorWithAlpha(pickup.color, 0.15);
      ctx.beginPath();
      ctx.arc(0, 0, pickup.r * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = pickup.color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = pickup.color;
      ctx.font = `900 ${pickup.type === "rage" ? 19 : 17}px 'Trebuchet MS'`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pickup.glyph, 0, 1);
      ctx.restore();
    });
  }

  function drawFighter(fighter, t) {
    if (!fighter) return;
    const speed = Math.hypot(fighter.vx, fighter.vy);
    const wobble = state === "idle" ? Math.sin(t * 1.3) * 0.012 : Math.min(0.06, speed / 5000);
    const radius = fighter.r;
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.rotate(clamp(fighter.tilt, -0.13, 0.13));
    if (fighter.hp <= 0) ctx.globalAlpha = 0.55;

    if (voicePauseActive && voiceFocusFighter === fighter) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = colorWithAlpha(fighter.template.color, 0.75);
      ctx.lineWidth = 2.5;
      ctx.shadowColor = fighter.template.color;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 18 + Math.sin(visualTime * 4) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (fighter.template.attackType === "melee" || fighter.template.attackType === "thrust" || fighter.horned) {
      const range = getAttackRangeCells(fighter) * CELL_SIZE;
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.fillStyle = fighter.template.color;
      ctx.beginPath();
      ctx.arc(0, 0, range, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.13;
      ctx.strokeStyle = fighter.template.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#020308";
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.82, radius * 0.86, radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const directionAngle = Math.atan2(fighter.vy, fighter.vx);
    ctx.save();
    ctx.rotate(directionAngle);
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = fighter.template.color;
    ctx.beginPath();
    ctx.moveTo(radius + 11, 0);
    ctx.lineTo(radius + 4, -4);
    ctx.lineTo(radius + 4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(1 + wobble, 1 - wobble);
    const bodyGlow = ctx.createRadialGradient(-radius * 0.34, -radius * 0.42, 2, 0, 0, radius * 1.42);
    bodyGlow.addColorStop(0, "#fff7df");
    bodyGlow.addColorStop(0.13, lightenColor(fighter.template.color));
    bodyGlow.addColorStop(0.52, fighter.template.color);
    bodyGlow.addColorStop(1, fighter.template.dark);
    ctx.shadowColor = colorWithAlpha(fighter.template.color, 0.6);
    ctx.shadowBlur = 23;
    ctx.fillStyle = bodyGlow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = colorWithAlpha("#ffffff", 0.42);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1.5, Math.PI * 1.06, Math.PI * 1.88);
    ctx.stroke();

    const eyeY = -2;
    const blink = fighter.blink > 0;
    ctx.fillStyle = "#20212a";
    if (blink) {
      ctx.strokeStyle = "#20212a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, eyeY);
      ctx.lineTo(-4, eyeY);
      ctx.moveTo(4, eyeY);
      ctx.lineTo(10, eyeY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(-7, eyeY, 2.6, 4.2, 0, 0, Math.PI * 2);
      ctx.ellipse(7, eyeY, 2.6, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.72;
      ctx.beginPath();
      ctx.arc(-7.7, eyeY - 1.4, 0.8, 0, Math.PI * 2);
      ctx.arc(6.3, eyeY - 1.4, 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = "rgba(40, 32, 28, 0.75)";
    ctx.lineWidth = 1.7;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (fighter.side === 0) {
      ctx.arc(0, 7, 5, 0.18, Math.PI - 0.18);
    } else {
      ctx.arc(0, 10, 4.2, Math.PI + 0.25, -0.25);
    }
    ctx.stroke();
    ctx.restore();

    const usesAlternate = (fighter.horned || fighter.abyssForm) && fighter.template.altImage;
    const portraitKey = usesAlternate
      ? (fighter.template.altPortraitKey || `${fighter.template.id}:alt`)
      : (fighter.template.portraitKey || fighter.template.id);
    const portrait = fighterPortraits.get(portraitKey);
    if (portrait?.complete && portrait.naturalWidth > 0) {
      drawFighterPortrait(
        portrait,
        radius,
        fighter.template.id === "02" && fighter.abyssForm,
        fighter.template.id === "02" && fighter.abyssForm ? "#24152e" : "#d8e4f0"
      );
    }
    if (fighter.template.id === "kakarot-test") {
      drawKakarotWeapon(fighter, radius, t);
    } else if (fighter.template.id === "01") {
      drawWandererWeapon(fighter, radius, t);
    } else if (fighter.template.id === "02") {
      if (fighter.abyssForm) drawAbyssScythe(fighter, radius, t);
      else drawWandererWeapon(fighter, radius, t);
    } else if (fighter.template.id === "04") {
      drawBrantWeapons(fighter, radius, t);
    } else if (fighter.template.id === "05") {
      drawCantarellaWeapon(fighter, radius, t);
    }

    if (fighter.overclock > 0) {
      drawElectricAura(radius, t, "#bba4ff", 1);
      ctx.strokeStyle = colorWithAlpha("#e7ddff", 0.72);
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, radius + 12 + Math.sin(t * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (fighter.abyssForm) {
      drawAbyssAura(radius, t);
    }
    if (fighter.template.id === "04" && fighter.brantAirborneTimer > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(238, 143, 179, 0.72)";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "#d65f8e";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 13 + Math.sin(t * 5.2) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (fighter.cantarellaDreamed) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(226, 187, 255, 0.82)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 5]);
      ctx.lineDashOffset = -visualTime * 16;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 11 + Math.sin(t * 4.8) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(231, 202, 255, 0.86)";
      ctx.font = "800 7px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.fillText("迷梦", 0, -radius - 13);
      ctx.restore();
    }

    if (fighter.paralyzed > 0) {
      drawElectricAura(radius + 3, t * 1.25, "#d0bcff", 0.8);
      ctx.fillStyle = "#d9caff";
      ctx.font = "800 7px 'Trebuchet MS'";
      ctx.textAlign = "center";
      ctx.fillText("麻痹", 0, -radius - 15);
    }

    if (fighter.energy > 0) {
      ctx.strokeStyle = colorWithAlpha("#fff4c1", 0.7);
      ctx.lineWidth = 2.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, radius + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (fighter.energy / 100));
      ctx.stroke();
    }

    if (fighter.charge) {
      const progress = 1 - fighter.charge.timer / Math.max(0.001, fighter.charge.maxTimer);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(185,243,164,0.85)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#9bdc82";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();
      for (let i = 0; i < 3; i += 1) {
        const angle = t * 2.4 + i * Math.PI * 2 / 3;
        ctx.globalAlpha = 0.42 + Math.sin(t * 9 + i) * 0.2;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 20 + i * 5, angle, angle + Math.PI * 0.62);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (fighter.shield > 0) {
      const shieldPulse = 1 + Math.sin(t * 7) * 0.045;
      const brantShield = fighter.template.id === "04";
      const shieldGradient = brantShield
        ? ctx.createLinearGradient(-radius - 12, 0, radius + 12, 0)
        : null;
      if (shieldGradient) {
        shieldGradient.addColorStop(0, colorWithAlpha("#71356f", 0.92));
        shieldGradient.addColorStop(0.52, colorWithAlpha("#b55d9b", 0.82));
        shieldGradient.addColorStop(1, colorWithAlpha("#f0a0aa", 0.9));
      }
      ctx.strokeStyle = brantShield ? shieldGradient : colorWithAlpha("#b8ff9f", 0.65);
      ctx.fillStyle = brantShield ? "rgba(115, 46, 107, 0.1)" : colorWithAlpha("#91e77a", 0.08);
      ctx.lineWidth = 2.2;
      if (brantShield) {
        ctx.shadowColor = "#a95598";
        ctx.shadowBlur = 16;
      }
      ctx.beginPath();
      ctx.arc(0, 0, (radius + 11) * shieldPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.2;
        const x = Math.cos(angle) * (radius + 13);
        const y = Math.sin(angle) * (radius + 13);
        ctx.fillStyle = brantShield ? (i % 2 ? "#ef9da9" : "#a65a9c") : "#b8ff9f";
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (fighter.freeze > 0) {
      ctx.strokeStyle = colorWithAlpha("#9ff4f9", 0.66);
      ctx.fillStyle = colorWithAlpha("#68e4ed", 0.11);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 6; i += 1) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (radius + 4), Math.sin(angle) * (radius + 4));
        ctx.lineTo(Math.cos(angle) * (radius + 12), Math.sin(angle) * (radius + 12));
        ctx.stroke();
      }
    }

    if (fighter.burn > 0) {
      for (let i = 0; i < 4; i += 1) {
        const angle = t * 2.4 + i * 1.7;
        const px = Math.cos(angle) * (radius + 3);
        const py = -radius + Math.sin(angle) * 5 - (t * 18 + i * 10) % 18;
        ctx.fillStyle = colorWithAlpha(i % 2 ? "#ffd26a" : "#ff704f", 0.58);
        ctx.beginPath();
        ctx.arc(px, py, 2 + i * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (fighter.flash > 0) {
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = colorWithAlpha("#ffffff", fighter.flash * 0.33);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.fillStyle = colorWithAlpha("#ffffff", 0.58);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 7px 'Trebuchet MS'";
    ctx.fillText(fighter.side === 0 && mode === "play" ? "YOU" : fighter.template.name, 0, radius + 17);
    ctx.restore();
  }

  function drawFighterPortrait(portrait, radius, contain = false, background = "#d8e4f0") {
    const inset = radius - 1.6;
    const targetSize = inset * 2;
    const scale = contain
      ? Math.min(targetSize / portrait.naturalWidth, targetSize / portrait.naturalHeight)
      : Math.max(targetSize / portrait.naturalWidth, targetSize / portrait.naturalHeight);
    const sourceWidth = contain ? portrait.naturalWidth : targetSize / scale;
    const sourceHeight = contain ? portrait.naturalHeight : targetSize / scale;
    const sourceX = contain ? 0 : (portrait.naturalWidth - sourceWidth) / 2;
    const sourceY = contain ? 0 : Math.max(0, (portrait.naturalHeight - sourceHeight) / 2 - 1);
    const drawWidth = contain ? portrait.naturalWidth * scale : targetSize;
    const drawHeight = contain ? portrait.naturalHeight * scale : targetSize;
    const drawX = contain ? -drawWidth / 2 : -inset;
    const drawY = contain ? -drawHeight / 2 : -inset;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, inset, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = background;
    ctx.fillRect(-inset, -inset, inset * 2, inset * 2);
    ctx.drawImage(portrait, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);
    const shade = ctx.createRadialGradient(-inset * 0.35, -inset * 0.4, 1, 0, 0, inset);
    shade.addColorStop(0, "rgba(255,255,255,0.06)");
    shade.addColorStop(0.66, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(4,5,10,0.22)");
    ctx.fillStyle = shade;
    ctx.fillRect(-inset, -inset, inset * 2, inset * 2);
    ctx.restore();
  }

  function drawKakarotWeapon(fighter, radius, t) {
    const weapon = weaponPortraits.get(fighter.template.id);
    if (!weapon?.complete || !weapon.naturalWidth) return;
    const height = radius * 3.1;
    const width = height * (weapon.naturalWidth / weapon.naturalHeight);
    const restAngle = 0.42 + Math.sin(t * 1.8) * 0.025 + (fighter.overclock > 0 ? -0.16 : 0);
    const drawWeapon = (angle, alpha) => {
      ctx.save();
      ctx.translate(radius * 0.88, -radius * 0.08);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = fighter.overclock > 0 ? "#79fff3" : "#6bdbe1";
      ctx.shadowBlur = fighter.overclock > 0 ? 22 : 12;
      ctx.drawImage(weapon, -width / 2, -height * 0.58, width, height);
      ctx.restore();
    };
    if (fighter.weaponSwing > 0) {
      const progress = 1 - fighter.weaponSwing / fighter.weaponSwingMax;
      for (let trail = 3; trail >= 1; trail -= 1) {
        const trailProgress = Math.max(0, progress - trail * 0.1);
        drawWeapon(-2.2 + trailProgress * Math.PI * 1.75, 0.1 + (3 - trail) * 0.08);
      }
      drawWeapon(-2.2 + progress * Math.PI * 1.75, 1);
    } else {
      drawWeapon(restAngle, 1);
    }
  }

  function drawWandererWeapon(fighter, radius, t) {
    const weapon = weaponPortraits.get(fighter.template.id);
    if (!weapon?.complete || !weapon.naturalWidth) return;
    const height = radius * 2.9;
    const width = height * (weapon.naturalWidth / weapon.naturalHeight);
    ctx.save();
    if (fighter.thrustTime > 0) {
      const progress = 1 - fighter.thrustTime / 0.34;
      const thrustDistance = Math.sin(progress * Math.PI) * radius * 1.35;
      ctx.translate(
        Math.cos(fighter.thrustAngle) * thrustDistance,
        Math.sin(fighter.thrustAngle) * thrustDistance
      );
      ctx.rotate(fighter.thrustAngle - Math.PI / 2);
    } else {
      ctx.translate(radius * 0.82, 0);
      ctx.rotate(0.5 + Math.sin(t * 1.6) * 0.025);
    }
    ctx.shadowColor = fighter.template.color;
    ctx.shadowBlur = fighter.thrustTime > 0 ? 24 : 10;
    ctx.drawImage(weapon, -width / 2, -radius * 0.3, width, height);
    ctx.restore();
  }

  function drawBrantWeapons(fighter, radius, t) {
    if (fighter.brantMeleeMode) {
      const sword = weaponPortraits.get("04");
      if (!sword?.complete || !sword.naturalWidth) return;
      const height = radius * 3.45;
      const width = height * (sword.naturalWidth / sword.naturalHeight);
      ctx.save();
      if (fighter.thrustTime > 0) {
        const progress = 1 - fighter.thrustTime / 0.28;
        const thrustDistance = Math.sin(progress * Math.PI) * radius * 1.45;
        ctx.translate(
          Math.cos(fighter.thrustAngle) * thrustDistance,
          Math.sin(fighter.thrustAngle) * thrustDistance
        );
        ctx.rotate(fighter.thrustAngle - Math.PI / 2);
      } else {
        ctx.translate(radius * 0.72, 0);
        ctx.rotate(0.4 + Math.sin(t * 1.7) * 0.025);
      }
      ctx.shadowColor = "#cf6f9f";
      ctx.shadowBlur = fighter.thrustTime > 0 ? 26 : 13;
      ctx.drawImage(sword, -width / 2, -radius * 0.32, width, height);
      ctx.restore();
      return;
    }

    const gun = weaponPortraits.get("04:ranged");
    if (!gun?.complete || !gun.naturalWidth) return;
    const width = radius * 2.45;
    const height = width * (gun.naturalHeight / gun.naturalWidth);
    ctx.save();
    ctx.translate(
      Math.cos(fighter.brantAimAngle) * radius * 0.7,
      Math.sin(fighter.brantAimAngle) * radius * 0.7
    );
    ctx.rotate(fighter.brantAimAngle + Math.PI);
    ctx.shadowColor = "#bd62e8";
    ctx.shadowBlur = 18;
    ctx.drawImage(gun, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  function drawCantarellaWeapon(fighter, radius, t) {
    const umbrella = weaponPortraits.get("05");
    if (!umbrella?.complete || !umbrella.naturalWidth) return;
    const size = radius * 1.42;
    ctx.save();
    ctx.translate(radius * 0.78, radius * 0.12);
    ctx.rotate(-0.55 + Math.sin(t * 1.4) * 0.035);
    ctx.globalAlpha = 0.94;
    ctx.shadowColor = "#b88cff";
    ctx.shadowBlur = 5;
    ctx.drawImage(umbrella, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawAbyssAura(radius, t) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(181, 94, 255, 0.58)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#a64dff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 10 + Math.sin(t * 7) * 2, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 4; i += 1) {
      const angle = t * 2.3 + i * Math.PI / 2;
      ctx.globalAlpha = 0.35 + Math.sin(t * 11 + i) * 0.16;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius + 6), Math.sin(angle) * (radius + 6));
      ctx.lineTo(Math.cos(angle + 0.1) * (radius + 18), Math.sin(angle + 0.1) * (radius + 18));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAbyssScythe(fighter, radius, t) {
    const progress = fighter.abyssScytheSwing > 0
      ? 1 - fighter.abyssScytheSwing / 0.34
      : null;
    const angle = progress === null
      ? -0.7 + Math.sin(t * 2) * 0.035
      : -Math.PI * 0.95 + progress * Math.PI * 1.9;
    ctx.save();
    ctx.translate(radius * 0.45, 0);
    ctx.rotate(angle);
    ctx.strokeStyle = "#4b345b";
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, radius * 3.15);
    ctx.stroke();
    ctx.fillStyle = "#c06cff";
    ctx.shadowColor = "#b04dff";
    ctx.shadowBlur = fighter.abyssScytheSwing > 0 ? 28 : 14;
    ctx.beginPath();
    ctx.moveTo(-1, radius * 2.58);
    ctx.bezierCurveTo(radius * 0.72, radius * 2.36, radius * 1.7, radius * 2.08, radius * 2.08, radius * 1.24);
    ctx.bezierCurveTo(radius * 1.46, radius * 2.08, radius * 0.72, radius * 2.74, radius * 0.08, radius * 2.98);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 211, 255, 0.88)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.strokeStyle = "rgba(93, 35, 127, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, radius * 2.64);
    ctx.bezierCurveTo(radius * 0.85, radius * 2.44, radius * 1.5, radius * 2.12, radius * 1.82, radius * 1.56);
    ctx.stroke();
    ctx.restore();
  }

  function drawWandererKnives() {
    getActiveFighters().forEach((fighter) => {
      if (!fighter || fighter.knifeCount <= 0) return;
      const knife = knifePortraits.get(fighter.template.id);
      if (!knife?.complete) return;
      const orbitRadius = fighter.template.knifeOrbitRadius * CELL_SIZE;
      const size = CELL_SIZE * 1.42;
      const width = size * (knife.naturalWidth / knife.naturalHeight);
      const height = size;
      ctx.save();
      ctx.strokeStyle = colorWithAlpha("#ffd76b", 0.16);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      ctx.arc(fighter.x, fighter.y, orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      for (let index = 0; index < fighter.knifeCount; index += 1) {
        const angle = fighter.knifeAngle + (index / fighter.knifeCount) * Math.PI * 2;
        ctx.save();
        ctx.translate(fighter.x + Math.cos(angle) * orbitRadius, fighter.y + Math.sin(angle) * orbitRadius);
        ctx.rotate(angle + Math.PI / 4);
        ctx.shadowColor = "#ffd76b";
        ctx.shadowBlur = 18;
        ctx.drawImage(knife, -width / 2, -height / 2, width, height);
        ctx.restore();
      }
    });
  }

  function drawElectricAura(radius, t, color, intensity) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    for (let i = 0; i < 5; i += 1) {
      const angle = t * 1.8 + (i / 5) * Math.PI * 2;
      const inner = radius + 3;
      const outer = radius + 10 + Math.sin(t * 13 + i * 2.2) * 4;
      ctx.globalAlpha = (0.36 + Math.sin(t * 15 + i) * 0.18) * intensity;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(
        Math.cos(angle + 0.08) * (inner + (outer - inner) * 0.55) + Math.sin(t * 20 + i) * 3,
        Math.sin(angle + 0.08) * (inner + (outer - inner) * 0.55)
      );
      ctx.lineTo(Math.cos(angle - 0.04) * outer, Math.sin(angle - 0.04) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    particles.forEach((particle) => {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      if (particle.type === "flash") {
        ctx.fillStyle = colorWithAlpha(particle.color, alpha * 0.16);
      } else {
        ctx.fillStyle = particle.color;
      }
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (particle.type === "flash" ? 1.5 : 1), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawProjectiles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    projectiles.forEach((projectile) => {
      ctx.shadowColor = projectile.kind === "fireball" ? "#ff6b3d" : projectile.color;
      ctx.shadowBlur = projectile.kind === "fireball" ? 28 : 16;
      const gradient = ctx.createRadialGradient(
        projectile.x - projectile.r * 0.3,
        projectile.y - projectile.r * 0.3,
        1,
        projectile.x,
        projectile.y,
        projectile.r * 1.3
      );
      gradient.addColorStop(0, "#fff7c9");
      gradient.addColorStop(projectile.kind === "fireball" ? 0.35 : 0.55, projectile.color);
      gradient.addColorStop(1, projectile.kind === "fireball" ? "rgba(255,65,28,0.2)" : "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.r * (projectile.kind === "fireball" ? 1.35 : 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.beginPath();
      ctx.arc(projectile.x - 2, projectile.y - 2, projectile.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawEffects(front) {
    effects.forEach((effect) => {
      const alpha = clamp(effect.life / effect.maxLife, 0, 1);
      const isFront = ["impact", "lightning", "shield", "brantAnchorImpact", "jellySlash", "dreamBreak"].includes(effect.type);
      if (isFront !== front) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (effect.type === "ring") {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = Math.max(0.5, effect.width * alpha);
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "impact") {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = colorWithAlpha("#ffffff", alpha * 0.28);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (1.4 - alpha * 0.4), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
          const angle = (i / 8) * Math.PI * 2;
          const inner = effect.radius * 0.25;
          const outer = effect.radius * (0.8 + (1 - alpha) * 0.5);
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
          ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
          ctx.stroke();
        }
      } else if (effect.type === "lightning") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 24;
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 5 * alpha;
        ctx.beginPath();
        effect.points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else if (effect.type === "fire") {
        ctx.globalCompositeOperation = "lighter";
        const gradient = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, effect.radius);
        gradient.addColorStop(0, "rgba(255,240,190,0.85)");
        gradient.addColorStop(0.25, colorWithAlpha(effect.color, 0.55));
        gradient.addColorStop(1, colorWithAlpha(effect.color, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === "fireBlast") {
        const progress = 1 - alpha;
        const radius = effect.radius * (0.55 + progress * 0.45);
        ctx.globalCompositeOperation = "lighter";
        const blast = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, radius);
        blast.addColorStop(0, colorWithAlpha("#fff1c7", alpha * 0.62));
        blast.addColorStop(0.48, colorWithAlpha(effect.color, alpha * 0.28));
        blast.addColorStop(1, colorWithAlpha(effect.color, 0));
        ctx.fillStyle = blast;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.72);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "vineBloom") {
        const progress = 1 - alpha;
        ctx.globalCompositeOperation = "lighter";
        const radius = effect.radius * (0.15 + progress * 0.9);
        const glow = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, radius);
        glow.addColorStop(0, colorWithAlpha("#f2ffb0", alpha * 0.7));
        glow.addColorStop(0.35, colorWithAlpha(effect.color, alpha * 0.32));
        glow.addColorStop(1, colorWithAlpha(effect.color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 12; i += 1) {
          const angle = i * Math.PI / 6 + 0.18;
          const endRadius = radius * (0.65 + (i % 3) * 0.16);
          ctx.strokeStyle = colorWithAlpha("#d7e76d", alpha * 0.72);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(effect.x, effect.y);
          ctx.quadraticCurveTo(
            effect.x + Math.cos(angle + 0.35) * endRadius * 0.55,
            effect.y + Math.sin(angle + 0.35) * endRadius * 0.55,
            effect.x + Math.cos(angle) * endRadius,
            effect.y + Math.sin(angle) * endRadius
          );
          ctx.stroke();
        }
      } else if (effect.type === "lifeBloom") {
        const progress = 1 - alpha;
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = colorWithAlpha("#d9ef7d", alpha * 0.085);
        ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);
        const bloom = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, effect.radius * (0.45 + progress * 0.55));
        bloom.addColorStop(0, colorWithAlpha("#fbffd2", alpha * 0.82));
        bloom.addColorStop(0.25, colorWithAlpha("#e7f58a", alpha * 0.34));
        bloom.addColorStop(1, colorWithAlpha("#8bc86b", 0));
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (0.45 + progress * 0.55), 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === "timeFlash") {
        const expansion = (1 - alpha) * ARENA_SIZE * 0.72;
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = colorWithAlpha(effect.color, alpha * 0.26);
        ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);
        const flare = ctx.createRadialGradient(effect.x, effect.y, 1, effect.x, effect.y, 170 + expansion);
        flare.addColorStop(0, colorWithAlpha("#fff7c2", alpha * 0.92));
        flare.addColorStop(0.2, colorWithAlpha(effect.color, alpha * 0.48));
        flare.addColorStop(1, colorWithAlpha(effect.color, 0));
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.7);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 20 + expansion, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "abyssSlash") {
        const fighter = effect.fighter;
        const progress = 1 - alpha;
        const startAngle = effect.angle - Math.PI * 0.82;
        const sweepAngle = Math.PI * 1.64 * progress;
        ctx.translate(fighter.x, fighter.y);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha("#c36fff", 0.88);
        ctx.lineWidth = 13 * alpha;
        ctx.shadowColor = "#a73fff";
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.84, startAngle, startAngle + sweepAngle);
        ctx.stroke();
        ctx.strokeStyle = colorWithAlpha("#efc8ff", 0.72);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.95, startAngle, startAngle + sweepAngle);
        ctx.stroke();
      } else if (effect.type === "abyssBurst") {
        const pulse = Math.sin((1 - alpha) * Math.PI);
        ctx.globalCompositeOperation = "lighter";
        const blast = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, effect.radius * (0.45 + pulse * 0.55));
        blast.addColorStop(0, colorWithAlpha("#f0c8ff", alpha * 0.82));
        blast.addColorStop(0.28, colorWithAlpha("#b75dff", alpha * 0.54));
        blast.addColorStop(1, colorWithAlpha("#640fa2", 0));
        ctx.fillStyle = blast;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (0.45 + pulse * 0.55), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colorWithAlpha("#d99bff", alpha * 0.8);
        ctx.lineWidth = 7 * alpha;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (0.35 + (1 - alpha) * 0.7), 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "windBurst") {
        const progress = 1 - alpha;
        ctx.globalCompositeOperation = "lighter";
        const windGlow = ctx.createRadialGradient(effect.x, effect.y, 2, effect.x, effect.y, effect.radius * (0.75 + progress * 0.35));
        windGlow.addColorStop(0, colorWithAlpha("#efffe9", alpha * 0.78));
        windGlow.addColorStop(0.42, colorWithAlpha(effect.color, alpha * 0.36));
        windGlow.addColorStop(1, colorWithAlpha(effect.color, 0));
        ctx.fillStyle = windGlow;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (0.75 + progress * 0.35), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colorWithAlpha("#d8ffca", alpha * 0.9);
        ctx.lineWidth = 9 * alpha;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * (0.3 + progress * 0.9), 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "shieldBreak") {
        const progress = 1 - alpha;
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha);
        ctx.lineWidth = 4;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 20;
        for (let i = 0; i < 12; i += 1) {
          const angle = (i / 12) * Math.PI * 2;
          const inner = effect.radius * (0.8 + progress * 0.2);
          const outer = effect.radius * (1.2 + progress * 1.55);
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
          ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
          ctx.stroke();
        }
      } else if (effect.type === "windCharge") {
        if (!effect.fighter) return;
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha("#d8ffca", alpha * 0.75);
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -visualTime * 28;
        ctx.beginPath();
        ctx.arc(effect.fighter.x, effect.fighter.y, effect.fighter.r + 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (effect.type === "brantAnchorImpact") {
        const progress = 1 - alpha;
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.angle);
        ctx.globalCompositeOperation = "lighter";
        const scale = 0.72 + progress * 0.45;
        const blast = ctx.createRadialGradient(0, 0, 3, 0, 0, effect.radiusX * scale);
        blast.addColorStop(0, colorWithAlpha("#ffe0eb", alpha * 0.78));
        blast.addColorStop(0.35, colorWithAlpha(effect.color, alpha * 0.42));
        blast.addColorStop(1, colorWithAlpha("#6f2448", 0));
        ctx.save();
        ctx.scale(1, effect.radiusY / effect.radiusX);
        ctx.fillStyle = blast;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radiusX * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.85);
        ctx.lineWidth = 7 * alpha;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radiusX * (0.45 + progress * 0.65), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (effect.type === "brantAirborne") {
        if (!effect.fighter) return;
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.8);
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 5]);
        ctx.lineDashOffset = -visualTime * 30;
        ctx.beginPath();
        ctx.arc(effect.fighter.x, effect.fighter.y, effect.fighter.r + 16 + (1 - alpha) * 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (effect.type === "jellySlash") {
        const progress = 1 - alpha;
        ctx.translate(effect.x, effect.y);
        ctx.rotate(effect.angle);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.9);
        ctx.lineWidth = 6 * alpha + 1;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * (0.78 + progress * 0.28), -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        ctx.strokeStyle = colorWithAlpha("#f1dcff", alpha * 0.66);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, effect.radius * 0.94, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else if (effect.type === "dreamBreak") {
        const progress = 1 - alpha;
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.9);
        ctx.lineWidth = 4 * alpha + 1;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 16;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, effect.radius + progress * (18 + i * 13), 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (effect.type === "shield") {
        if (!effect.fighter) return;
        if (effect.fighter.template.id === "04") {
          const shieldRing = ctx.createLinearGradient(
            effect.fighter.x - effect.fighter.r,
            effect.fighter.y,
            effect.fighter.x + effect.fighter.r,
            effect.fighter.y
          );
          shieldRing.addColorStop(0, "#74366f");
          shieldRing.addColorStop(0.55, "#b25b98");
          shieldRing.addColorStop(1, "#efa0aa");
          ctx.strokeStyle = shieldRing;
          ctx.shadowColor = "#b25b98";
        } else {
          ctx.strokeStyle = effect.color;
          ctx.shadowColor = effect.color;
        }
        ctx.lineWidth = 3;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(effect.fighter.x, effect.fighter.y, effect.fighter.r + 14 + (1 - alpha) * 40, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === "magnet") {
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha(effect.color, 0.7);
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i += 1) {
          const offset = i * 9;
          ctx.beginPath();
          ctx.moveTo(effect.from.x + offset, effect.from.y);
          ctx.quadraticCurveTo(
            (effect.from.x + effect.to.x) / 2 + Math.sin(visualTime * 9 + i) * 20,
            (effect.from.y + effect.to.y) / 2 + Math.cos(visualTime * 8 + i) * 20,
            effect.to.x + offset,
            effect.to.y
          );
          ctx.stroke();
        }
      } else if (effect.type === "sweep") {
        if (!effect.fighter) return;
        const progress = 1 - alpha;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * progress;
        ctx.translate(effect.fighter.x, effect.fighter.y);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.min(1, alpha * 1.3);
        ctx.strokeStyle = colorWithAlpha(effect.color, 0.95);
        ctx.lineWidth = effect.empowered ? 16 : 10;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 34;
        ctx.beginPath();
        ctx.arc(0, 0, effect.range * 0.84, startAngle, endAngle);
        ctx.stroke();
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = colorWithAlpha("#ffffff", 0.92);
        ctx.beginPath();
        ctx.moveTo(Math.cos(endAngle) * 8, Math.sin(endAngle) * 8);
        ctx.lineTo(Math.cos(endAngle) * effect.range * 0.9, Math.sin(endAngle) * effect.range * 0.9);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.18;
        ctx.strokeStyle = colorWithAlpha(effect.color, 0.85);
        ctx.lineWidth = effect.empowered ? 22 : 14;
        ctx.beginPath();
        ctx.arc(0, 0, effect.range * 0.72, startAngle, endAngle);
        ctx.stroke();
      } else if (effect.type === "thrust") {
        const fighter = effect.fighter;
        const travel = Math.sin((1 - alpha) * Math.PI) * effect.range;
        const endX = fighter.x + Math.cos(effect.angle) * travel;
        const endY = fighter.y + Math.sin(effect.angle) * travel;
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorWithAlpha(effect.color, alpha * 0.9);
        ctx.lineWidth = 8 * alpha;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.moveTo(fighter.x, fighter.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.strokeStyle = colorWithAlpha("#ffffff", alpha * 0.75);
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (effect.type === "blackSlam") {
        const portrait = summonPortraits.get("black-sheep");
        if (!portrait?.complete) return;
        const progress = 1 - alpha;
        const height = CELL_SIZE * 4.4;
        const width = height * (portrait.naturalWidth / portrait.naturalHeight);
        const dropY = effect.y - 145 * Math.pow(1 - Math.min(1, progress * 1.55), 2);
        ctx.globalAlpha = Math.min(1, alpha * 1.8);
        ctx.shadowColor = "#d5dbe4";
        ctx.shadowBlur = 20;
        ctx.drawImage(portrait, effect.x - width / 2, dropY - height, width, height);
        ctx.shadowBlur = 0;
        if (progress > 0.55) {
          ctx.strokeStyle = "rgba(220,226,236,0.7)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(effect.x, effect.y, CELL_SIZE * 1.7, CELL_SIZE * 0.52, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    });
  }

  function drawFloatingTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    floatingTexts.forEach((text) => {
      const alpha = clamp(text.life / text.maxLife, 0, 1);
      ctx.globalAlpha = Math.min(1, alpha * 1.4);
      ctx.fillStyle = text.color;
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = 7;
      ctx.font = `900 ${text.text.length > 4 ? 13 : 21}px 'Trebuchet MS'`;
      ctx.fillText(text.text, text.x + text.drift * (1 - alpha), text.y);
    });
    ctx.restore();
  }

  function colorWithAlpha(hex, alpha) {
    const safeHex = String(hex).replace("#", "");
    if (safeHex.length !== 6) return `rgba(255,255,255,${alpha})`;
    const value = Number.parseInt(safeHex, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function lightenColor(hex) {
    const safeHex = String(hex).replace("#", "");
    const value = Number.parseInt(safeHex, 16);
    const r = Math.min(255, ((value >> 16) & 255) + 74);
    const g = Math.min(255, ((value >> 8) & 255) + 74);
    const b = Math.min(255, (value & 255) + 74);
    return `rgb(${r},${g},${b})`;
  }

  function ensureAudio() {
    if (!soundEnabled) return null;
    if (!audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      audioContext = new AudioCtor();
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playSound(name) {
    if (!soundEnabled) return;
    const audio = ensureAudio();
    if (!audio) return;
    const now = audio.currentTime;
    const tone = (frequency, duration, type = "sine", volume = 0.035, endFrequency = frequency) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    };

    if (name === "hit") {
      tone(random(80, 120), 0.08, "square", 0.026, 55);
      tone(random(220, 290), 0.045, "triangle", 0.018, 120);
    } else if (name === "shot") {
      tone(230, 0.09, "square", 0.018, 760);
    } else if (name === "sword") {
      tone(620, 0.16, "sawtooth", 0.022, 160);
    } else if (name === "windup") {
      tone(145, 0.28, "triangle", 0.024, 290);
    } else if (name === "thrust") {
      tone(420, 0.08, "square", 0.02, 980);
    } else if (name === "blade") {
      tone(680, 0.18, "triangle", 0.025, 1180);
    } else if (name === "timeStop") {
      tone(110, 0.42, "sine", 0.032, 70);
      tone(880, 0.26, "triangle", 0.018, 220);
    } else if (name === "timeEnd") {
      tone(160, 0.18, "triangle", 0.02, 360);
    } else if (name === "abyss") {
      tone(90, 0.42, "sawtooth", 0.03, 42);
      tone(420, 0.24, "triangle", 0.02, 92);
    } else if (name === "tick") {
      tone(440, 0.06, "sine", 0.025, 400);
    } else if (name === "fight" || name === "round") {
      tone(name === "fight" ? 220 : 330, 0.16, "sawtooth", 0.025, name === "fight" ? 660 : 440);
    } else if (name === "lightning") {
      tone(880, 0.22, "sawtooth", 0.025, 110);
    } else if (name === "ice") {
      tone(620, 0.3, "sine", 0.03, 240);
    } else if (name === "fire") {
      tone(120, 0.28, "sawtooth", 0.028, 46);
    } else if (name === "shield") {
      tone(240, 0.1, "triangle", 0.024, 480);
      tone(360, 0.2, "sine", 0.018, 520);
    } else if (name === "shadow") {
      tone(540, 0.17, "triangle", 0.028, 90);
    } else if (name === "magnet") {
      tone(180, 0.28, "sine", 0.022, 420);
    } else if (name === "pickup") {
      tone(520, 0.08, "sine", 0.025, 780);
      tone(780, 0.1, "sine", 0.02, 1040);
    } else if (name === "roundWin") {
      tone(330, 0.1, "triangle", 0.03, 440);
      setTimeout(() => playSound("pickup"), 100);
    } else if (name === "select") {
      tone(450, 0.045, "sine", 0.018, 580);
    } else if (name === "win") {
      [330, 440, 660].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.18, "triangle", 0.03, frequency * 1.08), index * 110));
    } else if (name === "lose") {
      [330, 260, 190].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.18, "triangle", 0.025, frequency * 0.87), index * 120));
    }
  }

  function setSound(enabled) {
    soundEnabled = enabled;
    if (!enabled) cancelVoicePlayback(true);
    dom.soundButton.setAttribute("aria-pressed", String(enabled));
    dom.soundButton.setAttribute("aria-label", enabled ? "关闭音效" : "开启音效");
    if (enabled) {
      ensureAudio();
      playSound("select");
    }
  }

  function setArenaItemsEnabled(enabled) {
    arenaItemsEnabled = enabled;
    dom.itemToggle.setAttribute("aria-pressed", String(enabled));
    dom.itemToggle.setAttribute("aria-label", enabled ? "关闭赛场道具" : "开启赛场道具");
    dom.itemSwitchText.textContent = enabled ? "开启" : "关闭";
    dom.poolItems.classList.toggle("is-disabled", !enabled);
    if (!enabled) pickups = [];
    if (player && enemy) {
      addLog(enabled ? "赛场道具已开启。" : "赛场道具已关闭，本局不再生成道具。", "system");
      announce(enabled ? "赛场道具开启" : "赛场道具关闭", enabled ? "#8ce985" : "#8d93a3", 0.9);
    }
  }

  function changeGameSpeed(direction) {
    gameSpeedIndex = clamp(gameSpeedIndex + direction, 0, GAME_SPEEDS.length - 1);
    gameSpeed = GAME_SPEEDS[gameSpeedIndex];
    dom.gameSpeedText.textContent = `${gameSpeed}×`;
    dom.slowButton.disabled = gameSpeedIndex === 0;
    dom.fastButton.disabled = gameSpeedIndex === GAME_SPEEDS.length - 1;
    if (player && enemy && direction !== 0) announce(`播放速度 ${gameSpeed}×`, "#ffd84d", 0.7);
    if (direction !== 0) playSound("select");
  }

  function setRoundSeconds(value) {
    const parsed = Number.parseInt(value, 10);
    roundSeconds = clamp(Number.isFinite(parsed) ? parsed : DEFAULT_ROUND_SECONDS, 10, 300);
    dom.durationInput.value = String(roundSeconds);
    dom.footerSettings.textContent = `三局两胜 · 每局 ${roundSeconds} 秒`;
    if (state === "idle" || state === "matchEnd") {
      battleTimer = roundSeconds;
      dom.timerText.textContent = String(roundSeconds).padStart(2, "0");
    }
  }

  function setMapSize(value) {
    const nextSize = Number(value) === 30 ? 30 : 20;
    const needsRestart = state === "playing" || state === "countdown" || state === "roundEnd";
    MAP_SIZE = nextSize;
    CELL_SIZE = (ARENA_SIZE - MAP_PADDING * 2) / MAP_SIZE;
    dom.mapSelect.value = String(MAP_SIZE);
    resizeCanvas();
    if (needsRestart && player && enemy) {
      startMatch();
      addLog(`地图切换为 ${MAP_SIZE}×${MAP_SIZE} 格。`, "system");
    } else {
      preparePreview();
      showSelectOverlay();
    }
    playSound("select");
  }

  function buildArchiveList() {
    dom.archiveList.innerHTML = "";
    FIGHTERS.forEach((fighter) => {
      const visual = templateById(fighter.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "archive-item";
      button.dataset.fighterId = fighter.id;
      button.style.setProperty("--archive-color", fighter.color);
      button.innerHTML = `
        <span class="archive-avatar" aria-hidden="true">${visual.image ? `<img src="${visual.image}" alt="">` : fighter.symbol}</span>
        <span><strong>${fighter.name}</strong><small>${FIGHTER_DETAILS[fighter.id].role}</small></span>
      `;
      button.addEventListener("click", () => {
        archiveSelectedId = fighter.id;
        renderArchive();
      });
      dom.archiveList.appendChild(button);
    });
  }

  function renderArchive() {
    const fighter = templateById(archiveSelectedId);
    const detail = FIGHTER_DETAILS[fighter.id];
    dom.archiveList.querySelectorAll(".archive-item").forEach((button) => {
      const active = button.dataset.fighterId === fighter.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    dom.archiveDetail.style.setProperty("--archive-color", fighter.color);
    dom.archiveDetail.innerHTML = `
      <div class="archive-hero">
        <div class="archive-hero-image" aria-hidden="true">${fighter.image ? `<img src="${fighter.image}" alt="">` : fighter.symbol}</div>
        <div>
          <span class="element-tag">${fighter.element}</span>
          <h3>${fighter.name}</h3>
          <p>${fighter.tagline}</p>
        </div>
      </div>
      <div class="archive-stats">
        <div class="archive-stat"><span>生命值</span><strong>${fighter.display.hp}</strong></div>
        <div class="archive-stat"><span>普通攻击</span><strong>${fighter.display.attack}</strong></div>
        <div class="archive-stat"><span>移动速度</span><strong>${fighter.display.speed}</strong></div>
        <div class="archive-stat"><span>攻击间隔</span><strong>${detail.interval}</strong></div>
      </div>
      <div class="archive-section">
        <h4>战斗定位</h4>
        <ul>
          <li>定位：${detail.role}</li>
          <li>攻击范围：${detail.range}</li>
          <li>属性：${fighter.element.split(" · ")[0]}</li>
        </ul>
      </div>
      <div class="archive-section">
        <h4>机制说明</h4>
        <ul>${detail.mechanics.map((mechanic) => `<li>${mechanic}</li>`).join("")}</ul>
      </div>
      <div class="archive-section">
        <h4>共鸣解放</h4>
        <ul><li>${fighter.ability}：${fighter.abilityDesc}</li></ul>
      </div>
    `;
  }

  function openArchive() {
    archiveSelectedId = getConfigId();
    renderArchive();
    if (!dom.fighterArchive.open) dom.fighterArchive.showModal();
  }

  function resizeCanvas() {
    const dprCap = LOW_POWER_DEVICE ? 1.25 : 1.5;
    const dpr = Math.min(dprCap, window.devicePixelRatio || 1);
    canvas.width = Math.round(ARENA_SIZE * dpr);
    canvas.height = Math.round(ARENA_SIZE * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    arenaLayer.width = canvas.width;
    arenaLayer.height = canvas.height;
    arenaLayerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawArena(arenaLayerCtx);
  }

  function frame(now) {
    const realDt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
    const simulatedDt = realDt * gameSpeed;
    const steps = Math.min(12, Math.max(1, Math.ceil(simulatedDt / 0.025)));
    const dt = simulatedDt / steps;
    lastFrame = now;
    updateVoiceCamera(realDt);
    if (manualPaused) {
      draw();
      requestAnimationFrame(frame);
      return;
    }
    if (voicePauseActive) {
      updateVisualEffects(realDt);
      draw();
      requestAnimationFrame(frame);
      return;
    }
    for (let step = 0; step < steps; step += 1) {
      updateVisualEffects(dt);
      if (state === "idle" || state === "matchEnd") {
        updateIdlePreview(dt);
      } else if (state === "countdown") {
        updateCountdown(dt);
        updateTrails(dt);
      } else if (state === "playing") {
        updateBattle(dt);
      } else if (state === "roundEnd") {
        updateRoundEnd(dt);
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    keys[event.code] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "Space" && !event.repeat) {
      togglePause();
      return;
    }
    if (event.code === "Escape" && manualPaused) {
      setManualPaused(false);
      return;
    }
    if (event.code === "KeyE" && !event.repeat) {
      if (mode === "play" && state === "playing" && !manualPaused) useAbility(player, enemy);
    }
    if (event.code === "KeyR" && !event.repeat) {
      startMatch();
    }
  });
  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });
  window.addEventListener("blur", () => {
    Object.keys(keys).forEach((key) => {
      keys[key] = false;
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      Object.keys(keys).forEach((key) => {
        keys[key] = false;
      });
    }
  });

  dom.overlayButton.addEventListener("click", () => {
    startMatch();
  });
  dom.fightButton.addEventListener("click", () => {
    startMatch();
  });
  dom.restartButton.addEventListener("click", () => {
    startMatch();
  });
  dom.abilityButton.addEventListener("click", () => {
    if (mode === "play" && !manualPaused) useAbility(player, enemy);
  });
  dom.soundButton.addEventListener("click", () => {
    setSound(!soundEnabled);
  });
  dom.shuffleButton.addEventListener("click", shuffleEnemy);
  dom.archiveButton.addEventListener("click", openArchive);
  dom.archiveClose.addEventListener("click", () => dom.fighterArchive.close());
  dom.fighterArchive.addEventListener("click", (event) => {
    if (event.target === dom.fighterArchive) dom.fighterArchive.close();
  });
  dom.mapSelect.addEventListener("change", () => setMapSize(dom.mapSelect.value));
  dom.itemToggle.addEventListener("click", () => setArenaItemsEnabled(!arenaItemsEnabled));
  dom.slowButton.addEventListener("click", () => changeGameSpeed(-1));
  dom.fastButton.addEventListener("click", () => changeGameSpeed(1));
  dom.pauseButton.addEventListener("click", togglePause);
  dom.pauseResumeButton.addEventListener("click", () => setManualPaused(false));
  dom.durationInput.addEventListener("change", () => setRoundSeconds(dom.durationInput.value));
  dom.durationInput.addEventListener("blur", () => setRoundSeconds(dom.durationInput.value));
  document.querySelectorAll("[data-config-side]").forEach((button) => {
    button.addEventListener("click", () => setConfigSide(button.dataset.configSide));
  });
  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
  document.querySelectorAll("[data-wanderer-form]").forEach((button) => {
    button.addEventListener("click", () => {
      setWandererForm(button.dataset.wandererForm, button.dataset.gender);
    });
  });
  document.querySelectorAll(".dpad button").forEach((button) => {
    const direction = button.dataset.dir;
    const release = () => {
      touchDirection[direction] = false;
      button.classList.remove("is-held");
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      touchDirection[direction] = true;
      button.classList.add("is-held");
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  FIGHTERS.filter((fighter) => fighter.image).forEach((fighter) => {
    const portrait = new Image();
    portrait.src = fighter.image;
    fighterPortraits.set(fighter.id, portrait);
    if (fighter.id === "01" || fighter.id === "02") {
      fighterPortraits.set(`${fighter.id}:male`, portrait);
    }
    if (fighter.altImage) {
      const alternate = new Image();
      alternate.src = fighter.altImage;
      fighterPortraits.set(`${fighter.id}:alt`, alternate);
      if (fighter.id === "01" || fighter.id === "02") {
        fighterPortraits.set(`${fighter.id}:male:alt`, alternate);
      }
    }
    if (fighter.femaleImage) {
      const female = new Image();
      female.src = fighter.femaleImage;
      fighterPortraits.set(`${fighter.id}:female`, female);
      if (fighter.femaleAltImage) {
        const femaleAlternate = new Image();
        femaleAlternate.src = fighter.femaleAltImage;
        fighterPortraits.set(`${fighter.id}:female:alt`, femaleAlternate);
      }
    }
  });
  ["white-sheep", "black-sheep", "brant-chest"].forEach((name) => {
    const image = new Image();
    image.src = `assets/${name}.png`;
    summonPortraits.set(name, image);
  });
  FIGHTERS.filter((fighter) => fighter.weaponImage).forEach((fighter) => {
    const weapon = new Image();
    weapon.src = fighter.weaponImage;
    weaponPortraits.set(fighter.id, weapon);
    if (fighter.rangedWeaponImage) {
      const rangedWeapon = new Image();
      rangedWeapon.src = fighter.rangedWeaponImage;
      weaponPortraits.set(`${fighter.id}:ranged`, rangedWeapon);
    }
  });
  FIGHTERS.filter((fighter) => fighter.knifeImage).forEach((fighter) => {
    const knife = new Image();
    knife.src = fighter.knifeImage;
    knifePortraits.set(fighter.id, knife);
  });

  setArenaItemsEnabled(true);
  changeGameSpeed(0);
  createRoster();
  buildArchiveList();
  document.querySelector(".fighter-card")?.classList.add("is-selected");
  syncRosterSelection();
  syncWandererFormState();
  syncPauseControl();
  updateChosenPanel();
  preparePreview();
  setRoundSeconds(dom.durationInput.value);
  setMode("watch");
  resizeCanvas();
  requestAnimationFrame(frame);
})();
