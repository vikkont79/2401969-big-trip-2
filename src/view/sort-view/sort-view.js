import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { createSortTemplate } from './sort-view-template.js';

export default class SortView extends AbstractStatefulView {
  #type = null;
  #handleSortTypeChange = null;

  constructor({ type, onSortTypeChange, }) {
    super();
    this.#type = type;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#onSortTypeChange);
  }

  #onSortTypeChange = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };

  get template() {
    return createSortTemplate(this.#type);
  }
}
