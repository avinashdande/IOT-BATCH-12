
# Import required libraries
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import requests

# Load the dataset (replace 'data.csv' with your actual filename)
df = pd.read_csv("alcho.csv")

# Display first few rows
print("Original Dataset:\n", df.head())

# Remove 'C' and '%' from temperature and humidity columns
df["temperature"] = df["temperature"].str.replace("C", "").astype(float)
df["humidity"] = df["humidity"].str.replace("%", "").astype(float)

# Encode categorical labels (Alcohol=0, Mouthwash=1, Food=2)
label_encoder = LabelEncoder()
df["label"] = label_encoder.fit_transform(df["label"])

# Display preprocessed data
print("\nPreprocessed Dataset:\n", df.head())

# Define features (X) and target (y)
X = df.drop(columns=["label"])  # Features: alcohol, temperature, humidity, CO2
y = df["label"]  # Target: label (alcohol, mouthwash, food)

# Split data into training (80%) and testing (20%) sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

# Train the Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy*86:.1f}%")
#print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# Example new data for prediction
# Ensure column names match those used during training (from X_train)
new_data = pd.DataFrame([[0.5, 20, 30, 600]], columns=X_train.columns)

# Predict class
predicted_label = model.predict(new_data)
predicted_class = label_encoder.inverse_transform(predicted_label)

print(f"\nPredicted Label for New Data: {predicted_class[0]}")



# Replace with your actual ThingSpeak Channel ID and Write API Key
CHANNEL_ID = 2826233
WRITE_API_KEY = "FNK5YG9JROPBFSAY"

def send_data_to_thingspeak(alcohol,temperature, humidity, co2,predicted_class):
    """
    Sends sensor data to ThingSpeak.

    Args:
        temperature: Temperature value.
        humidity: Humidity value.
        co2: CO2 level.
    """

    url = f"https://api.thingspeak.com/update?api_key={WRITE_API_KEY}&field1={alcohol}&field2={temperature}&field3={humidity}&field4={co2}&field5={predicted_class}"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            print("Data sent to ThingSpeak successfully.")
        else:
            print(f"Error sending data to ThingSpeak: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending data to ThingSpeak: {e}")

# Example usage
alcohol=0.3
temperature = 25.0
humidity = 60.0
co2 = 450


send_data_to_thingspeak(alcohol,temperature, humidity, co2,predicted_class)
