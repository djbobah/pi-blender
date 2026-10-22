import { AiCoreCanvas } from "@/components/ai-core-canvas";

const capabilities = [
  {
    index: "01",
    tag: "Слой контекста",
    title: "Контекст",
    copy: "Состояние, память и поиск остаются внутри процесса: каждый шаг начинается с нужных фактов, а не с нового промпта.",
  },
  {
    index: "02",
    tag: "Слой действий",
    title: "Инструменты",
    copy: "Типизированные действия над вашими системами. Права, повторы и трассировка — на стороне среды выполнения, а не в промптах.",
  },
  {
    index: "03",
    tag: "Слой контроля",
    title: "Проверки",
    copy: "Детерминированные проверки на каждом шаге: результат уходит пользователю, другому агенту или в прод только после подтверждения.",
  },
];

const workflow = [
  {
    index: "01",
    title: "Подключите модель",
    copy: "Один интерфейс к провайдеру: меняйте модели, не переписывая процесс.",
  },
  {
    index: "02",
    title: "Добавьте контекст и инструменты",
    copy: "Опишите, что агент может читать, вызывать и запоминать за весь запуск.",
  },
  {
    index: "03",
    title: "Выпускайте с проверками",
    copy: "Проверки перед каждым релизом: из ядра выходит только то, что их прошло.",
  },
];

const proofPoints = ["Модель-агностик", "Полный трейс", "Проверки на каждом шаге"];

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a
            href="#top"
            className="font-mono text-[0.78rem] font-semibold uppercase tracking-[0.42em] text-white"
          >
            Nexus
          </a>
          <a
            href="#demo"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-slate-300 transition-colors hover:border-core-cyan/40 hover:text-white"
          >
            Запустить демо
            <ArrowIcon />
          </a>
        </div>
      </header>

      <main>
        <section id="top" className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="grid-field pointer-events-none absolute inset-0"
          />
          <div
            aria-hidden="true"
            className="core-halo pointer-events-none absolute inset-0"
          />

          <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-20 sm:pt-14 lg:pb-24">
            <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-4">
              <div className="max-w-xl">
                <p className="kicker">Агентная платформа</p>

                <h1 className="display mt-5 text-[2.3rem] font-semibold text-white sm:mt-6 sm:text-5xl lg:text-[3.9rem]">
                  Одно ядро.
                  <span className="mt-1 block bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                    Любой <span className="whitespace-nowrap">AI-процесс</span>.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-slate-400 sm:mt-6 sm:text-lg">
                  Контекст, инструменты и проверки вокруг любой модели.
                </p>

                <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center">
                  <a href="#demo" className="btn-primary group">
                    Запустить демо
                    <ArrowIcon />
                  </a>
                  <a href="#capabilities" className="btn-ghost">
                    Смотреть возможности
                  </a>
                </div>

                <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-10">
                  {proofPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-slate-500"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-core-cyan/70 shadow-[0_0_8px_rgba(56,225,245,0.8)]"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                id="demo"
                className="relative h-[300px] w-full scroll-mt-24 sm:h-[430px] lg:h-[min(70vh,600px)]"
              >
                <AiCoreCanvas />
              </div>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="relative scroll-mt-20 border-t border-white/[0.05]"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="kicker">Возможности</p>
                <h2 className="display mt-5 max-w-xl text-3xl font-semibold text-white sm:text-[2.6rem]">
                  Три слоя вокруг одной модели.
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                Каждый слой решает свою задачу и не протекает в соседний.
              </p>
            </div>

            <ul className="mt-14 grid gap-4 md:grid-cols-3">
              {capabilities.map((item) => (
                <li key={item.title} className="panel flex flex-col p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[0.62rem] tracking-[0.28em] text-slate-500">
                      {item.index}
                    </span>
                    <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-core-cyan/60">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold tracking-[-0.01em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {item.copy}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="workflow"
          className="relative scroll-mt-20 border-t border-white/[0.05]"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="kicker">Процесс</p>
                <h2 className="display mt-5 max-w-xl text-3xl font-semibold text-white sm:text-[2.6rem]">
                  Модель внутри. Процесс — снаружи.
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                Одна среда оборачивает модель, поэтому процесс остаётся вашим.
              </p>
            </div>

            <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05] md:grid-cols-3">
              {workflow.map((step) => (
                <li
                  key={step.title}
                  className="group relative bg-ink-950/80 p-6 transition-colors hover:bg-ink-900 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-core-cyan/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  />
                  <span className="font-mono text-[0.62rem] tracking-[0.28em] text-slate-500">
                    {step.index}
                  </span>
                  <h3 className="mt-6 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {step.copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="launch"
          className="relative isolate scroll-mt-20 overflow-hidden border-t border-white/[0.05]"
        >
          <div
            aria-hidden="true"
            className="core-halo pointer-events-none absolute inset-0 opacity-80"
          />
          <div className="relative mx-auto w-full max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
            <p className="kicker justify-center">Готово</p>
            <h2 className="display mt-6 text-3xl font-semibold text-white sm:text-5xl">
              Ядро уже работает.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-400">
              Возьмите один процесс, оставьте свою модель и выпускайте с
              контекстом, инструментами и проверками.
            </p>
            <div className="mt-9 flex justify-center">
              <a href="#demo" className="btn-primary group">
                Запустить демо
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.42em] text-slate-300">
            Nexus
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-slate-500">
            Агентная среда выполнения для продуктовых команд
          </span>
        </div>
      </footer>
    </>
  );
}
