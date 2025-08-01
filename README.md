# Toilet Learn—Universal Quiz Player

Toilet Learn is a universal quiz player made for learning while on the toilet. It runs entirely offline in a single `index.html` that loads quiz sets from JSON files, can apply extra CSS, and even shows hints via an overlay.

## Folder layout

- `index.html` – main application
- `quiz/` – example quiz JSON files
- `LICENSE` – license information

## Usage

1. Open `index.html` in your browser.
2. Upload a quiz JSON file or paste the JSON text in the provided field and press **Start Quiz**.
3. After a short validation you will see a welcome screen showing the quiz title and description. Click **Begin Quiz** to start.
4. Answer each question. The interface provides immediate feedback and a progress bar.
5. After the final question you will see your score and a short remark. From here you can restart the same quiz or load a different one.

## Quiz JSON format

A quiz file is a JSON object with the following keys:

- `title` (string) – title of the quiz.
- `description` (string) – short description displayed on the welcome screen.
- `cssStyleAdditions` (string, optional) – custom CSS rules that are injected into the page.
- `readingTexts` (array, optional) – reusable text passages referenced by questions.
- `questions` (array) – list of question objects.

Each question object supports these fields:

- `id` – unique identifier.
- `category` – question category shown above the text.
- `type` – `multiple-choice`, `gap-fill` or `reading-comprehension`.
- `questionText` – HTML allowed; use `{blank}` for gap-fill.
- `options` – array of possible answers.
- `correctAnswer` – string that must match exactly one option.
- `readingTextId` – optional reference to an element in `readingTexts`.
- `hints` – optional array of strings mapped to `<span class="hint">` elements inside the question or options.

See the files in the `quiz` folder for minimal working examples.

## ▶️ How to view the site

Open [https://mcdorians.github.io/Toilet-Learn/](https://mcdorians.github.io/Toilet-Learn/) in your browser. The site is served from the `main` branch.

## 🛠 Local development

Run a local server and open [http://localhost:3000/](http://localhost:3000/):

```bash
python3 -m http.server 3000
```

## 🔄 How to regenerate data

When adding or removing quiz JSON files run:

```bash
node scripts/build-index.js
```

This updates `quiz/index.json` which is used by the app to list available quizzes.
