import { useTheme } from '../contexts/ThemeContext';

type TranslationKey =
    | 'onboarding_step1_title'
    | 'onboarding_step2_title'
    | 'onboarding_step3_title'
    | 'onboarding_step4_title'
    | 'onboarding_step5_title'
    | 'local_districts_yala'
    | 'global_reference_cities'
    | 'or_type_location'
    | 'continue_btn'
    | 'just_me_solo'
    | 'family_with_kids'
    | 'caring_for_elderly'
    | 'yes_medical_needs'
    | 'no_healthy'
    | 'ai_engine_ready'
    | 'offline_survival_mode_active'
    | 'downloading_ai'
    | 'download_ai_engine'
    | 'test_gaia_live'
    | 'finish_setup'
    | 'skip_use_offline'
    | 'map_tab'
    | 'home_tab'
    | 'assist_tab'
    | 'settings_tab'
    // Home
    | 'safe_hub_locator'
    | 'your_region'
    | 'region_warning'
    // Weather
    | 'live_prefix'
    | 'metric_rain'
    | 'metric_temp'
    | 'metric_wind'
    ;

type TranslationsMap = Record<'en' | 'th' | 'ms', Record<TranslationKey, string>>;

const translations: TranslationsMap = {
    en: {
        onboarding_step1_title: "Choose your language",
        onboarding_step2_title: "Where are you located?",
        onboarding_step3_title: "Who are you with?",
        onboarding_step4_title: "Any special medical needs?",
        onboarding_step5_title: "Install AI Survival Brain",

        local_districts_yala: "Local Districts (Yala)",
        global_reference_cities: "Global Reference Cities",
        or_type_location: "Or type a specific location",
        continue_btn: "Continue",

        just_me_solo: "Just me (Solo)",
        family_with_kids: "Family with kids",
        caring_for_elderly: "Caring for elderly",

        yes_medical_needs: "Yes, we need special care",
        no_healthy: "No, we are healthy",

        ai_engine_ready: "AI Engine Ready",
        offline_survival_mode_active: "Offline survival mode active",
        downloading_ai: "Downloading AI...",
        download_ai_engine: "Download AI Engine (Wi-Fi Recommended)",
        test_gaia_live: "Test GAIA-119 Live",
        finish_setup: "Finish Setup",
        skip_use_offline: "Skip — Use Offline Dictionary",

        map_tab: "Map",
        home_tab: "Home",
        assist_tab: "Assist",
        settings_tab: "Settings",

        safe_hub_locator: "Safe Hub Locator",
        your_region: "Your Region",
        region_warning: "Showing Yala regional hubs (local data only). Your region relies on global AI advice.",

        live_prefix: "LIVE",
        metric_rain: "Rain",
        metric_temp: "Temp",
        metric_wind: "Wind"
    },
    th: {
        onboarding_step1_title: "เลือกภาษาของคุณ",
        onboarding_step2_title: "คุณอยู่ที่ไหน?",
        onboarding_step3_title: "คุณอยู่กับใคร?",
        onboarding_step4_title: "มีความต้องการดูแลพิเศษทางการแพทย์หรือไม่?",
        onboarding_step5_title: "ติดตั้งสมองกลเอาตัวรอด (AI)",

        local_districts_yala: "เขตท้องถิ่น (ยะลา)",
        global_reference_cities: "เมืองอ้างอิงระดับโลก",
        or_type_location: "หรือพิมพ์ระบุสถานที่",
        continue_btn: "ดำเนินการต่อ",

        just_me_solo: "คนเดียว",
        family_with_kids: "ครอบครัวที่มีเด็ก",
        caring_for_elderly: "ดูแลผู้สูงอายุ",

        yes_medical_needs: "ใช่, เราต้องการการดูแลพิเศษ",
        no_healthy: "ไม่, พวกเราแข็งแรงดี",

        ai_engine_ready: "เครื่องมือ AI พร้อมทำงาน",
        offline_survival_mode_active: "เปิดใช้งานโหมดเอาตัวรอดแบบออฟไลน์",
        downloading_ai: "กำลังดาวน์โหลด AI...",
        download_ai_engine: "ดาวน์โหลดเครื่องมือ AI (แนะนำให้ใช้ Wi-Fi)",
        test_gaia_live: "ทดสอบการทำงาน GAIA-119",
        finish_setup: "เสร็จสิ้นการตั้งค่า",
        skip_use_offline: "ข้าม — ใช้พจนานุกรมออฟไลน์แทน",

        map_tab: "แผนที่",
        home_tab: "หน้าแรก",
        assist_tab: "ขอความช่วยเหลือ",
        settings_tab: "การตั้งค่า",

        safe_hub_locator: "ค้นหาศูนย์พักพิงนิรภัย",
        your_region: "ภูมิภาคของคุณ",
        region_warning: "แสดงศูนย์พักพิงระดับภูมิภาคยะลา (ข้อมูลท้องถิ่นเท่านั้น) ภูมิภาคของคุณใช้คำแนะนำจาก AI ระดับโลก",

        live_prefix: "สด",
        metric_rain: "ฝน",
        metric_temp: "อุณหภูมิ",
        metric_wind: "ลม"
    },
    ms: {
        onboarding_step1_title: "Pilih bahasa anda",
        onboarding_step2_title: "Di manakah lokasi anda?",
        onboarding_step3_title: "Anda bersama siapa?",
        onboarding_step4_title: "Adakah keperluan perubatan khas?",
        onboarding_step5_title: "Pasang Otak Kelangsungan Hidup AI",

        local_districts_yala: "Daerah Tempatan (Yala)",
        global_reference_cities: "Bandar Rujukan Global",
        or_type_location: "Atau taip lokasi khusus",
        continue_btn: "Teruskan",

        just_me_solo: "Hanya saya (Solo)",
        family_with_kids: "Keluarga bersama anak-anak",
        caring_for_elderly: "Menjaga warga emas",

        yes_medical_needs: "Ya, kami memerlukan penjagaan khas",
        no_healthy: "Tidak, kami sihat",

        ai_engine_ready: "Enjin AI Bersedia",
        offline_survival_mode_active: "Mod kelangsungan hidup luar talian aktif",
        downloading_ai: "Memuat turun AI...",
        download_ai_engine: "Muat turun Enjin AI (Wi-Fi Disyorkan)",
        test_gaia_live: "Uji GAIA-119 Secara Langsung",
        finish_setup: "Selesai Persediaan",
        skip_use_offline: "Langkau — Gunakan Kamus Luar Talian",

        map_tab: "Peta",
        home_tab: "Utama",
        assist_tab: "Bantuan",
        settings_tab: "Tetapan",

        safe_hub_locator: "Pencari Hab Selamat",
        your_region: "Wilayah Anda",
        region_warning: "Menunjukkan hab wilayah Yala (data tempatan sahaja). Wilayah anda bergantung kepada nasihat AI global.",

        live_prefix: "KINI",
        metric_rain: "Hujan",
        metric_temp: "Suhu",
        metric_wind: "Angin"
    }
};

export function useTranslation() {
    const { language } = useTheme();

    const t = (key: TranslationKey): string => {
        // Fallback to english if translation mapping is missing for non-MVP languages silently
        const langMap = translations[language as keyof typeof translations] || translations['en'];
        return langMap[key] || translations['en'][key] || key;
    };

    return { t };
}
