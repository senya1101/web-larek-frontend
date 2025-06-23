import { cloneTemplate } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';
import { Product } from '../../types';
import { BasketItemView } from './BasketItem';


interface IBasket {
	updateContent(products: Product[], events:IEvents, basketItemTemplate:HTMLTemplateElement, total: number):void,
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
		this.basketTotal = this.basket.querySelector(settings.basketSettings.total);
		this.basketList = this.basket.querySelector(settings.basketSettings.list);
		this.basketHeaderButton = document.querySelector(settings.basketSettings.headerButton);
		this.basketHeaderCount = document.querySelector(settings.basketSettings.headerCount);

		this.basketHeaderButton.addEventListener('click', () => {
			events.emit(AppStateChanges['basket:open']);
		});

		this.basketOrderButton = this.basket.querySelector(settings.basketSettings.orderButton);
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

	updateContent(products: Product[], events:IEvents, basketItemTemplate:HTMLTemplateElement, total: number) {
		if (products.length !== 0) {
			this.content = products.map((product, i) => {
				const item = new BasketItemView(
					basketItemTemplate,
					events,
					product,
					i + 1
				);
				return item.render();
			});
			this.isDisabled=false
		} else {
			this.content = []
			this.isDisabled  = true
		}
		this.count = products.length;
		this.total = total
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