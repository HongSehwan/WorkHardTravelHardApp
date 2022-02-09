import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
const STORAGE_KEY = "@toDos";
const WORK_KEY = "@currentWork";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [done, setDone] = useState(false);
  const [modify, setModify] = useState(false);
  const travel = () => saveTab(false);
  const work = () => saveTab(true);
  const modifyBtn = () => setModify(true);
  const modifyCancelBtn = () => {
    setModify(false);
    setText("");
  };
  const onChangeText = (payload) => setText(payload);
  const modiFyText = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      alert(err);
    }
  };
  const loadToDos = async () => {
    try {
      const loadText = await AsyncStorage.getItem(STORAGE_KEY);
      if (loadText) {
        setToDos(JSON.parse(loadText));
      }
    } catch (err) {
      alert(err);
    }
  };
  const saveTab = async (saveData) => {
    setWorking(saveData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  };
  const currentTab = async () => {
    try {
      const workData = await AsyncStorage.getItem(WORK_KEY);
      if (workData) {
        setToDos(JSON.parse(workData));
      }
    } catch (err) {
      alert(err);
      working(true);
    }
  };
  const doneTodo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  useEffect(() => {
    loadToDos();
    currentTab();
    // modifyToDo();
  }, []);
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, modify, done },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const modifyToDo = async (key) => {
    try {
      if (editText === "") {
        return;
      }

      const newToDos = { ...toDos };
      setEditText(newToDos[key].text);
      newToDos[key].text = editText;
      setToDos(newToDos);
      await saveToDos(newToDos);
      setEditText("");
      setModify(false);
      console.log(toDos);
    } catch (err) {
      alert(err);
    }
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      {
        text: "OK",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
      { text: "Cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        returnKeyType="send"
        value={text}
        onChangeText={onChangeText}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {modify === true ? (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    onSubmitEditing={() => modifyToDo(key)}
                    returnKeyType="send"
                    onChangeText={modiFyText}
                    style={styles.modify}
                    placeholder={toDos[key].text}
                  ></TextInput>
                  <TouchableOpacity onPress={modifyCancelBtn}>
                    <MaterialIcons name="cancel" size={20} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {toDos[key].done ? (
                    <Text style={styles.doneText}>{toDos[key].text}</Text>
                  ) : (
                    <Text style={styles.toDoText}>{toDos[key].text}</Text>
                  )}
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        doneTodo(key);
                      }}
                    >
                      {toDos[key].done ? (
                        <Fontisto
                          name="checkbox-active"
                          size={20}
                          color={theme.grey}
                        />
                      ) : (
                        <Fontisto
                          name="checkbox-passive"
                          size={20}
                          color={theme.grey}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modifyBtn}>
                    <TouchableOpacity onPress={modifyBtn}>
                      <MaterialIcons
                        name="published-with-changes"
                        size={20}
                        color={theme.grey}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    width: 280,
    fontSize: 16,
    fontWeight: "500",
  },
  modify: {
    backgroundColor: "white",
    paddingVertical: 3,
    paddingHorizontal: 10,
    width: 230,
    marginVertical: 5,
    borderRadius: 5,
    marginRight: 60,
  },
  doneText: {
    color: "#848480",
    width: 280,
    fontSize: 16,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
});
