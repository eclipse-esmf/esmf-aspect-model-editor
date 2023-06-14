import {Observable} from 'rxjs';

/**
 * Reads file via FileReader
 *
 * @param file specific file retrieved from a FileList object
 * @returns Observable with file content represented as a string
 * (completes automatically after receiving file's content)
 */
export const readFile = (file: File): Observable<string> => {
  return new Observable(observer => {
    const reader = new FileReader();
    try {
      reader.onload = () => {
        observer.next(reader.result.toString());
        observer.complete();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error(`An error occurred while attempting to read "${file.name}" file:`, error);
      reader.onerror = () => observer.error(error);
    }
  });
};
