import {
  DocumentaryMetadata,
  DocumentaryCrew,
  ArchivalFootageLog,
  IntervieweeWithTimecode,
  MusicCue,
  REQUIRED_CREW_KEYS,
  REQUIRED_ROOT_STRING_KEYS
} from '../types/documentary.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData: DocumentaryMetadata;
}

/**
 * Creates an empty, 100% compliant DocumentaryCrew object
 */
export function createDefaultCrew(): DocumentaryCrew {
  return {
    director: "",
    producer_individual: "",
    legal_producer_entity: "",
    executive_producer: "",
    screenwriter: "",
    researcher: "",
    cinematographer: "",
    camera_operator: "",
    sound_recordist: "",
    sound_designer: "",
    editor: "",
    music_composer: "",
    music_arranger: "",
    narrator: "",
    actors: "",
    production_manager: "",
    set_and_costume_designer: "",
    vfx_designer: "",
    title_and_graphic_designer: "",
    still_photographer: "",
    poet_lyricist: "",
    singer_vocalist: "",
    choral_group: "",
    animator: "",
    reporter: ""
  };
}

/**
 * Creates an empty, 100% compliant ArchivalFootageLog object
 */
export function createDefaultArchivalLog(): ArchivalFootageLog {
  return {
    status: "",
    timecodes: "",
    source_evidence: ""
  };
}

/**
 * Validates and sanitizes raw documentary input into strict schema compliance
 */
export function validateAndSanitizeDocumentary(raw: any, index: number = 0): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: [`Item at index ${index} is not an object.`],
      warnings: [],
      sanitizedData: createEmptyDocumentary(`DOC-${index + 1}`)
    };
  }

  const sanitized: DocumentaryMetadata = createEmptyDocumentary(
    String(raw.asset_id || `DOC-${index + 1}`)
  );

  // 1. Process 32 Root String Keys
  for (const key of REQUIRED_ROOT_STRING_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) {
      sanitized[key] = String(raw[key]);
    } else {
      sanitized[key] = "";
    }
  }

  // Normalize is_series to 'بله' / 'خیر' per Data Dictionary
  const rawSeries = String(raw.is_series || "").toLowerCase().trim();
  if (rawSeries === "true" || rawSeries === "بله" || rawSeries === "yes") {
    sanitized.is_series = "بله";
  } else {
    sanitized.is_series = "خیر";
  }

  // Ensure asset_id and title_extracted are present
  if (!sanitized.asset_id.trim()) {
    sanitized.asset_id = `DOC-${index + 1}`;
    warnings.push(`Missing asset_id at index ${index}, defaulted to '${sanitized.asset_id}'.`);
  }
  if (!sanitized.title_extracted.trim()) {
    warnings.push(`Record '${sanitized.asset_id}' has empty title_extracted.`);
  }

  // 2. Simple Arrays: geographical_locations, thematic_tags, semantic_keywords, languages_and_dialects
  sanitized.geographical_locations = sanitizeStringArray(raw.geographical_locations);
  sanitized.thematic_tags = sanitizeStringArray(raw.thematic_tags);
  sanitized.semantic_keywords = sanitizeStringArray(raw.semantic_keywords);
  sanitized.languages_and_dialects = sanitizeStringArray(raw.languages_and_dialects);

  // 3. Crew Object (exact 25 keys)
  sanitized.crew = createDefaultCrew();
  const rawCrew = raw.crew && typeof raw.crew === 'object' ? raw.crew : {};
  for (const crewKey of REQUIRED_CREW_KEYS) {
    // Check if flat column exists (e.g. "crew_director" or "crew.director")
    const val = rawCrew[crewKey] ?? raw[`crew_${crewKey}`] ?? raw[`crew.${crewKey}`];
    sanitized.crew[crewKey] = val !== undefined && val !== null ? String(val) : "";
  }

  // 4. Archival Footage Log (exact 3 keys)
  sanitized.archival_footage_log = createDefaultArchivalLog();
  const rawArchival = raw.archival_footage_log && typeof raw.archival_footage_log === 'object' 
    ? raw.archival_footage_log 
    : {};
  sanitized.archival_footage_log.status = String(
    rawArchival.status ?? raw.archival_status ?? ""
  );
  sanitized.archival_footage_log.timecodes = String(
    rawArchival.timecodes ?? raw.archival_timecodes ?? ""
  );
  sanitized.archival_footage_log.source_evidence = String(
    rawArchival.source_evidence ?? raw.archival_source_evidence ?? ""
  );

  // 5. Interviewees with Timecodes (Max 2 objects)
  sanitized.interviewees_with_timecodes = [];
  let rawInterviewees = raw.interviewees_with_timecodes;
  if (typeof rawInterviewees === 'string') {
    try {
      rawInterviewees = JSON.parse(rawInterviewees);
    } catch {
      rawInterviewees = [];
    }
  }

  if (Array.isArray(rawInterviewees)) {
    if (rawInterviewees.length > 2) {
      warnings.push(`Record '${sanitized.asset_id}': interviewees count (${rawInterviewees.length}) exceeds max of 2. Clamped to first 2.`);
    }
    const clamped = rawInterviewees.slice(0, 2);
    for (const item of clamped) {
      if (item && typeof item === 'object') {
        sanitized.interviewees_with_timecodes.push({
          name: String(item.name || ""),
          role: String(item.role || ""),
          timecode_in: String(item.timecode_in || ""),
          timecode_out: String(item.timecode_out || ""),
          topic: String(item.topic || "")
        });
      }
    }
  }

  // 6. Music Cues (Max 3 objects)
  sanitized.music_cues = [];
  let rawMusic = raw.music_cues;
  if (typeof rawMusic === 'string') {
    try {
      rawMusic = JSON.parse(rawMusic);
    } catch {
      rawMusic = [];
    }
  }

  if (Array.isArray(rawMusic)) {
    if (rawMusic.length > 3) {
      warnings.push(`Record '${sanitized.asset_id}': music_cues count (${rawMusic.length}) exceeds max of 3. Clamped to first 3.`);
    }
    const clamped = rawMusic.slice(0, 3);
    for (const item of clamped) {
      if (item && typeof item === 'object') {
        sanitized.music_cues.push({
          timecode_in: String(item.timecode_in || ""),
          timecode_out: String(item.timecode_out || ""),
          type: String(item.type || "")
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData: sanitized
  };
}

function sanitizeStringArray(rawVal: any): string[] {
  if (!rawVal) return [];
  if (Array.isArray(rawVal)) {
    return rawVal.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof rawVal === 'string') {
    // If it's a JSON array string: '["a", "b"]'
    if (rawVal.trim().startsWith('[') && rawVal.trim().endsWith(']')) {
      try {
        const parsed = JSON.parse(rawVal);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
      } catch {
        // Fall back to comma-separated
      }
    }
    // Comma or Persian comma separated
    return rawVal
      .split(/[,،]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Creates an empty DocumentaryMetadata skeleton with all required keys
 */
export function createEmptyDocumentary(assetId = "DOC-001"): DocumentaryMetadata {
  return {
    asset_id: assetId,
    title_extracted: "",
    title_finglish: "",
    international_title: "",
    is_series: "خیر",
    episode_number: "",
    logline: "",
    short_synopsis: "",
    long_synopsis: "",
    technical_judicial_notes: "",
    format_category: "",
    main_topic: "",
    sub_topic: "",
    time_category: "",
    duration_exact: "00:00:00",
    documentary_mode: "",
    temporal_era: "",
    symbols_and_motifs: "",
    main_protagonist_subject: "",
    core_message: "",
    subject_profession: "",
    keyframe_timestamps_5frames: "",
    visual_qc: "Passed",
    audio_style: "",
    content_advisory_and_warnings: "",
    recommended_age_rating: "عمومی",
    ammar_discourse_score: "",
    ammar_discourse_reasons: "",
    subtitles_srt: "",
    confidence_score: "1.0",
    human_verification_status: "در انتظار بررسی",
    system_review_flags: "",

    geographical_locations: [],
    thematic_tags: [],
    semantic_keywords: [],
    languages_and_dialects: [],

    crew: createDefaultCrew(),
    archival_footage_log: createDefaultArchivalLog(),
    interviewees_with_timecodes: [],
    music_cues: []
  };
}

/**
 * Parse MM:SS or HH:MM:SS string to total seconds
 */
export function parseDurationToSeconds(duration: string): number {
  if (!duration || typeof duration !== 'string') return 0;
  const parts = duration.trim().split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Format total seconds to "X ساعت و Y دقیقه" per Section 4 of Data Dictionary
 */
export function formatTotalDurationHoursMinutes(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} ساعت و ${minutes} دقیقه`;
  }
  return `${minutes} دقیقه`;
}

