import { ICategories, Product } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { settings } from '../../utils/constants';
import { IEvents } from '../base/events';
import { AppStateChanges } from '../model/AppStateModel';

interface ICardView {
	render(data: Product): HTMLElement;
}

export class CardView implements ICardView {
	protected card: HTMLElement;
	protected cardTitle: HTMLElement;
	protected cardImage: HTMLImageElement;
	protected cardPrice: HTMLElement;
	protected cardCategory: HTMLElement;
	protected cardDescription: HTMLElement | null;
	protected cardOrderButton: HTMLButtonElement;
	protected categories: Record<ICategories, string> = {
		'дополнительное': 'additional',
		'софт-скил': 'soft',
		'хард-скил': 'hard',
		'другое': 'other',
	};

	constructor({
		template,
		data,
		events,
		inBasket,
		isPreview,
	}: {
		template: HTMLTemplateElement;
		data: Partial<Product>;
		isPreview: boolean;
		inBasket: boolean;
		events: IEvents;
	}) {
		this.card = cloneTemplate(template);
		this.cardTitle = ensureElement(settings.cardSettings.title, this.card);
		this.cardImage = ensureElement(settings.cardSettings.image, this.card) as HTMLImageElement;
		this.cardPrice = ensureElement(settings.cardSettings.price, this.card);
		this.cardCategory = ensureElement(settings.cardSettings.category, this.card);
		this.category = data.category;
		this.title = data.title;
		this.image = data.image;
		this.price = settings.formatPrice(data.price);
		if (isPreview) {
			this.cardDescription = ensureElement(
				settings.cardSettings.text, this.card
			);
			this.description = data.description;
			this.cardOrderButton = ensureElement(
				settings.cardSettings.action, this.card
			) as HTMLButtonElement
			if (inBasket) {
				this.cardOrderButton.textContent = 'Убрать из корзины';
				this.cardOrderButton.onclick = this.removeFromBasketHandler.bind(this, events, data);
			} else {
				this.cardOrderButton.textContent = 'В корзину';
				this.cardOrderButton.onclick = this.addToBasketHandler.bind(this, events, data);
			}
		} else {
			this.card.addEventListener('click', () => {
				events.emit(AppStateChanges['product:selected'], {
					product: data,
				});
			});
		}

	}

	protected addToBasketHandler(events: IEvents, data: Product) {
		events.emit(AppStateChanges['product:addedToBasket'], {});
		this.cardOrderButton.textContent = 'Убрать из корзины';
		this.cardOrderButton.onclick = this.removeFromBasketHandler.bind(this, events, data);
	}

	protected removeFromBasketHandler(events: IEvents, data:Product) {
		events.emit(AppStateChanges['product:removeFromBasket'], {
			product: data,
		});
		this.cardOrderButton.textContent = 'В корзину';
		this.cardOrderButton.onclick = this.addToBasketHandler.bind(this, events, data);
	}

	set title(title: string) {
		this.cardTitle.textContent = title;
	}

	set image(image: string) {
		this.cardImage.src = image;
	}

	set price(price: string) {
		this.cardPrice.textContent = price;
	}

	set category(category: ICategories) {
		this.cardCategory.textContent = category.toString();
		this.cardCategory.className = `card__category card__category_${this.categories[category]}`;
	}

	set description(description: string) {
		this.cardDescription.textContent = description;
	}

	render(): HTMLElement {
		return this.card;
	}
}
