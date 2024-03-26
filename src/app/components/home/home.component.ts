import { Component, OnInit } from '@angular/core';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';
import { TimelineItem } from '../../interfaces/timeline.interface';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit{
  timelineItems$: Observable<TimelineItem[]> = this.timelineService.getTimelineItems();
  timelineItemsForTable$: Observable<TimelineItem[]>;

  items: TimelineItem[];

  startTime: Date;
  endTime: Date;


  constructor(private timelineService: TimelineService) { }

  ngOnInit(): void {
    this.timelineItems$ = this.timelineService.getTimelineItems().pipe(
      shareReplay(1), // share the result of the observable and replay it for subsequent subscribers
      map((items: TimelineItem[]) => this.items = items)
    )

    this.timelineItemsForTable$ = this.timelineItems$.pipe(
      switchMap((items: any[]) => {
        const timestamps = items.map(e => new Date(e.timestamp).getTime());
        this.startTime = new Date(Math.min(...timestamps));
        this.endTime = new Date(Math.max(...timestamps));
        return of({ startTime: this.startTime, endTime: this.endTime });
      }),
      switchMap((interval: { startTime: Date; endTime: Date; }) => 
        this.timelineService.getTimelineItemsInRange(interval.startTime, interval.endTime)
      ),
      shareReplay(1)
    );
  }

  onTimelineIntervalChange(interval: { startTime: Date, endTime: Date }) {
    const { startTime, endTime} = interval;
    this.timelineItemsForTable$ = this.timelineService.getTimelineItemsInRange(
      startTime,
      endTime
    ).pipe(
      shareReplay(1) // Share the result of the observable
    );
  }
}
