import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Alert, Button } from 'react-native';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebase/FirebaseConfig';
import { Picker } from '@react-native-picker/picker';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function ListSolicitud(props) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [editableData, setEditableData] = useState({});

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  const laboratorios = ['B5', 'A9', 'B4', 'E1'];

  const carreras = [
    "Ingeniería de Sistemas",
    "Arquitectura", 
    "Diseño Gráfico",
    "Informática Básica",
  ];

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toLocaleDateString('es-ES');
    setEditableData({ ...editableData, fechaUso: formattedDate });
    hideDatePicker();
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
      setEditableData({ ...editableData, imagen: result.assets[0].uri });
    }
  };
  

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Solicitud'), (querySnapshot) => {
      const listaSolicitudes = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listaSolicitudes.push({ id_solicitud: doc.id, ...data });
      });
  
      setSolicitudes(listaSolicitudes);
    }, (error) => {
      console.error('Error al obtener solicitudes en tiempo real:', error);
    });

    return () => unsubscribe();

  }, []);

  const openMenu = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedSolicitud(null);
  };

  const openEditModal = () => {
    if (selectedSolicitud) {
      setEditableData({ ...selectedSolicitud });
      setEditModalVisible(true);
    }
    closeMenu();
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditableData({});
  };

  const actualizarSolicitud = async () => {
    if (!editableData.id_solicitud) {
      Alert.alert("Error", "No se seleccionó ninguna solicitud para actualizar.");
      return;
    }
  
    try {
      const solicitudRef = doc(db, 'Solicitud', editableData.id_solicitud);
      const docSnap = await getDoc(solicitudRef);
  
      if (!docSnap.exists()) {
        Alert.alert("Error", "El documento no existe.");
        return;
      }
  
      await updateDoc(solicitudRef, editableData);
      setSolicitudes((prevSolicitudes) =>
        prevSolicitudes.map((solicitud) =>
          solicitud.id_solicitud === editableData.id_solicitud
            ? { ...editableData }
            : solicitud
        )
      );
      Alert.alert("Éxito", "Solicitud actualizada con éxito.");
      closeEditModal();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar la solicitud.");
    }
  };
  

  const EliminarSolicitud = async (id_solicitud) => {
    try {
      const solicitudRef = doc(db, 'Solicitud', id_solicitud);
      const docSnap = await getDoc(solicitudRef);
  
      if (!docSnap.exists()) {
        Alert.alert("Error", "El documento no existe.");
        return;
      }
  
      await deleteDoc(solicitudRef);
      setSolicitudes(solicitudes.filter((s) => s.id_solicitud !== id_solicitud));
      Alert.alert("Éxito", "Solicitud eliminada con éxito.");
      closeMenu();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo eliminar la solicitud.");
    }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {solicitudes.map((solicitud) => (
          <TouchableOpacity
            key={solicitud.id_solicitud}
            style={styles.solicitudContainer}
          > 
          <View style={styles.header}>
          <TouchableOpacity style={styles.icon} onPress={() => openMenu(solicitud)}>
                <AntDesign name="ellipsis1" size={24} color="#555" />
              </TouchableOpacity>
            </View>

           {solicitud.imagen && (
              <Image source={{ uri: solicitud.imagen }} style={styles.imagen} />
            )}
             
              <Text style={styles.titulo}>Solicitante: {solicitud.docente_solicitante}</Text>

            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Área de Conocimiento:</Text>
              <Text style={styles.descripcion}>{solicitud.area_conocimiento}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Asignatura:</Text>
              <Text style={styles.descripcion}>{solicitud.asignatura}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Carrera:</Text>
              <Text style={styles.descripcion}>{solicitud.carrera}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Teléfono:</Text>
              <Text style={styles.descripcion}>{solicitud.telefono}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Fecha:</Text>
              <Text style={styles.descripcion}>{solicitud.fechaUso}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Duración:</Text>
              <Text style={styles.descripcion}>{solicitud.duracion} horas</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Laboratorio Disponible:</Text>
              <Text style={styles.descripcion}>{solicitud.lab_disponible}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Estado del Laboratorio:</Text>
              <Text style={styles.descripcion}>{solicitud.Estado_lab}</Text>
            </View>
            <View style={styles.seccion}>
              <Text style={styles.subtitulo}>Motivo:</Text>
              <Text style={styles.descripcion}>{solicitud.motivo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Botón para agregar una nueva solicitud 
      <TouchableOpacity style={styles.Boton} onPress={() => props.navigation.navigate('Solicitud')}>
        <AntDesign name="pluscircle" size={60} color="#0E0575" />
      </TouchableOpacity>*/}

      {menuVisible && (
        <Modal transparent={true} animationType="fade" visible={menuVisible} onRequestClose={closeMenu}>
          <TouchableOpacity style={styles.modalOverlay} onPress={closeMenu}>
            <View style={styles.menu}>
              <TouchableOpacity style={styles.menuOption} onPress={openEditModal}>
                <Text style={styles.menuText}>Actualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => EliminarSolicitud(selectedSolicitud.id_solicitud)}
              >
                <Text style={styles.menuText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

{editModalVisible && (
  <Modal transparent={true} animationType="slide" visible={editModalVisible} onRequestClose={closeEditModal}>
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
              {editableData.imagen ? (
                <Image source={{ uri: editableData.imagen }} style={styles.headerImage} />
              ) : (
                <Text style={styles.imagePlaceholder}>Agregar Imagen</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Solicitud de Laboratorios Informáticos</Text>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Docente"
              value={editableData.docente_solicitante}
              onChangeText={(text) => setEditableData({ ...editableData, docente_solicitante: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Área de Conocimiento"
              value={editableData.area_conocimiento}
              onChangeText={(text) => setEditableData({ ...editableData, area_conocimiento: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.inputgroup}>
            <TextInput
              placeholder="Asignatura"
              value={editableData.asignatura}
              onChangeText={(text) => setEditableData({ ...editableData, asignatura: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.inputgroup}>
            <Picker
              selectedValue={editableData.carrera}
              style={styles.input}
              onValueChange={(value) => setEditableData({ ...editableData, carrera: value })}
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
              value={editableData.telefono}
              onChangeText={(text) => setEditableData({ ...editableData, telefono: text })}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity onPress={showDatePicker} style={styles.datePicker}>
          <Text style={styles.datePickerText}>
          {editableData.fechaUso ? editableData.fechaUso : 'Fecha de Uso'}
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
              value={editableData.duracion}
              onChangeText={(text) => setEditableData({ ...editableData, duracion: text })}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputgroup}>
            <Picker
              selectedValue={editableData.lab_disponible}
              style={styles.input}
              onValueChange={(value) => setEditableData({ ...editableData, lab_disponible: value })}
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
              value={editableData.motivo}
              onChangeText={(text) => setEditableData({ ...editableData, motivo: text })}
              style={styles.textArea}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
          <Button title='Cancelar' onPress={closeEditModal} style={styles.submitButton} />

            <Button title='Guardar' onPress={actualizarSolicitud} style={styles.submitButton}/>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 3,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  Boton: {
    position: 'absolute',
    justifyContent: 'flex-end',
    bottom: 30,
    right: 30,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
  },
  solicitudContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3D348B',
    marginBottom: 15,
  },
  seccion: {
    marginBottom: 10,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3D348B',
  },
  descripcion: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  imagen: {
    width: 200,
    height: 130,
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: 200,
    alignItems: 'center',
  },
  menuOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 275, 
    paddingLeft: 5, 
  },
    input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  editModal: {
     flex: 1, 
     justifyContent: 'center', 
     alignItems: 'center', 
     backgroundColor: 'white', 
     padding: 20 
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
      marginTop: 10,
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
});
