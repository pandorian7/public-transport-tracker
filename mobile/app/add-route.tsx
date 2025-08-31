import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRoutes } from "./RoutesContext";

const locations = ["Central Station", "Main Street", "Park Avenue", "River Side", "Airport"];

export default function AddRoute() {

  const router = useRouter();
  const { addRoute } = useRoutes();
  const [start, setStart] = useState(locations[0]);
  const [destination, setDestination] = useState(locations[1]);

  function handleSave() {
    addRoute({ start, destination });
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Start Location</Text>
      <Picker
        selectedValue={start}
        onValueChange={setStart}
        style={styles.picker}
      >
        {locations.map((loc) => (
          <Picker.Item label={loc} value={loc} key={loc} />
        ))}
      </Picker>
      <Text style={styles.label}>Destination</Text>
      <Picker
        selectedValue={destination}
        onValueChange={setDestination}
        style={styles.picker}
      >
        {locations.map((loc) => (
          <Picker.Item label={loc} value={loc} key={loc} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  picker: {
    width: 250,
    height: 50,
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
