# PYRO-ASTRA Official Release Manifest

- **Project**: PYRO-ASTRA (NASA Space Apps Challenge 2026: Flame in Freefall)
- **Public URL**: `https://pyro-astra.vercel.app`
- **Architecture**: Next.js 16 (Turbopack), React 19, TypeScript, Tailwind CSS 4, D3.js
- **Release Directory**: `release/` (mirrored in `public/release/` for direct HTTPS client downloads)
- **Deployment Status**: Feature frozen post-Gate 3 audit; zero ungrounded values; zero partial-gravity predictions.

## Release Artifacts Checksums (SHA-256)

```text
6ef19814a75cc5796045e1ae33108819ade69e4550919cf96af58d825e614004  investigations.csv
961fcfea65682ccafb03f440dcae3db06ecfbf71933bcd4442f39a0e4e66b80b  extractions.json
fdc489eab6fe862bf9924ce2d1cb6f3a405e9e72d034818f7c8cb9f22bec7fe2  table_5_1_bass2.csv
fdc489eab6fe862bf9924ce2d1cb6f3a405e9e72d034818f7c8cb9f22bec7fe2  table_5_1.csv
5c9ecd92232a2e6433c04c57a9adfeebae24e0bd754d240fd906803674f9cec2  availability.json
e600d94760b738b9df9076d290467f1e4f4a8463a3efc1833db362567c2f5895  field_dictionary.json
c72ca0111c96a7281ed06c33ae9521532e729728d0d7656de8a4b6739642165c  DATACARD.md
2e0eedec6ce3eb037edb6036fcd0b6e5fb4302d79aa08cea9e0f62cccda75163  LICENSE.txt
```

## Experimental Table Ingestions (Authentic NASA Flight Data)

| PSI-ID | Investigation | Experimental Table Source CSV | SHA-256 Checksum | Ingested Rows |
|:---|:---|:---|:---|:---:|
| **PSI-25** | BASS-II | `raw_real/PSI-25/experimental_table/PSI-25_Experimental_table_BASS-II.csv` | `db4f5fcc2416fd2150e58c2d73d761090106271a640ecd189297eb7c3cf2951f` | 129 (127 non-suspect) |
| **PSI-68** | FLEX-2 | `raw_real/PSI-68/experimental_table/PSI-68_Experimental table_Flex2.csv` | `cc57ad1bd9977aa13e7ac6c3aa618303012686e232b36c052c6a9f1a74e5f528` | 8 |
| **PSI-69** | FLEX | `raw_real/PSI-69/experimental_table/PSI-69_Experimental table_FLEX.csv` | `37c88ce8ae9391b7544ff630a45ce87543d04d317cdbfbed104fe7d5c27e1b96` | 274 |
| **PSI-99** | SAFFIRE-II | `raw_real/PSI-99/experimental_table/PSI-99_Experimental table_SAFFIRE-2.csv` | `3c24390b9ef86f3d1ebaab911a1a3cc95a8759aebf42062371370e6d4b31b8ac` | 15 |
| **PSI-159** | CFI-G | `raw_real/PSI-159/experimental_table/PSI-159_Experimental table_CFI-G_Normal Flames (1).csv` | `d95a621c3fbd27d204dd32ed29fa17d68f2b779d6a523cde8479ed7ebaa5251a` | 179 |
| **PSI-26** | BASS | `raw_real/PSI-26/experimental_table/PSI-26_Experimental table_BASS.csv` | `ccfc3c54d948b64a1c5d2596a63c7c8019e51df0c91a1d62f039f48fa28c300f` | 122 |
| **PSI-101** | SAME-R | `raw_real/PSI-101/experimental_table/PSI-101_Experimental table_SAME-R.csv` | `87164b7dc9168a4273c159f7a9f23699afbd06ad97b77974377e79b9bf8a3bef` | 109 |
| **PSI-102** | SAME | `raw_real/PSI-102/experimental_table/PSI-102_Experimental table_SAME.csv` | `268d1e121d2f211b124407dd32b9475617bd269ede2c2d1749441da3e949a2af` | 8 |

