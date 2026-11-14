const fs = require('fs');
const text = fs.readFileSync('raw_real/NTRS-20210022143.txt', 'utf8');

function findExact(phrase) {
  const normText = text.replace(/\r?\n+/g, ' ');
  const normPhrase = phrase.replace(/\s+/g, ' ');
  const idx = normText.indexOf(normPhrase);
  if (idx === -1) {
    console.log('NOT FOUND:', phrase);
    return null;
  }
  const pattern = normPhrase.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
  const match = new RegExp(pattern).exec(text);
  if (match) {
    console.log('MATCH:', JSON.stringify(match[0].replace(/\r?\n\s*/g, ' ')));
    return match[0];
  }
  return null;
}

const phrases = [
  'Fire emissions are affected by fuel type, heating conditions, gravity and exploration atmosphere',
  'material flammability limits are not expected to meet current requirements under elevated O2 (34%) and reduced pressure conditions (8.2 psi) planned for future lunar habitats',
  'Another fuel of immediate interest is the to-be-determined fabric that will compose crew clothing in future lunar missions',
  'clothing worn by crew members on the ISS (e.g., cotton jersey t-shirts) may not be suitable for future lunar missions',
  'Currently, researchers are working to identify a fire-resistant fabric for the crew to wear within the anticipated lunar habitat',
  'In lunar gravity, the dependence of smoke particle size on air flow remains unclear',
  'particle sizes must be characterized in reduced gravity under air velocity conditions relevant to that environment',
  'optimal location for a smoke detector within a lunar vehicle cabin must be evaluated through further research',
  'Experiments must also examine particle growth over transport',
  'shortcomings of traditional fire detection methods and establish optimal methods of detection for future spacecraft',
  'The ability to ensure spacecraft crew safety is crucial to the success of NASA',
  'Fire refers specifically to the heat and radiation produced from the reaction of a flammable material with oxygen',
  'period of fuel overheating prior to flame development since early fire detection is preferred',
  'characterized the properties of smoke particles from laptop LIB fires',
  'residence times near smoke sources since smoke plumes take longer to disperse due to low air velocities and a lack of buoyant flow',
  'alarms from suspended cabin and lunar dust'
];

phrases.forEach(p => findExact(p));
