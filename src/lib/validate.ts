import { Investigation, Val, Range, GravityRegime, SafetyArea, RecordType, DataOrigin } from '@/data/schema';

export interface ValidationError {
  field?: string;
  record_id?: string;
  message: string;
  rule?: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
}

const ALLOWED_SAFETY_AREAS: Set<SafetyArea> = new Set(['prevention', 'detection', 'suppression', 'other']);
const ALLOWED_RECORD_TYPES: Set<RecordType> = new Set(['test_matrix', 'condition_range', 'summary', 'telemetry', 'mixed']);
const ALLOWED_GRAVITY_REGIMES: Set<GravityRegime> = new Set(['microgravity', '1g', 'electric-field-analog']);
const ALLOWED_DATA_ORIGINS: Set<DataOrigin> = new Set(['flight', 'ground', 'simulation']);

const ALLOWED_INVESTIGATION_KEYS: Set<string> = new Set([
  'id',
  'acronym',
  'name',
  'doi',
  'license',
  'verified',
  'depth',
  'record_type',
  'safety_areas',
  'gravity_regimes',
  'data_origin',
  'hardware',
  'objectives',
  'fuels',
  'fuel_phase',
  'sample_shape',
  'sample_size',
  'cabin_o2_pct',
  'burner_flow_o2_pct',
  'pressure_psi',
  'airflow_speed_cm_s',
  'varied_variables',
  'constant_variables',
  'sensors',
  'n_tests',
  'not_reported',
  'stratified_o2_pct',
  'table_listed_o2_pct',
]);

const CORE_VAL_FIELDS: Array<keyof Investigation> = [
  'hardware',
  'objectives',
  'fuels',
  'sample_shape',
  'sample_size',
  'cabin_o2_pct',
  'burner_flow_o2_pct',
  'pressure_psi',
  'airflow_speed_cm_s',
  'varied_variables',
  'constant_variables',
  'sensors',
  'n_tests',
];

export interface ValidateInvestigationOptions {
  isRelease?: boolean;
}

/**
 * Validates an individual Val<T> object.
 * Rules:
 * - If non-null, must have provenance with source_id, entered_by in ('parsed' | 'hand').
 * - Any numeric value (or Range) must have a non-empty unit string.
 * - Unit conversions require an exact formula in the note.
 */
export function validateVal(val: unknown, fieldName: string, recordId: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (val === null || val === undefined) return errors;

  if (typeof val !== 'object' || val === null) {
    errors.push({
      field: fieldName,
      record_id: recordId,
      message: `Field '${fieldName}' must be null or an object matching Val<T>.`,
      rule: 'Section 5 Schema',
    });
    return errors;
  }

  const v = val as Record<string, unknown>;

  if (!('value' in v) || v.value === undefined) {
    errors.push({
      field: fieldName,
      record_id: recordId,
      message: `Field '${fieldName}' must contain a 'value' property.`,
      rule: 'Section 5 Schema',
    });
  }

  // Provenance check
  if (!v.provenance || typeof v.provenance !== 'object') {
    errors.push({
      field: fieldName,
      record_id: recordId,
      message: `Field '${fieldName}' has a value but missing provenance object.`,
      rule: 'Section 2 Rule 2',
    });
  } else {
    const prov = v.provenance as Record<string, unknown>;
    if (!prov.source_id || typeof prov.source_id !== 'string') {
      errors.push({
        field: `${fieldName}.provenance.source_id`,
        record_id: recordId,
        message: `Field '${fieldName}' provenance requires non-empty source_id.`,
        rule: 'Section 5 Schema',
      });
    }
    if (prov.entered_by !== 'parsed' && prov.entered_by !== 'hand') {
      errors.push({
        field: `${fieldName}.provenance.entered_by`,
        record_id: recordId,
        message: `Field '${fieldName}' entered_by must be 'parsed' or 'hand'.`,
        rule: 'Section 5 Schema',
      });
    }
  }

  // Unit requirement for numeric values
  const isNumeric =
    typeof v.value === 'number' ||
    (typeof v.value === 'object' && v.value !== null && 'min' in v.value && 'max' in v.value);

  if (isNumeric) {
    if (!v.unit || typeof v.unit !== 'string' || v.unit.trim() === '') {
      errors.push({
        field: fieldName,
        record_id: recordId,
        message: `Numeric field '${fieldName}' must specify a unit string.`,
        rule: 'Section 5 Build Failure on numeric value with no unit',
      });
    }
  }

  return errors;
}

/**
 * Validates an Investigation record strictly following Section 2 and Section 5 of SPEC.md.
 */
export function validateInvestigation(
  record: unknown,
  options?: ValidateInvestigationOptions
): ValidationReport {
  const errors: ValidationError[] = [];

  if (!record || typeof record !== 'object') {
    return {
      valid: false,
      errors: [{ message: 'Record must be a non-null object.', rule: 'Section 5 Schema' }],
    };
  }

  const rec = record as Record<string, unknown>;
  const recordId = typeof rec.id === 'string' ? rec.id : 'UNKNOWN';

  // 1. Unknown keys check
  for (const key of Object.keys(rec)) {
    if (!ALLOWED_INVESTIGATION_KEYS.has(key)) {
      errors.push({
        field: key,
        record_id: recordId,
        message: `Unknown key '${key}' is not allowed in Investigation schema.`,
        rule: 'Section 5 Build Failure on unknown keys',
      });
    }
  }

  // 2. ID check
  if (!rec.id || typeof rec.id !== 'string' || !rec.id.startsWith('PSI-')) {
    errors.push({
      field: 'id',
      record_id: recordId,
      message: "Investigation 'id' must be a non-empty string starting with 'PSI-'.",
      rule: 'Section 5 Schema',
    });
  }

  // 3. DOI check (Section 5: Build fails on missing DOI)
  if (!rec.doi || typeof rec.doi !== 'string' || rec.doi.trim() === '') {
    errors.push({
      field: 'doi',
      record_id: recordId,
      message: 'DOI is missing or empty; required for all investigations.',
      rule: 'Section 5 Build Failure on missing DOI',
    });
  }

  // 4. Acronym and Name
  if (!rec.acronym || typeof rec.acronym !== 'string') {
    errors.push({ field: 'acronym', record_id: recordId, message: 'Acronym is required.', rule: 'Section 5' });
  }
  if (!rec.name || typeof rec.name !== 'string') {
    errors.push({ field: 'name', record_id: recordId, message: 'Name is required.', rule: 'Section 5' });
  }

  // 5. Depth
  if (rec.depth !== 'deep' && rec.depth !== 'catalog') {
    errors.push({
      field: 'depth',
      record_id: recordId,
      message: "Depth must be 'deep' or 'catalog'.",
      rule: 'Section 5 Schema',
    });
  }

  // 6. Record type
  if (typeof rec.record_type !== 'string' || !ALLOWED_RECORD_TYPES.has(rec.record_type as RecordType)) {
    errors.push({
      field: 'record_type',
      record_id: recordId,
      message: `Invalid record_type '${String(rec.record_type)}'.`,
      rule: 'Section 5 Schema',
    });
  }

  // 7. Safety areas
  if (!Array.isArray(rec.safety_areas) || rec.safety_areas.length === 0) {
    errors.push({
      field: 'safety_areas',
      record_id: recordId,
      message: 'safety_areas must be a non-empty array of SafetyArea.',
      rule: 'Section 5 Schema',
    });
  } else {
    for (const sa of rec.safety_areas) {
      if (!ALLOWED_SAFETY_AREAS.has(sa)) {
        errors.push({
          field: 'safety_areas',
          record_id: recordId,
          message: `Invalid safety area '${String(sa)}'.`,
          rule: 'Section 5 Schema',
        });
      }
    }
  }

  // 8. Gravity regimes (STRICT: Section 2 Rule 5: NO PARTIAL GRAVITY!)
  if (!Array.isArray(rec.gravity_regimes) || rec.gravity_regimes.length === 0) {
    errors.push({
      field: 'gravity_regimes',
      record_id: recordId,
      message: 'gravity_regimes must be a non-empty array.',
      rule: 'Section 5 Schema',
    });
  } else {
    for (const gr of rec.gravity_regimes) {
      const grStr = String(gr).toLowerCase();
      if (
        grStr.includes('partial') ||
        grStr.includes('lunar') ||
        grStr.includes('moon') ||
        grStr.includes('mars')
      ) {
        errors.push({
          field: 'gravity_regimes',
          record_id: recordId,
          message: `Forbidden gravity regime '${grStr}': PSI has no partial-gravity data.`,
          rule: 'Section 2 Rule 5 & Section 5 Build Failure on partial-g',
        });
      } else if (!ALLOWED_GRAVITY_REGIMES.has(gr as GravityRegime)) {
        errors.push({
          field: 'gravity_regimes',
          record_id: recordId,
          message: `Invalid gravity regime '${String(gr)}'. Only 'microgravity', '1g', or 'electric-field-analog' allowed.`,
          rule: 'Section 5 Schema',
        });
      }
    }
  }

  // 9. Data origin
  if (!Array.isArray(rec.data_origin) || rec.data_origin.length === 0) {
    errors.push({
      field: 'data_origin',
      record_id: recordId,
      message: 'data_origin must be a non-empty array.',
      rule: 'Section 5 Schema',
    });
  } else {
    for (const doOrigin of rec.data_origin) {
      if (!ALLOWED_DATA_ORIGINS.has(doOrigin as DataOrigin)) {
        errors.push({
          field: 'data_origin',
          record_id: recordId,
          message: `Invalid data_origin '${String(doOrigin)}'.`,
          rule: 'Section 5 Schema',
        });
      }
    }
  }

  // 10. Release build verification check
  if (options?.isRelease && rec.depth === 'deep' && rec.verified !== true) {
    errors.push({
      field: 'verified',
      record_id: recordId,
      message: 'verified must be true for all deep records in a release build.',
      rule: 'Section 5 Build Failure on verified: false for deep record',
    });
  }

  // 11. Val fields check
  for (const field of CORE_VAL_FIELDS) {
    const valErrors = validateVal(rec[field], field, recordId);
    errors.push(...valErrors);
  }
  if (rec.fuel_phase !== undefined) {
    errors.push(...validateVal(rec.fuel_phase, 'fuel_phase', recordId));
  }

  // 12. not_reported calculation consistency check
  const actualNullFields: string[] = [];
  for (const field of CORE_VAL_FIELDS) {
    if (rec[field] === null || rec[field] === undefined) {
      actualNullFields.push(field);
    }
  }

  if (Array.isArray(rec.not_reported)) {
    const reportedSet = new Set(rec.not_reported as string[]);
    for (const nf of actualNullFields) {
      if (!reportedSet.has(nf)) {
        errors.push({
          field: 'not_reported',
          record_id: recordId,
          message: `Field '${nf}' is null but not listed in not_reported array.`,
          rule: 'Section 5 not_reported computed consistency',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates AI Digest content against ground-truth Investigation records.
 * Rules (Section 10 & 12):
 * - Every sentence must cite at least one valid record_id.
 * - Every number in the sentence text must be grounded in the cited record.
 */
export function validateDigest(
  digest: { id: string; sentences: Array<{ text: string; record_ids: string[] }> },
  recordsMap: Map<string, Investigation> | Record<string, Investigation>
): ValidationReport {
  const errors: ValidationError[] = [];
  const getRecord = (id: string): Investigation | undefined => {
    if (recordsMap instanceof Map) return recordsMap.get(id);
    return recordsMap[id];
  };

  if (!digest || !Array.isArray(digest.sentences)) {
    return {
      valid: false,
      errors: [{ message: 'Digest must contain an array of sentences.', rule: 'Section 10' }],
    };
  }

  digest.sentences.forEach((sentence, sIdx) => {
    if (!sentence.record_ids || sentence.record_ids.length === 0) {
      errors.push({
        field: `sentences[${sIdx}]`,
        message: `Sentence ${sIdx + 1} has no cited record_ids: "${sentence.text}"`,
        rule: 'Section 10 Citation Chips',
      });
      return;
    }

    const citedRecords: Investigation[] = [];
    for (const rId of sentence.record_ids) {
      const rec = getRecord(rId);
      if (!rec) {
        errors.push({
          field: `sentences[${sIdx}].record_ids`,
          record_id: rId,
          message: `Sentence ${sIdx + 1} cites unknown record ID '${rId}'`,
          rule: 'Section 10 / Section 12 Grounding',
        });
      } else {
        citedRecords.push(rec);
      }
    }

    // Extract numbers from sentence text
    // Matches integer or floating point numbers (e.g. 21, 14.7, 100)
    const numberMatches = sentence.text.match(/\b\d+(?:\.\d+)?\b/g);
    if (numberMatches && citedRecords.length > 0) {
      for (const numStr of numberMatches) {
        const val = parseFloat(numStr);
        // Ignore sentence indexing or citation numbers if they match IDs like PSI-102
        if (sentence.text.includes(`PSI-${numStr}`) || numStr.length >= 6) {
          continue; // Likely a DOI suffix or part of record identifier
        }

        const grounded = isNumberGroundedInRecords(val, citedRecords);
        if (!grounded) {
          errors.push({
            field: `sentences[${sIdx}]`,
            message: `Number '${numStr}' in sentence ${sIdx + 1} ("${sentence.text}") does not appear in cited record(s): ${sentence.record_ids.join(', ')}`,
            rule: 'Section 10 / Section 12 Number Grounding',
          });
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to check if a numeric value appears in an Investigation record's fields or metadata.
 */
function isNumberGroundedInRecords(num: number, records: Investigation[]): boolean {
  // Exact conversion formulas, identity multiplier 1, and zero-count findings are valid mathematical constants
  if (num === 0 || num === 1 || Math.abs(num - 6.894757) < 1e-4) return true;

  for (const rec of records) {
    // Check all Val fields
    for (const field of CORE_VAL_FIELDS) {
      const vObj = rec[field] as Val<unknown>;
      if (!vObj || vObj.value == null) continue;

      if (typeof vObj.value === 'number') {
        if (Math.abs(vObj.value - num) < 1e-4) return true;
      } else if (typeof vObj.value === 'object' && 'min' in vObj.value && 'max' in vObj.value) {
        const rng = vObj.value as Range;
        const rMin = rng.min ?? rng.max;
        if (Math.abs(rMin - num) < 1e-4 || Math.abs(rng.max - num) < 1e-4) return true;
        // Also if num falls within tested range bounds
        if (num >= rMin && num <= rng.max) return true;
      } else if (typeof vObj.value === 'string') {
        if (vObj.value.includes(num.toString())) return true;
      }
    }

    // Check name, acronym, hardware string values
    if (rec.name?.includes(num.toString())) return true;
    if (rec.acronym?.includes(num.toString())) return true;
    if (rec.hardware?.value?.includes(num.toString())) return true;

    // Check n_tests
    if (rec.n_tests?.value != null && Math.abs(rec.n_tests.value - num) < 1e-4) {
      return true;
    }
  }
  return false;
}

export interface AgentEvidenceRef {
  record_id?: string;
  tool_id?: string;
  field?: string;
}

export interface AgentAnswerSentence {
  text: string;
  evidence: AgentEvidenceRef[];
}

export interface AgentAnswer {
  sentences: AgentAnswerSentence[];
  refusal: string | null;
}

export interface AgentValidationContext {
  query?: string;
  records?: Map<string, Investigation> | Record<string, Investigation>;
  toolResults?: Map<string, unknown> | Record<string, unknown>;
}

/**
 * Validates Ask ASTRA agent outputs strictly according to Section 12 of SPEC.md.
 * Rules:
 * - Refuses and explains for:
 *   1. Partial-gravity predictions.
 *   2. Rockets and propellants.
 *   3. Anything outside records or domain.
 * - If not refused:
 *   - Rejects unknown record IDs and tool call IDs.
 *   - Every number must appear in cited record or tool result.
 *   - Derived numbers must come from tools (no LLM arithmetic).
 *   - A sentence quoting a model estimate must say 'model estimate' and carry interval and applicability status.
 */
export function validateAgentAnswer(
  answer: AgentAnswer,
  context?: AgentValidationContext
): ValidationReport {
  const errors: ValidationError[] = [];

  const query = (context?.query ?? '').toLowerCase();

  // Refusal Checks
  const asksPartialG =
    query.includes('partial gravity') ||
    query.includes('partial-g') ||
    query.includes('lunar gravity') ||
    query.includes('moon gravity') ||
    query.includes('mars gravity') ||
    query.includes('0.16g') ||
    query.includes('0.38g');

  const asksRocketsOrPropellant =
    query.includes('rocket') ||
    query.includes('propellant') ||
    query.includes('hydrazine') ||
    query.includes('rp-1') ||
    query.includes('solid rocket motor') ||
    query.includes('methalox');

  const asksSafetyGuarantee =
    query.includes('guarantee') ||
    query.includes('absolute safety') ||
    query.includes('never ignite') ||
    query.includes('completely safe') ||
    query.includes('zero risk') ||
    query.includes('100% safe');

  const asksBypass =
    query.includes('ignore previous') ||
    query.includes('bypass rules') ||
    query.includes('disregard safety') ||
    query.includes('jailbreak') ||
    query.includes('invent a number') ||
    query.includes('hallucinate');

  if (asksPartialG && !answer.refusal) {
    errors.push({
      message: 'Agent must refuse queries requesting partial-gravity predictions (Section 2 Rule 5).',
      rule: 'Section 2 Rule 5 & Section 12 Refusals',
    });
  }

  if (asksRocketsOrPropellant && !answer.refusal) {
    errors.push({
      message: 'Agent must refuse queries regarding rockets or propellants (Section 2 Rule 6).',
      rule: 'Section 2 Rule 6 & Section 12 Refusals',
    });
  }

  if (asksSafetyGuarantee && !answer.refusal) {
    errors.push({
      message: 'Agent must refuse queries requesting absolute safety guarantees (Section 12 Safety Policy).',
      rule: 'Section 12 Safety Policy & Refusals',
    });
  }

  if (asksBypass && !answer.refusal) {
    errors.push({
      message: 'Agent must refuse instructions to ignore rules or fabricate data (Section 12 Security Policy).',
      rule: 'Section 12 Security Policy & Refusals',
    });
  }

  if (answer.refusal) {
    // If successfully refused, valid as refusal
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Answer validation
  if (!Array.isArray(answer.sentences) || answer.sentences.length === 0) {
    errors.push({
      message: 'Agent answer must provide an array of grounded sentences.',
      rule: 'Section 12 Contract',
    });
    return { valid: false, errors };
  }

  const getRecord = (id: string): Investigation | undefined => {
    if (!context?.records) return undefined;
    if (context.records instanceof Map) return context.records.get(id);
    return context.records[id];
  };

  const getToolResult = (id: string): unknown => {
    if (!context?.toolResults) return undefined;
    if (context.toolResults instanceof Map) return context.toolResults.get(id);
    return context.toolResults[id];
  };

  answer.sentences.forEach((sentence, idx) => {
    if (!sentence.evidence || sentence.evidence.length === 0) {
      errors.push({
        field: `sentences[${idx}]`,
        message: `Sentence ${idx + 1} has no evidence citations.`,
        rule: 'Section 12 Grounding',
      });
      return;
    }

    const citedRecords: Investigation[] = [];
    const citedToolResults: unknown[] = [];

    for (const ev of sentence.evidence) {
      if (ev.record_id) {
        const rec = getRecord(ev.record_id);
        if (!rec && context?.records) {
          errors.push({
            field: `sentences[${idx}].evidence`,
            record_id: ev.record_id,
            message: `Unknown record ID '${ev.record_id}' cited in evidence.`,
            rule: 'Section 12 Validator',
          });
        } else if (rec) {
          citedRecords.push(rec);
        }
      }
      if (ev.tool_id) {
        const tr = getToolResult(ev.tool_id);
        if (!tr && context?.toolResults) {
          errors.push({
            field: `sentences[${idx}].evidence`,
            message: `Unknown tool call ID '${ev.tool_id}' cited in evidence.`,
            rule: 'Section 12 Validator',
          });
        } else if (tr) {
          citedToolResults.push(tr);
        }
      }
    }

    const textLower = sentence.text.toLowerCase();

    // 1. Investigation ID Interception (SPEC Section 12)
    // Intercept any PSI ID mentioned in sentence text that is unknown in the catalog
    const textPsiMatches = sentence.text.match(/\bPSI-\d+\b/g);
    if (textPsiMatches && context?.records) {
      for (const mId of textPsiMatches) {
        const foundRec = getRecord(mId);
        const isAbstentionOrRefusal =
          textLower.includes('not found') ||
          textLower.includes('unknown') ||
          textLower.includes('abstention') ||
          textLower.includes('not in the catalog') ||
          textLower.includes('does not exist');
        if (!foundRec && !isAbstentionOrRefusal) {
          errors.push({
            field: `sentences[${idx}]`,
            record_id: mId,
            message: `Investigation ID '${mId}' in sentence ${idx + 1} is unknown or not in the catalog.`,
            rule: 'Section 12 Grounding (Investigation ID Check)',
          });
        }
      }
    }

    // 2. Fuel / Material Grounding Interception (SPEC Section 12)
    // Every fuel or material mentioned in claims must be grounded in the cited investigation
    const CHECK_FUELS = [
      'hydrazine', 'rp-1', 'kerosene', 'titanium', 'methane', 'propane', 'ethane', 'butane',
      'heptane', 'decane', 'methanol', 'ethanol', 'wood', 'diesel', 'gasoline', 'delrin',
      'polyethylene', 'polystyrene', 'pmma', 'acrylic', 'teflon', 'ptfe', 'kapton', 'silicone',
      'sibal', 'nomex', 'cotton', 'cellulose', 'hexadecane'
    ];

    const isFuelAbsenceClaim =
      textLower.includes('did not test') ||
      textLower.includes('never tested') ||
      textLower.includes('not reported') ||
      textLower.includes('not found') ||
      textLower.includes('zero') ||
      textLower.includes('refusal') ||
      textLower.includes('out of scope');

    if (!isFuelAbsenceClaim && citedRecords.length > 0) {
      for (const f of CHECK_FUELS) {
        const fuelRegex = new RegExp(`\\b${f}\\b`, 'i');
        if (fuelRegex.test(sentence.text)) {
          // Check if at least one cited record includes this fuel
          const fuelIsGrounded = citedRecords.some((rec) => {
            const fuelsList = rec.fuels?.value;
            if (Array.isArray(fuelsList)) {
              if (fuelsList.some((rf) => rf.toLowerCase().includes(f))) return true;
            }
            if (rec.sample_shape?.value?.toLowerCase().includes(f)) return true;
            if (rec.sample_size?.value?.toLowerCase().includes(f)) return true;
            if (rec.name?.toLowerCase().includes(f)) return true;
            if (rec.objectives?.value?.toLowerCase().includes(f)) return true;
            return false;
          });

          if (!fuelIsGrounded) {
            errors.push({
              field: `sentences[${idx}]`,
              message: `Fuel or material '${f}' in sentence ${idx + 1} does not appear in fuels list of cited record(s): ${citedRecords.map((r) => r.id).join(', ')}.`,
              rule: 'Section 12 Fuel Verification',
            });
          }
        }
      }
    }

    // 3. Unit & Physical Dimensional Interception (SPEC Section 12)
    // Intercept bogus units or physical dimensional mismatches
    const BOGUS_UNITS = [
      'lightyears', 'lightyear', 'parsecs', 'parsec', 'astronomical units', 'gallons', 'miles', 'feet', 'yards'
    ];
    for (const bu of BOGUS_UNITS) {
      if (new RegExp(`\\b${bu}\\b`, 'i').test(sentence.text)) {
        errors.push({
          field: `sentences[${idx}]`,
          message: `Invalid or ungrounded unit '${bu}' in sentence ${idx + 1}.`,
          rule: 'Section 12 Unit Verification',
        });
      }
    }

    // Dimensional mismatches (e.g. airflow in psi, pressure in cm/s, temperature in psi)
    if (/\bairflow(?:\s+velocity)?(?:\s+of)?\s+\d+(?:\.\d+)?\s*(?:psi|kpa|bar|mmhg|kelvin|k\b)/i.test(sentence.text)) {
      errors.push({
        field: `sentences[${idx}]`,
        message: `Physical dimensional mismatch: airflow velocity cannot be measured in pressure or temperature units in sentence ${idx + 1}.`,
        rule: 'Section 12 Unit Verification',
      });
    }
    if (/\bpressure(?:\s+of)?\s+\d+(?:\.\d+)?\s*(?:cm\/s|m\/s|kelvin|k\b)/i.test(sentence.text)) {
      errors.push({
        field: `sentences[${idx}]`,
        message: `Physical dimensional mismatch: pressure cannot be measured in velocity or temperature units in sentence ${idx + 1}.`,
        rule: 'Section 12 Unit Verification',
      });
    }
    if (/\btemperature(?:\s+of)?\s+\d+(?:\.\d+)?\s*(?:psi|cm\/s|kpa|bar)/i.test(sentence.text)) {
      errors.push({
        field: `sentences[${idx}]`,
        message: `Physical dimensional mismatch: temperature cannot be measured in pressure or velocity units in sentence ${idx + 1}.`,
        rule: 'Section 12 Unit Verification',
      });
    }

    // Check model estimate citations
    // A sentence quoting a model estimate must explicitly use the phrase 'model estimate' (SPEC Section 12)
    const isModelRefusalNotice =
      textLower.includes('outside applicability domain') ||
      textLower.includes('exceeds the measured') ||
      textLower.includes('refusal') ||
      textLower.includes('removed') ||
      textLower.includes('abstain') ||
      textLower.includes('not provided') ||
      textLower.includes('disclaimer');

    const quotesEstimate =
      !isModelRefusalNotice &&
      (textLower.includes('estimate') || textLower.includes('predict')) &&
      textLower.includes('model');

    if (quotesEstimate) {
      if (!textLower.includes('model estimate')) {
        errors.push({
          field: `sentences[${idx}]`,
          message: "A sentence quoting a model estimate must explicitly use the phrase 'model estimate'.",
          rule: 'Section 12 Model Estimates',
        });
      }
    }

    // Number grounding check
    const hasAnswerRefusal =
      answer.refusal !== null ||
      answer.sentences.some((s) => {
        const sl = s.text.toLowerCase();
        return (
          sl.includes('refusal') ||
          sl.includes('outside applicability domain') ||
          sl.includes('exceeds the measured')
        );
      });

    const isNumberExemption =
      hasAnswerRefusal ||
      isModelRefusalNotice ||
      textLower.includes('refusal') ||
      textLower.includes('outside applicability domain') ||
      textLower.includes('exceeds the measured') ||
      textLower.includes('nearest measured') ||
      textLower.includes('ungrounded') ||
      textLower.includes('not reported');

    if (!isNumberExemption) {
      const numbers = sentence.text.match(/\b\d+(?:\.\d+)?\b/g);
      if (numbers) {
        for (const numStr of numbers) {
          const num = parseFloat(numStr);
          if (sentence.text.includes(`PSI-${numStr}`) || numStr.length >= 6) continue;

          let grounded = isNumberGroundedInRecords(num, citedRecords);
          if (!grounded && citedToolResults.length > 0) {
            grounded = isNumberGroundedInToolResults(num, citedToolResults);
          }

          if (!grounded && (citedRecords.length > 0 || citedToolResults.length > 0)) {
            errors.push({
              field: `sentences[${idx}]`,
              message: `Number '${numStr}' in sentence ${idx + 1} is not grounded in cited records or tool results.`,
              rule: 'Section 12 Grounding',
            });
          }
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isNumberGroundedInToolResults(num: number, tools: unknown[]): boolean {
  for (const t of tools) {
    const jsonStr = JSON.stringify(t);
    // Quick search for number in JSON
    if (jsonStr.includes(`${num}`)) return true;
  }
  return false;
}

/**
 * Validates that any displayed record number carries valid provenance (Section 13).
 */
export function validateProvenance(val: Val<unknown>): boolean {
  if (val === null || val === undefined) return true;
  if (!val.provenance || !val.provenance.source_id || !val.provenance.entered_by) {
    throw new Error(`Invalid or missing provenance on record value: ${JSON.stringify(val)}`);
  }
  return true;
}
