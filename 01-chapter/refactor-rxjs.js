
function logic(height, mass, gender) {
  let broca;
  let bmi;
  if (gender === 'male') {
    broca = (height - 100 * 0.9).toFixed(2);
    bmi = (height / 100* height / 100 * 22).toFixed(2);
  } else {
    broca = (height - 100 * 0.9).toFixed(2);
    bmi = (height / 100 * height / 100 * 21).toFixed(2);
  }
  const obesityUsingBroca = ((mass - broca) / broca * 100).toFixed(2);
  const obesityUsingBmi = ((mass - bmi) / bmi * 100).toFixed(2);

  return {
    broca,
    bmi,
    obesityUsingBroca,
    obesityUsingBmi,
  };
}

function makeHtml(user) {
  return `
    <li class='card'>
      <dl>
        <dt>${user.name} <i class="fa fa-${user.gender}"></i></dt>
        <dd>
          <span>키 : </span>
          <span>${user.height}cm</span>
        </dd>
        <dd>
          <span>몸무게 : </span>
          <span>${user.mass}kg</span>
        </dd>
        <dd>
          <span>BROCA 표준체중 : </span>
          <span>${user.broca}kg</span>
        </dd>
        <dd>
          <span>BROCA 비만도 : </span>
          <span>${user.obesityUsingBroca}kg</span>
        </dd>
        <dd>
          <span>BMI체중 : </span>
          <span>${user.bmi}kg</span>
        </dd>
        <dd>
          <span>BMI 비만도 : </span>
          <span>${user.obesityUsingBmi}kg</span>
        </dd>
      </dl>
    </li>
  `;
}


ajax$
.pipe(
  switchMap(data => of(...data.results)),
  filter(user => /male|femae/.test(user.gender)),
  map(user => Object.assign(
    user,
    logic(user.height)
  )),
  reduce((acc, user) => {
    acc.push(makeHtml(user));
    return acc;
  }, []),
  map(htmlArr => htmlArr.join(''))
)
.subscribe(v => {
  document.getElementById("users").innerHTML = v;
});