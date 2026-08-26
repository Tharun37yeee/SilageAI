import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

os.makedirs("static/sample_images", exist_ok=True)

def generate_corn_silage(filename, mode="safe"):
    """
    Generates realistic silage imagery with distinct visual cues:
    - 'safe': golden-olive chopped corn, yellow kernels, clean green-tan fibers
    - 'moldy_bunker': visible white mycelium patches & blue-green Penicillium mold colonies
    - 'clostridial_wet': dark olive-brown wet appearance with uniform texture
    - 'caramelized_heat': tobacco brown / dark caramel heat-damaged patches
    - 'slimy_rot': dark blackish-brown slimy decomposed bunker bottom
    """
    width, height = 640, 480
    img = Image.new("RGB", (width, height), (70, 75, 45))
    draw = ImageDraw.Draw(img)
    random.seed(42)

    # Base texture: chopped forage fibers
    base_colors = {
        "safe": [(130, 140, 60), (160, 170, 75), (180, 185, 90), (110, 120, 50), (195, 180, 80)],
        "moldy_bunker": [(110, 120, 55), (140, 145, 65), (150, 155, 75), (95, 105, 45), (160, 150, 70)],
        "clostridial_wet": [(85, 95, 40), (105, 115, 50), (120, 125, 55), (75, 80, 35), (95, 100, 45)],
        "caramelized_heat": [(120, 80, 45), (145, 95, 50), (160, 110, 60), (95, 60, 35), (175, 125, 70)],
        "slimy_rot": [(60, 65, 35), (75, 80, 40), (45, 50, 25), (40, 35, 25), (90, 85, 45)],
    }[mode]

    # Draw dense chopped fiber strands
    for _ in range(8000):
        x = random.randint(0, width)
        y = random.randint(0, height)
        length = random.randint(15, 45)
        angle = random.uniform(0, math.pi)
        dx = int(length * math.cos(angle))
        dy = int(length * math.sin(angle))
        color = random.choice(base_colors)
        thickness = random.randint(2, 5)
        draw.line([(x, y), (x + dx, y + dy)], fill=color, width=thickness)

    # Draw chopped corn kernels
    kernel_colors = [(235, 195, 50), (245, 215, 65), (210, 170, 40), (250, 225, 80)]
    if mode == "caramelized_heat":
        kernel_colors = [(180, 130, 45), (195, 145, 55), (160, 110, 35)]
    elif mode == "slimy_rot":
        kernel_colors = [(130, 120, 50), (110, 100, 40), (90, 85, 35)]

    for _ in range(350):
        kx = random.randint(20, width - 20)
        ky = random.randint(20, height - 20)
        kw = random.randint(8, 16)
        kh = random.randint(6, 12)
        k_col = random.choice(kernel_colors)
        draw.ellipse([kx - kw//2, ky - kh//2, kx + kw//2, ky + kh//2], fill=k_col)

    # Specific visual cues according to mode
    if mode == "moldy_bunker":
        # White fuzzy mold patches (Mucor / Geotrichum)
        for center_x, center_y, radius in [(220, 180, 75), (380, 240, 95), (490, 150, 60), (140, 340, 70)]:
            for _ in range(300):
                r = random.uniform(0, radius)
                theta = random.uniform(0, 2 * math.pi)
                px = int(center_x + r * math.cos(theta))
                py = int(center_y + r * math.sin(theta))
                intensity = random.randint(215, 250)
                draw.ellipse([px-4, py-4, px+4, py+4], fill=(intensity, intensity, intensity - 10))
        
        # Blue-green mold colonies (Penicillium roqueforti)
        for center_x, center_y, radius in [(360, 260, 50), (240, 160, 40)]:
            for _ in range(200):
                r = random.uniform(0, radius)
                theta = random.uniform(0, 2 * math.pi)
                px = int(center_x + r * math.cos(theta))
                py = int(center_y + r * math.sin(theta))
                draw.ellipse([px-3, py-3, px+3, py+3], fill=(random.randint(60, 110), random.randint(140, 180), random.randint(130, 170)))

    elif mode == "caramelized_heat":
        # Dark brown caramelized heat band (Maillard reaction)
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        o_draw = ImageDraw.Draw(overlay)
        for i in range(120):
            cy = 200 + int(40 * math.sin(i * 0.05))
            cx = i * 6
            o_draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(70, 35, 15, 110))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    elif mode == "slimy_rot":
        # Dark blackish decomposed anaerobic patch
        overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        o_draw = ImageDraw.Draw(overlay)
        for _ in range(500):
            rx = random.randint(180, 500)
            ry = random.randint(200, 420)
            o_draw.ellipse([rx-25, ry-20, rx+25, ry+20], fill=(25, 28, 18, 140))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)

    # Slight blur to blend naturally
    img = img.filter(ImageFilter.GaussianBlur(radius=0.7))
    img.save(os.path.join("static/sample_images", filename), quality=92)
    print(f"Generated {filename}")

if __name__ == "__main__":
    generate_corn_silage("sample_safe_silage.jpg", "safe")
    generate_corn_silage("sample_moldy_bunker.jpg", "moldy_bunker")
    generate_corn_silage("sample_clostridial_wet.jpg", "clostridial_wet")
    generate_corn_silage("sample_caramelized_heat.jpg", "caramelized_heat")
    generate_corn_silage("sample_slimy_rot.jpg", "slimy_rot")
    print("All sample images generated successfully!")
