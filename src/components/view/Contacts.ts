import { cloneTemplate, ensureElement } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';

interface IContact {
	render(): HTMLElement;
}

export class ContactsView implements IContact {
	protected ContactsForm: HTMLFormElement;
	protected PhoneInput: HTMLInputElement;
	protected EmailInput: HTMLInputElement;
	protected nextButton: HTMLButtonElement;
	protected errorMessage: HTMLElement;

	constructor(template: HTMLTemplateElement, events: IEvents) {
		this.ContactsForm = cloneTemplate(template);
		this.PhoneInput = ensureElement(settings.contactsSettings.phone, this.ContactsForm) as HTMLInputElement;
		this.EmailInput = ensureElement(settings.contactsSettings.email, this.ContactsForm)as HTMLInputElement;
		this.nextButton = ensureElement(settings.formSettings.submitButton, this.ContactsForm) as HTMLButtonElement;
		this.errorMessage = ensureElement(settings.formSettings.formError, this.ContactsForm);
		[this.EmailInput, this.PhoneInput].forEach(cur => cur.addEventListener('change', () => {
			events.emit(AppStateChanges['contacts:changed'], {
				email: this.EmailInput.value,
				phone: this.PhoneInput.value,
			});
		}));
		this.ContactsForm.addEventListener('submit', (e)=>{
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
		return this.ContactsForm
	}
}


