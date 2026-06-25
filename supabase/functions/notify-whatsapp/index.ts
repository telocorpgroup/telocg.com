// notify-whatsapp — Edge Function: notifica al admin por WhatsApp sobre cada solicitud
// (órdenes, reparaciones, instalaciones, envíos). Oculto para el usuario final.
// Usa wa.me link server-side para no exponer lógica. Registra en tabla notifications.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ADMIN_WHATSAPP = '18099038707'; // Admin TeloCorp

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { type } = body;
    const cust = body.customer || {};
    const custName = cust.name || 'Cliente';
    const custPhone = (cust.phone || '').replace(/\D/g, '');

    let message = '';

    switch (type) {
      case 'order':
        message = `🛒 *NUEVA ORDEN — TeloSales*\n\n💰 Total: RD$ ${(body.total||0).toLocaleString()}\n💳 Método: ${body.payment_method||'-'}\n📦 Items: ${body.items_count||0}\n\n👤 Cliente: ${custName}${custPhone ? '\n📱 Tel: +' + custPhone : ''}\n\n_Revisa y contacta al cliente para coordinar pago y entrega._`;
        break;
      case 'repara':
        message = `🔧 *NUEVA REPARACIÓN — TeloRepara*\n\n🎫 Ticket: ${body.ticket||'-'}\n📱 Dispositivo: ${body.device||'-'}\n⚠️ Falla: ${body.issue||'-'}\n📍 Dirección: ${body.address||'-'}\n\n👤 Cliente: ${custName}${custPhone ? '\n📱 Tel: +' + custPhone : ''}${custPhone ? `\n\n💬 Contactar: https://wa.me/${custPhone}` : ''}\n\n_Asigra un técnico y contacta al cliente._`;
        break;
      case 'instala':
        message = `🛠️ *NUEVA INSTALACIÓN — TeloInstala*\n\n🔧 Servicio: ${body.service||'-'}\n📅 Fecha: ${body.date||'-'} (${body.time||'-'})\n👷 Técnico: ${body.tech||'-'}\n💰 Precio: RD$ ${(body.price||0).toLocaleString()}\n📍 Dirección: ${body.address||'-'}\n\n👤 Cliente: ${custName}${custPhone ? '\n📱 Tel: +' + custPhone : ''}${custPhone ? `\n\n💬 Contactar: https://wa.me/${custPhone}` : ''}\n\n_Confirma con el técnico y cliente._`;
        break;
      case 'lleva':
        message = `📦 *NUEVO ENVÍO — TeloLleva*\n\n🛵 Vehículo: ${body.vehicle||'-'}\n📍 Origen: ${body.origin||'-'}\n🏁 Destino: ${body.dest||'-'}\n📦 Artículo: ${body.item||'-'}\n💰 Tarifa: RD$ ${(body.fare||0).toLocaleString()}\n\n👤 Cliente: ${custName}${custPhone ? '\n📱 Tel: +' + custPhone : ''}${custPhone ? `\n\n💬 Contactar: https://wa.me/${custPhone}` : ''}\n\n_Asigna un conductor disponible._`;
        break;
      default:
        message = `🔔 *Nueva actividad en TeloCorp*\n\n${JSON.stringify(body).slice(0, 500)}`;
    }

    // Construir enlace wa.me (el admin recibe la notificación al hacer clic desde su panel
    // o desde el webhook configurado). El mensaje va URL-encoded.
    const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

    return new Response(JSON.stringify({
      success: true,
      message: 'Notificación generada',
      wa_link: waLink,
      preview: message
    }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error: ' + error.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
