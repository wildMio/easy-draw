import { Observable } from 'rxjs';

export function whenResize(element: Element): Observable<ResizeObserverEntry> {
  return new Observable<ResizeObserverEntry>((subscriber) => {
    const observer = new ResizeObserver(([entry]) => {
      subscriber.next(entry);
    });

    observer.observe(element);

    return () => observer.disconnect();
  });
}
