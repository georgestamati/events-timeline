import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TimelineItem } from "../interfaces/timeline.interface";
import { BehaviorSubject, Observable, filter, map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TimelineService{
    url = '../../assets/db.json';
    private timelineItems$: Observable<TimelineItem[]>;

    private hoverItem = new BehaviorSubject<string>('');
    hoverItem$ = this.hoverItem.asObservable();

    private hoveredRow = new BehaviorSubject<string>('');
    hoveredRow$ = this.hoveredRow.asObservable();

    constructor(private httpClient: HttpClient){}

    getTimelineItems(): Observable<TimelineItem[]> {
        if (!this.timelineItems$) {
            this.timelineItems$ = this.httpClient.get<TimelineItem[]>(this.url);
          }
          return this.timelineItems$;
        }
    getTimelineItemsInRange(startTime: Date, endTime: Date): Observable<TimelineItem[]> {
			console.log(startTime, endTime)
        return this.httpClient.get<TimelineItem[]>(this.url).pipe(
          map((items: TimelineItem[]) => items.filter(item => {
            const itemTime = new Date(item.timestamp).getTime();
            return itemTime >= startTime.getTime() && itemTime <= endTime.getTime();
          }))
        );
    }

    hoverTimelineItem(timestamp: string){
        this.hoverItem.next(timestamp);
    }

    hoverTableRow(timestamp: string){
        this.hoveredRow.next(timestamp);
    }
  }