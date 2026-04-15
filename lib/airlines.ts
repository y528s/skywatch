interface AirlineInfo {
  name: string
  color: string
}

export const AIRLINES: Record<string, AirlineInfo> = {
  // US Major
  AAL: { name: 'American Airlines', color: '#0078D2' },
  DAL: { name: 'Delta Air Lines', color: '#003366' },
  UAL: { name: 'United Airlines', color: '#002244' },
  SWA: { name: 'Southwest Airlines', color: '#F9B612' },
  JBU: { name: 'JetBlue Airways', color: '#003876' },
  ASA: { name: 'Alaska Airlines', color: '#01426A' },
  NKS: { name: 'Spirit Airlines', color: '#FFD200' },
  FFT: { name: 'Frontier Airlines', color: '#006341' },
  HAL: { name: 'Hawaiian Airlines', color: '#7B2D8E' },
  AAY: { name: 'Allegiant Air', color: '#F7941E' },

  // US Regional
  SKW: { name: 'SkyWest Airlines', color: '#00205B' },
  RPA: { name: 'Republic Airways', color: '#1C3E6E' },
  ENY: { name: 'Envoy Air', color: '#0078D2' },
  PDT: { name: 'Piedmont Airlines', color: '#0078D2' },
  JIA: { name: 'PSA Airlines', color: '#0078D2' },
  GJS: { name: 'GoJet Airlines', color: '#002244' },
  CPZ: { name: 'Compass Airlines', color: '#003366' },
  EDV: { name: 'Endeavor Air', color: '#003366' },

  // US Cargo
  FDX: { name: 'FedEx Express', color: '#4D148C' },
  UPS: { name: 'UPS Airlines', color: '#351C15' },
  GTI: { name: 'Atlas Air', color: '#D4AF37' },
  ABX: { name: 'ABX Air', color: '#CC0000' },

  // European
  BAW: { name: 'British Airways', color: '#075AAA' },
  DLH: { name: 'Lufthansa', color: '#05164D' },
  AFR: { name: 'Air France', color: '#002157' },
  KLM: { name: 'KLM Royal Dutch', color: '#00A1DE' },
  EIN: { name: 'Aer Lingus', color: '#006272' },
  SAS: { name: 'Scandinavian Airlines', color: '#000080' },
  FIN: { name: 'Finnair', color: '#0B1560' },
  AUA: { name: 'Austrian Airlines', color: '#E20A16' },
  SWR: { name: 'Swiss International', color: '#E20A16' },
  TAP: { name: 'TAP Air Portugal', color: '#00966E' },
  IBE: { name: 'Iberia', color: '#D71921' },
  VLG: { name: 'Vueling', color: '#FFCC00' },
  RYR: { name: 'Ryanair', color: '#073590' },
  EZY: { name: 'easyJet', color: '#FF6600' },
  WZZ: { name: 'Wizz Air', color: '#CE0888' },
  THY: { name: 'Turkish Airlines', color: '#C80815' },
  VIR: { name: 'Virgin Atlantic', color: '#C8102E' },
  ICE: { name: 'Icelandair', color: '#003888' },
  NOZ: { name: 'Norwegian Air', color: '#D81939' },

  // Middle East
  UAE: { name: 'Emirates', color: '#D71921' },
  QTR: { name: 'Qatar Airways', color: '#5C0632' },
  ETD: { name: 'Etihad Airways', color: '#BD8B13' },
  SVA: { name: 'Saudia', color: '#006633' },
  GIA: { name: 'Garuda Indonesia', color: '#00529C' },
  ELY: { name: 'El Al', color: '#003DA5' },
  RJA: { name: 'Royal Jordanian', color: '#7D3C98' },

  // Asia-Pacific
  ANA: { name: 'All Nippon Airways', color: '#00467F' },
  JAL: { name: 'Japan Airlines', color: '#CC0000' },
  SIA: { name: 'Singapore Airlines', color: '#F0AB00' },
  CPA: { name: 'Cathay Pacific', color: '#005D3A' },
  QFA: { name: 'Qantas', color: '#E0001A' },
  ANZ: { name: 'Air New Zealand', color: '#221F1F' },
  KAL: { name: 'Korean Air', color: '#003876' },
  AAR: { name: 'Asiana Airlines', color: '#C60C30' },
  CCA: { name: 'Air China', color: '#C60C30' },
  CES: { name: 'China Eastern', color: '#1A3E72' },
  CSN: { name: 'China Southern', color: '#005BAA' },
  EVA: { name: 'EVA Air', color: '#006D4F' },
  THA: { name: 'Thai Airways', color: '#6B1F78' },
  MAS: { name: 'Malaysia Airlines', color: '#CC0000' },
  AIC: { name: 'Air India', color: '#E53935' },
  VTI: { name: 'Vistara', color: '#5A2D82' },

  // Americas
  ACA: { name: 'Air Canada', color: '#F01428' },
  WJA: { name: 'WestJet', color: '#00263A' },
  AVA: { name: 'Avianca', color: '#E31937' },
  GLO: { name: 'GOL Airlines', color: '#FF6600' },
  TAM: { name: 'LATAM Airlines', color: '#1B0088' },
  AMX: { name: 'Aeromexico', color: '#0B2343' },
  CMP: { name: 'Copa Airlines', color: '#004A98' },

  // Africa
  SAA: { name: 'South African Airways', color: '#006B3F' },
  ETH: { name: 'Ethiopian Airlines', color: '#006233' },
  RAM: { name: 'Royal Air Maroc', color: '#C1002A' },
  MSR: { name: 'EgyptAir', color: '#0C2340' },
  KQA: { name: 'Kenya Airways', color: '#001C3D' },
}

const DEFAULT_AIRLINE: AirlineInfo = { name: 'Unknown', color: '#888888' }

export function getAirline(callsign: string | null | undefined): AirlineInfo {
  if (!callsign || callsign.length < 3) return DEFAULT_AIRLINE
  const prefix = callsign.trim().substring(0, 3).toUpperCase()
  return AIRLINES[prefix] || DEFAULT_AIRLINE
}
