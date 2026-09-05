export function AboutContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        このWebアプリは、シマノ製自転車コンポーネント(シフター・リアディレイラー・カセット・チェーン)間の互換性を確認するためのツールです。
        各カテゴリからパーツを選択すると、速度段数やアクチュエーション方式などの仕様を照合し、互換性の有無を判定します。
      </p>
      <p>
        判定ルールは一般的なShimanoの仕様・公開情報を参考にしています。購入・組み付けの最終判断は、必ずShimano公式の互換性表や技術資料をご確認ください。
      </p>
      <div>
        <h3 className="mb-1 font-medium">今後の予定</h3>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>ブレーキ系統(リム/ディスク)の互換性判定</li>
          <li>フリーハブボディ規格チェック(HG11, Microspline 等)</li>
          <li>Di2 / e-Tube世代間の互換性判定</li>
          <li>カタログの並び替え・比較機能の強化</li>
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">本アプリはShimano社と提携していません。</p>
    </div>
  );
}
