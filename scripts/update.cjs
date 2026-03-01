const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/emergency_fallback.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const mappings = {
    "general_flood": ["洪水", "大雨", "暴雨", "فيضان", "أمطار", "hujan deras", "inundación", "lluvia", "Überschwemmung", "Hochwasser", "alluvione", "inondation"],
    "trapped_in_car": ["車", "閉じ込め", "车", "被困", "سيارة", "محاصر", "mobil", "terjebak", "coche", "atrapado", "Auto", "gefangen", "macchina", "intrappolato", "voiture", "coincé"],
    "flash_flood": ["鉄砲水", "突発", "山洪", "突发", "سيول", "مفاجئ", "banjir bandang", "inundación relámpago", "Sturzflut", "alluvione lampo", "chute d'eau"],
    "snake_bite": ["蛇", "噛まれ", "咬", "ثعبان", "لدغة", "ular", "gigitan", "serpiente", "mordedura", "Schlange", "Biss", "serpente", "morso", "serpent", "morsure"],
    "electrocution": ["感電", "電気", "触电", "漏电", "كهرباء", "صدمة", "kesetrum", "listrik", "electrocución", "electricidad", "Stromschlag", "folgorazione", "électrocution"],
    "injury_bleeding": ["出血", "血", "流血", "伤口", "نزيف", "دم", "darah", "berdarah", "sangrado", "herida", "Blutung", "sanguinamento", "saignement"],
    "water_purification": ["飲み水", "浄水", "饮用水", "净化", "ماء شرب", "تنقية", "air minum", "jernih", "agua potable", "Trinkwasser", "acqua potabile", "eau potable"],
    "drowning_cpr": ["溺れ", "CPR", "溺水", "心肺复苏", "غرق", "إنعاش", "tenggelam", "RJP", "ahogamiento", "Ertrinken", "annegamento", "noyade"],
    "hypothermia": ["低体温", "寒い", "失温", "冷", "انخفاض حرارة", "برد", "hipotermia", "dingin", "frío", "Unterkühlung", "ipotermia", "hypothermie"],
    "fracture": ["骨折", "折れ", "断裂", "كسر", "عظم", "patah tulang", "fraktur", "fractura", "Knochenbruch", "frattura", "fracture"],
    "structural_collapse": ["崩壊", "下敷き", "倒塌", "废墟", "انهيار", "تحت الأنقاض", "runtuh", "puing", "colapso", "escombros", "Einsturz", "crollo", "effondrement"],
    "mudslide": ["土砂崩れ", "泥", "泥石流", "滑坡", "انهيار طيني", "وحل", "tanah longsor", "lumpur", "deslizamiento", "lodo", "Erdrutsch", "frana", "coulée de boue"],
    "stranded_roof": ["屋根", "孤立", "屋顶", "困", "سطح", "عالق", "atap", "terdampar", "techo", "aislado", "Dach", "feststeckend", "tetto", "isolato", "toit", "isolé"],
    "animal_bite": ["犬", "動物", "狂犬病", "狗咬", "动物", "عضة الكلب", "حيوان", "gigitan anjing", "hewan", "mordedura de perro", "Hundebiss", "morso di cane", "morsure de chien"],
    "chemical_spill": ["化学", "ガス", "匂い", "化学品", "气体", "味道", "مادة كيميائية", "غاز", "kimia", "bau gas", "químico", "Chemikalien", "chimico", "chimique"],
    "power_outage": ["停電", "真っ暗", "停电", "没电", "انقطاع الكهرباء", "mati lampu", "apagón", "Stromausfall", "blackout", "panne de courant"],
    "lost_child": ["迷子", "子供", "走失", "孩子", "طفل مفقود", "anak hilang", "niño perdido", "vermisstes Kind", "bambino smarrito", "enfant perdu"],
    "fever_infection": ["熱", "感染", "下痢", "发烧", "腹泻", "حمى", "عدوى", "demam", "infeksi", "fiebre", "infección", "Fieber", "febbre", "fièvre"],
    "no_signal": ["圏外", "SOS", "助けて", "无信号", "救命", "لا توجد إشارة", "نجدة", "tidak ada sinyal", "tolong", "sin señal", "ayuda", "kein Signal", "Hilfe", "nessun segnale", "aiuto", "pas de signal", "aide"],
    "burn_injury": ["火傷", "火", "烧伤", "烫伤", "حرق", "نار", "luka bakar", "api", "quemadura", "fuego", "Verbrennung", "ustione", "brûlure"],
    "evacuation_route_blocked": ["道が塞が", "通行止め", "道路阻塞", "无法通行", "طريق مسدود", "jalan ditutup", "terhalang", "camino bloqueado", "Straße blockiert", "strada bloccata", "route bloquée"],
    "shop_owner_flood": ["店", "商品", "在庫", "店铺", "库存", "متجر", "بضائع", "toko", "barang", "tienda", "mercancía", "Geschäft", "negozio", "magasin"],
    "chronic_illness_prep": ["持病", "薬", "インスリン", "慢性病", "药物", "胰岛素", "مرض مزمن", "أدوية", "penyakit kronis", "obat", "enfermedad crónica", "medicina", "chronische Krankheit", "malattia cronica", "maladie chronique"]
};

for (const key in mappings) {
    if (data[key] && data[key].keywords) {
        data[key].keywords.push(...mappings[key]);
    }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
console.log("JSON Updated Successfully");
