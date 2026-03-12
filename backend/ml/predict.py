import sys
import json
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'soil_model.pth')
CLASS_INDICES_PATH = os.path.join(os.path.dirname(__file__), 'class_indices.json')

def predict(image_path):
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        # Fallback Mock if user hasn't trained yet
        mock_response(image_path)
        return

    try:
        # 1. Setup Device
        device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

        # 2. Load Class Indices
        if not os.path.exists(CLASS_INDICES_PATH):
             raise Exception("Class indices file missing. Run train.py first.")
             
        with open(CLASS_INDICES_PATH, 'r') as f:
            class_indices = json.load(f)
        # Invert: {0: 'Black', 1: 'Red'}
        class_names = {v: k for k, v in class_indices.items()}
        num_classes = len(class_names)

        # 3. Load Model Structure
        model = models.resnet18(pretrained=False) # No need for ImageNet weights for inference
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, num_classes)
        
        # 4. Load Weights
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model = model.to(device)
        model.eval()

        # 5. Preprocess Image
        preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        img = Image.open(image_path).convert('RGB')
        img_tensor = preprocess(img).unsqueeze(0).to(device)

        # 6. Predict
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
            # Get top prediction
            top_prob, top_idx = torch.max(probabilities, 1)
            confidence = top_prob.item()
            predicted_index = top_idx.item()
            predicted_label = class_names[predicted_index]

            # Prepare debug scores
            all_scores = {class_names[i]: probabilities[0][i].item() for i in range(num_classes)}

            result = {
                "soil_type": predicted_label,
                "confidence": confidence,
                "all_scores": all_scores
            }
            
            print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

def mock_response(image_path):
    """
    Simulates ML prediction using simple color stats if model is missing
    """
    try:
        img = Image.open(image_path).resize((1, 1))
        color = img.getpixel((0, 0))
        r, g, b = color[0], color[1], color[2]
        
        # Simple heuristic fallback
        soil_type = "Alluvial"
        if r > g+20 and r > b+20: soil_type = "Red"
        elif r < 60 and g < 60 and b < 60: soil_type = "Black"
        elif r > 150 and g > 150 and b < 100: soil_type = "Sandy"
        
        print(json.dumps({
            "soil_type": soil_type,
            "confidence": 0.85, 
            "note": "Mock Mode (Run backend/ml/train.py to fix)"
        }))
    except:
        print(json.dumps({"soil_type": "Alluvial", "confidence": 0.5}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
    
    predict(sys.argv[1])
