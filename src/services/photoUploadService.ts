import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not supported. Allowed: JPEG, PNG, WebP, GIF` };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }
  
  return { valid: true };
};

/**
 * Upload team member photo to Firebase Storage
 * @param file - Image file to upload
 * @param memberId - Team member ID (or 'temp' for new members)
 * @returns Promise resolving to the public download URL
 */
export const uploadTeamMemberPhoto = async (
  file: File,
  memberId: string
): Promise<string> => {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file');
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `team-photos/${memberId}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading team member photo:', error);
    throw new Error(error.message || 'Failed to upload photo');
  }
};

/**
 * Delete a photo from Firebase Storage
 * @param photoUrl - The Firebase Storage URL of the photo to delete
 */
export const deleteTeamMemberPhoto = async (photoUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    // Firebase Storage URLs look like: https://firebasestorage.googleapis.com/v0/b/.../o/team-photos%2F...?alt=media
    const url = new URL(photoUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      console.warn('Could not extract path from photo URL:', photoUrl);
      return;
    }
    
    // Decode the path (Firebase Storage URLs are URL-encoded)
    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);
    
    await deleteObject(storageRef);
  } catch (error: any) {
    // Don't throw error if file doesn't exist or is already deleted
    if (error.code !== 'storage/object-not-found') {
      console.error('Error deleting team member photo:', error);
      throw error;
    }
  }
};

/**
 * Create a preview URL from a file (for display before upload)
 * @param file - Image file
 * @returns Promise resolving to a data URL
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
