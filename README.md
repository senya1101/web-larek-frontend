# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Описание
В проекте используется архитектура MVP (Model-View-Presenter):
- Model - работа с API и состоянием приложения;
- View - отображение данных и слушание пользовательских событий;
- Presenter - предоставляет работу с событиями, позволяет подписываться на них и обрабатывать.

## События
- 'product:selected'
- 'product:addedToBasket' 
- 'product:removeFromBasket' 
- 'basket:open' 
- 'addressPayment:open' 
- 'addressPayment:changed' 
- 'contacts:open' 
- 'contacts:changed'
- 'order:send'
- 'success:open' 
- 'success:close'
- 'products:changed' 

## Основные типы

```typescript
//Информация о продукте
export interface Product {
	id: string,
	title: string,
	description: string,
	image: string,
	category: ICategories,
	price: number
}
//Категории продуктов
export enum ICategories {
	'дополнительное' = 'дополнительное',
	'софт-скил' = 'софт-скил',
	'хард-скил' = 'хард-скил',
	'другое' = 'другое'
}
//Тип оплаты
export enum PaymentType {
	card='card', cash='cash'
}
//Контакты для заказа
export interface Contacts {
	email: string,
	phone: string,
}
//Заказ
export interface Order extends Contacts{
	payment: PaymentType;
	address: string;
	total: number;
	items: string[];
}
//Результат отправки заказа
export interface successOrderResult {
	id: string,
	total: number,
}
export interface failOrderResult {
	error: string
}
//Ошибки формы
export type FormErrors = Partial<Record<keyof Order, boolean>>
```

## Base
## Api

Класс `Api` предоставляет удобные методы для работы с HTTP API.

#### Основные типы
Ответ API для списка элементов:
```typescript
  type ApiListResponse<Type> = {
	total: number,
	items: Type[]
  }
  ```

Допустимые HTTP-методы для отправки данных:
```typescript
type ApiPostMethods = 'POST' | 'PUT' | 'DELETE'
```
#### Конструктор

```
constructor(baseUrl: string, options: RequestInit = {})
```
- `baseUrl` - базовый URL API
- `options` - дополнительные настройки запроса (по умолчанию включает JSON-заголовки)

#### Методы

- `get(uri: string)` Отправляет GET-запрос
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` Отправляет POST-запрос
- `protected handleResponse(response: Response): Promise<object>` Обработка ответов


## EventEmitter

Класс `EventEmitter` реализует шаблон "Наблюдатель" (Observer) и предоставляет механизм для работы с событиями через систему публикации/подписки (Pub/Sub).

### Основные типы
Тип для имени события:
```typescript
type EventName = string | RegExp
``` 

Тип для функции-подписчика:
```typescript
type Subscriber = Function
```

Объект события:
```typescript
type EmitterEvent = {
    eventName: string,
    data: unknown
}
```
Интерфейс IEvents

```typescript
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```

### Конструктор

```typescript
constructor()
```
Создает новый экземпляр EventEmitter с пустой картой событий.

### Основные методы

 - `on<T extends object>(eventName: EventName, callback: (event: T) => void)` - Регистрирует обработчик для указанного события.
- `off(eventName: EventName, callback: Subscriber)` - 
Удаляет обработчик для указанного события.
- `emit<T extends object>(eventName: string, data?: T)` - 
Инициирует событие с данными.
- `onAll(callback: (event: EmitterEvent) => void)` - 
Подписывается на все события.
- `offAll()` - Сбрасывает все подписки.
- `trigger<T extends object>(eventName: string, context?: Partial<T>)` - Создает функцию-триггер для указанного события.



## Model

## ProductsApi

Наследуется от `Api` и реализует интерфейс `IProductAPI`. Предоставляет методы для работы с товарами и заказами.

```typescript
interface IProductAPI {
	getProducts(): Promise<Product[]>;
	getProductById(id: string):Promise<Product>;
	orderProducts(order: Order): Promise<successOrderResult|failOrderResult>;
}
```

### Конструктор
```
constructor(baseUrl: string, cdn: string)  
```  
- `baseUrl` – базовый URL API
- `cdn` – URL CDN для обработки путей к изображениям

### Методы

#### `getProducts(): Promise<Product[]>`
- Запрашивает список товаров
- Добавляет CDN-путь к изображениям
- Возвращает массив `Product`

#### `getProductById(id: string): Promise<Product>`
- Запрашивает товар по `id`
- Добавляет CDN-путь к изображению
- Возвращает `Product`

#### `orderProducts(order: Order): Promise<successOrderResult | failOrderResult>`
- Отправляет заказ на сервер
- Возвращает результат (`success` или `fail`)

## AppStateModel
Класс AppStateModel управляет глобальным состоянием интернет-магазина, включая:
- Список товаров
- Корзину покупок
- Данные заказа (адрес, контакты, способ оплаты)
- Валидацию форм
- Модальные окна
```typescript
export interface AppState {
	products: Product[];
	selectedProduct: Product;
	basket: Product[];
	selectedPayment: PaymentType;
	address: string;
	contacts: Contacts;
	basketTotal: number;
	storageKey: string;
	selectProduct(id: string): void;
	addToBasket(id: string): void;
	clearBasket(): void;
	removeFromBasket(id: string): void;
	getOrder(): Order;
	setContacts(contacts: Contacts): void;
	setPaymentAddress(payment: PaymentType, address: string): void;
	validateData(contacts: Contacts): FormErrors
}
```
#### Свойства
- `products: Product[]` - список загруженных товаров
- `selectedProduct: Product` - продукт, открытый в модальном окне 
- `basket: Product[]` - корзина
- `selectedPayment: PaymentType` - тип оплаты заказа
- `address: string` - адрес доставки заказа
- `contacts: Contacts` - контактная информация
- `basketTotal: number` - сумма заказа
- `storageKey: string` - ключ для хранения корзины в localstorage

### Основные методы
| Метод                  | Описание                                  |
|------------------------|------------------------------------------|
| `addToBasket()`        | Добавляет товар в корзину                |
| `removeFromBasket()`   | Удаляет товар из корзины                 |
| `clearBasket()`        | Очищает корзину                          |
| `getOrder()`           | Формирует объект заказа                  |
| `validateData()`       | Проверяет валидность email и телефона    |

## View
### BasketView

Класс `BasketView` отвечает за отображение корзины покупок и взаимодействие с ней. Реализует интерфейс `IBasket`.

#### Основные элементы:
- Список товаров в корзине (`basketList`)
- Итоговая сумма (`basketTotal`)
- Кнопка оформления заказа (`basketOrderButton`)
- Кнопка-иконка корзины в шапке (`basketHeaderButton`)
- Счетчик товаров в шапке (`basketHeaderCount`)

#### Ключевые методы:
- `updateContent()` - обновляет список товаров и сумму
- `render()` - возвращает DOM-элемент корзины

#### Функционал:
1. Отображает список добавленных товаров через `BasketItemView`
2. Показывает общую сумму заказа
3. Обновляет счетчик товаров в шапке
4. Блокирует кнопку оформления при пустой корзине
5. Генерирует события при кликах:
    - Открытие корзины (`basket:open`)
    - Начало оформления (`addressPayment:open`)

### BasketItem

Класс `BasketItemView` реализует отображение отдельного товара в корзине. Реализует интерфейс `IBasketItem`.

#### Структура элемента:
- Название товара (`basketItemTitle`)
- Цена (`basketItemPrice`)
- Порядковый номер (`basketItemIndex`)
- Кнопка удаления (`basketItemDeleteButton`)

#### Основные функции:
1. Создает DOM-элемент на основе переданного шаблона
2. Заполняет данные о товаре (название, цена, номер)
3. Обрабатывает клик по кнопке удаления, генерируя событие `product:removeFromBasket`
4. Предоставляет метод `render()` для получения готового элемента


### Card

Класс реализует отображение карточки товара с двумя вариантами:
- Превью-режим (с описанием и кнопкой корзины)
- Обычный режим (с кликом для просмотра деталей)

#### Основные элементы
- Заголовок (`cardTitle`)
- Изображение (`cardImage`)
- Цена (`cardPrice`)
- Категория (`cardCategory`) с цветовой маркировкой
- Описание (`cardDescription`, только в превью)
- Кнопка действия (`cardOrderButton`, только в превью)



### Contacts

Класс реализует форму ввода контактной информации для оформления заказа. 
#### Структура компонента
| Элемент | Тип | Назначение |
|---------|------|------------|
| `ContactsForm` | `HTMLFormElement` | Контейнер формы |
| `PhoneInput` | `HTMLInputElement` | Поле ввода телефона |
| `EmailInput` | `HTMLInputElement` | Поле ввода email |
| `nextButton` | `HTMLButtonElement` | Кнопка подтверждения |
| `errorMessage` | `HTMLElement` | Блок ошибок валидации |

#### Основная логика
1. Отслеживание изменений:
    - При изменении полей генерирует событие `contacts:changed` с текущими значениями
   ```typescript
   events.emit(AppStateChanges['contacts:changed'], {
     email: this.EmailInput.value,
     phone: this.PhoneInput.value
   });
   ```

2. Обработка отправки:
    - Блокирует стандартное поведение формы
    - Инициирует открытие окна успешного заказа (`success:open`)

3. Управление состоянием:
   ```
   set messageError(message: string)  // Установка текста ошибки
   set isValid(isValid: boolean)     // Блокировка/разблокировка кнопки
   ```


### Modal

Класс реализует функционал модального окна с базовыми возможностями открытия/закрытия и управления контентом. Реализует интерфейс `IModal`.

#### Основные элементы
- Контейнер модалки (`containerModal`) - основной DOM-элемент
- Внутренний контейнер (`container`) - область контента (блокирует всплытие кликов)
- Кнопка закрытия (`closeButton`) - крестик для закрытия
- Страница (`page`) - ссылка на корневой элемент страницы
- Контентная область (`contentElem`) - блок для вставки пользовательского контента

#### Ключевые методы
| Метод | Описание |
|-------|----------|
| `open()` | Показывает модальное окно и блокирует скролл страницы |
| `close()` | Скрывает модальное окно и разблокирует страницу |
| `render()` | Открывает модалку и возвращает DOM-элемент |

### Order

Класс реализует функционал формы выбора способа оплаты и ввода адреса доставки. Реализует интерфейс `IOrder`.

## Структура компонента
| Элемент | Тип | Назначение |
|---------|------|------------|
| `paymentAddressForm` | `HTMLFormElement` | Основной контейнер формы |
| `nextButton` | `HTMLButtonElement` | Кнопка перехода к контактам |
| `paymentButtons` | `HTMLButtonElement[]` | Кнопки выбора способа оплаты |
| `addressInput` | `HTMLInputElement` | Поле ввода адреса |
| `formError` | `HTMLElement` | Блок отображения ошибок |
| `paymentSelected` | `PaymentType` | Текущий выбранный способ оплаты |





### Success
Класс реализует отображение сообщения об успешном завершении заказа. Реализует интерфейс `ISuccess`.

## Структура компонента
| Элемент | Тип | Назначение |
|---------|------|------------|
| `successContent` | `HTMLElement` | Основной контейнер сообщения |
| `closeButton` | `HTMLButtonElement` | Кнопка закрытия окна |
| `totalElement` | `HTMLElement` | Блок отображения суммы заказа |

#### Основной функционал
1. Отображение информации:
    - Показывает итоговую сумму заказа в отформатированном виде
   ```
   set total(total: number) {
     this.totalElement.textContent = `Списано ${settings.formatPrice(total)}`;
   }
   ```
2. Управление окном:
    - Инициирование закрытия по клику на кнопку с генерацией события `success:close`

3. Рендеринг:
    - Возвращает готовый DOM-элемент через метод `render()`


## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

