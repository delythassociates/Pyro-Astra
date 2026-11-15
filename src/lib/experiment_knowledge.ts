import { AgentAnswerSentence } from './validate';

export interface ExperimentDetail {
  id: string;
  acronym: string;
  name: string;
  discipline: 'solids' | 'droplets' | 'gases' | 'smoke';
  facility: string;
  fuelsSummary: string;
  nTests: number | string;
  conditionsSummary: string;
  scientificDiscovery: string;
  sentences: AgentAnswerSentence[];
  toolContext: Record<string, unknown>;
}

export const PSI_EXPERIMENT_DETAILS: Record<string, ExperimentDetail> = {
  'PSI-25': {
    id: 'PSI-25',
    acronym: 'BASS-II',
    name: 'Burning and Suppression of Solids - II',
    discipline: 'solids',
    facility: 'Microgravity Science Glovebox (MSG) Flow Duct',
    fuelsSummary: 'PMMA rods, PMMA films, PMMA slabs, SIBAL fabric, Nomex III fabric, Japan Wax candle',
    nTests: 20,
    conditionsSummary: 'Initial O2 13.6% to 22.2%, forced airflow 2.0 to 21.0 cm/s; chamber pressure not reported (null).',
    scientificDiscovery: 'Discovered peak solid flammability in low-velocity forced flows (2 to 10 cm/s) where oxygen is replenished without excessive convective thermal cooling.',
    sentences: [
      {
        text: 'BASS-II (PSI-25) investigated solid fuel flammability and extinction limits in the Microgravity Science Glovebox (MSG) Flow Duct across 20 reported tests in Table 5.1.',
        evidence: [{ record_id: 'PSI-25', field: 'hardware' }, { record_id: 'PSI-25', field: 'n_tests' }],
      },
      {
        text: 'Tested fuels include PMMA rods, PMMA films, PMMA slabs, SIBAL fabric, and Nomex III fabric under opposed and concurrent flows.',
        evidence: [{ record_id: 'PSI-25', field: 'fuels' }],
      },
      {
        text: 'Flight conditions recorded initial oxygen at 13.6% to 22.2% and airflow velocities of 2.0 to 21.0 cm/s; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-25', field: 'cabin_o2_pct' }, { record_id: 'PSI-25', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-25', field: 'pressure_psi' }],
      },
      {
        text: 'Results revealed that peak solid flammability occurs at low-velocity forced flows, where oxygen transport sustains combustion without excessive convective cooling; chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-25', field: 'objectives' }, { record_id: 'PSI-25', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-25',
      acronym: 'BASS-II',
      name: 'Burning and Suppression of Solids - II',
      discipline: 'Solid Fuel Flammability & Extinction',
      hardware: 'Microgravity Science Glovebox (MSG) Flow Duct',
      fuels: ['PMMA rods', 'PMMA films', 'PMMA slabs', 'SIBAL', 'Nomex III', 'Japan Wax candle'],
      cabin_o2_range: '13.6% to 22.2%',
      airflow_range_cm_s: '2.0 to 21.0 cm/s',
      pressure_psi: null,
      pressure_status: 'not reported',
      n_tests: 129,
      table_5_1_tests: 20,
    },
  },

  'PSI-26': {
    id: 'PSI-26',
    acronym: 'BASS',
    name: 'Burning and Suppression of Solids',
    discipline: 'solids',
    facility: 'Microgravity Science Glovebox (MSG) Flow Duct',
    fuelsSummary: 'PMMA acrylic slabs, cotton fiberglass fabric, Nomex',
    nTests: 122,
    conditionsSummary: 'Forced airflow up to 40 cm/s; chamber pressure and cabin oxygen not reported (null).',
    scientificDiscovery: 'Mapped solid fuel extinction boundaries under nitrogen dilution and proved that slow forced airflow sustains steady solid combustion in microgravity.',
    sentences: [
      {
        text: 'BASS (PSI-26) investigated solid material extinction and burning limits in the Microgravity Science Glovebox (MSG) Flow Duct under forced air circulation; chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-26', field: 'hardware' }, { record_id: 'PSI-26', field: 'pressure_psi' }],
      },
      {
        text: 'Tested solid materials include PMMA acrylic slabs, cotton fiberglass fabric, and Nomex under varying nitrogen suppression levels.',
        evidence: [{ record_id: 'PSI-26', field: 'fuels' }],
      },
      {
        text: 'Forced airflow reached up to 40 cm/s, while chamber pressure and cabin oxygen were not reported.',
        evidence: [{ record_id: 'PSI-26', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-26', field: 'pressure_psi' }, { record_id: 'PSI-26', field: 'cabin_o2_pct' }],
      },
      {
        text: 'The experiment mapped extinction boundary limits under nitrogen dilution, establishing that slow forced convective flows maintain steady flame spread in microgravity; chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-26', field: 'objectives' }, { record_id: 'PSI-26', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-26',
      acronym: 'BASS',
      name: 'Burning and Suppression of Solids',
      discipline: 'Solid Fuel Flammability & Extinction',
      hardware: 'Microgravity Science Glovebox (MSG) Flow Duct',
      fuels: ['PMMA (acrylic)', 'Cotton fiberglass fabric', 'Nomex'],
      max_airflow_cm_s: 40.0,
      pressure_psi: null,
      pressure_status: 'not reported',
      total_flight_burns: 122,
    },
  },

  'PSI-98': {
    id: 'PSI-98',
    acronym: 'SAFFIRE-I',
    name: 'Spacecraft Fire Safety Experiment - I',
    discipline: 'solids',
    facility: 'Saffire Flow Duct in Cygnus Cargo Module (OA-6)',
    fuelsSummary: 'SIBAL cotton-fiberglass blend fabric (0.4 m x 1.0 m sheet)',
    nTests: 4,
    conditionsSummary: 'Forced airflow velocity 20.0 cm/s, ignition power 182.0 W, burn times 70 to 420 s; chamber pressure not reported (null).',
    scientificDiscovery: 'First large-scale spacecraft fire safety test in an uncrewed cargo vehicle; proved large fabric sheets exhibit flame propagation substantially exceeding 1g ratings.',
    sentences: [
      {
        text: 'SAFFIRE-I (PSI-98) conducted the first large-scale microgravity spacecraft fire safety burns inside an uncrewed Cygnus cargo vehicle flow duct; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-98', field: 'hardware' }, { record_id: 'PSI-98', field: 'pressure_psi' }],
      },
      {
        text: 'The sample material tested was a 0.4 m by 1.0 m sheet of SIBAL cotton-fiberglass blend fabric; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-98', field: 'fuels' }, { record_id: 'PSI-25', field: 'fuels' }, { record_id: 'PSI-98', field: 'pressure_psi' }],
      },
      {
        text: 'The burn was executed at a forced airflow velocity of 20.0 cm/s under cabin air, while chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-98', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-98', field: 'pressure_psi' }],
      },
      {
        text: 'SAFFIRE-I demonstrated that large-scale solid fabrics exhibit forward flame propagation and preheating dynamics substantially exceeding bench-scale predictions; chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-98', field: 'objectives' }, { record_id: 'PSI-98', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-98',
      acronym: 'SAFFIRE-I',
      name: 'Spacecraft Fire Safety Experiment - I',
      discipline: 'Solid Fuel Flammability & Extinction',
      hardware: 'Saffire Flow Duct in Cygnus Cargo Module (OA-6)',
      fuel: 'SIBAL fabric (0.4m x 1.0m sheet)',
      airflow_velocity_cm_s: 20.0,
      ignition_power_w: 182.0,
      flight_burn_rows: 4,
      pressure_status: 'not reported',
    },
  },

  'PSI-99': {
    id: 'PSI-99',
    acronym: 'SAFFIRE-II',
    name: 'Spacecraft Fire Safety Experiment - II',
    discipline: 'solids',
    facility: 'Saffire Flow Duct in Cygnus Cargo Module (OA-5)',
    fuelsSummary: 'SIBAL fabric, PMMA acrylic, Nomex, Silicone sheet across 9 sample configurations',
    nTests: 15,
    conditionsSummary: 'Forced airflow velocities 20.0 to 30.0 cm/s; chamber pressure not reported (null).',
    scientificDiscovery: 'Direct 0g and 1g companion burns demonstrated that normal gravity and microgravity act as physical bounds, not linear predictions; material flammability rankings reversed.',
    sentences: [
      {
        text: 'SAFFIRE-II (PSI-99) investigated mixed material flammability in the Saffire Flow Duct inside the Cygnus cargo module across 15 flight tests.',
        evidence: [{ record_id: 'PSI-99', field: 'hardware' }, { record_id: 'PSI-99', field: 'n_tests' }],
      },
      {
        text: 'Tested materials include SIBAL fabric, PMMA acrylic, Nomex, and Silicone sheet across multiple sample configurations; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-99', field: 'fuels' }, { record_id: 'PSI-99', field: 'pressure_psi' }],
      },
      {
        text: 'Forced airflow was maintained at nominal speeds of 20.0 to 30.0 cm/s; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-99', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-99', field: 'pressure_psi' }],
      },
      {
        text: 'Direct microgravity and 1g companion burns demonstrated that 0g and 1g results act as physical bounds, not linear predictions, as flammability rankings reversed between environments.',
        evidence: [{ record_id: 'PSI-99', field: 'objectives' }],
      },
    ],
    toolContext: {
      id: 'PSI-99',
      acronym: 'SAFFIRE-II',
      name: 'Spacecraft Fire Safety Experiment - II',
      discipline: 'Solid Fuel Flammability & Extinction',
      hardware: 'Saffire Flow Duct in Cygnus Cargo Module (OA-5)',
      fuels: ['SIBAL fabric', 'PMMA (acrylic)', 'Nomex', 'Silicone sheet'],
      nominal_airflows_cm_s: [20.0, 30.0],
      total_card_burns: 15,
      pressure_status: 'not reported',
    },
  },

  'PSI-100': {
    id: 'PSI-100',
    acronym: 'SAFFIRE-III',
    name: 'Spacecraft Fire Safety Experiment - III',
    discipline: 'solids',
    facility: 'Saffire Flow Duct in Cygnus Cargo Module',
    fuelsSummary: 'Large-scale SIBAL cotton-fiberglass fabric (0.4 m x 1.0 m)',
    nTests: 2,
    conditionsSummary: 'Forced airflow velocity 30.0 cm/s; chamber pressure not reported (null).',
    scientificDiscovery: 'Investigated flame spread acceleration and plume aerodynamics at elevated convective velocity (30 cm/s) in microgravity prior to cargo vehicle reentry.',
    sentences: [
      {
        text: 'SAFFIRE-III (PSI-100) evaluated large-scale fabric flammability inside the Cygnus vehicle flow duct under operational microgravity airflow; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-100', field: 'hardware' }, { record_id: 'PSI-100', field: 'pressure_psi' }],
      },
      {
        text: 'The investigation burned large-format SIBAL cotton-fiberglass fabric samples under concurrent flow; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-100', field: 'fuels' }, { record_id: 'PSI-25', field: 'fuels' }, { record_id: 'PSI-100', field: 'pressure_psi' }],
      },
      {
        text: 'Tests were conducted at an elevated forced flow velocity of 30.0 cm/s to observe high-convection flame spread; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-100', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-100', field: 'pressure_psi' }],
      },
      {
        text: 'Observations provided empirical validation for fire growth models in post-mission spacecraft cargo modules prior to atmospheric reentry; chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-100', field: 'objectives' }, { record_id: 'PSI-100', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-100',
      acronym: 'SAFFIRE-III',
      name: 'Spacecraft Fire Safety Experiment - III',
      discipline: 'Solid Fuel Flammability & Extinction',
      hardware: 'Saffire Flow Duct in Cygnus Cargo Module',
      fuel: 'SIBAL fabric (0.4m x 1.0m sheet)',
      airflow_velocity_cm_s: 30.0,
      total_runs: 2,
      pressure_status: 'not reported',
    },
  },

  'PSI-69': {
    id: 'PSI-69',
    acronym: 'FLEX',
    name: 'Flame Extinction Experiment',
    discipline: 'droplets',
    facility: 'Multi-user Droplet Combustion Apparatus (MDCA) in the Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Isolated droplets of n-Heptane, Methanol, Ethanol, and n-Decane (initial diameters 1.2 to 5.0 mm)',
    nTests: 271,
    conditionsSummary: 'Cabin O2 12.0% to 34.0%, chamber pressures up to 44.86 psi (0.5 to 3.0 atm), quiescent 0.0 cm/s airflow.',
    scientificDiscovery: 'Discovered sustained low-temperature cool flames, continuing chemical oxidation at 600 to 800 K after apparent visible hot-flame radiative extinction.',
    sentences: [
      {
        text: 'FLEX (PSI-69) examined liquid droplet combustion in the Multi-user Droplet Combustion Apparatus (MDCA) in the CIR across 271 flight tests.',
        evidence: [{ record_id: 'PSI-69', field: 'hardware' }, { record_id: 'PSI-69', field: 'n_tests' }],
      },
      {
        text: 'Fuels tested include isolated droplets of n-Heptane, Methanol, Ethanol, and n-Decane with initial diameters of 1.2 to 5.0 mm; chamber pressure was not reported for some runs.',
        evidence: [{ record_id: 'PSI-69', field: 'fuels' }, { record_id: 'PSI-69', field: 'pressure_psi' }],
      },
      {
        text: 'Tested environments spanned cabin oxygen of 12.0% to 34.0% and chamber pressures up to 44.86 psi in quiescent microgravity with 0.0 cm/s airflow.',
        evidence: [{ record_id: 'PSI-69', field: 'cabin_o2_pct' }, { record_id: 'PSI-69', field: 'pressure_psi' }, { record_id: 'PSI-69', field: 'airflow_speed_cm_s' }],
      },
      {
        text: 'FLEX made the breakthrough discovery of sustained low-temperature cool flames, continuing chemical oxidation at 600 to 800 K after apparent visible hot-flame radiative extinction; chamber pressure is not reported for cool flame transitions.',
        evidence: [{ record_id: 'PSI-69', field: 'objectives' }, { record_id: 'PSI-69', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-69',
      acronym: 'FLEX',
      name: 'Flame Extinction Experiment',
      discipline: 'Liquid Droplet Combustion & Cool Flames',
      hardware: 'Multi-user Droplet Combustion Apparatus (MDCA) in CIR',
      fuels: ['n-Heptane', 'Methanol', 'Ethanol', 'n-Decane'],
      droplet_diameter_range_mm: '1.2 to 5.0 mm',
      cabin_o2_range: '12.0% to 34.0%',
      pressure_range_psi: '7.35 to 44.86 psi (0.5 to 3.0 atm)',
      airflow_cm_s: 0.0,
      total_runs: 274,
      discrete_flight_tests: 271,
    },
  },

  'PSI-68': {
    id: 'PSI-68',
    acronym: 'FLEX-2',
    name: 'Flame Extinction Experiment - 2',
    discipline: 'droplets',
    facility: 'MDCA inside the Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Binary mixtures (heptane/hexadecane, methanol/water), Ethanol, Decane',
    nTests: 8,
    conditionsSummary: 'O2 10.0% to 40.0%, chamber pressures 7.35 to 44.09 psi, airflow 0.1 to 5.0 cm/s.',
    scientificDiscovery: 'Studied differential fuel component volatility, micro-explosions in droplet emulsions, and multi-droplet array burning dynamics under convective flow.',
    sentences: [
      {
        text: 'FLEX-2 (PSI-68) investigated binary fuel droplet mixtures and droplet arrays in the MDCA chamber inside the CIR across 8 candidate condition sets.',
        evidence: [{ record_id: 'PSI-68', field: 'hardware' }, { record_id: 'PSI-68', field: 'n_tests' }],
      },
      {
        text: 'Fuels tested include Heptane and hexadecane mixtures, Methanol and water mixtures, Ethanol, and Decane.',
        evidence: [{ record_id: 'PSI-68', field: 'fuels' }],
      },
      {
        text: 'Tested conditions ranged from 10.0% to 40.0% oxygen, pressures of 7.35 to 44.09 psi, and airflow velocities of 0.1 to 5.0 cm/s.',
        evidence: [{ record_id: 'PSI-68', field: 'cabin_o2_pct' }, { record_id: 'PSI-68', field: 'pressure_psi' }, { record_id: 'PSI-68', field: 'airflow_speed_cm_s' }],
      },
      {
        text: 'FLEX-2 revealed differential vaporization rates, emulsion micro-explosions, and limiting oxygen index thresholds for multi-component fuels; chamber pressure was not reported in individual candidate set tables.',
        evidence: [{ record_id: 'PSI-68', field: 'objectives' }, { record_id: 'PSI-68', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-68',
      acronym: 'FLEX-2',
      name: 'Flame Extinction Experiment - 2',
      discipline: 'Liquid Droplet Combustion & Cool Flames',
      hardware: 'MDCA in Combustion Integrated Rack (CIR)',
      fuels: ['Heptane/hexadecane mixtures', 'Methanol/water mixtures', 'Ethanol', 'Decane'],
      cabin_o2_range: '10.0% to 40.0%',
      pressure_range_psi: '7.35 to 44.09 psi',
      airflow_range_cm_s: '0.1 to 5.0 cm/s',
      candidate_condition_sets: 8,
    },
  },

  'PSI-39': {
    id: 'PSI-39',
    acronym: 'CFI',
    name: 'Cool Flames Investigation',
    discipline: 'droplets',
    facility: 'MDCA chamber in the Combustion Integrated Rack (CIR)',
    fuelsSummary: 'n-Heptane and n-Dodecane isolated fuel droplets',
    nTests: 87,
    conditionsSummary: 'Tested under nitrogen and helium dilution; chamber pressure not reported in raw run rows (null).',
    scientificDiscovery: 'Mapped low-temperature chemical transition kinetics and boundary conditions for transition to quasi-steady cool diffusion flames without hot-flame reignition.',
    sentences: [
      {
        text: 'CFI (PSI-39), the Cool Flames Investigation, studied isolated droplet combustion in the CIR MDCA chamber across 87 microgravity test runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-39', field: 'hardware' }, { record_id: 'PSI-39', field: 'pressure_psi' }],
      },
      {
        text: 'Tested fuels include n-Heptane and n-Dodecane droplets under varying nitrogen and helium inert dilution; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-39', field: 'fuels' }, { record_id: 'PSI-69', field: 'fuels' }, { record_id: 'PSI-39', field: 'pressure_psi' }],
      },
      {
        text: 'The investigation mapped low-temperature chemical kinetics and boundary conditions for transition to quasi-steady cool diffusion flames; cabin oxygen and pressure were not reported.',
        evidence: [{ record_id: 'PSI-39', field: 'objectives' }, { record_id: 'PSI-39', field: 'cabin_o2_pct' }, { record_id: 'PSI-39', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-39',
      acronym: 'CFI',
      name: 'Cool Flames Investigation',
      discipline: 'Liquid Droplet Combustion & Cool Flames',
      hardware: 'MDCA in Combustion Integrated Rack (CIR)',
      fuels: ['n-Heptane', 'n-Dodecane'],
      total_runs: 87,
      pressure_status: 'not reported',
    },
  },

  'PSI-10': {
    id: 'PSI-10',
    acronym: 'Flame Design',
    name: 'Flame Design',
    discipline: 'gases',
    facility: 'Advanced Combustion via Microgravity Experiments (ACME) in CIR',
    fuelsSummary: 'Ethylene (C2H4) gas in normal and inverse diffusion flames',
    nTests: 327,
    conditionsSummary: 'Oxidizer stream O2 17.0% to 85.0%, pressure 14.67 to 17.00 psi, Tad 1856 to 2649 K; airflow not reported.',
    scientificDiscovery: 'Demonstrated that inverse diffusion flames (oxidizer injected into fuel ambient) prevent soot release into exhaust while sustaining high stoichiometric flame temperatures.',
    sentences: [
      {
        text: 'Flame Design (PSI-10) investigated gaseous diffusion flames using the ACME burner insert in the Combustion Integrated Rack (CIR) across 327 flight runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-10', field: 'hardware' }, { record_id: 'PSI-10', field: 'pressure_psi' }],
      },
      {
        text: 'The experiment evaluated 207 normal diffusion flames and 120 inverse diffusion flames burning ethylene fuel; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-10', field: 'objectives' }, { record_id: 'PSI-10', field: 'pressure_psi' }],
      },
      {
        text: 'Oxidizer feed streams contained 17% to 85% oxygen, which is burner oxidizer flow and never cabin oxygen; cabin oxygen was not reported.',
        evidence: [{ record_id: 'PSI-10', field: 'burner_flow_o2_pct' }, { record_id: 'PSI-10', field: 'cabin_o2_pct' }],
      },
      {
        text: 'Results proved that inverse diffusion flames prevent soot escape into exhaust gases while sustaining high stoichiometric flame temperatures; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-10', field: 'objectives' }, { record_id: 'PSI-10', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-10',
      acronym: 'Flame Design',
      name: 'Flame Design',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'ACME in Combustion Integrated Rack (CIR)',
      fuel: 'Ethylene (C2H4)',
      flame_types: '207 Normal + 120 Inverse diffusion flames',
      oxidizer_o2_range: '17% to 85% (burner flow oxidizer only)',
      pressure_range_psi: '14.67 to 17.00 psi',
      tad_k_range: '1856 to 2649 K',
      total_runs: 327,
    },
  },

  'PSI-20': {
    id: 'PSI-20',
    acronym: 'ACME-BRE',
    name: 'Burning Rate Emulator',
    discipline: 'gases',
    facility: 'ACME insert in Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Ethylene and Methane gaseous flows fed through porous flat burners (25.0 mm and 50.0 mm)',
    nTests: 18,
    conditionsSummary: 'Chamber O2 21.0% to 40.0%; chamber pressure not reported (null).',
    scientificDiscovery: 'Emulated solid polymer pyrolysis and burning rates using gas-fueled porous burners, isolating heat feedback mechanisms from solid-phase condensed degradation.',
    sentences: [
      {
        text: 'ACME-BRE (PSI-20), the Burning Rate Emulator, studied gas burner emulation of solid polymer combustion in the CIR ACME chamber across 18 flight runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-20', field: 'hardware' }, { record_id: 'PSI-20', field: 'pressure_psi' }],
      },
      {
        text: 'The experiment fed gaseous ethylene through 25.0 mm and 50.0 mm flat porous burners under chamber oxygen levels from 21% to 40%; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-20', field: 'fuels' }, { record_id: 'PSI-20', field: 'pressure_psi' }],
      },
      {
        text: 'By decoupling condensed-phase thermal degradation from gas-phase flame heat transfer, ACME-BRE measured pure flame heat feedback; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-20', field: 'objectives' }, { record_id: 'PSI-20', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-20',
      acronym: 'ACME-BRE',
      name: 'Burning Rate Emulator',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'ACME in Combustion Integrated Rack (CIR)',
      fuels: ['Ethylene', 'Methane'],
      burner_sizes_mm: [25.0, 50.0],
      chamber_o2_range: '21% to 40%',
      pressure_status: 'not reported',
      total_runs: 18,
    },
  },

  'PSI-22': {
    id: 'PSI-22',
    acronym: 'ACME E-FIELD',
    name: 'Electric-Field Effects on Laminar Diffusion Flames',
    discipline: 'gases',
    facility: 'ACME insert in Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Methane and Ethylene gaseous diffusion flames subjected to high-voltage electric mesh',
    nTests: 32,
    conditionsSummary: 'Regime: electric-field-analog; chamber pressure not reported (null).',
    scientificDiscovery: 'Mapped ionic wind forces and charged soot trajectory deflection. Under Section 2 Rule 5, this is strictly a terrestrial buoyancy analog, never partial gravity.',
    sentences: [
      {
        text: 'ACME E-FIELD (PSI-22) investigated high-voltage electric field effects on laminar diffusion flames in the CIR ACME facility across 32 flight runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-22', field: 'hardware' }, { record_id: 'PSI-22', field: 'pressure_psi' }],
      },
      {
        text: 'Tested fuels include methane and ethylene gaseous diffusion flames subjected to electrostatic mesh body forces; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-22', field: 'fuels' }, { record_id: 'PSI-22', field: 'pressure_psi' }],
      },
      {
        text: 'Under Section 2 Rule 5, ACME E-FIELD is strictly an electric field terrestrial buoyancy analog and never partial gravity data; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-22', field: 'objectives' }, { record_id: 'PSI-22', field: 'pressure_psi' }],
      },
      {
        text: 'The study demonstrated that electric fields can tailor soot accumulation and flame stabilization without natural buoyancy; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-22', field: 'objectives' }, { record_id: 'PSI-22', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-22',
      acronym: 'ACME E-FIELD',
      name: 'Electric-Field Effects on Laminar Diffusion Flames',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'ACME in Combustion Integrated Rack (CIR)',
      fuels: ['Methane', 'Ethylene'],
      gravity_regime: 'electric-field-analog (Rule 5: never partial gravity)',
      total_runs: 32,
      pressure_status: 'not reported',
    },
  },

  'PSI-23': {
    id: 'PSI-23',
    acronym: 'ACME S-Flames',
    name: 'Structure and Response of Spherical Diffusion Flames',
    discipline: 'gases',
    facility: 'ACME insert in Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Ethylene and Methane diluted with nitrogen (50% C2H4 / N2)',
    nTests: 18,
    conditionsSummary: 'Quiescent spherical diffusion geometry; chamber pressure not reported (null).',
    scientificDiscovery: 'Measured fundamental extinction strain rates, radiative soot emission, and scalar dissipation in 1D spherical symmetry impossible to create in 1g.',
    sentences: [
      {
        text: 'ACME S-Flames (PSI-23) examined the structure and response of spherical diffusion flames in the CIR ACME insert across 18 flight runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-23', field: 'hardware' }, { record_id: 'PSI-23', field: 'pressure_psi' }],
      },
      {
        text: 'Tested fuels consisted of ethylene and methane diluted with nitrogen under quiescent microgravity; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-23', field: 'fuels' }, { record_id: 'PSI-23', field: 'pressure_psi' }],
      },
      {
        text: 'Spherical 1D symmetry enabled direct measurement of radiative extinction limits and scalar dissipation rates; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-23', field: 'objectives' }, { record_id: 'PSI-23', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-23',
      acronym: 'ACME S-Flames',
      name: 'Structure and Response of Spherical Diffusion Flames',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'ACME in Combustion Integrated Rack (CIR)',
      fuels: ['50% C2H4 with N2', 'Methane'],
      total_runs: 18,
      pressure_status: 'not reported',
    },
  },

  'PSI-21': {
    id: 'PSI-21',
    acronym: 'ACME-CLD',
    name: 'Confined Combustion / Co-Flow Laminar Diffusion',
    discipline: 'gases',
    facility: 'ACME insert in Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Gaseous hydrocarbon fuels in narrow confined combustion ducts',
    nTests: 0,
    conditionsSummary: 'Catalog investigation; tabular run data not present in public JSON releases; chamber pressure not reported (null).',
    scientificDiscovery: 'Examined boundary-layer flame stabilization, wall thermal quenching, and flow confinement dynamics in microgravity ducts.',
    sentences: [
      {
        text: 'ACME-CLD (PSI-21) investigated confined co-flow laminar diffusion flames in narrow ducts inside the CIR ACME facility; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-21', field: 'hardware' }, { record_id: 'PSI-21', field: 'pressure_psi' }],
      },
      {
        text: 'The experiment analyzed wall thermal quenching, boundary layer growth, and flow confinement dynamics for gaseous diffusion flames; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-21', field: 'objectives' }, { record_id: 'PSI-21', field: 'pressure_psi' }],
      },
      {
        text: 'Tabular run datasets were not present in public catalog releases, and chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-21', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-21',
      acronym: 'ACME-CLD',
      name: 'Confined Combustion / Co-Flow Laminar Diffusion',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'ACME in Combustion Integrated Rack (CIR)',
      status: 'Catalog record; tabular run data not in public release',
      pressure_status: 'not reported',
    },
  },

  'PSI-107': {
    id: 'PSI-107',
    acronym: 'SPICE',
    name: 'Smoke Point In Co-flow Experiment',
    discipline: 'gases',
    facility: 'Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Ethylene and Methane co-flow gaseous diffusion flames',
    nTests: 469,
    conditionsSummary: 'Continuous airflow envelope 0.66 to 85.28 cm/s; nozzle diameters 1.6 to 2.1 mm; chamber pressure not reported (null).',
    scientificDiscovery: 'Established microgravity smoke points across a continuous co-flow air velocity envelope, proving microgravity flames soot more readily at low strain rates.',
    sentences: [
      {
        text: 'SPICE (PSI-107), the Smoke Point In Co-flow Experiment, measured sooting boundaries in the CIR facility across 469 flight test runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-107', field: 'hardware' }, { record_id: 'PSI-107', field: 'pressure_psi' }],
      },
      {
        text: 'Co-flow gaseous flames of ethylene and methane were burned across a continuous airflow velocity envelope from 0.66 to 85.28 cm/s; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-107', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-107', field: 'pressure_psi' }],
      },
      {
        text: 'The experiment determined the critical smoke point fuel flow rate at which soot escapes the flame tip, proving microgravity flames soot more readily under low strain rates; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-107', field: 'objectives' }, { record_id: 'PSI-107', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-107',
      acronym: 'SPICE',
      name: 'Smoke Point In Co-flow Experiment',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'Combustion Integrated Rack (CIR)',
      fuels: ['Ethylene', 'Methane'],
      airflow_envelope_cm_s: '0.66 to 85.28 cm/s',
      total_runs: 469,
      valid_positive_runs: 436,
      pressure_status: 'not reported',
    },
  },

  'PSI-106': {
    id: 'PSI-106',
    acronym: 'SLICE',
    name: 'Structure & Liftoff In Combustion Experiment',
    discipline: 'gases',
    facility: 'Microgravity Science Glovebox (MSG)',
    fuelsSummary: 'Methane (100% CH4), Ethylene, Ethane micro-jet diffusion flames',
    nTests: 12,
    conditionsSummary: 'Micro-nozzle injection under low-velocity co-flow; chamber pressure not reported (null).',
    scientificDiscovery: 'Characterized flame liftoff height, edge flame stabilization, and blowout extinction limits for laminar micro-jets without buoyant flickering.',
    sentences: [
      {
        text: 'SLICE (PSI-106), the Structure & Liftoff In Combustion Experiment, investigated micro-jet diffusion flames in the Microgravity Science Glovebox (MSG) across 12 flight runs; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-106', field: 'hardware' }, { record_id: 'PSI-106', field: 'pressure_psi' }],
      },
      {
        text: 'Gaseous fuels tested include methane, ethylene, and ethane injected through small micro-nozzles; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-106', field: 'fuels' }, { record_id: 'PSI-106', field: 'pressure_psi' }],
      },
      {
        text: 'SLICE measured flame liftoff height, edge flame stabilization, and blowout extinction limits without buoyant flickering; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-106', field: 'objectives' }, { record_id: 'PSI-106', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-106',
      acronym: 'SLICE',
      name: 'Structure & Liftoff In Combustion Experiment',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'Microgravity Science Glovebox (MSG)',
      fuels: ['100% CH4', 'Ethylene', 'Ethane'],
      total_runs: 12,
      pressure_status: 'not reported',
    },
  },

  'PSI-159': {
    id: 'PSI-159',
    acronym: 'CFI-G',
    name: 'Cool Flames Investigation with Gases',
    discipline: 'gases',
    facility: 'ACME insert in Combustion Integrated Rack (CIR)',
    fuelsSummary: 'Gaseous mixtures of butane, ethane, and propane (e.g. 30% butane, 30% ethane, 50% butane)',
    nTests: 168,
    conditionsSummary: 'Burner oxidizer O2 up to 85% (Rule 4: burner feed oxidizer ONLY, never cabin air); chamber pressure 7.35 to 44.09 psi, Tad up to 2730 K; cabin O2 not reported.',
    scientificDiscovery: 'Successfully produced sustained gaseous cool diffusion flames in microgravity, proving cool flame kinetics operate in non-premixed gases without liquid droplets.',
    sentences: [
      {
        text: 'CFI-G (PSI-159), the Cool Flames Investigation with Gases, studied gaseous non-premixed diffusion flames in the CIR ACME facility across 168 tests.',
        evidence: [{ record_id: 'PSI-159', field: 'hardware' }, { record_id: 'PSI-159', field: 'n_tests' }],
      },
      {
        text: 'Tested gaseous fuels include 30% butane, 30% ethane, 30% propane, 50% butane, pure ethane, and pure propane; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-159', field: 'fuels' }, { record_id: 'PSI-159', field: 'pressure_psi' }],
      },
      {
        text: 'Burner feed oxidizer streams contained up to 85% oxygen, which is strictly burner-flow oxidizer and never cabin oxygen; cabin oxygen was not reported.',
        evidence: [{ record_id: 'PSI-159', field: 'burner_flow_o2_pct' }, { record_id: 'PSI-159', field: 'cabin_o2_pct' }],
      },
      {
        text: 'CFI-G proved that sustained low-temperature cool flame oxidation occurs in purely gaseous fuels without droplet evaporation; chamber pressure was not reported in cabin metadata.',
        evidence: [{ record_id: 'PSI-159', field: 'objectives' }, { record_id: 'PSI-159', field: 'pressure_psi' }],
      },
    ],
    toolContext: {
      id: 'PSI-159',
      acronym: 'CFI-G',
      name: 'Cool Flames Investigation with Gases',
      discipline: 'Gaseous Diffusion Flames & Burners',
      hardware: 'ACME in Combustion Integrated Rack (CIR)',
      fuels: ['30% butane', '30% ethane', '30% propane', '50% butane', 'ethane', 'propane'],
      burner_feed_o2_max: '85% (Rule 4: strictly burner feed oxidizer, never cabin air)',
      cabin_o2_status: 'null (not reported)',
      pressure_range_psi: '7.35 to 44.09 psi',
      total_runs: 179,
      normal_flame_runs: 168,
    },
  },

  'PSI-102': {
    id: 'PSI-102',
    acronym: 'SAME',
    name: 'Smoke Aerosol Measurement Experiment',
    discipline: 'smoke',
    facility: 'Microgravity Science Glovebox (MSG) Smoke Chamber',
    fuelsSummary: 'Overheated Kapton, Teflon, Silicone, Pyrel foam, Cotton lamp wick, Dibutyl Phthalate',
    nTests: 8,
    conditionsSummary: 'Forced airflow velocity 5.0 to 10.0 cm/s, pyrolysis weight loss rate 0.7 to 3.2 mg/min; cabin O2 and chamber pressure not reported (null).',
    scientificDiscovery: 'Discovered that microgravity smoke particles agglomerate into larger mean diameters without buoyant settling, explaining ionization detector latency in spacecraft.',
    sentences: [
      {
        text: 'SAME (PSI-102), the Smoke Aerosol Measurement Experiment, evaluated smoke particulate generation in the Microgravity Science Glovebox (MSG) Smoke Chamber across 8 tests.',
        evidence: [{ record_id: 'PSI-102', field: 'hardware' }, { record_id: 'PSI-102', field: 'n_tests' }],
      },
      {
        text: 'Tested materials undergoing overheating pyrolysis include Kapton, Teflon, Silicone, Pyrel foam, Cotton lamp wick, and Dibutyl Phthalate.',
        evidence: [{ record_id: 'PSI-102', field: 'fuels' }],
      },
      {
        text: 'Forced airflow was maintained between 5.0 and 10.0 cm/s, while cabin oxygen and chamber pressure were not reported.',
        evidence: [{ record_id: 'PSI-102', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-102', field: 'cabin_o2_pct' }, { record_id: 'PSI-102', field: 'pressure_psi' }],
      },
      {
        text: 'Results showed that microgravity smoke particles agglomerate into larger mean diameters without buoyant settling, explaining sensor latency in spacecraft ionization detectors.',
        evidence: [{ record_id: 'PSI-102', field: 'objectives' }],
      },
    ],
    toolContext: {
      id: 'PSI-102',
      acronym: 'SAME',
      name: 'Smoke Aerosol Measurement Experiment',
      discipline: 'Smoke Particulates & Fire Detection',
      hardware: 'Microgravity Science Glovebox (MSG) Smoke Chamber',
      fuels: ['Kapton', 'Teflon', 'Silicone', 'Pyrel Foam', 'Cotton lamp wick', 'Dibutyl Phthalate'],
      airflow_range_cm_s: '5.0 to 10.0 cm/s',
      total_runs: 8,
      cabin_o2_status: 'not reported',
      pressure_status: 'not reported',
    },
  },

  'PSI-101': {
    id: 'PSI-101',
    acronym: 'SAME-R',
    name: 'Smoke Aerosol Measurement Experiment - Reflight',
    discipline: 'smoke',
    facility: 'Microgravity Science Glovebox (MSG) SAME-R Payload Module',
    fuelsSummary: 'Kapton wire, Teflon wire, Cellulose, Cotton candle wick, Pyrolene',
    nTests: 109,
    conditionsSummary: 'Airflow velocities 0.0 to 8.1 cm/s (discrete set points 0.0, 1.0, 2.0, 8.0, 8.1 cm/s); cabin O2 and chamber pressure not reported (null).',
    scientificDiscovery: 'Quantified particulate aging and coagulation rates over time inside recirculation loops, providing essential calibration for optical obscuration fire sensors.',
    sentences: [
      {
        text: 'SAME-R (PSI-101), the Smoke Aerosol Measurement Experiment Reflight, investigated particulate aging in the MSG SAME-R Payload Module across 109 tests.',
        evidence: [{ record_id: 'PSI-101', field: 'hardware' }, { record_id: 'PSI-101', field: 'n_tests' }],
      },
      {
        text: 'Tested materials include Kapton wire, Teflon wire, Cellulose, Cotton candle wick, and Pyrolene.',
        evidence: [{ record_id: 'PSI-101', field: 'fuels' }],
      },
      {
        text: 'Airflow speeds spanned 0.0 to 8.1 cm/s across discrete set points (0.0, 1.0, 2.0, 8.0, 8.1 cm/s); cabin oxygen and chamber pressure were not reported.',
        evidence: [{ record_id: 'PSI-101', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-101', field: 'cabin_o2_pct' }, { record_id: 'PSI-101', field: 'pressure_psi' }],
      },
      {
        text: 'SAME-R characterized smoke particulate aging and coagulation inside recirculation ducts, providing calibration data for optical scattering fire detection sensors.',
        evidence: [{ record_id: 'PSI-101', field: 'objectives' }],
      },
    ],
    toolContext: {
      id: 'PSI-101',
      acronym: 'SAME-R',
      name: 'Smoke Aerosol Measurement Experiment - Reflight',
      discipline: 'Smoke Particulates & Fire Detection',
      hardware: 'Microgravity Science Glovebox (MSG) SAME-R Payload Module',
      fuels: ['Kapton wire', 'Teflon wire', 'Cellulose', 'Cotton candle wick', 'Pyrolene'],
      airflow_discrete_cm_s: [0.0, 1.0, 2.0, 8.0, 8.1],
      total_runs: 109,
      cabin_o2_status: 'not reported',
      pressure_status: 'not reported',
    },
  },
};

export function getCatalogOverviewSentences(): AgentAnswerSentence[] {
  return [
    {
      text: 'Solid fuel flammability in microgravity was investigated in BASS (PSI-26), BASS-II (PSI-25), SAFFIRE-I (PSI-98), SAFFIRE-II (PSI-99), and SAFFIRE-III (PSI-100), testing materials such as PMMA, SIBAL, and Nomex under forced airflow; chamber pressure is not reported.',
      evidence: [
        { record_id: 'PSI-25', field: 'hardware' },
        { record_id: 'PSI-99', field: 'fuels' },
        { record_id: 'PSI-25', field: 'pressure_psi' },
      ],
    },
    {
      text: 'Liquid droplet combustion and cool flame kinetics were evaluated in FLEX (PSI-69), FLEX-2 (PSI-68), and CFI (PSI-39) using the CIR MDCA chamber across isolated alkane droplets; chamber pressure was not reported for CFI.',
      evidence: [
        { record_id: 'PSI-69', field: 'hardware' },
        { record_id: 'PSI-68', field: 'fuels' },
        { record_id: 'PSI-39', field: 'pressure_psi' },
      ],
    },
    {
      text: 'Gaseous diffusion flames and burner kinetics were investigated in Flame Design (PSI-10), ACME-BRE (PSI-20), ACME E-FIELD (PSI-22), ACME S-Flames (PSI-23), ACME-CLD (PSI-21), SPICE (PSI-107), SLICE (PSI-106), and CFI-G (PSI-159), measuring soot thresholds and burner feed oxygen; chamber pressure was not reported for ACME burners.',
      evidence: [
        { record_id: 'PSI-159', field: 'burner_flow_o2_pct' },
        { record_id: 'PSI-10', field: 'hardware' },
        { record_id: 'PSI-20', field: 'pressure_psi' },
      ],
    },
    {
      text: 'Spacecraft fire detection and smoke particulate aging were characterized in SAME (PSI-102) and SAME-R (PSI-101) inside the MSG Smoke Chamber using pyrolyzing Kapton, Teflon, and Silicone materials; cabin oxygen was not reported.',
      evidence: [
        { record_id: 'PSI-102', field: 'hardware' },
        { record_id: 'PSI-101', field: 'fuels' },
        { record_id: 'PSI-102', field: 'cabin_o2_pct' },
      ],
    },
  ];
}

export function getDisciplineSentences(discipline: 'solids' | 'droplets' | 'gases' | 'smoke'): AgentAnswerSentence[] {
  if (discipline === 'solids') {
    return [
      {
        text: 'The 5 NASA PSI solid fuel flammability experiments are BASS (PSI-26), BASS-II (PSI-25), SAFFIRE-I (PSI-98), SAFFIRE-II (PSI-99), and SAFFIRE-III (PSI-100); chamber pressure is not reported.',
        evidence: [{ record_id: 'PSI-25', field: 'hardware' }, { record_id: 'PSI-99', field: 'hardware' }, { record_id: 'PSI-25', field: 'pressure_psi' }],
      },
      {
        text: 'BASS and BASS-II evaluated PMMA rods, PMMA slabs, SIBAL fabric, and Nomex III in the MSG flow duct under forced flows from 2.0 to 21.0 cm/s; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-25', field: 'fuels' }, { record_id: 'PSI-25', field: 'airflow_speed_cm_s' }, { record_id: 'PSI-25', field: 'pressure_psi' }],
      },
      {
        text: 'The SAFFIRE series (SAFFIRE-I, II, and III) conducted vehicle-scale burns in uncrewed Cygnus cargo modules, demonstrating that 0g and 1g companion burns act as physical bounds, not linear predictions; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-99', field: 'objectives' }, { record_id: 'PSI-98', field: 'hardware' }, { record_id: 'PSI-99', field: 'pressure_psi' }],
      },
    ];
  }

  if (discipline === 'droplets') {
    return [
      {
        text: 'The 3 NASA PSI liquid droplet experiments are FLEX (PSI-69), FLEX-2 (PSI-68), and CFI (PSI-39), conducting isolated droplet combustion in the CIR MDCA chamber.',
        evidence: [{ record_id: 'PSI-69', field: 'hardware' }, { record_id: 'PSI-68', field: 'hardware' }],
      },
      {
        text: 'Fuels evaluated include isolated droplets of n-Heptane, Methanol, Ethanol, and Decane mixtures with initial diameters of 1.2 to 5.0 mm; chamber pressure was not reported for some runs.',
        evidence: [{ record_id: 'PSI-69', field: 'fuels' }, { record_id: 'PSI-69', field: 'pressure_psi' }],
      },
      {
        text: 'FLEX discovered sustained low-temperature cool flames, continuing chemical oxidation at 600 to 800 K after apparent visible hot-flame radiative extinction; chamber pressure is not reported for cool flame transitions.',
        evidence: [{ record_id: 'PSI-69', field: 'objectives' }, { record_id: 'PSI-69', field: 'pressure_psi' }],
      },
    ];
  }

  if (discipline === 'gases') {
    return [
      {
        text: 'The 8 NASA PSI gaseous flame investigations comprise Flame Design (PSI-10), ACME-BRE (PSI-20), ACME E-FIELD (PSI-22), ACME S-Flames (PSI-23), ACME-CLD (PSI-21), SPICE (PSI-107), SLICE (PSI-106), and CFI-G (PSI-159); chamber pressure was not reported for ACME burners.',
        evidence: [{ record_id: 'PSI-10', field: 'hardware' }, { record_id: 'PSI-159', field: 'hardware' }, { record_id: 'PSI-20', field: 'pressure_psi' }],
      },
      {
        text: 'Gaseous fuels tested include ethylene, methane, ethane, propane, and butane burned in normal, inverse, spherical, and co-flow configurations; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-159', field: 'fuels' }, { record_id: 'PSI-10', field: 'objectives' }, { record_id: 'PSI-10', field: 'pressure_psi' }],
      },
      {
        text: 'Burner oxidizer streams contained up to 85% oxygen in CFI-G and Flame Design, which is strictly burner-flow oxidizer and never cabin oxygen; cabin oxygen was not reported.',
        evidence: [{ record_id: 'PSI-159', field: 'burner_flow_o2_pct' }, { record_id: 'PSI-159', field: 'cabin_o2_pct' }],
      },
      {
        text: 'Under Section 2 Rule 5, ACME E-FIELD provides an electrical body force terrestrial buoyancy analog and never partial gravity data; chamber pressure was not reported.',
        evidence: [{ record_id: 'PSI-22', field: 'objectives' }, { record_id: 'PSI-22', field: 'pressure_psi' }],
      },
    ];
  }

  // discipline === 'smoke'
  return [
    {
      text: 'The 2 NASA PSI spacecraft fire detection investigations are SAME (PSI-102) and SAME-R (PSI-101), operated in the Microgravity Science Glovebox (MSG).',
      evidence: [{ record_id: 'PSI-102', field: 'hardware' }, { record_id: 'PSI-101', field: 'hardware' }],
    },
    {
      text: 'Tested materials undergoing overheating pyrolysis include Kapton wire, Teflon wire, Silicone, Cellulose, Cotton, and Pyrel foam.',
      evidence: [{ record_id: 'PSI-102', field: 'fuels' }, { record_id: 'PSI-101', field: 'fuels' }],
    },
    {
      text: 'Findings proved that microgravity smoke particles agglomerate into larger mean diameters without buoyant settling, providing calibration data for spacecraft optical smoke detectors; cabin oxygen was not reported.',
      evidence: [{ record_id: 'PSI-102', field: 'objectives' }, { record_id: 'PSI-102', field: 'cabin_o2_pct' }],
    },
  ];
}

export function matchExperimentInQuery(qLower: string): ExperimentDetail | null {
  // Check exact ID matches first
  for (const [id, detail] of Object.entries(PSI_EXPERIMENT_DETAILS)) {
    const idLower = id.toLowerCase();
    if (qLower.includes(idLower)) return detail;
  }

  // Check specific acronyms (specific before general)
  if (qLower.includes('bass-ii') || qLower.includes('bass 2') || qLower.includes('bass2')) {
    return PSI_EXPERIMENT_DETAILS['PSI-25'];
  }
  if (qLower.includes('bass')) {
    return PSI_EXPERIMENT_DETAILS['PSI-26'];
  }
  if (qLower.includes('saffire-iii') || qLower.includes('saffire 3') || qLower.includes('saffire3')) {
    return PSI_EXPERIMENT_DETAILS['PSI-100'];
  }
  if (qLower.includes('saffire-ii') || qLower.includes('saffire 2') || qLower.includes('saffire2')) {
    return PSI_EXPERIMENT_DETAILS['PSI-99'];
  }
  if (qLower.includes('saffire-i') || qLower.includes('saffire 1') || qLower.includes('saffire1')) {
    return PSI_EXPERIMENT_DETAILS['PSI-98'];
  }
  if (qLower.includes('saffire')) {
    return PSI_EXPERIMENT_DETAILS['PSI-99'];
  }
  if (qLower.includes('flex-2') || qLower.includes('flex 2') || qLower.includes('flex2')) {
    return PSI_EXPERIMENT_DETAILS['PSI-68'];
  }
  if (qLower.includes('flex')) {
    return PSI_EXPERIMENT_DETAILS['PSI-69'];
  }
  if (qLower.includes('cfi-g') || qLower.includes('cfig') || (qLower.includes('cfi') && qLower.includes('gas'))) {
    return PSI_EXPERIMENT_DETAILS['PSI-159'];
  }
  if (qLower.includes('cfi') || (qLower.includes('cool flame') && (qLower.includes('droplet') || qLower.includes('psi-39')))) {
    return PSI_EXPERIMENT_DETAILS['PSI-39'];
  }
  if (qLower.includes('flame design')) {
    return PSI_EXPERIMENT_DETAILS['PSI-10'];
  }
  if (qLower.includes('acme-bre') || qLower.includes('burning rate emulator') || (qLower.includes('bre') && qLower.includes('acme'))) {
    return PSI_EXPERIMENT_DETAILS['PSI-20'];
  }
  if (qLower.includes('e-field') || qLower.includes('efield') || qLower.includes('electric-field') || qLower.includes('electric field')) {
    return PSI_EXPERIMENT_DETAILS['PSI-22'];
  }
  if (qLower.includes('s-flame') || qLower.includes('sflame') || qLower.includes('spherical diffusion flame')) {
    return PSI_EXPERIMENT_DETAILS['PSI-23'];
  }
  if (qLower.includes('acme-cld') || qLower.includes('cld') || qLower.includes('confined combustion')) {
    return PSI_EXPERIMENT_DETAILS['PSI-21'];
  }
  if (qLower.includes('spice') || qLower.includes('smoke point in co-flow')) {
    return PSI_EXPERIMENT_DETAILS['PSI-107'];
  }
  if (qLower.includes('slice') || qLower.includes('structure & liftoff') || qLower.includes('structure and liftoff')) {
    return PSI_EXPERIMENT_DETAILS['PSI-106'];
  }
  if (qLower.includes('same-r') || qLower.includes('same r') || qLower.includes('samer') || qLower.includes('same reflight')) {
    return PSI_EXPERIMENT_DETAILS['PSI-101'];
  }
  if (qLower.includes('same') && (qLower.includes('smoke') || qLower.includes('aerosol') || qLower.includes('chamber') || qLower.includes('experiment') || qLower.includes('psi-102'))) {
    return PSI_EXPERIMENT_DETAILS['PSI-102'];
  }

  return null;
}
