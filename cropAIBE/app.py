from flask_cors import CORS

from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import os

app = Flask(__name__)
CORS(app)


# Load trained model

MODEL_PATH = "model/crop_disease_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# Image settings (must match training)
IMG_SIZE = 128

# Class labels (AUTO from dataset folder)
CLASS_NAMES = sorted([
    d for d in os.listdir("dataset")
    if os.path.isdir(os.path.join("dataset", d))
])


def preprocess_image(image):
    image = image.resize((IMG_SIZE, IMG_SIZE))

    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route("/")
def home():
    return "CropAI BE is running!"

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["file"]
    image = Image.open(file).convert("RGB")
    image = preprocess_image(image)

    predictions = model.predict(image)
    predicted_class = CLASS_NAMES[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    return jsonify({
        "prediction": predicted_class,
        "confidence": round(confidence * 100, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)
