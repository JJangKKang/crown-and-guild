// 왕관과 길드 (Crown & Guild) — 게임 엔진
// DOM·SillyTavern에 의존하지 않는 순수 로직. index.js에서 불러 씁니다.

/* ───────────────────────── 기본 데이터 ───────────────────────── */

export const STATS = ['근력', '민첩', '체력', '지능', '정신', '감각', '매력', '행운'];

export const STAT_DESC = {
    근력: '무기 위력, 짐 나르기, 힘겨루기',
    민첩: '회피, 명중, 은신, 손재주',
    체력: '최대 HP, 버티기, 독·질병 저항',
    지능: '최대 MP, 마법, 지식, 감정',
    감각: '지각, 추적, 함정·거짓말 간파',
    매력: '협상, 흥정, 설득, 사교계, 연애',
    정신: '의지력, 공포·유혹·정신 마법 저항, 최대 MP 일부',
    행운: '대성공·대실패 확률, 우연과 발견, 좋은 의뢰를 만날 운',
};

const STAT_ALIAS = {
    근력: '근력', 힘: '근력', 완력: '근력',
    행운: '행운', 운: '행운', 럭: '행운',
    정신: '정신', 정신력: '정신', 의지: '정신', 의지력: '정신', 담력: '정신',
    민첩: '민첩', 민첩성: '민첩', 재주: '민첩', 손재주: '민첩',
    체력: '체력', 건강: '체력', 지구력: '체력',
    지능: '지능', 지성: '지능', 지혜: '지능', 학식: '지능', 마력: '지능',
    감각: '감각', 지각: '감각', 직감: '감각', 관찰: '감각', 통찰: '감각',
    매력: '매력', 화술: '매력', 카리스마: '매력', 교섭: '매력', 언변: '매력',
};

export function normStat(s) {
    return STAT_ALIAS[String(s || '').replace(/\s/g, '')] || null;
}

export const DIFFICULTY = {
    easy: {
        label: '쉬움', sub: '라노벨 이세계풍',
        desc: '가볍고 경쾌한 성장물. 세계가 주인공에게 우호적이고, 실패해도 다음 기회가 있습니다. 죽지 않습니다.',
        points: 24, rollBonus: 2, meritMult: 0.7, expMult: 0.7, moneyMult: 2, lvPoints: 7, noCritFail: true,
        perks: { transferred: 2, reincarnated: 1, native: 0 },
    },
    normal: {
        label: '보통', sub: '게임 같은 시스템 · 진지한 정치',
        desc: '등급·공적 같은 시스템은 명확하지만, 귀족 정치와 상권 다툼은 진지합니다. 실패하면 돈·부상·평판을 잃습니다.',
        points: 16, rollBonus: 0, meritMult: 1, expMult: 1, moneyMult: 1, lvPoints: 5, noCritFail: false,
        perks: { transferred: 1, reincarnated: 1, native: 0 },
    },
    hard: {
        label: '어려움', sub: '정통 판타지',
        desc: '무겁고 사실적인 중세. 신분의 벽이 두껍고, 몬스터는 치명적이며, 돈은 늘 빠듯합니다. 죽을 수 있습니다. 대신 반역으로 황위를 노리는 길이 열려 있습니다.',
        points: 11, rollBonus: -1, meritMult: 1.4, expMult: 1.3, moneyMult: 0.5, lvPoints: 5, noCritFail: false,
        perks: { transferred: 0, reincarnated: 0, native: 0 },
    },
};

export const DIFF_TONE = {
    easy: [
        '난이도 쉬움 — 라노벨 이세계풍. 문체는 가볍고 경쾌하며 유머가 있다.',
        '세계는 대체로 {{user}}에게 우호적이다. 노력과 재치는 빠르게 보상받고, 성장이 눈에 띄게 체감된다.',
        '악역 귀족·라이벌도 어딘가 허술하거나 코믹하다. 위기는 짜릿하지만 결국 해볼 만하다.',
        '{{user}}는 죽지 않는다. HP가 0이 되면 기절하고, 누군가에게 구조되거나 길드 의무실에서 깨어난다(돈이나 체면을 조금 잃는다).',
        '보상은 후하게(기준표의 상단), 승급·인정도 빠른 편이다.',
        '황위 찬탈은 이 이야기의 결이 아니다. 반역을 꾸미면 금방 들통나 크게 혼쭐이 나고 끝난다(죽지는 않는다). {{user}}는 결코 황제가 될 수 없다.',
    ],
    normal: [
        '난이도 보통 — 게임처럼 명확한 시스템(등급·공적·의뢰)과 진지한 정치·상권 다툼이 공존한다.',
        'NPC는 자기 이익대로 움직인다. 호의는 쌓아야 하고, 귀족은 정중하되 계산적이다.',
        '실패에는 대가가 따른다: 돈, 부상, 평판, 기회 상실. 무모한 행동을 반복하면 죽을 수 있다(HP 0 = 빈사, 즉시 구조되지 않으면 위험).',
        '보상은 기준표대로. 큰 도약(승급·서임·상회 설립)은 반드시 시험이나 사건을 거친다.',
        '황위 찬탈은 불가능하다. 반역을 꾸미면 반드시 발각되거나 현실의 벽에 막혀 실패하고, 반역죄로 쫓기게 된다. {{user}}는 결코 황제가 될 수 없다.',
    ],
    hard: [
        '난이도 어려움 — 정통 판타지. 문체는 무겁고 사실적이며, 중세의 냄새와 질감이 난다.',
        '신분의 벽이 두껍다. 평민은 귀족 앞에서 고개를 숙여야 하고, 무례는 처벌로 이어진다. 출신·말투·옷차림으로 사람을 판단한다.',
        '몬스터는 치명적이다. 하위 등급 마물도 무리 지으면 사람을 죽인다. 부상은 오래 가고, 치료비는 비싸다.',
        '돈은 늘 빠듯하다. 여관비·장비 수리·세금·길드 회비가 계속 나간다. 사기·배신·착취가 흔하다.',
        '{{user}}는 죽을 수 있다. HP 0은 빈사 상태이며, 운이나 동료가 없으면 사망한다. 사망하면 서사를 비극적으로 마무리한다.',
        '보상은 기준표의 하단. 신뢰와 명성은 아주 천천히 쌓이고, 한 번의 실수로 무너질 수 있다.',
        '찬탈 루트가 열려 있다: 황제와 황족 전원(황제·황태자·황녀)을 제거하고 반역에 성공하면 새 황제가 될 수 있다. 군사력·귀족·교회·민심을 손에 넣는 긴 음모가 필요하며, 한 번이라도 발각되면 일족 몰살과 공개 처형이다. 성공해 즉위하면 <변동>에 "신분 황제".',
    ],
};

export const ORGS = {
    adventurer: { name: '모험가 길드', ranks: ['F등급', 'E등급', 'D등급', 'C등급', 'B등급', 'A등급', 'S등급'], aliases: ['모험가길드', '모험가', '길드'] },
    merchant: { name: '상인 길드', ranks: ['행상인', '노점상', '점포주', '상회주', '대상인', '길드 간부', '길드장'], aliases: ['상인길드', '상인'] },
    knight: { name: '황실 기사단', ranks: ['종자', '준기사', '정기사', '소대장', '중대장', '부단장', '기사단장'], aliases: ['황실기사단', '제국기사단', '왕립기사단', '기사단', '기사'] },
    mage: { name: '청람의 탑', ranks: ['견습 마도사', '3급 마도사', '2급 마도사', '1급 마도사', '상급 마도사', '대마도사', '탑주'], aliases: ['청람의탑', '마탑', '마법사탑', '마도사', '마법사'] },
    artisan: { name: '장인 길드', ranks: ['견습공', '직인', '숙련 직인', '장인', '명장', '거장', '길드 마스터'], aliases: ['장인길드', '장인', '공방'] },
    church: { name: '빛의 성교회', ranks: ['수습 신관', '신관', '사제', '주임 사제', '주교', '대주교', '성자·성녀'], aliases: ['빛의성교회', '성교회', '교회', '신전', '성당'] },
    shadow: { name: '그림자 길드', ranks: ['심부름꾼', '좀도둑', '정보원', '조직원', '간부', '두목', '그림자 군주'], aliases: ['그림자길드', '도적길드', '뒷세계', '그림자'] },
};

export const MERIT_TABLE = [0, 100, 300, 700, 1500, 3000, 6000];

export const NOBLE = ['떠돌이', '평민', '제도 시민', '기사작', '남작', '자작', '백작', '후작', '공작', '황족', '황제'];
export const NOBLE_ROYAL = 9;   // 황족: 황태자·황녀와의 혼인으로만
export const NOBLE_EMPEROR = 10; // 황제: 어려움 난이도의 찬탈로만

export const SLOTS = { 무기: 'weapon', 방어구: 'armor', 갑옷: 'armor', 옷: 'armor', 장신구: 'accessory', 액세서리: 'accessory', 방패: 'offhand', 보조: 'offhand' };
export const SLOT_LABEL = { weapon: '무기', armor: '방어구', offhand: '보조', accessory: '장신구' };

export const DC_WORDS = { 쉬움: 8, 보통: 12, 어려움: 15, '매우어려움': 18, 영웅적: 22, 전설적: 25 };

/* ───────────────────────── 캐릭터 생성 데이터 ───────────────────────── */

export const RACES = {
    인간: { desc: '가장 흔한 종족. 어디서든 무난하게 받아들여진다.', bonus: {}, free: 2 },
    엘프: { desc: '장수하는 숲의 종족. 마력과 감각이 예민하다. 제도에선 드물어 시선을 끈다.', bonus: { 민첩: 1, 지능: 1, 정신: 1, 체력: -1 }, free: 1 },
    드워프: { desc: '잿빛 산맥의 장인 종족. 단단하고 고집스럽다.', bonus: { 체력: 2, 근력: 1, 민첩: -1, 정신: 1 }, free: 0 },
    수인: { desc: '짐승의 귀와 꼬리를 지닌 종족. 감각이 뛰어나지만 일부 귀족은 노골적으로 낮춰 본다.', bonus: { 근력: 1, 민첩: 1, 감각: 1, 지능: -1 }, free: 0 },
    하프엘프: { desc: '인간과 엘프 사이. 양쪽 어디에도 완전히 속하지 못하지만 사교에 능하다.', bonus: { 매력: 1, 감각: 1, 행운: 1 }, free: 0 },
};

export const ORIGINS = {
    native: { label: '원주민', desc: '이 세계에서 태어나 자란 사람. 연줄과 상식이 있고, 능력치 1점을 더 받습니다.' },
    reincarnated: { label: '전생자', desc: '이 세계에 다시 태어났지만, 전생(현대)의 기억이 있습니다. 출신 배경은 고를 수 있습니다.' },
    transferred: { label: '전이자', desc: '현대에서 몸 그대로 넘어왔습니다. 신분도 연줄도 없는 떠돌이로 시작하지만 특전을 받습니다.' },
};

export const BACKGROUNDS = {
    고아: { label: '빈민가 고아', noble: 1, money: 100, desc: '회색 골목에서 자랐다. 뒷골목 사정에 밝고 그림자 길드와 줄이 있다.', items: [['낡은 망토', 1]], rel: { '회색 골목의 노파 베사': 10 } },
    농민: { label: '농촌 출신', noble: 1, money: 300, desc: '남부 곡창지대 마을에서 왔다. 몸이 튼튼하고 성실하다.', items: [['말린 고기', 3]], rel: {} },
    상인가: { label: '상인 집안', noble: 2, money: 2000, desc: '제도의 작은 잡화상 집 자식. 셈이 빠르고 상인 길드에 아는 얼굴이 있다.', items: [['거래 장부', 1]], rel: { '상인 길드 접수원 토마스': 10 } },
    장인가: { label: '장인 집안', noble: 2, money: 1000, desc: '대장간이나 공방 집 자식. 손재주가 있고 장인 길드에 연이 있다.', items: [['손질용 공구', 1]], rel: {} },
    몰락귀족: { label: '몰락 귀족의 후손', noble: 1, money: 500, desc: '작위를 잃은 가문의 자식. 예법과 글을 알지만 가진 건 성씨와 자존심뿐이다.', items: [['가문 문장이 새겨진 반지', 1]], rel: {} },
    귀족가: { label: '귀족 가문의 자제', noble: 4, money: 2000, family: true, desc: '작위를 가진 가문에서 태어났다. 있는 가문이나 직접 만든 가문 — 외동인지 몇째인지에 따라 후계 자리가 정해진다.', items: [['가문 문장이 새겨진 반지', 1], ['좋은 옷 한 벌', 1]], rel: {} },
    서자: { label: '하급 귀족의 서자', noble: 2, money: 3000, desc: '어느 남작가의 서자. 귀족 사회에 발은 걸쳤지만 어디서도 환영받지 못한다.', items: [['좋은 옷 한 벌', 1]], rel: {} },
    용병가: { label: '떠돌이 용병의 자식', noble: 1, money: 500, desc: '전장을 떠도는 아버지 밑에서 자랐다. 칼은 익숙하고 예법은 엉망이다.', items: [['숫돌', 1]], rel: {} },
    엘프숲: { label: '대삼림의 엘프 마을', races: ['엘프', '하프엘프'], noble: 1, money: 300, desc: '서쪽 대삼림 깊은 곳, 나무 위에 지은 엘프 마을에서 자랐다. 숲길과 약초는 알지만 사람의 도시는 처음이다.', items: [['말린 약초 묶음', 2], ['나무껍질 망토', 1]], rel: {} },
    경계마을: { label: '경계목의 섞인 마을', races: ['하프엘프', '엘프', '인간'], noble: 1, money: 400, desc: '대삼림 가장자리, 인간과 엘프가 섞여 사는 경계목 마을. 두 말을 다 하고, 어느 쪽에서도 조금은 이방인이었다.', items: [['엘프어 사전 조각', 1]], rel: {} },
    드워프산: { label: '바르그홀름의 지하 도시', races: ['드워프'], noble: 1, money: 600, desc: '잿빛 산맥 속 드워프 지하 도시에서 망치 소리를 자장가 삼아 컸다. 돌과 쇠를 보는 눈이 있고 장인 길드에 드워프 이름이 통한다.', items: [['손때 묻은 망치', 1]], rel: {} },
    초원부족: { label: '타르간 초원의 부족', races: ['수인'], noble: 0, money: 200, desc: '동쪽 끝 대초원의 유목 부족에서 자랐다. 말 위에서 잠들고 바람 냄새로 날씨를 읽는다. 제국의 법과 돈 셈은 낯설다.', items: [['부족의 뼈 부적', 1], ['육포', 3]], rel: {} },
    숲수인: { label: '동부 산림의 수인 마을', races: ['수인'], noble: 1, money: 300, desc: '엘름바트 숲 깊은 곳 수인 마을에서 자랐다. 사냥과 덫에 밝고, 도시 사람들의 시선에는 아직 익숙하지 않다.', items: [['사냥용 덫', 1]], rel: {} },
    이방인: { label: '이방인 (전이자)', noble: 0, money: 0, desc: '이 세계에 막 떨어졌다. 신분증도 돈도 없다. 가진 건 넘어올 때의 옷과 소지품뿐.', items: [['현대의 옷 한 벌', 1]], rel: {}, transferredOnly: true },
};

export const JOBS = {
    모험가: { org: 'adventurer', desc: '모험가 길드 F등급에서 시작. 의뢰를 해결하며 S등급을 노린다.', items: [['숏소드', 1], ['가죽 갑옷', 1], ['하급 회복약', 2], ['여행 배낭', 1]], equip: { weapon: '숏소드', armor: '가죽 갑옷' }, skills: [] },
    상인: { org: 'merchant', desc: '상인 길드 행상 허가증으로 시작. 노점에서 상회, 그리고 거상으로.', items: [['작은 손수레', 1], ['잡화 묶음', 3], ['저울', 1]], equip: {}, skills: [['흥정', '값을 깎고 올리는 요령']], money: 1500 },
    기사지망: { org: 'knight', desc: '황실 기사단의 종자로 시작. 무공을 세워 기사 서임을 노린다.', items: [['훈련용 장검', 1], ['종자 제복', 1]], equip: { weapon: '훈련용 장검', armor: '종자 제복' }, skills: [] },
    마법사: { org: 'mage', desc: '청람의 탑 견습 마도사로 시작. 연구와 실전으로 탑의 정점을 노린다.', items: [['견습 지팡이', 1], ['기초 마도서', 1], ['마나 회복약', 1]], equip: { weapon: '견습 지팡이' }, skills: [] },
    장인: { org: 'artisan', desc: '장인 길드 견습공으로 시작. 대장장이·연금술·재봉 등 손으로 이름을 남긴다.', items: [['공구 세트', 1], ['작업용 앞치마', 1]], equip: {}, skills: [['기초 제작', '선택한 분야의 기본 제작 기술']] },
    신관: { org: 'church', desc: '빛의 성교회 수습 신관으로 시작. 치유와 신앙, 그리고 교회 정치.', items: [['성표', 1], ['수습 신관복', 1]], equip: { armor: '수습 신관복', accessory: '성표' }, skills: [] },
    자유인: { org: null, desc: '어디에도 속하지 않고 시작. 길은 직접 고른다. 시작 자금이 조금 더 많다.', items: [['여행 배낭', 1]], equip: {}, skills: [], money: 800 },
};

export const PERKS = {
    감정: '사물·인물의 기본 정보(이름, 등급, 상태, 대략의 값어치)를 꿰뚫어 본다.',
    아이템박스: '이공간 수납. 소지품 무게와 부피에 제한이 없다.',
    '성장 가속': '얻는 경험치가 1.5배.',
    '마력 친화': '최대 MP 1.5배, 모든 속성 마법을 익힐 소질.',
    '강인한 육체': '최대 HP 1.3배, 독·질병에 강하다.',
    행운: '모든 판정 +1. 묘하게 운이 따른다.',
    '현대 지식 활용': '현대의 지식(위생·회계·요리·화학 상식 등)을 이 세계에서 써먹을 요령이 있다.',
};

export const START_LOCS = ['제도 루미에른 · 길드 대로', '제도 루미에른 · 사거리 시장', '제도 루미에른 · 회색 골목', '제도 외곽 · 브레이크 마을', '흑림 가장자리', '항구도시 세렌포트'];

/* ───────────────────────── 출신별 첫 장면 씨앗 ───────────────────────── */
/** 출신(배경)마다 두 가지 — 이름으로 골라 같은 캐릭터는 늘 같은 씨앗 */
export const PROLOGUE_SEEDS = {
    고아: [
        '새벽의 회색 골목. 지붕 새는 공동 숙소에 빗물 떨어지는 소리, 하수 냄새, 옆자리 아이의 기침. 노파 베사가 마지막 남은 빵 반쪽을 내밀며 "오늘부터 네 밥값은 네가 벌어라" 하고 등을 떠민다. 골목 끝에서 그림자 길드 심부름꾼 소년이 "쉬운 일 있는데" 하고 눈짓한다 — 위험한 쉬운 길과 고된 정직한 길이 같은 아침에 열린다.',
        '사거리 시장의 뒷골목. 비린내와 구운 밤 냄새 사이로 소매치기 패거리가 {{user}}를 끼워 넣으려 한다. 그때 바람에 날려 온 종이 한 장 — 길드 대로의 신입 모집 공고. 옛 동료의 "너도 결국 우리랑 같아" 하는 비웃음이 등 뒤에 붙는다.',
    ],
    엘프숲: [
        '대삼림을 벗어난 지 사흘, 경계목을 지나 처음 밟는 사람의 길. 나무 냄새 대신 말똥과 연기 냄새, 하늘을 가린 잎 대신 텅 빈 하늘. 짐마차 주인이 뾰족한 귀를 힐끔거리며 "엘프가 제도엔 무슨 일로?" 하고 묻는다. 장로가 맡긴 봉인된 편지 한 통이 품 안에서 무겁다.',
        '제도 서문. 엘프를 처음 보는 아이들이 졸졸 따라오고, 위병은 통행증을 몇 번이고 뒤집어 본다. 숲에서 들고 온 약초 꾸러미를 사겠다는 약재상, 반대로 "숲 것들은 값을 모른다"며 반값을 부르는 상인. 어디선가 같은 숲의 향이 스친다.',
    ],
    경계마을: [
        '경계목 마을의 장날. 엘프어와 제국어가 뒤섞인 흥정 소리, 송진과 구운 빵 냄새. 어머니 쪽 친척이 "제도에 가 보는 게 어떻겠니" 하며 추천장을 내밀고, 아버지 쪽 친척은 "거기선 귀를 가리고 다녀라"라고 덧붙인다.',
        '대삼림 가장자리의 이른 아침. 숲 순찰을 도는 엘프 경비대가 마을 아이 하나가 사라졌다며 {{user}}를 부른다 — 양쪽 말을 다 하는 사람이 필요하다고.',
    ],
    드워프산: [
        '바르그홀름에서 내려오는 광산 수레 끝자리. 땅 위의 햇빛이 눈을 찌르고, 바람이 수염(혹은 땋은 머리)을 흐트러뜨린다. 대장장이 큰아버지가 쥐여 준 망치와 "땅 위에서 이름을 새겨 와라"는 말. 철문 마을의 주막에서 누군가 드워프 술을 내기로 걸자고 한다.',
        '제도 장인 공방가. 망치 소리가 엉망이다 — 담금질이 이르고, 쇠를 모른다. 참지 못하고 한마디 했다가 공방 주인과 언성이 높아진다. 구경꾼 사이에서 장인 길드 감독관이 흥미롭다는 눈으로 지켜본다.',
    ],
    초원부족: [
        '타르간 초원을 떠나 제국 국경 역참에 닿은 저녁. 말 냄새는 같은데 사람 냄새가 다르다. 귀와 꼬리를 보고 수군대는 역참 사람들, 통행세를 두 배로 부르는 관리. 부족 어른이 준 뼈 부적이 목에서 달그락거린다.',
        '제도 사거리 시장. 생전 처음 보는 동전 셈에 머리가 아프다. 초원에서 데려온 말을 헐값에 사려는 마상, 그리고 그 말을 보고 눈을 빛내는 기사단 종자.',
    ],
    숲수인: [
        '엘름바트 통나무 성문. 숲에서 잡은 가죽을 팔러 왔다가 처음으로 도시의 소음을 견딘다. 귀가 쉬지 않고 움찔거리고, 경비병이 "목줄은 어딨냐"며 낄낄댄다. 그때 사냥꾼 길드 게시판의 큰 현상금이 눈에 들어온다.',
        '동부 산림 수인 마을의 아침. 숲에서 늑대 떼의 냄새가 이상하다 — 무언가에 쫓기는 냄새. 마을 어른은 제도의 모험가 길드에 알리러 갈 젊은이를 찾고 있다.',
    ],
    농민: [
        '남부 곡창지대에서 짐마차를 얻어 타고 제도 성문에 닿은 아침. 손바닥의 굳은살, 어머니가 싸 준 말린 고기 꾸러미, 처음 보는 첨탑의 높이. 성문 위병이 "통행세 5동"을 부르며 촌티를 놀리고, 함께 내린 마부는 "제도에선 아무도 공짜로 안 가르쳐 준다"며 갈 곳 하나를 귀띔해 준다.',
        '고향 마을의 마지막 아침. 가뭄으로 반쯤 마른 밀밭, 빚 독촉 편지를 숨기는 아버지의 손. 촌장이 제도로 가는 추천장을 쥐여 주며 "네가 벌어 오면 이 마을이 산다" 한다. 장면은 제도에 막 도착해 그 무게를 처음 실감하는 순간까지 이어진다.',
    ],
    상인가: [
        '제도의 작은 잡화점 2층에서 덧문 올리는 소리에 깨는 새벽. 계피와 등유 냄새, 손때 묻은 주판. 부모가 장부 한 권을 건네며 "이제 네 몫의 장사는 네가 해 봐라" 한다. 상인 길드 접수원 토마스가 지나가다 "행상 허가 자리 하나 났다"고 일러 준다.',
        '빚쟁이가 가게 문을 두드린 아침. 아버지는 웃는 얼굴로 차를 내지만 찻잔이 떨린다. 다음 달까지 갚지 못하면 가게가 넘어간다 — {{user}}의 첫 돈벌이가 집안의 숨통이 된다.',
    ],
    장인가: [
        '망치 소리에 깨는 공방 2층. 밤새 꺼지지 않은 화로의 불씨, 쇳가루 냄새, 아버지의 이 빠진 모루. 오늘은 장인 길드 견습 등록 날인데, 아버지는 "네 손으로 만든 걸 들고 가라"며 하나뿐인 좋은 쇠를 내준다.',
        '공방에 들어온 묵직한 주문서 — 황실 기사단 문장이 찍혀 있다. 그런데 아버지는 어젯밤 손을 다쳤다. 기한은 열흘, 공방의 이름이 {{user}}의 손에 걸린다.',
    ],
    몰락귀족: [
        '곰팡내 나는 옛 저택의 한 칸. 팔고 남은 은촛대 하나와, 월급을 받지 못한 채 남은 늙은 집사 하나. 문장 반지를 전당포에 맡길지 고민하는 아침, 옛 가문을 비웃는 귀족 자제가 대로에서 일부러 말을 건다.',
        '옛 가문의 영지를 사들인 졸부 상인에게서 연회 초대장이 온다 — "옛 주인께도 꼭 오시라"는 조롱 섞인 문장. 가지 않으면 비겁하고, 가면 구경거리다. 그 사이에서 {{user}}는 자기 힘으로 일어설 첫 길을 찾는다.',
    ],
    서자: [
        '남작가 별채, 하인 방 바로 옆의 좁은 방. 본처 자식들의 사냥 행차를 말 뒤에서 따라나서야 하는 아침, 아버지 남작은 눈도 마주치지 않는다. 출발 직전 집사가 몰래 주머니 하나를 건넨다 — "주인님께서… 이걸로 나가 살라 하십니다."',
        '아버지 남작이 쓰러졌다는 소식이 별채까지 늦게 닿는다. 본처의 아들들은 벌써 상속 이야기를 하고, {{user}}가 방에 들어서자 모두 입을 다문다. 오래 머물 곳이 아니라는 걸 깨닫는 아침.',
    ],
    용병가: [
        '국경 막사에서 아버지 대신 돌아온 것은 녹슨 숫돌과 받지 못한 급료 증서 한 장. 증서에 적힌 용병단장은 지금 제도의 주점 \'부러진 창\'에 머문다고 한다. 칼은 익숙하고 예법은 엉망인 {{user}}가 처음으로 혼자 사람을 상대해야 하는 날.',
        '아버지와 제도 주점에서 일거리를 찾던 저녁, 아버지가 노름빚 때문에 경비대에 끌려간다. 보석금은 {{user}}가 가진 돈의 열 배 — 아버지는 끌려가며 "길드로 가라, 넌 나보다 낫다"고 외친다.',
    ],
    이방인: [
        '현대의 평범한 순간(출근길 지하철, 편의점 계산대, 이불 속 휴대폰)이 뚝 끊기고, 눈을 뜨면 시작 위치다. 읽을 수 없는 간판, 말발굽 소리, 낯선 화폐. 주머니의 휴대폰은 신호가 없다. 처음 말을 건 이 세계 사람(위병·노점상·아이)의 반응으로 이곳이 어떤 세계인지 실감한다.',
        '쓰러져 있던 {{user}}를 누군가 흔들어 깨운다. 입은 옷 때문에 모두가 쳐다보고, 위병은 신분증을 요구한다. 가진 건 현대의 소지품 몇 개뿐 — 그중 하나가 이 세계에선 꽤 값나가는 물건이라는 걸 곧 알게 된다.',
    ],
};
/** 첫 직업의 첫날 */
export const JOB_FIRST_DAY = {
    모험가: '모험가 길드 등록 수속 — 접수원 미렐이 F등급 철판 인식표를 건네고, 의뢰판에는 누렇게 바랜 F등급 의뢰 몇 장이 남아 있다.',
    상인: '상인 길드에서 행상 허가증을 받는 날 — 시장 자리 배정, 첫 물건 떼기, 텃세 부리는 옆자리 노점상.',
    기사지망: '황실 기사단 연병장에 종자로 배속되는 날 — 무뚝뚝한 담당 기사, 같은 날 들어온 귀족 출신 종자들의 시선.',
    마법사: '청람의 탑 견습 입문 — 마력 측정 수정구 앞에 서는 순간, 먼저 들어온 선배 견습생, 탑 특유의 잉크와 오존 냄새.',
    장인: '장인 길드 견습 등록 — 배정된 공방의 장인이 첫날부터 허드렛일만 시키지만, 그 사이로 진짜 기술이 슬쩍 보인다.',
    신관: '빛의 성교회 수습 서약 — 하얀 수습복, 새벽 기도, 무료 진료소에 줄 선 가난한 사람들.',
    자유인: '어디에도 매이지 않은 첫날 — 길드 대로·시장·성문 밖, 여러 길이 동시에 열려 있다. 무엇을 할지는 {{user}}가 고른다.',
};
function prologueLines(st) {
    const p = st.profile, L = [];
    const seeds = PROLOGUE_SEEDS[p.background] || PROLOGUE_SEEDS[p.origin === 'transferred' ? '이방인' : '농민'];
    const seed = seeds[hashStr(p.name || 'x') % seeds.length];
    if (p.background === '귀족가' && st.family) {
        const f = st.family, bl = birthLabel(f, p.gender);
        L.push(`- 첫 장면의 씨앗: ${f.house}(${f.region})의 ${bl}. ${f.heir
            ? '당주인 부모의 서재로 불려 가는 아침 — 문장 반지의 무게, 가문이 정해 둔 첫 공무(영지 순시나 사교 시즌의 첫 무도회)와 {{user}} 자신이 원하는 길 사이의 긴장.'
            : '형제의 약혼 연회 날, 식탁 끝자리 — 가문이 정해 준 진로(기사단·교회·정략혼)와 {{user}}가 고른 첫 직업 사이의 어색한 침묵, 그리고 형제 중 누군가의 은근한 견제나 응원.'}${f.siblings ? ` 형제자매: ${f.siblings}.` : ''}`);
    } else L.push(`- 첫 장면의 씨앗(그대로 베끼지 말고 살을 붙여라): ${seed}`);
    if (p.origin === 'reincarnated') L.push('- 전생자: 위 장면 속에서, 이 세계 사람이라면 무심코 지나칠 것을 {{user}}만 다르게 보는 순간을 하나 넣는다(전생의 기억이 스치는 감각).');
    if (p.origin === 'transferred') L.push(`- 첫 직업(${p.job}): 막 떨어진 날이니 오늘 당장 시작하지 않아도 된다. 그 길로 이어질 계기(모집 공고·도움을 준 사람의 소개 등)만 장면 안에 보여 준다.`);
    else L.push(`- 첫 직업의 첫날: ${JOB_FIRST_DAY[p.job] || JOB_FIRST_DAY.자유인} 출신 장면과 같은 날로 이어 붙인다.`);
    L.push(`- 시작 위치(${st.location})와 씨앗의 장소가 다르면, 시작 위치에 맞게 옮겨 그린다. 계절과 날짜(${formatDate(st.day).text})도 반영한다.`);
    return L;
}

/* ───────────────────────── 유틸 ───────────────────────── */

export const clone = (o) => JSON.parse(JSON.stringify(o));
const nospace = (s) => String(s || '').replace(/\s+/g, '');

export function formatMoney(v) {
    v = Math.max(0, Math.floor(Number(v) || 0));
    if (v === 0) return '0동';
    const pt = Math.floor(v / 1000000);
    const g = Math.floor((v % 1000000) / 10000);
    const s = Math.floor((v % 10000) / 100);
    const c = v % 100;
    const out = [];
    if (pt) out.push(`${pt}백금`);
    if (g) out.push(`${g}금`);
    if (s) out.push(`${s}은`);
    if (c) out.push(`${c}동`);
    return out.join(' ');
}

const MONEY_UNIT = { 백금: 1000000, 백금화: 1000000, 금: 10000, 금화: 10000, 은: 100, 은화: 100, 동: 1, 동화: 1 };

/** "+2은 50동" → {mode:'add', value:250} / "=3금" → {mode:'set', value:30000} */
export function parseMoney(str) {
    let s = String(str || '').replace(/,/g, '').replace(/\(.*?\)/g, '').trim();
    let mode = 'add', sign = 1;
    if (/^=/.test(s)) { mode = 'set'; s = s.slice(1); }
    else if (/^\+/.test(s)) { s = s.slice(1); }
    else if (/^[-−–]/.test(s)) { sign = -1; s = s.slice(1); }
    const re = /(\d+(?:\.\d+)?)\s*(백금화|백금|금화|금|은화|은|동화|동)?/g;
    let total = 0, found = false, m;
    while ((m = re.exec(s)) !== null) {
        if (!m[1]) continue;
        found = true;
        total += parseFloat(m[1]) * (MONEY_UNIT[m[2]] || 1);
    }
    if (!found) return null;
    return { mode, value: Math.round(total) * sign };
}

/** "+15", "-3", "=40", "최대" → {mode, value} */
export function parseNum(str) {
    const s = String(str || '').replace(/,/g, '').trim();
    if (/^(=?\s*)(최대|max|전부|완전|가득)/i.test(s)) return { mode: 'max', value: 0 };
    const m = s.match(/^(=)?\s*([+\-−–])?\s*(\d+(?:\.\d+)?)/);
    if (!m) return null;
    const v = parseFloat(m[3]);
    if (m[1]) return { mode: 'set', value: (m[2] && m[2] !== '+') ? -v : v };
    return { mode: 'add', value: (m[2] && m[2] !== '+') ? -v : v };
}

export function resolveOrg(name) {
    const n = nospace(name);
    if (!n) return null;
    for (const [id, o] of Object.entries(ORGS)) {
        if (nospace(o.name) === n || o.aliases.includes(n) || id === n) return id;
    }
    for (const [id, o] of Object.entries(ORGS)) {
        if (n.includes(nospace(o.name)) || o.aliases.some(a => a.length > 1 && n.startsWith(a))) return id;
    }
    return null;
}

function resolveOrgExact(name) {
    const n = nospace(name);
    for (const [id, o] of Object.entries(ORGS)) {
        if (nospace(o.name) === n || o.aliases.includes(n) || id === n) return id;
    }
    return null;
}

/** "모험가 길드 E등급" → {id:'adventurer', rest:'E등급'} (앞쪽 단어를 길게부터 맞춰 봄) */
export function splitOrgPrefix(arg) {
    const tokens = String(arg || '').trim().split(/\s+/).filter(Boolean);
    for (let k = Math.min(tokens.length, 4); k >= 1; k--) {
        const id = resolveOrgExact(tokens.slice(0, k).join(''));
        if (id) return { id, rest: tokens.slice(k).join(' ') };
    }
    return { id: null, rest: String(arg || '').trim() };
}

function resolveRank(orgId, text) {
    const ranks = ORGS[orgId].ranks;
    const n = nospace(text).replace(/등급$/, '');
    if (!n) return -1;
    let i = ranks.findIndex(r => nospace(r).replace(/등급$/, '') === n);
    if (i < 0) i = ranks.findIndex(r => nospace(r).includes(n) || n.includes(nospace(r).replace(/등급$/, '')));
    return i;
}

/* ───────────────────────── 파생 수치 ───────────────────────── */

/* 능력치: 10대 평범한 사람, 30 초보 모험가, 60 이름난 실력자, 100 인간의 한계. 한계를 넘으면 200·500·999 (넘은 만큼은 보정이 완만하게) */
export const STAT_BASE = 15;
export const STAT_CAPS = [100, 200, 500, 999];
export const STAT_CAP_NAMES = ['인간의 한계', '1차 한계 돌파', '2차 한계 돌파', '초월'];
export const statCap = (st) => STAT_CAPS[Math.min(3, st?.capBreak || 0)];
export const statMod = (v) => { v = Number(v) || STAT_BASE; return Math.floor((Math.min(v, 100) - STAT_BASE) / 8) + Math.floor(Math.max(0, v - 100) / 50); };
export const hasPerk = (st, p) => (st.profile?.perks || []).includes(p);

export function maxHP(st) {
    let v = 20 + Math.round((st.stats?.체력 || 15) * 2) + (st.lv - 1) * 6;
    if (hasPerk(st, '강인한 육체')) v = Math.round(v * 1.3);
    return v;
}
export function maxMP(st) {
    let v = 5 + Math.round((st.stats?.지능 || 15) * 1.3 + (st.stats?.정신 || 15) * 0.7) + (st.lv - 1) * 4;
    if (hasPerk(st, '마력 친화')) v = Math.round(v * 1.5);
    return v;
}
export function expNeed(st, lv = st.lv) {
    const d = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    return Math.round(100 * lv * d.expMult);
}
export function meritNeed(st, rankIndex) {
    const d = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    return Math.round((MERIT_TABLE[rankIndex] ?? Infinity) * d.meritMult);
}
export function orgLabel(id, rank) {
    const o = ORGS[id];
    return o ? `${o.name} ${o.ranks[Math.max(0, Math.min(rank, o.ranks.length - 1))]}` : id;
}
export function promotionReady(st) {
    const out = [];
    for (const [id, m] of Object.entries(st.orgs || {})) {
        const next = m.rank + 1;
        if (next < ORGS[id].ranks.length && m.merit >= meritNeed(st, next) && !(id === 'artisan' && MASTER_EXAM[next] && !m.exams?.[next])) out.push(id);
    }
    return out;
}

const SEASONS = { 3: '봄', 4: '봄', 5: '봄', 6: '여름', 7: '여름', 8: '여름', 9: '가을', 10: '가을', 11: '가을', 12: '겨울', 1: '겨울', 2: '겨울' };
export function formatDate(day) {
    const total = 60 + Math.max(0, Math.floor(day || 0));
    const y = 1047 + Math.floor(total / 360);
    const m = Math.floor((total % 360) / 30) + 1;
    const d = (total % 30) + 1;
    return { y, m, d, season: SEASONS[m], text: `제국력 ${y}년 ${m}월 ${d}일 (${SEASONS[m]})` };
}

/* ───────────────────────── 캐릭터 생성 ───────────────────────── */

export function emptyState() {
    return {
        v: 1, difficulty: 'normal',
        profile: { name: '', gender: '', age: '', race: '인간', origin: 'native', background: '농민', job: '모험가', appearance: {}, personality: '', story: '', goal: '', perks: [] },
        lv: 1, exp: 0, statPoints: 0,
        stats: Object.fromEntries(STATS.map(s => [s, 10])),
        hp: 0, mp: 0, money: 0, bank: 0, strikes: [], renown: 0, noble: 1, mainJob: '',
        orgs: {}, items: [], equip: {}, skills: [], titles: [], conds: [], quests: [], questLog: [], questsDone: 0,
        rel: {}, assets: [], market: {}, shops: [], farms: [], gear: {}, codex: {}, dungeons: {}, chronicle: [], notes: {}, children: [], expecting: null, staffNames: {}, generations: [], warServed: {}, family: null, honor: { pts: 0, title: null, hereditary: false, pending: null }, horseDeals: {}, stableFame: 0, commissions: [], estates: [], credit: 0, nobleDeals: {}, houseFavor: {}, patron: null, monthSales: 0, location: START_LOCS[0], day: 0,
        party: [], living: '싸구려', spouse: null, bonds: {}, exSpouses: [],
        classes: {}, cls: '', sub: null, life: {}, cskills: {}, affinity: [], companions: [],
    };
}

/** 예전 버전 상태에 없는 칸을 채운다 */
export function normalize(st) {
    const e = emptyState();
    for (const k of Object.keys(e)) if (st[k] === undefined) st[k] = clone(e[k]);
    for (const m of st.party) { m.conds = m.conds || []; if (m.hp === undefined) m.hp = m.maxhp || 50; }
    if (st.stats.힘 !== undefined && st.stats.근력 === undefined) { st.stats.근력 = st.stats.힘; delete st.stats.힘; }
    for (const k of STATS) if (st.stats[k] === undefined) st.stats[k] = 15;
    if (st.aging === undefined) { st.aging = true; st.ageBase = parseInt(String(st.profile?.age || '').match(/\d+/)?.[0]) || 18; st.ageDay0 = 0; }
    if (st.spouse && !st.bonds[st.spouse.name]) st.bonds[st.spouse.name] = { stage: '배우자', since: st.day };
    if (!st.cls || !CLASSES[st.cls]) {
        st.cls = st.orgs?.mage ? '마법사' : st.orgs?.church ? '치유사' : st.orgs?.knight ? '검사' : st.orgs?.shadow ? '도적' : '전사';
    }
    if (!st.classes[st.cls]) st.classes[st.cls] = { lv: st.lv || 1, exp: st.exp || 0 };
    if (!Object.keys(st.cskills).length) for (const c of Object.keys(st.classes)) for (const sk of basicSkills(st, c)) st.cskills[sk] = { cls: c, p: 0 };
    for (const c of st.companions) { c.conds = c.conds || []; if (c.hp === undefined) c.hp = c.maxhp || 30; if (c.out === undefined) c.out = false; if (c.kind === '마수' && !c.grade) c.grade = guessGrade(c.species); if (c.kind === '마수' && c.tamed === undefined) c.tamed = !!st.classes?.테이머; if (c.kind === '마수' && !c.trait) c.trait = traitOf(c.name, c.species); if (c.away === undefined) c.away = null; }
    syncClass(st);
    return st;
}

/** 생성 창 입력 → 초기 상태 */
export function createState(form) {
    const st = emptyState();
    const diff = DIFFICULTY[form.difficulty] ? form.difficulty : 'normal';
    const D = DIFFICULTY[diff];
    st.difficulty = diff;
    const origin = ORIGINS[form.origin] ? form.origin : 'native';
    const bgKey = origin === 'transferred' ? '이방인' : (BACKGROUNDS[form.background] && !BACKGROUNDS[form.background].transferredOnly ? form.background : '농민');
    const bg = BACKGROUNDS[bgKey];
    const jobKey = JOBS[form.job] ? form.job : '자유인';
    const job = JOBS[jobKey];

    st.profile = {
        name: String(form.name || '').trim() || '이름 없는 자',
        gender: form.gender || '', age: form.age || '', race: RACES[form.race] ? form.race : '인간',
        origin, background: bgKey, job: jobKey,
        appearance: { ...(form.appearance || {}) },
        personality: form.personality || '', story: form.story || '', goal: form.goal || '',
        craft: form.craft || '',
        perks: Array.isArray(form.perks) ? form.perks.filter(p => PERKS[p]).slice(0, D.perks[origin] ?? 0) : [],
    };
    if (origin === 'transferred' && !st.profile.perks.includes('언어 이해')) st.profile.perksFree = ['언어 이해'];

    // 능력치: 폼에서 받은 배분값(이미 종족 보정 포함) 그대로 사용, 범위만 보정
    // 새 캐릭터 만들기(statScale 2)는 그대로, 예전 기록(기준 8, 최대 20)은 새 눈금으로 옮긴다
    for (const s of STATS) { const v = Number(form.stats?.[s]) || (form.statScale === 2 ? 15 : 8); st.stats[s] = Math.max(1, Math.min(60, Math.round(form.statScale === 2 ? v : 10 + (v - 8) * 2.5))); }

    st.noble = bg.noble;
    st.aging = form.aging !== false;
    st.ageBase = parseInt(String(form.age || '').match(/\d+/)?.[0]) || 18;
    st.ageDay0 = 0;
    if (bg.family && form.family) {
        const fm = form.family;
        const ex = fm.mode !== 'new' && houseOf(fm.house || '');
        const title = ex ? ex.title : (TITLE_RANK[fm.title] ? fm.title : '남작');
        const house = ex ? ex.name : `${String(fm.name || '').trim().replace(/가$/, '') || '이름 없는'} ${title}가`;
        const birth = Math.max(0, Math.min(4, parseInt(fm.birth) || 0));
        st.family = { house, title, region: ex ? ex.region : (fm.region || '제도 근교'), faction: ex ? ex.faction : (fm.faction || '중립'), own: !ex, birth, heir: birth <= 1, head: false, favor: 50, disowned: false, siblings: String(fm.siblings || '').trim() };
        st.noble = Math.max(4, TITLE_RANK[title] - 1);
        if (ex) st.houseFavor[ex.name] = 60;
    }
    st.money = Math.round(((bg.money || 0) + (job.money || 0)) * D.moneyMult);
    if (origin === 'transferred' && diff === 'easy') st.money += 500;
    if (st.family) st.money += (TITLE_ALLOW[st.family.title] || 3000) * (st.family.birth <= 1 ? 2 : 1);

    const addItem = (n, q) => { const f = st.items.find(i => i.name === n); if (f) f.qty += q; else st.items.push({ name: n, qty: q }); };
    for (const [n, q] of job.items) addItem(n, q);
    for (const [n, q] of bg.items) addItem(n, q);
    if (form.extraItem) addItem(String(form.extraItem).trim(), 1);
    st.equip = { ...job.equip };
    st.skills = job.skills.map(([name, desc]) => ({ name: jobKey === '장인' && form.craft ? `${name}(${form.craft})` : name, desc }));
    if (job.org) st.orgs[job.org] = { rank: 0, merit: 0 };
    st.cls = CLASSES[form.cls] ? form.cls : (JOB_DEFAULT_CLASS[jobKey] || '전사');
    st.classes = { [st.cls]: { lv: 1, exp: 0 } };
    const fa = Array.isArray(form.affinity) ? form.affinity.filter(e => ELEMENTS.includes(e)) : [];
    st.affinity = (fa.length ? fa : form.affNone && !NEEDS_AFFINITY.includes(st.cls) ? [] : measureAffinityFor(st.profile.name, st.cls, diff)).slice(0, maxAffinity(diff));
    st.cskills = {};
    for (const sk of basicSkills(st, st.cls)) st.cskills[sk] = { cls: st.cls, p: 0 };
    st.companions = [];
    if (form.companion && STARTER_COMPANIONS[st.cls]) {
        const want = String(form.companion.species || '');
        // 정령 이름이 바뀌기 전에 만든 캐릭터('빛의 정령 니트라스' 등)도 같은 속성으로 찾는다
        const sp = STARTER_COMPANIONS[st.cls].find(x => x[0] === want) || STARTER_COMPANIONS[st.cls].find(x => want && x[0].split(' ').slice(0, 2).join(' ') === want.split(' ').slice(0, 2).join(' ')) || STARTER_COMPANIONS[st.cls][0];
        const kind = st.cls === '정령술사' ? '정령' : st.cls === '소환사' ? '소환수' : '마수';
        if (kind === '정령') { const call = SKILL_TREE.정령술사.find(x => x[1] === 1 && x[4] === sp[1]); if (call && !st.cskills[call[0]]) st.cskills[call[0]] = { cls: '정령술사', p: 0 }; }
        addCompanion(st, { name: (form.companion.name || '').trim() || (kind === '정령' ? spiritBaseName(sp[1], 0) : sp[0].split(' ')[0]), kind, species: kind === '정령' ? '' : sp[0], elem: sp[1], bond: kind === '소환수' ? 0 : 30, terms: kind === '소환수' ? (form.companion.terms || '보름달마다 마력을 조금 나눠 준다') : '' });
    }
    if (form.focus && String(form.focus).trim()) st.classes[st.cls].focus = { [String(form.focus).trim()]: 10 };
    st.life = {};
    for (const k of (form.life || []).slice(0, 2)) if (LIFE[k]) st.life[k] = { rank: 1, pt: 0 };
    st.mainJob = job.org ? orgLabel(job.org, 0) : '무소속';
    st.rel = { ...bg.rel };
    st.location = form.location || (origin === 'transferred' ? '흑림 가장자리' : START_LOCS[0]);
    st.hp = maxHP(st);
    st.mp = maxMP(st);
    return st;
}

/* ───────────────────────── 태그 파싱 ───────────────────────── */

export function extractBlocks(text, tag) {
    const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'g');
    const out = [];
    let m;
    while ((m = re.exec(String(text || ''))) !== null) out.push(m[1]);
    return out;
}

const KEY_MAP = {
    돈: 'money', 골드: 'money', 소지금: 'money', 금전: 'money', 자금: 'money',
    경험: 'exp', 경험치: 'exp', exp: 'exp', EXP: 'exp',
    hp: 'hp', HP: 'hp', 생명력: 'hp', 기력: 'energy', 피로: 'fatigue', 피로도: 'fatigue', 낮잠: 'nap', 쉬기: 'nap', 잠깐쉬기: 'nap',
    mp: 'mp', MP: 'mp', 마나: 'mp',
    아이템: 'item', 소지품: 'item', 물품: 'item', 획득: 'item',
    공적: 'merit', 기여: 'merit', 기여도: 'merit',
    승급: 'promote', 승진: 'promote', 강등: 'demote',
    가입: 'join', 입단: 'join', 탈퇴: 'leave', 제명: 'leave',
    명성: 'renown', 평판: 'renown',
    신분: 'noble', 작위: 'noble',
    호감: 'rel', 호감도: 'rel', 관계: 'rel', 신뢰: 'rel',
    스킬: 'skill', 기술: 'skill', 마법: 'skill',
    칭호: 'title', 이명: 'title',
    상태: 'cond', 상태이상: 'cond',
    의뢰: 'quest', 퀘스트: 'quest', 의뢰완료: 'questDone', 의뢰성공: 'questDone', 의뢰실패: 'questFail', 의뢰포기: 'questFail',
    위치: 'loc', 장소: 'loc', 이동: 'loc',
    날짜: 'day', 시간: 'day', 경과: 'day',
    장착: 'equip', 해제: 'unequip',
    자산: 'asset', 재산: 'asset', 부동산: 'asset',
    능력: 'stat', 능력치: 'stat',
    포인트: 'points', 능력포인트: 'points',
    직업: 'job', 주직업: 'job',
    레벨: 'level',
    동료: 'party', 파티: 'party', 동료HP: 'partyHp', 동료hp: 'partyHp', 동료상태: 'partyCond',
    생활: 'living', 생활수준: 'living',
    결혼: 'marry', 혼인: 'marry',
    관계: 'bond', 연애: 'bond', 관계강제: 'bondForce',
    클래스: 'cls', 전직: 'cls', 주클래스: 'cls', 보조: 'subcls', 보조클래스: 'subcls', 서브클래스: 'subcls', 서브: 'subcls',
    클래스습득: 'learnCls', 클래스경험: 'clsExp', 클래스레벨: 'clsLv',
    수련: 'train', 생활기술: 'train', 기술랭크: 'lifeRank',
    특화: 'focus', 성향: 'focus', 전문: 'focus',
    적성: 'affinity', 적성속성: 'affinity',
    동반자: 'comp', 계약: 'comp', 길들임: 'comp', 정령계약: 'comp', 동반자HP: 'compHp', 동반자hp: 'compHp', 유대: 'compBond', 동반자성장: 'compExp', 성장: 'compExp', 진화: 'compEvolve', 진명: 'trueName', 해독: 'decode', 금서해독: 'decode', 대가: 'pact', 계약대가: 'pact', 대가이행: 'pactDone', 발견: 'relicFind', 유적발견: 'relicFind', 소생: 'revive', 부활: 'revive', 동반자상태: 'compCond', 불러내기: 'compCall', 제작: 'craft', 일하기: 'work', 품팔이: 'work', 부동산구입: 'estateBuy', 부동산매각: 'estateSell', 걸작제출: 'exam', 심사: 'exam', 주문수락: 'orderTake', 주문납품: 'orderDeliver', 주문포기: 'orderDrop', 만들기: 'craft', 납품: 'deliver', 진열: 'display', 생산: 'gather', 채집작업: 'gather', 외상: 'credit', 융자: 'credit', 외상상환: 'repay', 상환: 'repay', 상단결성: 'caravan', 귀족납품: 'nobleSell', 스카웃수락: 'patronJoin', 후원수락: 'patronJoin', 후원해지: 'patronLeave', 가문호감: 'houseFavor', 귀족구입: 'nobleBuy', 가게개업: 'shopOpen', 개업: 'shopOpen', 재고: 'shopStock', 수금: 'shopCollect', 점원: 'shopStaff', 가게확장: 'shopUp', 가게평판: 'shopRep', 가게폐업: 'shopClose', 장비손상: 'gearDmg', 내구: 'gearDmg', 수리: 'gearFix', 강화: 'gearUp', 처치: 'kill', 토벌: 'kill', 던전: 'dungeon', 미궁: 'dungeon', 던전귀환: 'dungeonOut', 수호자: 'guardian', 혼담수락: 'matchOk', 혼담거절: 'matchNo', 연대기: 'chron', 기록: 'chron', 인물: 'note', 근황: 'npcNews', 인물근황: 'npcNews', 인물메모: 'note', 인물노트: 'note', 나이먹기: 'aging', 나이: 'ageSet', 외모: 'looks', 외모정리: 'looks', 한계돌파: 'capBreak', 한계: 'capBreak', 입양: 'petAdopt', 반려: 'petAdopt', 반려동물: 'petAdopt', 구조: 'petRescue', 반려자리: 'petHome', 마스코트: 'petHome', 돌보기: 'petCare', 쓰다듬기: 'petCare', 정령이름: 'spiritName', 자동보충: 'shopAuto', 폐업: 'shopClose', 농장구입: 'farmBuy', 땅구입: 'farmBuy', 농장매각: 'farmSellLand', 땅매각: 'farmSellLand', 경작: 'farmPlant', 심기: 'farmPlant', 휴경: 'farmClear', 갈아엎기: 'farmClear', 가축구입: 'stockBuy', 가축매각: 'stockSell', 농장일꾼: 'farmWorker', 관리인: 'farmSteward', 양조: 'brew', 술담그기: 'brew', 출하: 'farmShip', 싣기: 'farmLoad', 말데려오기: 'farmHorse', 농장소출: 'farmGood', 임신: 'pregnant', 출산: 'birth', 자녀: 'childAdd', 아이이름: 'childName', 자녀이름: 'childName', 후계자: 'childHeir', 가업맡기기: 'childRole', 세대교체: 'passGen', 군역: 'warServe', 식재료: 'supplyLink', 고용인이름: 'staffName', 가문총애: 'famFavor', 후계지명: 'famHeir', 후계박탈: 'famUnheir', 가문승계: 'famInherit', 의절: 'famDisown', 가문복귀: 'famReturn', 공훈: 'honor', 작위수여: 'honorGrant', 서임: 'honorGrant', 가문창설: 'honorHouse', 가문이름: 'honorHouse', 말구입: 'horseBuy', 말판매: 'horseSell', 말교배: 'horseBreed', 종마교배: 'horseStud', 교배수락: 'horseStudAccept', 말제안수락: 'horseBid', 말매각: 'horseBid', 여행: 'travel', 여정: 'travel', 길떠나기: 'travel', 시간대: 'tod', 하루중: 'tod', 인물일정: 'schedule', 일정: 'schedule', 말돌보기: 'horseCare', 마구간관리: 'stableCare', 마구간방침: 'stableCare', 말관리: 'stableCare', 말이름: 'horseRename', 말타고가기: 'horseRide', 말등급: 'horseGrade', 메뉴추가: 'menuAdd', 메뉴빼기: 'menuDel', 메뉴삭제: 'menuDel', 대표메뉴: 'menuSig', 가게이전: 'shopMove', 이전: 'shopMove', 가문연회: 'banquet', 연회: 'banquet', 가게소문: 'shopFame', 매입: 'tradeBuy', 매각: 'tradeSell', 교역매입: 'tradeBuy', 교역매각: 'tradeSell', 예금: 'deposit', 입금: 'deposit', 인출: 'withdraw', 출금: 'withdraw', 경고: 'strike', 규약위반: 'strike', 동반자등급: 'compGrade', 맡기기: 'compAway', 대여: 'compAway', 데려오기: 'compHome', 돌려받기: 'compHome', 소환하기: 'compCall', 돌려보내기: 'compBack', 귀환: 'compBack', 유지: 'compKeep',
    기술습득: 'learnSkill', 전수: 'learnSkill', 숙련: 'prof', 숙련도: 'prof', 깨달음: 'epiphany',
    이혼: 'divorce', 사별: 'divorce',
};

/** <변동> 블록 → [{key, arg, raw}] */
/** GM이 명령어를 띄어 쓰거나 비슷한 말로 바꿔 써도 알아듣기 — "말 이름 샛별", "메뉴 추가", "농장 구입" */
const KEY_ALIAS = { 추가메뉴: '메뉴추가', 메뉴등록: '메뉴추가', 땅사기: '농장구입', 토지구입: '농장구입', 말사기: '말구입', 말구매: '말구입', 말팔기: '말판매', 교배: '말교배', 술빚기: '양조', 술담금: '양조', 일꾼고용: '농장일꾼', 가게열기: '가게개업', 가게오픈: '가게개업', 개업: '가게개업', 재고보충: '재고', 소문: '가게소문', 평판: '가게평판', 작위: '작위수여', 서임식: '작위수여', 공적치: '공적', 금화: '돈', 소지금: '돈', 골드: '돈', 경험치: '경험', 체력: 'HP', 마력: 'MP' };
function editDist1(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, d = 0;
    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; continue; }
        if (++d > 1) return false;
        if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return d + (a.length - i) + (b.length - j) <= 1;
}
function fuzzyKey(raw) {
    const toks = raw.split(/\s+/);
    for (let n = Math.min(3, toks.length); n >= 1; n--) {
        const head = toks.slice(0, n).join('').replace(/[:：]$/, '');
        const rest = raw.slice(raw.indexOf(toks[n - 1]) + toks[n - 1].length).replace(/^\s*[:：]?\s*/, '');
        const ali = KEY_ALIAS[head];
        if (KEY_MAP[ali || head]) return { key: KEY_MAP[ali || head], arg: rest };
        if (head.length >= 3 && n > 1 || head.length >= 4) {
            const near = Object.keys(KEY_MAP).filter(x => x.length >= 3 && editDist1(x, head));
            if (near.length === 1) return { key: KEY_MAP[near[0]], arg: rest };
        }
    }
    return null;
}
export function parseOpLines(lines) {
    const ops = [];
    for (let raw of lines) {
        raw = String(raw).replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, '').trim();
        if (!raw) continue;
        const m = raw.match(/^([^\s:：]+)\s*[:：]?\s*(.*)$/);
        if (!m) continue;
        let k = m[1], arg = m[2].trim();
        // 두 낱말 명령어를 띄어 쓴 경우가 한 낱말 명령어보다 먼저 ("생활 기술 요리 +10", "보조 클래스 궁수", "가게 평판 …")
        const m2 = raw.match(/^([^\s:：]+)\s+([^\s:：]+)\s*[:：]?\s*(.*)$/);
        const two = m2 && (KEY_MAP[m2[1] + m2[2]] ? m2[1] + m2[2] : KEY_ALIAS[m2[1] + m2[2]]);
        if (two && KEY_MAP[two]) { k = two; arg = m2[3].trim(); }
        let key = KEY_MAP[k] || KEY_MAP[k.toLowerCase()];
        if (!key && normStat(k)) { key = 'stat'; arg = `${normStat(k)} ${arg}`; }
        if (!key) { const f = fuzzyKey(raw); if (f) { key = f.key; arg = f.arg; } }
        if (!key) { ops.push({ key: 'unknown', arg, raw }); continue; }
        ops.push({ key, arg, raw });
    }
    return ops;
}

export function parseOps(text) {
    const lines = [];
    for (const b of extractBlocks(text, '변동')) lines.push(...b.split(/\r?\n/));
    return parseOpLines(lines);
}

export function parseCheck(text) {
    const blocks = extractBlocks(text, '판정');
    if (!blocks.length) return null;
    const b = blocks[blocks.length - 1].trim();
    const parts = b.split(/\s*[|｜]\s*/);
    let stat = null, dc = null, what = '';
    for (const p of parts) {
        const pp = p.replace(/^(능력치?|난이도|DC|내용)\s*[:：]?\s*/i, '').trim();
        if (!stat && normStat(pp)) { stat = normStat(pp); continue; }
        if (dc == null) {
            const n = pp.match(/^(\d{1,2})$/) || pp.match(/(?:DC|난이도)\s*(\d{1,2})/i);
            if (n) { dc = parseInt(n[1]); continue; }
            const w = DC_WORDS[nospace(pp)];
            if (w) { dc = w; continue; }
        }
        what = what ? `${what} ${pp}` : pp;
    }
    if (!stat) { // "민첩 판정, 난이도 15" 같은 자유 형식
        const sm = b.match(/(근력|민첩|체력|지능|감각|매력|힘|행운|정신|의지|지각|화술|마력|운)/);
        if (sm) stat = normStat(sm[1]);
    }
    if (dc == null) { const n = b.match(/(\d{1,2})/); if (n) dc = parseInt(n[1]); }
    if (!stat || dc == null) return null;
    return { stat, dc: Math.max(2, Math.min(30, dc)), what: what.trim() };
}

export function parseChoices(text) {
    const blocks = extractBlocks(text, '선택지');
    if (!blocks.length) return [];
    return blocks[blocks.length - 1].split(/\r?\n/)
        .map(l => l.replace(/^\s*(?:[-*•·]|\d+[.)]|[①-⑨])\s*/, '').trim())
        .filter(Boolean).slice(0, 6);
}

/** 값을 모르는 물건 — 상대가 속으로 매긴 값 (이름에 따라 늘 같다) */
export function hiddenValue(name) {
    const r = rng(hashStr(`val|${nospace(name)}`));
    return Math.round(40 + Math.pow(r(), 2) * 1500);
}
/** 거래 창에서 상대가 받아들일지 — 상대는 내 물건을 조금 깎아 보고, 제 물건은 부른 값대로 본다 */
export function tradeJudge(st, o, { haggle = 0, tries = 0 } = {}) {
    let mine = o.giveMoney || 0, theirs = o.getMoney || 0;
    for (const g of o.give || []) if (g.qty > 0) mine += g.qty * Math.round((valueOf(st, g.name) ?? hiddenValue(g.name) * 0.6) * 0.85);
    for (const g of o.get || []) if (g.qty > 0) theirs += g.qty * (g.price ?? valueOf(st, g.name) ?? hiddenValue(g.name));
    const mr = st.orgs?.merchant ? st.orgs.merchant.rank + 1 : 0;
    const mult = Math.max(0.72, 1 - statMod(st.stats?.매력 ?? 15) * 0.03 - mr * 0.02 - haggle + tries * 0.05);
    const need = Math.round(theirs * mult);
    const ratio = need ? mine / need : (mine > 0 ? 9 : 0);
    return { mine, theirs, need, ratio, verdict: ratio >= 1 ? 'accept' : ratio >= 0.85 ? 'close' : 'reject', short: Math.max(0, need - mine) };
}

/* ───────────────────────── 날씨 · 손님 ───────────────────────── */
const WEATHER_BY_SEASON = {
    봄: [['맑음', 4], ['흐림', 3], ['비', 3], ['안개', 1], ['폭우', 0.5]],
    여름: [['맑음', 4], ['무더위', 2.5], ['흐림', 1.5], ['소나기', 2], ['폭우', 1]],
    가을: [['맑음', 5], ['흐림', 3], ['비', 2], ['안개', 1.5]],
    겨울: [['흐림', 3], ['맑음', 2], ['눈', 3], ['폭설', 1], ['진눈깨비', 1]],
};
const WEATHER_TRAFFIC = { 맑음: 1.05, 흐림: 1, 비: 0.8, 소나기: 0.9, 폭우: 0.55, 안개: 0.9, 무더위: 0.85, 눈: 0.8, 폭설: 0.5, 진눈깨비: 0.75 };
const WEATHER_ZONE = { '제도 루미에른': '중부', '브레이크 마을': '중부', '곡물 도시 하벤': '중부', '엘름바트': '중부', '항구도시 세렌포트': '해안', '바르그홀름': '산악', '북부 변경': '북부' };
export function weatherOf(day, market) {
    const zone = WEATHER_ZONE[market] || '중부';
    let season = formatDate(day).season;
    if (zone === '북부' && season === '가을' && formatDate(day).m >= 10) season = '겨울';
    const list = WEATHER_BY_SEASON[season] || WEATHER_BY_SEASON.봄;
    const r = rng(hashStr(`wx|${day}|${zone}`)); r();
    // 날씨는 하루 이틀 이어진다
    const r2 = rng(hashStr(`wx|${Math.floor(day / 2)}|${zone}`)); r2();
    const x = (r() * 0.4 + r2() * 0.6) * list.reduce((a, w) => a + w[1], 0);
    let acc = 0;
    for (const [w, k] of list) { acc += k; if (x <= acc) return w; }
    return list[0][0];
}
const doyAt = (day) => { const f = formatDate(day); return (f.m - 1) * 30 + (f.d - 1); };
/** 오늘 이 시장의 손님 — 사교 시즌·축제·무도회·날씨 */
export function crowdOf(market, day) {
    const f = formatDate(day), doy = doyAt(day);
    let m = 1; const why = [];
    const capital = market === '제도 루미에른';
    if (f.m === 3 && f.d >= 15 && f.d <= 21) { m *= capital ? 1.8 : 1.25; why.push('건국제'); }
    else if (f.m === 10 && f.d >= 10 && f.d <= 14) { m *= market === '브레이크 마을' ? 1.7 : capital ? 1.5 : 1.3; why.push('수확제'); }
    else if (capital) {
        if (doy >= 60 && doy <= 299) { m *= 1.2; why.push('사교 시즌'); } else { m *= 0.85; why.push('비시즌'); }
        if (f.d === 30 && f.m >= 3 && f.m <= 10) { m *= 1.15; why.push('황궁 무도회 날'); }
    }
    const w = weatherOf(day, market);
    m *= WEATHER_TRAFFIC[w] ?? 1;
    if ((WEATHER_TRAFFIC[w] ?? 1) < 0.95) why.push(w);
    const label = m >= 1.5 ? '인산인해' : m >= 1.15 ? '북적임' : m >= 0.9 ? '보통' : m >= 0.7 ? '한산' : '텅 빔';
    return { mult: m, label, why, weather: w };
}

/* ───────────────────────── 장인: 만들기 · 납품 ───────────────────────── */
/** 계열 — 비슷한 기술끼리 묶여 같은 납품처를 쓴다 */
export const CRAFT_LINES = {
    금속: { skills: ['대장일', '세공'], buyer: '위병대 병기고·기사단 보급관·보석상' },
    '가죽·천': { skills: ['가죽 공예', '재봉'], buyer: '재봉 조합·상회·모험가 상점' },
    나무: { skills: ['목공'], buyer: '목재소·조선소·모험가 상점' },
    음식: { skills: ['요리'], buyer: '여관·연회장·위병대 식당' },
    약: { skills: ['연금술'], buyer: '치유원·약방·모험가 길드' },
};
export const lineOf = (skill) => Object.keys(CRAFT_LINES).find(k => CRAFT_LINES[k].skills.includes(skill));
/** 제작품 — [이름, 기술, 필요 랭크, 기준가(동), 하루에 만드는 수(소수면 여러 날)] */
export const CRAFT_GOODS = [
    ['쇠 연장 꾸러미', '대장일', 0, 300, 4], ['장검', '대장일', 3, 2500, 1], ['사슬 갑옷', '대장일', 5, 9000, 0.34], ['미스릴 검', '대장일', 8, 60000, 0.2],
    ['은반지', '세공', 0, 600, 3], ['보석 목걸이', '세공', 3, 6000, 0.5], ['귀족 예물 세트', '세공', 6, 30000, 0.25],
    ['가죽 장화', '가죽 공예', 0, 350, 3], ['가죽 갑옷', '가죽 공예', 3, 2800, 1], ['마수 가죽 망토', '가죽 공예', 5, 8000, 0.34],
    ['무명 옷', '재봉', 0, 250, 4], ['나들이 옷', '재봉', 2, 1200, 1.5], ['귀족 예복', '재봉', 5, 12000, 0.34], ['마도사 로브', '재봉', 6, 15000, 0.25],
    ['나무 식기 상자', '목공', 0, 200, 5], ['장궁', '목공', 3, 1800, 1], ['참나무 방패', '목공', 3, 1500, 1], ['가구 한 벌', '목공', 5, 9000, 0.25],
    ['도시락 바구니', '요리', 0, 120, 8], ['잔칫상', '요리', 3, 1500, 1], ['궁정 만찬', '요리', 6, 12000, 0.5],
    ['회복 물약', '연금술', 0, 250, 5], ['해독제', '연금술', 2, 600, 3], ['마력 물약', '연금술', 4, 2000, 1.5], ['엘릭서', '연금술', 8, 40000, 0.2],
];
export const QUALITY = [['조잡', 0.6], ['보통', 1], ['양품', 1.3], ['명품', 1.8], ['걸작', 3]];
const CRAFT_ALIAS = { 회복약: '회복 물약', 치유물약: '회복 물약', 치료약: '회복 물약', 포션: '회복 물약', 힐링포션: '회복 물약', 마나물약: '마력 물약', 마력약: '마력 물약', 마나포션: '마력 물약', 해독약: '해독제', 엘릭시르: '엘릭서', 검: '장검', 롱소드: '장검', 반지: '은반지' };
export const findCraft = (name) => {
    const n = nospace(String(name).replace(/\s*\((조잡|보통|양품|명품|걸작)\)\s*$/, ''));
    const hit = CRAFT_GOODS.find(g => nospace(g[0]) === n); if (hit) return hit;
    if (!n) return null;
    const base = n.replace(/^(하급|중급|상급|최상급|고급|저급)/, '');
    const al = CRAFT_ALIAS[base]; if (al) return CRAFT_GOODS.find(g => g[0] === al) || null;
    return CRAFT_GOODS.find(g => nospace(g[0]) === base) || null;
};
export const qualityOf = (name) => (String(name).match(/\((조잡|보통|양품|명품|걸작)\)\s*$/) || [])[1] || '보통';
export const craftValue = (name) => { const g = findCraft(name); if (!g) return null; return Math.round(g[3] * (QUALITY.find(q => q[0] === qualityOf(name))?.[1] ?? 1)); };
/** 오늘 이 시장에서 이 계열 납품값이 얼마나 쳐지는지 — 정세·계절·축제·날씨·시장 */
export function deliveryDemand(st, line, market, day = st.day) {
    let m = 1; const why = [];
    const add = (k, w) => { if (Math.abs(k - 1) < 0.01) return; m *= k; why.push(`${w} ${k > 1 ? '▲' : '▼'}`); };
    const MK = { '제도 루미에른': { 금속: 1, '가죽·천': 1.1, 음식: 1.05 }, '북부 변경': { 금속: 1.25, '가죽·천': 1.2, 약: 1.2 }, '항구도시 세렌포트': { 나무: 1.3, 음식: 1.05 }, 바르그홀름: { 금속: 0.8, 음식: 1.2, 약: 1.1 }, '브레이크 마을': { 음식: 0.85, 약: 1.1, 금속: 0.9 }, '곡물 도시 하벤': { 음식: 0.85, 금속: 1.1 }, 엘름바트: { 나무: 0.75, '가죽·천': 0.9, 금속: 1.15 } };
    add(MK[market]?.[line] ?? 1, market);
    for (const a of affairsOf(day)) {
        const E2 = { '전쟁 소문': { 금속: 1.4, '가죽·천': 1.2, 약: 1.2 }, 역병: { 약: 1.8, 음식: 0.9 }, '사교 시즌': { '가죽·천': 1.25, 금속: market === '제도 루미에른' ? 1.1 : 1, 음식: 1.15 }, '북부 마물 범람': { 금속: market === '북부 변경' ? 1.4 : 1.1, 약: 1.15 }, 흉작: { 음식: 1.3 }, '풍년 소식': { 음식: 0.9 }, '미궁 신층 발견': { 금속: 1.1, '가죽·천': 1.1, 약: 1.1 }, '항로의 폭풍': { 나무: 1.2 }, '해적 출몰': { 금속: market === '항구도시 세렌포트' ? 1.2 : 1 } }[a.name];
        if (E2?.[line]) add(E2[line], a.name);
    }
    const f = formatDate(day);
    if (f.season === '겨울') add({ '가죽·천': 1.2, 음식: 1.05, 나무: 1.1 }[line] ?? 1, '겨울');
    if (f.season === '여름') add({ 약: 1.1, '가죽·천': 0.9 }[line] ?? 1, '여름');
    const fest = (f.m === 3 && f.d >= 15 && f.d <= 21) ? '건국제' : (f.m === 10 && f.d >= 10 && f.d <= 14) ? '수확제' : null;
    if (fest) add({ 음식: 1.5, 금속: 1.1, '가죽·천': 1.15 }[line] ?? 1.05, fest);
    const w = weatherOf(day, market);
    add(({ 폭설: { 음식: 1.15, '가죽·천': 1.15, 나무: 1.2 }, 눈: { '가죽·천': 1.1 }, 무더위: { 음식: 0.9, 약: 1.1 }, 폭우: { 나무: 0.85 } }[w] || {})[line] ?? 1, w);
    const net = st.market?.[`${ymOf(day)}|${market}|납품:${line}`] || 0;
    if (net) add(Math.max(0.6, 1 - net * 0.015), '이달 많이 납품함');
    return { mult: m, why };
}
/** 납품처가 막히는 날 — 폭우·폭설에는 성 밖 납품처(조선소·기사단 주둔지)에 가지 못한다 */
export const deliveryBlocked = (market, day) => ['폭우', '폭설'].includes(weatherOf(day, market));
export function deliveryQuote(st, name, market = marketOf(st.location), day = st.day) {
    const g = findCraft(name); if (!g || !market) return null;
    const line = lineOf(g[1]);
    const d = deliveryDemand(st, line, market, day);
    const ar = st.orgs?.artisan ? st.orgs.artisan.rank + 1 : 0;
    const fee = st.orgs?.artisan ? 0 : 0.1;
    const unit = Math.round(craftValue(name) * 0.8 * d.mult * (1 + ar * 0.03) * (1 - fee));
    return { unit, line, why: d.why, fee, buyer: CRAFT_LINES[line].buyer };
}
/** 채집 계열 생업 — 일한 날만큼 교역품을 얻는다 */
export const GATHER = { 채집: '약초 상자', 채광: '철광석 자루', 벌목: '목재 더미', 낚시: '건어물 상자', '사냥·해체': '모피 묶음' };

/* ── 장인 길드: 걸작 심사 · 주문 제작 ── */
/** 이 등급으로 오르려면 심사에 내야 하는 것 — [최소 품질, 품목의 최소 난도(필요 랭크)] */
export const MASTER_EXAM = { 3: ['명품', 2, '장인 심사 — 명품 이상, 중급 품목'], 4: ['걸작', 4, '명장 심사 — 걸작, 상급 품목'], 5: ['걸작', 6, '거장 심사 — 걸작, 최상급 품목'] };
export const examPassed = (st, rank) => !!st.orgs?.artisan?.exams?.[rank];
export function examFits(name, rank) {
    const ex = MASTER_EXAM[rank]; const g = findCraft(name); if (!ex || !g) return false;
    const qi = QUALITY.findIndex(q => q[0] === qualityOf(name));
    return qi >= QUALITY.findIndex(q => q[0] === ex[0]) && g[2] >= ex[1];
}
/** 이달의 주문 제작 — 내 기술에 맞는 주문이 이 시장에 붙는다 */
const CLIENTS_BY_LINE = {
    금속: ['황실 기사단 보급관', '위병대 병기고', '모험가 길드 무구 담당', '어느 백작가 집사', '그레이븐 변경백가 병참관'],
    '가죽·천': ['재봉 조합장', '극단 「은빛 가면」', '어느 자작 부인', '모험가 길드 보급계', '세렌포트 선원 조합'],
    나무: ['세렌포트 조선소', '궁수 연대 보급관', '새로 문 여는 여관 주인', '빛의 성교회 수도원'],
    음식: ['어느 남작가의 혼례 준비', '위병대 식당', '모험가 길드 원정대', '상인 길드 연회'],
    약: ['치유원 원장', '모험가 길드 원정대', '변경 요새 군의관', '어느 귀족가 주치의'],
};
export function craftOrders(st, day = st.day) {
    const market = marketOf(st.location); if (!market) return [];
    const ym = ymOf(day);
    const skills = Object.keys(st.life || {}).filter(k => lineOf(k));
    const out = [];
    for (const sk of skills) {
        const rank = st.life[sk].rank;
        const goods = CRAFT_GOODS.filter(g => g[1] === sk && g[2] <= rank + 1);
        const r = rng(hashStr(`order|${ym}|${market}|${sk}`)); r();
        const n = 1 + (r() < 0.6 ? 1 : 0);
        for (let i = 0; i < n; i++) {
            const g = goods[Math.floor(r() * goods.length)]; if (!g) continue;
            const line = lineOf(sk);
            const dm = deliveryDemand(st, line, market, day).mult;
            const qmin = QUALITY[Math.min(3, 1 + Math.floor(r() * 2) + (g[2] >= 4 ? 1 : 0))][0];
            const qty = Math.max(1, Math.round((g[4] >= 1 ? 3 + r() * 8 : 1 + r() * 2)));
            const unit = Math.round(g[3] * (QUALITY.find(q => q[0] === qmin)[1]) * (1.25 + r() * 0.35) * Math.max(0.9, dm));
            const days = Math.max(5, Math.ceil(qty / g[4]) + 5 + Math.floor(r() * 10));
            const client = CLIENTS_BY_LINE[line][Math.floor(r() * CLIENTS_BY_LINE[line].length)];
            const id = `${ym}|${market}|${sk}|${i}`;
            out.push({ id, client, item: g[0], skill: sk, qmin, qty, unit, total: unit * qty, days, market, taken: (st.commissions || []).some(c => c.id === id) });
        }
    }
    return out;
}

/* ───────────────────────── 생업: 일자리 · 땅과 집 ───────────────────────── */
/** 일자리 — [이름, 어디서(시장 정규식|'any'|'village'), 기본 일당(동), 기대는 능력치, 관련 생활 기술, 설명] */
export const WORKS = [
    ['날품팔이', 'any', 30, '근력', null, '짐 나르기, 담장 고치기, 무엇이든'],
    ['농장 일꾼', /브레이크|마을/, 35, '체력', null, '밭일. 수확철(9~10월)엔 일당이 오르고 겨울엔 일이 없다'],
    ['부두 하역꾼', /세렌포트|항구/, 50, '근력', null, '배에서 짐을 내린다. 폭풍이 오면 쉰다'],
    ['광산 인부', /바르그홀름|잿빛/, 70, '체력', '채광', '드워프 광산의 갱도 일. 고되지만 일당이 세다'],
    ['주점 악사', 'city', 40, '매력', '연주', '주점에서 연주하고 팁을 받는다. 손님이 많을수록 팁도 많다'],
    ['필경사', /제도|루미에른|세렌포트/, 60, '지능', null, '문서와 책을 베껴 쓴다. 글을 알아야 한다(지능 12 이상)'],
    ['치유원 조수', 'city', 50, '지능', '응급 치료', '치유원에서 환자를 돌본다. 역병이 돌면 일손이 귀하다'],
    ['마부', 'city', 45, '민첩', '승마', '마차를 몰고 말을 돌본다'],
    ['귀족가 시종', /제도|루미에른/, 60, '매력', null, '사교 시즌에 귀족 저택의 손님 시중. 소문을 듣기 좋다'],
    ['위병대 임시 경비', 'city', 55, '근력', null, '축제나 행사 때 늘리는 경비 인력'],
];
export function workPlaceOk(st, w) {
    const loc = st.location || '';
    if (w[1] === 'any') return placeKind(loc) !== 'wild';
    if (w[1] === 'city') return placeKind(loc) === 'city';
    return w[1].test(loc);
}
/** 그날 일당 */
export function workPay(st, w, day) {
    const mk = marketOf(st.location) || '제도 루미에른';
    const f = formatDate(day), wx = weatherOf(day, mk);
    let pay = w[2] * (1 + statMod(st.stats?.[w[3]] ?? 15) * 0.08);
    if (w[4]) pay *= 1 + Math.max(0, st.life?.[w[4]]?.rank ?? -1) * 0.25;
    const name = w[0];
    if (name === '농장 일꾼') { if (f.season === '겨울') return 0; if (f.m === 9 || f.m === 10) pay *= 1.6; }
    if (name === '부두 하역꾼' && ['폭우', '폭설'].includes(wx)) return 0;
    if (name === '주점 악사') pay *= crowdOf(mk, day).mult * (0.7 + rng(hashStr(`tip|${day}`))() * 0.8);
    if (name === '치유원 조수' && affairsOf(day).some(a => a.name === '역병')) pay *= 1.8;
    if (name === '귀족가 시종') { if (!seasonStatus(day).on) pay *= 0.5; }
    if (name === '위병대 임시 경비') { const c = crowdOf(mk, day); if (!c.why.some(x => /건국제|수확제/.test(x))) pay *= 0.6; else pay *= 1.5; }
    if (name === '필경사' && (st.stats?.지능 ?? 15) < 20) return 0;
    return Math.round(pay * (st.difficulty === 'easy' ? 1.3 : st.difficulty === 'hard' ? 0.85 : 1));
}
/** 땅과 집 — [이름, 시장, 값, 종류, 설명] · 달마다(또는 수확철에) 수입 */
export const ESTATES = [
    ['브레이크 마을 셋집', '브레이크 마을', 80000, 'rent', '세 들일 작은 집. 달마다 세를 받는다'],
    ['제도 셋집', '제도 루미에른', 250000, 'rent', '서민 구역의 이층집. 사교 시즌엔 세가 오른다'],
    ['세렌포트 창고', '항구도시 세렌포트', 180000, 'rent', '부두 옆 창고. 상단에 빌려준다'],
    ['바르그홀름 광산 지분', '바르그홀름', 500000, 'share', '드워프 광산의 지분. 달마다 배당(광산 낙반이면 없음)'],
];
export const findEstate = (name) => { const n = nospace(name); return ESTATES.find(e => nospace(e[0]) === n) || ESTATES.find(e => nospace(e[0]).includes(n)); };
function runEstatesMonth(st, before, log) {
    const f = formatDate(st.day), affs = affairsOf(st.day).map(a => a.name);
    let rent = 0;
    for (const es of st.estates || []) {
        const E0 = findEstate(es.name); if (!E0) continue;
        const [name, , price, kind] = E0;
        if (kind === 'rent') {
            let v = price * 0.008;
            if (name === '제도 셋집' && seasonStatus(st.day).on) v *= 1.3;
            if (rng(hashStr(`vac|${ymOf(st.day)}|${name}`))() < 0.1) { log.push({ k: 'info', t: `${name} — 이달은 세입자가 비었다` }); continue; }
            rent += Math.round(v);
        } else if (kind === 'share') {
            if (affs.includes('광산 낙반')) { log.push({ k: 'info', t: `${name} — 광산 낙반으로 이달 배당 없음` }); continue; }
            rent += Math.round(price * 0.009);
        } else if (kind === 'grain' && f.m === 10 && formatDate(before).m !== 10) {
            const mult = affs.includes('풍년 소식') ? 1.4 : affs.includes('흉작') ? 0.5 : 1;
            const units = Math.round(600 * mult);
            const sale = Math.round(units * (marketPrice(st, E0[1], '밀 자루') || 120) * 0.85) - 8000;
            st.money += sale;
            log.push({ k: 'gain', t: `${name} 수확 — 밀 자루 ${units}짐을 곡물상에 넘김 +${formatMoney(sale)} (일꾼 품삯 제함)${mult !== 1 ? ` · ${mult > 1 ? '풍년' : '흉작'}` : ''}` });
        } else if (kind === 'wine' && f.m === 9 && formatDate(before).m !== 9) {
            const units = Math.round(40 * (affs.includes('흉작') ? 0.6 : 1));
            const sale = Math.round(units * (marketPrice(st, '제도 루미에른', '와인 통') || 900) * 0.8);
            st.money += sale;
            log.push({ k: 'gain', t: `${name} — 올해 와인 ${units}통을 담가 제도 주류상에 넘김 +${formatMoney(sale)}` });
        }
    }
    if (rent) { st.money += rent; log.push({ k: 'gain', t: `땅과 집에서 들어온 돈 +${formatMoney(rent)}` }); }
}

/* ───────────────────────── 농장과 지주 ───────────────────────── */
/** 땅 한 필지 값 (지역마다 다르다) */
export const LAND_PRICE = { '제도 루미에른': 60000, '항구도시 세렌포트': 35000, '바르그홀름': 25000, '브레이크 마을': 20000, '곡물 도시 하벤': 18000, '엘름바트': 15000, '북부 변경': 12000 };
/** 지주 칭호 — 가진 땅의 필지 수 */
export const LANDLORD_TITLES = [[1, '자작농'], [5, '작은 지주'], [15, '지주'], [40, '대지주'], [100, '영지 같은 대지주']];
export const landTotal = (st) => (st.farms || []).reduce((a, f) => a + f.plots, 0);
export const landTitle = (st) => { const n = landTotal(st); let t = null; for (const [k, nm] of LANDLORD_TITLES) if (n >= k) t = nm; return t; };
/** 농산물 — [기본값(동), 상하는 빠르기(달, 0이면 오래 간다), 분류] */
export const FARM_GOODS = {
    '밀 자루': [120, 0, '곡물'], '보리 자루': [90, 0, '곡물'], '감자 자루': [60, 3, '곡물'], '채소 바구니': [80, 1, '채소'], '아마 다발': [150, 0, '원료'],
    '포도 상자': [200, 1, '과일'], '사과 상자': [120, 3, '과일'], '배 상자': [150, 2, '과일'], '체리 상자': [250, 1, '과일'], '자두 상자': [140, 1, '과일'],
    '달걀 바구니': [60, 1, '축산'], '치즈 덩이': [400, 0, '축산'], '양모 묶음': [350, 0, '원료'],
    '맥주 통': [250, 0, '술'], '와인 통': [900, 0, '술'], '사과주 통': [650, 0, '술'], '배주 통': [800, 0, '술'], '체리주 통': [1800, 0, '술'], '자두주 통': [750, 0, '술'],
};
/** 밭작물 — [이름, 거두는 달들, 자라는 데 드는 달, 필지당 수확, 나오는 것] */
export const FIELD_CROPS = [
    ['밀', [7], 8, 55, '밀 자루', '겨울을 나고 7월에 거둔다. 빵과 맥주의 바탕'],
    ['보리', [7], 5, 45, '보리 자루', '7월에 거둔다. 맥주를 빚는다'],
    ['감자', [9], 4, 80, '감자 자루', '북쪽에서도 잘 자란다. 9월 수확'],
    ['채소', [6, 9], 3, 20, '채소 바구니', '한 해 두 번 거둔다. 금방 시든다'],
    ['아마', [8], 4, 20, '아마 다발', '리넨 천의 재료. 8월 수확'],
];
/** 과수 — [과일, 거두는 달, 첫 열매까지 날, 필지당 수확, 나오는 것, 묘목값(필지당), 담글 술] */
export const ORCHARDS = [
    ['포도', 9, 720, 25, '포도 상자', 4000, '와인 통', '남부의 햇볕에서 달다. 와인이 된다'],
    ['사과', 9, 720, 30, '사과 상자', 3000, '사과주 통', '추운 땅에서도 잘 맺는다. 오래 간다'],
    ['배', 9, 720, 25, '배 상자', 3000, '배주 통', '물이 많고 달다'],
    ['체리', 6, 540, 15, '체리 상자', 5000, '체리주 통', '6월에 잠깐 열린다. 비싸지만 금방 무른다'],
    ['자두', 8, 360, 25, '자두 상자', 2500, '자두주 통', '빨리 열매를 맺는다'],
];
/** 가축 — [이름, 값, 하루 먹이(꼴을 사 먹일 때), 마리당 목초지(필지), 마리당 일손, 한 해 불어나는 비율, 설명] */
export const LIVESTOCK = [
    ['닭', 30, 0.5, 0, 0.005, 2, '달걀을 낳는다. 손이 덜 간다'],
    ['돼지', 300, 3, 0, 0.02, 1.2, '아무거나 먹고 빨리 불어난다. 내다 팔아 고기로'],
    ['양', 250, 4, 0.2, 0.02, 0.35, '5월에 털을 깎는다(두 마리에 양모 한 묶음)'],
    ['소', 1200, 12, 0.5, 0.08, 0.2, '젖으로 치즈를 만든다. 밭갈이도 한다'],
    ['짐말', 1500, 15, 0.5, 0.1, 0.15, '수레를 끌고 밭을 가는 일말. 혈통 있는 말은 마구간에서 따로 기른다'],
];
/** 지역 풍토 — 작물·과일이 잘 되는 정도 */
export const CLIMATE = {
    '브레이크 마을': { 포도: 1.25, 밀: 1.2, 보리: 1.1, 체리: 1.1, 자두: 1.1, 사과: 0.9 },
    '제도 루미에른': { 채소: 1.2, 배: 1.1 },
    '항구도시 세렌포트': { 아마: 1.15, 포도: 1.05, 감자: 1 },
    '바르그홀름': { 감자: 1.2, 보리: 1.1, 사과: 1.1, 포도: 0.6, 밀: 0.8, 체리: 0.8 },
    '북부 변경': { 감자: 1.2, 사과: 1.15, 포도: 0.3, 밀: 0.6, 체리: 0.6, 아마: 1.1 },
    '곡물 도시 하벤': { 밀: 1.3, 보리: 1.15, 포도: 1.35, 체리: 1.1, 자두: 1.15, 감자: 0.9 },
    '엘름바트': { 사과: 1.1, 감자: 1.05, 배: 1.05, 포도: 0.7, 밀: 0.85 },
};
/** 술 담그기 — 원료 몇 개로 한 통 */
export const BREW = { '와인 통': ['포도 상자', 3, 6, 0.25], '사과주 통': ['사과 상자', 4, 1, 0.3], '배주 통': ['배 상자', 4, 1, 0.3], '체리주 통': ['체리 상자', 5, 5, 0.2], '자두주 통': ['자두 상자', 4, 2, 0.2], '맥주 통': ['보리 자루', 2, 0, 0] }; // [원료, 개수, 묵힐수록 오르는 최대 해, 해마다 오르는 몫]
export const WORKER_WAGE = 600, STEWARD_WAGE = 1500, TENANT_RENT = 0.006;
export const findFarm = (st, name) => (st.farms || []).find(f => nospace(f.name) === nospace(name)) || (st.farms || []).find(f => nospace(f.name).includes(nospace(name)));
const climate = (f, crop) => CLIMATE[f.market]?.[crop] ?? 1;
export const findCrop = (n) => FIELD_CROPS.find(c => nospace(n).startsWith(c[0]));
export const findOrchard = (n) => ORCHARDS.find(c => nospace(n).startsWith(c[0]));
export const findStock = (n) => LIVESTOCK.find(c => nospace(n).startsWith(c[0])) || (/^(일)?말/.test(nospace(n)) ? LIVESTOCK.find(c => c[0] === '짐말') : null);
export function findFarmGood(n) { const s = nospace(n); return Object.keys(FARM_GOODS).find(k => nospace(k) === s) || Object.keys(FARM_GOODS).find(k => nospace(k).startsWith(s) || s.startsWith(nospace(k).split('통')[0].replace(/상자|자루|바구니|덩이|묶음|다발/, ''))); }
/** 땅 쓰임 */
export function farmUse(f) {
    const fields = (f.fields || []).reduce((a, x) => a + x.plots, 0);
    const orch = (f.orchards || []).reduce((a, x) => a + x.plots, 0);
    const used = fields + orch + (f.pasture || 0) + (f.tenant || 0);
    return { fields, orch, pasture: f.pasture || 0, tenant: f.tenant || 0, free: f.plots - used, used };
}
export function farmLabor(st, f) {
    const u = farmUse(f);
    let need = u.fields * 0.15 + u.orch * 0.12;
    for (const a of LIVESTOCK) need += ((f.herd?.[a[0]] || 0) + (a[0] === '짐말' ? (f.stable || []).length : 0)) * a[4];
    const here = marketOf(st.location) === f.market;
    const have = (f.workers || 0) + (here ? 2 : 0) + (f.kin ? 2 : 0);
    return { need: Math.round(need * 10) / 10, have, here, ratio: need ? Math.min(1, have / need) : 1 };
}
export function farmFeed(f) {
    let pastureNeed = 0, food = 0;
    const cnt = (a) => (f.herd?.[a[0]] || 0) + (a[0] === '짐말' ? (f.stable || []).length : 0);
    for (const a of LIVESTOCK) pastureNeed += cnt(a) * a[3];
    const cover = pastureNeed ? Math.min(1, (f.pasture || 0) / pastureNeed) : 1;
    for (const a of LIVESTOCK) { const n = cnt(a); food += n * a[2] * (a[3] ? (cover * 0.2 + (1 - cover)) : 1); }
    return { pastureNeed: Math.round(pastureNeed * 10) / 10, cover, monthly: Math.round(food * 30) };
}
export const farmMonthlyCost = (st, f) => (f.workers || 0) * WORKER_WAGE + (f.steward ? STEWARD_WAGE : 0) + farmFeed(f).monthly;
/** 술의 값 — 묵힌 햇수와 빚은 솜씨 */
export function drinkValue(lot, day) {
    const b = BREW[lot.drink], base = FARM_GOODS[lot.drink][0];
    const yrs = Math.max(0, (day - lot.day) / 360);
    const age = b ? 1 + Math.min(b[2], yrs) * b[3] : 1;
    return Math.round(base * (lot.q || 1) * age);
}
export const drinkAge = (lot, day) => Math.floor(Math.max(0, day - lot.day) / 360);
/** 이 농장에서 내다 파는 값 */
export function farmPrice(st, f, good, day = st.day) {
    const tg = findTrade(good);
    let p = tg ? marketPrice(st, f.market, good, day) : FARM_GOODS[good]?.[0];
    if (!p) return 0;
    const m = formatDate(day).m, cat = FARM_GOODS[good]?.[2];
    if (!tg) {
        if (f.market === '제도 루미에른' && /과일|축산|술/.test(cat)) p *= 1.2;
        if (f.market === '북부 변경' && cat === '과일') p *= 1.25;
        const affs = affairsOf(day).map(a => a.name);
        if (affs.includes('흉작') && /곡물|채소|과일/.test(cat)) p *= 1.35;
        if (affs.includes('풍년 소식') && /곡물|채소|과일/.test(cat)) p *= 0.8;
        if (affs.includes('사교 시즌') && cat === '술') p *= 1.2;
        p *= 0.92 + rng(hashStr(`fp|${ymOf(day)}|${f.market}|${good}`))() * 0.16;
    }
    const glut = ORCHARDS.find(o => o[4] === good && o[1] === m) || FIELD_CROPS.find(c => c[4] === good && c[1].includes(m));
    if (glut) p *= 0.8; // 수확철엔 모두가 내다 판다
    return Math.max(1, Math.round(p * 0.9));
}
const monthStarts = (from, to) => { const out = []; for (let d = from + 1; d <= to; d++) if ((60 + d) % 30 === 0) out.push(d); return out; };
/** 달마다 — 품삯·꼴값, 소작료, 수확, 가축, 상한 농산물 */
function runFarmsMonth(st, day, log) {
    const m = formatDate(day).m, affs = affairsOf(day).map(a => a.name);
    const luck = affs.includes('풍년 소식') ? 1.3 : affs.includes('흉작') ? 0.55 : 1;
    for (const f of st.farms || []) {
        f.store = f.store || {}; f.herd = f.herd || {}; f.breed = f.breed || {};
        const got = {}, notes = [];
        // 상하는 것부터
        for (const [g, q] of Object.entries(f.store)) { const per = FARM_GOODS[g]?.[1]; if (per && q > 0) { const lost = Math.ceil(q * (per === 1 ? 0.6 : per === 2 ? 0.35 : 0.25)); f.store[g] = q - lost; if (lost) notes.push(`${g} ${lost}개 상함`); } if (f.store[g] <= 0) delete f.store[g]; }
        const L = farmLabor(st, f), work = Math.max(0.3, L.ratio);
        const dry = f.drought === ymOf(day) ? 0.65 : 1;
        const farmR = st.life?.농사?.rank ?? 0, herdR = st.life?.목축?.rank ?? 0;
        const skill = 0.8 + farmR * 0.06;
        // 돈
        const cost = farmMonthlyCost(st, f);
        const rent = Math.round((f.tenant || 0) * (LAND_PRICE[f.market] || 20000) * TENANT_RENT);
        const net = rent - cost;
        if (net >= 0 || st.money >= -net) st.money += net;
        else { st.money = 0; if (f.workers) { const q = Math.ceil(f.workers / 2); f.workers -= q; notes.push(`품삯을 못 받은 일꾼 ${q}명이 떠남`); } }
        // 밭
        for (const fl of f.fields || []) {
            const c = findCrop(fl.crop); if (!c || !c[1].includes(m)) continue;
            const months = Math.floor((day - fl.since) / 30);
            const grow = Math.min(1, months / c[2]);
            if (grow < 0.25) continue;
            const n = Math.round(fl.plots * c[3] * grow * climate(f, c[0]) * luck * skill * work * dry);
            if (n > 0) got[c[4]] = (got[c[4]] || 0) + n;
            fl.since = day;
        }
        // 과수원
        for (const o of f.orchards || []) {
            const c = findOrchard(o.fruit); if (!c || c[1] !== m) continue;
            if (day - o.planted < c[2]) { notes.push(`${o.fruit} 나무는 아직 어리다 (첫 열매까지 ${Math.ceil((c[2] - (day - o.planted)) / 30)}달)`); continue; }
            const ageY = (day - o.planted) / 360;
            const n = Math.round(o.plots * c[3] * Math.min(1.2, 0.7 + ageY * 0.1) * climate(f, c[0]) * luck * skill * Math.max(0.5, work) * dry);
            if (n > 0) got[c[4]] = (got[c[4]] || 0) + n;
        }
        // 가축
        const feed = farmFeed(f), hs = (0.85 + herdR * 0.05) * Math.max(0.5, work);
        if (f.herd.닭) got['달걀 바구니'] = (got['달걀 바구니'] || 0) + Math.round(f.herd.닭 * 0.8 * hs);
        if (f.herd.소) got['치즈 덩이'] = (got['치즈 덩이'] || 0) + Math.round(f.herd.소 * 0.6 * hs);
        if (m === 5 && f.herd.양) got['양모 묶음'] = (got['양모 묶음'] || 0) + Math.round(f.herd.양 / 2 * hs * (feed.cover < 0.5 ? 0.7 : 1));
        for (const a of LIVESTOCK) {
            const n = f.herd[a[0]] || 0; if (n < 2) continue;
            // 우리와 일손이 받쳐 주는 만큼만 불어난다
            const roof = a[0] === '닭' ? 30 * (1 + (f.workers || 0)) : a[0] === '돼지' ? 10 * (1 + (f.workers || 0)) : Infinity;
            if (n >= roof || L.ratio < 0.9 || (a[3] && feed.cover < 0.9)) continue;
            f.breed[a[0]] = (f.breed[a[0]] || 0) + n * a[5] / 12 * hs;
            const born = Math.floor(f.breed[a[0]]);
            if (born > 0) { f.herd[a[0]] = n + born; f.breed[a[0]] -= born; notes.push(`${a[0]} ${born}마리 태어남`); }
        }
        runStableMonth(st, f, day, log, L, feed);
        for (const [g, q] of Object.entries(got)) f.store[g] = (f.store[g] || 0) + q;
        supplyShops(st, f, log);
        const gotTxt = Object.entries(got).filter(([, q]) => q > 0).map(([g, q]) => `${g} ${q}`).join(', ');
        log.push({ k: net >= 0 ? 'gain' : 'loss', t: `${f.name} — ${m}월${gotTxt ? ` · 거둠: ${gotTxt}` : ''}${rent ? ` · 소작료 +${formatMoney(rent)}` : ''}${cost ? ` · 품삯·꼴값 -${formatMoney(cost)}` : ''}${L.ratio < 1 ? ` · 일손 모자람(${Math.round(L.ratio * 100)}%)` : ''}${notes.length ? ` · ${notes.join(', ')}` : ''}` });
        if (L.here) { trainLife(st, '농사', 2, log); if (Object.values(f.herd).some(n => n > 0)) trainLife(st, '목축', 1, log); }
    }
}

/* ───────────────────────── 가게 운영 ───────────────────────── */
/** 가게 등급 — [이름, 필요한 상인 길드 등급, 개업비, 하루 유지비, 하루 팔 수 있는 양(원가 기준)] */
export const SHOP_TIERS = {
    노점: { need: -1, open: 500, upkeep: 10, cap: 150, desc: '장터 한 귀퉁이의 좌판. 주인이나 점원이 지켜야 팔린다' },
    점포: { need: 1, open: 50000, upkeep: 60, cap: 600, desc: '거리에 간판을 단 가게. 점원이 있으면 주인 없이도 돌아간다' },
    상회: { need: 2, open: 1000000, upkeep: 600, cap: 1800, desc: '창고와 점포, 거래처를 거느린 상회. 지점과 상단을 꾸린다' },
};
/** 업종 — [이문(원가 대비), 회전(팔리는 속도), 설명] */
export const SHOP_KINDS = {
    잡화: [0.35, 1, '생활 도구와 자잘한 물건'],
    식료품: [0.25, 1.35, '빵·소금·건어물. 빨리 팔리지만 이문이 적다'],
    '옷·직물': [0.45, 0.8, '옷감과 옷. 이문이 크고 천천히 팔린다'],
    '무기·방구': [0.4, 0.75, '모험가와 위병이 단골'],
    약재: [0.5, 0.7, '약초와 물약. 역병이 돌면 불티난다'],
    교역품: [0.2, 2, '교역품 도매. 많이 팔지만 이문이 얇다'],
    // ── 손기술로 꾸리는 가게: 주인의 생활 기술 랭크가 이문·평판·가게 크기를 정한다 ──
    식당: [0.45, 0.75, '음식을 만들어 판다. 요리 실력이 곧 평판', '요리', ['포장마차', '식당', '이름난 식당']],
    여관: [0.5, 0.75, '방과 식사를 판다. 주인은 제 여관에서 공짜로 묵는다', '요리', ['민박', '여관', '큰 여관']],
    주점: [0.5, 0.95, '술과 안주. 노랫소리가 있으면 손님이 는다', '요리', ['선술집', '주점', '이름난 주점']],
    대장간: [0.55, 0.7, '직접 벼린 무기와 갑옷, 연장을 팔고 고쳐 준다', '대장일', ['떠돌이 대장장이', '대장간', '이름난 대장간']],
    재봉집: [0.55, 0.8, '옷을 짓고 고쳐 판다', '재봉', ['재봉 좌판', '재봉집', '의상실']],
    '가죽 공방': [0.5, 0.8, '가죽 갑옷·가방·장화를 만든다', '가죽 공예', ['가죽 좌판', '가죽 공방', '이름난 가죽 공방']],
    목공방: [0.45, 0.8, '가구·활·방패를 깎는다', '목공', ['목공 좌판', '목공방', '이름난 목공방']],
    세공방: [0.7, 0.5, '반지·목걸이 같은 장신구를 만든다', '세공', ['세공 좌판', '세공방', '보석상']],
    약방: [0.6, 0.8, '직접 조합한 물약과 약을 판다', '연금술', ['약 좌판', '약방', '이름난 약방']],
};
/** 손기술 가게의 크기별 필요 랭크 (노점급 F · 점포급 D · 상회급 B) */
export const CRAFT_NEED = { 노점: 1, 점포: 3, 상회: 5 };
export const isCraftShop = (kind) => !!SHOP_KINDS[kind]?.[3];
export const shopTierName = (s) => SHOP_KINDS[s.kind]?.[4]?.[Object.keys(SHOP_TIERS).indexOf(s.tier)] || s.tier;
export const ownerRank = (st, s) => isCraftShop(s.kind) ? (st.life?.[SHOP_KINDS[s.kind][3]]?.rank ?? -1) : -1;
/** 이 크기의 가게를 열 수 있는지 — 장사 가게는 상인 길드 등급, 손기술 가게는 기술 랭크 */
export function canRunTier(st, kind, tier) {
    const T = SHOP_TIERS[tier]; if (!T) return { ok: false, why: '없는 등급' };
    if (isCraftShop(kind)) {
        const sk = SHOP_KINDS[kind][3], r = st.life?.[sk]?.rank ?? -1;
        return r >= CRAFT_NEED[tier] ? { ok: true } : { ok: false, why: `${sk} ${LIFE_RANKS[CRAFT_NEED[tier]]} 랭크 이상` };
    }
    const mr = st.orgs?.merchant ? st.orgs.merchant.rank : -1;
    if (T.need >= 0 && isSuspended(st, 'merchant')) return { ok: false, why: '상인 길드 영업 정지 중' };
    return mr >= T.need ? { ok: true } : { ok: false, why: `상인 길드 ${ORGS.merchant.ranks[T.need]} 이상` };
}
/** 주인이 이 가게에 머물면 생활비가 들지 않는 가게 */
export const innHere = (st) => (st.shops || []).some(s => s.kind === '여관' && marketOf(st.location) === s.market);
const MARKET_SIZE = { '제도 루미에른': 1.5, '항구도시 세렌포트': 1.3, '바르그홀름': 1.0, '브레이크 마을': 0.6, '곡물 도시 하벤': 0.9, '엘름바트': 0.7, '북부 변경': 0.8 };
export const WAGE = { 노점: 25, 점포: 40, 상회: 70 };
export const findShop = (st, name) => (st.shops || []).find(s => nospace(s.name) === nospace(name)) || (st.shops || []).find(s => nospace(s.name).includes(nospace(name)));
/* ── 식당·주점·여관: 메뉴, 소문(명성), 자리(구역) ── */
export const FOOD_KINDS = ['식당', '주점', '여관'];
export const isFoodShop = (s) => FOOD_KINDS.includes(typeof s === 'string' ? s : s?.kind);
/** 요리 — [이름, 필요한 요리 랭크, 맛(손님을 끄는 힘 1~5), 제철(없으면 사철), 값(원가 대비 배수), 설명] */
export const RECIPES = [
    ['보리죽', 0, 1, null, 0.8, '배를 채우는 값싼 죽'],
    ['감자 스튜', 0, 1, null, 0.9, '어느 집에나 있는 냄비 요리'],
    ['구운 빵과 양파 수프', 1, 2, null, 1, '갓 구운 빵에 진한 양파 수프'],
    ['양고기 스튜', 1, 2, null, 1.1, '향초를 넣어 오래 끓인 스튜'],
    ['소시지와 절인 양배추', 1, 2, null, 1, '맥주 안주로 으뜸'],
    ['생선 구이', 2, 2, null, 1.1, '소금만 쳐서 굽는다. 항구에서는 싱싱하다'],
    ['봄나물 오믈렛', 2, 3, '봄', 1.1, '봄에만 나는 들나물을 넣은 오믈렛'],
    ['차가운 오이 수프', 2, 3, '여름', 1.1, '우물물에 식힌 여름 수프'],
    ['꿀 바른 닭 구이', 3, 3, null, 1.2, '겉은 바삭하고 달다'],
    ['버섯 파이', 3, 3, '가을', 1.2, '숲에서 딴 가을 버섯을 가득 채운 파이'],
    ['사슴고기 파이', 3, 4, '겨울', 1.3, '사냥철 사슴고기와 붉은 열매'],
    ['향신료 고기 찜', 4, 4, null, 1.35, '남쪽 향신료로 재운 고기를 쪄 낸다'],
    ['크림 생선 스튜', 4, 4, null, 1.3, '버터와 크림으로 끓인 흰 살 생선'],
    ['붉은 포도주 소고기 조림', 5, 5, null, 1.6, '하루를 꼬박 졸인 소고기'],
    ['꿩 구이와 과일 소스', 5, 5, '가을', 1.7, '귀족의 사냥 요리를 흉내 낸 접시'],
    ['귀족풍 다섯 접시', 6, 5, null, 2.2, '전채부터 후식까지 차례로 내는 코스'],
    ['궁정식 일곱 코스', 8, 5, null, 3, '황궁 연회의 차림을 그대로 — 궁정 요리장이나 낸다'],
];
export const findRecipe = (name) => { const n = nospace(name); return RECIPES.find(r => nospace(r[0]) === n) || RECIPES.find(r => nospace(r[0]).includes(n) || n.includes(nospace(r[0]))); };
export const MENU_SLOTS = { 노점: 3, 점포: 6, 상회: 10 };
export const inSeasonDish = (r, day) => !r[3] || formatDate(day).season === r[3];
/** 소문(명성) 단계 */
export const FAME_TIERS = [[0, '동네 식당'], [15, '소문난 집'], [35, '이름난 맛집'], [60, '명소'], [85, '귀족도 찾는 집']];
export const fameTier = (f) => { let t = FAME_TIERS[0][1]; for (const [n, name] of FAME_TIERS) if ((f || 0) >= n) t = name; return t; };
/** 주인의 요리 랭크가 닿을 수 있는 소문의 끝 */
export const fameCap = (rank) => Math.min(100, 15 + Math.max(0, rank) * 12);
/** 가게 자리 — [손님 수, 받는 값, 유지비, 옮기는 비용(가게 크기의 개업비 대비)] */
export const DISTRICTS = {
    골목: { cap: 0.85, price: 0.9, upkeep: 0.8, move: 0.15, desc: '세가 싸고 단골 장사. 소문이 나야 사람이 찾아온다' },
    시장통: { cap: 1.1, price: 1, upkeep: 1, move: 0.3, desc: '장보러 온 사람들이 오가며 들른다' },
    대로: { cap: 1.25, price: 1.1, upkeep: 1.4, move: 0.6, desc: '큰길가. 지나는 사람이 많고 세도 비싸다' },
    '백은 구역': { cap: 0.75, price: 1.7, upkeep: 2.5, move: 1.2, capital: true, fame: 50, desc: '제도의 부자 동네. 손님은 적지만 한 접시 값이 다르다' },
};
export const districtOf = (s) => DISTRICTS[s.district] ? s.district : '시장통';
/** 지금 메뉴판이 손님을 얼마나 끄는지 */
export function menuInfo(st, s, day = st.day) {
    const rank = Math.max(0, ownerRank(st, s));
    const slots = MENU_SLOTS[s.tier] || 3;
    const list = (s.menu || []).map(n => findRecipe(n)).filter(Boolean);
    const live = list.filter(r => inSeasonDish(r, day) && rank >= r[1]);
    if (!live.length) return { slots, list, live, appeal: 0, cap: list.length ? 0.5 : 0.4, price: 0.8, sig: null };
    const sig = s.signature && live.find(r => r[0] === s.signature) || null;
    const ap = live.map(r => r[2] + (r[3] ? 0.5 : 0) + (sig === r ? 1 : 0) + (s.homegrown === ymOf(day) ? 0.4 : 0));
    const appeal = ap.reduce((a, b) => a + b, 0) / ap.length;
    const fill = Math.min(1, live.length / slots);
    const price = live.reduce((a, r) => a + r[4], 0) / live.length * (sig ? 1.05 : 1);
    return { slots, list, live, appeal, cap: 0.55 + appeal * 0.09 + fill * 0.3, price, sig };
}
/** 소문(명성)이 손님과 값에 얹는 몫 */
export function foodMult(st, s, day = st.day) {
    const m = menuInfo(st, s, day), d = DISTRICTS[districtOf(s)], f = s.fame || 0;
    let cap = m.cap * d.cap * (1 + f / 250), price = m.price * d.price * (1 + f / 400);
    if (districtOf(s) === '백은 구역' && f < 60) cap *= 0.6 + f / 150; // 부자들은 이름을 보고 온다
    if (st.patron?.role === '어용 식당' && FOOD_KINDS.includes(s.kind)) { cap *= 1.2; price *= 1.15; }
    return { cap, price, menu: m, district: d };
}
/** 오늘 이 가게가 팔 수 있는 양(원가 기준) */
export function shopCapacity(st, s, day = st.day) {
    const t = SHOP_TIERS[s.tier], k = SHOP_KINDS[s.kind] || SHOP_KINDS.잡화;
    const here = marketOf(st.location) === s.market;
    const craft = isCraftShop(s.kind);
    // 손기술 가게는 주인이 직접 만들어야 제값을 한다 — 제자·일꾼만으로는 절반
    const chefAway = st.patron?.role === '전속 요리사' && isFoodShop(s);
    const hands = (craft ? (here && !chefAway ? 1 : 0) + s.staff * 0.5 : s.staff + (here ? 1 : 0)) + (s.kin ? (craft ? 0.8 : 1) : 0);
    if (!hands) return 0;
    let cap = t.cap * (MARKET_SIZE[s.market] ?? 0.8) * k[1] * (0.8 + s.rep / 250) * Math.min(1.3, 0.75 + hands * 0.15);
    if (here && !chefAway) cap *= craft ? 1.15 : 1.05;
    if (isFoodShop(s)) cap *= Math.sqrt(foodMult(st, s, day).cap);
    if (s.rival === ymOf(day)) cap *= 0.85;
    if (s.tier === '노점' && merchantRank(st) >= 1) cap *= 1.2; // 장터 좋은 자리
    if (st.patron?.role === '전속 상인') cap *= 1.15; // 가문의 간판
    for (const a of affairsOf(day)) {
        if (a.name === '역병' && s.kind === '약재') cap *= 1.8;
        if (a.name === '사교 시즌' && s.kind === '옷·직물' && s.market === '제도 루미에른') cap *= 1.5;
        if (a.name === '흉작' && s.kind === '식료품') cap *= 1.3;
        if (a.name === '전쟁 소문' && s.kind === '무기·방구') cap *= 1.5;
    }
    const cr = crowdOf(s.market, day);
    cap *= s.kind === '여관' && cr.why.some(w => /건국제|수확제/.test(w)) ? cr.mult * 1.2 : cr.mult;
    const r = rng(hashStr(`shop|${s.name}|${day}`));
    return Math.round(cap * (0.85 + r() * 0.3));
}
/** 하루 장사 — 날짜가 넘어갈 때 하루씩 돌린다 */
function runShops(st, day, acc) {
    for (const s of st.shops || []) {
        const t = SHOP_TIERS[s.tier], k = SHOP_KINDS[s.kind] || SHOP_KINDS.잡화;
        const capToday = shopCapacity(st, s, day);
        // 자동 보충 — 점원이 금고(모자라면 주인 돈)로 재고를 채워 둔다
        if (s.auto && capToday > 0 && s.stock < capToday * s.auto * 0.5) {
            const away = marketOf(st.location) !== s.market;
            const want = Math.round(capToday * s.auto - s.stock);
            const fee = away ? 1.08 : 1; // 주인이 없으면 도매상 웃돈
            const fromTill = Math.min(Math.max(0, s.till), Math.round(want * fee));
            const fromMoney = Math.min(st.money, Math.round(want * fee) - fromTill);
            const bought = Math.floor((fromTill + fromMoney) / fee);
            if (bought > 0) { s.till -= fromTill; st.money -= fromMoney; s.stock += bought; const a0 = acc[s.name] = acc[s.name] || { sales: 0, cost: 0, empty: 0 }; a0.restock = (a0.restock || 0) + bought; }
        }
        const sold = Math.min(s.stock, capToday);
        const craft = isCraftShop(s.kind), rank = Math.max(0, ownerRank(st, s));
        const here = marketOf(st.location) === s.market;
        const food = isFoodShop(s), fm = food ? foodMult(st, s, day) : null;
        const margin = (craft ? k[0] * (0.7 + rank * 0.08) : k[0]) * (fm ? 1 + (fm.price - 1) * 0.5 : 1);
        const mascot = (st.companions || []).some(c => c.pet && c.home === s.name);
        const revenue = Math.round(sold * (1 + margin) * (mascot ? 1.05 : 1));
        st.monthSales = (st.monthSales || 0) + revenue;
        const cost = Math.round((s.tier === '노점' && merchantRank(st) >= 1 ? t.upkeep / 2 : t.upkeep) * (food ? DISTRICTS[districtOf(s)].upkeep : 1)) + s.staff * (WAGE[s.tier] || 40);
        s.stock -= sold; s.till += revenue - cost;
        s.lastSales = revenue;
        const a = acc[s.name] = acc[s.name] || { sales: 0, cost: 0, empty: 0 };
        a.sales += revenue; a.cost += cost;
        if (s.stock <= 0) { s.rep = Math.max(0, s.rep - 2); a.empty++; }
        else if (sold > 0) s.rep = Math.min(100, s.rep + (craft ? (0.1 + rank * 0.03) * (here ? 1.5 : 1) : 0.15) + (mascot ? 0.05 : 0));
        const cooking = here && st.patron?.role !== '전속 요리사';
        if (craft && sold > 0 && (cooking || (food && st.patron?.role === '전속 요리사'))) { a.train = (a.train || 0) + 1; a.skill = k[3]; }
        if (food) {
            // 소문 — 맛있는 접시와 주인의 솜씨가 쌓아 올리고, 문을 닫으면 잊힌다
            const f0 = s.fame || 0, capF = fameCap(rank);
            if (s.stock <= 0 || !sold) s.fame = Math.max(0, f0 - 0.25);
            else if (f0 < capF) {
                const g = (0.04 + rank * 0.035 + fm.menu.appeal * 0.03 + (fm.menu.sig ? 0.08 : 0)) * (cooking ? 1 : 0.4) * (st.patron?.role === '어용 식당' ? 1.3 : 1);
                s.fame = Math.min(capF, f0 + g);
            }
            for (const [n, name] of FAME_TIERS) if (n > 0 && f0 < n && s.fame >= n) (a.fame = a.fame || []).push(name);
        }
        if (s.till < 0) s.debtDays = (s.debtDays || 0) + 1; else s.debtDays = 0;
    }
}

/* ── 거래 (물물교환) ── */
/** <상품>상대 | 물건 값, 물건 값</상품> — GM이 보여 주는 상대의 물건 */
export function parseWares(text) {
    const blocks = extractBlocks(text, '상품');
    if (!blocks.length) return null;
    const b = blocks[blocks.length - 1].trim();
    const [who, rest = ''] = b.includes('|') ? b.split(/\s*[|｜]\s*/, 2) : ['', b];
    const items = rest.split(/\s*[,，\n]\s*/).map(x => x.trim()).filter(Boolean).map(x => {
        const m = x.match(/^(.*?)\s*((?:\d[\d,]*\s*(?:백금|금|은|동)\s*)+)\s*$/);
        const name = (m ? m[1] : x).replace(/[:：\-–]\s*$/, '').trim();
        const price = m ? parseMoney(m[2])?.value || null : null;
        return { name, price };
    }).filter(x => x.name);
    return { who: who.trim(), items };
}
/** <거래>수락</거래> / <거래>거절</거래> */
export function parseVerdict(text) {
    const blocks = extractBlocks(text, '거래');
    if (!blocks.length) return null;
    const b = blocks[blocks.length - 1];
    return /수락|성사|좋다|승낙/.test(b) ? 'accept' : /거절|결렬|싫/.test(b) ? 'reject' : null;
}
/** 거래 제안 → <변동> 줄 */
export function offerLines(o) {
    const L = [];
    for (const g of o.give || []) if (g.qty > 0) L.push(`아이템 -${g.name} ${g.qty}`);
    for (const g of o.get || []) if (g.qty > 0) L.push(`아이템 +${g.name} ${g.qty}`);
    const net = (o.getMoney || 0) - (o.giveMoney || 0);
    if (net > 0) L.push(`돈 +${formatMoney(net)}`); else if (net < 0) L.push(`돈 -${formatMoney(-net)}`);
    return L;
}
export function offerText(o) {
    const side = (list, money) => [...(list || []).filter(g => g.qty > 0).map(g => `${g.name}${g.qty > 1 ? ` ×${g.qty}` : ''}`), ...(money ? [formatMoney(money)] : [])].join(', ') || '없음';
    return `[거래 제안 → ${o.with || '상대'}] 내가 주는 것: ${side(o.give, o.giveMoney)} / 받고 싶은 것: ${side(o.get, o.getMoney)}`;
}

/* ───────────────────────── 변동 적용 ───────────────────────── */

function splitItemArg(arg) {
    let s = String(arg).trim();
    let sign = '+';
    if (/^[+\-−–]/.test(s)) { sign = /^\+/.test(s) ? '+' : '-'; s = s.slice(1).trim(); }
    let qty = 1;
    let m = s.match(/^(.*?)\s*[x×*]\s*(\d+)\s*$/i);
    if (m) { s = m[1]; qty = parseInt(m[2]); }
    else {
        m = s.match(/^(.*\S)\s+(\d+)\s*(?:개|병|장|자루|벌|묶음|권|마리|통|포대|쌍|알)?\s*$/);
        if (m) { s = m[1]; qty = parseInt(m[2]); }
    }
    return { sign, name: s.replace(/\s+/g, ' ').trim(), qty: Math.max(1, qty) };
}

function splitPlusMinus(arg) {
    let s = String(arg).trim();
    let sign = '+';
    if (/^[+\-−–]/.test(s)) { sign = /^\+/.test(s) ? '+' : '-'; s = s.slice(1).trim(); }
    return { sign, body: s };
}

function bigramSim(a, b) {
    const bg = (s) => { const o = []; for (let i = 0; i < s.length - 1; i++) o.push(s.slice(i, i + 2)); return o; };
    const A = bg(a), B = bg(b);
    if (!A.length || !B.length) return a === b ? 1 : 0;
    const pool = [...B]; let hit = 0;
    for (const x of A) { const j = pool.indexOf(x); if (j >= 0) { hit++; pool.splice(j, 1); } }
    return (2 * hit) / (A.length + B.length);
}

function findByName(list, name, key = 'name') {
    const n = nospace(name);
    let i = list.findIndex(x => nospace(x[key]) === n);
    if (i < 0) i = list.findIndex(x => nospace(x[key]).includes(n) || n.includes(nospace(x[key])));
    if (i < 0) {
        let best = -1, score = 0.6;
        list.forEach((x, j) => { const s = bigramSim(nospace(x[key]), n); if (s >= score) { score = s; best = j; } });
        i = best;
    }
    return i;
}

function gainExp(st, amount, log) {
    if (amount > 0 && hasPerk(st, '성장 가속')) amount = Math.round(amount * 1.5);
    if (!st.classes?.[st.cls]) return;
    classGain(st, st.cls, amount, log, `경험(${st.cls})`);
    if (amount > 0 && st.sub && st.classes[st.sub] && st.sub !== st.cls) {
        const part = Math.floor(amount * 0.25);
        if (part) classGain(st, st.sub, part, log, `경험(${st.sub}·보조)`);
    }
    syncClass(st);
}

/** 상태에 변동 목록을 적용(제자리 수정). 로그 배열 반환 */
export function applyOps(st, ops) {
    const log = [];
    if (!st.visited) { st.visited = {}; const p0 = placeExact(st.location); if (p0) st.visited[p0[0]] = st.day; }
    if (!st.seenSpots) { st.seenSpots = {}; const [a, b] = String(st.location || '').split(' · '); if (/제도|루미에른/.test(a) && b) st.seenSpots[b.trim()] = st.day; }
    for (const op of ops) {
        const n0 = log.length, loc0 = st.location;
        try { applyOne(st, op, log); }
        catch (e) { log.push({ k: 'warn', t: `해석 실패: ${op.raw}` }); }
        checkFaint(st, log);
        if (st.location !== loc0) markVisited(st, log);
        chronicleFrom(st, log.slice(n0));
    }
    if ((st.pacts || []).length) checkPacts(st, log);
    syncClass(st);
    st.hp = Math.max(0, Math.min(maxHP(st), st.hp));
    st.mp = Math.max(0, Math.min(maxMP(st), st.mp));
    return log;
}

function applyOne(st, op, log) {
    const { key, arg } = op;
    switch (key) {
        case 'money': {
            const p = parseMoney(arg); if (!p) throw 0;
            const before = st.money;
            st.money = p.mode === 'set' ? p.value : st.money + p.value;
            if (st.money < 0) st.money = 0;
            const d = st.money - before;
            log.push({ k: d >= 0 ? 'gain' : 'loss', t: `${d >= 0 ? '+' : '-'}${formatMoney(Math.abs(d))}` });
            break;
        }
        case 'exp': {
            const p = parseNum(arg); if (!p) throw 0;
            gainExp(st, p.mode === 'set' ? p.value - st.exp : p.value, log);
            break;
        }
        case 'hp': case 'mp': {
            const p = parseNum(arg); if (!p) throw 0;
            const max = key === 'hp' ? maxHP(st) : maxMP(st);
            const before = st[key];
            st[key] = p.mode === 'max' ? max : p.mode === 'set' ? p.value : st[key] + p.value;
            st[key] = Math.max(0, Math.min(max, st[key]));
            const d = st[key] - before;
            if (d !== 0) log.push({ k: d > 0 ? 'gain' : 'loss', t: `${key.toUpperCase()} ${d > 0 ? '+' : ''}${d}` });
            if (key === 'hp' && st.hp === 0) { log.push({ k: 'warn', t: '쓰러짐 (HP 0)' }); if (before > 0) { st.downs = (st.downs || 0) + 1; st.downNow = true; } }
            if (key === 'hp' && d < 0 && -d >= max * 0.7 && st.hp > 0) traceTitle(st, '깊은 상처를 견딘 자', log);
            if (key === 'hp' && st.hp > 0 && st.downNow) { st.downNow = false; traceTitle(st, '죽음의 문턱에서 돌아온 자', log); if ((st.downs || 0) >= 3) traceTitle(st, '세 번 쓰러지고 일어선 자', log); }
            break;
        }
        case 'item': {
            const { sign, name, qty } = splitItemArg(arg); if (!name) throw 0;
            const i = findByName(st.items, name);
            if (sign === '+') {
                if (i >= 0 && nospace(st.items[i].name) === nospace(name)) st.items[i].qty += qty;
                else st.items.push({ name, qty });
                log.push({ k: 'gain', t: `${name}${qty > 1 ? ' ×' + qty : ''}` });
            } else {
                if (i >= 0) {
                    st.items[i].qty -= qty;
                    log.push({ k: 'loss', t: `${st.items[i].name}${qty > 1 ? ' ×' + qty : ''} 소모` });
                    if (st.items[i].qty <= 0) st.items.splice(i, 1);
                }
            }
            break;
        }
        case 'merit': {
            const m = arg.match(/^(.*?)\s*([+\-−=]?\s*\d+)\s*$/); if (!m) throw 0;
            const id = splitOrgPrefix(m[1]).id || resolveOrg(m[1]) || (Object.keys(st.orgs).length === 1 ? Object.keys(st.orgs)[0] : null);
            if (!id) throw 0;
            if (!st.orgs[id]) st.orgs[id] = { rank: 0, merit: 0 };
            const p = parseNum(m[2]);
            st.orgs[id].merit = Math.max(0, p.mode === 'set' ? p.value : st.orgs[id].merit + p.value);
            log.push({ k: p.value >= 0 ? 'gain' : 'loss', t: `${ORGS[id].name} 공적 ${p.value >= 0 ? '+' : ''}${p.value}` });
            break;
        }
        case 'promote': case 'demote': {
            const sp = splitOrgPrefix(arg);
            let id = sp.id, rest = sp.rest;
            if (!id && Object.keys(st.orgs).length === 1) { id = Object.keys(st.orgs)[0]; rest = arg.trim(); }
            if (!id) throw 0;
            if (!st.orgs[id]) st.orgs[id] = { rank: 0, merit: 0 };
            const cur = st.orgs[id].rank;
            let to;
            if (!rest || /^\+?1?$/.test(rest)) to = key === 'promote' ? cur + 1 : cur - 1;
            else if (/^[+\-]\d+$/.test(rest)) to = cur + parseInt(rest);
            else { to = resolveRank(id, rest); if (to < 0) throw 0; }
            to = Math.max(0, Math.min(ORGS[id].ranks.length - 1, to));
            if (id === 'artisan' && key === 'promote' && !/강제/.test(arg)) {
                const lack = Object.keys(MASTER_EXAM).map(Number).find(rk => rk > cur && rk <= to && !st.orgs.artisan.exams?.[rk]);
                if (lack) { log.push({ k: 'warn', t: `${ORGS.artisan.ranks[lack]}이 되려면 걸작 심사를 통과해야 한다 (${MASTER_EXAM[lack][2]})` }); break; }
            }
            if (key === 'promote' && to > cur && id !== 'shadow') { const gain = RANK_HONOR.slice(cur + 1, to + 1).reduce((a, b) => a + b, 0); if (gain) { st.honor = st.honor || { pts: 0 }; st.honor.pts = (st.honor.pts || 0) + gain; log.push({ k: 'gain', t: `공훈 +${gain} (${orgLabel(id, to)})` }); honorCheck(st, log); } }
            st.orgs[id].rank = to;
            if (st.mainJob && st.mainJob.startsWith(ORGS[id].name)) st.mainJob = orgLabel(id, to);
            log.push({ k: 'rank', t: `${key === 'promote' ? '승급' : '강등'} — ${orgLabel(id, to)}` });
            break;
        }
        case 'join': {
            const id = resolveOrg(arg); if (!id) throw 0;
            if (!st.orgs[id]) st.orgs[id] = { rank: 0, merit: 0 };
            if (!st.mainJob || st.mainJob === '무소속') st.mainJob = orgLabel(id, st.orgs[id].rank);
            log.push({ k: 'rank', t: `${ORGS[id].name} 가입` });
            break;
        }
        case 'leave': {
            const id = resolveOrg(arg); if (!id) throw 0;
            delete st.orgs[id];
            if (st.mainJob && st.mainJob.startsWith(ORGS[id].name)) {
                const other = Object.keys(st.orgs)[0];
                st.mainJob = other ? orgLabel(other, st.orgs[other].rank) : '무소속';
            }
            log.push({ k: 'loss', t: `${ORGS[id].name} 탈퇴` });
            break;
        }
        case 'renown': {
            const p = parseNum(arg); if (!p) throw 0;
            st.renown = p.mode === 'set' ? p.value : st.renown + p.value;
            log.push({ k: p.value >= 0 ? 'gain' : 'loss', t: `명성 ${p.value >= 0 ? '+' : ''}${p.value}` });
            break;
        }
        case 'noble': {
            const a = nospace(arg);
            let to;
            if (/^[+\-]\d+$/.test(a)) to = st.noble + parseInt(a);
            else { to = NOBLE.findIndex(n => nospace(n) === a); if (to < 0) to = NOBLE.findIndex(n => a.includes(nospace(n))); }
            if (to < 0) throw 0;
            to = Math.max(0, Math.min(NOBLE.length - 1, to));
            if (to === NOBLE_EMPEROR && st.difficulty !== 'hard') { log.push({ k: 'warn', t: '황제는 될 수 없습니다 (찬탈은 어려움 전용)' }); break; }
            if (to === NOBLE_ROYAL && !isRoyalSpouse(st)) { log.push({ k: 'warn', t: '황족은 황태자·황녀와의 혼인으로만 될 수 있습니다' }); break; }
            if (st.noble >= NOBLE_ROYAL && to < NOBLE_ROYAL && to > 0 && !/^[+\-]/.test(a)) { /* 황족·황제는 작위 수여로 내려가지 않음 */ break; }
            st.noble = to;
            log.push({ k: 'rank', t: `신분 — ${NOBLE[st.noble]}` });
            break;
        }
        case 'rel': {
            const m = arg.match(/^(.*?)\s*((?:=\s*)?[+\-−]?\s*\d+)\s*$/); if (!m) throw 0;
            const name = m[1].trim(); if (!name) throw 0;
            const p = parseNum(m[2]);
            const cur = st.rel[name] || 0;
            st.rel[name] = Math.max(-100, Math.min(100, p.mode === 'set' ? p.value : cur + p.value));
            log.push({ k: p.mode === 'set' ? 'info' : p.value >= 0 ? 'gain' : 'loss', t: p.mode === 'set' ? `${name} 호감 → ${st.rel[name]}` : `${name} 호감 ${p.value >= 0 ? '+' : ''}${p.value}` });
            break;
        }
        case 'skill': {
            const { sign, body } = splitPlusMinus(arg);
            const [name, desc = ''] = body.split(/\s*[|｜]\s*/);
            if (!name) throw 0;
            const i = findByName(st.skills, name);
            if (sign === '+') {
                if (i >= 0 && nospace(st.skills[i].name) === nospace(name)) { if (desc) st.skills[i].desc = desc; }
                else st.skills.push({ name: name.trim(), desc: desc.trim() });
                log.push({ k: 'rank', t: `스킬 습득 — ${name.trim()}` });
            } else if (i >= 0) { log.push({ k: 'loss', t: `스킬 상실 — ${st.skills[i].name}` }); st.skills.splice(i, 1); }
            break;
        }
        case 'title': case 'cond': case 'asset': {
            const listKey = key === 'title' ? 'titles' : key === 'cond' ? 'conds' : 'assets';
            const label = key === 'title' ? '칭호' : key === 'cond' ? '상태' : '자산';
            const { sign, body } = splitPlusMinus(arg); if (!body) throw 0;
            const list = st[listKey];
            const n = nospace(body);
            const i = list.findIndex(x => nospace(x) === n || nospace(x).includes(n) || n.includes(nospace(x)));
            if (sign === '+') { if (i < 0) list.push(body); log.push({ k: key === 'cond' ? 'warn' : 'rank', t: `${label} +${body}` }); }
            else if (i >= 0) { log.push({ k: key === 'cond' ? 'gain' : 'loss', t: `${label} -${list[i]}` }); list.splice(i, 1); }
            break;
        }
        case 'quest': {
            const { sign, body } = splitPlusMinus(arg);
            const [name, rank = '', reward = '', place = '', desc = '', merit = '', exp = '', due = '', org = ''] = body.split(/\s*[|｜]\s*/);
            if (!name) throw 0;
            const i = findByName(st.quests, name);
            if (sign === '+') {
                if (i < 0) {
                    const q = { name: name.trim(), rank: rank.trim(), reward: reward.trim() };
                    if (place) q.place = place.trim();
                    if (desc) q.desc = desc.trim();
                    if (parseInt(merit)) q.merit = parseInt(merit);
                    if (parseInt(exp)) q.exp = parseInt(exp);
                    if (parseInt(due)) q.due = st.day + parseInt(due);
                    if (org && ORGS[org.trim()]) q.org = org.trim();
                    st.quests.push(q);
                }
                log.push({ k: 'info', t: `의뢰 수주 — ${name.trim()}` });
            }
            else if (i >= 0) { log.push({ k: 'info', t: `의뢰 취소 — ${st.quests[i].name}` }); st.quests.splice(i, 1); }
            break;
        }
        case 'questDone': case 'questFail': {
            const name = arg.split(/\s*[|｜]\s*/)[0].trim(); if (!name) throw 0;
            const i = findByName(st.quests, name);
            const q = i >= 0 ? st.quests.splice(i, 1)[0] : { name, rank: '', reward: '' };
            const ok = key === 'questDone';
            if (ok) st.questsDone += 1;
            st.questLog.unshift({ ...q, result: ok ? '완료' : '실패', day: st.day });
            st.questLog = st.questLog.slice(0, 12);
            log.push({ k: ok ? 'gain' : 'loss', t: `의뢰 ${ok ? '완료' : '실패'} — ${q.name}` });
            break;
        }
        case 'loc': {
            if (!arg) throw 0;
            st.location = arg;
            log.push({ k: 'info', t: `→ ${arg}` });
            break;
        }
        case 'day': {
            const m = String(arg).match(/([+\-]?\d+)/);
            if (!m && TODS.some(t => String(arg).includes(t))) return applyOne(st, { ...op, key: 'tod' }, log); // "시간 저녁"
            if (!m) throw 0;
            let n = parseInt(m[1]);
            if (/주/.test(arg)) n *= 7; else if (/달|개월/.test(arg)) n *= 30;
            const before = st.day;
            if (/^=/.test(arg.trim())) st.day = Math.max(0, n); else st.day = Math.max(0, st.day + n);
            const passed = st.day - before;
            log.push({ k: 'info', t: `${passed}일 경과 · ${formatDate(st.day).m}월 ${formatDate(st.day).d}일` });
            if (passed > 0) { payLiving(st, passed, log); st.tod = 0; }
            if (passed > 0) ageTick(st, before, log);
            if (passed > 0 && st.expecting && st.day >= st.expecting.due) { bornChild(st, log, null, null, st.expecting.with); st.expecting = null; }
            if (passed > 0) for (const b of monthStarts(before, st.day)) { runLifeMonth(st, b, log, b - 1); if (st.farms?.length) runFarmsMonth(st, b, log); runNobleMonth(st, log); }
            if (passed > 0 && st.honor?.pending) { for (let d = before + 1; d <= st.day; d++) { const fd = formatDate(d); if (fd.m === 6 && fd.d === 10) { log.push({ k: 'rank', t: '황제 탄신 축하연 — 서임식' }); grantHonor(st, st.honor.pending, log); break; } } }
            for (const c of st.commissions || []) if (before <= c.due && st.day > c.due) log.push({ k: 'warn', t: `주문 기한이 지났다 — ${c.client}: ${c.item} (늦게 내면 3할 깎임)` });
            if (passed > 0 && ymOf(before) !== ymOf(st.day)) {
                log.push({ k: 'info', t: `새 달 — 이달의 정세: ${affairsOf(st.day).map(a => a.name).join(' · ')}` });
                if (st.orgs.merchant) {
                    const due = MERCHANT_DUES[st.orgs.merchant.rank] || 50;
                    if (st.money >= due) { st.money -= due; log.push({ k: 'loss', t: `상인 길드 회비 -${formatMoney(due)}` }); }
                    else if (st.bank >= due) { st.bank -= due; log.push({ k: 'loss', t: `상인 길드 회비 -${formatMoney(due)} (예금에서)` }); }
                    else { st.strikes.push({ why: '회비 미납', day: st.day, org: 'merchant' }); log.push({ k: 'warn', t: `상인 길드 회비(${formatMoney(due)})를 못 내 경고 — ${strikesOf(st, 'merchant').length}회` }); }
                    const div = DIVIDEND[st.orgs.merchant.rank] || 0;
                    if (div) { st.money += div; log.push({ k: 'gain', t: `상인 길드 배당 +${formatMoney(div)}` }); }
                }
                if (st.patron) {
                    const P = PATRON_ROLES[st.patron.role], h = st.patron.house;
                    const prevYm = ymOf(before);
                    if (P.pay) { st.money += P.pay[st.patron.rank]; log.push({ k: 'gain', t: `${h} 급료 +${formatMoney(P.pay[st.patron.rank])} (${P.ranks[st.patron.rank]})` }); }
                    if (P.tribute && st.monthSales) { const tb = Math.round(st.monthSales * P.tribute[st.patron.rank]); const x = Math.min(tb, st.money); st.money -= x; log.push({ k: 'loss', t: `${h}에 상납 -${formatMoney(x)} (지난달 매출의 ${Math.round(P.tribute[st.patron.rank] * 100)}%)` }); if (x < tb) { st.houseFavor[h] = Math.max(0, (st.houseFavor[h] || 0) - 10); log.push({ k: 'warn', t: `상납이 모자라 ${h}의 호감이 떨어졌다` }); } }
                    if (st.patron.role === '전속 요리사') { const g = 3 + Math.floor(Math.max(0, st.life?.요리?.rank ?? 0) / 2); st.houseFavor[h] = Math.min(100, (st.houseFavor[h] || 0) + g); log.push({ k: 'gain', t: `${h}의 식탁을 맡은 한 달 — 호감 +${g}` }); }
                    else if (st.nobleDeals?.[`last|${h}`] !== prevYm) { st.houseFavor[h] = Math.max(0, (st.houseFavor[h] || 0) - (st.patron.role === '상단원' ? 10 : 5)); log.push({ k: 'warn', t: `지난달 ${h}의 주문을 채우지 못했다 — 가문의 호감 하락 (${st.houseFavor[h]})` }); }
                    const want = PATRON_FAVOR.filter(f => (st.houseFavor[h] || 0) >= f).length - 1;
                    const yr = (st.day - st.patron.since) >= 360;
                    const nr = Math.min(want, yr ? 3 : 2);
                    if (nr > st.patron.rank) { st.patron.rank = nr; log.push({ k: 'rank', t: `${h} — ${P.ranks[nr]} 자리에 올랐다` }); }
                    if ((st.houseFavor[h] || 0) <= 0) { log.push({ k: 'warn', t: `${h}가 더는 당신을 쓰지 않겠다고 통보했다` }); st.patron = null; }
                }
                if (st.monthSales > 0 && st.shops?.length) { const tax = Math.round(st.monthSales * TAX.shop); st.money = Math.max(0, st.money - tax); log.push({ k: 'loss', t: `영업세 -${formatMoney(tax)} (지난달 매출의 5%)` }); }
                st.monthSales = 0;
                if (st.estates?.length) runEstatesMonth(st, before, log);
                for (const o of scoutOffers(st)) log.push({ k: 'rank', t: `스카웃 제의 — ${o.house} (${o.roles.join(' / ')})` });
                if (st.credit > 0) {
                    const a1 = Math.min(st.credit, st.money); st.money -= a1; st.credit -= a1;
                    const a2 = Math.min(st.credit, st.bank); st.bank -= a2; st.credit -= a2;
                    if (a1 + a2) log.push({ k: 'loss', t: `길드 외상 상환 -${formatMoney(a1 + a2)}` });
                    if (st.credit > 0) { const fee = Math.round(st.credit * 0.1); st.credit += fee; st.strikes.push({ why: '외상 연체', day: st.day, org: 'merchant' }); log.push({ k: 'warn', t: `외상 ${formatMoney(st.credit)} 연체 — 연체료 ${formatMoney(fee)}, 상인 길드 경고` }); }
                }
            }
            break;
        }
        case 'equip': {
            const m = arg.match(/^(\S+)\s+(.+)$/); if (!m) throw 0;
            const slot = SLOTS[m[1]]; if (!slot) throw 0;
            const R = st.relics?.[m[2].trim()];
            if (R?.cls && !st.classes?.[R.cls] && !/강제/.test(arg)) { log.push({ k: 'warn', t: `${m[2].trim()} — ${R.cls}의 장비라 지금은 제대로 다룰 수 없다. 팔거나 선물하거나, ${R.cls}를 보조 클래스로 배우면 쓸 수 있다` }); break; }
            st.equip[slot] = m[2].trim();
            log.push({ k: 'info', t: `${SLOT_LABEL[slot]} 장착 — ${m[2].trim()}` });
            break;
        }
        case 'unequip': {
            const slot = SLOTS[nospace(arg)]; if (!slot) throw 0;
            if (st.equip[slot]) log.push({ k: 'info', t: `${SLOT_LABEL[slot]} 해제` });
            delete st.equip[slot];
            break;
        }
        case 'stat': {
            const m = arg.match(/^(\S+)\s*(.*)$/); if (!m) throw 0;
            const s = normStat(m[1]); const p = parseNum(m[2]); if (!s || !p) throw 0;
            const before = st.stats[s], cap = statCap(st);
            const want = p.mode === 'set' ? p.value : st.stats[s] + p.value;
            st.stats[s] = Math.max(1, Math.min(cap, want));
            if (want > cap && before >= cap) log.push({ k: 'warn', t: `${s} — ${STAT_CAP_NAMES[Math.min(3, st.capBreak || 0)]}(${cap})에 막혔다. 한계를 넘으려면 큰 사건이 필요하다` });
            const d = st.stats[s] - before;
            if (d) log.push({ k: d > 0 ? 'rank' : 'loss', t: `${s} ${d > 0 ? '+' : ''}${d}` });
            break;
        }
        case 'points': {
            const p = parseNum(arg); if (!p) throw 0;
            st.statPoints = Math.max(0, p.mode === 'set' ? p.value : st.statPoints + p.value);
            break;
        }
        case 'level': {
            const p = parseNum(arg); if (!p) throw 0;
            const to = Math.max(1, Math.min(CLASS_MAX, p.mode === 'set' ? p.value : st.lv + p.value));
            if (st.classes?.[st.cls]) { st.classes[st.cls].lv = to; st.classes[st.cls].exp = 0; }
            st.lv = to; st.exp = 0; st.hp = maxHP(st); st.mp = maxMP(st);
            log.push({ k: 'rank', t: `Lv ${to}` });
            break;
        }
        case 'job': {
            if (!arg) throw 0;
            st.mainJob = arg;
            log.push({ k: 'info', t: `직업 — ${arg}` });
            break;
        }
        case 'party': {
            const { sign, body } = splitPlusMinus(arg);
            const [name, role = '', rank = '', hp = '', wage = ''] = body.split(/\s*[|｜]\s*/);
            if (!name) throw 0;
            const i = findByName(st.party, name);
            if (sign === '+') {
                if (i >= 0) {
                    const m = st.party[i];
                    if (role) m.role = role.trim();
                    if (rank) m.rank = rank.trim();
                    if (parseInt(hp)) { m.maxhp = parseInt(hp); m.hp = Math.min(m.hp, m.maxhp); }
                    if (wage) m.wage = Math.max(0, parseMoney(wage)?.value || 0);
                    log.push({ k: 'info', t: `동료 정보 — ${m.name}` });
                } else {
                    const maxhp = parseInt(hp) || 50;
                    st.party.push({ name: name.trim(), role: role.trim(), rank: rank.trim(), maxhp, hp: maxhp, wage: Math.max(0, parseMoney(wage || '0')?.value || 0), conds: [] });
                    log.push({ k: 'rank', t: `동료 합류 — ${name.trim()}` });
                }
            } else if (i >= 0) {
                log.push({ k: 'loss', t: `동료 이탈 — ${st.party[i].name}` });
                st.party.splice(i, 1);
            }
            break;
        }
        case 'partyHp': {
            const m = arg.match(/^(.*?)\s*((?:[+\-−=]\s*\d+)|최대|max|전부)\s*$/i); if (!m) throw 0;
            const i = findByName(st.party, m[1]); if (i < 0) throw 0;
            const mem = st.party[i]; const p = parseNum(m[2]); if (!p) throw 0;
            const before = mem.hp;
            mem.hp = p.mode === 'max' ? mem.maxhp : p.mode === 'set' ? p.value : mem.hp + p.value;
            mem.hp = Math.max(0, Math.min(mem.maxhp, mem.hp));
            const d = mem.hp - before;
            if (d) log.push({ k: d > 0 ? 'gain' : 'loss', t: `${mem.name} HP ${d > 0 ? '+' : ''}${d}` });
            if (mem.hp === 0) log.push({ k: 'warn', t: `${mem.name} 쓰러짐` });
            break;
        }
        case 'partyCond': {
            const m = arg.match(/^(.*?)\s+([+\-−])\s*(.+)$/); if (!m) throw 0;
            const i = findByName(st.party, m[1]); if (i < 0) throw 0;
            const mem = st.party[i]; mem.conds = mem.conds || [];
            const c = m[3].trim();
            const j = mem.conds.findIndex(x => nospace(x) === nospace(c));
            if (m[2] === '+') { if (j < 0) mem.conds.push(c); log.push({ k: 'warn', t: `${mem.name} +${c}` }); }
            else if (j >= 0) { mem.conds.splice(j, 1); log.push({ k: 'gain', t: `${mem.name} -${c}` }); }
            break;
        }
        case 'living': {
            const k = Object.keys(LIVING).find(x => nospace(arg).includes(x));
            if (!k || k === '야영') throw 0;
            st.living = k;
            log.push({ k: 'info', t: `생활 수준 — ${k}` });
            break;
        }
        case 'bond': {
            const m = arg.match(/^(.*\S)\s+(설렘|호감|썸|연인|약혼|친구|이별|헤어짐|파혼)\s*$/);
            if (!m) throw 0;
            const name = findPersonKey(st, m[1]);
            let stage = m[2] === '호감' || m[2] === '썸' ? '설렘' : m[2];
            const cur = st.bonds[name]?.stage;
            if (['친구', '이별', '헤어짐', '파혼'].includes(stage)) {
                if (cur === '배우자') { log.push({ k: 'warn', t: `배우자와는 '이혼'으로만 헤어질 수 있습니다` }); break; }
                if (cur) { delete st.bonds[name]; log.push({ k: 'loss', t: `${name} — ${stage === '친구' ? '친구로 돌아감' : '이별'}` }); }
                break;
            }
            const v = st.rel[name] || 0;
            const need = romanceNeed(st, stage);
            const curIdx = cur ? ROMANCE.indexOf(cur) : -1;
            const toIdx = ROMANCE.indexOf(stage);
            if (toIdx > curIdx + 1) { log.push({ k: 'warn', t: `${name}: ${ROMANCE[curIdx + 1]} 단계를 먼저 거쳐야 합니다` }); break; }
            if (toIdx > curIdx && v < need) { log.push({ k: 'warn', t: `${name}: ${stage}까지 호감 ${need} 필요 (지금 ${v})` }); break; }
            if (stage === '약혼' && st.spouse && st.spouse.name !== name) { log.push({ k: 'warn', t: '이미 배우자가 있습니다' }); break; }
            st.bonds[name] = { stage, since: st.day };
            log.push({ k: 'rank', t: `${name} — ${stage}` });
            break;
        }
        case 'marry': {
            const [rawName, title = ''] = arg.split(/\s*[|｜]\s*/);
            if (!rawName) throw 0;
            const name = findPersonKey(st, rawName);
            if (st.spouse && st.spouse.name !== name) { log.push({ k: 'warn', t: '이미 배우자가 있습니다 (먼저 이혼해야 함)' }); break; }
            const cur = st.bonds[name]?.stage;
            if (cur !== '약혼' && cur !== '배우자') { log.push({ k: 'warn', t: `${name}: 혼인하려면 먼저 약혼해야 합니다` }); break; }
            st.spouse = { name, title: title.trim(), since: st.day };
            st.bonds[name] = { stage: '배우자', since: st.day };
            log.push({ k: 'rank', t: `혼인 — ${name}${title ? ` (${title.trim()})` : ''}` });
            if (isRoyalSpouse(st) && st.noble < NOBLE_ROYAL) {
                st.noble = NOBLE_ROYAL;
                log.push({ k: 'rank', t: '신분 — 황족' });
            } else {
                const nb = nobleFromTitle(title);
                if (nb > st.noble && nb < NOBLE_ROYAL) { st.noble = nb; log.push({ k: 'rank', t: `신분 — ${NOBLE[nb]} (혼인으로 귀족 가문에 편입)` }); }
            }
            break;
        }
        case 'cls': case 'learnCls': {
            const a1 = arg.replace(/^(클래스|습득)\s*/, '');
            const c = normClass(a1.replace(/^강제\s*/, '')); if (!c) throw 0;
            if (!acquireClass(st, c, log, /^강제/.test(a1))) break;
            if (key === 'cls' && st.cls !== c) {
                if (st.sub === c) st.sub = st.cls;
                st.cls = c; syncClass(st);
                st.hp = Math.min(st.hp, maxHP(st)); st.mp = Math.min(st.mp, maxMP(st));
                log.push({ k: 'info', t: `주 클래스 — ${c} Lv ${st.lv}` });
            }
            break;
        }
        case 'subcls': {
            const a2 = arg.replace(/^클래스\s*/, '').trim();
            if (/^(없음|해제|-)$/.test(a2)) { st.sub = null; log.push({ k: 'info', t: '보조 클래스 해제' }); break; }
            const c = normClass(a2.replace(/^강제\s*/, '')); if (!c) throw 0;
            if (c === st.cls) break;
            if (!acquireClass(st, c, log, /^강제/.test(a2))) break;
            st.sub = c;
            log.push({ k: 'info', t: `보조 클래스 — ${c} Lv ${st.classes[c].lv}` });
            break;
        }
        case 'clsExp': case 'clsLv': {
            const m = arg.match(/^(\S+)\s*(.*)$/); if (!m) throw 0;
            const c = normClass(m[1]); const p = parseNum(m[2]); if (!c || !p) throw 0;
            if (!st.classes[c]) st.classes[c] = { lv: 1, exp: 0 };
            if (key === 'clsExp') classGain(st, c, p.mode === 'set' ? p.value - st.classes[c].exp : p.value, log, `경험(${c})`);
            else {
                const to = Math.max(1, Math.min(CLASS_MAX, p.mode === 'set' ? p.value : st.classes[c].lv + p.value));
                st.classes[c].lv = to; st.classes[c].exp = 0;
                log.push({ k: 'rank', t: `${c} Lv ${to}` });
            }
            syncClass(st);
            break;
        }
        case 'affinity': {
            const { sign, body } = splitPlusMinus(arg);
            const list = body.split(/[\s,·]+/).filter(e => ELEMENTS.includes(e));
            if (!list.length) throw 0;
            if (/^=/.test(arg.trim())) st.affinity = [];
            for (const e of list) {
                if (sign === '-') st.affinity = st.affinity.filter(x => x !== e);
                else if (!st.affinity.includes(e)) st.affinity.push(e);
            }
            log.push({ k: 'rank', t: `적성 속성 — ${st.affinity.join('·') || '없음'}` });
            break;
        }
        case 'comp': {
            const { sign, body: body0 } = splitPlusMinus(arg);
            const force = /[|｜]\s*강제\s*$/.test(body0);
            const body = body0.replace(/\s*[|｜]\s*강제\s*$/, '');
            const [name, kindRaw = '', species = '', elem = '', hp = '', terms = ''] = body.split(/\s*[|｜]\s*/);
            if (!name) throw 0;
            const i = findComp(st, name);
            if (sign === '-') { if (i >= 0) { log.push({ k: 'loss', t: `동반자 이별 — ${st.companions[i].name}` }); st.companions.splice(i, 1); } break; }
            const rawKey = String(op.raw || '').replace(/^\s*[-*•·]?\s*/, '');
            const kind = /정령/.test(kindRaw) || /^정령계약/.test(rawKey) ? '정령' : /소환|계약|이계/.test(kindRaw) || /^계약/.test(rawKey) ? '소환수' : '마수';
            if (i >= 0) {
                const c = st.companions[i];
                if (species) c.species = species.trim();
                if ((c.kind === '정령' ? SPIRIT_ELEMS : ELEMENTS).includes(elem.trim())) c.elem = elem.trim();
                if (terms) c.terms = terms.trim();
                log.push({ k: 'info', t: `동반자 정보 — ${c.name}` });
            } else {
                if (kind === '마수' && !force && !st.classes?.테이머 && guessGrade(species) >= 3) { log.push({ k: 'warn', t: `${name.trim()} — 마수는 테이머만 곁에 둘 수 있다 (순한·사나운 짐승은 누구나 함께할 수 있다)` }); break; }
                if (kind === '마수' && !force && guessGrade(species) >= 5 && !['짐승의 왕', '폭풍새의 주인', '진화 유도', '기마대의 조련사'].some(k => st.cskills?.[k])) { log.push({ k: 'warn', t: `${name.trim()} — 전설의 존재는 테이머 비전(짐승의 왕·폭풍새의 주인 등)을 깨달은 이에게만 마음을 연다` }); break; }
                if (kind === '마수' && !force && st.classes?.테이머) {
                    const cost = soulCost(guessGrade(species));
                    const used = soulUsed(st), cap = soulCap(st);
                    if (used + cost > cap) { log.push({ k: 'warn', t: `영혼에 자리가 없다 — ${name.trim()}(${GRADE_NAME[guessGrade(species)]}, 자리 ${cost}) · 지금 ${used}/${cap}` }); break; }
                }
                if (kind === '정령') {
                    const sg = spiritGradeOf(`${species} ${name}`, elem.trim());
                    const el = sg.elem || elem.trim();
                    if (sg.grade >= 4) {
                        const kr = kingReady(st, el);
                        if (!force && !kr.ok) { log.push({ k: 'warn', t: `정령왕은 응하지 않았다 — ${kr.why.join(' · ')}` }); break; }
                        addCompanion(st, { name: name.trim(), kind, species: '', elem: el, maxhp: (parseInt(hp) || 0) || 160, terms: terms.trim(), bond: 30, lv: 25, king: true }, log);
                        break;
                    }
                    const cap = (st.companions || []).some(c => c.kind === '정령') ? spiritCap(st) : 0;
                    if (!force && sg.grade > cap) { log.push({ k: 'warn', t: `${SPIRIT_GRADES[sg.grade]} 정령은 응하지 않았다 — 지금 맺을 수 있는 건 ${SPIRIT_GRADES[cap]}까지 (키운 정령의 격만큼)` }); break; }
                    addCompanion(st, { name: name.trim(), kind, species: '', elem: el, maxhp: parseInt(hp) || 0, terms: terms.trim(), bond: 20, lv: STAGE_AT[sg.grade] }, log);
                    break;
                }
                if (kind === '소환수') {
                    const g = summonGradeOf(`${species} ${name}`);
                    if (!force && g >= 1) {
                        const why = [];
                        if (!knowsTrueName(st, name.trim(), species.trim())) why.push('진명을 모른다 — 중위 이상의 존재는 참된 이름을 알아야 응한다 (금서·유적·다른 소환사에게서)');
                        if (g >= 3 && !st.cskills?.['문 열기']) why.push('군주급은 비전 「문 열기」로 그 세계에 건너가 마주해야 한다');
                        if (why.length) { log.push({ k: 'warn', t: `${name.trim()}(${SUMMON_GRADES[g]})는 응하지 않았다 — ${why.join(' · ')}` }); break; }
                    }
                    addCompanion(st, { name: name.trim(), kind, species: species.trim(), elem: elem.trim(), maxhp: parseInt(hp) || 0, terms: terms.trim(), bond: 0, lv: STAGE_AT[g] }, log);
                    break;
                }
                addCompanion(st, { name: name.trim(), kind, species: species.trim(), elem: elem.trim(), maxhp: parseInt(hp) || 0, terms: terms.trim(), bond: kind === '소환수' ? 0 : 20 }, log);
            }
            break;
        }
        case 'compHp': case 'compBond': case 'compExp': {
            const m = arg.match(/^(.*?)\s*((?:=\s*)?[+\-−]?\s*\d+|최대|max|전부)\s*$/i); if (!m) throw 0;
            const i = findComp(st, m[1]); if (i < 0) throw 0;
            const c = st.companions[i]; const p = parseNum(m[2]); if (!p) throw 0;
            if (key === 'compHp') {
                const b0 = c.hp;
                c.hp = Math.max(0, Math.min(c.maxhp, p.mode === 'max' ? c.maxhp : p.mode === 'set' ? p.value : c.hp + p.value));
                if (c.hp !== b0) log.push({ k: c.hp > b0 ? 'gain' : 'loss', t: `${c.name} HP ${c.hp > b0 ? '+' : ''}${c.hp - b0}` });
                if (c.hp === 0) log.push({ k: 'warn', t: `${c.name} 쓰러짐` });
            } else if (key === 'compBond') {
                const b0 = c.bond;
                c.bond = Math.max(-100, Math.min(100, p.mode === 'set' ? p.value : c.bond + p.value));
                if (c.bond > b0) c.idle = 0;
                log.push({ k: c.bond >= b0 ? 'gain' : 'loss', t: `${c.name} 유대 ${c.bond >= b0 ? '+' : ''}${c.bond - b0}` });
            } else compGain(st, c, p.mode === 'set' ? p.value - c.exp : p.value, log);
            break;
        }
        case 'compEvolve': {
            const [name, species = ''] = arg.split(/\s*[|｜]\s*/);
            const i = findComp(st, name); if (i < 0 || !species.trim()) throw 0;
            const c = st.companions[i]; const old = c.species;
            const forceE = /강제/.test(arg);
            if (c.kind === '정령') { log.push({ k: 'warn', t: `${c.name} — 정령은 진화하지 않는다. 함께 지내며 자란다` }); break; }
            if (c.kind === '마수' && !forceE) {
                const why = [];
                if (!st.cskills?.['진화 유도']) why.push('비전 「진화 유도」를 모름');
                if (stageIdx(c) < 3) why.push(`아직 ${companionStage(c)} (우두머리가 되어야 함)`);
                if (c.bond < 80) why.push(`유대 ${c.bond}/80`);
                const ng = Math.min(5, Math.max(c.grade || 1, guessGrade(species)) + (guessGrade(species) > (c.grade || 1) ? 0 : 1));
                if (!why.length && st.classes?.테이머 && soulUsed(st) - soulCost(c.grade) + soulCost(ng) > soulCap(st)) why.push(`영혼에 자리가 없음 (진화하면 자리 ${soulCost(ng)})`);
                if (why.length) { log.push({ k: 'warn', t: `${c.name}는 아직 거듭날 수 없다 — ${why.join(' · ')}` }); break; }
                c.grade = ng;
            }
            c.species = species.replace(/\s*[|｜]?\s*강제\s*$/, '').trim(); c.maxhp += 20; c.hp = c.maxhp;
            log.push({ k: 'rank', t: `진화! ${c.name} — ${old ? old + ' → ' : ''}${c.species}` });
            break;
        }
        case 'compCall': case 'compBack': {
            const i = findComp(st, arg); if (i < 0) throw 0;
            const c = st.companions[i];
            if (!CALL_MP[c.kind]) { log.push({ k: 'info', t: `${c.name}는 늘 곁에 있다` }); break; }
            if (key === 'compBack') { if (c.out) { c.out = false; log.push({ k: 'info', t: `${c.name} 돌려보냄` }); } break; }
            if (c.out) break;
            if (c.hp <= 0) { log.push({ k: 'warn', t: `${c.name}는 쓰러져 있어 부를 수 없다` }); break; }
            const cost = callCost(c);
            if (st.mp < cost) { log.push({ k: 'warn', t: `마나 부족 — ${c.name}를 부르려면 MP ${cost}` }); break; }
            st.mp -= cost; c.out = true;
            log.push({ k: 'loss', t: `${c.name} 불러냄 · MP -${cost}` });
            break;
        }
        case 'work': {
            // 일하기 주점 악사 3일
            const m = arg.match(/^(.*?)\s*(\d+)\s*일?\s*$/);
            let w = WORKS.find(x => nospace(x[0]) === nospace(m ? m[1] : arg)) || WORKS.find(x => nospace(m ? m[1] : arg).includes(nospace(x[0]))) || WORKS.find(x => nospace(x[0]).includes(nospace(m ? m[1] : arg) || '-'));
            if (!w) { w = WORKS[0]; log.push({ k: 'info', t: `'${(m ? m[1] : arg).trim()}' 일은 날품팔이 품삯으로 친다` }); }
            if (!workPlaceOk(st, w)) { log.push({ k: 'warn', t: `여기서는 ${w[0]} 일을 구할 수 없다` }); break; }
            const days = Math.max(1, Math.min(30, parseInt(m?.[2]) || 1));
            let pay = 0, idle = 0;
            for (let d = 1; d <= days; d++) { const p = workPay(st, w, st.day + d); if (!p) idle++; pay += p; }
            log.push(...applyOps(st, parseOpLines([`날짜 +${days}일`])));
            st.money += pay;
            log.push({ k: pay ? 'gain' : 'info', t: `${w[0]} ${days}일 — 품삯 +${formatMoney(pay)}${idle ? ` (일이 없던 날 ${idle}일)` : ''}` });
            if (w[4] && st.life?.[w[4]]) trainLife(st, w[4], days, log);
            break;
        }
        case 'estateBuy': case 'estateSell': {
            const E0 = findEstate(arg); if (!E0) throw 0;
            const [name, market, price] = E0;
            st.estates = st.estates || [];
            const own = st.estates.find(e => e.name === name);
            if (key === 'estateBuy') {
                if (own) { log.push({ k: 'info', t: `이미 ${josa(name, '을', '를')} 가지고 있다` }); break; }
                if (marketOf(st.location) !== market) { log.push({ k: 'warn', t: `${name}은(는) ${market}에 가서 사야 한다` }); break; }
                if (st.money < price) { log.push({ k: 'warn', t: `돈이 모자라다 (${formatMoney(price)})` }); break; }
                st.money -= price; st.estates.push({ name, since: st.day });
                log.push({ k: 'rank', t: `${name} 매입 -${formatMoney(price)}` });
            } else {
                if (!own) break;
                const back = Math.round(price * 0.8); st.money += back; st.estates.splice(st.estates.indexOf(own), 1);
                log.push({ k: 'gain', t: `${name} 매각 +${formatMoney(back)}` });
            }
            break;
        }
        case 'exam': {
            // 걸작제출 장검 (명품)
            if (!st.orgs.artisan) { log.push({ k: 'warn', t: '장인 길드원만 심사를 받을 수 있다' }); break; }
            const it = st.items.find(i => nospace(i.name) === nospace(arg)) || st.items.find(i => findCraft(i.name) && nospace(i.name).startsWith(nospace(arg)));
            if (!it || !findCraft(it.name)) { log.push({ k: 'warn', t: `심사에 낼 물건(${arg.trim()})이 없다` }); break; }
            if (!['제도 루미에른', '바르그홀름'].includes(marketOf(st.location))) { log.push({ k: 'warn', t: '걸작 심사는 제도나 바르그홀름의 장인 길드 본관에서 받는다' }); break; }
            const A = st.orgs.artisan; A.exams = A.exams || {};
            const rk = Object.keys(MASTER_EXAM).map(Number).find(x => x > A.rank && !A.exams[x]);
            if (!rk) { log.push({ k: 'info', t: '지금 받을 심사가 없다' }); break; }
            removeItem(st, it.name, 1);
            if (!examFits(it.name, rk)) { log.push({ k: 'warn', t: `심사 탈락 — 낸 물건(${it.name})이 ${MASTER_EXAM[rk][2]}에 미치지 못했다` }); break; }
            A.exams[rk] = st.day; st.renown += rk * 3;
            log.push({ k: 'rank', t: `걸작 심사 통과 — 길드 본관에 걸린 ${it.name} (${ORGS.artisan.ranks[rk]} 승급 자격) · 명성 +${rk * 3}` });
            if (A.merit >= meritNeed(st, rk) && A.rank === rk - 1) { A.rank = rk; log.push({ k: 'rank', t: `승급 — ${orgLabel('artisan', rk)}` }); }
            break;
        }
        case 'orderTake': case 'orderDeliver': case 'orderDrop': {
            if (key === 'orderTake') {
                const o = craftOrders(st).find(x => nospace(x.id) === nospace(arg) || nospace(`${x.client}${x.item}`).includes(nospace(arg)));
                if (!o) { log.push({ k: 'warn', t: '그런 주문이 없다' }); break; }
                if (o.taken) break;
                if ((st.commissions || []).length >= 3) { log.push({ k: 'warn', t: '주문은 세 건까지만 맡을 수 있다' }); break; }
                st.commissions.push({ ...o, due: st.day + o.days, taken: true });
                log.push({ k: 'info', t: `주문 수락 — ${o.client}: ${o.item} ${o.qty}개 (${o.qmin} 이상) · ${o.days}일 안에` });
                break;
            }
            const c = (st.commissions || []).find(x => nospace(x.id) === nospace(arg) || nospace(`${x.client}${x.item}`).includes(nospace(arg)) || nospace(x.item) === nospace(arg));
            if (!c) { log.push({ k: 'warn', t: '맡은 주문이 없다' }); break; }
            if (key === 'orderDrop') {
                st.commissions.splice(st.commissions.indexOf(c), 1);
                if (st.orgs.artisan) st.strikes.push({ why: `주문 포기 (${c.client})`, day: st.day, org: 'artisan' });
                log.push({ k: 'warn', t: `주문 포기 — ${c.client}의 신뢰를 잃었다${st.orgs.artisan ? ' · 장인 길드 경고' : ''}` });
                break;
            }
            const qi = QUALITY.findIndex(q => q[0] === c.qmin);
            const ok = st.items.filter(i => findCraft(i.name)?.[0] === c.item && QUALITY.findIndex(q => q[0] === qualityOf(i.name)) >= qi);
            const have = ok.reduce((a, i) => a + i.qty, 0);
            if (have < c.qty) { log.push({ k: 'warn', t: `${c.item} ${c.qmin} 이상이 ${c.qty}개 필요하다 (지금 ${have})` }); break; }
            let left = c.qty;
            for (const i of ok.sort((a, b) => QUALITY.findIndex(q => q[0] === qualityOf(a.name)) - QUALITY.findIndex(q => q[0] === qualityOf(b.name)))) { const n = Math.min(left, i.qty); removeItem(st, i.name, n); left -= n; if (!left) break; }
            const late = st.day > c.due;
            const pay = late ? Math.round(c.total * 0.7) : c.total;
            st.money += pay; st.commissions.splice(st.commissions.indexOf(c), 1);
            if (st.orgs.artisan) st.orgs.artisan.merit += Math.round(c.qty * (2 + findCraft(c.item)[2]) * 3);
            st.renown += late ? 0 : 1;
            log.push({ k: 'gain', t: `주문 납품 — ${c.client}: ${c.item} ${c.qty}개 +${formatMoney(pay)}${late ? ' (기한을 넘겨 3할 깎임)' : ''}` });
            break;
        }
        case 'craft': {
            // 제작 장검 3
            const m = arg.match(/^(.*?)\s*[x×]?\s*(\d+)?\s*(개|자루|벌|점)?\s*$/);
            const g = findCraft(m ? m[1] : arg);
            if (!g) { log.push({ k: 'warn', t: `'${(m ? m[1] : arg).trim()}' — 공방 제작 목록에 없는 물건 (직접 만든 물건은 "아이템 +이름"으로)` }); break; }
            const qty = Math.max(1, parseInt(m?.[2]) || 1);
            const [name, skill, need, base, rate] = g;
            const rank = st.life?.[skill]?.rank ?? -1;
            if (rank < need) { log.push({ k: 'warn', t: `${josa(name, '을', '를')} 만들려면 ${skill} ${LIFE_RANKS[need]} 랭크 이상` }); break; }
            const cost = Math.round(base * 0.35 * qty);
            if (st.money < cost) { log.push({ k: 'warn', t: `재료비가 모자라다 (${formatMoney(cost)})` }); break; }
            const days = Math.max(1, Math.ceil(qty / rate));
            st.money -= cost;
            const r = rng(hashStr(`craft|${st.day}|${name}|${qty}`)); r();
            const d20 = Math.ceil(r() * 20);
            const score = d20 + (rank - need) * 3 + statMod(st.stats?.[LIFE[skill].stat] ?? 15) + Math.floor(focusBonus(st, skill) / 2);
            let qi = score < 6 ? 0 : score < 13 ? 1 : score < 19 ? 2 : score < 25 ? 3 : 4;
            if (qi === 4 && (rank < 5 || d20 < 17)) qi = 3; // 걸작은 B 랭크 이상에서, 그날의 손이 따라 줄 때만
            const q = QUALITY[qi][0];
            log.push({ k: 'loss', t: `${name} ${qty}개 작업 시작 — 재료비 -${formatMoney(cost)} · ${days}일` });
            log.push(...applyOps(st, parseOpLines([`날짜 +${days}일`])));
            addItem(st, `${name} (${q})`, qty);
            log.push({ k: 'gain', t: `${name} (${q}) ${qty}개 완성${qi >= 3 ? ' — 솜씨가 빛났다!' : qi === 0 ? ' — 마음에 들지 않는다' : ''}` });
            trainLife(st, skill, Math.round(qty * (2 + need * 2) / Math.max(1, rate) + 3), log);
            break;
        }
        case 'deliver': {
            // 납품 장검 (양품) 3
            const m = arg.match(/^(.*?\)?)\s*[x×]?\s*(\d+)?\s*(개|자루|벌|점)?\s*$/);
            const nm = (m ? m[1] : arg).trim();
            const it = st.items.find(i => nospace(i.name) === nospace(nm)) || st.items.find(i => findCraft(i.name) && nospace(i.name).startsWith(nospace(nm)));
            if (!it || !findCraft(it.name)) { log.push({ k: 'warn', t: `납품할 ${josa(nm, '이', '가')} 없다` }); break; }
            const market = marketOf(st.location);
            if (!market) { log.push({ k: 'warn', t: '납품처가 있는 도시·마을로 가야 한다' }); break; }
            if (deliveryBlocked(market, st.day)) { log.push({ k: 'warn', t: `${weatherOf(st.day, market)} 때문에 납품처로 가는 길이 막혔다 — 날이 개면 다시` }); break; }
            const n = Math.min(it.qty, Math.max(1, parseInt(m?.[2]) || it.qty));
            const line = lineOf(findCraft(it.name)[1]);
            const key2 = `${ymOf(st.day)}|${market}|납품:${line}`;
            let total = 0;
            for (let k = 0; k < n; k++) { total += deliveryQuote(st, it.name, market).unit; st.market[key2] = (st.market[key2] || 0) + 1; }
            const nm2 = it.name;
            removeItem(st, nm2, n); st.money += total;
            if (st.orgs.artisan) st.orgs.artisan.merit += Math.round(n * (1 + findCraft(nm2)[2]) * 2);
            log.push({ k: 'gain', t: `${nm2} ${n}개 납품 (${CRAFT_LINES[line].buyer.split('·')[0]} 등) +${formatMoney(total)}` });
            break;
        }
        case 'display': {
            // 진열 가게이름 | 장검 (양품) 3
            const [sn, rest = ''] = arg.split(/\s*[|｜]\s*/);
            const sh = findShop(st, sn); if (!sh) { log.push({ k: 'warn', t: `'${sn}' 가게가 없다` }); break; }
            const m = rest.match(/^(.*?\)?)\s*(\d+)?\s*$/);
            const it = st.items.find(i => nospace(i.name) === nospace(m?.[1] || '')) || st.items.find(i => findCraft(i.name) && nospace(i.name).startsWith(nospace(m?.[1] || '')));
            if (!it || !findCraft(it.name)) { log.push({ k: 'warn', t: it ? `${it.name} — 진열은 공방에서 만든 물건만 (가게 재고는 "재고 가게 | 금액")` : `진열할 '${(m?.[1] || rest).trim()}'이(가) 소지품에 없다` }); break; }
            const sk = findCraft(it.name)[1];
            if (SHOP_KINDS[sh.kind]?.[3] !== sk && !['잡화', '무기·방구', '옷·직물', '약재', '식료품'].includes(sh.kind)) { log.push({ k: 'warn', t: `${sh.name}에서는 ${josa(it.name, '을', '를')} 팔지 않는다` }); break; }
            const n = Math.min(it.qty, Math.max(1, parseInt(m?.[2]) || it.qty));
            const v = Math.round(craftValue(it.name) * 0.75 * n);
            removeItem(st, it.name, n); sh.stock += v;
            log.push({ k: 'info', t: `${sh.name}에 ${it.name} ${n}개 진열 (재고 +${formatMoney(v)})` });
            break;
        }
        case 'gather': {
            // 생산 채집 3일
            const m = arg.match(/^(.*?)\s*(\d+)\s*일?\s*$/);
            const skill = normLife(m ? m[1] : arg); const good = GATHER[skill];
            if (!good) throw 0;
            const rank = st.life?.[skill]?.rank ?? -1;
            if (rank < 0) { log.push({ k: 'warn', t: `${josa(skill, '을', '를')} 익히지 않았다` }); break; }
            const days = Math.max(1, Math.min(30, parseInt(m?.[2]) || 1));
            const place = placeKind(st.location);
            const mk = marketOf(st.location);
            let got = 0, bad = 0;
            for (let d = 1; d <= days; d++) {
                const w = weatherOf(st.day + d, mk || '제도 루미에른');
                const wf = ['폭우', '폭설'].includes(w) ? 0 : ['비', '눈', '진눈깨비'].includes(w) ? 0.6 : 1;
                if (!wf) bad++;
                got += (0.6 + rank * 0.25) * wf * (place === 'city' ? 0.4 : place === 'village' ? 0.8 : 1);
            }
            const units = Math.max(0, Math.round(got));
            log.push(...applyOps(st, parseOpLines([`날짜 +${days}일`])));
            if (units) addItem(st, good, units);
            log.push({ k: units ? 'gain' : 'info', t: `${skill} ${days}일 — ${good} ${units}짐${bad ? ` (궂은 날씨로 ${bad}일 쉼)` : ''}${place === 'city' ? ' · 도시 근처라 거둔 게 적다' : ''}` });
            trainLife(st, skill, days * 2, log);
            break;
        }
        case 'shopOpen': {
            // 가게개업 이름 | 업종 | 노점·점포·상회
            const [name, kind0 = '잡화', tier0 = '노점'] = arg.split(/\s*[|｜]\s*/).map(x => x.trim());
            const kind = SHOP_KINDS[kind0] ? kind0 : Object.keys(SHOP_KINDS).find(k => kind0.includes(k) || k.includes(kind0)) || '잡화';
            const tier = SHOP_TIERS[tier0] ? tier0 : Object.keys(SHOP_TIERS)[Math.max(0, (SHOP_KINDS[kind][4] || []).indexOf(tier0))];
            const T = SHOP_TIERS[tier]; if (!name || !T) throw 0;
            const market = marketOf(st.location);
            if (!market) { log.push({ k: 'warn', t: '가게를 열 시장이 없는 곳이다' }); break; }
            if (findShop(st, name)) { log.push({ k: 'warn', t: `이미 '${name}'이라는 가게가 있다` }); break; }
            const can = canRunTier(st, kind, tier);
            const tname = SHOP_KINDS[kind][4]?.[Object.keys(SHOP_TIERS).indexOf(tier)] || tier;
            if (!can.ok) { log.push({ k: 'warn', t: `${josa(tname, '을', '를')} 열려면 ${can.why}` }); break; }
            if (st.money < T.open) { log.push({ k: 'warn', t: `개업 자금이 모자라다 (${formatMoney(T.open)})` }); break; }
            st.money -= T.open;
            const sh0 = { name, market, kind, tier, stock: 0, staff: 0, rep: tier === '노점' ? 10 : tier === '점포' ? 20 : 35, till: 0, since: st.day };
            if (isFoodShop(kind)) Object.assign(sh0, { menu: [kind === '주점' ? '소시지와 절인 양배추' : '감자 스튜'], signature: null, fame: 0, district: tier === '노점' ? '시장통' : '골목' });
            st.shops.push(sh0);
            log.push({ k: 'rank', t: `${market}에 ${tname} '${name}' 개업 (${kind}) -${formatMoney(T.open)}` });
            break;
        }
        case 'shopStock': case 'shopCollect': case 'shopStaff': case 'shopUp': case 'shopRep': case 'shopClose': {
            const [name, rest = ''] = arg.split(/\s*[|｜]\s*/);
            let sh = findShop(st, name);
            let extra = rest;
            if (!sh) { // "재고 가게이름 3금"처럼 | 없이 적은 경우
                const m = arg.match(/^(.*?)\s+([+\-−=]?\s*[\d][\s\S]*|전부|점포|상회|노점)$/);
                if (m) { sh = findShop(st, m[1]); extra = m[2]; }
            }
            if (!sh) { log.push({ k: 'warn', t: `'${name}' 가게가 없다` }); break; }
            const here = marketOf(st.location) === sh.market;
            if (key === 'shopStock') {
                let v = Math.abs(parseMoney(extra.replace(/^[+]/, ''))?.value || 0);
                if (!v) throw 0;
                v = Math.min(v, st.money);
                if (!here && !sh.staff) { log.push({ k: 'warn', t: `${sh.name}에 점원이 없어 멀리서는 물건을 채울 수 없다` }); break; }
                const fee = here ? 0 : Math.round(v * 0.1);
                st.money -= v; sh.stock += v - fee;
                log.push({ k: 'loss', t: `${sh.name} 재고 +${formatMoney(v - fee)}${fee ? ` (운송비 ${formatMoney(fee)})` : ''}` });
            } else if (key === 'shopCollect') {
                if (sh.till <= 0) { log.push({ k: 'info', t: `${sh.name} 금고가 비어 있다` }); break; }
                if (here) { st.money += sh.till; log.push({ k: 'gain', t: `${sh.name} 수금 +${formatMoney(sh.till)}` }); }
                else if (st.orgs.merchant) { const fee = Math.max(1, Math.round(sh.till * 0.02)); st.bank += sh.till - fee; log.push({ k: 'gain', t: `${sh.name} 매출을 길드 어음으로 예금 +${formatMoney(sh.till - fee)} (수수료 ${formatMoney(fee)})` }); }
                else { log.push({ k: 'warn', t: `${sh.name}에 가야 수금할 수 있다 (상인 길드원은 어음으로 예금 가능)` }); break; }
                sh.till = 0;
            } else if (key === 'shopStaff') {
                const d = parseInt(String(extra).replace('−', '-')) || 1;
                const max = sh.tier === '노점' ? 1 : sh.tier === '점포' ? 4 : 12;
                const n2 = Math.max(0, Math.min(max, sh.staff + d));
                if (n2 === sh.staff) { log.push({ k: 'info', t: `${sh.name} 점원 ${sh.staff}명 (최대 ${max})` }); break; }
                log.push({ k: 'info', t: `${sh.name} 점원 ${n2 > sh.staff ? '고용' : '내보냄'} — ${n2}명 (하루 급료 ${formatMoney(n2 * WAGE[sh.tier])})` });
                sh.staff = n2;
            } else if (key === 'shopUp') {
                const tier = SHOP_TIERS[extra.trim()] ? extra.trim() : sh.tier === '노점' ? '점포' : '상회';
                const T = SHOP_TIERS[tier];
                if (Object.keys(SHOP_TIERS).indexOf(tier) <= Object.keys(SHOP_TIERS).indexOf(sh.tier)) break;
                const can = canRunTier(st, sh.kind, tier);
                if (!can.ok) { log.push({ k: 'warn', t: `${josa(sh.name, '을', '를')} 키우려면 ${can.why}` }); break; }
                if (st.money < T.open) { log.push({ k: 'warn', t: `확장 자금이 모자라다 (${formatMoney(T.open)})` }); break; }
                st.money -= T.open; sh.tier = tier; sh.rep = Math.max(sh.rep, tier === '점포' ? 20 : 35);
                log.push({ k: 'rank', t: `${sh.name} — ${shopTierName(sh)} 규모로 확장 -${formatMoney(T.open)}` });
            } else if (key === 'shopRep') {
                const v = parseInt(String(extra).replace('−', '-')) || 0;
                sh.rep = Math.max(0, Math.min(100, sh.rep + v));
                log.push({ k: v >= 0 ? 'gain' : 'loss', t: `${sh.name} 평판 ${v >= 0 ? '+' : ''}${v}` });
            } else if (key === 'shopClose') {
                const back = Math.round(sh.stock * 0.5) + Math.max(0, sh.till);
                st.money += back; st.shops.splice(st.shops.indexOf(sh), 1);
                log.push({ k: 'info', t: `${sh.name} 폐업 — 재고 처분·금고 +${formatMoney(back)}` });
            }
            break;
        }
        case 'farmBuy': case 'farmSellLand': case 'farmPlant': case 'farmClear': case 'stockBuy': case 'stockSell': case 'farmWorker': case 'farmSteward': case 'brew': case 'farmShip': case 'farmLoad': case 'farmHorse': case 'farmGood': {
            st.farms = st.farms || [];
            const parts = arg.split(/\s*[|｜]\s*/);
            const fname = parts[0], rest = parts[1] || '', extra = parts[2] || '';
            const numOf = (t, d = 1) => { const m = String(t).match(/([+\-−]?\d+)/); return m ? parseInt(m[1].replace('−', '-')) : d; };
            const word = (t) => String(t).replace(/[+\-−]?\d+\s*(필지|마리|통|개|명|짐|자루|상자)?/g, '').trim();
            const mk = marketOf(st.location);
            let f = findFarm(st, fname);
            if (key === 'farmBuy') {
                if (!mk) { log.push({ k: 'warn', t: '땅을 살 수 있는 곳이 아니다 (도시·마을의 토지 중개인을 거쳐야 한다)' }); break; }
                if (f && f.market !== mk) { log.push({ k: 'warn', t: `${josa(f.name, '은', '는')} ${mk}에 있지 않다` }); break; }
                const n = Math.max(1, numOf(rest));
                const fr = /과수원/.test(extra + rest) ? findOrchard(word(extra.replace('과수원', '')) || word(rest.replace('과수원', ''))) : null;
                const lp = LAND_PRICE[mk] || 20000;
                const price = n * lp + (fr ? n * fr[5] * 6 : 0);
                if (st.money < price) { log.push({ k: 'warn', t: `돈이 모자라다 (${formatMoney(price)})` }); break; }
                const t0 = landTitle(st);
                st.money -= price;
                if (!f) { f = { name: fname.trim() || `${mk} 농장`, market: mk, plots: 0, fields: [], orchards: [], pasture: 0, tenant: 0, herd: {}, breed: {}, store: {}, cellar: [], workers: 0, steward: false, since: st.day }; st.farms.push(f); }
                f.plots += n;
                if (fr) f.orchards.push({ fruit: fr[0], plots: n, planted: st.day - fr[2] - 360 });
                log.push({ k: 'loss', t: `${f.name}(${mk}) — 땅 ${n}필지${fr ? ` (열매 맺는 ${fr[0]} 과수원)` : ''} 구입 -${formatMoney(price)} · 모두 ${f.plots}필지` });
                const t1 = landTitle(st);
                if (t1 !== t0) log.push({ k: 'rank', t: `이제 사람들이 당신을 '${t1}'${/[가-힣]$/.test(t1) && (t1.charCodeAt(t1.length - 1) - 0xAC00) % 28 ? '이라' : '라'} 부른다 (땅 ${landTotal(st)}필지)` });
                break;
            }
            if (!f) { log.push({ k: 'warn', t: `'${fname}' 농장이 없다` }); break; }
            const here = mk === f.market;
            const reach = here || f.steward || !!f.kin;
            const U = farmUse(f);
            if (key === 'farmSellLand') {
                const all = /전부|모두/.test(rest);
                const lp = LAND_PRICE[f.market] || 20000;
                if (!here) { log.push({ k: 'warn', t: `땅은 ${f.market}에 가서 팔아야 한다` }); break; }
                if (all) {
                    const herdV = LIVESTOCK.reduce((a, x) => a + (f.herd[x[0]] || 0) * x[1] * 0.7, 0);
                    const orchV = f.orchards.reduce((a, o) => a + o.plots * (findOrchard(o.fruit)?.[5] || 0) * (st.day - o.planted >= (findOrchard(o.fruit)?.[2] || 0) ? 4 : 1), 0);
                    const v = Math.round(f.plots * lp * 0.85 + herdV + orchV);
                    st.money += v; st.farms.splice(st.farms.indexOf(f), 1);
                    log.push({ k: 'gain', t: `${f.name}을 통째로 팔았다 +${formatMoney(v)} (땅·가축·과수원)` });
                } else {
                    const n = Math.min(U.free, Math.max(1, numOf(rest)));
                    if (n <= 0) { log.push({ k: 'warn', t: `놀리는 땅이 없다 — 먼저 휴경하거나 소작을 거둘 것` }); break; }
                    f.plots -= n; st.money += Math.round(n * lp * 0.85);
                    log.push({ k: 'gain', t: `${f.name} 땅 ${n}필지 매각 +${formatMoney(Math.round(n * lp * 0.85))}` });
                }
                break;
            }
            if (key === 'farmPlant' || key === 'farmClear') {
                const n = Math.max(1, numOf(rest)), w = word(rest);
                if (key === 'farmPlant') {
                    if (!reach) { log.push({ k: 'warn', t: `${f.market}에 가거나 관리인을 두어야 땅을 부릴 수 있다` }); break; }
                    if (U.free < n) { log.push({ k: 'warn', t: `놀리는 땅이 ${U.free}필지뿐이다` }); break; }
                    if (/목초|목장|풀밭/.test(w)) { f.pasture += n; log.push({ k: 'info', t: `${f.name} — ${n}필지를 목초지로` }); break; }
                    if (/소작/.test(w)) { f.tenant += n; log.push({ k: 'info', t: `${f.name} — ${n}필지를 소작인에게 내줌 (달마다 소작료 ${formatMoney(Math.round(n * (LAND_PRICE[f.market] || 20000) * TENANT_RENT))})` }); break; }
                    const c = findCrop(w), o = findOrchard(w);
                    if (c) { const ex = f.fields.find(x => x.crop === c[0] && x.since === st.day); if (ex) ex.plots += n; else f.fields.push({ crop: c[0], plots: n, since: st.day }); log.push({ k: 'info', t: `${f.name} — ${c[0]} ${n}필지 심음 (${c[1].join('·')}월 수확${climate(f, c[0]) < 0.8 ? ' · 이 땅엔 잘 맞지 않는다' : climate(f, c[0]) > 1.05 ? ' · 이 땅과 잘 맞는다' : ''})` }); break; }
                    if (o) {
                        const cost = n * o[5];
                        if (st.money < cost) { log.push({ k: 'warn', t: `묘목 값이 모자라다 (${formatMoney(cost)})` }); break; }
                        st.money -= cost; f.orchards.push({ fruit: o[0], plots: n, planted: st.day });
                        log.push({ k: 'loss', t: `${f.name} — ${o[0]} 묘목 ${n}필지 -${formatMoney(cost)} (첫 열매까지 약 ${Math.round(o[2] / 30)}달${climate(f, o[0]) < 0.8 ? ' · 이 땅엔 잘 맞지 않는다' : ''})` });
                        break;
                    }
                    log.push({ k: 'warn', t: `'${w}' — 심을 수 없는 것` }); break;
                }
                // 휴경
                if (/목초|목장/.test(w)) { const k2 = Math.min(n, f.pasture); f.pasture -= k2; log.push({ k: 'info', t: `${f.name} 목초지 ${k2}필지를 비움` }); break; }
                if (/소작/.test(w)) { const k2 = Math.min(n, f.tenant); f.tenant -= k2; log.push({ k: 'info', t: `${f.name} 소작지 ${k2}필지를 거둬들임` }); break; }
                let left = n; const isO = !!findOrchard(w);
                const arr = isO ? f.orchards : f.fields, keyN = isO ? 'fruit' : 'crop';
                for (const x of arr.filter(x => nospace(w).startsWith(x[keyN]))) { const k2 = Math.min(left, x.plots); x.plots -= k2; left -= k2; if (!left) break; }
                for (let i = arr.length - 1; i >= 0; i--) if (arr[i].plots <= 0) arr.splice(i, 1);
                log.push({ k: 'info', t: `${f.name} — ${w} ${n - left}필지를 갈아엎고 놀림${isO ? ' (나무를 베었다)' : ''}` });
                break;
            }
            if (key === 'stockBuy' || key === 'stockSell') {
                const a = findStock(word(rest)); if (!a) { log.push({ k: 'warn', t: `'${word(rest)}' — 기를 수 있는 가축이 아니다 (${LIVESTOCK.map(x => x[0]).join('·')})` }); break; }
                let n = Math.max(1, numOf(rest));
                if (!reach) { log.push({ k: 'warn', t: `${f.market}에 가거나 관리인을 두어야 한다` }); break; }
                if (key === 'stockBuy') {
                    const cost = n * a[1];
                    if (st.money < cost) { log.push({ k: 'warn', t: `돈이 모자라다 (${formatMoney(cost)})` }); break; }
                    st.money -= cost; f.herd[a[0]] = (f.herd[a[0]] || 0) + n;
                    const fd = farmFeed(f);
                    log.push({ k: 'loss', t: `${f.name} — ${a[0]} ${n}마리 들임 -${formatMoney(cost)} (모두 ${f.herd[a[0]]}마리)${fd.cover < 1 && a[3] ? ` · 목초지가 모자라 꼴을 사 먹여야 한다 (${fd.pastureNeed}필지 필요)` : ''}` });
                } else {
                    n = Math.min(n, f.herd[a[0]] || 0); if (!n) { log.push({ k: 'warn', t: `${f.name}에 팔 ${a[0]}이(가) 없다` }); break; }
                    const v = Math.round(n * a[1] * (0.85 + (st.life?.목축?.rank ?? 0) * 0.04) * (affairsOf(st.day).some(x => x.name === '전쟁 소문') && a[0] === '짐말' ? 1.4 : 1));
                    f.herd[a[0]] -= n; st.money += v;
                    log.push({ k: 'gain', t: `${f.name} — ${a[0]} ${n}마리 팔았다 +${formatMoney(v)}` });
                }
                break;
            }
            if (key === 'farmWorker') {
                const d = numOf(rest, 1);
                if (!reach) { log.push({ k: 'warn', t: `${f.market}에 가거나 관리인을 두어야 일꾼을 부릴 수 있다` }); break; }
                const n2 = Math.max(0, Math.min(200, (f.workers || 0) + d));
                log.push({ k: 'info', t: `${f.name} 일꾼 ${n2 > f.workers ? '고용' : '내보냄'} — ${n2}명 (달마다 품삯 ${formatMoney(n2 * WORKER_WAGE)})` });
                f.workers = n2; break;
            }
            if (key === 'farmSteward') {
                const on = !/해고|내보|그만/.test(rest);
                if (on && !here) { log.push({ k: 'warn', t: `관리인은 ${f.market}에 가서 직접 뽑아야 한다` }); break; }
                f.steward = on;
                log.push({ k: 'info', t: `${f.name} 관리인 ${on ? `고용 — 달마다 ${formatMoney(STEWARD_WAGE)}. 이제 멀리서도 농장을 부리고 내다 팔 수 있다` : '내보냄'}` });
                break;
            }
            if (key === 'brew') {
                if (!reach) { log.push({ k: 'warn', t: `${f.market}에 가거나 관리인을 두어야 술을 담글 수 있다` }); break; }
                const w = word(rest);
                const drink = Object.keys(BREW).find(k => nospace(k).startsWith(nospace(w).replace('통', ''))) || Object.keys(BREW).find(k => BREW[k][0].startsWith(w));
                if (!drink) { log.push({ k: 'warn', t: `'${w}' — 담글 수 없는 술` }); break; }
                const [src, per] = BREW[drink];
                let n = Math.max(1, numOf(rest));
                n = Math.min(n, Math.floor((f.store[src] || 0) / per));
                if (!n) { log.push({ k: 'warn', t: `${src}가 모자라다 (한 통에 ${per}개)` }); break; }
                const r = st.life?.양조?.rank ?? 0;
                f.store[src] -= n * per; if (f.store[src] <= 0) delete f.store[src];
                f.cellar = f.cellar || [];
                f.cellar.push({ drink, qty: n, q: Math.round((0.8 + r * 0.1) * 100) / 100, day: st.day });
                log.push({ k: 'gain', t: `${f.name} — ${drink} ${n}통을 담갔다 (${src} ${n * per}개)${BREW[drink][2] ? ' · 묵힐수록 값이 오른다' : ''}` });
                trainLife(st, '양조', Math.min(30, n * 2), log);
                break;
            }
            if (key === 'farmShip' || key === 'farmLoad') {
                if (!reach || (key === 'farmLoad' && !here)) { log.push({ k: 'warn', t: key === 'farmLoad' ? `짐은 ${f.market}에서 직접 실어야 한다` : `${f.market}에 가거나 관리인을 두어야 내다 팔 수 있다` }); break; }
                const g = findFarmGood(word(rest)); if (!g) { log.push({ k: 'warn', t: `'${word(rest)}' — 농장에 없는 것` }); break; }
                const lots = (f.cellar || []).filter(l => l.drink === g).sort((a, b) => a.day - b.day);
                const have = (f.store[g] || 0) + lots.reduce((a, l) => a + l.qty, 0);
                let n = /전부|모두/.test(rest) ? have : Math.max(1, numOf(rest));
                n = Math.min(n, have);
                if (!n) { log.push({ k: 'warn', t: `${g}가 없다` }); break; }
                if (key === 'farmLoad') {
                    if (!findTrade(g)) { log.push({ k: 'warn', t: `${josa(g, '은', '는')} 교역품이 아니라 짐마차에 실어 팔 수 없다 — 농장에서 출하할 것` }); break; }
                    const room = cargoCap(st) - cargoUsed(st); n = Math.min(n, room);
                    if (n <= 0) { log.push({ k: 'warn', t: '짐이 가득 찼다' }); break; }
                }
                let value = 0, left = n;
                const unit = farmPrice(st, f, g);
                const fromStore = Math.min(left, f.store[g] || 0);
                if (fromStore) { f.store[g] -= fromStore; left -= fromStore; value += fromStore * unit; if (f.store[g] <= 0) delete f.store[g]; }
                for (const l of lots) { if (!left) break; const k2 = Math.min(left, l.qty); l.qty -= k2; left -= k2; value += Math.round(k2 * unit * drinkValue(l, st.day) / FARM_GOODS[g][0]); }
                f.cellar = (f.cellar || []).filter(l => l.qty > 0);
                if (key === 'farmLoad') { addItem(st, g, n); log.push({ k: 'info', t: `${f.name}에서 ${g} ${n}짐을 실었다 — 시장에서 교역품으로 팔 수 있다` }); break; }
                const sh = extra && findShop(st, extra);
                if (sh) {
                    const fee = sh.market === f.market ? 0 : Math.round(value * 0.1);
                    sh.stock += value - fee;
                    log.push({ k: 'info', t: `${f.name}의 ${g} ${n}개를 ${sh.name}로 보냄 — 재고 +${formatMoney(value - fee)}${fee ? ` (운송비 ${formatMoney(fee)})` : ''}` });
                } else {
                    st.money += value;
                    log.push({ k: 'gain', t: `${f.name} — ${g} ${n}개 출하 +${formatMoney(value)}` });
                }
                break;
            }
            if (key === 'farmHorse') {
                if (!here) { log.push({ k: 'warn', t: `말은 ${f.market}에 가서 데려와야 한다` }); break; }
                if (!(f.herd.짐말 > 0)) { log.push({ k: 'warn', t: `${f.name}에 짐말이 없다` }); break; }
                f.herd.짐말 -= 1;
                addCompanion(st, { name: rest && !/^\d/.test(rest) ? rest.trim() : `${f.name}의 말`, kind: '마수', species: '말', bond: 45, grade: 1 }, log);
                break;
            }
            if (key === 'farmGood') {
                const g = findFarmGood(word(rest)); if (!g) throw 0;
                const v = numOf(rest, 0);
                f.store[g] = Math.max(0, (f.store[g] || 0) + v); if (!f.store[g]) delete f.store[g];
                log.push({ k: v >= 0 ? 'gain' : 'loss', t: `${f.name} ${g} ${v >= 0 ? '+' : ''}${v}` });
                break;
            }
            break;
        }
        case 'pregnant': case 'birth': case 'childAdd': case 'childName': case 'childHeir': case 'childRole': case 'passGen': {
            st.children = st.children || [];
            const parts = arg.split(/\s*[|｜]\s*/);
            if (key === 'pregnant') {
                if (st.expecting) { log.push({ k: 'info', t: '이미 아이를 기다리고 있다' }); break; }
                st.expecting = { due: st.day + PREGNANCY, with: (parts[0] || st.spouse?.name || '').trim() };
                log.push({ k: 'gain', t: `새 생명이 찾아왔다${st.expecting.with ? ` (${josa(st.expecting.with, '과', '와')}의 아이)` : ''} — 약 아홉 달 뒤 ${formatDate(st.expecting.due).m}월 무렵` });
                break;
            }
            if (key === 'birth') {
                const sex = /여|딸/.test(parts[1] || '') ? '여' : /남|아들/.test(parts[1] || '') ? '남' : null;
                bornChild(st, log, (parts[0] || '').trim() || null, sex, st.expecting?.with || parts[2]);
                st.expecting = null; break;
            }
            if (key === 'childAdd') {
                const name = (parts[0] || '').replace(/^\+/, '').trim(); if (!name) throw 0;
                const sex = /여|딸/.test(parts[1] || '') ? '여' : '남';
                const age = Math.max(0, parseInt(parts[2]) || 0);
                st.children.push({ id: `c${st.day}${st.children.length}`, name, sex, born: st.day - age * 360, other: (parts[3] || '').trim(), heir: false, role: null });
                log.push({ k: 'gain', t: `${josa(name, '이', '가')} 가족이 되었다 (${sex === '남' ? '아들' : '딸'}, ${age}살)` });
                break;
            }
            let c = findChild(st, parts[0]);
            const isSpouse = !c && key === 'childRole' && st.spouse && nospace(st.spouse.name) === nospace(parts[0] || '');
            if (isSpouse) c = st.spouse;
            if (!c) { log.push({ k: 'warn', t: `'${parts[0]}' — 자녀가 아니다` }); break; }
            if (key === 'childName') { const n = (parts[1] || '').trim(); if (!n) throw 0; log.push({ k: 'info', t: `${c.unnamed ? '아이' : c.name}의 이름 — ${n}` }); c.name = n; c.unnamed = false; break; }
            if (key === 'childHeir') { for (const x of st.children) x.heir = false; c.heir = true; log.push({ k: 'rank', t: `${josa(c.name, '을', '를')} 후계자로 정했다` }); break; }
            if (key === 'childRole') {
                for (const f of st.farms || []) if (f.kin === c.name) f.kin = null;
                for (const s2 of st.shops || []) if (s2.kin === c.name) s2.kin = null;
                const w = (parts[1] || '').trim();
                if (!w || /없음|그만|해제/.test(w)) { c.role = null; log.push({ k: 'info', t: `${c.name} — 가업에서 손을 뗐다` }); break; }
                if (!isSpouse && !childAdult(c, st.day) && childAge(c, st.day) < 13) { log.push({ k: 'warn', t: `${josa(c.name, '은', '는')} 아직 어리다 (열세 살부터 일을 거든다)` }); break; }
                const f = findFarm(st, w), s2 = !f && findShop(st, w);
                if (!f && !s2) { log.push({ k: 'warn', t: `'${w}' — 내 농장이나 가게가 아니다` }); break; }
                (f || s2).kin = c.name; c.role = (f || s2).name;
                log.push({ k: 'gain', t: `${josa(c.name, '이', '가')} ${josa((f || s2).name, '을', '를')} 맡아 돌본다${f ? ' (관리인 노릇 · 일손 +2)' : ' (일손 +1)'}` });
                break;
            }
            if (key === 'passGen') {
                if (!childAdult(c, st.day) && !/강제/.test(arg)) { log.push({ k: 'warn', t: `${josa(c.name, '은', '는')} 아직 어른이 아니다 (열여섯 살부터)` }); break; }
                passGeneration(st, c, log);
                break;
            }
            break;
        }
        case 'warServe': {
            if (!isTitled(st)) { log.push({ k: 'warn', t: '군역은 작위를 가진 사람의 의무다' }); break; }
            if (!warThisMonth(st.day)) { log.push({ k: 'info', t: '이달엔 소집령이 없다' }); break; }
            st.warServed = st.warServed || {};
            if (st.warServed[ymOf(st.day)]) break;
            st.warServed[ymOf(st.day)] = true;
            st.honor = st.honor || { pts: 0 }; st.honor.pts = (st.honor.pts || 0) + 20;
            log.push({ k: 'rank', t: '소집령에 응해 군역에 나섰다 — 면제금 없음 · 공훈 +20' });
            traceTitle(st, '소집에 응한 자', log); if (Object.keys(st.warServed || {}).length >= 3) traceTitle(st, '전장을 아는 자', log);
            honorCheck(st, log);
            break;
        }
        case 'supplyLink': {
            const [sn, fn = ''] = arg.split(/\s*[|｜]\s*/);
            const s2 = findShop(st, sn); if (!s2) { log.push({ k: 'warn', t: `'${sn}' 가게가 없다` }); break; }
            if (!fn || /없음|끊/.test(fn)) { s2.supply = null; log.push({ k: 'info', t: `${s2.name} — 농장 재료 받기를 그만둠` }); break; }
            const f = findFarm(st, fn); if (!f) { log.push({ k: 'warn', t: `'${fn}' 농장이 없다` }); break; }
            if (!['식당', '주점', '여관'].includes(s2.kind)) { log.push({ k: 'warn', t: '식당·주점·여관만 농장에서 재료를 받는다' }); break; }
            s2.supply = f.name;
            log.push({ k: 'info', t: `${s2.name} — 달마다 ${f.name}에서 기른 ${s2.kind !== '식당' ? '재료와 술을' : '재료를'} 받는다${f.market === s2.market ? '' : ' (운송비 1할)'} · 직접 기른 재료는 손님을 더 끈다` });
            break;
        }
        case 'staffName': {
            const [where, role, nn] = arg.split(/\s*[|｜]\s*/);
            const ns = namedStaff(st).filter(x => nospace(x.where) === nospace(where || '') || nospace(x.where).includes(nospace(where || '') || '-'));
            const p = ns.find(x => nospace(x.role) === nospace(role || '') || nospace(x.name) === nospace(role || '')) || ns.find(x => nospace(x.role).includes(nospace(role || '') || '-') || nospace(role || '').includes(nospace(x.role)));
            if (!p || !nn) { log.push({ k: 'warn', t: `${where || '?'}에서 '${role || '?'}' 일손을 찾지 못했다 (수첩의 일손 목록을 눌러 이름을 지을 수 있다)` }); break; }
            st.staffNames = st.staffNames || {};
            st.staffNames[p.id] = { ...(st.staffNames[p.id] || {}), name: nn.trim() };
            log.push({ k: 'info', t: `${p.where}의 ${p.role} — ${nn.trim()}` });
            break;
        }
        case 'famFavor': case 'famHeir': case 'famUnheir': case 'famInherit': case 'famDisown': case 'famReturn': {
            const f = st.family;
            if (!f) { log.push({ k: 'warn', t: '귀족 가문 출신이 아니다' }); break; }
            if (key === 'famFavor') {
                const v = parseInt(String(arg).replace('−', '-')) || 0;
                f.favor = Math.max(0, Math.min(100, (f.favor ?? 50) + v));
                log.push({ k: v >= 0 ? 'gain' : 'loss', t: `${f.house} 집안의 총애 ${v >= 0 ? '+' : ''}${v} (${f.favor})` });
            } else if (key === 'famHeir') { f.heir = true; log.push({ k: 'rank', t: `${f.house}의 후계자로 지명되었다` }); }
            else if (key === 'famUnheir') { f.heir = false; log.push({ k: 'warn', t: `${f.house}의 후계 자리를 잃었다${arg ? ` — ${arg}` : ''}` }); }
            else if (key === 'famInherit') {
                if (f.head) break;
                f.head = true; f.heir = false; f.disowned = false;
                st.noble = Math.max(st.noble, TITLE_RANK[f.title] || 4);
                if (houseOf(f.house)) st.houseFavor[houseOf(f.house).name] = 100;
                log.push({ k: 'rank', t: `${josa(f.house, '을', '를')} 물려받았다 — ${f.title} (달마다 영지 수입 ${formatMoney(TITLE_INCOME[f.title])})` });
            } else if (key === 'famDisown') { f.disowned = true; f.heir = false; log.push({ k: 'warn', t: `${josa(f.house, '과', '와')} 의절했다 — 생활비와 가문의 뒷배가 끊긴다` }); }
            else { f.disowned = false; f.favor = Math.max(f.favor ?? 0, 30); log.push({ k: 'gain', t: `${josa(f.house, '으로', '로')} 돌아갔다` }); }
            break;
        }
        case 'honor': case 'honorGrant': case 'honorHouse': {
            st.honor = st.honor || { pts: 0, title: null, hereditary: false, pending: null };
            if (key === 'honor') {
                const [a, why = ''] = arg.split(/\s*[|｜]\s*/);
                const v = parseInt(String(a).replace('−', '-')) || 0;
                st.honor.pts = Math.max(0, (st.honor.pts || 0) + v);
                log.push({ k: v >= 0 ? 'gain' : 'loss', t: `공훈 ${v >= 0 ? '+' : ''}${v}${why ? ` — ${why}` : ''} (${st.honor.pts})` });
                honorCheck(st, log);
            } else if (key === 'honorHouse') {
                const n = arg.trim().replace(/\s*(남작|자작|백작)?가$/, '');
                if (!n) throw 0;
                const t = (st.honor.title || st.honor.pending || '세습 남작').replace('세습 ', '').replace('일대 ', '');
                st.honor.houseName = `${n} ${TITLE_RANK[t] ? t : '남작'}가`;
                log.push({ k: 'info', t: `새 가문의 이름 — ${st.honor.houseName}` });
            } else {
                const [t, ...opt] = arg.split(/\s*[|｜]\s*/);
                const tt = [t, ...opt].join(' ');
                const name = HONORS.find(x => nospace(x[1]) === nospace(t))?.[1] || HONORS.find(x => nospace(t).includes(nospace(x[1].replace(/일대 |세습 /, ''))) && (/일대/.test(tt) ? !x[3] : /세습/.test(tt) ? x[3] : true))?.[1] || (TITLE_RANK[nospace(t)] ? nospace(t) : null);
                if (!name) throw 0;
                const he = opt.some(o => /세습/.test(o)) ? true : opt.some(o => /일대/.test(o)) ? false : undefined;
                const house = opt.find(o => !/세습|일대/.test(o));
                grantHonor(st, name, log, { hereditary: he, house: house ? `${house.replace(/가$/, '')}${/가$/.test(house) ? '가' : ''}` : undefined });
            }
            break;
        }
        case 'travel': {
            // 여행 하벤 | 마차 / 말 / 걸어서 / 짐배 / 짐마차 — 날짜·삯·위치를 한 번에
            const [dst, md] = arg.split(/\s*[|｜]\s*/);
            const mode = Object.keys(TRAVEL_MODES).find(k => (md || '').includes(k)) || (/배/.test(md || '') ? '짐배' : '마차');
            const q = travelQuote(st, dst, mode);
            if (q.error) { log.push({ k: 'warn', t: q.error }); break; }
            if (q.fare) { st.money = Math.max(0, st.money - q.fare); log.push({ k: 'loss', t: `${q.rental ? '역참 말 빌리기' : TRAVEL_MODES[mode][2] + ' 삯'} -${formatMoney(q.fare)}` }); }
            if (q.whole) log.push(...applyOps(st, parseOpLines([`날짜 +${q.whole}일`])));
            else { const t = (st.tod ?? 0) + q.quarters; if (t > 3) log.push(...applyOps(st, parseOpLines(['날짜 +1일']))); else st.tod = t; }
            st.location = q.to[1];
            { const drain = { 마차: 10, 짐배: 8, 말: 15, 짐마차: 15, 걸어서: 25 }[mode] || 10, e = energyOf(st); st.energy = Math.max(Math.min(e, 5), e - drain); log.push({ k: 'loss', t: `여독 — 기력 -${e - st.energy}` }); }
            log.push({ k: 'info', t: `→ ${q.to[1]} (${TRAVEL_MODES[mode][2]} · ${q.roads.join('·')} · ${travelLabel(q).split(' · ')[0]})` });
            if (q.winter) log.push({ k: 'warn', t: '겨울 산길 — 눈 때문에 평소보다 오래 걸렸다' });
            if (q.dangers.length) log.push({ k: 'info', t: `길의 위험: ${q.dangers.join(', ')}` });
            break;
        }
        case 'tod': {
            // 시간대 저녁 / 시간대 +1 — 밤을 넘기면 다음 날 아침
            const a = String(arg).trim(), cur = st.tod ?? 0;
            let next = TODS.findIndex(t => a.includes(t));
            if (/새벽/.test(a)) next = 0;
            if (next < 0) { const k = parseInt(a.match(/[+]?(\d+)/)?.[1]) || 1; next = cur + k; }
            if (next > 3 || (next < cur && !/^[+]/.test(a) && /아침|새벽/.test(a))) { log.push(...applyOps(st, parseOpLines(['날짜 +1일']))); next = next > 3 ? next % 4 : next; }
            const steps = next > cur ? next - cur : 0;
            st.tod = next;
            log.push({ k: 'info', t: `${TODS[next]}이 되었다`.replace('낮이', '낮이').replace('아침이', '아침이') });
            if (steps) { st.energy = Math.max(0, energyOf(st) - TOD_DRAIN * steps); }
            break;
        }
        case 'schedule': {
            // 인물일정 이름 | 아침 장소 | 낮 장소 | 저녁 장소 | 밤 장소  (장소는 "위치 · 자리" 또는 자리만)
            const [nm, ...ps] = arg.split(/\s*[|｜]\s*/);
            if (!nm) throw 0;
            st.schedules = st.schedules || {};
            if (/^(지움|삭제|없음)$/.test(ps[0] || '')) { delete st.schedules[nm.trim()]; log.push({ k: 'info', t: `${nm.trim()} — 정해 둔 일정을 지웠다` }); break; }
            const guess = (x) => { const d = Object.entries(DISTRICT_HINT).find(([re]) => new RegExp(re).test(x)); return d ? d[1] : st.location; };
            const toPlace = (x) => { if (!x) return null; const parts = x.split(/\s*·\s*/); return parts.length >= 3 ? [parts.slice(0, 2).join(' · '), parts.slice(2).join(' · ')] : parts.length === 2 && marketOf(parts[0]) ? [x, ''] : [guess(x), x]; };
            const at = [0, 1, 2, 3].map(i => toPlace(ps[i] || ps[ps.length - 1]));
            st.schedules[nm.trim()] = at;
            log.push({ k: 'info', t: `${nm.trim()}의 하루 — ${at.map((p, i) => `${TODS[i]} ${p?.[1] || p?.[0] || '?'}`).join(' · ')}` });
            break;
        }
        case 'stableCare': {
            // 마구간관리 농장 | 정성 / 보통 — 일손에게 맡겨 두는 돌봄 (시간이 흐르지 않는다)
            const [fn, mode] = arg.split(/\s*[|｜]\s*/);
            const f = findFarm(st, fn) || (st.farms || [])[0];
            if (!f) { log.push({ k: 'warn', t: '농장이 없다' }); break; }
            f.careMode = /정성|특별|좋/.test(mode || fn || '') ? '정성' : '보통';
            log.push({ k: 'info', t: `${f.name} 마구간 — ${f.careMode === '정성' ? '일손에게 정성껏 돌보게 했다 (말 한 마리당 달마다 2은, 일꾼·관리인·가족이 있어야 한다)' : '보통으로 돌보게 했다'}` });
            break;
        }
        case 'horseBuy': case 'horseSell': case 'horseBreed': case 'horseStud': case 'horseStudAccept': case 'horseBid': case 'horseCare': case 'horseRename': case 'horseRide': case 'horseGrade': {
            st.horseDeals = st.horseDeals || {};
            const parts = arg.split(/\s*[|｜]\s*/);
            const mk = marketOf(st.location), ym = ymOf(st.day);
            if (key === 'horseBuy') {
                // 말구입 말이름 | 농장
                const offers = horseMarket(st, mk);
                const o = offers.find(x => nospace(x.name) === nospace(parts[0]) && !x.bought) || offers.find(x => nospace(parts[0]).includes(nospace(x.name)) && !x.bought);
                if (!o) { log.push({ k: 'warn', t: `이달 ${mk || '이곳'} 말 시장에 '${parts[0]}'은 없다` }); break; }
                if (st.money < o.price) { log.push({ k: 'warn', t: `돈이 모자라다 (${formatMoney(o.price)})` }); break; }
                const f = parts[1] ? findFarm(st, parts[1]) : (st.farms || [])[0];
                st.money -= o.price; st.horseDeals[`${ym}|buy|${mk}|${o.idx}`] = true;
                let nm2 = o.name; for (let k = 2; allHorses(st).some(x => x.h.name === nm2); k++) nm2 = `${o.name} ${k}`;
                const h = { id: `b${st.day}${o.idx}${hashStr(o.name) % 1000}`, name: nm2, coat: o.coat, marks: o.marks, sex: o.sex, breed: o.breed, pot: o.grade, grade: o.grade, born: st.day - o.age * 360, care: 0, sire: '모름', dam: '모름' };
                if (f) { f.stable = f.stable || []; f.stable.push(h); log.push({ k: 'loss', t: `${o.seller}에게서 ${o.name}(${o.sex}·${o.breed}·${HORSE_GRADES[o.grade]}) 구입 -${formatMoney(o.price)} → ${f.name} 마구간` }); }
                else { addCompanion(st, { name: o.name, kind: '마수', species: `말 (${o.breed} · ${o.coat} · ${HORSE_GRADES[o.grade]})`, bond: 25, grade: Math.max(1, o.grade - 1) }, log); log.push({ k: 'loss', t: `${o.name} 구입 -${formatMoney(o.price)} (마구간이 없어 직접 데리고 다닌다)` }); }
                break;
            }
            if (key === 'horseCare' && /^(전부|모두|다같이|함께)$/.test(nospace(parts[0]))) {
                // 말돌보기 전부 | 5일 — 지금 있는 곳의 마구간 말을 한꺼번에 (한 마리씩보다 덜 깊다)
                const fm = (st.farms || []).find(x => x.market === mk && x.stable?.length);
                if (!fm) { log.push({ k: 'warn', t: '이곳에 돌볼 말이 있는 마구간이 없다' }); break; }
                const days = Math.max(1, Math.min(30, parseInt(parts[1]) || parseInt(arg.match(/(\d+)\s*일/)?.[1]) || 3));
                log.push(...applyOps(st, parseOpLines([`날짜 +${days}일`])));
                const per = days * (2 + (st.life?.목축?.rank ?? 0) * 0.3) * 0.5;
                for (const h of fm.stable) { if (h.grade == null) h.care = Math.round(((h.care || 0) + per) * 10) / 10; h.bond = Math.min(100, (h.bond || 0) + days); }
                log.push({ k: 'gain', t: `${fm.name} 마구간의 말 ${fm.stable.length}마리를 ${days}일 동안 함께 돌봤다 — 한 마리씩 돌볼 때의 절반쯤 정성` });
                trainLife(st, '목축', days, log); trainLife(st, '승마', Math.ceil(days / 2), log);
                break;
            }
            let hit = findHorse(st, parts[0]);
            if (!hit && key === 'horseRename' && !parts[1]) { // "말이름 샛별 새벽별"
                const toks = parts[0].trim().split(/\s+/);
                for (let i = toks.length - 1; i >= 1 && !hit; i--) { const h2 = allHorses(st).find(x => nospace(x.h.name) === nospace(toks.slice(0, i).join(' '))); if (h2) { hit = findHorse(st, h2.h.name); parts[0] = h2.h.name; parts[1] = toks.slice(i).join(' '); } }
            }
            if (!hit) { log.push({ k: 'warn', t: `'${parts[0]}' — 마구간에 없는 말` }); break; }
            const { h, f } = hit;
            const here = mk === f.market, reach = here || f.steward || !!f.kin;
            if (key === 'horseRename') { const n = (parts[1] || '').trim(); if (!n) throw 0; if (allHorses(st).some(x => x.h !== h && x.h.name === n)) { log.push({ k: 'warn', t: `마구간에 이미 '${n}'이 있다` }); break; } h.unnamed = false; log.push({ k: 'info', t: `${h.name} → 이름을 '${n}'로 지었다` }); h.name = n; break; }
            if (key === 'horseGrade') { const g = HORSE_GRADES.findIndex(x => nospace(x) === nospace(parts[1] || '')); if (g < 0) throw 0; h.grade = g; log.push({ k: 'info', t: `${h.name} — ${HORSE_GRADES[g]}` }); break; }
            if (key === 'horseCare') {
                if (!here) { log.push({ k: 'warn', t: `${f.market}의 마구간에 가야 돌볼 수 있다` }); break; }
                const days = Math.max(1, Math.min(30, parseInt(parts[1]) || parseInt(arg.match(/(\d+)\s*일/)?.[1]) || 3));
                log.push(...applyOps(st, parseOpLines([`날짜 +${days}일`])));
                if (h.grade == null) { h.care = Math.round(((h.care || 0) + days * (2 + (st.life?.목축?.rank ?? 0) * 0.3)) * 10) / 10; log.push({ k: 'gain', t: `${josa(h.name, '을', '를')} ${days}일 동안 정성껏 돌봤다 — 정성 ${Math.round(h.care)}` }); }
                else log.push({ k: 'info', t: `${josa(h.name, '과', '와')} ${days}일을 보냈다 — 다 큰 말이라 등급은 그대로지만 사이가 가까워졌다` });
                h.bond = Math.min(100, (h.bond || 0) + days * 2);
                trainLife(st, '목축', days, log); trainLife(st, '승마', days, log);
                break;
            }
            if (key === 'horseRide') {
                if (!here) { log.push({ k: 'warn', t: `${f.market}의 마구간에 가야 데려갈 수 있다` }); break; }
                if (!horseAdult(h, st.day)) { log.push({ k: 'warn', t: `${josa(h.name, '은', '는')} 아직 탈 수 없다 (${horseStage(h, st.day)})` }); break; }
                f.stable.splice(f.stable.indexOf(h), 1);
                addCompanion(st, { name: h.name, kind: '마수', species: `말 (${h.breed}${h.coat ? ` · ${h.coat}` : ''} · ${HORSE_GRADES[h.grade]})`, bond: Math.min(95, 40 + Math.min(40, Math.round((h.care || 0) / 4)) + Math.round((h.bond || 0) / 4)), grade: Math.max(1, h.grade - 1) }, log);
                break;
            }
            if (key === 'horseSell') {
                if (!reach) { log.push({ k: 'warn', t: `${f.market}에 가거나 관리인을 두어야 한다` }); break; }
                const v = Math.round(horseValue(h, st.day) * 0.85);
                f.stable.splice(f.stable.indexOf(h), 1); st.money += v;
                log.push({ k: 'gain', t: `${h.grade == null ? horseStage(h, st.day) : HORSE_GRADES[h.grade]} ${josa(h.name, '을', '를')} 말 시장에 팔았다 +${formatMoney(v)}` });
                break;
            }
            if (key === 'horseBid') {
                const req = horseRequests(st).find(x => x.kind === 'bid' && x.horse === h.name && !x.done && (!parts[1] || nospace(x.from).includes(nospace(parts[1]))));
                if (!req && !/강제/.test(arg)) { log.push({ k: 'warn', t: `${josa(h.name, '을', '를')} 사겠다는 제안이 없다` }); break; }
                const price = req ? req.price : Math.round(horseValue(h, st.day) * 1.3);
                f.stable.splice(f.stable.indexOf(h), 1); st.money += price; st.horseDeals[`${ym}|bid|${h.id}`] = true;
                const hs = req && houseOf(req.from);
                if (hs) st.houseFavor[hs.name] = Math.min(100, (st.houseFavor[hs.name] || 0) + 5 + h.grade * 2);
                st.stableFame = Math.min(100, (st.stableFame || 0) + h.grade);
                log.push({ k: 'gain', t: `${req?.from || '귀족가'}에 ${HORSE_GRADES[h.grade]} ${josa(h.name, '을', '를')} 넘겼다 +${formatMoney(price)}${hs ? ' · 가문 호감 상승' : ''}` });
                break;
            }
            if (key === 'horseStudAccept') {
                const req = horseRequests(st).find(x => x.kind === 'stud' && x.horse === h.name && !x.done);
                if (!req) { log.push({ k: 'warn', t: `${h.name}에게 들어온 교배 신청이 없다` }); break; }
                st.money += req.fee; st.horseDeals[`${ym}|stud|${h.id}`] = true;
                st.stableFame = Math.min(100, (st.stableFame || 0) + 1);
                const hs = houseOf(req.from); if (hs) st.houseFavor[hs.name] = Math.min(100, (st.houseFavor[hs.name] || 0) + 3);
                log.push({ k: 'gain', t: `${req.from}의 암말과 ${h.name}의 교배를 받아들였다 — 씨값 +${formatMoney(req.fee)}` });
                break;
            }
            // 교배 — 내 암말이 새끼를 밴다
            const mare = h;
            if (mare.sex !== '암') { log.push({ k: 'warn', t: `${josa(mare.name, '은', '는')} 수말이다 — 암말 이름을 앞에 적을 것` }); break; }
            if (!horseAdult(mare, st.day) || mare.grade == null) { log.push({ k: 'warn', t: `${josa(mare.name, '은', '는')} 아직 어리다` }); break; }
            if (mare.preg) { log.push({ k: 'warn', t: `${josa(mare.name, '은', '는')} 이미 새끼를 뱄다` }); break; }
            if (!reach) { log.push({ k: 'warn', t: `${f.market}에 가거나 관리인을 두어야 한다` }); break; }
            let sire;
            if (key === 'horseBreed') {
                const s2 = findHorse(st, parts[1] || '');
                if (!s2 || s2.h.sex !== '수' || s2.h.grade == null || !horseAdult(s2.h, st.day)) { log.push({ k: 'warn', t: `'${parts[1]}' — 교배할 수 있는 내 수말이 아니다` }); break; }
                sire = { sire: s2.h.name, grade: s2.h.grade, breed: s2.h.breed, coat: s2.h.coat };
            } else {
                const so = studOffers(st, mk || f.market).find(x => nospace(x.name) === nospace(parts[1] || '') || nospace(parts[1] || '').includes(nospace(x.name)));
                if (!so) { log.push({ k: 'warn', t: `이달 ${mk || f.market}에 '${parts[1]}'이라는 씨수말은 없다` }); break; }
                if (st.money < so.fee) { log.push({ k: 'warn', t: `씨값이 모자라다 (${formatMoney(so.fee)})` }); break; }
                st.money -= so.fee;
                sire = { sire: `${so.name}(${so.owner})`, grade: so.grade, breed: so.breed, coat: so.coat };
                log.push({ k: 'loss', t: `${so.owner}의 씨수말 ${so.name}(${HORSE_GRADES[so.grade]})에게 씨값 -${formatMoney(so.fee)}` });
            }
            const r = rng(hashStr(`conceive|${mare.id}|${st.day}`))();
            const age = (st.day - mare.born) / 360;
            if (r > (age > 15 ? 0.4 : 0.8)) { log.push({ k: 'info', t: `${mare.name} — 이번엔 새끼가 들어서지 않았다` }); break; }
            mare.preg = { ...sire, due: st.day + GESTATION };
            log.push({ k: 'gain', t: `${josa(mare.name, '이', '가')} ${sire.sire}의 새끼를 뱄다 — 약 11달 뒤 출산` });
            break;
        }
        case 'matchOk': case 'matchNo': {
            const [who, from] = arg.split(/\s*[|｜]\s*/);
            const o = matchOffers(st).find(x => nospace(x.forName) === nospace(who || '') && (!from || nospace(x.person).includes(nospace(from)) || nospace(x.family).includes(nospace(from))));
            if (!o) { log.push({ k: 'warn', t: '그런 혼담은 들어와 있지 않다' }); break; }
            st.matchDone = st.matchDone || {}; st.matchDone[o.id] = key === 'matchOk' ? 'ok' : 'no';
            if (key === 'matchNo') { log.push({ k: 'info', t: `${o.family}의 혼담을 정중히 거절했다` }); if (o.house) st.houseFavor[o.house] = Math.max(0, (st.houseFavor[o.house] || 0) - 3); break; }
            if (o.house) st.houseFavor[o.house] = Math.min(100, (st.houseFavor[o.house] || 0) + 15);
            st.notes = st.notes || {}; st.notes[o.person] = { t: `${o.family} 출신 · ${o.desc} · ${o.forName === '본인' ? '{{user}}의 약혼자' : `${o.forName}의 짝`}`, upd: st.day };
            if (o.forName === '본인') {
                st.bonds[o.person] = { stage: '약혼', since: st.day }; st.rel[o.person] = Math.max(st.rel[o.person] || 0, 30);
                log.push({ k: 'rank', t: `약혼 — ${o.person} (${o.family}) · 집안끼리 정한 혼담` });
            } else {
                const c = findChild(st, o.forName); if (!c) break;
                c.spouse = { name: o.person, from: o.family, since: st.day };
                log.push({ k: 'rank', t: `${c.name}의 혼인 — ${o.person} (${o.family})` });
            }
            st.renown = (st.renown || 0) + (o.tier >= 3 ? 3 : 1);
            break;
        }
        case 'gearDmg': case 'gearFix': case 'gearUp': {
            const [sl, v = ''] = arg.split(/\s*[|｜]\s*|\s+(?=[-+]?\d)/);
            const slot = SLOTS[nospace(sl)] || Object.keys(st.equip || {}).find(k => nospace(st.equip[k]) === nospace(sl));
            const g = slot && gearOf(st, slot);
            if (!g) { log.push({ k: 'warn', t: `'${sl}' — 장착한 장비가 아니다` }); break; }
            if (key === 'gearDmg') {
                const n = Math.abs(parseInt(String(v).replace('−', '-')) || 10);
                g.dur = Math.max(0, g.dur - n);
                log.push({ k: g.dur <= 0 ? 'warn' : 'loss', t: `${g.name} 내구 -${n} (${g.dur}/${g.max})${g.dur <= 0 ? ' — 망가졌다! 수리해야 제 구실을 한다' : g.dur < 30 ? ' — 많이 상했다' : ''}` });
                break;
            }
            const sm = smithHere(st);
            if (key === 'gearFix') {
                if (!sm.canRepair) { log.push({ k: 'warn', t: '여기엔 맡길 대장간이 없다 (도시의 무기점이나 내 대장간, 또는 대장일 D 이상)' }); break; }
                if (g.dur >= g.max) { log.push({ k: 'info', t: `${g.name}은 멀쩡하다` }); break; }
                const cost = repairCost(st, g);
                if (st.money < cost) { log.push({ k: 'warn', t: `수리비가 모자라다 (${formatMoney(cost)})` }); break; }
                st.money -= cost; g.dur = g.max;
                log.push({ k: 'info', t: `${g.name} 수리${cost ? ` -${formatMoney(cost)}` : ' (직접 손봤다)'}` });
                if (sm.self) trainLife(st, '대장일', 2, log);
                break;
            }
            if (!sm.canEnhance) { log.push({ k: 'warn', t: '강화는 도시의 대장간이나, 대장일 C 이상인 내 대장간에서만' }); break; }
            if (g.plus >= 10) { log.push({ k: 'info', t: `${g.name}은 이미 +10 — 더는 오르지 않는다` }); break; }
            if (g.dur <= 0) { log.push({ k: 'warn', t: '망가진 장비는 먼저 수리해야 한다' }); break; }
            const cost = enhanceCost(g.plus);
            if (st.money < cost) { log.push({ k: 'warn', t: `강화 비용이 모자라다 (${formatMoney(cost)})` }); break; }
            st.money -= cost;
            st.enhTries = (st.enhTries || 0) + 1;
            const rate = Math.min(0.98, ENHANCE_RATE[g.plus] + (sm.rank >= 6 ? 0.05 : 0));
            const ok = rng(hashStr(`enh|${st.day}|${slot}|${g.plus}|${st.enhTries}`))() < rate;
            if (ok) { g.plus += 1; log.push({ k: 'rank', t: `강화 성공 — ${g.name} +${g.plus} (-${formatMoney(cost)})` }); if (g.plus >= 7) addChron(st, `${g.name}을 +${g.plus}까지 벼렸다`); }
            else if (g.plus >= 4) { g.plus -= 1; g.dur = Math.max(1, g.dur - 30); log.push({ k: 'warn', t: `강화 실패 — ${g.name} +${g.plus}${[2, 4, 5, 9].includes(g.plus % 10) ? '로' : '으로'} 내려갔다, 내구 -30 (-${formatMoney(cost)})` }); }
            else log.push({ k: 'loss', t: `강화 실패 — ${g.name} 그대로 +${g.plus} (-${formatMoney(cost)})` });
            if (sm.self) trainLife(st, '대장일', 3, log);
            break;
        }
        case 'kill': {
            const m = arg.match(/^(.*?)\s*[×x]?\s*(\d+)?\s*(마리)?$/);
            const raw = (m?.[1] || arg).trim(); const n = Math.max(1, parseInt(m?.[2]) || 1);
            const M = findMonster(raw); const name = M ? M[0] : raw;
            st.codex = st.codex || {};
            const c = st.codex[name] = st.codex[name] || { kills: 0, first: st.day };
            const lv0 = codexLevel(c.kills); c.kills += n; c.last = st.day;
            const lv1 = codexLevel(c.kills);
            log.push({ k: 'gain', t: `처치 — ${name} ${n}${lv1 > lv0 ? ` · 도감: ${CODEX_TIERS[lv1 - 1][1]}${lv1 === 1 ? ' 등록' : ' 알게 됨'}` : ''}` });
            if (lv1 === 4 && lv0 < 4) { const tt = `${name} 사냥꾼`; if (!st.titles.includes(tt)) { st.titles.push(tt); log.push({ k: 'rank', t: `칭호 — ${tt} (${c.kills}마리)` }); } }
            if (M && 'BAS'.includes(M[1]) && c.kills === n) addChron(st, `처음으로 ${M[1]}급 마물 ${josa(name, '을', '를')} 쓰러뜨렸다`);
            break;
        }
        case 'dungeon': case 'dungeonOut': case 'guardian': {
            const parts = arg.split(/\s*[|｜]\s*|\s+(?=[-+=]?\d)/);
            const dn = findDungeon(parts[0]) || (parts[0] || '').trim(); if (!dn) throw 0;
            st.dungeons = st.dungeons || {};
            const d = st.dungeons[dn] = st.dungeons[dn] || { cur: 0, best: 0, guard: [] };
            if (key === 'dungeonOut') { log.push({ k: 'info', t: `${dn} — ${d.cur}층에서 지상으로 돌아왔다 (최고 ${d.best}층)` }); d.cur = 0; break; }
            const v = String(parts[1] || '+1').trim();
            if (key === 'guardian') { const fl = parseInt(v) || d.cur; if (!d.guard.includes(fl)) { d.guard.push(fl); const bi = Math.max(0, (DUNGEONS[dn]?.bands || []).findIndex(x => x === dungeonBand(dn, fl))); if (rng(hashStr(`${st.profile?.name || ''}|guard|${dn}|${fl}`))() < 0.4) { log.push({ k: 'info', t: '수호자가 지키던 자리에서 무언가가 빛난다' }); rollRelic(st, log, { band: bi, seed: `guard|${dn}|${fl}` }); } } if (d.guard.length >= 3) traceTitle(st, '수호자를 쓰러뜨린 자', log); log.push({ k: 'rank', t: `${dn} ${fl}층 수호자를 쓰러뜨렸다 — 전이진이 열려 다음부터 ${fl}층에서 시작할 수 있다` }); addChron(st, `${dn} ${fl}층 수호자를 쓰러뜨렸다`); break; }
            const to = /^=/.test(v) ? parseInt(v.slice(1)) : d.cur + (parseInt(v) || 1);
            d.cur = Math.max(0, to);
            const prevCur = d.prev ?? 0; d.prev = d.cur;
            const newBest = d.cur > d.best; if (newBest) d.best = d.cur;
            const b = dungeonBand(dn, d.cur);
            if (d.cur > prevCur) {
                // 새 층을 밟을 때마다 낮은 확률로 유적·금서를 발견한다 (깊을수록, 운이 좋을수록 잘 나온다)
                const bi = Math.max(0, (DUNGEONS[dn]?.bands || []).findIndex(x => x === b));
                const r = rng(hashStr(`${st.profile?.name || ''}|${dn}|${d.cur}|${st.day}|${st.relicN || 0}`))();
                const chance = 0.05 + bi * 0.02 + Math.max(0, statMod(st.stats?.행운 ?? 15)) * 0.01;
                if (r < chance) { log.push({ k: 'info', t: `${d.cur}층 구석에서 무언가를 발견했다` }); rollRelic(st, log, { band: bi, seed: `${dn}|${d.cur}|${st.day}` }); }
            }
            log.push({ k: newBest ? 'gain' : 'info', t: `${dn} ${d.cur}층${b ? ` (${b[1]})` : ''}${newBest ? ' — 최고 기록 갱신' : ''}` });
            const D = DUNGEONS[dn];
            if (D && newBest && d.cur > D.record) { log.push({ k: 'rank', t: `${dn} 신기록 — 지금까지 아무도 닿지 못한 ${d.cur}층!` }); addChron(st, `${dn} ${d.cur}층 — 제국 최고 기록을 넘어섰다`); st.renown += 20; traceTitle(st, `${dn}의 개척자`, log); }
            if (newBest && d.cur >= 10 && d.cur % 10 === 0) { st.titles = (st.titles || []).filter(t => !t.startsWith(`${dn} `) || !t.endsWith('층을 밟은 자')); traceTitle(st, `${dn} ${d.cur}층을 밟은 자`, log); }
            else if (newBest && d.cur % 10 === 0) addChron(st, `${dn} ${d.cur}층에 이르렀다`);
            break;
        }
        case 'chron': {
            const t = arg.replace(/^\+/, '').trim(); if (!t) throw 0;
            addChron(st, t, true);
            log.push({ k: 'info', t: `연대기에 남김 — ${t}` });
            break;
        }
        case 'trueName': {
            // 진명 이름 | 세계 | 등급  — 이계 존재의 참된 이름을 알게 됨
            const [n, realm = '', gr = ''] = arg.split(/\s*[|｜]\s*/);
            const name = (n || '').trim(); if (!name) throw 0;
            addTrueName(st, { name, realm: realm.trim(), grade: summonGradeOf(`${gr} ${name}`) }, log);
            break;
        }
        case 'decode': {
            const i = findByName(st.items, arg.replace(/\s*강제\s*$/, '').trim()); if (i < 0) throw 0;
            const it = st.items[i], R = st.relics?.[it.name];
            if (!R?.tn) { log.push({ k: 'info', t: `${it.name} — 진명이 적힌 책이 아니다` }); break; }
            if (!st.classes?.소환사 && !/강제/.test(arg)) { log.push({ k: 'warn', t: `${it.name} — 이계의 문자라 소환사가 아니면 읽을 수 없다 (팔거나 소환사에게 선물할 수 있다)` }); break; }
            addTrueName(st, R.tn, log);
            R.read = true;
            break;
        }
        case 'pact': {
            // 대가 이름 | 내용 | 7일
            const [n, what = '', due = ''] = arg.split(/\s*[|｜]\s*/);
            const who = (n || '').trim(); if (!who || !what.trim()) throw 0;
            const days = parseInt(due) || 30;
            st.pacts = st.pacts || [];
            st.pacts.push({ who, what: what.trim(), due: st.day + days, done: false, broken: false });
            log.push({ k: 'info', t: `계약의 대가 — ${who}: ${what.trim()} (${days}일 안에)` });
            break;
        }
        case 'pactDone': {
            const [n, what = ''] = arg.split(/\s*[|｜]\s*/);
            const who = nospace(n || '');
            const p = (st.pacts || []).find(x => !x.done && nospace(x.who) === who && (!what || x.what.includes(what.trim())));
            if (!p) throw 0;
            p.done = true;
            const ci = findComp(st, p.who);
            if (p.broken) { if (ci >= 0) st.companions[ci].wrath = false; log.push({ k: 'info', t: `늦게나마 대가를 치렀다 — ${p.who}의 분노가 가라앉는다` }); }
            else { if (ci >= 0) st.companions[ci].bond = Math.min(100, st.companions[ci].bond + 5); log.push({ k: 'gain', t: `대가를 치렀다 — ${p.who}: ${p.what}` }); }
            break;
        }
        case 'relicFind': {
            // 발견 [장비|보물|금서] — 유적·폐허에서 무언가를 찾았을 때 확장이 내용을 정한다
            const kind = /장비|무기|방어구/.test(arg) ? 'gear' : /보물|유물|보화/.test(arg) ? 'treasure' : /금서|책|서적/.test(arg) ? 'book' : null;
            const band = /하층|심층|깊/.test(arg) ? 2 : /중층|중간/.test(arg) ? 1 : 0;
            rollRelic(st, log, { kind, band, seed: `find|${st.day}|${(st.relicN || 0)}|${arg}` });
            break;
        }
        case 'revive': {
            // 소생 이름 | 경과 시간(예: 3시간·반나절·하루)
            const [n, el = ''] = arg.split(/\s*[|｜]\s*/);
            const who = (n || '').trim(); if (!who) throw 0;
            if (!st.cskills?.['소생의 기도'] && !/강제/.test(arg)) { log.push({ k: 'warn', t: '비전 「소생의 기도」를 모른다 — 죽은 이를 되살릴 수 없다' }); break; }
            const hrs = /(\d+)\s*시간/.test(el) ? parseInt(el.match(/(\d+)\s*시간/)[1]) : /반나절/.test(el) ? 12 : /하루|1일|온종일/.test(el) ? 24 : /이틀|사흘|\d+\s*일|며칠/.test(el) ? 48 : 1;
            if (hrs > 24) { log.push({ k: 'warn', t: `${who} — 숨이 끊긴 지 하루가 넘었다. 영혼은 이미 여신 곁으로 떠났다` }); break; }
            st.mp = 0;
            const relic = st.items.findIndex(x => /성물|성유물|성녀의|성인의 유골/.test(x.name));
            if (relic >= 0) { const nm = st.items[relic].name; st.items[relic].qty -= 1; if (st.items[relic].qty <= 0) st.items.splice(relic, 1); log.push({ k: 'loss', t: `소생의 대가 — ${josa(nm, '이', '가')} 빛이 되어 사라졌다` }); }
            else { st.stats.체력 = Math.max(1, (st.stats.체력 || 15) - 1); log.push({ k: 'loss', t: '소생의 대가 — 자신의 생명을 나눴다 (체력 -1, 영구)' }); }
            const cr = st.orgs?.church?.rank ?? -1;
            if (cr < 4) { log.push({ k: 'warn', t: '교회의 허락 없는 소생 — 주교 이상만 허락받는 기적이다. 소문이 나면 성교회가 찾아온다' }); }
            log.push({ k: 'rank', t: `${josa(who, '이', '가')} 다시 숨을 쉰다 — MP를 모두 쏟았다` });
            addChron(st, `소생의 기도로 ${josa(who, '을', '를')} 되살렸다`);
            break;
        }
        case 'npcNews': {
            // 근황 이름 | 내용 — 이름 있는 사람의 새 소식(승급·이직·결혼 등). 가장 최근 것이 그 사람의 근황이 된다
            const [n, ...rest] = arg.split(/\s*[|｜]\s*/);
            const d = npcInfo(n); const name = d ? d.n : (n || '').trim(); const t = rest.join(' · ').trim();
            if (!name || !t) throw 0;
            st.npcNews = st.npcNews || {};
            (st.npcNews[name] = st.npcNews[name] || []).push({ day: st.day, t });
            if (st.npcNews[name].length > 8) st.npcNews[name].splice(0, st.npcNews[name].length - 8);
            log.push({ k: 'info', t: `${name}의 근황 — ${t}` });
            break;
        }
        case 'note': {
            // 인물 이름 | 설명   (설명이 '삭제'면 지운다)
            const [n, ...rest] = arg.split(/\s*[|｜]\s*/);
            const name = (n || '').trim(); if (!name) throw 0;
            const text = rest.join(' · ').trim();
            st.notes = st.notes || {};
            if (/^(삭제|지움)$/.test(text)) { delete st.notes[name]; log.push({ k: 'info', t: `인물 노트에서 ${josa(name, '을', '를')} 지움` }); break; }
            if (!text) throw 0;
            const had = !!st.notes[name];
            st.notes[name] = { t: text.slice(0, 200), upd: st.day };
            log.push({ k: 'info', t: `인물 노트 ${had ? '고침' : '추가'} — ${name}: ${text.slice(0, 60)}` });
            break;
        }
        case 'aging': {
            const on = !/끔|끄|안|없/.test(arg);
            if (on && !st.aging) { st.ageBase = ageOf(st); st.ageDay0 = st.day; }
            if (!on && st.aging) { st.ageBase = ageOf(st); st.ageDay0 = st.day; }
            st.aging = on;
            log.push({ k: 'info', t: on ? `이제 해마다 나이를 먹는다 (지금 ${ageOf(st)}살)` : `나이가 ${ageOf(st)}살에 멈춘다` });
            break;
        }
        case 'energy': case 'fatigue': {
            // 기력 -15 / 기력 =100 / 기력 최대 / 피로 +15(= 기력 -15)
            const a = String(arg).trim(), mx = maxEN(st), before = energyOf(st);
            if (/최대|가득|회복/.test(a)) st.energy = mx;
            else { const p = parseNum(a); if (!p) throw 0; const v = op.key === 'fatigue' && p.mode !== 'set' ? -p.value : p.value; st.energy = Math.max(0, Math.min(mx, p.mode === 'set' ? (op.key === 'fatigue' ? mx - p.value : p.value) : before + v)); }
            const d = st.energy - before;
            if (d) log.push({ k: d > 0 ? 'gain' : 'loss', t: `기력 ${d > 0 ? '+' : ''}${d} (${st.energy}/${mx})` });
            if (st.energy > 0 && st.energy <= mx * 0.2 && before > mx * 0.2) log.push({ k: 'warn', t: '기력이 바닥나 간다 — 쉬지 않으면 쓰러진다' });
            break;
        }
        case 'nap': {
            // 낮잠 — 시간대 한 칸, 생활 수준만큼 기력·HP·MP
            const mode = livingMode(st), [en, hm] = LIVING[mode]?.nap || [0.2, 0.1];
            const e0 = energyOf(st), h0 = st.hp, m0 = st.mp;
            st.energy = Math.min(maxEN(st), e0 + Math.ceil(maxEN(st) * en));
            st.hp = Math.min(maxHP(st), st.hp + Math.ceil(maxHP(st) * hm));
            st.mp = Math.min(maxMP(st), st.mp + Math.ceil(maxMP(st) * hm));
            log.push({ k: 'gain', t: `낮잠 (${mode}) — 기력 +${st.energy - e0} · HP +${st.hp - h0} · MP +${st.mp - m0}` });
            if ((st.tod ?? 0) < 3) { st.tod = (st.tod ?? 0) + 1; log.push({ k: 'info', t: `${TODS[st.tod]}이 되었다` }); }
            break;
        }
        case 'petAdopt': case 'petRescue': {
            // 입양 나비 | 고양이 | 도도함 | 분양 1은50동   ·  구조 누렁이 | 강아지  (위험에 빠진 동물을 도와 데려온다)
            const [nm, sp = '', tr = '', from = ''] = String(arg).replace(/^\+/, '').split(/\s*[|｜]\s*/);
            if (!nm?.trim()) throw 0;
            if (findComp(st, nm) >= 0) { log.push({ k: 'info', t: `${nm.trim()}는 이미 함께 있다` }); break; }
            const species = sp.trim() || '강아지', trait = PET_TRAITS[tr.trim()] ? tr.trim() : traitOf(nm.trim(), species);
            const price = /분양|값|\d/.test(from) ? (parseMoney(from.replace(/분양/, '').trim()) || PET_SPECIES[Object.keys(PET_SPECIES).find(k => species.includes(k))] || 0) : 0;
            if (price) { if (st.money < price) { log.push({ k: 'warn', t: '분양비가 모자란다' }); break; } st.money -= price; log.push({ k: 'loss', t: `분양비 -${formatMoney(price)}` }); }
            const rescued = key === 'petRescue' || /구조|도와/.test(from);
            const big = /말|망아지|소|노새|당나귀/.test(species);
            addCompanion(st, { name: nm.trim(), kind: '마수', species, pet: !big, trait, bond: rescued ? 20 : 8, grade: 1, tamed: false, maxhp: big ? 60 : 20 }, log);
            log.push({ k: 'gain', t: `${rescued ? '구해 준' : '새'} ${big ? '동물' : '반려동물'} — ${nm.trim()} (${species} · ${trait})` });
            addChron(st, `${josa(nm.trim(), '을', '를')} ${rescued ? '구해 주고 ' : ''}식구로 들였다 (${species})`);
            break;
        }
        case 'petHome': {
            // 반려자리 나비 | 가게이름 / 자택 / 곁
            const [nm, where = '곁'] = String(arg).split(/\s*[|｜]\s*/);
            const i = findComp(st, nm); if (i < 0) throw 0;
            const c = st.companions[i], w = where.trim();
            const sh = (st.shops || []).find(x => nospace(x.name) === nospace(w) || nospace(w).includes(nospace(x.name)));
            c.home = sh ? sh.name : /집|자택/.test(w) ? '자택' : null;
            log.push({ k: 'info', t: sh ? `${c.name} — ${sh.name}의 마스코트가 되었다 (손님 +5% · 평판이 조금씩 오름)` : c.home ? `${c.name} — 집에서 기다린다` : `${c.name} — 곁에 데리고 다닌다` });
            break;
        }
        case 'petCare': {
            // 돌보기 나비 — 먹이·빗질·산책 (하루 한 번 의미 있음)
            const i = findComp(st, String(arg).trim()); if (i < 0) throw 0;
            const c = st.companions[i];
            if (c.cared === st.day) { log.push({ k: 'info', t: `${c.name} — 오늘은 이미 충분히 돌봤다` }); break; }
            c.cared = st.day; const d = Math.max(1, Math.round(3 * traitRate(c))); c.bond = Math.min(100, c.bond + d); c.idle = 0;
            log.push({ k: 'gain', t: `${c.name} 돌보기 — 유대 +${d}` });
            break;
        }
        case 'spiritName': {
            // 정령이름 샐러맨더 | 토토  — 계약한 정령에게 이름을 지어 준다
            const [a, b] = String(arg).split(/\s*[|｜]\s*/);
            const i = findComp(st, a); if (i < 0 || !b?.trim()) throw 0;
            const c = st.companions[i], old = c.name; c.name = b.trim();
            log.push({ k: 'info', t: `${old} — 이제 「${c.name}」라고 부른다` });
            break;
        }
        case 'capBreak': {
            // 한계돌파 — 큰 사건 뒤에. 300 → 400 → 500 → 999
            const lv = Math.min(3, (st.capBreak || 0) + 1);
            if (lv === (st.capBreak || 0)) { log.push({ k: 'info', t: '이미 초월에 이르렀다' }); break; }
            st.capBreak = lv;
            log.push({ k: 'rank', t: `★ ${STAT_CAP_NAMES[lv]} — 능력치 상한 ${STAT_CAPS[lv - 1]} → ${STAT_CAPS[lv]}${arg ? ` (${String(arg).trim()})` : ''}` });
            addChron(st, `${STAT_CAP_NAMES[lv]}${arg ? ` — ${String(arg).trim()}` : ''}`);
            break;
        }
        case 'looks': {
            // 외모 체격 | 가늘고 늘씬한 체격  — 수첩 외모 칸을 다듬어 적는다
            const LK = { 체격: 'height', 키: 'height', '키·체격': 'height', 머리: 'hair', 머리카락: 'hair', 눈: 'eyes', 눈동자: 'eyes', 인상: 'impression', 특징: 'marks', 차림: 'outfit', 옷차림: 'outfit', 기타: 'free' };
            const [h, ...rest] = String(arg).split('|');
            let field = LK[h.trim()], val = rest.join('|').trim();
            if (!field) { const w = h.trim().split(/\s+/); field = LK[w[0]]; val = val || w.slice(1).join(' ').trim(); }
            if (!field || !val) throw 0;
            st.profile.appearance = { ...(st.profile.appearance || {}), [field]: val.slice(0, 40) };
            log.push({ k: 'info', t: `수첩 외모 — ${Object.keys(LK).find(k => LK[k] === field)}: ${val.slice(0, 40)}` });
            break;
        }
        case 'ageSet': {
            const n = parseInt(arg); if (!(n > 0)) throw 0;
            st.ageBase = n; st.ageDay0 = st.day;
            log.push({ k: 'info', t: `나이 — ${n}살` });
            break;
        }
        case 'shopAuto': {
            const [n, v = ''] = arg.split(/\s*[|｜]\s*/);
            const sh = findShop(st, n); if (!sh) { log.push({ k: 'warn', t: `'${n}' 가게가 없다` }); break; }
            if (/끔|끄|해제|없음/.test(v)) { sh.auto = 0; log.push({ k: 'info', t: `${sh.name} 자동 보충을 껐다` }); break; }
            sh.auto = Math.max(3, Math.min(30, parseInt(v) || 14));
            log.push({ k: 'info', t: `${sh.name} — 점원이 늘 ${sh.auto}일치 재고를 채워 둔다 (금고 돈 먼저, 모자라면 소지금 · 주인이 없으면 8% 웃돈)` });
            break;
        }
        case 'menuAdd': case 'menuDel': case 'menuSig': case 'shopMove': case 'shopFame': {
            // 메뉴추가 가게 | 요리   ·   대표메뉴 가게 | 요리   ·   가게이전 가게 | 구역   ·   가게소문 가게 +N
            let [name, rest = ''] = arg.split(/\s*[|｜]\s*/);
            if (key === 'shopFame' && !rest) { const m = arg.match(/^(.*?)\s*([+\-−]?\d+)\s*$/); if (m) { name = m[1]; rest = m[2]; } }
            const sh = findShop(st, name);
            if (!sh) { log.push({ k: 'warn', t: `'${name}' 가게가 없다` }); break; }
            if (!isFoodShop(sh)) { log.push({ k: 'warn', t: `${josa(sh.name, '은', '는')} 음식을 파는 가게가 아니다` }); break; }
            sh.menu = sh.menu || []; sh.fame = sh.fame || 0;
            const rank = Math.max(0, ownerRank(st, sh));
            if (key === 'shopFame') {
                const v = parseInt(String(rest).replace('−', '-')) || 0;
                sh.fame = Math.max(0, Math.min(100, sh.fame + v));
                log.push({ k: v >= 0 ? 'gain' : 'loss', t: `${sh.name} 소문 ${v >= 0 ? '+' : ''}${v} (${fameTier(sh.fame)})` });
                break;
            }
            if (key === 'shopMove') {
                const dn = Object.keys(DISTRICTS).find(d => nospace(rest).includes(nospace(d))) || '시장통';
                const D = DISTRICTS[dn];
                const mk = marketOf(st.location);
                const newMarket = mk || sh.market; // 다른 도시로 옮기려면 그 도시에 가 있어야 한다
                const moving = newMarket !== sh.market;
                if (!moving && dn === districtOf(sh)) { log.push({ k: 'info', t: `${josa(sh.name, '은', '는')} 이미 ${dn}에 있다` }); break; }
                if (D.capital && newMarket !== '제도 루미에른') { log.push({ k: 'warn', t: '백은 구역은 제도에만 있다' }); break; }
                if (D.fame && sh.fame < D.fame && !/강제/.test(arg)) { log.push({ k: 'warn', t: `백은 구역의 건물주들은 이름난 집에만 세를 준다 (소문 ${D.fame} 이상)` }); break; }
                const cost = Math.round(SHOP_TIERS[sh.tier].open * D.move * (moving ? 1.3 : 1));
                if (st.money < cost) { log.push({ k: 'warn', t: `옮길 돈이 모자라다 (${formatMoney(cost)})` }); break; }
                st.money -= cost;
                if (moving) { sh.market = newMarket; sh.fame = Math.round(sh.fame / 2); sh.rep = Math.round(sh.rep / 2); }
                sh.district = dn;
                log.push({ k: 'rank', t: `${sh.name} — ${moving ? `${newMarket}의 ` : ''}${dn}로 옮김 -${formatMoney(cost)}${moving ? ' · 새 동네에선 소문을 처음부터 다시 쌓아야 한다(절반)' : ''}` });
                break;
            }
            const r = findRecipe(rest);
            if (!r) { log.push({ k: 'warn', t: `'${rest}' — 모르는 요리` }); break; }
            if (key === 'menuAdd') {
                if (sh.menu.includes(r[0])) { log.push({ k: 'info', t: `${josa(r[0], '은', '는')} 이미 메뉴에 있다` }); break; }
                if (rank < r[1] && !/강제/.test(arg)) { log.push({ k: 'warn', t: `${r[0]} — 요리 ${LIFE_RANKS[r[1]]} 랭크가 되어야 손님 앞에 낼 수 있다` }); break; }
                const slots = MENU_SLOTS[sh.tier] || 3;
                if (sh.menu.length >= slots) { log.push({ k: 'warn', t: `${sh.name}의 메뉴판이 꽉 찼다 (${slots}가지) — 하나를 빼거나 가게를 키울 것` }); break; }
                sh.menu.push(r[0]);
                log.push({ k: 'gain', t: `${sh.name} 메뉴에 '${r[0]}' 추가${r[3] ? ` (${r[3]} 제철)` : ''}` });
            } else if (key === 'menuDel') {
                const i = sh.menu.indexOf(r[0]); if (i < 0) break;
                sh.menu.splice(i, 1); if (sh.signature === r[0]) sh.signature = null;
                log.push({ k: 'info', t: `${sh.name} 메뉴에서 '${r[0]}' 뺌` });
            } else {
                if (!sh.menu.includes(r[0])) { log.push({ k: 'warn', t: `${josa(r[0], '은', '는')} 메뉴에 없다` }); break; }
                sh.signature = r[0];
                log.push({ k: 'gain', t: `${sh.name}의 대표 메뉴 — '${r[0]}'` });
            }
            break;
        }
        case 'banquet': {
            // 가문연회 가문 | 잔칫상·궁정 만찬
            const [hn, kindRaw = ''] = arg.split(/\s*[|｜]\s*/);
            const h = houseOf(hn); if (!h) throw 0;
            const grand = /궁정|만찬/.test(kindRaw);
            const rank = st.life?.요리?.rank ?? -1;
            const need = grand ? 6 : 3;
            if (rank < need) { log.push({ k: 'warn', t: `${grand ? '궁정 만찬을' : '잔칫상을'} 차리려면 요리 ${LIFE_RANKS[need]} 랭크 이상` }); break; }
            const mine = st.patron?.house === h.name;
            const fs = (st.shops || []).filter(isFoodShop).sort((a, b) => (b.fame || 0) - (a.fame || 0))[0];
            const fame = fs?.fame || 0;
            if (!mine && fame < 35 && !/강제/.test(arg)) { log.push({ k: 'warn', t: `${josa(h.name, '이', '가')} 이름 없는 요리사에게 연회를 맡기지는 않는다 (이름난 맛집 이상)` }); break; }
            if (!mine && houseStance(st, h) !== 'ok') { log.push({ k: 'warn', t: `${josa(h.name, '은', '는')} 당신의 상을 받지 않는다 — 정적의 사람으로 보인다` }); break; }
            if (!mine && !inCapital(h, st.day)) { log.push({ k: 'warn', t: `${josa(h.name, '은', '는')} 지금 제도에 없다` }); break; }
            const ym = ymOf(st.day), k2 = `${ym}|${h.name}|연회`;
            st.nobleDeals = st.nobleDeals || {};
            if (st.nobleDeals[k2]) { log.push({ k: 'info', t: `이달 ${h.name}의 연회는 이미 차렸다` }); break; }
            const base = grand ? 12000 : 1500;
            const cost = Math.round(base * 0.5);
            const pay = Math.round(base * (1.6 + fame / 60) * (mine ? 1.15 : 1));
            if (st.money < cost) { log.push({ k: 'warn', t: `재료를 살 돈이 모자라다 (${formatMoney(cost)})` }); break; }
            st.money += pay - cost;
            st.houseFavor[h.name] = Math.min(100, (st.houseFavor[h.name] || 0) + (grand ? 12 : 6));
            st.nobleDeals[k2] = true;
            if (mine) st.nobleDeals[`last|${h.name}`] = ym;
            if (fs) fs.fame = Math.min(100, (fs.fame || 0) + (grand ? 5 : 2));
            log.push({ k: 'gain', t: `${h.name}의 ${grand ? '만찬' : '연회'}를 차렸다 +${formatMoney(pay - cost)} (재료 ${formatMoney(cost)} 제함) · 호감 +${grand ? 12 : 6}` });
            trainLife(st, '요리', grand ? 12 : 5, log);
            break;
        }
        case 'tradeBuy': case 'tradeSell': {
            // 매입 밀 자루 10   /   매각 모피 묶음 5   — 지금 있는 곳의 이달 시세로 계산
            const m = arg.match(/^(.*?)\s*[x×]?\s*(\d+)\s*(개|단위|짐)?\s*$/);
            const g = findTrade(m ? m[1] : arg); if (!g) throw 0;
            let n = m ? parseInt(m[2]) : 1;
            const market = marketOf(st.location);
            if (!market) { log.push({ k: 'warn', t: '여기엔 교역품을 사고팔 시장이 없다' }); break; }
            const key2 = `${ymOf(st.day)}|${market}|${g[0]}`;
            let total = 0;
            if (key === 'tradeBuy') {
                const room = cargoCap(st) - cargoUsed(st);
                if (n > room) { log.push({ k: 'warn', t: `짐이 가득 — ${room}짐만 더 실을 수 있다` }); n = room; }
                for (let k = 0; k < n; k++) {
                    const q = tradeQuote(st, g[0], market);
                    if (st.money < q.buy) { n = k; break; }
                    st.money -= q.buy; total += q.buy; st.market[key2] = (st.market[key2] || 0) - 1;
                }
                if (!n) { if (room > 0) log.push({ k: 'warn', t: '돈이 모자라다' }); break; }
                addItem(st, g[0], n);
                log.push({ k: 'loss', t: `${market}에서 ${g[0]} ${n}짐 매입 -${formatMoney(total)} (짐당 약 ${formatMoney(Math.round(total / n))})` });
            } else {
                const it = st.items.find(i => nospace(i.name) === nospace(g[0]));
                n = Math.min(n, it?.qty || 0);
                if (!n) { log.push({ k: 'warn', t: `팔 ${g[0]}가 없다` }); break; }
                for (let k = 0; k < n; k++) {
                    const q = tradeQuote(st, g[0], market);
                    st.money += q.sell; total += q.sell; st.market[key2] = (st.market[key2] || 0) + 1;
                }
                removeItem(st, g[0], n);
                log.push({ k: 'gain', t: `${market}에서 ${g[0]} ${n}짐 매각 +${formatMoney(total)} (짐당 약 ${formatMoney(Math.round(total / n))})` });
            }
            // 오래된 달 기록은 지운다
            for (const k of Object.keys(st.market)) if (!k.startsWith(ymOf(st.day) + '|')) delete st.market[k];
            break;
        }
        case 'credit': case 'repay': {
            const all = /전부|모두|전액/.test(arg);
            let v = all ? (key === 'repay' ? st.credit : creditLimit(st) - st.credit) : Math.abs(parseMoney(arg.replace(/^[+]/, ''))?.value || 0);
            if (!v && key === 'repay') v = st.credit || 0; // "외상상환"만 쓰면 전액
            if (!v && key === 'repay') { log.push({ k: 'warn', t: '갚을 외상이 없다' }); break; }
            if (!v) throw 0;
            if (key === 'credit') {
                const room = creditLimit(st) - st.credit;
                if (room <= 0) { log.push({ k: 'warn', t: creditLimit(st) ? `외상 한도(${formatMoney(creditLimit(st))})를 다 썼다` : '상인 길드 점포주부터 외상을 쓸 수 있다' }); break; }
                const x = Math.min(v, room); st.credit += x; st.money += x;
                log.push({ k: 'gain', t: `길드 보증 외상 +${formatMoney(x)} (갚을 돈 ${formatMoney(st.credit)} · 다음 달 1일까지)` });
            } else {
                const x = Math.min(v, st.credit, st.money); if (!x) { log.push({ k: 'warn', t: st.credit ? '갚을 돈이 없다' : '갚을 외상이 없다' }); break; }
                st.credit -= x; st.money -= x;
                log.push({ k: 'loss', t: `외상 상환 -${formatMoney(x)} (남은 외상 ${formatMoney(st.credit)})` });
            }
            break;
        }
        case 'caravan': {
            if (merchantRank(st) < 3) { log.push({ k: 'warn', t: '상단은 상인 길드 상회주부터 꾸릴 수 있다' }); break; }
            if (st.assets.some(a => /상단/.test(a.name || a))) { log.push({ k: 'info', t: '이미 상단이 있다' }); break; }
            if (st.money < 500000) { log.push({ k: 'warn', t: '상단을 꾸릴 돈이 모자라다 (50금)' }); break; }
            st.money -= 500000; st.assets.push(arg.trim() ? `${arg.trim()} 상단` : '상단');
            log.push({ k: 'rank', t: `상단 결성 -50금 — 짐마차 여러 대와 마부, 호위 (짐 300)` });
            break;
        }
        case 'nobleSell': case 'nobleBuy': {
            const hh = houseOf(arg);
            const o = hh && nobleOffers(st).find(x => x.house === hh.name);
            if (!o) { log.push({ k: 'warn', t: `${hh ? hh.name : arg.trim()}는 ${hh && !inCapital(hh, st.day) ? '지금 영지에 있다' : '이달 상인을 찾지 않는다'}` }); break; }
            if (o.rivalBlocked) { log.push({ k: 'warn', t: `${o.house}는 후원 가문(${st.patron.house})과 맞서는 집안이다 — 거래할 수 없다` }); break; }
            if (!o.mine && merchantRank(st) < o.need) { log.push({ k: 'warn', t: `${josa(o.house, '과', '와')} 거래하려면 상인 길드 ${ORGS.merchant.ranks[o.need]} 이상` }); break; }
            if (marketOf(st.location) !== '제도 루미에른') { log.push({ k: 'warn', t: '귀족가와의 거래는 제도에서 한다' }); break; }
            const k2 = `${ymOf(st.day)}|${o.house}|${key === 'nobleSell' ? '납품' : '구입'}`;
            if (st.nobleDeals[k2]) { log.push({ k: 'info', t: `${josa(o.house, '과', '와')}의 이달 거래는 이미 끝났다` }); break; }
            if (key === 'nobleSell') {
                const it = st.items.find(i => nospace(i.name) === nospace(o.good));
                if ((it?.qty || 0) < o.qty) { log.push({ k: 'warn', t: `${o.good} ${o.qty}짐이 있어야 한다 (지금 ${it?.qty || 0})` }); break; }
                removeItem(st, o.good, o.qty); st.money += o.total; st.renown += 2;
                st.houseFavor[o.house] = Math.min(100, (st.houseFavor[o.house] || 0) + (o.stance === 'cold' ? 5 : 10));
                log.push({ k: 'gain', t: `${o.house}에 ${o.good} ${o.qty}짐 납품 +${formatMoney(o.total)} · 명성 +2` });
            } else {
                if (!o.sale) { log.push({ k: 'info', t: `${o.house}는 지금 제도에 없다 — 상관이 주문만 받는다` }); break; }
                if (st.money < o.sale.price) { log.push({ k: 'warn', t: `돈이 모자라다 (${formatMoney(o.sale.price)})` }); break; }
                st.money -= o.sale.price; addItem(st, o.sale.name, 1);
                st.houseFavor[o.house] = Math.min(100, (st.houseFavor[o.house] || 0) + 4);
                log.push({ k: 'loss', t: `${o.house}에서 ${o.sale.name} 구입 -${formatMoney(o.sale.price)}` });
            }
            st.nobleDeals[k2] = true;
            for (const k of Object.keys(st.nobleDeals)) if (!k.startsWith(ymOf(st.day) + '|') && !k.startsWith('last|')) delete st.nobleDeals[k];
            if (key === 'nobleSell' && st.patron?.house === o.house) st.nobleDeals[`last|${o.house}`] = ymOf(st.day);
            break;
        }
        case 'patronJoin': {
            // 스카웃수락 가문 | 상단원·전속 상인
            const [hn, roleRaw = '상단원'] = arg.split(/\s*[|｜]\s*/);
            const h = houseOf(hn); if (!h) throw 0;
            const role = /요리사|요리장|부엌/.test(roleRaw) ? '전속 요리사' : /식당/.test(roleRaw) ? '어용 식당' : /전속|어용|소속/.test(roleRaw) ? '전속 상인' : '상단원';
            const force = /강제/.test(arg);
            const off = scoutOffers(st).find(o => o.house === h.name);
            if (!force && (!off || !off.roles.includes(role))) { log.push({ k: 'warn', t: `${h.name}에서 ${role} 제의가 오지 않았다` }); break; }
            if (st.patron) { log.push({ k: 'info', t: `${st.patron.house}의 후원을 떠남` }); st.houseFavor[st.patron.house] = Math.max(0, (st.houseFavor[st.patron.house] || 0) - 30); }
            st.patron = { house: h.name, role, rank: 0, since: st.day };
            st.houseFavor[h.name] = Math.max(st.houseFavor[h.name] || 0, 20);
            if (role === '전속 상인') for (const sh of st.shops || []) sh.rep = Math.min(100, sh.rep + 10);
            if (role === '어용 식당') for (const sh of (st.shops || []).filter(isFoodShop)) { sh.rep = Math.min(100, sh.rep + 10); sh.fame = Math.min(100, (sh.fame || 0) + 5); }
            if (role === '전속 요리사') log.push({ k: 'info', t: `저택 부엌에서 먹고 잔다 — 생활비가 들지 않고, 내 식당은 점원에게 맡겨진다` });
            log.push({ k: 'rank', t: `${h.name}의 ${josa(PATRON_ROLES[role].ranks[0], '이', '가')} 되었다 (${role})` });
            if (h.rival) log.push({ k: 'warn', t: `${josa(h.rival, '과', '와')}는 이제 거래할 수 없다 — 정적의 사람으로 보인다` });
            break;
        }
        case 'patronLeave': {
            if (!st.patron) break;
            st.houseFavor[st.patron.house] = Math.max(0, (st.houseFavor[st.patron.house] || 0) - 30);
            log.push({ k: 'warn', t: `${st.patron.house}의 후원을 떠났다 — 가문의 호감 -30` });
            st.patron = null;
            break;
        }
        case 'houseFavor': {
            const m = arg.match(/^(.*?)\s*([+\-−]?\d+)\s*$/); if (!m) throw 0;
            const h = houseOf(m[1]); if (!h) throw 0;
            const v = parseInt(m[2].replace('−', '-'));
            st.houseFavor[h.name] = Math.max(0, Math.min(100, (st.houseFavor[h.name] || 0) + v));
            log.push({ k: v >= 0 ? 'gain' : 'loss', t: `${h.name} 호감 ${v >= 0 ? '+' : ''}${v} (${st.houseFavor[h.name]})` });
            break;
        }
        case 'deposit': case 'withdraw': {
            const p = parseMoney(arg.replace(/^[+]/, ''));
            const all = /전부|모두|전액/.test(arg);
            if (key === 'deposit') {
                const v = all ? st.money : Math.min(st.money, Math.abs(p?.value || 0)); if (!v) throw 0;
                st.money -= v; st.bank += v;
                log.push({ k: 'info', t: `길드 예금 +${formatMoney(v)} (잔고 ${formatMoney(st.bank)})` });
            } else {
                const v = all ? st.bank : Math.min(st.bank, Math.abs(p?.value || 0)); if (!v) { log.push({ k: 'warn', t: '찾을 예금이 없다' }); break; }
                const fee = bankFee(v);
                st.bank -= v; st.money += v - fee;
                log.push({ k: 'info', t: `예금 인출 ${formatMoney(v)}${fee ? ` · 수수료 -${formatMoney(fee)}` : ''} (잔고 ${formatMoney(st.bank)})` });
            }
            break;
        }
        case 'strike': {
            // 경고 +1 | 사유   /   경고 -1 (감면)
            const [n, why = '', orgRaw = ''] = arg.split(/\s*[|｜]\s*/);
            const org = (orgRaw && resolveOrg(orgRaw)) || 'adventurer';
            const v = parseInt(String(n).replace(/[^\d\-−+]/g, '').replace('−', '-')) || 1;
            const oname = ORGS[org]?.name || '길드';
            if (v > 0) for (let k = 0; k < v; k++) st.strikes.push({ why: why.trim() || '규약 위반', day: st.day, org });
            else for (let k = 0; k < -v; k++) { const i = st.strikes.map(x => x.org || 'adventurer').lastIndexOf(org); if (i >= 0) st.strikes.splice(i, 1); }
            const n2 = strikesOf(st, org).length;
            log.push({ k: v > 0 ? 'warn' : 'gain', t: v > 0 ? `${oname} 경고 ${n2}회 — ${why.trim() || '규약 위반'}` : `${oname} 경고 감면 (남은 경고 ${n2})` });
            if (v > 0 && n2 >= 5 && st.orgs[org]) { delete st.orgs[org]; log.push({ k: 'warn', t: `${oname} 제명` }); }
            else if (v > 0 && n2 >= 3) log.push({ k: 'warn', t: org === 'merchant' ? '상인 길드 영업 정지 — 가게를 새로 열거나 키울 수 없고 시세 게시판도 못 본다' : `${oname} 자격 정지 — 의뢰를 받을 수 없다` });
            break;
        }
        case 'compGrade': {
            const m = arg.match(/^(.*?)\s*([1-5])\s*$/); if (!m) throw 0;
            const i = findComp(st, m[1]); if (i < 0) throw 0;
            st.companions[i].grade = +m[2];
            log.push({ k: 'info', t: `${st.companions[i].name} — ${GRADE_NAME[+m[2]]}` });
            break;
        }
        case 'compAway': {
            // 맡기기 이름 | 어디·누구   /   대여 이름 | 누구 | 하루 값
            const [name, to = '', fee = ''] = arg.split(/\s*[|｜]\s*/);
            const i = findComp(st, name); if (i < 0) throw 0;
            const c = st.companions[i];
            if (c.kind !== '마수') { log.push({ k: 'info', t: `${c.name}는 맡길 수 없다` }); break; }
            const f = fee ? Math.max(0, parseMoney(fee)?.value || 0) : 0;
            c.away = { to: to.trim() || (f ? '손님' : '마구간'), fee: f || 0, acc: 0 };
            c.out = false;
            log.push({ k: 'info', t: `${c.name} ${f ? `대여 — ${c.away.to} (하루 ${formatMoney(f)})` : `맡김 — ${c.away.to}`}` });
            break;
        }
        case 'compHome': {
            const i = findComp(st, arg); if (i < 0) throw 0;
            const c = st.companions[i];
            if (c.away) { c.away = null; log.push({ k: 'info', t: `${c.name} 돌아옴` }); }
            break;
        }
        case 'compKeep': {
            const outs = (st.companions || []).filter(c => c.out && (!arg.trim() || findComp(st, arg) === st.companions.indexOf(c)));
            for (const c of outs) {
                const cost = keepCost(c);
                if (st.mp >= cost) { st.mp -= cost; log.push({ k: 'loss', t: `${c.name} 유지 · MP -${cost}` }); }
                else { c.out = false; log.push({ k: 'warn', t: `마나가 다해 ${c.name}가 돌아갔다` }); }
            }
            break;
        }
        case 'compCond': {
            const m = arg.match(/^(.*?)\s+([+\-−])\s*(.+)$/); if (!m) throw 0;
            const i = findComp(st, m[1]); if (i < 0) throw 0;
            const c = st.companions[i]; const cd = m[3].trim();
            const j = c.conds.indexOf(cd);
            if (m[2] === '+') { if (j < 0) c.conds.push(cd); log.push({ k: 'warn', t: `${c.name} +${cd}` }); }
            else if (j >= 0) { c.conds.splice(j, 1); log.push({ k: 'gain', t: `${c.name} -${cd}` }); }
            break;
        }
        case 'learnSkill': case 'epiphany': {
            const name = arg.replace(/\s*[|｜].*$/, '').trim();
            const sk = findSkill(name);
            if (!sk) { // 계보에 없는 고유 기술은 '그 밖의 기술'로
                if (!name) throw 0;
                const desc = (arg.split(/\s*[|｜]\s*/)[1] || '').trim();
                if (findByName(st.skills, name) < 0) st.skills.push({ name, desc });
                log.push({ k: 'rank', t: `${key === 'epiphany' ? '깨달음! — ' : '기술 습득 — '}${name}`, ep: key === 'epiphany' ? name : undefined });
                break;
            }
            if (!st.classes[sk.cls]) { st.classes[sk.cls] = { lv: 1, exp: 0 }; log.push({ k: 'rank', t: `클래스 습득 — ${sk.cls}` }); }
            learnSkill(st, sk.name, log, key === 'epiphany' ? '깨달음' : '습득');
            break;
        }
        case 'prof': {
            const m = arg.match(/^(.*?)\s*((?:=\s*)?[+\-−]?\s*\d+)\s*$/); if (!m) throw 0;
            const sk = findSkill(m[1]); if (!sk) break;
            const p = parseNum(m[2]);
            const cur = st.cskills[sk.name]?.p || 0;
            practiceSkill(st, sk.name, p.mode === 'set' ? p.value - cur : p.value, log);
            break;
        }
        case 'focus': {
            const m = arg.match(/^(.*?)\s*((?:=\s*)?[+\-−]?\s*\d+)\s*$/); if (!m) throw 0;
            let body = m[1].trim(); let cls = st.cls;
            const first = body.split(/\s+/)[0];
            if (normClass(first) && body.split(/\s+/).length > 1) { cls = normClass(first); body = body.slice(first.length).trim(); }
            if (!body || !st.classes[cls]) throw 0;
            const p = parseNum(m[2]);
            const curPts = st.classes[cls].focus?.[body] || 0;
            addFocus(st, cls, body, p.mode === 'set' ? p.value - curPts : p.value, log);
            break;
        }
        case 'train': {
            const m = arg.match(/^(.*?)\s*([+\-−]?\s*\d+)?\s*$/); if (!m) throw 0;
            const name = normLife(m[1]); if (!name) throw 0;
            const n = m[2] ? parseInt(m[2].replace(/\s/g, '').replace('−', '-')) : 0;
            trainLife(st, name, n, log);
            break;
        }
        case 'lifeRank': {
            const m = arg.match(/^(.*\S)\s+(\S+)$/); if (!m) throw 0;
            const name = normLife(m[1]); if (!name) throw 0;
            const r = LIFE_RANKS.indexOf(m[2].replace(/랭크/, '').trim());
            if (r < 0) throw 0;
            st.life[name] = { rank: r, pt: 0 };
            log.push({ k: 'rank', t: `${name} 랭크 ${lifeRankName(r)}` });
            break;
        }
        case 'bondForce': {
            const m = arg.match(/^(.*\S)\s+(없음|설렘|연인|약혼|배우자)\s*$/); if (!m) throw 0;
            const name = findPersonKey(st, m[1]);
            const stage = m[2];
            if (stage === '없음') {
                if (st.spouse && nospace(st.spouse.name) === nospace(name)) st.spouse = null;
                delete st.bonds[name];
                log.push({ k: 'info', t: `${name} — 관계 초기화` });
                break;
            }
            if (stage === '배우자') {
                if (st.spouse && st.spouse.name !== name) delete st.bonds[st.spouse.name];
                st.spouse = { name, title: st.spouse?.name === name ? st.spouse.title : '', since: st.day };
                if (isRoyalSpouse(st) && st.noble < NOBLE_ROYAL) { st.noble = NOBLE_ROYAL; log.push({ k: 'rank', t: '신분 — 황족' }); }
            } else if (st.spouse && st.spouse.name === name) st.spouse = null;
            st.bonds[name] = { stage, since: st.day };
            log.push({ k: 'rank', t: `${name} — ${stage}` });
            break;
        }
        case 'divorce': {
            const name = findPersonKey(st, arg.split(/\s*[|｜]\s*/)[0]);
            if (!st.spouse || nospace(st.spouse.name) !== nospace(name)) { log.push({ k: 'warn', t: st.spouse ? `${josa(name, '은', '는')} 배우자가 아니다 (배우자: ${st.spouse.name})` : '혼인한 상대가 없다' }); break; }
            for (const f of st.farms || []) if (f.kin === st.spouse.name) f.kin = null;
            for (const s2 of st.shops || []) if (s2.kin === st.spouse.name) s2.kin = null;
            st.exSpouses.push({ ...st.spouse, until: st.day });
            st.spouse = null;
            delete st.bonds[name];
            log.push({ k: 'loss', t: `${josa(name, '과', '와')} 혼인 관계 종료` });
            break;
        }
        case 'unknown':
            if (op.raw && !/^[<\[]/.test(op.raw)) log.push({ k: 'warn', unknown: true, t: `처리 못 한 변동: ${op.raw}` });
            break;
        default:
            break;
    }
}

/* ───────────────────────── 관계 · 연애 · 혼인 ───────────────────────── */

export const ROMANCE = ['설렘', '연인', '약혼', '배우자'];
// 단계에 오르기 위한 최소 호감 (난이도별)
export const ROMANCE_NEED = {
    easy: { 설렘: 10, 연인: 35, 약혼: 50, 배우자: 50 },
    normal: { 설렘: 20, 연인: 50, 약혼: 70, 배우자: 70 },
    hard: { 설렘: 25, 연인: 60, 약혼: 80, 배우자: 80 },
};

/** 호감으로 정해지는 우정 단계 */
export function friendStage(v) {
    v = Number(v) || 0;
    if (v <= -60) return '원수';
    if (v <= -30) return '적대';
    if (v < -9) return '경계';
    if (v < 10) return '낯선 사이';
    if (v < 30) return '안면';
    if (v < 60) return '친구';
    return '절친';
}

export function romanceNeed(st, stage) {
    return (ROMANCE_NEED[st.difficulty] || ROMANCE_NEED.normal)[stage] ?? 0;
}

/** 지금 이 사람과 다음 연애 단계로 갈 수 있는가 */
export function nextRomance(st, name) {
    const cur = st.bonds?.[name]?.stage || null;
    const idx = cur ? ROMANCE.indexOf(cur) : -1;
    if (idx >= ROMANCE.length - 1) return null;
    const next = ROMANCE[idx + 1];
    const need = romanceNeed(st, next);
    const v = st.rel?.[name] || 0;
    const blockedBySpouse = (next === '약혼' || next === '배우자') && st.spouse && st.spouse.name !== name;
    return { next, need, ok: v >= need && !blockedBySpouse, blockedBySpouse };
}

function nobleFromTitle(title) {
    const t = String(title || '');
    for (let i = NOBLE.length - 1; i >= 4; i--) if (t.includes(NOBLE[i])) return i; // 남작 이상만
    return -1;
}

function findPersonKey(st, name) {
    const n = nospace(name);
    const keys = [...new Set([...Object.keys(st.rel || {}), ...Object.keys(st.bonds || {}), ...(st.party || []).map(m => m.name)])];
    return keys.find(k => nospace(k) === n) || keys.find(k => nospace(k).includes(n) || n.includes(nospace(k))) || name.trim();
}

export function isRoyalSpouse(st) {
    const sp = st.spouse;
    if (!sp) return false;
    return /황태자|황녀|황자|황족/.test(sp.title || '') || /아르망|엘레노어/.test(sp.name || '');
}

/* ───────────────────────── 판정 ───────────────────────── */

export const TIER_ORDER = ['대실패', '실패', '부분 성공', '성공', '대성공'];

export function rollCheck(st, stat, dc, rng = Math.random, what = '') {
    const D = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    const d20 = 1 + Math.floor(rng() * 20);
    const mod = statMod(st.stats?.[stat] ?? 15);
    const cb = CLASSES[st.cls]?.stats?.includes(stat) ? (st.lv >= 30 ? 2 : 1) : 0;
    const fb = focusBonus(st, what);
    const ab = elemOfText(what).some(e => hasAffinity(st, e)) ? 1 : 0;
    const bonus = D.rollBonus + cb + Math.min(3, fb.bonus + ab) + (hasPerk(st, '행운') ? 1 : 0) - ((st.conds || []).length ? 1 : 0);
    const total = d20 + mod + bonus;
    const luck = statMod(st.stats?.행운 ?? 15);
    const critMin = 20 - Math.max(0, Math.min(2, luck));          // 행운이 높으면 19~20도 대성공
    const fumbleMax = 1 + Math.max(0, Math.min(2, -luck));         // 행운이 낮으면 2~3도 대실패
    let tier;
    // 주사위 1(행운이 낮으면 2~3)은 합계가 난이도에 못 미쳤을 때만 대실패 — 넘었으면 평소대로
    const fumble = d20 <= fumbleMax && total < dc;
    if (d20 >= critMin) tier = '대성공';
    else if (fumble) tier = D.noCritFail ? '실패' : '대실패';
    else if (total >= dc + 8) tier = '대성공';
    else if (total >= dc) tier = '성공';
    else if (total >= dc - 3) tier = '부분 성공';
    else tier = '실패';
    return { stat, dc, d20, mod, bonus, total, tier, nat: d20 >= critMin ? 'crit' : fumble ? 'fumble' : null, focus: fb.name || (ab ? '적성 속성' : null), focusBonus: fb.bonus, affinity: !!ab, at: Date.now() };
}

export function describeRoll(r) {
    const parts = [`d20(${r.d20})`];
    if (r.mod) parts.push(`${r.stat} ${r.mod > 0 ? '+' : ''}${r.mod}`);
    if (r.bonus) parts.push(`보정 ${r.bonus > 0 ? '+' : ''}${r.bonus}${r.focus ? `(${r.focus} 포함)` : ''}`);
    const nat = r.nat === 'crit' ? ` · 주사위 ${r.d20}이라 대성공` : r.nat === 'fumble' ? ` · 주사위 ${r.d20}이라 ${r.tier}` : '';
    return `${parts.join(' ')} = ${r.total} / 난이도 ${r.dc}${nat}`;
}

/* ───────────────────────── 프롬프트 ───────────────────────── */

export function profileText(st) {
    const p = st.profile, a = p.appearance || {};
    const app = [a.height && `체격 ${a.height}`, a.hair && `머리 ${a.hair}`, a.eyes && `눈 ${a.eyes}`, a.impression && `인상 ${a.impression}`, a.marks && `특징 ${a.marks}`, a.outfit && `차림 ${a.outfit}`, a.free].filter(Boolean).join(', ');
    const lines = [
        `이름: ${p.name}${p.gender ? ` / ${p.gender}` : ''} / ${ageOf(st)}살(${ageStage(ageOf(st))}${st.aging ? ' · 해마다 나이를 먹는다' : ' · 나이를 먹지 않는 이야기'}) / ${p.race}`,
        `출신: ${ORIGINS[p.origin]?.label}${p.origin === 'reincarnated' ? ' (현대에서의 전생 기억 보유)' : p.origin === 'transferred' ? ' (현대에서 몸째 넘어옴, 언어는 통함)' : ''} · 배경: ${BACKGROUNDS[p.background]?.label} — ${BACKGROUNDS[p.background]?.desc}`,
    ];
    if (app) lines.push(`외모: ${app}`);
    if (p.personality) lines.push(`성격: ${p.personality}`);
    if (p.story) lines.push(`사연: ${p.story}`);
    if (p.goal) lines.push(`목표: ${p.goal}`);
    const perks = [...(p.perksFree || []), ...(p.perks || [])];
    if (perks.length) lines.push(`이세계 특전: ${perks.map(k => PERKS[k] ? `${k}(${PERKS[k]})` : k).join(' / ')}`);
    return lines.join('\n');
}


/* ───── 프롬프트 다이어트: 규칙 설명은 지금 장면과 관련 있을 때만 붙인다 ─────
   opt.ctx(최근 대화 글)가 없으면(테스트·첫 장면) 전부 붙인다. opt.turn이 10의 배수인 턴에도 한 번씩 전부 붙여 잊지 않게 한다. */
const FOCUS_KEYS = { shop: '가게', trade: '교역·상인 길드', farm: '농장·말', noble: '귀족', romance: '연애', comp: '동반자', combat: '전투', travel: '먼 길', bank: '예금', honor: '공훈', animal: '길동물' };
const ALL_FOCUS = { ...Object.fromEntries(Object.keys(FOCUS_KEYS).map(k => [k, true])), skipped: [] };
const FOCUS_RX = {
    shop: /가게|식당|메뉴|손님|장사|점포|노점|상회|진열|매출|점원|단골|여관을|주점을/,
    trade: /시세|교역|매입|매각|상단|짐마차|상인 ?길드|외상|무역|납품|어음/,
    farm: /농장|밭|가축|수확|소작|마구간|망아지|종마|준마|명마|씨수말|암말|목장|양조|포도/,
    noble: /귀족|연회|가문|백작|후작|공작|남작|자작|사교|무도회|후원|스카웃|영애|영식|황궁|황제/,
    romance: /연애|고백|데이트|사랑|입맞|키스|결혼|약혼|혼담|설렘|연인|청혼|아이를|임신/,
    comp: /정령|소환|불러|길들|유대|반려|강아지|고양이|돌보|테이머|마수|먹이/,
    combat: /전투|싸우|싸움|마물|몬스터|던전|미궁|토벌|처치|검을|칼을|공격|활을|마법을|기술을|주문|결투|훈련/,
    travel: /여행|떠나|출발|마차|짐배|길을 나|가는 길|다른 도시|세렌포트|하벤|비엔|엘름바트|철문|바르그홀름|그레이븐|브레이크|경계목|이스메라|사하르/,
    bank: /예금|인출|은행|맡기|맡겨|금고|큰돈/,
    honor: /공훈|서임|작위|기사작|훈장|포상/,
};
export function promptFocus(st, opt = {}) {
    if (typeof opt.ctx !== 'string' || opt.prologue || (opt.turn != null && opt.turn % 10 === 0)) return ALL_FOCUS;
    const t = opt.ctx;
    const names = (arr) => arr.filter(Boolean).some(n => n.length >= 2 && t.includes(n));
    const F = {};
    for (const k of Object.keys(FOCUS_RX)) F[k] = FOCUS_RX[k].test(t);
    F.shop ||= names((st.shops || []).map(x => x.name));
    F.farm ||= names((st.farms || []).flatMap(f => [f.name, ...(f.stable || []).map(h => h.name)]));
    F.comp ||= names((st.companions || []).map(c => c.name));
    F.romance ||= names(Object.keys(st.bonds || {}));
    F.noble ||= !!(st.patron && t.includes(st.patron.house));
    F.honor ||= !!st.honor?.pending || F.noble;
    F.bank ||= (st.money || 0) >= 1000000;
    F.trade ||= !!marketOf(st.location) && /시장|사고|팔고|팔아|사러|팔러|물건/.test(t);
    F.animal = F.comp || (st.day % 10) < 2;
    const has = { shop: st.shops?.length, trade: st.orgs?.merchant || cargoUsed(st), farm: st.farms?.length, comp: st.companions?.length, combat: st.cls, romance: true, noble: true, travel: true };
    F.skipped = Object.keys(has).filter(k => has[k] && !F[k]).map(k => FOCUS_KEYS[k]);
    return F;
}

export function buildPrompt(st, opt = {}) {
    const F = promptFocus(st, opt);
    const D = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    const date = formatDate(st.day);
    const statLine = STATS.map(s => `${s} ${st.stats[s]}(${statMod(st.stats[s]) >= 0 ? '+' : ''}${statMod(st.stats[s])})`).join(' · ');
    const orgLines = Object.entries(st.orgs).map(([id, m]) => {
        const next = m.rank + 1;
        const ranks = ORGS[id].ranks;
        if (next >= ranks.length) return `- ${orgLabel(id, m.rank)} (최고 지위)`;
        const need = meritNeed(st, next);
        const ready = m.merit >= need;
        return `- ${orgLabel(id, m.rank)} · 공적 ${m.merit}/${need}${ready ? ` ★승급 자격 충족 — 적절한 때에 ${ranks[next]} 승급 시험/심사 기회를 연출할 것` : ''}`;
    });
    const eq = Object.entries(st.equip || {}).filter(([, v]) => v).map(([k, v]) => { const g = gearOf(st, k); return `${SLOT_LABEL[k] || k}: ${v}${g?.plus ? ` +${g.plus}` : ''}${g && g.dur < g.max ? ` (내구 ${g.dur}/${g.max}${g.dur <= 0 ? ' 망가짐 — 제 구실을 못 한다' : ''})` : ''}`; }).join(', ');
    const items = st.items.slice(0, 30).map(i => `${i.name}${i.qty > 1 ? '×' + i.qty : ''}`).join(', ');
    const rel = Object.entries(st.rel).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 12).map(([n, v]) => `${n} ${v > 0 ? '+' : ''}${v}`).join(', ');

    const L = [];
    L.push('[왕관과 길드 — 게임 상태 (확장이 관리하는 정답 수치. 서술은 이 수치와 모순되지 않게)]');
    L.push('');
    L.push(`■ 난이도: ${D.label} (${D.sub})`);
    for (const t of DIFF_TONE[st.difficulty] || DIFF_TONE.normal) L.push(`- ${t}`);
    L.push('');
    L.push('■ 플레이어 캐릭터 ({{user}})');
    L.push(profileText(st));
    L.push('');
    L.push(`■ 현재 상태`);
    L.push(`${st.cls || ''} Lv ${st.lv} (EXP ${st.exp}/${expNeed(st)}) · HP ${st.hp}/${maxHP(st)} · MP ${st.mp}/${maxMP(st)}${st.statPoints ? ` · 미분배 능력 포인트 ${st.statPoints}` : ''}`);
    { const en = energyOf(st), mx = maxEN(st);
      L.push(`기력 ${en}/${mx}${en <= mx * 0.2 ? ' — 곧 쓰러질 만큼 지쳐 있다(묘사할 것)' : en <= mx * 0.5 ? ' — 지쳐 있다' : ''}. 힘을 쓴 장면마다 <변동>에 "기력 -N"(가벼운 일 -5, 노동·훈련·오래 걷기 -10~15, 전투 -10~25). 시간대가 한 칸 지나면 확장이 -${TOD_DRAIN}, 잠·낮잠으로 회복("낮잠"이라 적으면 시간대 한 칸 + 생활 수준만큼 회복). 0이 되면 확장이 기절을 처리한다(자택이 없으면 누군가 치료소·여관으로 옮기고 돈이나 물건을 챙겨 간다).`);
      const lf = st.lastFaint; if (lf && lf.day === st.day && (st.tod ?? 0) === 0) L.push(`■ 직전에 {{user}}가 기력이 다해 쓰러졌다 — 이번 응답은 ${lf.where}에서 눈을 뜨는 장면부터. ${lf.home ? '집이라 잃은 것은 없다.' : `데려다준 사람이 ${lf.lost}을(를) 챙겨 갔다 — 누가, 왜 그랬는지 자연스럽게 보여 줄 것.`}`); }
    L.push(`능력치: ${statLine} — 10대가 평범한 사람, 30이 초보 모험가, 60이 이름난 실력자, 100이 인간의 한계. 지금 상한 ${statCap(st)}(${STAT_CAP_NAMES[Math.min(3, st.capBreak || 0)]}). 훈련·사건으로 오를 때 <변동>에 "능력 근력 +2"처럼(작은 성장 +1, 뚜렷한 성장 +2~3, 극적인 각성 +5).${STATS.some(k => st.stats[k] >= statCap(st)) && (st.capBreak || 0) < 3 ? ` 상한에 닿은 능력치가 있다 — 죽을 고비를 넘기거나, 전설의 존재를 쓰러뜨리거나, 정령왕과 계약하거나, S등급에 오르는 것 같은 큰 사건 뒤에만 <변동>에 "한계돌파 이유"를 적어 상한을 한 단계 올린다(${statCap(st)} → ${STAT_CAPS[Math.min(3, (st.capBreak || 0) + 1)]}).` : ''}`);
    if (st.cls && CLASSES[st.cls]) {
        const C = CLASSES[st.cls];
        const skl = (c) => learnedSkills(st, c).map(x => `${x.name}(${profTierName(profTier(st, x.p))})`).join(', ') || '없음';
        L.push(`주 클래스: ${st.cls} Lv ${st.lv} (${C.role} · ${C.weapon}) — 익힌 기술: ${skl(st.cls)}`);
        const fl = Object.entries(st.classes[st.cls]?.focus || {}).sort((a, b) => b[1] - a[1]);
        if (fl.length) L.push(`  ${st.cls}로서의 강점: ${fl.slice(0, 4).map(([n, v]) => `${n}(${focusTierName(focusTier(st, v))})`).join(', ')} — 특화·정통인 분야는 능숙하고 화려하게, 클래스 기술도 이 강점의 색으로 묘사한다.`);
        if (st.sub && st.classes[st.sub]) L.push(`보조 클래스: ${st.sub} Lv ${st.classes[st.sub].lv} — 익힌 기술: ${skl(st.sub)} (보조라 위력이 주 클래스보다 한 단계 낮다)`);
        if (Object.keys(st.cskills).some(k => findSkill(k)?.taboo)) L.push('  ※ 금기인 어둠 마법을 알고 있다. 사람들 앞에서 쓰면 교회의 이단 심문관이 움직일 수 있다.');
        if (F.combat) L.push('  ※ 어떤 클래스든 숙련되면 마법사 못지않게 강하다. 달인·극의에 이른 궁수·도적·격투가·음유시인·테이머의 기술은 전설로 회자될 만큼 압도적으로 묘사한다.');
        if (F.combat) L.push(`  ※ 익힌 기술만 쓸 수 있다. 기술은 숙련도(미숙·익숙·숙련·달인·극의)에 맞게 묘사한다 — 미숙하면 서툴고 실패하기 쉽고, 달인이면 자유자재다.`);
        const others = Object.entries(st.classes).filter(([k]) => k !== st.cls && k !== st.sub);
        if (others.length) L.push(`익힌 다른 클래스: ${others.map(([k, v]) => `${k} Lv ${v.lv}`).join(', ')} (지금은 쓰지 않음)`);
    }
    const aff = st.affinity || [];
    if (aff.length) {
        L.push(`적성 속성: ${aff.join('·')} — 적성 속성의 마법·기술은 숙련이 쉽고 위력도 좋다. 적성이 없는 속성은 서툴다.${hasAffinity(st, '어둠') ? ' (어둠 적성은 남에게 알려지면 교회의 의심을 산다)' : ''}`);
        if (!MAGIC_BORN.includes(st.cls)) L.push(`  ${st.cls}이지만 ${aff.join('·')} 적성을 타고나, 기술과 힘에 그 속성이 자연스레 깃든다 (예: 불이면 검격에 열기가 서리고, 바람이면 화살이 바람을 탄다). ${aff.includes(COMMON_AFF[st.cls]) ? `${COMMON_AFF[st.cls]} 적성은 ${st.cls}에게 흔한 편이다.` : `${st.cls} 중에는 드문 일이라 눈여겨보는 사람이 있다.`}`);
    } else L.push('적성 속성: 무속성 — 속성 마력이 없다(일반 직업 대부분이 그렇다). 기술은 순수한 무기술과 몸의 힘으로 그린다. 속성 마법은 쓰지 못하지만 마법 도구·부여 장비는 쓸 수 있다.');
    if (CLASS_TRAIT[st.cls]) L.push(`  ${CLASS_TRAIT[st.cls]}`);
    if (F.comp) if (st.classes?.테이머) L.push('  길들이기 판정: <판정>매력 | DC | 길들이기 시도</판정> — DC는 8 + 격×2(순한 짐승 10 · 사나운 짐승 12 · 마수 14 · 상위 마수 16 · 전설 18)에, 그 짐승이 다른 이와 쌓은 유대 10마다 +1. 주인이 있는 짐승(남의 말, 다른 테이머의 짐승)은 그 유대에 비례해 어렵고 실패하기 쉽다. 실패하면 짐승이 경계해 한동안 다시 시도하기 어렵다. 성공하면 "길들임 +이름 | 마수 | 종족".');
    if ([st.cls, st.sub].includes('마법사')) L.push('  마법을 쓰면 그때마다 <변동>에 "MP -N"(기초 5·중급 12·상급 25·비전 50)을 적는다. MP가 모자라면 그 마법은 실패하거나 쓸 수 없다.');
    if (st.cls) L.push(`클래스 발현: ${st.cls} — ${rarityName(st.cls)}. ${RARITY[classRarity(st.cls)][1]} 희귀한 클래스일수록 사람들이 놀라거나 탐내거나 경계한다.`);
    for (const c of [st.cls, st.sub]) {
        if (!c || !st.classes?.[c] || !hasPath(c)) continue;
        const mp = classPath(st, c);
        const br = c === '마법사' ? '속성' : `갈래(${Object.keys(BRANCHES[c] || {}).join('·')})`;
        L.push(mp.path ? `${classWay(c)}: ${pathLabel(mp)} — ${pathDesc(mp)} 이 색깔로 ${c}의 기술을 그린다.` : `${classWay(c)}: 아직 정해지지 않음 — 어떤 ${br}를 주로 쓰느냐에 따라 외길·두 갈래·올라운더로 갈린다.`);
    }
    if (Object.keys(st.cskills || {}).some(k => findSkill(k)?.aff) && (st.affinity || []).length) L.push(`  ※ '속성 ~' 기술은 타고난 ${(st.affinity).join('·')} 속성이 깃든 기술이다 — 그 속성으로 구체적으로 그린다(예: 불이면 속성 일격 = 화염을 두른 일격).`);
    if (st.companions?.length) {
        L.push('동반자 (함께하는 정령·소환수·마수):');
        for (const c of st.companions) {
            const K = COMPANION_KINDS[c.kind];
            L.push(`- ${c.name} — ${c.kind === '마수' && !c.tamed ? (c.pet ? '반려동물' : '함께 사는 동물') : c.kind} · ${compSpecies(c)}${c.trait ? ` · 성격: ${c.trait}` : ''}${c.home ? ` · ${c.home === '자택' ? '집에서 기다림' : `${c.home}의 마스코트`}` : ''}${c.elem ? ` · ${c.elem} 속성` : ''} · ${companionStage(c)} Lv ${c.lv}${CALL_MP[c.kind] ? ` · ${c.out ? `지금 불려 나와 있음 (유지 MP ${keepCost(c)})` : `쉬는 중 (부르기 MP ${callCost(c)})`}` : ''}${c.kind === '마수' && c.tamed ? ` · ${GRADE_NAME[c.grade || 1]} · ${obeyState(c).name} (뜻대로 부리려면 유대 ${obeyNeed(c)})${c.away ? ` · 지금 곁에 없음: ${c.away.fee ? `${c.away.to}에게 대여 중 (하루 ${formatMoney(c.away.fee)})` : `${c.away.to}에 맡김`} — 교감 유지 앞으로 약 ${awayDaysLeft(c)}일` : ''}` : ''} · HP ${c.hp}/${c.maxhp} · 유대 ${c.bond}${c.terms ? ` · 계약 조건: ${c.terms}` : ''}${c.conds.length ? ` · 상태: ${c.conds.join(', ')}` : ''}`);
        }
        if (F.comp) if (st.companions.some(c => c.kind === '마수' && !c.tamed)) L.push('  함께 사는 동물·반려동물: 테이머의 영혼 유대가 아니라 진짜 동물과 사람처럼, 함께 보낸 시간과 성격으로 가까워진다(확장이 날마다 조금씩 올린다). 먹이·빗질·산책 장면이 있으면 <변동>에 "돌보기 이름". 명령을 알아듣는 게 아니라 제 성격대로 움직인다. 가게에 두려면 "반려자리 이름 | 가게이름"(마스코트), 집에 두려면 "반려자리 이름 | 자택".');
        if (st.classes?.테이머) L.push(`  영혼의 자리: ${soulUsed(st)}/${soulCap(st)} — 짐승은 격만큼 자리를 차지한다(순한 짐승 1 · 사나운 짐승 2 · 마수 3 · 상위 마수 5 · 전설 8). 자리가 모자라면 새로 길들일 수 없다(확장이 막는다). 놓아주려면 "동반자 -이름".`);
        if (F.comp) if (st.companions.some(c => c.kind === '마수' && c.tamed)) L.push('  길들인 짐승: 한 번 길들인 뒤에는 명령·합동 공격에 MP가 들지 않는다(교감·길들이기 같은 마음을 여는 기술에만 MP). 대신 유대를 꾸준히 지켜야 한다 — 돌보고 먹이고 함께 싸우면 "유대 이름 +N". 짐승은 격(순한 짐승 < 사나운 짐승 < 마수 < 상위 마수 < 전설)이 높을수록 똑똑하고 강해서 뜻대로 부리기 어렵다: 제멋대로·반쯤 따름이면 명령을 무시하거나 제 판단으로 움직인다. 유대가 가득한 짐승은 떨어져 있어도 최대 반년쯤 교감이 이어진다. 맡기거나 빌려줄 때 "맡기기 이름 | 어디", "대여 이름 | 누구 | 하루 값", 돌아오면 "데려오기 이름".');
        if (F.comp) if (st.companions.some(c => CALL_MP[c.kind])) L.push('  부르기·유지: 정령과 소환수는 불러내야 싸운다 — <변동>에 "불러내기 이름"(확장이 부르기 MP 차감), 돌려보낼 때 "돌려보내기 이름". 불려 나와 있는 동안은 장면마다(전투라면 서너 합마다) "유지"를 적으면 확장이 유지 MP를 차감하고, 마나가 모자라면 돌아간다. 날이 바뀌면 모두 쉬러 돌아간다.');
        if (F.comp) L.push('  동반자 규칙: 정령은 부탁을 들어주는 친구(유대가 낮으면 변덕, 주변 환경에 따라 힘이 변함). 정령은 정령술사의 눈에만 보인다 — 다른 사람은 정령이 일으킨 힘만 보고 모습은 못 본다(허공에 말하는 것처럼 보임). 상급 이상은 정령 자신이 원하고 주인도 막지 않을 때만 남에게 모습을 드러낼 수 있고, 하급·중급은 드러낼 수 없다. 소환수는 평소 곁에 없고 부를 때만 오며, 계약 조건을 어기면 반발하거나 떠난다. 마수는 늘 곁에 있고 성격과 습성이 있으며 먹이(확장이 자동 차감)가 필요하다. 함께 싸우거나 돌보면 <변동>에 "유대 이름 +3", "성장 이름 +10".');
        if (F.comp && st.classes?.정령술사) {
            const cap = (st.companions || []).some(c => c.kind === '정령') ? spiritCap(st) : 0, kings = spiritKings(st), kr = kingReady(st);
            L.push(`  정령의 격: 정령은 자기보다 격이 낮은 술사에게 응하지 않는다 — 지금 새로 맺을 수 있는 정령은 ${SPIRIT_GRADES[cap]}까지(키운 정령의 가장 높은 등급). 하급은 어디서나 교감으로, 중급 이상은 그 속성이 짙은 곳(화산·깊은 호수·높은 고개·오래된 동굴 등)에서만 만나고, 상급·최상급 야생 정령은 바로 응하지 않고 시험(부탁·성소 지키기·여러 번 찾아오기)을 낸다. 격이 넘는 정령은 장면에서 모습을 비추더라도 계약하지 않는다. 계약할 때 종족 칸에 등급 이름(예: 엔다이론)을 적는다.`);
            L.push(`  정령왕: 속성마다 하나뿐인 처음부터 왕인 존재(샐리온·엘라임·실피드·노아스·헬리루미온·에레보녹스·제우라이온·스카프로온·모르드리온). 키워서 되는 게 아니라 찾아가 인정받는다 — 조건(비전 「정령왕의 계약」 + 그 속성 최상급 정령과 유대 90 이상)을 채우면 그 정령이 속성의 근원지인 '왕의 자리'로 안내하고, 왕의 시험을 통과하면 <변동>에 "정령계약 +이름 | 정령 | 정령왕 | 속성". 정령왕과는 평생 한 번만 계약하며, 특화 '다중 계약'이 정통이면 여러 왕과 맺을 수 있다. 지금: ${kings.length ? `계약한 왕 ${kings.map(k => k.name).join(', ')}${multiKingOk(st) ? ' · 다중 계약 정통이라 다른 왕도 가능' : ''}` : kr.ok ? `조건 충족 — ${kr.guide.name}가 왕의 자리로 안내할 수 있다` : `아직 — ${kr.why.join(' · ')}`}.`);
        }
        if (F.comp && st.classes?.소환사) {
            const tns = st.truenames || [];
            L.push(`  소환사의 진명: 하위 존재는 소환진만으로 응하지만, 중위 이상은 참된 이름(진명)을 알아야 계약할 수 있다. 진명은 금서·유적·다른 소환사에게서 얻는다(<변동> "진명 이름 | 세계 | 등급", 금서는 "해독 금서이름"). 군주급(마계 대공·대천사·리바이어던·요정 여왕)은 진명에 더해 비전 「문 열기」로 그 세계에 직접 건너가 협상해야 한다. 아는 진명: ${tns.length ? tns.map(x => `${x.name}(${x.realm} ${SUMMON_GRADES[x.grade]})`).join(', ') : '없음'}.`);
            L.push('  계약의 대가: 소환수와 계약하거나 큰 힘을 빌릴 때 대가를 정하면 <변동>에 "대가 이름 | 내용 | 기한(일)", 치르면 "대가이행 이름". 기한을 넘기면 확장이 그 존재를 분노 상태로 만든다 — 분노한 존재는 부름에 늦게 응하거나, 응하지 않거나, 대가를 제멋대로 받아 간다.');
        }
        if ((st.pacts || []).some(p => !p.done)) {
            const open = st.pacts.filter(p => !p.done);
            L.push(`  남은 대가: ${open.map(p => p.broken ? `${p.who} — ${p.what} (기한을 넘김 · 분노 중)` : `${p.who} — ${p.what} (${p.due - st.day}일 남음)`).join(' / ')}`);
        }
        if (F.comp && st.classes?.테이머) L.push('  테이머의 진화와 전설: 비전 「진화 유도」로 우두머리가 된(유대 80 이상) 마수를 한 단계 위의 존재로 거듭나게 할 수 있다 — <변동> "진화 이름 | 새 종족"(예: 늑대 → 다이어울프 → 펜리르의 핏줄). 진화하면 등급이 올라 영혼의 자리를 더 차지한다. 용·불사조·펜리르 같은 전설의 존재는 깊은 서식지(잿빛 산맥 봉우리, 북부 설원, 흑림 심층)에서만 마주치며, 테이머 비전을 깨달은 이에게만 마음을 연다.');
    }
    const lifeList = Object.entries(st.life || {});
    if (lifeList.length) L.push(`생활 기술: ${lifeList.map(([k, v]) => `${k} ${lifeRankName(v.rank)}랭크`).join(', ')}`);
    L.push(`신분: ${statusLabel(st)} · 명성 ${st.renown} · 주 직업: ${st.mainJob || '무소속'}`);
    if (st.family) { const f = st.family; L.push(`가문: ${f.house}(${f.title} · ${f.region} · ${f.faction}${f.own ? ' · 직접 설정한 가문 — GM이 가문의 사람들과 사정을 일관되게 만들어 갈 것' : ' · 로어북에 이 가문 인물이 있으면 가족·친척으로 엮되, 플레이어의 출생 설정(몇째, 후계 여부)이 우선한다'}) — ${f.head ? '당주' : `${birthLabel(f, st.profile?.gender)}${f.heir ? ', 후계자' : ', 후계자 아님'}`}${f.siblings ? ` · 형제자매: ${f.siblings}` : ''} · 집안의 총애 ${f.favor ?? 50}${f.disowned ? ' · 의절 상태' : ''}. 귀족 자제답게 예법·혼담·사교계·가문의 기대와 체면이 이야기에 얽힌다. 후계자가 아니면 후계 다툼, 분가, 기사·마도사·거상·모험가 같은 자기 길을 고를 수 있다. 총애가 오르내리면 "가문총애 +N", 후계 지명·박탈은 "후계지명"/"후계박탈", 가문을 물려받으면 "가문승계".`); }
    { const h = st.honor || {}; L.push(`공훈 ${h.pts || 0}${h.title ? ` · 작위 ${h.title}${h.hereditary && h.houseName ? `(${h.houseName})` : ''}` : ''}${h.pending ? ` · '${h.pending}' 서임 대상(6월 10일 황제 탄신 축하연)` : ''} ${F.honor ? '— 나라에 세운 큰 공엔 "공훈 +N | 사유"(작은 공 10~30, 큰 공 50~150, 나라를 구한 공 200+). 공훈 100·250·500·900·1500에서 일대 기사작·일대 남작·세습 남작(새 가문)·자작·백작으로 서임된다(확장이 처리). 황제의 특별 칙령은 "작위수여 작위 | 세습/일대".' : ''}`); }
    const mk = marketOf(st.location);
    const affs = affairsOf(st.day);
    { const wm = mk || '제도 루미에른'; const cr = crowdOf(wm, st.day); L.push(`오늘 날씨: ${cr.weather}${mk ? ` · ${mk} 거리의 손님 ${cr.label}${cr.why.length ? `(${cr.why.join('·')})` : ''}` : ''} — 장면에 자연스럽게 묻어나게.`); }
    if (st.estates?.length) L.push(`땅과 집: ${st.estates.map(e => e.name).join(', ')} — 세·배당·수확은 확장이 달마다 처리. 세입자·소작인·광산 사람들과의 일을 이야기로 그릴 수 있다.`);
    L.push('생업: 일자리(날품팔이·부두 하역꾼·광산 인부·주점 악사·필경사·마부·귀족가 시종 등)로 며칠씩 일하면 "일하기 일자리 N일".');
    if ((st.commissions || []).length) L.push(`맡은 주문 제작: ${st.commissions.map(c => `${c.client} — ${c.item} ${c.qty}개(${c.qmin} 이상), 기한 ${Math.max(0, c.due - st.day)}일 남음`).join(' / ')}. 의뢰인과의 만남·독촉·감사를 이야기에 녹인다.`);
    if (st.orgs.artisan) { const A = st.orgs.artisan; const nx = Object.keys(MASTER_EXAM).map(Number).find(x => x > A.rank && !A.exams?.[x]); if (nx) L.push(`장인 길드: ${ORGS.artisan.ranks[nx]}이 되려면 걸작 심사(${MASTER_EXAM[nx][2]})를 통과해야 한다 — 제도·바르그홀름 본관.`); }
    { const crafts = Object.keys(st.life || {}).filter(k => lineOf(k)); if (crafts.length) L.push(`장인 일: ${crafts.map(k => `${k} ${LIFE_RANKS[st.life[k].rank]}`).join(', ')} — 만들기·납품·진열은 확장의 공방 탭에서 처리("제작 품목 수량", "납품 품목 수량", "진열 가게 | 품목 수량"). 납품값은 정세·계절·축제·날씨·시장에 따라 오르내린다. GM은 손님·주문·납품처 사람들과의 이야기를 그린다.`); }
    if (st.farms?.length) {
        L.push(`농장(지주 칭호: ${landTitle(st) || '없음'} · 땅 ${landTotal(st)}필지): ${st.farms.map(f => { const u = farmUse(f); const herd = Object.entries(f.herd || {}).filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n}`).join(' '); return `${f.name}(${f.market} · ${f.plots}필지 — 밭 ${(f.fields || []).map(x => `${x.crop} ${x.plots}`).join(' ') || '없음'}, 과수원 ${(f.orchards || []).map(x => `${x.fruit} ${x.plots}`).join(' ') || '없음'}, 목초지 ${u.pasture}, 소작 ${u.tenant}, 놀림 ${u.free}${herd ? ` · 가축 ${herd}` : ''} · 일꾼 ${f.workers || 0}${f.steward ? ' · 관리인 있음' : ''}${(f.cellar || []).length ? ` · 술 저장고 ${(f.cellar || []).map(c => `${c.drink} ${c.qty}(${drinkAge(c, st.day)}년)`).join(' ')}` : ''})`; }).join(' / ')}`);
        { const hs = (st.farms || []).flatMap(f => (f.stable || []).map(h => `${h.name}(${h.sex}·${h.breed}${h.coat ? `·${h.coat}` : ''}${h.marks ? `·${h.marks}` : ''}·${h.grade == null ? horseStage(h, st.day) : HORSE_GRADES[h.grade]}${h.preg ? '·새끼 뱀' : ''})`)); if (hs.length) L.push(`  마구간: ${hs.join(', ')}. 말은 짐말·보통 말·좋은 말·준마·명마·천리마로 나뉘고, 망아지는 부모의 혈통과 들인 정성에 따라 확률적으로 자란다. 명마에는 교배 신청과 귀족의 매입 제안이 들어온다(확장이 처리). GM은 말과의 교감, 말 시장, 경마·사냥 대회, 말 도둑을 그린다.`); }
        if (F.farm) L.push('  농장 규칙: 수확·가축·품삯·소작료는 확장이 달마다 계산한다. GM은 농장의 사계절(씨뿌리기, 새끼 받기, 털 깎기, 수확 잔치, 포도 밟기), 일꾼과 소작인, 이웃 지주와의 물길·경계 다툼, 가축 도둑과 늑대, 우박과 가뭄을 이야기로 그린다. 수확물이 늘거나 줄 일이면 "농장소출 농장 | 품목 ±N". 땅이 많아질수록(작은 지주→지주→대지주) 마을 유지로 대접받고 귀족가와 상단이 손을 내민다.');
    }
    { const ns = namedStaff(st); if (ns.length) L.push(`고용인: ${ns.map(p => `${p.where}의 ${p.role} ${p.name}(${p.trait})`).join(' · ')} — 이 사람들을 장면에 꾸준히 등장시킨다. 이름을 바꾸면 "고용인이름 장소 | 역할 | 새 이름".`); }
    { const ev = monthEvents(st); if (ev.length) L.push(`이달의 사건: ${ev.map(e => `${e.name} — ${e.desc}`).join(' / ')} — 이번 달 안에 장면으로 그린다(수치 효과는 확장이 이미 반영).`); }
    { const sc = mySchedule(st, 45).slice(0, 4); if (sc.length) L.push(`다가오는 내 일정: ${sc.map(x => `${x.text}(${x.day - st.day}일 후)`).join(', ')}`); }
    if (isTitled(st)) L.push(`작위의 의무: 영지 수입·연금에서 황실 공납이 빠진다(확장이 처리).${warThisMonth(st.day) ? ` 이달 소집령이 내려졌다 — 직접 나서면 "군역 참전"(공훈 +20), 나서지 않으면 다음 달 초 군역 면제금 ${formatMoney(warDutyFee(st))}이 나간다.` : ''}`);
    if ((st.shops || []).some(x => x.supply)) L.push(`자가 재료: ${(st.shops || []).filter(x => x.supply).map(x => `${x.name} ← ${x.supply}`).join(', ')} — "우리 농장에서 키운" 재료와 술을 손님들이 알아본다.`);
    L.push(`이달의 정세: ${affs.map(a => `${a.name}(${a.desc})`).join(' · ')} — 사람들의 대화와 물가에 자연스럽게 묻어나게.`);
    if (mk) {
        const qs = TRADE_GOODS.map(g => [g[0], marketPrice(st, mk, g[0]) / g[1]]).sort((a, b) => a[1] - b[1]);
        L.push(`시장(${mk}) 이달 시세: 싸다 — ${qs.slice(0, 3).map(x => x[0]).join(', ')} / 비싸다 — ${qs.slice(-3).reverse().map(x => x[0]).join(', ')}. 교역품 매매는 확장이 계산한다("매입 상품 수량", "매각 상품 수량"). 짐 ${cargoUsed(st)}/${cargoCap(st)}.`);
    } else if (cargoUsed(st)) L.push(`교역품 짐 ${cargoUsed(st)}/${cargoCap(st)} — 시장이 있는 도시·마을에서 팔 수 있다.`);
    if (st.shops?.length) {
        L.push(`가게: ${st.shops.map(s => `${s.name}(${s.market} ${shopTierName(s)} · ${s.kind}${isCraftShop(s.kind) ? ` · 주인의 ${SHOP_KINDS[s.kind][3]} ${LIFE_RANKS[Math.max(0, ownerRank(st, s))]}` : ''} · 평판 ${Math.round(s.rep)} · 점원 ${s.staff} · 재고 ${formatMoney(s.stock)} · 금고 ${formatMoney(s.till)})`).join(' / ')}`);
        if (F.shop) if (st.shops.some(s => isCraftShop(s.kind))) L.push('  손기술 가게(식당·여관·주점·대장간·공방·약방)는 주인이 직접 만들어 판다 — 주인이 그곳에 있으면 장사가 잘되고 기술도 는다. 실력이 오를수록 이문과 평판이 커지고 가게를 키울 수 있다. 여관 주인은 제 여관에서 공짜로 묵는다.');
        for (const fs of st.shops.filter(isFoodShop)) {
            const mi = menuInfo(st, fs), regs = richRegulars(st, fs);
            L.push(`  ${fs.name} — 소문 ${Math.round(fs.fame || 0)} '${fameTier(fs.fame)}' · 자리 ${districtOf(fs)} · 메뉴: ${(fs.menu || []).map(n => `${n}${fs.signature === n ? '★' : ''}${mi.live.some(r => r[0] === n) ? '' : '(철 지남)'}`).join(', ') || '없음'}${regs.length ? ` · 단골: ${regs.join(', ')}` : ''}. 손님들이 이 메뉴를 먹고 이야기한다 — 맛집 소문, 줄 선 손님, 음식 평론, 경쟁 식당의 시샘. 소문이 오르내릴 일이면 "가게소문 이름 +N".`);
        }
        if (F.shop) if (st.shops.some(isFoodShop)) L.push('  식당 규칙: 요리 랭크가 오르면 더 좋은 요리를 메뉴에 올릴 수 있다("메뉴추가 가게 | 요리", "대표메뉴 가게 | 요리"). 메뉴판 칸은 가게 크기만큼(노점 3·점포 6·상회 10). 제철 요리는 철이 지나면 내지 못한다. 소문(명성)은 동네 식당→소문난 집→이름난 맛집→명소→귀족도 찾는 집 — 이름이 나면 부자 단골, 더 나아가 귀족가가 요리사를 찾는다(스카웃). 자리를 옮길 수 있다("가게이전 가게 | 골목·시장통·대로·백은 구역"). 귀족가 연회는 "가문연회 가문 | 잔칫상/궁정 만찬".');
        if (F.shop) L.push('  가게 장사는 확장이 날마다 계산한다(매출·경비·평판). GM은 가게에서 생기는 사건(단골, 도둑, 경쟁 가게, 큰 주문, 세무 관리)을 이야기로 그리고, 평판이 오르내릴 일이면 "가게평판 이름 +N".');
    }
    if (!F.bank) L.push(`길드 예금: ${formatMoney(st.bank || 0)}`); else L.push(`길드 예금: ${formatMoney(st.bank || 0)} (소지금과 별개 — 길드 지점이 있는 도시에서 "예금 금액"/"인출 금액", 인출 수수료 1%). 큰돈을 들고 험한 곳을 다니면 소매치기·강도의 표적이 될 수 있다.`);
    for (const org of ['adventurer', 'merchant']) { const sk = strikesOf(st, org); if (sk.length) L.push(`${ORGS[org].name} 경고: ${sk.length}회 (${sk.map(x => x.why).join(', ')})${isSuspended(st, org) ? (org === 'merchant' ? ' — 영업 정지 중' : ' — 자격 정지 중: 길드 의뢰를 받을 수 없다') : ''}`); }
    if (st.orgs.merchant) {
        const mr2 = st.orgs.merchant.rank;
        L.push(`상인 길드 ${ORGS.merchant.ranks[mr2]}의 혜택: ${merchantPerksNow(mr2).join(' · ')}${isSuspended(st, 'merchant') ? ' (영업 정지 중이라 지금은 막혀 있음)' : ''}`);
        if (F.trade) if (mr2 >= 2 || st.patron) L.push(`  이달 상인을 찾는 귀족가(제도에서): ${nobleOffers(st).filter(o => mr2 >= o.need || o.mine).map(o => `${o.house}(${o.region}·${o.faction}·${o.trait}) — ${o.good} ${o.qty}짐을 짐당 ${formatMoney(o.unit)}에 구함${o.delivered ? '(이달 납품 끝)' : ''}`).join(' / ')}. 거래는 확장이 처리("귀족납품 가문", "귀족구입 가문"). 귀족과의 만남·연회·청탁은 GM이 그린다.`);
        if (mr2 >= 4) L.push(`  다음 달 정세 귀띔: ${affairsOf(st.day + 30 - (formatDate(st.day).d - 1)).map(a => a.name).join(' · ')}`);
    }
    if (st.patron) {
        const h = patronHouse(st), P = PATRON_ROLES[st.patron.role];
        L.push(`후원 가문: ${st.patron.house}의 ${P.ranks[st.patron.rank]}(${st.patron.role}) · 가문 호감 ${st.houseFavor[st.patron.house] || 0}/100 · ${h.faction}${h.rival ? ` — 정적 ${h.rival}와는 거래 불가, 그쪽 사람들(그라운 상회 등)의 견제를 받는다` : ''}. ${P.desc} 가문은 다달이 주문을 채우길 기대한다. 가문의 일(호위 상단, 비밀 거래, 연회 준비, 정적의 방해)을 이야기로 그리고, 호감이 오르내리면 "가문호감 가문 +N".`);
    }
    const pres = presentHouses(st);
    if (!F.noble) L.push(`사교 시즌: ${seasonStatus(st.day).text}.`); else L.push(`사교 시즌: ${seasonStatus(st.day).text}. 지금 제도에 머무는 귀족가 ${pres.length}곳 — ${pres.slice(0, 9).map(h => `${h.name}(${h.trait})`).join(', ')}${pres.length > 9 ? ' 외' : ''}. 가문마다 부와 영향력·가업에 따라 상주하거나, 시즌 내내 머물거나, 한창때나 축제 때만 잠깐 올라온다.`);
    if (F.noble) L.push(`귀족 등장 규칙: 제국에는 공작가부터 남작가까지 가문이 많다(로어북 '귀족 명부'). 귀족을 등장시킬 때 특정 가문만 되풀이하지 말고 명부의 여러 가문을 돌아가며 쓰고, 필요하면 명부에 없는 작은 기사 가문이나 지방 영주를 새로 만들어도 된다.`);
    const so = scoutOffers(st);
    if (so.length) L.push(`이달 스카웃 제의: ${so.map(o => `${o.house}(${o.roles.join('·')}, ${o.faction})`).join(' / ')} — 가문의 사람이 찾아오거나 편지를 보내는 장면으로 제의를 전한다. 플레이어가 받아들이면 "스카웃수락 가문 | 상단원" 또는 "스카웃수락 가문 | 전속 상인".`);
    if (Object.keys(st.houseFavor || {}).length) L.push(`귀족가 호감: ${Object.entries(st.houseFavor).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    if (st.credit > 0) L.push(`길드 외상: ${formatMoney(st.credit)} — 다음 달 1일에 자동으로 갚는다(못 갚으면 연체료와 경고).`);
    if (F.trade) if (st.orgs.merchant) L.push(`상인 길드: 거래마다 수수료는 없지만 매달 1일 회비 ${formatMoney(MERCHANT_DUES[st.orgs.merchant.rank] || 50)}(확장이 처리). 저울 속이기·매점매석·담합 금지, 계약은 길드 장부에. 위반하면 "경고 +1 | 사유 | 상인".`);
    L.push(`소속: ${orgLines.length ? '\n' + orgLines.join('\n') : '없음'}`);
    L.push(`소지금: ${formatMoney(st.money)}`);
    if (eq) L.push(`장비: ${eq}`);
    L.push(`소지품: ${items || '없음'}`);
    if (st.skills.length) L.push(`스킬: ${st.skills.map(s => s.name).join(', ')}`);
    if (st.titles.length) L.push(`칭호: ${st.titles.join(', ')}`);
    if (st.conds.length) L.push(`상태 이상: ${st.conds.join(', ')}`);
    if (st.assets.length) L.push(`자산: ${st.assets.join(', ')}`);
    if (st.quests.length) {
        L.push('진행 중 의뢰:');
        for (const q of st.quests) {
            let line = `- ${q.rank ? `[${q.rank}] ` : ''}${q.name}`;
            if (q.place) line += ` — ${q.place}`;
            if (q.desc) line += ` — ${q.desc}`;
            if (q.reward) line += ` / 보수 ${q.reward}`;
            if (q.due !== undefined) { const left = q.due - st.day; const dd = formatDate(q.due); line += left >= 0 ? ` / 기한 ${dd.m}월 ${dd.d}일(${left}일 남음)` : ` / ⚠ 기한 ${-left}일 초과 — 의뢰주가 불만, 실패 처리 가능`; }
            if (q.merit || q.exp) line += `\n  → 완료하면 <변동>: 의뢰완료 ${q.name} / 돈 +${q.reward}${q.merit && q.org ? ` / 공적 ${ORGS[q.org].name.replace(/\s/g, '')} +${q.merit}` : ''}${q.exp ? ` / 경험 +${q.exp}` : ''}`;
            L.push(line);
        }
    }
    L.push(`완료한 의뢰: ${st.questsDone}건`);
    if (rel) L.push(`인맥(호감): ${rel}`);
    { const nt = notesForPrompt(st); if (nt.length) L.push(`인물 노트 (이 사람들은 이렇게 기억된다 — 설정을 바꾸지 말 것):\n${nt.map(x => `- ${x}`).join('\n')}`); }
    L.push('인물 노트 규칙: 이름 있는 NPC가 처음 나오거나 신분·사는 곳·관계가 바뀌면 <변동>에 "인물 이름 | 신분·사는 곳·{{user}}와의 사연(한 줄)". 연대기에 남길 큰 이야기(전투, 사건, 약속)는 "연대기 내용".');
    if (F.combat && st.classes?.치유사) L.push('소생의 기도: 숨이 끊긴 지 하루 안에, 몸이 온전할 때만 되살릴 수 있다. 시전자는 마력을 모두 쏟고, 성물이 없으면 자신의 생명을 나눈다(체력 영구 -1). 주교 이상만 교회의 허락을 받는 기적이라, 몰래 쓰면 성교회가 이단 심문을 하러 올 수 있다 — <변동> "소생 이름 | 경과 시간".');
    if (F.combat) L.push('유적과 금서: 미궁에서 새 층을 밟거나 수호자를 쓰러뜨리면 확장이 가끔 발견물을 정해 알려 준다(그 장면에 자연스럽게 그린다). 미궁 밖의 폐허·고대 유적을 뒤질 때도 낮은 확률로 <변동>에 "발견" 또는 "발견 장비/보물/금서"를 적으면 확장이 내용을 정한다. 발견물은 직업을 가리지 않는다 — 다른 직업의 장비는 팔거나 동료·지인에게 선물하거나, 그 직업을 보조 클래스로 배워야 제대로 쓴다.');
    if (F.combat) if (st.cls) L.push('전투 기록 규칙: 마물을 쓰러뜨리면 <변동>에 "처치 고블린 3"(도감에 쌓인다). 격한 싸움·산성·저주로 장비가 상하면 "장비손상 무기 | 5~20". 미궁에선 층을 옮길 때 "던전 아르카 +1", 10층마다 수호자를 쓰러뜨리면 "수호자 아르카 10", 나오면 "던전귀환 아르카". 강화(+1~+10)와 수리는 플레이어가 확장 화면에서 한다. 장비의 강화 수치는 위력·방어에 그대로 드러나게 그린다.');
    { const cx = Object.entries(st.codex || {}).sort((a, b) => b[1].kills - a[1].kills).slice(0, 10); if (cx.length) L.push(`마물 도감: ${cx.map(([n, c]) => { const M = findMonster(n); const lv = codexLevel(c.kills); return `${n} ${c.kills}마리${M && lv >= 2 ? `(약점: ${M[3]})` : ''}${lv >= 4 ? '·숙달' : ''}`; }).join(', ')} — 잘 아는 마물일수록 {{user}}는 노련하게 상대한다.`); }
    for (const [dn, d] of Object.entries(st.dungeons || {})) { const b = dungeonBand(dn, d.cur || 1); const z = d.cur ? dungeonZone(dn, d.cur) : null; L.push(`${dn}: ${d.cur ? `지금 ${d.cur}층(${b?.[1] || ''} — ${b?.[2] || ''})${z ? ` · 구역「${z[2]}」: ${z[3]} 나오는 것: ${z[4]}${z[5] && d.cur % 10 === 0 ? ` · 이 층의 수호자: ${z[5]}` : ''}` : ''}` : '지상'} · 최고 ${d.best}층${d.guard?.length ? ` · 전이진 ${d.guard.sort((a, b) => a - b).join('·')}층` : ''}`); }
    { const ch = chronicleText(st); if (ch) L.push(`연대기 (지금까지의 큰 일): ${ch}`); }
    const bondNames = Object.keys(st.bonds || {});
    if (bondNames.length) L.push(`연애 관계: ${bondNames.map(n => `${n} — ${st.bonds[n].stage} (호감 ${st.rel[n] || 0})`).join(' / ')}`);
    const RN = ROMANCE_NEED[st.difficulty] || ROMANCE_NEED.normal;
    if (F.romance) L.push(`연애·혼인 규칙: 동료든 NPC든 누구와도 관계를 쌓을 수 있다. 단계는 설렘(호감 ${RN.설렘}+) → 연인(${RN.연인}+) → 약혼(${RN.약혼}+) → 혼인. 호감만으로 자동으로 오르지 않으며, 고백·데이트·위기·청혼 같은 장면을 거쳐 상대가 받아들였을 때만 <변동>에 '관계 이름 연인'처럼 적는다. 상대에게도 마음과 사정(신분·가문·다른 연인)이 있어 거절할 수 있다. 혼인은 약혼 뒤 혼례 장면에서 '결혼 이름 | 상대의 신분'. 배우자는 한 명.`);
    if (st.party?.length) {
        L.push('동료(함께 다니는 파티원):');
        for (const m of st.party) L.push(`- ${m.name}${m.role ? ` · ${m.role}` : ''}${m.rank ? ` · ${m.rank}` : ''} · HP ${m.hp}/${m.maxhp}${m.wage ? ` · 일당 ${formatMoney(m.wage)}` : ''} · 호감 ${st.rel[m.name] || 0}${m.conds?.length ? ` · 상태: ${m.conds.join(', ')}` : ''}`);
    }
    if (st.spouse) L.push(`배우자: ${st.spouse.name}${st.spouse.title ? ` (${st.spouse.title})` : ''} — 함께 사는 가족. 일상과 결정에 자연스럽게 등장한다.`);
    if (st.spouse?.role) L.push(`배우자 ${josa(st.spouse.name, '이', '가')} ${josa(st.spouse.role, '을', '를')} 맡아 꾸린다 — 그곳 장면에 자주 등장한다.`);
    { const mo = matchOffers(st).filter(o => !o.done); if (mo.length) L.push(`이달 들어온 혼담 (집안의 격: ${MATCH_TIERS[matchTier(familyStanding(st))][1]} 급): ${mo.map(o => `${o.forName === '본인' ? '{{user}}' : o.forName}에게 — ${o.person}(${o.family}, ${o.age}살, ${o.desc})`).join(' / ')}. 중매쟁이·편지·집안 어른의 방문 같은 장면으로 전한다. 받아들일지는 플레이어가 확장 화면에서 정한다.`); }
    if ((st.children || []).length || st.expecting) L.push(`자녀: ${(st.children || []).map(c => `${c.unnamed ? '이름 없는 아기' : c.name}(${c.sex === '남' ? '아들' : '딸'} · ${childAge(c, st.day)}살 ${childStage(c, st.day)}${c.heir ? ' · 후계자' : ''}${c.role ? ` · ${josa(c.role, '을', '를')} 맡음` : ''}${c.spouse ? ` · ${c.spouse.name}(${c.spouse.from})와 혼인` : ''})`).join(', ') || '없음'}${st.expecting ? ` · 아이를 기다리는 중(${formatDate(st.expecting.due).m}월 무렵)` : ''}. 아이들은 자라며 저마다 성격과 재능이 드러난다. 임신은 "임신 상대", 출산은 확장이 처리(이름은 플레이어가 짓는다). 다른 아이를 들이면 "자녀 +이름 | 성별 | 나이". 열세 살부터 가업을 거들고("가업맡기기 이름 | 가게·농장"), 열여섯에 어른이 되면 대를 이을 수 있다("세대교체 이름" — 주인공이 자녀로 바뀌고 땅·가게·재산·가문·세습 작위가 이어진다).`);
    if ((st.generations || []).length) L.push(`앞선 세대: ${st.generations.map(g => `${g.name}(${g.title})`).join(' → ')} — 집안 사람들과 늙은 고용인들이 앞선 세대를 기억한다.`);
    const lc = dailyCost(st);
    L.push(`생활: ${lc.mode} — 하루 ${formatMoney(lc.total)}${lc.wages ? `(동료 일당 ${formatMoney(lc.wages)} 포함)` : ''}${lc.feed ? `(마수 먹이 ${formatMoney(lc.feed)} 포함)` : ''}. 날짜가 넘어가면 확장이 자동 차감·휴식 회복 처리하므로 여관비·식비를 <변동>에 적지 말 것.`);
    L.push(`위치: ${st.location} · ${date.text} ${todOf(st)} · 모험 ${st.day + 1}일째`);
    { const rm = rumorsOf(st); if (rm) L.push(`{{user}}에 관한 소문 (${rm.reach} 돈다): ${rm.items.join(' / ')} — 명성이 닿는 곳의 사람들이 가끔 알아보거나 이 이야기를 꺼낸다(부풀리거나 잘못 전하기도 한다). 매번 꺼내지는 말 것.`); }
    {   const here = peopleHere(st), kw = knownWhere(st).filter(k => !k.here).slice(0, 8);
        { const fromP = WORLD_PLACES.find(p => p[2].test(st.location)); const near = WORLD_PLACES.filter(p => p !== fromP).map(p => [p, travelQuote(st, p[0], '마차')]).filter(([, q]) => !q.error).sort((a, b) => a[1].days - b[1].days).slice(0, 7);
          if (F.travel) L.push(`먼 길: "여행 목적지 | 마차/말/걸어서/짐배" 한 줄이면 확장이 일수·삯·도착 위치를 처리한다(이때 날짜와 위치를 따로 적지 않는다). 길 위의 일(만남·습격·날씨)은 그 메시지 본문에 그린다. 여기서 마차로: ${near.map(([p, q]) => `${p[0]} ${travelLabel(q).split(' · ')[0]}`).join(', ')}.`); }
        L.push(`시간대: ${todOf(st)} (아침→낮→저녁→밤). 장면의 시간대가 바뀌면 "시간대 저녁"처럼 적는다 — 날짜가 넘어가면 확장이 아침으로 돌린다. 사람들은 시간대마다 있는 자리가 다르다.`);
        { const looks = npcsInScene(st, opt.ctx).slice(0, 5).map(d => npcNow(st, d.n) || d); if (looks.length) L.push(`고정 외모 (얼굴·머리색·눈색·체격은 이대로 두고 바꾸지 말 것 — 옷차림과 장비는 근황에 따라 나아질 수 있다): ${looks.map(d => `${d.n} — ${d.who}, ${d.look}`).join(' / ')}`); if (looks.length) { const grow = looks.filter(d => NPC_ARCS[d.n] || d.note); if (grow.length) L.push(`지금의 근황 (로어북의 옛 설명보다 이것이 우선 — 사람들도 시간이 흐르면 승급하고 자리를 옮기고 나이를 먹는다): ${grow.map(d => `${d.n} — ${d.role}${d.note ? ` (${d.note})` : ''}`).join(' / ')}`); const ch = looks.map(d => npcChangeLine(st, d)).filter(Boolean); if (ch.length) L.push(`오랜만에 다시 보는 사람: ${ch.join(' / ')} — 첫마디나 겉모습·장비·말투에서 흐른 시간이 드러나게. 이 밖에 이야기 속에서 생긴 큰 변화(승급·이직·결혼 등)는 "근황 이름 | 내용"으로 적는다.`); } }
        if (here.length) L.push(`지금 이곳에 있을 사람: ${here.map(h => `${h.name}(${h.spot}${h.role ? ` · ${h.role}` : ''})`).join(', ')} — 장면에 자연스럽게 마주칠 수 있다.`);
        if (kw.length) L.push(`아는 사람들의 지금 자리: ${kw.map(k => `${k.name} — ${k.loc.replace('제도 루미에른 · ', '')} ${k.spot}${k.rest ? '(쉬는 날)' : ''}`).join(' / ')}. 찾아가면 거기서 만난다. 새로 등장한 중요한 인물에게 하루 일정을 정해 주려면 "인물일정 이름 | 아침 자리 | 낮 자리 | 저녁 자리 | 밤 자리".`);
    }
    const today = eventsOn(st.day);
    if (today.length) L.push(`오늘의 행사: ${today.map(e => `${e.name}(${e.desc})`).join(' / ')} — 장면의 배경과 분위기에 반영할 것.`);
    const soon = upcomingEvents(st.day, 10);
    if (soon.length) L.push(`다가오는 행사: ${soon.slice(0, 4).map(u => `${u.ev.name} ${u.inDays}일 후`).join(', ')} — 소문·포스터·사람들의 대화로 가끔 언급.`);
    if (st.hp === 0) L.push(`※ {{user}}의 HP가 0이다 — ${st.difficulty === 'easy' ? '기절 상태. 구조/깨어나는 장면으로 이어갈 것.' : st.difficulty === 'hard' ? '빈사 상태. 즉시 도움이 없으면 사망할 수 있다.' : '빈사 상태. 위험하다.'}`);

    { const ps = pendingSent(st); if (ps.length) L.push(`{{user}}가 보낸 편지 (아직 답 없음): ${ps.map(x => `${x.to}에게 ${st.day - x.day ? `${st.day - x.day}일 전` : '오늘'} — "${x.body.replace(/\s+/g, ' ').slice(0, 70)}${x.body.length > 70 ? '…' : ''}"`).join(' / ')}. 편지가 닿고 읽힐 만큼 날이 지나면(같은 도시 하루~이틀, 먼 곳은 여행 일수만큼) 받는 이가 성격대로 반응한다 — <편지 받는이>로 답장하거나, 직접 찾아오거나, 답하지 않을 수도 있다.`); }
    if (F.animal) L.push(`동물: 열흘에 한 번쯤, 장면이 허락하면 길에서 곤경에 처한 동물(길 잃은 강아지, 다친 고양이, 버려진 망아지, 덫에 걸린 새)을 마주치게 해도 좋다. {{user}}가 도와서 데려오기로 하면 <변동>에 "구조 이름 | 종", 시장에서 분양받으면 "입양 이름 | 종 | | 분양". 이름은 {{user}}가 지은 것을 쓴다.${st.classes?.테이머 ? '' : ' 테이머가 아니면 마수는 곁에 둘 수 없다(순한·사나운 짐승만).'}`);
    if (opt.prologue) {
        L.push('');
        L.push('■ 지금은 모험의 첫 장면(프롤로그)이다. 플레이어가 이 세계에 처음 발을 딛는 순간이니, 이 한 편으로 세계와 {{user}}가 단번에 손에 잡히게 써라.');
        for (const l of prologueLines(st)) L.push(l);
        L.push('- 쓰는 법: 4~6문단. 첫 문장은 설명이 아니라 감각(소리·냄새·빛·온도)으로 연다. 출신은 말로 설명하지 말고 손·옷·소지품·말투·남들의 시선으로 보여 준다.');
        L.push('- 이름과 말버릇이 있는 인물을 1~2명 등장시키고, 그중 한 명은 앞으로도 다시 만날 사람으로 남긴다. 프로필의 외모·성격·목표를 한두 번 자연스럽게 비춘다.');
        L.push('- 오늘 터지는 일 하나(계기)를 장면 안에 둔다 — 첫 목표로 곧장 이어지게. 사건을 미리 해결하거나 {{user}}의 결정을 대신 내리지 말고, 결정 직전에서 멈춘다.');
        L.push('- 끝에 <선택지> 4개: ① 첫 직업의 첫걸음 ② 출신과 얽힌 일 ③ 방금 만난 인물과의 대화 ④ 대담하거나 엉뚱한 선택. 각 선택지는 한 줄, {{user}}가 할 행동으로.');
        { const a = st.profile.appearance || {}; const raw = [['체격', a.height], ['머리', a.hair], ['눈', a.eyes], ['인상', a.impression], ['특징', a.marks], ['차림', a.outfit], ['기타', a.free]].filter(([, v]) => v);
          if (raw.length) L.push(`- 수첩 정리: 플레이어가 적은 외모를 수첩 칸에 어울리게 다듬어 <변동>에 한 줄씩 적는다 — "외모 칸 | 내용". 칸은 체격·머리·눈·인상·특징·차림. 내용은 12~20자 안팎의 명사구(예: "허리까지 오는 은빛 생머리", "순하게 처진 맑은 벽안"), 뜻은 바꾸지 말고 말투만 정돈하며, 빈 칸은 장면에서 드러난 것만 채운다. 지금 적힌 것: ${raw.map(([k, v]) => `${k}=${v}`).join(' / ')}`); }
        L.push('- 돈·소지품·관계는 확장이 이미 넣었다. <변동>에는 위치가 바뀔 때만 "위치"를 적는다. 해설·튜토리얼 문장은 쓰지 말 것(사용법 안내는 확장이 화면에 띄운다).');
    }
    if (opt.notes?.length) {
        L.push('');
        L.push('■ 지난 응답 이후 플레이어가 확장 화면에서 한 일 (수치는 이미 반영됨 — <변동>에 다시 적지 말 것):');
        for (const n of opt.notes) L.push(`- ${n}`);
        L.push('- 이 일들을 장면에 자연스럽게 녹여 서술한다(상점 주인과의 짧은 대화, 의뢰서를 접수대에 내미는 장면 등).');
    }
    if (opt.roll) {
        const r = opt.roll;
        L.push('');
        L.push(`■ [판정 결과] ${r.stat} 판정 — ${r.what ? r.what + ' — ' : ''}${describeRoll(r)} → 【${r.tier}】`);
        L.push('- 이 결과를 그대로 반영해 직전 장면을 이어서 서술하라. 결과를 바꾸거나 다시 판정을 요청하지 말 것.');
        if (r.tier === '부분 성공') L.push('- 부분 성공: 목적은 이루지만 대가(부상·손실·소문·시간)가 따른다.');
    }
    L.push('');
    L.push(...featureRules(st, mk, F));
    if (F.skipped.length) L.push(`(이번엔 생략한 규칙: ${F.skipped.join('·')} — 플레이어가 그쪽으로 움직이면 다음 응답부터 다시 붙는다)`);
    L.push('■ 응답 끝 형식 (필요할 때만): <판정>능력치 | 난이도 | 시도</판정> → <선택지>…</선택지> → <변동>…</변동>');
    return L.join('\n');
}

/* ───────────────────────── 장소 판별 ───────────────────────── */

const WILD_WORDS = ['흑림', '숲', '미궁', '던전', '층', '황혼', '산맥', '봉우리', '들판', '평원', '가도', '길 위', '야영', '동굴', '광산', '유적', '변경', '바다', '해상'];
const TOWN_WORDS = ['마을', '바르그홀름', '세렌포트', '제도', '루미에른', '여관', '시장', '거리', '대로', '골목', '구역'];

/** 'city' | 'village' | 'wild' */
export function placeKind(loc) {
    const l = String(loc || '');
    if (/제도|루미에른|세렌포트|바르그홀름/.test(l)) return 'city';
    if (/마을/.test(l)) return 'village';
    if (/성채|성읍|요새 도시|그레이븐/.test(l)) return 'city';
    if (WILD_WORDS.some(w => l.includes(w))) return 'wild';
    if (TOWN_WORDS.some(w => l.includes(w))) return 'city';
    return 'city';
}

/* ───────────────────────── 생활비 ───────────────────────── */

// rec: 하룻밤 HP·MP 회복 비율 · en: 하룻밤 기력 회복 비율 · nap: 낮잠 [기력, HP·MP] · rest: 다음 날 최대 기력 보정(푹 쉼)
export const LIVING = {
    노숙: { cost: 0, rec: 0.05, en: 0.7, nap: [0.1, 0.05], rest: -10, desc: '길바닥이나 남의 헛간. 돈은 안 들지만 거의 쉬지 못한다.' },
    싸구려: { cost: 40, rec: 0.25, en: 1, nap: [0.25, 0.1], rest: 0, desc: '싼 여관 대부실과 소박한 두 끼 (하루 40동)' },
    보통: { cost: 120, rec: 0.4, en: 1, nap: [0.4, 0.2], rest: 10, desc: '중급 여관 개인실과 괜찮은 식사 (하루 1은 20동)' },
    고급: { cost: 500, rec: 0.6, en: 1, nap: [1, 0.5], rest: 20, desc: '고급 여관과 좋은 음식. 사람들의 시선이 달라진다 (하루 5은) · 낮잠만으로 기력이 가득' },
    자택: { cost: 25, rec: 0.5, en: 1, nap: [0.6, 0.3], rest: 15, desc: '자기 집에서 지낸다. 식비만 든다 (집이 있어야 함, 하루 25동)' },
    야영: { cost: 0, rec: 0.15, en: 0.9, nap: [0.15, 0.05], rest: 0, desc: '바깥에서 모닥불을 피우고 휴대 식량을 먹는다 (하루 1개 소모)' },
};
/* ───────── 기력 (피로) ───────── 0이 되면 쓰러진다 */
export const maxEN = (st) => 80 + Math.round((st.stats?.체력 || 15) * 1.3) + (st.enBonus || 0);
export const energyOf = (st) => st.energy ?? maxEN(st);
export const TOD_DRAIN = 8; // 시간대 한 칸마다
export function faintFee(st, clinic) {
    const base = Math.max(100, Math.min(20000, Math.round(st.money * 0.1)));
    const mult = (clinic ? 1.5 : 1) * (st.difficulty === 'easy' ? 0.5 : st.difficulty === 'hard' ? 1.3 : 1);
    return Math.round(base * mult);
}
function faint(st, log) {
    const l1 = (st.location || '').split(' · ')[0];
    const wild = placeKind(st.location) === 'wild';
    const home = hasHome(st) && !wild;
    const clinic = !home && st.hp <= maxHP(st) * 0.3;
    let lost = '', where;
    if (home) where = `${l1} · 자택`;
    else if (wild) where = st.location;
    else where = `${l1} · ${clinic ? '신전 치료소' : '여관'}`;
    if (!home) {
        const fee = faintFee(st, clinic);
        if (st.money >= fee) { st.money -= fee; lost = `${clinic ? '치료비와 ' : ''}수고비로 ${formatMoney(fee)}`; }
        else {
            const had = st.money; st.money = 0;
            const eq = new Set(Object.values(st.equip || {}));
            const i = (st.items || []).findIndex(it => !eq.has(it.name) && !/휴대 식량/.test(it.name));
            let item = '';
            if (i >= 0) { item = st.items[i].name; st.items[i].qty -= 1; if (st.items[i].qty <= 0) st.items.splice(i, 1); }
            lost = [had ? `가진 돈 ${formatMoney(had)} 전부` : '', item ? `「${item}」` : ''].filter(Boolean).join('와 ') || '아무것도 (가진 게 없었다)';
        }
    }
    // 다음 날 아침에 깨어난다
    log.push(...applyOps(st, parseOpLines(['날짜 +1일']))); st.tod = 0;
    st.location = where;
    st.energy = Math.round(maxEN(st) * (home ? 0.8 : 0.5));
    st.hp = Math.max(st.hp, Math.ceil(maxHP(st) * 0.3));
    st.lastFaint = { day: st.day, where, lost, home };
    log.push({ k: 'warn', t: `기력이 다해 쓰러졌다 — ${where}에서 깨어남${lost ? ` · 잃은 것: ${lost}` : ''}` });
    addChron(st, home ? '기력이 다해 쓰러졌다가 집에서 눈을 떴다' : `기력이 다해 쓰러졌다 — ${where}에서 깨어남`);
}
export function checkFaint(st, log) { if (st.energy !== undefined && st.energy <= 0 && !st.__fainting) { st.__fainting = true; try { faint(st, log); } finally { delete st.__fainting; } } }

const LIVING_MULT = { easy: 0.5, normal: 1, hard: 1.3 };

export const hasHome = (st) => (st.assets || []).some(a => /집|저택|주택|셋방|방\b|하숙/.test(a));

/** 하루치 생활 방식 판정 */
export function livingMode(st) {
    if (placeKind(st.location) === 'wild') return '야영';
    let m = st.living || '싸구려';
    if (m === '자택' && !hasHome(st)) m = '싸구려';
    return m;
}

export function dailyCost(st) {
    const mult = LIVING_MULT[st.difficulty] ?? 1;
    const mode = livingMode(st);
    const self = innHere(st) || st.patron?.role === '전속 요리사' ? 0 : Math.round((LIVING[mode]?.cost || 0) * mult);
    const wages = (st.party || []).reduce((a, m) => a + (m.wage || 0), 0);
    const feed = Math.round((st.companions || []).reduce((a, c) => a + (c.away ? 0 : c.pet ? PET_UPKEEP : COMPANION_KINDS[c.kind]?.upkeep || 0), 0) * mult);
    return { mode, self, wages, feed, total: self + wages + feed };
}

function payLiving(st, days, log) {
    let paid = 0, unpaidDays = 0, ateRations = 0, hungry = 0, rent = 0;
    const brokeLinks = [];
    const startHp = st.hp, startMp = st.mp;
    const shopAcc = {};
    for (let d = 0; d < days; d++) {
        if (st.shops?.length) runShops(st, st.day - days + d + 1, shopAcc);
        const c = dailyCost(st);
        let ok = true;
        if (c.mode === '야영') {
            const i = st.items.findIndex(it => /휴대 식량|말린 고기|건빵|식량/.test(it.name));
            if (i >= 0) { st.items[i].qty -= 1; ateRations++; if (st.items[i].qty <= 0) st.items.splice(i, 1); }
            else { hungry++; ok = false; }
        }
        if (c.total > 0) {
            if (st.money >= c.total) { st.money -= c.total; paid += c.total; }
            else {
                // 가진 만큼 내고, 동료 일당이 밀리면 호감이 떨어진다
                paid += st.money; st.money = 0; unpaidDays++;
                if (c.mode !== '야영' && c.self > 0) ok = false;
                for (const m of st.party || []) if (m.wage) st.rel[m.name] = Math.max(-100, (st.rel[m.name] || 0) - 5);
            }
        }
        const recRate = ok ? LIVING[c.mode].rec : 0.02;
        st.enBonus = ok ? (LIVING[c.mode].rest || 0) : -10;
        st.energy = Math.min(maxEN(st), energyOf(st) + Math.ceil(maxEN(st) * (ok ? LIVING[c.mode].en : 0.5)));
        st.hp = Math.min(maxHP(st), st.hp + Math.ceil(maxHP(st) * recRate));
        st.mp = Math.min(maxMP(st), st.mp + Math.ceil(maxMP(st) * (recRate + 0.1)));
        for (const m of st.party || []) m.hp = Math.min(m.maxhp, m.hp + Math.ceil(m.maxhp * Math.max(recRate, 0.1)));
        for (const c of st.companions || []) {
            c.hp = Math.min(c.maxhp, c.hp + Math.ceil(c.maxhp * 0.3)); c.out = false;
            if (c.kind !== '마수' || c.bond <= 0) continue;
            if (c.away) {
                // 떨어져 있으면 유대가 서서히 옅어진다 (100 → 0 까지 약 180일)
                c.away.acc = (c.away.acc || 0) + 100 / 180;
                while (c.away.acc >= 1 && c.bond > 0) { c.bond--; c.away.acc--; }
                if (c.away.fee) { st.money += c.away.fee; rent += c.away.fee; }
                if (c.bond <= 0) brokeLinks.push(c.name);
            } else if (!c.tamed) {
                // 길들인 게 아니라 함께 사는 동물 — 함께한 시간과 성격만큼 가까워진다 (기본 이틀에 1)
                c.acc = (c.acc || 0) + 0.5 * traitRate(c);
                while (c.acc >= 1 && c.bond < 100) { c.bond++; c.acc--; }
            } else {
                // 곁에 있어도 돌보지 않으면 조금씩 멀어진다 (닷새에 1)
                c.idle = (c.idle || 0) + 1;
                if (c.idle >= 5) { c.idle = 0; c.bond = Math.max(1, c.bond - 1); }
            }
        }
    }
    const mode = livingMode(st);
    if (paid) log.push({ k: 'loss', t: `생활비 -${formatMoney(paid)} (${mode})` });
    if (rent) log.push({ k: 'gain', t: `탈것 대여료 +${formatMoney(rent)}` });
    for (const [n, a] of Object.entries(shopAcc)) {
        const sh = findShop(st, n);
        log.push({ k: a.sales - a.cost >= 0 ? 'gain' : 'loss', t: `${n} — 매출 ${formatMoney(a.sales)} · 경비 ${formatMoney(a.cost)} (금고 ${formatMoney(sh?.till ?? 0)})` });
        if (a.restock) log.push({ k: 'info', t: `${n} — 점원이 재고를 채웠다 ${formatMoney(a.restock)}어치 (자동 보충)` });
        if (a.empty) log.push({ k: 'warn', t: `${n} — 재고가 바닥나 ${a.empty}일 문을 닫았다 (평판 하락)` });
        if ((sh?.debtDays || 0) >= 7) log.push({ k: 'warn', t: `${n} — 금고가 바닥나 점원들이 급료를 못 받고 있다` });
        for (const fn of a.fame || []) log.push({ k: 'rank', t: `${n} — 소문이 퍼졌다: 이제 '${fn}'` });
        if (a.train && a.skill) trainLife(st, a.skill, a.train, log);
    }
    for (const n of brokeLinks) log.push({ k: 'warn', t: `${n} — 교감이 끊겨 야생으로 돌아감` });
    if (ateRations) log.push({ k: 'loss', t: `휴대 식량 ×${ateRations} 소모` });
    if (st.hp > startHp || st.mp > startMp) log.push({ k: 'gain', t: `휴식 HP +${st.hp - startHp} · MP +${st.mp - startMp}` });
    const noHunger = st.difficulty === 'easy';
    if ((hungry || unpaidDays) && !noHunger) {
        if (hungry && !st.conds.includes('굶주림')) st.conds.push('굶주림');
        if (unpaidDays && mode !== '야영' && !st.conds.includes('빈털터리')) st.conds.push('빈털터리');
        log.push({ k: 'warn', t: hungry ? '먹을 것이 없음 — 굶주림' : '생활비 부족 — 빈털터리' });
    } else if (hungry || unpaidDays) {
        log.push({ k: 'warn', t: '돈·식량이 바닥남' });
    } else {
        st.conds = st.conds.filter(c => c !== '굶주림' && c !== '빈털터리');
    }
    if (unpaidDays && (st.party || []).some(m => m.wage)) log.push({ k: 'warn', t: '동료 일당 밀림 — 호감 하락' });
}

/* ───────────────────────── 상점 ───────────────────────── */

// [이름, 가격(동), 분류, 장착 칸, 설명]
export const SHOPS = {
    잡화점: { desc: '여행과 모험에 필요한 잡동사니', where: ['city', 'village'], items: [
        ['휴대 식량', 15, '식량', null, '말린 빵과 고기. 야영 하루치'],
        ['손수레', 2500, '도구', null, '교역품을 25짐까지 나른다'],
        ['짐마차', 40000, '도구', null, '교역품을 80짐까지. 말 한 필이 끈다(말은 따로)'],
        ['횃불', 5, '도구', null, '한 시간쯤 탄다'],
        ['밧줄(15m)', 30, '도구', null, '삼베 밧줄'],
        ['물통', 20, '도구', null, '가죽 물통'],
        ['부싯돌', 10, '도구', null, ''],
        ['침낭', 80, '도구', null, '야영 때 덜 춥다'],
        ['여행 배낭', 100, '도구', null, '짐을 넉넉히 넣는다'],
        ['랜턴', 100, '도구', null, '기름 랜턴'],
        ['랜턴 기름', 10, '도구', null, '하룻밤치'],
        ['천막', 300, '도구', null, '두 사람이 잘 수 있다'],
        ['숫돌', 30, '도구', null, '칼날 손질용'],
        ['제도 근교 지도', 50, '도구', null, '흑림 가장자리까지 그려져 있다'],
        ['양피지와 잉크', 25, '도구', null, '편지·기록용'],
    ] },
    무기점: { desc: '대장장이 공방에 딸린 무기 가게', where: ['city'], items: [
        ['단검', 50, '무기', 'weapon', '가볍고 숨기기 쉽다'],
        ['숏소드', 300, '무기', 'weapon', '신입 모험가의 표준'],
        ['메이스', 500, '무기', 'weapon', '갑옷 위로도 충격을 준다'],
        ['창', 400, '무기', 'weapon', '거리를 둘 수 있다'],
        ['전투 도끼', 600, '무기', 'weapon', '묵직하다'],
        ['숏보우', 500, '무기', 'weapon', '사냥꾼의 활'],
        ['화살(20발)', 40, '탄약', null, ''],
        ['강철 장검', 800, '무기', 'weapon', '숙련자의 검'],
        ['바스타드 소드', 1500, '무기', 'weapon', '한 손으로도 두 손으로도'],
        ['견습 지팡이', 200, '무기', 'weapon', '마력을 모으는 기초 지팡이'],
        ['떡갈나무 지팡이', 600, '무기', 'weapon', '마력 효율이 좋다'],
        ['드워프제 전쟁 망치', 4000, '무기', 'weapon', '브론힐다 공방 작품'],
        ['미스릴 단검', 50000, '무기', 'weapon', '가볍고 마력이 통한다'],
    ] },
    방어구점: { desc: '가죽과 쇠를 다루는 갑옷 가게', where: ['city'], items: [
        ['천 로브', 100, '방어구', 'armor', '없는 것보단 낫다'],
        ['가죽 갑옷', 400, '방어구', 'armor', '가볍고 움직이기 편하다'],
        ['징 박은 가죽 갑옷', 800, '방어구', 'armor', '가죽 위에 쇠징'],
        ['마법사 로브', 800, '방어구', 'armor', '마력 실로 짠 로브'],
        ['사슬 갑옷', 2500, '방어구', 'armor', '베기에 강하다. 무겁다'],
        ['판금 갑옷', 30000, '방어구', 'armor', '기사의 갑옷. 맞춤 제작'],
        ['나무 방패', 100, '방패', 'offhand', ''],
        ['강철 방패', 600, '방패', 'offhand', ''],
        ['가죽 장화', 80, '방어구', null, '오래 걸어도 발이 덜 아프다'],
        ['털 망토', 150, '방어구', null, '겨울과 산에서'],
    ] },
    약재상: { desc: '연금술 공방 「세 개의 플라스크」 직판점', where: ['city', 'village'], items: [
        ['하급 회복약', 50, '물약', null, '가벼운 상처를 아물게 한다'],
        ['중급 회복약', 500, '물약', null, '깊은 상처도 막는다'],
        ['상급 회복약', 10000, '물약', null, '죽어 가는 사람도 살린다'],
        ['마나 회복약', 80, '물약', null, 'MP를 조금 되찾는다'],
        ['해독약', 40, '물약', null, '흔한 독을 푼다'],
        ['붕대', 10, '물약', null, '지혈용'],
        ['해열초', 15, '약재', null, '열을 내린다'],
        ['성수', 100, '물약', null, '언데드에게 뿌리면 탄다'],
    ] },
    식료품: { desc: '시장 노점과 빵집', where: ['city', 'village'], items: [
        ['빵', 5, '식량', null, ''],
        ['치즈 덩이', 15, '식량', null, ''],
        ['말린 고기', 10, '식량', null, '야영 식량으로도 쓴다'],
        ['사과 한 바구니', 15, '식량', null, ''],
        ['와인 한 병', 60, '식량', null, ''],
        ['꿀 한 단지', 120, '식량', null, '선물용으로 좋다'],
    ] },
};

// 매입 전용 소재 [이름, 매입가(동)]
export const MATERIALS = [
    ['마석(F)', 10], ['마석(E)', 30], ['마석(D)', 100], ['마석(C)', 500], ['마석(B)', 3000], ['마석(A)', 30000], ['마석(S)', 300000],
    ['월광초', 8], ['약초 묶음', 20], ['맨드레이크', 200], ['은방울 버섯', 40],
    ['뿔토끼 고기', 20], ['뿔토끼 뿔', 30], ['늑대 가죽', 60], ['킬러 비 꿀', 100], ['거미줄 실', 80],
    ['오크 엄니', 100], ['트롤 피', 400], ['와이번 비늘', 500], ['그리폰 깃털', 1500],
    ['고블린 귀', 5], ['슬라임 핵', 8], ['코볼트 송곳니', 15],
];

const SHOP_MULT = { easy: 0.8, normal: 1, hard: 1.2 };
const SELL_RATE = { easy: 0.6, normal: 0.5, hard: 0.4 };

export function availableShops(st) {
    const k = placeKind(st.location);
    return Object.entries(SHOPS).filter(([, s]) => s.where.includes(k)).map(([n]) => n);
}

export function buyPrice(st, base) {
    const m = statMod(st.stats?.매력 ?? 15);
    const p = base * (SHOP_MULT[st.difficulty] ?? 1) * (1 - 0.03 * m);
    return Math.max(1, Math.round(p));
}

export function findGoods(name) {
    const n = nospace(name).replace(/\(.*?\)/g, '');
    for (const [shop, s] of Object.entries(SHOPS)) {
        for (const it of s.items) if (nospace(it[0]).replace(/\(.*?\)/g, '') === n) return { shop, name: it[0], base: it[1], cat: it[2], slot: it[3], desc: it[4] };
    }
    return null;
}

/** 팔 때 받는 값. 모르는 물건은 null (GM과 흥정) */
export function sellPrice(st, name) {
    const n = nospace(name);
    const mat = MATERIALS.find(([m]) => nospace(m) === n);
    const m = statMod(st.stats?.매력 ?? 15);
    if (mat) return Math.max(1, Math.round(mat[1] * (1 + 0.03 * m) * (st.difficulty === 'hard' ? 0.85 : st.difficulty === 'easy' ? 1.15 : 1)));
    const g = findGoods(name);
    if (g) return Math.max(1, Math.round(g.base * (SELL_RATE[st.difficulty] ?? 0.5) * (1 + 0.03 * m)));
    return null;
}

export function equipSlotOf(name, st) {
    const R = st?.relics?.[name]; if (R?.slot) return SLOTS[R.slot] || null;
    return findGoods(name)?.slot || null;
}

/* ───────────────────────── 의뢰 생성 ───────────────────────── */

/* ───────────────────────── 교역: 지역 시세 ───────────────────────── */
/** 교역품 — [이름, 기준가(동), 분류, 설명] · 한 단위 = 한 짐(자루·통·필·상자) */
export const TRADE_GOODS = [
    ['밀 자루', 120, '식량', '빵과 맥주의 바탕. 어디서나 필요하다'],
    ['소금 자루', 200, '식량', '고기와 생선을 절이는 데 꼭 필요하다'],
    ['건어물 상자', 300, '식량', '항구에서 말린 생선'],
    ['맥주 통', 250, '술', '마을 양조장의 보리 맥주'],
    ['와인 통', 900, '술', '귀족과 부자들이 찾는 포도주'],
    ['양모 묶음', 350, '원료', '실과 천의 재료'],
    ['모피 묶음', 1200, '원료', '북부의 겨울을 나는 털가죽'],
    ['목재 더미', 300, '원료', '집과 배, 땔감'],
    ['철광석 자루', 400, '원료', '대장간이 녹여 쓰는 광석'],
    ['철 주괴 상자', 1000, '원료', '드워프가 제련한 철'],
    ['약초 상자', 500, '약재', '약방과 연금술 공방이 찾는다'],
    ['마석 상자', 4000, '마도', '마도구와 연구에 쓰는 하급 마석 모음'],
    ['공예품 상자', 1500, '공예', '도구·식기·장신구 같은 도시의 수공품'],
    ['향신료 상자', 2500, '사치품', '바다 건너 온 후추와 계피'],
    ['비단 필', 3000, '사치품', '이국의 비단'],
    ['보석 원석 주머니', 5000, '사치품', '잿빛 산맥에서 캔 원석'],
];
export const MARKETS = {
    '제도 루미에른': { match: /제도|루미에른/, desc: '제국의 심장. 사치품과 식량을 가장 많이 먹어 치운다', mod: { '공예품 상자': 0.75, '마석 상자': 0.8, '와인 통': 1.25, '비단 필': 1.3, '향신료 상자': 1.25, '보석 원석 주머니': 1.25, '밀 자루': 1.2, '모피 묶음': 1.15 } },
    '항구도시 세렌포트': { match: /세렌포트|항구/, desc: '바다 건너 물건이 들어오는 문', mod: { '향신료 상자': 0.6, '비단 필': 0.65, '소금 자루': 0.7, '건어물 상자': 0.6, '목재 더미': 1.4, '철 주괴 상자': 1.3, '모피 묶음': 1.4, '밀 자루': 1.15 } },
    '바르그홀름': { match: /바르그홀름|잿빛 산맥/, desc: '잿빛 산맥의 드워프 광산 도시', mod: { '철광석 자루': 0.6, '철 주괴 상자': 0.7, '보석 원석 주머니': 0.65, '밀 자루': 1.4, '와인 통': 1.35, '맥주 통': 1.3, '향신료 상자': 1.3, '약초 상자': 1.2 } },
    '브레이크 마을': { match: /브레이크/, desc: '제도 외곽의 밀밭 마을', mod: { '밀 자루': 0.65, '맥주 통': 0.7, '양모 묶음': 0.75, '약초 상자': 0.85, '공예품 상자': 1.3, '소금 자루': 1.25, '철 주괴 상자': 1.2, '와인 통': 1.15 } },
    '곡물 도시 하벤': { match: /하벤|비엔|남부 평원/, desc: '남부 곡창지대의 곡물 거래소와 경마장. 비엔의 포도주가 모인다', mod: { '밀 자루': 0.6, '맥주 통': 0.75, '와인 통': 0.7, '양모 묶음': 0.85, '공예품 상자': 1.25, '소금 자루': 1.2, '철 주괴 상자': 1.25, '비단 필': 1.15, '모피 묶음': 1.2, '목재 더미': 1.15 } },
    '엘름바트': { match: /엘름바트|동부 산림|동부 숲/, desc: '거목의 숲에 선 목재와 사냥의 도시', mod: { '목재 더미': 0.55, '모피 묶음': 0.65, '약초 상자': 0.8, '소금 자루': 1.35, '철 주괴 상자': 1.2, '와인 통': 1.2, '공예품 상자': 1.1, '밀 자루': 1.1 } },
    '북부 변경': { match: /북부|변경|그레이븐/, desc: '마물과 맞닿은 추운 변경', mod: { '모피 묶음': 0.6, '목재 더미': 0.65, '마석 상자': 0.75, '밀 자루': 1.4, '소금 자루': 1.4, '약초 상자': 1.45, '철 주괴 상자': 1.3, '맥주 통': 1.2 } },
};
const SEASON_MOD = {
    봄: { '밀 자루': 1.25, '양모 묶음': 0.85, '약초 상자': 0.95 },
    여름: { '밀 자루': 1.1, '맥주 통': 1.15, '모피 묶음': 0.75, '약초 상자': 0.85 },
    가을: { '밀 자루': 0.8, '와인 통': 0.85, '소금 자루': 1.15, '맥주 통': 0.9 },
    겨울: { '모피 묶음': 1.4, '목재 더미': 1.2, '약초 상자': 1.3, '와인 통': 1.1, '건어물 상자': 1.1, '양모 묶음': 1.15 },
};
/** 이달의 정세 — 달마다 한두 가지가 정해진다 */
export const AFFAIRS = [
    { name: '풍년 소식', desc: '남부와 외곽의 밀밭이 풍년이다', mod: { '*': { '밀 자루': 0.75, '맥주 통': 0.9 } } },
    { name: '흉작', desc: '가뭄으로 밀이 말라 버렸다', mod: { '*': { '밀 자루': 1.5, '맥주 통': 1.2 } } },
    { name: '항로의 폭풍', desc: '폭풍으로 배가 들어오지 못한다', mod: { '*': { '향신료 상자': 1.4, '비단 필': 1.35, '건어물 상자': 1.2 } } },
    { name: '해적 출몰', desc: '세렌포트 앞바다에 해적선이 나타났다', mod: { '*': { '향신료 상자': 1.3, '건어물 상자': 1.2 }, '항구도시 세렌포트': { '철 주괴 상자': 1.2 } } },
    { name: '대상단 도착', desc: '바다 건너 대상단이 세렌포트에 닻을 내렸다', mod: { '*': { '향신료 상자': 0.75, '비단 필': 0.8 } } },
    { name: '북부 마물 범람', desc: '변경에 마물이 쏟아져 나왔다', mod: { '북부 변경': { '밀 자루': 1.4, '소금 자루': 1.3, '철 주괴 상자': 1.5, '약초 상자': 1.4, '모피 묶음': 0.8 }, '*': { '마석 상자': 0.85 } } },
    { name: '광산 낙반', desc: '잿빛 산맥의 큰 갱도가 무너졌다', mod: { '*': { '철광석 자루': 1.4, '철 주괴 상자': 1.35, '보석 원석 주머니': 1.3 } } },
    { name: '사교 시즌', desc: '제도의 귀족들이 연회를 연다', mod: { '제도 루미에른': { '와인 통': 1.3, '비단 필': 1.3, '보석 원석 주머니': 1.2, '향신료 상자': 1.15 } } },
    { name: '전쟁 소문', desc: '황혼 경계 너머가 술렁인다는 소문', mod: { '*': { '철 주괴 상자': 1.4, '철광석 자루': 1.2, '밀 자루': 1.2, '소금 자루': 1.25, '약초 상자': 1.2 } } },
    { name: '역병', desc: '외곽 마을들에 열병이 돈다', mod: { '*': { '약초 상자': 1.8, '맥주 통': 0.9 } } },
    { name: '미궁 신층 발견', desc: '고대 미궁 아르카에서 새 층이 열려 마석이 쏟아진다', mod: { '*': { '마석 상자': 0.7 }, '제도 루미에른': { '공예품 상자': 1.1 } } },
    { name: '평온한 달', desc: '별다른 일 없이 조용하다', mod: {} },
    { name: '평온한 달', desc: '별다른 일 없이 조용하다', mod: {} },
];
export const findTrade = (name) => { const n = nospace(name); return TRADE_GOODS.find(g => nospace(g[0]) === n) || TRADE_GOODS.find(g => nospace(g[0]).startsWith(n) || n.startsWith(nospace(g[0]).replace(/(자루|상자|통|묶음|더미|필|주머니)$/, ''))) || null; };
export function marketOf(loc) {
    const l = String(loc || '');
    for (const [k, m] of Object.entries(MARKETS)) if (m.match.test(l)) return k;
    return null;
}
export const ymOf = (day) => { const f = formatDate(day); return `${f.y}-${f.m}`; };
export function affairsOf(day) {
    const r = rng(hashStr(`affairs|${ymOf(day)}`));
    const a = AFFAIRS[Math.floor(r() * AFFAIRS.length)];
    const list = [a];
    if (r() < 0.45) { const b = AFFAIRS[Math.floor(r() * AFFAIRS.length)]; if (b.name !== a.name && b.name !== '평온한 달' && a.name !== '평온한 달') list.push(b); }
    // 무도회가 있는 달(3~10월)에는 사교 시즌이 자주 겹친다
    const m = formatDate(day).m;
    if (m >= 4 && m <= 6 && !list.some(x => x.name === '사교 시즌') && r() < 0.5) list.push(AFFAIRS.find(x => x.name === '사교 시즌'));
    return list.filter(x => x.name !== '평온한 달' || list.length === 1);
}
/** 이 달, 이 시장의 기준 시세 (매매 전) */
export function marketPrice(st, market, good, day = st.day) {
    const g = findTrade(good); if (!g || !MARKETS[market]) return null;
    let p = g[1] * (MARKETS[market].mod[g[0]] ?? 1);
    p *= SEASON_MOD[formatDate(day).season]?.[g[0]] ?? 1;
    for (const a of affairsOf(day)) p *= (a.mod['*']?.[g[0]] ?? 1) * (a.mod[market]?.[g[0]] ?? 1);
    const r = rng(hashStr(`price|${ymOf(day)}|${market}|${g[0]}`));
    p *= 0.92 + r() * 0.16;
    // 이번 달 내가 이 시장에서 사고판 만큼 값이 움직인다
    const net = st.market?.[`${ymOf(day)}|${market}|${g[0]}`] || 0;
    p *= Math.max(0.6, Math.min(1.5, 1 - net * 0.02));
    return Math.max(1, Math.round(p));
}
/** 사고파는 값 차이 — 상인 길드 등급이 오를수록 줄어든다 */
export function tradeSpread(st) {
    const mr = st.orgs?.merchant ? st.orgs.merchant.rank + 1 : 0;
    const pk = patronHouse(st)?.perk;
    const pb = pk && pk.market === marketOf(st.location) ? 0.05 : 0;
    return Math.max(0.04, 0.24 - mr * 0.03 - Math.max(0, statMod(st.stats?.매력 ?? 15)) * 0.01 - pb);
}
export function tradeQuote(st, good, market = marketOf(st.location)) {
    const p = marketPrice(st, market, good); if (p === null) return null;
    const s = tradeSpread(st);
    return { mid: p, buy: Math.round(p * (1 + s / 2)), sell: Math.max(1, Math.round(p * (1 - s / 2))) };
}
/** 짐 — 한 번에 나를 수 있는 교역품 단위 */
export function cargoCap(st) {
    const has = (re) => (st.items || []).some(i => re.test(i.name));
    let cap = 6;
    if (has(/짐마차/)) cap = 80; else if (has(/손수레/)) cap = 25;
    if ((st.assets || []).some(a => /상단|캐러밴/.test(a.name || a))) cap = Math.max(cap, 300);
    if (merchantRank(st) >= 3) cap += 40; // 길드 창고
    if (st.patron?.role === '상단원') cap += 100; // 가문 상단의 짐마차
    const pack = (st.companions || []).filter(c => c.kind === '마수' && !c.away && c.bond > 0 && /말|망아지|노새|당나귀|낙타|황소/.test(c.species)).length;
    return cap + pack * 15;
}
export const cargoUsed = (st) => (st.items || []).filter(i => findTrade(i.name)).reduce((a, i) => a + i.qty, 0);
function addItem(st, name, qty) {
    const it = st.items.find(i => nospace(i.name) === nospace(name));
    if (it) it.qty += qty; else st.items.push({ name, qty });
}
function removeItem(st, name, qty) {
    const i = st.items.findIndex(x => nospace(x.name) === nospace(name));
    if (i < 0) return;
    st.items[i].qty -= qty; if (st.items[i].qty <= 0) st.items.splice(i, 1);
}
/** 이 물건의 대략적인 값 (거래 창의 가늠용) */
export function valueOf(st, name) {
    if (st?.relics?.[name]?.val) return st.relics[name].val;
    const t = findTrade(name); if (t) { const m = marketOf(st.location); return m ? marketPrice(st, m, t[0]) : t[1]; }
    const n = nospace(name);
    const mat = MATERIALS.find(([m]) => nospace(m) === n); if (mat) return mat[1];
    const g = findGoods(name); if (g) return g.base;
    return null;
}
/** 감정 실력 — 감정 특성·상인 등급이 있으면 값을 정확히 안다 */
export const appraiseExact = (st) => (st.profile?.perks || []).includes('감정') || (st.orgs?.merchant?.rank ?? -1) >= 1;

export function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
export function rng(seed) {
    let a = seed >>> 0;
    return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const between = (r, a, b) => Math.round(a + (b - a) * r());

const RANK_KEYS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
// 보수(동), 공적, 경험 범위
const REWARD = {
    F: [50, 150, 5, 15, 10, 25], E: [100, 400, 15, 30, 20, 40], D: [400, 1500, 30, 60, 40, 80],
    C: [1500, 6000, 60, 120, 80, 150], B: [10000, 50000, 120, 250, 150, 300], A: [50000, 300000, 250, 500, 300, 600], S: [300000, 1000000, 500, 900, 600, 1000],
};
const MONSTERS = {
    F: ['슬라임', '뿔토끼', '거대 쥐', '스켈레톤'],
    E: ['고블린 무리', '코볼트', '흑림 늑대 무리', '킬러 비 떼'],
    D: ['홉고블린', '오크', '자이언트 스파이더', '구울'],
    C: ['오우거', '트롤', '리자드맨 전사', '하피 무리'],
    B: ['와이번', '그리폰', '키메라', '고블린 킹'],
    A: ['바실리스크', '히드라', '리치'],
    S: ['마족 장군', '황혼의 비룡'],
};
// [장소, 의뢰 제목용 짧은 이름]
const PLACES = {
    F: [['제도 하수도', '하수도'], ['브레이크 마을 근처', '브레이크 마을'], ['흑림 가장자리', '흑림'], ['제도 외곽 농장', '외곽 농장']],
    E: [['흑림 가장자리', '흑림'], ['브레이크 마을', '브레이크 마을'], ['고대 미궁 아르카 1~5층', '미궁 상층'], ['동쪽 가도', '동쪽 가도']],
    D: [['흑림 중층', '흑림 중층'], ['고대 미궁 아르카 6~10층', '미궁 상층'], ['잿빛 산맥 기슭', '잿빛 산맥'], ['서쪽 가도', '서쪽 가도']],
    C: [['흑림 심층', '흑림 심층'], ['고대 미궁 아르카 11~20층', '미궁 중층'], ['잿빛 산맥 코볼트 광산', '코볼트 광산'], ['세렌포트 해안 동굴', '해안 동굴']],
    B: [['잿빛 산맥 봉우리', '잿빛 산맥'], ['고대 미궁 아르카 21~30층', '미궁 중층'], ['북부 변경 요새 근처', '북부 변경']],
    A: [['고대 미궁 아르카 31층 이하', '미궁 하층'], ['황혼 경계 근처', '황혼 경계']],
    S: [['황혼 경계', '황혼 경계']],
};

/** 받침에 맞춰 조사 고르기: josa('슬라임', '이', '가') → '슬라임이' */
export function josa(word, withB, withoutB) {
    const w = String(word || '');
    const c = w.charCodeAt(w.length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return w + withoutB;
    return w + (((c - 0xAC00) % 28) ? withB : withoutB);
}
const HERBS = { F: ['월광초', '약초 묶음'], E: ['은방울 버섯', '해열초'], D: ['맨드레이크', '킬러 비 꿀'], C: ['트롤 피', '화염석'], B: ['와이번 비늘', '그리폰 깃털'], A: ['바실리스크의 눈'], S: ['고룡의 비늘'] };
const CLIENTS = ['브레이크 마을 촌장 하인츠', '여관 주인 마르게', '세 개의 플라스크 공방', '대장장이 브론힐다', '상인 길드', '빛의 성당 치유원', '제도 위병대', '어느 하급 귀족 집사', '로세티 상회', '농부 일가', '그레이븐 변경백령 대리인', '청람의 탑 연구실', '익명'];
const ERRANDS = [
    ['하수도 쥐 퇴치', '회색 골목 수로에 쥐가 들끓는다. 꼬리 서른 개 이상 제출.'],
    ['잃어버린 고양이 찾기', '귀족가 하녀가 아가씨의 하얀 고양이를 잃어버렸다. 백은 구역 담장 근처에서 마지막으로 보였다.'],
    ['짐 나르기', '사거리 시장 창고에서 길드 대로 공방까지 상자 스무 개.'],
    ['울타리 수리 돕기', '브레이크 마을의 부서진 목책을 고치는 일. 식사 제공.'],
    ['편지 배달', '세 개의 플라스크 공방에서 브레이크 마을 마녀 오드리에게 밀봉된 편지를 전달.'],
    ['우물 청소', '사거리 시장 뒤편 공동 우물 바닥 청소. 무언가 빠져 있다는 소문.'],
];

export function boardTypes(st) {
    const out = [['public', '공개 게시판']];
    if (st.orgs?.adventurer) out.unshift(['adventurer', '모험가 길드']);
    if (st.orgs?.merchant) out.push(['merchant', '상인 길드']);
    if (st.orgs?.shadow) out.push(['shadow', '그림자 길드']);
    return out;
}

function rewardFor(r, rank, diff) {
    const [m0, m1, k0, k1, e0, e1] = REWARD[rank];
    const mult = diff === 'easy' ? 1.3 : diff === 'hard' ? 0.8 : 1;
    const gross = Math.round(between(r, m0, m1) * mult / 10) * 10 || 10;
    return { gross, net: Math.round(gross * 0.9), merit: between(r, k0, k1), exp: Math.round(between(r, e0, e1) * mult) };
}

/** 날짜·채팅마다 고정된 의뢰 목록 */
export function generateBoard(st, type, seedKey = '') {
    const r = rng(hashStr(`${seedKey}|${type}|${st.day}`));
    const list = [];
    const taken = new Set([...(st.quests || []), ...(st.questLog || [])].map(q => nospace(q.name)));
    if (type === 'adventurer') {
        const myRank = st.orgs.adventurer?.rank ?? 0;
        const ranks = RANK_KEYS.slice(Math.max(0, myRank - 1), Math.min(7, myRank + 2));
        const n = 7;
        for (let i = 0; i < n; i++) {
            const rank = ranks[Math.min(ranks.length - 1, Math.floor(r() * ranks.length))];
            const ri = RANK_KEYS.indexOf(rank);
            const pool = rank === 'F' ? ['토벌', '채집', '잡일', '잡일', '배달', '수색']
                : ['토벌', '토벌', '채집', '호위', '조사', '배달', '수색', '생포', '소재', ...(ri >= 3 ? ['원정', '원정'] : [])];
            const kind = pick(r, pool);
            const [place, short] = pick(r, PLACES[rank]);
            const client = pick(r, CLIENTS);
            const rw = rewardFor(r, rank, st.difficulty);
            let name, desc, days = between(r, 2, 7), placeOv = null;
            if (kind === '토벌') {
                const mon = pick(r, MONSTERS[rank]);
                const cnt = between(r, 3, 8);
                name = `${short} ${mon} 토벌`;
                desc = `${place}에 ${josa(mon, '이', '가')} 나타나 피해가 나고 있다. ${/무리|떼/.test(mon) ? `${cnt}마리 이상` : '해당 개체'} 토벌, 증거 부위 제출.`;
            } else if (kind === '채집') {
                const herb = pick(r, HERBS[rank]);
                const cnt = between(r, 5, 15);
                name = `${herb} 채집`;
                desc = `${place}에서 ${josa(herb, '을', '를')} ${['F', 'E'].includes(rank) ? cnt + '개' : '필요한 만큼'} 구해 올 것. 상태가 좋을수록 추가 보수.`;
            } else if (kind === '호위') {
                const route = pick(r, ['제도 → 브레이크 마을', '제도 → 세렌포트', '제도 → 잿빛 산맥 바르그홀름', '세렌포트 → 제도', '제도 → 북부 변경']);
                name = `상단 호위 (${route})`; placeOv = route.split(' → ')[0];
                desc = `${route} 구간 상단 호위. 도적과 마물에 대비. 왕복 ${days}일 일정, 식사 제공.`;
            } else if (kind === '조사') {
                name = `${short} 이상 징후 조사`;
                desc = `${place} 일대에서 마물의 움직임이 이상하다는 보고. 원인을 조사해 보고서를 제출할 것.`;
            } else if (kind === '배달') {
                const it = pick(r, ['밀봉된 서신', '약초 꾸러미', '수리한 검 한 자루', '결혼 예물 상자', '길드 문서함', '마석 견본']);
                name = `${it} 배달 (${short})`;
                desc = `${josa(it, '을', '를')} ${place}의 수취인에게 기한 안에 전할 것. 내용물에 손대지 말 것 — 봉인이 뜯기면 보수 없음.`;
                days = between(r, 2, 5);
            } else if (kind === '수색') {
                const who = pick(r, ['약초꾼 노인', '마을 아이 둘', '신입 모험가 파티', '행상인 부부', '사냥개 한 마리']);
                name = `${short} 실종자 수색 — ${who}`;
                desc = `${place} 근처에서 ${josa(who, '이', '가')} 돌아오지 않았다. 찾아서 데려오거나, 행방을 알아 올 것. 살아 있다면 추가 보수.`;
                days = between(r, 1, 4);
            } else if (kind === '생포') {
                const mon = pick(r, MONSTERS[rank]).replace(/ ?(무리|떼)$/, '');
                name = `${mon} 생포`;
                desc = `${place}의 ${josa(mon, '을', '를')} 산 채로 잡아 올 것(청람의 탑 연구용·조련용). 상처가 적을수록 추가 보수. 테이머 우대.`;
            } else if (kind === '소재') {
                const mon = pick(r, MONSTERS[rank]).replace(/ ?(무리|떼)$/, '');
                const part = pick(r, ['송곳니', '가죽', '마석', '발톱', '독샘', '깃털']);
                name = `${mon}의 ${part} 납품`;
                desc = `${place}에 사는 ${mon}의 ${josa(part, '을', '를')} 구해 올 것. 해체 솜씨에 따라 값이 달라진다. 공방·약재상 의뢰.`;
            } else if (kind === '원정') {
                name = `${short} 장기 원정`;
                desc = `${place} 깊숙이 들어가 지형과 마물 분포를 기록하는 원정. 한 달 가까이 걸린다. 보급 일부 지원, 파티 권장.`;
                days = between(r, 20, 30);
                rw.gross *= 3; rw.net *= 3; rw.merit *= 2; rw.exp *= 2;
            } else {
                const e = pick(r, ERRANDS);
                name = e[0]; desc = e[1]; days = between(r, 1, 3);
            }
            if (taken.has(nospace(name)) || list.some(q => q.name === name)) continue;
            list.push({ name, kind, rank: `${rank}`, client, place: placeOv || place, desc, days, org: 'adventurer', ...rw, eligible: RANK_KEYS.indexOf(rank) <= myRank + 1 });
        }
        // 지명 의뢰 — 이름이 알려지면 귀족·상회가 직접 찾는다
        if ((myRank >= 2 || st.renown >= 30) && r() < 0.6) {
            const rank = RANK_KEYS[Math.min(6, myRank + 1)];
            const noble = pick(r, ['에른스트 백작가', '그레이븐 변경백', '로세티 상회 비앙카 로세티', '발렌하임 공작가 집사장', '황실 기사단 부단장 마르타', '청람의 탑 수석 연구관']);
            const job = pick(r, [['호위', '사교 시즌 동안 가족의 신변을 지킬 것. 예의범절이 필요하다.'], ['조사', '가문 영지에서 일어난 기묘한 사건을 은밀히 조사할 것. 소문이 나지 않게.'], ['토벌', '영지를 위협하는 마물을 처리할 것. 영민들 앞에서 체면을 세워 주면 더 좋다.'], ['수색', '집을 나간 막내를 찾아 데려올 것. 일은 조용히.']]);
            const rw = rewardFor(r, rank, st.difficulty);
            const name = `[지명] ${noble} — ${job[0]}`;
            if (!taken.has(nospace(name))) list.unshift({ name, kind: '지명', rank, client: noble, place: '의뢰인에게 직접', desc: `${josa(st.profile?.name || '당신', '을', '를')} 지명한 의뢰. ${job[1]} 거절해도 벌칙은 없지만, 받으면 의뢰인과의 관계가 깊어진다.`, days: between(r, 3, 10), org: 'adventurer', gross: rw.gross * 2, net: Math.round(rw.gross * 2 * 0.9), merit: rw.merit * 2, exp: rw.exp, eligible: true });
        }
        // 긴급 의뢰 — 가끔 붙는다. 등급 제한 없음, 길드 수수료 면제
        if (r() < 0.18) {
            const rank = RANK_KEYS[Math.min(6, myRank + 1)];
            const [place, short] = pick(r, PLACES[rank]);
            const mon = pick(r, MONSTERS[rank]);
            const rw = rewardFor(r, rank, st.difficulty);
            const name = `[긴급] ${short} ${mon} 출몰 — 방어 인원 모집`;
            if (!taken.has(nospace(name))) list.unshift({ name, kind: '긴급', rank, client: '모험가 길드', place, desc: `${josa(mon, '이', '가')} ${place} 쪽으로 몰려오고 있다. 등급 불문, 싸울 수 있는 자는 모두 모일 것. 길드 수수료 면제, 참가만 해도 공적.`, days: 1, org: 'adventurer', gross: rw.gross * 2, net: rw.gross * 2, merit: rw.merit * 2, exp: rw.exp * 2, eligible: true });
        }
        // 클래스를 보고 찾아오는 의뢰
        const CJ = {
            음유시인: ['연회 공연', '백은 구역 어느 귀족가 연회에서 하룻밤 연주할 것. 손님들의 마음을 얻으면 다음 초대로 이어진다.'],
            치유사: ['역병 마을 지원', '근교 마을에 열병이 돈다. 치유원과 함께 환자들을 돌볼 것.'],
            테이머: ['탈것 조련', '상단의 새 짐말 다섯 마리를 길들이고 다루는 법을 마부들에게 가르칠 것.'],
            궁수: ['사냥감 납품', '연회에 쓸 사슴과 꿩을 잡아 올 것. 상처가 적을수록 값을 쳐 준다.'],
            도적: ['길드 금고 점검', '길드 금고와 창고의 자물쇠·함정을 점검하고 허점을 보고할 것. (합법 의뢰)'],
            마법사: ['마도구 수리', '고장 난 조명 마도구 열 개에 마력을 다시 채우고 회로를 손볼 것.'],
        }[st.cls];
        if (CJ && r() < 0.5) {
            const rank = RANK_KEYS[myRank] || 'F';
            const rw = rewardFor(r, rank, st.difficulty);
            const name = `${CJ[0]} (${st.cls} 우대)`;
            if (!taken.has(nospace(name))) list.push({ name, kind: '전문', rank, client: pick(r, CLIENTS), place: '제도 일대', desc: CJ[1], days: between(r, 1, 4), org: 'adventurer', ...rw, eligible: true });
        }
        const top = (q) => q.kind === '긴급' ? 0 : q.kind === '지명' ? 1 : 2;
        list.sort((a, b) => top(a) - top(b) || RANK_KEYS.indexOf(a.rank) - RANK_KEYS.indexOf(b.rank));
    } else if (type === 'merchant') {
        const mr = st.orgs.merchant?.rank ?? 0;
        const tier = RANK_KEYS[Math.min(6, mr + 1)];
        const goods = ['밀가루 스무 포대', '세렌포트산 향신료', '잿빛 산맥 철광석', '흑림 약초', '비단 열 필', '와인 서른 통', '양초 백 자루', '마석 한 상자'];
        for (let i = 0; i < 5; i++) {
            const g = pick(r, goods);
            const kind = pick(r, ['납품', '운송', '시세 조사', '수금']);
            const rw = rewardFor(r, tier, st.difficulty);
            const dest = pick(r, ['백은 구역 귀족가 주방', '세렌포트 로세티 상회 창고', '바르그홀름 드워프 상회', '브레이크 마을 잡화점', '황실 기사단 보급대']);
            let name, desc;
            if (kind === '납품') { name = `${g} 납품`; desc = `${dest}에 ${josa(g, '을', '를')} 기한 안에 납품. 매입은 직접 해야 하며, 싸게 사 올수록 남는다.`; }
            else if (kind === '운송') { name = `${g} 운송`; desc = `${josa(g, '을', '를')} ${dest}까지 안전하게 운송. 파손·분실 시 배상.`; }
            else if (kind === '시세 조사') { name = `${g} 시세 조사`; desc = `제도와 근교의 ${g} 시세를 조사해 보고. 그라운 상회의 움직임도 함께.`; }
            else { name = `밀린 대금 수금 (${dest.split(' ')[0]})`; desc = `${dest}에서 석 달째 밀린 대금을 받아 올 것. 상대가 만만치 않다.`; }
            if (taken.has(nospace(name)) || list.some(q => q.name === name)) continue;
            list.push({ name, rank: E_rankName('merchant', mr), client: '상인 길드', place: dest, desc, days: between(r, 3, 10), org: 'merchant', ...rw, eligible: true });
        }
        if (mr >= 4) {
            const big = [
                ['[대형 계약] 황실 기사단 겨울 군량', '기사단 세 개 중대의 겨울 군량(밀·소금·건어물)을 석 달에 나눠 대는 계약. 성공하면 기사단과 끈이 생긴다.'],
                ['[경매] 몰락한 남작가 재산 경매', '빚에 몰린 남작가의 저택 집기와 장서, 포도밭 지분이 경매에 나온다. 눈썰미가 있으면 보물이 섞여 있다.'],
                ['[대형 계약] 세렌포트 신항 건설 목재', '새 부두를 지을 목재를 북부에서 대는 일. 해적과 날씨가 변수.'],
                ['[경매] 미궁 출토품 경매', '고대 미궁 아르카에서 나온 유물들. 탑과 귀족들이 눈독을 들인다.'],
            ];
            for (const [name, desc] of [pick(r, big.slice(0, 2)), pick(r, big.slice(2))]) {
                if (taken.has(nospace(name))) continue;
                const rw = rewardFor(r, RANK_KEYS[Math.min(6, mr + 1)], st.difficulty);
                list.unshift({ name, kind: name.includes('경매') ? '경매' : '대형 계약', rank: E_rankName('merchant', mr), client: '상인 길드', place: name.includes('세렌포트') ? '항구도시 세렌포트' : '제도 루미에른', desc, days: between(r, 10, 30), org: 'merchant', gross: rw.gross * 4, net: rw.gross * 4, merit: rw.merit * 2, exp: rw.exp, eligible: true });
            }
        }
    } else if (type === 'shadow') {
        const sr = st.orgs.shadow?.rank ?? 0;
        const tier = RANK_KEYS[Math.min(6, sr + 1)];
        const jobs = [
            ['소문 수집', '어느 귀족가 하인들 사이에 도는 소문을 모아 올 것. 출처는 묻지 않는다.'],
            ['물건 운반', '봉인된 상자 하나를 강변 부두 7번 창고로. 열어 보지 말 것.'],
            ['미행', '그라운 상회 점원 하나가 밤마다 어디 가는지 알아낼 것.'],
            ['빚 독촉', '구멍 난 양동이에 빚진 자를 찾아 정중히(?) 상기시킬 것.'],
            ['위조 통행증 전달', '백은 구역 하인 출입패를 어떤 손님에게 건넬 것.'],
            ...(sr >= 2 || st.cls === '도적' ? [
                ['귀족 그림자 호위', '어느 백작가 영애가 연회에 나간다. 보이지 않는 곳에서 지킬 것. 정체를 들키면 보수 없음.'],
                ['정보 탈취', '경쟁 상회의 장부 한 권을 하룻밤 빌려 와 베낀 뒤 돌려 놓을 것.'],
            ] : []),
            ...(sr >= 4 ? [['암살', '이름은 직접 만나 듣는다. 흔적을 남기지 말 것. 거절해도 된다 — 단, 들은 이상 입은 다물 것.']] : []),
        ];
        for (let i = 0; i < 4; i++) {
            const j = pick(r, jobs);
            if (list.some(q => q.name === j[0]) || taken.has(nospace(j[0]))) continue;
            const rw = rewardFor(r, tier, st.difficulty);
            list.push({ name: j[0], rank: E_rankName('shadow', sr), client: '벨벳', place: '제도 회색 골목', desc: j[1], days: between(r, 1, 4), org: 'shadow', ...rw, eligible: true });
        }
    } else {
        for (let i = 0; i < 4; i++) {
            const e = pick(r, ERRANDS);
            if (list.some(q => q.name === e[0]) || taken.has(nospace(e[0]))) continue;
            const rw = rewardFor(r, 'F', st.difficulty);
            list.push({ name: e[0], rank: '잡일', client: pick(r, CLIENTS), place: '제도와 근교', desc: e[1], days: between(r, 1, 3), org: '', ...rw, merit: 0, eligible: true });
        }
    }
    return list;
}
function E_rankName(org, r) { return ORGS[org].ranks[Math.min(ORGS[org].ranks.length - 1, r)]; }

/** 의뢰판 의뢰 → 의뢰 변동 줄 */
export function questOpLine(q) {
    const clean = (s) => String(s || '').replace(/[|｜\n]/g, ' ');
    return `의뢰 +${clean(q.name)} | ${clean(q.rank)} | ${formatMoney(q.net)} | ${clean(q.place)} | ${clean(q.desc)} | ${q.merit || 0} | ${q.exp || 0} | ${q.days}일 | ${q.org || ''}`;
}
export const maxQuests = (st) => (st.difficulty === 'easy' ? 4 : 3);

/* ───────────────────────── 행사 달력 ───────────────────────── */

// m: 월(0=매달), d: 시작일, len: 일수, months: 매달 행사일 때 해당 월
export const EVENTS = [
    { m: 0, d: 1, len: 1, name: '정기 승급 심사', kind: 'guild', desc: '모험가 길드가 승급 자격자에게 시험·심사 일정을 통보한다.' },
    { m: 0, d: 15, len: 1, name: '상인 길드 평의회', kind: 'merchant', desc: '시세 공시와 큰 계약. 상회주 이상은 참석한다.' },
    { m: 0, d: 30, len: 1, name: '황궁 무도회', kind: 'noble', months: [3, 4, 5, 6, 7, 8, 9, 10], desc: '사교 시즌의 무도회. 초대장 없이는 들어갈 수 없다.' },
    { m: 1, d: 1, len: 1, name: '신년 하례', kind: 'noble', desc: '귀족들이 황궁에서 황제를 알현한다.' },
    { m: 3, d: 15, len: 7, name: '건국제', kind: 'festival', desc: '제도 최대 축제. 상인들의 대목, 사교 시즌 개막.' },
    { m: 3, d: 18, len: 3, name: '황실 무투대회', kind: 'contest', desc: '신분 불문 참가. 우승자는 황제를 알현한다.' },
    { m: 4, d: 1, len: 1, name: '기사단 종자 선발 시험', kind: 'guild', desc: '황실 기사단이 종자를 뽑는다. 평민도 응시 가능.' },
    { m: 5, d: 10, len: 1, name: '청람의 탑 입학 시험', kind: 'guild', desc: '견습 입학 시험과 공개 강연. 황녀가 참석하기도 한다.' },
    { m: 6, d: 10, len: 1, name: '황제 탄신 축하연', kind: 'noble', desc: '황궁 연회와 서임식. 공을 세운 자에게 작위가 수여된다.' },
    { m: 7, d: 5, len: 3, name: '해신제', kind: 'festival', desc: '세렌포트의 바다 축제. 배 경주와 이국 시장.' },
    { m: 8, d: 20, len: 3, name: '미궁 원정제', kind: 'contest', desc: '모험가 길드 주최 고대 미궁 아르카 합동 원정대 모집.' },
    { m: 9, d: 1, len: 1, name: '청람의 탑 승급 시험', kind: 'guild', desc: '마도사 승급 시험.' },
    { m: 10, d: 10, len: 5, name: '수확제', kind: 'festival', desc: '곡물 시세가 요동치는 가을 축제.' },
    { m: 11, d: 15, len: 2, name: '귀족 사냥제', kind: 'noble', desc: '흑림 가장자리 사냥 대회. 몰이꾼·호위로 평민을 고용한다.' },
    { m: 12, d: 24, len: 2, name: '성야제', kind: 'festival', desc: '성녀가 대성당 발코니에서 축복을 내린다.' },
];

export function dayToDate(day) { const f = formatDate(day); return { m: f.m, d: f.d, y: f.y }; }

export function eventsOn(day) {
    const { m, d } = dayToDate(day);
    return EVENTS.filter(e => {
        if (e.m === 0) return d === e.d && (!e.months || e.months.includes(m));
        return e.m === m && d >= e.d && d < e.d + e.len;
    });
}

/** 앞으로 n일 안에 시작하는 행사 [{ev, inDays, day}] */
export function upcomingEvents(day, n = 14) {
    const out = [];
    for (let k = 1; k <= n; k++) {
        const { m, d } = dayToDate(day + k);
        for (const e of EVENTS) {
            const starts = e.m === 0 ? (d === e.d && (!e.months || e.months.includes(m))) : (e.m === m && d === e.d);
            if (starts) out.push({ ev: e, inDays: k, day: day + k });
        }
    }
    return out;
}

/* ───────────────────────── 전투 클래스 ───────────────────────── */

export const CLASS_MAX = 50;
// [레벨, 기술 이름, 설명]
export const CLASSES = {
    전사: { en: 'Warrior', role: '근접 · 방어', stats: ['근력', '체력'], weapon: '대검 · 도끼', desc: '두꺼운 갑옷과 무거운 무기로 앞줄을 지킨다.', teacher: '모험가 길드 훈련장 교관 바르톨', skills: [
        [1, '강타', '온 힘을 실은 일격'], [5, '도발', '적의 시선을 자신에게 끈다'], [10, '회전베기', '주위의 적을 한꺼번에 벤다'], [15, '철벽', '잠시 버티며 피해를 크게 줄인다'],
        [20, '광폭화', '피를 흘릴수록 강해진다'], [30, '대지 가르기', '땅을 내려쳐 충격파를 일으킨다'], [40, '불굴', '쓰러질 일격을 한 번 버텨 낸다'], [50, '전장의 포효', '아군 전체의 사기를 끌어올린다']] },
    검사: { en: 'Swordsman', role: '근접 · 균형', stats: ['근력', '민첩'], weapon: '장검 · 방패', desc: '검과 방패를 쓰는 정통파. 공격과 방어의 균형이 좋다.', teacher: '황실 기사단 훈련장 (부단장 마르타 그레이)', skills: [
        [1, '연속 베기', '빠른 세 번의 베기'], [5, '방패 막기', '방패로 공격을 흘린다'], [10, '돌진 찌르기', '거리를 단숨에 좁힌다'], [15, '반격', '막아 낸 직후 되받아친다'],
        [20, '검기', '검에 마력을 실어 날린다'], [30, '수호의 맹세', '곁의 동료를 대신 지킨다'], [40, '일섬', '눈에 보이지 않는 한 칼'], [50, '성검 해방', '검에 깃든 빛을 해방한다']] },
    창술사: { en: 'Lancer', role: '근접 · 기동', stats: ['근력', '민첩'], weapon: '창 · 미늘창', desc: '도약하는 용기사, 말 위의 돌격, 창벽 — 긴 사거리로 전장을 누빈다.', teacher: '북부 변경 출신 용병 창술가 하겐 (길드 대로 용병 숙소)', skills: [
        [1, '꿰뚫기', '창끝으로 깊게 찌른다'], [5, '쓸어내기', '창대를 휘둘러 넘어뜨린다'], [10, '도약', '높이 뛰어올라 내리꽂는다'], [15, '연속 찌르기', '다섯 번의 빠른 찌르기'],
        [20, '창벽', '창을 세워 돌진을 막는다'], [30, '용의 비상', '하늘 높이 솟구쳐 낙하한다'], [40, '관통 일격', '갑옷째 꿰뚫는다'], [50, '천룡창', '하늘을 가르는 창격']] },
    격투가: { en: 'Pugilist', role: '근접 · 연타', stats: ['민첩', '근력'], weapon: '너클 · 맨손', desc: '맨몸과 기(氣)로 싸우는 무도가. 무기가 없어도, 어떤 전장에서도 제 실력을 낸다.', teacher: '회색 골목 지하 격투장의 노장 "곰" 오토', skills: [
        [1, '연타', '숨 돌릴 틈 없는 주먹'], [5, '돌려차기', '체중을 실은 발차기'], [10, '기공 호흡', '숨을 골라 체력을 되찾는다'], [15, '받아넘기기', '상대의 힘을 흘려 넘어뜨린다'],
        [20, '권기', '주먹에 모은 기를 쏘아낸다'], [30, '백열권', '눈부신 연속 타격'], [40, '금강신', '몸을 강철처럼 단단하게'], [50, '무상권', '한 점에 모든 것을 싣는다']] },
    궁수: { en: 'Archer', role: '원거리 · 물리', stats: ['민첩', '감각'], weapon: '활', desc: '장궁·석궁·일반 활 — 멀리서 정확하게. 사냥과 정찰에도 능하다.', teacher: '흑림 가장자리 사냥꾼 오두막의 실바', skills: [
        [1, '조준 사격', '숨을 멈추고 정확히 쏜다'], [5, '연사', '빠르게 두세 발을 날린다'], [10, '독화살', '화살촉에 독을 바른다'], [15, '매의 눈', '먼 곳과 숨은 것을 꿰뚫어 본다'],
        [20, '견제 사격', '다리를 노려 발을 묶는다'], [30, '화살비', '하늘에서 쏟아지는 화살'], [40, '저격', '아주 먼 곳의 급소를 맞힌다'], [50, '바람의 화살', '바람을 실은 필중의 한 발']] },
    도적: { en: 'Rogue', role: '근접 · 은밀', stats: ['민첩', '행운'], weapon: '단검 · 투척 무기', desc: '그림자술과 은신, 암살에 능하다. 귀족의 호위나 은밀한 의뢰를 맡기도 한다.', teacher: '그림자 길드 (구멍 난 양동이의 벨벳에게 부탁)', skills: [
        [1, '기습', '눈치채기 전에 찌른다'], [5, '은신', '그림자에 녹아든다'], [10, '자물쇠 따기', '잠긴 것을 연다'], [15, '독 바르기', '칼날에 독을 입힌다'],
        [20, '연막', '연기를 뿌리고 사라진다'], [30, '급소 찌르기', '단숨에 숨통을 노린다'], [40, '그림자 걸음', '보이지 않게 뒤로 돌아간다'], [50, '암살', '단 한 번의 확실한 죽음']] },
    음유시인: { en: 'Bard', role: '지원 · 원거리', stats: ['매력', '민첩'], weapon: '류트 · 활', desc: '소리로 베는 음파, 아군을 일으키고 적을 무너뜨리는 선율. 연회에서도 환영받는다.', teacher: '사거리 시장 음악가 조합 「황금 류트 홀」', skills: [
        [1, '용기의 노래', '동료의 기운을 북돋는다'], [5, '자장가', '상대를 졸리게 한다'], [10, '불협화음', '귀를 찢는 소리로 흐트러뜨린다'], [15, '회복의 선율', '상처의 아픔을 덜어 준다'],
        [20, '매혹의 노래', '듣는 이의 마음을 끈다'], [30, '진군가', '파티 전체의 움직임이 빨라진다'], [40, '진혼곡', '망자와 언데드를 잠재운다'], [50, '영웅 서사시', '노래가 전설이 되어 모두를 일으킨다']] },
    마법사: { en: 'Mage', role: '원거리 · 마법', stats: ['지능', '정신'], weapon: '지팡이 · 마도서', desc: '원소 마법으로 큰 위력을 낸다. 몸은 약하다.', teacher: '청람의 탑 (페릭 교수의 공개 강좌)', skills: [
        [1, '마력탄', '무속성 마력을 쏜다'], [5, '화염구', '불덩이를 던진다'], [10, '얼음 창', '얼음 창으로 꿰뚫는다'], [15, '마력 방벽', '마력의 막으로 막는다'],
        [20, '연쇄 번개', '번개가 적에서 적으로 튄다'], [30, '화염 폭풍', '넓은 범위를 불태운다'], [40, '시간 지연', '주변의 흐름을 잠시 느리게'], [50, '메테오', '하늘에서 운석을 떨어뜨린다']] },
    치유사: { en: 'Healer', role: '회복 · 지원', stats: ['정신', '지능'], weapon: '성표 · 지팡이', desc: '빛의 여신의 힘으로 상처를 낫게 하고 부정을 씻는다.', teacher: '빛의 대성당 치유원', skills: [
        [1, '치유', '상처를 아물게 한다'], [5, '정화', '독과 저주를 씻어 낸다'], [10, '축복', '동료를 빛으로 감싼다'], [15, '성스러운 빛', '언데드를 태운다'],
        [20, '광역 치유', '주위 모두를 치유한다'], [30, '성역', '악한 것이 들어오지 못하는 결계'], [40, '소생의 기도', '쓰러진 이를 다시 일으킨다'], [50, '여신의 가호', '죽음조차 한 번 막아 내는 축복']] },
    정령술사: { en: 'Elementalist', role: '정령 · 마법', stats: ['정신', '감각'], weapon: '정령석 · 지팡이', desc: '이 세계 자연의 정령과 교감해 힘을 빌린다. 정령은 부리는 것이 아니라 함께하는 친구다.', teacher: '흑림 깊은 곳 엘프 은자 아이린', skills: [] },
    소환사: { en: 'Summoner', role: '계약 · 소환', stats: ['정신', '매력'], weapon: '소환진 · 계약서', desc: '이계의 존재와 대가를 걸고 계약해 불러낸다. 강하지만 계약은 반드시 지켜야 한다.', teacher: '회색 골목 지하 서고의 소환학자 모르데카이', skills: [] },
    테이머: { en: 'Tamer', role: '조련 · 동행', stats: ['감각', '매력'], weapon: '채찍 · 호각 · 단검', desc: '짐승·맹금·마물·탈것을 길들여 함께 다닌다. 탈것을 길러 동료에게 내어 주기도 한다.', teacher: '브레이크 마을의 늙은 조련사 그레타', skills: [] },
};

export const JOB_DEFAULT_CLASS = { 모험가: '전사', 상인: '음유시인', 기사지망: '검사', 마법사: '마법사', 장인: '전사', 신관: '치유사', 자유인: '도적' };

const CLASS_ALIAS = { 워리어: '전사', 검객: '검사', 기사: '검사', 창병: '창술사', 랜서: '창술사', 무도가: '격투가', 몽크: '격투가', 아처: '궁수', 사냥꾼: '궁수', 시프: '도적', 바드: '음유시인', 음유: '음유시인', 위자드: '마법사', 마도사: '마법사', 흑마법사: '마법사', 힐러: '치유사', 백마법사: '치유사', 성직자: '치유사', 정령사: '정령술사', 서머너: '소환사', 계약자: '소환사', 조련사: '테이머', 비스트테이머: '테이머', 조련: '테이머' };
export function normClass(s) {
    const n = nospace(s);
    if (CLASSES[n]) return n;
    return CLASS_ALIAS[n] || Object.keys(CLASSES).find(k => n.includes(k)) || null;
}

export function classSkills(cls, lv) {
    return (CLASSES[cls]?.skills || []).filter(([l]) => l <= lv);
}

/* ───────────────────────── 생활 기술 ───────────────────────── */

export const LIFE_RANKS = ['연습', 'F', 'E', 'D', 'C', 'B', 'A', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
const LIFE_BONUS_AT = [4, 6, 10, 13, 15]; // C, A, 6, 3, 1 랭크 도달 시 관련 능력치 +1
export const LIFE = {
    채집: { group: '채집', stat: '감각', desc: '약초·버섯·열매를 알아보고 캔다' },
    채광: { group: '채집', stat: '근력', desc: '광맥을 찾아 광석과 원석을 캔다' },
    벌목: { group: '채집', stat: '근력', desc: '쓸 만한 나무를 골라 벤다' },
    낚시: { group: '채집', stat: '행운', desc: '강과 바다에서 물고기와 보물을 낚는다' },
    '사냥·해체': { group: '채집', stat: '민첩', desc: '짐승을 잡고 가죽·고기·소재를 얻는다' },
    대장일: { group: '제작', stat: '근력', desc: '쇠를 달궈 무기와 갑옷을 만든다' },
    '가죽 공예': { group: '제작', stat: '민첩', desc: '가죽을 무두질해 갑옷·가방·장화를 만든다' },
    재봉: { group: '제작', stat: '민첩', desc: '천으로 옷과 로브를 짓는다' },
    목공: { group: '제작', stat: '근력', desc: '활·지팡이·방패·가구를 깎는다' },
    세공: { group: '제작', stat: '감각', desc: '보석과 금속으로 장신구를 만든다' },
    연금술: { group: '제작', stat: '지능', desc: '물약과 약품을 조합한다' },
    요리: { group: '제작', stat: '체력', desc: '맛있고 든든한 음식을 만든다' },
    연주: { group: '예술', stat: '매력', desc: '악기를 연주해 사람의 마음을 움직인다' },
    작곡: { group: '예술', stat: '정신', desc: '자신만의 곡을 짓는다' },
    '응급 치료': { group: '생활', stat: '지능', desc: '붕대와 약초로 상처를 돌본다' },
    승마: { group: '생활', stat: '민첩', desc: '말을 다루고 말 위에서 싸운다' },
    농사: { group: '생활', stat: '체력', desc: '땅을 갈고 씨를 뿌려 거둔다. 과수원도 돌본다' },
    목축: { group: '생활', stat: '감각', desc: '소·양·돼지·말을 치고 새끼를 받는다' },
    양조: { group: '제작', stat: '감각', desc: '포도와 과일, 보리로 술을 빚고 묵힌다' },
};
const LIFE_ALIAS = { 약초채집: '채집', 약초: '채집', 광산: '채광', 나무베기: '벌목', 사냥: '사냥·해체', 해체: '사냥·해체', 도축: '사냥·해체', 대장장이: '대장일', 대장간: '대장일', 무기제작: '대장일', 방어구제작: '대장일', 가죽가공: '가죽 공예', 가죽공예: '가죽 공예', 무두질: '가죽 공예', 바느질: '재봉', 옷만들기: '재봉', 나무공예: '목공', 장신구: '세공', 보석세공: '세공', 물약: '연금술', 조리: '요리', 음악: '연주', 악기: '연주', 악기연주: '연주', 노래: '연주', 작곡: '작곡', 응급처치: '응급 치료', 응급치료: '응급 치료', 치료: '응급 치료', 말타기: '승마', 농부: '농사', 밭일: '농사', 과수: '농사', 가축: '목축', 목장: '목축', 술빚기: '양조', 와인: '양조' };
export function normLife(s) {
    const n = nospace(s);
    const hit = Object.keys(LIFE).find(k => nospace(k) === n);
    if (hit) return hit;
    return LIFE_ALIAS[n] || Object.keys(LIFE).find(k => n.includes(nospace(k))) || null;
}
export function lifeNeed(st, rank) {
    const D = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    return Math.round((15 + rank * 10) * (1 + rank * 0.45) * D.expMult); // 윗랭크일수록 가파르게
}
export const lifeRankName = (r) => LIFE_RANKS[Math.max(0, Math.min(LIFE_RANKS.length - 1, r))];

function trainLife(st, name, amount, log) {
    if (!st.life[name]) { st.life[name] = { rank: 0, pt: 0 }; log.push({ k: 'rank', t: `생활 기술 습득 — ${name}` }); }
    const s = st.life[name];
    if (amount > 0 && hasPerk(st, '성장 가속')) amount = Math.round(amount * 1.5);
    s.pt = Math.max(0, s.pt + amount);
    if (amount) log.push({ k: 'gain', t: `${name} 수련 +${amount}` });
    let guard = 0;
    while (s.rank < LIFE_RANKS.length - 1 && s.pt >= lifeNeed(st, s.rank) && guard++ < 20) {
        s.pt -= lifeNeed(st, s.rank);
        s.rank += 1;
        log.push({ k: 'rank', t: `${name} 랭크 ${lifeRankName(s.rank)}!` });
        if (LIFE_BONUS_AT.includes(s.rank)) {
            const stat = LIFE[name].stat;
            st.stats[stat] = Math.min(statCap(st), (st.stats[stat] || 15) + 3);
            log.push({ k: 'rank', t: `${stat} +3 (${name} 숙련 보너스)` });
        }
    }
    if (s.rank >= LIFE_RANKS.length - 1) s.pt = 0;
}

/** 주 클래스의 레벨·경험을 st.lv / st.exp 에 맞춘다 */
export function syncClass(st) {
    if (!st.classes || !st.cls || !st.classes[st.cls]) return;
    st.lv = st.classes[st.cls].lv;
    st.exp = st.classes[st.cls].exp;
}

function classGain(st, cls, amount, log, label) {
    const D = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    const c = st.classes[cls]; if (!c) return;
    c.exp = Math.max(0, c.exp + amount);
    if (label && amount) log.push({ k: amount >= 0 ? 'gain' : 'loss', t: `${label} ${amount >= 0 ? '+' : ''}${amount}` });
    let guard = 0;
    while (c.lv < CLASS_MAX && c.exp >= expNeed(st, c.lv) && guard++ < 50) {
        c.exp -= expNeed(st, c.lv);
        c.lv += 1;
        st.statPoints += D.lvPoints;
        if (cls === st.cls) { syncClass(st); st.hp = maxHP(st); st.mp = maxMP(st); }
        log.push({ k: 'rank', t: `${cls} Lv ${c.lv}! (능력 포인트 +${D.lvPoints})` });
    }
    if (c.lv >= CLASS_MAX) c.exp = 0;
}

/* ───────────────────────── 특화 (같은 클래스 안의 개인 강점) ───────────────────────── */

// 클래스별 흔한 특화 분야 (예시일 뿐, GM이 새 분야를 만들 수 있음)
export const FOCUS_HINTS = {
    전사: ['방패 수호', '양손 대검', '도끼 광전', '쌍수 무기', '맨몸 버티기'],
    검사: ['방패 검술', '쌍검', '찌르기 검술', '대검', '마검'],
    창술사: ['기마 창술', '도약 창술', '미늘창 제압', '투창'],
    격투가: ['타격', '잡기·관절기', '기공', '발차기', '지형 활용'],
    궁수: ['장궁', '석궁', '속사', '추적 사냥', '독화살'],
    도적: ['암살', '그림자술', '잠입·자물쇠', '호위', '독', '투척'],
    음유시인: ['음파 공격', '버프 노래', '디버프 노래', '현악기', '매혹·화술'],
    마법사: ['불 마법', '물 마법', '바람 마법', '땅 마법', '번개 마법', '얼음 마법', '빛 마법', '어둠 마법', '결계 마법', '마법 연구'],
    치유사: ['치유', '정화·퇴마', '축복', '결계', '의술'],
    정령술사: ['불의 정령', '물의 정령', '바람의 정령', '땅의 정령', '빛의 정령', '어둠의 정령', '번개의 정령', '얼음의 정령', '잠의 정령', '다중 계약'],
    소환사: ['마계 계약', '천계 계약', '심연 계약', '요정계 계약', '다중 소환'],
    테이머: ['늑대·개', '맹금류', '대형 마수', '탈것 조련', '기마'],
};
export const FOCUS_TIERS = [['성향', 0], ['특화', 30], ['정통', 100]];

export function focusNeed(st, tierIdx) {
    const D = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    return Math.round(FOCUS_TIERS[tierIdx][1] * D.expMult);
}
export function focusTier(st, pts) {
    let t = 0;
    for (let i = 0; i < FOCUS_TIERS.length; i++) if (pts >= focusNeed(st, i)) t = i;
    return t;
}
export const focusTierName = (i) => FOCUS_TIERS[i][0];

/** 판정 내용에 특화 분야의 낱말이 들어 있으면 보너스 */
const FOCUS_STOP = ['마법', '술', '기술', '전투', '의', '·'];
export function focusKeywords(name) {
    return String(name).split(/[\s·]+/).map(w => w.replace(/(마법|술|기|법)$/, '')).filter(w => w.length >= 2 && !FOCUS_STOP.includes(w));
}
export function focusBonus(st, what) {
    const f = st.classes?.[st.cls]?.focus || {};
    const text = nospace(what || '');
    if (!text) return { bonus: 0, name: null };
    let best = { bonus: 0, name: null };
    for (const [name, pts] of Object.entries(f)) {
        const tier = focusTier(st, pts);
        if (tier < 1) continue;
        if (focusKeywords(name).some(k => k && text.includes(nospace(k)))) {
            if (tier > best.bonus) best = { bonus: tier, name };
        }
    }
    return best;
}

function addFocus(st, cls, name, amount, log) {
    const c = st.classes[cls]; if (!c) return;
    c.focus = c.focus || {};
    const key = Object.keys(c.focus).find(k => nospace(k) === nospace(name)) || name.trim();
    const before = focusTier(st, c.focus[key] || 0);
    c.focus[key] = Math.max(0, (c.focus[key] || 0) + amount);
    const after = focusTier(st, c.focus[key]);
    if (amount) log.push({ k: amount > 0 ? 'gain' : 'loss', t: `${cls} · ${key} ${amount > 0 ? '+' : ''}${amount}` });
    if (after > before) log.push({ k: 'rank', t: `${cls} — ${key} ${focusTierName(after)}!` });
}

/* ───────────────────────── 기술 계보 · 숙련 · 깨달음 ───────────────────────── */

// [기술, 등급(1 기초·2 중급·3 상급·4 비전), 선행 기술, 설명]
export const SKILL_TREE = {
    전사: [
        ['방패 들기', 1, null, '방패를 세워 공격을 받아 낸다', '수호'], ['강타', 1, null, '온 힘을 실은 일격', '파괴'], ['기합', 1, null, '함성으로 자신을 다잡는다', '함성'],
        ['도발', 2, '방패 들기', '적의 시선을 자신에게 끈다', '수호'], ['철벽', 2, '방패 들기', '잠시 버티며 피해를 크게 줄인다', '수호'],
        ['회전베기', 2, '강타', '주위의 적을 한꺼번에 벤다', '파괴'], ['광폭화', 2, '강타', '피를 흘릴수록 강해진다', '파괴'],
        ['위압', 2, '기합', '노려보는 것만으로 적을 움츠러들게 한다', '함성'], ['격려', 2, '기합', '동료를 다그쳐 다시 일으킨다', '함성'],
        ['방패 강타', 3, '철벽', '방패로 들이받아 균형을 무너뜨린다', '수호'], ['불굴', 3, '도발', '쓰러질 일격을 한 번 버텨 낸다', '수호'],
        ['대지 가르기', 3, '회전베기', '땅을 내려쳐 충격파를 일으킨다', '파괴'], ['피의 갈증', 3, '광폭화', '벤 만큼 상처가 아문다', '파괴'],
        ['전장의 포효', 3, '격려', '아군 전체의 사기를 끌어올린다', '함성'], ['전열 지휘', 3, '위압', '진형을 짜고 싸움의 흐름을 읽는다', '함성'],
        ['난공불락', 4, '불굴', '어떤 공세에도 한 걸음도 물러서지 않는다', '수호'], ['파멸의 일격', 4, '대지 가르기', '성벽마저 무너뜨리는 일격', '파괴'], ['불패의 깃발', 4, '전장의 포효', '그가 서 있는 한 아군은 무너지지 않는다', '함성'],
        ['속성 일격', 2, null, '타고난 속성을 무기에 실어 내려친다', '깃듦', '적성'], ['속성 해방', 4, '속성 일격', '몸에 깃든 속성을 한꺼번에 터뜨린다', '깃듦', '적성']],
    검사: [
        ['연속 베기', 1, null, '빠른 세 번의 베기', '쾌검'], ['방패 막기', 1, null, '방패로 공격을 흘린다', '방패검'], ['기 모으기', 1, null, '검끝에 기를 모은다', '마검'],
        ['돌진 찌르기', 2, '연속 베기', '거리를 단숨에 좁힌다', '쾌검'], ['발도', 2, '연속 베기', '칼집에서 뽑는 순간 벤다', '쾌검'],
        ['반격', 2, '방패 막기', '막아 낸 직후 되받아친다', '방패검'], ['방패 밀치기', 2, '방패 막기', '방패로 밀어 자세를 무너뜨린다', '방패검'],
        ['검기', 2, '기 모으기', '검에 기를 실어 날린다', '마검'], ['검막', 2, '기 모으기', '검기로 막을 둘러 화살을 튕겨 낸다', '마검'],
        ['일섬', 3, '돌진 찌르기', '눈에 보이지 않는 한 칼', '쾌검'], ['잔상', 3, '발도', '움직임이 잔상으로 남는다', '쾌검'],
        ['수호의 맹세', 3, '반격', '곁의 동료를 대신 지킨다', '방패검'], ['기사의 일격', 3, '방패 밀치기', '방패 뒤에서 내지르는 정확한 일격', '방패검'],
        ['비검', 3, '검기', '검기를 날려 먼 적을 벤다', '마검'], ['검기 폭발', 3, '검막', '두른 검기를 사방으로 터뜨린다', '마검'],
        ['무명검', 4, '일섬', '베였다는 것조차 모르게 하는 검', '쾌검'], ['성채의 검', 4, '수호의 맹세', '검과 방패가 하나 된 철벽', '방패검'], ['성검 해방', 4, '비검', '검에 깃든 빛을 해방한다', '마검'],
        ['속성 검', 2, null, '검날에 타고난 속성을 두른다', '깃듦', '적성'], ['원소검', 4, '속성 검', '속성 그 자체를 칼날로 벼린다', '깃듦', '적성']],
    창술사: [
        ['꿰뚫기', 1, null, '창끝으로 깊게 찌른다'], ['연속 찌르기', 2, '꿰뚫기', '다섯 번의 빠른 찌르기'], ['관통 일격', 3, '연속 찌르기', '갑옷째 꿰뚫는다'], ['천공', 4, '관통 일격', '일직선 위의 모든 것을 꿰뚫어 성문에 구멍을 낸다'],
        ['도약', 1, null, '높이 뛰어올라 내리꽂는다', '용기사'], ['낙하 찌르기', 2, '도약', '떨어지는 힘을 창끝에 모두 싣는다', '용기사'], ['공중 제비', 2, '도약', '공중에서 몸을 틀어 공격을 피한다', '용기사'],
        ['용의 비상', 3, '낙하 찌르기', '구름 높이 솟구쳤다가 유성처럼 낙하한다', '용기사'], ['천룡창', 4, '용의 비상', '하늘을 가르는 창격 — 용의 비늘도 꿰뚫는다', '용기사'],
        ['기승 돌격', 1, null, '말 위에서 창을 겨눠 돌진한다', '기마창'], ['창기 돌파', 2, '기승 돌격', '적진을 일직선으로 꿰뚫고 지나간다', '기마창'], ['마상 회전', 2, '기승 돌격', '말을 돌리며 주위를 휩쓴다', '기마창'],
        ['기사의 돌격', 3, '창기 돌파', '기마대의 선두에서 적의 대열을 무너뜨린다', '기마창'], ['천군 돌격', 4, '기사의 돌격', '그의 돌격 앞에서는 성벽도 대열도 버티지 못한다', '기마창'],
        ['쓸어내기', 1, null, '창대를 휘둘러 넘어뜨린다', '장창'], ['창벽', 2, '쓸어내기', '창을 세워 돌진을 막는다', '장창'], ['거리 재기', 2, '쓸어내기', '창끝의 거리 안으로 한 발짝도 들이지 않는다', '장창'],
        ['기마 저지', 3, '창벽', '돌진하는 기마와 거대 마물을 멈춰 세운다', '장창'], ['철창진', 4, '기마 저지', '홀로 세운 창 하나가 한 부대를 막아 낸다', '장창'],
        ['속성 창격', 2, null, '창끝에 타고난 속성을 싣는다', '깃듦', '적성'], ['원소창', 4, '속성 창격', '속성이 창이 되어 비처럼 쏟아진다', '깃듦', '적성']],
    격투가: [
        ['연타', 1, null, '숨 돌릴 틈 없는 주먹'], ['받아넘기기', 1, null, '상대의 힘을 흘려 넘어뜨린다'], ['기공 호흡', 1, null, '숨을 골라 체력을 되찾는다'], ['맨몸 적응', 1, null, '무기도 갑옷도 없이, 어디서든 몸이 먼저 적응한다'],
        ['돌려차기', 2, '연타', '체중을 실은 발차기'], ['철산고', 2, '연타', '어깨로 들이받아 바위도 깨뜨린다'], ['메치기', 2, '받아넘기기', '자기보다 큰 상대도 들어 땅에 메친다'], ['관절 꺾기', 2, '받아넘기기', '관절을 잡아 꼼짝 못 하게 한다'],
        ['권기', 2, '기공 호흡', '주먹에 모은 기를 쏘아낸다'], ['금강신', 2, '기공 호흡', '몸을 강철처럼 단단하게'], ['지형 활용', 2, '맨몸 적응', '벽·물·진흙·좁은 통로 — 주변 모든 것이 무기가 된다'],
        ['진각', 3, '철산고', '땅을 구르면 대지가 울려 주위가 휘청인다'], ['백열권', 3, '돌려차기', '눈에 보이지 않는 연속 타격'], ['역류', 3, '메치기', '상대의 힘을 그대로 되돌린다'], ['경혈 찌르기', 3, '권기', '기의 흐름을 끊어 움직임을 막는다'],
        ['불패의 몸', 3, '지형 활용', '물속이든 빙판이든 절벽이든, 그는 넘어지지 않는다'], ['내기 순환', 3, '금강신', '기를 돌려 상처를 빠르게 낫게 한다'],
        ['무상권', 4, '백열권', '한 점에 모든 것을 실어 성문도 맨손으로 부순다'], ['유수', 4, '역류', '물처럼 흘러 어떤 공격도 닿지 않는다'], ['천지합일', 4, '경혈 찌르기', '천지의 기와 하나 되어, 맨손이 곧 천하의 병기가 된다'],
        ['속성 권', 2, null, '주먹과 발에 타고난 속성을 두른다', '깃듦', '적성'], ['원소 강림', 4, '속성 권', '온몸이 속성의 기운으로 타오른다 (땅이면 대지 그 자체가 된다)', '깃듦', '적성']],
    궁수: [
        ['추적', 1, null, '흔적을 읽고 사냥감을 쫓는다'], ['매의 눈', 2, '추적', '먼 곳과 숨은 것을 꿰뚫어 본다'], ['덫 놓기', 2, '추적', '길목에 덫을 놓는다'], ['독화살', 2, '추적', '화살촉에 독을 바른다'],
        ['조준 사격', 1, null, '숨을 멈추고 멀리, 정확히 쏜다', '장궁'], ['강궁', 2, '조준 사격', '사람 키만 한 활을 끝까지 당겨 갑옷째 꿰뚫는다', '장궁'], ['일제 사격', 2, '조준 사격', '하늘 높이 쏘아 올려 먼 대열 위로 떨어뜨린다', '장궁'],
        ['저격', 3, '강궁', '언덕 너머 적장의 급소를 맞힌다', '장궁'], ['화살비', 3, '일제 사격', '하늘을 덮는 화살이 쏟아진다', '장궁'], ['필중의 한 발', 4, '저격', '산 하나 너머의 표적도 결코 빗나가지 않는다', '장궁'],
        ['석궁 장전', 1, null, '석궁을 빠르게 감아 장전한다', '석궁'], ['철시', 2, '석궁 장전', '쇠 볼트로 방패와 갑옷을 뚫는다', '석궁'], ['매복 사격', 2, '석궁 장전', '숨어서 기다렸다가 단 한 발로 끝낸다', '석궁'],
        ['연발 장치', 3, '철시', '개조한 석궁으로 볼트를 연달아 쏜다', '석궁'], ['공성 볼트', 3, '매복 사격', '성문과 거대 마물의 비늘을 꿰뚫는 한 발', '석궁'], ['용살의 볼트', 4, '공성 볼트', '용의 심장조차 꿰뚫는다고 전해지는 한 발', '석궁'],
        ['연사', 1, null, '빠르게 두세 발을 날린다', '일반궁'], ['이동 사격', 2, '연사', '달리고 구르면서도 쏜다', '일반궁'], ['견제 사격', 2, '연사', '다리를 노려 발을 묶는다', '일반궁'],
        ['곡사', 3, '이동 사격', '화살이 휘어 엄폐물 뒤의 적을 맞힌다', '일반궁'], ['분열 화살', 3, '견제 사격', '한 발이 여럿으로 갈라진다', '일반궁'], ['천궁', 4, '곡사', '활을 쥔 그를 상대로는 숨을 곳도 피할 곳도 없다', '일반궁'],
        ['속성 화살', 2, null, '화살에 타고난 속성을 실어 보낸다', '깃듦', '적성'], ['원소의 화살', 4, '속성 화살', '속성 그 자체가 화살이 되어 날아간다', '깃듦', '적성']],
    도적: [
        ['기습', 1, null, '눈치채기 전에 찌른다'], ['은신', 1, null, '기척을 지우고 숨는다'], ['자물쇠 따기', 1, null, '잠긴 것을 연다'],
        ['독 바르기', 2, '기습', '칼날에 독을 입힌다'], ['쌍검 난무', 2, '기습', '두 단검으로 몰아친다'], ['연막', 2, '은신', '연기를 뿌리고 사라진다'], ['함정 해제', 2, '자물쇠 따기', '함정을 찾아 무력화한다'],
        ['소매치기', 2, '자물쇠 따기', '눈치채지 못하게 훔친다'], ['호위의 눈', 2, '은신', '주인을 노리는 자의 기척을 먼저 알아챈다'],
        ['급소 찌르기', 3, '독 바르기', '단숨에 숨통을 노린다'], ['독 조합', 3, '독 바르기', '흔적이 남지 않는 독을 만든다'], ['변장', 3, '소매치기', '전혀 다른 사람이 된다'], ['그림자 호위', 3, '호위의 눈', '보이지 않는 곳에서 주인을 지킨다'],
        ['암살', 4, '급소 찌르기', '단 한 번의 확실한 죽음 — 성 안 깊숙이 잠든 자라도'], ['천의 얼굴', 4, '변장', '누구도 그의 진짜 얼굴을 모른다'],
        ['그림자 숨기', 1, null, '그림자 속으로 몸을 가라앉힌다', '어둠'], ['그림자 걸음', 2, '그림자 숨기', '그림자에서 그림자로 옮겨 간다', '어둠'], ['그림자 묶기', 2, '그림자 숨기', '상대의 그림자를 밟아 발을 묶는다', '어둠'],
        ['그림자 분신', 3, '그림자 걸음', '그림자가 또 하나의 자신이 되어 움직인다', '어둠'], ['밤의 장막', 3, '그림자 묶기', '한 구역을 완전한 어둠으로 덮는다', '어둠'], ['그림자 그 자체', 4, '그림자 분신', '누구의 눈에도, 기억에도 남지 않는다', '어둠'],
        ['속성 칼날', 2, null, '단검에 타고난 속성을 입힌다', '깃듦', '적성'], ['원소 잠행', 4, '속성 칼날', '속성에 몸을 숨겨 스며든다', '깃듦', '적성']],
    음유시인: [
        ['옛이야기', 1, null, '전설과 소문을 기억해 낸다'], ['즉흥시', 2, '옛이야기', '그 자리에서 노래를 지어 웃기고 울린다'], ['잊힌 노래', 3, '즉흥시', '고대의 노래로 봉인과 유적에 말을 건다'],
        ['울림', 1, null, '소리를 모아 한 점을 때린다', '음파'], ['음파 칼날', 2, '울림', '날카로운 고음이 살을 벤다', '음파'], ['공명 파쇄', 2, '울림', '갑옷과 무기를 울려 부순다', '음파'],
        ['절규', 3, '음파 칼날', '귀를 찢는 소리로 무리를 한꺼번에 쓰러뜨린다', '음파'], ['진동 붕괴', 3, '공명 파쇄', '바위와 벽을 울려 무너뜨린다', '음파'], ['종말의 화음', 4, '절규', '그 화음이 울리면 성벽도 군대도 무너진다', '음파'],
        ['용기의 노래', 1, null, '동료의 기운을 북돋는다', '선율'], ['자장가', 1, null, '적을 졸리게 한다', '선율'],
        ['회복의 선율', 2, '용기의 노래', '상처의 아픔을 덜고 숨을 고르게 한다', '선율'], ['진군가', 2, '용기의 노래', '아군의 움직임이 빨라진다', '선율'],
        ['불협화음', 2, '자장가', '적의 박자를 흐트러뜨려 손발이 엉키게 한다', '선율'], ['매혹의 노래', 2, '자장가', '듣는 이의 마음을 붙잡는다', '선율'],
        ['영웅의 찬가', 3, '진군가', '아군 모두가 제 실력 이상을 낸다', '선율'], ['진혼곡', 3, '불협화음', '적의 투지를 꺾고 망자를 잠재운다', '선율'],
        ['영웅 서사시', 4, '영웅의 찬가', '노래가 전설이 되어 쓰러진 이도 다시 일어선다', '선율'], ['세이렌의 노래', 4, '진혼곡', '듣는 모든 적이 넋을 잃고 무기를 떨어뜨린다', '선율'],
        ['속성의 노래', 2, null, '노래에 타고난 속성의 울림을 싣는다', '깃듦', '적성'], ['원소 교향곡', 4, '속성의 노래', '속성이 노래에 맞춰 춤춘다', '깃듦', '적성']],
    마법사: [
        ['마력탄', 1, null, '무속성 마력을 쏜다'], ['마력 방벽', 1, null, '마력의 막으로 막는다'],
        ['불씨', 1, null, '손끝에 불꽃을 피운다', '불'], ['물의 채찍', 1, null, '물줄기를 채찍처럼 휘두른다', '물'], ['바람 칼날', 1, null, '날카로운 바람을 날린다', '바람'], ['돌 탄환', 1, null, '돌덩이를 쏘아낸다', '땅'], ['전격', 1, null, '손끝에서 튄 전격이 상대를 마비시킨다', '번개'], ['서리 바늘', 1, null, '얼음 바늘을 흩뿌린다', '얼음'], ['섬광', 1, null, '눈부신 빛으로 눈을 멀게 한다', '빛'],
        ['화염구', 2, '불씨', '불덩이를 던진다', '불'], ['물의 감옥', 2, '물의 채찍', '물로 상대를 감싸 움직임과 숨을 막는다', '물'], ['회오리', 2, '바람 칼날', '회오리바람으로 휘감아 띄운다', '바람'], ['대지의 벽', 2, '돌 탄환', '땅을 솟구쳐 벽을 세운다', '땅'], ['번개', 2, '전격', '공기를 갈라 번개를 내리친다', '번개'], ['얼음 창', 2, '서리 바늘', '얼음을 벼려 창으로 꿰뚫는다', '얼음'], ['빛의 창', 2, '섬광', '빛을 엮어 창으로 던진다', '빛'], ['마법 해제', 2, '마력 방벽', '상대의 마법을 풀어 버린다'],
        ['화염 폭풍', 3, '화염구', '넓은 범위를 불태운다', '불'], ['격류', 3, '물의 감옥', '거센 물살로 쓸어 버린다', '물'], ['폭풍', 3, '회오리', '거센 폭풍을 부른다', '바람'], ['지진', 3, '대지의 벽', '땅을 뒤흔든다', '땅'], ['연쇄 번개', 3, '번개', '번개가 적에서 적으로 건너뛴다', '번개'], ['빙결 감옥', 3, '얼음 창', '상대를 얼음 속에 가둔다', '얼음'], ['심판의 빛', 3, '빛의 창', '하늘에서 빛기둥이 내리꽂힌다', '빛'], ['시간 지연', 3, '마법 해제', '주변의 흐름을 잠시 느리게'],
        ['메테오', 4, '화염 폭풍', '하늘에서 운석을 떨어뜨린다', '불'], ['대해류', 4, '격류', '바다가 밀려와 모든 것을 삼킨다', '물'], ['태풍', 4, '폭풍', '하늘을 찢는 태풍을 일으킨다', '바람'], ['대지 붕괴', 4, '지진', '땅이 갈라지고 무너진다', '땅'], ['천뢰', 4, '연쇄 번개', '하늘의 벼락을 부른다', '번개'], ['절대 영도', 4, '빙결 감옥', '모든 것을 멈추는 냉기', '얼음'], ['여명', 4, '심판의 빛', '밤조차 대낮으로 바꾸는 빛', '빛'],
        // 어둠: 금기 — 서점에 없고, 금서·그림자 길드·깨달음으로만
        ['그림자 속박', 2, null, '그림자로 발을 묶는다', '어둠', '금기'], ['생명 흡수', 3, '그림자 속박', '상대의 생기를 빨아들인다', '어둠', '금기'], ['공허', 4, '생명 흡수', '모든 것을 삼키는 어둠', '어둠', '금기']],
    치유사: [
        ['치유', 1, null, '상처를 아물게 한다', '치유'], ['정화', 1, null, '독과 저주를 씻어 낸다', '정화'], ['축복', 1, null, '동료를 빛으로 감싼다', '수호'],
        ['재생', 2, '치유', '시간이 흐르며 상처가 아문다', '치유'], ['응급 기도', 2, '치유', '즉시 피를 멎게 한다', '치유'],
        ['성스러운 빛', 2, '정화', '언데드를 태운다', '정화'], ['퇴마', 2, '정화', '깃든 악령을 몰아낸다', '정화'],
        ['보호막', 2, '축복', '빛의 막으로 동료를 감싼다', '수호'], ['평온', 2, '축복', '공포와 혼란을 가라앉힌다', '수호'],
        ['광역 치유', 3, '재생', '주위 모두를 치유한다', '치유'], ['성화', 3, '성스러운 빛', '빛의 불꽃으로 불사자를 태운다', '정화'], ['성역', 3, '보호막', '악한 것이 들어오지 못하는 결계', '수호'],
        ['소생의 기도', 4, '광역 치유', '쓰러진 이를 다시 일으킨다', '치유'], ['여신의 철퇴', 4, '성화', '하늘에서 심판의 빛이 내리꽂힌다', '정화'], ['여신의 가호', 4, '성역', '죽음조차 한 번 막아 내는 축복', '수호'],
        ['속성의 기도', 2, null, '기도에 타고난 속성의 힘이 섞인다', '깃듦', '적성'], ['원소의 축복', 4, '속성의 기도', '속성의 가호로 동료를 감싼다', '깃듦', '적성']],
    정령술사: [
        ['정령 교감', 1, null, '주변 정령의 목소리를 듣는다'], ['정령 계약', 1, null, '정령과 이름을 주고받아 계약한다'], ['정령의 눈', 2, '정령 교감', '정령의 감각으로 멀리 본다'],
        ['다중 계약', 2, '정령 계약', '여러 속성의 정령과 함께한다'], ['정령 융합', 3, '다중 계약', '두 정령을 하나로 합쳐 새로운 힘을 낸다'], ['정령왕의 계약', 4, '정령 융합', '정령왕(불 샐리온 · 물 엘라임 · 바람 실피드 · 땅 노아스 …) 가운데 하나와 계약한다'],
        ['불의 정령 부르기', 1, null, '하급 불의 정령 샐러맨더에게 부탁한다', '불'], ['불꽃 두르기', 2, '불의 정령 부르기', '불의 정령이 몸과 무기를 감싼다', '불'], ['화염의 춤', 3, '불꽃 두르기', '불의 정령이 춤추며 일대를 불바다로 만든다', '불'], ['불의 최상급 정령 샐레아나', 4, '화염의 춤', '최상급 불의 정령 샐레아나가 현현한다', '불'],
        ['물의 정령 부르기', 1, null, '하급 물의 정령 운디네에게 부탁한다', '물'], ['치유의 샘', 2, '물의 정령 부르기', '물의 정령이 상처를 씻어 낫게 한다', '물'], ['해일', 3, '치유의 샘', '물의 정령이 거대한 물결을 일으킨다', '물'], ['물의 최상급 정령 엘레스트라', 4, '해일', '최상급 물의 정령 엘레스트라가 현현한다', '물'],
        ['바람의 정령 부르기', 1, null, '하급 바람의 정령 실프에게 부탁한다', '바람'], ['바람 타기', 2, '바람의 정령 부르기', '바람의 정령이 몸을 띄워 나른다', '바람'], ['폭풍의 춤', 3, '바람 타기', '바람의 정령이 폭풍을 일으킨다', '바람'], ['바람의 최상급 정령 실레스틴', 4, '폭풍의 춤', '최상급 바람의 정령 실레스틴이 현현한다', '바람'],
        ['땅의 정령 부르기', 1, null, '하급 땅의 정령 놈에게 부탁한다', '땅'], ['대지의 갑옷', 2, '땅의 정령 부르기', '땅의 정령이 바위 갑옷을 입혀 준다', '땅'], ['바위 거인', 3, '대지의 갑옷', '땅의 정령이 바위 거인이 되어 싸운다', '땅'], ['땅의 최상급 정령 노에아넨', 4, '바위 거인', '최상급 땅의 정령 노에아넨이 현현한다', '땅'],
        ['빛의 정령 부르기', 1, null, '하급 빛의 정령 루미아에게 부탁한다 — 어둠을 밝히고 길을 비춘다', '빛', '희귀'], ['정화의 빛', 2, '빛의 정령 부르기', '빛의 정령이 저주와 독을 씻어 낸다', '빛', '희귀'], ['눈부신 장막', 3, '정화의 빛', '빛의 정령이 일대를 눈부시게 덮어 적의 눈을 멀게 하고 아군을 지킨다', '빛', '희귀'], ['빛의 최상급 정령 니트라스', 4, '눈부신 장막', '최상급 빛의 정령 니트라스가 현현한다', '빛', '희귀'],
        ['어둠의 정령 부르기', 1, null, '하급 그림자의 정령 섀디에게 부탁한다 — 그림자에 숨고 소리를 삼킨다', '어둠', '희귀'], ['그림자 건너기', 2, '어둠의 정령 부르기', '어둠의 정령이 그림자에서 그림자로 몸을 옮겨 준다', '어둠', '희귀'], ['정령의 밤', 3, '그림자 건너기', '어둠의 정령이 한낮을 밤으로 덮어 적의 감각을 빼앗는다', '어둠', '희귀'], ['어둠의 최상급 정령 레이든', 4, '정령의 밤', '최상급 그림자의 정령 레이든이 현현한다', '어둠', '희귀'],
        ['번개의 정령 부르기', 1, null, '하급 번개의 정령 라이키에게 부탁한다 — 번쩍이는 전격으로 상대를 마비시킨다', '번개', '희귀'], ['뇌격 두르기', 2, '번개의 정령 부르기', '번개의 정령이 무기와 몸에 뇌전을 두른다', '번개', '희귀'], ['천둥의 춤', 3, '뇌격 두르기', '번개의 정령이 춤추며 벼락을 비처럼 내린다', '번개', '희귀'], ['번개의 최상급 정령 라이제아', 4, '천둥의 춤', '최상급 번개의 정령 라이제아가 현현한다', '번개', '희귀'],
        ['얼음의 정령 부르기', 1, null, '하급 얼음의 정령 니비에게 부탁한다 — 물을 얼리고 냉기를 뿜는다', '얼음', '희귀'], ['서리 갑주', 2, '얼음의 정령 부르기', '얼음의 정령이 서리 갑옷을 입혀 준다', '얼음', '희귀'], ['눈보라의 춤', 3, '서리 갑주', '얼음의 정령이 일대에 눈보라를 일으킨다', '얼음', '희귀'], ['얼음의 최상급 정령 그뮤페인', 4, '눈보라의 춤', '최상급 얼음의 정령 그뮤페인이 현현한다', '얼음', '희귀'],
        ['잠의 정령 부르기', 1, null, '하급 잠의 정령 솜니아에게 부탁한다 — 주변에 졸음을 퍼뜨린다', '잠', '희귀'], ['잠의 노래', 2, '잠의 정령 부르기', '잠의 정령이 노래해 주변을 깊은 잠에 빠뜨린다', '잠', '희귀'], ['꿈 건너기', 3, '잠의 노래', '잠든 이의 꿈속으로 들어가 이야기를 나눈다', '잠', '희귀'], ['잠의 최상급 정령 니드라엘', 4, '꿈 건너기', '최상급 잠의 정령 니드라엘이 현현한다', '잠', '희귀']],
    소환사: [
        ['소환진', 1, null, '계약한 존재를 부를 소환진을 그린다'], ['계약의 언어', 1, null, '이계의 존재와 말을 나눈다'], ['역소환', 2, '소환진', '불러낸 존재를 즉시 돌려보낸다'],
        ['대가 감정', 2, '계약의 언어', '대가가 얼마나 무거운지 꿰뚫어 본다'], ['이중 소환', 3, '역소환', '두 세계의 존재를 동시에 부른다'], ['진명 속박', 3, '대가 감정', '존재의 참된 이름으로 묶는다'], ['문 열기', 4, '이중 소환', '이계로 통하는 문 자체를 연다'],
        ['악마 소환', 1, null, '마계의 하위 악마를 부른다', '마계'], ['지옥불 차용', 2, '악마 소환', '계약한 악마의 불꽃을 빌려 쓴다', '마계'], ['악마의 군세', 3, '지옥불 차용', '악마 무리를 한꺼번에 부른다', '마계'], ['마계 대공 계약', 4, '악마의 군세', '마계의 대공과 계약한다 — 대가는 무겁다', '마계'],
        ['성수 소환', 1, null, '천계의 작은 성수를 부른다', '천계'], ['천상의 깃', 2, '성수 소환', '하늘의 깃털로 상처와 저주를 씻는다', '천계'], ['성창 강하', 3, '천상의 깃', '천계의 창이 하늘에서 내리꽂힌다', '천계'], ['대천사 강림', 4, '성창 강하', '천계의 대천사가 내려온다 — 교회가 가만있지 않는다', '천계'],
        ['심연 소환', 1, null, '심연의 하위 존재를 부른다', '심연'], ['공허의 눈', 2, '심연 소환', '보이지 않는 것, 숨겨진 것을 본다', '심연'], ['크라켄의 팔', 3, '공허의 눈', '거대한 촉수가 모든 것을 끌어내린다', '심연'], ['리바이어던의 그림자', 4, '크라켄의 팔', '심연의 군주가 그림자를 드리운다', '심연'],
        ['요정 소환', 1, null, '요정계의 장난꾸러기를 부른다', '요정계'], ['요정의 장난', 2, '요정 소환', '환각을 보여 길을 잃게 한다', '요정계'], ['요정 고리', 3, '요정의 장난', '버섯 고리를 통해 먼 곳으로 건너간다', '요정계'], ['요정 여왕의 연회', 4, '요정 고리', '시간마저 비트는 요정 여왕의 초대', '요정계']],
    테이머: [
        ['교감', 1, null, '짐승의 마음을 읽는다'], ['길들이기', 1, null, '먹이와 인내로 짐승을 길들인다'], ['명령', 2, '길들이기', '말 한마디로 동반자를 부린다'],
        ['감각 공유', 2, '교감', '동반자의 눈과 코를 빌린다'], ['마음 잇기', 3, '감각 공유', '동반자와 생각이 이어진다'], ['일심동체', 4, '마음 잇기', '동반자와 하나 되어 움직인다'],
        ['들짐승 다루기', 1, null, '늑대·개·여우를 다룬다', '들짐승'], ['합동 공격', 2, '들짐승 다루기', '동반자와 호흡을 맞춰 공격한다', '들짐승'], ['무리 사냥', 3, '합동 공격', '무리가 하나처럼 움직여 사냥한다', '들짐승'], ['짐승의 왕', 4, '무리 사냥', '숲의 모든 짐승이 고개를 숙인다', '들짐승'],
        ['매 날리기', 1, null, '매를 날려 정찰하고 사냥한다', '맹금'], ['하늘의 눈', 2, '매 날리기', '맹금의 눈으로 땅 위를 내려다본다', '맹금'], ['급강하', 3, '하늘의 눈', '맹금이 번개처럼 내리꽂힌다', '맹금'], ['폭풍새의 주인', 4, '급강하', '로크 같은 거대한 맹금을 부린다', '맹금'],
        ['마수 진정', 1, null, '날뛰는 마물을 가라앉힌다', '마수'], ['마수 길들이기', 2, '마수 진정', '위험한 마물도 동반자로 만든다', '마수'], ['야성 해방', 3, '마수 길들이기', '동반자의 본성을 끌어낸다', '마수'], ['진화 유도', 4, '야성 해방', '동반자가 한 단계 위의 존재로 거듭나게 한다', '마수'],
        ['말 다루기', 1, null, '말과 소, 탈것이 될 짐승을 다룬다', '탈것'], ['기승', 2, '말 다루기', '길들인 짐승을 타고 달린다', '탈것'], ['탈것 조련', 2, '말 다루기', '남이 탈 탈것을 길러 빌려주거나 판다', '탈것'],
        ['비행 탈것', 3, '탈것 조련', '그리폰·히포그리프처럼 하늘을 나는 탈것을 길들인다', '탈것'], ['기마대의 조련사', 4, '비행 탈것', '기사단 하나를 통째로 태울 탈것을 길러 낸다', '탈것']],
};
export const SKILL_TIER_NAME = ['', '기초', '중급', '상급', '비전'];

export const ELEMENTS = ['불', '물', '바람', '땅', '번개', '얼음', '빛', '어둠'];
/** 정령 이름 — 등급별 기본 이름 (하급·중급·상급·최상급·정령왕). 계약자가 따로 이름을 지어 줄 수 있다 */
export const SPIRIT_GRADES = ['하급', '중급', '상급', '최상급', '정령왕'];
export const SPIRIT_NAMES = {
    물: ['운디네', '운다인', '엔다이론', '엘레스트라', '엘라임'], 바람: ['실프', '실라페', '실라이론', '실레스틴', '실피드'],
    불: ['샐러맨더', '샐리스트', '샐라임', '샐레아나', '샐리온'], 땅: ['놈', '노임', '노에스', '노에아넨', '노아스'],
    // 희귀 정령 — 라틴·그리스·산스크리트 어원 (최상급은 처음 정한 이름 그대로)
    빛: ['루미아', '루미엔', '루미너스', '니트라스', '헬리루미온'],
    어둠: ['섀디', '섀이든', '녹테론', '레이든', '에레보녹스'],
    번개: ['라이키', '라이덴', '라이너스', '라이제아', '제우라이온'],  // 뇌전(雷電)·제우스
    얼음: ['니비', '니벨린', '니벨하임', '그뮤페인', '스카프로온'],
    잠: ['솜니아', '소니엔', '세니벨라', '니드라엘', '모르드리온'],
};
export const SPIRIT_ELEMS = ['불', '물', '바람', '땅', '빛', '어둠', '번개', '얼음', '잠'];
export const RARE_SPIRITS = ['빛', '어둠', '번개', '얼음', '잠'];
export function spiritBaseName(elem, grade = 0) { const v = SPIRIT_NAMES[elem]; if (!v) return ''; return Array.isArray(v) ? v[Math.min(grade, 4)] : v; }
/** "하급 불의 정령 샐러맨더" */
export function spiritTitle(elem, grade = 0) { if (!SPIRIT_NAMES[elem]) return ''; const g = SPIRIT_GRADES[Math.min(grade, 4)]; return grade >= 4 ? `${elem === '어둠' ? '그림자' : elem}의 정령왕 ${spiritBaseName(elem, 4)}` : `${g} ${elem === '어둠' ? '그림자' : elem}의 정령 ${spiritBaseName(elem, grade)}`; }
/* ── 정령의 격 — 새로 맺을 수 있는 정령의 등급과 정령왕 ──
   · 정령은 자기보다 격이 낮은 술사에게 응하지 않는다: 새로 계약할 수 있는 등급 = 내가 키운 정령 중 가장 높은 등급
   · 정령왕은 속성마다 하나뿐인 존재. 그 속성의 정령을 최상급까지 키우고(유대 90 이상) 비전 「정령왕의 계약」을 깨달으면
     그 정령이 '왕의 자리'로 안내한다. 정령왕과의 계약은 평생 한 번 — 단, 특화 '다중 계약'이 정통에 이르면 여러 왕과 맺을 수 있다 */
export function spiritGradeOf(text = '', elem = '') {
    const t = String(text || '');
    if (/정령왕/.test(t)) return { grade: 4, elem: elem || SPIRIT_ELEMS.find(e => SPIRIT_NAMES[e][4] && t.includes(SPIRIT_NAMES[e][4])) || elem };
    for (const e of (elem && SPIRIT_NAMES[elem] ? [elem] : SPIRIT_ELEMS)) {
        const i = SPIRIT_NAMES[e].findIndex(n => t.includes(n));
        if (i >= 0) return { grade: i, elem: e };
    }
    const g = /최상급/.test(t) ? 3 : /상급/.test(t) ? 2 : /중급/.test(t) ? 1 : 0;
    return { grade: g, elem };
}
export const spiritCap = (st) => Math.max(0, ...(st.companions || []).filter(c => c.kind === '정령').map(c => c.king ? 3 : Math.min(3, stageIdx(c))));
export const spiritKings = (st) => (st.companions || []).filter(c => c.kind === '정령' && c.king);
export function multiKingOk(st) {
    const pts = st.classes?.정령술사?.focus?.['다중 계약'] || 0;
    return focusTier(st, pts) >= 2;
}
/** 정령왕을 만나러 갈 수 있는지 — {ok, guide(안내할 최상급 정령), why[]} */
export function kingReady(st, elem) {
    const why = [];
    if (!st.cskills?.['정령왕의 계약']) why.push('비전 「정령왕의 계약」을 아직 깨닫지 못함');
    const pool = (st.companions || []).filter(c => c.kind === '정령' && !c.king && stageIdx(c) >= 3 && (!elem || c.elem === elem));
    const guide = pool.find(c => c.bond >= 90) || null;
    if (!pool.length) why.push(`${elem ? `${elem === '어둠' ? '그림자' : elem} 속성 ` : ''}최상급 정령이 없음`);
    else if (!guide) why.push('최상급 정령과의 유대가 90에 못 미침');
    if (elem && spiritKings(st).some(k => k.elem === elem)) why.push('이미 그 속성의 정령왕과 계약함');
    else if (spiritKings(st).length && !multiKingOk(st)) why.push("정령왕과는 이미 계약함 — 또 맺으려면 특화 '다중 계약'이 정통이어야 함");
    return { ok: !why.length, guide, why };
}
export const ELEM_DESC = {
    불: '열정과 파괴. 화염·폭발', 물: '흐름과 치유. 물·안개', 바람: '자유와 속도. 바람·폭풍',
    번개: '순간과 관통. 벼락·전격 — 무기에 실으면 갑옷을 꿰뚫는다', 얼음: '정지와 보존. 냉기·빙결 — 무기에 실으면 상대를 얼려 둔하게 한다',
    땅: '인내와 수호. 바위·대지', 빛: '정화와 축복. 섬광·신성', 어둠: '은밀과 금기. 그림자·흡수 (교회가 경계한다)',
};
const ELEM_WORDS = {
    불: ['불', '화염', '불꽃', '열기', '폭발', '태우'], 물: ['물', '해일', '물결', '안개', '격류'], 바람: ['바람', '폭풍', '돌풍', '회오리', '태풍'],
    번개: ['번개', '벼락', '뇌격', '전격', '천둥', '뇌전'], 얼음: ['얼음', '냉기', '빙결', '서리', '얼려', '얼리', '눈보라'],
    땅: ['땅', '대지', '돌', '바위', '흙', '지진'], 빛: ['빛', '섬광', '신성', '성스러', '광휘'], 어둠: ['어둠', '그림자', '암흑', '흡수', '저주'],
};
export const hasAffinity = (st, e) => (st.affinity || []).includes(e);
export function elemOfText(text) {
    const t = String(text || '');
    return ELEMENTS.filter(e => ELEM_WORDS[e].some(w => t.includes(w)));
}
/** 이름으로 정해지는 '마력 측정' 결과 (같은 이름이면 늘 같은 적성) */
export function measureAffinity(name, n = 1) {
    const r = rng(hashStr(`affinity|${name}`));
    const pool = [...ELEMENTS];
    const out = [];
    while (out.length < n && pool.length) {
        const w = pool.map(e => e === '어둠' ? 0.5 : e === '빛' ? 0.8 : e === '번개' || e === '얼음' ? 0.7 : 1);
        let x = r() * w.reduce((a, b) => a + b, 0);
        let i = 0; for (; i < pool.length; i++) { x -= w[i]; if (x <= 0) break; }
        out.push(pool.splice(Math.min(i, pool.length - 1), 1)[0]);
    }
    return out;
}
/* ── 클래스 발현 난이도: 일반 직업 < 사제 < 마법사 < 테이머 < 정령술사 < 소환사 ── */
export const RARITY = [
    ['흔함', '수련하면 누구나 닿는 길. 대부분 무속성으로, 순수한 무기술과 몸으로 싸운다.'],
    ['드묾', '빛의 여신의 부름에 응답한 자. 신앙과 소명이 있어야 기적이 일어난다.'],
    ['귀함', '속성 마력을 타고나야 한다. 적성이 있는 사람은 백 명에 하나 남짓.'],
    ['희귀', '짐승이 먼저 마음을 여는 자질. 가르친다고 되는 일이 아니다.'],
    ['매우 희귀', '정령이 보이는 눈. 천 명에 하나도 드물다.'],
    ['전설적', '이계의 문을 감지하는 자. 한 세대에 손꼽을 만큼.'],
];
export const CLASS_RARITY = { 전사: 0, 검사: 0, 창술사: 0, 격투가: 0, 궁수: 0, 도적: 0, 음유시인: 0, 치유사: 1, 마법사: 2, 테이머: 3, 정령술사: 4, 소환사: 5 };
export const classRarity = (c) => CLASS_RARITY[c] ?? 0;
export const rarityName = (c) => RARITY[classRarity(c)][0];
/** 속성 적성이 있어야만 발현하는 클래스 */
export const NEEDS_AFFINITY = ['마법사', '정령술사'];
const MAGIC_BORN = ['마법사', '정령술사', '소환사'];
export const maxAffinity = (diff) => diff === 'easy' ? 2 : 1;
export const CLASS_TRAIT = {
    마법사: '마법사는 마법을 쓸 때마다 자기 MP를 쓴다 (기초 5 · 중급 12 · 상급 25 · 비전 50). 한 방의 위력과 폭발력은 최고지만, 마나가 바닥나면 아무것도 못 한다 — 단기전에 강하다.',
    정령술사: '정령술사의 기술은 정령의 몫이다. 정령을 부르고(불러내기) 곁에 두는(유지) 데만 MP를 쓰고, 정령이 쓰는 기술에는 정령술사의 MP가 들지 않는다 — 그래서 장기전에 강하다. 대신 위력은 정령의 단계를 넘지 못한다: 하급 정령은 같은 수준 마법사의 기초 마법보다 약하고, 중급 정령은 중급, 상급 정령은 상급 마법에 맞먹으면서 지치지 않고 계속 싸우며, 최상급 정령은 비전급이다. 정령왕은 그 속성 자체라 비전을 넘어선다. 불려 나온 그 속성의 정령이 없으면 그 속성의 정령 기술은 쓸 수 없다.',
    소환사: '소환사는 이계의 존재를 부르고 붙잡아 두는 데 MP를 쓴다(정령보다 비싸다). 불려 나온 존재는 제 힘으로 싸우지만, 계약 조건과 대가를 늘 의식해야 한다.',
    격투가: '격투가는 무기가 없어도, 어떤 지형·환경(물속, 빙판, 좁은 통로, 무장 해제, 갑옷 없이)에서도 제 실력을 낸다. 환경을 타지 않는 적응력이 강점.',
    도적: '도적은 그림자술·은신·암살·잠입에 능하다. 귀족들에게서 호위, 암살, 정보 수집 의뢰를 은밀히 받을 수 있다(그림자 길드를 통하거나 직접). 도적의 그림자술은 어둠 적성자가 대대로 써 온 기술이라 교회도 마법으로 치지 않지만, 대놓고 쓰면 곱게 보지 않는다.',
    테이머: '테이머는 교감·길들이기처럼 마음을 여는 기술에만 마나를 쓰고, 길들인 뒤에는 유대만 지키면 된다. 강하고 똑똑한 짐승일수록 뜻대로 부리기 어렵다. 유대가 가득한 말은 반년을 떨어져 있어도 교감이 이어져, 테이머들은 탈것 대여 사업을 하거나 연금술을 배워 여관·지점에서 모험가들의 탈것과 짐승을 치료해 주며 살기도 한다. 영혼의 크기만큼만 짐승을 받아들일 수 있어 아무나 길들이고 다닐 수 없고, 이미 다른 이와 유대를 쌓은 짐승은 그 유대만큼 길들이기 어렵다. 그래서 강함을 좇는 테이머는 모험가들과 함께 다니며 아직 아무와도 이어지지 않은 강한 짐승을 찾는다.',
    음유시인: '음유시인은 소리로 직접 베고 부수는 음파, 아군을 일으키고 적을 무너뜨리는 선율 — 두 갈래가 있다.',
};
/** 그 클래스에 흔한 적성 */
export const COMMON_AFF = { 격투가: '땅', 도적: '어둠', 치유사: '빛' };
/** 클래스까지 고려한 마력 측정 — 일반 직업은 대개 무속성, 마법 계열은 반드시 적성이 있다 */
export function measureAffinityFor(name, cls, diff) {
    const r = rng(hashStr(`awaken|${name}|${cls}`));
    if (!MAGIC_BORN.includes(cls)) {
        const odds = ({ 격투가: 0.35, 도적: 0.45 }[cls] ?? { 0: 0.2, 1: 0.45, 3: 0.3 }[classRarity(cls)] ?? 0.2) * (diff === 'easy' ? 2 : diff === 'hard' ? 0.75 : 1);
        if (r() >= odds) return [];
        if (cls === '치유사' && r() < 0.6) return ['빛'];
        if (cls === '격투가' && r() < 0.6) return ['땅'];
        if (cls === '도적' && r() < 0.7) return ['어둠'];
        return measureAffinity(name, 1);
    }
    return measureAffinity(name, maxAffinity(diff));
}
/* ── 클래스의 길 — 어떤 갈래의 기술을 주로 써 왔는지에서 저절로 정해진다 ── */
/** 클래스별 갈래 — [외길을 걸을 때 사람들이 부르는 이름, 설명]. 마법사는 속성이 곧 갈래 */
export const BRANCHES = {
    전사: { 수호: ['방패전사', '방패를 들고 버티며 동료를 지킨다'], 파괴: ['광전사', '무거운 무기로 모든 것을 부순다'], 함성: ['전장의 지휘자', '목소리와 기세로 전장을 휘어잡는다'] },
    검사: { 쾌검: ['쾌검사', '누구보다 빠르게 벤다'], 방패검: ['방패기사', '검과 방패의 정통 검술'], 마검: ['마검사', '검에 기를 실어 날린다'] },
    창술사: { 용기사: ['용기사', '하늘로 솟구쳐 내리꽂는 창'], 기마창: ['창기사', '말 위에서 대열을 꿰뚫는 돌격'], 장창: ['창벽의 수호자', '거리와 창벽으로 무엇도 들이지 않는 창'] },
    궁수: { 장궁: ['장궁수', '멀리, 강하게 — 언덕 너머를 꿰뚫는 활'], 석궁: ['석궁수', '한 발의 위력 — 갑옷과 비늘을 뚫는 볼트'], 일반궁: ['명궁', '빠르고 자유롭게 — 어떤 상황에서도 맞히는 활'] },
    음유시인: { 음파: ['음파술사', '소리 그 자체로 베고 부순다'], 선율: ['전장의 악사', '아군을 일으키고 적을 무너뜨리는 노래'] },
    치유사: { 치유: ['구원의 손', '상처를 낫게 하는 기도'], 정화: ['퇴마사', '악한 것을 몰아내는 빛'], 수호: ['수호 사제', '축복과 결계로 지킨다'] },
    소환사: { 마계: ['악마술사', '마계의 악마와 계약한다 — 강하지만 대가가 무겁다'], 천계: ['천계의 대리인', '천계의 존재와 계약한다 — 교회와 얽힌다'], 심연: ['심연술사', '바다 밑과 공허의 존재와 계약한다'], 요정계: ['요정의 벗', '변덕스러운 요정계와 계약한다'] },
    테이머: { 들짐승: ['짐승의 벗', '늑대·개·여우와 무리를 이룬다'], 맹금: ['매사냥꾼', '하늘의 맹금을 부린다'], 마수: ['마수 조련사', '위험한 마물을 길들인다'], 탈것: ['탈것 조련사', '탈것을 길러 동료와 남에게 내어 준다'] },
};
const isElem = (b) => ELEMENTS.includes(b);
/** 속성이 곧 갈래인 클래스 */
export const isMagicClass = (cls) => cls === '마법사' || cls === '정령술사';
/** 갈래 없이 한 줄기로 성장하는 클래스 — '길'이 없다 */
export const NO_PATH = ['격투가', '도적'];
/** 함께하는 존재에 따라 갈래가 열리는 클래스 — 그 갈래의 기초는 처음 계약·길들임 때 익힌다 */
const PARTNER_BRANCH = ['소환사', '테이머'];
export function companionBranch(cls, species = '') {
    if (cls === '소환사') return Object.keys(BRANCHES.소환사).find(k => species.includes(k)) || null;
    if (cls === '테이머') return /(^|\s)매|부엉|맹금|독수리|로크|올빼미/.test(species) ? '맹금' : /말|망아지|탈것|그리폰|히포|황소|낙타|타조/.test(species) ? '탈것' : /마물|마수|슬라임|와이번|비룡|바실|골렘/.test(species) ? '마수' : '들짐승';
    return null;
}
/** 갈래와 잘 맞는 속성 적성 (있으면 숙련 ×1.25) */
export const BRANCH_AFF = { 소환사: { 마계: ['불', '어둠'], 천계: ['빛'], 심연: ['물', '어둠'], 요정계: ['바람', '땅'] }, 테이머: { 맹금: ['바람'], 마수: ['땅', '어둠'] } };
export const classWay = (cls) => cls === '마법사' ? '마도의 길' : `${cls}의 길`;
export const hasPath = (cls) => !!SKILL_TREE[cls] && !NO_PATH.includes(cls);
export const MAGIC_PATHS = {
    외길: '한 속성을 극의까지 파고드는 길. 그 속성의 숙련과 깨달음이 한층 빨라진다 (×1.25).',
    '두 갈래': '두 속성을 나란히 닦는 길. 두 속성을 엮는 조합 마법을 이야기 속에서 시도할 수 있다.',
    올라운더: '여러 속성을 고루 다루는 길. 적성이 아닌 속성도 서툴지 않게 익힌다 (비적성 감점 없음).',
};
export const CLASS_PATHS = {
    외길: '한 갈래를 극의까지 파고드는 길. 그 갈래의 숙련과 깨달음이 한층 빨라진다 (×1.25).',
    '두 갈래': '두 갈래를 나란히 닦는 길. 두 갈래를 엮은 자기만의 기술을 이야기 속에서 시도할 수 있다.',
    올라운더: '모든 갈래를 고루 다루는 길. 어떤 상황에도 대응하며, 갈래 기술의 숙련이 조금씩 빨라진다 (×1.1).',
};
export const pathTable = (cls) => isMagicClass(cls) ? MAGIC_PATHS : CLASS_PATHS;
export function classPath(st, cls) {
    const magic = isMagicClass(cls);
    const by = {};
    for (const s of SKILL_TREE[cls] || []) {
        const k = st.cskills?.[s[0]]; if (!k) continue;
        const e = s[4] || '무속성'; by[e] = (by[e] || 0) + k.p;
    }
    const elems = Object.entries(by).filter(([e]) => e !== '무속성' && e !== '깃듦').sort((a, b) => b[1] - a[1]);
    const etotal = elems.reduce((a, [, v]) => a + v, 0);
    const need = profNeed(st, 2) * 2; // 갈래 기술 숙련 합계가 '숙련' 두 개분이 되면 길이 드러난다
    let path = null, elem = null, pair = null;
    if (etotal >= need && !NO_PATH.includes(cls)) {
        const big = elems.filter(([, v]) => v / etotal >= 0.2);
        if (elems[0][1] / etotal >= 0.6) { path = '외길'; elem = elems[0][0]; }
        else if (big.length === 2) { path = '두 갈래'; pair = big.map(x => x[0]); }
        else path = '올라운더';
    }
    return { cls, magic, by, etotal, need, path, elem, pair };
}
export const magicPath = (st, cls = '마법사') => classPath(st, cls);
export function pathLabel(mp) {
    if (!mp?.path) return '';
    if (mp.path === '외길') return mp.magic ? `${mp.elem}의 외길` : `${mp.elem}의 외길 · ${BRANCHES[mp.cls]?.[mp.elem]?.[0] || mp.elem}`;
    if (mp.path === '두 갈래') return `${mp.pair.join('·')} 두 갈래`;
    return '올라운더';
}
export const pathDesc = (mp) => mp?.path ? pathTable(mp.cls)[mp.path] : '';
/** 이 기술의 숙련 배율 (적성·길) */
export function skillMult(st, sk, mp = classPath(st, sk.cls)) {
    let m = 1;
    if (sk.elem) m = hasAffinity(st, sk.elem) ? 1.5 : mp.path === '올라운더' ? 1 : 0.75;
    else if (sk.aff) m = 1.5;
    else if (!mp.magic && mp.path === '올라운더' && sk.branch) m = 1.1;
    if (!sk.elem && sk.branch && (BRANCH_AFF[sk.cls]?.[sk.branch] || []).some(e => hasAffinity(st, e))) m *= 1.25;
    if (mp.path === '외길' && sk.branch && mp.elem === sk.branch) m *= 1.25;
    return m;
}

const skillObj = (cls, s) => ({ cls, name: s[0], tier: s[1], from: s[2], desc: s[3], branch: s[4] || null, elem: isElem(s[4]) ? s[4] : null, taboo: s[5] === '금기', aff: s[5] === '적성' });

export const BOOK_PRICE = { 1: 300, 2: 30000 }; // 교본 값 (동): 기초 3은, 중급 3금
export const PROF_TIERS = [['미숙', 0], ['익숙', 20], ['숙련', 50], ['달인', 100], ['극의', 200]];

const SKILL_RENAMED = { '잠의최상급정령센티펫': '잠의 최상급 정령 니드라엘', '번개의최상급정령라이오너': '번개의 최상급 정령 라이제아', 대정령이프리트: '불의 최상급 정령 샐레아나', 대정령운디네: '물의 최상급 정령 엘레스트라', 대정령실피드: '바람의 최상급 정령 실레스틴', 대정령노움: '땅의 최상급 정령 노에아넨', '대정령윌오위스프': '빛의 최상급 정령 니트라스', 대정령섀이드: '어둠의 최상급 정령 레이든' };
export function findSkill(name) {
    let n = nospace(name).replace(/^교본[:：]?/, '');
    if (SKILL_RENAMED[n]) n = nospace(SKILL_RENAMED[n]);
    for (const [cls, list] of Object.entries(SKILL_TREE)) {
        for (const s of list) if (nospace(s[0]) === n) return skillObj(cls, s);
    }
    for (const [cls, list] of Object.entries(SKILL_TREE)) {
        for (const s of list) if (nospace(s[0]).includes(n) || (n.length >= 2 && n.includes(nospace(s[0])))) return skillObj(cls, s);
    }
    return null;
}
export function profNeed(st, i) {
    const D = DIFFICULTY[st.difficulty] || DIFFICULTY.normal;
    return Math.round(PROF_TIERS[i][1] * D.expMult);
}
export function profTier(st, p) {
    let t = 0;
    for (let i = 0; i < PROF_TIERS.length; i++) if (p >= profNeed(st, i)) t = i;
    return t;
}
export const profTierName = (i) => PROF_TIERS[i][0];
export const knowsSkill = (st, name) => !!st.cskills?.[name];
/** 클래스를 처음 익힐 때 아는 기초 기술: 속성 없는 기초 전부 + 적성 속성의 기초 */
export function basicSkills(st, cls) {
    return (SKILL_TREE[cls] || []).filter(x => x[1] === 1 && !x[5] && (!isElem(x[4]) || hasAffinity(st, x[4])) && !(x[4] && !isElem(x[4]) && PARTNER_BRANCH.includes(cls))).map(x => x[0]);
}

export function learnedSkills(st, cls) {
    return (SKILL_TREE[cls] || []).filter(s => st.cskills?.[s[0]]).map(s => ({ name: s[0], tier: s[1], p: st.cskills[s[0]].p }));
}

function acquireClass(st, c, log, force) {
    if (st.classes[c]) return true;
    if (!force && NEEDS_AFFINITY.includes(c) && !(st.affinity || []).length) {
        log.push({ k: 'warn', t: `${c} 발현 실패 — 속성 적성이 없다 (먼저 적성이 깨어나야 한다)` });
        return false;
    }
    st.classes[c] = { lv: 1, exp: 0 };
    log.push({ k: 'rank', t: `클래스 습득 — ${c}${classRarity(c) >= 2 ? ` (${rarityName(c)})` : ''}` });
    for (const b of basicSkills(st, c)) learnSkill(st, b, log, '전수');
    return true;
}

function learnSkill(st, name, log, how = '습득') {
    const sk = findSkill(name); if (!sk) return false;
    if (st.cskills[sk.name]) return false;
    if (sk.aff && !(st.affinity || []).length) { log.push({ k: 'warn', t: `${sk.name} — 무속성이라 깃들 속성이 없다` }); return false; }
    st.cskills[sk.name] = { cls: sk.cls, p: 0 };
    log.push({ k: 'rank', t: how === '깨달음' ? `깨달음! — ${sk.name} (${sk.cls} ${SKILL_TIER_NAME[sk.tier]})` : `기술 ${how} — ${sk.name}`, ep: how === '깨달음' ? sk.name : undefined });
    return true;
}

function epiphanyChance(st, tier) {
    const base = [0, 0, 0.04, 0.08, 0.12][tier] || 0;
    if (!base) return 0;
    return Math.max(0, base + statMod(st.stats?.행운 ?? 15) * 0.015 + (hasPerk(st, '행운') ? 0.02 : 0));
}

function practiceSkill(st, name, amount, log) {
    const sk = findSkill(name); if (!sk) throw 0;
    if (!st.cskills[sk.name] && !learnSkill(st, sk.name, log, '습득')) return;
    const s = st.cskills[sk.name];
    const before = profTier(st, s.p);
    if (amount > 0 && hasPerk(st, '성장 가속')) amount = Math.round(amount * 1.5);
    const mp = classPath(st, sk.cls);
    if (amount > 0) amount = Math.max(1, Math.round(amount * skillMult(st, sk, mp)));
    const pathBefore = pathLabel(mp);
    s.p = Math.max(0, s.p + amount);
    const after = profTier(st, s.p);
    if (amount) log.push({ k: 'gain', t: `${sk.name} 숙련 +${amount}` });
    if (after > before) log.push({ k: 'rank', t: `${sk.name} — ${profTierName(after)}` });
    if (sk.branch) { const pa = pathLabel(classPath(st, sk.cls)); if (pa && pa !== pathBefore) log.push({ k: 'rank', t: `${classWay(sk.cls)} — ${pa}` }); }
    // 깨달음: 숙련 이상일 때, 쓸 때마다 낮은 확률로 이 기술에서 이어지는 상위 기술을 스스로 깨친다
    if (amount > 0) {
        const children = (SKILL_TREE[sk.cls] || []).filter(x => x[2] === sk.name && !st.cskills[x[0]]);
        const chance = epiphanyChance(st, after) * ((sk.elem && hasAffinity(st, sk.elem)) || sk.aff ? 1.5 : 1) * (mp.path === '외길' && sk.branch && mp.elem === sk.branch ? 1.25 : 1);
        if (children.length && chance > 0) {
            const r = rng(hashStr(`${sk.name}|${s.p}|${st.day}|${Object.keys(st.cskills).length}`));
            if (r() < chance) {
                const focus = Object.keys(st.classes?.[sk.cls]?.focus || {});
                const weighted = children.flatMap(c => {
                    let w = 1;
                    if (focus.some(f => focusKeywords(f).some(k => c[0].includes(k) || (c[4] && k.includes(c[4]))))) w += 2;
                    if (isElem(c[4]) && hasAffinity(st, c[4])) w += 2;
                    if (mp.path === '외길' && c[4] === mp.elem) w += 2;
                    if (c[5] === '금기' && !hasAffinity(st, '어둠')) w = 0; // 어둠 적성 없이는 금기를 깨치지 않는다
                    if (c[5] === '적성' && !(st.affinity || []).length) w = 0;
                    return Array(w).fill(c);
                });
                if (!weighted.length) return;
                const pickd = weighted[Math.floor(r() * weighted.length)];
                learnSkill(st, pickd[0], log, '깨달음');
            }
        }
    }
}

/* ───────────────────────── 동반자: 정령 · 소환수 · 마수 ───────────────────────── */

export const COMPANION_KINDS = {
    정령: { cls: '정령술사', stages: ['하급 정령', '중급 정령', '상급 정령', '최상급 정령'], upkeep: 0, desc: '이 세계 자연의 정령. 부탁을 들어주는 친구. 기분과 주변 환경(물가·불가·바람·땅)에 따라 힘이 달라진다.' },
    소환수: { cls: '소환사', stages: ['하위 존재', '중위 존재', '상위 존재', '군주급'], upkeep: 0, desc: '이계에서 계약으로 부르는 존재. 평소엔 곁에 없고 마력을 들여 불러낸다. 계약 조건을 어기면 대가를 치른다.' },
    마수: { cls: '테이머', stages: ['새끼', '성체', '노련한', '우두머리'], upkeep: 15, desc: '길들인 짐승·마물. 늘 곁에 있고 먹이가 필요하다. 함께 싸우며 자란다.' },
};
const STAGE_AT = [1, 5, 12, 25];
export const companionStage = (c) => {
    if (c.kind === '정령' && c.king) return '정령왕';
    const k = COMPANION_KINDS[c.kind] || COMPANION_KINDS.마수;
    let i = 0; for (let j = 0; j < STAGE_AT.length; j++) if (c.lv >= STAGE_AT[j]) i = j;
    return k.stages[i];
};
/* ── 마나: 마법사는 기술마다 자기 MP를, 정령술사·소환사는 부르고 유지하는 데만 MP를 쓴다 ── */
export const SPELL_MP = { 1: 5, 2: 12, 3: 25, 4: 50 };
export const CALL_MP = { 정령: [8, 15, 25, 40], 소환수: [12, 22, 35, 55] };   // 단계별 부르는 값
export const KEEP_MP = { 정령: [1, 2, 3, 5], 소환수: [3, 5, 8, 12] };        // 장면마다(전투라면 몇 합마다) 유지하는 값
export const stageIdx = (c) => { let i = 0; for (let j = 0; j < STAGE_AT.length; j++) if (c.lv >= STAGE_AT[j]) i = j; return i; };
export const callCost = (c) => CALL_MP[c.kind]?.[stageIdx(c)] ?? 0;
export const keepCost = (c) => KEEP_MP[c.kind]?.[stageIdx(c)] ?? 0;
/** 이 기술을 쓸 때 시전자가 내는 MP (null = 마나가 아닌 체력·기술로 쓰는 기술) */
/** 테이머: 교감·길들이기 같은 '마음을 여는' 기술에만 MP를 쓴다. 한 번 길들인 뒤의 명령·합동 공격에는 MP가 들지 않는다 */
export const TAMER_MP = { 교감: 3, 길들이기: 8, '짐승의 언어': 4, '감각 공유': 6, '마음 잇기': 12, 일심동체: 20, '들짐승 다루기': 4, '마수 진정': 6, '마수 길들이기': 15, '말 다루기': 3, '비행 탈것': 15, '진화 유도': 30, '속성 공명': 10 };
/** 짐승의 격 — 강하고 똑똑할수록 뜻대로 부리기 어렵다 */
export const GRADE_NAME = ['', '순한 짐승', '사나운 짐승', '마수', '상위 마수', '전설의 존재'];
const GRADE_NEED = [0, 20, 35, 50, 65, 80];
export function guessGrade(species = '') {
    if (/용|드래곤|불사조|피닉스|유니콘|펜리르/.test(species)) return 5;
    if (/그리폰|히포그리프|와이번|비룡|로크|만티코어|바실리스크|페가수스/.test(species)) return 4;
    if (/마수|마물|마랑|골렘|슬라임|오우거|키메라/.test(species)) return 3;
    if (/늑대|곰|멧돼지|산고양이|표범|호랑이|여우|사자|악어/.test(species)) return 2;
    return 1;
}
/** 길드 은행: 맡기는 건 무료, 찾을 때 1% (최소 1동) */
export const bankFee = (v) => v > 0 ? Math.max(1, Math.round(v * 0.01)) : 0;
export const strikesOf = (st, org = 'adventurer') => (st.strikes || []).filter(x => (x.org || 'adventurer') === org);
export const isSuspended = (st, org = 'adventurer') => strikesOf(st, org).length >= 3;
/** 상인 길드 — 큰 틀은 모험가 길드와 같지만 규칙이 다르다: 거래마다 떼는 수수료 대신 달마다 회비 */
export const MERCHANT_DUES = [50, 200, 1000, 5000, 20000, 50000, 50000];
/** 상인 길드 등급별 혜택 — 그 등급에서 새로 열리는 것 */
export const MERCHANT_PERKS = [
    ['길드 시세 게시판 — 다른 시장의 정확한 시세', '먼 가게의 매출을 길드 어음으로 예금'],
    ['물건값을 정확히 감정', '점포 개업 허가', '장터 자리 배정 — 노점 유지비 반값, 노점 매출 +20%'],
    ['상회 개업 허가', '길드 보증 외상 — 한도 5금, 다음 달 1일까지 갚기', '남작가와 거래'],
    ['길드 창고 — 짐 +40', '상단 결성 (50금, 짐 300)', '외상 한도 30금', '상단 호위를 모험가 길드에 싸게 맡김', '백작가·자작가와 거래'],
    ['공작가·후작가·변경백가와 거래 — 큰 가문의 주문과 진귀한 물건', '대형 계약·경매가 의뢰판에', '다음 달 정세를 미리 귀띔받음', '외상 한도 100금'],
    ['길드 배당 매달 3금', '융자 한도 300금', '귀족 연회 초대 · 시장 자리 배정과 경고 심사에 참여'],
    ['길드 배당 매달 10금', '융자 한도 1000금', '황실 조달청과 거래'],
];
/** 지금 받는 혜택 — 한도·배당처럼 올라가는 것은 가장 높은 것만 */
export function merchantPerksNow(rank) {
    const all = MERCHANT_PERKS.slice(0, rank + 1).flat();
    const grp = (t) => /외상|융자/.test(t) ? 'credit' : /배당/.test(t) ? 'div' : t;
    return all.filter((t, i) => !all.slice(i + 1).some(u => grp(u) === grp(t) && grp(t) !== t));
}
export const CREDIT_LIMIT = [0, 0, 50000, 300000, 1000000, 3000000, 10000000];
export const DIVIDEND = [0, 0, 0, 0, 0, 30000, 100000];
export const merchantRank = (st) => st.orgs?.merchant && !isSuspended(st, 'merchant') ? st.orgs.merchant.rank : -1;
export const creditLimit = (st) => CREDIT_LIMIT[merchantRank(st)] || 0;
/** 귀족가 거래처 — 대상인부터 (황실 조달청은 길드장) */
/* ── 귀족 명부 — 제국에는 가문이 많다. 달마다 제도에 머무는 가문이 바뀌고, 그중 몇이 상인을 찾는다 ── */
const REGION_GOODS = {
    '제도 근교': { likes: ['와인 통', '비단 필', '공예품 상자', '향신료 상자'], from: '제도 근교의 작은 영지' },
    '서부 해안': { likes: ['목재 더미', '철 주괴 상자', '모피 묶음', '밀 자루'], from: '세렌포트 너머 바닷가 영지' },
    '북부': { likes: ['밀 자루', '소금 자루', '약초 상자', '철 주괴 상자', '와인 통'], from: '추운 북쪽 영지' },
    '남부 평원': { likes: ['향신료 상자', '비단 필', '보석 원석 주머니', '철 주괴 상자'], from: '밀밭이 끝없는 남부 영지' },
    '동부 산림': { likes: ['소금 자루', '와인 통', '비단 필', '향신료 상자'], from: '숲과 사냥터가 많은 동부 영지' },
    '잿빛 산맥': { likes: ['밀 자루', '와인 통', '맥주 통', '약초 상자'], from: '광산을 낀 산악 영지' },
};
const HEIRLOOMS = [['은잔 한 쌍', 40000], ['낡은 태피스트리', 90000], ['선대 당주의 장검', 150000], ['서고의 고서', 60000], ['진주 목걸이', 120000], ['영지산 귀부 와인', 55000],
    ['선조의 초상화', 70000], ['사냥용 매 한 마리', 50000], ['영지 광산 지분 증서', 500000], ['바다 건너 온 지도첩', 70000], ['문장이 새겨진 인장 반지', 80000], ['상아 체스판', 65000]];
const TRAITS = ['사치를 즐긴다', '검소하고 깐깐하다', '새것과 이국 물건을 좋아한다', '빚에 쪼들린다', '신앙심이 깊다', '무예를 숭상한다', '예술가를 후원한다', '젊은 당주가 막 가문을 이었다',
    '노회한 당주가 쥐고 있다', '혼담에 몰두해 있다', '사냥과 말에 미쳐 있다', '학문과 책을 아낀다', '평민 출신 집사가 실권을 쥐었다', '상인을 낮춰 본다', '돈 냄새를 잘 맡는다'];
// [이름, 작위, 지역, 파벌]  — 앞의 다섯은 로어북에 나오는 가문
const ROSTER_RAW = [
    ['발렌하임', '공작', '제도 근교', '보수파'], ['로세티', '후작', '서부 해안', '실용파'], ['에른스트', '백작', '남부 평원', '중립'], ['그레이븐', '변경백', '북부', '중립'], ['리히터', '남작', '제도 근교', '몰락'],
    ['로이텐', '공작', '동부 산림', '보수파'], ['클라이스트', '후작', '잿빛 산맥', '보수파'], ['마르셀린', '후작', '남부 평원', '실용파'], ['바르텐', '후작', '서부 해안', '중립'], ['오스트마르크', '변경백', '동부 산림', '중립'],
    ['아델하르트', '백작', '남부 평원', '보수파'], ['하르덴베르크', '백작', '북부', '보수파'], ['펠젠', '백작', '잿빛 산맥', '중립'], ['몬테르', '백작', '서부 해안', '실용파'], ['슈발렌', '백작', '제도 근교', '실용파'],
    ['로젠탈', '백작', '동부 산림', '중립'], ['이르마', '백작', '남부 평원', '실용파'], ['베르나', '자작', '제도 근교', '보수파'], ['카일런', '자작', '서부 해안', '실용파'], ['드레센', '자작', '북부', '중립'],
    ['미르발', '자작', '남부 평원', '중립'], ['에델린', '자작', '동부 산림', '보수파'], ['토르벤', '자작', '잿빛 산맥', '실용파'], ['알스터', '자작', '제도 근교', '중립'], ['페리안', '자작', '서부 해안', '보수파'],
    ['그륀', '남작', '남부 평원', '실용파'], ['하이델', '남작', '동부 산림', '중립'], ['노르덴', '남작', '북부', '보수파'], ['벨모어', '남작', '서부 해안', '중립'], ['카스텔', '남작', '잿빛 산맥', '실용파'],
    ['피에른', '남작', '제도 근교', '몰락'], ['오덴', '남작', '동부 산림', '실용파'],
];
const LORE_PERK = {
    발렌하임: { market: '제도 루미에른', text: '제도 시장 값 차이 -5% · 보수파 귀족들의 주문' }, 로세티: { market: '항구도시 세렌포트', text: '세렌포트 항만 우선권 — 그곳 값 차이 -5%' },
    에른스트: { market: '브레이크 마을', text: '중립 가문 — 브레이크 마을 값 차이 -5%' }, 그레이븐: { market: '북부 변경', text: '변경 호위 — 북부 변경 값 차이 -5%' },
};
const LORE_TRAIT = { 발렌하임: '혈통을 중시하고 평민 등용을 반대한다', 로세티: '능력 있는 평민을 후원하는 실용파의 수장', 에른스트: '양쪽 파벌과 두루 지내는 중립', 그레이븐: '거칠고 솔직한 무인 가문 — 국경만 지켜 주면 그만', 리히터: '빚으로 몰락해 영지가 저당 잡혔다' };
const REGION_MARKET = { '제도 근교': '제도 루미에른', '서부 해안': '항구도시 세렌포트', 북부: '북부 변경', '남부 평원': '곡물 도시 하벤', '동부 산림': '엘름바트', '잿빛 산맥': '바르그홀름' };
const TITLE_NEED = { 공작: 4, 후작: 4, 변경백: 4, 백작: 3, 자작: 3, 남작: 2 };
const TITLE_WEIGHT = { 공작: 1, 후작: 2, 변경백: 2, 백작: 3, 자작: 3, 남작: 3 };
export const NOBLE_HOUSES = ROSTER_RAW.map(([n, title, region, faction], i) => {
    const r = rng(hashStr(`house|${n}`));
    const rg = REGION_GOODS[region];
    const likes = [...rg.likes].sort(() => r() - 0.5).slice(0, 3);
    const sells = [0, 1].map(() => { const h = HEIRLOOMS[Math.floor(r() * HEIRLOOMS.length)]; return [`${n}가의 ${h[0]}`, h[1]]; });
    const trait = LORE_TRAIT[n] || TRAITS[Math.floor(r() * TRAITS.length)];
    return {
        name: `${n} ${title}가`, short: n, title, region, faction, trait, lore: i < 5, need: TITLE_NEED[title], weight: TITLE_WEIGHT[title],
        rival: n === '발렌하임' ? '로세티 후작가' : n === '로세티' ? '발렌하임 공작가' : null, head: n === '발렌하임' || n === '로세티',
        noScout: faction === '몰락', likes, sells, caravan: `${n}가 상단`, perk: LORE_PERK[n] || { market: REGION_MARKET[region], text: `${region} 연줄 — ${REGION_MARKET[region]} 값 차이 -5%` },
    };
}).concat([{ name: '황실 조달청', short: '황실', title: '황실', region: '제도 근교', faction: '황실', trait: '까다롭고 느리지만 확실히 값을 치른다', need: 6, weight: 0, noScout: true, rival: null,
    likes: ['밀 자루', '철 주괴 상자', '비단 필', '와인 통', '마석 상자'], sells: [['황실 납품 인가장', 300000]] }]);
/* ── 제도 체류 — 사교 시즌(3월 건국제 ~ 10월 수확제)에 모이고, 부와 영향력·가업에 따라 머무는 때와 길이가 다르다 ── */
const BUSINESS = { '서부 해안': '해운·교역', '잿빛 산맥': '광산', '남부 평원': '곡물', '동부 산림': '목재·사냥', 북부: '국경 수비', '제도 근교': '궁정 관직' };
const TITLE_BASE = { 공작: 5, 후작: 4, 변경백: 3, 백작: 3, 자작: 2, 남작: 1, 황실: 5 };
const STAY_TEXT = { 상주: '일 년 내내 제도 저택에 머문다', '시즌 내내': '건국제에 맞춰 올라와 수확제가 끝나면 내려간다', 한창때: '사교 시즌 한창때 몇 달 머문다', '짧은 상경': '한 해 한 번 잠깐 올라온다', 국경: '영지를 비우지 못해 건국제 무렵에만 잠깐 얼굴을 비춘다' };
const LORE_STAY = { 발렌하임: '상주', 로세티: '시즌 내내', 에른스트: '시즌 내내', 그레이븐: '국경', 리히터: '상주' };
export function houseProfile(h) {
    if (h._prof) return h._prof;
    const base = TITLE_BASE[h.title] ?? 2;
    let wealth = base, influence = base;
    const t = h.trait || '';
    if (/빚|몰락/.test(t) || h.faction === '몰락') wealth = Math.max(0, wealth - 2);
    if (/돈 냄새|사치/.test(t)) wealth += 1;
    if (/노회|수장|혈통/.test(t)) influence += 1;
    if (/젊은 당주/.test(t)) influence -= 1;
    if (h.faction === '몰락') influence = 0;
    const business = h.title === '황실' ? '조달' : /돈 냄새/.test(t) ? '상회 투자' : BUSINESS[h.region] || '영지 경영';
    let stay = LORE_STAY[h.short] || (h.title === '황실' ? '상주'
        : influence >= 5 || (business === '궁정 관직' && wealth >= 3) ? '상주'
        : business === '국경 수비' || h.title === '변경백' ? '국경'
        : wealth >= 4 || influence >= 4 ? '시즌 내내'
        : wealth >= 2 ? '한창때' : '짧은 상경');
    // 가업이 교역·광산·상회 투자이고 넉넉하면 제도에 상관(대리인)을 둔다 — 가문이 없어도 주문은 넣는다
    const agent = stay !== '상주' && ['해운·교역', '상회 투자', '광산'].includes(business) && wealth >= 3;
    return (h._prof = { wealth, influence, business, stay, agent, stayText: STAY_TEXT[stay] });
}
const doyOf = (day) => { const f = formatDate(day); return { y: f.y, doy: (f.m - 1) * 30 + (f.d - 1) }; };
const md = (m, d) => (m - 1) * 30 + (d - 1);
/** 그해 이 가문이 제도에 머무는 기간들 [시작, 끝] (해의 날짜) */
export function stayRanges(h, year) {
    const p = houseProfile(h);
    const r = rng(hashStr(`stay|${year}|${h.name}`)); r();
    const jit = (n) => Math.round((r() - 0.5) * 2 * n);
    const romance = /혼담/.test(h.trait || '') ? 40 : 0;
    switch (p.stay) {
        case '상주': return [[0, 359]];
        case '시즌 내내': return [[md(3, 5) + jit(8), Math.min(359, md(10, 22) + jit(8) + romance)]];
        case '한창때': { const s = md(4, 1) + jit(30); return [[s, Math.min(md(10, 25), s + 70 + Math.round(r() * 40) + romance)]]; }
        case '국경': return r() < 0.5 ? [[md(3, 10), md(3, 25)]] : [[md(3, 10), md(3, 25)], [md(10, 5), md(10, 16)]];
        default: { const k = r(); return k < 0.4 ? [[md(3, 8), md(4, 5) + romance]] : k < 0.75 ? [[md(10, 1), md(10, 25)]] : (() => { const s = md(5 + Math.floor(r() * 4), 1); return [[s, s + 25 + romance]]; })(); }
    }
}
export function inCapital(h, day) {
    const { y, doy } = doyOf(day);
    return stayRanges(h, y).some(([a, b]) => doy >= a && doy <= b);
}
const fmtDoy = (x) => { const m = Math.floor(x / 30) + 1, d = (x % 30) + 1; return `${m}월 ${d <= 10 ? '초' : d <= 20 ? '중순' : '말'}`; };
export function stayLabel(h, day) {
    const { y } = doyOf(day);
    const p = houseProfile(h);
    if (p.stay === '상주') return '일 년 내내 제도';
    return stayRanges(h, y).map(([a, b]) => `${fmtDoy(a)}~${fmtDoy(b)}`).join(', ');
}
export function seasonStatus(day) {
    const { doy } = doyOf(day);
    if (doy < md(3, 1) || doy > md(10, 30)) return { on: false, text: '사교 시즌이 아니다 — 큰 가문 몇 곳만 제도에 남아 있다' };
    if (doy < md(3, 15)) return { on: true, text: '건국제를 앞두고 귀족들이 속속 제도로 올라오는 중' };
    if (doy < md(5, 1)) return { on: true, text: '사교 시즌이 막 열렸다 — 제도가 가장 북적인다' };
    if (doy < md(9, 1)) return { on: true, text: '사교 시즌 한창 — 무도회와 혼담이 이어진다' };
    if (doy < md(10, 16)) return { on: true, text: '수확제를 끝으로 시즌이 저물어 간다' };
    return { on: true, text: '수확제가 끝나 귀족들이 영지로 내려가는 중' };
}
/** 지금 제도에 머무는 가문 (영향력 순) */
export function presentHouses(st, day = st.day) {
    return NOBLE_HOUSES.filter(h => inCapital(h, day)).sort((a, b) => houseProfile(b).influence - houseProfile(a).influence);
}
/** 이달 상인을 찾는 가문 — 제도에 와 있는 가문과 상관을 둔 가문 가운데 */
export function activeHouses(st, day = st.day) {
    const ym = ymOf(day);
    const ph = st.patron ? houseOf(st.patron.house) : null;
    const cands = NOBLE_HOUSES.filter(h => h.title !== '황실' || (st.orgs?.merchant?.rank ?? -1) >= 6).filter(h => inCapital(h, day) || houseProfile(h).agent);
    const keyed = cands.map(h => {
        const p = houseProfile(h), r = rng(hashStr(`seek|${ym}|${h.name}`)); r();
        const here = inCapital(h, day);
        const want = h.title === '황실' || r() < (here ? 0.35 + p.wealth * 0.08 : 0.3);
        return { h, want, k: r() };
    }).filter(x => x.want);
    const out = keyed.sort((a, b) => a.k - b.k).slice(0, 6).map(x => x.h);
    if (ph && !out.includes(ph)) out.unshift(ph);
    return out;
}
/** 파벌 — 후원 가문과 반대편 가문은 냉담하다(값 -10%, 스카웃 없음). 우두머리 가문끼리는 거래 자체가 막힌다 */
const opposed = (a, b) => (a === '보수파' && b === '실용파') || (a === '실용파' && b === '보수파');
export function houseStance(st, h) {
    const ph = patronHouse(st);
    if (!ph || ph.name === h.name) return 'ok';
    if (ph.rival === h.name || (opposed(ph.faction, h.faction) && h.head)) return 'blocked';
    if (opposed(ph.faction, h.faction)) return 'cold';
    return 'ok';
}

/* ── 후원 가문: 귀족 상단에 스카웃되거나, 가문의 전속 상인이 된다 ── */
export const PATRON_ROLES = {
    상단원: { ranks: ['견습 상단원', '상단원', '상단 책임자', '가문 재무관'], pay: [1500, 5000, 20000, 60000], desc: '가문의 상단에 들어가 함께 다닌다. 다달이 급료를 받고, 상단의 짐마차를 쓴다(짐 +100). 내 가게를 키우기보다 가문의 일을 한다.' },
    '전속 상인': { ranks: ['출입 상인', '어용 상인', '가문 상인', '가문의 이름을 받은 상인'], tribute: [0.1, 0.1, 0.05, 0.05], desc: '내 장사는 그대로 하되 가문의 간판을 단다. 가게 평판과 매출이 오르고 가문의 주문을 늘 받지만, 가게 매출의 일부를 다달이 바친다.' },
    '전속 요리사': { chef: true, ranks: ['저택 부엌 요리사', '연회 요리장', '가문 요리장', '궁정에 이름이 오른 요리장'], pay: [20000, 40000, 80000, 150000], desc: '가문의 저택 부엌에 들어간다. 다달이 급료를 받고 저택에서 먹고 자지만, 내 식당은 점원과 제자에게 맡겨야 한다(소문은 천천히 쌓인다). 가문의 식탁과 연회가 곧 실력이 된다.' },
    '어용 식당': { chef: true, ranks: ['가문 출입 식당', '어용 식당', '가문 연회 지정 식당', '가문 문장을 건 식당'], tribute: [0.1, 0.1, 0.05, 0.05], desc: '내 식당에 가문의 문장을 건다. 부자 손님이 늘고(손님 +20%, 값 +15%) 소문이 빨리 퍼지지만, 매출의 일부를 바치고 다달이 가문 연회를 한 번은 차려야 한다.' },
};
export const PATRON_FAVOR = [0, 50, 80, 100];
export const houseOf = (name) => { const n = nospace(name); return NOBLE_HOUSES.find(h => nospace(h.name) === n) || NOBLE_HOUSES.find(h => n.includes(h.short) || nospace(h.name).includes(n)); };
export const patronHouse = (st) => st.patron ? houseOf(st.patron.house) : null;
/** 이달의 스카웃 제의 */
export function scoutOffers(st, day = st.day) {
    const chef = chefScouts(st, day);
    if (!st.orgs?.merchant || isSuspended(st, 'merchant')) return chef;
    const ym = ymOf(day);
    const mr = st.orgs.merchant.rank;
    const shopBig = (st.shops || []).some(s => s.tier !== '노점');
    const cur = patronHouse(st);
    const out = [];
    for (const h of NOBLE_HOUSES) {
        if (h.noScout || cur?.name === h.name || st.family?.house === h.name || houseStance(st, h) !== 'ok' || !inCapital(h, day)) continue;
        const fav = st.houseFavor?.[h.name] || 0;
        const r = rng(hashStr(`scout|${ym}|${h.name}`))();
        const keen = fav >= 25 || (mr >= 2 && st.renown >= 30 && r < 0.03 * h.weight / 2) || (mr >= 1 && r < 0.012);
        if (!keen) continue;
        const roles = ['상단원', ...(shopBig || mr >= 3 ? ['전속 상인'] : [])];
        out.push({ house: h.name, roles, faction: h.faction, caravan: h.caravan, perk: h.perk?.text, rival: h.rival, favor: fav, trait: h.trait, region: h.region, title: h.title });
    }
    const merged = out.sort((a, b) => b.favor - a.favor).slice(0, 2);
    for (const c of chef) { const m = merged.find(o => o.house === c.house); if (m) { m.roles.push(...c.roles); m.chef = true; m.shop = c.shop; } else merged.push(c); }
    return merged.slice(0, 3);
}
/** 소문난 요리사를 찾는 집 — 부자 단골은 '이름난 맛집'부터, 귀족가는 '명소'부터 (호감이 있으면 더 일찍) */
export function chefScouts(st, day = st.day) {
    const fs = (st.shops || []).filter(isFoodShop).sort((a, b) => (b.fame || 0) - (a.fame || 0))[0];
    if (!fs) return [];
    const fame = fs.fame || 0;
    if (fame < 40) return [];
    const ym = ymOf(day), cur = patronHouse(st);
    if (cur && PATRON_ROLES[st.patron.role]?.chef) return [];
    const out = [];
    for (const h of NOBLE_HOUSES) {
        if (h.noScout || cur?.name === h.name || houseStance(st, h) !== 'ok' || !inCapital(h, day)) continue;
        const fav = st.houseFavor?.[h.name] || 0;
        const r = rng(hashStr(`chef|${ym}|${h.name}`))();
        const keen = (fame >= 60 && r < 0.025 * h.weight) || (fav >= 25 && fame >= 40) || (fame >= 85 && r < 0.06 * h.weight);
        if (!keen) continue;
        out.push({ house: h.name, roles: ['전속 요리사', '어용 식당'], chef: true, shop: fs.name, faction: h.faction, caravan: `${h.trait ? h.trait + ' — ' : ''}${fs.name}의 소문을 듣고 집사를 보냈다`, perk: null, rival: h.rival, favor: fav, trait: h.trait, region: h.region, title: h.title });
    }
    return out.sort((a, b) => b.favor - a.favor).slice(0, 2);
}
/** 소문난 집에 드나드는 부자 단골 (이야기 거리) */
export function richRegulars(st, s, day = st.day) {
    if (!isFoodShop(s) || (s.fame || 0) < 35) return [];
    const r = rng(hashStr(`regular|${ymOf(day)}|${s.name}`));
    const pool = ['곡물 거상의 안주인', '은퇴한 기사단장', '세렌포트 선주', '제국 은행의 서기관', '극단 주연 배우', '이름난 모험가 파티', '마탑의 노마법사', '대성당의 부주교', '젊은 남작가 자제', '귀족가 집사'];
    const n = (s.fame >= 60 ? 3 : s.fame >= 45 ? 2 : 1);
    const out = [];
    while (out.length < n) { const p2 = pool[Math.floor(r() * pool.length)]; if (!out.includes(p2)) out.push(p2); }
    return out;
}

/** 이달 귀족가의 주문과 내놓는 물건 (달마다 바뀐다) */
export function nobleOffers(st, day = st.day) {
    const ym = ymOf(day);
    return activeHouses(st, day).map(h => {
        const r = rng(hashStr(`noble|${ym}|${h.name}`));
        const stance = houseStance(st, h);
        const here = inCapital(h, day);
        const good = h.likes[Math.floor(r() * h.likes.length)];
        const qty = h.name === '황실 조달청' ? 20 + Math.floor(r() * 30) : 3 + Math.floor(r() * 8);
        const g = findTrade(good);
        const unit = Math.round(g[1] * (1.3 + r() * 0.35));
        const sale = h.sells[Math.floor(r() * h.sells.length)];
        const mine = st.patron && st.patron.house === h.name;
        const u2 = Math.round(unit * (mine ? (st.patron.role === '상단원' ? 1.1 : 1.15) : stance === 'cold' ? 0.9 : 1));
        return { house: h.name, title: h.title, region: h.region, faction: h.faction, trait: h.trait, stance, here, agentOnly: !here, stay: stayLabel(h, day), business: houseProfile(h).business, need: mine ? 0 : h.need, mine, rivalBlocked: stance === 'blocked', good, qty, unit: u2, total: u2 * qty, sale: here ? { name: sale[0], price: Math.round(sale[1] * (0.85 + r() * 0.3)) } : null,
            delivered: !!st.nobleDeals?.[`${ym}|${h.name}|납품`], bought: !!st.nobleDeals?.[`${ym}|${h.name}|구입`] };
    });
}
export const MERCHANT_RULES = [
    ['규약', '회비는 매달 1일, 등급에 따라 낸다(행상인 50동 ~ 대상인 2금). 못 내면 경고. 대신 거래마다 수수료를 떼지 않는다.'],
    ['규약', '저울과 자를 속이지 않는다 — 들키면 벌금과 경고.'],
    ['규약', '흉작·역병 때 물건을 쌓아 두고 값을 올리는 매점매석, 가게끼리 짜고 값을 정하는 담합은 금지.'],
    ['규약', '길드원끼리의 계약과 외상은 길드 장부에 남긴다. 장부에 없는 약속은 길드가 지켜 주지 않는다.'],
    ['규약', '장터의 정해진 자리를 침범하지 않는다. 점포와 상회는 길드 허가가 있어야 연다.'],
    ['규약', '경고 3회면 영업 정지(개업·확장·시세 게시판 금지), 5회면 제명.'],
    ['불문율', '첫 거래는 손해를 봐도 신용을 산다.'],
    ['불문율', '외상은 세 번까지.'],
    ['불문율', '장날 아침 첫 손님에게는 덤을 준다.'],
    ['불문율', '경쟁 가게 문 앞에서 호객하지 않는다.'],
    ['불문율', '길에서 다른 상단을 만나면 물건 대신 소식을 나눈다.'],
    ['불문율', '빌려준 돈 이야기는 술자리에서 꺼내지 않는다.'],
];
/** 모험가 길드 규약과 모험가들의 불문율 */
export const GUILD_RULES = [
    ['규약', '수주한 의뢰는 끝까지 책임진다 — 포기하면 위약금(보수의 3할)과 경고.'],
    ['규약', '의뢰 보수의 1할은 길드 수수료. 길드를 거치지 않은 뒷거래 의뢰는 경고.'],
    ['규약', '모험가끼리의 결투·살상 금지. 마을 안에서 무기를 뽑으면 위병과 길드 모두에게 혼난다.'],
    ['규약', '마물의 대량 발생·던전 발견 같은 위험은 즉시 길드에 보고한다.'],
    ['규약', '자기 등급보다 두 단계 위 의뢰는 받을 수 없다. 긴급 의뢰는 예외.'],
    ['규약', '경고 3회면 자격 정지, 5회면 제명. 공적과 봉사로 경고를 지울 수 있다.'],
    ['불문율', '남의 사냥감에 손대지 않는다 — 먼저 싸우고 있는 파티가 있으면 부탁받기 전에 끼어들지 않는다.'],
    ['불문율', '전리품은 출발 전에 정한 대로 나눈다. 정하지 않았으면 똑같이.'],
    ['불문율', '쓰러진 동료를 버리고 도망친 자와는 아무도 파티를 짜지 않는다.'],
    ['불문율', '던전 안에서 만난 다른 파티의 물건은 주인이 살아 있는 한 건드리지 않는다.'],
    ['불문율', '신입의 첫 의뢰가 끝나면 선배가 한 잔 산다.'],
    ['불문율', '주점 게시판의 낙서는 길드 공지보다 빠르다 — 단, 반은 거짓말.'],
];
/* ───────── 함께 사는 동물 · 반려동물 ───────── 테이머가 아니면 영혼의 유대가 아니라 시간과 성격으로 가까워진다 */
export const PET_TRAITS = {
    애교쟁이: [1.5, '먼저 다가와 몸을 비빈다'], 순둥이: [1.2, '누구에게나 순하다'], 충직함: [1.3, '한번 믿으면 끝까지 따른다'],
    장난꾸러기: [1, '물건을 숨기고 사고를 친다'], 먹보: [1.1, '먹을 것 앞에서 마음이 풀린다'], 겁쟁이: [0.6, '처음엔 숨어 있지만 마음을 열면 누구보다 붙는다'],
    고집쟁이: [0.7, '제 뜻대로 하려 든다'], 도도함: [0.7, '곁은 주지만 쉽게 안기지 않는다'],
};
export const PET_UPKEEP = 5;
export const PET_SPECIES = { 강아지: 200, 고양이: 150, 새: 80, 토끼: 60, 족제비: 120, 망아지: 3000 };
export function traitOf(name, species) { const ks = Object.keys(PET_TRAITS); return ks[Math.floor(rng(hashStr(`trait|${name}|${species}`))() * ks.length)]; }
export function traitRate(c) { const t = PET_TRAITS[c.trait]; if (!t) return 1; return c.trait === '겁쟁이' && c.bond >= 40 ? 1.4 : t[0]; }
export function compSpecies(c) { return c.kind === '정령' && SPIRIT_NAMES[c.elem] ? spiritTitle(c.elem, c.king ? 4 : Math.min(3, stageIdx(c))) : (c.species || ''); }
/** 영혼의 자리 — 테이머는 영혼의 크기만큼만 짐승을 받아들인다. 격이 높을수록 자리를 많이 차지한다 */
export const SOUL_COST = [0, 1, 2, 3, 5, 8];
export const soulCost = (grade) => SOUL_COST[grade || 1] || 1;
export function soulCap(st) {
    const t = st.classes?.테이머;
    if (!t) return 1; // 테이머가 아니면 말 한 마리 정도
    return 3 + Math.floor(t.lv / 5) * 2 + Math.max(0, statMod(st.stats?.정신 ?? 15));
}
export const soulUsed = (st) => (st.companions || []).filter(c => c.kind === '마수' && c.tamed && c.bond > 0).reduce((a, c) => a + soulCost(c.grade), 0);
/** 길들이기 판정 난이도 — 격이 높을수록, 다른 이와 쌓은 유대가 클수록 어렵다 */
export const tameDC = (grade, otherBond = 0) => 8 + (grade || 1) * 2 + Math.floor(Math.max(0, otherBond) / 10);
/** 뜻대로 부리는 데 필요한 유대 (격 + 성장 단계) */
export const obeyNeed = (c) => (GRADE_NEED[c.grade || 1] || 20) + stageIdx(c) * 5;
export function obeyState(c) {
    if (c.kind !== '마수') return null;
    const need = obeyNeed(c), b = c.bond;
    if (b <= 0) return { lv: 0, name: '야생으로 돌아감', need };
    if (b < need - 20) return { lv: 1, name: '제멋대로', need };
    if (b < need) return { lv: 2, name: '반쯤 따름', need };
    if (b < Math.min(100, need + 25)) return { lv: 3, name: '뜻대로 움직임', need };
    return { lv: 4, name: '일심동체', need };
}
/** 떨어져 있어도 교감이 이어지는 남은 날 (유대 100이면 약 6개월) */
export const awayDaysLeft = (c) => Math.max(0, Math.floor(c.bond * 1.8));
export function skillMp(sk) {
    if (!sk) return null;
    if (sk.cls === '테이머') return TAMER_MP[sk.name] ?? null;
    if (sk.cls === '마법사') return SPELL_MP[sk.tier];
    if (sk.cls === '정령술사' && sk.elem) return 0;
    return null;
}
const compNeed = (st, lv) => Math.round(40 * lv * ((DIFFICULTY[st.difficulty] || DIFFICULTY.normal).expMult));

export const STARTER_COMPANIONS = {
    정령술사: [['불의 정령 샐러맨더', '불'], ['물의 정령 운디네', '물'], ['바람의 정령 실프', '바람'], ['땅의 정령 놈', '땅'], ['빛의 정령 루미아', '빛'], ['그림자의 정령 섀디', '어둠'], ['번개의 정령 라이키', '번개'], ['얼음의 정령 니비', '얼음'], ['잠의 정령 솜니아', '잠']],
    소환사: [['임프 (마계의 꼬마 악마)', '불'], ['별빛 나방 (천계의 작은 성수)', '빛'], ['심연 해파리 (심연의 하위 존재)', '물'], ['도토리 요정 (요정계의 장난꾸러기)', '바람']],
    테이머: [['늑대 새끼', null], ['매', '바람'], ['여우', null], ['망아지', null], ['멧돼지 새끼', '땅']],
};

function findComp(st, name) {
    const n = nospace(name);
    return (st.companions || []).findIndex(c => nospace(c.name) === n || nospace(c.name).includes(n) || n.includes(nospace(c.name)));
}

export function addCompanion(st, c, log) {
    const kind = COMPANION_KINDS[c.kind] ? c.kind : '마수';
    const maxhp = c.maxhp || (kind === '마수' ? 40 : 30);
    const spTitle = kind === '정령' && SPIRIT_NAMES[c.elem] && !c.species ? spiritTitle(c.elem, c.king ? 4 : Math.min(3, stageIdx({ lv: c.lv || 1 }))) : null;
    const obj = { name: c.name, kind, species: spTitle || c.species || '', elem: (kind === '정령' ? SPIRIT_ELEMS : ELEMENTS).includes(c.elem) ? c.elem : null, pet: !!c.pet, trait: c.trait || null, home: c.home || null, tamed: kind === '마수' ? (c.tamed ?? !!st.classes?.테이머) : null, lv: c.lv || 1, exp: 0, bond: c.bond ?? 20, maxhp, hp: maxhp, terms: c.terms || '', conds: [], out: false, away: null, grade: kind === '마수' ? (c.grade || guessGrade(c.species)) : null, ...(c.king ? { king: true } : {}) };
    st.companions.push(obj);
    const cc = kind === '소환수' ? '소환사' : kind === '마수' ? '테이머' : null;
    const br = cc && st.classes?.[cc] && companionBranch(cc, obj.species);
    const basic = br && (SKILL_TREE[cc] || []).find(x => x[1] === 1 && x[4] === br);
    if (basic && !st.cskills[basic[0]]) st.cskills[basic[0]] = { cls: cc, p: 0 };
    if (kind === '마수' && !obj.trait) obj.trait = traitOf(obj.name, obj.species);
    if (!(kind === '마수' && !obj.tamed)) log?.push({ k: 'rank', t: `${kind === '정령' ? '정령 계약' : kind === '소환수' ? '이계 계약' : '길들임'} — ${obj.name}${obj.species ? ` (${obj.species})` : ''}` });
    return obj;
}

function compGain(st, c, amount, log) {
    c.exp = Math.max(0, c.exp + amount);
    if (amount) log.push({ k: 'gain', t: `${c.name} 성장 +${amount}` });
    let g = 0;
    while (c.exp >= compNeed(st, c.lv) && g++ < 40) {
        c.exp -= compNeed(st, c.lv);
        const before = companionStage(c);
        c.lv += 1; c.maxhp += c.kind === '마수' ? 8 : 6; c.hp = c.maxhp;
        log.push({ k: 'rank', t: `${c.name} Lv ${c.lv}` });
        const after = companionStage(c);
        if (after !== before) log.push({ k: 'rank', t: `${c.name} — ${after}로 성장!` });
    }
}

/* ───────────────────────── 귀족 가문 출신 · 공훈과 작위 ───────────────────────── */
export const TITLE_RANK = { 남작: 4, 자작: 5, 백작: 6, 후작: 7, 변경백: 7, 공작: 8 };
/** 자제의 용돈(달마다) · 당주의 영지 수입(달마다) */
export const TITLE_ALLOW = { 남작: 3000, 자작: 6000, 백작: 12000, 후작: 25000, 변경백: 20000, 공작: 50000 };
export const TITLE_INCOME = { 남작: 30000, 자작: 60000, 백작: 150000, 후작: 300000, 변경백: 250000, 공작: 600000 };
export const BIRTH_ORDER = ['외동', '첫째', '둘째', '셋째', '넷째 이하'];
export function birthLabel(fam, gender) {
    const g = /여|녀|female|woman/i.test(gender || '') ? 'f' : /남|male|man/i.test(gender || '') ? 'm' : '';
    const T = { m: ['외동아들', '장남', '차남', '삼남', '막내아들'], f: ['외동딸', '장녀', '차녀', '삼녀', '막내딸'], '': ['외동', '첫째', '둘째', '셋째', '막내'] };
    return T[g][fam.birth] || T[g][4];
}
/** 신분을 사람이 부르는 말로 */
export function statusLabel(st) {
    const f = st.family, h = st.honor;
    if (f?.head) return `${f.house}의 당주 (${NOBLE[st.noble]})`;
    if (h?.title && (!f || TITLE_RANK[h.title] || h.title.includes('기사작'))) return `${h.title}${h.hereditary && h.houseName ? ` · ${h.houseName}` : ''}`;
    if (f) return `${f.house}의 ${birthLabel(f, st.profile?.gender)}${f.heir ? ' · 후계자' : ''}${f.disowned ? ' (의절)' : ''}`;
    return NOBLE[st.noble];
}
/** 공훈으로 받는 작위 — [필요 공훈, 이름, 신분, 세습, 달마다 받는 것] */
export const HONORS = [
    [100, '일대 기사작', 3, false, 5000, '한 대에 한한 기사 작위. 성 앞에 "경"이 붙고 연금을 받는다'],
    [250, '일대 남작', 4, false, 15000, '물려줄 수 없는 남작 작위와 연금'],
    [500, '세습 남작', 4, true, 30000, '자손에게 물려줄 수 있는 정식 남작 작위와 작은 영지. 새 가문을 연다'],
    [900, '자작', 5, true, 60000, '자작 작위와 영지'],
    [1500, '백작', 6, true, 150000, '백작 작위와 영지. 이 위는 황제의 특별한 뜻으로만'],
];
/** 조직 승급이 쌓는 공훈 (등급 → 공훈) */
export const RANK_HONOR = [0, 0, 0, 10, 25, 50, 100];
export const honorNext = (st) => HONORS.find(x => x[2] > st.noble || (x[3] && !st.honor?.hereditary && x[2] >= st.noble && !st.family?.head && !(st.honor?.title === x[1])));
function honorCheck(st, log) {
    st.honor = st.honor || { pts: 0, title: null, hereditary: false, pending: null };
    const cand = [...HONORS].reverse().find(x => st.honor.pts >= x[0]);
    if (!cand) return;
    const curIdx = HONORS.findIndex(x => x[1] === st.honor.title);
    const candIdx = HONORS.indexOf(cand);
    if (candIdx <= curIdx) return;
    if (st.family?.head && cand[2] <= st.noble) return; // 이미 그보다 높은 작위의 당주
    if (st.honor.pending !== cand[1]) { st.honor.pending = cand[1]; log.push({ k: 'rank', t: `공훈이 쌓여 '${cand[1]}' 서임 대상이 되었다 — 6월 10일 황제 탄신 축하연에서 서임된다` }); }
}
function grantHonor(st, name, log, opts = {}) {
    const H = HONORS.find(x => x[1] === name) || (TITLE_RANK[name] ? [0, name, TITLE_RANK[name], true, TITLE_INCOME[name], '황제의 특별한 뜻'] : null);
    if (!H) return false;
    st.honor = st.honor || { pts: 0 };
    st.honor.title = H[1]; st.honor.hereditary = opts.hereditary ?? H[3]; st.honor.pension = H[4]; st.honor.pending = null; st.honor.since = st.day;
    if (opts.house) st.honor.houseName = opts.house;
    if (st.honor.hereditary && !st.honor.houseName) st.honor.houseName = `${(st.profile?.name || '').split(' ').pop()} ${H[1].replace('세습 ', '')}가`;
    if (H[2] > st.noble && st.noble < NOBLE_ROYAL) st.noble = H[2];
    log.push({ k: 'rank', t: `서임 — ${H[1]}${st.honor.hereditary ? ` · 새 가문 '${st.honor.houseName}'${josa(st.honor.houseName, '을', '를').slice(st.honor.houseName.length)} 열었다` : ''} (달마다 ${st.honor.hereditary ? '영지 수입' : '연금'} ${formatMoney(H[4])})` });
    return true;
}
/** 달마다 — 용돈·영지 수입·연금 */
function runNobleMonth(st, log) {
    const f = st.family;
    if (f && !f.disowned) {
        if (f.head) { const v = TITLE_INCOME[f.title] || 0, tb = Math.round(v * TAX.tribute); st.money += v - tb; log.push({ k: 'gain', t: `${f.house} 영지 수입 +${formatMoney(v)} · 황실 공납 -${formatMoney(tb)}` }); }
        else if ((f.favor ?? 50) >= 20) { const v = Math.round((TITLE_ALLOW[f.title] || 0) * (f.heir ? 1 : 0.5)); if (v) { st.money += v; log.push({ k: 'gain', t: `${f.house}에서 보낸 생활비 +${formatMoney(v)}` }); } }
        else log.push({ k: 'warn', t: `${f.house}의 눈 밖에 나 생활비가 끊겼다` });
    }
    if (st.honor?.pension) { const tb = st.honor.hereditary ? Math.round(st.honor.pension * TAX.honorTribute) : 0; st.money += st.honor.pension - tb; log.push({ k: 'gain', t: `${st.honor.title} ${st.honor.hereditary ? '영지 수입' : '연금'} +${formatMoney(st.honor.pension)}${tb ? ` · 황실 공납 -${formatMoney(tb)}` : ''}` }); }
}

/* ───────────────────────── 말 — 혈통, 정성, 교배, 명마 거래 ───────────────────────── */
export const HORSE_GRADES = ['짐말', '보통 말', '좋은 말', '준마', '명마', '천리마'];
export const HORSE_VALUE = [1500, 3500, 9000, 25000, 80000, 300000];
/** 혈통 — [이름, 타고난 몫, 설명, 많이 나는 곳] */
export const HORSE_BREEDS = [
    ['산악 조랑말', -0.6, '작고 튼튼한 짐말. 산길에 강하다', '바르그홀름'],
    ['평원 승용마', 0, '제국 어디서나 타는 말', '브레이크 마을'],
    ['북부 군마', 0.2, '덩치 크고 겁이 없다. 기사단과 변경백가가 찾는다', '북부 변경'],
    ['남부 경주마', 0.3, '가볍고 빠르다. 하벤 경마장의 자랑, 귀족의 사냥과 경마에 쓰인다', '곡물 도시 하벤'],
    ['루미에른 궁정마', 0.4, '황궁 마구간의 피를 이은 우아한 말', '제도 루미에른'],
    ['바다 건너 사막 혈통', 0.6, '세렌포트로 들어오는 이국의 말. 지구력이 대단하다', '항구도시 세렌포트'],
];
/** 털빛과 생김새 — 혈통마다 잘 나오는 빛이 있다 */
export const HORSE_COATS = ['밤색', '짙은 밤색', '흑마', '백마', '잿빛', '얼룩 잿빛', '적갈색', '금빛(팔로미노)', '점박이', '은빛 갈기의 밤색'];
const BREED_COATS = { '산악 조랑말': ['밤색', '적갈색', '점박이', '잿빛'], '평원 승용마': ['밤색', '짙은 밤색', '적갈색', '얼룩 잿빛'], '북부 군마': ['흑마', '짙은 밤색', '잿빛'], '남부 경주마': ['밤색', '금빛(팔로미노)', '적갈색', '은빛 갈기의 밤색'], '루미에른 궁정마': ['백마', '잿빛', '흑마', '은빛 갈기의 밤색'], '바다 건너 사막 혈통': ['잿빛', '백마', '금빛(팔로미노)', '흑마'] };
const HORSE_MARKS = ['이마에 흰 별', '콧등에 흰 줄', '네 발목이 희다', '한쪽 앞발만 흰 양말', '갈기가 길고 숱이 많다', '꼬리가 땅에 닿을 듯 길다', '눈빛이 순하다', '귀가 쫑긋하고 예민하다', '목이 길고 우아하다', '가슴이 넓고 다리가 굵다', '몸이 가볍고 날렵하다', '어깨에 오래된 흉터', '눈가에 검은 무늬', '갈기 끝이 금빛으로 바랬다'];
export function horseLook(r, breed, dam, sire) {
    const pool = BREED_COATS[breed] || HORSE_COATS;
    let coat;
    const x = r();
    if (dam?.coat && x < 0.4) coat = dam.coat; else if (sire?.coat && x < 0.75) coat = sire.coat; else coat = pool[Math.floor(r() * pool.length)];
    const marks = [];
    while (marks.length < 2) { const m = HORSE_MARKS[Math.floor(r() * HORSE_MARKS.length)]; if (!marks.includes(m)) marks.push(m); }
    return { coat, marks: marks.join(', ') };
}
export const horseLookText = (h) => [h.coat, h.marks].filter(Boolean).join(' · ');
export const findBreed = (n) => HORSE_BREEDS.find(b => nospace(n || '').includes(nospace(b[0]))) || HORSE_BREEDS[1];
export const GESTATION = 330, MATURE = 720;
export const horseStage = (h, day) => { const a = day - h.born; return a < 360 ? '망아지' : a < MATURE ? '어린 말' : '다 큰 말'; };
export const horseAdult = (h, day) => day - h.born >= MATURE;
export const horseValue = (h, day) => {
    if (h.grade == null) return Math.round(HORSE_VALUE[Math.max(0, Math.min(5, Math.round(h.pot)))] * 0.4 + (h.care || 0) * 20);
    const yrs = (day - h.born) / 360;
    return Math.round(HORSE_VALUE[h.grade] * (yrs > 14 ? 0.4 : yrs > 10 ? 0.7 : 1));
};
/** 다 컸을 때 등급 — 부모와 혈통(타고난 그릇)에 정성(돌봄)이 더해지고 운이 섞인다 */
export function rollHorseGrade(h) {
    const r = rng(hashStr(`grow|${h.id}|${h.born}`));
    const care = h.care || 0;
    const shift = Math.max(-1, Math.min(1.3, (care - 60) / 70));
    const noise = (r() + r() - 1) * 0.9;
    return Math.max(0, Math.min(5, Math.round(h.pot + shift + noise)));
}
/** 정성에 따라 다 컸을 때 등급이 나올 확률 (보여 주기용 어림) */
export function horseOdds(h) {
    const out = [0, 0, 0, 0, 0, 0];
    const shift = Math.max(-1, Math.min(1.3, ((h.care || 0) - 60) / 70));
    for (let i = 0; i < 400; i++) { const a = ((i * 37) % 400) / 400, b = ((i * 91 + 13) % 400) / 400; out[Math.max(0, Math.min(5, Math.round(h.pot + shift + (a + b - 1) * 0.9)))]++; }
    return out.map(n => n / 400);
}
const HORSE_NAMES = ['바람', '은갈기', '새벽', '흑요', '불꽃', '서리', '별똥', '달빛', '천둥', '검은 깃', '햇살', '이슬', '흰발', '붉은 노을', '푸른 연기', '잿빛 구름', '금빛 들판', '폭풍', '여울', '들꽃', '그림자', '창공', '산들', '눈송이'];
const horseName = (r) => HORSE_NAMES[Math.floor(r() * HORSE_NAMES.length)];
const allHorses = (st) => (st.farms || []).flatMap(f => (f.stable || []).map(h => ({ h, f })));
export const findHorse = (st, n) => { const s = nospace(n); const all = allHorses(st); return all.find(x => nospace(x.h.name) === s) || all.find(x => nospace(x.h.name).includes(s)); };
/** 이달 말 시장 — 도시마다 다른 말이 나온다 */
export function horseMarket(st, market, day = st.day) {
    if (!MARKETS[market]) return [];
    const r = rng(hashStr(`horsemkt|${ymOf(day)}|${market}`));
    const top = { '제도 루미에른': 4, '항구도시 세렌포트': 4, '곡물 도시 하벤': 4, '브레이크 마을': 3, '북부 변경': 3, '바르그홀름': 2, '엘름바트': 2 }[market] ?? 3;
    const n = 3 + Math.floor(r() * 3);
    const out = [];
    for (let i = 0; i < n; i++) {
        const local = HORSE_BREEDS.filter(b => b[3] === market);
        const b = r() < 0.6 && local.length ? local[Math.floor(r() * local.length)] : HORSE_BREEDS[Math.floor(r() * HORSE_BREEDS.length)];
        let g = Math.max(0, Math.min(top, Math.round(1 + b[1] + (r() + r() - 1) * 1.6)));
        if (market === '제도 루미에른' && r() < 0.08) g = 4; // 귀족 마구간에서 내놓은 명마
        const age = 3 + Math.floor(r() * 7);
        const seller = g >= 4 ? pick(r, NOBLE_HOUSES.filter(h => h.title !== '황실')).name : pick(r, ['마시장 중개인', '은퇴한 기병', '떠돌이 말장수', '역참 마구간', '이웃 목장주', '파산한 상단']);
        let nm = horseName(r); for (let k = 0; k < 5 && out.some(o => o.name === nm); k++) nm = horseName(r);
        const look = horseLook(r, b[0]);
        out.push({ id: `m${ymOf(day)}${market}${i}`, name: nm, coat: look.coat, marks: look.marks, sex: r() < 0.5 ? '수' : '암', breed: b[0], grade: g, age, seller, price: Math.round(HORSE_VALUE[g] * (0.95 + r() * 0.35)), bought: !!st.horseDeals?.[`${ymOf(day)}|buy|${market}|${i}`], idx: i });
    }
    return out;
}
/** 이달 씨수말 — 다른 마구간·귀족가의 종마에게 암말을 보낼 수 있다 */
export function studOffers(st, market, day = st.day) {
    if (!MARKETS[market]) return [];
    const r = rng(hashStr(`stud|${ymOf(day)}|${market}`));
    return [0, 1].map(i => {
        const b = HORSE_BREEDS[Math.floor(r() * HORSE_BREEDS.length)];
        const g = Math.max(2, Math.min(5, Math.round(2.6 + b[1] + r() * 1.6)));
        const owner = g >= 4 ? pick(r, NOBLE_HOUSES.filter(h => h.title !== '황실')).name : pick(r, ['남부 목장주 알베르', '역참 마구간', '은퇴한 기사 오토', '세렌포트 마상']);
        const nm = horseName(r), look = horseLook(r, b[0]);
        return { name: nm, breed: b[0], grade: g, owner, fee: Math.round(HORSE_VALUE[g] * 0.08), coat: look.coat };
    });
}
/** 내 말에게 들어오는 교배 신청과 귀족의 매입 제안 */
export function horseRequests(st, day = st.day) {
    const out = [];
    const ym = ymOf(day);
    for (const { h, f } of allHorses(st)) {
        if (h.grade == null || h.grade < 3 || !horseAdult(h, day)) continue;
        const r = rng(hashStr(`hreq|${ym}|${h.id}`));
        const fame = (st.stableFame || 0) / 100;
        if (h.sex === '수' && r() < 0.25 + (h.grade - 3) * 0.25 + fame) {
            const who = h.grade >= 4 ? pick(r, presentHouses(st, day).length ? presentHouses(st, day) : NOBLE_HOUSES).name : pick(r, ['이웃 목장주', '역참 마구간', '기병대 마구간', '남부 경주마 목장']);
            out.push({ kind: 'stud', horse: h.name, from: who, fee: Math.round(HORSE_VALUE[h.grade] * 0.06 * (0.9 + r() * 0.4)), done: !!st.horseDeals?.[`${ym}|stud|${h.id}`] });
        }
        if (r() < 0.12 + (h.grade - 3) * 0.2 + fame * 0.5) {
            const pool = presentHouses(st, day).filter(x => x.title !== '황실');
            const hs = pick(r, pool.length ? pool : NOBLE_HOUSES.slice(0, 30));
            out.push({ kind: 'bid', horse: h.name, from: hs.name, price: Math.round(horseValue(h, day) * (1.2 + r() * 0.6)), done: !!st.horseDeals?.[`${ym}|bid|${h.id}`] });
        }
    }
    return out;
}
function newFoal(st, f, dam, preg, day) {
    const r = rng(hashStr(`foal|${dam.id}|${day}`));
    const bD = findBreed(dam.breed), bS = findBreed(preg.breed);
    const breed = preg.breed === dam.breed ? dam.breed : (r() < 0.5 ? dam.breed : preg.breed);
    const pot = (dam.grade + preg.grade) / 2 + (bD[1] + bS[1]) / 4;
    const look = horseLook(r, breed, dam, preg);
    const h = { id: `h${day}${Math.floor(r() * 1e6)}`, name: `${dam.name}의 망아지`, unnamed: true, coat: look.coat, marks: look.marks, sex: r() < 0.5 ? '수' : '암', breed, pot: Math.round(pot * 100) / 100, grade: null, born: day, care: 0, sire: preg.sire, dam: dam.name };
    f.stable.push(h);
    return h;
}
/** 달마다 마구간 */
function runStableMonth(st, f, day, log, L, feed) {
    if (!f.stable?.length) return;
    if (f.careMode === '정성') {
        if (f.steward || f.kin || f.workers) {
            const cost = f.stable.length * 200;
            st.money = Math.max(0, st.money - cost);
            for (const h of f.stable) if (h.grade != null) h.bond = Math.min(100, (h.bond || 0) + 2);
            log.push({ k: 'loss', t: `${f.name} 마구간 정성 관리 -${formatMoney(cost)} (${f.stable.length}마리)` });
        } else log.push({ k: 'warn', t: `${f.name} 마구간 — 정성 관리를 맡길 일손이 없다 (일꾼·관리인·가족)` });
    }
    const herdR = st.life?.목축?.rank ?? 0, rideR = st.life?.승마?.rank ?? 0;
    const here = marketOf(st.location) === f.market;
    for (const h of [...f.stable]) {
        if (h.grade == null) {
            const hands = f.steward || f.kin || f.workers;
            const add = herdR * 1.5 + rideR * 0.5 + (here ? 5 : 0) + (f.steward ? 2 : 0) + (f.kin ? 3 : 0) + (f.workers ? 2 : 0) + (feed.cover >= 1 ? 2 : -4) + (L.ratio < 0.8 ? -4 : 0) + (f.careMode === '정성' && hands ? 6 : 0);
            h.care = Math.max(0, Math.round(((h.care || 0) + add) * 10) / 10);
            if (horseAdult(h, day)) {
                h.grade = rollHorseGrade(h);
                const exp = Math.round(h.pot);
                log.push({ k: 'rank', t: `${f.name} — ${h.name}(${h.sex}·${h.breed})${/[가-힣]$/.test(h.name) && (h.name.charCodeAt(h.name.length - 1) - 0xAC00) % 28 ? '이' : '가'} 다 자랐다: ${HORSE_GRADES[h.grade]}${h.grade > exp ? ' — 들인 정성이 결실을 맺었다!' : h.grade < exp ? ' — 타고난 그릇에 못 미쳤다' : ''}` });
                if (h.grade >= 4) st.stableFame = Math.min(100, (st.stableFame || 0) + (h.grade - 3) * 15);
            }
        }
        if (h.preg && day >= h.preg.due) {
            const foal = newFoal(st, f, h, h.preg, day);
            log.push({ k: 'gain', t: `${f.name} — ${josa(h.name, '이', '가')} ${foal.sex === '수' ? '수' : '암'}망아지를 낳았다 (아비 ${h.preg.sire} · ${foal.breed} · ${foal.coat}, ${foal.marks}) — 이름을 지어 줄 것` });
            h.preg = null;
        }
    }
}

/** 지금 {{user}}에게 해당하는 기능 규칙만 — 카드 설명에서 옮겨 온 것 */
function featureRules(st, mk, F = ALL_FOCUS) {
    const R = [];
    const mr = st.orgs?.merchant?.rank ?? -1;
    if (F.trade && (mk || cargoUsed(st) || mr >= 0)) R.push('교역 규칙: 시장마다 시세가 다르고 계절·이달의 정세로 움직인다. 교역품은 "매입 상품 수량"/"매각 상품 수량"(값은 확장이 계산하니 적지 않는다). 짐은 등짐·손수레·짐마차·짐말로 늘어난다.');
    if ((F.shop || F.trade) && (mr >= 0 || st.shops?.length)) R.push('가게 규칙: 장사 가게(잡화·식료품·옷·무기·약재·교역품)는 상인 길드 등급으로 노점→점포(노점상+)→상회(점포주+). 손기술 가게(식당·여관·주점·대장간·재봉집·가죽 공방·목공방·세공방·약방)는 주인의 생활 기술 랭크로(F·D·B). 명령어: "가게개업 이름 | 종류 | 노점", "재고 가게 | 금액", "점원 가게 | +1", "가게확장 가게 | 점포", "가게평판 가게 +N", "가게폐업 가게".');
    if (F.trade && mr >= 0) R.push('상인 길드 명령어: 외상 "외상 금액"/"외상상환", 상단 "상단결성"(상회주+), 귀족 거래 "귀족납품 가문"/"귀족구입 가문"(등급에 맞는 가문만). 거상에게 귀족들은 손님이자 거래 상대 — 연회 초대·청탁·혼담·견제가 따라온다.');
    if (F.noble && (st.patron || scoutOffers(st).length)) R.push('귀족가 후원 규칙: 스카웃은 가문 사람이 찾아오거나 편지를 보내는 장면으로. 받아들이면 "스카웃수락 가문 | 역할", 그만두면 "후원해지". 후원 가문의 반대 파벌(보수파↔실용파)은 냉담하고, 우두머리 가문(발렌하임↔로세티)과는 거래가 막히고 견제를 받는다. 호감 변화는 "가문호감 가문 +N".');
    if ((F.shop || F.farm) && (st.farms?.length || st.shops?.length)) R.push('세금: 가게는 달마다 지난달 매출의 5%(영업세), 땅은 필지마다 토지세가 나간다(확장이 처리). 세리와 감독관도 이야기의 사람들이다. 식당·주점·여관은 내 농장 재료를 받을 수 있다("식재료 가게 | 농장").');
    if ((st.spouse || Object.values(st.bonds || {}).some(b => b.stage === '연인')) && !(st.children || []).length && !st.expecting && F.romance) R.push('아이가 생기면 "임신 상대"(출산은 확장이 처리, 이름은 플레이어가 짓는다). 다른 아이를 들이면 "자녀 +이름 | 성별 | 나이".');
    if (!st.farms?.length) { if (F.farm) R.push('땅을 사면 "농장구입 농장이름 | N필지"(이후 농장 규칙이 열린다).');
    } else if (F.farm) R.push('농장 명령어: "경작 농장 | 작물 N"(목초지·소작도), "휴경 농장 | 작물 N", "가축구입 농장 | 소 N", "가축매각", "농장일꾼 농장 | +N", "관리인 농장", "양조 농장 | 와인 N", "출하 농장 | 품목 N", "싣기 농장 | 품목 N", "농장소출 농장 | 품목 ±N".');
    if (F.farm && (st.farms || []).some(f => f.stable?.length)) R.push('말 명령어: "말구입 말 | 농장", "말판매 말", "말교배 암말 | 수말", "종마교배 암말 | 씨수말", "말돌보기 말 | N일"(주인이 직접 — 날짜가 흐른다, "말돌보기 전부 | N일"은 마구간 전체), "마구간관리 농장 | 정성/보통"(일손에게 맡김 — 날짜가 흐르지 않는다), "말이름 말 | 새 이름", "말타고가기 말". 망아지 이름은 플레이어가 짓는다.');
    return R.length ? ['', '■ 지금 해당하는 기능 규칙', ...R] : [];
}

/* ───────────────────────── 자녀와 대 잇기 ───────────────────────── */
export const CHILD_STAGES = [[0, '갓난아기'], [1, '아기'], [3, '어린아이'], [7, '소년기'], [13, '청소년'], [16, '어른']];
export const childAge = (c, day) => Math.max(0, Math.floor((day - c.born) / 360));
export const childStage = (c, day) => { const a = childAge(c, day); let t = CHILD_STAGES[0][1]; for (const [n, nm] of CHILD_STAGES) if (a >= n) t = nm; return t; };
export const childAdult = (c, day) => childAge(c, day) >= 16;
export const findChild = (st, n) => { const s = nospace(n || ''); return (st.children || []).find(c => nospace(c.name) === s) || (st.children || []).find(c => nospace(c.name).includes(s)); };
export const PREGNANCY = 270;
function bornChild(st, log, name, sex, other) {
    st.children = st.children || [];
    const r = rng(hashStr(`baby|${st.day}|${st.children.length}`));
    const c = { id: `c${st.day}${st.children.length}`, name: name || '이름 없는 아기', unnamed: !name, sex: sex || (r() < 0.5 ? '남' : '여'), born: st.day, other: other || st.spouse?.name || '', heir: false, role: null };
    if (!st.children.some(x => x.heir) && (st.family?.head || st.honor?.hereditary)) c.heir = true;
    st.children.push(c);
    log.push({ k: 'rank', t: `${c.sex === '남' ? '아들' : '딸'}이 태어났다${c.other ? ` (${josa(c.other, '과', '와')}의 아이)` : ''}${c.unnamed ? ' — 이름을 지어 줄 것' : ` — ${c.name}`}${c.heir ? ' · 후계자' : ''}` });
    return c;
}
/** 대를 이을 때 새 주인공에게 넘어가지 않는 것(한 사람의 몸과 경력) */
const PERSONAL_KEYS = ['lv', 'exp', 'statPoints', 'classes', 'cls', 'sub', 'life', 'cskills', 'affinity', 'companions', 'party', 'orgs', 'strikes', 'skills', 'titles', 'conds', 'quests', 'bonds', 'spouse', 'exSpouses', 'rel', 'mainJob', 'patron', 'commissions'];
function passGeneration(st, c, log) {
    const e = emptyState();
    const old = { name: st.profile.name, until: st.day, title: statusLabel(st), spouse: st.spouse?.name || '' };
    st.generations = [...(st.generations || []), old];
    for (const k of PERSONAL_KEYS) st[k] = clone(e[k]);
    st.profile = { ...st.profile, name: c.name, gender: c.sex === '남' ? '남성' : '여성', age: String(childAge(c, st.day)), story: `${old.name}의 ${c.sex === '남' ? '아들' : '딸'}. ${old.title}의 뒤를 이었다.`, perks: [] };
    st.stats = Object.fromEntries(STATS.map(s => [s, 15]));
    st.ageBase = childAge(c, st.day); st.ageDay0 = st.day;
    st.renown = Math.round((st.renown || 0) * 0.3);
    st.children = (st.children || []).filter(x => x !== c);
    if (st.family) { st.family.siblings = st.children.map(x => `${x.name}(${x.sex === '남' ? '남' : '여'})`).join(', '); if (st.family.head) st.family.favor = 100; }
    if (st.honor?.title && !st.honor.hereditary) { log.push({ k: 'info', t: `${old.name}의 ${st.honor.title}는 한 대에 한한 작위라 함께 끝났다` }); st.honor = { pts: 0, title: null, hereditary: false, pending: null }; st.noble = st.family ? st.noble : 1; }
    else if (st.honor) { st.honor.pts = 0; st.honor.pending = null; }
    for (const k of Object.keys(st.houseFavor || {})) st.houseFavor[k] = Math.round(st.houseFavor[k] * 0.7);
    for (const f of st.farms || []) if (f.kin === c.name) f.kin = null;
    for (const s of st.shops || []) if (s.kin === c.name) s.kin = null;
    st.hp = maxHP(st); st.mp = maxMP(st);
    log.push({ k: 'rank', t: `세대가 바뀌었다 — ${old.name}에서 ${c.name}에게로. 땅·가게·재산·가문·세습 작위가 이어진다` });
}

/* ───────────────────────── 세금과 의무 ───────────────────────── */
export const TAX = { shop: 0.05, land: 0.001, tribute: 0.2, honorTribute: 0.1 };
export const isTitled = (st) => !!(st.family?.head || st.honor?.title);
export function warDutyFee(st) {
    if (st.family?.head) return Math.round((TITLE_INCOME[st.family.title] || 30000) * 0.5);
    const h = st.honor?.title; if (!h) return 0;
    return h.includes('기사작') ? 5000 : Math.round((st.honor.pension || 15000) * 0.6);
}
export const warThisMonth = (day) => affairsOf(day).some(a => a.name === '전쟁 소문');

/* ───────────────────────── 이름 있는 고용인 ───────────────────────── */
const STAFF_NAMES_M = ['한스', '오토', '마르틴', '페터', '루카스', '토비아스', '에밀', '프리츠', '알브레히트', '요나스', '빌헬름', '콘라트', '파울', '디터', '카스파르'];
const STAFF_NAMES_F = ['마르타', '안나', '그레타', '엘제', '리자', '한나', '클라라', '로테', '베르타', '이다', '프리다', '헬가', '에마', '조피', '루이제'];
const STAFF_TRAITS = ['말수가 적고 손이 빠르다', '수다스럽고 동네 소문을 다 안다', '꼼꼼하지만 걱정이 많다', '힘이 장사고 술을 좋아한다', '손님 응대가 능숙하다', '고지식하고 정직하다', '꾀가 많아 셈이 밝다', '젊고 의욕이 넘친다', '나이 지긋한 베테랑', '무뚝뚝하지만 정이 깊다', '노래를 흥얼거리며 일한다', '야심이 있어 언젠가 제 가게를 내고 싶어 한다'];
function staffPerson(seed, role) {
    const r = rng(hashStr(seed));
    const f = r() < 0.5;
    const pool = f ? STAFF_NAMES_F : STAFF_NAMES_M;
    return { name: pool[Math.floor(r() * pool.length)], sex: f ? '여' : '남', trait: STAFF_TRAITS[Math.floor(r() * STAFF_TRAITS.length)], role };
}
/** 가게·농장의 이름 있는 고용인 (같은 자리엔 늘 같은 사람) */
export function namedStaff(st) {
    const out = [];
    const ov = st.staffNames || {};
    const put = (where, key, role, p) => { const id = `${where}|${key}`; const o = ov[id]; out.push({ where, key, id, role, name: o?.name || p.name, sex: p.sex, trait: o?.trait || p.trait }); };
    for (const s of st.shops || []) {
        const food = isFoodShop(s), craft = isCraftShop(s.kind);
        for (let i = 0; i < Math.min(3, s.staff || 0); i++) {
            const role = i === 0 ? (food ? (s.kind === '주점' ? '바텐더' : '주방장') : craft ? '직인' : '점원장') : (food ? '홀 일꾼' : '점원');
            put(s.name, i, role, staffPerson(`staff|${s.name}|${s.since}|${i}`, role));
        }
    }
    for (const f of st.farms || []) {
        if (f.steward) put(f.name, 'steward', '관리인', staffPerson(`staff|${f.name}|steward`, '관리인'));
        if ((f.workers || 0) >= 3) put(f.name, 'foreman', '일꾼 우두머리', staffPerson(`staff|${f.name}|foreman`, '일꾼 우두머리'));
        if ((f.stable || []).length && (f.workers || 0) >= 1) put(f.name, 'groom', '마구간지기', staffPerson(`staff|${f.name}|groom`, '마구간지기'));
        if ((f.tenant || 0) >= 3) put(f.name, 'tenant', '소작인 대표', staffPerson(`staff|${f.name}|tenant`, '소작인 대표'));
    }
    return out;
}

/* ───────────────────────── 생업끼리 — 내 농장에서 내 가게로 ───────────────────────── */
const SUPPLY_CATS = { 식당: ['곡물', '채소', '축산', '과일'], 여관: ['곡물', '채소', '축산', '술'], 주점: ['술', '축산', '곡물'] };
function supplyShops(st, f, log) {
    for (const s of (st.shops || []).filter(x => x.supply === f.name && SUPPLY_CATS[x.kind])) {
        const want = Math.round(shopCapacity(st, s, st.day) * 30 * 0.6); // 한 달 재료의 6할까지
        let got = 0; const used = [];
        for (const [g, q] of Object.entries(f.store || {})) {
            if (got >= want || q <= 0) continue;
            if (!SUPPLY_CATS[s.kind].includes(FARM_GOODS[g]?.[2])) continue;
            const unit = FARM_GOODS[g][0];
            const n = Math.min(q, Math.ceil((want - got) / unit));
            f.store[g] -= n; got += n * unit; used.push(`${g} ${n}`);
            if (f.store[g] <= 0) delete f.store[g];
        }
        for (const lot of (f.cellar || []).filter(l => s.kind !== '식당' && l.qty > 0 && BREW[l.drink] && (l.drink === '맥주 통' || drinkAge(l, st.day) >= 1))) {
            if (got >= want) break;
            const v = drinkValue(lot, st.day); const n = Math.min(lot.qty, Math.ceil((want - got) / v));
            lot.qty -= n; got += n * v; used.push(`${lot.drink} ${n}`);
        }
        f.cellar = (f.cellar || []).filter(l => l.qty > 0);
        if (got > 0) {
            const moved = f.market === s.market ? got : Math.round(got * 0.9);
            s.stock += moved; s.homegrown = ymOf(st.day);
            log.push({ k: 'info', t: `${f.name} → ${s.name}: 직접 기른 재료(${used.join(', ')}) 재고 +${formatMoney(moved)}${f.market === s.market ? '' : ' (운송 1할)'}` });
        }
    }
}

/* ───────────────────────── 달마다 일어나는 사건 ───────────────────────── */
/** 이달의 사건 — 가진 것에 따라 후보가 달라진다. 숫자가 붙은 건 확장이 바로 반영, 나머지는 GM이 이야기로 */
export function monthEvents(st, day = st.day) {
    const ym = ymOf(day), r = rng(hashStr(`mev|${ym}|${st.profile?.name || ''}`));
    const pool = [];
    const farm = (st.farms || [])[0], shop = (st.shops || [])[0], stable = (st.farms || []).find(f => f.stable?.length);
    const m = formatDate(day).m;
    if (farm) {
        if ([5, 6, 7, 8].includes(m)) pool.push({ id: 'drought', name: '가뭄', where: farm.name, desc: `${farm.name}에 비가 오지 않는다. 이달 거두는 작물이 줄어든다`, w: 2 });
        if ((farm.herd?.양 || 0) + (farm.herd?.닭 || 0) > 0) pool.push({ id: 'wolves', name: '늑대', where: farm.name, desc: `밤마다 늑대가 ${farm.name}의 우리를 노린다`, w: 2 });
        pool.push({ id: 'neighbor', name: '이웃 지주와의 다툼', where: farm.name, desc: '물길과 경계석을 두고 이웃 지주가 시비를 건다', w: 2, story: true });
        if (m === 9 || m === 10) pool.push({ id: 'harvestfest', name: '수확 잔치', where: farm.name, desc: '일꾼과 소작인들이 수확 잔치를 열자고 한다 — 인심을 얻을 기회', w: 2, story: true });
    }
    if (shop) {
        pool.push({ id: 'thief', name: '좀도둑', where: shop.name, desc: `${shop.name}의 재고가 조금씩 사라진다`, w: 2 });
        pool.push({ id: 'rival', name: '경쟁 가게 개업', where: shop.name, desc: `${shop.name} 근처에 같은 장사를 하는 가게가 문을 열었다`, w: 2, story: true });
        pool.push({ id: 'celebrity', name: '이름난 손님', where: shop.name, desc: `소문을 들은 이름난 손님이 ${shop.name}에 들른다`, w: isFoodShop(shop) ? 2 : 1 });
        pool.push({ id: 'inspect', name: '조합 단속', where: shop.name, desc: '조합 감독관이 저울과 장부를 보러 온다', w: 1, story: true });
    }
    if (stable) {
        pool.push({ id: 'horsethief', name: '말 도둑', where: stable.name, desc: `${stable.name} 마구간 근처에서 수상한 사람이 어슬렁거린다`, w: 1, story: true });
        pool.push({ id: 'race', name: '경마 대회', where: stable.name, desc: '제도 근교에서 귀족들의 경마 대회가 열린다는 소식 — 내 말을 내보낼 수 있다', w: 1, story: true });
    }
    if (st.family && !st.family.disowned) {
        pool.push({ id: 'match', name: '혼담', where: st.family.house, desc: `${st.family.house}에 혼담이 들어왔다 — 당신의 혼담일 수도, 형제의 혼담일 수도`, w: st.spouse ? 1 : 2, story: true });
        if (!st.family.head) pool.push({ id: 'sibling', name: '형제의 견제', where: st.family.house, desc: '후계와 총애를 두고 형제가 움직인다', w: 1, story: true });
        pool.push({ id: 'banquet', name: '집안 연회', where: st.family.house, desc: '가문이 연회를 연다. 얼굴을 비추라는 전갈', w: 1, story: true });
    }
    if (st.orgs?.adventurer) pool.push({ id: 'rivalparty', name: '라이벌 파티', where: '모험가 길드', desc: '같은 등급의 파티가 당신과 같은 의뢰를 노린다', w: 2, story: true });
    if ((st.children || []).length) pool.push({ id: 'child', name: '아이의 일', where: '집', desc: `${pick(r, st.children).name}에게 일이 생겼다(열병·말썽·재능의 발견)`, w: 1, story: true });
    pool.push({ id: 'rumor', name: '거리의 소문', where: '거리', desc: '사람들 입에 당신 이름이 오르내린다 — 좋은 쪽일 수도, 나쁜 쪽일 수도', w: st.renown >= 30 ? 2 : 0.5, story: true });
    if (!pool.length) return [];
    const out = [];
    const tries = r() < 0.65 ? (r() < 0.3 ? 2 : 1) : 0;
    for (let i = 0; i < tries; i++) {
        const tot = pool.reduce((a, e) => a + e.w, 0); let x = r() * tot;
        const ev = pool.find(e => (x -= e.w) <= 0) || pool[0];
        if (!out.includes(ev)) out.push(ev);
    }
    return out;
}
function applyMonthEvents(st, day, log) {
    for (const ev of monthEvents(st, day)) {
        let fx = '';
        if (ev.id === 'drought') { const f = findFarm(st, ev.where); if (f) { f.drought = ymOf(day); fx = '이달 수확 -35%'; } }
        if (ev.id === 'wolves') { const f = findFarm(st, ev.where); if (f) { const lost = []; for (const a of ['양', '닭']) { const n = f.herd?.[a] || 0; const k = Math.min(n, Math.max(1, Math.round(n * 0.12))); if (n && k) { f.herd[a] = n - k; lost.push(`${a} ${k}`); } } fx = lost.length ? `잃음: ${lost.join(', ')}` : ''; } }
        if (ev.id === 'thief') { const s = findShop(st, ev.where); if (s && s.stock > 0) { const k = Math.round(s.stock * 0.12); s.stock -= k; fx = `재고 -${formatMoney(k)}`; } }
        if (ev.id === 'celebrity') { const s = findShop(st, ev.where); if (s) { s.rep = Math.min(100, (s.rep || 0) + 4); if (isFoodShop(s)) s.fame = Math.min(100, (s.fame || 0) + 5); fx = isFoodShop(s) ? '소문 +5' : '평판 +4'; } }
        if (ev.id === 'rival') { const s = findShop(st, ev.where); if (s) { s.rival = ymOf(day); fx = '이달 손님 -15%'; } }
        log.push({ k: ev.story ? 'info' : fx.includes('+') ? 'gain' : 'warn', t: `이달의 사건 — ${ev.name}: ${ev.desc}${fx ? ` (${fx})` : ''}` });
    }
}

/* ───────────────────────── 달마다 — 세금·의무·사건 ───────────────────────── */
function runLifeMonth(st, day, log, prevDay) {
    // 토지세
    let land = 0;
    for (const f of st.farms || []) land += Math.round(f.plots * (LAND_PRICE[f.market] || 20000) * TAX.land);
    if (land) { st.money = Math.max(0, st.money - land); log.push({ k: 'loss', t: `토지세 -${formatMoney(land)} (땅 ${landTotal(st)}필지)` }); }
    // 군역 — 지난달 전쟁·마물 범람이 있었는데 나가지 않았다면 면제금
    const pym = ymOf(prevDay);
    if (isTitled(st) && warThisMonth(prevDay) && !st.warServed?.[pym]) {
        const fee = warDutyFee(st);
        if (fee) { st.money = Math.max(0, st.money - fee); log.push({ k: 'loss', t: `군역 면제금 -${formatMoney(fee)} (지난달 소집에 나가지 않음)` }); }
    }
    applyMonthEvents(st, day, log);
}
/** 앞으로의 내 일정 — 달력 탭과 GM에게 */
export function mySchedule(st, span = 120) {
    const out = [], d0 = st.day;
    const add = (day, kind, text) => { if (day >= d0 && day <= d0 + span) out.push({ day, kind, text }); };
    const nextMonth = (m) => { for (let d = d0; d <= d0 + 400; d++) { const f = formatDate(d); if (f.m === m && f.d === 1) return d; } return null; };
    for (const f of st.farms || []) {
        for (const x of f.fields || []) { const c = findCrop(x.crop); for (const m of c?.[1] || []) { const d = nextMonth(m); if (d != null) add(d, 'farm', `${f.name} ${x.crop} 수확`); } }
        for (const o of f.orchards || []) { const c = findOrchard(o.fruit); const d = nextMonth(c[1]); if (d != null) add(d, 'farm', d - o.planted < c[2] ? `${f.name} ${o.fruit} — 아직 어린나무` : `${f.name} ${o.fruit} 수확`); }
        if ((f.herd?.양 || 0) > 0) { const d = nextMonth(5); if (d != null) add(d, 'farm', `${f.name} 양털 깎기`); }
        for (const h of f.stable || []) {
            if (h.preg) add(h.preg.due, 'horse', `${h.name} 출산 예정`);
            if (h.grade == null) add(h.born + MATURE, 'horse', `${h.name} 다 자람 — 등급이 정해진다`);
        }
    }
    for (const c of st.commissions || []) add(c.due, 'order', `주문 기한 — ${c.client}: ${c.item}`);
    if (st.expecting) add(st.expecting.due, 'family', '출산 예정');
    for (const c of st.children || []) { const d16 = c.born + 16 * 360; add(d16, 'family', `${c.name} 성인이 됨`); }
    if (st.honor?.pending) { for (let d = d0; d <= d0 + 400; d++) { const f = formatDate(d); if (f.m === 6 && f.d === 10) { add(d, 'honor', `서임식 — ${st.honor.pending}`); break; } } }
    { const nm = d0 + 30 - (formatDate(d0).d - 1); if (st.credit > 0) add(nm, 'money', `외상 상환 ${formatMoney(st.credit)}`); if (st.farms?.length || st.shops?.length) add(nm, 'money', '세금 (토지세·영업세)'); }
    return out.sort((a, b) => a.day - b.day);
}

/* ───────────────────────── 나이 ───────────────────────── */
export const ageOf = (st, day = st.day) => (st.ageBase || 18) + (st.aging ? Math.floor(Math.max(0, day - (st.ageDay0 || 0)) / 360) : 0);
export function ageStage(a) { return a < 18 ? '소년기' : a < 30 ? '젊은 시절' : a < 45 ? '한창때' : a < 60 ? '중년' : a < 75 ? '노년' : '고령'; }
function ageTick(st, before, log) {
    if (!st.aging) return;
    const y0 = ageOf(st, before), y1 = ageOf(st);
    for (let a = y0 + 1; a <= y1; a++) {
        log.push({ k: 'info', t: `생일 — ${a}살이 되었다` });
        if (a === 50 || a === 60 || a === 70) {
            for (const k of ['근력', '민첩', '체력']) st.stats[k] = Math.max(3, (st.stats[k] || 15) - 3);
            st.stats.정신 = Math.min(statCap(st), (st.stats.정신 || 15) + 3);
            log.push({ k: 'warn', t: `세월이 몸에 내려앉는다 — 근력·민첩·체력 -3, 정신 +3 (${a}살)` });
        }
    }
}

/* ───────────────────────── 연대기 ───────────────────────── */
const CHRON_RE = /승급|가입 —|혼인|결혼|약혼|태어났다|가족이 되었다|물려받|서임|새 가문|개업|규모로 확장|부른다|자리에 올랐다|소문이 퍼졌다|세대가 바뀌|깨달음|클래스 습득|칭호|의절|후계자로|후계자로 지명|제명|탈퇴|군역에 나섰다|이혼|다 자랐다: (명마|천리마)|길들임|계약 —|정령계약|서임식|폐업|땅 \d+필지 구입/;
function addChron(st, t, manual) {
    st.chronicle = st.chronicle || [];
    if (st.chronicle.some(c => c.day === st.day && c.t === t)) return;
    st.chronicle.push({ day: st.day, t, m: !!manual });
    if (st.chronicle.length > 300) st.chronicle.splice(0, st.chronicle.length - 300);
}
function chronicleFrom(st, entries) {
    for (const e of entries) if (e && e.k !== 'warn' && !/^이달의 사건|^새 달/.test(e.t || '') && CHRON_RE.test(e.t || '')) addChron(st, String(e.t).replace(/\s*[-+]\d[\d,]*(백금|금|은|동)(\s\d+(은|동))*/g, '').replace(/\s*\((금고|하루|달마다)[^)]*\)/g, '').trim());
}
const CHRON_MAJOR = /혼인|결혼|태어났다|가족이 되었다|서임|새 가문|세대가 바뀌|물려받|의절|이혼|후계자로|군역에 나섰다|[SA]등급|상회주|거상|기사 서임|작위/;
/** 프롬프트용 연대기 — 굵직한 일(혼인·출생·서임·대물림 등, 직접 적은 기록)과 최근 일만, 한 줄씩 짧게 */
export function chronicleText(st, recent = 4, major = 6) {
    const c = st.chronicle || [];
    if (!c.length) return '';
    const fmt = (x) => { const d = formatDate(x.day); const t = x.t.length > 46 ? x.t.slice(0, 45) + '…' : x.t; return `${d.y}.${d.m} ${t}`; };
    if (c.length <= recent + major) return c.map(fmt).join(' / ');
    const tail = c.slice(-recent);
    const big = c.slice(0, -recent).filter(x => x.m || CHRON_MAJOR.test(x.t)).slice(-major);
    return [...big.map(fmt), '…', ...tail.map(fmt)].join(' / ');
}
/** 프롬프트에 넣을 인물 노트 — 가까운 사람 먼저 */
export function notesForPrompt(st, max = 14) {
    const notes = st.notes || {};
    const names = Object.keys(notes);
    if (!names.length) return [];
    const score = (n) => (st.spouse?.name === n ? 1000 : 0) + (st.party?.some(m => m.name === n) ? 500 : 0) + (st.bonds?.[n] ? 300 : 0) + Math.abs(st.rel?.[n] || 0) + Math.max(0, 60 - (st.day - (notes[n].upd || 0)) / 10);
    return names.sort((a, b) => score(b) - score(a)).slice(0, max).map(n => `${n} — ${notes[n].t}`);
}

/* ───────────────────────── 혼담 — 집안의 격에 맞는 상대가 들어온다 ───────────────────────── */
export function familyStanding(st) {
    const wealth = (st.money || 0) + (st.bank || 0) + (st.farms || []).reduce((a, f) => a + f.plots * (LAND_PRICE[f.market] || 20000), 0) + (st.shops || []).reduce((a, s) => a + (SHOP_TIERS[s.tier]?.open || 0), 0);
    const w = Math.max(0, Math.min(25, (Math.log10(Math.max(1, wealth)) - 3) * 6));
    const land = { 대지주: 8, '영지 같은 대지주': 12, 지주: 4 }[landTitle(st)] || 0;
    const fav = Math.max(0, ...Object.values(st.houseFavor || {})) / 10;
    return Math.round((st.noble || 1) * 9 + Math.min(25, (st.renown || 0) / 3) + w + land + fav);
}
export const MATCH_TIERS = [
    [0, '이웃 농가·장인 집안'], [22, '마을 유지·부유한 장인 집안'], [38, '상회 집안·기사 집안'], [54, '남작가·신흥 귀족'], [68, '자작·백작가'], [84, '후작·공작가'],
];
export const matchTier = (sc) => { let t = 0; MATCH_TIERS.forEach(([n], i) => { if (sc >= n) t = i; }); return t; };
const MATCH_M = ['레온', '루카스', '테오', '율리안', '마테오', '에드가', '아르노', '세드릭', '펠릭스', '노아', '다니엘', '빅토르'];
const MATCH_F = ['아델라', '엘레나', '로제', '세실리아', '마리안', '리나', '이렌', '클로에', '비앙카', '소피아', '헬레나', '아멜리'];
const COMMON_FAM = [['방앗간 집안', '방앗간'], ['대장장이 집안', '대장간'], ['양조장 집안', '양조장'], ['직물상 집안', '직물'], ['여관 주인 집안', '여관'], ['포목점 집안', '포목'], ['곡물상 집안', '곡물'], ['선주 집안', '배'], ['약재상 집안', '약재']];
const COMMON_SUR = ['뮐러', '슈미트', '베커', '호프만', '바그너', '클라인', '브라운', '하르트', '포겔', '렌츠'];
/** 이달 들어온 혼담 */
export function matchOffers(st, day = st.day) {
    const ym = ymOf(day), sc = familyStanding(st), tier = matchTier(sc);
    const r = rng(hashStr(`match|${ym}|${st.profile?.name || ''}`));
    const cands = [];
    for (const c of st.children || []) if (!c.spouse && !c.unnamed && childAge(c, day) >= 15) cands.push({ name: c.name, sex: c.sex, age: childAge(c, day) });
    const selfAge = typeof ageOf === 'function' ? ageOf(st, day) : 20;
    if (!st.spouse && !Object.values(st.bonds || {}).some(b => b.stage === '약혼') && selfAge >= 16 && (st.family || st.noble >= 3 || sc >= 30)) cands.push({ name: '본인', sex: /여/.test(st.profile?.gender || '') ? '여' : '남', age: selfAge });
    const out = [];
    for (const c of cands) {
        if (r() > 0.3) continue;
        const t = Math.max(0, Math.min(MATCH_TIERS.length - 1, tier + (r() < 0.2 ? -1 : r() < 0.15 ? 1 : 0)));
        const female = c.sex === '남';
        const first = pick(r, female ? MATCH_F : MATCH_M);
        let family, house = null, desc;
        if (t >= 3) {
            const want = t === 3 ? ['남작'] : t === 4 ? ['자작', '백작'] : ['후작', '공작', '변경백'];
            const pool = NOBLE_HOUSES.filter(h => want.includes(h.title) && h.name !== st.family?.house && houseStance(st, h) === 'ok');
            const h = pick(r, pool.length ? pool : NOBLE_HOUSES.filter(x => x.title === '남작'));
            family = h.name; house = h.name; desc = `${h.title}가의 ${female ? (r() < 0.5 ? '장녀' : '차녀') : (r() < 0.4 ? '차남' : '삼남')} — ${h.trait}`;
        } else if (t === 2) { const k = r() < 0.5; family = k ? `${pick(r, COMMON_SUR)} 기사 집안` : `${pick(r, COMMON_SUR)} 상회`; desc = k ? '대대로 기사를 낸 집안' : '제도에 점포를 여럿 둔 상회'; }
        else { const f = pick(r, COMMON_FAM); family = `${pick(r, COMMON_SUR)} ${f[0]}`; desc = t === 1 ? `마을에서 이름난 ${f[1]} 집안` : `성실한 ${f[1]} 집안`; }
        const person = `${first}${house ? ' ' + (NOBLE_HOUSES.find(h => h.name === house)?.short || house.split(' ')[0]) : ''}`;
        const id = `${ym}|${c.name}|${person}`;
        out.push({ id, forName: c.name, person, family, house, tier: t, tierName: MATCH_TIERS[t][1], desc, age: Math.max(15, c.age + Math.round((r() - 0.5) * 6)), done: st.matchDone?.[id] || null });
    }
    return out;
}

/* ───────────────────────── 장비 강화와 내구도 ───────────────────────── */
export const ENHANCE_RATE = [0.95, 0.9, 0.8, 0.7, 0.6, 0.45, 0.35, 0.25, 0.15, 0.1];
export const enhanceCost = (plus) => Math.round(500 * Math.pow(1.8, plus));
export function gearOf(st, slot) {
    const name = st.equip?.[slot]; if (!name) return null;
    st.gear = st.gear || {};
    if (!st.gear[slot] || st.gear[slot].name !== name) st.gear[slot] = { name, plus: 0, dur: 100, max: 100 };
    return st.gear[slot];
}
export const gearLabel = (g) => g ? `${g.name}${g.plus ? ` +${g.plus}` : ''}${g.dur <= 0 ? ' (망가짐)' : g.dur < 30 ? ' (많이 상함)' : ''}` : '';
/** 강화·수리를 맡길 수 있는 곳 */
export function smithHere(st) {
    const city = placeKind(st.location) === 'city';
    const own = (st.shops || []).some(s => s.kind === '대장간' && s.market === marketOf(st.location));
    const rank = st.life?.대장일?.rank ?? -1;
    return { city, own, rank, canRepair: city || own || rank >= 3, canEnhance: city || (own && rank >= 4), self: own || rank >= 3 };
}
export function repairCost(st, g) { const lost = Math.max(0, g.max - g.dur); return smithHere(st).self ? 0 : Math.round(lost * 3 * (1 + g.plus * 0.4)); }
/* ───────────────────────── 몬스터 도감 ───────────────────────── */
/** [이름, 등급, 사는 곳, 약점, 소재, 한 줄] */
export const BESTIARY = [
    ['슬라임', 'F', '미궁 상층·습지', '핵을 찌르면 끝 · 불', '슬라임 젤', '산성 체액에 장비가 녹는다'],
    ['뿔토끼', 'F', '들판', '옆구리 · 덫', '뿔토끼 고기·뿔', '놀라면 들이받는다. 식당이 고기를 산다'],
    ['거대 쥐', 'F', '하수도·미궁 상층', '불빛 · 떼를 흩뜨리기', '쥐 가죽', '수가 많아 귀찮다'],
    ['스켈레톤', 'F', '미궁 상층·묘지', '둔기 · 빛', '마석(F)', '부러진 검을 휘두르는 해골'],
    ['고블린', 'E', '흑림·마을 외곽', '불 · 우두머리를 먼저', '왼쪽 귀·조잡한 무기', '교활하고 떼로 다닌다'],
    ['코볼트', 'E', '광산', '좁은 통로에서 몰아넣기', '코볼트 송곳니', '광산에 둥지를 튼다'],
    ['흑림 늑대', 'E', '흑림', '우두머리 · 불', '검은 늑대 가죽', '3~8마리 무리'],
    ['킬러 비', 'E', '꽃밭·숲', '연기 · 둥지째 태우기', '독침·꿀', '꿀은 비싸게 팔린다'],
    ['맨드레이크', 'E', '음습한 숲', '귀마개 · 뽑기 전 묶기', '맨드레이크 뿌리', '뽑으면 비명으로 기절시킨다'],
    ['홉고블린', 'D', '흑림 깊은 곳', '무장 틈 · 혼자 떼어 내기', '마석(D)·쓸 만한 무기', '고블린 무리를 이끈다'],
    ['오크', 'D', '변경·산악', '무릎 · 지구전', '오크 가죽·송곳니', '힘이 세고 질기다'],
    ['자이언트 스파이더', 'D', '흑림 깊은 곳', '불 · 다리 관절', '거미줄 실·독샘', '거미줄 실은 재봉 길드가 산다'],
    ['구울', 'D', '미궁·묘지', '빛 · 마비 독 해독약 준비', '구울 손톱', '마비 독 발톱'],
    ['오우거', 'C', '산악·숲 깊은 곳', '다리를 베어 쓰러뜨리기', '오우거 뼈·가죽', '몽둥이 한 방에 사람이 터진다'],
    ['트롤', 'C', '늪·동굴', '불·산으로 상처 지지기', '트롤 피(재생약 재료)', '재생력이 무시무시하다'],
    ['리자드맨', 'C', '늪지', '추위 · 꼬리', '리자드맨 비늘', '창을 쓰는 늪의 전사'],
    ['하피', 'C', '절벽', '날개 · 활', '하피 깃털', '무리로 하늘에서 덮친다'],
    ['미노타우로스', 'C', '미궁 중층', '돌진을 피해 벽에 박게 하기', '미노타우로스 뿔', '도끼를 든 소머리 거인'],
    ['와이번', 'B', '잿빛 산맥', '날개막 · 꼬리 독침 주의', '와이번 비늘·독침', '소재가 비싸다'],
    ['그리폰', 'B', '산악 절벽', '둥지를 노리면 분노', '그리폰 깃털', '길들이면 최고의 탈것'],
    ['키메라', 'B', '황혼 경계', '머리마다 다른 약점', '키메라 마석', '사자·염소·뱀 머리'],
    ['고블린 킹', 'B', '흑림 최심부', '왕만 쓰러뜨리면 무리가 흩어진다', '왕관 조각·대형 마석', '고블린 수백을 거느린다'],
    ['데스나이트', 'B', '미궁 하층', '빛 · 성수', '저주받은 갑옷 조각', '죽은 기사의 원념'],
    ['바실리스크', 'A', '사막·동굴', '거울 · 눈을 가리기', '석화의 눈', '눈을 마주치면 돌이 된다'],
    ['히드라', 'A', '늪 깊은 곳', '목을 베고 지지기', '히드라 독', '머리가 재생한다'],
    ['리치', 'A', '미궁 하층', '성구(경함) 파괴', '리치의 성구', '불사의 마도사'],
];
export const findMonster = (n) => { const s = nospace(n || ''); return BESTIARY.find(m => nospace(m[0]) === s) || BESTIARY.find(m => s.includes(nospace(m[0])) || nospace(m[0]).includes(s)); };
export const CODEX_TIERS = [[1, '이름과 사는 곳'], [5, '약점'], [15, '소재'], [40, '숙달']];
export function codexLevel(kills) { let t = 0; CODEX_TIERS.forEach(([n], i) => { if (kills >= n) t = i + 1; }); return t; }
/* ───────────────────────── 던전 ───────────────────────── */
/* ───────────────────────── 유적과 금서 — 직업을 가리지 않는 발견 ─────────────────────────
   미궁에서 새 층을 밟을 때 낮은 확률로, 수호자를 쓰러뜨리면 꽤 높은 확률로, 또는 GM이 "발견"을 적으면 확장이 내용을 정한다.
   장비는 {{user}}의 직업과 상관없이 나온다 — 팔거나, 동료·지인에게 선물하거나, 그 직업을 보조 클래스로 배워 직접 쓴다. */
export const SUMMON_GRADES = ['하위', '중위', '상위', '군주급'];
export function summonGradeOf(text = '') {
    const t = String(text);
    for (const R of Object.values(TRUE_NAMES)) for (const g of [3, 2, 1]) if (R[g].some(n => t.includes(n) || t.includes(n.split(' ').pop()))) return g;
    if (/군주|대공|대천사|리바이어던|여왕|마왕/.test(t)) return 3;
    if (/상위|백작|천사/.test(t)) return 2;
    if (/중위/.test(t)) return 1;
    return 0;
}
export function knowsTrueName(st, name = '', species = '') {
    const n = nospace(name), t = nospace(`${name}${species}`);
    return (st.truenames || []).some(x => { const k = nospace(x.name), short = nospace(x.name.split(' ').pop()); return t.includes(k) || (n.length >= 2 && (k.includes(n) || n === short)) || t.includes(short); });
}
function addTrueName(st, tn, log) {
    st.truenames = st.truenames || [];
    if (st.truenames.some(x => nospace(x.name) === nospace(tn.name))) { log.push({ k: 'info', t: `이미 아는 진명 — ${tn.name}` }); return; }
    st.truenames.push({ name: tn.name, realm: tn.realm || '', grade: tn.grade ?? summonGradeOf(tn.name), day: st.day });
    log.push({ k: 'rank', t: `진명을 알았다 — ${tn.realm ? tn.realm + ' ' : ''}${SUMMON_GRADES[tn.grade ?? 0]} 「${tn.name}」` });
}
export const RELIC_GEAR = {
    전사: [['거인의 양손 도끼 「산맥가르개」', '무기'], ['녹슨 왕의 판금 갑옷', '방어구']],
    검사: [['별빛 서린 장검 「새벽칼」', '무기'], ['기사왕의 문장 방패', '방패']],
    창술사: [['용비늘 미늘창', '무기'], ['기마 창병의 은빛 흉갑', '방어구']],
    격투가: [['고대 수도승의 너클', '무기'], ['바람을 읽는 띠', '장신구']],
    궁수: [['요정 장궁 「별사냥꾼」', '무기'], ['빗나가지 않는 깃 화살통', '장신구']],
    도적: [['그림자 비수 「밤의 혀」', '무기'], ['발소리를 삼키는 장화', '장신구']],
    음유시인: [['세이렌 뼈 류트', '무기'], ['옛 궁정악사의 깃털 모자', '장신구']],
    마법사: [['청금석 지팡이 「별의 눈」', '무기'], ['봉인된 고대 마도서', '보조']],
    치유사: [['옛 성녀의 성표', '무기'], ['빛을 머금은 사제복', '방어구']],
    정령술사: [['정령이 깃든 원석 팔찌', '장신구'], ['고목의 심재 지팡이', '무기']],
    소환사: [['피로 쓴 계약 반지', '장신구'], ['이계 문자가 새겨진 소환 장갑', '보조']],
    테이머: [['고대 조련사의 뿔피리', '장신구'], ['짐승 왕의 이빨 목걸이', '장신구']],
};
export const RELIC_TREASURE = ['황금 성배', '옛 제국 왕관 조각', '마석이 박힌 귀걸이 한 쌍', '봉인된 보석함', '옛 제국 금화 한 줌', '용의 비늘 조각', '별자리가 새겨진 은잔', '성녀의 성유물'];
export const TRUE_NAMES = {
    마계: { book: '붉은 밤의 계약서', 1: ['그림자 사냥개 바르그', '불꽃 혀의 임프 킬리'], 2: ['피의 백작 발타르', '재의 기사 모르간트'], 3: ['마계 대공 아스모데아'] },
    천계: { book: '일곱 날개의 기도서', 1: ['은빛 날개의 성수 엘리온', '빛살 성수 아우렐'], 2: ['불꽃검의 천사 세라피엘'], 3: ['대천사 루미엘'] },
    심연: { book: '가라앉은 자들의 항해일지', 1: ['검은 물뱀 니크스', '심해 등불 물뱀 오르'], 2: ['익사한 왕 하달'], 3: ['심연의 군주 리바이어던'] },
    요정계: { book: '버섯 고리의 노래집', 1: ['가시덤불 요정 핍', '이슬 요정 기사 린'], 2: ['달빛 요정 기사 엘윈'], 3: ['요정 여왕 마브'] },
};
const RELIC_VAL = [[20000, 80000], [60000, 240000], [200000, 800000]];   // 상층·중층·하층 (동)
function rollRelic(st, log, { kind = null, band = 0, seed = '' } = {}) {
    st.relicN = (st.relicN || 0) + 1;
    const r = rng(hashStr(`${st.profile?.name || ''}|relic|${seed}|${st.relicN}`));
    const b = Math.max(0, Math.min(2, band));
    const k = kind || (r() < 0.45 ? 'gear' : r() < 0.64 ? 'treasure' : 'book');
    const [lo, hi] = RELIC_VAL[b];
    st.relics = st.relics || {};
    let name, R;
    if (k === 'gear') {
        const cls = pick(r, Object.keys(RELIC_GEAR)); const [nm, slot] = pick(r, RELIC_GEAR[cls]);
        name = `${nm} (${cls} 장비)`; R = { kind: '장비', cls, slot, val: between(r, lo, hi) };
    } else if (k === 'treasure') {
        name = pick(r, RELIC_TREASURE); R = { kind: '보물', val: between(r, lo, hi) };
    } else {
        const realm = pick(r, Object.keys(TRUE_NAMES));
        const g = b >= 2 && r() < 0.25 ? 3 : b >= 1 && r() < 0.5 ? 2 : 1;
        const being = pick(r, TRUE_NAMES[realm][g]);
        name = `금서 『${TRUE_NAMES[realm].book}』 — ${being.split(' ').pop()}의 장`;
        R = { kind: '금서', val: between(r, lo, hi) * (g + 1), tn: { name: being, realm, grade: g } };
    }
    if (st.relics[name]) R = st.relics[name]; else st.relics[name] = R;
    const i = st.items.findIndex(x => x.name === name);
    if (i >= 0) st.items[i].qty += 1; else st.items.push({ name, qty: 1 });
    log.push({ k: 'rank', t: `발견 — ${name}${R.kind === '금서' ? ` (${R.tn.realm}의 ${SUMMON_GRADES[R.tn.grade]} 존재의 진명이 적혀 있다 · 소환사가 "해독"하면 진명을 안다)` : ''} · 감정가 약 ${formatMoney(R.val)}` });
    addChron(st, `${josa(name, '을', '를')} 발견했다`);
    return name;
}
/** 오늘 기한이 지난 대가 — 어기면 그 존재가 분노한다 */
function checkPacts(st, log) {
    for (const p of st.pacts || []) {
        if (p.done || p.broken || st.day <= p.due) continue;
        p.broken = true;
        const ci = findComp(st, p.who);
        if (ci >= 0) { const c = st.companions[ci]; c.wrath = true; c.bond = Math.max(0, c.bond - 20); }
        log.push({ k: 'warn', t: `계약의 대가를 치르지 못했다 — ${p.who}: ${p.what}. ${p.who}가 분노한다 (유대 -20)` });
    }
}

export const DUNGEONS = {
    '고대 미궁 아르카': { short: '아르카', zones: [
        [1, 10, '이끼 낀 입구 회랑', '무너진 석조 회랑과 녹슨 횃불 받침. 신참 모험가로 늘 북적인다.', '스켈레톤·슬라임·거대 쥐·고블린', '해골 문지기'],
        [11, 20, '물에 잠긴 지하 신전', '무릎까지 차는 검은 물과 무너진 제단. 물소리에 발소리가 묻힌다.', '구울·물뱀·함정 지대', '신전을 지키는 미노타우로스'],
        [21, 30, '거꾸로 선 서고', '책장이 천장에 매달린 뒤집힌 도서관. 탑의 마법사들이 고문서를 노린다.', '가고일·살아 있는 마도서·환영 함정', '서고지기 골렘'],
        [31, 40, '잿불 용광로', '고대 대장간과 마그마 수로. 숨이 막히는 열기.', '데스나이트·화염 정령·용암 도마뱀', '용광로의 데스나이트'],
        [41, 47, '별빛 묘역', '천장의 마석이 별자리처럼 빛나는 고대 왕들의 무덤. 47층 끝에 봉인된 문이 있다.', '리치·망령·묘지기', ''],
        [48, 0, '봉인 문 너머', '아무도 돌아와 말해 주지 않은 곳. 처음 닿은 이가 그 모습을 정한다.', '알 수 없음', ''],
    ], bands: [[1, '상층', 'F~D급 — 스켈레톤·슬라임·고블린'], [11, '중층', 'C~B급 — 미노타우로스·구울·함정 지대'], [31, '하층', 'A급 이상 — 데스나이트·리치'], [48, '미답', '아무도 가 보지 못한 곳']], record: 47 },
};
export const findDungeon = (n) => { const s = nospace(n || ''); return Object.keys(DUNGEONS).find(k => nospace(k) === s || nospace(k).includes(s) || nospace(DUNGEONS[k].short) === s) || null; };
export function dungeonZone(name, fl) { const D = DUNGEONS[name]; if (!D?.zones) return null; let z = D.zones[0]; for (const x of D.zones) if (fl >= x[0]) z = x; return z; }
export function dungeonBand(name, fl) { const D = DUNGEONS[name]; if (!D) return null; let b = D.bands[0]; for (const x of D.bands) if (fl >= x[0]) b = x; return b; }

/* ───────────────────────── 변동 누락 의심 ───────────────────────── */
const MISS_RULES = [
    ['돈', /(?:\d+\s*(?:백금|금|은|동)(?:화)?|금화|은화|동화|동전)[^.!?\n]{0,30}(?:건네|건넸|받았|받아 들|내밀|치렀|치르|지불|샀다|팔았|벌었|주었|쥐여|잃었|빼앗)|값을 치[르렀]|돈을 (?:건네|내|받|주|치)|보수를 (?:받|건네)|지불했|품삯을 받/, (o, l) => o.some(x => /money|trade|buy|sell|quest|deliver|work|shop|repay|credit|deposit|withdraw|horse|stock|farm|nobleSell|nobleBuy|order/.test(x.key)) || l.some(x => /\d+(백금|금|은|동)/.test(x.t))],
    ['날짜', /다음 날|이튿날|이틀(?:이|간| 뒤| 후)|사흘|나흘|닷새|며칠(?:이|간| 뒤| 후)|일주일|열흘|한 달(?:이| 뒤| 후)|몇 주/, (o, l) => o.some(x => /^(day|work|horseCare|train|rest)/.test(x.key)) || l.some(x => /경과/.test(x.t))],
    ['위치', /에 도착했|에 도착하자|에 당도했|에 닿았다|에 이르렀다|성문을 (?:나섰|통과)/, (o, l) => o.some(x => /^(loc|horseRide|dungeon|dungeonOut)/.test(x.key)) || l.some(x => x.t.startsWith('→'))],
    ['HP', /피를 흘리|상처를 입|부상을 입|베였다|찔렸다|얻어맞|화상을 입|정신을 잃|쓰러졌다/, (o, l) => o.some(x => /hp|Hp|cond|Cond|gearDmg/.test(x.key))],
];
/** GM 본문엔 돈·날짜·이동·부상 기색이 있는데 <변동>에 그게 없으면 — 의심 목록 */
export function suspectMissing(text, log = []) {
    const body = String(text || '').replace(/<([가-힣A-Za-z]+)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/^\[알림\].*$/gm, ' ');
    const ops = parseOps(text);
    return MISS_RULES.filter(([, re, ok]) => re.test(body) && !ok(ops, log)).map(r => r[0]);
}

/* ───────────────────────── 시간대 · 사람들의 하루 ───────────────────────── */
export const TODS = ['아침', '낮', '저녁', '밤'];
export const todOf = (st) => TODS[st.tod ?? 0] || '아침';
const 대로 = '제도 루미에른 · 길드 대로', 시장 = '제도 루미에른 · 사거리 시장', 골목 = '제도 루미에른 · 회색 골목', 백은 = '제도 루미에른 · 백은 구역', 부두 = '제도 루미에른 · 루미강 부두', 브레이크 = '제도 외곽 · 브레이크 마을', 흑림 = '흑림 가장자리';
/** 이름 있는 사람들의 하루 — [아침, 낮, 저녁, 밤] = [장소, 자리] · rest = 쉬는 날(이레마다)의 낮 */
export const NPC_SCHEDULES = {
    '미렐': { role: '모험가 길드 접수원', at: [[대로, '모험가 길드 접수대'], [대로, '모험가 길드 접수대'], [대로, '길드 1층 주점'], [대로, '길드 뒤 하숙집']], rest: [시장, '시장 빵집 골목'] },
    '가렛 브론': { role: '모험가 길드장', at: [[대로, '길드 뒤뜰 훈련장'], [대로, '길드 3층 길드장실'], [대로, '길드 1층 주점 구석 자리'], [대로, '길드 3층 길드장실']] },
    '세실 노어': { role: '부길드장', at: [[대로, '길드 2층 심사실'], [대로, '길드 2층 심사실'], [대로, '청람의 탑 제도 지부 서고'], [대로, '길드 2층 심사실']] },
    '카일 바렛': { role: '라이벌 신인 검사', at: [[대로, '모험가 길드 의뢰판 앞'], [흑림, '흑림 가장자리 사냥터'], [대로, '은빛 망아지 정'], [대로, '은빛 망아지 정 2층']] },
    '마르게': { role: '은빛 망아지 정 주인', at: [[시장, '시장 식재료 골목'], [대로, '은빛 망아지 정 주방'], [대로, '은빛 망아지 정 카운터'], [대로, '은빛 망아지 정 카운터']] },
    '보르크': { role: "A급 파티 '붉은 송곳니' 리더", at: [[대로, '길드 뒤뜰 훈련장'], [대로, '모험가 길드 의뢰판 앞'], [대로, '길드 1층 주점의 시끄러운 탁자'], [대로, '길드 1층 주점의 시끄러운 탁자']] },
    '클라라 리히터': { role: '몰락 남작가의 영애 모험가', at: [[대로, '길드 뒤뜰 훈련장'], [흑림, '흑림 가장자리'], [백은, '저당 잡힌 리히터가 저택'], [백은, '저당 잡힌 리히터가 저택']] },
    '토마스': { role: '상인 길드 접수원', at: [[대로, '상인 길드 회관 창구'], [대로, '상인 길드 회관 창구'], [시장, '시장 선술집'], [대로, '회관 위층 하숙방']], rest: [시장, '시장 서점'] },
    '베사': { role: '회색 골목의 노파', at: [[골목, '공동 우물가'], [골목, '골목 어귀 좌판'], [골목, '공동 숙소'], [골목, '공동 숙소']] },
    '늙은 조': { role: '루미강 낚시꾼', at: [[부두, '루미강 다리 아래'], [부두, '루미강 다리 아래'], [부두, '부두 선술집'], [부두, '강가 오두막']] },
    '그레고르': { role: '브레이크 마을 대장장이 겸 술집 주인 · 바르톨의 소꿉친구', at: [[브레이크, '마을 대장간'], [브레이크, '마을 대장간'], [브레이크, '마을 술집'], [브레이크, '마을 술집']] },
    '오드리': { role: '약초를 다루는 마녀 할머니', at: [[흑림, '흑림 가장자리 약초밭'], [브레이크, '마을 외딴 오두막'], [브레이크, '마을 외딴 오두막'], [브레이크, '마을 외딴 오두막']] },
    '하인츠': { role: '브레이크 마을 촌장', at: [[브레이크, '마을 회관'], [브레이크, '마을 회관'], [브레이크, '마을 술집'], [브레이크, '촌장 집']] },
    '그레타': { role: '늙은 조련사', at: [[브레이크, '마을 목장'], [브레이크, '마을 목장'], [브레이크, '목장 집'], [브레이크, '목장 집']] },
};
const restDay = (day) => day % 7 === 6;
const DISTRICT_HINT = { '시장': 시장, '골목': 골목, '부두|강가|다리 아래': 부두, '백은|저택|황궁': 백은, '길드|대로|여관|망아지': 대로, '브레이크|마을': 브레이크, '흑림': 흑림 };
const PRIVATE = /하숙|숙소|오두막|집$|방$|저택|2층/;
/** 이 사람이 지금(또는 그 시간대에) 어디 있나 — 플레이어·GM이 정한 일정이 먼저 */
export function npcWhere(st, name, tod = st.tod ?? 0) {
    const own = st.schedules?.[name];
    if (own) { const p = own[tod] || own.find(Boolean); return p ? { loc: p[0], spot: p[1] || '' } : null; }
    const s = NPC_SCHEDULES[name];
    if (!s) return null;
    if (restDay(st.day) && s.rest && tod === 1) return { loc: s.rest[0], spot: s.rest[1], rest: true };
    const p = s.at[tod]; return { loc: p[0], spot: p[1] };
}
const sameLoc = (a, b) => { const x = nospace(a), y = nospace(b); return !!x && !!y && (x === y || x.includes(y) || y.includes(x)); };
/** 아는 사람 — 관계·노트·배우자·동료에 있거나, 일정을 정해 둔 사람 */
function knownPeople(st) {
    const set = new Set([...Object.keys(st.rel || {}), ...Object.keys(st.notes || {}), ...Object.keys(st.schedules || {})]);
    if (st.spouse) set.add(st.spouse.name);
    for (const p of st.party || []) set.add(p.name);
    return [...set];
}
const keyName = (n) => Object.keys(NPC_SCHEDULES).find(k => nospace(n).startsWith(nospace(k)) || nospace(k).startsWith(nospace(n))) || n;
/** 지금 이 자리에 있을 사람들 */
export function peopleHere(st) {
    const out = [], seen = new Set();
    for (const n of [...Object.keys(st.schedules || {}), ...Object.keys(NPC_SCHEDULES)]) {
        if (seen.has(n)) continue; seen.add(n);
        const w = npcWhere(st, n); if (w && sameLoc(w.loc, st.location) && !PRIVATE.test(w.spot)) out.push({ name: n, spot: w.spot, role: (NPC_ARCS[npcInfo(n)?.n] && npcNow(st, n)?.role) || NPC_SCHEDULES[n]?.role || '' });
    }
    return out.slice(0, 6);
}
/** 아는 사람들의 지금 자리 (일정이 있는 사람만) */
export function knownWhere(st) {
    const out = [];
    for (const n of knownPeople(st)) { const k = keyName(n); const w = npcWhere(st, k); if (w) out.push({ name: n, key: k, loc: w.loc, spot: w.spot, here: sameLoc(w.loc, st.location), rest: !!w.rest, role: NPC_SCHEDULES[k]?.role || '' }); }
    return out;
}


/* ───────────────────────── 인물 도감 — 이름 있는 사람들의 고정 외모 ─────────────────────────
   GM이 장면마다 머리색·눈색을 바꾸지 않도록 외모를 못 박아 둔다. 초상 그림은 portraits/<file>.jpg */
export const NPC_GROUPS = ['모험가 길드', '이름난 모험가', '상인', '청람의 탑', '황실 기사단', '빛의 성교회', '황가', '귀족', '거리와 뒷골목', '브레이크 마을', '스승'];
export const NPC_DIR = [
    {"n": "미렐 하트웰", "aka": ["미렐"], "g": "모험가 길드", "role": "길드 접수원 · 신입 담당", "who": "인간 여성 · 20대 중반", "look": "밤색 머리를 한쪽 어깨로 느슨하게 땋아 늘어뜨림, 웃으면 휘어지는 녹갈색 눈, 콧등의 주근깨, 짙은 녹색 길드 조끼와 흰 블라우스, 귀에 꽂은 깃펜", "file": "mirel"},
    {"n": "가렛 브론", "aka": ["가렛", "길드장"], "g": "모험가 길드", "role": "모험가 길드장 · 전 S급 '철벽'", "who": "인간 남성 · 50대", "look": "짧게 깎은 잿빛 머리와 수염, 이마에서 뺨까지 내려온 흉터, 회청색 눈, 떡 벌어진 어깨, 청동빛 마도 의수를 단 왼팔", "file": "garret"},
    {"n": "세실 노어", "aka": ["세실"], "g": "모험가 길드", "role": "부길드장 · 승급 심사 담당", "who": "엘프 남성 · 겉모습 30대(200살 넘음)", "look": "어깨까지 오는 곧은 은회색 머리, 뾰족한 귀, 옅은 보랏빛 눈, 가는 금테 안경, 단정한 검은 코트", "file": "cecil"},
    {"n": "카일 바렛", "aka": ["카일"], "g": "모험가 길드", "role": "같은 시기에 등록한 라이벌 신인 검사", "who": "인간 남성 · 18세", "look": "짧고 뻗친 검은 머리, 날카로운 호박색 눈, 마른 근육질, 해진 남색 망토, 검과 떡갈나무 문장이 새겨진 낡은 장검", "file": "kyle"},
    {"n": "보르크", "aka": ["보르크", "붉은 송곳니"], "g": "모험가 길드", "role": "A급 파티 '붉은 송곳니' 리더", "who": "늑대 수인 남성 · 30대", "look": "회색 늑대 귀와 꼬리, 갈기 같은 거친 회색 머리, 노란 눈, 2미터 가까운 거구, 팔에 감은 붉은 천(파티 표식), 송곳니가 드러나는 웃음", "file": "bork"},
    {"n": "클라라 리히터", "aka": ["클라라"], "g": "모험가 길드", "role": "몰락한 리히터 남작가의 영애 · D급 모험가", "who": "인간 여성 · 19세", "look": "높이 하나로 묶은 백금발, 연녹색 눈, 곧은 자세, 낡았지만 손질이 잘 된 진홍색 귀족풍 망토, 가는 레이피어", "file": "clara"},
    {"n": "세라핀 엘가르드", "aka": ["세라핀", "은월"], "g": "이름난 모험가", "role": "S급 '은월' · 미궁 47층 최고 기록", "who": "인간 여성 · 30대 초반", "look": "허리까지 오는 은백색 생머리, 차분한 회청색 눈, 큰 키, 장식 없는 흰 외투, 은빛 장검 한 자루", "file": "seraphine"},
    {"n": "오르반", "aka": ["오르반", "잿빛 현자"], "g": "이름난 모험가", "role": "S급 '잿빛 현자' · 탑을 나온 노마도사", "who": "인간 남성 · 70대", "look": "덥수룩한 잿빛 머리와 수염, 한쪽 눈의 외알 안경, 재가 묻은 회색 로브, 구부정하지만 매서운 눈빛, 뒤틀린 나무 지팡이", "file": "orban"},
    {"n": "니아", "aka": ["니아", "바람까마귀"], "g": "이름난 모험가", "role": "S급 '바람까마귀' · 2년째 행방불명", "who": "검은 여우 수인 여성 · 20대", "look": "검은 단발, 검은 여우 귀와 꼬리, 금빛 눈, 머리에 꽂은 까마귀 깃털, 등에 멘 장궁", "file": "nia"},
    {"n": "오스왈드 펠라인", "aka": ["오스왈드", "상인 길드장"], "g": "상인", "role": "상인 길드장 · '늙은 여우'", "who": "인간 남성 · 60대", "look": "뒤로 빗어 넘긴 백발, 가늘게 웃는 옅은 갈색 눈, 둥근 체형, 금줄 회중시계, 짙은 자주색 상인 정장", "file": "oswald"},
    {"n": "토마스", "aka": ["토마스"], "g": "상인", "role": "상인 길드 접수원", "who": "인간 남성 · 20대 초", "look": "부스스한 갈색 머리, 동그란 안경, 마른 체형, 소매 토시, 늘 품에 안은 서류 뭉치", "file": "thomas"},
    {"n": "비앙카 로세티", "aka": ["비앙카"], "g": "상인", "role": "로세티 후작가 영애 · 로세티 상회 제도 지점장", "who": "인간 여성 · 22세", "look": "굵게 웨이브진 붉은 머리, 초록 눈, 자신만만한 미소, 실용적인 승마 재킷, 은빛 돛 브로치", "file": "bianca"},
    {"n": "디트리히 그라운", "aka": ["디트리히", "그라운"], "g": "상인", "role": "그라운 상회장 · 제도 2위 상회 · 발렌하임 공작의 서자(공공연한 비밀)", "who": "인간 남성 · 40대", "look": "기름 발라 넘긴 검푸른 머리(아버지 지크프리트를 닮음), 가는 콧수염, 차가운 회색 눈, 손가락마다 낀 반지, 모피 깃 외투", "file": "dietrich"},
    {"n": "이졸데 에른스트", "aka": ["이졸데", "탑주"], "g": "청람의 탑", "role": "청람의 탑 탑주 · 대마도사", "who": "인간 여성 · 겉모습 40대", "look": "짧게 자른 칠흑 머리, 얼음 같은 푸른 눈, 날카로운 턱선, 별자리 수가 놓인 짙은 청색 로브", "file": "isolde"},
    {"n": "페릭", "aka": ["페릭"], "g": "청람의 탑", "role": "견습 지도교수 · 2급 마도사", "who": "인간 남성 · 30대", "look": "사방으로 뻗친 갈색 곱슬머리, 그을음이 묻은 뺨, 코끝까지 흘러내린 안경, 얼룩투성이 하늘색 로브", "file": "ferik"},
    {"n": "레온하르트 발렌하임", "aka": ["레온하르트", "기사단장"], "g": "황실 기사단", "role": "황실 기사단장 · 발렌하임 공작가 차남", "who": "인간 남성 · 40대", "look": "짧은 금갈색 머리, 깊은 녹색 눈, 각진 얼굴, 흑철 판금 갑옷 위에 두른 흰 기사단 망토", "file": "leonhard"},
    {"n": "마르타 그레이", "aka": ["마르타", "부단장"], "g": "황실 기사단", "role": "황실 기사단 부단장 · 평민 출신", "who": "인간 여성 · 30대 후반", "look": "짧게 친 잿갈색 머리, 콧등을 가로지른 흉터, 회색 눈, 단단한 체격, 은빛 갑옷", "file": "martha"},
    {"n": "베네딕트", "aka": ["베네딕트", "주교"], "g": "빛의 성교회", "role": "제도 주교", "who": "인간 남성 · 30대", "look": "길게 늘어뜨린 은회색 머리, 둥근 금테 안경 너머 옅은 금빛 눈, 부드러운 미소, 금실 십자가 수가 놓인 흰 주교복과 주교관, 흰 장갑", "file": "benedict"},
    {"n": "루시아", "aka": ["루시아", "성녀"], "g": "빛의 성교회", "role": "당대 성녀", "who": "인간 여성 · 17세", "look": "발목까지 오는 연한 금빛 머리, 맑은 하늘색 눈, 가녀린 체구, 흰 성녀 베일", "file": "lucia"},
    {"n": "레오폴드 3세", "aka": ["레오폴드", "황제"], "g": "황가", "role": "아스텔 제국 황제", "who": "인간 남성 · 62세", "look": "백발과 짧은 흰 수염, 깊게 팬 주름, 회색 눈, 수척하지만 꼿꼿한 자세, 진홍 망토와 황관", "file": "leopold"},
    {"n": "아르망 아스텔리온", "aka": ["아르망", "황태자"], "g": "황가", "role": "황태자 · 제1 계승권자", "who": "인간 남성 · 24세", "look": "은발, 차가운 회색 눈, 큰 키, 은빛 견장을 단 흰 군복", "file": "armand"},
    {"n": "엘레노어 아스텔리온", "aka": ["엘레노어", "황녀", "엘리"], "g": "황가", "role": "황녀 · 천재 마도사 (가명 '엘리')", "who": "인간 여성 · 19세", "look": "웨이브진 금발, 푸른 눈, 장난기 어린 표정, 푸른 드레스 — '엘리'일 땐 수수한 갈색 망토와 챙모자", "file": "eleanor"},
    {"n": "지크프리트 발렌하임", "aka": ["지크프리트", "발렌하임 공작"], "g": "귀족", "role": "발렌하임 공작 · 보수 귀족파 수장 · 서자 디트리히를 아낌", "who": "인간 남성 · 60대(나이보다 젊어 보임)", "look": "짧게 넘긴 검푸른 머리, 매서운 금빛 눈, 굵은 눈썹과 깊은 미간, 날카로운 턱, 사자 문장 흉갑 위에 두른 흰 담비털 망토", "file": "siegfried"},
    {"n": "오스카 발렌하임", "aka": ["오스카"], "g": "귀족", "role": "발렌하임 공작가 적장자 · 후계자 · 디트리히를 형으로 여김", "who": "인간 남성 · 30대", "look": "허리까지 오는 검푸른 생머리, 아버지를 닮은 금빛 눈, 송곳니가 비치는 비웃음, 은사 장식이 달린 짙은 남보라 귀족 군복", "file": "oscar"},
    {"n": "이졸레 발렌하임", "aka": ["이졸레"], "g": "귀족", "role": "발렌하임 공작의 손녀 · 황태자비 후보", "who": "인간 여성 · 18세", "look": "땋아 올린 금발, 차분한 초록 눈, 창백한 피부, 검은 레이스 드레스", "file": "isole"},
    {"n": "로렌초 로세티", "aka": ["로렌초", "로세티 후작"], "g": "귀족", "role": "로세티 후작 · 실용파 수장", "who": "인간 남성 · 50대", "look": "웨이브진 적갈색 머리와 손질된 수염, 웃는 초록 눈, 혈색 좋은 얼굴, 은빛 돛 문장 외투", "file": "lorenzo"},
    {"n": "울리히 그레이븐", "aka": ["울리히", "변경백"], "g": "귀족", "role": "그레이븐 변경백 · 북부 국경 수비", "who": "인간 남성 · 50대", "look": "덥수룩한 회색 머리와 수염, 반쯤 잘려 나간 한쪽 귀, 곰 같은 거구, 털가죽 망토와 낡은 갑옷", "file": "ulrich"},
    {"n": "마르게", "aka": ["마르게"], "g": "거리와 뒷골목", "role": "여관 은빛 망아지 정 주인 · 은퇴한 C급 모험가", "who": "인간 여성 · 50대", "look": "통통한 체격, 붉은 볼, 틀어 올린 회갈색 머리, 앞치마, 팔뚝에 남은 옛 상처", "file": "marge"},
    {"n": "벨벳", "aka": ["벨벳"], "g": "거리와 뒷골목", "role": "술집 '구멍 난 양동이' 주인 · 그림자 길드 간부", "who": "인간 여성 · 30대", "look": "흑단 같은 긴 머리, 붉은 입술, 반쯤 감긴 자줏빛 눈, 검은 레이스 숄", "file": "velvet"},
    {"n": "쥐왕", "aka": ["쥐왕"], "g": "거리와 뒷골목", "role": "그림자 길드 두목 · 정체불명", "who": "정체불명", "look": "깊게 눌러쓴 회색 후드와 쥐 모양 가면 — 그 밖엔 아무도 모른다", "file": "ratking"},
    {"n": "베사", "aka": ["베사"], "g": "거리와 뒷골목", "role": "회색 골목의 노파", "who": "인간 여성 · 70대", "look": "굽은 등, 천으로 감싼 하얗게 센 머리, 한쪽이 흐려진 눈, 손가락마다 감은 실 반지", "file": "bessa"},
    {"n": "늙은 조", "aka": ["조", "늙은 조"], "g": "거리와 뒷골목", "role": "루미강 낚시꾼", "who": "인간 남성 · 70대", "look": "볕에 그을린 얼굴, 밀짚모자, 듬성듬성한 흰 수염, 낡은 낚싯대", "file": "joe"},
    {"n": "하인츠", "aka": ["하인츠", "촌장"], "g": "브레이크 마을", "role": "브레이크 마을 촌장", "who": "인간 남성 · 60대", "look": "어깨 아래로 늘어진 은백색 머리, 흰 콧수염과 짧은 턱수염, 주름진 얼굴, 날카로운 푸른 눈, 무뚝뚝한 입매, 흰 털 깃 외투", "file": "heinz"},
    {"n": "그레고르", "aka": ["그레고르"], "g": "브레이크 마을", "role": "마을 대장장이 겸 술집 주인 · 바르톨의 소꿉친구", "who": "인간 남성 · 40대", "look": "민머리, 길게 땋아 내린 붉은 수염, 굵은 팔뚝, 그을린 가죽 앞치마 — 소꿉친구 바르톨과 형제냐는 소리를 듣는다", "file": "gregor"},
    {"n": "오드리", "aka": ["오드리"], "g": "브레이크 마을", "role": "약초를 다루는 마녀 할머니", "who": "인간 여성 · 80대", "look": "길게 늘어뜨린 흰 머리, 뾰족한 모자, 매부리코, 날카로운 녹색 눈, 허리에 주렁주렁 매단 약초 다발", "file": "audrey"},
    {"n": "그레타", "aka": ["그레타"], "g": "브레이크 마을", "role": "늙은 조련사 · 테이머의 스승", "who": "인간 여성 · 70대", "look": "짧은 흰 머리, 볕에 탄 얼굴, 시원한 웃음, 어깨에 앉은 매, 양치기 지팡이", "file": "greta"},
    {"n": "바르톨", "aka": ["바르톨"], "g": "스승", "role": "모험가 길드 훈련 교관 · 전사의 스승 · 그레고르의 소꿉친구", "who": "인간 남성 · 40대", "look": "민머리, 짧게 다듬은 적갈색 수염, 털보 거한, 문신한 맨팔, 어깨에 걸친 목검 — 브레이크 마을 출신, 소꿉친구 그레고르와 형제냐는 소리를 듣는다", "file": "bartol"},
    {"n": "하겐", "aka": ["하겐"], "g": "스승", "role": "북부 출신 용병 · 창술사의 스승", "who": "인간 남성 · 40대", "look": "짧은 금발, 술기운에 붉어진 코, 북부식 털 망토, 긴 창", "file": "hagen"},
    {"n": "오토", "aka": ["오토", "곰"], "g": "스승", "role": "지하 격투장의 노장 '곰' · 격투가의 스승", "who": "인간 남성 · 50대", "look": "부러졌다 붙은 코, 짧은 흰 머리, 곰 같은 체격, 붕대를 감은 주먹", "file": "otto"},
    {"n": "실바", "aka": ["실바"], "g": "스승", "role": "흑림의 사냥꾼 · 궁수의 스승", "who": "살쾡이 수인 여성 · 30대", "look": "얼룩무늬 살쾡이 귀, 갈색 단발, 녹색 눈, 가죽 사냥복, 짧은 활", "file": "silva"},
    {"n": "페넬로페", "aka": ["페넬로페"], "g": "스승", "role": "음악가 조합 '황금 류트 홀' 조합장", "who": "인간 여성 · 40대", "look": "틀어 올린 짙은 갈색 머리, 깃털 장식 모자, 우아한 자주색 드레스, 손때 묻은 류트", "file": "penelope"},
    {"n": "아이린", "aka": ["아이린"], "g": "스승", "role": "흑림 깊은 곳의 엘프 은자 · 정령술사의 스승", "who": "엘프 여성 · 겉모습 20대", "look": "땅에 닿을 듯 긴 연녹빛 머리, 뾰족한 귀, 금빛 눈, 이끼색 로브, 곁을 떠도는 작은 빛 정령들", "file": "irene"},
    {"n": "모르데카이", "aka": ["모르데카이"], "g": "스승", "role": "지하 서고의 소환학자 · 소환사의 스승", "who": "인간 남성 · 60대", "look": "헝클어진 백발, 잉크 묻은 손, 마른 체격, 동그란 렌즈 안경, 별무늬가 바랜 낡은 외투", "file": "mordecai"},
];
/** 이름(또는 줄인 이름)으로 도감의 인물을 찾는다 */
export function npcInfo(name) {
    const k = nospace(String(name || ''));
    if (!k) return null;
    return NPC_DIR.find(d => nospace(d.n) === k || d.aka.some(a => nospace(a) === k))
        || NPC_DIR.find(d => k.startsWith(nospace(d.n)) || d.aka.some(a => a.length >= 2 && k.startsWith(nospace(a)) && !/^[가-힣]{0,1}$/.test(k.slice(nospace(a).length, nospace(a).length + 1) || '')))
        || null;
}
/** 지금 장면에 있거나 최근 대화에 나온 도감 인물들 */
export function npcsInScene(st, ctx = '') {
    const out = [];
    const add = (d) => { if (d && !out.includes(d)) out.push(d); };
    const t = String(ctx || '');
    if (t) for (const d of NPC_DIR) if (t.includes(d.n) || d.aka.some(a => a.length >= 2 && t.includes(a))) add(d);   // 대화에 나온 사람이 먼저
    for (const h of peopleHere(st)) add(npcInfo(h.name));
    return out;
}

/* ───────────────────────── 이름 있는 사람들의 성장 — 세상도 같이 흘러간다 ─────────────────────────
   시작한 날(0일)로부터 흐른 날수에 따라 근황이 바뀐다. 문턱 날짜는 판마다 조금씩 어긋난다(0.85~1.2배).
   rival: 플레이어 모험가 등급과 엎치락뒤치락 — 크게 앞서 나가면 자극받아 한 칸 뒤까지 따라붙는다.
   GM이 "근황 이름 | 내용"을 적으면 그게 가장 최신 근황이 된다. */
export const NPC_ARCS = {
    '카일 바렛': { rival: true, stages: [
        [0, 'F급 신인 검사', '같은 시기에 등록한 라이벌. 아직 무기도 낡았다'],
        [40, 'E급 검사', '고블린 무리 토벌로 첫 승급. 새 장검을 맞췄다'],
        [140, 'D급 검사', '또래 둘과 3인 파티를 꾸렸다. 길드에서 이름이 오르내린다'],
        [320, 'C급 검사', '미궁 10층 돌파. 몰락한 집안 문장을 다시 망토에 달았다'],
        [620, 'B급 검사', '"신진 검사 중 하나"로 소식지에 실렸다. 귀족 자제들이 대련을 청한다'],
        [1100, 'A급 검사', '제도 신진 최강 검사 소리를 듣는다. 집안의 기사 작위 회복을 노린다'] ] },
    '클라라 리히터': { stages: [
        [0, 'D급 모험가 · 몰락한 리히터 남작가의 영애', '가문 빚을 갚으려 의뢰를 쉬지 않는다'],
        [180, 'C급 모험가 · 리히터 남작가의 영애', 'C급 승급. 가문 빚의 절반을 갚았다'],
        [520, 'B급 모험가 · 리히터 남작가 재건 중', '빚을 다 갚고 옛 영지 일부를 되사들였다'] ] },
    '보르크': { stages: [
        [0, "A급 파티 '붉은 송곳니' 리더", ''],
        [260, "A급 파티 '붉은 송곳니' 리더 · S급 심사 대상", '흑림 심층 원정에 성공해 S급 승급 심사를 받는 중'],
        [700, "S급 '붉은 송곳니' 리더", '수인 최초의 S급 파티 리더가 되었다'] ] },
    '세라핀 엘가르드': { stages: [
        [0, "S급 '은월' · 미궁 47층 최고 기록", ''],
        [220, "S급 '은월' · 미궁 48층 최고 기록", '48층 수호자를 베고 기록을 갱신했다'],
        [600, "S급 '은월' · 미궁 50층 최고 기록", '전인미답의 50층에 닿았다. 제국이 훈장을 내렸다'] ] },
    '미렐 하트웰': { stages: [
        [0, '길드 접수원 · 신입 담당', ''],
        [400, '길드 접수 주임 · 신입 담당', '접수 주임으로 승진. 새로 들어온 접수원 둘을 가르친다'] ] },
    '토마스': { stages: [
        [0, '상인 길드 접수원', ''],
        [240, '상인 길드 주임 접수원', '승진해서 큰 거래 서류도 맡는다. 부쩍 의젓해졌다'],
        [680, '상인 길드 남부 교역 담당관', '남부 교역로 담당으로 영전했다'] ] },
    '비앙카 로세티': { stages: [
        [0, '로세티 후작가 영애 · 로세티 상회 제도 지점장', ''],
        [300, '로세티 후작가 영애 · 로세티 상회 제도 본점장', '제도 지점이 본점으로 격상됐다. 그라운 상회와 정면으로 붙는다'] ] },
    '디트리히 그라운': { stages: [
        [0, '그라운 상회장 · 제도 2위 상회 · 발렌하임 공작의 서자(공공연한 비밀)', ''],
        [300, '그라운 상회장 · 로세티와 제도 1위를 다툼 · 발렌하임 공작의 서자', '로세티 본점 격상에 맞서 북부 철 교역을 틀어쥐었다'] ] },
    '페릭': { stages: [
        [0, '견습 지도교수 · 2급 마도사', ''],
        [380, '탑 정교수 · 1급 마도사', '1급 승급 시험에 붙어 정교수가 되었다'] ] },
    '엘레노어 아스텔리온': { stages: [
        [0, "황녀 · 천재 마도사 (가명 '엘리')", ''],
        [330, "황녀 · 상급 마도사 (가명 '엘리')", '탑 역사상 최연소 상급 마도사. 정체를 아는 사람이 조금 늘었다'] ] },
    '루시아': { stages: [
        [0, '당대 성녀', ''],
        [360, '당대 성녀 · 북부 순례를 마침', '북부 순례에서 역병을 멈춰 신망이 높아졌다'] ] },
    '이졸레 발렌하임': { stages: [
        [0, '발렌하임 공작의 손녀 · 황태자비 후보', ''],
        [300, '발렌하임 공작의 손녀 · 황태자비 간택 막바지', '간택이 막바지다. 결과는 이야기 속에서 정해진다'] ] },
    '마르타 그레이': { stages: [
        [0, '황실 기사단 부단장 · 평민 출신', ''],
        [500, '황실 기사단 부단장 · 평민 출신 · 북부 원정대장 겸임', '북부 원정대를 맡았다. 평민 기사들의 우상'] ] },
};
const nowRank = (st) => Math.max(0, Math.min(6, st.orgs?.adventurer?.rank ?? 0));
function arcIndex(st, name, arc, day) {
    const f = 0.85 + (hashStr(`arc|${st.profile?.name || ''}|${name}`) % 1000) / 1000 * 0.35;
    let i = 0;
    arc.stages.forEach((sg, k) => { if (day >= Math.round(sg[0] * f)) i = k; });
    if (arc.rival && day === st.day) {
        const pr = nowRank(st);
        i = Math.max(i, pr - 1);                       // 크게 앞서면 한 칸 뒤까지 따라붙는다
        i = Math.min(i, Math.max(pr + 1, 0), arc.stages.length - 1);   // 너무 멀리 앞서지는 않는다
    }
    return i;
}
/** 지금의 근황 — {role, who, note, news[]} (도감·프롬프트·사람 목록에 쓴다) */
export function npcNow(st, name, day = st.day) {
    const d = npcInfo(name); if (!d) return null;
    const arc = NPC_ARCS[d.n];
    let role = d.role, note = '';
    if (arc) { const sg = arc.stages[arcIndex(st, d.n, arc, day)]; role = sg[1]; note = sg[2]; }
    const news = (st.npcNews?.[d.n] || []).filter(x => x.day <= day);
    if (news.length) note = news[news.length - 1].t;
    const yrs = Math.floor(Math.max(0, day) / 360);
    const who = yrs ? d.who.replace(/(\d+)세/, (m, a) => `${+a + yrs}세`) : d.who;
    return { ...d, role, who, note, news };
}
/** 응답에 이름이 나온 사람을 '만났다'고 적어 둔다 — 다음에 다시 볼 때 그사이 흐른 날을 알려 주려고 */
export function noteMet(st, text) {
    const t = String(text || ''); if (!t) return;
    st.npcMet = st.npcMet || {};
    for (const d of NPC_DIR) {
        if (!(t.includes(d.n) || d.aka.some(a => a.length >= 2 && t.includes(a)))) continue;
        const m = st.npcMet[d.n];
        if (!m) st.npcMet[d.n] = { first: st.day, last: st.day, prev: null };
        else if (m.last !== st.day) { m.prev = m.last; m.last = st.day; }
    }
}
/** 다시 만난 사람의 '그사이 달라진 점' 한 줄 */
function npcChangeLine(st, d) {
    const m = st.npcMet?.[d.n]; if (!m) return '';
    const since = m.last === st.day ? m.prev : m.last;
    if (since == null || st.day - since < 7) return '';
    const before = npcNow(st, d.n, since), now = npcNow(st, d.n);
    const bits = [];
    if (before.role !== now.role) bits.push(`${before.role} → ${now.role}`);
    if (now.note && now.note !== before.note) bits.push(now.note);
    return `${d.n}: 마지막으로 본 지 ${st.day - since}일${bits.length ? ` — ${bits.join(' / ')}` : ' — 그사이 소소한 근황이 생겼을 것'}`;
}

/* ───────────────────────── 제도 소식지 · 소문 ───────────────────────── */
const WORLD_NEWS = [
    ['미궁 소식', '고대 미궁 아르카 20층대에서 새 보물방이 발견됐다는 보고. 길드는 C급 이상만 들여보낸다.'],
    ['길드 소식', "A급 파티 '붉은 송곳니'가 흑림 중층의 오크 부락을 소탕하고 돌아왔다."],
    ['황실 소식', '엘레노어 황녀가 청람의 탑 공개 강연에 다시 모습을 보였다. 귀족 자제들이 앞자리를 다퉜다.'],
    ['변경 소식', '그레이븐 성채에서 수비대를 더 뽑는다. 일당은 짜지만 공을 세우면 변경백이 후하다는 말.'],
    ['상업 소식', '로세티 상회가 이스메라 직항 배를 두 척 더 띄운다. 향신료 값이 곧 내려갈지도.'],
    ['거리 소식', '회색 골목 수로에 또 쥐 떼. 위병대는 손을 놓았고 모험가 길드에 의뢰가 붙었다.'],
    ['교회 소식', '빛의 대성당이 무료 진료소를 넓힌다. 수습 신관과 치유사를 모집한다.'],
    ['남부 소식', '하벤 경마장에서 남부 경주마가 신기록을 냈다. 귀족들의 내기 판이 커졌다.'],
    ['숲 소식', '엘름바트 사냥꾼들이 흑림과 동부 숲 사이에서 커다란 발자국을 봤다고 한다.'],
    ['탑 소식', '청람의 탑 실험파가 새 마도구를 시연하다 탑 한 층을 그을렸다. 전통파는 웃는 중.'],
    ['항구 소식', '세렌포트 앞바다에 세이렌의 노래가 들렸다는 뱃사람들. 밤배 삯이 올랐다.'],
    ['산맥 소식', '바르그홀름 드워프들이 새 광맥을 찾았다며 큰 잔치를 열었다. 철값이 조금 내려간다.'],
];
const RUMOR_MAJOR = /혼인|결혼|서임|새 가문|개업|승급|신기록|정복자|사냥꾼|토벌|던전|미궁|상회|대지주|지주|명마|천리마|태어났다|후계자|군역/;
/** 이달의 소식지 — 정세·행사·세상 소식 + 플레이어에 관한 소문 */
export function gazette(st) {
    const f = formatDate(st.day), ym = ymOf(st.day), r = rng(hashStr(`gazette|${ym}`));
    const items = [];
    for (const a of affairsOf(st.day)) if (a.name !== '평온한 달') items.push({ h: a.name, t: a.desc });
    const evs = upcomingEvents(st.day, 30 - f.d + 1).filter(u => u.inDays >= 0).slice(0, 3);
    for (const u of evs) items.push({ h: u.ev.name, t: `${u.inDays === 0 ? '오늘' : `${u.inDays}일 뒤`} — ${u.ev.desc}` });
    const pool = [...WORLD_NEWS]; for (let i = 0; i < 2 && pool.length; i++) { const k = Math.floor(r() * pool.length); const [h, t] = pool.splice(k, 1)[0]; items.push({ h, t }); }
    return { issue: `제국력 ${f.y}년 ${f.m}월호`, items, rumors: rumorsOf(st) };
}
/** 사람들 입에 오르는 플레이어 이야기 — 명성이 높을수록 멀리, 오래 */
export function rumorsOf(st) {
    const ren = st.renown || 0, name = st.profile?.name || '그 사람';
    const span = ren >= 100 ? 180 : ren >= 50 ? 120 : ren >= 20 ? 75 : 45;
    const reach = ren >= 100 ? '제국 곳곳에서' : ren >= 50 ? '제도 전역에서' : ren >= 20 ? '길드 대로 주점들에서' : '아는 사람들 사이에서';
    const recent = (st.chronicle || []).filter(c => st.day - c.day <= span && (c.m || RUMOR_MAJOR.test(c.t)));
    if (!recent.length || (ren < 10 && !recent.some(c => /혼인|서임|신기록|개업/.test(c.t)))) return null;
    return { reach, items: recent.slice(-3).reverse().map(c => c.t.replace(/\s*\([^)]*\)\s*$/, '')) };
}

/* ───────────────────────── 편지함 ───────────────────────── */
/** <편지 보낸이>본문</편지> */
export function parseLetters(text) {
    const out = []; const re = /<편지(?:\s+([^>]*))?>([\s\S]*?)<\/편지>/g; let m;
    while ((m = re.exec(String(text || '')))) { const body = m[2].trim(); if (body) out.push({ from: (m[1] || '').trim() || '누군가', body }); }
    return out;
}
/** {{user}}가 쓴 편지 — <보낸편지 받는 이>본문</보낸편지> */
export function parseSentLetters(text) {
    const out = []; const re = /<보낸편지(?:\s+([^>]*))?>([\s\S]*?)<\/보낸편지>/g; let m;
    while ((m = re.exec(String(text || '')))) { const body = m[2].trim(); if (body) out.push({ to: (m[1] || '').trim() || '누군가', body }); }
    return out;
}
export function addSentLetters(st, letters, i) {
    if (!letters.length) return;
    st.sent = st.sent || [];
    letters.forEach((l, k) => { const id = `s${i}-${k}`; if (!st.sent.some(x => x.id === id)) st.sent.push({ id, to: l.to, body: l.body, day: st.day }); });
    if (st.sent.length > 60) st.sent.splice(0, st.sent.length - 60);
}
/** 아직 답이 오지 않은 보낸 편지 (40일 안) */
export function pendingSent(st) {
    return (st.sent || []).filter(x => st.day - x.day <= 40 && !(st.letters || []).some(l => l.day >= x.day && (nospace(l.from).includes(nospace(x.to)) || nospace(x.to).includes(nospace(l.from)))));
}
/** 메시지 i에서 온 편지를 편지함에 — 같은 편지는 한 번만 */
export function addLetters(st, letters, i) {
    if (!letters.length) return;
    st.letters = st.letters || [];
    letters.forEach((l, k) => { const id = `${i}-${k}-${hashStr(l.body.slice(0, 40)) % 10000}`; if (!st.letters.some(x => x.id === id)) st.letters.push({ id, from: l.from, body: l.body, day: st.day }); });
    if (st.letters.length > 80) st.letters.splice(0, st.letters.length - 80);
}

/** 흔적 칭호 — 큰일을 겪으면 칭호로 남는다 (외모는 바꾸지 않는다) */
function traceTitle(st, t, log) {
    st.titles = st.titles || [];
    if (st.titles.includes(t)) return;
    st.titles.push(t);
    log.push({ k: 'rank', t: `칭호 — ${t}` });
}

/* ───────────────────────── 연대기 책 (내보내기용 HTML 한 장) ───────────────────────── */
export function chronicleBookHtml(st) {
    const e = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const p = st.profile || {}, c = st.chronicle || [], now = formatDate(st.day);
    const y0 = c.length ? formatDate(c[0].day).y : now.y;
    const byYear = []; for (const x of c) { const y = formatDate(x.day).y; let g = byYear.find(b => b.y === y); if (!g) byYear.push(g = { y, xs: [] }); g.xs.push(x); }
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    const sl = statusLabel(st); const sub = [sl, st.family?.house && !sl.includes(st.family.house) ? st.family.house : '', st.mainJob].filter(Boolean).join(' · ');
    const kids = (st.children || []).filter(k => !k.unnamed).map(k => `${k.name}(${k.sex === '남' ? '아들' : '딸'})`);
    const cast = [
        st.spouse && ['배우자', `${st.spouse.name}${st.spouse.from ? ` — ${st.spouse.from}` : ''}`],
        kids.length && ['자녀', kids.join(', ')],
        (st.party || []).length && ['동료', st.party.map(m => m.name).join(', ')],
        (st.titles || []).length && ['칭호', st.titles.join(' · ')],
        (st.generations || []).length && ['앞선 세대', st.generations.map(g => g.name).join(' → ')],
    ].filter(Boolean);
    const chapters = byYear.map((b, i) => `<section class="ch"><header><span class="no">제 ${ROMAN[i] || i + 1} 장</span><h2>제국력 ${b.y}년</h2></header><ol>${b.xs.map(x => `<li class="${x.m ? 'own' : ''}"><time>${formatDate(x.day).m}월</time><p>${e(x.t)}</p></li>`).join('')}</ol></section>`).join('');
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(p.name)}의 연대기</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500&family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#2f2416;--soft:#6b5638;--gold:#9a7334;--line:rgba(110,80,40,.28);--paper:#f1e6cc}
*{box-sizing:border-box}html{background:#2a1e14}
body{margin:0;font-family:'Noto Serif KR','Noto Serif CJK KR',serif;color:var(--ink);background:radial-gradient(ellipse at 50% 30%,#f6ecd6,var(--paper) 55%,#e3d2ad);min-height:100vh;line-height:1.85}
.book{max-width:680px;margin:0 auto;padding:72px 40px 96px}
.cover{text-align:center;padding:40px 0 56px;border-bottom:1px solid var(--line);margin-bottom:48px}
.cover .of{font-family:'Cinzel',serif;letter-spacing:.38em;font-size:12px;color:var(--gold)}
.cover h1{font-size:44px;margin:14px 0 6px;letter-spacing:.06em;font-weight:700}
.cover .sub{color:var(--soft);font-size:15px}
.cover .era{margin-top:18px;font-size:13px;color:var(--soft);letter-spacing:.12em}
.orn{display:block;margin:26px auto 0;color:var(--gold);font-size:20px}
.cast{display:grid;grid-template-columns:7em 1fr;gap:6px 18px;font-size:14.5px;margin:0 0 56px;padding:18px 22px;border:1px solid var(--line);border-radius:6px;background:rgba(255,250,236,.45)}
.cast dt{color:var(--gold);font-weight:600}.cast dd{margin:0}
.ch{margin:0 0 48px}.ch header{text-align:center;margin-bottom:18px}
.ch .no{font-family:'Cinzel',serif;font-size:11px;letter-spacing:.3em;color:var(--gold)}
.ch h2{font-size:22px;margin:4px 0 0;font-weight:600;letter-spacing:.04em}
.ch ol{list-style:none;margin:0;padding:0}
.ch li{display:grid;grid-template-columns:3.4em 1fr;gap:14px;padding:9px 0;border-bottom:1px solid var(--line)}
.ch li:last-child{border-bottom:0}
.ch time{color:var(--soft);font-size:13px;text-align:right;padding-top:2px}
.ch p{margin:0;font-size:15.5px}
.ch li.own p{font-style:italic}
.end{text-align:center;color:var(--soft);font-size:13px;letter-spacing:.2em;margin-top:64px}
@media print{html,body{background:#fff}.book{padding:24px}}
</style></head><body><main class="book">
<section class="cover"><div class="of">THE CHRONICLE OF</div><h1>${e(p.name)}</h1><div class="sub">${e(sub)}</div><div class="era">제국력 ${y0}년 — ${now.y}년 ${now.m}월</div><span class="orn">❦</span></section>
${cast.length ? `<dl class="cast">${cast.map(([k, v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`).join('')}</dl>` : ''}
${chapters || '<p class="end">아직 기록된 일이 없다</p>'}
<p class="end">— 이야기는 계속된다 —</p></main></body></html>`;
}


/* ───────────────────────── 여행 — 길과 일수, 삯 ───────────────────────── */
/** 장소: [이름, 위치 문자열, 알아보는 말] */
export const WORLD_PLACES = [
    ['제도', '제도 루미에른 · 길드 대로', /제도|루미에른/],
    ['브레이크', '제도 외곽 · 브레이크 마을', /브레이크/],
    ['흑림', '흑림 가장자리', /흑림/],
    ['아르카', '고대 미궁 아르카 · 미궁 마을', /아르카|미궁 마을/],
    ['거울호수', '거울 호수 · 청람의 탑', /거울 호수|청람의 탑(?! 제도)|탑섬/],
    ['세렌포트', '항구도시 세렌포트 · 부두 거리', /세렌포트|하얀 개펄|사이렌곶/],
    ['경계목', '서쪽 대삼림 · 은빛 경계목', /대삼림|경계목/],
    ['하벤', '곡물 도시 하벤 · 곡물 거래소', /하벤/],
    ['비엔', '포도 언덕 비엔', /비엔/],
    ['엘름바트', '엘름바트 · 통나무 성문', /엘름바트/],
    ['철문', '광산 마을 철문', /철문/],
    ['바르그홀름', '바르그홀름 · 대장간 거리', /바르그홀름/],
    ['그레이븐', '그레이븐 성채 · 성채 광장', /그레이븐|북부 변경/],
    ['망루', '황혼 경계 · 첫째 망루', /황혼|망루/],
];

/** 지도에 붙는 짧은 이름 */
export const PLACE_LABEL = { 제도: '제도 루미에른', 브레이크: '브레이크 마을', 흑림: '흑림', 아르카: '미궁 아르카', 거울호수: '거울 호수', 세렌포트: '세렌포트', 경계목: '서쪽 대삼림', 하벤: '하벤', 비엔: '비엔', 엘름바트: '엘름바트', 철문: '철문', 바르그홀름: '바르그홀름', 그레이븐: '그레이븐 성채', 망루: '황혼 경계' };
export const placeExact = (loc) => WORLD_PLACES.find(p => p[2].test(loc || "")) || null;
/** 처음 가 본 곳이면 표시하고 연대기에 남긴다 */
function markVisited(st, log) {
    const [l1, l2] = String(st.location || '').split(' · ');
    if (/제도|루미에른/.test(l1) && l2) { st.seenSpots = st.seenSpots || {}; const k = l2.trim(); if (st.seenSpots[k] === undefined) st.seenSpots[k] = st.day; }
    const p = placeExact(st.location); if (!p || st.visited[p[0]] !== undefined) return;
    st.visited[p[0]] = st.day;
    const nm = PLACE_LABEL[p[0]] || p[1].split(' · ')[0];
    log.push({ k: 'gain', t: `처음 와 본 곳 — ${nm} (가 본 곳 ${Object.keys(st.visited).length}/${WORLD_PLACES.length})` });
    addChron(st, `처음으로 ${nm}에 발을 들였다`);
}
/** 길: [가, 나, 합승 마차 일수, 길 이름, 위험, 겨울에 막히나] */
export const ROADS = [
    ['제도', '브레이크', 0.1, '동문 길', ''],
    ['제도', '흑림', 0.5, '동쪽 숲길', '흑림의 늑대·고블린'],
    ['제도', '아르카', 0.5, '남문 길', ''],
    ['제도', '거울호수', 0.5, '서문 길', ''],
    ['제도', '세렌포트', 3, '서부 가도', ''],
    ['제도', '하벤', 2, '남부 곡물길', '수확기(8~10월) 곡물 도적'],
    ['아르카', '하벤', 1.5, '남부 곡물길', '수확기(8~10월) 곡물 도적'],
    ['하벤', '비엔', 1, '포도 언덕길', ''],
    ['하벤', '세렌포트', 3, '해안 남로', ''],
    ['세렌포트', '경계목', 2, '해안 북로', '엘프 땅 가까이 — 길을 잃기 쉽다'],
    ['제도', '엘름바트', 4, '동부 숲길', '늑대와 숲 도적'],
    ['흑림', '엘름바트', 3.5, '동부 숲길', '늑대와 숲 도적'],
    ['제도', '철문', 3, '북부 광산길', '산길과 와이번', true],
    ['철문', '바르그홀름', 2, '북부 광산길', '고개의 눈사태와 와이번', true],
    ['바르그홀름', '그레이븐', 2, '변경길', '길에 나오는 마물', true],
    ['제도', '그레이븐', 6, '동북 변경길', '길에 나오는 마물'],
    ['그레이븐', '망루', 1, '망루길', '황혼 경계의 마물'],
];
/** 수단: [이름, 일수 배율, 하루 삯(동), 설명] */
export const TRAVEL_MODES = { 마차: [1, 30, '합승 마차'], 말: [0.67, 0, '말을 타고'], 걸어서: [1.5, 0, '걸어서'], 짐배: [1, 20, '루미강 짐배'], 짐마차: [1.2, 0, '짐마차를 끌고'] };
const placeOf = (loc) => WORLD_PLACES.find(p => p[2].test(String(loc || ''))) || WORLD_PLACES.find(p => p[0] === '제도');
export const findPlace = (q) => { const n = String(q || '').trim(); return WORLD_PLACES.find(p => p[0] === n || nospace(p[1]).includes(nospace(n)) || p[2].test(n)) || null; };
/** 가장 빠른 길 (합승 마차 일수 기준) */
export function routeTo(from, to, day) {
    const winter = [12, 1, 2].includes(formatDate(day).m);
    const dist = { [from]: 0 }, prev = {}, todo = new Set(WORLD_PLACES.map(p => p[0]));
    while (todo.size) {
        let u = null; for (const x of todo) if (dist[x] != null && (u == null || dist[x] < dist[u])) u = x;
        if (u == null) break; todo.delete(u); if (u === to) break;
        for (const r of ROADS) {
            const v = r[0] === u ? r[1] : r[1] === u ? r[0] : null; if (!v || !todo.has(v)) continue;
            const w = r[2] * (winter && r[5] ? 1.6 : 1);
            if (dist[v] == null || dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = [u, r]; }
        }
    }
    if (dist[to] == null) return null;
    const legs = []; for (let v = to; v !== from; v = prev[v][0]) legs.unshift(prev[v][1]);
    return { days: dist[to], legs, winter: winter && legs.some(r => r[5]) };
}
const RIVER = (a, b) => (a === '제도' && b === '세렌포트') ? 2 : (a === '세렌포트' && b === '제도') ? 4 : null;
/** 여행 견적 — 일수·삯·위험 */
export function travelQuote(st, dest, mode = '마차') {
    const from = placeOf(st.location), to = findPlace(dest);
    if (!to) return { error: `'${dest}' — 길을 아는 곳이 아니다 (${WORLD_PLACES.map(p => p[0]).join('·')})` };
    if (to[0] === from[0]) return { error: `이미 ${to[0]} 근처다` };
    const m = TRAVEL_MODES[mode] || TRAVEL_MODES.마차;
    let base, legs;
    if (mode === '짐배') { base = RIVER(from[0], to[0]); if (base == null) return { error: '짐배는 제도와 세렌포트 사이 루미강에서만 다닌다' }; legs = [[from[0], to[0], base, '루미강 뱃길', '']]; }
    else { const r = routeTo(from[0], to[0], st.day); if (!r) return { error: '이어진 길이 없다' }; base = r.days; legs = r.legs; }
    const ownHorse = (st.companions || []).some(c => /^말 \(/.test(c.species || ''));
    let days = base * m[0];
    const paid = Math.max(0.5, Math.ceil(days * 2) / 2); const fare = Math.round(mode === '말' && !ownHorse ? paid * 100 : paid * m[1]);
    const dangers = [...new Set(legs.map(r => r[4]).filter(Boolean))];
    return { from, to, mode, days, whole: days >= 0.75 ? Math.max(1, Math.round(days)) : 0, quarters: days < 0.75 ? Math.max(1, Math.round(days * 4)) : 0, fare, rental: mode === '말' && !ownHorse, roads: [...new Set(legs.map(r => r[3]))], dangers, winter: legs.some(r => r[5]) && [12, 1, 2].includes(formatDate(st.day).m) };
}
export const travelLabel = (q) => q.error ? q.error : `${q.whole ? `${q.whole}일` : q.quarters >= 2 ? '반나절' : '두어 시간'}${q.fare ? ` · ${formatMoney(q.fare)}` : ''}`;
