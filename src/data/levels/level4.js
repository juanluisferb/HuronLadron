// Nivel 4 — El jardín: exterior con césped, terraza, estanque, setos y caseta de herramientas.
// La madriguera es un agujero dentro de la caseta del perro (que ya no vive aquí).
import { carve } from './build.js';

export default {
  id: 4,
  name: 'El jardín',
  subtitle: 'Al aire libre: setos, flores y una barbacoa con botín',
  theme: 4,
  duration: 300,
  quota: [150, 250, 360],
  map: carve(36, 22, [
    [1, 1, 34, 20, 'g'],   // césped
    [1, 1, 12, 5, ','],    // terraza
    [24, 1, 10, 5, 's'],   // huerto
    [6, 6, 2, 15, 'p'],    // camino norte-sur
    [8, 12, 19, 2, 'p'],   // camino este-oeste
    [27, 13, 8, 8, '#'],   // caseta de herramientas (paredes)
    [28, 14, 6, 6, '.'],   // interior de la caseta
  ], [
    [27, 17, 'd'], [30, 13, 'D'],
  ]),
  start: { x: 4, y: 16 },
  furniture: [
    { type: 'doghouse', x: 2, y: 17 },
    { type: 'burrow', x: 2, y: 18, look: 'hole' },
    { type: 'sofa', x: 1, y: 1 },
    { type: 'patiotable', x: 6, y: 2 },
    { type: 'chair', x: 5, y: 2 }, { type: 'chair', x: 8, y: 3 },
    { type: 'bbq', x: 11, y: 1 },
    { type: 'sunbed', x: 10, y: 3 },
    { type: 'clothesline', x: 14, y: 2, id: 'tendedero' },
    { type: 'pond', x: 16, y: 8 },
    { type: 'tree', x: 1, y: 8 }, { type: 'tree', x: 12, y: 16 }, { type: 'tree', x: 20, y: 2 }, { type: 'tree', x: 31, y: 8 },
    { type: 'hedge', x: 21, y: 15 }, { type: 'hedge', x: 21, y: 16 }, { type: 'hedge', x: 21, y: 17 }, { type: 'hedge', x: 21, y: 18 },
    { type: 'hedge', x: 9, y: 7 }, { type: 'hedge', x: 10, y: 7 }, { type: 'hedge', x: 24, y: 7 }, { type: 'hedge', x: 25, y: 7 },
    { type: 'flowerbed', x: 10, y: 9 }, { type: 'flowerbed', x: 22, y: 10 }, { type: 'flowerbed', x: 15, y: 19 },
    { type: 'flowerbed', x: 26, y: 3 }, { type: 'flowerbed', x: 30, y: 3 },
    { type: 'bench', x: 17, y: 16 },
    { type: 'hedge', x: 13, y: 12 }, { type: 'hedge', x: 4, y: 11 }, { type: 'hedge', x: 27, y: 10 },
    { type: 'flowerbed', x: 4, y: 7 }, { type: 'flowerbed', x: 24, y: 15 }, { type: 'bench', x: 9, y: 14 },
    { type: 'toolbox', x: 33, y: 14, id: 'herramientas' },
    { type: 'wheelbarrow', x: 28, y: 19, id: 'carretilla' },
    { type: 'playpen', x: 8, y: 18 },
  ],
  playpenExit: { x: 10, y: 19 },
  tubes: [[{ x: 33, y: 19 }, { x: 12, y: 5 }]],
  sofaSpot: { x: 2, y: 4 },
  items: [
    { id: 'sock_green', in: 'tendedero' }, { id: 'sock_green', in: 'tendedero' }, { id: 'sock_yellow', in: 'tendedero' },
    { id: 'sock_yellow', x: 23, y: 18 },
    { id: 'clothespin', x: 16, y: 4 },
    { id: 'tongs', x: 12, y: 3 },
    { id: 'phone', x: 9, y: 4 },
    { id: 'sunglasses', x: 11, y: 5 },
    { id: 'sock_wool', x: 3, y: 4 },
    { id: 'frisbee', x: 14, y: 10 },
    { id: 'ball', x: 25, y: 16 },
    { id: 'coin', x: 18, y: 14 },
    { id: 'earring', x: 23, y: 10 },
    { id: 'trowel', in: 'herramientas' }, { id: 'glove', in: 'herramientas' },
    { id: 'wallet', in: 'carretilla' },
    { id: 'keys', x: 31, y: 16 },
    { id: 'treat', x: 19, y: 19 },
    { id: 'slipper', x: 4, y: 5 },
    { id: 'spoon', x: 7, y: 5 },
    { id: 'hairtie', x: 28, y: 4 },
    { id: 'glove', x: 32, y: 2 },
  ],
  owners: [
    {
      name: 'Dueño', skin: 'gardener', start: { x: 29, y: 2 },
      lines: { hear: ['¿Un gato en los setos?', '¿Qué ha sido eso?'], missing: '¿Dónde he dejado mi {item}?' },
      routine: {
        calm: [
          { x: 29, y: 2, wait: 7, act: 'look', face: 90, say: 'A regar las tomateras.' },
          { x: 12, y: 2, wait: 6, act: 'cook', face: -90, say: '¡Barbacoa en marcha!' },
          { x: 15, y: 11, wait: 4, act: 'look', face: 0, say: 'Qué bonito está el estanque.' },
          { x: 30, y: 16, wait: 6, act: 'look', face: 0, say: 'Busco las tijeras de podar...' },
          { x: 15, y: 4, wait: 5, act: 'wash', face: -90, say: 'Tiendo la ropa.' },
          { x: 7, y: 15, wait: 3, act: 'look', face: 180 },
        ],
        alert: [
          { x: 24, y: 13, wait: 3, act: 'look', face: 180, say: 'Algo se mueve entre las flores...' },
          { x: 12, y: 2, wait: 3, act: 'look', face: 90 },
          { x: 5, y: 14, wait: 3, act: 'look', face: 180 },
          { x: 30, y: 16, wait: 3, act: 'look', face: 0 },
          { x: 18, y: 6, wait: 3, act: 'look', face: 90 },
        ],
        paranoid: [
          { x: 5, y: 15, wait: 2, act: 'look', face: 180, say: '¡Sé que estás ahí!' },
          { x: 24, y: 12, wait: 2, act: 'look', face: 0 },
          { x: 31, y: 18, wait: 2, act: 'look', face: 90 },
          { x: 13, y: 6, wait: 2, act: 'look', face: 180 },
          { x: 19, y: 15, wait: 2, act: 'look', face: 90 },
        ],
      },
    },
    {
      name: 'Pareja', skin: 'partner', start: { x: 14, y: 6 }, speed: 0.85,
      lines: { missing: '¿Has visto mis {item}?', hear: ['¿Hola?', '¿Eso ha sido un bicho?'], tv: 'Voy a ver qué pasa.' },
      routine: {
        calm: [
          { x: 14, y: 6, wait: 14, act: 'sit', face: -90, say: 'Qué solecito más rico. Zzz...' },
          { x: 3, y: 6, wait: 5, act: 'phone', face: -90, say: 'Te mando una foto del jardín.' },
          { x: 16, y: 14, wait: 4, act: 'look', face: 0 },
        ],
        alert: [
          { x: 14, y: 6, wait: 5, act: 'look', face: 90 },
          { x: 4, y: 12, wait: 4, act: 'look', face: 90, say: 'Vigilo la caseta del perro.' },
          { x: 14, y: 14, wait: 4, act: 'look', face: 0 },
        ],
      },
    },
  ],
  hints: [
    { x: 1, y: 14, w: 7, h: 7, text: 'En el jardín tu madriguera es el agujero de la caseta del perro.' },
    { x: 8, y: 8, w: 18, h: 6, text: 'Las flores y los bancos te esconden. El césped amortigua tus pasos.' },
    { x: 13, y: 1, w: 6, h: 4, text: 'El tendedero tiene calcetines. ¡Rebusca!' },
  ],
};
