import { Product } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';


interface IBasketItem{
	render(): HTMLElement;
}

export class BasketItemView implements IBasketItem {
	protected basketItem: HTMLElement;
	protected basketItemTitle: HTMLElement;
	protected basketItemPrice: HTMLElement;
	protected basketItemIndex: HTMLElement;
	protected basketItemDeleteButton: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, events: IEvents , data: Partial<Product>,index: number) {
		this.basketItem = cloneTemplate(template);
		this.basketItemTitle = ensureElement(settings.basketItemSettings.title, this.basketItem);
		this.basketItemPrice = ensureElement(settings.basketItemSettings.price, this.basketItem);
		this.basketItemIndex = ensureElement(settings.basketItemSettings.index, this.basketItem);

		const deleteButton = ensureElement(settings.basketItemSettings.delete, this.basketItem)
		if (deleteButton instanceof HTMLButtonElement) {
			this.basketItemDeleteButton = deleteButton;
			this.basketItemDeleteButton.addEventListener('click', ()=>{
			events.emit(AppStateChanges['product:removeFromBasket'], {product: data})})
		} else {
			throw new Error('Unable to delete basket item');
		}

		this.title = data.title;
		this.price = settings.formatPrice(data.price)
		this.index = index
	}



	set title(title: string) {
		this.basketItemTitle.textContent = title;
	}


	set price(price: string) {
		this.basketItemPrice.textContent = price;
	}

	set index(index: number){
		this.basketItemIndex.textContent = index.toString()
	}


	render(): HTMLElement {
		return this.basketItem;
	}
}