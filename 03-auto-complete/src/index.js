import { fromEvent, from, Subject } from 'rxjs';
import {
  map,
  debounceTime,
  mergeMap,
  filter,
  distinctUntilChanged,
  tap,
  switchMap,
  partition,
  catchError,
  finalize,
  retry,
  multicast,
  publish,
  share,
} from 'rxjs/operators';

// const keyup$ = fromEvent(document.getElementById("search"), "keyup")
//   .pipe(
//     debounceTime(300),
//     map(event => event.target.value),
//     distinctUntilChanged(),  
//     tap(v => console.log('from keyup$', v)),
//   );

const keyup$ = fromEvent(document.getElementById("search"), "keyup")
  .pipe(
    debounceTime(300),
    map(event => event.target.value),
    distinctUntilChanged(),  
    tap(v => console.log('from keyup$', v)),
    share(),
  );

  // multicast(new Subject())
  // -> publish()
  // -> publish(), refCount() (for unsubscribe)
  // -> share()

const $layer = document.getElementById("suggestLayer");
const $loading = document.getElementById('loading');

function showLoading() {
  $loading.style.display = 'block';
}

function hideLoading() {
  $loading.style.display = 'none';
}

let [user$, reset$] = keyup$
  .pipe(
    partition(query => query.trim().length > 0),
  );

function drawLayer(items) {
  $layer.innerHTML = items.map(user => {
    return `<li class="user">
        <img src="${user.avatar_url}" width="50px" height="50px" />
        <p><a href="${user.html_url}" target="_blank">${user.login}</a></p>
      </li>`;
  }).join('')
}

user$ = user$.pipe(
  tap(showLoading),
  switchMap(query => from(fetch(`https://api.github.com/search/users?q=${query}`).then(res => res.json()))),
  tap(hideLoading),
  retry(3),
  finalize(hideLoading),
);

user$.subscribe({
  next: v => drawLayer(v.items),
  error: e => {
    console.error(e);
    alert(e.message);
  }
})

reset$.pipe(
  tap(v => $layer.innerHTML = "")
)
.subscribe();