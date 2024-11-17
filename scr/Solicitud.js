import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Button, StyleSheet, Alert, Image, Text, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { db, storage } from '../Firebase/FirebaseConfig';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';

export default function Solicitud(props) {
  const initialState = {
    docente_solicitante: '',
    area_conocimiento: '',
    asignatura: '',
    carrera: '',
    telefono: '',
    fechaUso: '',
    duracion: '',
    lab_disponible: '',
    Estado_lab: 'Disponible',
    motivo: '',
    imagen: null, // Inicialmente sin imagen
  };

  const [state, setState] = useState(initialState);
  const [laboratorios, setLaboratorios] = useState(['B5', 'A9', 'B4', 'E1']);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  const carreras = [
    "Ingeniería de Sistemas",
    "Arquitectura", 
    "Diseño Gráfico",
    "Informática Básica",
  ]; // Lista de opciones de carrera

  {/*const labsPorCarrera = {
    'Informática básica': ['B5', 'A9'],
    'Ingeniería de sistemas': ['B4'],
    'Arquitectura y diseño gráfico': ['E1'],
  };*/}

  {/*useEffect(() => {
    setLaboratorios(labsPorCarrera[state.carrera] || []);
  }, [state.carrera]);*/}

  const handleChangeText = (value, name) => {
    setState({ ...state, [name]: value });
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Se necesitan permisos para acceder a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setState({ ...state, imagen: result.assets[0].uri });
    }
  };

  const verificarDisponibilidad = async () => {
    const q = query(
      collection(db, 'Solicitud'),
      where('fechaUso', '==', state.fechaUso),
      where('lab_disponible', '==', state.lab_disponible)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Verifica si el laboratorio está disponible
  };

  const crearSolicitud = async () => {
    const { docente_solicitante, area_conocimiento, asignatura, carrera, telefono, fechaUso, duracion, lab_disponible, motivo, imagen } = state;

    if (!docente_solicitante || !area_conocimiento || !asignatura || !carrera || !telefono || !fechaUso || !duracion || !lab_disponible || !motivo || !imagen) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    const disponible = await verificarDisponibilidad();
    if (!disponible) {
      Alert.alert("Horario Ocupado", "Este horario ya ha sido reservado por otro docente.");
      return;
    }

    try {

      await addDoc(collection(db, 'Solicitud'), {
        ...state,
        Estado_lab: 'Asignado',
        id_solicitud: uuid.v4(),
      });

      Alert.alert("Éxito", "Solicitud creada con éxito.");

      // Restablecer los campos del formulario
    setState(initialState);
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al crear la solicitud.");
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setState({ ...state, fechaUso: date.toLocaleDateString() });
    hideDatePicker();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          
        <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
          {state.imagen ? (
            <Image source={{ uri: state.imagen }} style={styles.headerImage} />
          ) : (
            <Text style={styles.imagePlaceholder}>Agregar Imagen</Text>
          )}
        </TouchableOpacity>
      </View>

          <Text style={styles.title}>Solicitud de Laboratorios Informáticos</Text>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Docente"
              value={state.docente_solicitante}
              onChangeText={(value) => handleChangeText(value, 'docente_solicitante')}
              style={styles.input}
            />
          </View>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Área de Conocimiento"
              value={state.area_conocimiento}
              onChangeText={(value) => handleChangeText(value, 'area_conocimiento')}
              style={styles.input}
            />
          </View>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Asignatura"
              value={state.asignatura}
              onChangeText={(value) => handleChangeText(value, 'asignatura')}
              style={styles.input}
            />
          </View>

          <View style={styles.inputgroup}>
            <Picker
              selectedValue={state.carrera}
              style={styles.input}
              onValueChange={(value) => handleChangeText(value, 'carrera')}
            >
              <Picker.Item label="Selecciona carrera" value="" />
              {carreras.map((carrera) => (
                <Picker.Item key={carrera} label={carrera} value={carrera} />
              ))}
            </Picker>
          </View>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Teléfono"
              value={state.telefono}
              onChangeText={(value) => handleChangeText(value, 'telefono')}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity onPress={showDatePicker} style={styles.datePicker}>
            <Text style={styles.datePickerText}>
              {state.fechaUso ? `${state.fechaUso}` : 'Fecha de Uso'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Duración"
              value={state.duracion}
              onChangeText={(value) => handleChangeText(value, 'duracion')}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputgroup}>
            <Picker
              selectedValue={state.lab_disponible}
              style={styles.input}
              onValueChange={(value) => handleChangeText(value, 'lab_disponible')}
            >
              <Picker.Item label="Selecciona laboratorio" value="" />
              {laboratorios.map((lab) => (
                <Picker.Item key={lab} label={lab} value={lab} />
              ))}
            </Picker>
          </View>

          <View style={styles.inputgroup}>
          <TextInput
            placeholder="Motivo"
            value={state.motivo}
            onChangeText={(value) => handleChangeText(value, 'motivo')}
            style={styles.textArea}
            multiline
            numberOfLines={4}
          />
          </View>

          <Button title="Enviar Solicitud" onPress={crearSolicitud} style={styles.submitButton} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  inputgroup: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    width: '100%',
    height: 55,
    borderColor: '#fff',
    borderBottomWidth: 1,
    paddingLeft: 10,
    fontSize: 16,
  },
  datePicker: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 10,
  },
  submitButton: {
    marginTop: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#4A90E2',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 3,
    width: 180,
    height: 130,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePlaceholder: {
    fontSize: 14,
    color: '#aaa',
  },
  textArea: {
    width: '100%',
    height: 100,
    borderBottomWidth: 1,
    padding: 10,
    fontSize: 14,
    borderColor: '#fff',
    textAlignVertical: 'top',
  },
});
