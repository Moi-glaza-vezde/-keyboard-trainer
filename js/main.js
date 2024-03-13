const text = `21 августа 1911 года Джоконду украл итальянский мастер по зеркалам Винченцо Перуджи, который в то время работал в Лувре. Зачем он это сделал до сих пор не понятно. Существует версия, что Перуджи собирался вернуть «Мону Лизу» в Италию, будучи уверенным в том, что во Францию она попала незаконно, не зная или позабыв, что Леонардо да Винчи привез картину во Францию сам. Поиски полиции оказались тщетными. Подозреваемыми в краже  были Пабло Пикассо и Гийом Аполлинер, последнего даже арестовали, потом, правда, отпустили. Знаменитый портрет был найден лишь через два года на его исторической родине. Незадачливый похититель отозвался на объявление в газете и предложил продать «Джоконду» директору галереи Уффици. Скорее всего, он планировал сделать копии и выдавать их за подлинники. Перуджи, арестовали и посадили в тюрьму, впрочем, судьи учли его итальянский патриотизм и дали ему небольшой срок.`;

const inputElement = document.querySelector('#input');
const textExampelElement = document.querySelector('#textExampel');

const lines = getLines(text);
let letterId = 1;
let startMoment = null;
let started = false;

let letterCounter = 0;
let letterCounter_error = 0;

init();
function init() {
   inputElement.focus();

   upDate();

   inputElement.addEventListener('keydown', function (event) {
      const currentLineNumber = getCurrentLineNumber();
      const element = document.querySelector('[data-key="' + event.key + '"]');
      const currentLetter = getCurrentLetter();

      if (event.key !== 'Shift') {
         letterCounter = letterCounter + 1;
      }

      if (!started) {
         started = true;
         startMoment = Date.now();
      }

      if (event.key.startsWith('F') && event.key.length > 1) {
         return;
      }

      if (element) {
         element.classList.add('hint');
      }

      const isKey = event.key === currentLetter.original;
      const isEnter = event.key === 'Enter' && currentLetter.original === '\n';

      if (isKey || isEnter) {
         letterId = letterId + 1;

         upDate();
      } else {
         event.preventDefault();
         if (event.key !== 'Shift') {
            letterCounter_error = letterCounter_error + 1;
            for (const line of lines) {
               for (const letter of line) {
                  if (letter.original === currentLetter.original) {
                     letter.success = false;
                  }
               }
            }
         }

         upDate();
      }
      if (currentLineNumber !== getCurrentLineNumber()) {
         inputElement.value = '';
         event.preventDefault();

         const time = Date.now() - startMoment;
         document.querySelector('#wordsSpeed').textContent = Math.round(
            (60000 * letterCounter) / time
         );
         document.querySelector('#errorProcent').textContent =
            Math.floor((10000 * letterCounter_error) / letterCounter) / 100 + '%';

         started = false;
         letterCounter = 0;
         letterCounter_error = 0;
      }
   });

   inputElement.addEventListener('keyup', function (event) {
      const element = document.querySelector('[data-key="' + event.key + '"]');
      if (element) {
         element.classList.remove('hint');
      }
   });
}
//принемает длинную строку , возвращает массив строк с служебной информацией
function getLines(text) {
   const lines = [];

   let line = [];
   let idCounter = 0;
   for (const originalLetter of text) {
      idCounter = idCounter + 1;
      let letter = originalLetter;

      if (letter === ' ') {
         letter = '°';
      }

      if (letter === '\n') {
         letter = '¶\n';
      }
      line.push({
         id: idCounter,
         label: letter,
         original: originalLetter,
         success: true,
      });

      if (line.length >= 70 || letter === '¶\n') {
         lines.push(line);
         line = [];
      }
   }

   if (line.length > 0) {
      lines.push(line);
   }
   return lines;
}
// принемает строку с служебной информацией и возвращает  html структуру
function lineToHtml(line) {
   const divElement = document.createElement('div');
   divElement.classList.add('line');

   for (const letter of line) {
      const spanElement = document.createElement('span');
      spanElement.textContent = letter.label;

      divElement.append(spanElement);

      if (letterId > letter.id) {
         spanElement.classList.add('done');
      } else if (!letter.success) {
         spanElement.classList.add('hint');
      }
   }

   return divElement;
}
//возвращает актуальный номер строки
function getCurrentLineNumber() {
   for (let i = 0; i < lines.length; i++) {
      for (const letter of lines[i]) {
         if (letter.id === letterId) {
            return i;
         }
      }
   }
}
//обновляет три отоброжаемых актульных строк текст экзампел
function upDate() {
   const currentLineNumber = getCurrentLineNumber();

   textExampelElement.innerHTML = '';

   for (let i = 0; i < lines.length; i++) {
      const html = lineToHtml(lines[i]);
      textExampelElement.append(html);

      if (i < currentLineNumber || i > currentLineNumber + 2) {
         html.classList.add('hidden');
      }
   }
}
// возвращает объект символа ожидаемой программой
function getCurrentLetter() {
   for (const line of lines) {
      for (const letter of line) {
         if (letterId === letter.id) {
            return letter;
         }
      }
   }
}

// <div class="line line-1">
//    <span class="done"> На переднем плане, прямо перед</span>
//    <span class="hint">н</span>ами, расположен был дворик, где стоял
// </div>;
