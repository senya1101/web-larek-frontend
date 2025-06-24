import './scss/styles.scss';
import { ProductsApi } from './components/model/ProductsApi';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { EventEmitter, IEvents } from './components/base/events';
import {
	AppStateChanges,
	AppStateModel,
} from './components/model/AppStateModel';
import { BasketView } from './components/view/Basket';
import { ModalView } from './components/view/Modal';
import { OrderView } from './components/view/Order';
import { ContactsView } from './components/view/Contacts';
import { SuccessView } from './components/view/Success';
import { CardView } from './components/view/Card';
import { Contacts, FormErrors, PaymentType, Product } from './types';
import { BasketItemView } from './components/view/BasketItem';
import {ensureElement} from './utils/utils'

const storageKey = 'basket';
const api = new ProductsApi(API_URL, CDN_URL);
const events: IEvents = new EventEmitter();
const appState = new AppStateModel(api, events, storageKey);

const pageWrapper = ensureElement(settings.page) as HTMLElement;
const gallery = ensureElement(settings.gallery) as HTMLElement;

const cardCatalogTemplate = ensureElement(
	settings.cardCatalogTemplate
) as HTMLTemplateElement;
const cardPreviewTemplate = ensureElement(
	settings.cardPreviewTemplate
) as HTMLTemplateElement;
const basketItemTemplate = ensureElement(
	settings.cardBasketTemplate
) as HTMLTemplateElement;
const basketTemplate = ensureElement(
	settings.basketTemplate
) as HTMLTemplateElement;

const orderTemplate = ensureElement(
	settings.orderTemplate
) as HTMLTemplateElement;
const contactsTemplate = ensureElement(
	settings.contactsTemplate
) as HTMLTemplateElement;
const successTemplate = ensureElement(
	settings.successTemplate
) as HTMLTemplateElement;

const modal = ensureElement(settings.modalSelector) as HTMLElement;
const modalView = new ModalView(pageWrapper, modal);
const basketView = new BasketView({
	template: basketTemplate,
	events: events,
	total: appState.basketTotal,
	count: appState.basket.length,
});
const orderView = new OrderView(orderTemplate, events);
const contactsView = new ContactsView(contactsTemplate, events);
const successView = new SuccessView(successTemplate, events);

events.on(AppStateChanges['products:changed'], () => {
	appState.products.forEach((product: Product) => {
		const card = new CardView({
			template: cardCatalogTemplate,
			data: product,
			isPreview: false,
			inBasket: false,
			events: events,
		});
		gallery.append(card.render());
	});
});

events.on(
	AppStateChanges['product:selected'],
	(data: { product: Product }) => {
		appState.selectProduct(data.product);
		const inBasket = appState.basket.some((x) => x.id === data.product.id);
		const cardPreview = new CardView({
			template: cardPreviewTemplate,
			data: appState.selectedProduct,
			inBasket: inBasket,
			isPreview: true,
			events: events,
		});
		modalView.content = cardPreview.render();
		modalView.open();
	}
);

events.on(AppStateChanges['product:addedToBasket'], () => {
	appState.addToBasket();
	basketView.count = appState.basket.length;
	basketView.total = appState.basketTotal;
	modalView.close();
});

events.on(AppStateChanges['basket:open'], () => {
	basketView.updateContent(
		appState.basket,
		events,
		basketItemTemplate,
		appState.basketTotal
	);
	modalView.content = basketView.render();
	modalView.open();
});

events.on(
	AppStateChanges['product:removeFromBasket'],
	(data: { product: Product }) => {
		appState.removeFromBasket(data.product.id);
	}
);

events.on(AppStateChanges['contacts:open'], () => {
	modalView.content = contactsView.render();
});

events.on(AppStateChanges['contacts:changed'], (data: Contacts) => {
	appState.setContacts(data);
	const validationData = appState.validateData(data);
	contactsView.isValid = validationData.email && validationData.phone;
	contactsView.messageError = Object.keys(validationData)
		.filter((x: keyof FormErrors) =>!validationData[x])
		.map((x: keyof FormErrors) => `Неверное значение в поле "${x}"`)
		.join('. ');
});


events.on(AppStateChanges['addressPayment:open'], ()=>{
	modalView.content = orderView.render();
})

events.on(AppStateChanges['addressPayment:changed'], (data:{
	address: string;
	payment: PaymentType;
})=>{
	appState.setPaymentAddress(data.address, data.payment);
	orderView.isValid = !!data.address
	if(!data.address)orderView.errorMessage = 'Поле адреса не заполнено'
	else orderView.errorMessage=''
})


events.on(AppStateChanges['order:send'], ()=>{
	api.orderProducts(appState.getOrder()).catch(e=>console.error(e)).then(()=>{
		events.emit(AppStateChanges['success:open'], {total:appState.basketTotal});
		appState.clearBasket()
	});
})


events.on(AppStateChanges['success:open'], (data:{total:number})=>{
	successView.total = data.total
	modalView.content = successView.render();
})

events.on(AppStateChanges['success:close'], ()=>{
	modalView.close()
})

events.on(AppStateChanges['basket:change'], ()=>{
	if (appState.basket.length !== 0) {
		basketView.content = appState.basket.map((product, i) => {
			const item = new BasketItemView(
				basketItemTemplate,
				events,
				product,
				i + 1
			);
			return item.render();
		});
		basketView.isDisabled=false
	} else {
		basketView.content = []
		basketView.isDisabled  = true
	}
	basketView.count = appState.basket.length;
	basketView.total = appState.basketTotal
})

api.getProducts().catch(e=>console.error(e)).then((data: Product[])=>{
	appState._products = data
})
