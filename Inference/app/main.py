import sys
import json
from plant_disease_classifier import PlantDiseaseClassifier

if len(sys.argv) < 2:
    print("Usage: python main.py <image_path>")
    sys.exit(1)

model_path = 'C:/Users/0x_negm/OneDrive/Desktop/Graduation Project/gradPro404/Inference/app/best.pt'
image_path = sys.argv[1]  

classifier = PlantDiseaseClassifier(model_path)
predictions = classifier.classify_image(image_path)

# Output results as JSON
print(json.dumps(predictions))