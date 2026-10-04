(() => {
  "use strict";

  const galleries = window.PORTFOLIO_GALLERIES || {};

  const book = document.getElementById("book");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const homeBtn = document.getElementById("homeBtn");
  const summaryBtn = document.getElementById("summaryBtn");
  const currentPageEl = document.getElementById("currentPage");
  const totalPagesEl = document.getElementById("totalPages");
  const progressFill = document.getElementById("progressFill");
  const pageLabel = document.getElementById("pageLabel");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");

  let pages = [];
  let currentIndex = 0;
  let summaryIndex = 2;
  let lastFocusedElement = null;

  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragX = 0;
  let dragY = 0;
  let suppressClickUntil = 0;

  const DRAG_THRESHOLD = 48;
  const VERTICAL_CANCEL_THRESHOLD = 30;
  const IMAGES_PER_PAGE = 4;

  function formatName(text) {
    return text
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function createPage(content, extraClass = "", label = "Página") {
    const page = document.createElement("article");
    page.className = `page ${extraClass}`.trim();
    page.dataset.label = label;

    const face = document.createElement("div");
    face.className = "page-face";

    const inner = document.createElement("div");
    inner.className = "page-content";

    inner.append(content);
    face.appendChild(inner);
    page.appendChild(face);

    return page;
  }

  function buildCoverPage() {
    const wrapper = document.createElement("div");
    wrapper.className = "cover-copy";

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Portfólio pessoal";

    const title = document.createElement("h1");
    title.className = "display-title";
    title.textContent = "Portifólio da Nybss";

    const lead = document.createElement("p");
    lead.className = "lead";
    lead.textContent =
      "Projetos, imagens e experiências reunidos em um caderno visual feito para explorar, folhear e ampliar.";

    wrapper.append(eyebrow, title, lead);

    const tags = document.createElement("div");
    tags.className = "cover-tags";

    const names = Object.keys(galleries);
    const tagNames = names.length ? names : ["Projetos", "Processo", "Criação"];

    tagNames.slice(0, 5).forEach(name => {
      const tag = document.createElement("span");
      tag.className = "cover-tag";
      tag.textContent = formatName(name);
      tags.appendChild(tag);
    });

    const mark = document.createElement("p");
    mark.className = "cover-mark";
    mark.textContent = "Arraste para abrir";

    const frame = document.createElement("div");
    frame.className = "cover-frame";
    frame.setAttribute("aria-hidden", "true");

    const orbit = document.createElement("div");
    orbit.className = "cover-orbit";
    orbit.setAttribute("aria-hidden", "true");

    const fragment = document.createDocumentFragment();
    fragment.append(frame, orbit, wrapper, tags, mark);

    return createPage(fragment, "cover-page", "Capa");
  }

  function buildAboutPage() {
    const wrapper = document.createElement("div");

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "01 — apresentação";

    const title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = "Sobre este caderno";

    const layout = document.createElement("div");
    layout.className = "about-layout";

    const text = document.createElement("div");
    text.className = "note-box";
    text.innerHTML = `
      <h3>Um portfólio para folhear.</h3>
      <p>
        Cada coleção funciona como um capítulo. O objetivo é deixar os trabalhos
        em destaque, com uma navegação simples e visual tanto no computador quanto no celular.
      </p>
    `;

    const info = document.createElement("div");
    info.className = "note-box";
    info.innerHTML = `
      <h3>Como navegar</h3>
      <ul class="nav-tips">
        <li>
          <span>1</span>
          <div>
            Use o <strong>Sumário</strong> para entrar direto em uma seção.
          </div>
        </li>

        <li>
          <span>2</span>
          <div>
            Arraste ou deslize para trocar de página.
          </div>
        </li>

        <li>
          <span>3</span>
          <div>
            Toque em qualquer imagem para vê-la em tela cheia.
          </div>
        </li>
      </ul>
    `;

    layout.append(text, info);
    wrapper.append(eyebrow, title, layout);

    return createPage(wrapper, "", "Apresentação");
  }

  function buildSummaryPage(sectionStartIndex) {
    const wrapper = document.createElement("div");

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "02 — navegação";

    const title = document.createElement("h2");
    title.className = "summary-title";
    title.textContent = "Sumário";

    const intro = document.createElement("p");
    intro.className = "summary-intro";
    intro.textContent =
      "Escolha um tópico para ir diretamente à primeira página da coleção.";

    const grid = document.createElement("div");
    grid.className = "summary-grid";

    const names = Object.keys(galleries);

    if (names.length === 0) {
      const empty = document.createElement("div");
      empty.className = "note-box";

      empty.innerHTML = `
        <h3>Nenhuma galeria encontrada.</h3>
        <p>
          Adicione pastas com imagens dentro de
          <strong>imagens/</strong>.
        </p>
      `;

      grid.appendChild(empty);
    }

    names.forEach((name, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "summary-card";

      const head = document.createElement("div");
      head.className = "summary-card-head";

      const number = document.createElement("span");
      number.className = "summary-index";
      number.textContent = String(index + 1).padStart(2, "0");

      const target = sectionStartIndex[name];

      const pageNumber =
        Number.isInteger(target)
          ? target + 1
          : "—";

      const pageMeta = document.createElement("span");
      pageMeta.className = "summary-page";
      pageMeta.textContent = `p. ${pageNumber}`;

      head.append(number, pageMeta);

      const heading = document.createElement("h3");
      heading.textContent = formatName(name);

      const meta = document.createElement("p");
      meta.textContent =
        `${galleries[name].length} ${
          galleries[name].length === 1
            ? "imagem"
            : "imagens"
        }`;

      const arrow = document.createElement("span");
      arrow.className = "summary-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "→";

      button.setAttribute(
        "aria-label",
        `Abrir ${formatName(name)}, página ${pageNumber}`
      );

      button.append(
        head,
        heading,
        meta,
        arrow
      );

      button.addEventListener("click", event => {
        event.stopPropagation();

        if (Number.isInteger(target)) {
          goToPage(target);
        }
      });

      grid.appendChild(button);
    });

    wrapper.append(
      eyebrow,
      title,
      intro,
      grid
    );

    return createPage(
      wrapper,
      "",
      "Sumário"
    );
  }

  function buildGalleryPage(
    name,
    images,
    chunk,
    pageNumber,
    totalGalleryPages
  ) {
    const wrapper = document.createElement("div");

    const header = document.createElement("div");
    header.className = "gallery-header";

    const headingWrap = document.createElement("div");

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "coleção";

    const title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = formatName(name);

    headingWrap.append(
      eyebrow,
      title
    );

    const kicker = document.createElement("p");
    kicker.className = "gallery-kicker";
    kicker.textContent =
      `${pageNumber} / ${totalGalleryPages}`;

    header.append(
      headingWrap,
      kicker
    );

    const grid = document.createElement("div");
    grid.className = "photo-grid";

    chunk.forEach(filename => {
      const card = document.createElement("button");

      card.type = "button";
      card.className = "photo-card";

      const img = document.createElement("img");

      img.src =
        `imagens/${encodeURIComponent(name)}/${encodeURIComponent(filename)}`;

      img.alt =
        `${formatName(name)} — ${filename}`;

      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;

      card.setAttribute(
        "aria-label",
        `Ampliar ${img.alt}`
      );

      card.addEventListener("click", event => {
        event.stopPropagation();

        /*
         * Se o toque terminou em um swipe,
         * não abre o modal por engano.
         */
        if (Date.now() < suppressClickUntil) {
          event.preventDefault();
          return;
        }

        openLightbox(
          img.src,
          img.alt,
          card
        );
      });

      card.appendChild(img);
      grid.appendChild(card);
    });

    const note = document.createElement("p");
    note.className = "page-note";

    note.textContent =
      `${images.length} ${
        images.length === 1
          ? "imagem nesta coleção"
          : "imagens nesta coleção"
      }`;

    wrapper.append(
      header,
      grid,
      note
    );

    const suffix =
      totalGalleryPages > 1
        ? ` — ${pageNumber}/${totalGalleryPages}`
        : "";

    return createPage(
      wrapper,
      "",
      `${formatName(name)}${suffix}`
    );
  }

  function buildContactPage() {
    const wrapper = document.createElement("div");

    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "fim";

    const title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = "Contato";

    const box = document.createElement("div");
    box.className = "note-box";

    box.innerHTML = `
      <h3>Quer falar comigo?/ espero que nao</h3>

      <p>fale comigo here</p>

      <ul class="contact-list">

        <li>
          <a href="mailto:voce@exemplo.com">
            voce@exemplo.com
          </a>
        </li>

        <li>
          <a
            href="#"
            aria-label="Instagram"
          >
            Instagram
          </a>
        </li>

        <li>
          <a
            href="#"
            aria-label="LinkedIn"
          >
            LinkedIn
          </a>
        </li>

      </ul>

      <p>coloquei por colocar mesmo</p>
    `;

    wrapper.append(
      eyebrow,
      title,
      box
    );

    return createPage(
      wrapper,
      "",
      "Contato"
    );
  }

  function openLightbox(
    src,
    alt = "",
    trigger = null
  ) {
    if (!lightbox || !lightboxImage) {
      return;
    }

    lastFocusedElement =
      trigger ||
      document.activeElement;

    lightboxImage.src = src;
    lightboxImage.alt = alt;

    lightbox.classList.add("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "lightbox-open"
    );

    requestAnimationFrame(() => {
      lightboxClose?.focus({
        preventScroll: true
      });
    });
  }

  function closeLightbox() {
    if (
      !lightbox ||
      !lightboxImage ||
      !lightbox.classList.contains("is-open")
    ) {
      return;
    }

    lightbox.classList.remove(
      "is-open"
    );

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "lightbox-open"
    );

    window.setTimeout(() => {
      if (
        !lightbox.classList.contains("is-open")
      ) {
        lightboxImage.src = "";
        lightboxImage.alt = "";
      }
    }, 240);

    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      lastFocusedElement.focus({
        preventScroll: true
      });
    }

    lastFocusedElement = null;
  }

  function buildBook() {
    book.innerHTML = "";

    const constructedPages = [];
    const sectionStartIndex = {};

    constructedPages.push(
      buildCoverPage()
    );

    constructedPages.push(
      buildAboutPage()
    );

    summaryIndex =
      constructedPages.length;

    constructedPages.push(null);

    for (
      const [name, images]
      of Object.entries(galleries)
    ) {
      sectionStartIndex[name] =
        constructedPages.length;

      const totalGalleryPages =
        Math.max(
          1,
          Math.ceil(
            images.length /
            IMAGES_PER_PAGE
          )
        );

      if (images.length === 0) {
        constructedPages.push(
          buildGalleryPage(
            name,
            images,
            [],
            1,
            1
          )
        );

        continue;
      }

      for (
        let start = 0;
        start < images.length;
        start += IMAGES_PER_PAGE
      ) {
        const chunk =
          images.slice(
            start,
            start + IMAGES_PER_PAGE
          );

        const pageNumber =
          Math.floor(
            start / IMAGES_PER_PAGE
          ) + 1;

        constructedPages.push(
          buildGalleryPage(
            name,
            images,
            chunk,
            pageNumber,
            totalGalleryPages
          )
        );
      }
    }

    constructedPages[summaryIndex] =
      buildSummaryPage(
        sectionStartIndex
      );

    constructedPages.push(
      buildContactPage()
    );

    constructedPages.forEach(
      (page, index) => {
        page.dataset.index =
          String(index);

        book.appendChild(page);
      }
    );

    pages =
      Array.from(
        book.querySelectorAll(".page")
      );

    totalPagesEl.textContent =
      String(pages.length);

    currentIndex = 0;

    renderPages();
  }

  function renderPages() {
    pages.forEach(
      (page, index) => {

        page.classList.remove(
          "is-current",
          "is-next",
          "is-prev",
          "is-hidden",
          "is-dragging"
        );

        page.style.setProperty(
          "--rotate",
          "0deg"
        );

        page.style.setProperty(
          "--fold-opacity",
          "0"
        );

        page.style.transform = "";

        if (index === currentIndex) {

          page.classList.add(
            "is-current"
          );

          page.style.zIndex = "20";

        } else if (
          index === currentIndex + 1
        ) {

          page.classList.add(
            "is-next"
          );

          page.style.zIndex = "10";

        } else if (
          index < currentIndex
        ) {

          page.classList.add(
            "is-prev"
          );

          page.style.zIndex = "1";

        } else {

          page.classList.add(
            "is-hidden"
          );

          page.style.zIndex = "0";
        }
      }
    );

    currentPageEl.textContent =
      String(currentIndex + 1);

    const progress =
      pages.length > 1
        ? (
          currentIndex /
          (pages.length - 1)
        ) * 100
        : 100;

    if (progressFill) {
      progressFill.style.width =
        `${progress}%`;
    }

    const currentPage =
      pages[currentIndex];

    if (pageLabel) {
      pageLabel.textContent =
        currentPage?.dataset.label ||
        `Página ${currentIndex + 1}`;
    }

    prevBtn.disabled =
      currentIndex === 0;

    nextBtn.disabled =
      currentIndex ===
      pages.length - 1;

    homeBtn?.setAttribute(
      "aria-current",
      currentIndex === 0
        ? "page"
        : "false"
    );

    summaryBtn?.setAttribute(
      "aria-current",
      currentIndex === summaryIndex
        ? "page"
        : "false"
    );
  }

  function nextPage() {
    if (
      currentIndex >=
      pages.length - 1
    ) {
      return;
    }

    const page =
      pages[currentIndex];

    page.classList.remove(
      "is-dragging"
    );

    page.style.transform = "";

    page.style.setProperty(
      "--rotate",
      "-180deg"
    );

    page.style.setProperty(
      "--fold-opacity",
      ".38"
    );

    window.setTimeout(() => {
      currentIndex += 1;
      renderPages();
    }, 370);
  }

  function previousPage() {
    if (currentIndex <= 0) {
      return;
    }

    currentIndex -= 1;

    renderPages();

    const page =
      pages[currentIndex];

    page.style.setProperty(
      "--rotate",
      "-180deg"
    );

    page.style.setProperty(
      "--fold-opacity",
      "0"
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        page.style.setProperty(
          "--rotate",
          "0deg"
        );
      });
    });
  }

  function goToPage(index) {
    if (
      index < 0 ||
      index >= pages.length ||
      index === currentIndex
    ) {
      return;
    }

    const previousIndex =
      currentIndex;

    currentIndex = index;

    renderPages();

    const page =
      pages[currentIndex];

    if (!page) {
      return;
    }

    if (index < previousIndex) {

      page.style.setProperty(
        "--rotate",
        "-38deg"
      );

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          page.style.setProperty(
            "--rotate",
            "0deg"
          );
        });
      });

    } else {

      const content =
        page.querySelector(
          ".page-content"
        );

      content?.animate(
        [
          {
            opacity: .72,
            transform:
              "translateX(14px)"
          },
          {
            opacity: 1,
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 330,
          easing:
            "cubic-bezier(.2,.75,.2,1)"
        }
      );
    }
  }

  function isInteractiveTarget(target) {
    return Boolean(
      target.closest(
        "button, a, input, textarea, select, [role='button']"
      )
    );
  }

  /*
   * ==============================
   * SWIPE / ARRASTAR
   * ==============================
   */

  function beginDrag(event) {
    if (
      lightbox?.classList.contains(
        "is-open"
      )
    ) {
      return;
    }

    if (
      event.button !== undefined &&
      event.button !== 0
    ) {
      return;
    }

    /*
     * CORREÇÃO IMPORTANTE:
     *
     * No celular, permite iniciar
     * o swipe mesmo em cima de uma
     * foto.
     *
     * Antes a foto era um <button>
     * e acabava bloqueando o gesto.
     */

    const photoCard =
      event.target.closest?.(
        ".photo-card"
      );

    if (
      isInteractiveTarget(
        event.target
      ) &&
      !photoCard
    ) {
      return;
    }

    const currentPage =
      pages[currentIndex];

    if (!currentPage) {
      return;
    }

    dragging = true;

    pointerId =
      event.pointerId;

    startX =
      event.clientX;

    startY =
      event.clientY;

    dragX = 0;
    dragY = 0;

    currentPage.classList.add(
      "is-dragging"
    );

    /*
     * Captura o pointer para que o
     * gesto continue sendo recebido
     * mesmo se o dedo sair um pouco
     * da área do livro.
     */

    if (
      book.setPointerCapture &&
      pointerId !== undefined
    ) {
      try {

        book.setPointerCapture(
          pointerId
        );

      } catch (_) {

        /*
         * Alguns navegadores móveis
         * podem rejeitar a captura.
         * O gesto continua funcionando.
         */

      }
    }
  }

  function moveDrag(event) {
    if (!dragging) {
      return;
    }

    dragX =
      event.clientX - startX;

    dragY =
      event.clientY - startY;

    /*
     * Se o movimento for claramente
     * vertical, abandona o swipe do
     * caderno e deixa o navegador
     * fazer o scroll normalmente.
     */

    if (
      Math.abs(dragY) >
        VERTICAL_CANCEL_THRESHOLD &&
      Math.abs(dragY) >
        Math.abs(dragX)
    ) {
      cancelDrag();
      return;
    }

    const currentPage =
      pages[currentIndex];

    if (!currentPage) {
      return;
    }

    /*
     * Só bloqueia o movimento padrão
     * quando ficou evidente que o
     * usuário está arrastando
     * horizontalmente.
     */

    if (
      Math.abs(dragX) > 8 &&
      event.cancelable
    ) {
      event.preventDefault();
    }

    /*
     * PRÓXIMA PÁGINA
     * Arrastando para esquerda.
     */

    if (
      dragX < 0 &&
      currentIndex <
        pages.length - 1
    ) {

      const width =
        Math.max(
          book.clientWidth,
          1
        );

      const progress =
        Math.min(
          Math.abs(dragX) /
          width,
          1
        );

      const angle =
        -Math.min(
          progress * 168,
          168
        );

      currentPage.style.setProperty(
        "--rotate",
        `${angle}deg`
      );

      currentPage.style.setProperty(
        "--fold-opacity",
        String(progress)
      );
    }

    /*
     * PÁGINA ANTERIOR
     * Arrastando para direita.
     */

    if (
      dragX > 0 &&
      currentIndex > 0
    ) {

      const progress =
        Math.min(
          dragX /
          Math.max(
            book.clientWidth,
            1
          ),
          1
        );

      currentPage.style.transform =
        `translateX(${
          Math.min(
            progress * 16,
            16
          )
        }px)`;
    }
  }

  function cancelDrag() {
    if (!dragging) {
      return;
    }

    const currentPage =
      pages[currentIndex];

    currentPage?.classList.remove(
      "is-dragging"
    );

    if (currentPage) {

      currentPage.style.transform =
        "";

      currentPage.style.setProperty(
        "--rotate",
        "0deg"
      );

      currentPage.style.setProperty(
        "--fold-opacity",
        "0"
      );
    }

    dragging = false;
    pointerId = null;

    startX = 0;
    startY = 0;

    dragX = 0;
    dragY = 0;
  }

  function endDrag() {
    if (!dragging) {
      return;
    }

    /*
     * Confirma que a intenção do gesto
     * foi horizontal.
     */

    const horizontalIntent =
      Math.abs(dragX) >
      Math.abs(dragY) * 1.15;

    /*
     * Em telas pequenas a distância
     * necessária é reduzida.
     */

    const swipeThreshold =
      Math.min(
        DRAG_THRESHOLD,
        Math.max(
          34,
          Math.round(
            Math.max(
              book.clientWidth,
              1
            ) * 0.12
          )
        )
      );

    const shouldGoNext =
      horizontalIntent &&
      dragX <= -swipeThreshold;

    const shouldGoBack =
      horizontalIntent &&
      dragX >= swipeThreshold;

    /*
     * Impede o navegador de interpretar
     * o término do swipe sobre uma foto
     * como um click.
     */

    if (
      shouldGoNext ||
      shouldGoBack
    ) {
      suppressClickUntil =
        Date.now() + 450;
    }

    dragging = false;

    const currentPage =
      pages[currentIndex];

    currentPage?.classList.remove(
      "is-dragging"
    );

    if (currentPage) {
      currentPage.style.transform =
        "";
    }

    if (shouldGoNext) {

      nextPage();

    } else if (shouldGoBack) {

      previousPage();

    } else if (currentPage) {

      currentPage.style.setProperty(
        "--rotate",
        "0deg"
      );

      currentPage.style.setProperty(
        "--fold-opacity",
        "0"
      );
    }

    startX = 0;
    startY = 0;

    dragX = 0;
    dragY = 0;

    pointerId = null;
  }

  /*
   * MUITO IMPORTANTE NO MOBILE:
   *
   * pan-y:
   * o navegador continua podendo
   * fazer scroll vertical.
   *
   * O movimento horizontal fica
   * disponível para o nosso JS.
   */

  book.style.touchAction =
    "pan-y";

  book.style.overscrollBehaviorX =
    "contain";

  /*
   * ==============================
   * BOTÕES
   * ==============================
   */

  nextBtn.addEventListener(
    "click",
    nextPage
  );

  prevBtn.addEventListener(
    "click",
    previousPage
  );

  homeBtn?.addEventListener(
    "click",
    () => goToPage(0)
  );

  summaryBtn?.addEventListener(
    "click",
    () => goToPage(summaryIndex)
  );

  /*
   * ==============================
   * EVENTOS DE SWIPE
   * ==============================
   */

  book.addEventListener(
    "pointerdown",
    beginDrag
  );

  book.addEventListener(
    "pointermove",
    moveDrag,
    {
      passive: false
    }
  );

  book.addEventListener(
    "pointerup",
    endDrag
  );

  book.addEventListener(
    "pointercancel",
    cancelDrag
  );

  book.addEventListener(
    "pointerleave",
    event => {

      if (
        dragging &&
        event.pointerType === "mouse"
      ) {
        endDrag();
      }
    }
  );

  /*
   * ==============================
   * MODAL / LIGHTBOX
   * ==============================
   */

  lightboxClose?.addEventListener(
    "click",
    event => {

      event.stopPropagation();
      closeLightbox();

    }
  );

  lightbox?.addEventListener(
    "click",
    event => {

      if (
        event.target === lightbox ||
        event.target.classList.contains(
          "lightbox-stage"
        )
      ) {
        closeLightbox();
      }
    }
  );

  /*
   * ==============================
   * TECLADO
   * ==============================
   */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        lightbox?.classList.contains(
          "is-open"
        )
      ) {
        closeLightbox();
        return;
      }

      if (
        lightbox?.classList.contains(
          "is-open"
        )
      ) {

        /*
         * Mantém o foco preso
         * no botão de fechar.
         */

        if (event.key === "Tab") {

          event.preventDefault();

          lightboxClose?.focus();
        }

        return;
      }

      if (
        event.key ===
          "ArrowRight" ||
        event.key ===
          "PageDown"
      ) {
        nextPage();
      }

      if (
        event.key ===
          "ArrowLeft" ||
        event.key ===
          "PageUp"
      ) {
        previousPage();
      }

      if (
        event.key === "Home"
      ) {
        goToPage(0);
      }
    }
  );

  /*
   * MONTA O CADERNO
   */

  buildBook();

})();
