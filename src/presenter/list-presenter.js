import AddPointView from '../view/add-point-view/add-point-view';
import EditPointView from '../view/edit-point-view/edit-point-view';
import ListView from '../view/list-view/list-view';
import PointView from '../view/point-view/point-view';
import SortView from '../view/sort-view/sort-view';
import { render } from '../render';
import { RenderPosition } from '../render';

export default class ListPresenter {
  sortComponent = new SortView();
  listComponent = new ListView();

  constructor({ listContainer, pointsModel, destinationsModel, offersModel }) {
    this.listContainer = listContainer;
    this.pointsModel = pointsModel;
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;
  }

  init() {
    this.pointsList = [...this.pointsModel.getPoints()];
    this.offers = [...this.offersModel.getOffers()];
    this.destinations = [...this.destinationsModel.getDestinations()];

    render(this.sortComponent, this.listContainer);
    render(this.listComponent, this.listContainer);
    render(
      new AddPointView(),
      this.listComponent.getElement(),
      RenderPosition.AFTERBEGIN
    );

    for (let i = 0; i < this.pointsList.length; i++) {
      render(
        new EditPointView({
          point: this.pointsList[i],
          destinations: this.destinations,
          offers: this.offers,
        }),
        this.listComponent.getElement()
      );
      render(
        new PointView({
          point: this.pointsList[i],
          destinations: this.destinations,
          offers: this.offers,
        }),
        this.listComponent.getElement()
      );
    }
  }
}
