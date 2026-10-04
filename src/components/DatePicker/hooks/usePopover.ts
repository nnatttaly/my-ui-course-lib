import { useEffectEvent, useLayoutEffect, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { POPUP_GAP, VIEWPORT_PADDING } from "../DatePicker.constants";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]';

/**
 * Ставит попап (position: fixed) под якорем, а если снизу не хватает места
 * и сверху его больше — над ним. По горизонтали не даёт вылезти за окно.
 */
function positionPopup(anchor: HTMLElement, popup: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = popup;

  const spaceBelow = window.innerHeight - anchorRect.bottom - POPUP_GAP;
  const spaceAbove = anchorRect.top - POPUP_GAP;
  const placeAbove = spaceBelow < height && spaceAbove > spaceBelow;

  const top = placeAbove
    ? anchorRect.top - POPUP_GAP - height
    : anchorRect.bottom + POPUP_GAP;
  const maxLeft = window.innerWidth - width - VIEWPORT_PADDING;
  const left = Math.max(VIEWPORT_PADDING, Math.min(anchorRect.left, maxLeft));

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
  popup.dataset.placement = placeAbove ? "top" : "bottom";
}

interface UsePopoverOptions {
  /** Всё, что считается «внутри» помимо самого попапа (поле, кнопки). */
  containerRef: RefObject<HTMLElement | null>;
  /** Элемент, к которому привязана позиция попапа. */
  anchorRef: RefObject<HTMLElement | null>;
  popupRef: RefObject<HTMLElement | null>;
  disabled: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Состояние и поведение выпадающего попапа, который рендерится в портал:
 * позиционирование (с обновлением при прокрутке и ресайзе), закрытие
 * по клику снаружи и удержание фокуса внутри по Tab.
 */
export function usePopover({
  containerRef,
  anchorRef,
  popupRef,
  disabled,
  onOpenChange,
}: UsePopoverOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const isVisible = isOpen && !disabled;

  const setOpen = (next: boolean) => {
    if (next === isOpen) return;
    setIsOpen(next);
    onOpenChange?.(next);
  };

  const contains = (node: Node | null) =>
    !!node &&
    (!!containerRef.current?.contains(node) ||
      !!popupRef.current?.contains(node));

  const handleOutsidePointerDown = useEffectEvent((event: PointerEvent) => {
    if (!contains(event.target as Node)) setOpen(false);
  });

  // useLayoutEffect — чтобы попап встал на место до первой отрисовки.
  useLayoutEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      if (anchorRef.current && popupRef.current) {
        positionPopup(anchorRef.current, popupRef.current);
      }
    };
    const handlePointerDown = (event: PointerEvent) =>
      handleOutsidePointerDown(event);

    updatePosition();
    // capture: ловим прокрутку любого родителя, а не только окна.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isVisible, anchorRef, popupRef]);

  // Попап живёт в конце body, поэтому Tab из него ушёл бы за пределы страницы.
  // Держим фокус внутри, как в модальном диалоге; закрывается он по Escape.
  const handlePopupKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return {
    isOpen: isVisible,
    open: () => setOpen(true),
    close: () => setOpen(false),
    contains,
    handlePopupKeyDown,
  };
}
