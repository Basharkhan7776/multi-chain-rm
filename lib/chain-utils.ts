
/**
 * Helper to ensure chains have valid display names and images.
 * If API data is missing, falls back to generic defaults (Chain ID, Fallback Letter).
 */
export function getChainMetadata(
  chainUid: string,
  currentName?: string,
  currentImage?: string
) {
  // If name is present and not empty, use it. 
  // Otherwise, use the chain_uid as the display name (as requested by user).
  const display_name =
    currentName && currentName.trim() !== "" ? currentName : chainUid;

  // If image is present and not empty, use it.
  // Otherwise, return empty string. The UI (Avatar component) will handle the fallback (showing the initial letter).
  const chain_img =
    currentImage && currentImage.trim() !== "" ? currentImage : "";

  return {
    display_name,
    chain_img,
  };
}
