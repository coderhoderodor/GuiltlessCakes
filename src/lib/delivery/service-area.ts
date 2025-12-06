/**
 * Service Area Validation for Delivery
 *
 * Validates ZIP codes within 20 miles of Northeast Philadelphia (19136)
 * This covers most of Philadelphia and surrounding suburbs.
 */

// ZIP codes within approximately 20 miles of Northeast Philadelphia (19136)
// This includes Philadelphia, Bucks County, Montgomery County, Delaware County areas
export const SERVICE_AREA_ZIPS = new Set([
  // Philadelphia - Northeast
  '19111', '19114', '19115', '19116', '19120', '19124', '19135', '19136', '19137', '19149', '19152', '19154',
  // Philadelphia - North
  '19119', '19126', '19138', '19140', '19141', '19144', '19150',
  // Philadelphia - Center/Central
  '19102', '19103', '19104', '19106', '19107', '19121', '19122', '19123', '19125', '19130', '19132', '19133',
  // Philadelphia - South
  '19145', '19146', '19147', '19148',
  // Philadelphia - West
  '19104', '19131', '19139', '19142', '19143', '19151', '19153',
  // Bucks County (nearby)
  '19020', '19021', '19030', '19047', '19053', '19054', '19055', '19056', '19057',
  // Montgomery County (nearby)
  '19001', '19002', '19006', '19009', '19012', '19025', '19027', '19038', '19040', '19044', '19046', '19072', '19075', '19090', '19095',
  // Delaware County (nearby)
  '19013', '19014', '19015', '19018', '19022', '19023', '19026', '19029', '19032', '19033', '19036', '19050', '19063', '19064', '19074', '19078', '19079', '19081', '19082', '19083',
  // Camden County, NJ (across the river)
  '08002', '08003', '08004', '08007', '08009', '08010', '08012', '08021', '08026', '08030', '08031', '08033', '08034', '08035', '08043', '08049', '08059', '08078', '08081', '08083', '08084', '08089', '08099', '08101', '08102', '08103', '08104', '08105', '08106', '08107', '08108', '08109', '08110',
]);

/**
 * Check if a ZIP code is within the delivery service area
 */
export function isZipInServiceArea(zip: string): boolean {
  // Normalize ZIP code (remove spaces, take first 5 digits)
  const normalizedZip = zip.trim().slice(0, 5);
  return SERVICE_AREA_ZIPS.has(normalizedZip);
}

/**
 * Get a human-readable error message for ZIP validation
 */
export function getZipValidationError(zip: string): string | null {
  if (!zip || zip.length < 5) {
    return 'Please enter a valid 5-digit ZIP code';
  }

  if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) {
    return 'Please enter a valid ZIP code format';
  }

  if (!isZipInServiceArea(zip)) {
    return 'Sorry, we currently only deliver within 20 miles of Northeast Philadelphia. Please check back as we expand our delivery area.';
  }

  return null;
}

/**
 * Format delivery address for display
 */
export function formatDeliveryAddress(address: {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
}): string {
  const lines = [address.line1];
  if (address.line2) {
    lines.push(address.line2);
  }
  lines.push(`${address.city}, ${address.state} ${address.zip}`);
  return lines.join('\n');
}

/**
 * Calculate delivery fee based on subtotal
 */
export function calculateDeliveryFee(subtotal: number, freeMinimum: number = 50, fee: number = 8): number {
  return subtotal >= freeMinimum ? 0 : fee;
}
