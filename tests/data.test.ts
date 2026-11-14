import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { validateInvestigation, validateDigest, validateAgentAnswer } from '../src/lib/validate';
import type { Investigation } from '../data/schema';

describe('Data Files Verification', () => {
  const root = path.resolve(__dirname, '..');
  const invPath = path.join(root, 'data', 'investigations.json');
  const linksPath = path.join(root, 'data', 'links.json');
  const boundsPath = path.join(root, 'data', 'bounds.json');
  const digestsPath = path.join(root, 'data', 'digests.json');
  const demoPath = path.join(root, 'data', 'demo-answers.json');

  it('validates all records in data/investigations.json', () => {
    const raw = fs.readFileSync(invPath, 'utf-8');
    const records: Investigation[] = JSON.parse(raw);

    assert.strictEqual(records.length, 18, 'Expected 18 investigations (8 deep + 10 catalog)');

    const deepRecords = records.filter((r) => r.depth === 'deep');
    assert.strictEqual(deepRecords.length, 8, 'Expected exactly 8 deep records');

    for (const rec of records) {
      const result = validateInvestigation(rec, { isRelease: false });
      assert.strictEqual(
        result.valid,
        true,
        `Investigation ${rec.id} failed validation: ${result.errors.join(', ')}`
      );

      // Verify no partial gravity
      for (const gr of rec.gravity_regimes) {
        assert.ok(
          gr === 'microgravity' || gr === '1g' || gr === 'electric-field-analog',
          `Forbidden gravity regime ${gr} in ${rec.id}`
        );
      }

      // Verify CFI-G rule 4
      if (rec.id === 'PSI-159') {
        assert.strictEqual(rec.cabin_o2_pct, null, 'CFI-G cabin_o2_pct must be null');
      }
    }
  });

  it('validates data/links.json contains no TODOs and has required sections', () => {
    const raw = fs.readFileSync(linksPath, 'utf-8');
    assert.ok(!raw.includes('TODO'), 'links.json must not contain TODOs');
    const links = JSON.parse(raw);
    assert.ok(Array.isArray(links.earth_applications), 'earth_applications must be an array');
    assert.ok(links.earth_applications.length >= 3, 'Must have at least 3 earth applications');
    assert.ok(links.context_links, 'context_links must exist');
  });

  it('validates data/bounds.json has valid structure and required note if pairs exist', () => {
    const raw = fs.readFileSync(boundsPath, 'utf-8');
    const bounds = JSON.parse(raw);
    assert.ok(Array.isArray(bounds), 'bounds must be an array');
    for (const b of bounds) {
      assert.ok(b.microgravity_outcome, 'microgravity_outcome must exist');
      assert.ok(b.normal_gravity_outcome, 'normal_gravity_outcome must exist');
      assert.ok(
        b.note.includes('bounds, not predictions; the direction varies by material'),
        'Bounds note must match SPEC Section 9 requirement'
      );
    }
  });

  it('validates data/digests.json structure and chips', () => {
    const raw = fs.readFileSync(digestsPath, 'utf-8');
    const digestsData = JSON.parse(raw);
    assert.strictEqual(digestsData.label, 'AI-drafted from NASA metadata; not independently reviewed');
    assert.ok(digestsData.digests.length >= 8, 'Expected 8 deep digests');
  });

  it('validates data/demo-answers.json contains 6 answers with compliant refusals', () => {
    const raw = fs.readFileSync(demoPath, 'utf-8');
    const answers = JSON.parse(raw);
    assert.strictEqual(answers.length, 6, 'Expected exactly 6 cached demo answers');

    let refusals = 0;
    for (const a of answers) {
      assert.ok(a.query, 'Query must be non-empty');
      if (a.refusal) {
        refusals++;
      }
    }
    assert.ok(refusals >= 2, 'Expected at least 2 refusals (partial gravity and rockets)');
  });

  it('validates CFI-G (PSI-159) burner flow O2 and challenge brief provenance (Spec 1)', () => {
    const raw = fs.readFileSync(invPath, 'utf-8');
    const records: Investigation[] = JSON.parse(raw);
    const cfig = records.find((r) => r.id === 'PSI-159');
    assert.ok(cfig, 'PSI-159 (CFI-G) must exist');

    // Rule 4 & Spec 1: cabin_o2_pct is null
    assert.strictEqual(cfig.cabin_o2_pct, null, 'CFI-G cabin_o2_pct must be null');

    // Spec 1: burner_flow_o2_pct min is null, max is 85
    assert.ok(cfig.burner_flow_o2_pct, 'CFI-G burner_flow_o2_pct must exist');
    assert.strictEqual(cfig.burner_flow_o2_pct.value.min, null, 'CFI-G burner O2 min must be null');
    assert.strictEqual(cfig.burner_flow_o2_pct.value.max, 85, 'CFI-G burner O2 max must be 85');

    // Spec 1: provenance note and file
    assert.strictEqual(
      cfig.burner_flow_o2_pct.provenance.file,
      'NASA Space Apps Challenge Brief: Flame in Freefall',
      'CFI-G burner O2 file citation must match challenge brief'
    );
    assert.strictEqual(
      cfig.burner_flow_o2_pct.provenance.note,
      'source: challenge brief',
      'CFI-G burner O2 note must be "source: challenge brief"'
    );
  });

  it('validates PSI-68 (FLEX-2) pressure and cabin O2 values and exact key paths (Spec 2)', () => {
    const raw = fs.readFileSync(invPath, 'utf-8');
    const records = JSON.parse(raw);
    const flex2 = records[7];

    assert.strictEqual(flex2.id, 'PSI-68', 'investigations[7] must be PSI-68 (FLEX-2)');

    // Verify exact key paths: investigations[7].pressure_psi.value
    assert.ok(flex2.pressure_psi, 'investigations[7].pressure_psi must exist');
    assert.strictEqual(flex2.pressure_psi.value.min, 7.35, 'Pressure min must be 7.35 psi');
    assert.strictEqual(flex2.pressure_psi.value.max, 44.09, 'Pressure max must be 44.09 psi');
    assert.strictEqual(flex2.pressure_psi.unit, 'psi', 'Pressure unit must be psi');
    assert.ok(
      flex2.pressure_psi.provenance.note.includes('1 atm = 14.6959 psi'),
      'Pressure note must contain exact conversion formula'
    );

    // Verify exact key paths: investigations[7].cabin_o2_pct.value
    assert.ok(flex2.cabin_o2_pct, 'investigations[7].cabin_o2_pct must exist');
    assert.strictEqual(flex2.cabin_o2_pct.value.min, 10, 'Cabin O2 min must be 10%');
    assert.strictEqual(flex2.cabin_o2_pct.value.max, 40, 'Cabin O2 max must be 40%');
    assert.strictEqual(flex2.cabin_o2_pct.unit, '% (vol)', 'Cabin O2 unit must be % (vol)');
  });

  it('validates Table 5.1 phrasing in investigations.json (Spec 4)', () => {
    const raw = fs.readFileSync(invPath, 'utf-8');
    const records: Investigation[] = JSON.parse(raw);
    const bass2 = records.find((r) => r.id === 'PSI-25');
    assert.ok(bass2, 'PSI-25 (BASS-II) must exist');
    assert.ok(bass2.n_tests, 'PSI-25 n_tests must exist');
    assert.strictEqual(bass2.n_tests.value, 20, 'PSI-25 n_tests value must be 20');
    assert.strictEqual(
      bass2.n_tests.provenance.note,
      '20 flat-PMMA tests reported in Table 5.1',
      'PSI-25 n_tests note must strictly match Table 5.1 phrasing'
    );
  });

  it('validates authentic experimental_table CSVs and zero synthetic rows created (Spec 7)', () => {
    const rawRealDir = path.join(root, 'raw_real');
    if (fs.existsSync(rawRealDir)) {
      const entries = fs.readdirSync(rawRealDir);
      for (const entry of entries) {
        const fullPath = path.join(rawRealDir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          const expTableDir = path.join(fullPath, 'experimental_table');
          if (fs.existsSync(expTableDir)) {
            const files = fs.readdirSync(expTableDir);
            assert.ok(
              files.every((f) => f.endsWith('.csv') || f.endsWith('.sha256')),
              `All files in ${entry}/experimental_table must be CSVs or checksums`
            );
          }
        }
      }
    }

    // Verify bounds.json is empty array (0 synthetic rows created)
    const boundsRaw = fs.readFileSync(boundsPath, 'utf-8');
    const bounds = JSON.parse(boundsRaw);
    assert.strictEqual(bounds.length, 0, 'data/bounds.json must be empty (0 synthetic rows created)');

    // Verify investigations record count is strictly 18 (8 deep, 10 catalog; 0 synthetic rows created)
    const raw = fs.readFileSync(invPath, 'utf-8');
    const records: Investigation[] = JSON.parse(raw);
    assert.strictEqual(records.length, 18, 'No synthetic investigations may be added');
  });
});
