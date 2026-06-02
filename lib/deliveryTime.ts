import type { CityRow } from './citiesSchema';

const CONTINENT_BY_ISO2: Record<string, string> = {
  AF: 'Asia',
  AX: 'Europe',
  AL: 'Europe',
  DZ: 'Africa',
  AS: 'Oceania',
  AD: 'Europe',
  AO: 'Africa',
  AI: 'North America',
  AQ: 'Antarctica',
  AG: 'North America',
  AR: 'South America',
  AM: 'Asia',
  AW: 'North America',
  AU: 'Oceania',
  AT: 'Europe',
  AZ: 'Asia',
  BS: 'North America',
  BH: 'Asia',
  BD: 'Asia',
  BB: 'North America',
  BY: 'Europe',
  BE: 'Europe',
  BZ: 'North America',
  BJ: 'Africa',
  BM: 'North America',
  BT: 'Asia',
  BO: 'South America',
  BQ: 'North America',
  BA: 'Europe',
  BW: 'Africa',
  BR: 'South America',
  IO: 'Asia',
  BN: 'Asia',
  BG: 'Europe',
  BF: 'Africa',
  BI: 'Africa',
  KH: 'Asia',
  CM: 'Africa',
  CA: 'North America',
  CV: 'Africa',
  KY: 'North America',
  CF: 'Africa',
  TD: 'Africa',
  CL: 'South America',
  CN: 'Asia',
  CX: 'Asia',
  CC: 'Asia',
  CO: 'South America',
  KM: 'Africa',
  CG: 'Africa',
  CD: 'Africa',
  CK: 'Oceania',
  CR: 'North America',
  CI: 'Africa',
  HR: 'Europe',
  CU: 'North America',
  CW: 'North America',
  CY: 'Asia',
  CZ: 'Europe',
  DK: 'Europe',
  DJ: 'Africa',
  DM: 'North America',
  DO: 'North America',
  EC: 'South America',
  EG: 'Africa',
  SV: 'North America',
  GQ: 'Africa',
  ER: 'Africa',
  EE: 'Europe',
  SZ: 'Africa',
  ET: 'Africa',
  FK: 'South America',
  FO: 'Europe',
  FJ: 'Oceania',
  FI: 'Europe',
  FR: 'Europe',
  GF: 'South America',
  PF: 'Oceania',
  GA: 'Africa',
  GM: 'Africa',
  GE: 'Asia',
  DE: 'Europe',
  GH: 'Africa',
  GI: 'Europe',
  GR: 'Europe',
  GL: 'North America',
  GD: 'North America',
  GP: 'North America',
  GU: 'Oceania',
  GT: 'North America',
  GG: 'Europe',
  GN: 'Africa',
  GW: 'Africa',
  GY: 'South America',
  HT: 'North America',
  HN: 'North America',
  HK: 'Asia',
  HU: 'Europe',
  IS: 'Europe',
  IN: 'Asia',
  ID: 'Asia',
  IR: 'Asia',
  IQ: 'Asia',
  IE: 'Europe',
  IM: 'Europe',
  IL: 'Asia',
  IT: 'Europe',
  JM: 'North America',
  JP: 'Asia',
  JE: 'Europe',
  JO: 'Asia',
  KZ: 'Asia',
  KE: 'Africa',
  KI: 'Oceania',
  KP: 'Asia',
  KR: 'Asia',
  KW: 'Asia',
  KG: 'Asia',
  LA: 'Asia',
  LV: 'Europe',
  LB: 'Asia',
  LS: 'Africa',
  LR: 'Africa',
  LY: 'Africa',
  LI: 'Europe',
  LT: 'Europe',
  LU: 'Europe',
  MO: 'Asia',
  MG: 'Africa',
  MW: 'Africa',
  MY: 'Asia',
  MV: 'Asia',
  ML: 'Africa',
  MT: 'Europe',
  MH: 'Oceania',
  MQ: 'North America',
  MR: 'Africa',
  MU: 'Africa',
  YT: 'Africa',
  MX: 'North America',
  FM: 'Oceania',
  MD: 'Europe',
  MC: 'Europe',
  MN: 'Asia',
  ME: 'Europe',
  MS: 'North America',
  MA: 'Africa',
  MZ: 'Africa',
  MM: 'Asia',
  NA: 'Africa',
  NR: 'Oceania',
  NP: 'Asia',
  NL: 'Europe',
  NC: 'Oceania',
  NZ: 'Oceania',
  NI: 'North America',
  NE: 'Africa',
  NG: 'Africa',
  NU: 'Oceania',
  NF: 'Oceania',
  MK: 'Europe',
  MP: 'Oceania',
  NO: 'Europe',
  OM: 'Asia',
  PK: 'Asia',
  PW: 'Oceania',
  PS: 'Asia',
  PA: 'North America',
  PG: 'Oceania',
  PY: 'South America',
  PE: 'South America',
  PH: 'Asia',
  PN: 'Oceania',
  PL: 'Europe',
  PT: 'Europe',
  PR: 'North America',
  QA: 'Asia',
  RE: 'Africa',
  RO: 'Europe',
  RU: 'Europe',
  RW: 'Africa',
  BL: 'North America',
  SH: 'Africa',
  KN: 'North America',
  LC: 'North America',
  MF: 'North America',
  PM: 'North America',
  VC: 'North America',
  WS: 'Oceania',
  SM: 'Europe',
  ST: 'Africa',
  SA: 'Asia',
  SN: 'Africa',
  RS: 'Europe',
  SC: 'Africa',
  SL: 'Africa',
  SG: 'Asia',
  SX: 'North America',
  SK: 'Europe',
  SI: 'Europe',
  SB: 'Oceania',
  SO: 'Africa',
  ZA: 'Africa',
  GS: 'Antarctica',
  SS: 'Africa',
  ES: 'Europe',
  LK: 'Asia',
  SD: 'Africa',
  SR: 'South America',
  SJ: 'Europe',
  SE: 'Europe',
  CH: 'Europe',
  SY: 'Asia',
  TW: 'Asia',
  TJ: 'Asia',
  TZ: 'Africa',
  TH: 'Asia',
  TL: 'Asia',
  TG: 'Africa',
  TK: 'Oceania',
  TO: 'Oceania',
  TT: 'North America',
  TN: 'Africa',
  TR: 'Asia',
  TM: 'Asia',
  TC: 'North America',
  TV: 'Oceania',
  UG: 'Africa',
  UA: 'Europe',
  AE: 'Asia',
  GB: 'Europe',
  US: 'North America',
  UM: 'Oceania',
  UY: 'South America',
  UZ: 'Asia',
  VU: 'Oceania',
  VA: 'Europe',
  VE: 'South America',
  VN: 'Asia',
  VG: 'North America',
  VI: 'North America',
  WF: 'Oceania',
  EH: 'Africa',
  YE: 'Asia',
  ZM: 'Africa',
  ZW: 'Africa',
};

function continentFor(city: CityRow) {
  return city.continent || (city.iso2 ? CONTINENT_BY_ISO2[city.iso2.toUpperCase()] : null);
}

function distanceKm(a: CityRow, b: CityRow) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function timezoneOffsetMinutes(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return (asUtc - date.getTime()) / 60000;
}

function timezoneDiffHours(a: CityRow, b: CityRow, date: Date) {
  if (!a.timezone || !b.timezone) return 0;
  try {
    return Math.abs(timezoneOffsetMinutes(a.timezone, date) - timezoneOffsetMinutes(b.timezone, date)) / 60;
  } catch {
    return 0;
  }
}

export function calculateDelivery(senderCity: CityRow, recipientCity: CityRow, now = new Date()) {
  const sameCity =
    senderCity.city_ascii?.toLowerCase() === recipientCity.city_ascii?.toLowerCase() &&
    senderCity.country.toLowerCase() === recipientCity.country.toLowerCase();

  let rule: 'same_city' | 'same_country' | 'same_continent' | 'outside_continent';
  let hours: number;

  if (sameCity) {
    rule = 'same_city';
    hours = 0.75;
  } else if (senderCity.country.toLowerCase() === recipientCity.country.toLowerCase()) {
    rule = 'same_country';
    hours = Math.min(8, Math.max(1, 1 + distanceKm(senderCity, recipientCity) / 150));
  } else if (continentFor(senderCity) && continentFor(senderCity) === continentFor(recipientCity)) {
    rule = 'same_continent';
    hours = 8 + timezoneDiffHours(senderCity, recipientCity, now);
  } else {
    rule = 'outside_continent';
    hours = 24 + timezoneDiffHours(senderCity, recipientCity, now);
  }

  const roundedHours = Math.round(hours * 100) / 100;
  return {
    deliveryRule: rule,
    deliveryHours: roundedHours,
    estimatedDeliveryAt: new Date(now.getTime() + roundedHours * 60 * 60 * 1000).toISOString(),
  };
}
