/**
 * VariableSuggest — drop-in <input> / <textarea> with {{ autocomplete.
 *
 * Design matches the flow-editor-properties warm panel (Manrope, #fff8f2 bg,
 * #d7b9a9 borders, #d35a2f brand accent).  The popup is rendered via a portal
 * so it is never clipped by the scrollable panel, and it flips upward when
 * there is not enough space below the field.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ComponentPropsWithoutRef,
  Dispatch,
  SetStateAction,
} from 'react';
import { createPortal } from 'react-dom';
import { Braces, Code2, KeyRound } from 'lucide-react';
import { useFlowVariables, FlowVariable } from '../../hooks/useFlowVariables';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getVariableContext(
  value: string,
  cursorPos: number,
): { triggerStart: number; query: string } | null {
  const before = value.slice(0, cursorPos);
  const lastOpen = before.lastIndexOf('{{');
  if (lastOpen === -1) return null;
  const fragment = before.slice(lastOpen + 2);
  if (fragment.includes('}}') || fragment.includes('\n')) return null;
  return { triggerStart: lastOpen, query: fragment };
}

function buildInsertion(
  value: string,
  triggerStart: number,
  cursorPos: number,
  varName: string,
): { newValue: string; newCursor: number } {
  const before = value.slice(0, triggerStart);
  const after = value.slice(cursorPos);
  const ins = `{{${varName}}}`;
  return { newValue: before + ins + after, newCursor: before.length + ins.length };
}

const ITEM_H = 30;   // px per suggestion row
const HEADER_H = 33; // px for the "Variables" header
const MAX_VISIBLE = 7;

function computePopupStyle(el: HTMLElement, itemCount: number): React.CSSProperties {
  const rect = el.getBoundingClientRect();
  const popupH = HEADER_H + Math.min(itemCount, MAX_VISIBLE) * ITEM_H;
  const popupW = Math.max(rect.width, 260);

  const spaceBelow = window.innerHeight - rect.bottom - 6;
  const spaceAbove = rect.top - 6;

  // Flip upward if not enough space below AND more space above
  const top =
    spaceBelow >= popupH || spaceBelow >= spaceAbove
      ? rect.bottom + 4
      : Math.max(6, rect.top - popupH - 4);

  // Don't overflow the right edge
  const left = Math.min(rect.left, window.innerWidth - popupW - 6);

  return { position: 'fixed', top, left, width: popupW, zIndex: 9999 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Popup — styled to match the warm flow-editor-properties design system
// ─────────────────────────────────────────────────────────────────────────────

interface PopupProps {
  suggestions: FlowVariable[];
  activeIndex: number;
  style: React.CSSProperties;
  onSelect: (name: string) => void;
  setActiveIndex: Dispatch<SetStateAction<number>>;
}

// Use explicit hex values so the popup looks right regardless of where the
// portal renders in the DOM (outside .flow-editor-properties overrides).
const POPUP_BG = '#fff8f2';
const POPUP_BORDER = '#d7b9a9';
const POPUP_HEADER_BG = '#fff0e4';
const POPUP_ITEM_HOVER_BG = '#fde9da';
const POPUP_ITEM_ACTIVE_BG = '#fbd5bf';
const POPUP_DIVIDER = '#f0d9cc';
const TEXT_MAIN = '#2b1f25';
const TEXT_MUTED = '#9a7c6d';

const SOURCE_COLOR: Record<FlowVariable['source'], string> = {
  system: '#0f766e', // teal — matches --accent
  flow: '#d35a2f',   // terracotta — matches --brand-strong
  vault: '#92510c',  // amber-brown
};

const SOURCE_ICON: Record<FlowVariable['source'], React.ReactNode> = {
  system: <Code2 style={{ width: 12, height: 12, color: SOURCE_COLOR.system, flexShrink: 0 }} />,
  flow: <Braces style={{ width: 12, height: 12, color: SOURCE_COLOR.flow, flexShrink: 0 }} />,
  vault: <KeyRound style={{ width: 12, height: 12, color: SOURCE_COLOR.vault, flexShrink: 0 }} />,
};

const SOURCE_LABEL: Record<FlowVariable['source'], string> = {
  system: 'system',
  flow: 'flow',
  vault: 'vault',
};

function SuggestionsPopup({ suggestions, activeIndex, style, onSelect, setActiveIndex }: PopupProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div
      style={{
        ...style,
        background: POPUP_BG,
        border: `1px solid ${POPUP_BORDER}`,
        borderRadius: 12,
        boxShadow: '0 8px 28px -6px rgba(89,45,22,0.18), 0 2px 8px rgba(89,45,22,0.08)',
        overflow: 'hidden',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px 5px',
          borderBottom: `1px solid ${POPUP_BORDER}`,
          background: POPUP_HEADER_BG,
        }}
      >
        <Braces style={{ width: 11, height: 11, color: TEXT_MUTED }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: TEXT_MUTED,
          }}
        >
          Variables
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 9,
            color: TEXT_MUTED,
            opacity: 0.7,
          }}
        >
          ↑↓ navigate · ↵ insert
        </span>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', maxHeight: MAX_VISIBLE * ITEM_H }}>
        {suggestions.map((v, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={v.name}
              ref={isActive ? activeRef : undefined}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(v.name);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 10px',
                cursor: 'pointer',
                border: 'none',
                borderBottom: `1px solid ${POPUP_DIVIDER}`,
                background: isActive ? POPUP_ITEM_ACTIVE_BG : 'transparent',
                textAlign: 'left',
                transition: 'background 80ms',
                height: ITEM_H,
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              onMouseOver={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background = POPUP_ITEM_HOVER_BG;
              }}
            >
              {SOURCE_ICON[v.source]}
              <span
                style={{
                  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                  fontSize: 11.5,
                  color: TEXT_MAIN,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.name}
              </span>
              {v.hint && isActive && (
                <span
                  style={{
                    fontSize: 9.5,
                    color: TEXT_MUTED,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 120,
                  }}
                >
                  {v.hint}
                </span>
              )}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: SOURCE_COLOR[v.source],
                  flexShrink: 0,
                  opacity: 0.85,
                }}
              >
                {SOURCE_LABEL[v.source]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared completion hook
// ─────────────────────────────────────────────────────────────────────────────

function useVariableCompletion<T extends HTMLInputElement | HTMLTextAreaElement>(
  elRef: React.RefObject<T>,
  onChange:
    | ((e: React.ChangeEvent<HTMLInputElement>) => void)
    | ((e: React.ChangeEvent<HTMLTextAreaElement>) => void)
    | undefined,
) {
  const variables = useFlowVariables();
  const [context, setContext] = useState<{ triggerStart: number; query: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const filtered = useMemo(
    () =>
      context
        ? variables.filter((v) => v.name.toLowerCase().includes(context.query.toLowerCase()))
        : [],
    [context, variables],
  );

  const updatePopupStyle = useCallback(() => {
    if (elRef.current && context) {
      setPopupStyle(computePopupStyle(elRef.current, filtered.length));
    }
  }, [elRef, context, filtered.length]);

  const close = useCallback(() => {
    setContext(null);
    setActiveIndex(0);
  }, []);

  const updateContext = useCallback((value: string, cursorPos: number) => {
    const ctx = getVariableContext(value, cursorPos);
    setContext((prev) => {
      if (ctx?.query !== prev?.query) setActiveIndex(0);
      return ctx;
    });
  }, []);

  const applyVariable = useCallback(
    (varName: string) => {
      if (!context || !elRef.current) return;
      const val = elRef.current.value;
      const cursorPos = elRef.current.selectionStart ?? val.length;
      const { newValue, newCursor } = buildInsertion(val, context.triggerStart, cursorPos, varName);

      const fakeEvent = {
        target: { value: newValue } as EventTarget & T,
        currentTarget: { value: newValue } as EventTarget & T,
      } as React.ChangeEvent<T>;
      (onChange as ((e: React.ChangeEvent<T>) => void) | undefined)?.(fakeEvent);

      close();
      const el = elRef.current;
      requestAnimationFrame(() => {
        el.setSelectionRange(newCursor, newCursor);
        el.focus();
      });
    },
    [context, elRef, onChange, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>): boolean => {
      if (!context || filtered.length === 0) return false;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return true;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyVariable(filtered[activeIndex].name);
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return true;
      }
      return false;
    },
    [context, filtered, activeIndex, applyVariable, close],
  );

  // Recompute popup position synchronously before the browser paints so the
  // popup never appears at the wrong position on first open.
  useLayoutEffect(() => {
    updatePopupStyle();
  }, [updatePopupStyle]);

  // Keep popup position in sync while it is open (handles panel scroll)
  useEffect(() => {
    if (!context) return;
    const onScroll = () => updatePopupStyle();
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [context, updatePopupStyle]);

  // Close on outside click
  useEffect(() => {
    if (!context) return;
    const handler = (e: MouseEvent) => {
      if (!elRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [context, elRef, close]);

  return { context, filtered, activeIndex, setActiveIndex, popupStyle, updateContext, applyVariable, handleKeyDown };
}

// ─────────────────────────────────────────────────────────────────────────────
// VariableInput
// ─────────────────────────────────────────────────────────────────────────────

export type VariableInputProps = ComponentPropsWithoutRef<'input'>;

export const VariableInput = forwardRef<HTMLInputElement, VariableInputProps>(
  ({ onChange, onKeyDown, ...props }, externalRef) => {
    const elRef = useRef<HTMLInputElement>(null);

    const { context, filtered, activeIndex, setActiveIndex, popupStyle, updateContext, applyVariable, handleKeyDown } =
      useVariableCompletion<HTMLInputElement>(elRef, onChange);

    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        (elRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        if (typeof externalRef === 'function') externalRef(el);
        else if (externalRef)
          (externalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      },
      [externalRef],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateContext(e.target.value, e.target.selectionStart ?? e.target.value.length);
      onChange?.(e);
    };

    const handleKeyDownWrapped = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!handleKeyDown(e)) onKeyDown?.(e);
    };

    return (
      <>
        <input ref={setRef} onChange={handleChange} onKeyDown={handleKeyDownWrapped} {...props} />
        {context && filtered.length > 0 &&
          createPortal(
            <SuggestionsPopup
              suggestions={filtered}
              activeIndex={activeIndex}
              style={popupStyle}
              onSelect={applyVariable}
              setActiveIndex={setActiveIndex}
            />,
            document.body,
          )}
      </>
    );
  },
);

VariableInput.displayName = 'VariableInput';

// ─────────────────────────────────────────────────────────────────────────────
// VariableTextarea
// ─────────────────────────────────────────────────────────────────────────────

export type VariableTextareaProps = ComponentPropsWithoutRef<'textarea'>;

export const VariableTextarea = forwardRef<HTMLTextAreaElement, VariableTextareaProps>(
  ({ onChange, onKeyDown, ...props }, externalRef) => {
    const elRef = useRef<HTMLTextAreaElement>(null);

    const { context, filtered, activeIndex, setActiveIndex, popupStyle, updateContext, applyVariable, handleKeyDown } =
      useVariableCompletion<HTMLTextAreaElement>(elRef, onChange);

    const setRef = useCallback(
      (el: HTMLTextAreaElement | null) => {
        (elRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
        if (typeof externalRef === 'function') externalRef(el);
        else if (externalRef)
          (externalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      },
      [externalRef],
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateContext(e.target.value, e.target.selectionStart ?? e.target.value.length);
      onChange?.(e);
    };

    const handleKeyDownWrapped = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!handleKeyDown(e)) onKeyDown?.(e);
    };

    return (
      <>
        <textarea ref={setRef} onChange={handleChange} onKeyDown={handleKeyDownWrapped} {...props} />
        {context && filtered.length > 0 &&
          createPortal(
            <SuggestionsPopup
              suggestions={filtered}
              activeIndex={activeIndex}
              style={popupStyle}
              onSelect={applyVariable}
              setActiveIndex={setActiveIndex}
            />,
            document.body,
          )}
      </>
    );
  },
);

VariableTextarea.displayName = 'VariableTextarea';

