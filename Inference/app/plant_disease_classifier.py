import cv2
import numpy as np
import torch
import os
import json  # Importing json since it's used in the method

class PlantDiseaseClassifier:
    def __init__(self, model_path):
        # Initialize the model here
        self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path)

    def classify_image(self, image_path, output_path="./target_images", desired_filename="my_custom_results.json"):
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Image not found at {image_path}")
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            results = self.model(img)
            boxes = results.pandas().xyxy[0]

            predictions = []
            for index, row in boxes.iterrows():
                data = row.to_numpy()
                x_min, y_min, x_max, y_max, conf, class_name = data[:6]

                prediction = {
                    "disease_name": results.names[int(class_name)],
                    "confidence": conf,
                    "bounding_box": [x_min, y_min, x_max, y_max]
                }
                predictions.append(prediction)

                # Draw rectangle and text for each prediction
                cv2.rectangle(img, (int(x_min), int(y_min)), (int(x_max), int(y_max)), (255, 0, 0), 2)
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.6
                text_thickness = 2
                text_offset_x = 5
                text_offset_y = 15
                text_size, _ = cv2.getTextSize(results.names[int(class_name)], font, font_scale, text_thickness)
                text_x = int(x_min + text_offset_x)
                text_y = int(y_min - text_offset_y - text_size[1])
                cv2.putText(img, results.names[int(class_name)], (text_x, text_y), font, font_scale, (255, 0, 0), text_thickness)
                text_y += text_size[1] + 5
                cv2.putText(img, f"Confidence: {conf:.2f}", (text_x, text_y), font, font_scale, (255, 0, 0), text_thickness)

            # Save image in the specified output path
            output_image_path = os.path.join(output_path, "detected_image.jpg")
            cv2.imwrite(output_image_path, img)

            # Save predictions as JSON
            with open(os.path.join(output_path, desired_filename), 'w') as f:
                json.dump(predictions, f, indent=4)

            return predictions
        except Exception as e:
            print(f"An error occurred: {e}")
