export const SOUTHWEST_STATES = ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'];
export const MAJOR_CITIES = ['Abuja', 'Port Harcourt', 'Ibadan'];

/**
 * Calculates volumetric weight from LxWxH string
 */
export const calculateVolumetricWeight = (dimensions?: string) => {
  if (!dimensions || typeof dimensions !== 'string') return 0;
  // Expected format: 10x20x30 or 10 x 20 x 30
  const parts = dimensions.toLowerCase().split('x').map(p => parseFloat(p.trim()));
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  // Standard divisor is 5000
  return (parts[0] * parts[1] * parts[2]) / 5000;
};

/**
 * Calculates total weights for an order
 */
export const calculateOrderWeights = (items: { weight?: string; dimensions?: string; quantity: number }[]) => {
  let totalActualWeight = 0;
  let totalVolumetricWeight = 0;

  items.forEach(item => {
    const qty = item.quantity || 1;
    const weight = parseFloat(item.weight || '0') || 0;
    const volWeight = calculateVolumetricWeight(item.dimensions);
    
    totalActualWeight += weight * qty;
    totalVolumetricWeight += volWeight * qty;
  });

  return { totalActualWeight, totalVolumetricWeight };
};

/**
 * Determines the shipping fee based on location and chargeable weight
 */
export const getShippingFee = (
  country: string,
  state: string,
  city: string,
  actualWeight: number,
  volumetricWeight: number
) => {
  if (country !== 'Nigeria') return 25000;

  // Chargeable weight is the higher of actual vs volumetric
  // Minimum chargeable weight is 1kg
  const chargeableWeight = Math.max(actualWeight, volumetricWeight, 1);
  const roundedWeight = Math.ceil(chargeableWeight);

  let baseFeePerKg = 4500; // Default Zone 3 (Remote)

  const cityLower = (city || '').toLowerCase().trim();
  const isMajorCity = MAJOR_CITIES.some(c => cityLower.includes(c.toLowerCase()));
  const isSouthwest = SOUTHWEST_STATES.includes(state);

  // Zone Logic
  if (isMajorCity) {
    baseFeePerKg = 4500; // Zone 2: Major Cities
  } else if (isSouthwest) {
    baseFeePerKg = 2000; // Zone 1: Lagos and Southwest
  } else {
    baseFeePerKg = 4500; // Zone 3: Remote/Others
  }

  return baseFeePerKg * roundedWeight;
};

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
].map(name => ({ name }));
