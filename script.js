/**
 * Telo' Corp Group — Super App Platform v2.0
 * Arquitectura modular con servicios de backend integrados.
 */

// ═══════════════════════════════════════════════════════════════
// SERVICES LAYER (Backend Integration)
// ═══════════════════════════════════════════════════════════════

const BackendService = {
  config: { supabaseUrl: '', supabaseKey: '', stripeKey: '', n8nLeads: '', n8nOrders: '', n8nServices: '', geminiKey: '', hmacSecret: '', hmacEnabled: false, stripeEnabled: false },

  loadConfig() {
    const saved = localStorage.getItem('telo_integrations');
    if (saved) Object.assign(this.config, JSON.parse(saved));
  },
  saveConfig() { localStorage.setItem('telo_integrations', JSON.stringify(this.config)); },

  async supabaseQuery(table, method = 'GET', body = null) {
    if (!this.config.supabaseUrl || !this.config.supabaseKey) return null;
    const url = `${this.config.supabaseUrl}/rest/v1/${table}`;
    const headers = { 'apikey': this.config.supabaseKey, 'Authorization': `Bearer ${this.config.supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': method === 'POST' ? 'return=representation' : '' };
    try {
      const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      return res.ok ? await res.json() : null;
    } catch (e) { console.error('[Supabase]', e); return null; }
  },

  async sendWebhook(endpoint, payload) {
    if (!endpoint) return { ok: false, error: 'No endpoint configured' };
    const headers = { 'Content-Type': 'application/json' };
    if (this.config.hmacEnabled && this.config.hmacSecret) {
      const signature = await this.hmacSign(JSON.stringify(payload));
      headers['X-Telo-Signature'] = signature;
    }
    try {
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
      return { ok: res.ok, status: res.status };
    } catch (e) { return { ok: false, error: e.message }; }
  },

  async hmacSign(message) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(this.config.hmacSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async geminiChat(message, context = '') {
    if (!this.config.geminiKey) return 'Configura tu API Key de Gemini en Integraciones para activar el asistente IA.';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.config.geminiKey}`;
    const systemPrompt = `Eres TeloAsistente, el asistente IA de Telo' Corp Group. Responde en español, de forma concisa y útil. ${context}`;
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuario: ${message}` }] }] }) });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
    } catch (e) { return 'Error al conectar con el servicio de IA.'; }
  }
};

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const State = {
  cart: [],
  wishlist: [],
  coupon: null,
  completedClasses: [],
  classNotes: {},
  userProfile: { name: '', email: '', phone: '', address: '', city: '' },
  currentView: 'home',
  currentCourse: null,
  currentLesson: 0,

  load() {
    ['cart', 'wishlist', 'completedClasses', 'classNotes', 'userProfile'].forEach(key => {
      const saved = localStorage.getItem(`telo_${key}`);
      if (saved) this[key] = JSON.parse(saved);
    });
  },
  save() {
    ['cart', 'wishlist', 'completedClasses', 'classNotes', 'userProfile'].forEach(key => {
      localStorage.setItem(`telo_${key}`, JSON.stringify(this[key]));
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT DATABASE
// ═══════════════════════════════════════════════════════════════

const products = [
  { id: 'ts-100', title: 'Diagrama Núcleo de Cobre: Cables D09', category: 'tech', price: 450, image: 'TeloCorp/images/image1.png', description: 'Diagrama técnico del cable D09 con núcleo de cobre estañado y cubierta TPE.', specs: { Material: 'Cobre estañado y TPE', Función: 'Visualización técnica' }, rating: 5, reviews: [{ user: 'Miguel B.', rating: 5, date: '05 Jun 2026', text: 'Excelente producto, se siente muy premium.' }] },
  { id: 'ts-101', title: 'Cover Magnético Transparente MagSafe', category: 'cases', price: 600, image: 'TeloCorp/images/image2.png', description: 'Funda transparente con tecnología magnética MagSafe. Policarbonato anti-amarilleo.', specs: { Material: 'TPU + Policarbonato', Compatibilidad: 'iPhone 7+ a 17 Pro Max', Características: 'MagSafe, anti-amarilleo' }, rating: 5, reviews: [{ user: 'Laura R.', rating: 5, date: '29 May 2026', text: 'Premium al tacto. Recomendado 100%.' }] },
  { id: 'ts-102', title: 'Cover Silicona Stitch Azul Premium', category: 'cases', price: 550, image: 'TeloCorp/images/image3.png', description: 'Silicona líquida con diseño 3D de Stitch. Tacto soft-touch.', specs: { Material: 'Silicona líquida', Diseño: 'Relieve 3D', Interior: 'Microfibra' }, rating: 4.5, reviews: [{ user: 'Pedro S.', rating: 5, date: '10 May 2026', text: 'Muy satisfecho, material excelente.' }] },
  { id: 'ts-103', title: 'Nevera Exhibidora Comercial Traulsen', category: 'equipos', price: 45000, image: 'TeloCorp/images/image4.png', description: 'Refrigerador comercial con puerta de vidrio templado. Acero inoxidable.', specs: { Marca: 'Traulsen', Material: 'Acero inoxidable + vidrio templado', Control: 'Termostato digital' }, rating: 4.5, reviews: [{ user: 'Daniel A.', rating: 5, date: '14 May 2026', text: 'Diseño resistente. Ajusta perfecto.' }] },
  { id: 'ts-104', title: 'Audífonos Deportivos Miccell BH96', category: 'audio', price: 1200, image: 'TeloCorp/images/image5.png', description: 'Auriculares inalámbricos deportivos con BT 5.4 y pantalla LED.', specs: { Bluetooth: '5.4', Batería: '40mAh (5.5h)', Estuche: '400mAh (24h total)' }, rating: 5, reviews: [{ user: 'Lucía H.', rating: 5, date: '14 May 2026', text: 'Excelente relación calidad-precio.' }] },
  { id: 'ts-105', title: 'Altavoz Miccell VQ-SP63 (1200mAh)', category: 'audio', price: 1500, image: 'TeloCorp/images/image6.png', description: 'Bluetooth portátil con sonido estéreo 3D y luces LED.', specs: { Batería: '1200mAh (5h)', Entradas: 'BT, USB, TF, Aux', Carga: 'USB-C' }, rating: 5, reviews: [{ user: 'Elena F.', rating: 5, date: '18 May 2026', text: 'Material excelente, llegó a tiempo.' }] },
  { id: 'ts-106', title: 'Cargador Rápido T13 (C a Lightning 20W)', category: 'tech', price: 850, image: 'TeloCorp/images/image7.png', description: 'Cargador 20W con cable USB-C a Lightning incluido.', specs: { Potencia: '20W', Cable: '1.0m C-Lightning', Voltaje: '100-240V' }, rating: 5, reviews: [{ user: 'David P.', rating: 5, date: '02 Jun 2026', text: 'Diseño resistente y premium.' }] },
  { id: 'ts-107', title: 'Freidora Industrial Vevor Doble Tanque', category: 'equipos', price: 8500, image: 'TeloCorp/images/image8.png', description: 'Freidora comercial de doble tina con control independiente.', specs: { Capacidad: '6L + 6L', Potencia: '1500W + 1500W', Material: 'Acero inoxidable 304' }, rating: 5, reviews: [{ user: 'María L.', rating: 5, date: '18 May 2026', text: 'Material excelente y llegó a tiempo.' }] },
  { id: 'ts-108', title: 'Batería Portátil Slim 10,000 mAh', category: 'tech', price: 1450, image: 'TeloCorp/images/image9.png', description: 'Power bank ultra delgada con display LED.', specs: { Capacidad: '10,000mAh', Salidas: '2x USB-A (5V/2.4A)', Indicador: 'LED digital' }, rating: 4.5, reviews: [{ user: 'Ana G.', rating: 5, date: '14 May 2026', text: 'Muy satisfecho con la compra.' }] },
  { id: 'ts-109', title: 'Altavoz Miccell VQ-SP64 (2400mAh)', category: 'audio', price: 2200, image: 'TeloCorp/images/image10.png', description: 'Altavoz mediano para exteriores con radiadores pasivos.', specs: { Batería: '2400mAh (8h)', Potencia: '10W RMS', Conectividad: 'BT 5.3' }, rating: 5, reviews: [{ user: 'Carlos M.', rating: 5, date: '05 Jun 2026', text: 'Cumple perfectamente, material duradero.' }] },
  { id: 'ts-110', title: 'Cover Cristal MagSafe Transparente', category: 'cases', price: 800, image: 'TeloCorp/images/image11.png', description: 'Cristal templado trasero con bordes de aluminio y MagSafe.', specs: { Material: 'Vidrio 9H + Aluminio', MagSafe: 'Imanes N52', Resistencia: 'Antirayaduras' }, rating: 4.5, reviews: [{ user: 'Carlos M.', rating: 5, date: '02 Jun 2026', text: 'Excelente relación calidad-precio.' }] },
  { id: 'ts-111', title: 'Cover Cristal MagSafe Grafito', category: 'cases', price: 800, image: 'TeloCorp/images/image12.png', description: 'Cristal templado trasero con bordes grafito y MagSafe.', specs: { Material: 'Vidrio 9H + Aluminio', MagSafe: 'N52', Color: 'Grafito' }, rating: 5, reviews: [{ user: 'Daniel A.', rating: 5, date: '29 May 2026', text: 'Diseño resistente y estético.' }] },
  { id: 'ts-112', title: 'Boombox Miccell SP56 (30000mAh)', category: 'audio', price: 4500, image: 'TeloCorp/images/image13.png', description: 'Altavoz gigante con chip DSP y funciona como powerbank.', specs: { Batería: '30000mAh', Autonomía: '6-10h', Tecnología: 'DSP + KTV' }, rating: 4.5, reviews: [{ user: 'Laura R.', rating: 5, date: '02 Jun 2026', text: 'Excelente relación calidad-precio.' }] },
  { id: 'ts-113', title: 'Cable D06 Lightning Blanco', category: 'tech', price: 350, image: 'TeloCorp/images/image14.png', description: 'Cable económico y duradero USB-A a Lightning.', specs: { Conectores: 'USB-A a Lightning', Longitud: '1.0m', Material: 'PVC reforzado' }, rating: 5, reviews: [{ user: 'Daniel A.', rating: 5, date: '24 May 2026', text: 'Superó mis expectativas.' }] },
  { id: 'ts-114', title: 'Cover 360 Blindado Rojo Fuego', category: 'cases', price: 700, image: 'TeloCorp/images/image15.png', description: 'Protección total 360° con diseño blindado y colores vibrantes.', specs: { Material: 'TPU + Policarbonato', Protección: '360° blindada', Diseño: 'Mate antideslizante' }, rating: 5, reviews: [{ user: 'Elena F.', rating: 5, date: '05 Jun 2026', text: 'Material excelente, llegó a tiempo.' }] },
  { id: 'ts-115', title: 'Altavoz Impermeable IPX7 Miccell', category: 'audio', price: 1800, image: 'TeloCorp/images/image16.png', description: 'Totalmente resistente al agua, ideal para ducha y playa.', specs: { Certificación: 'IPX7 sumergible', Bluetooth: '5.3 (15m)', Autonomía: '6h' }, rating: 4.5, reviews: [{ user: 'Ana G.', rating: 5, date: '10 May 2026', text: 'Excelente relación calidad-precio.' }] },
  { id: 'ts-116', title: 'Cover Chupón Succión Especial', category: 'cases', price: 450, image: 'TeloCorp/images/image17.png', description: 'Ventosas para adherir a superficies planas. Ideal para videollamadas.', specs: { Material: 'Silicona + ventosas', Compatibilidad: 'iPhone 7+ a 17 Pro Max', Color: 'Negro mate' }, rating: 5, reviews: [{ user: 'María L.', rating: 5, date: '10 May 2026', text: 'Diseño resistente y funcional.' }] },
  { id: 'ts-117', title: 'Cargador T13 (C a C 20W)', category: 'tech', price: 850, image: 'TeloCorp/images/image18.png', description: 'Cargador 20W con cable USB-C a USB-C para Android y tablets.', specs: { Potencia: '20W', Cable: '1.0m C-C', Protección: 'Chip inteligente' }, rating: 4.5, reviews: [{ user: 'Laura R.', rating: 5, date: '05 Jun 2026', text: 'Material excelente.' }] },
  { id: 'ts-118', title: 'Comparativa Altavoces SP63/64/65', category: 'audio', price: 2500, image: 'TeloCorp/images/image19.png', description: 'Ficha comparativa de la serie VQ-SP para elegir el tamaño ideal.', specs: { Modelos: 'SP63/SP64/SP65', Baterías: '1200/2400/4000 mAh' }, rating: 5, reviews: [{ user: 'Sofía T.', rating: 5, date: '02 Jun 2026', text: 'Se adapta perfectamente a lo descrito.' }] },
  { id: 'ts-119', title: 'Audífonos TWS Miccell VQ-BH105', category: 'audio', price: 1100, image: 'TeloCorp/images/image20.png', description: 'TWS con BT 5.3, control táctil y ajuste ergonómico.', specs: { Bluetooth: '5.3', Operación: 'Control táctil', Diseño: 'Ergonómico ultraligero' }, rating: 4.5, reviews: [{ user: 'Ana G.', rating: 5, date: '02 Jun 2026', text: 'Superó mis expectativas.' }] },
  { id: 'ts-120', title: 'Cable D02 Tipo C 2M Extra Largo', category: 'tech', price: 500, image: 'TeloCorp/images/image21.png', description: 'Cable 2 metros con Power Delivery para laptops y tablets.', specs: { Conectores: 'C a C/Lightning', Longitud: '2.0m', Carga: 'PD' }, rating: 4.5, reviews: [{ user: 'Carlos M.', rating: 5, date: '18 May 2026', text: 'Superó mis expectativas.' }] },
  { id: 'ts-121', title: 'Ficha Técnica BH96 Sonido 3D', category: 'audio', price: 1200, image: 'TeloCorp/images/image22.png', description: 'Documentación del sistema de altavoz de doble cámara 13mm.', specs: { Altavoz: '13mm doble cámara', Tecnología: 'Estéreo 3D', Frecuencia: '20Hz-20kHz' }, rating: 5, reviews: [{ user: 'Pedro S.', rating: 5, date: '18 May 2026', text: 'Se adapta perfectamente a lo descrito.' }] },
];

// Enriquecer catálogo con metadata de e-commerce (descuentos, stock, envío, ventas)
(function enrichProducts() {
  let seed = 7;
  const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  products.forEach((p, i) => {
    // ~40% de productos con descuento
    if (rng() < 0.4) {
      const pct = [10, 15, 20, 25, 30][Math.floor(rng() * 5)];
      p.discount = pct;
      p.compareAtPrice = Math.round(p.price / (1 - pct / 100) / 10) * 10;
    }
    p.stock = Math.floor(rng() * 40) + 3;          // 3 a 42 unidades
    p.sold = Math.floor(rng() * 500) + 12;          // vendidos
    p.freeShipping = p.price >= 1000;               // envío gratis sobre RD$1000
    p.featured = i < 4;
    p.badge = p.discount ? `-${p.discount}%` : (p.featured ? 'Destacado' : (p.sold > 300 ? 'Más vendido' : null));
  });
})();

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_COST = 250;

// ═══════════════════════════════════════════════════════════════
// COURSES DATABASE
// ═══════════════════════════════════════════════════════════════

const courses = [
  { id: 'excel-avanzado', title: 'Excel Avanzado para Negocios', icon: '📊', path: 'business', duration: '12h', level: 'Intermedio', instructor: 'Lic. María Tavárez', students: 1240, rating: 4.8, lessons: ['Interfaz y Atajos', 'Fórmulas Básicas', 'Fórmulas Avanzadas', 'Tablas Dinámicas', 'Gráficos Profesionales', 'Macros Básicas'], quiz: [
    { q: '¿Con qué símbolo inicia toda fórmula en Excel?', options: ['+', '=', '@', '#'], correct: 1 },
    { q: '¿Qué función suma un rango de celdas?', options: ['CONTAR', 'PROMEDIO', 'SUMA', 'SI'], correct: 2 },
    { q: '¿Qué herramienta resume grandes volúmenes de datos?', options: ['Tabla Dinámica', 'Filtro', 'Formato', 'Macro'], correct: 0 } ] },
  { id: 'prompts-ia', title: 'Ingeniería de Prompts e IA', icon: '🤖', path: 'tech', duration: '8h', level: 'Básico', instructor: 'Ing. Balmis Reynoso', students: 2105, rating: 4.9, lessons: ['¿Qué es un LLM?', 'Anatomía del Prompt', 'Técnicas Avanzadas', 'Agentes y Automatización', 'Casos Prácticos'], quiz: [
    { q: '¿Qué significa LLM?', options: ['Large Language Model', 'Local Logic Machine', 'Linked List Memory', 'Low Latency Model'], correct: 0 },
    { q: 'Un buen prompt debe ser:', options: ['Vago', 'Claro y específico', 'Muy corto siempre', 'En mayúsculas'], correct: 1 },
    { q: '¿Qué da contexto al modelo?', options: ['El color', 'Los ejemplos (few-shot)', 'La fuente', 'El idioma'], correct: 1 } ] },
  { id: 'ingles-callcenter', title: 'Inglés Técnico para Call Center', icon: '🗣️', path: 'languages', duration: '20h', level: 'Intermedio', instructor: 'Prof. John Smith', students: 980, rating: 4.7, lessons: ['Greetings & Intro', 'Handling Complaints', 'Technical Vocabulary', 'Email Communication', 'Role Play Scenarios', 'Assessment Final'], quiz: [
    { q: 'Best greeting for a customer call?', options: ['What do you want?', 'Hello, how may I help you?', 'Yes?', 'Talk.'], correct: 1 },
    { q: '"I apologize for the inconvenience" is used to:', options: ['Greet', 'Apologize', 'End call', 'Sell'], correct: 1 },
    { q: 'A "ticket" in support refers to:', options: ['A movie pass', 'A service request record', 'A payment', 'A coupon'], correct: 1 } ] },
  { id: 'ecommerce-101', title: 'E-Commerce desde Cero', icon: '🛒', path: 'business', duration: '10h', level: 'Básico', instructor: 'Lic. Luis M. Herrera', students: 1560, rating: 4.6, lessons: ['Modelo de Negocio', 'Plataformas', 'Gestión de Inventario', 'Marketing Digital', 'Logística y Envíos'], quiz: [
    { q: '¿Qué es un "carrito abandonado"?', options: ['Un error técnico', 'Compra no finalizada', 'Producto agotado', 'Un descuento'], correct: 1 },
    { q: 'KPI clave de conversión:', options: ['Likes', 'Tasa de conversión', 'Seguidores', 'Comentarios'], correct: 1 },
    { q: 'El "fulfillment" se refiere a:', options: ['Marketing', 'Cumplimiento/entrega de pedidos', 'Diseño web', 'Pagos'], correct: 1 } ] },
  { id: 'python-basico', title: 'Python para Automatización', icon: '🐍', path: 'tech', duration: '15h', level: 'Básico', instructor: 'Ing. Balmis Reynoso', students: 1820, rating: 4.8, lessons: ['Instalación y Entorno', 'Variables y Tipos', 'Estructuras de Control', 'Funciones', 'Archivos y APIs', 'Proyecto Final'], quiz: [
    { q: '¿Cómo se define una función en Python?', options: ['function()', 'def nombre():', 'func nombre', 'define()'], correct: 1 },
    { q: 'Tipo de dato para texto:', options: ['int', 'str', 'bool', 'list'], correct: 1 },
    { q: '¿Qué estructura repite código?', options: ['if', 'for', 'def', 'import'], correct: 1 } ] },
];

// ═══════════════════════════════════════════════════════════════
// NAVIGATION & VIEW MANAGEMENT
// ═══════════════════════════════════════════════════════════════

const viewTitles = { home: 'Bienvenido', sales: 'TeloSales Store', educa: 'Academia TeloEduca', classroom: 'Aula Virtual', lleva: 'TeloLleva', repara: 'TeloRepara', instala: 'TeloInstala', about: 'Quiénes Somos', support: 'TeloConnect', profile: 'Mi Perfil', integrations: 'Integraciones' };

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sidebar__link').forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
  const navBtn = document.querySelector(`.sidebar__link[data-view="${viewId}"]`);
  if (navBtn) { navBtn.classList.add('active'); navBtn.setAttribute('aria-current', 'page'); }

  document.querySelectorAll('.bottom-nav__item').forEach(b => b.classList.remove('active'));
  const bottomBtn = document.querySelector(`.bottom-nav__item[data-view="${viewId}"]`);
  if (bottomBtn) bottomBtn.classList.add('active');

  document.getElementById('view-title').textContent = viewTitles[viewId] || '';
  State.currentView = viewId;
  closeMobileMenu();
  window.scrollTo(0, 0);
  document.getElementById('views').scrollTop = 0;
}

function closeMobileMenu() {
  document.getElementById('sidebar').classList.remove('open');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function openMobileMenu() {
  document.getElementById('sidebar').classList.add('open');
  let backdrop = document.getElementById('sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    backdrop.onclick = closeMobileMenu;
    document.getElementById('app').appendChild(backdrop);
  }
  backdrop.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

function showToast(message, type = 'success') {
  const container = document.getElementById('toasts');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ═══════════════════════════════════════════════════════════════
// TELOSALES — PRODUCTS
// ═══════════════════════════════════════════════════════════════

let currentFilter = 'all';
let currentSort = 'featured';
let searchQuery = '';

function renderProducts() {
  const grid = document.getElementById('products-grid');
  let filtered = products.filter(p => (currentFilter === 'all' || p.category === currentFilter) && (searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase())));
  if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (currentSort === 'rating-desc') filtered.sort((a, b) => b.rating - a.rating);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-state">No se encontraron productos. Prueba con otra búsqueda o categoría.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.title}">
      <div class="product-card__image">
        ${p.badge ? `<span class="product-badge ${p.discount ? 'product-badge--sale' : ''}">${p.badge}</span>` : ''}
        <button class="product-card__wish ${State.wishlist.includes(p.id) ? 'active' : ''}" data-wish="${p.id}" aria-label="Favorito" title="Añadir a favoritos">${State.wishlist.includes(p.id) ? '❤️' : '🤍'}</button>
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        ${p.freeShipping ? '<span class="product-card__shipping">🚚 Envío gratis</span>' : ''}
      </div>
      <div class="product-card__body">
        <h4 class="product-card__title">${p.title}</h4>
        <div class="product-card__rating">★ ${p.rating} · ${p.sold} vendidos</div>
        <div class="product-card__pricing">
          ${p.compareAtPrice ? `<span class="product-card__compare">RD$ ${p.compareAtPrice.toLocaleString()}</span>` : ''}
          <span class="product-card__price">RD$ ${p.price.toLocaleString()}</span>
        </div>
        ${p.stock <= 8 ? `<div class="product-card__stock">¡Últimas ${p.stock} unidades!</div>` : ''}
        <button class="btn btn--primary btn--sm product-card__add" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-add]') || e.target.closest('[data-wish]')) return;
      openProductModal(card.dataset.id);
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === card) openProductModal(card.dataset.id); });
  });
  grid.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); quickAddToCart(btn.dataset.add); }));
  grid.querySelectorAll('[data-wish]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); toggleWishlist(btn.dataset.wish); renderProducts(); }));
}

function quickAddToCart(id) {
  const existing = State.cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else State.cart.push({ id, qty: 1 });
  State.save();
  updateCartBadge();
  const p = products.find(x => x.id === id);
  showToast(`${p.title.slice(0, 24)}… añadido`);
  BackendService.sendWebhook(BackendService.config.n8nOrders, { event: 'cart_add', product: p.title, price: p.price, qty: 1, timestamp: new Date().toISOString() });
}

function openProductModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  modalQty = 1;
  const modal = document.getElementById('product-modal');
  const overlay = document.getElementById('product-modal-overlay');
  const body = document.getElementById('product-modal-body');
  const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 ? '½' : '');

  // Distribución de ratings (calculada de reseñas + ponderación)
  const dist = [5, 4, 3, 2, 1].map(s => {
    const count = p.reviews.filter(r => r.rating === s).length + (s === Math.round(p.rating) ? Math.floor(p.sold * 0.6) : s === 4 ? Math.floor(p.sold * 0.25) : Math.floor(p.sold * 0.04));
    return { s, count };
  });
  const totalRatings = dist.reduce((sum, d) => sum + d.count, 0);

  // Productos relacionados (misma categoría)
  const related = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  body.innerHTML = `
    <div class="product-detail">
      <div class="product-detail__gallery">
        <div class="product-detail__main-img"><img src="${p.image}" alt="${p.title}"></div>
        ${p.freeShipping ? '<div class="product-detail__ship-note">🚚 Envío gratis a todo el país · Entrega en 24-48h</div>' : ''}
      </div>
      <div class="product-detail__info">
        <span class="product-detail__badge">✓ TeloSales Verificado</span>
        <h2 class="product-detail__title">${p.title}</h2>
        <div class="product-detail__rating"><span class="product-detail__stars">${stars}</span><span class="text-muted">${p.rating} · ${p.sold} vendidos</span></div>
        <div class="product-detail__price-row">
          ${p.compareAtPrice ? `<span class="product-detail__compare">RD$ ${p.compareAtPrice.toLocaleString()}</span>` : ''}
          <span class="product-detail__price">RD$ ${p.price.toLocaleString()}</span>
          ${p.discount ? `<span class="product-detail__off">${p.discount}% OFF</span>` : ''}
        </div>
        <div class="product-detail__stock ${p.stock <= 8 ? 'product-detail__stock--low' : ''}">${p.stock <= 8 ? `⚠ ¡Solo quedan ${p.stock} unidades!` : `✓ ${p.stock} disponibles`}</div>
        <p class="product-detail__desc">${p.description}</p>
        <div class="product-detail__actions">
          <div class="quantity-control"><button onclick="adjustQty(-1)">−</button><span id="modal-qty">1</span><button onclick="adjustQty(1)">+</button></div>
          <button class="btn btn--primary" onclick="addToCart('${p.id}')">Añadir al Carrito</button>
          <button class="btn btn--ghost" id="modal-wish-btn" onclick="toggleWishlist('${p.id}'); document.getElementById('modal-wish-btn').textContent = State.wishlist.includes('${p.id}') ? '❤️' : '🤍'">${State.wishlist.includes(p.id) ? '❤️' : '🤍'}</button>
        </div>
        <div class="product-detail__guarantees">
          <span>🔒 Compra protegida</span><span>↩ Devolución 7 días</span><span>✓ Garantía oficial</span>
        </div>
        <table class="specs-table">${Object.entries(p.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
        <div class="reviews-section">
          <h3>Opiniones de Compradores</h3>
          <div class="rating-summary">
            <div class="rating-summary__score"><span class="rating-summary__big">${p.rating}</span><div class="product-detail__stars">${stars}</div><small>${totalRatings.toLocaleString()} calificaciones</small></div>
            <div class="rating-summary__bars">
              ${dist.map(d => `<div class="rating-bar"><span>${d.s}★</span><div class="rating-bar__track"><div class="rating-bar__fill" style="width:${totalRatings ? (d.count / totalRatings * 100) : 0}%"></div></div></div>`).join('')}
            </div>
          </div>
          ${p.reviews.map(r => `<div class="review-item"><div class="review-item__header"><span class="review-item__user">${r.user} <span class="review-item__verified">✓ Compra verificada</span></span><span class="review-item__date">${r.date}</span></div><div class="review-item__stars">${'★'.repeat(r.rating)}</div><p class="review-item__text">${r.text}</p></div>`).join('')}
        </div>
        ${related.length ? `<div class="related-products"><h3>Productos relacionados</h3><div class="related-products__grid">${related.map(r => `<div class="related-card" onclick="openProductModal('${r.id}')"><img src="${r.image}" alt="${r.title}"><div class="related-card__title">${r.title}</div><div class="related-card__price">RD$ ${r.price.toLocaleString()}</div></div>`).join('')}</div></div>` : ''}
      </div>
    </div>`;
  modal.classList.add('active');
  overlay.classList.add('active');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  document.getElementById('product-modal-overlay').classList.remove('active');
}

let modalQty = 1;
function adjustQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  const el = document.getElementById('modal-qty');
  if (el) el.textContent = modalQty;
}

// ═══════════════════════════════════════════════════════════════
// CART & WISHLIST
// ═══════════════════════════════════════════════════════════════

function addToCart(id) {
  const existing = State.cart.find(i => i.id === id);
  if (existing) existing.qty += modalQty;
  else State.cart.push({ id, qty: modalQty });
  modalQty = 1;
  State.save();
  updateCartBadge();
  showToast('Añadido al carrito');
  closeProductModal();
  // Send to backend
  const p = products.find(x => x.id === id);
  if (p) BackendService.sendWebhook(BackendService.config.n8nOrders, { event: 'cart_add', product: p.title, price: p.price, qty: modalQty, timestamp: new Date().toISOString() });
}

function removeFromCart(id) {
  State.cart = State.cart.filter(i => i.id !== id);
  State.save();
  updateCartBadge();
  renderCart();
}

function updateCartQty(id, delta) {
  const item = State.cart.find(i => i.id === id);
  if (item) { item.qty = Math.max(1, item.qty + delta); State.save(); renderCart(); updateCartBadge(); }
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = State.cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = count;
  badge.hidden = count === 0;
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const subtotal = State.cart.reduce((s, i) => { const p = products.find(x => x.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0);

  if (State.cart.length === 0) {
    container.innerHTML = '<p class="empty-state">🛒 Tu carrito está vacío<br><small>Explora TeloSales y encuentra ofertas</small></p>';
  } else {
    // Barra de progreso de envío gratis
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const shipProgress = `<div class="ship-progress">${remaining > 0
      ? `Agrega <strong>RD$ ${remaining.toLocaleString()}</strong> más para <strong>envío gratis</strong> 🚚`
      : '🎉 ¡Tienes envío gratis!'}<div class="ship-progress__track"><div class="ship-progress__fill" style="width:${Math.min(100, subtotal / FREE_SHIPPING_THRESHOLD * 100)}%"></div></div></div>`;

    container.innerHTML = shipProgress + State.cart.map(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return '';
      return `<div class="cart-item"><div class="cart-item__img"><img src="${p.image}" alt="${p.title}"></div><div class="cart-item__info"><div class="cart-item__title">${p.title}</div><div class="cart-item__price">RD$ ${(p.price * item.qty).toLocaleString()}</div><div class="cart-item__actions"><button onclick="updateCartQty('${item.id}',-1)">−</button><span class="cart-item__qty">${item.qty}</span><button onclick="updateCartQty('${item.id}',1)">+</button><button onclick="removeFromCart('${item.id}')" style="margin-left:auto;color:var(--c-danger);">✕</button></div></div></div>`;
    }).join('');
  }

  // Desglose de totales
  const discount = State.coupon ? Math.round(subtotal * State.coupon.pct / 100) : 0;
  const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;
  const footer = document.getElementById('cart-total');
  if (footer) {
    const breakdown = document.getElementById('cart-breakdown');
    const html = `
      <div class="cart-line"><span>Subtotal</span><span>RD$ ${subtotal.toLocaleString()}</span></div>
      ${discount ? `<div class="cart-line cart-line--discount"><span>Cupón ${State.coupon.code}</span><span>−RD$ ${discount.toLocaleString()}</span></div>` : ''}
      <div class="cart-line"><span>Envío</span><span>${shipping === 0 ? 'Gratis' : 'RD$ ' + shipping}</span></div>`;
    if (breakdown) breakdown.innerHTML = html;
    footer.textContent = `RD$ ${total.toLocaleString()}`;
  }
}

let couponCodes = { 'TELO10': 10, 'BIENVENIDO': 15, 'TELO20': 20 };
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  const code = input.value.trim().toUpperCase();
  if (couponCodes[code]) {
    State.coupon = { code, pct: couponCodes[code] };
    showToast(`Cupón aplicado: ${couponCodes[code]}% de descuento`);
    renderCart();
  } else {
    showToast('Cupón inválido', 'error');
  }
}

function toggleCartDrawer(open) {
  document.getElementById('cart-drawer').classList.toggle('active', open);
  document.getElementById('cart-overlay').classList.toggle('active', open);
  if (open) renderCart();
}

function checkout() {
  if (State.cart.length === 0) return showToast('Carrito vacío', 'error');
  const subtotal = State.cart.reduce((s, i) => { const p = products.find(x => x.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0);
  const discount = State.coupon ? Math.round(subtotal * State.coupon.pct / 100) : 0;
  const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;
  const orderPayload = { event: 'order_placed', items: State.cart.map(i => { const p = products.find(x => x.id === i.id); return { id: i.id, title: p?.title, qty: i.qty, price: p?.price }; }), subtotal, discount, shipping, coupon: State.coupon?.code || null, total, customer: State.userProfile, timestamp: new Date().toISOString() };
  BackendService.sendWebhook(BackendService.config.n8nOrders, orderPayload);
  BackendService.supabaseQuery('orders', 'POST', orderPayload);
  State.cart = [];
  State.coupon = null;
  State.save();
  updateCartBadge();
  toggleCartDrawer(false);
  showToast('¡Pedido procesado exitosamente!');
}

function toggleWishlist(id) {
  const idx = State.wishlist.indexOf(id);
  if (idx > -1) State.wishlist.splice(idx, 1);
  else State.wishlist.push(id);
  State.save();
  updateWishlistBadge();
  showToast(idx > -1 ? 'Eliminado de favoritos' : 'Añadido a favoritos');
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  badge.textContent = State.wishlist.length;
  badge.hidden = State.wishlist.length === 0;
}

function renderWishlist() {
  const container = document.getElementById('wishlist-items');
  if (State.wishlist.length === 0) { container.innerHTML = '<p class="text-muted" style="text-align:center;padding:40px 0;">Sin favoritos</p>'; return; }
  container.innerHTML = State.wishlist.map(id => {
    const p = products.find(x => x.id === id);
    if (!p) return '';
    return `<div class="cart-item" style="cursor:pointer" onclick="openProductModal('${id}')"><div class="cart-item__img"><img src="${p.image}" alt="${p.title}"></div><div class="cart-item__info"><div class="cart-item__title">${p.title}</div><div class="cart-item__price">RD$ ${p.price.toLocaleString()}</div></div></div>`;
  }).join('');
}

function toggleWishlistDrawer(open) {
  document.getElementById('wishlist-drawer').classList.toggle('active', open);
  document.getElementById('wishlist-overlay').classList.toggle('active', open);
  if (open) renderWishlist();
}

// ═══════════════════════════════════════════════════════════════
// TELOEDUCA
// ═══════════════════════════════════════════════════════════════

function renderCourses() {
  const grid = document.getElementById('courses-grid');
  grid.innerHTML = courses.map(c => {
    const done = c.lessons.filter((_, i) => State.completedClasses.includes(`${c.id}_${i}`)).length;
    const pct = Math.round(done / c.lessons.length * 100);
    return `
    <article class="course-card" data-course="${c.id}" tabindex="0" role="button">
      <div class="course-card__top"><span class="course-card__icon">${c.icon}</span><span class="course-card__level">${c.level}</span></div>
      <h4 class="course-card__title">${c.title}</h4>
      <p class="course-card__instructor">👨‍🏫 ${c.instructor}</p>
      <div class="course-card__stats"><span>★ ${c.rating}</span><span>👥 ${c.students.toLocaleString()}</span><span>${c.lessons.length} clases · ${c.duration}</span></div>
      ${pct > 0 ? `<div class="course-card__progress"><div class="progress-bar progress-bar--sm"><div class="progress-bar__fill" style="width:${pct}%"></div></div><small>${pct}% completado</small></div>` : '<span class="course-card__cta">Comenzar curso →</span>'}
    </article>`;
  }).join('');
  grid.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', () => openClassroom(card.dataset.course));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openClassroom(card.dataset.course); });
  });
}

function openClassroom(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return;
  State.currentCourse = course;
  State.currentLesson = 0;
  document.getElementById('classroom-title').textContent = course.title;
  renderSyllabus();
  loadLesson(0);
  switchView('classroom');
}

function renderSyllabus() {
  const course = State.currentCourse;
  if (!course) return;
  const list = document.getElementById('syllabus-list');
  list.innerHTML = course.lessons.map((lesson, i) => {
    const key = `${course.id}_${i}`;
    const completed = State.completedClasses.includes(key);
    const active = i === State.currentLesson;
    return `<div class="syllabus-item ${completed ? 'completed' : ''} ${active ? 'active' : ''}" data-idx="${i}"><span class="syllabus-item__check">${completed ? '✓' : ''}</span><span>${lesson}</span></div>`;
  }).join('');
  list.querySelectorAll('.syllabus-item').forEach(item => {
    item.addEventListener('click', () => loadLesson(parseInt(item.dataset.idx)));
  });
  updateEducaProgress();
}

function loadLesson(idx) {
  const course = State.currentCourse;
  if (!course) return;
  State.currentLesson = idx;
  const title = course.lessons[idx];
  document.getElementById('video-title').textContent = title;
  document.getElementById('classroom-lesson-title').textContent = title;
  const key = `${course.id}_${idx}`;
  const btn = document.getElementById('btn-complete-class');
  btn.textContent = State.completedClasses.includes(key) ? 'Completada ✓' : 'Marcar Completada';
  btn.classList.toggle('btn--ghost', State.completedClasses.includes(key));
  btn.classList.toggle('btn--primary', !State.completedClasses.includes(key));
  // Load notes
  const notes = document.getElementById('classroom-notes');
  if (notes) notes.value = State.classNotes[key] || '';
  // Reset video player
  if (typeof videoState !== 'undefined') { clearInterval(videoState.timer); videoState.playing = false; videoState.progress = 0; updateVideoUI(); const ov = document.getElementById('video-overlay'); if (ov) ov.style.opacity = '1'; const tg = document.getElementById('video-toggle'); if (tg) tg.textContent = '▶'; }
  renderClassroomResources();
  renderSyllabus();
}

function toggleCompleteClass() {
  const course = State.currentCourse;
  if (!course) return;
  const key = `${course.id}_${State.currentLesson}`;
  const idx = State.completedClasses.indexOf(key);
  if (idx > -1) State.completedClasses.splice(idx, 1);
  else State.completedClasses.push(key);
  State.save();
  loadLesson(State.currentLesson);
  BackendService.supabaseQuery('educa_progress', 'POST', { course: course.id, lesson: State.currentLesson, completed: idx === -1, timestamp: new Date().toISOString() });
}

function updateEducaProgress() {
  const course = State.currentCourse;
  const totalLessons = courses.reduce((s, c) => s + c.lessons.length, 0);
  const completed = State.completedClasses.length;
  const pct = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  document.getElementById('educa-progress-pct').textContent = `${pct}% completado`;
  document.getElementById('educa-progress-fill').style.width = `${pct}%`;
  if (course) {
    const coursePct = Math.round((course.lessons.filter((_, i) => State.completedClasses.includes(`${course.id}_${i}`)).length / course.lessons.length) * 100);
    document.getElementById('syllabus-pct').textContent = `${coursePct}%`;
    document.getElementById('syllabus-fill').style.width = `${coursePct}%`;
    document.getElementById('syllabus-cert').hidden = coursePct < 100;
  }
}

function renderClassroomResources() {
  const course = State.currentCourse;
  const list = document.getElementById('resources-list');
  if (!course || !list) return;
  const resources = [
    { icon: '📄', name: `Guía de la clase: ${course.lessons[State.currentLesson]}.pdf` },
    { icon: '📊', name: 'Material práctico descargable' },
    { icon: '🔗', name: 'Enlaces de referencia oficial' }
  ];
  list.innerHTML = resources.map(r => `<li><a href="#" onclick="event.preventDefault(); showToast('Descargando ${r.name.slice(0,30)}...')">${r.icon} ${r.name}</a></li>`).join('');
  // Foro con comentarios simulados
  const forum = document.getElementById('forum-messages');
  if (forum && forum.children.length === 0) {
    forum.innerHTML = `<div class="chat-msg chat-msg--bot"><strong>Ana M.:</strong> ¿Alguien puede explicar mejor este tema?</div><div class="chat-msg chat-msg--bot"><strong>Instructor:</strong> Claro, revisa el recurso PDF adjunto, ahí está detallado. 👍</div>`;
  }
}

// ─── Quiz de Certificación ───
let activeQuiz = { course: null, answers: {} };

function startCertificateQuiz() {
  const course = State.currentCourse;
  if (!course || !course.quiz) return;
  activeQuiz = { course, answers: {} };
  const body = document.getElementById('cert-modal-body');
  body.innerHTML = `
    <h2 class="quiz__title">📝 Examen de Certificación</h2>
    <p class="text-muted">Responde correctamente para obtener tu certificado de <strong>${course.title}</strong>.</p>
    <div class="quiz__questions">
      ${course.quiz.map((item, qi) => `
        <div class="quiz__q">
          <p class="quiz__q-text">${qi + 1}. ${item.q}</p>
          <div class="quiz__options">
            ${item.options.map((opt, oi) => `<label class="quiz__option"><input type="radio" name="q${qi}" value="${oi}" onchange="activeQuiz.answers[${qi}]=${oi}"><span>${opt}</span></label>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <button class="btn btn--primary btn--full" onclick="submitQuiz()">Enviar Respuestas</button>`;
  openCertModal();
}

function submitQuiz() {
  const { course, answers } = activeQuiz;
  if (Object.keys(answers).length < course.quiz.length) return showToast('Responde todas las preguntas', 'error');
  const correct = course.quiz.filter((item, i) => answers[i] === item.correct).length;
  const score = Math.round(correct / course.quiz.length * 100);
  if (score >= 70) {
    showCertificate(course, score);
  } else {
    document.getElementById('cert-modal-body').innerHTML = `<div class="quiz__result"><div class="quiz__result-icon">😟</div><h2>Obtuviste ${score}%</h2><p class="text-muted">Necesitas al menos 70% para certificarte. Repasa el material e inténtalo de nuevo.</p><button class="btn btn--primary" onclick="startCertificateQuiz()">Reintentar Examen</button></div>`;
  }
}

function showCertificate(course, score) {
  const name = State.userProfile.name || 'Estudiante TeloEduca';
  const date = new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `TC-${course.id.toUpperCase().slice(0, 4)}-${Date.now().toString().slice(-6)}`;
  document.getElementById('cert-modal-body').innerHTML = `
    <div class="certificate" id="cert-print">
      <div class="certificate__inner">
        <div class="certificate__brand">TeloEduca Academy 🎓</div>
        <h1 class="certificate__title">CERTIFICADO DE FINALIZACIÓN</h1>
        <p class="certificate__sub">Otorgado a</p>
        <p class="certificate__name">${name}</p>
        <p class="certificate__desc">por completar exitosamente el curso<br><strong>${course.title}</strong><br>con una calificación de ${score}%</p>
        <div class="certificate__footer">
          <div><span class="certificate__sig">${course.instructor}</span><small>Instructor</small></div>
          <div><span class="certificate__sig">${date}</span><small>Fecha</small></div>
        </div>
        <p class="certificate__id">ID: ${certId}</p>
      </div>
    </div>
    <div class="btn-row" style="margin-top:16px;justify-content:center;">
      <button class="btn btn--ghost" onclick="window.print()">🖨 Imprimir / PDF</button>
      <button class="btn btn--primary" onclick="closeCertModal()">Finalizar</button>
    </div>`;
  openCertModal();
  showToast('¡Felicidades! Certificado obtenido 🎉');
  BackendService.supabaseQuery('certificates', 'POST', { course: course.id, student: name, score, cert_id: certId, timestamp: new Date().toISOString() });
}

function openCertModal() {
  document.getElementById('cert-modal').classList.add('active');
  document.getElementById('cert-modal-overlay').classList.add('active');
}
function closeCertModal() {
  document.getElementById('cert-modal').classList.remove('active');
  document.getElementById('cert-modal-overlay').classList.remove('active');
}

function postForumMessage() {
  const input = document.getElementById('forum-input');
  const text = input.value.trim();
  if (!text) return;
  const forum = document.getElementById('forum-messages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--user';
  msg.innerHTML = `<strong>Tú:</strong> ${text}`;
  forum.appendChild(msg);
  input.value = '';
  forum.scrollTop = forum.scrollHeight;
  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'chat-msg chat-msg--bot';
    reply.innerHTML = `<strong>Instructor:</strong> ¡Buena pregunta! Lo revisaremos en la próxima sesión en vivo. 🙌`;
    forum.appendChild(reply);
    forum.scrollTop = forum.scrollHeight;
  }, 1200);
}

function downloadNotes() {
  const course = State.currentCourse;
  if (!course) return;
  const key = `${course.id}_${State.currentLesson}`;
  const notes = State.classNotes[key] || '';
  if (!notes.trim()) return showToast('No hay apuntes para descargar', 'error');
  const blob = new Blob([`Apuntes — ${course.title}\nClase: ${course.lessons[State.currentLesson]}\n\n${notes}`], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `apuntes-${course.id}.txt`;
  a.click();
  showToast('Apuntes descargados');
}

// ─── Reproductor de Video (simulación) ───
let videoState = { playing: false, progress: 0, timer: null, duration: 600 };

function toggleVideoPlay() {
  videoState.playing = !videoState.playing;
  const toggle = document.getElementById('video-toggle');
  const playBtn = document.getElementById('video-play-btn');
  const overlay = document.getElementById('video-overlay');
  if (videoState.playing) {
    if (toggle) toggle.textContent = '⏸';
    if (playBtn) playBtn.textContent = '⏸';
    if (overlay) overlay.style.opacity = '0';
    videoState.timer = setInterval(() => {
      videoState.progress = Math.min(100, videoState.progress + 0.5);
      updateVideoUI();
      if (videoState.progress >= 100) {
        clearInterval(videoState.timer);
        videoState.playing = false;
        if (toggle) toggle.textContent = '▶';
        // Auto-marcar como completada
        const course = State.currentCourse;
        if (course) {
          const k = `${course.id}_${State.currentLesson}`;
          if (!State.completedClasses.includes(k)) { State.completedClasses.push(k); State.save(); loadLesson(State.currentLesson); showToast('Clase completada automáticamente ✓'); }
        }
      }
    }, 100);
  } else {
    clearInterval(videoState.timer);
    if (toggle) toggle.textContent = '▶';
    if (playBtn) playBtn.textContent = '▶';
    if (overlay) overlay.style.opacity = '1';
  }
}

function seekVideo(e) {
  const bar = document.getElementById('video-progress-bar');
  const rect = bar.getBoundingClientRect();
  videoState.progress = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
  updateVideoUI();
}

function updateVideoUI() {
  document.getElementById('video-progress-fill').style.width = `${videoState.progress}%`;
  const cur = Math.floor(videoState.progress / 100 * videoState.duration);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  document.getElementById('video-time').textContent = `${fmt(cur)} / ${fmt(videoState.duration)}`;
}

function filterCoursesByPath(path) {
  const grid = document.getElementById('courses-grid');
  const filtered = courses.filter(c => c.path === path);
  document.querySelectorAll('.path-card').forEach(c => c.classList.toggle('active', c.dataset.path === path));
  grid.innerHTML = filtered.map(c => {
    const done = c.lessons.filter((_, i) => State.completedClasses.includes(`${c.id}_${i}`)).length;
    const pct = Math.round(done / c.lessons.length * 100);
    return `<article class="course-card" data-course="${c.id}" tabindex="0" role="button"><div class="course-card__top"><span class="course-card__icon">${c.icon}</span><span class="course-card__level">${c.level}</span></div><h4 class="course-card__title">${c.title}</h4><p class="course-card__instructor">👨‍🏫 ${c.instructor}</p><div class="course-card__stats"><span>★ ${c.rating}</span><span>👥 ${c.students.toLocaleString()}</span><span>${c.lessons.length} clases · ${c.duration}</span></div>${pct > 0 ? `<div class="course-card__progress"><div class="progress-bar progress-bar--sm"><div class="progress-bar__fill" style="width:${pct}%"></div></div><small>${pct}% completado</small></div>` : '<span class="course-card__cta">Comenzar curso →</span>'}</article>`;
  }).join('');
  grid.querySelectorAll('.course-card').forEach(card => card.addEventListener('click', () => openClassroom(card.dataset.course)));
  showToast(`Mostrando ruta: ${filtered.length} cursos`);
}

// ═══════════════════════════════════════════════════════════════
// TELOLLEVA — LOGISTICS
// ═══════════════════════════════════════════════════════════════

const llevaZones = { 'SD-Naco': [180,120], 'SD-BellaVista': [200,160], 'SD-Gazcue': [160,180], 'SD-LosMinas': [300,200], 'SD-Herrera': [100,220], 'SD-Norte': [150,80], 'Santiago-Centro': [120,320], 'Santiago-Gurabo': [160,340], 'LaVega-Centro': [200,300], 'PuntaCana-Bavaro': [340,280], 'PuertoPlata-Centro': [100,360], 'Moca-Centro': [140,290] };

function updateLlevaPrice() {
  const origin = document.getElementById('lleva-origin').value;
  const dest = document.getElementById('lleva-dest').value;
  const vehicle = document.querySelector('.vehicle-option.active')?.dataset.vehicle || 'moto';
  const basePrice = { moto: 150, car: 350, cargo: 800 };
  const o = llevaZones[origin], d = llevaZones[dest];
  const dist = o && d ? Math.sqrt(Math.pow(o[0]-d[0], 2) + Math.pow(o[1]-d[1], 2)) : 100;
  const price = Math.round(basePrice[vehicle] + dist * 1.2);
  document.getElementById('lleva-fare-label').textContent = `RD$ ${price}`;
  document.getElementById('lleva-fare').value = price;
  // Update map
  updateLlevaMap(origin, dest);
}

function updateLlevaMap(origin, dest) {
  const o = llevaZones[origin], d = llevaZones[dest];
  if (!o || !d) return;
  const pinA = document.getElementById('map-pin-a');
  const pinB = document.getElementById('map-pin-b');
  const route = document.getElementById('map-route');
  pinA.setAttribute('transform', `translate(${o[0]},${o[1]})`); pinA.setAttribute('opacity', '1');
  pinB.setAttribute('transform', `translate(${d[0]},${d[1]})`); pinB.setAttribute('opacity', '1');
  route.setAttribute('d', `M${o[0]},${o[1]} C${(o[0]+d[0])/2},${o[1]} ${(o[0]+d[0])/2},${d[1]} ${d[0]},${d[1]}`);
  document.getElementById('map-status').textContent = `Ruta: ${origin} → ${dest}`;
}

function startLlevaRequest() {
  const payload = {
    origin: document.getElementById('lleva-origin').value,
    dest: document.getElementById('lleva-dest').value,
    item: document.getElementById('lleva-item').value,
    details: document.getElementById('lleva-details').value,
    vehicle: document.querySelector('.vehicle-option.active')?.dataset.vehicle,
    fare: document.getElementById('lleva-fare').value,
    schedule: document.getElementById('lleva-schedule').value,
    customer: State.userProfile,
    timestamp: new Date().toISOString()
  };
  BackendService.sendWebhook(BackendService.config.n8nServices, { event: 'lleva_request', ...payload });
  BackendService.supabaseQuery('lleva_requests', 'POST', payload);
  // Simulate offers
  document.getElementById('lleva-form-card').hidden = true;
  document.getElementById('lleva-offers-card').hidden = false;
  simulateLlevaOffers(parseInt(payload.fare));
}

function simulateLlevaOffers(userFare) {
  const names = ['José M.', 'Carlos R.', 'María P.', 'Luis A.'];
  const list = document.getElementById('lleva-offers-list');
  list.innerHTML = '<p class="text-muted">Buscando mensajeros...</p>';
  setTimeout(() => {
    const offers = names.slice(0, 3).map((name, i) => {
      const fare = userFare + (Math.random() > 0.5 ? 50 : -50) * (i + 1);
      const rating = (4.5 + Math.random() * 0.5).toFixed(1);
      return { name, fare: Math.max(150, Math.round(fare)), rating, eta: 5 + i * 3 };
    });
    list.innerHTML = offers.map((o, i) => `
      <div class="offer-item">
        <div class="offer-item__driver"><div class="offer-item__avatar">🏍️</div><div><strong>${o.name}</strong><br><small>★ ${o.rating} · ${o.eta} min</small></div></div>
        <div><strong style="color:var(--c-lleva)">RD$ ${o.fare}</strong><br><button class="btn btn--primary btn--sm" onclick="acceptLlevaOffer('${o.name}', ${o.fare})">Aceptar</button></div>
      </div>`).join('');
  }, 1500);
}

let llevaTrackingTimer = null;
function acceptLlevaOffer(name, fare) {
  document.getElementById('lleva-offers-card').hidden = true;
  document.getElementById('lleva-status-card').hidden = false;
  const rating = (4.6 + Math.random() * 0.4).toFixed(1);
  const plate = `${['A','B','C'][Math.floor(Math.random()*3)]}${Math.floor(Math.random()*900+100)}${['XYZ','ABC','TLC'][Math.floor(Math.random()*3)]}`;

  document.getElementById('lleva-trip-info').innerHTML = `
    <div class="trip-driver">
      <div class="offer-item__avatar">🏍️</div>
      <div class="trip-driver__info"><strong>${name}</strong><small>★ ${rating} · Placa ${plate}</small></div>
      <div class="trip-eta"><span id="lleva-eta-num">8</span><small>min</small></div>
    </div>
    <div class="trip-timeline" id="lleva-timeline">
      <div class="trip-step active" data-step="0"><span class="trip-step__dot"></span><div><strong>Conductor asignado</strong><small>${name} aceptó tu envío</small></div></div>
      <div class="trip-step" data-step="1"><span class="trip-step__dot"></span><div><strong>En camino a recoger</strong><small>Dirigiéndose al origen</small></div></div>
      <div class="trip-step" data-step="2"><span class="trip-step__dot"></span><div><strong>Paquete recogido</strong><small>En ruta al destino</small></div></div>
      <div class="trip-step" data-step="3"><span class="trip-step__dot"></span><div><strong>Entregado</strong><small>Envío completado</small></div></div>
    </div>`;
  showToast(`${name} aceptó tu envío`);

  // Animar mensajero a lo largo de la ruta
  const courier = document.getElementById('map-courier');
  const route = document.getElementById('map-route');
  courier.setAttribute('opacity', '1');
  let t = 0, step = 0, eta = 8;
  const pathLen = route.getTotalLength ? route.getTotalLength() : 0;
  clearInterval(llevaTrackingTimer);
  llevaTrackingTimer = setInterval(() => {
    t += 0.012;
    if (pathLen && route.getPointAtLength) {
      const pt = route.getPointAtLength(Math.min(1, t) * pathLen);
      courier.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    }
    // ETA countdown
    const newEta = Math.max(0, Math.round(eta * (1 - t)));
    const etaEl = document.getElementById('lleva-eta-num');
    if (etaEl) etaEl.textContent = newEta;
    // Avanzar timeline
    const newStep = Math.min(3, Math.floor(t * 4));
    if (newStep !== step) {
      step = newStep;
      document.querySelectorAll('#lleva-timeline .trip-step').forEach((el, i) => el.classList.toggle('active', i <= step));
      if (step === 2) sendDriverMessage('Recogí tu paquete, voy en camino 🏍️');
    }
    if (t >= 1) {
      clearInterval(llevaTrackingTimer);
      sendDriverMessage('¡Entregado! Gracias por usar TeloLleva ✅');
      showToast('Envío entregado exitosamente 🎉');
    }
  }, 100);

  // Mensaje inicial del conductor
  setTimeout(() => sendDriverMessage(`Hola, soy ${name}. Voy en camino a recoger tu paquete.`), 800);
}

function sendDriverMessage(text) {
  const box = document.getElementById('lleva-chat-messages');
  if (!box) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--bot';
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

function sendLlevaChatMessage() {
  const input = document.getElementById('lleva-chat-input');
  const text = input.value.trim();
  if (!text) return;
  const box = document.getElementById('lleva-chat-messages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--user';
  msg.textContent = text;
  box.appendChild(msg);
  input.value = '';
  box.scrollTop = box.scrollHeight;
  setTimeout(() => sendDriverMessage('Entendido 👍'), 1000);
}

// ═══════════════════════════════════════════════════════════════
// TELOREPARA & TELOINSTALA
// ═══════════════════════════════════════════════════════════════

const reparaPrices = { phone: { screen: 1500, battery: 800, power: 2000, water: 2500, system: 1000 }, laptop: { screen: 3500, battery: 2000, power: 4000, water: 5000, system: 1500 }, tablet: { screen: 2000, battery: 1200, power: 2500, water: 3000, system: 1200 }, tv: { screen: 8000, battery: 0, power: 3000, water: 5000, system: 2000 }, appliance: { screen: 0, battery: 0, power: 2500, water: 3000, system: 1500 } };
const reparaTimes = { screen: '24-48h', battery: '2-4h', power: '48-72h', water: '72h', system: '2-4h' };

function updateReparaQuote() {
  const device = document.getElementById('repara-device').value;
  const issue = document.getElementById('repara-issue').value;
  const price = reparaPrices[device]?.[issue] || 1500;
  document.getElementById('repara-price').textContent = `RD$ ${price.toLocaleString()}`;
  document.getElementById('repara-time').textContent = reparaTimes[issue] || '24-48h';
}

let reparaTimer = null;
function bookRepara() {
  const payload = { event: 'repara_booking', device: document.getElementById('repara-device').value, issue: document.getElementById('repara-issue').value, address: document.getElementById('repara-address').value, customer: State.userProfile, timestamp: new Date().toISOString() };
  BackendService.sendWebhook(BackendService.config.n8nServices, payload);
  BackendService.supabaseQuery('repara_bookings', 'POST', payload);
  const ticket = `RP-${Date.now().toString().slice(-6)}`;
  document.getElementById('repara-tracker').hidden = false;
  const steps = [
    { t: 'Servicio Solicitado', d: 'Ticket ' + ticket + ' generado' },
    { t: 'Mensajero en Camino', d: 'Retiro del dispositivo a domicilio' },
    { t: 'En Diagnóstico Técnico', d: 'Téc. Carlos Medina evaluando' },
    { t: 'Reparación Finalizada', d: 'Pruebas de calidad superadas ✓' }
  ];
  const render = (active) => {
    document.getElementById('repara-steps').innerHTML = steps.map((s, i) => `<div class="tracker-step ${i <= active ? 'active' : ''}"><div class="tracker-step__num">${i < active ? '✓' : i + 1}</div><div><strong>${s.t}</strong><small>${s.d}</small></div></div>`).join('') + `<div class="repara-warranty">🛡️ Garantía de 90 días incluida · 🔧 Téc. certificado</div>`;
  };
  render(0);
  let step = 0;
  clearInterval(reparaTimer);
  reparaTimer = setInterval(() => {
    step++;
    render(step);
    if (step === 2) showToast('Tu dispositivo está en diagnóstico');
    if (step >= 3) { clearInterval(reparaTimer); showToast('¡Reparación finalizada! 🎉'); }
  }, 3000);
  showToast('Reparación reservada · Ticket ' + ticket);
}

const instalaPrices = { tv: 1200, ac: 4500, smart: 2800, network: 3500, lock: 2000 };
const instalaNames = { tv: 'Montaje de TV en Pared', ac: 'Instalación Aire Acondicionado', smart: 'Domótica / Smart Home', network: 'Cableado y Wifi Mesh', lock: 'Cerradura Inteligente' };

function updateInstalaPrice() {
  const service = document.getElementById('instala-service').value;
  document.getElementById('instala-price').textContent = `RD$ ${(instalaPrices[service] || 1200).toLocaleString()}`;
}

function bookInstala() {
  const service = document.getElementById('instala-service').value;
  const tech = document.querySelector('.tech-card.active')?.dataset.tech || 'ramon';
  const payload = { event: 'instala_booking', service: instalaNames[service], date: document.getElementById('instala-date').value, time: document.getElementById('instala-time').value, tech, price: instalaPrices[service], customer: State.userProfile, timestamp: new Date().toISOString() };
  BackendService.sendWebhook(BackendService.config.n8nServices, payload);
  BackendService.supabaseQuery('instala_bookings', 'POST', payload);
  document.getElementById('instala-confirmation').hidden = false;
  document.getElementById('instala-details').innerHTML = `<ul style="list-style:none;display:flex;flex-direction:column;gap:8px;"><li><strong>Servicio:</strong> ${instalaNames[service]}</li><li><strong>Fecha:</strong> ${payload.date}</li><li><strong>Horario:</strong> ${payload.time === 'am' ? 'Mañana' : 'Tarde'}</li><li><strong>Técnico:</strong> ${tech}</li><li><strong>Total:</strong> <span style="color:var(--c-instala);font-weight:700">RD$ ${instalaPrices[service].toLocaleString()}</span></li></ul><div class="status-pill status-pill--active" style="margin-top:12px;display:inline-block;">✓ Cita Confirmada</div>`;
  showToast('Instalación agendada');
}

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════

function loadProfile() {
  const p = State.userProfile;
  document.getElementById('profile-name').value = p.name || '';
  document.getElementById('profile-email').value = p.email || '';
  document.getElementById('profile-phone').value = p.phone || '';
  document.getElementById('profile-address').value = p.address || '';
  document.getElementById('profile-city').value = p.city || '';
  document.getElementById('profile-display-name').textContent = p.name || 'Usuario';
  document.getElementById('profile-display-email').textContent = p.email || 'Sin registro';
  if (p.name) document.getElementById('profile-avatar').textContent = p.name.charAt(0).toUpperCase();
  renderProfileServices();
}

function saveProfile(e) {
  e.preventDefault();
  State.userProfile = { name: document.getElementById('profile-name').value, email: document.getElementById('profile-email').value, phone: document.getElementById('profile-phone').value, address: document.getElementById('profile-address').value, city: document.getElementById('profile-city').value };
  State.save();
  loadProfile();
  BackendService.supabaseQuery('customers', 'POST', { ...State.userProfile, updated_at: new Date().toISOString() });
  showToast('Perfil guardado');
}

function renderProfileServices() {
  const services = [
    { name: 'TeloSales', icon: '🛒', color: 'var(--c-sales)', view: 'sales' },
    { name: 'TeloEduca', icon: '🎓', color: 'var(--c-educa)', view: 'educa' },
    { name: 'TeloLleva', icon: '📦', color: 'var(--c-lleva)', view: 'lleva' },
    { name: 'TeloRepara', icon: '🔧', color: 'var(--c-repara)', view: 'repara' },
    { name: 'TeloInstala', icon: '🛠️', color: 'var(--c-instala)', view: 'instala' },
  ];
  document.getElementById('profile-services').innerHTML = services.map(s => `<div class="profile-service" data-view="${s.view}"><span class="profile-service__icon" style="background:${s.color}20;color:${s.color}">${s.icon}</span><div><strong>${s.name}</strong></div></div>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// CHAT WIDGET (TeloAsistente)
// ═══════════════════════════════════════════════════════════════

function toggleChat(show) {
  const widget = document.getElementById('chat-widget');
  widget.hidden = show !== undefined ? !show : !widget.hidden;
  if (!widget.hidden && document.getElementById('chat-messages').children.length === 0) {
    appendChatMessage('bot', '¡Hola! Soy TeloAsistente. ¿En qué puedo ayudarte hoy?');
  }
}

function appendChatMessage(role, text) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg chat-msg--${role === 'bot' ? 'bot' : 'user'}`;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  appendChatMessage('user', message);
  appendChatMessage('bot', '...');
  const response = await BackendService.geminiChat(message, 'Servicios: TeloSales (tienda), TeloEduca (cursos), TeloLleva (mensajería), TeloRepara (reparaciones), TeloInstala (instalaciones).');
  const messages = document.getElementById('chat-messages');
  messages.lastChild.textContent = response;
}

// ═══════════════════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════════════════

async function submitContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  // Web3Forms
  try {
    await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  } catch (err) { /* fallback */ }
  // Webhook
  BackendService.sendWebhook(BackendService.config.n8nLeads, { event: 'contact_form', ...data, timestamp: new Date().toISOString() });
  BackendService.supabaseQuery('leads', 'POST', data);
  form.reset();
  showToast('Mensaje enviado correctamente');
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATIONS PAGE
// ═══════════════════════════════════════════════════════════════

function loadIntegrations() {
  const c = BackendService.config;
  document.getElementById('int-sb-url').value = c.supabaseUrl || '';
  document.getElementById('int-sb-key').value = c.supabaseKey || '';
  document.getElementById('int-stripe-pk').value = c.stripeKey || '';
  document.getElementById('int-stripe-wh').value = c.stripeWebhook || '';
  document.getElementById('int-stripe-on').checked = c.stripeEnabled;
  document.getElementById('int-n8n-leads').value = c.n8nLeads || '';
  document.getElementById('int-n8n-orders').value = c.n8nOrders || '';
  document.getElementById('int-n8n-services').value = c.n8nServices || '';
  document.getElementById('int-gemini').value = c.geminiKey || '';
  document.getElementById('int-hmac-on').checked = c.hmacEnabled;
  document.getElementById('int-hmac-secret').value = c.hmacSecret || '';
  updateIntegrationStatus();
}

function saveIntegration(section) {
  const c = BackendService.config;
  if (section === 'sb') { c.supabaseUrl = document.getElementById('int-sb-url').value.trim(); c.supabaseKey = document.getElementById('int-sb-key').value.trim(); }
  else if (section === 'stripe') { c.stripeKey = document.getElementById('int-stripe-pk').value.trim(); c.stripeWebhook = document.getElementById('int-stripe-wh').value.trim(); c.stripeEnabled = document.getElementById('int-stripe-on').checked; }
  else if (section === 'n8n') { c.n8nLeads = document.getElementById('int-n8n-leads').value.trim(); c.n8nOrders = document.getElementById('int-n8n-orders').value.trim(); c.n8nServices = document.getElementById('int-n8n-services').value.trim(); }
  else if (section === 'gemini') { c.geminiKey = document.getElementById('int-gemini').value.trim(); }
  else if (section === 'hmac') { c.hmacEnabled = document.getElementById('int-hmac-on').checked; c.hmacSecret = document.getElementById('int-hmac-secret').value.trim(); }
  BackendService.saveConfig();
  updateIntegrationStatus();
  showToast('Configuración guardada');
}

function updateIntegrationStatus() {
  const c = BackendService.config;
  const sbStatus = document.getElementById('status-supabase');
  if (c.supabaseUrl && c.supabaseKey) { sbStatus.textContent = 'Conectado'; sbStatus.className = 'status-pill status-pill--active'; }
  else { sbStatus.textContent = 'Desconectado'; sbStatus.className = 'status-pill'; }
}

async function testSupabase() {
  const result = await BackendService.supabaseQuery('', 'GET');
  const console = document.getElementById('debug-console');
  if (result !== null) { console.textContent += `\n[OK] Supabase conectado`; showToast('Conexión exitosa'); }
  else { console.textContent += `\n[ERR] No se pudo conectar a Supabase`; showToast('Error de conexión', 'error'); }
}

function logToConsole(msg) {
  const el = document.getElementById('debug-console');
  el.textContent += `\n${new Date().toLocaleTimeString()} | ${msg}`;
  el.scrollTop = el.scrollHeight;
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION & EVENT BINDING
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Load state and config
  State.load();
  BackendService.loadConfig();

  // Navigation
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', () => switchView(el.dataset.view));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') switchView(el.dataset.view); });
  });

  // Mobile menu
  document.getElementById('menu-toggle').addEventListener('click', openMobileMenu);
  document.getElementById('sidebar-close').addEventListener('click', closeMobileMenu);
  document.getElementById('bottom-nav-more')?.addEventListener('click', openMobileMenu);

  // Topbar actions
  document.getElementById('btn-cart').addEventListener('click', () => toggleCartDrawer(true));
  document.getElementById('cart-close').addEventListener('click', () => toggleCartDrawer(false));
  document.getElementById('cart-overlay').addEventListener('click', () => toggleCartDrawer(false));
  document.getElementById('btn-wishlist').addEventListener('click', () => toggleWishlistDrawer(true));
  document.getElementById('wishlist-close').addEventListener('click', () => toggleWishlistDrawer(false));
  document.getElementById('wishlist-overlay').addEventListener('click', () => toggleWishlistDrawer(false));
  document.getElementById('btn-checkout').addEventListener('click', checkout);
  document.getElementById('btn-coupon')?.addEventListener('click', applyCoupon);
  document.getElementById('coupon-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyCoupon(); });
  document.getElementById('btn-chat').addEventListener('click', () => toggleChat());
  document.getElementById('btn-open-chat')?.addEventListener('click', () => { toggleChat(true); switchView('support'); });
  document.getElementById('chat-close').addEventListener('click', () => toggleChat(false));
  document.getElementById('chat-send').addEventListener('click', sendChatMessage);
  document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });

  // Product modal
  document.getElementById('product-modal-close').addEventListener('click', closeProductModal);
  document.getElementById('product-modal-overlay').addEventListener('click', closeProductModal);

  // TeloSales filters
  document.getElementById('sales-search').addEventListener('input', e => { searchQuery = e.target.value; renderProducts(); });
  document.getElementById('sales-sort').addEventListener('change', e => { currentSort = e.target.value; renderProducts(); });
  document.querySelectorAll('.filter-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chips .chip').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      currentFilter = chip.dataset.cat;
      renderProducts();
    });
  });

  // TeloEduca
  document.getElementById('btn-back-courses').addEventListener('click', () => switchView('educa'));
  document.getElementById('btn-complete-class').addEventListener('click', toggleCompleteClass);
  document.getElementById('btn-certificate')?.addEventListener('click', startCertificateQuiz);
  document.getElementById('cert-modal-close')?.addEventListener('click', closeCertModal);
  document.getElementById('cert-modal-overlay')?.addEventListener('click', closeCertModal);
  document.getElementById('btn-forum-post')?.addEventListener('click', postForumMessage);
  document.getElementById('btn-download-notes')?.addEventListener('click', downloadNotes);
  document.querySelectorAll('.path-card').forEach(card => card.addEventListener('click', () => filterCoursesByPath(card.dataset.path)));
  // Reproductor de video (simulación)
  document.getElementById('video-toggle')?.addEventListener('click', toggleVideoPlay);
  document.getElementById('video-play-btn')?.addEventListener('click', toggleVideoPlay);
  document.getElementById('video-progress-bar')?.addEventListener('click', seekVideo);
  document.getElementById('classroom-notes')?.addEventListener('input', e => {
    if (State.currentCourse) { State.classNotes[`${State.currentCourse.id}_${State.currentLesson}`] = e.target.value; State.save(); }
  });
  // Classroom tabs
  document.querySelectorAll('.classroom-tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.classroom-tabs__btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.classroom-tabs__panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // TeloLleva
  document.getElementById('lleva-origin').addEventListener('change', updateLlevaPrice);
  document.getElementById('lleva-dest').addEventListener('change', updateLlevaPrice);
  document.querySelectorAll('.vehicle-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.vehicle-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      updateLlevaPrice();
    });
  });
  document.getElementById('lleva-fare-minus').addEventListener('click', () => { const inp = document.getElementById('lleva-fare'); inp.value = Math.max(100, parseInt(inp.value) - 50); });
  document.getElementById('lleva-fare-plus').addEventListener('click', () => { const inp = document.getElementById('lleva-fare'); inp.value = parseInt(inp.value) + 50; });
  document.getElementById('lleva-submit').addEventListener('click', startLlevaRequest);
  document.getElementById('lleva-schedule').addEventListener('change', e => { document.getElementById('lleva-datetime-group').hidden = e.target.value !== 'scheduled'; });
  document.getElementById('lleva-cancel')?.addEventListener('click', () => {
    clearInterval(llevaTrackingTimer);
    document.getElementById('lleva-status-card').hidden = true;
    document.getElementById('lleva-form-card').hidden = false;
    document.getElementById('map-courier').setAttribute('opacity', '0');
    showToast('Pedido cancelado');
  });
  document.getElementById('lleva-chat-send')?.addEventListener('click', sendLlevaChatMessage);
  document.getElementById('lleva-chat-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendLlevaChatMessage(); });

  // TeloRepara
  document.getElementById('repara-device').addEventListener('change', updateReparaQuote);
  document.getElementById('repara-issue').addEventListener('change', updateReparaQuote);
  document.getElementById('repara-submit').addEventListener('click', bookRepara);
  document.querySelectorAll('.hw-part').forEach(part => {
    part.addEventListener('click', () => {
      document.getElementById('repara-issue').value = part.dataset.part === 'board' ? 'system' : part.dataset.part;
      document.getElementById('hw-label').textContent = part.getAttribute('aria-label');
      updateReparaQuote();
    });
    part.addEventListener('mouseenter', () => { document.getElementById('hw-label').textContent = part.getAttribute('aria-label'); });
    part.addEventListener('mouseleave', () => { document.getElementById('hw-label').textContent = 'Selecciona un componente'; });
  });

  // TeloInstala
  document.getElementById('instala-service').addEventListener('change', updateInstalaPrice);
  document.getElementById('instala-submit').addEventListener('click', bookInstala);
  document.querySelectorAll('.tech-card').forEach(card => {
    card.addEventListener('click', () => { document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('active')); card.classList.add('active'); });
  });

  // Profile
  document.getElementById('profile-form').addEventListener('submit', saveProfile);

  // Contact form
  document.getElementById('contact-form').addEventListener('submit', submitContactForm);
  document.getElementById('partner-form')?.addEventListener('submit', e => {
    e.preventDefault();
    BackendService.sendWebhook(BackendService.config.n8nLeads, { event: 'partner_application', name: document.getElementById('partner-name').value, email: document.getElementById('partner-email').value, type: document.getElementById('partner-type').value, proposal: document.getElementById('partner-proposal').value });
    e.target.reset();
    showToast('Propuesta enviada exitosamente');
  });

  // Integrations
  document.getElementById('btn-save-sb')?.addEventListener('click', () => saveIntegration('sb'));
  document.getElementById('btn-test-sb')?.addEventListener('click', testSupabase);
  document.getElementById('btn-save-stripe')?.addEventListener('click', () => saveIntegration('stripe'));
  document.getElementById('btn-save-n8n')?.addEventListener('click', () => saveIntegration('n8n'));
  document.getElementById('btn-save-gemini')?.addEventListener('click', () => saveIntegration('gemini'));
  document.getElementById('btn-save-hmac')?.addEventListener('click', () => saveIntegration('hmac'));
  document.getElementById('btn-clear-console')?.addEventListener('click', () => { document.getElementById('debug-console').textContent = '> Consola limpia'; });
  document.getElementById('btn-test-leads')?.addEventListener('click', () => { BackendService.sendWebhook(BackendService.config.n8nLeads, { event: 'test', timestamp: new Date().toISOString() }).then(r => logToConsole(`Leads: ${r.ok ? 'OK' : r.error}`)); });
  document.getElementById('btn-test-orders')?.addEventListener('click', () => { BackendService.sendWebhook(BackendService.config.n8nOrders, { event: 'test', timestamp: new Date().toISOString() }).then(r => logToConsole(`Orders: ${r.ok ? 'OK' : r.error}`)); });
  document.getElementById('btn-test-services')?.addEventListener('click', () => { BackendService.sendWebhook(BackendService.config.n8nServices, { event: 'test', timestamp: new Date().toISOString() }).then(r => logToConsole(`Services: ${r.ok ? 'OK' : r.error}`)); });

  // Keyboard shortcut for integrations (Ctrl+Shift+I)
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); document.getElementById('nav-integrations').hidden = false; switchView('integrations'); loadIntegrations(); } });

  // Initial renders
  renderProducts();
  renderCourses();
  updateCartBadge();
  updateWishlistBadge();
  loadProfile();
  loadIntegrations();
  updateLlevaPrice();
  updateReparaQuote();
  updateInstalaPrice();
  updateEducaProgress();

  // Set default install date
  const dateInput = document.getElementById('instala-date');
  if (dateInput) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); dateInput.value = tomorrow.toISOString().split('T')[0]; }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
