
const type = (value, type) => {
  if (typeof type === 'string') {
    if (typeof value !== type) {
      throw `${value} is not ${type}`;
    }
  } else if (!(value instanceof type)) {
    throw `${value} is not ${type}`;
  }
  return value;
}

const ViewModel = class {
  static #private = Symbol();
  static get(data) {
    return new ViewModel(this.#private, data);
  }

  styles = {};
  attributes = {};
  properties = {};
  events = {};
  constructor(checker, data) {
    if (checker !== ViewModel.#private) {
      throw 'use viewModel.get()!';
    }
    Object.entries(data).forEach(([key, value]) => {
      switch(key) {
        case 'style':
          this.style = value;
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
          this[key] = value;
      }
    });
    Object.seal(this);
  }
}

const BinderItem = class {
  el;
  viewmodel;
  constructor(el, viewmodel, _=type(el, HTMLElement), __ = type(viewmodel, 'string')) {
    this.el = el;
    this.viewmodel = viewmodel;
    Object.freeze(this);
  }
}

const Binder = class {
  #items = new Set;

  add(v, _=type(v, BinderItem)) {
    this.#items.add(v);
  }

  render(viewmodel, _=type(viewmodel, ViewModel)) {
    this.#items.forEach(item => {
      const vm = type(viewmodel[item.viewmodel], ViewModel);
      const el = item.el;
      Object.entries(vm.styles).forEach(([key, value]) => {
        el.style[key] = value;
      });
      Object.entries(vm.attributes).forEach(([key, value]) => {
        el.setAttribute[key] = value;
      });
      Object.entries(vm.properties).forEach(([key, value]) => {
        el[key] = value;
      });
      Object.entries(vm.events).forEach(([key, value]) => {
        el["on" + key] = e => value.call(el, e, viewmodel)
      });
    });
  }
}

const Scanner = class {
  scan(el, _=type(el, HTMLElement)) {
    const binder = new Binder;
    this.checkItem(binder, el);
    const stack = [el.firstElementChild];
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

  checkItem(binder, el) {
    const vm = el.getAttribute('data-viewmodel');
    if (vm) {
      binder.add(new BinderItem(el, vm));
    }
  }
}

const viewmodel = ViewModel.get({
  isStop: false,
  changeContents() {
    this.wrapper.styles.background = `rgb(${parseInt(Math.random() * 150) + 100}, ${parseInt(Math.random() * 150) + 100}, ${parseInt(Math.random() * 150) + 100})`;
    this.contents.properties.innerHTML = Math.random().toString(16).replace(".", "");
  },
  wrapper: ViewModel.get({
    styles: {
      width: "50%",
      background: "#ffa",
      cursor: "pointer"
    },
    events: {
      click(e, vm) {
        vm.isStop = true;
      }
    }
  }),
  title: ViewModel.get({
    properties: {
      innerHTML: 'Title',
    }
  }),
  contents: ViewModel.get({
    properties: {
      innerHTML: 'Content'
    }
  })
});

const scanner = new Scanner;
const binder = scanner.scan(document.querySelector('#target'));
binder.render(viewmodel);

const f = _ => {
  viewmodel.changeContents();
  binder.render(viewmodel);
  if (!viewmodel.isStop) {
    requestAnimationFrame(f);
  }
}

requestAnimationFrame(f);