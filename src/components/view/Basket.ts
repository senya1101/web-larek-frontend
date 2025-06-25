import { cloneTemplate, ensureElement } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';



interface IBasket {
	render(): HTMLElement;
}

export class BasketView implements IBasket {
	protected basket: HTMLElement;
	protected basketTotal: HTMLElement;
	protected basketList: HTMLElement;
	protected basketOrderButton: HTMLButtonElement;
	protected basketHeaderButton: HTMLButtonElement;
	protected basketHeaderCount: HTMLElement


	constructor({template, events, count, total}:{template: HTMLTemplateElement, events: IEvents, count: number, total:number}) {
		this.basket = cloneTemplate(template);
		this.basketTotal = ensureElement(settings.basketSettings.total, this.basket);
		this.basketList = ensureElement(settings.basketSettings.list, this.basket);
		this.basketHeaderButton = ensureElement(settings.basketSettings.headerButton) as HTMLButtonElement;
		this.basketHeaderCount = ensureElement(settings.basketSettings.headerCount);

		this.basketHeaderButton.addEventListener('click', () => {
			events.emit(AppStateChanges['basket:open']);
		});

		this.basketOrderButton = ensureElement(settings.basketSettings.orderButton, this.basket) as HTMLButtonElement
		this.basketOrderButton.addEventListener('click', () => {
			events.emit(AppStateChanges['addressPayment:open']);
		});

		this.total = total;
		this.count = count
	}


	set count(count: number) {
		this.basketHeaderCount.textContent = `${count}`;
	}

	set content(content: HTMLElement[]) {
		this.basketList.replaceChildren(...content)
	}


	set total(total: number) {
		this.basketTotal.textContent = settings.formatPrice(total);
	}

	set isDisabled(value: boolean) {
		this.basketOrderButton.disabled = value
	}


	render(): HTMLElement {
		return this.basket;
	}
}