import {Directive, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter} from '@angular/core';
import {SortableItemDirective} from './sortable-item.directive';
import {SortEvent} from "../../interfaces/sort-event";

@Directive({
  selector: '[appSortableList]',
  standalone: true
})
export class SortableListDirective implements AfterContentInit {
  @ContentChildren(SortableItemDirective) items!: QueryList<SortableItemDirective>;
  @Output() sort = new EventEmitter<SortEvent>();

  private itemElements: HTMLElement[] = [];
  private sortedItemsRect: DOMRect[] = [];

  ngAfterContentInit(): void {
    this.items.forEach(item => {
      item.dragMove.subscribe(() => {
        this.measureClientRects();
      });
      item.dragMove.subscribe(event => this.onSortChange(item, event));
    });
    this.itemElements = this.items.map(item => item.element.nativeElement);
  }

  private measureClientRects(): void {
    this.sortedItemsRect = this.items.map(item => item.element.nativeElement.getBoundingClientRect());
  }

  private onSortChange(item: SortableItemDirective, event: DOMRect): void {
    const currentIndex = this.items.toArray().indexOf(item);
    const currentRect = this.sortedItemsRect[currentIndex];

    this.sortedItemsRect
      .slice()
      .sort((rectA, rectB) => this.distance(rectA, currentRect) - this.distance(rectB, currentRect))
      .filter(rect => rect !== currentRect)
      .some(rect => this.handleSortChange(rect, currentRect, event, currentIndex));
  }

  private handleSortChange(rect: DOMRect, currentRect: DOMRect, event: DOMRect, currentIndex: number): boolean {
    const isHorizontal = rect.top === currentRect.top;
    const isBefore = isHorizontal ?
      rect.left < currentRect.left :
      rect.top < currentRect.top;
    const moveBack = isBefore && (isHorizontal ?
      event.left + 20 < this.hCenter(rect) :
      event.top < this.vCenter(rect));
    const moveForward = !isBefore && (isHorizontal ?
      event.right > this.hCenter(rect) :
      event.bottom > this.vCenter(rect));

    if (moveBack || moveForward) {
      this.sort.emit({currentIndex: currentIndex, newIndex: this.sortedItemsRect.indexOf(rect)});
      return true;
    }
    return false;
  }

  private distance(rectA: DOMRect, rectB: DOMRect): number {
    return Math.sqrt(
      Math.pow(rectB.top - rectA.top, 2) +
      Math.pow(rectB.left - rectA.left, 2)
    );
  }

  private hCenter(rect: DOMRect): number {
    return rect.left + rect.width / 2;
  }

  private vCenter(rect: DOMRect): number {
    return rect.top + rect.height / 2;
  }
}
