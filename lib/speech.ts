/**
 * Speaks Japanese text aloud using the browser's built-in Web Speech API.
 * No external service or API key required. Silently no-ops in unsupported
 * environments (SSR, older browsers) instead of throwing.
 */
export function speakJapanese(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;

  window.speechSynthesis.cancel(); // stop anything currently playing

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find((voice) => voice.lang.startsWith("ja"));
  if (japaneseVoice) utterance.voice = japaneseVoice;

  window.speechSynthesis.speak(utterance);
}
