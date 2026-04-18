# [🇺🇸 The General Welfare Project 🇺🇸](https://generalwelfareproject.com)

Code last updated @ [2026-04-18](https://github.com/GrantKlassy/The-General-Welfare-Project/commits/main)

### 🟥🟥🟥 Call now 🟥🟥🟥

### ⬜⬜⬜ Get help ⬜⬜⬜

### 🟦🟦🟦 Know your rights 🟦🟦🟦

## What is this project

I built a landing page to help underserved Americans access free resources and information. Every button names one of your rights and links straight to the agency or hotline that can actually help today — never to a search engine, never to an explainer. Optimized for low-end devices and available in seven languages to reach the people who need it most.

## Optimizing for all Americans

- ~44 KB per page. 2.3 KB of JS. Zero frameworks. Zero tracking.
- Off-black background (`#0a0a0a`) for battery life and reduced glare.
- Slightly off-white text (`#e2e2e2`) to reduce eye strain from maximum contrast while keeping readability high.
- 17 px root font, WCAG-safe flag colors, and respects `prefers-contrast`, `prefers-reduced-motion`, and system high-contrast mode.
- All copy written at a Grade-6 reading level, consistent across every translation.
- Every resource page ends in a safety footer linking 988 (Suicide & Crisis Lifeline) and 911.
- Tested on simulated $150 Android over LTE (70ms RTT, 12 Mbps, 4x CPU slowdown).
- Lighthouse CI enforces:

  <!-- metrics:lighthouse:start -->

  | Metric                        | Budget   | Actual |
  | ----------------------------- | -------- | ------ |
  | First Contentful Paint (FCP)  | 1,800 ms | 423 ms |
  | Speed Index                   | 2,000 ms | 423 ms |
  | Cumulative Layout Shift (CLS) | 0.1      | 0      |
  | Accessibility score           | 90       | 100    |
  | Best practices score          | 90       | 100    |
  | DOM size                      | 1,500    | 62     |

  <!-- metrics:lighthouse:end -->

- Playwright enforces per page:

  <!-- metrics:playwright:start -->

  | Metric         | Budget   | Actual |
  | -------------- | -------- | ------ |
  | Page load time | 2,000 ms | 46 ms  |
  | FCP            | 1,500 ms | 236 ms |
  | Transfer size  | 300 KB   | 33 KB  |
  | JS heap memory | 10 MB    | 1.1 MB |
  | DOM nodes      | 1,500    | 75     |

  <!-- metrics:playwright:end -->

- Available in English, Spanish, Chinese, Vietnamese, Filipino, Korean, and Japanese.

#

![American flag](public/flag_usa.svg)

_We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the **GENERAL WELFARE**, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America._
