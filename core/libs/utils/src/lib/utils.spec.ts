import {readFile} from '@ame/utils';
import {lastValueFrom} from 'rxjs';

describe('utils', () => {
  it('should return parsed file content', async () => {
    const fileContent = 'foo';
    const file = new File([fileContent], 'test.txt');
    const result = await lastValueFrom(readFile(file));
    expect(result).toEqual(fileContent);
  });

  it('should complete the stream after first emit', done => {
    const fileContent = 'foo';
    const file = new File([fileContent], 'test.txt');
    const nextMock = jest.fn();
    const errorMock = jest.fn();

    readFile(file).subscribe({
      next: nextMock,
      error: errorMock,
      complete: () => {
        expect(nextMock).toBeCalledTimes(1);
        expect(nextMock).toBeCalledWith(fileContent);
        expect(errorMock).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should emit error', done => {
    const invalidFile = null;
    const nextMock = jest.fn();
    const completeMock = jest.fn();

    readFile(invalidFile).subscribe({
      next: nextMock,
      error: err => {
        expect(nextMock).not.toHaveBeenCalled();
        expect(completeMock).not.toHaveBeenCalled();
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBeTruthy();
        done();
      },
      complete: () => completeMock,
    });
  });
});
