//import AddPointView from '../view/add-point-view/add-point-view';
import ListView from '../view/list-view/list-view';
import SortView from '../view/sort-view/sort-view';
import NoPointView from '../view/no-points-view/no-points-view';
import AddPointPresenter from './add-point-presenter';
import { render, remove } from '../framework/render';
//import { RenderPosition } from '../framework/render';
import { SortType, UpdateType, UserAction, FilterType } from '../const';
import PointPresenter from './point-presenter';
import { sortPointByDate, sortPointByPrice, sortPointByTime, filter } from '../utils';
//import { filter } from '../utils';

export default class MainPresenter {
  #mainContainer = null;
  #pointsModel = null;
  #destinationsModel = null;
  #offersModel = null;
  #filterModel = null;

  #offers = [];
  #destinations = [];

  #listComponent = new ListView();
  #noPointComponent = null;
  #sortViewComponent = null;

  #pointPresenters = new Map();
  #addPointPresenter = null;

  #currentSortType = SortType.DAY.name;
  #filterType = FilterType.EVERYTHING;

  constructor({ mainContainer, pointsModel, destinationsModel, offersModel, filterModel }) {
    this.#mainContainer = mainContainer;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;
    this.#filterModel = filterModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.DAY.name:
        return filteredPoints.sort(sortPointByDate);
      case SortType.TIME.name:
        return filteredPoints.sort(sortPointByTime);
      case SortType.PRICE.name:
        return filteredPoints.sort(sortPointByPrice);
    }

    return filteredPoints;
  }

  init() {
    this.#destinations = this.#destinationsModel.destinations;
    this.#offers = this.#offersModel.offers;
    this.#renderMainComponents();
  }

  #renderMainComponents() {
    if (this.points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSortView();

    this.#renderPointsList();
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, update) => {
    //console.log(actionType, updateType, update);
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    //console.log(updateType, data);
    switch (updateType) {
      case UpdateType.POINT:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.POINTS_LIST:
        this.#clearBoard();
        this.#renderMainComponents();
        break;
      case UpdateType.MAIN_COMPONENT:
        this.#clearBoard({resetSortType: true});
        this.#renderMainComponents();
        break;
    }
  };


  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderSortView();
    this.#renderPointsList();
  };

  #renderNoPoints() {
    this.#noPointComponent = new NoPointView({
      filterType: this.#filterType
    });
    render(this.#noPointComponent, this.#mainContainer);
  }

  #renderSortView() {
    this.#sortViewComponent = new SortView({
      type: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });
    render(this.#sortViewComponent, this.#mainContainer);

  }

  renderAddPoint() {
    this.#currentSortType = SortType.DAY.name;
    this.#filterModel.setFilter(UpdateType.MAIN_COMPONENT, FilterType.EVERYTHING);
    this.#addPointPresenter = new AddPointPresenter({
      pointsListContainer: this.#listComponent.element,
      point: this.#pointsModel.newPoint,
      offers: this.#offers,
      destinations: this.#destinations,
      onDataChange: this.#handleViewAction,
    });
    this.#addPointPresenter.init();
  }

  #renderPointsList() {
    render(this.#listComponent, this.#mainContainer);

    for (let i = 0; i < this.points.length; i++) {
      this.#renderPoint(this.points[i]);
    }
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointsListContainer: this.#listComponent.element,
      destinations: this.#destinations,
      offers: this.#offers,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearBoard({resetSortType = false} = {}) {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortViewComponent);
    remove(this.#listComponent);

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }
}
