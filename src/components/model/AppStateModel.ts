import {
	Contacts,
	FormErrors,
	Order,
	PaymentType,
	Product,
} from '../../types';
import { IEvents } from '../base/events';
import { IProductAPI } from './ProductsApi';

export enum AppStateChanges {
	'product:selected' = 'productSelected',
	'product:addedToBasket' = 'productAddedToBasket',
	'product:removeFromBasket' = 'productRemoveFromBasket',
	'basket:open' = 'basketOpen',
	'addressPayment:open' = 'addressPaymentOpen',
	'addressPayment:changed' = 'addressPaymentChanged',
	'contacts:open' = 'contactsOpen',
	'contacts:changed' = 'emailChanged',
	'success:open' = 'successOpen',
	'success:close' = 'successClose',
	'products:changed' = 'productsChanged',
}

export enum AppStateModals {
	product,
	basket,
	addressPayment,
	contacts,
	success,
	none,
}

export interface AppState {
	products: Product[];
	selectedProduct: Product;
	basket: Product[];
	openedModal: AppStateModals | null;
	selectedPayment: PaymentType;
	address: string;
	contacts: Contacts;
	basketTotal: number;
	storageKey: string;

	selectProduct(id: string): void;

	loadProducts(): void;

	addToBasket(id: string): void;

	clearBasket(): void;

	removeFromBasket(id: string): void;

	getOrder(): Order;

	orderProducts(): void;

	setContacts(contacts: Contacts): void;

	setPaymentAddress(payment: PaymentType, address: string): void;

	validateData(contacts: Contacts): FormErrors
}

export class AppStateModel implements AppState {
	constructor(
		protected api: IProductAPI,
		protected events: IEvents,
		public storageKey: string
	) {
		this.basket = JSON.parse(localStorage.getItem(storageKey)) as Product[] || []
		this.updateTotal()
		this.contacts = {
			email:'',
			phone:'',
		}
	}

	products: Product[] = [];
	selectedProduct: Product;
	basket: Product[] = [];
	openedModal: AppStateModals;
	selectedPayment: PaymentType;
	address: string;
	contacts: Contacts;
	basketTotal: number;

	async loadProducts() {
		this.products = await this.api.getProducts();
		this.events.emit(AppStateChanges['products:changed']);
	}

	protected updateTotal() {
		this.basketTotal = this.basket.reduce(
			(s: number, cur: Product) => s + cur.price,
			0
		);
	}


	addToBasket(): void {
		if (this.basket.some((x) => x.id === this.selectedProduct.id)) {
			throw new Error('Already in basket');
		}
		this.basket.push(this.selectedProduct);
		localStorage.setItem(this.storageKey, JSON.stringify(this.basket));
		this.updateTotal();
	}

	clearBasket(): void {
		localStorage.removeItem(this.storageKey);
		this.basket = [];
		this.updateTotal();
	}

	removeFromBasket(id: string): void {
		this.basket = this.basket.filter((x) => x.id !== id);
		localStorage.setItem(this.storageKey, JSON.stringify(this.basket));
		this.updateTotal();
	}

	async orderProducts() {
		if (
			!this.contacts ||
			this.basket.length === 0 ||
			!this.address ||
			!this.selectedPayment
		) {
			throw new Error('Order is empty');
		}
		const order = this.getOrder();
		return await this.api.orderProducts(order);

	}

	getOrder(): Order {
		return {
			payment: this.selectedPayment,
			address: this.address,
			total: this.basketTotal,
			email: this.contacts.email,
			phone: this.contacts.phone,
			items: this.basket.map((x) => x.id),
		};
	}

	setContacts(contacts: Contacts): void {
		this.contacts.email = contacts.email;
		this.contacts.phone = contacts.phone;
	}

	setPaymentAddress(address: string, payment: PaymentType): void {
		this.address = address;
		this.selectedPayment = payment
	}

	async selectProduct(id: string) {
		return await this.api.getProductById(id).then((res) => {
			if (res) this.selectedProduct = res;
		});
	}

	validateData(contacts: Contacts): FormErrors {
		const regexPhone =
			/^(\+7|8)[\s\-()]?\d{3}[\s\-()]?\d{3}[\s\-()]?\d{2}[\s\-()]?\d{2}$/;
		const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return ({
			email: !!contacts.email.match(regexEmail),
			phone: !!contacts.phone.match(regexPhone)
		})
	}
}
