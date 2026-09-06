import type { Part, PartCategory } from "@/types";

/**
 * 診断ビューにおける「排他・条件付き」カテゴリペアの自己修復ロジック。
 *
 * 判定の正はworker側のPAIR_RULES(worker/domain/compatibility.ts)にあり、
 * ここでは単純なフィールド参照のみで「UI上あり得ない組み合わせ」を検出し、
 * 選び直しの手間なくURLを自己修復する(URL共有・直接編集経路のケア)。
 *
 * - カセット ⇔ フリーホイール: 同一ホイールに共存しない(カセット優先)
 * - 統合型シフター(brake_typeを持つSTI等) ⇔ ブレーキレバー: 併用不可(シフター優先)
 * - 1x(シングルリング)クランクセット ⇔ フロントディレイラー: 併用不可(クランク優先)
 * - ディスク台座を持たないハブ/ホイール ⇔ ディスクローター: 装着不可(ハブ優先)
 */
export interface ConflictResolution {
  changed: boolean;
  messages: string[];
}

export function resolveExclusiveConflicts(
  params: URLSearchParams,
  findPart: (category: PartCategory, id: string) => Part | undefined
): ConflictResolution {
  const messages: string[] = [];
  let changed = false;

  const get = (category: PartCategory): Part | undefined => {
    const id = params.get(category);
    return id ? findPart(category, id) : undefined;
  };

  if (params.has("cassette") && params.has("freewheel")) {
    const cassette = get("cassette");
    const freewheel = get("freewheel");
    params.delete("freewheel");
    changed = true;
    if (cassette && freewheel) {
      messages.push(`${cassette.id}(カセット)と${freewheel.id}(フリーホイール)は併用できないため、フリーホイールの選択を解除しました`);
    }
  }

  const shifter = get("shifter");
  if (shifter?.brake_type && params.has("brake_lever")) {
    const brakeLever = get("brake_lever");
    params.delete("brake_lever");
    changed = true;
    if (brakeLever) {
      messages.push(`${shifter.id}はブレーキレバー一体型のため、${brakeLever.id}の選択を解除しました`);
    }
  }

  const crankset = get("crankset");
  if ((crankset?.crank_teeth?.length ?? 0) === 1 && params.has("front_derailleur")) {
    const fd = get("front_derailleur");
    params.delete("front_derailleur");
    changed = true;
    if (crankset && fd) {
      messages.push(`${crankset.id}は1x構成のため、${fd.id}の選択を解除しました`);
    }
  }

  const hub = get("hub");
  if (hub && !hub.disc_mount && params.has("disc_rotor")) {
    const rotor = get("disc_rotor");
    params.delete("disc_rotor");
    changed = true;
    if (rotor) {
      messages.push(`${hub.id}はディスク台座を持たないため、${rotor.id}の選択を解除しました`);
    }
  }

  return { changed, messages };
}

/**
 * 現在の選択状態から、非活性化すべきスロットとその理由を導出する。
 * (実際の判定ではなく、UI上の事前防止のためのヒント表示用)
 */
export function computeDisabledSlots(
  selection: Partial<Record<PartCategory, Part | null>>
): Partial<Record<PartCategory, string>> {
  const disabled: Partial<Record<PartCategory, string>> = {};

  const shifter = selection.shifter;
  if (shifter?.brake_type) {
    disabled.brake_lever = `${shifter.id}はブレーキレバー一体型のため選択不要です`;
  }

  if (selection.cassette) {
    disabled.freewheel = `${selection.cassette.id}(カセット)選択中のため選択できません`;
  }
  if (selection.freewheel) {
    disabled.cassette = `${selection.freewheel.id}(フリーホイール)選択中のため選択できません`;
  }

  const crankset = selection.crankset;
  if ((crankset?.crank_teeth?.length ?? 0) === 1) {
    disabled.front_derailleur = `${crankset!.id}は1x構成のためフロントディレイラーは不要です`;
  }

  const hub = selection.hub;
  if (hub && !hub.disc_mount) {
    disabled.disc_rotor = `${hub.id}はディスク台座を持たないため選択できません`;
  }

  return disabled;
}
