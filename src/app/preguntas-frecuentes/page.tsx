import type { Metadata } from "next";
export const metadata: Metadata = { title: "Preguntas frecuentes" };
const items = [
  ["¿Cómo puedo consultar la disponibilidad?", "Escríbenos por WhatsApp e indica el producto, talla y color que te interesan. La disponibilidad debe confirmarse antes de realizar el pago."],
  ["¿Cómo funcionan los pedidos por WhatsApp?", "El enlace prepara un mensaje que puedes revisar y enviar manualmente. La solicitud no constituye una compra pagada ni confirma stock por sí sola."],
  ["¿Qué medios de pago estarán disponibles?", "Se habilitará Mercado Pago cuando las credenciales y las notificaciones de pago hayan sido configuradas y verificadas. Nunca compartas datos de tarjeta por WhatsApp."],
  ["¿Cómo consulto los envíos y devoluciones?", "Consulta las condiciones publicadas en la página de envíos. Los plazos y costes finales deben confirmarse según tu destino y el pedido."]
];
export default function FAQPage() { return <div className="page-shell"><p className="page-kicker">Información clara</p><h1 className="page-title">Preguntas frecuentes.</h1><div className="policy-copy">{items.map(([q,a])=><section key={q}><h2>{q}</h2><p>{a}</p></section>)}</div></div>; }
