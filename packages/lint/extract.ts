import { chromium, Browser } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ExtractedPageData, DomNodeData } from './types.js';

export interface ExtractOptions {
  url?: string;
  html?: string;
  htmlContent?: string;
}

export async function extractPageData(options: ExtractOptions): Promise<ExtractedPageData> {
  const browser: Browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    let targetIdentifier = '';

    if (options.url) {
      targetIdentifier = options.url;
      await page.goto(options.url, { waitUntil: 'domcontentloaded' });
    } else if (options.html) {
      targetIdentifier = options.html;
      const absPath = resolve(process.cwd(), options.html);
      if (!existsSync(absPath)) {
        throw new Error(`HTML file not found: ${absPath}`);
      }
      await page.goto(`file://${absPath}`, { waitUntil: 'domcontentloaded' });
    } else if (options.htmlContent) {
      targetIdentifier = 'inline-html';
      await page.setContent(options.htmlContent, { waitUntil: 'domcontentloaded' });
    } else {
      throw new Error('Must provide either url, html file path, or inline htmlContent');
    }

    // Wait a brief tick for layout rendering
    await page.waitForTimeout(100);

    // Desktop evaluation
    const desktopData = await page.evaluate(() => {
      // Helper to generate a unique readable CSS selector
      function getSelector(el: Element): string {
        if (el.tagName.toLowerCase() === 'body') return 'body';
        if (el.tagName.toLowerCase() === 'html') return 'html';
        if (el.id) return `#${el.id}`;

        const classList = Array.from(el.classList).filter(
          (c) => !c.includes(':') && !c.includes('/') && !c.includes('[')
        );
        if (classList.length > 0) {
          const classStr = classList.slice(0, 2).map((c) => `.${c}`).join('');
          const sameClass = document.querySelectorAll(classStr);
          if (sameClass.length === 1) return classStr;
        }

        const tag = el.tagName.toLowerCase();
        const parent = el.parentElement;
        if (!parent) return tag;

        const siblings = Array.from(parent.children).filter((c) => c.tagName.toLowerCase() === tag);
        if (siblings.length > 1) {
          const index = siblings.indexOf(el) + 1;
          const parentSel = parent.id
            ? `#${parent.id}`
            : parent.classList.length > 0
            ? `.${Array.from(parent.classList)[0]}`
            : parent.tagName.toLowerCase();
          return `${parentSel} > ${tag}:nth-of-type(${index})`;
        }

        const parentSel = parent.id
          ? `#${parent.id}`
          : parent.classList.length > 0
          ? `.${Array.from(parent.classList)[0]}`
          : parent.tagName.toLowerCase();
        return `${parentSel} > ${tag}`;
      }

      // Helper to parse rgb/rgba or hex to find effective background color
      function getEffectiveBgColor(el: Element): string {
        let curr: Element | null = el;
        while (curr) {
          const bg = window.getComputedStyle(curr).backgroundColor;
          if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
            return bg;
          }
          curr = curr.parentElement;
        }
        return 'rgb(255, 255, 255)';
      }

      // Check stylesheets for prefers-reduced-motion
      let hasPrefersReducedMotion = false;
      let styleSheetsCss = '';
      try {
        const styleEls = document.querySelectorAll('style');
        styleEls.forEach((s) => {
          styleSheetsCss += (s.textContent || '') + '\n';
        });
        if (styleSheetsCss.includes('prefers-reduced-motion')) {
          hasPrefersReducedMotion = true;
        }
      } catch {
        // Ignore CSS access limitations
      }

      // Select meaningful nodes to evaluate
      const allElements = Array.from(
        document.querySelectorAll(
          'body, h1, h2, h3, h4, h5, h6, p, button, a, input, select, textarea, img, svg, header, footer, nav, aside, section, article, div, span, table, thead, tbody, tr, th, td, li, ul, ol'
        )
      );

      // Filter to relevant elements: those with text, sizing, images, or interactive
      const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

      const elements: DomNodeData[] = [];

      for (const el of allElements) {
        const cs = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        // Skip completely hidden non-structural elements
        if (cs.display === 'none' || (rect.width === 0 && rect.height === 0 && el.tagName.toLowerCase() === 'div')) {
          continue;
        }

        const innerText = (el as HTMLElement).innerText || '';
        const textContent = el.textContent || '';
        const emojis = textContent.match(emojiRegex) || [];

        const directChildTagNames = Array.from(el.children).map((c) => c.tagName.toLowerCase());

        elements.push({
          tagName: el.tagName.toLowerCase(),
          id: el.id || '',
          className: el.className && typeof el.className === 'string' ? el.className : '',
          selector: getSelector(el),
          innerText,
          textContent,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
          },
          styles: {
            fontFamily: cs.fontFamily || '',
            fontSize: cs.fontSize || '',
            fontWeight: cs.fontWeight || '',
            lineHeight: cs.lineHeight || '',
            color: cs.color || '',
            backgroundColor: cs.backgroundColor || '',
            effectiveBgColor: getEffectiveBgColor(el),
            borderRadius: cs.borderRadius || '',
            boxShadow: cs.boxShadow || '',
            margin: cs.margin || '',
            marginTop: cs.marginTop || '',
            marginRight: cs.marginRight || '',
            marginBottom: cs.marginBottom || '',
            marginLeft: cs.marginLeft || '',
            padding: cs.padding || '',
            paddingTop: cs.paddingTop || '',
            paddingRight: cs.paddingRight || '',
            paddingBottom: cs.paddingBottom || '',
            paddingLeft: cs.paddingLeft || '',
            transition: cs.transition || '',
            transitionDuration: cs.transitionDuration || '',
            transitionProperty: cs.transitionProperty || '',
            animation: cs.animation || '',
            animationName: cs.animationName || '',
            animationDuration: cs.animationDuration || '',
            textAlign: cs.textAlign || '',
            textWrap: (cs as any).textWrap || '',
            overflow: cs.overflow || '',
            overflowX: cs.overflowX || '',
            overflowY: cs.overflowY || '',
            display: cs.display || '',
            position: cs.position || '',
            outline: cs.outline || '',
            outlineWidth: cs.outlineWidth || '',
            outlineStyle: cs.outlineStyle || '',
          },
          attrs: {
            alt: el.getAttribute('alt'),
            ariaLabel: el.getAttribute('aria-label'),
            ariaLabelledby: el.getAttribute('aria-labelledby'),
            title: el.getAttribute('title'),
            role: el.getAttribute('role'),
            type: el.getAttribute('type'),
            href: el.getAttribute('href'),
          },
          metrics: {
            scrollWidth: el.scrollWidth,
            scrollHeight: el.scrollHeight,
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight,
          },
          childrenCount: el.children.length,
          directChildTagNames,
          hasEmoji: emojis.length > 0,
          emojis: Array.from(new Set(emojis)),
        });
      }

      return {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        elements,
        hasPrefersReducedMotion,
        styleSheetsCss,
      };
    });

    // Mobile evaluation at 390px
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);

    const mobileData = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const hasHorizontalOverflow = scrollWidth > 390;

      const clippedElements: string[] = [];
      const textEls = Array.from(document.querySelectorAll('h1, h2, h3, p, button, a, div'));
      for (const el of textEls) {
        const cs = window.getComputedStyle(el);
        if (cs.overflow === 'hidden' || cs.overflowX === 'hidden') {
          if (el.scrollWidth > el.clientWidth + 2) {
            const sel = el.id ? `#${el.id}` : el.className ? `.${Array.from(el.classList)[0]}` : el.tagName.toLowerCase();
            clippedElements.push(sel);
          }
        }
      }

      return {
        scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        viewportWidth: 390,
        viewportHeight: 844,
        hasHorizontalOverflow,
        clippedElements,
      };
    });

    await browser.close();

    return {
      urlOrFile: targetIdentifier,
      desktop: desktopData,
      mobile: mobileData,
    };
  } catch (err) {
    await browser.close();
    throw err;
  }
}
