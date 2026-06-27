/**
 * Telo' Corp Group — Super App Platform v2.0
 * Arquitectura modular con servicios de backend integrados.
 */

// ═══════════════════════════════════════════════════════════════
// SERVICES LAYER (Backend Integration)
// ═══════════════════════════════════════════════════════════════

const BackendService = {
  config: {
    supabaseUrl: 'https://bhdictzvboiojyxorfiq.supabase.co',
    supabaseKey: 'sb_publishable_AgpNN0k_KfW0moe6f1CKXg_qP2GKJCm'
  },

  loadConfig() {},
  saveConfig() {},

  async supabaseQuery(table, method = 'GET', body = null) {
    if (!this.config.supabaseUrl || !this.config.supabaseKey) return null;
    const url = `${this.config.supabaseUrl}/rest/v1/${table}`;
    const headers = { 'apikey': this.config.supabaseKey, 'Authorization': `Bearer ${this.config.supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal' };
    try {
      const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (method === 'GET') return res.ok ? await res.json() : null;
      return res.ok;
    } catch (e) { console.error('[Supabase]', e); return null; }
  },

  async sendWebhook(endpoint, payload) {
    // Webhooks are now handled server-side via Supabase database triggers
    // This is a no-op placeholder that logs the event for debugging
    if (!endpoint) return { ok: true };
    console.log('[Webhook]', payload.event, payload);
    return { ok: true };
  },

  async geminiChat(message, context = '') {
    // Route through Supabase Edge Function to keep API key server-side
    const url = `${this.config.supabaseUrl}/functions/v1/chat`;
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.config.supabaseKey}` }, body: JSON.stringify({ message, context }) });
      if (res.ok) { const data = await res.json(); return data.reply || 'Sin respuesta.'; }
      // Fallback: if edge function not deployed yet, return helpful message
      return 'El asistente IA estará disponible pronto. Mientras tanto, contacta al equipo por WhatsApp: +1 (809) 903-8707';
    } catch (e) { return 'El asistente no está disponible en este momento. Contacta por WhatsApp.'; }
  },

  // Notificación interna: envía cada solicitud de servicio al admin vía WhatsApp
  // (Edge Function) + registra en tabla notifications. Oculto para el usuario.
  async notifyAdmin(type, payload) {
    try {
      // 1. Registrar en Supabase (tabla notifications) para historial del admin
      await this.supabaseQuery('notifications', 'POST', {
        type,
        payload,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      // 2. Disparar notificación WhatsApp vía Edge Function (no bloquea UX)
      fetch(`${this.config.supabaseUrl}/functions/v1/notify-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.config.supabaseKey}` },
        body: JSON.stringify({ type, ...payload })
      }).catch(() => {});
    } catch (e) { /* notificación no bloquea el flujo del usuario */ }
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
// IMAGE CDN — Optimiza imágenes via proxy (wsrv.nl convierte a WebP automáticamente)
// ═══════════════════════════════════════════════════════════════

const IMG_CDN_BASE = 'https://wsrv.nl/?url=';
function cdnImage(path, width = 400) {
  if (!path) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23111827" width="400" height="400"/%3E%3C/svg%3E';
  const fullUrl = path.startsWith('http') ? path : `https://telocg.com/${path}`;
  return `${IMG_CDN_BASE}${encodeURIComponent(fullUrl)}&w=${width}&output=webp&q=75`;
}
function cdnImageFull(path) {
  if (!path) return '';
  const fullUrl = path.startsWith('http') ? path : `https://telocg.com/${path}`;
  return `${IMG_CDN_BASE}${encodeURIComponent(fullUrl)}&w=800&output=webp&q=80`;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT DATABASE
// ═══════════════════════════════════════════════════════════════

// Mutable product list — can be updated from Supabase
let products = [
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

// Enrich catalog with e-commerce metadata
function enrichProductsData() {
  let seed = 7;
  const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  products.forEach((p, i) => {
    if (!p.discount && rng() < 0.4) { p.discount = [10, 15, 20, 25, 30][Math.floor(rng() * 5)]; }
    if (p.discount) p.compareAtPrice = Math.round(p.price / (1 - p.discount / 100) / 10) * 10;
    if (!p.stock) p.stock = Math.floor(rng() * 40) + 3;
    if (!p.sold) p.sold = Math.floor(rng() * 500) + 12;
    p.freeShipping = p.price >= 1000;
    p.featured = i < 4;
    p.badge = p.discount ? `-${p.discount}%` : (p.featured ? 'Destacado' : (p.sold > 300 ? 'Más vendido' : null));
  });
}
enrichProductsData();

// Load products from Supabase (replaces hardcoded catalog if available)
async function syncProductsFromSupabase() {
  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/products?select=*&order=created_at.desc`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const catMap = { 'Covers & Fundas': 'cases', 'Cables y Carga': 'tech', 'Audio': 'audio', 'Equipamiento': 'equipos' };
        products = data.map(p => ({
          id: p.id, title: p.title || p.name || '', category: catMap[p.category] || p.category || 'tech',
          price: p.price || 0, image: (p.images && p.images[0]) || p.image || '',
          description: p.description || p.desc || '',
          specs: typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : (p.specs || {}),
          rating: p.rating || 5, stock: p.stock || 0, sold: p.sold || 0, discount: p.discount || 0,
          freeShipping: (p.price || 0) >= 1000,
          reviews: [{ user: 'Cliente', rating: p.rating || 5, date: 'Reciente', text: 'Excelente producto.' }]
        }));
        enrichProductsData();
        renderProducts();
        console.log(`[Store] Synced ${products.length} products from Supabase`);
      }
    }
  } catch (e) { /* Supabase unavailable — keep local catalog */ }
}

// Load courses from Supabase (replaces hardcoded array if available)
async function syncCoursesFromSupabase() {
  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/courses?select=*&order=sort_order.asc`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        courses = data.map(c => ({
          id: c.id,
          title: c.title,
          icon: c.icon || '📚',
          path: c.path || 'tech',
          duration: c.duration || '10h',
          level: c.level || 'Básico',
          instructor: c.instructor,
          students: c.students || 0,
          rating: c.rating || 5,
          lessons: Array.isArray(c.lessons) ? c.lessons : (typeof c.lessons === 'string' ? JSON.parse(c.lessons || '[]') : []),
          quiz: Array.isArray(c.quiz) ? c.quiz : (typeof c.quiz === 'string' ? JSON.parse(c.quiz || '[]') : [])
        }));
        renderCourses();
        console.log(`[Educa] Synced ${courses.length} courses from Supabase`);
      }
    }
  } catch (e) { /* keep local catalog */ }
}

// ═══════════════════════════════════════════════════════════════
// TRACKING REAL — lee estados persistidos en Supabase
// Muestra al usuario el estado real de sus solicitudes gestionado por el admin
// ═══════════════════════════════════════════════════════════════

const STATUS_LABELS = {
  repara: { pending: 'Pendiente', in_progress: 'En diagnóstico', completed: 'Reparación completada', cancelled: 'Cancelada' },
  instala: { confirmed: 'Cita confirmada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada' },
  lleva: { pending: 'Buscando mensajero', assigned: 'Mensajero asignado', pickup: 'Recogiendo paquete', in_transit: 'En tránsito', delivered: 'Entregado', cancelled: 'Cancelado' }
};

// Carga el historial real del usuario desde Supabase y lo renderiza en los CRM lists
async function loadUserHistory() {
  const phone = State.userProfile.phone;
  const email = State.userProfile.email;
  if (!phone && !email) return; // sin perfil no se puede vincular

  const filter = (col) => {
    const parts = [];
    if (phone) parts.push(`customer->>phone=eq.${encodeURIComponent(phone)}`);
    if (email) parts.push(`customer->>email=eq.${encodeURIComponent(email)}`);
    return parts.length ? `&or=(${parts.join(',')})` : '';
  };

  try {
    // TeloRepara history
    const [reparaRes, instalaRes, llevaRes] = await Promise.all([
      fetch(`${BackendService.config.supabaseUrl}/rest/v1/repara_bookings?select=*&order=created_at.desc${filter()}&limit=10`, { headers: { apikey: BackendService.config.supabaseKey } }),
      fetch(`${BackendService.config.supabaseUrl}/rest/v1/instala_bookings?select=*&order=created_at.desc${filter()}&limit=10`, { headers: { apikey: BackendService.config.supabaseKey } }),
      fetch(`${BackendService.config.supabaseUrl}/rest/v1/lleva_requests?select=*&order=created_at.desc${filter()}&limit=10`, { headers: { apikey: BackendService.config.supabaseKey } })
    ]);

    const repara = reparaRes.ok ? await reparaRes.json() : [];
    const instala = instalaRes.ok ? await instalaRes.json() : [];
    const lleva = llevaRes.ok ? await llevaRes.json() : [];

    renderReparaHistory(repara);
    renderInstalaHistory(instala);
    renderLlevaHistory(lleva);
  } catch (e) { /* silent */ }
}

function renderReparaHistory(items) {
  const el = document.getElementById('repara-crm-list');
  if (!el) return;
  if (!items || !items.length) { el.innerHTML = '<p class="text-muted text-center">Sin reparaciones previas registradas.</p>'; return; }
  el.innerHTML = items.map(d => {
    const status = d.status || 'pending';
    const label = STATUS_LABELS.repara[status] || status;
    const color = status === 'completed' ? 'var(--c-success)' : status === 'cancelled' ? 'var(--c-danger)' : 'var(--c-repara)';
    const date = d.created_at ? new Date(d.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' }) : '';
    return `<div class="crm-item">
      <div class="crm-item__icon" style="color:${color}">${status === 'completed' ? '✅' : status === 'in_progress' ? '🔧' : '📋'}</div>
      <div class="crm-item__info">
        <strong>${d.device || 'Dispositivo'}</strong> · ${d.issue || 'Falla'}
        <small>Ticket: ${d.ticket || (d.id && d.id.slice(0, 8)) || '—'} · ${date}</small>
      </div>
      <span class="status-pill" style="background:${color}22;color:${color}">${label}</span>
    </div>`;
  }).join('');
}

function renderInstalaHistory(items) {
  const el = document.getElementById('instala-crm-list');
  if (!el) return;
  if (!items || !items.length) { el.innerHTML = '<p class="text-muted text-center">Sin instalaciones previas registradas.</p>'; return; }
  el.innerHTML = items.map(d => {
    const status = d.status || 'confirmed';
    const label = STATUS_LABELS.instala[status] || status;
    const color = status === 'completed' ? 'var(--c-success)' : status === 'cancelled' ? 'var(--c-danger)' : 'var(--c-instala)';
    const date = d.created_at ? new Date(d.created_at).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' }) : '';
    return `<div class="crm-item">
      <div class="crm-item__icon" style="color:${color}">${status === 'completed' ? '✅' : status === 'in_progress' ? '🛠️' : '📅'}</div>
      <div class="crm-item__info">
        <strong>${d.service || 'Servicio'}</strong>
        <small>${d.tech || ''} · ${d.date || ''} · ${date}</small>
      </div>
      <span class="status-pill" style="background:${color}22;color:${color}">${label}</span>
    </div>`;
  }).join('');
}

function renderLlevaHistory(items) {
  // Reutiliza el chat-box del estado de envío si está oculto, o crea un resumen
  const statusCard = document.getElementById('lleva-status-card');
  if (statusCard && !statusCard.hidden) return; // hay un envío activo en pantalla
  if (!items || !items.length) return;
  // Si no hay envío activo, mostrar último estado real en el status card
  const last = items[0];
  if (last.status === 'delivered' || last.status === 'cancelled') return; // ya terminado
  const label = STATUS_LABELS.lleva[last.status] || last.status;
  showToast(`Tienes un envío: ${label}`);
}

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_COST = 250;

// ═══ CONFIGURABLE SITE SETTINGS (overridden from Supabase) ═══
let siteConfig = {
  whatsapp_number: '18099038707',
  free_shipping_threshold: 1500,
  shipping_cost: 250,
  delivery_time: '24-48 horas',
  coupons: { 'TELO10': 10, 'BIENVENIDO': 15, 'TELO20': 20, 'PRIMERA10': 10 },
  exit_popup_enabled: true,
  popup_coupon_code: 'PRIMERA10',
  popup_coupon_discount: 10,
  social_proof_enabled: true,
  flash_sale_enabled: true,
  upsell_enabled: true,
  qty_break_3: 5,
  qty_break_5: 10,
  qty_break_10: 15,
  cardnet_enabled: true,
  transfer_enabled: true,
  paypal_enabled: true,
  cardnet_message: 'Recibirás tu link de pago en WhatsApp',
  chatbot_enabled: true,
  chatbot_context: '',
  ga4_id: '',
  pixel_id: '',
  promo_banner_enabled: false,
  promo_banner_text: ''
};

// Sync site_settings from Supabase → overrides defaults
async function syncSiteSettings() {
  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/site_settings?id=eq.global&limit=1`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data[0]) {
      Object.assign(siteConfig, data[0]);
      // Apply dynamic settings
      if (siteConfig.coupons && typeof siteConfig.coupons === 'object') couponCodes = { ...siteConfig.coupons };
      // Update GA4 ID dynamically if configured
      if (siteConfig.ga4_id && siteConfig.ga4_id !== 'G-XXXXXXXXXX') {
        const existingScript = document.querySelector('script[src*="googletagmanager"]');
        if (existingScript && existingScript.src.includes('XXXXXXXXXX')) {
          existingScript.src = existingScript.src.replace('G-XXXXXXXXXX', siteConfig.ga4_id);
          if (typeof gtag === 'function') gtag('config', siteConfig.ga4_id);
        }
      }
      // Show promo banner if configured
      if (siteConfig.promo_banner_enabled && siteConfig.promo_banner_text) {
        const banner = document.getElementById('promo-banner');
        const bannerText = document.getElementById('promo-banner-text');
        if (banner && bannerText) {
          bannerText.textContent = siteConfig.promo_banner_text;
          banner.hidden = false;
        }
      }
      console.log('[Settings] Site config loaded from Supabase');
    }
  } catch (e) { /* keep defaults */ }
}

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

  // Lazy-load Google Maps only when entering TeloLleva (perf optimization)
  if (viewId === 'lleva') loadGoogleMaps();
  // Refresh user history when entering CRM sections
  if (viewId === 'repara' || viewId === 'instala') loadUserHistory();

  // Update URL hash for sharing/bookmarking (no page reload)
  history.replaceState(null, '', `#${viewId}`);
  // Update page title for SEO/tab identification
  document.title = `${viewTitles[viewId] || 'TeloCorp'} | Telo' Corp Group`;
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
        <img src="${cdnImage(p.image)}" alt="${p.title}" loading="lazy" decoding="async" width="400" height="400">
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
        <div class="product-detail__main-img"><img src="${cdnImageFull(p.image)}" alt="${p.title}"></div>
        ${p.freeShipping ? '<div class="product-detail__ship-note">🚚 Envío gratis a todo el país · Entrega en 24-48h</div>' : ''}
      </div>
      <div class="product-detail__info">
        <span class="product-detail__badge">✓ TeloSales Verificado</span>
        <h2 class="product-detail__title">${p.title}</h2>
        <div class="product-detail__share">
          <button class="btn btn--ghost btn--xs" onclick="shareProduct('${p.id}')" title="Compartir por WhatsApp">📤 Compartir</button>
          <button class="btn btn--ghost btn--xs" onclick="copyProductLink('${p.id}')" title="Copiar enlace">🔗 Copiar link</button>
        </div>
        <div class="product-detail__rating"><span class="product-detail__stars">${stars}</span><span class="text-muted">${p.rating} · ${p.sold} vendidos</span></div>
        <div class="product-detail__price-row">
          ${p.compareAtPrice ? `<span class="product-detail__compare">RD$ ${p.compareAtPrice.toLocaleString()}</span>` : ''}
          <span class="product-detail__price">RD$ ${p.price.toLocaleString()}</span>
          ${p.discount ? `<span class="product-detail__off">${p.discount}% OFF</span>` : ''}
        </div>
        <div class="product-detail__stock ${p.stock <= 8 ? 'product-detail__stock--low' : ''}">${p.stock <= 5 ? `🔥 ¡Solo quedan ${p.stock}! Se agotan rápido` : p.stock <= 8 ? `⚠ ¡Solo quedan ${p.stock} unidades!` : `✓ ${p.stock} disponibles`}</div>
        <div class="product-detail__delivery">🚚 Entrega estimada: <strong>${p.freeShipping ? '24-48 horas' : '2-4 días'}</strong> en Santo Domingo${p.freeShipping ? '' : ' · RD$ 250 envío'}</div>
        <p class="product-detail__desc">${p.description}</p>
        <div class="product-detail__actions">
          <div class="quantity-control"><button onclick="adjustQty(-1)">−</button><span id="modal-qty">1</span><button onclick="adjustQty(1)">+</button></div>
          <button class="btn btn--primary" onclick="addToCart('${p.id}')">Añadir al Carrito</button>
          <button class="btn btn--ghost" id="modal-wish-btn" onclick="toggleWishlist('${p.id}'); document.getElementById('modal-wish-btn').textContent = State.wishlist.includes('${p.id}') ? '❤️' : '🤍'">${State.wishlist.includes(p.id) ? '❤️' : '🤍'}</button>
        </div>
        <div class="product-detail__guarantees">
          <span>🔒 Pago seguro CardNET</span><span>↩ Devolución 7 días</span><span>✓ Garantía oficial</span><span>🚚 Envío express 24-48h</span>
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
        ${related.length ? `<div class="related-products"><h3>Productos relacionados</h3><div class="related-products__grid">${related.map(r => `<div class="related-card" onclick="openProductModal('${r.id}')"><img src="${cdnImage(r.image, 200)}" alt="${r.title}" loading="lazy"><div class="related-card__title">${r.title}</div><div class="related-card__price">RD$ ${r.price.toLocaleString()}</div></div>`).join('')}</div></div>` : ''}
      </div>
    </div>`;
  modal.classList.add('active');
  overlay.classList.add('active');
  // Accessibility: trap focus inside modal
  trapFocus(modal);
  // Initialize hover-zoom after DOM update
  setTimeout(initProductImageZoom, 50);
  // SEO: update meta tags for sharing
  updateMetaForProduct(p);
  // URL: update hash for deep linking
  history.replaceState(null, '', `#telosales?p=${p.id}`);
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  document.getElementById('product-modal-overlay').classList.remove('active');
  releaseFocusTrap();
  // Restore default meta and URL
  resetMeta();
  history.replaceState(null, '', '#sales');
}

// ═══════════════════════════════════════════════════════════════
// FOCUS TRAP — Accessibility: keeps focus inside open modals (WCAG)
// ═══════════════════════════════════════════════════════════════
let _trapHandler = null;
let _lastFocused = null;

function trapFocus(container) {
  _lastFocused = document.activeElement;
  _trapHandler = (e) => {
    if (e.key !== 'Tab') return;
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };
  container.addEventListener('keydown', _trapHandler);
  // Enfocar primer elemento focusable al abrir
  setTimeout(() => {
    const f = container.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (f) f.focus();
  }, 50);
}

function releaseFocusTrap() {
  if (_lastFocused) _lastFocused.focus();
  if (_trapHandler) {
    document.removeEventListener('keydown', _trapHandler);
    _trapHandler = null;
  }
}

// Esc cerrar modales
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const pm = document.getElementById('product-modal');
    if (pm && pm.classList.contains('active')) closeProductModal();
    const cm = document.getElementById('cert-modal');
    if (cm && cm.classList.contains('active')) closeCertificate();
  }
});

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

    const cartItems = State.cart.map(item => {
      const p = products.find(x => x.id === item.id);
      if (!p) return '';
      return `<div class="cart-item"><div class="cart-item__img"><img src="${cdnImage(p.image, 100)}" alt="${p.title}"></div><div class="cart-item__info"><div class="cart-item__title">${p.title}</div><div class="cart-item__price">RD$ ${(p.price * item.qty).toLocaleString()}</div><div class="cart-item__actions"><button onclick="updateCartQty('${item.id}',-1)">−</button><span class="cart-item__qty">${item.qty}</span><button onclick="updateCartQty('${item.id}',1)">+</button><button onclick="removeFromCart('${item.id}')" style="margin-left:auto;color:var(--c-danger);">✕</button></div></div></div>`;
    }).join('');

    // Upsell: productos complementarios que no están en el carrito (respeta config admin)
    let upsellHtml = '';
    if (siteConfig.upsell_enabled) {
      const cartIds = State.cart.map(i => i.id);
      const cartCategories = [...new Set(State.cart.map(i => products.find(x => x.id === i.id)?.category).filter(Boolean))];
      const upsellProducts = products.filter(p => !cartIds.includes(p.id) && cartCategories.includes(p.category) && p.price < subtotal * 0.5).slice(0, 3);
      upsellHtml = upsellProducts.length ? `<div class="cart-upsell"><div class="cart-upsell__title">✨ Complementa tu pedido</div>${upsellProducts.map(p => `<div class="cart-upsell__item"><img src="${cdnImage(p.image, 60)}" alt="${p.title}"><div class="cart-upsell__info"><span class="cart-upsell__name">${p.title.slice(0, 30)}${p.title.length > 30 ? '...' : ''}</span><span class="cart-upsell__price">RD$ ${p.price.toLocaleString()}</span></div><button class="btn btn--ghost btn--xs" onclick="quickAddToCart('${p.id}')">+</button></div>`).join('')}</div>` : '';
    }

    container.innerHTML = shipProgress + cartItems + upsellHtml;
  }

  // Desglose de totales
  const discount = State.coupon ? Math.round(subtotal * State.coupon.pct / 100) : 0;
  const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;
  const footer = document.getElementById('cart-total');
  if (footer) {
    const breakdown = document.getElementById('cart-breakdown');
    const html = `
      <div class="cart-line"><span>Subtotal (${State.cart.reduce((s, i) => s + i.qty, 0)} items)</span><span>RD$ ${subtotal.toLocaleString()}</span></div>
      ${discount ? `<div class="cart-line cart-line--discount"><span>🎟️ Cupón ${State.coupon.code} (−${State.coupon.pct}%)</span><span>−RD$ ${discount.toLocaleString()}</span></div>` : ''}
      <div class="cart-line"><span>🚚 Envío</span><span>${shipping === 0 ? '<span style="color:var(--c-success)">Gratis</span>' : 'RD$ ' + shipping}</span></div>`;
    if (breakdown) breakdown.innerHTML = html;
    footer.textContent = `RD$ ${total.toLocaleString()}`;
  }
}

let couponCodes = { 'TELO10': 10, 'BIENVENIDO': 15, 'TELO20': 20, 'PRIMERA10': 10 };

// Quantity breaks: compra más, paga menos (configurable desde admin)
const QUANTITY_BREAKS = [
  { minQty: 3, discount: 5, label: '5% OFF comprando 3+' },
  { minQty: 5, discount: 10, label: '10% OFF comprando 5+' },
  { minQty: 10, discount: 15, label: '15% OFF comprando 10+' }
];

function getQuantityBreakDiscount() {
  const totalQty = State.cart.reduce((s, i) => s + i.qty, 0);
  // Use admin-configured values
  const breaks = [
    { minQty: 3, discount: siteConfig.qty_break_3 || 5 },
    { minQty: 5, discount: siteConfig.qty_break_5 || 10 },
    { minQty: 10, discount: siteConfig.qty_break_10 || 15 }
  ];
  const applicable = breaks.filter(b => totalQty >= b.minQty);
  return applicable.length ? applicable[applicable.length - 1] : null;
}

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
  if (open) {
    renderCart();
    // Auto-fill checkout form from saved profile
    const p = State.userProfile;
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const addrInput = document.getElementById('checkout-address');
    const cityInput = document.getElementById('checkout-city');
    if (nameInput && p.name && !nameInput.value) nameInput.value = p.name;
    if (phoneInput && p.phone && !phoneInput.value) phoneInput.value = p.phone;
    if (addrInput && p.address && !addrInput.value) addrInput.value = p.address;
    if (cityInput && p.city && !cityInput.value) cityInput.value = p.city;
    // Show/hide payment methods based on admin config
    document.querySelectorAll('.payment-option').forEach(opt => {
      const val = opt.querySelector('input[name="payment"]')?.value;
      if (val === 'cardnet') opt.style.display = siteConfig.cardnet_enabled ? '' : 'none';
      else if (val === 'whatsapp') opt.style.display = siteConfig.transfer_enabled ? '' : 'none';
      else if (val === 'paypal') opt.style.display = siteConfig.paypal_enabled ? '' : 'none';
    });
    // Select first visible payment method
    const firstVisible = document.querySelector('.payment-option:not([style*="none"]) input[name="payment"]');
    if (firstVisible) firstVisible.checked = true;
  }
}

async function checkout() {
  if (State.cart.length === 0) return showToast('Carrito vacío', 'error');

  // Validar formulario de checkout
  const name = document.getElementById('checkout-name').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const address = document.getElementById('checkout-address').value.trim();
  const city = document.getElementById('checkout-city').value.trim();
  const notes = document.getElementById('checkout-notes').value.trim();

  if (!name) return showToast('Ingresa tu nombre', 'error');
  if (!phone) return showToast('Ingresa tu WhatsApp para recibir el link de pago', 'error');
  if (!address) return showToast('Ingresa la dirección de entrega', 'error');

  // Guardar datos en el perfil del usuario
  State.userProfile = { name, phone, address, city, email: State.userProfile.email || '' };
  State.save();

  const subtotal = State.cart.reduce((s, i) => { const p = products.find(x => x.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0);
  const discount = State.coupon ? Math.round(subtotal * State.coupon.pct / 100) : 0;
  const shipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal - discount + shipping;
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cardnet';

  const items = State.cart.map(i => { const p = products.find(x => x.id === i.id); return `- ${p?.title} x${i.qty} = RD$${(p.price * i.qty).toLocaleString()}`; }).join('\n');
  const customerPhone = phone.replace(/\D/g, '');
  const customerInfo = `\n\n👤 *Cliente:* ${name}\n📱 WhatsApp: ${phone}\n📍 Dirección: ${address}${city ? ', ' + city : ''}${notes ? '\n📝 Notas: ' + notes : ''}`;

  if (paymentMethod === 'cardnet') {
    const msg = `🛒💳 *PEDIDO — Link de Pago CardNET*\n\n${items}\n\n💰 *Total: RD$ ${total.toLocaleString()}*${shipping ? '\n🚚 Envío: RD$ ' + shipping : '\n🚚 Envío: Gratis'}${discount ? '\n🎟️ Descuento: -RD$ ' + discount.toLocaleString() : ''}${customerInfo}\n\n⚡ *Acción:* Generar link CardNET por RD$ ${total.toLocaleString()} y enviar a +${customerPhone}`;
    registerOrder(total, 'cardnet');
    window.open(`https://wa.me/18099038707?text=${encodeURIComponent(msg)}`, '_blank');
    showCheckoutConfirmation(total, 'cardnet', name);
    return;
  }

  if (paymentMethod === 'paypal') {
    const usd = Math.ceil(total / 59);
    const msg = `🌐 *Pedido TeloSales — PayPal*\n\n${items}\n\n💰 Total: RD$ ${total.toLocaleString()} (≈ USD $${usd})\n🅿️ PayPal: telocorpgroup@gmail.com${customerInfo}\n\n✅ El cliente enviará captura del pago`;
    registerOrder(total, 'paypal');
    window.open(`https://wa.me/18099038707?text=${encodeURIComponent(msg)}`, '_blank');
    showCheckoutConfirmation(total, 'paypal', name);
    return;
  }

  // WhatsApp (transferencia, depósito, efectivo)
  const msg = `🛒 *Nuevo Pedido TeloSales*\n\n${items}\n\n💰 *Total: RD$ ${total.toLocaleString()}*${shipping ? '\n🚚 Envío: RD$ ' + shipping : '\n🚚 Envío: Gratis'}${discount ? '\n🎟️ Descuento: -RD$ ' + discount.toLocaleString() : ''}${customerInfo}\n\n💳 Método: Transferencia / Depósito / Efectivo`;
  registerOrder(total, 'whatsapp');
  window.open(`https://wa.me/18099038707?text=${encodeURIComponent(msg)}`, '_blank');
  showCheckoutConfirmation(total, 'whatsapp', name);
}

// Mostrar confirmación visual post-checkout
function showCheckoutConfirmation(total, method, name) {
  const methodLabels = { cardnet: '💳 Link de pago CardNET (recibirás por WhatsApp)', paypal: '🌐 PayPal (envía a telocorpgroup@gmail.com)', whatsapp: '💬 Transferencia / Depósito (datos en WhatsApp)' };
  const cartBody = document.getElementById('cart-items');
  cartBody.innerHTML = `
    <div class="checkout-confirmation">
      <div class="checkout-confirmation__icon">✅</div>
      <h3>¡Pedido confirmado!</h3>
      <p>Gracias, <strong>${name}</strong>. Tu pedido por <strong>RD$ ${total.toLocaleString()}</strong> fue registrado.</p>
      <div class="checkout-confirmation__method">${methodLabels[method]}</div>
      <div class="checkout-confirmation__steps">
        <div class="conf-step"><span class="conf-step__num">1</span><span>Pedido registrado ✓</span></div>
        <div class="conf-step"><span class="conf-step__num">2</span><span>${method === 'cardnet' ? 'Recibirás link de pago en WhatsApp' : 'Coordina pago por WhatsApp'}</span></div>
        <div class="conf-step"><span class="conf-step__num">3</span><span>Preparamos y enviamos (24-48h)</span></div>
      </div>
      <button class="btn btn--primary btn--full" onclick="toggleCartDrawer(false); switchView('sales');">Seguir comprando</button>
    </div>`;
  showToast('¡Pedido confirmado! 🎉');
}

function registerOrder(total, paymentMethod) {
  const orderPayload = { items: State.cart.map(i => { const p = products.find(x => x.id === i.id); return { id: i.id, title: p?.title, qty: i.qty, price: p?.price }; }), total, payment_method: paymentMethod, customer: State.userProfile, status: 'pending', created_at: new Date().toISOString() };
  BackendService.supabaseQuery('orders', 'POST', orderPayload);
  // Notificación interna al admin (WhatsApp oculto) sobre nueva orden
  BackendService.notifyAdmin('order', {
    total, payment_method: paymentMethod,
    items_count: State.cart.length,
    customer: State.userProfile
  });
  State.cart.forEach(item => {
    const p = products.find(x => x.id === item.id);
    if (p) { p.stock = Math.max(0, (p.stock || 0) - item.qty); p.sold = (p.sold || 0) + item.qty; BackendService.supabaseQuery(`products?id=eq.${item.id}`, 'PATCH', { stock: p.stock, sold: p.sold }); }
  });
  State.cart = []; State.coupon = null; State.save(); updateCartBadge(); toggleCartDrawer(false);
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
    return `<div class="cart-item" style="cursor:pointer" onclick="openProductModal('${id}')"><div class="cart-item__img"><img src="${cdnImage(p.image, 100)}" alt="${p.title}"></div><div class="cart-item__info"><div class="cart-item__title">${p.title}</div><div class="cart-item__price">RD$ ${p.price.toLocaleString()}</div></div></div>`;
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
    const quizCount = (c.quiz && c.quiz.length) || 0;
    return `
    <article class="course-card" data-course="${c.id}" tabindex="0" role="button">
      <div class="course-card__top"><span class="course-card__icon">${c.icon}</span><span class="course-card__level">${c.level}</span></div>
      <h4 class="course-card__title">${c.title}</h4>
      <p class="course-card__instructor">👨‍🏫 ${c.instructor}</p>
      <div class="course-card__stats">
        <span>★ ${c.rating}</span>
        <span>👥 ${c.students.toLocaleString()}</span>
        <span>${c.lessons.length} clases · ${c.duration}</span>
      </div>
      <div class="course-card__meta">
        ${quizCount ? `<span class="course-card__badge-sm">📝 ${quizCount} preguntas quiz</span>` : ''}
        <span class="course-card__badge-sm">🏆 Certificado</span>
      </div>
      ${pct > 0 ? `<div class="course-card__progress"><div class="progress-bar progress-bar--sm"><div class="progress-bar__fill" style="width:${pct}%"></div></div><small>${pct}% completado · ${done}/${c.lessons.length} clases</small></div>` : '<span class="course-card__cta">Comenzar curso →</span>'}
    </article>`;
  }).join('');
  grid.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', () => openClassroom(card.dataset.course));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openClassroom(card.dataset.course); });
  });
  updateEducaStats();
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

const llevaZones = {};
let gmapInstance = null, gmapDirectionsService = null, gmapDirectionsRenderer = null;

// Google Maps — LAZY LOAD on demand (perf: ahorra ~200-500KB en carga inicial)
let _mapsLoading = false;
function loadGoogleMaps() {
  if (window.google || _mapsLoading) return;
  _mapsLoading = true;
  // Fallback: si no carga en 8s, mostrar mensaje
  window._mapsTimeout = setTimeout(() => {
    const el = document.getElementById('gmap');
    if (el && !window.google) {
      el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:8px;color:#94a3b8;padding:20px;text-align:center;"><p style="font-size:0.9rem;">⚠️ Google Maps no pudo cargar.</p><p style="font-size:0.75rem;">Usa el formulario manual o contáctanos por WhatsApp.</p></div>';
    }
  }, 8000);
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB6Fw9dciFlipwPONefQbbUB0tJBDWibFc&libraries=places&callback=initGoogleMaps';
  document.head.appendChild(s);
}

// Google Maps Initialization (called by Maps API callback)
window.initGoogleMaps = function() {
  const mapDiv = document.getElementById('gmap');
  if (!mapDiv) {
    // Si el DOM aún no está listo, reintenta
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.initGoogleMaps());
      return;
    }
    return;
  }

  gmapInstance = new google.maps.Map(mapDiv, {
    center: { lat: 18.486, lng: -69.931 },
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#212121' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3e50' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a252f' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1929' }] },
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
    ]
  });

  gmapDirectionsService = new google.maps.DirectionsService();
  gmapDirectionsRenderer = new google.maps.DirectionsRenderer({
    map: gmapInstance,
    suppressMarkers: false,
    polylineOptions: { strokeColor: '#f59e0b', strokeWeight: 5, strokeOpacity: 0.9 }
  });

  // Places Autocomplete
  const originInput = document.getElementById('lleva-origin-input');
  const destInput = document.getElementById('lleva-dest-input');

  if (originInput && google.maps.places) {
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(17.5, -72.0),
      new google.maps.LatLng(20.0, -68.0)
    );

    const originAC = new google.maps.places.Autocomplete(originInput, {
      bounds: bounds,
      componentRestrictions: { country: 'do' },
      fields: ['geometry', 'formatted_address', 'name']
    });

    const destAC = new google.maps.places.Autocomplete(destInput, {
      bounds: bounds,
      componentRestrictions: { country: 'do' },
      fields: ['geometry', 'formatted_address', 'name']
    });

    originAC.addListener('place_changed', () => {
      const place = originAC.getPlace();
      if (place && place.geometry) {
        document.getElementById('lleva-origin-lat').value = place.geometry.location.lat();
        document.getElementById('lleva-origin-lng').value = place.geometry.location.lng();
        calculateLlevaRoute();
      }
    });

    destAC.addListener('place_changed', () => {
      const place = destAC.getPlace();
      if (place && place.geometry) {
        document.getElementById('lleva-dest-lat').value = place.geometry.location.lat();
        document.getElementById('lleva-dest-lng').value = place.geometry.location.lng();
        calculateLlevaRoute();
      }
    });
  }

  console.log('[Maps] Google Maps initialized successfully');
  if (window._mapsTimeout) clearTimeout(window._mapsTimeout);
};

function calculateLlevaRoute() {
  const oLat = parseFloat(document.getElementById('lleva-origin-lat').value);
  const oLng = parseFloat(document.getElementById('lleva-origin-lng').value);
  const dLat = parseFloat(document.getElementById('lleva-dest-lat').value);
  const dLng = parseFloat(document.getElementById('lleva-dest-lng').value);
  if (!oLat || !oLng || !dLat || !dLng) return;
  if (!gmapDirectionsService) { showToast('Mapa cargando, intenta de nuevo en un momento', 'error'); return; }

  gmapDirectionsService.route({
    origin: { lat: oLat, lng: oLng },
    destination: { lat: dLat, lng: dLng },
    travelMode: google.maps.TravelMode.DRIVING
  }, (result, status) => {
    if (status === 'OK' && result.routes[0]) {
      gmapDirectionsRenderer.setDirections(result);
      const leg = result.routes[0].legs[0];
      const distKm = leg.distance.value / 1000;
      document.getElementById('lleva-distance').textContent = leg.distance.text;
      document.getElementById('lleva-eta-est').textContent = leg.duration.text;
      // Calculate price based on distance + vehicle
      const vehicle = document.querySelector('.vehicle-option.active')?.dataset.vehicle || 'moto';
      const basePrice = { moto: 120, car: 250, cargo: 600 };
      const pricePerKm = { moto: 20, car: 30, cargo: 50 };
      const price = Math.round(basePrice[vehicle] + distKm * pricePerKm[vehicle]);
      document.getElementById('lleva-fare-label').textContent = `RD$ ${price}`;
      document.getElementById('lleva-fare').value = price;
    } else {
      console.warn('[Maps] Directions failed:', status);
      showToast('No se pudo calcular la ruta. Verifica las direcciones.', 'error');
    }
  });
}

function updateLlevaPrice() { calculateLlevaRoute(); }

function startLlevaRequest() {
  const originInput = document.getElementById('lleva-origin-input');
  const destInput = document.getElementById('lleva-dest-input');
  // Validación de campos requeridos
  const item = document.getElementById('lleva-item').value.trim();
  const vehicle = document.querySelector('.vehicle-option.active')?.dataset.vehicle;
  const fare = parseInt(document.getElementById('lleva-fare').value);
  if (!originInput?.value.trim()) return showToast('Indica el punto de recogida', 'error');
  if (!destInput?.value.trim()) return showToast('Indica el punto de entrega', 'error');
  if (!item) return showToast('Describe qué vas a enviar', 'error');
  if (!fare || fare < 100) return showToast('La tarifa debe ser de al menos RD$ 100', 'error');

  const payload = {
    origin: originInput.value.trim(),
    dest: destInput.value.trim(),
    item,
    details: document.getElementById('lleva-details').value,
    vehicle,
    fare,
    schedule: document.getElementById('lleva-schedule').value,
    origin_lat: parseFloat(document.getElementById('lleva-origin-lat').value) || null,
    origin_lng: parseFloat(document.getElementById('lleva-origin-lng').value) || null,
    dest_lat: parseFloat(document.getElementById('lleva-dest-lat').value) || null,
    dest_lng: parseFloat(document.getElementById('lleva-dest-lng').value) || null,
    customer: State.userProfile,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  BackendService.supabaseQuery('lleva_requests', 'POST', payload);
  // Notificación interna al admin (WhatsApp oculto) — permite contactar conductor
  BackendService.notifyAdmin('lleva', {
    origin: payload.origin, dest: payload.dest, item, vehicle,
    fare, customer: State.userProfile
  });
  // Buscar conductores reales disponibles (reemplaza simulación)
  document.getElementById('lleva-form-card').hidden = true;
  document.getElementById('lleva-offers-card').hidden = false;
  loadRealDrivers(payload);
}

// Carga conductores reales desde la DB (tabla drivers). Fallback a demo si vacío.
async function loadRealDrivers(reqPayload) {
  const list = document.getElementById('lleva-offers-list');
  list.innerHTML = '<p class="text-muted">Buscando mensajeros disponibles...</p>';
  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/drivers?select=*&status=eq.available&order=rating.desc&limit=5`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    const drivers = res.ok ? await res.json() : [];
    if (drivers && drivers.length) {
      // Conductores reales: ofrecen tarifa cerca de la solicitada
      const offers = drivers.map((d, i) => ({
        id: d.id, name: d.name, rating: d.rating || 5,
        phone: d.phone || '',
        fare: Math.round(reqPayload.fare * (1 - (i * 0.03))), // pequeños descuentos competitivos
        eta: 5 + i * 3, avatar: d.avatar || '🏍️'
      }));
      renderDriverOffers(offers);
    } else {
      // Fallback: conductores demo transparente (hasta que el admin registre conductores)
      const demo = ['José M.', 'Carlos R.', 'María P.'].map((name, i) => ({
        id: 'demo-' + i, name, rating: (4.6 + i * 0.1).toFixed(1),
        phone: '', fare: Math.max(150, Math.round(reqPayload.fare * (1 - i * 0.05))), eta: 5 + i * 3, avatar: '🏍️'
      }));
      renderDriverOffers(demo);
      setTimeout(() => showToast('Conductores de prueba — el admin puede registrar conductores reales'), 2000);
    }
  } catch (e) {
    list.innerHTML = '<p class="text-muted">No se pudo conectar. <button class="btn btn--primary btn--sm" onclick="startLlevaRequest()">Reintentar</button></p>';
  }
}

function renderDriverOffers(offers) {
  const list = document.getElementById('lleva-offers-list');
  list.innerHTML = offers.map(o => `
    <div class="offer-item">
      <div class="offer-item__driver"><div class="offer-item__avatar">${o.avatar}</div><div><strong>${o.name}</strong><br><small>★ ${o.rating} · ${o.eta} min</small></div></div>
      <div><strong style="color:var(--c-lleva)">RD$ ${o.fare}</strong><br><button class="btn btn--primary btn--sm" onclick="acceptLlevaOffer('${o.id}','${o.name.replace(/'/g,"")}', ${o.fare}, '${o.phone}')">Aceptar</button></div>
    </div>`).join('');
}

let llevaTrackingTimer = null;
function acceptLlevaOffer(driverId, name, fare, phone) {
  document.getElementById('lleva-offers-card').hidden = true;
  document.getElementById('lleva-status-card').hidden = false;
  const rating = (4.6 + Math.random() * 0.4).toFixed(1);
  const plate = `${['A','B','C'][Math.floor(Math.random()*3)]}${Math.floor(Math.random()*900+100)}${['XYZ','ABC','TLC'][Math.floor(Math.random()*3)]}`;

  document.getElementById('lleva-trip-info').innerHTML = `
    <div class="trip-driver">
      <div class="offer-item__avatar">🏍️</div>
      <div class="trip-driver__info"><strong>${name}</strong><small>★ ${rating} · Placa ${plate}${phone ? ' · ' + phone : ''}</small></div>
      <div class="trip-eta"><span id="lleva-eta-num">8</span><small>min</small></div>
    </div>
    ${phone ? `<a href="https://wa.me/${phone.replace(/\D/g,'')}" target="_blank" class="btn btn--primary btn--sm" style="margin:8px 0">💬 Contactar conductor</a>` : ''}
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

const reparaPrices = { phone: { screen: 1500, battery: 800, power: 2000, water: 2500, system: 1000, port: 900, speaker: 1200, camera: 1800, network: 700, overheating: 1500, other: 1500 }, laptop: { screen: 3500, battery: 2000, power: 4000, water: 5000, system: 1500, port: 1200, speaker: 1000, camera: 800, network: 900, overheating: 2000, other: 2000 }, tablet: { screen: 2000, battery: 1200, power: 2500, water: 3000, system: 1200, port: 1000, speaker: 900, camera: 1500, network: 700, overheating: 1500, other: 1500 }, tv: { screen: 8000, battery: 0, power: 3000, water: 5000, system: 2000, port: 1500, speaker: 2500, camera: 0, network: 1200, overheating: 2000, other: 2500 }, console: { screen: 0, battery: 0, power: 3500, water: 4000, system: 2500, port: 1500, speaker: 1200, camera: 0, network: 1800, overheating: 2500, other: 2000 }, printer: { screen: 0, battery: 0, power: 2000, water: 3000, system: 1500, port: 1000, speaker: 0, camera: 0, network: 1200, overheating: 1000, other: 1500 }, appliance: { screen: 0, battery: 0, power: 2500, water: 3000, system: 1500, port: 0, speaker: 0, camera: 0, network: 0, overheating: 2000, other: 2000 }, inverter: { screen: 0, battery: 4500, power: 3500, water: 5000, system: 3000, port: 0, speaker: 0, camera: 0, network: 0, overheating: 2500, other: 3000 }, ac: { screen: 0, battery: 0, power: 3000, water: 4000, system: 2500, port: 0, speaker: 0, camera: 0, network: 0, overheating: 3000, other: 2500 } };
const reparaTimes = { screen: '24-48h', battery: '2-4h', power: '48-72h', water: '72h', system: '2-4h', port: '2-4h', speaker: '24h', camera: '24-48h', network: '1-2h', overheating: '24-48h', other: '48h' };

function updateReparaQuote() {
  const device = document.getElementById('repara-device').value;
  const issue = document.getElementById('repara-issue').value;
  const price = reparaPrices[device]?.[issue] || 1500;
  document.getElementById('repara-price').textContent = `RD$ ${price.toLocaleString()}`;
  document.getElementById('repara-time').textContent = reparaTimes[issue] || '24-48h';
}

let reparaTimer = null;
function bookRepara() {
  const device = document.getElementById('repara-device').value;
  const issue = document.getElementById('repara-issue').value;
  const address = document.getElementById('repara-address').value.trim();
  const contact = document.getElementById('repara-contact').value.trim();
  if (!address) return showToast('Indica la dirección de recogida', 'error');
  if (!contact) return showToast('Indica un teléfono/WhatsApp de contacto', 'error');

  const ticket = `RP-${Date.now().toString().slice(-6)}`;
  const payload = {
    device, issue,
    brand: document.getElementById('repara-brand').value,
    description: document.getElementById('repara-desc').value,
    address, contact, ticket,
    customer: State.userProfile,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  BackendService.supabaseQuery('repara_bookings', 'POST', payload);
  BackendService.notifyAdmin('repara', {
    device, issue, address, contact, ticket,
    customer: State.userProfile
  });

  // Show real tracker that matches DB statuses
  document.getElementById('repara-tracker').hidden = false;
  renderReparaTracker('pending', ticket);
  showToast('Reparación reservada · Ticket ' + ticket);

  // Simulate progression for UX (admin changes real status in DB)
  let step = 0;
  clearInterval(reparaTimer);
  reparaTimer = setInterval(() => {
    step++;
    const statuses = ['pending', 'in_progress', 'in_progress', 'completed'];
    if (step < statuses.length) {
      renderReparaTracker(statuses[step], ticket);
      if (step === 1) showToast('📱 Tu dispositivo fue recogido');
      if (step === 2) showToast('🔧 Técnico diagnosticando...');
      if (step >= 3) { clearInterval(reparaTimer); showToast('✅ ¡Reparación finalizada!'); }
    }
  }, 4000);
}

function renderReparaTracker(currentStatus, ticket) {
  const steps = [
    { key: 'pending', title: 'Servicio Solicitado', desc: `Ticket ${ticket} registrado`, icon: '📋' },
    { key: 'pickup', title: 'Recogida Programada', desc: 'Mensajero en camino a domicilio', icon: '🚗' },
    { key: 'in_progress', title: 'En Diagnóstico y Reparación', desc: 'Técnico certificado trabajando', icon: '🔧' },
    { key: 'completed', title: 'Reparación Completada', desc: 'Pruebas de calidad superadas ✓', icon: '✅' }
  ];
  const statusOrder = ['pending', 'pickup', 'in_progress', 'completed'];
  const currentIdx = Math.max(0, statusOrder.indexOf(currentStatus));

  document.getElementById('repara-steps').innerHTML = steps.map((s, i) => `
    <div class="tracker-step ${i <= currentIdx ? 'active' : ''} ${i === currentIdx ? 'current' : ''}">
      <div class="tracker-step__num">${i < currentIdx ? '✓' : s.icon}</div>
      <div>
        <strong>${s.title}</strong>
        <small>${s.desc}</small>
      </div>
    </div>`).join('') + `
    <div class="repara-warranty">
      <span>🛡️ Garantía 90 días incluida</span>
      <span>🔧 Técnico certificado</span>
      <span>📞 Soporte post-servicio</span>
    </div>`;
}

const instalaPrices = { tv: 1200, ac: 4500, 'ac-maint': 2000, smart: 2800, network: 3500, lock: 2000, camera: 5500, electrical: 1500, plumbing: 1800, antenna: 1200, solar: 25000, furniture: 1500 };
const instalaNames = { tv: 'Montaje de TV en Pared', ac: 'Instalación Aire Acondicionado', 'ac-maint': 'Mantenimiento de AC', smart: 'Domótica / Smart Home', network: 'Cableado y Wifi Mesh', lock: 'Cerradura Inteligente', camera: 'Cámaras de Seguridad', electrical: 'Instalación Eléctrica', plumbing: 'Plomería y Grifería', antenna: 'Antena Satelital', solar: 'Paneles Solares', furniture: 'Ensamblaje de Muebles' };
// Rangos de precios sugeridos (min/max) — se sobreescriben con datos reales de la DB
let instalaPriceRanges = {}; // { tv: {min:700, max:1500}, ... }

// Sincroniza precios reales desde services_catalog (Supabase) al cargar la página.
// Sobreescribe los arrays hardcodeados si la DB tiene datos (admin puede editar precios).
async function syncServicesFromSupabase() {
  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/services_catalog?select=*&active=eq.true&order=sort_order.asc`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.length) return;

    data.forEach(s => {
      if (s.service === 'instala' && s.key && s.key !== 'new') {
        instalaPrices[s.key] = s.price;
        if (s.name) instalaNames[s.key] = s.name;
        if (s.price_min || s.price_max) {
          instalaPriceRanges[s.key] = { min: s.price_min || 0, max: s.price_max || 0 };
        }
      }
      // TeloRepara: actualizar precios por key de falla (todos los dispositivos comparten el catálogo)
      if (s.service === 'repara' && s.key && s.key !== 'new') {
        Object.keys(reparaPrices).forEach(device => {
          if (reparaPrices[device] && s.key in reparaPrices[device] && s.price > 0) {
            reparaPrices[device][s.key] = s.price;
          }
        });
      }
    });
    console.log(`[Services] Synced ${data.length} services from Supabase (instala + repara prices updated)`);
  } catch (e) { /* fallback a precios hardcodeados */ }
}

function updateInstalaPrice() {
  const service = document.getElementById('instala-service').value;
  const price = instalaPrices[service] || 1200;
  const range = instalaPriceRanges[service];
  let text = `RD$ ${price.toLocaleString()}`;
  // Mostrar rango sugerido si el admin lo configuró (min/max)
  if (range && range.min && range.max && range.max > range.min) {
    text += ` <small style="color:var(--c-text-dim)">(rango: RD$ ${range.min.toLocaleString()} – ${range.max.toLocaleString()})</small>`;
  }
  document.getElementById('instala-price').innerHTML = text;
}

function bookInstala() {
  const service = document.getElementById('instala-service').value;
  const tech = document.querySelector('.tech-card.active')?.dataset.tech || 'ramon';
  const techName = document.querySelector('.tech-card.active strong')?.textContent || tech;
  const date = document.getElementById('instala-date').value;
  const time = document.getElementById('instala-time').value;
  const address = document.getElementById('instala-address').value.trim();
  if (!date) return showToast('Selecciona una fecha', 'error');
  if (!address) return showToast('Indica la dirección', 'error');

  const timeLabels = { am: 'Mañana (8:00 - 12:00)', pm: 'Tarde (2:00 - 6:00)', evening: 'Noche (6:00 - 9:00 PM)' };
  const payload = {
    service: instalaNames[service],
    date,
    time,
    tech,
    price: instalaPrices[service],
    address,
    notes: document.getElementById('instala-notes').value,
    customer: State.userProfile,
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  BackendService.supabaseQuery('instala_bookings', 'POST', payload);
  BackendService.notifyAdmin('instala', {
    service: instalaNames[service], date, time, tech,
    price: instalaPrices[service], address,
    customer: State.userProfile
  });

  document.getElementById('instala-confirmation').hidden = false;
  document.getElementById('instala-details').innerHTML = `
    <div class="instala-confirm-summary">
      <div class="instala-confirm__header">
        <span class="instala-confirm__icon">✅</span>
        <h4>Instalación Agendada</h4>
      </div>
      <div class="instala-confirm__grid">
        <div class="instala-confirm__item"><span class="instala-confirm__label">Servicio</span><span>${instalaNames[service]}</span></div>
        <div class="instala-confirm__item"><span class="instala-confirm__label">Fecha</span><span>${new Date(date + 'T12:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
        <div class="instala-confirm__item"><span class="instala-confirm__label">Horario</span><span>${timeLabels[time] || time}</span></div>
        <div class="instala-confirm__item"><span class="instala-confirm__label">Técnico</span><span>${techName}</span></div>
        <div class="instala-confirm__item"><span class="instala-confirm__label">Dirección</span><span>${address}</span></div>
        <div class="instala-confirm__item instala-confirm__total"><span class="instala-confirm__label">Total</span><span>RD$ ${instalaPrices[service].toLocaleString()}</span></div>
      </div>
      <div class="instala-confirm__timeline">
        <div class="instala-timeline-step active"><span>1</span> Cita confirmada</div>
        <div class="instala-timeline-step"><span>2</span> Técnico en camino</div>
        <div class="instala-timeline-step"><span>3</span> Servicio en progreso</div>
        <div class="instala-timeline-step"><span>4</span> Completado</div>
      </div>
      <div class="instala-confirm__actions">
        <a href="https://wa.me/18099038707?text=${encodeURIComponent(`Hola, tengo una cita de ${instalaNames[service]} el ${date}. ¿Pueden confirmar?`)}" target="_blank" class="btn btn--whatsapp btn--sm">💬 Contactar Soporte</a>
        <button class="btn btn--ghost btn--sm" onclick="document.getElementById('instala-confirmation').hidden=true; showToast('Puedes agendar otra instalación')">+ Nuevo Servicio</button>
      </div>
    </div>`;
  showToast('Instalación agendada ✓');
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
  // Upsert to customers table (creates member record)
  BackendService.supabaseQuery('customers', 'POST', { ...State.userProfile, updated_at: new Date().toISOString() });
  // Cargar historial de servicios del usuario desde Supabase
  loadUserHistory();
  showToast('Perfil guardado — Eres miembro de TeloCorp ✓');
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
  const fab = document.getElementById('chat-fab');
  if (!widget || !fab) return;
  const isOpen = widget.style.display !== 'none';
  const shouldShow = show !== undefined ? show : !isOpen;
  widget.style.display = shouldShow ? 'flex' : 'none';
  fab.style.display = shouldShow ? 'none' : 'flex';
  if (shouldShow && document.getElementById('chat-messages').children.length === 0) {
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
  // Respect admin config — chatbot disabled
  if (!siteConfig.chatbot_enabled) {
    showToast('El asistente IA está temporalmente desactivado. Contacta por WhatsApp.', 'error');
    return;
  }
  input.value = '';
  appendChatMessage('user', message);
  appendChatMessage('bot', '...');

  // RAG: construir contexto del catálogo para que el asistente conozca los productos
  const topProducts = products.slice(0, 15).map(p => `${p.title} (RD$${p.price}, ${p.category})`).join('; ');
  const cartContext = State.cart.length ? `El cliente tiene ${State.cart.length} items en el carrito.` : '';
  const adminContext = siteConfig.chatbot_context || '';
  const catalogContext = `Catálogo actual (${products.length} productos): ${topProducts}. Categorías: Covers, Cables y Carga, Audio, Equipamiento. Envío gratis en compras +RD$${siteConfig.free_shipping_threshold}. Aceptamos: CardNET (link de pago), Transferencia, PayPal. Teléfono: +1(809)903-8707. ${cartContext} ${adminContext}`;

  const response = await BackendService.geminiChat(message, catalogContext);
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
  // Validación básica
  if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
    return showToast('Completa todos los campos requeridos', 'error');
  }
  // Web3Forms espera FormData (no JSON)
  try {
    const fd = new FormData(form);
    await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
  } catch (err) { /* fallback silencioso a Supabase */ }
  // Persistir en Supabase (leads)
  await BackendService.supabaseQuery('leads', 'POST', {
    name: data.name, email: data.email, department: data.department, message: data.message
  });
  form.reset();
  showToast('Mensaje enviado correctamente ✓');
}

// ═══════════════════════════════════════════════════════════════
// IMAGE ZOOM (Hover-based zoom like Amazon)
// ═══════════════════════════════════════════════════════════════

function openImageZoom(src) {
  // No-op: zoom is now handled via CSS hover on the container
}

// Add hover-zoom behavior to product modal images when they load
function initProductImageZoom() {
  const container = document.querySelector('.product-detail__main-img');
  if (!container) return;
  container.addEventListener('mousemove', (e) => {
    const img = container.querySelector('img');
    if (!img) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(2.5)';
  });
  container.addEventListener('mouseleave', () => {
    const img = container.querySelector('img');
    if (img) { img.style.transform = 'scale(1)'; img.style.transformOrigin = 'center'; }
  });
  // Touch support
  container.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const img = container.querySelector('img');
    if (!img) return;
    const rect = container.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(2.5)';
  }, { passive: true });
  container.addEventListener('touchend', () => {
    const img = container.querySelector('img');
    if (img) { img.style.transform = 'scale(1)'; }
  });
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
  document.getElementById('chat-fab').addEventListener('click', () => toggleChat(true));
  document.getElementById('btn-open-chat')?.addEventListener('click', () => { toggleChat(true); });
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
  document.querySelectorAll('.vehicle-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.vehicle-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      calculateLlevaRoute();
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
  document.getElementById('partner-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('partner-name').value.trim();
    const email = document.getElementById('partner-email').value.trim();
    const type = document.getElementById('partner-type').value;
    const proposal = document.getElementById('partner-proposal').value.trim();
    if (!name || !email || !proposal) return showToast('Completa todos los campos', 'error');
    await BackendService.supabaseQuery('leads', 'POST', { name, email, department: 'partner', message: `[${type}] ${proposal}` });
    e.target.reset();
    showToast('Propuesta enviada exitosamente ✓');
  });

  // Initial renders
  renderProducts();
  renderCourses();
  updateCartBadge();
  updateWishlistBadge();
  loadProfile();
  updateReparaQuote();
  updateInstalaPrice();
  updateEducaProgress();

  // Sync products and courses from Supabase (updates store in background)
  syncProductsFromSupabase();
  syncCoursesFromSupabase();
  syncServicesFromSupabase();
  syncSiteSettings();
  loadUserHistory();

  // Set default install date
  const dateInput = document.getElementById('instala-date');
  if (dateInput) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); dateInput.value = tomorrow.toISOString().split('T')[0]; }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// ═══════════════════════════════════════════════════════════════
// TELOSALES QUICK WINS — Conversion & Growth Optimizations
// ═══════════════════════════════════════════════════════════════

// ─── Recently Viewed ───
const MAX_RECENTLY_VIEWED = 8;

function trackRecentlyViewed(productId) {
  let rv = JSON.parse(localStorage.getItem('telo_recentlyViewed') || '[]');
  rv = rv.filter(id => id !== productId);
  rv.unshift(productId);
  rv = rv.slice(0, MAX_RECENTLY_VIEWED);
  localStorage.setItem('telo_recentlyViewed', JSON.stringify(rv));
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  const rv = JSON.parse(localStorage.getItem('telo_recentlyViewed') || '[]');
  const container = document.getElementById('recently-viewed');
  const grid = document.getElementById('recently-viewed-grid');
  if (!container || !grid || rv.length === 0) { if (container) container.hidden = true; return; }
  const items = rv.map(id => products.find(p => p.id === id)).filter(Boolean);
  if (items.length === 0) { container.hidden = true; return; }
  container.hidden = false;
  grid.innerHTML = items.map(p => `
    <div class="rv-card" onclick="openProductModal('${p.id}')">
      <img src="${cdnImage(p.image, 200)}" alt="${p.title}" loading="lazy">
      <div class="rv-card__title">${p.title}</div>
      <div class="rv-card__price">RD$ ${p.price.toLocaleString()}</div>
    </div>`).join('');
}

// Patch openProductModal to track views
const _originalOpenProductModal = openProductModal;
openProductModal = function(id) {
  trackRecentlyViewed(id);
  trackGA4Event('view_item', id);
  _originalOpenProductModal(id);
};

// ─── Advanced Filters ───
let filterPriceMin = 0;
let filterPriceMax = Infinity;
let filterMinRating = 0;

function applyPriceFilter() {
  const min = parseInt(document.getElementById('filter-price-min').value) || 0;
  const max = parseInt(document.getElementById('filter-price-max').value) || Infinity;
  filterPriceMin = min;
  filterPriceMax = max;
  renderProducts();
}

function setRatingFilter(minRating) {
  filterMinRating = minRating;
  document.querySelectorAll('.rating-filter .chip').forEach(c => c.classList.remove('active'));
  document.querySelector(`.rating-filter [data-min-rating="${minRating}"]`)?.classList.add('active');
  renderProducts();
}

// Patch renderProducts to include new filters + product counter + sort by best-sellers
const _originalRenderProducts = renderProducts;
renderProducts = function() {
  const grid = document.getElementById('products-grid');
  const freeShippingOnly = document.getElementById('filter-free-shipping')?.checked || false;

  let filtered = products.filter(p =>
    (currentFilter === 'all' || p.category === currentFilter) &&
    (searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (p.price >= filterPriceMin && p.price <= filterPriceMax) &&
    (p.rating >= filterMinRating) &&
    (!freeShippingOnly || p.freeShipping)
  );

  if (currentSort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (currentSort === 'rating-desc') filtered.sort((a, b) => b.rating - a.rating);
  else if (currentSort === 'best-sellers') filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  // Product counter
  const counter = document.getElementById('products-counter');
  if (counter) counter.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-state">No se encontraron productos. Prueba con otra búsqueda o categoría.</p>';
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const urgency = p.stock <= 5 ? `<div class="product-card__stock product-card__stock--urgent">🔥 ¡Solo ${p.stock} en stock!</div>` :
                    p.stock <= 8 ? `<div class="product-card__stock">¡Últimas ${p.stock} unidades!</div>` : '';
    const socialProofText = p.sold > 100 ? `<div class="product-card__social">${p.sold}+ vendidos</div>` : '';
    return `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.title}">
      <div class="product-card__image">
        ${p.badge ? `<span class="product-badge ${p.discount ? 'product-badge--sale' : ''}">${p.badge}</span>` : ''}
        <button class="product-card__wish ${State.wishlist.includes(p.id) ? 'active' : ''}" data-wish="${p.id}" aria-label="Favorito" title="Añadir a favoritos">${State.wishlist.includes(p.id) ? '❤️' : '🤍'}</button>
        <img src="${cdnImage(p.image)}" alt="${p.title}" loading="lazy" decoding="async" width="400" height="400">
        ${p.freeShipping ? '<span class="product-card__shipping">🚚 Envío gratis</span>' : ''}
      </div>
      <div class="product-card__body">
        <h4 class="product-card__title">${p.title}</h4>
        <div class="product-card__rating">★ ${p.rating} · ${(p.sold || 0).toLocaleString()} vendidos</div>
        <div class="product-card__pricing">
          ${p.compareAtPrice ? `<span class="product-card__compare">RD$ ${p.compareAtPrice.toLocaleString()}</span>` : ''}
          <span class="product-card__price">RD$ ${p.price.toLocaleString()}</span>
        </div>
        ${urgency}
        ${socialProofText}
        <button class="btn btn--primary btn--sm product-card__add" data-add="${p.id}">Agregar al carrito</button>
      </div>
    </article>`;
  }).join('');

  // Re-bind events
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-add]') || e.target.closest('[data-wish]')) return;
      openProductModal(card.dataset.id);
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === card) openProductModal(card.dataset.id); });
  });
  grid.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); quickAddToCart(btn.dataset.add); }));
  grid.querySelectorAll('[data-wish]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); toggleWishlist(btn.dataset.wish); renderProducts(); }));

  renderRecentlyViewed();
};

// ─── Exit-Intent Popup ───
let exitPopupShown = false;

function initExitIntentPopup() {
  // Only show once per session and if user hasn't already subscribed
  if (sessionStorage.getItem('telo_exitPopupShown') || localStorage.getItem('telo_emailCaptured')) return;
  // Respect admin config
  if (!siteConfig.exit_popup_enabled) return;

  document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 10 && !exitPopupShown) {
      showExitPopup();
    }
  });

  // Mobile: show after 45 seconds of inactivity without purchase
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      if (!exitPopupShown && State.cart.length === 0) showExitPopup();
    }, 45000);
  }
}

function showExitPopup() {
  if (exitPopupShown || localStorage.getItem('telo_emailCaptured')) return;
  exitPopupShown = true;
  sessionStorage.setItem('telo_exitPopupShown', '1');
  const popup = document.getElementById('exit-popup');
  const overlay = document.getElementById('exit-popup-overlay');
  if (popup && overlay) { popup.hidden = false; overlay.hidden = false; }
}

function closeExitPopup() {
  const popup = document.getElementById('exit-popup');
  const overlay = document.getElementById('exit-popup-overlay');
  if (popup) popup.hidden = true;
  if (overlay) overlay.hidden = true;
}

function captureEmail(e) {
  e.preventDefault();
  const email = document.getElementById('popup-email').value.trim();
  const phone = document.getElementById('popup-phone').value.trim();
  if (!email) return;
  // Save lead to Supabase
  BackendService.supabaseQuery('leads', 'POST', { name: '', email, department: 'marketing', message: `[EXIT-POPUP] Phone: ${phone || 'N/A'}` });
  localStorage.setItem('telo_emailCaptured', email);
  // Add configured popup coupon to available coupons
  const code = siteConfig.popup_coupon_code || 'PRIMERA10';
  const pct = siteConfig.popup_coupon_discount || 10;
  couponCodes[code] = pct;
  closeExitPopup();
  showToast(`¡Listo! Usa el cupón ${code} en tu compra 🎉`);
  trackGA4Event('generate_lead', null, { method: 'exit_popup' });
}

// ─── Social Proof Notifications ───
function initSocialProof() {
  // Respect admin config
  if (!siteConfig.social_proof_enabled) return;

  const names = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Rosa', 'Miguel', 'Elena'];
  const cities = ['Santo Domingo', 'Santiago', 'La Romana', 'San Cristóbal', 'Puerto Plata'];

  function showSocialProof() {
    const p = products[Math.floor(Math.random() * products.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const minutes = Math.floor(Math.random() * 30) + 2;

    const el = document.createElement('div');
    el.className = 'social-proof';
    el.innerHTML = `<img class="social-proof__img" src="${cdnImage(p.image, 80)}" alt=""><div><strong>${name}</strong> de ${city} compró <em>${p.title.slice(0, 25)}...</em><br><small>Hace ${minutes} min</small></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 5000);
  }

  // Show first one after 20 seconds, then every 45-90s
  setTimeout(showSocialProof, 20000);
  setInterval(() => { if (Math.random() > 0.4) showSocialProof(); }, 60000);
}

// ─── GA4 eCommerce Event Tracking ───
function trackGA4Event(eventName, productId, extra = {}) {
  if (typeof gtag !== 'function') return;
  const p = productId ? products.find(x => x.id === productId) : null;
  const params = { ...extra };
  if (p) {
    params.currency = 'DOP';
    params.value = p.price;
    params.items = [{ item_id: p.id, item_name: p.title, item_category: p.category, price: p.price, quantity: 1 }];
  }
  gtag('event', eventName, params);
}

// Patch quickAddToCart for GA4 tracking
const _originalQuickAdd = quickAddToCart;
quickAddToCart = function(id) {
  trackGA4Event('add_to_cart', id);
  _originalQuickAdd(id);
};

// Patch checkout for GA4 tracking
const _originalCheckout = checkout;
checkout = async function() {
  if (State.cart.length > 0) {
    const total = State.cart.reduce((s, i) => { const p = products.find(x => x.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0);
    trackGA4Event('begin_checkout', null, {
      currency: 'DOP', value: total,
      items: State.cart.map(i => { const p = products.find(x => x.id === i.id); return { item_id: i.id, item_name: p?.title, price: p?.price, quantity: i.qty }; })
    });
  }
  await _originalCheckout();
};

// ─── Initialize Quick Wins on DOMContentLoaded ───
document.addEventListener('DOMContentLoaded', () => {
  initExitIntentPopup();
  initSocialProof();
  renderRecentlyViewed();
});

// ═══════════════════════════════════════════════════════════════
// SEARCH AUTOCOMPLETE — instant suggestions as you type
// ═══════════════════════════════════════════════════════════════

function initSearchAutocomplete() {
  const input = document.getElementById('sales-search');
  if (!input) return;

  // Create suggestions dropdown
  let dropdown = document.getElementById('search-suggestions');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'search-suggestions';
    dropdown.className = 'search-suggestions';
    input.parentNode.appendChild(dropdown);
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { dropdown.hidden = true; return; }
    const matches = products.filter(p => p.title.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))).slice(0, 5);
    if (matches.length === 0) { dropdown.hidden = true; return; }
    dropdown.innerHTML = matches.map(p => `
      <div class="search-suggestion" data-id="${p.id}">
        <img src="${cdnImage(p.image, 50)}" alt="">
        <div>
          <div class="search-suggestion__title">${p.title}</div>
          <div class="search-suggestion__price">RD$ ${p.price.toLocaleString()}</div>
        </div>
      </div>`).join('');
    dropdown.hidden = false;
    dropdown.querySelectorAll('.search-suggestion').forEach(s => {
      s.addEventListener('click', () => { openProductModal(s.dataset.id); dropdown.hidden = true; input.value = ''; });
    });
  });

  input.addEventListener('blur', () => { setTimeout(() => { dropdown.hidden = true; }, 200); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') dropdown.hidden = true; });
}

// ═══════════════════════════════════════════════════════════════
// SHARE PRODUCT — WhatsApp + clipboard
// ═══════════════════════════════════════════════════════════════

function shareProduct(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return;
  const url = `https://telocg.com/#telosales`;
  const text = `¡Mira esto! ${p.title} — RD$ ${p.price.toLocaleString()}${p.discount ? ` (${p.discount}% OFF)` : ''}\n${url}`;

  if (navigator.share) {
    navigator.share({ title: p.title, text: `${p.title} — RD$ ${p.price.toLocaleString()}`, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
}

function copyProductLink(productId) {
  const url = `https://telocg.com/#telosales?p=${productId}`;
  navigator.clipboard.writeText(url).then(() => showToast('Enlace copiado al portapapeles')).catch(() => showToast('No se pudo copiar', 'error'));
}

// ═══════════════════════════════════════════════════════════════
// ABANDONED CART RECOVERY — save to Supabase for follow-up
// ═══════════════════════════════════════════════════════════════

let _abandonedCartTimer = null;

function trackAbandonedCart() {
  // Save cart to Supabase after 30 seconds of inactivity (if cart has items)
  clearTimeout(_abandonedCartTimer);
  if (State.cart.length === 0) return;
  _abandonedCartTimer = setTimeout(() => {
    const email = State.userProfile.email || localStorage.getItem('telo_emailCaptured') || '';
    const phone = State.userProfile.phone || '';
    if (!email && !phone) return; // can't follow up without contact
    const subtotal = State.cart.reduce((s, i) => { const p = products.find(x => x.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0);
    BackendService.supabaseQuery('leads', 'POST', {
      name: State.userProfile.name || '',
      email: email || phone,
      department: 'abandoned_cart',
      message: JSON.stringify({ items: State.cart.map(i => { const p = products.find(x => x.id === i.id); return { title: p?.title, price: p?.price, qty: i.qty }; }), subtotal, timestamp: new Date().toISOString() })
    });
  }, 30000);
}

// ═══════════════════════════════════════════════════════════════
// COUNTDOWN TIMER — flash sale urgency for products with discount
// ═══════════════════════════════════════════════════════════════

function getFlashSaleEndTime() {
  // End of today at midnight (local time) — resets daily
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return end - now;
}

function renderCountdownBanner() {
  const el = document.getElementById('flash-sale-banner');
  if (!el) return;
  // Respect admin config
  if (!siteConfig.flash_sale_enabled) { el.hidden = true; return; }
  const discountedProducts = products.filter(p => p.discount && p.discount > 0);
  if (discountedProducts.length === 0) { el.hidden = true; return; }

  function update() {
    const remaining = getFlashSaleEndTime();
    if (remaining <= 0) { el.hidden = true; return; }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.innerHTML = `<span class="flash-banner__icon">⚡</span> <span class="flash-banner__text">OFERTAS DEL DÍA — ${discountedProducts.length} productos con descuento</span> <span class="flash-banner__timer">${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</span>`;
    el.hidden = false;
  }
  update();
  setInterval(update, 1000);
}

// ═══════════════════════════════════════════════════════════════
// DYNAMIC META TAGS — update OG/title when viewing products
// ═══════════════════════════════════════════════════════════════

function updateMetaForProduct(product) {
  if (!product) return;
  document.title = `${product.title} — RD$ ${product.price.toLocaleString()} | TeloSales`;
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
    if (el) el.setAttribute('content', content);
  };
  setMeta('og:title', `${product.title} — RD$ ${product.price.toLocaleString()}`);
  setMeta('og:description', product.description || 'Compra en TeloSales con envío express.');
  setMeta('og:image', product.image.startsWith('http') ? product.image : `https://telocg.com/${product.image}`);
  setMeta('twitter:title', `${product.title} — TeloSales`);
  setMeta('twitter:description', product.description || 'Tecnología y accesorios premium.');
}

function resetMeta() {
  document.title = "Telo' Corp Group | Plataforma Digital — Ventas, Educación, Logística y Servicios en RD";
  const setMeta = (prop, content) => {
    let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
    if (el) el.setAttribute('content', content);
  };
  setMeta('og:title', "Telo' Corp Group | Plataforma Digital");
  setMeta('og:description', 'Conglomerado digital con comercio electrónico, academia, logística y soporte técnico en República Dominicana.');
  setMeta('og:image', 'assets/telocorpgroup-logo.jpg');
}

// ═══════════════════════════════════════════════════════════════
// HASH ROUTING — Deep link to product/view from URL
// ═══════════════════════════════════════════════════════════════

function handleHashRouting() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  // Check for product deep link: #telosales?p=ts-101
  if (hash.includes('telosales') && hash.includes('p=')) {
    const match = hash.match(/p=([^&]+)/);
    if (match) {
      const productId = match[1];
      switchView('sales');
      setTimeout(() => openProductModal(productId), 300);
      return;
    }
  }

  // Check for view: #sales, #educa, etc.
  const validViews = ['home', 'sales', 'educa', 'classroom', 'lleva', 'repara', 'instala', 'about', 'support', 'profile'];
  const viewId = hash.split('?')[0];
  if (validViews.includes(viewId)) {
    switchView(viewId);
  }
}

// ═══════════════════════════════════════════════════════════════
// INIT ENHANCEMENTS — bind everything on DOM ready
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initSearchAutocomplete();
  renderCountdownBanner();
  handleHashRouting();

  // Track abandoned cart on any cart change
  const _origSave = State.save.bind(State);
  State.save = function() { _origSave(); trackAbandonedCart(); };
});

// Listen for hash changes (back/forward browser buttons)
window.addEventListener('hashchange', handleHashRouting);

// ═══════════════════════════════════════════════════════════════
// TELOEDUCA — Certificate Verification + Stats
// ═══════════════════════════════════════════════════════════════

async function verifyCertificate() {
  const certId = document.getElementById('verify-cert-id').value.trim().toUpperCase();
  const resultEl = document.getElementById('cert-verify-result');
  if (!certId) { showToast('Ingresa un ID de certificado', 'error'); return; }

  resultEl.hidden = false;
  resultEl.innerHTML = '<p class="text-muted">Buscando certificado...</p>';

  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/certificates?cert_id=eq.${encodeURIComponent(certId)}&limit=1`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    const data = res.ok ? await res.json() : [];
    if (data && data.length > 0) {
      const c = data[0];
      const date = c.created_at ? new Date(c.created_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
      resultEl.innerHTML = `
        <div class="cert-verified">
          <div class="cert-verified__badge">✅ Certificado Válido</div>
          <div class="cert-verified__details">
            <p><strong>Estudiante:</strong> ${c.student || 'N/A'}</p>
            <p><strong>Curso:</strong> ${c.course || 'N/A'}</p>
            <p><strong>Calificación:</strong> ${c.score || 0}%</p>
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>ID:</strong> ${c.cert_id}</p>
          </div>
        </div>`;
    } else {
      resultEl.innerHTML = `<div class="cert-invalid"><span>❌</span> Certificado no encontrado. Verifica el ID e intenta de nuevo.</div>`;
    }
  } catch (e) {
    resultEl.innerHTML = `<div class="cert-invalid"><span>⚠️</span> Error de conexión. Intenta más tarde.</div>`;
  }
}

// Update educa stats from data
function updateEducaStats() {
  const totalStudents = courses.reduce((s, c) => s + (c.students || 0), 0);
  const el = document.getElementById('educa-total-courses');
  if (el) el.textContent = courses.length;
  const studEl = document.getElementById('educa-total-students');
  if (studEl) studEl.textContent = totalStudents > 1000 ? `${(totalStudents / 1000).toFixed(1)}k+` : totalStudents.toLocaleString();
}

// ═══════════════════════════════════════════════════════════════
// TELOINSTALA — Dynamic Technician Loading from Supabase
// ═══════════════════════════════════════════════════════════════

async function loadTechniciansForFrontend() {
  try {
    const res = await fetch(`${BackendService.config.supabaseUrl}/rest/v1/technicians?select=*&active=eq.true&order=rating.desc`, {
      headers: { 'apikey': BackendService.config.supabaseKey, 'Authorization': `Bearer ${BackendService.config.supabaseKey}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.length) return;

    const grid = document.querySelector('.tech-grid');
    if (!grid) return;

    grid.innerHTML = data.map((t, i) => `
      <button class="tech-card ${i === 0 ? 'active' : ''}" data-tech="${t.id}" type="button">
        <span class="tech-card__avatar">${t.avatar || '👷'}</span>
        <div class="tech-card__info">
          <strong>${t.name}</strong>
          <small>${t.specialization || 'General'}</small>
          <span class="tech-card__rating">★ ${t.rating || 5} · ${t.jobs_completed || 0} servicios</span>
        </div>
      </button>`).join('');

    // Re-bind click events
    grid.querySelectorAll('.tech-card').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.tech-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
    console.log(`[Instala] Loaded ${data.length} technicians from Supabase`);
  } catch (e) { /* keep hardcoded fallback */ }
}

// ═══════════════════════════════════════════════════════════════
// TELOREPARA — Photo Upload + Enhanced Tracking
// ═══════════════════════════════════════════════════════════════

// Enhanced bookRepara to include photo if provided
const _originalBookRepara = bookRepara;
bookRepara = function() {
  const photoInput = document.getElementById('repara-photo');
  if (photoInput && photoInput.files && photoInput.files[0]) {
    // Upload photo via edge function then continue booking
    const file = photoInput.files[0];
    const formData = new FormData();
    formData.append('image', file);
    fetch(`${BackendService.config.supabaseUrl}/functions/v1/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${BackendService.config.supabaseKey}` },
      body: formData
    }).then(r => r.json()).then(data => {
      if (data && data.data && data.data.url) {
        // Store photo URL in a hidden field or pass via description
        const desc = document.getElementById('repara-desc');
        if (desc) desc.value += `\n📸 Foto: ${data.data.url}`;
      }
      _originalBookRepara();
    }).catch(() => _originalBookRepara());
  } else {
    _originalBookRepara();
  }
};

// ═══════════════════════════════════════════════════════════════
// TELOLLEVA — Package Insurance + Price Calculator Table
// ═══════════════════════════════════════════════════════════════

function getLlevaPriceBreakdown(distKm, vehicle) {
  const basePrice = { moto: 120, car: 250, cargo: 600 };
  const pricePerKm = { moto: 20, car: 30, cargo: 50 };
  const base = basePrice[vehicle] || 120;
  const distance = Math.round(distKm * (pricePerKm[vehicle] || 20));
  const insurance = document.getElementById('lleva-insurance')?.checked ? Math.round((base + distance) * 0.05) : 0;
  return { base, distance, insurance, total: base + distance + insurance };
}

// ═══════════════════════════════════════════════════════════════
// INIT — Load dynamic data for other modules
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  loadTechniciansForFrontend();
  setTimeout(updateEducaStats, 1000);
});
