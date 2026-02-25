import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, User, LogOut, Download, Camera, MapPin, Building2, Users, AlertCircle, Check, X, Plus, Trash2, UserCheck, FileText, Settings, Eye, EyeOff, ArrowLeft, Shield, Globe, Send, Image, Monitor, Clock, Smartphone, Mail, Upload, Link, Wifi } from 'lucide-react';

const TeacherAttendanceApp = () => {
  const [view, setView] = useState('selectRole');
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [checadores, setChecadores] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [signatureAttempts, setSignatureAttempts] = useState(0);
  const [registeredSignatures, setRegisteredSignatures] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [stream, setStream] = useState(null);
  const [checadorLoginPhoto, setChecadorLoginPhoto] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordFields, setShowPasswordFields] = useState({ current: false, new: false, confirm: false });
  
  // Virtual attendance system states
  const [virtualLinks, setVirtualLinks] = useState([]);
  const [virtualSubmissions, setVirtualSubmissions] = useState([]);
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [deviceAlerts, setDeviceAlerts] = useState([]);
  const [activeVirtualToken, setActiveVirtualToken] = useState(null);
  const [virtualSignatureData, setVirtualSignatureData] = useState(null);
  const [virtualEvidence, setVirtualEvidence] = useState(null);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [checadorTab, setChecadorTab] = useState('presencial');
  
  // Contingency mode states
  const [contingencyMode, setContingencyMode] = useState(false);
  const [contingencyReason, setContingencyReason] = useState('');
  const [contingencyActivatedAt, setContingencyActivatedAt] = useState(null);
  const [contingencyActivatedBy, setContingencyActivatedBy] = useState('');
  const [contingencyTeacher, setContingencyTeacher] = useState(null);
  const [contingencyEmployeeSearch, setContingencyEmployeeSearch] = useState('');
  const [contingencySignatureData, setContingencySignatureData] = useState(null);
  const [contingencySignatureValidation, setContingencySignatureValidation] = useState(null); // {passed, confidence, details}
  const [contingencyEvidences, setContingencyEvidences] = useState([]);
  const [contingencySelectedSubject, setContingencySelectedSubject] = useState(null);
  const [evidenceChecklist, setEvidenceChecklist] = useState({});
  const [rejectReason, setRejectReason] = useState('');
  const contingencyCanvasRef = useRef(null);
  const contingencyEvidenceRef = useRef(null);
  
  // Activity log for Prefectura
  const [activityLog, setActivityLog] = useState([]);
  
  // Demo mode - simulated time for testing
  const [demoMode, setDemoMode] = useState(false);
  const [demoTime, setDemoTime] = useState('09:00');
  const [demoDate, setDemoDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Checador PIN login
  const [checadorLoginForm, setChecadorLoginForm] = useState({ employeeNumber: '', pin: '' });
  
  // Active session role banner
  const [activeSessionRole, setActiveSessionRole] = useState(null);
  
  const [userCredentials, setUserCredentials] = useState({
    admin: { username: 'admin', password: 'admin123', firstLogin: true, name: 'Administrador', role: 'admin', lastPasswordChange: null },
    rh: { username: 'rh', password: 'rh123', firstLogin: true, name: 'Recursos Humanos', role: 'rh', lastPasswordChange: null },
    prefectura: { username: 'prefectura', password: 'pref123', firstLogin: true, name: 'Prefectura', role: 'prefectura', lastPasswordChange: null }
  });

  const isPasswordChangeRequired = (lastChangeDate) => {
    if (!lastChangeDate) return false;
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();
    
    // Verificar si estamos en las primeras 2 semanas de enero (mes 0) o julio (mes 6)
    const isChangeMonth = (currentMonth === 0 || currentMonth === 6) && currentDay <= 14;
    
    if (!isChangeMonth) return false;
    
    const lastChange = new Date(lastChangeDate);
    const monthsSinceChange = (now.getFullYear() - lastChange.getFullYear()) * 12 + (now.getMonth() - lastChange.getMonth());
    
    // Requiere cambio si han pasado 6 meses o más
    return monthsSinceChange >= 6;
  };

  const getPasswordChangeMessage = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    if ((currentMonth === 0 || currentMonth === 6) && currentDay <= 14) {
      const monthName = currentMonth === 0 ? 'enero' : 'julio';
      return `Estamos en las primeras 2 semanas de ${monthName}. Es obligatorio cambiar tu contraseña cada 6 meses.`;
    }
    return null;
  };
  
  const turnos = {
    matutino: {
      name: 'Matutino',
      clases: [
        { id: 'M1', hora: '07:00', horaFin: '07:50' },
        { id: 'M2', hora: '07:50', horaFin: '08:40' },
        { id: 'M3', hora: '08:40', horaFin: '09:30' },
        { id: 'M4', hora: '09:30', horaFin: '10:20' },
        { id: 'M5', hora: '10:20', horaFin: '11:10' },
        { id: 'M6', hora: '11:10', horaFin: '12:00' }
      ]
    },
    vespertino: {
      name: 'Vespertino',
      clases: [
        { id: 'V1', hora: '12:00', horaFin: '12:50' },
        { id: 'V2', hora: '12:50', horaFin: '13:40' },
        { id: 'V3', hora: '13:40', horaFin: '14:30' },
        { id: 'V4', hora: '14:30', horaFin: '15:20' },
        { id: 'V5', hora: '15:20', horaFin: '16:10' },
        { id: 'V6', hora: '16:10', horaFin: '17:00' }
      ]
    },
    nocturno: {
      name: 'Nocturno',
      clases: [
        { id: 'N1', hora: '17:00', horaFin: '17:45' },
        { id: 'N2', hora: '17:45', horaFin: '18:30' },
        { id: 'N3', hora: '18:30', horaFin: '19:15' },
        { id: 'N4', hora: '19:15', horaFin: '20:00' },
        { id: 'N5', hora: '20:00', horaFin: '20:45' },
        { id: 'N6', hora: '20:45', horaFin: '21:30' }
      ]
    }
  };

  const [centrosTrabajo, setCentrosTrabajo] = useState([
    { id: 1, name: 'Linares', lat: 24.8573, lng: -99.5685, radius: 100, isVirtual: false },
    { id: 2, name: 'Juárez', lat: 25.6525, lng: -100.0871, radius: 100, isVirtual: false },
    { id: 3, name: 'Cadereyta', lat: 25.5884, lng: -100.0029, radius: 100, isVirtual: false },
    { id: 4, name: 'García', lat: 25.8108, lng: -100.5911, radius: 100, isVirtual: false },
    { id: 5, name: 'Sabinas', lat: 25.1351, lng: -100.1737, radius: 100, isVirtual: false },
    { id: 6, name: 'Santiago', lat: 25.4323, lng: -100.1467, radius: 100, isVirtual: false },
    { id: 7, name: 'CIIIA', lat: 25.7260, lng: -100.3114, radius: 100, isVirtual: false },
    { id: 8, name: 'CIIDIT', lat: 25.7265, lng: -100.3120, radius: 100, isVirtual: false },
    { id: 9, name: 'Ciudad Universitaria', lat: 25.7269, lng: -100.3130, radius: 100, isVirtual: false },
    { id: 10, name: 'Teams', lat: 0, lng: 0, radius: 0, isVirtual: true },
    { id: 11, name: 'NEXUS', lat: 0, lng: 0, radius: 0, isVirtual: true }
  ]);

  const [nivelesAcademicos, setNivelesAcademicos] = useState(['Licenciatura', 'Maestría', 'Doctorado', 'Educación Continua', 'CAADI']);
  const [tiposServicio, setTiposServicio] = useState(['Clase', 'Laboratorio', 'Sabatinos', 'Tutorías', 'Propedéuticos', 'Examen de medio curso', 'Examen ordinario', 'Examen extraordinario', 'Asesorías', 'Regularización']);
  const [edificios, setEdificios] = useState(['Edificio A', 'Edificio B', 'Edificio C', 'Edificio D', 'Edificio E']);
  const [salones, setSalones] = useState(['101', '102', '103', '201', '202', '203', '301', '302', '303']);
  
  const [rhUsers, setRhUsers] = useState([
    { id: 1, username: 'rh', password: 'rh123', firstLogin: true, name: 'Recursos Humanos', role: 'rh', lastPasswordChange: null }
  ]);
  
  const [prefecturaUsers, setPrefecturaUsers] = useState([
    { id: 1, username: 'prefectura', password: 'pref123', firstLogin: true, name: 'Prefectura', role: 'prefectura', lastPasswordChange: null }
  ]);

  const [showAdminConfig, setShowAdminConfig] = useState(false);
  const [configSection, setConfigSection] = useState('centros');
  const [newItem, setNewItem] = useState('');
  const [newRHUser, setNewRHUser] = useState({ username: '', password: '', name: '' });
  const [newPrefecturaUser, setNewPrefecturaUser] = useState({ username: '', password: '', name: '' });

  const canvasRef = useRef(null);
  const virtualCanvasRef = useRef(null);
  const evidenceInputRef = useRef(null);
  const videoRef = useRef(null);
  const photoCanvasRef = useRef(null);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newTeacher, setNewTeacher] = useState({ employeeNumber: '', fullName: '', email: '', phone: '', photo: null, subjects: [], signatures: [] });
  const [newSubject, setNewSubject] = useState({ name: '', turno: '', horario: '', classroom: '', edificio: '', centroTrabajo: '', nivelAcademico: '', tipoServicio: '' });
  const [newChecador, setNewChecador] = useState({ employeeNumber: '', fullName: '', birthDate: '', photo: null, pin: '', assignedCentros: [], assignedHorarios: [] });
  const [newCentro, setNewCentro] = useState({ name: '', lat: '', lng: '', radius: 100, isVirtual: false });

  useEffect(() => {
    if (view === 'signAttendance') {
      getCurrentLocation();
    }
  }, [view]);

  // === DEMO MODE: Get effective time (real or simulated) ===
  const getEffectiveTime = () => {
    if (demoMode) {
      const [h, m] = demoTime.split(':').map(Number);
      const d = new Date(demoDate + 'T00:00:00');
      d.setHours(h, m, 0, 0);
      return d;
    }
    return new Date();
  };

  // === ACTIVITY LOG ===
  const addLog = (type, message, details = '') => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' }),
      type, // 'attendance', 'contingency', 'security', 'system', 'approval', 'rejection'
      message,
      details
    };
    setActivityLog(prev => [entry, ...prev].slice(0, 200)); // Keep last 200
  };

  // === RESET ALL DATA (admin hidden) ===
  const resetAllData = () => {
    if (!window.confirm('⚠️ ¿RESETEAR TODOS LOS DATOS?\n\nEsto eliminará:\n• Todos los maestros registrados\n• Todos los checadores\n• Todas las asistencias\n• Todas las submissions virtuales\n• Configuraciones personalizadas\n• Log de actividad\n\nEsta acción NO se puede deshacer.')) return;
    if (!window.confirm('¿Estás COMPLETAMENTE seguro? Escribe "RESET" mentalmente y confirma.')) return;
    setTeachers([]);
    setChecadores([]);
    setAttendance([]);
    setVirtualSubmissions([]);
    setVirtualLinks([]);
    setDeviceLogs([]);
    setDeviceAlerts([]);
    setActivityLog([]);
    setContingencyMode(false);
    setContingencyReason('');
    setContingencyActivatedAt(null);
    setContingencyActivatedBy('');
    setDemoMode(false);
    setUserCredentials({
      admin: { username: 'admin', password: 'admin123', firstLogin: true, name: 'Administrador', role: 'admin', lastPasswordChange: null },
      rh: { username: 'rh', password: 'rh123', firstLogin: true, name: 'Recursos Humanos', role: 'rh', lastPasswordChange: null },
      prefectura: { username: 'prefectura', password: 'pref123', firstLogin: true, name: 'Prefectura', role: 'prefectura', lastPasswordChange: null }
    });
    setRhUsers([{ id: 1, username: 'rh', password: 'rh123', firstLogin: true, name: 'Recursos Humanos', role: 'rh', lastPasswordChange: null }]);
    setPrefecturaUsers([{ id: 1, username: 'prefectura', password: 'pref123', firstLogin: true, name: 'Prefectura', role: 'prefectura', lastPasswordChange: null }]);
    setCentrosTrabajo([
      { id: 1, name: 'Linares', lat: 24.8573, lng: -99.5685, radius: 100, isVirtual: false },
      { id: 2, name: 'Juárez', lat: 25.6525, lng: -100.0871, radius: 100, isVirtual: false },
      { id: 3, name: 'Cadereyta', lat: 25.5884, lng: -100.0029, radius: 100, isVirtual: false },
      { id: 4, name: 'García', lat: 25.8108, lng: -100.5911, radius: 100, isVirtual: false },
      { id: 5, name: 'Sabinas', lat: 25.1351, lng: -100.1737, radius: 100, isVirtual: false },
      { id: 6, name: 'Santiago', lat: 25.4323, lng: -100.1467, radius: 100, isVirtual: false },
      { id: 7, name: 'CIIIA', lat: 25.7260, lng: -100.3114, radius: 100, isVirtual: false },
      { id: 8, name: 'CIIDIT', lat: 25.7265, lng: -100.3120, radius: 100, isVirtual: false },
      { id: 9, name: 'Ciudad Universitaria', lat: 25.7269, lng: -100.3130, radius: 100, isVirtual: false },
      { id: 10, name: 'Teams', lat: 0, lng: 0, radius: 0, isVirtual: true },
      { id: 11, name: 'NEXUS', lat: 0, lng: 0, radius: 0, isVirtual: true }
    ]);
    setNivelesAcademicos(['Licenciatura', 'Maestría', 'Doctorado', 'Educación Continua', 'CAADI']);
    setTiposServicio(['Clase', 'Laboratorio', 'Sabatinos', 'Tutorías', 'Propedéuticos', 'Examen de medio curso', 'Examen ordinario', 'Examen extraordinario', 'Asesorías', 'Regularización']);
    setEdificios(['Edificio A', 'Edificio B', 'Edificio C', 'Edificio D', 'Edificio E']);
    setSalones(['101', '102', '103', '201', '202', '203', '301', '302', '303']);
    localStorage.removeItem('fime_app_data');
    addLog('system', 'Reset completo del sistema', 'Todos los datos han sido eliminados');
    alert('✅ Todos los datos han sido reseteados al estado inicial.');
  };

  // === LOCALSTORAGE PERSISTENCE ===
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fime_app_data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.teachers) setTeachers(data.teachers);
        if (data.checadores) setChecadores(data.checadores);
        if (data.attendance) setAttendance(data.attendance);
        if (data.virtualSubmissions) setVirtualSubmissions(data.virtualSubmissions);
        if (data.virtualLinks) setVirtualLinks(data.virtualLinks);
        if (data.deviceLogs) setDeviceLogs(data.deviceLogs);
        if (data.deviceAlerts) setDeviceAlerts(data.deviceAlerts);
        if (data.activityLog) setActivityLog(data.activityLog);
        if (data.userCredentials) setUserCredentials(data.userCredentials);
        if (data.rhUsers) setRhUsers(data.rhUsers);
        if (data.prefecturaUsers) setPrefecturaUsers(data.prefecturaUsers);
        if (data.centrosTrabajo) setCentrosTrabajo(data.centrosTrabajo);
        if (data.nivelesAcademicos) setNivelesAcademicos(data.nivelesAcademicos);
        if (data.tiposServicio) setTiposServicio(data.tiposServicio);
        if (data.edificios) setEdificios(data.edificios);
        if (data.salones) setSalones(data.salones);
        if (data.contingencyMode) { setContingencyMode(data.contingencyMode); setContingencyReason(data.contingencyReason || ''); setContingencyActivatedAt(data.contingencyActivatedAt); setContingencyActivatedBy(data.contingencyActivatedBy || ''); }
        if (data.demoMode) { setDemoMode(data.demoMode); setDemoTime(data.demoTime || '09:00'); setDemoDate(data.demoDate || new Date().toISOString().split('T')[0]); }
      }
    } catch (e) { console.error('Error loading saved data:', e); }
  }, []);

  // Save to localStorage whenever critical data changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        const data = {
          teachers, checadores, attendance, virtualSubmissions, virtualLinks, deviceLogs, deviceAlerts, activityLog,
          userCredentials, rhUsers, prefecturaUsers, centrosTrabajo, nivelesAcademicos, tiposServicio, edificios, salones,
          contingencyMode, contingencyReason, contingencyActivatedAt, contingencyActivatedBy,
          demoMode, demoTime, demoDate
        };
        localStorage.setItem('fime_app_data', JSON.stringify(data));
      } catch (e) { console.error('Error saving data:', e); }
    }, 500); // Debounce 500ms
    return () => clearTimeout(saveTimeout);
  }, [teachers, checadores, attendance, virtualSubmissions, virtualLinks, deviceLogs, deviceAlerts, activityLog,
      userCredentials, rhUsers, prefecturaUsers, centrosTrabajo, nivelesAcademicos, tiposServicio, edificios, salones,
      contingencyMode, contingencyReason, contingencyActivatedAt, contingencyActivatedBy, demoMode, demoTime, demoDate]);

  // === BEFOREUNLOAD WARNING ===
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentUser || attendance.length > 0) {
        e.preventDefault();
        e.returnValue = '¿Seguro que deseas salir? Los datos de la sesión actual podrían perderse.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, attendance]);

  // === PWA: Disable back swipe / history navigation ===
  useEffect(() => {
    const handlePopState = (e) => {
      if (view !== 'selectRole') {
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view]);

  // === ROLE BANNER COMPONENT ===
  const RoleBanner = () => {
    if (!activeSessionRole || view === 'selectRole') return null;
    const roleColors = {
      admin: { bg: 'bg-purple-700', text: 'Administrador', icon: '👑' },
      rh: { bg: 'bg-orange-600', text: 'Recursos Humanos', icon: '📋' },
      prefectura: { bg: 'bg-indigo-600', text: 'Prefectura', icon: '🏛️' },
      checador: { bg: 'bg-teal-600', text: 'Checador', icon: '✅' }
    };
    const role = roleColors[activeSessionRole];
    if (!role) return null;
    return (
      <div className={`${role.bg} text-white text-center py-1 text-xs font-bold tracking-wide fixed top-0 left-0 right-0 z-50`} style={{ fontSize: '11px' }}>
        {role.icon} SESIÓN ACTIVA: {role.text} {currentUser?.name || currentUser?.fullName || ''} {demoMode && <span className="ml-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-xs">🕐 DEMO: {demoTime}</span>}
      </div>
    );
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError('');
        },
        () => setLocationError('No se pudo obtener la ubicación.')
      );
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const isInCentroTrabajo = (centroId) => {
    if (!currentLocation) return false;
    const centro = centrosTrabajo.find(c => c.id === centroId);
    if (!centro || centro.isVirtual) return true;
    return calculateDistance(currentLocation.lat, currentLocation.lng, centro.lat, centro.lng) <= centro.radius;
  };

  const startCamera = async (type) => {
    setCameraType(type);
    setShowCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch {
      alert('No se pudo acceder a la cámara');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = photoCanvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg');
    stopCamera();
    if (cameraType === 'teacher') setNewTeacher({ ...newTeacher, photo: photoData });
    else if (cameraType === 'checador') setNewChecador({ ...newChecador, photo: photoData });
    else if (cameraType === 'checadorLogin') setChecadorLoginPhoto(photoData);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const retakePhoto = () => {
    if (cameraType === 'teacher') setNewTeacher({ ...newTeacher, photo: null });
    else if (cameraType === 'checador') setNewChecador({ ...newChecador, photo: null });
    else if (cameraType === 'checadorLogin') setChecadorLoginPhoto(null);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureImage = canvas.toDataURL();
    setSignatureData(signatureImage);
    if (view === 'registerTeacher' && registrationStep === 3) {
      const newSignatures = [...registeredSignatures, signatureImage];
      setRegisteredSignatures(newSignatures);
      clearSignature();
      if (signatureAttempts < 2) {
        setSignatureAttempts(signatureAttempts + 1);
      } else {
        setTeachers([...teachers, { ...newTeacher, id: Date.now(), signatures: newSignatures }]);
        alert('¡Maestro registrado exitosamente!');
        resetRegistration();
        setView('rhPanel');
      }
    }
  };

  const addSubject = () => {
    if (!newSubject.name || !newSubject.turno || !newSubject.horario || !newSubject.classroom || !newSubject.edificio || !newSubject.centroTrabajo || !newSubject.nivelAcademico || !newSubject.tipoServicio) {
      alert('Todos los campos son obligatorios');
      return;
    }
    setNewTeacher({ ...newTeacher, subjects: [...newTeacher.subjects, { ...newSubject, id: Date.now() }] });
    setNewSubject({ name: '', turno: '', horario: '', classroom: '', edificio: '', centroTrabajo: '', nivelAcademico: '', tipoServicio: '' });
  };

  const removeSubject = (id) => setNewTeacher({ ...newTeacher, subjects: newTeacher.subjects.filter(s => s.id !== id) });

  const resetRegistration = () => {
    setNewTeacher({ employeeNumber: '', fullName: '', email: '', phone: '', photo: null, subjects: [], signatures: [] });
    setNewSubject({ name: '', turno: '', horario: '', classroom: '', edificio: '', centroTrabajo: '', nivelAcademico: '', tipoServicio: '' });
    setRegistrationStep(1);
    setSignatureAttempts(0);
    setRegisteredSignatures([]);
    setSignatureData(null);
  };

  const handleLogin = (role) => {
    let userCred = userCredentials[role];
    
    // Buscar en usuarios de RH
    if (role === 'rh' && !userCred) {
      const rhUser = rhUsers.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (rhUser) userCred = rhUser;
    }
    
    // Buscar en usuarios de Prefectura
    if (role === 'prefectura' && !userCred) {
      const prefUser = prefecturaUsers.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (prefUser) userCred = prefUser;
    }
    
    if (!userCred) {
      alert('Usuario o contraseña incorrectos');
      return;
    }
    
    if (loginForm.username === userCred.username && loginForm.password === userCred.password) {
      setCurrentUser(userCred);
      setUserRole(role);
      setActiveSessionRole(role);
      addLog('system', `${role.charAt(0).toUpperCase() + role.slice(1)} inició sesión: ${userCred.name}`, '');
      
      if (userCred.firstLogin) {
        setView('changePasswordFirst');
      }
      else if (isPasswordChangeRequired(userCred.lastPasswordChange)) {
        setView('changePasswordRequired');
      }
      else {
        setView(role + 'Panel');
      }
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8 || password.length > 15) {
      errors.push('La contraseña debe tener entre 8 y 15 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Debe contener al menos un símbolo especial');
    }
    
    return errors;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'Débil', color: '#ef4444', percent: 33 };
    if (strength <= 4) return { level: 'Media', color: '#eab308', percent: 66 };
    return { level: 'Fuerte', color: '#22c55e', percent: 100 };
  };

  const getPasswordChecks = (password) => {
    return [
      { label: 'Entre 8 y 15 caracteres', met: password.length >= 8 && password.length <= 15 },
      { label: 'Al menos 1 letra mayúscula', met: /[A-Z]/.test(password) },
      { label: 'Al menos 1 letra minúscula', met: /[a-z]/.test(password) },
      { label: 'Al menos 1 número', met: /[0-9]/.test(password) },
      { label: 'Al menos 1 símbolo especial (!@#$%^&*...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) }
    ];
  };

  const renderPasswordPolicyBox = (password) => {
    const checks = password ? getPasswordChecks(password) : [];
    return (
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={18} className="text-blue-700" />
          <span className="font-semibold text-blue-800">Política de Contraseñas:</span>
        </div>
        <ul className="text-sm space-y-2">
          {[
            { label: 'Entre 8 y 15 caracteres', met: password ? (password.length >= 8 && password.length <= 15) : false },
            { label: 'Al menos 1 letra mayúscula', met: password ? /[A-Z]/.test(password) : false },
            { label: 'Al menos 1 letra minúscula', met: password ? /[a-z]/.test(password) : false },
            { label: 'Al menos 1 número', met: password ? /[0-9]/.test(password) : false },
            { label: 'Al menos 1 símbolo especial (!@#$%^&*...)', met: password ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) : false }
          ].map((rule, i) => (
            <li key={i} className={`flex items-center gap-2 transition-all duration-300 ${rule.met ? 'text-green-700' : 'text-gray-500'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${rule.met ? 'bg-green-500' : 'bg-gray-300'}`}>
                {rule.met ? <Check size={12} className="text-white" /> : <span className="text-white text-xs">-</span>}
              </div>
              <span className={rule.met ? 'font-medium' : ''}>{rule.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderPasswordInput = (label, fieldKey, value, onChange, accentColor) => {
    const fieldVisible = showPasswordFields[fieldKey];
    return (
      <div>
        <label className="block text-gray-700 font-medium mb-2">{label} *</label>
        <div className="relative">
          <input
            type={fieldVisible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none transition-colors"
            style={{ borderColor: value ? accentColor : undefined }}
            placeholder={label}
          />
          <button
            type="button"
            onClick={() => setShowPasswordFields({ ...showPasswordFields, [fieldKey]: !fieldVisible })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            {fieldVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    );
  };

  const renderStrengthBar = (password) => {
    if (!password) return null;
    const strength = getPasswordStrength(password);
    return (
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 font-medium">Seguridad de la contraseña:</span>
          <span className="text-xs font-bold" style={{ color: strength.color }}>{strength.level}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div className="h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}></div>
        </div>
      </div>
    );
  };

  const renderPasswordMatchIndicator = (newPwd, confirmPwd) => {
    if (!confirmPwd || !newPwd) return null;
    const match = newPwd === confirmPwd;
    return (
      <div className="mt-2">
        <div className={`text-xs flex items-center gap-1 ${match ? 'text-green-600' : 'text-red-600'}`}>
          {match ? <Check size={12} /> : <X size={12} />}
          <span>{match ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
        </div>
      </div>
    );
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Completa todos los campos');
      return;
    }
    
    if (passwordForm.currentPassword !== currentUser.password) {
      alert('La contraseña actual es incorrecta');
      return;
    }
    
    const validationErrors = validatePassword(passwordForm.newPassword);
    if (validationErrors.length > 0) {
      alert('La contraseña no cumple con los requisitos:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    const now = new Date();
    const updatedCredentials = {
      ...userCredentials,
      [userRole]: {
        ...userCredentials[userRole],
        password: passwordForm.newPassword,
        firstLogin: false,
        lastPasswordChange: now.toISOString()
      }
    };
    
    setUserCredentials(updatedCredentials);
    setCurrentUser({
      ...currentUser,
      password: passwordForm.newPassword,
      firstLogin: false,
      lastPasswordChange: now.toISOString()
    });
    
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordFields({ current: false, new: false, confirm: false });
    setShowChangePassword(false);
    alert('Contraseña actualizada correctamente. Tu próximo cambio será en ' + (now.getMonth() < 6 ? 'julio' : 'enero del próximo año'));
    
    if (view === 'changePasswordFirst' || view === 'changePasswordRequired') {
      setView(userRole + 'Panel');
    }
  };

  const handleChecadorLogin = () => {
    if (!checadorLoginForm.employeeNumber || !checadorLoginForm.pin) {
      alert('Ingresa tu número de empleado y PIN');
      return;
    }
    const checador = checadores.find(c => c.employeeNumber === checadorLoginForm.employeeNumber && c.pin === checadorLoginForm.pin);
    if (checador) {
      setCurrentUser(checador);
      setUserRole('checador');
      setActiveSessionRole('checador');
      setView('checadorPanel');
      setChecadorLoginForm({ employeeNumber: '', pin: '' });
      addLog('system', `Checador ${checador.fullName} inició sesión`, `No. Empleado: ${checador.employeeNumber}`);
    } else {
      alert('Número de empleado o PIN incorrectos');
    }
  };

  const registerChecador = () => {
    if (!newChecador.employeeNumber || !newChecador.fullName || !newChecador.birthDate || !newChecador.photo || !newChecador.pin) {
      alert('Todos los campos son obligatorios, incluyendo el PIN');
      return;
    }
    if (newChecador.pin.length < 4 || newChecador.pin.length > 6 || !/^\d+$/.test(newChecador.pin)) {
      alert('El PIN debe ser de 4 a 6 dígitos numéricos');
      return;
    }
    if (checadores.some(c => c.employeeNumber === newChecador.employeeNumber)) {
      alert('Ya existe un checador con ese número de empleado');
      return;
    }
    const newChec = { ...newChecador, id: Date.now() };
    setChecadores([...checadores, newChec]);
    addLog('system', `Checador registrado: ${newChecador.fullName}`, `No. Empleado: ${newChecador.employeeNumber}`);
    alert('¡Checador registrado exitosamente!');
    setNewChecador({ employeeNumber: '', fullName: '', birthDate: '', photo: null, pin: '', assignedCentros: [], assignedHorarios: [] });
    setView('prefecturaPanel');
  };

  const addNivelAcademico = () => {
    if (newItem && !nivelesAcademicos.includes(newItem)) {
      setNivelesAcademicos([...nivelesAcademicos, newItem]);
      setNewItem('');
      alert('Nivel académico agregado');
    }
  };

  const deleteNivelAcademico = (nivel) => {
    if (window.confirm('¿Eliminar este nivel académico?')) {
      setNivelesAcademicos(nivelesAcademicos.filter(n => n !== nivel));
    }
  };

  const addTipoServicio = () => {
    if (newItem && !tiposServicio.includes(newItem)) {
      setTiposServicio([...tiposServicio, newItem]);
      setNewItem('');
      alert('Tipo de servicio agregado');
    }
  };

  const deleteTipoServicio = (tipo) => {
    if (window.confirm('¿Eliminar este tipo de servicio?')) {
      setTiposServicio(tiposServicio.filter(t => t !== tipo));
    }
  };

  const addEdificio = () => {
    if (newItem && !edificios.includes(newItem)) {
      setEdificios([...edificios, newItem]);
      setNewItem('');
      alert('Edificio agregado');
    }
  };

  const deleteEdificio = (edificio) => {
    if (window.confirm('¿Eliminar este edificio?')) {
      setEdificios(edificios.filter(e => e !== edificio));
    }
  };

  const addSalon = () => {
    if (newItem && !salones.includes(newItem)) {
      setSalones([...salones, newItem]);
      setNewItem('');
      alert('Salón agregado');
    }
  };

  const deleteSalon = (salon) => {
    if (window.confirm('¿Eliminar este salón?')) {
      setSalones(salones.filter(s => s !== salon));
    }
  };

  const addRHUser = () => {
    if (!newRHUser.username || !newRHUser.password || !newRHUser.name) {
      alert('Completa todos los campos');
      return;
    }
    
    const validationErrors = validatePassword(newRHUser.password);
    if (validationErrors.length > 0) {
      alert('La contraseña no cumple con los requisitos:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    const newUser = {
      id: Date.now(),
      username: newRHUser.username,
      password: newRHUser.password,
      name: newRHUser.name,
      role: 'rh',
      firstLogin: true,
      lastPasswordChange: null
    };
    
    setRhUsers([...rhUsers, newUser]);
    setUserCredentials({
      ...userCredentials,
      [`rh_${newUser.id}`]: newUser
    });
    setNewRHUser({ username: '', password: '', name: '' });
    alert('Usuario de RH creado exitosamente');
  };

  const deleteRHUser = (id) => {
    if (id === 1) {
      alert('No puedes eliminar el usuario principal de RH');
      return;
    }
    if (window.confirm('¿Eliminar este usuario de RH?')) {
      setRhUsers(rhUsers.filter(u => u.id !== id));
    }
  };

  const addPrefecturaUser = () => {
    if (!newPrefecturaUser.username || !newPrefecturaUser.password || !newPrefecturaUser.name) {
      alert('Completa todos los campos');
      return;
    }
    
    const validationErrors = validatePassword(newPrefecturaUser.password);
    if (validationErrors.length > 0) {
      alert('La contraseña no cumple con los requisitos:\n\n' + validationErrors.join('\n'));
      return;
    }
    
    const newUser = {
      id: Date.now(),
      username: newPrefecturaUser.username,
      password: newPrefecturaUser.password,
      name: newPrefecturaUser.name,
      role: 'prefectura',
      firstLogin: true,
      lastPasswordChange: null
    };
    
    setPrefecturaUsers([...prefecturaUsers, newUser]);
    setUserCredentials({
      ...userCredentials,
      [`prefectura_${newUser.id}`]: newUser
    });
    setNewPrefecturaUser({ username: '', password: '', name: '' });
    alert('Usuario de Prefectura creado exitosamente');
  };

  const deletePrefecturaUser = (id) => {
    if (id === 1) {
      alert('No puedes eliminar el usuario principal de Prefectura');
      return;
    }
    if (window.confirm('¿Eliminar este usuario de Prefectura?')) {
      setPrefecturaUsers(prefecturaUsers.filter(u => u.id !== id));
    }
  };

  const deleteCentroTrabajo = (id) => {
    if (window.confirm('¿Eliminar este centro de trabajo?')) {
      setCentrosTrabajo(centrosTrabajo.filter(c => c.id !== id));
    }
  };

  const addCentroTrabajo = () => {
    if (!newCentro.name || (!newCentro.isVirtual && (!newCentro.lat || !newCentro.lng))) {
      alert('Completa todos los campos');
      return;
    }
    setCentrosTrabajo([...centrosTrabajo, {
      id: Date.now(),
      name: newCentro.name,
      lat: newCentro.isVirtual ? 0 : parseFloat(newCentro.lat),
      lng: newCentro.isVirtual ? 0 : parseFloat(newCentro.lng),
      radius: newCentro.isVirtual ? 0 : parseInt(newCentro.radius),
      isVirtual: newCentro.isVirtual
    }]);
    setNewCentro({ name: '', lat: '', lng: '', radius: 100, isVirtual: false });
    alert('Centro agregado');
  };

  const handleSignAttendance = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const hasClassNow = teacher.subjects.some(subject => {
      const [startHour, startMin] = subject.horario.split(':').map(Number);
      const turnoInfo = turnos[subject.turno];
      const claseInfo = turnoInfo.clases.find(c => c.hora === subject.horario);
      if (!claseInfo) return false;
      const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
      const currentTotalMin = currentHour * 60 + currentMinute;
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
    });
    if (!hasClassNow) {
      alert('Sin clases en este momento' + (demoMode ? ` (Hora demo: ${demoTime})` : ''));
      return;
    }
    setCurrentUser(teacher);
    setView('signAttendance');
    clearSignature();
  };

  const confirmAttendance = () => {
    if (!signatureData) {
      alert('Realiza tu firma');
      return;
    }
    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSubject = currentUser.subjects.find(subject => {
      const [startHour, startMin] = subject.horario.split(':').map(Number);
      const turnoInfo = turnos[subject.turno];
      const claseInfo = turnoInfo.clases.find(c => c.hora === subject.horario);
      if (!claseInfo) return false;
      const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
      const currentTotalMin = currentHour * 60 + currentMinute;
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
    });
    if (!currentSubject) {
      alert('No se encontró la clase actual');
      return;
    }
    const centroId = centrosTrabajo.find(c => c.name === currentSubject.centroTrabajo)?.id;
    if (centroId && !isInCentroTrabajo(centroId)) {
      alert('No estás en el centro correcto');
      return;
    }
    const record = {
      id: Date.now(),
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      employeeNumber: currentUser.employeeNumber,
      subject: currentSubject.name,
      turno: currentSubject.turno,
      horario: currentSubject.horario,
      classroom: currentSubject.classroom,
      edificio: currentSubject.edificio,
      centroTrabajo: currentSubject.centroTrabajo,
      nivelAcademico: currentSubject.nivelAcademico,
      tipoServicio: currentSubject.tipoServicio,
      date: getEffectiveTime().toLocaleDateString('es-MX'),
      time: getEffectiveTime().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      signature: signatureData,
      registeredBy: userRole === 'checador' ? `Checador: ${currentUser.fullName}` : currentUser.fullName,
      attendanceType: 'Presencial'
    };
    setAttendance([record, ...attendance]);
    addLog('attendance', `Asistencia presencial: ${currentUser.fullName}`, `${currentSubject.name} — ${currentSubject.centroTrabajo} — ${record.time}`);
    setView('success');
    setSignatureData(null);
    setTimeout(() => setView('checadorPanel'), 2000);
  };

  const getTodayAttendance = () => {
    const today = getEffectiveTime().toLocaleDateString('es-MX');
    return attendance.filter(record => record.date === today);
  };

  const exportAttendance = () => {
    const csv = [
      ['No. Empleado', 'Nombre', 'Materia', 'Turno', 'Horario', 'Salón', 'Edificio', 'Centro', 'Nivel', 'Servicio', 'Fecha', 'Hora', 'Tipo', 'IP', 'Dispositivo'],
      ...attendance.map(r => [r.employeeNumber, r.teacherName, r.subject, r.turno, r.horario, r.classroom, r.edificio, r.centroTrabajo, r.nivelAcademico, r.tipoServicio, r.date, r.time, r.attendanceType || 'Presencial', r.ipAddress || '', r.userAgent || ''])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // =====================================================
  // VIRTUAL ATTENDANCE SYSTEM
  // =====================================================

  const isVirtualCenter = (centroName) => {
    const centro = centrosTrabajo.find(c => c.name === centroName);
    return centro ? centro.isVirtual : false;
  };

  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent || 'Desconocido',
      ipAddress: 'IP-' + Math.random().toString(36).substr(2, 8),
      timestamp: new Date().toISOString()
    };
  };

  const generateVirtualToken = () => {
    return 'VL-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 8);
  };

  const getTeachersWithVirtualClassNow = () => {
    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMinute;

    return teachers.filter(teacher => {
      return teacher.subjects.some(subject => {
        if (!isVirtualCenter(subject.centroTrabajo)) return false;
        const [startHour, startMin] = subject.horario.split(':').map(Number);
        const turnoInfo = turnos[subject.turno];
        const claseInfo = turnoInfo?.clases.find(c => c.hora === subject.horario);
        if (!claseInfo) return false;
        const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;
        return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
      });
    });
  };

  const getVirtualSubjectNow = (teacher) => {
    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMinute;

    return teacher.subjects.find(subject => {
      if (!isVirtualCenter(subject.centroTrabajo)) return false;
      const [startHour, startMin] = subject.horario.split(':').map(Number);
      const turnoInfo = turnos[subject.turno];
      const claseInfo = turnoInfo?.clases.find(c => c.hora === subject.horario);
      if (!claseInfo) return false;
      const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
    });
  };

  const sendVirtualLink = (teacher) => {
    const subject = getVirtualSubjectNow(teacher);
    if (!subject) {
      alert('Este maestro no tiene clase virtual activa en este momento');
      return;
    }

    const turnoInfo = turnos[subject.turno];
    const claseInfo = turnoInfo?.clases.find(c => c.hora === subject.horario);
    if (!claseInfo) return;

    const existingLink = virtualLinks.find(
      vl => vl.teacherId === teacher.id && vl.subjectHorario === subject.horario && 
      vl.date === getEffectiveTime().toLocaleDateString('es-MX') && vl.status !== 'expired'
    );
    if (existingLink) {
      alert(`Ya se envió un link para esta clase (${subject.horario}). Estado: ${existingLink.status === 'pending' ? 'Pendiente' : existingLink.status === 'submitted' ? 'Enviado por maestro' : existingLink.status}`);
      return;
    }

    const token = generateVirtualToken();
    const newLink = {
      id: Date.now(),
      token,
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      teacherEmail: teacher.email,
      teacherPhone: teacher.phone,
      employeeNumber: teacher.employeeNumber,
      subjectName: subject.name,
      subjectHorario: subject.horario,
      subjectTurno: subject.turno,
      centroTrabajo: subject.centroTrabajo,
      classroom: subject.classroom,
      edificio: subject.edificio,
      nivelAcademico: subject.nivelAcademico,
      tipoServicio: subject.tipoServicio,
      horaInicio: subject.horario,
      horaFin: claseInfo.horaFin,
      date: getEffectiveTime().toLocaleDateString('es-MX'),
      createdAt: new Date().toISOString(),
      sentBy: currentUser.fullName,
      status: 'pending'
    };

    setVirtualLinks([newLink, ...virtualLinks]);

    const contactMethod = teacher.phone ? `SMS a ${teacher.phone}` : teacher.email ? `correo a ${teacher.email}` : 'notificación';
    alert(`✅ Link enviado exitosamente\n\nMaestro: ${teacher.fullName}\nMateria: ${subject.name}\nHorario: ${subject.horario} - ${claseInfo.horaFin}\nMétodo: ${contactMethod}\n\nToken: ${token}\n\nEl maestro debe acceder al link y enviar su firma + evidencia antes de las ${claseInfo.horaFin}`);
  };

  const openVirtualAttendance = (token) => {
    const link = virtualLinks.find(vl => vl.token === token);
    if (!link) {
      alert('Link no válido');
      return;
    }
    if (link.status !== 'pending') {
      alert('Este link ya fue utilizado o expiró');
      return;
    }

    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMinute;
    const [endH, endM] = link.horaFin.split(':').map(Number);
    const endTotalMin = endH * 60 + endM;

    if (currentTotalMin > endTotalMin) {
      setVirtualLinks(virtualLinks.map(vl => vl.token === token ? { ...vl, status: 'expired' } : vl));
      alert('Este link ha expirado. La hora de clase ya terminó.');
      return;
    }

    setActiveVirtualToken(token);
    setVirtualSignatureData(null);
    setVirtualEvidence(null);
    setView('virtualAttendanceForm');
  };

  const checkDuplicateDevice = (teacherId) => {
    const deviceInfo = getDeviceInfo();
    const recentLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      const now = new Date();
      const diffMinutes = (now - logTime) / (1000 * 60);
      return diffMinutes <= 120 && log.userAgent === deviceInfo.userAgent;
    });

    const otherTeacherLogs = recentLogs.filter(log => log.teacherId !== teacherId);
    if (otherTeacherLogs.length > 0) {
      const alertInfo = {
        id: Date.now(),
        type: 'duplicate_device',
        message: `⚠️ Alerta: El mismo dispositivo fue usado por otro maestro en las últimas 2 horas`,
        teacherId,
        previousTeacherIds: otherTeacherLogs.map(l => l.teacherId),
        previousTeacherNames: otherTeacherLogs.map(l => l.teacherName),
        deviceInfo: deviceInfo.userAgent,
        timestamp: new Date().toISOString(),
        reviewed: false
      };
      setDeviceAlerts(prev => [alertInfo, ...prev]);
      return alertInfo;
    }
    return null;
  };

  const handleEvidenceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe exceder 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setVirtualEvidence(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submitVirtualAttendance = () => {
    if (!virtualSignatureData) {
      alert('Realiza tu firma digital');
      return;
    }
    if (!virtualEvidence) {
      alert('Debes subir una captura de evidencia de la clase');
      return;
    }

    const link = virtualLinks.find(vl => vl.token === activeVirtualToken);
    if (!link) return;

    const deviceInfo = getDeviceInfo();
    const teacher = teachers.find(t => t.id === link.teacherId);

    const newLog = {
      ...deviceInfo,
      teacherId: link.teacherId,
      teacherName: link.teacherName,
      token: activeVirtualToken
    };
    setDeviceLogs(prev => [newLog, ...prev]);

    const duplicateAlert = checkDuplicateDevice(link.teacherId);

    const submission = {
      id: Date.now(),
      token: activeVirtualToken,
      linkId: link.id,
      teacherId: link.teacherId,
      teacherName: link.teacherName,
      employeeNumber: link.employeeNumber,
      subject: link.subjectName,
      turno: link.subjectTurno,
      horario: link.subjectHorario,
      classroom: link.classroom,
      edificio: link.edificio,
      centroTrabajo: link.centroTrabajo,
      nivelAcademico: link.nivelAcademico,
      tipoServicio: link.tipoServicio,
      date: link.date,
      time: getEffectiveTime().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      signature: virtualSignatureData,
      evidence: virtualEvidence,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      deviceAlert: duplicateAlert ? true : false,
      status: 'pending_review',
      submittedAt: new Date().toISOString()
    };

    setVirtualSubmissions(prev => [submission, ...prev]);
    setVirtualLinks(virtualLinks.map(vl => vl.token === activeVirtualToken ? { ...vl, status: 'submitted' } : vl));

    setActiveVirtualToken(null);
    setVirtualSignatureData(null);
    setVirtualEvidence(null);
    setView('virtualSuccess');
    setTimeout(() => setView('selectRole'), 3000);
  };

  const approveVirtualSubmission = (submissionId) => {
    const submission = virtualSubmissions.find(s => s.id === submissionId);
    if (!submission) return;

    setAttendance(prev => [{
      id: Date.now(),
      teacherId: submission.teacherId,
      teacherName: submission.teacherName,
      employeeNumber: submission.employeeNumber,
      subject: submission.subject,
      turno: submission.turno,
      horario: submission.horario,
      classroom: submission.classroom,
      edificio: submission.edificio,
      centroTrabajo: submission.centroTrabajo,
      nivelAcademico: submission.nivelAcademico,
      tipoServicio: submission.tipoServicio,
      date: submission.date,
      time: submission.time,
      signature: submission.signature,
      registeredBy: `Checador: ${currentUser?.fullName || 'Sistema'} (${submission.isContingency ? 'Contingencia' : 'Virtual'})`,
      attendanceType: submission.isContingency ? 'Contingencia' : 'Virtual',
      ipAddress: submission.ipAddress,
      userAgent: submission.userAgent,
      evidence: submission.evidence
    }, ...prev]);

    setVirtualSubmissions(virtualSubmissions.map(s => s.id === submissionId ? { ...s, status: 'approved' } : s));
    setReviewingSubmission(null);
    addLog('approval', `Evidencia APROBADA: ${submission.teacherName}`, `${submission.subject} — ${submission.isContingency ? 'Contingencia' : 'Virtual'} — Aprobado por: ${currentUser?.fullName}`);
    alert('✅ Asistencia virtual aprobada y registrada');
  };

  const rejectVirtualSubmission = (submissionId, reason) => {
    const submission = virtualSubmissions.find(s => s.id === submissionId);
    setVirtualSubmissions(virtualSubmissions.map(s => s.id === submissionId ? { ...s, status: 'rejected', rejectionReason: reason || 'Evidencia insuficiente' } : s));
    setReviewingSubmission(null);
    addLog('rejection', `Evidencia RECHAZADA: ${submission?.teacherName || 'Desconocido'}`, `Motivo: ${reason || 'Evidencia insuficiente'} — Rechazado por: ${currentUser?.fullName}`);
    alert('❌ Asistencia virtual rechazada');
  };

  const getPendingSubmissions = () => virtualSubmissions.filter(s => s.status === 'pending_review');
  const getUnreviewedAlerts = () => deviceAlerts.filter(a => !a.reviewed);

  // =====================================================
  // CONTINGENCY MODE SYSTEM
  // =====================================================

  const activateContingency = (reason) => {
    setContingencyMode(true);
    setContingencyReason(reason || 'Sin especificar');
    setContingencyActivatedAt(new Date().toISOString());
    setContingencyActivatedBy(currentUser?.name || 'Prefectura');
    addLog('contingency', `Contingencia ACTIVADA`, `Motivo: ${reason} — Activado por: ${currentUser?.name || 'Prefectura'}`);
    alert('⚠️ Modo de contingencia ACTIVADO\n\nLos maestros con clases virtuales podrán registrar su asistencia directamente desde la pantalla principal del sistema.');
  };

  const deactivateContingency = () => {
    if (window.confirm('¿Desactivar el modo de contingencia?\n\nLos maestros virtuales ya no podrán auto-registrar asistencia.')) {
      addLog('contingency', `Contingencia DESACTIVADA`, `Desactivado por: ${currentUser?.name || 'Prefectura'}`);
      setContingencyMode(false);
      setContingencyReason('');
      setContingencyActivatedAt(null);
      setContingencyActivatedBy('');
    }
  };

  // Signature structural analysis - compares submitted signature against registered ones
  const analyzeSignatureStructure = (signatureDataUrl) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalInk = 0;
        let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
        let quadrants = [0, 0, 0, 0]; // top-left, top-right, bottom-left, bottom-right
        const midX = canvas.width / 2;
        const midY = canvas.height / 2;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const alpha = data[idx + 3];
            const dark = data[idx] < 128 && data[idx + 1] < 128 && data[idx + 2] < 128;
            if (alpha > 50 && dark) {
              totalInk++;
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              if (x < midX && y < midY) quadrants[0]++;
              else if (x >= midX && y < midY) quadrants[1]++;
              else if (x < midX && y >= midY) quadrants[2]++;
              else quadrants[3]++;
            }
          }
        }

        const boundingWidth = maxX - minX || 1;
        const boundingHeight = maxY - minY || 1;
        const aspectRatio = boundingWidth / boundingHeight;
        const density = totalInk / (canvas.width * canvas.height);
        const totalQ = quadrants.reduce((a, b) => a + b, 0) || 1;
        const distribution = quadrants.map(q => q / totalQ);
        const centerX = totalInk > 0 ? (minX + maxX) / 2 / canvas.width : 0.5;
        const centerY = totalInk > 0 ? (minY + maxY) / 2 / canvas.height : 0.5;

        resolve({ totalInk, aspectRatio, density, distribution, centerX, centerY, boundingWidth, boundingHeight, isEmpty: totalInk < 50 });
      };
      img.onerror = () => resolve({ totalInk: 0, aspectRatio: 1, density: 0, distribution: [0.25, 0.25, 0.25, 0.25], centerX: 0.5, centerY: 0.5, isEmpty: true });
      img.src = signatureDataUrl;
    });
  };

  const validateSignatureAgainstRegistered = async (submittedSignature, registeredSignatures) => {
    if (!registeredSignatures || registeredSignatures.length === 0) {
      return { passed: false, confidence: 0, details: 'No hay firmas registradas para comparar.' };
    }
    if (!submittedSignature) {
      return { passed: false, confidence: 0, details: 'No se proporcionó firma.' };
    }

    const submitted = await analyzeSignatureStructure(submittedSignature);
    if (submitted.isEmpty) {
      return { passed: false, confidence: 0, details: 'La firma está vacía o es demasiado breve.' };
    }

    const registeredAnalyses = await Promise.all(registeredSignatures.map(sig => analyzeSignatureStructure(sig)));
    const validRegistered = registeredAnalyses.filter(a => !a.isEmpty);
    if (validRegistered.length === 0) {
      return { passed: false, confidence: 0, details: 'Las firmas registradas no son válidas.' };
    }

    const scores = validRegistered.map(reg => {
      // Aspect ratio similarity (0-1)
      const arDiff = Math.abs(submitted.aspectRatio - reg.aspectRatio) / Math.max(submitted.aspectRatio, reg.aspectRatio, 0.01);
      const arScore = Math.max(0, 1 - arDiff);

      // Density similarity
      const denDiff = Math.abs(submitted.density - reg.density) / Math.max(submitted.density, reg.density, 0.0001);
      const denScore = Math.max(0, 1 - denDiff);

      // Quadrant distribution similarity (cosine-like)
      let dotProduct = 0, magA = 0, magB = 0;
      for (let i = 0; i < 4; i++) {
        dotProduct += submitted.distribution[i] * reg.distribution[i];
        magA += submitted.distribution[i] ** 2;
        magB += reg.distribution[i] ** 2;
      }
      const distScore = (Math.sqrt(magA) > 0 && Math.sqrt(magB) > 0) ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;

      // Center of mass proximity
      const centerDist = Math.sqrt((submitted.centerX - reg.centerX) ** 2 + (submitted.centerY - reg.centerY) ** 2);
      const centerScore = Math.max(0, 1 - centerDist * 2);

      // Weighted combined score
      return arScore * 0.2 + denScore * 0.25 + distScore * 0.35 + centerScore * 0.2;
    });

    const bestScore = Math.max(...scores);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const confidence = Math.round((bestScore * 0.6 + avgScore * 0.4) * 100);

    // Threshold: 55% minimum to pass
    const passed = confidence >= 55;

    let details = '';
    if (confidence >= 80) details = 'Alta coincidencia con las firmas registradas.';
    else if (confidence >= 65) details = 'Coincidencia aceptable. La estructura general es consistente.';
    else if (confidence >= 55) details = 'Coincidencia mínima aceptada. Se recomienda verificación por checador.';
    else if (confidence >= 40) details = 'Baja coincidencia. La firma difiere significativamente de las registradas.';
    else details = 'No se detectó similitud suficiente con las firmas registradas.';

    return { passed, confidence, details };
  };

  // Get virtual subjects filtered by current time during contingency
  const getContingencySubjectsNow = (teacher) => {
    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMinute;

    return teacher.subjects.filter(subject => {
      if (!isVirtualCenter(subject.centroTrabajo)) return false;
      const [startHour, startMin] = subject.horario.split(':').map(Number);
      const turnoInfo = turnos[subject.turno];
      const claseInfo = turnoInfo?.clases.find(c => c.hora === subject.horario);
      if (!claseInfo) return false;
      const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
    });
  };

  const searchContingencyTeacher = () => {
    if (!contingencyEmployeeSearch.trim()) {
      alert('Ingresa tu número de empleado');
      return;
    }
    const teacher = teachers.find(t => t.employeeNumber === contingencyEmployeeSearch.trim());
    if (!teacher) {
      alert('No se encontró un maestro con ese número de empleado. Verifica e intenta de nuevo.');
      return;
    }
    const virtualSubjects = teacher.subjects.filter(s => isVirtualCenter(s.centroTrabajo));
    if (virtualSubjects.length === 0) {
      alert('Este maestro no tiene clases virtuales asignadas en el sistema.');
      return;
    }
    // Validar que tenga clases virtuales ACTIVAS en este momento
    const activeNow = getContingencySubjectsNow(teacher);
    if (activeNow.length === 0) {
      const now = getEffectiveTime();
      const currentTimeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      const nextClasses = virtualSubjects.map(s => {
        const ti = turnos[s.turno];
        const ci = ti?.clases.find(c => c.hora === s.horario);
        return `• ${s.name} — ${s.horario}${ci ? ` a ${ci.horaFin}` : ''} (${s.centroTrabajo})`;
      }).join('\n');
      alert(`No tienes clases virtuales en curso a las ${currentTimeStr}.\n\nSolo puedes registrar asistencia durante el horario de tus clases virtuales.\n\nTus clases virtuales programadas:\n${nextClasses}`);
      return;
    }
    setContingencyTeacher(teacher);
    setContingencySelectedSubject(null);
    setContingencySignatureData(null);
    setContingencySignatureValidation(null);
    setContingencyEvidences([]);
    setView('contingencySelectClass');
  };

  const handleContingencyEvidenceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe exceder 10MB');
      return;
    }
    if (contingencyEvidences.length >= 3) {
      alert('Máximo 3 evidencias permitidas');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setContingencyEvidences(prev => [...prev, {
        id: Date.now(),
        data: ev.target.result,
        name: file.name,
        uploadedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      }]);
    };
    reader.readAsDataURL(file);
    if (contingencyEvidenceRef.current) contingencyEvidenceRef.current.value = '';
  };

  const removeContingencyEvidence = (id) => {
    setContingencyEvidences(prev => prev.filter(e => e.id !== id));
  };

  const submitContingencyAttendance = () => {
    if (!contingencySignatureData) {
      alert('Realiza tu firma digital');
      return;
    }
    if (!contingencySignatureValidation || !contingencySignatureValidation.passed) {
      alert('Tu firma no pasó la validación del sistema. Por favor, borra e intenta firmar nuevamente de manera consistente con tu firma registrada.');
      return;
    }
    if (contingencyEvidences.length === 0) {
      alert('Debes subir al menos una captura de evidencia');
      return;
    }
    if (!contingencySelectedSubject) {
      alert('Selecciona la clase que deseas reportar');
      return;
    }

    const deviceInfo = getDeviceInfo();

    const newLog = {
      ...deviceInfo,
      teacherId: contingencyTeacher.id,
      teacherName: contingencyTeacher.fullName,
      token: 'CONTINGENCY-' + Date.now()
    };
    setDeviceLogs(prev => [newLog, ...prev]);

    const duplicateAlert = checkDuplicateDevice(contingencyTeacher.id);

    const submission = {
      id: Date.now(),
      token: 'CONTINGENCY-' + Date.now(),
      linkId: null,
      teacherId: contingencyTeacher.id,
      teacherName: contingencyTeacher.fullName,
      employeeNumber: contingencyTeacher.employeeNumber,
      subject: contingencySelectedSubject.name,
      turno: contingencySelectedSubject.turno,
      horario: contingencySelectedSubject.horario,
      classroom: contingencySelectedSubject.classroom,
      edificio: contingencySelectedSubject.edificio,
      centroTrabajo: contingencySelectedSubject.centroTrabajo,
      nivelAcademico: contingencySelectedSubject.nivelAcademico,
      tipoServicio: contingencySelectedSubject.tipoServicio,
      date: getEffectiveTime().toLocaleDateString('es-MX'),
      time: getEffectiveTime().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      signature: contingencySignatureData,
      signatureValidation: contingencySignatureValidation,
      evidence: contingencyEvidences[0]?.data,
      allEvidences: contingencyEvidences,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      deviceAlert: duplicateAlert ? true : false,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
      isContingency: true,
      contingencyReason: contingencyReason
    };

    setVirtualSubmissions(prev => [submission, ...prev]);

    addLog('contingency', `Registro contingencia enviado: ${contingencyTeacher.fullName}`, `${contingencySelectedSubject.name} — ${contingencySelectedSubject.centroTrabajo} — Confianza firma: ${contingencySignatureValidation?.confidence}%`);

    setContingencyTeacher(null);
    setContingencySelectedSubject(null);
    setContingencySignatureData(null);
    setContingencySignatureValidation(null);
    setContingencyEvidences([]);
    setContingencyEmployeeSearch('');
    setView('contingencySuccess');
    setTimeout(() => setView('selectRole'), 3500);
  };

  if (view === 'changePasswordRequired') {
    const changeMessage = getPasswordChangeMessage();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-screen overflow-y-auto relative">
          <button onClick={() => { setCurrentUser(null); setUserRole(null); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setShowPasswordFields({ current: false, new: false, confirm: false }); setView('selectRole'); }}
            className="absolute top-4 left-4 flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
            <ArrowLeft size={18} />Regresar
          </button>
          <div className="text-center mb-6 pt-6">
            <div className="bg-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertCircle className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cambio de Contraseña Requerido</h2>
            <div className="bg-red-50 p-3 rounded-lg mb-3">
              <p className="text-red-800 font-semibold text-sm">{changeMessage}</p>
            </div>
            <p className="text-gray-600 text-sm">Por políticas de seguridad, debes actualizar tu contraseña ahora.</p>
          </div>
          
          {renderPasswordPolicyBox(passwordForm.newPassword)}
          
          <div className="space-y-4">
            {renderPasswordInput('Contraseña Actual', 'current', passwordForm.currentPassword, (e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value }), '#ef4444')}
            
            <div>
              {renderPasswordInput('Nueva Contraseña', 'new', passwordForm.newPassword, (e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value }), '#ef4444')}
              {renderStrengthBar(passwordForm.newPassword)}
            </div>
            
            <div>
              {renderPasswordInput('Confirmar Nueva Contraseña', 'confirm', passwordForm.confirmPassword, (e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }), '#ef4444')}
              {renderPasswordMatchIndicator(passwordForm.newPassword, passwordForm.confirmPassword)}
            </div>
            
            <button onClick={handleChangePassword} className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-semibold shadow-lg">
              <Check className="inline mr-2" size={20} />Cambiar Contraseña Ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'changePasswordFirst') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-screen overflow-y-auto relative">
          <button onClick={() => { setCurrentUser(null); setUserRole(null); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setShowPasswordFields({ current: false, new: false, confirm: false }); setView('selectRole'); }}
            className="absolute top-4 left-4 flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium">
            <ArrowLeft size={18} />Regresar
          </button>
          <div className="text-center mb-6 pt-6">
            <div className="bg-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cambiar Contraseña</h2>
            <p className="text-gray-600 text-sm">Es tu primer inicio de sesión. Por seguridad, debes cambiar tu contraseña.</p>
          </div>
          
          {renderPasswordPolicyBox(passwordForm.newPassword)}
          
          <div className="space-y-4">
            {renderPasswordInput('Contraseña Actual', 'current', passwordForm.currentPassword, (e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value }), '#eab308')}
            
            <div>
              {renderPasswordInput('Nueva Contraseña', 'new', passwordForm.newPassword, (e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value }), '#eab308')}
              {renderStrengthBar(passwordForm.newPassword)}
            </div>
            
            <div>
              {renderPasswordInput('Confirmar Nueva Contraseña', 'confirm', passwordForm.confirmPassword, (e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }), '#eab308')}
              {renderPasswordMatchIndicator(passwordForm.newPassword, passwordForm.confirmPassword)}
            </div>
            
            <button onClick={handleChangePassword} className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-4 rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all font-semibold shadow-lg">
              <Check className="inline mr-2" size={20} />Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showChangePassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Cambiar Contraseña</h2>
            <button onClick={() => { setShowChangePassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setShowPasswordFields({ current: false, new: false, confirm: false }); }}
              className="text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
          </div>
          
          {renderPasswordPolicyBox(passwordForm.newPassword)}
          
          <div className="space-y-4">
            {renderPasswordInput('Contraseña Actual', 'current', passwordForm.currentPassword, (e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value }), '#3b82f6')}
            
            <div>
              {renderPasswordInput('Nueva Contraseña', 'new', passwordForm.newPassword, (e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value }), '#3b82f6')}
              {renderStrengthBar(passwordForm.newPassword)}
            </div>
            
            <div>
              {renderPasswordInput('Confirmar Nueva Contraseña', 'confirm', passwordForm.confirmPassword, (e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value }), '#3b82f6')}
              {renderPasswordMatchIndicator(passwordForm.newPassword, passwordForm.confirmPassword)}
            </div>
            
            <button onClick={handleChangePassword} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all font-semibold shadow-lg">
              <Check className="inline mr-2" size={20} />Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAdminConfig) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-green-700 text-white p-6 rounded-t-2xl z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Configuración del Sistema - FIME</h2>
              <button onClick={() => { setShowAdminConfig(false); setNewItem(''); }} className="text-white hover:text-gray-200">
                <X size={32} />
              </button>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {['centros', 'servicios', 'niveles', 'edificios', 'salones', 'rh', 'prefectura'].map(section => (
                <button key={section} onClick={() => setConfigSection(section)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${configSection === section ? 'bg-white text-green-700' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                  {section === 'centros' ? 'Centros de Trabajo' : 
                   section === 'servicios' ? 'Tipos de Servicio' :
                   section === 'niveles' ? 'Niveles Académicos' :
                   section === 'edificios' ? 'Edificios' :
                   section === 'salones' ? 'Salones' :
                   section === 'rh' ? 'Personal RH' : 'Personal Prefectura'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {configSection === 'centros' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Centros de Trabajo</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Nombre del Centro *</label>
                      <input type="text" value={newCentro.name} onChange={(e) => setNewCentro({ ...newCentro, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Campus Norte" />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={newCentro.isVirtual} onChange={(e) => setNewCentro({ ...newCentro, isVirtual: e.target.checked })} className="mr-2" />
                        <span className="text-gray-700">Centro Virtual (sin GPS)</span>
                      </label>
                    </div>
                    {!newCentro.isVirtual && (
                      <>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Latitud *</label>
                          <input type="number" step="0.0001" value={newCentro.lat} onChange={(e) => setNewCentro({ ...newCentro, lat: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="25.6866" />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Longitud *</label>
                          <input type="number" step="0.0001" value={newCentro.lng} onChange={(e) => setNewCentro({ ...newCentro, lng: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="-100.3161" />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Radio (metros)</label>
                          <input type="number" value={newCentro.radius} onChange={(e) => setNewCentro({ ...newCentro, radius: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="100" />
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={addCentroTrabajo} className="w-full mt-4 bg-green-700 text-white p-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar Centro
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {centrosTrabajo.map(centro => (
                    <div key={centro.id} className="bg-white border-2 border-gray-200 p-4 rounded-lg relative">
                      <div className="font-semibold text-gray-800 mb-2">{centro.name}</div>
                      {centro.isVirtual ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Virtual</span>
                      ) : (
                        <div className="text-xs text-gray-600">
                          <div>Lat: {centro.lat}</div>
                          <div>Lng: {centro.lng}</div>
                          <div>Radio: {centro.radius}m</div>
                        </div>
                      )}
                      <button onClick={() => deleteCentroTrabajo(centro.id)} className="absolute top-2 right-2 text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'servicios' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Tipos de Servicio</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4 flex gap-2">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Ej: Taller" />
                  <button onClick={addTipoServicio} className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {tiposServicio.map(tipo => (
                    <div key={tipo} className="bg-white border-2 border-gray-200 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-gray-800">{tipo}</span>
                      <button onClick={() => deleteTipoServicio(tipo)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'niveles' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Niveles Académicos</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4 flex gap-2">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Ej: Diplomado" />
                  <button onClick={addNivelAcademico} className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {nivelesAcademicos.map(nivel => (
                    <div key={nivel} className="bg-white border-2 border-gray-200 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-gray-800">{nivel}</span>
                      <button onClick={() => deleteNivelAcademico(nivel)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'edificios' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Edificios</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4 flex gap-2">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Ej: Edificio F" />
                  <button onClick={addEdificio} className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {edificios.map(edificio => (
                    <div key={edificio} className="bg-white border-2 border-gray-200 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-gray-800">{edificio}</span>
                      <button onClick={() => deleteEdificio(edificio)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'salones' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Salones</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4 flex gap-2">
                  <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Ej: 401" />
                  <button onClick={addSalon} className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {salones.map(salon => (
                    <div key={salon} className="bg-white border-2 border-gray-200 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-gray-800">{salon}</span>
                      <button onClick={() => deleteSalon(salon)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'rh' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Personal de RH</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Nombre Completo *</label>
                      <input type="text" value={newRHUser.name} onChange={(e) => setNewRHUser({ ...newRHUser, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Juan Pérez" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Usuario *</label>
                      <input type="text" value={newRHUser.username} onChange={(e) => setNewRHUser({ ...newRHUser, username: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="jperez" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Contraseña * (8-15 chars)</label>
                      <input type="password" value={newRHUser.password} onChange={(e) => setNewRHUser({ ...newRHUser, password: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Password@123" />
                    </div>
                  </div>
                  <button onClick={addRHUser} className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar Usuario RH
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rhUsers.map(user => (
                    <div key={user.id} className="bg-white border-2 border-gray-200 p-4 rounded-lg relative">
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-600">Usuario: {user.username}</div>
                      {user.id !== 1 && (
                        <button onClick={() => deleteRHUser(user.id)} className="absolute top-2 right-2 text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configSection === 'prefectura' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Gestionar Personal de Prefectura</h3>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Nombre Completo *</label>
                      <input type="text" value={newPrefecturaUser.name} onChange={(e) => setNewPrefecturaUser({ ...newPrefecturaUser, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="María López" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Usuario *</label>
                      <input type="text" value={newPrefecturaUser.username} onChange={(e) => setNewPrefecturaUser({ ...newPrefecturaUser, username: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="mlopez" />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Contraseña * (8-15 chars)</label>
                      <input type="password" value={newPrefecturaUser.password} onChange={(e) => setNewPrefecturaUser({ ...newPrefecturaUser, password: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Password@123" />
                    </div>
                  </div>
                  <button onClick={addPrefecturaUser} className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800">
                    <Plus className="inline mr-2" size={20} />Agregar Usuario Prefectura
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prefecturaUsers.map(user => (
                    <div key={user.id} className="bg-white border-2 border-gray-200 p-4 rounded-lg relative">
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-600">Usuario: {user.username}</div>
                      {user.id !== 1 && (
                        <button onClick={() => deletePrefecturaUser(user.id)} className="absolute top-2 right-2 text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
          <h3 className="text-2xl font-bold mb-4">Capturar Fotografía</h3>
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <video ref={videoRef} autoPlay playsInline className="w-full" />
          </div>
          <div className="flex gap-4">
            <button onClick={stopCamera} className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600">
              <X className="inline mr-2" size={20} />Cancelar
            </button>
            <button onClick={capturePhoto} className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
              <Camera className="inline mr-2" size={20} />Capturar
            </button>
          </div>
        </div>
        <canvas ref={photoCanvasRef} style={{ display: 'none' }} />
      </div>
    );
  }

  if (view === 'selectRole') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Asistencia</h1>
            <p className="text-gray-600">Universidad Digital</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => setView('adminLogin')} className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-800 transition-all shadow-lg">
              <Users className="inline mr-2" size={24} />Administrador
            </button>
            <button onClick={() => setView('prefecturaLogin')} className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-4 rounded-xl hover:from-indigo-600 hover:to-indigo-800 transition-all shadow-lg">
              <Settings className="inline mr-2" size={24} />Prefectura
            </button>
            <button onClick={() => setView('rhLogin')} className="w-full bg-gradient-to-r from-orange-500 to-orange-700 text-white p-4 rounded-xl hover:from-orange-600 hover:to-orange-800 transition-all shadow-lg">
              <FileText className="inline mr-2" size={24} />Recursos Humanos
            </button>
            <button onClick={() => setView('checadorLogin')} className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg">
              <UserCheck className="inline mr-2" size={24} />Checador
            </button>
            {contingencyMode && (
              <div className="mt-4 pt-4 border-t-2 border-dashed border-orange-300">
                <div className="bg-orange-50 border border-orange-300 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 text-orange-800 text-sm font-semibold">
                    <AlertCircle size={16} />
                    <span>Modo Contingencia Activo</span>
                  </div>
                  <p className="text-orange-700 text-xs mt-1">Motivo: {contingencyReason}</p>
                </div>
                <button onClick={() => setView('contingencyLogin')} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg animate-pulse">
                  <Wifi className="inline mr-2" size={24} />Asistencia Virtual — Contingencia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'adminLogin' || view === 'rhLogin' || view === 'prefecturaLogin') {
    const roleInfo = {
      adminLogin: { title: 'Administrador', icon: Users, role: 'admin' },
      rhLogin: { title: 'Recursos Humanos', icon: FileText, role: 'rh' },
      prefecturaLogin: { title: 'Prefectura', icon: Settings, role: 'prefectura' }
    };
    const info = roleInfo[view];
    const IconComponent = info.icon;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <button onClick={() => setView('selectRole')} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <div className="text-center mb-8">
            <div className="bg-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Acceso {info.title}</h2>
            <p className="text-green-700 font-semibold">FIME - UANL</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Usuario</label>
              <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-700" placeholder="Ingresa tu usuario" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Contraseña</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-700" placeholder="Ingresa tu contraseña" />
            </div>
            <button onClick={() => handleLogin(info.role)} className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-xl hover:from-green-700 hover:to-green-900 transition-all font-semibold">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'checadorLogin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <button onClick={() => setView('selectRole')} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <div className="text-center mb-8">
            <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Acceso Checador</h2>
            <p className="text-gray-600">Ingresa tu número de empleado y PIN</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Número de Empleado</label>
              <input type="text" value={checadorLoginForm.employeeNumber}
                onChange={(e) => setChecadorLoginForm({ ...checadorLoginForm, employeeNumber: e.target.value })}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-center text-2xl font-bold tracking-widest"
                placeholder="12345" inputMode="numeric" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">PIN de Acceso</label>
              <input type="password" value={checadorLoginForm.pin}
                onChange={(e) => setChecadorLoginForm({ ...checadorLoginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                onKeyDown={(e) => e.key === 'Enter' && handleChecadorLogin()}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-center text-3xl tracking-widest"
                placeholder="••••" inputMode="numeric" maxLength={6} />
              <div className="flex justify-center gap-2 mt-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full ${i < checadorLoginForm.pin.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                ))}
              </div>
            </div>
            <button onClick={handleChecadorLogin}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-800 transition-all font-semibold text-lg">
              <UserCheck className="inline mr-2" size={24} />Iniciar Sesión
            </button>
            {checadores.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-4">No hay checadores registrados. Solicite su registro en Prefectura.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'adminPanel') {
    const changeMessage = getPasswordChangeMessage();
    const shouldShowAlert = changeMessage && currentUser.lastPasswordChange && isPasswordChangeRequired(currentUser.lastPasswordChange);
    
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: activeSessionRole ? '24px' : '0' }}>
        <RoleBanner />
        <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-6 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-2">
                  <div className="text-green-700 font-bold text-2xl px-2">FIME</div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Panel de Administración</h1>
                  <p className="text-sm opacity-90">Facultad de Ingeniería Mecánica y Eléctrica - UANL</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                  <Settings size={20} />Cambiar Contraseña
                </button>
                <button onClick={() => { setCurrentUser(null); setActiveSessionRole(null); setView('selectRole'); }} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                  <LogOut size={20} />Salir
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          {/* DEMO MODE CONTROLS */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-yellow-800">🕐 Modo Demo — Simular Horario</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-yellow-700 font-semibold">{demoMode ? 'ACTIVO' : 'Inactivo'}</span>
                <div className={`relative w-12 h-6 rounded-full transition-colors ${demoMode ? 'bg-yellow-500' : 'bg-gray-300'}`}
                  onClick={() => { setDemoMode(!demoMode); addLog('system', demoMode ? 'Modo demo DESACTIVADO' : 'Modo demo ACTIVADO', demoMode ? '' : `Hora simulada: ${demoTime}`); }}>
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </div>
              </label>
            </div>
            {demoMode && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-yellow-700 font-medium mb-1 text-sm">Hora simulada</label>
                  <input type="time" value={demoTime} onChange={(e) => setDemoTime(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg bg-white text-lg font-bold text-center" />
                </div>
                <div>
                  <label className="block text-yellow-700 font-medium mb-1 text-sm">Fecha simulada</label>
                  <input type="date" value={demoDate} onChange={(e) => setDemoDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg bg-white" />
                </div>
                <div className="col-span-2 text-center">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <span className="text-yellow-800 font-semibold">Hora efectiva del sistema: </span>
                    <span className="text-yellow-900 font-bold text-xl">{demoTime}</span>
                    <span className="text-yellow-700 text-sm ml-2">({demoDate})</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Todos los cálculos de horario usarán esta hora. Los demás roles verán esta hora simulada.</p>
                </div>
              </div>
            )}
          </div>
          
          {shouldShowAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-1">Recordatorio: Cambio de Contraseña</h3>
                  <p className="text-yellow-700">{changeMessage}</p>
                  <button onClick={() => setShowChangePassword(true)} className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold">
                    Cambiar Ahora
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-700">
              <div className="text-green-700 font-semibold mb-2">Centros</div>
              <div className="text-3xl font-bold text-gray-800">{centrosTrabajo.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-700">
              <div className="text-green-700 font-semibold mb-2">Maestros</div>
              <div className="text-3xl font-bold text-gray-800">{teachers.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-700">
              <div className="text-green-700 font-semibold mb-2">Checadores</div>
              <div className="text-3xl font-bold text-gray-800">{checadores.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-700">
              <div className="text-green-700 font-semibold mb-2">Asistencias Hoy</div>
              <div className="text-3xl font-bold text-gray-800">{getTodayAttendance().length}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Configuración del Sistema</h3>
              <button onClick={() => setShowAdminConfig(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
                <Settings className="inline mr-2" size={20} />Configurar Sistema
              </button>
            </div>
          </div>

          {contingencyMode && (
            <div className="bg-orange-50 border-2 border-orange-400 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <Wifi className="text-orange-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-orange-800 mb-1">Modo Contingencia Activo</h3>
                  <p className="text-orange-700 text-sm">Motivo: <strong>{contingencyReason}</strong> — Activado por: {contingencyActivatedBy} — {contingencyActivatedAt ? new Date(contingencyActivatedAt).toLocaleString('es-MX') : ''}</p>
                  <p className="text-orange-600 text-xs mt-1">La gestión del modo contingencia se realiza desde el panel de Prefectura.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Gestionar Centros de Trabajo</h3>
              <button onClick={() => setView('addCentro')} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
                <Plus className="inline mr-2" size={20} />Agregar Centro
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {centrosTrabajo.map(centro => (
                <div key={centro.id} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-700">
                  <div className="font-semibold text-gray-800">{centro.name}</div>
                  {centro.isVirtual ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Virtual</span>
                  ) : (
                    <div className="text-xs text-gray-600 mt-2">Radio: {centro.radius}m</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Turnos del Sistema</h3>
            {Object.entries(turnos).map(([key, turno]) => (
              <div key={key} className="mb-4">
                <div className="font-semibold text-gray-800 mb-2">{turno.name}</div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {turno.clases.map(clase => (
                    <div key={clase.id} className="bg-green-50 p-2 rounded border-l-2 border-green-700 text-center text-sm">
                      <div className="font-semibold text-green-700">{clase.id}</div>
                      <div className="text-xs text-gray-600">{clase.hora}-{clase.horaFin}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* HIDDEN RESET BUTTON - double click to reveal */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <details className="group">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">Herramientas de desarrollo</summary>
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Zona de Peligro</h3>
                <p className="text-red-600 text-sm mb-4">Estas acciones son irreversibles y eliminarán todos los datos del sistema.</p>
                <button onClick={resetAllData} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold">
                  <Trash2 className="inline mr-2" size={20} />Resetear TODOS los Datos
                </button>
                <div className="mt-4 text-xs text-gray-500">
                  <p>localStorage usado: {(() => { try { return Math.round(JSON.stringify(localStorage.getItem('fime_app_data') || '').length / 1024) + ' KB'; } catch(e) { return 'N/A'; } })()}</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'addCentro') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <button onClick={() => setView('adminPanel')} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Agregar Centro de Trabajo</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre del Centro *</label>
              <input type="text" value={newCentro.name} onChange={(e) => setNewCentro({ ...newCentro, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Ej: Campus Norte" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" checked={newCentro.isVirtual} onChange={(e) => setNewCentro({ ...newCentro, isVirtual: e.target.checked })} className="mr-2" />
              <label className="text-gray-700">Centro Virtual (sin validación GPS)</label>
            </div>
            {!newCentro.isVirtual && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Latitud *</label>
                  <input type="number" step="0.0001" value={newCentro.lat} onChange={(e) => setNewCentro({ ...newCentro, lat: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="25.6866" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Longitud *</label>
                  <input type="number" step="0.0001" value={newCentro.lng} onChange={(e) => setNewCentro({ ...newCentro, lng: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="-100.3161" />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Radio (metros)</label>
                  <input type="number" value={newCentro.radius} onChange={(e) => setNewCentro({ ...newCentro, radius: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="100" />
                </div>
              </>
            )}
            <button onClick={addCentroTrabajo} className="w-full bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 font-semibold">
              <Plus className="inline mr-2" size={20} />Agregar Centro
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'prefecturaPanel') {
    const changeMessage = getPasswordChangeMessage();
    const shouldShowAlert = changeMessage && currentUser.lastPasswordChange && isPasswordChangeRequired(currentUser.lastPasswordChange);
    
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: activeSessionRole ? '24px' : '0' }}>
        <RoleBanner />
        <div className="bg-gradient-to-r from-green-700 to-green-900 text-white p-6 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-2">
                  <div className="text-green-700 font-bold text-2xl px-2">FIME</div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Panel de Prefectura</h1>
                  <p className="text-sm opacity-90">Facultad de Ingeniería Mecánica y Eléctrica - UANL</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                  <Settings size={20} />Cambiar Contraseña
                </button>
                <button onClick={() => { setCurrentUser(null); setActiveSessionRole(null); setView('selectRole'); }} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                  <LogOut size={20} />Salir
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          {shouldShowAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-1">Recordatorio: Cambio de Contraseña</h3>
                  <p className="text-yellow-700">{changeMessage}</p>
                  <button onClick={() => setShowChangePassword(true)} className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold">
                    Cambiar Ahora
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className={`rounded-xl shadow-lg p-6 mb-6 border-2 ${contingencyMode ? 'bg-orange-50 border-orange-400' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Wifi size={22} className={contingencyMode ? 'text-orange-600' : 'text-gray-400'} />
                  Modo Contingencia — Clases Virtuales
                </h3>
                <p className="text-gray-600 text-sm mt-1">Permite a maestros con clases en línea registrar asistencia directamente sin intervención del checador.</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${contingencyMode ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {contingencyMode ? 'ACTIVO' : 'INACTIVO'}
              </div>
            </div>
            {contingencyMode ? (
              <div>
                <div className="bg-orange-100 p-4 rounded-lg mb-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><span className="text-orange-700">Motivo:</span><div className="font-semibold text-orange-900">{contingencyReason}</div></div>
                    <div><span className="text-orange-700">Activado por:</span><div className="font-semibold text-orange-900">{contingencyActivatedBy}</div></div>
                    <div><span className="text-orange-700">Desde:</span><div className="font-semibold text-orange-900">{contingencyActivatedAt ? new Date(contingencyActivatedAt).toLocaleString('es-MX') : '-'}</div></div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-xs text-orange-700">
                  <strong>Nota:</strong> Mientras está activo, los maestros con clases virtuales pueden acceder desde la pantalla principal. La firma se valida automáticamente contra sus 3 firmas registradas. Las evidencias quedan pendientes de tu revisión.
                </div>
                <button onClick={deactivateContingency} className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold">
                  <X className="inline mr-2" size={18} />Desactivar Contingencia
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Motivo de la contingencia *</label>
                  <select value={contingencyReason} onChange={(e) => setContingencyReason(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-3">
                    <option value="">Selecciona un motivo</option>
                    <option value="Falla en red / Sin internet en checadores">Falla en red / Sin internet en checadores</option>
                    <option value="Falla eléctrica en centro de trabajo">Falla eléctrica en centro de trabajo</option>
                    <option value="Falla del sistema principal">Falla del sistema principal</option>
                    <option value="Emergencia climatológica">Emergencia climatológica</option>
                    <option value="Mantenimiento programado">Mantenimiento programado</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <button onClick={() => {
                  if (!contingencyReason) { alert('Selecciona un motivo de contingencia'); return; }
                  activateContingency(contingencyReason);
                }} className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold">
                  <AlertCircle className="inline mr-2" size={18} />Activar Modo Contingencia
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Checadores</h2>
              <button onClick={() => setView('registerChecador')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
                <Plus className="inline mr-2" size={20} />Registrar Checador
              </button>
            </div>
            <p className="text-gray-600 mb-4">Total: {checadores.length}</p>
            {checadores.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {checadores.map(checador => (
                  <div key={checador.id} className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {checador.photo && <img src={checador.photo} alt={checador.fullName} className="w-12 h-12 rounded-full object-cover" />}
                      <div>
                        <div className="font-semibold text-gray-800">{checador.fullName}</div>
                        <div className="text-sm text-gray-600">No. {checador.employeeNumber}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVITY LOG */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">📋 Log de Actividad</h2>
              <div className="flex gap-2">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">{activityLog.length} eventos</span>
                {activityLog.length > 0 && (
                  <button onClick={() => { if (window.confirm('¿Limpiar el log de actividad?')) { setActivityLog([]); } }}
                    className="text-sm text-red-500 hover:text-red-700 px-3 py-1">Limpiar</button>
                )}
              </div>
            </div>
            {activityLog.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad registrada aún.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLog.slice(0, 50).map(entry => {
                  const typeStyles = {
                    attendance: { bg: 'bg-green-50', border: 'border-green-400', dot: 'bg-green-500', label: '✅ Asistencia' },
                    contingency: { bg: 'bg-orange-50', border: 'border-orange-400', dot: 'bg-orange-500', label: '⚡ Contingencia' },
                    approval: { bg: 'bg-blue-50', border: 'border-blue-400', dot: 'bg-blue-500', label: '👍 Aprobación' },
                    rejection: { bg: 'bg-red-50', border: 'border-red-400', dot: 'bg-red-500', label: '❌ Rechazo' },
                    security: { bg: 'bg-yellow-50', border: 'border-yellow-400', dot: 'bg-yellow-500', label: '🔒 Seguridad' },
                    system: { bg: 'bg-gray-50', border: 'border-gray-400', dot: 'bg-gray-500', label: '⚙️ Sistema' }
                  };
                  const style = typeStyles[entry.type] || typeStyles.system;
                  return (
                    <div key={entry.id} className={`${style.bg} border-l-4 ${style.border} p-3 rounded-r-lg`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 ${style.dot} rounded-full mt-2 flex-shrink-0`}></div>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{entry.message}</div>
                            {entry.details && <div className="text-xs text-gray-600 mt-0.5">{entry.details}</div>}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-3">{entry.displayTime}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'registerChecador') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <button onClick={() => setView('prefecturaPanel')} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Registrar Checador</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Número de Empleado *</label>
              <input type="text" value={newChecador.employeeNumber} onChange={(e) => setNewChecador({ ...newChecador, employeeNumber: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="54321" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre Completo *</label>
              <input type="text" value={newChecador.fullName} onChange={(e) => setNewChecador({ ...newChecador, fullName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="María López" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Fecha de Nacimiento *</label>
              <input type="date" value={newChecador.birthDate} onChange={(e) => setNewChecador({ ...newChecador, birthDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Fotografía *</label>
              {newChecador.photo ? (
                <div className="text-center">
                  <img src={newChecador.photo} alt="Preview" className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
                  <button onClick={retakePhoto} className="text-blue-600 hover:text-blue-800">Tomar otra</button>
                </div>
              ) : (
                <button onClick={() => startCamera('checador')} className="w-full bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700">
                  <Camera className="inline mr-2" size={20} />Tomar Fotografía
                </button>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">PIN de Acceso * (4-6 dígitos)</label>
              <input type="password" value={newChecador.pin || ''}
                onChange={(e) => setNewChecador({ ...newChecador, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest" placeholder="••••" inputMode="numeric" maxLength={6} />
              <p className="text-xs text-gray-500 mt-1">El checador usará este PIN junto con su número de empleado para iniciar sesión</p>
              <div className="flex justify-center gap-2 mt-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < (newChecador.pin || '').length ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                ))}
              </div>
            </div>
            <button onClick={registerChecador} className="w-full bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 font-semibold">
              <Check className="inline mr-2" size={20} />Registrar Checador
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'rhPanel') {
    const changeMessage = getPasswordChangeMessage();
    const shouldShowAlert = changeMessage && currentUser.lastPasswordChange && isPasswordChangeRequired(currentUser.lastPasswordChange);
    
    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: activeSessionRole ? '24px' : '0' }}>
        <RoleBanner />
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Panel de Recursos Humanos</h1>
            <div className="flex gap-2">
              <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                <Settings size={20} />Cambiar Contraseña
              </button>
              <button onClick={() => { setCurrentUser(null); setActiveSessionRole(null); setView('selectRole'); }} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                <LogOut size={20} />Salir
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          {shouldShowAlert && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-1">Recordatorio: Cambio de Contraseña</h3>
                  <p className="text-yellow-700">{changeMessage}</p>
                  <button onClick={() => setShowChangePassword(true)} className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-semibold">
                    Cambiar Ahora
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-orange-600 font-semibold mb-2">Total Maestros</div>
              <div className="text-3xl font-bold text-gray-800">{teachers.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-green-600 font-semibold mb-2">Asistencias Hoy</div>
              <div className="text-3xl font-bold text-gray-800">{getTodayAttendance().length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-blue-600 font-semibold mb-2">Total Registros</div>
              <div className="text-3xl font-bold text-gray-800">{attendance.length}</div>
            </div>
          </div>
          <div className="flex gap-4 mb-6">
            <button onClick={() => setView('registerTeacher')} className="flex-1 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 font-semibold">
              <Plus className="inline mr-2" size={20} />Registrar Maestro
            </button>
            {attendance.length > 0 && (
              <button onClick={exportAttendance} className="flex-1 bg-orange-600 text-white p-4 rounded-xl hover:bg-orange-700 font-semibold">
                <Download className="inline mr-2" size={20} />Descargar Reporte
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Maestros Registrados</h2>
            {teachers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay maestros</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4 mb-3">
                      {teacher.photo && <img src={teacher.photo} alt={teacher.fullName} className="w-16 h-16 rounded-full object-cover" />}
                      <div>
                        <div className="font-semibold text-gray-800">{teacher.fullName}</div>
                        <div className="text-sm text-gray-600">No. {teacher.employeeNumber}</div>
                        <div className="text-sm text-gray-600">Materias: {teacher.subjects.length}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'registerTeacher') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 my-8">
          <button onClick={() => { resetRegistration(); setView('rhPanel'); }} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Registro de Maestro</h2>
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map(step => (
              <div key={step} className={`flex-1 text-center ${registrationStep >= step ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${registrationStep >= step ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>{step}</div>
                <div className="text-sm">{step === 1 ? 'Datos' : step === 2 ? 'Materias' : 'Firmas'}</div>
              </div>
            ))}
          </div>
          {registrationStep === 1 && (
            <div className="space-y-6">
              <div><label className="block text-gray-700 font-medium mb-2">Número de Empleado *</label>
                <input type="text" value={newTeacher.employeeNumber} onChange={(e) => setNewTeacher({ ...newTeacher, employeeNumber: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="12345" /></div>
              <div><label className="block text-gray-700 font-medium mb-2">Nombre Completo *</label>
                <input type="text" value={newTeacher.fullName} onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Dr. Juan Pérez" /></div>
              <div><label className="block text-gray-700 font-medium mb-2">Correo Electrónico *</label>
                <input type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="juan.perez@uanl.edu.mx" /></div>
              <div><label className="block text-gray-700 font-medium mb-2">Número Celular *</label>
                <input type="tel" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="81 1234 5678" /></div>
              <div><label className="block text-gray-700 font-medium mb-2">Fotografía *</label>
                {newTeacher.photo ? (
                  <div className="text-center"><img src={newTeacher.photo} alt="Preview" className="w-32 h-32 rounded-full object-cover mx-auto mb-4" />
                    <button onClick={retakePhoto} className="text-blue-600 hover:text-blue-800">Tomar otra</button></div>
                ) : (
                  <button onClick={() => startCamera('teacher')} className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"><Camera className="inline mr-2" size={20} />Tomar Fotografía</button>
                )}</div>
              <button onClick={() => {
                if (!newTeacher.employeeNumber || !newTeacher.fullName || !newTeacher.email || !newTeacher.phone || !newTeacher.photo) { alert('Completa todos los campos'); return; }
                setRegistrationStep(2);
              }} className="w-full bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 font-semibold">Siguiente →</button>
            </div>
          )}
          {registrationStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Agregar Materia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-gray-700 font-medium mb-2">Nombre *</label>
                    <input type="text" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" placeholder="Cálculo" /></div>
                  <div><label className="block text-gray-700 font-medium mb-2">Turno *</label>
                    <select value={newSubject.turno} onChange={(e) => setNewSubject({ ...newSubject, turno: e.target.value, horario: '' })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="">Selecciona</option>
                      {Object.keys(turnos).map(t => <option key={t} value={t}>{turnos[t].name}</option>)}
                    </select></div>
                  {newSubject.turno && (
                    <div><label className="block text-gray-700 font-medium mb-2">Horario *</label>
                      <select value={newSubject.horario} onChange={(e) => setNewSubject({ ...newSubject, horario: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                        <option value="">Selecciona</option>
                        {turnos[newSubject.turno].clases.map(c => <option key={c.id} value={c.hora}>{c.id} ({c.hora}-{c.horaFin})</option>)}
                      </select></div>
                  )}
                  <div><label className="block text-gray-700 font-medium mb-2">Salón *</label>
                    <select value={newSubject.classroom} onChange={(e) => setNewSubject({ ...newSubject, classroom: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="">Selecciona</option>
                      {salones.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div><label className="block text-gray-700 font-medium mb-2">Edificio *</label>
                    <select value={newSubject.edificio} onChange={(e) => setNewSubject({ ...newSubject, edificio: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="">Selecciona</option>
                      {edificios.map(e => <option key={e} value={e}>{e}</option>)}
                    </select></div>
                  <div><label className="block text-gray-700 font-medium mb-2">Centro *</label>
                    <select value={newSubject.centroTrabajo} onChange={(e) => setNewSubject({ ...newSubject, centroTrabajo: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="">Selecciona</option>
                      {centrosTrabajo.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select></div>
                  <div><label className="block text-gray-700 font-medium mb-2">Nivel *</label>
                    <select value={newSubject.nivelAcademico} onChange={(e) => setNewSubject({ ...newSubject, nivelAcademico: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="">Selecciona</option>
                      {nivelesAcademicos.map(n => <option key={n} value={n}>{n}</option>)}
                    </select></div>
                  <div><label className="block text-gray-700 font-medium mb-2">Servicio *</label>
                    <select value={newSubject.tipoServicio} onChange={(e) => setNewSubject({ ...newSubject, tipoServicio: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg">
                      <option value="">Selecciona</option>
                      {tiposServicio.map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                </div>
                <button onClick={addSubject} className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"><Plus className="inline mr-2" size={20} />Agregar Materia</button>
              </div>
              {newTeacher.subjects.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Materias ({newTeacher.subjects.length})</h3>
                  <div className="space-y-3">
                    {newTeacher.subjects.map(s => (
                      <div key={s.id} className="bg-green-50 p-4 rounded-lg flex justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{s.name}</div>
                          <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                            <div>Turno: {s.turno}</div>
                            <div>Hora: {s.horario}</div>
                            <div>Salón: {s.classroom}</div>
                            <div>Edificio: {s.edificio}</div>
                            <div>Centro: {s.centroTrabajo}</div>
                            <div>Nivel: {s.nivelAcademico}</div>
                          </div>
                        </div>
                        <button onClick={() => removeSubject(s.id)} className="text-red-600 hover:text-red-800 ml-4"><Trash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={() => setRegistrationStep(1)} className="flex-1 bg-gray-300 text-gray-700 p-4 rounded-xl hover:bg-gray-400">← Anterior</button>
                <button onClick={() => {
                  if (newTeacher.subjects.length === 0) { alert('Agrega al menos una materia'); return; }
                  setRegistrationStep(3);
                }} className="flex-1 bg-green-600 text-white p-4 rounded-xl hover:bg-green-700">Siguiente →</button>
              </div>
            </div>
          )}
          {registrationStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg"><AlertCircle className="inline text-blue-600 mr-2" size={20} />
                <span className="text-blue-800">Registra 3 firmas para validación</span></div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Firma {signatureAttempts + 1} de 3</h3>
                <div className="border-4 border-gray-300 rounded-xl overflow-hidden bg-white">
                  <canvas ref={canvasRef} width={800} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full touch-none" style={{ touchAction: 'none' }} />
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={clearSignature} className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"><X className="inline mr-2" size={20} />Borrar</button>
                  <button onClick={saveSignature} className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"><Check className="inline mr-2" size={20} />Guardar Firma {signatureAttempts + 1}</button>
                </div>
              </div>
              {registeredSignatures.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-3">Firmas Registradas:</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {registeredSignatures.map((sig, i) => (
                      <div key={i} className="border-2 border-green-500 rounded-lg p-2">
                        <img src={sig} alt={`Firma ${i + 1}`} className="w-full" />
                        <div className="text-center text-sm text-green-600 font-semibold mt-2"><Check className="inline" size={16} /> Firma {i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setRegistrationStep(2)} className="w-full bg-gray-300 text-gray-700 p-4 rounded-xl hover:bg-gray-400">← Anterior</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <CheckCircle size={100} className="mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold mb-2">¡Asistencia Registrada!</h2>
          <p className="text-xl opacity-90">Firma validada correctamente</p>
        </div>
      </div>
    );
  }

  if (view === 'virtualSuccess') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <CheckCircle size={100} className="mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold mb-2">¡Evidencia Enviada!</h2>
          <p className="text-xl opacity-90">Tu firma y evidencia han sido enviadas al checador para revisión</p>
          <p className="text-lg opacity-75 mt-2">Recibirás confirmación una vez aprobada</p>
        </div>
      </div>
    );
  }

  if (view === 'contingencySuccess') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <CheckCircle size={100} className="mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold mb-2">¡Registro Enviado!</h2>
          <p className="text-xl opacity-90 mb-3">Tu asistencia de contingencia ha sido registrada</p>
          <div className="bg-white bg-opacity-20 rounded-xl p-4">
            <p className="text-lg opacity-90">La firma y evidencias serán revisadas por el checador cuando se restablezca el sistema.</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'contingencyLogin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <button onClick={() => { setContingencyEmployeeSearch(''); setView('selectRole'); }} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <div className="text-center mb-6">
            <div className="bg-orange-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Asistencia de Contingencia</h2>
            <p className="text-green-700 font-semibold">FIME — UANL</p>
          </div>
          <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-orange-800">
                <div className="font-semibold mb-1">Modo Contingencia</div>
                <div>Motivo: {contingencyReason}</div>
                <div className="text-xs mt-1 opacity-75">Activado: {contingencyActivatedAt ? new Date(contingencyActivatedAt).toLocaleString('es-MX') : '-'}</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Número de Empleado</label>
              <input type="text" value={contingencyEmployeeSearch}
                onChange={(e) => setContingencyEmployeeSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') searchContingencyTeacher(); }}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-center text-2xl font-bold tracking-widest"
                placeholder="12345" autoFocus />
            </div>
            <button onClick={searchContingencyTeacher}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-semibold text-lg">
              <User className="inline mr-2" size={22} />Identificarme
            </button>
          </div>
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 text-center">
              <Monitor className="inline mr-1" size={12} />Se registrará la IP y dispositivo utilizado para seguridad
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'contingencySelectClass') {
    if (!contingencyTeacher) { setView('contingencyLogin'); return null; }
    const activeVirtualSubjects = getContingencySubjectsNow(contingencyTeacher);
    const now = getEffectiveTime();
    const currentTimeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();

    // Si ya no hay clases activas (puede pasar si el maestro tardó), regresar
    if (activeVirtualSubjects.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600">
          <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-1"><Wifi size={24} /><h1 className="text-xl font-bold">Contingencia — Sin Clases Activas</h1></div>
              <p className="text-sm opacity-90">FIME — UANL • Hora actual: {currentTimeStr}</p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Clock className="mx-auto text-gray-400 mb-4" size={56} />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Sin clases virtuales en este momento</h3>
              <p className="text-gray-500 mb-6">Ninguna de tus materias virtuales tiene horario activo a las {currentTimeStr}. Solo puedes registrar asistencia durante el horario de tus clases.</p>
              <button onClick={() => { setContingencyTeacher(null); setContingencyEmployeeSearch(''); setView('contingencyLogin'); }}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold">
                <ArrowLeft className="inline mr-2" size={18} />Regresar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600">
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-1">
              <Wifi size={24} />
              <h1 className="text-xl font-bold">Contingencia — Selecciona tu Clase</h1>
            </div>
            <p className="text-sm opacity-90">FIME — UANL • Hora actual: {currentTimeStr}</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {contingencyTeacher.photo && <img src={contingencyTeacher.photo} alt={contingencyTeacher.fullName} className="w-16 h-16 rounded-full object-cover border-2 border-orange-400" />}
              <div>
                <div className="font-semibold text-gray-800 text-lg">{contingencyTeacher.fullName}</div>
                <div className="text-sm text-gray-600">No. Empleado: {contingencyTeacher.employeeNumber}</div>
                {contingencyTeacher.email && <div className="text-xs text-gray-500">{contingencyTeacher.email}</div>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Clases Virtuales en Curso</h2>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {currentTimeStr}
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">Se muestran únicamente las materias virtuales cuyo horario coincide con la hora actual. Selecciona la clase para la cual deseas registrar asistencia.</p>
            
            <div className="space-y-3">
              {activeVirtualSubjects.map((subject, idx) => {
                const turnoInfo = turnos[subject.turno];
                const claseInfo = turnoInfo?.clases.find(c => c.hora === subject.horario);
                // Calcular tiempo restante de clase
                let timeRemaining = '';
                if (claseInfo) {
                  const [endH, endM] = claseInfo.horaFin.split(':').map(Number);
                  const endTotalMin = endH * 60 + endM;
                  const remainingMin = endTotalMin - currentTotalMin;
                  timeRemaining = remainingMin > 0 ? `${remainingMin} min restantes` : 'Por finalizar';
                }
                return (
                  <button key={idx} onClick={() => { setContingencySelectedSubject(subject); setContingencySignatureData(null); setContingencySignatureValidation(null); setContingencyEvidences([]); setView('contingencyForm'); }}
                    className="w-full text-left bg-green-50 hover:bg-green-100 border-2 border-green-300 hover:border-green-500 p-5 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          {subject.name}
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            EN CURSO
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                          <span><Clock className="inline mr-1" size={13} />{subject.horario}{claseInfo ? ` - ${claseInfo.horaFin}` : ''}</span>
                          <span><Globe className="inline mr-1" size={13} />{subject.centroTrabajo}</span>
                          <span>Turno: {subject.turno}</span>
                          <span>Nivel: {subject.nivelAcademico}</span>
                        </div>
                        {timeRemaining && (
                          <div className="mt-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                            ⏱ {timeRemaining}
                          </div>
                        )}
                      </div>
                      <ArrowLeft className="text-green-500 rotate-180 flex-shrink-0" size={24} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => { setContingencyTeacher(null); setContingencyEmployeeSearch(''); setView('contingencyLogin'); }}
            className="w-full bg-white bg-opacity-20 text-white p-3 rounded-xl hover:bg-opacity-30 font-semibold">
            <ArrowLeft className="inline mr-2" size={18} />Regresar
          </button>
        </div>
      </div>
    );
  }

  if (view === 'contingencyForm') {
    if (!contingencyTeacher || !contingencySelectedSubject) { setView('contingencyLogin'); return null; }
    const turnoInfo = turnos[contingencySelectedSubject.turno];
    const claseInfo = turnoInfo?.clases.find(c => c.hora === contingencySelectedSubject.horario);

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600">
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-1">
              <Wifi size={24} />
              <h1 className="text-xl font-bold">Registro de Contingencia</h1>
            </div>
            <p className="text-sm opacity-90">FIME — UANL • {contingencyTeacher.fullName}</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6">

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Datos de la Clase</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-orange-50 p-3 rounded-lg"><span className="text-gray-500">Materia:</span><div className="font-semibold text-gray-800">{contingencySelectedSubject.name}</div></div>
              <div className="bg-orange-50 p-3 rounded-lg"><span className="text-gray-500">Horario:</span><div className="font-semibold text-gray-800">{contingencySelectedSubject.horario}{claseInfo ? ` - ${claseInfo.horaFin}` : ''}</div></div>
              <div className="bg-orange-50 p-3 rounded-lg"><span className="text-gray-500">Centro:</span><div className="font-semibold text-gray-800">{contingencySelectedSubject.centroTrabajo}</div></div>
              <div className="bg-orange-50 p-3 rounded-lg"><span className="text-gray-500">Turno:</span><div className="font-semibold text-gray-800">{contingencySelectedSubject.turno}</div></div>
              <div className="bg-orange-50 p-3 rounded-lg"><span className="text-gray-500">Nivel:</span><div className="font-semibold text-gray-800">{contingencySelectedSubject.nivelAcademico}</div></div>
              <div className="bg-orange-50 p-3 rounded-lg"><span className="text-gray-500">Servicio:</span><div className="font-semibold text-gray-800">{contingencySelectedSubject.tipoServicio}</div></div>
            </div>
            <div className="mt-3 bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-center gap-2 text-sm">
              <AlertCircle className="text-orange-600 flex-shrink-0" size={16} />
              <span className="text-orange-800">Registro de contingencia — Motivo: <strong>{contingencyReason}</strong></span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">1. Firma Digital</h3>
            <p className="text-gray-500 text-sm mb-4">Realiza tu firma en el recuadro. El sistema la comparará automáticamente con tus 3 firmas registradas.</p>
            <div className={`border-4 rounded-xl overflow-hidden bg-white mb-4 ${contingencySignatureValidation ? (contingencySignatureValidation.passed ? 'border-green-400' : 'border-red-400') : 'border-gray-300'}`}>
              <canvas ref={contingencyCanvasRef} width={800} height={300}
                onMouseDown={(e) => { const canvas = contingencyCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); ctx.beginPath(); const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left; const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top; ctx.moveTo(x, y); setIsDrawing(true); }}
                onMouseMove={(e) => { if (!isDrawing) return; e.preventDefault(); const canvas = contingencyCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left; const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.lineTo(x, y); ctx.stroke(); }}
                onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
                onTouchStart={(e) => { const canvas = contingencyCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); ctx.beginPath(); const x = e.touches[0].clientX - rect.left; const y = e.touches[0].clientY - rect.top; ctx.moveTo(x, y); setIsDrawing(true); }}
                onTouchMove={(e) => { if (!isDrawing) return; e.preventDefault(); const canvas = contingencyCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); const x = e.touches[0].clientX - rect.left; const y = e.touches[0].clientY - rect.top; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.lineTo(x, y); ctx.stroke(); }}
                onTouchEnd={() => setIsDrawing(false)}
                className="w-full touch-none" style={{ touchAction: 'none' }} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { const canvas = contingencyCanvasRef.current; const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); setContingencySignatureData(null); setContingencySignatureValidation(null); }}
                className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"><X className="inline mr-2" size={18} />Borrar</button>
              <button onClick={async () => {
                const canvas = contingencyCanvasRef.current;
                const sigData = canvas.toDataURL();
                setContingencySignatureData(sigData);
                setContingencySignatureValidation({ passed: false, confidence: 0, details: 'Validando...' });
                const result = await validateSignatureAgainstRegistered(sigData, contingencyTeacher.signatures);
                setContingencySignatureValidation(result);
              }}
                className="flex-1 bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700"><Check className="inline mr-2" size={18} />Capturar y Validar</button>
            </div>

            {contingencySignatureValidation && contingencySignatureValidation.details !== 'Validando...' && (
              <div className={`mt-4 p-4 rounded-xl border-2 ${contingencySignatureValidation.passed ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {contingencySignatureValidation.passed
                      ? <CheckCircle className="text-green-600" size={22} />
                      : <X className="text-red-600 bg-red-200 rounded-full p-0.5" size={22} />
                    }
                    <span className={`font-bold ${contingencySignatureValidation.passed ? 'text-green-800' : 'text-red-800'}`}>
                      {contingencySignatureValidation.passed ? 'Firma Validada' : 'Firma No Validada'}
                    </span>
                  </div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                    contingencySignatureValidation.confidence >= 80 ? 'bg-green-200 text-green-800' :
                    contingencySignatureValidation.confidence >= 55 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {contingencySignatureValidation.confidence}% coincidencia
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full transition-all ${
                    contingencySignatureValidation.confidence >= 80 ? 'bg-green-500' :
                    contingencySignatureValidation.confidence >= 55 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} style={{ width: `${contingencySignatureValidation.confidence}%` }}></div>
                </div>
                <p className={`text-sm ${contingencySignatureValidation.passed ? 'text-green-700' : 'text-red-700'}`}>
                  {contingencySignatureValidation.details}
                </p>
                {!contingencySignatureValidation.passed && (
                  <p className="text-sm text-red-600 mt-2 font-semibold">Borra la firma e intenta de nuevo. Asegúrate de firmar de manera similar a como lo hiciste en tu registro inicial.</p>
                )}
              </div>
            )}

            {contingencySignatureValidation && contingencySignatureValidation.details === 'Validando...' && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-blue-700 font-semibold">Validando firma contra registros...</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">2. Evidencias de Clase ({contingencyEvidences.length}/3)</h3>
            <p className="text-gray-500 text-sm mb-3">Sube capturas de pantalla que demuestren actividad con los estudiantes. <strong>Mínimo 1, máximo 3.</strong></p>
            
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
              <div className="font-semibold text-orange-800 text-sm mb-2">Evidencias válidas (deben mostrar fecha y hora):</div>
              <div className="text-xs text-orange-700 space-y-1">
                <div>📸 Captura de pantalla de la reunión en Teams con participantes visibles</div>
                <div>💬 Chat de NEXUS mostrando indicaciones o interacción del día</div>
                <div>📋 Área de publicaciones en Teams con la fecha visible</div>
                <div>👥 Lista de asistencia/participantes de la sesión</div>
              </div>
            </div>

            {contingencyEvidences.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {contingencyEvidences.map((ev, idx) => (
                  <div key={ev.id} className="relative border-2 border-orange-300 rounded-xl overflow-hidden">
                    <img src={ev.data} alt={`Evidencia ${idx + 1}`} className="w-full h-40 object-cover" />
                    <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {idx + 1}
                    </div>
                    <button onClick={() => removeContingencyEvidence(ev.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                      <X size={14} />
                    </button>
                    <div className="bg-white p-2 text-xs text-gray-600">
                      <div className="truncate">{ev.name}</div>
                      <div className="text-gray-400">Subida: {ev.uploadedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {contingencyEvidences.length < 3 && (
              <div>
                <input ref={contingencyEvidenceRef} type="file" accept="image/*" onChange={handleContingencyEvidenceUpload} className="hidden" />
                <button onClick={() => contingencyEvidenceRef.current?.click()}
                  className="w-full bg-orange-100 text-orange-800 p-4 rounded-lg hover:bg-orange-200 border-2 border-dashed border-orange-400 font-semibold">
                  <Upload className="inline mr-2" size={20} />
                  {contingencyEvidences.length === 0 ? 'Subir Primera Evidencia' : `Agregar Evidencia (${contingencyEvidences.length}/3)`}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white bg-opacity-15 rounded-xl p-4 mb-4 flex items-start gap-3">
            <Shield className="text-white flex-shrink-0 mt-0.5" size={18} />
            <div className="text-white text-xs opacity-80">
              <div className="font-semibold mb-1">Seguridad del registro</div>
              <div>Se registrará la dirección IP y dispositivo utilizado. Los registros de contingencia quedan marcados para auditoría especial y serán validados por el checador asignado.</div>
            </div>
          </div>

          <button onClick={submitContingencyAttendance}
            disabled={!contingencySignatureData || !contingencySignatureValidation?.passed || contingencyEvidences.length === 0}
            className={`w-full p-5 rounded-2xl font-bold text-xl transition-all shadow-xl mb-4 ${contingencySignatureData && contingencySignatureValidation?.passed && contingencyEvidences.length > 0 ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transform hover:scale-105' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
            <Send className="inline mr-3" size={24} />Enviar Registro de Contingencia
          </button>

          <button onClick={() => { setContingencySelectedSubject(null); setView('contingencySelectClass'); }}
            className="w-full bg-white bg-opacity-20 text-white p-3 rounded-xl hover:bg-opacity-30 font-semibold">
            <ArrowLeft className="inline mr-2" size={18} />Cambiar Clase
          </button>
        </div>
      </div>
    );
  }

  if (view === 'virtualAttendanceForm') {
    const link = virtualLinks.find(vl => vl.token === activeVirtualToken);
    if (!link) return null;

    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMinute;
    const [endH, endM] = link.horaFin.split(':').map(Number);
    const endTotalMin = endH * 60 + endM;
    const minutesLeft = endTotalMin - currentTotalMin;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-800">
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 text-white p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={28} />
              <h1 className="text-2xl font-bold">Asistencia Virtual — FIME</h1>
            </div>
            <p className="text-sm opacity-90">Facultad de Ingeniería Mecánica y Eléctrica — UANL</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          {minutesLeft <= 10 && (
            <div className="bg-red-500 bg-opacity-20 border border-red-400 text-white p-4 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle size={24} />
              <span className="font-semibold">⏳ Quedan {minutesLeft} minutos para completar el envío</span>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Datos de la Clase</h2>
            <div className="flex items-center gap-4 mb-4 bg-teal-50 p-4 rounded-lg">
              <div className="bg-teal-600 w-12 h-12 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{link.teacherName}</div>
                <div className="text-sm text-gray-600">No. {link.employeeNumber}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Materia:</span><div className="font-semibold text-gray-800">{link.subjectName}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Horario:</span><div className="font-semibold text-gray-800">{link.horaInicio} - {link.horaFin}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Centro:</span><div className="font-semibold text-gray-800">{link.centroTrabajo}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Turno:</span><div className="font-semibold text-gray-800">{link.subjectTurno}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Nivel:</span><div className="font-semibold text-gray-800">{link.nivelAcademico}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Servicio:</span><div className="font-semibold text-gray-800">{link.tipoServicio}</div></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">1. Firma Digital</h3>
            <p className="text-gray-600 text-sm mb-4">Realiza tu firma en el recuadro. Esta será comparada con tus firmas registradas.</p>
            <div className="border-4 border-gray-300 rounded-xl overflow-hidden bg-white mb-4">
              <canvas ref={virtualCanvasRef} width={800} height={300}
                onMouseDown={(e) => { const canvas = virtualCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); ctx.beginPath(); const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left; const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top; ctx.moveTo(x, y); setIsDrawing(true); }}
                onMouseMove={(e) => { if (!isDrawing) return; e.preventDefault(); const canvas = virtualCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left; const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.lineTo(x, y); ctx.stroke(); }}
                onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)}
                onTouchStart={(e) => { const canvas = virtualCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); ctx.beginPath(); const x = e.touches[0].clientX - rect.left; const y = e.touches[0].clientY - rect.top; ctx.moveTo(x, y); setIsDrawing(true); }}
                onTouchMove={(e) => { if (!isDrawing) return; e.preventDefault(); const canvas = virtualCanvasRef.current; const rect = canvas.getBoundingClientRect(); const ctx = canvas.getContext('2d'); const x = e.touches[0].clientX - rect.left; const y = e.touches[0].clientY - rect.top; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.lineTo(x, y); ctx.stroke(); }}
                onTouchEnd={() => setIsDrawing(false)}
                className="w-full touch-none" style={{ touchAction: 'none' }} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { const canvas = virtualCanvasRef.current; const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); setVirtualSignatureData(null); }}
                className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"><X className="inline mr-2" size={18} />Borrar</button>
              <button onClick={() => { const canvas = virtualCanvasRef.current; setVirtualSignatureData(canvas.toDataURL()); }}
                className="flex-1 bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700"><Check className="inline mr-2" size={18} />Capturar Firma</button>
            </div>
            {virtualSignatureData && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm"><CheckCircle size={16} /><span>Firma capturada correctamente</span></div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">2. Evidencia de Clase</h3>
            <p className="text-gray-600 text-sm mb-4">Sube una captura de pantalla de la sesión virtual, chat de NEXUS, lista de participantes o cualquier evidencia que demuestre interacción con los estudiantes.</p>
            
            <div className="bg-teal-50 p-4 rounded-lg mb-4">
              <div className="font-semibold text-teal-800 text-sm mb-2">Ejemplos de evidencia válida:</div>
              <div className="text-xs text-teal-700 space-y-1">
                <div>• Captura de pantalla del grupo en sesión de Teams/NEXUS</div>
                <div>• Chat con indicaciones o actividades del día</div>
                <div>• Lista de participantes conectados</div>
                <div>• Pantalla compartida con material de clase</div>
              </div>
            </div>

            {virtualEvidence ? (
              <div className="text-center">
                <img src={virtualEvidence} alt="Evidencia" className="max-h-64 mx-auto rounded-lg border-2 border-teal-500 mb-3" />
                <button onClick={() => { setVirtualEvidence(null); if (evidenceInputRef.current) evidenceInputRef.current.value = ''; }}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm">Cambiar imagen</button>
              </div>
            ) : (
              <div>
                <input ref={evidenceInputRef} type="file" accept="image/*" onChange={handleEvidenceUpload} className="hidden" />
                <button onClick={() => evidenceInputRef.current?.click()}
                  className="w-full bg-teal-600 text-white p-4 rounded-lg hover:bg-teal-700 border-2 border-dashed border-teal-400">
                  <Upload className="inline mr-2" size={20} />Subir Captura de Evidencia
                </button>
              </div>
            )}
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-4 flex items-start gap-3">
            <Monitor className="text-white flex-shrink-0 mt-0.5" size={18} />
            <div className="text-white text-xs opacity-80">
              <div className="font-semibold mb-1">Información de seguridad</div>
              <div>Se registrará la dirección IP y el dispositivo utilizado para este envío. Si se detecta que el mismo dispositivo fue usado por otro maestro en horarios consecutivos, se generará una alerta de seguridad.</div>
            </div>
          </div>

          <button onClick={submitVirtualAttendance}
            disabled={!virtualSignatureData || !virtualEvidence}
            className={`w-full p-5 rounded-2xl font-bold text-xl transition-all shadow-xl ${virtualSignatureData && virtualEvidence ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transform hover:scale-105' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
            <Send className="inline mr-3" size={24} />Enviar Firma y Evidencia
          </button>
        </div>
      </div>
    );
  }

  if (view === 'reviewEvidence') {
    const submission = reviewingSubmission;
    if (!submission) { setView('checadorPanel'); return null; }
    const teacher = teachers.find(t => t.id === submission.teacherId);
    const hasAlert = submission.deviceAlert;
    const isContingency = submission.isContingency;
    const evidenceList = submission.allEvidences || (submission.evidence ? [{ id: 1, data: submission.evidence, name: 'Evidencia' }] : []);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`bg-gradient-to-r ${isContingency ? 'from-orange-600 to-red-700' : 'from-green-600 to-teal-700'} text-white p-6 shadow-lg`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {isContingency && <Wifi size={22} />}
                Revisar Evidencia {isContingency ? '— Contingencia' : 'Virtual'}
              </h1>
              <p className="opacity-90">{currentUser?.fullName}</p>
            </div>
            <button onClick={() => { setReviewingSubmission(null); setView('checadorPanel'); }} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30">
              <ArrowLeft size={20} />Regresar
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-6">

          {isContingency && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Wifi className="text-orange-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-orange-800 mb-1">Registro de Contingencia</h3>
                  <p className="text-orange-700 text-sm">Este registro fue enviado directamente por el maestro en modo de contingencia.</p>
                  <p className="text-orange-600 text-sm mt-1">Motivo: <strong>{submission.contingencyReason}</strong></p>
                </div>
              </div>
            </div>
          )}

          {hasAlert && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-red-800 mb-1">⚠️ Alerta de Dispositivo Duplicado</h3>
                  <p className="text-red-700 text-sm">Este envío fue realizado desde un dispositivo que fue utilizado por otro maestro en las últimas 2 horas. Revisa con precaución.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              Información del Maestro
              {isContingency && <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-semibold">CONTINGENCIA</span>}
            </h2>
            <div className="flex items-center gap-4 mb-4">
              {teacher?.photo && <img src={teacher.photo} alt={submission.teacherName} className="w-16 h-16 rounded-full object-cover" />}
              <div>
                <div className="font-semibold text-gray-800 text-lg">{submission.teacherName}</div>
                <div className="text-sm text-gray-600">No. Empleado: {submission.employeeNumber}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Materia:</span><div className="font-semibold">{submission.subject}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Horario:</span><div className="font-semibold">{submission.horario}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Centro:</span><div className="font-semibold">{submission.centroTrabajo}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Fecha:</span><div className="font-semibold">{submission.date}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Hora envío:</span><div className="font-semibold">{submission.time}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Turno:</span><div className="font-semibold">{submission.turno}</div></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileText size={20} className="text-teal-600" />Firma Digital</h3>
            {submission.signature && <img src={submission.signature} alt="Firma" className="w-full max-w-md border-2 border-gray-200 rounded-lg" />}

            {submission.signatureValidation && (
              <div className={`mt-4 p-4 rounded-xl border-2 ${submission.signatureValidation.passed ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {submission.signatureValidation.passed
                      ? <CheckCircle className="text-green-600" size={18} />
                      : <X className="text-red-600 bg-red-200 rounded-full p-0.5" size={18} />
                    }
                    <span className={`font-bold text-sm ${submission.signatureValidation.passed ? 'text-green-800' : 'text-red-800'}`}>
                      Validación automática: {submission.signatureValidation.passed ? 'APROBADA' : 'NO APROBADA'}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    submission.signatureValidation.confidence >= 80 ? 'bg-green-200 text-green-800' :
                    submission.signatureValidation.confidence >= 55 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                  }`}>{submission.signatureValidation.confidence}%</span>
                </div>
                <p className="text-sm text-gray-600">{submission.signatureValidation.details}</p>
              </div>
            )}

            {teacher?.signatures?.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 font-semibold mb-2">Firmas registradas del maestro (comparación visual):</div>
                <div className="grid grid-cols-3 gap-2">
                  {teacher.signatures.map((sig, i) => (
                    <img key={i} src={sig} alt={`Firma ref ${i + 1}`} className="w-full border border-gray-300 rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Image size={20} className="text-teal-600" />
              Evidencias de Clase ({evidenceList.length})
            </h3>
            {evidenceList.length > 0 ? (
              <div className={`grid gap-4 ${evidenceList.length === 1 ? 'grid-cols-1' : evidenceList.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                {evidenceList.map((ev, idx) => (
                  <div key={ev.id || idx} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-3 py-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Evidencia {idx + 1}</span>
                      {ev.uploadedAt && <span className="text-xs text-gray-500">{ev.uploadedAt}</span>}
                    </div>
                    <img src={ev.data} alt={`Evidencia ${idx + 1}`}
                      className="w-full cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(ev.data, '_blank')} />
                    {ev.name && <div className="p-2 text-xs text-gray-500 truncate">{ev.name}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Sin evidencias adjuntas</p>
            )}
            <p className="text-xs text-gray-500 mt-3">Haz clic en una imagen para verla en tamaño completo</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Shield size={20} className="text-indigo-600" />Validación de Evidencia — Criterios Objetivos</h3>
            <p className="text-gray-500 text-sm mb-4">Verifica cada criterio antes de aprobar o rechazar. Todos los criterios marcados con (*) son obligatorios para la aprobación.</p>
            
            <div className="space-y-3">
              {[
                { key: 'dateVisible', label: 'La fecha visible en la evidencia coincide con la fecha del registro *', required: true },
                { key: 'timeVisible', label: 'La hora visible en la evidencia corresponde al horario de la clase *', required: true },
                { key: 'platformMatch', label: `La evidencia corresponde a la plataforma correcta (${submission.centroTrabajo}) *`, required: true },
                { key: 'activityProof', label: 'Se muestra actividad docente real (instrucciones, material, interacción) *', required: true },
                { key: 'participantsVisible', label: 'Se observan participantes/estudiantes en la sesión o actividad', required: false },
                { key: 'teacherIdentifiable', label: 'El maestro es identificable como responsable de la sesión', required: false },
                { key: 'noManipulation', label: 'La captura no presenta señales de manipulación o edición *', required: true },
              ].map(criteria => (
                <label key={criteria.key} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition ${
                  evidenceChecklist[criteria.key] ? 'bg-green-50 border border-green-300' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}>
                  <input type="checkbox" checked={!!evidenceChecklist[criteria.key]}
                    onChange={(e) => setEvidenceChecklist({ ...evidenceChecklist, [criteria.key]: e.target.checked })}
                    className="mt-0.5 w-5 h-5 rounded flex-shrink-0" />
                  <span className={`text-sm ${evidenceChecklist[criteria.key] ? 'text-green-800' : 'text-gray-700'}`}>
                    {criteria.label}
                    {criteria.required && !evidenceChecklist[criteria.key] && <span className="text-red-500 ml-1">(obligatorio)</span>}
                  </span>
                </label>
              ))}
            </div>

            {(() => {
              const requiredKeys = ['dateVisible', 'timeVisible', 'platformMatch', 'activityProof', 'noManipulation'];
              const allRequiredMet = requiredKeys.every(k => evidenceChecklist[k]);
              const checkedCount = Object.values(evidenceChecklist).filter(Boolean).length;
              return (
                <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${allRequiredMet ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {allRequiredMet
                    ? `✓ Todos los criterios obligatorios cumplidos (${checkedCount}/7 totales verificados)`
                    : `⚠ Faltan criterios obligatorios por verificar (${checkedCount}/7 verificados)`
                  }
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Monitor size={20} className="text-gray-600" />Datos del Dispositivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Dirección IP:</span><div className="font-mono font-semibold text-gray-800">{submission.ipAddress}</div></div>
              <div className="bg-gray-50 p-3 rounded-lg"><span className="text-gray-500">Navegador/Dispositivo:</span><div className="font-mono text-xs text-gray-800 break-all">{submission.userAgent?.substring(0, 80)}...</div></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Resolución</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <button onClick={() => {
                  const requiredKeys = ['dateVisible', 'timeVisible', 'platformMatch', 'activityProof', 'noManipulation'];
                  const failedCriteria = requiredKeys.filter(k => !evidenceChecklist[k]);
                  if (failedCriteria.length === 0) {
                    if (!window.confirm('Todos los criterios obligatorios están cumplidos. ¿Seguro que deseas rechazar?')) return;
                  }
                  const labels = {
                    dateVisible: 'Fecha no coincide', timeVisible: 'Hora no corresponde al horario',
                    platformMatch: 'Plataforma incorrecta', activityProof: 'Sin evidencia de actividad docente',
                    noManipulation: 'Posible manipulación de captura'
                  };
                  const reasons = failedCriteria.map(k => labels[k]).join(', ');
                  const finalReason = reasons || rejectReason || 'Rechazado por el checador';
                  rejectVirtualSubmission(submission.id, finalReason);
                  setEvidenceChecklist({});
                  setRejectReason('');
                }}
                  className="w-full bg-red-500 text-white p-4 rounded-xl hover:bg-red-600 font-semibold text-lg">
                  <X className="inline mr-2" size={22} />Rechazar
                </button>
                <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motivo adicional de rechazo (opcional)" className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="flex-1">
                <button onClick={() => {
                  const requiredKeys = ['dateVisible', 'timeVisible', 'platformMatch', 'activityProof', 'noManipulation'];
                  const allRequiredMet = requiredKeys.every(k => evidenceChecklist[k]);
                  if (!allRequiredMet) {
                    alert('No puedes aprobar sin verificar todos los criterios obligatorios (*). Revisa la lista de verificación.');
                    return;
                  }
                  approveVirtualSubmission(submission.id);
                  setEvidenceChecklist({});
                  setRejectReason('');
                }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold text-lg">
                  <CheckCircle className="inline mr-2" size={22} />Aprobar Asistencia
                </button>
                <div className="text-xs text-gray-500 mt-2 text-center">Requiere todos los criterios (*) marcados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signAttendance') {
    const now = getEffectiveTime();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSubject = currentUser.subjects.find(subject => {
      const [startHour, startMin] = subject.horario.split(':').map(Number);
      const turnoInfo = turnos[subject.turno];
      const claseInfo = turnoInfo.clases.find(c => c.hora === subject.horario);
      if (!claseInfo) return false;
      const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
      const currentTotalMin = currentHour * 60 + currentMinute;
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
    });
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => { setView('checadorPanel'); clearSignature(); }} className="mb-4 text-gray-600 hover:text-gray-800">← Regresar</button>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Registrar Asistencia</h2>
            <div className="flex items-center gap-4 mb-4 bg-blue-50 p-4 rounded-lg">
              {currentUser.photo && <img src={currentUser.photo} alt={currentUser.fullName} className="w-16 h-16 rounded-full object-cover" />}
              <div>
                <div className="font-semibold text-gray-800">{currentUser.fullName}</div>
                <div className="text-sm text-gray-600">No. {currentUser.employeeNumber}</div>
              </div>
            </div>
            {currentSubject && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-semibold text-gray-800 mb-2">Clase Actual:</div>
                <div className="text-lg text-blue-800">{currentSubject.name}</div>
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                  <div>Turno: {currentSubject.turno}</div>
                  <div>Horario: {currentSubject.horario}</div>
                  <div>Salón: {currentSubject.classroom}</div>
                  <div>Edificio: {currentSubject.edificio}</div>
                  <div>Centro: {currentSubject.centroTrabajo}</div>
                  <div>Nivel: {currentSubject.nivelAcademico}</div>
                </div>
              </div>
            )}
            {locationError && (
              <div className="bg-red-50 p-4 rounded-lg mt-4"><AlertCircle className="inline text-red-600 mr-2" size={20} /><span className="text-red-800">{locationError}</span></div>
            )}
            {currentLocation && (
              <div className="bg-green-50 p-4 rounded-lg mt-4"><MapPin className="inline text-green-600 mr-2" size={20} /><span className="text-green-800">Ubicación detectada</span></div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Realiza tu Firma</h3>
            <div className="border-4 border-gray-300 rounded-xl overflow-hidden bg-white mb-4">
              <canvas ref={canvasRef} width={800} height={400} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full touch-none" style={{ touchAction: 'none' }} />
            </div>
            <div className="flex gap-4">
              <button onClick={clearSignature} className="flex-1 bg-red-500 text-white p-4 rounded-xl hover:bg-red-600"><X className="inline mr-2" size={20} />Borrar</button>
              <button onClick={() => {
                const canvas = canvasRef.current;
                setSignatureData(canvas.toDataURL());
              }} className="flex-1 bg-blue-500 text-white p-4 rounded-xl hover:bg-blue-600"><Check className="inline mr-2" size={20} />Capturar</button>
            </div>
            {signatureData && (
              <button onClick={confirmAttendance} className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold text-lg">
                <CheckCircle className="inline mr-2" size={24} />Confirmar Asistencia
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'checadorPanel') {
    const pendingCount = getPendingSubmissions().length;
    const alertCount = getUnreviewedAlerts().length;

    return (
      <div className="min-h-screen bg-gray-50" style={{ paddingTop: activeSessionRole ? '24px' : '0' }}>
        <RoleBanner />
        <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-6 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div><h1 className="text-2xl font-bold">Panel de Checador</h1><p className="opacity-90">{currentUser.fullName}</p></div>
              <button onClick={() => { setCurrentUser(null); setActiveSessionRole(null); setView('selectRole'); }} className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition">
                <LogOut size={20} />Salir
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setChecadorTab('presencial')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition ${checadorTab === 'presencial' ? 'bg-white text-green-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}>
                <MapPin className="inline mr-2" size={18} />Presencial
              </button>
              <button onClick={() => setChecadorTab('virtual')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition ${checadorTab === 'virtual' ? 'bg-white text-green-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}>
                <Globe className="inline mr-2" size={18} />Virtual
                {getTeachersWithVirtualClassNow().length > 0 && (
                  <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">{getTeachersWithVirtualClassNow().length}</span>
                )}
              </button>
              <button onClick={() => setChecadorTab('revision')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition ${checadorTab === 'revision' ? 'bg-white text-green-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}>
                <FileText className="inline mr-2" size={18} />Revisión
                {pendingCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingCount}</span>
                )}
              </button>
              {alertCount > 0 && (
                <button onClick={() => setChecadorTab('alertas')}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition ${checadorTab === 'alertas' ? 'bg-white text-green-700' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}>
                  <AlertCircle className="inline mr-2" size={18} />Alertas
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{alertCount}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-6">

          {checadorTab === 'presencial' && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Maestros con Clase Presencial Ahora</h2>
              <p className="text-gray-500 text-sm mb-6">Clases en centros con validación GPS</p>
              {teachers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay maestros registrados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teachers.map(teacher => {
                    const now = getEffectiveTime();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const currentTotalMin = currentHour * 60 + currentMinute;
                    const presentialSubject = teacher.subjects.find(subject => {
                      if (isVirtualCenter(subject.centroTrabajo)) return false;
                      const [startHour, startMin] = subject.horario.split(':').map(Number);
                      const turnoInfo = turnos[subject.turno];
                      const claseInfo = turnoInfo?.clases.find(c => c.hora === subject.horario);
                      if (!claseInfo) return false;
                      const [endHour, endMin] = claseInfo.horaFin.split(':').map(Number);
                      const startTotalMin = startHour * 60 + startMin;
                      const endTotalMin = endHour * 60 + endMin;
                      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
                    });
                    return (
                      <div key={teacher.id} className={`p-4 rounded-lg border-2 ${presentialSubject ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          {teacher.photo && <img src={teacher.photo} alt={teacher.fullName} className="w-12 h-12 rounded-full object-cover" />}
                          <div>
                            <div className="font-semibold text-gray-800">{teacher.fullName}</div>
                            <div className="text-xs text-gray-600">No. {teacher.employeeNumber}</div>
                          </div>
                        </div>
                        {presentialSubject ? (
                          <div>
                            <div className="text-xs text-gray-600 mb-2 bg-green-100 p-2 rounded">
                              <div className="font-semibold text-green-800">{presentialSubject.name}</div>
                              <div>{presentialSubject.centroTrabajo} • {presentialSubject.horario}</div>
                            </div>
                            <button onClick={() => handleSignAttendance(teacher.id)} className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
                              <CheckCircle className="inline mr-2" size={16} />Tomar Asistencia
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-sm text-gray-500 py-2">Sin clases presenciales ahora</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {checadorTab === 'virtual' && (
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">Maestros con Clase Virtual Ahora</h2>
                  <div className="flex items-center gap-2 text-teal-600">
                    <Globe size={20} />
                    <span className="font-semibold">{getTeachersWithVirtualClassNow().length} activos</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-6">Clases en centros virtuales (Teams, NEXUS). Envía un link al maestro para que registre su firma y evidencia.</p>

                {getTeachersWithVirtualClassNow().length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-gray-500">No hay maestros con clase virtual en este momento</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getTeachersWithVirtualClassNow().map(teacher => {
                      const subject = getVirtualSubjectNow(teacher);
                      const existingLink = virtualLinks.find(
                        vl => vl.teacherId === teacher.id && vl.subjectHorario === subject?.horario && 
                        vl.date === new Date().toLocaleDateString('es-MX')
                      );
                      return (
                        <div key={teacher.id} className="bg-teal-50 border-2 border-teal-400 p-5 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            {teacher.photo && <img src={teacher.photo} alt={teacher.fullName} className="w-14 h-14 rounded-full object-cover border-2 border-teal-500" />}
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{teacher.fullName}</div>
                              <div className="text-xs text-gray-600">No. {teacher.employeeNumber}</div>
                              <div className="text-xs text-teal-700 mt-1">
                                {teacher.email && <span className="flex items-center gap-1"><Mail size={10} />{teacher.email}</span>}
                                {teacher.phone && <span className="flex items-center gap-1"><Smartphone size={10} />{teacher.phone}</span>}
                              </div>
                            </div>
                          </div>
                          {subject && (
                            <div className="bg-white p-3 rounded-lg mb-3 text-sm">
                              <div className="font-semibold text-teal-800">{subject.name}</div>
                              <div className="text-gray-600 grid grid-cols-2 gap-1 mt-1">
                                <span>{subject.centroTrabajo}</span>
                                <span>{subject.horario}</span>
                                <span>{subject.nivelAcademico}</span>
                                <span>{subject.tipoServicio}</span>
                              </div>
                            </div>
                          )}
                          {existingLink ? (
                            <div className={`p-3 rounded-lg text-center font-semibold text-sm ${
                              existingLink.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              existingLink.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              existingLink.status === 'expired' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'
                            }`}>
                              {existingLink.status === 'pending' && <><Clock className="inline mr-1" size={14} />Link enviado — Esperando respuesta</>}
                              {existingLink.status === 'submitted' && <><CheckCircle className="inline mr-1" size={14} />Evidencia recibida — Pendiente revisión</>}
                              {existingLink.status === 'expired' && <><X className="inline mr-1" size={14} />Link expirado</>}
                            </div>
                          ) : (
                            <button onClick={() => sendVirtualLink(teacher)}
                              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 font-semibold">
                              <Send className="inline mr-2" size={16} />Enviar Link de Asistencia
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {virtualLinks.filter(vl => vl.date === new Date().toLocaleDateString('es-MX')).length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Links Enviados Hoy</h3>
                  <div className="space-y-3">
                    {virtualLinks.filter(vl => vl.date === new Date().toLocaleDateString('es-MX')).map(vl => (
                      <div key={vl.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{vl.teacherName}</div>
                          <div className="text-sm text-gray-600">{vl.subjectName} • {vl.horaInicio}-{vl.horaFin} • {vl.centroTrabajo}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            vl.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            vl.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            vl.status === 'expired' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'
                          }`}>
                            {vl.status === 'pending' ? 'Pendiente' : vl.status === 'submitted' ? 'Recibido' : vl.status === 'expired' ? 'Expirado' : vl.status}
                          </span>
                          {vl.status === 'pending' && (
                            <button onClick={() => openVirtualAttendance(vl.token)}
                              className="text-teal-600 hover:text-teal-800 text-xs font-semibold underline">Simular acceso</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {checadorTab === 'revision' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Revisión de Evidencias Virtuales</h2>
              <p className="text-gray-500 text-sm mb-6">Revisa la firma y evidencia enviada por los maestros. Aprueba o rechaza cada registro.</p>

              {virtualSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500">No hay evidencias por revisar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {virtualSubmissions.map(sub => (
                    <div key={sub.id} className={`border-2 rounded-xl p-5 ${
                      sub.status === 'pending_review' ? 'border-yellow-400 bg-yellow-50' :
                      sub.status === 'approved' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-semibold text-gray-800">{sub.teacherName}</div>
                            <div className="text-sm text-gray-600">{sub.subject} • {sub.horario} • {sub.centroTrabajo}</div>
                            <div className="text-xs text-gray-500">{sub.date} a las {sub.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.isContingency && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                              <Wifi size={12} />Contingencia
                            </span>
                          )}
                          {sub.deviceAlert && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                              <AlertCircle size={12} />Alerta IP
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sub.status === 'pending_review' ? 'bg-yellow-200 text-yellow-800' :
                            sub.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {sub.status === 'pending_review' ? 'Pendiente' : sub.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                          </span>
                          {sub.status === 'pending_review' && (
                            <button onClick={() => { setReviewingSubmission(sub); setView('reviewEvidence'); }}
                              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm font-semibold">
                              <Eye className="inline mr-1" size={14} />Revisar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {checadorTab === 'alertas' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <AlertCircle className="text-red-500" size={28} />Alertas de Seguridad
              </h2>
              <p className="text-gray-500 text-sm mb-6">Dispositivos que fueron utilizados por múltiples maestros en horarios consecutivos.</p>

              {deviceAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500">No hay alertas de seguridad</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deviceAlerts.map(alert => {
                    const teacher = teachers.find(t => t.id === alert.teacherId);
                    return (
                      <div key={alert.id} className={`border-2 rounded-xl p-5 ${alert.reviewed ? 'border-gray-300 bg-gray-50' : 'border-red-400 bg-red-50'}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-red-800 mb-1">{alert.message}</div>
                            <div className="text-sm text-gray-700">
                              <div>Maestro actual: <strong>{teacher?.fullName || 'ID: ' + alert.teacherId}</strong></div>
                              <div>Maestros previos en el mismo dispositivo: <strong>{alert.previousTeacherNames?.join(', ')}</strong></div>
                              <div className="text-xs text-gray-500 mt-1 font-mono">Dispositivo: {alert.deviceInfo?.substring(0, 60)}...</div>
                              <div className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString('es-MX')}</div>
                            </div>
                          </div>
                          {!alert.reviewed && (
                            <button onClick={() => setDeviceAlerts(deviceAlerts.map(a => a.id === alert.id ? { ...a, reviewed: true } : a))}
                              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-300">
                              Marcar revisada
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>;
};

export default TeacherAttendanceApp;