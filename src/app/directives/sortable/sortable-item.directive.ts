import {Directive, ElementRef, HostBinding, HostListener, Output, EventEmitter} from '@angular/core';
import {Position} from "../../interfaces/position";

@Directive({
  selector: '[appSortableItem]',
  standalone: true
})
export class SortableItemDirective {
  @HostBinding('class.sortable-item') sortableItem = true;
  @HostBinding('class.dragging') dragging = false;

  @Output() sortChange = new EventEmitter<{ index: number; newIndex: number }>();
  @Output() dragMove = new EventEmitter<DOMRect>();
  @Output() dragStart = new EventEmitter<TouchEvent | MouseEvent>();

  private startPosition: Position = {x: 0, y: 0};
  private clone: HTMLElement | null = null;
  private adjustedRectWithMargins: DOMRect | null = null;
  private touchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly TOUCH_DELAY = 200;
  private touchStarted = false;

  constructor(public element: ElementRef) {
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onDragStart(event: MouseEvent | TouchEvent): void {
    this.startPosition = this.getStartPosition(event);
    this.adjustedRectWithMargins = this.getAdjustedRectWithMargins();
    this.touchStarted = false;

    event.preventDefault();

    if (event instanceof TouchEvent) {
      this.touchTimeout = setTimeout(() => {
        this.touchStarted = true;
        this.dragging = true;
        this.createClone();
        this.dragStart.emit(event);
        this.addDocumentEventListeners();
      }, this.TOUCH_DELAY);
    } else {
      this.dragging = true;
      this.createClone();
      this.dragStart.emit(event);
      this.addDocumentEventListeners();
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.touchStarted) {
      clearTimeout(this.touchTimeout!);
      return;
    }

    this.onDragMove(event);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.touchStarted) {
      clearTimeout(this.touchTimeout!);
      return;
    }

    this.onDragEnd();
  }

  private getStartPosition(event: MouseEvent | TouchEvent): Position {
    if (event instanceof MouseEvent) {
      return {x: event.clientX, y: event.clientY};
    } else {
      return {x: event.touches[0].clientX, y: event.touches[0].clientY};
    }
  }

  private createClone(): void {
    if (!this.clone) {
      const rect = this.adjustedRectWithMargins!;

      this.clone = this.element.nativeElement.cloneNode(true) as HTMLElement;
      Object.assign(this.clone.style, {
        position: 'absolute',
        zIndex: '1000',
        top: '0px',
        left: '0px',
        transform: `translate(${rect.left + window.scrollX}px, ${rect.top + window.scrollY}px)`,
        width: `${rect.width}px`,
      });
      this.clone.classList.add('draggable-item');

      document.body.appendChild(this.clone);
    }
  }

  private getAdjustedRectWithMargins(): DOMRect {
    const computedStyle = window.getComputedStyle(this.element.nativeElement);
    const rect = this.element.nativeElement.getBoundingClientRect();

    return {
      ...rect.toJSON(),
      left: rect.left - parseFloat(computedStyle.marginLeft),
      top: rect.top - parseFloat(computedStyle.marginTop),
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  private addDocumentEventListeners(): void {
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  private removeDocumentEventListeners(): void {
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
  }


  private onDragMove = (event: MouseEvent | TouchEvent): void => {
    if (!this.dragging || !this.clone) return;

    event.preventDefault();

    const currentPosition = this.calculateClonePosition(event);
    console.log(currentPosition)
    this.clone.style.transform = `translate(${currentPosition.left + window.scrollX}px, ${currentPosition.top + window.scrollY}px)`;
    this.dragMove.emit(currentPosition);
  };

  private calculateClonePosition(event: MouseEvent | TouchEvent): DOMRect {
    const rect = this.adjustedRectWithMargins!;

    if (event instanceof MouseEvent) {
      return {
        ...rect,
        left: event.clientX - this.startPosition.x + rect.left,
        right: event.clientX - this.startPosition.x + rect.right,
        top: event.clientY - this.startPosition.y + rect.top,
        bottom: event.clientY - this.startPosition.y + rect.bottom
      };
    } else {
      return {
        ...rect,
        left: event.touches[0].clientX - this.startPosition.x + rect.left,
        right: event.touches[0].clientX - this.startPosition.x + rect.right,
        top: event.touches[0].clientY - this.startPosition.y + rect.top,
        bottom: event.touches[0].clientY - this.startPosition.y + rect.bottom
      };
    }
  }

  private onDragEnd = (): void => {
    this.dragging = false;
    this.touchStarted = false;

    if (this.touchTimeout) clearTimeout(this.touchTimeout);

    if (this.clone) {
      document.body.removeChild(this.clone);
      this.clone = null;
      this.removeDocumentEventListeners();
    }
  };
}
