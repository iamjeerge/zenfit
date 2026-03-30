/**
 * @file i18n.ts
 * @module lib/i18n
 * @description Internationalization (i18n) system for ZenFit.
 * Supports 6+ languages including RTL (Arabic, Hebrew).
 * Translations are loaded from JSON files and persisted via AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'hi' | 'pt';

export interface TranslationKeys {
  // Common
  common_back: string;
  common_save: string;
  common_cancel: string;
  common_delete: string;
  common_loading: string;
  common_error: string;
  common_retry: string;
  common_search: string;
  common_seeAll: string;
  common_noData: string;

  // Tabs
  tab_home: string;
  tab_breathe: string;
  tab_yoga: string;
  tab_nutrition: string;
  tab_profile: string;

  // Home
  home_greeting: string;
  home_dailyBriefing: string;
  home_quickActions: string;
  home_steps: string;
  home_water: string;
  home_calories: string;
  home_heartRate: string;
  home_streak: string;

  // Workout
  workout_title: string;
  workout_start: string;
  workout_complete: string;
  workout_duration: string;
  workout_exercises: string;

  // Breathe
  breathe_title: string;
  breathe_inhale: string;
  breathe_hold: string;
  breathe_exhale: string;
  breathe_sessions: string;

  // Nutrition
  nutrition_title: string;
  nutrition_calories: string;
  nutrition_protein: string;
  nutrition_carbs: string;
  nutrition_fat: string;
  nutrition_logMeal: string;

  // Profile
  profile_title: string;
  profile_settings: string;
  profile_appearance: string;
  profile_language: string;
  profile_logout: string;
  profile_level: string;
  profile_xp: string;

  // Sleep
  sleep_title: string;
  sleep_bedtime: string;
  sleep_wakeTime: string;
  sleep_quality: string;
  sleep_duration: string;

  // Mood
  mood_title: string;
  mood_howFeeling: string;
  mood_awful: string;
  mood_bad: string;
  mood_okay: string;
  mood_good: string;
  mood_amazing: string;

  // Social
  social_title: string;
  social_friends: string;
  social_leaderboard: string;
  social_challenges: string;
  social_trainers: string;

  // Settings
  settings_title: string;
  settings_notifications: string;
  settings_privacy: string;
  settings_subscription: string;
  settings_about: string;
}

const TRANSLATIONS: Record<SupportedLocale, TranslationKeys> = {
  en: {
    common_back: 'Back',
    common_save: 'Save',
    common_cancel: 'Cancel',
    common_delete: 'Delete',
    common_loading: 'Loading...',
    common_error: 'Something went wrong',
    common_retry: 'Retry',
    common_search: 'Search',
    common_seeAll: 'See All',
    common_noData: 'No data yet',
    tab_home: 'Home',
    tab_breathe: 'Breathe',
    tab_yoga: 'Yoga',
    tab_nutrition: 'Nutrition',
    tab_profile: 'Profile',
    home_greeting: 'Good morning',
    home_dailyBriefing: 'Daily Briefing',
    home_quickActions: 'Quick Actions',
    home_steps: 'Steps',
    home_water: 'Water',
    home_calories: 'Calories',
    home_heartRate: 'Heart Rate',
    home_streak: 'Streak',
    workout_title: 'Workout',
    workout_start: 'Start Workout',
    workout_complete: 'Complete',
    workout_duration: 'Duration',
    workout_exercises: 'Exercises',
    breathe_title: 'Breathe',
    breathe_inhale: 'Inhale',
    breathe_hold: 'Hold',
    breathe_exhale: 'Exhale',
    breathe_sessions: 'Sessions',
    nutrition_title: 'Nutrition',
    nutrition_calories: 'Calories',
    nutrition_protein: 'Protein',
    nutrition_carbs: 'Carbs',
    nutrition_fat: 'Fat',
    nutrition_logMeal: 'Log Meal',
    profile_title: 'Profile',
    profile_settings: 'Settings',
    profile_appearance: 'Appearance',
    profile_language: 'Language',
    profile_logout: 'Log Out',
    profile_level: 'Level',
    profile_xp: 'XP',
    sleep_title: 'Sleep',
    sleep_bedtime: 'Bedtime',
    sleep_wakeTime: 'Wake Time',
    sleep_quality: 'Quality',
    sleep_duration: 'Duration',
    mood_title: 'Mood',
    mood_howFeeling: 'How are you feeling?',
    mood_awful: 'Awful',
    mood_bad: 'Bad',
    mood_okay: 'Okay',
    mood_good: 'Good',
    mood_amazing: 'Amazing',
    social_title: 'Social',
    social_friends: 'Friends',
    social_leaderboard: 'Leaderboard',
    social_challenges: 'Challenges',
    social_trainers: 'Trainers',
    settings_title: 'Settings',
    settings_notifications: 'Notifications',
    settings_privacy: 'Privacy',
    settings_subscription: 'Subscription',
    settings_about: 'About',
  },
  es: {
    common_back: 'Atrás',
    common_save: 'Guardar',
    common_cancel: 'Cancelar',
    common_delete: 'Eliminar',
    common_loading: 'Cargando...',
    common_error: 'Algo salió mal',
    common_retry: 'Reintentar',
    common_search: 'Buscar',
    common_seeAll: 'Ver Todo',
    common_noData: 'Sin datos aún',
    tab_home: 'Inicio',
    tab_breathe: 'Respirar',
    tab_yoga: 'Yoga',
    tab_nutrition: 'Nutrición',
    tab_profile: 'Perfil',
    home_greeting: 'Buenos días',
    home_dailyBriefing: 'Resumen diario',
    home_quickActions: 'Acciones rápidas',
    home_steps: 'Pasos',
    home_water: 'Agua',
    home_calories: 'Calorías',
    home_heartRate: 'Ritmo cardíaco',
    home_streak: 'Racha',
    workout_title: 'Entrenamiento',
    workout_start: 'Iniciar entrenamiento',
    workout_complete: 'Completar',
    workout_duration: 'Duración',
    workout_exercises: 'Ejercicios',
    breathe_title: 'Respirar',
    breathe_inhale: 'Inhalar',
    breathe_hold: 'Mantener',
    breathe_exhale: 'Exhalar',
    breathe_sessions: 'Sesiones',
    nutrition_title: 'Nutrición',
    nutrition_calories: 'Calorías',
    nutrition_protein: 'Proteína',
    nutrition_carbs: 'Carbohidratos',
    nutrition_fat: 'Grasa',
    nutrition_logMeal: 'Registrar comida',
    profile_title: 'Perfil',
    profile_settings: 'Ajustes',
    profile_appearance: 'Apariencia',
    profile_language: 'Idioma',
    profile_logout: 'Cerrar sesión',
    profile_level: 'Nivel',
    profile_xp: 'XP',
    sleep_title: 'Sueño',
    sleep_bedtime: 'Hora de dormir',
    sleep_wakeTime: 'Hora de despertar',
    sleep_quality: 'Calidad',
    sleep_duration: 'Duración',
    mood_title: 'Estado de ánimo',
    mood_howFeeling: '¿Cómo te sientes?',
    mood_awful: 'Terrible',
    mood_bad: 'Mal',
    mood_okay: 'Regular',
    mood_good: 'Bien',
    mood_amazing: 'Increíble',
    social_title: 'Social',
    social_friends: 'Amigos',
    social_leaderboard: 'Clasificación',
    social_challenges: 'Desafíos',
    social_trainers: 'Entrenadores',
    settings_title: 'Ajustes',
    settings_notifications: 'Notificaciones',
    settings_privacy: 'Privacidad',
    settings_subscription: 'Suscripción',
    settings_about: 'Acerca de',
  },
  fr: {
    common_back: 'Retour',
    common_save: 'Enregistrer',
    common_cancel: 'Annuler',
    common_delete: 'Supprimer',
    common_loading: 'Chargement...',
    common_error: 'Une erreur est survenue',
    common_retry: 'Réessayer',
    common_search: 'Rechercher',
    common_seeAll: 'Voir Tout',
    common_noData: 'Pas encore de données',
    tab_home: 'Accueil',
    tab_breathe: 'Respirer',
    tab_yoga: 'Yoga',
    tab_nutrition: 'Nutrition',
    tab_profile: 'Profil',
    home_greeting: 'Bonjour',
    home_dailyBriefing: 'Briefing quotidien',
    home_quickActions: 'Actions rapides',
    home_steps: 'Pas',
    home_water: 'Eau',
    home_calories: 'Calories',
    home_heartRate: 'Fréquence cardiaque',
    home_streak: 'Série',
    workout_title: 'Entraînement',
    workout_start: "Commencer l'entraînement",
    workout_complete: 'Terminer',
    workout_duration: 'Durée',
    workout_exercises: 'Exercices',
    breathe_title: 'Respirer',
    breathe_inhale: 'Inspirer',
    breathe_hold: 'Retenir',
    breathe_exhale: 'Expirer',
    breathe_sessions: 'Séances',
    nutrition_title: 'Nutrition',
    nutrition_calories: 'Calories',
    nutrition_protein: 'Protéines',
    nutrition_carbs: 'Glucides',
    nutrition_fat: 'Lipides',
    nutrition_logMeal: 'Enregistrer le repas',
    profile_title: 'Profil',
    profile_settings: 'Paramètres',
    profile_appearance: 'Apparence',
    profile_language: 'Langue',
    profile_logout: 'Déconnexion',
    profile_level: 'Niveau',
    profile_xp: 'XP',
    sleep_title: 'Sommeil',
    sleep_bedtime: 'Heure du coucher',
    sleep_wakeTime: 'Heure du réveil',
    sleep_quality: 'Qualité',
    sleep_duration: 'Durée',
    mood_title: 'Humeur',
    mood_howFeeling: 'Comment vous sentez-vous ?',
    mood_awful: 'Terrible',
    mood_bad: 'Mauvais',
    mood_okay: 'Correct',
    mood_good: 'Bien',
    mood_amazing: 'Incroyable',
    social_title: 'Social',
    social_friends: 'Amis',
    social_leaderboard: 'Classement',
    social_challenges: 'Défis',
    social_trainers: 'Entraîneurs',
    settings_title: 'Paramètres',
    settings_notifications: 'Notifications',
    settings_privacy: 'Confidentialité',
    settings_subscription: 'Abonnement',
    settings_about: 'À propos',
  },
  de: {
    common_back: 'Zurück',
    common_save: 'Speichern',
    common_cancel: 'Abbrechen',
    common_delete: 'Löschen',
    common_loading: 'Laden...',
    common_error: 'Etwas ist schiefgelaufen',
    common_retry: 'Erneut versuchen',
    common_search: 'Suchen',
    common_seeAll: 'Alle anzeigen',
    common_noData: 'Noch keine Daten',
    tab_home: 'Startseite',
    tab_breathe: 'Atmen',
    tab_yoga: 'Yoga',
    tab_nutrition: 'Ernährung',
    tab_profile: 'Profil',
    home_greeting: 'Guten Morgen',
    home_dailyBriefing: 'Tagesbriefing',
    home_quickActions: 'Schnellaktionen',
    home_steps: 'Schritte',
    home_water: 'Wasser',
    home_calories: 'Kalorien',
    home_heartRate: 'Herzfrequenz',
    home_streak: 'Serie',
    workout_title: 'Training',
    workout_start: 'Training starten',
    workout_complete: 'Abschließen',
    workout_duration: 'Dauer',
    workout_exercises: 'Übungen',
    breathe_title: 'Atmen',
    breathe_inhale: 'Einatmen',
    breathe_hold: 'Halten',
    breathe_exhale: 'Ausatmen',
    breathe_sessions: 'Sitzungen',
    nutrition_title: 'Ernährung',
    nutrition_calories: 'Kalorien',
    nutrition_protein: 'Protein',
    nutrition_carbs: 'Kohlenhydrate',
    nutrition_fat: 'Fett',
    nutrition_logMeal: 'Mahlzeit eintragen',
    profile_title: 'Profil',
    profile_settings: 'Einstellungen',
    profile_appearance: 'Erscheinungsbild',
    profile_language: 'Sprache',
    profile_logout: 'Abmelden',
    profile_level: 'Stufe',
    profile_xp: 'XP',
    sleep_title: 'Schlaf',
    sleep_bedtime: 'Schlafenszeit',
    sleep_wakeTime: 'Aufwachzeit',
    sleep_quality: 'Qualität',
    sleep_duration: 'Dauer',
    mood_title: 'Stimmung',
    mood_howFeeling: 'Wie fühlst du dich?',
    mood_awful: 'Schrecklich',
    mood_bad: 'Schlecht',
    mood_okay: 'Okay',
    mood_good: 'Gut',
    mood_amazing: 'Fantastisch',
    social_title: 'Sozial',
    social_friends: 'Freunde',
    social_leaderboard: 'Bestenliste',
    social_challenges: 'Herausforderungen',
    social_trainers: 'Trainer',
    settings_title: 'Einstellungen',
    settings_notifications: 'Benachrichtigungen',
    settings_privacy: 'Datenschutz',
    settings_subscription: 'Abonnement',
    settings_about: 'Über',
  },
  ja: {
    common_back: '戻る',
    common_save: '保存',
    common_cancel: 'キャンセル',
    common_delete: '削除',
    common_loading: '読み込み中...',
    common_error: 'エラーが発生しました',
    common_retry: '再試行',
    common_search: '検索',
    common_seeAll: 'すべて見る',
    common_noData: 'データなし',
    tab_home: 'ホーム',
    tab_breathe: '呼吸',
    tab_yoga: 'ヨガ',
    tab_nutrition: '栄養',
    tab_profile: 'プロフィール',
    home_greeting: 'おはようございます',
    home_dailyBriefing: '今日のブリーフィング',
    home_quickActions: 'クイックアクション',
    home_steps: '歩数',
    home_water: '水分',
    home_calories: 'カロリー',
    home_heartRate: '心拍数',
    home_streak: '連続記録',
    workout_title: 'ワークアウト',
    workout_start: 'ワークアウト開始',
    workout_complete: '完了',
    workout_duration: '時間',
    workout_exercises: 'エクササイズ',
    breathe_title: '呼吸',
    breathe_inhale: '吸う',
    breathe_hold: '止める',
    breathe_exhale: '吐く',
    breathe_sessions: 'セッション',
    nutrition_title: '栄養',
    nutrition_calories: 'カロリー',
    nutrition_protein: 'タンパク質',
    nutrition_carbs: '炭水化物',
    nutrition_fat: '脂質',
    nutrition_logMeal: '食事を記録',
    profile_title: 'プロフィール',
    profile_settings: '設定',
    profile_appearance: '外観',
    profile_language: '言語',
    profile_logout: 'ログアウト',
    profile_level: 'レベル',
    profile_xp: 'XP',
    sleep_title: '睡眠',
    sleep_bedtime: '就寝時間',
    sleep_wakeTime: '起床時間',
    sleep_quality: '品質',
    sleep_duration: '時間',
    mood_title: '気分',
    mood_howFeeling: '今日の気分は？',
    mood_awful: '最悪',
    mood_bad: '悪い',
    mood_okay: '普通',
    mood_good: '良い',
    mood_amazing: '最高',
    social_title: 'ソーシャル',
    social_friends: '友達',
    social_leaderboard: 'ランキング',
    social_challenges: 'チャレンジ',
    social_trainers: 'トレーナー',
    settings_title: '設定',
    settings_notifications: '通知',
    settings_privacy: 'プライバシー',
    settings_subscription: 'サブスクリプション',
    settings_about: 'アプリについて',
  },
  ar: {
    common_back: 'رجوع',
    common_save: 'حفظ',
    common_cancel: 'إلغاء',
    common_delete: 'حذف',
    common_loading: 'جاري التحميل...',
    common_error: 'حدث خطأ ما',
    common_retry: 'إعادة المحاولة',
    common_search: 'بحث',
    common_seeAll: 'عرض الكل',
    common_noData: 'لا توجد بيانات بعد',
    tab_home: 'الرئيسية',
    tab_breathe: 'تنفس',
    tab_yoga: 'يوغا',
    tab_nutrition: 'التغذية',
    tab_profile: 'الملف الشخصي',
    home_greeting: 'صباح الخير',
    home_dailyBriefing: 'الملخص اليومي',
    home_quickActions: 'إجراءات سريعة',
    home_steps: 'خطوات',
    home_water: 'ماء',
    home_calories: 'سعرات حرارية',
    home_heartRate: 'معدل ضربات القلب',
    home_streak: 'سلسلة',
    workout_title: 'تمرين',
    workout_start: 'بدء التمرين',
    workout_complete: 'إكمال',
    workout_duration: 'المدة',
    workout_exercises: 'تمارين',
    breathe_title: 'تنفس',
    breathe_inhale: 'شهيق',
    breathe_hold: 'إمساك',
    breathe_exhale: 'زفير',
    breathe_sessions: 'جلسات',
    nutrition_title: 'التغذية',
    nutrition_calories: 'سعرات حرارية',
    nutrition_protein: 'بروتين',
    nutrition_carbs: 'كربوهيدرات',
    nutrition_fat: 'دهون',
    nutrition_logMeal: 'تسجيل وجبة',
    profile_title: 'الملف الشخصي',
    profile_settings: 'الإعدادات',
    profile_appearance: 'المظهر',
    profile_language: 'اللغة',
    profile_logout: 'تسجيل الخروج',
    profile_level: 'المستوى',
    profile_xp: 'XP',
    sleep_title: 'النوم',
    sleep_bedtime: 'وقت النوم',
    sleep_wakeTime: 'وقت الاستيقاظ',
    sleep_quality: 'الجودة',
    sleep_duration: 'المدة',
    mood_title: 'المزاج',
    mood_howFeeling: 'كيف تشعر؟',
    mood_awful: 'سيء جداً',
    mood_bad: 'سيء',
    mood_okay: 'عادي',
    mood_good: 'جيد',
    mood_amazing: 'رائع',
    social_title: 'اجتماعي',
    social_friends: 'الأصدقاء',
    social_leaderboard: 'لوحة المتصدرين',
    social_challenges: 'التحديات',
    social_trainers: 'المدربون',
    settings_title: 'الإعدادات',
    settings_notifications: 'الإشعارات',
    settings_privacy: 'الخصوصية',
    settings_subscription: 'الاشتراك',
    settings_about: 'حول',
  },
  hi: {
    common_back: 'वापस',
    common_save: 'सहेजें',
    common_cancel: 'रद्द करें',
    common_delete: 'हटाएं',
    common_loading: 'लोड हो रहा है...',
    common_error: 'कुछ गलत हो गया',
    common_retry: 'पुनः प्रयास',
    common_search: 'खोजें',
    common_seeAll: 'सभी देखें',
    common_noData: 'अभी तक कोई डेटा नहीं',
    tab_home: 'होम',
    tab_breathe: 'साँस',
    tab_yoga: 'योग',
    tab_nutrition: 'पोषण',
    tab_profile: 'प्रोफ़ाइल',
    home_greeting: 'सुप्रभात',
    home_dailyBriefing: 'दैनिक सारांश',
    home_quickActions: 'त्वरित कार्य',
    home_steps: 'कदम',
    home_water: 'पानी',
    home_calories: 'कैलोरी',
    home_heartRate: 'हृदय गति',
    home_streak: 'लगातार',
    workout_title: 'व्यायाम',
    workout_start: 'व्यायाम शुरू करें',
    workout_complete: 'पूरा करें',
    workout_duration: 'अवधि',
    workout_exercises: 'अभ्यास',
    breathe_title: 'साँस',
    breathe_inhale: 'साँस लें',
    breathe_hold: 'रोकें',
    breathe_exhale: 'छोड़ें',
    breathe_sessions: 'सत्र',
    nutrition_title: 'पोषण',
    nutrition_calories: 'कैलोरी',
    nutrition_protein: 'प्रोटीन',
    nutrition_carbs: 'कार्ब्स',
    nutrition_fat: 'वसा',
    nutrition_logMeal: 'भोजन लॉग करें',
    profile_title: 'प्रोफ़ाइल',
    profile_settings: 'सेटिंग्स',
    profile_appearance: 'दिखावट',
    profile_language: 'भाषा',
    profile_logout: 'लॉग आउट',
    profile_level: 'स्तर',
    profile_xp: 'XP',
    sleep_title: 'नींद',
    sleep_bedtime: 'सोने का समय',
    sleep_wakeTime: 'जागने का समय',
    sleep_quality: 'गुणवत्ता',
    sleep_duration: 'अवधि',
    mood_title: 'मूड',
    mood_howFeeling: 'आज कैसा महसूस कर रहे हैं?',
    mood_awful: 'बहुत बुरा',
    mood_bad: 'बुरा',
    mood_okay: 'ठीक',
    mood_good: 'अच्छा',
    mood_amazing: 'शानदार',
    social_title: 'सामाजिक',
    social_friends: 'दोस्त',
    social_leaderboard: 'लीडरबोर्ड',
    social_challenges: 'चुनौतियाँ',
    social_trainers: 'ट्रेनर',
    settings_title: 'सेटिंग्स',
    settings_notifications: 'सूचनाएं',
    settings_privacy: 'गोपनीयता',
    settings_subscription: 'सदस्यता',
    settings_about: 'जानकारी',
  },
  pt: {
    common_back: 'Voltar',
    common_save: 'Salvar',
    common_cancel: 'Cancelar',
    common_delete: 'Excluir',
    common_loading: 'Carregando...',
    common_error: 'Algo deu errado',
    common_retry: 'Tentar novamente',
    common_search: 'Pesquisar',
    common_seeAll: 'Ver Tudo',
    common_noData: 'Sem dados ainda',
    tab_home: 'Início',
    tab_breathe: 'Respirar',
    tab_yoga: 'Yoga',
    tab_nutrition: 'Nutrição',
    tab_profile: 'Perfil',
    home_greeting: 'Bom dia',
    home_dailyBriefing: 'Resumo diário',
    home_quickActions: 'Ações rápidas',
    home_steps: 'Passos',
    home_water: 'Água',
    home_calories: 'Calorias',
    home_heartRate: 'Frequência cardíaca',
    home_streak: 'Sequência',
    workout_title: 'Treino',
    workout_start: 'Iniciar Treino',
    workout_complete: 'Concluir',
    workout_duration: 'Duração',
    workout_exercises: 'Exercícios',
    breathe_title: 'Respirar',
    breathe_inhale: 'Inspirar',
    breathe_hold: 'Segurar',
    breathe_exhale: 'Expirar',
    breathe_sessions: 'Sessões',
    nutrition_title: 'Nutrição',
    nutrition_calories: 'Calorias',
    nutrition_protein: 'Proteína',
    nutrition_carbs: 'Carboidratos',
    nutrition_fat: 'Gordura',
    nutrition_logMeal: 'Registrar Refeição',
    profile_title: 'Perfil',
    profile_settings: 'Configurações',
    profile_appearance: 'Aparência',
    profile_language: 'Idioma',
    profile_logout: 'Sair',
    profile_level: 'Nível',
    profile_xp: 'XP',
    sleep_title: 'Sono',
    sleep_bedtime: 'Hora de dormir',
    sleep_wakeTime: 'Hora de acordar',
    sleep_quality: 'Qualidade',
    sleep_duration: 'Duração',
    mood_title: 'Humor',
    mood_howFeeling: 'Como você está se sentindo?',
    mood_awful: 'Péssimo',
    mood_bad: 'Ruim',
    mood_okay: 'Razoável',
    mood_good: 'Bom',
    mood_amazing: 'Incrível',
    social_title: 'Social',
    social_friends: 'Amigos',
    social_leaderboard: 'Classificação',
    social_challenges: 'Desafios',
    social_trainers: 'Treinadores',
    settings_title: 'Configurações',
    settings_notifications: 'Notificações',
    settings_privacy: 'Privacidade',
    settings_subscription: 'Assinatura',
    settings_about: 'Sobre',
  },
};

const RTL_LOCALES: SupportedLocale[] = ['ar'];
const STORAGE_KEY = '@zenfit_locale';

export const LOCALE_META: Record<SupportedLocale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
};

let currentLocale: SupportedLocale = 'en';

export function getLocale(): SupportedLocale {
  return currentLocale;
}

export function t(key: keyof TranslationKeys): string {
  return TRANSLATIONS[currentLocale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

export function isRTL(): boolean {
  return RTL_LOCALES.includes(currentLocale);
}

export async function setLocale(locale: SupportedLocale): Promise<void> {
  currentLocale = locale;
  const shouldBeRTL = RTL_LOCALES.includes(locale);

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    I18nManager.allowRTL(shouldBeRTL);
  }

  await AsyncStorage.setItem(STORAGE_KEY, locale);
}

export async function loadSavedLocale(): Promise<SupportedLocale> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && saved in TRANSLATIONS) {
      currentLocale = saved as SupportedLocale;
    }
  } catch {
    // Ignore storage errors, keep default
  }
  return currentLocale;
}
