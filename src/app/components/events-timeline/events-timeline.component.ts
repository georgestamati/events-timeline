import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TimelineItem } from '../../interfaces/timeline.interface';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-events-timeline',
  templateUrl: './events-timeline.component.html',
  styleUrls: ['./events-timeline.component.scss'],
})
export class EventsTimelineComponent implements OnInit {
  @ViewChild('container') container: ElementRef;

  @Output() timelineItemHover = new EventEmitter<boolean>(false);
  @Output() timelineIntervalChange: EventEmitter<{ startTime: Date, endTime: Date }> = new EventEmitter();

  private _startTime: Date;
  @Input() 
  set startTime(value: Date){
    if(value){
      this._startTime = value;
      this.auxStartTime = value;
    }
  }
  get startTime(): Date{
    return this._startTime;
  }

  private _endTime: Date;
  @Input() 
  set endTime(value: Date){
    if(value){
      this._endTime = value;
      this.auxEndTime = value;
    }
  }
  get endTime(): Date{
    return this._endTime;
  }

  auxStartTime: Date;
  auxEndTime: Date;

  items: TimelineItem[]; // Private variable to hold the events
  timelineWidth: number;

  hoveredRow$ = this.timelineService.hoveredRow$;

  constructor(private timelineService: TimelineService) {}

  ngOnInit(): void {
    // Fetch timeline items and calculate start and end time
    this.timelineService.getTimelineItems().subscribe((items: TimelineItem[]) => {
      this.items = items;
      this.calculateTimelineBounds();
      this.calculateTimelineWidth();
    });
  }

  onMouseOverTimelineItem(timestamp?: string) {
    this.timelineService.hoverTimelineItem(timestamp);
  }

  calculateItemPosition(item: TimelineItem): string {
    // Calculate the relative position of the item within the timeline container
    const itemTime = new Date(item.timestamp).getTime();
    const relativeTime = itemTime - this.startTime.getTime();
    const relativePosition = (relativeTime * this.timelineWidth).toFixed(2);

    // this.emitTimeRange();

    return `${relativePosition}px`;
  }

  onDragEnd(bar: 'start'|'end', event: any): void {
    const containerWidth = this.container.nativeElement.offsetWidth;
    const duration = this.endTime.getTime() - this.startTime.getTime();
    const distanceX = event.distance.x;

    // let newStartTime: Date = this.startTime;
    // let newEndTime: Date = this.endTime;

    // Calculate proportional change for the dragged bar
    const proportionalChange = (distanceX / containerWidth) * duration;

    
    // Calculate new start time based on the position where the bar was dragged
    let newStartTime: Date = new Date(this.auxStartTime.getTime() + proportionalChange);
    newStartTime = newStartTime < this.getTimelineStartDate() ? this.getTimelineStartDate() : newStartTime;
    this.auxStartTime = newStartTime;

      // Calculate new end time based on the position where the bar was dragged
    let newEndTime: Date = new Date(this.auxEndTime.getTime() + proportionalChange);
    newEndTime = newEndTime > this.getTimelineEndDate() ? this.getTimelineEndDate() : newEndTime;
    this.auxEndTime = newEndTime;

    // Emit both the new start and end times
    this.timelineIntervalChange.emit({ startTime: newStartTime, endTime: newEndTime });
  }

  onMouseWheel(event: WheelEvent): void {
    event.preventDefault();

    // Determine the direction of the scroll (up or down)
    const direction = event.deltaY < 0 ? 1 : -1;

    // Adjust the time range based on the scroll direction
    this.adjustTimeRange(direction);
  }

  adjustTimeRange(direction: number): void {
    // You can adjust the zoom factor as needed
    const zoomFactor = direction > 0 ? 1.2 : 0.8;

    const duration = this.endTime.getTime() - this.startTime.getTime();
    const centerTime = this.startTime.getTime() + duration / 2;

    const newDuration = duration * zoomFactor;
    const newStartTime = new Date(centerTime - newDuration / 2);
    const newEndTime = new Date(centerTime + newDuration / 2);

    this.startTime = newStartTime;
    this.endTime = newEndTime;

    this.emitTimeRange();
  }

  emitTimeRange(): void {
    this.timelineIntervalChange.emit({ startTime: this.startTime, endTime: this.endTime });
  }
  
  private getTimelineStartDate(): Date {
    return this.items.length ? new Date(this.items[0].timestamp) : this.startTime;
  }
  
  private getTimelineEndDate(): Date {
    return this.items.length ? new Date(this.items[this.items.length - 1].timestamp) : this.endTime;
  }
  
  private calculateTimelineBounds(): void {
    const timestamps = this.items.map(item => new Date(item.timestamp).getTime());
    this.startTime = new Date(Math.min(...timestamps));
    this.endTime = new Date(Math.max(...timestamps));
  }

  private calculateTimelineWidth(): void {
    const containerWidth = this.container.nativeElement.offsetWidth;
    const duration = this.endTime.getTime() - this.startTime.getTime();
    this.timelineWidth = containerWidth / duration;
  }
}
