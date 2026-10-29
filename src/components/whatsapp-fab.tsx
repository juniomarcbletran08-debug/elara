import { STORE, whatsappUrl } from "@/lib/config";

export function WhatsappFab() {
  return <a className="whatsapp-fab" href={whatsappUrl("Hola, quisiera información sobre la colección de " + STORE.name + ".")} target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp"><span aria-hidden="true">✳</span><span>¿Te ayudamos?</span></a>;
}
