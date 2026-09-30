/**
 * 戦闘シミュレーションロジック (Simulation Engine)
 * 描画(Three.js)やUIに依存せず、純粋な座標と数値で動作する。
 * 将来のオッズ計算(Web Workerでの何百回もの高速シミュレーション)にもそのまま使用可能。
 */

// 勢力・キャラクター定義
export const FACTIONS = {
    human: {
        id: 'human',
        name: '人間',
        category: 'basic',
        categoryLabel: '基本',
        desc: '平均的だが、周囲に仲間が多いほど結束して攻防が強化される。',
        color: '#3498db',
        colorInt: 0x3498db,
        hp: 110,
        atk: 14,
        def: 3,
        spd: 3.6,
        range: 1.3,
        atkCooldown: 0.8,
        radius: 0.7,
        spawnRange: [10, 22],
        scale: 1.0,
        ability: '結束 (味方の数に応じて攻防UP)',
        rarity: 'COMMON',
        rarityLabel: 'コモン',
        rarityColor: '#95a5a6',
        role: '集団陣形・前衛',
        abilityData: {
            name: '結束 (Phalanx)',
            type: '常時パッシブ (近傍味方検知)',
            summary: '周囲の味方人間の数に応じて、自身の攻撃力と防御力がリアルタイムに加算強化されます。',
            specs: [
                { label: '検知範囲', value: '自身から半径 5.0m 以内' },
                { label: '攻撃力ボーナス', value: '味方1体につき +0.8 (最大上限 +8)' },
                { label: '防御力ボーナス', value: '味方1体につき +0.6 (最大上限 +5)' },
                { label: '最大強化時の能力', value: '攻撃力 22 / 防御力 8 (味方10体以上密集時)' }
            ],
            formula: '実ATK = 14 + min(8, 味方数×0.8), 実DEF = 3 + min(5, 味方数×0.6)'
        },
        profile: '王国正規軍の歩兵部隊。単体の能力は平均的だが、盾と剣を重ねて陣形を組んだ際の結束力は凄まじく、集団を維持できれば格上の強敵をも圧倒する底力を秘めています。',
        tactics: '開幕の密集状態が最も強力。少数の強者（ロボや単騎キャラ）を囲んで押し切れますが、ドラゴンの範囲攻撃などで陣形を崩されると個々の脆さが露呈します。'
    },
    dog: {
        id: 'dog',
        name: '犬',
        category: 'basic',
        categoryLabel: '基本',
        desc: '俊敏で手数が多く噛みつきが強力。ただしHPは低め。',
        color: '#e67e22',
        colorInt: 0xe67e22,
        hp: 70,
        atk: 18,
        def: 1,
        spd: 5.6,
        range: 1.1,
        atkCooldown: 0.45,
        radius: 0.6,
        spawnRange: [12, 28],
        scale: 0.85,
        ability: '猛突進 (超高速移動と連続噛みつき)',
        rarity: 'COMMON',
        rarityLabel: 'コモン',
        rarityColor: '#95a5a6',
        role: '高速突撃・奇襲アタッカー',
        abilityData: {
            name: '猛突進 (Savage Rush)',
            type: '常時パッシブ (機動・連撃特化)',
            summary: '全勢力中トップクラスの俊敏性と、最短の攻撃間隔で敵に息もつかせぬ連続噛みつきを繰り出します。',
            specs: [
                { label: '移動速度', value: '5.6 m/s (全勢力最速、人間の1.55倍)' },
                { label: '攻撃間隔', value: '0.45 秒 (毎秒 2.22 回攻撃、最高手数)' },
                { label: '基礎DPS', value: '40.0 / 秒 (乱数±15%で 34.0〜46.0)' },
                { label: '当たり判定半径', value: '0.6m (小柄で敵にまとわりつきやすい)' }
            ],
            formula: '毎秒攻撃回数 = 1 ÷ 0.45s ≒ 2.22回, 秒間期待DPS = 40.0'
        },
        profile: '荒野を群れで疾走する獰猛な戦闘猟犬。獲物を補足すると凄まじい瞬発力で肉薄し、鋭い牙で喉元を食いちぎります。防具を装備していないため耐久力は極めて低めです。',
        tactics: '孤立した敵の各個撃破や奇襲に長け、序盤の先制攻撃で敵数を削りやすいです。ただしHPが低いため、範囲攻撃や高防御相手には消耗戦になりやすいハイリスク型です。'
    },
    zombie: {
        id: 'zombie',
        name: 'ゾンビ',
        category: 'basic',
        categoryLabel: '基本',
        desc: '倒した相手をゾンビにして自軍に加える。雪だるま式に増殖。',
        color: '#2ecc71',
        colorInt: 0x2ecc71,
        hp: 95,
        atk: 13,
        def: 2,
        spd: 2.8,
        range: 1.2,
        atkCooldown: 0.95,
        radius: 0.7,
        spawnRange: [8, 18],
        scale: 1.0,
        ability: '感染 (倒した敵をゾンビ化して味方に)',
        rarity: 'UNCOMMON',
        rarityLabel: 'アンコモン',
        rarityColor: '#2ecc71',
        role: '感染サモナー・逆転型',
        abilityData: {
            name: '感染 (Infection)',
            type: '撃破時トリガー (即時蘇生・寝返り)',
            summary: 'ゾンビがトドメを刺した敵ユニットを、即座に所属を変更して「新ゾンビ」としてその場で復活させます。',
            specs: [
                { label: '発動契機', value: 'ゾンビの攻撃で敵ユニットのHPが0になった瞬間' },
                { label: '復活時HP', value: '最大HPの 70% (HP 66) で即座に戦闘参加' },
                { label: '感染対象', value: 'ロボ・ドラゴン・幽霊を含むすべての撃破ユニット' },
                { label: '増殖上限', value: '無制限 (敵を倒し続ける限り何体でも無限増殖)' }
            ],
            formula: '新ゾンビHP = Math.round(95 × 0.70) = 66, 所属: zombie'
        },
        profile: '禁呪により墓場から蘇った不死の死者。生者への果てしない飢餓感を抱き、傷口から疫病を感染させます。仕留めた獲物を同胞に変えることで、戦場を死者の群れで埋め尽くします。',
        tactics: '足は遅めですが、弱った敵を1〜2体感染させ始めると雪だるま式に戦力が増加します。序盤の混戦を生き残り長期戦・泥沼戦に持ち込める組み合わせで大化けします。'
    },
    robot: {
        id: 'robot',
        name: 'ロボ',
        category: 'basic',
        categoryLabel: '基本',
        desc: '圧倒的な装甲と攻撃力。ただし移動が遅く、たまに故障して停止する。',
        color: '#00cec9',
        colorInt: 0x00cec9,
        hp: 280,
        atk: 42,
        def: 10,
        spd: 2.2,
        range: 1.4,
        atkCooldown: 1.4,
        radius: 0.9,
        spawnRange: [3, 8],
        scale: 1.25,
        ability: '重装甲＆故障 (堅牢だが攻撃時に稀にショート硬直)',
        rarity: 'EPIC',
        rarityLabel: 'スーパーレア',
        rarityColor: '#9b59b6',
        role: '超重装タンク・重量級火力',
        abilityData: {
            name: '重装甲 ＆ 故障 (Heavy Armor & Glitch)',
            type: '常時防御 ＋ 攻撃時確率トリガー',
            summary: '最高硬度の装甲で敵の攻撃を大幅カットし超火力で粉砕しますが、攻撃時に確率でオーバーヒート硬直を起こします。',
            specs: [
                { label: '装甲値 (DEF)', value: '10 (全勢力最高硬度、通常攻撃を最低保証まで減衰)' },
                { label: '一撃の威力 (ATK)', value: '42 (乱数±15%で 36〜48、低HPキャラを2撃で粉砕)' },
                { label: '故障発生確率', value: '攻撃実行時に 15% の確率で発生' },
                { label: '故障停止時間', value: '2.2 秒間 (移動・攻撃・反撃が完全不能の無防備状態)' }
            ],
            formula: '被ダメージ = max(生ダメ×0.25, 生ダメ - 10), 故障率 = 15%'
        },
        profile: '超古代文明の技術で作られた自律型戦闘マシン。分厚い特殊合金装甲で敵の攻撃を弾き返し粉砕アームで叩き潰しますが、動力炉が不安定で時折ショートを起こす欠陥を抱えています。',
        tactics: '少数精鋭ですが驚異的な硬さと打撃力。故障中に集中砲火を浴びて倒されない限り、高い勝率を叩き出す本命候補です。'
    },
    slime: {
        id: 'slime',
        name: 'スライム',
        category: 'basic',
        categoryLabel: '基本',
        desc: '倒されると小型スライム2体に分裂。粘り強く数で押す。',
        color: '#9b59b6',
        colorInt: 0x9b59b6,
        hp: 105,
        atk: 12,
        def: 2,
        spd: 3.3,
        range: 1.2,
        atkCooldown: 0.75,
        radius: 0.65,
        spawnRange: [6, 16],
        scale: 0.9,
        ability: '分裂 (死亡時に小型スライム2体に分裂)',
        rarity: 'UNCOMMON',
        rarityLabel: 'アンコモン',
        rarityColor: '#2ecc71',
        role: '分裂ブロッカー・粘着持久型',
        abilityData: {
            name: '細胞分裂 (Cell Division)',
            type: '死亡時トリガー (小型化・分裂召喚)',
            summary: '親スライムが倒された瞬間、左右に小型ミニスライム2体を生成して戦線を維持します。',
            specs: [
                { label: '分裂数', value: '小型ミニスライム 2体' },
                { label: 'ミニスライムHP', value: '親の 50% (HP 52)' },
                { label: 'ミニスライム攻撃力', value: '親の 60% (ATK 7)' },
                { label: 'ミニスライム体格', value: '親の 70% (半径 0.45m、小回りが利く)' },
                { label: '分裂回数制限', value: '1回のみ (ミニスライムは再分裂しない)' }
            ],
            formula: '生成数 = 2体, 子HP = Math.round(105×0.5) = 52, 子ATK = 7'
        },
        profile: '地下迷宮から湧き出た不定形の粘液生物。体内に魔力の核を持ち、物理攻撃で叩き斬られても即座に分裂して増殖する、極めて高い生存持久力を誇ります。',
        tactics: '実質的な頭数が初期人数の2〜3倍近くに達するため、敵のターゲットを分散させる壁役として優秀。手数でじわじわ削り勝つ粘り強さがあります。'
    },
    ghost: {
        id: 'ghost',
        name: '幽霊',
        category: 'basic',
        categoryLabel: '基本',
        desc: '定期的に霊体化して敵の攻撃を完全にすり抜ける。',
        color: '#74b9ff',
        colorInt: 0x74b9ff,
        hp: 75,
        atk: 17,
        def: 0,
        spd: 3.8,
        range: 1.6,
        atkCooldown: 0.85,
        radius: 0.65,
        spawnRange: [6, 16],
        scale: 0.95,
        ability: 'すり抜け (周期的に無敵・すり抜け状態)',
        rarity: 'RARE',
        rarityLabel: 'レア',
        rarityColor: '#3498db',
        role: '無敵回避・トリックスター',
        abilityData: {
            name: '霊体化・すり抜け (Phase Shift)',
            type: '周期的パッシブ (完全無敵 ＆ すり抜け)',
            summary: '一定周期で霊体化し、物理攻撃・ドラゴンの炎ブレス・衝突判定をすべて透過する完全無敵状態になります。',
            specs: [
                { label: '通常実体化時間', value: '3.5 秒間 (攻撃可能、被弾判定あり)' },
                { label: '霊体化(無敵)時間', value: '1.8 秒間 (ダメージ完全透過、MISS表示)' },
                { label: '無敵稼働率', value: '約 34% (総戦闘時間の約1/3が無敵状態)' },
                { label: '衝突判定', value: '霊体化中は壁や敵ユニットを完全にすり抜けて移動可能' }
            ],
            formula: 'サイクル: 実体3.5s -> 霊体1.8s (MISS=被ダメ0) -> ループ'
        },
        profile: '現世に未練を残し闘技場をさまよう青白い怨霊。実体と霊体の狭間を行き来し、敵の武器や炎がその体を空しく通り抜ける様を嘲笑います。',
        tactics: 'ドラゴンの大技ブレスをもすり抜ける天敵枠。ただし実体化中（通常時）に攻撃を浴びると一瞬で蒸発するため、タイミング次第で大金星を挙げるギャンブル性の高い勢力です。'
    },
    dragon: {
        id: 'dragon',
        name: 'ドラゴン',
        category: 'basic',
        categoryLabel: '基本',
        desc: '圧倒的な巨大生物。前方広範囲に灼熱の火炎ブレスを放つ。必ず1体のみ出現。',
        color: '#e74c3c',
        colorInt: 0xe74c3c,
        hp: 1350,
        atk: 52,
        def: 7,
        spd: 3.2,
        range: 4.5,
        atkCooldown: 1.6,
        radius: 1.6,
        spawnRange: [1, 1], // 必ず1体限定
        scale: 2.2,
        ability: '火炎ブレス (前方扇状の範囲連続ダメージ)',
        rarity: 'LEGENDARY',
        rarityLabel: 'レジェンド',
        rarityColor: '#e74c3c',
        role: '単騎制圧・レイドボス',
        abilityData: {
            name: '灼熱の火炎ブレス (Inferno Breath)',
            type: '前方広範囲攻撃 (扇状ブレス ＋ 分散ダメージ)',
            summary: '前方の扇状範囲に高威力の火炎放射を浴びせ、群がる敵をまとめて焼き尽くします。',
            specs: [
                { label: '出現制限', value: '必ず 1体限定 (巨躯スケール 2.2倍)' },
                { label: 'ブレス有効射程', value: '前方 5.7m (基礎射程4.5m + 1.2m)' },
                { label: 'ブレス放射角度', value: '前方扇状 約50度 (0.85 rad)' },
                { label: '基礎攻撃力', value: '52 (基礎生ダメージ 41〜62)' },
                { label: '巻き込み分散係数', value: '1体:100% / 2体:90% / 3体:80% / 4体以上:70%' }
            ],
            formula: '各敵生ダメージ = 52 × [0.8〜1.2] × 分散倍率(0.7〜1.0)'
        },
        profile: '太古の火山に君臨する真紅の巨竜。闘技場の絶対的な頂点捕食者であり、規格外の巨躯と灼熱の業火で単騎にして軍勢を圧倒します。',
        tactics: '1体のみの出現ながら圧倒的なステータス。群れを一掃できますが、全方位から包囲されたり幽霊に攻撃を空振りさせられると討伐される波乱も起こります。'
    },
    ninja: {
        id: 'ninja',
        name: '忍者',
        category: 'basic',
        categoryLabel: '基本',
        desc: '遠距離から手裏剣を投擲。危機には煙玉で背後に回り込む。',
        color: '#fdcb6e',
        colorInt: 0xfdcb6e,
        hp: 80,
        atk: 16,
        def: 2,
        spd: 4.7,
        range: 5.5,
        atkCooldown: 0.65,
        radius: 0.65,
        spawnRange: [5, 14],
        scale: 0.95,
        ability: '手裏剣＆空蝉 (遠距離攻撃、ピンチ時に背後へ瞬間移動)',
        rarity: 'EPIC',
        rarityLabel: 'スーパーレア',
        rarityColor: '#9b59b6',
        role: '長距離狙撃・幻術アサシン',
        abilityData: {
            name: '手裏剣投擲 ＆ 空蝉の術 (Shuriken & Shunshin)',
            type: '長距離射撃 ＋ ピンチ時自動テレポート',
            summary: '全勢力中最長の射程から手裏剣を連射し、HPが半減すると煙玉とともに敵の背後へ一瞬でワープします。',
            specs: [
                { label: '手裏剣射程', value: '5.5m (全勢力最長射程、安全圏から削る)' },
                { label: '手裏剣弾速', value: '14.0 m/s (高速飛翔)' },
                { label: '攻撃間隔', value: '0.65 秒 (毎秒 1.54 回の連射)' },
                { label: '空蝉ワープ発動契機', value: 'HPが 50%未満 (HP 39以下) に到達時' },
                { label: 'ワープ先', value: '最も近い敵の背後 1.8m の地点へ瞬間移動 (1回限定)' }
            ],
            formula: 'ワープ先座標 = 敵座標 + 敵後方ベクトル×1.8m (1戦1回発動)'
        },
        profile: '闇夜に潜む暗殺集団。近寄る敵をアウトレンジから一方的に削り、接近された際も身代わりの術で背後へ回り込んで陣形をかき乱します。',
        tactics: '鈍足な近接キャラを安全圏からタコ殴りにできます。空蝉によるワープでタゲを外せるため、生き残り性能が高いテクニカル勢力です。'
    },

    // ==========================================
    // 大群系 (swarm) - 数で押す・見た目が派手
    // ==========================================
    rat: {
        id: 'rat',
        name: 'ネズミ',
        category: 'swarm',
        categoryLabel: '大群系',
        desc: '40〜70匹の大群で群がり、敵を毒状態にして防御を貫通してじわじわ削る。',
        color: '#a4b0be',
        colorInt: 0xa4b0be,
        hp: 18,
        atk: 6,
        def: 0,
        spd: 4.8,
        range: 0.9,
        atkCooldown: 0.6,
        radius: 0.45,
        spawnRange: [40, 70],
        scale: 0.65,
        ability: '疫病 (噛まれた敵に毎秒2毒ダメージ×4秒、重複累積可)',
        rarity: 'COMMON',
        rarityLabel: 'コモン',
        rarityColor: '#95a5a6',
        role: '超大群・毒持続ダメージ',
        abilityData: {
            name: '疫病 (Plague Bite)',
            type: '攻撃時トリガー (毒スタック付与)',
            summary: '噛みついた相手に疫病の毒を感染させます。防御力に関係なく毎秒ダメージを与え、複数体で噛むと重複します。',
            specs: [
                { label: '毒ダメージ', value: '毎秒 2 ダメージ (防御貫通)' },
                { label: '持続時間', value: '4.0 秒間' },
                { label: '重ねがけ', value: '可能 (噛まれた数だけ毒が重複累積)' },
                { label: '出現頭数', value: '40〜70 体 (全勢力最多)' }
            ],
            formula: '毎秒毒ダメージ = スタック数 × 2 (4秒持続)'
        },
        profile: '下水道から大群で湧き出る飢えたネズミ。1体は弱小ですが、数十匹で獲物に群がり無数の毒牙で高装甲の敵をも沈めます。',
        tactics: 'ロボなどの重装甲キャラに対して毒が特効。ただしドラゴンのブレスや巨人の踏みつけなど範囲攻撃には一瞬で全滅します。'
    },
    bee: {
        id: 'bee',
        name: 'ハチ',
        category: 'swarm',
        categoryLabel: '大群系',
        desc: '超高速で空中を飛び敵に突撃。毒針を刺して自爆し、強力な猛毒を残す。',
        color: '#f9ca24',
        colorInt: 0xf9ca24,
        hp: 10,
        atk: 9,
        def: 0,
        spd: 6.0,
        range: 1.0,
        atkCooldown: 1.0,
        radius: 0.4,
        spawnRange: [25, 45],
        scale: 0.6,
        ability: '毒針 (刺すと自爆し毎秒5毒×4秒、攻撃を20%回避)',
        rarity: 'COMMON',
        rarityLabel: 'コモン',
        rarityColor: '#95a5a6',
        role: '特攻急襲・猛毒自爆',
        abilityData: {
            name: '決死の毒針 (Stinger Kamikaze)',
            type: '攻撃時自死 ＋ 猛毒付与 ＋ 常時回避',
            summary: '全勢力最速の6.0m/sで急降下し、相手に猛毒を残して散ります。空中飛行により20%の攻撃をすり抜けます。',
            specs: [
                { label: '飛行回避率', value: '20% (敵の攻撃をMISS化)' },
                { label: '毒針ダメージ', value: '通常ATK9 + 毎秒5毒×4秒 (計29ダメージ)' },
                { label: '発動結果', value: '攻撃命中時に自身は死亡' },
                { label: '移動速度', value: '6.0 m/s (犬をも上回る全勢力最速)' }
            ],
            formula: '命中時: 自身死亡 + 敵に毎秒5ダメージ×4秒付与'
        },
        profile: '女王を守るため命を投げ出す戦闘蜂の群れ。俊敏な飛行で攻撃を躱しながら肉薄し、一撃必殺の毒針を打ち込みます。',
        tactics: '単騎の強敵に群がって一斉に刺すことで、短時間で数千の毒ダメージを叩き込み瞬殺できます。'
    },
    mushroom: {
        id: 'mushroom',
        name: 'キノコ',
        category: 'swarm',
        categoryLabel: '大群系',
        desc: '歩く胞子茸。周囲の敵を混乱させて同士討ちさせ、死ぬと胞子雲を撒き散らす。',
        color: '#e056fd',
        colorInt: 0xe056fd,
        hp: 90,
        atk: 8,
        def: 3,
        spd: 1.5,
        range: 1.2,
        atkCooldown: 1.0,
        radius: 0.65,
        spawnRange: [10, 20],
        scale: 0.9,
        ability: '胞子 (10%で敵同士討ち、死ぬと胞子雲)',
        rarity: 'UNCOMMON',
        rarityLabel: 'アンコモン',
        rarityColor: '#2ecc71',
        role: '混乱妨害・陣形破壊',
        abilityData: {
            name: '幻惑の胞子 (Confusing Spores)',
            type: 'オーラパッシブ ＋ 死亡時胞子雲',
            summary: '幻覚胞子を放ち、周囲の敵が攻撃する際に10%の確率で味方を誤射させます。倒れると胞子雲が残ります。',
            specs: [
                { label: '混乱発動率', value: '周囲3.0m内の敵の攻撃時 10%' },
                { label: '混乱効果', value: '最も近い味方ユニットへ攻撃が向けられる' },
                { label: '死亡時胞子雲', value: '半径2.5mに3秒間残留、侵入敵を鈍足化' },
                { label: '耐久力', value: 'HP 90 / DEF 3 (鈍足だが頑丈)' }
            ],
            formula: '敵攻撃時: 10%で標的を味方に強制変更'
        },
        profile: '湿地帯に自生する知性を持った毒キノコ。胞子を吸い込んだ者は敵味方の区別がつかなくなり、内側から自滅していきます。',
        tactics: '人間の結束や犬の群れなど、数の多い相手の中に潜り込むと同士討ちで大混乱を起こせます。'
    },

    // ==========================================
    // 少数精鋭系 (elite) - 1体が主役
    // ==========================================
    giant: {
        id: 'giant',
        name: '巨人',
        category: 'elite',
        categoryLabel: '少数精鋭',
        desc: '天を突く超巨大戦士。足元の小型ユニットを踏みつぶして即死させる。',
        color: '#d35400',
        colorInt: 0xd35400,
        hp: 900,
        atk: 45,
        def: 6,
        spd: 2.0,
        range: 2.2,
        atkCooldown: 1.6,
        radius: 1.6,
        spawnRange: [1, 2],
        scale: 2.2,
        ability: '踏みつけ (HP50以下小型即死・範囲打撃)',
        rarity: 'LEGENDARY',
        rarityLabel: 'レジェンド',
        rarityColor: '#e74c3c',
        role: '超巨躯タンク・小型キラー',
        abilityData: {
            name: '大地震の踏みつけ (Colossal Stomp)',
            type: '攻撃時範囲即死 ＋ 衝撃波',
            summary: '巨大な足で大地を揺るがし、足元にいる最大HP50以下の小型ユニットを即座に圧殺します。',
            specs: [
                { label: '小型即死条件', value: '現在HP 50以下のユニットを即死' },
                { label: '踏みつけ範囲', value: '前方半径 2.6m' },
                { label: '通常ダメージ', value: 'ATK 45 + 周囲ノックバック' },
                { label: '基礎耐久', value: 'HP 900 / DEF 6' }
            ],
            formula: '対象HP <= 50 -> 即死、それ以外 -> 生ATK 45範囲打撃'
        },
        profile: '古代の山岳から現れた伝説の巨神。小兵の群れなど視界にも入らず、一歩踏み出すごとに大地が裂け無数の命が塵となります。',
        tactics: 'ネズミやハチ、猫などの大群・小型勢力に対する究極の天敵。ただし忍者やサムライの単体高火力には削られやすいです。'
    },
    reaper: {
        id: 'reaper',
        name: '死神',
        category: 'elite',
        categoryLabel: '少数精鋭',
        desc: '巨大な大鎌を振るう冥府の執行者。弱った敵を即座に刈り取り、加速する。',
        color: '#2c3e50',
        colorInt: 0x2c3e50,
        hp: 220,
        atk: 30,
        def: 3,
        spd: 4.0,
        range: 2.0,
        atkCooldown: 1.1,
        radius: 0.8,
        spawnRange: [1, 3],
        scale: 1.25,
        ability: '刈り取り (HP20%以下即死、キルで速度上昇)',
        rarity: 'EPIC',
        rarityLabel: 'スーパーレア',
        rarityColor: '#9b59b6',
        role: '処刑執行・連撃加速',
        abilityData: {
            name: '魂の刈り取り (Soul Reaper)',
            type: 'HP閾値即死 ＋ 撃破時バフ累積',
            summary: 'HPが20%以下になった敵の魂を大鎌で刈り取って即死させ、敵を倒すごとに攻撃速度と移動速度が永続上昇します。',
            specs: [
                { label: '処刑閾値', value: '対象の最大HPの 20% 以下' },
                { label: '撃破ボーナス', value: 'SPD +0.5m/s, 攻撃間隔 -0.07s (最大5回)' },
                { label: '最大加速時', value: 'SPD 6.5m/s, 攻撃間隔 0.75s' },
                { label: '基礎ステータス', value: 'HP 220 / ATK 30' }
            ],
            formula: '対象HP <= 最大HP×0.20 -> 即死、キル時 -> 速度+0.5, 間隔-0.07'
        },
        profile: '黄泉の帳より訪れる黒衣の処刑者。傷つき倒れゆく獲物の魂を収穫し、刈り取った命を力に変えて疾風の如く戦場を駆け巡ります。',
        tactics: '混戦の終盤に真価を発揮。削られた敵を次々に処刑して加速し、無双状態に突入します。'
    },
    samurai: {
        id: 'samurai',
        name: 'サムライ',
        category: 'elite',
        categoryLabel: '少数精鋭',
        desc: '研ぎ澄まされた抜刀術。間合いに入った刹那、3倍威力の神速居合を放つ。',
        color: '#c0392b',
        colorInt: 0xc0392b,
        hp: 130,
        atk: 26,
        def: 4,
        spd: 3.8,
        range: 1.5,
        atkCooldown: 1.2,
        radius: 0.7,
        spawnRange: [3, 7],
        scale: 1.05,
        ability: '神速居合 (間合いに入って1秒後の一撃が3倍ダメージ、CT8s)',
        rarity: 'RARE',
        rarityLabel: 'レア',
        rarityColor: '#3498db',
        role: '一撃必殺・高バースト',
        abilityData: {
            name: '神速居合 (Iaido Strike)',
            type: '間合い検知チャージ ＋ 超会心一撃',
            summary: '敵の間合いに入ると鯉口を切り、1.0秒の精神集中の後に3倍ダメージ(ATK 78)の白刃一閃を繰り出します。',
            specs: [
                { label: '居合倍率', value: '3.0 倍ダメージ (ATK 78〜100)' },
                { label: '集中時間', value: '敵が間合いに入ってから 1.0 秒' },
                { label: '納刀クールダウン', value: '8.0 秒間' },
                { label: '通常時', value: 'ATK 26 の鋭い太刀打ち' }
            ],
            formula: '居合発動時: ダメージ = ATK × 3.0 (CT 8.0s)'
        },
        profile: '東方の武士道を極めた孤高の剣客。静寂の中に殺気を研ぎ澄まし、鞘走る白刃の光とともに敵を両断します。',
        tactics: '初撃の居合で相手のエース（ロボ、吸血鬼、敵サムライ等）を一撃で致命傷に追い込めます。大群に囲まれる前に各個撃破が理想。'
    },
    golem: {
        id: 'golem',
        name: 'ゴーレム',
        category: 'elite',
        categoryLabel: '少数精鋭',
        desc: 'DEF 14の生ける岩塊。低攻撃力の打撃を無力化し、倒れると小岩3体に崩落。',
        color: '#7f8c8d',
        colorInt: 0x7f8c8d,
        hp: 480,
        atk: 30,
        def: 14,
        spd: 1.6,
        range: 1.5,
        atkCooldown: 1.8,
        radius: 1.2,
        spawnRange: [2, 4],
        scale: 1.5,
        ability: '岩の体 (DEF14、死亡時小岩3体に崩落分裂)',
        rarity: 'EPIC',
        rarityLabel: 'スーパーレア',
        rarityColor: '#9b59b6',
        role: '超高防御タンク・死後小岩分裂',
        abilityData: {
            name: '岩の体 ＆ 崩壊分裂 (Granite Form)',
            type: '最高防御力 ＋ 死亡時ミニ小岩3体召喚',
            summary: 'DEF 14の鉄壁石肌で通常攻撃を最低保証2まで遮断。倒されると3体の小岩ゴーレムに崩れ落ちて戦い続けます。',
            specs: [
                { label: '防御力 (DEF)', value: '14 (全勢力トップの防御力)' },
                { label: '小岩分裂数', value: '死亡時に 3 体生成' },
                { label: '小岩ステータス', value: 'HP 100 / ATK 12 / DEF 6' },
                { label: '弱点', value: '移動速度 1.6m/s (鈍足)' }
            ],
            formula: '死亡時: 小岩(HP100, ATK12, DEF6)×3体生成'
        },
        profile: '古代遺跡の石畳が魔力で結集した石像兵。刃も牙も通さぬ巨躯を誇り、仮に砕かれようとも破片となって襲いかかります。',
        tactics: 'ネズミや犬、ゾンビなどの低攻撃力キャラを完封。ただし毒などの固定スリップダメージには削られます。'
    },

    // ==========================================
    // ギミック系 (gimmick) - 何が起きるかわからない
    // ==========================================
    bomber: {
        id: 'bomber',
        name: '爆弾魔',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '爆薬を抱えて疾走。HP30%以下か死亡時に無差別大爆発(60ダメ)を起こす。',
        color: '#e74c3c',
        colorInt: 0xe74c3c,
        hp: 45,
        atk: 8,
        def: 0,
        spd: 4.4,
        range: 1.0,
        atkCooldown: 0.7,
        radius: 0.6,
        spawnRange: [8, 18],
        scale: 0.85,
        ability: '大自爆 (HP30%以下または死亡時に半径3mで60無差別ダメージ)',
        rarity: 'UNCOMMON',
        rarityLabel: 'アンコモン',
        rarityColor: '#2ecc71',
        role: '無差別自爆・盤面爆破',
        abilityData: {
            name: '破滅の大自爆 (Mega Blast)',
            type: 'HPトリガー/死亡時発火 (敵味方無差別)',
            summary: 'HPが30%以下になるか倒された瞬間、抱えた特大爆薬に点火し、半径3mの敵味方全員に60の純粋ダメージを与えます。',
            specs: [
                { label: '爆発威力', value: '60 純粋ダメージ (防御貫通)' },
                { label: '爆発半径', value: '3.0 m (広範囲)' },
                { label: '対象', value: '敵・味方・自身を含む無差別' },
                { label: '起爆条件', value: 'HP <= 13 または死亡時' }
            ],
            formula: '起爆時: 半径3m内の全ユニットに 60 純粋ダメージ'
        },
        profile: '火薬の匂いに陶酔した狂気の工作員。敵陣のど真ん中で大爆発を起こすことだけを至上の喜びとしています。',
        tactics: '密集した敵陣に飛び込めば大逆転勝利をもたらしますが、味方の中で誘爆連鎖すると一瞬で自軍が消滅するハイリスク勢力です。'
    },
    clown: {
        id: 'clown',
        name: 'ピエロ',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '神出鬼没の道化師。5秒ごとに敵1体と位置を交換し、戦況を引っ掻き回す。',
        color: '#9b59b6',
        colorInt: 0x9b59b6,
        hp: 85,
        atk: 10,
        def: 1,
        spd: 4.0,
        range: 1.2,
        atkCooldown: 0.9,
        radius: 0.65,
        spawnRange: [5, 12],
        scale: 0.9,
        ability: '入れ替わり (5秒ごとに敵1体と瞬時に座標を交換)',
        rarity: 'RARE',
        rarityLabel: 'レア',
        rarityColor: '#3498db',
        role: '陣形攪乱・位置スワップ',
        abilityData: {
            name: '奇術・入れ替わり (Trick Swap)',
            type: '周期的アクティブ (位置強制交換)',
            summary: '5.0秒周期で、ランダムな敵1体と自分自身の座標を瞬時に入れ替えます。後方のドラゴンや巨人を引きずり出せます。',
            specs: [
                { label: '発動周期', value: '5.0 秒ごと' },
                { label: '対象選定', value: '戦場にいる生存中の敵1体' },
                { label: 'スワップ効果', value: '自身の座標と対象の座標を瞬時に入れ替え' },
                { label: '攪乱効果', value: '敵のターゲットをリセット' }
            ],
            formula: '5秒ごと: 自分.x,z <-> 敵.x,z 交換'
        },
        profile: 'アリーナを混沌のサーカスに変える道化師。指を鳴らすだけで敵と自分の立ち位置をすり替え、敵を自軍の包囲網へと放り込みます。',
        tactics: '敵のボス（ドラゴンやロボ）を孤立させたり、逆に敵の後衛を奪い取ったりと、予想をことごとく裏切る奇策の達人です。'
    },
    mimic: {
        id: 'mimic',
        name: 'ミミック',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '宝箱の怪物。最初に接触した敵勢力の固有能力とステータス30%をコピー。',
        color: '#b33939',
        colorInt: 0xb33939,
        hp: 100,
        atk: 12,
        def: 2,
        spd: 3.6,
        range: 1.2,
        atkCooldown: 0.9,
        radius: 0.7,
        spawnRange: [4, 10],
        scale: 1.0,
        ability: '擬態 (接触した敵の能力＆攻防30%をコピー獲得)',
        rarity: 'RARE',
        rarityLabel: 'レア',
        rarityColor: '#3498db',
        role: '能力強奪・メタコピー',
        abilityData: {
            name: '擬態 (Mimicry)',
            type: '初回接触トリガー (能力・ステータス強奪)',
            summary: '戦闘で最初に触れた敵の固有能力をラーニングし、さらに相手のATKとDEFの30%を自身に加算します。',
            specs: [
                { label: '能力コピー', value: '相手の固有スキル（ブレス、感染、自爆、連鎖雷等）を即時習得' },
                { label: 'ステータスボーナス', value: '相手の ATK×30% ＋ DEF×30% を加算' },
                { label: '発動契機', value: '初回攻撃ヒット時または被弾時 (1戦1回)' },
                { label: '変身演出', value: '相手勢力のエフェクト・色合いを模倣' }
            ],
            formula: 'コピー時: 能力獲得 + ATK += 敵ATK×0.3 + DEF += 敵DEF×0.3'
        },
        profile: '黄金の宝箱に化けた謎の多相生物。獲物が油断して触れた瞬間、その本質を食らい尽くして同一の能力を模倣します。',
        tactics: '相手にドラゴンやロボ、サムライがいる時に当たれば強力なアタッカーに化けます。誰と最初に接触するかでオッズが激変します。'
    },
    yukionna: {
        id: 'yukionna',
        name: '雪女',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '冷気を放つ妖怪。攻撃で敵を鈍足化し、3回累積で2秒間完全凍結させる。',
        color: '#74b9ff',
        colorInt: 0x74b9ff,
        hp: 90,
        atk: 15,
        def: 2,
        spd: 3.4,
        range: 3.0,
        atkCooldown: 1.0,
        radius: 0.7,
        spawnRange: [4, 9],
        scale: 1.0,
        ability: '凍結 (命中時SPD-40%、3スタックで2秒完全凍結)',
        rarity: 'RARE',
        rarityLabel: 'レア',
        rarityColor: '#3498db',
        role: '氷結射撃・行動停止デバフ',
        abilityData: {
            name: '絶対零度の吐息 (Absolute Frost)',
            type: '攻撃時スタックデバフ (鈍足 ＆ 凍結硬直)',
            summary: '射程3.0mの吹雪弾を放ち、敵の足を40%奪います。吹雪を3回浴びた敵は氷塊となり、2.0秒間行動不能になります。',
            specs: [
                { label: '鈍足効果', value: '移動速度 -40% (4秒間持続)' },
                { label: '完全凍結条件', value: '同一対象に 3回 命中' },
                { label: '凍結持続', value: '2.0 秒間 (移動・攻撃不可)' },
                { label: '攻撃射程', value: '3.0 m (中距離アウトレンジ)' }
            ],
            formula: '命中時: 速度-40%, 3スタック到達時: 2秒完全硬直'
        },
        profile: '銀世界から舞い降りた氷の精霊。冷酷なまでの吹雪で標的の体温を奪い、凍てつく彫像へと変えてしまいます。',
        tactics: '犬や忍者、猫などの俊足勢力への強力なアンチ。遠距離から敵を固めて一方的に封殺できます。'
    },
    vampire: {
        id: 'vampire',
        name: '吸血鬼',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '闇の貴族。与えたダメージの50%を回復し、HP30%でコウモリ化して逃亡。',
        color: '#881b24',
        colorInt: 0x881b24,
        hp: 100,
        atk: 20,
        def: 3,
        spd: 4.2,
        range: 1.3,
        atkCooldown: 0.8,
        radius: 0.7,
        spawnRange: [4, 9],
        scale: 1.05,
        ability: '吸血＆蝙蝠化 (与ダメ50%回復、HP30%で3秒無敵逃走)',
        rarity: 'EPIC',
        rarityLabel: 'スーパーレア',
        rarityColor: '#9b59b6',
        role: '自己回復ドレイン・緊急脱出',
        abilityData: {
            name: '吸血 ＆ 蝙蝠変生 (Blood Feast)',
            type: '常時ドレイン ＋ ピンチ時無敵脱出',
            summary: '噛みつきで与えた実ダメージの50%を即時HP吸収。HPが30%を切るとコウモリの大群に変身し3秒間逃走します。',
            specs: [
                { label: '吸血回復率', value: '実与ダメージの 50%' },
                { label: 'コウモリ化条件', value: 'HP <= 30% 到達時 (1戦1回)' },
                { label: 'コウモリ化効果', value: '3.0 秒間完全無敵 ＋ 移動速度 7.0m/s' },
                { label: '戦闘スタイル', value: '高機動・粘り強いタイマン性能' }
            ],
            formula: '攻撃時: HP += 実ダメ×0.5, HP<=30%: 3秒無敵逃走'
        },
        profile: '夜の支配者たる吸血貴族。敵の血を啜ることで傷を癒し、窮地に陥れば霧とコウモリに溶けて致命傷を逃れます。',
        tactics: 'タイマン勝負で抜群の耐久力を発揮。ゾンビやゴーレムとの殴り合いでも回復によって競り勝ちます。'
    },
    cat: {
        id: 'cat',
        name: '猫',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: 'しなやかな敏捷獣。倒されてもHP30%で最大3回復活。倒すたびに攻撃力-10%。',
        color: '#f39c12',
        colorInt: 0xf39c12,
        hp: 40,
        atk: 14,
        def: 1,
        spd: 5.0,
        range: 1.1,
        atkCooldown: 0.6,
        radius: 0.55,
        spawnRange: [6, 12],
        scale: 0.8,
        ability: '九つの命 (最大3回までHP30%で蘇生、攻撃力-10%)',
        rarity: 'UNCOMMON',
        rarityLabel: 'アンコモン',
        rarityColor: '#2ecc71',
        role: '無限蘇生・手数攪乱',
        abilityData: {
            name: '九つの命 (Nine Lives)',
            type: '死亡時自動復活 (最大3回)',
            summary: '致命傷を受けても即座に起き上がり、HP 30%(HP 12)で戦闘に復帰します。最大3回まで蘇生可能です。',
            specs: [
                { label: '最大復活回数', value: '3 回まで' },
                { label: '復活時HP', value: '最大HPの 30% (HP 12)' },
                { label: 'ペナルティ', value: '復活ごとに ATK -10%' },
                { label: '攻撃手数', value: '間隔 0.6秒 (高速引っかき)' }
            ],
            formula: '死亡時(残機>0): 復活HP 12, ATK *= 0.90, 残機-1'
        },
        profile: '古より魔力を持つとされる霊猫。命を複数持ち、一度や二度倒された程度では毛づくろいしながら飄々と立ち上がります。',
        tactics: '相手の攻撃を何度も吸い寄せるデコイ役として超優秀。実況でも「また起きた！」と大いに盛り上がります。'
    },
    raiju: {
        id: 'raiju',
        name: '雷獣',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '稲妻を纏う神獣。攻撃が周囲の敵2体に連鎖(100%→60%→30%)して密集を焼く。',
        color: '#f1c40f',
        colorInt: 0xf1c40f,
        hp: 120,
        atk: 22,
        def: 2,
        spd: 5.2,
        range: 1.6,
        atkCooldown: 0.9,
        radius: 0.8,
        spawnRange: [3, 6],
        scale: 1.15,
        ability: '連鎖雷 (攻撃が近くの敵に連鎖 100%->60%->30%)',
        rarity: 'EPIC',
        rarityLabel: 'スーパーレア',
        rarityColor: '#9b59b6',
        role: '高速電撃・チェインライトニング',
        abilityData: {
            name: '連鎖稲妻 (Chain Lightning)',
            type: '攻撃時チェイン放電 (複数ターゲット)',
            summary: '鋭い爪撃とともに雷撃を放ち、主目標から周囲3.5m内の敵2体へ電撃が次々に連鎖跳躍します。',
            specs: [
                { label: '1体目 (主目標)', value: '100% ダメージ (ATK 22)' },
                { label: '2体目 (第1連鎖)', value: '60% ダメージ (ATK 13)' },
                { label: '3体目 (第2連鎖)', value: '30% ダメージ (ATK 7)' },
                { label: '連鎖有効距離', value: '敵から 3.5m 以内' }
            ],
            formula: '連鎖ダメージ = 主目標 100% -> 60% -> 30%'
        },
        profile: '雷雲とともに降臨する黄金の四足獣。体表を走る高圧電流を爪先から放ち、密集した軍勢を一瞬で感電させます。',
        tactics: '人間の結束やネズミ、ハチの大群に絶大な威力を誇ります。散開した少数相手には普通の強さにとどまります。'
    },
    cattle: {
        id: 'cattle',
        name: '牛の群れ',
        category: 'gimmick',
        categoryLabel: 'ギミック系',
        desc: '怒涛の暴走牛。8秒ごとに一直線に猛スピード突進し、敵を吹き飛ばす。',
        color: '#795548',
        colorInt: 0x795548,
        hp: 160,
        atk: 28,
        def: 4,
        spd: 4.0,
        range: 1.4,
        atkCooldown: 1.2,
        radius: 0.9,
        spawnRange: [5, 10],
        scale: 1.25,
        ability: 'スタンピード (8秒ごとに速度7.0で突進、敵を弾き飛ばし20ダメ)',
        rarity: 'RARE',
        rarityLabel: 'レア',
        rarityColor: '#3498db',
        role: '直線制圧・突進ノックバック',
        abilityData: {
            name: '怒涛の暴走 (Stampede Charge)',
            type: '周期的直線突進 (弾き飛ばし ＆ 固定ダメ)',
            summary: '8.0秒周期で足を踏み鳴らし、敵の多い方向へ向けて速度7.0m/sで一直線に突進！経路上の敵を弾き飛ばします。',
            specs: [
                { label: '突進速度', value: '7.0 m/s (超特急)' },
                { label: '突進持続', value: '3.0 秒間 (直線疾走)' },
                { label: '突進ダメージ', value: '接触した敵に固定 20 ダメージ' },
                { label: 'ノックバック', value: '進路上から外側へ大きく弾き飛ばす' }
            ],
            formula: '8秒ごと: 速度7.0で直線突進3秒 + 接触敵に20ダメ'
        },
        profile: '平原を地鳴りとともに疾走する闘牛の群れ。一度走り出せば何者にも止められず、巨角で立ちはだかる者を蹴散らします。',
        tactics: '直線の突進軌道が非常に見やすく痛快。敵の陣形を真っ二つに分断して前衛と後衛をバラバラに破壊します。'
    }
};

/**
 * 戦闘ユニット
 */
export class BattleUnit {
    constructor(id, factionId, x, z, isChild = false) {
        this.id = id;
        this.factionId = factionId;
        this.baseConfig = FACTIONS[factionId];

        // 座標と移動
        this.x = x;
        this.z = z;
        this.vx = 0;
        this.vz = 0;
        this.facingAngle = Math.random() * Math.PI * 2;

        // ステータス（分裂体などの補正）
        this.isChild = isChild;
        const hpMultiplier = isChild ? 0.5 : 1.0;
        const scaleMultiplier = isChild ? 0.7 : 1.0;

        this.maxHp = Math.round(this.baseConfig.hp * hpMultiplier);
        this.hp = this.maxHp;
        this.atk = Math.round(this.baseConfig.atk * (isChild ? 0.6 : 1.0));
        this.def = this.baseConfig.def;
        this.spd = this.baseConfig.spd;
        this.range = this.baseConfig.range;
        this.atkCooldownMax = this.baseConfig.atkCooldown;
        this.atkTimer = Math.random() * 0.3; // 初回攻撃までの微小ディレイ
        this.radius = this.baseConfig.radius * scaleMultiplier;
        this.scale = this.baseConfig.scale * scaleMultiplier;

        // 状態フラグ
        this.alive = true;
        this.targetId = null;
        this.kills = 0;
        this.damageDealt = 0;

        // 特殊能力タイマー・フラグ
        this.isGlitching = false;      // ロボ故障
        this.glitchTimer = 0;
        this.isPhasing = false;        // 幽霊すり抜け
        this.phaseTimer = Math.random() * 2.0;
        this.hasTeleported = false;    // 忍者ワープ使用フラグ
        this.humanBondCount = 0;       // 人間の結束数

        // 新15勢力用パラメータ
        this.poisonInstances = [];     // 毒状態配列 [{ dps: number, duration: number }]
        this.freezeStacks = 0;         // 雪女の凍結スタック
        this.freezeStackTimer = 0;     // 凍結スタック持続時間
        this.freezeTimer = 0;          // 完全凍結タイマー (2.0s)
        this.confusionTimer = 0;       // キノコの胞子による混乱タイマー
        this.iaidoTimer = 0;           // サムライの居合集中タイマー (1.0s)
        this.iaidoCooldown = 0;        // サムライの居合クールダウン (8.0s)
        this.inIaidoRange = false;     // 居合間合いフラグ
        this.clownSwapTimer = 2.0 + Math.random() * 3.0; // ピエロ位置交換タイマー (5.0sごと)
        this.mimicTargetFaction = null;// ミミックの擬態相手
        this.isBat = false;            // 吸血鬼のコウモリ化中フラグ
        this.batTimer = 0;             // コウモリ化持続タイマー (3.0s)
        this.hasBatEscaped = false;    // コウモリ化使用済みフラグ
        this.catLives = 3;             // 猫の残機 (最大3回蘇生)
        this.stampedeTimer = 3.0 + Math.random() * 4.0; // 牛のスタンピードタイマー (8.0sごと)
        this.isStampeding = false;     // 突進中フラグ
        this.stampedeDuration = 0;     // 突進残り時間
        this.stampedeDir = { x: 0, z: 0 }; // 突進方向
        this.bomberExploded = false;   // 爆弾魔の起爆済みフラグ
    }

    takeDamage(rawDamage, isPure = false) {
        if (!this.alive) return 0;

        // 幽霊のすり抜け中、または吸血鬼のコウモリ化中なら完全無効化 (MISS)
        if ((this.isPhasing || this.isBat) && !isPure) {
            return -1; // -1 は回避/すり抜けを表す
        }

        // ハチの飛行特性: 20%の確率で攻撃を完全回避
        if (this.factionId === 'bee' && !isPure && Math.random() < 0.20) {
            return -1;
        }

        // 防御力・結束カットの計算
        let effectiveDef = this.def;
        if (this.factionId === 'human' && this.humanBondCount > 0) {
            effectiveDef += Math.min(5, Math.round(this.humanBondCount * 0.6));
        }

        // 割合保証付きハイブリッド減算式:
        // どんな高防御相手に対しても、生ダメージの最低25%（最低値2保証）は防御を貫通して通る
        // これによりスライムやゾンビ等の低攻撃力キャラも完全に無力化せず、乱数ブレも機能する
        const minDmg = Math.max(2, Math.round(rawDamage * 0.25));
        let actualDamage = isPure ? rawDamage : Math.max(minDmg, rawDamage - effectiveDef);
        this.hp = Math.max(0, this.hp - actualDamage);

        if (this.hp <= 0) {
            this.alive = false;
        }

        return actualDamage;
    }
}

/**
 * 戦闘シミュレーター本体
 */
export class BattleEngine {
    constructor(arenaRadius = 26) {
        this.arenaRadius = arenaRadius;
        this.units = [];
        this.nextUnitId = 1;
        this.activeFactionIds = [];
        this.isFinished = false;
        this.winnerFactionId = null;
        this.elapsedTime = 0;
        this.events = []; // 毎フレームの描画・音用イベント
    }

    /**
     * ラウンドの初期化
     * @param {Array<string>} selectedFactionIds 指定勢力IDの配列。未指定ならランダム
     * @param {Object} countsOverride 各勢力の人数の指定。未指定なら各勢力の範囲内でランダム
     */
    initRound(selectedFactionIds = null, countsOverride = null) {
        this.units = [];
        this.nextUnitId = 1;
        this.isFinished = false;
        this.winnerFactionId = null;
        this.elapsedTime = 0;
        this.events = [];

        const allFactionKeys = Object.keys(FACTIONS);

        // 勢力が指定されていない場合は2〜5勢力をランダムに選出
        if (!selectedFactionIds || selectedFactionIds.length === 0) {
            const numFactions = 2 + Math.floor(Math.random() * 4); // 2, 3, 4, 5
            const shuffled = [...allFactionKeys].sort(() => 0.5 - Math.random());
            this.activeFactionIds = shuffled.slice(0, numFactions);
        } else {
            this.activeFactionIds = [...selectedFactionIds];
        }

        // 各勢力をアリーナの外周円上に等角度で配置
        const numActive = this.activeFactionIds.length;
        const spawnDistance = this.arenaRadius * 0.72;

        this.activeFactionIds.forEach((facId, index) => {
            const config = FACTIONS[facId];
            let count = 0;

            if (countsOverride && countsOverride[facId] !== undefined) {
                count = countsOverride[facId];
            } else {
                const [minCount, maxCount] = config.spawnRange;
                count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            }

            const baseAngle = (index / numActive) * Math.PI * 2 + (Math.PI / numActive);
            // クラスタの広がり角度（0.40〜0.70rad：密集陣形からやや散開陣形までラウンドごとの個性を演出）
            const clusterSpread = 0.40 + Math.random() * 0.30;

            for (let i = 0; i < count; i++) {
                // 勢力のスポーンエリア内にランダム散布
                const angle = baseAngle + (Math.random() - 0.5) * clusterSpread;
                const dist = spawnDistance * (0.65 + Math.random() * 0.35);
                const x = Math.cos(angle) * dist;
                const z = Math.sin(angle) * dist;

                const unit = new BattleUnit(this.nextUnitId++, facId, x, z);
                // 初期向きは中央付近へ
                unit.facingAngle = Math.atan2(-z, -x);
                this.units.push(unit);
            }
        });

        return {
            factions: this.activeFactionIds,
            counts: this.getFactionCounts()
        };
    }

    /**
     * 1フレームのシミュレーション更新
     * @param {number} dt 経過秒数 (通常 1/60s = 0.0166)
     */
    update(dt) {
        if (this.isFinished) return this.events;

        this.events = [];
        this.elapsedTime += dt;

        const aliveUnits = this.units.filter(u => u.alive);

        // 生存勢力の確認
        const remainingFactions = new Set(aliveUnits.map(u => u.factionId));
        if (remainingFactions.size <= 1) {
            this.isFinished = true;
            this.winnerFactionId = remainingFactions.size === 1 ? [...remainingFactions][0] : null;
            this.events.push({
                type: 'round_end',
                winner: this.winnerFactionId,
                elapsed: this.elapsedTime
            });
            return this.events;
        }

        // 1. 各ユニットの固有アビリティタイマー＆状態更新
        for (const u of aliveUnits) {
            // 毒スリップダメージ処理 (ネズミ・ハチの毒)
            if (u.poisonInstances && u.poisonInstances.length > 0) {
                let poisonDamageTotal = 0;
                for (let i = u.poisonInstances.length - 1; i >= 0; i--) {
                    const p = u.poisonInstances[i];
                    p.duration -= dt;
                    poisonDamageTotal += p.dps * dt;
                    if (p.duration <= 0) {
                        u.poisonInstances.splice(i, 1);
                    }
                }
                if (poisonDamageTotal > 0) {
                    u.hp = Math.max(0, u.hp - poisonDamageTotal);
                    if (u.hp <= 0 && u.alive) {
                        u.alive = false;
                        this.handleUnitDeath(null, u);
                    }
                }
            }

            if (!u.alive) continue;

            // 雪女の凍結タイマー
            if (u.freezeTimer > 0) {
                u.freezeTimer -= dt;
            }
            if (u.freezeStackTimer > 0) {
                u.freezeStackTimer -= dt;
                if (u.freezeStackTimer <= 0) {
                    u.freezeStacks = 0;
                }
            }

            // キノコ胞子による混乱タイマー
            if (u.confusionTimer > 0) {
                u.confusionTimer -= dt;
            }

            // キノコ常時パッシブ: 周囲3m以内の敵を10%の確率で混乱
            if (u.factionId === 'mushroom') {
                for (const other of aliveUnits) {
                    if (other.alive && other.factionId !== 'mushroom' && other.confusionTimer <= 0) {
                        const dx = other.x - u.x;
                        const dz = other.z - u.z;
                        if (dx * dx + dz * dz <= 9.0) { // 半径3m
                            if (Math.random() < 0.10 * dt) { // 毎秒10%
                                other.confusionTimer = 2.0; // 2秒混乱
                                other.targetId = null; // ターゲットリセット
                                this.events.push({
                                    type: 'mushroom_confuse',
                                    unitId: other.id,
                                    x: other.x,
                                    z: other.z
                                });
                            }
                        }
                    }
                }
            }

            // 人間の結束数カウント
            if (u.factionId === 'human') {
                let nearbyAllies = 0;
                for (const other of aliveUnits) {
                    if (other.alive && other.factionId === 'human' && other.id !== u.id) {
                        const dx = other.x - u.x;
                        const dz = other.z - u.z;
                        if (dx * dx + dz * dz < 25) { // 半径5以内
                            nearbyAllies++;
                        }
                    }
                }
                u.humanBondCount = nearbyAllies;
            }

            // ロボの故障復帰タイマー
            if (u.factionId === 'robot') {
                if (u.isGlitching) {
                    u.glitchTimer -= dt;
                    if (u.glitchTimer <= 0) {
                        u.isGlitching = false;
                        this.events.push({ type: 'robot_recover', unitId: u.id });
                    }
                }
            }

            // 幽霊の霊体化サイクル (3.5秒通常、1.8秒すり抜け)
            if (u.factionId === 'ghost') {
                u.phaseTimer += dt;
                if (!u.isPhasing && u.phaseTimer >= 3.5) {
                    u.isPhasing = true;
                    u.phaseTimer = 0;
                    this.events.push({ type: 'ghost_phase_start', unitId: u.id });
                } else if (u.isPhasing && u.phaseTimer >= 1.8) {
                    u.isPhasing = false;
                    u.phaseTimer = 0;
                    this.events.push({ type: 'ghost_phase_end', unitId: u.id });
                }
            }

            // 忍者のピンチ時空蝉（HP50%以下で1度だけ敵の背後へワープ）
            if (u.factionId === 'ninja' && !u.hasTeleported && u.hp < u.maxHp * 0.5) {
                const target = this.findNearestEnemy(u, aliveUnits);
                if (target) {
                    u.hasTeleported = true;
                    const warpAngle = target.facingAngle + Math.PI; // 敵の背後
                    const warpDist = 1.8;
                    const oldX = u.x;
                    const oldZ = u.z;
                    u.x = target.x + Math.cos(warpAngle) * warpDist;
                    u.z = target.z + Math.sin(warpAngle) * warpDist;
                    u.facingAngle = Math.atan2(target.z - u.z, target.x - u.x);
                    this.events.push({
                        type: 'ninja_teleport',
                        unitId: u.id,
                        from: { x: oldX, z: oldZ },
                        to: { x: u.x, z: u.z }
                    });
                }
            }

            // サムライの居合クールダウン
            if (u.factionId === 'samurai') {
                if (u.iaidoCooldown > 0) {
                    u.iaidoCooldown -= dt;
                }
            }

            // ピエロの入れ替わり (5秒ごとに敵1体と位置交換)
            if (u.factionId === 'clown') {
                u.clownSwapTimer -= dt;
                if (u.clownSwapTimer <= 0) {
                    u.clownSwapTimer = 5.0;
                    const enemies = aliveUnits.filter(e => e.factionId !== 'clown');
                    if (enemies.length > 0) {
                        const target = enemies[Math.floor(Math.random() * enemies.length)];
                        const tempX = u.x;
                        const tempZ = u.z;
                        u.x = target.x;
                        u.z = target.z;
                        target.x = tempX;
                        target.z = tempZ;
                        this.events.push({
                            type: 'clown_swap',
                            clownId: u.id,
                            targetId: target.id,
                            clownPos: { x: u.x, z: u.z },
                            targetPos: { x: target.x, z: target.z }
                        });
                    }
                }
            }

            // 吸血鬼のピンチ時コウモリ化 (HP30%以下で3秒無敵逃亡)
            if (u.factionId === 'vampire' && !u.hasBatEscaped && u.hp <= u.maxHp * 0.3) {
                u.hasBatEscaped = true;
                u.isBat = true;
                u.batTimer = 3.0;
                this.events.push({
                    type: 'vampire_bat_start',
                    unitId: u.id,
                    x: u.x,
                    z: u.z
                });
            }
            if (u.isBat) {
                u.batTimer -= dt;
                if (u.batTimer <= 0) {
                    u.isBat = false;
                    this.events.push({
                        type: 'vampire_bat_end',
                        unitId: u.id,
                        x: u.x,
                        z: u.z
                    });
                }
            }

            // 爆弾魔のHP30%以下大自爆
            if (u.factionId === 'bomber' && !u.bomberExploded && u.hp <= u.maxHp * 0.3) {
                this.triggerBomberExplosion(u, aliveUnits);
                continue;
            }

            // 牛のスタンピード突進タイマー
            if (u.factionId === 'cattle') {
                if (u.isStampeding) {
                    u.stampedeDuration -= dt;
                    if (u.stampedeDuration <= 0) {
                        u.isStampeding = false;
                        u.stampedeTimer = 8.0;
                    }
                } else {
                    u.stampedeTimer -= dt;
                    if (u.stampedeTimer <= 0) {
                        u.isStampeding = true;
                        u.stampedeDuration = 1.8; // 1.8秒間突進
                        const enemy = this.findNearestEnemy(u, aliveUnits);
                        if (enemy) {
                            const angle = Math.atan2(enemy.z - u.z, enemy.x - u.x);
                            u.stampedeDir = { x: Math.cos(angle), z: Math.sin(angle) };
                            u.facingAngle = angle;
                        } else {
                            u.stampedeDir = { x: Math.cos(u.facingAngle), z: Math.sin(u.facingAngle) };
                        }
                        this.events.push({
                            type: 'cattle_stampede',
                            unitId: u.id,
                            x: u.x,
                            z: u.z
                        });
                    }
                }
            }
        }

        // 2. 索敵・移動・攻撃処理
        for (const u of aliveUnits) {
            if (!u.alive) continue;
            if (u.isGlitching) continue; // ロボ故障停止中
            if (u.freezeTimer > 0) continue; // 完全凍結停止中

            // 吸血鬼のコウモリ化中: 最も近い敵から高速で逃げ回る (速度 7.0)
            if (u.isBat) {
                const nearestEnemy = this.findNearestEnemy(u, aliveUnits);
                if (nearestEnemy) {
                    const dx = u.x - nearestEnemy.x;
                    const dz = u.z - nearestEnemy.z;
                    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
                    u.vx = (dx / dist) * 7.0;
                    u.vz = (dz / dist) * 7.0;
                    u.facingAngle = Math.atan2(u.vz, u.vx);
                    u.x += u.vx * dt;
                    u.z += u.vz * dt;
                }
                continue;
            }

            // 牛のスタンピード突進移動 (速度 7.0、接触した敵を弾き飛ばし20ダメージ)
            if (u.isStampeding) {
                const speed = 7.0;
                u.x += u.stampedeDir.x * speed * dt;
                u.z += u.stampedeDir.z * speed * dt;

                // 経路上の敵に衝突判定
                for (const other of aliveUnits) {
                    if (other.alive && other.factionId !== 'cattle' && other.id !== u.id) {
                        const dx = other.x - u.x;
                        const dz = other.z - u.z;
                        const distSq = dx * dx + dz * dz;
                        if (distSq < 2.0 * 2.0) { // 接触
                            const knockAngle = Math.atan2(dz, dx);
                            other.x += Math.cos(knockAngle) * 1.5;
                            other.z += Math.sin(knockAngle) * 1.5;
                            this.applyDamage(u, other, 20, false);
                            this.events.push({
                                type: 'cattle_hit',
                                cattleId: u.id,
                                targetId: other.id,
                                x: other.x,
                                z: other.z
                            });
                        }
                    }
                }
                continue;
            }

            // クールダウン更新
            u.atkTimer -= dt;

            // ターゲット探索（混乱中は味方をターゲットに）
            let target = null;
            if (u.confusionTimer > 0) {
                // 混乱中: 最も近い味方を狙う
                target = this.findNearestAlly(u, aliveUnits);
            } else {
                if (u.targetId) {
                    target = aliveUnits.find(other => other.id === u.targetId && other.alive && other.factionId !== u.factionId);
                }
                if (!target) {
                    target = this.findNearestEnemy(u, aliveUnits);
                    u.targetId = target ? target.id : null;
                }
            }

            if (!target) continue;

            const dx = target.x - u.x;
            const dz = target.z - u.z;
            const dist = Math.sqrt(dx * dx + dz * dz) || 0.001;

            // 向きをターゲットに向ける
            u.facingAngle = Math.atan2(dz, dx);

            // サムライの居合間合いチャージ判定
            if (u.factionId === 'samurai' && u.iaidoCooldown <= 0) {
                if (dist <= u.range + target.radius + 0.5) {
                    u.iaidoTimer += dt;
                } else {
                    u.iaidoTimer = Math.max(0, u.iaidoTimer - dt * 0.5);
                }
            }

            // 射程内か判定
            if (dist <= u.range + target.radius) {
                // 攻撃可能かつクールダウン終了
                if (u.atkTimer <= 0) {
                    this.performAttack(u, target, aliveUnits);
                    u.atkTimer = u.atkCooldownMax * (0.9 + Math.random() * 0.2); // 微小な揺らぎ
                }
            } else {
                // ターゲットに向かって接近移動 (雪女の凍結スタックで-40%)
                let effectiveSpeed = u.spd;
                if (u.freezeStacks > 0) {
                    effectiveSpeed *= 0.60; // 40%減速
                }

                u.vx = (dx / dist) * effectiveSpeed;
                u.vz = (dz / dist) * effectiveSpeed;

                u.x += u.vx * dt;
                u.z += u.vz * dt;
            }
        }

        // 3. ユニット同士の簡易衝突・押し合い（円と円の反発判定）
        for (let i = 0; i < aliveUnits.length; i++) {
            const u1 = aliveUnits[i];
            if (u1.isPhasing) continue; // 幽霊すり抜け中は衝突無視

            for (let j = i + 1; j < aliveUnits.length; j++) {
                const u2 = aliveUnits[j];
                if (u2.isPhasing) continue;

                const dx = u2.x - u1.x;
                const dz = u2.z - u1.z;
                const minDist = u1.radius + u2.radius;
                const distSq = dx * dx + dz * dz;

                if (distSq < minDist * minDist && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const nz = dz / dist;

                    // ドラゴンなどの大型キャラは押し出されにくい
                    const totalWeight = (u1.scale + u2.scale);
                    const w1 = u2.scale / totalWeight;
                    const w2 = u1.scale / totalWeight;

                    u1.x -= nx * overlap * w1 * 0.5;
                    u1.z -= nz * overlap * w1 * 0.5;
                    u2.x += nx * overlap * w2 * 0.5;
                    u2.z += nz * overlap * w2 * 0.5;
                }
            }
        }

        // 4. アリーナ円形境界の制限（押し戻し）
        for (const u of aliveUnits) {
            const distFromCenter = Math.sqrt(u.x * u.x + u.z * u.z);
            const maxAllowed = this.arenaRadius - u.radius;
            if (distFromCenter > maxAllowed) {
                const angle = Math.atan2(u.z, u.x);
                u.x = Math.cos(angle) * maxAllowed;
                u.z = Math.sin(angle) * maxAllowed;
            }
        }

        return this.events;
    }

    /**
     * 最も近い敵ユニットを探索
     */
    findNearestEnemy(unit, aliveUnits) {
        let nearest = null;
        let minSq = Infinity;

        for (const other of aliveUnits) {
            if (other.factionId === unit.factionId || !other.alive) continue;
            const dx = other.x - unit.x;
            const dz = other.z - unit.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < minSq) {
                minSq = distSq;
                nearest = other;
            }
        }
        return nearest;
    }

    /**
     * 最も近い味方ユニットを探索 (混乱時用)
     */
    findNearestAlly(unit, aliveUnits) {
        let nearest = null;
        let minSq = Infinity;

        for (const other of aliveUnits) {
            if (other.factionId !== unit.factionId || !other.alive || other.id === unit.id) continue;
            const dx = other.x - unit.x;
            const dz = other.z - unit.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < minSq) {
                minSq = distSq;
                nearest = other;
            }
        }
        return nearest;
    }

    /**
     * 爆弾魔の無差別大自爆 (半径3m、60純粋ダメージ)
     */
    triggerBomberExplosion(bomber, aliveUnits) {
        if (bomber.bomberExploded) return;
        bomber.bomberExploded = true;
        bomber.alive = false;
        bomber.hp = 0;

        this.events.push({
            type: 'bomber_explode',
            unitId: bomber.id,
            x: bomber.x,
            z: bomber.z,
            radius: 3.0
        });

        // 半径3m以内の敵・味方全員に60純粋ダメージ
        for (const other of aliveUnits) {
            if (!other.alive || other.id === bomber.id) continue;
            const dx = other.x - bomber.x;
            const dz = other.z - bomber.z;
            if (dx * dx + dz * dz <= 3.0 * 3.0) {
                this.applyDamage(bomber, other, 60, true);
            }
        }

        this.handleUnitDeath(null, bomber);
    }

    /**
     * 攻撃実行処理
     */
    performAttack(attacker, primaryTarget, aliveUnits) {
        // ドラゴンの特殊攻撃: 前方扇状の火炎ブレス（範囲攻撃）
        if (attacker.factionId === 'dragon') {
            this.events.push({
                type: 'dragon_breath',
                attackerId: attacker.id,
                origin: { x: attacker.x, z: attacker.z },
                angle: attacker.facingAngle,
                range: attacker.range + 1.2
            });

            const breathRange = attacker.range + 1.2;
            const breathAngleSpread = 0.85; // 約50度

            const hitTargets = [];
            for (const other of aliveUnits) {
                if (other.factionId === attacker.factionId || !other.alive) continue;
                const dx = other.x - attacker.x;
                const dz = other.z - attacker.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist <= breathRange) {
                    const targetAngle = Math.atan2(dz, dx);
                    let angleDiff = Math.abs(targetAngle - attacker.facingAngle);
                    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

                    if (angleDiff <= breathAngleSpread * 0.5) {
                        hitTargets.push(other);
                    }
                }
            }

            const targetCount = hitTargets.length;
            const spreadFactor = targetCount >= 4 ? 0.70 : (targetCount === 3 ? 0.80 : (targetCount === 2 ? 0.90 : 1.0));

            for (const other of hitTargets) {
                const rawDmg = attacker.atk * (0.8 + Math.random() * 0.4) * spreadFactor;
                this.applyDamage(attacker, other, Math.max(1, Math.round(rawDmg)), false);
            }
            return;
        }

        // 巨人の特殊攻撃: 踏みつけ (足元HP50以下小型即死＋周囲範囲打撃)
        if (attacker.factionId === 'giant') {
            this.events.push({
                type: 'giant_stomp',
                attackerId: attacker.id,
                x: attacker.x,
                z: attacker.z,
                radius: 3.5
            });

            for (const other of aliveUnits) {
                if (other.factionId === attacker.factionId || !other.alive) continue;
                const dx = other.x - attacker.x;
                const dz = other.z - attacker.z;
                if (dx * dx + dz * dz <= 3.5 * 3.5) {
                    if (other.hp <= 50) {
                        // 足元の小型ユニット即死
                        this.applyDamage(attacker, other, other.hp + 10, true);
                    } else {
                        // 通常範囲ダメージ
                        const rawDmg = attacker.atk * (0.85 + Math.random() * 0.3);
                        this.applyDamage(attacker, other, Math.max(1, Math.round(rawDmg)), false);
                    }
                }
            }
            return;
        }

        // 雷獣の特殊攻撃: 連鎖雷 (100% -> 60% -> 30%)
        if (attacker.factionId === 'raiju') {
            const targets = [primaryTarget];

            // 第2ターゲット探索 (primaryTargetの周囲3.5m以内)
            let secondTarget = null;
            let secondMinSq = Infinity;
            for (const other of aliveUnits) {
                if (other.factionId === attacker.factionId || !other.alive || other.id === primaryTarget.id) continue;
                const dx = other.x - primaryTarget.x;
                const dz = other.z - primaryTarget.z;
                const dSq = dx * dx + dz * dz;
                if (dSq <= 3.5 * 3.5 && dSq < secondMinSq) {
                    secondMinSq = dSq;
                    secondTarget = other;
                }
            }
            if (secondTarget) targets.push(secondTarget);

            // 第3ターゲット探索 (secondTargetの周囲3.5m以内)
            if (secondTarget) {
                let thirdTarget = null;
                let thirdMinSq = Infinity;
                for (const other of aliveUnits) {
                    if (other.factionId === attacker.factionId || !other.alive || targets.some(t => t.id === other.id)) continue;
                    const dx = other.x - secondTarget.x;
                    const dz = other.z - secondTarget.z;
                    const dSq = dx * dx + dz * dz;
                    if (dSq <= 3.5 * 3.5 && dSq < thirdMinSq) {
                        thirdMinSq = dSq;
                        thirdTarget = other;
                    }
                }
                if (thirdTarget) targets.push(thirdTarget);
            }

            this.events.push({
                type: 'raiju_lightning',
                attackerId: attacker.id,
                targetIds: targets.map(t => t.id),
                points: targets.map(t => ({ x: t.x, z: t.z }))
            });

            const multipliers = [1.0, 0.6, 0.3];
            targets.forEach((tgt, idx) => {
                const dmg = Math.max(1, Math.round(attacker.atk * multipliers[idx] * (0.9 + Math.random() * 0.2)));
                this.applyDamage(attacker, tgt, dmg, false);
            });
            return;
        }

        // ロボの攻撃時故障判定 (15%の確率でショート停止)
        if (attacker.factionId === 'robot') {
            if (Math.random() < 0.15) {
                attacker.isGlitching = true;
                attacker.glitchTimer = 2.2; // 2.2秒停止
                this.events.push({
                    type: 'robot_glitch',
                    unitId: attacker.id,
                    x: attacker.x,
                    z: attacker.z
                });
                return;
            }
        }

        // ミミックの初接触擬態コピー
        if (attacker.factionId === 'mimic' && !attacker.mimicTargetFaction) {
            attacker.mimicTargetFaction = primaryTarget.factionId;
            attacker.atk += Math.round(primaryTarget.baseConfig.atk * 0.3);
            attacker.def += Math.round(primaryTarget.baseConfig.def * 0.3);
            this.events.push({
                type: 'mimic_copy',
                unitId: attacker.id,
                copiedFaction: primaryTarget.factionId,
                x: attacker.x,
                z: attacker.z
            });
        }

        // 通常・単体攻撃
        let damage = attacker.atk;

        // サムライの居合判定 (1秒集中完了なら3倍ダメージ)
        let isIaido = false;
        if (attacker.factionId === 'samurai' && attacker.iaidoTimer >= 1.0 && attacker.iaidoCooldown <= 0) {
            damage *= 3.0;
            attacker.iaidoTimer = 0;
            attacker.iaidoCooldown = 8.0;
            isIaido = true;
            this.events.push({
                type: 'samurai_iaido',
                attackerId: attacker.id,
                targetId: primaryTarget.id,
                x: attacker.x,
                z: attacker.z
            });
        }

        // 死神の刈り取り判定 (標的HP20%以下で即死)
        let isReap = false;
        if (attacker.factionId === 'reaper' && primaryTarget.hp <= primaryTarget.maxHp * 0.20) {
            isReap = true;
            this.events.push({
                type: 'reaper_reap',
                attackerId: attacker.id,
                targetId: primaryTarget.id,
                x: primaryTarget.x,
                z: primaryTarget.z
            });
            this.applyDamage(attacker, primaryTarget, primaryTarget.hp + 50, true);
            return;
        }

        // 人間の結束攻撃力ボーナス (最大+8)
        if (attacker.factionId === 'human' && attacker.humanBondCount > 0) {
            damage += Math.min(8, Math.round(attacker.humanBondCount * 0.8));
        }

        // 忍者の手裏剣攻撃
        const isRanged = attacker.factionId === 'ninja' || attacker.factionId === 'yukionna';
        this.events.push({
            type: isRanged ? 'ranged_attack' : (isIaido ? 'samurai_slash' : 'melee_attack'),
            attackerId: attacker.id,
            targetId: primaryTarget.id,
            from: { x: attacker.x, z: attacker.z },
            to: { x: primaryTarget.x, z: primaryTarget.z }
        });

        // ダメージ適用
        const dmgVariation = (Math.random() * 0.3 - 0.15); // +-15%
        const finalRawDamage = Math.max(1, Math.round(damage * (1 + dmgVariation)));
        const dealt = this.applyDamage(attacker, primaryTarget, finalRawDamage, false);

        // 吸血鬼の吸血回復 (与ダメの50%回復)
        if (attacker.factionId === 'vampire' && dealt > 0) {
            const heal = Math.round(dealt * 0.5);
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
            this.events.push({
                type: 'vampire_drain',
                attackerId: attacker.id,
                healAmount: heal,
                x: attacker.x,
                z: attacker.z
            });
        }

        // ネズミの疫病毒付与 (毎秒2ダメ×4秒、重ねがけ可)
        if (attacker.factionId === 'rat') {
            primaryTarget.poisonInstances.push({ dps: 2, duration: 4.0 });
            this.events.push({
                type: 'rat_bite',
                targetId: primaryTarget.id,
                x: primaryTarget.x,
                z: primaryTarget.z
            });
        }

        // ハチの毒針攻撃 (自身は死亡し、敵に毎秒5ダメ×4秒の強毒付与)
        if (attacker.factionId === 'bee') {
            primaryTarget.poisonInstances.push({ dps: 5, duration: 4.0 });
            this.events.push({
                type: 'bee_sting',
                attackerId: attacker.id,
                targetId: primaryTarget.id,
                x: primaryTarget.x,
                z: primaryTarget.z
            });
            // 刺すと自身は散る
            attacker.hp = 0;
            attacker.alive = false;
            this.handleUnitDeath(null, attacker);
        }

        // 雪女の凍結スタック付与 (速度-40%、3スタックで2秒完全凍結)
        if (attacker.factionId === 'yukionna') {
            primaryTarget.freezeStacks++;
            primaryTarget.freezeStackTimer = 4.0;
            if (primaryTarget.freezeStacks >= 3) {
                primaryTarget.freezeTimer = 2.0;
                primaryTarget.freezeStacks = 0;
                this.events.push({
                    type: 'yukionna_frozen',
                    targetId: primaryTarget.id,
                    x: primaryTarget.x,
                    z: primaryTarget.z
                });
            } else {
                this.events.push({
                    type: 'yukionna_chill',
                    targetId: primaryTarget.id,
                    x: primaryTarget.x,
                    z: primaryTarget.z
                });
            }
        }
    }

    /**
     * ダメージ適用と死亡・特殊召喚
     */
    applyDamage(attacker, target, rawDamage, isPure = false) {
        const actualDmg = target.takeDamage(rawDamage, isPure);

        if (actualDmg === -1) {
            // 回避・すり抜け
            this.events.push({
                type: 'evade',
                targetId: target.id,
                x: target.x,
                z: target.z
            });
            return 0;
        }

        if (attacker) {
            attacker.damageDealt += actualDmg;
        }

        this.events.push({
            type: 'hit',
            targetId: target.id,
            damage: actualDmg,
            remainingHp: target.hp,
            maxHp: target.maxHp,
            x: target.x,
            z: target.z
        });

        // 死亡時判定
        if (!target.alive) {
            if (attacker) attacker.kills++;
            this.handleUnitDeath(attacker, target);
        }

        return actualDmg;
    }

    /**
     * ユニット死亡処理
     */
    handleUnitDeath(killer, victim) {
        // 猫の【九つの命】: 残機があればHP30%で即座に復活、ATK-10%
        if (victim.factionId === 'cat' && victim.catLives > 0) {
            victim.catLives--;
            victim.alive = true;
            victim.hp = Math.round(victim.maxHp * 0.30);
            victim.atk = Math.round(victim.atk * 0.90);
            this.events.push({
                type: 'cat_revive',
                unitId: victim.id,
                livesLeft: victim.catLives,
                hp: victim.hp,
                x: victim.x,
                z: victim.z
            });
            return;
        }

        // 死神のキル毎速度上昇 (撃破で速度+0.5m/s恒久UP)
        if (killer && killer.factionId === 'reaper') {
            killer.spd += 0.5;
            this.events.push({
                type: 'reaper_speedup',
                reaperId: killer.id,
                newSpeed: killer.spd
            });
        }

        // 爆弾魔の死亡時自爆発火
        if (victim.factionId === 'bomber' && !victim.bomberExploded) {
            this.triggerBomberExplosion(victim, this.units.filter(u => u.alive));
            return;
        }

        this.events.push({
            type: 'death',
            unitId: victim.id,
            factionId: victim.factionId,
            killerId: killer ? killer.id : null,
            x: victim.x,
            z: victim.z
        });

        // 1. ゾンビの感染能力 (キラーがゾンビの場合、倒された敵がゾンビとして復活)
        if (killer && killer.factionId === 'zombie' && victim.factionId !== 'zombie') {
            const newZombie = new BattleUnit(this.nextUnitId++, 'zombie', victim.x, victim.z);
            newZombie.hp = Math.round(newZombie.maxHp * 0.7); // 70%HPで復活
            this.units.push(newZombie);
            this.events.push({
                type: 'zombie_infect',
                newUnitId: newZombie.id,
                x: newZombie.x,
                z: newZombie.z
            });
            return;
        }

        // 2. スライムの分裂能力 (親スライムが死ぬとミニスライム2体に分裂)
        if (victim.factionId === 'slime' && !victim.isChild) {
            for (let i = 0; i < 2; i++) {
                const angle = (i * Math.PI) + Math.random() * 0.5;
                const offset = 0.6;
                const child = new BattleUnit(
                    this.nextUnitId++,
                    'slime',
                    victim.x + Math.cos(angle) * offset,
                    victim.z + Math.sin(angle) * offset,
                    true
                );
                this.units.push(child);
                this.events.push({
                    type: 'slime_split',
                    newUnitId: child.id,
                    x: child.x,
                    z: child.z
                });
            }
        }

        // 3. ゴーレムの小岩崩落分裂能力 (死亡時に小岩3体に分裂)
        if (victim.factionId === 'golem' && !victim.isChild) {
            for (let i = 0; i < 3; i++) {
                const angle = (i * (Math.PI * 2 / 3)) + Math.random() * 0.4;
                const offset = 0.8;
                const pebble = new BattleUnit(
                    this.nextUnitId++,
                    'golem',
                    victim.x + Math.cos(angle) * offset,
                    victim.z + Math.sin(angle) * offset,
                    true
                );
                pebble.maxHp = 100;
                pebble.hp = 100;
                pebble.atk = 12;
                pebble.def = 6;
                pebble.scale = 0.8;
                pebble.radius = 0.65;
                this.units.push(pebble);
                this.events.push({
                    type: 'golem_split',
                    newUnitId: pebble.id,
                    x: pebble.x,
                    z: pebble.z
                });
            }
        }

        // 4. キノコの死後胞子雲
        if (victim.factionId === 'mushroom') {
            this.events.push({
                type: 'mushroom_cloud',
                x: victim.x,
                z: victim.z,
                radius: 3.0
            });
            // 周囲の敵に即時混乱と胞子ダメージ
            const alive = this.units.filter(u => u.alive && u.factionId !== 'mushroom');
            for (const other of alive) {
                const dx = other.x - victim.x;
                const dz = other.z - victim.z;
                if (dx * dx + dz * dz <= 9.0) {
                    other.confusionTimer = 2.5;
                    this.applyDamage(null, other, 10, false);
                }
            }
        }
    }

    /**
     * 各勢力の生存数を取得
     */
    getFactionCounts() {
        const counts = {};
        for (const fId of this.activeFactionIds) {
            counts[fId] = 0;
        }
        for (const u of this.units) {
            if (u.alive) {
                counts[u.factionId] = (counts[u.factionId] || 0) + 1;
            }
        }
        return counts;
    }

    /**
     * 各勢力のHP合計と最大HP合計
     */
    getFactionHpTotals() {
        const result = {};
        for (const fId of this.activeFactionIds) {
            result[fId] = { current: 0, max: 0 };
        }
        for (const u of this.units) {
            if (result[u.factionId]) {
                result[u.factionId].max += u.maxHp;
                if (u.alive) {
                    result[u.factionId].current += u.hp;
                }
            }
        }
        return result;
    }

    /**
     * MVP・リーダーボード集計
     */
    getLeaderboard() {
        const sorted = [...this.units].sort((a, b) => {
            if (b.kills !== a.kills) return b.kills - a.kills;
            return b.damageDealt - a.damageDealt;
        });
        return sorted.slice(0, 5);
    }

    /**
     * 高速裏計算シミュレーション (描画なしで決着まで回す。将来のオッズ計算用)
     * @param {number} maxTicks 最大ステップ数
     */
    runHeadlessFast(maxTicks = 3000) {
        const dt = 1 / 30; // 30FPS刻みで高速計算
        let ticks = 0;
        while (!this.isFinished && ticks < maxTicks) {
            this.update(dt);
            ticks++;
        }
        return {
            winner: this.winnerFactionId,
            elapsed: this.elapsedTime,
            ticks: ticks
        };
    }
}

/**
 * 構成に応じたオッズの事前高速シミュレーション計算
 * @param {Array<string>} factions 参加勢力IDリスト
 * @param {Object} counts 各勢力の出撃人数
 * @param {number} runs シミュレーション回数 (デフォルト80回で約0.3秒)
 */
export function calculateOdds(factions, counts, runs = 80) {
    const simEngine = new BattleEngine(26);
    const winCounts = {};
    for (const f of factions) {
        winCounts[f] = 0;
    }

    for (let i = 0; i < runs; i++) {
        simEngine.initRound(factions, counts);
        const res = simEngine.runHeadlessFast(2000);
        if (res.winner && winCounts[res.winner] !== undefined) {
            winCounts[res.winner]++;
        }
    }

    const odds = {};
    const winRates = {};

    for (const f of factions) {
        const wins = winCounts[f];
        const winRate = wins / runs;
        winRates[f] = winRate;

        if (winRate <= 0.01) {
            odds[f] = 45.0; // 勝率ほぼ0%の大穴
        } else {
            // 還元率90%ベースのオッズ計算
            const calculated = (1 / winRate) * 0.90;
            // 最小1.15倍、最大99.0倍
            odds[f] = Math.max(1.15, Math.min(99.0, Math.round(calculated * 10) / 10));
        }
    }

    return { odds, winRates, winCounts, runs };
}
