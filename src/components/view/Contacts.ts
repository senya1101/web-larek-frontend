import { cloneTemplate, ensureElement } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';

interface IContact {
	render(): HTMLElement;
}

export class ContactsView implements IContact {
	protected contactsForm: HTMLFormElement;
	protected phoneInput: HTMLInputElement;
	protected emailInput: HTMLInputElement;
	protected nextButton: HTMLButtonElement;
	protected errorMessage: HTMLElement;

	constructor(template: HTMLTemplateElement, events: IEvents) {
		this.contactsForm = cloneTemplate(template);
		this.phoneInput = ensureElement(settings.contactsSettings.phone, this.contactsForm) as HTMLInputElement;
		this.emailInput = ensureElement(settings.contactsSettings.email, this.contactsForm)as HTMLInputElement;
		this.nextButton = ensureElement(settings.formSettings.submitButton, this.contactsForm) as HTMLButtonElement;
		this.errorMessage = ensureElement(settings.formSettings.formError, this.contactsForm);
		[this.emailInput, this.phoneInput].forEach(cur => cur.addEventListener('change', () => {
			events.emit(AppStateChanges['contacts:changed'], {
				email: this.emailInput.value,
				phone: this.phoneInput.value,
			});
		}));
		this.contactsForm.addEventListener('submit', (e)=>{
			e.preventDefault();
			events.emit(AppStateChanges['order:send'], {})
		})
	}

	set messageError(message: string) {
		this.errorMessage.textContent = message;
	}

	set isValid(isValid: boolean) {
		this.nextButton.disabled = !isValid;
	}

	render(): HTMLElement {
		return this.contactsForm
	}
}


