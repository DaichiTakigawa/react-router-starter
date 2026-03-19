import { formatDate } from './date';

describe('formatDate', () => {
  it('一般的な日付を正しくフォーマットする', () => {
    expect(formatDate({ date: new Date(2024, 0, 15) })).toBe('Jan 15, 2024');
  });

  it('月の最初の日をフォーマットする', () => {
    expect(formatDate({ date: new Date(2024, 5, 1) })).toBe('Jun 1, 2024');
  });

  it('月の最終日をフォーマットする', () => {
    expect(formatDate({ date: new Date(2024, 1, 29) })).toBe('Feb 29, 2024');
  });

  it('元旦をフォーマットする', () => {
    expect(formatDate({ date: new Date(2025, 0, 1) })).toBe('Jan 1, 2025');
  });

  it('大晦日をフォーマットする', () => {
    expect(formatDate({ date: new Date(2024, 11, 31) })).toBe('Dec 31, 2024');
  });
});
