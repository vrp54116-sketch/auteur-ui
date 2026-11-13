import { Contract } from '../schema/contract.js';

export interface LintFailure {
  r: string;      // Rule identifier, e.g. "slop/purple-blue-gradient"
  sel: string;    // Selector or DOM element locator, e.g. ".hero"
  val: string;    // Observed value, e.g. "linear-gradient(135deg, ...)"
  want: string;   // Expected or desired condition, e.g. "solid neutral or look palette token"
  fix: string;    // Actionable recommendation, e.g. "replace gradient hero with solid background"
}

export interface LintWarning {
  r: string;
  sel: string;
  val: string;
  want: string;
  fix: string;
}

export interface LintResult {
  score: number;
  pass: boolean;
  fail: LintFailure[];
  warnings: LintWarning[];
}

export interface DomNodeData {
  tagName: string;
  id: string;
  className: string;
  selector: string;
  innerText: string;
  textContent: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  styles: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    color: string;
    backgroundColor: string;
    effectiveBgColor: string;
    borderRadius: string;
    boxShadow: string;
    margin: string;
    marginTop: string;
    marginRight: string;
    marginBottom: string;
    marginLeft: string;
    padding: string;
    paddingTop: string;
    paddingRight: string;
    paddingBottom: string;
    paddingLeft: string;
    transition: string;
    transitionDuration: string;
    transitionProperty: string;
    animation: string;
    animationName: string;
    animationDuration: string;
    textAlign: string;
    textWrap?: string;
    overflow: string;
    overflowX: string;
    overflowY: string;
    display: string;
    position: string;
    outline: string;
    outlineWidth: string;
    outlineStyle: string;
  };
  attrs: {
    alt?: string | null;
    ariaLabel?: string | null;
    ariaLabelledby?: string | null;
    title?: string | null;
    role?: string | null;
    type?: string | null;
    href?: string | null;
  };
  metrics: {
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
  };
  childrenCount: number;
  directChildTagNames: string[];
  hasEmoji: boolean;
  emojis: string[];
}

export interface ExtractedPageData {
  urlOrFile: string;
  desktop: {
    scrollWidth: number;
    scrollHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    elements: DomNodeData[];
    hasPrefersReducedMotion: boolean;
    styleSheetsCss: string;
  };
  mobile: {
    scrollWidth: number;
    scrollHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    hasHorizontalOverflow: boolean;
    clippedElements: string[];
  };
}

export interface RuleViolation {
  ruleId: string;
  category: 'type' | 'color' | 'space' | 'rhythm' | 'hierarchy' | 'motion' | 'a11y' | 'responsive' | 'slop';
  isHardFail?: boolean;
  deduction: number;
  isWarning?: boolean;
  sel: string;
  val: string;
  want: string;
  fix: string;
}

export interface RuleContext {
  data: ExtractedPageData;
  contract?: Contract | null;
}

export interface Rule {
  id: string;
  category: 'type' | 'color' | 'space' | 'rhythm' | 'hierarchy' | 'motion' | 'a11y' | 'responsive' | 'slop';
  name: string;
  description: string;
  check(ctx: RuleContext): RuleViolation[];
}

