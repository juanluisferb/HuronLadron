// La pantalla interna mide el doble (448 px de alto) para que el mundo tenga más detalle.
// Las escenas de interfaz trabajan en coordenadas "lógicas" de 224 px de alto con zoom 2.
export const ZOOM = 2;

/** Configura la cámara principal con zoom 2 anclado arriba a la izquierda y devuelve el tamaño lógico. */
export function uiView(scene) {
  const cam = scene.cameras.main;
  cam.setZoom(ZOOM);
  cam.setOrigin(0, 0);
  return { W: Math.round(scene.scale.width / ZOOM), H: Math.round(scene.scale.height / ZOOM) };
}
