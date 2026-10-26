/**
 * Temporizador de Descanso Inteligente com Web Audio API e Vibração
 */

class RestTimer {
  constructor() {
    this.totalSeconds = 90;
    this.remainingSeconds = 0;
    this.timerId = null;
    this.isRunning = false;
    this.audioCtx = null;
    this.onTickCallbacks = [];
    this.onFinishCallbacks = [];
  }

  // Inicializa contexto de áudio sob demanda (após interação do usuário)
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Toca som sintético de beep de academia sem precisar carregar MP3 externo
  playTone(frequency, duration, type = 'sine') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Não foi possível tocar áudio de aviso:", e);
    }
  }

  vibrate(pattern = [200, 100, 300]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignora se bloqueado
      }
    }
  }

  start(seconds) {
    if (seconds !== undefined) {
      this.totalSeconds = seconds;
      this.remainingSeconds = seconds;
    } else if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.totalSeconds;
    }

    this.stop();
    this.isRunning = true;
    this.notifyTick();

    this.timerId = setInterval(() => {
      this.remainingSeconds--;

      // Beeps nos últimos 3 segundos
      if (this.remainingSeconds === 3 || this.remainingSeconds === 2 || this.remainingSeconds === 1) {
        this.playTone(660, 0.15); // Beep agudo de aviso
      }

      if (this.remainingSeconds <= 0) {
        this.remainingSeconds = 0;
        this.stop();
        this.finish();
      } else {
        this.notifyTick();
      }
    }, 1000);
  }

  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    this.notifyTick();
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.remainingSeconds = this.totalSeconds;
    this.notifyTick();
  }

  addTime(seconds) {
    this.remainingSeconds += seconds;
    this.totalSeconds = Math.max(this.totalSeconds, this.remainingSeconds);
    this.notifyTick();
  }

  finish() {
    // Som vibrante de fim de descanso
    this.playTone(880, 0.35, 'triangle');
    setTimeout(() => this.playTone(1100, 0.5, 'sine'), 180);
    this.vibrate([300, 150, 400]);

    this.notifyTick();
    this.onFinishCallbacks.forEach(cb => cb());
  }

  onTick(callback) {
    this.onTickCallbacks.push(callback);
  }

  onFinish(callback) {
    this.onFinishCallbacks.push(callback);
  }

  notifyTick() {
    const formatted = this.getFormattedTime();
    const progress = this.totalSeconds > 0 ? (this.remainingSeconds / this.totalSeconds) : 0;
    this.onTickCallbacks.forEach(cb => cb({
      remaining: this.remainingSeconds,
      total: this.totalSeconds,
      formatted,
      progress,
      isRunning: this.isRunning
    }));
  }

  getFormattedTime() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

export const timerInstance = new RestTimer();
