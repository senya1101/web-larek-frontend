import { PaymentType } from '../../types';
import { cloneTemplate, ensureElement, ensureAllElements } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';

interface IOrder {
	render(): HTMLElement;
}

export class OrderView implements IOrder {
	protected paymentAddressForm: HTMLFormElement;
	protected nextButton: HTMLButtonElement;
	protected paymentButtons: HTMLButtonElement[];
	protected addressInput: HTMLInputElement;
	protected formError: HTMLElement;
	protected paymentSelected: PaymentType;

	constructor(
		protected template: HTMLTemplateElement,
		protected events: IEvents
	) {
		const form = cloneTemplate(template);
		if (form instanceof HTMLFormElement) this.paymentAddressForm = form;
		else throw new Error('Unable to render Payment Address');

		this.nextButton = ensureElement(
			settings.formSettings.submitButton, this.paymentAddressForm
		) as HTMLButtonElement;

		this.addressInput = ensureElement(
			settings.orderSettings.address, this.paymentAddressForm
		) as HTMLInputElement;
		this.paymentButtons = Array.from(
			ensureAllElements(settings.orderSettings.buttons, this.paymentAddressForm)
		);
		this.paymentButtons.forEach((cur) =>
			cur.addEventListener('click', () => {
				this.paymentSelected = cur.name as PaymentType;
				this.paymentButtons.forEach((x) =>
					x.classList.toggle(settings.orderSettings.activeButtonClass)
				);
				this.events.emit(AppStateChanges['addressPayment:changed'], {
					address: this.addressInput.value,
					payment: this.paymentSelected,
				});
			})
		);
		this.paymentSelected = this.paymentButtons[0].name as PaymentType;
		this.paymentButtons[0].classList.toggle(
			settings.orderSettings.activeButtonClass
		);

		this.formError = ensureElement(
			settings.formSettings.formError, this.paymentAddressForm
		);

		this.addressInput.addEventListener('change', () => {
			this.events.emit(AppStateChanges['addressPayment:changed'], {
				address: this.addressInput.value,
				payment: this.paymentSelected,
			});
		});

		this.paymentAddressForm.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit(AppStateChanges['contacts:open']);
		});
	}

	set errorMessage(errorMessage: string) {
		this.formError.textContent = errorMessage;
	}

	set isValid(isValid: boolean) {
		this.nextButton.disabled = !isValid;
	}

	render(): HTMLElement {
		return this.paymentAddressForm;
	}
}
