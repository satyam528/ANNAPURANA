function uploadImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];

  if (!file) {
    alert("Please select an image");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);   // MUST be "file"

  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("result").innerText =
      "Prediction: " + data.prediction +
      " | Confidence: " + data.confidence + "%";
  })
  .catch(error => {
    alert("Server error");
    console.error(error);
  });
}
