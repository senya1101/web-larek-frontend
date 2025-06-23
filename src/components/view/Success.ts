import { IEvents } from '../base/events';
import { cloneTemplate } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { AppStateChanges } from '../model/AppStateModel';

interface ISuccess {
	render():HTMLElement;
}

export class SuccessView implements ISuccess {
	protected totalElement: HTMLElement;
	protected closeButton: HTMLButtonElement;
	protected successContent: HTMLElement;

	constructor(template: HTMLTemplateElement, events: IEvents) {
		this.successContent = cloneTemplate(template)
		this.closeButton = this.successContent.querySelector(settings.successSettings.closeButton);
		this.totalElement = this.successContent.querySelector(settings.successSettings.total);

		this.closeButton.addEventListener('click', () => {
			events.emit(AppStateChanges['success:close'], {})
		})
	}

	set total(total: number) {
		this.totalElement.textContent = `Списано ${settings.formatPrice(total)}`
	}

	render(): HTMLElement {
		return this.successContent;
	}
}