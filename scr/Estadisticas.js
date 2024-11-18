import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing'; 
import { BarChart } from "react-native-chart-kit";
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../Firebase/FirebaseConfig';

export default function Estadisticas() {

  const [dataSolicitud, setDataSolicitud] = useState({
    labels: [''],
    datasets: [{ data: [0] }]
  });

  
  useEffect(() => {
    const recibirDatosSolicitud = async () => {
      try {
        const q = query(collection(db, "Solicitud"));
        const querySnapshot = await getDocs(q);
        const labDisponible = [];
        const duracionD = [];

        querySnapshot.forEach((doc) => {
          const datosBD = doc.data();
          const { lab_disponible, duracion } = datosBD;
          labDisponible.push(lab_disponible);
          duracionD.push(duracion);
        });

        setDataSolicitud({
          labels: labDisponible,
          datasets: [{ data: duracionD }]
        });

      } catch (error) {
        console.error("Error al obtener los datos de solicitud: ", error);
      }
    };

    recibirDatosSolicitud();
  }, []);

 
  const generarPDF = async () => {
    try {
      const doc = new jsPDF();

      doc.text("Reporte de Solicitud", 10, 10);

      dataSolicitud.labels.forEach((label, index) => {
        const duracion = dataSolicitud.datasets[0].data[index];
        doc.text(`${label}: Duración ${duracion} horas`, 10, 20 + index * 10); 
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];

      const fileUri = `${FileSystem.documentDirectory}reporte_solicitudes.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(fileUri);

    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  let screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <BarChart
        data={dataSolicitud}
        width={screenWidth - (screenWidth * 0.1)}
        height={300}
        yAxisLabel="Horas"
        xAxisLabel='Laboratorio'
        chartConfig={{
          backgroundGradientFrom: "#00FFFF",
          backgroundGradientFromOpacity: 0.1,
          backgroundGradientTo: "#FFFFFF",
          backgroundGradientToOpacity: 1,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          strokeWidth: 1,
          barPercentage: 0.5,
          propsForLabels: {
            fontSize: 11,
            fontFamily: 'Arial',
            fill: 'black',
          }
        }}
        style={{
          borderRadius: 10
        }}
        verticalLabelRotation={45}
        withHorizontalLabels={true}
        showValuesOnTopOfBars={true}
      />

      <View style={styles.button}>
        <Button title="Generar y Compartir PDF" onPress={generarPDF}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    marginTop: 20,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
