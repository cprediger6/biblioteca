// components/CarnetPDF.tsx
"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import Barcode from "./Barcode";

// Estilos para el carnet
const styles = StyleSheet.create({
  page: {
    width: '85.5mm',
    height: '54mm',
    padding: 4,
    backgroundColor: '#ffffff',
  },
  card: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1a1a2e',
    padding: 6,
    flexDirection: 'row',
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 6,
  },
  photoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    objectFit: 'cover',
  },
  photoEmoji: {
    fontSize: 16,
  },
  leftText: {
    fontSize: 6,
    textAlign: 'center',
    color: '#1a1a2e',
  },
  rightSection: {
    flex: 2,
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  header: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  label: {
    fontSize: 5,
    color: '#6b7280',
    marginTop: 1,
  },
  value: {
    fontSize: 7,
    fontWeight: 'semibold',
    color: '#1a1a2e',
  },
  barcodeContainer: {
    marginTop: 2,
    alignItems: 'center',
    width: '100%',
  },
  barcodeWrapper: {
    width: 70,
    height: 20,
  },
  footer: {
    fontSize: 4,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 2,
  },
  roleBadge: {
    fontSize: 5,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4f46e5',
    padding: 2,
    borderRadius: 2,
    textAlign: 'center',
    marginTop: 2,
    width: 40,
  },
});

interface CarnetPDFProps {
  user: {
    id: string;
    name: string;
    email: string;
    identification: string;
    phone: string | null;
    role: string;
    createdAt: Date;
    photo: string | null;
  };
}

export default function CarnetPDF({ user }: CarnetPDFProps) {
  const barcodeData = user.identification || user.id;

  return (
    <Document>
      <Page size={[85.5, 54]} style={styles.page}>
        <View style={styles.card}>
          {/* Sección Izquierda - Foto y nombre */}
          <View style={styles.leftSection}>
            <View style={styles.photoContainer}>
              {user.photo ? (
                <Image src={user.photo} style={styles.photo} />
              ) : (
                <Text style={styles.photoEmoji}>📚</Text>
              )}
            </View>
            <Text style={[styles.leftText, { fontSize: 5, fontWeight: 'bold' }]}>
              {user.name.split(' ')[0]}
            </Text>
            <View style={styles.roleBadge}>
              <Text>{user.role === 'admin' ? 'ADMIN' : 'USUARIO'}</Text>
            </View>
          </View>

          {/* Sección Derecha - Información */}
          <View style={styles.rightSection}>
            <Text style={styles.header}>📚 Biblioteca+</Text>
            
            <View>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <Text style={styles.value}>{user.name}</Text>
            </View>

            <View>
              <Text style={styles.label}>IDENTIFICACIÓN</Text>
              <Text style={styles.value}>{user.identification}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 1 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>EMAIL</Text>
                <Text style={[styles.value, { fontSize: 5 }]}>{user.email}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>TELÉFONO</Text>
                <Text style={[styles.value, { fontSize: 5 }]}>{user.phone || 'N/A'}</Text>
              </View>
            </View>

            {/* Código de Barras - SVG renderizado */}
            <View style={styles.barcodeContainer}>
              <Barcode 
                value={barcodeData}
                width={1.2}
                height={25}
                fontSize={8}
              />
            </View>

            <Text style={styles.footer}>
              Válido desde {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}