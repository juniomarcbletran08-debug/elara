import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.env.ADMIN_PASSWORD_TO_HASH;
if (!password || password.length < 14) {
  console.error("Define ADMIN_PASSWORD_TO_HASH con una contraseña de al menos 14 caracteres y vuelve a ejecutar este script.");
  process.exit(1);
}
const iterations = 210000;
const salt = randomBytes(16).toString("hex");
const derived = pbkdf2Sync(password, Buffer.from(salt, "hex"), iterations, 32, "sha256").toString("hex");
console.log("ADMIN_PASSWORD_HASH=pbkdf2$" + iterations + "$" + salt + "$" + derived);
console.log("Copia el valor en el gestor de secretos del entorno; no lo guardes en Git.");
