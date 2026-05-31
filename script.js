/**
 * TeloCorpGroup - Interacciones y Dinamismo Web
 * --------------------------------------------
 * Este archivo implementa el comportamiento interactivo, las animaciones
 * al hacer scroll y el simulador dinámico del Ruteador de Servicios.
 */

document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initMobileMenu();
  initServiceRouter();
  initContactForm();
});

/**
 * 1. Animaciones al hacer Scroll (Intersection Observer)
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        observer.unobserve(entry.target); // Dejar de observar una vez animado
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    observer.observe(el);
  });
}

/**
 * 2. Menú de Navegación Móvil Hamburguesa
 */
function initMobileMenu() {
  const header = document.querySelector(".site-header");
  
  // Crear botón hamburguesa dinámicamente si no existe
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
      
      const isOpen = nav.classList.contains("active");
      toggleButton.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
    });
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = nav.querySelectorAll("a");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        toggleButton.classList.remove("active");
        nav.classList.remove("active");
      });
    });
  }
}

/**
 * 3. Ruteador de Servicios Interactivo
 */
function initServiceRouter() {
  const presetButtons = document.querySelectorAll(".preset-btn");
  const searchInput = document.getElementById("router-search");
  const searchBtn = document.getElementById("router-submit-btn");
  const flowOutput = document.getElementById("router-flow-output");
  const depCards = document.querySelectorAll(".department-card");

  // Definición de departamentos y palabras clave
  const departments = {
    sales: {
      code: "TS",
      name: "TeloSales",
      color: "var(--brand-orange)",
      keywords: ["vender", "venta", "comercial", "negocio", "prospeccion", "clientes", "marketing", "marca"]
    },
    education: {
      code: "TE",
      name: "TeloEduca",
      color: "var(--brand-blue)",
      keywords: ["aprender", "educar", "entrenar", "capacitar", "curso", "taller", "habilidades", "formar", "clase"]
    },
    delivery: {
      code: "TL",
      name: "TeloLleva",
      color: "var(--brand-orange)",
      keywords: ["llevar", "mensajeria", "entrega", "envio", "domicilio", "transporte", "paquete", "mover", "encargo", "delivery"]
    },
    marketplace: {
      code: "TC",
      name: "TeloCompra",
      color: "var(--brand-orange)",
      keywords: ["comprar", "adquirir", "compra", "intercambio", "adquisicion", "negociar", "proveedor", "suministros"]
    },
    repair: {
      code: "TR",
      name: "TeloRepara",
      color: "var(--brand-blue)",
      keywords: ["reparar", "soporte", "tecnico", "mantenimiento", "diagnostico", "arreglo", "computadora", "equipo", "averia"]
    },
    install: {
      code: "TI",
      name: "TeloInstala",
      color: "var(--brand-orange)",
      keywords: ["instalar", "instalacion", "redes", "cableado", "operativo", "campo", "montaje", "configurar"]
    }
  };

  // Función para procesar la consulta del usuario
  function processQuery(text) {
    const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const selectedDeps = [];

    // Buscar coincidencia de palabras clave para cada departamento
    Object.entries(departments).forEach(([key, dep]) => {
      const match = dep.keywords.some(keyword => cleanText.includes(keyword));
      if (match) {
        selectedDeps.push({ key, ...dep });
      }
    });

    // Si no hay coincidencias, sugerir un flujo base completo
    if (selectedDeps.length === 0) {
      if (cleanText.trim() === "") {
        renderFlow([]);
        return;
      }
      // Buscar coincidencias parciales por palabras individuales
      const words = cleanText.split(/\s+/);
      Object.entries(departments).forEach(([key, dep]) => {
        const match = dep.keywords.some(keyword => words.some(word => word.length > 3 && (word.includes(keyword) || keyword.includes(word))));
        if (match && !selectedDeps.some(d => d.key === key)) {
          selectedDeps.push({ key, ...dep });
        }
      });
    }

    renderFlow(selectedDeps);
  }

  // Renderizar la línea de flujo interactiva y resaltar tarjetas
  function renderFlow(selectedDeps) {
    // 1. Quitar resaltado previo
    depCards.forEach(card => {
      card.classList.remove("active-glow");
    });

    // 2. Si no hay selección, mostrar placeholder
    if (selectedDeps.length === 0) {
      flowOutput.innerHTML = `
        <div class="router-placeholder">
          <p>Escribe tu necesidad o selecciona uno de los ejemplos de arriba para ver el flujo de departamentos automatizado.</p>
        </div>
      `;
      return;
    }

    // 3. Resaltar tarjetas seleccionadas e iluminarlas
    selectedDeps.forEach(dep => {
      const card = document.querySelector(`.department-card.${dep.key}`);
      if (card) {
        card.classList.add("active-glow");
      }
    });

    // 4. Crear el diagrama de flujo interactivo
    let html = `<div class="flow-diagram-container">`;
    html += `<p class="flow-intro-text"><strong>Ruta de Solución TeloCorpGroup:</strong> Detectamos ${selectedDeps.length} departamentos necesarios para tu requerimiento:</p>`;
    html += `<div class="flow-steps-wrapper">`;

    selectedDeps.forEach((dep, index) => {
      html += `
        <div class="flow-step animate-flow-step" style="--step-delay: ${index * 0.15}s">
          <div class="flow-badge" style="background-color: ${dep.color}; box-shadow: 0 0 15px ${dep.color}66">
            ${dep.code}
          </div>
          <div class="flow-step-info">
            <h4>${dep.name}</h4>
            <span>Fase ${index + 1}</span>
          </div>
        </div>
      `;

      if (index < selectedDeps.length - 1) {
        html += `
          <div class="flow-arrow animate-flow-step" style="--step-delay: ${(index * 0.15) + 0.08}s">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
        `;
      }
    });

    html += `</div>`;
    html += `
      <div class="flow-action-suggestion">
        <a href="#contacto" class="button button-primary" onclick="presetContactSubject('${selectedDeps.map(d => d.name).join(', ')}')">
          Iniciar Solicitud Integrada
        </a>
      </div>
    `;
    html += `</div>`;

    flowOutput.innerHTML = html;
  }

  // Event Listeners para botones de ejemplo
  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      presetButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const query = btn.dataset.query;
      searchInput.value = query;
      processQuery(query);
    });
  });

  // Event Listener para entrada manual
  searchBtn.addEventListener("click", () => {
    processQuery(searchInput.value);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      processQuery(searchInput.value);
    }
  });
}

/**
 * Función global auxiliar para pre-rellenar el formulario de contacto según el flujo
 */
window.presetContactSubject = function(depsString) {
  const messageInput = document.getElementById("contact-message");
  if (messageInput) {
    messageInput.value = `Hola TeloCorpGroup, me interesa iniciar una cotización para una solución integrada que involucre los departamentos de: ${depsString}. Quedo atento a su contacto comercial.`;
    messageInput.focus();
  }
};

/**
 * 4. Formulario de Contacto Interactivo con Validación y Modal de Éxito
 */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validaciones básicas
    const name = document.getElementById("contact-name").value.trim();
    const email = document.getElementById("contact-email").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!name || !email || !message) {
      alert("Por favor rellene todos los campos obligatorios.");
      return;
    }

    // Animación de envío simulado
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" width="20" height="20" style="animation: rotate 2s linear infinite; margin-right: 8px;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
      </svg>
      Procesando...
    `;

    setTimeout(() => {
      // Éxito simulado
      showSuccessModal(name);
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 1800);
  });
}

/**
 * Mostrar modal de envío exitoso
 */
function showSuccessModal(userName) {
  // Crear modal dinámicamente
  const modal = document.createElement("div");
  modal.className = "success-modal-overlay";
  modal.innerHTML = `
    <div class="success-modal-content">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
      <h3>¡Solicitud Enviada, ${userName}!</h3>
      <p>Tu requerimiento ha sido ingresado a nuestro sistema. Un clasificador comercial de TeloCorpGroup analizará tu caso y te asignará con el equipo indicado en menos de 24 horas.</p>
      <button class="button button-primary" id="close-success-modal">Entendido</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Animación de entrada
  setTimeout(() => {
    modal.classList.add("active");
  }, 10);

  // Cerrar modal
  const closeBtn = modal.querySelector("#close-success-modal");
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
    }, 300);
  });

  // Cerrar al hacer clic fuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  });
}
