export interface Product {
	id: string,
	title: string,
	description: string,
	image: string,
	category: ICategories,
	price: number
}

export enum ICategories {
	'дополнительное' = 'дополнительное',
	'софт-скил' = 'софт-скил',
	'хард-скил' = 'хард-скил',
	'другое' = 'другое'
}

export enum PaymentType {
	card='card', cash='cash'
}
export interface Contacts {
	email: string,
	phone: string,
}

export interface Order extends Contacts{
	payment: PaymentType;
	address: string;
	total: number;
	items: string[];
}
export interface successOrderResult {
	id: string,
	total: number,
}

export interface failOrderResult {
	error: string
}


export type FormErrors = Partial<Record<keyof Order, boolean>>