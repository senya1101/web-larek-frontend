import { settings } from '../../utils/constants';
import { ensureElement } from '../../utils/utils';


interface IModal {
	open(): void;

	close(): void;

	render(): HTMLElement;
}

export class ModalView implements IModal {
	protected containerModal: HTMLElement;
	protected container: HTMLElement;
	protected closeButton: HTMLButtonElement;
	protected page: HTMLElement;
	protected contentElem: HTMLElement;

	constructor(page: HTMLElement, container: HTMLElement, content?: HTMLElement) {
		this.containerModal = container;
		this.contentElem = ensureElement(settings.modalSettings.content, this.containerModal);
		this.container = ensureElement(settings.modalSettings.container, this.containerModal);
		this.page = page;
		this.closeButton = this.getCloseButton();
		this.closeButton.addEventListener('click', ()=>{
			this.close();
		});
		if (content) {
			this.content = content;
		}
		this.container.addEventListener('click', event => event.stopPropagation());

	}

	protected getCloseButton() {
		const closeButton = ensureElement(settings.modalSettings.close, this.container);
		if (closeButton && closeButton instanceof HTMLButtonElement) {
			return closeButton;
		} else
			throw new Error('Close button is required');
	}

	open(): void {
		if (!this.containerModal.classList.contains(settings.modalSettings.activeClass)) {
			this.containerModal.classList.toggle(settings.modalSettings.activeClass);
			this.lock = true;
			this.containerModal.addEventListener('click', this.overlayClickHandler);
		}
	}
	protected overlayClickHandler = this.close.bind(this)

	close(): void {
		if (this.containerModal.classList.contains(settings.modalSettings.activeClass)) {
			this.containerModal.classList.toggle(settings.modalSettings.activeClass);
			this.lock = false;
			this.containerModal.removeEventListener('click', this.overlayClickHandler);

		}

	}


	set lock(lock: boolean) {
		const curState = this.page.classList.contains(settings.modalSettings.lockClass);
		if ((lock && !curState) || (!lock && curState)) {
			this.page.classList.toggle(settings.modalSettings.lockClass);
		}
	}

	set content(content: HTMLElement) {
		this.contentElem.replaceChildren(content);
	}

	render(): HTMLElement {
		this.open()
		return this.container
	}

}