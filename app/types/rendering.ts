/**
 * 要素のトランスフォーム（変形）情報
 */
export interface Transform {
  /** 拡大率（1.0 = 等倍） */
  scale: number;
  /** キャンバス上の座標位置 */
  position: {
    /** X座標（ピクセル） */
    x: number;
    /** Y座標（ピクセル） */
    y: number;
  };
  /** 回転角度（度） */
  rotate: number;
}

/** CSS `mix-blend-mode` に対応するブレンドモード */
export type BlendMode =
  | 'normal'
  | 'darken'
  | 'multiply'
  | 'color-burn'
  | 'lighten'
  | 'screen'
  | 'plus-lighter'
  | 'color-dodge'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';
