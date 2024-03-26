import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TimelineItem } from '../../interfaces/timeline.interface';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-events-table',
  templateUrl: './events-table.component.html',
  styleUrl: './events-table.component.scss',
})
export class EventsTableComponent {
  @Input() items$: Observable<TimelineItem[]>; // Input to receive timeline items
  
  displayedColumns: string[] = ['timestamp', 'level', 'message'];
  
  hoveredItem$ = this.timelineService.hoverItem$;

  constructor(private timelineService: TimelineService){}

  onMouseOverTableItem(timestamp?: string){
    this.timelineService.hoverTableRow(timestamp)
  }
}
