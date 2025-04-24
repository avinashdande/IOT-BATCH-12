import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const WeatherApp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://backendiot-1.onrender.com/api/getThingSpeakData");
        const sortedData = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setData(sortedData);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#000" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <LinearGradient
      colors={["#000000", "#64fdf6"]} // Gradient colors
      style={styles.container}
    >
      {/* Location and Settings Icon */}
      <View style={styles.header}>
        <Text style={styles.location}>AlcoShield</Text>
      </View>

      {data.length > 0 && (
        <>
          {/* Alcohol Level and Temperature */}
          <View style={styles.dataContainer}>
            <Text style={styles.temperature}>{data[0].alcoholLevel}</Text>
            <Text style={styles.weatherText}>Alcohol Level</Text>
            <Text style={styles.timestamp}>Time: {new Date(data[0].timestamp).toLocaleString()}</Text>
            <Text style={styles.det}>Status -  {data[0].temperature}</Text>
          </View>

          {/* Forecast Table */}
          <View style={styles.forecastContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>Time</Text>
              <Text style={styles.headerText}>Alcohol</Text>
              <Text style={styles.headerText}>Status</Text>
            </View>

            {/* Table Rows */}
            {data.slice(1, 4).map((entry, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cellText}>{new Date(entry.timestamp).toLocaleTimeString()}</Text>
                <Text style={styles.cellText}>{entry.alcoholLevel}</Text>
                <Text style={styles.cellText}>{entry.temperature}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
  },
  location: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dataContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  temperature: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  weatherText: {
    fontSize: 18,
    color: "white",
    marginTop: 10,
  },
  timestamp: {
    fontSize: 16,
    color: "white",
    marginTop: 50,
  },
  det: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginTop: 50,
  },
  forecastContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
    marginTop: 100,
    width: "90%",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "white",
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  cellText: {
    color: "white",
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default WeatherApp;
