const SUPPORT_TOUCH = 'ontouchstart' in window;

const EVENTS = {
  start: SUPPORT_TOUCH ? 'touchstart' : 'mousedown',
  move: SUPPORT_TOUCH ? 'touchmove' : 'mousemove',
  end: SUPPORT_TOUCH ? 'touched' : 'mouseup',
};

const $view = document.getElementById('carousel');
const $container = $view.querySelector('.container');
const PANEL_COUNT = $container.querySelectorAll('.panel').length;

import { fromEvent, merge } from 'rxjs';
import { takeUntil, map, switchMap, startWith, withLatestFrom, first, share, scan } from 'rxjs/operators'

function toPos(obs$) {
  return obs$
    .pipe(
      map(v => SUPPORT_TOUCH ? v.changedTouches[0].pageX : v.pageX),
    )
}

const start$ = fromEvent($view, EVENTS.start).pipe(toPos);
const move$ = fromEvent($view, EVENTS.move).pipe(toPos);
const end$ = fromEvent($view, EVENTS.end);

let viewWidth = $view.clientWidth;

const drag$ = start$.pipe(
  switchMap(start => move$
    .pipe(
      map(move => move - start),
      map(distance => ({distance})),
      takeUntil(end$)
    )
  ),
  share(),
)

const size$ = fromEvent(window, 'resize')
  .pipe(
    startWith(0),
    map(event => $view.clientWidth),
  );

const drop$ = drag$
.pipe(
  switchMap(drag => end$.pipe(
      map(event => drag),
      first(),
    )),
  withLatestFrom(size$, (drag, size) => {
    return {
      ...drag,
      size
    };
  }),
);

const carousel$ = merge(drag$, drop$)
.pipe(
  scan((store, { distance, size }) => {
    const updateStore = {
      from: -(store.index * store.size) + distance,
    };

    if(size === undefined) {
      updateStore.to = updateStore.from;
    } else {
      let tobeIndex = store.index;
      if (Math.abs(distance) >= 30) {
        tobeIndex = distance < 0 ? 
          Math.min(tobeIndex + 1, PANEL_COUNT -1) : Math.max(tobeIndex - 1, 0);
        updateStore.index = tobeIndex;
        updateStore.to = -(tobeIndex * size);
        updateStore.size = size;
      }
    }
    return {
      ...store,
      ...updateStore,
    }
  }, {
    from: 0,
    to: 0,
    index: 0,
    size: 0,
  })
)

size$.subscribe(width => console.log('view의 넓이', width));
drag$.subscribe(dis => console.log('start$와 move$의 차이값', dis));
drop$.subscribe(arr => console.log('drop', arr));
carousel$.subscribe(store => {
  console.log('캐러셀 데이터', store);
  $container.style.transform = `translate3d(${store.to}px, 0, 0)`;
})