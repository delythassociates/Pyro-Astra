import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('Workstream J & K: Readiness and Transit Path Verification', () => {
  const baseDir = process.cwd();
  const questionsPath = path.join(baseDir, 'analysis', 'questions.json');
  const readinessPath = path.join(baseDir, 'data', 'analysis', 'readiness.json');
  const pathDataPath = path.join(baseDir, 'data', 'analysis', 'path.json');
  const ntrsText = fs.readFileSync(path.join(baseDir, 'raw_real', 'NTRS-20210022143.txt'), 'utf8');
  const specText = fs.readFileSync(path.join(baseDir, 'SPEC.md'), 'utf8');

  it('verifies analysis/questions.json has 20 valid questions with verbatim quotes', () => {
    assert.ok(fs.existsSync(questionsPath), 'analysis/questions.json must exist');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    assert.strictEqual(questions.length, 20, 'Must have exactly 20 authored questions');

    questions.forEach((q: any) => {
      assert.ok(q.id && q.id.startsWith('Q'), `Question ID must be Qxx, got ${q.id}`);
      assert.ok(q.text && q.text.length > 10, 'Question text must be substantive');
      assert.ok(q.required_conditions, 'Required conditions must be defined');
      assert.ok(q.source && q.source.verbatim_quote, 'Must have verbatim quote');

      const targetText = q.source.file.includes('NTRS') ? ntrsText : specText;
      const quoteFound = targetText.includes(q.source.verbatim_quote);
      assert.ok(
        quoteFound,
        `Question ${q.id} quote "${q.source.verbatim_quote}" must be a verbatim substring in ${q.source.file}`
      );
    });
  });

  it('verifies data/analysis/readiness.json adheres to PREREGISTERED.md rules', () => {
    assert.ok(fs.existsSync(readinessPath), 'data/analysis/readiness.json must exist');
    const readiness = JSON.parse(fs.readFileSync(readinessPath, 'utf8'));

    // Check mandatory disclaimers and labels
    assert.strictEqual(readiness.label, 'defined by the PYRO-ASTRA team');
    assert.ok(
      readiness.disclaimer.includes('A documentation check, not a safety assessment'),
      'Must contain mandatory documentation check disclaimer'
    );

    // Check summary counts
    const counts = readiness.summary.counts;
    assert.strictEqual(
      counts.Documented + counts['Partially documented'] + counts['Not documented'] + counts['Not assessable'],
      20,
      'Total question verdicts must sum to 20'
    );

    // Rule 5: Partial gravity questions must be strictly 'Not assessable'
    const partialQuestions = readiness.questions.filter((q: any) =>
      q.required_conditions.gravity_regime.includes('partial')
    );
    assert.strictEqual(partialQuestions.length, 4, 'Must have 4 partial gravity questions');
    partialQuestions.forEach((pq: any) => {
      assert.strictEqual(
        pq.verdict,
        'Not assessable',
        `Partial gravity question ${pq.id} must be 'Not assessable'`
      );
      assert.ok(
        pq.reason.includes('No public partial-gravity combustion data'),
        `Partial gravity question ${pq.id} must cite challenge brief absence`
      );
    });

    // Check sensitivity report exists
    assert.ok(readiness.sensitivity_report, 'Must contain sensitivity report');
    assert.ok(readiness.sensitivity_report.baseline_counts);
    assert.ok(readiness.sensitivity_report.strict_counts);
    assert.ok(readiness.sensitivity_report.broad_counts);
  });

  it('verifies data/analysis/path.json transit calculation adheres to Section 8', () => {
    assert.ok(fs.existsSync(pathDataPath), 'data/analysis/path.json must exist');
    const pathData = JSON.parse(fs.readFileSync(pathDataPath, 'utf8'));

    // Mandatory labels
    assert.strictEqual(pathData.label, 'defined by the PYRO-ASTRA team');
    assert.strictEqual(pathData.mission_note, 'illustrative, not a mission profile.');
    assert.strictEqual(pathData.scientific_disclaimer, 'distance measures documentation distance, not hazard.');

    // Waypoints
    assert.strictEqual(pathData.waypoints.length, 3, 'Must have 3 waypoints');
    const [iss, lunar, suit] = pathData.waypoints;
    assert.strictEqual(iss.o2_pct, 21.0);
    assert.strictEqual(iss.pressure_psi, 14.7);
    assert.strictEqual(lunar.o2_pct, 34.0);
    assert.strictEqual(lunar.pressure_psi, 8.2);
    assert.strictEqual(suit.o2_pct, 100.0);
    assert.strictEqual(suit.pressure_psi, 4.3);

    // Steps
    assert.strictEqual(pathData.path_steps.length, 101, 'Must have 101 discretized steps (0 to 100)');
    const step0 = pathData.path_steps[0];
    assert.strictEqual(step0.evidence_distance, 0, 'ISS cabin must have 0 distance to Earth reference tests');

    const step100 = pathData.path_steps[100];
    assert.ok(step100.evidence_distance > 0.5, 'Spacesuit must have high documentation distance');

    pathData.path_steps.forEach((s: any) => {
      assert.ok(s.evidence_distance >= 0, 'Distance must be non-negative');
      assert.ok(s.nearest_investigation && s.nearest_investigation.id, 'Must record nearest investigation');
    });
  });
});
