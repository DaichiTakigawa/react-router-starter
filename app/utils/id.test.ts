import { generateUUID } from './id';

describe('generateUUID', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('crypto.randomUUID が利用可能な場合', () => {
    it('crypto.randomUUID() の返り値をそのまま返す', () => {
      const expected = '550e8400-e29b-41d4-a716-446655440000';
      vi.spyOn(crypto, 'randomUUID').mockReturnValue(
        expected as `${string}-${string}-${string}-${string}-${string}`,
      );
      expect(generateUUID()).toBe(expected);
    });
  });

  describe('crypto.randomUUID が利用不可の場合', () => {
    let originalRandomUUID: typeof crypto.randomUUID;

    beforeEach(() => {
      originalRandomUUID = crypto.randomUUID;
      Object.defineProperty(crypto, 'randomUUID', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(crypto, 'randomUUID', {
        value: originalRandomUUID,
        writable: true,
        configurable: true,
      });
    });

    it('getRandomValues から正しいUUID文字列を生成する', () => {
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
        const bytes = new Uint8Array([
          0x55, 0x0e, 0x84, 0x00, 0xe2, 0x9b, 0x71, 0xd4, 0xe7, 0x16, 0x44,
          0x66, 0x55, 0x44, 0x00, 0x00,
        ]);
        (array as Uint8Array).set(bytes);
        return array;
      });

      // bytes[6]: (0x71 & 0x0f) | 0x40 = 0x41
      // bytes[8]: (0xe7 & 0x3f) | 0x80 = 0xa7
      expect(generateUUID()).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('バージョンビット(4)が正しく設定される', () => {
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
        const bytes = new Uint8Array(16);
        bytes[6] = 0xff; // (0xff & 0x0f) | 0x40 = 0x4f → 上位ニブルが強制的に4になる
        (array as Uint8Array).set(bytes);
        return array;
      });

      expect(generateUUID()).toBe('00000000-0000-4f00-8000-000000000000');
    });

    it('バリアントビット(8/9/a/b)が正しく設定される', () => {
      vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
        const bytes = new Uint8Array(16);
        bytes[8] = 0xff; // (0xff & 0x3f) | 0x80 = 0xbf → 上位2ビットが10に強制される
        (array as Uint8Array).set(bytes);
        return array;
      });

      expect(generateUUID()).toBe('00000000-0000-4000-bf00-000000000000');
    });
  });
});
