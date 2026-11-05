import type { NextConfig } from "next";

/**
 * Sello de compilación. Se inyecta en el código del navegador y en el del
 * servidor; /api/version devuelve el del servidor, y si no coincide con el que
 * lleva la pestaña abierta es que hay una versión nueva. Ver
 * src/components/admin/AvisoVersion.tsx.
 *
 * El id del despliegue (o el commit) y no la hora: next.config se evalúa más de una vez durante la
 * compilación y una hora podría salir distinta en cada pasada.
 */
const BUILD_STAMP = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "dev";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_STAMP: BUILD_STAMP,
  },
};

export default nextConfig;
