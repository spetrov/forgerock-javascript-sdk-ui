import { ConfirmationCallback } from '@forgerock/javascript-sdk';
import { el } from '../../util/dom';
import {
  CallbackRenderer,
  DestroyableCallbackRenderer,
  FocusableCallbackRenderer,
} from '../interfaces';

/** @hidden */
interface ConfirmationButton {
  element: HTMLButtonElement;
  handler: (e: MouseEvent) => void;
}

/**
 * Renders a message and a set of buttons, one for each option in the callback.
 */
class ConfirmationCallbackRenderer
  implements DestroyableCallbackRenderer, FocusableCallbackRenderer {
  private buttons!: ConfirmationButton[];

  /**
   * @param callback The callback to render
   * @param index The index position in the step's callback array
   * @param onChange A function to call when the callback value is changed
   */
  constructor(
    private callback: ConfirmationCallback,
    private index: number,
    private onChange: (renderer: CallbackRenderer) => void,
  ) {}

  /**
   * Removes event listeners.
   */
  public destroy = () => {
    this.buttons.forEach((x) => x.element.removeEventListener('click', x.handler));
    this.buttons = [];
  };

  /**
   * Sets the focus on the first button.
   */
  public focus = () => this.buttons[0].element.focus();

  /**
   * Creates all required DOM elements and returns the containing element.
   */
  public render = () => {
    const formGroup = el<HTMLDivElement>('div', `fr-callback-${this.index} form-group`);
    const formLabelGroup = el<HTMLDivElement>('div', 'form-label-group');

    // Add the prompt
    const prompt = this.callback.getPrompt();
    if (prompt) {
      const label = el<HTMLLabelElement>('label');
      label.innerHTML = prompt;
      formLabelGroup.appendChild(label);
    }

    // Add the buttons
    const defaultOption = this.callback.getDefaultOption();
    this.buttons = this.callback.getOptions().map((x, i) => {
      const handler = () => this.onInput(i);
      const element = el<HTMLButtonElement>('button');
      element.className = defaultOption === i ? 'btn btn-primary' : 'btn';
      element.innerHTML = x;
      element.addEventListener('click', handler);
      return { element, handler };
    });
    this.buttons.forEach((x) => formLabelGroup.appendChild(x.element));

    return formGroup;
  };

  private onInput = (index: number) => {
    this.callback.setInputValue(index);
    this.onChange(this);
  };
}

export default ConfirmationCallbackRenderer;
