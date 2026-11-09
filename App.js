import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

// TEMPAT PENYIMPANAN DATA
const STORAGE_KEY = '@daftar_tugas_mahasiswa';

// DATA AWAL TUGAS
const dataAwal = [
  {
    id: '1',
    nama: 'Aplikasi Manejemen Tugas Mahasiswa',
    matkul: 'Pemrograman Visual I',
    deskripsi: 'Membuat aplikasi menggunakan React Native dan Expo.',
    deadline: '10 November 2026',
    selesai: false
  },
  {
    id: '2',
    nama: 'Laporan Jaringan Komputer',
    matkul: 'Jaringan Komputer',
    deskripsi: 'Membuat laporan tentang jaringan dan topologi.',
    deadline: '14 November 2026',
    selesai: false
  },
  {
    id: '3',
    nama: 'Tugas Basis Data',
    matkul: 'Basis Data',
    deskripsi: 'Membuat database dan relasi antar tabel.',
    deadline: '16 November 2026',
    selesai: true
  },
  {
    id: '4',
    nama: 'Fenomena Data Exploitasion',
    matkul: 'Data Warehouse & Data Mining',
    deskripsi: 'Menjelaskan secara spesifik bagaimana elemen Volume, Velocity, dan Variety terjadi di dalam ekosistem aplikasi e-commerce tsb!.',
    deadline: '07 November 2026',
    selesai: true
  },
  {
    id: '5',
    nama: 'Latihan 4',
    matkul: 'Robotik',
    deskripsi: 'Menentukan sistem koordinat.',
    deadline: '09 November 2026',
    selesai: true
  }
];

// REDUCER UNTUK MENGELOLA DATA TUGAS
const taskReducer = (state, action) => {
  switch (action.type) {

    case 'LOAD_TASKS':
      return action.payload;

    case 'ADD_TASK':
      return [action.payload, ...state];

    case 'DELETE_TASK':
      return state.filter(task => task.id !== action.id);

    case 'TOGGLE_STATUS':
      return state.map(task =>
        task.id === action.id
          ? { ...task, selesai: !task.selesai }
          : task
      );

    case 'RESET_TASKS':
      return [];

    default:
      return state;
  }
};

// KOMPONEN ANAK: KARTU TUGAS
const TaskCard = ({ item, onDelete, onToggle }) => {
  return (
    <View style={styles.taskCard}>

      <View style={styles.cardHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskName}>
            {item.nama}
          </Text>

          <Text style={styles.subject}>
            {item.matkul}
          </Text>
        </View>

        <View style={[
          styles.status,
          item.selesai ? styles.done : styles.pending
        ]}>
          <Text style={styles.statusText}>
            {item.selesai ? 'Selesai' : 'Belum Dikerjakan'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {item.deskripsi}
      </Text>

      <Text style={styles.deadline}>
        Deadline: {item.deadline}
      </Text>

      <View style={styles.cardButtons}>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onToggle(item.id)}
        >
          <Text style={styles.buttonText}>
            {item.selesai ? 'Batalkan' : 'Selesaikan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.buttonText}>
            Hapus
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

// KOMPONEN UTAMA
export default function App() {

  // USE REDUCER
  const [tasks, dispatch] = useReducer(taskReducer, dataAwal);

  // USE STATE
  const [nama, setNama] = useState('');
  const [matkul, setMatkul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline] = useState('');
  const [keyword, setKeyword] = useState('');
  const [dataSiap, setDataSiap] = useState(false);

  // USE REF
  const namaRef = useRef(null);

  // USE EFFECT: MENGAMBIL DATA DARI PENYIMPANAN
  useEffect(() => {
    const ambilData = async () => {
      try {
        const dataTersimpan = await AsyncStorage.getItem(STORAGE_KEY);

        if (dataTersimpan !== null) {
          const data = JSON.parse(dataTersimpan);

          dispatch({
            type: 'LOAD_TASKS',
            payload: data
          });

        } else {
          dispatch({
            type: 'LOAD_TASKS',
            payload: dataAwal
          });
        }

      } catch (error) {
        console.log('Gagal mengambil data:', error);

        dispatch({
          type: 'LOAD_TASKS',
          payload: dataAwal
        });

      } finally {
        setDataSiap(true);
      }
    };

    ambilData();
  }, []);

  // USE EFFECT: MENYIMPAN DATA SECARA OTOMATIS
  useEffect(() => {
    const simpanData = async () => {
      if (!dataSiap) return;

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(tasks)
        );

        console.log('Data tugas berhasil disimpan');

      } catch (error) {
        console.log('Gagal menyimpan data:', error);
      }
    };

    simpanData();
  }, [tasks, dataSiap]);

  // USE EFFECT: MEMANTAU PENCARIAN
  useEffect(() => {
    console.log('Kata pencarian berubah:', keyword);
  }, [keyword]);

  // USE MEMO: MENGHITUNG JUMLAH TUGAS
  const totalTugas = useMemo(
    () => tasks.length,
    [tasks]
  );

  const belumSelesai = useMemo(
    () => tasks.filter(task => !task.selesai).length,
    [tasks]
  );

  const sudahSelesai = useMemo(
    () => tasks.filter(task => task.selesai).length,
    [tasks]
  );

  // PENCARIAN TUGAS
  const hasilPencarian = useMemo(() => {
    return tasks.filter(task =>
      task.nama.toLowerCase().includes(keyword.toLowerCase()) ||
      task.matkul.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [tasks, keyword]);

  // USE CALLBACK: TAMBAH TUGAS
  const tambahTugas = useCallback(() => {

    if (
      !nama.trim() ||
      !matkul.trim() ||
      !deskripsi.trim() ||
      !deadline.trim()
    ) {
      Alert.alert(
        'Peringatan',
        'Semua data harus diisi!'
      );
      return;
    }

    const tugasBaru = {
      id: Date.now().toString(),
      nama: nama.trim(),
      matkul: matkul.trim(),
      deskripsi: deskripsi.trim(),
      deadline: deadline.trim(),
      selesai: false
    };

    dispatch({
      type: 'ADD_TASK',
      payload: tugasBaru
    });

    setNama('');
    setMatkul('');
    setDeskripsi('');
    setDeadline('');

    namaRef.current?.focus();

    Alert.alert(
      'Berhasil',
      'Tugas berhasil ditambahkan dan akan disimpan.'
    );

  }, [nama, matkul, deskripsi, deadline]);

  // USE CALLBACK: HAPUS TUGAS
  const hapusTugas = useCallback((id) => {

    Alert.alert(
      'Hapus Tugas',
      'Apakah kamu yakin ingin menghapus tugas ini?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => dispatch({
            type: 'DELETE_TASK',
            id
          })
        }
      ]
    );

  }, []);

  // USE CALLBACK: UBAH STATUS
  const ubahStatus = useCallback((id) => {

    dispatch({
      type: 'TOGGLE_STATUS',
      id
    });

  }, []);

  // RESET SEMUA TUGAS
  const resetTugas = () => {

    Alert.alert(
      'Reset Tugas',
      'Hapus semua data tugas?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Ya, Reset',
          style: 'destructive',
          onPress: () => dispatch({
            type: 'RESET_TASKS'
          })
        }
      ]
    );
  };

  // MENUNGGU DATA SELESAI DIMUAT
  if (!dataSiap) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1769D2" />
        <Text style={styles.loadingText}>
          Memuat data tugas...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          My Task Manager
        </Text>

        <Text style={styles.headerSubtitle}>
          Kelola tugas kuliahmu dengan lebih mudah
        </Text>
      </View>

      {/* RINGKASAN */}
      <Text style={styles.sectionTitle}>
        Ringkasan Tugas
      </Text>

      <View style={styles.summaryContainer}>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {totalTugas}
          </Text>
          <Text style={styles.summaryLabel}>
            Semua
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {belumSelesai}
          </Text>
          <Text style={styles.summaryLabel}>
            Belum
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {sudahSelesai}
          </Text>
          <Text style={styles.summaryLabel}>
            Selesai
          </Text>
        </View>

      </View>

      {/* FORM TAMBAH TUGAS */}
      <Text style={styles.sectionTitle}>
        Tambah Tugas Baru
      </Text>

      <View style={styles.formCard}>

        <TextInput
          ref={namaRef}
          style={styles.input}
          placeholder="Nama tugas"
          value={nama}
          onChangeText={setNama}
        />

        <TextInput
          style={styles.input}
          placeholder="Nama mata kuliah"
          value={matkul}
          onChangeText={setMatkul}
        />

        <TextInput
          style={styles.input}
          placeholder="Deskripsi tugas"
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Deadline (contoh: 25 November 2026)"
          value={deadline}
          onChangeText={setDeadline}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={tambahTugas}
        >
          <Text style={styles.addButtonText}>
            + Tambahkan Tugas
          </Text>
        </TouchableOpacity>

      </View>

      {/* PENCARIAN */}
      <Text style={styles.sectionTitle}>
        Daftar Tugas
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Cari nama tugas atau mata kuliah..."
        value={keyword}
        onChangeText={setKeyword}
      />

      {/* FLATLIST */}
      <FlatList
        data={hasilPencarian}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Tidak ada tugas yang ditemukan.
          </Text>
        }
        renderItem={({ item }) => (
          <TaskCard
            item={item}
            onDelete={hapusTugas}
            onToggle={ubahStatus}
          />
        )}
      />

      {/* RESET */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetTugas}
      >
        <Text style={styles.resetText}>
          Reset Semua Tugas
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        My Task Manager - Aplikasi Tugas Mahasiswa
      </Text>

    </ScrollView>
  );
}

// STYLE APLIKASI
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#EFF5FC',
    paddingHorizontal: 18
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#EFF5FC',
    justifyContent: 'center',
    alignItems: 'center'
  },

  loadingText: {
    marginTop: 12,
    color: '#102B50',
    fontSize: 14
  },

  header: {
    backgroundColor: '#102B50',
    padding: 25,
    marginTop: 45,
    borderRadius: 18,
    marginBottom: 22
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#B9D9F5',
    marginTop: 7
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#102B50',
    marginBottom: 12,
    marginTop: 10
  },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 14,
    elevation: 3,
    borderBottomWidth: 3,
    borderBottomColor: '#38A6E8'
  },

  summaryNumber: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1769D2'
  },

  summaryLabel: {
    fontSize: 12,
    color: '#52677D',
    marginTop: 5
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3
  },

  input: {
    backgroundColor: '#F2F7FD',
    padding: 13,
    borderRadius: 10,
    marginBottom: 11,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D5E6F7',
    color: '#102B50'
  },

  addButton: {
    backgroundColor: '#1769D2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },

  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#C8DDF2',
    color: '#102B50'
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 14,
    marginBottom: 13,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1769D2'
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  taskInfo: {
    flex: 1,
    marginRight: 8
  },

  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102B50'
  },

  subject: {
    color: '#2585CB',
    fontSize: 13,
    marginTop: 5
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 125
  },

  done: {
    backgroundColor: '#D8F5E5'
  },

  pending: {
    backgroundColor: '#FFF0CC'
  },

  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34495E'
  },

  description: {
    fontSize: 13,
    color: '#64758A',
    marginTop: 12,
    lineHeight: 20
  },

  deadline: {
    fontSize: 12,
    color: '#1769D2',
    marginTop: 10,
    fontWeight: '600'
  },

  cardButtons: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10
  },

  completeButton: {
    backgroundColor: '#1769D2',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center'
  },

  deleteButton: {
    backgroundColor: '#E05260',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center'
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },

  emptyText: {
    textAlign: 'center',
    color: '#64758A',
    padding: 20
  },

  resetButton: {
    backgroundColor: '#DCEBFA',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },

  resetText: {
    color: '#1769D2',
    fontWeight: 'bold'
  },

  footer: {
    textAlign: 'center',
    color: '#8497AA',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 30
  }

});
