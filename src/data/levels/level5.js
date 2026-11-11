// Nivel 5 — La casa grande: diez estancias, pasillo largo y dos humanos vigilando.
import { carve } from './build.js';

export default {
  id: 5,
  name: 'La casa grande',
  subtitle: 'Muchas habitaciones, mucho botín y dos humanos',
  theme: 5,
  duration: 360,
  quota: [200, 330, 460],
  map: carve(44, 26, [
    [1, 1, 10, 9, '.'],    // dormitorio principal
    [12, 1, 6, 9, ','],    // baño
    [19, 1, 8, 9, '.'],    // despacho
    [28, 1, 7, 9, '_'],    // cuarto infantil
    [36, 1, 7, 9, ','],    // cocina
    [1, 11, 42, 2, '.'],   // pasillo
    [1, 14, 16, 11, '.'],  // salón
    [18, 14, 11, 11, '.'], // comedor
    [30, 14, 5, 11, ','],  // lavadero
    [36, 14, 7, 11, '.'],  // recibidor
    [3, 18, 8, 5, '_'],    // alfombra del salón
  ], [
    [5, 10, 'D'], [14, 10, 'D'], [22, 10, 'd'], [31, 10, 'D'], [39, 10, 'D'],
    [8, 13, 'D'], [12, 13, 'd'], [23, 13, 'D'], [32, 13, 'd'], [39, 13, 'D'],
    [17, 19, 'D'], [29, 19, 'D'], [35, 20, 'd'],
  ]),
  start: { x: 5, y: 5 },
  furniture: [
    { type: 'bed', x: 1, y: 1 },
    { type: 'burrow', x: 2, y: 2 },
    { type: 'nightstand', x: 3, y: 1, id: 'mesilla' },
    { type: 'wardrobe', x: 8, y: 1 },
    { type: 'drawer', x: 1, y: 8, id: 'comoda' },
    { type: 'bathtub', x: 12, y: 1 }, { type: 'sink', x: 15, y: 1 }, { type: 'toilet', x: 17, y: 1 },
    { type: 'desk', x: 20, y: 1 }, { type: 'chair', x: 20, y: 2 }, { type: 'bookshelf', x: 24, y: 1 },
    { type: 'drawer', x: 25, y: 8, id: 'cajonera' },
    { type: 'bed', x: 28, y: 1 }, { type: 'drawer', x: 32, y: 1, id: 'juguetes' }, { type: 'plant', x: 34, y: 8 },
    { type: 'counter', x: 36, y: 1 }, { type: 'counter', x: 37, y: 1 }, { type: 'stove', x: 38, y: 1 },
    { type: 'counter', x: 39, y: 1 }, { type: 'counter', x: 40, y: 1 }, { type: 'fridge', x: 42, y: 1 },
    { type: 'table', x: 38, y: 5 }, { type: 'chair', x: 37, y: 5 }, { type: 'chair', x: 40, y: 6 },
    { type: 'sofa', x: 4, y: 18 },
    { type: 'armchair', x: 8, y: 18 },
    { type: 'tv', x: 4, y: 23 },
    { type: 'fireplace', x: 12, y: 14 },
    { type: 'bookshelf', x: 14, y: 14 },
    { type: 'piano', x: 12, y: 23 },
    { type: 'plant', x: 1, y: 14 },
    { type: 'table', x: 21, y: 17 }, { type: 'table', x: 23, y: 17 },
    { type: 'chair', x: 20, y: 17 }, { type: 'chair', x: 25, y: 18 },
    { type: 'drawer', x: 19, y: 23, id: 'aparador' },
    { type: 'plant', x: 28, y: 14 },
    { type: 'washer', x: 30, y: 14 }, { type: 'washer', x: 31, y: 14 }, { type: 'basket', x: 33, y: 14, id: 'cesta' },
    { type: 'coatrack', x: 42, y: 15, id: 'abrigo' },
    { type: 'shoerack', x: 36, y: 23, id: 'zapatero' },
    { type: 'bag', x: 41, y: 23, id: 'bolso' },
    { type: 'playpen', x: 37, y: 16 },
  ],
  playpenExit: { x: 39, y: 17 },
  laundryZone: { x: 30, y: 14, w: 5, h: 11 },
  tubes: [[{ x: 10, y: 1 }, { x: 36, y: 8 }], [{ x: 17, y: 8 }, { x: 34, y: 24 }]],
  tv: { x: 4, y: 23, watch: [{ x: 5, y: 21 }, { x: 7, y: 21 }] },
  sofaSpot: { x: 5, y: 20 },
  items: [
    { id: 'earring', in: 'mesilla' },
    { id: 'sock_red', in: 'comoda' }, { id: 'sock_red', x: 7, y: 6 },
    { id: 'lipstick', x: 13, y: 7 }, { id: 'hairtie', x: 16, y: 5 },
    { id: 'pen', x: 21, y: 4 }, { id: 'coin', in: 'cajonera' }, { id: 'sunglasses', x: 26, y: 5 },
    { id: 'ball', in: 'juguetes' }, { id: 'frisbee', x: 31, y: 6 }, { id: 'sock_blue', x: 29, y: 7 },
    { id: 'spoon', x: 37, y: 3 }, { id: 'spoon', x: 41, y: 7 }, { id: 'cap', x: 36, y: 4 },
    { id: 'remote', x: 10, y: 21 },
    { id: 'phone', x: 2, y: 23 },
    { id: 'sock_wool', x: 13, y: 12 },
    { id: 'coin', x: 26, y: 22 }, { id: 'glove', x: 19, y: 15 },
    { id: 'sock_blue', in: 'cesta' }, { id: 'sock_yellow', in: 'cesta' }, { id: 'sock_yellow', x: 33, y: 22 },
    { id: 'wallet', in: 'abrigo' }, { id: 'keys', x: 40, y: 18 },
    { id: 'slipper', in: 'zapatero' },
    { id: 'phone', in: 'bolso' }, { id: 'lipstick', in: 'bolso' },
    { id: 'treat', x: 27, y: 11 },
    { id: 'clothespin', x: 31, y: 23 },
  ],
  owners: [
    {
      name: 'Dueño', skin: 'owner', start: { x: 38, y: 3 },
      routine: {
        calm: [
          { x: 38, y: 3, wait: 7, act: 'cook', face: -90, say: '¿Qué hacemos de cena?' },
          { x: 21, y: 3, wait: 7, act: 'phone', face: -90, say: 'Reunión por vídeo...' },
          { x: 6, y: 21, wait: 8, act: 'sit', face: 90, say: '¡Empieza el partido!' },
          { x: 31, y: 18, wait: 5, act: 'wash', face: -90, say: 'Pongo una lavadora.' },
          { x: 39, y: 20, wait: 3, act: 'look', face: 0 },
          { x: 6, y: 4, wait: 4, act: 'look', face: 180 },
        ],
        alert: [
          { x: 6, y: 5, wait: 3, act: 'look', face: 180, say: 'Que no se acerque a mi mesilla...' },
          { x: 22, y: 12, wait: 3, act: 'look', face: 0 },
          { x: 23, y: 20, wait: 3, act: 'look', face: 180 },
          { x: 39, y: 20, wait: 3, act: 'look', face: 90 },
          { x: 30, y: 5, wait: 3, act: 'look', face: 90 },
        ],
        paranoid: [
          { x: 4, y: 5, wait: 2, act: 'look', face: 180 },
          { x: 14, y: 12, wait: 2, act: 'look', face: 0 },
          { x: 33, y: 12, wait: 2, act: 'look', face: 180 },
          { x: 40, y: 20, wait: 2, act: 'look', face: 90 },
          { x: 10, y: 16, wait: 2, act: 'look', face: 0 },
        ],
      },
    },
    {
      name: 'Pareja', skin: 'partner', start: { x: 22, y: 20 }, speed: 0.9,
      lines: {
        missing: '¿Quién ha cogido mi {item}?',
        hear: ['¿Eres tú, cariño?', '¿Qué ha sido ese ruido?'],
        chase: ['¡El hurón! ¡Que se escapa!', '¡Ven aquí, granuja!'],
        caught: '¡Te pillé, ladronzuelo!',
        tv: '¡Mi concurso favorito!',
        giveUp: 'Serán cosas mías.',
      },
      routine: {
        calm: [
          { x: 22, y: 20, wait: 8, act: 'sit', face: -90, say: 'Termino de leer el periódico.' },
          { x: 14, y: 5, wait: 6, act: 'wash', face: -90 },
          { x: 31, y: 4, wait: 5, act: 'look', face: 180, say: 'Recojo los juguetes del peque.' },
          { x: 40, y: 21, wait: 4, act: 'look', face: 90, say: '¿Y mi bolso?' },
          { x: 13, y: 21, wait: 5, act: 'look', face: 90, say: 'Un poco de piano...' },
        ],
        alert: [
          { x: 40, y: 21, wait: 4, act: 'look', face: 90, say: 'Vigilo el recibidor.' },
          { x: 24, y: 15, wait: 3, act: 'look', face: 90 },
          { x: 8, y: 12, wait: 3, act: 'look', face: 0 },
          { x: 33, y: 20, wait: 3, act: 'look', face: 180 },
        ],
      },
    },
  ],
  hints: [
    { x: 1, y: 1, w: 10, h: 9, text: 'Casa grande: dos humanos y diez habitaciones. Usa los tubos para cruzarla rápido.' },
    { x: 1, y: 11, w: 42, h: 2, text: 'En el pasillo se te ve desde lejos. ¡Cuidado!' },
  ],
};
