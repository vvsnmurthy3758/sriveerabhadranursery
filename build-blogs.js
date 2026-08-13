const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "blog");
const OUTPUT_DIR = path.join(__dirname, "generated-blogs");
const BLOG_INDEX_FILE = path.join(__dirname, "blog-index.js");

if (!fs.existsSync(BLOG_DIR)) {
  console.error("ERROR: blog folder not found.");
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function parseFrontMatter(content) {
  const match = content.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);

  if (!match) {
    return {
      data: {},
      body: content.trim()
    };
  }

  const data = {};

  match[1].split("\n").forEach(line => {
    const index = line.indexOf(":");

    if (index === -1) return;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    value = value.replace(/^["']|["']$/g, "");

    data[key] = value;
  });

  return {
    data,
    body: match[2].trim()
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToHtml(markdown) {
  let html = markdown;

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy">'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  // Headings
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Lists
  html = html.replace(/^\- (.*)$/gm, "<li>$1</li>");

  html = html.replace(
    /(<li>.*<\/li>\n?)+/g,
    match => `<ul>${match}</ul>`
  );

  // Paragraphs
  html = html
    .split(/\n\s*\n/)
    .map(block => {
      block = block.trim();

      if (!block) return "";

      if (
        block.startsWith("<h1>") ||
        block.startsWith("<h2>") ||
        block.startsWith("<h3>") ||
        block.startsWith("<ul>") ||
        block.startsWith("<ol>") ||
        block.startsWith("<img>")
      ) {
        return block;
      }

      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* -------------------------------------------------------
   READ ALL MARKDOWN BLOGS
------------------------------------------------------- */

const files = fs
  .readdirSync(BLOG_DIR)
  .filter(file => file.toLowerCase().endsWith(".md"));

const blogs = files.map(file => {
  const content = fs.readFileSync(
    path.join(BLOG_DIR, file),
    "utf8"
  );

  const parsed = parseFrontMatter(content);

  const slug =
    parsed.data.slug ||
    path.basename(file, ".md");

  return {
    file,
    slug,
    ...parsed.data,
    body: parsed.body
  };
});

/* -------------------------------------------------------
   SORT NEWEST FIRST
------------------------------------------------------- */

blogs.sort((a, b) => {
  return new Date(b.date || 0) - new Date(a.date || 0);
});

/* -------------------------------------------------------
   GENERATE INDIVIDUAL BLOG HTML FILES
------------------------------------------------------- */

for (const blog of blogs) {
  const title = blog.title || "Sri Veerabhadra Nursery Blog";

  const description =
    blog.metaDescription ||
    blog.excerpt ||
    "";

  const image =
    blog.featuredImage ||
    "";

  const imageAlt =
    blog.imageAlt ||
    title;

  const date =
    blog.date ||
    "";

  const articleHtml = markdownToHtml(blog.body);

  const html = `<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    ${escapeHtml(title)}
    | Sri Veerabhadra Nursery & Gardens
  </title>

  <meta
    name="description"
    content="${escapeHtml(description)}"
  >

  <!-- Open Graph -->

  <meta property="og:type" content="article">

  <meta
    property="og:title"
    content="${escapeHtml(title)}"
  >

  <meta
    property="og:description"
    content="${escapeHtml(description)}"
  >

  ${
    image
      ? `<meta
    property="og:image"
    content="${escapeHtml(image)}"
  >`
      : ""
  }

  <!-- Twitter -->

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="${escapeHtml(title)}"
  >

  <meta
    name="twitter:description"
    content="${escapeHtml(description)}"
  >

  ${
    image
      ? `<meta
    name="twitter:image"
    content="${escapeHtml(image)}"
  >`
      : ""
  }

  <!-- BlogPosting Schema -->

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${JSON.stringify(title)},
    "description": ${JSON.stringify(description)},
    "datePublished": ${JSON.stringify(date)},
    "author": {
      "@type": "Organization",
      "name": "Sri Veerabhadra Nursery & Gardens"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sri Veerabhadra Nursery & Gardens"
    }${
      image
        ? `,
    "image": ${JSON.stringify(image)}`
        : ""
    }
  }
  </script>

  <link
    rel="icon"
    type="image/png"
    href="../assets/images/logo.png"
  >

  <link
    rel="stylesheet"
    href="../assets/css/style.css"
  >

</head>

<body>

<header class="site-header">

  <div class="container site-header__inner">

    <a
      href="../index.html"
      class="site-brand"
      aria-label="Sri Veerabhadra Nursery & Gardens"
    >

      <span class="site-brand__logo">
        🌿
      </span>

      <span>
        Sri Veerabhadra Nursery & Gardens
      </span>

    </a>

    <div class="site-header__controls">

      <button
        class="nav-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="site-nav-panel"
        aria-label="Toggle navigation menu"
      >
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
      </button>

    </div>

    <nav
      id="site-nav-panel"
      class="site-header__panel site-nav"
      aria-label="Main navigation"
    >

      <ul class="site-nav__list">

        <li>
          <a
            href="../index.html"
            class="site-nav__link"
          >
            Home
          </a>
        </li>

        <li>
          <a
            href="../plants.html"
            class="site-nav__link"
          >
            Plants
          </a>
        </li>

        <li>
          <a
            href="../blog.html"
            class="site-nav__link site-nav__link--active"
          >
            Blog
          </a>
        </li>

        <li>
          <a
            href="../about.html"
            class="site-nav__link"
          >
            About Us
          </a>
        </li>

        <li>
          <a
            href="../contact.html"
            class="site-nav__link"
          >
            Contact
          </a>
        </li>

      </ul>

    </nav>

  </div>

</header>


<main>

  <section
    class="blog-detail-hero"
    aria-labelledby="blog-detail-title"
  >

    <div class="container blog-detail-hero__inner">

      <p class="blog-detail-hero__eyebrow">
        Nursery Insights
      </p>

      <h1
        id="blog-detail-title"
        class="blog-detail-hero__title"
      >
        ${escapeHtml(title)}
      </h1>

      <div
        class="blog-detail-hero__meta"
        aria-label="Article details"
      >

        <span class="blog-detail-hero__meta-item">
          Author: Sri Veerabhadra Nursery
        </span>

        <span class="blog-detail-hero__meta-divider"></span>

        <time
          class="blog-detail-hero__meta-item"
          datetime="${escapeHtml(date)}"
        >
          ${escapeHtml(formatDate(date))}
        </time>

      </div>

    </div>

  </section>


  <section class="section blog-detail-layout">

    <div class="container blog-detail-layout__grid">

      <article class="blog-detail-content">

        ${
          image
            ? `<div
          class="blog-detail-content__image"
          style="
            background-image:url('${escapeHtml(image)}');
            background-size:cover;
            background-position:center;
          "
          role="img"
          aria-label="${escapeHtml(imageAlt)}"
        ></div>`
            : ""
        }

        <div class="blog-detail-content__body">

          <header class="blog-detail-content__header">

            <p class="blog-detail-content__label">
              ${escapeHtml(blog.tag || "Nursery Insights")}
            </p>

            <h2 class="blog-detail-content__title">
              ${escapeHtml(title)}
            </h2>

          </header>

          ${
            blog.excerpt
              ? `<p class="blog-detail-content__intro">
              ${escapeHtml(blog.excerpt)}
            </p>`
              : ""
          }

          <div class="blog-detail-content__copy">

            ${articleHtml}

          </div>

        </div>

      </article>


      <aside class="blog-detail-sidebar">

        <div class="blog-detail-toc">

          <p class="blog-detail-toc__eyebrow">
            Article
          </p>

          <h3 class="blog-detail-toc__title">
            Contents
          </h3>

          <ul
            class="blog-detail-toc__list"
            id="blog-toc"
          >
          </ul>

        </div>

      </aside>

    </div>

  </section>

</main>


<footer class="site-footer">

  <div class="container">

    <p>
      © ${new Date().getFullYear()}
      Sri Veerabhadra Nursery & Gardens
    </p>

  </div>

</footer>


<script src="../assets/js/main.js"></script>

<script>

  /*
   * Automatically create table of contents
   * from article headings.
   */

  const article = document.querySelector(
    ".blog-detail-content__copy"
  );

  const toc = document.getElementById(
    "blog-toc"
  );

  if (article && toc) {

    const headings =
      article.querySelectorAll("h2, h3");

    headings.forEach((heading, index) => {

      if (!heading.id) {

        heading.id =
          heading.textContent
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
          "-" +
          index;

      }

      const li =
        document.createElement("li");

      const link =
        document.createElement("a");

      link.href =
        "#" + heading.id;

      link.textContent =
        heading.textContent;

      li.appendChild(link);

      toc.appendChild(li);

    });

  }

</script>

</body>

</html>`;

  const outputFile = path.join(
    OUTPUT_DIR,
    `${blog.slug}.html`
  );

  fs.writeFileSync(
    outputFile,
    html,
    "utf8"
  );

  console.log(
    `Created: generated-blogs/${blog.slug}.html`
  );
}
/* -------------------------------------------------------
   UPDATE BLOG.HTML DIRECTLY
------------------------------------------------------- */

const BLOG_HTML_FILE = path.join(__dirname, "blog.html");

if (!fs.existsSync(BLOG_HTML_FILE)) {
  console.error("ERROR: blog.html not found.");
  process.exit(1);
}

let blogPage = fs.readFileSync(
  BLOG_HTML_FILE,
  "utf8"
);

const blogCards = blogs.map(blog => {

  const title = escapeHtml(blog.title || "");
  const slug = escapeHtml(blog.slug || "");
  const date = escapeHtml(blog.date || "");
  const tag = escapeHtml(blog.tag || "Nursery Insights");
  const excerpt = escapeHtml(blog.excerpt || "");
  const image = escapeHtml(blog.featuredImage || "");
  const imageAlt = escapeHtml(
    blog.imageAlt || blog.title || ""
  );

  return `
          <article
            class="blog-card blog-card--compact"
            onclick="window.location.href='generated-blogs/${slug}.html'"
            style="cursor:pointer;"
          >

            <div
              class="blog-card__image"
              role="img"
              aria-label="${imageAlt}"
              style="
                background-image:url('${image}');
                background-size:cover;
                background-position:center;
              "
            ></div>

            <div class="blog-card__body">

              <time
                class="blog-card__date"
                datetime="${date}"
              >
                ${formatDate(date)}
              </time>

              <span class="blog-card__tag">
                ${tag}
              </span>

              <h3 class="blog-card__title">
                ${title}
              </h3>

              <p class="blog-card__excerpt">
                ${excerpt}
              </p>

              <a
                href="generated-blogs/${slug}.html"
                class="blog-card__link"
                onclick="event.stopPropagation();"
              >
                Read More
              </a>

            </div>

          </article>`;
}).join("\n");


const blogGridPattern =
  /<div\s+class="blog-grid"\s+id="blog-grid">[\s\S]*?<\/div>\s*<\/div>/;


const replacement = `
        <div class="blog-grid" id="blog-grid">

${blogCards}

        </div>
`;


if (!blogGridPattern.test(blogPage)) {

  console.error(
    "ERROR: Blog grid not found in blog.html."
  );

  process.exit(1);
}


blogPage = blogPage.replace(
  blogGridPattern,
  replacement
);


fs.writeFileSync(
  BLOG_HTML_FILE,
  blogPage,
  "utf8"
);


console.log(
  "Updated: blog.html"
);


/* -------------------------------------------------------
   FINISHED
------------------------------------------------------- */

console.log("");

console.log(
  `Built ${blogs.length} blog(s).`
);

console.log(
  "Blogs sorted newest → oldest."
);

console.log(
  "Blog pages generated successfully."
);


/* -------------------------------------------------------
   FINISHED
------------------------------------------------------- */

console.log("");

console.log(
  `Built ${blogs.length} blog(s).`
);

console.log(
  "Blogs sorted newest → oldest."
);

console.log(
  "Blog pages generated successfully."
);