const EVENTS_SHEET_NAME = 'Tool_Events';
const LEADS_SHEET_NAME = 'Tool_Leads';
const SUMMARY_SHEET_NAME = 'Summary';

const EVENT_HEADERS = [
  'server_timestamp',
  'event_type',
  'timestamp_iso_client',
  'session_id',
  'flow_stage',
  'tool_name',
  'first_name',
  'organization',
  'email',
  'consent',
  'score',
  'band_label',
  'weakest_pillar',
  'strongest_pillar',
  'second_weakest_pillar',
  'signal_strength',
  'mailchimp_tag_offer',
  'mailchimp_tag_nurture',
  'pillar_governance_score',
  'pillar_execution_score',
  'pillar_talent_score',
  'pillar_systems_score',
  'pillar_economy_score',
  'country_name',
  'country_code',
  'q1_role_value',
  'q1_role_text',
  'q2_country_value',
  'q2_country_text',
  'q3_stage_value',
  'q3_stage_text',
  'q4_execution_value',
  'q4_execution_text',
  'q5_systems_value',
  'q5_systems_text',
  'q6_economy_value',
  'q6_economy_text',
  'q7_talent_value',
  'q7_talent_text',
  'q8_governance_value',
  'q8_governance_text',
  'q9_urgent_need_value',
  'q9_urgent_need_text',
  'q10_desired_outcome_value',
  'q10_desired_outcome_text',
  'answers_json',
  'click_label',
  'click_url',
  'page_url',
  'referrer',
  'user_agent',
  'note'
];

const LEAD_HEADERS = [
  'server_timestamp',
  'timestamp_iso_client',
  'session_id',
  'first_name',
  'organization',
  'email',
  'consent',
  'score',
  'band_label',
  'weakest_pillar',
  'strongest_pillar',
  'second_weakest_pillar',
  'signal_strength',
  'mailchimp_tag_offer',
  'mailchimp_tag_nurture',
  'country_name',
  'country_code',
  'q1_role_text',
  'q2_country_text',
  'q3_stage_text',
  'q4_execution_text',
  'q5_systems_text',
  'q6_economy_text',
  'q7_talent_text',
  'q8_governance_text',
  'q9_urgent_need_text',
  'q10_desired_outcome_text',
  'pillar_governance_score',
  'pillar_execution_score',
  'pillar_talent_score',
  'pillar_systems_score',
  'pillar_economy_score',
  'answers_json',
  'page_url',
  'referrer'
];

function doGet(e) {
  return json_({ ok: true, app: 'The Singapore Way Tool Logger', mode: 'GET' });
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = normalizePayload_(e);
    payload.server_timestamp = new Date().toISOString();

    appendEvent_(ss, payload);

    if (String(payload.event_type || '') === 'email_submitted') {
      upsertLead_(ss, payload);
    }

    ensureSummarySheet_(ss);
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.stack ? error.stack : error) });
  }
}

function normalizePayload_(e) {
  const payload = {};

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function(key) {
      payload[key] = e.parameter[key];
    });
  }

  if (e && e.postData && e.postData.contents) {
    const type = String(e.postData.type || '');
    if (type.indexOf('application/json') !== -1) {
      try {
        const json = JSON.parse(e.postData.contents);
        Object.keys(json).forEach(function(key) {
          payload[key] = json[key];
        });
      } catch (err) {}
    }
  }

  return payload;
}

function appendEvent_(ss, payload) {
  const sheet = getOrCreateSheet_(ss, EVENTS_SHEET_NAME);
  const headers = ensureHeaders_(sheet, EVENT_HEADERS, payload);
  const row = headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(payload, header) ? payload[header] : '';
  });
  sheet.appendRow(row);
}

function upsertLead_(ss, payload) {
  const sheet = getOrCreateSheet_(ss, LEADS_SHEET_NAME);
  const headers = ensureHeaders_(sheet, LEAD_HEADERS, payload);
  const key = String(payload.email || payload.session_id || '').toLowerCase();
  const emailIndex = headers.indexOf('email');
  const sessionIndex = headers.indexOf('session_id');
  let rowToWrite = 0;

  if (sheet.getLastRow() > 1 && key) {
    const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    for (let i = 0; i < range.length; i++) {
      const rowEmail = emailIndex >= 0 ? String(range[i][emailIndex] || '').toLowerCase() : '';
      const rowSession = sessionIndex >= 0 ? String(range[i][sessionIndex] || '').toLowerCase() : '';
      if (rowEmail === key || rowSession === key) {
        rowToWrite = i + 2;
        break;
      }
    }
  }

  const row = headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(payload, header) ? payload[header] : '';
  });

  if (rowToWrite) {
    sheet.getRange(rowToWrite, 1, 1, headers.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function getOrCreateSheet_(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  return sheet;
}

function ensureHeaders_(sheet, fixedHeaders, payload) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(String)
    : [];

  let headers = existing.length ? existing.slice() : fixedHeaders.slice();
  Object.keys(payload || {}).forEach(function(key) {
    if (headers.indexOf(key) === -1) headers.push(key);
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  return headers;
}

function ensureSummarySheet_(ss) {
  let sheet = ss.getSheetByName(SUMMARY_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SUMMARY_SHEET_NAME);
    sheet.getRange('A1:B12').setValues([
      ['Metric', 'Value'],
      ['Total events', '=COUNTA(Tool_Events!A:A)-1'],
      ['Quiz starts', '=COUNTIF(Tool_Events!B:B,"quiz_started")'],
      ['Quiz completions', '=COUNTIF(Tool_Events!B:B,"quiz_completed")'],
      ['Email submissions', '=COUNTIF(Tool_Events!B:B,"email_submitted")'],
      ['Result views', '=COUNTIF(Tool_Events!B:B,"result_viewed")'],
      ['Unique emails', '=IFERROR(COUNTA(UNIQUE(FILTER(Tool_Leads!F2:F,Tool_Leads!F2:F<>""))),0)'],
      ['Offer A leads', '=COUNTIF(Tool_Leads!N:N,"Offer A")'],
      ['Offer B leads', '=COUNTIF(Tool_Leads!N:N,"Offer B")'],
      ['Offer C leads', '=COUNTIF(Tool_Leads!N:N,"Offer C")'],
      ['Offer D leads', '=COUNTIF(Tool_Leads!N:N,"Offer D")'],
      ['Offer E leads', '=COUNTIF(Tool_Leads!N:N,"Offer E")']
    ]);
    sheet.getRange('A1:B1').setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 2);
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
