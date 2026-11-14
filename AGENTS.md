<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PYRO-ASTRA Non-Negotiable Agent Rules (Section 2 of SPEC.md)

1. **Never invent, estimate, round up or interpolate a value.** If PSI does not state it, store null and show 'not reported'.
2. **Every stored value carries provenance (section 5).** The UI must refuse to render a number without it.
3. **Unit conversions are allowed only with an exact formula**, and the provenance note must say so (for example 1 psi = 6.894757 kPa).
4. **Oxygen in burner flow (for example CFI-G, up to 85%) is not cabin oxygen.** Use separate fields and separate labels everywhere.
5. **PSI has no partial-gravity data. Never show a partial-gravity prediction.** Show only 0g and 1g results, as bounds. LUCI and FM2 are expected to add data later. ACME E-FIELD Flames mimics partial gravity with an electric field: present it as an analog, never as partial gravity.
6. **Rockets and propellants are out of scope.** Ask ASTRA refuses them.
7. **Do not build: live PSI scraping, accounts, translations, rocket or propellant content, or a full 3D physics simulator.** Models, a live agent and rich visuals are allowed under sections 12 and 19 to 22. A model estimate is never stored as a record, never cited as PSI, and always renders through the Estimate component (section 20).
8. **No NASA logos, insignia or NASA-branded imagery.** Credit NASA PSI in text only.
9. **Label all AI-generated text in the UI.**
10. **Do not copy or fetch data, code or text from other teams' repositories.** The human downloads PSI files into /raw. You only read /raw.
11. **Do not make a git repo until requested by user.** Once git is enabled, commit after every milestone and tag a passing build last-known-good.
