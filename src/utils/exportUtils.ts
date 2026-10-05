import { DocumentaryMetadata } from '../types/documentary.ts';

export const EXPORT_HEADERS_66: string[] = [
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
  'geographical_locations',
  'main_protagonist_subject',
  'core_message',
  'subject_profession',
  'keyframe_timestamps_5frames',
  'crew.director',
  'crew.producer_individual',
  'crew.legal_producer_entity',
  'crew.executive_producer',
  'crew.screenwriter',
  'crew.researcher',
  'crew.cinematographer',
  'crew.camera_operator',
  'crew.sound_recordist',
  'crew.sound_designer',
  'crew.editor',
  'crew.music_composer',
  'crew.music_arranger',
  'crew.narrator',
  'crew.actors',
  'crew.production_manager',
  'crew.set_and_costume_designer',
  'crew.vfx_designer',
  'crew.title_and_graphic_designer',
  'crew.still_photographer',
  'crew.poet_lyricist',
  'crew.singer_vocalist',
  'crew.choral_group',
  'crew.animator',
  'crew.reporter',
  'interviewees_with_timecodes',
  'archival_footage_log.status',
  'archival_footage_log.timecodes',
  'archival_footage_log.source_evidence',
  'music_cues',
  'thematic_tags',
  'semantic_keywords',
  'languages_and_dialects',
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

/**
 * Converts a documentary object into a 66-element array corresponding to EXPORT_HEADERS_66
 */
export function convertDocumentaryTo66Row(doc: DocumentaryMetadata): string[] {
  const crew = doc.crew || ({} as any);
  const archival = doc.archival_footage_log || ({} as any);

  const interviewees = Array.isArray(doc.interviewees_with_timecodes)
    ? doc.interviewees_with_timecodes
        .map(
          (it) =>
            `name: ${it.name || ''} | role: ${it.role || ''} | timecode_in: ${it.timecode_in || ''} | timecode_out: ${it.timecode_out || ''} | topic: ${it.topic || ''}`
        )
        .join(' || ')
    : '';

  const music = Array.isArray(doc.music_cues)
    ? doc.music_cues
        .map(
          (mc) =>
            `timecode_in: ${mc.timecode_in || ''} | timecode_out: ${mc.timecode_out || ''} | type: ${mc.type || ''}`
        )
        .join(' || ')
    : '';

  return [
    doc.asset_id || '',
    doc.title_extracted || '',
    doc.title_finglish || '',
    doc.international_title || '',
    doc.is_series || 'خیر',
    doc.episode_number || '',
    doc.logline || '',
    doc.short_synopsis || '',
    doc.long_synopsis || '',
    doc.technical_judicial_notes || '',
    doc.format_category || '',
    doc.main_topic || '',
    doc.sub_topic || '',
    doc.time_category || '',
    doc.duration_exact || '',
    doc.documentary_mode || '',
    doc.temporal_era || '',
    doc.symbols_and_motifs || '',
    (doc.geographical_locations || []).join('، '),
    doc.main_protagonist_subject || '',
    doc.core_message || '',
    doc.subject_profession || '',
    doc.keyframe_timestamps_5frames || '',
    crew.director || '',
    crew.producer_individual || '',
    crew.legal_producer_entity || '',
    crew.executive_producer || '',
    crew.screenwriter || '',
    crew.researcher || '',
    crew.cinematographer || '',
    crew.camera_operator || '',
    crew.sound_recordist || '',
    crew.sound_designer || '',
    crew.editor || '',
    crew.music_composer || '',
    crew.music_arranger || '',
    crew.narrator || '',
    crew.actors || '',
    crew.production_manager || '',
    crew.set_and_costume_designer || '',
    crew.vfx_designer || '',
    crew.title_and_graphic_designer || '',
    crew.still_photographer || '',
    crew.poet_lyricist || '',
    crew.singer_vocalist || '',
    crew.choral_group || '',
    crew.animator || '',
    crew.reporter || '',
    interviewees,
    archival.status || '',
    archival.timecodes || '',
    archival.source_evidence || '',
    music,
    (doc.thematic_tags || []).join('، '),
    (doc.semantic_keywords || []).join('، '),
    (doc.languages_and_dialects || []).join('، '),
    doc.visual_qc || '',
    doc.audio_style || '',
    doc.content_advisory_and_warnings || '',
    doc.recommended_age_rating || '',
    String(doc.ammar_discourse_score ?? ''),
    doc.ammar_discourse_reasons || '',
    doc.subtitles_srt || '',
    String(doc.confidence_score ?? ''),
    doc.human_verification_status || '',
    doc.system_review_flags || ''
  ];
}

/**
 * Triggers a download in the user's browser
 */
function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates raw UTF-8 CSV content with BOM covering all 66 columns
 */
export function generateCsvContent(documentaries: DocumentaryMetadata[]): string {
  const escapeCsv = (val: string) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = EXPORT_HEADERS_66.map(escapeCsv).join(',');
  const lines = documentaries.map((doc) => {
    const row = convertDocumentaryTo66Row(doc);
    return row.map(escapeCsv).join(',');
  });

  return '\uFEFF' + [headerLine, ...lines].join('\r\n');
}

/**
 * Generates Microsoft Excel SpreadsheetML (.xls XML) content with 66 columns, RTL support, and custom styling
 */
export function generateExcelXmlContent(
  documentaries: DocumentaryMetadata[],
  sheetName = 'temp'
): string {
  const escapeXml = (str: string) => {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const safeSheetName = escapeXml(sheetName || 'temp');
  const headerCells = EXPORT_HEADERS_66.map(
    (h) => `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
  ).join('');

  const rowNodes = documentaries
    .map((doc) => {
      const row = convertDocumentaryTo66Row(doc);
      const cells = row
        .map(
          (val) => `<Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`
        )
        .join('');
      return `<Row ss:Height="22">${cells}</Row>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
   <Font ss:FontName="Vazirmatn" x:CharSet="178" ss:Size="10" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4A5568"/>
   </Borders>
   <Font ss:FontName="Vazirmatn" x:CharSet="178" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1A1C23" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataStyle">
   <Alignment ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Vazirmatn" x:CharSet="178" ss:Size="9.5" ss:Color="#1A202C"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${safeSheetName}">
  <Table ss:DefaultRowHeight="20">
   <Row ss:Height="28">${headerCells}</Row>
   ${rowNodes}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <DisplayRightToLeft/>
   <Selected/>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitPane>
    <PaneNumber>2</PaneNumber>
   </SplitPane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

/**
 * Exports documentaries as formatted JSON file
 */
export function exportToJson(documentaries: DocumentaryMetadata[], filename = 'documentaries-export.json') {
  const jsonStr = JSON.stringify(documentaries, null, 2);
  triggerDownload(jsonStr, filename, 'application/json;charset=utf-8');
}

/**
 * Exports documentaries as standard UTF-8 CSV with BOM (for seamless Excel Persian support)
 */
export function exportToCsv(documentaries: DocumentaryMetadata[], filename = 'documentaries-export-66cols.csv') {
  const csvContent = generateCsvContent(documentaries);
  triggerDownload(csvContent, filename, 'text/csv;charset=utf-8');
}

/**
 * Exports documentaries as Microsoft Excel SpreadsheetML (.xlsx / .xml)
 * Compatible with all versions of Microsoft Excel with full styling and Persian RTL support.
 */
export function exportToExcelXml(
  documentaries: DocumentaryMetadata[],
  filename = 'documentaries-export-66cols.xls',
  sheetName = 'temp'
) {
  const xml = generateExcelXmlContent(documentaries, sheetName);
  triggerDownload(xml, filename, 'application/vnd.ms-excel;charset=utf-8');
}

