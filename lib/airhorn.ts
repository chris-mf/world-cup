const SOUNDS = [
  '/sound1.mp3',
  '/sound2.mp3',
];

let currentIndex = 0;

export function playAirHorn(): void {
  const audio = new Audio(SOUNDS[currentIndex]);
  audio.play().catch(() => {});
  currentIndex = (currentIndex + 1) % SOUNDS.length;
}
