import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
import { useRoutes } from "./RoutesContext";

export default function Index() {
  const router = useRouter();
  const { routes, swapRoute, deleteRoute } = useRoutes();
  return (
    <MenuProvider>
      <View style={styles.container}>
      <View style={styles.navBar}>
        <Text style={styles.navBarTitle}>Bus Routes</Text>
      </View>
      <View style={styles.listContainer}>
        {routes.length === 0 ? (
          <Text style={styles.emptyText}>No routes added yet.</Text>
        ) : (
          <FlatList
            data={routes}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View>
                <TouchableOpacity style={styles.routeRow} onPress={() => router.push({ pathname: '/route-details', params: { start: item.start, destination: item.destination } })}>
                  <Text style={styles.routeText}>{item.start} → {item.destination}</Text>
                  <View style={styles.iconButtons}>
                    <Menu>
                      <MenuTrigger>
                        <View style={styles.iconBtn}>
                          <MaterialIcons name="more-vert" size={24} color="#222" />
                        </View>
                      </MenuTrigger>
                      <MenuOptions customStyles={{
                        optionsContainer: {
                          padding: 8,
                          borderRadius: 8,
                        },
                        optionWrapper: {
                          padding: 8,
                        },
                      }}>
                        <MenuOption onSelect={() => {
                          swapRoute(index);
                        }}>
                          <Text style={{ fontSize: 16 }}>Swap</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => {
                          deleteRoute(index);
                        }}>
                          <Text style={{ fontSize: 16, color: '#ff3b30' }}>Delete</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  </View>
                </TouchableOpacity>
                {index < routes.length - 1 && <View style={styles.hr} />}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        )}
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add-route") }>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 0,
  },
  navBar: {
    width: '100%',
    backgroundColor: '#222',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  navBarTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
  hr: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
  },
  routeRow: {
    width: '98%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginLeft: '1%',
    marginRight: '1%',
  },
  iconButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginLeft: 4,
  },
  routeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'left',
    fontWeight: '500',
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#000",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});
