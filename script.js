/**
 * TeloCorpGroup - Super App Core Logic
 * Implementa Navegación SPA, Persistencia (localStorage) y lógica de E-commerce,
 * Logística tipo inDrive (Ofertas y SVG), Academia tipo Platzi (Syllabus, Video Player y Diplomas).
 */

// ==========================================
// ESTADO GLOBAL Y PERSISTENCIA (localStorage)
// ==========================================
const AppState = {
  cart: [],
  courses: [],
  completedClasses: [],
  customReviews: {},
  
  loadState: function() {
    const savedCart = localStorage.getItem('teloCart');
    const savedCourses = localStorage.getItem('teloCourses');
    const savedCompleted = localStorage.getItem('teloCompletedClasses');
    const savedReviews = localStorage.getItem('teloCustomReviews');
    
    if(savedCart) this.cart = JSON.parse(savedCart);
    if(savedCourses) this.courses = JSON.parse(savedCourses);
    if(savedCompleted) this.completedClasses = JSON.parse(savedCompleted);
    if(savedReviews) this.customReviews = JSON.parse(savedReviews);
  },
  
  saveState: function() {
    localStorage.setItem('teloCart', JSON.stringify(this.cart));
    localStorage.setItem('teloCourses', JSON.stringify(this.courses));
    localStorage.setItem('teloCompletedClasses', JSON.stringify(this.completedClasses));
    localStorage.setItem('teloCustomReviews', JSON.stringify(this.customReviews));
  }
};

// ==========================================
// CATÁLOGO DE PRODUCTOS (TELOSALES STORE)
// ==========================================
const productsDatabase = [
  {
    id: 'ts-101',
    title: 'Cover Magnético Transparente (MagSafe)',
    category: 'cases',
    price: 650,
    icon: '<img src="TeloCorp/IMG-20260515-WA0042.jpg" alt="Cover Magsafe">',
    images: ['TeloCorp/IMG-20260515-WA0042.jpg', 'TeloCorp/IMG-20260515-WA0044.jpg'],
    description: 'Estuche transparente ultra resistente con imanes MagSafe alineados para una carga inalámbrica más rápida y segura. Protege contra caídas sin ocultar el diseño original de tu dispositivo.',
    specs: {
      'Compatibilidad': 'iPhone 13, 14, 15 (Pro / Pro Max)',
      'Material': 'Policarbonato rígido y TPU flexible',
      'Protección': 'Antigolpes certificado militar',
      'Tecnología': 'Alineación magnética MagSafe'
    },
    reviews: [
      { user: 'Carlos M.', rating: 5, date: '28 May 2026', text: 'Excelente calidad. Los imanes se adhieren muy fuerte y el cover no se pone amarillo en los bordes.' },
      { user: 'Ana P.', rating: 4, date: '15 May 2026', text: 'Muy bueno, protege bien las lentes de las cámaras traseras.' }
    ]
  },
  {
    id: 'ts-102',
    title: 'Cover de Chupón Multi-color',
    category: 'cases',
    price: 450,
    icon: '<img src="TeloCorp/IMG-20260515-WA0041.jpg" alt="Cover Chupón">',
    images: ['TeloCorp/IMG-20260515-WA0041.jpg', 'TeloCorp/IMG-20260515-WA0043.jpg'],
    description: 'Divertido protector con ventosas integradas ("chupones") que permiten adherir temporalmente el celular a superficies lisas como espejos o azulejos. Ideal para tomar selfies o grabar videos cómodamente.',
    specs: {
      'Compatibilidad': 'Universal iPhone y Samsung S-Series',
      'Material': 'Silicona suave flexible',
      'Ventosas': '24 mini ventosas de succión fuerte',
      'Bordes': 'Elevados para protección de pantalla'
    },
    reviews: [
      { user: 'Julio R.', rating: 5, date: '20 May 2026', text: 'Perfecto para grabar contenidos frente al espejo sin usar trípode.' }
    ]
  },
  {
    id: 'ts-103',
    title: 'Cover Básico TPU Variados',
    category: 'cases',
    price: 300,
    icon: '<img src="TeloCorp/IMG-20260515-WA0044.jpg" alt="Cover Basico">',
    images: ['TeloCorp/IMG-20260515-WA0044.jpg', 'TeloCorp/IMG-20260515-WA0040.jpg'],
    description: 'El forro estándar de alta durabilidad. Delgado, ligero y con textura antideslizante para evitar caídas accidentales. Fácil de limpiar y de colocar.',
    specs: {
      'Compatibilidad': 'Todos los modelos de iPhone y Android',
      'Material': 'TPU (Poliuretano termoplástico) flexible',
      'Acabado': 'Mate anti-huellas',
      'Grosor': '1.2 mm ultra liviano'
    },
    reviews: [
      { user: 'Diana B.', rating: 4, date: '10 May 2026', text: 'Sencillo, cumple su función de protección a un precio inigualable.' }
    ]
  },
  {
    id: 'ts-104',
    title: 'Cover "Anti-Gravedad" Adhesivo',
    category: 'cases',
    price: 500,
    icon: '<img src="TeloCorp/IMG-20260515-WA0040.jpg" alt="Anti-Gravity">',
    images: ['TeloCorp/IMG-20260515-WA0040.jpg', 'TeloCorp/IMG-20260515-WA0042.jpg'],
    description: 'Forro premium con tecnología de micro-succión nano-métrica que se adhiere a ventanas, espejos, pizarras y metales sin dejar ningún residuo pegajoso en la superficie.',
    specs: {
      'Compatibilidad': 'iPhone 12 / 13 / 14 / 15',
      'Material': 'Nano-material autoadherente y TPU',
      'Mantenimiento': 'Lavable con agua simple para reactivar agarre',
      'Tecnología': 'Micro-succión al vacío'
    },
    reviews: [
      { user: 'Marcos T.', rating: 5, date: '18 May 2026', text: 'Sorprendente, se pega en los espejos del gym de forma firme para grabarse.' }
    ]
  },
  {
    id: 'ts-105',
    title: 'Cover de Cuero Premium MagSafe',
    category: 'cases',
    price: 850,
    icon: '<img src="TeloCorp/IMG-20260515-WA0043.jpg" alt="Cuero Premium">',
    images: ['TeloCorp/IMG-20260515-WA0043.jpg', 'TeloCorp/IMG-20260515-WA0041.jpg'],
    description: 'Estuche de cuero sintético italiano de alta calidad con textura agradable al tacto. Admite carga inalámbrica MagSafe y posee un recubrimiento interno de microfibra para no rayar el dispositivo.',
    specs: {
      'Compatibilidad': 'iPhone 14 / 15 Pro y Pro Max',
      'Material': 'Cuero sintético eco-friendly y microfibra',
      'Sensación': 'Soft-touch de alta gama',
      'Corte': 'Botones de aluminio mecanizado'
    },
    reviews: [
      { user: 'Roberto S.', rating: 5, date: '30 May 2026', text: 'Se siente muy premium. El empaque y los acabados son excelentes.' }
    ]
  },
  {
    id: 'ts-106',
    title: 'Cover Armor con Anillo Metálico',
    category: 'cases',
    price: 700,
    icon: '<img src="TeloCorp/IMG-20260515-WA0045.jpg" alt="Armor Ring">',
    images: ['TeloCorp/IMG-20260515-WA0045.jpg', 'TeloCorp/IMG-20260515-WA0042.jpg'],
    description: 'Funda de protección extrema blindada para caídas industriales de alto impacto. Cuenta con un soporte de anillo giratorio de 360 grados integrado y placa metálica compatible con soportes magnéticos de autos.',
    specs: {
      'Compatibilidad': 'iPhone, Samsung A & S Series',
      'Material': 'Chasis de Policarbonato y TPU híbrido militar',
      'Anillo': 'Girable 360° soporte horizontal',
      'Metal': 'Placa integrada para imán de vehículo'
    },
    reviews: [
      { user: 'Wilson N.', rating: 4, date: '22 May 2026', text: 'Super resistente. Ideal para los que trabajamos al aire libre. Un poco pesado pero vale la pena.' }
    ]
  },
  {
    id: 'ts-201',
    title: 'Cargador Rápido 20W Type-C',
    category: 'tech',
    price: 800,
    icon: '🔌',
    images: [],
    description: 'Adaptador de corriente USB-C de 20W ultra eficiente. Ofrece una carga rápida y segura para teléfonos móviles y tabletas, permitiendo cargar hasta el 50% de batería en solo 30 minutos.',
    specs: {
      'Conector': 'USB-C hembra',
      'Potencia': '20W Máxima entrega',
      'Voltajes': '5V/3A, 9V/2.22A',
      'Certificados': 'CE, FCC, RoHS protección térmica'
    },
    reviews: [
      { user: 'Gabriela M.', rating: 5, date: '29 May 2026', text: 'Carga super rápido mi teléfono y no se calienta nada.' }
    ]
  },
  {
    id: 'ts-202',
    title: 'Audífonos Inalámbricos Pro',
    category: 'tech',
    price: 1500,
    icon: '🎧',
    images: [],
    description: 'Audífonos in-ear de conexión inalámbrica Bluetooth 5.3 estable. Ofrecen sonido de alta fidelidad, cancelación pasiva de ruido y hasta 24 horas de reproducción total utilizando el estuche de carga inteligente.',
    specs: {
      'Conexión': 'Bluetooth 5.3 alcance 10 metros',
      'Autonomía': '6 horas uso continuo (+18 horas con estuche)',
      'Batería': 'Estuche recargable vía Type-C',
      'Extras': 'Sensores táctiles y micrófono integrado HD'
    },
    reviews: [
      { user: 'Esteban F.', rating: 4, date: '27 May 2026', text: 'El sonido es nítido y la batería dura un montón. Se emparejan rapidísimo.' }
    ]
  }
];

// ==========================================
// CATÁLOGO DE CURSOS (TELOEDUCA ACADEMY)
// ==========================================
const coursesDatabase = [
  {
    id: 'te-01',
    title: 'Excel Avanzado para Negocios',
    duration: '4 Semanas',
    price: 2500,
    icon: '📊',
    school: 'business',
    lecturesCount: 12,
    teacher: 'Ing. Ramón Almonte',
    modules: [
      {
        title: 'Módulo 1: Fundamentos y Atajos de Productividad',
        classes: [
          { id: 'te-01-c1', title: 'Clase 1: Configuración del Entorno Eficiente', duration: '10:00' },
          { id: 'te-01-c2', title: 'Clase 2: Atajos Esenciales y Formato Condicional', duration: '12:30' },
          { id: 'te-01-c3', title: 'Clase 3: Gestión e Importación de Grandes Datos', duration: '15:10' }
        ]
      },
      {
        title: 'Módulo 2: Fórmulas y Funciones Avanzadas',
        classes: [
          { id: 'te-01-c4', title: 'Clase 4: BuscarV, BuscarX y Desref', duration: '18:20' },
          { id: 'te-01-c5', title: 'Clase 5: Fórmulas Lógicas y de Texto Anidadas', duration: '14:40' },
          { id: 'te-01-c6', title: 'Clase 6: Fórmulas Matriciales Dinámicas', duration: '16:00' }
        ]
      },
      {
        title: 'Módulo 3: Análisis y Visualización Profesional',
        classes: [
          { id: 'te-01-c7', title: 'Clase 7: Tablas Dinámicas y Segmentadores', duration: '20:15' },
          { id: 'te-01-c8', title: 'Clase 8: Gráficos Interactivos y Dashboards', duration: '18:50' },
          { id: 'te-01-c9', title: 'Clase 9: Análisis de Escenarios y Buscar Objetivo', duration: '15:30' }
        ]
      },
      {
        title: 'Módulo 4: Automatización Básica',
        classes: [
          { id: 'te-01-c10', title: 'Clase 10: Grabadora de Macros y Sintaxis VBA', duration: '22:10' },
          { id: 'te-01-c11', title: 'Clase 11: Automatizando Reportes Mensuales', duration: '19:40' },
          { id: 'te-01-c12', title: 'Clase 12: Examen Final y Cierre de Taller', duration: '25:00' }
        ]
      }
    ]
  },
  {
    id: 'te-02',
    title: 'Inglés para Call Center',
    duration: '8 Semanas',
    price: 4000,
    icon: '🗣️',
    school: 'languages',
    lecturesCount: 8,
    teacher: 'Sarah Higgins, Ph.D.',
    modules: [
      {
        title: 'Módulo 1: Fonética y Fluidez Inicial',
        classes: [
          { id: 'te-02-c1', title: 'Clase 1: Reducciones y Enlaces Nativos', duration: '14:20' },
          { id: 'te-02-c2', title: 'Clase 2: Manejo de Entonación y Acento Neutro', duration: '16:45' }
        ]
      },
      {
        title: 'Módulo 2: Vocabulario de Servicio al Cliente',
        classes: [
          { id: 'te-02-c3', title: 'Clase 3: Terminología Técnica e Instrucciones', duration: '18:10' },
          { id: 'te-02-c4', title: 'Clase 4: Frases de Empatía y Escucha Activa', duration: '15:30' }
        ]
      },
      {
        title: 'Módulo 3: Resolución de Conflictos Telefónicos',
        classes: [
          { id: 'te-02-c5', title: 'Clase 5: Clientes Iracundos y De-escalation', duration: '20:10' },
          { id: 'te-02-c6', title: 'Clase 6: Compensación, Reembolsos y Políticas', duration: '17:50' }
        ]
      },
      {
        title: 'Módulo 4: Simulacros Reales (Roleplay)',
        classes: [
          { id: 'te-02-c7', title: 'Clase 7: Simulación de Llamadas de Soporte', duration: '22:30' },
          { id: 'te-02-c8', title: 'Clase 8: Examen de Aptitud Oral Final', duration: '24:00' }
        ]
      }
    ]
  },
  {
    id: 'te-03',
    title: 'Ingeniería de Prompts e IA',
    duration: '3 Semanas',
    price: 3000,
    icon: '🤖',
    school: 'tech',
    lecturesCount: 6,
    teacher: 'Dr. Héctor Gómez',
    modules: [
      {
        title: 'Módulo 1: Fundamentos de LLMs',
        classes: [
          { id: 'te-03-c1', title: 'Clase 1: Cómo Piensan los Modelos de Lenguaje', duration: '12:00' },
          { id: 'te-03-c2', title: 'Clase 2: Anatomía de un Prompt Perfecto', duration: '14:30' }
        ]
      },
      {
        title: 'Módulo 2: Técnicas de Prompting Avanzado',
        classes: [
          { id: 'te-03-c3', title: 'Clase 3: Zero-Shot, Few-Shot y Chain-of-Thought', duration: '18:15' },
          { id: 'te-03-c4', title: 'Clase 4: Metaprompting y Roles Dinámicos', duration: '16:50' }
        ]
      },
      {
        title: 'Módulo 3: Aplicación en Flujos de Trabajo',
        classes: [
          { id: 'te-03-c5', title: 'Clase 5: Automatización de Tareas con APIs', duration: '21:00' },
          { id: 'te-03-c6', title: 'Clase 6: Proyecto Práctico: Asistente Customizado', duration: '23:40' }
        ]
      }
    ]
  }
];

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  AppState.loadState();
  
  initNavigation();
  renderProducts('all');
  renderPlatziCourses('all');
  updateCartUI();
  setupContactForm();
  setupPlatziDashboard();
  
  // Mostrar la vista de inicio por defecto
  window.switchAppView('home-view');
});

// ==========================================
// NAVEGACIÓN TIPO APP (SPA)
// ==========================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      window.switchAppView(targetId);
    });
  });
  
  // Filtros de TeloSales
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      filterChips.forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderProducts(e.currentTarget.getAttribute('data-cat'));
    });
  });
}

window.switchAppView = function(viewId) {
  // Pausar fake video si salimos de la clase
  if(viewId !== 'educa-classroom-view' && isVideoPlaying) {
    window.togglePlayPauseVideo();
  }

  // Ocultar todas las vistas
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Desmarcar navs
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.classList.remove('active');
    if(nav.getAttribute('data-target') === viewId) {
      nav.classList.add('active');
    }
  });
  
  // Mostrar la vista seleccionada
  const targetView = document.getElementById(viewId);
  if(targetView) targetView.classList.add('active');
  
  // Actualizar título global si existe
  const titleMap = {
    'home-view': 'Bienvenido al Cluster',
    'sales-view': 'TeloSales Store',
    'educa-view': 'Academia TeloEduca',
    'educa-classroom-view': 'Aula de Clases TeloEduca',
    'lleva-view': 'Logística TeloLleva',
    'repara-view': 'Soporte Técnico TeloRepara',
    'instala-view': 'Instalaciones TeloInstala',
    'support-view': 'Hub Administrativo Central'
  };
  const titleEl = document.getElementById('current-view-title');
  if(titleEl && titleMap[viewId]) {
    titleEl.innerText = titleMap[viewId];
  }
};

// ==========================================
// RENDERIZADO DE TELOSALES (GRID & ADD)
// ==========================================
function renderProducts(category) {
  const grid = document.getElementById('sales-products-grid');
  if(!grid) return;
  grid.innerHTML = '';
  
  const filtered = category === 'all' 
    ? productsDatabase 
    : productsDatabase.filter(p => p.category === category);
    
  if(filtered.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted)">No hay productos en esta categoría.</p>`;
    return;
  }
  
  filtered.forEach(product => {
    const isAdded = AppState.cart.find(item => item.id === product.id);
    const btnText = isAdded ? 'Añadir Más' : 'Agregar al Carrito';
    
    grid.innerHTML += `
      <div class="product-card">
        <div class="product-image" onclick="window.openProductModal('${product.id}')" style="cursor:pointer;">${product.icon}</div>
        <div class="product-info">
          <h3 class="product-title" onclick="window.openProductModal('${product.id}')" style="cursor:pointer;">${product.title}</h3>
          <span class="product-price">RD$ ${product.price.toFixed(2)}</span>
          <button class="btn btn-primary" onclick="window.addToCart('${product.id}')">${btnText}</button>
        </div>
      </div>
    `;
  });
}

window.addToCart = function(productId) {
  const product = productsDatabase.find(p => p.id === productId);
  if(!product) return;
  
  const existing = AppState.cart.find(item => item.id === productId);
  if(existing) {
    existing.quantity += 1;
  } else {
    AppState.cart.push({ ...product, quantity: 1 });
  }
  
  AppState.saveState();
  updateCartUI();
  window.showToast(`Añadido: ${product.title}`, 'success');
  
  // Re-render para actualizar botón
  const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
  renderProducts(activeFilter);
};

// ==========================================
// TELOSALES: PRODUCT DETAIL MODAL & CUSTOM REVIEWS
// ==========================================
let modalActiveProductId = null;
let modalProductQuantity = 1;

window.openProductModal = function(productId) {
  const product = productsDatabase.find(p => p.id === productId);
  if(!product) return;
  
  modalActiveProductId = productId;
  modalProductQuantity = 1;
  document.getElementById('modal-quantity').innerText = '1';
  
  document.getElementById('modal-product-title').innerText = product.title;
  document.getElementById('modal-product-price').innerText = `RD$ ${product.price.toFixed(2)}`;
  document.getElementById('modal-product-description').innerText = product.description;
  
  // Render main image
  document.getElementById('modal-product-image-container').innerHTML = product.icon;
  
  // Render Thumbnails
  const thumbsContainer = document.getElementById('modal-product-thumbs');
  thumbsContainer.innerHTML = '';
  
  if (product.images && product.images.length > 0) {
    product.images.forEach((img, index) => {
      thumbsContainer.innerHTML += `
        <div class="modal-thumb ${index === 0 ? 'active' : ''}" onclick="window.switchModalImage(this, '${img}')">
          <img src="${img}" alt="Thumbnail ${index}">
        </div>
      `;
    });
  } else {
    thumbsContainer.innerHTML = `
      <div class="modal-thumb active">
        ${product.icon}
      </div>
    `;
  }
  
  // Render Specs table
  const specsTable = document.getElementById('modal-product-specs');
  specsTable.innerHTML = '';
  for (const [key, value] of Object.entries(product.specs)) {
    specsTable.innerHTML += `
      <tr>
        <td>${key}</td>
        <td>${value}</td>
      </tr>
    `;
  }
  
  // Render Reviews
  renderModalReviews();
  
  // Display Modal
  document.getElementById('product-modal-overlay').classList.add('active');
  document.getElementById('product-modal').classList.add('active');
};

window.switchModalImage = function(element, imgPath) {
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  element.classList.add('active');
  document.getElementById('modal-product-image-container').innerHTML = `<img src="${imgPath}" alt="Detail Image">`;
};

window.closeProductModal = function() {
  document.getElementById('product-modal-overlay').classList.remove('active');
  document.getElementById('product-modal').classList.remove('active');
};

window.adjustModalQuantity = function(delta) {
  modalProductQuantity += delta;
  if(modalProductQuantity < 1) modalProductQuantity = 1;
  document.getElementById('modal-quantity').innerText = modalProductQuantity;
};

window.addModalProductToCart = function() {
  const product = productsDatabase.find(p => p.id === modalActiveProductId);
  if(!product) return;
  
  const existing = AppState.cart.find(item => item.id === modalActiveProductId);
  if(existing) {
    existing.quantity += modalProductQuantity;
  } else {
    AppState.cart.push({ ...product, quantity: modalProductQuantity });
  }
  
  AppState.saveState();
  updateCartUI();
  window.closeProductModal();
  window.showToast(`Añadido al carrito: ${product.title} (x${modalProductQuantity})`, 'success');
  
  const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
  renderProducts(activeFilter);
};

function renderModalReviews() {
  const product = productsDatabase.find(p => p.id === modalActiveProductId);
  if(!product) return;
  
  const listContainer = document.getElementById('modal-product-reviews-list');
  if(!listContainer) return;
  listContainer.innerHTML = '';
  
  // Base reviews
  let list = [...product.reviews];
  
  // Custom reviews
  if(AppState.customReviews[modalActiveProductId]) {
    list = [...AppState.customReviews[modalActiveProductId], ...list];
  }
  
  // Calculate average rating
  let totalRating = 0;
  list.forEach(r => totalRating += r.rating);
  const avg = list.length > 0 ? (totalRating / list.length).toFixed(1) : '5.0';
  
  // Place average stars
  const starsCount = Math.round(parseFloat(avg));
  document.getElementById('modal-product-stars').innerText = '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount);
  document.getElementById('modal-product-reviews-count').innerText = `(${list.length} reseñas • Promedio: ${avg})`;
  
  list.forEach(r => {
    listContainer.innerHTML += `
      <div class="modal-review-item">
        <div class="review-header">
          <span class="review-user">${r.user}</span>
          <span class="review-stars">${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
        </div>
        <div class="review-date">${r.date}</div>
        <div class="review-text">${r.text}</div>
      </div>
    `;
  });
}

window.submitProductReview = function() {
  const commentInput = document.getElementById('review-comment-input');
  const commentText = commentInput.value.trim();
  if(!commentText) {
    window.showToast('Por favor escribe tu reseña en el campo', 'error');
    return;
  }
  
  // Get rating value from checked radio input
  const ratingElements = document.getElementsByName('rate');
  let ratingVal = 5;
  for(let i = 0; i < ratingElements.length; i++) {
    if(ratingElements[i].checked) {
      ratingVal = parseInt(ratingElements[i].value);
      break;
    }
  }
  
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const newReview = {
    user: 'Tú (Comprador)',
    rating: ratingVal,
    date: new Date().toLocaleDateString('es-ES', dateOptions),
    text: commentText
  };
  
  if(!AppState.customReviews[modalActiveProductId]) {
    AppState.customReviews[modalActiveProductId] = [];
  }
  AppState.customReviews[modalActiveProductId].push(newReview);
  
  AppState.saveState();
  commentInput.value = '';
  window.showToast('Muchas gracias por calificar nuestro producto', 'success');
  
  // Refresh reviews list
  renderModalReviews();
};

// ==========================================
// MANEJO DEL CARRITO LATERAL (DRAWER)
// ==========================================
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');

document.getElementById('global-cart-btn')?.addEventListener('click', window.toggleCart);
cartOverlay?.addEventListener('click', window.toggleCart);

window.toggleCart = function() {
  if(!cartDrawer) return;
  cartDrawer.classList.toggle('active');
  if(cartOverlay) cartOverlay.classList.toggle('active');
};

function updateCartUI() {
  const badge = document.getElementById('global-cart-badge');
  const itemsContainer = document.getElementById('cart-items-container');
  const totalPriceEl = document.getElementById('cart-total-price');
  
  if(!badge || !itemsContainer || !totalPriceEl) return;
  
  let totalItems = 0;
  let totalPrice = 0;
  itemsContainer.innerHTML = '';
  
  if(AppState.cart.length === 0) {
    itemsContainer.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top:40px;">El carrito está vacío</p>';
  } else {
    AppState.cart.forEach(item => {
      totalItems += item.quantity;
      totalPrice += (item.price * item.quantity);
      
      itemsContainer.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-icon">${item.icon}</div>
          <div class="cart-item-info" style="flex:1;">
            <h4>${item.title}</h4>
            <span style="color:var(--color-sales)">RD$ ${item.price.toFixed(2)}</span>
            <div class="cart-item-actions">
              <button onclick="window.updateQuantity('${item.id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="window.updateQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
      `;
    });
  }
  
  badge.innerText = totalItems;
  totalPriceEl.innerText = `RD$ ${totalPrice.toFixed(2)}`;
}

window.updateQuantity = function(id, delta) {
  const item = AppState.cart.find(i => i.id === id);
  if(item) {
    item.quantity += delta;
    if(item.quantity <= 0) {
      AppState.cart = AppState.cart.filter(i => i.id !== id);
    }
    AppState.saveState();
    updateCartUI();
  }
};

window.checkoutCart = function() {
  if(AppState.cart.length === 0) {
    window.showToast('El carrito está vacío', 'error');
    return;
  }
  window.showToast('Simulando procesamiento de pago...', 'success');
  setTimeout(() => {
    AppState.cart = [];
    AppState.saveState();
    updateCartUI();
    window.toggleCart();
    window.showToast('¡Compra simulada con éxito!', 'success');
    const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
    renderProducts(activeFilter);
  }, 1500);
};

// ==========================================
// TELOEDUCA: DASHBOARD & PLATZI PORTAL
// ==========================================
function setupPlatziDashboard() {
  const pathCards = document.querySelectorAll('.path-card');
  pathCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const pathType = e.currentTarget.getAttribute('data-path');
      pathCards.forEach(c => c.style.borderColor = 'var(--border-color)');
      e.currentTarget.style.borderColor = 'var(--color-educa)';
      renderPlatziCourses(pathType);
    });
  });
}

window.updateGlobalProgress = function() {
  const progressPercentText = document.getElementById('global-progress-percentage');
  const progressBarFilled = document.getElementById('global-progress-bar-filled');
  
  if(!progressPercentText || !progressBarFilled) return;
  if(AppState.courses.length === 0) {
    progressPercentText.innerText = '0% completado (Matricúlate en un taller)';
    progressBarFilled.style.width = '0%';
    return;
  }
  
  let totalClasses = 0;
  let completedCount = 0;
  
  AppState.courses.forEach(courseId => {
    const course = coursesDatabase.find(c => c.id === courseId);
    if(course) {
      course.modules.forEach(m => {
        m.classes.forEach(cls => {
          totalClasses += 1;
          if(AppState.completedClasses.includes(cls.id)) {
            completedCount += 1;
          }
        });
      });
    }
  });
  
  if(totalClasses === 0) {
    progressPercentText.innerText = '0% completado';
    progressBarFilled.style.width = '0%';
    return;
  }
  
  const percentage = Math.round((completedCount / totalClasses) * 100);
  progressPercentText.innerText = `${percentage}% completado (${completedCount} de ${totalClasses} clases)`;
  progressBarFilled.style.width = `${percentage}%`;
};

function renderPlatziCourses(pathFilter = 'all') {
  const grid = document.getElementById('educa-courses-grid');
  if(!grid) return;
  grid.innerHTML = '';
  
  const filtered = pathFilter === 'all'
    ? coursesDatabase
    : coursesDatabase.filter(c => c.school === pathFilter);
    
  filtered.forEach(course => {
    const isEnrolled = AppState.courses.includes(course.id);
    const btnText = isEnrolled ? '📚 Ver Curso (Aula)' : 'Inscribirse Gratis';
    const btnClass = isEnrolled ? 'btn-secondary' : 'btn-primary';
    
    // Find course progress
    let courseClassesCount = 0;
    let courseCompletedCount = 0;
    course.modules.forEach(m => {
      m.classes.forEach(c => {
        courseClassesCount++;
        if(AppState.completedClasses.includes(c.id)) {
          courseCompletedCount++;
        }
      });
    });
    
    const courseProgPercent = courseClassesCount > 0 ? Math.round((courseCompletedCount / courseClassesCount) * 100) : 0;
    
    grid.innerHTML += `
      <div class="course-card" style="border-color:${isEnrolled ? 'var(--color-educa)' : 'var(--border-color)'};">
        <div class="product-image" style="background:#0c1322; font-size: 3rem;">${course.icon}</div>
        <div class="product-info">
          <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--color-educa); letter-spacing:1px; margin-bottom:4px;">${course.school === 'tech' ? 'Tecnología & IA' : course.school === 'business' ? 'Negocios y Oficina' : 'Idiomas y Call Center'}</span>
          <h3 class="product-title" style="font-size:1.15rem;">${course.title}</h3>
          <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:4px;">👨‍🏫 Prof: ${course.teacher}</p>
          <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:12px;">🕒 ${course.duration} • 📖 ${courseClassesCount} Clases</p>
          
          ${isEnrolled ? `
            <div style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                <span>Progreso:</span>
                <strong>${courseProgPercent}%</strong>
              </div>
              <div class="progress-bar-small">
                <div class="progress-bar-small-filled" style="width: ${courseProgPercent}%;"></div>
              </div>
            </div>
          ` : `
            <span class="product-price" style="color:var(--color-educa); margin-bottom:16px;">Gratuito (Acceso Central)</span>
          `}
          <button class="btn ${btnClass} w-100" onclick="window.enterCourse('${course.id}')">${btnText}</button>
        </div>
      </div>
    `;
  });
  
  window.updateGlobalProgress();
}

// ==========================================
// TELOEDUCA: CLASSROOM VIDEO PLAYER & ACCORDION TEMARIO
// ==========================================
let activeCourseId = null;
let activeLectureId = null;
let videoInterval = null;
let videoProgressVal = 0;
let isVideoPlaying = false;

window.enterCourse = function(courseId) {
  const course = coursesDatabase.find(c => c.id === courseId);
  if(!course) return;
  
  if(!AppState.courses.includes(courseId)) {
    AppState.courses.push(courseId);
    AppState.saveState();
    renderPlatziCourses();
    window.showToast(`¡Matrícula exitosa en ${course.title}!`, 'success');
  }
  
  activeCourseId = courseId;
  
  // Set default active lecture to first class
  if(course.modules.length > 0 && course.modules[0].classes.length > 0) {
    activeLectureId = course.modules[0].classes[0].id;
  }
  
  // Load Classroom View
  window.switchAppView('educa-classroom-view');
  
  // Render Classroom Contents
  loadClassroomContent();
};

function loadClassroomContent() {
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  if(!course) return;
  
  document.getElementById('classroom-course-title').innerText = course.title;
  
  // Find active lecture
  let activeLecture = null;
  course.modules.forEach(m => {
    const found = m.classes.find(c => c.id === activeLectureId);
    if(found) activeLecture = found;
  });
  
  if(activeLecture) {
    document.getElementById('video-lecture-title').innerText = activeLecture.title;
    document.getElementById('classroom-lecture-title-sub').innerText = activeLecture.title;
    
    // Checkbox status button
    const isCompleted = AppState.completedClasses.includes(activeLectureId);
    const completeBtn = document.getElementById('btn-complete-class');
    if(isCompleted) {
      completeBtn.innerText = 'Completada ✓ (Desmarcar)';
      completeBtn.className = 'btn btn-secondary';
    } else {
      completeBtn.innerText = 'Marcar como Completada ✓';
      completeBtn.className = 'btn btn-primary';
    }
  }
  
  // Reset fake video player
  clearInterval(videoInterval);
  isVideoPlaying = false;
  videoProgressVal = 0;
  document.getElementById('player-btn-play').innerText = '▶️';
  document.getElementById('video-play-icon').innerText = '▶️';
  document.getElementById('player-progress-filled').style.width = '0%';
  document.getElementById('player-time-display').innerText = `00:00 / ${activeLecture ? activeLecture.duration : '10:00'}`;
  
  // Render Syllabus
  renderSyllabus();
  
  // Load Comments
  loadForumComments();
}

function renderSyllabus() {
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  const container = document.getElementById('classroom-syllabus-container');
  if(!course || !container) return;
  
  container.innerHTML = '';
  
  let totalClasses = 0;
  let completedClasses = 0;
  
  course.modules.forEach((module, mIdx) => {
    let classesHTML = '';
    module.classes.forEach(cls => {
      totalClasses++;
      const isCompleted = AppState.completedClasses.includes(cls.id);
      if(isCompleted) completedClasses++;
      
      const isActive = cls.id === activeLectureId;
      
      classesHTML += `
        <div class="class-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}" onclick="window.selectClassroomLecture('${cls.id}')">
          <span>${cls.title} (${cls.duration})</span>
          <div class="class-checkbox">
            ${isCompleted ? '✓' : ''}
          </div>
        </div>
      `;
    });
    
    container.innerHTML += `
      <div class="syllabus-module">
        <div class="module-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
          <span>${module.title}</span>
          <span>▼</span>
        </div>
        <div class="module-classes">
          ${classesHTML}
        </div>
      </div>
    `;
  });
  
  // Progress calculations
  const percent = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
  document.getElementById('syllabus-progress-percent').innerText = `${percent}%`;
  document.getElementById('syllabus-progress-bar-filled').style.width = `${percent}%`;
  
  // Show certificate if 100% complete
  const certBox = document.getElementById('syllabus-cert-unlock-box');
  if (percent === 100) {
    certBox.style.display = 'block';
  } else {
    certBox.style.display = 'none';
  }
}

window.selectClassroomLecture = function(lectureId) {
  activeLectureId = lectureId;
  loadClassroomContent();
};

window.toggleCompleteClass = function() {
  const isCompleted = AppState.completedClasses.includes(activeLectureId);
  if(isCompleted) {
    AppState.completedClasses = AppState.completedClasses.filter(id => id !== activeLectureId);
    window.showToast('Clase marcada como pendiente', 'error');
  } else {
    AppState.completedClasses.push(activeLectureId);
    window.showToast('¡Clase completada! Sigue así.', 'success');
  }
  AppState.saveState();
  
  // Refresh classroom UI
  loadClassroomContent();
  renderPlatziCourses();
};

// ==========================================
// FAKE VIDEO CONTROLLER
// ==========================================
window.togglePlayPauseVideo = function() {
  const playBtn = document.getElementById('player-btn-play');
  const overlayPlay = document.getElementById('video-play-icon');
  const progressFilled = document.getElementById('player-progress-filled');
  const timeDisplay = document.getElementById('player-time-display');
  
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  let lecture = null;
  course.modules.forEach(m => {
    const found = m.classes.find(c => c.id === activeLectureId);
    if(found) lecture = found;
  });
  
  const durationStr = lecture ? lecture.duration : '10:00';
  const durationSec = parseDurationToSeconds(durationStr);
  
  if (isVideoPlaying) {
    clearInterval(videoInterval);
    isVideoPlaying = false;
    playBtn.innerText = '▶️';
    overlayPlay.innerText = '▶️';
  } else {
    isVideoPlaying = true;
    playBtn.innerText = '⏸️';
    overlayPlay.innerText = '';
    
    videoInterval = setInterval(() => {
      videoProgressVal += 1;
      if (videoProgressVal >= durationSec) {
        clearInterval(videoInterval);
        isVideoPlaying = false;
        playBtn.innerText = '▶️';
        overlayPlay.innerText = '▶️';
        videoProgressVal = durationSec;
        
        // Auto complete class!
        if(!AppState.completedClasses.includes(activeLectureId)) {
          window.toggleCompleteClass();
        }
      }
      
      const pct = (videoProgressVal / durationSec) * 100;
      progressFilled.style.width = `${pct}%`;
      timeDisplay.innerText = `${formatSecondsToTime(videoProgressVal)} / ${durationStr}`;
    }, 1000);
  }
};

function parseDurationToSeconds(str) {
  const pts = str.split(':');
  if (pts.length === 2) {
    return parseInt(pts[0]) * 60 + parseInt(pts[1]);
  }
  return 600;
}

function formatSecondsToTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

window.seekVideo = function(event) {
  const bar = event.currentTarget;
  const clickX = event.offsetX;
  const width = bar.clientWidth;
  const pct = clickX / width;
  
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  let lecture = null;
  course.modules.forEach(m => {
    const found = m.classes.find(c => c.id === activeLectureId);
    if(found) lecture = found;
  });
  
  const durationStr = lecture ? lecture.duration : '10:00';
  const durationSec = parseDurationToSeconds(durationStr);
  
  videoProgressVal = Math.round(pct * durationSec);
  
  document.getElementById('player-progress-filled').style.width = `${pct * 100}%`;
  document.getElementById('player-time-display').innerText = `${formatSecondsToTime(videoProgressVal)} / ${durationStr}`;
  
  if (isVideoPlaying) {
    clearInterval(videoInterval);
    isVideoPlaying = false;
    window.togglePlayPauseVideo();
  }
};

window.toggleVideoFullscreen = function() {
  window.showToast('Pantalla Completa Simulada', 'success');
};

// ==========================================
// CLASSROOM TAB HEADERS & COMMUNITY FORUM
// ==========================================
window.switchClassroomTab = function(event, tabId) {
  document.querySelectorAll('.tab-header-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
};

function loadForumComments() {
  const container = document.getElementById('forum-comments-container');
  if(!container) return;
  container.innerHTML = '';
  
  const defaultComments = {
    'te-01-c1': [
      { user: 'Juan Pérez', date: 'Hace 3 días', text: 'Excelente introducción, profe. Todo claro con la interfaz de cuadrículas.' },
      { user: 'Lucía Santos', date: 'Hace 5 días', text: '¿Se pueden cambiar los colores del tema por defecto de Excel en Mac?' }
    ],
    'te-02-c1': [
      { user: 'Mario Gómez', date: 'Hace 1 día', text: 'Me encantan los ejercicios de fonética, ayudan mucho a soltar la lengua.' }
    ]
  };
  
  let list = defaultComments[activeLectureId] || [
    { user: 'Estudiante Anónimo', date: 'Hace unos días', text: '¡Excelente clase! Súper práctica la explicación.' }
  ];
  
  // Custom comments from localStorage
  const savedComments = localStorage.getItem('teloLectureComments');
  if(savedComments) {
    const custom = JSON.parse(savedComments);
    if(custom[activeLectureId]) {
      list = [...list, ...custom[activeLectureId]];
    }
  }
  
  list.forEach(c => {
    container.innerHTML += `
      <div class="forum-post">
        <div class="forum-post-header">
          <span class="forum-post-user">${c.user}</span>
          <span>${c.date}</span>
        </div>
        <div class="forum-post-text">${c.text}</div>
      </div>
    `;
  });
  
  container.scrollTop = container.scrollHeight;
}

window.postForumQuestion = function() {
  const input = document.getElementById('forum-input');
  const text = input.value.trim();
  if(!text) return;
  
  const comment = {
    user: 'Tú (Estudiante)',
    date: 'Ahora mismo',
    text: text
  };
  
  let savedComments = localStorage.getItem('teloLectureComments');
  let custom = savedComments ? JSON.parse(savedComments) : {};
  
  if(!custom[activeLectureId]) custom[activeLectureId] = [];
  custom[activeLectureId].push(comment);
  
  localStorage.setItem('teloLectureComments', JSON.stringify(custom));
  
  input.value = '';
  window.showToast('Comentario publicado en la clase', 'success');
  loadForumComments();
};

// ==========================================
// TELOEDUCA: CERTIFICADO DE FINALIZACIÓN
// ==========================================
window.showCertificate = function() {
  let name = localStorage.getItem('teloStudentName');
  if(!name) {
    name = prompt("Escribe tu nombre completo para el diploma:");
    if(!name || !name.trim()) {
      window.showToast("Debes ingresar tu nombre completo para la credencial", "error");
      return;
    }
    localStorage.setItem('teloStudentName', name.trim());
  }
  
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  if(!course) return;
  
  document.getElementById('cert-student-name').innerText = name.toUpperCase();
  document.getElementById('cert-course-name').innerText = course.title;
  document.getElementById('cert-course-hours').innerText = course.id === 'te-01' ? '40 horas académicas' : course.id === 'te-02' ? '60 horas académicas' : '30 horas académicas';
  
  // Generar ID de credencial aleatorio
  const hash = Math.floor(100000 + Math.random() * 900000);
  document.getElementById('cert-credential-id').innerText = `TE-${course.id.toUpperCase()}-${hash}`;
  
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('cert-emission-date').innerText = new Date().toLocaleDateString('es-ES', dateOptions);
  
  // Show Modal
  document.getElementById('certificate-modal-overlay').classList.add('active');
  document.getElementById('certificate-modal').classList.add('active');
};

window.closeCertificateModal = function() {
  document.getElementById('certificate-modal-overlay').classList.remove('active');
  document.getElementById('certificate-modal').classList.remove('active');
};

window.printCertificate = function() {
  window.print();
};

// ==========================================
// TELOLLEVA: INDRIVE SYSTEM (NEGOTIATION & ROUTE SVG)
// ==========================================
let indriveBiddingTimer = null;
let indriveActiveDriver = null;

window.updateIndrivePrice = function() {
  const origen = document.getElementById('indrive-origen').value;
  const destino = document.getElementById('indrive-destino').value;
  
  let basePrice = 250;
  
  if (origen.startsWith('SD-') && destino.startsWith('Santiago-')) {
    basePrice = 2200;
  } else if (origen.startsWith('SD-') && destino.startsWith('LaVega-')) {
    basePrice = 1800;
  } else if (origen.startsWith('SD-') && destino.startsWith('PuntaCana-')) {
    basePrice = 4500;
  } else if (origen.startsWith('Santiago-') && destino.startsWith('LaVega-')) {
    basePrice = 800;
  } else if (origen === destino) {
    basePrice = 200;
  } else {
    basePrice = 1500;
  }
  
  document.getElementById('indrive-suggested-label').innerText = `RD$ ${basePrice}`;
  document.getElementById('indrive-user-fare').value = basePrice;
};

window.adjustIndriveOffer = function(delta) {
  const input = document.getElementById('indrive-user-fare');
  let val = parseInt(input.value) || 200;
  val += delta;
  if(val < 100) val = 100;
  input.value = val;
};

window.startIndriveNegotiation = function() {
  const userFare = parseInt(document.getElementById('indrive-user-fare').value) || 200;
  const origin = document.getElementById('indrive-origen').value;
  const destination = document.getElementById('indrive-destino').value;
  
  document.getElementById('indrive-request-card').style.display = 'none';
  const offersCard = document.getElementById('indrive-offers-card');
  offersCard.style.display = 'block';
  
  const offersList = document.getElementById('indrive-offers-list');
  offersList.innerHTML = '';
  
  // Set up SVG Map status
  const mapOverlay = document.getElementById('map-status-overlay');
  mapOverlay.innerText = `Buscando mensajeros para: ${origin} ➡️ ${destination}`;
  
  // Reset active icons
  document.getElementById('pin-origen').setAttribute('opacity', '0');
  document.getElementById('pin-destino').setAttribute('opacity', '0');
  document.getElementById('messenger-car').setAttribute('opacity', '0');
  document.getElementById('map-route-path').setAttribute('d', '');

  // Simulate counter offers in 2 seconds
  indriveBiddingTimer = setTimeout(() => {
    const drivers = [
      { name: 'Yohan Cabrera', avatar: '🏍️', rating: '4.9 ★', vehicle: 'Motor Honda Civ (SD Express)', price: userFare, distance: '6 mins' },
      { name: 'Manuel Ortiz', avatar: '🚗', rating: '4.8 ★', vehicle: 'Kia Picanto (Aire acondicionado)', price: Math.round(userFare * 1.2 / 10) * 10, distance: '8 mins' },
      { name: 'José Luis Medina', avatar: '⚡', rating: '5.0 ★', vehicle: 'Super-Motor Eléctrico (Super Rápido)', price: Math.round(userFare * 1.1 / 10) * 10, distance: '4 mins' }
    ];
    
    // Remove pulse text
    const pulsing = offersCard.querySelector('.searching-pulse');
    if(pulsing) pulsing.style.display = 'none';
    
    drivers.forEach(d => {
      offersList.innerHTML += `
        <div class="driver-offer-card">
          <div class="driver-profile">
            <div class="driver-avatar">${d.avatar}</div>
            <div class="driver-details">
              <h4>${d.name} <span class="driver-stars">${d.rating}</span></h4>
              <p>${d.vehicle} • ⏱️ ${d.distance}</p>
            </div>
          </div>
          <div class="driver-action">
            <span class="driver-price">RD$ ${d.price}</span>
            <button class="btn btn-primary btn-sm" onclick="window.acceptIndriveOffer('${d.name}', '${d.avatar}', ${d.price}, '${d.vehicle}')">Aceptar</button>
          </div>
        </div>
      `;
    });
  }, 2000);
};

window.acceptIndriveOffer = function(name, avatar, price, vehicle) {
  document.getElementById('indrive-offers-card').style.display = 'none';
  document.getElementById('indrive-status-card').style.display = 'block';
  
  indriveActiveDriver = { name, avatar, price, vehicle };
  
  // Inject mini profile
  document.getElementById('indrive-assigned-driver-info').innerHTML = `
    <div class="driver-avatar">${avatar}</div>
    <div style="flex:1;">
      <h4>${name} (Asignado)</h4>
      <p style="font-size:0.8rem; color:var(--text-muted);">${vehicle} • Placa: TL-992${Math.floor(Math.random()*90)+10}</p>
    </div>
    <strong style="color:var(--color-lleva); font-size:1.1rem;">RD$ ${price}</strong>
  `;
  
  // Trigger Map Route
  animateSVGRoute();
  
  // Set up chat
  const chatMsgs = document.getElementById('indrive-chat-messages');
  chatMsgs.innerHTML = '';
  
  // Welcome message from driver
  setTimeout(() => {
    appendIndriveChatMessage(name, `¡Hola! Voy de camino a recoger el envío en el punto acordado.`, 'driver');
  }, 1000);
};

function animateSVGRoute() {
  const pinA = document.getElementById('pin-origen');
  const pinB = document.getElementById('pin-destino');
  const car = document.getElementById('messenger-car');
  const path = document.getElementById('map-route-path');
  const mapOverlay = document.getElementById('map-status-overlay');
  
  const x1 = 100, y1 = 100;
  const x2 = 300, y2 = 300;
  
  // Place pins
  pinA.setAttribute('opacity', '1');
  pinA.setAttribute('transform', `translate(${x1}, ${y1})`);
  
  pinB.setAttribute('opacity', '1');
  pinB.setAttribute('transform', `translate(${x2}, ${y2})`);
  
  const pathD = `M ${x1} ${y1} L 300 100 L 300 300`;
  path.setAttribute('d', pathD);
  
  // Animate route
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;
  path.getBoundingClientRect(); // trigger reflow
  
  path.style.transition = 'stroke-dashoffset 8s linear';
  path.style.strokeDashoffset = '0';
  
  // Animate motorcycle along the route
  car.setAttribute('opacity', '1');
  car.setAttribute('transform', `translate(${x1}, ${y1})`);
  
  mapOverlay.innerText = `🛵 Conductor ${indriveActiveDriver.name} en camino al origen.`;
  document.getElementById('indrive-trip-status').innerText = 'En camino';
  document.getElementById('indrive-trip-status').style.background = 'rgba(245, 158, 11, 0.1)';
  document.getElementById('indrive-trip-status').style.color = 'var(--color-lleva)';
  
  let start = null;
  const duration = 8000;
  
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const percent = Math.min(progress / duration, 1);
    
    const currentLength = percent * length;
    const point = path.getPointAtLength(currentLength);
    
    car.setAttribute('transform', `translate(${point.x}, ${point.y})`);
    
    if (percent < 0.35) {
      mapOverlay.innerText = `🛵 Conductor ${indriveActiveDriver.name} retirando el envío...`;
    } else if (percent < 0.95) {
      document.getElementById('indrive-trip-status').innerText = 'En ruta';
      mapOverlay.innerText = `🚚 En tránsito al destino.`;
    } else {
      document.getElementById('indrive-trip-status').innerText = 'Entregado';
      document.getElementById('indrive-trip-status').style.background = 'rgba(16, 185, 129, 0.1)';
      document.getElementById('indrive-trip-status').style.color = '#10b981';
      mapOverlay.innerText = `✅ ¡Envío entregado con éxito por ${indriveActiveDriver.name}!`;
      appendIndriveChatMessage(indriveActiveDriver.name, `He entregado las mercancías con éxito. ¡Muchas gracias por confiar en TeloLleva!`, 'driver');
      window.showToast('Envío entregado con éxito', 'success');
    }
    
    if (progress < duration && indriveActiveDriver) {
      window.requestAnimationFrame(step);
    }
  }
  
  window.requestAnimationFrame(step);
}

window.sendIndriveChatMessage = function(event) {
  if (event.key === 'Enter') {
    window.triggerSendChatMessage();
  }
};

window.triggerSendChatMessage = function() {
  const input = document.getElementById('indrive-chat-input');
  const text = input.value.trim();
  if(!text) return;
  
  appendIndriveChatMessage('Tú', text, 'user');
  input.value = '';
  
  if(indriveActiveDriver) {
    setTimeout(() => {
      const answers = [
        "¡Excelente, copiado!",
        "Entendido. Estoy en camino sin retraso.",
        "Perfecto, ya estoy llegando al punto.",
        "¡Recibido! Le aviso inmediatamente al entregar.",
        "Sin problemas, voy con cuidado."
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      appendIndriveChatMessage(indriveActiveDriver.name, randomAnswer, 'driver');
    }, 1500);
  }
};

function appendIndriveChatMessage(sender, text, type) {
  const chatMsgs = document.getElementById('indrive-chat-messages');
  if(!chatMsgs) return;
  
  chatMsgs.innerHTML += `
    <div class="chat-msg ${type}">
      <strong>${sender}:</strong> ${text}
    </div>
  `;
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

window.cancelIndriveTrip = function() {
  clearTimeout(indriveBiddingTimer);
  indriveActiveDriver = null;
  
  document.getElementById('indrive-status-card').style.display = 'none';
  document.getElementById('indrive-offers-card').style.display = 'none';
  document.getElementById('indrive-request-card').style.display = 'block';
  
  document.getElementById('pin-origen').setAttribute('opacity', '0');
  document.getElementById('pin-destino').setAttribute('opacity', '0');
  document.getElementById('messenger-car').setAttribute('opacity', '0');
  document.getElementById('map-route-path').setAttribute('d', '');
  
  document.getElementById('map-status-overlay').innerText = 'Mapa fuera de línea - Ingrese ruta';
  window.showToast('Envío cancelado', 'error');
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if(!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// ==========================================
// WEB3FORMS CONTACT LOGIC (CENTRAL SOPORTE)
// ==========================================
window.updateFormSubject = function() {
  const dept = document.getElementById('contact-department').value;
  const subjectInput = document.getElementById('dynamic-subject');
  
  if(subjectInput) {
    subjectInput.value = `Nuevo requerimiento para: ${dept}`;
  }
};

function setupContactForm() {
  const form = document.getElementById('super-contact-form');
  if(!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const btn = document.getElementById('form-submit-btn');
    const oldText = btn.innerText;
    
    btn.innerText = 'Enviando...';
    btn.disabled = true;
    
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(async (response) => {
      if (response.status === 200) {
        window.showToast('Mensaje enviado exitosamente a la central.', 'success');
        form.reset();
      } else {
        const data = await response.json();
        if(data.message && data.message.includes('Invalid Access Key')) {
            window.showToast('Modo de Prueba: Simulación de envío exitosa. (Cambia el Access Key para envío real)', 'success');
            form.reset();
        } else {
            window.showToast('Error al enviar el formulario.', 'error');
        }
      }
    })
    .catch(error => {
      console.error(error);
      window.showToast('Error de conexión.', 'error');
    })
    .finally(() => {
      btn.innerText = oldText;
      btn.disabled = false;
    });
  });
}

// ==========================================
// TELOREPARA: COTIZACIONES & DIAGNÓSTICO EN VIVO
// ==========================================
window.updateReparaQuote = function() {
  const device = document.getElementById('repara-device').value;
  const issue = document.getElementById('repara-issue').value;
  
  let price = 1500;
  let time = "24-48 horas";
  
  if(device === 'phone') {
    if(issue === 'screen') { price = 2500; time = "2-4 horas"; }
    else if(issue === 'battery') { price = 1200; time = "1 hora"; }
    else if(issue === 'power') { price = 2000; time = "24 horas"; }
    else if(issue === 'water') { price = 3000; time = "48 horas"; }
    else { price = 800; time = "2 horas"; }
  } else if(device === 'laptop') {
    if(issue === 'screen') { price = 5500; time = "24-48 horas"; }
    else if(issue === 'battery') { price = 2800; time = "2 horas"; }
    else if(issue === 'power') { price = 4000; time = "3-5 días"; }
    else if(issue === 'water') { price = 5000; time = "3-5 días"; }
    else { price = 1500; time = "24 horas"; }
  } else if(device === 'tv') {
    if(issue === 'screen') { price = 8000; time = "3-5 días"; }
    else { price = 3500; time = "48 horas"; }
  } else if(device === 'appliance') {
    price = 3000; time = "24-72 horas";
  } else {
    price = 1500; time = "24 horas";
  }
  
  document.getElementById('repara-quote-price').innerText = `RD$ ${price.toLocaleString()}`;
  document.getElementById('repara-quote-time').innerText = time;
};

let reparaSimTimer1 = null;
let reparaSimTimer2 = null;
let reparaSimTimer3 = null;

window.bookReparaService = function() {
  const deviceSelect = document.getElementById('repara-device');
  const deviceText = deviceSelect.options[deviceSelect.selectedIndex].text;
  const issueSelect = document.getElementById('repara-issue');
  const issueText = issueSelect.options[issueSelect.selectedIndex].text;
  const address = document.getElementById('repara-address').value.trim();
  
  if(!address) {
    window.showToast("Por favor ingresa una dirección de recogida", "error");
    return;
  }
  
  const tracker = document.getElementById('repara-tracker-card');
  tracker.style.display = 'block';
  tracker.scrollIntoView({ behavior: 'smooth' });
  
  document.querySelectorAll('.repara-step').forEach((s, idx) => {
    if(idx === 0) s.classList.add('active');
    else s.classList.remove('active');
  });
  
  document.getElementById('rep-date-1').innerText = "Hoy • " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  document.getElementById('repara-tech-log').innerText = `Solicitud de diagnóstico recibida para: ${deviceText} (Falla: ${issueText}). Buscando mensajero para retiro del equipo en ${address}.`;
  
  window.showToast("Servicio agendado con éxito", "success");
  
  clearTimeout(reparaSimTimer1);
  clearTimeout(reparaSimTimer2);
  clearTimeout(reparaSimTimer3);
  
  reparaSimTimer1 = setTimeout(() => {
    document.getElementById('rep-step-2').classList.add('active');
    document.getElementById('repara-tech-log').innerText = `Mensajero asignado (ID: TL-MOTO-892) en camino a retirar tu ${deviceText} en ${address}. Llegada estimada en 15 minutos.`;
    window.showToast("Mensajero en camino", "success");
  }, 4000);
  
  reparaSimTimer2 = setTimeout(() => {
    document.getElementById('rep-step-3').classList.add('active');
    document.getElementById('repara-tech-log').innerText = `Dispositivo recibido en nuestro laboratorio central. El Téc. Carlos Medina ha iniciado el desensamble. Evaluación de placa madre en curso...`;
    window.showToast("Dispositivo en diagnóstico técnico", "success");
  }, 9000);
  
  reparaSimTimer3 = setTimeout(() => {
    document.getElementById('rep-step-4').classList.add('active');
    document.getElementById('repara-tech-log').innerText = `¡Reparación completada con éxito! Se solucionó el problema de "${issueText}". Se realizaron pruebas térmicas y de rendimiento pasando el control de calidad. Coordinando entrega de retorno.`;
    window.showToast("¡Reparación finalizada con éxito!", "success");
  }, 15000);
};

// ==========================================
// TELOINSTALA: RESERVAS & AGENDAMIENTO
// ==========================================
window.updateInstalaPrice = function() {
  const service = document.getElementById('instala-service').value;
  let price = 1200;
  
  if(service === 'tv') price = 1200;
  else if(service === 'ac') price = 3500;
  else if(service === 'smart') price = 2500;
  else if(service === 'network') price = 1800;
  else if(service === 'lock') price = 1500;
  
  document.getElementById('instala-quote-price').innerText = `RD$ ${price.toLocaleString()}`;
};

window.bookInstalaService = function() {
  const serviceSelect = document.getElementById('instala-service');
  const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
  const dateVal = document.getElementById('instala-date').value;
  const timeSelect = document.getElementById('instala-time');
  const timeText = timeSelect.options[timeSelect.selectedIndex].text;
  
  if(!dateVal) {
    window.showToast("Por favor selecciona una fecha válida", "error");
    return;
  }
  
  const dateObj = new Date(dateVal + 'T00:00:00');
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('es-ES', dateOptions);
  
  const summaryCard = document.getElementById('instala-summary-card');
  summaryCard.style.display = 'block';
  summaryCard.scrollIntoView({ behavior: 'smooth' });
  
  const priceText = document.getElementById('instala-quote-price').innerText;
  
  document.getElementById('instala-booked-service').innerText = serviceText;
  document.getElementById('instala-booked-date').innerText = formattedDate;
  document.getElementById('instala-booked-time').innerText = timeText;
  document.getElementById('instala-booked-price').innerText = priceText;
  
  window.showToast(`¡Cita agendada con Ramón Abreu para el ${formattedDate}!`, "success");
};
