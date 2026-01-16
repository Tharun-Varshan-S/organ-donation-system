export const MOCK_HOSPITAL_IMAGES = [
    'https://images.unsplash.com/photo-1587351021759-3e566b9af953?auto=format&fit=crop&q=80&w=1000', // Modern glass building
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000', // Large hospital complex
    'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=1000', // Blue glass facade
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000', // Medical center interior/exterior
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1000', // Clean white building
    'https://images.unsplash.com/photo-1516574187841-69301976e499?auto=format&fit=crop&q=80&w=1000', // General hospital
    'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?auto=format&fit=crop&q=80&w=1000', // Modern clinic
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1000'  // Default fallback
];

export const getHospitalImage = (hospital) => {
    // If hospital has a specific custom image (not the default one), use it
    if (hospital.image && !hospital.image.includes('unsplash.com')) {
        return hospital.image;
    }

    // Otherwise generate a deterministic mock image based on ID or Name
    const seed = hospital._id || hospital.name || 'default';

    // Simple hash function to get an index
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % MOCK_HOSPITAL_IMAGES.length;
    return MOCK_HOSPITAL_IMAGES[index];
};
