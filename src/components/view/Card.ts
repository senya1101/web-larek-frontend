import { ICategories, Product } from '../../types';
import { cloneTemplate } from '../../utils/utils';
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
		this.cardTitle = this.card.querySelector(settings.cardSettings.title);
		this.cardImage = this.card.querySelector(settings.cardSettings.image);
		this.cardPrice = this.card.querySelector(settings.cardSettings.price);
		this.cardCategory = this.card.querySelector(settings.cardSettings.category);
		this.category = data.category;
		this.title = data.title;
		this.image = data.image;
		this.price = settings.formatPrice(data.price);
		if (isPreview) {
			this.cardDescription = this.card.querySelector(
				settings.cardSettings.text
			);
			this.description = data.description;
			this.cardOrderButton = this.card.querySelector(
				settings.cardSettings.action
			);
			if (inBasket) {
				this.cardOrderButton.textContent = 'Убрать из корзины';
				this.cardOrderButton.addEventListener('click', () => {
					events.emit(AppStateChanges['product:removeFromBasket'], {
						product: data,
					});
					this.cardOrderButton.textContent = 'В корзину';

				});
			} else {
				this.cardOrderButton.textContent = 'В корзину';
				this.cardOrderButton.addEventListener('click', () => {
					events.emit(AppStateChanges['product:addedToBasket']);
					this.cardOrderButton.textContent = 'Убрать из корзины';

				});
			}
		} else {
			this.card.addEventListener('click', () => {
				events.emit(AppStateChanges['product:selected'], {
					product: data,
				});
			});
		}
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
