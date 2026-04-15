# [The General Welfare Project](https://generalwelfareproject.com)

### 🟥🟥🟥 Know your rights 🟥🟥🟥

### ⬜⬜⬜ Find help ⬜⬜⬜

### 🟦🟦🟦 Call now 🟦🟦🟦

## What is this project

I built a landing page to help underserved Americans access free resources and information. It is optimized for low-end devices and available in multiple languages to reach the people who need it most.

## Optimizing for all Americans

- ~44 KB per page. 2.3 KB of JS. Zero frameworks. Zero tracking.
- Off-black background (`#0a0a0a`) for battery life, without OLED pixels having visible smearing or ghosting.
- Slightly off-white text (`#e2e2e2`) to reduce eye strain from maximum contrast while keeping readability high.
- Tested on simulated $150 Android over LTE (70ms RTT, 12 Mbps, 4x CPU slowdown).
- Lighthouse CI enforces:

  | Metric                          | Budget   |
  | ------------------------------- | -------- |
  | First Contentful Paint (FCP)    | 1,800 ms |
  | Speed Index                     | 2,000 ms |
  | Cumulative Layout Shift (CLS)   | 0.1      |
  | Accessibility score             | 90       |
  | Best practices score            | 90       |
  | DOM size                        | 1,500    |

- Playwright enforces per page:

  | Metric         | Budget   |
  | -------------- | -------- |
  | Page load time | 2,000 ms |
  | FCP            | 1,500 ms |
  | Transfer size  | 300 KB   |
  | JS heap memory | 10 MB    |
  | DOM nodes      | 1,500    |
- Available in English, Spanish, Chinese, Vietnamese, and Filipino.

#

![American flag](public/flag_usa.svg)

_We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the **GENERAL WELFARE**, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America._
