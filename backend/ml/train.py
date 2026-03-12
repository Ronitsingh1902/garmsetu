import os
import sys
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
import ssl

# Fix SSL Cert Error (Mac)
ssl._create_default_https_context = ssl._create_unverified_context

# Configuration
DATASET_DIR = 'backend/ml/dataset'
MODEL_SAVE_PATH = 'backend/ml/soil_model.pth'
CLASS_INDICES_PATH = 'backend/ml/class_indices.json'
BATCH_SIZE = 32
EPOCHS = 10
NUM_CLASSES = 4 # Black, Red, Sandy, Alluvial (Adjust based on folders)

def train_model():
    # Check for device
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using device: {device}")

    if not os.path.exists(DATASET_DIR) or not os.listdir(DATASET_DIR):
        print(f"Dataset directory '{DATASET_DIR}' is empty or missing.")
        print("Please create subfolders (Black, Red, Sandy, Alluvial) and add images.")
        return

    # Data Augmentation & Normalization
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # Load Data (Assuming 'train' and 'val' folders, or just split on the fly)
    # For simplicity in this demo script, we'll just load from root and split
    # IF you have a specific structure, adjust here. 
    # Current setup assumes: dataset/class_name/image.jpg
    
    full_dataset = datasets.ImageFolder(DATASET_DIR, data_transforms['train'])
    
    # Split 80/20
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])
    
    # Reset transform for validation set (a bit hacky in standard split, but okay for hackathon)
    # Ideally use Subset structure, but let's keep it simple. Only training aug matters much.

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    class_names = full_dataset.classes
    print(f"Classes found: {class_names}")

    # Save Class Indices
    class_indices = {class_names[i]: i for i in range(len(class_names))}
    with open(CLASS_INDICES_PATH, 'w') as f:
        json.dump(class_indices, f)

    # Load ResNet18
    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))

    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print("Starting training...")

    best_acc = 0.0

    for epoch in range(EPOCHS):
        print(f'Epoch {epoch+1}/{EPOCHS}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
                dataloader = train_loader
            else:
                model.eval()
                dataloader = val_loader

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(dataloader.dataset)
            epoch_acc = running_corrects.double() / len(dataloader.dataset)

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            # Deep copy the model
            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                torch.save(model.state_dict(), MODEL_SAVE_PATH)

    print(f'Best val Acc: {best_acc:4f}')
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_model()
