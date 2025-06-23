export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {
	page: '.page__wrapper',
	gallery: '.gallery',
	modalSelector: '#modal-container',
	modalSettings: {
		container:'.modal__container',
		content: '.modal__content',
		close: '.modal__close',
		actionsClass: '.modal__actions .button',
		activeClass: 'modal_active',
		lockClass: 'page__wrapper_locked',
	},
	cardBasketTemplate: '#card-basket',
	cardPreviewTemplate: '#card-preview',
	cardSettings: {
		card: '.card',
		image: '.card__image',
		category: '.card__category',
		title: '.card__title',
		text: '.card__text',
		price: '.card__price',
		action: '.card__button',
	},
	cardCatalogTemplate: '#card-catalog',
	basketTemplate: '#basket',
	basketSettings: {
		list: '.basket__list',
		total: '.basket__price',
		itemClass: '.basket__item',
		orderButton: '.basket__button',
		headerButton: '.header__basket',
		headerCount: '.header__basket-counter'
	},
	basketItemSettings: {
		delete: '.basket__item-delete',
		index: '.basket__item-index',
		title: '.card__title',
		price: '.card__price',
	},
	formSettings: {
		formError: '.form__errors',
		submitButton:'button[type="submit"]'
	},
	contactsTemplate: '#contacts',
	contactsSettings: {
		email: 'input[name=email]',
		phone: 'input[name=phone]',
	},
	orderTemplate: '#order',
	orderSettings: {
		buttons: '.order__buttons .button_alt',
		activeButtonClass:'button_alt-active',
		address: 'input[name=address]',
	},
	successTemplate: '#success',
	successSettings: {
		closeButton:'.order-success__close',
		total: '.order-success__description'
	},
	formatPrice: (value: number | null) => {
		value = Number(value);
		const lastDigit = value % 10;
		const lastTwoDigits = value % 100;
		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
			return `${value} синапсов`;
		}
		switch (lastDigit) {
			case 1:
				return `${value} синапс`;
			case 2:
			case 3:
			case 4:
				return `${value} синапса`;
			default:
				return `${value} синапсов`;
		}
	},

};
