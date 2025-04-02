/**
 * Get flag emoji from country code
 * @param {string} countryCode - ISO 3166-1 alpha-2 or alpha-3 country code
 * @returns {string} - Flag emoji
 */
export function getFlagEmoji(countryCode) {
  if (!countryCode) return '🏳️'
  
  // Handle alpha-3 codes by using first two letters (usually works)
  const code = countryCode.length === 3 ? countryCode.substring(0, 2) : countryCode
  
  // Convert to regional indicator symbols
  const codePoints = [...code.toUpperCase()].map(c => 
    c.charCodeAt(0) + 127397
  )
  
  return String.fromCodePoint(...codePoints)
}

/**
 * Get country name from country code
 * @param {string} code - ISO 3166-1 alpha-2 or alpha-3 country code
 * @returns {string} - Country name
 */
export function getCountryName(code) {
  if (!code) return 'Unknown'
  
  // Common country codes
  const countryNames = {
    // Alpha-2 codes
    'AF': 'Afghanistan',
    'AL': 'Albania',
    'DZ': 'Algeria',
    'AR': 'Argentina',
    'AU': 'Australia',
    'AT': 'Austria',
    'BE': 'Belgium',
    'BR': 'Brazil',
    'CA': 'Canada',
    'CN': 'China',
    'CO': 'Colombia',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'EG': 'Egypt',
    'FI': 'Finland',
    'FR': 'France',
    'DE': 'Germany',
    'GR': 'Greece',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'IN': 'India',
    'ID': 'Indonesia',
    'IR': 'Iran',
    'IQ': 'Iraq',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IT': 'Italy',
    'JP': 'Japan',
    'KE': 'Kenya',
    'LB': 'Lebanon',
    'MY': 'Malaysia',
    'MX': 'Mexico',
    'MA': 'Morocco',
    'NL': 'Netherlands',
    'NZ': 'New Zealand',
    'NG': 'Nigeria',
    'NO': 'Norway',
    'PK': 'Pakistan',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'RU': 'Russia',
    'SA': 'Saudi Arabia',
    'SG': 'Singapore',
    'ZA': 'South Africa',
    'KR': 'South Korea',
    'ES': 'Spain',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'TW': 'Taiwan',
    'TH': 'Thailand',
    'TR': 'Turkey',
    'UA': 'Ukraine',
    'AE': 'United Arab Emirates',
    'GB': 'United Kingdom',
    'US': 'United States',
    'VN': 'Vietnam',
    
    // Alpha-3 codes for common countries
    'USA': 'United States',
    'GBR': 'United Kingdom',
    'CAN': 'Canada',
    'AUS': 'Australia',
    'DEU': 'Germany',
    'FRA': 'France',
    'JPN': 'Japan',
    'CHN': 'China',
    'IND': 'India',
    'BRA': 'Brazil',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'RUS': 'Russia',
    'MEX': 'Mexico',
    'ZAF': 'South Africa',
    'SAU': 'Saudi Arabia',
    'KOR': 'South Korea',
    'TUR': 'Turkey',
    'IDN': 'Indonesia',
    'NLD': 'Netherlands',
    'CHE': 'Switzerland',
    'SWE': 'Sweden',
    'POL': 'Poland',
    'IRN': 'Iran',
    'THA': 'Thailand',
    'EGY': 'Egypt',
    'UKR': 'Ukraine',
    'NGA': 'Nigeria',
    'ARG': 'Argentina',
    'PAK': 'Pakistan',
    'MYS': 'Malaysia',
    'VNM': 'Vietnam',
    'PHL': 'Philippines',
    'SGP': 'Singapore',
    'LBN': 'Lebanon',
    'IRQ': 'Iraq',
    'COL': 'Colombia'
  }
  
  // Try to get the country name, return the code as fallback
  return countryNames[code.toUpperCase()] || code
}
