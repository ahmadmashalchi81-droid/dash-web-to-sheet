/**
 * Strict Documentary Metadata Schema Types
 * Based on Documentary Metadata Extraction API Formatter Specifications
 */

export interface DocumentaryCrew {
  director: string;
  producer_individual: string;
  legal_producer_entity: string;
  executive_producer: string;
  screenwriter: string;
  researcher: string;
  cinematographer: string;
  camera_operator: string;
  sound_recordist: string;
  sound_designer: string;
  editor: string;
  music_composer: string;
  music_arranger: string;
  narrator: string;
  actors: string;
  production_manager: string;
  set_and_costume_designer: string;
  vfx_designer: string;
  title_and_graphic_designer: string;
  still_photographer: string;
  poet_lyricist: string;
  singer_vocalist: string;
  choral_group: string;
  animator: string;
  reporter: string;
}

export interface ArchivalFootageLog {
  status: string;
  timecodes: string;
  source_evidence: string;
}

export interface IntervieweeWithTimecode {
  name: string;
  role: string;
  timecode_in: string;
  timecode_out: string;
  topic: string;
}

export interface MusicCue {
  timecode_in: string;
  timecode_out: string;
  type: string;
}

export interface DocumentaryMetadata {
  // 1. Root Keys (Standard Fields - 32 keys)
  asset_id: string;
  title_extracted: string;
  title_finglish: string;
  international_title: string;
  is_series: string;
  episode_number: string;
  logline: string;
  short_synopsis: string;
  long_synopsis: string;
  technical_judicial_notes: string;
  format_category: string;
  main_topic: string;
  sub_topic: string;
  time_category: string;
  duration_exact: string;
  documentary_mode: string;
  temporal_era: string;
  symbols_and_motifs: string;
  main_protagonist_subject: string;
  core_message: string;
  subject_profession: string;
  keyframe_timestamps_5frames: string;
  visual_qc: string;
  audio_style: string;
  content_advisory_and_warnings: string;
  recommended_age_rating: string;
  ammar_discourse_score: string;
  ammar_discourse_reasons: string;
  subtitles_srt: string;
  confidence_score: string;
  human_verification_status: string;
  system_review_flags: string;

  // 2. Simple Arrays (Flat Lists of Strings)
  geographical_locations: string[];
  thematic_tags: string[];
  semantic_keywords: string[];
  languages_and_dialects: string[];

  // 3. Crew Object (25 keys)
  crew: DocumentaryCrew;

  // 4. Archival Footage Log
  archival_footage_log: ArchivalFootageLog;

  // 5. Interviewees with Timecodes (Max 2 items)
  interviewees_with_timecodes: IntervieweeWithTimecode[];

  // 6. Music Cues (Max 3 items)
  music_cues: MusicCue[];
}

export const REQUIRED_CREW_KEYS: (keyof DocumentaryCrew)[] = [
  'director',
  'producer_individual',
  'legal_producer_entity',
  'executive_producer',
  'screenwriter',
  'researcher',
  'cinematographer',
  'camera_operator',
  'sound_recordist',
  'sound_designer',
  'editor',
  'music_composer',
  'music_arranger',
  'narrator',
  'actors',
  'production_manager',
  'set_and_costume_designer',
  'vfx_designer',
  'title_and_graphic_designer',
  'still_photographer',
  'poet_lyricist',
  'singer_vocalist',
  'choral_group',
  'animator',
  'reporter'
];

export const REQUIRED_ROOT_STRING_KEYS: (keyof Omit<DocumentaryMetadata, 'geographical_locations' | 'thematic_tags' | 'semantic_keywords' | 'languages_and_dialects' | 'crew' | 'archival_footage_log' | 'interviewees_with_timecodes' | 'music_cues'>)[] = [
  'asset_id',
  'title_extracted',
  'title_finglish',
  'international_title',
  'is_series',
  'episode_number',
  'logline',
  'short_synopsis',
  'long_synopsis',
  'technical_judicial_notes',
  'format_category',
  'main_topic',
  'sub_topic',
  'time_category',
  'duration_exact',
  'documentary_mode',
  'temporal_era',
  'symbols_and_motifs',
  'main_protagonist_subject',
  'core_message',
  'subject_profession',
  'keyframe_timestamps_5frames',
  'visual_qc',
  'audio_style',
  'content_advisory_and_warnings',
  'recommended_age_rating',
  'ammar_discourse_score',
  'ammar_discourse_reasons',
  'subtitles_srt',
  'confidence_score',
  'human_verification_status',
  'system_review_flags'
];

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface KpiMetrics {
  totalRecords: number;
  totalDurationSeconds: number;
  totalDurationFormatted: string;
  averageAmmarScore: number;
  verifiedCount: number;
  pendingCount: number;
  verifiedPercentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  pagination?: PaginationInfo;
  dataSource: 'google_sheets_webapp' | 'mock_sheets_seed' | 'direct_sheet';
  lastSyncTime: string;
  data: T;
  kpis?: KpiMetrics;
  metrics?: {
    totalRecords: number;
    filteredCount?: number;
    syncDurationMs: number;
    validationErrorsCount: number;
  };
}

export interface SheetConnectionConfig {
  webAppUrl: string;
  sheetId?: string;
  sheetName?: string;
  syncIntervalMinutes?: number;
  lastSyncStatus: 'success' | 'failed' | 'idle' | 'syncing';
  lastSyncError?: string;
  lastSyncTime?: string;
  mode: 'live' | 'seed';
}
