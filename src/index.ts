import './scss/styles.scss';
import { ProductsApi } from './components/model/ProductsApi';
import { API_URL, CDN_URL, settings } from './utils/constants';
import { EventEmitter, IEvents } from './components/base/events';
import {
	AppStateChanges,
	AppStateModals,
	AppStateModel,
} from './components/model/AppStateModel';
import { BasketView } from './components/view/Basket';
import { ModalView } from './components/view/Modal';
import { OrderView } from './components/view/Order';
import { ContactsView } from './components/view/Contacts';
import { SuccessView } from './components/view/Success';
import { CardView } from './components/view/Card';
import { Contacts, FormErrors, PaymentType, Product } from './types';


const storageKey = 'basket';
const api = new ProductsApi(API_URL, CDN_URL);
const events: IEvents = new EventEmitter();
const appState = new AppStateModel(api, events, storageKey);

const pageWrapper = document.querySelector(settings.page) as HTMLElement;
const gallery = document.querySelector(settings.gallery) as HTMLElement;

const cardCatalogTemplate = document.querySelector(
	settings.cardCatalogTemplate
) as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector(
	settings.cardPreviewTemplate
) as HTMLTemplateElement;
const basketItemTemplate = document.querySelector(
	settings.cardBasketTemplate
) as HTMLTemplateElement;
const basketTemplate = document.querySelector(
	settings.basketTemplate
) as HTMLTemplateElement;

const orderTemplate = document.querySelector(
	settings.orderTemplate
) as HTMLTemplateElement;
const contactsTemplate = document.querySelector(
	settings.contactsTemplate
) as HTMLTemplateElement;
const successTemplate = document.querySelector(
	settings.successTemplate
) as HTMLTemplateElement;

const modal = document.querySelector(settings.modalSelector) as HTMLElement;
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
	async (data: { product: Product }) => {
		await appState.selectProduct(data.product.id);
		const inBasket = appState.basket.some((x) => x.id === data.product.id);
		const cardPreview = new CardView({
			template: cardPreviewTemplate,
			data: appState.selectedProduct,
			inBasket: inBasket,
			isPreview: true,
			events: events,
		});
		modalView.content = cardPreview.render();
		appState.openedModal = AppStateModals.product;
		modalView.open();
	}
);

events.on(AppStateChanges['product:addedToBasket'], () => {
	appState.addToBasket();
	basketView.count = appState.basket.length;
	basketView.total = appState.basketTotal;
	appState.openedModal = AppStateModals.none;
	modalView.close();
});

events.on(AppStateChanges['basket:open'], () => {
	appState.openedModal = AppStateModals.basket;
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
		basketView.updateContent(
			appState.basket,
			events,
			basketItemTemplate,
			appState.basketTotal
		);
		console.log(appState.openedModal === AppStateModals.basket)
		if (appState.openedModal === AppStateModals.basket)
			modalView.content = basketView.render();
		else modalView.close();
	}
);

events.on(AppStateChanges['contacts:open'], () => {
	appState.openedModal = AppStateModals.contacts;
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
	appState.openedModal = AppStateModals.addressPayment;
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

events.on(AppStateChanges['success:open'], ()=>{
	appState.openedModal = AppStateModals.success;
	successView.total = appState.basketTotal
	appState.orderProducts().then(()=>{
		appState.clearBasket()
		basketView.updateContent(
			appState.basket,
			events,
			basketItemTemplate,
			appState.basketTotal
		);
		modalView.content = successView.render();
	})
})

events.on(AppStateChanges['success:close'], ()=>{
	modalView.close()
})

appState.loadProducts().catch(e=>console.error(e));
