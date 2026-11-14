const fs = require('fs');
const file = 'C:/Users/Nevan/.gemini/antigravity/brain/19fc75ae-315e-4146-8ef2-d4d88976c01c/scratch/.agents/teamwork/reviewer_m1_r2_1/handoff.md';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace('(eviewer_m1_r2_1)', '(`reviewer_m1_r2_1`)');
content = content.replace('-  burner_vs_cabin_o2: 2/2 passed', '- `burner_vs_cabin_o2`: 2/2 passed');
content = content.replace('-  erifier_catches: 2/2 passed', '- `verifier_catches`: 2/2 passed');
fs.writeFileSync(file, content, 'utf-8');
