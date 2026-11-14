const fs = require('fs');
const file = 'C:/Users/Nevan/.gemini/antigravity/brain/19fc75ae-315e-4146-8ef2-d4d88976c01c/scratch/.agents/teamwork/reviewer_m1_r2_1/handoff.md';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace('(eviewer_m1_r2_1)', '(`reviewer_m1_r2_1`)');
fs.writeFileSync(file, content, 'utf-8');
