
import time 
import serial 
import board 
import busio 
import joblib 
import requests 
import adafruit_ads1x15.ads1115 as ADS 
from adafruit_ads1x15.analog_in import AnalogIn 
import numpy as np 
import RPi.GPIO as GPIO 
import warnings 
 
# Suppress specific warning from sklearn related to feature names 
warnings.filterwarnings("ignore", category=UserWarning, message="X does not have valid 
feature names") 
 
# Set GPIO mode (BCM mode used) 
GPIO.setmode(GPIO.BCM) 
 
# Define GPIO pins 
BUZZER_PIN = 9    # Buzzer (BCM 8) 
MOTOR_PIN = 8   # DC Motor forward direction (BCM 10) 
 
# Set up GPIO pins 
GPIO.setup(BUZZER_PIN, GPIO.OUT) 
GPIO.setup(MOTOR_PIN, GPIO.OUT) 
Page 41 of 49 
 
 
# Initialize I2C for ADS1115 (MQ-3 Alcohol Sensor) 
i2c = busio.I2C(board.SCL, board.SDA) 
ads = ADS.ADS1115(i2c) 
chan = AnalogIn(ads, ADS.P0)  # Read from A0 pin (MQ-3 sensor) 
 
# ThingSpeak API settings 
THINGSPEAK_API_KEY = "LNKZVVBN4IK15IWW"  # Replace with your API Key 
THINGSPEAK_URL = "https://api.thingspeak.com/update" 
 
# Load trained ML model and scaler 
model = joblib.load("/home/pi/Desktop/codes/alcohol_detection_model.pkl") 
scaler = joblib.load("/home/pi/Desktop/codes/scaler.pkl") 
 
# Function to classify alcohol level using ML model 
def classify_alcohol_ml(voltage): 
    voltage_scaled = scaler.transform([[voltage]])  # Scale input 
    prediction = model.predict(voltage_scaled)[0]  # Predict label 
 
    if prediction == 2: 
        return "Alcohol", 1  # Alcohol detected, send 1 to field3 
    elif prediction == 1: 
        return "Mouthwash/Food", 0  # Not alcohol, send 0 
    else: 
        return "No Alcohol", 0  # No alcohol, send 0 
 
# Function to send data to ThingSpeak 
def send_to_thingspeak(voltage, status, alert_flag): 
Page 42 of 49 
 
    payload = { 
        "api_key": THINGSPEAK_API_KEY, 
        "field1": voltage,  # Voltage value 
        "field2": status,   # Alcohol status 
        "field3": alert_flag  # 1 if alcohol detected, 0 otherwise 
    } 
    try: 
        response = requests.get(THINGSPEAK_URL, params=payload) 
        if response.status_code == 200: 
            print("Data sent to ThingSpeak successfully!") 
        else: 
            print("Failed to send data to ThingSpeak.") 
    except Exception as e: 
        print(f"Error sending data: {e}") 
 
# Function to turn the buzzer on 
def buzzer_on(): 
    GPIO.output(BUZZER_PIN, GPIO.HIGH) 
    print("Buzzer ON") 
 
# Function to turn the buzzer off 
def buzzer_off(): 
    GPIO.output(BUZZER_PIN, GPIO.LOW) 
    print("Buzzer OFF") 
 
# Function to stop the motor (No forward movement) 
def motor_stop(): 
    GPIO.output(MOTOR_PIN, GPIO.HIGH) 
Page 43 of 49 
 
    print("Motor OFF - Vehicle stopped") 
 
# Function to run the motor in forward direction 
def motor_forward(): 
    GPIO.output(MOTOR_PIN, GPIO.LOW) 
    print("Motor ON - Vehicle moving forward") 
 
# Start motor at the beginning 
motor_forward() 
 
# Main loop 
try: 
    while True: 
        voltage = chan.voltage  # Read voltage from MQ-3 sensor 
        status, alert_flag = classify_alcohol_ml(voltage)  # Get classification & flag 
        output = f"Voltage: {voltage:.2f}V, Status: {status}, Alert: {alert_flag}" 
 
        print(output)  # Debug output 
 
        # Alcohol detection logic 
        if status == "Alcohol": 
            buzzer_on()   # Alert user 
            motor_stop()  # Stop the motor 
        else: 
            buzzer_off()  # No alert 
            motor_forward() # Keep the vehicle moving 
 
        # Send data to ThingSpeak 
Page 44 of 49 
 
        send_to_thingspeak(voltage, status, alert_flag) 
 
        time.sleep(5)  # Update interval 
 
except KeyboardInterrupt: 
    print("Stopping script") 
    GPIO.cleanup()  # Clean up GPIO
