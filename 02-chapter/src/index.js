import { fromEvent, from, of, Observable, combineLatest, NEVER } from 'rxjs';
import { pluck, map } from 'rxjs/operators';

// const click$ = fromEvent(document, 'click');
// const observer = event => {
//   console.log(event.currentTarget, event.target);
// };

// click$.subscribe(observer);

// const currentTarget$ = fromEvent(document, 'click')
// .pipe(
//   pluck('target')
// ).subscribe(v => {
//   console.log(v);
// })
const arr$ = of(100, 200, 300, 400);


const numbers$ = new Observable(function subscribe(observer)  {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
})


// combineLatest(
//   arr$,
//   numbers$,
// ).subscribe(r => {
//   console.log('combine latest', r);
// })

// of(1, -2, 3).pipe(
//   map(number => number < 0 ? NEVER : number)
// )
// .subscribe({
//   next: v => console.log(v),
//   error: e => console.log(e),
//   complete: () => console.log("완료")
// })

const of$ = of([1, 2, 3])

const from$ = from([1, 2, 3])


combineLatest(
  of$,
  from$,
).subscribe(r => {
  console.log('combine latest', r);
})

combineLatest(
  from$,
  numbers$,
).subscribe(r => {
  console.log('combine latest', r);
})
