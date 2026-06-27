# 🏗️ Auditoría y Rediseño: TeloEduca, TeloLleva, TeloRepara, TeloInstala
## Informe Multi-Disciplinario — Transformación a Plataformas Líderes

**Fecha:** 26 de junio de 2026  
**Alcance:** 4 verticales del ecosistema TeloCorp Group  
**Benchmarks:** Coursera/Udemy (Educa), Uber/Rappi (Lleva), iFixit/Samsung Care (Repara), TaskRabbit/Angi (Instala)

---

## 🎓 TELOEDUCA — De Prototipo a Academia Online Profesional

### Estado Actual

| Aspecto | Implementación |
|---------|---------------|
| Cursos | 5 en DB (gestionables via admin) |
| Contenido | Títulos de lecciones (sin video/texto real) |
| Video player | Simulación (barra que avanza automáticamente) |
| Progreso | localStorage (no vinculado a usuario real) |
| Quiz | 3 preguntas multiple choice por curso |
| Certificados | Generados en HTML, guardados en DB |
| Foro | Simulado (respuestas automáticas fake) |
| Pagos | Gratis (no hay monetización) |
| Instructor | Texto estático, sin perfil ni interacción |
| LMS features | 0% (no hay assignments, live, cohorts) |

### Problemas Críticos

1. **Sin video real** — El player simula reproducción con un timer. No hay contenido educativo.
2. **Progreso en localStorage** — Se pierde al cambiar dispositivo/limpiar cache.
3. **Sin autenticación de estudiante** — Cualquiera puede "certificarse" sin verificar identidad.
4. **Certificados sin validación** — No hay verificación pública del cert_id.
5. **Foro simulado** — Las respuestas son hardcodeadas, no hay comunidad real.
6. **Sin modelo de negocio** — Todo gratis, sin suscripciones ni pagos.
7. **Sin contenido real** — Las "clases" son solo títulos, sin material educativo.

### Rediseño: TeloEduca Academy

```
ARQUITECTURA LMS COMPLETO:

TABLA: courses_v2
├── id, title, slug, description, thumbnail_url
├── instructor_id (FK → instructors)
├── category_id (FK → course_categories)
├── level (beginner, intermediate, advanced)
├── language (es, en)
├── duration_hours (computed from lessons)
├── pricing_type (free, one_time, subscription)
├── price / compare_price (NUMERIC)
├── currency (DOP, USD)
├── enrollment_limit (INT, NULL = ilimitado)
├── enrollment_count (INT, computed)
├── prerequisites (UUID[], cursos previos requeridos)
├── tags (TEXT[])
├── status (draft, published, archived)
├── certificate_template (TEXT, HTML template)
├── completion_criteria (JSONB: {min_progress: 80, quiz_score: 70})
├── rating_avg / rating_count
└── published_at, created_at, updated_at

TABLA: course_modules (secciones/unidades)
├── id, course_id (FK)
├── title, description
├── position (INT)
├── is_free_preview (BOOLEAN)
└── duration_minutes (computed)

TABLA: lessons
├── id, module_id (FK), course_id (FK)
├── title, description
├── type (video, text, quiz, assignment, live, download)
├── content_url (TEXT, video URL o documento)
├── content_html (TEXT, lecciones tipo artículo)
├── video_provider (youtube, vimeo, bunny, self_hosted)
├── video_duration_seconds (INT)
├── position (INT)
├── is_free_preview (BOOLEAN)
├── is_mandatory (BOOLEAN DEFAULT true)
└── resources (JSONB[]: [{title, url, type}])

TABLA: enrollments (matrícula)
├── id, student_id (FK → auth.users), course_id (FK)
├── enrolled_at (TIMESTAMPTZ)
├── payment_id (FK, nullable)
├── progress_pct (INT 0-100, computed)
├── status (active, completed, paused, refunded)
├── completed_at (TIMESTAMPTZ)
├── certificate_id (FK)
├── last_accessed_at
└── expires_at (TIMESTAMPTZ, para suscripciones)

TABLA: lesson_progress
├── id, student_id, lesson_id, course_id
├── status (not_started, in_progress, completed)
├── progress_seconds (INT, para video)
├── completed_at
├── attempts (INT, para quizzes)
└── score (INT, para quizzes)

TABLA: instructors
├── id, user_id (FK → auth.users)
├── display_name, bio, avatar_url
├── specializations (TEXT[])
├── social_links (JSONB)
├── total_students, total_courses
├── rating_avg
├── commission_rate (NUMERIC, % de ventas)
└── payout_info (JSONB, datos bancarios encriptados)

TABLA: course_reviews
├── id, course_id, student_id
├── rating (1-5), title, body
├── is_verified_enrollment (BOOLEAN)
├── helpful_count
└── instructor_reply, created_at

TABLA: quiz_attempts
├── id, lesson_id, student_id
├── answers (JSONB)
├── score (INT)
├── passed (BOOLEAN)
├── attempt_number (INT)
└── submitted_at

TABLA: certificates_v2
├── id (UUID)
├── cert_number (TEXT UNIQUE, verificable públicamente)
├── student_id, course_id
├── student_name (snapshot)
├── course_title (snapshot)
├── instructor_name (snapshot)
├── score (INT)
├── issued_at
├── expires_at (nullable, para certificaciones con vencimiento)
├── verification_url (TEXT, link público)
├── pdf_url (TEXT, PDF generado)
└── blockchain_hash (TEXT, futuro: verificación on-chain)

FUNCIONALIDADES AVANZADAS:
├── 🎥 Video hosting real (Bunny Stream o YouTube unlisted)
├── 📝 Quizzes avanzados (timer, randomización, banco de preguntas)
├── 📋 Assignments (subir archivo, evaluación por instructor)
├── 💬 Foro real por curso (threads, upvotes, best answer)
├── 📡 Live classes (integración Zoom/Google Meet)
├── 🏆 Gamificación (badges, streaks, leaderboard)
├── 📊 Analytics para instructores (engagement, drop-off)
├── 💳 Pagos (curso individual, suscripción mensual, bundles)
├── 🎯 Learning paths (secuencias recomendadas)
├── 📱 Offline mode (descarga de lecciones en PWA)
├── 🤖 IA tutor (responde dudas basado en el contenido del curso)
└── 🔗 Verificación pública de certificados (/verify/CERT-ID)
```


### Priorización MoSCoW — TeloEduca

**MUST:** Video hosting real, auth de estudiante, progreso server-side, pagos por curso, certificados verificables públicamente, quizzes funcionales.

**SHOULD:** Foro real, learning paths, instructor dashboard, analytics, suscripción mensual, assignments.

**COULD:** Live classes, gamificación, IA tutor, offline download, marketplace de instructores.

**WON'T (v1):** Blockchain certs, corporate B2B, white-label, cohort-based courses.

---

## 📦 TELOLLEVA — De Demo a Plataforma Logística Real

### Estado Actual

| Aspecto | Implementación |
|---------|---------------|
| Mapa | Google Maps real (Places + Directions) |
| Cotización | Fórmula: base + km × tarifa por vehículo |
| Conductores | Reales desde DB (4 semilla) con fallback demo |
| Tracking | Animación SVG simulada (no GPS real) |
| Chat | Simulado (respuestas automáticas) |
| Pagos | No (solo cotización, pago manual) |
| Multi-parada | No |
| Programación | Campo "schedule" pero sin implementación real |
| Historial | Consulta a DB pero sin interfaz de re-pedido |
| Notificaciones | WhatsApp al admin (no al cliente ni al conductor) |

### Problemas Críticos

1. **Tracking 100% simulado** — La animación avanza con un timer, no con GPS real del conductor.
2. **Sin pagos** — El cliente solicita pero no paga en línea. Manual via WhatsApp.
3. **Sin app para conductores** — Los conductores no tienen forma de aceptar/rechazar pedidos en tiempo real.
4. **Chat ficticio** — Las respuestas del conductor son automáticas ("Entendido 👍").
5. **Sin estimación de llegada real** — El ETA se decrementa con timer, no con GPS.
6. **Sin proof of delivery** — No hay foto/firma de entrega.
7. **Sin asignación inteligente** — La lista de conductores es fija, no por proximidad.

### Rediseño: TeloLleva Platform

```
ARQUITECTURA LOGÍSTICA COMPLETA:

TABLA: delivery_requests
├── id (UUID)
├── request_number (TEXT UNIQUE, TCL-2026-00001)
├── customer_id (FK → auth.users)
├── ── Puntos ──
├── pickup_address (TEXT)
├── pickup_coordinates (POINT)
├── pickup_contact_name / phone
├── pickup_instructions (TEXT)
├── dropoff_address / coordinates / contact / instructions
├── waypoints (JSONB[], multi-parada)
├── ── Paquete ──
├── package_description (TEXT)
├── package_size (ENUM: small, medium, large, extra_large)
├── package_weight_kg (NUMERIC)
├── is_fragile (BOOLEAN)
├── declared_value (NUMERIC, para seguro)
├── ── Servicio ──
├── vehicle_type (ENUM: motorcycle, car, van, truck)
├── service_type (ENUM: express, standard, scheduled, same_day)
├── scheduled_pickup_at (TIMESTAMPTZ)
├── ── Pricing ──
├── distance_km (NUMERIC)
├── duration_minutes (INT)
├── base_fare (NUMERIC)
├── distance_fare (NUMERIC)
├── surge_multiplier (NUMERIC DEFAULT 1)
├── total_fare (NUMERIC)
├── payment_method (ENUM: cash, card, wallet)
├── payment_status (ENUM: pending, paid, refunded)
├── ── Estado ──
├── status (ENUM: pending, searching, assigned, pickup_en_route,
│           arrived_pickup, picked_up, in_transit, arrived_dropoff,
│           delivered, cancelled, failed)
├── ── Asignación ──
├── driver_id (FK → drivers_v2)
├── assigned_at (TIMESTAMPTZ)
├── picked_up_at / delivered_at (TIMESTAMPTZ)
├── ── Proof of Delivery ──
├── delivery_photo_url (TEXT)
├── delivery_signature_url (TEXT)
├── recipient_name (TEXT)
├── ── Rating ──
├── customer_rating (INT 1-5)
├── driver_rating (INT 1-5)
├── customer_feedback / driver_feedback (TEXT)
└── created_at, updated_at, cancelled_at

TABLA: drivers_v2
├── id (UUID)
├── user_id (FK → auth.users, login propio)
├── name, phone, email
├── avatar_url
├── vehicle_type (motorcycle, car, van)
├── vehicle_plate, vehicle_model, vehicle_color
├── license_number, license_expiry
├── documents (JSONB: [{type, url, verified, expires_at}])
├── ── Operación ──
├── status (online, busy, offline)
├── current_location (POINT, actualizado por GPS)
├── current_location_updated_at (TIMESTAMPTZ)
├── accepting_requests (BOOLEAN)
├── active_delivery_id (FK, nullable)
├── ── Métricas ──
├── rating_avg (NUMERIC)
├── total_deliveries (INT)
├── total_earnings (NUMERIC)
├── acceptance_rate (NUMERIC %)
├── completion_rate (NUMERIC %)
├── ── Financiero ──
├── commission_rate (NUMERIC %, plataforma)
├── wallet_balance (NUMERIC)
├── bank_info (JSONB, encrypted)
└── verified_at, created_at

TABLA: delivery_tracking (GPS trail en tiempo real)
├── id (BIGSERIAL)
├── delivery_id (FK)
├── driver_id (FK)
├── location (POINT)
├── speed_kmh (NUMERIC)
├── bearing (INT, dirección en grados)
├── event (TEXT: location_update, status_change, message)
├── metadata (JSONB)
└── recorded_at (TIMESTAMPTZ)

TABLA: delivery_zones (zonas con pricing diferenciado)
├── id, name
├── polygon (GEOMETRY, área geográfica)
├── base_fare, per_km_rate
├── surge_config (JSONB: reglas de demanda)
├── is_active (BOOLEAN)
└── operating_hours (JSONB: [{day, start, end}])

FUNCIONALIDADES AVANZADAS:
├── 📍 Tracking GPS real (driver app envía coordenadas cada 10s)
├── 🗺️ ETA dinámico (recalcula con tráfico en tiempo real)
├── 📸 Proof of Delivery (foto + firma digital)
├── 💬 Chat real conductor ↔ cliente (Supabase Realtime)
├── 💳 Pago in-app (tarjeta, wallet, cash)
├── 🔔 Push notifications (asignado, recogido, entregado)
├── 📊 Surge pricing (demanda alta → multiplier)
├── 🛣️ Multi-parada (hasta 5 destinos)
├── 📅 Envíos programados (agenda para fecha/hora futura)
├── 🤖 Asignación inteligente (proximidad + rating + vehículo)
├── 📱 Driver app (Capacitor: aceptar, navegar, completar)
├── 💰 Wallet + sistema de propinas
├── 🛡️ Seguro de paquete (declarar valor → cobrar prima)
└── 📈 Dashboard operativo (envíos activos, conductores, zonas)
```


### Priorización MoSCoW — TeloLleva

**MUST:** GPS tracking real (al menos conductor reporta posición), pagos in-app, driver app básica (aceptar/completar), push notifications al cliente, proof of delivery (foto).

**SHOULD:** Chat real (Supabase Realtime), multi-parada, envíos programados, surge pricing, wallet del conductor, asignación por proximidad.

**COULD:** Seguro de paquete, propinas, analytics operativo, zonas con pricing diferenciado, ETA con tráfico.

**WON'T (v1):** Entregas B2B masivas, integración con ERPs logísticos, drone delivery, API pública para third-parties.

---

## 🔧 TELOREPARA — De Cotizador a Centro de Servicio Técnico

### Estado Actual

| Aspecto | Implementación |
|---------|---------------|
| Cotizador | Tabla de precios fijos (dispositivo × falla) |
| Dispositivos | 9 tipos (phone, laptop, tablet, tv, console, printer, appliance, inverter, ac) |
| Fallas | 11 tipos con precios por dispositivo |
| Booking | Formulario → INSERT en DB → WhatsApp admin |
| Tracking | Simulación con timer (4 pasos fijos en 12 segundos) |
| Precios | Hardcoded + sync desde services_catalog |
| Técnicos | No se asignan al cliente (solo referencia en tracker simulado) |
| Garantía | Texto estático "90 días" sin implementación |
| Diagnóstico | Simulado (no hay evaluación real) |
| Historial | Básico (lista de bookings en CRM) |

### Problemas Críticos

1. **Tracking 100% simulado** — El progreso avanza automáticamente en 12 segundos. No refleja realidad.
2. **Sin asignación real de técnico** — El admin debe coordinar manualmente por WhatsApp.
3. **Sin cotización dinámica** — Los precios son fijos por tabla. No contempla marca, modelo, severidad.
4. **Sin comunicación técnico-cliente** — Todo pasa por el admin como intermediario.
5. **Sin garantía real** — El texto "90 días" no tiene sistema de reclamos ni seguimiento.
6. **Sin pagos** — El cliente reserva pero paga al final manualmente.
7. **Sin fotos del dispositivo** — No se documenta el estado del equipo antes/después.

### Rediseño: TeloRepara Service Center

```
ARQUITECTURA CENTRO DE SERVICIO TÉCNICO:

TABLA: repair_tickets
├── id (UUID)
├── ticket_number (TEXT UNIQUE, RPR-2026-00001)
├── customer_id (FK → auth.users)
├── ── Dispositivo ──
├── device_type (ENUM: phone, laptop, tablet, tv, console, etc.)
├── device_brand (TEXT)
├── device_model (TEXT)
├── device_serial (TEXT, optional)
├── device_color (TEXT)
├── device_password (TEXT, encrypted — para desbloqueo)
├── ── Problema ──
├── issue_category (FK → repair_issues)
├── issue_description (TEXT, descripción libre del cliente)
├── severity (ENUM: cosmetic, functional, critical, not_working)
├── ── Logística ──
├── service_mode (ENUM: in_store, pickup_delivery, remote)
├── pickup_address / dropoff_address (TEXT)
├── pickup_date / dropoff_date (DATE)
├── ── Financiero ──
├── estimated_cost (NUMERIC, cotización inicial)
├── final_cost (NUMERIC, tras diagnóstico)
├── parts_cost (NUMERIC)
├── labor_cost (NUMERIC)
├── payment_status (pending, deposit_paid, fully_paid, refunded)
├── deposit_amount (NUMERIC, anticipo)
├── ── Estado ──
├── status (ENUM: submitted, pickup_scheduled, received,
│           diagnosing, quote_sent, quote_approved,
│           waiting_parts, repairing, quality_check,
│           ready_for_pickup, delivering, completed,
│           cancelled, warranty_claim)
├── priority (ENUM: standard, express, emergency)
├── ── Asignación ──
├── technician_id (FK → technicians_v2)
├── assigned_at (TIMESTAMPTZ)
├── ── Tiempos ──
├── estimated_completion (TIMESTAMPTZ)
├── received_at / diagnosed_at / completed_at (TIMESTAMPTZ)
├── ── Garantía ──
├── warranty_days (INT DEFAULT 90)
├── warranty_expires_at (TIMESTAMPTZ)
├── warranty_terms (TEXT)
└── created_at, updated_at

TABLA: repair_media (fotos antes/durante/después)
├── id, ticket_id (FK)
├── type (ENUM: before_intake, during_repair, after_repair, customer_submitted)
├── url (TEXT)
├── caption (TEXT)
├── uploaded_by (FK → auth.users)
└── created_at

TABLA: repair_timeline (historial detallado)
├── id, ticket_id (FK)
├── event (TEXT: status_change, note, photo, part_ordered, etc.)
├── description (TEXT)
├── actor (TEXT, técnico/admin/system/customer)
├── is_customer_visible (BOOLEAN)
├── attachments (JSONB[])
└── created_at

TABLA: repair_quotes (cotizaciones formales)
├── id, ticket_id (FK)
├── items (JSONB[]: [{description, part_number, qty, unit_cost, labor}])
├── subtotal, tax, total (NUMERIC)
├── valid_until (DATE)
├── status (sent, approved, rejected, expired)
├── approved_at (TIMESTAMPTZ)
├── customer_signature_url (TEXT)
└── created_at

TABLA: repair_parts (repuestos utilizados)
├── id, ticket_id (FK)
├── part_name, part_number
├── quantity (INT)
├── unit_cost (NUMERIC)
├── supplier (TEXT)
├── status (ordered, received, installed)
├── ordered_at / received_at
└── warranty_months (INT)

TABLA: technicians_v2
├── id, user_id (FK → auth.users)
├── name, phone, avatar_url
├── specializations (TEXT[]: phone, laptop, tv, ac, etc.)
├── certifications (JSONB[]: [{name, issuer, date, url}])
├── rating_avg, total_repairs
├── active_tickets (INT)
├── max_concurrent_tickets (INT DEFAULT 5)
├── hourly_rate (NUMERIC)
├── availability (JSONB: schedule semanal)
├── status (available, busy, vacation, inactive)
└── joined_at

TABLA: warranty_claims
├── id, original_ticket_id (FK)
├── customer_id (FK)
├── claim_description (TEXT)
├── claim_photos (TEXT[])
├── status (submitted, reviewing, approved, rejected, resolved)
├── resolution (TEXT)
├── new_ticket_id (FK, si se crea reparación nueva)
└── created_at, resolved_at

FUNCIONALIDADES AVANZADAS:
├── 📸 Documentación fotográfica (antes/durante/después)
├── 💰 Cotización formal aprobable por el cliente
├── 📊 Tracking real con timeline visible para el cliente
├── 💬 Chat técnico ↔ cliente (para preguntas durante reparación)
├── 📱 Notificaciones en cada cambio de estado (push + email + WhatsApp)
├── 🛡️ Sistema de garantía con reclamos en línea
├── 🧾 Facturación automática al completar
├── 📦 Logística integrada (recogida a domicilio via TeloLleva)
├── 🤖 IA diagnóstico: cliente describe síntomas → IA sugiere falla probable
├── 📋 Checklist de calidad pre-entrega
├── ⏱️ SLA configurable (2h respuesta, 48h diagnóstico, etc.)
└── 📈 Dashboard de taller (carga por técnico, tiempos promedio)
```

### Priorización MoSCoW — TeloRepara

**MUST:** Tracking real con timeline, asignación de técnico, fotos antes/después, cotización aprobable, pagos en línea (depósito + saldo), notificaciones de estado.

**SHOULD:** Chat técnico-cliente, garantía con reclamos, logística integrada (recogida vía TeloLleva), facturación automática, checklist de calidad.

**COULD:** IA diagnóstico, SLA con alerts, dashboard de taller, repuestos con tracking de proveedores.

**WON'T (v1):** Marketplace de técnicos independientes, integración con fabricantes (Apple/Samsung), seguro de dispositivo.

---

## 🛠️ TELOINSTALA — De Formulario a Plataforma de Servicios del Hogar

### Estado Actual

| Aspecto | Implementación |
|---------|---------------|
| Servicios | 12 tipos (TV, AC, solar, cámaras, etc.) |
| Técnicos | 3 en DB (seleccionables por card) |
| Cotización | Precio fijo por servicio + rango min/max |
| Agenda | Fecha + turno (AM/PM), sin verificar disponibilidad |
| Booking | Formulario → INSERT en DB → WhatsApp admin |
| Tracking | No hay (solo confirmación instantánea) |
| Pagos | No (coordinación manual) |
| Reviews | No existen |
| Disponibilidad | No se verifica (double booking posible) |

### Problemas Críticos

1. **Sin verificación de disponibilidad** — Puede agendar fecha/técnico ya ocupado.
2. **Sin tracking post-reserva** — El cliente no sabe si el técnico viene en camino.
3. **Sin pagos** — Todo se coordina manualmente.
4. **Sin reviews por servicio** — No hay reputación verificable.
5. **Técnicos sin calendario** — No gestionan su propia agenda.
6. **Sin cotización variable** — Precio fijo sin considerar complejidad, distancia, materiales.
7. **Sin garantía formal** — No hay seguimiento post-servicio.

### Rediseño: TeloInstala — Home Services Platform

```
ARQUITECTURA SERVICIOS DEL HOGAR:

TABLA: service_bookings
├── id (UUID)
├── booking_number (TEXT UNIQUE, TIN-2026-00001)
├── customer_id (FK → auth.users)
├── ── Servicio ──
├── service_id (FK → service_catalog_v2)
├── service_name (TEXT, snapshot)
├── description (TEXT, detalles específicos del cliente)
├── ── Ubicación ──
├── address (TEXT)
├── coordinates (POINT)
├── access_instructions (TEXT, "timbre 3B, portón azul")
├── photos (TEXT[], fotos del espacio/problema)
├── ── Agenda ──
├── preferred_date (DATE)
├── preferred_time_slot (ENUM: morning, afternoon, evening)
├── confirmed_datetime (TIMESTAMPTZ, real tras asignación)
├── estimated_duration_hours (NUMERIC)
├── ── Técnico ──
├── technician_id (FK → technicians_v2)
├── assigned_at (TIMESTAMPTZ)
├── ── Pricing ──
├── estimated_cost (NUMERIC)
├── materials_cost (NUMERIC, cobro adicional por materiales)
├── travel_cost (NUMERIC, si aplica por zona lejana)
├── final_cost (NUMERIC)
├── payment_status (pending, deposit, paid, refunded)
├── ── Estado ──
├── status (ENUM: requested, confirmed, technician_assigned,
│           en_route, arrived, in_progress, completed,
│           cancelled, rescheduled, disputed)
├── ── Post-servicio ──
├── completion_photos (TEXT[])
├── completion_notes (TEXT, notas del técnico)
├── customer_signature_url (TEXT)
├── warranty_days (INT)
├── warranty_expires_at (TIMESTAMPTZ)
├── ── Rating ──
├── customer_rating (INT 1-5)
├── customer_review (TEXT)
├── technician_rating_of_customer (INT 1-5)
└── created_at, updated_at, completed_at

TABLA: service_catalog_v2
├── id (UUID)
├── category_id (FK → service_categories)
├── name (TEXT)
├── slug (TEXT)
├── description (TEXT)
├── icon (TEXT)
├── base_price (NUMERIC)
├── price_min / price_max (NUMERIC, rango)
├── pricing_type (ENUM: fixed, hourly, per_unit, quote_required)
├── estimated_hours (NUMERIC)
├── includes (TEXT[], qué incluye el precio base)
├── excludes (TEXT[], qué NO incluye)
├── requirements (TEXT[], qué necesita el cliente tener listo)
├── faq (JSONB[]: [{question, answer}])
├── popular (BOOLEAN)
├── position (INT)
└── is_active (BOOLEAN)

TABLA: technician_availability
├── id, technician_id (FK)
├── date (DATE)
├── time_slots (JSONB: {morning: true, afternoon: true, evening: false})
├── max_bookings_per_day (INT DEFAULT 3)
├── current_bookings (INT)
├── is_day_off (BOOLEAN)
└── notes (TEXT)

TABLA: service_materials (materiales usados en cada servicio)
├── id, booking_id (FK)
├── item_name (TEXT)
├── quantity (INT)
├── unit_cost (NUMERIC)
├── total (NUMERIC)
├── provided_by (ENUM: technician, customer, store)
└── added_at

TABLA: service_packages (combos de servicios con descuento)
├── id, name, description
├── services (UUID[], IDs de servicios incluidos)
├── original_price / package_price (NUMERIC)
├── savings_pct (INT)
├── image_url (TEXT)
├── is_active, position
└── valid_until (DATE)

FUNCIONALIDADES AVANZADAS:
├── 📅 Calendario real de disponibilidad (por técnico + fecha)
├── 🗺️ Zona de cobertura por técnico (radio en km)
├── 📸 Fotos antes/después del trabajo
├── ✍️ Firma digital del cliente al completar
├── 💳 Pagos en línea (depósito 30% + saldo al completar)
├── ⭐ Reviews verificados (solo clientes con booking completado)
├── 📦 Paquetes de servicios (Mantenimiento anual AC → 12 visitas)
├── 🔔 Recordatorios automáticos (24h antes de la cita)
├── 📍 Tracking "técnico en camino" (GPS via TeloLleva)
├── 🧾 Cotización detallada con materiales
├── 🛡️ Garantía con reclamos
├── 📊 Dashboard: servicios del día, ingresos, técnicos activos
├── 🤖 IA: sugerir servicio según fotos del problema
└── 📱 App técnico: ver agenda, navegar, completar, cobrar
```

### Priorización MoSCoW — TeloInstala

**MUST:** Calendario de disponibilidad real, pagos en línea, tracking post-reserva (confirmado → en camino → completado), reviews de clientes, notificaciones automáticas.

**SHOULD:** Fotos antes/después, firma digital, cotización detallada con materiales, paquetes de servicios, zona de cobertura por técnico.

**COULD:** IA sugerencia por foto, mantenimiento recurrente (suscripción), app de técnico separada, integración con TeloLleva para logística.

**WON'T (v1):** Marketplace de técnicos independientes, certificaciones de fabricante, cotización por video-llamada.


---

## 🏗️ ROADMAP UNIFICADO DEL ECOSISTEMA

### Fase A — Fundación Compartida (3-4 semanas)
Infraestructura que beneficia TODOS los verticales:
- [ ] Auth unificada de clientes (Supabase Auth, un login para todo)
- [ ] Perfil de cliente compartido (dirección, teléfono, historial cross-service)
- [ ] Sistema de notificaciones unificado (email + push + WhatsApp)
- [ ] Pasarela de pagos (Stripe) reutilizable en todos los módulos
- [ ] Sistema de reviews/ratings genérico (aplicable a cursos, técnicos, conductores)
- [ ] Dashboard unificado del ecosistema (revenue total, servicios activos)

### Fase B — Verticales Core (por servicio, parallelizable)

| Servicio | Foco Fase B | Duración |
|----------|-------------|----------|
| TeloEduca | Video real + pagos + progreso server-side | 4 sem |
| TeloLleva | GPS tracking + driver app + pagos | 5 sem |
| TeloRepara | Timeline real + técnico asignado + cotización | 4 sem |
| TeloInstala | Calendario real + pagos + confirmación | 3 sem |

### Fase C — Sinergias Cross-Service (3-4 semanas)
- [ ] TeloRepara usa TeloLleva para recogida a domicilio
- [ ] TeloInstala usa TeloLleva para traslado de materiales
- [ ] TeloEduca certifica técnicos de Repara/Instala (badge verificable)
- [ ] TeloSales vende accesorios que Instala puede montar (bundle)
- [ ] Wallet unificado del cliente (saldo reutilizable en todos los servicios)
- [ ] Programa de fidelización cross-service (puntos en cualquier vertical)

### Fase D — Inteligencia y Escala (4-6 semanas)
- [ ] IA predictiva: cuándo un AC necesita mantenimiento → push proactivo
- [ ] Matching inteligente: técnico ideal por servicio + zona + rating
- [ ] Pricing dinámico: ajustar tarifas por demanda/hora/zona
- [ ] Marketplace: técnicos y conductores independientes se registran
- [ ] White-label: empresas usan la plataforma con su marca
- [ ] API pública: third-parties integran servicios de TeloCorp

---

## 📊 RESUMEN EJECUTIVO — GAPS Y OPORTUNIDADES

| Vertical | Madurez Actual | Target Post-Rediseño | Revenue Model |
|----------|---------------|---------------------|---------------|
| TeloEduca | 20% (demo) | 85% (Udemy-like) | Venta de cursos + suscripción |
| TeloLleva | 35% (cotiza, no ejecuta) | 80% (Uber-like) | Comisión 15-20% por envío |
| TeloRepara | 25% (formulario) | 80% (Samsung Care) | Cobro por reparación + parts |
| TeloInstala | 30% (agenda básica) | 80% (TaskRabbit) | Comisión 20% + materiales |

### Revenue Potencial Mensual (estimado, mercado RD)

| Vertical | Órdenes/mes estimadas | Ticket promedio | Revenue bruto |
|----------|----------------------|-----------------|---------------|
| TeloEduca | 50 enrollments | RD$ 2,000 | RD$ 100,000 |
| TeloLleva | 300 envíos | RD$ 350 (comisión) | RD$ 105,000 |
| TeloRepara | 80 reparaciones | RD$ 2,500 | RD$ 200,000 |
| TeloInstala | 60 servicios | RD$ 3,500 | RD$ 210,000 |
| **Total** | **490** | | **RD$ 615,000** |

*(Proyección conservadora a 6 meses post-lanzamiento con marketing básico)*

---

*Documento generado por auditoría multi-disciplinaria. Complementa TELOSALES-AUDITORIA-REDISENO.md.*
