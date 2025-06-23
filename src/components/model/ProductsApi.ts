import { failOrderResult, Order, Product, successOrderResult } from '../../types';
import { Api, ApiListResponse } from '../base/api';

export interface IProductAPI {
	getProducts(): Promise<Product[]>;
	getProductById(id: string):Promise<Product>;
	orderProducts(order: Order): Promise<successOrderResult|failOrderResult>;
}


export class ProductsApi extends Api implements IProductAPI{
	protected cdn: string;
	constructor(baseUrl: string, cdn: string, ) {
		super(baseUrl);
		this.cdn = cdn;
	}

	getProducts(): Promise<Product[]> {
		return (this.get(`/product`).then((response: ApiListResponse<Product>) => {
			return response.items.map((product: Product) => ({
				...product, image: this.cdn + product.image
			})
		)})) as Promise<Product[]>;
	}

	getProductById(id: string): Promise<Product> {
		return (this.get(
			`/product/${id}`
		).then((item:Product)=>({
			...item,
			image: this.cdn +item.image
		}))) as Promise<Product>;
	}

	orderProducts(order: Order): Promise<successOrderResult | failOrderResult> {
		return (this.post(`/order`, order)) as Promise<successOrderResult | failOrderResult>
	}
}