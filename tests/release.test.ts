import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

describe('Workstream N: Release Artifacts and Download Center', () => {
  const releaseDir = path.resolve(process.cwd(), 'release');
  const docsDir = path.resolve(process.cwd(), 'docs');

  it('verifies docs/DATACARD.md exists and contains the AWS Registry license statement', () => {
    const dataCardPath = path.join(docsDir, 'DATACARD.md');
    assert.ok(fs.existsSync(dataCardPath), 'docs/DATACARD.md must exist');
    const content = fs.readFileSync(dataCardPath, 'utf-8');
    assert.match(
      content,
      /There are no restrictions on the use of this data/i,
      'DATACARD.md must contain the AWS Open Data license statement'
    );
    assert.match(content, /https:\/\/registry\.opendata\.aws\/nasa-psi\//i, 'DATACARD.md must cite the AWS PSI registry URL');
    assert.match(content, /Known Gaps/i, 'DATACARD.md must explain known gaps');
    assert.match(content, /What is NOT Included and Why/i, 'DATACARD.md must explain exclusions');
  });

  it('verifies all required files exist in release/', () => {
    const requiredFiles = [
      'investigations.csv',
      'extractions.json',
      'table_5_1_bass2.csv',
      'table_5_1.csv',
      'modeling_ready_runs.csv',
      'modeling_ready_runs.json',
      'availability.json',
      'field_dictionary.json',
      'DATASET_CARD.md',
      'DATACARD.md',
      'manifest.sha256',
      'manifest.json',
      'LICENSE.txt',
    ];

    for (const f of requiredFiles) {
      const p = path.join(releaseDir, f);
      assert.ok(fs.existsSync(p), `Missing required release artifact: ${f}`);
    }
  });

  it('verifies extractions.json contains quotes, key paths, and no ungrounded data', () => {
    const p = path.join(releaseDir, 'extractions.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    assert.ok(data.investigations, 'extractions.json must contain investigations map');
    
    // Check PSI-102, PSI-25, PSI-69
    const psi102 = data.investigations['PSI-102'];
    assert.ok(psi102, 'PSI-102 must exist in extractions');
    assert.ok(psi102.fields.length > 0, 'PSI-102 must have extracted fields');
    for (const f of psi102.fields) {
      assert.ok(f.field, 'Field name must be present');
      assert.ok(f.source_file, 'source_file must be present');
      assert.ok(f.key_path, 'key_path must be present');
      assert.ok(f.exact_quote, 'exact_quote must be present');
    }
  });

  it('verifies availability.json covers 18 investigations with zero partial-gravity', () => {
    const p = path.join(releaseDir, 'availability.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    assert.strictEqual(data.summary.total_investigations, 18);
    assert.strictEqual(data.summary.deep_investigations, 8);
    assert.strictEqual(data.summary.catalog_investigations, 10);
    assert.strictEqual(data.summary.partial_gravity_data_count, 0);

    for (const inv of data.investigations) {
      assert.strictEqual(inv.partial_gravity_available, false);
      assert.ok(inv.doi, `Investigation ${inv.id} must have a DOI`);
      assert.ok(inv.psi_repository_url, `Investigation ${inv.id} must have a PSI URL`);
    }
  });

  it('verifies table_5_1_bass2.csv contains all 20 tests from NASA/TM-20210011385', () => {
    const p = path.join(releaseDir, 'table_5_1_bass2.csv');
    const lines = fs.readFileSync(p, 'utf-8').trim().split('\n');
    assert.strictEqual(lines.length, 21, 'Table 5.1 must have 1 header row + 20 data rows');
    assert.ok(lines[0].includes('test_no'), 'Header must contain test_no');
    assert.ok(lines[1].startsWith('M1,'), 'Row 1 must be test M1');
    assert.ok(lines[20].startsWith('M20,'), 'Row 20 must be test M20');
  });

  it('verifies release/manifest.sha256 checksums match physical files', () => {
    const manifestPath = path.join(releaseDir, 'manifest.sha256');
    const lines = fs.readFileSync(manifestPath, 'utf-8').trim().split('\n');
    assert.ok(lines.length >= 7, 'manifest.sha256 must index all release artifacts');

    for (const line of lines) {
      const [expectedHash, fileName] = line.split(/\s+/);
      const filePath = path.join(releaseDir, fileName);
      assert.ok(fs.existsSync(filePath), `File in manifest does not exist: ${fileName}`);
      const fileBytes = fs.readFileSync(filePath);
      const actualHash = crypto.createHash('sha256').update(fileBytes).digest('hex');
      assert.strictEqual(actualHash, expectedHash, `Hash mismatch for ${fileName}`);
    }
  });

  it('verifies modeling_ready_runs.csv and modeling_ready_runs.json enforce Rule G1 (nulls, row-level provenance, oxygen separation, zero partial-g)', () => {
    const jsonPath = path.join(releaseDir, 'modeling_ready_runs.json');
    const csvPath = path.join(releaseDir, 'modeling_ready_runs.csv');
    assert.ok(fs.existsSync(jsonPath), 'modeling_ready_runs.json must exist');
    assert.ok(fs.existsSync(csvPath), 'modeling_ready_runs.csv must exist');

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    assert.strictEqual(data.row_count, 1815, 'Total runs must be exactly 1815');
    assert.strictEqual(data.runs.length, 1815, 'Runs array length must be 1815');

    const csvContent = fs.readFileSync(csvPath, 'utf-8').trim();
    const csvLines = csvContent.split('\n');
    assert.strictEqual(csvLines.length, 1816, 'CSV must have 1 header line + 1815 data rows');

    let cfigCount = 0;
    let efieldCount = 0;
    let suspectCount = 0;

    for (const r of data.runs) {
      // Rule G1: Provenance on every row
      assert.ok(r.provenance_file, `Row ${r.run_id} missing provenance_file`);
      assert.strictEqual(r.provenance_file_sha256?.length, 64, `Row ${r.run_id} invalid sha256 hash`);
      assert.ok(r.provenance_row_id, `Row ${r.run_id} missing provenance_row_id`);
      assert.ok(r.provenance_column, `Row ${r.run_id} missing provenance_column`);
      assert.ok(r.provenance_note, `Row ${r.run_id} missing provenance_note`);

      // Rule G1: Zero partial-gravity
      assert.ok(!r.gravity_regime.includes('partial'), `Rule 5 violation: row ${r.run_id} contains partial gravity`);
      assert.ok(
        ['microgravity', '1g', 'electric-field-analog'].includes(r.gravity_regime),
        `Invalid gravity regime: ${r.gravity_regime}`
      );

      if (r.investigation_id === 'PSI-22') {
        assert.strictEqual(r.gravity_regime, 'electric-field-analog');
        efieldCount++;
      }

      // Rule G1 & Rule 4: Oxygen separation
      if (r.investigation_id === 'PSI-159') {
        assert.strictEqual(r.cabin_o2_pct, null, 'CFI-G cabin_o2_pct must be strictly null (Rule 4)');
        assert.ok(r.burner_flow_o2_pct !== null, 'CFI-G burner_flow_o2_pct must be populated');
        cfigCount++;
      }

      if (r.is_suspect) {
        suspectCount++;
        assert.ok(r.suspect_reason, `Suspect row ${r.run_id} missing suspect_reason`);
      }
    }

    assert.strictEqual(efieldCount, 32, 'PSI-22 must have 32 rows tagged electric-field-analog');
    assert.strictEqual(cfigCount, 179, 'PSI-159 must have 179 rows with isolated burner O2');
    assert.strictEqual(suspectCount, 10, 'Total flagged suspect rows must be exactly 10 (2 BASS-II + 8 Spice)');

    // Field dictionary checks
    const dictPath = path.join(releaseDir, 'field_dictionary.json');
    const dict = JSON.parse(fs.readFileSync(dictPath, 'utf-8'));
    assert.strictEqual(dict.fields.length, 69, 'Field dictionary must define 69 total fields');
    assert.strictEqual(dict.investigation_fields.length, 25, 'Field dictionary must define 25 investigation fields');
    assert.strictEqual(dict.modeling_run_fields.length, 44, 'Field dictionary must define 44 modeling run fields');
  });

  it('verifies public/release/ contains static mirrors for client download', () => {
    const publicReleaseDir = path.resolve(process.cwd(), 'public', 'release');
    assert.ok(fs.existsSync(publicReleaseDir), 'public/release/ must exist');
    const files = fs.readdirSync(publicReleaseDir);
    assert.ok(files.includes('investigations.csv'), 'public/release must include investigations.csv');
    assert.ok(files.includes('extractions.json'), 'public/release must include extractions.json');
    assert.ok(files.includes('manifest.sha256'), 'public/release must include manifest.sha256');
    assert.ok(files.includes('modeling_ready_runs.csv'), 'public/release must include modeling_ready_runs.csv');
    assert.ok(files.includes('modeling_ready_runs.json'), 'public/release must include modeling_ready_runs.json');
    assert.ok(files.includes('DATASET_CARD.md'), 'public/release must include DATASET_CARD.md');
  });
});
