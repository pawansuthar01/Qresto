"use client";

class NotificationSound {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private isPlaying: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async playOrderAlert() {
    if (!this.enabled || !this.audioContext || this.isPlaying) return;

    try {
      this.isPlaying = true;

      // Create oscillator for "ding" sound (single play, no loop)
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        this.audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.5
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

      // Single second ding
      setTimeout(() => {
        const osc2 = this.audioContext!.createOscillator();
        const gain2 = this.audioContext!.createGain();

        osc2.connect(gain2);
        gain2.connect(this.audioContext!.destination);

        osc2.frequency.setValueAtTime(1000, this.audioContext!.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(
          500,
          this.audioContext!.currentTime + 0.1
        );

        gain2.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext!.currentTime + 0.5
        );

        osc2.start(this.audioContext!.currentTime);
        osc2.stop(this.audioContext!.currentTime + 0.5);

        setTimeout(() => {
          this.isPlaying = false;
        }, 500);
      }, 200);
    } catch (error) {
      console.error("Error playing notification sound:", error);
      this.isPlaying = false;
    }
  }

  async playStatusUpdate() {
    if (!this.enabled || !this.audioContext || this.isPlaying) return;

    try {
      this.isPlaying = true;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.3
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      setTimeout(() => {
        this.isPlaying = false;
      }, 300);
    } catch (error) {
      console.error("Error playing status update sound:", error);
      this.isPlaying = false;
    }
  }

  async playSuccess() {
    if (!this.enabled || !this.audioContext || this.isPlaying) return;

    try {
      this.isPlaying = true;
      const notes = [523.25, 659.25, 783.99];

      notes.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext!.createOscillator();
          const gainNode = this.audioContext!.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext!.destination);

          oscillator.frequency.setValueAtTime(
            freq,
            this.audioContext!.currentTime
          );
          gainNode.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext!.currentTime + 0.2
          );

          oscillator.start(this.audioContext!.currentTime);
          oscillator.stop(this.audioContext!.currentTime + 0.2);

          if (index === notes.length - 1) {
            setTimeout(() => {
              this.isPlaying = false;
            }, 200);
          }
        }, index * 100);
      });
    } catch (error) {
      console.error("Error playing success sound:", error);
      this.isPlaying = false;
    }
  }

  async requestPermission() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}

export const notificationSound = new NotificationSound();
