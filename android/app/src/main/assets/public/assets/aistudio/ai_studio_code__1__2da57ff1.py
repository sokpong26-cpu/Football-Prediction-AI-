import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


class OutcomePredictor:

  def __init__(self, model_file="prediction_model.pkl"):
    self.model_file = model_file
    self.scaler = StandardScaler()
    self.model = RandomForestClassifier(
        n_estimators=100, max_depth=5, random_state=42
    )

  def train(self, X: pd.DataFrame, y: pd.Series):
    """Preprocess data, train the model, and evaluate accuracy."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Fit scaler and transform features
    X_train_scaled = self.scaler.fit_transform(X_train)
    X_test_scaled = self.scaler.transform(X_test)

    # Train model
    self.model.fit(X_train_scaled, y_train)

    # Evaluate
    predictions = self.model.predict(X_test_scaled)
    acc = accuracy_score(y_test, predictions)
    print(f"Model trained successfully. Validation Accuracy: {acc:.2%}")
    print("\nDetailed Report:\n", classification_report(y_test, predictions))

    # Save trained assets
    joblib.dump({"model": self.model, "scaler": self.scaler}, self.model_file)
    print(f"Artifacts saved to {self.model_file}")

  def predict_probability(self, features: np.ndarray) -> dict:
    """Load model and output outcome probability."""
    saved_data = joblib.load(self.model_file)
    model = saved_data["model"]
    scaler = saved_data["scaler"]

    scaled_features = scaler.transform(features)
    probabilities = model.predict_proba(scaled_features)[0]

    return {
        "predicted_label": int(model.predict(scaled_features)[0]),
        "probability_win": float(probabilities[1]),
        "probability_loss": float(probabilities[0]),
    }


# ==========================================
# Example Usage: Training and Predicting
# ==========================================
if __name__ == "__main__":
  # 1. Generate synthetic historical metrics for illustration
  np.random.seed(42)
  samples = 500

  # Example features: [recent_form, defense_index, attack_efficiency, rest_days]
  X_sample = pd.DataFrame({
      "recent_form": np.random.uniform(0.1, 1.0, samples),
      "defense_index": np.random.uniform(10, 50, samples),
      "attack_efficiency": np.random.uniform(1.0, 5.0, samples),
      "rest_days": np.random.randint(1, 10, samples),
  })

  # Binary target: 1 = Win, 0 = Loss
  y_sample = (
      (
          X_sample["recent_form"] * 2
          + X_sample["attack_efficiency"]
          - (X_sample["defense_index"] / 20)
      )
      > 2.5
  ).astype(int)

  # 2. Train the system
  pipeline = OutcomePredictor()
  pipeline.train(X_sample, y_sample)

  # 3. Predict on a new upcoming match or scenario
  new_event = np.array([[0.85, 22.0, 4.2, 5]])  # High form and efficiency
  result = pipeline.predict_probability(new_event)

  print("\n--- Prediction Result ---")
  print(f"Win Probability: {result['probability_win']:.2%}")
  print(f"Loss Probability: {result['probability_loss']:.2%}")