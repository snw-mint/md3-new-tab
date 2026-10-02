interface VoiceSearchOptions {
  voiceSearchBtn: HTMLButtonElement | null;
  searchInput: HTMLInputElement | null;
  searchForm: HTMLFormElement | null;
}

export function initVoiceSearch(options: VoiceSearchOptions) {
  const { voiceSearchBtn, searchInput, searchForm } = options;
  if (!voiceSearchBtn || !searchInput) {
    return { trigger: () => {} };
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return { trigger: () => {} };
  }

  let audioUrl = 'assets/sfx/mic.opus';
  if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
    audioUrl = chrome.runtime.getURL('assets/sfx/mic.opus');
  }
  const micAudio = new Audio(audioUrl);
  micAudio.volume = 0.4;
  try {
    micAudio.load();
  } catch {}

  let recognitionInstance: any = null;
  let isListening = false;
  let lastClickTime = 0;

  const safelyTerminate = () => {
    isListening = false;
    voiceSearchBtn.classList.remove('recording');
    voiceSearchBtn.setAttribute('aria-pressed', 'false');
    if (recognitionInstance) {
      try {
        recognitionInstance.abort();
      } catch {}
    }
  };

  const toggleVoice = () => {
    const now = Date.now();
    if (now - lastClickTime < 400) return;
    lastClickTime = now;

    if (isListening) {
      safelyTerminate();
      return;
    }

    try {
      if (!recognitionInstance) {
        recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;

        recognitionInstance.onstart = () => {
          isListening = true;
          voiceSearchBtn.classList.add('recording');
          voiceSearchBtn.setAttribute('aria-pressed', 'true');
          try {
            micAudio.currentTime = 0;
            micAudio.play().catch((err) => console.log('SFX play blocked:', err));
          } catch (e) {
            console.warn('Audio system unavailable:', e);
          }
        };

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript && searchInput) {
            searchInput.value = transcript;
            if (searchForm) {
              if (typeof searchForm.requestSubmit === 'function') {
                searchForm.requestSubmit();
              } else {
                searchForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }
            }
          }
        };

        recognitionInstance.onerror = () => {
          safelyTerminate();
        };

        recognitionInstance.onend = () => {
          safelyTerminate();
        };
      }

      const currentLang = localStorage.getItem('userLanguage') || 'en_US';
      recognitionInstance.lang = currentLang.replace('_', '-');
      recognitionInstance.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      safelyTerminate();
    }
  };

  voiceSearchBtn.addEventListener('click', toggleVoice);

  return {
    trigger: toggleVoice,
  };
}
