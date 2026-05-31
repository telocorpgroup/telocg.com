/**
 * TeloCorpGroup - Panel Interactiva de Empresas (script.js)
 * -----------------------------------------------------------------------------
 * Controlador central para las micro-aplicaciones del Cluster Digital:
 * - TeloSales: Tienda en línea interactiva y Carrito de Compras lateral.
 * - TeloEduca: Escuela digital, listado de talleres e inscripciones en vivo.
 * - TeloLleva: Calculador logístico de envíos nacionales y rastreo en tiempo real.
 * - Asistente Inteligente (Router) e Intersection Observer para animaciones.
 */

document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initMobileMenu();
  initClusterTabs();
  initTeloSales();
  initTeloEduca();
  initTeloLleva();
  initClusterRouter();
  initContactForm();
});

/* ==============================================================================
   1. Animaciones al hacer Scroll (Intersection Observer)
   ============================================================================== */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    observer.observe(el);
  });
}

/* ==============================================================================
   2. Menú de Navegación Móvil (Hamburguesa)
   ============================================================================== */
function initMobileMenu() {
  const header = document.querySelector(".site-header");
  
  if (!document.querySelector(".mobile-menu-toggle")) {
    const toggleButton = document.createElement("button");
    toggleButton.className = "mobile-menu-toggle";
    toggleButton.setAttribute("aria-label", "Abrir menú de navegación");
    toggleButton.innerHTML = `
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    `;
    
    header.appendChild(toggleButton);
    
    const nav = document.querySelector(".site-nav");
    
    toggleButton.addEventListener("click", () => {
      toggleButton.classList.toggle("active");
      nav.classList.toggle("active");
    });
    
    const navLinks = nav.querySelectorAll("a");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        toggleButton.classList.remove("active");
        nav.classList.remove("active");
      });
    });
  }
}

/* ==============================================================================
   3. Controlador de Pestañas del Cluster (Dashboard Tabs)
   ============================================================================== */
let activeCompanyTab = "telosales";

function initClusterTabs() {
  const tabButtons = document.querySelectorAll(".cluster-tab-btn");
  const tabContents = document.querySelectorAll(".cluster-tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  const tabButtons = document.querySelectorAll(".cluster-tab-btn");
  const tabContents = document.querySelectorAll(".cluster-tab-content");

  activeCompanyTab = tabId;

  tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  tabContents.forEach(content => {
    if (content.id === `${tabId}-hub`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

/* ==============================================================================
   4. TeloSales Engine (Micro-Tienda con Carrito)
   ============================================================================== */
let salesCart = [];

const salesProducts = [
  { id: 1, name: "Laptop TeloPro Tech i7", price: 899.99, category: "tech", image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "Auriculares ANC Inalámbricos", price: 129.99, category: "tech", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Silla de Oficina Ergonómica", price: 249.99, category: "furniture", image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=60" },
  { id: 4, name: "Escritorio Elevable Automático", price: 349.99, category: "furniture", image: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&auto=format&fit=crop&q=60" },
  { id: 5, name: "Maletín de Herramientas Premium", price: 89.99, category: "tools", image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop&q=60" },
  { id: 6, name: "Kit Robot Programable Inteligente", price: 159.99, category: "toys", image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=500&auto=format&fit=crop&q=60" },
  { id: 7, name: "Freidora de Aire Digital XL", price: 119.99, category: "home", image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&auto=format&fit=crop&q=60" },
  { id: 8, name: "Lámpara de Escritorio Inteligente", price: 49.99, category: "home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60" }
];

function initTeloSales() {
  const productsGrid = document.getElementById("sales-products-grid");
  const categoryFilters = document.querySelectorAll(".sales-filter-btn");
  const cartToggleBtn = document.getElementById("sales-cart-toggle-btn");
  const cartDrawer = document.getElementById("sales-cart-drawer");
  const cartCloseBtn = document.getElementById("sales-cart-close-btn");
  
  if (!productsGrid) return;

  // Renderizar Productos
  renderSalesProducts("all");

  // Filtros de categoría
  categoryFilters.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryFilters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderSalesProducts(btn.dataset.category);
    });
  });

  // Toggle de Carrito Drawer
  cartToggleBtn.addEventListener("click", () => cartDrawer.classList.add("active"));
  cartCloseBtn.addEventListener("click", () => cartDrawer.classList.remove("active"));

  // Delegación de eventos para agregar productos
  productsGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      const prodId = parseInt(e.target.dataset.id);
      addToCart(prodId);
    }
  });

  // Finalizar compra simulada
  document.getElementById("sales-checkout-btn").addEventListener("click", () => {
    if (salesCart.length === 0) return;
    alert("¡Pedido Simulado con éxito! TeloSales procesará la solicitud con logística integrada de TeloLleva.");
    salesCart = [];
    updateCartUI();
    cartDrawer.classList.remove("active");
  });
}

function renderSalesProducts(category) {
  const productsGrid = document.getElementById("sales-products-grid");
  productsGrid.innerHTML = "";

  const filtered = category === "all" ? salesProducts : salesProducts.filter(p => p.category === category);

  filtered.forEach(p => {
    productsGrid.innerHTML += `
      <div class="sales-product-card">
        <div class="sales-img-wrapper">
          <img src="${p.image}" alt="${p.name}">
          <span class="sales-product-tag">${p.category.toUpperCase()}</span>
        </div>
        <div class="sales-product-info">
          <h3>${p.name}</h3>
          <div class="sales-product-footer">
            <span class="sales-product-price">$${p.price.toFixed(2)}</span>
            <button class="button button-primary add-to-cart-btn" data-id="${p.id}">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function addToCart(productId) {
  const product = salesProducts.find(p => p.id === productId);
  const cartItem = salesCart.find(item => item.id === productId);

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    salesCart.push({ ...product, quantity: 1 });
  }

  updateCartUI();
  
  // Abrir automáticamente el drawer para mostrar interacción
  document.getElementById("sales-cart-drawer").classList.add("active");
}

function updateCartUI() {
  const cartItemsList = document.getElementById("sales-cart-items");
  const cartTotalValue = document.getElementById("sales-cart-total-value");
  const cartBadgeCount = document.getElementById("sales-cart-count-badge");
  
  cartItemsList.innerHTML = "";

  let total = 0;
  let itemCount = 0;

  salesCart.forEach(item => {
    total += item.price * item.quantity;
    itemCount += item.quantity;

    cartItemsList.innerHTML += `
      <div class="sales-cart-item">
        <div class="sales-cart-item-details">
          <h4>${item.name}</h4>
          <span>$${item.price.toFixed(2)} x ${item.quantity}</span>
        </div>
        <button class="sales-cart-item-remove" onclick="removeCartItem(${item.id})">
          &times;
        </button>
      </div>
    `;
  });

  cartTotalValue.textContent = `$${total.toFixed(2)}`;
  cartBadgeCount.textContent = itemCount;
  
  // Efecto de pulso en el Badge del botón de Carrito
  const badgeContainer = document.getElementById("sales-cart-toggle-btn");
  badgeContainer.classList.add("pulse");
  setTimeout(() => badgeContainer.classList.remove("pulse"), 300);
}

window.removeCartItem = function(id) {
  salesCart = salesCart.filter(item => item.id !== id);
  updateCartUI();
};

/* ==============================================================================
   5. TeloEduca Engine (Matrícula en Talleres Académicos)
   ============================================================================== */
const educaCourses = [
  { id: 1, title: "Taller de Excel Profesional Avanzado", desc: "Manejo de Macros, tablas dinámicas avanzadas, dashboards financieros e integración de reportes analíticos.", duration: "12 horas", level: "Medio - Avanzado", instructor: "Ing. Carlos Mendoza" },
  { id: 2, title: "Inglés Acelerado para Call Center", desc: "Habilidades de escucha, pronunciación fluida, vocabulario especializado de soporte técnico y servicio al cliente internacional.", duration: "24 horas", level: "Principiante - Medio", instructor: "Prof. Sarah Jenkins" },
  { id: 3, title: "Diseño Gráfico Moderno en Canva", desc: "Creación de kits de marca corporativos, publicaciones de redes sociales, presentaciones ejecutivas y portafolios visuales sin experiencia previa.", duration: "8 horas", level: "Básico", instructor: "Diseñadora Sofía Delgado" },
  { id: 4, title: "Ingeniería de Prompts Aplicada", desc: "Diseño de prompts eficaces para ChatGPT, Claude, Midjourney y Gemini orientados a optimizar tareas profesionales y flujo de trabajo.", duration: "10 horas", level: "Todos los niveles", instructor: "Dr. Roberto Gómez (AI Expert)" },
  { id: 5, title: "Estrategias de Redes Sociales", desc: "Planificación de contenidos para Instagram y TikTok, uso de algoritmos para tráfico orgánico y pauta comercial efectiva.", duration: "14 horas", level: "Medio", instructor: "Consultor Diego Silva" },
  { id: 6, title: "Informatica Básica y MS Office", desc: "Introducción al sistema operativo Windows, manejo formal de Word, PowerPoint y carpetas compartidas en la nube corporativa.", duration: "16 horas", level: "Básico", instructor: "Lic. Marta Rivas" }
];

function initTeloEduca() {
  const coursesGrid = document.getElementById("educa-courses-grid");
  if (!coursesGrid) return;

  coursesGrid.innerHTML = "";

  educaCourses.forEach(c => {
    coursesGrid.innerHTML += `
      <div class="educa-course-card" id="course-card-${c.id}">
        <div class="educa-course-header">
          <span class="educa-course-level">${c.level}</span>
          <span class="educa-course-duration">${c.duration}</span>
        </div>
        <div class="educa-course-body">
          <h3>${c.title}</h3>
          <p>${c.desc}</p>
          <div class="educa-instructor-info">
            <strong>Instructor:</strong> ${c.instructor}
          </div>
        </div>
        <div class="educa-course-footer">
          <button class="button button-primary enrol-btn" onclick="openEnrolModal(${c.id}, '${c.title}')">
            Matricularse Gratis
          </button>
        </div>
      </div>
    `;
  });
}

window.openEnrolModal = function(courseId, courseTitle) {
  const modal = document.createElement("div");
  modal.className = "success-modal-overlay active";
  modal.innerHTML = `
    <div class="success-modal-content" style="border-color: var(--brand-blue); box-shadow: 0 0 35px var(--brand-blue-glow)">
      <div class="success-icon" style="border-color: var(--brand-blue); background-color: rgba(6, 182, 212, 0.1); color: var(--brand-blue);">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <h3>Matrícula en TeloEduca</h3>
      <p style="margin-bottom: 20px;">Estás por ingresar al curso:<br><strong>${courseTitle}</strong></p>
      
      <div class="form-group" style="text-align: left; margin-bottom: 24px;">
        <label for="student-enrol-name" style="color: var(--text-white);">Tu Nombre Completo *</label>
        <input type="text" id="student-enrol-name" placeholder="Ej: Roberto Almonte" style="width:100%; border-color: rgba(255,255,255,0.15);" required>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button class="button button-secondary" id="close-enrol-modal" style="flex:1;">Cancelar</button>
        <button class="button button-primary" id="confirm-enrol-btn" style="flex:1; background-color: var(--brand-blue); box-shadow: 0 0 15px var(--brand-blue-glow)">Confirmar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector("#close-enrol-modal");
  const confirmBtn = modal.querySelector("#confirm-enrol-btn");

  closeBtn.addEventListener("click", () => modal.remove());
  
  confirmBtn.addEventListener("click", () => {
    const studentName = document.getElementById("student-enrol-name").value.trim();
    if (!studentName) {
      alert("Por favor introduce tu nombre.");
      return;
    }

    modal.remove();
    completeCourseEnrolment(courseId, studentName);
  });
};

function completeCourseEnrolment(courseId, studentName) {
  const card = document.getElementById(`course-card-${courseId}`);
  if (!card) return;

  const footer = card.querySelector(".educa-course-footer");
  
  // Transformar pie de tarjeta en panel de control estudiantil
  footer.innerHTML = `
    <div class="student-dashboard-card" style="width: 100%; animation: fadeIn 0.4s ease-out;">
      <p style="color: var(--brand-blue); font-weight: 700; margin-bottom: 8px;">🎓 Estudiante Matriculado</p>
      <p style="color: var(--text-white); font-size: 0.9rem; margin-bottom: 12px;">Felicidades, <strong>${studentName}</strong>. Acceso activado.</p>
      <div style="background-color: rgba(255,255,255,0.05); border-radius:4px; height: 6px; overflow:hidden; margin-bottom: 8px;">
        <div style="width: 100%; height:100%; background-color: var(--brand-blue); animation: slideProgress 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.75rem; color: var(--text-muted);">
        <span>Progreso de Inducción</span>
        <span>100% Completado</span>
      </div>
    </div>
  `;
}

/* ==============================================================================
   6. TeloLleva Engine (Calculador de Envíos y Rastreador)
   ============================================================================== */
const shippingRates = {
  "santo-domingo": { name: "Santo Domingo", baseRate: 150 },
  "santiago": { name: "Santiago", baseRate: 200 },
  "la-vega": { name: "La Vega", baseRate: 220 },
  "puerto-plata": { name: "Puerto Plata", baseRate: 280 },
  "punta-cana": { name: "Punta Cana", baseRate: 350 }
};

function initTeloLleva() {
  const originSelect = document.getElementById("shipping-origin");
  const destSelect = document.getElementById("shipping-destination");
  const weightInput = document.getElementById("shipping-weight");
  const typeSelect = document.getElementById("shipping-type");
  const calcBtn = document.getElementById("shipping-calc-btn");
  const calcResult = document.getElementById("shipping-calc-result");

  const trackingInput = document.getElementById("lleva-tracking-input");
  const trackingBtn = document.getElementById("lleva-tracking-btn");
  const trackingOutput = document.getElementById("lleva-tracking-output");

  if (!originSelect) return;

  // Calculadora de Envíos
  calcBtn.addEventListener("click", () => {
    const origin = originSelect.value;
    const dest = destSelect.value;
    const weight = parseFloat(weightInput.value);
    const type = typeSelect.value;

    if (!origin || !dest || isNaN(weight) || weight <= 0) {
      alert("Por favor rellene los campos de envío de manera correcta.");
      return;
    }

    if (origin === dest) {
      alert("El origen y el destino no pueden ser iguales para cotizar la ruta regional.");
      return;
    }

    // Fórmula del Costo
    const rateOrigin = shippingRates[origin].baseRate;
    const rateDest = shippingRates[dest].baseRate;
    let cost = (rateOrigin + rateDest) / 2; // Media de bases
    
    // Costo por peso adicional (1.5 kg base)
    if (weight > 1.5) {
      cost += (weight - 1.5) * 35; // 35 RD$ por kg adicional
    }

    // Recargo por Tipo de Envío
    let multiplier = 1.0;
    let typeName = "Estándar";
    if (type === "express") {
      multiplier = 1.5;
      typeName = "Exprés Urgente";
    } else if (type === "recurring") {
      multiplier = 0.85; // Descuento por frecuencia
      typeName = "Suscripción Recurrente";
    }

    const finalCost = cost * multiplier;

    calcResult.innerHTML = `
      <div class="shipping-cost-box animate-flow-step" style="--step-delay: 0s;">
        <span class="cost-label">Costo Estimado de Ruta (${typeName}):</span>
        <span class="cost-value">RD$ ${finalCost.toFixed(2)}</span>
        <p class="cost-disclaimer">Cotización basada en rutas activas del cluster. Incluye seguro básico y confirmación de firma.</p>
        <button class="button button-primary" style="margin-top: 16px; width: 100%; background-color: var(--brand-yellow); box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); color: var(--bg-darker);" onclick="window.presetContactSubject('TeloLleva (Ruta: ${shippingRates[origin].name} - ${shippingRates[dest].name}, ${weight} kg)')">
          Solicitar Recogida Comercial
        </button>
      </div>
    `;
  });

  // Rastreo de Paquetería
  trackingBtn.addEventListener("click", () => {
    const code = trackingInput.value.trim().toUpperCase();
    if (!code) {
      alert("Por favor introduzca un código de seguimiento.");
      return;
    }

    trackingOutput.innerHTML = `
      <div class="tracking-loading" style="text-align:center; padding: 20px 0;">
        <svg class="spinner" viewBox="0 0 50 50" width="30" height="30" style="animation: rotate 2s linear infinite; color: var(--brand-yellow); margin: 0 auto 10px;">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
        </svg>
        <p style="color: var(--text-muted);">Consultando red logística nacional...</p>
      </div>
    `;

    setTimeout(() => {
      // Simular respuesta según el código
      let statusStep = 2; // Tránsito por defecto
      let dateString = "Hoy, en tránsito regional";
      
      if (code.includes("DELIVERED") || code === "TL-54321") {
        statusStep = 4;
        dateString = "Entregado y firmado ayer";
      } else if (code.includes("ORIGIN") || code === "TL-11111") {
        statusStep = 1;
        dateString = "Recolectado en almacén de origen";
      }

      const steps = [
        { name: "Recolectado", desc: "El paquete se ingresó al centro de origen." },
        { name: "Distribución", desc: "Clasificación física en centro logístico." },
        { name: "En Tránsito", desc: "Paquete a bordo de ruta interprovincial." },
        { name: "Entregado", desc: "Firma recolectada y envío cerrado." }
      ];

      let trackingHTML = `
        <div class="tracking-result-box animate-flow-step" style="--step-delay: 0s;">
          <div class="tracking-result-header">
            <h4>Seguimiento: ${code}</h4>
            <span class="tracking-date">${dateString}</span>
          </div>
          <div class="tracking-timeline">
      `;

      steps.forEach((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum <= statusStep ? "active" : "";
        const isCurrent = stepNum === statusStep ? "current" : "";

        trackingHTML += `
          <div class="timeline-point ${isActive} ${isCurrent}">
            <div class="timeline-badge">
              ${stepNum}
            </div>
            <div class="timeline-info">
              <h5>${step.name}</h5>
              <p>${step.desc}</p>
            </div>
          </div>
        `;
      });

      trackingHTML += `
          </div>
        </div>
      `;

      trackingOutput.innerHTML = trackingHTML;
    }, 1500);
  });
}

/* ==============================================================================
   7. Ruteador Inteligente del Cluster (Filtro e Integración)
   ============================================================================== */
function initClusterRouter() {
  const presetButtons = document.querySelectorAll(".preset-btn");
  const searchInput = document.getElementById("router-search");
  const searchBtn = document.getElementById("router-submit-btn");
  const flowOutput = document.getElementById("router-flow-output");

  const mapping = {
    sales: { tab: "telosales", title: "TeloSales Hub", desc: "Detectamos palabras clave de e-commerce y catálogo comercial. Te redirigimos a nuestra plataforma activa de ventas.", btnText: "Explorar Tienda Interactiva" },
    educa: { tab: "teloeduca", title: "TeloEduca Academia", desc: "Identificamos términos asociados a talleres de Excel, inglés, diseño o ingeniería de prompts. Clic debajo para matricularte.", btnText: "Ir a Cursos Disponibles" },
    lleva: { tab: "telolleva", title: "TeloLleva Logística", desc: "Tu consulta contiene palabras asociadas a mensajería, envíos o peso. Utiliza la calculadora integrada de paquetería.", btnText: "Ir a Calculadora de Envíos" },
    future: { tab: "proximamente", title: "Expansión del Cluster", desc: "Esta consulta requiere soporte técnico o instalaciones en campo (TeloRepara / TeloInstala). Te redirigimos al portal de lista de espera.", btnText: "Ver Expansiones de Servicio" }
  };

  function routeQuery(text) {
    const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let target = null;

    if (cleanText.includes("vend") || cleanText.includes("compr") || cleanText.includes("articul") || cleanText.includes("product") || cleanText.includes("juguet") || cleanText.includes("laptop") || cleanText.includes("tiend") || cleanText.includes("catalogo")) {
      target = mapping.sales;
    } else if (cleanText.includes("aprend") || cleanText.includes("taller") || cleanText.includes("curs") || cleanText.includes("clase") || cleanText.includes("excel") || cleanText.includes("ingles") || cleanText.includes("design") || cleanText.includes("canva") || cleanText.includes("prompt")) {
      target = mapping.educa;
    } else if (cleanText.includes("envi") || cleanText.includes("lleva") || cleanText.includes("paquet") || cleanText.includes("peso") || cleanText.includes("transport") || cleanText.includes("mensajer") || cleanText.includes("delivery")) {
      target = mapping.lleva;
    } else if (cleanText.includes("repar") || cleanText.includes("tecnic") || cleanText.includes("soport") || cleanText.includes("computador") || cleanText.includes("instal") || cleanText.includes("cable") || cleanText.includes("red")) {
      target = mapping.future;
    }

    if (!target) {
      if (cleanText.trim() === "") {
        flowOutput.innerHTML = `<div class="router-placeholder"><p>Por favor, escribe tus necesidades operativas en el buscador.</p></div>`;
        return;
      }
      // Por defecto sugerir TeloSales
      target = mapping.sales;
    }

    flowOutput.innerHTML = `
      <div class="router-flow-routing animate-flow-step" style="--step-delay: 0s;">
        <h4>🚩 Requerimiento Clasificado con éxito</h4>
        <p style="color: var(--text-primary); font-weight: 700; margin: 10px 0 6px;">Destino recomendado: ${target.title}</p>
        <p style="color: var(--text-muted); font-size:0.92rem; margin-bottom: 20px;">${target.desc}</p>
        <button class="button button-primary" onclick="window.activateClusterTabAndScroll('${target.tab}')">
          ${target.btnText}
        </button>
      </div>
    `;
  }

  window.activateClusterTabAndScroll = function(tabId) {
    switchTab(tabId);
    const element = document.getElementById("cluster-dashboard-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      presetButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const query = btn.dataset.query;
      searchInput.value = query;
      routeQuery(query);
    });
  });

  searchBtn.addEventListener("click", () => {
    routeQuery(searchInput.value);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      routeQuery(searchInput.value);
    }
  });
}

/* ==============================================================================
   8. Formulario de Contacto Unificado del Cluster
   ============================================================================== */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const targetCompany = document.getElementById("contact-target").value;
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !message) {
      alert("Por favor rellene todos los campos requeridos.");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" width="20" height="20" style="animation: rotate 2s linear infinite; margin-right: 8px;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
      </svg>
      Enrutando solicitud...
    `;

    setTimeout(() => {
      // Éxito simulado
      showSuccessModal(name, targetCompany);
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1800);
  });
}

function showSuccessModal(userName, targetCompanyCode) {
  const companies = {
    "all": "TeloCorpGroup Hub Central",
    "sales": "TeloSales E-Commerce",
    "educa": "TeloEduca Académico",
    "lleva": "TeloLleva Logística",
    "future": "TeloCorp Desarrollo"
  };

  const companyName = companies[targetCompanyCode] || "TeloCorpGroup";

  const modal = document.createElement("div");
  modal.className = "success-modal-overlay active";
  modal.innerHTML = `
    <div class="success-modal-content" style="border-color: var(--brand-orange); box-shadow: 0 0 35px var(--brand-orange-glow)">
      <div class="success-icon" style="border-color: var(--brand-orange); background-color: rgba(221, 34, 0, 0.1); color: var(--brand-orange);">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <h3>¡Solicitud Enviada, ${userName}!</h3>
      <p style="margin-bottom: 20px;">Tu requerimiento ha sido enrutado de manera directa al buzón corporativo de: <br><strong>${companyName}</strong>.</p>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Un ejecutivo operativo de la firma responderá tu caso a tu correo electrónico en un lapso no mayor a 12 horas hábiles.</p>
      <button class="button button-primary" id="close-success-modal" style="margin-top: 24px; width: 100%;">Cerrar Ventana</button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector("#close-success-modal");
  closeBtn.addEventListener("click", () => modal.remove());
}

/**
 * Función global auxiliar para suscribirse a las listas de espera de TeloRepara / TeloInstala
 */
window.subscribeWaitlist = function(companyName) {
  const userName = prompt(`Ingresa tu correo para suscribirte a la lista de lanzamiento de ${companyName}:`);
  if (userName === null) return;
  if (!userName || !userName.includes("@")) {
    alert("Por favor ingresa un correo de contacto válido.");
    return;
  }
  alert(`¡Registrado con éxito! Se ha asignado una invitación anticipada de socio al correo: ${userName}. Te contactaremos pronto con novedades de ${companyName}.`);
};

/**
 * Función global auxiliar para pre-rellenar el formulario de contacto según el flujo
 */
window.presetContactSubject = function(subjectDetails) {
  const messageInput = document.getElementById("contact-message");
  const targetSelect = document.getElementById("contact-target");
  
  if (messageInput) {
    messageInput.value = `Hola TeloCorpGroup, me interesa realizar una cotización/solicitud formal relacionada con: ${subjectDetails}. Por favor, póngase en contacto conmigo.`;
  }
  
  if (targetSelect) {
    if (subjectDetails.includes("TeloSales")) {
      targetSelect.value = "sales";
    } else if (subjectDetails.includes("TeloEduca")) {
      targetSelect.value = "educa";
    } else if (subjectDetails.includes("TeloLleva")) {
      targetSelect.value = "lleva";
    } else {
      targetSelect.value = "all";
    }
  }

  const element = document.getElementById("contacto");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => messageInput.focus(), 800);
  }
};
