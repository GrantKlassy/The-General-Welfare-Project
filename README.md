# [The General Welfare Project](https://generalwelfareproject.com)

### 🟥🟥🟥 Know your rights 🟥🟥🟥

### ⬜⬜⬜ Find help ⬜⬜⬜

### 🟦🟦🟦 Call now 🟦🟦🟦

## What is this project

I built a landing page to help underserved Americans access free resources and information. It is optimized for low-end devices and available in multiple languages to reach the people who need it most.

## Optimizing for all Americans

This site is built for the people who need it most — Americans on budget phones, slow connections, and prepaid data plans. Every design decision is tested against real-world constraints.

### Device simulation

Lighthouse CI runs against every page with throttled network and CPU to simulate a $150 Android phone on LTE:

| Setting      | Value          |
| ------------ | -------------- |
| Network RTT  | 70ms           |
| Throughput   | 12 Mbps        |
| CPU slowdown | 4x             |
| Screen       | 360×800 mobile |

### Page weight

The entire production page payload — HTML, CSS, JS, and fonts — is **~44KB**:

| Resource | Size               |
| -------- | ------------------ |
| HTML     | ~6 KB              |
| CSS      | ~11 KB             |
| JS       | **2.3 KB**         |
| Fonts    | ~25 KB (2 weights) |

One CSS file. One JS file (Astro's prefetch module). Zero frameworks. Zero tracking scripts.

### Performance budgets

Playwright tests enforce per-page budgets on every build:

| Metric                 | Budget    |
| ---------------------- | --------- |
| Page load time         | < 2,000ms |
| First Contentful Paint | < 1,500ms |
| Transfer size          | < 300 KB  |
| JS heap memory         | < 10 MB   |
| DOM nodes              | < 1,500   |

Lighthouse CI enforces additional budgets with simulated LTE throttling:

| Metric                  | Budget           |
| ----------------------- | ---------------- |
| Accessibility score     | ≥ 90             |
| Best practices score    | ≥ 90             |
| First Contentful Paint  | < 1,800ms        |
| Speed Index             | < 2,000ms        |
| Cumulative Layout Shift | < 0.1            |
| DOM size                | < 1,500 elements |

### Languages

Available in English, Spanish, Chinese, Vietnamese, and Filipino.

#

![American flag](public/flag_usa.svg)

_We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the **GENERAL WELFARE**, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America._
