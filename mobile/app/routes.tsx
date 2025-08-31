import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Routes({ routes }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Routes</Text>
      <FlatList
        data={routes}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.routeItem}>
            <Text style={styles.routeText}>{item.start} → {item.destination}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No routes added yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  routeItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  routeText: {
    fontSize: 18,
  },
  empty: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 32,
  },
});
