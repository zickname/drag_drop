import {Component, inject, OnInit} from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {Fruit} from '../../interfaces/fruit';
import {FruitsService} from '../../services/fruits.service';
import {SortableListDirective} from "../../directives/sortable/sortable-list.directive";
import {SortableItemDirective} from "../../directives/sortable/sortable-item.directive";
import {SortEvent} from "../../interfaces/sort-event";

@Component({
  selector: 'app-fruit-list',
  standalone: true,
  imports: [
    FontAwesomeModule,
    SortableListDirective,
    SortableItemDirective,
  ],
  templateUrl: './fruit-list.component.html',
  styleUrl: './fruit-list.component.css',
})
export class FruitListComponent implements OnInit {
  private readonly fruitsService = inject(FruitsService);

  fruits: Fruit[] = [];

  ngOnInit(): void {
    this.fruitsService.getFruits().subscribe((data) => {
      this.fruits = data;
    });
  }

  sort(event: SortEvent){
    const current = this.fruits[event.currentIndex];
    const swapWith = this.fruits[event.newIndex]

    this.fruits[event.newIndex] = current;
    this.fruits[event.currentIndex] = swapWith;
  }

}
