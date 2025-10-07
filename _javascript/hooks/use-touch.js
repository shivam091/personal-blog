export default function useTouch() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
