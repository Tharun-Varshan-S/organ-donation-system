// Mock hospital images for the application
const hospitalImages = [
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
];

export const getHospitalImage = (hospitalId) => {
  // Use hospital ID to consistently return the same image for the same hospital
  const index = hospitalId ? hospitalId.length % hospitalImages.length : 0;
  return hospitalImages[index];
};

export default hospitalImages;