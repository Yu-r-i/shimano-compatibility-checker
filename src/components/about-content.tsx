export function AboutContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        このWebアプリは、シマノ製自転車コンポーネント全13カテゴリ(シフター・ブレーキレバー・フロント/リアディレイラー・
        クランクセット・ボトムブラケット・カセット・フリーホイール・チェーン・ブレーキキャリパー・ディスクローター・
        ハブ・ペダル)間の互換性を確認するためのツールです。
        各カテゴリからパーツを選択すると、速度段数・アクチュエーション方式・フリーハブ規格・スピンドル規格・
        ディスク取付規格などの仕様を照合し、互換性の有無を判定します。2カテゴリ以上選択すると、
        該当するペアの互換ルールのみが自動的に評価されます。
      </p>
      <p>
        判定ルールはShimano公式の「Products Compatibility Information」等の公開資料を参考にしています。
        購入・組み付けの最終判断は、必ずShimano公式の互換性表や技術資料をご確認ください。
      </p>
      <div>
        <h3 className="mb-1 font-medium">今後の予定</h3>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>Di2 / e-Tube世代間の詳細な互換性判定</li>
          <li>フロントトリプル(3x)構成でのFD容量判定の精緻化</li>
          <li>カタログの並び替え・比較機能の強化</li>
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">本アプリはShimano社と提携していません。</p>
    </div>
  );
}
