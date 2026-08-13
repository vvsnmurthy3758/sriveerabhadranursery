# 🌿 Sri Veerabhadra Nursery & Gardens — Visual Project Overview

> **Phase 1 Static Website** · HTML + CSS + JavaScript · No CMS / No Backend

---

## 🗺️ Site Map & Navigation Flow

```mermaid
graph TD
    subgraph Navigation["🧭 Global Navigation Bar"]
        NAV["Home | Plants | Blog | About Us | Contact | Request Quote"]
    end

    subgraph Pages["📄 Website Pages"]
        HOME["🏠 index.html<br/>Homepage"]
        PLANTS["🌱 plants.html<br/>Plant Catalog"]
        BLOG["📝 blog.html<br/>Blog Listing"]
        ABOUT["ℹ️ about.html<br/>About Us"]
        CONTACT["📞 contact.html<br/>Contact"]
        PLANT_D["🔍 plant-detail.html<br/>Plant Detail (Dynamic)"]
        BLOG_D["📖 blog-detail.html<br/>Blog Post (Dynamic)"]
    end

    NAV --> HOME

    NAV --> PLANTS

    NAV --> BLOG

    NAV --> ABOUT
    
    NAV --> CONTACT

    PLANTS -->|"?slug=mango"| PLANT_D
    BLOG -->|"?id=best-avenue-trees"| BLOG_D

    HOME -->|"Explore Plants CTA"| PLANTS
    HOME -->|"Request Quote CTA"| CONTACT
    HOME -->|"Blog Card Click"| BLOG_D
    HOME -->|"Category Card Click"| PLANTS

    style HOME fill:#2d6a4f,color:#fff,stroke:#1b4332,stroke-width:2px
    style PLANTS fill:#40916c,color:#fff,stroke:#2d6a4f
    style BLOG fill:#52b788,color:#fff,stroke:#40916c
    style ABOUT fill:#74c69d,color:#1b4332,stroke:#52b788
    style CONTACT fill:#95d5b2,color:#1b4332,stroke:#74c69d
    style PLANT_D fill:#40916c,color:#fff,stroke:#2d6a4f,stroke-dasharray:5
    style BLOG_D fill:#52b788,color:#fff,stroke:#40916c,stroke-dasharray:5
    style NAV fill:#1b4332,color:#d8f3dc,stroke:#081c15,stroke-width:2px
```

---

## 🏠 Homepage Section Breakdown

```mermaid
graph TB
    subgraph HOMEPAGE["index.html — Full Page Layout"]
        direction TB
        H1["🔝 HEADER<br/>Logo + Nav + Request Quote CTA"]
        H2["🎬 HERO SECTION<br/>'From Nursery to Nature'<br/>Explore Plants · Request Quote"]
        H3["📂 PLANT CATEGORIES<br/>8 Category Cards Grid<br/>Avenue · Fruit · Flowering · Shrubs<br/>Climbers · Medicinal · Aquatic · Palms"]
        H4["⭐ WHY CHOOSE US<br/>6 Stats/Features Grid<br/>30+ Yrs · 15 Acres · 500+ Varieties<br/>100K+ Supplied · Pan India · Healthy"]
        H5["🌿 PLANT COLLECTION<br/>10 Featured Plant Cards<br/>Mango · Millingtonia · Sapota · etc."]
        H6["📝 GROWING INSIGHTS<br/>3 Blog Preview Cards<br/>Avenue Trees · Flowering Trees · Mango Guide"]
        H7["📞 CONTACT CTA<br/>'Looking for Quality Plants?'<br/>Call Now · WhatsApp Us"]
        H8["📋 FOOTER<br/>About · Quick Links · Categories · Contact Info"]

        H1 --> H2 --> H3 --> H4 --> H5 --> H6 --> H7 --> H8
    end

    style H1 fill:#081c15,color:#d8f3dc
    style H2 fill:#1b4332,color:#d8f3dc
    style H3 fill:#2d6a4f,color:#d8f3dc
    style H4 fill:#40916c,color:#fff
    style H5 fill:#52b788,color:#1b4332
    style H6 fill:#74c69d,color:#1b4332
    style H7 fill:#95d5b2,color:#1b4332
    style H8 fill:#081c15,color:#d8f3dc
```

---

## 📁 File & Folder Structure

```mermaid
graph LR
    subgraph ROOT["📂 SriVeerabhadraNursery/"]
        direction TB

        subgraph HTML_Pages["📄 HTML Pages"]
            F1["index.html"]
            F2["plants.html"]
            F3["plant-detail.html"]
            F4["blog.html"]
            F5["blog-detail.html"]
            F6["about.html"]
            F7["contact.html"]
        end

        subgraph Data_Files["📊 JSON Data"]
            F8["plants.json<br/>24 KB — Plant catalog"]
            F9["blogs.json<br/>43 KB — Blog articles"]
        end

        subgraph Assets["📂 assets/"]
            direction TB
            subgraph CSS_Dir["css/"]
                F10["style.css<br/>70 KB — All styles"]
            end
            subgraph JS_Dir["js/"]
                F11["main.js<br/>17 KB — All logic"]
            end
            subgraph Images_Dir["images/"]
                F12["logo.png · hero.webp"]
                F13["📂 plants/ — Plant photos"]
                F14["📂 blog/ — Blog images"]
                F15["📂 categories/ — Category images"]
                F16["📂 team/ — Team photos"]
                F17["📂 general/ — Misc images"]
            end
        end

        subgraph SEO_Files["🔍 SEO"]
            F18["robots.txt"]
            F19["sitemap.xml"]
        end

        subgraph Docs["📋 Documentation"]
            F20["PROJECT_REQUIREMENTS.md"]
        end
    end

    style HTML_Pages fill:#d8f3dc,color:#1b4332,stroke:#52b788,stroke-width:2px
    style Data_Files fill:#fef9ef,color:#7c4a03,stroke:#f4a261,stroke-width:2px
    style Assets fill:#e8f4f8,color:#184e77,stroke:#168aad,stroke-width:2px
    style SEO_Files fill:#f0efff,color:#3d348b,stroke:#7678ed,stroke-width:2px
    style Docs fill:#fff0f3,color:#800f2f,stroke:#c9184a
```

---

## 🔄 Data Flow & Dynamic Content

```mermaid
flowchart LR
    subgraph JSON_Data["📊 Data Sources"]
        PJ["plants.json<br/>Plant catalog data"]
        BJ["blogs.json<br/>Blog articles data"]
    end

    subgraph JS_Engine["⚙️ main.js"]
        FETCH["fetch() API"]
        RENDER["DOM Rendering"]
        FILTER["Category Filter"]
        SEARCH["Search / Sort"]
    end

    subgraph Dynamic_Pages["🖥️ Dynamic Pages"]
        P1["plants.html<br/>Grid + Filters"]
        P2["plant-detail.html<br/>?slug= parameter"]
        P3["blog.html<br/>Blog grid"]
        P4["blog-detail.html<br/>?id= parameter"]
    end

    PJ --> FETCH
    BJ --> FETCH
    FETCH --> RENDER
    RENDER --> FILTER
    FILTER --> P1
    RENDER --> P2
    RENDER --> P3
    RENDER --> P4
    SEARCH --> P1
    SEARCH --> P3

    style JSON_Data fill:#fef9ef,color:#7c4a03,stroke:#f4a261,stroke-width:2px
    style JS_Engine fill:#e8f4f8,color:#184e77,stroke:#168aad,stroke-width:2px
    style Dynamic_Pages fill:#d8f3dc,color:#1b4332,stroke:#52b788,stroke-width:2px
```

---

## 📐 Page Architecture Summary

| Page | File | Key Sections | Data Source |
|------|------|-------------|-------------|
| **Home** | [index.html](file:///d:/SriVeerabhadraNursery/index.html) | Hero → Categories (8) → Why Us (6) → Plants (10) → Blog (3) → CTA → Footer | Static HTML |
| **Plants** | [plants.html](file:///d:/SriVeerabhadraNursery/plants.html) | Hero → Filters → Plant Grid → Footer | [plants.json](file:///d:/SriVeerabhadraNursery/plants.json) |
| **Plant Detail** | [plant-detail.html](file:///d:/SriVeerabhadraNursery/plant-detail.html) | Hero → Plant Info → Related → Footer | [plants.json](file:///d:/SriVeerabhadraNursery/plants.json) via `?slug=` |
| **Blog** | [blog.html](file:///d:/SriVeerabhadraNursery/blog.html) | Hero → Blog Grid → Footer | [blogs.json](file:///d:/SriVeerabhadraNursery/blogs.json) |
| **Blog Detail** | [blog-detail.html](file:///d:/SriVeerabhadraNursery/blog-detail.html) | Hero → Article → Related → Footer | [blogs.json](file:///d:/SriVeerabhadraNursery/blogs.json) via `?id=` |
| **About** | [about.html](file:///d:/SriVeerabhadraNursery/about.html) | Hero → Story → Team → Mission → Footer | Static HTML |
| **Contact** | [contact.html](file:///d:/SriVeerabhadraNursery/contact.html) | Hero → Contact Form → Info → Map → Footer | Static HTML |

---

## 🎨 Technology & Design Stack

```mermaid
mindmap
    root["🌿 Sri Veerabhadra<br/>Nursery Website"]
        Frontend
            HTML5 Semantic
            Vanilla CSS — 70KB
            Vanilla JS — 17KB
            No frameworks
        Design
            Green Theme
            Mobile First
            Responsive
            Modern & Professional
            Nature Inspired
        SEO
            Meta tags
            Open Graph
            Twitter Cards
            JSON-LD Schema
            sitemap.xml
            robots.txt
        Data
            plants.json — 500+ plants
            blogs.json — Articles
            Fetch API — Dynamic loading
            URL params — Detail pages
        Assets
            WebP Images
            SVG Icons — inline
            PNG Logo
            Category Images
```

---

## 🔗 Internal Linking Map

```mermaid
graph TD
    HOME["🏠 Home"] ==>|"Explore Plants"| PLANTS["🌱 Plants"]
    HOME ==>|"Request Quote"| CONTACT["📞 Contact"]
    HOME -->|"Category Cards"| PLANTS
    HOME -->|"Blog Cards"| BLOG_D["📖 Blog Detail"]
    HOME -->|"Plant Cards"| PLANTS

    PLANTS -->|"Plant Card Click"| PLANT_D["🔍 Plant Detail"]
    PLANT_D -->|"Related Plants"| PLANT_D
    PLANT_D -->|"Request Quote"| CONTACT

    BLOG["📝 Blog"] -->|"Blog Card Click"| BLOG_D
    BLOG_D -->|"Related Articles"| BLOG_D

    ABOUT["ℹ️ About"] -->|"Contact CTA"| CONTACT

    ALL["All Pages"] -.->|"Header Nav"| HOME
    ALL -.->|"Header Nav"| PLANTS
    ALL -.->|"Header Nav"| BLOG
    ALL -.->|"Header Nav"| ABOUT
    ALL -.->|"Header Nav"| CONTACT
    ALL -.->|"Footer Links"| HOME
    ALL -.->|"Footer Links"| PLANTS
    ALL -.->|"Footer Links"| BLOG
    ALL -.->|"Footer Links"| ABOUT
    ALL -.->|"Footer Links"| CONTACT

    style HOME fill:#2d6a4f,color:#fff,stroke-width:3px
    style CONTACT fill:#e76f51,color:#fff,stroke-width:2px
    style ALL fill:#f4f4f4,color:#666,stroke-dasharray:3
```

---

> **Summary**: A clean 7-page static nursery website with JSON-driven dynamic content for plants and blogs, full SEO setup, and a nature-inspired green theme. All styling in one CSS file, all logic in one JS file.
