interface IViewModel {
  styles?: object;
  attributes?: object;
  properties?: object;
  events?: object;
  children?: IViewModel[];
  data?: any;
  func?: any;
  name: string;
};

class ViewModel implements IViewModel {

  static get(data: IViewModel) {
    return new ViewModel(data);
  }

  static getViewModel(viewmodel: IViewModel, target: string) {
    if (viewmodel.name === target) {
      return viewmodel;
    } else if (viewmodel.children.some(viewmodel => viewmodel.name === target)) {
      return viewmodel.children.find(viewmodel => viewmodel.name === target);
    }

    throw 'Wrong Target Name';
  }

  styles = {};
  attributes = {};
  properties = {};
  events = {};
  children: IViewModel[] = [];
  data: any = {};
  func: any = {};
  name: string = '';

  constructor(data: IViewModel) {
    Object.entries(data).forEach(([key, value]) => {
      switch (key) {
        case 'styles':
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
        case 'data':
          this.data = value;
          break;
        case 'func':
          this.func = value;
          Object.entries(this.func).forEach(([key, value]) => {
            this.func[key] = this.func[key].bind(this);
          });
          break;
        case 'name':
          this.name = value;
          break;
        case 'children':
          this.children = value;
          break;
        default:
          throw 'wrong input';
          break;
      }
    })
  }
}

class BinderItem {
  readonly el: HTMLElement;
  readonly viewmodelName: string;

  constructor(el: HTMLElement, viewmodelName: string) {
    this.el = el;
    this.viewmodelName = viewmodelName;
  }
}

class Binder {
  private readonly items = new Set<BinderItem>();

  add(item: BinderItem) {
    this.items.add(item);
  }

  render(wrapper: IViewModel) {
    this.items.forEach((item: BinderItem) => {
      const { viewmodelName, el } = item;
      const viewmodel = ViewModel.getViewModel(wrapper, viewmodelName);

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
        console.log(key, value);
        (el as any)['on' + key] = (event: Event) => value.call(el, event, viewmodel);
      });
    })
  }
}

class Scanner {
  scan(el: HTMLElement) {
    const binder = new Binder;
    const stack: Element[] = [el];
    let target;
    while(target = stack.pop()) {
      this.checkItem(binder, target);

      if (target.firstElementChild) {
        stack.push(target.firstElementChild);
      }

      if (target.nextElementSibling) {
        stack.push(target.nextElementSibling);
      }
    }
    return binder;
  }

  checkItem(binder: Binder, el: Element) {
    const viewmodelName = el.getAttribute('data-viewmodel');
    if (viewmodelName) {
      binder.add(new BinderItem(<HTMLElement>el, viewmodelName));
    }
  }
}


const viewmodel = ViewModel.get({
  name: 'wrapper',
  data: {
    isStop: false,
  },
  styles: {
    width: "50%",
    background: "#ffa",
    cursor: "pointer"
  },  
  func: {
    changeContents() {
      (ViewModel.getViewModel(this, 'wrapper').styles as any).background = `rgb(${Math.random() * 150 + 100}, ${Math.random() * 150 + 100}, ${Math.random() * 150 + 100})`;
      (ViewModel.getViewModel(this, 'contents').properties as any).innerHTML = Math.random().toString(16).replace(".", "");
    },  
  },
  events: {
    click: function(e: Event, vm: IViewModel) {
      vm.data.isStop = true;
    }
  },
  children: [
    ViewModel.get({
      name: 'title',
      properties: {
        innerHTML: 'Title',
      }
    }),
    ViewModel.get({
      name: 'contents',
      properties: {
        innerHTML: 'Content',
      }
    }),
  ]
});

const scanner = new Scanner;
const binder = scanner.scan(document.querySelector('#target'));
binder.render(viewmodel);


const f = (_: any) => {
  viewmodel.func.changeContents();
  binder.render(viewmodel);
  if (!viewmodel.data.isStop) {
    requestAnimationFrame(f);
  }
}

requestAnimationFrame(f);