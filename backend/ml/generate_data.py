import os
import random
import numpy as np
from PIL import Image

CLASSES = {
    "Black": (40, 40, 40),      # Dark Gray
    "Red": (180, 50, 40),       # Reddish
    "Sandy": (230, 210, 150),   # Yellowish/Sand
    "Alluvial": (120, 100, 70)  # Brown/Loam
}

DATASET_DIR = "backend/ml/dataset"
IMAGES_PER_CLASS = 30

def generate_noise_image(base_color):
    # Create an image with random noise variations of the base color
    arr = np.zeros((224, 224, 3), dtype=np.uint8)
    
    # Add noise
    for i in range(224):
        for j in range(224):
            noise = random.randint(-40, 40)
            r = max(0, min(255, base_color[0] + noise))
            g = max(0, min(255, base_color[1] + noise))
            b = max(0, min(255, base_color[2] + noise))
            arr[i, j] = [r, g, b]
        
    return Image.fromarray(arr)

def main():
    print("Generating synthetic soil dataset...")
    
    for class_name, color in CLASSES.items():
        folder = os.path.join(DATASET_DIR, class_name)
        if not os.path.exists(folder):
            os.makedirs(folder)
            
        print(f"Generating {IMAGES_PER_CLASS} images for {class_name}...")
        for i in range(IMAGES_PER_CLASS):
            img = generate_noise_image(color)
            img.save(os.path.join(folder, f"synthetic_{i}.jpg"))
            
    print("Dataset generation complete!")

if __name__ == "__main__":
    main()
