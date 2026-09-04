import React, { useState, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { 
  GraduationCap, 
  User, 
  Calendar as CalendarIcon, 
  Sun, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  History, 
  Menu,
  X, 
  AlertCircle, 
  GripVertical, 
  Play, 
  Pause, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  BarChart3, 
  Archive, 
  Share2, 
  RotateCcw, 
  Send, 
  UploadCloud, 
  TrendingUp, 
  Award, 
  Settings2, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  ArchiveRestore, 
  TimerReset, 
  Hourglass, 
  CalendarOff, 
  ListTodo, 
  ArrowRight, 
  Filter, 
  Film, 
  Tv, 
  Video, 
  BookOpen, 
  Lightbulb, 
  Gamepad2, 
  ShoppingCart, 
  Music, 
  Home, 
  Utensils, 
  Wrench, 
  Dumbbell, 
  Shirt, 
  Sparkles, 
  Heart, 
  Coffee, 
  PieChart, 
  Flame, 
  Activity, 
  Cloud, 
  Lock, 
  RefreshCw, 
  Minus, 
  Square, 
  ShieldCheck,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

const isTauriDesktop = typeof window !== 'undefined' && (Boolean(window.__TAURI_INTERNALS__) || Boolean(window.__TAURI__));

const handleDragStart = async (e) => {
  if (!isTauriDesktop) return; // ✅ Breek direct af in de browser/mobiel
  if (e.button === 0 && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
    try {
      const win = getCurrentWindow();
      await win.startDragging();
    } catch (err) {
      console.warn('Drag error:', err);
    }
  }
};

const handleMinimize = async (e) => {
  e?.stopPropagation();
  if (!isTauriDesktop) return; // ✅ Breek direct af
  try {
    const win = getCurrentWindow();
    await win.minimize();
  } catch (err) {
    console.warn('Tauri minimize error:', err);
  }
};

const handleMaximizeToggle = async (e) => {
  e?.stopPropagation();
  if (!isTauriDesktop) return; // ✅ Breek direct af
  try {
    const win = getCurrentWindow();
    await win.toggleMaximize();
  } catch (err) {
    console.warn('Tauri maximize error:', err);
  }
};

const handleClose = async (e) => {
  e?.stopPropagation();
  if (!isTauriDesktop) return; // ✅ Breek direct af
  try {
    const win = getCurrentWindow();
    await win.close();
  } catch (err) {
    console.warn('Tauri close error:', err);
  }
};

// UTF-8 & Emoji-veilige Base64 helpers
function utoa(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
}

function atou(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

// AES-256-GCM Encryptie Engine
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(plainText, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return utoa(String.fromCharCode(...combined));
}

async function decryptData(cipherBase64, password) {
  const dec = new TextDecoder();
  const binaryString = atou(cipherBase64);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return dec.decode(decrypted);
}

const PRESET_COLORS = [
  '#0EA5E9', '#06B6D4', '#14B8A6', '#10B981', '#84CC16', '#EAB308',
  '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#D946EF', '#A855F7',
  '#8B5CF6', '#6366F1', '#3B82F6', '#64748B', '#78716C', '#0F172A'
];

const ICON_MAP = {
  film: Film,
  tv: Tv,
  video: Video,
  home: Home,
  laundry: Shirt,
  cooking: Utensils,
  cart: ShoppingCart,
  fix: Wrench,
  book: BookOpen,
  sport: Dumbbell,
  gaming: Gamepad2,
  music: Music,
  idea: Lightbulb,
  health: Heart,
  coffee: Coffee
};

const PRESET_ICONS = [
  { id: 'none', label: 'Geen icoon' },
  { id: 'film', label: 'Films & Netflix' },
  { id: 'tv', label: 'Series & TV' },
  { id: 'video', label: 'YouTube / Video' },
  { id: 'home', label: 'Huishouden' },
  { id: 'laundry', label: 'Was & Kleding' },
  { id: 'cooking', label: 'Koken & Eten' },
  { id: 'cart', label: 'Boodschappen' },
  { id: 'fix', label: 'Klussen & Reparaties' },
  { id: 'book', label: 'Boeken & Lezen' },
  { id: 'sport', label: 'Sport & Fitness' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'music', label: 'Muziek & Podcasts' },
  { id: 'idea', label: 'Ideeën & Braindump' },
  { id: 'health', label: 'Zelfzorg' },
  { id: 'coffee', label: 'Ontspanning' }
];

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

const DAY_NAMES = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

function CategoryIcon({ iconName, className = "w-3.5 h-3.5 shrink-0" }) {
  if (!iconName || iconName === 'none' || !ICON_MAP[iconName]) return null;
  const Comp = ICON_MAP[iconName];
  return <Comp className={className} />;
}

function WorkflowLogo({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="3.5" fill="white" />
      <path d="M18 4C25.732 4 32 10.268 32 18" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 18C32 25.732 25.732 32 18 32" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
      <path d="M18 32C10.268 32 4 25.732 4 18" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M4 18C4 10.268 10.268 4 18 4" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
      <circle cx="18" cy="18" r="8.5" stroke="white" strokeWidth="1.75" strokeDasharray="4 3" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('pb_active_tab') || 'myday');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('pb_sidebar_collapsed') === 'true');
  
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('pb_categories');
    return saved ? JSON.parse(saved) : [
      { id: 'sub-1', name: 'Wiskunde', type: 'school', color: '#0EA5E9', icon: 'book', archived: false },
      { id: 'sub-2', name: 'Informatica', type: 'school', color: '#10B981', icon: 'idea', archived: false },
      { id: 'sub-3', name: 'Geschiedenis', type: 'school', color: '#F59E0B', icon: 'book', archived: false },
      { id: 'list-1', name: 'Nog te bekijken', type: 'private', color: '#EF4444', icon: 'film', archived: false },
      { id: 'list-2', name: 'Huishouden & Taken', type: 'private', color: '#14B8A6', icon: 'home', archived: false },
      { id: 'list-3', name: 'Project Braindump', type: 'private', color: '#06B6D4', icon: 'idea', archived: false },
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('pb_tasks');
    const today = new Date().toISOString().split('T')[0];
    return saved ? JSON.parse(saved) : [
      { 
        id: 't-1', 
        title: 'Stranger Things seizoen 5', 
        content: 'Nieuwe afleveringen kijken op Netflix', 
        categoryId: 'list-1', 
        type: 'private', 
        date: today, 
        endDate: '', 
        status: 'queue', 
        completed: false, 
        order: 1, 
        secondsSpent: 0, 
        subtasks: [
          { id: 'st-1', text: 'Aflevering 1 & 2', done: true },
          { id: 'st-2', text: 'Aflevering 3', done: false }
        ],
        links: ['https://netflix.com'], 
        files: [], 
        history: [{ action: 'Aangemaakt', timestamp: new Date().toLocaleString('nl-BE') }] 
      }
    ];
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debugging
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebugger, setShowDebugger] = useState(false);
  const addDebugLog = (msg) => {
    if (!showDebugger) return;
    const time = new Date().toLocaleTimeString('nl-BE');
    console.log(`[SYNC-DEBUG ${time}]`, msg);
    setDebugLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 19)]);
  };

  // Kalender & Navigatie States
  const [schoolCalScope, setSchoolCalScope] = useState(() => localStorage.getItem('pb_school_cal_scope') || 'school');
  const [privateCalScope, setPrivateCalScope] = useState(() => localStorage.getItem('pb_private_cal_scope') || 'private');
  const [schoolCalViewMode, setSchoolCalViewMode] = useState(() => localStorage.getItem('pb_school_cal_view_mode') || 'week');
  const [privateCalViewMode, setPrivateCalViewMode] = useState(() => localStorage.getItem('pb_private_cal_view_mode') || 'week');
  const [schoolTaskSortMode, setSchoolTaskSortMode] = useState(() => localStorage.getItem('pb_school_task_sort_mode') || 'date');
  const [privateTaskSortMode, setPrivateTaskSortMode] = useState(() => localStorage.getItem('pb_private_task_sort_mode') || 'date');

  const [schoolCalendarAnchorDate, setSchoolCalendarAnchorDate] = useState(() => {
    const saved = localStorage.getItem('pb_school_anchor');
    return saved ? new Date(saved) : new Date('2026-09-01T12:00:00');
  });

  const [privateCalendarAnchorDate, setPrivateCalendarAnchorDate] = useState(() => {
    const saved = localStorage.getItem('pb_private_anchor');
    return saved ? new Date(saved) : new Date('2026-09-01T12:00:00');
  });

  const [schoolShowCompleted, setSchoolShowCompleted] = useState(false);
  const [privateShowCompleted, setPrivateShowCompleted] = useState(false);
  const [customRangeStart, setCustomRangeStart] = useState('2026-08-31');
  const [customRangeEnd, setCustomRangeEnd] = useState('2026-09-14');
  const [showUnplannedTasks, setShowUnplannedTasks] = useState(true);

  // Cloud Sync State
  const [ghUser, setGhUser] = useState(() => localStorage.getItem('pb_gh_user') || '');
  const [ghRepo, setGhRepo] = useState(() => localStorage.getItem('pb_gh_repo') || 'braindump-data');
  const [ghToken, setGhToken] = useState(() => localStorage.getItem('pb_gh_token') || '');
  const [ghPassword, setGhPassword] = useState(() => localStorage.getItem('pb_gh_password') || '');
  const [tempToken, setTempToken] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => localStorage.getItem('pb_auto_sync') !== 'false');
  const [lastSyncTime, setLastSyncTime] = useState(() => localStorage.getItem('pb_last_sync') || 'Nog niet gesynchroniseerd');
  const [syncStatus, setSyncStatus] = useState({ state: 'idle', message: '' });

  // Diagnostics Filters
  const [diagTimeRange, setDiagTimeRange] = useState('always');
  const [diagCustomStart, setDiagCustomStart] = useState('2026-08-01');
  const [diagCustomEnd, setDiagCustomEnd] = useState('2026-09-30');
  const [diagSelectedCategories, setDiagSelectedCategories] = useState(() => categories.filter(c => c.type === 'school').map(c => c.id));

  // Modals & Timers
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategoryObj, setEditingCategoryObj] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState('none');
  const [newCatHex, setNewCatHex] = useState('');
  
  const [categoryToArchive, setCategoryToArchive] = useState(null);
  const [archiveConfirmStep, setArchiveConfirmStep] = useState(1);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [catDeleteStep, setCatDeleteStep] = useState(1);
  const [viewingArchivedCategory, setViewingArchivedCategory] = useState(null);

  const [sharedItems, setSharedItems] = useState(() => {
    const saved = localStorage.getItem('pb_shared_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [shareText, setShareText] = useState('');

  const lastTickTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const shareFileInputRef = useRef(null);
  const lastWheelTimeRef = useRef(0);
  const autoSaveTimeoutRef = useRef(null);
  const currentShaRef = useRef(null);
  const isSyncingRef = useRef(false);

  // Helperfunctie om taken te hashen zonder seconden/history
  const getTaskContentHash = (taskList, catList) => {
    const cleanTasks = (taskList || []).map(t => ({
      id: t.id,
      title: t.title,
      content: t.content,
      categoryId: t.categoryId,
      type: t.type,
      date: t.date,
      endDate: t.endDate,
      status: t.status,
      completed: t.completed,
      order: t.order,
      subtasks: t.subtasks,
      links: t.links,
      files: t.files
    }));
    return JSON.stringify({ tasks: cleanTasks, categories: catList || [] });
  };

  // Refs direct geïnitialiseerd met de huidige data bij het opstarten
  const lastSyncedPayloadRef = useRef(getTaskContentHash(tasks, categories));
  const prevContentHashRef = useRef(getTaskContentHash(tasks, categories));
  const isFirstRender = useRef(true);

  const [editingTask, setEditingTask] = useState(null);
  const [viewingArchiveTask, setViewingArchiveTask] = useState(null);
  const [originalTask, setOriginalTask] = useState(null);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
  const [rolloverTasks, setRolloverTasks] = useState([]);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [pickerYear, setPickerYear] = useState(2026);
  const [pickerMonth, setPickerMonth] = useState(8);
  const [dateTextInput, setDateTextInput] = useState('');
  const [dayTextInput, setDayTextInput] = useState('');

  const [editingTimeTask, setEditingTimeTask] = useState(null);
  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [timeEditStep, setTimeEditStep] = useState(1);
  const [newLinkInput, setNewLinkInput] = useState('');

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

  const [isMaximized, setIsMaximized] = useState(false);

  const currentCalendarViewMode = activeTab === 'school' ? schoolCalViewMode : privateCalViewMode;
  const currentTaskSortMode = activeTab === 'school' ? schoolTaskSortMode : privateTaskSortMode;
  const currentCalendarAnchorDate = activeTab === 'school' ? schoolCalendarAnchorDate : privateCalendarAnchorDate;
  const currentShowCompleted = activeTab === 'school' ? schoolShowCompleted : privateShowCompleted;
  const currentScope = activeTab === 'school' ? schoolCalScope : privateCalScope;

  const setCurrentCalendarViewMode = (mode) => {
    if (activeTab === 'school') setSchoolCalViewMode(mode);
    else setPrivateCalViewMode(mode);
  };

  const setCurrentTaskSortMode = (mode) => {
    if (activeTab === 'school') setSchoolTaskSortMode(mode);
    else setPrivateTaskSortMode(mode);
  };

  const setCurrentCalendarAnchorDate = (date) => {
    if (activeTab === 'school') setSchoolCalendarAnchorDate(date);
    else setPrivateCalendarAnchorDate(date);
  };

  const toggleCurrentShowCompleted = () => {
    if (activeTab === 'school') setSchoolShowCompleted(!schoolShowCompleted);
    else setPrivateShowCompleted(!privateShowCompleted);
  };

  // Sync Storage
  useEffect(() => { localStorage.setItem('pb_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('pb_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('pb_shared_items', JSON.stringify(sharedItems)); }, [sharedItems]);
  useEffect(() => { localStorage.setItem('pb_active_tab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('pb_sidebar_collapsed', isSidebarCollapsed.toString()); }, [isSidebarCollapsed]);
  useEffect(() => { localStorage.setItem('pb_school_cal_scope', schoolCalScope); }, [schoolCalScope]);
  useEffect(() => { localStorage.setItem('pb_private_cal_scope', privateCalScope); }, [privateCalScope]);
  useEffect(() => { localStorage.setItem('pb_school_cal_view_mode', schoolCalViewMode); }, [schoolCalViewMode]);
  useEffect(() => { localStorage.setItem('pb_private_cal_view_mode', privateCalViewMode); }, [privateCalViewMode]);
  useEffect(() => { localStorage.setItem('pb_school_task_sort_mode', schoolTaskSortMode); }, [schoolTaskSortMode]);
  useEffect(() => { localStorage.setItem('pb_private_task_sort_mode', privateTaskSortMode); }, [privateTaskSortMode]);
  useEffect(() => { localStorage.setItem('pb_school_anchor', schoolCalendarAnchorDate.toISOString()); }, [schoolCalendarAnchorDate]);
  useEffect(() => { localStorage.setItem('pb_private_anchor', privateCalendarAnchorDate.toISOString()); }, [privateCalendarAnchorDate]);
  
  useEffect(() => { localStorage.setItem('pb_gh_user', ghUser); }, [ghUser]);
  useEffect(() => { localStorage.setItem('pb_gh_repo', ghRepo); }, [ghRepo]);
  useEffect(() => { localStorage.setItem('pb_gh_token', ghToken); }, [ghToken]);
  useEffect(() => { localStorage.setItem('pb_gh_password', ghPassword); }, [ghPassword]);
  useEffect(() => { localStorage.setItem('pb_auto_sync', autoSyncEnabled.toString()); }, [autoSyncEnabled]);
  useEffect(() => { localStorage.setItem('pb_last_sync', lastSyncTime); }, [lastSyncTime]);

  // Maximize status live bijhouden (enkel in Tauri desktop)
  useEffect(() => {
    if (!isTauriDesktop) return; // ✅ DIT VOORKOMT DE 'metadata' FOOT IN DE CONSOLE!

    let unlistenResize;
    const initWindowListener = async () => {
      try {
        const win = getCurrentWindow();
        setIsMaximized(await win.isMaximized());
        unlistenResize = await win.onResized(async () => {
          setIsMaximized(await win.isMaximized());
        });
      } catch (e) {
        console.warn('Window listener error:', e);
      }
    };
    initWindowListener();
    return () => {
      if (unlistenResize) unlistenResize();
    };
  }, []);

  // GitHub Cloud Sync Engine
  const pushToGitHub = async (isBackground = false) => {
    const activeToken = tempToken.trim() || ghToken;
    const activePassword = tempPassword || ghPassword;

    addDebugLog(`pushToGitHub aangeroepen (background: ${isBackground}). Token aanwezig: ${Boolean(activeToken)}, Wachtwoord aanwezig: ${Boolean(activePassword)}`);

    if (!ghUser || !ghRepo || !activeToken || !activePassword) {
      addDebugLog(`Fout in push: Credentials ontbreken.`);
      if (!isBackground) setSyncStatus({ state: 'error', message: 'Vul alle GitHub velden en het Master Wachtwoord in.' });
      return;
    }

    if (tempToken.trim()) {
      setGhToken(tempToken.trim());
      setTempToken('');
    }
    if (tempPassword) {
      setGhPassword(tempPassword);
      setTempPassword('');
    }

    if (isSyncingRef.current) {
      addDebugLog(`Afgebroken: Vorige sync is nog bezig.`);
      return;
    }

    isSyncingRef.current = true;
    if (!isBackground) setSyncStatus({ state: 'syncing', message: 'Data versleutelen en uploaden...' });

    try {
      addDebugLog(`Data versleutelen en SHA controleren...`);
      const payloadObj = { tasks, categories, lastUpdated: new Date().toISOString() };
      const jsonStr = JSON.stringify(payloadObj);
      const encryptedPayload = await encryptData(jsonStr, activePassword);

      let fileSha = currentShaRef.current;
      const headRes = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}/contents/braindump-vault.enc`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (headRes.ok) {
        const headData = await headRes.json();
        fileSha = headData.sha;
        addDebugLog(`Huidige file SHA op GitHub: ${fileSha.substring(0, 7)}...`);
      } else {
        addDebugLog(`HEAD request status: ${headRes.status}`);
      }

      addDebugLog(`PUT request versturen naar GitHub...`);
      const putRes = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}/contents/braindump-vault.enc`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Sync: ${new Date().toISOString()}`,
          content: encryptedPayload,
          sha: fileSha || undefined
        })
      });

      if (!putRes.ok) throw new Error(`GitHub HTTP ${putRes.status}`);
      const putData = await putRes.json();
      currentShaRef.current = putData.content?.sha || null;
  
      // Werk beide refs bij naar de nieuwste hash
      const latestHash = getTaskContentHash(tasks, categories);
      lastSyncedPayloadRef.current = latestHash;
      prevContentHashRef.current = latestHash;

      const syncNowStr = new Date().toLocaleTimeString('nl-BE');
      setLastSyncTime(syncNowStr);
      setSyncStatus({ state: 'success', message: `Gesynchroniseerd om ${syncNowStr}` });
      addDebugLog(`✅ Push succesvol voltooid om ${syncNowStr}!`);
    } catch (err) {
      addDebugLog(`❌ Push mislukt: ${err.message}`);
      setSyncStatus({ state: 'error', message: `Sync mislukt: ${err.message}` });
    } finally {
      isSyncingRef.current = false;
    }

    setShowToken(false);
    setShowPassword(false);
  };

  const pullFromGitHub = async (isBackground = false) => {
    // Gebruik de tijdelijke invoer óf de reeds opgeslagen credentials
    const activeToken = tempToken.trim() || ghToken;
    const activePassword = tempPassword || ghPassword;

    if (!ghUser || !ghRepo || !activeToken || !activePassword) {
      if (!isBackground) {
        setSyncStatus({ state: 'error', message: 'Geen actieve credentials gevonden om op te halen.' });
      }
      return;
    }

    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    if (!isBackground) setSyncStatus({ state: 'syncing', message: 'Kluis controleren...' });

    try {
      const getRes = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}/contents/braindump-vault.enc`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getRes.ok) {
        if (!isBackground) {
          setSyncStatus({ state: 'error', message: `Bestand niet gevonden op GitHub (HTTP ${getRes.status})` });
        }
        return;
      }

      const getData = await getRes.json();

      // Sla over als we exact deze versie al lokaal hebben
      if (getData.sha === currentShaRef.current) {
        if (!isBackground) {
          setSyncStatus({ state: 'success', message: 'App is al up-to-date met de Cloud!' });
        }
        return;
      }

      const rawEncrypted = getData.content.replace(/\s/g, '');
      const decryptedJson = await decryptData(rawEncrypted, activePassword);
      const vault = JSON.parse(decryptedJson);

      if (vault.tasks && vault.categories) {
        currentShaRef.current = getData.sha;
        setTasks(vault.tasks);
        setCategories(vault.categories);

        // Update ook de content hashes zodat de pull geen onnodige push triggert
        const newHash = getTaskContentHash(vault.tasks, vault.categories);
        lastSyncedPayloadRef.current = newHash;
        prevContentHashRef.current = newHash;

        const syncNowStr = new Date().toLocaleTimeString('nl-BE');
        setLastSyncTime(syncNowStr);
        setSyncStatus({ state: 'success', message: `Bijgewerkt vanuit Cloud om ${syncNowStr}` });
      } else {
        throw new Error('Ongeldige kluisstructuur');
      }
    } catch (err) {
      if (!isBackground) {
        setSyncStatus({ state: 'error', message: `Ontsleutelen mislukt: ${err.message}` });
      }
    } finally {
      isSyncingRef.current = false;
    }
  };

  // 1. Direct pullen bij opstarten én focus
  useEffect(() => {
    if (autoSyncEnabled && ghUser && ghRepo && ghToken && ghPassword) {
      pullFromGitHub(true);
    }

    const handleWindowFocus = () => {
      if (autoSyncEnabled && ghUser && ghRepo && ghToken && ghPassword) {
        pullFromGitHub(true);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [autoSyncEnabled, ghUser, ghRepo, ghToken, ghPassword]);

  // 2. Achtergrond polling (Desktop: altijd elke 60s, Mobile/Browser: enkel bij focus/actief)
  useEffect(() => {
    if (!autoSyncEnabled || !ghUser || !ghRepo || !ghToken || !ghPassword) return;

    const isDesktopApp = Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);

    // Directe functie die een tick uitvoert
    const executeBackgroundPull = () => {
      // Op desktop ALTIJD pullen; op mobiel/browser enkel als het tabblad/venster zichtbaar is
      if (isDesktopApp || document.visibilityState === 'visible') {
        pullFromGitHub(true);
      }
    };

    // Standaard interval van 60 seconden
    const pollInterval = setInterval(executeBackgroundPull, 60000);

    // Visibility fallback: zodra je een browsertabblad weer tevoorschijn haalt
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pullFromGitHub(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoSyncEnabled, ghUser, ghRepo, ghToken, ghPassword]);

  // Helper om taken te vergelijken ZONDER de tikkende seconden
  const serializeEssentialData = (taskList, catList) => {
    const cleanTasks = taskList.map(t => ({
      id: t.id,
      title: t.title,
      content: t.content,
      categoryId: t.categoryId,
      type: t.type,
      date: t.date,
      endDate: t.endDate,
      status: t.status,
      completed: t.completed,
      order: t.order,
      subtasks: t.subtasks,
      links: t.links,
      files: t.files
      // secondsSpent en history laten we hier bewust weg!
    }));
    return JSON.stringify({ tasks: cleanTasks, categories: catList });
  };

  // Stabiele timer ref zodat her-renders hem niet per ongeluk annuleren
  const pushTimerRef = useRef(null);

  // Houd altijd de meest actuele functies/data beschikbaar in refs
  const latestDataRef = useRef({ tasks, categories, ghUser, ghRepo, ghToken, ghPassword });
  useEffect(() => {
    latestDataRef.current = { tasks, categories, ghUser, ghRepo, ghToken, ghPassword };
  }, [tasks, categories, ghUser, ghRepo, ghToken, ghPassword]);

  //Debounce
  useEffect(() => {
    // Sla de allergrootste eerste opstart over
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!autoSyncEnabled) return;

    const currentHash = getTaskContentHash(tasks, categories);

    // Als de inhoudelijke taken/lijsten exact hetzelfde zijn: direct stoppen
    if (currentHash === prevContentHashRef.current) {
      return;
    }

    prevContentHashRef.current = currentHash;

    addDebugLog(`Echte wijziging doorgevoerd!`);
    addDebugLog(`Timer van 1.5s gestart voor automatische push...`);

    // Reset enkel als de gebruiker zelf wéér een nieuwe wijziging typt
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    pushTimerRef.current = setTimeout(async () => {
      addDebugLog(`Timer afgelopen -> pushToGitHub(true) wordt aangeroepen.`);
      
      const creds = latestDataRef.current;
      if (!creds.ghUser || !creds.ghRepo || !creds.ghToken || !creds.ghPassword) {
        addDebugLog(`Fout: Gegevens niet compleet voor automatische push.`);
        return;
      }

      await pushToGitHub(true);
    }, 1500);

  }, [tasks, categories]); // Luister enkel naar wijzigingen in taken en categorieën!

  // Timer Tick
  useEffect(() => {
    lastTickTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSecs = Math.max(1, Math.round((now - lastTickTimeRef.current) / 1000));
      lastTickTimeRef.current = now;

      setTasks(prev => prev.map(t => {
        if (t.status === 'play' && !t.completed) {
          return { ...t, secondsSpent: (t.secondsSpent || 0) + elapsedSecs };
        }
        return t;
      }));

      setEditingTask(prev => {
        if (prev && prev.status === 'play' && !prev.completed) {
          return { ...prev, secondsSpent: (prev.secondsSpent || 0) + elapsedSecs };
        }
        return prev;
      });

      setSharedItems(prev => prev.filter(item => item.expiresAt > now));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Date Helpers
  const formatIsoDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseIsoString = (isoStr) => {
    if (!isoStr) return new Date();
    const parts = isoStr.split('-');
    if (parts.length !== 3) return new Date();
    const [y, m, d] = parts.map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const todayDateStr = new Intl.DateTimeFormat('nl-BE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
  
  const formatTime = (secs = 0) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const h = Math.floor(m / 60);
    return `${h > 0 ? `${h}u ` : ''}${m % 60}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const formatCollapsedTime = (secs = 0) => {
    const m = Math.floor(secs / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}u ${m % 60}m`;
    return `${m}m`;
  };

  const isoToDutch = (isoStr) => {
    if (!isoStr || isoStr.length !== 10) return '';
    const [y, m, d] = isoStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatBadgeDate = (isoStr) => {
    if (!isoStr) return 'Ongepland';
    const d = parseIsoString(isoStr);
    const day = DAY_NAMES[d.getDay()];
    const [y, m, dayNum] = isoStr.split('-');
    return { day, dateFormatted: `${dayNum}/${m}/${y}` };
  };

  const getNextWeekdayIso = (shortcut) => {
    const map = { 
      'zo': 0, 'zondag': 0, 
      'ma': 1, 'maandag': 1, 
      'di': 2, 'dinsdag': 2, 
      'wo': 3, 'woensdag': 3, 
      'do': 4, 'donderdag': 4, 
      'vr': 5, 'vrijdag': 5, 
      'za': 6, 'zaterdag': 6 
    };
    const targetDay = map[shortcut.toLowerCase().trim()];
    if (targetDay === undefined) return null;

    const d = new Date();
    const currentDay = d.getDay();
    let diff = targetDay - currentDay;
    if (diff <= 0) diff += 7;

    d.setDate(d.getDate() + diff);
    return formatIsoDate(d);
  };

  const dutchToIso = (dutchStr) => {
    const parts = dutchStr.split('/');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts;
    const yr = parseInt(y, 10);
    if (yr < 2026 || yr > 2050) return null;
    return `${yr}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  const isTaskOnDate = (task, dateStr) => {
    if (!task.date) return false;
    if (!task.endDate) return task.date === dateStr;
    return dateStr >= task.date && dateStr <= task.endDate;
  };

  const isMultiDayTask = (task) => {
    return Boolean(task.endDate && task.endDate > task.date);
  };

  const shiftCalendar = (dir) => {
    const next = new Date(currentCalendarAnchorDate);
    if (currentCalendarViewMode === 'week') {
      next.setDate(next.getDate() + dir * 7);
    } else if (currentCalendarViewMode === 'month') {
      next.setMonth(next.getMonth() + dir);
    }
    setCurrentCalendarAnchorDate(next);
  };

  const handleSmartCalendarWheel = (e, isDayScrollable = false) => {
    if (isDayScrollable) return;
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 250) return;
    if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0 || e.deltaX > 0) {
        shiftCalendar(1);
      } else {
        shiftCalendar(-1);
      }
    }
  };

  const openTaskModal = (task = null) => {
    setNewLinkInput('');
    if (task) {
      setIsCreatingNewTask(false);
      setEditingTask(JSON.parse(JSON.stringify(task)));
      setOriginalTask(JSON.parse(JSON.stringify(task)));
      const initialIso = task.date || '';
      setDateTextInput(initialIso ? isoToDutch(initialIso) : '');
      setDayTextInput(initialIso ? getDayNameFromIso(initialIso) : '');
      if (initialIso) {
        const [y, m] = initialIso.split('-');
        setPickerYear(parseInt(y, 10) < 2026 ? 2026 : parseInt(y, 10));
        setPickerMonth(parseInt(m, 10) - 1);
      }
    } else {
      setIsCreatingNewTask(true);
      const defaultCat = categories.find(c => c.type === activeTab && !c.archived)?.id;
      const emptyTask = {
        id: `task-${Date.now()}`,
        title: '',
        content: '',
        categoryId: defaultCat || categories[0]?.id,
        type: activeTab === 'private' ? 'private' : 'school',
        date: '',
        endDate: '',
        status: 'queue',
        completed: false,
        order: 99,
        secondsSpent: 0,
        subtasks: [],
        links: [],
        files: [],
        history: [{ action: 'Aangemaakt', timestamp: new Date().toLocaleString('nl-BE') }]
      };
      setEditingTask(emptyTask);
      setOriginalTask(emptyTask);
      setDateTextInput('');
      setDayTextInput('');
      const now = new Date();
      setPickerYear(now.getFullYear() < 2026 ? 2026 : now.getFullYear());
      setPickerMonth(now.getMonth());
    }
    setShowDatePickerModal(false);
    setNewSubtaskText('');
  };

  const saveAndCloseTaskModal = () => {
    if (!editingTask) {
      setEditingTask(null);
      return;
    }

    if (isCreatingNewTask) {
      if (!editingTask.title.trim()) {
        setEditingTask(null);
        return;
      }
      setTasks([...tasks, editingTask]);
    } else {
      const changes = [];
      if (editingTask.title !== originalTask.title) changes.push(`Titel gewijzigd naar "${editingTask.title}"`);
      if (editingTask.content !== originalTask.content) changes.push('Inhoud aangepast');
      if (editingTask.type !== originalTask.type) changes.push(`Omgeving gewijzigd naar ${editingTask.type}`);
      if (editingTask.categoryId !== originalTask.categoryId) {
        const cat = categories.find(c => c.id === editingTask.categoryId);
        changes.push(`Vak/Lijst gewijzigd naar ${cat ? cat.name : 'geen'}`);
      }
      if (editingTask.date !== originalTask.date || editingTask.endDate !== originalTask.endDate) {
        changes.push(`Datum gewijzigd naar ${editingTask.date || 'Ongepland'}${editingTask.endDate ? ` tot ${editingTask.endDate}` : ''}`);
      }
      if ((editingTask.subtasks || []).length !== (originalTask.subtasks || []).length) changes.push('Subtaken bijgewerkt');

      let updatedHistory = editingTask.history || [];
      if (changes.length > 0) {
        updatedHistory = [{ action: changes.join(' • '), timestamp: new Date().toLocaleString('nl-BE') }, ...updatedHistory];
      }

      const finalTask = { ...editingTask, history: updatedHistory };
      setTasks(tasks.map(t => t.id === finalTask.id ? finalTask : t));
    }

    setEditingTask(null);
    setOriginalTask(null);
    setIsCreatingNewTask(false);
    setShowDatePickerModal(false);
    setNewLinkInput('');
  };

  const toggleTaskTimer = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowPlaying = t.status === 'play';
        const nextStatus = isNowPlaying ? 'pause' : 'play';
        return {
          ...t,
          status: nextStatus,
          history: [{ action: isNowPlaying ? 'Gepauzeerd' : 'Gestart (Play)', timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])]
        };
      }
      if (t.status === 'play') {
        return { ...t, status: 'pause' };
      }
      return t;
    }));
  };

  const markComplete = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: true,
          status: 'queue',
          history: [{ action: `Voltooid op ${t.date || 'vandaag'}`, timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])]
        };
      }
      return t;
    }));
  };

  const unmarkComplete = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: false,
          status: t.secondsSpent > 0 ? 'pause' : 'queue',
          history: [{ action: 'Heropend (onvoltooid)', timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])]
        };
      }
      return t;
    }));
    if (viewingArchiveTask?.id === taskId) {
      setViewingArchiveTask(null);
    }
  };

  const handleDragEndCalendarReorder = (targetDateStr, isInsideMyDay = false) => {
    if (!draggedTaskId) return;

    if (dragOverTaskId && dragOverTaskId !== draggedTaskId) {
      const targetDayTasks = isInsideMyDay 
        ? [...tasks.filter(t => isTaskOnDate(t, targetDateStr))].sort((a, b) => (a.order || 0) - (b.order || 0))
        : [...tasks.filter(t => isTaskOnDate(t, targetDateStr) && !isMultiDayTask(t))].sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const hoverIndex = targetDayTasks.findIndex(t => t.id === dragOverTaskId);
      const movingTask = tasks.find(t => t.id === draggedTaskId);
      
      if (movingTask && hoverIndex > -1) {
        if (!isInsideMyDay && movingTask.date !== targetDateStr) {
          movingTask.date = targetDateStr;
          movingTask.endDate = '';
        }

        const filtered = targetDayTasks.filter(t => t.id !== draggedTaskId);
        filtered.splice(hoverIndex, 0, movingTask);
        
        const updated = tasks.map(t => {
          if (filtered.some(ft => ft.id === t.id)) {
            const idx = filtered.findIndex(ft => ft.id === t.id);
            return { ...t, order: idx + 1 };
          }
          return t;
        });
        setTasks(updated);
      }
    } else if (!isInsideMyDay) {
      setTasks(prev => prev.map(t => {
        if (t.id === draggedTaskId) {
          return {
            ...t,
            date: targetDateStr,
            endDate: '',
            history: [{ action: `Ingepland naar ${targetDateStr || 'Ongepland'}`, timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])]
          };
        }
        return t;
      }));
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const openTimeEditor = (task) => {
    const totalSecs = task.secondsSpent || 0;
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    setInputHours(h.toString());
    setInputMinutes(m.toString());
    setEditingTimeTask(task);
    setTimeEditStep(1);
  };

  const confirmTimeEdit = () => {
    const h = parseInt(inputHours, 10) || 0;
    const m = parseInt(inputMinutes, 10) || 0;
    if (editingTimeTask && h >= 0 && m >= 0) {
      const newSecs = (h * 3600) + (m * 60);
      setTasks(prev => prev.map(t => {
        if (t.id === editingTimeTask.id) {
          return {
            ...t,
            secondsSpent: newSecs,
            status: newSecs > 0 ? (t.status === 'play' ? 'play' : 'pause') : 'queue',
            history: [{ action: `Tijd manueel aangepast naar ${h}u ${m}m`, timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])]
          };
        }
        return t;
      }));
      if (editingTask && editingTask.id === editingTimeTask.id) {
        setEditingTask({ ...editingTask, secondsSpent: newSecs });
      }
    }
    setEditingTimeTask(null);
    setTimeEditStep(1);
  };

  const resetTaskTimeAndStatus = () => {
    if (editingTask) {
      const updated = {
        ...editingTask,
        secondsSpent: 0,
        status: 'queue'
      };
      setEditingTask(updated);
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, secondsSpent: 0, status: 'queue' } : t));
    }
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      if (editingTask?.id === taskToDelete.id) setEditingTask(null);
      setTaskToDelete(null);
    }
  };

  const handleDayTyped = (val) => {
    setDayTextInput(val);
    const shortcutIso = getNextWeekdayIso(val);
    if (shortcutIso && editingTask) {
      setEditingTask({ ...editingTask, date: shortcutIso });
      setDateTextInput(isoToDutch(shortcutIso));
      setDayTextInput(getDayNameFromIso(shortcutIso));
    }
  };

  const handleDateTyped = (val) => {
    setDateTextInput(val);
    const iso = dutchToIso(val);
    if (iso && editingTask) {
      setEditingTask({ ...editingTask, date: iso });
      setDayTextInput(getDayNameFromIso(iso));
    }
  };

  const selectDateFromPicker = (year, month, day) => {
    const iso = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setEditingTask({ ...editingTask, date: iso });
    setDateTextInput(isoToDutch(iso));
    setDayTextInput(getDayNameFromIso(iso));
    setShowDatePickerModal(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim() || !editingTask) return;
    const newSt = {
      id: `st-${Date.now()}`,
      text: newSubtaskText.trim(),
      done: false
    };
    setEditingTask({
      ...editingTask,
      subtasks: [...(editingTask.subtasks || []), newSt]
    });
    setNewSubtaskText('');
  };

  const toggleSubtask = (stId) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: (editingTask.subtasks || []).map(st => st.id === stId ? { ...st, done: !st.done } : st)
    });
  };

  const deleteSubtask = (stId) => {
    if (!editingTask) return;
    setEditingTask({
      ...editingTask,
      subtasks: (editingTask.subtasks || []).filter(st => st.id !== stId)
    });
  };

  const handleSaveCategory = () => {
    if (!newCatName.trim()) return;
    const chosenColor = newCatHex || newCatColor;

    if (editingCategoryObj) {
      setCategories(categories.map(c => c.id === editingCategoryObj.id ? { ...c, name: newCatName, color: chosenColor, icon: newCatIcon } : c));
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: newCatName,
        type: activeTab === 'school' ? 'school' : 'private',
        color: chosenColor,
        icon: newCatIcon,
        archived: false
      };
      setCategories([...categories, newCat]);
    }
    setEditingCategoryObj(null);
    setNewCatName('');
    setNewCatHex('');
    setNewCatIcon('none');
  };

  const confirmArchiveCategoryDefinitive = () => {
    if (categoryToArchive) {
      setCategories(categories.map(c => c.id === categoryToArchive.id ? { ...c, archived: true } : c));
      setCategoryToArchive(null);
      setArchiveConfirmStep(1);
    }
  };

  const confirmDeleteCategoryDefinitive = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setTasks(tasks.filter(t => t.categoryId !== categoryToDelete.id));
      setCategoryToDelete(null);
      setCatDeleteStep(1);
    }
  };

  const addSharedItem = (name, type, payload) => {
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const newItem = {
      id: `share-${Date.now()}`,
      name,
      type,
      payload,
      createdAt: new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
      expiresAt
    };
    setSharedItems([newItem, ...sharedItems]);
    setShareText('');
  };

  const handleShareFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) addSharedItem(file.name, 'file', URL.createObjectURL(file));
    e.target.value = null;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Actieve categorieën filter
  const activeCategoriesIds = categories.filter(c => !c.archived).map(c => c.id);
  const myDayTasks = tasks.filter(t => activeCategoriesIds.includes(t.categoryId) && isTaskOnDate(t, todayStr));
  const activePlayingTask = myDayTasks.find(t => t.status === 'play' && !t.completed);
  const queuedTodayTasks = myDayTasks.filter(t => !t.completed).sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedTodayTasks = myDayTasks.filter(t => t.completed);

  const activeWorkspaceTasks = tasks.filter(t => activeCategoriesIds.includes(t.categoryId) && t.type === activeTab && (!t.completed || currentShowCompleted));
  const unplannedTasks = activeWorkspaceTasks.filter(t => !t.date && !t.completed);
  const plannedTasks = activeWorkspaceTasks.filter(t => t.date && !t.completed);

  // Kalenderweergave op basis van actieve tab
  const calendarDays = (() => {
    const days = [];
    if (currentCalendarViewMode === 'week') {
      const current = new Date(currentCalendarAnchorDate);
      const dayOfWeek = (current.getDay() + 6) % 7;
      current.setDate(current.getDate() - dayOfWeek);

      for (let i = 0; i < 7; i++) {
        const d = new Date(current);
        d.setDate(d.getDate() + i);
        days.push(formatIsoDate(d));
      }
    } else if (currentCalendarViewMode === 'month') {
      const yr = currentCalendarAnchorDate.getFullYear();
      const m = currentCalendarAnchorDate.getMonth();
      
      const firstDayOfMonth = new Date(yr, m, 1, 12, 0, 0);
      const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;
      
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - startDayOffset);

      const lastDayOfMonth = new Date(yr, m + 1, 0, 12, 0, 0);
      const totalDaysNeeded = startDayOffset + lastDayOfMonth.getDate();
      const rows = totalDaysNeeded > 35 ? 42 : 35;

      for (let i = 0; i < rows; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        days.push(formatIsoDate(d));
      }
    } else if (currentCalendarViewMode === 'custom') {
      let curr = parseIsoString(customRangeStart);
      const end = parseIsoString(customRangeEnd);
      
      const startOffset = (curr.getDay() + 6) % 7;
      curr.setDate(curr.getDate() - startOffset);

      while (curr <= end || days.length % 7 !== 0) {
        days.push(formatIsoDate(curr));
        curr.setDate(curr.getDate() + 1);
        if (days.length > 56) break;
      }
    }
    return days;
  })();

  const calendarHeaderTitle = `${MONTH_NAMES[currentCalendarAnchorDate.getMonth()]} ${currentCalendarAnchorDate.getFullYear()}`;

  const calendarTasks = tasks.filter(t => {
    if (!activeCategoriesIds.includes(t.categoryId)) return false;
    if (t.completed && !currentShowCompleted) return false;
    if (currentScope === 'school') return t.type === 'school';
    if (currentScope === 'private') return t.type === 'private';
    return true;
  });

  const allPlannedDatesSet = new Set();
  plannedTasks.forEach(t => {
    if (isMultiDayTask(t)) {
      const startIso = t.date < todayStr ? todayStr : t.date;
      const curr = parseIsoString(startIso);
      const end = parseIsoString(t.endDate);
      while (curr <= end) {
        allPlannedDatesSet.add(formatIsoDate(curr));
        curr.setDate(curr.getDate() + 1);
      }
    } else if (t.date) {
      allPlannedDatesSet.add(t.date);
    }
  });
  const uniqueRelevantDates = Array.from(allPlannedDatesSet).sort();

  // Diagnostics Berekeningen
  const diagTasks = (() => {
    const now = new Date();
    const todayIso = formatIsoDate(now);
    
    return tasks.filter(t => {
      if (!diagSelectedCategories.includes(t.categoryId)) return false;
      if (!t.date) return diagTimeRange === 'always';

      if (diagTimeRange === 'today') return isTaskOnDate(t, todayIso);
      if (diagTimeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return t.date >= formatIsoDate(weekAgo) && t.date <= todayIso;
      }
      if (diagTimeRange === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return t.date >= formatIsoDate(monthAgo) && t.date <= todayIso;
      }
      if (diagTimeRange === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(now.getFullYear() - 1);
        return t.date >= formatIsoDate(yearAgo) && t.date <= todayIso;
      }
      if (diagTimeRange === 'custom') {
        return t.date >= diagCustomStart && t.date <= diagCustomEnd;
      }
      return true;
    });
  })();

  const diagCompletedTasks = diagTasks.filter(t => t.completed);
  const diagTotalSeconds = diagTasks.reduce((acc, t) => acc + (t.secondsSpent || 0), 0);

  const diagEfficiencyScore = (() => {
    if (diagTasks.length === 0) return 100;
    const completionRate = (diagCompletedTasks.length / diagTasks.length) * 50;
    
    let totalSubtasks = 0;
    let doneSubtasks = 0;
    diagTasks.forEach(t => {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        doneSubtasks += t.subtasks.filter(s => s.done).length;
      }
    });
    const subtaskRate = totalSubtasks > 0 ? (doneSubtasks / totalSubtasks) * 25 : 25;
    const trackedTasksCount = diagTasks.filter(t => (t.secondsSpent || 0) > 60).length;
    const focusRate = (trackedTasksCount / diagTasks.length) * 25;

    return Math.min(100, Math.round(completionRate + subtaskRate + focusRate));
  })();

  const diagAvgSecondsPerTask = diagTasks.length > 0 ? Math.round(diagTotalSeconds / diagTasks.length) : 0;

  const renderCategoryBadge = (cat) => {
    if (!cat) return null;
    return (
      <span 
        className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg max-w-[130px] truncate shadow-2xs"
        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
      >
        <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{cat.name}</span>
      </span>
    );
  };

  const renderStatusBadge = (task) => {
    if (task.completed) {
      return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><CheckCircle2 className="w-3 h-3" /> Voltooid</span>;
    }
    if (task.status === 'play') {
      return <span className="flex items-center gap-1 text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md animate-pulse"><Play className="w-3 h-3 fill-cyan-600" /> Actief</span>;
    }
    if (task.secondsSpent > 0 || task.status === 'pause') {
      return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Pause className="w-3 h-3 fill-amber-600" /> {formatTime(task.secondsSpent)}</span>;
    }
    return <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md"><Hourglass className="w-3 h-3" /> Wachtrij</span>;
  };

  const weekRows = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weekRows.push(calendarDays.slice(i, i + 7));
  }

  const layoutMultiDayBannersForWeek = (weekDays) => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    const weekMultiTasks = calendarTasks.filter(t => {
      if (!isMultiDayTask(t)) return false;
      return !(t.endDate < weekStart || t.date > weekEnd);
    });

    weekMultiTasks.sort((a, b) => {
      const durA = parseIsoString(a.endDate) - parseIsoString(a.date);
      const durB = parseIsoString(b.endDate) - parseIsoString(b.date);
      if (durB !== durA) return durB - durA;
      return a.date.localeCompare(b.date);
    });

    const slots = [];
    const placedBanners = [];

    weekMultiTasks.forEach(task => {
      const startIndex = Math.max(0, weekDays.indexOf(task.date));
      const endIndex = task.endDate && weekDays.includes(task.endDate) ? weekDays.indexOf(task.endDate) : 6;
      
      let slotIndex = 0;
      while (true) {
        if (!slots[slotIndex]) {
          slots[slotIndex] = [];
        }
        const hasOverlap = slots[slotIndex].some(item => {
          return !(endIndex < item.startIndex || startIndex > item.endIndex);
        });

        if (!hasOverlap) {
          slots[slotIndex].push({ task, startIndex, endIndex });
          placedBanners.push({ task, startIndex, endIndex, slotIndex });
          break;
        }
        slotIndex++;
      }
    });

    return {
      totalSlots: slots.length,
      placedBanners
    };
  };

  const allDashboardCompletedTasks = tasks
    .filter(t => activeCategoriesIds.includes(t.categoryId) && t.type === activeTab && t.completed)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.order || 0) - (a.order || 0));

  const visibleDashboardCompletedTasks = allDashboardCompletedTasks.slice(0, 30);

  const allArchiveCompletedTasks = tasks
    .filter(t => activeCategoriesIds.includes(t.categoryId) && t.completed)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.order || 0) - (a.order || 0));

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden select-none">
      
      {/* 1. CUSTOM TITLEBAR (Enkel zichtbaar in Tauri Desktop) */}
      {isTauriDesktop && (
        <header 
          data-tauri-drag-region
          onMouseDown={handleDragStart}
          className="h-9 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-3 z-50 select-none cursor-default shrink-0"
        >
          <div data-tauri-drag-region className="flex items-center gap-2 pointer-events-none">
            <span className="font-extrabold text-xs text-slate-700 tracking-tight ml-1">Braindump</span>
          </div>

          <div data-tauri-drag-region className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pointer-events-none">
            <Cloud className="w-3 h-3 text-cyan-600" />
            <span>
              {autoSyncEnabled 
                ? (lastSyncTime && lastSyncTime !== 'Nog niet gesynchroniseerd' ? `Sync: ${lastSyncTime}` : 'Auto-Sync Klaar')
                : 'Handmatige Sync'}
            </span>
          </div>

          <div className="flex items-center gap-1" data-tauri-drag-region="false">
            <button 
              type="button"
              onClick={handleMinimize}
              className="w-8 h-6 flex items-center justify-center hover:bg-slate-200/80 rounded-md text-slate-500 transition cursor-pointer"
              title="Minimaliseren"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={handleMaximizeToggle}
              className="w-8 h-6 flex items-center justify-center hover:bg-slate-200/80 rounded-md text-slate-500 transition cursor-pointer"
              title={isMaximized ? "Herstellen" : "Maximaliseren"}
            >
              {isMaximized ? (
                <svg 
                  className="w-3.5 h-3.5" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M5.5 3.5h5a2 2 0 0 1 2 2v5" />
                  <rect x="3.5" y="5.5" width="7" height="7" rx="1.5" />
                </svg>
              ) : (
                <svg 
                  className="w-3.5 h-3.5" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
                </svg>
              )}
            </button>
            <button 
              type="button"
              onClick={handleClose}
              className="w-8 h-6 flex items-center justify-center hover:bg-rose-500 hover:text-white rounded-md text-slate-500 transition cursor-pointer"
              title="Sluiten"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      {/* 2. APP WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ACHTERGROND GRADIENTS */}
        <div className="absolute top-[-20%] left-[-10%] w-[650px] h-[650px] rounded-[40%] bg-gradient-to-tr from-cyan-400/25 via-teal-300/20 to-blue-500/15 blur-[120px] pointer-events-none transform -rotate-12 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-[45%] bg-gradient-to-bl from-blue-400/20 via-sky-300/20 to-teal-400/15 blur-[130px] pointer-events-none transform rotate-45" />

        {/* MOBIELE TOPBAR MET HAMBURGER (enkel zichtbaar op mobiel/browser, niet in Tauri) */}
        {!isTauriDesktop && (
          <div className="md:hidden h-14 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white flex items-center justify-between px-4 shrink-0 z-30 shadow-md">
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 rounded-xl bg-white/10 active:bg-white/20 text-white cursor-pointer"
                title="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <WorkflowLogo className="w-6 h-6 text-white" />
                <span className="font-extrabold text-base tracking-tight">Braindump</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${syncStatus.state === 'syncing' ? 'bg-amber-300 animate-pulse' : syncStatus.state === 'error' ? 'bg-rose-400' : 'bg-emerald-300'}`} />
            </div>
          </div>
        )}

        {/* MOBIELE BACKDROP (overlay die de pagina verduistert wanneer menu openstaat) */}
        {!isTauriDesktop && isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          />
        )}

        {/* SIDEBAR: ZWEEFT OP MOBIEL ALS DRAWER, GEWOON IN DE FLOW OP DESKTOP */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-20
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-72
          border-r border-slate-200/80 bg-white/95 md:bg-white/75 backdrop-blur-2xl p-4 flex flex-col justify-between 
          transition-transform md:transition-all duration-300 ease-in-out shadow-2xl md:shadow-xs
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-6">
            
            {/* Kop van sidebar met logo + sluitknop op mobiel */}
            <div className="flex items-center justify-between">
              <button 
                type="button" 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="flex items-center gap-3 px-1 py-1 rounded-2xl hover:bg-slate-100/70 transition-all cursor-pointer text-left focus:outline-none group flex-1 min-w-0"
                title={isSidebarCollapsed ? "Zijbalk uitklappen" : "Zijbalk inklappen"}
              >
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/30 shrink-0 group-hover:scale-105 transition-transform">
                  <WorkflowLogo className="w-7 h-7 text-white" />
                </div>
                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <div className="truncate">
                    <h1 className="font-extrabold text-base bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight leading-tight">Braindump</h1>
                    <p className="text-[11px] font-medium text-slate-400">Workspace</p>
                  </div>
                )}
              </button>

              {/* Sluitknop kruisje (enkel zichtbaar in de drawer op mobiel) */}
              <button 
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                title="Sluit menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {[
                { id: 'myday', label: 'Mijn Dag', icon: Sun, badge: myDayTasks.length },
                { id: 'school', label: 'School', icon: GraduationCap },
                { id: 'private', label: 'Privé & Braindump', icon: User },
                { id: 'diagnostics', label: 'Diagnostics', icon: BarChart3 },
                { id: 'archive', label: 'Archief', icon: Archive },
                { id: 'cloud', label: 'Cloud Sync', icon: Cloud },
                { id: 'share', label: 'Share Drop', icon: Share2, badge: sharedItems.length || null }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false); // Sluit menu automatisch bij doorklikken op mobiel
                    }}
                    title={isSidebarCollapsed ? item.label : ''}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all ${isActive ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {(!isSidebarCollapsed || isMobileMenuOpen) && <span>{item.label}</span>}
                    {(!isSidebarCollapsed || isMobileMenuOpen) && item.badge !== undefined && item.badge !== null && (
                      <span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {!isSidebarCollapsed || isMobileMenuOpen ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-blue-500/10 border border-cyan-200/50 text-xs text-slate-800 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-cyan-700">
                <Clock className="w-3.5 h-3.5" /> Tijd Vandaag
              </span>
              <p className="font-mono text-base font-black text-slate-900">
                {formatTime(myDayTasks.reduce((acc, t) => acc + (t.secondsSpent || 0), 0))}
              </p>
            </div>
          ) : (
            <div className="p-2 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-teal-500/15 border border-cyan-200/60 text-center space-y-0.5 shadow-xs" title="Tijd Vandaag">
              <Clock className="w-4 h-4 text-cyan-700 mx-auto" />
              <span className="block font-mono text-xs font-black text-slate-900 leading-tight">
                {formatCollapsedTime(myDayTasks.reduce((acc, t) => acc + (t.secondsSpent || 0), 0))}
              </span>
            </div>
          )}
        </aside>

        {/* MAIN VIEW */}
        <main className="flex-1 flex flex-col overflow-hidden z-10">
          
          {/* 1. MIJN DAG TAB */}
          {activeTab === 'myday' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Mijn Dag</h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-cyan-700 shadow-xs capitalize">
                  {todayDateStr}
                </span>
              </div>

              {activePlayingTask ? (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 text-white shadow-xl shadow-cyan-600/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                      Nu Bezig • Spatiebalk = Pauze
                    </span>
                    <h3 className="text-xl font-black">{activePlayingTask.title}</h3>
                    {activePlayingTask.content && <p className="text-xs text-cyan-100 line-clamp-1">{activePlayingTask.content}</p>}
                  </div>

                  <div className="flex items-center gap-5">
                    <span className="font-mono text-3xl font-black">{formatTime(activePlayingTask.secondsSpent)}</span>
                    <button 
                      onClick={() => toggleTaskTimer(activePlayingTask.id)}
                      className="p-3.5 rounded-2xl bg-white text-cyan-700 hover:scale-105 transition shadow-md font-bold"
                      title="Pauzeren"
                    >
                      <Pause className="w-5 h-5 fill-cyan-700" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-white/40 text-center text-xs text-slate-400">
                  Klik op de <Play className="w-3 h-3 inline mx-1 fill-cyan-600 text-cyan-600" /> knop bij een taak om te starten.
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Vandaag Gepland ({queuedTodayTasks.length})
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Sleep taken om je volgorde te bepalen</span>
                </div>

                <div className="space-y-3">
                  {queuedTodayTasks.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                      Geen taken meer voor vandaag! Plan iets in via School of Privé.
                    </div>
                  ) : (
                    queuedTodayTasks.map((task, index) => {
                      const cat = categories.find(c => c.id === task.categoryId);
                      const isPlaying = task.status === 'play';
                      const isMulti = isMultiDayTask(task);
                      const completedSubtasks = (task.subtasks || []).filter(st => st.done).length;

                      return (
                        <div key={task.id} className="flex items-center gap-3">
                          <div className="w-6 text-right font-mono text-sm font-black text-slate-400 shrink-0">
                            {index + 1}.
                          </div>

                          <div 
                            draggable
                            onDragStart={() => setDraggedTaskId(task.id)}
                            onDragOver={(e) => { e.preventDefault(); setDragOverTaskId(task.id); }}
                            onDragEnd={() => handleDragEndCalendarReorder(todayStr, true)}
                            onClick={() => openTaskModal(task)}
                            className={`flex-1 group flex items-center gap-3.5 p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md rounded-2xl bg-white/90 border-slate-200/80 hover:border-slate-300 ${isPlaying ? 'border-cyan-500 ring-2 ring-cyan-400/30' : dragOverTaskId === task.id ? 'border-cyan-500 scale-[1.01]' : ''}`}
                            style={{
                              borderLeft: `6px solid ${cat ? cat.color : '#0EA5E9'}`
                            }}
                          >
                            <button 
                              onClick={(e) => { e.stopPropagation(); markComplete(task.id); }} 
                              className="text-slate-300 hover:text-cyan-600 transition-colors"
                              title="Voltooien"
                            >
                              <Circle className="w-5 h-5" />
                            </button>

                            <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 cursor-grab" />

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-800 truncate">
                                {isMulti && <span className="text-amber-500 mr-1">★</span>}
                                {task.title}
                              </h4>
                              
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-0.5">
                                  <ListTodo className="w-3 h-3 text-cyan-600" />
                                  <span>{completedSubtasks}/{task.subtasks.length} subtaken afgerond</span>
                                </div>
                              )}

                              {isMulti && (
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  Loopt van {isoToDutch(task.date)} tot {isoToDutch(task.endDate)}
                                </div>
                              )}
                            </div>

                            {cat && renderCategoryBadge(cat)}

                            <div onClick={(e) => e.stopPropagation()}>
                              {renderStatusBadge(task)}
                            </div>

                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleTaskTimer(task.id); }}
                              className={`p-2 rounded-xl border transition ${isPlaying ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' : 'bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100'}`}
                              title={isPlaying ? "Pauzeren" : "Starten"}
                            >
                              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-600" /> : <Play className="w-3.5 h-3.5 fill-cyan-600" />}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {completedTodayTasks.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voltooid Vandaag ({completedTodayTasks.length})</h3>
                  <div className="space-y-2">
                    {completedTodayTasks.map(task => {
                      const cat = categories.find(c => c.id === task.categoryId);
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => openTaskModal(task)}
                          className="flex items-center gap-3 p-3 bg-white/60 border border-slate-200 rounded-2xl text-xs text-slate-600 cursor-pointer hover:bg-white/90 transition"
                          style={{ borderLeft: `5px solid ${cat ? cat.color : '#10B981'}` }}
                        >
                          <button onClick={(e) => { e.stopPropagation(); unmarkComplete(task.id); }} className="hover:scale-110 transition" title="Klik om taak te heropenen">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                          </button>
                          <span className="line-through text-slate-400 flex-1 font-medium">{task.title}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openTimeEditor(task); }}
                            className="flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
                          >
                            <Clock className="w-3 h-3" /> {formatTime(task.secondsSpent)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. SCHOOL & PRIVÉ WORKSPACE */}
          {(activeTab === 'school' || activeTab === 'private') && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 md:p-6 space-y-3 md:space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTab === 'school' ? 'School Dashboard' : 'Privé & Braindump'}
                  </h2>
                  
                  <button 
                    onClick={() => setShowCategoryManager(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-xl shadow-xs"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-cyan-600" />
                    {activeTab === 'school' ? 'Vakken Beheren' : 'Lijsten Beheren'}
                  </button>
                </div>

                <button 
                  onClick={() => openTaskModal(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all hover:scale-102"
                >
                  <Plus className="w-4 h-4" /> Taak Toevoegen
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-medium">Ctrl+N</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden gap-4 md:gap-5">
                
                {/* Kalender */}
                <div 
                  onWheel={(e) => handleSmartCalendarWheel(e, false)}
                  className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col overflow-hidden select-none"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-3 mb-2 gap-2">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-black text-slate-900 capitalize">
                        {calendarHeaderTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextScope = currentScope === 'both' ? (activeTab === 'school' ? 'school' : 'private') : 'both';
                          if (activeTab === 'school') setSchoolCalScope(nextScope);
                          else setPrivateCalScope(nextScope);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
                        title="Wissel filterweergave"
                      >
                        <Filter className="w-3 h-3 text-cyan-600" />
                        <span>{currentScope === 'both' ? 'Toon: Alles' : activeTab === 'school' ? 'Toon: Enkel School' : 'Toon: Enkel Privé'}</span>
                      </button>

                      <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                        <button onClick={() => setCurrentCalendarViewMode('week')} className={`px-2.5 py-1 rounded-lg transition ${currentCalendarViewMode === 'week' ? 'bg-white shadow-xs text-cyan-700' : 'text-slate-500'}`}>Week</button>
                        <button onClick={() => setCurrentCalendarViewMode('month')} className={`px-2.5 py-1 rounded-lg transition ${currentCalendarViewMode === 'month' ? 'bg-white shadow-xs text-cyan-700' : 'text-slate-500'}`}>Maand</button>
                        <button onClick={() => setCurrentCalendarViewMode('custom')} className={`px-2.5 py-1 rounded-lg transition ${currentCalendarViewMode === 'custom' ? 'bg-white shadow-xs text-cyan-700' : 'text-slate-500'}`}>Custom</button>
                      </div>

                      {currentCalendarViewMode !== 'custom' ? (
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                          <button onClick={() => shiftCalendar(-1)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                          <button onClick={() => setCurrentCalendarAnchorDate(new Date('2026-09-01T12:00:00'))} className="px-2 py-0.5 text-xs font-bold text-cyan-600 hover:bg-cyan-50 rounded-lg">Vandaag</button>
                          <button onClick={() => shiftCalendar(1)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs">
                          <input type="date" value={customRangeStart} onChange={(e) => setCustomRangeStart(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px]" />
                          <span className="text-slate-400">tot</span>
                          <input type="date" value={customRangeEnd} onChange={(e) => setCustomRangeEnd(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-1.5 px-1">
                    {['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'].map(d => (
                      <div key={d} className="text-center font-black text-[11px] text-slate-400 uppercase tracking-wider">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                    {weekRows.map((weekDays, weekIdx) => {
                      const { totalSlots, placedBanners } = layoutMultiDayBannersForWeek(weekDays);
                      const bannerHeight = 22;
                      const bannerGap = 3;
                      const topOffset = 31;
                      const reservedHeaderPadding = totalSlots > 0 ? (topOffset + (totalSlots * (bannerHeight + bannerGap)) + 4) : topOffset;

                      return (
                        <div key={weekIdx} className="flex-1 flex flex-col min-h-0 relative">
                          {placedBanners.map(({ task, startIndex, endIndex, slotIndex }) => {
                            const cat = categories.find(c => c.id === task.categoryId);
                            const barColor = cat ? cat.color : '#0EA5E9';
                            const spanCount = (endIndex - startIndex) + 1;
                            const bannerTop = topOffset + (slotIndex * (bannerHeight + bannerGap));

                            return (
                              <div 
                                key={`${task.id}-${weekIdx}`}
                                onClick={() => openTaskModal(task)}
                                className="absolute z-20 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center px-2.5 truncate transition-transform hover:scale-[1.003]"
                                style={{
                                  backgroundColor: barColor,
                                  top: `${bannerTop}px`,
                                  height: `${bannerHeight}px`,
                                  left: `calc(${startIndex} * ((100% - 48px) / 7 + 8px))`,
                                  width: `calc(${spanCount} * ((100% - 48px) / 7) + ${(spanCount - 1) * 8}px)`
                                }}
                                title={`${task.title} (${isoToDutch(task.date)} - ${isoToDutch(task.endDate)})`}
                              >
                                <span className="truncate flex items-center gap-1.5 leading-none">
                                  <span className="text-amber-300">★</span>
                                  <span className="truncate font-medium">{task.title}</span>
                                </span>
                              </div>
                            );
                          })}

                          <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
                            {weekDays.map(dateStr => {
                              const d = parseIsoString(dateStr);
                              const isCurrentMonth = d.getMonth() === currentCalendarAnchorDate.getMonth();
                              
                              const dayTasks = calendarTasks
                                .filter(t => isTaskOnDate(t, dateStr) && !isMultiDayTask(t))
                                .sort((a, b) => {
                                  if (a.completed !== b.completed) return a.completed ? -1 : 1;
                                  return (a.order || 0) - (b.order || 0);
                                });

                              const isToday = dateStr === todayStr;

                              return (
                                <div 
                                  key={dateStr}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={() => handleDragEndCalendarReorder(dateStr)}
                                  className={`p-2 rounded-2xl border flex flex-col justify-between transition-all overflow-hidden relative ${isToday ? 'bg-cyan-50/70 border-cyan-300 ring-1 ring-cyan-400/30' : !isCurrentMonth && currentCalendarViewMode === 'month' ? 'bg-slate-50/30 border-slate-100 opacity-40' : 'bg-slate-50/60 border-slate-200/70 hover:border-cyan-300'}`}
                                >
                                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-0.5 mb-1 shrink-0">
                                    <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-md ${isToday ? 'bg-cyan-600 text-white' : 'text-slate-600'}`}>
                                      {d.getDate()} {currentCalendarViewMode !== 'month' ? `/${d.getMonth() + 1}` : ''}
                                    </span>
                                  </div>

                                  <div 
                                    style={{ paddingTop: `${Math.max(0, reservedHeaderPadding - topOffset)}px` }}
                                    className="flex-1 min-h-0 flex flex-col overflow-hidden"
                                  >
                                    <div 
                                      onWheel={(e) => {
                                        const isScrollable = e.currentTarget.scrollHeight > e.currentTarget.clientHeight;
                                        if (isScrollable) e.stopPropagation();
                                      }}
                                      className="space-y-1.5 flex-1 overflow-y-auto pr-0.5"
                                    >
                                      {dayTasks.map(t => {
                                        const cat = categories.find(c => c.id === t.categoryId);
                                        const isComp = t.completed;
                                        
                                        if (currentCalendarViewMode === 'month') {
                                          return (
                                            <div 
                                              key={t.id}
                                              draggable
                                              onDragStart={() => setDraggedTaskId(t.id)}
                                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverTaskId(t.id); }}
                                              onClick={() => openTaskModal(t)}
                                              className={`px-1.5 py-0.5 rounded-lg border shadow-2xs cursor-grab active:cursor-grabbing hover:border-cyan-400 transition-all flex items-center gap-1 bg-white border-slate-200 ${isComp ? 'opacity-50 line-through bg-emerald-50/40' : ''}`}
                                              style={{ borderLeft: `3px solid ${cat ? cat.color : '#0EA5E9'}` }}
                                            >
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); isComp ? unmarkComplete(t.id) : markComplete(t.id); }}
                                                className="text-slate-400 hover:text-cyan-600"
                                                title={isComp ? "Heropen taak" : "Voltooi taak"}
                                              >
                                                {isComp ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> : <Circle className="w-2.5 h-2.5" />}
                                              </button>
                                              {t.status === 'play' && !isComp && <Play className="w-2 h-2 fill-cyan-600 text-cyan-600 shrink-0" />}
                                              {t.status === 'pause' && !isComp && <Pause className="w-2 h-2 fill-amber-600 text-amber-600 shrink-0" />}
                                              <span className="text-[10px] font-bold text-slate-800 truncate leading-tight">
                                                {t.title}
                                              </span>
                                            </div>
                                          );
                                        }

                                        return (
                                          <div 
                                            key={t.id}
                                            draggable
                                            onDragStart={() => setDraggedTaskId(t.id)}
                                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverTaskId(t.id); }}
                                            onClick={() => openTaskModal(t)}
                                            className={`p-2.5 border shadow-xs cursor-grab active:cursor-grabbing hover:shadow-md transition-all text-left space-y-1.5 rounded-xl bg-white border-slate-200 ${isComp ? 'opacity-50 bg-emerald-50/30' : ''}`}
                                            style={{ borderLeft: `4px solid ${cat ? cat.color : '#0EA5E9'}` }}
                                          >
                                            <div className="flex items-center gap-1.5">
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); isComp ? unmarkComplete(t.id) : markComplete(t.id); }}
                                                className="text-slate-300 hover:text-cyan-600"
                                                title={isComp ? "Heropen taak" : "Voltooi taak"}
                                              >
                                                {isComp ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}
                                              </button>
                                              {t.status === 'play' && !isComp && <Play className="w-3 h-3 fill-cyan-600 text-cyan-600 shrink-0" />}
                                              {t.status === 'pause' && !isComp && <Pause className="w-3 h-3 fill-amber-600 text-amber-600 shrink-0" />}
                                              <p className={`text-xs font-bold text-slate-800 truncate flex-1 ${isComp ? 'line-through text-slate-400' : ''}`}>
                                                {t.title}
                                              </p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between gap-1">
                                              {cat ? renderCategoryBadge(cat) : <div />}
                                              {t.secondsSpent > 0 && (
                                                <span className="font-mono text-[10px] text-slate-400 shrink-0">{formatTime(t.secondsSpent)}</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Takenkolom */}
                <div className="w-full md:w-80 flex flex-col bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="font-extrabold text-xs text-slate-800">Taken Overzicht</span>
                    </div>

                    <select 
                      value={currentTaskSortMode}
                      onChange={(e) => setCurrentTaskSortMode(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-600 focus:outline-none"
                    >
                      <option value="category">Per {activeTab === 'school' ? 'Vak' : 'Lijst'}</option>
                      <option value="date">Op Datum</option>
                    </select>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    
                    {currentTaskSortMode === 'date' && unplannedTasks.length > 0 && (
                      <div className="p-3 bg-cyan-50/50 rounded-2xl border border-cyan-200/60 space-y-2">
                        <button 
                          onClick={() => setShowUnplannedTasks(!showUnplannedTasks)}
                          className="w-full flex items-center justify-between text-xs font-black text-cyan-900"
                        >
                          <span className="flex items-center gap-1.5">
                            <CalendarOff className="w-3.5 h-3.5 text-cyan-600" />
                            Nog Niet Ingepland ({unplannedTasks.length})
                          </span>
                          {showUnplannedTasks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {showUnplannedTasks && (
                          <div className="space-y-1.5 pt-1">
                            {unplannedTasks.map(task => {
                              const cat = categories.find(c => c.id === task.categoryId);
                              return (
                                <div 
                                  key={task.id}
                                  draggable
                                  onDragStart={() => setDraggedTaskId(task.id)}
                                  onClick={() => openTaskModal(task)}
                                  className="p-2 rounded-xl bg-white border border-cyan-200/80 shadow-xs cursor-grab active:cursor-grabbing hover:shadow transition-all space-y-1"
                                  style={{ borderLeft: `3px solid ${cat ? cat.color : '#0EA5E9'}` }}
                                >
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800 truncate flex-1">{task.title}</h4>
                                    {cat && renderCategoryBadge(cat)}
                                  </div>
                                  <div className="text-[10px] text-cyan-700 font-medium">Sleep naar kalender om in te plannen ➔</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Per Categorie */}
                    {currentTaskSortMode === 'category' ? (
                      categories.filter(c => c.type === activeTab && !c.archived).map(cat => {
                        const catTasks = activeWorkspaceTasks
                          .filter(t => t.categoryId === cat.id && !t.completed)
                          .sort((a, b) => (a.order || 0) - (b.order || 0));

                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5 text-slate-600" />
                                {cat.name}
                              </span>
                              <span className="font-mono text-slate-400 text-[11px]">({catTasks.length})</span>
                            </div>

                            <div className="space-y-2">
                              {catTasks.map(task => {
                                const badge = formatBadgeDate(task.date);
                                return (
                                  <div 
                                    key={task.id}
                                    draggable
                                    onDragStart={() => setDraggedTaskId(task.id)}
                                    onClick={() => openTaskModal(task)}
                                    className="p-3 border hover:bg-white hover:shadow-xs cursor-grab transition-all space-y-1 rounded-xl bg-slate-50/90 border-slate-200"
                                    style={{ borderLeft: `3px solid ${cat.color}` }}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); markComplete(task.id); }} 
                                        className="text-slate-300 hover:text-cyan-600 transition-colors"
                                        title="Voltooien"
                                      >
                                        <Circle className="w-4 h-4" />
                                      </button>
                                      {task.status === 'play' && <Play className="w-3 h-3 fill-cyan-600 text-cyan-600 shrink-0" />}
                                      {task.status === 'pause' && <Pause className="w-3 h-3 fill-amber-600 text-amber-600 shrink-0" />}
                                      <h4 className="text-xs font-bold text-slate-800 truncate flex-1">{task.title}</h4>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-[10px]">
                                      {typeof badge === 'object' ? (
                                        <span className="flex items-center gap-1 font-mono font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                                          <span className="text-cyan-700 font-black">{badge.day}</span> {badge.dateFormatted}
                                          {task.endDate && <span className="text-[9px] text-slate-400">tot {isoToDutch(task.endDate)}</span>}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Ongepland</span>
                                      )}
                                      <span className="font-mono text-slate-400">{formatTime(task.secondsSpent)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Op Datum */
                      <div className="space-y-4">
                        {uniqueRelevantDates.map(dateStr => {
                          const dayTasks = plannedTasks
                            .filter(t => isTaskOnDate(t, dateStr))
                            .sort((a, b) => (a.order || 0) - (b.order || 0));

                          const d = parseIsoString(dateStr);
                          const dayName = DAY_NAMES[d.getDay()];

                          return (
                            <div key={dateStr} className="space-y-1.5">
                              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                                <span className="px-2 py-0.5 bg-cyan-600 text-white font-black text-[10px] rounded-md font-mono">
                                  {dayName}
                                </span>
                                <span className="font-bold text-xs text-slate-800 font-mono">
                                  {isoToDutch(dateStr)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono ml-auto">
                                  ({dayTasks.length})
                                </span>
                              </div>

                              <div className="space-y-2">
                                {dayTasks.map(task => {
                                  const cat = categories.find(c => c.id === task.categoryId);
                                  const isMulti = isMultiDayTask(task);

                                  return (
                                    <div 
                                      key={`${task.id}-${dateStr}`}
                                      draggable
                                      onDragStart={() => setDraggedTaskId(task.id)}
                                      onClick={() => openTaskModal(task)}
                                      className="p-3 border hover:bg-white hover:shadow-xs cursor-grab transition-all space-y-1 rounded-xl bg-slate-50/90 border-slate-200"
                                      style={{ borderLeft: `3px solid ${cat ? cat.color : '#0EA5E9'}` }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); markComplete(task.id); }} 
                                            className="text-slate-300 hover:text-cyan-600 transition-colors"
                                            title="Voltooien op deze datum"
                                          >
                                            <Circle className="w-4 h-4" />
                                          </button>
                                          {isMulti ? <span className="text-amber-500 font-bold">★</span> : null}
                                          {task.status === 'play' && <Play className="w-3 h-3 fill-cyan-600 text-cyan-600 shrink-0" />}
                                          {task.status === 'pause' && <Pause className="w-3 h-3 fill-amber-600 text-amber-600 shrink-0" />}
                                          <h4 className="text-xs font-bold text-slate-800 truncate">{task.title}</h4>
                                        </div>
                                        {cat && renderCategoryBadge(cat)}
                                      </div>

                                      {isMulti && (
                                        <div className="text-[10px] text-slate-400 font-mono pl-5">
                                          Loopt van {isoToDutch(task.date)} tot {isoToDutch(task.endDate)}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-end text-[10px]">
                                        <span className="font-mono text-slate-400">{formatTime(task.secondsSpent)}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Voltooide Taken */}
                    <div className="pt-3 border-t border-slate-100">
                      <button 
                        onClick={toggleCurrentShowCompleted}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 py-1"
                      >
                        <span>Voltooide taken ({allDashboardCompletedTasks.length})</span>
                        {currentShowCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {currentShowCompleted && (
                        <div className="space-y-1.5 mt-2 opacity-85">
                          {visibleDashboardCompletedTasks.map(task => {
                            const cat = categories.find(c => c.id === task.categoryId);
                            return (
                              <div 
                                key={task.id} 
                                onClick={() => openTaskModal(task)}
                                className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 truncate cursor-pointer flex items-center justify-between hover:bg-white transition"
                                style={{ borderLeft: `3px solid ${cat ? cat.color : '#10B981'}` }}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); unmarkComplete(task.id); }}
                                    className="text-emerald-500 hover:text-emerald-700"
                                    title="Klik om taak te heropenen"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <span className="line-through truncate">{task.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{task.date || 'Ongepland'}</span>
                              </div>
                            );
                          })}

                          {allDashboardCompletedTasks.length > 30 && (
                            <button
                              onClick={() => setActiveTab('archive')}
                              className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 mt-1"
                            >
                              <span>Bekijk alle {allDashboardCompletedTasks.length} voltooide taken in het Archief</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 3. DIAGNOSTICS TAB */}
          {activeTab === 'diagnostics' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Diagnostics & Productiviteit</h2>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-2xl text-xs font-bold">
                    {[
                      { id: 'today', label: 'Vandaag' },
                      { id: 'week', label: 'Week' },
                      { id: 'month', label: 'Maand' },
                      { id: 'year', label: 'Jaar' },
                      { id: 'always', label: 'Altijd' },
                      { id: 'custom', label: 'Aangepast' }
                    ].map(b => (
                      <button
                        key={b.id}
                        onClick={() => setDiagTimeRange(b.id)}
                        className={`px-3 py-1.5 rounded-xl transition ${diagTimeRange === b.id ? 'bg-white shadow-xs text-cyan-700' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  {diagTimeRange === 'custom' && (
                    <div className="flex items-center gap-1.5 text-xs bg-white p-1.5 rounded-xl border border-slate-200">
                      <input type="date" value={diagCustomStart} onChange={(e) => setDiagCustomStart(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px]" />
                      <span className="text-slate-400">tot</span>
                      <input type="date" value={diagCustomEnd} onChange={(e) => setDiagCustomEnd(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-cyan-600" /> Analyse filter:
                  </span>
                  <div className="flex gap-2 text-[11px] font-bold">
                    <button onClick={() => setDiagSelectedCategories(categories.map(c => c.id))} className="text-cyan-600 hover:underline">Alles selecteren</button>
                    <span className="text-slate-300">•</span>
                    <button onClick={() => setDiagSelectedCategories(categories.filter(c => c.type === 'school').map(c => c.id))} className="text-slate-500 hover:underline">Enkel School</button>
                    <span className="text-slate-300">•</span>
                    <button onClick={() => setDiagSelectedCategories([])} className="text-rose-500 hover:underline">Alles wissen</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {categories.filter(c => !c.archived).map(cat => {
                    const isSel = diagSelectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          if (isSel) setDiagSelectedCategories(diagSelectedCategories.filter(id => id !== cat.id));
                          else setDiagSelectedCategories([...diagSelectedCategories, cat.id]);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${isSel ? 'bg-white shadow-2xs text-slate-800' : 'bg-slate-50 text-slate-400 border-dashed opacity-50'}`}
                        style={{ borderColor: isSel ? cat.color : '#cbd5e1' }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5 text-slate-600" />
                        <span>{cat.name}</span>
                        {cat.type === 'private' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">Privé</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-600" /> Focustijd ({diagTimeRange})
                  </span>
                  <p className="text-3xl font-mono font-black text-slate-900">{formatTime(diagTotalSeconds)}</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" /> Voltooide Taken
                  </span>
                  <p className="text-3xl font-mono font-black text-slate-900">{diagCompletedTasks.length} <span className="text-xs text-slate-400 font-normal">taken</span></p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" /> Efficiëntie Score
                  </span>
                  <p className="text-3xl font-mono font-black text-slate-900">{diagEfficiencyScore}%</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" /> Gem. Tijd / Taak
                  </span>
                  <p className="text-3xl font-mono font-black text-slate-900">{formatCollapsedTime(diagAvgSecondsPerTask)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-cyan-600" /> Tijdsverdeling per Vak & Lijst
                  </h3>
                  
                  <div className="space-y-3">
                    {categories.filter(c => diagSelectedCategories.includes(c.id)).map(cat => {
                      const catTime = diagTasks.filter(t => t.categoryId === cat.id).reduce((acc, t) => acc + (t.secondsSpent || 0), 0);
                      const percentage = diagTotalSeconds > 0 ? Math.round((catTime / diagTotalSeconds) * 100) : 0;

                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5 text-slate-600" />
                              {cat.name}
                            </span>
                            <span className="font-mono text-slate-500">{formatTime(catTime)} ({percentage}%)</span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: cat.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" /> Zwaarste Taken (Meeste Focustijd)
                  </h3>

                  <div className="space-y-2">
                    {diagTasks
                      .filter(t => (t.secondsSpent || 0) > 0)
                      .sort((a, b) => (b.secondsSpent || 0) - (a.secondsSpent || 0))
                      .slice(0, 5)
                      .map((t, idx) => {
                        const cat = categories.find(c => c.id === t.categoryId);
                        return (
                          <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono font-bold text-slate-400">{idx + 1}.</span>
                              <span className="font-bold text-slate-800 truncate">{t.title}</span>
                              {cat && <span className="text-[9px] px-1.5 py-0.2 rounded" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.name}</span>}
                            </div>
                            <span className="font-mono font-black text-cyan-700 shrink-0 ml-2">{formatTime(t.secondsSpent)}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 4. ARCHIEF TAB */}
          {activeTab === 'archive' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Archief</h2>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gearchiveerde Vakken & Lijsten</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {categories.filter(c => c.archived).length === 0 ? (
                    <div className="col-span-3 p-4 bg-white/60 border border-slate-200/80 rounded-2xl text-xs text-slate-400 text-center">
                      Geen gearchiveerde vakken of lijsten.
                    </div>
                  ) : (
                    categories.filter(c => c.archived).map(cat => {
                      const catTasks = tasks.filter(t => t.categoryId === cat.id);
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => setViewingArchivedCategory(cat)}
                          className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs hover:shadow-xs cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5 text-slate-700" />
                            <div>
                              <span className="font-bold text-sm text-slate-700 block">{cat.name}</span>
                              <span className="text-[10px] text-slate-400">{catTasks.length} taken gekoppeld (Klik om te bekijken)</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategories(categories.map(c => c.id === cat.id ? { ...c, archived: false } : c));
                            }}
                            className="text-xs font-bold text-cyan-600 hover:underline flex items-center gap-1 bg-cyan-50 px-2.5 py-1.5 rounded-xl border border-cyan-200/60"
                            title="Dearchiveren & taken herstellen"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Herstellen
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Voltooide Taken Geschiedenis ({allArchiveCompletedTasks.length})
                </h3>
                
                <div className="space-y-2">
                  {allArchiveCompletedTasks.map(task => {
                    const cat = categories.find(c => c.id === task.categoryId);
                    const isMulti = isMultiDayTask(task);
                    const startBadge = formatBadgeDate(task.date);
                    const endBadge = isMulti ? formatBadgeDate(task.endDate) : null;

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => setViewingArchiveTask(task)}
                        className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 transition shadow-2xs"
                        style={{ borderLeft: `5px solid ${cat ? cat.color : '#10B981'}` }}
                      >
                        <div className="flex items-center gap-3 truncate flex-1 min-w-0">
                          <button 
                            onClick={(e) => { e.stopPropagation(); unmarkComplete(task.id); }}
                            className="text-emerald-500 hover:text-emerald-700"
                            title="Klik om taak te heropenen"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className="font-semibold line-through text-slate-600 truncate">{task.title}</span>
                          {cat && renderCategoryBadge(cat)}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] shrink-0 ml-3">
                          <div className="w-40 text-right font-mono flex items-center justify-end gap-1">
                            {typeof startBadge === 'object' ? (
                              <span className="font-bold text-slate-700">
                                <span className="text-cyan-700 font-black mr-0.5">{startBadge.day}</span> {startBadge.dateFormatted}
                                {isMulti && typeof endBadge === 'object' && (
                                  <span className="text-[10px] text-slate-400 block">➔ <span className="text-cyan-700 font-black">{endBadge.day}</span> {endBadge.dateFormatted}</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">Ongepland</span>
                            )}
                          </div>

                          <div className="w-24 text-right font-mono font-black text-cyan-700">
                            {formatTime(task.secondsSpent)}
                          </div>

                          <div className="w-16 text-right">
                            <span className="text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg font-bold">
                              Bekijken
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. CLOUD SYNC TAB */}
          {activeTab === 'cloud' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cloud Synchronisatie & Kluis</h2>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AES-256-GCM Versleuteld</span>
                </div>
              </div>

              {/* Status Melder */}
              {syncStatus.message && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${syncStatus.state === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : syncStatus.state === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-cyan-50 border-cyan-200 text-cyan-700 animate-pulse'}`}>
                  {syncStatus.state === 'success' ? <Check className="w-4 h-4 shrink-0" /> : syncStatus.state === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{syncStatus.message}</span>
                </div>
              )}

              {/* Instellingenformulier */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-600" /> GitHub Beveiligingsgegevens
                  </h3>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoSyncEnabled} 
                      onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                      className="rounded accent-cyan-600 w-4 h-4"
                    />
                    <span>Automatische Sync (Push & Pull)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GitHub Gebruikersnaam</label>
                    <input 
                      type="text" 
                      placeholder="bv. JouwGitHubNaam"
                      value={ghUser} 
                      onChange={(e) => setGhUser(e.target.value.trim())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Private Repo Naam</label>
                    <input 
                      type="text" 
                      placeholder="braindump-data"
                      value={ghRepo} 
                      onChange={(e) => setGhRepo(e.target.value.trim())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Personal Access Token (ghp_...)</label>
                      {ghToken && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Opgeslagen in app
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showToken ? "text" : "password"}
                        placeholder={ghToken ? "•••••••••••••••••••• (Actief)" : "ghp_xxxxxxxxxxxxxxxxxxxx"}
                        value={tempToken}
                        onChange={(e) => setTempToken(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-9 text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showToken ? "Verberg token" : "Toon token"}
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Master Wachtwoord (AES-256)</label>
                      {ghPassword && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Opgeslagen in app
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder={ghPassword ? "•••••••••••••••••••• (Actief)" : "Kies een sterk wachtwoord..."}
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-9 text-xs font-mono font-bold focus:outline-none focus:border-cyan-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-400">Laatste synchronisatie: {lastSyncTime}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => pullFromGitHub(false)}
                      disabled={syncStatus.state === 'syncing'}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Nu Ophalen (Pull)
                    </button>

                    <button
                      type="button"
                      onClick={() => pushToGitHub(false)}
                      disabled={syncStatus.state === 'syncing'}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition hover:scale-102"
                    >
                      <UploadCloud className="w-4 h-4" /> Nu Versleuteld Opslaan (Push)
                    </button>
                  </div>
                </div>
              </div>
              
              {/* INKLAPBARE LIVE SYNC DEBUGGER */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowDebugger(!showDebugger)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{showDebugger ? 'Verberg Live Sync Debugger' : 'Toon Live Sync Debugger'}</span>
                  {showDebugger ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDebugger && (
                  <div className="mt-3 p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs shadow-inner animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-cyan-400">Live Sync Debugger</span>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>AutoSync: {autoSyncEnabled ? 'AAN' : 'UIT'}</span>
                        <span>Token in state: {ghToken ? 'JA' : 'NEE'}</span>
                        <span>Pass in state: {ghPassword ? 'JA' : 'NEE'}</span>
                        <button 
                          type="button" 
                          onClick={() => setDebugLogs([])} 
                          className="text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          Wissen
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {debugLogs.length === 0 ? (
                        <span className="text-slate-500 italic">Geen recente sync-events gelogd. Voer een wijziging uit om live mee te kijken.</span>
                      ) : (
                        debugLogs.map((log, i) => (
                          <div key={i} className="leading-tight text-[11px]">{log}</div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          )}

          {/* 6. SHARE DROP TAB */}
          {activeTab === 'share' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Share Drop</h2>

              <div 
                onClick={() => shareFileInputRef.current?.click()}
                className="p-10 bg-white border-2 border-dashed border-cyan-300 hover:border-cyan-500 rounded-3xl text-center cursor-pointer transition-all shadow-xs hover:shadow-md flex flex-col items-center justify-center space-y-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 group-hover:bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs transition">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">Klik hier om een bestand te droppen</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Direct beschikbaar voor download op je andere apparaten</p>
                </div>
                <input type="file" ref={shareFileInputRef} onChange={handleShareFilePicked} className="hidden" />
              </div>

              <div className="p-4 bg-white/90 border border-slate-200 rounded-2xl flex gap-2 shadow-2xs">
                <input 
                  type="text" 
                  placeholder="Of typ een snel linkje of notitie voor gsm..." 
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && shareText.trim()) addSharedItem('Snelle Notitie', 'text', shareText); }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-cyan-500 font-medium"
                />
                <button 
                  onClick={() => { if (shareText.trim()) addSharedItem('Snelle Notitie', 'text', shareText); }}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-800 transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Versturen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sharedItems.length === 0 ? (
                  <div className="col-span-2 p-8 bg-white/40 border border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                    Geen actieve drops. Drop een bestand of tekst om direct te delen.
                  </div>
                ) : (
                  sharedItems.map(item => {
                    const timeLeftSecs = Math.max(0, Math.floor((item.expiresAt - Date.now()) / 1000));
                    const mins = Math.floor(timeLeftSecs / 60);
                    const secs = timeLeftSecs % 60;

                    return (
                      <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 truncate">{item.name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-200/60">
                            ⏳ nog {mins}m {secs < 10 ? '0' : ''}{secs}s
                          </span>
                        </div>

                        {item.type === 'text' ? (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl break-all select-all font-mono">{item.payload}</p>
                        ) : (
                          <a href={item.payload} download={item.name} className="flex items-center gap-2 text-xs text-cyan-600 font-bold hover:underline">
                            <FolderOpen className="w-4 h-4" /> Download / Open Bestand
                          </a>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>Geplaatst om {item.createdAt}</span>
                          <button onClick={() => setSharedItems(sharedItems.filter(s => s.id !== item.id))} className="text-rose-500 hover:underline">
                            Direct Wissen
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- POP-UP MODAL: BEKIJK ARCHIEF TAAK --- */}
      {viewingArchiveTask && (() => {
        const cat = categories.find(c => c.id === viewingArchiveTask.categoryId);
        const isMulti = isMultiDayTask(viewingArchiveTask);

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Voltooide Taak (Alleen-Lezen)
                  </span>
                  {cat && renderCategoryBadge(cat)}
                </div>
                <button onClick={() => setViewingArchiveTask(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">{viewingArchiveTask.title}</h3>
                {viewingArchiveTask.content && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {viewingArchiveTask.content}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Ingeplande Periode</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatBadgeDate(viewingArchiveTask.date).dateFormatted}
                    {isMulti && ` ➔ ${formatBadgeDate(viewingArchiveTask.endDate).dateFormatted}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Totale Focustijd</span>
                  <span className="font-mono font-bold text-cyan-700 text-sm">{formatTime(viewingArchiveTask.secondsSpent)}</span>
                </div>
              </div>

              {viewingArchiveTask.subtasks && viewingArchiveTask.subtasks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Subtaken</span>
                  <div className="space-y-1">
                    {viewingArchiveTask.subtasks.map(st => (
                      <div key={st.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs border border-slate-100">
                        {st.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-slate-300" />}
                        <span className={st.done ? "line-through text-slate-400" : "text-slate-700"}>{st.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingArchiveTask.links && viewingArchiveTask.links.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gekoppelde Links</span>
                  <div className="space-y-1">
                    {viewingArchiveTask.links.map((lnk, i) => (
                      <a key={i} href={lnk} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-cyan-50 rounded-xl text-xs text-cyan-600 font-bold border border-slate-100 transition truncate">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{lnk}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {viewingArchiveTask.files && viewingArchiveTask.files.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Bijlagen</span>
                  <div className="space-y-1">
                    {viewingArchiveTask.files.map((f, i) => (
                      <a key={i} href={f.url} download={f.name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs text-slate-700 font-bold border border-slate-100">
                        <FolderOpen className="w-3.5 h-3.5 text-cyan-600" />
                        <span className="truncate">{f.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {viewingArchiveTask.history && viewingArchiveTask.history.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-cyan-600" /> Activiteitshistorie
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {viewingArchiveTask.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[11px] border border-slate-100">
                        <span className="text-slate-700 font-medium">{h.action}</span>
                        <span className="text-[10px] font-mono text-slate-400">{h.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => unmarkComplete(viewingArchiveTask.id)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs hover:scale-102 transition"
                >
                  Heropen Taak (Onvoltooien om te bewerken)
                </button>
                <button
                  onClick={() => setViewingArchiveTask(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- POP-UP MODAL: BEKIJK GEARCHIVEERDE CATEGORIE & TAKEN --- */}
      {viewingArchivedCategory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: viewingArchivedCategory.color }} />
                <CategoryIcon iconName={viewingArchivedCategory.icon} className="w-4 h-4 text-slate-700" />
                <h3 className="font-extrabold text-base text-slate-900">{viewingArchivedCategory.name} (Gearchiveerd)</h3>
              </div>
              <button onClick={() => setViewingArchivedCategory(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gekoppelde Taken</h4>
              {tasks.filter(t => t.categoryId === viewingArchivedCategory.id).length === 0 ? (
                <p className="text-xs text-slate-400">Geen taken gekoppeld aan dit gearchiveerde vak.</p>
              ) : (
                <div className="space-y-1.5">
                  {tasks.filter(t => t.categoryId === viewingArchivedCategory.id).map(t => {
                    const isMulti = isMultiDayTask(t);
                    return (
                      <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <span className={`font-bold ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</span>
                        <span className="font-mono text-slate-500 font-bold">
                          {formatBadgeDate(t.date).dateFormatted}
                          {isMulti && ` ➔ ${formatBadgeDate(t.endDate).dateFormatted}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setCategories(categories.map(c => c.id === viewingArchivedCategory.id ? { ...c, archived: false } : c));
                  setViewingArchivedCategory(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Vak & Alle Taken Dearchiveren (Herstellen naar Kalender)
              </button>
              <button
                onClick={() => setViewingArchivedCategory(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL: VAK ARCHIVEREN --- */}
      {categoryToArchive && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-slate-900">
                {archiveConfirmStep === 1 ? 'Vak Archiveren?' : 'Bevestig Archiveren (2/2)'}
              </h3>
            </div>

            {archiveConfirmStep === 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Weet je zeker dat je <strong>"{categoryToArchive.name}"</strong> wilt archiveren?
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => setArchiveConfirmStep(2)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Volgende (Stap 2/2)
                  </button>
                  <button 
                    onClick={() => { setCategoryToArchive(null); setArchiveConfirmStep(1); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-black text-amber-800">LET OP:</p>
                  <p>Alle taken van <strong>"{categoryToArchive.name}"</strong> worden tijdelijk verborgen uit <em>Mijn Dag</em>, het <em>Dashboard</em> en de <em>Kalender</em>. Bij dearchiveren komen ze exact op hun oorspronkelijke plaats terug.</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={confirmArchiveCategoryDefinitive}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Definitief Archiveren
                  </button>
                  <button 
                    onClick={() => { setCategoryToArchive(null); setArchiveConfirmStep(1); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL: VAKKEN & LIJSTEN BEHEREN --- */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {activeTab === 'school' ? 'Vakken Beheren' : 'Lijsten Beheren'}
              </h3>
              <button onClick={() => { setShowCategoryManager(false); setEditingCategoryObj(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                {editingCategoryObj ? `Bewerk: "${editingCategoryObj.name}"` : 'Nieuwe Categorie Toevoegen'}
              </span>

              <input 
                type="text" 
                placeholder="Naam (bv. Nog te bekijken, Wiskunde...)" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCategory(); }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500"
              />

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Kies Icoon / Logo</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {PRESET_ICONS.map(i => {
                    return (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setNewCatIcon(i.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition ${newCatIcon === i.id ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        title={i.label}
                      >
                        <CategoryIcon iconName={i.id} className="w-3.5 h-3.5 shrink-0" />
                        {i.id === 'none' && <span className="text-[10px]">Geen</span>}
                        <span className="text-[10px] truncate">{i.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Kies Accentkleur</label>
                <div className="grid grid-cols-9 gap-1.5">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => { setNewCatColor(c); setNewCatHex(''); }}
                      className={`w-6 h-6 rounded-full transition-transform ${newCatColor === c && !newCatHex ? 'scale-125 ring-2 ring-cyan-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Of typ een eigen HEX (#0EA5E9)"
                  value={newCatHex}
                  onChange={(e) => setNewCatHex(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCategory(); }}
                  className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={handleSaveCategory}
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {editingCategoryObj ? 'Wijziging Opslaan' : 'Toevoegen'}
                </button>
                {editingCategoryObj && (
                  <button 
                    onClick={() => { setEditingCategoryObj(null); setNewCatName(''); setNewCatHex(''); setNewCatIcon('none'); }}
                    className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Annuleren
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Huidige Vakken / Lijsten</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {categories.filter(c => c.type === activeTab).map(cat => {
                  return (
                    <div key={cat.id} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${cat.archived ? 'bg-amber-50/40 border-amber-200/70' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span className={`font-bold ${cat.archived ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {cat.name} {cat.archived && <span className="text-[10px] text-amber-600 font-normal">(Gearchiveerd)</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setEditingCategoryObj(cat);
                            setNewCatName(cat.name);
                            setNewCatColor(cat.color);
                            setNewCatIcon(cat.icon || 'none');
                          }}
                          className="p-1 text-slate-500 hover:text-cyan-600"
                          title="Bewerken"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (!cat.archived) {
                              setCategoryToArchive(cat);
                              setArchiveConfirmStep(1);
                            } else {
                              setCategories(categories.map(c => c.id === cat.id ? { ...c, archived: false } : c));
                            }
                          }}
                          className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${cat.archived ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200/70 hover:bg-slate-300 text-slate-600'}`}
                          title={cat.archived ? "Dearchiveren" : "Archiveren"}
                        >
                          {cat.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>

                        <button 
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setCatDeleteStep(1);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Definitief Verwijderen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL: VAK VERWIJDEREN --- */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-slate-900">
                {catDeleteStep === 1 ? 'Vak Verwijderen?' : 'LAATSTE WAARSCHUWING! (2/2)'}
              </h3>
            </div>

            {catDeleteStep === 1 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Weet je zeker dat je het vak <strong>"{categoryToDelete.name}"</strong> wilt verwijderen?
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => setCatDeleteStep(2)}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Volgende (Stap 2/2)
                  </button>
                  <button 
                    onClick={() => { setCategoryToDelete(null); setCatDeleteStep(1); }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1">
                  <p className="font-black text-rose-700">LET OP: ALLE DATA GAAT VERLOREN!</p>
                  <p>Alle bijbehorende taken, geschiedenis, bestanden en kalenderuren voor <strong>"{categoryToDelete.name}"</strong> worden permanent gewist.</p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={confirmDeleteCategoryDefinitive}
                    className="flex-1 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/30"
                  >
                    Definitief Alles Wissen
                  </button>
                  <button 
                    onClick={() => { setCategoryToDelete(null); setCatDeleteStep(1); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL: TAAK DETAIL --- */}
      {editingTask && (() => {
        const availableCategories = categories.filter(c => c.type === editingTask.type && !c.archived);

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
              
              <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
                <span className="text-xs font-mono font-bold text-cyan-600 uppercase">
                  {isCreatingNewTask ? 'Nieuwe Taak Aanmaken' : 'Taak Bewerken'}
                </span>
                <button onClick={saveAndCloseTaskModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={editingTask.title} 
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveAndCloseTaskModal(); }}
                    className="w-full text-xl font-black text-slate-900 bg-transparent border-b border-transparent focus:border-slate-300 pb-1 focus:outline-none"
                    placeholder="Titel van de taak..."
                    autoFocus
                  />
                  <textarea 
                    value={editingTask.content || ''} 
                    onChange={(e) => setEditingTask({ ...editingTask, content: e.target.value })}
                    className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none resize-none h-20"
                    placeholder="Inhoud of extra details..."
                  />
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-cyan-600" />
                      Subtaken & Voortgang ({(editingTask.subtasks || []).filter(st => st.done).length}/{(editingTask.subtasks || []).length})
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    {(editingTask.subtasks || []).map(st => (
                      <div key={st.id} className="flex items-center gap-2 p-2 bg-white border border-slate-200/80 rounded-xl text-xs">
                        <button 
                          type="button" 
                          onClick={() => toggleSubtask(st.id)}
                          className={st.done ? "text-emerald-600" : "text-slate-300 hover:text-cyan-600"}
                        >
                          {st.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>
                        <span className={`flex-1 font-medium ${st.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {st.text}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => deleteSubtask(st.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Voeg een subtak toe..."
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSubtask}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Toevoegen
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type Omgeving</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const firstSchoolCat = categories.find(c => c.type === 'school' && !c.archived)?.id || '';
                          setEditingTask({ ...editingTask, type: 'school', categoryId: firstSchoolCat });
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition ${editingTask.type === 'school' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                      >
                        School
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const firstPrivateCat = categories.find(c => c.type === 'private' && !c.archived)?.id || '';
                          setEditingTask({ ...editingTask, type: 'private', categoryId: firstPrivateCat });
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition ${editingTask.type === 'private' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                      >
                        Privé
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      {editingTask.type === 'school' ? 'Kies Vak' : 'Kies Lijst'}
                    </label>
                    <select 
                      value={editingTask.categoryId || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, categoryId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {availableCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 relative">
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Ingeplande Datum(s)</label>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingTask({ ...editingTask, date: '', endDate: '' });
                            setDateTextInput('');
                            setDayTextInput('');
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:underline"
                        >
                          Geen datum (Ongepland)
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const todayFormatted = new Date().toISOString().split('T')[0];
                            setEditingTask({ ...editingTask, date: todayFormatted, endDate: '' });
                            setDateTextInput(isoToDutch(todayFormatted));
                            setDayTextInput(getDayNameFromIso(todayFormatted));
                          }}
                          className="text-[10px] font-bold text-cyan-600 hover:underline"
                        >
                          Zet op Vandaag
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <input 
                        type="text"
                        placeholder="Dag"
                        value={dayTextInput}
                        onChange={(e) => handleDayTyped(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveAndCloseTaskModal(); }}
                        className="w-14 bg-cyan-600 text-white font-black text-xs text-center rounded-xl py-1.5 border border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-cyan-200 uppercase"
                      />

                      <input 
                        type="text" 
                        placeholder="DD/MM/JJJJ"
                        value={dateTextInput}
                        onChange={(e) => handleDateTyped(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveAndCloseTaskModal(); }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                      />

                      <button 
                        type="button"
                        onClick={() => setShowDatePickerModal(!showDatePickerModal)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold rounded-xl border border-cyan-200/60 transition"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" /> Kalender
                      </button>
                    </div>

                    {showDatePickerModal && (
                      <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{MONTH_NAMES[pickerMonth]} {pickerYear}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" disabled={pickerYear === 2026 && pickerMonth === 0} onClick={() => { if (pickerMonth === 0) { if (pickerYear > 2026) { setPickerYear(pickerYear - 1); setPickerMonth(11); } } else { setPickerMonth(pickerMonth - 1); } }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                            <button type="button" onClick={() => { if (pickerMonth === 11) { setPickerYear(pickerYear + 1); setPickerMonth(0); } else { setPickerMonth(pickerMonth + 1); } }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => (<span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>))}
                          {(() => {
                            const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
                            const firstDayIdx = (new Date(pickerYear, pickerMonth, 1, 12, 0, 0).getDay() + 6) % 7;
                            return [
                              ...Array(firstDayIdx).fill(null).map((_, i) => <div key={`empty-${i}`} />),
                              ...Array(daysInMonth).fill(null).map((_, i) => {
                                const dayNum = i + 1;
                                return (
                                  <button key={dayNum} type="button" onClick={() => selectDateFromPicker(pickerYear, pickerMonth, dayNum)} className="p-1 text-xs rounded-lg font-mono font-medium hover:bg-cyan-50 text-slate-700">
                                    {dayNum}
                                  </button>
                                );
                              })
                            ];
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-cyan-600" /> Tot en met (Meerdaags):
                      </span>
                      <input 
                        type="date"
                        min={editingTask.date || "2026-01-01"}
                        value={editingTask.endDate || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, endDate: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-mono text-[11px]"
                      />
                      {editingTask.endDate && (
                        <button 
                          type="button" 
                          onClick={() => setEditingTask({ ...editingTask, endDate: '' })}
                          className="text-[10px] text-rose-500 font-bold hover:underline"
                        >
                          Wissen
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Geregistreerde Tijd</label>
                    <button type="button" onClick={() => openTimeEditor(editingTask)} className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-700">
                      <span>{formatTime(editingTask.secondsSpent)}</span>
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    
                    {editingTask.secondsSpent > 0 && (
                      <button 
                        type="button" 
                        onClick={resetTaskTimeAndStatus}
                        className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-1 mt-1"
                      >
                        <TimerReset className="w-3 h-3" /> Reset tijd & status naar 0m
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Web Links</h4>
                  <div className="space-y-1.5">
                    {editingTask.links?.map((lnk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <a href={lnk} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan-600 hover:underline truncate font-medium">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{lnk}</span>
                        </a>
                        <button type="button" onClick={() => setEditingTask({ ...editingTask, links: editingTask.links.filter((_, i) => i !== idx) })} className="text-slate-400 hover:text-rose-500 ml-2">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Voeg URL toe..." 
                        value={newLinkInput} 
                        onChange={(e) => setNewLinkInput(e.target.value)} 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500" 
                      />
                      <button type="button" onClick={() => { if (!newLinkInput.trim()) return; let url = newLinkInput.trim(); if (!url.startsWith('http://') && !url.startsWith('https://')) url = `https://${url}`; setEditingTask({ ...editingTask, links: [...(editingTask.links || []), url] }); setNewLinkInput(''); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Toevoegen</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lokale Bestanden</h4>
                  <div className="space-y-1.5">
                    {editingTask.files?.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-mono text-cyan-600 hover:underline truncate flex-1 font-bold">
                          <FolderOpen className="w-3.5 h-3.5 text-cyan-600 shrink-0" /> <span className="truncate">{f.name}</span>
                        </a>
                        <button type="button" onClick={() => setEditingTask({ ...editingTask, files: editingTask.files.filter((_, i) => i !== idx) })} className="text-slate-400 hover:text-rose-500 ml-2">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) setEditingTask({ ...editingTask, files: [...(editingTask.files || []), { name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`, url: URL.createObjectURL(f) }] }); e.target.value = null; }} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-dashed border-slate-300">
                      <FolderOpen className="w-4 h-4 text-cyan-600" /> Bestand Toevoegen...
                    </button>
                  </div>
                </div>

                {!isCreatingNewTask && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-cyan-600" /> Activiteit & Historie
                    </h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                      {editingTask.history?.map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-700 font-medium">{h.action}</span>
                          <span className="text-[10px] font-mono text-slate-400">{h.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 px-6 bg-slate-50/90 border-t border-slate-100 shrink-0">
                {!isCreatingNewTask ? (
                  <button type="button" onClick={() => setTaskToDelete(editingTask)} className="flex items-center gap-1.5 text-xs text-rose-500 font-bold hover:bg-rose-50 px-3 py-2 rounded-xl transition">
                    <Trash2 className="w-3.5 h-3.5" /> Taak Verwijderen
                  </button>
                ) : <div />}
                
                <button type="button" onClick={saveAndCloseTaskModal} className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20">
                  Opslaan & Sluiten
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* --- POP-UP MODAL: VERWIJDERBEVESTIGING TAAK --- */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-extrabold text-base text-slate-900">Taak Verwijderen?</h3>
            </div>
            <p className="text-xs text-slate-600">Weet je zeker dat je <strong>"{taskToDelete.title}"</strong> wilt wissen?</p>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={confirmDeleteTask} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm">Ja, Verwijderen</button>
              <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">Annuleren</button>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL: TIJD AANPASSEN --- */}
      {editingTimeTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2"><Edit3 className="w-4 h-4 text-cyan-600" /> Tijd Aanpassen</h3>
              <button onClick={() => setEditingTimeTask(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            {timeEditStep === 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Pas tijd aan voor: <strong>{editingTimeTask.title}</strong></p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Uren</label>
                    <input type="number" min="0" value={inputHours} onChange={(e) => setInputHours(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Minuten</label>
                    <input type="number" min="0" max="59" value={inputMinutes} onChange={(e) => setInputMinutes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none" />
                  </div>
                </div>
                <button onClick={() => setTimeEditStep(2)} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-sm">Volgende</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">Weet je het zeker?</p>
                  <p>De tijd wordt overschreven naar <strong>{inputHours || 0}u {inputMinutes || 0}m</strong>.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={confirmTimeEdit} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl">Definitief Toepassen</button>
                  <button onClick={() => setTimeEditStep(1)} className="px-3 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">Terug</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL: ROLLOVER --- */}
      {rolloverTasks.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-500"><AlertCircle className="w-6 h-6" /><h3 className="font-extrabold text-base text-slate-900">Onvoltooide Taken van Vorige Dagen</h3></div>
            <p className="text-xs text-slate-500">Je hebt {rolloverTasks.length} taak/taken van eerdere dagen nog niet afgerond.</p>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {rolloverTasks.map(t => (
                <div key={t.id} className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{t.title}</span>
                  <span className="font-mono text-slate-500">{t.date}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button 
                onClick={() => { 
                  const today = new Date().toISOString().split('T')[0]; 
                  setTasks(prev => prev.map(t => rolloverTasks.some(rt => rt.id === t.id) ? { ...t, date: today, endDate: '', history: [{ action: `Herpland via Rollover naar ${today}`, timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])] } : t)); 
                  setRolloverTasks([]); 
                }} 
                className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20"
              >
                Alles naar Vandaag
              </button>
              <button 
                onClick={() => {
                  setTasks(prev => prev.map(t => rolloverTasks.some(rt => rt.id === t.id) ? { ...t, completed: true, history: [{ action: `Als voltooid gemarkeerd via Rollover`, timestamp: new Date().toLocaleString('nl-BE') }, ...(t.history || [])] } : t));
                  setRolloverTasks([]);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                title="Markeer direct als voltooid op de eerdere datum"
              >
                Als Voltooid Markeren
              </button>
              <button onClick={() => setRolloverTasks([])} className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}