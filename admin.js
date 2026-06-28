/**
 * TeloCorp Admin Panel — v4.0
 * - Autenticación real con Supabase Auth (sin credenciales hardcodeadas)
 * - Sin API keys sensibles en el frontend (todo vía Edge Functions)
 * - CRUD completo de TODOS los módulos (incluyendo TeloEduca, technicians, services)
 * - Tracking persistente real (lee estados desde Supabase)
 */

// ═══ CONFIG (solo datos públicos, nunca secretos) ═══
const SB_URL = 'https://bhdictzvboiojyxorfiq.supabase.co';
const SB_ANON_KEY = 'sb_publishable_AgpNN0k_KfW0moe6f1CKXg_qP2GKJCm';
const BASE_IMG = 'https://telocg.com/TeloCorp/images/';

// Cliente Supabase (cargado vía UMD en el HTML)
let sb = null;
let session = null;

// ═══ ESTADO DE LA APP ═══
let products = [];
let categories = [];
let technicians = [];
let servicesCatalog = { instala: [], repara: [] };
let courses = [];
let settings = { coupons: {}, free_shipping_threshold: 1500, shipping_cost: 250, whatsapp_number: '18099038707', paypal_email: 'telocorpgroup@gmail.com' };
let editId = null;
let editCourseId = null;
let imgs = [];
let gIdx = null;

// ═══ INICIALIZACIÓN SUPABASE ═══
function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase JS no cargado');
    return false;
  }
  sb = window.supabase.createClient(SB_URL, SB_ANON_KEY);
  return true;
}

// ═══ AUTENTICACIÓN REAL (Supabase Auth) ═══

async function login() {
  const email = document.getElementById('lEmail').value.trim();
  const pass = document.getElementById('lPass').value;
  const errEl = document.getElementById('lErr');

  if (!email || !pass) {
    errEl.textContent = 'Ingresa email y contraseña';
    errEl.style.display = 'block';
    return;
  }

  // Feedback visual de carga
  const btn = document.querySelector('.login-box .btn-p');
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando...'; }

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    // Verificar que el usuario tenga permisos de admin antes de entrar
    if (!isAdminUser(data.user)) {
      await sb.auth.signOut().catch(() => {});
      throw new Error('Esta cuenta no tiene permisos de administrador.');
    }
    session = data.session;
    showApp();
  } catch (err) {
    errEl.textContent = err.message || 'Email o contraseña incorrectos';
    errEl.style.display = 'block';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Ingresar'; }
  }
}

async function logout() {
  try { await sb.auth.signOut(); } catch (e) {}
  sessionStorage.removeItem('tcAdmin');
  location.reload();
}

async function checkSession() {
  if (!sb) return false;
  // getSession() lee localStorage (puede estar expirada). Validamos con el servidor vía getUser().
  const { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) return false;

  // Validar el token server-side: getUser() rechaza tokens expirados/inválidos
  const { data: userData, error } = await sb.auth.getUser();
  if (error || !userData.user) {
    console.warn('[checkSession] Sesión inválida o expirada, requiere re-login');
    await sb.auth.signOut().catch(() => {});
    return false;
  }

  // Verificar que el usuario sea admin (coincide con la función is_admin() en SQL)
  if (!isAdminUser(userData.user)) {
    console.warn('[checkSession] Usuario sin permisos de admin');
    await sb.auth.signOut().catch(() => {});
    return false;
  }

  session = sessionData.session;
  return true;
}

// Verifica si el usuario tiene permisos de admin (espejo de is_admin() en SQL)
function isAdminUser(user) {
  if (!user) return false;
  const email = (user.email || '').toLowerCase();
  const role = user.user_metadata?.role || user.app_metadata?.role;
  return email.endsWith('@telocg.com') || role === 'admin';
}

async function showApp() {
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('appView').classList.add('on');

  // Email visible en topbar
  const user = session?.user;
  const emailLabel = document.getElementById('adminEmail');
  if (emailLabel && user) emailLabel.textContent = user.email;

  await init();
}

// ═══ HELPERS SUPABASE (con token de sesión inyectado automáticamente) ═══

async function sbGet(table, query = '') {
  try {
    let q = sb.from(table).select('*');
    // Parsear query params estilo PostgREST: ?order=col.asc&id=eq.value&limit=N
    if (query) {
      const params = new URLSearchParams(query.replace(/^\?/, ''));
      for (const [key, val] of params.entries()) {
        if (key === 'order') {
          const parts = val.split('.');
          const col = parts[0];
          const asc = parts[1] !== 'desc';
          q = q.order(col, { ascending: asc });
        } else if (key === 'limit') {
          q = q.limit(parseInt(val));
        } else {
          // Filtros tipo col=op.value (e.g. id=eq.global)
          const m = val.match(/^(eq|neq|gt|gte|lt|lte|like|ilike|is)\.(.+)$/);
          if (m) {
            const op = m[1];
            const v = m[2];
            if (op === 'eq') q = q.eq(key, v);
            else if (op === 'neq') q = q.neq(key, v);
            else if (op === 'gt') q = q.gt(key, v);
            else if (op === 'gte') q = q.gte(key, v);
            else if (op === 'lt') q = q.lt(key, v);
            else if (op === 'lte') q = q.lte(key, v);
            else if (op === 'like') q = q.like(key, v);
            else if (op === 'ilike') q = q.ilike(key, v);
            else if (op === 'is') q = q.is(key, v === 'null' ? null : v);
          }
        }
      }
    }
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[sbGet]', table, e);
    return [];
  }
}

async function sbPost(table, payload) {
  try {
    const { data, error } = await sb.from(table).insert(payload).select();
    if (error) throw error;
    logAudit('create', table, payload.id || (data[0] && data[0].id), payload);
    return data;
  } catch (e) {
    console.error('[sbPost]', table, e);
    toast('Error: ' + (e.message || 'no se pudo guardar'), 'error');
    return null;
  }
}

async function sbPatch(table, id, payload) {
  try {
    const { data, error } = await sb.from(table).update(payload).eq('id', id).select();
    if (error) throw error;
    // RLS bloquea silenciosamente: UPDATE sin permiso devuelve [] sin error.
    if (!data || data.length === 0) {
      console.warn('[sbPatch] 0 filas actualizadas (RLS o id inexistente):', table, id);
      toast('No se pudo actualizar — sin permisos de admin o registro no encontrado. Inicia sesión de nuevo.', 'error');
      return null;
    }
    logAudit('update', table, id, payload);
    return data;
  } catch (e) {
    console.error('[sbPatch]', table, e);
    toast('Error: ' + (e.message || 'no se pudo actualizar'), 'error');
    return null;
  }
}

async function sbDel(table, id) {
  try {
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) throw error;
    logAudit('delete', table, id, {});
    return true;
  } catch (e) {
    console.error('[sbDel]', table, e);
    toast('Error: ' + (e.message || 'no se pudo eliminar'), 'error');
    return false;
  }
}

// Log de auditoría
async function logAudit(action, entity, entityId, details) {
  try {
    await sb.from('audit_log').insert({
      admin_email: session?.user?.email || 'unknown',
      action,
      entity,
      entity_id: String(entityId || ''),
      details
    });
  } catch (e) { /* no bloquear por audit */ }
}

// Subida de imágenes vía Edge Function (ImgBB) — sin API key en el frontend
async function uploadImageViaEdge(file) {
  const fd = new FormData();
  fd.append('image', file);
  try {
    const r = await fetch(`${SB_URL}/functions/v1/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SB_ANON_KEY}` },
      body: fd
    });
    const j = await r.json();
    if (j.success) return j.data.url;
    return null;
  } catch (e) {
    console.error('[upload]', e);
    return null;
  }
}

// Generación de specs vía Edge Function (Gemini) — sin API key en el frontend
async function generateSpecsViaEdge(productName) {
  try {
    const r = await fetch(`${SB_URL}/functions/v1/ai-specs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SB_ANON_KEY}` },
      body: JSON.stringify({ product_name: productName })
    });
    const j = await r.json();
    return j.specs || null;
  } catch (e) {
    console.error('[ai-specs]', e);
    return null;
  }
}

// ═══ NAVIGATION ═══
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
    const page = document.getElementById('pg-' + btn.dataset.page);
    if (page) page.classList.add('on');
    document.querySelector('.sidebar').classList.remove('open');
    loadPage(btn.dataset.page);
  };
});

// ═══ INIT — carga todos los datos desde Supabase ═══
async function init() {
  await Promise.all([
    loadSettings(),
    loadCategories(),
    loadTechnicians(),
    loadDrivers(),
    loadServices(),
    loadProducts(),
    loadCourses()
  ]);
  renderDashboard();
  renderSales();
  renderCatsPage();
  renderTechniciansPage();
  renderCoursesPage();
  await syncTransactional();
}

async function syncTransactional() {
  const [members, orders, certs, lleva, repara, instala] = await Promise.all([
    sbGet('customers'),
    sbGet('orders', '?order=created_at.desc'),
    sbGet('certificates'),
    sbGet('lleva_requests', '?order=created_at.desc'),
    sbGet('repara_bookings', '?order=created_at.desc'),
    sbGet('instala_bookings', '?order=created_at.desc')
  ]);
  renderMembers(members);
  renderDashOrders(orders);
  renderEduca(certs);
  renderLleva(lleva);
  renderRepara(repara);
  renderInstala(instala);
  // Renderizar gráficos del dashboard después de cargar todos los datos
  renderDashboardCharts();
}

function loadPage(p) {
  if (p === 'dashboard') { renderDashboard(); syncTransactional(); }
  else if (p === 'sales') renderSales();
  else if (p === 'categories') renderCatsPage();
  else if (p === 'technicians') renderTechniciansPage();
  else if (p === 'drivers') renderDriversPage();
  else if (p === 'courses') renderCoursesPage();
  else if (p === 'services') renderServicesPage();
  else if (p === 'config') renderConfigPage();
  else if (p === 'educa') { renderCoursesPage(); sbGet('certificates').then(renderEduca); }
  else if (p === 'members') { sbGet('customers').then(renderMembers); }
  else if (p === 'lleva') { sbGet('lleva_requests', '?order=created_at.desc').then(renderLleva); }
  else if (p === 'repara') { sbGet('repara_bookings', '?order=created_at.desc').then(renderRepara); }
  else if (p === 'instala') { sbGet('instala_bookings', '?order=created_at.desc').then(renderInstala); }
}

// ═══ LOAD DATA ═══

async function loadSettings() {
  const data = await sbGet('site_settings', '?id=eq.global&limit=1');
  if (data && data[0]) settings = { ...settings, ...data[0] };
}

async function loadCategories() {
  categories = await sbGet('categories', '?order=name.asc');
  if (!categories.length) {
    categories = [
      { name: 'Covers & Fundas', margin: 50 },
      { name: 'Cables y Carga', margin: 55 },
      { name: 'Audio', margin: 45 },
      { name: 'Equipamiento', margin: 35 }
    ];
  }
}

async function loadTechnicians() {
  technicians = await sbGet('technicians', '?order=name.asc');
}

async function loadServices() {
  const data = await sbGet('services_catalog', '?order=sort_order.asc');
  servicesCatalog.instala = data.filter(s => s.service === 'instala');
  servicesCatalog.repara = data.filter(s => s.service === 'repara');
}

async function loadProducts() {
  products = await sbGet('products', '?order=created_at.desc');
}

async function loadCourses() {
  courses = await sbGet('courses', '?order=sort_order.asc');
  if (!courses.length) courses = []; // tabla vacía hasta que se ejecute el seed SQL
}

// ═══ DASHBOARD ═══
let charts = {}; // instancias de Chart.js para destruir antes de re-renderizar

function renderDashboard() {
  const totalProds = products.length;
  const totalVal = products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
  const totalSold = products.reduce((s, p) => s + (p.sold || 0), 0);
  const totalProfit = products.reduce((s, p) => s + ((p.price || 0) - (p.cost || 0)) * (p.sold || 0), 0);
  const lowStock = products.filter(p => (p.stock || 0) <= 3).length;
  document.getElementById('dashStats').innerHTML = `
    <div class="stat"><div class="label">Productos</div><div class="val">${totalProds}</div></div>
    <div class="stat"><div class="label">Valor Inventario</div><div class="val" style="color:var(--primary)">RD$ ${totalVal.toLocaleString()}</div></div>
    <div class="stat"><div class="label">Ventas Totales</div><div class="val" style="color:var(--success)">${totalSold.toLocaleString()}</div></div>
    <div class="stat"><div class="label">Ganancia Acumulada</div><div class="val" style="color:var(--success)">RD$ ${totalProfit.toLocaleString()}</div></div>
    <div class="stat"><div class="label">Stock Bajo (≤3)</div><div class="val" style="color:${lowStock ? 'var(--danger)' : 'var(--dim)'}">${lowStock}${lowStock ? ' ⚠️' : ''}</div></div>
    <div class="stat"><div class="label">Cursos Activos</div><div class="val">${courses.filter(c => c.active).length}</div></div>`;
  // Load pending notifications count
  loadPendingNotifications();
}

async function loadPendingNotifications() {
  try {
    const notifs = await sbGet('notifications', '?status=eq.pending&order=created_at.desc&limit=20');
    const count = notifs.length;
    // Show alert in dashboard if there are pending notifications
    const dashStats = document.getElementById('dashStats');
    if (dashStats && count > 0) {
      const existingAlert = document.getElementById('dash-notif-alert');
      if (existingAlert) existingAlert.remove();
      dashStats.insertAdjacentHTML('afterend', `<div id="dash-notif-alert" class="dash-alert"><span>🔔 ${count} solicitud${count > 1 ? 'es' : ''} pendiente${count > 1 ? 's' : ''} de atención</span><button class="btn btn-g btn-sm" onclick="markNotificationsResolved()">Marcar resueltas</button></div>`);
    }
  } catch (e) { /* silent */ }
}

async function markNotificationsResolved() {
  try {
    const notifs = await sbGet('notifications', '?status=eq.pending');
    for (const n of notifs) {
      await sbPatch('notifications', n.id, { status: 'resolved' });
    }
    document.getElementById('dash-notif-alert')?.remove();
    toast(`${notifs.length} notificaciones marcadas como resueltas ✓`);
  } catch (e) { toast('Error al actualizar', 'error'); }
}

// Renderiza los 4 gráficos del dashboard usando los datos cargados.
// Reintenta cada 300ms hasta que Chart.js esté disponible (hasta 5s).
async function renderDashboardCharts() {
  let tries = 0;
  const waitForChart = () => new Promise((resolve) => {
    const check = () => {
      if (typeof Chart !== 'undefined') return resolve(true);
      if (++tries > 16) return resolve(false); // ~5s timeout
      setTimeout(check, 300);
    };
    check();
  });

  const ready = await waitForChart();
  if (!ready) {
    console.warn('[Dashboard] Chart.js no cargó tras 5s — gráficos omitidos');
    return;
  }

  // Verificar que todos los canvas existen en el DOM y la página dashboard está visible
  const ids = ['chartRevenue', 'chartOrders', 'chartProducts', 'chartServices'];
  const dashPage = document.getElementById('pg-dashboard');
  if (!dashPage || !dashPage.classList.contains('on')) {
    // Dashboard no visible, omitir gráficos (se renderizarán al navegar al dashboard)
    return;
  }
  if (!ids.every(id => document.getElementById(id))) {
    console.warn('[Dashboard] Canvas no encontrados en el DOM');
    return;
  }

  const orders = await sbGet('orders');
  const repara = await sbGet('repara_bookings');
  const instala = await sbGet('instala_bookings');
  const lleva = await sbGet('lleva_requests');

  // Destruir gráficos previos
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {};

  const gridColor = 'rgba(148,163,184,0.1)';
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.size = 11;

  // 1) Ingresos últimos 7 días (línea)
  const days = [];
  const revenue = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }));
    const dayOrders = orders.filter(o => o.created_at && o.created_at.slice(0, 10) === key);
    revenue.push(dayOrders.reduce((s, o) => s + (o.total || 0), 0));
  }
  try {
    charts.revenue = new Chart(document.getElementById('chartRevenue'), {
      type: 'line',
      data: { labels: days, datasets: [{ label: 'RD$', data: revenue, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.15)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#f97316' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { callback: v => 'RD$' + (v||0).toLocaleString() } }, x: { grid: { display: false } } } }
    });
  } catch (e) { console.error('[chart revenue]', e); }

  // 2) Órdenes por estado (doughnut)
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const statusCounts = statuses.map(s => orders.filter(o => (o.status || 'pending') === s).length);
  try {
    charts.orders = new Chart(document.getElementById('chartOrders'), {
      type: 'doughnut',
      data: { labels: ['Pendientes', 'Confirmadas', 'Enviadas', 'Entregadas', 'Canceladas'], datasets: [{ data: statusCounts, backgroundColor: ['#f59e0b', '#3b82f6', '#a855f7', '#22c55e', '#ef4444'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 8 } } }, cutout: '60%' }
    });
  } catch (e) { console.error('[chart orders]', e); }

  // 3) Productos más vendidos (barra horizontal)
  const topProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
  try {
    charts.products = new Chart(document.getElementById('chartProducts'), {
      type: 'bar',
      data: { labels: topProducts.map(p => (p.title || p.name || '').slice(0, 18) || 'Producto'), datasets: [{ label: 'Vendidos', data: topProducts.map(p => p.sold || 0), backgroundColor: '#f97316', borderRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, beginAtZero: true }, y: { grid: { display: false } } } }
    });
  } catch (e) { console.error('[chart products]', e); }

  // 4) Solicitudes de servicio por tipo (barra)
  try {
    charts.services = new Chart(document.getElementById('chartServices'), {
      type: 'bar',
      data: {
        labels: ['Reparaciones', 'Instalaciones', 'Envíos', 'Ventas'],
        datasets: [{
          label: 'Solicitudes',
          data: [repara.length, instala.length, lleva.length, orders.length],
          backgroundColor: ['#a855f7', '#22c55e', '#f59e0b', '#f97316'],
          borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, beginAtZero: true }, x: { grid: { display: false } } } }
    });
  } catch (e) { console.error('[chart services]', e); }
}

function renderDashOrders(orders) {
  const ORDER_STATUS = { pending: 'Pendiente', confirmed: 'Confirmada', processing: 'Procesando', shipped: 'Enviada', delivered: 'Entregada', cancelled: 'Cancelada' };
  const PAY_BADGES = { cardnet: ['💳 CardNET', '#3b82f6'], whatsapp: ['💬 Transfer.', '#22c55e'], paypal: ['🌐 PayPal', '#a855f7'], card: ['💳 Tarjeta', '#3b82f6'] };
  document.getElementById('dashOrders').innerHTML = (orders && orders.length)
    ? orders.slice(0, 20).map(o => {
        const [payLabel, payColor] = PAY_BADGES[o.payment_method] || PAY_BADGES.card;
        const custName = (o.customer && o.customer.name) || '';
        const custPhone = (o.customer && o.customer.phone) || '';
        return `<tr>
        <td><small>${(o.items && o.items.map(i=>i.title).join(', ').slice(0, 50)) || 'Orden'}${o.items && o.items.map(i=>i.title).join(', ').length > 50 ? '…' : ''}</small>${custName ? `<br><span style="font-size:.65rem;color:var(--dim)">👤 ${custName}</span>` : ''}</td>
        <td><b>RD$ ${(o.total || 0).toLocaleString()}</b></td>
        <td><span class="tag" style="background:${payColor}22;color:${payColor};border:1px solid ${payColor}44">${payLabel}</span></td>
        <td><select class="btn-sm" style="padding:3px 6px;font-size:.7rem" onchange="updateOrderStatus('${o.id}',this.value)">${Object.entries(ORDER_STATUS).map(([k,v])=>`<option value="${k}" ${(o.status||'pending')===k?'selected':''}>${v}</option>`).join('')}</select></td>
        <td>${o.created_at ? new Date(o.created_at).toLocaleDateString('es-DO', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : ''}</td>
        <td class="acts">${custPhone ? `<a href="https://wa.me/${custPhone.replace(/\\D/g,'')}" target="_blank" class="btn btn-g btn-sm" title="WhatsApp cliente">💬</a>` : ''}<button class="btn btn-g btn-sm" onclick="editOrder('${o.id}')" title="Editar orden">✏️</button></td>
      </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--dim);padding:20px">Sin órdenes</td></tr>';
}

// Actualizar estado de orden + registrar cambio en historial
async function updateOrderStatus(orderId, newStatus) {
  const orders = await sbGet('orders', '?order=created_at.desc');
  const prev = orders.find(o => o.id === orderId);
  if (prev && prev.status === newStatus) return; // sin cambio real

  // Intentar el UPDATE primero (sbPatch detecta bloqueos RLS y devuelve null)
  const updated = await sbPatch('orders', orderId, { status: newStatus });
  if (!updated) {
    // El error ya fue mostrado por sbPatch. Revertir el select visualmente.
    renderDashOrders(orders);
    return;
  }

  // Registrar historial solo tras un cambio exitoso
  await sb.from('orders_history').insert({
    order_id: orderId,
    action: 'status_change',
    changes: { from: prev?.status || null, to: newStatus },
    admin_email: session?.user?.email || 'unknown'
  }).then(({ error }) => { if (error) console.warn('[orders_history]', error.message); });

  toast(`Orden → ${newStatus}`);
  // Refrescar tabla de órdenes y gráficos del dashboard
  const refreshed = await sbGet('orders', '?order=created_at.desc');
  renderDashOrders(refreshed);
  renderDashboardCharts();
}

// Editar orden completa (modal) — mantiene historial
async function editOrder(orderId) {
  const orders = await sbGet('orders');
  const o = orders.find(x => x.id === orderId);
  if (!o) return toast('Orden no encontrada', 'error');
  const newStatus = prompt(`Editar orden ${orderId.slice(0,8)}\n\nEstado actual: ${o.status||'pending'}\n\nNuevo estado (pending/confirmed/shipped/delivered/cancelled):`, o.status || 'pending');
  if (newStatus && newStatus.trim() !== o.status) {
    await updateOrderStatus(orderId, newStatus.trim());
  }
  // Notas del admin
  const notes = prompt('Notas internas (opcional):', o.notes || '');
  if (notes !== null && notes !== (o.notes || '')) {
    await sb.from('orders_history').insert({ order_id: orderId, action: 'modified', changes: { field: 'notes', from: o.notes||'', to: notes }, admin_email: session?.user?.email || 'unknown' });
    await sbPatch('orders', orderId, { notes });
    toast('Notas actualizadas');
  }
}

// ═══ TELOSALES — CRUD ═══
function renderSales() {
  const q = (document.getElementById('salesSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('salesCat')?.value || '';

  const sel = document.getElementById('salesCat');
  const allCats = [...new Set(products.map(p => p.category))].sort();
  sel.innerHTML = '<option value="">Todas</option>' + allCats.map(c => `<option ${c === cat ? 'selected' : ''}>${c}</option>`).join('');

  const list = products.filter(p => (!q || (p.title || p.name || '').toLowerCase().includes(q)) && (!cat || p.category === cat));
  const getImg = p => (p.images && p.images[0]) || p.image || '';

  document.getElementById('salesBody').innerHTML = list.map(p => `<tr>
    <td><img src="${getImg(p)}" onerror="this.style.visibility='hidden'"></td>
    <td><b>${p.title || p.name}</b>${p.discount ? ` <span class="tag tag-r">-${p.discount}%</span>` : ''}</td>
    <td><span class="tag tag-o">${p.category}</span></td>
    <td>RD$ ${(p.price || 0).toLocaleString()}</td>
    <td style="color:var(--dim)">RD$ ${(p.cost || 0).toLocaleString()}</td>
    <td class="${(p.stock || 0) <= 3 ? 'stock-low' : ''}">${p.stock || 0}</td>
    <td>${p.sold || 0}</td>
    <td class="acts">
      <button class="btn btn-g btn-sm" onclick="editProd('${p.id}')">✏️</button>
      <button class="btn btn-d btn-sm" onclick="delProd('${p.id}')">🗑️</button>
    </td></tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--dim)">Sin productos</td></tr>';

  document.getElementById('salesMList').innerHTML = list.map(p => `<div class="m-card">
    <img src="${getImg(p)}" onerror="this.style.visibility='hidden'">
    <div class="m-card-info"><h4>${p.title || p.name}</h4><small>RD$ ${(p.price || 0).toLocaleString()} · Stock: ${p.stock || 0}</small></div>
    <div class="acts">
      <button class="btn btn-g btn-sm" onclick="editProd('${p.id}')">✏️</button>
      <button class="btn btn-d btn-sm" onclick="delProd('${p.id}')">🗑️</button>
    </div></div>`).join('');
}

function openProductModal(p = null) {
  editId = p ? p.id : null;
  document.getElementById('prodModalTitle').textContent = p ? 'Editar Producto' : 'Nuevo Producto';
  document.getElementById('fName').value = p ? (p.title || p.name || '') : '';
  document.getElementById('fPrice').value = p ? (p.price || 0) : '';
  document.getElementById('fStock').value = p ? (p.stock || 0) : 0;
  document.getElementById('fCost').value = p ? (p.cost || 0) : 0;
  document.getElementById('fMargin').value = 50;
  document.getElementById('fDiscount').value = p ? (p.discount || 0) : 0;
  document.getElementById('fDesc').value = p ? (p.description || p.desc || '') : '';
  document.getElementById('fVideo').value = p ? (p.video || '') : '';

  const catSel = document.getElementById('fCat');
  catSel.innerHTML = categories.map(c => `<option ${p && p.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('');
  if (p) { const c = categories.find(x => x.name === p.category); if (c) document.getElementById('fMargin').value = c.margin; }

  imgs = p && p.images ? [...p.images] : [];
  renderGallery();

  let specs = p ? (p.specs || {}) : {};
  if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch (e) { specs = {}; } }
  document.getElementById('fSpecs').innerHTML = '';
  if (Object.keys(specs).length) Object.entries(specs).forEach(([k, v]) => addSpec(k, v)); else addSpec();

  calcPrice();
  document.getElementById('prodModal').classList.add('on');
}

function closeProdModal() { document.getElementById('prodModal').classList.remove('on'); editId = null; }
function editProd(id) { const p = products.find(x => x.id === id); if (p) openProductModal(p); }

async function delProd(id) {
  if (!confirm('¿Eliminar producto?')) return;
  const ok = await sbDel('products', id);
  if (ok) { products = products.filter(x => x.id !== id); renderSales(); renderDashboard(); toast('Producto eliminado'); }
}

async function saveProd() {
  const name = document.getElementById('fName').value.trim();
  if (!name) return toast('Nombre requerido', 'error');

  const specs = {};
  document.querySelectorAll('#fSpecs .spec-row').forEach(r => {
    const k = r.querySelector('.sk').value.trim();
    const v = r.querySelector('.sv').value.trim();
    if (k && v) specs[k] = v;
  });

  const data = {
    title: name,
    category: document.getElementById('fCat').value,
    price: +document.getElementById('fPrice').value || 0,
    cost: +document.getElementById('fCost').value || 0,
    stock: +document.getElementById('fStock').value || 0,
    discount: +document.getElementById('fDiscount').value || 0,
    description: document.getElementById('fDesc').value.trim(),
    video: document.getElementById('fVideo').value.trim(),
    images: imgs,
    image: imgs[0] || '',
    specs,
    active: true
  };

  if (editId) {
    const updated = await sbPatch('products', editId, data);
    if (updated) { const i = products.findIndex(x => x.id === editId); products[i] = { ...products[i], ...data }; }
  } else {
    data.id = 'ts-' + Date.now();
    data.sold = 0;
    data.rating = 5;
    const created = await sbPost('products', data);
    if (created && created[0]) products.unshift(created[0]);
  }
  closeProdModal();
  renderSales();
  renderDashboard();
  toast('Producto guardado ✓');
}

function calcPrice() {
  const cost = +document.getElementById('fCost').value || 0;
  const margin = +document.getElementById('fMargin').value || 0;
  const disc = +document.getElementById('fDiscount').value || 0;
  const suggested = Math.round(cost * (1 + margin / 100));
  const final = Math.round(suggested * (1 - disc / 100));
  document.getElementById('fSuggested').value = `RD$ ${suggested.toLocaleString()} → con desc: RD$ ${final.toLocaleString()} (ganancia: RD$ ${(final - cost).toLocaleString()})`;
}

// ═══ GALLERY ═══
function renderGallery() {
  document.getElementById('fGallery').innerHTML = imgs.map((url, i) => `<div class="gal-item" draggable="true" ondragstart="gDrag(event,${i})" ondragover="event.preventDefault()" ondrop="gDrop(event,${i})"><img src="${url}"><button class="rm" onclick="imgs.splice(${i},1);renderGallery()">×</button></div>`).join('') + `<label class="gal-add"><input type="file" accept="image/*" style="display:none" onchange="uploadImg(this)">+</label>`;
}
function gDrag(e, i) { gIdx = i; }
function gDrop(e, i) { e.preventDefault(); if (gIdx === null) return; const item = imgs.splice(gIdx, 1)[0]; imgs.splice(i, 0, item); gIdx = null; renderGallery(); }
function toggleUrlAdd() { const r = document.getElementById('urlAddRow'); r.style.display = r.style.display === 'none' ? 'flex' : 'none'; }
function addImgUrl() { const u = document.getElementById('fImgUrl').value.trim(); if (u) { imgs.push(u); document.getElementById('fImgUrl').value = ''; renderGallery(); } }

async function uploadImg(input) {
  const f = input.files[0];
  if (!f) return;
  toast('Subiendo imagen...');
  const url = await uploadImageViaEdge(f);
  if (url) { imgs.push(url); renderGallery(); toast('Imagen subida ✓'); }
  else toast('Error al subir imagen', 'error');
  input.value = '';
}

// ═══ SPECS ═══
function addSpec(k = '', v = '') {
  document.getElementById('fSpecs').insertAdjacentHTML('beforeend',
    `<div class="spec-row"><input class="sk" value="${k}" placeholder="Clave"><input class="sv" value="${v}" placeholder="Valor"><button class="btn btn-d btn-sm" onclick="this.parentElement.remove()">×</button></div>`);
}

async function aiSpecs() {
  const name = document.getElementById('fName').value.trim();
  if (!name) return toast('Ingresa nombre primero', 'error');
  toast('Generando specs con IA...');
  const specs = await generateSpecsViaEdge(name);
  if (specs && Object.keys(specs).length) {
    document.getElementById('fSpecs').innerHTML = '';
    Object.entries(specs).forEach(([k, v]) => addSpec(k, String(v)));
    toast('Specs generados ✓');
  } else {
    toast('No se pudieron generar specs. Intenta de nuevo.', 'error');
  }
}

async function aiDescription() {
  const name = document.getElementById('fName').value.trim();
  const cat = document.getElementById('fCat').value;
  if (!name) return toast('Ingresa nombre del producto primero', 'error');
  toast('Generando descripción con IA...');
  try {
    const url = `${SB_URL}/functions/v1/chat`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SB_ANON_KEY}` },
      body: JSON.stringify({ message: `Genera una descripción comercial profesional en español (2-3 oraciones) para el producto: "${name}" (categoría: ${cat}). Solo la descripción, sin comillas ni prefijos.`, context: 'Eres un copywriter de e-commerce.' })
    });
    if (res.ok) {
      const data = await res.json();
      const desc = (data.reply || '').replace(/^["']|["']$/g, '').trim();
      if (desc && desc.length > 10) {
        document.getElementById('fDesc').value = desc;
        toast('Descripción generada ✓');
      } else { toast('No se pudo generar', 'error'); }
    } else { toast('Error de conexión con IA', 'error'); }
  } catch (e) { toast('Error: ' + e.message, 'error'); }
}

// ═══ CATEGORIES CRUD ═══
function renderCatsPage() {
  const counts = {};
  products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
  document.getElementById('catsBody').innerHTML = categories.map((c, i) => `<tr>
    <td><b>${c.name}</b></td>
    <td><input type="number" value="${c.margin || 50}" style="width:70px" onchange="updateCatMargin('${c.name}',this.value)"></td>
    <td>${counts[c.name] || 0} productos</td>
    <td><button class="btn btn-d btn-sm" onclick="delCat('${c.name}')">×</button></td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--dim)">Sin categorías</td></tr>';
}

async function addCategory() {
  const name = document.getElementById('newCatName').value.trim();
  const margin = +document.getElementById('newCatMargin').value || 50;
  if (!name) return;
  if (categories.find(c => c.name === name)) return toast('Ya existe', 'error');
  const created = await sbPost('categories', { name, margin, active: true });
  if (created) { categories.push(created[0]); renderCatsPage(); document.getElementById('newCatName').value = ''; toast('Categoría agregada'); }
}

async function updateCatMargin(name, margin) {
  const cat = categories.find(c => c.name === name);
  if (!cat) return;
  await sbPatch('categories', cat.id, { margin: +margin });
  cat.margin = +margin;
  toast('Margen actualizado');
}

async function delCat(name) {
  if (!confirm(`¿Eliminar categoría "${name}"?`)) return;
  const cat = categories.find(c => c.name === name);
  if (!cat) return;
  const ok = await sbDel('categories', cat.id);
  if (ok) { categories = categories.filter(c => c.name !== name); renderCatsPage(); toast('Categoría eliminada'); }
}

// ═══ TECHNICIANS CRUD ═══
function renderTechniciansPage() {
  document.getElementById('techBody').innerHTML = technicians.map(t => `<tr>
    <td><b>${t.name}</b></td>
    <td>${t.specialization || ''}</td>
    <td>★ ${t.rating || 5}</td>
    <td>${t.jobs_completed || 0}</td>
    <td class="acts">
      <button class="btn btn-g btn-sm" onclick="editTech('${t.id}')">✏️</button>
      <button class="btn btn-d btn-sm" onclick="delTech('${t.id}')">🗑️</button>
    </td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--dim)">Sin técnicos</td></tr>';
}

function editTech(id) {
  const t = technicians.find(x => x.id === id);
  document.getElementById('techName').value = t.name;
  document.getElementById('techSpec').value = t.specialization || '';
  document.getElementById('techAvatar').value = t.avatar || '👨‍🔧';
  document.getElementById('techRating').value = t.rating || 5;
  document.getElementById('techJobs').value = t.jobs_completed || 0;
  document.getElementById('techSaveBtn').textContent = 'Actualizar';
  document.getElementById('techSaveBtn').onclick = () => updateTech(id);
}

async function addTech() {
  const name = document.getElementById('techName').value.trim();
  if (!name) return toast('Nombre requerido', 'error');
  const data = {
    id: 'tech-' + Date.now(),
    name,
    specialization: document.getElementById('techSpec').value.trim(),
    avatar: document.getElementById('techAvatar').value.trim() || '👨‍🔧',
    rating: +document.getElementById('techRating').value || 5,
    jobs_completed: +document.getElementById('techJobs').value || 0,
    active: true
  };
  const created = await sbPost('technicians', data);
  if (created) { technicians.push(created[0]); renderTechniciansPage(); resetTechForm(); toast('Técnico agregado'); }
}

async function updateTech(id) {
  const data = {
    name: document.getElementById('techName').value.trim(),
    specialization: document.getElementById('techSpec').value.trim(),
    avatar: document.getElementById('techAvatar').value.trim() || '👨‍🔧',
    rating: +document.getElementById('techRating').value || 5,
    jobs_completed: +document.getElementById('techJobs').value || 0
  };
  const updated = await sbPatch('technicians', id, data);
  if (updated) { const i = technicians.findIndex(x => x.id === id); technicians[i] = { ...technicians[i], ...data }; renderTechniciansPage(); resetTechForm(); toast('Técnico actualizado'); }
}

function resetTechForm() {
  ['techName', 'techSpec', 'techAvatar'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('techRating').value = 5;
  document.getElementById('techJobs').value = 0;
  document.getElementById('techAvatar').value = '👨‍🔧';
  document.getElementById('techSaveBtn').textContent = 'Agregar';
  document.getElementById('techSaveBtn').onclick = addTech;
}

async function delTech(id) {
  if (!confirm('¿Eliminar técnico?')) return;
  const ok = await sbDel('technicians', id);
  if (ok) { technicians = technicians.filter(x => x.id !== id); renderTechniciansPage(); toast('Técnico eliminado'); }
}

// ═══ DRIVERS (TeloLleva) CRUD ═══
let drivers = [];

async function loadDrivers() {
  drivers = await sbGet('drivers', '?order=rating.desc');
}

function renderDriversPage() {
  const VEH = { motorcycle: '🏍️ Moto', car: '🚗 Carro', van: '🚐 Van' };
  const ST = { available: ['Disponible', 'var(--success)'], busy: ['Ocupado', 'var(--primary)'], offline: ['Desconectado', 'var(--dim)'] };
  document.getElementById('driversBody').innerHTML = drivers.map(d => {
    const [sLabel, sColor] = ST[d.status] || ST.available;
    return `<tr>
      <td><b>${d.name}</b></td>
      <td>${d.phone || '—'}${d.phone ? ` <a href="https://wa.me/${d.phone.replace(/\D/g,'')}" target="_blank" class="btn btn-g btn-sm">💬</a>` : ''}</td>
      <td>${VEH[d.vehicle] || d.vehicle}</td>
      <td>★ ${d.rating || 5}</td>
      <td>${d.jobs_completed || 0}</td>
      <td><select class="btn-sm" style="padding:3px 6px;font-size:.7rem" onchange="updateDriverStatus('${d.id}',this.value)">${Object.entries(ST).map(([k,[l]])=>`<option value="${k}" ${d.status===k?'selected':''}>${l}</option>`).join('')}</select></td>
      <td class="acts"><button class="btn btn-g btn-sm" onclick="editDriver('${d.id}')">✏️</button><button class="btn btn-d btn-sm" onclick="delDriver('${d.id}')">🗑️</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--dim)">Sin conductores. Agrega conductores para activar TeloLleva real.</td></tr>';
}

function editDriver(id) {
  const d = drivers.find(x => x.id === id);
  if (!d) return;
  document.getElementById('drvName').value = d.name;
  document.getElementById('drvPhone').value = d.phone || '';
  document.getElementById('drvVehicle').value = d.vehicle || 'motorcycle';
  document.getElementById('drvZone').value = d.zone || '';
  document.getElementById('drvStatus').value = d.status || 'available';
  document.getElementById('drvSaveBtn').textContent = 'Actualizar';
  document.getElementById('drvSaveBtn').onclick = () => updateDriver(id);
}

async function addDriver() {
  const name = document.getElementById('drvName').value.trim();
  if (!name) return toast('Nombre requerido', 'error');
  const phone = document.getElementById('drvPhone').value.trim();
  const data = {
    id: 'drv-' + Date.now(),
    name,
    phone,
    vehicle: document.getElementById('drvVehicle').value,
    zone: document.getElementById('drvZone').value.trim(),
    status: document.getElementById('drvStatus').value,
    rating: 5,
    jobs_completed: 0,
    avatar: document.getElementById('drvVehicle').value === 'car' ? '🚗' : (document.getElementById('drvVehicle').value === 'van' ? '🚐' : '🏍️')
  };
  const created = await sbPost('drivers', data);
  if (created) { drivers.push(created[0]); renderDriversPage(); resetDriverForm(); toast('Conductor agregado ✓'); }
}

async function updateDriver(id) {
  const data = {
    name: document.getElementById('drvName').value.trim(),
    phone: document.getElementById('drvPhone').value.trim(),
    vehicle: document.getElementById('drvVehicle').value,
    zone: document.getElementById('drvZone').value.trim(),
    status: document.getElementById('drvStatus').value
  };
  const updated = await sbPatch('drivers', id, data);
  if (updated) { const i = drivers.findIndex(x => x.id === id); drivers[i] = { ...drivers[i], ...data }; renderDriversPage(); resetDriverForm(); toast('Conductor actualizado ✓'); }
}

async function updateDriverStatus(id, status) {
  const updated = await sbPatch('drivers', id, { status });
  if (updated) {
    const d = drivers.find(x => x.id === id);
    if (d) d.status = status;
    toast(`Conductor → ${status}`);
  } else {
    renderDriversPage(); // revertir select al estado real
  }
}

function resetDriverForm() {
  ['drvName', 'drvPhone', 'drvZone'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('drvVehicle').value = 'motorcycle';
  document.getElementById('drvStatus').value = 'available';
  const btn = document.getElementById('drvSaveBtn');
  btn.textContent = 'Agregar';
  btn.onclick = addDriver;
}

async function delDriver(id) {
  if (!confirm('¿Eliminar conductor?')) return;
  const ok = await sbDel('drivers', id);
  if (ok) { drivers = drivers.filter(x => x.id !== id); renderDriversPage(); toast('Conductor eliminado'); }
}

// ═══ SERVICES CATALOG CRUD ═══
function renderServicesPage() {
  const renderList = (list, type) => list.map(s => `<tr>
    <td><input value="${s.name}" onchange="updateService('${s.id}','name',this.value)" style="width:100%"></td>
    <td><input type="number" value="${s.price || 0}" onchange="updateService('${s.id}','price',this.value)" style="width:80px" title="Precio sugerido"></td>
    <td><input type="number" value="${s.price_min || 0}" onchange="updateService('${s.id}','price_min',this.value)" style="width:70px" title="Precio mínimo"></td>
    <td><input type="number" value="${s.price_max || 0}" onchange="updateService('${s.id}','price_max',this.value)" style="width:70px" title="Precio máximo"></td>
    <td><input value="${s.estimated_time || ''}" onchange="updateService('${s.id}','estimated_time',this.value)" style="width:70px"></td>
    <td><input value="${s.category || ''}" onchange="updateService('${s.id}','category',this.value)" style="width:90px"></td>
    <td><button class="btn btn-d btn-sm" onclick="delService('${s.id}')">×</button></td></tr>`).join('');

  document.getElementById('servicesInstalaBody').innerHTML = renderList(servicesCatalog.instala, 'instala') || '<tr><td colspan="7" style="text-align:center;color:var(--dim)">Sin servicios</td></tr>';
  document.getElementById('servicesReparaBody').innerHTML = renderList(servicesCatalog.repara, 'repara') || '<tr><td colspan="7" style="text-align:center;color:var(--dim)">Sin servicios</td></tr>';
}

async function addService(type) {
  const maxSort = Math.max(0, ...servicesCatalog[type].map(s => s.sort_order || 0));
  const data = {
    id: `${type}-${Date.now()}`,
    service: type,
    key: 'new',
    name: 'Nuevo servicio',
    price: 1000,
    price_min: 700,
    price_max: 1500,
    estimated_time: '1h',
    category: '',
    active: true,
    sort_order: maxSort + 1
  };
  const created = await sbPost('services_catalog', data);
  if (created) { servicesCatalog[type].push(created[0]); renderServicesPage(); toast('Servicio agregado — edita nombre y precios'); }
}

async function updateService(id, field, value) {
  const numericFields = ['price', 'price_min', 'price_max'];
  const payload = { [field]: numericFields.includes(field) ? (+value || 0) : value };
  await sbPatch('services_catalog', id, payload);
  const all = [...servicesCatalog.instala, ...servicesCatalog.repara];
  const s = all.find(x => x.id === id);
  if (s) s[field] = payload[field];
  toast('Actualizado');
}

async function delService(id) {
  if (!confirm('¿Eliminar servicio?')) return;
  const ok = await sbDel('services_catalog', id);
  if (ok) {
    servicesCatalog.instala = servicesCatalog.instala.filter(s => s.id !== id);
    servicesCatalog.repara = servicesCatalog.repara.filter(s => s.id !== id);
    renderServicesPage();
    toast('Servicio eliminado');
  }
}

// ═══ TELOEDUCA — CRUD COMPLETO DE CURSOS ═══
function renderCoursesPage() {
  document.getElementById('educaCourses').textContent = courses.length;
  document.getElementById('educaLessons').textContent = courses.reduce((s, c) => s + ((c.lessons && c.lessons.length) || 0), 0);
  document.getElementById('coursesBody').innerHTML = courses.map(c => `<tr>
    <td>${c.icon || '📚'}</td>
    <td><b>${c.title}</b>${!c.active ? ' <span class="tag tag-r">Inactivo</span>' : ''}</td>
    <td>${c.instructor}</td>
    <td><span class="tag tag-o">${(c.lessons && c.lessons.length) || 0}</span></td>
    <td><span class="tag tag-b">${c.level}</span></td>
    <td>${(c.students || 0).toLocaleString()}</td>
    <td>${(c.rating || 5).toFixed(1)} ★</td>
    <td class="acts">
      <button class="btn btn-g btn-sm" onclick="editCourse('${c.id}')">✏️</button>
      <button class="btn btn-d btn-sm" onclick="delCourse('${c.id}')">🗑️</button>
    </td></tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--dim)">Sin cursos</td></tr>';
}

function openCourseModal(c = null) {
  editCourseId = c ? c.id : null;
  document.getElementById('courseModalTitle').textContent = c ? 'Editar Curso' : 'Nuevo Curso';
  document.getElementById('cTitle').value = c ? (c.title || '') : '';
  document.getElementById('cDescription').value = c ? (c.description || '') : '';
  document.getElementById('cIcon').value = c ? (c.icon || '📚') : '📚';
  document.getElementById('cPath').value = c ? (c.path || 'tech') : 'tech';
  document.getElementById('cDuration').value = c ? (c.duration || '10h') : '10h';
  document.getElementById('cLevel').value = c ? (c.level || 'Básico') : 'Básico';
  document.getElementById('cInstructor').value = c ? (c.instructor || '') : '';
  document.getElementById('cStudents').value = c ? (c.students || 0) : 0;
  document.getElementById('cRating').value = c ? (c.rating || 5) : 5;
  // Lecciones (textarea, una por línea)
  const lessons = c && c.lessons ? (Array.isArray(c.lessons) ? c.lessons.join('\n') : '') : '';
  document.getElementById('cLessons').value = lessons;
  // Quiz (JSON editable)
  const quiz = c && c.quiz ? (typeof c.quiz === 'string' ? c.quiz : JSON.stringify(c.quiz, null, 2)) : '[]';
  document.getElementById('cQuiz').value = quiz;
  document.getElementById('courseModal').classList.add('on');
}

function closeCourseModal() { document.getElementById('courseModal').classList.remove('on'); editCourseId = null; }
function editCourse(id) { const c = courses.find(x => x.id === id); if (c) openCourseModal(c); }

async function delCourse(id) {
  if (!confirm('¿Eliminar curso?')) return;
  const ok = await sbDel('courses', id);
  if (ok) { courses = courses.filter(x => x.id !== id); renderCoursesPage(); toast('Curso eliminado'); }
}

async function saveCourse() {
  const title = document.getElementById('cTitle').value.trim();
  const instructor = document.getElementById('cInstructor').value.trim();
  if (!title) return toast('Título requerido', 'error');
  if (!instructor) return toast('Instructor requerido', 'error');

  // Parse lecciones (una por línea)
  const lessons = document.getElementById('cLessons').value.split('\n').map(l => l.trim()).filter(Boolean);

  // Parse quiz JSON
  let quiz = [];
  try { quiz = JSON.parse(document.getElementById('cQuiz').value || '[]'); }
  catch (e) { return toast('Quiz JSON inválido', 'error'); }

  const data = {
    title,
    description: document.getElementById('cDescription').value.trim(),
    icon: document.getElementById('cIcon').value.trim() || '📚',
    path: document.getElementById('cPath').value,
    duration: document.getElementById('cDuration').value.trim() || '10h',
    level: document.getElementById('cLevel').value,
    instructor,
    students: +document.getElementById('cStudents').value || 0,
    rating: +document.getElementById('cRating').value || 5,
    lessons,
    quiz,
    active: true
  };

  if (editCourseId) {
    const maxSort = Math.max(0, ...courses.map(c => c.sort_order || 0));
    if (!('sort_order' in data)) data.sort_order = maxSort + 1;
    const updated = await sbPatch('courses', editCourseId, data);
    if (updated) { const i = courses.findIndex(x => x.id === editCourseId); courses[i] = { ...courses[i], ...data }; }
  } else {
    data.id = 'course-' + Date.now();
    data.sort_order = Math.max(0, ...courses.map(c => c.sort_order || 0)) + 1;
    const created = await sbPost('courses', data);
    if (created && created[0]) courses.push(created[0]);
  }
  closeCourseModal();
  renderCoursesPage();
  toast('Curso guardado ✓');
}

// ═══ MEMBERS ═══
function renderMembers(data) {
  document.getElementById('membersTotal').textContent = data.length;
  const recent = data.filter(m => m.created_at && new Date(m.created_at) > new Date(Date.now() - 30 * 86400000));
  document.getElementById('membersActive').textContent = recent.length;
  document.getElementById('membersBody').innerHTML = data.map(m => `<tr>
    <td>${m.name || '—'}</td>
    <td>${m.email || '—'}</td>
    <td>${m.phone || '—'}</td>
    <td>${m.city || '—'}</td>
    <td>${m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}</td></tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--dim)">Sin miembros</td></tr>';
}

// ═══ CERTIFICATES ═══
function renderEduca(certs) {
  document.getElementById('educaCerts').textContent = certs.length;
  document.getElementById('educaBody').innerHTML = (certs && certs.length)
    ? certs.map(c => `<tr>
        <td>${c.course || ''}</td>
        <td>${c.student || ''}</td>
        <td><span class="tag tag-b">${c.cert_id || ''}</span></td>
        <td>${c.score || 0}%</td>
        <td>${c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</td></tr>`).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--dim);padding:20px">Sin certificados emitidos</td></tr>';
}

// ═══ TRANSACTIONAL — estados gestionables ═══
const STATUS = {
  lleva:   { opts: ['pending', 'assigned', 'pickup', 'in_transit', 'delivered', 'cancelled'],
             labels: { pending: 'Pendiente', assigned: 'Asignado', pickup: 'Recogiendo', in_transit: 'En tránsito', delivered: 'Entregado', cancelled: 'Cancelado' } },
  repara:  { opts: ['pending', 'in_progress', 'completed', 'cancelled'],
             labels: { pending: 'Pendiente', in_progress: 'En proceso', completed: 'Completado', cancelled: 'Cancelado' } },
  instala: { opts: ['confirmed', 'in_progress', 'completed', 'cancelled'],
             labels: { confirmed: 'Confirmada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada' } }
};

function renderLleva(data) {
  document.getElementById('llevaTotal').textContent = data.length;
  document.getElementById('llevaPending').textContent = data.filter(d => d.status === 'pending').length;
  document.getElementById('llevaDone').textContent = data.filter(d => d.status === 'delivered').length;
  document.getElementById('llevaBody').innerHTML = (data && data.length)
    ? data.slice(0, 50).map(d => `<tr>
        <td>${d.origin || ''}</td>
        <td>${d.dest || ''}</td>
        <td>${d.item || ''}</td>
        <td>${d.vehicle || ''}</td>
        <td>RD$ ${d.fare || 0}</td>
        <td><select class="btn-sm" style="padding:3px 6px;font-size:.7rem" onchange="updateStatus('lleva_requests','${d.id}',this.value)">${STATUS.lleva.opts.map(s => `<option value="${s}" ${d.status === s ? 'selected' : ''}>${STATUS.lleva.labels[s]}</option>`).join('')}</select></td>
        <td>${d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</td></tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--dim)">Sin envíos</td></tr>';
}

function renderRepara(data) {
  document.getElementById('reparaTotal').textContent = data.length;
  document.getElementById('reparaActive').textContent = data.filter(d => d.status === 'pending' || d.status === 'in_progress').length;
  document.getElementById('reparaDone').textContent = data.filter(d => d.status === 'completed').length;
  document.getElementById('reparaBody').innerHTML = (data && data.length)
    ? data.slice(0, 50).map(d => `<tr>
        <td><small>${d.ticket || (d.id && d.id.slice(0, 8)) || '—'}</small></td>
        <td>${d.device || ''}</td>
        <td>${d.issue || ''}</td>
        <td>${(d.customer && d.customer.name) || '—'}</td>
        <td><select class="btn-sm" style="padding:3px 6px;font-size:.7rem" onchange="updateStatus('repara_bookings','${d.id}',this.value)">${STATUS.repara.opts.map(s => `<option value="${s}" ${d.status === s ? 'selected' : ''}>${STATUS.repara.labels[s]}</option>`).join('')}</select></td>
        <td class="acts"><a href="https://wa.me/${(d.contact || (d.customer && d.customer.phone) || '').replace(/\D/g, '')}" target="_blank" class="btn btn-g btn-sm" title="WhatsApp">💬</a></td></tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--dim)">Sin tickets</td></tr>';
}

function renderInstala(data) {
  document.getElementById('instalaTotal').textContent = data.length;
  document.getElementById('instalaPending').textContent = data.filter(d => d.status !== 'completed' && d.status !== 'cancelled').length;
  document.getElementById('instalaTechs').textContent = technicians.length;
  document.getElementById('instalaBody').innerHTML = (data && data.length)
    ? data.slice(0, 50).map(d => `<tr>
        <td>${d.service || ''}</td>
        <td>${d.tech || ''}</td>
        <td>${d.date || ''}</td>
        <td>${(d.customer && d.customer.name) || '—'}</td>
        <td>RD$ ${d.price || 0}</td>
        <td><select class="btn-sm" style="padding:3px 6px;font-size:.7rem" onchange="updateStatus('instala_bookings','${d.id}',this.value)">${STATUS.instala.opts.map(s => `<option value="${s}" ${d.status === s ? 'selected' : ''}>${STATUS.instala.labels[s]}</option>`).join('')}</select></td>
        <td class="acts"><a href="https://wa.me/${(d.customer && d.customer.phone || '').replace(/\D/g, '')}" target="_blank" class="btn btn-g btn-sm" title="WhatsApp">💬</a></td></tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--dim)">Sin instalaciones</td></tr>';
}

async function updateStatus(table, id, newStatus) {
  const updated = await sbPatch(table, id, { status: newStatus });
  // refrescar la data correspondiente (en éxito muestra nuevo estado, en fallo revierte el select)
  const data = await sbGet(table, '?order=created_at.desc');
  if (table === 'repara_bookings') renderRepara(data);
  else if (table === 'instala_bookings') renderInstala(data);
  else if (table === 'lleva_requests') renderLleva(data);
  if (updated) toast(`Estado actualizado → ${newStatus}`);
}

// ═══ CONFIGURACIÓN ═══
function renderConfigPage() {
  const s = settings;
  document.getElementById('cfgWhatsapp').value = s.whatsapp_number || '';
  document.getElementById('cfgPaypal').value = s.paypal_email || '';
  document.getElementById('cfgFreeShip').value = s.free_shipping_threshold || 1500;
  document.getElementById('cfgShipCost').value = s.shipping_cost || 250;
  document.getElementById('cfgDeliveryTime').value = s.delivery_time || '24-48 horas';
  document.getElementById('cfgCoupons').value = s.coupons ? JSON.stringify(s.coupons, null, 2) : '{}';
  // Marketing & Conversion
  document.getElementById('cfgExitPopup').value = s.exit_popup_enabled !== false ? '1' : '0';
  document.getElementById('cfgPopupCoupon').value = s.popup_coupon_code || 'PRIMERA10';
  document.getElementById('cfgPopupDiscount').value = s.popup_coupon_discount || 10;
  document.getElementById('cfgSocialProof').value = s.social_proof_enabled !== false ? '1' : '0';
  document.getElementById('cfgFlashSale').value = s.flash_sale_enabled !== false ? '1' : '0';
  document.getElementById('cfgUpsell').value = s.upsell_enabled !== false ? '1' : '0';
  // Quantity breaks
  document.getElementById('cfgQtyBreak3').value = s.qty_break_3 || 5;
  document.getElementById('cfgQtyBreak5').value = s.qty_break_5 || 10;
  document.getElementById('cfgQtyBreak10').value = s.qty_break_10 || 15;
  // Payment methods
  document.getElementById('cfgCardnet').value = s.cardnet_enabled !== false ? '1' : '0';
  document.getElementById('cfgTransfer').value = s.transfer_enabled !== false ? '1' : '0';
  document.getElementById('cfgPaypalActive').value = s.paypal_enabled !== false ? '1' : '0';
  document.getElementById('cfgCardnetMsg').value = s.cardnet_message || 'Recibirás tu link de pago en WhatsApp';
  // Chatbot
  document.getElementById('cfgChatbot').value = s.chatbot_enabled !== false ? '1' : '0';
  document.getElementById('cfgChatContext').value = s.chatbot_context || '';
  // Analytics
  document.getElementById('cfgGA4').value = s.ga4_id || '';
  document.getElementById('cfgPixel').value = s.pixel_id || '';
  // Promo Banner
  document.getElementById('cfgBannerActive').value = s.promo_banner_enabled ? '1' : '0';
  document.getElementById('cfgBannerText').value = s.promo_banner_text || '';
}

async function saveConfig() {
  let coupons = {};
  try { coupons = JSON.parse(document.getElementById('cfgCoupons').value || '{}'); }
  catch (e) { return toast('JSON de cupones inválido', 'error'); }
  const data = {
    id: 'global',
    whatsapp_number: document.getElementById('cfgWhatsapp').value.trim(),
    paypal_email: document.getElementById('cfgPaypal').value.trim(),
    free_shipping_threshold: +document.getElementById('cfgFreeShip').value || 1500,
    shipping_cost: +document.getElementById('cfgShipCost').value || 250,
    delivery_time: document.getElementById('cfgDeliveryTime').value.trim() || '24-48 horas',
    coupons,
    // Marketing & Conversion
    exit_popup_enabled: document.getElementById('cfgExitPopup').value === '1',
    popup_coupon_code: document.getElementById('cfgPopupCoupon').value.trim() || 'PRIMERA10',
    popup_coupon_discount: +document.getElementById('cfgPopupDiscount').value || 10,
    social_proof_enabled: document.getElementById('cfgSocialProof').value === '1',
    flash_sale_enabled: document.getElementById('cfgFlashSale').value === '1',
    upsell_enabled: document.getElementById('cfgUpsell').value === '1',
    // Quantity breaks
    qty_break_3: +document.getElementById('cfgQtyBreak3').value || 5,
    qty_break_5: +document.getElementById('cfgQtyBreak5').value || 10,
    qty_break_10: +document.getElementById('cfgQtyBreak10').value || 15,
    // Payment methods
    cardnet_enabled: document.getElementById('cfgCardnet').value === '1',
    transfer_enabled: document.getElementById('cfgTransfer').value === '1',
    paypal_enabled: document.getElementById('cfgPaypalActive').value === '1',
    cardnet_message: document.getElementById('cfgCardnetMsg').value.trim(),
    // Chatbot
    chatbot_enabled: document.getElementById('cfgChatbot').value === '1',
    chatbot_context: document.getElementById('cfgChatContext').value.trim(),
    // Analytics
    ga4_id: document.getElementById('cfgGA4').value.trim(),
    pixel_id: document.getElementById('cfgPixel').value.trim(),
    // Promo Banner
    promo_banner_enabled: document.getElementById('cfgBannerActive').value === '1',
    promo_banner_text: document.getElementById('cfgBannerText').value.trim()
  };
  await sbPatch('site_settings', 'global', data);
  Object.assign(settings, data);
  toast('Configuración guardada ✓');
}

// ═══ CSV EXPORT ═══
function exportCSV() {
  const h = ['ID', 'Nombre', 'Categoría', 'Precio', 'Costo', 'Ganancia', 'Margen%', 'Stock', 'Vendidos', 'Revenue', 'Descuento', 'Rating', 'Estado'];
  const rows = products.map(p => {
    const ganancia = (p.price || 0) - (p.cost || 0);
    const margen = p.price ? Math.round(ganancia / p.price * 100) : 0;
    const revenue = (p.price || 0) * (p.sold || 0);
    return [p.id, `"${(p.title || p.name || '').replace(/"/g, '""')}"`, `"${p.category}"`, p.price, p.cost || 0, ganancia, margen, p.stock, p.sold || 0, revenue, p.discount || 0, p.rating || 5, p.active !== false ? 'Activo' : 'Inactivo'];
  });
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `telosales_inventario_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('CSV descargado ✓');
}

// Export orders to CSV
async function exportOrdersCSV() {
  const orders = await sbGet('orders', '?order=created_at.desc');
  if (!orders.length) return toast('No hay órdenes para exportar', 'error');
  const h = ['ID', 'Fecha', 'Cliente', 'Teléfono', 'Dirección', 'Items', 'Total', 'Método Pago', 'Estado', 'Notas'];
  const rows = orders.map(o => {
    const cust = o.customer || {};
    const itemsList = (o.items || []).map(i => `${i.title || 'Producto'} x${i.qty || 1}`).join('; ');
    const date = o.created_at ? new Date(o.created_at).toLocaleDateString('es-DO') : '';
    return [o.id.slice(0, 8), date, `"${cust.name || ''}"`, `"${cust.phone || ''}"`, `"${(cust.address || '').replace(/"/g, '""')}"`, `"${itemsList}"`, o.total || 0, o.payment_method || '', o.status || 'pending', `"${(o.notes || '').replace(/"/g, '""')}"`];
  });
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `telosales_ordenes_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast(`${orders.length} órdenes exportadas ✓`);
}

// ═══ TOAST ═══
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' toast-error' : '');
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ═══ BOOTSTRAP — arranque al cargar la página ═══
(async function bootstrap() {
  if (!initSupabase()) {
    document.getElementById('lErr').textContent = 'Error de conexión con Supabase';
    document.getElementById('lErr').style.display = 'block';
    return;
  }

  // Listener Enter en el login
  ['lEmail', 'lPass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  });

  // Verificar sesión activa (validada server-side + permisos admin)
  const hasSession = await checkSession();
  if (hasSession) {
    showApp();
  } else {
    // Estado de logout limpio: ocultar app y mostrar login
    document.getElementById('appView').classList.remove('on');
    document.getElementById('loginView').style.display = 'flex';
  }

  // Escuchar cambios de sesión (logout en otra pestaña, etc.)
  sb.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_OUT') {
      session = null;
      document.getElementById('appView').classList.remove('on');
      document.getElementById('loginView').style.display = 'flex';
    } else if (event === 'SIGNED_IN' && newSession) {
      session = newSession;
    }
  });
})();
