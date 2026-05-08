import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

interface PartyOption {
  id: string;
  name: string;
}

export default function PartySelector() {
  const [search, setSearch] = useState("");
  const [parties, setParties] = useState<PartyOption[]>([]);
  const [selected, setSelected] = useState<PartyOption | null>(null);

  useEffect(() => {
    const data: PartyOption[] = [
      { id: "1", name: "Manoj Kumar" },
      { id: "2", name: "Anuj Thakur" },
      { id: "3", name: "Sunil Kumar" },
      { id: "4", name: "Ajay Kumar" },
    ];

    setParties(data);
  }, []);

  const filtered = parties.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Party</Text>

      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <View style={styles.dropdown}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.item}
              onPress={() => setSelected(item)}
            >
              <Text>{item.name}</Text>
            </Pressable>
          )}
        />
      </View>

      {selected && (
        <Text style={styles.selected}>Selected: {selected.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 220,
    elevation: 3,
  },
  item: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  selected: {
    marginTop: 8,
    color: "green",
  },
});
