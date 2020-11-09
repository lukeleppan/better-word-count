export class StatusBar {
  private statusBarEl: HTMLElement;

  constructor(statusBarEl: HTMLElement) {
    this.statusBarEl = statusBarEl;
  }

  displayText(text: string) {
    this.statusBarEl.setText(text);
  }
}
