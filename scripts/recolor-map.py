"""
Recolor a black-and-white equirectangular Earth map with Compassion Course logo colors.

Source: earth-water.png (black = land, white = ocean)
Output: earth-custom.jpg

Color mapping:
  - Land (black) → vanilla off-white #fffdf0
  - Ocean (white) → very light blue #dbeefb
  - Coastlines (edges) → gold/brown line #c4a435 (warm brownish-gold)
"""

from PIL import Image, ImageFilter
import numpy as np
import os

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
SOURCE = os.path.join(PROJECT_ROOT, "node_modules", "three-globe", "example", "img", "earth-water.png")
OUTPUT = os.path.join(PROJECT_ROOT, "public", "textures", "earth-custom.jpg")

# Logo colors
LAND_COLOR = np.array([255, 253, 240], dtype=np.uint8)    # #fffdf0 vanilla off-white
OCEAN_COLOR = np.array([219, 238, 251], dtype=np.uint8)   # #dbeefb very light blue
COAST_COLOR = np.array([196, 164, 53], dtype=np.uint8)    # #c4a435 warm brownish-gold

def main():
    print(f"Loading source: {SOURCE}")
    img = Image.open(SOURCE).convert("L")  # grayscale
    print(f"  Size: {img.size}")

    # Upscale to 4096x2048 for crisp detail
    target_size = (4096, 2048)
    if img.size != target_size:
        print(f"  Resizing to {target_size}...")
        img = img.resize(target_size, Image.LANCZOS)

    arr = np.array(img, dtype=np.float32)  # 0–255

    # Threshold: below 128 = land, above 128 = ocean
    # Create a smooth mask (0 = land, 1 = ocean)
    land_mask = (arr < 128).astype(np.float32)   # 1 where land
    ocean_mask = 1.0 - land_mask                   # 1 where ocean

    # Edge detection for coastlines using Sobel-like approach
    # Use a slight blur then detect transitions
    blurred = np.array(img.filter(ImageFilter.GaussianBlur(radius=1.5)).resize(target_size, Image.LANCZOS), dtype=np.float32)

    # Actually, work with the already-resized image
    img_resized = img
    blurred_img = img_resized.filter(ImageFilter.GaussianBlur(radius=1.5))
    blurred = np.array(blurred_img, dtype=np.float32)

    # Compute gradient magnitude (Sobel-like)
    # Horizontal gradient
    gx = np.zeros_like(blurred)
    gx[:, 1:-1] = blurred[:, 2:] - blurred[:, :-2]
    # Handle wrap-around (equirectangular wraps horizontally)
    gx[:, 0] = blurred[:, 1] - blurred[:, -1]
    gx[:, -1] = blurred[:, 0] - blurred[:, -2]

    # Vertical gradient
    gy = np.zeros_like(blurred)
    gy[1:-1, :] = blurred[2:, :] - blurred[:-2, :]
    gy[0, :] = blurred[1, :] - blurred[0, :]
    gy[-1, :] = blurred[-1, :] - blurred[-2, :]

    gradient = np.sqrt(gx**2 + gy**2)
    gradient = gradient / (gradient.max() + 1e-6)  # normalize to 0-1

    # Create coastline mask: strong gradient = coastline
    # Use a threshold that captures just the edges
    coast_mask = np.clip(gradient * 4.0, 0, 1)  # amplify and clip
    # Make coastlines thinner by raising the threshold
    coast_mask = np.where(coast_mask > 0.3, coast_mask, 0)

    # Dilate coastlines slightly for visibility (2px)
    coast_pil = Image.fromarray((coast_mask * 255).astype(np.uint8))
    coast_pil = coast_pil.filter(ImageFilter.MaxFilter(3))  # dilate by 1px radius
    coast_mask = np.array(coast_pil, dtype=np.float32) / 255.0

    print(f"  Coast pixels (>0.1): {np.sum(coast_mask > 0.1)}")

    # Build output image
    h, w = arr.shape
    output = np.zeros((h, w, 3), dtype=np.float32)

    # Start with land/ocean base colors
    for c in range(3):
        output[:, :, c] = (
            land_mask * LAND_COLOR[c] +
            ocean_mask * OCEAN_COLOR[c]
        )

    # Overlay coastline color
    for c in range(3):
        output[:, :, c] = (
            output[:, :, c] * (1 - coast_mask) +
            COAST_COLOR[c] * coast_mask
        )

    # Clamp and convert
    output = np.clip(output, 0, 255).astype(np.uint8)

    # Save
    result = Image.fromarray(output, "RGB")
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    result.save(OUTPUT, "JPEG", quality=95)
    print(f"  Saved: {OUTPUT}")
    print(f"  File size: {os.path.getsize(OUTPUT) / 1024:.0f} KB")
    print("Done!")

if __name__ == "__main__":
    main()
