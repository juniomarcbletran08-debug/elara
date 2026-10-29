"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPEN } from "@/lib/format";

type Item = {
  product_name: string;
  variant_label: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_city: string;
  channel: string;
  status: string;
  payment_status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  created_at: string;
  items: Item[];
};

const labels: Record<string, string> = {
  pending_confirmation: "Pendiente de confirmar",
  confirmed: "Solicitud confirmada",
  pending_payment: "Pendiente de pago",
  paid: "Pagado",
  payment_rejected: "Pago rechazado",
  payment_setup_failed: "Checkout fallido",
  cancelled: "Cancelado",
  fulfilled: "Completado",
  needs_review: "En revisión",
};

type NextStatus = "confirmed" | "fulfilled" | "cancelled";

export function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los pedidos.");
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error de red.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(order: Order, status: NextStatus) {
    const prompt =
      status === "confirmed"
        ? "¿Confirmar esta solicitud de WhatsApp?"
        : status === "fulfilled"
          ? "¿Marcar este pedido como completado?"
          : "¿Cancelar esta solicitud?";
    if (!window.confirm(prompt)) return;

    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el pedido.");
      }
      setNotice("Pedido actualizado.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error de red.");
    }
  }

  if (loading) {
    return (
      <section className="admin-panel">
        <p className="admin-muted">Cargando pedidos…</p>
      </section>
    );
  }

  return (
    <section className="admin-panel">
      <div className="admin-top">
        <h2 className="admin-title" style={{ fontSize: 28 }}>Últimos pedidos</h2>
        <button className="button" type="button" onClick={() => void load()}>
          Actualizar ↻
        </button>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-success" role="status">{notice}</p>}

      {orders.length === 0 ? (
        <p className="admin-muted">No hay pedidos registrados.</p>
      ) : (
        <div className="admin-products">
          {orders.map((order) => (
            <article key={order.id} className="admin-product admin-order">
              <div className="admin-order-top">
                <span className="admin-tag">
                  {labels[order.status] || order.status.replaceAll("_", " ")}
                </span>
                <strong>{order.order_number}</strong>
                <time>
                  {new Date(order.created_at + "Z").toLocaleString("es-PE")}
                </time>
              </div>

              <h3>
                {order.customer_name} · {formatPEN(order.total_cents / 100)}
              </h3>
              <p>
                {order.customer_phone}
                {order.customer_email ? " · " + order.customer_email : ""}
                {order.shipping_city ? " · " + order.shipping_city : ""}
              </p>
              <p>
                Canal: {order.channel === "whatsapp" ? "WhatsApp" : "Mercado Pago"}
                {" · "}Pago: {order.payment_status}
              </p>

              <div className="admin-order-lines">
                {order.items.map((item, index) => (
                  <p key={index}>
                    {item.product_name} · {item.variant_label} × {item.quantity}
                    {" — "}{formatPEN(item.line_total_cents / 100)}
                  </p>
                ))}
              </div>

              <div className="admin-actions">
                {order.channel === "whatsapp" &&
                  order.status === "pending_confirmation" && (
                    <button
                      className="button"
                      type="button"
                      onClick={() => void update(order, "confirmed")}
                    >
                      Confirmar solicitud
                    </button>
                  )}

                {(order.payment_status === "approved" ||
                  (order.channel === "whatsapp" && order.status === "confirmed")) &&
                  order.status !== "fulfilled" && (
                    <button
                      className="button"
                      type="button"
                      onClick={() => void update(order, "fulfilled")}
                    >
                      Marcar completado
                    </button>
                  )}

                {order.payment_status !== "approved" &&
                  order.status !== "cancelled" &&
                  order.status !== "fulfilled" && (
                    <button
                      className="button"
                      type="button"
                      onClick={() => void update(order, "cancelled")}
                    >
                      Cancelar pedido
                    </button>
                  )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
