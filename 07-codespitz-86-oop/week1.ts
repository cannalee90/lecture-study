interface IViewModel {
  styles: Object;
  attributes: Object;
  properties: Object;
  events: Object;
}

class ViewModel {

  static get(data: IViewModel) {
    return new ViewModel(data);
  }

  styles = {};
  attributes = {};
  properties = {};
  events = {};

  constructor(data: IViewModel) {
    Object.entries(data).forEach(([key, value]) => {
      switch (key) {
        case 'style':
          this.styles = value;
          break;
        case 'attributes':
          this.attributes = value;
          break;
        case 'properties':
          this.properties = value;
          break;
        case 'events':
          this.events = value;
          break;
        default:
          // this[key] = value;
          break;
      }
    })
  }
}

class BinderItem {
  readonly el: HTMLElement;
  readonly viewmodel: IViewModel;

  constructor(el: HTMLElement, viewmodel: IViewModel) {
    this.el = el;
    this.viewmodel = viewmodel;
  }
}

class Binder {
  private readonly items = new Set<BinderItem>();

  render(viewmodel: IViewModel) {
    this.items.forEach((item: BinderItem) => {
      const { viewmodel, el } = item;
      Object.entries(viewmodel.styles).forEach(([key, value]) => {
        el.style[<any>key]= value;
      });
      Object.entries(viewmodel.attributes).forEach(([key, value])=> {
        el.setAttribute(key, value);
      });
      Object.entries(viewmodel.properties).forEach(([key, value]) => {
        (el as any)[key]= value;
      });
      Object.entries(viewmodel.events).forEach(([key, value]) => {
        (el as any)['on' + key] = (event: Event) => value.call(el, event, viewmodel);
      })
    })
  }
}

class Scanner {
  scan(el: HTMLElement) {
    const binder = new Binder;
    const stack: Element[] = [el.firstElementChild];
    let target;
    while(target = stack.pop()) {
      if (target.firstElementChild) {
        stack.push(target.firstElementChild);
      }

      if (target.nextElementSibling) {
        stack.push(target.nextElementSibling);
      }
    }
    return binder;
  }
}