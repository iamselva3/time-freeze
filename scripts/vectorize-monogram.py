import cv2
import numpy as np

img = cv2.imread('public/brand/logo-gold-monogram.png', cv2.IMREAD_UNCHANGED)
if img is None:
    raise Exception("Could not open public/brand/logo-gold-monogram.png")

alpha = img[:, :, 3]
h, w = alpha.shape

# Smooth slightly to remove pixelation
blurred = cv2.GaussianBlur(alpha, (3, 3), 0)
_, thresh = cv2.threshold(blurred, 120, 255, cv2.THRESH_BINARY)

# Find contours with hierarchy
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_TC89_KCOS)

paths = []
# Filter out tiny noise < 150 area
for i, c in enumerate(contours):
    area = cv2.contourArea(c)
    if area < 150:
        continue
    # simplify slightly
    epsilon = 0.0015 * cv2.arcLength(c, True)
    approx = cv2.approxPolyDP(c, epsilon, True)
    
    # build path
    pts = approx.reshape(-1, 2)
    d = f'M {pts[0][0]} {pts[0][1]}'
    for pt in pts[1:]:
        d += f' L {pt[0]} {pt[1]}'
    d += ' Z'
    paths.append(d)

combined_d = ' '.join(paths)

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" fill="none">
  <defs>
    <linearGradient id="goldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE095" />
      <stop offset="50%" stop-color="#E8C57A" />
      <stop offset="100%" stop-color="#C99F55" />
    </linearGradient>
    <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E8C57A" />
      <stop offset="50%" stop-color="#FFF6D6" />
      <stop offset="100%" stop-color="#C99F55" />
    </linearGradient>
  </defs>
  <path class="monogram-path" d="{combined_d}" fill="url(#goldLinear)" fill-rule="evenodd" stroke="url(#goldShine)" stroke-width="1.5" />
</svg>'''

with open('public/brand/logo-gold-monogram.svg', 'w') as f:
    f.write(svg_content)

print(f"Generated logo-gold-monogram.svg with {len(paths)} contour paths, dimensions {w}x{h}")
