/**
 * TeloCorpGroup - Super App Core Logic
 * Implementa Navegación SPA, Persistencia (localStorage) y lógica de E-commerce,
 * Logística TeloLleva (Ofertas y SVG), Academia TeloEduca (Syllabus, Video Player y Diplomas).
 */

// ==========================================
// ESTADO GLOBAL Y PERSISTENCIA (localStorage)
// ==========================================
const AppState = {
  cart: [],
  courses: [],
  completedClasses: [],
  customReviews: {},
  wishlist: [],
  classNotes: {},
  appliedCoupon: null,
  passedQuizzes: [],
  dbSales: [],
  dbBookings: [],
  dbEduca: [],
  dbLeads: [],
  userProfile: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  },
  integrations: {
    supabaseUrl: '',
    supabaseKey: '',
    stripeEnabled: false,
    stripeKey: '',
    stripeWebhook: '',
    n8nLeadsUrl: '',
    n8nOrdersUrl: '',
    n8nServicesUrl: '',
    geminiKey: '',
    hmacEnabled: false,
    hmacSecret: ''
  },
  
  loadState: function() {
    const savedCart = localStorage.getItem('teloCart');
    const savedCourses = localStorage.getItem('teloCourses');
    const savedCompleted = localStorage.getItem('teloCompletedClasses');
    const savedReviews = localStorage.getItem('teloCustomReviews');
    const savedWishlist = localStorage.getItem('teloWishlist');
    const savedNotes = localStorage.getItem('teloClassNotes');
    const savedCoupon = localStorage.getItem('teloAppliedCoupon');
    const savedQuizzes = localStorage.getItem('teloPassedQuizzes');
    const savedIntegrations = localStorage.getItem('teloIntegrations');
    const savedDbSales = localStorage.getItem('teloDbSales');
    const savedDbBookings = localStorage.getItem('teloDbBookings');
    const savedDbEduca = localStorage.getItem('teloDbEduca');
    const savedDbLeads = localStorage.getItem('teloDbLeads');
    
    if(savedCart) this.cart = JSON.parse(savedCart);
    if(savedCourses) this.courses = JSON.parse(savedCourses);
    if(savedCompleted) this.completedClasses = JSON.parse(savedCompleted);
    if(savedReviews) this.customReviews = JSON.parse(savedReviews);
    if(savedWishlist) this.wishlist = JSON.parse(savedWishlist);
    if(savedNotes) this.classNotes = JSON.parse(savedNotes);
    if(savedCoupon) this.appliedCoupon = JSON.parse(savedCoupon);
    if(savedQuizzes) this.passedQuizzes = JSON.parse(savedQuizzes);
    if(savedDbSales) this.dbSales = JSON.parse(savedDbSales);
    if(savedDbBookings) this.dbBookings = JSON.parse(savedDbBookings);
    if(savedDbEduca) this.dbEduca = JSON.parse(savedDbEduca);
    if(savedDbLeads) this.dbLeads = JSON.parse(savedDbLeads);
    if(savedIntegrations) {
      this.integrations = { ...this.integrations, ...JSON.parse(savedIntegrations) };
    }
    const savedProfile = localStorage.getItem('teloUserProfile');
    if(savedProfile) this.userProfile = { ...this.userProfile, ...JSON.parse(savedProfile) };
  },
  
  saveState: function() {
    localStorage.setItem('teloCart', JSON.stringify(this.cart));
    localStorage.setItem('teloCourses', JSON.stringify(this.courses));
    localStorage.setItem('teloCompletedClasses', JSON.stringify(this.completedClasses));
    localStorage.setItem('teloCustomReviews', JSON.stringify(this.customReviews));
    localStorage.setItem('teloWishlist', JSON.stringify(this.wishlist));
    localStorage.setItem('teloClassNotes', JSON.stringify(this.classNotes));
    localStorage.setItem('teloAppliedCoupon', JSON.stringify(this.appliedCoupon));
    localStorage.setItem('teloPassedQuizzes', JSON.stringify(this.passedQuizzes));
    localStorage.setItem('teloIntegrations', JSON.stringify(this.integrations));
    localStorage.setItem('teloDbSales', JSON.stringify(this.dbSales));
    localStorage.setItem('teloDbBookings', JSON.stringify(this.dbBookings));
    localStorage.setItem('teloDbEduca', JSON.stringify(this.dbEduca));
    localStorage.setItem('teloDbLeads', JSON.stringify(this.dbLeads));
    localStorage.setItem('teloUserProfile', JSON.stringify(this.userProfile));
  }
};

// ==========================================
// CATÁLOGO DE PRODUCTOS (TELOSALES STORE)
// ==========================================
const productsDatabase = [
  {
    "id": "ts-cat-100",
    "title": "Diagrama de Núcleo de Cobre: Cables D09",
    "category": "tech",
    "price": 450,
    "icon": "<img src=\"TeloCorp/images/image1.png\" alt=\"Diagrama de Núcleo de Cobre: Cables D09\">",
    "images": [
      "TeloCorp/images/image1.png"
    ],
    "description": "Diagrama explicativo de la estructura interna del cable D09. Muestra el núcleo de cobre estañado de alta conductividad, el aislamiento de protección y la cubierta de TPE suave.",
    "specs": {
      "Material": "Cobre estañado y TPE",
      "Función": "Visualización técnica de alta fidelidad",
      "Compatibilidad": "Todos los cables D09"
    },
    "reviews": [
      {
        "user": "Miguel B.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      }
    ]
  },
  {
    "id": "ts-cat-101",
    "title": "Cover Magnético Original Transparente MagSafe",
    "category": "cases",
    "price": 600,
    "icon": "<img src=\"TeloCorp/images/image2.png\" alt=\"Cover Magnético Original Transparente MagSafe\">",
    "images": [
      "TeloCorp/images/image2.png"
    ],
    "description": "Funda transparente con tecnología magnética integrada (MagSafe). Material de policarbonato ópticamente transparente que evita el amarilleo y ofrece protección premium contra caídas.",
    "specs": {
      "Material": "Poliuretano termoplástico (TPU) y Policarbonato rígido",
      "Compatibilidad": "iPhone 7 Plus hasta 17 Pro Max",
      "Características": "Magnetismo fuerte MagSafe, tecnología anti-amarilleo",
      "Protección": "Certificación anticaídas de grado militar"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-102",
    "title": "Cover Silicona Stitch Azul Premium",
    "category": "cases",
    "price": 550,
    "icon": "<img src=\"TeloCorp/images/image3.png\" alt=\"Cover Silicona Stitch Azul Premium\">",
    "images": [
      "TeloCorp/images/image3.png"
    ],
    "description": "Funda de silicona líquida flexible con el simpático diseño en relieve 3D de Stitch. Tacto extra suave (soft-touch) y excelente agarre que evita caídas accidentales.",
    "specs": {
      "Material": "Silicona líquida blanda soft-touch",
      "Diseño": "Relieve 3D Stitch coleccionable",
      "Compatibilidad": "iPhone, Samsung y Tecno",
      "Interior": "Forro de microfibra suave protector"
    },
    "reviews": [
      {
        "user": "Pedro S.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Laura R.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-103",
    "title": "Nevera Exhibidora Comercial Traulsen Premium",
    "category": "equipos",
    "price": 45000,
    "icon": "<img src=\"TeloCorp/images/image4.png\" alt=\"Nevera Exhibidora Comercial Traulsen Premium\">",
    "images": [
      "TeloCorp/images/image4.png"
    ],
    "description": "Refrigerador y exhibidor comercial Traulsen de grado profesional con puerta de vidrio templado. Estructura de acero inoxidable ultra resistente, ideal para supermercados, cafeterías, restaurantes y negocios de comida.",
    "specs": {
      "Marca/Modelo": "Traulsen Commercial Glass Door Refrigerator",
      "Material": "Acero inoxidable y vidrio templado doble panel",
      "Control": "Termostato digital de alta precisión",
      "Voltaje": "110V/220V 60Hz (Enchufe industrial)"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-104",
    "title": "Audífonos Deportivos Miccell BH96 Sports",
    "category": "audio",
    "price": 1200,
    "icon": "<img src=\"TeloCorp/images/image5.png\" alt=\"Audífonos Deportivos Miccell BH96 Sports\">",
    "images": [
      "TeloCorp/images/image5.png"
    ],
    "description": "Auriculares inalámbricos deportivos ligeros con ganchos flexibles para las orejas. Diseñados para deportes, con resistencia al sudor, bluetooth 5.4 de alta velocidad y doble pantalla LED digital en el estuche.",
    "specs": {
      "Modelo": "VQ-BH96 (Sports Stereo Earbuds)",
      "Versión BT": "BT 5.4 de alta definición y bajo consumo",
      "Batería Auricular": "40 mAh (hasta 5.5 horas de música continua)",
      "Batería Estuche": "400 mAh (hasta 24 horas de uso total)",
      "Códec Soportado": "AAC / SBC de alta fidelidad"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      }
    ]
  },
  {
    "id": "ts-cat-105",
    "title": "Altavoz Inalámbrico Miccell VQ-SP63 (1200mAh)",
    "category": "audio",
    "price": 1500,
    "icon": "<img src=\"TeloCorp/images/image6.png\" alt=\"Altavoz Inalámbrico Miccell VQ-SP63 (1200mAh)\">",
    "images": [
      "TeloCorp/images/image6.png"
    ],
    "description": "Altavoz bluetooth portátil súper dinámico con sonido estéreo 3D y luces LED integradas. Su tamaño compacto es perfecto para llevar a cualquier lugar con su correa integrada.",
    "specs": {
      "Modelo": "VQ-SP63 (Altavoz Recargable)",
      "Capacidad Batería": "1200 mAh (hasta 5 horas de reproducción)",
      "Entradas": "Bluetooth, USB, Tarjeta TF, Auxiliar",
      "Sonido": "Estéreo Omnidireccional con graves dinámicos",
      "Carga": "Puerto Tipo-C moderno"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-106",
    "title": "Cargador Rápido T13 Completo (Tipo C a Lightning 20W)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image7.png\" alt=\"Cargador Rápido T13 Completo (Tipo C a Lightning 20W)\">",
    "images": [
      "TeloCorp/images/image7.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C a Lightning 20W. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W Máximo",
      "Cable": "1.0m USB-C a Lightning",
      "Voltaje": "100-240V"
    },
    "reviews": [
      {
        "user": "David P.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "María L.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-107",
    "title": "Freidora de Papas Industrial Vevor de Doble Tanque",
    "category": "equipos",
    "price": 8500,
    "icon": "<img src=\"TeloCorp/images/image8.png\" alt=\"Freidora de Papas Industrial Vevor de Doble Tanque\">",
    "images": [
      "TeloCorp/images/image8.png"
    ],
    "description": "Freidora eléctrica comercial Vevor de doble tina (tanque dual). Fabricada en acero inoxidable grado alimenticio. Cada tina cuenta con control de temperatura independiente para freír papas, pollo o empanadas.",
    "specs": {
      "Marca": "Vevor Professional Kitchen Gear",
      "Capacidad": "6L + 6L (12 Litros de capacidad total)",
      "Potencia": "1500W + 1500W de calentamiento ultra rápido",
      "Material": "Acero inoxidable 304 de fácil limpieza y drenado"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Buena calidad en los acabados. Muy recomendado para uso diario."
      }
    ]
  },
  {
    "id": "ts-cat-108",
    "title": "Batería Portátil TeloCorp Slim 10,000 mAh",
    "category": "tech",
    "price": 1450,
    "icon": "<img src=\"TeloCorp/images/image9.png\" alt=\"Batería Portátil TeloCorp Slim 10,000 mAh\">",
    "images": [
      "TeloCorp/images/image9.png"
    ],
    "description": "Batería externa ultra delgada premium de 10,000 mAh para recarga rápida. Su tamaño compacto permite llevarla en el bolsillo. Cuenta con display LED de porcentaje.",
    "specs": {
      "Capacidad": "10,000 mAh",
      "Salidas": "2x USB-A (5V/2.4A)",
      "Indicador": "Pantalla digital LED"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Jorge V.",
        "rating": 4,
        "date": "24 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-109",
    "title": "Altavoz Inalámbrico Miccell VQ-SP64 (2400mAh)",
    "category": "audio",
    "price": 2200,
    "icon": "<img src=\"TeloCorp/images/image10.png\" alt=\"Altavoz Inalámbrico Miccell VQ-SP64 (2400mAh)\">",
    "images": [
      "TeloCorp/images/image10.png"
    ],
    "description": "Altavoz bluetooth portátil de tamaño mediano con batería doble de 2400mAh. Ideal para exteriores, ofrece un sonido potente y nítido con radiadores pasivos duales y luces de colores.",
    "specs": {
      "Modelo": "VQ-SP64 (Altavoz de Exterior)",
      "Capacidad Batería": "2400 mAh (hasta 8 horas de reproducción)",
      "Potencia de Salida": "10W RMS con graves reforzados",
      "Conectividad": "Bluetooth 5.3, USB, Aux, Ranura TF",
      "Características": "Protección contra salpicaduras y golpes"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-110",
    "title": "Cover Magnético en Cristal MagSafe (Transparente)",
    "category": "cases",
    "price": 800,
    "icon": "<img src=\"TeloCorp/images/image11.png\" alt=\"Cover Magnético en Cristal MagSafe (Transparente)\">",
    "images": [
      "TeloCorp/images/image11.png"
    ],
    "description": "Funda de cristal templado trasero de alta transparencia combinada con bordes de metal en color transparente y soporte magnético MagSafe. Ofrece una estética limpia e idéntica a tu teléfono desnudo.",
    "specs": {
      "Material": "Vidrio templado 9H trasero y marco de TPU/Aluminio",
      "Compatibilidad": "iPhone 11 hasta 17 Pro Max",
      "MagSafe": "Imanes N52 de alta potencia incorporados",
      "Resistencia": "Antirayaduras y absorción de impactos en esquinas"
    },
    "reviews": [
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "David P.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      }
    ]
  },
  {
    "id": "ts-cat-111",
    "title": "Cover Magnético en Cristal MagSafe (Borde Grafito)",
    "category": "cases",
    "price": 800,
    "icon": "<img src=\"TeloCorp/images/image12.png\" alt=\"Cover Magnético en Cristal MagSafe (Borde Grafito)\">",
    "images": [
      "TeloCorp/images/image12.png"
    ],
    "description": "Funda de cristal templado trasero de alta transparencia combinada con bordes de metal en color borde grafito y soporte magnético MagSafe. Ofrece una estética limpia e idéntica a tu teléfono desnudo.",
    "specs": {
      "Material": "Vidrio templado 9H trasero y marco de TPU/Aluminio",
      "Compatibilidad": "iPhone 11 hasta 17 Pro Max",
      "MagSafe": "Imanes N52 de alta potencia incorporados",
      "Resistencia": "Antirayaduras y absorción de impactos en esquinas"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-112",
    "title": "Altavoz Boombox Profesional Miccell SP56 (30000mAh)",
    "category": "audio",
    "price": 4500,
    "icon": "<img src=\"TeloCorp/images/image13.png\" alt=\"Altavoz Boombox Profesional Miccell SP56 (30000mAh)\">",
    "images": [
      "TeloCorp/images/image13.png"
    ],
    "description": "Altavoz inalámbrico gigante de alta potencia para fiestas y karaoke. Batería integrada de súper alta capacidad de 30000mAh para hasta 10 horas de uso. Incluye chip DSP inteligente para filtrado de ruido y efecto KTV.",
    "specs": {
      "Modelo": "Miccell SP56 Boombox",
      "Capacidad Batería": "30000 mAh (Funciona como Powerbank)",
      "Tecnología Sonido": "Chip DSP incorporado con eco KTV",
      "Autonomía": "6 a 8 horas a volumen alto, hasta 10 horas regular",
      "Potencia": "Amplificador Digital Inteligente de Alto Rendimiento"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Lucía H.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-113",
    "title": "Cable D06 de Carga Rápida (Lightning (iPhone) Blanco)",
    "category": "tech",
    "price": 350,
    "icon": "<img src=\"TeloCorp/images/image14.png\" alt=\"Cable D06 de Carga Rápida (Lightning (iPhone) Blanco)\">",
    "images": [
      "TeloCorp/images/image14.png"
    ],
    "description": "Cable económico y duradero modelo D06. Variante Lightning (iPhone) Blanco. Excelente relación calidad-precio, ideal para llevar en la mochila o tener de repuesto.",
    "specs": {
      "Conectores": "USB-A a Lightning",
      "Longitud": "1.0 Metro",
      "Material": "PVC reforzado"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "María L.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      }
    ]
  },
  {
    "id": "ts-cat-114",
    "title": "Cover 360 Colorido SHS Blindado (Rojo Fuego)",
    "category": "cases",
    "price": 700,
    "icon": "<img src=\"TeloCorp/images/image15.png\" alt=\"Cover 360 Colorido SHS Blindado (Rojo Fuego)\">",
    "images": [
      "TeloCorp/images/image15.png"
    ],
    "description": "Forro de protección total de 360 grados con colores vibrantes y diseño blindado. Ofrece la máxima protección anticaídas para la parte trasera y los laterales del dispositivo.",
    "specs": {
      "Material": "TPU flexible y policarbonato híbrido",
      "Protección": "Doble capa anticaídas 360° blindada",
      "Compatibilidad": "iPhone, Samsung, Tecno, Redmi, Honor, ZTE, Motorola",
      "Diseño": "Acabado mate texturizado antideslizante"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      }
    ]
  },
  {
    "id": "ts-cat-115",
    "title": "Altavoz Portátil Impermeable Miccell IPX7",
    "category": "audio",
    "price": 1800,
    "icon": "<img src=\"TeloCorp/images/image16.png\" alt=\"Altavoz Portátil Impermeable Miccell IPX7\">",
    "images": [
      "TeloCorp/images/image16.png"
    ],
    "description": "Altavoz robusto totalmente resistente al agua (Certificación IPX7), ideal para usar bajo la ducha, en la playa, río o piscina sin preocupaciones. Puede sumergirse temporalmente.",
    "specs": {
      "Certificación": "IPX7 (Sumergible hasta 1 metro por 30 min)",
      "Material": "Goma amortiguadora y tela de malla impermeable",
      "Conexión": "Bluetooth 5.3 con rango de hasta 15 metros",
      "Autonomía": "Hasta 6 horas de música continua"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Daniel A.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      }
    ]
  },
  {
    "id": "ts-cat-116",
    "title": "Cover de Chupón Succión Especial",
    "category": "cases",
    "price": 450,
    "icon": "<img src=\"TeloCorp/images/image17.png\" alt=\"Cover de Chupón Succión Especial\">",
    "images": [
      "TeloCorp/images/image17.png"
    ],
    "description": "Funda protectora con ventosas (chupón) de succión especial para adherir tu teléfono a surfaces planas como espejos, azulejos o vidrios. Ideal para creadores de contenido y videollamadas.",
    "specs": {
      "Material": "Silicona flexible y ventosas de alta succión",
      "Compatibilidad": "iPhone 7 Plus hasta 17 Pro Max",
      "Color": "Negro mate anti-adherente de polvo",
      "Protección": "Bordes reforzados para cámara y pantalla"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-117",
    "title": "Cargador Rápido T13 Completo (Tipo C a Tipo C 20W)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image18.png\" alt=\"Cargador Rápido T13 Completo (Tipo C a Tipo C 20W)\">",
    "images": [
      "TeloCorp/images/image18.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C a Tipo C 20W. Ideal para celulares modernos Android y tabletas.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a USB-C",
      "Protección": "Chip inteligente anticaídas de voltaje"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Lucía H.",
        "rating": 4,
        "date": "29 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-118",
    "title": "Comparativa Altavoces Miccell VQ-SP63/64/65 (Ficha)",
    "category": "audio",
    "price": 2500,
    "icon": "<img src=\"TeloCorp/images/image19.png\" alt=\"Comparativa Altavoces Miccell VQ-SP63/64/65 (Ficha)\">",
    "images": [
      "TeloCorp/images/image19.png"
    ],
    "description": "Ficha informativa y de selección rápida para los altavoces de la serie VQ-SP. Compara las capacidades de 1200mAh (SP63), 2400mAh (SP64) y 4000mAh (SP65) para que elijas el tamaño idóneo.",
    "specs": {
      "Modelos Comparados": "VQ-SP63 / VQ-SP64 / VQ-SP65",
      "Baterías": "1200mAh / 2400mAh / 4000mAh",
      "Graves": "Refuerzo dinámico de graves en los tres modelos",
      "Uso Recomendado": "Hogar (SP63) / Paseos (SP64) / Fiestas (SP65)"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Sofía T.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-119",
    "title": "Audífonos Inalámbricos TWS Miccell VQ-BH105",
    "category": "audio",
    "price": 1100,
    "icon": "<img src=\"TeloCorp/images/image20.png\" alt=\"Audífonos Inalámbricos TWS Miccell VQ-BH105\">",
    "images": [
      "TeloCorp/images/image20.png"
    ],
    "description": "Audífonos estéreo verdaderamente inalámbricos (TWS) modelo VQ-BH105. Cuentan con emparejamiento súper rápido, control táctil inteligente y aletas de silicona ergonómicas de ajuste perfecto para evitar caídas.",
    "specs": {
      "Modelo": "VQ-BH105 Stereo Earbuds",
      "Bluetooth": "BT V5.3 de alta fidelidad de sonido",
      "Operación": "Control táctil fingerprint de alta sensibilidad",
      "Diseño": "Ajuste ergonómico ultraligero (feel no weight)",
      "Compatibilidad": "Universal Android / iOS / PC"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Laura R.",
        "rating": 4,
        "date": "14 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      }
    ]
  },
  {
    "id": "ts-cat-120",
    "title": "Cable D02 Tipo C a Tipo C / Lightning 2M Extra Largo",
    "category": "tech",
    "price": 500,
    "icon": "<img src=\"TeloCorp/images/image21.png\" alt=\"Cable D02 Tipo C a Tipo C / Lightning 2M Extra Largo\">",
    "images": [
      "TeloCorp/images/image21.png"
    ],
    "description": "Cable de carga extra largo de 2 metros modelo D02. Ideal para carga de laptops, iPads y móviles a distancia sin comprometer la velocidad.",
    "specs": {
      "Conectores": "USB-C a USB-C / Lightning",
      "Longitud": "2.0 Metros",
      "Carga Rápida": "Power Delivery (PD)"
    },
    "reviews": [
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "24 May 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-121",
    "title": "Ficha Técnica: Sonido Estéreo 3D - Earbuds BH96",
    "category": "audio",
    "price": 1200,
    "icon": "<img src=\"TeloCorp/images/image22.png\" alt=\"Ficha Técnica: Sonido Estéreo 3D - Earbuds BH96\">",
    "images": [
      "TeloCorp/images/image22.png"
    ],
    "description": "Ficha descriptiva del sistema de altavoz de doble cámara de 13 mm integrado en los auriculares BH96. Explica cómo la tecnología de audio logra un sonido excepcional, bien equilibrado y graves tridimensionales.",
    "specs": {
      "Tamaño Altavoz": "Controlador dinámico de doble cámara de 13 mm",
      "Tecnología": "Sonido Estéreo Tridimensional (3D Spatial)",
      "Llamadas": "Cancelación pasiva del ruido para voz cristalina",
      "Frecuencia": "20Hz - 20kHz de respuesta lineal"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Lucía H.",
        "rating": 4,
        "date": "14 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-122",
    "title": "Cover Magnético en Cristal MagSafe (Borde Negro)",
    "category": "cases",
    "price": 800,
    "icon": "<img src=\"TeloCorp/images/image23.png\" alt=\"Cover Magnético en Cristal MagSafe (Borde Negro)\">",
    "images": [
      "TeloCorp/images/image23.png"
    ],
    "description": "Funda de cristal templado trasero de alta transparencia combinada con bordes de metal en color borde negro y soporte magnético MagSafe. Ofrece una estética limpia e idéntica a tu teléfono desnudo.",
    "specs": {
      "Material": "Vidrio templado 9H trasero y marco de TPU/Aluminio",
      "Compatibilidad": "iPhone 11 hasta 17 Pro Max",
      "MagSafe": "Imanes N52 de alta potencia incorporados",
      "Resistencia": "Antirayaduras y absorción de impactos en esquinas"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Sofía T.",
        "rating": 4,
        "date": "24 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      }
    ]
  },
  {
    "id": "ts-cat-123",
    "title": "Cable D06 de Carga Rápida (Tipo C Blanco)",
    "category": "tech",
    "price": 350,
    "icon": "<img src=\"TeloCorp/images/image24.png\" alt=\"Cable D06 de Carga Rápida (Tipo C Blanco)\">",
    "images": [
      "TeloCorp/images/image24.png"
    ],
    "description": "Cable económico y duradero modelo D06. Variante Tipo C Blanco. Excelente relación calidad-precio, ideal para llevar en la mochila o tener de repuesto.",
    "specs": {
      "Conectores": "USB-A a Tipo-C",
      "Longitud": "1.0 Metro",
      "Material": "PVC flexible"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-124",
    "title": "Panel de Control y Puertos: Altavoces Miccell (Ficha)",
    "category": "audio",
    "price": 1600,
    "icon": "<img src=\"TeloCorp/images/image25.png\" alt=\"Panel de Control y Puertos: Altavoces Miccell (Ficha)\">",
    "images": [
      "TeloCorp/images/image25.png"
    ],
    "description": "Imagen detallada del panel de mandos trasero de los altavoces Miccell, mostrando los puertos protegidos por solapa de goma: Entrada Auxiliar de 3.5mm, Ranura de Tarjeta TF, Puerto USB normal y entrada de carga Tipo-C.",
    "specs": {
      "Interfaz de Conexión": "Auxiliar, Tarjeta TF, USB-A y USB-C",
      "Botones Físicos": "Control de volumen, Encendido, Luces LED y Play",
      "Protección": "Solapa de goma hermética contra polvo y agua",
      "Compatibilidad": "Carga Tipo-C universal"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Lucía H.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-125",
    "title": "Cargador Completo T16 Inteligente Dual 30W",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image26.png\" alt=\"Cargador Completo T16 Inteligente Dual 30W\">",
    "images": [
      "TeloCorp/images/image26.png"
    ],
    "description": "Cargador de pared inteligente modelo T16 de 30W con regulación de corriente automática para proteger la vida útil de la batería. Incluye puertos duales para cargar dos dispositivos.",
    "specs": {
      "Potencia": "30W Max",
      "Puertos": "1x USB-C (PD) y 1x USB-A (QC 3.0)",
      "Certificación": "CE/FCC"
    },
    "reviews": [
      {
        "user": "Miguel B.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "María L.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-126",
    "title": "Mini Altavoz Portátil Miccell VQ-SP55 (3000mAh)",
    "category": "audio",
    "price": 1300,
    "icon": "<img src=\"TeloCorp/images/image27.png\" alt=\"Mini Altavoz Portátil Miccell VQ-SP55 (3000mAh)\">",
    "images": [
      "TeloCorp/images/image27.png"
    ],
    "description": "Mini altavoz bluetooth ultra-compacto modelo VQ-SP55 con batería de 3000mAh de larga duración. Ofrece sonido omnidireccional de 360 grados, graves súper potentes y correa de mano deportiva.",
    "specs": {
      "Modelo": "VQ-SP55 Mini Speaker",
      "Capacidad Batería": "3000 mAh (hasta 10 horas de autonomía)",
      "Distribución Audio": "Sonido omnidireccional de 360 grados",
      "Tamaño": "Bolsillo (fácil de sujetar y colgar)",
      "Luces": "Anillo LED multicolor dinámico"
    },
    "reviews": [
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "María L.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Buena calidad en los acabados. Muy recomendado para uso diario."
      }
    ]
  },
  {
    "id": "ts-cat-127",
    "title": "Cargador Rápido T13 Completo (Tipo C a Tipo C 20W con USB)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image28.png\" alt=\"Cargador Rápido T13 Completo (Tipo C a Tipo C 20W con USB)\">",
    "images": [
      "TeloCorp/images/image28.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C a Tipo C 20W. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a USB-C",
      "Protección": "Smart Control"
    },
    "reviews": [
      {
        "user": "Miguel B.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Daniel A.",
        "rating": 4,
        "date": "14 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-128",
    "title": "Vitrina Calentadora Exhibidora de Alimentos",
    "category": "equipos",
    "price": 12000,
    "icon": "<img src=\"TeloCorp/images/image29.png\" alt=\"Vitrina Calentadora Exhibidora de Alimentos\">",
    "images": [
      "TeloCorp/images/image29.png"
    ],
    "description": "Vitrina exhibidora caliente (Food Display Warmer Cabinet) de acero inoxidable y cristales templados con 3 niveles de parrilla. Mantiene las empanadas, pizzas y repostería calientes a temperatura constante.",
    "specs": {
      "Niveles": "3 bandejas de rejillas ajustables",
      "Rango Temperatura": "30°C - 85°C con termostato inteligente",
      "Estructura": "Acero inoxidable pulido y cristales panorámicos",
      "Iluminación": "Luz LED interna para exhibición premium"
    },
    "reviews": [
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Sofía T.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-129",
    "title": "Altavoz Estéreo TWS Miccell Bang SE 1+1",
    "category": "audio",
    "price": 2800,
    "icon": "<img src=\"TeloCorp/images/image30.png\" alt=\"Altavoz Estéreo TWS Miccell Bang SE 1+1\">",
    "images": [
      "TeloCorp/images/image30.png"
    ],
    "description": "Altavoz inalámbrico premium serie Bang SE con capacidad TWS (True Wireless Stereo). Permite emparejar 2 altavoces Bang SE en paralelo para duplicar la potencia y disfrutar de un sonido estéreo espectacular.",
    "specs": {
      "Serie": "Bang SE (Capacidad 1+1)",
      "Características": "Función de emparejamiento estéreo inalámbrico TWS",
      "Diseño": "Asa superior integrada y laterales iluminados RGB",
      "Sonido": "Claridad acústica superior con woofer dedicado"
    },
    "reviews": [
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "David P.",
        "rating": 4,
        "date": "14 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-130",
    "title": "Altavoz Inalámbrico Miccell VQ-SP65 (4000mAh)",
    "category": "audio",
    "price": 2900,
    "icon": "<img src=\"TeloCorp/images/image31.png\" alt=\"Altavoz Inalámbrico Miccell VQ-SP65 (4000mAh)\">",
    "images": [
      "TeloCorp/images/image31.png"
    ],
    "description": "El altavoz inalámbrico de mayor potencia de la serie VQ-SP, equipado con una gran batería de 4000mAh. Ofrece la máxima potencia de volumen y duración de batería de la línea, excelente para camping y paseos.",
    "specs": {
      "Modelo": "VQ-SP65 (Máxima Autonomía)",
      "Capacidad Batería": "4000 mAh (hasta 12 horas de duración)",
      "Potencia de Altavoz": "15W RMS de alta presión de sonido",
      "Conexiones": "Bluetooth 5.3, USB, Aux, Entrada de Micrófono",
      "Diseño": "Robusto con correa de nailon reforzada"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Pedro S.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-131",
    "title": "Cable D06 de Carga Rápida (Micro USB V8 Blanco)",
    "category": "tech",
    "price": 350,
    "icon": "<img src=\"TeloCorp/images/image32.png\" alt=\"Cable D06 de Carga Rápida (Micro USB V8 Blanco)\">",
    "images": [
      "TeloCorp/images/image32.png"
    ],
    "description": "Cable económico y duradero modelo D06. Variante Micro USB V8 Blanco. Excelente relación calidad-precio, ideal para llevar en la mochila o tener de repuesto.",
    "specs": {
      "Conectores": "USB-A a Micro-USB V8",
      "Longitud": "1.0 Metro",
      "Material": "PVC blando"
    },
    "reviews": [
      {
        "user": "David P.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Laura R.",
        "rating": 4,
        "date": "29 May 2026",
        "text": "Buena calidad en los acabados. Muy recomendado para uso diario."
      }
    ]
  },
  {
    "id": "ts-cat-132",
    "title": "Altavoz Portátil Acuático Miccell VQ-SP62 IPX6",
    "category": "audio",
    "price": 1950,
    "icon": "<img src=\"TeloCorp/images/image33.png\" alt=\"Altavoz Portátil Acuático Miccell VQ-SP62 IPX6\">",
    "images": [
      "TeloCorp/images/image33.png"
    ],
    "description": "Altavoz bluetooth cilíndrico portátil recubierto de material textil de alta resistencia anticaídas y protección IPX6 contra agua. Ideal para relajarse junto a la piscina, playa o ducha.",
    "specs": {
      "Modelo": "VQ-SP62 (Acuático)",
      "Protección": "Certificación IPX6 contra chorros de agua a presión",
      "Resistencia": "Malla textil anti-impactos de alta calidad",
      "Sonido": "Graves pasivos en los extremos con efecto de luz"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      }
    ]
  },
  {
    "id": "ts-cat-133",
    "title": "Cargador Rápido T13 Completo (Tipo C USB 20W Dual)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image34.png\" alt=\"Cargador Rápido T13 Completo (Tipo C USB 20W Dual)\">",
    "images": [
      "TeloCorp/images/image34.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C USB 20W Dual. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a Lightning",
      "Puertos": "Dual USB-A y USB-C"
    },
    "reviews": [
      {
        "user": "Pedro S.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Elena F.",
        "rating": 4,
        "date": "18 May 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-134",
    "title": "Cable D16 USB a Lightning & Tipo-C 3A (Negro Clásico)",
    "category": "tech",
    "price": 400,
    "icon": "<img src=\"TeloCorp/images/image35.png\" alt=\"Cable D16 USB a Lightning & Tipo-C 3A (Negro Clásico)\">",
    "images": [
      "TeloCorp/images/image35.png"
    ],
    "description": "Cable reforzado D16 de alta velocidad en acabado negro clásico. Compatible con entradas USB y Tipo C, con salidas de Lightning de 30W y Tipo C de 60W.",
    "specs": {
      "Conectores": "USB-A a USB-C y Lightning",
      "Corriente": "3A",
      "Longitud": "1.2 Metros"
    },
    "reviews": [
      {
        "user": "David P.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Sofía T.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      }
    ]
  },
  {
    "id": "ts-cat-135",
    "title": "Cable D16 USB a Lightning & Tipo-C 3A (Rojo Deportivo)",
    "category": "tech",
    "price": 400,
    "icon": "<img src=\"TeloCorp/images/image36.png\" alt=\"Cable D16 USB a Lightning & Tipo-C 3A (Rojo Deportivo)\">",
    "images": [
      "TeloCorp/images/image36.png"
    ],
    "description": "Cable reforzado D16 de alta velocidad en acabado rojo deportivo. Compatible con entradas USB y Tipo C, con salidas de Lightning de 30W y Tipo C de 60W.",
    "specs": {
      "Conectores": "USB-A a USB-C y Lightning",
      "Corriente": "3A",
      "Longitud": "1.2 Metros"
    },
    "reviews": [
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "David P.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-136",
    "title": "Altavoz de Cápsula Transparente Miccell 10W",
    "category": "audio",
    "price": 1750,
    "icon": "<img src=\"TeloCorp/images/image37.png\" alt=\"Altavoz de Cápsula Transparente Miccell 10W\">",
    "images": [
      "TeloCorp/images/image37.png"
    ],
    "description": "Altavoz inalámbrico de diseño futurista con cubierta de cápsula de cristal transparente que deja ver los componentes internos y cuenta con un espectacular juego de luces LED dinámicas al ritmo de la música.",
    "specs": {
      "Potencia": "10W de salida digital limpia",
      "Estética": "Cápsula de policarbonato ópticamente transparente",
      "Iluminación": "Luces LED RGB de ritmo dinámico 360",
      "Batería": "1500 mAh recargable por USB-C"
    },
    "reviews": [
      {
        "user": "David P.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Sofía T.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-137",
    "title": "Base Dispensadora Fría de Bebidas Crathco",
    "category": "equipos",
    "price": 15000,
    "icon": "<img src=\"TeloCorp/images/image38.png\" alt=\"Base Dispensadora Fría de Bebidas Crathco\">",
    "images": [
      "TeloCorp/images/image38.png"
    ],
    "description": "Base de enfriamiento y dispensación de bebidas frías Crathco (Cold Beverage Dispenser Cooling Base). Unidad de compresión de alta eficiencia que mantiene jugos o té frío helados y en constante agitación.",
    "specs": {
      "Marca": "Crathco Professional Systems",
      "Sistema": "Compresor de refrigeración comercial de alta velocidad",
      "Material": "Base de acero inoxidable y bandejas de goteo extraíbles",
      "Voltaje": "110V estándar de bajo consumo"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-138",
    "title": "Audífonos Inalámbricos Miccell ANC+ENC TWS",
    "category": "audio",
    "price": 1500,
    "icon": "<img src=\"TeloCorp/images/image39.png\" alt=\"Audífonos Inalámbricos Miccell ANC+ENC TWS\">",
    "images": [
      "TeloCorp/images/image39.png"
    ],
    "description": "Auriculares inalámbricos premium de Miccell con cancelación activa de ruido (ANC) y cancelación de ruido ambiental (ENC) para llamadas. Pantalla digital inteligente en el estuche que muestra el nivel de carga individual.",
    "specs": {
      "Tecnología": "Cancelación de Ruido Híbrida ANC + ENC",
      "Pantalla Estuche": "Indicador digital LED de batería (L y R)",
      "Autonomía": "Hasta 40 horas de reproducción total con estuche",
      "Bluetooth": "BT 5.3 de emparejamiento instantáneo y baja latencia"
    },
    "reviews": [
      {
        "user": "Sofía T.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      }
    ]
  },
  {
    "id": "ts-cat-139",
    "title": "Barra de Ensaladas Countertop Bain Marie (5 Pans)",
    "category": "equipos",
    "price": 14000,
    "icon": "<img src=\"TeloCorp/images/image40.png\" alt=\"Barra de Ensaladas Countertop Bain Marie (5 Pans)\">",
    "images": [
      "TeloCorp/images/image40.png"
    ],
    "description": "Mesa fría/caliente countertop tipo Bain Marie con sneeze guard (protector de estornudos de vidrio) y capacidad para 5 insertos (bandejas). Ideal para self-service, ensaladas, aderezos o comida caliente.",
    "specs": {
      "Capacidad": "5 insertos de acero inoxidable con tapa incluidos",
      "Protección": "Cúpula de vidrio protectora (Sneeze Guard) templado",
      "Material": "Estructura completa de acero inoxidable grado alimenticio",
      "Uso": "Mesa fría de ensaladas / Baño María caliente"
    },
    "reviews": [
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "18 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-140",
    "title": "Altavoz Recargable de Viaje Miccell VQ-SP62 (3000mAh)",
    "category": "audio",
    "price": 1900,
    "icon": "<img src=\"TeloCorp/images/image41.png\" alt=\"Altavoz Recargable de Viaje Miccell VQ-SP62 (3000mAh)\">",
    "images": [
      "TeloCorp/images/image41.png"
    ],
    "description": "Altavoz inalámbrico de tamaño medio modelo VQ-SP62 con batería de 3000mAh. Ofrece un excelente equilibrio entre potencia acústica, graves resonantes y facilidad de transporte para viajes y camping.",
    "specs": {
      "Modelo": "VQ-SP62 (Edición de Viaje)",
      "Capacidad Batería": "3000 mAh (hasta 9 horas de reproducción)",
      "Graves": "Radiadores pasivos duales en los laterales",
      "Material": "Cuerpo envuelto en tela tejida y extremos de silicona"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-141",
    "title": "Bicicleta Estática de Spinning X-Bike Premium",
    "category": "equipos",
    "price": 9500,
    "icon": "<img src=\"TeloCorp/images/image42.png\" alt=\"Bicicleta Estática de Spinning X-Bike Premium\">",
    "images": [
      "TeloCorp/images/image42.png"
    ],
    "description": "Bicicleta estacionaria de spinning y fitness (X-Bike) en color amarillo y blanco. Estructura de acero reforzado de alta estabilidad, manubrio ajustable, monitor digital de métricas y sillín ergonómico de gel.",
    "specs": {
      "Tipo": "Spinning / Ciclismo Estacionario de Alta Resistencia",
      "Monitor": "Pantalla LCD (Tiempo, Velocidad, Distancia, Calorías y Pulso)",
      "Resistencia": "Fricción magnética regulable de forma continua",
      "Características": "Soporte para tablet/móvil y ruedas de transporte"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Carlos M.",
        "rating": 4,
        "date": "18 May 2026",
        "text": "Buena calidad en los acabados. Muy recomendado para uso diario."
      }
    ]
  },
  {
    "id": "ts-cat-142",
    "title": "Cover Magnético en Cristal MagSafe (Borde Plata)",
    "category": "cases",
    "price": 800,
    "icon": "<img src=\"TeloCorp/images/image43.png\" alt=\"Cover Magnético en Cristal MagSafe (Borde Plata)\">",
    "images": [
      "TeloCorp/images/image43.png"
    ],
    "description": "Funda de cristal templado trasero de alta transparencia combinada con bordes de metal en color borde plata y soporte magnético MagSafe. Ofrece una estética limpia e idéntica a tu teléfono desnudo.",
    "specs": {
      "Material": "Vidrio templado 9H trasero y marco de TPU/Aluminio",
      "Compatibilidad": "iPhone 11 hasta 17 Pro Max",
      "MagSafe": "Imanes N52 de alta potencia incorporados",
      "Resistencia": "Antirayaduras y absorción de impactos en esquinas"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "María L.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-143",
    "title": "Cable D06 de Carga Rápida (Tipo C a Tipo C 60W)",
    "category": "tech",
    "price": 350,
    "icon": "<img src=\"TeloCorp/images/image44.png\" alt=\"Cable D06 de Carga Rápida (Tipo C a Tipo C 60W)\">",
    "images": [
      "TeloCorp/images/image44.png"
    ],
    "description": "Cable económico y duradero modelo D06. Variante Tipo C a Tipo C 60W. Excelente relación calidad-precio, ideal para llevar en la mochila o tener de repuesto.",
    "specs": {
      "Conectores": "USB-C a USB-C",
      "Longitud": "1.0 Metro",
      "Potencia": "60W Power Delivery"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-144",
    "title": "Cable de Carga Múltiple 4 en 1 Miccell 240W",
    "category": "tech",
    "price": 600,
    "icon": "<img src=\"TeloCorp/images/image45.png\" alt=\"Cable de Carga Múltiple 4 en 1 Miccell 240W\">",
    "images": [
      "TeloCorp/images/image45.png"
    ],
    "description": "Cable trenzado premium multiconector 4 en 1 de Miccell. Permite alternar entradas USB-A / USB-C y salidas Lightning / USB-C, soportando carga ultra rápida de hasta 240W para laptops y móviles.",
    "specs": {
      "Entradas": "USB-A y USB-C",
      "Salidas": "Lightning y USB-C",
      "Potencia Máxima": "240W",
      "Material": "Nylon trenzado reforzado"
    },
    "reviews": [
      {
        "user": "Sofía T.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "David P.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-145",
    "title": "Máquina Silenciosa de Hacer Hielo Manitowoc UYF0140A",
    "category": "equipos",
    "price": 28000,
    "icon": "<img src=\"TeloCorp/images/image46.png\" alt=\"Máquina Silenciosa de Hacer Hielo Manitowoc UYF0140A\">",
    "images": [
      "TeloCorp/images/image46.png"
    ],
    "description": "Máquina industrial de hacer hielo Manitowoc (Modelo UYF0140A). Produce hielo tipo media luna o cubos compactos de alta densidad de manera automática y silenciosa. Ideal para restaurantes, bares y hoteles.",
    "specs": {
      "Marca/Modelo": "Manitowoc Ice Machine UYF0140A",
      "Capacidad Producción": "Hasta 130 lbs de hielo por día",
      "Capacidad Almacenamiento": "Depósito de almacenamiento integrado de 80 lbs",
      "Material": "Acero inoxidable con recubrimiento protector anti-huellas"
    },
    "reviews": [
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Sofía T.",
        "rating": 4,
        "date": "24 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-146",
    "title": "Ficha Técnica: Batería 24h - Earbuds ANC+ENC",
    "category": "audio",
    "price": 1400,
    "icon": "<img src=\"TeloCorp/images/image47.png\" alt=\"Ficha Técnica: Batería 24h - Earbuds ANC+ENC\">",
    "images": [
      "TeloCorp/images/image47.png"
    ],
    "description": "Infografía descriptiva del rendimiento energético de los auriculares Miccell ANC+ENC. Detalla las 24 horas de uso con el estuche de carga inteligente, tiempo de carga de 2 horas y hasta 6 horas de reproducción continua.",
    "specs": {
      "Tiempo de Carga": "2 Horas para carga completa",
      "Estuche de Carga": "24 Horas de batería adicionales",
      "Carga Única": "Hasta 6 horas de música por carga",
      "Indicador": "Nivel porcentual LED en pantalla del estuche"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Carlos M.",
        "rating": 4,
        "date": "05 Jun 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-147",
    "title": "Cargador Rápido T13 Completo (Tipo C a iPhone 20W con USB)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image48.png\" alt=\"Cargador Rápido T13 Completo (Tipo C a iPhone 20W con USB)\">",
    "images": [
      "TeloCorp/images/image48.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C a iPhone 20W con USB. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a Lightning",
      "Entrada Extra": "USB-A"
    },
    "reviews": [
      {
        "user": "Pedro S.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-148",
    "title": "Cover Magnético en Cristal MagSafe (Borde Oro)",
    "category": "cases",
    "price": 800,
    "icon": "<img src=\"TeloCorp/images/image49.png\" alt=\"Cover Magnético en Cristal MagSafe (Borde Oro)\">",
    "images": [
      "TeloCorp/images/image49.png"
    ],
    "description": "Funda de cristal templado trasero de alta transparencia combinada con bordes de metal en color borde oro y soporte magnético MagSafe. Ofrece una estética limpia e idéntica a tu teléfono desnudo.",
    "specs": {
      "Material": "Vidrio templado 9H trasero y marco de TPU/Aluminio",
      "Compatibilidad": "iPhone 11 hasta 17 Pro Max",
      "MagSafe": "Imanes N52 de alta potencia incorporados",
      "Resistencia": "Antirayaduras y absorción de impactos en esquinas"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Lucía H.",
        "rating": 4,
        "date": "24 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      }
    ]
  },
  {
    "id": "ts-cat-149",
    "title": "Cable D06 de Carga Rápida (Tipo C a Lightning 30W)",
    "category": "tech",
    "price": 350,
    "icon": "<img src=\"TeloCorp/images/image50.png\" alt=\"Cable D06 de Carga Rápida (Tipo C a Lightning 30W)\">",
    "images": [
      "TeloCorp/images/image50.png"
    ],
    "description": "Cable económico y duradero modelo D06. Variante Tipo C a Lightning 30W. Excelente relación calidad-precio, ideal para llevar en la mochila o tener de repuesto.",
    "specs": {
      "Conectores": "USB-C a Lightning",
      "Longitud": "1.0 Metro",
      "Potencia": "30W Power Delivery"
    },
    "reviews": [
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "David P.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-150",
    "title": "Cargador Rápido T13 Individual GaN (20W-100W)",
    "category": "tech",
    "price": 950,
    "icon": "<img src=\"TeloCorp/images/image51.png\" alt=\"Cargador Rápido T13 Individual GaN (20W-100W)\">",
    "images": [
      "TeloCorp/images/image51.png"
    ],
    "description": "Cabezales individuales de cargador de pared T13. Disponibles en potencias desde 20W hasta 100W para satisfacer la carga súper rápida de laptops y móviles de gama alta. Utiliza tecnología GaN avanzada.",
    "specs": {
      "Tecnología": "GaN (Nitruro de Galio)",
      "Potencias": "20W, 45W, 65W, 100W",
      "Puertos": "USB-C"
    },
    "reviews": [
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Miguel B.",
        "rating": 4,
        "date": "05 Jun 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-151",
    "title": "Vitrina Exhibidora de Pastelería Spartan Cristal Curvo",
    "category": "equipos",
    "price": 35000,
    "icon": "<img src=\"TeloCorp/images/image52.png\" alt=\"Vitrina Exhibidora de Pastelería Spartan Cristal Curvo\">",
    "images": [
      "TeloCorp/images/image52.png"
    ],
    "description": "Vitrina exhibidora refrigerada Spartan con cristal frontal curvo templado de doble panel. Diseñada con elegantes acabados en acero inoxidable y repisas de vidrio flotado para pastelería fina, postres y cafetería.",
    "specs": {
      "Marca": "Spartan Display Cases",
      "Cristal": "Frontal curvo anti-empañamiento panorámico",
      "Sistema Enfriamiento": "Flujo de aire forzado para temperatura uniforme",
      "Repisas": "3 niveles ajustables con iluminación LED en cada nivel"
    },
    "reviews": [
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "02 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      }
    ]
  },
  {
    "id": "ts-cat-152",
    "title": "Cable D16 USB a Lightning & Tipo-C 3A (Azul Marino)",
    "category": "tech",
    "price": 400,
    "icon": "<img src=\"TeloCorp/images/image53.png\" alt=\"Cable D16 USB a Lightning & Tipo-C 3A (Azul Marino)\">",
    "images": [
      "TeloCorp/images/image53.png"
    ],
    "description": "Cable de nylon trenzado reforzado D16 de alta velocidad en color azul marino. Soporta hasta 3A para carga rápida segura de dos dispositivos a la vez.",
    "specs": {
      "Conectores": "USB-A a USB-C y Lightning",
      "Corriente": "3A",
      "Longitud": "1.2 Metros"
    },
    "reviews": [
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Daniel A.",
        "rating": 4,
        "date": "29 May 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      }
    ]
  },
  {
    "id": "ts-cat-153",
    "title": "Cable D06 de Carga Rápida (Lightning (iPhone) Negro)",
    "category": "tech",
    "price": 350,
    "icon": "<img src=\"TeloCorp/images/image54.png\" alt=\"Cable D06 de Carga Rápida (Lightning (iPhone) Negro)\">",
    "images": [
      "TeloCorp/images/image54.png"
    ],
    "description": "Cable económico y duradero modelo D06. Variante Lightning (iPhone) Negro. Excelente relación calidad-precio, ideal para llevar en la mochila o tener de repuesto.",
    "specs": {
      "Conectores": "USB-A a Lightning",
      "Longitud": "1.0 Metro",
      "Material": "PVC reforzado negro"
    },
    "reviews": [
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "David P.",
        "rating": 4,
        "date": "29 May 2026",
        "text": "Buena calidad en los acabados. Muy recomendado para uso diario."
      }
    ]
  },
  {
    "id": "ts-cat-154",
    "title": "Batería Portátil TeloCorp Power 20,000 mAh",
    "category": "tech",
    "price": 1950,
    "icon": "<img src=\"TeloCorp/images/image55.png\" alt=\"Batería Portátil TeloCorp Power 20,000 mAh\">",
    "images": [
      "TeloCorp/images/image55.png"
    ],
    "description": "Batería externa premium de 20,000 mAh de súper alta capacidad, ideal para viajes largos, camping o carga de múltiples dispositivos. Soporta carga rápida bidireccional.",
    "specs": {
      "Capacidad": "20,000 mAh",
      "Salidas": "2x USB-A (QC 3.0) y 1x USB-C (PD 22.5W)",
      "Protección": "Chip Multi-Protección"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Miguel B.",
        "rating": 4,
        "date": "05 Jun 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-155",
    "title": "Cover 360 Colorido SHS Blindado (Azul Cobalto)",
    "category": "cases",
    "price": 700,
    "icon": "<img src=\"TeloCorp/images/image56.png\" alt=\"Cover 360 Colorido SHS Blindado (Azul Cobalto)\">",
    "images": [
      "TeloCorp/images/image56.png"
    ],
    "description": "Forro de protección total de 360 grados con colores vibrantes y diseño blindado. Ofrece la máxima protección anticaídas para la parte trasera y los laterales del dispositivo.",
    "specs": {
      "Material": "TPU flexible y policarbonato híbrido",
      "Protección": "Doble capa anticaídas 360° blindada",
      "Compatibilidad": "iPhone, Samsung, Tecno, Redmi, Honor, ZTE, Motorola",
      "Diseño": "Acabado mate texturizado antideslizante"
    },
    "reviews": [
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Daniel A.",
        "rating": 4,
        "date": "14 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      }
    ]
  },
  {
    "id": "ts-cat-156",
    "title": "Cargador Rápido T13 Completo (Tipo C Doble Salida 20W)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image57.png\" alt=\"Cargador Rápido T13 Completo (Tipo C Doble Salida 20W)\">",
    "images": [
      "TeloCorp/images/image57.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C Doble Salida 20W. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a USB-C",
      "Puertos": "2x USB-C"
    },
    "reviews": [
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Carlos M.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-157",
    "title": "Cable D34 Multiconector USB/Tipo-C a Lightning & Tipo-C 3A",
    "category": "tech",
    "price": 450,
    "icon": "<img src=\"TeloCorp/images/image58.png\" alt=\"Cable D34 Multiconector USB/Tipo-C a Lightning & Tipo-C 3A\">",
    "images": [
      "TeloCorp/images/image58.png"
    ],
    "description": "Cable multifuncional D34 de carga rápida con conectores intercambiables. Soporta hasta 3A para USB normal y hasta 100W para Tipo C a Tipo C. El único cable que necesitas.",
    "specs": {
      "Entradas": "USB-A y USB-C",
      "Salidas": "Lightning y USB-C",
      "Corriente": "3A / 100W Max"
    },
    "reviews": [
      {
        "user": "Sofía T.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "María L.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      }
    ]
  },
  {
    "id": "ts-cat-158",
    "title": "Ficha Técnica: Cable Ultra Resistente Flex-Test 30k",
    "category": "tech",
    "price": 450,
    "icon": "<img src=\"TeloCorp/images/image59.png\" alt=\"Ficha Técnica: Cable Ultra Resistente Flex-Test 30k\">",
    "images": [
      "TeloCorp/images/image59.png"
    ],
    "description": "Infografía explicativa del test de resistencia del cable Miccell. Demuestra la capacidad del conector de soportar más de 30,000 flexiones de 90 grados sin sufrir daños en la transmisión.",
    "specs": {
      "Test": "Prueba de flexión y torsión mecánica",
      "Resistencia": "30,000 ciclos de flexión",
      "Estructura": "Junta de silicona reforzada"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Laura R.",
        "rating": 4,
        "date": "18 May 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      }
    ]
  },
  {
    "id": "ts-cat-159",
    "title": "Ficha Técnica: Estuche Carga 5 Maratones - Miccell",
    "category": "audio",
    "price": 1450,
    "icon": "<img src=\"TeloCorp/images/image60.png\" alt=\"Ficha Técnica: Estuche Carga 5 Maratones - Miccell\">",
    "images": [
      "TeloCorp/images/image60.png"
    ],
    "description": "Ficha descriptiva de la batería de alto rendimiento de los audífonos Miccell. Destaca la capacidad de cargar los audífonos hasta 4 veces completas, brindando una duración equivalente a correr 5 maratones.",
    "specs": {
      "Duración por Carga": "8 horas por auricular individual",
      "Duración con Estuche": "Hasta 30 horas de reproducción total",
      "Tecnología": "Administración de energía inteligente de litio",
      "Material": "Carcasa ABS ecológica de tacto suave (soft-touch)"
    },
    "reviews": [
      {
        "user": "Daniel A.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "29 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-160",
    "title": "Auriculares Inalámbricos Miccell 320mAh TWS",
    "category": "audio",
    "price": 1350,
    "icon": "<img src=\"TeloCorp/images/image61.png\" alt=\"Auriculares Inalámbricos Miccell 320mAh TWS\">",
    "images": [
      "TeloCorp/images/image61.png"
    ],
    "description": "Auriculares inalámbricos TWS de Miccell con estuche de carga de 320mAh y pantalla LED. Proporcionan hasta 20 horas de reproducción total de música, ideales para el día a día y viajes al trabajo.",
    "specs": {
      "Batería Auriculares": "35 mAh * 2 (hasta 5 horas por carga única)",
      "Batería Estuche": "320 mAh (recarga los auriculares hasta 4 veces)",
      "Tiempo de Recarga": "2 Horas para carga completa del estuche",
      "Autonomía Total": "Hasta 20 horas de reproducción continua"
    },
    "reviews": [
      {
        "user": "Lucía H.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "David P.",
        "rating": 4,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-161",
    "title": "Planta Eléctrica DuroMax XP12000HX Dual Fuel",
    "category": "equipos",
    "price": 65000,
    "icon": "<img src=\"TeloCorp/images/image62.png\" alt=\"Planta Eléctrica DuroMax XP12000HX Dual Fuel\">",
    "images": [
      "TeloCorp/images/image62.png"
    ],
    "description": "Generador eléctrico de alta potencia DuroMax XP12000HX Dual Fuel (Gasolina o Propano). Ofrece hasta 12,000 vatios de potencia de arranque, ideal para respaldo total del hogar, fincas, talleres o construcción.",
    "specs": {
      "Marca/Modelo": "DuroMax XP12000HX Dual Fuel Generator",
      "Potencia de Arranque": "12,000 Vatios (12 kW)",
      "Combustible": "Dual Fuel (Gasolina / Gas Propano GLP)",
      "Características": "Arranque eléctrico y panel de control digital inteligente"
    },
    "reviews": [
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-162",
    "title": "Caminadora Eléctrica Plegable Pro-Form CC300",
    "category": "equipos",
    "price": 18000,
    "icon": "<img src=\"TeloCorp/images/image63.png\" alt=\"Caminadora Eléctrica Plegable Pro-Form CC300\">",
    "images": [
      "TeloCorp/images/image63.png"
    ],
    "description": "Caminadora y caminadora de correr eléctrica plegable Pro-Form CC300. Cuenta con motor silencioso, amortiguación ProShox para protección de articulaciones, inclinación ajustable y plegado vertical ahorrador de espacio.",
    "specs": {
      "Marca/Modelo": "Pro-Form CC300 Folding Treadmill",
      "Velocidad": "0 a 10 mph ajustable digitalmente",
      "Inclinación": "Ajuste manual de inclinación en 3 posiciones",
      "Seguridad": "Llave de parada de emergencia magnética"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-163",
    "title": "Cover Magnético en Cristal MagSafe (Borde Azul Sierra)",
    "category": "cases",
    "price": 800,
    "icon": "<img src=\"TeloCorp/images/image64.png\" alt=\"Cover Magnético en Cristal MagSafe (Borde Azul Sierra)\">",
    "images": [
      "TeloCorp/images/image64.png"
    ],
    "description": "Funda de cristal templado trasero de alta transparencia combinada con bordes de metal en color borde azul sierra y soporte magnético MagSafe. Ofrece una estética limpia e idéntica a tu teléfono desnudo.",
    "specs": {
      "Material": "Vidrio templado 9H trasero y marco de TPU/Aluminio",
      "Compatibilidad": "iPhone 11 hasta 17 Pro Max",
      "MagSafe": "Imanes N52 de alta potencia incorporados",
      "Resistencia": "Antirayaduras y absorción de impactos en esquinas"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "18 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      },
      {
        "user": "Elena F.",
        "rating": 4,
        "date": "29 May 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-164",
    "title": "Cargador Rápido T13 Completo (Tipo C Multi-puertos 20W)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image65.png\" alt=\"Cargador Rápido T13 Completo (Tipo C Multi-puertos 20W)\">",
    "images": [
      "TeloCorp/images/image65.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Tipo C Multi-puertos 20W. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a Lightning",
      "Puertos": "1x USB-C y 2x USB-A"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "02 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "02 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      }
    ]
  },
  {
    "id": "ts-cat-165",
    "title": "Ficha Técnica: Auriculares de Clip Autónomos 40h",
    "category": "audio",
    "price": 1550,
    "icon": "<img src=\"TeloCorp/images/image66.png\" alt=\"Ficha Técnica: Auriculares de Clip Autónomos 40h\">",
    "images": [
      "TeloCorp/images/image66.png"
    ],
    "description": "Ficha informativa de los auriculares de clip Miccell. Detalla la tecnología de batería de larga duración con hasta 40 horas de reproducción continua bajo una sola carga del estuche de gran capacidad.",
    "specs": {
      "Autonomía Total": "Hasta 40 horas de música ininterrumpida",
      "Tipo de Ajuste": "Clip de oreja (Ear-clip) ergonómico y cómodo",
      "Diseño": "Ajuste seguro e indoloro para uso prolongado",
      "Conexión": "Bluetooth 5.3 con chip Miccell de bajo consumo"
    },
    "reviews": [
      {
        "user": "Elena F.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Muy satisfecho con la compra, el material es excelente y llegó a tiempo."
      },
      {
        "user": "María L.",
        "rating": 4,
        "date": "10 May 2026",
        "text": "Muy práctico y útil. La calidad es buena por el precio."
      }
    ]
  },
  {
    "id": "ts-cat-166",
    "title": "Altavoz Boombox Potencia Digital Miccell SP56 300W",
    "category": "audio",
    "price": 4500,
    "icon": "<img src=\"TeloCorp/images/image67.png\" alt=\"Altavoz Boombox Potencia Digital Miccell SP56 300W\">",
    "images": [
      "TeloCorp/images/image67.png"
    ],
    "description": "Altavoz tipo maletín boombox Miccell SP56 con amplificador digital TI de 300W. Equipado con un potente subwoofer de 2x119mm (100W), altavoces tenor de 2x78mm (30W) y tweeters de 2x66mm.",
    "specs": {
      "Modelo": "SP56 Digital Boombox",
      "Amplificador": "Chip amplificador digital TI de alta potencia",
      "Configuración Altavoces": "Subwoofer dual + Tenor dual + Tweeter dual",
      "Potencia Máxima": "300W de sonido de alta fidelidad para fiestas",
      "Características": "Efectos de iluminación LED rítmicos en los conos"
    },
    "reviews": [
      {
        "user": "Laura R.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente relación calidad-precio. Volveré a comprar sin duda."
      },
      {
        "user": "Lucía H.",
        "rating": 4,
        "date": "14 May 2026",
        "text": "Muy buen producto, se siente resistente aunque demoró un día más en llegar."
      }
    ]
  },
  {
    "id": "ts-cat-167",
    "title": "Cargador Rápido T13 Completo (Carga Ultra Rápida 20W)",
    "category": "tech",
    "price": 850,
    "icon": "<img src=\"TeloCorp/images/image68.png\" alt=\"Cargador Rápido T13 Completo (Carga Ultra Rápida 20W)\">",
    "images": [
      "TeloCorp/images/image68.png"
    ],
    "description": "Cargador de pared completo T13 de 20W con cable incluido. Conector Carga Ultra Rápida 20W. Cabezal con chip inteligente para proteger el móvil contra sobrecalentamiento.",
    "specs": {
      "Potencia": "20W",
      "Cable": "1.0m USB-C a Lightning",
      "Protección": "Chip inteligente contra cortocircuito"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "David P.",
        "rating": 4,
        "date": "18 May 2026",
        "text": "Cumple su función perfectamente, el material se nota duradero y robusto."
      }
    ]
  },
  {
    "id": "ts-cat-168",
    "title": "Kit Calentador de Inducción Flameless Solary Hot Rod",
    "category": "equipos",
    "price": 12500,
    "icon": "<img src=\"TeloCorp/images/image69.png\" alt=\"Kit Calentador de Inducción Flameless Solary Hot Rod\">",
    "images": [
      "TeloCorp/images/image69.png"
    ],
    "description": "Calentador de inducción magnética portátil sin llama (Solary Hot Rod Flameless Induction Heater Kit). Ideal para mecánicos y talleres, permite calentar tuercas, pernos y piezas de metal trabadas u oxidadas en segundos.",
    "specs": {
      "Marca": "Solary Professional Tools",
      "Tecnología": "Calentamiento electromagnético por inducción sin llama",
      "Incluye": "Bobinas de inducción flexibles de varios diámetros y maletín",
      "Uso": "Desmontaje de pernos, tuercas oxidadas y rodamientos trabados"
    },
    "reviews": [
      {
        "user": "Jorge V.",
        "rating": 5,
        "date": "24 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Ana G.",
        "rating": 4,
        "date": "02 Jun 2026",
        "text": "Buen empaque y presentación. Se adapta perfectamente a lo descrito."
      }
    ]
  },
  {
    "id": "ts-cat-169",
    "title": "Cover Magnético Original Transparente MagSafe Premium",
    "category": "cases",
    "price": 600,
    "icon": "<img src=\"TeloCorp/images/image70.png\" alt=\"Cover Magnético Original Transparente MagSafe Premium\">",
    "images": [
      "TeloCorp/images/image70.png"
    ],
    "description": "Funda transparente premium con tecnología magnética integrada (MagSafe). Material de policarbonato ópticamente transparente que evita el amarilleo y ofrece protección premium contra caídas.",
    "specs": {
      "Material": "Poliuretano termoplástico (TPU) y Policarbonato rígido",
      "Compatibilidad": "iPhone 7 Plus hasta 17 Pro Max",
      "Características": "Magnetismo fuerte MagSafe, tecnología anti-amarilleo",
      "Protección": "Certificación anticaídas de grado militar"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "05 Jun 2026",
        "text": "Excelente calidad, superó mis expectativas de calidad y el envío fue rápido."
      },
      {
        "user": "Ana G.",
        "rating": 5,
        "date": "29 May 2026",
        "text": "Buena calidad en los acabados. Muy recomendado para uso diario."
      }
    ]
  },
  {
    "id": "ts-cat-170",
    "title": "Audífonos de Clip Inalámbricos Miccell BH106",
    "category": "audio",
    "price": 1600,
    "icon": "<img src=\"TeloCorp/images/image71.png\" alt=\"Audífonos de Clip Inalámbricos Miccell BH106\">",
    "images": [
      "TeloCorp/images/image71.png"
    ],
    "description": "Auriculares inalámbricos de clip Miccell BH106. Innovador diseño ergonómico de clip que no se inserta en el canal auditivo, ofreciendo comodidad absoluta sin dolor y permitiendo escuchar el entorno.",
    "specs": {
      "Modelo": "VQ-BH106 (Ear Clip Wireless Earbuds)",
      "Versión BT": "BT V5.3 con emparejamiento automático instantáneo",
      "Batería Auricular": "40 mAh (hasta 5.5 horas de música continua)",
      "Batería Estuche": "400 mAh (hasta 24 horas de uso total)",
      "Diseño": "Gancho de silicona flexible y ganchos deportivos seguros"
    },
    "reviews": [
      {
        "user": "María L.",
        "rating": 5,
        "date": "10 May 2026",
        "text": "Me encantó el diseño y la resistencia. Ajusta perfecto y se ve muy estético."
      },
      {
        "user": "Pedro S.",
        "rating": 5,
        "date": "14 May 2026",
        "text": "Excelente producto, se siente muy premium al tacto. Recomendado 100%."
      }
    ]
  }
];

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
  
  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
        .catch(err => console.error('Fallo al registrar Service Worker:', err));
    });
  }

  initNavigation();
  renderProducts('all');
  renderPlatziCourses('all');
  updateCartUI();
  if (window.updateWishlistUI) {
    window.updateWishlistUI();
  }
  setupContactForm();
  setupPlatziDashboard();
  
  // Inicializar Puerta de Administración y Chatbot
  if (window.initAdminGate) {
    window.initAdminGate();
  }
  if (window.initChatbot) {
    window.initChatbot();
  }

  if (window.setupIntegrationsUI) {
    window.setupIntegrationsUI();
  }
  
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
      if (window.filterAndSortProducts) {
        window.filterAndSortProducts();
      } else {
        renderProducts(e.currentTarget.getAttribute('data-cat'));
      }
    });
  });
}

window.switchAppView = function(viewId) {
  // Cerrar menú móvil si está abierto
  if (window.closeMobileMenu) {
    window.closeMobileMenu();
  }

  // Pausar fake video si salimos de la clase
  if(viewId !== 'educa-classroom-view' && isVideoPlaying) {
    window.togglePlayPauseVideo();
  }
  
  if (viewId === 'integrations-view' && window.setupIntegrationsUI) {
    window.setupIntegrationsUI();
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
    'home-view': 'Bienvenido a TeloCorpGroup',
    'sales-view': 'TeloSales Store',
    'educa-view': 'Academia TeloEduca',
    'educa-classroom-view': 'Aula de Clases TeloEduca',
    'lleva-view': 'Logística TeloLleva',
    'repara-view': 'Soporte Técnico TeloRepara',
    'instala-view': 'Instalaciones TeloInstala',
    'about-view': 'Quiénes Somos',
    'profile-view': 'Mi Perfil',
    'support-view': 'Hub Administrativo Central',
    'integrations-view': 'Conectores e Integraciones de Servicios'
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
  
  const searchQuery = document.getElementById('sales-search')?.value.trim().toLowerCase() || '';
  const sortBy = document.getElementById('sales-sort')?.value || 'featured';
  
  let filtered = category === 'all' 
    ? [...productsDatabase] 
    : productsDatabase.filter(p => p.category === category);
    
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(searchQuery) || 
      p.description.toLowerCase().includes(searchQuery)
    );
  }
  
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating-desc') {
    filtered.sort((a, b) => {
      const getAvgRating = p => p.reviews && p.reviews.length 
        ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) 
        : 0;
      return getAvgRating(b) - getAvgRating(a);
    });
  }
  
  if(filtered.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted); padding: 20px;">No hay productos que coincidan con tu búsqueda.</p>`;
    return;
  }
  
  filtered.forEach(product => {
    const isAdded = AppState.cart.find(item => item.id === product.id);
    const btnText = isAdded ? 'Añadir Más' : 'Agregar al Carrito';
    const isFavorite = AppState.wishlist.includes(product.id);
    const stock = (product.price % 7) + 2;
    const stockHtml = stock <= 4 
      ? `<div class="product-stock urgent" style="font-size:0.75rem; color:#ef4444; font-weight:600; margin-bottom:6px;">⚠️ ¡Solo quedan ${stock} unidades!</div>`
      : `<div class="product-stock" style="font-size:0.75rem; color:#10b981; font-weight:600; margin-bottom:6px;">🟢 En stock (${stock} uds.)</div>`;
    
    grid.innerHTML += `
      <div class="product-card" style="position: relative;">
        <button class="product-wishlist-heart ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); window.toggleProductWishlist('${product.id}')" title="${isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}" style="outline: none;">
          ${isFavorite ? '❤️' : '🤍'}
        </button>
        <div class="product-image" onclick="window.openProductModal('${product.id}')" style="cursor:pointer;">${product.icon}</div>
        <div class="product-info">
          ${stockHtml}
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
  
  // Set wishlist heart state in modal
  const modalHeart = document.getElementById('modal-wishlist-btn');
  if (modalHeart) {
    const isFavorite = AppState.wishlist.includes(productId);
    modalHeart.innerText = isFavorite ? '❤️' : '🤍';
    modalHeart.title = isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos';
  }
  
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

document.getElementById('global-cart-btn')?.addEventListener('click', () => window.toggleCart());
cartOverlay?.addEventListener('click', () => window.toggleCart());

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
  
  // Recalcular cupón si está aplicado
  let discountAmount = 0;
  const couponDiscountRow = document.getElementById('cart-coupon-discount-row');
  const couponDiscountValue = document.getElementById('cart-coupon-discount-value');
  const couponInput = document.getElementById('cart-coupon-input');
  
  if (AppState.appliedCoupon && totalPrice > 0) {
    discountAmount = totalPrice * AppState.appliedCoupon.discountPct;
    totalPrice -= discountAmount;
    
    if (couponDiscountRow && couponDiscountValue) {
      couponDiscountRow.style.display = 'flex';
      couponDiscountValue.innerText = `-RD$ ${discountAmount.toFixed(2)}`;
    }
    if (couponInput) {
      couponInput.value = AppState.appliedCoupon.code;
    }
  } else {
    if (couponDiscountRow) {
      couponDiscountRow.style.display = 'none';
    }
    if (couponInput && totalPrice === 0) {
      couponInput.value = '';
    }
  }
  
  badge.innerText = totalItems;
  totalPriceEl.innerText = `RD$ ${totalPrice.toFixed(2)}`;
}

// ==========================================
// TELOSALES: MOTOR DE CUPONES Y WISHLIST
// ==========================================
window.applyCartCoupon = function() {
  const inputEl = document.getElementById('cart-coupon-input');
  if (!inputEl) return;
  const code = inputEl.value.trim().toUpperCase();
  
  if (!code) {
    if (AppState.appliedCoupon) {
      AppState.appliedCoupon = null;
      AppState.saveState();
      updateCartUI();
      window.showToast("Cupón removido", "success");
    } else {
      window.showToast("Introduce un código de cupón", "error");
    }
    return;
  }
  
  let discountPct = 0;
  if (code === 'TELO10') {
    discountPct = 0.10;
  } else if (code === 'SUPERAPP') {
    discountPct = 0.15;
  } else {
    window.showToast("Cupón inválido", "error");
    return;
  }
  
  AppState.appliedCoupon = { code, discountPct };
  AppState.saveState();
  updateCartUI();
  window.showToast(`Cupón ${code} aplicado con éxito (Descuento del ${discountPct * 100}%)`, "success");
};

window.toggleWishlist = function() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-overlay');
  if (drawer && overlay) {
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
  }
};

window.toggleProductWishlist = function(productId) {
  if (!AppState.wishlist) AppState.wishlist = [];
  const index = AppState.wishlist.indexOf(productId);
  if (index > -1) {
    AppState.wishlist.splice(index, 1);
    window.showToast("Eliminado de la lista de deseos", "success");
  } else {
    AppState.wishlist.push(productId);
    window.showToast("Añadido a la lista de deseos", "success");
  }
  AppState.saveState();
  window.updateWishlistUI();
  
  // Re-renderizar productos en grilla
  const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
  renderProducts(activeFilter);
  
  // Si el modal detallado del producto está abierto y es el mismo producto, actualizar el botón
  const modalHeart = document.getElementById('modal-wishlist-btn');
  if (modalHeart && modalActiveProductId === productId) {
    const isFavorite = AppState.wishlist.includes(productId);
    modalHeart.innerText = isFavorite ? '❤️' : '🤍';
    modalHeart.title = isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos';
  }
};

window.toggleModalProductWishlist = function() {
  if (modalActiveProductId) {
    window.toggleProductWishlist(modalActiveProductId);
  }
};

window.updateWishlistUI = function() {
  const container = document.getElementById('wishlist-items-container');
  const badge = document.getElementById('global-wishlist-badge');
  if (!container) return;
  
  if (!AppState.wishlist) AppState.wishlist = [];
  
  if (badge) {
    badge.innerText = AppState.wishlist.length;
  }
  
  if (AppState.wishlist.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center; margin-top:20px;">Tu lista de deseos está vacía.</p>`;
    return;
  }
  
  container.innerHTML = '';
  AppState.wishlist.forEach(productId => {
    const product = productsDatabase.find(p => p.id === productId);
    if (!product) return;
    
    container.innerHTML += `
      <div class="wishlist-item" id="wishlist-item-${product.id}">
        <div class="wishlist-item-img">
          ${product.icon}
        </div>
        <div class="wishlist-item-info">
          <div class="wishlist-item-title" onclick="window.openProductModal('${product.id}'); window.toggleWishlist();" style="cursor:pointer;" title="Ver producto">${product.title}</div>
          <div class="wishlist-item-price">RD$ ${product.price.toFixed(2)}</div>
        </div>
        <div class="wishlist-item-actions">
          <button class="btn-wishlist-remove" onclick="window.toggleProductWishlist('${product.id}')" title="Eliminar de favoritos">×</button>
          <button class="btn btn-primary" onclick="window.addToCart('${product.id}')" style="padding: 4px 8px; font-size: 0.75rem;">Agregar</button>
        </div>
      </div>
    `;
  });
};

window.filterAndSortProducts = function() {
  const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
  renderProducts(activeFilter);
};

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

window.checkoutCart = async function() {
  if(AppState.cart.length === 0) {
    window.showToast('El carrito está vacío', 'error');
    return;
  }
  
  const totalAmount = parseFloat(document.getElementById('cart-total-price').innerText.replace('RD$', '').replace(/,/g, '').trim());
  const productsText = AppState.cart.map(item => `${item.title} (x${item.quantity})`).join(', ');
  
  // Si Stripe está habilitado, validamos datos
  if (AppState.integrations && AppState.integrations.stripeEnabled) {
    const cardName = document.getElementById('stripe-card-name').value.trim();
    const cardNumber = document.getElementById('stripe-card-number').value.trim();
    const cardExpiry = document.getElementById('stripe-card-expiry').value.trim();
    const cardCvc = document.getElementById('stripe-card-cvc').value.trim();
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      window.showToast('Por favor completa todos los campos de pago de Stripe', 'error');
      return;
    }
    
    const checkoutBtn = document.querySelector('.cart-footer button');
    const oldText = checkoutBtn.innerText;
    checkoutBtn.innerText = 'Procesando Stripe...';
    checkoutBtn.disabled = true;
    
    window.showToast('Conectando con pasarela Stripe...', 'success');
    
    const payload = {
      paymentMethod: "Stripe Credit Card",
      cardholderName: cardName,
      cardNumberMasked: cardNumber.slice(0, 4) + " **** **** " + cardNumber.slice(-4),
      amount: totalAmount,
      currency: "DOP",
      items: AppState.cart,
      stripeKey: AppState.integrations.stripeKey,
      timestamp: new Date().toISOString()
    };
    
    const targetUrl = AppState.integrations.stripeWebhook || AppState.integrations.n8nOrdersUrl;
    
    if (targetUrl) {
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('out', `Procesando Cobro Stripe Webhook: ${targetUrl}`, JSON.stringify(payload, null, 2));
      }
      
      const payloadStr = JSON.stringify(payload);
      const headers = { 'Content-Type': 'application/json' };
      
      if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
        try {
          const sig = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
          headers['X-Telo-Signature'] = sig;
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('info', `Firma HMAC Generada: ${sig.slice(0, 15)}... (cabecera X-Telo-Signature)`);
          }
        } catch (e) {
          console.error("Error signing HMAC:", e);
        }
      }
      
      fetch(targetUrl, {
        method: 'POST',
        headers: headers,
        body: payloadStr
      })
      .then(async (response) => {
        const respText = await response.text();
        const statusStr = `Sincronizado (${response.status})`;
        if (response.ok) {
          window.showToast('¡Pago de Stripe procesado e integrado con éxito!', 'success');
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('success', `Stripe aprobó el pago (HTTP ${response.status})`, respText);
          }
          
          window.addDbSalesRecord(cardName, productsText, totalAmount, "Stripe", statusStr);
          
          // Limpiar carrito
          AppState.cart = [];
          AppState.saveState();
          updateCartUI();
          window.toggleCart();
          
          // Limpiar form de tarjeta
          document.getElementById('stripe-card-name').value = '';
          document.getElementById('stripe-card-number').value = '';
          document.getElementById('stripe-card-expiry').value = '';
          document.getElementById('stripe-card-cvc').value = '';
          
          const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
          renderProducts(activeFilter);
        } else {
          window.showToast(`Error en la pasarela Stripe (HTTP ${response.status})`, 'error');
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('error', `Stripe rechazó el cargo (HTTP ${response.status})`, respText);
          }
          window.addDbSalesRecord(cardName, productsText, totalAmount, "Stripe", `Fallo (${response.status})`);
        }
      })
      .catch(error => {
        console.error(error);
        window.showToast('Error de red al conectar con Stripe/n8n.', 'error');
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('error', `Fallo de conexión en pasarela Stripe: ${error.message}`);
        }
        window.addDbSalesRecord(cardName, productsText, totalAmount, "Stripe", 'Error Red');
      })
      .finally(() => {
        checkoutBtn.innerText = oldText;
        checkoutBtn.disabled = false;
      });
      
    } else {
      // Si Stripe está activo pero no configuraron Webhook
      window.addDbSalesRecord(cardName, productsText, totalAmount, "Stripe (Local)", 'Local');
      setTimeout(() => {
        window.showToast('Pago aprobado (Modo Local / Sin Webhook)', 'success');
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('warn', 'Cobro aprobado localmente. Configura Stripe Webhook para conectar con n8n/Odoo.');
        }
        AppState.cart = [];
        AppState.saveState();
        updateCartUI();
        window.toggleCart();
        
        // Limpiar form
        document.getElementById('stripe-card-name').value = '';
        document.getElementById('stripe-card-number').value = '';
        document.getElementById('stripe-card-expiry').value = '';
        document.getElementById('stripe-card-cvc').value = '';
        
        const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
        renderProducts(activeFilter);
        checkoutBtn.innerText = oldText;
        checkoutBtn.disabled = false;
      }, 1500);
    }
    
  } else {
    // Cobro simulado tradicional (sin Stripe)
    window.showToast('Simulando procesamiento de pago...', 'success');
    
    // Si tienen webhook general de órdenes, lo disparamos en background
    if (AppState.integrations && AppState.integrations.n8nOrdersUrl) {
      const payload = {
        paymentMethod: "Simulated Order",
        amount: totalAmount,
        currency: "DOP",
        items: AppState.cart,
        timestamp: new Date().toISOString()
      };
      
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('out', `Disparando Orden a n8n Ventas Webhook: ${AppState.integrations.n8nOrdersUrl}`, JSON.stringify(payload, null, 2));
      }
      
      const payloadStr = JSON.stringify(payload);
      const headers = { 'Content-Type': 'application/json' };
      
      // Realizar firma HMAC
      const fireSimulatedFetch = async () => {
        if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
          try {
            const sig = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
            headers['X-Telo-Signature'] = sig;
            if (window.logToDiagnosticConsole) {
              window.logToDiagnosticConsole('info', `Firma HMAC Generada: ${sig.slice(0, 15)}... (cabecera X-Telo-Signature)`);
            }
          } catch(e) {}
        }
        
        fetch(AppState.integrations.n8nOrdersUrl, {
          method: 'POST',
          headers: headers,
          body: payloadStr
        })
        .then(async (response) => {
          const respText = await response.text();
          if (response.ok) {
            window.addDbSalesRecord("Cliente TeloSales", productsText, totalAmount, "Simulación Webhook", `Sincronizado (${response.status})`);
            if (window.logToDiagnosticConsole) {
              window.logToDiagnosticConsole('success', `Orden sincronizada en n8n/Odoo (HTTP ${response.status})`, respText);
            }
          } else {
            window.addDbSalesRecord("Cliente TeloSales", productsText, totalAmount, "Simulación Webhook", `Fallo (${response.status})`);
            if (window.logToDiagnosticConsole) {
              window.logToDiagnosticConsole('error', `n8n rechazó la orden (HTTP ${response.status})`, respText);
            }
          }
        })
        .catch(error => {
          console.error(error);
          window.addDbSalesRecord("Cliente TeloSales", productsText, totalAmount, "Simulación Webhook", 'Error Red');
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('error', `Fallo al enviar orden en background: ${error.message}`);
          }
        });
      };
      
      fireSimulatedFetch();
    } else {
      window.addDbSalesRecord("Cliente TeloSales", productsText, totalAmount, "Simulación Local", 'Local');
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('warn', 'Orden simulada localmente (Webhook de Ventas no configurado)');
      }
    }
    
    setTimeout(() => {
      AppState.cart = [];
      AppState.saveState();
      updateCartUI();
      window.toggleCart();
      window.showToast('¡Compra simulada con éxito!', 'success');
      const activeFilter = document.querySelector('.filter-chip.active')?.getAttribute('data-cat') || 'all';
      renderProducts(activeFilter);
    }, 1500);
  }
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

  // Load classroom notes
  const notesTextarea = document.getElementById('classroom-notes-textarea');
  if (notesTextarea) {
    if (!AppState.classNotes) AppState.classNotes = {};
    notesTextarea.value = AppState.classNotes[activeLectureId] || '';
  }
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
  let stateLabel = 'Clase Completada';
  if(isCompleted) {
    AppState.completedClasses = AppState.completedClasses.filter(id => id !== activeLectureId);
    window.showToast('Clase marcada como pendiente', 'error');
    stateLabel = 'Clase Pendiente';
  } else {
    AppState.completedClasses.push(activeLectureId);
    window.showToast('¡Clase completada! Sigue así.', 'success');
  }
  AppState.saveState();
  
  // Log note taking in database console
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  let classTitle = activeLectureId;
  if (course) {
    course.modules.forEach(m => {
      const cls = m.classes.find(c => c.id === activeLectureId);
      if (cls) classTitle = `${course.title} - ${cls.title}`;
    });
  }
  window.addDbEducaRecord(course ? course.title : "Curso", "Estudiante TeloEduca", classTitle, stateLabel);

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

window.saveCurrentClassNotes = function() {
  const notesTextarea = document.getElementById('classroom-notes-textarea');
  if (!notesTextarea) return;
  
  if (!AppState.classNotes) AppState.classNotes = {};
  AppState.classNotes[activeLectureId] = notesTextarea.value;
  AppState.saveState();
  
  // Log note taking in database console
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  let classTitle = activeLectureId;
  if (course) {
    course.modules.forEach(m => {
      const cls = m.classes.find(c => c.id === activeLectureId);
      if (cls) classTitle = `${course.title} - ${cls.title}`;
    });
  }
  window.addDbEducaRecord(course ? course.title : "Curso", "Estudiante TeloEduca", classTitle, "Apunte Guardado");
};

window.downloadClassNotes = function() {
  const notesTextarea = document.getElementById('classroom-notes-textarea');
  if (!notesTextarea) return;
  const content = notesTextarea.value;
  
  if (!content.trim()) {
    window.showToast("No hay apuntes escritos para descargar", "error");
    return;
  }
  
  const course = coursesDatabase.find(c => c.id === activeCourseId);
  let activeLecture = null;
  if (course) {
    course.modules.forEach(m => {
      const found = m.classes.find(c => c.id === activeLectureId);
      if (found) activeLecture = found;
    });
  }
  
  const lectureTitle = activeLecture ? activeLecture.title : activeLectureId;
  const courseTitle = course ? course.title : "TeloEduca";
  const filename = `${courseTitle.replace(/\s+/g, '_')}_${lectureTitle.replace(/\s+/g, '_')}_apuntes.txt`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  window.showToast("Notas descargadas con éxito", "success");
};

window.toggleCinemaMode = function() {
  document.body.classList.toggle('cinema-mode-active');
  const isActive = document.body.classList.contains('cinema-mode-active');
  window.showToast(isActive ? "Modo Cine Activado (Presiona Esc o el botón para salir)" : "Modo Cine Desactivado", "success");
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.body.classList.contains('cinema-mode-active')) {
    window.toggleCinemaMode();
  }
});

// ==========================================
// TELOEDUCA: CERTIFICADO DE FINALIZACIÓN
// ==========================================
const courseQuizzes = {
  'te-01': [
    {
      q: '1. ¿Con qué símbolo inician todas las fórmulas en Excel?',
      options: ['A) +', 'B) =', 'C) *'],
      correct: 1
    },
    {
      q: '2. ¿Qué función de Excel es más moderna y flexible que BUSCARV?',
      options: ['A) BUSCARX', 'B) BUSCARH', 'C) COINCIDIR'],
      correct: 0
    },
    {
      q: '3. ¿Cómo se abre el editor de Visual Basic para Aplicaciones (VBA) en Excel?',
      options: ['A) Ctrl + F8', 'B) Alt + F11', 'C) Shift + Enter'],
      correct: 1
    }
  ],
  'te-02': [
    {
      q: '1. Which greeting is most appropriate and professional when answering an inbound customer service call?',
      options: [
        'A) "Hey! What\'s up?"',
        'B) "Thank you for calling customer care, my name is John. How may I help you today?"',
        'C) "Hello, what do you want?"'
      ],
      correct: 1
    },
    {
      q: '2. What does "de-escalation" mean in customer support?',
      options: [
        'A) Hanging up on an angry customer.',
        'B) Using empathy and active listening to reduce a customer\'s anger.',
        'C) Transferring the call to a different department.'
      ],
      correct: 1
    },
    {
      q: '3. If a customer is complaining about a delayed shipment, what is the best empathetic response?',
      options: [
        'A) "I completely understand your frustration, let me check the status right away."',
        'B) "It is not our fault, it is the courier\'s fault."',
        'C) "Please wait until tomorrow."'
      ],
      correct: 0
    }
  ],
  'te-03': [
    {
      q: '1. ¿Qué significa "Few-shot prompting"?',
      options: [
        'A) Proporcionar algunos ejemplos en el prompt para guiar la respuesta del modelo.',
        'B) No darle ningún ejemplo al modelo.',
        'C) Darle instrucciones de una sola línea.'
      ],
      correct: 0
    },
    {
      q: '2. En ingeniería de prompts, ¿qué técnica le pide al modelo "pensar paso a paso"?',
      options: ['A) Role Prompting', 'B) Chain-of-Thought', 'C) Meta-prompting'],
      correct: 1
    },
    {
      q: '3. ¿Qué es la "alucinación" en un modelo de lenguaje (LLM)?',
      options: [
        'A) Cuando el modelo responde muy rápido.',
        'B) Cuando el modelo genera información falsa de manera convincente.',
        'C) Cuando el modelo se apaga.'
      ],
      correct: 1
    }
  ]
};

window.openQuizModal = function() {
  const container = document.getElementById('quiz-questions-container');
  if (!container) return;
  
  const quiz = courseQuizzes[activeCourseId];
  if (!quiz) return;
  
  container.innerHTML = '';
  quiz.forEach((qObj, qIdx) => {
    let optionsHtml = '';
    qObj.options.forEach((opt, oIdx) => {
      optionsHtml += `
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; padding: 6px 10px; border-radius: 4px; transition: background 0.2s; background: rgba(255,255,255,0.02); margin-top: 4px; border: 1px solid var(--border-color);" class="quiz-option-label">
          <input type="radio" name="quiz-q-${qIdx}" value="${oIdx}" style="accent-color: var(--color-educa); cursor: pointer;">
          <span>${opt}</span>
        </label>
      `;
    });
    
    container.innerHTML += `
      <div class="quiz-question-block" id="quiz-qblock-${qIdx}" style="padding: 10px; border-radius: 6px; border-left: 3px solid transparent; transition: all 0.2s;">
        <h4 style="margin: 0 0 8px 0; font-size: 0.9rem; font-weight: 600; line-height: 1.4;">${qObj.q}</h4>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${optionsHtml}
        </div>
      </div>
    `;
  });
  
  document.getElementById('quiz-modal-overlay').classList.add('active');
  document.getElementById('quiz-modal').classList.add('active');
};

window.closeQuizModal = function() {
  document.getElementById('quiz-modal-overlay').classList.remove('active');
  document.getElementById('quiz-modal').classList.remove('active');
};

window.submitCourseQuiz = function() {
  const quiz = courseQuizzes[activeCourseId];
  if (!quiz) return;
  
  let allCorrect = true;
  let score = 0;
  
  quiz.forEach((qObj, qIdx) => {
    const selected = document.querySelector(`input[name="quiz-q-${qIdx}"]:checked`);
    const block = document.getElementById(`quiz-qblock-${qIdx}`);
    if (block) {
      block.style.borderLeftColor = 'transparent';
      block.style.background = '';
    }
    
    if (selected && parseInt(selected.value) === qObj.correct) {
      score++;
      if (block) {
        block.style.borderLeftColor = 'var(--color-success)';
        block.style.background = 'rgba(16, 185, 129, 0.04)';
      }
    } else {
      allCorrect = false;
      if (block) {
        block.style.borderLeftColor = '#ef4444';
        block.style.background = 'rgba(239, 68, 68, 0.04)';
      }
    }
  });
  
  if (score === quiz.length) {
    window.showToast("¡Felicidades! Has aprobado el examen con 100% de aciertos.", "success");
    if (!AppState.passedQuizzes) AppState.passedQuizzes = [];
    if (!AppState.passedQuizzes.includes(activeCourseId)) {
      AppState.passedQuizzes.push(activeCourseId);
      AppState.saveState();
    }
    window.closeQuizModal();
    openCertificateModalDirectly();
  } else {
    window.showToast(`Calificación: ${score}/${quiz.length} correctas. Por favor revisa tus respuestas y vuelve a intentar.`, "error");
  }
};

function openCertificateModalDirectly() {
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
}

window.showCertificate = function() {
  if (AppState.passedQuizzes && AppState.passedQuizzes.includes(activeCourseId)) {
    openCertificateModalDirectly();
  } else {
    window.openQuizModal();
  }
};

window.closeCertificateModal = function() {
  document.getElementById('certificate-modal-overlay').classList.remove('active');
  document.getElementById('certificate-modal').classList.remove('active');
};

window.printCertificate = function() {
  window.print();
};

// ==========================================
// TELOLLEVA: SISTEMA DE NEGOCIACIÓN DE TARIFAS Y RUTA SVG
// ==========================================
let llevaBiddingTimer = null;
let llevaActiveDriver = null;
let currentLlevaVehicle = 'moto';

window.selectLlevaVehicle = function(type) {
  currentLlevaVehicle = type;
  
  // Actualizar UI
  document.querySelectorAll('.vehicle-option').forEach(opt => {
    opt.classList.remove('active');
    opt.style.borderColor = 'var(--border-color)';
    opt.style.background = 'var(--bg-card)';
    const strong = opt.querySelector('strong');
    if (strong) strong.style.color = '';
  });
  
  const selectedOpt = document.querySelector(`.vehicle-option[data-type="${type}"]`);
  if (selectedOpt) {
    selectedOpt.classList.add('active');
    selectedOpt.style.borderColor = 'var(--color-lleva)';
    selectedOpt.style.background = 'rgba(245,158,11,0.08)';
    const strong = selectedOpt.querySelector('strong');
    if (strong) strong.style.color = 'var(--color-lleva)';
  }
  
  window.updateLlevaPrice();
};

// Backwards compat alias
window.selectIndriveVehicle = window.selectLlevaVehicle;

window.updateLlevaPrice = function() {
  const origen = document.getElementById('lleva-origen') ? document.getElementById('lleva-origen').value : '';
  const destino = document.getElementById('lleva-destino') ? document.getElementById('lleva-destino').value : '';
  
  let basePrice = 250;
  
  // Tarifas por ruta
  if (origen.startsWith('SD-') && destino.startsWith('Santiago-')) {
    basePrice = 2200;
  } else if (origen.startsWith('SD-') && destino.startsWith('LaVega-')) {
    basePrice = 1800;
  } else if (origen.startsWith('SD-') && destino.startsWith('PuntaCana-')) {
    basePrice = 4500;
  } else if (origen.startsWith('SD-') && destino.startsWith('PuertoPlata-')) {
    basePrice = 3800;
  } else if (origen.startsWith('SD-') && destino.startsWith('Moca-')) {
    basePrice = 2000;
  } else if (origen.startsWith('Santiago-') && destino.startsWith('LaVega-')) {
    basePrice = 800;
  } else if (origen === destino) {
    basePrice = 200;
  } else if (origen.startsWith('SD-') && destino.startsWith('SD-')) {
    basePrice = 400; // dentro de SD
  } else {
    basePrice = 1500;
  }
  
  // Simulación de tráfico (hora pico = +20%)
  const hour = new Date().getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
  const trafficMultiplier = isRushHour ? 1.2 : 1.0;
  const trafficLabel = isRushHour ? '🔴 Hora pico' : '🟢 Normal';
  const trafficEl = document.getElementById('lleva-traffic-status');
  if (trafficEl) trafficEl.innerText = trafficLabel;
  
  // Aplicar multiplicadores según vehículo
  let vehicleMultiplier = 1.0;
  if (currentLlevaVehicle === 'car') {
    vehicleMultiplier = 1.5;
  } else if (currentLlevaVehicle === 'cargo') {
    vehicleMultiplier = 2.5;
  }
  
  const finalPrice = Math.round((basePrice * trafficMultiplier * vehicleMultiplier) / 10) * 10;
  
  const suggestEl = document.getElementById('lleva-suggested-label');
  const fareEl = document.getElementById('lleva-user-fare');
  if (suggestEl) suggestEl.innerText = `RD$ ${finalPrice}`;
  if (fareEl) fareEl.value = finalPrice;
};

// Backwards compat alias
window.updateIndrivePrice = window.updateLlevaPrice;

window.adjustLlevaOffer = function(delta) {
  const input = document.getElementById('lleva-user-fare');
  if (!input) return;
  let val = parseInt(input.value) || 200;
  val += delta;
  if(val < 100) val = 100;
  input.value = val;
};

// Backwards compat alias
window.adjustIndriveOffer = window.adjustLlevaOffer;

window.startLlevaNegotiation = function() {
  const userFare = parseInt(document.getElementById('lleva-user-fare').value) || 200;
  const origin = document.getElementById('lleva-origen').value;
  const destination = document.getElementById('lleva-destino').value;
  
  document.getElementById('lleva-request-card').style.display = 'none';
  const offersCard = document.getElementById('lleva-offers-card');
  offersCard.style.display = 'block';
  offersCard.innerHTML = `<h3 style="margin-bottom: 10px;">Ofertas de Mensajeros</h3><p class="searching-pulse" style="color: var(--color-lleva); font-style: italic; text-align: center;">🔍 Buscando mensajeros disponibles...</p>`;
  
  // Set up SVG Map status
  const mapOverlay = document.getElementById('map-status-overlay');
  if (mapOverlay) mapOverlay.innerText = `Buscando mensajeros para: ${origin} ➡️ ${destination}`;
  
  // Reset active icons
  ['pin-origen', 'pin-destino', 'messenger-car'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('opacity', '0');
  });
  const routePath = document.getElementById('map-route-path');
  if (routePath) routePath.setAttribute('d', '');

  // Simulate counter offers in 2 seconds
  llevaBiddingTimer = setTimeout(() => {
    let drivers = [];
    if (currentLlevaVehicle === 'moto') {
      drivers = [
        { name: 'Yohan Cabrera', avatar: '🏍️', rating: '4.9 ★', vehicle: 'Motor Honda CGL (SD Express)', price: userFare, distance: '3 mins' },
        { name: 'José Luis Medina', avatar: '⚡', rating: '5.0 ★', vehicle: 'Super-Motor Eléctrico (Súper Rápido)', price: Math.round(userFare * 1.05 / 10) * 10, distance: '2 mins' },
        { name: 'Carlos Abreu', avatar: '🛥️', rating: '4.7 ★', vehicle: 'Scooter Delivery (Económico)', price: Math.round(userFare * 0.95 / 10) * 10, distance: '5 mins' }
      ];
    } else if (currentLlevaVehicle === 'car') {
      drivers = [
        { name: 'Manuel Ortiz', avatar: '🚗', rating: '4.8 ★', vehicle: 'Kia Picanto (Aire acondicionado)', price: userFare, distance: '5 mins' },
        { name: 'Ricardo Gómez', avatar: '🚘', rating: '4.9 ★', vehicle: 'Toyota Corolla (Confort Premium)', price: Math.round(userFare * 1.15 / 10) * 10, distance: '7 mins' },
        { name: 'Ana Peralta', avatar: '🚕', rating: '4.6 ★', vehicle: 'Hyundai Sonata (Conductora Gold)', price: Math.round(userFare * 0.95 / 10) * 10, distance: '6 mins' }
      ];
    } else { // cargo/furgón
      drivers = [
        { name: 'Ramón Valdez', avatar: '🚚', rating: '4.9 ★', vehicle: 'Furgoneta Hyundai Porter (1.5 Ton)', price: userFare, distance: '10 mins' },
        { name: 'Julio Batista', avatar: '🚛', rating: '5.0 ★', vehicle: 'Camioneta Daihatsu Hijet (Carga Abierta)', price: Math.round(userFare * 0.9 / 10) * 10, distance: '12 mins' },
        { name: 'Héctor Rosario', avatar: '📦', rating: '4.8 ★', vehicle: 'Van de Carga Cerrada (Protección de Lluvia)', price: Math.round(userFare * 1.1 / 10) * 10, distance: '8 mins' }
      ];
    }
    
    const offersList = document.createElement('div');
    offersList.className = 'offers-list';
    offersList.id = 'lleva-offers-list';
    
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
            <button class="btn btn-primary btn-sm" onclick="window.acceptLlevaOffer('${d.name}', '${d.avatar}', ${d.price}, '${d.vehicle}')">Aceptar</button>
          </div>
        </div>
      `;
    });
    
    offersCard.innerHTML = `<h3 style="margin-bottom: 10px;">Ofertas de Mensajeros</h3>`;
    offersCard.appendChild(offersList);
  }, 2000);
};

// Backwards compat alias
window.startIndriveNegotiation = window.startLlevaNegotiation;

window.acceptLlevaOffer = function(name, avatar, price, vehicle) {
  document.getElementById('lleva-offers-card').style.display = 'none';
  document.getElementById('lleva-status-card').style.display = 'block';
  
  llevaActiveDriver = { name, avatar, price, vehicle };
  
  // Inject mini profile
  document.getElementById('lleva-assigned-driver-info').innerHTML = `
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
  const chatMsgs = document.getElementById('lleva-chat-messages');
  if (chatMsgs) chatMsgs.innerHTML = '';
  
  // Welcome message from driver
  setTimeout(() => {
    appendLlevaChatMessage(name, `¡Hola! Voy de camino a recoger el envío en el punto acordado.`, 'driver');
  }, 1000);
};

// Backwards compat alias
window.acceptIndriveOffer = window.acceptLlevaOffer;

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
  
  if(mapOverlay) mapOverlay.innerText = `🛥️ Conductor ${llevaActiveDriver ? llevaActiveDriver.name : ''} en camino al origen.`;
  const tripStatus = document.getElementById('lleva-trip-status');
  if(tripStatus) {
    tripStatus.innerText = 'En camino';
    tripStatus.style.background = 'rgba(245, 158, 11, 0.1)';
    tripStatus.style.color = 'var(--color-lleva)';
  }
  
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
      if(mapOverlay) mapOverlay.innerText = `🛥️ Conductor ${llevaActiveDriver ? llevaActiveDriver.name : ''} retirando el envío...`;
    } else if (percent < 0.95) {
      if(tripStatus) tripStatus.innerText = 'En ruta';
      if(mapOverlay) mapOverlay.innerText = `🚚 En tránsito al destino.`;
    } else {
      if(tripStatus) {
        tripStatus.innerText = 'Entregado';
        tripStatus.style.background = 'rgba(16, 185, 129, 0.1)';
        tripStatus.style.color = '#10b981';
      }
      if(mapOverlay) mapOverlay.innerText = `✅ ¡Envío entregado con éxito por ${llevaActiveDriver ? llevaActiveDriver.name : 'el mensajero'}!`;
      if(llevaActiveDriver) appendLlevaChatMessage(llevaActiveDriver.name, `He entregado las mercancías con éxito. ¡Muchas gracias por confiar en TeloLleva!`, 'driver');
      window.showToast('Envío entregado con éxito', 'success');
    }
    
    if (progress < duration && llevaActiveDriver) {
      window.requestAnimationFrame(step);
    }
  }
  
  window.requestAnimationFrame(step);
}

window.sendLlevaChatMessage = function(event) {
  if (event.key === 'Enter') {
    window.triggerSendLlevaChatMessage();
  }
};

// Backwards compat alias
window.sendIndriveChatMessage = window.sendLlevaChatMessage;

window.triggerSendLlevaChatMessage = function() {
  const input = document.getElementById('lleva-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if(!text) return;
  
  appendLlevaChatMessage('Tú', text, 'user');
  input.value = '';
  
  if(llevaActiveDriver) {
    setTimeout(() => {
      const answers = [
        "¡Excelente, copiado!",
        "Entendido. Estoy en camino sin retraso.",
        "Perfecto, ya estoy llegando al punto.",
        "¡Recibido! Le aviso inmediatamente al entregar.",
        "Sin problemas, voy con cuidado."
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      appendLlevaChatMessage(llevaActiveDriver.name, randomAnswer, 'driver');
    }, 1500);
  }
};

// Backwards compat alias
window.triggerSendChatMessage = window.triggerSendLlevaChatMessage;

window.sendQuickChatMessage = function(text) {
  if(!text) return;
  
  appendLlevaChatMessage('Tú', text, 'user');
  
  if(llevaActiveDriver) {
    setTimeout(() => {
      const answers = [
        "¡Excelente, copiado!",
        "Entendido. Estoy en camino sin retraso.",
        "Perfecto, ya estoy llegando al punto.",
        "¡Recibido! Le aviso inmediatamente al entregar.",
        "Sin problemas, voy con cuidado."
      ];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      appendLlevaChatMessage(llevaActiveDriver.name, randomAnswer, 'driver');
    }, 1200);
  }
};

function appendLlevaChatMessage(sender, text, type) {
  const chatMsgs = document.getElementById('lleva-chat-messages');
  if(!chatMsgs) return;
  
  chatMsgs.innerHTML += `
    <div class="chat-msg ${type}">
      <strong>${sender}:</strong> ${text}
    </div>
  `;
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

// Backwards compat alias
function appendIndriveChatMessage(sender, text, type) {
  appendLlevaChatMessage(sender, text, type);
}

window.cancelLlevaTrip = function() {
  clearTimeout(llevaBiddingTimer);
  llevaActiveDriver = null;
  
  ['lleva-status-card', 'lleva-offers-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const reqCard = document.getElementById('lleva-request-card');
  if (reqCard) reqCard.style.display = 'block';
  
  ['pin-origen', 'pin-destino', 'messenger-car'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('opacity', '0');
  });
  const routePath = document.getElementById('map-route-path');
  if (routePath) routePath.setAttribute('d', '');
  
  const mapOverlay = document.getElementById('map-status-overlay');
  if (mapOverlay) mapOverlay.innerText = 'Mapa fuera de línea - Ingrese ruta';
  window.showToast('Envío cancelado', 'error');
};

// Backwards compat alias
window.cancelIndriveTrip = window.cancelLlevaTrip;

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
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const dataObj = {};
    formData.forEach((value, key) => {
      if(key !== 'access_key' && key !== 'botcheck') {
        dataObj[key] = value;
      }
    });
    dataObj.timestamp = new Date().toISOString();
    
    const btn = document.getElementById('form-submit-btn');
    const oldText = btn.innerText;
    
    btn.innerText = 'Enviando...';
    btn.disabled = true;
    
    // Si tenemos configurado el Webhook de Leads en n8n
    if (AppState.integrations && AppState.integrations.n8nLeadsUrl) {
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('out', `Enviando Lead a n8n CRM Webhook: ${AppState.integrations.n8nLeadsUrl}`, JSON.stringify(dataObj, null, 2));
      }
      
      const payloadStr = JSON.stringify(dataObj);
      const headers = { 'Content-Type': 'application/json' };
      
      if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
        try {
          const sig = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
          headers['X-Telo-Signature'] = sig;
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('info', `Firma HMAC Generada: ${sig.slice(0, 15)}... (cabecera X-Telo-Signature)`);
          }
        } catch (e) {
          console.error("Error signing HMAC:", e);
        }
      }
      
      fetch(AppState.integrations.n8nLeadsUrl, {
        method: 'POST',
        headers: headers,
        body: payloadStr
      })
      .then(async (response) => {
        const respText = await response.text();
        const statusStr = `Sincronizado (${response.status})`;
        if (response.ok) {
          window.showToast('Mensaje enviado exitosamente vía n8n webhook.', 'success');
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('success', `Lead recibido por n8n (HTTP ${response.status})`, respText);
          }
          window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, statusStr);
          form.reset();
        } else {
          window.showToast(`Error al enviar el lead (HTTP ${response.status})`, 'error');
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('error', `n8n rechazó el lead (HTTP ${response.status})`, respText);
          }
          window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, `Fallo (${response.status})`);
        }
      })
      .catch(error => {
        console.error(error);
        window.showToast('Error de conexión con n8n.', 'error');
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('error', `Fallo de conexión al enviar lead: ${error.message}`);
        }
        window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, 'Error Red');
      })
      .finally(() => {
        btn.innerText = oldText;
        btn.disabled = false;
      });
    } else {
      // Fallback a Web3Forms
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('warn', 'Disparando lead a Web3Forms (Webhook n8n no configurado)');
      }
      
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(async (response) => {
        if (response.status === 200) {
          window.showToast('Mensaje enviado exitosamente a la central.', 'success');
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('success', 'Web3Forms recibió el lead con éxito (HTTP 200)');
          }
          window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, 'Web3Forms');
          form.reset();
        } else {
          const data = await response.json();
          if(data.message && data.message.includes('Invalid Access Key')) {
              window.showToast('Modo de Prueba: Simulación de envío exitosa. (Cambia el Access Key para envío real)', 'success');
              if (window.logToDiagnosticConsole) {
                window.logToDiagnosticConsole('warn', 'Simulación de Web3Forms completada (Access Key de prueba)');
              }
              window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, 'Web3Forms (Simul.)');
              form.reset();
          } else {
              window.showToast('Error al enviar el formulario.', 'error');
              if (window.logToDiagnosticConsole) {
                window.logToDiagnosticConsole('error', 'Web3Forms devolvió un error', JSON.stringify(data));
              }
              window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, 'Fallo Web3Forms');
          }
        }
      })
      .catch(error => {
        console.error(error);
        window.showToast('Error de conexión.', 'error');
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('error', `Fallo de red al conectar con Web3Forms: ${error.message}`);
        }
        window.addDbLeadsRecord(dataObj.name, dataObj.email, dataObj.department, dataObj.message, 'Error Red');
      })
      .finally(() => {
        btn.innerText = oldText;
        btn.disabled = false;
      });
    }
  });
}

// ==========================================
// TELOREPARA: COTIZACIONES & DIAGNÓSTICO EN VIVO
// ==========================================
window.selectHardwareFault = function(part) {
  const deviceSelect = document.getElementById('repara-device');
  const issueSelect = document.getElementById('repara-issue');
  if (!deviceSelect || !issueSelect) return;
  
  // Force device to phone since we clicked a smartphone schema
  deviceSelect.value = 'phone';
  
  let issueValue = 'screen';
  if (part === 'screen') issueValue = 'screen';
  else if (part === 'battery') issueValue = 'battery';
  else if (part === 'system') issueValue = 'system';
  else if (part === 'port') issueValue = 'battery'; // Port mapped to battery/charging issues
  
  issueSelect.value = issueValue;
  window.updateReparaQuote();
  window.showToast(`Falla seleccionada en cotizador: ${issueSelect.options[issueSelect.selectedIndex].text}`, "success");
  
  // Highlight chosen part on SVG
  document.querySelectorAll('#svg-part-screen, #svg-part-battery, #svg-part-system, #svg-part-port').forEach(el => {
    el.style.filter = '';
  });
  
  let targetEl;
  if (part === 'screen') targetEl = document.getElementById('svg-part-screen');
  else if (part === 'battery') targetEl = document.getElementById('svg-part-battery');
  else if (part === 'system') targetEl = document.getElementById('svg-part-system');
  else if (part === 'port') targetEl = document.getElementById('svg-part-port');
  
  if (targetEl) {
    targetEl.style.filter = 'drop-shadow(0 0 8px var(--color-repara))';
  }
  
  // Animate glass crack visibility if screen selected
  const crack = document.getElementById('svg-screen-crack');
  if (crack) {
    crack.style.opacity = (part === 'screen') ? '0.7' : '0';
  }
};

window.showHardwareLabel = function(text) {
  const label = document.getElementById('svg-hover-label');
  if (label) {
    label.innerText = text;
    label.style.color = 'var(--color-repara)';
  }
};

window.clearHardwareLabel = function() {
  const label = document.getElementById('svg-hover-label');
  if (label) {
    label.innerText = 'Pasa el cursor sobre el teléfono...';
    label.style.color = 'var(--text-muted)';
  }
};

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
  
  const priceVal = document.getElementById('repara-quote-price').innerText;
  const timeVal = document.getElementById('repara-quote-time').innerText;
  
  document.getElementById('rep-date-1').innerText = "Hoy • " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  document.getElementById('repara-tech-log').innerText = `Solicitud de diagnóstico recibida para: ${deviceText} (Falla: ${issueText}). Buscando mensajero para retiro del equipo en ${address}.`;
  
  window.showToast("Servicio agendado con éxito", "success");
  
  // Sincronizar reserva de servicio vía n8n webhook
  if (AppState.integrations && AppState.integrations.n8nServicesUrl) {
    const payload = {
      serviceType: "TeloRepara",
      device: deviceText,
      issue: issueText,
      address: address,
      estimatedPrice: priceVal,
      estimatedTime: timeVal,
      timestamp: new Date().toISOString()
    };
    
    if (window.logToDiagnosticConsole) {
      window.logToDiagnosticConsole('out', `Enviando Reserva TeloRepara a n8n: ${AppState.integrations.n8nServicesUrl}`, JSON.stringify(payload, null, 2));
    }
    
    const payloadStr = JSON.stringify(payload);
    const headers = { 'Content-Type': 'application/json' };
    
    const fireReparaFetch = async () => {
      if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
        try {
          const sig = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
          headers['X-Telo-Signature'] = sig;
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('info', `Firma HMAC Generada: ${sig.slice(0, 15)}... (cabecera X-Telo-Signature)`);
          }
        } catch(e) {}
      }
      
      fetch(AppState.integrations.n8nServicesUrl, {
        method: 'POST',
        headers: headers,
        body: payloadStr
      })
      .then(async (response) => {
        const respText = await response.text();
        const statusStr = `Sincronizado (${response.status})`;
        if (response.ok) {
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('success', `Reserva recibida por n8n (HTTP ${response.status})`, respText);
          }
          window.addDbBookingsRecord("TeloRepara", "Cliente TeloRepara", new Date().toLocaleDateString(), timeVal, `Falla: ${issueText} | Disp: ${deviceText}`, statusStr);
        } else {
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('error', `n8n rechazó la reserva (HTTP ${response.status})`, respText);
          }
          window.addDbBookingsRecord("TeloRepara", "Cliente TeloRepara", new Date().toLocaleDateString(), timeVal, `Falla: ${issueText} | Disp: ${deviceText}`, `Fallo (${response.status})`);
        }
      })
      .catch(error => {
        console.error(error);
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('error', `Fallo de red al enviar reserva a n8n: ${error.message}`);
        }
        window.addDbBookingsRecord("TeloRepara", "Cliente TeloRepara", new Date().toLocaleDateString(), timeVal, `Falla: ${issueText} | Disp: ${deviceText}`, 'Error Red');
      });
    };
    
    fireReparaFetch();
  } else {
    window.addDbBookingsRecord("TeloRepara", "Cliente TeloRepara", new Date().toLocaleDateString(), timeVal, `Falla: ${issueText} | Disp: ${deviceText}`, 'Local');
  }
  
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

let selectedInstalaTech = 'ramon';

window.selectInstalaTech = function(techId) {
  selectedInstalaTech = techId;
  
  // Actualizar UI
  document.querySelectorAll('.tech-option').forEach(opt => {
    opt.classList.remove('active');
    opt.style.borderColor = 'var(--border-color)';
    opt.style.background = 'var(--bg-card)';
    const strong = opt.querySelector('strong');
    if (strong) strong.style.color = '';
  });
  
  const selectedOpt = document.querySelector(`.tech-option[data-tech="${techId}"]`);
  if (selectedOpt) {
    selectedOpt.classList.add('active');
    selectedOpt.style.borderColor = 'var(--color-instala)';
    selectedOpt.style.background = 'rgba(236,72,153,0.08)';
    const strong = selectedOpt.querySelector('strong');
    if (strong) strong.style.color = 'var(--color-instala)';
  }
  
  const techNames = {
    'ramon': 'Ramón Abreu',
    'carlos': 'Carlos Medina',
    'laura': 'Laura Rijo'
  };
  window.showToast(`Técnico seleccionado: ${techNames[techId]}`, "success");
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
  
  const techDetails = {
    'ramon': { name: 'Ramón Abreu', avatar: '👷‍♂️', desc: 'Instalador Senior • TV & AC', rating: '★★★★★ 4.9' },
    'carlos': { name: 'Carlos Medina', avatar: '👨‍🔧', desc: 'Especialista • Redes & Domótica', rating: '★★★★☆ 4.7' },
    'laura': { name: 'Laura Rijo', avatar: '👩‍🔧', desc: 'Técnica • Cerraduras & Smart Home', rating: '★★★★★ 4.8' }
  };
  
  const tech = techDetails[selectedInstalaTech] || techDetails['ramon'];
  
  // Update technician summary elements in index.html
  const summaryAvatar = document.getElementById('instala-summary-tech-avatar');
  const summaryName = document.getElementById('instala-summary-tech-name');
  const summaryDesc = document.getElementById('instala-summary-tech-desc');
  const summaryRating = document.getElementById('instala-summary-tech-rating');
  
  if (summaryAvatar) summaryAvatar.innerText = tech.avatar;
  if (summaryName) summaryName.innerText = tech.name;
  if (summaryDesc) summaryDesc.innerText = tech.desc;
  if (summaryRating) summaryRating.innerText = tech.rating;
  
  const summaryCard = document.getElementById('instala-summary-card');
  summaryCard.style.display = 'block';
  summaryCard.scrollIntoView({ behavior: 'smooth' });
  
  const priceText = document.getElementById('instala-quote-price').innerText;
  
  document.getElementById('instala-booked-service').innerText = serviceText;
  document.getElementById('instala-booked-date').innerText = formattedDate;
  document.getElementById('instala-booked-time').innerText = timeText;
  document.getElementById('instala-booked-price').innerText = priceText;
  
  window.showToast(`¡Cita agendada con ${tech.name} para el ${formattedDate}!`, "success");
  
  // Sincronizar reserva de instalación vía n8n webhook
  if (AppState.integrations && AppState.integrations.n8nServicesUrl) {
    const payload = {
      serviceType: "TeloInstala",
      serviceName: serviceText,
      date: formattedDate,
      timeSlot: timeText,
      price: priceText,
      assignedTechnician: tech.name,
      timestamp: new Date().toISOString()
    };
    
    if (window.logToDiagnosticConsole) {
      window.logToDiagnosticConsole('out', `Enviando Reserva TeloInstala a n8n: ${AppState.integrations.n8nServicesUrl}`, JSON.stringify(payload, null, 2));
    }
    
    const payloadStr = JSON.stringify(payload);
    const headers = { 'Content-Type': 'application/json' };
    
    const fireInstalaFetch = async () => {
      if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
        try {
          const sig = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
          headers['X-Telo-Signature'] = sig;
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('info', `Firma HMAC Generada: ${sig.slice(0, 15)}... (cabecera X-Telo-Signature)`);
          }
        } catch(e) {}
      }
      
      fetch(AppState.integrations.n8nServicesUrl, {
        method: 'POST',
        headers: headers,
        body: payloadStr
      })
      .then(async (response) => {
        const respText = await response.text();
        const statusStr = `Sincronizado (${response.status})`;
        if (response.ok) {
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('success', `Reserva recibida por n8n (HTTP ${response.status})`, respText);
          }
          window.addDbBookingsRecord("TeloInstala", "Cliente TeloInstala", formattedDate, timeText, `Servicio: ${serviceText} | Técnico: ${tech.name}`, statusStr);
        } else {
          if (window.logToDiagnosticConsole) {
            window.logToDiagnosticConsole('error', `n8n rechazó la reserva (HTTP ${response.status})`, respText);
          }
          window.addDbBookingsRecord("TeloInstala", "Cliente TeloInstala", formattedDate, timeText, `Servicio: ${serviceText} | Técnico: ${tech.name}`, `Fallo (${response.status})`);
        }
      })
      .catch(error => {
        console.error(error);
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('error', `Fallo de red al enviar reserva a n8n: ${error.message}`);
        }
        window.addDbBookingsRecord("TeloInstala", "Cliente TeloInstala", formattedDate, timeText, `Servicio: ${serviceText} | Técnico: ${tech.name}`, 'Error Red');
      });
    };
    
    fireInstalaFetch();
  } else {
    window.addDbBookingsRecord("TeloInstala", "Cliente TeloInstala", formattedDate, timeText, `Servicio: ${serviceText} | Técnico: ${tech.name}`, 'Local');
  }
};

// ==========================================
// CONFIGURACIÓN DE CONECTORES Y SERVICIOS
// ==========================================
window.setupIntegrationsUI = function() {
  const urlEl = document.getElementById('int-supabase-url');
  const keyEl = document.getElementById('int-supabase-key');
  const stripeEnabledEl = document.getElementById('int-stripe-enabled');
  const stripeKeyEl = document.getElementById('int-stripe-key');
  const stripeWebhookEl = document.getElementById('int-stripe-webhook');
  const n8nLeadsUrlEl = document.getElementById('int-n8n-leads-url');
  const n8nOrdersUrlEl = document.getElementById('int-n8n-orders-url');
  const n8nServicesUrlEl = document.getElementById('int-n8n-services-url');
  
  // Nuevos campos
  const geminiKeyEl = document.getElementById('int-gemini-key');
  const hmacEnabledEl = document.getElementById('int-hmac-enabled');
  const hmacSecretEl = document.getElementById('int-hmac-secret');
  
  if(!urlEl) return; // Si no estamos en la página correcta todavía
  
  // Rellenar valores guardados
  urlEl.value = AppState.integrations.supabaseUrl || '';
  keyEl.value = AppState.integrations.supabaseKey || '';
  stripeEnabledEl.checked = AppState.integrations.stripeEnabled || false;
  stripeKeyEl.value = AppState.integrations.stripeKey || '';
  stripeWebhookEl.value = AppState.integrations.stripeWebhook || '';
  n8nLeadsUrlEl.value = AppState.integrations.n8nLeadsUrl || '';
  n8nOrdersUrlEl.value = AppState.integrations.n8nOrdersUrl || '';
  n8nServicesUrlEl.value = AppState.integrations.n8nServicesUrl || '';
  
  if(geminiKeyEl) geminiKeyEl.value = AppState.integrations.geminiKey || '';
  if(hmacEnabledEl) hmacEnabledEl.checked = AppState.integrations.hmacEnabled || false;
  if(hmacSecretEl) hmacSecretEl.value = AppState.integrations.hmacSecret || '';
  
  // Actualizar visibilidad de form de tarjeta en el carrito
  const ccFormContainer = document.getElementById('stripe-checkout-form-container');
  if(ccFormContainer) {
    ccFormContainer.style.display = AppState.integrations.stripeEnabled ? 'block' : 'none';
  }
  
  // Actualizar estatus visual de Supabase si hay URL cargada
  const statusSupabase = document.getElementById('status-supabase');
  if(statusSupabase) {
    if(AppState.integrations.supabaseUrl && AppState.integrations.supabaseKey) {
      statusSupabase.className = "connection-status-pill connected";
      statusSupabase.innerText = "Configurado";
    } else {
      statusSupabase.className = "connection-status-pill disconnected";
      statusSupabase.innerText = "Desconectado";
    }
  }
  
  // Refrescar consola de datos
  if (window.refreshDatabaseConsole) {
    window.refreshDatabaseConsole();
  }
};

window.saveSupabaseConfig = function() {
  const url = document.getElementById('int-supabase-url').value.trim();
  const key = document.getElementById('int-supabase-key').value.trim();
  
  AppState.integrations.supabaseUrl = url;
  AppState.integrations.supabaseKey = key;
  AppState.saveState();
  
  window.showToast("Conexión Supabase guardada", "success");
  
  const statusSupabase = document.getElementById('status-supabase');
  if (url && key) {
    statusSupabase.className = "connection-status-pill connected";
    statusSupabase.innerText = "Configurado";
    window.testSupabaseConnection(); // Probar automáticamente
  } else {
    statusSupabase.className = "connection-status-pill disconnected";
    statusSupabase.innerText = "Desconectado";
  }
};

window.saveStripeConfig = function() {
  const key = document.getElementById('int-stripe-key').value.trim();
  const webhook = document.getElementById('int-stripe-webhook').value.trim();
  
  AppState.integrations.stripeKey = key;
  AppState.integrations.stripeWebhook = webhook;
  AppState.saveState();
  
  window.showToast("Configuración de Stripe guardada", "success");
  
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('success', "Stripe Config Actualizada", `Publishable Key: ${key ? key.slice(0, 12) + "..." : 'No configurada'}\nWebhook Endpoint: ${webhook || 'No configurado'}`);
  }
};

window.saveN8NConfig = function() {
  const leads = document.getElementById('int-n8n-leads-url').value.trim();
  const orders = document.getElementById('int-n8n-orders-url').value.trim();
  const services = document.getElementById('int-n8n-services-url').value.trim();
  
  AppState.integrations.n8nLeadsUrl = leads;
  AppState.integrations.n8nOrdersUrl = orders;
  AppState.integrations.n8nServicesUrl = services;
  AppState.saveState();
  
  window.showToast("Webhooks de n8n guardados", "success");
  
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('success', "Orquestador n8n Webhooks Actualizados", `Leads CRM URL: ${leads || 'No configurada'}\nVentas/Orders URL: ${orders || 'No configurada'}\nServicios URL: ${services || 'No configurada'}`);
  }
};

window.saveGeminiConfig = function() {
  const key = document.getElementById('int-gemini-key').value.trim();
  AppState.integrations.geminiKey = key;
  AppState.saveState();
  window.showToast("API Key de Gemini guardada", "success");
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('success', "Configuración Gemini Actualizada", `Clave: ${key ? key.slice(0, 10) + "..." : 'No configurada'}`);
  }
};

window.toggleHMACIntegration = function() {
  const hmacEnabledEl = document.getElementById('int-hmac-enabled');
  const isEnabled = hmacEnabledEl.checked;
  AppState.integrations.hmacEnabled = isEnabled;
  AppState.saveState();
  window.showToast(isEnabled ? "Firma de Webhooks HMAC habilitada" : "Firma de Webhooks HMAC deshabilitada", "success");
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('warn', isEnabled ? "Seguridad HMAC activada. Todos los webhooks salientes irán firmados." : "Seguridad HMAC desactivada.");
  }
};

window.saveHMACConfig = function() {
  const secret = document.getElementById('int-hmac-secret').value.trim();
  AppState.integrations.hmacSecret = secret;
  AppState.saveState();
  window.showToast("Clave Secreta HMAC guardada", "success");
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('success', "Configuración HMAC Actualizada", `Secreto: ${secret ? 'Configurado (Oculto)' : 'Vacío'}`);
  }
};

window.toggleStripeIntegration = function() {
  const stripeEnabledEl = document.getElementById('int-stripe-enabled');
  const isEnabled = stripeEnabledEl.checked;
  
  AppState.integrations.stripeEnabled = isEnabled;
  AppState.saveState();
  
  const ccFormContainer = document.getElementById('stripe-checkout-form-container');
  if(ccFormContainer) {
    ccFormContainer.style.display = isEnabled ? 'block' : 'none';
  }
  
  window.showToast(isEnabled ? "Pasarela Stripe habilitada" : "Pasarela Stripe deshabilitada", "success");
  
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('warn', isEnabled ? "Stripe activado para pagos. El checkout requerirá datos de tarjeta." : "Stripe desactivado. El checkout usará simulación local.");
  }
};

// ==========================================
// CONEXIÓN Y DIAGNÓSTICO (DEBUG LOGGER)
// ==========================================
window.testSupabaseConnection = function() {
  const url = AppState.integrations.supabaseUrl;
  const key = AppState.integrations.supabaseKey;
  
  if (!url || !key) {
    window.showToast("Completa la URL y Anon Key primero", "error");
    return;
  }
  
  window.showToast("Probando conexión a Supabase...", "success");
  
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('out', `GET Solicitud de ping a Supabase REST: ${url}/rest/v1/`, `Headers:\n- apikey: ${key.slice(0, 15)}...\n- Authorization: Bearer ${key.slice(0, 15)}...`);
  }
  
  fetch(`${url}/rest/v1/?apikey=${key}`, {
    method: 'GET'
  })
  .then(async (response) => {
    const statusEl = document.getElementById('status-supabase');
    if (response.ok || response.status === 401 || response.status === 200 || response.status === 400) {
      // Supabase responde incluso con 401 si no hay auth pero la URL es correcta
      if(statusEl) {
        statusEl.className = "connection-status-pill connected";
        statusEl.innerText = "Conectado";
      }
      window.showToast("Supabase respondiendo correctamente", "success");
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('success', `Conectado a Supabase (HTTP ${response.status})`, `Respuesta verificada. Endpoint vivo.`);
      }
    } else {
      if(statusEl) {
        statusEl.className = "connection-status-pill disconnected";
        statusEl.innerText = "Fallo";
      }
      window.showToast(`Error al conectar (HTTP ${response.status})`, "error");
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('error', `Supabase devolvió error (HTTP ${response.status})`);
      }
    }
  })
  .catch(error => {
    console.error(error);
    const statusEl = document.getElementById('status-supabase');
    if(statusEl) {
      statusEl.className = "connection-status-pill disconnected";
      statusEl.innerText = "Error Red";
    }
    window.showToast("Error de conexión a la base de datos", "error");
    if (window.logToDiagnosticConsole) {
      window.logToDiagnosticConsole('error', `Fallo de red al conectar con Supabase REST URL: ${error.message}`, "Verifica si la URL es correcta o si existen restricciones de CORS en el bucket.");
    }
  });
};

window.clearDiagnosticConsole = function() {
  const consoleEl = document.getElementById('debug-console-output');
  if(consoleEl) {
    consoleEl.innerHTML = '> Esperando interacción... Configura un webhook y haz clic en probar o realiza una acción en la app para registrar llamadas a la red.';
    window.showToast("Consola de depuración limpia", "success");
  }
};

window.logToDiagnosticConsole = function(type, message, details = '') {
  const consoleEl = document.getElementById('debug-console-output');
  if(!consoleEl) return;
  
  if (consoleEl.innerText.startsWith('> Esperando')) {
    consoleEl.innerHTML = '';
  }
  
  const timestamp = new Date().toLocaleTimeString();
  let typeClass = 'log-out';
  if(type === 'in') typeClass = 'log-in';
  else if(type === 'success') typeClass = 'log-success';
  else if(type === 'error') typeClass = 'log-error';
  else if(type === 'warn') typeClass = 'log-warn';
  
  let html = `<div class="log-entry">
    <span class="log-time" style="color:var(--text-muted); font-size:0.75rem;">[${timestamp}]</span> 
    <span class="${typeClass}"><strong>${type.toUpperCase()}:</strong> ${message}</span>`;
  if(details) {
    html += `<pre style="margin:4px 0 0 0; padding:6px; background:rgba(0,0,0,0.4); border-radius:3px; font-size:0.75rem; color:#cbd5e1; max-height:160px; overflow-y:auto; font-family:monospace;">${details}</pre>`;
  }
  html += `</div>`;
  
  consoleEl.innerHTML += html;
  consoleEl.scrollTop = consoleEl.scrollHeight;
};

// ==========================================
// WEBHOOKS Y SEGURIDAD CON FIRMA HMAC SHA-256
// ==========================================
async function calculateHMAC(secret, message) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    msgData
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendSignedWebhook(url, payload) {
  if (!url) return 'No Configurado';
  
  const payloadStr = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };
  
  if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
    try {
      const signature = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
      headers['X-Telo-Signature'] = signature;
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('info', `Firma HMAC Generada: ${signature.slice(0, 15)}... (cabecera X-Telo-Signature)`);
      }
    } catch (e) {
      console.error("Error signing HMAC:", e);
    }
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: payloadStr
    });
    const respText = await response.text();
    if (response.ok) {
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('success', `Webhook enviado con éxito (HTTP ${response.status})`, respText);
      }
      return `Sincronizado (${response.status})`;
    } else {
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('error', `Rechazado por servidor (HTTP ${response.status})`, respText);
      }
      return `Fallo (${response.status})`;
    }
  } catch (error) {
    if (window.logToDiagnosticConsole) {
      window.logToDiagnosticConsole('error', `Fallo de red al enviar webhook: ${error.message}`);
    }
    return 'Error Red';
  }
}

// Webhook testers
window.testTriggerLeadWebhook = async function() {
  const url = AppState.integrations.n8nLeadsUrl;
  if(!url) {
    window.showToast("Configura y guarda la URL del Webhook de Leads primero", "error");
    return;
  }
  
  const payload = {
    name: "Diana Prince",
    email: "diana@consorcio.org",
    department: "TeloSales",
    message: "Hola, me interesa solicitar una cotización formal de covers personalizados e iguala técnica corporativa para nuestra empresa.",
    timestamp: new Date().toISOString()
  };
  
  window.showToast("Enviando lead de prueba a n8n...", "success");
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('out', `POST Trigger Lead Test: ${url}`, JSON.stringify(payload, null, 2));
  }
  
  const status = await sendSignedWebhook(url, payload);
  window.addDbLeadsRecord(payload.name, payload.email, payload.department, payload.message, status);
  if (status.startsWith('Sincronizado')) {
    window.showToast("Webhook de Leads disparado con éxito", "success");
  } else {
    window.showToast("Webhook de Leads fallido", "error");
  }
};

window.testTriggerOrderWebhook = async function() {
  const url = AppState.integrations.n8nOrdersUrl;
  if(!url) {
    window.showToast("Configura y guarda la URL del Webhook de Ventas primero", "error");
    return;
  }
  
  const payload = {
    paymentMethod: "Stripe Test Card",
    cardholderName: "Bruce Wayne",
    cardNumberMasked: "4242 **** **** 4242",
    amount: 1100.00,
    currency: "DOP",
    items: [
      { id: "ts-cat-100", title: "Cover Silicona N°1", quantity: 1, price: 500 },
      { id: "ts-cat-101", title: "Cover Protector Especial", quantity: 1, price: 600 }
    ],
    timestamp: new Date().toISOString()
  };
  
  window.showToast("Enviando orden de prueba a n8n...", "success");
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('out', `POST Trigger Order Test: ${url}`, JSON.stringify(payload, null, 2));
  }
  
  const status = await sendSignedWebhook(url, payload);
  const itemsText = payload.items.map(item => `${item.title} (x${item.quantity})`).join(', ');
  window.addDbSalesRecord(payload.cardholderName, itemsText, payload.amount, payload.paymentMethod, status);
  if (status.startsWith('Sincronizado')) {
    window.showToast("Webhook de Ventas disparado con éxito", "success");
  } else {
    window.showToast("Webhook de Ventas fallido", "error");
  }
};

window.testTriggerServiceWebhook = async function() {
  const url = AppState.integrations.n8nServicesUrl;
  if(!url) {
    window.showToast("Configura y guarda la URL del Webhook de Servicios primero", "error");
    return;
  }
  
  const payload = {
    serviceType: "TeloRepara",
    device: "Laptop / Computadora",
    issue: "No enciende / Problema de alimentación",
    address: "Wayne Manor, Gotham City",
    estimatedPrice: "RD$ 1,500.00",
    estimatedTime: "24-48 horas",
    timestamp: new Date().toISOString()
  };
  
  window.showToast("Enviando reserva de prueba a n8n...", "success");
  if (window.logToDiagnosticConsole) {
    window.logToDiagnosticConsole('out', `POST Trigger Service Test: ${url}`, JSON.stringify(payload, null, 2));
  }
  
  const status = await sendSignedWebhook(url, payload);
  window.addDbBookingsRecord(payload.serviceType, "Cliente de Prueba", new Date().toLocaleDateString(), "24-48 horas", `Dispositivo: ${payload.device} | Falla: ${payload.issue}`, status);
  if (status.startsWith('Sincronizado')) {
    window.showToast("Webhook de Servicios disparado con éxito", "success");
  } else {
    window.showToast("Webhook de Servicios fallido", "error");
  }
};

// ==========================================
// PUERTA DE ACCESO ADMINISTRATIVO OCULTA (HIDDEN GATE)
// ==========================================
window.initAdminGate = function() {
  const logo = document.getElementById('sidebar-brand-logo');
  if (logo) {
    let dblClickCount = 0;
    logo.addEventListener('dblclick', () => {
      dblClickCount++;
      if (dblClickCount >= 5) {
        showIntegrationsNavItem();
        localStorage.setItem('teloAdminActive', 'true');
        window.showToast("¡Modo Administrador Desbloqueado!", "success");
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('success', "Acceso administrativo desbloqueado mediante 5 dobles clics.");
        }
        dblClickCount = 0; // reset
      }
    });
  }
  
  // Revisar si ya tiene acceso guardado o query string
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminParam = urlParams.get('admin') === 'true';
  const isLocalStorageAdmin = localStorage.getItem('teloAdminActive') === 'true';
  
  if (isAdminParam || isLocalStorageAdmin) {
    showIntegrationsNavItem();
  }
};

function showIntegrationsNavItem() {
  const desktopItem = document.getElementById('nav-integrations-item');
  const mobileItem = document.getElementById('nav-integrations-item-mobile');
  if (desktopItem) desktopItem.style.display = 'flex';
  if (mobileItem) mobileItem.style.display = 'flex';
}

// ==========================================
// CONSOLA DE DATOS INTEGRADOS - LOGS DE BASE DE DATOS
// ==========================================
window.addDbSalesRecord = function(client, products, total, method, status) {
  if (!AppState.dbSales) AppState.dbSales = [];
  const record = {
    id: 'SL-' + Math.floor(1000 + Math.random() * 9000),
    client: client || 'Cliente TeloSales',
    products: products,
    total: 'RD$ ' + Number(total).toLocaleString(),
    method: method || 'Local',
    date: new Date().toLocaleString(),
    status: status || 'Local'
  };
  AppState.dbSales.unshift(record);
  if (AppState.dbSales.length > 50) AppState.dbSales.pop();
  AppState.saveState();
  window.refreshDatabaseConsole();
};

window.addDbBookingsRecord = function(serviceType, client, date, time, details, status) {
  if (!AppState.dbBookings) AppState.dbBookings = [];
  const record = {
    id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
    service: serviceType,
    client: client || 'Cliente TeloCorp',
    date: date,
    time: time,
    details: details,
    timestamp: new Date().toLocaleString(),
    status: status || 'Local'
  };
  AppState.dbBookings.unshift(record);
  if (AppState.dbBookings.length > 50) AppState.dbBookings.pop();
  AppState.saveState();
  window.refreshDatabaseConsole();
};

window.addDbEducaRecord = function(course, student, module, state) {
  if (!AppState.dbEduca) AppState.dbEduca = [];
  const record = {
    id: 'ED-' + Math.floor(1000 + Math.random() * 9000),
    course: course,
    student: student || 'Estudiante TeloEduca',
    module: module,
    state: state,
    date: new Date().toLocaleString()
  };
  AppState.dbEduca.unshift(record);
  if (AppState.dbEduca.length > 50) AppState.dbEduca.pop();
  AppState.saveState();
  window.refreshDatabaseConsole();
};

window.addDbLeadsRecord = function(name, email, department, message, status) {
  if (!AppState.dbLeads) AppState.dbLeads = [];
  const record = {
    id: 'LD-' + Math.floor(1000 + Math.random() * 9000),
    name: name,
    email: email,
    department: department,
    message: message.length > 50 ? message.substring(0, 50) + '...' : message,
    date: new Date().toLocaleString(),
    status: status || 'Local'
  };
  AppState.dbLeads.unshift(record);
  if (AppState.dbLeads.length > 50) AppState.dbLeads.pop();
  AppState.saveState();
  window.refreshDatabaseConsole();
};

window.refreshDatabaseConsole = function() {
  // Sales
  const salesTbody = document.getElementById('db-sales-tbody');
  if (salesTbody) {
    const list = AppState.dbSales || [];
    if (list.length === 0) {
      salesTbody.innerHTML = '<tr><td colspan="7" class="empty-db-row">No hay transacciones registradas.</td></tr>';
    } else {
      salesTbody.innerHTML = list.map(item => `
        <tr>
          <td><strong>${item.id}</strong></td>
          <td>${item.client}</td>
          <td>${item.products}</td>
          <td>${item.total}</td>
          <td>${item.method}</td>
          <td>${item.date}</td>
          <td><span class="connection-status-pill ${item.status.includes('Sincronizado') || item.status === 'Local' ? 'connected' : 'disconnected'}">${item.status}</span></td>
        </tr>
      `).join('');
    }
  }

  // Bookings
  const bookingsTbody = document.getElementById('db-bookings-tbody');
  if (bookingsTbody) {
    const list = AppState.dbBookings || [];
    if (list.length === 0) {
      bookingsTbody.innerHTML = '<tr><td colspan="8" class="empty-db-row">No hay servicios agendados.</td></tr>';
    } else {
      bookingsTbody.innerHTML = list.map(item => `
        <tr>
          <td><strong>${item.id}</strong></td>
          <td>${item.service}</td>
          <td>${item.client}</td>
          <td>${item.date}</td>
          <td>${item.time}</td>
          <td>${item.details}</td>
          <td>${item.timestamp}</td>
          <td><span class="connection-status-pill ${item.status.includes('Sincronizado') || item.status === 'Local' ? 'connected' : 'disconnected'}">${item.status}</span></td>
        </tr>
      `).join('');
    }
  }

  // Educa
  const educaTbody = document.getElementById('db-educa-tbody');
  if (educaTbody) {
    const list = AppState.dbEduca || [];
    if (list.length === 0) {
      educaTbody.innerHTML = '<tr><td colspan="6" class="empty-db-row">No hay progresos registrados.</td></tr>';
    } else {
      educaTbody.innerHTML = list.map(item => `
        <tr>
          <td><strong>${item.id}</strong></td>
          <td>${item.course}</td>
          <td>${item.student}</td>
          <td>${item.module}</td>
          <td><span class="connection-status-pill connected">${item.state}</span></td>
          <td>${item.date}</td>
        </tr>
      `).join('');
    }
  }

  // Leads
  const leadsTbody = document.getElementById('db-leads-tbody');
  if (leadsTbody) {
    const list = AppState.dbLeads || [];
    if (list.length === 0) {
      leadsTbody.innerHTML = '<tr><td colspan="7" class="empty-db-row">No hay leads ingresados.</td></tr>';
    } else {
      leadsTbody.innerHTML = list.map(item => `
        <tr>
          <td><strong>${item.id}</strong></td>
          <td>${item.name}</td>
          <td>${item.email}</td>
          <td>${item.department}</td>
          <td>${item.message}</td>
          <td>${item.date}</td>
          <td><span class="connection-status-pill ${item.status.includes('Sincronizado') || item.status.includes('Web3Forms') || item.status === 'Local' ? 'connected' : 'disconnected'}">${item.status}</span></td>
        </tr>
      `).join('');
    }
  }
};

window.switchDbTab = function(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-db-content').forEach(el => el.classList.remove('active'));
  // Show target tab content
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');

  // Mark tabs active
  document.querySelectorAll('.tab-db-btn').forEach(btn => btn.classList.remove('active'));
  
  // Find button targeting this tabId
  const clickedBtn = document.getElementById(`btn-${tabId.replace('tab-db-', 'db-')}`) || document.querySelector(`.tab-db-btn[onclick*="${tabId}"]`);
  if (clickedBtn) clickedBtn.classList.add('active');
};

window.clearDatabaseConsole = function() {
  if (confirm('¿Estás seguro de que deseas vaciar las bases de datos locales de TeloCorpGroup?')) {
    AppState.dbSales = [];
    AppState.dbBookings = [];
    AppState.dbEduca = [];
    AppState.dbLeads = [];
    AppState.saveState();
    window.refreshDatabaseConsole();
    window.showToast('Bases de datos locales vaciadas', 'success');
  }
};

// ==========================================
// CHATBOT DE TELOASISTENTE (SUPPORT CENTRAL)
// ==========================================
window.initChatbot = function() {
  const chatMessages = document.getElementById('telo-chatbot-messages');
  if (chatMessages && chatMessages.children.length <= 1) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
};

window.handleChatbotKeyPress = function(e) {
  if (e.key === 'Enter') {
    window.sendChatbotMessage();
  }
};

window.sendChatbotMessage = async function() {
  const inputEl = document.getElementById('telo-chatbot-input');
  if (!inputEl) return;
  
  const text = inputEl.value.trim();
  if (!text) return;
  
  // Agregar mensaje del usuario a la pantalla
  appendChatMessage(text, 'user');
  inputEl.value = '';
  
  // Indicador de "Escribiendo..."
  const botMessagesEl = document.getElementById('telo-chatbot-messages');
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-msg bot-msg typing-msg';
  typingBubble.innerHTML = `<div class="msg-bubble"><em>TeloAsistente está escribiendo...</em></div>`;
  botMessagesEl.appendChild(typingBubble);
  botMessagesEl.scrollTop = botMessagesEl.scrollHeight;

  const status = document.getElementById('telo-chatbot-status');
  if (status) status.innerText = 'Pensando...';
  
  try {
    let responseText = '';
    const geminiKey = AppState.integrations.geminiKey;
    
    if (geminiKey) {
      responseText = await callGeminiAPI(geminiKey, text);
    } else {
      responseText = await getLocalChatbotResponse(text);
    }
    
    typingBubble.remove();
    appendChatMessage(responseText, 'bot');
  } catch (error) {
    console.error("Error chatbot response:", error);
    typingBubble.remove();
    appendChatMessage("Disculpa, ha ocurrido un error al procesar tu solicitud. Por favor intenta de nuevo o escríbenos a soporte@telocg.com.", 'bot');
  } finally {
    if (status) status.innerText = 'Asistente Virtual Central';
  }
};

function appendChatMessage(text, sender) {
  const botMessagesEl = document.getElementById('telo-chatbot-messages');
  if (!botMessagesEl) return;
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}-msg`;
  msgDiv.innerHTML = `<div class="msg-bubble">${formatChatText(text)}</div>`;
  botMessagesEl.appendChild(msgDiv);
  botMessagesEl.scrollTop = botMessagesEl.scrollHeight;
}

function formatChatText(text) {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

async function callGeminiAPI(apiKey, promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const systemInstruction = `Eres TeloAsistente, el agente de soporte inteligente de TeloCorpGroup (TELOCG), un clúster digital dominicano. Tus servicios son: TeloSales (marketplace de covers y tecnología), TeloLleva (logística rápida y segura de delivery e igualas de mensajería), TeloEduca (academia online de marketing digital, tecnología, etc.), TeloRepara (reparación técnica de hardware) y TeloInstala (servicios de instalación por técnicos calificados). Responde de manera profesional, amigable y corporativa, siempre en español. No menciones a Pulso ni RCP. Sé conciso y asertivo.`;
  
  const payload = {
    contents: [{
      parts: [{
        text: `${systemInstruction}\n\nPregunta del usuario: ${promptText}`
      }]
    }]
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }
    
    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    return "No pude obtener una respuesta inteligente. ¿En qué más te puedo ayudar?";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return await getLocalChatbotResponse(promptText);
  }
}

function getLocalChatbotResponse(userText) {
  const txt = userText.toLowerCase();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (txt.includes('hola') || txt.includes('buenos dias') || txt.includes('buenas tardes')) {
        resolve("¡Hola! 👋 Soy **TeloAsistente**, tu asesor de TeloCorpGroup. ¿Sobre cuál de nuestras divisiones (TeloSales, TeloLleva, TeloEduca, TeloRepara o TeloInstala) deseas información hoy?");
      } else if (txt.includes('sales') || txt.includes('tienda') || txt.includes('comprar') || txt.includes('cover') || txt.includes('precio') || txt.includes('producto')) {
        resolve("🛒 **TeloSales** es nuestra tienda de comercio electrónico y covers personalizados de alta calidad. Puedes navegar por la pestaña 'TeloSales' para ver nuestro catálogo, agregar productos a tu carrito y realizar la compra de manera rápida y segura.");
      } else if (txt.includes('lleva') || txt.includes('envio') || txt.includes('delivery') || txt.includes('mensajeria') || txt.includes('transporte') || txt.includes('uber') || txt.includes('indrive')) {
        resolve("📦 **TeloLleva** es nuestra plataforma de logística inteligente. Ofrecemos envíos express para tus compras y un cotizador de tarifas de mensajería interactivo en la pestaña 'TeloLleva'. ¡Ingresa tu punto de origen y destino para cotizar y solicitar un mensajero!");
      } else if (txt.includes('educa') || txt.includes('curso') || txt.includes('academia') || txt.includes('aprender') || txt.includes('estudiar') || txt.includes('certificado')) {
        resolve("🎓 **TeloEduca** es nuestra academia online de desarrollo profesional. Ofrecemos cursos y diplomados prácticos en Tecnología y Marketing Digital con material grabado, foros de consulta y exámenes. Mira la pestaña 'TeloEduca' para inscribirte y estudiar a tu propio ritmo.");
      } else if (txt.includes('repara') || txt.includes('daño') || txt.includes('pantalla') || txt.includes('celular') || txt.includes('laptop') || txt.includes('computadora')) {
        resolve("🔧 **TeloRepara** ofrece soporte técnico express. Si tu celular o laptop tiene fallas (pantalla rota, no enciende, etc.), indícalo en la pestaña 'TeloRepara' para obtener una cotización automática. Nuestros mensajeros retiran el equipo a domicilio y lo devuelven reparado.");
      } else if (txt.includes('instala') || txt.includes('tecnico') || txt.includes('camara') || txt.includes('red') || txt.includes('configurar')) {
        resolve("🛠️ **TeloInstala** conecta tu hogar u oficina con ingenieros y técnicos calificados para montaje de redes, instalación de cámaras de seguridad, configuración de servidores y cableado estructurado. Puedes agendar y calendarizar tu cita en la pestaña 'TeloInstala'.");
      } else if (txt.includes('contacto') || txt.includes('whatsapp') || txt.includes('correo') || txt.includes('email') || txt.includes('telefono') || txt.includes('oficina') || txt.includes('ubicacion')) {
        resolve("Puedes contactar al corporativo central a través de:\n- **WhatsApp:** +1 (809) 903-8707\n- **Correo Central:** soporte@telocg.com\n- **Oficinas:** Santo Domingo, R.D.");
      } else {
        resolve("TeloCorpGroup es un clúster digital líder que integra soluciones de e-commerce, logística, educación y soporte técnico. ¿Deseas saber más sobre TeloSales, TeloLleva, TeloEduca, TeloRepara o TeloInstala? También puedes escribirnos a soporte@telocg.com.");
      }
    }, 800);
  });
}

// Handler para el Formulario de Postulación de Socios (Programa de Socios y Alianzas)
window.submitPartnerApplication = async function(e) {
  if (e) e.preventDefault();
  
  const name = document.getElementById('partner-name').value.trim();
  const email = document.getElementById('partner-email').value.trim();
  const type = document.getElementById('partner-type').value;
  const proposal = document.getElementById('partner-proposal').value.trim();
  
  const form = document.getElementById('partner-apply-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const oldText = submitBtn ? submitBtn.innerText : 'Enviar Propuesta de Socio';
  
  if (submitBtn) {
    submitBtn.innerText = 'Enviando...';
    submitBtn.disabled = true;
  }
  
  const dataObj = {
    name: name,
    email: email,
    department: `Socio (${type === 'Proponer Nuevo Servicio' ? 'Nuevo' : 'Existente'})`,
    message: proposal,
    timestamp: new Date().toISOString()
  };
  
  // Si tenemos configurado el Webhook de Leads en n8n
  if (AppState.integrations && AppState.integrations.n8nLeadsUrl) {
    if (window.logToDiagnosticConsole) {
      window.logToDiagnosticConsole('out', `Enviando Postulación de Socio a n8n CRM Webhook: ${AppState.integrations.n8nLeadsUrl}`, JSON.stringify(dataObj, null, 2));
    }
    
    const payloadStr = JSON.stringify(dataObj);
    const headers = { 'Content-Type': 'application/json' };
    
    if (AppState.integrations.hmacEnabled && AppState.integrations.hmacSecret) {
      try {
        const sig = await calculateHMAC(AppState.integrations.hmacSecret, payloadStr);
        headers['X-Telo-Signature'] = sig;
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('info', `Firma HMAC Generada para Socio: ${sig.slice(0, 15)}... (cabecera X-Telo-Signature)`);
        }
      } catch (err) {
        console.error("Error signing HMAC for partner:", err);
      }
    }
    
    try {
      const response = await fetch(AppState.integrations.n8nLeadsUrl, {
        method: 'POST',
        headers: headers,
        body: payloadStr
      });
      const respText = await response.text();
      const statusStr = `Sincronizado (${response.status})`;
      if (response.ok) {
        window.showToast('Propuesta de socio enviada con éxito.', 'success');
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('success', `Postulación recibida por n8n (HTTP ${response.status})`, respText);
        }
        window.addDbLeadsRecord(name, email, `Socio (${type === 'Proponer Nuevo Servicio' ? 'Nuevo' : 'Existente'})`, proposal, statusStr);
        form.reset();
      } else {
        window.showToast(`Error al enviar propuesta (HTTP ${response.status})`, 'error');
        if (window.logToDiagnosticConsole) {
          window.logToDiagnosticConsole('error', `n8n rechazó la postulación (HTTP ${response.status})`, respText);
        }
        window.addDbLeadsRecord(name, email, `Socio (${type === 'Proponer Nuevo Servicio' ? 'Nuevo' : 'Existente'})`, proposal, `Fallo (${response.status})`);
      }
    } catch (err) {
      console.error(err);
      window.showToast('Error de red al enviar propuesta a n8n.', 'error');
      if (window.logToDiagnosticConsole) {
        window.logToDiagnosticConsole('error', `Fallo de red al enviar postulación: ${err.message}`);
      }
      window.addDbLeadsRecord(name, email, `Socio (${type === 'Proponer Nuevo Servicio' ? 'Nuevo' : 'Existente'})`, proposal, 'Error Red');
    } finally {
      if (submitBtn) {
        submitBtn.innerText = oldText;
        submitBtn.disabled = false;
      }
    }
  } else {
    // Fallback de envío local a la consola de base de datos
    window.showToast('Postulación de socio registrada exitosamente en base de datos local.', 'success');
    if (window.logToDiagnosticConsole) {
      window.logToDiagnosticConsole('warn', 'Postulación de socio guardada localmente (n8n no configurado)');
    }
    window.addDbLeadsRecord(name, email, `Socio (${type === 'Proponer Nuevo Servicio' ? 'Nuevo' : 'Existente'})`, proposal, 'Local');
    if (form) form.reset();
    if (submitBtn) {
      submitBtn.innerText = oldText;
      submitBtn.disabled = false;
    }
  }
};

// ==========================================
// CONTROL DEL MENÚ DE NAVEGACIÓN MÓVIL
// ==========================================
window.toggleMobileMenu = function() {
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
  if (overlay) {
    overlay.classList.toggle('active');
  }
};

window.closeMobileMenu = function() {
  const sidebar = document.querySelector('.app-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
};

// ==========================================
// PERFIL DE USUARIO (MI PERFIL VIEW)
// ==========================================
window.saveUserProfile = function(event) {
  event.preventDefault();
  
  const name = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const address = document.getElementById('profile-address').value.trim();
  const cityEl = document.getElementById('profile-city');
  const city = cityEl ? cityEl.value : '';
  
  AppState.userProfile = { name, email, phone, address, city };
  AppState.saveState();
  
  // Update display
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email-display');
  const avatarDisplay = document.getElementById('profile-avatar-display');
  if (nameDisplay) nameDisplay.innerText = name || 'Usuario TeloCorpGroup';
  if (emailDisplay) emailDisplay.innerText = email || 'Sin registro';
  if (avatarDisplay) avatarDisplay.innerText = name ? name.charAt(0).toUpperCase() : '👤';
  
  window.showToast('Perfil guardado exitosamente ✓', 'success');
  
  // Autofill service forms with profile data
  window.autofillProfileInForms();
};

window.loadUserProfile = function() {
  const profile = AppState.userProfile;
  if (!profile || !profile.name) return;
  
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const phoneEl = document.getElementById('profile-phone');
  const addressEl = document.getElementById('profile-address');
  const cityEl = document.getElementById('profile-city');
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email-display');
  const avatarDisplay = document.getElementById('profile-avatar-display');
  
  if (nameEl && profile.name) nameEl.value = profile.name;
  if (emailEl && profile.email) emailEl.value = profile.email;
  if (phoneEl && profile.phone) phoneEl.value = profile.phone;
  if (addressEl && profile.address) addressEl.value = profile.address;
  if (cityEl && profile.city) cityEl.value = profile.city;
  
  if (nameDisplay) nameDisplay.innerText = profile.name || 'Usuario TeloCorpGroup';
  if (emailDisplay) emailDisplay.innerText = profile.email || 'Sin registro';
  if (avatarDisplay && profile.name) avatarDisplay.innerText = profile.name.charAt(0).toUpperCase();
};

window.autofillProfileInForms = function() {
  const profile = AppState.userProfile;
  if (!profile || !profile.name) return;
  
  // Autofill TeloRepara address
  const reparaAddress = document.getElementById('repara-address');
  if (reparaAddress && !reparaAddress.value && profile.address) {
    reparaAddress.value = profile.address;
  }
};

// Schedule/datetime toggle for TeloLleva
document.addEventListener('DOMContentLoaded', function() {
  const scheduleSelect = document.getElementById('lleva-schedule');
  if (scheduleSelect) {
    scheduleSelect.addEventListener('change', function() {
      const datetimeWrapper = document.getElementById('lleva-datetime-wrapper');
      if (datetimeWrapper) {
        datetimeWrapper.style.display = (this.value === 'scheduled') ? 'block' : 'none';
      }
    });
  }
  
  // Load user profile into the profile form on page load
  window.loadUserProfile();
});

